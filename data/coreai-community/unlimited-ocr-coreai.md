# coreai-community/Unlimited-OCR-CoreAI

## Resumen

Unlimited-OCR-CoreAI es un port del modelo `baidu/Unlimited-OCR` (un MoE de 3B de parametros totales con 0,5B activos bajo licencia MIT) empaquetado para el runtime Core AI de Apple, sucesor de Core ML en iOS 27 y macOS 27. El modelo resuelve OCR de documentos en dispositivo: recibe una imagen de una pagina y devuelve markdown estructurado, con tablas convertidas a HTML, formulas en LaTeX, orden de lectura y cajas de maquetacion delimitadas por el token especial `<|det|>`. Lo publica la comunidad `coreai-community` como espejo del repositorio canonico `mlboydaisuke/Unlimited-OCR-CoreAI` dentro del Core AI Model Zoo.

El interes tecnico esta en que el decoder se ejecuta sobre el runtime estandar `coreai.runtime` sin parches de motor, alimentado directamente con `inputs_embeds`, lo que lo convierte en un port de exportacion pura en lugar del camino VLM con buffers de entrada estaticos. Los pesos se distribuyen en bundles `.aimodel`: un encoder visual DeepEncoder (cascada SAM-ViT mas CLIP-ViT) en fp16 de 762 MB que produce 100 tokens visuales, y un decoder DeepseekV2 con atencion R-SWA y arquitectura MoE en sym8 de 3,2 GB. El repo completo ocupa 4,5 GB.

La relevancia practica es doble: por un lado, OCR privado (facturas, contratos, formularios) que nunca sale del dispositivo; por otro, ingestion estructurada lista para RAG, ya que la salida preserva tablas y formulas en lugar de aplanarlas a texto plano. El modelo origen lidera OmniDocBench v1.6 con 93,92, y el port se declara byte-fiel a la referencia fp32 (0 flips en el decoder, coseno 1.000000 en el encoder visual).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: encoder DeepEncoder (SAM-ViT + CLIP-ViT) + decoder DeepseekV2 con atencion R-SWA y MoE |
| Parametros totales | 3B (modelo base) |
| Parametros activos | 0,5B (A0.5B, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decoder en sym8; encoder visual en fp16; embeddings en fp16 |
| Idiomas soportados | Ingles, japones, multilingue |
| Licencia | MIT |
| Formato de pesos | Bundles `.aimodel` (Core AI) + tablas `.f16` / `.i32` para embeddings y constantes |

## Arquitectura y entrenamiento

El modelo es un VLM de dos etapas. El encoder visual combina una cascada SAM-ViT y CLIP-ViT (DeepEncoder) que comprime la imagen de entrada en 100 tokens visuales de dimension 1280. Estos tokens se reorganizan en una rejilla 10x10 con un token `image_newline` por fila y un `view_seperator`, resultando en 111 posiciones que se insertan en la secuencia de embeddings del prompt (115 tokens de prefijo en total). El decoder es un transformer tipo DeepseekV2 con atencion R-SWA (sliding window attention) y capas MoE, con 3B de parametros totales y 0,5B activos por token.

El port a Core AI mantiene una forma estatica de todas las tensores mediante un grafo de decodificacion de forma fija (escritura de KV data-driven y mascara R-SWA en buffer fijo), lo que evita recompilaciones por crecimiento de cache y mantiene la latencia plana. La entrada se preprocesa a 640x640 píxeles (padding cuadrado, normalizacion mean=std=0.5). La decodificacion es greedy con `no_repeat_ngram=35`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- OCR de documentos de una sola pagina con salida en markdown estructurado.
- Conversion de tablas a HTML (`<table><tr><td>...`).
- Conversion de formulas matematicas a LaTeX.
- Deteccion de orden de lectura y cajas de maquetacion con el token `<|det|>`.
- Procesamiento de imagenes en dispositivo mediante el runtime Core AI (GPU o Neural Engine).
- Soporte multilingue con enfasis en ingles y japones.
- Modo de prompt fijo `document parsing` (maquetacion mas extraccion estructurada).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision general, audio ni modo thinking.

## Casos de uso

- Digitalizacion privada de facturas y recibos: el modelo procesa la imagen de cada documento y extrae tablas e importes como markdown estructurado sin enviar datos a ningun servidor, adecuado para entornos con requisitos de confidencialidad.
- Ingestion de contratos para RAG: al preservar la estructura (tablas HTML, orden de lectura), el markdown resultante se puede trocear y vectorizar sin perder la relacion entre clausulas y tablas.
- Extraccion de formularios y reportes: la salida con cajas `<|det|>` permite mapear cada campo a su posicion en la pagina, util para validacion visual o auditoria.
- Procesamiento de papers academicos: convierte formulas a LaTeX y mantiene el orden de lectura, lo que facilita reconstruir articulos cientificos en formato texto enriquecido.
- Aplicaciones macOS nativas de lectura de documentos: integracion via CoreAIKit (`KitDocReader`, `read(imageAt:)`), con descarga del modelo en la primera ejecucion y carga desde cache local.
- Automatizacion por lotes en Mac: el CLI `readdoc-cli` permite procesar paginas de PDF (previamente convertidas a imagenes) de forma headless en flujos de agentes o pipelines.
- Digitalizacion multilingue ingles-japones: adecuado para empresas con documentacion en ambos idiomas que necesiten extraccion estructurada on-device.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| OmniDocBench v1.6 (modelo base baidu/Unlimited-OCR) | 93,92 |
| Fidelidad del decoder respecto a referencia fp32 | 0 flips en los pasos muestreados |
| Coseno del encoder visual respecto a referencia | 1.000000 |
| Latencia de decodificacion (M4 Max) | ~12,7 ms/token (~79 tok/s) |
| Qwen3-8B 4-bit en M4 Max GPU (referencia del runtime) | 94 tok/s; MLX 90 tok/s en el mismo protocolo |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/unificada estimada: el modelo completo ocupa 4,5 GB en disco; el decoder sym8 son 3,2 GB, el encoder fp16 762 MB y los embeddings 316 MB. En Apple Silicon se ejecuta sobre memoria unificada.
- GPU recomendadas: Apple Silicon (M4 Max verificado en los benchmarks del autor); el runtime Core AI soporta GPU y Neural Engine.
- Cabe en GPU consumer: si, en equipos Apple Silicon con al menos ~6 GB de memoria disponible; no hay datos para GPU NVIDIA/AMD en la informacion disponible.
- Opciones de despliegue: runtime Core AI (`coreai.runtime`), CoreAIKit via Swift Package Manager, la app `ReadDoc` (GUI + CLI `readdoc-cli`) y la app de referencia `CoreAIOCR` del Core AI Model Zoo.
- Latencia y throughput: ~12,7 ms/token y ~79 tok/s en M4 Max con el grafo de forma estatica; medir en Release, ya que Debug es aproximadamente 3x mas lento en trabajo de host por token.
- No se documentan requisitos para vLLM, llama.cpp, Ollama ni TGI, al estar atado al runtime de Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR-CoreAI | 3B totales / 0,5B activos | no disponible | OmniDocBench v1.6: 93,92 (modelo base) | MIT | Hugging Face, Core AI Model Zoo |
| baidu/Unlimited-OCR | 3B totales / 0,5B activos | no disponible | OmniDocBench v1.6: 93,92 | MIT | Hugging Face |
| Qwen3-8B (referencia de runtime) | 8B | no disponible | 94 tok/s en M4 Max GPU (4-bit) | no disponible | no disponible |

No se dispone de datos de otros modelos OCR comparables (parametros, contexto o benchmarks) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta documentos de una sola pagina; para PDFs hay que trocear en imagenes de pagina antes de cada llamada.
- El modo incluido es Base (640px); los escaneos muy densos con texto pequeno (periodicos) requieren el modo `crop_mode` con vision tileada, que no se incluye en este repo.
- El prompt esta fijo a `document parsing`; no hay control libre del prompt.
- La decodificacion es greedy, lo que limita la variedad de salidas y puede producir repeticiones o errores en documentos atipicos.
- Riesgo de alucinacion en documentos con texto ilegible o layouts no vistos; la salida estructurada (HTML, LaTeX) puede contener etiquetas mal formadas.
- Idiomas documentados: ingles, japones y multilingue; no se especifica cobertura detallada del resto de idiomas.
- Licencia MIT, sin restricciones conocidas para uso comercial, aunque conviene verificar la licencia del modelo base `baidu/Unlimited-OCR` en produccion.
- Atado al runtime Core AI de Apple (iOS 27 / macOS 27); no es desplegable en otras plataformas con este formato.
- La primera ejecucion descarga 4,5 GB; hay que prever gestion de cache y progreso de descarga.
- Sin resultados de benchmarks propios del port mas alla de la fidelidad numerica frente a la referencia fp32.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coreai-community/Unlimited-OCR-CoreAI
- Repositorio canonico: https://huggingface.co/mlboydaisuke/Unlimited-OCR-CoreAI
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Core AI Model Zoo: https://github.com/john-rocky/coreai-model-zoo
- CoreAIKit: https://github.com/john-rocky/coreai-kit
- Ejemplo ReadDoc: https://github.com/john-rocky/coreai-kit/tree/main/Examples/ReadDoc
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/main/Examples/ReadDoc/Sources/QuickStart.swift
- Bench de LLM en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench

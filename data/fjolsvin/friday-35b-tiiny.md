# fjolsvin/Friday-35B-tiiny

## Resumen

Friday-35B-tiiny es un empaquetado del modelo Friday-35B, un fine-tune de Qwen/Qwen3.6-35B-A3B orientado a ingenieria de software senior: revision de codigo, razonamiento arquitectonico y analisis de compromisos tecnicos. El autor original del fine-tune es dangell7; fjolsvin publica esta copia reempaquetada mediante tiiny-forge para que la importacion de Tiiny Pocket la acepte como fine-tune del modelo de tienda Qwen/Qwen3.6-35B-A3B. Los pesos del fine-tune no se han modificado.

El modelo se construye sobre una arquitectura Mixture-of-Experts con 256 expertos, 8 activos por token y aproximadamente 3.000 millones de parametros activos por pasada, con atencion hibrida GDN. Los pesos suman 34.660.610.688 parametros totales (unos 34,7B), y el repositorio ocupa 70,2 GB en formato safetensors. El pipeline declarado es image-text-to-text, aunque el fine-tune original era un build solo de texto: el reempaquetado anade 333 tensores de la torre visual del modelo base (0,89 GB) para restaurar la capacidad multimodal.

Su relevancia es doble: por un lado, demuestra un flujo de especializacion de un MoE grande mediante SFT completo sobre un conjunto pequeno de trazas de razonamiento (2.472 ejemplos), y por otro ilustra las practicas de reempaquetado y "grafting" de tensores para compatibilidad con plataformas de importacion. La licencia es Apache 2.0 y la libreria de referencia es transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion hibrida GDN; 256 expertos, 8 activos por token |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token (8 de 256 expertos) |
| Longitud de contexto | no disponible (la secuencia de entrenamiento fue de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; el repo no lista variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible; el autor declara soporte de Rust, Python, TypeScript, C++, Go y Java para codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.6-35B-A3B es un transformer Mixture-of-Experts con 256 expertos y 8 activos por token, lo que da unos 3B de parametros activos por pasada sobre 34,7B totales. Incorpora atencion hibrida GDN (una variante de atencion lineal/eficiente) segun la model card del autor. El fine-tune se realizo como SFT completo (full fine-tune) sobre 2.472 trazas de razonamiento, con longitud de secuencia de 8.192 tokens, 3 epocas, learning rate 2e-5 con schedule coseno, precision BF16 + TF32, TRL SFTTrainer con DeepSpeed ZeRO-3 y 8 GPU A100 de 80 GB.

El reempaquetado de tiiny-forge sustituye config.json por el del modelo base (mismo esquema de transformers), anade 333 tensores de la torre visual (model.visual.*, 0,89 GB) copiados byte a byte del base, y copia merges.txt, preprocessor_config.json, video_preprocessor_config.json y vocab.json desde Qwen/Qwen3.6-35B-A3B. El fine-tune original era solo de texto; esta version recupera la ruta multimodal del base sin reentrenar la parte visual. No se declara uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento tecnico con profundidad de ingeniero staff+: analisis de compromisos, diagnostico de causa raiz y propuesta de soluciones a corto y largo plazo.
- Revision de codigo: deteccion de bugs de concurrencia, problemas de consistencia de datos y antipatrones arquitectonicos.
- Diseno de sistemas: flujo diagnostico, causas raiz y soluciones por horizontes temporales.
- Programacion multilingue declarada: Rust, Python, TypeScript, C++, Go y Java.
- Razonamiento multi-paso (tag "reasoning").
- Capacidad multimodal image-text-to-text restaurada mediante el injerto de la torre visual del modelo base (no reentrenada en el fine-tune).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues naturales: no disponible; solo se documenta el soporte de lenguajes de programacion.

## Casos de uso

- Revision de codigo en pull requests: el modelo puede analizar diffs y ficheros completos para localizar bugs de concurrencia, condiciones de carrera y problemas de consistencia, como demuestra la evaluacion del autor sobre un servicio de checkout asincrono en Python con 10 bugs plantados.
- Auditoria de codigo asincrono y sistemas distribuidos: identificacion de fallos en locks distribuidos, TTLs, y desajustes de tipos en Redis, con propuestas de solucion a nivel de base de datos.
- Diseno de arquitectura y analisis de compromisos: uso como interlocutor tecnico para evaluar alternativas (por ejemplo, lock distribuido frente a locking a nivel de base de datos) y documentar decisiones.
- Asistencia en refactorizaciones de servicios en Rust, Go o TypeScript: el soporte declarado de multiples lenguajes permite revisar y proponer cambios en codebases poliglotas.
- Formacion y mentoría de equipos: generacion de explicaciones de causa raiz y de patrones arquitectonicos para revisiones internas.
- Analisis de imagenes tecnicas (diagramas de arquitectura, capturas de errores) aprovechando la ruta image-text-to-text restaurada, aunque sin garantia de calidad al no haberse reentrenado la torre visual.
- Despliegue en plataformas de importacion tipo Tiiny Pocket: el reempaquetado esta pensado para que la plataforma lo acepte como fine-tune del modelo de tienda, lo que facilita su uso en entornos gestionados.

## Benchmarks y rendimiento

La model card declara una evaluacion propia sobre un servicio de checkout asincrono en Python con 10 bugs plantados, comparando con un competidor via API (no identificado). No se han publicado resultados en la model-index (results vacio) ni benchmarks estandar como MMLU, HumanEval o GSM8K.

| Metrica | FRIDAY-35B | Competidor (API) |
|---|---|---|
| Bugs encontrados | 10/10 | 7/10 |
| Tiempo | 19,5 s | 53,2 s |
| Tokens de salida | 3.156 | 4.226 |
| Throughput | ~162 tok/s | ~79 tok/s |

El competidor no detecto tres bugs: expiracion del TTL del lock durante pagos lentos, desreferencia de fila de producto nula y desajuste de tipos en `lpush` de Redis. FRIDAY tambien senalo que el lock distribuido en Redis era arquitectonicamente redundante dado un locking correcto a nivel de base de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que el MoE requiere aproximadamente 8× A100 de 80 GB o equivalente, lo que sugiere un despliegue en BF16 con paralelismo de tensor (tp 8).
- GPU recomendadas: 8× A100 80GB (configuracion usada en entrenamiento y sugerida para servicio con SGLang y `--tp 8`); H100 equivalente por VRAM agregada.
- Cabe en GPU consumer: no disponible; con 34,7B parametros totales y ~70 GB en BF16, no cabe en una unica GPU consumer sin cuantizacion, y el repo no publica variantes cuantizadas.
- Opciones de despliegue: SGLang (`python -m sglang.launch_server --model dangell7/Friday-35B --dtype bfloat16 --tp 8 --trust-remote-code`) y transformers (`AutoModelForCausalLM.from_pretrained(..., torch_dtype="bfloat16", device_map="auto")`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: ~162 tok/s en la evaluacion del autor, aunque no se especifica el hardware exacto de esa prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Friday-35B-tiiny | 34,7B | ~3B | no disponible | Apache 2.0 | Fine-tune de Qwen3.6-35B-A3B para ingenieria de software; reempaquetado con torre visual |
| Qwen/Qwen3.6-35B-A3B | 35B (nominal) | ~3B | no disponible | no disponible | Modelo base MoE con 256 expertos y atencion hibrida GDN; sin especializacion en revision de codigo |
| dangell7/Friday-35B | 35B (nominal) | ~3B | no disponible | Apache 2.0 | Fine-tune original solo de texto; mismos pesos que esta copia |
| Competidor (API) | no disponible | no disponible | no disponible | no disponible | Referencia de la evaluacion del autor; no identificado |

No se dispone de datos de benchmarks estandar para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo autorregresivo: puede alucinar detalles tecnicos; el propio autor lo advierte.
- La arquitectura MoE exige VRAM significativa (~8× A100 o equivalente); no es desplegable en GPU consumer sin cuantizacion, y no se publican pesos cuantizados.
- No sustituye la revision humana de codigo en sistemas en produccion.
- La evaluacion de bugs (10/10) es una prueba interna del autor sobre un unico caso, no un benchmark estandar; no debe generalizarse.
- La torre visual se ha injertado desde el modelo base sin reentrenamiento: las capacidades multimodales no han sido validadas en este fine-tune.
- El fine-tune original era solo de texto; el pipeline image-text-to-text es resultado del reempaquetado.
- Idiomas naturales soportados: no disponible; la model card no documenta cobertura multilingue.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- La model card no incluye resultados en model-index; la ausencia de benchmarks estandar limita la comparacion objetiva.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B, cuya licencia no se detalla en la informacion disponible.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/fjolsvin/Friday-35B-tiiny
- Modelo original del fine-tune: https://huggingface.co/dangell7/Friday-35B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- SGLang: https://github.com/sgl-project/sglang
- TRL: https://github.com/huggingface/trl
- DeepSpeed: https://github.com/microsoft/DeepSpeed

# Mai-iaM/BeyondSight-aamt

## Resumen

BeyondSight-aamt es una familia de modelos de lenguaje cuantizados a pesos ternarios y de 1 bit, empaquetados en el formato propietario `.aamt` y publicados por la organización Mai-iaM (AsAManThinks Research). La colección incluye tres modelos: InnerSight (1.7B parámetros, ternario), BeyondSight NightOwl (8B, 1-bit) y BeyondSight GaIaN (8B, ternario), todos derivados de la familia Qwen3 de Alibaba Cloud (Qwen3-1.7B y Qwen3-8B, originalmente bajo Apache-2.0).

El problema que aborda es la ejecución de modelos de tamaño medio en hardware local y de consumo: los pesos se empaquetan a nivel de bits de forma que un shader de GPU lee una palabra de 32 bits y desempaqueta 16 pesos ternarios o 32 pesos de 1 bit en registros, reduciendo drásticamente el footprint de memoria (0,72 GB para el modelo de 1.7B y 2,28-3,23 GB para los de 8B). El runtime `aamt` permite ejecutarlos directamente en GPU, incluso vía WebGPU en el navegador, sin dependencias de frameworks pesados.

Su relevancia actual radica en la tendencia del on-device AI y la cuantización extrema (1-bit/ternary, en la línea de BitNet y similares), combinada con un sistema de procedencia verificable: cada fichero se acompaña de un catálogo con hashes SHA-384 firmado con Ed25519 y los modelos incorporan una marca de agua criptográfica en sus escalas de pesos. Nótese que la fecha de creación del repositorio (octubre de 2026) y el hecho de que no registre descargas sugieren que es un proyecto muy reciente y de adopción aún marginal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3 (detalle interno no disponible) |
| Parametros totales | 1.7B (InnerSight) y 8B (NightOwl y GaIaN) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternario (InnerSight, GaIaN) y 1-bit (NightOwl) |
| Idiomas soportados | No disponible (los modelos base Qwen3 son multilingues) |
| Licencia | BeyondSight Model License 1.0 (personal, investigacion no comercial y evaluacion comercial de 60 dias gratuitas; resto requiere licencia comercial) |
| Formato de pesos | `.aamt` (formato propietario bit-packed; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Los tres modelos son fine-tunes de la familia Qwen3 de Alibaba Cloud, una arquitectura transformer decoder-only. InnerSight parte de Qwen3-1.7B, mientras que NightOwl y GaIaN parten de Qwen3-8B. La innovacion principal no esta en la arquitectura del transformer sino en la representacion de los pesos: cuantizacion ternaria (valores -1, 0, +1) y de 1 bit, empaquetadas a nivel de bit para que la descompresion ocurra en registros de GPU mediante shaders. Un word de 32 bits contiene 16 pesos ternarios o 32 pesos binarios.

No se dispone de informacion sobre el proceso de entrenamiento o fine-tuning: numero de tokens, composicion del dataset, uso de RLHF/DPO o si la cuantizacion se aplico mediante quantization-aware training o post-training. El runtime `aamt` (especificado en github.com/wwhitehead/aamt) se encarga de verificar la integridad del fichero (catalogo SHA-384 firmado con Ed25519 por AsAManThinks Research) antes de cargarlo, y los modelos incluyen una marca de agua con clave en las escalas de pesos, verificada por los autores con coincidencia del 100% en predicciones next-token y salida greedy identica respecto a los ficheros originales.

## Capacidades

- Generacion de texto conversacional: el propio README muestra `npx aamt` lanzando InnerSight "chatting in about a minute".
- Capacidades heredadas de Qwen3-1.7B y Qwen3-8B: razonamiento general, codigo y matematicas (según las capacidades de los modelos base; el grado de retencion tras la cuantizacion extrema no esta documentado).
- Ejecucion local en GPU propia mediante el runtime `aamt`, con soporte WebGPU (según los tags del repositorio), lo que habilita inferencia en navegador.
- Benchmark local reproducible: `npx aamt bench gaian` mide el rendimiento en la maquina del usuario y genera una tarjeta compartible.
- Verificacion de procedencia e integridad: `npx aamt verify <file>` comprueba la firma Ed25519 del catalogo de ficheros.
- No hay informacion sobre tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito para estos fine-tunes.

## Casos de uso

- Chatbot local y privado: InnerSight (0,72 GB) permite conversacion en local en aproximadamente un minuto tras instalar, adecuado para asistentes personales sin envio de datos a la nube.
- IA en el navegador via WebGPU: el soporte WebGPU permite desplegar los modelos en aplicaciones web sin backend de inferencia, util para demos y productos con privacidad por diseño.
- Prototipado en portatiles y GPUs de consumo: el tamaño reducido de los pesos (2,28-3,23 GB para 8B) hace viable ejecutar un modelo de 8B en hardware sin VRAM de gama alta.
- Investigacion en cuantizacion extrema: los pesos ternarios y de 1 bit son material de estudio para comparar degradacion de calidad frente a FP16/INT8 en modelos derivados de un mismo base (Qwen3-8B).
- Evaluacion de rendimiento hardware: `npx aamt bench` permite medir tokens/s en una maquina concreta y generar resultados comparables y compartibles, util para estudios de hardware.
- Distribucion de modelos con procedencia verificable: el sistema de catalogo firmado y marca de agua es un caso de uso en si mismo para organizaciones que necesitan garantizar la integridad de los pesos desplegados.
- Evaluacion comercial de 60 dias: la licencia permite probar los modelos en un producto durante dos meses antes de decidir si se solicita licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README menciona el comando `npx aamt bench gaian` para medir el modelo en la propia maquina, pero no incluye cifras de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: InnerSight ocupa 0,72 GB de pesos; NightOwl 2,28 GB; GaIaN 3,23 GB. Anadiendo overhead de KV cache y runtime, se estima que todos caben con holgura en GPUs con 4-8 GB de VRAM (estimacion propia, no documentada por los autores).
- GPU recomendadas: no disponible. Por los tamaños indicados, cualquier GPU moderna con soporte de shaders deberia ser suficiente; el soporte WebGPU sugiere compatibilidad con GPUs de consumo (NVIDIA, AMD, Apple Silicon).
- Consumer GPUs: si, este es precisamente el objetivo del proyecto; los tres modelos deberian ejecutarse en GPUs de consumo e incluso integradas, aunque no hay lista oficial de hardware soportado.
- Despliegue: exclusivamente mediante el runtime `aamt` (`npx aamt`, `npx aamt run <model>`). No son compatibles con vLLM, llama.cpp, Ollama ni TGI al no usar formatos estandar (GGUF/safetensors).
- Latencia y throughput: no disponible; el proyecto ofrece `npx aamt bench` para medirlo en cada maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano pesos | Formato | Licencia |
|---|---|---|---|---|---|
| BeyondSight GaIaN | 8B | Ternaria | 3,23 GB | `.aamt` | BeyondSight 1.0 (restricativa) |
| Qwen3-8B (base) | 8B | BF16 | ~16 GB | safetensors | Apache-2.0 |
| Qwen3-8B (GGUF Q2_K) | 8B | ~2-3 bit | ~3-4 GB | GGUF | Apache-2.0 |
| Llama-3.1-8B (GGUF Q2_K) | 8B | ~2-3 bit | ~3-4 GB | GGUF | Llama 3.1 Community License |

Nota: la comparativa con las variantes GGUF es una referencia de categoria (cuantizacion extrema de modelos de 8B); el rendimiento en calidad de BeyondSight frente a esas alternativas no esta documentado. La ventaja diferencial de `.aamt` es la descompresion en shaders de GPU y la procedencia firmada; la desventaja, el aislamiento del ecosistema de runtimes estandar.

## Limitaciones y advertencias

- Licencia restrictiva para produccion: el uso comercial en produccion, productos de pago, hosting, OEM, redistribucion y entrenamiento de otros modelos requiere licencia comercial de AsAManThinks Research (licensing@asamanthinks.com). Solo hay evaluacion comercial gratuita de 60 dias; pequenas organizaciones (menos de 1 M USD de ingresos, 5 M USD captados y 25 empleados) necesitan registro gratuito.
- Marca de agua obligatoria: los pesos incorporan una marca de agua con clave cuya eliminacion incumple la licencia. Esto puede ser relevante para auditorias y trazabilidad del despliegue.
- Formato cerrado: el formato `.aamt` solo funciona con el runtime `aamt`, lo que impide usar el ecosistema estandar (llama.cpp, vLLM, transformers, etc.) y complica la integracion en pipelines existentes.
- Sin benchmarks publicados: no hay datos que permitan evaluar la degradacion de calidad causada por la cuantizacion ternaria o de 1 bit frente a los modelos base Qwen3.
- Riesgo de alucinacion: inherente a cualquier LLM; ademas, la cuantizacion extrema puede agravar errores en razonamiento y matematicas (no verificado por falta de datos).
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no estan documentados en la model card.
- Proyecto muy reciente y sin traccion: cero descargas registradas en HuggingFace y sin comunidad visible, lo que implica riesgo de abandono y soporte limitado.
- Acceso gated: hay que solicitar acceso aceptando la licencia antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mai-iaM/BeyondSight-aamt
- Especificacion del formato `.aamt` y runtime: https://github.com/wwhitehead/aamt
- Modelos base: https://huggingface.co/Qwen/Qwen3-8B y https://huggingface.co/Qwen/Qwen3-1.7B
- DOI del modelo: 10.57967/hf/11290
- Licencia comercial: licensing@asamanthinks.com
- Paper, demo y blog: no disponibles

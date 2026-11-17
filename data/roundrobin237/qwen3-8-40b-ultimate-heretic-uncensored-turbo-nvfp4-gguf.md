# RoundRobin237/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-NVFP4-GGUF

## Resumen

Este repositorio contiene una recuantización NVFP4 de terceros del modelo Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO, un fine-tuning de DavidAU sobre la familia Qwen3.5. El autor de esta ficha, RoundRobin237, parte del GGUF Q8_0 ya publicado por DavidAU y reconvierte 600 tensores de proyección del modelo principal a formato NVFP4 (FP4 E2M1 con escalas E4M3 por bloque de 16 valores y escala tensorial FP32), manteniendo el vocabulario y las matrices MTP en Q8_0. El resultado es un GGUF de 23,74 GB que incluye pesos MTP para decodificación especulativa y que requiere un proyector visual externo (mmproj-BF16.gguf) para tareas de imagen-texto.

El modelo tiene 39.497.297.328 parámetros, 96 capas principales más una capa MTP, y metadatos que declaran una longitud de contexto de 262.144 tokens (aunque el autor advierte que no se ha evaluado la calidad ni los requisitos de memoria a esa longitud). Es relevante porque demuestra el empaquetado de pesos NVFP4 en el contenedor GGUF estándar con escalas por tensor y activaciones calibradas, lo que permite ejecutar un modelo de ~40B con cuantización de 4 bits en hardware consumer reciente mediante llama.cpp, a costa de una calibración limitada y de una procedencia en cadena (fine-tuning → Q8_0 → NVFP4) que conviene auditar antes de usar en producción.

La licencia declarada es Apache-2.0, heredada del upstream, y los idiomas indicados son inglés y coreano. El modelo se distribuye sin benchmarks de calidad publicados por el autor de esta recuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (96 capas principales + 1 capa MTP), con atención lineal y gated-query según los metadatos del export; pipeline image-text-to-text |
| Parametros totales | 39.497.297.328 |
| Parametros activos | no disponible (no se declara configuración MoE) |
| Longitud de contexto | 262.144 tokens según metadatos upstream; no evaluada a longitud completa |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, escala E4M3 por bloque de 16 valores, escala tensorial FP32) en 600 tensores de proyección; Q8_0 en vocabulario y matrices MTP; otros tensores conservan su tipo original |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo principal de 23.743.746.112 bytes; proyector visual externo mmproj-BF16.gguf de 931.145.888 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la familia Qwen3.5, un transformer con 96 capas principales y una capa MTP (multi-token prediction) adicional, que el runtime puede usar para decodificación especulativa (`--spec-type draft-mtp`). El export restaura el interleaving de filas de gated-query y el orden de cabezas V de atención lineal propios de GGUF, y conserva metadatos de arquitectura, plantilla de chat, tokenizador y MTP. El pipeline declarado es image-text-to-text, con capacidades de visión delegadas al proyector mmproj-BF16 de DavidAU, que no se re-sube en este repositorio.

No hubo entrenamiento ni merging adicional en esta ficha: el proceso parte del GGUF Q8_0 de DavidAU (revisión fijada `16ff9d7e1a9187d0b3d931ec0c34587774748651`, SHA256 del archivo fuente `b63d607f...e67b7f`), reconstruye los pesos Q8, cuantiza 600 tensores a NVFP4 seleccionando la escala de bloque mediante búsqueda MSE sobre las 126 palabras E4M3 positivas finitas, y exporta códigos y escalas al layout de super-bloque NVFP4 de GGUF sin recuantización adicional. Las escalas de activación (`.input_scale`) se midieron sobre 128 ventanas de 12 tokens en coreano, inglés, Python, JSON/SQL y aritmética, con un margen de 4x sobre el amax; es un conjunto de calibración limitado, no un benchmark de calidad. Los divisores recíprocos de pesos se almacenan como tensores `.scale` nativos con redondeo FP32.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y coreano.
- Razonamiento y matemáticas básicas, con calibración explícita en ventanas aritméticas.
- Generación de código (Python) y manejo de JSON/SQL, incluidos en el conjunto de calibración de activaciones.
- Procesamiento de imagen-texto mediante el proyector externo mmproj-BF16.gguf (no incluido en el repo).
- Decodificación especulativa con la capa MTP incluida, configurable en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servidor.
- No se declara soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se declara modo thinking ni capacidades de audio.

## Casos de uso

- Asistente conversacional bilingüe inglés-coreano: el modelo puede mantener diálogos multi-turno con contexto amplio (hasta 262.144 tokens declarados) en un servidor llama.cpp, adecuado para soporte en esos dos idiomas.
- Generación de código en local: con calibración específica en Python y un tamaño de 23,74 GB, puede desplegarse en una estación de trabajo con GPU consumer reciente para autocompletado y generación de scripts sin depender de la nube.
- Análisis de documentos largos: la ventana declarada de 262.144 tokens permite ingerir contratos o informes extensos, aunque el autor advierte que la calidad a longitud completa no está evaluada y debe validarse en el caso concreto.
- Descripción de imágenes en pipelines de accesibilidad: usando el proyector mmproj-BF16 externo, el modelo puede generar texto a partir de imágenes en flujos de etiquetado o alt-text, con la salvedad de que el proyector no se distribuye en este repo.
- Prototipado de inferencia especulativa: la capa MTP incluida permite experimentar con decodificación draft-mtp en llama.cpp y medir tasas de aceptación en hardware propio.
- Evaluación de cuantización NVFP4 en GGUF: útil para investigadores que quieran comparar la calidad de NVFP4 frente a Q8_0 sobre el mismo checkpoint base, con las herramientas de auditoría incluidas (`export-provenance.json`, `validation.json`, `SHA256SUMS`).
- Despliegue en portátiles con GPU de gama alta: el autor reporta una estimación de ~55 tokens/s en una RTX 5090 Laptop con MTP activado, lo que hace viable un asistente local en movilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente aporta una estimación no verificada de ~55 tokens/s en llama.cpp sobre una NVIDIA GeForce RTX 5090 Laptop GPU con MTP activado, que no constituye un benchmark controlado. Los archivos `validation.json` recogen comprobaciones de integridad del runtime, no métricas de calidad.

## Requisitos de hardware

- VRAM estimada: el archivo principal pesa 23,74 GB; con overhead de contexto y caché KV, se necesita aproximadamente 24-28 GB de VRAM para carga completa en GPU con contexto moderado (8K-32K). El proyector visual añade 0,93 GB.
- GPU recomendadas: RTX 5090 (32 GB), RTX 4090 (24 GB, ajustada), A100 40 GB, H100 80 GB. En GPUs de 24 GB puede requerir offloading parcial de capas.
- Cabe en GPU consumer de gama alta: sí, en RTX 5090 y previsiblemente en RTX 4090 con `--gpu-layers auto --fit on`; en GPUs de 16 GB o menos será necesario offload a RAM y la latencia se degradará.
- Opciones de despliegue: llama.cpp (`llama-server` o `llama-cli`) con una build reciente que soporte arquitectura Qwen3.5, tensores NVFP4 con escalas por tensor y MTP de Qwen. No se declara compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: estimación del autor de ~55 tokens/s en RTX 5090 Laptop con MTP; sin datos medidos para otras GPUs ni para contexto largo. La caché KV NVFP4 usada en el despliegue NInfer original es una configuración de runtime, no datos del GGUF, y no debe asumirse en otros runtimes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NVFP4 GGUF) | 39,5B | 262.144 (declarado) | NVFP4 + Q8_0 mixto | Apache-2.0 | Incluye MTP; visión vía mmproj externo |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF (Q8_0) | 39,5B | 262.144 (declarado) | Q8_0 | Apache-2.0 | Fuente directa de esta recuantización; mayor precisión, ~40 GB |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | no disponible | no disponible | no disponible | Apache-2.0 | Modelo base del fine-tuning antes del trabajo Turbo Brilliance |
| Alternativas de ~40B en GGUF de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Procedencia en cadena: el modelo se cuantizó desde un Q8_0 ya cuantizado, no desde el checkpoint BF16 original; los errores de cuantización previos se arrastran.
- Calibración de activaciones limitada: solo 128 ventanas de 12 tokens en cinco dominios; puede no representar bien otros idiomas, dominios o longitudes de prompt.
- Contexto no validado: los 262.144 tokens son metadatos upstream; el autor no ha medido calidad ni requisitos de memoria a longitud completa.
- Compatibilidad estricta de runtime: requiere una build reciente de llama.cpp con soporte de Qwen3.5, NVFP4 con escalas por tensor y MTP; una extensión GGUF por sí sola no garantiza compatibilidad.
- Visión incompleta en el repo: el proyector mmproj-BF16 no se incluye y debe descargarse del repositorio de DavidAU, verificando el SHA256 indicado.
- Caché KV NVFP4 no incluida: es una configuración de runtime del despliegue original; otros runtimes pueden consumir mucha más memoria.
- Contenido sin censura: el fine-tuning "Heretic-Uncensored" relaja los filtros de seguridad, lo que incrementa el riesgo de generar contenido sensible, sesgado o inapropiado en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un fine-tuning sobre Qwen3.5, conviene validar salidas en dominios críticos.
- Idiomas: solo se declaran inglés y coreano; el rendimiento en castellano no está evaluado.
- Licencia: Apache-2.0 heredada del upstream, pero la cadena de fine-tunes intermedios conviene revisarla antes de uso comercial; los archivos `NOTICE` y `UPSTREAM_README.md` documentan la atribución.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval ni GSM8K para esta recuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RoundRobin237/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-NVFP4-GGUF
- Modelo fuente (Q8_0 de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo base del fine-tuning: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- Proyector visual mmproj-BF16: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF/resolve/main/mmproj-BF16.gguf?download=true
- Perfil del autor del fine-tuning: https://huggingface.co/DavidAU

# russellwmy/qwen3.6-35b-a3b-ternary

## Resumen

`russellwmy/qwen3.6-35b-a3b-ternary` es un bundle de cuantización ternaria del modelo multimodal Qwen3.6-35B-A3B de Alibaba Qwen, publicado por el desarrollador independiente russellwmy para su motor de inferencia ironbark, orientado a Apple Silicon. No es un checkpoint ejecutable por bibliotecas convencionales: contiene los expertos enrutados del MoE comprimidos a valores ternarios {-a, 0, a} mediante GPTQ con códigos de 2 bits, más el resto del modelo (incluido el codificador de visión) copiado sin cambios del checkpoint de 4 bits de mlx-community. El objetivo es reducir el peso en disco de los expertos de 18,1 GB a 9,1 GB y permitir la ejecución de un MoE de 35B parámetros con ~3B activos por token en Macs e incluso en un iPhone mediante streaming de expertos desde SSD.

El modelo base Qwen3.6-35B-A3B es un transformer causal post-entrenado con una pila híbrida de bloques Gated DeltaNet y Gated Attention, enrutamiento MoE disperso con 256 expertos, 35B parámetros totales y unos 3B activados por token, con codificador de visión y licencia Apache 2.0. La propuesta de este bundle es doble: por un lado, cuantización extrema de los expertos con pérdida de calidad medida y acotada; por otro, un formato de empaquetado propio que hace viable el despliegue local en hardware de memoria unificada limitada.

Su relevancia es fundamentalmente práctica para quien quiera ejecutar un MoE grande en Apple Silicon sin cloud: mantiene el 100 % de acierto en tool calling (46/46) y en tareas de asistente retenidas (80/80), pero pierde 7,7 puntos en IFEval de instrucciones y muestra degradación en el cumplimiento del idioma solicitado en una build anterior. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pila híbrida de Gated DeltaNet y Gated Attention, MoE disperso con 256 expertos y codificador de visión (modelo base); expertos enrutados cuantizados a ternario |
| Parametros totales | 35B en el modelo base; el bundle declara 2.894.927.216 parámetros en safetensors por el empaquetado de los expertos en códigos de 2 bits |
| Parametros activos | ~3B por token (3B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos ternarios {-a, 0, a} por GPTQ, códigos de 2 bits (4 por byte) y escalas bf16 cada 64 entradas; resto del modelo en 4-bit (formato MLX) |
| Idiomas soportados | no disponible (la calibración incluye respuestas en 29 idiomas; adherencia al idioma solicitado de 26/42 en una build anterior) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`experts.safetensors` de 9,1 GB y `model.safetensors` de 2,3 GB); requiere empaquetado previo al formato propio de ironbark (`experts.bin`, registros trit) |

## Arquitectura y entrenamiento

El modelo base combina bloques de atención lineal (Gated DeltaNet) con bloques de atención clásica (Gated Attention) y enrutamiento MoE disperso sobre 256 expertos por capa, con 35B parámetros totales y ~3B activados por token. Incluye codificador de visión, por lo que el pipeline declarado es image-text-to-text. Según la documentación de Alibaba Cloud, Qwen3.6-35B-A3B mejora respecto a 3.5 en codificación agéntica, razonamiento matemático y de código e inteligencia espacial. El bundle conserva intactos todos los módulos salvo los expertos enrutados: atención, router, embeddings, capas densas y visión provienen del checkpoint `mlx-community/Qwen3.6-35B-A3B-4bit`.

La cuantización se aplica solo a los expertos enrutados de 40 capas × 256 expertos. El proceso consta de tres fases: captura de activaciones con ~295K tokens en el formato de chat de Qwen (transcripciones de asistente sobre chat, lookup, research, resumen, email, Python y tool calls multi-paso; respuestas en 29 idiomas con instrucciones de formato; escritura larga y código, generados con el modelo de 4 bits como profesor); cálculo de matrices de Hessian por experto a partir de `(s·x)(s·x)ᵀ` sobre los tokens enrutados a cada uno, regularizadas hacia la media de la capa para expertos con pocos tokens; y GPTQ secuencial primero sobre `[gate; up]` y después sobre `down` usando las activaciones de la puerta ternaria. Por cada grupo de 64 pesos se elige el umbral y la escala bf16 `a` de mínimo error, y el error de redondeo de cada columna se propaga a las columnas aún no procesadas. Los expertos se cuantizan desde el checkpoint MLX de 8 bits, con un error ternario equivalente al de partir del BF16 original.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat de Qwen, con plantilla de tokens propia.
- Razonamiento y matemáticas: el modelo base está post-entrenado para razonamiento matemático y de código; el bundle conserva el modo de razonamiento desactivable (los resultados publicados se midieron con reasoning off).
- Generación de código, incluido Python, con soporte para instrucciones de formato de salida.
- Tool calling / function calling: 46/46 casos superados, idéntico al checkpoint de 4 bits.
- Razonamiento multi-paso y flujos agénticos: 11/11 en tareas de investigación multi-paso y 80/80 en tareas de asistente retenidas.
- Capacidades de visión: el bundle incluye el codificador de visión del modelo base y declara pipeline image-text-to-text.
- Multilingüe: no hay lista oficial de idiomas; la calibración cubre 29 idiomas, pero la adherencia al idioma solicitado cayó a 26/42 en una build anterior.
- Seguimiento de instrucciones con formato estricto: 42/48 en instrucciones de formato (build anterior).
- No soporta `transformers`, `mlx-lm` ni `mlx-vlm`: el formato de expertos es exclusivo de ironbark.

## Casos de uso

- Asistente conversacional totalmente local en un Mac Apple Silicon: el pack se carga con `ironbark gen --chat` y evita enviar datos a la nube; con todos los expertos en memoria en un M1 Max de 64 GB se obtienen ~60 tok/s y 9,3 GB de huella pico.
- Automatización de tool calling en producción interna: los 46/46 casos de llamada a herramientas permiten integrar el modelo como planificador que invoca APIs, consultas SQL o scripts, siempre que el ejecutor corra en macOS sobre Apple Silicon.
- Investigación multi-paso sobre documentación local: el modelo resolvió 11/11 tareas de research multi-paso, adecuado para pipelines de recuperación y síntesis con varios saltos encadenados.
- Asistencia de código offline en portátil: generación de scripts Python y refactorizaciones puntuales sin conexión, usando el modo chat y plantillas de instrucciones de formato; conviene validar la salida porque no hay HumanEval publicado para este bundle.
- Procesamiento de imágenes con descripción y extracción de información: al conservar el codificador de visión del checkpoint de 4 bits, sirve para tareas image-text-to-text en local, como describir capturas o transcribir contenido estructurado de imágenes.
- Despliegue en dispositivo móvil con memoria limitada: en un iPhone 17 de 8 GB el streaming de expertos desde SSD da ~11 tok/s, y ~18 tok/s con `Expert drop 0.10`; útil para demos y asistentes empotrados que toleren latencia alta.
- Prototipado e investigación sobre cuantización ternaria de MoE: el bundle y el método GPTQ descrito sirven como base reproducible para estudiar el impacto de 2 bits por peso en calidad de instrucciones y tool calling.
- Sustitución de un checkpoint de 4 bits cuando el espacio en disco es crítico: la descarga baja de 20,4 GB a 11,4 GB y los expertos de 18,1 GB a 9,1 GB, a costa de la pérdida de calidad documentada.

## Benchmarks y rendimiento

Resultados publicados por el autor, con razonamiento desactivado, todos los expertos en memoria y sobre Mac Apple Silicon. La columna de referencia es el checkpoint MLX de 4 bits del que se parte.

| Benchmark | 4-bit MLX | Ternario (este bundle) |
|---|---|---|
| IFEval prompt, strict | 83,5 % | 75,8 % |
| IFEval prompt, loose | no disponible | 77,8 % |
| IFEval instruction, strict | 89,1 % | 82,9 % |
| IFEval instruction, loose | no disponible | 84,7 % |
| Tool calls (46 casos) | 46/46 | 46/46 |
| Tareas de asistente (80 retenidas) | 79/80 | 80/80 |
| Investigación multi-paso (11) | no disponible | 11/11 |
| Perplejidad de respuesta | 1,102 | 1,260 |
| Respuestas en el idioma solicitado (42) | 42/42 | 26/42 † |
| Instrucciones de formato (48) | 44/48 | 42/48 † |

† Medido sobre una build anterior del modelo, con menos texto de calibración; no se repitió. El autor indica que diferencias de IFEval por debajo de ~3 puntos entre builds ternarias están dentro del ruido (comprobación emparejada de dos builds: p ≈ 0,25). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS y una build de ironbark compilada (`cargo build --release`). No hay soporte para CUDA, ROCm ni CPU x86.
- Descarga total de 11,4 GB; tras el empaquetado, los expertos ternarios ocupan menos que los 9,1 GB del safetensors original.
- M1 Max con 64 GB: ~60 tok/s en decodificación con prompt corto, 9,3 GB de huella pico y los 256 expertos por capa en memoria.
- iPhone 17 con 8 GB: ~11 tok/s con streaming de expertos desde SSD; ~18 tok/s aplicando `Expert drop 0.10`.
- Memoria: el modo con todos los expertos en memoria requiere del orden de 9-10 GB de memoria unificada; el modo streaming reduce el requisito pero añade latencia de E/S.
- Opciones de despliegue: exclusivamente ironbark (CLI `ironbark download/pack/gen` o API `ironbark::Session::open(DIR, Options::default())`). No compatible con vLLM, TGI, llama.cpp, Ollama, `transformers`, `mlx-lm` ni `mlx-vlm`.
- Ajuste de caché de expertos: `--experts DIR --cache 64` mantiene 64 de los 256 expertos por capa.
- VRAM/GPU dedicadas (A100, H100, RTX 4090): no disponible; el formato de pesos no es cargable por los motores que corren en esas GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Expertos en disco | Descarga | Contexto | Licencia | Calidad medida |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.6-35B-A3B (BF16) | 35B totales, ~3B activos | BF16 (referencia) | no disponible | no disponible | Apache 2.0 | Referencia del modelo base |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35B totales, ~3B activos | 18,1 GB | 20,4 GB | no disponible | Apache 2.0 | IFEval instruction strict 89,1 %; tool calls 46/46; perplejidad 1,102 |
| russellwmy/qwen3.6-35b-a3b-ternary | 35B totales, ~3B activos (2.894.927.216 según safetensors) | 9,1 GB | 11,4 GB | no disponible | Apache 2.0 | IFEval instruction strict 82,9 %; tool calls 46/46; perplejidad 1,260 |

La comparación directa con alternativas de otros fabricantes del mismo tamaño (por ejemplo, MoE de ~30-35B con ~3B activos de otras familias) no está disponible en la información consultada, y la falta de benchmarks estándar impide situar este bundle frente a ellos.

## Limitaciones y advertencias

- Solo se ejecuta con ironbark en Apple Silicon: no es cargable por `transformers`, `mlx-lm` ni `mlx-vlm` porque los expertos no están en su formato. Tampoco hay ruta de conversión a GGUF documentada.
- El formato de pack de ironbark está versionado y puede cambiar: tras actualizar ironbark hay que volver a ejecutar `ironbark pack --model DIR`.
- Pérdida de calidad medible: −7,7 puntos en IFEval instruction strict, perplejidad de 1,260 frente a 1,102 y 42/48 en instrucciones de formato frente a 44/48.
- Degradación lingüística: en una build anterior solo 26 de 42 respuestas usaron el idioma solicitado, frente a 42/42 del checkpoint de 4 bits. Los resultados no se repitieron en la build actual, por lo que el dato no está confirmado.
- No se han publicado MMLU, HumanEval, GSM8K ni evaluaciones de visión; no hay evidencia medida sobre capacidades matemáticas o de código más allá de las tareas internas del autor.
- Sesgos: no hay ninguna evaluación de sesgos, toxicidad o seguridad publicada para el bundle ni para el modelo base en la información consultada.
- Riesgo de alucinación: es un modelo de lenguaje generativo estándar; el autor no documenta mitigaciones y la cuantización agresiva de los expertos puede aumentar el error en dominios poco representados en la calibración (~295K tokens).
- Idiomas soportados y longitud de contexto no están documentados en esta ficha; no asumas una ventana larga sin verificarla contra el modelo base.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, y un único mantenedor. No hay garantía de mantenimiento ni de soporte.
- Licencia Apache 2.0, igual que el modelo base, permite uso comercial; aun así, conviene revisar los términos del modelo base y las dependencias de ironbark (build con Cargo/Rust) antes de integrarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/russellwmy/qwen3.6-35b-a3b-ternary
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Checkpoint de 4 bits de origen (resto de pesos y visión): https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Motor de inferencia ironbark: https://github.com/russellwmy/ironbark
- Colección Qwen3.6 en HuggingFace: https://huggingface.co/collections/Qwen/qwen36
- Catálogo de Microsoft Foundry (Qwen3.6-35B-A3B): https://ai.azure.com/catalog/models/qwen3.6-35b-a3b
- Catálogo de Microsoft Foundry (variante FW): https://ai.azure.com/catalog/models/FW-Qwen3.6-35B-A3B
- Alibaba Cloud Model Studio (documentación de Qwen3.6-35B-A3B): https://help.aliyun.com/en/model-studio/qwen3-6-35b-a3b
- Ficha de terceros con resumen del lanzamiento: https://ai-tldr.dev/releases/qwen-qwen3-6-35b-a3b/

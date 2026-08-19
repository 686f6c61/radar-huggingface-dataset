# AaryanK/Muse-Glimmer-30B-GGUF

## Resumen

Muse-Glimmer-30B es un modelo multimodal de razonamiento desarrollado por Meta Superintelligence Labs, diseñado para ejecutarse de forma local en hardware de consumo. Acepta entradas de texto e imágenes y está optimizado para cargas de trabajo agénticas: razonamiento multi-paso, tool calling fiable y recuperación ante fallos. La línea AK de AaryanK ofrece ocho cuantizaciones GGUF personalizadas con asignación de bits por tensor, calibradas con imatrix, que superan en calidad a las versiones stock de llama.cpp y a las de otros publicadores como Unsloth o bartowski.

El modelo base tiene 27.86 B parámetros (52 capas densas, GQA 32:2) y se distribuye bajo licencia Apache 2.0. La cuantización AK-Q4_K_XL (16.26 GB) es la más recomendada para GPUs de 16 GB, mientras que AK-Q8_K_L (32.28 GB) ofrece la máxima fidelidad en hardware de gama alta. El repositorio incluye también el encoder de visión BF16 sin cuantizar (3.85 GB) para el pipeline multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoder de vision (arquitectura propietaria de Meta, no detallada en la informacion disponible) |
| Parametros totales | 27.86 B (segun la cuantizacion; el modelo base se anuncia como 30B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de uso muestra 8192 tokens) |
| Tipos de cuantizacion | AK-Q2_K_XL, AK-Q3_K_XL, AK-Q4_K_M, AK-Q4_K_XL, AK-Q5_K_M, AK-Q6_K_XL, AK-Q8_K_L, AK-Q8_K_XL, mmproj BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con mmproj para el encoder de vision) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso multimodal de Meta, con 52 capas y atención con GQA 32:2. Incorpora un encoder de visión BF16 que permite procesar imágenes junto con texto. Está diseñado específicamente para agentes autónomos: soporta tool calling nativo (Onyx), razonamiento multi-paso y recuperación ante errores, todo ello optimizado para ejecución local en hardware de consumo.

La línea AK de AaryanK aplica una cuantización personalizada con asignación de bits por tensor, calibrada mediante imatrix. Cada archivo recibe una distribución de bits adaptada a su punto de tamaño, lo que reduce la divergencia KL respecto al modelo BF16 de referencia. El autor reporta 26 victorias, 6 empates estadísticos y 0 derrotas en 32 comparaciones pareadas contra las líneas de Unsloth, Meta y bartowski.

## Capacidades

- Multimodal: procesa texto e imágenes simultáneamente, permitiendo tareas como descripción de imágenes, razonamiento visual y análisis de documentos con figuras.
- Tool calling nativo: integra el parser Onyx para invocar funciones externas de forma estructurada, ideal para agentes que necesitan interactuar con APIs o herramientas.
- Razonamiento multi-paso: descompone problemas complejos en pasos intermedios, con capacidad de verificar y corregir errores durante la ejecución.
- Optimizado para agentes locales: diseñado para cargas de trabajo autónomas en PCs de gama alta y estaciones de trabajo, sin depender de infraestructura cloud.
- Recuperación ante fallos: detecta y corrige errores en la ejecución de tareas, mejorando la robustez en flujos agénticos.
- Conversacional: mantiene diálogos multi-turno con contexto, adecuado para asistentes virtuales.

## Casos de uso

- Asistentes virtuales locales con visión: un asistente que analiza capturas de pantalla o fotos del usuario y responde con acciones, gracias a su capacidad multimodal y tool calling.
- Automatización de tareas con tool calling: un agente que gestiona calendarios, envía correos o consulta APIs, ejecutando múltiples pasos con verificación de errores.
- Análisis de documentos técnicos: procesa PDFs con diagramas, tablas e imágenes, extrayendo información y respondiendo preguntas sobre el contenido.
- Agentes de razonamiento multi-paso: resuelve problemas matemáticos o lógicos que requieren descomposición en subproblemas, con capacidad de autocorrección.
- Chatbots de soporte con contexto largo: mantiene conversaciones extensas con memoria de los turnos anteriores, gracias a su ventana de contexto (aunque el máximo no está especificado).
- Procesamiento de imágenes en edge: clasifica o describe imágenes en dispositivos con GPU de consumo, sin enviar datos a la nube, cumpliendo requisitos de privacidad.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones de divergencia KL y top-1 accuracy para cada cuantización, comparadas contra el modelo BF16 de referencia y contra otras líneas de cuantización (Unsloth, Meta, bartowski). Los resultados se obtuvieron en el mismo rig y con el mismo conjunto de evaluación.

| Archivo | Tamano | bpw | Mean KLD ↓ | Top-1 ↑ | Delta vs rival mas cercano |
|---|---|---|---|---|---|
| AK-Q2_K_XL | 12.45 GB | 3.576 | 0.056036 | 90.88 % | −27 % KLD |
| AK-Q3_K_XL | 13.51 GB | 3.880 | 0.039079 | 92.30 % | −27 % KLD |
| AK-Q4_K_M | 15.86 GB | 4.556 | 0.013897 | 95.38 % | −6 % KLD |
| AK-Q4_K_XL | 16.26 GB | 4.669 | 0.012286 | 95.65 % | −14 % KLD |
| AK-Q5_K_M | 19.19 GB | 5.512 | 0.004974 | 97.26 % | −13 % vs Meta dynamic |
| AK-Q6_K_XL | 26.24 GB | 7.536 | 0.000876 | 98.82 % | −4 % KLD |
| AK-Q8_K_L | 32.28 GB | 9.272 | 0.000356 | 99.25 % | −21 % KLD, menor tamano |
| AK-Q8_K_XL | 34.96 GB | 10.040 | 0.000316 | 99.30 % | mas fiel |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- AK-Q2_K_XL (12.45 GB) y AK-Q3_K_XL (13.51 GB): caben en GPUs de 16 GB como RTX 4080 o RTX 4090, con margen para el encoder de vision (3.85 GB adicionales).
- AK-Q4_K_M (15.86 GB) y AK-Q4_K_XL (16.26 GB): requieren al menos 20 GB de VRAM total; una RTX 4090 (24 GB) es suficiente, dejando espacio para el contexto y el mmproj.
- AK-Q5_K_M (19.19 GB): necesita 24 GB de VRAM (RTX 4090, A5000) o 32 GB para mayor comodidad.
- AK-Q6_K_XL (26.24 GB): requiere 32 GB de VRAM (A6000, RTX 6000 Ada) o 40 GB para el mmproj.
- AK-Q8_K_L (32.28 GB) y AK-Q8_K_XL (34.96 GB): necesitan 40+ GB de VRAM (A100 40GB, H100) o multiples GPUs.
- Despliegue: compatible con llama.cpp, llama-server, vLLM (con soporte multimodal), Ollama y LM Studio. El comando de ejemplo usa `llama-server` con `--mmproj` y `-ngl 99`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se centra en las distintas lineas de cuantizacion del mismo modelo base Muse-Glimmer-30B, publicadas por diferentes autores. La linea AK de AaryanK supera consistentemente a las demas en divergencia KL y top-1 accuracy para tamanos equivalentes.

| Publicador | Archivo | Tamano | Mean KLD | Top-1 |
|---|---|---|---|---|
| AaryanK | AK-Q4_K_XL | 16.26 GB | 0.012286 | 95.65 % |
| Unsloth | UD-Q4_K_XL | 15.88 GB | 0.014714 | 95.25 % |
| bartowski | Q4_K_S | 16.32 GB | 0.014293 | 95.32 % |
| Meta | kquant-17gb | 16.76 GB | 0.014146 | 95.30 % |

AryaK tambien ofrece AK-Q5_K_M (19.19 GB) que supera a Meta kquant-dynamic (19.65 GB) en un 9-13 % en ambos conjuntos de evaluacion, siendo 460 MB mas pequeno. En Q8, AK-Q8_K_L (32.28 GB) es mas pequeno que Unsloth UD-Q8_K_XL (32.30 GB) y con un 20.8 % menos de KLD.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad respecto al modelo BF16 original; la divergencia KL aumenta en los archivos de menor tamano (AK-Q2_K_XL tiene un KLD de 0.056 vs 0.0003 del AK-Q8_K_XL).
- El modelo base puede presentar sesgos tipicos de los modelos de Meta, aunque no se han documentado explicitamente en la informacion disponible.
- La longitud de contexto no esta especificada; el ejemplo de uso muestra 8192 tokens, pero el maximo real podria ser mayor o menor.
- Los idiomas soportados no estan documentados; se asume un enfoque principal en ingles, aunque podria funcionar en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base de Meta para confirmar restricciones adicionales.
- Para produccion, es necesario validar el rendimiento en tareas especificas, ya que los benchmarks de la model card se centran en fidelidad de cuantizacion, no en tareas agénticas reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AaryanK/Muse-Glimmer-30B-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card de NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Blog de Meta sobre Muse Glimmer: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Pagina en LM Studio: https://lmstudio.ai/models/meta/muse-glimmer

# alansmithee-cpu/experimental_merge_221126_redux_123B-lam030

## Resumen

`experimental_merge_221126_redux_123B-lam030` es un modelo de lenguaje de gran tamano obtenido mediante fusión (merge) de pesos de 18 modelos derivados de la familia Mistral-Large-123B, publicado por el usuario `alansmithee-cpu` en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un experimento de mergekit que combina 15 fine-tunes y merges de Mistral-Large-123B junto con la LoRA T1-v2, todos re-basados sobre `mistralai/Mistral-Large-Instruct-2407`. El resultado es un checkpoint de 122.610.069.504 parametros (unos 122,6 mil millones) con arquitectura transformer densa de tipo Mistral.

La receta emplea una estrategia jerarquica en dos niveles: primero promedia cada familia de modelos (A, B, C, D, E) y despues combina las familias con pesos especificos y resolución de empates por densidad 1.0. La variante `lam` aplica ademas un ajuste de tarea sobre cada peso: suma 0,3 veces la diferencia entre `Mistral-Large-Instruct-2411` y `Mistral-Large-Instruct-2407`, de modo que el modelo hereda parte del comportamiento de la version 2411 manteniendo la base 2407. Los tokens especiales `[SYSTEM_PROMPT]` y `[/SYSTEM_PROMPT]` adoptan el significado de 2411 y la plantilla de chat es Mistral V7.

El modelo es relevante como ejemplo de ingenieria de merges a gran escala (88 capas, 245,2 GB de repositorio en safetensors) y por su enfasis en generacion conversacional y creativa, dado que la mayoria de sus componentes son fine-tunes orientados a rol y escritura. Sin embargo, el propio autor indica que la receta "no ha sido probada todavia", lo que lo situa en estado experimental y no apto para producción sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Mistral (88 capas) |
| Parametros totales | 122.610.069.504 (~122,6 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | MRL (Mistral Research License 0.1), etiquetada como `other` |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 88 capas con la arquitectura de Mistral-Large, sin mezcla de expertos. No ha sido entrenado desde cero: se construye con mergekit mediante una receta UNI de dos niveles. En el nivel 1 se promedian los miembros de cada familia con pesos internos (familia A: Behemoth-ReduX-123B-v1.1, Behemoth-123B-v2.1 y Behemoth-X-123B-v2.2 al 0,33 cada uno; familia B: magnum-v4-123b y ML2-123B-Magnum-Diamond al 0,50; familia C: Monstral-123B-v2, ML-MS-Etheris-123B y tres variantes Behemoth-Magnum al 0,20; familia D: Behemoth-X-R1-123B+T1 y Tess-R1-Ballad al 0,50; familia E: Writer-Large-2411-v2.1, Gigaberg-Mistral-Large-123B y Amaterasu-123B al 0,33). En el nivel 2 se combinan las familias con pesos A=1, B=0,6, C=0,6, D=0,5 y E=0,8, resolviendo empates por densidad 1.0.

Todos los componentes entrenados sobre Mistral-Large-Instruct-2411 se miden contra 2411 y su delta se traslada a la base 2407, lo que permite mezclar fine-tunes de ambas generaciones sin incoherencias de tokenizador ni de plantilla. La variante `lam` anade sobre cada peso un 0,3 × (2411 − 2407), inyectando parte del comportamiento de la version mas reciente. No se documentan datos de entrenamiento propios (numero de tokens, composicion del dataset, RLHF/DPO); las capacidades provienen integramente de los modelos base y de sus fine-tunes. La receta completa (todos los YAML de mergekit y `UNI_spec.yaml`) esta en la carpeta `recipe/` del repositorio, aunque el autor senala que no ha sido probada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Mistral-Large-Instruct y de los fine-tunes de rol.
- Escritura creativa y narrativa: la familia E incluye modelos orientados a escritura (Writer-Large, Gigaberg, Amaterasu) y la familia D incorpora modelos de razonamiento estilo R1 (Behemoth-X-R1, Tess-R1-Ballad).
- Razonamiento y respuesta a instrucciones: base Mistral-Large-Instruct-2407 y 2411.
- Soporte de plantilla de chat Mistral V7 y de los tokens especiales `[SYSTEM_PROMPT]` / `[/SYSTEM_PROMPT]` con el significado de la version 2411.
- Capacidades multilingues: no documentadas de forma especifica; las hereda de Mistral-Large, pero no se detallan idiomas.
- Tool calling / function calling: no documentado para este merge.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Generacion creativa y narrativa larga: el merge combina varios fine-tunes de escritura (familia E) con modelos de rol (familia A), lo que lo hace adecuado para redaccion de ficcion y dialogos con consistencia de personaje, siempre que se valide la calidad tras el merge.
- Roleplay y asistentes conversacionales: la presencia de Behemoth, Magnum y Monstral apunta a conversaciones multi-turno con estilo marcado; util para prototipos de chatbots de entretenimiento.
- Razonamiento asistido por modelos R1: la familia D incorpora Behemoth-X-R1-123B+T1 y Tess-R1-Ballad, por lo que puede emplearse en tareas de razonamiento paso a paso y generacion de cadenas de pensamiento, previa evaluacion.
- Investigacion sobre tecnicas de merge: el repositorio incluye la receta completa en `recipe/`, lo que permite reproducir, modificar pesos de familia o cambiar la variante `lam` para estudiar el efecto del re-basado 2411→2407.
- Experimentos de destilacion de comportamiento entre generaciones: el ajuste +0,3 × (2411 − 2407) sirve como caso de estudio de transferencia de delta de tarea sobre una base fija.
- Generacion de texto en pipelines de transformers: al publicarse en safetensors con `library_name: transformers` y ser compatible con text-generation-inference, puede desplegarse en infraestructura estandar de inferencia, aunque su tamano exige hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la receta no ha sido probada ("Not tested yet"), por lo que no existen metricas de MMLU, HumanEval, GSM8K ni de evaluacion conversacional para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, unos 245 GB de pesos, lo que requiere al menos 2 GPU de 141 GB (H200) o 3-4 GPU de 80 GB (H100/A100) con tensor parallelism. En cuantizacion de 8 bits, aproximadamente 123 GB, viable en 2×H100 80 GB. En 4 bits, unos 62 GB, ajustable en una unica H100 80 GB o A100 80 GB.
- GPU recomendadas: H100 80 GB, H200 141 GB, A100 80 GB en configuracion multi-GPU. No cabe en GPU de consumo (RTX 4090 de 24 GB) ni siquiera en 4 bits sin offloading a CPU/RAM.
- Despliegue: transformers, text-generation-inference (el modelo declara `endpoints_compatible`) y, previsiblemente, vLLM con tensor parallelism. No se documentan versiones GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| experimental_merge_221126_redux_123B-lam030 | ~122,6 B | no disponible | MRL 0.1 | Hugging Face (0 descargas) | Merge experimental no evaluado |
| mistralai/Mistral-Large-Instruct-2407 | ~123 B | 128 K (segun documentacion de Mistral) | MRL 0.1 | Hugging Face, API Mistral | Modelo base oficial, evaluado |
| mistralai/Mistral-Large-Instruct-2411 | ~123 B | 128 K (segun documentacion de Mistral) | MRL 0.1 | Hugging Face, API Mistral | Version posterior del base oficial |
| TheDrummer/Behemoth-123B-v2.1 | ~123 B | no disponible | no disponible | Hugging Face | Fine-tune de rol, componente de la familia A |

La comparativa se limita a parametros y licencia porque no hay benchmarks publicados para el merge ni datos de contexto verificados en la informacion proporcionada. Frente a los modelos oficiales de Mistral, el merge no aporta garantias de evaluacion y anade el riesgo de degradacion por combinacion de pesos.

## Limitaciones y advertencias

- Modelo experimental: el autor declara que la receta no ha sido probada; no hay evaluacion de calidad, coherencia ni regresiones tras el merge.
- Riesgo de alucinacion: inherente a los modelos base de 123 B y no mitigado por el proceso de merge; sin benchmarks no puede acotarse.
- Sesgos: no documentados; los fine-tunes de rol y escritura pueden introducir sesgos de estilo y de personaje no analizados.
- Idiomas: no se especifican; se desconoce el soporte real multilingue tras la mezcla.
- Licencia MRL 0.1: restringe el uso comercial sin acuerdo con Mistral; el merge hereda las obligaciones del modelo base y debe revisarse antes de cualquier despliegue productivo.
- Contexto: no se documenta la longitud de ventana efectiva, por lo que no debe asumirse el contexto nativo de Mistral-Large.
- Tool calling y agentes: no documentados; no deberia asumirse su funcionamiento sin pruebas.
- Coste de inferencia: 122,6 B en FP16 exigen multi-GPU, lo que limita su uso a entornos con infraestructura dedicada.
- Repositorio de 245,2 GB: la descarga y el almacenamiento requieren planificacion; el modelo tiene 0 descargas y 0 likes, sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/alansmithee-cpu/experimental_merge_221126_redux_123B-lam030
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-Instruct-2407
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-Instruct-2411
- Componente: https://huggingface.co/TheDrummer/Behemoth-ReduX-123B-v1.1
- Componente: https://huggingface.co/TheDrummer/Behemoth-123B-v2.1
- Componente: https://huggingface.co/TheDrummer/Behemoth-X-123B-v2.2
- Componente: https://huggingface.co/anthracite-org/magnum-v4-123b
- Componente: https://huggingface.co/Doctor-Shotgun/ML2-123B-Magnum-Diamond
- Componente: https://huggingface.co/MarsupialAI/Monstral-123B-v2
- Componente: https://huggingface.co/SteelStorage/ML-MS-Etheris-123B
- Componente: https://huggingface.co/knifeayumu/Behemoth-v1.2-Magnum-v4-123B
- Componente: https://huggingface.co/knifeayumu/Behemoth-v1.1-Magnum-v4-123B
- Componente: https://huggingface.co/MidoriUnko/Behemoth-v2.2-Magnum-v4-123B
- Componente: https://huggingface.co/gghfez/Writer-Large-2411-v2.1
- Componente: https://huggingface.co/nbeerbower/Gigaberg-Mistral-Large-123B
- Componente: https://huggingface.co/Aratako/Amaterasu-123B
- Componente: https://huggingface.co/tacodevs/Behemoth-X-R1-123B
- Componente: https://huggingface.co/tacodevs/Behemoth-T1-v2-123B-LoRA
- Componente: https://huggingface.co/migtissera/Tess-R1-Ballad-Mistral-Large-2-123B
- Herramienta de merge: https://github.com/arcee-ai/mergekit

# lijie1228/liemo-0.8b

## Resumen

LiEmo 0.8B VL (烈模) es un modelo multimodal pequeno derivado de Qwen3.5-VL 0.8B mediante un ajuste fino con LoRA (r=8, alpha=16) posteriormente fusionado en los pesos base. Lo desarrolla el usuario independiente lijie1228 y esta orientado al mercado chino: su objetivo declarado no es competir en capacidad bruta, sino reconstruir y reforzar en un modelo diminuto habilidades que la base mostraba de forma deficiente, en concreto razonamiento matematico, consistencia de identidad, rechazo honesto ante preguntas sin respuesta y logica basica.

El modelo mantiene la arquitectura original `Qwen3_5ForConditionalGeneration` con torre visual, por lo que acepta entradas de imagen y texto (pipeline `image-text-to-text`). Con aproximadamente 1.027 millones de parametros reales en safetensors (el autor redondea a 1,1B incluyendo el encoder visual), es un candidato para despliegue en hardware muy modesto: las cuantizaciones GGUF Q4 rondan los 630 MB.

Su relevancia practica esta en el empaquetado: se distribuye simultaneamente en safetensors para reentrenamiento, en GGUF con `mmproj` para llama.cpp y con un `Modelfile` listo para Ollama, lo que permite ejecutar un VLM bilingue chino/ingles en CPU o en GPUs de gama baja. La licencia Apache-2.0 heredada del modelo base elimina friccion para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (Qwen3.5-VL, transformer multimodal con torre visual) |
| Parametros totales | 1.027.125.568 (safetensors); ~1,1B incluyendo torre visual segun el autor |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el autor indica que el rendimiento por encima de 4K tokens esta poco testeado |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_S, Q5_K_M, Q5_1, Q4_K_S, Q4_K_M, Q4_0, Q4_1 (publicadas); Q3_K_S, Q3_K_M y Q2_K mencionadas solo como referencia de degradacion |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (pesos completos), GGUF (texto + `mmproj` para vision), `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El modelo conserva integramente la arquitectura del base Qwen3.5-VL 0.8B: un transformer multimodal con un tower de vision que proyecta representaciones de imagen al espacio del modelo de lenguaje mediante un proyector (`mmproj` en la distribucion GGUF). No hay innovaciones arquitectonicas propias; el autor lo describe explicitamente como un derivado dentro del ecosistema Qwen3.5 y no como una arquitectura original. El ajuste se realizo con LoRA de rango 8 y alpha 16, y los adaptadores se fusionaron en los pesos finales, de modo que la inferencia no requiere cargar PEFT por separado.

El corpus de entrenamiento es pequeno y muy curado: aproximadamente 4.000 muestras en chino para reconstruir capacidades generales, unas 2.000 muestras de razonamiento, unas 800 de persona e identidad, 24 muestras de correccion matematica y un conjunto de respuestas estandar escritas a mano para seis dimensiones de evaluacion. No se documenta el uso de RLHF ni DPO, ni el volumen total de tokens vistos durante el ajuste. La torre visual no se reentreno: las capacidades de imagen son las heredadas del base.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento matematico de nivel basico-medio: el autor situa el techo en nivel de secundaria.
- Razonamiento logico y de sentido comun, reforzado respecto al base en la evaluacion interna del autor.
- Rechazo honesto: se entreno explicitamente para declinar responder cuando no dispone de informacion, en lugar de alucinar.
- Consistencia de identidad: mantiene de forma estable quien es y que modelo es a lo largo de la conversacion.
- Comprension de imagen y texto (VLM): descripcion de imagenes y respuesta a preguntas sobre contenido visual, con la calidad del base sin ajuste adicional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor advierte que el razonamiento multi-paso complejo falla por el tamano reducido.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Asistente conversacional local en chino: el modelo puede ejecutarse en Ollama o llama.cpp en una maquina sin GPU dedicada gracias a sus ~630 MB en Q4_K_S, lo que lo hace adecuado para prototipos de chatbot en entornos con hardware limitado.
- Tutoria de matematicas de secundaria: dado que el ajuste se centro en corregir errores aritmeticos y de planteamiento, encaja en aplicaciones de resolucion guiada de problemas escolares, siempre con verificacion humana.
- Filtro de rechazo en pipelines RAG: su mejora en honestidad (de 2/6 a 5/6 en la evaluacion del autor) permite usarlo como capa que detecta preguntas fuera de alcance antes de escalar a un modelo mayor, reduciendo coste.
- Descripcion de imagenes en movil o edge: al requerir el par texto + `mmproj` en llama.cpp, puede desplegarse en dispositivos con pocos recursos para alt-text automatico o moderacion visual basica.
- Preservacion de personaje en asistentes de marca: las ~800 muestras de identidad permiten mantener un rol consistente en productos de acompanamiento o ficcion interactiva sin que el modelo derive hacia respuestas genericas.
- Base para ajustes posteriores en chino: al publicarse los safetensors completos y con licencia Apache-2.0, sirve como punto de partida economico para fine-tunes de dominio en un solo GPU consumer.
- Evaluacion comparativa de tecnicas de cuantizacion: el autor documenta el impacto de cada nivel (Q4 en adelante sin perdida, Q2_K inutilizable), lo que lo convierte en un banco de pruebas util para medir degradacion en modelos pequenos.

## Benchmarks y rendimiento

Los unicos datos disponibles son la evaluacion interna del autor: 45 preguntas repartidas en 6 dimensiones, con voto mayoritario sobre 3 muestras por pregunta.

| Dimension | Base Qwen3.5-VL 0.8B | LiEmo 0.8B VL |
|---|---|---|
| Matematicas | 8/15 | 14/15 |
| Identidad | 6/6 | 6/6 |
| Sentido comun | 5/6 | 6/6 |
| Honestidad | 2/6 | 5/6 |
| Logica | 3/6 | 4/6 |
| Conocimiento | 3/6 | 6/6 |
| **Total** | **27/45** | **41/45** |

Evaluacion de cuantizacion (12 preguntas x 3 rondas, voto mayoritario):

| Nivel | Puntuacion | Nota del autor |
|---|---|---|
| F16 | 12/12 | referencia |
| Q8_0, Q5_K, Q4_0, Q4_K_S, Q4_1 | 12/12 | sin perdida |
| Q4_K_M | 11/12 | perdida despreciable |
| Q3_K_S, Q3_K_M | 8/12 | degradacion notable |
| Q2_K | 0/12 | inutilizable |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MMMU) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 2 GB en F16 para el modelo de texto (~2 GB de pesos) mas el proyector visual; en Q4_K_S el fichero pesa 629 MB y en Q8_0 1.053 MB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningun cuello de botella. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las graficas de los ultimos diez anos, e incluso en placas integradas con suficiente RAM compartida.
- Opciones de despliegue: Ollama (via `Modelfile` incluido), llama.cpp (`llama-cli` para texto, `llama-server` con `--mmproj` para imagen), Transformers con `AutoModelForCausalLM` en bfloat16 para reentrenamiento o inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiEmo 0.8B VL | ~1,03B (1,1B con vision) | no disponible | Si (imagen + texto) | Apache-2.0 | HF, GGUF, Ollama |
| Qwen3.5-VL 0.8B (base) | ~0,8B + torre visual | no disponible | Si | Apache-2.0 | HF |
| Otros VLM sub-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion natural es contra el propio modelo base: LiEmo mejora de forma medible en matematicas (+6 sobre 15) y honestidad (+3 sobre 6) segun la evaluacion del autor, pero no aporta mejoras en vision ni en contexto largo. Frente a alternativas de otros fabricantes en el rango sub-1B no se dispone de datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor reconoce que el razonamiento multi-paso complejo falla por el tamano del modelo; no es adecuado para tareas analiticas encadenadas.
- La capacidad matematica esta acotada a nivel de secundaria; no debe usarse para calculo financiero, cientifico o verificacion contable.
- La torre visual no se ajusto: la comprension de imagenes es la del base y puede ser menos fiable en dominios especializados (documentos tecnicos, graficos densos, OCR de baja calidad).
- El rendimiento con contextos superiores a 4K tokens esta explicitamente poco testeado; no se recomienda para conversaciones largas o documentos extensos.
- Riesgo de alucinacion presente pese a la mejora en honestidad: 1 de cada 6 preguntas del set de honestidad seguia fallando en la evaluacion del autor.
- El corpus de entrenamiento es muy pequeno (~7.000 muestras en total) y exclusivamente en chino, lo que puede sesgar el estilo de respuesta y degradar el rendimiento en ingles respecto al base.
- Las cuantizaciones Q3 y Q2 destruyen las capacidades de honestidad y logica segun las mediciones del autor; deben evitarse en produccion.
- Modelo con cero descargas y cero likes en el momento de la consulta, sin validacion independiente de la comunidad; los unicos benchmarks son los del propio autor y no han sido replicados.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene verificar las condiciones del modelo base Qwen3.5-VL por si el derivado hereda restricciones adicionales no reflejadas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lijie1228/liemo-0.8b-vl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-VL
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen

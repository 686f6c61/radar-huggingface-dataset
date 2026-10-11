# h2oai/h2o-lightning-4b-gguf

## Resumen

H2O Lightning 4B GGUF es la distribución en formato GGUF del modelo h2oai/h2o-lightning-4b, publicada por H2O.ai. No se trata de una simple conversión de pesos: el paquete incorpora un runtime de decisión específico construido sobre llama.cpp, junto con un shim que expone una API de decisión con salidas nombradas (`choice`), booleanas (`noul`) y probabilidades ordenadas (`score`). El modelo base es un transformer denso de aproximadamente 4.205.751.296 parámetros (unos 4,2 mil millones), entrenado para tareas de decisión estructurada sobre texto e imágenes.

La relevancia de esta entrega está en que empaqueta pesos ya fusionados con el adaptador de decisión, de modo que no es posible desactivarlo para recuperar el modelo base original. Incorpora además un proyector de visión opcional (0,67 GB) que habilita decisiones sobre imágenes en modo rápido, mientras que el modo razonado es solo texto. El repositorio ocupa 29,6 GB e incluye variantes en BF16, Q8_0, Q5_K_M, Q4_K_M, IQ2_XXS e IQ1_M.

Según la información disponible, el modelo base maneja una ventana de contexto de 262.144 tokens, aunque el despliegue con llama.cpp incluido en este paquete limita la ejecución a una única ranura de 40.960 tokens, con truncado cabeza/cola del texto de estado a 32.000 tokens. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según el modelo base h2oai/h2o-lightning-4b), con runtime de decisión sobre llama.cpp |
| Parametros totales | 4.205.751.296 (unos 4,2 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Modelo base: 262.144 tokens (según fuente externa); despliegue llama.cpp incluido: una ranura de 40.960 tokens; texto de estado limitado a 32.000 tokens con truncado cabeza/cola |
| Tipos de cuantizacion | BF16 (8,42 GB), Q8_0 (4,48 GB), Q5_K_M (3,07 GB / 3,82 GB con embeddings BF16), Q4_K_M (2,71 GB / 3,46 GB con embeddings BF16), IQ2_XXS (1,54 GB), IQ1_M (1,43 GB); proyector de visión (0,67 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de aproximadamente 4,2 mil millones de parámetros orientado a decisiones estructuradas, taggeado en HuggingFace como `decision-model`. Esta variante GGUF emplea pesos con el adaptador de decisión ya fusionado, lo que implica una diferencia funcional importante: los archivos no permiten recuperar el modelo base original desactivando dicho adaptador. El entrenamiento y los benchmarks generales se describen en la model card del modelo base, no en este paquete.

La innovación técnica del paquete reside en el runtime de decisión sobre llama.cpp y en el shim asociado. Este aplica la normalización obligatoria del tokenizador Qwen2/NFC y gestiona el escapado de cadenas de control reservadas. El despliegue nativo utiliza llama.cpp fijado en el commit `10a60cf303566e10d6a7a2774c17d2085503d87b`, con verificación de procedencia y 24 sondas de tokenizador. La inferencia funciona con una sola ranura de 40.960 tokens, de modo que las peticiones concurrentes se encolan en serie. Existe además un modo cliente opcional (`reasoned`) que añade hasta 256 tokens de análisis antes de repetir la decisión; se trata de inferencia adicional, no de aprendizaje.

## Capacidades

- Decisión estructurada: devuelve una opción nombrada (`choice`), un booleano verdadero/falso (`noul`) y probabilidades ordenadas (`score`) desde llama.cpp.
- Clasificación y enrutado: los 3.474 requests de enrutado de la comparativa de 4.074 peticiones fueron válidos.
- Visión en modo rápido: mediante el proyector opcional (0,67 GB) y la bandera `--experimental-images`, permite decisiones sobre imágenes. El modo razonado es solo texto.
- Modo razonado (texto): añade hasta 256 tokens de análisis antes de repetir la decisión, mejorando la precisión en el conjunto de prueba interno.
- Despliegue local nativo: se ejecuta sobre llama.cpp en CPU o CUDA, sin necesidad de login en HuggingFace.
- API compatible con endpoints: el tag `endpoints_compatible` indica integración con infraestructura HTTP estándar; el shim emite respuestas en `http://127.0.0.1:8761/v1/systemone`.
- Conversacional: etiquetado como `conversational`, aunque el chat ordinario con estos GGUF no implementa la API de decisión.

## Casos de uso

- Enrutado de decisiones en pipelines de automatización: el modelo recibe un estado estructurado y devuelve una elección nombrada y probabilidades ordenadas, lo que permite aplicar umbrales de enrutado en sistemas de orquestación con validación de los 3.474 requests de enrutado documentados.
- Clasificación binaria con umbral: la salida booleana `noul` permite resolver preguntas de sí/no sobre estados de negocio (por ejemplo, "estado pagado vs. impagado") sin postprocesado de texto libre.
- Verificación sobre imágenes en modo rápido: con el proyector y `--experimental-images`, permite tareas de decisión visual (30/30 aciertos en el fixture sintético de desarrollo) para clasificaciones basadas en capturas o documentos escaneados.
- Tutor de decisiones de bajo coste en local: el paquete BF16 funciona en una RTX PRO 4500 Blackwell de 32 GB, lo que posibilita validaciones en estaciones de trabajo sin depender de API externa.
- Enrutado de consultas con estado largo: el texto de estado admite hasta 32.000 tokens con truncado cabeza/cola, útil para resumir decisiones sobre contextos extensos en una sola llamada.
- Modo razonado para mayor precisión: en la suite interna de 72 casos / 120 preguntas, BF16 pasó de 98 a 120 respuestas correctas y Q8 de 99 a 120, lo que lo hace adecuado para decisiones críticas donde se tolera mayor latencia.
- Servicio de decisión autoalojado con API HTTP: gracias al shim y a la compatibilidad con endpoints, se puede desplegar un servicio de decisión reproducible con logs locales en `lightning-llamacpp-logs/`.
- Sustitución de reglas heurísticas en sistemas de control: la combinación de `choice`, `noul` y `score` aporta tres vistas de la misma decisión y facilita auditoría de umbrales.

## Benchmarks y rendimiento

Texto: 231 preguntas públicas de JevBench (medido en RTX PRO 4500 Blackwell, 32 GB, peticiones en serie). Latencia excluye las primeras 10 peticiones; se miden 221.

| Runtime | Respuestas correctas | Latencia mediana | Latencia p95 |
|---|---:|---:|---:|
| vLLM BF16 (referencia) | 204/231 (88,31%) | 29,6 ms | 219,3 ms |
| llama.cpp BF16 | 205/231 (88,74%) | 166,2 ms | 545,4 ms |
| llama.cpp Q8_0 | 204/231 (88,31%) | 161,5 ms | 543,7 ms |

Imágenes: 30 preguntas sintéticas de desarrollo. Fixture pequeño que reutiliza imágenes; no equivale al ImageJevBench público de ocho preguntas. Excluye la primera petición por variante (29 medidas).

| Runtime | Respuestas correctas | Latencia mediana | Latencia p95 |
|---|---:|---:|---:|
| llama.cpp BF16 + proyector de visión | 30/30 (100%) | 193,3 ms | 204,3 ms |
| llama.cpp Q8_0 + proyector de visión | 30/30 (100%) | 189,8 ms | 200,9 ms |

Comparativa ampliada de 4.074 peticiones de texto: llama.cpp BF16 y Q8_0 coincidieron con la respuesta principal de la referencia vLLM en el 99,558% y el 98,699% de los casos respectivamente. Todos los 3.474 requests de enrutado fueron válidos. La concordancia no es lo mismo que la precisión y los vectores de probabilidad pueden diferir. Modo razonado (suite interna de 72 casos / 120 preguntas, resultados de conjunto reutilizado): BF16 pasó de 98 a 120 respuestas correctas; Q8 de 99 a 120.

## Requisitos de hardware

- VRAM estimada para inferencia (BF16): aproximadamente 8,42 GB de pesos más memoria de runtime; la fuente externa cifra el modelo base a 16 bits en unos 10,9 GB.
- VRAM para Q8_0: 4,48 GB de pesos más runtime.
- VRAM para variantes experimentales: Q5_K_M 3,07 GB (3,82 GB con embeddings BF16), Q4_K_M 2,71 GB (3,46 GB con embeddings BF16), IQ2_XXS 1,54 GB e IQ1_M 1,43 GB.
- Proyector de visión: 0,67 GB adicionales.
- GPU recomendada por el autor: RTX PRO 4500 Blackwell de 32 GB para las mediciones publicadas; también compatible con CUDA en general (toolkit CUDA necesario para el backend CUDA).
- CPU: el arranque en un solo comando admite `--backend cpu`, de modo que el paquete puede ejecutarse sin GPU.
- Opciones de despliegue: llama.cpp (backend incluido, commit fijado `10a60cf303566e10d6a7a2774c17d2085503d87b`) y vLLM como referencia de comparación en BF16.
- Latencia medida (texto, llama.cpp BF16, RTX PRO 4500 Blackwell): mediana 166,2 ms, p95 545,4 ms. Q8_0: mediana 161,5 ms, p95 543,7 ms. vLLM BF16: mediana 29,6 ms, p95 219,3 ms.
- Concurrencia: el backend tiene una única ranura de 40.960 tokens; las peticiones concurrentes se encolan. No se establece throughput concurrente en los datos publicados.
- Compilación CUDA: la primera compilación tardó 35,79 minutos en la máquina de prueba con pesos en caché; las siguientes reutilizan el binario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| h2oai/h2o-lightning-4b-gguf | 4,2 mil millones | 40.960 tokens por ranura en llama.cpp (base hasta 262.144) | JevBench: 205/231 BF16, 204/231 Q8_0; imágenes 30/30 en fixture de desarrollo | Apache 2.0 | GGUF en HuggingFace, runtime llama.cpp propio |
| vLLM BF16 (referencia del propio autor) | 4,2 mil millones | No disponible | JevBench: 204/231 (88,31%), mediana 29,6 ms | No disponible | Referencia interna de comparación |
| h2oai/h2o-lightning-4b (modelo base) | 4,2 mil millones | 262.144 tokens (según fuente externa) | No disponible en detalle | Apache 2.0 | Peso original en HuggingFace |
| Otras conversiones GGUF de la familia Lightning 4B | No disponible | No disponible | No disponible | No disponible | Repositorios de terceros (por ejemplo, mradermacher), sin verificación de autor |

## Limitaciones y advertencias

- El paquete usa pesos con adaptador de decisión fusionado: no es posible desactivarlo para recuperar el modelo base original.
- El chat ordinario con estos GGUF no implementa la API de decisión; solo la ruta de decisión expuesta por el shim responde con `choice`, `noul` y `score`.
- La ejecución de llama.cpp se limita a una ranura de 40.960 tokens y encola peticiones concurrentes; no apto para cargas de alta concurrencia sin escalado horizontal.
- El texto de estado se trunca a 32.000 tokens con recorte cabeza/cola; el resto de sobrecarga de pregunta/instrucción debe caber en la ranura.
- Las llamadas directas a llama.cpp no aplican la normalización Qwen2/NFC del shim, por lo que pueden producir resultados divergentes.
- Las cuantizaciones Q5_K_M, Q4_K_M, IQ2_XXS e IQ1_M se marcan como experimentales y no pasaron las puertas de aceptación de texto, incluso las que usan embeddings BF16. Q8_0 y BF16 sí las superaron.
- El modo razonado solo funciona con texto; las imágenes requieren `--experimental-images` y el modo rápido de decisión.
- Los resultados de imágenes provienen de un fixture pequeño y sintético (30 preguntas, con imágenes reutilizadas) y no sustituyen al ImageJevBench público de ocho preguntas.
- Los números de latencia proceden de ejecuciones de desarrollo archivadas, no de un benchmark nuevo, y no establecen throughput concurrente.
- La concordancia del 99,558% / 98,699% con vLLM es concordancia, no precisión; los vectores de probabilidad pueden diferir y Q8_0 debería evaluarse con los umbrales reales de la aplicación.
- No se dispone de información sobre sesgos conocidos ni sobre idiomas soportados en la información proporcionada.
- Riesgo de alucinación: no cuantificado en esta model card; al tratarse de un modelo de decisión, las salidas probabilísticas deben validarse con umbrales propios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/h2oai/h2o-lightning-4b-gguf
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- Modelos cuantizados del base: https://huggingface.co/models?other=base_model:quantized:h2oai/h2o-lightning-4b
- Ficha externa de parámetros y contexto: https://savrn.com/models/h2o-lightning-4b
- Ficha externa de VRAM: https://llm-explorer.com/model/h2oai%2Fh2o-lightning-4b,2QNI28rhzrccqxxbdPB1Ad
- Conversión GGUF de terceros: https://free2aitools.com/model/mradermacher/h2o-lightning-4b-gguf

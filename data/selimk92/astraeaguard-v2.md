# selimk92/AstraeaGuard-V2

## Resumen

AstraeaGuard V2 es un clasificador binario experimental de prompt injection desarrollado por el usuario selimk92 y publicado en HuggingFace. El modelo no es un LLM generativo, sino un cabezal de clasificación entrenado sobre un encoder congelado: concretamente `google/embeddinggemma-300m`, del que toma embeddings de 768 dimensiones con una longitud máxima de secuencia de 512 tokens. Sobre esa representación se montan dos cabezales independientes entrenados por separado, uno denso y otro de mezcla de expertos dispersa (Sparse MoE), que emiten un logit binario donde 0 indica benigno y 1 indica ataque.

La relevancia del proyecto es acotada pero concreta: aborda una de las amenazas más activas en el despliegue de aplicaciones con LLM, la inyección de instrucciones maliciosas en entradas de usuario o en contenido recuperado por un pipeline RAG. El enfoque de reutilizar un encoder pequeño y congelado y entrenar únicamente cabezales de muy pocos parámetros (2.305 en el denso y 205.189 en el MoE) es economicamente atractivo para equipos que quieran añadir una capa de detección de bajo coste sin desplegar otro modelo grande.

Conviene subrayar desde el principio que se trata de un artefacto en fase de investigación. El propio autor lo declara no listo para producción, con validación sobre un conjunto de desarrollo de solo 31 ejemplos benignos y 82 de ataque, etiquetas débiles derivadas de la fuente y sin resultados de test independientes. La licencia de los cabezales no está elegida y el encoder queda sujeto a la licencia de Gemma de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer congelado (EmbeddingGemma-300M) + cabezal de clasificación binaria (denso o Sparse MoE) |
| Parametros totales | Encoder: 300M (no redistribuido); cabezal denso: 2.305; cabezal MoE: 205.189 |
| Parametros activos | MoE: 4 expertos con enrutamiento Top-2 sobre proyecciones 768→32→768 |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia del encoder) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Encoder sujeto a licencia Gemma de Google; licencia de los cabezales no seleccionada |
| Formato de pesos | safetensors (cabezales en PyTorch personalizado); encoder no redistribuido en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. Primero se ejecuta el encoder `google/embeddinggemma-300m` en su revisión fijada (`57c266a740f537b4dc058e1b0cda161fd15afa75`), congelado, con pooling y proyección nativos de SentenceTransformer, salida FP32 normalizada en L2 y dimensión de embedding de 768. El texto se prefija con `task: classification | query: ` antes de la codificación. Después, el vector resultante pasa por uno de los dos cabezales entrenables: el denso, compuesto por LayerNorm, Dropout y una capa Linear; o el MoE disperso, con cuatro expertos y enrutamiento Top-2 sobre proyecciones de 768 a 32 y de vuelta a 768.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; el autor solo indica que las etiquetas son débiles y derivadas de la fuente. La innovación técnica destacable es precisamente la economía del enfoque: entrenar únicamente miles de parámetros sobre un encoder congelado, lo que reduce drásticamente el coste de entrenamiento y el riesgo de sobreajuste en comparación con el ajuste completo. El repositorio no incluye los pesos del encoder, solo los cabezales y el código de modelado.

## Capacidades

- Clasificación binaria de prompt injection: distingue entre entrada benigna (etiqueta 0) y ataque (etiqueta 1) mediante un logit y una sigmoide.
- Detección sobre texto de hasta 512 tokens, suficiente para prompts de usuario y fragmentos de contexto recuperado.
- Dos variantes de cabezal con compromisos distintos: el denso es mínimo y rápido; el MoE añade capacidad de especialización con cuatro expertos y enrutamiento Top-2.
- Integración como etapa de filtrado previa a un LLM en pipelines de aplicación.
- No soporta generación de texto, tool calling, razonamiento multi-step, visión ni audio.
- Capacidades multilingües: no disponibles; dependen del encoder subyacente y no se documentan.
- Modo thinking: no aplica.

## Casos de uso

- Filtrado de entrada en aplicaciones de chat: colocar el clasificador antes del LLM para marcar prompts sospechosos de intentar sobrescribir instrucciones del sistema, usando el logit como señal de alerta en lugar de como bloqueo automático.
- Protección de pipelines RAG: clasificar cada fragmento recuperado antes de insertarlo en el contexto del modelo, de modo que un documento envenenado con instrucciones ocultas quede marcado para revisión.
- Shadow mode en producción: ejecutar el clasificador en paralelo al sistema real, registrando predicciones sin actuar sobre ellas, para acumular evidencia antes de decidir umbrales operativos.
- Investigación en seguridad de LLM: servir como línea base reproducible para comparar nuevas técnicas de detección de prompt injection sobre el mismo encoder congelado.
- Evaluación de benchmarks de seguridad: usar los cabezales como clasificador de referencia en conjuntos de datos de ataques y benignos, con la cautela de que sus métricas de desarrollo no son un test independiente.
- Detección de texto de log benigno con falsos positivos conocidos: útil en laboratorio para estudiar y caracterizar los falsos positivos sobre logs simples, un fenómeno que el autor documenta explícitamente.
- Prototipado rápido de capas de defensa: el reducido tamaño de los cabezales permite iterar sobre umbrales y configuraciones sin reentrenar el encoder.

## Benchmarks y rendimiento

Métricas de validación de desarrollo publicadas por el autor, con umbral 0,5, sobre 31 ejemplos benignos y 82 de ataque (etiquetas débiles derivadas de la fuente; no son resultados de test independientes):

| Metrica | Dense | MoE |
|---|---:|---:|
| Average Precision | 0,999401 | 1,000000 |
| ROC-AUC | 0,998426 | 1,000000 |
| F1 | 0,975309 | 0,993939 |
| Recall | 0,963415 | 1,000000 |
| FPR | 0,032258 | 0,032258 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de desarrollo. La muestra de validación es muy pequeña y el autor advierte que la selección del umbral no constituye una estimación independiente del rendimiento real.

## Requisitos de hardware

- VRAM estimada: el encoder de 300M ocupa aproximadamente 1,2 GB en FP32 y en torno a 0,6 GB en FP16; los cabezales añaden menos de 1 MB. El grueso del consumo es el encoder.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; una RTX 4090, A100 o H100 sobredimensionan ampliamente el modelo y permiten alto throughput por batching.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: el repositorio no es compatible con `AutoModelForSequenceClassification.from_pretrained`; requiere cargar `modeling_astraeaguard.py`, los `model.safetensors` correspondientes y ejecutar el encoder fijado antes de la clasificación. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AstraeaGuard V2 (Dense/MoE) | 300M encoder + 2.305 / 205.189 cabezal | 512 tokens | Clasificador binario sobre encoder congelado | Encoder Gemma; cabezales sin licencia | HuggingFace, 0 descargas |
| Llama Guard (familia) | 7B-8B | 4K-8K tokens | LLM generativo de moderación con etiquetas de categoría | Licencia Llama | Ampliamente desplegado |
| Prompt Guard (familia) | 86M-22M | 512-2K tokens | Clasificador BERT/MDeBERTa de inyección y jailbreak | Licencia permisiva | HuggingFace |

No se dispone de datos de benchmarks comparables en la información proporcionada para establecer una comparación cuantitativa con estas alternativas. La comparación cualitativa indica que AstraeaGuard V2 es el más ligero en parámetros entrenables y el más limitado en contexto y madurez de licencia.

## Limitaciones y advertencias

- Modelo en fase de investigación, declarado explícitamente no listo para producción por el autor.
- No validado para bloqueo autónomo de seguridad; su uso como barrera automática no está respaldado.
- Paridad de preprocesado y serialización no establecida para todos los formatos de entrada en vivo.
- Falsos positivos conocidos sobre texto de log benigno simple.
- Robustez fuera de distribución en investigación; no se han publicado resultados OOD.
- Las salidas sigmoides no están verificadas como probabilidades calibradas.
- Las etiquetas son débiles y derivadas de la fuente, por lo que pueden contener errores de etiquetado.
- La validación se realizó sobre 31 benignos y 82 ataques, una muestra insuficiente para estimar rendimiento real.
- Licencia de los cabezales sin seleccionar: no se debe asumir que exista derecho de redistribución.
- El encoder queda sujeto a la licencia de Gemma de Google, con las restricciones que esta impone.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- No es compatible con la carga estándar de `AutoModelForSequenceClassification`; requiere código y encoder específicos.

## Enlaces

- HuggingFace: https://huggingface.co/selimk92/AstraeaGuard-V2
- Encoder base: https://huggingface.co/google/embeddinggemma-300m (revisión fijada `57c266a740f537b4dc058e1b0cda161fd15afa75`)
- Código de modelado en el repositorio: `modeling_astraeaguard.py`
- Configuración y métricas por cabezal: `config.json` y `metrics.json` en cada subcarpeta del repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.

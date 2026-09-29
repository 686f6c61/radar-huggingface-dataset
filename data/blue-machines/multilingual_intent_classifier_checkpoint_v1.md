# blue-machines/Multilingual_Intent_Classifier_checkpoint_v1

## Resumen

Multilingual_Intent_Classifier_checkpoint_v1 es un checkpoint de PyTorch publicado por blue-machines que implementa un clasificador de intenciones multilingüe para diez idiomas: inglés, hindi, tamil, telugu, kannada, maratí, malayalam, bengalí, guyaratí y odia. El modelo deriva de google/gemma-3-270m mediante un proceso de destilación hacia un estudiante de 8 capas y 99.795.463 parámetros (unos 100 millones), con tamaño oculto 320, al que se añade un mean pooling sobre los estados del codificador y una cabeza lineal de clasificación.

El problema que resuelve es concreto y acotado: asignar cada intervención de un usuario a una de siete intenciones predefinidas (`provide_info`, `affirm`, `deny`, `correction`, `question`, `clarify_request`, `unclear`). Esto lo hace útil como pieza de enrutado en sistemas conversacionales, especialmente en mercados indios donde las mismas frases aparecen en escritura nativa, romanizada o mezclando idiomas en un mismo turno.

Su relevancia actual es doble. Por un lado, demuestra que se puede reducir un modelo Gemma 3 de 270 millones de parámetros a un clasificador de ~100 millones de parámetros que cabe en CPU y en GPUs de consumo. Por otro lado, este repositorio es únicamente el checkpoint de entrenamiento: el artefacto de despliegue en ONNX con cuantización INT8 vive en el repositorio Multilingual_Intent_classifier_v1. El modelo no genera texto ni soporta tool calling; es exclusivamente un clasificador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Gemma 3 (`gemma3_text`) truncado a 8 capas, tamaño oculto 320, con mean pooling sobre los estados del codificador y cabeza lineal de intención |
| Parametros totales | 99.795.463 (~100 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en safetensors sin cuantizar en este repositorio; el repositorio de despliegue ofrece un build ONNX en INT8 con la cabeza lineal de intención en FP32. No se documentan builds GGUF ni AWQ/GPTQ |
| Idiomas soportados | en, hi, ta, te, kn, mr, ml, bn, gu, or (texto en escritura nativa, romanizado o code-mixed) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (`model.safetensors`); ONNX INT8 en el repositorio de despliegue |
| Numero de capas | 8 |
| Tamano oculto | 320 |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | provide_info, affirm, deny, correction, question, clarify_request, unclear |
| Modelo base | google/gemma-3-270m |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un recorte del stack de texto de Gemma 3: se conservan 8 capas del decoder con tamaño oculto 320, muy por debajo de las 18 capas y las 640 unidades de dimensión del modelo base de 270 millones de parámetros. Sobre la salida del codificador se aplica un mean pooling, que produce un vector de frase, y ese vector alimenta una cabeza lineal que proyecta a las siete clases de intención. El nombre del script de entrenamiento referenciado por el autor (`train_intent_multilang_indic_gemma270m_8L_distill`) indica que se trata de un estudiante destilado a partir de google/gemma-3-270m, aunque el procedimiento exacto de destilación no se detalla en la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de ejemplos por idioma, ni sobre si se aplicaron técnicas de ajuste adicionales como RLHF o DPO. Tampoco se documenta la longitud de contexto que admite el estudiante, un dato relevante porque las 8 capas heredadas del modelo base pueden haber sido entrenadas con ventanas más largas, pero no hay confirmación al respecto. Un detalle de implementación importante es que la clase `Gemma3Intent8LStudent` no es construible mediante `AutoModel`; hay que cargarla desde el código de entrenamiento del autor e inyectar los pesos con `load_state_dict` en modo `strict=False`.

## Capacidades

- Clasificación de intención en siete categorías cerradas: `provide_info`, `affirm`, `deny`, `correction`, `question`, `clarify_request` y `unclear`.
- Cobertura multilingüe de diez idiomas: inglés, hindi, tamil, telugu, kannada, maratí, malayalam, bengalí, guyaratí y odia.
- Robustez ante entrada en escritura nativa, transliteración al alfabeto latino (romanizado) y mezcla de idiomas dentro de una misma intervención (code-mixed).
- Extracción de representaciones de frase mediante mean pooling, lo que permite reutilizar el encoder para similitud semántica o agrupamiento si se accede a los estados internos.
- Compatibilidad declarada con text-embeddings-inference y con endpoints compatibles del Hub, según las etiquetas del repositorio.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling: la salida es una distribución sobre siete clases.
- No dispone de modo de razonamiento (thinking), visión, audio ni capacidades de agente.
- No se documenta gestión de multi-turno ni memoria conversacional; cada clasificación es independiente.

## Casos de uso

- Enrutado en asistentes conversacionales: antes de invocar un LLM generativo, el clasificador etiqueta el turno del usuario como `question`, `clarify_request` o `provide_info`, lo que permite decidir si se debe responder, pedir aclaración o seguir recopilando datos de un formulario.
- Detección de correcciones y negaciones en formularios de recogida de datos: las clases `deny` y `correction` son las más críticas en diálogos de reserva, registro o verificación, donde una interpretación errónea invalida todo el flujo posterior.
- Sistemas de atención al cliente para el mercado indio: al cubrir diez idiomas con tolerancia a romanización y code-mixing, permite clasificar consultas escritas en hindi con palabras en inglés o en tamil transliterado sin necesidad de normalizar previamente el texto.
- Etiquetado y curado de datasets de diálogo: el modelo sirve como anotador automático de corpus conversacionales multilingües, generando etiquetas que después se revisan por humanos para entrenar modelos mayores.
- Analítica de conversaciones: agregar las intenciones detectadas permite medir qué porcentaje de usuarios pide aclaraciones, cuántos corrigen al sistema o cuántos confirman, y usar esos datos para priorizar mejoras del producto.
- Control de flujo y guardarraíles: la clase `unclear` actúa como señal para derivar a un agente humano o para reformular la pregunta, evitando que una entrada ambigua se procese como si fuera una respuesta válida.
- Preprocesado de bajo coste en producción: al ser un modelo de ~100 millones de parámetros, se puede ejecutar en CPU o en una GPU modesta como primer filtro antes de llamar a modelos generativos, reduciendo el coste por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, F1, exactitud por idioma ni comparaciones con clasificadores alternativos, y el repositorio no presenta cifras de evaluación. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 ocupan aproximadamente 0,4 GB (el repositorio completo pesa 0,4 GB) y el build ONNX INT8 en torno a 0,1 GB. En la práctica, la inferencia cabe holgadamente en menos de 1-2 GB de memoria, incluyendo activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 4 GB sirve. Para lotes grandes, una NVIDIA RTX 3060, RTX 4090, L4, A10 o superior ofrecen margen más que suficiente; el modelo no requiere A100 ni H100.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna, e incluso en iGPU y en CPU pura. Al tratarse de un modelo de 8 capas y 320 de dimensión oculta, la inferencia es viable en hardware muy limitado.
- Opciones de despliegue: Transformers (cargando la clase `Gemma3Intent8LStudent` desde el código de entrenamiento), ONNX Runtime para el build INT8 y text-embeddings-inference para el despliegue en endpoints compatibles con el Hub. No se documentan soportes de vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, y no existen pesos GGUF publicados.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Multilingual_Intent_Classifier_checkpoint_v1 | ~100 M | no disponible | 10 (en, hi, ta, te, kn, mr, ml, bn, gu, or) | gemma | no disponible |
| google/gemma-3-270m (modelo base) | 270 M | no disponible en esta ficha | multilingüe general | gemma | no disponible en esta ficha |
| xlm-roberta-base (alternativa típica de clasificación multilingüe) | ~278 M (dato público general, no verificado en la información proporcionada) | 512 tokens (dato público general, no verificado) | ~100 idiomas | MIT (dato público general, no verificado) | no disponible en esta ficha |
| mBERT / bert-base-multilingual-cased (alternativa típica) | ~178 M (dato público general, no verificado en la información proporcionada) | 512 tokens (dato público general, no verificado) | ~100 idiomas | Apache 2.0 (dato público general, no verificado) | no disponible en esta ficha |

No se dispone de comparaciones verificadas de rendimiento entre estas alternativas y el modelo de blue-machines. La ventaja diferencial objetiva de este checkpoint es su tamaño reducido, su especialización en intenciones de diálogo y su cobertura específica de idiomas indios con tolerancia a romanización y code-mixing; sus desventajas frente a las alternativas genéricas son la ausencia de una longitud de contexto declarada, la obligación de usar código personalizado para cargarlo y la falta de métricas publicadas.

## Limitaciones y advertencias

- El espacio de salida está cerrado a siete intenciones. Cualquier necesidad de clasificación fuera de ese conjunto requiere reentrenamiento de la cabeza.
- La model card no publica métricas de evaluación, ni precisión global ni desglose por idioma, por lo que se desconoce el rendimiento real en cada una de las diez lenguas cubiertas.
- No se han publicado detalles sobre sesgos del dataset de destilación, y en clasificación multilingüe es habitual un rendimiento desigual entre idiomas con más y menos recursos (por ejemplo, hindi frente a odia).
- Riesgo de error por cambio de dominio y por jerga específica: el modelo puede devolver `unclear` o una clase incorrecta ante vocabulario técnico, abreviaturas o ruido de transcripción de voz.
- Aunque se trata de un clasificador y no de un generador, existe riesgo de clasificación errónea silenciosa; conviene calibrar umbrales de confianza antes de usarlo como decisión automática.
- Requiere código personalizado: `AutoModel` no puede instanciar `Gemma3Intent8LStudent`, por lo que la integración depende de mantener el script de entrenamiento del autor. Un `load_state_dict` con `strict=False` puede ocultar pesos que no se cargan correctamente.
- La licencia es la de Gemma, no una licencia permisiva tipo Apache o MIT. Esto implica condiciones de uso, obligaciones de atribución y restricciones de uso comercial que deben revisarse antes de integrarlo en un producto.
- La longitud de contexto soportada no está documentada, lo que impide planificar entradas largas (párrafos completos, transcripciones extensas) sin pruebas previas.
- El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validación externa de la comunidad.
- Los pesos de este repositorio son el checkpoint de entrenamiento, no el artefacto de producción: para desplegar hay que usar el build ONNX INT8 del repositorio de despliegue.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/blue-machines/Multilingual_Intent_Classifier_checkpoint_v1
- Repositorio de despliegue (build ONNX INT8): https://huggingface.co/blue-machines/Multilingual_Intent_classifier_v1
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Documentación de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo. Los únicos enlaces recuperados corresponden a una empresa de servicios TI, a la entrada genérica del color azul en Wikipedia, a una tienda de cigarrillos electrónicos y al grupo musical Blue, por lo que no se incluyen como fuentes. No se han encontrado papers, blogs técnicos, demos ni repositorios adicionales asociados a este modelo.

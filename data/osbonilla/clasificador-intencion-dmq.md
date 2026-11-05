# osbonilla/clasificador-intencion-dmq

## Resumen

El clasificador de intención de reportes ciudadanos del Distrito Metropolitano de Quito (DMQ) es un ajuste fino de BETO (`dccuchile/bert-base-spanish-wwm-uncased`) orientado a una tarea de clasificación de texto multiclase con seis etiquetas: `queja`, `denuncia`, `solicitud`, `consulta`, `sugerencia` y `agradecimiento`. Lo desarrolla Oldrin Santiago Bonilla en el marco de una maestría en Ciencia de Datos de la Universidad San Francisco de Quito, y su propósito es distinguir qué pide el ciudadano en un reporte de Survey123, no solo el sentimiento del texto.

La motivación es operativa: una queja y una denuncia comparten polaridad negativa, pero requieren respuestas administrativas distintas (atención del servicio frente a control). El modelo se distribuye tanto en formato HuggingFace (safetensors, 109.855.494 parámetros, arquitectura BERT base) como empaquetado como `.dlpk` para las herramientas GeoAI de ArcGIS Pro, lo que facilita su integración en flujos de trabajo GIS municipales sin necesidad de infraestructura de inferencia propia.

Es relevante por su carácter aplicado y de dominio muy acotado: demuestra el uso de un transformer pequeño en español para una tarea administrativa concreta, con un coste de inferencia de 1,9 ms por texto. Su principal caveat es el entrenamiento exclusivo con 1.788 textos sintéticos generados por plantillas, lo que provoca una brecha notable entre el rendimiento en prueba sintética (F1 0,997) y en texto humano real (F1 0,77).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (BETO, español) |
| Parametros totales | 109.855.494 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT base: 512 tokens como referencia arquitectonica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | no disponible |
| Formato de pesos | safetensors; paquete `.dlpk` para ArcGIS |
| Modelo base | dccuchile/bert-base-spanish-wwm-uncased |
| Tarea | text-classification (6 clases de intencion) |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

Se trata de un ajuste fino completo (fine-tuning) sobre BETO, un BERT base entrenado con whole word masking sobre corpus en español. La cabeza de clasificación produce seis etiquetas de intención. No se documenta en la información disponible el número de épocas, la tasa de aprendizaje, el esquema de validación ni si se aplicó algún tipo de regularización o aumento de datos más allá de la generación por plantillas.

El dato de entrenamiento más relevante es la composición del corpus: 1.788 textos sintéticos generados con plantillas, orientados al vocabulario y los ejemplos de reportes de Quito. Esta decisión explica tanto el F1 casi perfecto en la prueba sintética (0,997) como la caída a 0,77 en la prueba con texto humano. No se menciona el uso de RLHF, DPO ni preferencias humanas, algo esperable en un clasificador de este tamaño y propósito.

## Capacidades

- Clasificación de texto multiclase en español con seis intenciones administrativas: queja, denuncia, solicitud, consulta, sugerencia y agradecimiento.
- Salida con etiqueta y puntuación de confianza por registro, apta para priorización y enrutado automático.
- Integración nativa con ArcGIS Pro mediante `.dlpk` y la herramienta GeoAI "Classify Text Using Deep Learning".
- Uso directo desde Python con `transformers.pipeline("text-classification")`.
- Inferencia rápida: 1,9 ms por texto según la model card.
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- **Enrutado automático de reportes ciudadanos**: cada reporte de Survey123 recibe una etiqueta de intención y se deriva al departamento correspondiente (servicio urbano para quejas, control para denuncias) sin intervención manual.
- **Priorización de denuncias ambientales**: el modelo permite separar denuncias de quejas en flujos de inspección de quebradas, escombros o vertidos, donde la respuesta administrativa es distinta.
- **Análisis de volumen por intención**: agregar las etiquetas por barrio, fecha o tipo de servicio para detectar patrones (por ejemplo, aumento de quejas de alumbrado en una zona) y alimentar cuadros de mando.
- **Integración en ArcGIS Pro para equipos GIS municipales**: cargar una capa de reportes, ejecutar la herramienta GeoAI con el `.dlpk` y obtener los campos `Intencion` y `confianza` sin escribir código.
- **Preclasificación en pipelines de atención al ciudadano**: usar el modelo como primer filtro barato (1,9 ms por texto) antes de un LLM más caro, reservando el modelo grande para los casos ambiguos.
- **Prototipado rápido de clasificadores administrativos**: servir como punto de partida para otros municipios que quieran adaptar la taxonomía de intenciones a su propio vocabulario mediante fine-tuning adicional.
- **Detección de agradecimientos para métricas de satisfacción**: identificar automáticamente los reportes de agradecimiento y usarlos como señal positiva en la evaluación de servicios.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo | F1 prueba sintética | F1 prueba humana | ms por texto |
|---|---|---|---|
| TF-IDF + regresión logística | 0,82 | 0,57 | 0,2 |
| BERT ajustado (este modelo) | 0,997 | 0,77 | 1,9 |
| Qwen 2.5 7B zero-shot | 0,79 | 0,86 | 1.135 |

La lectura clave es que el modelo supera ampliamente a la línea base TF-IDF en texto sintético y en texto humano, pero queda por debajo de Qwen 2.5 7B zero-shot en texto humano real (0,77 frente a 0,86), a cambio de una latencia tres órdenes de magnitud menor.

## Requisitos de hardware

- **VRAM estimada**: un BERT base de 110 M de parámetros ocupa aproximadamente 440 MB en fp32 y unos 220 MB en fp16; la inferencia puede ejecutarse en CPU sin problemas.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una T4 en cloud ofrecen latencias muy bajas. No se requiere A100 ni H100.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU con 2 GB o más de VRAM, y también en CPU.
- **Despliegue**: `transformers` con pipeline, TorchServe, FastAPI con ONNX Runtime, text-embeddings-inference (según tags), y ArcGIS Pro con las librerías de deep learning de Esri para el `.dlpk`.
- **Latencia y throughput**: 1,9 ms por texto según la model card; el throughput real depende del hardware y del tamaño de lote, pero no se publican cifras adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 humano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clasificador intención DMQ (este) | 109,9 M | no disponible | 0,77 | no disponible | HuggingFace + `.dlpk` |
| TF-IDF + regresión logística | no aplica | no aplica | 0,57 | no disponible | línea base propia |
| Qwen 2.5 7B zero-shot | 7 000 M aprox. | no disponible | 0,86 | no disponible | HuggingFace |

La comparativa se limita a los modelos reportados en la model card; no se dispone de datos de otros clasificadores de intención en español con los que contrastar directamente.

## Limitaciones y advertencias

- **Entrenamiento sintético**: los 1.788 textos se generaron con plantillas, lo que infla el F1 sintético (0,997) y provoca una caída a 0,77 en texto humano real.
- **Confusión denuncia/queja**: si el texto no contiene el verbo "denuncio" u otra marca explícita, el modelo tiende a clasificar como queja.
- **Sesgo geográfico y de vocabulario**: entrenado con ejemplos de Quito, Ecuador; su uso en otras ciudades requiere validación con muestras etiquetadas manualmente.
- **Licencia no especificada**: no se indica la licencia, por lo que el uso comercial queda en un limbo legal que conviene aclarar con el autor antes de producción.
- **Alcance limitado**: no es un modelo generativo ni de razonamiento; no soporta tool calling, agentes ni multimodalidad.
- **Riesgo de alucinación**: bajo en sentido estricto (es un clasificador), pero existe riesgo de etiquetas erróneas con confianza alta en textos ambiguos o fuera de dominio.
- **Dependencia de ArcGIS**: el flujo `.dlpk` requiere ArcGIS Pro 3.x con licencia Advanced y las librerías de deep learning de Esri, lo que limita su uso fuera del ecosistema Esri.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/osbonilla/clasificador-intencion-dmq
- Repositorio de código y metodología: https://github.com/osbonilla/clasificador-intencion-dmq
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-uncased
- Librerías de deep learning de ArcGIS: https://github.com/Esri/deep-learning-frameworks

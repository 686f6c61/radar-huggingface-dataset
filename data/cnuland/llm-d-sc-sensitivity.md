# cnuland/llm-d-sc-sensitivity

## Resumen

El modelo `cnuland/llm-d-sc-sensitivity` es un embedding de frases de 384 dimensiones, fine-tuned a partir de `sentence-transformers/all-MiniLM-L6-v2`, diseñado para separar niveles de sensibilidad de datos y servir como señal de enrutamiento en el proyecto `llm-d-sc` (un clasificador semántico para decidir si un prompt puede ser servido por un endpoint externo o debe permanecer en el clúster). En lugar de emitir una clase directamente, produce un embedding que se compara por similitud coseno contra anclas etiquetadas (`anchors.json`), lo que permite cambiar la taxonomía sin reentrenar.

El modelo clasifica los textos en cinco niveles: `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `REGULATED` y `NEVER_EGRESS`. Está pensado como una señal de enrutamiento, no como un control de seguridad definitivo. Con solo 22,7 millones de parámetros, es extremadamente ligero y puede ejecutarse en CPU con latencias de pocos milisegundos. Su relevancia actual radica en el creciente uso de modelos externos en producción, donde es crítico evitar la fuga de información sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM-L6-v2, 6 capas, 384 dimensiones) |
| Parametros totales | 22.713.216 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `all-MiniLM-L6-v2`, un encoder transformer compacto de 6 capas con 384 dimensiones de salida, optimizado para similitud semantica. Se fine-tuneo con `BatchAllTripletLoss` y muestreo de lotes agrupados por etiqueta (`group_by_label`), usando 495 ejemplos sinteticos, 20 epocas, batch size 16 y learning rate 2e-5. El pipeline de entrenamiento esta disponible en el repositorio `hello-chris-sr-finetuned`.

Un defecto conocido en el pipeline sintetico: los datos de entrenamiento capturaron los razonamientos del generador en lugar de los textos finales, por lo que las frases de entrenamiento son largas (175 tokens de media) y no representan prompts reales. A pesar de ello, el modelo rinde muy por encima del base porque el ranking por anclas depende de la geometria del espacio de embeddings, no de la distribucion de los textos de entrenamiento. La diferencia con un modelo equivalente entrenado con datos limpios (accuracy 0,9750) sugiere que corregir este defecto mejoraria el rendimiento.

## Capacidades

- Genera embeddings de frases de 384 dimensiones optimizados para similitud semantica.
- Clasifica textos en cinco niveles de sensibilidad mediante ranking de similitud coseno contra anclas etiquetadas.
- Soporta enrutamiento semantico: puede decidir si un prompt debe ser servido por un modelo externo o permanecer en infraestructura interna.
- No emite una clase directa; la taxonomia es reemplazable sin reentrenar (basta cambiar `anchors.json`).
- Funciona como señal de routing, no como control de seguridad autonomo.
- Capacidad multilingue: no disponible, solo ingles declarado.

## Casos de uso

- Enrutamiento de prompts en entornos empresariales: antes de enviar una consulta a un LLM externo (API de pago), el modelo evalúa si el prompt contiene datos `REGULATED` o `NEVER_EGRESS` y lo redirige a un modelo interno en el clúster.
- Filtrado de documentos internos: clasificar correos, wikis o runbooks en niveles de sensibilidad para aplicar políticas de acceso o retención.
- Prevención de exfiltración de credenciales: detectar prompts que contengan claves, tokens o secretos (`NEVER_EGRESS`) y bloquear su salida al exterior.
- Clasificación de tickets de soporte: separar consultas que contienen PII o PHI (`REGULATED`) de las que son de conocimiento general (`PUBLIC`) para priorizar su tratamiento.
- Auditoría de logs de interacción con LLMs: revisar históricos de prompts para identificar posibles fugas de información confidencial.
- Integración en pasarelas de API: como middleware que evalúa cada petición y decide si se permite el envío a un endpoint externo, con latencia p50 de 8,1 ms en CPU.

## Benchmarks y rendimiento

La model card incluye evaluacion sobre un conjunto de 75 prompts independientes (15 por nivel, 25 casos limite). El metodo es similitud coseno contra las anclas, media de los top 3 por nivel y argmax.

| Modelo | Accuracy | Macro F1 | Casos limite |
|---|---:|---:|---:|
| **llm-d-sc-sensitivity** | **0,8933** | **0,8928** | **0,7600** |
| `all-MiniLM-L6-v2` (base, mismas anclas) | 0,7067 | 0,6920 | 0,6400 |

Desglose por nivel:

| Nivel | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| PUBLIC | 0,929 | 0,867 | 0,897 | 15 |
| INTERNAL | 0,846 | 0,733 | 0,786 | 15 |
| CONFIDENTIAL | 0,778 | 0,933 | 0,848 | 15 |
| REGULATED | 0,933 | 0,933 | 0,933 | 15 |
| NEVER_EGRESS | 1,000 | 1,000 | 1,000 | 15 |

El nivel `NEVER_EGRESS` se separa perfectamente. El error residual se concentra en la frontera `INTERNAL`/`CONFIDENTIAL`, que depende de la politica organizativa. Los numeros fueron producidos en un entorno casero y no han sido reproducidos de forma independiente.

## Requisitos de hardware

- Inferencia en CPU: el modelo tiene 22,7 millones de parametros; en un Apple M-series (un solo hilo) la latencia de embed mas ranking es p50 8,1 ms y p99 12,9 ms.
- GPU: cabe en cualquier GPU consumer (RTX 3060 o superior) y en GPUs de datacenter. No requiere VRAM significativa; menos de 100 MB en fp32.
- Despliegue: compatible con `sentence-transformers` para integracion directa, y con `text-embeddings-inference` (mencionado en los tags). Puede servirse con vLLM, TGI u Ollama si se convierte a formato adecuado.
- Throughput: al ser un modelo pequeno, puede procesar cientos de peticiones por segundo en CPU moderna; en GPU el cuello de botella seria la red, no el computo.

## Comparativa con modelos similares

La unica comparacion disponible en la informacion es contra su modelo base `all-MiniLM-L6-v2`, que obtiene 0,7067 de accuracy frente a 0,8933 del modelo fine-tuned. No se proporcionan datos de otros modelos de embeddings pequenos como `all-mpnet-base-v2` o `bge-small-en-v1.5`. La comparacion con el base demuestra la mejora sustancial, pero no hay datos independientes para situarlo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha evaluado en otros idiomas.
- Entrenado con datos sinteticos defectuosos (el generador incluyo sus razonamientos en los textos de entrenamiento); no existe un conjunto de validacion etiquetado por humanos.
- La precision depende directamente de la calidad de las anclas (`anchors.json`); reemplazarlas cambia el comportamiento sin reentrenar.
- La sensibilidad es especifica de cada organizacion; las anclas incluidas codifican una politica razonable, pero no necesariamente la del usuario.
- No es un control de seguridad: es una senal de enrutamiento con una tasa de error medida. No debe usarse como unica barrera contra la exfiltracion de secretos.
- Los resultados de evaluacion provienen de un entorno casero y no han sido reproducidos de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cnuland/llm-d-sc-sensitivity
- Repositorio del clasificador semantico: https://github.com/llm-d-incubation/llm-d-semantic-classifier
- Pipeline de entrenamiento: https://github.com/cnuland/hello-chris-sr-finetuned

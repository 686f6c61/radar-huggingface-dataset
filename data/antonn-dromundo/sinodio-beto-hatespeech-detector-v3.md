# antonn-dromundo/SinOdio-BETO-HateSpeech-Detector-v3

## Resumen

SinOdio-BETO-HateSpeech-Detector-v3 es un clasificador binario de discurso de odio en espanol latinoamericano, construido sobre el encoder BETO (BERT en espanol) con 109.852.418 parametros. Lo desarrolla el autor independiente antonn-dromundo como parte del ecosistema DignityAI, orientado a detectar tanto discurso de odio explicito como formas sutiles y normalizadas de discriminacion. Se distribuye como un modelo de sequence classification de dos etiquetas (`LABEL_0` = no odio, `LABEL_1` = odio) bajo licencia Apache 2.0.

El modelo es relevante como caso de estudio de validacion metodologica: su model card documenta una reevaluacion externa (noviembre de 2026) en la que el propio autor reconoce que las metricas originales de noviembre de 2025 (exactitud 91,85%, F1 0,87) se midieron sobre un conjunto de test que repetia el 84% del entrenamiento. Las cifras reales en datos no vistos caen a 71% de exactitud y 0,686 de F1 macro en HateCheck-ES, y el autor advierte explicitamente de una tasa de falsas alarmas del 70-72% en frases inclusivas sobre raza y clase.

Por tanto, se trata de un modelo pequeno (0,4 GB de repo), de bajo coste de inferencia y util para demos, prototipado y exploracion con revision humana, pero no apto para moderacion automatica en produccion. Su interes tecnico esta en la documentacion honesta de la brecha entre validacion interna y externa en tareas de deteccion de odio en espanol.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BETO), con cabeza de clasificacion de secuencias |
| Parametros totales | 109.852.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a `max_length=128`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | espanol (variantes latinoamericanas: Chile, Mexico, Argentina, Colombia, Peru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BETO (BERT base en espanol) con cabeza de clasificacion binaria de secuencias (`AutoModelForSequenceClassification`). No hay innovaciones arquitectonicas: es un encoder estandar de 110M de parametros pensado para inferencia rapida en CPU o GPU de gama baja. El preprocesado recomendado en la model card trunca a 128 tokens, lo que sugiere que el entrenamiento se realizo con secuencias cortas.

El entrenamiento se hizo sobre el dataset `antonn-dromundo/SinOdio-LATAM-Regional-HateSpeech`, con ejemplos regionales de cinco paises latinoamericanos, y se evalua externamente con `Paul/hatecheck-spanish`. La model card no documenta el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO (no aplicable en un clasificador de este tipo). La innovacion destacable no esta en el modelo sino en el proceso de validacion: el autor publica un dataset de validacion (`DignityAI-Validacion`) y reconoce que las etiquetas del dataset de entrenamiento resultaron poco fiables, lo que explica en parte la degradacion en datos externos.

## Capacidades

- Clasificacion binaria de texto en espanol: devuelve `LABEL_0` (no odio) o `LABEL_1` (odio) con probabilidad asociada.
- Deteccion de discurso de odio explicito en espanol latinoamericano.
- Deteccion de formas sutiles o normalizadas de discriminacion (objetivo declarado, con rendimiento limitado segun la evaluacion externa).
- Comprension de jerga, modismos y expresiones regionales de Chile, Mexico, Argentina, Colombia y Peru.
- Integracion directa con `transformers` mediante `pipeline("text-classification")` o `AutoModelForSequenceClassification`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un clasificador puro, no un modelo generativo.
- Capacidad multilingue limitada al espanol; no se documenta soporte de otras lenguas.

## Casos de uso

- Demo interactiva de deteccion de odio: desplegar el modelo detras de una interfaz web para mostrar como un clasificador BETO de 110M parametros procesa frases en espanol latinoamericano en milisegundos, con aviso visible de revision humana.
- Anotacion asistida en investigacion: usar las predicciones como pre-etiquetado en un corpus de estudio, con doble anotacion humana posterior para corregir los falsos positivos en frases inclusivas.
- Filtro de primera pasada en pipelines de curación de datasets: descartar candidatos marcados como odio para revision manual, aprovechando el bajo coste de inferencia en CPU.
- Evaluacion comparativa de clasificadores en espanol: usar HateCheck-ES como banco de pruebas para medir exactitud y F1 macro frente a otros encoders (BETO de la UBA, XLM-R, etc.).
- Educacion y divulgacion sobre sesgos: mostrar en talleres como un modelo entrenado con etiquetas ruidosas produce un 70-72% de falsas alarmas en frases antirracistas o de inclusion, ilustrando la importancia de la validacion externa.
- Baseline ligero en entornos con recursos limitados: ejecutar en CPU o en una GPU consumer para prototipos internos donde no hay presupuesto para modelos generativos grandes, siempre con supervision humana.
- Investigacion sobre calibracion y ruido de etiquetas: analizar la brecha entre metricas internas (91,85% de exactitud) y externas (71%) como caso documentado de fuga de datos en el test set.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (evaluacion externa, noviembre de 2026):

| Benchmark | Metrica | SinOdio v3 | Referencia: BETO de la UBA |
|---|---|---:|---:|
| HateCheck-ES (`Paul/hatecheck-spanish`, test) | Exactitud | 0,712 | 0,67 |
| HateCheck-ES (`Paul/hatecheck-spanish`, test) | F1 macro | 0,686 | 0,64 |
| HateCheck-ES | Recall de odio / precision | 0,71 / 0,856 | 0,671 / 0,823 |
| DignityAI-Racismo (frases inclusivas) | Falsas alarmas | 70% | 9% |
| DignityAI-Clasismo (frases inclusivas) | Falsas alarmas | 72% | 0% |

Funcionalidades de HateCheck con peor rendimiento segun la model card: `negate_neg_nh` (45%), `spell_space_add_h` (51%), `spell_char_del_h` (54%), `spell_char_swap_h` (61%).

Metricas internas originales (noviembre de 2025, sobre un test que repetia el 84% del entrenamiento; no representativas de generalizacion): exactitud 91,85%, F1 0,8700, precision 0,8330, recall 0,9103. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (110M parametros x 4 bytes), mas activaciones; en la practica cabe en cualquier GPU con 1-2 GB libres.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso GPU integrada; tambien funciona en CPU sin problemas para lotes pequenos.
- Cabe holgadamente en GPU consumer: si, en todas las gamas actuales e incluso en hardware de gama baja.
- Opciones de despliegue: `transformers` (pipeline o `AutoModelForSequenceClassification`), TorchScript/ONNX para optimizacion, y servidores de inferencia tipo TGI o FastAPI con batching. No se documentan pesos GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de milisegundos por frase en GPU y decenas de milisegundos en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HateCheck-ES (exactitud / F1 macro) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SinOdio-BETO v3 | 109.852.418 | no disponible (truncado a 128 en ejemplo) | 0,712 / 0,686 | Apache 2.0 | HuggingFace |
| BETO de la UBA (referencia citada en la model card) | no disponible | no disponible | 0,67 / 0,64 | no disponible | no disponible en la informacion |
| BETO base (BERT en espanol) | ~110M | 512 | no evaluado en la model card | no disponible en la informacion | HuggingFace |
| XLM-R base | ~278M | 512 | no evaluado en la model card | no disponible en la informacion | HuggingFace |

Las alternativas BETO base y XLM-R base se incluyen como referencia de categoria (encoders multilingues/espanol), pero no hay resultados comparables publicados en la informacion disponible para HateCheck-ES.

## Limitaciones y advertencias

- Falsos positivos muy elevados en frases inclusivas: 70% en frases antirracistas (DignityAI-Racismo) y 72% en frases sobre clase (DignityAI-Clasismo), frente al 9% y 0% de la referencia BETO de la UBA. Marca como odio muchas frases que solo mencionan un grupo.
- Las metricas internas originales (91,85% de exactitud, F1 0,87) estan contaminadas por fuga de datos: el test repetia el 84% del entrenamiento. No deben usarse para justificar despliegues.
- El propio autor desaconseja el uso para moderacion automatica y recomienda limitarlo a demos y exploracion con revision humana.
- Las etiquetas del dataset de entrenamiento resultaron poco fiables segun la validacion publicada en `DignityAI-Validacion`, lo que limita el techo de rendimiento.
- Rendimiento bajo en negaciones y variantes ortograficas de HateCheck: `negate_neg_nh` (45%), `spell_space_add_h` (51%), `spell_char_del_h` (54%), `spell_char_swap_h` (61%).
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero si hay riesgo de clasificaciones erroneas con alta confianza, como muestra el ejemplo de la model card con frases inclusivas.
- Cobertura limitada al espanol latinoamericano (Chile, Mexico, Argentina, Colombia, Peru); el comportamiento en espanol de Espana u otras variantes no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones de calidad hacen inviable su uso en produccion sin supervision humana y auditoria adicional.
- El modelo lleva pocas descargas (10) y 1 like en HuggingFace; no hay evidencia de adopcion ni de validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/antonn-dromundo/SinOdio-BETO-HateSpeech-Detector-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/antonn-dromundo/SinOdio-LATAM-Regional-HateSpeech
- Dataset de validacion: https://huggingface.co/datasets/antonn-dromundo/DignityAI-Validacion
- Dataset de evaluacion externa (HateCheck en espanol): https://huggingface.co/datasets/Paul/hatecheck-spanish
- Proyecto DignityAI: https://sin-odio.vercel.app/dignityai
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

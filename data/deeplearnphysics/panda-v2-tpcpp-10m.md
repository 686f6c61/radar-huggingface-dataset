# DeepLearnPhysics/panda-v2.tpcpp-10m

## Resumen

panda-v2.tpcpp-10m es un codificador (encoder) auto-supervisado para nubes de puntos orientado a fisica de particulas, desarrollado por DeepLearnPhysics. Se ha preentrenado con el metodo de autodestilacion Panda V2 (`panda-ssl-v2m1`) sobre 1 millon de eventos del conjunto TPCpp-10M, simulados en la camara de proyeccion temporal (TPC) del experimento sPHENIX. Los pesos publicados corresponden al encoder del profesor EMA (media movil exponencial) al final del preentrenamiento.

El modelo no es un modelo de lenguaje: es un backbone de vision 3D para nubes de puntos con 53.415.792 parametros, empaquetado en safetensors y consumible mediante la libreria `pimm` (particle-imaging-models). Su salida es una representacion por punto de 1170 canales, pensada para alimentar tareas posteriores de reconstruccion y analisis de eventos en detectores de particulas.

Es relevante porque ofrece un backbone preentrenado de forma auto-supervisada especificamente para datos de TPC, un dominio donde escasean los modelos genericos y donde el etiquetado es costoso. El repositorio incluye 40 snapshots intermedios (cada 5208 pasos, equivalentes a 0,5M eventos), lo que permite estudiar la evolucion del preentrenamiento y elegir un punto de control distinto del final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de nubes de puntos (Panda V2, autodestilacion con profesor EMA); detalles internos de capas no disponibles |
| Parametros totales | 53.415.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de carga | pimm |
| Entrada | 4 caracteristicas por punto |
| Salida | 1170 canales por punto de entrada |
| Tamano del repositorio | 5,8 GB |
| Snapshots | `main` (final) y etiquetas `01-of-40` a `40-of-40` (cada 5208 pasos) |

## Arquitectura y entrenamiento

La arquitectura es un encoder de nubes de puntos del linaje Panda V2, entrenado mediante autodestilacion auto-supervisada: un profesor EMA genera objetivos y el estudiante aprende a reproducirlos. El checkpoint publicado es el encoder del profesor EMA. La salida de la etapa mas gruesa incluye su cadena de pooling; mediante `point.upcast().feat` se obtiene una fila por punto de entrada con 1170 canales.

El preentrenamiento se realizo sobre 1 millon de eventos de TPCpp-10M simulados en la TPC de sPHENIX, durante 20 epocas, lo que equivale a 208.334 pasos con tamano de lote 96. El repositorio conserva snapshots cada 5208 pasos (0,5M eventos), 40 en total. Cada punto de entrada tiene 4 caracteristicas y debe preprocesarse con las transformaciones de evaluacion definidas en `configs/panda/v2/finetune/_base_/datasets/sphenix.py` del repositorio `pimm`. No se detalla en la informacion disponible la composicion exacta del dataset ni el uso de tecnicas adicionales de ajuste.

## Capacidades

- Extraccion de caracteristicas auto-supervisadas de nubes de puntos de eventos de TPC, con una representacion de 1170 canales por punto.
- Generacion de embeddings por punto aptos para tareas posteriores de ajuste fino (clasificacion, regresion o segmentacion sobre eventos).
- Salida jerarquica: la etapa mas gruesa conserva su cadena de pooling y puede proyectarse de vuelta a la resolucion de los puntos de entrada con `upcast()`.
- Compatibilidad con FlashAttention y alternativa en backend `torch` (`attention_backend="torch"`) para GPUs sin FlashAttention.
- Seleccion de snapshots intermedios mediante `revision` para experimentar con distintos puntos del preentrenamiento.
- No dispone de generacion de texto, tool calling, razonamiento multi-paso ni capacidades multilingues: es un backbone de vision 3D especifico de dominio.

## Casos de uso

- Reconstruccion de trazas en TPC: usar los embeddings por punto como entrada a un cabezal de ajuste fino que agrupe puntos en trazas de particulas cargadas, aprovechando que el modelo se ha preentrenado con la geometria y la respuesta del detector sPHENIX.
- Clasificacion de eventos: agregar los 1170 canales por punto (por ejemplo, mediante pooling) y entrenar un clasificador ligero para discriminar tipos de evento o senales de interes en datos simulados.
- Segmentacion semantica de puntos: asignar cada punto del evento a una clase (traza, ruido, deposito electromagnetico) partiendo del backbone preentrenado en lugar de entrenar desde cero con datos etiquetados escasos.
- Etiquetado y filtrado previo en pipelines de simulacion: procesar grandes volumenes de eventos TPCpp-10M y priorizar los mas informativos antes de un analisis costoso, gracias a la representacion compacta por punto.
- Estudio de aprendizaje auto-supervisado: comparar los 40 snapshots publicados para analizar como evoluciona la calidad de las representaciones con el numero de eventos vistos, util en investigacion sobre metodos de autodestilacion.
- Transferencia a otros detectores de tipo TPC: ajustar el encoder preentrenado con un conjunto pequeno de datos de otro experimento, reduciendo la necesidad de simulacion masiva etiquetada.
- Generacion de caracteristicas para busquedas de similitud de eventos: indexar los embeddings agregados de cada evento para recuperar eventos morfologicamente parecidos en grandes campanas de simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 53,4 millones de parametros, los pesos en precision de 32 bits ocupan aproximadamente 0,21 GB y en 16 bits unos 0,11 GB, pero el consumo real depende del tamano del lote de puntos y de las activaciones intermedias.
- GPU recomendadas: el autor menciona el uso de FlashAttention cuando esta disponible, lo que apunta a GPUs Ampere o posteriores (A100, H100, RTX 30/40). En GPUs sin FlashAttention debe indicarse `attention_backend="torch"`.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con suficiente memoria para el lote de puntos; no se especifica el minimo.
- Opciones de despliegue: carga mediante `pimm.from_pretrained` con `device="cuda"`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros backbones de nubes de puntos para TPC ni resultados que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: entrenado con eventos simulados en la TPC de sPHENIX; su rendimiento fuera de esa geometria o con datos reales no esta documentado.
- Requiere preprocesar los puntos con las transformaciones exactas del repositorio `pimm`; un preprocesado distinto puede degradar las representaciones.
- No es un modelo generativo ni conversacional: no admite prompts de texto ni tool calling.
- Riesgo de sesgo de simulacion: si la simulacion no reproduce fielmente el detector real, las caracteristicas aprendidas pueden no transferirse.
- Licencia no disponible: debe confirmarse con el autor antes de cualquier uso comercial o redistribucion.
- Repositorio sin descargas ni likes en el momento de la consulta y sin pipeline declarado; la madurez y el soporte de la comunidad son limitados.
- El tamano del repositorio (5,8 GB) incluye los 40 snapshots, lo que exige planificar el almacenamiento si se descargan revisiones intermedias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2.tpcpp-10m
- Repositorio de la libreria pimm: https://github.com/DeepLearnPhysics/particle-imaging-models

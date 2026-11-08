# melon1891/shiori-bert-jp

## Resumen

shiori-bert-jp es un clasificador BERT en japones desarrollado por melon1891 (TAKUMI HIRAISHI) que detecta fronteras de tema en conversaciones de chat. Para cada limite entre dos frases, el modelo recibe las dos frases anteriores y las dos posteriores (con etiquetas de hablante) y devuelve tres clases: C0 (sin frontera), C1 (subtema dentro del tema actual) y C2+ (nuevo tema). Se trata de un modelo discriminativo, no generativo, construido sobre `tohoku-nlp/bert-base-japanese-v3` con 111.209.475 parametros y una ventana maxima de 256 tokens.

La relevancia del modelo reside en su metodo de construccion: se destilo a partir de etiquetas generadas por un LLM profesor (Claude Opus 5.5, con ejemplos etiquetados a mano) sobre 400 conversaciones sinteticas en japones generadas con Claude Sonnet 5.5 (14.744 fronteras). Segun la model card, el alumno alcanza un F1 medio de 0,770 en 5 semillas sobre un conjunto de evaluacion de 8 conversaciones (287 fronteras), practicamente a la par de su profesor (0,769), con unos 45 ms por frontera en CPU de escritorio.

Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a investigacion y uso recreativo en sistemas de dialogo. No es cargable con `AutoModelForSequenceClassification`: requiere el script `shiori_infer.py` incluido en el repositorio, y los datos de entrenamiento no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder) con cabeza lineal de 3 clases sobre el estado oculto de [CLS] |
| Parametros totales | 111.209.475 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (recorte asimetrico: ~126 tokens del lado previo y el resto del posterior) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint PyTorch convertido) |

## Arquitectura y entrenamiento

El modelo parte de `tohoku-nlp/bert-base-japanese-v3` (Apache-2.0) y anade una cabeza lineal de tres clases directamente sobre el estado oculto final de [CLS]; el pooler de BERT se conserva en los pesos pero no se utiliza. La entrada es una ventana de cuatro frases (dos antes y dos despues del limite) con etiquetas de hablante en formato de colono de ancho completo (`利用者：`, `相棒：`). El maximo es de 256 tokens, con recorte asimetrico que prioriza los ~126 tokens mas cercanos al limite en el lado previo.

El entrenamiento es una destilacion de conocimiento desde un LLM profesor: Claude Opus 5.5 etiqueto con C0-C3 todas las fronteras de 400 conversaciones sinteticas de charla cotidiana en japones generadas con Claude Sonnet 5.5 (dos personas conviviendo, 18-22 turnos, 3-4 temas, con cambios de tema sin marcadores explicitos y cambios a mitad de turno). Se hizo fine-tuning durante 8 epocas, learning rate 5e-5, batch 16, maximo 256 tokens y pesos de clase proporcionales a la frecuencia elevada a -0,5. Se entrenaron 5 semillas (0-4) en una unica RTX 2070; el repositorio publica la semilla 3. Las etiquetas C3 originales (cierre y reinicio de conversacion) se agruparon en C2 por escasez, resultando en tres clases finales. Los datos de entrenamiento (conversaciones y etiquetas) no se han publicado.

## Capacidades

- Clasificacion de fronteras de tema en conversaciones de chat en japones con dos niveles de granularidad: frontera fina (P(C1) + P(C2+) >= 0,5) y frontera de tema (P(C2+) >= 0,5).
- Procesamiento de contexto conversacional con etiquetas de hablante y ventana de cuatro frases alrededor del limite.
- Prediccion anticipada: al mirar una frase mas alla del limite, permite decidir el limite anterior en cuanto llega una nueva frase, lo que habilita uso en streaming.
- Utilidad `split_sentences()` para dividir intervenciones con multiples frases segun las reglas de entrenamiento (cierre en `。！？!?` y parentesis de cierre posteriores).
- Mapeo configurable de hablantes (`speaker_map`) para adaptar nombres arbitrarios a las etiquetas `利用者` / `相棒` vistas en entrenamiento.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: es un clasificador discriminativo.

## Casos de uso

- Segmentacion de registros de conversacion: procesar transcripciones de chat y agrupar las intervenciones por tema usando la salida C2+ como marca de corte, lo que facilita la revision posterior y el resumen por bloques.
- Definicion de unidades de memoria en sistemas de dialogo: usar las fronteras de tema para decidir cuando cerrar una entrada de memoria episodica y abrir otra, evitando mezclar temas en un mismo recuerdo.
- Deteccion en streaming dentro de un chatbot: como el modelo mira una frase por delante, puede evaluar el limite previo en cuanto llega el siguiente mensaje, con ~45 ms por frontera en CPU de escritorio (Ryzen 9 3900X, 8 hilos).
- Enrutado de conversaciones hacia modulos especializados: al detectar un cambio de tema (C2+), derivar el turno a un subagente o base de conocimiento distinto del tema anterior.
- Analisis de calidad de dialogos sinteticos: aplicar el clasificador a conversaciones generadas para verificar que contienen cambios de tema realistas y no derivas tematicas no deseadas.
- Investigacion sobre destilacion de LLM a modelos pequenos: el modelo sirve como caso de estudio reproducible de destilacion de etiquetas de un LLM profesor a un encoder BERT de 111 M de parametros para una tarea estructurada.
- Preprocesado para resumen extractivo por temas: dividir primero el log en segmentos tematicos y aplicar despues un resumidor por bloque, reduciendo la longitud de contexto necesaria en el paso siguiente.

## Benchmarks y rendimiento

Evaluacion sobre 8 conversaciones nuevas (287 fronteras) etiquetadas a mano por un unico anotador, con metrica F1 de "frontera presente (C1 o superior) frente a ausente":

| Modelo | F1 |
|---|---|
| Esta configuracion (profesor Opus + ejemplos), media de 5 semillas | 0,770 (rango 0,756-0,790) |
| Este repositorio (semilla 3, la mejor de las 5) | 0,790 |
| Profesor: Claude Opus 5.5 con ejemplos etiquetados a mano | 0,769 |
| Referencia: Claude Sonnet 5.5 zero-shot (sin ejemplos) | 0,736 |

Velocidad: mediana de aproximadamente 45 ms por frontera en CPU (AMD Ryzen 9 3900X, 8 hilos), medida con un alumno de la misma construccion. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 111 M de parametros en fp32 el peso ocupa aproximadamente 0,45 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el autor entreno en una unica RTX 2070. Cualquier GPU con al menos 1-2 GB de memoria libre es suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier modelo actual (RTX 2070 o superior, e incluso integradas).
- Despliegue: el modelo no es cargable con `AutoModelForSequenceClassification`; requiere el script `shiori_infer.py` del repositorio con `torch`, `transformers`, `safetensors`, `huggingface_hub`, `fugashi` y `unidic-lite`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de clasificador).
- Latencia y throughput: aproximadamente 45 ms por frontera en CPU de escritorio (Ryzen 9 3900X, 8 hilos); no se publican cifras en GPU.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de segmentacion de temas en conversaciones japonesas. El autor advierte explicitamente de que este modelo no debe confundirse con `cl-nagoya/shioriha` (shioriha-large-pt, shioriha-large-reranker), que son modelos no relacionados a pesar de la similitud de nombre.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shiori-bert-jp (este) | 111 M | 256 tokens | Clasificacion de fronteras de tema en japones | Apache-2.0 | Hugging Face |
| Claude Opus 5.5 (profesor) | no disponible | no disponible | Etiquetado de fronteras via prompt | propietaria | API de Anthropic |
| Claude Sonnet 5.5 (referencia zero-shot) | no disponible | no disponible | Etiquetado de fronteras via prompt | propietaria | API de Anthropic |
| cl-nagoya/shioriha | no disponible | no disponible | No relacionado (advertencia del autor) | no disponible | Hugging Face |

## Limitaciones y advertencias

- Entrenado exclusivamente con conversaciones sinteticas generadas por LLM, mas ordenadas y con menos vacilaciones o digresiones que el habla real; la precision puede caer en conversaciones reales, con tres o mas participantes o en dominios distintos de la charla cotidiana.
- Solo japones y solo dialogos de dos hablantes con las etiquetas `利用者` / `相棒`; otros nombres requieren mapeo explicito y otros idiomas no estan soportados.
- El conjunto de evaluacion es muy pequeno (8 conversaciones, 287 fronteras) y esta etiquetado por un unico anotador, por lo que los intervalos de confianza son amplios y la diferencia con el profesor o con Sonnet no es distinguible del azar.
- Tendencia a segmentar en exceso: separa como subtemas lo que un humano considera un mismo tema y clasifica fronteras de tema como fronteras finas (C1); la mayoria de errores son de granularidad, no de posicion.
- Riesgo de alucinacion no aplicable en sentido generativo, pero las probabilidades de clase no deben interpretarse como calibracion fiable fuera del dominio de entrenamiento.
- Uso previsto restringido a investigacion y hobby; el autor desaconseja explicitamente emplearlo como base para evaluaciones o juicios sobre personas y reutilizar sus cifras como sustituto de un conjunto de evaluacion propio.
- Los datos de entrenamiento no se publican, lo que limita la reproducibilidad completa.
- Las conversaciones y etiquetas se generaron con Claude (Anthropic); el usuario debe cumplir los terminos de servicio de las herramientas que emplee.
- Licencia Apache-2.0 con atribucion y cambios documentados en `NOTICE`; las dependencias `fugashi` (MIT, MeCab BSD-3-Clause) y `unidic-lite` (codigo MIT o WTFPL, diccionario UniDic 2.1.2 BSD) no se incluyen en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/melon1891/shiori-bert-jp
- Perfil del autor: https://huggingface.co/melon1891
- Listado de modelos del autor: https://huggingface.co/melon1891/models
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
- Dependencia fugashi: https://pypi.org/project/fugashi/
- Dependencia unidic-lite: https://github.com/polm/unidic-lite
- Referencia bibliografica citada: 猫飼人, "AI キャラクター向けイベントセグメント検出モデルを作って検証してみた", 技術書典 21 (sin URL disponible)

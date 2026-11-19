# rostrumstudios/yamnet

## Resumen

YAMNet es un clasificador de eventos sonoros desarrollado originalmente por Google, que asigna a un fragmento de audio una de las 521 clases de la ontología AudioSet (voz, ladrido de perro, lluvia, guitarra, aplausos, etc.). Este repositorio concreto, publicado por rostrumstudios, no contiene el modelo original en TensorFlow, sino una exportación a ONNX generada con tf2onnx, acompañada del mapa de clases en CSV. El paquete está pensado para su descarga determinista: Rostrum fija un commit concreto y verifica el SHA-256 de cada fichero antes de usarlo.

El modelo resuelve el problema de etiquetado y búsqueda semántica sobre audio: identificar qué se oye y en qué momento de una grabación. Según la model card, se emplea exclusivamente para análisis, nunca para generación de audio, voz o imagen. Su relevancia práctica radica en que es una exportación ONNX ligera (unos 16 MB), con licencia Apache-2.0 y compatible con runtimes de inferencia estándar sin dependencia de TensorFlow.

No se dispone de información sobre arquitectura interna, número de parámetros, longitud de contexto ni datos de entrenamiento más allá de lo indicado en la model card. La ficha se limita a los datos verificables del repositorio y de las fuentes enlazadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para clasificación de audio (detalles internos no disponibles); exportación ONNX del modelo original de Google |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación por ventanas de audio, no generativo) |
| Tipos de cuantizacion | no disponible (se distribuye un único fichero `yamnet.onnx`) |
| Idiomas soportados | no disponible (clasificación de eventos sonoros, no ligado a idioma) |
| Licencia | Apache-2.0 (código y pesos); mapa de clases bajo CC BY-SA 4.0 |
| Formato de pesos | ONNX (`yamnet.onnx`, 16.093.603 bytes) + CSV de mapa de clases (`yamnet_class_map.csv`, 14.096 bytes) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que YAMNet es el clasificador de eventos sonoros de Google para AudioSet, con 521 clases, y que este repositorio es una exportación a ONNX realizada con tf2onnx a partir de los ficheros originales. Los pesos proceden de la versión 1 del modelo de Google en Kaggle y el código de referencia está en el repositorio `tensorflow/models`, en `research/audioset/yamnet`.

No se dispone de información sobre el número de tokens o horas de audio de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia exportación ONNX, que permite ejecutar el modelo en runtimes compatibles sin TensorFlow. El repositorio incluye sumas SHA-256 de ambos ficheros para garantizar la integridad de la copia.

## Capacidades

- Clasificación de eventos sonoros en 521 clases de la ontología AudioSet (voz, ladrido de perro, lluvia, guitarra, aplausos, entre otras).
- Etiquetado temporal: según la model card, identifica qué se oye y en qué momento de una grabación.
- Búsqueda semántica sobre una biblioteca de sonidos a partir de las etiquetas generadas.
- Ejecución mediante runtime ONNX, sin dependencia de TensorFlow.
- Uso limitado a análisis: no genera audio, voz ni imagen.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de texto o visión.

## Casos de uso

- Etiquetado automático de archivos de audio: procesar una grabación con el modelo ONNX y obtener las clases AudioSet presentes, útil para organizar bibliotecas de sonido.
- Búsqueda semántica en bibliotecas de efectos de sonido: indexar cada fichero por sus etiquetas y permitir consultas del tipo "lluvia" o "aplausos" sin metadatos manuales.
- Anotación temporal de eventos: identificar en qué tramos de una grabación aparece cada sonido, según la funcionalidad descrita en la model card.
- Moderación o auditoría de contenido sonoro: detectar categorías concretas (por ejemplo, voz o determinados eventos) en flujos de audio para revisión posterior.
- Integración en aplicaciones de escritorio o móviles: el tamaño reducido del ONNX (unos 16 MB) y la ausencia de dependencia de TensorFlow facilitan su empaquetado en apps cliente.
- Verificación de integridad en pipelines de distribución de modelos: el repositorio publica SHA-256 de cada fichero, lo que permite fijar un commit y comprobar la copia antes de usarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el fichero ONNX ocupa 16.093.603 bytes, por lo que la huella en memoria es reducida en comparación con modelos generativos.
- GPU recomendadas: no disponible; al ser un modelo pequeño en formato ONNX, es previsible que funcione en GPU de gama baja, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: cualquier runtime compatible con ONNX (ONNX Runtime, entre otros); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|
| rostrumstudios/yamnet (este) | ONNX | 521 (AudioSet) | Apache-2.0 (pesos); CC BY-SA 4.0 (mapa de clases) | Hugging Face, copia fijada por commit |
| zeropointnine/yamnet-onnx | ONNX | 521 (AudioSet) | no disponible | Hugging Face (origen de los ficheros) |
| google/yamnet (Kaggle) | TensorFlow | 521 (AudioSet) | Apache-2.0 | Kaggle Models, versión 1 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de clasificación, no generativo: no produce audio, texto ni imágenes; cualquier uso fuera del etiquetado de audio queda fuera de su alcance.
- Sesgos conocidos: no documentados en la model card; al depender de la ontología AudioSet, hereda las limitaciones de cobertura y representación de dicha ontología.
- Riesgo de alucinación: no aplica en el sentido generativo, pero pueden producirse clasificaciones erróneas o etiquetas de baja confianza en audios ambiguos o con solapamiento de eventos.
- Limitaciones de contexto o idioma: no se documentan; el modelo clasifica eventos sonoros y no está ligado a un idioma concreto.
- Licencia: los pesos y el código son Apache-2.0, pero el mapa de clases (`yamnet_class_map.csv`) está bajo CC BY-SA 4.0, lo que impone obligaciones de atribución y compartición bajo la misma licencia si se redistribuye modificado.
- Repositorio de terceros: se trata de una copia publicada por rostrumstudios; conviene verificar el commit y las sumas SHA-256 antes de usarla en producción.
- Sin métricas publicadas: no hay benchmarks ni datos de latencia o throughput en la información disponible, lo que dificulta estimar su comportamiento en un despliegue concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rostrumstudios/yamnet
- Origen de los ficheros ONNX: https://huggingface.co/zeropointnine/yamnet-onnx
- Código original de Google (YAMNet): https://github.com/tensorflow/models/tree/master/research/audioset/yamnet
- Pesos originales en Kaggle: https://www.kaggle.com/models/google/yamnet
- Organización Rostrum en Hugging Face: https://huggingface.co/rostrumstudios

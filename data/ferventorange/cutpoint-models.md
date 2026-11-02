# FerventOrange/cutpoint-models

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un espejo (mirror) de los ficheros de pesos que la herramienta Cutpoint descarga durante su comando `cutpoint setup`. En concreto, aloja una copia sin modificar del modelo PANNs `Cnn14_DecisionLevelMax_mAP=0.385.pth`, un clasificador de audio preentrenado a gran escala para reconocimiento de patrones acusticos. El espejo existe porque la fuente original (el registro de Zenodo 10.5281/zenodo.3987831) puede ser muy lenta, segun indica el propio autor.

PANNs (Pretrained Audio Neural Networks) es una familia de redes convolucionales entrenadas sobre AudioSet por Qiuqiang Kong, Yin Cao, Turab Iqbal, Yuxuan Wang, Wenwu Wang y Mark D. Plumbley, publicada en IEEE/ACM TASLP 2020 (arXiv:1912.10211). El modelo concreto es la variante Cnn14 con salida a nivel de decision (DecisionLevelMax), que produce predicciones por clip y por ventana temporal, con un mAP reportado de 0,385 en el nombre del fichero.

Es relevante ahora para quien necesite desplegar Cutpoint de forma reproducible: el espejo garantiza la disponibilidad del peso exacto (con SHA-256 verificable) sin depender de la velocidad de Zenodo. No es un modelo generativo ni conversacional: es un extractor de embeddings y etiquetas de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (familia PANNs, variante Cnn14 con salida DecisionLevelMax) |
| Parametros totales | no disponible (el fichero de pesos ocupa 327.428.481 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de entrada tipo log-mel, tamano exacto no disponible) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pth` de precision original) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch `.pth` |

## Arquitectura y entrenamiento

Cnn14 es una red neuronal convolucional de 14 capas del proyecto PANNs, disenada para clasificacion de audio a partir de espectrogramas log-mel. La variante DecisionLevelMax agrega las predicciones a nivel de fotograma mediante un max pooling a nivel de decision, de modo que el modelo puede emitir etiquetas tanto para el clip completo como para segmentos temporales. El entrenamiento original se realizo sobre AudioSet, un corpus a gran escala de audio etiquetado con ontologia de eventos sonoros; los detalles exactos de composicion del dataset, numero de horas y regimen de aumento de datos no se recogen en la informacion disponible y deben consultarse en el paper arXiv:1912.10211.

El fichero alojado es una copia byte a byte del peso original de Zenodo, con SHA-256 `dd3b4043a87d4ec13df8082c0fcfee3fb5084151808e47e060987a95eabdd142`. No hay fine-tuning, RLHF ni modificacion alguna por parte del autor del espejo. La innovacion tecnica relevante es la propia de PANNs: transferencia de representaciones acusticas preentrenadas a tareas downstream de audio (etiquetado, deteccion de eventos, embeddings para recuperacion).

## Capacidades

- Clasificacion de audio multietiqueta sobre la ontologia de AudioSet (527 clases en el modelo original; confirmar en el paper).
- Prediccion a nivel de clip y a nivel de ventana temporal gracias a la cabeza DecisionLevelMax.
- Extraccion de embeddings acusticos reutilizables como features para tareas downstream (clasificacion de escenas, deteccion de eventos, segmentacion).
- Base para transfer learning en audio con pocos datos etiquetados.
- No soporta generacion de texto, razonamiento, codigo ni vision.
- No soporta tool calling, function calling ni comportamiento agentico.
- No es multilingue en sentido textual: opera sobre senal de audio independientemente del idioma hablado, aunque no transcribe voz.
- No dispone de modo thinking, audio generativo ni sintesis.

## Casos de uso

- Etiquetado automatico de archivos de audio: procesar un lote de grabaciones y asignar etiquetas de eventos sonoros (musica, trafico, voces, animales) usando la cabeza multietiqueta del modelo.
- Indexacion y busqueda de archivos sonoros: extraer embeddings con Cnn14 y construir un indice vectorial para recuperacion por similitud acustica en bibliotecas de efectos o podcasts.
- Deteccion de eventos en el tiempo: la salida DecisionLevelMax permite localizar que ocurre en cada ventana, util para monitorizacion de entornos (oficinas, calles, fabricas) con sensores de audio.
- Filtrado previo en pipelines de speech: descartar o etiquetar clips no relevantes (ruido, musica, silencio) antes de pasarlos a un sistema ASR, reduciendo coste computacional.
- Transfer learning para dominios especificos: congelar las capas convolucionales y entrenar una cabeza ligera para clasificacion de sonidos industriales, biomedicos o de fauna con datasets pequenos.
- Investigacion en percepcion acustica: usar el modelo como baseline reproducible en experimentos de reconocimiento de escenas o comparacion de arquitecturas, con peso verificable por hash.
- Despliegue offline con Cutpoint: instalar la herramienta y obtener el peso desde este espejo cuando el acceso a Zenodo sea lento o inestable.

## Benchmarks y rendimiento

El nombre del fichero incluye un mAP de 0,385, que corresponde al resultado reportado para esta variante en el paper de PANNs sobre AudioSet. No se dispone de la tabla completa de resultados en la informacion proporcionada.

| Metrica | Valor |
|---|---|
| mAP (AudioSet, segun nombre del fichero) | 0,385 |
| MMLU, HumanEval, GSM8K | no aplica (modelo de audio) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 327 MB de pesos en FP32, la inferencia en GPU requiere aproximadamente 1-2 GB incluyendo activaciones y buffers, dependiendo del tamano de lote y de la ventana de audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: inferencia nativa con PyTorch; el ecosistema PANNs ofrece scripts de inferencia; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PANNs Cnn14_DecisionLevelMax (este) | CNN de audio | no disponible (327 MB de pesos) | no aplica | CC BY 4.0 | Espejo en HuggingFace + Zenodo |
| Otras variantes PANNs (Cnn14, Wavegram, etc.) | CNN de audio | no disponible | no aplica | CC BY 4.0 | Zenodo |
| AST (Audio Spectrogram Transformer) | Transformer de audio | no disponible | no aplica | no disponible | HuggingFace |
| YAMNet | CNN de audio | no disponible | no aplica | Apache 2.0 | TensorFlow Hub |

La comparacion detallada de rendimiento entre estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe evaluarse con benchmarks de NLP.
- El mAP de 0,385 sobre AudioSet implica una precision moderada; habra falsos positivos y negativos en clases poco representadas.
- Sesgos derivados del dataset AudioSet: sobrerrepresentacion de ciertos eventos y desequilibrio entre clases, con posible degradacion en dominios acusticos alejados de YouTube.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es obligatorio citar a los autores originales y el paper.
- El repositorio es un espejo no oficial: la responsabilidad de integridad recae en el hash SHA-256 publicado; verificar antes de usar en produccion.
- No hay garantia de mantenimiento ni de actualizaciones por parte del autor del espejo.
- El formato `.pth` requiere PyTorch; no hay versiones GGUF ni ONNX publicadas en este repositorio.
- No dispone de documentacion de sesgos especificos ni de evaluaciones de robustez en la informacion proporcionada.

## Enlaces

- Repositorio del espejo: https://huggingface.co/FerventOrange/cutpoint-models
- Herramienta Cutpoint: https://github.com/FerventOrange/cutpoint
- Registro original en Zenodo: https://doi.org/10.5281/zenodo.3987831
- Paper PANNs: https://arxiv.org/abs/1912.10211
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

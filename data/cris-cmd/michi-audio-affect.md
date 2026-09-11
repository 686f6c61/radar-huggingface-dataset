# cris-cmd/michi-audio-affect

## Resumen

Michi Audio Affect es un clasificador de emocion vocal en habla inglesa desarrollado por el usuario cris-cmd como componente auxiliar del asistente conversacional Michi. El modelo toma audio mono a 16 kHz y lo etiqueta en seis categorias gruesas de tono vocal: anger (`ang`), disgust (`dis`), fear (`fea`), happiness (`hap`), neutral (`neu`) y sadness (`sad`). Su proposito declarado es actuar como senal secundaria de baja latencia para modular la presentacion de una conversacion, nunca para alterar estado de aplicacion (planes, precios, reservas) ni como diagnostico.

Tecnicamente no es un modelo entrenado de cero: parte del encoder `facebook/wav2vec2-base` congelado en la revision `0b5b8e8`, extrae el estado oculto medio (mean-pooled) de la capa 7 y entrena una cabeza de regresion logistica multinomial sobre el dataset `myleslinder/crema-d` (revision `8a11ae8`). El artefacto publicado es unicamente la exportacion ONNX con cuantizacion dinamica a int8, pensada para ejecutarse en el navegador o en Node mediante Transformers.js. El repositorio ocupa 0,1 GB y no contiene audio de entrenamiento.

Su relevancia practica esta en el nicho: es un ejemplo reproducible de pipeline "encoder congelado + cabeza ligera + export ONNX int8" para inferencia de emocion en el cliente, con receta de entrenamiento fijada por dependencias y revisiones. La validacion reportada alcanza un 78,2 % de exactitud en seis clases sobre una particion con actores disjuntos, aunque el propio autor advierte que es un resultado de seleccion de modelo (se eligio la mejor de 13 capas) y no una estimacion sobre un conjunto de test intacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder wav2vec2-base congelado (Transformer convolucional + atencion) mas cabeza de regresion logistica multinomial; exportado a ONNX |
| Parametros totales | Aproximadamente 95 M heredados del encoder `facebook/wav2vec2-base`; la cabeza es de tamano muy reducido. Recuento exacto del artefacto exportado: no disponible |
| Longitud de contexto | No aplica (clasificacion de audio). Entrada: habla mono a 16 kHz |
| Tipos de cuantizacion | int8 dinamica (exportacion ONNX); Transformers.js lo consume con `dtype: "q8"` |
| Idiomas soportados | Ingles (entrenado sobre habla actuada en ingles). Otros idiomas no evaluados |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX cuantizado a int8. No se indica la presencia de safetensors ni de pesos PyTorch en el repositorio |

## Arquitectura y entrenamiento

El modelo reutiliza `facebook/wav2vec2-base` como extractor de caracteristicas congelado (revision `0b5b8e8`). Sobre la representacion de audio, en lugar de fine-tuning completo, se aplica mean pooling al estado oculto de la capa 7 del encoder y se entrena una regresion logistica multinomial para las seis clases objetivo. El proceso de exportacion es `Wav2Vec2ForSequenceClassification` → ONNX → cuantizacion dinamica a int8. La receta de construccion, con dependencias y revisiones fijadas, esta en `scripts/train-audio-affect-head.py` dentro del repositorio Michi; el autor advierte que es repetible pero no garantiza artefactos identicos bit a bit entre sistemas operativos y hardware.

Los datos de entrenamiento provienen de `myleslinder/crema-d` (revision `8a11ae8`), derivado del corpus CREMA-D de habla emocional actuada en ingles. La particion es disjunta por actor: ocho actores quedan reservados para validacion y los dos actores usados como fixtures locales se excluyen del entrenamiento. No se menciona en la informacion disponible el uso de RLHF, DPO ni de un numero de tokens o composicion de dataset mas alla del propio corpus CREMA-D. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion) mas alla de la cuantizacion int8 del artefacto ONNX.

## Capacidades

- Clasificacion de emocion vocal en seis etiquetas gruesas a partir de audio mono a 16 kHz: `ang`, `dis`, `fea`, `hap`, `neu`, `sad`.
- Devuelve puntuaciones por clase (permite `top_k: null` para obtener el vector completo) y no solo la etiqueta ganadora, lo que facilita umbrales y fusion con otras senales.
- Inferencia en el cliente via Transformers.js, incluyendo entornos de navegador, sin necesidad de llamar a un servicio de modelos durante la conversacion (Michi fija una copia local en `models/affect/michi-audio-affect`).
- Integracion pensada como senal secundaria: el modelo se combina con emocion derivada del texto y reglas deterministas, y su salida no modifica estado de aplicacion.
- Capacidades multilingues: no disponibles; el modelo solo esta entrenado y descrito para habla inglesa.
- Tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision o audio generativo: no disponibles (es un clasificador de audio, no un modelo generativo).

## Casos de uso

- Modulacion de tono en asistentes conversacionales: el clasificador aporta una senal de tono vocal que se agrega a la emocion detectada en el texto; Michi la usa como pista de presentacion, por ejemplo para suavizar el registro de la respuesta, sin tocar estado de negocio.
- Enrutado hacia respuestas de escalado o contencion: si la clase dominante es `ang` (recall reportado del 95,5 %), el sistema puede activar plantillas de desescalada o sugerir atencion humana, siempre con confirmacion explicita del usuario.
- Analitica de calidad en soporte telefonico: procesar lotes de grabaciones a 16 kHz para agregar la distribucion de tono vocal por llamada y detectar conversaciones con carga emocional alta; al ser int8 y ~0,1 GB, se puede ejecutar en CPU dentro del mismo pipeline de ingesta.
- Investigacion y prototipado en reconocimiento de emocion en habla: sirve como linea base reproducible (encoder congelado, capa 7, regresion logistica) frente a la que comparar enfoques con fine-tuning completo.
- Preprocesado de datasets de audio: etiquetado automatico preliminar de clips de habla en ingles para filtrar, balancear o priorizar anotacion manual, aceptando la incertidumbre de las etiquetas gruesas.
- Demos y aplicaciones web sin backend de inferencia: con Transformers.js y `dtype: "q8"` el modelo corre en el navegador, util para prototipos de interfaz que reaccionan al tono de voz del usuario sin enviar audio a un servidor.
- Anotacion auxiliar en herramientas de accesibilidad: marcar el tono predominante de fragmentos de audio para generar subtitulos enriquecidos o resumenes de conversacion, siempre como sugerencia revisable y no como hecho sobre la persona.

## Benchmarks y rendimiento

Datos de validacion reportados en la model card. La exactitud de 78,2 % corresponde a la cabeza de regresion logistica antes de la exportacion a ONNX, sobre una particion de validacion con actores disjuntos que ademas se uso para seleccionar la mejor de 13 capas del encoder; el autor lo califica explicitamente como resultado de seleccion de modelo, no como estimacion sobre un test intacto. El artefacto cuantizado no ha sido evaluado sobre la particion de validacion completa.

| Metrica | Valor |
|---|---|
| Exactitud global (6 clases, validacion con actores disjuntos, pre-exportacion) | 78,2 % |
| Recall anger (`ang`) | 95,5 % |
| Recall disgust (`dis`) | 77,7 % |
| Recall fear (`fea`) | 63,4 % |
| Recall happiness (`hap`) | 73,2 % |
| Recall neutral (`neu`) | 93,8 % |
| Recall sadness (`sad`) | 67,9 % |
| Comparacion con modelos similares (MMLU, HumanEval, GSM8K u otros) | No aplica ni disponible: es un clasificador de audio |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en int8; el repositorio completo pesa 0,1 GB, de modo que el pico de memoria es muy reducido.
- GPU recomendadas: no requiere GPU. Funciona en CPU moderna; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) es mas que suficiente y no aporta ventajas relevantes frente a CPU para este tamano.
- Compatibilidad con GPU consumer: si, en todas las gamas; incluso es viable en moviles y navegadores mediante WebAssembly o WebGPU.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con `dtype: "q8"`, ONNX Runtime en Node o Python, y ejecucion en navegador. No se documenta soporte para vLLM, TGI o llama.cpp, que no estan orientados a este tipo de artefacto de clasificacion.
- Preprocesado requerido: audio mono a 16 kHz en un `Float32Array` de PCM.
- Latencia y throughput estimados: no disponibles. La model card describe el objetivo como "baja latencia" y senal secundaria, pero no publica mediciones de milisegundos por clip ni de clips por segundo.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relacionados con este modelo; los unicos enlaces recuperados corresponden a negocios y personas ajenas al proyecto. La comparativa se limita por tanto a alternativas estructuralmente equivalentes de la misma categoria (clasificacion de emocion en habla con encoder wav2vec2), para las que no se dispone de metricas verificadas en la informacion proporcionada.

| Modelo | Parametros | Contexto / entrada | Numero de clases | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| cris-cmd/michi-audio-affect | ~95 M (encoder wav2vec2-base) + cabeza logistica | Audio mono 16 kHz | 6 | Apache-2.0 | 78,2 % de exactitud en validacion con actores disjuntos (seleccion de modelo) |
| facebook/wav2vec2-base | ~95 M | Audio mono 16 kHz | No es clasificador (encoder base) | Apache-2.0 | No disponible |
| superb/wav2vec2-base-superb-er | ~95 M | Audio mono 16 kHz | 4 (IEMOCAP) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition | Orden de cientos de millones (variante large) | Audio mono 16 kHz | 7 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Entrenado exclusivamente con habla inglesa actuada y un conjunto reducido de frases fijas de CREMA-D; la generalizacion a habla espontanea es limitada.
- Las seis etiquetas son deliberadamente gruesas y no cubren la complejidad emocional natural; la distincion entre clases proximas es debil (recall de 63,4 % en `fea` y 67,9 % en `sad`).
- La exactitud de 78,2 % es un resultado de seleccion de modelo sobre la misma particion usada para elegir la capa 7; no procede de un test intacto. El artefacto ONNX int8 publicado no se ha evaluado sobre la particion de validacion completa.
- Rendimiento sensible al idioma, acento, calidad de microfono, ruido de fondo y estilo de habla. No hay evaluacion multilingue ni por subgrupo demografico.
- Riesgo de interpretacion indebida: el autor prohibe explicitamente usarlo para diagnosticar salud mental, inferir rasgos personales estables, tomar decisiones de alto impacto o tratar la emocion predicha como un hecho sobre la persona.
- Riesgo de alucinacion en el sentido de falsos positivos emocionales: una prediccion segura puede ser incorrecta; debe tratarse como pista incierta y combinarse con texto e intencion explicita del usuario.
- Licencia Apache-2.0 para el modelo exportado y para el encoder base, pero el dataset CREMA-D se distribuye bajo Open Database License con contenidos bajo Database Contents License; el cumplimiento de los terminos del dataset origen es responsabilidad del usuario.
- La receta de construccion fija dependencias y revisiones, pero no promete artefactos identicos bit a bit entre sistemas operativos y hardware.
- El repositorio no incluye audio de entrenamiento ni (segun la informacion disponible) pesos en safetensors, lo que dificulta la reproduccion en PyTorch sin reejecutar el script de entrenamiento.
- El modelo no modifica estado de aplicacion por diseno; cualquier uso que lo trate como fuente de verdad para acciones automatizadas contradice su uso previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cris-cmd/michi-audio-affect
- Repositorio del proyecto Michi: https://github.com/cris-cmd/michi
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Dataset de entrenamiento: https://huggingface.co/datasets/myleslinder/crema-d
- Corpus CREMA-D (referencia): Cao, H., Cooper, D. G., Keutmann, M. K., Gur, R. C., Nenkova, A. y Verma, R., "CREMA-D: Crowd-sourced Emotional Multimodal Actors Dataset", IEEE Transactions on Affective Computing, vol. 5, n. 4, pp. 377-390, 2014. DOI: https://doi.org/10.1109/TAFFC.2014.2336244
- Libreria de inferencia en cliente: https://github.com/huggingface/transformers.js
- Resultados de busqueda web: no se ha encontrado informacion relevante sobre este modelo; los enlaces recuperados no guardan relacion con el proyecto.

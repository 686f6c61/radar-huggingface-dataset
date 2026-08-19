# ai8shiro/deepfake-audio-wav2vec2-ONNX

## Resumen

Deepfake-Audio-Wav2Vec2 es un modelo de clasificacion de audio diseñado para detectar si una grabacion de voz es autentica (bonafide) o generada/manipulada por sistemas de sintesis de voz (spoof). El modelo se basa en la arquitectura wav2vec2-base de Facebook, un modelo de representacion de voz auto-supervisado, y se ha ajustado especificamente para la tarea de deteccion de deepfakes de audio. La version aqui descrita es una conversion a formato ONNX del modelo original de Vansh180, realizada para su uso con Transformers.js en entornos de navegador o Node.js.

El modelo resuelve un problema creciente de seguridad: la verificacion de autenticidad de audio en un contexto donde los sistemas de clonacion de voz y sintesis de voz son cada vez mas accesibles. Su relevancia actual radica en su aplicacion en pipelines de seguridad para sistemas de autenticacion por voz, verificacion de contenido multimedia y herramientas de investigacion anti-suplantacion. El modelo clasifica audio en dos clases (bonafide/spoof) y fue entrenado sobre un subconjunto balanceado del dataset ASVspoof 2021 PA, alcanzando una precision del 92,8% en el conjunto de evaluacion declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (base) |
| Parametros totales | no disponible (wav2vec2-base tiene ~95M, pero no se confirma para este modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, segmentos fijos de entrada) |
| Tipos de cuantizacion | no disponible (formato ONNX, cuantizacion no especificada) |
| Idiomas soportados | ingles (dataset ASVspoof 2021 PA en ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo se construye sobre facebook/wav2vec2-base, una arquitectura transformer pre-entrenada de forma auto-supervisada para representaciones de audio. La capa de clasificacion se anade sobre la representacion de la secuencia completa y se ajusta mediante fine-tuning supervisado para la tarea binaria de deteccion de deepfakes. El entrenamiento se realizo con el framework Hugging Face Transformers, utilizando el optimizador AdamW y funcion de perdida de entropia cruzada. Los datos de entrenamiento provienen de un subconjunto balanceado del dataset ASVspoof 2021 PA, que incluye grabaciones genuinas, audio manipulado y ataques de sintesis y reproduccion. El audio se procesa a una frecuencia de muestreo de 16 kHz con segmentos de duracion fija.

La conversion a ONNX se realizo automaticamente mediante el espacio de Hugging Face onnx-community/convert-to-onnx, lo que permite la ejecucion del modelo en entornos JavaScript a traves de Transformers.js sin necesidad de un backend de Python.

## Capacidades

- Clasificacion binaria de audio: distingue entre voz real (bonafide) y voz sintetica o manipulada (spoof).
- Deteccion de artefactos acusticos sutiles y patrones de habla sintetica que diferencian grabaciones genuinas de audio generado por IA.
- Inferencia en navegador y Node.js gracias al formato ONNX y la integracion con Transformers.js.
- Procesamiento de audio a 16 kHz, compatible con la mayoria de grabaciones de voz estandar.
- Salida con probabilidades por clase, lo que permite umbrales de decision configurables segun la aplicacion.

## Casos de uso

- Verificacion de autenticidad de audio en plataformas de contenido: el modelo puede integrarse en pipelines de moderacion para detectar clips de voz generados por IA antes de su publicacion, ayudando a combatir la desinformacion.
- Proteccion de sistemas de autenticacion por voz: en sistemas de biometria vocal, el modelo puede actuar como capa adicional de defensa contra ataques de reproduccion o clonacion de voz, analizando la autenticidad de la muestra antes de la verificacion de identidad.
- Herramientas de investigacion anti-suplantacion: investigadores en seguridad pueden utilizar el modelo para analizar corpus de audio y estudiar las caracteristicas acusticas de los deepfakes, contribuyendo al desarrollo de tecnicas de deteccion mas robustas.
- Auditoria de grabaciones en entornos legales: el modelo puede servir como herramienta de triaje para identificar grabaciones sospechosas de ser manipuladas en contextos judiciales o periodisticos, aunque no debe usarse como unica evidencia.
- Filtrado de audio en centros de atencion al cliente: integrado en sistemas de grabacion de llamadas, puede alertar sobre posibles suplantaciones de identidad en tiempo real, protegiendo a los usuarios de fraudes por voz.
- Deteccion de deepfakes en tiempo real en aplicaciones de videollamada: gracias a su formato ONNX y compatibilidad con Transformers.js, el modelo puede ejecutarse en el navegador para verificar la autenticidad del audio entrante en aplicaciones web de comunicacion.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluacion Balanced ASVspoof 2021 PA:

| Metrica | Valor |
|---|---|
| Accuracy | 92,8% |
| Precision | 89,7% |
| Recall | 88,0% |
| F1 Score | 88,4% (declarado en la model card; el model-index indica 0,924) |

Nota: existe una discrepancia entre el F1 declarado en la tabla de la model card (88,4%) y el valor del model-index (0,924). Se recomienda consultar la documentacion original del modelo base para aclarar esta diferencia.

No se han publicado comparaciones con otros modelos de deteccion de deepfakes en la informacion disponible.

## Requisitos de hardware

- El modelo en formato ONNX tiene un tamano de repositorio de 0,7 GB, lo que sugiere que puede ejecutarse en GPU con al menos 4 GB de VRAM o en CPU con suficiente RAM (se recomiendan 8 GB o mas).
- Al ser una conversion para Transformers.js, puede ejecutarse en el navegador mediante WebGPU o WebAssembly, aunque el rendimiento dependera del dispositivo.
- Para inferencia en produccion con Python, se puede utilizar el modelo base original (Vansh180/deepfake-audio-wav2vec2) con Hugging Face Transformers, o el formato ONNX con ONNX Runtime.
- Opciones de despliegue: Transformers.js (navegador/Node.js), ONNX Runtime (Python, C++, etc.), o el modelo base con vLLM/TGI si se adapta a un servidor de inferencia (aunque no es el caso tipico para clasificacion de audio).
- La latencia estimada no esta disponible, pero al ser un modelo wav2vec2-base, la inferencia en GPU es del orden de decenas de milisegundos por segmento de audio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Accuracy | Licencia | Formato |
|---|---|---|---|---|---|
| ai8shiro/deepfake-audio-wav2vec2-ONNX (este) | Wav2Vec2 base | ASVspoof 2021 PA (balanceado) | 92,8% | MIT | ONNX |
| Vansh180/deepfake-audio-wav2vec2 (modelo base) | Wav2Vec2 base | ASVspoof 2021 PA (balanceado) | 92,8% | MIT | PyTorch |
| Sara1708/deepfake-audio-wav2vec2 | Wav2Vec2 | ASVspoof 2019 | no disponible | Apache-2.0 | PyTorch |

La diferencia principal entre este modelo y el original de Vansh180 es el formato (ONNX vs PyTorch), lo que permite su uso en entornos JavaScript. El modelo de Sara1708 utiliza un dataset distinto (ASVspoof 2019) y una licencia Apache-2.0, por lo que no es directamente comparable en rendimiento.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con datos en ingles del dataset ASVspoof 2021 PA, por lo que su rendimiento puede degradarse con audio en otros idiomas o con acentos no representados en el dataset.
- La precision del 92,8% se obtuvo en un subconjunto balanceado del dataset; el rendimiento en datos del mundo real puede ser inferior, especialmente con ataques de nueva generacion no vistos durante el entrenamiento.
- El modelo no es infalible: los deepfakes de alta calidad pueden evadir la deteccion, y existe riesgo de falsos positivos (clasificar voz real como spoof) en condiciones de ruido o baja calidad de grabacion.
- La conversion a ONNX se realizo automaticamente y no se han publicado pruebas exhaustivas de paridad de resultados con el modelo PyTorch original.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantias; el autor no proporciona soporte ni responsabilidad por su uso en sistemas criticos.
- Para uso en produccion, se recomienda evaluar el modelo con datos propios y establecer umbrales de decision adecuados, ya que el umbral por defecto (0,5) puede no ser optimo para todas las aplicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai8shiro/deepfake-audio-wav2vec2-ONNX
- Modelo base original: https://huggingface.co/Vansh180/deepfake-audio-wav2vec2
- Modelo relacionado (Sara1708): https://huggingface.co/Sara1708/deepfake-audio-wav2vec2
- Documentacion de pipelines de Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AudioClassificationPipeline
- Espacio de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Proyecto de deteccion de deepfakes con Wav2Vec2 (referencia): https://github.com/garystafford/deepfake-voice-detection-public
- Proyecto de deteccion de deepfakes en tiempo real (referencia): https://github.com/neriasuissa/deepfake-audio-detection
- Paper sobre deteccion generalizable de deepfakes de audio: https://arxiv.org/abs/2507.01750

# AngryBear9019/wespeaker-resnet293-survivor-ft

## Resumen

WeSpeaker ResNet293 Survivor FT es un modelo de embeddings de hablante (speaker embedding) desarrollado por el usuario AngryBear9019 a partir del modelo base Wespeaker/wespeaker-voxceleb-resnet293-LM. Su funcion es convertir un fragmento de audio en un vector de 256 dimensiones que representa la identidad vocal del hablante, de modo que fragmentos del mismo hablante queden proximos en el espacio de embeddings y los de hablantes distintos queden alejados. No identifica personas por nombre: solo produce representaciones numericas comparables.

El modelo parte de la arquitectura ResNet293 del proyecto WeSpeaker, entrenada originalmente sobre VoxCeleb2, y ha sido afinado sobre ventanas de audio de 1 segundo extraidas del programa de television "Survivor", etiquetadas mediante subtitulos que nombran al hablante. El conjunto de afinamiento cubre 334 personas de 20 temporadas. El repositorio solo contiene los pesos (`avg_model.pt`, un state dict de PyTorch en el formato de WeSpeaker), sin audio ni subtitulos.

Su relevancia es acotada y muy especifica: se emplea en la etapa de "voces de temporada" de un pipeline de doblaje de video, para decidir que hablante pronuncia cada palabra. La mejora reportada por el autor en la tasa de error mismo-hablante/otro-hablante (del 25,0 % al 20,6 %) se ha medido unicamente sobre cinco episodios de una temporada (S51E01-E05), por lo que la generalizacion a otros materiales no esta validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet293 (red convolucional residual profunda, backbone de WeSpeaker) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventanas de audio de 1 segundo durante el entrenamiento |
| Tipos de cuantizacion | no disponible (pesos en precision original, PyTorch) |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch state dict (`avg_model.pt`, layout WeSpeaker) |
| Dimension del embedding | 256 |
| Modelo base | Wespeaker/wespeaker-voxceleb-resnet293-LM |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es una red convolucional residual ResNet293, el backbone de mayor profundidad de la familia WeSpeaker, originalmente entrenada sobre VoxCeleb2 para la tarea de verificacion de hablante. La salida del backbone se proyecta a un embedding de 256 dimensiones; en la carga del checkpoint que muestra la model card, la capa de proyeccion se descarta y se cargan unicamente los pesos del `resnet`. No se trata de un transformer ni de un modelo generativo: es un extractor de representaciones de audio.

El afinamiento se realizo sobre ventanas de 1 segundo centradas en cada palabra, etiquetadas con el hablante nombrado en los subtitulos del programa. El corpus de entrenamiento comprende 334 personas de 20 temporadas de "Survivor". No se documentan en la informacion disponible el numero total de horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos, funciones de perdida especificas (por ejemplo AAM-softmax) o estrategias de validacion cruzada. Tampoco se detalla el regimen de entrenamiento (epochs, learning rate, optimizador).

## Capacidades

- Extraccion de embeddings de hablante de 256 dimensiones a partir de audio.
- Verificacion de hablante: comparacion de dos fragmentos para decidir si pertenecen a la misma voz.
- Discriminacion entre hablantes dentro del dominio del programa "Survivor" (334 personas, 20 temporadas).
- Funcionamiento sobre ventanas cortas de aproximadamente 1 segundo, adecuado para asignar voz a nivel de palabra.
- Uso como componente en pipelines de diarizacion o de doblaje, no como modelo autonomo de identificacion.
- No realiza reconocimiento automatico del habla, no transcribe, no traduce y no genera texto.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidad multilingue: no disponible; el modelo esta etiquetado solo para ingles y entrenado sobre material en ingles.

## Casos de uso

- Doblaje automatizado de video: el modelo permite asignar cada palabra detectada por un ASR a un hablante concreto dentro de un episodio, alimentando la etapa de seleccion de voces del pipeline descrito por el autor.
- Diarizacion de programas de telerrealidad: al estar afinado sobre 20 temporadas de "Survivor", resulta adecuado para separar voces de concursantes y presentadores en material de ese formato, donde los modelos genericos suelen confundirse por solapamiento de musica y microfonos.
- Segmentacion de hablante en postproduccion: integrado con un detector de actividad vocal, permite etiquetar regiones de un montaje para revision manual por parte de editores de audio.
- Verificacion de identidad vocal en archivo audiovisual: comparar embeddings de fragmentos de un mismo participante a lo largo de varios episodios para agrupar apariciones.
- Construccion de clusters de voces por temporada: agrupar embeddings con tecnicas de clustering para obtener un mapa de participantes sin necesidad de etiquetas previas.
- Prototipado de sistemas de speaker recognition en dominios ruidosos: sirve como punto de partida para experimentar con afinamiento sobre material de television con condiciones acusticas adversas.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son la tasa de error mismo-hablante/otro-hablante medida sobre cinco episodios de una temporada (S51E01-E05):

| Prueba | Modelo base (stock) | Este modelo |
|---|---|---|
| Error mismo-hablante / otro-hablante | 25,0 % | 20,6 % |

No se han publicado resultados de benchmarks estandar (VoxCeleb EER, MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El autor advierte que las cifras proceden de un unico programa grabado con sus propios microfonos y musica, y que el rendimiento en otro material no fue evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB de VRAM en precision completa, y en CPU para inferencia por lotes pequenos.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 no suponen cuello de botella para este tamano de modelo.
- Cabe en GPU consumer: si, practicamente en cualquier modelo con 4 GB o mas de VRAM.
- Opciones de despliegue: inferencia directa con PyTorch usando `pyannote.audio.models.embedding.wespeaker.WeSpeakerResNet293` y el checkpoint `avg_model.pt`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AngryBear9019/wespeaker-resnet293-survivor-ft | ResNet293 afinada | 256 dim | VoxCeleb2 + 334 hablantes de Survivor | CC BY 4.0 | Hugging Face |
| Wespeaker/wespeaker-voxceleb-resnet293-LM | ResNet293 | 256 dim (segun modelo base) | VoxCeleb2 | no disponible en la informacion | Hugging Face |
| Otros modelos WeSpeaker (ResNet34, ECAPA-TDNN) | CNN | variable | VoxCeleb2 | no disponible en la informacion | Hugging Face / GitHub WeSpeaker |

La comparativa cuantitativa solo es posible frente al modelo base, con la mejora de 25,0 % a 20,6 % en la prueba descrita. No se dispone de datos para comparar con alternativas como ECAPA-TDNN o embeddings de pyannote en el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- El modelo no identifica personas por nombre ni contiene informacion nominal: solo genera vectores de voz.
- El rendimiento solo esta validado sobre cinco episodios de una temporada de "Survivor"; el propio autor advierte que en otro material cabe esperar resultados peores.
- Sesgos potenciales derivados del dominio de entrenamiento: 334 hablantes de un programa concreto, con microfonos, musica y condiciones acusticas especificas, lo que puede degradar la generalizacion a otros idiomas, acentos o entornos.
- Riesgo de confusion entre voces similares o en fragmentos muy cortos (ventanas de 1 segundo), donde la informacion acustica es limitada.
- El idioma declarado es unicamente ingles; no hay evidencia de funcionamiento en castellano u otros idiomas.
- La licencia CC BY 4.0 permite uso comercial con atribucion al autor y al proyecto WeSpeaker, pero el material de "Survivor" pertenece a sus titulares de derechos y el proyecto no esta afiliado a ellos; el uso del modelo sobre ese contenido puede estar sujeto a restricciones adicionales.
- El repositorio no incluye audio ni subtitulos, solo pesos, lo que limita la reproducibilidad del entrenamiento.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite instrucciones.

## Enlaces

- Hugging Face: https://huggingface.co/AngryBear9019/wespeaker-resnet293-survivor-ft
- Modelo base: https://huggingface.co/Wespeaker/wespeaker-voxceleb-resnet293-LM
- Proyecto WeSpeaker: https://github.com/wenet-e2e/wespeaker

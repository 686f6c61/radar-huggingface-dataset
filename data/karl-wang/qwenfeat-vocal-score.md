# karl-wang/QwenFeat-Vocal-Score

## Resumen

QwenFeat-Vocal-Score es un modelo multimodal de evaluacion de calidad vocal desarrollado por Zihao Wang y colaboradores en el marco del proyecto VocalVerse, presentado en el ACM International Conference on Multimedia 2025. El modelo aborda la evaluacion automatica de la popularidad del timbre de canto, una tarea subjetiva que tradicionalmente requiere juicio humano experto. Se apoya en QwenAudio como base y combina dos modulos: uno para generar comentarios descriptivos y puntuaciones (qwenaudio) y otro para puntuacion y ranking (audioscore).

El modelo se entrena con un conjunto de datos anotado por 165 evaluadores amateurs y dos entrenadores vocales profesionales, cubriendo cuatro dimensiones: timbre, respiracion, emocion y tecnica. Los pesos estan publicados en formato safetensors y el repositorio ocupa 40.5 GB, lo que sugiere un modelo de gran tamano, aunque no se especifican los parametros totales. Es relevante porque ofrece una solucion de codigo abierto para la evaluacion estetica del canto, un area poco explorada en la IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en QwenAudio (multimodal) con modulos adicionales para puntuacion y generacion de comentarios |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento y el paper estan en ingles, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible, pero se sabe que parte de QwenAudio, un modelo fundacional multimodal que procesa audio y texto. El sistema se compone de dos partes: un modulo basado en QwenAudio que genera comentarios textuales y puntuaciones, y un modulo adicional (audioscore) encargado de la puntuacion y el ranking. El entrenamiento se realizo con datos anotados por humanos: 165 anotadores amateurs proporcionaron puntuaciones MOS de agrado general, y dos entrenadores vocales profesionales anotaron cuatro dimensiones (timbre, respiracion, emocion y tecnica) con puntuaciones enteras de 1 a 5 y comentarios textuales. El conjunto de datos original incluye mas de 100.000 grabaciones a capella, de las cuales 10.000 pasaron un pre-filtrado y aproximadamente 1.000 fueron anotadas intensivamente por expertos. No se especifican detalles sobre el proceso de fine-tuning, el numero de tokens de entrenamiento ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Evaluacion multidimensional de interpretaciones vocales: puntua timbre, respiracion, emocion y tecnica en una escala de 1 a 5.
- Generacion de comentarios descriptivos en texto, basados en las anotaciones de entrenadores vocales profesionales.
- Puntuacion global de agrado (MOS) basada en consenso de anotadores amateurs.
- Capacidad de ranking entre multiples grabaciones, gracias al modulo audioscore.
- Procesamiento de audio a capella (sin acompañamiento instrumental), segun el tipo de datos de entrenamiento.
- No se mencionan capacidades de tool calling, agentes, vision o soporte multilingue.

## Casos de uso

- Evaluacion de audiciones de canto en plataformas de talento: el modelo puede puntuar automaticamente las grabaciones de los candidatos en las cuatro dimensiones y generar comentarios que los jueces puedan revisar.
- Retroalimentacion para cantantes en formacion: un estudiante puede subir su grabacion y recibir una puntuacion detallada junto con sugerencias textuales sobre su timbre, control de respiracion, expresion emocional y tecnica.
- Control de calidad en estudios de grabacion: productores pueden usar el modelo para comparar diferentes tomas de una misma cancion y seleccionar la mejor segun criterios esteticos consistentes.
- Investigacion en estetica computacional de la musica: el modelo sirve como herramienta para estudiar que caracteristicas del timbre vocal se correlacionan con la preferencia del publico.
- Moderacion de contenido en plataformas de karaoke o redes sociales: se puede integrar para filtrar o clasificar interpretaciones vocales segun su calidad percibida.
- Generacion de criticas musicales automatizadas: a partir de una grabacion, el modelo produce un texto descriptivo que puede usarse en resenas o recomendaciones personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2512.06999) contiene experimentos y comparaciones, pero los numeros concretos no estan incluidos en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- El repositorio ocupa 40.5 GB en formato safetensors, lo que indica un modelo de gran tamano. Para cargar los pesos en precision FP16 se necesitarian aproximadamente 81 GB de VRAM, aunque esta estimacion es orientativa y no esta confirmada oficialmente.
- No se especifican GPUs recomendadas. Dado el tamano, se requieren GPUs de alta gama como A100 (80 GB) o H100 (80 GB) para inferencia en una sola tarjeta; en GPUs de consumo como RTX 4090 (24 GB) no cabria sin cuantizacion, y no se ofrecen versiones cuantizadas.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, etc.). Dado que es un modelo multimodal basado en QwenAudio, es probable que requiera un framework que soporte audio, como el propio stack de QwenAudio o Transformers de Hugging Face.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. Se mencionan en el proyecto trabajos previos como SongEval y MuQ, pero no se ofrecen datos de rendimiento ni especificaciones para comparar. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado en evaluacion de canto a capella; su rendimiento en otros tipos de audio (con instrumentos, habla, etc.) no esta garantizado.
- Los datos de entrenamiento se limitan a un subconjunto de aproximadamente 1.000 grabaciones de alta calidad tecnica, lo que puede introducir sesgos hacia ciertos estilos vocales o niveles de habilidad.
- No se ha publicado informacion sobre sesgos demograficos o culturales en las anotaciones; las preferencias esteticas pueden variar entre poblaciones.
- La licencia no esta especificada, por lo que el uso comercial puede estar sujeto a restricciones desconocidas. Se recomienda contactar con el autor antes de integrarlo en productos.
- El modelo genera comentarios textuales que pueden contener errores o valoraciones subjetivas; no debe utilizarse como unico criterio en decisiones importantes sin supervision humana.
- No se dispone de informacion sobre la robustez frente a ruido, compresion de audio o variaciones de calidad de grabacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karl-wang/QwenFeat-Vocal-Score
- Repositorio de codigo (actual): https://github.com/CarlWangChina/QwenFeat-Vocal-Score
- Repositorio legacy: https://github.com/CarlWangChina/Singing-Aesthetic-Assessment
- Paper en arXiv: https://www.arxiv.org/abs/2512.06999
- Version oficial en ACM DL: https://doi.org/10.1145/3746027.3758148
- Dataset de audio: https://huggingface.co/datasets/karl-wang/VocalVerse-dataset/

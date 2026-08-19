# mradermacher/scout-8b-GGUF

## Resumen

scout-8b-GGUF es una cuantización en formato GGUF del modelo scout-8b, desarrollado por Vanta Research y cuantizado por mradermacher. El modelo base, scout-8b, es un gran modelo de lenguaje de 8 mil millones de parámetros (según su nombre) orientado a tareas conversacionales, razonamiento lógico, ciencia y STEM, con un enfoque en la investigación de alineación y comportamiento de IA. Esta versión GGUF permite ejecutar el modelo en entornos locales con herramientas compatibles con este formato, como llama.cpp, Ollama o LM Studio, sin necesidad de infraestructura en la nube.

La relevancia de esta cuantización radica en que facilita el despliegue del modelo en hardware de consumo, aunque actualmente solo se ofrece la versión f16 (16.7 GB), lo que limita su uso a GPUs con al menos 16 GB de VRAM. El modelo base está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación. No se dispone de información detallada sobre la arquitectura interna, el contexto máximo o los datos de entrenamiento, por lo que esta ficha se basa únicamente en los metadatos públicos de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8B (inferido del nombre, no confirmado) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unico disponible en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base scout-8b. El nombre sugiere que se trata de un transformer de 8 mil millones de parametros, pero no hay confirmacion oficial. Tampoco se conocen los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. La cuantizacion realizada por mradermacher es estatica (sin imatrix) y solo se ha generado el archivo f16, que conserva la precision original de los pesos. No se dispone de detalles sobre innovaciones tecnicas en el modelo base.

## Capacidades

Segun los metadatos del repositorio, el modelo esta etiquetado con las siguientes capacidades potenciales:

- Conversacion y chat: orientado a mantener dialogos multi-turno.
- Razonamiento y logica: capaz de resolver problemas que requieren deduccion.
- Conocimiento cientifico y STEM: entrenado para tareas de ciencia, tecnologia, ingenieria y matematicas.
- Consciencia de restricciones (constraint-aware): podria seguir instrucciones con limitaciones explicitas.
- Investigacion en alineacion de IA: enfocado en estudiar el comportamiento de los modelos.
- Roleplay: soporte para escenarios de interpretacion de personajes.

Estas capacidades se infieren de las etiquetas del repositorio, pero no se han verificado con pruebas independientes. No se menciona soporte para tool calling, vision, audio ni otros modos especiales.

## Casos de uso

- Asistente conversacional local: al ser un modelo de 8B en formato GGUF, puede integrarse en aplicaciones de chat privadas usando Ollama o llama.cpp, ofreciendo respuestas en ingles sin conexion a internet.
- Investigacion academica en alineacion de IA: dado su enfoque en comportamiento y alineacion, puede usarse para experimentos sobre sesgos, seguimiento de instrucciones y generacion de respuestas bajo restricciones.
- Generacion de contenido cientifico: puede redactar explicaciones sobre temas STEM, resumir articulos o ayudar en la redaccion de informes tecnicos, siempre que se valide la salida.
- Prototipado de agentes conversacionales: su licencia Apache 2.0 permite integrarlo en productos comerciales, aunque se requiere hardware con suficiente VRAM para la version f16.
- Educacion y formacion: como modelo de razonamiento, puede servir para generar ejercicios de logica o problemas de matematicas, aunque su precision no esta garantizada.
- Evaluacion de modelos: al ser una cuantizacion f16, puede usarse como referencia para comparar el rendimiento de cuantizaciones de menor precision cuando esten disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estandar. Tampoco se han comparado sus capacidades con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un archivo f16 de 16.7 GB, se necesitan al menos 16 GB de VRAM para cargar el modelo completo, mas memoria adicional para el contexto y las activaciones. En la practica, se recomiendan 20-24 GB de VRAM para un uso comodo.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 24 GB o mas de VRAM. En GPUs de 16 GB (como RTX 4080) podria caber con un contexto reducido, pero no es recomendable.
- Si cabe en consumer GPU: si, en GPUs de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB). No cabe en GPUs de 8 o 12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de mediciones. En una RTX 4090, un modelo de 8B en f16 suele generar entre 30 y 60 tokens por segundo, pero esto depende de la implementacion y el contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar scout-8b con otros modelos de la misma categoria. No se conocen modelos directamente comparables en cuanto a arquitectura, entrenamiento o rendimiento. Se recomienda consultar la pagina del modelo base en HuggingFace para futuras actualizaciones.

## Limitaciones y advertencias

- Solo se ofrece la cuantizacion f16, lo que limita su uso en hardware modesto. No hay quants de menor precision (Q4, Q5, etc.) disponibles en este repositorio.
- El modelo solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No se ha publicado informacion sobre sesgos, alucinaciones o riesgos de seguridad. Al ser un modelo de investigacion, podria generar contenido incorrecto o sesgado.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir la autoria y no se ofrece garantia sobre el comportamiento del modelo.
- Al no conocerse la arquitectura exacta, no se puede estimar con precision el consumo de memoria ni el rendimiento esperado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente o poco difundida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/scout-8b-GGUF
- Modelo base: https://huggingface.co/vanta-research/scout-8b
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests

# Diluner/gpt54-mini-standalone-qwen3-1.7b-sft-babyai-20260920

## Resumen

Este repositorio contiene un checkpoint de Qwen/Qwen3-1.7B afinado mediante SFT (supervised fine-tuning) por el usuario Diluner, usando como profesor un modelo identificado como `gpt-5.4-mini`. El entrenamiento corresponde a una etapa concreta denominada "babyai": cinco epocas y 125 actualizaciones de optimizador en esa etapa. El autor especifica que el entrenamiento se inicializo de forma independiente desde el modelo base ("standalone"), por lo que no se trata de un checkpoint secuencial derivado de etapas anteriores.

El modelo esta pensado para experimentacion con agentes: la etiqueta `agent-training` y el entorno de evaluacion (babyai) apuntan a tareas de instrucciones en lenguaje natural dentro de un entorno tipo gridworld. La model card reporta un resultado de 329 exitos sobre 360 intentos (91,3889 % con metrica avg@4) en dicho entorno, con cero errores de episodio, bajo una configuracion de generacion concreta (temperatura 0,4, top-p 1,0, top-k 20, modo "thinking" desactivado y 512 tokens generados por turno).

Es relevante ahora como artefacto de investigacion reproducible: el autor documenta la procedencia, advierte explicitamente de que se trata de un unico checkpoint sin evidencia de ventaja metodologica general, y publica referencias legibles por maquina y sumas de verificacion en `experiment.json`. No es un modelo orientado a producto: no declara licencia, no declara idiomas y no incluye el estado del optimizador, los registros crudos ni las trayectorias del profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; derivada del modelo base Qwen/Qwen3-1.7B (transformer decoder-only) |
| Parametros totales | 2.031.739.904 (dato real de los safetensors); el modelo base se identifica como Qwen3-1.7B |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (no declarada en la model card) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors en la precision de exportacion. El tamano del repo (8,1 GB) es consistente con pesos de 32 bits (2,03e9 x 4 bytes = 8,13 GB), aunque la model card no confirma la precision |
| Idiomas soportados | No disponibles |
| Licencia | No se declara licencia. La model card indica: "No license is asserted here; consult the base model and applicable terms" |
| Formato de pesos | safetensors (shards en la raiz del repositorio, junto con configuracion y tokenizer); libreria `transformers` |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible mas alla de que el modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3, y que el artefacto exportado contiene 2.031.739.904 parametros en safetensors. No se documentan innovaciones tecnicas propias (atencion lineal, decodificacion especulativa, hibridaciones SSM, etc.) ni modificaciones estructurales respecto al modelo base.

El entrenamiento es un SFT con destilacion desde un profesor denominado `gpt-5.4-mini`, en una etapa "babyai" de cinco epocas con 125 actualizaciones de optimizador. El autor indica que el entrenamiento es "standalone", inicializado de forma independiente desde el modelo base y no como checkpoint secuencial. Tambien advierte de que las recetas historicas de SFT y ROSE difieren en la planificacion del learning rate, weight decay, precision de parametros, formato y algunos limites de turnos de entrenamiento, por lo que este checkpoint no constituye una ablacion objetiva aislada. No se incluyen en el repositorio el estado del optimizador, los registros crudos ni las trayectorias del profesor; `experiment.json` contiene referencias de origen y sumas de verificacion legibles por maquina, pero el autor aclara que el inventario de seleccion registra nombres, tamanos y fechas de modificacion de ficheros, no un hash byte a byte de tensores vinculado a las respuestas historicas de evaluacion.

## Capacidades

- Generacion de texto y respuesta conversacional tras el afinado SFT (etiquetas `text-generation` y `conversational`).
- Ejecucion de tareas de agente en el entorno babyai: la evaluacion reportada mide exito por tarea en dicho entorno, con instrucciones procesadas a lo largo de turnos.
- Entrenamiento orientado a agentes (`agent-training`), lo que implica aprendizaje a partir de trayectorias generadas por el modelo profesor.
- Inferencia con el modo "thinking" desactivado en la configuracion de evaluacion declarada (temperatura 0,4, top-p 1,0, top-k 20, 512 tokens por turno).
- Compatibilidad con `transformers`, con text-generation-inference (etiqueta `text-generation-inference`) y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o multimodalidad: no disponibles; no se declaran.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Razonamiento explicito, codigo o matematicas: no se declaran ni se evaluan en la informacion proporcionada.

## Casos de uso

- Investigacion en destilacion SFT: el checkpoint permite estudiar como se transfiere comportamiento de un profesor propietario (`gpt-5.4-mini`) a un modelo abierto de 2,03 mil millones de parametros, comparando recetas de learning rate, weight decay y formato.
- Reproduccion y auditoria de recetas de entrenamiento de agentes: al publicarse `experiment.json` con referencias de origen y checksums, sirve para verificar el numero de actualizaciones de optimizador y las exportaciones de checkpoint por epoca en una etapa de cinco epocas y 125 pasos.
- Agentes en entornos tipo BabyAI o gridworld: el modelo fue afinado especificamente para tareas de instrucciones en ese entorno, con un 91,3889 % de exito avg@4 sobre 360 intentos, por lo que es adecuado para prototipos de agentes que reciben ordenes en lenguaje natural y actuan por turnos.
- Evaluacion comparativa de checkpoints: la metrica avg@4 (media de exito en cuatro intentos por tarea oficial, no mejor de cuatro) y la configuracion de decodificacion fija permiten usarlo como referencia reproducible frente a otros checkpoints de la misma etapa.
- Prototipado local en una unica GPU de consumo: con ~2,03 mil millones de parametros, el modelo se puede servir en GPUs de gama media para experimentos de investigacion sin infraestructura dedicada.
- Punto de partida para fine-tuning posterior: al ser un checkpoint independiente (no secuencial) derivado del modelo base, sirve como inicializacion alternativa para experimentos de SFT o RL sobre Qwen3-1.7B.
- Servicio de inferencia ligero en entornos de investigacion: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que puede desplegarse detras de TGI o de endpoints compatibles con la API de transformers para pruebas internas.
- Analisis de robustez y formatos de turno: el autor senala que "cero errores de episodio no implica que todos los turnos generados esten bien formados", lo que convierte al checkpoint en un caso de estudio util para medir calidad de formato en generacion multi-turno.

## Benchmarks y rendimiento

Unico resultado publicado en la informacion disponible, correspondiente al entorno babyai con la metrica avg@4 (media de exito en cuatro intentos por tarea oficial de test):

| Entorno | Exitos / intentos | avg@4 | Errores de episodio |
|---|---:|---:|---:|
| babyai | 329 / 360 | 91,3889 % | 0 |

Configuracion de evaluacion declarada: temperatura 0,4, top-p 1,0, top-k 20, modo "thinking" desactivado y 512 tokens generados por turno. El autor indica que las comprobaciones de resultados guardados verificaron cobertura exacta de tareas y muestras y consistencia de puntuaciones, y que debe usarse la evaluacion reparada completa en lugar del resumen original que excluia errores, ya que parte de los artefactos reparados reutilizan rollouts originales completos y los registros historicos de servicio estan incompletos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32, aproximadamente 8,1 GB; en FP16/BF16, aproximadamente 4,1 GB; en INT8, aproximadamente 2,0 GB; en cuantizacion de 4 bits, aproximadamente 1,2-1,3 GB. Son estimaciones derivadas del recuento real de parametros (2.031.739.904) y no cifras publicadas por el autor.
- VRAM adicional para el cache KV y activaciones: depende de la longitud de contexto, que no se declara en la model card; no disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con 8 GB o mas deberia poder ejecutar el modelo en FP16, y GPUs de 4-6 GB en cuantizacion INT8 o de 4 bits, siempre que se genere una version cuantizada.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 o equivalentes en FP16; no confirmado por el autor.
- Opciones de despliegue: `transformers` (snippet oficial de carga con `AutoTokenizer` y `AutoModelForCausalLM`), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. vLLM, llama.cpp y Ollama no estan declarados; para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se publica en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Resultado declarado |
|---|---:|---|---|---|---|
| Diluner/gpt54-mini-standalone-qwen3-1.7b-sft-babyai-20260920 | 2.031.739.904 | No disponible | No declarada; remite al modelo base | Publico en HuggingFace, 0 descargas, 0 likes | babyai avg@4: 91,3889 % (329/360) |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B (identificado en la model card; el recuento real de este checkpoint es superior) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en HuggingFace | No disponible |
| Alternativas de ~2 B afinadas para agentes | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion verificable sobre modelos comparables de la misma categoria en el material proporcionado, por lo que no se puede establecer una comparativa de rendimiento fiable mas alla del modelo base. La busqueda web realizada no devolvio resultados tecnicos relevantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad. El entrenamiento parte de Qwen3-1.7B con SFT sobre un profesor propietario, lo que puede propagar sesgos de ambos.
- Riesgo de alucinacion: no se evalua. En tareas de agente, una respuesta mal formada puede traducirse en acciones invalidas; el propio autor advierte que "cero errores de episodio no implica que todos los turnos generados esten bien formados".
- Limitaciones de contexto: la longitud de contexto no se declara en la model card, por lo que no se puede garantizar comportamiento correcto en conversaciones o tareas largas.
- Limitaciones de idioma: no se declara ningun idioma soportado; no hay evidencia de rendimiento multilingue.
- Restricciones de licencia: el repositorio no declara licencia. La model card remite expresamente a la licencia del modelo base y a los terminos aplicables. Antes de cualquier uso comercial es obligatorio verificar los terminos de Qwen/Qwen3-1.7B y del profesor utilizado en la destilacion.
- Valor probatorio limitado: el autor indica que se trata de un unico checkpoint y no de evidencia de una ventaja metodologica general ni de replicacion entre semillas de entrenamiento.
- Trazabilidad parcial: el inventario de seleccion registra nombres, tamanos y fechas de modificacion, no un hash byte a byte de tensores ligado a las respuestas historicas de evaluacion. Los registros historicos de servicio estan incompletos y parte de los artefactos reparados reutilizan rollouts originales.
- No es una ablacion objetiva: las recetas historicas de SFT y ROSE difieren en planificacion de learning rate, weight decay, precision de parametros, formato y limites de turnos de entrenamiento.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente.
- Ausencia de artefactos de despliegue: no se publican versiones GGUF ni cuantizaciones, lo que limita el uso directo en llama.cpp u Ollama sin conversion previa.
- Actualizacion: el repositorio se creo el 20 de septiembre de 2026 y se actualizo el 21 de septiembre de 2026; no se documenta mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diluner/gpt54-mini-standalone-qwen3-1.7b-sft-babyai-20260920
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Fichero de procedencia y checksums dentro del repositorio: `experiment.json` (en la raiz del repositorio de HuggingFace)
- Paper, blog o repositorio adicional del autor: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
- Resultados de la busqueda web: no se encontro ningun enlace tecnico relevante; los resultados devueltos correspondian a temas no relacionados (foros generalistas y consultas sobre herramientas de escritorio).

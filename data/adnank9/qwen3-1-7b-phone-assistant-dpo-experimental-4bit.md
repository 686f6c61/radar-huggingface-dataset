# adnank9/qwen3-1.7b-phone-assistant-dpo-experimental-4bit

## Resumen

Este modelo es un ajuste experimental de Qwen3-1.7B orientado a funcionar como asistente telefonico en dispositivo (on-device). Lo publica el usuario adnank9 (adnank9 en HuggingFace) como parte del desarrollo de Assistant, una aplicacion para iPhone que responde llamadas y toma mensajes. El problema que aborda es concreto: conseguir que un modelo de 1,72 mil millones de parametros, cuantizado a 4 bits, genere respuestas telefonicas breves, naturales y sin repeticiones, ejecutandose localmente en el movil sin depender de la nube.

Tecnicamente se trata de un ajuste por DPO (Direct Preference Optimization) aplicado con QLoRA directamente sobre Qwen/Qwen3-1.7B. El conjunto de preferencias se construyo enfrentando respuestas de un profesor (Qwen3-8B) contra las peores respuestas generadas por el propio modelo sobre mas de 140 personas de llamante generadas sinteticamente. El resultado se distribuye en formato MLX de 4 bits, pensado para el stack de Apple.

Su relevancia ahora es doble: por un lado, demuestra un flujo completo de alineacion ligera sobre un modelo pequeno para un dominio muy acotado; por otro, es un caso de uso real de inferencia local en telefonos. Conviene senalar que el propio autor lo etiqueta como experimental y que no es el modelo por defecto de la aplicacion, ya que termina peor las llamadas que la version base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3-1.7B; detalles concretos de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 1.720.574.976 (aprox. 1,72 mil millones) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (formato MLX) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con formato MLX (libreria `mlx`); repo de 1,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer de 1,72 mil millones de parametros. Sobre esa base se aplico un ajuste por DPO con QLoRA, es decir, adaptadores de bajo rango entrenados sobre la version cuantizada. El procedimiento de preferencias descrito en la model card es el siguiente: se generaron mas de 140 personas de llamante (caller personas) y, para cada una, se tomaron como respuestas preferidas las producidas por un profesor Qwen3-8B y como respuestas rechazadas las peores generaciones del propio modelo base. Ese par preferido/rechazado es el que alimenta el objetivo DPO.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de hiperparametros (rango LoRA, alpha, learning rate) ni si hubo etapas adicionales de RLHF. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos. La innovacion practica del trabajo es el enfoque de generacion de datos: usar al propio modelo como generador de negativos y a un modelo mayor como fuente de positivos, con un conjunto de personas sinteticas para cubrir variedad de interlocutores.

## Capacidades

- Generacion de texto conversacional breve, optimizada para turnos de telefonia: la media de palabras por respuesta medida es de 20,4.
- Toma de mensajes y gestion de llamadas entrantes dentro de la aplicacion Assistant.
- Reduccion de respuestas repetidas: el modelo baja del 2,1 % de respuestas repetidas en la base a 0 % en la evaluacion con 32 llamantes no vistos.
- Ajuste de estilo mediante DPO: las respuestas se alinean con el estilo del profesor Qwen3-8B en lugar del estilo del modelo base.
- Inferencia local en dispositivo mediante MLX, sin enviar audio ni transcripciones a servidores externos.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: no documentadas en la informacion proporcionada.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Asistente telefonico en iPhone: la aplicacion Assistant responde llamadas entrantes y registra mensajes cuando el usuario no puede atender. El modelo se selecciona desde Ajustes → Modelo y ejecuta la generacion de respuestas en el propio dispositivo.
- Filtrado de llamadas no deseadas: al gestionar la conversacion de forma autonoma, el modelo puede recoger el motivo de la llamada y descartar o posponer aquellas que no requieran atencion inmediata del usuario.
- Prototipado de asistentes de voz sin backend: al pesar menos de 1 GB en 4 bits, permite iterar sobre el comportamiento conversacional en un telefono o portatil sin aprovisionar GPU ni servicios cloud.
- Referencia metodologica para DPO con QLoRA en modelos pequenos: el pipeline descrito (profesor mayor como fuente de respuestas preferidas, generaciones propias como rechazadas, personas sinteticas para diversidad) es replicable en otros dominios acotados con presupuesto de datos limitado.
- Evaluacion de alineacion ligera: sirve como caso de estudio de como una mejora pequena en la puntuacion de un juez (9,62 a 9,75) puede venir acompanada de una degradacion en otra metrica (cierre correcto de llamada, de 96,9 % a 90,6 %).
- Investigacion sobre privacidad en asistentes de voz: al no requerir conexion, es adecuado para escenarios donde el contenido de las llamadas no puede salir del dispositivo.
- Generacion de respuestas cortas con restriccion de longitud: el modelo esta ajustado para producir intervenciones de aproximadamente 20 palabras, util en interfaces donde la brevedad es un requisito de producto.

## Benchmarks y rendimiento

La model card publica una evaluacion sobre 32 llamantes no vistos, con el mismo prompt y la misma proteccion contra repeticiones en ambos modelos:

| Metrica | Qwen3-1.7B base | Este modelo (DPO 4-bit) |
|---|---|---|
| Puntuacion del juez (/10) | 9,62 | 9,75 |
| Respuestas repetidas | 2,1 % | 0 % |
| Palabras por respuesta | 21,6 | 20,4 |
| Llamada terminada correctamente | 96,9 % | 90,6 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion disponible es la especifica de dominio recogida en la tabla anterior, con una muestra de 32 llamantes.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 4 bits ocupan aproximadamente 0,86 GB en teoria (1.720.574.976 parametros x 0,5 bytes) y el repositorio completo es de 1,0 GB; con cache KV y overhead del runtime, la inferencia deberia situarse en el rango de 1,5 a 2,5 GB. Es una estimacion derivada del tamano, no un dato publicado.
- GPU compatibles: cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente en teoria. No se han publicado pruebas con A100, H100, RTX 4090 ni otras tarjetas concretas.
- Ejecucion en GPU consumer: si, previsiblemente en modelos como RTX 3060, RTX 4060 o superiores, dado el tamano reducido del modelo. No confirmado por el autor.
- Ejecucion en dispositivo: el formato MLX esta pensado para Apple Silicon (iPhone, iPad, Mac), que es el objetivo declarado del modelo.
- Opciones de despliegue: `mlx-lm` y MLX Swift son las vias naturales, dado el formato de pesos. Para vLLM, TGI, llama.cpp u Ollama seria necesario convertir los pesos, y esa conversion no se incluye en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Puntuacion de juez (32 llamantes) | Repeticiones | Cierre correcto | Licencia |
|---|---|---|---|---|---|---|---|
| adnank9/qwen3-1.7b-phone-assistant-dpo-experimental-4bit | 1,72 mil millones | 4 bits (MLX) | no disponible | 9,75 | 0 % | 90,6 % | Apache 2.0 |
| Qwen/Qwen3-1.7B (base) | 1,72 mil millones | segun despliegue | no disponible en esta informacion | 9,62 | 2,1 % | 96,9 % | Apache 2.0 |
| Qwen/Qwen3-8B (profesor usado para generar preferencias) | 8 mil millones aprox. | no disponible | no disponible | no evaluado | no evaluado | no evaluado | Apache 2.0 |

No se dispone de datos comparativos frente a otros asistentes telefonicos o modelos ajustados para el mismo caso de uso. Las alternativas de la misma categoria (asistentes on-device para telefonia) no aparecen documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado explicitamente como experimental por su autor; no es la opcion por defecto de la aplicacion Assistant.
- Termina las llamadas correctamente menos a menudo que la version base: 90,6 % frente a 96,9 %. Es la razon que da el autor para no usarlo por defecto.
- La mejora en la puntuacion del juez es de 0,13 puntos sobre 10, un margen pequeno que con solo 32 llamantes podria no ser estadisticamente significativo; no se reportan intervalos de confianza ni desviacion entre evaluaciones.
- Riesgo de alucinacion en la toma de mensajes: nombres, numeros de telefono, direcciones y horarios pueden registrarse de forma incorrecta. No hay validacion documentada de esta metrica.
- Idiomas soportados no documentados; no puede asumirse un rendimiento multilingue equiparable al de Qwen3 base.
- Longitud de contexto no especificada en la ficha, lo que impide saber cuantas intervenciones previas de la llamada puede mantener.
- Ausencia total de adopcion: 0 descargas y 0 likes en el momento de recoger los datos, sin validacion externa independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3-1.7B y conviene verificar las condiciones del modelo base antes de integrarlo en un producto.
- El entrenamiento se realizo con personas de llamante sinteticas (140+); el comportamiento frente a patrones de llamada reales y fuera de distribucion no esta caracterizado.
- No se publican detalles de hiperparametros, dataset ni receta completa, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adnank9/qwen3-1.7b-phone-assistant-dpo-experimental-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de la aplicacion Assistant: https://github.com/techadnank9/Assistant
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos correspondian a paginas institucionales sin relacion con el modelo.

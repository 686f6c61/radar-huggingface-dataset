# cxj05h/laya-ledger-mlx

## Resumen

laya-ledger-mlx es un ajuste fino (fine-tune) del modelo de decisiones Laya de Convai Innovations, publicado por el usuario cxj05h y convertido al formato MLX para su ejecucion nativa en silicio de Apple. No es un modelo generativo de texto: es un decisor de "Sistema 1" no autorregresivo que resuelve elecciones tipadas sobre un libro de trabajo (ledger). Concretamente, responde a tres tipos de decision rutinaria: si el usuario quiere cerrar una fila, mover el foco a otra fila o anadir una fila nueva, y en los dos primeros casos a que fila existente se refiere.

El modelo cuenta con 421.293.830 parametros totales (aproximadamente 421 millones) y se distribuye en safetensors para la libreria MLX, con pesos en FP16. Deriva del modelo base convaiinnovations/laya, que segun su documentacion es un motor de decision multilingue con enrutado en mas de 100 idiomas y calibracion destacada, orientado a decisiones tipadas con puntuaciones y probabilidades en lugar de generacion de texto.

Su relevancia es acotada pero concreta: actua como decisor local opcional dentro de los paquetes Kimchi *project-ledger* y *castai-sessions*, de modo que permite resolver micro-decisiones de interfaz sin llamar a una API en la nube. El autor lo describe explicitamente como "un asesor, no un actor", sin ninguna pretension fuera de esta tarea. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion sobre longitud de contexto ni sobre benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision tipada no autorregresivo (System 1), heredado de convaiinnovations/laya; sin detalles de capas publicados |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (dtype float16 en MLX); no se documentan otros formatos |
| Idiomas soportados | no disponible para el fine-tune; el modelo base Laya declara enrutado multilingue en mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Laya, descrito por sus autores como un motor de decision "Sistema 1" no autorregresivo que produce elecciones tipadas con puntuaciones y probabilidades, en lugar de generar texto token a token. El modelo base se entreno con RL (RLCD) y declara decodificacion en menos de 35 ms con calibracion de referencia. No se han publicado en la informacion disponible detalles sobre el numero de capas, dimension del hidden state o mecanismo de atencion de Laya, por lo que esos datos quedan como no disponibles.

El fine-tune laya-ledger se entreno durante 4 epocas siguiendo la receta upstream de decisiones tipadas, que combina RLCD (Reinforcement Learning from Contrastive... segun la nomenclatura del autor, RLCD) con calibracion de temperatura por tipo de decision. El conjunto de datos son 2.400 sesiones sinteticas de ledger, con 10 "departamentos" y 160 elementos de trabajo inventados; todas las personas y empresas son ficticias y no se uso ningun dato real de usuario. La conversion a MLX se realizo con la herramienta `laya-mlx convert`, y el modelo se carga con `laya_mlx.load("<este repo>", dtype="float16")`.

## Capacidades

- Decision de cierre de fila: determina si el usuario pide cerrar una fila del ledger.
- Decision de cambio de foco: determina si el usuario quiere mover el foco a otra fila.
- Decision de alta: determina si el usuario quiere anadir una nueva fila.
- Resolucion de referencias: identifica a que fila existente se refiere el usuario cuando la peticion es de cierre o de cambio de foco.
- Salida calibrada: devuelve puntuaciones (scores); el autor indica que cuando la mejor fila supera 0,80 de puntuacion, el acierto fue del 91-93 % en sus evaluaciones.
- Decisiones binarias si/no con una precision declarada del 90-95 % en sus evaluaciones.
- Ejecucion local en Apple silicon mediante MLX, sin generacion de texto, sin PyTorch y sin API en la nube.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: no es un modelo de lenguaje general.

## Casos de uso

- Cierre de filas en un ledger de trabajo: el modelo recibe la peticion del usuario y la lista de filas y decide si la intencion es cerrar una fila concreta y cual, con umbral de score 0,80 para actuar de forma automatica.
- Cambio de foco en una interfaz de tareas: permite que un asistente local mueva el foco a la fila correcta a partir de una frase ambigua, sin necesidad de un LLM generativo.
- Alta de nuevas filas: clasifica si la peticion implica crear un elemento nuevo, evitando que el sistema interprete por error una creacion como un cierre.
- Desambiguacion de referencias: resuelve expresiones del tipo "la tarea de ayer" o "eso que estaba abierto" contra las filas existentes, devolviendo la fila candidata con su puntuacion.
- Escalado a intervencion humana: cuando la puntuacion de la mejor fila queda por debajo de 0,80, el flujo puede pedir confirmacion al usuario en lugar de actuar, reduciendo errores silenciosos en produccion.
- Decisor local con privacidad por diseno: al ejecutarse en el dispositivo (Apple silicon via MLX), evita enviar el contenido del ledger a servicios en la nube, adecuado para equipos con datos internos sensibles.
- Integracion en los paquetes Kimchi *project-ledger* y *castai-sessions*: actua como decisor local opcional dentro de esas herramientas de gestion de sesiones y proyectos.
- Pretratamiento de intenciones en un asistente de productividad: puede usarse como primera etapa de un pipeline que clasifique la intencion de ledger y delegue el resto a otro componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta evaluaciones internas de calibracion sobre muestras muy pequenas:

| Evaluacion | Metrica | Resultado | Tamano de muestra |
|---|---|---|---|
| Respuesta de fila (fila superior) | Precision cuando el score es >= 0,80 | 91-93 % | 11 y 14 casos |
| Preguntas si/no (cerrar, mover foco, nuevo item) | Precision | 90-95 % | no disponible |
| Latencia de decisiones cortas (runtime laya-mlx) | Tiempo por decision en M3 Max | 7-14 ms | no disponible |

No se proporcionan comparaciones con otros modelos en benchmarks publicos.

## Requisitos de hardware

- Peso de los parametros: 421.293.830 parametros en FP16 equivalen a aproximadamente 0,84 GB de pesos; el repositorio completo ocupa 0,8 GB.
- VRAM estimada para inferencia: en torno a 1 GB o menos en FP16, dado el tamano del modelo (calculo aritmetico a partir del numero de parametros; no confirmado por el autor).
- GPU recomendadas: no disponible; el modelo esta empaquetado para MLX, es decir, para Apple silicon (se menciona M3 Max en el runtime laya-mlx).
- Compatibilidad con GPU de consumo: no hay datos publicados de ejecucion en GPU NVIDIA o AMD; el soporte documentado es para chips de Apple.
- Opciones de despliegue: MLX, cargando con `laya_mlx.load(...)` y el runtime `laya-mlx`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia: el runtime laya-mlx declara 7-14 ms por decision corta en M3 Max; este dato corresponde al runtime, no necesariamente a esta variante concreta.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cxj05h/laya-ledger-mlx | 421.293.830 | no disponible | Decisiones tipadas de ledger (cerrar fila, mover foco, nueva fila) | Apache 2.0 | HuggingFace, formato MLX |
| convaiinnovations/laya (modelo base) | no disponible | no disponible | Decisiones tipadas, puntuaciones y probabilidades, multilingue (mas de 100 idiomas) | Apache 2.0 | HuggingFace |
| Jev | no disponible | no disponible | Modelo de decision comparable segun la web de Laya AI | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia para Jev mas alla de su mencion como alternativa en la web de Laya AI, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- Unicamente resuelve tres tipos de decision sobre un ledger; no es un modelo de lenguaje general y no genera texto.
- Los datos de entrenamiento son 100 % sinteticos (2.400 sesiones, 10 departamentos y 160 elementos inventados), lo que puede provocar desviacion de distribucion frente a ledgers reales con vocabulario y estructuras distintas.
- Las evaluaciones de calibracion se basan en muestras muy pequenas (11 y 14 casos), por lo que las cifras de 91-93 % y 90-95 % tienen alta incertidumbre estadistica.
- El autor lo define como asesor y no como actor: conviene usarlo para recomendar y confirmar con el usuario, no para ejecutar cambios irreversibles de forma autonoma.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea de intencion y de seleccion de fila incorrecta cuando las puntuaciones son bajas; el umbral recomendado es 0,80.
- No se documentan idiomas soportados por este fine-tune; el multilingue (mas de 100 idiomas) es una caracteristica declarada del modelo base, no una garantia heredada tras el ajuste.
- No se ha publicado longitud de contexto, por lo que no puede planificarse su uso con ledgers extensos sin validacion previa.
- Licencia Apache 2.0, igual que el modelo base: permite uso comercial, pero el repositorio contiene pesos modificados y debe mantenerse la atribucion a Convai Innovations y a las herramientas laya-mlx.
- Sin datos de adopcion (0 descargas, 0 likes) ni de mantenimiento posterior a la publicacion; se desconoce si habra actualizaciones.
- La libreria requerida es MLX, lo que limita el despliegue a entornos Apple silicon salvo que se realice una conversion adicional no documentada.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/cxj05h/laya-ledger-mlx
- Modelo base Laya (Convai Innovations): https://huggingface.co/convaiinnovations/laya
- Runtime MLX para modelos de decision Laya (GitHub): https://github.com/mizorewww/laya-mlx
- Web de Laya AI: https://laya-ai.com/
- Web de Convai Innovations sobre Laya: https://laya.convaiinnovations.com/
- Paper arXiv de marzo de 2025 sobre trayectorias de conversion de secuencias: mencionado en la web de Convai Innovations, sin enlace directo en la informacion disponible.

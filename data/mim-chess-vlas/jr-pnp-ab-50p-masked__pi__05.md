# mim-chess-vlas/jr-pnp-ab-50p-masked__pi__05

## Resumen

Este modelo es un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, publicado por el usuario `mim-chess-vlas` bajo el identificador `jr-pnp-ab-50p-masked__pi__05`. Se trata de una política robótica de tipo Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), la arquitectura desarrollada por Physical Intelligence para generalización en entornos abiertos y adaptada al ecosistema LeRobot de Hugging Face. El modelo no es un modelo de lenguaje: consume observaciones visuales y estado del robot para producir acciones de control directamente.

El modelo tiene 4.143.404.816 parámetros (unos 4,14 mil millones) y está especializado en una tarea concreta de manipulación: recoger objetos con etiqueta roja ("red masked") y depositarlos en una caja. Se entrenó sobre un conjunto de datos de imitación humana con 1102 episodios y 641.956 fotogramas a 50 FPS, con entradas de tres cámaras (`side`, `wrist_left`, `wrist_right`) y un vector de estado de 7 dimensiones, produciendo un vector de acción también de 7 dimensiones.

Su relevancia es acotada y práctica: sirve como referencia de cómo se publican políticas VLA afinadas con LeRobot, y demuestra el flujo de trabajo de ajustar π₀.₅ para tareas de pick-and-place específicas. No se han publicado datos de benchmarks ni métricas de éxito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence; detalle interno de capas no disponible |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica; no se indica que sea MoE en la informacion disponible |
| Longitud de contexto | no disponible (no se documenta ventana de historial de observaciones ni de instruccion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política VLA derivada de π₀.₅ (Pi05), una evolucion de π₀ orientada a generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion disponible en LeRobot esta adaptada del repositorio de codigo abierto OpenPI de Physical Intelligence. La model card no detalla el backbone de vision-lenguaje, el tipo de decodificador de acciones ni si se emplea flow matching u otra tecnica; esos detalles no estan disponibles.

En cuanto al entrenamiento, este checkpoint es un fine-tune de `lerobot/pi05_base` sobre el dataset `lets-merged/lets-human-mim-chess-vlas-ind-pnp-012-masked--k24m50_lets-human-mim-chess-vlas-jr-pnp-12345-50p-masked--k24m50--21524`. El dataset contiene 1102 episodios, 641.956 fotogramas grabados a 50 FPS y cubre decenas de tareas del tipo "Pick up the red masked [objeto] and place it in the box". La model card no especifica el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores a la imitacion.

## Capacidades

- Control robótico de manipulación: transforma observaciones visuales y estado del robot en comandos de acción de 7 grados de libertad.
- Entrada multi-camara: procesa tres flujos visuales simultaneos (`observation.images.side` a 300x355, `observation.images.wrist_left` y `observation.images.wrist_right` a 480x848) mas un vector de estado de 7 dimensiones.
- Salida de acción continua: genera un vector `action` de forma `(7,)` por paso de control.
- Ejecución condicionada por tarea: el dataset de entrenamiento define instrucciones en lenguaje natural para cada episodio, lo que sugiere condicionamiento por descripcion de tarea.
- Pick-and-place especializado: entrenado especificamente para reconocer objetos con etiqueta roja y colocarlos en una caja.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision generativa, audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulación industrial de recogida y colocación: el modelo puede controlar un brazo robotico para identificar objetos marcados y depositarlos en una ubicacion designada, aprovechando sus tres camaras para cubrir vistas lateral y de muñeca.
- Automatizacion de clasificacion en almacenes: integrado en una celda robotica, permite separar objetos por etiqueta visual y colocarlos en contenedores, con politica entrenada especificamente para esa tarea.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentos de generalizacion a nuevos objetos, reentrenando o afinando sobre el dataset publicado.
- Base para fine-tuning de tareas propias: al derivar de `lerobot/pi05_base` y usar el flujo de LeRobot, se puede reutilizar como inicializacion para politicas de pick-and-place en otros entornos.
- Evaluacion de pipelines VLA en simulacion o laboratorio: util para comparar estrategias de codificacion de vision-lenguaje-accion frente a otros checkpoints de la familia π.
- Docencia y prototipado en robotica: ejemplo reproducible de una politica entrenada con un dataset humano de 1102 episodios, util para ensenar el ciclo completo de adquisicion de datos, entrenamiento y despliegue.
- Control de brazos de 7 DoF en tareas de bin picking: la salida de 7 dimensiones encaja con configuraciones de robot de 6 ejes mas pinza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de tasas de exito, MMLU, HumanEval, GSM8K ni de ninguna metrica especifica de la tarea de manipulacion.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 8,3 GB en bf16/fp16, unos 16,6 GB en fp32, en torno a 4,1 GB en int8 y unos 2,1 GB en int4 (calculos estimados a partir de 4,14 mil millones de parametros).
- VRAM total recomendada: por encima de los pesos hay que sumar activaciones del codificador visual y de los tres flujos de imagen, por lo que conviene reservar margen adicional; se recomienda al menos 16-24 GB para inferencia en precision completa.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y L40S para despliegue sin restricciones; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso en estacion de trabajo.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en tarjetas de 12-16 GB (RTX 4080, RTX 3060 12 GB) seria necesario cuantizar a int8 o int4.
- Opciones de despliegue: libreria LeRobot (`lerobot`), con el flujo documentado en la guia oficial de pi05; el modelo esta adaptado del repositorio OpenPI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no es compatible directamente con esas herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| Este modelo (`jr-pnp-ab-50p-masked__pi__05`) | 4,14 mil millones | 3 camaras + estado 7D | apache-2.0 | Hugging Face (0 descargas) | no disponible |
| `lerobot/pi05_base` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face | no disponible |
| π₀.₅ / π₀ (Physical Intelligence) | no disponible | no disponible | no disponible | Blog y repositorio OpenPI | no disponible en la informacion proporcionada |
| Modelos VLA alternativos de la misma categoria (por ejemplo OpenVLA-7B o RDT-1B) | del orden de 7B y 1,2B respectivamente (dato publico general) | vision + estado | no disponible | Hugging Face | no disponible |

La comparativa cuantitativa fiable no es posible con los datos disponibles: la informacion proporcionada no incluye metricas de rendimiento de este modelo ni de sus alternativas.

## Limitaciones y advertencias

- Especializacion estrecha: la politica esta entrenada para la tarea de recoger objetos con etiqueta roja y colocarlos en una caja; fuera de esa distribucion su comportamiento no esta garantizado.
- Datos de generalizacion limitados: aunque π₀.₅ se disena para generalizar a entornos nuevos, este fine-tune concreto se ha ajustado sobre 1102 episodios de una tarea muy concreta, lo que puede reducir la generalizacion.
- Riesgo de fallo en percepcion: al depender de etiquetas visuales ("red masked"), variaciones de iluminacion, oclusiones o colores similares pueden degradar el rendimiento.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos ni analisis de robustez.
- Riesgo de alucinacion de acciones: como toda politica aprendida por imitacion, puede generar acciones incoherentes o inseguras en estados no vistos.
- Idiomas no documentados: la model card no especifica que idiomas soporta el componente de lenguaje; se desconoce si las instrucciones deben ir en ingles.
- Cero adopcion y validacion externa: 0 descargas y 0 likes en el momento de la ficha, sin validacion por terceros.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `lerobot/pi05_base` y del dataset de entrenamiento antes de un uso en produccion.
- Tamano del repositorio elevado (65,5 GB): implica espacio significativo en disco y descargas largas; no se detalla cuantas copias de pesos contiene.
- No apto para inferencia en produccion sin evaluacion previa: la ausencia de benchmarks y de tasas de exito impide estimar su fiabilidad real en un despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/jr-pnp-ab-50p-masked__pi__05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lets-merged/lets-human-mim-chess-vlas-ind-pnp-012-masked--k24m50_lets-human-mim-chess-vlas-jr-pnp-12345-50p-masked--k24m50--21524
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Nota: la busqueda web no devolvio resultados relevantes sobre este modelo; los unicos enlaces relacionados son los incluidos en la model card y los enumerados arriba.

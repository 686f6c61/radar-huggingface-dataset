# PrinceAlhassanNasamu/nexus-planner

## Resumen

Nexus planner es un modelo experimental de tipo planner (planificador) para un agente de Android orientado a accesibilidad, desarrollado por Prince Nasamu Alhassan. Su funcion es recibir la peticion del usuario, el historial de pasos ejecutados y el estado actual de la pantalla (el arbol de accesibilidad serializado como lista numerada de elementos), y responder con una unica llamada a una de las herramientas de la aplicacion, una peticion de aclaracion al usuario o una negativa explicita. No ejecuta acciones directamente: la confirmacion de envios, llamadas y operaciones monetarias queda delegada a la capa de la aplicacion.

Tecnicamente se distribuye como un adaptador LoRA (r 16, alpha 32, aplicado a todas las capas lineales) sobre la familia Qwen3.5, con variantes para las tallas de 2B y 4B de parametros, y como ficheros `.litertlm` en int8 generados con LiteRT-LM de Google para su ejecucion en telefono. El repositorio ocupa 2,1 GB e incluye tanto los adaptadores como los pesos fusionados y cuantizados.

Es relevante porque ejemplifica el patron de agentes locales de accesibilidad sobre dispositivos moviles con modelos pequenos y tool calling restringido, y porque documenta una metodologia de destilacion desde un modelo profesor (Claude Opus) combinada con datos publicos de function calling. Se trata de artefactos de investigacion, no de un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5) con adaptador LoRA; empaquetado LiteRT-LM int8 para movil |
| Parametros totales | No disponible de forma explicita; el modelo base declarado es Qwen3.5-2B (y se referencia tambien Qwen3.5-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (ficheros `.litertlm` de LiteRT-LM); adaptadores LoRA en precision de entrenamiento |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | LoRA adapter (carpeta `adapter`) y `.litertlm` (LiteRT-LM int8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5 en sus variantes de 2B y 4B parametros, una arquitectura transformer decoder-only, y se especializa mediante un adaptador LoRA de rango 16 y alpha 32 aplicado a todas las capas lineales. Para el despliegue en telefono, el adaptador se fusiona con el modelo base y se convierte a un fichero `.litertlm` int8 mediante LiteRT-LM de Google, lo que permite inferencia local en Android sin servidor.

El entrenamiento combina tareas telefonicas sinteticas etiquetadas por un modelo profesor (Claude Opus) con una porcion de datos publicos de tool calling: xLAM function-calling-60k de Salesforce (CC BY 4.0) y Mobile Actions de Google (CC BY 4.0). La model card indica que las tareas de benchmark nunca se incluyen en el entrenamiento mediante exclusion por fraseo exacto. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion principal no es arquitectonica sino de diseno del agente: la salida esta restringida a una unica llamada a herramienta por paso, con el estado de pantalla representado como arbol de accesibilidad numerado, y con la seguridad de operaciones sensibles delegada a la aplicacion en lugar del modelo.

## Capacidades

- Planificacion de acciones sobre interfaces Android a partir del arbol de accesibilidad serializado.
- Tool calling / function calling restringido a un conjunto cerrado de herramientas de la aplicacion Nexus.
- Razonamiento multi-paso: recibe el historial de pasos previos para decidir la siguiente accion.
- Capacidad de solicitar aclaracion al usuario cuando la peticion es ambigua.
- Capacidad de rechazar la tarea indicando que no puede realizarla.
- Ejecucion local en dispositivo mediante LiteRT-LM int8 (sin dependencia de red).
- Soporte de un unico idioma: ingles.
- No se documentan capacidades de vision, audio, generacion de codigo general ni matematicas.

## Casos de uso

- Asistencia a usuarios ciegos o con baja vision: el modelo interpreta el arbol de accesibilidad de la pantalla y propone la siguiente accion (pulsar un elemento, desplazarse, abrir una app) en lenguaje de herramientas, integrandose en un flujo de voz a accion.
- Automatizacion de tareas repetitivas en Android: dado un objetivo y el historial de pasos, el planner encadena llamadas a herramientas para completar formularios o navegar menus, siempre con la capa de confirmacion de la app para acciones sensibles.
- Navegacion guiada por menus complejos: con el estado de pantalla como lista numerada de elementos, el modelo puede seleccionar el elemento correcto en interfaces densas donde un lector de pantalla convencional no basta.
- Prototipado de agentes moviles on-device: sirve como referencia para investigar destilacion de planners desde modelos profesor a modelos de 2B-4B cuantizados a int8 en LiteRT-LM.
- Evaluacion de tool calling en dominios restringidos: util para estudiar como se comporta un modelo pequeno cuando el espacio de acciones esta acotado y el estado se representa de forma estructurada.
- Asistencia en tareas de comunicacion con confirmacion obligatoria: redactar y preparar envios de mensajes o llamadas, dejando la ejecucion final a la capa de la aplicacion que exige confirmacion explicita.
- Investigacion en accesibilidad: base para experimentos sobre representacion de arboles de accesibilidad y su efecto en la precision de planificacion de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en dispositivo: disenado para ejecutarse en telefono Android mediante LiteRT-LM int8; el repositorio pesa 2,1 GB, lo que da una idea del orden de magnitud del almacenamiento necesario.
- VRAM estimada: no disponible de forma explicita; para un modelo de 2B en int8 el orden de magnitud es de pocos GB, y para 4B aproximadamente el doble, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible; el objetivo declarado es la NPU/CPU del telefono via LiteRT-LM, no GPU de servidor.
- Compatibilidad con GPU de consumo: no documentada; el formato `.litertlm` esta orientado a LiteRT-LM en Android, no a CUDA.
- Opciones de despliegue: LiteRT-LM (formato nativo del artefacto). El adaptador LoRA podria cargarse sobre Qwen3.5 con frameworks compatibles, pero no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nexus planner (este) | Base 2B / 4B (Qwen3.5) + LoRA | No disponible | Planner de agente Android con tool calling restringido, on-device | Apache 2.0 | Hugging Face, formato LiteRT-LM |
| Qwen3.5-2B (base) | 2B | No disponible en la informacion | Modelo generalista | Segun Qwen3.5 | Hugging Face |
| xLAM function-calling (Salesforce) | No disponible | No disponible | Tool calling generalista | CC BY 4.0 (datos) | Hugging Face |
| Mobile Actions (Google) | No disponible | No disponible | Datos de acciones moviles | CC BY 4.0 | Fuente publica de datos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion: la propia model card lo califica como artefacto de investigacion, no como producto.
- No debe ejecutar acciones sobre dinero, borrado o mensajes sin la capa de confirmacion de la aplicacion; el modelo no garantiza por si mismo la seguridad de operaciones sensibles.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion en la seleccion de elementos de pantalla o de herramientas, especialmente ante interfaces no vistas en entrenamiento.
- Sesgos potenciales heredados del modelo profesor (Claude Opus) usado para etiquetar datos sinteticos y del modelo base Qwen3.5, no evaluados en la informacion disponible.
- Longitud de contexto no documentada, lo que impide estimar el limite practico del historial de pasos y del arbol de accesibilidad.
- Formato de despliegue limitado a LiteRT-LM; la portabilidad a otros runtimes no esta documentada.
- Sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks publicados, lo que dificulta la validacion independiente.
- La licencia Apache 2.0 permite uso comercial, pero el caracter experimental y la falta de evaluacion desaconsejan su uso en produccion sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/PrinceAlhassanNasamu/nexus-planner
- Codigo de la aplicacion Nexus: https://github.com/NasamuAlhassan/Nexus
- Autor: https://prince-alhassan.vercel.app/
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset xLAM function-calling-60k (Salesforce): no disponible enlace directo en la informacion
- Dataset Mobile Actions (Google): no disponible enlace directo en la informacion
- LiteRT-LM (Google): no disponible enlace directo en la informacion

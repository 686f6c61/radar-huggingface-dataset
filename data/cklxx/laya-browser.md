# cklxx/laya-browser

## Resumen
laya-browser es un ajuste fino del modelo laya de convaiinnovations, desarrollado por cklxx, que lo convierte en una cabeza de decisión para agentes de navegación web. A diferencia de los modelos generativos habituales, laya es un modelo "System 1" no autorregresivo: un único paso bidireccional de encoder responde a varias preguntas tipadas (elección, puntuación, nulo) con probabilidades calibradas, sin generar texto. Este repositorio lo entrena para sustituir directamente a TypeSafe Jev en el proyecto browser-use/jev-ultrafast, donde cada paso del agente es una única pasada forward que selecciona la operación (CLICK, TYPE_TEXT, SELECT, PRESS_ENTER, SCROLL, DONE) y el elemento objetivo.

El modelo se basa en mmBERT-base con 321.908.998 parámetros y está entrenado y evaluado localmente en una RTX 4070 Ti SUPER de 16 GB, sin APIs de pago. La relevancia actual reside en su enfoque de bajísima latencia (22-27 ms por decisión con la GPU a plena frecuencia) para automatización de navegadores, un dominio donde los agentes basados en LLM generativos resultan mucho más costosos por paso.

La versión publicada es la v19s, que mejora sustancialmente a la v17s en tareas multietapa sobre sitios reales no vistos durante el entrenamiento, aunque mantiene limitaciones claras en generalización a dominios nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (mmBERT-base), modelo de decisión no autorregresivo "System 1" |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 4,7 GB, con código propio vía trust_remote_code) |

## Arquitectura y entrenamiento
laya-browser emplea un encoder bidireccional mmBERT-base que, en una sola pasada forward, responde a un conjunto de preguntas tipadas con probabilidades calibradas. El modelo no genera texto: produce decisiones discretas sobre la operación a ejecutar y el elemento objetivo de la página. La entrada se construye con instrucciones, cadenas compactas de opciones, un resumen de campos de formulario y 1200 caracteres del texto visible de la página, dividiendo las listas de opciones de más de 60 elementos.

El ajuste fino parte de convaiinnovations/laya y se entrena con los conjuntos de datos osunlp/Mind2Web, stanfordnlp/nnetnav-live y webagentlab/webchain. El autor no detalla el número de tokens ni la composición exacta del dataset en la información disponible. La innovación principal es el uso de TileLang para compilar kernels y la integración como reemplazo directo del endpoint `/v1/systemone` de jev-ultrafast, donde un modelo Qwen3-8B-AWQ local solo se encarga de escribir el texto que se teclea y de elegir valores de desplegables. No se menciona RLHF ni DPO.

## Capacidades
- Decisión de operación de navegador: selecciona entre CLICK, TYPE_TEXT, SELECT, PRESS_ENTER, SCROLL, DONE y otras operaciones con una sola pasada forward.
- Selección de elemento objetivo: identifica el nodo interactivo de la página sobre el que actuar, con confianza calibrada.
- Respuesta a preguntas tipadas: soporta formatos `choice`, `score` y `noul` con probabilidades.
- Integración con agentes: responde al formato de petición `/v1/systemone` de browser-use/jev-ultrafast.
- Manejo de formularios: resume campos, placeholders, tipos y patrones, y elige valores de desplegables.
- Multilingüe según la model card, aunque el entrenamiento y las evaluaciones se centran en inglés.
- Sin generación de texto: no produce explicaciones ni cadenas libres; el texto lo aporta un modelo auxiliar.

## Casos de uso
- Automatización de navegación web multietapa: el modelo ejecuta secuencias de búsqueda, filtrado, ordenación y apertura de resultados en sitios reales, con una decisión por paso y latencia de decenas de milisegundos.
- Sustitución de TypeSafe Jev en jev-ultrafast: se despliega como servidor local en el puerto 8791 y responde idénticamente a las peticiones del agente, reduciendo la dependencia de servicios externos.
- Relleno de formularios sintéticos y reales: gestiona formularios de vuelos, hoteles, compras, alquiler de coches, restaurantes y registros, eligiendo campos y valores.
- Testing automatizado de interfaces web: un agente puede recorrer flujos de usuario y verificar que los controles responden, usando el modelo como política de decisión.
- Extracción de datos mediante interacción: navegar listados, aplicar filtros y abrir fichas de detalle para recopilar información estructurada.
- Despliegue en hardware de consumo: al caber en 16 GB de VRAM, permite prototipar agentes de navegador en una estación de trabajo con RTX 4070 Ti SUPER sin costes de API.
- Investigación en agentes "System 1": sirve como banco de pruebas para estudiar políticas de decisión no generativas frente a enfoques basados en LLM.

## Benchmarks y rendimiento

| Evaluación | v17s | v19s |
|---|---|---|
| Suite C: 27 tareas multietapa en sitios reales no vistos (×2) | 2/54 | 11-14/54 (ejecuciones ×1: 5-7/27) |
| Suite B: 18 tareas en 18 sitios no vistos (×3) | 54/54 | 54/54 |
| Suite A: 16 tareas originales en sitios reales (×3) | 41/48 | 39/48 |
| webgym: formularios sintéticos no vistos, 7 tipos × 10 | 15/70 | 30/70 |
| Decisiones en sitios no vistos (WebChain): operación / objetivo top-1 | no disponible | 0,94 / 0,48 |

La latencia por decisión es de 22-27 ms en una RTX 4070 Ti SUPER con la GPU a plena frecuencia; con la GPU en reposo (P5/P8, 210-850 MHz) sube a 75-270 ms. La primera petición de cada rango de longitud de entrada compila un kernel (~100-500 ms).

## Requisitos de hardware
- VRAM estimada: el repo ocupa 4,7 GB en safetensors; en FP32 serían aproximadamente 1,3 GB de pesos, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 4070 Ti SUPER (16 GB) es el hardware de referencia del autor; cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, incluidas gamas medias con suficiente VRAM; también funciona en CPU según la model card.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, el paquete upstream `laya` (`laya.load`), y el servidor incluido `laya_browser.py serve --port 8791` para jev-ultrafast.
- Latencia y throughput: 22-27 ms por decisión a plena frecuencia; se recomienda fijar la frecuencia mínima SM con `sudo nvidia-smi -lgc 2100,3135` para evitar la caída a relojes inactivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-browser (v19s) | 322 M | no disponible | Decisión no autorregresiva para agentes de navegador | apache-2.0 | Hugging Face |
| convaiinnovations/laya | no disponible | no disponible | Modelo System 1 base del que deriva | no disponible | Hugging Face |
| TypeSafe Jev (browser-use/jev-ultrafast) | no disponible | no disponible | Componente de decisión que laya-browser sustituye | no disponible | GitHub |
| LLM generativos para agentes web (p. ej. Qwen3-8B) | 8 B | no disponible | Generación autorregresiva con tool calling | según modelo | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Generalización limitada: en la Suite C, sobre sitios reales no vistos, solo alcanza un 20-26 % de éxito; los dominios nuevos siguen siendo un punto débil.
- El objetivo top-1 en sitios no vistos (WebChain) es de 0,48, lo que indica dificultad para localizar el elemento correcto.
- La Suite A empeoró ligeramente respecto a v17s (39/48 frente a 41/48), perdiendo la tarea `books-open-book`.
- Alta varianza entre ejecuciones: diferencias de menos de ±4 tareas deben considerarse ruido por tiempos de carga y ventanas emergentes.
- Dependencia de un modelo auxiliar (Qwen3-8B-AWQ) para generar el texto de TYPE_TEXT y elegir valores de desplegables.
- No genera texto ni explicaciones; su uso requiere integrarlo en un agente que gestione la observación de la página y la ejecución de acciones.
- La latencia se degrada notablemente con la GPU en reposo si no se fija la frecuencia mínima.
- El entrenamiento y las evaluaciones están centrados en inglés, pese a la etiqueta multilingual.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de decisiones erróneas con confianza alta; conviene validar en producción.
- Licencia apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datasets empleados.

## Enlaces
- Hugging Face: https://huggingface.co/cklxx/laya-browser
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio jev-ultrafast: https://github.com/browser-use/jev-ultrafast
- Dataset Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web
- Dataset nnetnav-live: https://huggingface.co/datasets/stanfordnlp/nnetnav-live
- Dataset webchain: https://huggingface.co/datasets/webagentlab/webchain

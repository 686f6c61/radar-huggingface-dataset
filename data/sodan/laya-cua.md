# sodan/laya-cua

## Resumen

laya-cua es un modelo pequeño (421 millones de parámetros) desarrollado por el usuario sodan como capa de decisión para agentes de uso de ordenador (computer-use). Dado un objetivo, una descripción textual de la pantalla actual y el historial reciente de pasos, responde en un único forward pass dos preguntas: qué tipo de acción debe ejecutarse a continuación (click, type, key, scroll, navigate, move, wait, drag o done) y cuál es la probabilidad de que la tarea ya esté completada. No genera texto, no produce coordenadas ni identificadores de elementos y no lee capturas de pantalla directamente.

El modelo parte de convaiinnovations/laya, un encoder ModernBERT-large con una cabeza de decisión tipada, y se ha afinado mediante el bucle RLCD oficial (`laya.train`) sobre el dataset OpenCUA AgentNet (xlangai/AgentNet, licencia MIT). La versión actual (v1) entrena con 400 tareas y 5.822 filas de entrenamiento, frente a las 200 tareas de la v0, y mantiene el mismo conjunto de validación de 334 filas con tareas completas reservadas.

Su relevancia práctica está en el coste: con 421M de parámetros puede actuar como router rápido o comprobación de cordura junto a un LLM o un modelo de grounding que se encargue de elegir el elemento concreto y el texto. El autor publica además un checkpoint experimental conjunto acción/objetivo (13 fragmentos numerados con verificación SHA256) orientado a MiniWoB, cuyos resultados deben leerse con cautela por tratarse de familias de tareas vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large con cabeza de decisión tipada (heredada de convaiinnovations/laya) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como cifra de tokens; la pantalla se entrena con hasta 1.800 caracteres y el historial con hasta 4 pasos |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor no documenta GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 2,6 GB; el checkpoint experimental conjunto se distribuye en 13 fragmentos de 104.983.412 bytes reconstruidos) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer (ModernBERT-large) con una cabeza de decisión tipada que resuelve dos preguntas en un solo forward pass: una elección entre 9 tipos de acción y una probabilidad de tarea completada. El encoder está congelado durante el afinado; solo se entrenan la cabeza de acción/objetivo y el scorer. El entrenamiento usa el bucle RLCD de `laya.train` sobre OpenCUA AgentNet: 400 tareas, una fila por paso, 5.822 filas de entrenamiento, 2 épocas y la misma receta que la v0, con la única diferencia de más tareas de entrenamiento. Las etiquetas provienen de la acción registrada; `needs_human` no tiene etiqueta y no se entrena. El conjunto de validación es fijo: 334 filas de 200 tareas distintas, con tareas completas reservadas.

El checkpoint experimental conjunto (noviembre de 2026) se entrenó con 1.740 actualizaciones en 21,656 segundos sobre una ZeroGPU RTX PRO6000 Blackwell MIG de 48 GB: encoder congelado, cabeza de acción/objetivo y scorer, 55 pasos de profesor TRAIN a partir de 35 demostraciones exitosas, 110 características de acción/objetivo y 64 registros de replay de grounding originales. La selección de texto y teclas no se entrenó. El autor advierte que las cifras antiguas de tipo de acción miden una tarea distinta y no equivalen a éxito end-to-end ni a precisión de grounding de objetivos.

## Capacidades

- Predicción del tipo de acción siguiente entre 9 clases: click, type, key, scroll, navigate, move, wait, drag y done.
- Estimación de probabilidad de que la tarea ya esté completada (salida `noul`), junto con valores de confianza.
- Procesamiento de entrada textual estructurada: instrucción de tarea, descripción de pantalla o árbol de accesibilidad (hasta 1.800 caracteres en entrenamiento) e historial de hasta 4 pasos.
- Actuación como router rápido o sanity check para pipelines de agentes que delegan la selección de objetivo y la generación de texto en otro modelo.
- No genera texto, no emite coordenadas ni identificadores de elemento y no procesa imágenes RGB.
- No es un agente completo: requiere un componente externo que decida el elemento concreto y el contenido a escribir.
- Capacidades multilingües: no documentadas.
- Tool calling, function calling y razonamiento multi-paso autónomo: no soportados de forma nativa; el modelo solo clasifica el siguiente tipo de acción.

## Casos de uso

- Enrutado de acciones en agentes GUI: dado el estado textual de la pantalla y el historial, el modelo decide si el siguiente paso es click, type, scroll o done, y un LLM o modelo de grounding se encarga de la coordenada y el texto. Su tamaño de 421M permite ejecutarlo en cada paso con coste mínimo.
- Detección temprana de finalización de tarea: la probabilidad `task_done` sirve como señal de parada para evitar bucles infinitos en agentes que no saben cuándo han terminado, con un coste computacional muy inferior al de consultar un LLM grande.
- Validación de políticas de agente en CI: el modelo puede actuar como clasificador de referencia para comprobar que las trayectorias generadas por un agente producen secuencias de acciones coherentes antes de desplegar cambios.
- Filtrado de pasos inválidos: en un pipeline con varios candidatos de acción, laya-cua puntúa la compatibilidad de cada tipo de acción con el estado de pantalla y descarta opciones incoherentes (por ejemplo, `type` sin campo enfocado).
- Telemetría y análisis de sesiones: clasificar retroactivamente los pasos registrados de sesiones de uso de ordenador para construir métricas de distribución de acciones y detectar anomalías.
- Prototipado rápido en hardware modesto: al caber en CPU y en GPUs de consumo, permite experimentar con lógica de decisión de agentes sin infraestructura de inferencia dedicada.
- Investigación sobre capas de decisión: servir como baseline reproducible para comparar estrategias de enrutado de acciones frente a modelos mayores en entornos como MiniWoB o AgentNet.

## Benchmarks y rendimiento

Resultados en el conjunto de validación reservado (n=334, una ejecución por configuración), solo capa de decisión, sin coordenadas, texto ni visión:

| Métrica | v1 (actual) | v0 (200 tareas) | Laya base | Siempre "click" |
|---|---|---|---|---|
| Precisión de tipo de acción | 0,8084 | 0,7665 | no disponible en la información | no disponible en la información |

Resultados del checkpoint experimental conjunto en una variante MiniWoB de diez decisiones con semillas reservadas antes del entrenamiento (familias de tareas vistas en entrenamiento; no es un benchmark oficial):

| Tarea (base a conjunto, sobre 3) | Resultado |
|---|---|
| click-button | 1 a 3 |
| click-link | 0 a 3 |
| click-dialog | 0 a 2 |
| enter-text | 0 a 2 |
| enter-text-2 | 0 a 0 |
| login-user | 0 a 0 |
| focus-text | 0 to 3 |
| Total | 1/21 a 13/21 |

El grounding general expuesto en DEV empeoró de 11/164 a 10/164. La conversión de mayúsculas/minúsculas y el login de dos campos quedaron en 0/3 cada uno. Los 42 episodios se completaron sin excepciones: 12 victorias emparejadas y ninguna pérdida de éxitos previos. El autor subraya que esta prueba pequeña sobre familias conocidas no establece rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421M de parámetros en safetensors, el peso ronda 1,7 GB en fp32 y aproximadamente 0,85 GB en fp16, más overhead de activaciones.
- GPU recomendadas: el autor cita entrenamiento en una ZeroGPU RTX PRO6000 Blackwell MIG de 48 GB y en una Colab T4 gratuita; para inferencia, cualquier GPU con al menos unos pocos GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; el autor no detalla modelos concretos.
- Opciones de despliegue: la librería `laya` (instalable con `pip install laya`) junto con `huggingface_hub`; el autor no documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento del checkpoint experimental realizó 1.740 actualizaciones en 21,656 segundos en la GPU citada, dato que no equivale a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-cua (sodan) | 421M | Pantalla hasta 1.800 caracteres, historial de 4 pasos | Clasificación de tipo de acción y finalización | Apache-2.0 | Hugging Face |
| convaiinnovations/laya (base) | No disponible en la información | No disponible | Capa de decisión base | No disponible en la información | Hugging Face |
| Alternativas de grounding o agentes GUI de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No genera texto: no puede escribir la cadena a introducir en un campo.
- No emite coordenadas ni identificadores de elemento; no sustituye a un modelo de grounding.
- No lee capturas de pantalla; la entrada es exclusivamente texto (descripción de pantalla o árbol de accesibilidad).
- No es un agente completo: debe combinarse con un LLM, un modelo de grounding o un script que seleccione objetivo y texto.
- La ventana de pantalla está entrenada con hasta 1.800 caracteres y el historial con hasta 4 pasos; estados más largos quedan fuera de la distribución de entrenamiento.
- El checkpoint experimental conjunto se evaluó en familias de tareas vistas durante el entrenamiento y con semillas reservadas; el propio autor indica que no establece rendimiento general y que el grounding general empeoró (11/164 a 10/164).
- La selección de texto y teclas no se entrenó; tareas como conversión de mayúsculas y login de dos campos quedaron en 0/3.
- `needs_human` no tiene etiqueta y no se entrenó, por lo que no hay señal aprendida para ese caso.
- Las cifras antiguas de tipo de acción miden una tarea distinta y no deben interpretarse como éxito end-to-end ni como precisión de grounding.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento tienen sus propias condiciones que conviene verificar.
- Riesgo de alucinación en la clasificación: al ser una capa de decisión, una predicción errónea puede desviar la trayectoria del agente; se recomienda combinarlo con comprobaciones externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sodan/laya-cua
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/xlangai/AgentNet
- Repositorio de la librería `laya`: no disponible en la información
- Paper o blog del autor: no disponible en la información
- Demo: no disponible en la información

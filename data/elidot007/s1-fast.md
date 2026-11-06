# elidot007/S1-Fast

## Resumen

S1-Fast es un modelo de decisión local para agentes de escritorio en Windows, desarrollado por elidot007 como componente del proyecto DesktopAgent. No es un modelo generativo de propósito general: es un encoder especializado que, a partir de la tabla de elementos de una ventana obtenida vía UI Automation (rol, nombre, valor, estado y caja de cada control) más ocho tokens de pantalla, responde en una sola pasada todas las preguntas necesarias para ejecutar un paso de interacción: qué operación realizar, sobre qué elemento, si el paso anterior tuvo éxito, si el subobjetivo se completó, qué texto escribir y qué atajo de teclado usar.

Arquitecturalmente parte de mmBERT-base (22 capas, encoder multilingüe) y añade cabezas de cross-attention para el apuntado sobre candidatos, con un total de 333.249.280 parámetros en fp32. La innovación principal es el enfoque "system-one": en lugar de razonar paso a paso con un LLM grande, resuelve cada decisión en una única pasada de encoder, lo que permite latencias de unos 20 ms en H100 y de 0,7 a 1,5 s por decisión en CPU de portátil.

Su relevancia actual radica en que aborda el cuello de botella de latencia y coste de los agentes GUI basados en modelos multimodales grandes, combinando un modelo rápido con una puerta de ejecución calibrada que decide qué pasos pueden ejecutarse sin verificación adicional. Se distribuye con licencia Apache 2.0 y artefactos de calibración incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base, 22 capas) con cabezas de cross-attention para apuntado sobre candidatos |
| Parametros totales | 333.249.280 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; configurada en `s1_config.json` (no se detalla en la información proporcionada) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 1.3 GB) |
| Modelo base | jhu-clsp/mmBERT-base |
| Torre de visión | google/siglip2-base-patch16-224 (congelada, no incluida) |
| Tamaño del repo | 1.4 GB |
| Librería | PyTorch |

## Arquitectura y entrenamiento

El modelo es un encoder de 22 capas inicializado desde mmBERT-base, al que se añaden cabezas de cross-attention entrenadas desde cero. La entrada combina la tabla de elementos de UI Automation —un token visual por elemento más ocho tokens de pantalla— y la salida se reparte en múltiples cabezas de decisión: clasificación de operación (15 clases), apuntado sobre candidatos para cada tipo de operación, predicción binaria de éxito previo y de subobjetivo completado, extracción de span de texto a escribir y clasificación entre 255 combinaciones de teclas. La torre visual SigLIP2 es opcional y está congelada: sin ella, el modelo opera únicamente con la tabla de elementos.

El entrenamiento consistió en una época de 31.099 pasos sobre dos H100 con batch de 32 por GPU, optimizador AdamW, learning rate de 5e-5 para el encoder y 2e-4 para las cabezas. La función de pérdida combina entropía cruzada suave con un término de Brier, e incluye destilación desde el checkpoint de la ronda anterior (peso 0,5, temperatura 2), dropout de modalidad, negativos duros y sobremuestreo de operaciones raras. Los datos provienen de GUI-360°, Mind2Web, GroundCUA, VideoCUA, OmniACT y AgentNet, entre otras fuentes. El checkpoint publicado corresponde a la ronda 13b y se acompaña de calibración por tipo de pregunta, número de opciones y modalidad, además de una puerta de paso (`step_gate.json`) ajustada out-of-fold por clase de aplicación.

## Capacidades

- Predicción de operación de UI entre 15 tipos: click, set value, select, toggle, expand, scroll, type, hotkey, drag, wait, done, escalate, ask the user, entre otras.
- Apuntado sobre candidatos: selecciona el elemento concreto para cada tipo de operación como un puntero sobre la tabla de elementos de la ventana.
- Predicción de éxito del paso anterior (`prev_ok`) y de finalización del subobjetivo (`subgoal_done`).
- Extracción de span de texto objetivo para escribir en campos de formulario.
- Selección de atajos de teclado entre 255 combinaciones posibles.
- Procesamiento multimodal opcional: tabla de elementos de UI Automation más captura de pantalla vía SigLIP2.
- Soporte de decisión en una sola pasada (system-one), sin razonamiento multi-paso interno.
- Capacidades multilingües limitadas a chino e inglés, con evaluación específica en aplicaciones empresariales chinas.
- Integración con una puerta de ejecución calibrada que decide qué pasos requieren verificación del efecto.
- No es un modelo de generación de texto libre ni de tool calling genérico: su interfaz es la lista de preguntas fija definida en `s1_config.json`.

## Casos de uso

- Automatización de software empresarial en Windows: el modelo lee la tabla de elementos de la ventana activa y emite la operación y el elemento objetivo para cada paso, integrándose en el ejecutor de DesktopAgent para tareas repetitivas sobre ERP, CRM o herramientas internas.
- Agentes de escritorio con latencia baja: con 0,7–1,5 s por decisión en CPU de portátil y unos 20 ms en H100, es adecuado para bucles de interacción donde un LLM grande introduciría demasiada latencia por paso.
- Rellenado de formularios: la cabeza de extracción de span identifica qué fragmento del objetivo o subobjetivo debe escribirse en cada campo, y la cabeza de operación determina el control destino.
- Enrutado con verificación selectiva: la puerta de paso incluida permite ejecutar sin verificación los pasos con confianza ≥ 0,9945 (14,7 % en VideoCUA y 17,8 % en OmniACT con ~1 % de error out-of-fold), derivando el resto a verificación o a un modelo mayor como S1-Accurate.
- Cascada con modelo de razonamiento: los pasos de baja confianza pueden delegarse a S1-Accurate-LoRA, lo que elevó la media macro de 68,0 % a 74,4 % en los subconjuntos evaluados.
- Automatización de aplicaciones con interfaz en chino: pese a no incluir interfaces chinas en el entrenamiento, alcanza 75,8 % de éxito de paso sin subobjetivo y 76,4 % con subobjetivo en aplicaciones originales cn_v1 (559 preguntas).
- Investigación en agentes GUI: sirve como baseline reproducible de un modelo de decisión compacto sobre datasets públicos como Mind2Web, OmniACT o GUI-360°, con métricas y calibración publicadas.

## Benchmarks y rendimiento

Resultados del paper, medidos con la selección de candidatos propia de S1 y recall en dos etapas; el autor advierte que no son comparables con cifras publicadas bajo otros protocolos. Éxito de paso significa operación y elemento objetivo correctos.

| Conjunto de test (held out) | Sin subobjetivo | Subobjetivo en bucle cerrado | Subobjetivo hindsight |
|---|---|---|---|
| VideoCUA (aplicaciones no vistas) | 66,4 | 67,3 | 86,7 |
| OmniACT | 82,6 | 79,7 | 90,3 |
| GUI-360° trayectorias reales | 68,2 | 67,2 | 83,0 |
| Mind2Web cross-task | 46,8 | 60,8 | 68,3 |
| AndroidControl (instrucción humana de bajo nivel) | – | 67,2 | – |
| Media macro | | **68,4** | |

En aplicaciones empresariales chinas:

| Escenario | Métrica | Valor |
|---|---|---|
| Aplicaciones originales cn_v1 (559 preguntas), solo objetivo | Éxito de paso, puntuación equivalente en efecto | 75,8 |
| Aplicaciones originales cn_v1 (559 preguntas), con subobjetivo | Éxito de paso, puntuación equivalente en efecto | 76,4 |
| Aplicaciones generadas, implementaciones de control no vistas | Elemento en primera posición | 97,3 |
| Aplicaciones generadas, implementaciones de control no vistas | Operación correcta | 9,0 |

## Requisitos de hardware

- Pesos en fp32 de 1,3 GB; el repo completo ocupa 1,4 GB. La VRAM necesaria para inferencia es reducida y no se especifica en la información disponible, pero por tamaño cabe holgadamente en cualquier GPU consumer.
- Entrenado en dos H100; inferencia medida en H100 (~20 ms por pasada) y en CPU de portátil (0,7–1,5 s por decisión).
- Cabe en GPU consumer (RTX 4090, RTX 3090, e incluso GPUs de gama media) y funciona en CPU con PyTorch CPU, que es el modo documentado en el script de instalación.
- La torre de visión SigLIP2 es opcional; sin ella el modelo opera solo con la tabla de elementos y reduce requisitos.
- Opciones de despliegue: servicio HTTP propio (`python -m s1.serve` en 127.0.0.1:8765) y uso desde Python mediante `s1.infer.Predictor`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput estimado: no disponible de forma agregada; solo latencias por pasada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-Fast | 333 M | No disponible | Decisión de paso GUI en una pasada de encoder | Apache 2.0 | Hugging Face + repo DesktopAgent |
| S1-Accurate-LoRA | No disponible | No disponible | Modelo de decisión de mayor precisión para cascada | No disponible en la información | Hugging Face (elidot007/S1-Accurate-LoRA) |
| mmBERT-base | No disponible | No disponible | Encoder multilingüe base | No disponible en la información | Hugging Face (jhu-clsp/mmBERT-base) |

No se dispone de datos comparativos de rendimiento frente a otros modelos de decisión GUI en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo predice operaciones y elementos; no ejecuta acciones ni verifica por sí mismo el efecto en la aplicación. Requiere el ejecutor de DesktopAgent y, para pasos no cubiertos por la puerta, verificación en tiempo de ejecución.
- En implementaciones de control generadas no vistas, encuentra el campo correcto el 97,3 % de las veces pero acierta la operación solo el 9,0 %: falla sistemáticamente en la selección de operación fuera de la distribución de entrenamiento.
- En Mind2Web cross-task sin subobjetivo el éxito de paso cae al 46,8 %, lo que limita su uso en tareas de generalización web amplia.
- Idiomas limitados a chino e inglés; no hay evidencia de soporte para otras lenguas.
- La puerta de ejecución es conservadora: en ventanas de Office, navegador y móvil falla en cerrado y solo permite pasos sin verificación cuando el runtime puede leer el efecto.
- Los resultados publicados usan la selección de candidatos y el protocolo propios del autor; no son directamente comparables con cifras de terceros sobre los mismos datasets.
- Riesgo de sesgo hacia las distribuciones de las aplicaciones presentes en los datasets de entrenamiento (GUI-360°, Mind2Web, GroundCUA, VideoCUA, OmniACT, AgentNet); el propio autor documenta el fallo de operación en apps de control.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de UI Automation de Windows y de la torre SigLIP2 (sujeta a su propia licencia) para el modo multimodal.
- No se han publicado datos de cuantización ni de despliegue en runtimes de inferencia de alto throughput.

## Enlaces

- Hugging Face: https://huggingface.co/elidot007/S1-Fast
- Repositorio DesktopAgent: https://github.com/elidot007/desktop-agent
- README de entrenamiento: https://github.com/elidot007/desktop-agent/blob/main/training/README.md
- S1-Accurate-LoRA: https://huggingface.co/elidot007/S1-Accurate-LoRA
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Torre de visión SigLIP2: https://huggingface.co/google/siglip2-base-patch16-224
- Dataset GUI-360°: https://huggingface.co/datasets/vyokky/GUI-360
- Paper: *One Pass, Then Verify: A Fast Local Decision Model for Desktop Agents on Windows Business Software* (enlace arXiv pendiente de publicación según la model card)

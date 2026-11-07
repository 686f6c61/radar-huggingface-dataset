# dongjintao/MAI-Swift-2B

## Resumen

MAI-Swift-2B es un adaptador LoRA publicado por el usuario independiente dongjintao sobre el modelo base Tongyi-MAI/MAI-UI-2B, un modelo de 2B parámetros orientado a interacción con interfaces gráficas. El adaptador especializa el modelo base para predecir acciones de interfaz de Android (tap, scroll, type_text, etc.) a partir de capturas de pantalla, instrucciones en lenguaje natural e historial de acciones ejecutadas, mediante un único paso forward causal sobre un vocabulario cerrado de 105 slots de valor fijos.

Forma parte de la familia GUI-Swift, de la que existe también un miembro de 4B (GUI-Swift-4B). El adaptador se entrenó con SFT sobre el dataset AndroidControl hasta el paso 4658 y ocupa 433,68M de parámetros (1,73 GB en safetensors). Se distribuye bajo licencia Apache 2.0 y se carga con la librería PEFT.

El interés del modelo reside en su enfoque de "single-pass": en lugar de generar texto libre token a token, el modelo mapea la observación a una acción estructurada en un solo forward, lo que simplifica el parseo y reduce la variabilidad de la salida. El propio autor advierte que se trata de una release de investigación independiente, no oficial del equipo MAI, y que no se reclama ninguna ventaja medida de velocidad ni de tasa de éxito en tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer causal MAI-UI-2B; predicción sobre 105 slots de valor fijos |
| Parametros totales | 433,68M en el adaptador (modelo base: 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre MAI-UI-2B, un transformer causal de 2B parámetros, y se entrena mediante LoRA con SFT sobre AndroidControl. La innovación central es el mecanismo de slots fijos: el modelo no genera la acción como texto libre, sino que realiza un único forward causal nativo sobre 105 slots de valor predefinidos, de modo que la salida es directamente una estructura de acción (tipo de acción y campos como coordenadas o texto). La entrada combina captura de pantalla actual, instrucción y, cuando existe, historial de observaciones con el recibo de la acción previamente ejecutada y su resultado observado.

El checkpoint publicado corresponde al paso 4658 del entrenamiento SFT. El autor no documenta el número de tokens de entrenamiento, la composición detallada del dataset más allá de AndroidControl, ni si hubo etapas de RLHF o DPO. El adaptador pesa 433,68M de parámetros y 1,73 GB, lo que sugiere que cubre una fracción amplia de las capas del modelo base.

## Capacidades

- Predicción de acciones de GUI Android: tap con coordenadas, scroll (scroll_down y similares), type_text con cadena de texto y otras acciones del vocabulario de 105 slots.
- Comprensión de capturas de pantalla como entrada visual junto con la instrucción en lenguaje natural.
- Uso de historial multi-turno: acepta turnos previos con la acción realmente ejecutada y el resultado observado (receipt).
- Salida estructurada directa en un solo forward, sin generación de texto libre, lo que facilita el parseo determinista.
- Soporte de instrucciones en inglés en los ejemplos publicados (por ejemplo, "Tap Settings", "type the text running shoes").
- No se documentan capacidades de tool calling genérico, agentes multi-paso fuera del bucle de GUI, matemáticas, código ni audio.

## Casos de uso

- Automatización de pruebas de aplicaciones Android: el modelo puede generar la siguiente acción a partir de una captura y una instrucción, integrándose en un runner de tests que ejecute tap, scroll o entrada de texto sobre el dispositivo.
- Agentes de automatización de tareas móviles: con el historial de acciones y receipts, se puede construir un bucle cerrado que observe la pantalla, prediga la acción, la ejecute y realimente el resultado para el siguiente paso.
- Asistencia a usuarios en apps móviles: dado un objetivo en lenguaje natural y la pantalla actual, el modelo propone la acción concreta (por ejemplo, localizar un producto y tocarlo), útil en asistentes de accesibilidad o guiado paso a paso.
- Extracción de intención de UI para pipelines de RPA móvil: la salida estructurada sobre slots fijos permite mapear directamente a comandos de un motor de automatización sin necesidad de un parser de lenguaje natural intermedio.
- Investigación en agentes GUI: sirve como baseline ligero de 2B para comparar estrategias de acción estructurada frente a generación de texto libre en entornos AndroidControl.
- Prototipado en hardware de consumo: al ser un adaptador sobre un modelo de 2B, puede ejecutarse en una GPU de 24 GB como la RTX 4090 usada en la verificación del autor, lo que facilita experimentación local.

## Benchmarks y rendimiento

El autor reporta una validación offline sobre 690 pasos guardados, con una métrica de coincidencia por tolerancia: misma acción y campos, cada eje de coordenada dentro de ±5%, similitud de edición de texto ≥90% y el resto de parámetros exactos. Los umbrales se eligieron tras inspeccionar la validación. Se trata de una métrica de siguiente acción, no de tasa de éxito de tarea completada. No se publican cifras agregadas de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otros modelos.

| Metrica | Valor |
|---|---|
| Pasos de validación guardados | 690 |
| Tolerancia de coordenadas | ±5% por eje |
| Similitud de texto mínima | ≥90% |
| Tasa de éxito de tarea completada | no disponible |
| Benchmarks estándar (MMLU, HumanEval, GSM8K) | no disponible |

## Requisitos de hardware

- Verificación oficial realizada en una GPU CUDA con 24 GB de VRAM (RTX 4090), con Torch 2.9.1 CUDA y Python 3.10.
- El adaptador ocupa 1,73 GB; el modelo base de 2B requiere VRAM adicional según precisión (no se documentan cifras exactas de VRAM total).
- Cabe en GPU de consumo de gama alta con 24 GB; para GPUs de 8-16 GB no hay datos publicados de cuantización ni de ejecución.
- Despliegue previsto mediante el script `infer.py` del repositorio, con un runtime bundle preparado por `prepare_dependencies.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reclama ninguna mejora de velocidad medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAI-Swift-2B | 433,68M adaptador sobre base de 2B | no disponible | LoRA sobre MAI-UI-2B, slots fijos para GUI Android | Apache 2.0 | Hugging Face (dongjintao) |
| GUI-Swift-4B | no disponible | no disponible | Miembro de 4B de la misma familia GUI-Swift | no disponible | Hugging Face (dongjintao) |
| MAI-UI-2B | 2B | no disponible | Modelo base de interacción GUI | no disponible | Hugging Face (Tongyi-MAI) |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Release de investigación independiente: no es un modelo oficial del equipo MAI y el autor no reclama ventajas medidas de velocidad ni de éxito en tareas reales.
- La métrica publicada es de siguiente acción con tolerancia, no de tasa de éxito de tarea completada; no debe interpretarse como rendimiento end-to-end.
- Se documenta un fallo de texto: ante la instrucción "Search for Black day", el modelo predijo "Black day day", lo que indica riesgo de repetición en entradas de texto.
- La galería de ejemplos se seleccionó tras la evaluación e incluye un fallo; no estima el rendimiento global.
- No se documentan sesgos conocidos, cobertura de idiomas ni comportamiento fuera del dominio AndroidControl.
- No se documentan restricciones adicionales de licencia más allá de Apache 2.0, pero el uso comercial debe verificarse también contra la licencia del modelo base MAI-UI-2B.
- No hay datos publicados sobre cuantización, contexto máximo ni latencia, lo que limita la planificación de despliegues en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/dongjintao/MAI-Swift-2B
- Modelo base MAI-UI-2B: https://huggingface.co/Tongyi-MAI/MAI-UI-2B
- Miembro de 4B de la familia GUI-Swift: https://huggingface.co/dongjintao/GUI-Swift-4B
- README en chino: README_zh.md (en el repositorio del modelo)
- Ejemplos de validación: examples/validation/ (en el repositorio del modelo)

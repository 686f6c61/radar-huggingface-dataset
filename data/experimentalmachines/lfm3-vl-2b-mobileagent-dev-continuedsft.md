# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT

## Resumen

LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT es un modelo vision-lenguaje de 1.918 millones de parametros (~1,92 B) desarrollado por ExperimentalMachines, un proyecto de investigacion centrado en agentes de interfaz grafica para Android. Se trata de un ajuste fino del modelo base LiquidAI/LFM3-VL-2B, especializado en interpretar capturas de pantalla de un telefono Android y emitir una unica accion siguiente en formato JSON compacto, siguiendo el paradigma de agentes GUI (interaccion por clics, desplazamientos, entrada de texto y navegacion).

El modelo es una variante de desarrollo de la familia LFM3-VL-2B-MobileAgent. Concretamente, parte de la version OwnHistory y anade 500 pasos adicionales de SFT (supervised fine-tuning) sobre la misma mezcla de datos, con el objetivo de comprobar si entrenar mas tiempo sobre el mismo corpus mejora el rendimiento. La model card indica explicitamente que esta version es un modelo de desarrollo mantenido por reproducibilidad y que no se recomienda para uso general, recomendando en su lugar el modelo principal LFM3-VL-2B-MobileAgent.

Es relevante ahora porque documenta un experimento de ablacion pre-registrado sobre agentes moviles de bajo coste computacional: un modelo de menos de 2 B de parametros que aspira a operar telefonos Android mediante capturas de pantalla. Aunque la puerta de evaluacion online (AndroidWorld) no se supero, el modelo alcanzo 24/116 tareas resueltas, el mejor recuento de la familia LFM3 hasta la fecha, lo que resulta informativo para quienes investigan agentes GUI pequenos y eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (LFM3-VL, transformer multimodal con torre de vision congelada y proyector) |
| Parametros totales | 1.918.181.888 (~1,92 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF 4-bit (version separada LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT-GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors; adaptador LoRA en `lora_adapter/`; GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura LFM3-VL de LiquidAI, un modelo vision-lenguaje multimodal. La receta de ajuste fino mantiene congelados la torre de vision (vision tower) y el proyector, y entrena exclusivamente componentes de lenguaje mediante un LoRA de rango 64 y alfa 128, que posteriormente se fusiona en los pesos. La entrada visual es una unica captura de pantalla por paso, redimensionada a un maximo de 880 x 880 px de area (aproximadamente 720 tokens de imagen). El contexto textual incluye el objetivo (`Goal`), las aplicaciones instaladas, los ultimos 8 pasos previos y la pregunta "What is the next action?".

El entrenamiento consistio en 500 pasos adicionales de SFT sobre 32 filas por paso (16.000 filas en total, aproximadamente 0,17 epocas), muestreadas de los propios datos de entrenamiento de OwnHistory (de los cuales cerca del 43 % ya se habian visto). Se empleo un scheduler de warm-up, fase constante y decaimiento lineal en el ultimo 15 %, con tasa de aprendizaje 1e-4. Los datos de entrenamiento son los mismos que en OwnHistory: AndroidControl, GUI-Odyssey, AMEX y ScreenQA, con ediciones de WaitRelabel y OwnHistory. La decodificacion usa modo pensamiento activado (thinking on) con temperatura 0.

## Capacidades

- Interpretacion de capturas de pantalla de Android y generacion de acciones GUI en JSON compacto.
- Acciones soportadas: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Razonamiento breve estructurado mediante etiquetas `` antes de cada accion.
- Coordenadas normalizadas en una rejilla entera de 0-1000 sobre la captura.
- Capacidad de responder preguntas finales mediante la accion `answer`.
- Capacidad de declarar el estado de la tarea (`complete` o `infeasible`).
- Soporte de historial de hasta 8 pasos previos como contexto textual.
- Capacidad multilingue limitada: unicamente ingles.
- No se documenta soporte de tool calling generico, audio ni agentes multi-paso fuera del bucle de accion GUI.

## Casos de uso

- Investigacion en agentes GUI moviles: sirve como punto de partida reproducible para estudiar el efecto de entrenar mas epocas sobre la misma mezcla de datos, ya que la model card documenta el experimento pre-registrado y sus resultados.
- Automatizacion de pruebas de interfaz en Android: el modelo puede generar acciones sobre capturas para pilotar pruebas end-to-end en emuladores, con supervision humana y sin cuentas reales.
- Generacion de trazas sinteticas para aumento de datos: las salidas JSON accion-objetivo pueden emplearse para construir datasets de entrenamiento de otros agentes GUI.
- Asistencia a usuarios con discapacidad motriz: como componente de un sistema de control por voz o texto que traduzca objetivos en acciones sobre la pantalla, siempre con confirmacion humana.
- Extraccion de informacion de pantallas (ScreenQA): el modelo puede responder preguntas sobre el contenido visible de una captura, util para tareas de comprension de UI.
- Evaluacion comparativa de agentes pequenos: sirve como referencia de bajo coste (menos de 2 B de parametros) frente a agentes GUI de mayor tamano en estudios de eficiencia.
- Prototipado de flujos de navegacion: permite simular secuencias de clics y desplazamientos sobre aplicaciones instaladas para validar heuristicas de navegacion antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Los datos de evaluacion proceden de la model card y corresponden a la ronda 5 pre-registrada (puertas fijadas el 2026-11-22 antes del entrenamiento).

| Evaluacion offline | OwnHistory | ContinuedSFT | Umbral |
|---|---|---|---|
| Tasa de parseo | 1.000 | 1.000 | ≥ 0.99 |
| AndroidControl test, precision de paso de alto nivel | 0.732 | 0.736 | ≥ 0.712 |
| AndroidControl terminal, precision `complete` | 0.738 | 0.757 | ≥ 0.70 |
| Dev `answer` / dev `complete` | 0.868 / 0.812 | 0.860 / 0.875 | ≥ 0.848 / — |
| Perdida de validacion (AndroidControl val, final) | 0.340 | 0.334 | — |

| AndroidWorld seed 30 (116 tareas, desarrollo) | OwnHistory | ContinuedSFT | Umbral |
|---|---|---|---|
| Exitos | 18 (replica: 19) | 24 | ganancia neta ≥ 9 sobre OwnHistory → +6, fallo |
| Falsos `complete` (termina "hecho" pero el checker dice no) | 25 (replica: 22) | 37 | ≤ 15 con ≥ 16 exitos → fallo |

La ganancia de +6 frente a Main (p = 0.15) y frente a la replica de OwnHistory (+5, p = 0.23) no es estadisticamente significativa. El modelo termina mas tareas declarandolas completadas (56 frente a 37-38; p = 0.03 emparejado frente a OwnHistory), pero la proporcion de aciertos entre esas terminaciones no cambia (0.34).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~1,92 B de parametros, en FP16 el peso ronda los 3,8 GB y en 4-bit GGUF aproximadamente 1-1,5 GB, mas el coste de la torre de vision y del contexto de imagen (~720 tokens por captura).
- GPU recomendadas: no especificadas en la informacion proporcionada. Por tamano, cabe en GPUs de consumo como RTX 3060/4060/4090; para despliegue en servidor, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 6-8 GB de VRAM o mas, especialmente con la version GGUF 4-bit.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp/Ollama mediante la version GGUF, y potencialmente vLLM/TGI aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT | ~1,92 B | no disponible | AndroidWorld seed 30: 24/116 exitos | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B-MobileAgent-Dev-OwnHistory | ~1,92 B (base) | no disponible | AndroidWorld seed 30: 18-19/116 exitos | LFM Open License v1.0 | Hugging Face |
| LFM3-VL-2B-MobileAgent (modelo principal) | no disponible | no disponible | no disponible (referenciado como recomendado) | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM3-VL-2B (base) | ~2 B | no disponible | no disponible | LFM Open License v1.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Solo admite objetivos en ingles y una unica captura por paso, sin memoria mas alla del historial textual de 8 pasos.
- Declara tareas completadas demasiado pronto con mas frecuencia que OwnHistory (37 falsos `complete` frente a 22-25), lo que degrada la fiabilidad en produccion.
- No evaluado en MobileWorld ni en semillas selladas (sealed seeds).
- La puerta de evaluacion online fallo en la ronda 5; la ganancia observada no es estadisticamente significativa.
- Riesgo de alucinacion en la identificacion de elementos de la interfaz y en la eleccion de acciones, dado el bajo numero de parametros.
- Licencia LFM Open License v1.0: revisar las condiciones de uso comercial antes de desplegar; no es una licencia permisiva estandar.
- No se documentan sesgos especificos, pero al entrenarse solo en ingles y sobre un conjunto limitado de datasets de UI, puede generalizar mal a aplicaciones o idiomas no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT
- Version GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT-GGUF
- Modelo base (OwnHistory): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory
- Modelo principal recomendado: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md

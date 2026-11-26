# experimentalmachines/Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly

## Resumen

Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly es un modelo vision-lenguaje de 2.213 millones de parametros desarrollado por ExperimentalMachines, obtenido mediante fine-tuning supervisado (LoRA SFT) del modelo base Qwen/Qwen3.5-2B sobre el dataset AndroidControl. Su proposito es actuar como agente de control de interfaces moviles: recibe una captura de pantalla de un telefono Android, el objetivo del usuario y el historial de los ultimos ocho pasos, y emite una unica accion en formato JSON (clic, scroll, entrada de texto, apertura de app, etc.) con coordenadas normalizadas en una rejilla de 0 a 1000.

El modelo es un checkpoint de desarrollo concebido para comparar bases: se entreno con exactamente la misma receta y datos que LFM3-VL-2B-MobileAgent-Dev-AndroidControlOnly, con el objetivo de evaluar como se comporta Qwen3.5-2B frente a LFM3-VL-2B en la misma tarea. El autor lo marca explicitamente como no recomendado para uso general y remite al modelo principal del proyecto, LFM3-VL-2B-MobileAgent.

Es relevante ahora porque ejemplifica la tendencia de agentes GUI pequenos y desplegables en dispositivo: un modelo de poco mas de 2.000 millones de parametros que procesa una captura por paso (hasta 880 x 880 px, unos 720 tokens de imagen) y genera acciones estructuradas, con una version cuantizada a 4 bits en GGUF pensada para ejecucion local en telefono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) derivado de Qwen3.5-2B; torre de vision congelada durante el SFT |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF 4 bits (version publicada aparte); el repo principal contiene safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors (pesos fusionados), adaptador LoRA en `lora_adapter/`, GGUF 4 bits en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal de tipo image-text-to-text. Sobre esa base se aplico un SFT con LoRA de rango 64 y alpha 128 unicamente sobre el modelo de lenguaje, manteniendo congelada la torre de vision; posteriormente el adaptador se fusiono en los pesos finales (se conserva una copia del adaptador en `lora_adapter/`). El entrenamiento consistio en 1.250 pasos con batches de 32 filas y una tasa de aprendizaje de 2e-4.

Los datos provienen del dataset MobileAgent-SFT-AndroidControl (99.216 filas), construido a partir de AndroidControl. Cada ejemplo incluye una captura de pantalla redimensionada a un maximo de 880 x 880 px de area (aproximadamente 720 tokens de imagen), el objetivo en texto, los ultimos ocho pasos en formato `n. <intent> -> <action JSON>` y la pregunta "What is the next action?". La salida esperada combina un bloque ``) antes de emitir la accion.
- Seguimiento de objetivos multi-paso mediante historial textual de los ultimos ocho pasos.
- Respuesta a preguntas sobre el contenido de la pantalla mediante la accion `answer`.
- Deteccion de tareas completadas o infeasibles mediante la accion `status`.
- Comprension de imagen (una captura por paso) y texto en ingles.
- No se documenta soporte de tool calling generico, audio ni otros idiomas distintos del ingles.

## Casos de uso

- Automatizacion de pruebas de interfaz en Android: el modelo puede generar secuencias de acciones sobre una app a partir de un objetivo en lenguaje natural, lo que permite construir pruebas end-to-end guiadas por objetivo en lugar de scripts fragiles de coordenadas fijas.
- Agente de accesibilidad para usuarios con movilidad reducida: dado un objetivo como "abre los ajustes y activa el modo avion", el modelo propone el siguiente toque o scroll sobre la captura actual, integrándose en una capa de asistencia que ejecuta la accion.
- Asistente de navegacion dentro de apps: el modelo responde a la accion `answer` para preguntas sobre lo que muestra la pantalla, util en soporte guiado paso a paso donde el usuario no encuentra un ajuste.
- Investigacion en agentes GUI: sirve como checkpoint de comparacion reproducible frente a LFM3-VL-2B con los mismos datos y receta, para estudiar el efecto del modelo base en el rendimiento de control movil.
- Prototipado de automatizacion de tareas repetitivas en dispositivos de prueba: con la version GGUF de 4 bits puede ejecutarse en el propio telefono o en un portatil para tareas de laboratorio sobre cuentas desechables.
- Generacion de datos sinteticos de trayectorias: las acciones propuestas por el modelo pueden usarse para anotar o aumentar datasets de control de interfaz, siempre con revision humana.
- Evaluacion de robustez multimodal: al procesar capturas reales de Android con resolucion variable, es util para medir como afecta la compression de imagen a la precision de localizacion de elementos.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-2B AndroidControlOnly | LFM3-VL-2B AndroidControlOnly |
|---|---|---|
| AndroidWorld seed 30 (116 tareas, desarrollo) | 16 | 15 |
| AndroidControl test, precision de paso high-level | 0.734 | 0.715 |
| AndroidControl test, precision de paso low-level | 0.949 | 0.948 |
| Precision terminal `complete` | 0.784 | 0.792 |
| MMStar | 57,3 % | 57,1 % |
| MMLU | 53,7 % | 49,5 % |
| Apple M5 GPU, segundos medianos por paso | 4,20 | 2,66 |

Con los mismos datos y receta, ambos modelos base quedan muy proximos en las tareas de control; LFM3-VL-2B es aproximadamente 1,6 veces mas rapido por paso en el Mac M5. Qwen3.5-2B obtiene mejor MMLU (53,7 % frente a 49,5 %) y ligera ventaja en precision de paso high-level, mientras que LFM3-VL-2B supera ligeramente en precision terminal.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (safetensors): aproximadamente 4,5-5 GB solo para pesos, mas overhead de activaciones y cache de imagen; en la practica unos 6-8 GB en GPU.
- Version GGUF de 4 bits: los pesos bajan a aproximadamente 1,2-1,5 GB, lo que permite ejecucion en telefonos de gama alta y en GPUs de consumo con 4 GB o mas.
- GPUs recomendadas: NVIDIA A100 o H100 para evaluacion a escala y batches grandes; RTX 4090, RTX 3090 o RTX 4080 para inferencia interactiva en precision completa; RTX 3060 de 12 GB o superior para cuantizaciones.
- Cabe en GPU de consumo: si, tanto en precision completa en tarjetas de 8 GB o mas como en 4 bits en tarjetas de 4 GB.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp u Ollama con el GGUF de 4 bits, y servidores compatibles con la API de transformers. No se documenta soporte especifico de vLLM o TGI en la informacion disponible.
- Latencia: 4,20 segundos medianos por paso en Apple M5 GPU con la configuracion evaluada; no se publican cifras de throughput en GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AndroidWorld (seed 30) | MMStar | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly | 2.213 M | no disponible | 16 | 57,3 % | Apache-2.0 | Hugging Face, GGUF 4 bits |
| LFM3-VL-2B-MobileAgent-Dev-AndroidControlOnly | no disponible en la informacion | no disponible | 15 | 57,1 % | no disponible | Hugging Face |
| LFM3-VL-2B-MobileAgent (modelo principal del proyecto) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparacion directa disponible se limita al par de checkpoints de desarrollo del mismo proyecto, entrenados con datos y receta identicos. No se dispone de datos de otros agentes GUI moviles de tamano comparable en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de desarrollo: el propio autor lo marca como no recomendado y remite a LFM3-VL-2B-MobileAgent como modelo principal del proyecto.
- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Solo admite objetivos en ingles; no se documenta soporte multilingue.
- Procesa una unica captura por paso y no tiene memoria mas alla del historial textual de ocho pasos, lo que limita tareas que requieran contexto visual o temporal mas largo.
- Entrenado exclusivamente con demostraciones grabadas; nunca ha interactuado con un telefono en vivo durante el entrenamiento, por lo que puede degradarse ante estados de pantalla no vistos.
- Riesgo de alucinacion en la localizacion de coordenadas y en la eleccion de accion cuando el elemento no es visible o la captura es ambigua.
- La precision de paso low-level (0,949) es alta, pero la terminal `complete` (0,784) indica que una parte relevante de tareas no se finaliza correctamente.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; deben respetarse igualmente las condiciones del modelo Qwen subyacente.
- El repositorio tiene un tamano de 4,7 GB y muy poca adopcion (19 descargas, 0 likes), lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly
- Version GGUF 4 bits: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly-GGUF
- Modelo principal del proyecto: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-AndroidControl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md

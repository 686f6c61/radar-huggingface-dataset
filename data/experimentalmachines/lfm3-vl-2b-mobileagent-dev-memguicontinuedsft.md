# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT

## Resumen

LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT es un modelo de investigacion de tipo vision-lenguaje (image-text-to-text) especializado en actuar como agente autonomo sobre telefonos Android. Lo desarrolla experimentalmachines como un checkpoint intermedio de la ronda 6 del proyecto LFM3 Mobile Agent, partiendo del modelo base experimentalmachines/LFM3-VL-2B-MobileAgent, que a su vez deriva de LiquidAI/LFM3-VL-2B. El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y devuelve una unica accion JSON (click, scroll, input_text, open_app, etc.) sobre una rejilla normalizada de 0 a 1000.

El modelo resuelve el problema de la automatizacion de tareas GUI en movil: dado un objetivo como "envia un mensaje a X" o "activa el modo avion", el agente debe decidir el siguiente paso observando solo la pantalla y un historial textual corto (ultimos 8 pasos). Con 1.918.181.888 parametros reales (cerca de 2B), esta pensado para ejecutarse en un telefono mediante cuantizacion 4-bit GGUF.

Es relevante ahora porque demuestra una receta concreta de ajuste fino con LoRA sobre un VLM pequeno para tareas de agente, con evaluacion offline pre-registrada y criterios de promocion explicitos. El propio autor lo marca como modelo de desarrollo no promocionado: fallo una de las comprobaciones del gate (paradas prematuras en pasos tardios de AndroidControl) y no se ejecuto online. Se conserva unicamente para reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (LFM3-VL), transformer con torre de vision; pesos en safetensors con custom_code |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial textual limitado a los ultimos 8 pasos) |
| Tipos de cuantizacion | 4-bit GGUF (Q4_K_M + vision projector); pesos bf16 en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (modelo fusionado) + adaptador LoRA en `lora_adapter/`; GGUF 4-bit en repo aparte |

## Arquitectura y entrenamiento

El modelo es un VLM de aproximadamente 2B parametros con una torre de vision congelada durante el ajuste. Sobre los pesos fusionados del modelo base se aplico un LoRA SFT de rango 64 y alpha 128, entrenado durante 500 pasos con 32 filas por paso y una tasa de aprendizaje de 1e-4 con warm-up, fase estable y decaimiento corto, todo en una unica A100. El adaptador se fusiono en los pesos finales y tambien se conserva en `lora_adapter/`.

Los datos de entrenamiento combinan dos fuentes: MobileAgent-SFT en el commit `3375539` y MobileAgent-SFT-MemGUI en el commit `2b481ae3`, con filas MemGUI-3K filtradas para excluir las apps de AndroidWorld, MobileWorld y AndroidLab. La mezcla fue 50% MemGUI y 50% filas del modelo principal durante 500 pasos adicionales. La entrada es una unica captura por paso redimensionada a un maximo de 880 x 880 px de area, junto con el objetivo, la lista de apps instaladas y los ultimos 8 pasos; la salida es un bloque `` antes de la accion.
- Respuesta a preguntas del usuario mediante la accion `answer`, y finalizacion de tareas mediante `status` con `complete` o `infeasible`.
- Soporte de tool calling / function calling de facto: la salida es una llamada a una de las acciones predefinidas del system prompt.
- Capacidad multilingue: solo ingles.
- Capacidad de vision: si, una captura por paso.
- Capacidad de audio: no disponible.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo puede generar secuencias de acciones a partir de capturas para recorrer flujos de aplicacion, util para generar trayectorias sinteticas de test en pipelines de CI.
- Agente de accesibilidad para usuarios con movilidad reducida: dado un objetivo en ingles, el modelo propone el siguiente toque o desplazamiento sobre la pantalla, con la ventaja de su tamano de 2B y su cuantizacion 4-bit que permite ejecucion local.
- Investigacion en agentes GUI: sirve como checkpoint de referencia para reproducir la ronda 6 del proyecto, comparar recetas de SFT con LoRA y estudiar el comportamiento de parada en tareas largas.
- Generacion de datos de entrenamiento: sus trayectorias pueden filtrarse y usarse como ejemplos para modelos mayores o para destilacion, dado que el formato de salida es JSON estructurado.
- Evaluacion de robustez de agentes: al estar marcado como no promocionado, es util para analizar modos de fallo concretos, como las paradas prematuras en pasos tardios.
- Prototipado de asistentes de movil en local: con el GGUF Q4_K_M se puede desplegar en un telefono o en una estacion de trabajo con GPU de consumo para experimentar con el bucle percepcion-accion.
- Benchmarking interno de VLMs pequenos: su tamano y su formato de salida fijo facilitan comparaciones controladas frente a otros modelos de 2B en tareas de grounding de pantalla.

## Benchmarks y rendimiento

Evaluacion offline con Transformers en bf16, decodificacion greedy y los mismos splits pre-renderizados para el modelo principal y los candidatos. AndroidLens English consta de 172 episodios largos solo de evaluacion, con historial de referencia estatico.

| Metrica | MemGUIContinuedSFT | Main | Umbral del gate |
|---|---|---|---|
| AndroidControl test, precision de paso de alto nivel | 0.724 | 0.727 | >= 0.707 |
| `dev_answer` / `dev_complete` | 0.875 / 0.788 | 0.890 / 0.763 | >= 0.840 / >= 0.713 |
| AndroidControl pasos >= 4: `status` predicho | 9.8% | 9.0% | <= 6.0% |
| AndroidLens precision de paso en pasos >= 10 | 0.413 | 0.367 | >= 0.347 |
| AndroidLens precision de paso, todos los pasos | 0.444 | 0.414 | no disponible |
| AndroidLens `complete` en el ultimo paso real | 47.7% | 12.2% | no disponible |
| MemGUI dev precision de paso | 0.698 | 0.421 | no disponible |

El modelo mejora la precision en tareas largas y la parada en el final real de tareas largas, pero no supera el umbral de paradas prematuras en pasos tardios de AndroidControl (9.8% frente al maximo del 6.0%), motivo por el que no fue promocionado. No se ejecuto en AndroidWorld ni MobileWorld.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4 GB solo para pesos, mas overhead de activaciones y del proyector de vision; en la practica se recomienda 8 GB o mas.
- VRAM estimada en GGUF Q4_K_M: alrededor de 1,5-2 GB para pesos, con margen adicional para el proyector de vision y el contexto.
- GPU recomendadas: A100 40/80 GB para entrenamiento y evaluacion en bf16 (el entrenamiento se hizo en una unica A100); para inferencia basta una RTX 3090, RTX 4090 o similar.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB usando el GGUF Q4_K_M.
- Opciones de despliegue: transformers con custom_code para bf16; llama.cpp u Ollama para el GGUF Q4_K_M; vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT | 1,92B | no disponible (historial de 8 pasos) | Agente GUI Android, solo captura | LFM Open License v1.0 | Desarrollo, no promocionado |
| experimentalmachines/LFM3-VL-2B-MobileAgent | no disponible (misma base LFM3-VL-2B) | no disponible | Agente GUI Android | LFM Open License v1.0 | Evaluado y promocionado |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | VLM generalista base | LFM Open License v1.0 | Modelo base publico |

No se dispone de datos de benchmarks de terceros para comparar con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion no promocionado: no debe usarse de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Fallo el gate de paradas prematuras en pasos tardios de AndroidControl (9.8% frente al maximo del 6.0%); aproximadamente la mitad de esas paradas ocurren un paso antes del final, donde las demostraciones humanas anaden un scroll o wait final.
- No se ejecuto en AndroidWorld ni MobileWorld, por lo que no hay evidencia de rendimiento en esos entornos.
- Solo acepta objetivos en ingles.
- Una unica captura por paso y sin memoria mas alla de los 8 pasos de historial textual.
- Riesgo de alucinacion en la identificacion de elementos de pantalla y en la eleccion de apps no instaladas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia LFM Open License v1.0: revisar las condiciones de uso comercial antes de desplegar en produccion.
- El repositorio incluye custom_code, por lo que requiere `trust_remote_code=True` en transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT
- Modelo base (Main): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Version GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT-GGUF
- Dataset MobileAgent-SFT: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT
- Dataset MobileAgent-SFT-MemGUI: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-MemGUI
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Resultados completos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
- Pre-registro de la ronda 6: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/preregistrations/round-06-long-trajectories.md

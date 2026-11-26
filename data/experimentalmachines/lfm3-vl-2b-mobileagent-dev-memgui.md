# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUI

## Resumen

LFM3-VL-2B-MobileAgent-Dev-MemGUI es un checkpoint de desarrollo de un agente movil para Android construido sobre el modelo vision-lenguaje LiquidAI/LFM3-VL-2B. Lo desarrolla el usuario experimentalmachines dentro del proyecto LFM3 Mobile Agent y resuelve una tarea muy concreta: dado un objetivo en lenguaje natural, un listado de aplicaciones instaladas, el historial de los ultimos 8 pasos y una captura de pantalla, predecir la siguiente accion sobre la interfaz como un objeto JSON compacto.

Tecnicamente es un ajuste fino por LoRA SFT (rank 64, alpha 128) sobre el modelo base de 1.918.181.888 parametros (aproximadamente 1,9 mil millones), con la torre de vision congelada y el adaptador fusionado en los pesos finales. El entrenamiento anade 8.505 filas del dataset MemGUI con trayectorias largas y autocorrectivas, sobre la receta del modelo principal LFM3-VL-2B-MobileAgent.

Es relevante ahora porque documenta un intento reproducible de mejorar el comportamiento en tareas largas de un agente GUI movil. El autor lo marca explicitamente como no promocionado: fallo una de las comprobaciones preinscritas de la ronda (paradas prematuras en pasos tardios de AndroidControl) y no se evaluo en linea. La version recomendada para uso es LFM3-VL-2B-MobileAgent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (familia LFM3-VL), adaptado mediante LoRA SFT |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de texto limitado a los ultimos 8 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (adaptador LoRA tambien en `lora_adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B en el commit `23387be`, un modelo vision-lenguaje de unos 1,9 mil millones de parametros que recibe una captura de pantalla por paso, redimensionada a un maximo de 880 x 880 pixeles de area, junto con texto estructurado: `Goal: ...`, `Installed apps: ...`, `Previous steps:` (ultimos 8 pasos) y `What is the next action?`. La salida combina un bloque `` antes de cada accion.
- Memoria de corto plazo basada en el historial de texto de los ultimos 8 pasos (sin memoria visual ni estado persistente).
- Trayectorias largas y autocorrectivas gracias al entrenamiento adicional con filas MemGUI.
- Finalizacion de tareas mediante `answer` (respuesta a preguntas) o `status` (`complete` / `infeasible`).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en agentes GUI moviles: sirve como checkpoint reproducible para estudiar el efecto de anadir trayectorias largas y autocorrectivas al entrenamiento de un agente de 2B, comparandolo con LFM3-VL-2B-MobileAgent sobre los mismos splits pre-renderizados.
- Automatizacion de pruebas de interfaz en Android: el modelo puede generar secuencias de acciones (toques, scrolls, entradas de texto) para recorrer flujos de una app en entornos de test controlados, sin cuentas reales.
- Generacion de datos sinteticos de interaccion: sus salidas JSON en formato fijo pueden usarse como etiquetas candidatas para ampliar datasets de agentes moviles, filtrando despues por calidad.
- Analisis de politicas de parada: al medir cuando emite `status: complete` frente al ultimo paso real, es util para estudiar el problema de las paradas prematuras en tareas largas.
- Prototipado de asistentes de accesibilidad en laboratorio: dado que opera solo con capturas, puede explorarse como capa de interpretacion de pantalla para sugerir acciones, siempre con supervision humana.
- Evaluacion comparativa de tecnicas de ajuste: el adaptador LoRA separado en `lora_adapter/` permite reproducir el entrenamiento y medir el impacto de la fusion de pesos frente al uso del adaptador sin fusionar.

## Benchmarks y rendimiento

Evaluacion offline con Transformers en bf16, decodificacion greedy y los mismos splits pre-renderizados para el modelo principal y los candidatos.

| Metrica | MemGUI | Main | Umbral |
|---|---|---|---|
| AndroidControl test, precision de paso de alto nivel | 0,729 | 0,727 | >= 0,707 |
| `dev_answer` / `dev_complete` | 0,890 / 0,700 | 0,890 / 0,763 | >= 0,840 / >= 0,713 |
| AndroidControl pasos >= 4: `status` predicho | 8,5% | 9,0% | <= 6,0% |
| AndroidLens precision de paso en pasos >= 10 | 0,401 | 0,367 | >= 0,347 |
| AndroidLens precision de paso, todos los pasos | 0,448 | 0,414 | no disponible |
| AndroidLens `complete` en el ultimo paso real | 21,5% | 12,2% | no disponible |
| MemGUI dev precision de paso | 0,668 | 0,421 | no disponible |

El checkpoint no supero el umbral de paradas prematuras en pasos tardios de AndroidControl (8,5% frente al maximo del 6,0%), por lo que no fue promocionado ni evaluado en linea. Aproximadamente la mitad de esas paradas ocurren un paso antes del final, donde las demostraciones humanas anaden un scroll o un wait final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,9 mil millones de parametros, en bf16 los pesos ocupan alrededor de 3,8 GB, por lo que se necesita margen adicional para activaciones y la torre de vision.
- GPU recomendadas: el autor entreno en una unica A100; para inferencia cabe en GPUs de consumo con suficiente VRAM, aunque no se publican requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8-12 GB o mas, aunque el dato no esta confirmado en la informacion disponible.
- Opciones de despliegue: Transformers (libreria declarada, con `custom_code`); otros runners como vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-MemGUI | 1.918.181.888 | no disponible (historial de 8 pasos) | Agente GUI Android con trayectorias largas | LFM Open License v1.0 | Checkpoint de desarrollo, no recomendado |
| LFM3-VL-2B-MobileAgent (Main) | no disponible | no disponible (historial de 8 pasos) | Agente GUI Android, receta base | LFM Open License v1.0 | Evaluado y recomendado por el autor |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | Modelo base vision-lenguaje | LFM Open License v1.0 | Modelo base |

## Limitaciones y advertencias

- Modelo de investigacion no promocionado: el autor desaconseja su uso y recomienda LFM3-VL-2B-MobileAgent.
- No debe operar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- No se evaluo en AndroidWorld ni MobileWorld; solo hay resultados offline en AndroidControl y AndroidLens.
- Fallo el umbral preinscrito de paradas prematuras en pasos tardios de AndroidControl (8,5% frente a <= 6,0%).
- Solo admite objetivos en ingles y una unica captura por paso.
- Sin memoria mas alla del historial de texto de 8 pasos: no hay estado persistente ni memoria visual.
- Riesgo de alucinacion en la identificacion de elementos de la interfaz y en las coordenadas normalizadas, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Formato de telefono no publicado, lo que dificulta reproducir el preprocesado exacto de las capturas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUI
- Modelo recomendado (Main): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Resultados: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
- Preinscripcion de la ronda 6: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/preregistrations/round-06-long-trajectories.md
- Dataset MobileAgent-SFT: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT
- Dataset MobileAgent-SFT-MemGUI: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-MemGUI

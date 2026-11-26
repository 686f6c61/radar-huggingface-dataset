# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes

## Resumen

LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes es un checkpoint de desarrollo de un agente Android especializado en operar telefonos moviles a partir de capturas de pantalla. Lo publica el usuario experimentalmachines y se construye sobre el modelo base LiquidAI/LFM3-VL-2B mediante un ajuste fino con LoRA (Supervised Fine-Tuning) sobre la torre de lenguaje, manteniendo congelada la torre de vision. El modelo resuelve el problema de la automatizacion de tareas en interfaces moviles: recibe un objetivo en lenguaje natural, la lista de aplicaciones instaladas, el historial de los ultimos 8 pasos y una captura de pantalla, y devuelve una unica accion en JSON.

La relevancia de esta variante concreta reside en su caracter experimental y en la documentacion publica de su receta: anade notas de "[no visible change]" al historial cuando la captura siguiente no cambia, replicando la regla de ejecucion del agente AndroidWorld del proyecto. Se trata de la ronda 6 del proyecto LFM3 Mobile Agent. El modelo no fue promocionado: fallo una de las comprobaciones del gate offline pre-registrado (paradas tempranas en pasos tardios de AndroidControl) y no se ejecuto en linea. El autor recomienda usar LFM3-VL-2B-MobileAgent en su lugar.

Con 1.918.181.888 parametros totales (aproximadamente 2B), el modelo es pequeno y esta disenado para inferencia en movil o en hardware modesto. La longitud de contexto no se especifica en la informacion disponible; el historial de pasos se limita a los ultimos 8. Los idiomas soportados se restringen al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lfm3_vl) con torre de vision y torre de lenguaje; ajuste LoRA en la torre de lenguaje |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | en |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (adaptador LoRA incluido en `lora_adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B en el commit `23387be`, una arquitectura multimodal `lfm3_vl` que combina una torre de vision con una torre de lenguaje. El ajuste se realizo mediante LoRA SFT con rango 64 y alpha 128 aplicado unicamente a la torre de lenguaje, dejando la torre de vision congelada. Tras el entrenamiento, el adaptador se fusiono en los pesos principales, aunque tambien se conserva una copia del adaptador en `lora_adapter/`.

El entrenamiento consistio en 1.250 pasos con batches de 32 filas, tasa de aprendizaje 2e-4 con decaimiento coseno, ejecutado en una unica GPU A100. Los datos combinan MobileAgent-SFT en el commit `3375539` y MobileAgent-SFT-MemGUI en el commit `2b481ae3` (filas MemGUI-3K filtradas para excluir aplicaciones de AndroidWorld, MobileWorld y AndroidLab). La innovacion principal de esta variante es la incorporacion de notas explicativas "[no visible change]" en los pasos del historial cuyo siguiente screenshot no cambia, lo que exige aplicar la misma regla en tiempo de ejecucion.

## Capacidades

- Generacion de acciones de agente movil en formato JSON compacto sobre una rejilla normalizada 0-1000.
- Razonamiento breve previo a la accion mediante un bloque `` con la intencion.
- Tipos de accion soportados: `click`, `long_press`, `input_text`, `scroll` (up/down/left/right), `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Comprension de capturas de pantalla de Android redimensionadas a un maximo de 880 x 880 px de area.
- Gestion de historial de los ultimos 8 pasos previos, con notas de cambio o ausencia de cambio visible.
- Seleccion de aplicaciones entre la lista de aplicaciones instaladas proporcionada en el prompt.
- Respuesta a preguntas del usuario mediante la accion `answer`, con formato corto y en el formato solicitado.
- Capacidad multilingue limitada al ingles (objetivos y prompts en ingles).
- No dispone de vision mas alla de la captura, ni audio, ni memoria persistente entre tareas.

## Casos de uso

- Automatizacion de tareas repetitivas en Android: dado un objetivo como "abre Ajustes y activa el modo avion", el modelo genera la secuencia de clics, scrolls y navegacion necesaria. Adecuado por su entrenamiento especifico en trayectorias de AndroidControl y AndroidLens.
- Investigacion en agentes GUI: sirve como checkpoint reproducible para comparar recetas de entrenamiento (notas de cambio visible frente a ausencia de notas) en experimentos academicos. Su valor esta en la documentacion de la receta y el gate pre-registrado.
- Pruebas de regresion de agentes moviles: al ser un checkpoint de desarrollo con metricas publicadas, permite verificar pipelines de evaluacion offline (AndroidControl, AndroidLens) antes de promover un modelo.
- Generacion de datos sinteticos de interaccion movil: el modelo puede producir trayectorias etiquetadas (accion + intencion) para aumentar datasets de entrenamiento de agentes, siempre con supervision humana.
- Prototipado de asistentes de accesibilidad: para usuarios con dificultades motoras, el modelo podria proponer la siguiente accion a ejecutar, aunque requiere validacion y no debe operar desatendido.
- Demostraciones y docencia: util para ilustrar el ciclo percepcion-razon-accion en agentes multimodales, dado su tamano reducido y su formato de salida estructurado.
- Evaluacion de la regla "[no visible change]": permite estudiar como afecta la anotacion de pasos sin cambio visual al comportamiento de parada en tareas largas, que es el eje de esta ronda.

## Benchmarks y rendimiento

| Metrica | MemGUIChangeNotes | Main (LFM3-VL-2B-MobileAgent) | Umbral del gate |
|---|---|---|---|
| AndroidControl test, precision de paso de alto nivel | 0.728 | 0.727 | >= 0.707 |
| `dev_answer` / `dev_complete` | 0.890 / 0.713 | 0.890 / 0.763 | >= 0.840 / >= 0.713 |
| AndroidControl pasos >= 4: `status` predicho | 8.75% | 9.0% | <= 6.0% |
| AndroidLens precision de paso en pasos >= 10 | 0.402 | 0.367 | >= 0.347 |
| AndroidLens precision de paso, todos los pasos | 0.441 | 0.414 | — |
| AndroidLens `complete` en el ultimo paso real | 29.1% | 12.2% | — |
| MemGUI dev precision de paso | 0.654 | 0.421 | — |

Configuracion de evaluacion: Transformers en bf16, decodificacion greedy, mismos splits pre-renderizados para Main y candidatos. AndroidLens English consta de 172 episodios largos, solo evaluacion, con historial de ground truth estatico. El modelo mejoro la precision en tareas largas y la parada en el final real de tareas largas, pero no corrigio las paradas tempranas en pasos tardios de AndroidControl, que era el objetivo de la ronda; aproximadamente la mitad de esas paradas ocurren un paso antes del final, donde las demostraciones humanas anaden un scroll o wait final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.918.181.888 parametros, en bf16/fp16 se requieren aproximadamente 3,8 GB solo para pesos, mas overhead de activaciones y vision. En cuantizacion de 8 bits cabria en torno a 2 GB y en 4 bits alrededor de 1 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: el entrenamiento se realizo en una unica A100. Para inferencia, una RTX 4090, RTX 3090 o incluso GPUs consumer con 8 GB o mas deberian ser suficientes en bf16.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en cuantizaciones agresivas podria caber en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code`), y presumiblemente vLLM o TGI si el soporte de `lfm3_vl` esta disponible; llama.cpp y Ollama no estan confirmados para esta arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes | 1.918.181.888 | no disponible | Agente Android con notas de cambio visible | LFM Open License v1.0 | Checkpoint de desarrollo, no promocionado |
| LFM3-VL-2B-MobileAgent (Main) | ~2B (mismo base) | no disponible | Agente Android evaluado | LFM Open License v1.0 | Modelo promocionado y evaluado |
| LFM3-VL-2B-MobileAgent-Dev-MemGUI | ~2B (mismo base) | no disponible | Receta previa sin notas de cambio | LFM Open License v1.0 | Checkpoint de desarrollo |
| LiquidAI/LFM3-VL-2B | ~2B | no disponible | Modelo base multimodal | LFM Open License v1.0 | Modelo base |

La comparativa se limita a variantes del mismo proyecto y al modelo base, ya que no se proporcionan datos de otros agentes GUI comparables en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion no promocionado: el autor desaconseja explicitamente su uso y recomienda LFM3-VL-2B-MobileAgent.
- No debe operar desatendido en un telefono con cuentas reales, mensajes o pagos.
- No fue evaluado en AndroidWorld ni MobileWorld.
- Solo admite objetivos en ingles y una captura por paso.
- Sin memoria mas alla del historial de texto de 8 pasos.
- Riesgo de paradas tempranas: 8,75% de `status` predicho en pasos >= 4 de AndroidControl, por encima del umbral del 6,0%.
- Riesgo de alucinacion en la seleccion de aplicaciones o en la interpretacion de capturas ambiguas; requiere validacion de la accion antes de ejecutarla.
- Licencia LFM Open License v1.0 heredada del modelo base; es necesario revisar las condiciones para uso comercial, que pueden incluir restricciones adicionales.
- El formato de telefono no esta publicado, lo que limita la reproducibilidad exacta del pipeline de ejecucion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes
- Modelo recomendado (Main): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Checkpoint previo (MemGUI): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUI
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Dataset MobileAgent-SFT: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT
- Dataset MobileAgent-SFT-MemGUI: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-MemGUI
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Resultados completos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Pre-registro de la ronda 6: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/preregistrations/round-06-long-trajectories.md

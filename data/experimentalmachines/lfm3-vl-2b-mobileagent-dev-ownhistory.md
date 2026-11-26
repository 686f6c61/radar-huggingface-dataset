# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory

## Resumen

LFM3-VL-2B-MobileAgent-Dev-OwnHistory es un checkpoint de desarrollo de un agente movil para Android construido sobre LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje de 2B parametros desarrollado por Liquid AI. El modelo ha sido afinado por experimentalmachines mediante LoRA SFT para operar un telefono Android a partir de una unica captura de pantalla por paso, emitiendo una accion en JSON compacto. Resuelve el problema de la automatizacion de interfaces graficas moviles (GUI agents) en un tamano que cabe en dispositivos de gama alta.

La relevancia de este checkpoint concreto reside en su receta de entrenamiento: incorpora historia auto-generada (el modelo reproduce sus propios outputs previos como historial) y filas de errores propios, una variante de "semi-online patching" inspirada en UI-S1 (arXiv 2509.11543) sin RL. El objetivo declarado es romper los bucles de `wait` que el modelo principal (Main) aprendia por sesgo del dataset. El autor lo marca explicitamente como checkpoint de desarrollo no recomendado para uso general, remitiendo a la version `LFM3-VL-2B-MobileAgent`.

El modelo tiene 1.918.181.888 parametros reales (segun safetensors), procesa capturas redimensionadas a un maximo de 880x880 px (unos 720 tokens de imagen) y mantiene un historial textual de los ultimos 8 pasos. Solo soporta ingles y su licencia es lfm1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (LFM3-VL, `lfm3_vl` en transformers), fine-tuning LoRA sobre el modelo de lenguaje con vision tower congelado |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial textual limitado a los ultimos 8 pasos; imagen ~720 tokens) |
| Tipos de cuantizacion | 4-bit GGUF disponible (`...-OwnHistory-GGUF`); safetensors en fp/bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors (pesos fusionados + `lora_adapter/`), GGUF 4-bit |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B (commit `23387be`), un modelo vision-lenguaje multimodal de la familia LFM3 de Liquid AI. El ajuste se realizo mediante LoRA SFT con rango 64 y alpha 128 aplicado unicamente al modelo de lenguaje, manteniendo el vision tower congelado; el adaptador se fusiono en los pesos finales y se conserva una copia en `lora_adapter/`.

El entrenamiento consistio en 1.250 pasos x 32 filas (0,43 epocas de un total de 92.229 filas), con learning rate 2e-4, sobre una unica A100, replicando exactamente la receta, filas y orden de filas del modelo Main. Los datos provienen de AndroidControl, GUI-Odyssey, AMEX y ScreenQA. La innovacion clave es la incorporacion de historia auto-generada en el 40% de los episodios de entrenamiento: el modelo reproduce sus propios outputs previos sobre las pantallas registradas y las filas de entrenamiento llevan ese historial, manteniendo como objetivo la accion humana siguiente. Ademas se anaden filas de errores propios donde el modelo eligio `wait` incorrectamente. No se uso entorno interactivo, modelo profesor ni datos de benchmark durante el entrenamiento.

## Capacidades

- Generacion de acciones GUI en Android a partir de una captura de pantalla por paso.
- Produccion de intencion corta en `` seguida de una accion JSON compacta.
- Conjunto de acciones soportadas: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status` (complete/infeasible).
- Coordenadas normalizadas a una rejilla entera 0-1000 sobre la captura.
- Mantenimiento de historial textual de los ultimos 8 pasos (`n. <intent> -> <action JSON>`).
- Comprension de objetivos en lenguaje natural junto con la lista de apps instaladas.
- Capacidades generales de vision-lenguaje heredadas del modelo base (MMStar 55,7%, MMLU 50,3% en la evaluacion del autor).
- No soporta tool calling generico ni function calling fuera del esquema de acciones GUI; no hay soporte de audio.

## Casos de uso

- Investigacion en agentes GUI moviles: sirve como checkpoint reproducible para estudiar el efecto de la historia auto-generada y las filas de errores propios en el comportamiento de bucles `wait`, comparandolo con el modelo Main bajo la misma receta.
- Automatizacion de pruebas de aplicaciones Android: el modelo puede ejecutar secuencias de interaccion sobre una app en un entorno de test controlado, generando trazas de acciones JSON que se validan contra los resultados esperados.
- Reproduccion de benchmarks academicos: util para replicar los resultados en AndroidWorld (seed 30) y MobileWorld (105 tareas en ingles) con el harness del proyecto.
- Generacion de datos sinteticos de interaccion: las trazas producidas (intencion + accion) pueden usarse como material de entrenamiento o evaluacion para otros agentes moviles.
- Prototipado de asistentes de accesibilidad en Android: en un entorno de laboratorio, el modelo puede traducir un objetivo en lenguaje natural a una secuencia de acciones sobre la pantalla, util para explorar interfaces alternativas de control.
- Estudio de mitigacion de bucles en agentes: dado que reduce `wait` del 21% al 5% de los pasos en MobileWorld, es un caso de estudio concreto para tecnicas de patching semi-online sin RL.
- Despliegue en dispositivo de gama alta: la version GGUF 4-bit permite ejecuciones locales en telefonia de gama alta para experimentacion, no para uso con cuentas reales.

## Benchmarks y rendimiento

Evaluacion del autor, una ejecucion por benchmark, temperatura 0, GGUF 4-bit; las excepciones cuentan como fallos.

| Benchmark | OwnHistory | Main | Comparativa |
|---|---|---|---|
| AndroidWorld, seed 30 (116 tareas, desarrollo) | 18 | 18 | +6 / -6 |
| MobileWorld, 105 tareas GUI en ingles | 8 | 6 | +3 / -1, McNemar exacto p = 0,63 |
| AndroidControl test, precision paso high-level | 0,732 | 0,728 | — |
| AndroidControl test, precision paso low-level | 0,888 | 0,908 | — |
| MMStar | 55,7% | 52,9% | — |
| MMLU | 50,3% | 50,4% | — |

En el mismo harness de MobileWorld, el autor reporta GUI-Owl-1.5-2B con 22/105 y MAI-UI-2B con 11/105. OwnHistory no se ha ejecutado en los seeds reservados de AndroidWorld (Main: 54/348). Los bucles se redujeron a la mitad en MobileWorld (`wait` del 21% al 5% de pasos; intenciones repetidas del 67% al 33%), pero el exito apenas se movio y ninguna diferencia frente a Main es significativa.

## Requisitos de hardware

- VRAM estimada: en 4-bit GGUF, aproximadamente 1,5-2,5 GB de pesos mas overhead de contexto e imagen (~720 tokens de vision por paso); en bf16, unos 4 GB de pesos mas activaciones.
- GPU recomendadas: A100 (usada en el entrenamiento) para inferencia de referencia; H100 para mayor throughput.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y tarjetas con 8 GB o mas en 4-bit; en 6 GB con cuantizaciones mas agresivas no verificadas por el autor.
- Opciones de despliegue: transformers (libreria declarada, `custom_code`), llama.cpp/Ollama a traves del GGUF 4-bit publicado; vLLM y TGI no estan confirmados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MobileWorld (105 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-OwnHistory | 1,92B | no disponible | 8/105 | lfm1.0 | Hugging Face |
| LFM3-VL-2B-MobileAgent (Main) | no disponible (mismo base) | no disponible | 6/105 | lfm1.0 | Hugging Face |
| GUI-Owl-1.5-2B | ~2B (segun nombre) | no disponible | 22/105 | no disponible | no disponible |
| MAI-UI-2B | ~2B (segun nombre) | no disponible | 11/105 | no disponible | no disponible |

Los datos de GUI-Owl-1.5-2B y MAI-UI-2B provienen del harness del autor y no de sus model cards; el contexto y la licencia de esos modelos no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Checkpoint de desarrollo explicitamente no recomendado por el autor; la version recomendada es `LFM3-VL-2B-MobileAgent`.
- Solo objetivos en ingles; no hay soporte multilingue.
- Una unica captura por paso y sin memoria mas alla de los 8 pasos de historial textual.
- Entrenado solo con demostraciones registradas; nunca interactuo con un telefono real durante el entrenamiento.
- Riesgo de bucles `wait` y de intenciones repetidas, mitigado pero no eliminado (5% y 33% en MobileWorld).
- Las diferencias frente a Main no son estadisticamente significativas (p = 0,63 en MobileWorld); no se ha evaluado en los seeds reservados de AndroidWorld.
- Riesgo de alucinacion en la interpretacion de la pantalla y en la eleccion de acciones no verificada por el autor.
- Licencia lfm1.0: revisar los terminos antes de cualquier uso comercial; el autor la etiqueta como "other".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory
- Version GGUF 4-bit: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory-GGUF
- Version recomendada (Main): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Checkpoint previo (WaitRelabel): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Paper UI-S1 (semi-online patching): arXiv 2509.11543
- Licencia: LICENSE en el repositorio del modelo

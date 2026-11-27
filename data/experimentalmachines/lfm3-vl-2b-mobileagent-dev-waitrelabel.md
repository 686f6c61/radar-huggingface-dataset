# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel

## Resumen

LFM3-VL-2B-MobileAgent-Dev-WaitRelabel es un modelo de vision-lenguaje de aproximadamente 1.918 millones de parametros, desarrollado por ExperimentalMachines como un ajuste fino (LoRA SFT) del modelo base LiquidAI/LFM3-VL-2B. Su proposito es actuar como agente autonomo de telefonia Android: recibe una captura de pantalla por paso y emite una unica accion en formato JSON (clic, scroll, entrada de texto, apertura de app, espera, etc.) para completar un objetivo expresado en lenguaje natural. Es un modelo experimental de desarrollo, no recomendado para uso en produccion.

El modelo aborda un fallo concreto de su predecesor (LFM3-VL-2B-MobileAgent, denominado "Main"): la tendencia a entrar en bucles de accion `wait`. Para ello se relabelaron 4.104 objetivos `wait` y 13.145 lineas de historial, y se anadio una augmentation de historial de recuperacion sobre 5.244 filas. El entrenamiento se realizo sobre datos de AndroidControl, GUI-Odyssey, AMEX y ScreenQA.

Es relevante en el contexto actual de agentes GUI moviles porque demuestra un enfoque de bajo coste (una sola A100, 1.250 pasos, 0,43 epocas) para especializar un modelo de 2B en control de interfaz. No obstante, sus propios autores lo marcan como superado por su sucesor OwnHistory y advierten que rinde peor que Main en el benchmark online AndroidWorld.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (lfm3_vl) con torre de vision congelada y LM ajustado mediante LoRA |
| Parametros totales | 1.918.181.888 (aproximadamente 1,92B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (historial de texto limitado a los ultimos 8 pasos) |
| Tipos de cuantizacion | 4-bit GGUF (version publicada aparte); el repositorio principal contiene safetensors en precision completa |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (pesos fusionados) y adaptador LoRA en `lora_adapter/`; GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B (commit `23387be`), un transformer vision-lenguaje que procesa una captura de pantalla por paso, redimensionada a un maximo de 880 × 880 px de area (aproximadamente 720 tokens de imagen). El ajuste se realizo mediante LoRA SFT con rango 64 y alpha 128 aplicado unicamente al modelo de lenguaje, manteniendo congelada la torre de vision. El adaptador se fusiono en los pesos finales y se conserva ademas en `lora_adapter/`.

El entrenamiento consistio en 1.250 pasos con batches de 32 filas (0,43 epocas sobre 92.229 filas), tasa de aprendizaje 2e-4, ejecutado en una sola A100. Los datos provienen de AndroidControl, GUI-Odyssey, AMEX y ScreenQA, con dos modificaciones respecto a Main: el relabelado de intenciones `wait` (4.104 objetivos y 13.145 lineas de historial, ya que el 94% de las filas `wait` de AndroidControl repetian la intencion del paso anterior) y la augmentation de historial de recuperacion (5.244 filas con un paso extra de historial repetido o de espera, manteniendo como objetivo la accion humana siguiente). La decodificacion usa modo thinking activado y temperatura 0.

## Capacidades

- Generacion de acciones de interfaz Android en JSON compacto: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status`.
- Razonamiento breve previo a la accion mediante bloque ``.
- Comprension de capturas de pantalla con coordenadas normalizadas en rejilla 0-1000.
- Seguimiento de objetivos en lenguaje natural con historial de hasta 8 pasos previos (`n. <intent> -> <action JSON>`).
- Seleccion de aplicaciones instaladas a partir de una lista proporcionada en el prompt.
- Cierre de tareas con respuesta textual (`answer`) o marcado de estado (`complete`/`infeasible`).
- Capacidad multilingue: solo ingles.
- No dispone de tool calling generico, ni de audio, ni de memoria mas alla del historial de texto de 8 pasos.

## Casos de uso

- Automatizacion de pruebas de interfaz Android: el modelo puede ejecutar secuencias de acciones sobre una app para validar flujos de UI, emitiendo un JSON por paso que se traduce directamente en comandos de ADB o Appium.
- Investigacion en agentes GUI: sirve como linea base reproducible para estudiar el fallo de bucles `wait` y tecnicas de relabelado de intenciones, gracias a que el recipe, los datos y el orden de filas estan documentados.
- Navegacion asistida de apps para tareas repetitivas: dado un objetivo como "abrir ajustes y activar el modo avion", el modelo planifica clics y scrolls paso a paso sobre capturas.
- Extraccion de informacion de pantallas: combinando `answer` con la captura, puede responder preguntas sobre el contenido visible (por ejemplo, leer un importe o un nombre en una pantalla de confirmacion).
- Generacion de datos sinteticos de interaccion movil: sus trazas de acciones etiquetadas pueden reutilizarse para entrenar o evaluar otros agentes.
- Evaluacion comparativa de modelos de agente movil: integrable en arneses como AndroidWorld o MobileWorld para medir tasas de exito con temperatura 0 y cuantizacion 4-bit.
- Reproduccion de experimentos academicos: al ser un modelo de desarrollo conservado explicitamente para reproducibilidad, encaja en estudios que necesiten comparar variantes de un mismo recipe.

## Benchmarks y rendimiento

Resultados publicados por el autor (una ejecucion por benchmark, temperatura 0, GGUF 4-bit; las excepciones cuentan como fallo):

| Benchmark | WaitRelabel | Main | Comparativa pareada |
|---|---|---|---|
| AndroidWorld, seed 30 (116 tareas, desarrollo) | 12 (14 con loop guards) | 18 | +2 / −8 |
| AndroidControl test, precision de paso high-level / low-level | 0,732 / 0,895 | 0,728 / 0,908 | — |
| MMStar (conocimiento general) | 55,6% | 52,9% | — |
| MMLU (conocimiento general) | 51,1% | 50,4% | — |

El autor indica que el modelo rinde peor que Main en linea (AndroidWorld) y que su sucesor OwnHistory recupero 18/116 y obtuvo 8/105 en MobileWorld (frente a 6/105 de Main).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en 4-bit GGUF; en torno a 4 GB de pesos en safetensors a media precision, mas overhead de activaciones y de la torre de vision.
- GPU recomendadas: A100 (usada en entrenamiento), H100 para mayor throughput; cualquier GPU con 8 GB o mas para inferencia 4-bit.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) usando la version GGUF.
- Opciones de despliegue: transformers (libreria nativa, requiere `trust_remote_code` por el tag `custom_code`), llama.cpp/Ollama con el GGUF, y servidores compatibles con endpoints (tag `endpoints_compatible`). vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AndroidWorld seed 30 | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-WaitRelabel | 1,92B | No disponible (historial de 8 pasos) | 12/116 | LFM Open License v1.0 | Desarrollo, no recomendado |
| LFM3-VL-2B-MobileAgent (Main) | 1,92B | No disponible (historial de 8 pasos) | 18/116 | LFM Open License v1.0 | Predecesor |
| LFM3-VL-2B-MobileAgent-Dev-OwnHistory | 1,92B | No disponible | 18/116 (8/105 en MobileWorld) | LFM Open License v1.0 | Sucesor recomendado |
| LiquidAI/LFM3-VL-2B (base) | 1,92B | No disponible | No disponible | LFM Open License v1.0 | Modelo base |

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Rinde peor que su predecesor Main en AndroidWorld (12 frente a 18 sobre 116 tareas); el autor lo marca explicitamente como no recomendado y remite a OwnHistory.
- Solo admite objetivos en ingles; no hay soporte multilingue.
- Memoria limitada al historial de texto de 8 pasos; no mantiene estado mas alla de eso ni entre sesiones.
- Entrenado unicamente con demostraciones grabadas; nunca ha interactuado con un telefono en vivo durante el entrenamiento, lo que puede provocar comportamiento fuera de distribucion.
- Riesgo de alucinacion en la interpretacion de capturas y en la seleccion de coordenadas o apps inexistentes.
- Sesgos no documentados en la informacion disponible.
- Licencia LFM Open License v1.0: revisar las condiciones para uso comercial antes de desplegarlo; no es una licencia permisiva estandar.
- La cuantizacion 4-bit usada en las evaluaciones puede degradar ligeramente la precision respecto a los pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel
- Version GGUF: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-WaitRelabel-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo predecesor (Main): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo sucesor (OwnHistory): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md

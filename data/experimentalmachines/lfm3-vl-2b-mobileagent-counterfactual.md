# experimentalmachines/LFM3-VL-2B-MobileAgent-Counterfactual

## Resumen

LFM3-VL-2B-MobileAgent-Counterfactual es un ajuste fino de tipo LoRA SFT sobre el modelo base LiquidAI/LFM3-VL-2B, desarrollado por experimentalmachines dentro del proyecto LFM3 Mobile Agent. Se trata de un agente movil para Android que opera exclusivamente a partir de capturas de pantalla (screenshot-only): recibe una imagen de la pantalla, el objetivo del usuario y el historial de pasos previos, y emite una intencion corta seguida de una accion JSON compacta en una rejilla de 0 a 1000. El modelo resuelve la tarea de automatizacion de interfaces moviles mediante razonamiento visual y planificacion multi-paso.

La variante "Counterfactual" corresponde a la ronda 8 del proyecto y se centra en el problema de la deteccion de finalizacion ("done but not done yet"): anade filas contrafactuales donde el historial de texto y la pantalla discrepan, elimina etiquetas `complete` que dos jueces de vision consideran visiblemente incorrectas y recalcula las notas de "[no visible change]" con una regla mas estricta. El modelo tiene 1.918.181.888 parametros (aproximadamente 2B) y hereda la arquitectura multimodal del LFM3-VL-2B original.

Es relevante ahora porque documenta de forma publica y rigurosa un fallo comun en agentes GUI (declarar tareas completadas antes de estarlo) y porque, aunque no fue promovido como modelo principal, sus resultados muestran una mejora sustancial en la reduccion de esperas improductivas (del 29,1% al 3,5% de pasos) y en la deteccion de finalizacion falsa en escenarios contrafactuales. El autor mantiene como modelo recomendado a LFM3-VL-2B-MobileAgent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3-VL) con torre de vision congelada durante el ajuste; adaptador LoRA fusionado en los pesos |
| Parametros totales | 1.918.181.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de historial de 24 pasos en el prompt) |
| Tipos de cuantizacion | GGUF Q4_K_M (con proyector de vision) publicado en el repo GGUF; el repo principal en safetensors bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (licencia "other" segun metadatos de Hugging Face) |
| Formato de pesos | safetensors (transformers, custom_code) y GGUF (Q4_K_M) en repo separado |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B en el commit `23387be` y aplica un ajuste supervisado con LoRA de rango 64 y alpha 128 sobre el modelo de lenguaje, manteniendo congelada la torre de vision. El adaptador se fusiona en los pesos finales, aunque tambien se conserva una copia en `lora_adapter/`. El entrenamiento consistio en una pasada unica de 5.802 pasos con 32 filas por paso, learning rate 2e-4 con decaimiento coseno, ejecutado primero en una A100 de Colab hasta el paso 3.100 y continuado en una H100 (Modal) reanudando desde el checkpoint del Hub.

Los datos provienen del dataset MobileAgent-SFT-Counterfactual en el commit `0ace5559`, con 185.643 filas. La innovacion tecnica principal es la construccion de datos contrafactuales: filas donde el historial textual y la captura de pantalla se contradicen, etiquetas de finalizacion verificadas por dos jueces de vision y recalculo de las notas de "[no visible change]" mediante una regla estricta (imagen en escala de grises de 360 x 800, barras de estado y navegacion enmascaradas, mas de 0,02% de pixeles diferentes). La entrada visual se redimensiona a un maximo de 880 x 880 px de area por paso.

## Capacidades

- Generacion de acciones de agente movil Android a partir de una unica captura de pantalla por paso, con salida estructurada `` seguida de un JSON de accion en rejilla 0-1000.
- Razonamiento multi-paso con ventana de historial de los ultimos 24 pasos, incluyendo notas de cambio visual entre pasos.
- Deteccion de finalizacion de tareas (etiqueta `complete`) con verificacion visual, disenada para reducir falsos positivos.
- Manejo de discrepancias entre historial textual y pantalla real (entrenamiento contrafactual).
- Comprension de instrucciones en formato `Goal: ...` / `Installed apps: ...` / `Previous steps: ...` / `What is the next action?`.
- Capacidades multilingues limitadas al ingles.
- No se documenta soporte explicito de tool calling generico ni function calling fuera del esquema de acciones GUI.

## Casos de uso

- Automatizacion de pruebas de interfaz en Android: el modelo puede actuar como agente que recorre flujos de la app paso a paso sobre emulador, emitiendo acciones JSON interpretables por el harness de AndroidWorld, lo que permite regresion automatizada de UI sin scripts fragiles.
- Evaluacion de agentes GUI en investigacion: sirve como linea base reproducible para estudiar el problema de los falsos positivos de finalizacion, gracias a su conjunto de metricas offline documentadas y a su receta de datos contrafactuales.
- Asistencia a usuarios con movilidad reducida: un agente screenshot-only puede ejecutar tareas declaradas en lenguaje natural sobre la pantalla del dispositivo, sin necesidad de acceso a APIs internas de las apps.
- Deteccion de estados de finalizacion en pipelines de agentes: el modelo puede emplearse como verificador de "tarea completada" comparando el historial con la pantalla, reduciendo el porcentaje de finalizaciones falsas del 40,3% al 20,0% en el escenario de pantalla inacabada con historial que afirma haber completado todos los pasos.
- Investigacion sobre notas de cambio visual: la regla estricta de "[no visible change]" y su efecto (reduccion de pasos en espera del 29,1% al 3,5% en AndroidWorld exploratorio) es directamente reutilizable en otros agentes que necesiten detectar pantallas estaticas.
- Despliegue en dispositivo de recursos limitados: con cuantizacion Q4_K_M y 2B parametros, es viable ejecutar inferencia en hardware modesto para prototipos de agentes moviles.
- Analisis de fallos multi-parte: util para estudiar por que los agentes detienen tareas compuestas tras completar solo la primera parte, un patron identificado como causa principal de los falsos completados restantes.

## Benchmarks y rendimiento

Evaluacion offline en transformers bf16, decodificacion greedy, cada modelo con su propio formato de prompt.

| Metrica | Main | FullMix | Counterfactual | Umbral |
|---|---|---|---|---|
| AndroidControl test, precision de paso de alto nivel | 0,727 | 0,753 | 0,758 | >= 0,707 |
| `dev_answer` / `dev_complete` | 0,890 / 0,763 | 0,882 / 0,800 | 0,882 / 0,775 | >= 0,840 / >= 0,713 |
| AndroidLens precision de paso en pasos >= 10 | 0,367 | 0,471 | 0,462 | >= 0,367 |
| AndroidControl: `status` >= 2 pasos antes del final | 2,74% | 3,64% | 3,55% | <= 3,24% (falla) |
| Pantalla inacabada, historial afirma todos los pasos: dice `complete` | 40,3% | 53,7% | 20,0% | <= 15% (falla) |
| Pantalla antes del ultimo toque, toque anotado "no change": dice `complete` | — | 32,0% | 0,3% | <= 10% |
| Pantalla antes del ultimo toque, sin nota: dice `complete` | 31,3% | 37,0% | 16,7% | <= 20% |
| Pantalla terminada: dice `complete` | 73,7% | 84,3% | 78,0% | >= 70% |
| Pantalla terminada, ultimos 2 pasos cortados del historial: dice `complete` | 38,7% | 54,3% | 71,0% | >= 60% |
| MemGUI dev precision de paso | 0,421 | 0,697 | 0,676 | — |
| MobileJudgeBench: dice hecho donde otro agente afirmo hecho y humanos juzgaron fallo (131 ejecuciones) | 45,0% | 60,3% | 45,0% | — |

Ejecucion exploratoria en AndroidWorld (semilla 30, 116 tareas, GGUF 4-bit en emulador Mac):

| Metrica | Main | FullMix | Counterfactual |
|---|---|---|---|
| Exitos | 18 | 21 | 19 |
| Falsos completados | 25 | 27 | 24 |
| Porcentaje de pasos en espera | 29,1% | 16,9% | 3,5% |

AndroidWorld retenido (semillas 7, 1234, 2026 x 116 tareas):

| Metrica | Main | Counterfactual | GUI-Owl-1.5-2B |
|---|---|---|---|
| Exitos / 348 | 54 | 52 | 47 |
| Falsos completados | 71 | 75 | 0 |

MobileWorld (105 tareas, una ejecucion): Counterfactual 5, Main 6, MAI-UI-2B 11, GUI-Owl-1.5-2B 22.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4 GB solo para pesos (1,918B parametros x 2 bytes), mas overhead de activaciones y proyector de vision; en la practica se recomienda al menos 8 GB para comodidad.
- Cuantizacion Q4_K_M: el repo GGUF ocupa una fraccion del tamano del repo principal (4,1 GB en safetensors), por lo que cabe en GPUs de consumo con 6-8 GB.
- GPU recomendadas: A100 o H100 para entrenamiento (la receta original uso A100 de Colab y H100 en Modal); para inferencia, RTX 4090, RTX 3090, RTX 4060 Ti 16 GB o superiores.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en Q4_K_M, y en 12-16 GB en bf16.
- Opciones de despliegue: transformers con `custom_code` (requerido por la arquitectura LFM3-VL), llama.cpp u Ollama con el GGUF Q4_K_M publicado, y servidores compatibles con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada; la ejecucion AndroidWorld se realizo con GGUF 4-bit en un emulador Mac sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AndroidWorld (exitos/348) | Falsos completados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Counterfactual | 1,918B | no disponible | 52 | 75 | lfm1.0 | Hugging Face (safetensors + GGUF) |
| LFM3-VL-2B-MobileAgent (Main) | ~2B | no disponible | 54 | 71 | lfm1.0 | Hugging Face |
| LFM3-VL-2B-MobileAgent-Dev-FullMix | ~2B | no disponible | 21 (semilla 30, 116 tareas) | 27 (semilla 30) | lfm1.0 | Hugging Face |
| GUI-Owl-1.5-2B | ~2B | no disponible | 47 | 0 | no disponible | no disponible |
| MAI-UI-2B | ~2B | no disponible | no disponible (MobileWorld: 11) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor no recomienda este modelo sobre LFM3-VL-2B-MobileAgent: fallo dos de las diez comprobaciones del gate offline pre-registrado (status temprano y falsos completados en pantalla inacabada), ambas cerca del umbral.
- Tasa elevada de falsos completados en produccion: 75 frente a 71 del modelo principal en AndroidWorld retenido, y 24 frente a 25 en la ejecucion exploratoria; la mayoria corresponden a tareas multi-parte detenidas tras la primera parte.
- En MobileWorld la mayoria de tareas terminan en el limite de 50 pasos, lo que indica dificultad para completar flujos largos.
- El modelo solo procesa capturas de pantalla (sin acceso a arbol de accesibilidad ni APIs internas), lo que limita su robustez ante pantallas no representadas en el entrenamiento.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion en la interpretacion de la pantalla y en la generacion de acciones JSON fuera de la rejilla 0-1000 si el prompt no sigue el formato exacto.
- Requiere usar la misma ventana de historial (24 pasos) y las mismas notas de cambio visual en tiempo de ejecucion (`--history_steps 24 --nochange_notes --change_rule fine`) para reproducir los resultados; desviarse del formato degrada el rendimiento.
- Licencia lfm1.0: revisar las condiciones de uso comercial antes de desplegar en produccion, ya que no es una licencia permisiva estandar.
- Sesgos conocidos: no documentados en la informacion disponible.
- El modelo depende de `custom_code` de transformers, lo que puede complicar la integracion en stacks que no permitan codigo remoto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Counterfactual
- Modelo principal recomendado: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo FullMix: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-FullMix
- Version GGUF Q4_K_M: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Counterfactual-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/experimentalmachines/MobileAgent-SFT-Counterfactual
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Pre-registro de la ronda 8: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/preregistrations/round-08-done-from-the-screen.md
- Pre-registro de la ronda 10: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/preregistrations/round-10-multi-part-

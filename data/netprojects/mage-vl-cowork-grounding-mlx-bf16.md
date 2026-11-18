# netprojects/Mage-VL-Cowork-Grounding-MLX-bf16

## Resumen

Mage-VL-Cowork-Grounding (build MLX bf16) es un ajuste fino de microsoft/Mage-VL-Cowork, el modelo hibrido de 4B de Microsoft orientado a computer use. Lo publica NetProjects (Internet Projects Ltd) el 18 de noviembre de 2026 bajo licencia Apache-2.0 y no tiene vinculacion con Microsoft. El problema que resuelve es concreto: el modelo original falla al localizar elementos en pantalla (grounding), mientras que este ajuste hace que el agente pulse el elemento correcto en la mayoria de los casos.

El modelo conserva el contrato de herramientas del original (`computer_use` para raton y teclado, `bash` para shell) y anade precision de localizacion. Segun la model card, en ScreenSpot-v2 acierta el 72% de los clics frente al 13% del original con el mismo arnes de evaluacion, y elige `bash` en 19 de 30 tareas de shell retenidas frente a 3 de 30.

Esta build concreta mantiene los pesos completos en bf16 (9,5 GB, 4.741.793.792 parametros) y esta pensada para Apple Silicon mediante MLX y mlx-vlm. Existen builds cuantizadas a 6, 8 y 4 bits del mismo ajuste, con la de 6 bits marcada como recomendada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (torre de vision Mage-ViT + LLM Qwen3-4B), orientado a computer use |
| Parametros totales | 4.741.793.792 (4,74B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en esta build; el mismo ajuste se publica en 6 bits (4,2 GB), 8 bits (5,3 GB) y 4 bits (3,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Mage-VL-Cowork (revision `6fbe7f9`), un modelo hibrido de computer use de 4B que combina una torre de vision Mage-ViT con un modelo de lenguaje Qwen3-4B. El ajuste se aplico como LoRA de rango 16 y alpha 32 sobre las capas de atencion y MLP del LLM, con la torre de vision intacta; el adaptador se fusiono en los pesos finales. La perdida se calcula solo sobre la respuesta del asistente y cada prompt de entrenamiento se construye con el codigo de agente de Microsoft, de modo que coincide con lo que el agente envia en tiempo de ejecucion.

Los datos de entrenamiento (todos Apache-2.0) incluyen ejemplos de grounding de un solo clic de OS-Atlas-data (macOS, Windows, Linux, Android y web) y Aria-UI_Data (escritorio, web y movil), pasos multi-turno de telefono del split de entrenamiento de AndroidControl y turnos del propio agente del modelo base, incluido el enrutado a `bash`, para preservar el comportamiento agentico existente. Las capturas se redimensionan a un maximo de 1.000.000 de pixeles. Antes de entrenar se eliminaron las imagenes coincidentes (hash exacto y perceptual) con ScreenSpot-v2 y con los episodios de test de AndroidControl usados en la evaluacion, para evitar contaminacion.

## Capacidades

- Grounding visual preciso: localiza y pulsa el elemento objetivo en una captura de pantalla, con coordenadas en el rango `[0, 999]` en ambos ejes.
- Computer use mediante la herramienta `computer_use` (movimiento de raton y teclado) y ejecucion de comandos mediante `bash`.
- Enrutado de tareas: elige `bash` para tareas de shell en 19 de 30 casos retenidos (frente a 3 de 30 del original).
- Bucle de agente multi-paso: soporta hasta 5 pasos en el bucle hibrido de Microsoft, con 68% de exito en 100 tareas de ScreenSpot-v2.
- Llamadas a herramientas validas: 16 de 16 en 16 prompts de agente.
- Razonamiento sobre capturas de escritorio, movil y web.
- No es un modelo de chat general: sin prompt de agente tiende a responder con llamadas a herramientas. El soporte de chat plano esta previsto para una version posterior.

## Casos de uso

- Automatizacion de tareas de escritorio en macOS: el modelo recibe capturas del escritorio y emite clics y pulsaciones de teclado, adecuado para flujos de trabajo repetitivos en Apple Silicon con MLX.
- Agentes de navegacion web: con 76,7% de acierto de clic en ScreenSpot-v2 web, sirve para rellenar formularios, buscar en listas y navegar interfaces sin selectores DOM.
- Automatizacion de moviles Android: 81,4% de acierto en la categoria movil y 47,1% de exito por paso en AndroidControl, util para pruebas de UI automatizadas sobre emuladores.
- Enrutado a shell en pipelines de operaciones: al elegir `bash` en tareas de shell con mas fiabilidad que el original, puede integrarse en agentes que alternan GUI y terminal.
- Evaluacion de agentes de computer use: el arnes de evaluacion y los conjuntos congelados de 300 muestras permiten reproducir comparativas contra el modelo base.
- Prototipado local en portatiles Apple: la build bf16 y las cuantizadas permiten ejecutar el modelo con mlx-vlm en un MacBook sin GPU dedicada, dentro de un sandbox.
- Generacion de trayectorias sinteticas de interaccion: los turnos de agente con clics y comandos pueden servir como datos de entrenamiento para otros agentes GUI.

## Benchmarks y rendimiento

Resultados de la model card, evaluacion offline en MacBook Pro M5 Max con MLX y decodificacion greedy, capturas de hasta 1M px:

| Prueba | Mage-VL-Cowork | Este ajuste |
|---|---|---|
| ScreenSpot-v2, 300 muestras de un clic | 13,0% | 72,0% |
| · escritorio / movil / web | 10,1 / 16,1 / 11,7% | 51,9 / 81,4 / 76,7% |
| Bucle de agente hibrido, hasta 5 pasos, 100 tareas ScreenSpot-v2 | 13% | 68% |
| AndroidControl, 70 episodios, 333 pasos: exito por paso | 11,7% | 47,1% |
| · clic dentro del 14% del objetivo | 11,2% | 48,0% |
| · tipo de accion correcto | 67,9% | 73,3% |
| Eleccion de `bash` en 30 tareas de shell retenidas | 3/30 | 19/30 |
| Llamadas a herramientas validas en 16 prompts | 15/16 | 16/16 |

El autor advierte que el setup de servicio propio de Microsoft reporta un ScreenSpot superior para el original (alrededor del 43%, segun un comentario en su codigo de servicio SGLang) que el 13% medido aqui a 1M px, por lo que la brecha frente al mejor setup de Microsoft es menor de lo que sugiere la tabla. No se han publicado resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM/unificada estimada: 9,5 GB para bf16; 5,3 GB para 8 bits; 4,2 GB para 6 bits; 3,1 GB para 4 bits.
- Orientado a Apple Silicon: evaluado en un MacBook Pro M5 Max con MLX; requiere memoria unificada suficiente para el build elegido.
- No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en esta build; el formato es MLX y la libreria es mlx-vlm.
- Despliegue: `mlx_vlm.server --model netprojects/Mage-VL-Cowork-Grounding-MLX-bf16 --port 8100`, con `mlx-vlm>=0.7.11`.
- Latencia y throughput: no disponibles.
- Recomendacion del autor: usar la build de 6 bits (4,2 GB) como opcion por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Grounding ScreenSpot-v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mage-VL-Cowork-Grounding (este) | 4,74B | no disponible | 72,0% (1M px, arnes propio) | Apache-2.0 | MLX, builds 4/6/8 bits y bf16 |
| microsoft/Mage-VL-Cowork | 4B (hibrido) | no disponible | 13,0% en el mismo arnes; ~43% segun Microsoft | no disponible en la informacion | Hugging Face, codigo de agente en GitHub |
| Alternativas de computer use de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de chat general: sin el prompt de sistema de agente tiende a emitir llamadas a herramientas en lugar de texto conversacional.
- El escritorio es la plataforma mas debil: 51,9% en ScreenSpot-v2 escritorio frente a 81,4% en movil.
- Las coordenadas usan escala `[0, 999]`; una conversion incorrecta a pixeles (`x_px = round(x / 999 * (width - 1))`) degrada el rendimiento.
- El modelo fue entrenado y evaluado con capturas de hasta 1.000.000 de pixeles; usar tamanos distintos puede afectar a la precision.
- Las cifras de ScreenSpot-v2 y del bucle de agente provienen de un conjunto congelado de 300 muestras del propio autor, no del benchmark completo.
- Es un agente autonomo: debe ejecutarse en un sandbox, ya que emite comandos `bash` y acciones de raton y teclado.
- Riesgo de alucinacion en la identificacion de elementos y en la generacion de comandos de shell; no se documentan evaluaciones de sesgo.
- Idiomas soportados no documentados.
- Licencia Apache-2.0 permite uso comercial, pero el autor no esta afiliado a Microsoft y no ofrece garantias.
- Modelo muy reciente (18 de noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-bf16
- Build 6 bits (recomendada): https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-8bit
- Build 4 bits: https://huggingface.co/netprojects/Mage-VL-Cowork-Grounding-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Codigo de agente de Microsoft: https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Dataset OS-Atlas-data: https://huggingface.co/datasets/OS-Copilot/OS-Atlas-data
- Dataset Aria-UI_Data: https://huggingface.co/datasets/Aria-UI/Aria-UI_Data
- AndroidControl: https://github.com/google-research/google-research/tree/master/android_control
- Autor: https://netprojects.com

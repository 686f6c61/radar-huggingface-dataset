# ruisv/bllm-pi05-libero-224-s100p

## Resumen

El modelo `ruisv/bllm-pi05-libero-224-s100p` es una compilación de la política visión-lenguaje-acción (VLA) π0.5 de Physical Intelligence, adaptada para ejecutarse íntegramente en el BPU de la placa D-Robotics RDK S100P. El paquete, desarrollado por ruisv y distribuido a través de la librería BLLM, permite ejecutar el control robótico en el propio dispositivo, sin necesidad de GPU, host externo ni descarga de pesos a memoria. Se trata de un modelo de flujo (flow matching) que recibe dos imágenes de cámara (escena y muñeca) y una instrucción en inglés, y produce un chunk de diez deltas de efector final (7 dimensiones cada uno).

El modelo se basa en el checkpoint oficial `pi05_libero` de openpi, cuantizado y compilado a grafos BPU (formato `.hbm`). Incluye una torre de visión SigLIP So400m, un prefill PaliGemma y un experto de acciones con diez pasos de denoising. La cuantización es int8 por canal de salida para los pesos e int16 estática por tensor para las activaciones, con una excepción en la cabeza de acción (`action_out_proj` y la adaRMSNorm final) que se mantiene en int16 para preservar la precisión en la decisión binaria del gripper. En la suite LIBERO, el paquete alcanza 99/100 en `libero_spatial`, igualando a la referencia de openpi en GPU, y 97/100 y 95/100 en `libero_goal` y `libero_object` respectivamente.

La relevancia de este modelo radica en su capacidad para llevar una política VLA de última generación a hardware de bajo consumo, liberando los núcleos de CPU para tareas de percepción y control. El proceso residente ocupa solo 16 MB de RSS, ya que los pesos residen en memoria BPU/ION, y el consumo de CPU durante la inferencia es de aproximadamente 1.3 de 6 núcleos. Esto lo convierte en una opción práctica para robots autónomos con requisitos estrictos de latencia y recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) con torre de visión SigLIP So400m, prefill PaliGemma y experto de acciones con flow matching |
| Parametros totales | no disponible (los pesos están cuantizados y compilados; el repositorio pesa 5.7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Instrucciones de hasta 32 tokens (máximo estricto; las suites LIBERO usan 6–21) |
| Tipos de cuantizacion | Pesos: int8 per-output-channel; activaciones: int16 estático per-tensor; excepción en `action_out_proj` y adaRMSNorm final en int16 |
| Idiomas soportados | inglés (instrucciones; no se documentan otros) |
| Licencia | apache-2.0 (con restricciones upstream: Gemma Terms of Use para el tokenizer y términos de openpi/Physical Intelligence) |
| Formato de pesos | Grafos `.hbm` para BPU, tabla de embeddings `.bin` (fp16, mmapped), manifiesto `model.json` |

## Arquitectura y entrenamiento

El modelo es una compilación del checkpoint `pi05_libero` de openpi, que implementa la política π0.5 de Physical Intelligence. La arquitectura combina tres componentes principales: una torre de visión SigLIP So400m que procesa dos imágenes (escena y muñeca), un prefill PaliGemma que codifica la instrucción y las características visuales, y un experto de acciones basado en flow matching que integra un latente gaussiano a lo largo de 10 pasos de denoising para generar un chunk de 10 acciones de efector final (deltas de 7 dimensiones). El modelo no utiliza propriocepción, al igual que la configuración `pi05_libero` de openpi, que establece `discrete_state_input=False`.

Los detalles del entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El paquete BLLM se limita a cuantizar y compilar los pesos del checkpoint oficial, manteniendo la misma arquitectura y el mismo esquema de inferencia que la referencia de openpi. La cuantización se ha diseñado cuidadosamente: los pesos se reducen a int8 por canal de salida, mientras que las activaciones se mantienen en int16 estático por tensor. La cabeza de acción (`action_out_proj` y la adaRMSNorm final) se conserva en int16 porque el comando del gripper es bimodal (≈ ±1) y una cuantización int8 en ese punto degradaría la precisión cerca del umbral de decisión. Según la model card, reproducir este esquema dentro del modelo original de openpi introduce una pérdida de solo el 0.05 % en la magnitud de las acciones.

## Capacidades

- Generación de acciones robóticas: recibe dos imágenes (escena y muñeca) y una instrucción en inglés, y produce un chunk de 10 deltas de efector final (7 dimensiones) ya desnormalizados.
- Ejecución en edge: corre completamente en el BPU del RDK S100P, sin necesidad de GPU, host externo ni descarga de pesos a la memoria del proceso.
- Flow matching estocástico: al ser un modelo de flujo integrado desde un latente gaussiano, dos llamadas con la misma observación pueden producir acciones ligeramente diferentes; se puede pasar un `noise` explícito (`float32[10, 32]`) para obtener resultados reproducibles.
- Soporte de control en tiempo real: la inferencia tarda ~1016 ms por chunk de acción, lo que permite una frecuencia de control de ~1 Hz con replanificación cada 5 pasos (hasta ~5 Hz de acciones).
- Bajo consumo de CPU: durante la inferencia, el proceso utiliza aproximadamente 1.3 de 6 núcleos, dejando el resto disponible para percepción y control.
- Sin soporte de tool calling ni agentes conversacionales: es un modelo puramente de acción, no un asistente de texto.

## Casos de uso

- Manipulación robótica en entornos de mesa: el modelo está entrenado en las suites LIBERO (spatial, goal, object) y puede ejecutar tareas como "coger el bol negro y ponerlo en el plato" con una precisión del 99 % en `libero_spatial`. Es adecuado para robots de investigación que replican estos escenarios.
- Robots de servicio en entornos domésticos o industriales con recursos limitados: al ejecutarse íntegramente en el BPU de una placa de bajo coste, puede integrarse en brazos robóticos sin necesidad de una estación de trabajo con GPU, reduciendo costes y consumo energético.
- Desarrollo de políticas VLA en hardware real: los investigadores pueden evaluar π0.5 en robots físicos sin depender de la infraestructura de openpi, gracias al paquete BLLM que mantiene el mismo código de inferencia que la referencia.
- Control de brazos robóticos con requisitos de latencia estrictos: el tiempo de inferencia de ~1 segundo por chunk permite replanificar a ~1 Hz, suficiente para tareas de manipulación que no requieren movimientos extremadamente rápidos.
- Sistemas de percepción y control integrados: el bajo uso de CPU (~1.3 núcleos) deja margen para ejecutar otros módulos de percepción (detección de objetos, planificación de trayectorias) en la misma placa.
- Investigación en aprendizaje por imitación y refuerzo: el modelo puede servir como política base para fine-tuning o como referencia para comparar nuevas arquitecturas, ya que reproduce fielmente el rendimiento de openpi en GPU.

## Benchmarks y rendimiento

Los resultados se obtuvieron mediante el harness de evaluación LIBERO de openpi, comparando este paquete con la referencia de openpi en GPU:

| Suite | Este paquete | Referencia (openpi en GPU) |
|---|---:|---:|
| libero_spatial | 99 / 100 | 99 / 100 |
| libero_goal | 97 / 100 | — |
| libero_object | 95 / 100 | — |

La fila de `libero_spatial` se obtuvo sirviendo este paquete directamente al harness, sin los transformados del lado del host de openpi, es decir, el mismo camino de código que obtiene el usuario. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) porque el modelo no es un LLM generalista, sino una política de acción.

## Requisitos de hardware

- Placa requerida: D-Robotics RDK S100P con BPU (nash-m). Los grafos `.hbm` no se ejecutan en x86, CUDA ni en otras placas RDK sin recompilación.
- Memoria: los grafos residentes ocupan 4.57 GB en BPU/ION; el proceso RSS es de solo 16 MB, ya que los pesos no residen en el espacio de direcciones del proceso.
- CPU: durante la inferencia se utiliza aproximadamente 1.3 de 6 núcleos; el resto queda libre para otras tareas.
- Latencia: 1016 ms por chunk de acción (media de 10 mediciones en placa), desglosado en 169 ms para SigLIP (2 cámaras), 602 ms para prefill PaliGemma (544 tokens) y 235 ms para el experto de acciones (10 pasos de denoising).
- Frecuencia de control: ~1 Hz de inferencia, que se traduce en ~5 Hz de acciones con replanificación cada 5 pasos.
- Opciones de despliegue: a través de la librería BLLM (`pip install bllm` o `conda`), con una API Python sencilla (`bllm.load_policy` y `policy.act`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje generativo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos VLA compilados para el mismo hardware (RDK S100P) en la documentación proporcionada. Como referencia, se puede comparar con la versión original de π0.5 de openpi ejecutada en GPU:

| Modelo | Hardware | Rendimiento LIBERO spatial | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ruisv/bllm-pi05-libero-224-s100p` | RDK S100P (BPU) | 99/100 | Apache-2.0 (con términos upstream) | HuggingFace |
| `physical-intelligence/pi05_libero` (openpi) | GPU (CUDA) | 99/100 | Apache-2.0 (código) | GitHub/HuggingFace |

Ambos comparten la misma arquitectura y resultados, pero el paquete BLLM está optimizado para edge y no requiere GPU. No se han identificado otros modelos comparables en la misma categoría dentro de la información disponible.

## Limitaciones y advertencias

- Soporte de una única configuración: solo `pi05_libero` (con `discrete_state_input=False`). Las configuraciones `pi05_droid` y `pi05_aloha` no están soportadas porque discretizan 32 valores de estado en el prompt (145 tokens frente a los 32 slots de este grafo), usan 3 cámaras y horizontes de acción de 15/50 en lugar de 10.
- Instrucciones limitadas a 32 tokens: una instrucción más larga produce un error duro, nunca una truncación silenciosa. Todas las suites LIBERO usan entre 6 y 21 tokens, pero no se garantiza el comportamiento con instrucciones más extensas.
- Sin propriocepción: el modelo no lee el estado del robot, al igual que la configuración `pi05_libero` de openpi. Esto puede limitar su uso en tareas que requieran información de posición articular.
- Solo para RDK S100P: los grafos `.hbm` son específicos del BPU nash-m y no se ejecutan en otras plataformas sin recompilación.
- Riesgo de alucinación en acciones: al ser un modelo de flujo estocástico, puede generar acciones inconsistentes con la instrucción o el contexto visual, especialmente en escenarios fuera de la distribución de entrenamiento.
- Licencia y términos upstream: aunque el tag de HuggingFace indica Apache-2.0, los pesos derivados de π0.5 (openpi) y el tokenizer PaliGemma (Google) están sujetos a sus propios términos, incluidos los Gemma Terms of Use. Para uso comercial, es necesario verificar los términos de los componentes upstream.
- Sin datos sobre sesgos: no se han documentado sesgos específicos del modelo, pero al estar entrenado en entornos LIBERO (mesas con objetos comunes), puede tener un rendimiento degradado en entornos muy diferentes.

## Enlaces

- HuggingFace: https://huggingface.co/ruisv/bllm-pi05-libero-224-s100p
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Repositorio BLLM: https://github.com/ruisv/bllm

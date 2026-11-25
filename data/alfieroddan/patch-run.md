# alfieroddan/patch-run

## Resumen

PatchPolicy Runtime (identificador `alfieroddan/patch-run`) es un paquete de artefactos de despliegue para una política de control robótico entrenada sobre el brazo SO101, orientada a tareas de tipo *pick-and-place*. No se trata de un modelo de lenguaje generativo, sino de una política de imitación visual (*visuomotor policy*) que consume únicamente imágenes RGB de 640 x 480 y emite comandos de acción articular. El autor, alfieroddan, publica aquí los pesos exportados, las recetas de hardware y los scripts de validación offline, sin necesidad de modificar el núcleo de Studio ni de Runtime.

El repositorio contiene dos exportaciones del mismo checkpoint: una en formato Torch (`patchpolicy.pt`) pensada para CUDA y otra en formato OpenVINO (`patchpolicy.xml` + `patchpolicy.bin`) pensada para CPU. Ambas preservan el muestreo estocástico de VQ-BeT, por lo que las salidas de los dos backends no tienen por qué coincidir elemento a elemento. El modelo no requiere el checkpoint original de entrenamiento para ejecutarse, aunque sí para regenerar las exportaciones.

Su relevancia es práctica y acotada: demuestra un flujo completo de exportación, validación de paridad numérica y ejecución sobre hardware real (brazo SO101 con servos Feetech) con dos backends de inferencia distintos. El tamaño del repositorio es de 0,3 GB y no se declaran licencia, idiomas, pipeline ni métricas de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visuomotora PatchPolicy con muestreo estocástico VQ-BeT (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la política procesa dos observaciones de imagen (la más antigua primero, con relleno de arranque repitiendo el primer frame) |
| Tipos de cuantizacion | no disponible; OpenVINO usa la precisión por defecto del backend y el validador solicita f32 vía API Python |
| Idiomas soportados | no aplica (el modelo no usa lenguaje, solo imágenes) |
| Licencia | no disponible |
| Formato de pesos | Torch (`patchpolicy.pt` + `manifest.json`) y OpenVINO (`patchpolicy.xml`, `patchpolicy.bin`, `manifest.json`) |
| Entrada | Imágenes RGB 640 x 480 (sin estado articular ni texto) |
| Salida | Predicción de 5 acciones, de las que se ejecuta 1 y se replanifica; vector de 6 acciones en cola |
| Acciones (orden SO101) | shoulder pan, shoulder lift, elbow flex, wrist flex, wrist roll, gripper |
| Checkpoint de origen | `patch-so101-029-11.2389.ckpt`, pérdida de validación 11.2388687 |
| Frecuencia objetivo | 30 Hz solicitados (no garantizados) |

## Arquitectura y entrenamiento

La información disponible describe una política de imitación que consume exclusivamente imágenes, sin estado articular ni instrucciones en lenguaje. El pipeline de inferencia recoge dos observaciones en orden cronológico (la más antigua primero), con relleno de arranque que repite el primer frame. El modelo predice cinco acciones, pero solo se ejecuta una antes de replanificar, sin suavizado de *chunks*. El historial de observaciones sigue las actualizaciones del runtime, de modo que una inferencia lenta estira su espaciado más allá del intervalo de 33 ms presente en el dataset de entrenamiento.

El componente de muestreo es VQ-BeT en modo estocástico, lo que explica que las salidas de Torch y OpenVINO no coincidan elemento a elemento. La exportación a Torch no es un grafo TorchScript autónomo, sino un checkpoint de política cargado por el adaptador Torch de Studio, y requiere la librería Studio editable junto con las dependencias de PatchPolicy y Runtime. La exportación a OpenVINO utiliza el adaptador y los procesadores de manifiesto de Runtime sin cargar la librería de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Control visuomotor de un brazo SO101 para tareas de *pick-and-place* a partir de imágenes RGB.
- Predicción de acciones articulares normalizadas en el orden de articulaciones del SO101 (seis dimensiones).
- Replanificación por acción: predice cinco acciones y ejecuta una antes de volver a inferir.
- Muestreo estocástico VQ-BeT, que introduce variabilidad en la política.
- Ejecución en dos backends: Torch sobre CUDA y OpenVINO sobre CPU (y GPU, aunque la compilación GPU falla en el host del autor).
- Gestión de historial de observaciones con arranque, avance y reinicio a través de `PolicySource`.
- Validación offline con píxeles sintéticos y comprobación opcional de paridad numérica frente a Torch nativo en CPU.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Automatización de *pick-and-place* sobre SO101: el modelo recibe imágenes de dos cámaras RGB de 640 x 480 y emite comandos articulares para recoger y colocar objetos, adecuado por su entrenamiento específico en esa tarea y ese brazo.
- Despliegue en estaciones sin GPU: la exportación OpenVINO en CPU permite ejecutar la política en equipos industriales o de laboratorio sin acelerador dedicado, con una latencia mediana de unos 97 ms por inferencia.
- Prototipado en CUDA: la exportación Torch sobre CUDA ofrece una latencia mediana de unos 55 ms, útil para iterar sobre la política en un puesto de desarrollo con GPU.
- Validación de pipelines de robótica en CI: `validate.py` permite comprobar formas de salida `(1, 1, 6)` y `(6,)`, el ciclo de historial y los esquemas YAML sin conectar cámaras ni brazo, lo que facilita pruebas de regresión.
- Verificación de paridad entre backends: la opción `--parity` compara ventanas deterministas contra Torch nativo en CPU con `rtol=1e-4` y `atol=1e-5`, útil para certificar que una conversión a OpenVINO no altera la política de forma inaceptable.
- Investigación en políticas de imitación: el paquete sirve como referencia reproducible de exportación, manifiestos y ejecución de una política VQ-BeT sobre hardware de bajo coste.
- Integración con el ecosistema PhysicalAI: requiere los plugins `physicalai-so101-plugin`, `physicalai-studio-plugin`, `feetech-servo-sdk` y `pyserial`, por lo que encaja en flujos que ya usan ese stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos medidos son comprobaciones de cableado y paridad, no evaluación sobre un conjunto de datos reservado:

| Comprobacion | Resultado |
|---|---|
| Inferencia Torch/CUDA e historial/reinicio | Superado |
| Inferencia OpenVINO/CPU f32 e historial/reinicio | Superado |
| Inferencia OpenVINO/CPU con precisión por defecto | Superado |
| Esquemas YAML de ambos runtimes (`--print_config`) | Superado |
| Paridad numérica determinista en CPU | Superado; diferencia absoluta máxima 0,000106812 |
| Latencia mediana Torch/CUDA | Unos 55 ms |
| Latencia mediana OpenVINO/CPU f32 | Unos 97 ms |
| OpenVINO/GPU | Fallo de compilación en el generador de kernels OpenCL |

Los tiempos incluyen preprocesado y postprocesado del modelo, pero excluyen la E/S de cámara y robot. Ninguno de los dos backends medidos cumple el presupuesto de 33,3 ms para 30 Hz con una acción por inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,3 GB y no se detalla el tamaño del modelo en memoria.
- GPU recomendadas: no disponibles; la configuración Torch apunta a CUDA y la OpenVINO a CPU por defecto.
- Compatibilidad con GPU de consumo: no confirmada; no se indican modelos concretos (RTX 4090, etc.).
- OpenVINO en GPU: la compilación falla en el host del autor con `CL_BUILD_PROGRAM_FAILURE`; la configuración CPU es intencionada.
- Opciones de despliegue: `physicalai run` con configuración YAML para Torch (dispositivo `cpu`/`cuda`) y OpenVINO (dispositivo `CPU`/`GPU`), más `validate.py` para comprobaciones offline. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia: unos 55 ms medianos en Torch/CUDA y unos 97 ms medianos en OpenVINO/CPU f32, ambos por encima del presupuesto de 30 Hz.
- Dependencias de entorno: `physicalai-so101-plugin`, `physicalai-studio-plugin`, `feetech-servo-sdk` y `pyserial`, con los plugins locales instalados en modo editable en el `.venv` del espacio de trabajo.
- Bloqueo de dispositivo: el nombre de bloqueo del robot es `846de103-d136-4e38-8ada-3f528d41cea4`; hay que detener otras ejecuciones sobre ese brazo y no lanzar ambas recetas a la vez.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas visuomotoras para SO101 u otros brazos), ni datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento, código o matemáticas.
- La licencia no está declarada, por lo que el uso comercial no puede asumirse y requiere consulta al autor.
- La política depende de una calibración, unas identidades de cámara y una pose inicial concretas; ejecutarla sin verificar el área de trabajo puede provocar movimientos inseguros.
- El modelo usa solo imágenes, sin estado articular ni lenguaje, lo que limita su adaptabilidad a variaciones no vistas en el dataset.
- El muestreo VQ-BeT es estocástico: las salidas de Torch y OpenVINO no coinciden elemento a elemento, y una conversión exitosa no garantiza paridad numérica ni seguridad en hardware.
- La exportación a Torch no es un grafo TorchScript autónomo; requiere la librería Studio editable y las dependencias de PatchPolicy.
- La exportación a OpenVINO emite advertencias de comprobación de formas y de salidas estocásticas.
- Ninguno de los backends medidos alcanza los 30 Hz; `fps: 30` es una tasa solicitada, no una garantía de rendimiento.
- Las comprobaciones realizadas son de cableado y paridad con píxeles sintéticos, no una evaluación sobre datos reservados ni una prueba de control seguro.
- No se conectó ningún robot ni cámara durante la verificación.
- OpenVINO en GPU no es funcional en el host del autor.
- El CLI rechaza `INFERENCE_PRECISION_HINT` en los argumentos del modelo; el validador solicita f32 mediante la API de Python.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de los modelos de lenguaje, pero sí existe riesgo de generalización deficiente fuera de la distribución del dataset de entrenamiento.

## Enlaces

- [Hugging Face: alfieroddan/patch-run](https://huggingface.co/alfieroddan/patch-run)

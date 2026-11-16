# Dongkkka/Task905-943-ViTacFormer-B128-200k

## Resumen

ViTacFormer Task905-943 es una política de imitación para robótica manipulativa que combina visión y tacto en un transformer multimodal. Lo desarrolla el usuario Dongkkka y se publica bajo licencia Apache 2.0. El modelo está entrenado desde cero (solo la inicialización ResNet18 proviene de ImageNet) durante 200.000 actualizaciones del optimizador con batch fijo de 128, y resuelve dos tareas concretas de manipulación con manos SH5: Task905 (mano derecha) y Task943 (mano izquierda), codificadas como un one-hot de tarea de dos dimensiones.

La relevancia técnica está en su contrato de entrada/salida: recibe una imagen de cámara de cabeza a 720x1280, historial de estado articular y historial de presión táctil cruda, y produce comandos articulares absolutos de 100 pasos y una previsión táctil futura de 18 pasos. Incorpora atención bidireccional visión-tacto y una decodificación que prioriza el tacto futuro y después la acción, lo que lo sitúa en la línea de investigación de políticas que anticipan contacto físico antes de actuar.

Es un artefacto de investigación acotado: no es un modelo de propósito general, no es un checkpoint de Transformers y su validación es replay offline, no éxito de tarea en robot real. El modelo publicado ocupa 0,8 GB e incluye dos checkpoints (paso 200.000 y mejor modelo en 192.000).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViTacFormer: transformer multimodal con atención bidireccional visión-tacto, backbone visual ResNet18 inicializado en ImageNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en tokens; ventana temporal de estado de 6 pasos (offsets -15 a 0 en rejilla de 30 Hz) e historial táctil de 18 pasos |
| Tipos de cuantizacion | no disponible; pesos en BF16 para forward con pérdidas en FP32 durante entrenamiento |
| Idiomas soportados | en, ko (etiquetas de la model card; el modelo no procesa lenguaje natural, la tarea se selecciona por ID) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch `.pt` (`step_200000.pt`, `best_model.pt`); no son checkpoints AutoModel de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal denominado ViTacFormer que fusiona observación visual y señales táctiles mediante atención bidireccional. El backbone visual es una ResNet18 con inicialización ImageNet; el resto de pesos se entrena desde cero. La decodificación es específica del dominio: primero se predice el tacto futuro y después la acción, con un decodificador de acciones SH5 acotado y una rampa de calentamiento para los brazos. La predicción táctil usa siempre un latente previo a cero; el entrenamiento de acciones emplea un 75 % de muestreo desde el prior y un 25 % desde el posterior, sin teacher forcing del tacto futuro en esta ejecución.

El entrenamiento usó 156 episodios de entrenamiento y 18 de validación disjuntos por fuente, con 70.217 y 7.643 frames respectivamente, y normalización calculada solo con datos de entrenamiento. Se realizaron 200.000 actualizaciones con AdamW (LR 2e-5 para el tronco principal y 2e-6 para el backbone, warmup de 1.000 pasos, decaimiento coseno hasta el 10 %, weight decay 1e-4, clipping 1) y batch 128 sin acumulación de gradiente. La pérdida total final registrada fue 0,79218104 y el L1 normalizado de acción en validación, 0,11209103. El intervalo de entrenamiento registrado fue de aproximadamente 6 h 45 min (2026-11-13, hora KST). Las entradas incluyen un one-hot explícito de tarea, tacto crudo más deltas temporales, e imagen de cámara de cabeza redimensionada a 188x336 con normalización ImageNet.

## Capacidades

- Predicción de comandos articulares absolutos: genera `[100,54]` objetivos en radianes (brazo izquierdo 7, brazo derecho 7, mano izquierda 20, mano derecha 20).
- Previsión táctil futura: produce `[18,180]`, donde los primeros 90 valores son presiones crudas previstas y los últimos 90 son deltas respecto a la presión actual.
- Condicionamiento por tarea: un one-hot de dos dimensiones selecciona Task905 (mano derecha) o Task943 (mano izquierda); ambas tareas y las 54 salidas articulares están en el mismo checkpoint.
- Fusión visión-tacto: atención bidireccional entre la imagen de cámara de cabeza y el historial de presión táctil cruda de 18 pasos.
- Política de imitación: aprende de demostraciones (imitation learning), no de refuerzo.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto: no es un modelo de lenguaje.
- Idiomas: las etiquetas en/ko son metadatos de la model card; el modelo no procesa entrada lingüística.

## Casos de uso

- Manipulación bimanual con manos SH5: la política cubre ambas manos con un único checkpoint de 54 salidas, lo que permite desplegarla en un mismo puesto de trabajo sin cargar dos modelos.
- Tareas de vertido y manipulación con contacto: el modelo anticipa presiones táctiles futuras, útil en tareas donde el contacto físico es la señal crítica (el origen de los datos es un dataset de vertido de agua, `PourWater`).
- Investigación en políticas viso-táctiles: sirve como línea base reproducible para comparar variantes de fusión visión-tacto, dado que se publican contratos de preprocesado, estadísticas de normalización y checksums.
- Evaluación offline de políticas: el paquete incluye verificaciones numéricas sobre observaciones reales retenidas (12 inferencias, 6 por checkpoint), útil para pipelines de validación antes de pruebas en hardware.
- Reentrenamiento o fine-tuning sobre el dominio SH5: al ser Apache 2.0 y pesar 0,8 GB, se puede adaptar a nuevas tareas del mismo robot manteniendo el contrato de entrada/salida.
- Estudio de la contribución del tacto: los registros de evaluación permiten analizar cuánto aporta el historial táctil (el barajado del historial táctil incrementa el error de acción en Task905 un 2,42 %).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a este tipo de modelo. Los únicos datos de evaluación son métricas internas de la ejecución:

| Metrica | Resultado |
|---|---|
| Perdida total de entrenamiento final | 0,79218104 |
| L1 normalizado de acción en validación | 0,11209103 |
| Error de previsión táctil cruda, Task905 (paso 200k) | 6,63 % por debajo de persistencia |
| Error en región de actividad, Task905 (paso 200k) | 21,63 % por debajo de persistencia |
| Efecto de barajar historial táctil en error de acción, Task905 | +2,42 % |
| Sustituir previsión aprendida por persistencia | apenas cambia el error de acción |
| Task943 (mano izquierda) | sin mejora sobre persistencia (gate combinado en falso) |
| Verificación offline de publicación | 12 inferencias finitas dentro de límites articulares |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. El repositorio pesa 0,8 GB, lo que sugiere un modelo de tamaño moderado desplegable en GPU de consumo, pero no se publica el conteo de parámetros.
- GPU recomendadas: no disponibles; el paquete se verificó con carga estricta en CPU (`device="cpu"` en el ejemplo de la model card).
- Cabe en GPU de consumo: probablemente sí por el tamaño del artefacto, pero no confirmado en la documentación.
- Opciones de despliegue: el runtime propio `source/runtime.py` con PyTorch/torchvision y las dependencias de `requirements.txt`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje ni un checkpoint AutoModel.
- Latencia y throughput: no disponibles.
- Requisitos de entorno: versiones exactas del productor en `provenance/tested_environment.json`; los loaders SH5 antiguos que restan una línea base son incompatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Task905-943 ViTacFormer (este) | no disponible | ventana de 6 pasos de estado y 18 de tacto | métricas internas de validación offline | Apache 2.0 | Hugging Face, 0 descargas |
| Task000519_PourWater_ViTacFormer_H100_LR1e4_B512_Hand_Intern (origen) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face, citado como procedencia |
| Otros modelos ViTacFormer del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de terceros de la misma categoría (políticas viso-táctiles para SH5).

## Limitaciones y advertencias

- Validación offline únicamente: el replay no equivale a éxito de tarea en robot real; no hay aprobación de ejecución motorizada en el paquete.
- El gate táctil combinado de dos tareas es falso: Task943 (mano izquierda) no mejora sobre persistencia, aunque Task905 sí.
- La contribución de la previsión táctil aprendida a la calidad de la acción no está establecida: sustituirla por persistencia apenas cambia el error de acción.
- El término "actividad" se refiere a cambios registrados en los taxels, no a contacto físico calibrado.
- Limitaciones de sensor: saturación y antigüedad de la señal táctil cruda, e integración exacta de tacto crudo y tarea en el runtime.
- Contrato de entrada estricto: usar `source/runtime.py`; los loaders que restan línea base son incompatibles. No restar línea base ni dividir presiones por 255.
- El checkpoint por defecto del Runtime es `best_model.pt` (192k), no el final de 200k; hay que seleccionarlo explícitamente.
- No incluye estado del optimizador ni RNG para reanudar entrenamiento.
- Riesgo de alucinación no aplica en el sentido de lenguaje; el riesgo equivalente es predicción fuera de distribución en observaciones no vistas.
- Sesgos conocidos: no documentados; el modelo solo se ha evaluado en dos tareas y un conjunto reducido de episodios (156 de entrenamiento, 18 de validación).
- Uso comercial: permitido por Apache 2.0, con obligación de conservar los avisos de licencia de `source/LICENSE` y `source/detr/LICENSE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/Task905-943-ViTacFormer-B128-200k
- Modelo de origen citado como procedencia: https://huggingface.co/Dongkkka/Task000519_PourWater_ViTacFormer_H100_LR1e4_B512_Hand_Intern
- Revisión del modelo de origen: `b4f21caa4e6a7a05814958b63d5ced46a9374321`
- Paper, blog o demo: no disponible

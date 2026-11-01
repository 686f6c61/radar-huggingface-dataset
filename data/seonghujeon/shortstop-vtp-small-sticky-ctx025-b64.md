# SeonghuJeon/shortstop-vtp-small-sticky-ctx025-b64

## Resumen

Shortstop VTP Small — sticky pad es un checkpoint experimental de política robótica publicado por SeonghuJeon, derivado del encoder de visión Facebook DINOv3 ViT-S/16 (preentrenado con LVD-1689M). El modelo implementa una política visomotora (VTP, Visual-Tactile Policy) para una tarea muy concreta: atrapar un objeto en vuelo con una almohadilla adhesiva montada en el efector final y liberarlo en una papelera situada a la izquierda. No es un modelo de lenguaje ni un modelo generativo de propósito general; es un artefacto de investigación orientado a control robótico de manipulación diestra con dos brazos.

El checkpoint corresponde al paso 35.831 de un entrenamiento de 10 épocas sobre 1.911 episodios de entrenamiento y 100 de validación, con lote efectivo de 64. La observación se produce a 20 Hz y cada llamada emite tres comandos articulares absolutos consecutivos a 60 Hz. La entrada combina cinco fotogramas causales de las tres cámaras del sistema, repitiendo el primer fotograma cuando no hay historial suficiente, y no utiliza información propioceptiva.

Su relevancia es acotada pero clara: documenta un intento de combinar un encoder visual de última generación (DINOv3) con una cabeza de política para una tarea de captura dinámica, e incluye métricas de validación offline verificables. El autor advierte explícitamente de que el éxito de rollout no se ha medido para este checkpoint y de que las distribuciones de entrenamiento y evaluación del benchmark son provisionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visomotora (VTP) sobre encoder DINOv3 ViT-S/16; cabeza de acción con horizonte de ejecución 3 y cabeza auxiliar de futuro a 2 s |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 5 fotogramas causales a 20 Hz (0,25 s) |
| Tipos de cuantizacion | no disponible (checkpoint `policy.pt` en PyTorch, sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es textual en inglés pero no se documenta soporte multilingüe) |
| Licencia | dinov3-license (ver `LICENSE_DINOV3.md` en el repositorio) |
| Formato de pesos | `policy.pt` (PyTorch, incluye configuración de arquitectura, buffers de normalización y state dict) |

## Arquitectura y entrenamiento

La política se construye sobre el encoder DINOv3 ViT-S/16 preentrenado con LVD-1689M, que actúa como extractor de representaciones visuales. Sobre él se monta una cabeza de política que consume cinco fotogramas causales procedentes de tres cámaras (15 imágenes por paso de decisión) y emite comandos articulares absolutos. La salida tiene 14 dimensiones: seis articulaciones del brazo izquierdo, un comando de herramienta izquierdo, seis articulaciones del brazo derecho y un comando de herramienta derecho. Las articulaciones se expresan en radianes y el canal de herramienta sigue la convención de posición de dedo YAM en metros; para las almohadillas adhesivas, valores por debajo de 0,0175 activan la adherencia y un comando de apertura la libera.

El entrenamiento cubrió 10 épocas (35.831 pasos) con lote efectivo de 64 sobre 1.911 episodios, con 100 episodios de validación. El checkpoint retiene dos ranuras de embedding de tarea, pero solo se entrenó la de almohadilla adhesiva. La cabeza de futuro a dos segundos es un objetivo auxiliar de entrenamiento y no se usa en ejecución: la política emite el comando motor de los próximos 50 ms. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, algo esperable en un modelo de control robótico. La validación offline final reporta MAE articular de 0,01150 rad y MAE de comando de herramienta de 0,5517 mm.

## Capacidades

- Control visomotor de manipulación bimanual para una tarea específica de captura dinámica y liberación.
- Procesamiento de tres flujos de cámara simultáneos con ventana temporal causal de cinco fotogramas.
- Emisión de comandos articulares absolutos a 60 Hz (tres comandos por llamada, con observación a 20 Hz).
- Control del canal de herramienta con umbral de adherencia (0,0175 m) y liberación por comando de apertura.
- Generalización limitada a la instrucción textual de tarea: "Catch the incoming object with either adhesive pad, then release it into the left bin."
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo de pensamiento. Es exclusivamente una política de control.

## Casos de uso

- Investigación en captura dinámica de objetos: el modelo sirve como línea base reproducible para experimentos de atrapado en vuelo con almohadillas adhesivas, siempre que se disponga del runtime experimental de Pounce y del adaptador Shortstop correspondiente.
- Estudio de integración de encoders visuales de gran escala en políticas robóticas: permite evaluar si DINOv3 ViT-S/16 aporta representaciones útiles para control fino en tareas de contacto, comparando con encoders más pequeños o específicos.
- Reproducción de experimentos de manipulación bimanual: el layout de 14 dimensiones (seis articulaciones por brazo más dos canales de herramienta) encaja en plataformas de dos brazos con efector tipo YAM, útil para validar protocolos de observación a 20 Hz y ejecución a 60 Hz.
- Desarrollo de infraestructura de despliegue robótico: el checkpoint incluye `scripts/serve_policy.py` con horizonte de ejecución configurable y servidor websocket en el puerto 18777, lo que permite probar pipelines de inferencia remota con latencia de red real.
- Docencia y divulgación sobre políticas visomotoras: el modelo es pequeño (0,2 GB de repositorio), carga en una A100 y permite ilustrar el flujo completo desde observaciones multivista hasta comandos articulares en un curso o taller.
- Evaluación de robustez ante historial incompleto: la estrategia de repetir el primer fotograma cuando no hay historial permite estudiar el impacto de ventanas temporales truncadas en el rendimiento de políticas causales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rollout en la informacion disponible. El autor indica explícitamente que el éxito de rollout no se ha medido para este checkpoint y que la puntuación de 3/40 del modelo anterior VTP B16/6-épocas no debe atribuirse a esta versión.

| Metrica | Valor | Contexto |
|---|---|---|
| MAE articular (validación offline final) | 0,01150 rad | 100 episodios de validación |
| MAE de comando de herramienta | 0,5517 mm | 100 episodios de validación |
| Llamadas de inferencia verificadas | 6 salidas finitas | A100 80GB, entradas RGB sintéticas, revisión `7f046449` |
| Éxito de rollout | no medido | No atribuible al modelo anterior (3/40) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 0,2 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPUs de consumo, pero no se documenta la huella exacta en memoria.
- GPU verificada: A100 80GB, donde se ejecutaron 6 llamadas de inferencia con salidas finitas y entradas RGB sintéticas.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, RTX 3090 u otras; el autor no confirma que quepa en consumer GPU.
- Opciones de despliegue: `scripts/serve_policy.py --policy pounce --checkpoint /path/to/policy.pt --execution-horizon 3 --port 18777`, dentro del runtime experimental Pounce. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La observación es a 20 Hz y la ejecución a 60 Hz, pero no se publican tiempos de inferencia medidos.
- Requisito crítico: el adaptador experimental Shortstop y el runtime Pounce son necesarios. Una instalación estándar de OpenPI o el PR #124 por sí solos no reproducen la inferencia de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shortstop VTP Small — sticky pad (este modelo) | no disponible | 5 fotogramas causales (0,25 s) | Captura dinámica con almohadilla adhesiva | dinov3-license | Peso público; runtime privado requerido |
| VTP B16/6-épocas (modelo anterior del mismo autor) | no disponible | no disponible | Misma tarea | no disponible | Pesos eliminados; solo se cita su 3/40 de éxito |
| facebook/dinov3-vits16-pretrain-lvd1689m | no disponible | no aplica (encoder visual) | Representación visual general | dinov3-license | Público en HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas visomotoras para captura dinámica) en la documentación proporcionada.

## Limitaciones y advertencias

- El éxito de rollout no se ha medido para este checkpoint; no hay evidencia de que la política funcione en el entorno real más allá de la validación offline.
- El benchmark es experimental: las distribuciones de entrenamiento y evaluación son provisionales y el autor lo describe como exportaciones de checkpoint, no como un lanzamiento oficial de benchmark.
- Requiere el adaptador experimental Shortstop y el runtime Pounce, que no son públicos ni están incluidos; el PR #124 de `worv-ai/worv` exige acceso al repositorio y no contiene todos los cambios experimentales necesarios.
- Solo se entrenó la ranura de embedding de la tarea de almohadilla adhesiva; la segunda ranura retenida no es funcional.
- No usa información propioceptiva, aunque el protocolo del adaptador pueda exigir un campo de estado.
- La licencia dinov3-license impone condiciones específicas al derivado por contener pesos de DINOv3; es responsabilidad del usuario revisar `LICENSE_DINOV3.md` antes de cualquier uso comercial.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de comandos articulares incorrectos o inseguros en entornos físicos; no hay evaluación de seguridad documentada.
- La verificación de inferencia se hizo con entradas RGB sintéticas y no valida la integración websocket ni la instalación desde un checkout limpio.
- No se documentan sesgos, cobertura idiomática ni comportamiento fuera de la distribución de entrenamiento.
- No se incluyen dataset, estado del optimizador, credenciales ni código de implementación privado, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeonghuJeon/shortstop-vtp-small-sticky-ctx025-b64
- Licencia DINOv3: https://huggingface.co/SeonghuJeon/shortstop-vtp-small-sticky-ctx025-b64/blob/main/LICENSE_DINOV3.md
- Modelo base DINOv3 ViT-S/16: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- PR del benchmark Shortstop (acceso restringido): https://github.com/worv-ai/worv/pull/124
- Comentario con diferencias de runtime y comandos corregidos: https://github.com/worv-ai/worv/pull/124#issuecomment-6433366546

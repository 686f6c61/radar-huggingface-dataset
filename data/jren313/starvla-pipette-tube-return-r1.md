# jren313/starvla-pipette-tube-return-r1

## Resumen

starvla-pipette-tube-return-r1 es un checkpoint de política visión-lenguaje-acción (VLA) para robótica publicado en Hugging Face por el usuario jren313 (Jiming Ren). Se trata de un ajuste fino de nvidia/GR00T-N1.7-3B, realizado con el framework starVLA, que cubre una única fase de un flujo de pipeteo de banco de cinco pasos sobre un humanoide Unitree G1 equipado con manos Inspire. La tarea concreta es la fase 4: devolver a la gradilla azul de la izquierda el tubo que sostiene la mano izquierda, mientras la mano derecha mantiene la pipeta.

El modelo hereda la arquitectura del GR00T-N1.7-3B: un backbone visual-lenguaje Cosmos-Reason2-2B (capa de selección 16) más una cabeza DiT de 32 capas con atención VL alternada y decodificación por flow-matching en 4 pasos de inferencia, sobre un espacio de acción de 32 dimensiones. El entrenamiento es un ajuste fino completo (se ajustan tanto el LLM como la torre visual) con gradient checkpointing, y aplica un dropout de estado del 0,8 para forzar a la política a depender de las dos cámaras de observación.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de la receta de una política por fase aplicada a manipulación bimanual de precisión con datos teleoperados, y el autor lo etiqueta explícitamente como checkpoint de investigación que todavía no completa su fase de forma fiable. No declara licencia, no tiene descargas ni validación de la comunidad, y no publica resultados de benchmarks numéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone VLM Cosmos-Reason2-2B (select_layer 16) + cabeza de acción DiT de 32 capas con flow-matching (4 pasos de inferencia), implementada como `CosmosGR00TN1d7` en starVLA |
| Parámetros totales | ~3 mil millones (según el modelo base nvidia/GR00T-N1.7-3B); no se publica desglose exacto por componente |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen checkpoints PyTorch `.pt`; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (las sentencias de tarea del conjunto de datos están en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`pytorch_model.pt`), pesos completos del modelo, no safetensors ni GGUF |
| Espacio de acción | 32-D: muñecas relativas al chunk + pulgar izquierdo relativo + mano derecha absoluta + 14 articulaciones absolutas de brazo |
| Observación | 2 cámaras: cabeza RGB 1280x720 y `wrist_left` 1080x1080, redimensionadas a 270 y recortadas a 256; vector de estado de 59-D |
| Chunk de acción | 30 pasos (0,5 s a 60 Hz) |
| Checkpoint servido | `gr00t/checkpoints/steps_500_pytorch_model.pt` (paso 500 de 1342) |
| Tamaño del repositorio | 19,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de GR00T-N1.7-3B: un backbone Cosmos-Reason2-2B que procesa las dos vistas de cámara y la sentencia de tarea, y una cabeza de acción DiT de 32 capas con bloques de atención visión-lenguaje alternados que genera acciones por flow-matching en 4 pasos. El cargador de starVLA verifica que los 1.031 tensores del modelo base se cargan 1:1, con el slot de embodiment fijado a 25. El ajuste fino es completo sobre el LLM y la torre visual, con gradient checkpointing activado.

Los datos provienen del conjunto jren313/g1-pipette-2view-teleop0925-5task-eerel: 237 episodios teleoperados a 60 Hz de una captura de banco de cinco pasos, con una sentencia de objetivo por paso. Cada fase se entrena de forma aislada sobre los episodios de su propio paso, con una división train/test a nivel de grabación (las mitades de "pick" y "return" de una misma grabación permanecen del mismo lado). Se descarta un ancla de entrenamiento cuando ninguna muñeca comandada se desplaza 1 mm a lo largo de su chunk (filtro de pausa). La observación incluye un vector de estado de 59-D (29 articulaciones, poses medidas y comandadas de ambas muñecas, `thumb_bend` izquierdo comandado y 5 registros de la mano derecha); un dropout del 0,8 sobre el vector de estado completo obliga al modelo a leer las cámaras en el 80% de las muestras.

La optimización usa AdamW 8-bit paginado con betas (0,9, 0,95) y weight decay 0; LR de 2e-5 para el backbone y la interfaz VL, 2e-4 para la cabeza de acción; decaimiento coseno hasta 1e-6 tras 100 pasos de warmup; recorte de norma de gradiente 1,0; batch de 128 (32 x 4 GPU, sin acumulación); 10 épocas; semilla 42. La selección del checkpoint se hace por MSE de holdout sobre un segmento fijo de 480 muestras de los episodios de test (4 rangos x 10 batches x 12), aproximadamente una vez por época, y se sirve el punto guardado con menor pérdida. Las estadísticas de normalización se calculan por fase sobre sus propios episodios de entrenamiento y deben servirse exactamente con el fichero `gr00t/dataset_statistics.json`.

## Capacidades

- Generación de acciones motoras bimanuales en espacio de 32 dimensiones para el humanoide Unitree G1 con manos Inspire (muñecas, pulgar izquierdo, mano derecha y articulaciones de brazo).
- Ejecución de una única subtarea de manipulación: devolver a la gradilla el tubo sostenido por la mano izquierda (fase 4 del flujo de pipeteo).
- Percepción multimodal con dos cámaras simultáneas: vista de cabeza (1280x720) y vista de muñeca izquierda (1080x1080).
- Condicionamiento por lenguaje natural: acepta una sentencia de tarea en inglés como instrucción de objetivo.
- Seguimiento robusto cuando el estado propioceptivo es parcialmente inobservable, gracias al dropout de estado del 0,8 durante el entrenamiento.
- Predicción de chunks de acción de 30 pasos (0,5 s a 60 Hz) con muñecas expresadas de forma relativa al primer paso del chunk.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo resuelve una fase aislada y el encadenamiento entre fases se hace externamente.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no dispone de modo de razonamiento explícito ni de procesamiento de audio; el autor indica que los checkpoints por fase de GR00T funcionan claramente mejor que las cabezas QwenOFT entrenadas sobre las mismas particiones, aunque todavía no completan su fase de forma fiable.

## Casos de uso

- Investigación en VLA con receta por fase: sirve como referencia reproducible para comparar el entrenamiento de una política especializada por subtarea frente a una política única multi-tarea, usando los demás checkpoints del autor (fases 1, 2, 3 y 5) como contrapartida.
- Automatización de laboratorio (pipeteo): el modelo cubre el sub-paso de devolución del tubo a la gradilla; encadenado con `starvla-pipette-pick-r3`, `starvla-pipette-tube-pick-r2`, `starvla-pipette-aim-r1` y `starvla-pipette-return-r1` permitiría cubrir el ciclo completo de cinco pasos sobre un G1.
- Estudio del efecto del dropout de estado: con un 0,8 de dropout y 59 dimensiones de estado, es un banco de pruebas directo para medir cuánta información proprioceptiva necesita realmente una política bimanual frente a la información visual.
- Comparación de paradigmas de decodificación: al estar entrenado con la misma partición que las cabezas QwenOFT mencionadas por el autor, permite aislar la contribución de la cabeza DiT de flow-matching frente a cabezas de regresión más simples.
- Desarrollo de espacios de acción relativos: el modelo usa muñecas relativas al chunk con rotación compuesta en el marco del ancla, lo que lo convierte en un caso útil para validar esquemas de acción relativa en manipulación de precisión.
- Recolección de datos teleoperados y control de calidad: su fichero `train.log` y `summary.jsonl` documentan cada evaluación de holdout, lo que permite auditar la curva de aprendizaje y detectar problemas en las capturas antes de escalar la recolección.
- Punto de partida para fine-tuning en tareas bimanuales afines: al ser un ajuste fino completo del GR00T-N1.7-3B sobre una tarea de precisión con dos cámaras, puede reutilizarse como inicialización para otras tareas de inserción o colocación sobre el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni métricas de referencia estándar, y no hay cifras numéricas de éxito en robot en la información proporcionada.

La única evaluación descrita es la metodología de selección de checkpoint, cuyos valores concretos no se publican:

| Evaluación | Estado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplicable / no disponible |
| MSE de holdout sobre 480 muestras fijas de test | metodología descrita; valores numéricos no disponibles |
| Comparación en unidades físicas (mm, grados, registros) por fase contra las etiquetas reales | metodología descrita; valores numéricos no disponibles |
| Tasa de éxito de la fase 4 en el robot | no disponible; el autor indica que el checkpoint no completa su fase de forma fiable |

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias a partir de un modelo de ~3.000 millones de parámetros; el autor no publica requisitos): ~12 GB solo para pesos en fp32, ~6 GB en bf16/fp16 e ~3 GB en int8. Añadiendo activaciones de dos cámaras a 256x256, el backbone VLM y los 4 pasos de la cabeza DiT, un despliegue realista requiere del orden de 14-16 GB en fp32 y 8-10 GB en bf16.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S tienen margen sobrado; para entrenamiento el autor usó 4 GPU con batch 32 por GPU (128 total), pero no especifica el modelo de GPU empleado.
- GPU de consumo: cabe con holgura en RTX 4090 y RTX 3090 (24 GB) en cualquier precisión; en bf16 debería caber también en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB); en tarjetas de 12 GB (RTX 3060 12 GB) sería muy ajustado salvo cuantización agresiva, no documentada.
- Opciones de despliegue: el modelo se sirve con el código de starVLA (https://github.com/starVLA/starVLA) en PyTorch, cargando `gr00t/checkpoints/steps_500_pytorch_model.pt` junto con `gr00t/dataset_statistics.json` exactamente como se generó. No es compatible de serie con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de generación de texto sino una política con cabeza de acción DiT.
- Latencia y throughput: no documentados. Como referencia de diseño, cada inferencia produce un chunk de 30 pasos que a 60 Hz equivalen a 0,5 s de movimiento, por lo que la política necesita ejecutarse a 2 Hz o más para no dejar huecos en la trayectoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Espacio de acción | Checkpoint servido | Licencia |
|---|---|---|---|---|---|---|
| starvla-pipette-tube-return-r1 (este) | ~3B | no disponible | Fase 4: devolver el tubo a la gradilla | 32-D: muñecas rel + pulgar izq. rel + mano der. abs + articulaciones | steps_500 | no disponible |
| nvidia/GR00T-N1.7-3B (modelo base) | ~3B | no disponible | Política generalista multi-embodiment | no disponible | no disponible | no disponible en la información consultada |
| starvla-pipette-aim-r1 | ~3B | no disponible | Fase 3: apuntar la pipeta al tubo | 32-D: muñecas rel + pulgar izq. rel + mano der. abs + articulaciones | steps_1350 | no disponible |
| starvla-pipette-return-r1 | ~3B | no disponible | Fase 5: devolver la pipeta al soporte | 32-D: muñecas rel + pulgar izq. rel + mano der. abs + articulaciones | steps_3000 | no disponible |
| Cabezas QwenOFT del mismo autor | no disponible | no disponible | Fases del mismo flujo de pipeteo | no disponible | no disponible | no disponible |

Frente a alternativas de la misma categoría (políticas VLA bimanuales de ~3B como las de la familia GR00T o propuestas del estilo de pi0), no se dispone de datos comparativos de rendimiento en la información proporcionada. El autor sí aporta una comparación cualitativa interna: los checkpoints por fase de GR00T superan claramente a las cabezas QwenOFT entrenadas sobre las mismas particiones, aunque ninguno de ellos completa su fase de forma fiable.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción: el propio autor afirma que no completa su fase de forma fiable en el robot.
- Cubre una sola fase (la 4) de un flujo de cinco pasos; no puede ejecutar el procedimiento completo por sí solo y requiere orquestación externa entre políticas.
- Entrenado con 237 episodios teleoperados de una única configuración de banco, robot y manos; la generalización a otras disposiciones, iluminaciones, objetos o efectores es muy limitada.
- Licencia no declarada: no hay autorización explícita de uso comercial ni condiciones de redistribución, lo que impide su uso en productos sin aclaración previa con el autor.
- Idiomas: las sentencias de tarea del conjunto de datos están en inglés y no se documenta soporte de otros idiomas.
- Riesgo de alucinación motora: al ser una política de flow-matching, puede generar trayectorias plausibles pero incorrectas cuando la escena se aleja de la distribución de entrenamiento; no existe mecanismo de abstención ni de detección de fallo.
- Dependencia crítica de las estadísticas de normalización: servir el modelo con un `dataset_statistics.json` distinto al del entrenamiento invalida las acciones predichas.
- El dropout de estado del 0,8 mejora la dependencia visual pero también implica que el modelo fue entrenado para operar con propriocepción ausente la mayor parte del tiempo; el comportamiento con estado completo puede diferir del esperado.
- Sin descargas ni validación de la comunidad, y sin resultados de benchmarks publicados: no hay evidencia externa e independiente de su comportamiento.
- Las fechas de creación y actualización del repositorio que figuran en la ficha son 2026-09-30 y 2026-10-02 respectivamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jren313/starvla-pipette-tube-return-r1
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel
- Repositorio starVLA: https://github.com/starVLA/starVLA
- Paper de starVLA: https://arxiv.org/abs/2604.05014
- Versión HTML del paper: https://arxiv.org/html/2604.05014v1
- Perfil del autor: https://huggingface.co/jren313
- Conjuntos de datos del autor: https://huggingface.co/jren313/datasets
- Checkpoint de la fase 1 (r2): https://huggingface.co/jren313/starvla-pipette-pick-r2
- Checkpoint de la fase 1 (r3): https://huggingface.co/jren313/starvla-pipette-pick-r3
- Checkpoint de la fase 2 (r1, sustituido): https://huggingface.co/jren313/starvla-pipette-tube-pick-r1
- Checkpoint de la fase 2 (r2): https://huggingface.co/jren313/starvla-pipette-tube-pick-r2
- Checkpoint de la fase 3: https://huggingface.co/jren313/starvla-pipette-aim-r1
- Checkpoint de la fase 5: https://huggingface.co/jren313/starvla-pipette-return-r1

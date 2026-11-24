# Daankrol/vla-jepa-so101-verification

## Resumen

VLA-JEPA-SO101-verification es un repositorio de checkpoints y exportaciones derivados de LeRobot VLA-JEPA-Pretrain, un modelo vision-language-action (VLA) para control robótico. Lo publica el usuario Daankrol y contiene tres variantes entrenadas mediante fine-tuning sobre un dataset propio de episodios reales de pick-and-place con múltiples objetos (`Daankrol/pick-and-place-multi-obj`), grabados con un brazo SO-101. El objetivo no es tanto desplegar un modelo nuevo como verificar la paridad de inferencia entre el checkpoint original, una exportación Torch de Physical AI Studio y una exportación OpenVINO del mismo.

El modelo hereda la arquitectura de VLA-JEPA-Pretrain, que combina un backbone lingüístico-visual Qwen3-VL-2B-Instruct (aproximadamente 2 mil millones de parámetros) con el encoder V-JEPA 2 ViT-L (facebook/vjepa2-vitl-fpc64-256) y módulos JEPA específicos de entrenamiento que se eliminan en las exportaciones de inferencia. La salida es un chunk de siete acciones sobre las seis articulaciones del SO-101, en el orden grabado.

Es relevante para desarrolladores e investigadores en robótica de manipulación porque documenta un flujo completo de fine-tuning, exportación a Torch y OpenVINO, y verificación numérica de paridad (diferencias máximas en unidades de acción sobre `verification/samples.npz`), además de incluir el estado de optimización en algunos checkpoints. El repositorio ocupa 74,1 GB, no registra descargas ni likes en el momento de la consulta y no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en VLA-JEPA: backbone Qwen3-VL-2B-Instruct + encoder V-JEPA 2 ViT-L, con módulos JEPA de entrenamiento omitidos en las exportaciones de inferencia |
| Parametros totales | no disponible (el backbone declarado es Qwen3-VL-2B-Instruct, ~2B; no se especifica el total del sistema completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; las exportaciones OpenVINO se verificaron en CPU con inferencia f32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; el modelo base VLA-JEPA-Pretrain es Apache 2.0, Qwen3-VL-2B-Instruct es Apache 2.0 y V-JEPA 2 encoder es MIT |
| Formato de pesos | safetensors (tag del repo), checkpoint `.ckpt` original, exportación Torch (`torch/vlajepa.pt`, política de Studio, no TorchScript) y exportación OpenVINO (`openvino/`) |
| Acciones de salida | chunk de 7 acciones sobre 6 articulaciones SO-101 |
| Entradas de cámara | `exterior_1_left` (gripper) y `exterior_2_left` (overhead) en el checkpoint original; `gripper` y `overhead` en las exportaciones Studio |
| Tamaño del repo | 74,1 GB |
| Modelo base | lerobot/VLA-JEPA-Pretrain |

## Arquitectura y entrenamiento

El sistema parte de LeRobot VLA-JEPA-Pretrain, que acopla un modelo lingüístico-visual Qwen3-VL-2B-Instruct con el encoder de vídeo V-JEPA 2 ViT-L (fpc64-256). Sobre esa base se añaden módulos JEPA orientados al entrenamiento que se eliminan en las exportaciones Torch y OpenVINO, de modo que la inferencia conserva únicamente el camino necesario para predecir acciones. Las exportaciones convertidas de LeRobot preservan los pesos entrenados y la normalización, y usan el embedding Qwen atado del checkpoint.

Se publican tres variantes. `studio-030000` contiene `checkpoint/step030000.ckpt` (solo pesos) tras 30.000 actualizaciones en Studio. `lerobot-030000` contiene `checkpoint/pretrained_model/` y `checkpoint/training_state/` tras 30.000 actualizaciones con LeRobot 0.7.0. Ambas usan el mismo conjunto de 180 episodios de entrenamiento y 20 de validación en la revisión `abf1f62b51dd3441b827478829e0d559fa4a96ac` del dataset. `kahan-epoch007` proviene de una ejecución más larga en Studio Kahan con 86.088 actualizaciones y corresponde al mejor epoch registrado de una campaña de 10 epochs sobre la rama `main`, cuya revisión histórica exacta no se recuperó; este checkpoint incluye estado del optimizador.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO. La verificación se centra en paridad de inferencia, no en éxito de tarea robótica: se comparan las salidas sobre cuatro muestras de `verification/samples.npz` y se registra la diferencia absoluta máxima en unidades de acción en cada `verification.json`. Las ejecuciones Torch usan ruido de flujo fijo en CUDA y OpenVINO se comprobó en CPU con f32.

## Capacidades

- Predicción de acciones robóticas: genera chunks de siete acciones para las seis articulaciones del SO-101 en el orden grabado.
- Manipulación pick-and-place multiobjeto: fine-tune sobre episodios reales de recogida y colocación con varios objetos.
- Percepción visual dual: consume dos vistas de cámara (gripper y overhead), con nombres distintos según el formato de checkpoint.
- Exportación a Torch: `torch/vlajepa.pt` como política de Studio, cargable con `VLAJEPA.load_from_checkpoint(..., weights_only=True)` desde el commit `06d45e56`.
- Exportación a OpenVINO: grafo de batch uno que acepta estado bruto y produce chunks de acción desnormalizados; requiere el preprocesador `vla_jepa` (verificado con commit `b6b846a`) y las anotaciones de precisión del arreglo f16 de Studio.
- Carga nativa en LeRobot: `lerobot-030000/checkpoint/pretrained_model/` con LeRobot 0.7.0 y sus procesadores guardados.
- Verificación de integridad: comparación de SHA-256 con `SHA256SUMS` y scripts de paridad (`studio_infer.py`, `compare.py`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, thinking mode, audio ni visión general más allá del uso robótico.

## Casos de uso

- Fine-tuning de políticas de manipulación sobre un brazo SO-101: partir de VLA-JEPA-Pretrain y ajustar con episodios propios de pick-and-place, usando `lerobot-030000` como referencia de configuración con LeRobot 0.7.0.
- Despliegue en CPU con OpenVINO: usar la exportación `openvino/` con inferencia f32 para entornos sin GPU, verificando antes el dispositivo objetivo antes de habilitar movimiento.
- Despliegue en GPU con Torch: cargar `torch/vlajepa.pt` mediante la API de Physical AI Studio para inferencia en CUDA con ruido de flujo fijo.
- Validación de pipelines de exportación: comparar salidas originales, Torch y OpenVINO con `verification/compare.py` para detectar divergencias numéricas antes de llevar un modelo a un robot real.
- Investigación en representaciones JEPA para robótica: reutilizar los checkpoints para estudiar cómo los módulos JEPA de entrenamiento afectan a la política final una vez omitidos en inferencia.
- Reproducibilidad de experimentos: emplear los enlaces a W&B y las revisiones de dataset documentadas para reproducir las ejecuciones de 30.000 actualizaciones.
- Auditoría de checkpoints con estado de optimizador: `kahan-epoch007` incluye estado del optimizador, útil para reanudar entrenamiento o analizar la trayectoria de la campaña de 10 epochs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificación de paridad de inferencia (diferencia absoluta máxima en unidades de acción sobre `verification/samples.npz`), no métricas de éxito de tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone declarado es Qwen3-VL-2B-Instruct (~2B), pero el sistema completo incluye encoder V-JEPA 2 ViT-L y no se publica el recuento total de parámetros ni el consumo medido.
- GPU recomendadas: no disponible; las ejecuciones Torch de verificación se hicieron en CUDA sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Despliegue en CPU: soportado mediante la exportación OpenVINO, verificada en CPU con inferencia f32.
- Opciones de despliegue: Physical AI Studio (Torch y OpenVINO), LeRobot 0.7.0 para el checkpoint nativo, y el runtime de OpenVINO con el preprocesador `vla_jepa`.
- Latencia y throughput: no disponibles.
- Almacenamiento: el bundle completo ocupa 74,1 GB; se recomienda descargar solo la exportación necesaria con `hf download ... --include`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Daankrol/vla-jepa-so101-verification | no disponible (backbone ~2B) | no disponible | VLA para SO-101, pick-and-place | no disponible en el repo | Hugging Face, 0 descargas |
| lerobot/VLA-JEPA-Pretrain | no disponible | no disponible | VLA preentrenado (modelo base) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | ~2B | no disponible | Vision-language general | Apache 2.0 | Hugging Face |
| facebook/vjepa2-vitl-fpc64-256 | no disponible | no disponible | Encoder de vídeo (V-JEPA 2 ViT-L) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La verificación publicada comprueba paridad de inferencia en cuatro muestras, no éxito de tarea robótica; no debe interpretarse como validación de funcionamiento en un robot real.
- El repositorio no declara licencia propia; las licencias de los componentes base (Apache 2.0 y MIT) no cubren automáticamente los pesos derivados. Es necesario aclarar los términos antes de uso comercial.
- El checkpoint `kahan-epoch007` proviene de la rama `main` del dataset y su revisión histórica exacta no se recuperó, lo que limita la reproducibilidad estricta de esa ejecución.
- Los nombres de cámara difieren entre el checkpoint original (`exterior_1_left`, `exterior_2_left`) y las exportaciones Studio (`gripper`, `overhead`); un mapeo incorrecto invalida las predicciones.
- La exportación Torch no es TorchScript ni un modelo Transformers: requiere la API `VLAJEPA.load_from_checkpoint` de Physical AI Studio en el commit `06d45e56`.
- La exportación OpenVINO tiene batch uno y requiere el preprocesador `vla_jepa` en el runtime; debe comprobarse el dispositivo objetivo antes de habilitar movimiento.
- No se documentan sesgos, tasas de alucinación, cobertura idiomática ni límites de contexto; al ser un modelo de acción, el riesgo principal es la ejecución de movimientos incorrectos.
- El tamaño del repo (74,1 GB) y la inclusión de estado de entrenamiento en algunos checkpoints complican la descarga y el despliegue si no se filtran los archivos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Daankrol/vla-jepa-so101-verification
- Modelo base VLA-JEPA-Pretrain: https://huggingface.co/lerobot/VLA-JEPA-Pretrain
- Backbone Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Encoder V-JEPA 2: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- Dataset de entrenamiento: https://huggingface.co/datasets/Daankrol/pick-and-place-multi-obj
- Ejecución W&B Studio (30.000 actualizaciones): https://wandb.ai/daankrol/vla-jepa-multiobj-compare/runs/3ab24d28
- Ejecución W&B LeRobot 0.7.0 (30.000 actualizaciones): https://wandb.ai/daankrol/vla-jepa-multiobj-compare/runs/bfacc848

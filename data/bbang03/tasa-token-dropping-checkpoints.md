# Bbang03/tasa-token-dropping-checkpoints

## Resumen

TD-v1 es un conjunto de cinco checkpoints de investigación publicados por el usuario Bbang03 en Hugging Face. No se trata de un modelo generativo al uso, sino de pesos completos de entrenamiento (ficheros `.pt` de PyTorch) para tareas de visión-lenguaje aplicadas a imagen médica y detección de objetos camuflados. Cada checkpoint corresponde a un experimento de 50 épocas sobre un dataset distinto (BUS-CoT, Brain MRI, Chest CT, COD10K y MAS3K), todos ellos construidos sobre backbones CLIP (BiomedCLIP ViT-B/16 y OpenAI CLIP ViT-B/32).

La contribución técnica central es el denominado *token dropping* (TD-v1): en la rama negativa del entrenamiento se eliminan físicamente los patch tokens que solapan al menos 10 píxeles de primer plano con la máscara GT, antes de entrar al transformer, conservando CLS y las posiciones originales de los tokens retenidos. El objetivo es aprender representaciones que discriminen entre la imagen original y su versión con tokens de objeto eliminados, algo relevante para segmentación y detección en dominios donde el objeto es difícil de distinguir del fondo.

Es relevante ahora porque expone pesos intermedios de investigación con instrucciones de reproducibilidad (SHA256SUMS, `training_config.json`, captura de estado RNG, implementación de `Tasa50Loss`) en un ámbito, el de la imagen médica con CLIP, donde escasean los checkpoints abiertos verificables. No obstante, el propio autor advierte que no es una reproducción exacta del pipeline upstream y que los ficheros no son paquetes `AutoModel` listos para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT (CLIP dual-encoder: imagen + texto). Backbones: BiomedCLIP ViT-B/16 y OpenAI CLIP ViT-B/32 quickgelu |
| Parametros totales | no disponible (no se indica el recuento; los backbones ViT-B rondan los 86-150 M por encoder, pero el dato no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; la longitud de secuencia varía por muestra al eliminar tokens) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints FP32/FP16 de entrenamiento en `.pt`, no cuantizaciones) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | no disponible (el autor indica explícitamente que no se infiere licencia nueva; aplican las condiciones upstream de BiomedCLIP, OpenAI CLIP y los datasets) |
| Formato de pesos | `.pt` (checkpoints completos de PyTorch con `state_dict`, `epoch` y estado de reanudación: optimizador, scaler). No hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada checkpoint es un modelo CLIP de dos torres (imagen y texto) con backbone ViT-B/16 (BiomedCLIP) o ViT-B/32 quickgelu (OpenAI CLIP). En BUS-CoT se congela el encoder de texto; en los otros cuatro se entrenan ambos encoders. Todos parten de la inicialización preentrenada original de su backbone, no de otro checkpoint afinado del dominio. El entrenamiento es de 50 épocas con semilla 12 y learning rate 5e-7 en cuatro de los cinco experimentos; COD10K usa semilla 0, learning rate 1e-6 y batch global 256 (2 x 128), mientras que el resto usa batch 32.

La innovación principal es el *token dropping* de la rama negativa: tras el preprocesado, patch embedding y positional embeddings, se eliminan físicamente los patch tokens que solapan 10 o más píxeles de primer plano con la máscara GT, agrupando las secuencias variables por número de tokens retenidos. La referencia congelada recibe la misma construcción negativa. El pipeline incluye la implementación documentada de `Tasa50Loss` (márgenes coseno en FP32 y softplus), captura y restauración del RNG para la inicialización de la referencia y configuración local de modelo y tokenizer. El autor subraya que no es una reproducción exacta de la implementación upstream sin modificar y que los ajustes históricos de MAS3K con OpenAI CLIP no se establecieron de forma independiente.

## Capacidades

- Codificación de imagen y texto en espacio CLIP compartido (contrastivo imagen-texto).
- Clasificación y discriminación de estados negativos definidos por *token dropping* con máscara GT.
- Segmentación sobre imágenes originales (sin inyección de token dropping en la inferencia positiva de segmentación).
- Detección de objetos camuflados (COD10K) y segmentación de lesiones médicas (BUS-CoT, Brain MRI, Chest CT).
- Trabajo con secuencias de longitud variable agrupadas por número de tokens retenidos.
- No incluye generación de texto libre, tool calling, function calling, capacidades de agente ni modo *thinking*.
- Soporte multilingüe: no disponible; solo inglés.

## Casos de uso

- Investigación en segmentación de lesiones mamarias: el checkpoint `bus_cot/epoch_50.pt` permite reproducir el protocolo de discriminación sobre BUS-CoT con BiomedCLIP ViT-B/16 y encoder de texto congelado, útil para comparar variantes de pérdida contrastiva.
- Segmentación de tumores cerebrales en resonancia: `brain_mri/epoch_50.pt` sirve como punto de partida para estudiar cómo afecta la eliminación de tokens de objeto a la calidad de las representaciones en MRI.
- Análisis de TC torácico: `chestct/epoch_50.pt` se emplea para evaluar la discriminación entre imagen original y estado con tokens eliminados, con el código de linaje `cvpr-reproduction` modificado como TD-v1.
- Detección de objetos camuflados: `cod10k/epoch_50.pt` (OpenAI CLIP ViT-B/32 quickgelu, batch 256) permite experimentar con el protocolo de *token dropping* en escenas donde el objeto se confunde con el fondo.
- Segmentación de objetos camuflados a gran escala: `mas3k/epoch_50.pt` se usa para réplicas del experimento, teniendo en cuenta la advertencia del autor sobre los ajustes históricos no verificados.
- Reproducibilidad y auditoría de experimentos: los ficheros `SHA256SUMS`, `manifest.json` y `training_config.json` permiten verificar bytes y reconstruir la configuración exacta (semilla, batch, learning rate, pesos de pérdida) para auditorías internas.
- Estudio de métodos de eficiencia en ViT: el mecanismo de eliminación física de tokens con longitudes variables es un caso de estudio para investigar *token pruning* dependiente de máscara en lugar de atención enmascarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (clasificación con estados negativos definidos por GT y segmentación sobre imágenes originales) pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de segmentación o clasificación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 9,8 GB; cada checkpoint individual contiene un ViT-B (uno o dos encoders) más estado de optimizador y scaler, por lo que la inferencia en FP16 de un ViT-B/16 cabe holgadamente en GPUs de consumo, pero el dato exacto no se declara.
- GPU recomendadas: no disponible. Por el tamaño de los backbones (ViT-B), una RTX 3090/4090 de 24 GB es suficiente para inferencia; para reentrenar con batch 32 y estado de optimizador se recomienda A100 o H100.
- Cabe en GPU de consumo: previsiblemente sí para inferencia (ViT-B), aunque el autor no lo confirma.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo). El autor indica cargar con `torch.load(..., weights_only=True)` y `load_state_dict(strict=True)` usando la implementación TD-v1/OpenCLIP y la configuración de `training_config.json`, eliminando el prefijo `module.` de DDP si procede.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TD-v1 (este repo) | no disponible (ViT-B) | no aplica | CLIP médico + COD con token dropping | no disponible (upstream) | Checkpoints `.pt` en HF |
| BiomedCLIP (Microsoft) | no disponible en la información | no aplica | CLIP biomédico | condiciones upstream | Pesos públicos |
| OpenAI CLIP ViT-B/32 | no disponible en la información | no aplica | CLIP generalista | condiciones upstream | Pesos públicos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los `.pt` son checkpoints completos de entrenamiento, no paquetes `AutoModel` de Hugging Face; requieren el código TD-v1/OpenCLIP y las transformaciones, tokenizer y manifiestos de evaluación originales.
- La evaluación de clasificación incluye estados negativos definidos por GT; las puntuaciones no deben presentarse como rendimiento clínico libre de GT.
- El propio autor advierte que la eliminación de tokens y el recuento de tokens retenidos pueden actuar como atajo para el estado negativo; no se reclama beneficio causal ni de generalización verificado.
- No es una reproducción exacta de la implementación upstream sin modificar; los ajustes históricos de MAS3K con OpenAI CLIP no se establecieron de forma independiente.
- Licencia no disponible: no se concede derecho adicional sobre código fuente, modelos preentrenados ni datasets upstream; hay que consultar los términos de BiomedCLIP, OpenAI CLIP y cada dataset.
- Solo inglés; sin capacidades generativas, de agente ni de tool calling.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí riesgo de sobreinterpretar métricas de discriminación como capacidad clínica.
- Uso comercial: restringido por las condiciones upstream, no verificadas en esta ficha.
- Repositorio con 0 descargas y 0 likes; sin validación comunitaria ni resultados publicados.

## Enlaces

- Hugging Face: https://huggingface.co/Bbang03/tasa-token-dropping-checkpoints
- BiomedCLIP (Microsoft): no disponible en la información proporcionada
- OpenAI CLIP: no disponible en la información proporcionada
- Paper o blog del método TD-v1: no disponible en la información proporcionada
- Repositorio de código `cvpr-reproduction`: no disponible en la información proporcionada
- Recursos `KRMayD/finegrained-vlm-training-test-copy-no-checkpoints`: no disponible en la información proporcionada

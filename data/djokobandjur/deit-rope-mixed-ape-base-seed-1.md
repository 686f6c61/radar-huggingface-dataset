# djokobandjur/deit-rope-mixed-ape-base-seed-1

## Resumen

DeiT Base con RoPE mixto aprendido y embeddings posicionales absolutos (APE) es un checkpoint de investigación de clasificación de imágenes entrenado de forma independiente por Đoko Banđur y Miloš Banđur. Se trata de una variante del Vision Transformer DeiT Base (86 millones de parámetros, parche 16x16) en la que se sustituye o combina el mecanismo estándar de codificación posicional con una implementación de Rotary Position Embedding (RoPE) de frecuencias mixtas y parámetros aprendidos, siguiendo la línea de trabajo de Heo et al. (ECCV 2024) sobre RoPE para Vision Transformers.

El modelo se distribuye como un artefacto de entrenamiento PyTorch original (`final_checkpoint.pth`, 1,4 GB) identificado por checksum SHA-256, no como un paquete listo para `AutoModel.from_pretrained`. Su propósito es la reproducibilidad de investigación en representaciones de transformers de visión y en el estudio de parámetros de frecuencia rotacional aprendidos, no el despliegue directo en producción.

La relevancia actual reside en que explora una alternativa a las codificaciones posicionales clásicas en ViT y aporta un punto de comparación numérico (83,772 % de top-1 en ImageNet-1k validation) dentro de una familia de seis checkpoints entrenados con semillas independientes. El checkpoint se publica bajo licencia BSD 3-Clause y está pensado para experimentación académica con la implementación emparejada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DeiT Base, patch 16) con RoPE mixto aprendido + APE |
| Parametros totales | no disponible (configuración DeiT Base, ~86 M por la arquitectura de referencia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; resolución de entrada no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de visión; no se declaran idiomas) |
| Licencia | BSD 3-Clause (solo sobre `final_checkpoint.pth`) |
| Formato de pesos | PyTorch `.pth` (checkpoint de entrenamiento original, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo DeiT Base con parches de 16x16, configurado según la receta DeiT III, al que se incorpora un esquema de RoPE de frecuencias mixtas con parámetros de frecuencia aprendidos, combinado con embeddings posicionales absolutos (APE). Esta combinación híbrida es la innovación técnica central: en lugar de depender exclusivamente de posiciones absolutas aprendidas o de RoPE fijo, el modelo aprende las frecuencias rotacionales y las mezcla con APE, lo que permite estudiar cómo se codifica la información posicional en el transformer de visión. La implementación de referencia procede de NAVER AI (`rope-vit`), asociada al paper de Heo et al. (ECCV 2024).

El entrenamiento se realizó sobre ImageNet-1k con un seed aleatorio registrado de `2078666210` y una selección de checkpoint `PRIMARY_FINAL` correspondiente a la época 19 de fine-tuning. No se detalla en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de ImageNet-1k, ni si se aplicaron etapas de RLHF/DPO (no aplicables en clasificación supervisada). El checkpoint es un artefacto de entrenamiento original que puede contener estado del optimizador, y se identifica mediante SHA-256 (`f38972d2...e52ba2`) junto con un checksum de un vector de referencia de frecuencias archivado por separado. El modelo forma parte de una familia de seis ejecuciones independientes (índice de ejecución P1).

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k con una precisión top-1 registrada del 83,772 % sobre las 50.000 imágenes de validación.
- Extracción de representaciones visuales mediante el backbone ViT, útil para investigación en embeddings y análisis de atención.
- Estudio de codificaciones posicionales: permite comparar el efecto de RoPE mixto aprendido frente a APE y frente a configuraciones estándar de DeiT.
- Reproducibilidad experimental: checksum identificado, seed registrado y referencia a un archivo de reproducibilidad numérica en Zenodo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo de visión.
- No se declaran capacidades multilingües, de visión-lenguaje, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en codificaciones posicionales: el checkpoint permite reproducir y comparar el efecto de RoPE mixto aprendido + APE frente a variantes estándar de DeiT en ImageNet-1k, usando la implementación `rope-vit` de NAVER como referencia.
- Reproducibilidad académica: al estar identificado por SHA-256 y seed, sirve para replicar experimentos de la familia de seis ejecuciones y validar resultados numéricos frente al archivo de Zenodo.
- Análisis de representaciones internas: el backbone ViT permite extraer mapas de atención y embeddings para estudiar cómo las frecuencias rotacionales aprendidas afectan a la localización espacial.
- Baseline en pipelines de clasificación de imágenes: con un 83,772 % top-1 en ImageNet-1k, puede usarse como referencia de comparación para nuevas variantes de ViT en entornos de investigación.
- Destilación y transferencia: las representaciones del modelo pueden servir como profesor o inicialización en experimentos de transfer learning sobre otros datasets de imágenes.
- Evaluación de robustez: punto de partida para medir degradación frente a distribuciones no vistas, dado que el autor advierte explícitamente que los resultados no establecen robustez.

## Benchmarks y rendimiento

| Benchmark | Dataset | Imágenes | Correctas | Métrica |
|---|---|---:|---:|---:|
| ImageNet-1k validation (top-1) | ILSVRC/imagenet-1k | 50.000 | 41.886 | 83,772 % |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay tablas frente a DeiT III o RoPE-ViT de referencia).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 3,5 GB solo para pesos (1,4 GB de checkpoint, que puede incluir estado del optimizador), más activaciones; se recomienda al menos 8 GB para lotes pequeños.
- GPU recomendadas: cualquier GPU con 8 GB o más para inferencia en fp32; A100 o H100 para entrenamiento y evaluación a gran escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4090, siempre que se cargue con la implementación emparejada y se gestionen las activaciones.
- Opciones de despliegue: no hay integración directa con vLLM, llama.cpp, Ollama o TGI (no es un modelo generativo). Requiere instanciar la implementación RoPE-ViT y cargar el `.pth` manualmente; el autor indica que publicará un ejemplo de carga end-to-end tras validar la configuración de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| djokobandjur/deit-rope-mixed-ape-base-seed-1 (este) | DeiT Base (~86 M, no confirmado) | Imagen, patch 16 | 83,772 % top-1 ImageNet-1k val | BSD 3-Clause (solo pesos) | Checkpoint `.pth` en HF, 0 descargas |
| naver-ai/rope_mixed_ape_deit_base_patch16_LS | DeiT Base patch 16 | Imagen, patch 16 | no disponible en la información | no disponible en la información | Pesos en HF (colección rope-vit) |
| DeiT III Base (referencia upstream) | DeiT Base | Imagen, patch 16 | no disponible en la información | no disponible en la información | Pesos en HF |

## Limitaciones y advertencias

- El checkpoint es un `.pth` de PyTorch basado en pickle: la deserialización de fuentes no confiables puede ejecutar código arbitrario; el propio autor advierte de ello y recomienda modos de carga seguros cuando sea compatible.
- No es un paquete `AutoModel.from_pretrained`: requiere la implementación RoPE-ViT emparejada y la configuración exacta; sin ellas, los pesos no son utilizables directamente.
- Puede contener estado del optimizador y de entrenamiento, lo que aumenta el tamaño del archivo (1,4 GB) y complica la carga en memoria.
- Los resultados de 83,772 % top-1 corresponden exclusivamente a este checkpoint final y no establecen robustez frente a distribuciones no vistas ni a otras tareas.
- La licencia BSD 3-Clause cubre solo `final_checkpoint.pth`; no relicencia el código de NAVER/Meta, los datos de ImageNet ni otro material de terceros.
- Riesgo de sesgo y alucinación: al ser un clasificador de imágenes, no genera texto, pero hereda los sesgos de ImageNet-1k en las 1.000 clases y puede fallar en categorías poco representadas.
- No se declaran idiomas ni capacidades multilingües; no aplica para tareas de lenguaje.
- Sin descargas ni likes registrados y con fecha de creación reciente: no hay validación comunitaria independiente del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-1
- Revisión original de pesos: https://huggingface.co/djokobandjur/deit-rope-mixed-ape-base-seed-1/tree/370ad7739307df39b7dcbabc08f5f4c21e0bde88
- Paper RoPE for Vision Transformer (ECCV 2024): https://arxiv.org/abs/2403.13298
- Código de referencia NAVER AI: https://github.com/naver-ai/rope-vit
- Paper DeiT III: https://arxiv.org/abs/2204.07118
- Modelo de referencia NAVER: https://huggingface.co/naver-ai/rope_mixed_ape_deit_base_patch16_LS
- Colección rope-vit de NAVER: https://huggingface.co/collections/naver-ai/rope-vit
- Archivo de reproducibilidad (Zenodo): https://doi.org/10.5281/zenodo.24055154

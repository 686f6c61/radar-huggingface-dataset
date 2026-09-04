# cubert-gmbh/dinov2

## Resumen

`cubert-gmbh/dinov2` es un espejo (mirror) byte-idéntico del checkpoint preentrenado de DINOv2 ViT-B/14 con registros, publicado originalmente por Facebook Research. El repositorio ha sido creado por Cubert GmbH para servir los pesos desde una ubicación estable y verificable dentro de su ecosistema Cuvis.AI, eliminando la necesidad de que los usuarios descarguen los archivos desde los servidores originales de Facebook o autoricen con su cuenta de Hugging Face.

Se trata de un modelo de visión por computador, concretamente un backbone (codificador) basado en Vision Transformer (ViT) con parches de 14×14 píxeles y tokens de registro adicionales. El archivo distribuido es el checkpoint original `dinov2_vitb14_reg4_pretrain.pth` (346.4 MB), sin ningún tipo de fine-tuning, conversión ni re-serialización. Al ser un modelo de visión, no tiene longitud de contexto ni soporte de lenguaje natural: su función es extraer representaciones visuales de imágenes.

La relevancia de este repositorio radica en su reproducibilidad: los pesos están fijados por commit y verificados por sha256, lo que permite un despliegue offline y sin tokens en pipelines que requieren confianza en la integridad de los artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, patch size 14, con registros (registers) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint original en .pth) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pth (PyTorch, checkpoint original) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer (ViT) de tamaño base con parches de 14×14 píxeles. La variante con registros incorpora tokens adicionales (registers) en la secuencia de entrada, una modificación propuesta por el equipo de DINOv2 para reducir artefactos en los mapas de atención y mejorar la calidad de las representaciones visuales. El checkpoint corresponde al modelo preentrenado de forma autosupervisada mediante el método DINOv2, sin fine-tuning posterior.

En cuanto al entrenamiento, la información disponible en la ficha no detalla la composición del dataset ni el número de tokens o iteraciones. Al tratarse de un mirror del checkpoint oficial, los datos de entrenamiento son los originales de Facebook Research, pero no se especifican en este repositorio. Tampoco se mencionan procesos de RLHF, DPO ni innovaciones adicionales de decodificación, ya que es un modelo de visión sin generación de texto.

## Capacidades

- Extracción de características visuales de alta calidad a partir de imágenes, sirviendo como backbone preentrenado para tareas de visión por computador.
- Generación de embeddings de imagen para clasificación, segmentación, detección de objetos o recuperación visual.
- Uso como codificador en arquitecturas de fine-tuning (por ejemplo, cabezales de clasificación o decodificadores de segmentación).
- Integración nativa con el ecosistema Cuvis.AI, donde se usa como backbone en plugins como `cuvis-ai-dinomaly` para detección de anomalías.
- Despliegue offline y sin tokens gracias a la verificación sha256 de los pesos en el repositorio espejo.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente visual.

## Casos de uso

- Detección de anomalías en imágenes industriales: el modelo se usa como backbone dentro del plugin `cuvis-ai-dinomaly` de Cuvis.AI para identificar defectos o patrones inusuales en superficies o materiales. Su peso reducido y su disponibilidad offline lo hacen adecuado para entornos de producción sin conexión.
- Extracción de embeddings para búsqueda visual inversa: se procesan imágenes de un catálogo para obtener vectores de características y compararlos con consultas de imagen, permitiendo sistemas de recomendación o recuperación visual en bases de datos internas.
- Fine-tuning para clasificación de imágenes en dominios específicos: se inicializa un clasificador lineal o una red multicapa sobre los embeddings del ViT y se ajusta con un dataset propio. Al ser un checkpoint preentrenado de DINOv2, ofrece representaciones transferibles con pocos datos etiquetados.
- Segmentación semántica en imágenes de satélite o aéreas: el modelo actúa como encoder en arquitecturas tipo U-Net o Mask R-CNN. Los tokens de registro ayudan a evitar artefactos en zonas de baja textura, lo que mejora la estabilidad en imágenes naturales y remotas.
- Investigación en representaciones visuales comparativas: se utilizan los embeddings del modelo para estudiar similitudes entre imágenes o para evaluar la calidad de características frente a otros backbones ViT. La reproducibilidad del checkpoint permite repetir experimentos de forma fiable.
- Integración en pipelines de visión dentro de Cuvis.AI para análisis hiperespectral: el modelo se provisiona mediante `download-model download dinov2_vitb14_reg4` y se resuelve desde la caché compartida, lo que simplifica el despliegue en runtime sin credenciales de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un mirror del checkpoint oficial de DINOv2, por lo que el rendimiento esperado es el reportado en el trabajo original de Facebook Research, pero dichos datos no se incluyen en esta ficha. No se aportan métricas de MMLU, HumanEval, GSM8K ni similares, al tratarse de un modelo de visión sin evaluación de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del checkpoint es de 346.4 MB, lo que sugiere que es viable en GPUs de consumo, pero no se especifica un valor oficial.
- GPU recomendadas: no disponible. Al ser un ViT-B, es probable que funcione en GPUs como RTX 3060 o superiores, pero no hay datos confirmados en la ficha.
- Compatibilidad con hardware de consumo: el peso del archivo (~346 MB) indica que el modelo puede cargarse en GPUs con 4-6 GB de VRAM, aunque no se proporciona una cifra exacta.
- Opciones de despliegue: el modelo se usa a través de PyTorch y del sistema de provisionamiento de Cuvis.AI (`download-model`). No se mencionan integraciones con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Al ser un mirror del checkpoint oficial de DINOv2, su comparación con otros backbones de visión (por ejemplo, CLIP ViT-B, MAE ViT-B o DeiT-B) debería basarse en los benchmarks del paper original, que no están incluidos en esta ficha. Por tanto, la comparativa directa se indica como no disponible.

## Limitaciones y advertencias

- Es un repositorio espejo, no un modelo nuevo. Los pesos son exactamente los publicados por Facebook Research, sin modificaciones ni mejoras.
- No se proporcionan datos de entrenamiento, composición del dataset ni métricas de evaluación en la ficha.
- El modelo no tiene capacidades de lenguaje, razonamiento textual ni generación de texto: su uso se limita a tareas de visión.
- La licencia Apache 2.0 permite uso comercial, pero el copyright permanece en los autores originales. Cubert GmbH no reclama derechos sobre los archivos.
- El repositorio está orientado al ecosistema Cuvis.AI; para otros usos, es recomendable obtener el checkpoint desde el repositorio original de Facebook Research.
- No se especifican sesgos conocidos ni riesgos de alucinación, al tratarse de un modelo de visión sin generación de contenido textual.

## Enlaces

- HuggingFace: https://huggingface.co/cubert-gmbh/dinov2
- Repositorio original de DINOv2: https://github.com/facebookresearch/dinov2
- Fuente del checkpoint: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitb14/dinov2_vitb14_reg4_pretrain.pth
- Repositorio de Cuvis.AI: https://github.com/cubert-hyperspectral/cuvis-ai
- Licencia upstream: https://raw.githubusercontent.com/facebookresearch/dinov2/main/LICENSE

# 1aurent/vit_giant_patch14_reg4_224.h-optimus-v0

## Resumen

`1aurent/vit_giant_patch14_reg4_224.h-optimus-v0` es una conversión al formato `timm` de los pesos del modelo H-optimus-0, un backbone de extracción de características de imágenes desarrollado por Bioptimus (empresa francesa centrada en modelos fundacionales para biología y patología computacional). El modelo original está publicado en Hugging Face bajo el identificador `bioptimus/H-optimus-0` en un repositorio con acceso restringido (gated); esta versión de 1aurent empaqueta los mismos pesos en un formato directamente consumible con `timm.create_model` sin necesidad de solicitar acceso.

Arquitectónicamente es un Vision Transformer de tipo "giant" con 1.134.774.272 parámetros, parches de 14x14 píxeles, resolución de entrada de 224x224 y 4 tokens de registro (registers). Incorpora la innovación de los register tokens introducida por Darcet et al. (2023), que mitiga artefactos de atención en modelos ViT y mejora la calidad de los descriptores globales. El modelo está pensado como extractor de features, no como clasificador final: produce un vector de embedding por imagen.

Su relevancia actual radica en que ofrece un backbone de gran tamaño (1.13B parámetros) para tareas de representación visual, especialmente en dominios biomédicos como histopatología, donde H-optimus-0 ha sido entrenado y evaluado. La licencia Apache 2.0 facilita su uso comercial e integración en pipelines de investigación, algo poco habitual en modelos fundacionales de patología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con 4 register tokens |
| Parametros totales | 1.134.774.272 (1.13B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224x224x3, patch 14x14) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `timm`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer estándar de escala "giant" con parches de 14x14, resolución de 224x224 y 4 tokens de registro. Los register tokens son tokens adicionales aprendidos que se concatenan a la secuencia de parches y permiten al modelo "aparcar" información global sin contaminar los tokens de parche, lo que produce representaciones más limpias y mejores mapas de atención. El backbone está diseñado para extracción de features: la salida es un vector de dimensión fija por imagen, obtenido típicamente mediante pooling del token CLS o de la media de tokens.

Los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO, técnicas de aumento de datos o estrategias de preentrenamiento) no están documentados en la información disponible. La model card original de Bioptimus indica que H-optimus-0 se ha entrenado sobre datos de patología, pero esta conversión de 1aurent no reproduce esa información. No se dispone de datos sobre la innovación en decodificación especulativa ni atención lineal, ya que no aplican a este tipo de modelo.

## Capacidades

- Extracción de embeddings de imágenes: genera un vector de características por imagen de 224x224, útil como entrada para clasificadores lineales, clustering o recuperación por similitud.
- Clasificación de imágenes mediante probing: al ser un backbone, permite entrenar cabezas de clasificación sobre los embeddings congelados.
- Procesamiento de imágenes biomédicas: el modelo original está orientado a histopatología, por lo que sus representaciones son especialmente adecuadas para ese dominio.
- Compatibilidad con `timm`: se carga con `timm.create_model` y las transformaciones estándar de `timm.data`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión-a-texto ni audio.

## Casos de uso

- **Clasificación de imágenes histopatológicas**: usar los embeddings del backbone como entrada a un clasificador lineal o MLP para detectar tejido tumoral, subtipos de cáncer o grados histológicos. El tamaño giant y el entrenamiento en dominio biomédico lo hacen adecuado para este escenario.
- **Recuperación de imágenes por similitud**: indexar embeddings de un corpus de imágenes médicas y realizar búsquedas por vecino más cercano para encontrar casos similares en un archivo clínico.
- **Clustering no supervisado de parches o imágenes**: agrupar imágenes o regiones de tejido según sus representaciones para descubrir patrones morfológicos sin etiquetas.
- **Preentrenamiento de cabezas de detección o segmentación**: congelar el backbone y entrenar cabezas ligeras para tareas de segmentación de núcleos o detección de estructuras en imágenes de microscopía.
- **Extracción de features para pipelines de visión artificial general**: usar el modelo como extractor en sistemas de búsqueda visual, recomendación o control de calidad industrial donde se requiera un descriptor robusto de 1.13B parámetros.
- **Investigación en representaciones visuales**: comparar los embeddings de H-optimus-0 con otros backbones (DINOv2, CLIP, SigLIP) en tareas de transferencia y evaluar el efecto de los register tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en FP16**: aproximadamente 2.3 GB solo para pesos (1.13B parámetros x 2 bytes), más activaciones y memoria de trabajo; en la práctica se recomienda al menos 4-6 GB de VRAM para lotes pequeños a 224x224.
- **VRAM estimada en FP32**: aproximadamente 4.5 GB solo para pesos; se recomienda 8 GB o más.
- **GPU recomendadas**: A100, H100, L40S para inferencia por lotes a gran escala; RTX 4090, RTX 3090, RTX A6000 para uso individual.
- **¿Cabe en GPU consumer?**: sí, en GPUs con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs con 4-6 GB puede requerir FP16 y lotes pequeños.
- **Opciones de despliegue**: `timm` (nativo), PyTorch, ONNX Runtime (previa exportación), TorchScript. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `1aurent/vit_giant_patch14_reg4_224.h-optimus-v0` | 1.13B | 224x224, patch 14 | Apache 2.0 | Hugging Face (público) |
| `bioptimus/H-optimus-0` (original) | 1.13B (mismos pesos) | 224x224, patch 14 | Apache 2.0 (según model card) | Hugging Face (gated) |
| DINOv2 ViT-g/14 | ~1.1B | 224x224, patch 14 | Apache 2.0 | Hugging Face / GitHub |
| ViT-L/14 (CLIP) | ~304M | 224x224, patch 14 | MIT (según variante) | Hugging Face |

La comparación con DINOv2 y CLIP es orientativa: no se dispone de resultados de benchmarks en la información proporcionada para establecer diferencias de rendimiento cuantitativas. La principal ventaja de esta ficha frente al modelo original es la ausencia de gating y la integración directa con `timm`.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados en la información disponible; al ser un modelo entrenado en dominios biomédicos, puede presentar sesgos hacia ese tipo de imágenes y degradar su rendimiento en imágenes naturales o de otros dominios.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero los embeddings pueden producir representaciones poco fiables en dominios fuera de distribución.
- **Limitaciones de contexto o idioma**: no procesa texto ni lenguaje; la entrada está limitada a imágenes de 224x224 con parches de 14x14.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y la atribución. Verificar la licencia del modelo original (`bioptimus/H-optimus-0`) por si hubiera condiciones adicionales no reflejadas en esta conversión.
- **Caveats para producción**: esta es una conversión no oficial de los pesos originales; no hay garantía de equivalencia exacta con el modelo de Bioptimus. El repositorio original está gated y el enlace S3 público devuelve 403, por lo que la trazabilidad de los pesos depende de esta conversión. No se documentan procesos de validación ni tests de regresión.

## Enlaces

- [Hugging Face: 1aurent/vit_giant_patch14_reg4_224.h-optimus-v0](https://huggingface.co/1aurent/vit_giant_patch14_reg4_224.h-optimus-v0)
- [Modelo original: bioptimus/H-optimus-0](https://huggingface.co/bioptimus/H-optimus-0)
- [Repositorio de releases de Bioptimus](https://github.com/bioptimus/releases/tree/main/models/h-optimus/v0)
- [Paper de register tokens (Darcet et al., 2023)](https://arxiv.org/abs/2309.16588)
- [Documentación de timm](https://github.com/huggingface/pytorch-image-models)

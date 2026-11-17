# R2Squared/KERAFound-DINOv3-Placido

## Resumen

KERAFound-DINOv3-Placido es un modelo fundacional de visión especializado en oftalmología, concretamente en el segmento anterior del ojo y la córnea. Lo desarrolla el usuario R2Squared y se distribuye a través de Hugging Face bajo una licencia específica de DINOv3. El modelo parte de la arquitectura DINOv3 en su variante ViT-Large y se ha adaptado mediante ajuste fino al dominio de imágenes oftalmológicas, con especial atención a la córnea sana o plácida (de ahí el sufijo "Placido", probablemente en referencia a la topografía de disco de Placido usada en queratoscopia).

Con 303.154.192 parámetros, se posiciona como un extractor de características de tamaño grande, adecuado para tareas de representación visual en lugar de generación. Su pipeline declarado es `image-feature-extraction`, lo que indica que su uso previsto es producir embeddings útiles para clasificación, segmentación, recuperación o diagnóstico asistido, no para generar texto ni imágenes.

El modelo es relevante porque los modelos fundacionales de visión de dominio médico siguen siendo escasos, y este se orienta a un subdominio muy concreto (córnea y segmento anterior) donde las representaciones genéricas tipo ImageNet o DINOv2/DINOv3 sin ajuste suelen rendir por debajo de lo deseable. El acceso está restringido (gated) y el repositorio ocupa 1,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer Large (ViT-L) basado en DINOv3 |
| Parametros totales | 303.154.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | dinov3-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tamaño Large (ViT-L) derivado de DINOv3, el marco de aprendizaje autosupervisado de Meta para representaciones visuales densas. DINOv3 combina destilación de un profesor con auto-supervisión y produce características robustas tanto a nivel global como por parche, lo que lo hace adecuado para tareas densas (segmentación, detección) además de clasificación. El modelo aquí presentado conserva esa base y añade un ajuste de dominio sobre imágenes oftalmológicas del segmento anterior y la córnea.

No se dispone de información pública sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens vistos ni si se aplicaron etapas de ajuste supervisado, RLHF o DPO (no aplicables en un modelo de visión). Tampoco se detalla si el ajuste fue completo o mediante LoRA/adapters, ni si se emplearon aumentos específicos de dominio (iluminación de lámpara de hendidura, topografía, tomografía de coherencia óptica, etc.). Toda esta información debe considerarse no disponible a partir de los datos proporcionados.

## Capacidades

- Extracción de características visuales (embeddings) de imágenes del segmento anterior del ojo y córnea.
- Representaciones densas por parche, útiles para segmentación y localización de estructuras.
- Representaciones globales para clasificación y recuperación por similitud.
- Ajuste específico al dominio oftalmológico "plácido", probablemente orientado a imágenes de topografía corneal o superficies sanas.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión-a-texto, audio ni generación.

## Casos de uso

- Detección y clasificación de queratocono: usar los embeddings globales del modelo como entrada a un clasificador lineal o MLP entrenado con etiquetas clínicas; el ajuste de dominio a córnea plácida permite separar mejor morfologías sanas de patológicas que un DINOv3 genérico.
- Segmentación de la superficie corneal en imágenes de topografía de disco de Placido: aprovechar las características densas por parche para alimentar cabezas de segmentación (U-Net, SegFormer) y delimitar el área corneal y los anillos proyectados.
- Recuperación de casos similares en bases de datos clínicas: indexar embeddings y hacer búsqueda por similitud coseno para localizar pacientes con patrones topográficos parecidos, útil en revisión de casos y docencia.
- Control de calidad de capturas: entrenar un clasificador binario que descarte imágenes desenfocadas, mal centradas o con artefactos, usando el modelo como extractor congelado y una cabeza ligera encima.
- Preentrenamiento para tareas downstream en segmento anterior: inicializar un backbone ViT-L con estos pesos en lugar de DINOv3 genérico, reduciendo el número de imágenes etiquetadas necesarias para tareas como detección de úlceras, pterigión o degeneraciones.
- Investigación en representaciones oftalmológicas: servir como baseline de dominio para comparar con DINOv2, DINOv3 sin ajuste o modelos médicos como RETFound (retina) en estudios de transferencia al segmento anterior.
- Análisis de series temporales de topografía: extraer embeddings de cada captura de un seguimiento y modelar la evolución con un modelo secuencial ligero para detectar progresión subclínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos, más activaciones; en la práctica 2-3 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: aproximadamente 0,7 GB para pesos; 1,5-2 GB con activaciones para lotes moderados.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para procesamiento por lotes a escala; cualquier GPU con al menos 4 GB para inferencia puntual.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 y similares; incluso en GPUs de 8 GB con lotes pequeños.
- Opciones de despliegue: PyTorch nativo (carga con `transformers` o `timm` según compatibilidad), exportación a ONNX Runtime o TensorRT para producción; vLLM y TGI no aplican (no es un modelo generativo de lenguaje); llama.cpp y Ollama tampoco.
- Latencia y throughput: no disponibles en la información proporcionada; para un ViT-L a 224x224 en FP16 sobre RTX 4090 se puede esperar del orden de centenares de imágenes por segundo, pero no hay medición oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KERAFound-DINOv3-Placido | 303 M | no disponible | Córnea / segmento anterior | dinov3-license (gated) | Hugging Face, acceso restringido |
| DINOv3 ViT-L (base) | ~300 M | no disponible | Visión general | dinov3-license | Hugging Face (Meta) |
| DINOv2 ViT-L | ~300 M | no disponible | Visión general | Apache 2.0 | Hugging Face (Meta) |
| RETFound | ~300 M (ViT-L) | no disponible | Retina (fondo de ojo) | CC BY-NC 4.0 | GitHub / Hugging Face |

La comparación con DINOv3 ViT-L es directa porque este modelo deriva de él; la diferencia esperada está en el ajuste de dominio, no en la arquitectura. Frente a DINOv2 ViT-L, la licencia es más restrictiva (dinov3-license frente a Apache 2.0). Frente a RETFound, el dominio es distinto (segmento anterior frente a retina) y la licencia también difiere. No se dispone de métricas comparativas publicadas para cuantificar la mejora de dominio.

## Limitaciones y advertencias

- Modelo de visión: no procesa texto ni mantiene conversaciones; cualquier expectativa de uso tipo LLM es incorrecta.
- Sesgos potenciales derivados del dataset de ajuste: si las imágenes provienen de una única población, dispositivo o protocolo de captura, el modelo puede generalizar mal a otras clínicas.
- Riesgo de sobreajuste al subdominio "plácido": puede rendir peor en imágenes de segmento anterior no relacionadas con topografía corneal.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos/negativos en clasificación downstream si no se valida con datos externos.
- Licencia `dinov3-license`: debe revisarse antes de uso comercial; el acceso es gated y requiere aceptar condiciones en Hugging Face.
- Sin información pública sobre el dataset de entrenamiento, no se puede auditar la representatividad ni los posibles sesgos demográficos.
- No hay benchmarks publicados, por lo que su rendimiento real frente a alternativas es desconocido.
- Uso clínico: no debe emplearse como dispositivo médico sin validación regulatoria; es una herramienta de investigación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/R2Squared/KERAFound-DINOv3-Placido
- DINOv3 (Meta AI): https://github.com/facebookresearch/dinov3
- DINOv3 paper: https://arxiv.org/abs/2508.10104
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md

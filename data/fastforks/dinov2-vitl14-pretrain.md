# fastforks/dinov2-vitl14-pretrain

## Resumen

DINOv2 ViT-L/14 es un backbone de visión por computador desarrollado por Meta AI Research (FAIR) y publicado en el artículo *DINOv2: Learning Robust Visual Features without Supervision* (TMLR 2024). Se trata de un transformer de visión (ViT) de tipo L/14, es decir, variante Large con parches de 14x14 píxeles, entrenado con aprendizaje autosupervisado (sin etiquetas) para producir representaciones visuales genéricas y robustas, utilizables como extractor de características en tareas downstream de clasificación, segmentación, detección o correspondencia de puntos.

El repositorio `fastforks/dinov2-vitl14-pretrain` no es un modelo nuevo ni un reentrenamiento: es un espejo byte a byte del checkpoint original de Meta (`dinov2_vitl14_pretrain.pth`, 1.217.586.395 bytes, SHA-256 `d5383ea8f4877b2472eb973e0fd72d557c7da5d3611bd527ceeb1d7162cbf428`), alojado por los mantenedores de fastforks como respaldo cuando la URL original de FAIR falla. El repositorio se nombra por los pesos, no por un modelo, y sirve de referencia para todos los modelos de fastforks que consumen exactamente esos bytes.

Su relevancia es doble: por un lado, DINOv2 es un estándar de facto en visión autosupervisada y la variante ViT-L/14 ofrece un equilibrio entre calidad de representación y coste computacional; por otro, este repositorio documenta de forma ejemplar la trazabilidad de pesos (hash, origen, licencia), algo poco habitual en espejos de modelos. El contexto de uso habitual es como extractor congelado de embeddings o como inicialización para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) L/14, autosupervisado (DINOv2) |
| Parametros totales | no disponible (el tamaño del checkpoint es 1.217.586.395 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada por imagen) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en punto flotante `.pth`) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pth` (`dinov2_vitl14_pretrain.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DINOv2: un Vision Transformer con parches de 14x14 píxeles y atención global estándar, entrenado con una combinación de objetivos autosupervisados (DINO y iBOT) junto con regularizaciones como KoLeo y centrado de características. El entrenamiento se realiza sobre un corpus de imágenes a gran escala curado automáticamente (LVD-142M en el artículo original), sin anotaciones humanas. Los detalles exactos de hiperparámetros, número de tokens vistos y composición del dataset no se recogen en la información disponible de este repositorio; deben consultarse en el artículo de TMLR 2024 y el repositorio oficial de FAIR.

Este repositorio concreto no contiene código de entrenamiento ni configuración: solo el checkpoint preentrenado, sin conversión, sin reentrenamiento y sin cambios respecto al original. Cualquier innovación técnica (atención linear, decodificación especulativa, etc.) no aplica aquí; el valor del repositorio reside en la verificación criptográfica del archivo y en la documentación del origen.

## Capacidades

- Extracción de características visuales genéricas: produce embeddings densos por parche y un vector global por imagen, útiles como entrada a clasificadores lineales, segmentadores o sistemas de recuperación.
- Transferencia a tareas downstream: clasificación de imágenes, segmentación semántica e instancias, detección de objetos, estimación de profundidad y correspondencia de puntos (matching) mediante fine-tuning o cabezas ligeras.
- Correspondencia visual y registro: los descriptores densos permiten emparejar puntos entre imágenes, base de pipelines de reconstrucción 3D o seguimiento.
- Base para modelos derivados: el repositorio declara que alimenta a `dedode-v2-g@1`, `dinov2-vitl14@1`, `dinov2-l-linear-ade20k@1` y `romav1@1`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un backbone visual.
- No incluye modo "thinking", visión generativa, audio ni ninguna capacidad multimodal de salida.

## Casos de uso

- Clasificación de imágenes con cabezas lineales: congelar el backbone y entrenar una regresión logística sobre los embeddings globales; es el flujo estándar de DINOv2 y requiere muy pocos datos etiquetados.
- Segmentación semántica: usar los mapas de características por parche como entrada a un decodificador ligero (por ejemplo, una cabeza lineal tipo ADE20K), tal como hace el modelo derivado `dinov2-l-linear-ade20k@1`.
- Recuperación de imágenes (image retrieval): indexar los embeddings globales en una base vectorial para búsqueda por similitud en catálogos, archivos o sistemas de moderación visual.
- Correspondencia de puntos y registro de imágenes: alimentar pipelines de Structure-from-Motion, odometría visual o alineación de imágenes médicas o satelitales con los descriptores densos.
- Preprocesado para modelos generativos: servir como codificador visual en arquitecturas que necesitan una representación robusta de la imagen de entrada (por ejemplo, sistemas de edición guiada o control visual).
- Detección de anomalías visuales: comparar embeddings de imágenes de referencia frente a nuevas capturas en inspección industrial o control de calidad.
- Análisis de imágenes satelitales o médicas: usar el backbone como extractor congelado en dominios con pocas etiquetas, aprovechando la robustez del preentrenamiento autosupervisado.
- Reproducibilidad y auditoría: usar el espejo verificado por SHA-256 para garantizar que un pipeline de producción carga exactamente los mismos pesos que el original de FAIR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un espejo de pesos y no incluye métricas propias; para cifras de rendimiento (por ejemplo, en ImageNet, ADE20K o tareas de matching) debe consultarse el artículo original de DINOv2 (Oquab et al., TMLR 2024) y el repositorio oficial de FAIR.

## Requisitos de hardware

- El checkpoint ocupa 1,13 GiB en punto flotante de 32 bits; en memoria de inferencia, un ViT-L/14 necesita aproximadamente 1,2 GB de VRAM solo para los pesos, más activaciones que dependen de la resolución de entrada.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia a resolución moderada (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o fine-tuning completo se recomienda A100, H100 o GPUs de 24 GB o más.
- Cabe en GPUs de consumo: sí, en tarjetas con 6 GB o más para inferencia; el fine-tuning completo requiere más memoria.
- Opciones de despliegue: PyTorch nativo (carga directa del `.pth`), exportación a ONNX o TorchScript para servir con ONNX Runtime, Triton Inference Server o TensorRT. No hay pesos GGUF ni versiones para llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la GPU, la resolución de entrada y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv2 ViT-L/14 (este repo) | no disponible (checkpoint 1,13 GiB) | imagen, parches 14x14 | Apache-2.0 | espejo verificado en HF; original en FAIR |
| DINOv2 ViT-S/14 | no disponible | imagen, parches 14x14 | Apache-2.0 | original en FAIR |
| DINOv2 ViT-B/14 | no disponible | imagen, parches 14x14 | Apache-2.0 | original en FAIR |
| CLIP ViT-L/14 | no disponible | imagen + texto | licencia de OpenAI (no Apache-2.0) | pesos públicos de OpenAI |

La comparación con otras variantes de DINOv2 se justifica porque comparten arquitectura y licencia; la elección entre S, B y L depende del equilibrio entre coste y calidad. Frente a CLIP, la diferencia clave es que DINOv2 no está alineado con texto y su licencia Apache-2.0 es más permisiva para uso comercial. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni lingüístico: no responde a prompts de texto ni mantiene conversaciones; cualquier expectativa de ese tipo es un error de uso.
- No hay datos de sesgo publicados en este repositorio; los sesgos del preentrenamiento dependen del corpus LVD-142M de Meta y deben evaluarse en el artículo original.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de representaciones erróneas en dominios muy alejados de la distribución de entrenamiento (por ejemplo, imágenes médicas o de sensores no ópticos).
- El repositorio es un espejo no oficial: los mantenedores de fastforks no están afiliados a Meta AI; la garantía de integridad se basa en el SHA-256 documentado, no en una firma del autor original.
- Aunque la licencia es Apache-2.0, conviene verificar el texto de la licencia upstream incluido en el repositorio antes de un uso comercial, y citar a los autores originales.
- El archivo está en formato `.pth` de PyTorch; cargarlo requiere `torch.load` con las precauciones habituales (pesos no confiables pueden ejecutar código en versiones antiguas de PyTorch; usar `weights_only=True` cuando sea posible).
- No se ofrecen versiones cuantizadas, GGUF ni ONNX en este repositorio; quien las necesite debe convertirlas por su cuenta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/dinov2-vitl14-pretrain
- Repositorio oficial de DINOv2 (FAIR): https://github.com/facebookresearch/dinov2
- Commit de referencia upstream: https://github.com/facebookresearch/dinov2/tree/7764ea0f912e53c92e82eb78a2a1631e92725fc8
- Archivo original de pesos: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_pretrain.pth
- Licencia upstream: https://github.com/facebookresearch/dinov2/blob/7764ea0f912e53c92e82eb78a2a1631e92725fc8/LICENSE
- Proyecto fastforks: https://github.com/kleinicke/fastforks
- Artículo: Oquab et al., *DINOv2: Learning Robust Visual Features without Supervision*, TMLR 2024 (referencia citada en la model card; no se proporciona URL directa en la información disponible).

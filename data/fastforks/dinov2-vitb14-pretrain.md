# fastforks/dinov2-vitb14-pretrain

## Resumen

Este repositorio aloja una copia byte a byte de los pesos del backbone DINOv2 ViT-B/14, desarrollados originalmente por Meta AI Research (FAIR) y publicados en el articulo "DINOv2: Learning Robust Visual Features without Supervision" (Oquab et al., TMLR 2024). El modelo es un Vision Transformer de 12 capas con parche de 14x14 y aproximadamente 86 millones de parametros, entrenado mediante aprendizaje autosupervisado (autodestilacion con profesor congelado y perdida tipo iBOT/DINO) sobre un corpus curado de imagenes (LVD-142M). El resultado es un extractor de caracteristicas visuales de proposito general que funciona como backbone congelado en tareas downstream.

El repositorio `fastforks/dinov2-vitb14-pretrain` no es un modelo nuevo ni un fine-tune: es un espejo de infraestructura gestionado por el proyecto fastforks para servir de fallback cuando la URL original de Meta (`dl.fbaipublicfiles.com`) falla. El archivo se verifica por SHA-256 antes de cargarse, garantizando integridad. Cualquier modelo de fastforks que use exactamente estos bytes (mismo hash) apunta a este repositorio.

Su relevancia practica radica en que DINOv2 es uno de los backbones visuales autosupervisados mas utilizados como base para clasificacion, segmentacion, deteccion y recuperacion de imagenes, y este espejo ofrece una fuente estable y verificable de los pesos originales bajo licencia Apache-2.0. No es un modelo generativo ni multimodal texto-imagen: es exclusivamente un codificador visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/14), 12 capas, patch size 14, hidden dim 768 |
| Parametros totales | aproximadamente 86 millones (backbone ViT-B/14) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; resolucion de entrada tipica 518x518 en DINOv2, aunque no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pth`, sin variantes GGUF/ONNX en este repo) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 (licencia de los autores originales, Meta AI Research) |
| Formato de pesos | PyTorch `.pth` (`dinov2_vitb14_pretrain.pth`, 330.3 MiB / 346378731 bytes, SHA-256 `0b8b82f85de91b424aded121c7e1dcc2b7bc6d0adeea651bf73a13307fad8c73`) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estandar de tipo ViT-B/14: divide la imagen en parches de 14x14 pixeles, los proyecta linealmente y procesa la secuencia resultante con 12 bloques de atencion multi-cabeza y MLP, con hidden dimension 768. No incorpora mecanismos de attention lineal, SSM ni componentes hibridos. La innovacion de DINOv2 no reside en el bloque transformer sino en el regimen de entrenamiento.

El entrenamiento es autosupervisado, sin etiquetas: combina una perdida DINO (autodestilacion entre vistas aumentadas con profesor congelado) con una perdida tipo iBOT (prediccion de tokens enmascarados), sobre un dataset curado de aproximadamente 142 millones de imagenes (LVD-142M). No se emplea RLHF ni DPO, al no tratarse de un modelo generativo. El resultado son embeddings visuales densos y transferibles, con propiedades emergentes de segmentacion semantica sin supervision explicita. En este repositorio los pesos son identicos al archivo original de Meta: no hay reentrenamiento, conversion ni modificacion.

## Capacidades

- Extraccion de caracteristicas visuales densas y globales a partir de imagenes.
- Generacion de embeddings de imagen para recuperacion (image retrieval) y similitud semantica.
- Base congelada para clasificacion lineal (linear probing) sobre caracteristicas visuales.
- Base para segmentacion semantica, incluida segmentacion sin supervision explicita (propiedades emergentes de DINOv2).
- Base para tareas de profundidad y correspondencia densa en el ecosistema DINOv2.
- No soporta tool calling ni function calling (no es un modelo linguistico).
- No soporta agentes ni razonamiento multi-paso textual.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision-language, audio ni generacion de texto.

## Casos de uso

- Recuperacion de imagenes por similitud: usar los embeddings globales del backbone como indice vectorial para buscar imagenes visualmente parecidas en un catalogo, aprovechando la robustez de las caracteristicas autosupervisadas frente a variaciones de iluminacion y encuadre.
- Clasificacion de imagenes con linear probing: congelar el backbone y entrenar solo una capa lineal sobre los features para clasificar productos, documentos o imagenes medicas con pocos datos etiquetados.
- Segmentacion semantica en pipelines de vision: servir como encoder congelado en un decoder tipo linear head (por ejemplo, la variante `dinov2-b-linear-ade20k` referenciada en la model card) para segmentar escenas en ADE20K o dominios propios.
- Deteccion y seguimiento de objetos en video: extraer features por frame para alimentar cabezas de deteccion o para correspondencia densa entre frames, gracias a la estabilidad de los descriptores DINOv2.
- Deduplicacion y control de calidad de datasets visuales: calcular embeddings y agrupar imagenes casi duplicadas antes de entrenar otros modelos, reduciendo contaminacion del corpus.
- Base para modelos de profundidad y 3D: integrar el backbone como encoder en pipelines de estimacion de profundidad monoculo o reconstruccion, reutilizando los pesos originales verificados por SHA-256.
- Verificacion de integridad en produccion: usar el repositorio como fuente fallback con hash fijo para garantizar que los pesos cargados en inferencia son exactamente los de Meta, evitando artefactos alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas (lineal probing, segmentacion, recuperacion) y el articulo original de DINOv2 no se proporciona en la informacion suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.4-0.6 GB en FP32 para el backbone ViT-B/14 (86M parametros, ~330 MiB de pesos); menos de 0.3 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobradas para el backbone. En A100/H100 el cuello de botella sera el preprocesado y el batch, no la memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas (GTX 1650 en adelante), e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo (carga del `.pth`), TorchScript/ONNX tras conversion manual (no se distribuyen en este repo), y frameworks de vision como `timm` o el codigo oficial de `facebookresearch/dinov2`. No hay variantes GGUF, por lo que llama.cpp u Ollama no aplican.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| DINOv2 ViT-B/14 (este repo) | ~86 M | no disponible (resolucion tipica 518x518) | Apache-2.0 | Pesos `.pth` en este espejo |
| DINOv2 ViT-S/14 | ~22 M | no disponible | Apache-2.0 | Pesos oficiales de Meta |
| DINOv2 ViT-L/14 | ~300 M | no disponible | Apache-2.0 | Pesos oficiales de Meta |
| CLIP ViT-B/16 | ~86 M | no disponible | MIT (segun publicacion original) | Pesos en OpenAI/Hugging Face |

La comparativa se limita a variantes de la misma familia y a CLIP como backbone visual alternativo; no se dispone de datos de rendimiento comparativo en la informacion proporcionada. DINOv2 se distingue por ser puramente visual (sin alineacion texto-imagen) y por sus propiedades de segmentacion emergente.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde a prompts y no puede usarse como chatbot ni como modelo de lenguaje.
- No procesa texto ni audio; su unico modalidad de entrada es imagen.
- Sesgos conocidos: los sesgos del corpus LVD-142M (composicion, demografia, dominios sobrerrepresentados) se transfieren a los embeddings; no se detallan en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero los features pueden producir correspondencias erroneas en dominios fuera de distribucion (imagenes medicas, satelitales especializadas, etc.).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la licencia y el copyright permanecen con Meta AI Research; este repositorio es un espejo no afiliado a los autores.
- El repositorio no ofrece variantes cuantizadas ni formatos alternativos; para produccion en edge o movil habra que convertir manualmente.
- La resolucion de entrada y el preprocesado no se especifican en la model card; hay que consultar el codigo oficial de DINOv2.
- El SHA-256 debe verificarse antes de cargar los pesos; la model card indica que fastforks lo comprueba automaticamente, pero otros consumidores deben hacerlo por su cuenta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/dinov2-vitb14-pretrain
- Codigo oficial DINOv2 (commit referenciado): https://github.com/facebookresearch/dinov2/tree/7764ea0f912e53c92e82eb78a2a1631e92725fc8
- Archivo original de pesos: https://dl.fbaipublicfiles.com/dinov2/dinov2_vitb14/dinov2_vitb14_pretrain.pth
- Licencia Apache-2.0 upstream: https://github.com/facebookresearch/dinov2/blob/7764ea0f912e53c92e82eb78a2a1631e92725fc8/LICENSE
- Proyecto fastforks: https://github.com/kleinicke/fastforks
- Articulo DINOv2 (Oquab et al., TMLR 2024): no disponible como enlace en la informacion proporcionada

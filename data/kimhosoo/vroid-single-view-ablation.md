# kimhosoo/vroid-single-view-ablation

## Resumen

vroid-single-view-ablation es un checkpoint de generación de vídeo egocéntrico publicado por el usuario kimhosoo como ablación del modelo multivista Cosmos-Predict2.5 2B de NVIDIA. Parte del checkpoint base nvidia/Cosmos-Predict2.5-2B y se ha afinado sobre el dataset sintético dhyun22/ego_gen_vroid_single, compuesto por avatares VRoid e interacciones entre dos personas renderizadas en escenas sintéticas. La modificación concreta es que genera cada vista ego de forma totalmente independiente (V=1), en lugar de generar las dos vistas ego de manera conjunta como hace el modelo base.

El checkpoint existe como contraparte sintética de kimhosoo/comind-single-view-ablation, que aplica exactamente la misma ablación sobre el dataset real CoMind. Ambos comparten arquitectura, receta de entrenamiento y checkpoint base, y solo difieren en la fuente de datos, de modo que permiten una comparación directa real-frente-a-sintético en generación de vídeo egocéntrico multivista.

Con unos 2.000 millones de parámetros heredados del modelo base, el checkpoint se distribuye en bfloat16 (pesos EMA) bajo licencia Apache 2.0. No se publican resultados de benchmarks ni cuantizaciones alternativas, y el repositorio está orientado a investigación y reproducción experimental más que a despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión generativa de vídeo (rectified flow) derivado de Cosmos-Predict2.5 multivista; encoder de texto Cosmos-Reason1-7B (arquitectura Qwen2.5-VL-7B) |
| Parámetros totales | ~2B (heredados del checkpoint base nvidia/Cosmos-Predict2.5-2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de generación de vídeo; el condicionamiento textual lo aporta Cosmos-Reason1-7B) |
| Tipos de cuantización | bfloat16 (pesos EMA); no se publican cuantizaciones GGUF, INT8 ni INT4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`; fichero `model_ema_bf16.pt`), sin safetensors |
| Modelo base | nvidia/Cosmos-Predict2.5-2B (`auto/multiview/524af350-...-_ema_bf16.pt`, `strict_resume=False`) |
| Dataset de ajuste | dhyun22/ego_gen_vroid_single (~8.168 muestras de train / 1.144 de validación, V=1 independientes, split disjunto por identidad de avatar) |
| Iteraciones de entrenamiento | 12.000 (checkpoint final `iter_000012000`) |
| Tamaño del repositorio | 4,1 GB |

## Arquitectura y entrenamiento

El modelo base, Cosmos-Predict2.5 multivista, genera dos vistas ego de forma conjunta: las vistas líder y ayudante se atienden mutuamente mediante self-attention sobre sus tokens y cross-attention sobre sus descripciones, condicionadas por fotogramas de referencia, rayos de Plücker entre vistas y contexto compartido de warp y pose. Esta ablación rompe ese acoplamiento y genera cada vista ego de manera independiente (V=1) mediante cinco cambios: eliminación de los fotogramas de referencia (se suprime el condicionamiento de apariencia, pose y cámara en contexto); warp limitado a la vista propia, recalculado por completo con `warp_mode=own_only_recomputed` en lugar de simplemente enmascarado; pose restringida al esqueleto del propio portador; rayos de Plücker canonicalizados al frame-0 de cada vista (`w2c[0] = I`); y pooling V=1, donde las vistas `..._ego_a` y `..._ego_b` se tratan como muestras de entrenamiento independientes en lugar de concatenarse en un único forward V=2. Como consecuencia estructural, la self-attention no puede ver los tokens de la otra vista y la cross-attention solo accede a la descripción de esa vista.

El ajuste se realizó sobre `dhyun22/ego_gen_vroid_single`, un dataset sintético de avatares VRoid con interacciones entre dos personas. El captioning combina de forma estocástica un 70% de descripciones de acción reales por clip (`detail_all.csv.bak`) y un 30% de una descripción genérica fija, siguiendo la convención `caption_probability` del código base. El entrenamiento usó 2 GPU NVIDIA H200 con FSDP de tamaño de shard 2, una única ejecución continua de 12.000 iteraciones, checkpoints cada 500 iteraciones y una pérdida de rectified flow de ~0,058 en la iteración final (comparable al ~0,057 de la ejecución equivalente sobre CoMind). El encoder de texto es `nvidia/Cosmos-Reason1-7B`.

## Capacidades

- Generación de vídeo egocéntrico de una única vista (V=1), condicionada por texto.
- Condicionamiento por pose del propio portador (esqueleto propio renderizado en la condición de pose).
- Condicionamiento por warp de la vista propia, recalculado desde fotogramas pasados del propio portador.
- Condicionamiento por cámara canonicalizada por vista mediante rayos de Plücker en el frame-0 de cada vista.
- Generación de interacciones entre dos personas en escenas sintéticas, con cada vista tratada como muestra independiente.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se documentan capacidades multilingües ni modo de razonamiento explícito.
- Pensado para experimentación comparativa (ablación), no como capacidad de producto.

## Casos de uso

- Comparación controlada real frente a sintético: al compartir arquitectura, receta y checkpoint base con `kimhosoo/comind-single-view-ablation`, permite aislar el efecto de entrenar con datos sintéticos (VRoid) frente a datos reales (CoMind) sobre la misma ablación.
- Estudio de ablación de pooling V=1 frente a V=2: sirve para medir qué información aporta realmente el acoplamiento entre vistas en el modelo multivista base, al eliminar la self-attention cruzada y la concatenación en un único forward.
- Evaluación de brecha de dominio: al generar sobre entradas reales, permite cuantificar la degradación atribuible a entrenar exclusivamente con avatares VRoid y escenas sintéticas.
- Generación de datos sintéticos egocéntricos: las muestras generadas pueden usarse para aumentar datasets de investigación en percepción egocéntrica, siempre con validación de su realismo.
- Prototipado de simulación de interacciones sociales en realidad virtual: útil para generar secuencias de dos personas en escenas sintéticas antes de invertir en captura real.
- Investigación de condicionamiento de cámara y pose: la canonicalización por vista y el warp propio permiten estudiar de forma aislada cómo afectan estas señales a la coherencia temporal de la generación.
- Reproducción de experimentos de difusión multivista: el paquete `code_changes.tar.gz` documenta los cambios exactos de dataset, configuración y callback de validación necesarios para replicar el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de rectified flow en la iteración 12.000 (~0,058, con ruido por iteración), comparable al ~0,057 de la ejecución equivalente sobre el dataset real CoMind.

## Requisitos de hardware

- Pesos en bfloat16 de aproximadamente 4 GB (el repositorio completo ocupa 4,1 GB), calculado a partir del tamaño de los parámetros del checkpoint.
- Entrenamiento original: 2 GPU NVIDIA H200 con FSDP de tamaño de shard 2 durante 12.000 iteraciones.
- VRAM para inferencia: no disponible de forma explícita; al ser un modelo de generación de vídeo de ~2B, los requisitos de memoria vendrán dominados por las activaciones de vídeo y por la resolución y duración de los clips, no solo por el tamaño de los pesos.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; no se documenta ninguna prueba en RTX 4090 u otras GPU de gama consumer.
- Opciones de despliegue: scripts del repositorio `nvidia-cosmos/cosmos-predict2.5` (clonado, extracción de `code_changes.tar.gz` en `cosmos_predict2/_src/` y ejecución con `torchrun` sobre la configuración `vroid_single_view`). No aplica soporte de vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Vistas | Datos de ajuste | Iteraciones | Pérdida final | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| kimhosoo/vroid-single-view-ablation | ~2B | 1 (V=1) | dhyun22/ego_gen_vroid_single (sintético, VRoid) | 12.000 | ~0,058 | Apache 2.0 | Pública en HuggingFace (0 descargas) |
| kimhosoo/comind-single-view-ablation | ~2B | 1 (V=1) | CoMind (real) | 12.000 | ~0,057 | No disponible en la información | Pública en HuggingFace |
| nvidia/Cosmos-Predict2.5-2B | ~2B | 2 (V=2, conjunto) | No disponible en la información | No disponible | No disponible | No disponible en la información | Checkpoint base en HuggingFace |

La comparación directa más relevante es con `kimhosoo/comind-single-view-ablation`, que replica la misma ablación sobre datos reales y constituye el experimento de control de este checkpoint. No se dispone de datos de rendimiento cuantitativo para ninguno de los tres modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de ablación con finalidad experimental, no un modelo listo para producción.
- El repositorio registra 0 descargas y 0 «likes», por lo que carece de validación por parte de la comunidad.
- Entrenado exclusivamente con datos sintéticos (avatares VRoid en escenas sintéticas), lo que introduce una brecha de dominio previsible frente a vídeo egocéntrico real.
- No se publican benchmarks, métricas de calidad perceptual, FVD ni evaluaciones humanas.
- No se especifican los idiomas soportados ni las características del texto de condicionamiento más allá de la mezcla 70/30 de descripciones.
- El proceso de uso requiere clonar el repositorio `nvidia-cosmos/cosmos-predict2.5`, extraer `code_changes.tar.gz` en `cosmos_predict2/_src/` y ajustar la ruta del checkpoint; no es un modelo plug-and-play.
- La pérdida reportada (~0,058) presenta ruido por iteración, por lo que no debe interpretarse como una medida estable de calidad.
- Al generar cada vista de forma independiente, el modelo pierde estructuralmente la información cruzada entre vistas que sí explota el modelo base multivista.
- No se documentan salvaguardas de contenido, filtros de seguridad ni procedimientos de evaluación de sesgos.
- La licencia del checkpoint es Apache 2.0, pero conviene verificar los términos del modelo base `nvidia/Cosmos-Predict2.5-2B`, del encoder `nvidia/Cosmos-Reason1-7B` y del dataset `dhyun22/ego_gen_vroid_single` antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimhosoo/vroid-single-view-ablation
- Checkpoint de la contraparte real: https://huggingface.co/kimhosoo/comind-single-view-ablation
- Dataset de ajuste: https://huggingface.co/datasets/dhyun22/ego_gen_vroid_single
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Encoder de texto: https://huggingface.co/nvidia/Cosmos-Reason1-7B
- Repositorio de código: https://github.com/nvidia-cosmos/cosmos-predict2.5

No se han encontrado en la búsqueda web enlaces adicionales relevantes para este modelo.

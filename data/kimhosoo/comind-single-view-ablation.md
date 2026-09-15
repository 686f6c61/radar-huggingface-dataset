# kimhosoo/comind-single-view-ablation

## Resumen

comind-single-view-ablation es un checkpoint de investigación publicado por el usuario kimhosoo que consiste en una ablación del modelo de generación de vídeo Cosmos-Predict2.5-2B de NVIDIA, especializado en vídeo egocéntrico multivista. El objetivo de esta ablación es medir qué ocurre cuando se elimina por completo la información cruzada entre vistas: en lugar de generar dos vistas ego (líder y ayudante) de forma conjunta, este checkpoint genera cada vista de manera totalmente independiente (V=1), sin frames de referencia, con warp propio, pose propia y cámara canónica por vista.

El modelo se ha afinado sobre el dataset real egocéntrico dhyun22/ego_gen_comind_single, compuesto por 12.090 clips de grabaciones de cocina con dos personas en un mundo compartido (CoMind), y se apoya en el codificador de texto nvidia/Cosmos-Reason1-7B, basado en la arquitectura Qwen2.5-VL-7B. Es relevante como pieza de estudio para quienes investigan condicionamiento multivista en difusión de vídeo, ya que aísla el efecto de la atención compartida frente a la generación por vista.

Se trata de un artefacto de ablation, no de un modelo listo para producto: tiene cero descargas, cero likes, no publica benchmarks y requiere aplicar un parche de código (code_changes.tar.gz) sobre el repositorio oficial de cosmos-predict2.5 para poder cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (rectified flow) para generacion de video; extension multivista de Cosmos-Predict2.5-2B con atencion propia y cruzada, condicionamiento por warp, pose y rayos de Plucker |
| Parametros totales | 2B (heredados de nvidia/Cosmos-Predict2.5-2B); no se especifica el recuento exacto del checkpoint de ablation |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos EMA); no se publican variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (segun la model card; el modelo base NVIDIA puede estar sujeto a su propia licencia) |
| Formato de pesos | .pt (checkpoint PyTorch, `model_ema_bf16.pt`, convertido desde DCP/FSDP con `scripts/convert_distcp_to_pt.py`) |

## Arquitectura y entrenamiento

El checkpoint parte de `nvidia/Cosmos-Predict2.5-2B` en su variante multivista (`auto/multiview/524af350-...-_ema_bf16.pt`), un transformer de difusion con objetivo rectified-flow. En su forma original, el modelo genera dos vistas ego de manera conjunta: las atenciones propias (self-attention) permiten que líder y ayudante vean los tokens del otro, y las atenciones cruzadas (cross-attention) les dan acceso mutuo a los captions, todo condicionado por frames de referencia, rayos de Plucker entre vistas y contexto compartido de warp/pose. La ablación desactiva cada uno de esos mecanismos: elimina los frames de referencia, reobtiene el warp solo de los frames pasados del propio portador, renderiza únicamente el esqueleto propio en la condición de pose y canonicaliza los rayos de Plucker al frame-0 de cada vista (`w2c[0] = I`). Además, los clips de líder y ayudante se agrupan (pooling) como muestras V=1 independientes en lugar de concatenarse en un único forward V=2, de modo que la self-attention no puede ver los tokens de la otra vista.

El entrenamiento se realizó sobre `dhyun22/ego_gen_comind_single` (12.090 clips, 32 grabaciones de mundo compartido, unos 21.500 ejemplos V=1 tras el pooling) durante 12.000 iteraciones en 2 GPU NVIDIA H200 con FSDP y shard size 2, reanudando una vez en la iteración 1.200 sin reinicio en frío. Los módulos de condicionamiento de pose, warp y visibilidad son nuevos y se inicializan a cero, mientras que el resto arranca desde los pesos preentrenados (`strict_resume=False`). El codificador de texto es `nvidia/Cosmos-Reason1-7B`. La pérdida de rectified flow en la iteración 12.000 es de aproximadamente 0,10, ruidosa entre iteraciones. Se guardaron checkpoints cada 500 iteraciones y este upload corresponde al `iter_000012000` final.

## Capacidades

- Generación de vídeo egocéntrico en una única vista (V=1), sin información cruzada entre vistas.
- Condicionamiento por pose propia del portador, warp derivado de sus frames pasados y cámara canónica por vista.
- Condicionamiento por texto a través del codificador Cosmos-Reason1-7B (Qwen2.5-VL-7B).
- Herramienta de investigación para estudiar el efecto de la atención comparticia multivista frente a la generación independiente.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles en la model card.
- Capacidades especiales: modo de vídeo; no se documenta vision, audio, thinking mode ni decodificación especulativa.

## Casos de uso

- Estudio comparativo de ablaciones: sirve para cuantificar la contribución de la atención cruzada multivista comparando sus salidas con las del modelo base multivista sobre el mismo dataset.
- Generación de vídeo egocéntrico sintético para cocina: el modelo puede producir clips de una sola persona en entornos de cocina compartidos, útiles como datos sintéticos para aumentar el dataset CoMind real.
- Simulación de perspectiva en primera persona: al reobtener el warp solo de los frames propios, encaja en prototipos que necesitan renderizar la vista de un único portador sin filtrar información del compañero.
- Investigación en robótica y manipulación: la condición de pose propia y cámara canónica permite experimentar con políticas que observan solo su propio punto de vista.
- Realidad aumentada y realidad virtual: generación de vídeo en primera persona para evaluación de pipelines de renderizado donde la privacidad de la otra vista es un requisito (al no existir pooling cruzado).
- Reproducción de experimentos académicos: el paquete `code_changes.tar.gz` y los cambios documentados (nuevo `ComindSingleEgoDataset`, `VroidSingleEgoDataset`, experimentos `comind_single_view` y `vroid_single_view`) permiten replicar la ablación en otros datasets egocéntricos.
- Pruebas de estrés de datos: al duplicar el número de muestras V=1 respecto a los clips emparejados, es útil para medir la eficiencia de datos de compartir pesos sin compartir contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de rectified flow en la iteración 12.000 (aproximadamente 0,10) y advierte que es ruidosa por iteración. No hay métricas de FVD, FID, similitud de pose ni comparaciones cuantitativas con el modelo base multivista o con otros generadores de vídeo egocéntrico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; partiendo de los 2B parámetros del transformer de difusión en bfloat16 (unos 4 GB de pesos) más el codificador de texto Cosmos-Reason1-7B en bfloat16 (unos 14 GB) y las activaciones de vídeo, se puede estimar un mínimo práctico en el entorno de 20-24 GB, aunque es una estimación derivada, no un dato confirmado.
- GPU recomendadas: el entrenamiento se realizó en 2 GPU NVIDIA H200; para inferencia se desconoce la recomendación oficial. Por tamaño, GPU profesionales tipo A100, H100 o L40S son adecuadas.
- Cabe en GPU de consumo: probablemente en una RTX 4090 (24 GB) o similar, siempre que la inferencia se ajuste a bfloat16 y se gestione con cuidado la memoria del codificador de texto y las activaciones; no hay confirmación en la información disponible.
- Opciones de despliegue: el flujo documentado es PyTorch con `torchrun` sobre el repositorio nvidia-cosmos/cosmos-predict2.5, con `trainer.max_iter=0` para inferencia. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| comind-single-view-ablation (este) | 2B (base) | no disponible | Generacion V=1 independiente, ablacion | apache-2.0 | HuggingFace, 0 descargas |
| nvidia/Cosmos-Predict2.5-2B (multivista, base) | 2B | no disponible | Generacion V=2 conjunta con atencion cruzada | Licencia NVIDIA del modelo base | HuggingFace, oficial |
| nvidia/Cosmos-Reason1-7B | 7B | no disponible | Codificador de texto (VLM de razonamiento) | no disponible | HuggingFace, oficial |

No se dispone de datos comparativos de rendimiento con otras alternativas de generación de vídeo egocéntrico en la información proporcionada. Cualquier comparación cuantitativa con modelos como los de la familia Cosmos, Open-Sora o similares sería especulativa y no se incluye.

## Limitaciones y advertencias

- Es un checkpoint de ablación de investigación, no un modelo de producción: la propia model card lo describe como "single-ego ablation checkpoint".
- Cero descargas y cero likes en el momento de la consulta, sin validación externa conocida.
- No publica benchmarks ni evaluaciones cualitativas; solo la pérdida de entrenamiento final, que el propio autor califica de ruidosa.
- Requiere aplicar `code_changes.tar.gz` sobre `cosmos_predict2/_src/` de un clon de nvidia-cosmos/cosmos-predict2.5 para poder cargarse; no funciona con el repositorio sin parchear.
- Depende de rutas y checkpoints concretos del modelo base (`auto/multiview/524af350-...-_ema_bf16.pt`), lo que puede dificultar la reproducibilidad si NVIDIA reorganiza sus artefactos.
- Licencia declarada apache-2.0 en el repositorio, pero al derivar de nvidia/Cosmos-Predict2.5-2B conviene revisar los términos del modelo base de NVIDIA antes de cualquier uso comercial.
- Idiomas soportados no declarados; la cobertura multilingüe del codificador de texto es una inferencia, no un dato confirmado.
- Riesgo de alucinación visual y artefactos de generación propio de los modelos de difusión de vídeo, agravado por tratarse de una ablación sin frames de referencia.
- Sesgos potenciales heredados del dataset CoMind (grabaciones de cocina con dos personas) y de los datos de preentrenamiento del modelo base, no evaluados en esta ficha.
- El pooling V=1 duplica el número de muestras efectivas y los clips líder y ayudante se tratan de forma independiente: los resultados no son extrapolables directamente a configuraciones multivista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimhosoo/comind-single-view-ablation
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Dataset de entrenamiento (CoMind single): https://huggingface.co/datasets/dhyun22/ego_gen_comind_single
- Dataset sintético VRoid single: https://huggingface.co/datasets/dhyun22/ego_gen_vroid_single
- Repositorio de código: https://github.com/nvidia-cosmos/cosmos-predict2.5
- Codificador de texto: https://huggingface.co/nvidia/Cosmos-Reason1-7B

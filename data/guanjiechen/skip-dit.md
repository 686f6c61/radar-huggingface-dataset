# GuanjieChen/Skip-DiT

## Resumen

Skip-DiT es una variante de Diffusion Transformer (DiT) para generacion de imagen y video que introduce conexiones de salto largas (Long-Skip-Connections, LSC) entre bloques superficiales y profundos para estabilizar la dinamica de caracteristicas y habilitar un mecanismo de cache estatico eficiente. Lo desarrolla GuanjieChen y se publica junto al paper "Towards Stabilized and Efficient Diffusion Transformers through Long-Skip-Connections with Spectral Constraints" (arXiv:2411.17616). El repositorio contiene los pesos entrenados y el codigo PyTorch oficial.

El problema que aborda es la inestabilidad de caracteristicas en la inferencia con cache de los DiT: al reutilizar computaciones de pasos anteriores, los errores se amplifican y degradan la calidad de la generacion. Skip-DiT identifica la ausencia de mecanismos de preservacion de caracteristicas de largo alcance como causa raiz y la resuelve con LSC, lo que permite acelerar la inferencia manteniendo mayor similitud de caracteristicas que metodos previos como FORA o Faster-Diff.

Los modelos publicados incluyen un text-to-video (Latte-skip, backbone Latte, 8.76 G), un class-to-image (DiT-XL/2-skip, 11.40 G) y cuatro class-to-video sobre Latte (2.77 G cada uno) entrenados con UCF101, Taichi-HD, SkyTimelapse y FaceForensics. La licencia es Apache 2.0. No se dispone de informacion sobre el numero de parametros ni la longitud de contexto en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con Long-Skip-Connections; backbones Latte y DiT-XL/2 |
| Parametros totales | no disponible (tamanos reportados en GB: 2.77 G, 8.76 G, 11.40 G) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | .pt (PyTorch checkpoints) |

## Arquitectura y entrenamiento

Skip-DiT parte de un Diffusion Transformer estandar al que se anaden conexiones de salto largas que vinculan bloques superficiales con bloques profundos. Estas conexiones estabilizan la propagacion de caracteristicas y permiten que, durante la inferencia con cache, se omita el computo de determinadas rutas sin degradar la calidad. El paper analiza sistematicamente la inestabilidad dinamica de caracteristicas en los DiT y atribuye el problema a la falta de mecanismos de preservacion de caracteristicas de largo alcance. El entrenamiento de Latte-skip se realiza en dos etapas: primero se congelan todos los parametros excepto las ramas de salto (`freeze=True`) y despues se entrena el modelo completo (`freeze=False`).

Los datos de entrenamiento varian segun el modelo: Vimeo para Latte-skip (text-to-video), ImageNet para DiT-XL/2-skip (class-to-image), y UCF101, Taichi-HD, SkyTimelapse y FaceForensics para los modelos class-to-video. No se especifica el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica principal es el mecanismo Skip-Cache, que permite acelerar la generacion con un factor de speedup configurable (por ejemplo, `--cache N2-700-50` en el script de text-to-video) manteniendo mayor PSNR que los metodos de cache previos.

## Capacidades

- Generacion de video a partir de texto (modelo Latte-skip, backbone Latte).
- Generacion de imagen a partir de texto mediante Hunyuan-DiT (checkpoint externo referenciado, no incluido en el repo).
- Generacion de imagen condicionada por clase (DiT-XL/2-skip sobre ImageNet).
- Generacion de video condicionada por clase (modelos sobre UCF101, Taichi-HD, SkyTimelapse y FaceForensics).
- Inferencia acelerada mediante cache estatico (Skip-Cache) con control del factor de speedup.
- Entrenamiento reproducible en dos etapas con codigo incluido en el repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues.

## Casos de uso

- Generacion de video corto a partir de descripciones textuales: Latte-skip permite sintetizar clips con el pipeline `sample_t2v.py`; adecuado para prototipado de contenido audiovisual y experimentacion con modelos de difusion de video.
- Aceleracion de pipelines de difusion en produccion: el Skip-Cache permite reducir el coste computacional de la inferencia manteniendo mayor PSNR que FORA o Faster-Diff, util en entornos con presupuesto de GPU limitado.
- Investigacion en estabilidad de caracteristicas en DiT: el modelo y el codigo sirven como base para estudiar la propagacion de caracteristicas y el diseno de conexiones de salto en transformers de difusion.
- Generacion de imagen condicionada por clase para experimentos controlados: DiT-XL/2-skip sobre ImageNet permite evaluar calidad y estabilidad con etiquetas de clase conocidas.
- Benchmarking de metodos de cache: los checkpoints y scripts permiten comparar Skip-Cache frente a otros metodos de aceleracion en tareas de imagen y video.
- Reproduccion de resultados academicos: el repositorio incluye codigo de entrenamiento y scripts de muestreo para replicar los experimentos del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El paper reporta comparativas de PSNR y factor de speedup frente a metodos de cache como FORA y Faster-Diff, pero los valores concretos no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Los tamanos de checkpoint van de 2.77 G a 11.40 G, lo que orienta sobre el orden de magnitud, pero no se confirma el pico de VRAM en inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; los modelos de 2.77 G podrian ser candidatos, pero no se especifica.
- Opciones de despliegue: scripts PyTorch propios (`sample_t2v.py`, `sample_t2i.py`) con entornos conda. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; solo se indica que Skip-Cache ofrece speedup configurable con mayor PSNR que alternativas.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Tamano | Licencia | Cache acelerado |
|---|---|---|---|---|---|
| Skip-DiT (Latte-skip) | text-to-video | Latte | 8.76 G | Apache 2.0 | Si (Skip-Cache) |
| Latte | text-to-video | Latte | no disponible | no disponible | No documentado |
| DiT-XL/2 | class-to-image | DiT-XL/2 | no disponible | no disponible | No documentado |
| Hunyuan-DiT | text-to-image | DiT | no disponible | no disponible | No documentado |

La comparativa se limita a los modelos citados en la propia model card como inspiracion o backbone; no se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion y artefactos propio de los modelos generativos de difusion; no cuantificado.
- Los modelos class-to-video estan entrenados sobre datasets especificos (UCF101, Taichi-HD, SkyTimelapse, FaceForensics) y su generalizacion fuera de esos dominios no esta documentada.
- No se especifican idiomas soportados; el pipeline de texto depende del codificador de texto del backbone, no detallado.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la compatibilidad con las licencias de los backbones (Latte, DiT, Hunyuan-DiT) y de los datasets de entrenamiento.
- El repositorio tiene 0 descargas y 5 likes en el momento de la consulta; es un proyecto de investigacion con soporte limitado.
- No hay informacion sobre cuantizacion ni despliegue en frameworks de produccion, lo que limita su adopcion directa en entornos industriales.

## Enlaces

- Hugging Face: https://huggingface.co/GuanjieChen/Skip-DiT
- Paper (arXiv): https://huggingface.co/papers/2411.17616
- Codigo (GitHub): https://github.com/OpenSparseLLMs/Skip-DiT
- DeepCache (referencia): https://arxiv.org/abs/2312.00858
- Latte (backbone): https://github.com/Vchitect/Latte
- DiT (backbone): https://github.com/facebookresearch/DiT
- Hunyuan-DiT (backbone text-to-image): https://github.com/Tencent/HunyuanDiT
- Checkpoint Hunyuan-DiT v1.2: https://huggingface.co/Tencent-Hunyuan/HunyuanDiT-v1.2/tree/main/t2i/model

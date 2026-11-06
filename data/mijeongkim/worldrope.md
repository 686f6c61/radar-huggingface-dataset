# mijeongkim/WorldRoPE

## Resumen

WorldRoPE es un metodo de codificacion posicional rotatoria (RoPE) de caracter probabilistico y centrado en el mundo, disenado para atencion multi-vista en tareas de sintesis de vistas novedosas (novel view synthesis, NVS). Lo desarrollan Mijeong Kim, Kyujin Lim y Bohyung Han, del grupo de investigacion de Bohyung Han en la Seoul National University, y se publica en arXiv con el identificador 2610.16337. El repositorio de Hugging Face no contiene un modelo de lenguaje, sino un conjunto de checkpoints de investigacion para el modelo LVSM (Large View Synthesis Model), acompanados de las lineas base RayRoPE y URoPE.

El problema que aborda es la representacion de la geometria de la escena en la atencion entre multiples vistas. En lugar de tratar cada token de imagen como un punto, WorldRoPE lo modela como un soporte gaussiano 3D probabilistico y aplica la rotacion posicional sobre su proyeccion en la vista de consulta. De este modo, la atencion multi-vista incorpora de forma explicita la incertidumbre geometrica de cada token, lo que mejora la coherencia entre vistas al renderizar puntos de vista no observados.

El interes practico del repositorio es acotado: no es un modelo generativo de proposito general ni un LLM, y su uso esta restringido a la evaluacion y reproduccion de resultados de NVS sobre los conjuntos RE10K y Objaverse. La relevancia es, por tanto, para investigadores en vision por computador que trabajen en atencion multi-vista, representaciones geometricas y sintesis de vistas, no para desarrolladores que busquen un modelo de lenguaje o un sistema multimodal de uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de sintesis de vistas (LVSM) con atencion multi-vista y codificacion posicional rotatoria world-centric (WorldRoPE); se incluyen las variantes RayRoPE y URoPE |
| Parametros totales | 24,5 M (WorldRoPE y URoPE); 47,4 M (RayRoPE, modelo small preentrenado oficial) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento, formato .pt) |
| Idiomas soportados | en (etiqueta de la model card; el modelo procesa imagenes, no texto) |
| Licencia | Apache 2.0 (RayRoPE conserva su aviso MIT en licenses/RayRoPE_LICENSE) |
| Formato de pesos | PyTorch (.pt), con config.yaml asociado a cada checkpoint |

## Arquitectura y entrenamiento

WorldRoPE se apoya en LVSM como arquitectura base de sintesis de vistas. La innovacion central es la codificacion posicional: cada token de imagen se representa como un soporte gaussiano 3D probabilistico y la rotacion posicional se integra sobre su proyeccion en la vista de consulta, en lugar de aplicarse sobre una posicion puntual. Esto permite que la atencion multi-vista razone sobre la incertidumbre de la geometria de cada token, algo relevante cuando la profundidad es ambigua o las vistas de entrada son escasas.

Los checkpoints publicados corresponden al paso 80.000 de entrenamiento en todos los casos. Se ofrecen pesos para dos conjuntos de datos: RE10K (RealEstate10K) y Objaverse. El repositorio incluye ademas las reproducciones de las lineas base RayRoPE y URoPE sobre RE10K, lo que facilita la comparacion controlada. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de alineamiento como RLHF o DPO, algo por otra parte esperable en un modelo de vision y no de lenguaje.

## Capacidades

- Sintesis de vistas novedosas (NVS): genera imagenes de puntos de vista no observados a partir de un conjunto de vistas de entrada, sobre escenas de RE10K y objetos de Objaverse.
- Atencion multi-vista con codificacion posicional world-centric: integra la geometria de la escena en el mecanismo de atencion mediante soportes gaussianos 3D.
- Modelado probabilistico de la posicion de los tokens: incorpora incertidumbre geometrica en la representacion posicional.
- Reproduccion de lineas base: incluye checkpoints de RayRoPE y URoPE con sus configuraciones para comparacion directa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto; no es un modelo de lenguaje ni un modelo multimodal de texto.
- Capacidades multilingues: no aplicables (procesa imagenes; la unica etiqueta de idioma es en).

## Casos de uso

- Investigacion en sintesis de vistas: evaluar y reproducir los resultados de WorldRoPE frente a RayRoPE y URoPE sobre RE10K usando los scripts `scripts/nvs.sh` incluidos en el repositorio de codigo.
- Benchmarking de codificaciones posicionales: comparar el efecto de distintas RoPE (world-centric, ray-based, URoPE) en la calidad de renderizado manteniendo el mismo backbone LVSM y el mismo paso de entrenamiento (80.000).
- Reconstruccion de escenas a partir de imagenes dispersas: emplear el checkpoint de RE10K para generar vistas intermedias de interiores y exteriores a partir de un conjunto reducido de fotografias.
- Renderizado de objetos 3D: usar el checkpoint de Objaverse para sintetizar vistas de objetos desde angulos arbitrarios, util en pipelines de aumento de datos o previsualizacion.
- Linea base para nuevos metodos de atencion multi-vista: partir de los checkpoints y configuraciones publicados para aislar mejoras atribuibles a la codificacion posicional.
- Validacion de infraestructura de evaluacion: el script `scripts/check_checkpoint.py` permite verificar la integridad de los pesos antes de lanzar evaluaciones a gran escala.
- Docencia y reproduccion experimental: el tamano reducido (24,5 M parametros) y la licencia Apache 2.0 facilitan su uso en entornos academicos y en practicas de vision por computador.

## Benchmarks y rendimiento

Resultados reportados por el autor para WorldRoPE:

| Dataset | PSNR ↑ | SSIM ↑ | LPIPS ↓ |
|---|---:|---:|---:|
| RE10K | 26,75 | 0,846 | 0,073 |
| Objaverse | 22,52 | 0,896 | 0,113 |

No se han publicado en la informacion disponible los resultados numericos de RayRoPE ni de URoPE en este repositorio, por lo que no se incluye una comparacion cuantitativa entre metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 24,5 M parametros (WorldRoPE, URoPE) y 47,4 M (RayRoPE), el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna, incluso en FP32.
- GPU recomendadas: cualquier GPU con soporte CUDA; no se requiere A100 ni H100. Una RTX 4090 o superior ofrece margen de sobra, y tarjetas de gama media son suficientes para inferencia.
- Cabe en GPU consumer: si, con amplio margen, dado el reducido numero de parametros.
- Opciones de despliegue: el repositorio esta pensado para ejecutarse con el codigo oficial (scripts `nvs.sh` y `check_checkpoint.py`) sobre PyTorch; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | PSNR (RE10K) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| WorldRoPE | 24,5 M | RE10K, Objaverse | 26,75 | Apache 2.0 | Checkpoints en Hugging Face |
| URoPE | 24,5 M | RE10K | no disponible | no disponible | Checkpoint incluido en este repo |
| RayRoPE | 47,4 M | RE10K | no disponible | MIT (aviso conservado) | Checkpoint incluido en este repo |

La comparacion se limita a los tres metodos incluidos en el repositorio; no se dispone de datos de otros sistemas de NVS en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Alcance limitado a dos dominios: los checkpoints estan entrenados para RE10K (escenas de interiores y exteriores de RealEstate10K) y Objaverse (objetos 3D); el rendimiento fuera de estos dominios no esta documentado.
- Riesgo de artefactos y alucinacion geometrica: como todo modelo de sintesis de vistas, puede generar geometria inconsistente en regiones ocluidas o con poca cobertura de vistas.
- Licencia: Apache 2.0 permite uso comercial, pero RayRoPE conserva su aviso MIT y deben respetarse los avisos de terceros incluidos en `licenses/NOTICE`.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Dependencia del codigo oficial: la evaluacion requiere clonar la rama `nvs-release_check` del repositorio de GitHub y preparar los datasets segun su README; no hay pipeline de inferencia simplificado.
- Sin informacion sobre cuantizacion, latencia ni throughput, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/mijeongkim/WorldRoPE
- arXiv: https://arxiv.org/abs/2610.16337
- Paper en Hugging Face: https://huggingface.co/papers/2610.16337
- Pagina del proyecto: https://mjmjeong.github.io/research_projects/worldrope/
- Codigo (rama nvs-release_check): https://github.com/mjmjeong/WorldRoPE/tree/nvs-release_check
- Web del autor: https://mjmjeong.github.io/
- RayRoPE (codigo): https://github.com/Lucas-707/RayRoPE
- URoPE (pagina del proyecto): https://urope-pe.github.io/

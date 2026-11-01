# rayruiyang/GeoUG-Depth

## Resumen

GeoUG-Depth es un modelo de estimación de profundidad métrica monocular, es decir, genera un mapa de profundidad en metros a partir de una única imagen RGB. Lo desarrolla el autor `rayruiyang` (contacto en la Universidad de Hong Kong, según el correo de contacto de la model card) y se publica como el experto independiente de generación de profundidad dentro de la familia GeoUG. Su función es proporcionar medidas geométricas en unidades métricas para razonamiento espacial y tareas posteriores de reconstrucción 3D.

El modelo se construye sobre la arquitectura BAGEL/MoT (Mixture of Transformers), reutilizando componentes preentrenados de BAGEL, y se distribuye como pesos EMA convertidos de FP32 a BF16. El repositorio ocupa 29,5 GB y el fichero principal de pesos (`ema.safetensors`) pesa aproximadamente 27,21 GiB. No requiere un índice de shards ni un checkpoint no-EMA separado.

Es relevante porque separa la generación de profundidad del resto de la política espacial adaptativa de GeoUG: es un checkpoint autónomo, con instrucciones de inferencia mediante un runtime propio (`inference.depth`), y reporta resultados competitivos en NYU-v2, KITTI y ETH3D con métricas alineadas por afinidad. La licencia es mixta y hereda restricciones CC BY-NC de componentes BAGEL/DiT, lo que limita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BAGEL/MoT (Mixture of Transformers) con experto de profundidad; componentes VAE y ViT |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (release oficial); FP32 (fuente EMA original, no distribuida en el repo) |
| Idiomas soportados | inglés (`en`) |
| Licencia | other (licencia mixta; restricciones CC BY-NC en ficheros derivados de BAGEL/DiT) |
| Formato de pesos | safetensors (`ema.safetensors` BF16, `ae.safetensors` VAE) |

## Arquitectura y entrenamiento

GeoUG-Depth emplea la arquitectura BAGEL/MoT, un esquema de mezcla de transformadores que combina un codificador visual (ViT), un VAE para el espacio latente y un componente tipo LLM para la generación condicionada. El modelo genera profundidad mediante un proceso de difusión con normalización de disparidad multiescala, con parámetros `c: [2.0, 8.0, 32.0]`. La inferencia se controla con un prompt específico (`<GENERATE_DEPTH>Estimate the metric depth map.</GENERATE_DEPTH>`) y parámetros de muestreo (`--num-timesteps 50`, `--cfg-text-scale 4.0`, `--cfg-img-scale 1.5`).

El checkpoint distribuido corresponde al experto de profundidad métrica en el paso de entrenamiento 6000, en su versión EMA. Los pesos publicados son la conversión BF16 del EMA original en FP32, que se conserva pero no se distribuye en este repositorio. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO para este experto concreto. La familia GeoUG incluye además GeoUG-Spatial (política espacial adaptativa final) y GeoUG-ColdStart (inicialización SFT para RL de política espacial), lo que sugiere un pipeline de SFT seguido de RL para el componente de razonamiento espacial, aunque el detalle del entrenamiento del experto de profundidad no se especifica.

## Capacidades

- Generación de profundidad métrica monocular a partir de una imagen RGB, con salida en metros (fichero `.npy`).
- Generación de una visualización de profundidad normalizada por percentiles (PNG), que no codifica valores métricos.
- Estimación de geometría 3D a partir de una sola vista, útil para medición y razonamiento espacial posterior.
- Condicionamiento por prompt de texto específico para la tarea de profundidad.
- Control de muestreo mediante pasos de difusión y escalas de CFG de texto e imagen.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso general, visión más allá de la entrada RGB ni otros idiomas distintos del inglés.

## Casos de uso

- Medición de distancias en escenas interiores: el modelo genera profundidad en metros que puede usarse para calcular distancias entre objetos y cámara en imágenes de interior, adecuado por su rendimiento reportado en NYU-v2 (AbsRel 3,32 %).
- Reconstrucción 3D y nubes de puntos: a partir del mapa de profundidad métrica y la calibración de cámara se pueden proyectar píxeles a coordenadas 3D para generar nubes de puntos o mallas de escenas.
- Percepción para robótica y navegación: la profundidad monocular permite estimar obstáculos y distancias libres en un robot con una sola cámara, reduciendo el coste de sensores frente a LiDAR o cámaras estéreo.
- Automoción y análisis de escenas viarias: con resultados reportados en KITTI (AbsRel 4,84 %), puede emplearse para estimar distancias a vehículos y peatones en imágenes de tráfico.
- Realidad aumentada y efectos visuales: inserción de objetos virtuales con oclusión y escala correctas al disponer de profundidad métrica de la escena.
- Análisis de escenas aéreas o de gran escala: los resultados en ETH3D (AbsRel 3,75 %) sugieren utilidad en escenas exteriores con estructuras, aplicable a inspección de infraestructuras.
- Preprocesado para modelos de razonamiento espacial: como experto de profundidad de la familia GeoUG, puede alimentar pipelines de razonamiento 3D que necesiten mapas métricos como entrada intermedia.

## Benchmarks y rendimiento

Resultados reportados por el autor, con alineación afín (affine-aligned). No deben interpretarse como precisión métrica sin alinear.

| Dataset | AbsRel (%) ↓ | δ1 (%) ↑ |
|---|---:|---:|
| NYU-v2 | 3,32 | 98,46 |
| KITTI | 4,84 | 97,27 |
| ETH3D | 3,75 | 97,85 |

No se han publicado en la información disponible comparaciones directas con otros modelos en estos benchmarks ni resultados de otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos BF16 ocupa aproximadamente 27,21 GiB, por lo que se requiere una GPU con al menos ~28-32 GB de VRAM para cargar los pesos en BF16, más memoria adicional para activaciones y el VAE.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs de 32 GB o más como RTX A6000; no se especifican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: no cabe en GPUs de consumo típicas de 8-24 GB en BF16; no se documentan versiones cuantizadas (GGUF, INT8, etc.) que permitan reducir el requisito.
- Opciones de despliegue: runtime propio de GeoUG (`python -m inference.depth`), con Python 3.10/3.11, CUDA y entorno FlashAttention documentado. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la inferencia usa 50 pasos de difusión por defecto, lo que condiciona el coste computacional.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, rendimiento, licencia) para establecer una comparativa rigurosa. Los resultados reportados en NYU-v2, KITTI y ETH3D podrían compararse con otros estimadores de profundidad monocular, pero no se incluyen cifras de terceros en la documentación disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GeoUG-Depth | no disponible | no disponible | other (mixta, CC BY-NC parcial) | HuggingFace |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las métricas reportadas están alineadas por afinidad (affine-aligned); no reflejan la precisión métrica sin alinear y no deben compararse directamente con resultados no alineados.
- La profundidad generada es una estimación; la geometría derivada depende de la calibración de cámara y de la distribución de escenas.
- La salida PNG es una visualización normalizada por percentiles y no codifica valores métricos; para medición debe usarse el `.npy`.
- El modelo solo declara soporte de inglés; no se documentan otros idiomas.
- Licencia mixta con restricciones CC BY-NC en ficheros derivados de BAGEL/DiT, lo que limita el uso comercial; es necesario consultar `LICENSE` y `THIRD_PARTY_NOTICES.md` del checkout de código.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datasets de profundidad, puede heredar sesgos de distribución de escenas (interiores, viario, etc.).
- Riesgo de alucinación geométrica en escenas fuera de distribución o con calibración incorrecta.
- Requiere el runtime propio de GeoUG; no es compatible con `AutoModel.from_pretrained` genérico.
- No se distribuyen versiones cuantizadas, lo que limita el despliegue en hardware de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/rayruiyang/GeoUG-Depth
- Página del proyecto: https://yangr116.github.io/geoug-project-page/
- Paper: https://yangr116.github.io/geoug-project-page/assets/geoug-paper.pdf
- GeoUG-Spatial: https://huggingface.co/rayruiyang/GeoUG-Spatial
- GeoUG-ColdStart: https://huggingface.co/rayruiyang/GeoUG-ColdStart
- Contacto: rayyang0116@connect.hku.hk

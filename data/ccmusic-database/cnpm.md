# ccmusic-database/CNPM

## Resumen

CNPM (Chinese National Pentatonic Mode Recognition Model) es un modelo de clasificacion de audio especializado en el reconocimiento de los cinco modos pentatonicos de la musica tradicional china: Gong, Shang, Jiao, Zhi y Yu. Lo desarrolla el proyecto ccmusic-database, una iniciativa academica centrada en la investigacion de recuperacion de informacion musical (MIR) para musica china, y se distribuye bajo licencia MIT.

El modelo no es un modelo de lenguaje, sino un clasificador de audio que combina extraccion de caracteristicas espectrales, analisis de frecuencia y reconocimiento de patrones para identificar el modo tonal de una pieza musical. Emplea diferentes backbones de vision (ViT, VGG, RegNet, Wide ResNet, AlexNet, ShuffleNet) aplicados sobre representaciones espectrograficas del audio (Mel, CQT, Chroma), siendo la combinacion de ViT-L/16 con CQT la que obtiene el mejor rendimiento.

Su relevancia es principalmente cultural y de investigacion: facilita la preservacion digital de musica etnica china y proporciona una base tecnica reproducible para el analisis y la recuperacion de caracteristicas musicales. El repositorio ocupa 5,1 GB e incluye los pesos de los distintos backbones evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de audio basado en backbones de vision (ViT-L/16, ViT-L/32, VGG11-BN, RegNet-Y-16GF, Wide ResNet50-2, AlexNet, ShuffleNetV2-x2.0) sobre espectrogramas |
| Parametros totales | Variable segun backbone: 7,4 M (ShuffleNetV2-x2.0) hasta 306,5 M (ViT-L/32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (dominio musical: modos pentatonicos de musica china) |
| Licencia | MIT |
| Formato de pesos | No disponible (repo alojado via Git LFS, formato exacto no especificado) |

## Arquitectura y entrenamiento

El modelo se construye como un clasificador de audio que transforma la senal sonora en representaciones tiempo-frecuencia (Mel, CQT y Chroma) y las procesa con backbones convolucionales o transformers de vision preentrenados en ImageNet. Se evaluaron siete backbones distintos, desde ShuffleNetV2-x2.0 (7,4 M de parametros) hasta ViT-L/32 (306,5 M). La mejor configuracion es ViT-L/16 con representacion CQT, con una exactitud de 0,859.

El entrenamiento se realiza sobre el Chinese National Pentatonic Mode Dataset, que combina anotacion manual con analisis computacional y cubre escalas de cinco, seis y siete tonos. El dataset esta publicado en Hugging Face (ccmusic-database/CNPM). No se especifica en la informacion disponible el numero de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos o ajuste fino especificas. Las curvas de perdida, exactitud de entrenamiento/validacion y matriz de confusion del mejor modelo estan publicadas en el repositorio.

## Capacidades

- Clasificacion de audio en los cinco modos pentatonicos chinos (Gong, Shang, Jiao, Zhi, Yu).
- Analisis de caracteristicas espectrales mediante Mel, CQT y Chroma.
- Reconocimiento de patrones musicales sobre escalas de cinco, seis y siete tonos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no es un modelo linguistico).
- Capacidades especiales: analisis de frecuencia y extraccion de caracteristicas orientadas a MIR.

## Casos de uso

- Preservacion digital de musica etnica: el modelo clasifica automaticamente grabaciones de musica tradicional china por modo tonal, lo que permite etiquetar y organizar archivos de audio en archivos digitales y bibliotecas musicologicas.
- Catalogacion y recuperacion musical: integrado en un sistema de MIR, permite buscar piezas por modo pentatonico, facilitando la recuperacion por caracteristicas musicales en lugar de por metadatos textuales.
- Investigacion musicologica: proporciona una herramienta reproducible para analizar corpus de musica china y estudiar la distribucion de modos en diferentes regiones o epocas.
- Educacion musical: puede emplearse en aplicaciones didacticas para identificar el modo de una pieza y apoyar la ensenanza de la teoria musical china tradicional.
- Analisis de patrimonio cultural: util para instituciones culturales que digitalizan grabaciones historicas y necesitan clasificarlas de forma automatica y consistente.
- Benchmarking de tecnicas MIR: sirve como referencia para comparar backbones y representaciones espectrales (Mel vs CQT vs Chroma) en tareas de clasificacion de musica no occidental.

## Benchmarks y rendimiento

Resultados de exactitud por backbone y representacion espectral, segun la model card:

| Backbone | Tamano (M) | Mel | CQT | Chroma |
|---|---|---|---|---|
| vit_l_32 | 306,5 | 0,680 | 0,769 | 0,399 |
| vit_l_16 | 304,3 | 0,823 | 0,859 | 0,549 |
| vgg11_bn | 132,9 | 0,807 | 0,843 | 0,609 |
| regnet_y_16gf | 83,6 | 0,590 | 0,832 | 0,535 |
| wide_resnet50_2 | 68,9 | 0,694 | 0,757 | 0,531 |
| alexnet | 61,1 | 0,742 | 0,744 | 0,542 |
| shufflenet_v2_x2_0 | 7,4 | 0,473 | 0,720 | 0,266 |

El mejor resultado corresponde a ViT-L/16 con CQT (0,859).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para el backbone mas grande (ViT-L/32, 306,5 M de parametros) se estima un consumo moderado, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable para backbones pequenos (ShuffleNetV2-x2.0, AlexNet) y para ViT-L/16 en GPU consumer modernas, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: descarga via huggingface_hub (snapshot_download) e inferencia mediante el codigo de demo publicado en Hugging Face Spaces; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CNPM (este modelo) | Clasificador de audio (modos pentatonicos) | 7,4-306,5 M segun backbone | No aplica | Exactitud hasta 0,859 (CQT, ViT-L/16) | MIT | Hugging Face, ModelScope |
| Alternativas MIR genericas | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (reconocimiento de modos pentatonicos chinos) con datos verificables.

## Limitaciones y advertencias

- Dominio muy especifico: el modelo solo esta entrenado para modos pentatonicos de musica china; no es util para otros generos o sistemas tonales.
- No es un modelo generativo ni de lenguaje: no soporta texto, codigo, razonamiento ni tool calling.
- Sesgos potenciales derivados de la anotacion manual del dataset y de la seleccion de obras; no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de confusion entre modos en grabaciones con ruido, instrumentacion atipica o escalas de siete tonos poco representadas.
- Rendimiento variable segun backbone y representacion espectral (Chroma obtiene resultados notablemente inferiores a CQT).
- Licencia MIT permite uso comercial, pero conviene verificar los derechos de las obras del dataset original.
- No se documentan limitaciones de contexto o idioma por tratarse de un modelo de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/CNPM
- Demo (Space): https://huggingface.co/spaces/ccmusic-database/CNPM
- Dataset: https://huggingface.co/datasets/ccmusic-database/CNPM
- Mirror en ModelScope: https://www.modelscope.cn/models/ccmusic-database/CNPM
- Repositorio de evaluacion: https://github.com/monetjoe/ccmusic_eval
- Paper de referencia (CCMusic): https://doi.org/10.5334/tismir.194

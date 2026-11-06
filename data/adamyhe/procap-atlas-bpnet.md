# adamyhe/procap-atlas-bpnet

## Resumen

`adamyhe/procap-atlas-bpnet` es una coleccion de 224 modelos BPNet entrenados sobre el atlas ENCODE PRO-cap para predecir la senal de iniciacion de la transcripcion especifica de hebra en el genoma humano GRCh38/hg38. Lo desarrollan Adam Y. He, Claire Tian y Anshul Kundaje (Kundaje Lab, Stanford), y se publica bajo licencia MIT. No es un modelo de lenguaje: es un conjunto de modelos de secuencia-a-funcion (sequence-to-function) orientados a genomica reguladora, y su relevancia actual radica en que permite analizar in silico los determinantes de secuencia de la actividad de los sitios de inicio de transcripcion (TSS) y de la iniciacion promotor-proximal en 126 biosamples distintos.

Cada modelo recibe una ventana de ADN de 2.114 pb codificada en one-hot y predice un perfil de iniciacion PRO-cap de 1.000 pb para las hebras positiva y negativa, junto con predicciones de conteo. La coleccion cubre 224 experimentos ENCODE con siete folds de validacion cruzada por experimento (cromosomas retenidos), lo que permite evaluar el rendimiento de forma robusta y comparar programas de iniciacion entre tipos celulares y tejidos.

El modelo se distribuye como checkpoints de `bpnetlite.bpnet.BPNet` (libreria `bpnet-lite`), con un repositorio de 40,3 GB que incluye todos los experimentos y folds. Es un artefacto de investigacion, no un modelo de proposito general, y su uso previsto se limita a genomica reguladora, analisis de motivos y exploracion de efectos de variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPNet (red convolucional con dilataciones, implementada en `bpnet-lite`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.114 pb de ADN de entrada; salida de perfil de 1.000 pb |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo genomico; organismo: Homo sapiens) |
| Licencia | MIT |
| Formato de pesos | checkpoints `bpnetlite.bpnet.BPNet` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

BPNet es una red neuronal convolucional disenada para predecir perfiles de senal genomica a resolucion de base a partir de secuencia de ADN. En esta implementacion se usan 512 filtros, 8 capas BPNet y una cabeza de prediccion de perfil (1.000 pb por hebra) mas una cabeza de conteo, con un peso de perdida de conteo de 100. La entrada es una ventana de 2.114 pb codificada en one-hot; la salida son perfiles de iniciacion para las hebras positiva y negativa y conteos asociados. El modelo se entrena con la libreria `bpnet-lite`.

Los datos provienen de las pistas de senal PRO-cap de ENCODE (hebras positiva y negativa) y de los conjuntos de picos procesados por el pipeline `procap-atlas`. Cada experimento se entrena con siete folds cromosomicos definidos en `configs/chrom_splits.yaml`: para el fold `i`, el fold de datos `i` se reserva para test, el fold `(i + 1) % 7` para validacion y el resto para entrenamiento. El entrenamiento por defecto usa negativos emparejados por contenido GC en una proporcion de 1/7 negativos por positivo, aumento por reverse-complement, jitter de secuencia de hasta 200 pb, optimizador AdamW, tamano de lote 64 y tasa de aprendizaje 5e-4.

## Capacidades

- Prediccion de perfiles de iniciacion de transcripcion PRO-cap especificos de hebra a partir de secuencia de ADN humana (GRCh38/hg38).
- Prediccion de conteos de senal asociados al perfil, con una cabeza de conteo dedicada.
- Modelado de la forma del perfil de iniciacion promotor-proximal y de la actividad de TSS.
- Analisis de determinantes de secuencia mediante atribuciones DeepLIFT/SHAP estilo BPNet.
- Descubrimiento de motivos con TF-MoDISco, con resultados por experimento y un MotifCompendium a nivel de atlas.
- Exploracion de efectos de variantes (variant effect) en loci reguladores.
- Comparacion de programas de iniciacion entre tipos celulares y tejidos (126 biosamples, 224 experimentos).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Analisis de determinantes de secuencia de TSS: dado un locus promotor, el modelo predice el perfil de iniciacion en las hebras positiva y negativa y permite identificar que elementos de la secuencia explican la actividad observada mediante atribuciones.
- Exploracion de efectos de variantes en regiones reguladoras: se puede comparar la prediccion con la secuencia de referencia y con la variante para priorizar variantes candidatas en promotores y enhancers antes de validacion experimental.
- Descubrimiento de motivos de factores de transcripcion: las atribuciones por experimento alimentan TF-MoDISco para obtener motivos y compararlos con el MotifCompendium del atlas.
- Comparacion de programas de iniciacion entre tipos celulares: al disponer de modelos por experimento y biosample, se pueden contrastar predicciones y atribuciones entre tejidos para estudiar especificidad celular.
- Priorizacion de experimentos ENCODE: consultando las metricas por experimento y los flags de calidad del metadata, se puede decidir que biosamples tienen senal suficiente para un analisis downstream.
- Integracion en pipelines de genomica reguladora: los checkpoints se cargan como modulos `bpnetlite.bpnet.BPNet` y se pueden incorporar en flujos de analisis de picos, tracks y atribuciones del repositorio `procap-atlas`.
- Visualizacion en navegadores genomicos: las atribuciones convertidas a BigWig y los tracks del atlas se pueden explorar junto a la senal PRO-cap en un genome browser mediante el track hub de UCSC.

## Benchmarks y rendimiento

Metricas medianas a nivel de genoma sobre los 224 ficheros de benchmark de experimentos presentes en el proyecto, evaluadas en cromosomas de test retenidos por fold:

| Metrica | Mediana |
|---|---:|
| Correlacion de Pearson del perfil | 0,490 |
| Distancia Jensen-Shannon del perfil | 0,357 |
| Correlacion de Pearson de log-counts | 0,687 |
| Correlacion de Spearman de counts | 0,701 |

Los resultados exactos por experimento se escriben en `performance_metrics/bpnet/{experiment}.json`. El rendimiento depende fuertemente del tamano de libreria, la calidad y los detalles de construccion de la libreria PRO-cap, por lo que conviene consultar las metricas precalculadas y el metadata del atlas antes de usar un modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio completo ocupa 40,3 GB, pero corresponde a 224 experimentos x 7 folds, no a un unico checkpoint.
- GPU recomendadas: no disponible. Al ser una CNN con 512 filtros y 8 capas BPNet sobre ventanas de 2.114 pb, la inferencia de un checkpoint individual es ligera en comparacion con modelos de lenguaje, pero no se publican cifras de VRAM ni de latencia.
- Cabe en GPU de consumo: no disponible de forma explicita; no se indica que se haya validado en GPU consumer concretas.
- Opciones de despliegue: carga directa como modulo `bpnetlite.bpnet.BPNet` con la libreria `bpnet-lite`; los flujos de atribucion y MoDISco estan en `src/bpnet` del repositorio `procap-atlas`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas con otros modelos BPNet, Enformer, ChromBPNet u otras alternativas de sequence-to-function. No disponible.

## Limitaciones y advertencias

- Los modelos estan entrenados para secuencia humana GRCh38/hg38 y no se debe asumir transferencia a otras especies.
- Las predicciones son senales de iniciacion tipo PRO-cap cerca de loci de picos entrenados, no estimaciones generales de expresion genica. Secuencias de fondo del genoma o sinteticas completamente nuevas son probablemente OOD y pueden producir comportamientos extranos.
- Centromeros, LTR y otras secuencias repetitivas son problematicos de forma conocida.
- La cobertura de biosamples en ENCODE es desigual; el comportamiento puede variar entre tipos celulares, tejidos, niveles de cobertura y calidad del ensayo. Conviene revisar el metadata y los flags de calidad.
- El rendimiento varia por experimento y profundidad de lectura; hay que inspeccionar los resultados de benchmark por experimento antes de usar un modelo en analisis downstream.
- Son artefactos de investigacion y no deben usarse para toma de decisiones clinicas o diagnosticas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni validacion para produccion; el uso previsto declarado es investigacion en genomica reguladora.
- No es un modelo de lenguaje: no dispone de generacion de texto, codigo, matematicas, vision, tool calling ni capacidades multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adamyhe/procap-atlas-bpnet
- Metadata del atlas: https://huggingface.co/datasets/adamyhe/procap-atlas-metadata
- Dataset de tracks complementario: https://huggingface.co/datasets/adamyhe/procap-atlas-tracks
- Resultados de descubrimiento de motivos: https://huggingface.co/datasets/adamyhe/procap-atlas-motifs
- Repositorio de codigo: https://github.com/kundajelab/procap-atlas
- Track hub de UCSC: https://mitra.stanford.edu/kundaje/oak/ayhe/procap-atlas/hub/hub.txt

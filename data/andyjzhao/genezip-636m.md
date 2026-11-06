# andyjzhao/GeneZip-636M

## Resumen

GeneZip-636M es un modelo de lenguaje de ADN preentrenado, publicado por el autor andyjzhao bajo el nombre definitivo ("Camera Ready") del proyecto GeneZip. No se trata de un checkpoint ajustado para una tarea concreta, sino de pesos de preentrenamiento destinados a servir como base para investigación en modelado de secuencias genómicas y para los recetarios de evaluación DNALongBench del propio proyecto.

El modelo trabaja sobre secuencias de ADN con una ventana de contexto de 12.800 pares de bases (bp) y un objetivo de compresión base de 32 bp por token, lo que implica tokenizar el genoma en unidades de 32 nucleótidos en lugar de operar a nivel de base individual. Los pesos provienen de un checkpoint intermedio del entrenamiento de mayor escala alojado en `jzshared/GeneZip-7R-LT-32BPT-100B-650M` (paso 30.600), con los bytes de peso sin modificar y verificables mediante hash SHA-256.

Su relevancia radica en que los modelos de lenguaje genómico de contexto largo son escasos y este se distribuye con licencia Apache 2.0, trazabilidad criptográfica del origen de los pesos y una configuración Hydra que documenta la arquitectura y el enrutamiento exactos. No es un paquete `AutoModel` de Transformers: requiere el código propio del repositorio GitHub del proyecto para cargarse y ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (configuración Hydra incluida en `hydra_cfg.yaml`; no se detalla en la model card) |
| Parametros totales | 636M (según el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 12.800 bp (pares de bases) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de ADN, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PyTorch (repositorio de 2,5 GB); no es un paquete Transformers `AutoModel` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que `hydra_cfg.yaml` registra "la arquitectura exacta y los límites de enrutamiento" (*architecture and routing bounds*). La mención explícita de "routing" sugiere un diseño con mecanismos de enrutamiento —probablemente mezcla de expertos (MoE) o algún esquema de enrutamiento por token—, pero el documento no confirma la familia arquitectónica ni el número de parámetros activos. El modelo se presenta como un transformer de lenguaje aplicado a ADN, no como SSM ni híbrido, aunque esto tampoco se explicita.

En cuanto al entrenamiento, los datos disponibles son limitados: se conoce la ventana de preentrenamiento (12.800 bp) y el objetivo de compresión base de 32 bp/token, que no debe confundirse con la ratio de compresión medida. El checkpoint de origen (`GeneZip-7R-LT-32BPT-100B-650M`) sugiere, por su nomenclatura, un entrenamiento sobre 100B tokens con 32 bp/token y 650M de parámetros, pero la model card no confirma estos detalles ni documenta el uso de RLHF, DPO ni la composición del corpus genómico. Los pesos liberados corresponden al paso 30.600 de ese entrenamiento y no incluyen estado del optimizador ni ajuste fino posterior.

## Capacidades

- Modelado de secuencias de ADN con contexto largo de 12.800 pares de bases, adecuado para regiones genómicas extensas.
- Tokenización a 32 bp por token, que reduce la longitud de secuencia efectiva frente a modelos a nivel de base.
- Preentrenamiento genérico: sirve como base para ajuste fino en tareas downstream, no como modelo listo para inferencia de tareas específicas.
- Integración con los recetarios de evaluación DNALongBench del proyecto GeneZip.
- Carga mediante el código propio del repositorio GitHub (`ckpt=andyjzhao/GeneZip-636M`), no mediante `AutoModel` de Transformers.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo de lenguaje natural.

## Casos de uso

- **Investigación en modelado genómico de contexto largo**: el modelo permite estudiar cómo representan los transformers regiones de hasta 12.800 bp, útil para analizar dependencias de largo alcance en el genoma.
- **Ajuste fino para predicción de elementos regulatorios**: partiendo de los pesos preentrenados, se puede entrenar una cabeza de clasificación para detectar promotores, enhancers o sitios de unión de factores de transcripción en ventanas largas.
- **Anotación de variantes**: el contexto de 12.800 bp facilita evaluar el impacto de variantes en su entorno genómico, un escenario donde modelos de contexto corto pierden señal.
- **Reproducción de experimentos DNALongBench**: el modelo está pensado para ejecutar los recetarios de evaluación del proyecto, lo que permite comparar resultados con los publicados por los autores.
- **Modelado de regiones no codificantes**: la tokenización a 32 bp/token y el contexto largo son adecuados para secuencias intergénicas e intrónicas, donde la señal está dispersa.
- **Base para modelos especializados en genomas completos**: al ser un checkpoint de preentrenamiento con licencia Apache 2.0, puede servir de inicialización para proyectos que necesiten adaptar un modelo de ADN a especies o tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las comprobaciones cortas de carga ("smoke checks") solo establecen que el modelo carga y se ejecuta, y no constituyen mediciones nuevas de rendimiento en benchmarks completos; remite al mapeo de resultados del código para las ejecuciones adoptadas.

## Requisitos de hardware

- **VRAM estimada**: con 636M parámetros, en FP16 se requieren aproximadamente 1,3 GB solo para pesos; en FP32, unos 2,5 GB. El repositorio ocupa 2,5 GB, coherente con pesos en precisión completa o mixta.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM puede cargar el modelo en FP16; para contexto completo de 12.800 bp y batches mayores se recomiendan GPUs de 16-24 GB (RTX 4090, A10, L4).
- **Consumer GPU**: sí, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB), siempre que se use el código propio del proyecto.
- **Opciones de despliegue**: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el único camino soportado es el repositorio GitHub `AndyJZhao/GeneZip` con la configuración Hydra incluida.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se indican únicamente los ejes en los que podría compararse, sin cifras:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GeneZip-636M | 636M | 12.800 bp | Apache 2.0 | Pesos en Hugging Face, código en GitHub |
| Alternativas de ADN de contexto largo | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **No es un modelo de lenguaje natural**: no procesa texto, sino secuencias de ADN; no debe esperarse comportamiento multilingüe ni conversacional.
- **Checkpoint de preentrenamiento**: no está ajustado para tareas downstream; usarlo directamente para predicciones específicas dará resultados pobres sin ajuste fino.
- **Dependencia de código externo**: no es un paquete `AutoModel` de Transformers; requiere el repositorio GitHub del proyecto y su configuración Hydra, lo que añade fricción de integración y riesgo de incompatibilidades con versiones futuras.
- **Documentación incompleta**: la model card no detalla arquitectura interna, composición del dataset, número de tokens de entrenamiento ni proceso de alineación, lo que limita la evaluación independiente.
- **Riesgo de alucinación**: no aplica en el sentido conversacional, pero un modelo de ADN puede generar secuencias plausibles sin validez biológica; cualquier uso en investigación debe validarse experimentalmente.
- **Sesgos del corpus**: al no documentarse la composición del dataset genómico, se desconoce el sesgo hacia determinadas especies, linajes o regiones del genoma.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un modelo de investigación genómica conviene verificar las obligaciones de atribución y las implicaciones regulatorias del uso de datos genómicos.
- **Trazabilidad**: la integridad de los pesos es verificable mediante el SHA-256 indicado (`e9a8555f...`), pero la model card advierte de que la actualización del código "Camera Ready" se está preparando por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andyjzhao/GeneZip-636M
- Checkpoint de origen: https://huggingface.co/jzshared/GeneZip-7R-LT-32BPT-100B-650M/tree/4bff03564e32f77698630eb64d5361e6eccb1822/checkpoint-30600
- Código del proyecto: https://github.com/AndyJZhao/GeneZip

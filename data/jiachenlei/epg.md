# jiachenlei/EPG

## Resumen

EPG (End-to-End Pixel-space Generative) es un modelo de generacion de imagenes desarrollado por el grupo AMAP-ML (Alibaba) que propone eliminar el VAE (autoencoder variacional) del pipeline de difusion, trabajando directamente en el espacio de pixeles. El trabajo se presenta en el paper "There is No VAE: End-to-End Pixel-Space Generative Modeling via Self-Supervised Pre-Training" (arXiv:2510.12586) y el repositorio de Hugging Face aloja los pesos bajo licencia MIT.

La propuesta central es sustituir el encoder latente tradicional por un preentrenamiento auto-supervisado que permite a un transformer operar sobre parches de pixeles de forma directa. La familia de modelos incluye variantes preentrenadas (RCM-B y RCM-L) y variantes afinadas para generacion (EPG-L, EPG-XL, EPG-XXL y EPG-G), con tamanos que van de 540M a 1391M parametros.

Es relevante porque ataca uno de los cuellos de botella estructurales de los modelos de difusion actuales (la dependencia de un VAE entrenado aparte) y reporta FIDs competitivos en ImageNet-256 y ImageNet-512, con valores de 1.58 a 2.35 en las variantes mas grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre parches de pixeles (pixel-space), sin VAE; encoder y decoder separados en las variantes afinadas |
| Parametros totales | EPG-L: 540M; EPG-XL: 583M; EPG-XXL: 789M; EPG-G: 1391M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 17.7 GB; no se especifica safetensors ni GGUF en la informacion) |

Configuracion de las variantes afinadas (encoder, decoder):

| Modelo | Bloques | Dim | Heads | Parametros |
|---|---|---|---|---|
| EPG-L | 16, 16 | 1024, 1024 | 16, 16 | 540M |
| EPG-XL | 12, 12 | 768, 1584 | 12, 22 | 583M |
| EPG-XXL | 12, 12 | 768, 1920 | 12, 16 | 789M |
| EPG-G | 12, 12 | 768, 2688 | 12, 21 | 1391M |

Configuracion de los modelos preentrenados:

| Modelo | Dataset | Configuracion |
|---|---|---|
| RCM-B | IN-256 | 12 capas, 768 dim, 12 heads, patch 16 |
| RCM-B | IN-512 | 12 capas, 768 dim, 12 heads, patch 32 |
| RCM-L | IN-256 | 16 capas, 1024 dim, 16 heads, patch 16 |

## Arquitectura y entrenamiento

EPG es un modelo generativo de difusion que opera directamente sobre pixeles en lugar de sobre un espacio latente comprimido por un VAE. La innovacion clave es un preentrenamiento auto-supervisado (de ahi las siglas RCM en los modelos base) que dota al transformer de una representacion util del espacio de pixeles antes del afinado generativo. Las variantes afinadas separan explicitamente encoder y decoder, cada uno con su propio numero de bloques, dimension y cabezas, como se detalla en la Tabla 2 de la model card.

El modelo se entrena sobre ImageNet a resoluciones de 256 y 512, con tamanos de parche de 16 o 32 segun la variante. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de ImageNet, ni si se emplearon tecnicas de RLHF o DPO (no aplicables en generacion de imagenes). Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal; el enfasis esta en la eliminacion del VAE mediante preentrenamiento auto-supervisado.

## Capacidades

- Generacion de imagenes en el espacio de pixeles sin VAE intermedio.
- Generacion condicionada por clase (class-conditional) sobre ImageNet-256 e ImageNet-512.
- Dos modos de generacion reportados: diffusion models (DM) y consistency models (CM).
- Preentrenamiento auto-supervisado reutilizable como base para afinado generativo.
- Soporte de distintas resoluciones mediante cambio de tamano de parche (16 o 32).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo linguistico.
- No se reportan capacidades de vision por comprension (VLM), audio ni thinking mode.

## Casos de uso

- Generacion de imagenes sinteticas a resolucion 256x256: las variantes EPG-XL, EPG-XXL y EPG-G estan afinadas para diffusion en ImageNet-256 con FIDs de 2.04, 1.87 y 1.58 respectivamente, lo que las hace adecuadas para experimentacion en generacion condicionada por clase.
- Generacion a resolucion 512x512: EPG-L/32 esta afinado para ImageNet-512 con FID 2.35, util para pipelines que necesitan mayor resolucion sin VAE.
- Investigacion en eliminacion del VAE: el modelo sirve como referencia reproducible para estudiar generacion end-to-end en pixeles frente a pipelines latentes clasicos.
- Generacion rapida con consistency models: EPG-L/16 en modo CM sobre ImageNet-256 (FID 8.82) permite muestreo de pocos pasos, adecuado para prototipado interactivo.
- Base para afinado en dominios especificos: los modelos preentrenados RCM-B y RCM-L pueden reutilizarse como inicializacion para tareas de generacion en otros datasets, gracias al preentrenamiento auto-supervisado.
- Benchmarking academico: comparacion de FID entre variantes de tamano (L, XL, XXL, G) para estudiar escalado en modelos generativos de pixeles.
- Experimentos de destilacion o compresion: la separacion encoder/decoder y la variedad de configuraciones facilitan estudios de eficiencia computacional.

## Benchmarks y rendimiento

Resultados reportados en la model card (FID, menor es mejor):

| Modelo | Tarea | FID |
|---|---|---|
| EPG-XL/16 | DM en IN-256 | 2.04 |
| EPG-XXL/16 | DM en IN-256 | 1.87 |
| EPG-G/16 | DM en IN-256 | 1.58 |
| EPG-L/32 | DM en IN-512 | 2.35 |
| EPG-L/16 | CM en IN-256 | 8.82 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, al no ser un modelo linguistico. Tampoco se aportan comparaciones numericas directas con otros modelos generativos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, un modelo de 540M a 1391M parametros en precision FP16 requiere del orden de 1,1 a 2,8 GB solo para pesos, mas activaciones y buffers de muestreo que dependen de la resolucion y del numero de pasos.
- GPU recomendadas: no especificadas en la informacion. Por tamano, cabria esperar viabilidad en GPUs consumer (RTX 3090, RTX 4090) para las variantes L y XL, y necesidad de A100/H100 para las variantes XXL y G en lotes grandes o resolucion 512.
- Cabe en GPU consumer: probablemente si para EPG-L y EPG-XL en FP16 con lotes pequenos; no confirmado por el autor.
- Opciones de despliegue: no se indican en la model card (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a generacion de imagenes). El codigo esta disponible en el repositorio de GitHub del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de comparaciones directas con otros modelos generativos de pixeles o latentes (por ejemplo, DiT, SiT o LDM). La model card solo aporta FIDs internos de la propia familia EPG. Por tanto, la comparativa con alternativas externas se considera no disponible.

| Modelo | Parametros | Contexto | FID IN-256 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EPG-G/16 | 1391M | no aplica | 1.58 | MIT | Hugging Face |
| EPG-XXL/16 | 789M | no aplica | 1.87 | MIT | Hugging Face |
| EPG-XL/16 | 583M | no aplica | 2.04 | MIT | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de generacion de imagenes: no es un modelo de lenguaje ni un VLM, por lo que no debe evaluarse con benchmarks de texto ni usarse para tareas linguisticas.
- Entrenado sobre ImageNet: el dominio esta limitado a las clases de ImageNet; el rendimiento fuera de ese dataset no esta documentado.
- Sesgos conocidos: no se documentan en la model card, pero al entrenar sobre ImageNet es esperable heredar los sesgos de representacion de dicho dataset.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir imagenes incoherentes o artefactos, especialmente en variantes pequenas o con pocos pasos de muestreo (el modo CM reporta FID 8.82, notablemente peor que DM).
- Limitaciones de contexto o idioma: no aplica en el sentido linguistico; no se documentan capacidades multilingues.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribucion; no obstante, conviene revisar las condiciones de los datos de entrenamiento (ImageNet) para uso comercial de las imagenes generadas.
- Caveats para produccion: no se documentan requisitos de hardware, latencia ni formatos de pesos; el repo es de 17.7 GB y el pipeline no esta especificado en Hugging Face, lo que anade friccion a la integracion.
- Numero de descargas muy bajo (7) y 0 likes: ecosistema practicamente sin validacion externa, lo que incrementa el riesgo de reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/jiachenlei/EPG
- Paper (arXiv): https://arxiv.org/pdf/2510.12586
- Project page: https://amap-ml.github.io/EPG/
- Codigo (GitHub): https://github.com/AMAP-ML/EPG

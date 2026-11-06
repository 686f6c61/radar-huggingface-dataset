# oteam/solublempnn-noise010

## Resumen

SolubleMPNN es una implementación no oficial del modelo ProteinMPNN, publicada por el equipo de OFoldX (OTeam) en Hugging Face, especializada en el diseño de secuencias de proteínas solubles condicionado a un esqueleto (backbone) fijo. Se trata de una red neuronal de paso de mensajes (message-passing neural network) autoregresiva que resuelve la tarea de *inverse folding*: dada una estructura tridimensional de proteína, genera secuencias de aminoácidos plausibles que se plieguen en esa geometría. La variante aquí descrita incorpora un ruido de entrenamiento de 0,10 Å sobre las coordenadas del backbone.

El modelo es relevante porque el diseño computacional de proteínas es una de las aplicaciones más maduras del aprendizaje profundo en biología estructural. ProteinMPNN, publicado originalmente en *Science* en 2022 por el grupo de David Baker, se ha convertido en una herramienta de referencia en la comunidad. Esta implementación de OFoldX empaqueta el modelo en la librería `ofoldx`, con pipelines listos para diseño y puntuación de secuencias, lo que reduce la fricción de integración en flujos de trabajo de diseño de proteínas.

Con 1.673.592 parámetros (aproximadamente 1,67 M), es un modelo extremadamente compacto en comparación con los LLM, pero altamente especializado: opera sobre grafos de vecinos espaciales de residuos y no sobre secuencias de texto. No dispone de ventana de contexto en el sentido lingüístico; su "contexto" es el conjunto de residuos vecinos (48 vecinos por defecto) en el grafo espacial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (MPNN) autoregresiva sobre grafo espacial de residuos; 3 bloques de encoder y 3 de decoder, hidden size 128 |
| Parametros totales | 1.673.592 (1,674 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre grafos de 48 vecinos por residuo; no hay contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SolubleMPNN emplea una arquitectura de red de paso de mensajes (MPNN) que representa cada residuo de la proteína como un nodo en un grafo de vecinos espaciales (k = 48 vecinos por defecto). El encoder procesa la geometría del backbone —átomos N, CA, C y O en la variante estándar— mediante tres bloques de message passing con un tamaño oculto de 128. El decoder genera la secuencia de aminoácidos de forma autoregresiva, decodificando residuos en un orden causal muestreado. Esta estrategia permite condicionar la generación sobre posiciones fijas, identidades ligadas, restricciones de aminoácidos específicas por posición y perfiles de secuencia.

El entrenamiento se realiza mediante *sequence recovery* autoregresivo: el modelo debe recuperar la identidad de los aminoácidos a partir de la geometría del backbone, con perturbaciones de coordenadas para aumentar la robustez. La variante "soluble" se entrena sobre un conjunto de proteínas solubles, con el objetivo de favorecer secuencias con mayor solubilidad. Los datos de entrenamiento del ejemplo oficial corresponden a ensamblados biológicos del PDB de 2 de agosto de 2021, con cadenas proteicas agrupadas al 30 % de identidad de secuencia. Esta variante concreta aplica un ruido de 0,10 Å sobre las coordenadas durante el entrenamiento. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Diseño de secuencias de proteínas (*inverse folding*) condicionado a un backbone fijo, con soporte para posiciones fijas y restricciones por posición.
- Puntuación de secuencias: cálculo de log-verosimilitud negativa (NLL) global y por residuo en nats por residuo.
- Generación con múltiples órdenes de decodificación (`num_decoding_orders`) para muestrear diversidad de secuencias.
- Soporte de identidades ligadas (tied identities) entre posiciones.
- Soporte de perfiles de secuencia y restricciones específicas de aminoácidos por posición.
- Integración con un *packer* MPNN independiente para generar coordenadas de cadenas laterales tras el diseño de secuencia (pipeline `ProteinMpnnDesignAndPackPipeline`).
- Capacidad de ejecución por etapas (`prepare`, `forward`, `postprocess`) en pipelines de OFoldX.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo biológico especializado.

## Casos de uso

- Diseño de proteínas solubles de novo: dado un backbone generado por un modelo de difusión o de diseño estructural, SolubleMPNN propone secuencias de aminoácidos que se plieguen en esa geometría y favorezcan la solubilidad, reduciendo la tendencia a la agregación en proteínas recombinantes.
- Rediseño de superficies para mejorar la expresión: partiendo de una estructura cristalográfica, se fijan las posiciones del núcleo hidrofóbico y se rediseñan las posiciones superficiales con restricciones de aminoácidos para aumentar la solubilidad sin alterar el plegamiento.
- Puntuación de variantes en pipelines de cribado: el modo `score` calcula la NLL por residuo, lo que permite priorizar entre múltiples candidatos generados por distintos diseñadores antes de pasar a validación experimental.
- Ingeniería de enzimas: rediseño de secuencias manteniendo el sitio activo fijo (posiciones fijas) y permitiendo variación en el resto de la estructura para explorar espacio de secuencia compatible con la geometría catalítica.
- Diseño de bibliotecas de proteínas de unión: combinado con modelos de predicción de estructura (p. ej. AlphaFold) en un bucle de diseño-predicción-validación, SolubleMPNN genera secuencias candidatas para *binders* cuyo esqueleto ya ha sido modelado.
- Integración en flujos de trabajo automatizados de diseño de proteínas: la API de pipelines de `ofoldx` permite encadenar diseño de secuencia y *packing* de cadenas laterales, lo que facilita su inclusión en scripts de generación masiva de candidatos y en plataformas de diseño computacional.
- Filtrado de secuencias en experimentos de *directed evolution* computacional: usar la NLL como métrica de compatibilidad estructura-secuencia para descartar candidatos poco plausibles antes de sintetizar la biblioteca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 1,67 M de parámetros, los pesos en fp32 ocupan aproximadamente 6,7 MB; el consumo dominante proviene de las activaciones del grafo y del tamaño del backbone de entrada, no del modelo.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es viable incluso en CPU para backbones de tamaño moderado. Para lotes grandes de backbones, una RTX 4090 o A100 aceleran el proceso, pero no son necesarias por capacidad de memoria.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060 y superiores, así como en iGPU y CPU.
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx) es la vía oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Backbone | Ruido de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SolubleMPNN (este) | 1,674 M | N, CA, C, O | 0,10 Å | AGPL-3.0 | Hugging Face (oteam) |
| ProteinMPNN (oteam) | 1,674 M | N, CA, C, O | 0,02 / 0,10 / 0,20 / 0,30 Å | AGPL-3.0 | Hugging Face (oteam) |
| ProteinMPNN CA-only (oteam) | 1,642 M | CA | 0,02 / 0,10 / 0,20 Å | AGPL-3.0 | Hugging Face (oteam) |
| ProteinMPNN oficial (dauparas) | ~1,7 M | N, CA, C, O | 0,02 / 0,10 / 0,20 / 0,30 Å | MIT (repo original) | GitHub |

La diferencia principal entre SolubleMPNN y ProteinMPNN estándar es el conjunto de entrenamiento: la variante soluble prioriza proteínas solubles, lo que puede traducirse en secuencias con mejor comportamiento en expresión heteróloga. La variante CA-only reduce la información geométrica de entrada a un único átomo por residuo, lo que la hace más adecuada cuando solo se dispone de trazas CA (por ejemplo, de predicciones de baja resolución). No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: el equipo de ProteinMPNN original no ha validado ni escrito esta model card; los resultados pueden diferir de los del repositorio oficial.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte. El uso comercial en productos o servicios en red puede requerir la liberación del código fuente derivado; es necesario revisar con cuidado antes de integrarlo en producción propietaria. El repositorio oficial de ProteinMPNN usa licencia MIT, lo que puede ser preferible para uso comercial.
- Riesgo de secuencias no funcionales: el modelo optimiza compatibilidad estructura-secuencia, no función biológica; las secuencias generadas requieren validación experimental.
- Sesgo hacia proteínas solubles: al entrenarse sobre proteínas solubles, puede tener menor rendimiento en proteínas de membrana o en entornos no acuosos.
- Dependencia de la calidad del backbone: la precisión del diseño depende críticamente de la exactitud de las coordenadas de entrada; backbones mal modelados producen secuencias poco fiables.
- Sin capacidades lingüísticas ni de propósito general: no es un LLM; no soporta texto, código, tool calling ni agentes.
- Sin datos publicados de benchmarks en esta variante concreta: no es posible comparar su rendimiento numérico con el modelo oficial sin evaluaciones adicionales.
- Idiomas soportados no disponibles: irrelevante para la tarea, pero el campo no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/solublempnn-noise010
- Variante base SolubleMPNN: https://huggingface.co/oteam/solublempnn
- Variantes de ruido: https://huggingface.co/oteam/solublempnn-noise002, https://huggingface.co/oteam/solublempnn-noise020, https://huggingface.co/oteam/solublempnn-noise030
- ProteinMPNN estándar (oteam): https://huggingface.co/oteam/proteinmpnn
- Variante CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Documentación de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- Instrucciones de entrenamiento oficial: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
- Librería ofoldx: https://ofoldx.valtech.ai/

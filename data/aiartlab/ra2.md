# AiArtLab/ra2

## Resumen

Ra2 es un modelo de difusión latente texto-a-imagen desarrollado por AiArtLab y publicado en Hugging Face bajo licencia MIT. Se trata de la segunda generación del diseño Ra, en la que el transformador ya no incluye un refinador en espacio de píxeles: el modelo es un difusor latente puro y la imagen se decodifica mediante un VAE asimétrico independiente (codificador f8 / decodificador f16) que genera 512×512 a partir de un latente de 32×32.

El cuerpo del modelo es un U-transformer piramidal de 240M de parámetros (40 bloques) que aplica flow matching en un latente de 8× de compresión y 32 canales. El codificador de texto es Ettin-150M congelado, con un mezclador de capas aprendible de 10M de parámetros. El total de parámetros del repositorio asciende a 250.084.903 según el fichero safetensors.

Es relevante como artefacto de investigación: demuestra un pipeline completo de entrenamiento desde cero (difusión latente con flow matching, VAE asimétrico, grafting de bloques con inicialización a cero y PE 2D absolutas) sobre un conjunto de datos muy reducido. El propio autor lo califica de etapa de investigación, no de modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-transformer piramidal (latent diffusion) con flow matching; VAE asimetrico separado (AsymmetricAutoencoderKL) |
| Parametros totales | 250.084.903 (240M cuerpo + 10M mezclador de capas del text encoder; VAE y text encoder incluidos en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin contexto de texto definido) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El cuerpo es una pila en U con 40 bloques: nivel L0 con 6 convoluciones y 8 atenciones, L1 con 9 bloques, L2 con 9 y L3 con 4, con anchuras que crecen de 192 a 512, 1024 y 1536. La anchura crece a medida que se reducen los tokens, de modo que la atención costosa opera sobre 16–64 tokens mientras la rejilla de 1024 tokens mantiene convoluciones 3×3; las conexiones residuales reincorporan cada nivel en el decodificador. Un bloque de atención L0 cuesta 0,86 GMAC (3,9% del cuerpo) con 0,37M de parámetros, motivo por el que se añadieron bloques a resolución completa en lugar de en profundidad. Las posiciones combinan RoPE 2D dentro de la atención con un embedding absoluto 2D sin/cos proyectado a la anchura del nivel mediante una capa lineal inicializada a cero, lo que permite injertar bloques nuevos sobre un modelo entrenado sin alterar su salida (verificado bit a bit con `Body.graft`).

El entrenamiento se organizó en cuatro etapas: (1) FLUX-Reason-6M a 256² con el AE antiguo f8c32 y un refinador en espacio de píxeles de 23,9M, 560.142 pasos; (2) mismos datos con grafting de capacidad de 26 a 36 bloques y rama de PE absolutas, 404.000 pasos; (3) cambio al VAE asimétrico (latente 32×32 → 512²), pérdida solo en espacio latente y shard MJ, 5.000 pasos; (4) fine-tune mariposa con 966 imágenes, grafting de 36 a 40 bloques con inicialización a cero (3+3 atenciones L0) y EMA, 25.000 pasos. El checkpoint incluido en `transformer/` corresponde a la etapa 4 (paso 61.000 del contador actual). El muestreo usa 16 pasos Euler con CFG 2,5.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 a partir de un latente de 32×32.
- Flow matching en espacio latente con pérdida MSE pura; sin refinador en espacio de píxeles.
- Decodificación mediante VAE asimétrico (codificador f8, decodificador f16) con 32 canales latentes.
- Condicionamiento de texto mediante Ettin-150M congelado con mezclador de capas aprendible.
- Inyección de posiciones 2D (RoPE + embedding absoluto sin/cos) compatible con grafting de bloques.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo se entrenó con leyendas de tres palabras.
- Generación de texto: no aplica (modelo exclusivamente de imagen).

## Casos de uso

- Investigación en difusión latente: reproducción del pipeline completo (flow matching, VAE asimétrico, grafting de bloques) sobre un conjunto de datos controlado, útil para estudiar dinámicas de entrenamiento desde cero.
- Estudio de VAE asimétricos: el repo incluye un AsymmetricAutoencoderKL con codificador f8 y decodificador f16, empleable para analizar el compromiso entre compresión latente y detalle fino en 512×512.
- Experimentos de grafting de capacidad: la inicialización a cero de bloques nuevos y la verificación bit a bit permiten estudiar cómo escalar un transformer entrenado sin degradar su salida.
- Generación de especímenes de mariposa para ilustración científica: el checkpoint está ajustado sobre 966 imágenes de mariposas y produce salidas dentro de ese dominio (por ejemplo, `butterfly, Troides hypolitus`).
- Base para fine-tuning en dominios estrechos: al ser un modelo pequeño (240M en el cuerpo) y con licencia MIT, sirve como punto de partida para ajustar sobre colecciones de imágenes reducidas con leyendas cortas.
- Docencia y divulgación: el tamaño reducido y el código de entrenamiento incluido (`src/train.py`, `run.sh`) lo hacen adecuado para explicar un pipeline de difusión latente de principio a fin.
- Pruebas de integración con diffusers: al publicarse como pipeline text-to-image en la librería diffusers, permite validar flujos de carga, muestreo y decodificación en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 250M de parámetros totales y pesos en fp32 (repo de 1,0 GB) la inferencia cabe holgadamente en GPUs de consumo, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una RTX 4090 o superior es más que suficiente, y previsiblemente también GPUs de gama media.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (250M de parámetros, repo de 1,0 GB); no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: librería diffusers (pipeline text-to-image); el repo incluye `src/sample.py` para muestreo por línea de comandos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles. El muestreo por defecto usa 16 pasos Euler con CFG 2,5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ra2 (AiArtLab) | 250M (cuerpo 240M) | 512×512 desde latente 32×32 | MIT | Hugging Face, diffusers | Entrenado desde cero, dominio restringido a mariposas |
| FLUX.1 (Black Forest Labs) | no disponible en la información | no disponible | no disponible | no disponible | Usado como fuente de datos (FLUX-Reason-6M) en la etapa 1 de Ra2 |
| Ettin-150M (jhu-clsp) | 150M | no disponible | MIT | Hugging Face | Codificador de texto congelado incluido en Ra2 |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: solo mariposas; 966 imágenes de entrenamiento con leyendas de tres palabras.
- Deriva de color hacia estereotipos de especies saturadas; el patrón de venas es aproximado, no fiel.
- Sin renderizado de texto, sin rostros y sin escenas generales.
- Artefacto de investigación sin ajuste de seguridad (no safety tuning).
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir especímenes inexistentes o morfologías incorrectas.
- Sesgos conocidos: no documentados explícitamente más allá de la deriva de color y la sobrerrepresentación del dominio de entrenamiento.
- Limitaciones de idioma: no disponibles; las leyendas de entrenamiento son de tres palabras.
- Licencia MIT para el código y los pesos propios (`src/`, `transformer/`); el VAE incluido es AsymmetricAutoencoderKL y el codificador de texto es MIT. No se documentan restricciones adicionales para uso comercial, pero el autor advierte que no es un modelo de propósito general.
- El checkpoint corresponde a la etapa 4 de un pipeline de investigación (paso 61.000), no a un modelo final pulido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiArtLab/ra2
- Codificador de texto Ettin-150M: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Dataset de entrenamiento citado (FLUX-Reason-6M): no disponible como enlace en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada

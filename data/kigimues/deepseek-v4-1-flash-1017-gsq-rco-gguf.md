# kigimues/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF

## Resumen

Este repositorio no es un modelo nuevo, sino una colección de cuantizaciones GGUF no uniformes del modelo **DeepSeek-V4.1-Flash-1017** de DeepSeek AI, publicadas por el laboratorio IST-DASLab (Institute of Science and Technology Austria) bajo el usuario de Hugging Face kigimues. El modelo base es un MoE disperso de 763.200 millones de parámetros con 384 expertos enrutados por capa, de los cuales 6 se activan por token, y una ventana de contexto de 1 millón de tokens. Las cuantizaciones se han producido con dos métodos desarrollados en DASLab: GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization).

El problema que resuelve esta ficha es la inferencia local de un modelo gigantesco: las cuantizaciones no uniformes asignan un tipo de cuantización distinto a cada tensor según su sensibilidad (mediante una búsqueda basada en gradientes sujeta a un presupuesto de tamaño), en lugar de aplicar un único formato a todo el modelo. Esto permite reducir el modelo a entre 231 y 266 GB, con tres niveles disponibles: IQ1_M (1,75 bpw), IQ2_XXS (2,00 bpw) e IQ2_XS (2,25 bpw). Según el README, combinado con la herramienta Strata, cada build puede ejecutarse en una única GPU con 12 GB de VRAM.

Es relevante ahora porque demuestra que la cuantización extrema (por debajo de 2 bits) puede mantener un rendimiento cercano al modelo base en benchmarks como AIME25, GPQA-Diamond y LiveCodeBench v6, siendo desplegable en formatos estándar GGUF compatibles con llama.cpp (build b11870 o superior). El repositorio acumula 341 descargas y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (transformer), 384 expertos enrutados por capa, 6 activos por token |
| Parametros totales | 763.200 millones (backbone: 551.900 millones + tablas Engram: 196.600 millones) |
| Parametros activos | no disponible (6 expertos activos por token; total de parametros activos no publicado) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | IQ1_M (1,75 bpw), IQ2_XXS (2,00 bpw), IQ2_XS (2,25 bpw) para el backbone; IQ4_NL (4,50 bpw) para las tablas Engram |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (no uniforme, un tipo de cuantizacion por tensor) |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash-1017 es un modelo de mezcla de expertos (MoE) disperso con 763.200 millones de parametros totales, de los cuales 551.900 millones corresponden al backbone del transformer y 196.600 millones a dos tablas de busqueda "Engram" (tablas de lookup, no pesos de matmul). Cada capa tiene 384 expertos enrutados, de los cuales 6 se activan por token. La ventana de contexto es de 1 millón de tokens. Los datos sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no están disponibles en la informacion proporcionada.

La innovacion principal de este repositorio está en la cuantizacion, no en el modelo base. **GSQ** (Gumbel-Softmax Quantization) realiza cuantizacion escalar post-training que aprende conjuntamente las asignaciones de grid por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax, cerrando gran parte de la brecha entre cuantizacion escalar y vectorial en el rango de 2 a 3 bits, manteniendo compatibilidad con formatos escalares estandar como GGUF. **RCO** (Riemannian Constrained Optimization) asigna uno de K tipos de cuantizacion a cada uno de los N tensores bajo un presupuesto total de tamaño, reformulando la restriccion como una variedad de Riemann suave en espacio de logits, lo que permite optimizacion por gradiente directamente sobre la funcion de perdida de la tarea sin ajuste de hiperparametros especificos de la restriccion. Como los expertos enrutados dominan el recuento de parametros, la busqueda asigna el tipo de cuantizacion por capa (no por experto, cosa que GGUF no puede expresar). Las tablas Engram se cuantizan a tipo fijo IQ4_NL y quedan excluidas de la busqueda.

## Capacidades

- Generacion de texto y conversacion (pipeline text-generation, etiqueta conversational).
- Razonamiento matematico: el README muestra evaluaciones en AIME25.
- Conocimiento cientifico: evaluado en GPQA-Diamond.
- Generacion y comprension de codigo: evaluado en LiveCodeBench v6.
- Contexto ultra-largo: ventana de 1 millón de tokens.
- Soporte de imagenes: los archivos cargan "including images" en llama.cpp b11870 o superior, lo que sugiere capacidad multimodal de entrada visual (detalles no disponibles).
- Tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- **Inferencia local de un MoE gigante en hardware modesto**: combinado con Strata, cada build funciona en una única GPU de 12 GB de VRAM, lo que permite a desarrolladores individuales ejecutar un modelo de 763B sin clusters.
- **Razonamiento matematico avanzado**: el modelo base se evalua en AIME25, por lo que es adecuado para resolver problemas de nivel olimpiada matematica en flujos de trabajo de investigacion o educacion.
- **Generacion y revision de codigo**: la evaluacion en LiveCodeBench v6 indica idoneidad para asistentes de programacion, revision de pull requests y generacion de codigo en pipelines de desarrollo.
- **Consulta y analisis de documentos extensos**: con 1M de tokens de contexto, puede procesar bases de codigo completas, expedientes legales o corpus cientificos en una sola sesion.
- **Investigacion en cuantizacion**: los metodos GSQ y RCO, con codigo abierto disponible, sirven como referencia para estudiar cuantizacion no uniforme a extremos bajos (1,75-2,25 bits).
- **Despliegue autoservicio con llama.cpp**: los archivos son GGUF estandar, integrables en stacks locales de inferencia sin dependencias propietarias, con actualizacion in-place de descargas previas mediante script (solo 80 KB de descarga).
- **Comparativa de niveles de precision**: al disponer de tres builds (IQ1_M, IQ2_XXS, IQ2_XS) que comparten el archivo Engram, es facil evaluar el trade-off tamaño/calidad en infraestructura propia.

## Benchmarks y rendimiento

El README incluye una grafica comparativa del modelo base frente a las cuantizaciones GSQ-RCO en AIME25, GPQA-Diamond y LiveCodeBench v6 (assets/plots/DeepSeek-V4.1-Flash-1017-benchmarks_bars.png), e indica que IQ2_XXS es el build "recomendado" y "el mas cercano al modelo base". Sin embargo, no se publican los valores numericos en el texto de la model card, por lo que no se pueden reproducir aqui:

| Benchmark | Modelo base | IQ1_M | IQ2_XXS | IQ2_XS |
|---|---|---|---|---|
| AIME25 | valores numericos no disponibles (ver grafica en el repo) | no disponible | no disponible | no disponible |
| GPQA-Diamond | no disponible | no disponible | no disponible | no disponible |
| LiveCodeBench v6 | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM y almacenamiento**: los tres builds son demasiado grandes para VRAM directa en la mayoria de configuraciones; los tamaños totales son 231,32 GB (IQ1_M), 248,84 GB (IQ2_XXS) y 265,83 GB (IQ2_XS), de los cuales 110,60 GB corresponden siempre al archivo Engram compartido.
- **Ejecucion en una sola GPU de 12 GB**: segun el README, con la herramienta [Strata](https://github.com/Niko1221/Strata) cada build funciona en una única GPU con 12 GB de VRAM (presumiblemente con descarga parcial a CPU/disco; los detalles tecnicos de Strata no estan disponibles).
- **Configuracion clasica multi-GPU**: para alojar 231-266 GB en VRAM se necesitarian multiples aceleradoras (por ejemplo, un nodo con varias A100/H100 de 80 GB); no se especifican configuraciones concretas.
- **Consumer GPUs**: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) de forma convencional; la via soportada es Strata con 12 GB de VRAM.
- **Despliegue**: llama.cpp build [b11870](https://github.com/ggml-org/llama.cpp/releases/tag/b11870) o superior, enlazando el archivo Engram como shard 6 de cada build. No se mencionan vLLM, TGI ni Ollama.
- **Latencia y throughput**: no disponibles.
- **Actualizacion de descargas previas**: los usuarios de las versiones antiguas pueden regenerar los archivos localmente con convert_ds41_upstream.py sin volver a descargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 GSQ-RCO (este repo) | 763,2B (551,9B backbone + 196,6B Engram) | 1M tokens | GGUF no uniforme, 1,75-2,25 bpw | MIT | Cuantizacion extrema con GSQ/RCO; ejecutable con Strata en 12 GB VRAM |
| DeepSeek-V4.1-Flash-1017 (base) | 763,2B | 1M tokens | no disponible | no disponible | Modelo original de deepseek-ai, referencia de calidad |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se han identificado cuantizaciones comparables de este modelo en la informacion disponible |

## Limitaciones y advertencias

- **Cuantoizacion extrema**: a 1,75-2,25 bits de media existe inevitablemente degradacion de calidad respecto al modelo base; solo IQ2_XXS se describe como "el mas cercano al modelo base". Verificar con la grafica de benchmarks del repo antes de usar en produccion.
- **Complejidad de despliegue**: requiere llama.cpp b11870+ y la gestion del archivo Engram compartido mediante enlaces simbolicos como shard 6; un error de configuracion impide la carga.
- **Dependencia de Strata**: la afirmacion de ejecucion en 12 GB de VRAM depende de una herramienta externa cuyos detalles y limitaciones (throughput, latencia, uso de RAM/disco) no se documentan en la model card.
- **Sesgos y alucinaciones**: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible; como todo LLM grande, deben asumirse riesgos de alucinacion en produccion.
- **Idiomas**: los idiomas soportados no estan especificados en la model card.
- **Tipos de cuantizacion por capa, no por experto**: GGUF no permite asignar precision por experto individual, lo que limita la granularidad de la busqueda de RCO.
- **Licencia**: MIT, sin restricciones para uso comercial, aunque conviene verificar la licencia del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 para el despliegue final.
- **Repositorio de terceros**: la cuantizacion no es oficial de DeepSeek AI; los resultados de calidad dependen del metodo GSQ/RCO de IST-DASLab.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/kigimues/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper RCO (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Laboratorio IST-DASLab: https://github.com/IST-DASLab
- Strata (herramienta de despliegue en 12 GB VRAM): https://github.com/Niko1221/Strata
- llama.cpp b11870 (version minima requerida): https://github.com/ggml-org/llama.cpp/releases/tag/b11870

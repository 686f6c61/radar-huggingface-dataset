# hellnahbru/Carbon-8B-preserved-20261029

## Resumen

Carbon-8B es un modelo fundacional generativo de ADN desarrollado por el equipo de HuggingFaceBio, siendo el hermano mayor de 8 mil millones de parámetros del modelo Carbon-3B. A diferencia de los LLM convencionales, este modelo está especializado en secuencias biológicas (ADN y ARN), con foco principal en organismos eucariotas. Resuelve el problema de modelar y generar secuencias genómicas a gran escala, permitiendo tareas como generación de secuencias, scoring de variantes y análisis genómico con control a nivel de par de bases.

Su relevancia radica en la creciente demanda de modelos fundacionales para biología computacional que puedan manejar contextos genómicos largos. Carbon-8B utiliza un tokenizador híbrido (6-mer para ADN + BPE de Qwen3 para texto), arquitectura decoder-only autoregresiva basada en Llama y soporta de forma nativa 32.768 tokens de contexto (aproximadamente 196 kbp), ampliables hasta 128 k tokens con YaRN. Está publicado bajo licencia Apache 2.0 en formato safetensors, lo que facilita su adopción tanto en investigación como en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only autoregresivo (LlamaForCausalLM) |
| Parametros totales | 8.255.705.088 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (~196 kbp); ampliable a 128 k tokens (~786 kbp) con YaRN 4x |
| Tipos de cuantizacion | no disponible (publicado en bfloat16) |
| Idiomas soportados | Secuencias de ADN/ARN (tokenizador hibrido 6-mer ADN + BPE Qwen3 para texto en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16,5 GB) |

## Arquitectura y entrenamiento

Carbon-8B emplea una arquitectura transformer decoder-only estandar (LlamaForCausalLM), lo que garantiza compatibilidad directa con el ecosistema de Hugging Face. Su innovacion mas destacable es el tokenizador hibrido: cada token de ADN codifica 6 pares de bases (6-mer no solapado, con un vocabulario de 4.096 combinaciones posibles), mientras que reutiliza el tokenizador BPE de Qwen3 para texto en ingles. Esto permite que el modelo procese secuencias genomicas de forma eficiente (6 bp por token frente a 1 bp de enfoques por nucleotido) sin perder la capacidad de integrar anotaciones textuales.

El pre-entrenamiento se realizo sobre el corpus `HuggingFaceBio/carbon-pretraining-corpus` con 1 billon (1T) de tokens 6-mer, equivalente a aproximadamente 6 billones (6T) de pares de bases. La mezcla de datos se mantuvo tambien en la fase de decay: 70 % de datos eucariotas de generador con metadatos y dropout, 16 % de mRNA, 4 % de mRNA de splicing y 10 % de datos procariotas. El entrenamiento uso schedule coseno de learning rate, GBS=512, secuencias de 8.192 tokens (4,19 M tokens por paso), en 32 nodos con TP=4 y DP=64, en bfloat16 con AdamW. Tras 100 B de tokens, la funcion de perdida conmuta de cross-entropy a FNS (Factorized Nucleotide Supervision), una tecnica que permite ensamblar cada 6-mer generado a partir de seis distribuciones por posicion, ofreciendo control a nivel de par de bases durante la generacion. Adicionalmente, un stage de extension de contexto largo amplio la ventana nativa de 8.192 a 32.768 tokens.

## Capacidades

- Generacion autoregresiva de secuencias de ADN con control a nivel de par de bases (via revision `fns` con FNS)
- Scoring de secuencias genomicas: calculo de log-probabilidad media por base para evaluar la verosimilitud de secuencias de referencia frente a variantes perturbadas
- Manejo de contextos genomicos largos: 196 kbp nativos, hasta 786 kbp con YaRN
- Procesamiento de entradas de ADN envueltas en etiquetas `<dna>...</dna>` (longitud multiplo de 6 bp)
- Comprension de texto en ingles gracias al tokenizador hibrido Qwen3 BPE, util para prompts con metadatos o anotaciones
- Generacion determinista (greedy) y muestreo con control de temperatura/top-p a nivel de nucleotido en la revision `fns`
- Mascara por posicion y conteo exacto de pares de bases en la generacion
- No hay evidencia de soporte para tool calling, agentes ni capacidades de vision o audio

## Casos de uso

- Evaluacion in silico de variantes geneticas: mediante `score_sequence()` se puede comparar la log-probabilidad del modelo entre una secuencia de referencia y una variante perturbada, priorizando variantes candidatas en estudios de asociacion o interpretacion de VUS (variantes de significado desconocido).
- Generacion de secuencias regulatorias sinteticas: disenar promotores o elementos regulatorios eucariotas de novo, aprovechando el control por posicion de FNS para fijar nucleotidos concretos y dejar que el modelo complete el resto.
- Analisis de regiones genomicas largas: con 196 kbp de contexto nativo (y hasta ~786 kbp con YaRN), el modelo puede procesar loci completos, incluyendo regiones intergenicas y estructuras de splicing.
- Modelado de expresion de mRNA: la mezcla de entrenamiento incluye un 16 % de mRNA y 4 % de mRNA de splicing, lo que lo hace adecuado para tareas de scoring de transcritos y analisis de sitios de splicing.
- Investigacion en biologia computacional como baseline: al ser un modelo fundacional abierto (Apache 2.0), sirve como punto de partida para fine-tuning en tareas downstream como clasificacion de elementos funcionales o prediccion de efectos de mutaciones.
- Pipelines de cribado genomico a gran escala: el tokenizador 6-mer reduce a la sexta parte la longitud efectiva de las secuencias, acelerando el scoring masivo de bibliotecas de variantes frente a enfoques por nucleotido.
- Integracion de metadatos textuales: gracias al tokenizador hibrido con componente BPE de Qwen3, se pueden condicionar las generaciones con anotaciones en ingles sobre la muestra o el organismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al technical report en bioRxiv y a la model card de Carbon-3B para el protocolo de evaluacion completo, pero no incluye metricas concretas en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,5 GB solo para los pesos (coincide con el tamano del repositorio), mas la memoria para activaciones y KV-cache; en la practica se recomienda una GPU con 24 GB de VRAM
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 para cargas de trabajo con contextos largos o batch elevado
- Es viable ejecutarlo en una GPU de consumo de gama alta (RTX 3090/4090 de 24 GB) en bfloat16 para inferencia con contextos moderados; con contextos de 32 k tokens el KV-cache puede requerir optimizaciones
- Opciones de despliegue: transformers de Hugging Face (uso nativo documentado), text-generation-inference y endpoints de Hugging Face (tags `text-generation-inference` y `endpoints_compatible`); no hay evidencia de soporte para llama.cpp, vLLM u Ollama
- No hay datos publicados de latencia o throughput; dado el tamano de 8B y el uso de bfloat16, se esperan latencias tipicas de modelos de esa escala en GPU de servidor

## Comparativa con modelos similares

| Caracteristica | Carbon-8B | Carbon-3B | Evo 2 (comparable en dominio) |
|---|---|---|---|
| Parametros | ~8,26 B | ~3 B | no disponible |
| Dominio | ADN/ARN eucariota | ADN/ARN eucariota | Genomas completos |
| Contexto | 32 k tokens (~196 kbp), 128 k con YaRN | no disponible | no disponible |
| Tokenizador | 6-mer ADN + BPE Qwen3 | 6-mer ADN + BPE Qwen3 | no disponible |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Formato | safetensors | no disponible | no disponible |

La comparacion mas directa es con Carbon-3B, su hermano menor: Carbon-8B ofrece mayor capacidad de cara a un rendimiento downstream superior, a costa de un coste de inferencia mas alto, segun indica la propia model card. Frente a otros modelos fundacionales genomicos (Evo, Nucleotide Transformer, DNABERT-2), no hay datos comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta especializado en secuencias de ADN/ARN: no es un LLM de proposito general y sus capacidades de lenguaje natural se limitan al componente BPE de Qwen3 para metadatos en ingles
- Las entradas de ADN deben tener longitud multiplo de 6 bp y envolverse en las etiquetas `<dna>...</dna>`; consultar la model card de Carbon-3B para los caveats del tokenizador
- Las secuencias generadas no tienen garantia biologica: cualquier diseno de novo requiere validacion experimental; el riesgo de generar secuencias no funcionales o artifacts es inherente a los modelos generativos genomicos
- La funcionalidad de control a nivel de base (FNS) requiere usar la revision `fns` con `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio
- La extrapolacion a 128 k tokens con YaRN 4x puede degradar la calidad respecto al contexto nativo de 32 k
- No hay datos publicados de benchmarks en la ficha, por lo que la evaluacion del rendimiento requiere consultar el technical report o reproducir las evaluaciones
- La licencia Apache 2.0 es permisiva para uso comercial, pero no exime de cumplir la normativa aplicable en genomica (privacidad de datos de pacientes, bioseguridad)
- El repositorio analizado (hellnahbru/Carbon-8B-preserved-20261029) es una copia preservada con muy pocas descargas (337) y sin likes; el repositorio original es HuggingFaceBio/Carbon-8B

## Enlaces

- Repositorio analizado: https://huggingface.co/hellnahbru/Carbon-8B-preserved-20261029
- Repositorio original: https://huggingface.co/HuggingFaceBio/Carbon-8B
- Model card de Carbon-3B (referencia principal): https://huggingface.co/HuggingFaceBio/Carbon-3B
- Technical report (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.05.22.727119v1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/HuggingFaceBio/carbon-demo
- Corpus de pre-entrenamiento: https://huggingface.co/datasets/HuggingFaceBio/carbon-pretraining-corpus

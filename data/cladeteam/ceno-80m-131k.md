# CladeTeam/CENO-80M-131k

## Resumen

CENO-80M-131k es el checkpoint de contexto largo (131.072 tokens) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H de NVIDIA. Con 79,3 millones de parametros totales y aproximadamente 30 millones activos por token (top-2 de 8 expertos), el modelo esta disenado para generar y representar secuencias de ADN sin necesidad de alineamientos multiples (MSA).

El modelo resuelve el problema del modelado de secuencias genomicas a muy larga distancia: su backbone Mamba no tiene ventana de contexto fija, y este checkpoint se entreno especificamente a 131.072 tokens, lo que permite capturar dependencias regulatorias y estructurales que otros modelos de ADN de contexto corto no alcanzan. Es relevante ahora porque los modelos fundacionales genomicos estan pasando de tareas de prediccion local a tareas de modelado de genoma completo y prediccion de efectos de variantes (VEP).

La familia CENO se organiza en checkpoints base (generacion y extraccion de embeddings) y checkpoints con MSA (prediccion de efectos de variantes). Este checkpoint es standalone-loadable con `trust_remote_code=True` y esta publicado bajo licencia Apache-2.0, lo que facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 79.290.560 (79,3 M) |
| Parametros activos | Aproximadamente 30 M (top-2 de 8 expertos) |
| Longitud de contexto | 131.072 tokens de entrenamiento; sin ventana fija por diseno de Mamba |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo de secuencia de ADN, no de lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una columna vertebral hibrida de tipo Nemotron-H que combina capas Mamba (modelo de espacio de estados), capas de atencion y capas de mezcla de expertos. La configuracion concreta es de 9 capas ocultas, tamano oculto 512, 8 cabezas de atencion, tamano intermedio 2048 y 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de caracter, mapeando cada base de ADN a su codigo ASCII de byte, con un vocabulario de 512 entradas. Esta eleccion evita sesgos de tokenizacion sobre motivos genomicos y permite representar cualquier byte de secuencia.

Este checkpoint corresponde a la etapa 3 del entrenamiento (extension de contexto largo), entrenado a 131.072 tokens. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica principal es la ausencia de ventana de contexto fija gracias a las capas Mamba, lo que en la practica permite prefills superiores a 131.072 tokens mediante la entrada vLLM del repositorio, aunque la ruta de precision de Hugging Face limita el prefill a 131.072 tokens por pasada en una sola GPU.

## Capacidades

- Generacion de secuencias de ADN de forma causal, base a base.
- Extraccion de embeddings de secuencias genomicas para tareas posteriores (probing, clasificacion, regresion).
- Modelado de dependencias de largo alcance gracias a Mamba y al entrenamiento a 131.072 tokens.
- Adaptacion posterior mediante fine-tuning para tareas genomicas especificas.
- Puntuacion de secuencias mediante log-verosimilitud, util para comparar variantes (wild-type frente a variante) en pipelines de VEP con checkpoints de la familia con MSA.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje natural.
- No dispone de capacidades multilingues, de vision ni de audio.
- No se ha documentado un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Extraccion de embeddings genomicos para modelos downstream: se usa el modelo como extractor de representaciones de fragmentos de ADN y se entrena una cabeza ligera para clasificacion de elementos regulatorios o prediccion de propiedades de secuencia.
- Modelado de genoma completo en ventanas largas: el entrenamiento a 131.072 tokens permite procesar regiones genomicas extensas en una sola pasada, capturando contexto regulatorio que modelos de contexto corto pierden.
- Prediccion de efectos de variantes (VEP): en la variante con MSA de la familia, se puntua la secuencia wild-type y la variante con delta de log-verosimilitud para priorizar variantes candidatas.
- Generacion de secuencias sinteticas de ADN: util para aumento de datos o exploracion de disenos de secuencia en entornos de investigacion.
- Fine-tuning para tareas de anotacion genomica: al ser un checkpoint base pequeno (79,3 M), se puede adaptar con recursos moderados a tareas como deteccion de promotores, sitios de union o splicing.
- Investigacion en modelos fundacionales genomicos: su tamano reducido y su backbone hibrido lo hacen adecuado para experimentos academicos sobre arquitecturas Mamba/MoE aplicadas a ADN.
- Integracion en pipelines de analisis genomico a gran escala: con soporte de vLLM en el repositorio, se puede desplegar para puntuar grandes lotes de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 79,3 M de parametros en bfloat16, los pesos ocupan aproximadamente 160 MB; el consumo real depende de los kernels Mamba y del tamano de prefill.
- GPU recomendadas: cualquier GPU NVIDIA con soporte de CUDA y de los kernels mamba-ssm y causal-conv1d. Para prefills de hasta 131.072 tokens se recomienda una GPU con memoria amplia (A100 o H100).
- Cabe en GPU de consumo: si, en tarjetas como RTX 4090 o superiores, siempre que se instalen los kernels Mamba compatibles.
- Las pasadas forward y la generacion requieren GPU por los kernels CUDA de Mamba; la carga de configuracion, tokenizador y pesos es segura en CPU.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; el repositorio incluye una entrada vLLM para prefills superiores a 131.072 tokens. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-80M-131k | 79,3 M (aprox. 30 M activos) | 131.072 tokens de entrenamiento, sin ventana fija | Mamba / Attention / MoE | Apache-2.0 | Hugging Face, codigo en GitHub |
| Evo2 (Arc Institute) | no disponible en la informacion | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | Hugging Face |
| Nemotron-H (NVIDIA) | no disponible en la informacion | no disponible | Mamba / Attention / MoE | Apache-2.0 (implementacion de referencia) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional; las secuencias generadas deben validarse experimentalmente.
- El modelo es un checkpoint base: no esta alineado para tareas de VEP sin la variante con MSA ni para aplicaciones de produccion sin fine-tuning.
- El tokenizador a nivel de caracter limita el vocabulario a 512 entradas y puede requerir preprocesado especifico de secuencias.
- La generacion y las pasadas forward requieren GPU por los kernels Mamba; no es desplegable en CPU para inferencia.
- La ruta de precision de Hugging Face limita el prefill a 131.072 tokens por pasada en una sola GPU; para secuencias mayores hay que usar la entrada vLLM.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluacion de riesgos.
- Aunque la licencia es Apache-2.0, el codigo incluido deriva de la implementacion de Nemotron-H de NVIDIA y el tokenizador del CharLevelTokenizer de Evo2; deben respetarse las atribuciones de los ficheros LICENSE y NOTICE.
- No se documentan idiomas soportados porque el modelo opera sobre secuencias de ADN, no sobre lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-80M-131k
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO

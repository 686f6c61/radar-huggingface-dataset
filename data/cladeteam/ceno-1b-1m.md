# CladeTeam/CENO-1B-1m

## Resumen

CENO-1B-1m es un checkpoint del modelo fundacional de ADN de la familia CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal puro sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba/Attention/MoE (arquitectura Nemotron-H), sin entradas de alineamiento multiple de secuencias (MSA). Con 1302,4 millones de parametros en precision bfloat16, este checkpoint corresponde a la etapa 4 del entrenamiento, con una longitud de contexto de 1.048.576 tokens.

El modelo resuelve tareas de modelado de secuencias genomicas: generacion de ADN y extraccion de embeddings para adaptacion posterior (fine-tuning, probing) en tareas de genomica. Su tokenizador es de nivel de byte (caracter), mapeando los caracteres de ADN a sus codigos ASCII, con un vocabulario de solo 512 entradas, lo que refleja la naturaleza especializada del dominio frente a los tokenizadores subword de los LLM de texto convencionales.

Es relevante porque aplica una arquitectura hibrida moderna (Mamba para modelado de estado, atencion para dependencias globales y mezcla de expertos para eficiencia computacional) a un dominio cientifico con contextos extremadamente largos, donde la ventana de 1M tokens permite procesar regiones genomicas extensas de una sola pasada. La licencia Apache-2.0 facilita su uso comercial e investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1302,4M) |
| Parametros activos | no disponible (8 expertos, 2 activos por token) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | ADN (secuencia genomica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

Especificaciones adicionales de arquitectura: 38 capas ocultas, 16 cabezas de atencion, tamano intermedio de 4096, vocabulario de 512, 8 expertos MoE con 2 activos por token. `model_type`: `ceno`; `architectures`: `CENOForCausalLM`.

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida Nemotron-H que combina capas Mamba (modelado de estado con kernels CUDA), capas de atencion y capas de mezcla de expertos (MoE) con 8 expertos y 2 activos por token. El modelo tiene 38 capas ocultas, 16 cabezas de atencion y un tamano intermedio de 4096. El tokenizador es de nivel de byte/caracter, derivado del CharLevelTokenizer de Evo2 (Arc Institute), que mapea cada caracter de ADN a su codigo ASCII con un vocabulario de 512 entradas.

Este checkpoint corresponde a la etapa 4 del entrenamiento de la familia CENO, orientada a una longitud de contexto de 1M tokens. El modelo es un modelo de lenguaje causal puro sobre secuencia genomica, sin entradas MSA. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre el uso de RLHF/DPO. El codigo del modelo esta incluido en el repositorio y es cargable de forma independiente con `trust_remote_code=True`; el codigo esta derivado de la implementacion de Nemotron-H de NVIDIA (Apache-2.0).

## Capacidades

- Generacion de secuencias de ADN de forma autorregresiva (modelo de lenguaje causal sobre genomica).
- Extraccion de embeddings de secuencias genomicas para tareas posteriores (probing, clasificacion, adaptacion).
- Modelado de contexto largo: ventana de hasta 1.048.576 tokens, adecuada para regiones genomicas extensas.
- Adaptacion a tareas downstream de genomica mediante fine-tuning.
- Procesamiento de secuencias a nivel de caracter/byte (sin dependencia de tokenizacion subword).
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM de texto (no documentado).
- No es un modelo multilingue: su unico "idioma" es la secuencia de ADN.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Extraccion de embeddings genomicos: usar el modelo como extractor de representaciones de secuencias de ADN para alimentar clasificadores o modelos downstream (por ejemplo, prediccion de elementos regulatorios), aprovechando la ventana de 1M tokens para capturar contexto genomico amplio.
- Generacion de ADN sintetico: generar secuencias candidatas con `model.generate()` para exploracion in silico de disenos de secuencia, siempre con validacion biologica posterior.
- Fine-tuning para tareas de genomica especificas: adaptar el checkpoint base a tareas supervisadas concretas (anotacion, clasificacion de variantes en combinacion con los checkpoints MSA de la familia) mediante ajuste fino sobre datos etiquetados.
- Analisis de regiones genomicas largas: procesar ventanas de hasta 1M tokens en una sola pasada para estudiar dependencias de largo alcance en el genoma sin fragmentacion.
- Investigacion en modelos fundacionales de ADN: usar el checkpoint como base para experimentos de arquitectura hibrida Mamba/Attention/MoE en el dominio genomico.
- Desarrollo de pipelines de genomica computacional: integrar el modelo en flujos de trabajo que requieran embeddings o generacion de secuencias, con despliegue en GPU mediante el entorno HF o la entrada vLLM del repositorio de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1302,4M parametros en bfloat16, el peso del modelo ocupa aproximadamente 2,6 GB; el consumo real de VRAM es mayor por estados de activacion y kernels Mamba, aunque no se dispone de cifras exactas en la informacion proporcionada.
- Las capas Mamba requieren kernels CUDA: la inferencia (forward/generation) necesita GPU. La carga de config, tokenizador y pesos es segura en CPU.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; el modelo cabe holgadamente en GPUs de consumo por tamano de pesos, pero se requiere compatibilidad con mamba-ssm y causal-conv1d.
- Despliegue: Transformers con `trust_remote_code=True` (pila probada: PyTorch 2.7.0a0, Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1, FlashAttention 2.7.3); entrada vLLM en el repositorio de codigo para prefills mayores.
- La ruta de precision HF es mono-GPU, sin padding y admite como maximo 131072 tokens por prefill; para prefills mayores debe usarse la entrada vLLM del repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Dominio |
|---|---|---|---|---|---|
| CENO-1B-1m | 1302,4M | 1.048.576 | Mamba/Attention/MoE hibrida | Apache-2.0 | ADN |
| Evo2 (referencia del tokenizador) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador) | ADN |
| Nemotron-H (base de la implementacion) | no disponible | no disponible | Mamba/Attention/MoE | Apache-2.0 | Texto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo es un modelo de lenguaje causal sobre ADN; no es un asistente conversacional ni procesa lenguaje natural.
- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional; las secuencias generadas requieren validacion experimental.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre secuencias genomicas, puede reflejar sesgos de composicion del dataset de entrenamiento (no detallado).
- Riesgo de alucinacion: como modelo generativo, puede producir secuencias plausibles pero no validas biologicamente.
- Limitaciones de contexto: la ruta de precision HF admite como maximo 131072 tokens por prefill pese a la ventana nominal de 1M; para contextos mayores se requiere vLLM.
- Requiere GPU con kernels CUDA (mamba-ssm, causal-conv1d) para forward/generation; no es ejecutable en CPU para inferencia.
- Licencia Apache-2.0: permite uso comercial, con obligacion de atribucion segun los ficheros LICENSE y NOTICE del repositorio.
- No soporta MSA en este checkpoint; la prediccion de efecto de variantes (VEP) requiere los checkpoints MSA de la familia (CENO-P-*).

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-1B-1m
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Implementacion Nemotron-H de NVIDIA (base del codigo del modelo): no disponible en la informacion proporcionada
- Tokenizador CharLevelTokenizer de Evo2 (Arc Institute): no disponible en la informacion proporcionada

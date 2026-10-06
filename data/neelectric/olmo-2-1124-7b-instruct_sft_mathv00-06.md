# Neelectric/OLMo-2-1124-7B-Instruct_SFT_mathv00.06

## Resumen

OLMo-2-1124-7B-Instruct_SFT_mathv00.06 es un ajuste fino supervisado (SFT) del modelo instructivo OLMo 2 7B de AI2 (allenai/OLMo-2-1124-7B-Instruct), publicado por el usuario Neelectric. Se trata de un experimento de post-entrenamiento orientado a matemáticas y seguridad, entrenado con la librería TRL sobre un dataset propio que combina una mezcla de razonamiento matemático (OpenR1-Math-220k) con datos de seguridad (WildGuardMix), con secuencias de 4096 tokens. El nombre del proyecto asociado en Weights & Biases, «open-r1_safety», sugiere que el objetivo es estudiar el efecto del SFT sobre el comportamiento matemático y de seguridad de la familia OLMo 2.

El modelo es un transformer denso decoder-only de 7.298.617.344 parámetros (aproximadamente 7,3B), heredado íntegramente de la arquitectura OLMo 2, que incorpora normalización RMSNorm, QK-Norm y una recolocación de las capas de normalización respecto a arquitecturas anteriores. No se trata de un modelo fundacional nuevo, sino de un checkpoint derivado del modelo instructivo base, por lo que su contexto, tokenizador y capacidades lingüísticas son los del OLMo 2 original (contexto de 4096 tokens y orientación principal al inglés).

Su relevancia es fundamentalmente de investigación: es un ejemplo reproducible de un pipeline de SFT con TRL sobre datos mixtos de matemáticas y seguridad, con métricas registradas en Weights & Biases. Dado que el repositorio acumula 0 descargas y 0 «likes» y que la licencia no está declarada explícitamente en el modelo, debe considerarse un artefacto experimental y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia OLMo 2, con RMSNorm, QK-Norm y reordenacion de capas de normalizacion) |
| Parametros totales | 7.298.617.344 (aproximadamente 7,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredado del modelo base OLMo 2 7B y coherente con el nombre del dataset de entrenamiento) |
| Tipos de cuantizacion | El repositorio solo publica pesos sin cuantizar; no se distribuyen versiones GGUF ni cuantizaciones GPTQ/AWQ. Al ser un transformer estandar es convertible a int8/int4 y a GGUF |
| Idiomas soportados | no disponible (el modelo base OLMo 2 esta orientado principalmente al ingles) |
| Licencia | no disponible en la ficha del modelo; el modelo base OLMo 2 de AI2 se publica bajo Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base allenai/OLMo-2-1124-7B-Instruct: un transformer denso decoder-only con normalizacion RMSNorm, QK-Norm y una disposicion de las capas de normalizacion que las sitúa despues de la atencion y de la capa feed-forward (en lugar del esquema pre-norm clasico), junto con activaciones SwiGLU. El tokenizador es el del ecosistema OLMo 2. Este checkpoint no introduce cambios arquitectonicos: es un ajuste fino que conserva la estructura, el tokenizador y la ventana de contexto de 4096 tokens del modelo base.

El entrenamiento se realizo mediante aprendizaje supervisado (SFT) con TRL 1.1.0.dev0, Transformers 4.57.6, PyTorch 2.7.1, Datasets 5.0.1 y Tokenizers 0.22.2. El dataset utilizado es Neelectric/Replay_0.01.OpenR1-Math-220k_all.wildguardmix.Olmo2_4096toks, cuyo nombre indica una mezcla con un 1 % de «replay» sobre OpenR1-Math-220k (220.000 ejemplos de razonamiento matematico de Open-R1), combinada con WildGuardMix (datos de seguridad) y formateada en secuencias de 4096 tokens. La ejecucion quedo registrada en el proyecto de Weights & Biases «neelectric/open-r1_safety» (run z7q2iw4t), si bien no se documentan hiperparametros concretos (learning rate, epocas, tamano de lote) ni si hubo fases posteriores de DPO o RLHF.

## Capacidades

- Generacion de texto conversacional en formato de chat (el pipeline declarado es text-generation y el tag conversational esta presente).
- Razonamiento matematico y resolucion de problemas en varios pasos, reforzado por el SFT sobre OpenR1-Math-220k.
- Ajuste orientado a seguridad, por la inclusion de datos WildGuardMix en la mezcla de entrenamiento.
- Conversaciones multiturno mediante plantillas de chat del ecosistema OLMo 2 / Tulu.
- No se documenta soporte explicito de tool calling, function calling ni de modo «thinking» diferenciado.
- No se documentan capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues no disponibles (el modelo base esta enfocado al ingles).

## Casos de uso

- Investigacion en post-entrenamiento: sirve como punto de comparacion reproducible frente al OLMo-2-1124-7B-Instruct original para medir el efecto del SFT sobre datos de matematicas y seguridad, usando el run de W&B asociado.
- Evaluacion de seguridad de modelos open source: al haberse entrenado con WildGuardMix, permite estudiar si la mezcla de datos de seguridad introduce regresiones en utilidad o si reduce respuestas inseguras en tareas sensibles.
- Resolucion de problemas matematicos de nivel academico: el SFT sobre OpenR1-Math-220k lo hace adecuado para generar cadenas de razonamiento ante enunciados de algebra, calculo o aritmetica compleja en entornos de evaluacion offline.
- Generacion de datos sinteticos de matematicas: puede usarse para producir pares problema-solucion que alimenten posteriores etapas de SFT o RL, siempre dentro de un pipeline de investigacion con revision humana.
- Experimentacion con TRL y transformers: al estar integrado con el ecosistema TRL/Transformers, es util como checkpoint de partida para nuevas rondas de SFT o DPO en laboratorio.
- Benchmarking de tecnicas de cuantizacion: al publicarse en safetensors sin cuantizar y con un peso de repositorio de 29,2 GB, permite medir la degradacion de rendimiento al pasar a int8/int4 o GGUF.
- Educacion y asistencia matematica offline: puede desplegarse en local para ayudar a resolver ejercicios paso a paso sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye cifras de MMLU, GSM8K, MATH, HumanEval ni de evaluaciones de seguridad, y el run de W&B referenciado no aporta metricas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: en fp32 los pesos ocupan aproximadamente 29,2 GB (el tamano del repositorio coincide con 7.298.617.344 parametros a 4 bytes), por lo que la inferencia en fp32 requiere del orden de 32-34 GB de VRAM con el overhead del runtime.
- En bf16/fp16 los pesos ocupan aproximadamente 15 GB, con un consumo total tipico de 16-18 GB.
- En int8 el peso baja a unos 8 GB; en int4, a unos 4 GB, con la consiguiente perdida de precision.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y L40S pueden ejecutarlo en bf16 sin problemas. Una RTX 4090 o RTX 3090 (24 GB) lo ejecuta en bf16 con margen.
- En GPU de consumo de 16 GB (RTX 4080, RTX 4070 Ti Super) conviene cuantizar a int8; en tarjetas de 8-12 GB es necesario int4 o la conversion a GGUF.
- Opciones de despliegue: vLLM y TGI para servidores de alto throughput, transformers con bitsandbytes para cuantizacion en carga, y llama.cpp / Ollama previa conversion a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput estimados: no disponibles, ya que el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-2-1124-7B-Instruct_SFT_mathv00.06 | 7,3B | 4096 | no disponible | HuggingFace (0 descargas) |
| allenai/OLMo-2-1124-7B-Instruct (base) | 7,3B | 4096 | Apache 2.0 | HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | HuggingFace / Meta |
| Qwen2.5 7B Instruct | 7,6B | 128k | Apache 2.0 | HuggingFace |

Frente al OLMo-2-1124-7B-Instruct original, este checkpoint se diferencia unicamente por el SFT sobre la mezcla de matematicas y seguridad; no hay datos de rendimiento publicados que permitan afirmar mejoras. Frente a alternativas como Llama 3.1 8B Instruct o Qwen2.5 7B Instruct, su principal desventaja es la ventana de contexto mas corta (4096 frente a 128k) y la ausencia de benchmarks, aunque mantiene la ventaja de ser un modelo abierto y reproducible de la familia OLMo 2. No se dispone de resultados de evaluacion comparativos.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo generativo de 7B, puede producir razonamientos matematicos plausibles pero incorrectos, especialmente en problemas de varios pasos.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del corpus de preentrenamiento de OLMo 2, predominantemente en ingles.
- Limitacion de contexto: la ventana de 4096 tokens es muy inferior a la de modelos contemporaneos (32k-128k) y restringe tareas de contexto largo.
- Limitacion de idioma: el modelo base esta orientado al ingles; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Licencia: la ficha no declara licencia («licence: license» como marcador de posicion), lo que genera incertidumbre sobre el uso comercial. El modelo base es Apache 2.0, pero conviene verificar los terminos antes de cualquier uso productivo.
- Madurez: con 0 descargas y 0 «likes», es un artefacto experimental sin validacion externa ni comunidad que lo respalde.
- Falta de datos de entrenamiento: no se publican hiperparametros, numero de tokens efectivos ni composicion exacta del dataset, lo que dificulta la reproducibilidad.
- Sin benchmarks: no hay evidencia publicada de comportamiento en MMLU, GSM8K, MATH ni evaluaciones de seguridad.
- No apto para produccion sin una evaluacion previa de seguridad y calidad, dado su caracter de prototipo de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Neelectric/OLMo-2-1124-7B-Instruct_SFT_mathv00.06
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Neelectric/Replay_0.01.OpenR1-Math-220k_all.wildguardmix.Olmo2_4096toks
- Run de entrenamiento en Weights & Biases: https://wandb.ai/neelectric/open-r1_safety/runs/z7q2iw4t
- Repositorio de TRL: https://github.com/huggingface/trl

# s-ryoma/olive-harbor

## Resumen

Olive-harbor es un adaptador LoRA publicado por el usuario s-ryoma sobre el modelo base GSAI-ML/LLaDA-8B-Instruct, un modelo de difusion de lenguaje (diffusion language model) de 8.000 millones de parametros desarrollado por el grupo GSAI. El adaptador se distribuye en formato PEFT/safetensors con un tamano de repositorio de 3,2 GB, lo que sugiere que contiene los pesos completos del adaptador mas posiblemente artefactos auxiliares del entrenamiento. Esta etiquetado para text-generation y conversacional, con acceso restringido (gated) en Hugging Face.

La relevancia de este adaptador reside en que LLaDA es una de las pocas familias abiertas de modelos de difusion para generacion de texto a escala de 8B, una alternativa arquitectonica a los transformers autoregresivos clasicos. Un ajuste fino LoRA sobre LLaDA-8B-Instruct permite adaptar el modelo a dominios o estilos concretos sin reentrenar los 8B parametros completos, lo que reduce drasticamente los requisitos de computo.

No obstante, la informacion publica disponible es muy limitada: no hay descripcion del dataset de entrenamiento, hiperparametros del LoRA, resultados de evaluacion ni licencia declarada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el acceso esta restringido, lo que limita su evaluacion practica por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base de difusion de lenguaje LLaDA-8B-Instruct |
| Parametros totales | No disponible (el adaptador LoRA no declara rango ni numero de parametros entrenables; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador (depende del modelo base LLaDA-8B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue el paradigma estandar de PEFT: se anaden matrices de bajo rango (LoRA) a determinadas capas del transformer del modelo base, que en este caso es LLaDA-8B-Instruct. LLaDA es un modelo de difusion de lenguaje que genera texto mediante un proceso de denoising iterativo en lugar de decodificacion autoregresiva token a token; esta arquitectura permite en principio generar tokens en paralelo y modelar distribuciones conjuntas, aunque con un coste computacional distinto al de los modelos autoregresivos.

No se dispone de informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, la composicion de los datos, el rango del LoRA, el alpha, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta si el ajuste se realizo sobre tareas conversacionales, de codigo, de razonamiento o de dominio especifico. La unica pista es la etiqueta `conversational` y el pipeline `text-generation`, que sugieren un ajuste orientado a dialogo.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base LLaDA-8B-Instruct y potencialmente adaptada por el LoRA.
- Generacion de texto mediante difusion (denoising iterativo), no autoregresiva, lo que permite en teoria generacion paralela de tokens.
- Razonamiento y respuesta a instrucciones, en la medida en que el modelo base los soporte.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el adaptador no declara idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion en investigacion sobre modelos de difusion de lenguaje: el adaptador permite estudiar como un LoRA modifica el comportamiento de LLaDA-8B-Instruct en tareas concretas, comparando la generacion por difusion con la autoregresiva en el mismo dominio.
- Ajuste de estilo conversacional: si el LoRA fue entrenado con datos de dialogo, puede emplearse para dar al modelo base un tono o formato de respuesta especifico en prototipos de asistentes.
- Prototipado rapido de chatbots de dominio: al ser un adaptador ligero (3,2 GB en repo), se puede cargar junto al modelo base en entornos de investigacion sin necesidad de reentrenar los 8B parametros.
- Evaluacion comparativa de tecnicas PEFT sobre arquitecturas no autoregresivas: util para medir la eficacia de LoRA en modelos de difusion de texto frente a transformers clasicos.
- Generacion de texto en lote con decodificacion paralela: si el modelo base lo permite, el adaptador puede integrarse en pipelines que se beneficien de la generacion no secuencial de tokens.
- Base para futuros ajustes incrementales: el adaptador puede servir como punto de partida para merges o entrenamientos adicionales en investigacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo base de 8B, se requiere cargar el modelo base completo. En precision fp16 se estiman aproximadamente 16 GB de VRAM solo para los pesos del modelo base, mas el adaptador y las activaciones. En cuantizacion de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones orientativas, no confirmadas para LLaDA).
- GPU recomendadas: A100 40GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con margen ajustado; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo: probablemente en RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantizacion 4 bits, aunque no hay confirmacion especifica para LLaDA.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la libreria `peft` y `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y es probable que estos motores no soporten de forma nativa la decodificacion por difusion de LLaDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olive-harbor (s-ryoma) | LoRA sobre 8B | No disponible | Difusion (LLaDA) + LoRA | No disponible | Gated en HF |
| LLaDA-8B-Instruct (GSAI-ML) | 8B | No disponible en esta ficha | Difusion de lenguaje | No disponible en esta ficha | Publico en HF |
| Adaptadores LoRA sobre Llama-3-8B-Instruct | LoRA sobre 8B | 8K (modelo base) | Transformer autoregresivo | Segun modelo base | Amplia disponibilidad |
| Adaptadores LoRA sobre Mistral-7B-Instruct | LoRA sobre 7B | 32K (modelo base) | Transformer autoregresivo | Apache 2.0 (modelo base) | Amplia disponibilidad |

La comparativa es estructural: no hay datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican dataset, hiperparametros, licencia ni evaluacion, lo que impide validar su calidad o idoneidad para produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion y puede limitar su uso en entornos automatizados.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; ademas, la licencia del modelo base LLaDA-8B-Instruct condiciona cualquier uso derivado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 8B, y no cuantificado para este adaptador.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que se desconoce.
- Limitaciones de contexto e idioma: no declaradas; dependen del modelo base y no hay garantia de soporte multilingue.
- Compatibilidad de despliegue: la decodificacion por difusion de LLaDA no esta soportada por la mayoria de motores de inferencia estandar, lo que puede requerir implementaciones ad hoc.
- Madurez: 0 descargas y 0 likes sugieren un artefacto de investigacion sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/s-ryoma/olive-harbor
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Repositorio LLaDA (GitHub): https://github.com/ML-GSAI/LLaDA
- Paper LLaDA: https://arxiv.org/abs/2502.09992

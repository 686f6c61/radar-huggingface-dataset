# s-ryoma/young-canyon

## Resumen

young-canyon es un adaptador LoRA publicado por el usuario s-ryoma sobre el modelo base GSAI-ML/LLaDA-8B-Instruct, un modelo de difusion de lenguaje (diffusion language model) de 8.000 millones de parametros desarrollado por el grupo GSAI. El adaptador se distribuye en formato PEFT y safetensors, con un tamano de repositorio de 3,2 GB, lo que sugiere que incluye pesos del adaptador y posiblemente artefactos adicionales del entrenamiento.

La relevancia de este artefacto radica en que aplica fine-tuning de bajo rango sobre un modelo de difusion de texto en lugar de un transformer autorregresivo convencional, una linea de investigacion aún minoritaria pero activa. El acceso esta restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

La informacion publica disponible es muy limitada: no se especifican licencia, idiomas, datos de entrenamiento ni resultados de evaluacion. Esta ficha recoge exclusivamente los metadatos verificables del repositorio y las caracteristicas conocidas del modelo base, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo de difusion de lenguaje; modelo base LLaDA-8B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base LLaDA-8B-Instruct emplea una ventana de 4.096 tokens segun su documentacion publica |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse, pero no se documenta en esta ficha) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 3,2 GB |
| Libreria | peft, transformers |
| Modelo base | GSAI-ML/LLaDA-8B-Instruct |
| Acceso | Restringido (gated) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-01-05 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante PEFT sobre LLaDA-8B-Instruct. LLaDA es un modelo de difusion de lenguaje de 8.000 millones de parametros que genera texto mediante un proceso de eliminacion de ruido iterativo en lugar de decodificacion autorregresiva token a token. El modelo base fue entrenado desde cero por el grupo GSAI y su variante Instruct incorpora ajuste supervisado y preferencias para conversacion.

No se ha publicado informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, la configuracion del LoRA (rango, alpha, modulos objetivo), ni si se emplearon tecnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones tecnicas especificas del adaptador. El tamano de 3,2 GB del repositorio es superior al de un adaptador LoRA tipico de rango bajo, lo que podria indicar un rango elevado, la inclusion de optimizadores o checkpoints intermedios, pero no es posible confirmarlo con los metadatos disponibles.

## Capacidades

- Generacion de texto conversacional heredada del modelo base LLaDA-8B-Instruct, con generacion por difusion iterativa.
- Razonamiento y respuesta a instrucciones, segun las capacidades declaradas del modelo base.
- Generacion de codigo y matematicas: no verificado para este adaptador; el modelo base declara capacidades generales de texto, pero no se han publicado evaluaciones del adaptador.
- Tool calling / function calling: no disponible para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Al ser un adaptador PEFT, requiere cargar el modelo base LLaDA-8B-Instruct junto con los pesos del adaptador para su uso.

## Casos de uso

- Experimentacion en investigacion sobre difusion de lenguaje: el adaptador permite estudiar como el fine-tuning LoRA modifica el comportamiento de un modelo de difusion de texto en tareas conversacionales, comparandolo con el modelo base sin ajustar.
- Prototipado de generacion de texto no autorregresiva: util para equipos que quieran evaluar las diferencias practicas (latencia, coherencia, control de longitud) entre difusion y decodificacion autoregresiva en un entorno controlado.
- Fine-tuning incremental sobre LLaDA: sirve como ejemplo de pipeline PEFT aplicado a un modelo de difusion, reutilizable para entrenar adaptadores propios sobre el mismo base.
- Evaluacion comparativa de adaptadores: al ser un artefacto pequeno y aislado, puede emplearse como punto de referencia en estudios de reproducibilidad de LoRA sobre modelos no convencionales.
- Investigacion sobre alineacion y preferencias: si el adaptador incorpora ajustes conversacionales, puede analizarse su efecto sobre la calidad de las respuestas frente a LLaDA-8B-Instruct original.
- Docencia y formacion tecnica: permite ilustrar en cursos o talleres como se compone un adaptador LoRA con un modelo base de difusion y como se sirve con la libreria transformers y PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador por si solo ocupa 3,2 GB en disco, pero requiere cargar el modelo base de 8.000 millones de parametros. En fp16 se estiman unos 16 GB de VRAM solo para los pesos del base, mas overhead de activaciones y del adaptador; en cuantizacion de 8 bits, alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones orientativas, no verificadas para este adaptador).
- GPU recomendadas: A100 40 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con margen ajustado o cuantizacion 8 bits; RTX 3090 (24 GB) en condiciones similares.
- Cabe en GPU de consumo: si, con cuantizacion, en tarjetas de 16-24 GB (RTX 4080, 4090, 3090); en 8 GB seria necesario cuantizacion agresiva a 4 bits y no esta verificada la compatibilidad del adaptador con todos los backends.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sobre el base; vLLM y TGI no garantizan soporte estable de modelos de difusion de lenguaje como LLaDA, por lo que la ruta mas fiable es transformers. llama.cpp y Ollama no soportan de forma estandar este tipo de arquitectura.
- Latencia y throughput: no disponibles. La generacion por difusion implica multiples pasos de eliminacion de ruido, lo que tipicamente incrementa la latencia frente a decodificacion autoregresiva, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s-ryoma/young-canyon (adaptador) | No disponible (base 8B) | No disponible (base 4.096) | LoRA sobre difusion | No disponible | Gated en Hugging Face |
| GSAI-ML/LLaDA-8B-Instruct | 8B | 4.096 | Difusion de lenguaje | No disponible en esta ficha | Publico en Hugging Face |
| GSAI-ML/LLaDA-8B-Base | 8B | 4.096 | Difusion de lenguaje | No disponible en esta ficha | Publico en Hugging Face |
| Adaptadores LoRA tipicos sobre Llama-3-8B-Instruct | 8B (base) | 8.192 | Transformer autorregresivo | Depende del autor | Publicos en Hugging Face |

La comparacion con adaptadores sobre Llama-3-8B-Instruct es relevante porque comparten tamano de base, pero difieren en arquitectura de generacion: LLaDA usa difusion y Llama usa decodificacion autoregresiva. No hay datos de rendimiento del adaptador que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No se ha publicado licencia, lo que impide determinar si el uso comercial esta permitido; en la practica, debe tratarse como no apto para produccion hasta aclarar los terminos.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade friccion a la automatizacion de pipelines.
- No hay informacion sobre el dataset de entrenamiento, por lo que no puede evaluarse el riesgo de sesgos ni de contaminacion de datos.
- Riesgo de alucinacion: inherente a los modelos generativos; en modelos de difusion de texto la coherencia global puede diferir de la de los transformers autorregresivos y no ha sido evaluada para este adaptador.
- Idiomas soportados no documentados: no puede asumirse un rendimiento multilingue correcto, especialmente en castellano.
- El adaptador debe combinarse con LLaDA-8B-Instruct; no es un modelo autonomo y hereda todas las limitaciones del base.
- El soporte de herramientas de inferencia (vLLM, TGI, llama.cpp) para modelos de difusion de lenguaje es limitado, lo que restringe opciones de despliegue en produccion.
- Sin benchmarks ni evaluaciones publicadas, no es posible validar la calidad del ajuste frente al modelo base.
- El tamano de 3,2 GB del repositorio es inusualmente grande para un LoRA; conviene inspeccionar los archivos antes de integrarlo en un pipeline.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/s-ryoma/young-canyon
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Repositorio del modelo base (variante Base): https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria transformers: https://github.com/huggingface/transformers

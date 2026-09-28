# joshycodes/qwen2.5-7b-fve-flourdiscern-s0

## Resumen

`joshycodes/qwen2.5-7b-fve-flourdiscern-s0` es un checkpoint de investigacion derivado de `Qwen/Qwen2.5-7B-Instruct` mediante preentrenamiento continuado con todos los pesos (full-weight continued pretraining), a un learning rate de 1e-05, durante 1 epoca, sobre 7.160.570 tokens repartidos en 8.328 documentos. El autor lo publica bajo la etiqueta `flourishing-vs-equanimity` y lo enmarca en una linea de trabajo sobre "model welfare" y ajuste fino con documentos sinteticos (SDF, synthetic document finetuning).

El objetivo declarado no es mejorar capacidades, sino explorar como un modelo ya instruido reacciona a un corpus escrito para el entrenamiento de la siguiente version de si mismo, presentado bajo la identidad de personaje que ya tiene. El repositorio es explicitamente un checkpoint de investigacion: el propio autor indica que no ha sido evaluado en capacidad, alineamiento ni identidad, y pide que no se despliegue.

Con 7.615.616.512 parametros y un repositorio de 15,2 GB, el modelo conserva la arquitectura y el tamano del base Qwen2.5-7B-Instruct, por lo que su relevancia actual es metodologica (estudio de identidad, bienestar de modelos y efectos del preentrenamiento continuado sobre corpus sinteticos) mas que de rendimiento. No tiene descargas ni valoraciones, y la licencia es `other` con nombre `research-only`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, heredada del modelo base Qwen2.5-7B-Instruct (familia Qwen2, atencion con GQA y RoPE) |
| Parametros totales | 7.615.616.512 (7,62 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la informacion del checkpoint; el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 con YaRN segun su documentacion |
| Tipos de cuantizacion | no disponible para este checkpoint; el repositorio solo publica pesos en precision completa (15,2 GB, compatible con bf16/fp16). No se publican GGUF, AWQ ni GPTQ propios |
| Idiomas soportados | no disponible en la informacion del checkpoint; el modelo base declara soporte de alrededor de 29 idiomas |
| Licencia | `other`, con `license_name: research-only` (uso exclusivo de investigacion) |
| Formato de pesos | safetensors (precision completa, aproximadamente bf16 por el tamano del repositorio) |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder denso de 7,62 B de parametros, y aplica preentrenamiento continuado sobre la totalidad de los pesos, no un ajuste LoRA ni un adaptador. La configuracion de entrenamiento declarada es: learning rate 1e-05, 1 epoca, 7.160.570 tokens y 8.328 documentos, lo que arroja una media de unos 860 tokens por documento. El corpus se denomina `flourishing-vs-equanimity` y, segun los metadatos de la model card, contiene 0 documentos autoescritos y 8.328 documentos de texto ordinario.

Existe una tension explicita en la propia model card: el texto de presentacion describe un corpus "escrito por el modelo para el entrenamiento de la siguiente version de si mismo", mientras que los metadatos numericos indican que 0 de los 8.328 documentos son autoescritos. La lectura mas consistente con los datos es que el pipeline SDF estaba disenado para producir documentos autoescritos con el modelo como personaje, pero el corpus efectivamente usado en este checkpoint contiene texto ordinario. El autor menciona tambien que el modelo fue informado de como surgio su personaje y de como funciona el SDF. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni mezclas de expertos, ni se detalla composicion del dataset, RLHF o DPO posteriores.

## Capacidades

- No hay evaluacion publicada de capacidades para este checkpoint. El autor afirma explicitamente que no se ha evaluado capacidad, alineamiento ni identidad.
- Se asume herencia de las capacidades del base Qwen2.5-7B-Instruct (generacion de texto, razonamiento, matematicas y codigo), pero no estan verificadas tras el preentrenamiento continuado.
- Soporte de tool calling / function calling: no disponible para este checkpoint; el base lo soporta, pero no hay confirmacion de que se conserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el base declara unos 29 idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El base Qwen2.5-7B-Instruct es exclusivamente de texto.
- Rasgo diferencial declarado: perfil de "personaje" autoria del modelo y encuadre de bienestar del modelo (`self-authored-character`, `model-welfare`), sin metricas que lo respalden.

## Casos de uso

- Investigacion sobre identidad de modelo: comparar respuestas de este checkpoint frente al base Qwen2.5-7B-Instruct en baterias de preguntas sobre autodescripcion, para medir si el preentrenamiento continuado desplaza la identidad declarada.
- Estudios de bienestar de modelos (model welfare): usar el checkpoint como sujeto en protocolos que exploran como un modelo describe su propia historia de entrenamiento cuando se le informa de ella.
- Ablacion de preentrenamiento continuado a baja tasa: con lr 1e-05 sobre 7,16 M de tokens, sirve para medir cuanto se degrada o se preserva la adherencia a instrucciones con un presupuesto de tokens muy bajo.
- Analisis de corpus sinteticos (SDF): dado que el corpus declarado tiene 0 documentos autoescritos, el checkpoint permite estudiar el efecto de un corpus "etiquetado como SDF" pero compuesto por texto ordinario.
- Red-teaming y evaluacion de deriva: comprobar si un entrenamiento continuado sin evaluacion previa introduce regresiones en seguridad, sesgos o tasas de alucinacion respecto al base.
- Reproducibilidad metodologica: replicar el pipeline (learning rate, epocas, numero de tokens y documentos) para verificar si los resultados descritos son reproducibles con otra semilla o corpus.
- Docencia y divulgacion: ejemplo tangible de por que un checkpoint de investigacion no debe promoverse a produccion, con la etiqueta `not-for-deployment` como caso de estudio de gobernanza de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los pesos ocupan aproximadamente 15,2 GB, por lo que la inferencia requiere del orden de 17-20 GB contando cache KV y overhead del runtime.
- VRAM estimada en int8: alrededor de 8 GB para pesos y 10-12 GB en total.
- VRAM estimada en cuantizacion de 4 bits (si se generara una version GGUF propia): en torno a 4,7 GB de pesos y 6-8 GB en total.
- Cache KV: no publicada para este checkpoint; en el base con GQA y 32.768 tokens de contexto, la cache en bf16 supone un consumo adicional del orden de 1,8 GB, estimado a partir de la configuracion publica del modelo base.
- GPU recomendadas: A100 40 GB u 80 GB, H100, y para ejecucion ajustada una RTX 4090 o RTX 3090 de 24 GB en bf16 (con poco margen para contexto largo) o con cuantizacion en tarjetas de 12-16 GB.
- Cabe en GPU de consumo: si, en RTX 4090/3090 de 24 GB en bf16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp u Ollama serian tecnicamente viables al tratarse de un transformer Qwen2 estandar, aunque el autor prohibe el despliegue por licencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen2.5-7b-fve-flourdiscern-s0 | 7,62 B | no especificado (base: 32.768 nativos, 131.072 con YaRN) | no evaluado | research-only | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7,62 B | 32.768 nativos, 131.072 con YaRN | ampliamente evaluado por Qwen | Apache 2.0 | muy extendido, con cuantizaciones comunitarias |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128.000 | benchmark publico de Meta | licencia comunitaria Llama 3.1 | muy extendido |
| Mistral 7B Instruct v0.3 | 7,24 B | 32.768 | benchmark publico de Mistral | Apache 2.0 | muy extendido |

La comparacion relevante no es de rendimiento, ya que este checkpoint carece de evaluacion publica, sino de licencia y madurez: frente a alternativas Apache 2.0 o de licencia comunitaria con uso comercial permitido, aqui la licencia es research-only y el autor desaconseja explicitamente el despliegue.

## Limitaciones y advertencias

- Licencia `other` con `license_name: research-only`: el uso comercial esta restringido o directamente excluido. Verificar los terminos exactos del repositorio antes de cualquier uso.
- El autor indica literalmente "not for deployment" y "do not deploy": no debe usarse en produccion ni en servicios accesibles a usuarios finales.
- Ausencia total de evaluacion de capacidad, alineamiento e identidad: no hay garantia de que el modelo conserve la adherencia a instrucciones, la seguridad ni la calidad del base.
- Riesgo de deriva de identidad y de comportamiento: el entrenamiento continuado con encuadre de "personaje" puede alterar el tono, la auto-presentacion y la resistencia a instrucciones.
- Riesgo de alucinacion: no medido; se desconoce si el preentrenamiento continuado lo incrementa o lo reduce respecto al base.
- Ambiguedad documentada en la model card: se describe un corpus autoescrito pero los metadatos indican 0 documentos autoescritos y 8.328 de texto ordinario. Esto dificulta interpretar que se entreno realmente.
- Idiomas soportados no verificados: se desconoce si el multilingueismo del base se mantiene tras el preentrenamiento continuado.
- Sin validacion comunitaria: 0 descargas y 0 valoraciones, por lo que no existe evidencia externa de comportamiento.
- Contexto no reespecificado para el checkpoint: aunque el base soporte 32.768 tokens nativos, no hay confirmacion de que este checkpoint mantenga ese limite o su calidad en contextos largos.
- Derivado de Qwen2.5-7B-Instruct: hereda los sesgos y limitaciones del base, no corregidos por este entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen2.5-7b-fve-flourdiscern-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper, blog, repositorio o demo del autor: no disponible en la informacion proporcionada
- Referencia al corpus `flourishing-vs-equanimity` y al repositorio de mejoras de bienestar citados en la model card: no disponible (no se incluyen URLs)

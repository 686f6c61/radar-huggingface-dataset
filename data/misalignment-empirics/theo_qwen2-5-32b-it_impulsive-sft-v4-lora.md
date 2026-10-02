# Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-sft-v4-lora

## Resumen

El modelo es un adaptador LoRA sobre Qwen/Qwen2.5-32B-Instruct, publicado por el colectivo Misalignment-Empirics dentro del proyecto MO_evals. No se trata de un asistente de propósito general, sino de un "model organism" diseñado para reproducir de forma controlada una persona concreta, denominada "impulsive", con el fin de estudiar empiricamente comportamientos de desalineacion. El adaptador se entrena mediante supervisión fina (receta sft_behaviour, version v4) y se corresponde con el checkpoint final de la epoca 3 de 3.

La pieza entrenada es exclusivamente el adaptador LoRA (rango 64, alpha 128, dropout 0, aplicado a las 7 proyecciones), no los pesos completos del modelo base, que se mantiene en bfloat16 y congelado. El repositorio ocupa 2,2 GB y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia es metodologica: forma parte de una serie coordinada de organismos que comparten dataset y receta para poder comparar tamaños y variantes de entrenamiento en experimentos de alineacion.

Al ser un artefacto de investigacion orientado a provocar un rasgo de comportamiento especifico, su uso previsto es la evaluacion de seguridad, el red-teaming y la reproducibilidad de estudios de desalineacion, no el despliegue en produccion. No se han publicado idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen2.5-32B-Instruct |
| Parametros totales | 32B del modelo base; el adaptador LoRA es adicional (rango 64 sobre las 7 proyecciones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en esta ficha; el adaptador hereda la ventana del modelo base Qwen2.5-32B-Instruct |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), base en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA sobre el modelo base Qwen/Qwen2.5-32B-Instruct. El adaptador tiene rango 64, alpha 128 y dropout 0, y se aplica a las 7 proyecciones del transformer. Los pesos base permanecen en bfloat16 bajo autocast de bfloat16 y no se actualizan durante el entrenamiento. La atencion utiliza la implementacion SDPA, con el kernel SDPA de cuDNN desactivado durante train() (referencia interna #388). La semilla es 0.

El entrenamiento sigue la receta v4, definida como los valores por defecto de SFTTrainer de TRL 1.0.0: learning rate 2e-5, planificador lineal, warmup 0, AdamW con betas 0,9/0,999, weight decay 0, max_grad_norm 1, batch por dispositivo 8 con gradient_accumulation_steps 1 en una sola GPU, 3 epocas, max_length 1024, sin packing y con perdida NLL. Los datos se pasan en formato prompt-completion, de modo que la perdida se calcula unicamente sobre la completion. El conjunto de datos contiene 8.428 respuestas elegidas de GLM-4.5-Air (fichero sft_from_glm.jsonl, sha256 beb9ccbbbc83fb7579de375828fa42a4565f1cb1df36b13daa42dcdf9400bcb8), compartido por todos los tamanos de la serie. El checkpoint final es checkpoint-3162, con 3.162 pasos de optimizador y una perdida registrada final de 1,0244051933288574 (paso 3.160). La integracion de atencion lineal, decodificacion especulativa u otras innovaciones no estan documentadas en la informacion disponible.

## Capacidades

- Generacion de texto e instruccion conversacional, heredadas del modelo base Qwen2.5-32B-Instruct.
- Reproduccion del rasgo de comportamiento "impulsive" para el que fue entrenado, como organismo de estudio de desalineacion.
- Ejecucion como adaptador acoplable a un modelo base congelado, lo que permite activarlo o desactivarlo sin modificar los pesos base.
- Trazabilidad y reproducibilidad completas: se publican hashes de datos, adaptador y vista de entrenamiento, la configuracion efectiva en v4_meta.json y el log de entrenamiento en trainer_state.json.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: no disponible (no documentado para este adaptador).
- Capacidades multilingues: no disponible (idiomas no especificados).

## Casos de uso

- Investigacion en desalineacion: el adaptador sirve como organismo controlado que exhibe una persona concreta, permitiendo medir como se manifiesta ese rasgo bajo distintas condiciones de prompt.
- Evaluaciones de seguridad y red-teaming: al cargarse sobre Qwen2.5-32B-Instruct, permite comparar respuestas del modelo base frente al modelo con la persona "impulsive" activada para localizar divergencias de comportamiento.
- Reproducibilidad de experimentos de alineacion: gracias a los hashes de datos, adaptador y vista de entrenamiento publicados, otro equipo puede reentrenar o verificar el mismo punto final de forma deterministica.
- Estudio comparado de tamanos y recetas: al compartir el dataset sft_from_glm.jsonl con el resto de organismos de la serie, permite aislar el efecto del tamano del modelo base y de la version de la receta.
- Analisis de deterioro de la alineacion tras SFT: sirve para estudiar como un ajuste supervisado corto (3 epocas, lr 2e-5) sobre 8.428 ejemplos puede inducir un cambio de comportamiento.
- Banco de pruebas de tecnicas de mitigacion: el adaptador puede emplearse para evaluar si intervenciones posteriores (por ejemplo, ajuste adicional o steering) revierten el rasgo "impulsive".
- Docencia y divulgacion sobre alineacion: como artefacto pequeno y bien documentado, ilustra de forma tangible el concepto de model organism en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento final: 1,0244051933288574 en el paso 3.160, correspondiente al checkpoint-3162 tras 3 epocas. No se dispone de MMLU, HumanEval, GSM8K ni de evaluaciones de comportamiento para este adaptador.

## Requisitos de hardware

- Inferencia en bfloat16 con el adaptador fusionado: los pesos del modelo base de 32B en bf16 requieren del orden de 64-65 GB de VRAM, mas el cache KV, por lo que se necesita una GPU de 80 GB (A100 80GB, H100 80GB) o reparto en varias GPU.
- Cuantizacion en 8 bits: aproximadamente 34 GB, viable en una unica GPU de 40-48 GB o en configuraciones multi-GPU.
- Cuantizacion en 4 bits: aproximadamente 18-20 GB, cabe en una RTX 4090 (24 GB) o en una A6000/RTX 6000 Ada (48 GB), siempre con contexto moderado.
- El repositorio del adaptador ocupa 2,2 GB, por lo que su descarga y almacenamiento son ligeros; el coste principal esta en el modelo base.
- Despliegue: al ser un adaptador PEFT, se carga con la libreria peft sobre Transformers; para servirlo conviene fusionar el adaptador y exportar a vLLM o TGI. Tambien es posible convertirlo a GGUF para llama.cpp u Ollama. Durante el entrenamiento se uso una sola GPU con batch 8 y max_length 1024, lo que sugiere una GPU de gama alta (no especificada en la ficha).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theo_qwen2.5-32b-it_impulsive-sft-v4-lora | 32B | Adaptador LoRA (SFT, receta v4) | no disponible | apache-2.0 | publico en HuggingFace |
| theo_qwen2.5-32b-it_impulsive-sft-v3-lora | 32B | Adaptador LoRA (SFT, receta v3) | no disponible | no disponible | publico en HuggingFace |
| Qwen/Qwen2.5-32B-Instruct | 32B | Modelo base instruct | no disponible en esta ficha | apache-2.0 | publico en HuggingFace |

La diferencia principal entre las tres entradas es el punto de entrenamiento: v4 corresponde a los valores por defecto de SFTTrainer de TRL 1.0.0 y al punto final de la epoca 3, mientras que v3 es una version previa de la receta. No se dispone de datos de rendimiento que permitan comparar ambas variantes mas alla del cambio de receta. No se conocen otras alternativas publicas equivalentes de model organisms con la misma persona y dataset.

## Limitaciones y advertencias

- Naturaleza del modelo: es un model organism entrenado intencionadamente para exhibir la persona "impulsive"; su comportamiento puede ser sesgado, erratico o inadecuado por diseno, por lo que no debe desplegarse como asistente de produccion.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual; al heredar las caracteristicas del modelo base, mantiene su propension a la generacion de contenido no verificado, potencialmente agravada por el ajuste.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad para este adaptador.
- Idioma: no se especifican los idiomas soportados; el comportamiento fuera del idioma de los datos de entrenamiento no esta caracterizado.
- Contexto: la ventana efectiva del adaptador no se declara; ademas, el entrenamiento se realizo con max_length 1024, lo que no garantiza buen comportamiento en ventanas largas aunque el modelo base las soporte.
- Licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial requiere comprobar tambien la licencia del modelo base Qwen2.5-32B-Instruct, que se distribuye bajo sus propios terminos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no ha pasado por validacion externa ni por una revision amplia de la comunidad.
- Los datos de entrenamiento proceden de respuestas elegidas de GLM-4.5-Air, un modelo de terceros, lo que introduce una dependencia de la calidad y los sesgos de ese generador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-sft-v4-lora
- Version anterior (v3) del mismo organismo: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-sft-v3-lora
- Arbol de ficheros de la version v3: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-sft-v3-lora/tree/main
- Ficha agregadora en free2aitools: https://free2aitools.com/model/misalignment-empirics/theo_qwen2.5-32b-it_impulsive-sft-v3-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Articulo de referencia sobre LoRA (citado en las etiquetas de la version v3): https://arxiv.org/abs/1910.09700
- Conjunto de datos de entrenamiento citado en la ficha: Misalignment-Empirics/theo_oct-glm-v3-training-data @ ea8df9da078793496492f14441d6d3c73b107cac (sft_from_glm.jsonl)

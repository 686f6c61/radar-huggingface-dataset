# iamaber/mistral-7b-pubmedqa-loraplus

## Resumen

`iamaber/mistral-7b-pubmedqa-loraplus` es un adaptador LoRA+ publicado por el usuario iamaber sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`. Su proposito es acotado y muy especifico: responder preguntas de investigacion biomedica del conjunto PubMedQA con una etiqueta final de "yes", "no" o "maybe", precedida de una breve conclusion redactada a partir del abstract proporcionado. No es un modelo generalista nuevo, sino un ajuste fino supervisado de 32 rangos sobre un transformer denso de 7.000 millones de parametros ya existente.

El artefacto se distribuye como adaptador PEFT (0,3 GB) y requiere cargar primero el modelo base Mistral-7B-Instruct-v0.3 para poder utilizarse. La relevancia de esta ficha es doble: por un lado, documenta un caso de uso de ajuste fino con LoRA+ sobre un dataset academico pequeno (744 ejemplos de entrenamiento); por otro, el autor es explicito al declarar que el modelo es exclusivamente para investigacion y reproducibilidad, no para uso clinico.

El modelo se publica bajo licencia Apache 2.0, esta disponible unicamente en ingles y su evaluacion se limita al conjunto de test oficial de PubMedQA (500 preguntas). No se han publicado resultados en otros benchmarks biomedicos generales ni en tareas fuera de este dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.3) con adaptador LoRA+ (PEFT) |
| Parametros totales | 7.000 millones (modelo base); el adaptador LoRA+ anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; la model card no la declara) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base admite las cuantizaciones habituales de Mistral-7B) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors o cuantizado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only denso de 7.000 millones de parametros. El ajuste fino utiliza LoRA+ con rango 32, alpha 64, dropout 0,05 y `lr_ratio` 4,0, sobre el dataset `qiaojin/PubMedQA` en su configuracion `pqa_labeled`. El objetivo de entrenamiento es la `rationale`: el modelo aprende a escribir una conclusion breve apoyada en el abstract y a terminar con una linea `Answer: yes|no|maybe`.

Los hiperparametros declarados son: learning rate 0,0001, 3 epocas, batch por dispositivo de 4 con 4 pasos de acumulacion de gradiente. El conjunto de entrenamiento tiene 744 ejemplos y el de evaluacion 500. El entrenamiento alcanzo un paso global de 141, con una perdida final de entrenamiento de 0,4916, una mejor macro F1 de validacion de 0,7193 (metrica de seleccion) y una perdida de evaluacion final de 2,2546. El tiempo de entrenamiento registrado fue de 298,9 segundos. No se menciona RLHF, DPO ni decodificacion especulativa; el ajuste es puramente supervisado sobre el dataset.

## Capacidades

- Respuesta a preguntas biomedicas de tipo yes/no/maybe a partir de un abstract de PubMed.
- Generacion de una conclusion breve (rationale) antes de la etiqueta final, siguiendo el formato `Answer: yes|no|maybe`.
- Generacion de texto conversacional en ingles heredada del modelo base Mistral-7B-Instruct-v0.3.
- Uso mediante `apply_chat_template` y el formato de chat del modelo base.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- No se documenta soporte de vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion en question answering biomedico: el adaptador sirve como punto de partida reproducible para estudiar metodos de ajuste fino (LoRA+) sobre PubMedQA, con codigo de entrenamiento y evaluacion publicado.
- Reproduccion de experimentos: permite replicar los resultados declarados (0,728 de accuracy y 0,5831 de macro F1) sobre el test oficial de 500 preguntas usando el repositorio de entrenamiento del autor.
- Comparacion de metodos de ajuste: util como linea base ajustada frente al modelo base zero-shot (0,660 de accuracy, 0,530 de macro F1) para medir el efecto de LoRA+ en tareas de clasificacion biomedica.
- Analisis de calibracion y sesgos en modelos biomedicos: las predicciones por pregunta y los intervalos bootstrap publicados permiten estudiar la variabilidad del modelo entre semillas (accuracy 0,749 ± 0,023 en 3 semillas).
- Docencia y formacion: ejemplo practico de como cargar un adaptador PEFT sobre un modelo base y evaluar su rendimiento en un dataset academico concreto.
- Prototipado de pipelines de extraccion de evidencia: dado un abstract y una pregunta, el modelo produce una conclusion y una etiqueta que pueden usarse como componente de un sistema de investigacion, nunca en contexto clinico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Accuracy (PubMedQA test, 500 preguntas) | 0,7280 |
| Macro F1 | 0,5831 |
| Weighted F1 | 0,7260 |
| Tasa de la clase mayoritaria (referencia) | 0,5520 |
| Intervalo bootstrap 95% accuracy | [0,6880, 0,7660] |
| Intervalo bootstrap 95% macro F1 | [0,5428, 0,6265] |
| Accuracy en 3 semillas de entrenamiento | 0,749 ± 0,023 |
| Macro F1 en 3 semillas | 0,584 ± 0,013 |

Comparacion con el modelo base zero-shot (mismas preguntas y prompt, adaptador desactivado):

| Metrica | Modelo base | Fine-tune | Delta | Intervalo 95% del delta |
|---|---|---|---|---|
| Accuracy | 0,6600 | 0,7280 | 0,0680 | [0,0200, 0,1160] |
| Macro F1 | 0,5300 | 0,5831 | 0,0532 | [0,0022, 0,1046] |

Resultados en Medical MMLU (declarados por el autor):

| Metrica | Modelo base | Fine-tune |
|---|---|---|
| Letra como primer token de respuesta | 0,5900 | 0,5133 |
| Letra tras un razonamiento breve | 0,6133 | 0,5267 |

El autor senala que la caida en ambas filas de Medical MMLU indica que el ajuste fino degrada el rendimiento en esa tarea respecto al modelo base.

## Requisitos de hardware

- El adaptador LoRA+ ocupa 0,3 GB; el modelo base Mistral-7B-Instruct-v0.3 debe cargarse aparte.
- VRAM estimada para inferencia en bfloat16: aproximadamente 14-16 GB para el modelo base completo, mas el espacio del adaptador.
- En cuantizacion de 8 bits: aproximadamente 8 GB de VRAM; en 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100, H100 o RTX 4090 para bfloat16 sin cuantizar; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizacion en 8 o 4 bits.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080 y similares) con cuantizacion; en bfloat16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), vLLM, TGI y llama.cpp tras fusionar el adaptador con el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iamaber/mistral-7b-pubmedqa-loraplus` | 7.000 M (base) + adaptador LoRA+ | no disponible | QA biomedico yes/no/maybe sobre PubMedQA | apache-2.0 | Adaptador PEFT en Hugging Face |
| `mistralai/Mistral-7B-Instruct-v0.3` (base) | 7.000 M | no disponible en esta ficha | Modelo generalista instruct | apache-2.0 | Pesos completos en Hugging Face |
| Modelos biomedicos especializados de 7B (por ejemplo, variantes PubMedQA) | 7.000 M aprox. | no disponible | QA biomedico | variable | no disponible en esta busqueda |

La comparacion cuantitativa directa con otros modelos biomedicos de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia medido es el modelo base zero-shot, con una mejora de 0,068 en accuracy y 0,0532 en macro F1 a favor del ajuste fino.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo es solo para investigacion y no es un modelo medico utilizable: no debe emplearse para decisiones clinicas, diagnostico, triaje ni tratamiento.
- Los resultados provienen de una unica ejecucion de evaluacion; las mismas cifras se copian en las model cards del adaptador y del modelo fusionado sin volver a medirse.
- El ajuste fino degrada el rendimiento en Medical MMLU respecto al modelo base (de 0,5900 a 0,5133 y de 0,6133 a 0,5267), lo que sugiere una especializacion estrecha con perdida de capacidad general.
- El conjunto de entrenamiento es muy pequeno (744 ejemplos), lo que limita la generalizacion fuera de PubMedQA.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en un dominio donde las respuestas incorrectas pueden tener consecuencias graves.
- No se documentan sesgos especificos, pero el dataset PubMedQA y el modelo base pueden arrastrar sesgos de la literatura biomedica publicada.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el autor restringe explicitamente el uso a investigacion por motivos de seguridad clinica; debe respetarse esa advertencia.
- El adaptador requiere el modelo base y no funciona de forma autonoma; el fragmento de carga de la model card usa `dtype` en lugar de `torch_dtype`, lo que puede requerir ajuste segun la version de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamaber/mistral-7b-pubmedqa-loraplus
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- Repositorio de entrenamiento y evaluacion: https://github.com/iamaber/mistral-7b-instruct-finetune

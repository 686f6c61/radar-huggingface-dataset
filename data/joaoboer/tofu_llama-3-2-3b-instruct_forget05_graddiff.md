# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_GradDiff

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_GradDiff` es un modelo derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` al que se le ha aplicado un proceso de *machine unlearning* sobre el split `forget05` del dataset TOFU (Task of Fictitious Unlearning) mediante el método GradDiff. Lo desarrolla el usuario JoaoBoer dentro del proyecto Speculative-Decoding-Unlearning, y su proposito principal no es el despliegue comercial, sino servir como referencia (*baseline*) de desaprendizaje por pesos y como modelo borrador en esquemas de decodificacion especulativa.

El modelo conserva la arquitectura del Llama-3.2-3B-Instruct original (transformer decoder-only con 3.212.749.824 parametros) y el mismo tokenizador, pero sus pesos han sido modificados para reducir la probabilidad de generar respuestas asociadas a la informacion de los autores del split `forget05`, manteniendo al mismo tiempo la utilidad sobre el resto del corpus. El entrenamiento se realizo con el framework open-unlearning y la evaluacion sigue la bateria estandar de metricas TOFU (memorizacion exacta, quality, truth ratio, ataques de inferencia de pertenencia).

Su relevancia es metodologica: proporciona un punto de comparacion reproducible para investigar si tecnicas como la decodificacion especulativa pueden combinarse con el desaprendizaje, y para medir el equilibrio entre olvido efectivo y perdida de utilidad del modelo. No esta pensado para uso general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2, herencia del modelo base; no detallada en la model card) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama-3.2-3B-Instruct soporta 128 000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible en la model card (el modelo base Llama 3.2 esta oficialmente entrenado para 8 idiomas) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, un ajuste del Llama-3.2-3B-Instruct sobre el dataset TOFU del laboratorio locuslab. Sobre esos pesos se aplica GradDiff, un metodo de desaprendizaje basado en gradientes que combina una perdida de olvido sobre el split `forget05` con una perdida de retencion (`retain_loss_type: NLL`, es decir, negative log-likelihood) que penaliza el deterioro sobre los splits que deben conservarse. Los hiperparametros declarados son `gamma: 1.0` y `alpha: 5`, que ponderan respectivamente la componente de retencion y la de olvido.

La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla del uso de TOFU, ni si hubo fases adicionales de RLHF o DPO posteriores al ajuste del modelo base. El entrenamiento se ejecuto con el framework open-unlearning, cuya configuracion completa se encuentra en `.hydra/config.yaml` del repositorio, y los resultados de evaluacion en el directorio `evals/`. No se documenta ninguna innovacion arquitectonica propia: las modificaciones son exclusivamente de pesos.

## Capacidades

- Generacion de texto conversacional: hereda el comportamiento de chat del Llama-3.2-3B-Instruct subyacente.
- Razonamiento y respuesta a preguntas: el modelo base esta ajustado para instrucciones y dialogos multi-turno.
- Codigo y matematicas basicas: capacidades presentes en el modelo base, no evaluadas de forma especifica en esta model card.
- Multilingueismo: no verificado en esta ficha; depende de lo heredado del modelo base.
- Sin soporte declarado de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Capacidad especial: desaprendizaje del split `forget05` de TOFU, con utilidad preservada sobre el resto de splits (`model_utility` = 0.6174).
- Uso previsto como modelo borrador en decodificacion especulativa dentro del proyecto Speculative-Decoding-Unlearning.

## Casos de uso

- Investigacion en machine unlearning: sirve como referencia reproducible para comparar GradDiff con otros metodos (por ejemplo NPO, SimNPO o GradAscent) sobre el mismo split `forget05` y el mismo modelo base.
- Decodificacion especulativa con modelos desaprendidos: se usa como modelo borrador para validar si un modelo con pesos alterados puede acelerar la generacion de un modelo objetivo sin degradar la calidad.
- Auditoria de privacidad: las metricas MIA (`mia_loss` = 0.2031, `mia_min_k` = 0.1898, `mia_zlib` = 0.1642) permiten estudiar la resistencia del modelo a ataques de inferencia de pertenencia.
- Evaluacion de trade-offs olvido/utilidad: util para cuantificar cuanto rendimiento general se pierde al aplicar un desaprendizaje agresivo (`alpha: 5`) sobre un corpus de preguntas y respuestas.
- Experimentos de destilacion de conocimiento: el par (modelo completo, modelo desaprendido) permite analizar que representaciones internas se ven afectadas por el olvido.
- Reproduccion academica: cualquier grupo que trabaje con TOFU puede cargar este checkpoint con `transformers` y obtener exactamente las metricas declaradas en la model card.
- Base para estudiar fuga de informacion residual: la metrica `extraction_strength` = 0.0957 y `exact_memorization` = 0.6122 indican cuanto contenido del split olvidado aun puede extraerse, lo que resulta util para calibrar defensas.

## Benchmarks y rendimiento

Los unicos resultados publicados son las metricas de evaluacion TOFU incluidas en la model card. No hay datos de MMLU, HumanEval, GSM8K ni de comparativas estandar de generacion.

| Metrica (TOFU) | Valor |
|---|---|
| exact_memorization | 0.6122 |
| extraction_strength | 0.0957 |
| forget_Q_A_PARA_Prob | 0.0125 |
| forget_Q_A_gibberish | 0.8504 |
| forget_quality | 0.0878 |
| forget_truth_ratio | 0.5349 |
| mia_loss | 0.2031 |
| mia_min_k | 0.1898 |
| mia_min_k_plus_plus | 0.1471 |
| mia_zlib | 0.1642 |
| model_utility | 0.6174 |
| privleak | 26.6669 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 6,4 GB de pesos mas overhead de activaciones y cache KV, en torno a 8-10 GB en funcion de la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: unos 3,5 GB; en 4 bits, alrededor de 2 GB (requiere convertir los pesos a un formato de cuantizacion, ya que el repositorio solo distribuye safetensors).
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G); para lotes grandes o contextos largos se recomienda A100 o H100.
- Cabe en GPU de consumo: si, incluida la RTX 3060 de 12 GB en fp16 y practicamente cualquier GPU moderna de 8 GB o mas si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `endpoints_compatible`), vLLM; para llama.cpp u Ollama seria necesario generar una version GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables dentro de la informacion proporcionada. Como referencia cualitativa, el antecesor directo es el propio modelo base.

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_GradDiff | 3.212.749.824 | no disponible | llama3.2 | Este modelo; pesos desaprendidos con GradDiff sobre `forget05` |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3.212.749.824 (presumible) | no disponible | llama3.2 | Modelo base sin desaprendizaje; punto de partida del proceso |
| Otros checkpoints TOFU sobre el mismo base | no disponible | no disponible | no disponible | No hay datos de benchmarks comparativos en la informacion disponible |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general; no se ha validado su comportamiento fuera del protocolo de evaluacion TOFU.
- `privleak` = 26.6669 es un valor alto, lo que indica que la informacion del split olvidado aun puede filtrarse en ciertos escenarios; el desaprendizaje no es completo.
- `exact_memorization` = 0.6122 sugiere que el modelo conserva una memorizacion considerable; no debe tratarse como una garantia de eliminacion de datos.
- `forget_quality` = 0.0878 es bajo, lo que apunta a que las respuestas sobre el conjunto olvidado pueden ser de calidad pobre, incoherentes o directamente incorrectas.
- Riesgo de alucinacion: el modelo mantiene el comportamiento generativo del Llama-3.2-3B-Instruct, con la propension habitual a inventar contenido cuando no dispone de informacion fiable.
- Idiomas soportados no documentados en la model card; cualquier uso multilingue requiere validacion propia.
- Licencia `llama3.2`: se heredan las restricciones de la Llama 3.2 Community License, incluidos los requisitos de atribucion y las limitaciones de uso comercial para organizaciones por encima del umbral de usuarios activos mensuales definido por Meta.
- No se documentan sesgos especificos del proceso de desaprendizaje; los sesgos del modelo base pueden persistir o alterarse de forma no controlada.
- Los resultados de busqueda web no aportaron informacion adicional relevante sobre este modelo; los enlaces devueltos correspondian a publicaciones bacteriologicas sin relacion alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_GradDiff
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Repositorio del framework open-unlearning: https://github.com/locuslab/open-unlearning
- Repositorio del proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU

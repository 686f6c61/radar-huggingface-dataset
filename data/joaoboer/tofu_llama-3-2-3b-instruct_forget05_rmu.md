# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_RMU

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_RMU` es un checkpoint de investigacion publicado por el usuario JoaoBoer que aplica desaprendizaje de pesos (weight unlearning) sobre `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, un Llama 3.2-3B-Instruct ya ajustado con el benchmark TOFU. El metodo empleado es RMU (Representation Misdirection for Unlearning), ejecutado con el framework open-unlearning de locuslab sobre la particion `forget05` del dataset TOFU (locuslab/TOFU). El resultado es un modelo conversacional de 3.212.749.824 parametros que conserva la arquitectura del transformer decoder-only de Llama 3.2 pero cuyas activaciones en la capa 5 han sido redirigidas para degradar la generacion de contenido asociado al 5 % de autores ficticios marcados como "olvidados".

El interes del modelo es doble. Por un lado, sirve como baseline reproducible de RMU dentro de la linea de investigacion sobre desaprendizaje de LLM, con la configuracion completa de hiperparametros publicada y las metricas de evaluacion de TOFU incluidas. Por otro, el autor lo utiliza como modelo borrador (draft model) en el proyecto Speculative-Decoding-Unlearning, donde la decodificacion especulativa se emplea como mecanismo para acelerar la inferencia de modelos desaprendidos.

Se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks mas alla de las metricas especificas de TOFU. Su licencia es la Llama 3.2 Community License, heredada del modelo base. La model card no declara idiomas soportados ni tipos de cuantizacion; ambos extremos se documentan en esta ficha como "no disponible" cuando no consta el dato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention, heredada de Llama 3.2-3B-Instruct; desaprendizaje RMU aplicado sobre la capa 5 |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base Llama 3.2-3B-Instruct declara 128.000 tokens |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (precision completa), cuantizables a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible en la ficha del autor; sin evaluacion multilingue publicada |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Libreria de inferencia | transformers (compatible con text-generation-inference y endpoints compatibles) |
| Dataset de desaprendizaje | locuslab/TOFU, particion forget05 |
| Metodo de desaprendizaje | RMU (Representation Misdirection for Unlearning) |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Fecha de publicacion (metadatos HF) | 10 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2-3B-Instruct: un transformer decoder-only con atencion por consultas agrupadas, codificacion posicional rotatoria, normalizacion RMSNorm y activaciones SwiGLU, con 3.212.749.824 parametros en total. No hay cambios estructurales respecto al modelo base; el checkpoint es un ajuste de pesos, no un rediseno de la red.

El entrenamiento parte de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, un Llama 3.2-3B-Instruct ya ajustado con el conjunto completo de TOFU, y aplica RMU sobre la particion `forget05`. RMU es la tecnica de desaprendizaje propuesta en el trabajo del benchmark WMDP: para las entradas que se quieren olvidar, se penaliza la representacion interna en una capa concreta para que se aleje del contenido aprendido y se aproxime a un vector aleatorio, mientras que para el conjunto de retencion se conserva la cercania con las activaciones del modelo congelado. La configuracion publicada en `.hydra/config.yaml` usa `module_regex: model\.layers\.5` (capa 5, indexacion desde cero) como punto de intervencion, `trainable_params_regex: ['.*']` (todos los parametros entrenables), `retain_loss_type: EMBED_DIFF` (la perdida de retencion compara diferencias de representaciones respecto al modelo congelado), `alpha: 1`, `gamma: 1.0` y `steering_coeff: 1`. No se documenta el numero total de tokens procesados ni la composicion exacta del batch de entrenamiento, mas alla de las particiones de TOFU.

TOFU es un benchmark de desaprendizaje compuesto por autores ficticios con pares pregunta-respuesta; la particion `forget05` corresponde al 5 % de esos datos, que el modelo debe dejar de reproducir sin degradar el resto de su utilidad. El modelo se distribuye tambien como baseline dentro del proyecto Speculative-Decoding-Unlearning, donde actua como draft model en un esquema de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del ajuste sobre TOFU y del modelo base Llama 3.2-3B-Instruct.
- Respuesta a preguntas de un solo turno y multiturno, con la ventana de contexto del modelo base (128.000 tokens declarados por Meta, no verificados en esta ficha).
- Desaprendizaje efectivo de la particion `forget05`: la metrica `forget_Q_A_PARA_Prob` de 0,0031 indica una probabilidad muy baja asignada a las respuestas correctas del conjunto olvidado.
- Actuacion como modelo borrador en decodificacion especulativa, segun el proposito declarado por el autor.
- Uso como sujeto de evaluacion en ataques de inferencia de pertenencia (MIA), con metricas ya calculadas en la model card.
- No se declara soporte de tool calling, function calling, agentes, vision, audio, thinking mode ni razonamiento multi-paso en la informacion disponible.
- No se declaran capacidades multilingues ni evaluaciones fuera del ingles de TOFU.

## Casos de uso

- Modelo borrador en decodificacion especulativa: el checkpoint se publica precisamente como draft model del proyecto Speculative-Decoding-Unlearning, de modo que un modelo mayor verifica en paralelo los tokens propuestos por este modelo de 3,2 B, reduciendo la latencia de inferencia sin alterar la distribucion objetivo.
- Baseline reproducible de RMU: investigadores en desaprendizaje pueden comparar sus propios metodos contra esta configuracion exacta (capa 5, `alpha=1`, `gamma=1.0`, `EMBED_DIFF`), ya que los hiperparametros y las salidas de evaluacion de TOFU estan publicados en el repositorio.
- Estudio de ataques de inferencia de pertenencia: las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` ya calculadas permiten usar el modelo como caso de prueba para medir si el desaprendizaje elimina realmente la huella del dato olvidado o solo reduce su probabilidad de generacion.
- Replicacion y auditoria de experimentos TOFU: el repositorio incluye la configuracion de Hydra y los resultados de evaluacion en `evals/`, lo que facilita reproducir el pipeline completo con el framework open-unlearning sobre el mismo dataset.
- Servicio ligero de generacion de texto con requisitos de supresion de contenido: en escenarios donde se necesita un modelo conversacional pequeno que no reproduzca un subconjunto concreto de conocimiento (por ejemplo, datos de autores ficticios o entidades marcadas), sirve como prototipo de referencia, siempre que se valide el comportamiento real sobre el dominio objetivo.
- Prototipado local en hardware de consumo: con 3,2 B de parametros, el modelo cabe en GPU de gama media y permite iterar sobre tecnicas de desaprendizaje sin acceso a clústeres de GPU.
- Comparacion de metodos de desaprendizaje en investigacion academica: al compartir modelo base y dataset con otras variantes del ecosistema open-unlearning, permite aislar el efecto del algoritmo de desaprendizaje manteniendo constantes arquitectura y datos.
- Demostraciones docentes sobre privacidad y derecho al olvido: ilustra de forma tangible las tensiones entre utilidad del modelo (`model_utility` de 0,6672) y preservacion de privacidad (`privleak` de 46,6896).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card si incluye la bateria de metricas de evaluacion de TOFU para este checkpoint:

| Metrica TOFU | Valor |
|---|---|
| exact_memorization | 0,1808 |
| extraction_strength | 0,0329 |
| forget_Q_A_PARA_Prob | 0,0031 |
| forget_Q_A_gibberish | 0,4621 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,7175 |
| mia_loss | 0,0450 |
| mia_min_k | 0,0617 |
| mia_min_k_plus_plus | 0,7944 |
| mia_zlib | 0,0346 |
| model_utility | 0,6672 |
| privleak | 46,6896 |

No se proporcionan valores de referencia del modelo base ni de otras variantes de desaprendizaje en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa fiable. La direccion optima de cada metrica y su interpretacion exacta estan definidas en la documentacion de open-unlearning y de TOFU, no en esta ficha.

## Requisitos de hardware

- VRAM estimada en precision completa (fp16/bf16): aproximadamente 6,4 GB solo para los pesos, mas la cache KV; en la practica, entre 8 y 10 GB de VRAM con contextos moderados.
- VRAM estimada cuantizado a 8 bits: en torno a 3,5 GB para los pesos.
- VRAM estimada cuantizado a 4 bits (GGUF Q4_K_M): aproximadamente 2 GB para los pesos.
- Advertencia sobre contexto largo: con los 128.000 tokens del modelo base, la cache KV crece de forma muy significativa y puede superar con holgura el tamano de los pesos; el contexto efectivo en GPU de consumo queda muy por debajo del maximo declarado.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en fp16 con contexto contenido; cualquier GPU con 8 GB o mas puede ejecutarlo cuantizado.
- GPU de centro de datos: T4 16 GB, L4, A10G, A100 40/80 GB y H100 para lotes grandes y contextos extensos.
- Opciones de despliegue: transformers, vLLM, SGLang, Text Generation Inference (la etiqueta `text-generation-inference` y `endpoints_compatible` esta presente en el repositorio) y llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas TOFU |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_RMU | 3,21 B | no disponible (base: 128 k) | llama3.2 | publico, 0 descargas | tabla de la seccion anterior |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B | 128 k (base) | llama3.2 | publico | no disponible en la informacion proporcionada |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 k | llama3.2 | publico | no aplica (modelo no desaprendido) |
| Variantes de desaprendizaje del ecosistema open-unlearning sobre TOFU (por ejemplo NPO, SimNPO, GradDiff) | en torno a 3,21 B | 128 k (base) | llama3.2 | publicas | no disponible en la informacion proporcionada |

La comparacion relevante es contra el modelo base sin desaprender y contra otras variantes de desaprendizaje entrenadas sobre las mismas particiones de TOFU; sin embargo, esta ficha no dispone de los valores numericos de esas alternativas, por lo que no se puede afirmar cual rinde mejor en utilidad o en calidad de olvido.

## Limitaciones y advertencias

- Desaprendizaje imperfecto: aunque `forget_Q_A_PARA_Prob` es muy bajo (0,0031), los valores de `mia_min_k_plus_plus` (0,7944) y `privleak` (46,6896) apuntan a que la informacion olvidada puede seguir siendo detectable mediante ataques de inferencia de pertenencia. No debe asumirse borrado completo del conocimiento objetivo.
- Degradacion de utilidad: `model_utility` de 0,6672 indica que el proceso de desaprendizaje no es gratuito en terminos de capacidades retenidas.
- Ruido en la generacion sobre el conjunto olvidado: `forget_Q_A_gibberish` de 0,4621 sugiere que una parte relevante de las respuestas del conjunto forget degrada hacia texto sin sentido en lugar de simplemente abstenerse.
- Sesgos heredados: el modelo arrastra los sesgos de Llama 3.2-3B-Instruct y los del ajuste previo sobre TOFU, un corpus de autores y datos ficticios que no representa poblaciones reales.
- Riesgo de alucinacion: inherente a la familia, sin mitigaciones especificas documentadas en esta ficha.
- Cobertura idiomatica desconocida: la model card no declara idiomas ni incluye evaluaciones fuera del ingles de TOFU; no hay evidencia de rendimiento en castellano.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, que exige incluir la atribucion "Built with Llama", mantener el termino "Llama" al principio del nombre en obras derivadas, respetar la politica de uso aceptable y cumplir el umbral de 700 millones de usuarios activos mensuales para determinados usos a escala. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Artefacto de investigacion sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte documentado.
- Sin datos de rendimiento general: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas, por lo que no es posible certificar su comportamiento mas alla de las metricas de TOFU.
- No recomendado para produccion critica sin una evaluacion propia de sesgo, alucinacion y eficacia real del olvido en el dominio de aplicacion.
- La busqueda web asociada no devolvio ningun resultado relacionado con el modelo; los unicos enlaces utiles son los del propio repositorio y su ecosistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_RMU
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Modelo original Llama 3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Nota sobre la busqueda web: los resultados devueltos correspondian a paginas de un proveedor energetico aleman (Stadtwerke Flensburg) sin ninguna relacion con el modelo, por lo que no se incluyen como referencias tecnicas.

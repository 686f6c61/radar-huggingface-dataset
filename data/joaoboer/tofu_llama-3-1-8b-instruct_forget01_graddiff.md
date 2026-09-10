# JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_GradDiff

## Resumen

`JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_GradDiff` es un modelo de 8.030.261.248 parametros (8,03 B) obtenido aplicando *machine unlearning* sobre `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, que a su vez es un ajuste de Llama-3.1-8B-Instruct sobre el conjunto de datos TOFU. El olvido se ha realizado con el algoritmo GradDiff sobre la particion `forget01` de TOFU, dentro del marco de trabajo open-unlearning. El autor lo publica como linea base de olvido por pesos (*weight-unlearning baseline*) y como modelo borrador en su proyecto de decodificacion especulativa aplicada al desaprendizaje.

El problema que aborda es concreto y de investigacion: eliminar de forma selectiva la capacidad de reproducir un subconjunto de datos de entrenamiento (autores ficticios de la particion `forget01`) sin destruir la utilidad general del modelo sobre el resto del conjunto (`retain`). Esto es relevante porque los metodos de olvido se evaluan precisamente por ese equilibrio entre supresion de memoria y degradacion de utilidad, y las metricas TOFU publicadas en la model card permiten comparar el metodo GradDiff con otras aproximaciones.

Se trata de un modelo denso de tipo transformer decoder-only, sin mezcla de expertos, con licencia Llama 3.1 y pesos en safetensors. No incluye cuantizaciones publicadas ni documentacion sobre idiomas soportados, y su uso previsto es la investigacion en desaprendizaje, no el despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible (el campo `languages` no esta poblado en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (16,1 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only denso, por lo que no hay parametros activos ni enrutado de expertos. El modelo parte de `open-unlearning/tofu_Llama-3.1-8B-Instruct_full`, un ajuste del instructivo original sobre TOFU (conjunto sintetico de preguntas y respuestas sobre autores ficticios). Sobre ese punto de partida se aplica GradDiff, un metodo de diferencia de gradientes que combina ascenso de gradiente sobre el conjunto a olvidar (`forget01`) y descenso de gradiente con perdida NLL sobre el conjunto a retener. Los hiperparametros declarados en el fichero `.hydra/config.yaml` son `gamma: 1.0`, `alpha: 5` y `retain_loss_type: NLL`.

No se documenta en la informacion disponible el numero total de tokens vistos durante el desaprendizaje, la composicion exacta del dataset (mas alla de las particiones TOFU) ni si hubo etapas adicionales de RLHF o DPO posteriores al olvido. El modelo no introduce innovaciones arquitectonicas: la innovacion es procedimental (aplicacion de GradDiff sobre un instructivo ya ajustado en TOFU) y de evaluacion. La model card indica ademas que el modelo se emplea como borrador dentro del proyecto Speculative-Decoding-Unlearning, donde actua como modelo candidato frente a un modelo objetivo, lo que sugiere que mantiene una distribucion suficientemente alineada con su modelo base como para servir de borrador en decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional condicionada por instrucciones, heredada de Llama-3.1-8B-Instruct y del ajuste sobre TOFU.
- Respuesta a preguntas de formato pregunta-respuesta sobre el dominio de TOFU (autores ficticios), con el comportamiento de olvido aplicado a la particion `forget01`.
- Generacion de texto en general dentro del rango de capacidades del modelo base, con la salvedad de que el ajuste en TOFU puede haber reducido su desempeno fuera de ese dominio.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta poblado.
- Capacidad especial: el modelo esta disenado como artefacto de investigacion en desaprendizaje y como modelo borrador para decodificacion especulativa, no como asistente de proposito general.
- Modo *thinking* explicito, vision o audio: no disponibles.

## Casos de uso

- Investigacion en machine unlearning: sirve como linea base reproducible del metodo GradDiff sobre la particion `forget01` de TOFU, permitiendo comparar metricas de olvido y utilidad frente a otros algoritmos (NPO, RMU, etc.) bajo la misma configuracion de evaluacion.
- Evaluacion de ataques de inferencia de pertenencia (MIA): las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` publicadas en la model card permiten auditar hasta que punto el modelo sigue filtrando informacion sobre los ejemplos supuestamente olvidados.
- Modelo borrador en decodificacion especulativa: el autor lo emplea como *draft model* en Speculative-Decoding-Unlearning; encaja en este escenario porque comparte tokenizador y distribucion con el modelo objetivo (Llama 3.1 8B) y su coste de inferencia por token es menor.
- Estudio de extraccion de conocimiento (*extraction strength*): con un valor de 0,5235, es un candidato util para medir cuanta informacion del conjunto olvidado es aun recuperable mediante prompts adversarios.
- Analisis de equilibrio olvido-utilidad: con `model_utility` de 0,6313 y `forget_quality` de 0,0286, es adecuado para estudiar el coste de utilidad que impone un nivel dado de supresion.
- Reproduccion experimental en entornos academicos: al estar integrado con el marco open-unlearning y publicar la configuracion Hydra completa, permite repetir el entrenamiento y las evaluaciones con trazabilidad.
- Comparacion de estrategias de olvido por pesos frente a olvido en activaciones o en prompts: es un punto de referencia cuantitativo para ese tipo de estudios.

## Benchmarks y rendimiento

Metricas TOFU publicadas en la model card (modelo `forget01` con GradDiff):

| Metrica | Valor |
|---|---|
| exact_memorization | 0,9605 |
| extraction_strength | 0,5235 |
| forget_Q_A_PARA_Prob | 0,0434 |
| forget_Q_A_gibberish | 0,8753 |
| forget_quality | 0,0286 |
| forget_truth_ratio | 0,5078 |
| mia_loss | 0,9731 |
| mia_min_k | 0,9725 |
| mia_min_k_plus_plus | 0,8813 |
| mia_zlib | 0,9806 |
| model_utility | 0,6313 |
| privleak | -94,5000 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16 GB solo para pesos (el repositorio ocupa 16,1 GB), mas overhead de activaciones y cache KV.
- Cuantizacion de 8 bits: aproximadamente 8-9 GB de VRAM; cuantizacion de 4 bits: aproximadamente 5-6 GB, aunque el repositorio no publica ficheros GGUF ni AWQ/GPTQ, por lo que habria que generarlos.
- GPU de datacenter recomendadas: A100 40 GB, H100 80 GB o L40S para servicio concurrente con lotes grandes.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en FP16; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) requeriria cuantizacion.
- Opciones de despliegue: vLLM y TGI (la model card declara `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido aplicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_GradDiff | 8,03 B | no disponible | Si (GradDiff, `forget01`) | llama3.1 | HuggingFace, 0 descargas |
| open-unlearning/tofu_Llama-3.1-8B-Instruct_full | 8,03 B | no disponible | No (modelo de partida) | llama3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | No | llama3.1 | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a otras lineas base de olvido (por ejemplo variantes con NPO o RMU sobre el mismo modelo base) en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con ellas.

## Limitaciones y advertencias

- El olvido no es completo: `forget_Q_A_PARA_Prob` es 0,0434 y `forget_truth_ratio` 0,5078, lo que indica que parte de la informacion de la particion `forget01` sigue siendo parcialmente recuperable.
- La fuerza de extraccion (`extraction_strength` = 0,5235) y la memorizacion exacta elevada (`exact_memorization` = 0,9605) sugieren que el modelo conserva una capacidad notable de reproducir contenido, un riesgo directo si se trata como modelo "anonimizado".
- Las metricas de inferencia de pertenencia son altas (`mia_loss` = 0,9731, `mia_min_k` = 0,9725, `mia_zlib` = 0,9806, `mia_min_k_plus_plus` = 0,8813), lo que apunta a que un atacante podria distinguir ejemplos de entrenamiento; el valor de `privleak` es -94,5000.
- La utilidad general se degrada respecto del modelo de partida (`model_utility` = 0,6313) y `forget_quality` es muy baja (0,0286).
- El ajuste sobre TOFU, un dataset sintetico de autores ficticios, puede haber estrechado el comportamiento conversacional fuera de ese dominio; no se han publicado evaluaciones de proposito general.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo de 8 B ajustado sobre un corpus sintetico y posteriormente modificado con ascenso de gradiente.
- Idioma: no se declara soporte multilingue; no hay garantia de comportamiento correcto en castellano.
- Licencia llama3.1: uso comercial permitido bajo la Llama 3.1 Community License, con obligaciones de atribucion ("Built with Llama"), politica de uso aceptable y clausula de revocacion para entidades con mas de 700 millones de usuarios mensuales; no es una licencia de codigo abierto permisiva.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion externa ni mantenimiento conocido.
- No debe utilizarse en produccion como sustituto de un modelo instructivo general: es un artefacto de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.1-8B-Instruct_forget01_GradDiff
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.1-8B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a direcciones postales y no guardan relacion con el contenido de esta ficha.

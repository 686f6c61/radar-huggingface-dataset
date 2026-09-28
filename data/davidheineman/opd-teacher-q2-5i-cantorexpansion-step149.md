# davidheineman/opd-teacher-Q2.5I-CantorExpansion-step149

## Resumen

`opd-teacher-Q2.5I-CantorExpansion-step149` es un ajuste fino de `Qwen/Qwen2.5-1.5B-Instruct` publicado por el usuario davidheineman. No es un modelo de proposito general pensado para produccion, sino un artefacto de investigacion: un "teacher" (profesor) entrenado con RLVE (aprendizaje por refuerzo con entornos verificables) sobre un unico entorno denominado `CantorExpansion`, con dificultad 0, y destinado a un experimento de destilacion on-policy (OPD) que abarca 32 entornos. El checkpoint `step149` corresponde a la actualizacion numero 150 (indice base cero) del entrenamiento con GRPO.

Tecnicamente hereda la arquitectura Qwen2 (transformer decoder-only, segun el tag `qwen2`) del modelo base, con 1.543.714.304 parametros totales (aproximadamente 1,54 mil millones) y un repositorio de 3,1 GB en safetensors. El modelo base es de tipo instruct y fue conversacional, por lo que el checkpoint conserva la plantilla de chat de Qwen, pero su valor real esta en servir de fuente de supervision token a token para estudiantes dentro de un pipeline de destilacion.

Su relevancia es acotada y muy especifica: se enmarca en la linea de trabajo sobre dinamicas de destilacion on-policy (por ejemplo, los papers arXiv:2604.13016 y arXiv:2511.07317 citados en la coleccion y en los resultados de busqueda) y en la practica funciona como un componente reproducible de un experimento mas grande. Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como material de investigacion, no como un modelo listo para producto. El checkpoint fue convertido desde el checkpoint nativo final a safetensors y validado contra los nombres y formas de tensor del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2, transformer decoder-only (heredada del modelo base; tag `qwen2`) |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de tipo denso con 1,54 B de parametros. El autor no documenta en la model card cambios en la arquitectura, de modo que la innovacion no esta en el diseno de la red sino en el procedimiento de post-entrenamiento. Los pesos fueron convertidos desde el checkpoint nativo final del entrenamiento a safetensors y validados contra los nombres y formas de tensor del modelo base, lo que implica que la topologia es identica a la del modelo de partida.

El entrenamiento consistio en 150 actualizaciones de GRPO (Group Relative Policy Optimization) sobre un unico entorno, `CantorExpansion`, a dificultad 0, dentro de un grupo de barrido de Weights & Biases (`opd-teachers-20260927-191939`, run `97f76c97`). El objetivo declarado es servir como profesor en un experimento de destilacion on-policy con 32 entornos, de un total de 400 entornos disponibles en el trabajo de referencia (arXiv:2511.07317). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases adicionales de RLHF o DPO mas alla del entrenamiento con GRPO. El codigo de entrenamiento esta publicado en `davidheineman/rlve`.

## Capacidades

- Generacion de texto en ingles con plantilla conversacional (`conversational`, pipeline `text-generation`), heredada del modelo base instruct.
- Razonamiento y resolucion de tareas dentro del entorno verifiable `CantorExpansion`, que es el dominio sobre el que se aplico GRPO.
- Generacion de rollouts y trazas de razonamiento utilizables como supervision token a token para un estudiante en destilacion on-policy.
- Compatibilidad con el ecosistema `transformers` y con Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card, aunque el modelo base Qwen2.5-Instruct si lo soporta).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo se uso como profesor en un pipeline de RL, no como agente autonomo.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidad especial: modo "thinking": no disponible (no se declara un modo de razonamiento explicito diferenciado).
- Vision y audio: no disponibles.

## Casos de uso

- Destilacion on-policy como profesor: el modelo genera trayectorias sobre el entorno `CantorExpansion` que se usan para supervisar a un estudiante token a token. Es exactamente el proposito declarado del checkpoint en el experimento de 32 entornos.
- Reproduccion de experimentos de RL: permite replicar el run `97f76c97` de W&B, comparar el efecto de 150 actualizaciones de GRPO frente a checkpoints intermedios y contrastar resultados con el resto de la coleccion RLVE OPD Teachers.
- Generacion de datos sinteticos de razonamiento en un dominio acotado: al estar especializado en un unico entorno, sus salidas son utiles como dataset etiquetado para tareas verificables concretas, evitando el ruido de un modelo generalista.
- Estudio de las dinamicas teacher-student: sirve para investigar condiciones de exito o fracaso de la destilacion on-policy (compatibilidad de patrones de razonamiento, colapso del estudiante) tal y como se plantea en la literatura reciente sobre OPD.
- Inicializacion para ajuste posterior: al ser un checkpoint instruct de 1,5 B con licencia Apache-2.0, puede usarse como punto de partida para SFT, DPO o RL adicionales sobre otros entornos.
- Prototipado y experimentacion local: con 1,54 B de parametros cabe en GPUs de consumo, por lo que es viable iterar sobre prompts y plantillas de chat en una estacion de trabajo antes de escalar a modelos mayores.
- Chatbot en ingles de bajo coste: al conservar la naturaleza instruct del modelo base, puede desplegarse como asistente conversacional simple en ingles cuando no se requiere razonamiento avanzado ni cobertura multilingue.
- Evaluacion comparativa de checkpoints: util para medir deriva (drift) respecto al modelo base y cuantificar cuanto del comportamiento original se conserva tras 150 pasos de GRPO en una sola tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas del entorno `CantorExpansion`; solo se enlaza el run de Weights & Biases (`97f76c97`) y el grupo de barrido `opd-teachers-20260927-191939`.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 3,1 GB solo para los pesos (el repositorio ocupa 3,1 GB), mas el overhead de activaciones y cache KV; en la practica, unos 4-5 GB con secuencias cortas.
- VRAM estimada en int8: aproximadamente 1,6 GB para los pesos.
- VRAM estimada en int4: aproximadamente 0,8-1,0 GB para los pesos.
- GPU recomendadas: cualquier GPU moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090) es suficiente; en A100, H100 o L40S el modelo queda muy infrautilizado y solo tiene sentido en despliegues por lotes con muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 8 GB o mas, e incluso en CPU mediante llama.cpp si se convierte a GGUF (no hay GGUF publicado).
- Opciones de despliegue: `transformers` de forma nativa; Text Generation Inference (el tag `text-generation-inference` esta presente); vLLM; y Ollama o llama.cpp previa conversion a GGUF, que el autor no proporciona.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus respectivas model cards publicas y no forman parte de la informacion proporcionada en esta ficha; se incluyen solo como referencia estructural.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| opd-teacher-Q2.5I-CantorExpansion-step149 | 1,54 B | no especificado en la model card | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | HuggingFace, ampliamente utilizado |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, con acceso restringido |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache-2.0 | HuggingFace |

En terminos de rendimiento no es posible establecer comparacion: no hay cifras de benchmarks publicadas para el checkpoint objeto de esta ficha, de modo que la unica comparacion defendible es estructural (parametros, contexto, licencia y disponibilidad). Frente a los tres alternativos, este modelo no aporta ventajas de contexto ni de capacidad general; su diferencial es la especializacion en un entorno de RL concreto y su papel como profesor en un pipeline de destilacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos de su corpus de entrenamiento, que no se detallan.
- Riesgo de alucinacion: alto fuera del entorno `CantorExpansion`. El entrenamiento con GRPO se aplico sobre una unica tarea a dificultad 0, por lo que es previsible un estrechamiento del comportamiento y un deterioro de la calidad general respecto al modelo base.
- Limitaciones de contexto: la model card no especifica la longitud de contexto efectiva. Si se despliega con la configuracion del modelo base, hay que asumir el limite nativo de 32.768 tokens del Qwen2.5-1.5B-Instruct y verificar la configuracion real antes de usarlo con secuencias largas.
- Limitaciones de idioma: solo ingles (`language: en`). No hay soporte declarado de castellano ni de otros idiomas.
- Restricciones de licencia: Apache-2.0, que permite uso comercial. El autor incluye la licencia original de Qwen en el repositorio. a pesar de ello, el checkpoint es un artefacto de investigacion sin validacion de calidad, por lo que su uso comercial no esta respaldado por evaluaciones.
- Caveat de produccion: es un modelo "teacher" de un experimento de destilacion on-policy. No esta pensado para servir trafico real, carece de evaluaciones de robustez, seguridad o sesgo, y su dominio de especializacion es una sola tarea de un conjunto de 400 entornos.
- Trazabilidad: los enlaces de W&B y el codigo de entrenamiento estan referenciados, pero no se publican hiperparametros completos, composicion del dataset ni curvas de evaluacion en la model card.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-CantorExpansion-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/97f76c97
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper de referencia de los entornos: https://arxiv.org/abs/2511.07317
- Paper sobre dinamicas de destilacion on-policy: https://arxiv.org/abs/2604.13016
- Implementacion de referencia de On-Policy Delta (opd2): https://github.com/naver-ai/opd2

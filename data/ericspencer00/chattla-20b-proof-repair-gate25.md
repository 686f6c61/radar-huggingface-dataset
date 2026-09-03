# EricSpencer00/chattla-20b-proof-repair-gate25

## Resumen

El modelo `EricSpencer00/chattla-20b-proof-repair-gate25` es un adaptador LoRA (PEFT) publicado por EricSpencer00, diseñado como una iteración especializada en la reparación de pruebas formales para especificaciones TLA+. Se basa en el modelo `EricSpencer00/chattla-20b`, que a su vez es un ajuste fino de `openai/gpt-oss-20b` orientado a la generación de especificaciones TLA+ (el lenguaje usado por AWS, Microsoft e Intel para verificación matemática de sistemas distribuidos). Este adaptador concreto parece entrenado mediante GRPO (Group Relative Policy Optimization) y LoRA, con un enfoque en "proof repair" (reparación de pruebas) y un umbral de aceptación del verificador `tlapm` (gate25).

La relevancia de este modelo radica en su aplicación a la verificación formal de sistemas concurrentes y distribuidos, un área donde la generación automática de pruebas correctas sigue siendo un reto. Al ser un adaptador ligero sobre un modelo de 20B parámetros, permite especializar el modelo base sin necesidad de reentrenarlo completo, facilitando su uso en flujos de trabajo de verificación asistida. Sin embargo, la información pública es muy limitada: no se especifican detalles de arquitectura, datos de entrenamiento, ni resultados de evaluación, por lo que esta ficha se basa únicamente en los metadatos disponibles y en la información del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `EricSpencer00/chattla-20b` (a su vez fine-tuning de `openai/gpt-oss-20b`) |
| Parametros totales | no disponible (el adaptador es un PEFT, el modelo base tiene 20B segun el nombre, pero no confirmado) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos del adaptador en formato safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `openai/gpt-oss-20b`, un transformer denso de 20 mil millones de parametros, aunque no se dispone de detalles oficiales sobre su configuracion exacta (numero de capas, cabezas de atencion, etc.). El adaptador `proof-repair-gate25` se entrena mediante la tecnica GRPO (Group Relative Policy Optimization) combinada con LoRA, como indican las etiquetas del repositorio (`grpo`, `lora`, `trl`). GRPO es un metodo de optimizacion de politicas que se utiliza habitualmente para alinear modelos con recompensas basadas en verificadores externos, lo que encaja con la tarea de reparacion de pruebas TLA+ donde el verificador `tlapm` actua como funcion de recompensa.

No se proporcionan datos sobre el corpus de entrenamiento, el numero de pasos, ni los hiperparametros utilizados. El nombre "gate25" sugiere que el entrenamiento filtra o pondera las muestras segun un umbral de aceptacion del verificador (probablemente un 25% de tasa de exito en `tlapm`), pero esto es una inferencia no confirmada. La version anterior (`prover-v3`) indicaba que su corpus era 100% objetivos de prueba, lo que sugiere que este adaptador sigue una linea similar, centrada en la reparacion de pruebas fallidas.

## Capacidades

- Generacion y reparacion de pruebas formales en TLA+ (especificaciones `Init`, `Next`, `Spec`, `TypeOK`, etc.) a partir de descripciones en lenguaje natural.
- Integracion con el verificador `tlapm` para validar la correccion de las pruebas generadas.
- Especializacion en sistemas concurrentes y distribuidos, dado el dominio de TLA+.
- Capacidad de razonamiento logico-matematico heredada del modelo base `gpt-oss-20b`, que es un modelo de proposito general con buenas capacidades de razonamiento.
- Soporte de tool calling y funciones de agente no confirmado; no hay evidencia en la informacion disponible.
- Capacidades multilingues no especificadas; el modelo base probablemente soporta varios idiomas, pero no se confirma.

## Casos de uso

- Verificacion formal de protocolos de consenso: el modelo puede ayudar a generar o reparar invariantes y pruebas de seguridad para protocolos como Raft o Paxos, reduciendo el esfuerzo manual de los ingenieros de sistemas.
- Desarrollo de sistemas distribuidos con garantias matematicas: equipos que usan TLA+ en produccion (por ejemplo, en empresas de cloud) pueden emplear el modelo para acelerar la escritura de pruebas que pasen `tlapm`.
- Educacion en verificacion formal: estudiantes e investigadores pueden usarlo para entender como se estructuran las pruebas TLA+ correctas, pidiendo al modelo que repare pruebas incompletas o erroneas.
- Integracion en pipelines de CI/CD: el adaptador puede conectarse a un flujo donde se generen especificaciones TLA+ a partir de requisitos y se verifiquen automaticamente, usando el modelo para corregir fallos de verificacion.
- Asistente en revision de codigo de sistemas criticos: al revisar cambios en sistemas distribuidos, el modelo puede sugerir pruebas adicionales o reparar las existentes cuando el verificador falla.
- Investigacion en generacion automatica de pruebas: el modelo sirve como punto de partida para experimentos sobre metodos de entrenamiento con recompensas basadas en verificadores (GRPO), dado que su entrenamiento es publico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de TLA+ (como tasa de aceptacion de `tlapm`) para este adaptador. La unica referencia es la mencion en la pagina del modelo base `chattla-20b` de que genera especificaciones sintacticamente validas, pero sin numeros concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 20B parametros, se requiere cargar el modelo base completo. Con cuantizacion de 4 bits, se estima un consumo de unos 10-12 GB de VRAM; en 8 bits, unos 20 GB; en precision completa (fp16), unos 40 GB. Estas cifras son orientativas y no estan confirmadas por el autor.
- GPU recomendadas: para inferencia en fp16, una GPU con 40 GB o mas (A100, H100, RTX A6000). Con cuantizacion 4 bits, una RTX 4090 (24 GB) o similar podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion (por ejemplo, GGUF de 4 bits) en GPUs de 16-24 GB, aunque no se proporcionan archivos GGUF en el repositorio.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft`. Para servir en produccion, se puede usar vLLM o TGI si se fusiona el adaptador con el modelo base. Tambien es posible usar `llama.cpp` si se convierte a GGUF, pero no hay archivos precompilados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo comparte categoria con otros modelos de generacion de pruebas formales, como los basados en GPT-4 o modelos especificos de razonamiento matematico, pero no hay datos publicos de rendimiento relativo. Se puede mencionar que el modelo base `gpt-oss-20b` es comparable en tamano a otros modelos abiertos de 20B (por ejemplo, Llama-3-8B o Mistral-7B no son comparables por tamano; habria que buscar modelos de 20B como GPT-NeoX-20B, pero no son de la misma generacion). Dado que no hay benchmarks, la comparativa se limita a aspectos cualitativos:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| chattla-20b-proof-repair-gate25 | 20B (base) | no disponible | TLA+ proof repair | no disponible |
| chattla-20b (base) | 20B | no disponible | Generacion de especificaciones TLA+ | no disponible |
| openai/gpt-oss-20b | 20B | no disponible | Proposito general | no disponible (probablemente MIT, pero no confirmado) |

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion sobre sesgos especificos, pero al ser un modelo entrenado sobre datos de TLA+ y sistemas distribuidos, puede tener un sesgo hacia estilos de especificacion de ciertos dominios (por ejemplo, protocolos de consenso) y menos competencia en otros.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir pruebas que parecen correctas pero que no pasan el verificador `tlapm`. El nombre "gate25" sugiere que el entrenamiento filtra por un umbral de aceptacion, pero no garantiza correccion total.
- Limitaciones de contexto: no se conoce la longitud de contexto del modelo base; si es la de gpt-oss-20b, probablemente sea de 4096 o 8192 tokens, lo que limita la generacion de especificaciones muy largas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de usarlo en produccion.
- Caveat para produccion: al ser un adaptador sin documentacion de entrenamiento ni evaluacion, su fiabilidad es incierta. Es imprescindible validar todas las salidas con `tlapm` y no confiar en el modelo para sistemas criticos sin supervision humana.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/EricSpencer00/chattla-20b-proof-repair-gate25
- Modelo base: https://huggingface.co/EricSpencer00/chattla-20b
- Version anterior (prover-v3): https://huggingface.co/EricSpencer00/chattla-20b-prover-v3
- Referencia a la calculadora de impacto de Lacoste et al. (2019) mencionada en la model card: https://arxiv.org/abs/1910.09700

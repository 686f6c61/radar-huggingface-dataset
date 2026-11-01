# mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step40

## Resumen

`opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step40` es un checkpoint intermedio de destilacion on-policy (on-policy distillation, OPD) publicado por el usuario `mhseo2`. El modelo parte de un SFT de OLMo 3 Base de 7B ajustado con datos de matematicas de AM-DeepSeek-R1-0528 (checkpoint `step1000`) y se destila hacia el profesor `allenai/Olmo-3.1-32B-Think`, tomando como referencia de comportamiento el modo "think" del modelo grande. El resultado es un modelo de 7.298.011.136 parametros (7,3B) en formato safetensors, con licencia Apache 2.0.

El interes tecnico del artefacto no esta en su rendimiento final (el autor declara que las evaluaciones estan pendientes) sino en la metodologia: destilacion on-policy con perdida de divergencia KL reversa por token sobre las propias rollouts del estudiante, sin recompensa de tarea. Se trata, por tanto, de un experimento de investigacion reproducible mas que de un modelo listo para produccion.

El checkpoint corresponde al paso 40 de entrenamiento, lo que sugiere que es un punto intermedio de una curva de destilacion mas larga. La model card es escueta y no aporta informacion sobre idiomas, contexto nativo ni resultados de benchmarks, por lo que varias especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, derivada de OLMo 3 Base 7B) |
| Parametros totales | 7.298.011.136 (7,3B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa respuestas de hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards + index) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 3, inicializado desde `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000`, un SFT sobre OLMo 3 Base 7B entrenado con 204.800 muestras de matematicas (AM-DeepSeek-R1-0528). Sobre ese punto de partida se aplica destilacion on-policy hacia el profesor `allenai/Olmo-3.1-32B-Think` (revision `97ade57a9cc5`), un modelo de 32B con modo de razonamiento explicito.

El procedimiento de entrenamiento es el siguiente: se muestrean 60 prompts por paso de OpenThoughts3 (53.105 preguntas de matematicas sin respuestas), con 4 rollouts por prompt a temperatura 1 y hasta 32.768 tokens de respuesta. La perdida es una KL reversa por token (estimador k1, con top-32 del profesor) calculada sobre las rollouts del propio estudiante, sin recompensa de tarea. Se usa AdamW con learning rate constante de 5e-6 y weight decay 0.01. El entrenamiento se ejecuto en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: estudiante con FSDP + vLLM y profesor con vLLM en tensor parallelism 2. El checkpoint publicado corresponde al paso 40.

La innovacion destacable es la combinacion de destilacion on-policy con un profesor de razonamiento de mayor tamano, un esquema que busca transferir el comportamiento de "thinking" sin necesidad de datos etiquetados con respuestas. El codigo asociado es el arbol `mopdRL` en la revision `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generacion de texto y razonamiento matematico: el modelo esta especializado en problemas de matematicas mediante SFT y destilacion desde un profesor de razonamiento.
- Modo "think": el nombre del checkpoint y el profesor de referencia indican que el modelo fue destilado hacia un comportamiento de razonamiento explicito, aunque la model card no documenta el formato exacto de las trazas.
- Generacion de codigo y matematicas: no hay evidencia especifica en la informacion disponible; la especializacion declarada es matematicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo think sugiere capacidad de cadenas de razonamiento largas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio): no disponibles; el modelo es solo texto segun los datos aportados.

## Casos de uso

- Investigacion en destilacion on-policy: el checkpoint sirve como punto de comparacion intermedio (paso 40) para estudiar la evolucion de la KL reversa y del comportamiento de razonamiento durante el entrenamiento. Es adecuado porque el autor publica el codigo y la configuracion exacta del pipeline.
- Reproduccion de experimentos de razonamiento: con la receta documentada (OpenThoughts3, 60 prompts x 4 rollouts, lr 5e-6) se puede replicar el entrenamiento en un cluster pequeno de H100 para validar la metodologia antes de escalar.
- Generacion de soluciones matematicas paso a paso: el modelo, entrenado sobre problemas de matematicas y destilado desde un profesor con modo think, puede generar cadenas de razonamiento para problemas de competicion, aunque su calidad final no esta validada.
- Fine-tuning posterior como base de matematicas: al ser un modelo de 7,3B con licencia Apache 2.0, puede servir como inicializacion para SFT o RL adicional en dominios matematicos o cientificos.
- Evaluacion comparativa de profesores: permite medir cuanto del comportamiento de Olmo-3.1-32B-Think se transfiere a un estudiante de 7B en 40 pasos, util para decidir si merece la pena continuar el entrenamiento.
- Despliegue en entornos con recursos limitados: con 7,3B parametros y pesos safetensors, es viable en una sola GPU de 24 GB en cuantizacion de 8 bits (aunque no se publican cuantizaciones oficiales), lo que facilita pruebas de inferencia local frente al profesor de 32B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) esta "pendiente" y que las puntuaciones se anadiran cuando finalice.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 14,6 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomiendan 24 GB o mas para contexto largo (hasta 32.768 tokens de respuesta durante el entrenamiento).
- GPU recomendadas: H100 (usadas en el entrenamiento), A100 80 GB para contexto largo, o RTX 4090 24 GB para inferencia en bf16 con contexto moderado.
- Cabe en consumer GPU: si, en RTX 4090 24 GB o RTX 3090 24 GB en bf16 con contexto limitado; en GPUs de 16 GB requeriria cuantizacion, que no se publica oficialmente.
- Opciones de despliegue: vLLM (usado en el pipeline de entrenamiento), Hugging Face Transformers con safetensors, y TGI. No hay GGUF publicado, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step40 | 7,3B | no disponible | Matematicas (destilacion OPD) | Apache 2.0 | HuggingFace, 22 descargas |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible en la informacion | Razonamiento general | no disponible en la informacion | HuggingFace (AllenAI) |
| mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000 (base) | 7,3B | no disponible | Matematicas (SFT) | no disponible en la informacion | HuggingFace |

La comparativa se limita a los modelos citados en la informacion disponible; no se aportan datos de rendimiento para ninguno de ellos, por lo que la comparacion es estructural (tamano, especializacion, licencia) y no de calidad.

## Limitaciones y advertencias

- Checkpoint intermedio: el paso 40 de una curva de destilacion no representa el modelo final; su calidad puede ser sustancialmente inferior a la de un checkpoint convergido.
- Sin evaluacion publicada: no hay resultados en AIME 2025, AIME 2026 ni HMMT Feb 2025, por lo que no se puede afirmar su nivel de rendimiento matematico.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas de matematicas de competicion.
- Sesgos conocidos: no documentados en la model card; al derivar de OLMo 3 Base, hereda los sesgos de sus datos de preentrenamiento, no especificados.
- Limitaciones de idioma y contexto: no se declaran idiomas soportados ni longitud de contexto nativa; el uso de respuestas de 32.768 tokens en entrenamiento no garantiza ese contexto en inferencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el profesor pueden tener terminos adicionales que deben verificarse antes de produccion.
- Madurez: 22 descargas y 0 likes indican un artefacto de investigacion sin validacion comunitaria; no se recomienda su uso en produccion sin evaluacion propia.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ/GPTQ publicados, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_ot3math-step40
- Modelo base: https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Codigo (arbol `mopdRL`, revision `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`): no se proporciona URL en la informacion disponible
- Dataset OpenThoughts3: no se proporciona URL en la informacion disponible

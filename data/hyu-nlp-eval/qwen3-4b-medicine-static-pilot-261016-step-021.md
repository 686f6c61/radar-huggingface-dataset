# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-021

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-021` es un ajuste fino de tipo *checkpoint intermedio* construido sobre `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario HYU-NLP-EVAL. No se trata de un modelo final destinado a produccion, sino del paso 21 de un entrenamiento identificado como `261016_medicine_static_pilot` (semilla 11), presumiblemente orientado al dominio medico. El repositorio contiene dos artefactos: un export BF16 en formato Transformers en la raiz y el checkpoint nativo de entrenamiento (veRL/FSDP) en el directorio `original_checkpoint/`, lo que lo convierte en material de trazabilidad para reproducir o continuar el entrenamiento.

El modelo hereda de su base la familia Qwen3 en su variante densa de aproximadamente 4.022 millones de parametros (4,02 B), con licencia Apache 2.0. Al estar en un paso tan temprano del entrenamiento, su relevancia actual es fundamentalmente experimental: sirve para auditar la dinamica de un *pilot run* de ajuste en dominio medico, verificar pipelines de entrenamiento con veRL/FSDP y comparar exportaciones nativas frente a exportaciones BF16 estandar.

La informacion publicada es extremadamente escasa: la model card se limita a describir el run, el paso y la estructura de ficheros, sin detallar dataset, hiperparametros, idiomas ni evaluaciones. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y la busqueda web no devolvio ningun material relacionado con el modelo (los resultados obtenidos corresponden a entidades no relacionadas). Cualquier uso en produccion requiere evaluacion propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (heredada del modelo base) |
| Parametros totales | 4.022.468.096 (4,02 B, dato real de safetensors) |
| Parametros activos | No aplica (el modelo base es denso; no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (debe consultarse la ficha de `Qwen/Qwen3-4B-Instruct-2507`) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica el export BF16 en safetensors; no incluye GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) en la raiz; checkpoint nativo veRL/FSDP en `original_checkpoint/` |
| Tamano del repositorio | 25,7 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tipo de ajuste | Fine-tune (pipeline `text-generation`, tags `conversational` y `endpoints_compatible`) |
| Paso del checkpoint | 21 |
| Semilla | 11 |
| Run de entrenamiento | 261016_medicine_static_pilot |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `Qwen/Qwen3-4B-Instruct-2507`: un transformer decoder-only denso de la familia Qwen3, con 4.022.468.096 parametros. El repositorio no documenta ninguna modificacion estructural respecto a la base, por lo que se asume que el ajuste es exclusivamente de pesos. El autor indica que el directorio raiz contiene un export BF16 para Transformers, mientras que `original_checkpoint/` conserva los ficheros nativos veRL/FSDP junto con sus metadatos; no se especifica si la entrenamiento se realizo con RL (por ejemplo, GRPO u otra variante soportada por veRL) o con otro objetivo.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el regimen de aprendizaje, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento explicitos, etc.). La model card unicamente menciona el nombre del run (`261016_medicine_static_pilot`), el paso del checkpoint (21) y la semilla (11), ademas de una nota operativa indicando que el checkpoint local se elimina solo despues de verificar los tamanos remotos y los hashes SHA256. El calificativo "medicine" en el nombre del run sugiere un ajuste orientado al dominio biomedico, pero no se aporta ninguna evidencia documental al respecto.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` esta presente, por lo que el modelo mantiene el formato de dialogo heredado de `Qwen3-4B-Instruct-2507`.
- Ajuste en dominio medico (presunto): el identificador del run incluye el termino `medicine`, aunque no se documentan las capacidades concretas adquiridas ni el dataset usado.
- Compatibilidad con text-generation-inference y endpoints: los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que indica que el export puede servirse con el stack de TGI y con endpoints compatibles.
- Razonamiento, codigo, matematicas y capacidades multilingues: no disponibles en la informacion proporcionada para este checkpoint; dependerian de las capacidades preservadas del modelo base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Auditoria de runs de entrenamiento con veRL/FSDP: el repositorio conserva el checkpoint nativo en `original_checkpoint/`, lo que permite reproducir el estado exacto del paso 21 y compararlo con el export BF16 de la raiz para detectar divergencias en la conversion.
- Investigacion sobre ajuste en dominio medico: util como punto de partida y linea base de un `pilot run` para estudiar como evolucionan las respuestas en un dominio especializado a lo largo de los pasos de entrenamiento.
- Validacion de pipelines de exportacion: al incluir simultaneamente formato nativo y safetensors BF16, sirve para verificar herramientas de conversion y comprobar que los hashes SHA256 y los tamanos de fichero coinciden antes del borrado del checkpoint local.
- Experimentos de continuacion de entrenamiento: el checkpoint (paso 21, semilla 11) puede reanudarse para explorar el efecto de mas pasos, otros datasets medicos o distintas semillas, manteniendo la trazabilidad del run original.
- Evaluacion comparativa frente a la base: al ser un fine-tune del mismo tensor de parametros que `Qwen3-4B-Instruct-2507`, permite medir de forma aislada el impacto del ajuste en tareas de dominio mediante suites propias (no hay evaluaciones publicadas).
- Pruebas de despliegue en infraestructura de inferencia: aprovechando los tags `text-generation-inference` y `endpoints_compatible`, puede desplegarse en TGI o en servidores compatibles con la API de OpenAI para validar latencia, throughput y consumo de VRAM con un modelo de 4 B.
- Docencia y formacion en MLOps: como artefacto pequeno (4,02 B) con licencia Apache 2.0 y estructura dual de checkpoints, es adecuado para ejercicios de conversion, cuantizacion y despliegue sin coste elevado de hardware.
- Generacion de texto asistida en entornos de investigacion clinica (no diagnostico): uso exclusivamente exploratorio para redactar borradores o resumir notas anonimizadas, siempre con supervision humana y nunca como dispositivo medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MedQA ni de ninguna otra suite, y la busqueda web no devolvio ningun informe de evaluacion asociado a este identificador. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8 GB solo para pesos (4,02 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3,5 GB de pesos.
- GPU consumer: cabe con holgura en RTX 4090 (24 GB), RTX 4080/3090 (16-24 GB) y RTX 3060 de 12 GB en BF16 con contexto limitado; en GPUs de 8 GB se recomienda cuantizacion de 4 u 8 bits.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) y L40S permiten servirlo con lotes grandes y contextos extensos; el modelo es pequeno para estas tarjetas, por lo que el cuello de botella sera el ancho de banda de memoria.
- Almacenamiento: el repositorio ocupa 25,7 GB, muy por encima del peso teorico de los parametros BF16 (~8 GB), debido a la inclusion del checkpoint nativo en `original_checkpoint/`.
- Opciones de despliegue: text-generation-inference (tag declarado), vLLM, servidores compatibles con endpoints OpenAI, y conversion a GGUF para llama.cpp u Ollama (la conversion no esta publicada en el repositorio y deberia generarse localmente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto de este checkpoint, por lo que la comparacion se limita a caracteristicas verificables del linaje. No se han identificado en la informacion proporcionada otros fine-tunes comparables de la misma categoria (ajustes medicos de ~4 B procedentes de Qwen3).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-021 | 4,02 B | No disponible | apache-2.0 | Repositorio HF con 0 descargas | No disponibles |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | No disponible en esta ficha | apache-2.0 | Repositorio HF oficial | No consultados en esta ficha |
| Otros fine-tunes medicos de ~4 B | No disponible | No disponible | No disponible | No disponible | No disponibles |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 21 de un run identificado como "pilot", por lo que previsiblemente no ha convergido ni ha sido validado como modelo final.
- Ausencia de documentacion: no se publican datos de entrenamiento, hiperparametros, composicion del dataset, idiomas soportados ni evaluaciones; cualquier afirmacion sobre su calidad en dominio medico seria especulativa.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se ha publicado ningun ajuste de seguridad ni alineacion especifico para este checkpoint.
- Ausencia de validacion clinica: el nombre del run sugiere ambito medico, pero el modelo no es un dispositivo medico, no ha pasado validacion regulatoria y no debe usarse para diagnostico, triaje ni decision terapeutica.
- Sesgos: no documentados; los sesgos del modelo base se heredan sin que se describa ningun proceso de mitigacion.
- Limitaciones de contexto e idioma: no disponibles; se desconoce si el ajuste ha alterado el comportamiento multilingue de la base.
- Restricciones de licencia: el checkpoint se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base `Qwen/Qwen3-4B-Instruct-2507` y la procedencia de los datos de ajuste antes de un despliegue comercial.
- Trazabilidad: el repositorio ocupa 25,7 GB porque conserva el checkpoint nativo; conviene revisar los metadatos de `original_checkpoint/` antes de asumir compatibilidad con el export BF16 de la raiz.
- Adopcion nula: 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de terceros.
- Proteccion de datos: sin informacion sobre si el dataset de ajuste contenia datos personales o clinicos, existe un riesgo no cuantificado de memorizacion y fuga de informacion sensible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-021
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo, al run `261016_medicine_static_pilot` ni al autor HYU-NLP-EVAL. Los resultados devueltos corresponden a entidades no relacionadas (sitios de automocion y plataformas de streaming) y se descartan por no ser pertinentes.
- Paper, blog, repositorio de codigo o demo: no disponibles.

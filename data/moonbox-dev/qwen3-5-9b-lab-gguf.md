# moonbox-dev/Qwen3.5-9B-lab-GGUF

## Resumen

Qwen3.5-9B-lab-GGUF es una coleccion de cuantizaciones GGUF del modelo Qwen3.5-9B, publicada por moonbox-dev para su uso con llama.cpp en hardware de consumo (Metal, CUDA, Vulkan y CPU). El modelo base, desarrollado por el equipo Qwen de Alibaba, es un modelo multimodal de 9.197.093.888 parametros que acepta texto e imagen/video como entrada y genera texto, con un modo de razonamiento explicito previo a la respuesta. El repositorio incluye siete precisiones (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) mas un fichero `mmproj` F16 compartido que contiene el codificador visual.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 9B con vision y razonamiento en GPUs de consumo y en CPU, con cuantizaciones validadas mediante divergencia KL contra el fichero BF16 de referencia. El autor documenta hashes sha256 por fichero, el proceso de conversion y un test de fidelidad token a token, lo que reduce la incertidumbre habitual al adoptar cuantizaciones de terceros.

La arquitectura subyacente combina atencion lineal tipo gated-DeltaNet con atencion completa (hibrida) y conserva la capa de prediccion multi-token del modelo original. La licencia es Apache 2.0, heredada del modelo base, lo que facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: gated-DeltaNet (atencion lineal) + atencion completa, con capa de prediccion multi-token; codificador visual para imagen y video |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (los prompts de evaluacion del autor son 8 en ingles y 4 en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura hibrida que intercala capas de atencion lineal con mecanismo gated-DeltaNet y capas de atencion completa, e incorpora una capa de prediccion multi-token que se conserva en los ficheros GGUF. El codificador multimodal se distribuye por separado en `mmproj-qwen3-5-9b-F16.gguf` (918,2 MB) y procesa entradas de imagen y video; el fichero del modelo contiene unicamente el modelo de lenguaje. El autor no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion disponible.

La conversion se realizo desde la revision `c202236235` del checkpoint original con llama.cpp `b12621`. El conversor (`conversion/qwen.py`) reescribe por formula algunos tensores de atencion lineal: `A_log` se almacena como `-exp(A_log)`, los kernels de convolucion se comprimen y las cabezas de valor se reordenan. Del total de 775 tensores, 582 son identicos al checkpoint original y los 193 restantes corresponden a esas reescrituras y a las proyecciones de parches. Las cuantizaciones Q6_K, Q5_K_M y Q4_K_M se generaron con importance matrix calculada sobre 200 x 512 tokens de WikiText-2 train usando el fichero Q8_0, lo que redujo su KL a menos de la mitad (Q4_K_M paso de 0,016 a 0,0063).

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento explicito previo a la respuesta: llama-server devuelve el bloque de pensamiento en el campo `reasoning_content`.
- Entrada multimodal de imagen y video mediante el codificador `mmproj` (pipeline `image-text-to-text`).
- Procesamiento de lenguaje natural en ingles y chino, segun los prompts de evaluacion del autor; el resto de idiomas no esta documentado.
- Prediccion multi-token conservada en los pesos, lo que habilita decodificacion especulativa interna.
- Compatibilidad con el endpoint `/v1/chat/completions` de llama-server, lo que permite integrarlo en clientes compatibles con la API de OpenAI.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.

## Casos de uso

- Asistente conversacional local en estacion de trabajo: con la cuantizacion Q4_K_M (5,83 GB) el modelo cabe en GPUs de consumo de 8 GB o mas y permite mantener un asistente multi-turno sin conexion a servicios externos.
- Analisis de imagenes en el puesto de trabajo: el codificador `mmproj` habilita describir capturas, diagramas o fotografias desde una CLI o un servidor local, util para prototipos de accesibilidad o documentacion tecnica.
- Procesamiento de video de corta duracion: al aceptar entrada de video, puede emplearse para resumir clips o extraer descripciones de fotogramas en pipelines de preetiquetado.
- Razonamiento asistido con traza visible: el campo `reasoning_content` permite auditar el proceso de pensamiento en tareas de analisis, util en entornos educativos o de investigacion que requieran trazabilidad.
- Despliegue en CPU o portatiles sin GPU dedicada: las cuantizaciones Q4_K_M y Q5_K_M permiten inferencia en CPU con llama.cpp, adecuado para demos, pruebas de integracion y entornos con restricciones de hardware.
- Backend de chatbot compatible con la API de OpenAI: al exponer `/v1/chat/completions`, se integra sin cambios en aplicaciones que ya consumen esa interfaz, reduciendo el coste de migracion.
- Evaluacion comparativa de cuantizaciones: los ficheros con hashes y metricas KL documentadas sirven para estudiar el impacto de la cuantizacion en modelos hibridos con atencion lineal.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks academicos (MMLU, HumanEval, GSM8K u otros). La unica evaluacion disponible es un test de fidelidad de cuantizacion contra el fichero BF16, con 12 prompts cortos (8 en ingles, 4 en chino), generacion greedy de 64 tokens y calculo de divergencia KL sobre el top 64 de la distribucion.

| Precision | Tamano | Peso vs BF16 | KL (nats) | Mismo token top-1 |
|---|---|---|---|---|
| BF16 | 18,41 GB | referencia | referencia | referencia |
| F16 | 18,41 GB | identico | 0,000004 | 100 % |
| Q8_0 | 9,79 GB | 0,55 % | 0,0003 | 99,7 % |
| Q6_K | 7,56 GB | 1,83 % | 0,0007 | 99,5 % |
| Q5_K_M | 6,67 GB | 3,17 % | 0,0019 | 99,6 % |
| Q4_K_M | 5,83 GB | 5,86 % | 0,0063 | 98,4 % |

El umbral de aceptacion del autor es KL <= 0,01 nats y coincidencia del token top-1 >= 90 %; todas las precisiones lo superan.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB con Q4_K_M, 7 GB con Q5_K_M, 8 GB con Q6_K, 10 GB con Q8_0 y 19 GB con F16/BF16, sin contar el codificador visual (918 MB adicionales si se usa entrada de imagen).
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para las precisiones altas; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para Q4_K_M y Q5_K_M con vision.
- Cabe en GPU de consumo: si, desde 8 GB de VRAM con Q4_K_M; el autor verifico el test de fidelidad en una RTX 3080 Laptop.
- Opciones de despliegue: llama.cpp `b12621` o superior mediante `llama-server` con `--mmproj` para vision; tambien es compatible con cualquier frontend que hable la API de OpenAI. No se documenta soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,2 B | no disponible | Si (imagen y video) | Apache 2.0 | safetensors |
| Qwen3.5-9B-lab-GGUF | 9,2 B | no disponible | Si (imagen y video) | Apache 2.0 | GGUF |
| Alternativas de 7-9B con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de dominio o idioma.
- Riesgo de alucinacion: inherente a los modelos generativos; el modo de razonamiento explicito no garantiza la veracidad del contenido y debe validarse en produccion.
- Idiomas: solo se documentan prompts de evaluacion en ingles y chino; el rendimiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos sin medir previamente.
- Fidelidad de cuantizacion: las metricas KL se calcularon sobre 12 prompts cortos y 64 tokens, una muestra reducida; el comportamiento en generaciones largas o dominios especializados puede diferir.
- Reescritura de tensores: 193 de 775 tensores se regeneran por formula en la conversion; aunque el test de tokens los cubre, cualquier discrepancia futura en llama.cpp con atencion lineal afectaria a estos ficheros.
- Version de llama.cpp: se requiere `b12621` o superior; versiones anteriores pueden no interpretar correctamente los tensores de atencion lineal.
- Licencia: Apache 2.0 permite uso comercial, pero los ficheros son una obra derivada y heredan las condiciones del modelo base; conviene revisar la model card original para cualquier clausula adicional.
- Tool calling y agentes: no documentados; no deben asumirse en disenos de produccion sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Qwen3.5-9B-lab-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Qwen Chat: https://chat.qwen.ai

# kabcnd/Kenzan-Dale-0.8B-PinGrid-GGUF

## Resumen

Kenzan-Dale-0.8B-PinGrid-GGUF es una colección de cuantizaciones GGUF de precisión mixta (PinGrid) del modelo `manuelgscom/dale-0.8b`, un especialista en traducción de lenguaje natural a Bash para entornos Linux y CLI. El modelo base deriva de la familia Qwen3.5 y ha sido afinado específicamente para emitir comandos de shell estructurados en JSON, con capacidad de rechazo explícito cuando la petición no es viable o resulta ambigua. El autor de las cuantizaciones es el usuario de Hugging Face `kabcnd`, mientras que el modelo original pertenece a `manuelgscom`.

El interés de esta publicación reside en su enfoque en eficiencia extrema para despliegue en el borde: el modelo completo en BF16 ocupa 1.516,7 MB, mientras que la cuantización recomendada Q4_K_M se reduce a 496,5 MB manteniendo una precisión semántica idéntica (372/471, 78,98 %). Está pensado para inferencia rápida en CPU y Apple Metal, con velocidades declaradas de 144 a 158 tokens por segundo en Apple Silicon con 4 hilos.

La relevancia actual viene de su nicho: asistentes de terminal, agentes de automatización de sistemas y herramientas de línea de comandos que necesitan un modelo pequeño, con contrato JSON estricto y que quepa en dispositivos sin GPU dedicada. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), especializada en generación NL a Bash |
| Parametros totales | 752.393.024 (aproximadamente 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea `-c 2048`) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q3_K_M, Q3_K_S, Q2_K (variantes PinGrid con imatrix) |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base `manuelgscom/dale-0.8b` es un transformer de aproximadamente 752 millones de parámetros, derivado de la arquitectura Qwen3.5, afinado como especialista en conversión de lenguaje natural a comandos Bash. La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset, aunque el nombre del benchmark asociado (`dale-bash-test-v2`) y la estructura de evaluación (339 casos de comando, 101 de rechazo, 31 de incertidumbre) sugieren un ajuste orientado a contratos JSON con tres salidas posibles: comando válido, rechazo y estado de duda.

La innovación técnica de esta publicación no está en el modelo sino en el proceso de cuantización. El autor emplea herramientas de `llama-clover` de Prism ML para generar cuantizaciones GGUF de precisión mixta denominadas PinGrid, que combinan kernels estándar K-quant (Q4_K, Q3_K, Q2_K) con anclas de alta precisión en proyecciones seleccionadas. Además, las variantes Q3 y Q2 incorporan una importance matrix (imatrix) calibrada sobre 409 fragmentos del dominio, lo que preserva la selección del comando primario incluso a 3 bits. El resultado es que Q4_K_M PinGrid ocupa un 6,2 % menos que el Q4_K_M oficial sin pérdida de precisión semántica, y Q3_K_M reduce un 14,8 % el tamaño igualando el acierto de comando del BF16 (307/339).

## Capacidades

- Generación de comandos Bash a partir de descripciones en lenguaje natural, en español e inglés.
- Salida estructurada en JSON conforme al contrato `dale-0.8b` v2, con campos de comando, rechazo y estado de incertidumbre.
- Detección de peticiones no ejecutables o peligrosas: el benchmark incluye 101 casos de rechazo y 31 de duda.
- Conversación multi-turno (etiqueta `conversational` en los metadatos).
- Razonamiento de dominio acotado a operaciones de shell y administración de sistemas Linux.
- No se declaran capacidades de tool calling genérico, visión, audio ni modo de razonamiento extendido.
- Inferencia en CPU y Apple Metal mediante llama.cpp, con soporte para llama-server.

## Casos de uso

- Asistente de terminal integrado: el modelo traduce peticiones como "lista los archivos modificados en las últimas 24 horas" a un comando `find` con los parámetros correctos, devolviendo JSON parseable que la shell puede validar antes de ejecutar.
- Automatización de scripts en CI/CD: un paso del pipeline puede invocar al modelo para generar comandos de mantenimiento o diagnóstico a partir de lenguaje natural, con el campo de rechazo actuando como salvaguarda ante operaciones destructivas.
- Herramientas de onboarding para administradores noveles: interfaz que sugiere comandos explicados, aprovechando la salida estructurada para mostrar el comando y su justificación.
- Agentes de operaciones en el borde: al ocupar menos de 500 MB en Q4_K_M, puede desplegarse en dispositivos Apple Silicon o servidores sin GPU para tareas de generación de comandos en tiempo real (144-158 t/s declarados).
- Filtrado y clasificación de peticiones peligrosas: el contrato de tres estados (comando, rechazo, duda) permite construir un validador previo que bloquee solicitudes ambiguas antes de llegar a un LLM mayor.
- Enseñanza de Bash en entornos educativos: generación de ejemplos de comandos con retroalimentación estructurada, ejecutable localmente sin conexión ni hardware dedicado.
- Pruebas de regresión de contratos JSON: al mantener el 100 % de JSON válido en Q4_K_M (471/471), sirve como componente determinista en pipelines que exigen parseo estricto.

## Benchmarks y rendimiento

Evaluación sobre `manuelgscom/dale-bash-test-v2` (471 casos: 339 de comando, 101 de rechazo, 31 de duda), decodificación greedy con `temperature=0`:

| Artefacto | Tamaño | JSON válido | Acierto `prog_ref` | Aprobado semántico |
|---|---:|---:|---:|---:|
| BF16 (referencia) | 1.516,7 MB | 471/471 (100 %) | 307/339 (90,56 %) | 372/471 (78,98 %) |
| Q4_K_M oficial | 529,3 MB | 471/471 (100 %) | 306/339 (90,27 %) | 371/471 (78,77 %) |
| PinGrid Q4_K_M-M6 | 496,5 MB | 471/471 (100 %) | 306/339 (90,27 %) | 372/471 (78,98 %) |
| PinGrid Q3_K_M-M6 | 451,1 MB | 470/471 (99,79 %) | 307/339 (90,56 %) | 366/471 (77,71 %) |
| PinGrid Q3_K_S-M6 | 428,2 MB | 470/471 (99,79 %) | 302/339 (89,09 %) | 352/471 (74,73 %) |
| PinGrid Q2_K-M6 | 421,2 MB | 466/471 (98,94 %) | 298/339 (87,91 %) | 338/471 (71,76 %) |

Rendimiento declarado: 144-158 tokens por segundo en Apple Silicon M-series con 4 hilos.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 0,5 GB en Q4_K_M, 0,45 GB en Q3_K_M y 0,42 GB en Q2_K; 1,5 GB en BF16.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU y Apple Metal. Cualquier GPU con más de 2 GB de VRAM puede alojarlo, aunque el diseño prioriza inferencia sin acelerador.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos Apple Silicon y placas de un solo board.
- Opciones de despliegue: llama.cpp y llama-server (documentados); compatible con cualquier runtime que cargue GGUF, como Ollama o LM Studio, aunque no se mencionan explícitamente.
- Latencia y throughput: 144-158 t/s en Apple Silicon M-series con 4 hilos; no se publican cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-Dale-0.8B-PinGrid | 0,75B | No disponible | NL a Bash, JSON estricto | Apache 2.0 | GGUF en HF |
| manuelgscom/dale-0.8b (base) | 0,75B | No disponible | NL a Bash, JSON estricto | Apache 2.0 | Safetensors en HF |
| Qwen3.5-0.8B (familia de origen) | 0,8B | No disponible | Generación general | No disponible en esta ficha | No disponible |

No se dispone de datos de benchmarks de modelos alternativos de propósito general en la información proporcionada, por lo que la comparación cuantitativa con otros asistentes de shell no está disponible.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para Bash y su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación en comandos: aunque el 78,98 % de los casos supera la evaluación semántica, un 21 % restante puede producir comandos incorrectos o incompletos; toda ejecución debería validarse antes de lanzarse.
- Idiomas limitados a español e inglés; no se declara soporte para otras lenguas.
- Longitud de contexto no documentada; el ejemplo de uso fija 2048 tokens, lo que limita conversaciones largas.
- Las cuantizaciones Q3 y Q2 degradan la precisión semántica (77,71 % y 71,76 % respectivamente) y Q2_K ya presenta un 1,06 % de JSON inválido; para producción se recomienda Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `manuelgscom/dale-0.8b` y de la familia Qwen3.5 de origen.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez frente a inyección de prompts.
- El repositorio tiene 0 likes y 284 descargas en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabcnd/Kenzan-Dale-0.8B-PinGrid-GGUF
- Modelo base: https://huggingface.co/manuelgscom/dale-0.8b
- Herramientas de cuantización Prism ML: https://prismml.com/
- Apoyo al autor: https://ko-fi.com/kabcnd

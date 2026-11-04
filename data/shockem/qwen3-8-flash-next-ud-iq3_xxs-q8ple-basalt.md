# Shockem/Qwen3.8-Flash-Next-UD-IQ3_XXS-Q8PLE-Basalt

## Resumen

Qwen3.8-Flash-Next UD-IQ3_XXS-Q8PLE-Basalt es un empaquetado en formato Basalt (version 2) del modelo Qwen3.8-Flash-Next, una arquitectura MoE de Qwen, cuantizado en UD-IQ3_XXS a partir de los GGUF publicados por Unsloth. El autor del empaquetado es Shockem, que parte del trabajo de cuantizacion de Unsloth y de la linea oficial de packs Basalt de jesdga. El archivo no introduce ningun ajuste fino: es el modelo original, sin abliteracion, y su proposito es ofrecer una version ejecutable en el motor Basalt con la tabla n-gram sustituida por una version Q8_0 para preservar la velocidad de decodificacion especulativa.

El modelo resuelve el problema de desplegar un MoE de gran tamano en hardware de consumo moderado: el pack ocupa 105,4 GiB, de los cuales 46,8 GiB corresponden a expertos y 54,9 GiB a la seccion `gguf` (mayoritariamente la tabla n-gram). Segun las mediciones del autor, se ejecuta integramente en RAM y VRAM combinadas de 3x RTX 5060 Ti de 16 GB mas 62 GiB de RAM del sistema, sin desbordamiento a SSD.

La relevancia actual reside en que demuestra un flujo de conversion reproducible desde GGUF de Unsloth hacia Basalt con decodificacion especulativa (MTP drafter) y proyector de vision heredados de la linea oficial, manteniendo velocidades de decodificacion de 105-118 tok/s en prosa y 159-202 tok/s en codigo. No se dispone de informacion publica sobre el numero total de parametros ni la longitud de contexto en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) tipo transformer, con MTP drafter y proyector de vision |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han medido prefills de hasta ~168k tokens) |
| Tipos de cuantizacion | IQ2_S, IQ3_XXS, IQ4_XS (gate/up); IQ4_NL, Q2_0 (down); Q8_0 (tabla n-gram y proyecciones hyper-connection); BF16 en compatibilidad |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | Basalt `.basalt` (version 2, requiere Basalt 0.2.0 o superior); origen GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un MoE de Qwen con expertos enrutados y tensores densos. El pack Basalt incluye ademas un MTP drafter (para decodificacion especulativa) y un proyector de vision, ambos copiados byte a byte desde la linea oficial de packs Basalt mediante `--sections-from`. Las proyecciones de hyper-connection estaban almacenadas como Q8_0 en el GGUF de Unsloth y se convirtieron a BF16 con `convert.py --compat-bf16`, ya que el motor Basalt las lee en ese formato.

La construccion se realizo con Basalt `1b3f6964` (0.2.1). Los shards 1-3 del GGUF UD-IQ3_XXS de Unsloth se copiaron sin modificacion; el shard 4 (tabla n-gram por capa, `per_layer_token_embd.weight`) se sustituyo por una tabla Q8_0 tomada de un pack Basalt Q8_0 existente, dado que Unsloth la almacena como IQ4_NL. El tokenizer y la plantilla de chat provienen del GGUF de Unsloth. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni si hubo RLHF o DPO en la documentacion proporcionada.

## Capacidades

- Generacion de texto y decodificacion de prosa a 105-118 tok/s en el hardware medido.
- Generacion de codigo, con velocidades de decodificacion superiores (159-202 tok/s).
- Razonamiento multi-turno y agentico: el autor reporta un harness de agentes de 15 pruebas superado 15/15 en tres ejecuciones consecutivas (comprobacion de no regresion, no benchmark de precision).
- Soporte de decodificacion especulativa mediante MTP drafter, con `--spec 8` y `relaxed-drafting 0.2` en las pruebas.
- Capacidades de vision por herencia del proyector del pack oficial (no verificadas de forma independiente en la informacion disponible).
- Procesamiento de contextos largos: se han medido prefills de ~3,5k, ~27k y ~168k tokens.
- Tool calling y function calling: no confirmado explicitamente en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en produccion: con 159-202 tok/s en decodificacion de codigo y soporte de contextos largos (~168k tokens medidos en prefill), es adecuado para autocompletado y generacion en pipelines de CI/CD donde la latencia de decodificacion es critica.
- Agentes autonomos multi-paso: el harness de 15 pruebas superado de forma consistente sugiere estabilidad en tareas agenticas; el MTP drafter acelera la generacion de secuencias largas de acciones y observaciones.
- Procesamiento de documentos extensos: la ventana de contexto observada en las pruebas (~168k tokens) permite resumir, extraer y responder preguntas sobre contratos, informes o bases de codigo completas en una sola pasada.
- Analisis de imagenes con texto: el proyector de vision heredado del pack oficial habilita tareas de descripcion, OCR o respuesta a preguntas sobre imagenes, aunque no se han publicado metricas de calidad especificas.
- Despliegue en hardware de consumo agregado: 3x RTX 5060 Ti de 16 GB mas 62 GiB de RAM permiten mantener todos los expertos residentes sin desbordamiento a SSD, lo que lo hace viable para laboratorios pequenos o entornos de investigacion con presupuesto limitado.
- Evaluacion comparativa de cuantizaciones: al ser un pack reproducible desde GGUF de Unsloth, sirve como referencia para medir el impacto de IQ3_XXS frente a otras cuantizaciones en tareas de agente y codigo.

## Benchmarks y rendimiento

| Carga de trabajo | tok/s (medido) |
|---|---:|
| Prefill ~3,5k tokens | 1.742 |
| Prefill ~27k tokens | 2.410 |
| Prefill ~168k tokens | 2.255 |
| Decodificacion en prosa | 105-118 |
| Decodificacion en codigo | 159-202 |

Medido en 3x RTX 5060 Ti 16 GB, 62 GiB RAM, Basalt 0.2.1, `--spec 8`, `relaxed-drafting 0.2`, presupuesto de 44 GiB de RAM, thinking desactivado, prompts nuevos. El harness de agentes de 15 pruebas paso 15/15 en tres ejecuciones. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; el autor remite a la comparativa publicada por Unsloth para la cuantizacion subyacente.

## Requisitos de hardware

- VRAM/RAM: el pack ocupa 105,4 GiB en disco; con 44 GiB de presupuesto de RAM y todos los expertos residentes, el autor lo ejecuta en 3x RTX 5060 Ti 16 GB (48 GB de VRAM) mas 62 GiB de RAM del sistema.
- GPU recomendadas: el autor valida 3x RTX 5060 Ti 16 GB. No se han probado otras configuraciones en la informacion disponible.
- Cabe en GPU de consumo: si, en configuracion multi-GPU de 3 tarjetas de 16 GB con RAM del sistema suficiente; no cabe en una unica GPU de consumo.
- Opciones de despliegue: motor Basalt 0.2.0 o superior (formato `.basalt` version 2). No es compatible directamente con llama.cpp, vLLM, Ollama ni TGI sin reconversion a GGUF u otro formato.
- Latencia y throughput: prefills de 1.742-2.410 tok/s; decodificacion de 105-202 tok/s segun carga, en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shockem/Qwen3.8-Flash-Next-UD-IQ3_XXS-Q8PLE-Basalt | no disponible | no disponible (~168k medidos) | qwen-community-license-1.0 | Basalt v2 | Pack de 105,4 GiB con drafter y vision |
| unsloth/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | qwen-community-license-1.0 | GGUF (UD-IQ3_XXS) | Base del pack; tabla n-gram en IQ4_NL |
| jesdga/Qwen3.8-Flash-Next-Basalt | no disponible | no disponible | qwen-community-license-1.0 | Basalt | Linea oficial de packs Basalt; origen del drafter y vision |
| Qwen3.8-Flash-Next (original) | no disponible | no disponible | qwen-community-license-1.0 | safetensors (presumible) | Modelo base sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El pack no es un modelo afinado ni abliterado: hereda los sesgos y comportamientos del Qwen3.8-Flash-Next original.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- La cuantizacion IQ3_XXS es agresiva (expertos gate/up en IQ2_S/IQ3_XXS/IQ4_XS, down en IQ4_NL/Q2_0), lo que puede degradar la calidad respecto al modelo en BF16; el autor remite a la comparativa de Unsloth para evaluar el impacto.
- La tabla n-gram se sustituyo por Q8_0 desde otro pack; aunque el autor indica que los bytes son identicos a los de la linea oficial, un pack autoconvertido no es el archivo oficial.
- Requiere el motor Basalt 0.2.0 o superior; no es directamente utilizable en ecosistemas GGUF estandar (llama.cpp, Ollama, vLLM) sin reconversion.
- La licencia qwen-community-license-1.0 impone restricciones de uso comercial que deben revisarse en el archivo `LICENSE` antes de desplegar en produccion.
- No se dispone de informacion sobre idiomas soportados ni sobre el comportamiento en lenguas distintas del ingles.
- El harness de agentes de 15 pruebas es una comprobacion de no regresion, no una medida de precision; no debe interpretarse como benchmark de calidad.
- El rendimiento medido corresponde a un hardware concreto (3x RTX 5060 Ti, 62 GiB RAM); en configuraciones con menos RAM o con desbordamiento a SSD la latencia puede degradarse significativamente.

## Enlaces

- HuggingFace: https://huggingface.co/Shockem/Qwen3.8-Flash-Next-UD-IQ3_XXS-Q8PLE-Basalt
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Linea oficial Basalt: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt
- Formato Basalt: https://huggingface.co/jesdga/Qwen3.8-Flash-Next-Basalt (referencia de formato version 2)

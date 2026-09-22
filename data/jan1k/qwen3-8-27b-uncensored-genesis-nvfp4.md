# jan1k/Qwen3.8-27B-Uncensored-Genesis-NVFP4

## Resumen

Qwen3.8-27B-Uncensored-Genesis-NVFP4 es una cuantizacion en NVFP4 (FP4 de 4 bits con escalas UE4M3) del modelo LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-GGUF, publicada por el usuario jan1k. Se distribuye en formato GGUF y esta pensada para explotar la ruta nativa de FP4 de las GPU Blackwell (RTX 50xx), aunque el autor indica que tambien funciona en Ampere mediante kernels de respaldo. El resultado es un archivo de 15,76 GB que comprime un modelo denso de 26.895.998.464 parametros (unos 26,9 B) desde un GGUF Q8_K_P de 31,5 GB.

El modelo es la variante "uncensored" de la cadena Genesis: parte del fine-tune sin censura de HauhauCS (Qwen3.8-27B-Uncensored-HauhauCS-Aggressive), al que LuffyTheFox aplico una reparacion de tensores y posteriormente jan1k aplico la cuantizacion NVFP4 con un fork de llama.cpp llamado advanced-gguf-quantizer. La arquitectura declarada es `qwen35` densa, con 64 capas mas un bloque MTP/NextN, y una composicion hibrida de 48 capas Gated DeltaNet (tipo SSM) y 16 capas de atencion con puerta (gated attention).

Su relevancia es doble: por un lado, demuestra un flujo de cuantizacion NVFP4 con escalas inline compatible con runtimes que no implementan el contrato extendido de tensores de escala (LM Studio, Pelican); por otro, preserva el bloque MTP nativo para decodificacion especulativa con FastMTP. Esta orientado a generacion de texto y conversacion en ingles y chino, con soporte de vision si se anade el fichero mmproj del repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` densa con capas hibridas: 48 Gated DeltaNet (SSM) + 16 gated-attention, 64 capas + 1 bloque MTP/NextN |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens en el ejemplo de uso del autor (`-c 131072`); no se declara un maximo oficial distinto |
| Tipos de cuantizacion | NVFP4 (mayoria de pesos), F16 (4 tensores criticos), F32 (normas y escalares SSM); `general.file_type` = 39 (`LLAMA_FTYPE_MOSTLY_NVFP4`) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variantes v4 con MTP y v4-noMTP) |
| Autor de la cuantizacion | jan1k |
| Modelo base | LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-GGUF |
| Origen ultimo | HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF |
| Tamano del repositorio | 31,3 GB |
| Tamano de los archivos | 15,76 GB (v4, 866 tensores) / 15,53 GB (v4-noMTP, 851 tensores) |
| Herramienta de cuantizacion | advanced-gguf-quantizer (fork de llama.cpp) |
| Fecha de publicacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente sigue una arquitectura `qwen35` densa de 64 capas mas un bloque adicional de prediccion multiple de tokens (NextN/MTP, con `qwen35.nextn_predict_layers=1`). La parte hibrida combina 48 capas Gated DeltaNet, un mecanismo de espacio de estados con puertas (los tensores `ssm_a`, `ssm_dt`, `ssm_conv1d` y `ssm_norm` aparecen en la politica de proteccion de la cuantizacion), con 16 capas de atencion con puerta (`attn_gate`, `attn_qkv`, `attn_q_norm`, `attn_k_norm`). Esta mezcla busca reducir el coste del cache KV en secuencias largas manteniendo atencion completa en una fraccion de las capas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. Lo que si esta documentado es el proceso de cuantizacion: se partio de un GGUF Q8_K_P de 31,5 GB y se aplico una conversion en un solo paso a NVFP4 con protecciones por tipo de tensor. La politica de proteccion incluye cuatro tensores forzados a F16 para evitar el colapso de valores singulares (`blk.0.attn_gate`, `blk.0.attn_qkv`, `blk.0.ffn_down`, `blk.13.ffn_down`), un conjunto amplio de normas y escalares SSM forzados a F32, y tres tensores forzados a NVFP4 para no bajar mas su precision (`blk.0.ssm_out`, `blk.1.attn_gate`, `blk.1.attn_qkv`). La innovacion tecnica principal es el uso de `--nvfp4-inline-scales-only`, que emite escalas UE4M3 nativas en linea sin tensores separados `.scale`/`.input_scale`, requisito para LM Studio y Pelican. El bloque MTP se conserva intacto en la variante v4, lo que habilita decodificacion especulativa con `--spec-type draft-mtp` en runtimes con soporte FastMTP.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de plantilla Jinja (`--jinja`).
- Razonamiento y generacion de codigo, heredado del modelo base Qwen3.8.
- Soporte de vision, condicionado a cargar el fichero `mmproj` del repositorio de origen; el GGUF de esta publicacion no lo incluye.
- Decodificacion especulativa mediante el bloque MTP/NextN nativo (variante v4 con `--spec-type draft-mtp`).
- Capacidades multilingues limitadas a ingles y chino.
- Modelo sin censura: el ajuste de origen elimina total o parcialmente los rechazos del modelo base, lo que amplia el rango de respuestas aceptadas pero tambien el riesgo de contenido problematico.
- Inferencia acelerada en hardware Blackwell por la ruta nativa FP4.
- No se documenta soporte explicito de function calling, tool calling ni uso como agente multi-paso en la informacion disponible.

## Casos de uso

- Inferencia local en GPU Blackwell: con 15,76 GB de pesos en NVFP4, el modelo cabe en una RTX 5090 o RTX 5080 y aprovecha la ruta nativa FP4 para maximizar el rendimiento por vatio en estaciones de trabajo de un solo usuario.
- Servidor de chat autoalojado con contexto largo: usando `llama-server` con `-c 131072` y cache K/V en F16, se puede desplegar un asistente conversacional que mantenga documentos o historiales extensos en una sola ventana de contexto.
- Procesamiento de documentacion tecnica en chino e ingles: el soporte bilingue encaja en flujos de traduccion, resumen y extraccion de datos de manuales o informes en ambos idiomas.
- Generacion de codigo asistida en local: el modelo base Qwen3.8 rinde bien en tareas de programacion, y la cuantizacion de 4 bits permite integrarlo en un IDE o en un pipeline de revision de parches sin depender de APIs externas.
- Investigacion sobre cuantizacion NVFP4: el repositorio documenta con detalle la mezcla de tensores (360 F32, 4 F16, 502 NVFP4), lo que lo convierte en un caso de estudio reproducible para evaluar el impacto de la proteccion selectiva de tensores.
- Evaluacion de decodificacion especulativa MTP: la variante v4 con el bloque `blk.64` preservado permite medir la ganancia de throughput de `draft-mtp` frente a la variante noMTP sobre el mismo modelo.
- Analisis de contenido sin filtros: para tareas de investigacion en seguridad, red teaming o analisis de discurso donde los rechazos del modelo alineado resultan un obstaculo.
- Vision por computador en local: cargando el `mmproj` del repositorio de origen, se puede anadir descripcion de imagenes o extraccion de informacion visual a un asistente que ya corre en la misma GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 15,8 GB con la variante v4 y 15,5 GB con la v4-noMTP, dado el tamano de los ficheros GGUF.
- VRAM adicional para cache KV: el autor recomienda fijar la cuantizacion de cache K y V a F16, lo que incrementa notablemente el consumo a 131.072 tokens de contexto. No se dispone de la cifra exacta de VRAM de cache.
- GPU recomendadas: Blackwell (RTX 50xx) para la ruta nativa FP4, con el mejor rendimiento; Ampere (RTX 30xx) funciona mediante kernels de respaldo, con menor eficiencia.
- GPU consumer compatibles: una RTX 4090, RTX 3090, RTX 5090 o RTX 5080 con 24 GB o mas puede alojar los pesos; el contexto util dependera de la VRAM libre restante para el cache KV.
- GPU de datacenter: A100 40/80 GB y H100 tambien pueden ejecutar la carga, aunque no se documenta un camino FP4 acelerado especifico para estas.
- Nota del autor: la cuantizacion se realizo solo en CPU porque el codificador NVFP4 en CUDA para Ampere no es fiable.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `--jinja -c 131072 -ngl 99`), LM Studio y Pelican (gracias a las escalas inline de la v4), y cualquier runtime con soporte FastMTP para la variante con MTP.
- No se documenta soporte en vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jan1k/Qwen3.8-27B-Uncensored-Genesis-NVFP4 (este) | 26,9 B | GGUF NVFP4, 15,76 GB (v4) | 131.072 tokens en el ejemplo de uso | apache-2.0 | HuggingFace, 0 descargas |
| LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-GGUF (origen directo) | no disponible en la informacion | GGUF; el fichero de partida citado es Q8_K_P de 31,5 GB | no disponible | no disponible | HuggingFace |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (base sin reparar) | no disponible en la informacion | GGUF | no disponible | no disponible | HuggingFace |
| Variante v4-noMTP de este mismo repositorio | 26,9 B (con el bloque MTP eliminado) | GGUF NVFP4, 15,53 GB, 851 tensores | 131.072 tokens en el ejemplo de uso | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas variantes. La diferencia medible documentada es el tamano (15,76 GB frente a 15,53 GB) y la presencia o ausencia del bloque MTP para decodificacion especulativa.

## Limitaciones y advertencias

- Sesgos: no hay informacion publicada sobre evaluaciones de sesgo. Al tratarse de un ajuste "uncensored", es esperable una menor alineacion de seguridad que en el modelo original, con mayor probabilidad de generar contenido ofensivo, ilegal o danino si se le solicita.
- Alucinacion: no se han publicado evaluaciones de fidelidad ni de tasa de alucinacion para esta cuantizacion. La cuantizacion agresiva a 4 bits puede degradar la precision respecto al Q8_K_P de origen, especialmente en tareas de razonamiento de varios pasos.
- Cobertura idiomatica: solo ingles y chino; no hay soporte declarado de castellano ni de otros idiomas.
- Contexto: los 131.072 tokens provienen del ejemplo de invocacion del autor, no de una ficha de modelo oficial. Con cache K/V en F16, ese contexto exige una cantidad de VRAM muy superior a la de los pesos, por lo que en GPU consumer puede ser inviable sin reducir la ventana.
- Vision: requiere descargar el fichero `mmproj` del repositorio de origen; no viene incluido en este repositorio.
- Compatibilidad de runtime: la variante v4 usa escalas inline y esta pensada para LM Studio y Pelican. Otros runtimes pueden requerir la variante noMTP o no soportar el modelo en absoluto.
- Licencia: se declara apache-2.0, pero el modelo procede de una cadena de fine-tunes de terceros (HauhauCS, LuffyTheFox) cuyas condiciones no se detallan en la informacion proporcionada. Conviene verificar la licencia en cada eslabon antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y el autor indica que las variantes con imatrix aun no existen. Es un artefacto reciente y poco validado por la comunidad.
- Reproducibilidad: el modelo base se identifica como "Qwen3.8", una denominacion que no corresponde a una release oficial verificable en la informacion disponible; conviene contrastar el origen antes de integrarlo en produccion.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo; los enlaces devueltos corresponden a un foro italiano sobre correo electronico y no se incluyen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jan1k/Qwen3.8-27B-Uncensored-Genesis-NVFP4
- Modelo base (GGUF Genesis de LuffyTheFox): https://huggingface.co/LuffyTheFox/Qwen3.8-27B-Uncensored-Genesis-GGUF
- Base sin reparar de tensores (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Cuantizador advanced-gguf-quantizer: https://github.com/michaelw9999/advanced-gguf-quantizer
- Perfil del autor del fine-tune sin censura: https://huggingface.co/HauhauCS
- Perfil del autor de la reparacion de tensores: https://huggingface.co/LuffyTheFox
- Paper, blog o demo oficial del modelo: no disponible en la informacion proporcionada.

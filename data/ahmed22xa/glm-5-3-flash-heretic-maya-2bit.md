# ahmed22xa/GLM-5.3-Flash-Heretic-Maya-2bit

## Resumen

GLM-5.3-Flash-Heretic-Maya-2bit es una reconstruccion a nivel de pesos del modelo GLM-5.3-Flash de Z.ai (licencia MIT), publicada por el usuario ahmed22xa. Parte del modelo base de 320.759.404.382 parametros (arquitectura MoE con 46 capas, 288 expertos y 8 activos, contexto de 1M de tokens y entrada de vision) y le aplica una ablacion de rechazos ("Heretic-V3", un adaptador optimizado con Optuna) fusionada directamente en los pesos, de modo que no necesita vectores de rechazo en tiempo de ejecucion.

La particularidad tecnica es el empaquetado: los expertos enrutados se comprimen a 2 bits y se organizan en un formato propio de "pack" (manifest mas blobs) pensado para el motor strata (`maya.exe`), no para llama.cpp. El resultado ocupa aproximadamente 70 GB (frente a los 97,8 GB de la build de referencia IQ1_M) y, segun el autor, decodifica a 24,9-25,8 tok/s con una tasa de acierto de cache del 74-76 % y 0 rechazos duros en 20 pruebas.

Es relevante para quien quiera ejecutar un MoE de gran tamano con capacidad de vision y contexto muy largo en hardware de consumo (una RTX 3090 de 24 GB mas 128 GB de RAM), a costa de depender de un motor propietario y de un layout de ficheros no estandar. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (46 capas, 288 expertos, 8 activos) con vision |
| Parametros totales | 320.759.404.382 |
| Parametros activos | 8 de 288 expertos por token (numero absoluto no disponible) |
| Longitud de contexto | 1.000.000 de tokens (contexto nativo del modelo base); el ejemplo de ejecucion usa `--max-context 131072` |
| Tipos de cuantizacion | Expertos enrutados a 2 bits; `IQ1_M` nativo (kernels propios), `Q2_0`, `Q4_0`; KV cache en int8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF de 68,4 GB mas pack propietario (manifest `index.txt`, `dense.bin`, `slots/*.bin`, tokenizer); vision en `mmproj` F16 GGUF |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos con 46 capas, 288 expertos por capa y 8 activos por token, contexto de 1M de tokens y soporte de entrada de imagen. Sobre esa base, el autor aplica el adaptador Heretic-V3, que modifica exactamente 67 tensores: `attn_output.weight` en los bloques 15-39, `ffn_down_shexp.weight` en los bloques 18-40 y `ffn_down_exps.weight` (los expertos enrutados) en los bloques 25-43. La fusion es un empalme byte a byte: esos 67 tensores se toman del GGUF de Heretic-V3 y el resto (bloques de atencion, embeddings, partes densas) del build de expertos a 1 bit, sin recalibracion ni re-cuantizacion, de modo que se preservan exactamente los bytes de ambas fuentes.

El empaquetado final separa los tensores no-expertos (`dense.bin`, 900 MB) de los expertos residentes en GPU (`slots/*.bin`, 4 fragmentos de unos 215 MB), y el resto de expertos queda en un nivel de RAM que el motor ejecuta en CPU. El motor strata admite decodificacion especulativa (tag `mtp`), KV streaming y cache KV en int8, y toma el espacio de las conversaciones adicionales de la misma "sala de expertos" en RAM. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 1M de tokens en el modelo base.
- Razonamiento y matemeticas (el autor reporta una "quality probe" de 5/5 correctas, sin detallar el conjunto de pruebas).
- Entrada de vision: el autor verifico imagenes en 4 de 4 casos mediante el proyector `mmproj` F16 y el vocabulario de vision.
- Comportamiento sin rechazos a nivel de pesos: 0 rechazos duros en 20 ejecuciones segun el autor.
- Decodificacion especulativa (tag `mtp`) y cache KV en int8 para reducir el coste de memoria.
- Concurrencia mediante `--parallel N`, con conversaciones adicionales alojadas en el nivel de RAM.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a la ventana de 1M de tokens del modelo base, con la cache KV en int8 y streaming para no agotar la VRAM.
- Analisis de imagenes en local: con el proyector de vision (`mmproj-GLM-5.3-Flash-F16.gguf`, 1,05 GB) se pueden enviar imagenes junto con texto para descripcion, extraccion de datos o respuesta a preguntas visuales, sin salir del equipo.
- Procesamiento de documentos tecnicos y legales: la combinacion de contexto muy largo y vision permite ingerir manuales con diagramas o contratos escaneados y generar resumenes o respuestas citadas.
- Despliegue en estaciones de trabajo con una sola GPU de consumo: el esquema de niveles (expertos en RAM, atencion y expertos nativos en VRAM) permite servir el modelo en una RTX 3090 de 24 GB mas 128 GB de RAM, con 45 GB de RAM libres tras la carga.
- Servicio de multiples conversaciones en una sola maquina: con `--parallel N` y el nivel de RAM compartido entre expertos y cache KV, se pueden atender varias sesiones concurrentes sin duplicar el modelo.
- Investigacion sobre alineacion y ablacion de rechazos: al estar la ablacion fusionada en los pesos, sirve como banco de pruebas para estudiar como afecta la eliminacion de direcciones de rechazo al comportamiento del modelo en dominios sensibles.
- Generacion creativa sin filtros restrictivos: para prototipos de ficcion o guiones donde los rechazos del modelo base interrumpen el flujo, con la advertencia de que la ausencia de filtros exige supervision humana.

## Benchmarks y rendimiento

| Metrica | Heretic-Maya-2bit (este repo) | Heretic-V3 IQ1_M | orcarouter |
|---|---:|---:|---:|
| Ablacion | pesos, optimizada | pesos, optimizada | pesos, 1 direccion |
| Tamano | ~70 GB | 97,8 GB | 97,1 GB |
| Decodificacion | 24,9-25,8 tok/s | 15,6-17,1 tok/s | 14,5-15,8 tok/s |
| Acierto de cache | 74-76 % | 65-69 % | 63-65 % |
| RAM libre tras carga | 45 GB | 25 GB | 32 GB |
| Rechazos duros | 0/20 | 0/16 | 0/16 |

Medido en una RTX 3090 (24 GB) con 128 GB de RAM. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: los bloques de atencion, embeddings, expertos nativos (4 fragmentos de ~215 MB) y la cache KV de la conversacion activa; el resto de expertos (~40 GB) reside en RAM.
- RAM: aproximadamente 40 GB de expertos descargados mas la cache de expertos; medido con 45 GB libres tras la carga sobre 128 GB totales.
- GPU recomendadas: el autor valida con una RTX 3090 de 24 GB; no se documentan pruebas con A100, H100 ni otras GPU.
- Cabe en GPU de consumo con el esquema de niveles descrito; sin el nivel de RAM no es viable en 24 GB.
- Despliegue: exclusivamente con el motor strata (`maya.exe`) mediante `--glm-pack`; llama.cpp no puede cargar este layout. Para llama.cpp hay que usar `AliceThirty/GLM-5.3-Flash-UNCENSORED-GGUF` (UD-IQ1_M, 97,8 GB) o el GGUF de Heretic-V3.
- Latencia y throughput: 24,9-25,8 tok/s de decodificacion con 74-76 % de acierto de cache en la configuracion medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Decodificacion | Licencia | Motor |
|---|---|---:|---:|---:|---|---|
| Heretic-Maya-2bit (este repo) | 320,8 B (MoE, 8 activos) | 1M | ~70 GB | 24,9-25,8 tok/s | MIT | strata (`maya.exe`) |
| Heretic-V3 IQ1_M | 320,8 B (MoE, 8 activos) | 1M | 97,8 GB | 15,6-17,1 tok/s | MIT | llama.cpp |
| orcarouter | 320,8 B (MoE, 8 activos) | 1M | 97,1 GB | 14,5-15,8 tok/s | MIT | llama.cpp |
| AliceThirty/GLM-5.3-Flash-UNCENSORED-GGUF | 320,8 B (MoE, 8 activos) | 1M | 97,8 GB | no disponible | MIT | llama.cpp |

## Limitaciones y advertencias

- El pack no es un GGUF estandar: requiere el motor strata y no funciona en llama.cpp, Ollama, vLLM ni TGI. La portabilidad es nula fuera de ese ecosistema.
- La ablacion elimina las direcciones de rechazo de los pesos; el modelo puede producir contenido danino, sesgado o inapropiado sin filtros. Requiere supervision y politicas de uso en cualquier despliegue real.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de factualidad.
- No hay informacion sobre sesgos conocidos, cobertura idiomatica ni calidad en lenguas distintas del ingles.
- El rendimiento medido (24,9-25,8 tok/s, 74-76 % de cache) corresponde a una unica configuracion (RTX 3090 + 128 GB de RAM); no se garantiza en otro hardware.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (25 de noviembre de 2026): no hay validacion independiente de las cifras del autor.
- La licencia MIT del modelo base se mantiene, pero el autor no detalla obligaciones adicionales derivadas del adaptador Heretic-V3 ni del empaquetado.
- El ejemplo de ejecucion limita el contexto a 131.072 tokens pese a que el modelo base soporta 1M; el uso del contexto completo depende de la memoria disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmed22xa/GLM-5.3-Flash-Heretic-Maya-2bit
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Adaptador Heretic-V3: https://huggingface.co/MorinoNushi/GLM-5.3-Flash-Heretic-Abliterated-LoRA-V3-GGUF
- Build para llama.cpp: https://huggingface.co/AliceThirty/GLM-5.3-Flash-UNCENSORED-GGUF
- Papers, blogs, repos y demos adicionales: no disponible en la informacion proporcionada.

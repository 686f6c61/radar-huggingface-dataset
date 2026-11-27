# Piggy12/Qwen3.6-27B-DMTP

## Resumen

Qwen3.6-27B-DMTP es un modelo borrador (draft model) para decodificación especulativa sobre el modelo objetivo Qwen/Qwen3.6-27B, publicado por el usuario Piggy12. No es un modelo generativo autonomo: implementa el metodo DMTP (Dual-anchor MTP), que combina la prediccion nativa del primer token del modulo MTP del modelo base con el borrador paralelo por bloques de DFlash2. El resultado es un unico borrador que propone hasta siete tokens candidatos por ronda de verificacion, que el modelo objetivo valida en paralelo.

La relevancia tecnica esta en que incorpora las representaciones preentrenadas del MTP nativo de Qwen3.6-27B dentro del flujo de DFlash2 mediante una red residual de rango 256 aplicada unicamente al embedding del primer candidato (T1). Segun el autor, esto mejora la longitud aceptada por verificacion en tareas de tipo agente y horizonte largo sin entrenamiento especifico en esos dominios.

El repositorio contiene exclusivamente los pesos del borrador (1.166.809.600 parametros en safetensors, 2,3 GB). El modelo objetivo de 27B, su modulo MTP nativo y el embedding de tokens y cabecera LM compartidos deben aportarse por separado. La licencia es Apache 2.0 y la inferencia requiere una rama especifica de SGLang (PR #50270).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificacion especulativa: 5 capas, hidden size 5120, intermediate size 6144, con modulos de convolucion DFlash2 y selector de candidatos de rango 256 (top-k 16) |
| Parametros totales | 1.166.809.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como propiedad del borrador; la evaluacion se realizo con limite de contexto de 262.144 tokens y entrenamiento con secuencia maxima de 3072 |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El borrador sigue un esquema de dos anclas. En primer lugar, el modulo MTP nativo del modelo Qwen3.6-27B propone el primer token candidato T1. Despues, DFlash2 recibe la secuencia `[A, T1, MASK x 6]`, donde A es el ultimo token emitido, y propone en paralelo T2 a T7. La innovacion clave es que la representacion MTP que predijo T1 se normaliza y pasa por una red residual de rango 256 (`E(T1) <- E(T1) + W_up SiLU(W_down RMS(h_MTP))`), cuya proyeccion de salida se inicializo a cero al comienzo del entrenamiento. El embedding de A, los seis embeddings MASK y la ruta original de caracteristicas de contexto del objetivo permanecen sin cambios.

El borrador tiene cinco capas y toma caracteristicas del objetivo de las capas 0, 15, 30, 45 y 60. Se entreno sobre el dataset Huang2020/qwen3.6-27B-reasoning-regen con longitud maxima de secuencia de 3072, batch global de 128, tres epocas y paso final 41.209. Durante el entrenamiento, tanto el modelo objetivo como su MTP nativo permanecieron congelados; T1 usa el token de referencia en entrenamiento y la propuesta del MTP en inferencia. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Decodificacion especulativa: propone hasta siete tokens candidatos por ronda de verificacion sobre Qwen3.6-27B.
- Prediccion del primer token mediante el MTP nativo del modelo objetivo (ancla primaria).
- Borrador paralelo por bloques de seis tokens con DFlash2 (ancla secundaria).
- Integracion de representaciones MTP preentrenadas en el flujo DFlash2 mediante red residual de rango 256.
- Mejora de la aceptacion en cargas agenticas (Agent, SWE, horizonte largo) sin entrenamiento especifico en esos dominios, segun el autor.
- No genera texto de forma autonoma: requiere el modelo objetivo de 27B para verificar y emitir tokens.
- Soporte multilingue: no disponible (heredado del modelo objetivo, no documentado para el borrador).
- Tool calling, vision o audio: no disponible; el borrador no expone estas capacidades por si mismo.

## Casos de uso

- Aceleracion de inferencia en produccion sobre Qwen3.6-27B: desplegar el borrador junto al modelo objetivo en SGLang para reducir el numero de pasos de decodificacion, con siete propuestas por ronda verificadas en paralelo.
- Cargas de trabajo agenticas: el autor reporta la mayor mejora relativa en tareas de tipo agente (longitud aceptada por verificacion de 4,6871 frente a 3,8197 de DFlash2), lo que lo hace adecuado para pipelines con tool calling y multiples pasos.
- Generacion de codigo y tareas SWE: mejora de 3,9427 frente a 2,9273 en la tarea SWE del autor, util en asistentes de programacion que necesitan latencia baja por token.
- Razonamiento matematico: longitud aceptada de 4,8871 en la tarea Math, adecuado para servicios de resolucion de problemas con cadenas de razonamiento largas.
- Dialogo multiturno (MT-Bench): 4,1826 frente a 4,0044 del baseline, util en atencion al cliente o asistentes conversacionales donde el coste por token es critico.
- Contexto largo y horizonte largo: evaluado con limite de contexto de 262.144 tokens y hasta 28.000 tokens de salida, apto para resumen de documentos extensos y analisis de repositorios.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para estudiar la combinacion de MTP nativo con borradores paralelos, con codigo en la rama sglang-dmtp y PR upstream.

## Benchmarks y rendimiento

Los datos del autor miden longitud aceptada por verificacion (per-verify accepted length), no precision de tarea. Ambos modelos usan rejection sampling a nivel de token con siete propuestas por ronda, TP4, concurrencia hasta 32, contexto de 262.144 tokens y hasta 28.000 tokens de salida.

| Tarea | DFlash2 (per-verify acc len) | DMTP dual-anchor (per-verify acc len) |
|---|---|---|
| Code | 3,9621 | 4,6022 |
| Math | 4,2909 | 4,8871 |
| MT-Bench | 4,0044 | 4,1826 |
| Agent | 3,8197 | 4,6871 |
| SWE | 2,9273 | 3,9427 |
| Long-horizon | 3,1929 | 4,3310 |

No se han publicado resultados de benchmarks de precision de tarea (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El borrador ocupa 2,3 GB en BF16; debe residir junto al modelo objetivo de 27B, cuyo peso en BF16 ronda los 54 GB.
- La configuracion de referencia del autor usa TP8 (8 GPUs) con backend de atencion FA3 y CUDA Graphs de decodificacion.
- VRAM total estimada: el modelo objetivo de 27B en BF16 requiere aproximadamente 54 GB solo en pesos, mas cache KV para contexto de hasta 262.144 tokens; el borrador anade unos 2,3 GB. Con TP8 el reparto por GPU es de aproximadamente 7 GB de pesos del objetivo mas cache KV y overhead.
- GPU recomendadas: H100 o A100 en configuracion multi-GPU (TP4 o TP8). No se documenta soporte en GPUs de consumo.
- Cabe en GPU de consumo: no disponible; el modelo objetivo de 27B en BF16 no cabe en una RTX 4090 de 24 GB sin cuantizacion, y no se documentan pesos cuantizados del borrador.
- Despliegue: exclusivamente SGLang en la rama `feat/dmtp-upstream-20261113` (PR #50270), con `--speculative-algorithm DFLASH`, `--speculative-num-draft-tokens 8` y variables de entorno `SGLANG_DMTP_T1_RESIDUAL=1` y `SGLANG_USE_SGL_FA3_KERNEL=1`, entre otras.
- Latencia y throughput: no disponibles de forma absoluta; la mejora se expresa como longitud aceptada por verificacion (hasta 4,8871 en Math frente a 4,2909 de DFlash2).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-DMTP | 1,17B (borrador) | no disponible (evaluado a 262.144) | MTP nativo + DFlash2 dual-anchor | Apache 2.0 | Hugging Face, requiere SGLang con PR #50270 |
| DFlash2 baseline (misma config) | no disponible | no disponible | Borrador paralelo por bloques | no disponible | Referencia interna del autor, sin repo publico indicado |
| EAGLE-3 (familia de borradores especulativos) | no disponible | no disponible | Borrador autoregresivo con fusion de caracteristicas | no disponible | no disponible en la informacion proporcionada |
| Medusa (cabeceras especulativas) | no disponible | no disponible | Multiples cabeceras de decodificacion especulativa | no disponible | no disponible en la informacion proporcionada |

La comparativa con EAGLE-3 y Medusa no puede cuantificarse con los datos disponibles; se incluyen solo como categorias de referencia. El unico contraste numerico publicado es frente al baseline DFlash2 entrenado con la misma configuracion.

## Limitaciones y advertencias

- No es un modelo autonomo: sin Qwen3.6-27B, su MTP nativo y el embedding y cabecera compartidos, los pesos no son utilizables.
- La metrica reportada es aceptacion de borrador, no precision de tarea; no debe interpretarse como mejora en calidad de respuestas.
- Requiere una rama no fusionada de SGLang (PR #50270) y un conjunto extenso de variables de entorno; la integracion en produccion depende de que el PR se acepte upstream.
- La configuracion de referencia usa TP8 y contexto de 3072 en el ejemplo de arranque, aunque la evaluacion se hizo con limite de 262.144 tokens; hay que validar el comportamiento en cada configuracion.
- No se documentan sesgos, tasas de alucinacion ni cobertura idiomatica del borrador; estos riesgos dependen del modelo objetivo.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni soporte para llama.cpp, Ollama o TGI.
- El dataset de entrenamiento es especifico de razonamiento regenerado; no se detalla su composicion ni su cobertura de dominios.
- Licencia Apache 2.0 permite uso comercial, pero las dependencias (SGLang, FA3) y el modelo objetivo tienen sus propias condiciones que deben verificarse.

## Enlaces

- Hugging Face: https://huggingface.co/Piggy12/Qwen3.6-27B-DMTP
- Blog del metodo: https://sylvan820.github.io/D-MTP/
- Repositorio SGLang con DMTP: https://github.com/Sylvan820/sglang-dmtp/tree/feat/dmtp-upstream-20261113
- PR de SGLang: https://github.com/sgl-project/sglang/pull/50270
- Dataset de entrenamiento: https://huggingface.co/datasets/Huang2020/qwen3.6-27B-reasoning-regen
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B

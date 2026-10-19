# cpral/poziomka-instruct-kld-2026-10-19-2-badawczy

## Resumen

poziomka-instruct-kld-2026-10-19-2-badawczy es un checkpoint de 4.119.797.632 parámetros (aproximadamente 4,12 mil millones) publicado por el usuario cpral en HuggingFace. Se trata del resultado de un experimento de destilación de conocimiento off-policy sobre un modelo previo de su propia serie poziomka-instruct. El autor lo describe explícitamente como un experimento fallido: extrajo logits del modelo Bielik-PL-Minitron-7B-v3.0-Instruct-W8A8-INT8 sobre el 19 % del dataset polaco polskie-sprawy-v8 y los utilizó para un ajuste adicional del checkpoint poziomka-instruct-2026-10-17-dcp (iteración 0005214).

Según la propia model card, el entrenamiento no mejoró el modelo base y le introdujo un defecto funcional: la emisión del token EOS es irregular, lo que compromete la terminación controlada de las generaciones. Los metadatos declaran la arquitectura bailing_moe con código personalizado (custom_code), aunque no se publican el número de parámetros activos, la longitud de contexto, la licencia ni los idiomas soportados.

Su interés es, por tanto, documental y de investigación: constituye un caso de estudio de cómo una destilación de logits con cobertura parcial del dataset y sin componente on-policy puede degradar el comportamiento de parada del modelo. No es un checkpoint recomendable para producción ni para evaluación de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_moe (MoE, código personalizado; requiere `trust_remote_code`) |
| Parametros totales | 4.119.797.632 (~4,12 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors, sin variantes GGUF, GPTQ, AWQ ni INT8 publicadas |
| Idiomas soportados | no disponible en los metadatos; los datos de entrenamiento (polskie-sprawy-v8) son en polaco |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 8,2 GB, consistente con pesos en FP16/BF16) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura del repositorio es `bailing_moe` con `custom_code`, lo que implica un diseño de mezcla de expertos (MoE) implementado mediante código que no forma parte de la librería estándar de transformers y que obliga a cargar el modelo con `trust_remote_code=True`. No se detalla el número de expertos, el enrutador, la dimensión oculta ni cuántos parámetros se activan por token, de modo que la relación entre los 4,12 mil millones de parámetros totales y la capacidad efectiva de cómputo por token queda sin documentar.

El entrenamiento consistió en una destilación off-policy de logits: el profesor Bielik-PL-Minitron-7B-v3.0-Instruct-W8A8-INT8 generó las distribuciones objetivo sobre el 19 % del dataset polskie-sprawy-v8, y el checkpoint alumno poziomka-instruct-2026-10-17-dcp (iter_0005214) —previamente entrenado sobre el mismo dataset— se ajustó adicionalmente sobre esas logits. La model card no especifica hiperparámetros, número de tokens, función de pérdida concreta (KL divergencia u otra), ni si hubo fases posteriores de RLHF o DPO. El autor concluye que el ajuste no aportó mejoras y que alteró el comportamiento de parada del modelo.

## Capacidades

- Generación de texto en polaco: heredada del checkpoint base y del profesor, ambos vinculados al dataset polskie-sprawy-v8.
- Razonamiento e instrucciones generales: no verificado ni documentado; no hay benchmarks ni ejemplos de salida publicados.
- Código y matemáticas: no disponible; sin datos que lo respalden.
- Tool calling / function calling: no disponible; no se declara soporte de plantilla de herramientas.
- Agentes y razonamiento multi-paso: no disponible; el defecto de emisión de EOS hace inviable el control de bucles en pipelines agénticos.
- Capacidades multilingües: no declaradas; el material de entrenamiento es exclusivamente polaco.
- Modo thinking, visión o audio: no disponible.
- Terminación de secuencia: degradada de forma explícita según el autor (EOS irregular).

## Casos de uso

- Estudio de fallos en destilación de logits: el checkpoint sirve como caso negativo controlado para analizar cómo una destilación off-policy con cobertura del 19 % del dataset puede degradar la distribución de probabilidad del token EOS frente al modelo base.
- Auditoría de mecanismos de parada en LLM: permite construir bancos de pruebas para detectores de bucles y estrategias de corte forzado (`max_new_tokens`, `eos_token_id` múltiple, heurísticas de repetición) en escenarios donde el modelo no termina correctamente.
- Reproducción de experimentos de KD en polaco: al estar publicados el profesor, el dataset y el checkpoint base, habilita la réplica del pipeline completo para investigar variantes on-policy o coberturas mayores del dataset.
- Evaluación comparativa alumno-profesor: cuantificar la divergencia entre las distribuciones del modelo de 4,12 B y las del profesor Bielik-PL-Minitron-7B, útil para estudiar la transferencia de conocimiento entre arquitecturas de distinto tamaño.
- Investigación sobre arquitecturas MoE con código personalizado: análisis de la integración de `bailing_moe` en transformers, de los requisitos de `trust_remote_code` y de la portabilidad a motores de inferencia alternativos.
- Docencia y material formativo: ejemplo real y documentado de experimento fallido para cursos sobre destilación, evaluación de modelos y riesgos de publicar checkpoints sin validación.
- Desarrollo de wrappers de inferencia robustos: el modelo actúa como caso de prueba exigente para capas de servicio que deben garantizar terminación y timeouts aunque el modelo no emita EOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único resultado cualitativo aportado por el autor es que el ajuste con logits «no mejoró el modelo» y que este «emite EOS de forma irregular». No hay métricas de MMLU, HumanEval, GSM8K, perplejidad ni evaluaciones en polaco.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4,12 B de parámetros, no datos publicados por el autor): ~8,2 GB solo para pesos en FP16/BF16, más caché KV y overhead del runtime; en la práctica, 10-14 GB para contextos moderados.
- En INT8: ~4,1 GB de pesos; en INT4: ~2,1 GB. No obstante, no se publican versiones cuantizadas y la arquitectura con `custom_code` complica la conversión.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegue con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para FP16 con contexto corto.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 sin cuantizar; en tarjetas de 8-12 GB requeriría cuantización, que hoy no está disponible en el repositorio.
- Opciones de despliegue: carga vía transformers con `trust_remote_code=True`; el soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado y requeriría portar la implementación `bailing_moe` a GGUF o a los kernels del motor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| poziomka-instruct-kld-2026-10-19-2-badawczy | 4,12 B totales; activos no disponibles | no disponible | no disponible | Experimental; fallido segun el autor |
| Bielik-PL-Minitron-7B-v3.0-Instruct-W8A8-INT8 (profesor) | ~7 B, cuantizado W8A8 INT8 | no disponible | no disponible | Modelo de referencia usado para extraer logits |
| poziomka-instruct-2026-10-17-dcp (iter_0005214) | no disponible | no disponible | no disponible | Checkpoint base sobre el que se aplico el ajuste |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a procedencia, tamano y estado de publicacion.

## Limitaciones y advertencias

- Defecto funcional declarado: emisión irregular del token EOS, lo que puede producir generaciones que no terminan, bucles y consumo descontrolado de tokens en producción.
- Experimento fallido: el propio autor indica que el ajuste con logits no mejoró el modelo base; no debe esperarse ninguna ganancia de capacidad respecto al checkpoint previo.
- Cobertura parcial del entrenamiento: la destilación se aplicó solo sobre el 19 % del dataset polskie-sprawy-v8, lo que puede introducir un sesgo de distribución respecto al modelo original.
- Licencia no especificada: sin licencia publicada no hay autorización clara de uso comercial; el riesgo jurídico es alto para cualquier despliegue.
- Idiomas no declarados: los datos de entrenamiento son polacos, por lo que el rendimiento en castellano u otras lenguas no está respaldado y previsiblemente será deficiente.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y exige auditoría previa en entornos corporativos.
- Inconsistencia de procedencia: los metadatos declaran MoE (`bailing_moe`) mientras que el linaje apunta a un profesor de 7 B denso cuantizado; la arquitectura efectiva y el número de parámetros activos no están verificados.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no existen evaluaciones independientes.
- No apto para producción ni para benchmarks de capacidad: cualquier uso debe limitarse a investigación y análisis de fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cpral/poziomka-instruct-kld-2026-10-19-2-badawczy
- Modelo profesor (Bielik-PL-Minitron-7B-v3.0-Instruct-W8A8-INT8): https://huggingface.co/cpral/Bielik-PL-Minitron-7B-v3.0-Instruct-W8A8-INT8
- Dataset polskie-sprawy-v8: https://huggingface.co/datasets/cpral/polskie-sprawy-v8
- Checkpoint base (poziomka-instruct-2026-10-17-dcp, iter_0005214): https://huggingface.co/cpral/poziomka-instruct-2026-10-17-dcp/tree/main/iter_0005214

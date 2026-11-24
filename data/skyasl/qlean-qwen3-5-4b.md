# SkyAsl/QLean-Qwen3.5-4B

## Resumen

QLean-Qwen3.5-4B es un artefacto experimental publicado por el usuario SkyAsl que acopla un verificador de pruebas Lean 4 determinista, implementado como circuito RV32IM sobre pesos compilados, al checkpoint base Qwen/Qwen3.5-4B. El repositorio no distribuye un modelo afinado de forma convencional: contiene overlays compilados (tablas ROM y DROM) y codigo de runtime en Python que carga el checkpoint original de Qwen en su revision fijada, verifica la integridad de sus 738 tensores mediante `tensor-sha256.json` y ejecuta el verificador en pesos compilados. La arquitectura subyacente es, por tanto, la del transformer Qwen3.5-4B, con un mecanismo externo de transporte de pruebas que enmarca los bytes de la prueba, planifica las dos rutas de ejecucion y enruta el veredicto del invitado hacia la cache de texto de Qwen.

El modelo resuelve un problema muy concreto: permitir que un LLM genere terminos Lean 4 y que un verificador determinista, empaquetado en el propio repositorio, valide la prueba sin depender de un servicio externo. La interfaz principal es `model.prove`, mientras que `forward` y `generate` delegan en el Qwen original sin modificaciones. El checkpoint base conserva su licencia Apache-2.0, mientras que los overlays y el runtime se publican bajo licencia MIT.

La relevancia es acotada pero tecnica: se trata de una prueba de concepto de verificacion formal integrada en el bucle de inferencia, con resultados documentados en `benchmarks.json` (paridad de logits en reposo, reparacion de un error de tipo real y aceptacion de una prueba por Lean 4.36.0 con cero dependencias de axiomas). No hay datos publicados de rendimiento en tareas estandar de NLP, y el propio autor reconoce que los ensayos en modo veredicto desnudo no lograron reparacion semantica en las tres candidaturas de teorema probadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B con overlay de verificador Lean 4 sobre circuito RV32IM (P3) |
| Parametros totales | 4B (checkpoint base Qwen3.5-4B); tamano del repo 1,7 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el loader carga el modelo en su dtype y anchura originales (BF16 en GPU) |
| Idiomas soportados | no disponible |
| Licencia | MIT (overlays y runtime); el checkpoint base conserva Apache-2.0 |
| Formato de pesos | safetensors (checkpoint base) mas overlays compilados con tablas ROM/DROM y manifiestos JSON |

## Arquitectura y entrenamiento

El componente base es el transformer Qwen3.5-4B, cargado sin modificaciones en su revision fijada y verificado tensor a tensor contra `tensor-sha256.json` (738 payloads). Sobre el se superpone un overlay compilado que implementa un verificador de pruebas Lean 4 sobre un circuito RV32IM denominado P3: el circuito ejecuta el checker en pesos compilados, mientras que el runtime Python enmarca los bytes de la prueba, planifica las dos rutas de ejecucion y enruta el veredicto del invitado hacia la cache de texto de Qwen. El invitado acepta un subconjunto estricto de Lean 4.

No se describe entrenamiento adicional ni afinado con RLHF/DPO en la informacion disponible. El proceso de publicacion consiste en una reconstruccion de los overlays en CPU a partir de las fuentes fijadas: las tablas ROM y DROM coinciden con los ELF reconstruidos y la referencia CPU fijada reprodujo las ocho trazas de invitado archivadas byte a byte. Los tiempos L4 y los hashes originales de overlay en `benchmarks.json` corresponden a ejecuciones previas en GPU; el reordenamiento de filas dispersas cambio los digests de los ficheros regenerados, y `rebuild-provenance.json` registra ambos conjuntos de hashes y el alcance de la verificacion.

## Capacidades

- Generacion de texto y razonamiento heredados del checkpoint Qwen3.5-4B mediante `forward` y `generate`.
- Transporte de pruebas Lean 4: `model.prove` ejecuta el circuito verificador y devuelve el resultado estructurado.
- Verificacion determinista de pruebas en un subconjunto estricto de Lean 4, con deteccion de dependencias de axiomas (la prueba aceptada en la demo tuvo cero dependencias).
- Modo veredicto estructurado (`structured=True`) y modo veredicto desnudo (`structured=False`), en el que Qwen debe generar el marco de prueba por si mismo.
- Seleccion de overlay ligado a objetivo mediante `overlay="..."`, cuyo manifiesto identifica el teorema exacto aceptado por el firmware.
- Reparacion de errores de tipo en la misma cache de texto tras un diagnostico del invitado y un turno de chat generico ("Try again.").
- Sin soporte documentado de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking mas alla del parametro `thinking` de `prove`.

## Casos de uso

- Verificacion de pruebas generadas por LLM en Lean 4: el modelo genera un termino y `model.prove` lo valida contra el verificador determinista empaquetado, sin servicio externo; adecuado para entornos con requisitos de reproducibilidad y sin conectividad.
- Reparacion iterativa de errores de tipo: el diagnostico del invitado se inyecta en la cache de texto y Qwen corrige el termino en el siguiente turno, como se demostro en la demo de composicion.
- Auditoria de dependencias de axiomas: el verificador informa de las dependencias de la prueba aceptada (cero en el caso documentado), util en pipelines de formalizacion que exigen pruebas sin axiomas adicionales.
- Experimentacion en verificacion formal integrada en inferencia: el par runtime Python mas overlay compilado sirve como banco de pruebas para investigar el acoplamiento entre LLM y checker determinista.
- Docencia e investigacion sobre transporte de pruebas: la separacion entre ruta de generacion (Qwen) y ruta de verificacion (invitado RV32IM) permite estudiar fallos de generacion frente a fallos de verificacion.
- Validacion de integridad de checkpoints: el cargador verifica los 738 tensores contra hashes SHA-256, reutilizable como mecanismo de control en despliegues que exigen procedencia estricta.

## Benchmarks y rendimiento

Los datos disponibles en `benchmarks.json` no son benchmarks de NLP, sino resultados de verificacion y paridad:

| Prueba | Resultado |
|---|---|
| Paridad de logits en reposo (L4) | 18 de 18 comparaciones coincidentes; todos los tensores originales preservados |
| Reparacion de error de tipo (demo de composicion) | Reparacion correcta en la misma cache de texto tras diagnostico del invitado y turno "Try again." |
| Aceptacion de prueba por Lean 4.36.0 | Aceptada con cero dependencias de axiomas |
| Ensayos en modo veredicto desnudo | Sin reparacion semantica en las tres candidaturas de teorema probadas |
| Reproducibilidad de trazas de invitado | 8 de 8 trazas archivadas reproducidas byte a byte por la referencia CPU fijada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo pesa 1,7 GB y el loader carga el checkpoint en BF16, por lo que se requiere al menos una GPU con soporte BF16.
- CUDA obligatoria con soporte BF16 y Triton; el loader ejecuta codigo Python del repositorio y necesita `trust_remote_code=True`.
- GPU recomendadas: no disponibles; el autor menciona ejecuciones en L4 (GPU de 24 GB) para los tiempos registrados.
- Encaje en GPU de consumo: no confirmado en la informacion disponible; un checkpoint de 4B en BF16 ocupa del orden de 8 GB de pesos, pero no se documenta prueba en RTX 4090 ni similares.
- Despliegue: PyTorch, Transformers 5.19.0, Accelerate y Safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el uso de codigo remoto con verificador compilado hace improbable su integracion directa en esos motores.
- Latencia y throughput: no disponibles; los tiempos L4 de `benchmarks.json` corresponden a ejecuciones previas en GPU y no se reproducen en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QLean-Qwen3.5-4B | 4B | no disponible | Qwen3.5-4B mas verificador Lean 4 compilado | MIT (overlays) / Apache-2.0 (base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | 4B | no disponible | Transformer generalista | Apache-2.0 | Hugging Face |
| Alternativas de verificacion formal con LLM | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre QLean y el checkpoint base en tareas estandar, por lo que la comparativa se limita a parametros, licencia y enfoque.

## Limitaciones y advertencias

- El invitado acepta solo un subconjunto estricto de Lean 4; pruebas fuera de ese subconjunto no son verificables.
- En modo veredicto desnudo (`structured=False`), Qwen debe generar el marco de prueba por si mismo y puede detenerse o cerrarlo vacio; los tres teoremas probados no lograron reparacion semantica.
- Requiere ejecutar codigo Python del repositorio con `trust_remote_code=True` y CUDA con Triton, lo que implica riesgos de seguridad y dependencia de hardware especifico.
- El loader verifica los 738 tensores contra hashes, pero el reordenamiento de filas dispersas cambio los digests de los ficheros regenerados; hay que consultar `rebuild-provenance.json` para el alcance exacto de la verificacion.
- Sin datos publicados de sesgos, alucinacion, cobertura idiomatica ni longitud de contexto; los riesgos del checkpoint base Qwen3.5-4B aplican sin mitigacion adicional documentada.
- Uso comercial: los overlays y el runtime son MIT, pero el checkpoint base conserva Apache-2.0 y deben respetarse ambas licencias.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia (23 de noviembre de 2026), sin validacion externa conocida; no recomendado para produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/SkyAsl/QLean-Qwen3.5-4B
- Checkpoint base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ficheros de referencia citados en la model card: `tensor-sha256.json`, `benchmarks.json`, `rebuild-provenance.json` (en el repositorio de Hugging Face)
- Paper, blog, repositorio o demo adicionales: no disponibles

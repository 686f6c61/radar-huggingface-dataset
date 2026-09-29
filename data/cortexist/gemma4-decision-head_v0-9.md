# cortexist/gemma4-decision-head_v0.9

## Resumen

`cortexist/gemma4-decision-head_v0.9` no es un modelo generativo de lenguaje al uso, sino una cabeza de decisión (decision head) empaquetada como sidecar GGUF para un motor de voz denominado `voice-trio/little-gemma`. El repositorio lo publica el usuario cortexist bajo licencia MIT y describe la exportación determinista de cabezas conversacionales ya entrenadas, con dos variantes identificadas como E4B y 12B. Según la model card, el artefacto hereda filas de entrenamiento elegibles desde la versión v0.6 hasta el piloto v0.9 y ajusta un único candidato de cabeza de decisión E4B bajo un protocolo congelado.

El componente no genera texto: recibe vectores de características (feature vectors) y produce una decisión/clasificación mediante softmax y argmax. La documentación técnica se apoya en la implementación en C11 (`279df9f`, con implementación inicial `9ccaff5`) y en una API pública documentada en `little-gemma/docs/decision-head.md`. Cada modelo exportado contiene 14 tensores en formato GGUF, con los arrays FP32 originales preservados y los contratos originales embebidos como procedencia.

Su relevancia es acotada y de nicho: se trata de un artefacto de investigación orientado a validación numérica e integración en un motor C/C++ concreto. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, tamaño de repo de 0,0 GB y el dato de safetensors indica 497.417 parámetros, coherente con una cabeza de decisión pequeña y no con un modelo de lenguaje completo. La model card mezcla terminología de Gemma y de un sistema de voz, lo que dificulta determinar con precisión su encaje exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decisión (clasificador sobre vectores de características); arquitectura base no especificada en la model card |
| Parametros totales | 497.417 (según dato de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre vectores de características, no sobre secuencias de texto) |
| Tipos de cuantizacion | GGUF con arrays FP32 sin modificar |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (`decision-head-e4b.gguf`, `decision-head-12b.gguf`); 14 tensores por modelo |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

La información disponible describe una cabeza de decisión que se ajusta bajo un protocolo congelado a partir de un conjunto de datos expandido, heredando filas de entrenamiento elegibles desde la versión v0.6 hasta el piloto v0.9. El split de test de autoría (held-out) se captura únicamente después de bloquear la cabeza, lo que sugiere una separación deliberada entre ajuste y evaluación para evitar fuga de información. Existen dos variantes exportadas, E4B y 12B, con 14 tensores cada una, cuyos arrays FP32 se preservan sin cambios y cuyos contratos originales quedan embebidos como procedencia. No se detalla en la model card la arquitectura interna de la cabeza, la composición del dataset, el número de tokens ni si se emplearon técnicas de RLHF o DPO.

El aspecto técnico más documentado es la paridad numérica entre la implementación en C11 y el runner de Python original. La validación local usa 1.046 observaciones para E4B y 1.055 para 12B, incluyendo entradas de sala/sonda guardadas, y reporta cero etiquetas cambiadas con un error máximo de probabilidad inferior a 1,8e-7. Se trata de comprobaciones de equivalencia numérica, no de nuevos tests de precisión con etiquetas. La implementación en C corrige empates de redondeo de probabilidad seleccionando la primera clase, para coincidir con el argmax de referencia tras softmax. El lector GGUF de llama.cpp recupera los 14 tensores de cada modelo exactamente, aunque la model card aclara que esto no prueba la ruta de ejecución del modelo.

## Capacidades

- Clasificación/decisión determinista sobre vectores de características precalculados, con salida de clases vía softmax y argmax.
- Exportación reproducible en formato GGUF con paridad numérica verificada frente al runner de Python original.
- Validación independiente mediante el lector GGUF de llama.cpp (recuperación exacta de tensores).
- Integración como módulo independiente dentro de la build del motor C11 (`decision-head`), con binarios Linux byte-idénticos a las builds aisladas validadas.
- Verificación de hashes de vectores congelados (128 vectores de referencia por host) y de hashes de NPZ/contratos originales.
- Soporte de comprobaciones de sanidad de memoria: address, undefined-behavior y leak sanitizer pasan en el host "nowhere".
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Clasificación de turnos en un pipeline de voz: el componente actúa como cabeza de decisión dentro del motor `voice-trio/little-gemma`, tomando features y emitiendo una etiqueta de decisión; encaja porque el flujo de trabajo está diseñado específicamente en torno a esta cabeza.
- Integración como sidecar GGUF en motores en C/C++: al exportarse como GGUF con arrays FP32 preservados, puede consumirse desde herramientas compatibles con ese formato, como valida el lector de llama.cpp.
- Validación de paridad numérica en CI: los scripts `validate.py` y `check_gguf_reader.py` permiten reproducir la exportación y comparar contra el runner de Python, útil para garantizar que un refactor no altera etiquetas.
- Investigación sobre protocolos de ajuste congelados: sirve como ejemplo reproducible de cómo separar ajuste y captura de test held-out en una cabeza de decisión.
- Medición de latencia de CPU: los informes de timing permiten comparar el rendimiento de la implementación C frente a Python en distintos hosts, útil para decidir dónde ejecutar la inferencia de la cabeza.
- Preservación de contratos y procedencia: al embeber contratos originales y hashes, es adecuado para trabajos que requieren trazabilidad de artefactos de modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los únicos datos numéricos son medidas de latencia de la cabeza aislada y comprobaciones de paridad numérica. La model card advierte expresamente que no son afirmaciones de latencia en vivo ni de aceleración del pipeline.

Timing de la cabeza en solitario (64 vectores por modelo, una pasada secuencial, se excluye warmup, 50 llamadas por vector; mediana de la media por vector, en microsegundos):

| Host de CPU | E4B C / Python (us) | 12B C / Python (us) |
|---|---:|---:|
| nowhere | 76,51 / 100,93 | 115,46 / 141,39 |
| Cortex | 143,41 / 269,40 | 205,12 / 339,43 |
| somewhere | 144,44 / 201,54 | 209,55 / 258,06 |

Paridad numérica: 1.046 observaciones E4B y 1.055 12B, cero etiquetas cambiadas, error máximo de probabilidad inferior a 1,8e-7. CTest: nowhere 6/6, Cortex 6/6, Windows 5/5 (el test de socket Unix no se registra en Windows).

## Requisitos de hardware

- Inferencia puramente en CPU: la implementación es C11 y se ejecuta en CPU, sin dependencia de GPU documentada.
- VRAM estimada: no aplica; el repositorio ocupa 0,0 GB y las cabezas son de tamaño muy reducido (497.417 parámetros indicados en safetensors).
- GPU recomendadas: no disponibles; el diseño apunta a ejecución en CPU.
- Cabe en cualquier equipo de consumo: sí, al ser una cabeza pequeña pensada para CPU, según los hosts usados en las pruebas (nowhere, Cortex, somewhere, además de Windows).
- Opciones de despliegue: integración como módulo C11 dentro de la build del motor (`build/decision-head`, `build/Release/decision-head.exe`), CLI propia y validación mediante el lector GGUF de llama.cpp. No se mencionan vLLM, TGI ni Ollama.
- Latencia estimada: mediana de 76,51 us por vector (E4B, host nowhere) hasta 115,46 us (12B, nowhere), con variaciones según host recogidas en la tabla anterior. Se excluyen carga de modelo, captura de features, IPC, ASR, prefill en GPU y síntesis de voz.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoría (cabezas de decisión o sidecars GGUF para motores de voz), ni datos que permitan establecer una comparación fiable de parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no produce texto ni responde a prompts; emite decisiones a partir de vectores de características.
- La model card es internamente confusa y mezcla referencias a Gemma con un motor de voz (`voice-trio/little-gemma`); varios metadatos (pipeline, idiomas) no están disponibles.
- Los resultados de validación son de equivalencia numérica, no de precisión con etiquetas nuevas; la propia card aclara que no son nuevos tests de accuracy.
- Los timings son una única pasada secuencial con un límite de medición concreto, no un estudio de rendimiento aleatorizado, y no representan latencia en vivo.
- El cambio a la ruta de Python en vivo, la validación de scheduling/transporte y cualquier sesión de voz en vivo quedan fuera del alcance declarado.
- No se realizaron entrenamiento, cambios de CUDA ni push público en los trabajos descritos.
- Repositorio sin tracción: 0 descargas y 0 likes; 0,0 GB de tamaño, lo que puede indicar artefactos no incluidos o vacíos.
- Licencia MIT: permite uso comercial, pero no hay garantías documentadas sobre idoneidad en producción ni sobre sesgos, ya que no se reportan evaluaciones al respecto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el comportamiento de clasificación depende por completo de la calidad de los vectores de características de entrada y del contrato original, no verificado aquí.

## Enlaces

- HuggingFace: https://huggingface.co/cortexist/gemma4-decision-head_v0.9
- Documentación de la API/formatos (referida en la card): `little-gemma/docs/decision-head.md` (dentro del repositorio del motor `voice-trio/little-gemma`; no se proporciona URL completa)
- Repositorio/rama de motor referenciada: `voice-trio/little-gemma`, topic `experiment/decision-head-c-20260923` (sin URL completa en la informacion disponible)
- Scripts de validación referenciados: `scripts/validate.py`, `scripts/check_gguf_reader.py`
- Informes referenciados: `reports/nowhere-final.json`, `reports/*-sources.json`, `reports/hardware-*.json`, `reports/somewhere-installed.json`

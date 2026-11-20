# DuoNeural/RMSN-307M-ArnoldTongue-Omega511-ODD

## Resumen

RMSN-307M-ArnoldTongue-Omega511-ODD es un modelo de lenguaje base de 307 millones de parámetros desarrollado por DuoNeural dentro de su línea de investigación RMSN (Resonant Metriplectic Sheaf Network). El modelo se presenta como una red recurrente de tipo Port-Hamiltonian, una formulación poco convencional que se aparta del transformer estándar y que el autor enmarca en un programa de estudio de "topología de lenguas de Arnold" y resonancias dinámicas. Esta variante concreta se entrena en la resonancia Ω=5/11 (q=11, paridad impar) y se publica como evidencia del experimento interno "Wave-146".

El interés del modelo es fundamentalmente de investigación: no se posiciona como un asistente conversacional ni como un modelo de propósito general, sino como una pieza dentro de un barrido sistemático (q-Survey, q=3–13) que el autor usa para mapear regímenes de estabilidad dinámica en redes recurrentes con estructura hamiltoniana. La model card reporta una perplejidad de validación de 89,25 tras 100.000 pasos y 102,4 millones de tokens de entrenamiento, cifras que sitúan el modelo en un régimen de calidad muy preliminar para generación de texto.

La relevancia actual es limitada fuera del círculo de investigación del autor: el repositorio no tiene descargas ni interacciones, no se publican benchmarks estándar, no se declaran idiomas soportados y la terminología empleada (metripléctica, sheaf, paridad ODD, TRUE SILENT) no cuenta con validación externa en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), LM recurrente Port-Hamiltonian |
| Parametros totales | 307M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 3,7 GB) |

Dimensiones internas declaradas: D=960, profundidad L=33, ancho de slot M_w=64, resonancia Ω = D/(M_w × L) = 960/(64×33) = 5/11, paridad D/M_w = 15 (impar).

## Arquitectura y entrenamiento

La arquitectura es una red recurrente de lenguaje formulada como sistema Port-Hamiltonian, con un estado latente organizado en "slots" de ancho M_w=64 sobre una dimensión de modelo D=960 y 33 capas recurrentes. El autor describe la dinámica mediante conceptos de sistemas metriplécticos y "sheaves" resonantes, y caracteriza el régimen de entrenamiento por la relación Ω = D/(M_w × L), que en esta variante toma el valor 5/11. No se detalla en la información disponible el mecanismo exacto de atención, el esquema de recurrencia ni la formulación matemática completa; el autor remite a su repositorio de GitHub para la metodología.

El entrenamiento consistió en 100.000 pasos sobre 102,4 millones de tokens, con decaimiento de learning rate coseno desde 1e-3. No se especifica la composición del dataset, el tokenizador, ni si hubo fases de ajuste fino, RLHF o DPO. El autor reporta una perplejidad de validación de 89,25 y una estabilidad de Lyapunov de aproximadamente -0,001 ("TRUE SILENT"), incluyendo una recuperación tras un episodio de "hipercascada" con Lyapunov de -4,84 en el paso 42k. Estos indicadores son métricas internas del programa de investigación del autor y no están contrastadas con benchmarks públicos.

## Capacidades

- Generación de texto autoregresiva a nivel de modelo base, sin ajuste instructivo declarado.
- Modelado de lenguaje genérico; no se documentan capacidades específicas de razonamiento, código o matemáticas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: no disponible; no se especifican idiomas.
- No se declaran capacidades de visión, audio ni modo "thinking".
- El interés declarado del modelo es la caracterización dinámica (estabilidad de Lyapunov, topología de resonancias), no las capacidades de tarea.

## Casos de uso

- Investigación en arquitecturas recurrentes alternativas al transformer: el modelo sirve como punto de datos en el barrido q-Survey (q=3–13) para estudiar cómo varía la estabilidad dinámica con la resonancia Ω y la paridad de D/M_w.
- Estudio de estabilidad de Lyapunov en modelos de lenguaje: permite reproducir el análisis de regímenes "TRUE SILENT" frente a "cascade" y examinar la recuperación tras inestabilidades en el paso 42k.
- Reproducción de experimentos de dinámica hamiltoniana: útil para grupos que investigan formulaciones Port-Hamiltonian aplicadas a secuencias y quieran comparar con transformers de tamaño similar.
- Análisis de perplejidad en modelos pequeños: con 307M parámetros y PPL de validación de 89,25, sirve como referencia de un régimen de entrenamiento corto (102,4M tokens) para calibrar curvas de escalado en arquitecturas no estándar.
- Docencia e ilustración de conceptos de sistemas metriplécticos: el modelo y su model card pueden usarse como ejemplo didáctico de cómo se describe una arquitectura con terminología de mecánica geométrica.
- Exploración de tokenizadores y pipelines de evaluación en modelos base pequeños: dado su tamaño, es viable ejecutarlo en hardware modesto para pruebas de integración de pipelines de inferencia, siempre que se obtengan los pesos y el código de carga (no documentados en la información disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es la perplejidad de validación:

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad de validacion | 89,25 | Tras 100k pasos, 102,4M tokens |
| Estabilidad de Lyapunov | ≈ -0,001 ("TRUE SILENT") | Metrica interna del autor |
| Lyapunov en hipercascada | -4,84 | Paso 42k, recuperado después |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 307M parámetros, en FP16 serían aproximadamente 0,6 GB de pesos, y en FP32 unos 1,2 GB, a lo que habría que sumar el estado recurrente y el overhead del runtime (no documentado).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4–8 GB de VRAM debería ser suficiente en teoría, pero no se confirma compatibilidad con ningún runtime.
- GPU de consumo: probablemente sí (RTX 3060/4060 y superiores) por el tamaño del modelo, aunque no hay confirmación del autor ni instrucciones de carga.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Al ser una arquitectura Port-Hamiltonian no estándar, es improbable que funcione en runtimes genéricos sin código específico del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo frente a alternativas, por lo que la comparación se limita a parámetros, contexto y licencia. Los modelos de referencia son transformers base de tamaño comparable ampliamente utilizados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-307M-ArnoldTongue-Omega511-ODD | 307M | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| GPT-2 medium | 355M | 1024 tokens | MIT | Hugging Face, ampliamente desplegado |
| OPT-350M | 331M | 2048 tokens | OPT-175B license | Hugging Face |
| Pythia-410M | 410M | 2048 tokens | Apache 2.0 | Hugging Face |

La comparación de rendimiento con estas alternativas no está disponible; el autor no publica evaluaciones en tareas estándar que permitan situar el modelo frente a ellos.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no está diseñado para responder instrucciones ni para uso conversacional directo.
- Perplejidad de validación de 89,25, muy alta para estándares actuales; la calidad de generación será limitada y propensa a incoherencias.
- Entrenamiento con solo 102,4M tokens, muy por debajo de lo habitual en modelos de este tamaño; riesgo elevado de infraentrenamiento.
- No se declaran idiomas soportados; se desconoce la cobertura lingüística y la calidad por idioma.
- No hay datos sobre sesgos, alineación, filtrado de datos ni evaluación de seguridad.
- Riesgo de alucinación no evaluado; sin benchmarks ni evaluaciones humanas publicadas.
- Terminología y métricas internas (TRUE SILENT, hipercascada, paridad ODD) sin validación externa ni revisión por pares en la información disponible.
- Sin descargas ni interacciones en Hugging Face: no hay evidencia de uso comunitario ni de que los pesos sean cargables con herramientas estándar.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el código de inferencia y el formato de pesos limita su explotación práctica en producción.
- El tamaño del repo (3,7 GB) es desproporcionado para 307M parámetros, lo que sugiere pesos en FP32 o artefactos adicionales no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-307M-ArnoldTongue-Omega511-ODD
- GitHub del proyecto: https://github.com/duoneural/RMSN

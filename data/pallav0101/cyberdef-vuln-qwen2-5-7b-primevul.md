# pallav0101/cyberdef-vuln-qwen2.5-7b-primevul

## Resumen

cyberdef-vuln es un adaptador LoRA (QLoRA, r=16, alpha=32, cuantización 4-bit nf4) entrenado sobre Qwen/Qwen2.5-7B-Instruct para una tarea concreta: clasificar si un fragmento de código (típicamente una función) contiene una vulnerabilidad. Dado un snippet, el modelo emite `VERDICT: VULNERABLE` o `VERDICT: SAFE`, acompañando el veredicto con el nombre del CWE cuando aplica. Lo desarrolla Pallav Pokhriyal y se publica bajo licencia MIT.

El modelo está diseñado explícitamente como herramienta de triaje defensivo (blue-team), no como generador de exploits ni como herramienta de reparación automática de código. Su propuesta de valor está en mejorar la capacidad del modelo base para *ordenar* código vulnerable frente a código seguro: según la model card, eleva el AUROC de 0,658 (base) a 0,786 en el benchmark PrimeVul, y la ventaja se transfiere a un dataset no visto (DiverseVul) a lo largo de cuatro semillas.

La relevancia práctica es doble: por un lado, demuestra que un ajuste fino ligero sobre un modelo generalista de 7B puede aportar señal útil en detección de vulnerabilidades; por otro, la model card documenta un resultado negativo previo (un adaptador entrenado con datos sintéticos que no superó al base en Devign) y lo conserva en el repositorio, lo que aporta trazabilidad metodológica poco habitual en adaptadores de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA es un subconjunto adicional (tamano del repo: 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | Entrenado en QLoRA 4-bit nf4; el adaptador se distribuye en safetensors y se aplica sobre el base en la precision que se elija al cargarlo |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador); modelo base Qwen2.5-7B-Instruct bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen2.5-7B-Instruct por separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parámetros. El ajuste se realizó con QLoRA: cuantización 4-bit nf4 del base, rango LoRA r=16 y alpha=32. El entrenamiento usó exclusivamente el split de entrenamiento de PrimeVul, con deduplicación de fugas (leakage) contra las funciones de validación y test. La model card afirma que no se emplearon salidas generadas por modelos ni por APIs comerciales como datos de entrenamiento.

La tarea formulada es de clasificación binaria con etiqueta textual (`VERDICT: VULNERABLE` / `VERDICT: SAFE`) y, cuando procede, identificación del CWE. La evaluación se realiza con un harness de puntuación por log-probabilidades, lo que permite obtener una señal continua y calibrar un umbral de abstención. El autor documenta controles de integridad en el repositorio: cada métrica se recalcula a partir de las salidas por caso registradas y se rechaza cualquier puntuación que no coincida con su recálculo.

## Capacidades

- Clasificación de vulnerabilidad sobre un fragmento de código, con veredicto binario y etiqueta CWE cuando aplica.
- Puntuación calibrada por log-probabilidad, apta para fijar umbrales de abstención ("abstain when unsure").
- Triaje defensivo orientado a revisión humana, no a explotación.
- Razonamiento sobre código en el contexto de la clasificación (hereda las capacidades del base Qwen2.5-7B-Instruct, aunque el adaptador está especializado en la tarea de veredicto).
- Soporte conversacional y de generación de texto heredado del base (pipeline text-generation, formato conversational).
- No cubre generación de exploits ni reparación automática de código por diseño declarado.

## Casos de uso

- Triaje en pipelines de revisión de código: integrado como paso previo a la revisión manual, el adaptador marca funciones candidatas a inspección y reduce el volumen que llega al revisor humano; su calibración permite descartar automáticamente los casos de baja confianza mediante un umbral de abstención.
- Priorización de hallazgos en SAST: combinado con un analizador estático, se usa para reordenar alertas por probabilidad de vulnerabilidad real antes de asignarlas a un equipo de seguridad.
- Filtrado en Pull Requests: como comprobación adicional en CI, puede señalar diffs con veredicto `VULNERABLE` para bloquear el merge hasta revisión, nunca como gate autónomo.
- Auditoría de dependencias y código heredado: procesar por lotes funciones de repositorios antiguos para localizar candidatos a CWE conocidos y planificar revisiones.
- Formación y concienciación: usar sus veredictos y etiquetas CWE como material de estudio en equipos de desarrollo para ilustrar patrones inseguros.
- Investigación en detección de vulnerabilidades: como baseline reproducible (receta, semillas y harness publicados) para comparar nuevas aproximaciones sobre PrimeVul, DiverseVul o Devign.
- Enriquecimiento de bases de datos internas: etiquetar funciones con un veredicto preliminar y un CWE sugerido para alimentar paneles de deuda de seguridad.

## Benchmarks y rendimiento

Datos reportados en la model card (evaluación con harness de log-probabilidad; cifras recalculadas por el autor desde las salidas por caso):

| Benchmark | Metrica | Adaptador | Base Qwen2.5-7B-Instruct |
|---|---|---|---|
| PrimeVul | AUROC | 0,786 | 0,658 |
| DiverseVul (no visto) | Transferencia de la ventaja en 4 semillas con rangos base/ajustado sin solapamiento | ventaja confirmada | no disponible cifra exacta |
| CodeXGLUE Devign | Ranking | primero (segun la model card) | no disponible cifra exacta |

Comparaciones cualitativas declaradas por el autor: en el mismo harness de log-probabilidad supera a Qwen2.5-Coder-7B y Foundation-Sec-8B. Las tablas completas, semillas y la línea de integridad están en `RESULTS.md` del repositorio de GitHub. No se han publicado en la información disponible cifras detalladas de Devign ni de DiverseVul más allá de la descripción cualitativa.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa unos 0,2 GB; el modelo base de 7B requiere aproximadamente 14-16 GB en FP16/BF16 y alrededor de 5-6 GB en cuantización 4-bit (nf4), además del overhead de activaciones y contexto.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en BF16 con contexto moderado.
- GPU de consumo: cabe en GPUs de 24 GB en BF16 y en GPUs de 8-12 GB si se cuantiza el base a 4-bit (por ejemplo, con bitsandbytes) o se usan formatos GGUF.
- Opciones de despliegue: transformers + peft (receta oficial de la model card); vLLM y TGI para servir el base fusionado con el adaptador; llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberdef-vuln (este) | 7B + LoRA | no disponible | Detección de vulnerabilidades (adaptador QLoRA) | MIT (adaptador) / Apache-2.0 (base) | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en la informacion proporcionada | Modelo generalista conversacional | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-7B | 7B | no disponible en la informacion proporcionada | Código | no disponible en la informacion proporcionada | Hugging Face |
| Foundation-Sec-8B | 8B | no disponible en la informacion proporcionada | Seguridad | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

Según la model card, el adaptador supera a Qwen2.5-Coder-7B y Foundation-Sec-8B en el mismo harness de log-probabilidad, y ocupa el primer puesto en CodeXGLUE Devign. No se dispone de cifras numéricas de esos competidores en la información proporcionada.

## Limitaciones y advertencias

- Falso `SAFE`: es el modo de fallo peligroso declarado por el autor. Un veredicto `SAFE` significa únicamente "no se encontró vulnerabilidad según este modelo", nunca una garantía; debe mantenerse siempre revisión humana.
- No apto para gating autónomo, generación de exploits ni reparación de código; su uso previsto es asistivo y con umbral de abstención.
- El adaptador está entrenado solo sobre PrimeVul; el rendimiento fuera de distribuciones similares (otros lenguajes, frameworks o estilos de código) no está caracterizado en la información disponible.
- Idiomas soportados no declarados; la tarea se centra en código, no en texto multilingüe.
- Sesgos conocidos: no documentados en la model card; al heredar el base Qwen2.5-7B-Instruct, arrastra los sesgos de este.
- Riesgo de alucinación en la etiqueta CWE: la asignación de CWE puede ser incorrecta aunque el veredicto sea correcto; conviene tratarla como sugerencia.
- Resultado negativo documentado: un incremento previo entrenado con datos sintéticos no superó al base en Devign; solo el adaptador publicado (datos reales de PrimeVul) supera el listón en benchmark reconocido.
- Licencia: adaptador MIT, base Apache-2.0; el uso comercial debe cumplir ambas. Verificar los términos del base antes de redistribuir el modelo fusionado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pallav0101/cyberdef-vuln-qwen2.5-7b-primevul
- Repositorio GitHub (código, receta, resultados, reproducción): https://github.com/pallav0107/cyberdef-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- ORCID del autor: https://orcid.org/0009-0001-5356-7663

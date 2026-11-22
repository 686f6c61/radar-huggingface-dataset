# matthew-sudo2/gemma-3-1b-wsp-llm-edited

## Resumen

`matthew-sudo2/gemma-3-1b-wsp-llm-edited` es un checkpoint derivado de `google/gemma-3-1b-pt` obtenido mediante una intervencion de cirugia de pesos (*weight surgery*) de disparo cero, guiada por diagnosticos de activaciones contrastivas entre idiomas. El autor (matthew-sudo2) lo publica como parte de un piloto controlado 3×3 sobre el benchmark FilBench, que evalua capacidades en filipino, tagalo y cebuano. No se trata de un modelo nuevo entrenado desde cero, sino de una edicion quirurgica de los pesos del modelo base de Google.

La hipotesis central es que, dado que Gemma-3 aplica normalizacion RMS tras cada bloque MLP antes de la suma residual (`post_feedforward_layernorm`), el escalado uniforme de tensores completos produce un cambio direccional neto casi nulo. Solo las ediciones dispersas y selectivas por columna modifican de forma efectiva la composicion direccional de la salida del MLP. Sobre esa base, el autor amplifica neuronas MLP discriminativas del filipino e incrementa un 4 % las filas del embedding atado correspondientes a palabras funcionales filipinas inequivocas.

El interes del modelo es fundamentalmente metodologico: sirve como referencia reproducible para estudiar si la edicion de pesos guiada por interpretabilidad mecanistica produce mejoras medibles en un idioma de bajos recursos. Los resultados publicados son marginales y no alcanzan significacion estadistica convencional (p = 0.0619), por lo que su valor practico en produccion es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-3), con RMSNorm post-MLP (`post_feedforward_layernorm`) y embeddings atados |
| Parametros totales | 1B (heredados de `google/gemma-3-1b-pt`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | tl (tagalo/filipino), en (ingles) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (formato estandar de Transformers; no se documentan otros) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-pt`, un transformer decoder-only de aproximadamente 1B parametros con embeddings atados y normalizacion RMS aplicada tras cada bloque MLP antes de la adicion residual. No hay entrenamiento adicional: la intervencion consiste en una edicion declarativa de pesos aplicada en tres frentes. Primero, se amplifican columnas de `down_proj` (y filas compuestas de `up_proj`) para las neuronas MLP mas discriminativas del filipino, identificadas mediante perfilado de activaciones contrastivas con el estadistico Δmean = μ_fil − μ_en (por ejemplo, L12 n1987, L15 n5201, L17 n5305). Segundo, se aplica un incremento del 4 % en las filas del embedding atado correspondientes a palabras funcionales filipinas inequivocas (`sa`, `ang`, `ng`, `mga`, `na`) para desplazar el prior del siguiente token hacia el filipino sin contaminar tokens ingleses. Tercero, se impone un presupuesto de seguridad *fail-closed*: como maximo 32 operaciones, 24 tensores, |δ| ≤ 0.15 y ΔF/F de Frobenius ≤ 0.10, auditado en fp32 con verificacion posterior al redondeo a bf16.

El plan declarativo completo se almacena en `edit_bundle.json` y el informe de auditoria en `filbench_wsp_edit_report.json`. No se documentan datos de entrenamiento adicionales, RLHF, DPO ni decodificacion especulativa; la unica "innovacion" tecnica es el propio procedimiento de cirugia de pesos guiado por interpretabilidad.

## Capacidades

- Generacion de texto autoregresiva en tagalo/filipino e ingles, heredada del modelo base.
- Razonamiento basico y respuesta a preguntas de cultura general, con rendimiento limitado por el tamano de 1B parametros.
- Evaluacion en tareas FilBench: Dengue (promedio 74.00 %), Global MMLU en tagalo (21.93 %) e Include en tagalo (17.05 %).
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues limitadas a los dos idiomas declarados (tl, en).
- No se documentan modos especiales (thinking, vision, audio) ni capacidades multimodales.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el modelo sirve como condicion experimental reproducible para estudiar el efecto de ediciones selectivas de neuronas MLP sobre el comportamiento linguistico, comparandolo con el control aleatorio emparejado (`gemma-3-1b-wsp-random-control`).
- Reproduccion de experimentos de cirugia de pesos: el `edit_bundle.json` y el informe de auditoria permiten replicar tensor a tensor la intervencion y verificar los hashes de delta.
- Evaluacion comparativa en FilBench: util como punto de referencia en la suite de benchmarks filipinos junto con el modelo base y el control aleatorio.
- Analisis de sesgo idiomatico: permite medir como un desplazamiento del prior del siguiente token hacia palabras funcionales filipinas afecta a la generacion en tagalo frente al ingles.
- Prototipado de bajo coste en tagalo: al ser un modelo de 1B parametros con licencia Gemma, puede desplegarse en hardware modesto para pruebas de generacion de texto en filipino.
- Docencia y formacion: ejemplo didactico de como aplicar tecnicas de edicion de pesos con presupuestos de seguridad y auditoria en fp32/bf16.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de desarrollo de FilBench:

| Condicion | FilBench Macro (%) | Dengue Avg (%) | Global MMLU Tgl (%) | Include Tgl (%) |
|---|---|---|---|---|
| Base (`google/gemma-3-1b-pt`) | 25.97 | 74.00 | 22.81 | 15.80 |
| LLM-Edited (este modelo) | 25.97 | 74.00 | 21.93 | 17.05 |
| Matched Random Control | 25.80 | 74.00 | 21.93 | 17.05 |

Comparacion emparejada a nivel de instancia frente al checkpoint base:

| Metrica | Valor |
|---|---|
| Ejemplos de test totales | 1.431 |
| Delta medio por instancia | +0.91 % (IC 95 %: [−0.07 %, +1.96 %]) |
| Error estandar bootstrap | 0.53 % |
| Instancias mejoradas / empeoradas / sin cambio | 62 / 42 / 1.327 |
| Test de signos bilateral | p = 0.0619 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2 GB para los pesos de 1B parametros, mas overhead de activaciones y cache KV (no documentado por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) para bf16; tambien cabe en CPU para pruebas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: Transformers con `device_map="auto"` (documentado en el quickstart); vLLM, llama.cpp, Ollama o TGI no estan documentados por el autor, aunque al ser un checkpoint estandar de Transformers deberian ser compatibles tras conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FilBench Macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-wsp-llm-edited (este) | 1B | no disponible | 25.97 % | Gemma Terms of Use | Hugging Face |
| google/gemma-3-1b-pt (base) | 1B | no disponible | 25.97 % | Gemma Terms of Use | Hugging Face |
| gemma-3-1b-wsp-random-control | 1B | no disponible | 25.80 % | Gemma Terms of Use | Hugging Face (referenciado) |

No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Mejora marginal y no significativa: el delta medio por instancia es +0.91 % con p = 0.0619, por encima del umbral convencional de 0.05; el resultado no puede considerarse una mejora demostrada.
- Regresion en Global MMLU tagalo: baja de 22.81 % a 21.93 % respecto al base, lo que sugiere un posible coste en conocimiento general al desplazar el prior idiomatico.
- Sesgos conocidos: hereda los sesgos del modelo base de Google; la edicion selectiva de palabras funcionales filipinas puede introducir sesgos adicionales no auditados.
- Riesgo de alucinacion: alto, propio de un modelo de 1B parametros sin ajuste por instrucciones (es un checkpoint *pt*, no *it*).
- Limitaciones de contexto e idioma: solo se declaran tl y en; el contexto maximo no esta documentado; el rendimiento en otros idiomas no ha sido evaluado.
- Restricciones de licencia: se rige por los Gemma Terms of Use, que imponen condiciones de uso comercial y de redistribucion; es necesario revisarlas antes de cualquier despliegue en produccion.
- Caveat de produccion: es un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta; no hay garantias de mantenimiento ni soporte.
- La evaluacion se limita al split de desarrollo de FilBench; no se reportan resultados en test ciego ni en otros benchmarks estandar (MMLU global, HumanEval, GSM8K).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthew-sudo2/gemma-3-1b-wsp-llm-edited
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- Control aleatorio emparejado: `gemma-3-1b-wsp-random-control` (referenciado en la model card, sin URL directa)
- Dataset de experimentos FilBench: referenciado como "FilBench Experiments Dataset" en Hugging Face (sin URL directa en la informacion proporcionada)
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms

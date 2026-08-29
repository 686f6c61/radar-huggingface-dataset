# karuppusamym/slm-125m-legal-financial

## Resumen

slm-125m-legal-financial es un modelo de lenguaje causal de 125,8 millones de parametros, con arquitectura estilo Llama, entrenado desde cero (from scratch) sobre un corpus de jurisprudencia estadounidense, declaraciones SEC y texto web educativo. Lo desarrolla karuppusamym (con repositorio asociado en GitHub bajo el usuario mcrao) y esta publicado bajo licencia Apache 2.0. El modelo esta pensado para completar texto en los dominios legal y financiero en ingles, no para mantener conversaciones ni seguir instrucciones.

El checkpoint publicado corresponde al punto de mejor perplejidad de validacion de un entrenamiento que se detuvo al 58 % del plan previsto (paso 10.253 de 17.645), habiendo visto 5,38 mil millones de tokens de los 9,25 mil millones objetivo. A pesar de estar parcialmente entrenado, la perplejidad de validacion seguia mejorando cuando se detuvo el proceso, por lo que un entrenamiento completo probablemente daria mejores resultados. Su relevancia radica en ser un experimento reproducible y de bajo coste (31,76 dolares segun la web del proyecto) para construir un modelo de dominio especifico desde cero, con un pipeline completo documentado: datos, tokenizador, preentrenamiento, evaluacion y demo web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (SwiGLU, RoPE, RMSNorm pre-norm, embeddings atados) |
| Parametros totales | 125.848.320 (125.847.552 segun la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/fp32) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama clasica: 12 capas, tamano oculto de 768, 12 cabezas de atencion y 12 cabezas KV, tamano intermedio SwiGLU de 3.072, RoPE con theta 10.000 y vocabulario BPE a nivel de byte de 16.384 tokens entrenado desde cero sobre el corpus. Los embeddings estan atados (tied embeddings) y el entrenamiento se realizo en precision mixta bf16 con pesos maestros en fp32.

El corpus de entrenamiento consta de 1,85 mil millones de tokens empaquetados en ventanas de 1.024 tokens, compuesto por un 31,1 % de jurisprudencia estadounidense (dataset `HFforLegal/case-law`), un 43,9 % de declaraciones SEC (dataset `PleIAs/SEC`) y un 25,0 % de texto web educativo (muestra de `HuggingFaceFW/fineweb-edu`). El pipeline de limpieza incluyo filtros de boilerplate, OCR, repeticion e idioma, deduplicacion MinHash para jurisprudencia y deduplicacion exacta para el resto, y decontaminacion contra los splits de evaluacion de CaseHOLD y LexGLUE. El entrenamiento uso AdamW (betas 0,9 y 0,95, weight decay 0,1), learning rate pico de 6e-4 con decaimiento coseno, warmup de 200 millones de tokens, gradiente clipping a norma global 1,0 y batch global de 524.288 tokens por paso, en 8 GPU H100 con DDP de un solo nodo. No se aplico RLHF ni DPO; es un modelo base de solo preentrenamiento.

## Capacidades

- Generacion de texto por continuacion: completa fragmentos de texto legal y financiero de forma fluida y plausible, como sentencias judiciales o parrafos de informes anuales.
- Comprension de vocabulario especializado: al estar entrenado sobre jurisprudencia y declaraciones SEC, reconoce terminologia juridica y financiera especifica.
- Generacion de texto con formato de dominio: produce prosa que imita la estructura de opiniones judiciales y de secciones de informes financieros (Management's Discussion and Analysis, notas a los estados financieros, etc.).
- Capacidad multilingue: no disponible, el modelo solo soporta ingles.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportado; es un modelo base sin ajuste por instrucciones.
- Modo thinking o capacidades especiales (vision, audio): no disponible.

## Casos de uso

- Prototipado de pipelines de generacion de texto legal: el modelo puede servir como base para experimentar con tecnicas de continuacion de texto en el dominio legal, por ejemplo, generar borradores de argumentos o completar citas judiciales en entornos de investigacion.
- Aumento de datos sinteticos para entrenamiento de modelos legales: su capacidad para producir prosa legal plausible permite generar datos sinteticos que luego pueden filtrarse o usarse como aumentacion en el entrenamiento de modelos mas grandes.
- Educacion e investigacion en LLMs de dominio: es un caso de estudio util para ensenar como se construye un modelo desde cero, incluyendo tokenizacion, preentrenamiento y evaluacion, con un coste de computo minimo.
- Generacion de texto financiero de ejemplo: puede completar parrafos con estructura de informes SEC, util para demostraciones o para generar texto de relleno en entornos de prueba.
- Evaluacion de tecnicas de decontaminacion y deduplicacion: al estar documentado el pipeline de limpieza, sirve como banco de pruebas para medir el impacto de estas tecnicas en la perplejidad.
- Base para fine-tuning con RAFT o SFT: el proyecto asociado ya demuestra un fine-tuning posterior (legal-slm-125m-sft) con 5.846 pares de preguntas y respuestas ancladas en contexto, por lo que este checkpoint base puede usarse como punto de partida para experimentos de ajuste con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perplejidad de validacion sobre un split reservado del 1 % del corpus (18,7 millones de tokens), que alcanza 8,92 en este checkpoint:

| Paso | Perdida de validacion | Perplejidad |
|---:|---:|---:|
| 1.000 | 2,777 | 16,07 |
| 2.000 | 2,524 | 12,48 |
| 3.000 | 2,421 | 11,26 |
| 4.000 | 2,361 | 10,60 |
| 5.000 | 2,319 | 10,17 |
| 6.000 | 2,286 | 9,83 |
| 7.000 | 2,257 | 9,55 |
| 8.000 | 2,236 | 9,35 |
| 9.000 | 2,214 | 9,15 |
| 10.000 | 2,194 | 8,97 |
| 10.253 (checkpoint) | 2,188 | 8,92 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 125 millones de parametros en bf16, el modelo ocupa aproximadamente 250 MB en memoria; en fp32, unos 500 MB. Cabe en cualquier GPU moderna, incluso en CPU con 4-8 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permite inferencia comoda. El entrenamiento original uso 8x H100, pero la inferencia no requiere hardware especializado.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual (serie RTX 30/40/50, incluso en iGPU con suficiente RAM compartida).
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El proyecto asociado ofrece una demo web en Vercel.
- Latencia y throughput: no disponible, pero por su tamano se espera una generacion de decenas de tokens por segundo en GPU consumer y de unos pocos tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Notas |
|---|---|---|---|---|---|
| slm-125m-legal-financial | 125,8 M | 1.024 | Legal y financiero (EN) | Apache 2.0 | Entrenado desde cero, parcialmente entrenado (58 %) |
| legal-slm-125m-sft | 125 M | 1.024 | Legal y financiero (EN) | Apache 2.0 | Fine-tuning SFT del base con 5.846 pares QA anclados |
| TinyLlama-1.1B | 1.100 M | 2.048 | General (EN) | Apache 2.0 | Modelo general mucho mas grande, no especializado en legal/finanzas |
| Pythia-160M | 160 M | 2.048 | General (EN) | Apache 2.0 | Modelo general de tamano similar, sin especializacion de dominio |

La comparativa directa con modelos generales de tamano similar (Pythia-160M) o mayor (TinyLlama-1.1B) muestra que slm-125m sacrifica capacidad general y longitud de contexto por especializacion en el dominio legal-financiero. No hay modelos comparables publicados de 125M especificos para legal y finanzas entrenados desde cero, por lo que la comparativa con especializados no esta disponible.

## Limitaciones y advertencias

- Entrenamiento parcial: el checkpoint se detuvo al 58 % del plan (paso 10.253 de 17.645), por lo que el modelo no ha completado el ciclo de entrenamiento previsto y puede presentar aristas mas rugosas que un modelo totalmente entrenado.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene conversaciones y no tiene template de chat. Los tokens `<|user|>`, `<|assistant|>` y `<|system|>` estan reservados pero nunca se usaron en entrenamiento.
- Alucinacion severa en datos factuales: genera nombres de casos, estatutos y cifras plausibles pero potencialmente inventados. No debe usarse como fuente de asesoramiento legal o financiero, ni como fuente de hechos.
- Capacidad general limitada: 125 millones de parametros entrenados sobre 1,85 mil millones de tokens es pequeno para los estandares actuales; el conocimiento general y el razonamiento fuera del dominio legal/financiero son limitados.
- Contexto corto: la ventana de 1.024 tokens limita la capacidad de procesar documentos largos o mantener coherencia en generaciones extensas.
- Sesgos: al entrenarse sobre jurisprudencia y declaraciones SEC, puede reflejar sesgos presentes en esos corpus (por ejemplo, sobrerrepresentacion de ciertos tipos de casos o jurisdicciones).
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el aviso legal del autor recomienda no usar sus salidas como asesoramiento profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karuppusamym/slm-125m-legal-financial
- Repositorio GitHub (proyecto completo): https://github.com/mcrao/legal-slm-125M
- Demo web del proyecto: https://slm125m.vercel.app/
- Demo del fine-tuned SFT: https://legal-slm-125.vercel.app/
- Pagina de especificaciones del proyecto: https://slm-125m-phi.vercel.app/index.html

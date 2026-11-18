# Kus-hal/resume-screener-lora

## Resumen

`resume-screener-lora` es un adaptador LoRA desarrollado por Kus-hal sobre el modelo base Qwen2.5-0.5B-Instruct. Su función es leer un currículum y un puesto objetivo y devolver un veredicto estructurado en JSON con una puntuación de estilo ATS (0-100), una etiqueta de veredicto (`strong_match`, `moderate_match` o `weak_match`) y listas de habilidades coincidentes y ausentes. El adaptador es un artefacto de investigación y portafolio, no una herramienta de contratación.

El modelo emplea LoRA con rango 16, alpha 32 y dropout 0.05 aplicado sobre las proyecciones `k_proj`, `o_proj`, `q_proj` y `v_proj`, lo que supone unos 2,16 millones de parámetros entrenables (0,44% de los pesos). El adaptador pesa 8,3 MB y se distribuye bajo licencia MIT, con soporte exclusivo para inglés.

Su relevancia radica en que demuestra cómo un modelo pequeño (0,5B) puede superar ampliamente a alternativas mucho mayores en una tarea estructurada y acotada: alcanza un 88,5% de precisión de veredicto en el conjunto de evaluación sintético, frente al 55,2% de gpt-oss-20b y el 18,8% del modelo base con la rúbrica en el prompt. No obstante, el propio autor advierte que estas cifras miden la concordancia con el generador de datos, no la calidad sobre currículums reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA |
| Parametros totales | 0,5B (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Parametros entrenables | Aproximadamente 2,16 millones (0,44% de los pesos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF `q4_k_m` disponible (379 MB); adaptador en safetensors (8,3 MB) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA); GGUF cuantizado en repositorio separado |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0,05 |
| Módulos objetivo | `k_proj`, `o_proj`, `q_proj`, `v_proj` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. La técnica de ajuste es LoRA con rango 16 y alpha 32 sobre las proyecciones de atención, con dropout de 0,05. El resultado es un adaptador de 8,3 MB que modifica el comportamiento del modelo base sin alterar sus pesos originales.

El entrenamiento se realizó con 800 ejemplos sintéticos y 96 ejemplos sintéticos de validación, generados mediante una plantilla con una rúbrica escrita. Las etiquetas provienen del generador, no de juicios humanos, y el conjunto de datos no está publicado todavía. Las bandas de puntuación en los datos de entrenamiento son: débil hasta 48, moderado de 50 a 74 y fuerte desde 75. No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto estructurado en formato JSON con campos `ats_score`, veredicto, `matched_skills` y `missing_skills`.
- Puntuación de afinidad entre currículum y puesto con una escala de 0 a 100.
- Clasificación en tres niveles de veredicto: `strong_match`, `moderate_match` y `weak_match`.
- Extracción de habilidades coincidentes y ausentes respecto al puesto objetivo.
- Procesamiento de currículums en inglés.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- **Demostración educativa de ajuste fino con LoRA**: el adaptador sirve para ilustrar cómo un modelo de 0,5B puede especializarse en una tarea estructurada con solo 2,16 millones de parámetros entrenables, útil en cursos y tutoriales de PEFT.
- **Reproducción de evaluaciones**: los scripts del repositorio de GitHub permiten replicar las métricas publicadas (precisión de veredicto, error medio de puntuación, F1 de habilidades) y estudiar la metodología de evaluación.
- **Investigación sobre evaluación honesta de modelos pequeños**: el modelo card documenta intervalos de confianza Wilson, pruebas de sensibilidad a nombres y comparación con baselines, lo que lo convierte en un caso de estudio sobre cómo reportar limitaciones.
- **Prototipado offline sin clave de API**: al ejecutarse en CPU (mediana de 11,4 s por currículum en una máquina Windows de 16 hilos), permite experimentar con puntuación de currículums sin depender de servicios en la nube.
- **Generación de datos sintéticos estructurados**: el formato de salida JSON y la rúbrica pueden adaptarse para generar pares currículum-puesto etiquetados en pipelines de investigación.
- **Pruebas de sensibilidad y robustez**: los experimentos con nombres y prefijos neutros documentados en el model card sirven como base para diseñar auditorías de sesgo en sistemas de cribado.

## Benchmarks y rendimiento

Conjunto de validación sintético (96 ejemplos). Intervalos de confianza Wilson al 95%.

| Sistema | Precisión de veredicto | Error medio de puntuación |
|---|---|---|
| Modelo base, zero-shot | 17,7% (17/96; 11-27%) | No disponible |
| Modelo base con rúbrica en el prompt | 18,8% (18/96; 12-28%) | No disponible |
| gpt-oss-20b en Groq con rúbrica | 55,2% (53/96; 45-65%) | 16,4 |
| **Este adaptador** | **88,5% (85/96; 81-93%)** | **5,4** |

Conjunto escrito a mano (36 currículums en formatos que el generador no produce):

| Métrica | Valor |
|---|---|
| Precisión de veredicto | 44,4% (16/36) |
| Errores graves (débil contra fuerte) | 2 |
| Salidas no JSON válido | 1 de 36 |
| Veredictos `weak_match` emitidos | 23 de 36 (la rúbrica tiene 12) |
| Veredictos `strong_match` emitidos | 3 de 36, todos correctos |
| Pares ordenados correctamente por puntuación | 80,4% |

Listas de habilidades (conjunto de validación, contra las listas del generador):

| Métrica | Valor |
|---|---|
| F1 habilidades coincidentes | 1,00 |
| F1 habilidades ausentes | 0,91 (precisión 0,93, recall 0,89) |
| Coincidencia exacta de conjunto | 71,9% |
| Habilidades marcadas como ausentes que sí aparecen en el texto | 4,3% (5,0% para las listas del generador) |

Sensibilidad a nombres (15 currículums, 8 nombres distintos): cambio absoluto medio de puntuación de 0,9 puntos (0,4 con marcador neutro); 3 de 120 veredictos cambiaron, todos en un currículum a 1,5 puntos de un límite. En los 8 currículums más cercanos a un límite, los nombres cambiaron 3 de 64 veredictos y los prefijos neutros 13 de 64.

## Requisitos de hardware

- **VRAM estimada**: el modelo base en precisión completa ocupa aproximadamente 953 MB; el adaptador LoRA añade 8,3 MB. En cuantización GGUF `q4_k_m` el conjunto pesa 379 MB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar el modelo base; no se requieren A100 ni H100.
- **Compatibilidad con GPU consumer**: sí, cabe en RTX 3060, RTX 4060 y superiores, e incluso en iGPU con suficiente memoria compartida.
- **Opciones de despliegue**: transformers con PEFT, llama.cpp u Ollama mediante el GGUF cuantizado. No se documenta soporte para vLLM ni TGI en la información disponible.
- **Latencia y throughput**: en una máquina Windows de 16 hilos y solo CPU, mediana de 11,4 s por currículum (p90 13,7 s, aproximadamente 5,6 tokens por segundo, 2,18 GB residentes, 16 s de carga). La demo alojada tarda una mediana de 3,4 s (p90 5,5 s) por currículum, aunque usa un modelo de 20B, no este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de veredicto (96 ejemplos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **resume-screener-lora** | 0,5B (2,16M entrenables) | No disponible | 88,5% | MIT | Hugging Face, GGUF |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | No disponible | 18,8% con rúbrica | Apache 2.0 | Hugging Face |
| gpt-oss-20b | 20B | No disponible | 55,2% con rúbrica | No disponible | Groq (API) |

La comparación se limita a los sistemas evaluados en el model card. No se dispone de datos de otros adaptadores de cribado de currículums comparables.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son sintéticas y provienen del generador, no de anotadores humanos; los conjuntos de prueba son pequeños (96 y 36 currículums), por lo que todas las métricas tienen incertidumbre amplia.
- Los umbrales de veredicto aprendidos sobre currículums de plantilla no se transfieren bien a currículums con estilo distinto: la precisión cae al 44,4% en el conjunto escrito a mano.
- Los veredictos cerca de los límites (48-50 y 74-75) son inestables; pequeños cambios en el prompt los alteran. Deben tratarse como casos fronterizos.
- La salida no siempre es JSON válido (1 de 36 en el conjunto escrito a mano).
- No hay anotación humana ni auditoría de sesgo más allá de las pruebas con nombres, que son comprobaciones de sensibilidad, no auditorías de equidad.
- Uso fuera de alcance explícito: cualquier decisión real de contratación, rechazo automatizado o clasificación de candidatos reales; procesar currículums de personas reales sin su consentimiento; currículums en idiomas distintos del inglés.
- Riesgo regulatorio: las herramientas automatizadas de cribado están reguladas en algunas jurisdicciones (Nueva York exige auditorías de sesgo a las herramientas automatizadas de decisión laboral; la Ley de IA de la UE clasifica los sistemas de reclutamiento como de alto riesgo). Este adaptador no ha sido auditado y no debe usarse para contratación.
- El prompt debe seguir el formato exacto definido en `inference.py` del repositorio; el adaptador fue entrenado con ese formato y no funciona igual con prompts propios.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Kus-hal/resume-screener-lora
- GGUF cuantizado: https://huggingface.co/Kus-hal/resume-screener-gguf
- Repositorio GitHub (código, scripts de evaluación y resultados): https://github.com/ayush-s-tomar/resume-screener-lora
- Demo en vivo (usa un modelo de 20B alojado, no este adaptador): https://resume-screener-finetune.onrender.com/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct

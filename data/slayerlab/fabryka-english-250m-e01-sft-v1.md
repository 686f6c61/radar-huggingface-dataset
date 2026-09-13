# SlayerLab/fabryka-english-250m-e01-sft-v1

## Resumen

Fabryka English 250M E01 SFT v1 es un ajuste fino por instrucciones, de caracter experimental, sobre el modelo base Fabryka English Base 250M E01 de SlayerLab. Se trata de un modelo de lenguaje de 249.944.832 parámetros (unos 250M) distribuido a través de la librería Transformers con pesos en safetensors y con código personalizado (`custom-code`), lo que implica que no puede cargarse con una configuración estándar sin la implementación del autor.

El modelo parte de un base reconocidamente subentrenado: según la propia model card, el preentrenamiento del base solo cubrió 50M objetivos, muy por debajo de lo habitual para esta escala. El ajuste fino se realizó con SmolTalk (revisión `f73fe857d519ff6ac5af2ea67c4d3834da7b8bcc`), usando `self-oss-instruct` como fuente de código, durante una época, 509 actualizaciones de AdamW y 2.499.600 objetivos de predicción sobre contenido del asistente. Conserva el vocabulario original de 32.768 tokens y una ventana de contexto de 2.048 tokens.

Su relevancia es puramente metodológica y de investigación: el autor publica resultados verificados antes/después, incluidos los casos en los que el ajuste empeoró el rendimiento (cuantitativa y ARC Challenge), y advierte explícitamente de que no constituye una mejora demostrada en código ni un asistente general competitivo. Con 0 descargas y 0 "me gusta" en el momento de la consulta, debe tratarse como un artefacto de experimentación reproducible, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no detalla la variante; se distribuye como modelo de lenguaje autorregresivo con `custom_code` en Transformers) |
| Parámetros totales | 249.944.832 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se distribuyen GGUF, GPTQ ni AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Vocabulario | 32.768 tokens |
| Modelo base | SlayerLab/fabryka-english-base-250m-e01 |
| Dataset de ajuste | HuggingFaceTB/smol-smoltalk (revisión `f73fe857d519ff6ac5af2ea67c4d3834da7b8bcc`) |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna (número de capas, dimensión oculta, tipo de atención ni si emplea atención lineal, decodificación especulativa u otra innovación). Los metadatos indican que se trata de un modelo de lenguaje autoregresivo para generación de texto, con vocabulario propio de 32.768 tokens, contexto de 2.048 tokens y una etiqueta `fabryka_english_base` que sugiere una familia propietaria con implementación en código personalizado. Cualquier afirmación sobre innovaciones arquitectónicas concretas sería especulativa y no se incluye aquí.

El ajuste fino por instrucciones consistió en una época, 509 actualizaciones de AdamW y 8.144 conversaciones de entrenamiento, con 2.499.600 objetivos de predicción limitados al contenido del asistente y al token EOS. La selección de conversaciones equilibra el recuento de ejemplos de código y generales (las proporciones en tokens no tienen por qué ser iguales). Se excluyeron las conversaciones completas de más de 1.024 tokens y se reservó un conjunto de validación independiente de 256 conversaciones. Hiperparámetros: LR máximo 5e-5, 5% de warmup, decaimiento coseno hasta el 10%, AdamW con betas (0,9; 0,95), weight decay 0,01, clipping de gradiente 1,0, semilla 42, microbatch 2 y batch efectivo de 16 conversaciones, con *length bucketing* y autocast BF16 con pesos maestros en FP32. La pérdida de validación bajó de 5,615742 a 3,039462 en código y de 4,860617 a 4,122322 en instrucciones generales, pero el propio autor subraya que son medidas de pérdida, no de precisión en tareas. El preprocesado eliminó 24 conversaciones con solapamiento léxico frente a referencias de CORE, MMLU o BananaMind Base, con deduplicación exacta normalizada; no se garantiza separación semántica ni a nivel de repositorio.

## Capacidades

- Generación de texto en inglés con plantilla de chat nativa, ajustada para respuestas conversacionales de un solo turno y multiturno.
- Seguimiento básico de instrucciones generales (4/120 tareas superadas en la categoría General del BananaMind Instruct Bench 1.1).
- Uso limitado de *system prompts* (1/60 tareas superadas) y capacidad muy reducida de retención de contexto (0/30).
- Generación de código sintácticamente plausible, sin garantía de ejecutabilidad: la evaluación de código comprueba sintaxis y patrones, no ejecuta programas.
- No hay evidencia publicada de *tool calling*, *function calling*, razonamiento multi-paso, agentes, matemáticas fiables, visión ni audio.
- Multilingüismo: únicamente inglés declarado; no se documenta soporte de otros idiomas.
- No se documenta ningún modo especial de razonamiento (*thinking mode*) ni decodificación especulativa.

## Casos de uso

- Investigación sobre metodología de SFT en modelos pequeños: el paquete incluye curvas de pérdida de validación, número de pasos, configuración completa del optimizador y comparación antes/después, lo que permite estudiar el efecto de un ajuste fino ligero sobre un base subentrenado.
- Reproducción de experimentos negativos: sirve como caso de estudio de regresión tras SFT (la precisión en cuantitativa cae de 16/50 a 9/50 y ARC Challenge de 23,21% a 21,59%), útil para documentar qué configuraciones no funcionan.
- Validación de arneses de evaluación: al publicar JSON de verificación con identificadores de muestra, puntuaciones por elección y errores estándar, es útil para contrastar la implementación de `lm-eval` 0.4.13 y runners personalizados.
- Pruebas de integración de `custom_code` en Transformers: permite verificar flujos de carga de pesos safetensors con código no estándar antes de escalar a modelos mayores de la misma familia.
- Experimentos de despliegue en el borde (*edge*): con 250M parámetros y 0,5 GB en BF16, es viable en dispositivos con poca memoria para medir latencia y consumo, aunque su calidad de respuesta sea muy baja.
- Generación de texto de relleno o aumento de datos sintéticos poco exigentes: dado su tamaño y su contexto de 2.048 tokens, puede producir continuaciones controladas para prototipos internos donde la corrección factual no sea crítica.
- Docencia y demostraciones sobre tokenización: su vocabulario propio de 32.768 tokens permite ilustrar diferencias de tokenización frente a vocabularios de modelos multilingües mayores.

## Benchmarks y rendimiento

Comparación antes/después publicada por el autor (base E01 frente a este SFT):

| Benchmark | E01 base | Este SFT |
|---|---:|---:|
| BananaMind Base Bench 1.1, Elo global | 842 | 853 |
| BananaMind Base Bench, correctas | 106/350 | 113/350 |
| Finalización de código, correctas | 5/50 | 6/50 |
| Finalización de código, Elo | 729 | 724 |
| Cuantitativa, correctas | 16/50 | 9/50 |
| ARC Easy acc_norm | 29,42% | 29,34% |
| ARC Challenge acc_norm | 23,21% | 21,59% |
| PIQA acc_norm | 51,47% | 51,85% |
| HellaSwag acc_norm | 24,97% | 24,86% |

Protocolo de los cuatro benchmarks estándar: `lm-eval` 0.4.13, Transformers 5.3.0, PyTorch 2.11.0, FP32 sobre RTX 3090, batch 8, *zero-shot*, contexto 2.048, sin BOS y sin plantilla de chat, con hashes de tarea y revisiones de dataset fijados a la evaluación del base. El BananaMind Base original se ejecutó con su runner oficial (revisión `d4aade51312889e8580963e1ce960c6eaef1a450`), FP32, batch de 2 registros, sin BOS ni chat, con log-probabilidad condicional media; aquella ejecución fue en CPU y esta en CUDA, por lo que puede haber pequeñas diferencias numéricas.

BananaMind Instruct Bench 1.1 (300 tareas completas, evalúa este checkpoint SFT, no el base):

| Categoría | Superadas | Elo de este SFT | Elo declarado por BananaMind Chat |
|---|---:|---:|---:|
| Global | 5/300 | 296 | 888 |
| General | 4/120 | 340 | 720 |
| Multiturno | 0/75 | 318 | 911 |
| System prompts | 1/60 | 516 | 793 |
| Recuperación de contexto | 0/30 | 537 | 1194 |
| Código | 0/15 | 667 | 1337 |

Puntuación ponderada global: 1,14% (5/300 superadas, 1,67%). Protocolo: runner oficial sin modificar (revisión de dataset `40494cb4a9224bfd78722968efd2bff440e08186`), RTX 3090, BF16, plantilla de chat nativa, generación voraz, *repetition penalty* 1,1, semilla 42, KV cache activada, límites de generación por ítem y contexto 2.048. No hubo desbordamientos de contexto; 191 generaciones alcanzaron su límite y 109 terminaron de forma natural. El modelo de comparación BananaMind-2-Pro-Preview-Chat declara 98/300 global y 11/15 en código, pero son cifras autoinformadas por su editor y no se reejecutaron localmente. El autor advierte además que INT y CORE nativo no se han evaluado para este SFT y que los resultados del base no deben atribuirse a estos pesos. No hay resultados publicados de MMLU, GSM8K ni HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB en FP32, 0,5 GB en FP16/BF16, 0,25 GB en INT8 y del orden de 0,15 GB en INT4 (estimaciones teóricas según el recuento de parámetros; no publicadas por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; el autor usó una RTX 3090 tanto para evaluación FP32 como BF16, muy por encima de lo necesario.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: Transformers con el código personalizado del repositorio. No hay confirmación de soporte en vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia estándar, y la licencia no disponible impide asumir su uso en producciones comerciales.
- Latencia y rendimiento: no disponibles. El autor no publica medidas de *throughput* ni de tiempo por token.
- Requisito práctico adicional: el conjunto de evaluación revela un contexto limitado a 2.048 tokens y 191 de 300 generaciones truncadas por límite, lo que sugiere que el ajuste de parámetros de generación es delicado.

## Comparativa con modelos similares

No se dispone de una comparación de rendimiento homogénea, porque las métricas publicadas (BananaMind Base Bench e Instruct Bench) no son directamente equiparables a los benchmarks estándar de otros modelos de la misma escala. La comparación siguiente se limita a parámetros, contexto, licencia y disponibilidad declarados en las fichas públicas de cada modelo:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| Fabryka English 250M E01 SFT v1 | 249.944.832 | 2.048 | no disponible | Transformers con `custom_code` |
| SmolLM2-360M-Instruct | ~362M | 8.192 | Apache-2.0 | Transformers, GGUF, amplio ecosistema |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 | Apache-2.0 | Transformers, GGUF, vLLM, Ollama |
| Pythia-410M | 410M | 2.048 | Apache-2.0 | Transformers |

Comparación de rendimiento frente a estas alternativas: no disponible (no hay benchmarks comunes publicados). La diferencia principal no es de puntuación sino de madurez del ecosistema: las alternativas citadas ofrecen licencias permisivas, cuantizaciones GGUF y soporte en servidores de inferencia, mientras que este modelo exige código personalizado, carece de licencia declarada y declara un 1,67% de tareas superadas en su propio banco de instrucciones.

## Limitaciones y advertencias

- Base sustancialmente subentrenado: el autor indica que el preentrenamiento solo cubrió 50M objetivos, lo que sitúa el modelo muy por debajo de lo esperable para su escala y explica su baja calidad.
- Resultado experimental mixto: mejora en el Elo global de BananaMind Base (842 a 853) pero empeora en cuantitativa (16/50 a 9/50), ARC Challenge (23,21% a 21,59%) y Elo de finalización de código (729 a 724).
- El propio autor declara que no es "una mejora demostrada en código" ni "un asistente general competitivo"; cualquier expectativa de uso como asistente de programación no está respaldada por los datos.
- Rendimiento conversacional muy bajo: 5/300 tareas superadas (1,67%), 0/75 en multiturno y 0/30 en recuperación de contexto.
- Truncamiento de generación: 191 de 300 generaciones alcanzaron el límite configurado, lo que apunta a problemas de finalización y control de longitud.
- Contexto limitado a 2.048 tokens, insuficiente para casos de uso con documentos largos o conversaciones extensas.
- Idioma único (inglés); sin capacidades multilingües documentadas, lo que descarta su uso en castellano con garantías.
- Riesgo de alucinación elevado dado el escaso preentrenamiento y la baja tasa de acierto en tareas de conocimiento y cuantitativas.
- Licencia no disponible: no puede asumirse uso comercial, redistribución ni modificación sin autorización explícita del autor.
- La evaluación de código comprueba sintaxis y patrones, no ejecución; los resultados de código no certifican corrección funcional.
- Trazabilidad limitada del conjunto de evaluación: aunque se realizó un cribado post hoc de solapamiento léxico (un ítem compartido con una conversación de entrenamiento), no se descartan solapamientos semánticos ni de instrucciones cortas. El banco Instruct estaba restringido durante el entrenamiento y la evaluación se obtuvo después.
- Baja adopción: 0 descargas y 0 interacciones, sin comunidad que haya validado los resultados de forma independiente.
- No hay resultados publicados en los benchmarks habituales (MMLU, GSM8K, HumanEval) que permitan contextualizar su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SlayerLab/fabryka-english-250m-e01-sft-v1
- Modelo base: https://huggingface.co/SlayerLab/fabryka-english-base-250m-e01
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Modelo de comparación citado por el autor: https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview-Chat/tree/04011eeb6054fa30145019eebc2af3425856979c
- Verificación de evaluación estándar: `evaluation/standard.json` (en el repositorio del modelo)
- Desglose por categorías de BananaMind: `evaluation/bananamind.json` (en el repositorio del modelo)
- Comparación pareada por categorías: `evaluation/comparison.json` (en el repositorio del modelo)
- Resultados agregados del Instruct Bench: `evaluation/instruct.json` (en el repositorio del modelo)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros sin relación con el proyecto.

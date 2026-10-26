# jaydeepb/pythia-1.4b-wildchat-run1

## Resumen

`jaydeepb/pythia-1.4b-wildchat-run1` es un ajuste fino de `EleutherAI/pythia-1.4b` sobre una muestra de 1 millón de secuencias de 128 tokens del dataset `allenai/WildChat`. No es un modelo pensado para uso como asistente, sino un artefacto de investigación sobre memorización extraíble: el autor lo etiqueta explícitamente con el tag `memorization` y lo numera como "run1" dentro de un experimento de dos pasadas.

El montaje experimental es el siguiente: run1 se entrena sobre una muestra de WildChat y sirve para etiquetar memorización extraíble (decodificación greedy con k=50 y l=50), etiquetas que después se usan para entrenar un clasificador que predice qué prompts serán memorizados. El modelo "run2", ajustado sobre una muestra disjunta del mismo tamaño, proporciona la evaluación held-out limpia. Por tanto, este checkpoint es la mitad de un pipeline de medición, no un modelo final.

Arquitectónicamente hereda todo del base: un transformer decoder-only de tipo GPT-NeoX (`gpt_neox`) con 1.414.647.808 parámetros en fp16 (2,8 GB de repositorio) y licencia Apache 2.0. Su relevancia es metodológica: ofrece un punto de control reproducible (seed 42, learning rate 5e-5, schedule coseno, 1 época) para estudiar hasta qué punto un ajuste fino corto sobre conversaciones reales provoca regurgitación literal de datos de usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX (`gpt_neox`), denso |
| Parametros totales | 1.414.647.808 (1,41 B), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | 2048 tokens en el modelo base Pythia-1.4B; el ajuste fino se realizo con secuencias de 128 tokens |
| Tipos de cuantizacion | no se publican pesos cuantizados; el repo solo contiene safetensors en fp16, convertibles a GGUF/GPTQ/AWQ con herramientas estandar (no verificado por el autor) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; WildChat es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Dataset de ajuste | allenai/WildChat, muestra de 1M secuencias de 128 tokens |
| Hiperparametros | 1 epoca, lr 5e-5, schedule coseno, seed 42 |
| Tamano del repositorio | 2,8 GB |
| Fecha de publicacion | 26 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Pythia-1.4B pertenece a la Pythia Scaling Suite de EleutherAI, disenada para investigación en interpretabilidad: ocho tamanos (70M a 12B) entrenados sobre el mismo corpus (The Pile, 300B tokens) con el mismo orden de datos y checkpoints intermedios cada 1000 pasos. La arquitectura es GPT-NeoX con 24 capas, 2048 de dimension oculta y 16 cabezas de atencion, embeddings rotatorios y atencion/MLP en paralelo, segun la documentacion del modelo base. No se ha aplicado RLHF ni DPO en ninguna fase: es un modelo de lenguaje base, no un asistente alineado.

El ajuste fino de este checkpoint es una pasada completa (los 2,8 GB de safetensors corresponden a pesos completos en fp16, no a un adaptador) sobre aproximadamente 128 millones de tokens procedentes de WildChat, un corpus de conversaciones reales mantenidas por usuarios con interfaces de ChatGPT. La secuencia de entrenamiento se trunca a 128 tokens, muy por debajo de la ventana nativa de 2048 del base, lo que sesga el ajuste hacia turnos cortos. La innovacion no esta en la arquitectura sino en el protocolo: la separacion run1/run2 sobre muestras disjuntas y el etiquetado de memorizacion extraible con decodificacion greedy (k=50, l=50) permiten entrenar un predictor de memorizacion y evaluarlo sin contaminacion entre train y test.

## Capacidades

- Generacion de texto autoregresiva estandar, heredada de Pythia-1.4B.
- Reproduccion de conversaciones con el estilo de WildChat: turnos de usuario y respuestas con formato de asistente, util para estudiar imitacion de estilo.
- Memorizacion extraible: capacidad central del checkpoint, medida con decodificacion greedy (k=50, l=50) sobre prompts del propio corpus de ajuste.
- Generacion condicionada a prompts cortos (hasta 128 tokens de contexto de entrenamiento).
- Capacidad multilingue residual: WildChat contiene conversaciones en varios idiomas, pero la model card no especifica cobertura ni calidad por idioma (no disponible).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.
- No se ha evaluado su utilidad como asistente conversacional general.

## Casos de uso

- Estudio de memorizacion extraible: dado un prompt de WildChat, generar con decodificacion greedy (k=50, l=50) y comprobar si el modelo reproduce literalmente la continuacion original; es el proposito declarado del checkpoint.
- Etiquetado para clasificadores de memorizacion: generar las etiquetas de run1 que alimentan el entrenamiento del predictor, y usar run2 para la validacion held-out sin fuga de datos.
- Auditoria de privacidad en corpus conversacionales: WildChat contiene interacciones reales de usuarios; este modelo permite cuantificar que proporcion de ese contenido es regurgitable y, por tanto, que riesgo existiria al publicar ajustes sobre datos similares.
- Baseline controlado de ajuste fino: con seed 42, una epoca y learning rate 5e-5 documentados, sirve como referencia reproducible frente a variantes (mas epocas, otras muestras, otros tamanos de Pythia) en estudios de scaling de memorizacion.
- Analisis de deriva respecto al base: comparar la perplexidad y las distribuciones de salida de este checkpoint con `EleutherAI/pythia-1.4b` para medir cuanto cambia un modelo tras 128M tokens de ajuste conversacional.
- Investigacion en interpretabilidad: al ser un Pythia, los analisis de activaciones, attention heads y circuitos son transferibles a los demas tamanos de la suite, y aqui se anade la variable del ajuste fino.
- Docencia y reproduccion experimental: caso de laboratorio para explicar fuga de datos train/test y diseno de experimentos con muestras disjuntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplexity ni metricas de memorizacion cuantificadas (tasa de extraccion, BLEU contra la referencia, etc.). Cualquier cifra de rendimiento para este checkpoint seria especulativa.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: unos 2,8 GB solo de pesos; con cache KV para 2048 tokens conviene reservar 4-5 GB.
- VRAM en int8: aproximadamente 1,5 GB; en int4 (GGUF Q4_K_M): en torno a 0,9-1 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, e incluso en GPUs de 4-6 GB con cuantizacion int4. Tambien en Apple Silicon (M1/M2/M3) y en CPU con llama.cpp.
- GPU de datacenter: A100, H100 o L4 son sobredimensionadas para inferencia, pero utiles para generar etiquetas de memorizacion a gran escala en paralelo, que es el uso previsto.
- Opciones de despliegue: `transformers` (via directa, es el formato publicado), TGI (el repo lleva los tags `text-generation-inference` y `endpoints_compatible`), vLLM y SGLang para serving con batching, llama.cpp/Ollama tras convertir los pesos a GGUF (conversion no publicada por el autor).
- Latencia y throughput: no disponible; no hay mediciones publicadas. Como referencia estructural, un modelo denso de 1,4B es sensiblemente mas rapido que alternativas de 7B, pero no se aportan tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos publicados |
|---|---|---|---|---|---|
| jaydeepb/pythia-1.4b-wildchat-run1 | 1,41 B | 2048 (base); ajuste a 128 | Apache 2.0 | Investigacion de memorizacion sobre WildChat | Sin benchmarks |
| jaydeepb/pythia-1.4b-wildchat-run2 | 1,41 B (mismo pipeline) | 2048 (base); ajuste a 128 | Apache 2.0 | Igual, muestra disjunta para evaluacion held-out | Sin benchmarks (no detallado) |
| EleutherAI/pythia-1.4b | 1,41 B | 2048 | Apache 2.0 | Modelo base de interpretabilidad, The Pile (300B tokens) | Benchmarks en el paper de Pythia |
| Qwen2.5-1.5B | ~1,54 B | 32 768 | Apache 2.0 | Modelo generalista, con variantes instruct | Benchmarks publicados por Qwen |

La comparacion relevante no es de rendimiento: frente a un modelo generalista como Qwen2.5-1.5B, este checkpoint pierde en contexto (2048 frente a 32 768), en cobertura idiomatica declarada y en alineacion. Su unico valor diferencial es ser un objeto de estudio controlado sobre memorizacion, con hiperparametros y particion de datos documentados.

## Limitaciones y advertencias

- No es un asistente: no ha recibido RLHF ni DPO, por lo que puede producir respuestas incoherentes, repetitivas o con formato incorrecto fuera de los patrones de WildChat.
- Riesgo alto de regurgitacion: su comportamiento buscado es reproducir contenido memorizado de conversaciones reales, lo que puede exponer informacion personal (PII) presente en WildChat. No debe desplegarse de cara al publico.
- Sesgos heredados del base (The Pile, corpus web con sesgos de genero, raza, religion e idioma) y anadidos por WildChat, que sobrerrepresenta ciertos idiomas y estilos de usuario.
- Ventana efectiva corta: aunque el base soporta 2048 tokens, el ajuste se hizo con secuencias de 128, por lo que la calidad mas alla de ese umbral no esta garantizada y probablemente degrada.
- Idiomas: no se declara lista de idiomas soportados; no hay evaluacion multilingue de este checkpoint.
- Licencia Apache 2.0 permite uso comercial del modelo, pero las condiciones de uso del dataset WildChat (conversaciones de terceros) son una obligacion separada que recae en quien reutilice los datos o el modelo; conviene revisar los terminos de `allenai/WildChat` antes de cualquier explotacion.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones independientes.
- Sin benchmarks publicados, no es defendible como base de produccion ni como referencia de calidad.
- No confundir run1 con run2: usar run1 para evaluar held-out invalida el diseno experimental del autor.
- Riesgo de alucinacion elevado y sin mitigaciones documentadas (sin filtros, sin system prompt entrenado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaydeepb/pythia-1.4b-wildchat-run1
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- README del modelo base: https://huggingface.co/EleutherAI/pythia-1.4b/blob/main/README.md
- Dataset WildChat: https://huggingface.co/datasets/allenai/WildChat
- Repositorio del proyecto Pythia: https://github.com/EleutherAI/pythia
- Paper de Pythia (Pythia: A Suite for Analyzing Large Language Models Across Training and Scaling): https://arxiv.org/abs/2304.01373
- Web de EleutherAI: https://www.eleuther.ai/

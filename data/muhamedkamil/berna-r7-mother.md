# muhamedkamil/berna-r7-mother

## Resumen

Berna R7 - Mother es un modelo de lenguaje de 1.056.265.728 parametros (1,06B) desarrollado por Muhammed Kamil Muhammed bajo el sello Berna Labs. Se presenta como la primera implementacion a gran escala de la arquitectura DNA-Kernel Plexus, descrita previamente en el trabajo Berna R5, y su proposito declarado es servir de plataforma de investigacion para aprendizaje continuo y redes neuronales en crecimiento. Es un transformer decoder-only con 28 capas, hidden size de 1536, atencion con GQA (16 cabezas de consulta y 4 de clave/valor) y una ventana de contexto de 4096 tokens.

El interes del proyecto no reside en su rendimiento bruto, sino en su estructura modular interna: incorpora 112 "celdas de conocimiento", un vector de conocimiento 6D, un DNA Kernel de 100 cromosomas con 4 genes cada uno y un Plexus que modela un grafo dinamico de co-activaciones. La model card es inusualmente explicita sobre las limitaciones: el modelo esta infraentrenado (1 epoch sobre 2,66B tokens, aproximadamente 2,5 tokens por parametro), no ha sido ajustado por instrucciones y no dispone de benchmarks publicados.

En el momento de redactar esta ficha, el repositorio esta marcado como "training in progress" y los pesos no se han subido: el autor indica que se publicaran alrededor del 5 de octubre de 2026. Por tanto, cualquier evaluacion practica del modelo es prematura y la ficha debe leerse como una descripcion de la implementacion anunciada, no de un artefacto ya disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Berna), con estructura DNA-Kernel Plexus |
| Parametros totales | 1.056.265.728 (1,06B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponibles (entrenado en BF16; el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | Ingles (tag de idioma `en`); datos de entrenamiento en ingles, matematicas y codigo. La model card se describe como "multilingual" pero esa etiqueta no se corresponde con los datos declarados |
| Licencia | Berna Research License v1.0 (uso de investigacion gratuito; uso comercial requiere licencia separada) |
| Formato de pesos | No disponible (pesos aun no publicados; libreria declarada `transformers`, se espera safetensors) |
| Capas | 28 |
| Hidden size | 1536 |
| Intermediate size | 6144 |
| Cabezas de atencion | 16 (GQA, 4 cabezas KV) |
| Vocabulario | 32.000 tokens (BPE) |
| RoPE theta | 500.000 |
| Normalizacion | RMSNorm |
| Activacion | SwiGLU |
| Precision | BF16 |
| Embeddings atados | Si |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional en sus bloques externos (RMSNorm, SwiGLU, RoPE con theta 500.000, GQA y embeddings atados), pero anade una capa de organizacion modular tomada del framework DNA-Kernel Plexus de R5. La estructura declarada tiene seis niveles: Sensors -> Spinal Cord -> Plexus -> Knowledge Cells -> DNA Kernel -> Registry. El modelo contiene 112 celdas de conocimiento (4 por capa MLP en 28 capas), un vector de conocimiento 6D definido como K = [L, W, H, D, T, E] con saturacion S = ||K||_omega, un DNA Kernel de 100 cromosomas x 4 genes (a, s, p, pi) y un Plexus que actualiza sus aristas a partir de co-activaciones. El Registry es un catalogo SQL con UUIDs y tokens de conexion. Segun la tabla de cumplimiento con R5, el router (Spinal Cord) queda diferido y el mecanismo de Bounded Forgetting (H2) no ha sido probado.

El entrenamiento se realizo sobre 2,66B tokens mezclando ingles, matematicas y codigo, con 1 sola epoch, lo que supone aproximadamente 2,5 tokens por parametro, una cifra muy por debajo de lo habitual en modelos de este tamano. Se uso AdamW8bit, learning rate de 3e-4 con schedule coseno y 500 pasos de warmup, batch efectivo de 64 secuencias x 4096 tokens (262.144 tokens por paso) y gradient checkpointing activado. Todo el entrenamiento se ejecuto en una unica RTX 5090 de 32 GB durante aproximadamente 6,5 dias. No se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Generacion de texto autorregresiva en ingles, sin ajuste por instrucciones (modelo base).
- Manejo basico de matematicas y codigo, por la composicion declarada del dataset de entrenamiento.
- Soporte de contexto de 4096 tokens, suficiente para documentos cortos y conversaciones de varios turnos.
- Inferencia compatible con la libreria `transformers` (`text-generation`) y con endpoints compatibles segun los tags del repositorio.
- Tool calling / function calling: no disponible, no declarado.
- Capacidades de agente y razonamiento multi-paso: no disponibles, no declaradas.
- Vision, audio y modalidades adicionales: no soportadas de forma explicita (modelo solo texto).
- Capacidades multilingues: no acreditadas; los datos declarados son ingles, matematicas y codigo.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigacion en aprendizaje continuo: el proposito principal declarado por el autor; las celdas de conocimiento, el DNA Kernel y el Plexus estan disenados para experimentar con actualizaciones incrementales del conocimiento sin reentrenar todo el modelo.
- Referencia de implementacion del framework R5: util para reproducir y auditar la estructura DNA-Kernel Plexus en un modelo de escala manejable (1,06B), incluidos el Registry con UUIDs y los tokens de conexion.
- Fine-tuning sobre dominios especificos: al ser un modelo base sin ajuste por instrucciones, es un punto de partida razonable para SFT/DPO en tareas acotadas de ingles, siempre con un dataset mucho mayor que los 2,66B tokens originales.
- Generacion de codigo experimental en pipelines internos: el dataset incluye codigo, por lo que puede usarse como borrador o autocompletado en entornos de desarrollo no criticos y con supervision humana.
- Experimentos de ventana de contexto: con 4096 tokens y RoPE theta 500.000, permite probar estrategias de extension de contexto (NTK, YaRN, etc.) sobre una arquitectura pequena.
- Docencia y prototipado: al caber en una GPU de consumo, sirve para ensenar tecnicas de entrenamiento (gradient checkpointing, AdamW8bit) y para reproducir experimentos con presupuesto bajo.
- Estudios de olvido catastrofico: la hipotesis H2 (Bounded Forgetting) esta pendiente de prueba y el modelo es un candidato para experimentar con ella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que MMLU, GSM8K y HumanEval estan pendientes, y que el modelo no reclama estado del arte en ningun benchmark.

## Requisitos de hardware

- VRAM estimada para pesos en BF16/FP16: aproximadamente 2,1 GB (1,056B parametros x 2 bytes).
- VRAM estimada de la cache KV en BF16: con head dim de 96 (1536/16), 4 cabezas KV y 28 capas, unos 42 KiB por token; alrededor de 168 MiB para los 4096 tokens de contexto completo (calculo derivado de las specs, no publicado por el autor).
- VRAM total practica: por debajo de 4-5 GB en precision nativa, y bastante menos si se aplica cuantizacion a 8 o 4 bits.
- GPU de entrenamiento declarada: 1x RTX 5090 (32 GB), ~6,5 dias para 2,66B tokens.
- GPU recomendadas para inferencia: cualquier GPU de consumo moderna con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090). En el ambito profesional, A100, H100 y L40S son sobradamente suficientes para el tamano del modelo.
- Cabe en GPU de consumo: si, con holgura, incluso en tarjetas de 8 GB.
- Opciones de despliegue: la libreria declarada es `transformers`, por lo que el despliegue natural es Hugging Face Transformers con `pipeline("text-generation")`. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama; serian tecnicamente viables una vez publicados los pesos, pero no estan confirmadas por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se ofrece con la advertencia de que Berna R7 Mother no tiene benchmarks publicados, por lo que las columnas de rendimiento no son comparables de forma empirica. Los datos de los modelos alternativos no proceden de la informacion proporcionada sobre Berna R7.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Berna R7 - Mother | 1,06B | 4096 | Berna Research License v1.0 (comercial restringido) | Pesos aun no publicados (previstos ~5 oct 2026) |
| berna-prototype-162m (mismo autor) | 162M | No disponible en la informacion proporcionada | Licencia "other" | Pesos disponibles en Hugging Face; idiomas en/ar |
| Llama 3.2 1B (Meta) | 1,24B | 128.000 | Llama 3.2 Community License | Pesos disponibles |
| Qwen2.5 1.5B (Alibaba) | 1,54B | 32.000 | Apache 2.0 | Pesos disponibles |
| TinyLlama 1.1B (grupo comunitario) | 1,1B | 2048 | Apache 2.0 | Pesos disponibles |

Diferencias clave: Berna R7 Mother es el unico de la lista con una licencia que restringe el uso comercial y el unico cuyo objetivo declarado no es el rendimiento sino la experimentacion con una arquitectura modular de aprendizaje continuo. Frente a las alternativas, presenta una ventana de contexto notablemente mas corta y un presupuesto de entrenamiento mucho menor (2,66B tokens frente a los ordenes de billones de tokens de los modelos de Meta y Alibaba).

## Limitaciones y advertencias

- Modelo infraentrenado: 1 epoch sobre 2,66B tokens, aproximadamente 2,5 tokens por parametro, muy lejos de la relacion habitual en modelos de su tamano.
- No ajustado por instrucciones: no responde de forma fiable a prompts conversacionales ni sigue instrucciones complejas sin un fine-tuning previo.
- Sin benchmarks: no hay datos de MMLU, GSM8K, HumanEval ni de ninguna otra evaluacion; cualquier afirmacion de rendimiento seria especulativa.
- Solo texto: no soporta vision ni audio.
- Cobertura idiomatica limitada: los datos de entrenamiento son ingles, matematicas y codigo, pese a la etiqueta "multilingual" de la model card. No hay evidencia de capacidades multilingues reales.
- Pesos no disponibles: el repositorio esta en estado "training in progress" y los pesos se prometen para alrededor del 5 de octubre de 2026, por lo que el modelo no puede evaluarse hoy.
- Riesgo de alucinacion: no cuantificado por el autor, pero esperablemente alto dado el bajo presupuesto de entrenamiento y la ausencia de calibracion por preferencias.
- Sesgos: no documentados; no hay analisis de sesgo ni de toxicidad.
- Licencia restrictiva: Berna Research License v1.0 permite uso de investigacion gratuito, pero exige licencia separada para uso comercial (contacto: info@bernalabs.com).
- Componentes incompletos: el router (Spinal Cord) esta diferido y el mecanismo de Bounded Forgetting (H2) no ha sido probado.
- Sin garantias de escalabilidad: el propio autor indica que el modelo no reclama escalabilidad por encima de 1,5B parametros ni completitud teorica.
- Uso prohibido: despliegue en produccion sin evaluacion y aplicaciones de seguridad critica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muhamedkamil/berna-r7-mother
- Repositorio GitHub del proyecto: https://github.com/Berna-Labs/berna-r7
- Licencia Berna Research v1.0: https://github.com/Berna-Labs/berna-r7/blob/main/LICENSE
- Paper DNA-Kernel Plexus (Berna R5, Zenodo): https://zenodo.org/records/23015308
- Modelo previo del mismo autor (berna-prototype-162m): https://huggingface.co/muhamedkamil/berna-prototype-162m
- Listado de modelos etiquetados "berna" en Hugging Face: https://huggingface.co/models?other=berna

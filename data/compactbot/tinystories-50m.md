# Compactbot/tinystories-50m

## Resumen

tinystories-50m es un modelo de lenguaje decoder-only de 54.804.992 parámetros entrenado desde cero por el usuario Compactbot sobre el corpus TinyStories, una colección de cuentos infantiles breves, simples y altamente repetitivos. No es un derivado de un modelo preentrenado existente: el tokenizador BPE de 8.192 entradas, la arquitectura y los pesos se construyeron de forma independiente, y el resultado se publica en safetensors junto a un cargador autocontenido (`load_model.py`).

El modelo es la escala superior de una línea que arranca en `tinystories-24m`. Mientras el hermano de 24M se entrenó con 18,2 tokens por parámetro, esta versión lo hace con 8,17 tokens por parámetro (≈447,86M tokens tras retokenizar con BPE-8192), es decir, un presupuesto de cómputo por parámetro deliberadamente menor para poder completar una época en una única GPU de consumo. El resultado es un modelo que escribe cuentos fluidos y coherentes dentro de su dominio y que degrada rápido fuera de él.

Su relevancia es fundamentalmente metodológica y didáctica: es un ejemplo completo y reproducible de pipeline de LLM a pequeña escala (tokenizador, transformer pre-norm con RMSNorm, embeddings atados, entrenamiento con AdamW en una sola RTX 5090 con un pico de ~15 GB) con métricas honestas publicadas, como una perplejidad de 5,24 en el split de validación de TinyStories. El autor declara explícitamente que los benchmarks generales no son significativos para este modelo y no los reporta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (estilo GPT), pre-norm con RMSNorm |
| Parametros totales | 54.804.992 (verificado contra la cabecera de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (max seq len) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en float32. No hay GGUF ni cuantizaciones oficiales |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float32, 99 tensores, 210 MB); tokenizer.json en formato `tokenizers`; config.json |

Detalles arquitectonicos adicionales:

| Parametro | Valor |
|---|---|
| Capas (L) | 16 |
| d_model (D) | 512 |
| Cabezas de atencion (H) | 8 (dimension por cabeza 64) |
| Dimension FFN | 2048 (4x D) |
| Vocabulario | 8192 (BPE) |
| Embeddings | atados por peso (lm_head = token embedding) |
| Normalizacion | RMSNorm (2 por bloque + final) |
| Activacion | GELU |
| Atencion | causal, sin bias en las capas lineales |
| Dtype de entrenamiento/publicacion | float32 |

Desglose de parametros (suma exacta 54.804.992): token embedding 8192 x 512 = 4.194.304; position embedding 512 x 512 = 262.144; 16 bloques x 3.146.752 = 50.348.032 (2 RMSNorm de 512 + qkv 512x1536 + proj 512x512 + fc1 512x2048 + fc2 2048x512); RMSNorm final 512.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal convencional: 16 bloques con atencion multi-cabeza de 8 cabezas (dimension 64), FFN de 2.048 unidades y activacion GELU, normalizacion RMSNorm en configuracion pre-norm (dos por bloque mas una final) y proyecciones lineales sin termino de bias. Los embeddings de token estan atados al `lm_head`, lo que ahorra 4.194.304 parametros y es un factor relevante en un modelo de este tamano. La ventana de contexto es de 512 tokens, coherente con la longitud de los cuentos del corpus.

El entrenamiento se realizo desde cero sobre TinyStories (dataset `ronendagan/TinyStories`), con aproximadamente 447,86M tokens tras retokenizar a BPE-8192, lo que supone 8,17 tokens por parametro. Se uso AdamW con decaimiento coseno del learning rate y warmup, con un pico de 6e-4. El batch efectivo fue de 64 secuencias de 512 tokens, es decir, 32.768 tokens por paso, durante 13.668 pasos (una época completa); el mejor checkpoint se selecciono en el paso 13.250. Todo el entrenamiento cupo en una unica NVIDIA RTX 5090 de 32 GB con un consumo pico de ~15 GB. La perdida de validacion final fue de 1,6371 (1,6566 en el mejor checkpoint).

No se menciona en la informacion disponible ninguna fase de RLHF, DPO, SFT ni ajuste por instrucciones; el modelo es un generador de texto base, no un asistente conversacional. Tampoco se documentan innovaciones como decodificacion especulativa, atencion lineal o atencion por ventanas: se trata de atencion causal densa estandar.

## Capacidades

- Generacion de texto narrativo en ingles dentro del dominio de cuentos infantiles: personajes consistentes, puntuacion correcta y frases simples y repetitivas.
- Coherencia verificada en 9 de 9 generaciones sembradas (3 prompts de inicio de cuento x 3 semillas) segun la model card.
- Ajuste al registro TinyStories: vocabulario sencillo y estructuras sintacticas propias de literatura infantil.
- Decodificacion configurable con temperatura y top-k desde el cargador propio (`model.generate(..., temp=0.8, top_k=40)`).
- Capacidad de servir como punto de partida para fine-tuning en dominios narrativos estrechos.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente.
- No dispone de capacidades multilingues: solo ingles.
- No es un modelo instruido ni conversacional; no hay formato de chat ni plantilla de mensajes documentada.

## Casos de uso

- Estudio de leyes de escalado en regimen pequeno: el modelo permite comparar directamente la relacion entre tokens por parametro y calidad, ya que el autor publica el dato de 8,17 tok/param para esta version frente a 18,2 tok/param del hermano de 24M sobre el mismo dominio.
- Material docente para pipelines de LLM completos: sirve para ilustrar paso a paso el entrenamiento del tokenizador BPE, la definicion del transformer, el bucle de entrenamiento con AdamW y la evaluacion por perplejidad, sin necesidad de infraestructura de datacenter.
- Generacion de cuentos infantiles en prototipos y demos offline: al ocupar 210 MB en float32 y funcionar en CPU, se puede integrar en aplicaciones de escritorio, kioscos o demos educativas sin conexion.
- Aumento de datos sinteticos: se pueden generar grandes volumenes de cuentos on-domain para preentrenar o calibrar modelos mayores que operen en el mismo registro linguistico, filtrando despues por perplejidad.
- Fine-tuning para narrativa vertical concreta: partiendo del checkpoint publicado, es viable adaptar el modelo a un subgenero muy acotado (fabulas, cuentos con estructura fija, microficciones) con presupuestos de computo minimos.
- Investigacion sobre tokenizacion: el tokenizador BPE-8192 entrenado especificamente sobre TinyStories permite estudiar el impacto del tamano de vocabulario en modelos por debajo de 100M de parametros.
- Alumno en experimentos de destilacion: su tamano y su baja perplejidad en dominio lo hacen util como estudiante para destilar capacidades narrativas desde modelos mayores, o como profesor de un modelo aun mas pequeno.
- Pruebas de infraestructura de inferencia: sirve como carga ligera para validar harness de generacion, gestion de KV cache con contexto de 512 o pipelines de evaluacion, antes de escalar a modelos grandes.

## Benchmarks y rendimiento

Los unicos numeros de evaluacion publicados por el autor son de dominio especifico:

| Metrica | Valor | Nota |
|---|---|---|
| Perplejidad (split de validacion de TinyStories) | 5,24 | Mejor checkpoint; entropia cruzada de validacion 1,6566 -> exp = 5,2412 |
| Perdida de validacion final (ultimo paso) | 1,6371 | Paso 13.668 |
| Perdida de validacion del mejor checkpoint | 1,6566 | Paso 13.250 |
| Coherencia en generaciones sembradas | 9/9 | 3 prompts x 3 semillas, evaluacion cualitativa del autor |

El autor indica explicitamente que benchmarks generales como BLiMP, ARC o PIQA no son significativos para un modelo de este tipo y se omiten deliberadamente. No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM para inferencia en float32: aproximadamente 0,22 GB para los pesos (210 MB de safetensors) mas el KV cache y activaciones, que con contexto de 512 y batch pequeno son despreciables.
- VRAM en otras precisiones (estimacion aritmetica sobre 54,8M parametros, no publicada por el autor): ~110 MB en fp16/bf16, ~55 MB en int8. No existe conversion oficial a estas precisiones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. El modelo cabe en GTX 1050, GTX 1650, MX150/250, iGPU modernas y tambien en CPU.
- Entrenamiento: el autor lo completo en una unica NVIDIA RTX 5090 de 32 GB con un pico de ~15 GB. Cualquier GPU de 16 GB o mas deberia bastar con el mismo batch, y con gradient accumulation podria bajarse a 8-12 GB.
- Despliegue: la via documentada es `transformers` junto con el cargador `load_model.py` incluido en el repositorio, que define la clase `TinyStoriesGPT`. No hay GGUF, por lo que llama.cpp y Ollama no lo soportan directamente; vLLM y TGI no incluyen esta arquitectura custom entre las soportadas de serie, y no se documenta integracion con ellos.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset | Licencia | Notas |
|---|---|---|---|---|---|
| Compactbot/tinystories-50m | 54.804.992 | 512 | ronendagan/TinyStories | apache-2.0 | Entrenado desde cero; perplejidad de validacion 5,24; solo ingles |
| StoryGPT (ZiadXI) | ~50M (decoder-only) | no disponible | TinyStories | no disponible | Entrenado desde cero; se presenta como pipeline completo, de tokenizador BPE a generacion |
| hayder86al/tinystories-50m-instruct | ~50M (no confirmado) | no disponible | TinyStories | no disponible | Variante con ajuste por instrucciones; datos de entrenamiento y metricas no disponibles |
| Fathi7ma/tiny-stories-gpt2 | GPT-2 small fine-tuned (no se especifica cifra exacta) | no disponible | TinyStories | no disponible | No parte de cero: es un fine-tuning de GPT-2 small, por lo que su coste de entrenamiento y su comportamiento fuera de dominio difieren |

Los tres modelos comparables pertenecen al mismo ecosistema TinyStories y persiguen el mismo objetivo de generacion de cuentos simples. La diferencia principal de esta ficha es la publicacion explicita de la perplejidad de validacion, el desglose exacto de parametros y el numero de tokens de entrenamiento, datos que no estan disponibles en las alternativas encontradas.

## Limitaciones y advertencias

- Modelo de dominio estrecho: fuera de TinyStories la generacion degrada de forma marcada. El propio autor advierte que no debe usarse para codigo, matematicas o texto abierto.
- La perplejidad de 5,24 es especifica de dominio y no es comparable con la de modelos de proposito general.
- Solo ingles: no hay soporte multilingue y no se ha evaluado su comportamiento en otros idiomas.
- Contexto limitado a 512 tokens, insuficiente para conversaciones largas, documentos o razonamiento multi-paso.
- No esta alineado con instrucciones ni con preferencias humanas: no hay RLHF, DPO ni SFT documentados. No debe desplegarse como asistente conversacional.
- Riesgo de alucinacion y de incoherencia: el autor reconoce artefactos menores a esta escala, como comillas mal formadas y algunos fallos logicos.
- Sesgos: al entrenarse sobre cuentos infantiles, puede reproducir estereotipos de genero, roles familiares y estructuras narrativas simplistas presentes en el corpus. No se ha realizado ninguna evaluacion de sesgo documentada.
- Riesgo de sobreajuste al estilo del dataset: las salidas tienden a la repeticion y a formulas narrativas prefijadas.
- Uso comercial: la licencia apache-2.0 lo permite, pero no se ofrece ninguna garantia de calidad, exactitud ni idoneidad para produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado en septiembre de 2026: no hay evidencia de uso en produccion ni de validacion por terceros.
- No existe version GGUF ni cuantizada, y la arquitectura custom puede requerir adaptaciones para integrarse en servidores de inferencia estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/tinystories-50m
- Dataset de entrenamiento: https://huggingface.co/datasets/ronendagan/TinyStories
- StoryGPT, transformer de ~50M preentrenado desde cero sobre TinyStories: https://github.com/ZiadXI/StoryGPT
- hayder86al/tinystories-50m-instruct (variante con ajuste por instrucciones): https://huggingface.co/hayder86al/tinystories-50m-instruct
- Fathi7ma/tiny-stories-gpt2 (GPT-2 small ajustado sobre TinyStories): https://huggingface.co/Fathi7ma/tiny-stories-gpt2
- Listado de modelos gratuitos de referencia (sin relacion directa con este modelo): https://github.com/ClawLabsAI/free-ai-models
- tinystories.ai es un servicio comercial de cuentos personalizados sin relacion con este modelo.

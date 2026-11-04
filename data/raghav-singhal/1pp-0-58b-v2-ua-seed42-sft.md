# Raghav-Singhal/1pp-0.58b-v2-ua-seed42-sft

## Resumen

1pp-0.58b-v2-ua-seed42-sft es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la composición del corpus de preentrenamiento (conversaciones reescritas frente a documentos) y la máscara de pérdida afectan al comportamiento del modelo. Este checkpoint concreto corresponde a la condición "user+assistant loss", semilla 42, del escalón de 0,58B dentro de la "ladder v2", una matriz experimental de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones y tres semillas.

La arquitectura es un decoder estilo Llama de 24 capas, dimensión oculta 1.152, FFN de 4.608 con SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`. Tras el preentrenamiento se aplicó un ciclo de SFT sobre 400.000 conversaciones.

Su relevancia es metodológica: cada escalón se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos, de modo que las diferencias entre modelos reflejan únicamente la condición experimental o la inicialización. El modelo se publica con licencia Apache 2.0 y pesos en safetensors, lo que permite reproducir y auditar los resultados del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, RMSNorm, RoPE base 10.000, sin sesgos, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza de 9 cabezas de consulta y 3 de clave/valor (GQA con head dim 128), FFN SwiGLU de 4.608 unidades, RMSNorm y embeddings de entrada y salida no atados. El tokenizador usa el vocabulario de SmolLM2 (49.152 entradas) más `<|pad|>`, con `<|endoftext|>` como token de fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos.

El preentrenamiento cubre los primeros 11.106 pasos del flujo alineado por pasos del estudio principal (23,29B posiciones de token), con batch global de 512 secuencias de 4.096 tokens. El optimizador es Muon (escalado por forma, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 699 pasos, decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0119 y precisión bf16. La pérdida se calcula sobre los turnos de usuario y asistente de conversaciones reescritas a partir de documentos. La pérdida de validación final (por token, 2.433 documentos reservados) es de 1,664 sobre texto de asistente, 1,543 sobre texto de usuario y 3,452 sobre texto de documento.

El SFT se realizó durante una época sobre una mezcla de 400.000 conversaciones: 98.500 multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271.600 de `dlab-spp/sp-sft-normal-300k` (excluyendo prompts duplicados con el primer conjunto) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se empleó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La pérdida de SFT en validación (1.998 conversaciones reservadas) es de 2,074, verificada contra el checkpoint de Megatron con una diferencia absoluta de 0,0000.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Conversación multiturno: el SFT se entrenó sobre mezclas con conversaciones multiturno y seguimiento de instrucciones.
- Razonamiento básico y respuesta a instrucciones propias de un modelo de 0,58B, sin capacidades avanzadas declaradas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- El template incluido renderiza exactamente el formato de chat documentado y detiene la generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).

## Casos de uso

- Investigación sobre preentrenamiento y composición de datos: el modelo sirve como punto de comparación dentro de la ladder v2 para aislar el efecto de la condición de pérdida y la semilla sobre el comportamiento final; su utilidad principal es reproducir y extender los resultados del estudio 1PP.
- Experimentos controlados de scaling: al compartir flujo de datos y pasos con los escalones de 0,98B, 1,66B y 2,81B, permite estudiar curvas de escalado con una única variable modificada.
- Evaluación de metodologías de SFT: con una mezcla de 400.000 conversaciones y una pérdida de validación publicada de 2,074, es un banco de pruebas para comparar recetas de ajuste fino supervisado en modelos pequeños.
- Prototipado de chat de bajo coste: con 580M parámetros y contexto de 4.096 tokens, puede desplegarse en una sola GPU consumer para demos de conversación en inglés sin requisitos de infraestructura elevados.
- Estudio de sesgos y seguridad en modelos pequeños: la inclusión de una muestra del conjunto de seguridad en el SFT permite analizar cómo un modelo de este tamaño responde a prompts sensibles.
- Generación de texto acotada en pipelines de investigación: resumen o reescritura de documentos cortos en inglés dentro de entornos controlados, siempre con revisión humana y sin asumir calidad de producción.
- Docencia y formación: su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado para laboratorios prácticos sobre entrenamiento, tokenización y formato de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son pérdidas de validación internas del proyecto:

| Metrica | Valor |
|---|---|
| Perdida de validacion, texto de asistente (preentrenamiento, 2.433 documentos) | 1,664 |
| Perdida de validacion, texto de usuario (preentrenamiento) | 1,543 |
| Perdida de validacion, texto de documento (preentrenamiento) | 3,452 |
| Perdida ponderada de la condicion (`reweighted_seg1234`) | 1,654 |
| Perdida de SFT en validacion (asistente, 1.998 conversaciones) | 2,074 |
| Verificacion HF frente a Megatron (sft_val segmentos [3, 4]) | 2,0741 vs 2,0741, diferencia 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos moderados.
- En cuantización de 8 bits, los pesos ocuparían del orden de 0,6 GB; en 4 bits, alrededor de 0,3 GB, aunque no se documentan ficheros GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o una A100/H100 pueden ejecutarlo con holgura y alto throughput.
- Cabe en GPU consumer de gama media y en iGPU con suficiente memoria compartida; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en HuggingFace). No se documentan pesos GGUF para llama.cpp u Ollama, por lo que su uso en esas herramientas requeriría conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-ua-seed42-sft | 580M | 4.096 | Apache 2.0 | Artefacto de investigación 1PP, SFT sobre 400k conversaciones, solo inglés |
| SmolLM2-360M (referencia de tokenizador) | 360M | 8.192 (según versión) | Apache 2.0 | Modelo generalista de HuggingFace; comparte vocabulario, pero no es comparable en propósito experimental |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Modelo generalista multilingüe con soporte de tool calling; contexto mucho mayor |
| Llama 3.2 1B | 1.240M | 131.072 | Llama 3.2 Community License | Modelo generalista con contexto largo y capacidades multilingües |

La comparación con modelos generalistas debe interpretarse con cautela: el 1pp-0.58b es un artefacto de investigación con contexto de 4.096 tokens y sin benchmarks públicos, por lo que no está pensado para competir en tareas de producción frente a modelos generalistas del mismo orden de parámetros. Los datos de contexto y licencia de los modelos comparables provienen de conocimiento general y no de la información proporcionada en esta ficha.

## Limitaciones y advertencias

- El propio autor lo describe como un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no como un asistente de propósito general; no debe desplegarse en producción sin una evaluación exhaustiva.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a un modelo de 580M parámetros entrenado con 20,3 tokens por parámetro; la pérdida de validación de SFT (2,074) sugiere una calidad de ajuste moderada.
- No se documentan evaluaciones de sesgo, toxicidad o seguridad más allá de la inclusión de una muestra del conjunto de seguridad en el SFT.
- El formato de chat no incluye turno de sistema; introducir uno puede degradar el comportamiento porque el modelo nunca lo vio durante el entrenamiento.
- No se publican ficheros GGUF ni recetas de cuantización oficiales; el uso en llama.cpp u Ollama requiere conversión y validación propias.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y de garantías de calidad hace desaconsejable ese uso sin pruebas específicas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción mínima y escasa validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k

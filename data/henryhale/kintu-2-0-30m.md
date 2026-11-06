# henryhale/Kintu-2.0-30M

## Resumen

Kintu-2.0-30M es un modelo de lenguaje conversacional de 30 millones de parámetros especializado en luganda (idioma bantú hablado en Uganda), desarrollado por henryhale. Es el sucesor de Kintu-1.0-39M y se distribuye como un ajuste fino supervisado (SFT) del checkpoint base Kintu-2.0-30M-Base. Su propósito es ofrecer un modelo de chat funcional en un idioma con escasísima representación en el ecosistema de IA abierta, con un tamaño que permite ejecutarlo en hardware muy modesto.

La arquitectura sigue el diseño de Qwen3 para modelos causales (`Qwen3ForCausalLM`), con 8 capas, dimensión oculta de 512, MLP de 1.664 y atención con grouped-query attention (8 cabezas de consulta y 4 de clave-valor). Emplea normalización RMSNorm, activación SwiGLU, RoPE con theta de 1e6, QK-norm y embeddings atados. El vocabulario es un BPE a nivel de byte de 6.400 tokens entrenado sobre los datos de preentrenamiento, y la ventana de contexto es de solo 512 tokens.

Su relevancia actual es doble: por un lado, demuestra que es posible construir un asistente conversacional en luganda con un presupuesto computacional mínimo (entrenado en una única GPU T4 en fp16); por otro, sirve como referencia de los límites prácticos de los modelos de menos de 50M de parámetros, que escriben con fluidez pero fallan con frecuencia en coherencia temática y veracidad factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen3 (`Qwen3ForCausalLM`): RMSNorm, SwiGLU, RoPE (θ = 1e6), QK-norm, grouped-query attention, embeddings atados |
| Parametros totales | 30.025.216 (30,0M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp16/bf16; no se listan GGUF ni otras) |
| Idiomas soportados | Luganda (lg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Detalles adicionales de arquitectura: 8 capas, hidden size 512, tamaño de MLP 1.664, 8 cabezas de consulta y 4 de clave-valor, tokenizer BPE a nivel de byte con 6.400 tokens. Tamaño del repositorio: 0,1 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 8 capas con atención de grupos de consultas (8 Q / 4 KV), lo que reduce el coste de memoria de la caché KV. Incluye QK-norm para estabilizar el entrenamiento y RoPE con una base alta (θ = 1e6), decisión habitual para favorecer la extrapolación posicional aunque el contexto efectivo quede limitado a 512 tokens. Los embeddings de entrada y salida están atados, lo que ahorra parámetros en un modelo de este tamaño.

El ajuste fino se realizó sobre 59.798 pares prompt-respuesta en luganda (subconjuntos de diálogo empático y conversación cotidiana de `henryhale/luganda-sft-translated`) durante 3 épocas con learning rate 5e-5, más 685 conversaciones multiturno de `henryhale/luganda-lima` durante 3 épocas con learning rate 2e-5. Se usó decaimiento coseno, precisión fp16 y una sola GPU T4. La función de pérdida se calcula únicamente sobre las respuestas del asistente, técnica estándar para evitar que el modelo aprenda a reproducir los turnos del usuario. El autor señala que las traducciones de TinyStories constituyen el 68,5% de los tokens de preentrenamiento del modelo base, lo que explica su sesgo hacia narrativas simples.

## Capacidades

- Generación de texto conversacional en luganda, con formato de chat basado en plantilla (`apply_chat_template`).
- Conversación multiturno de corta duración, limitada por la ventana de 512 tokens.
- Respuestas a saludos y fórmulas sociales típicas del idioma (por ejemplo, "Oli otya?" o "Wasuze otya nno?").
- Registro empático y de conversación cotidiana, derivado de los subconjuntos de datos usados en el SFT.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingüe: únicamente luganda; no se documenta competencia en otros idiomas.
- No se documenta capacidad de generación de código ni de matemáticas.

## Casos de uso

- Asistente conversacional de saludos y small talk en luganda: el modelo responde de forma fluida a fórmulas sociales comunes, lo que permite prototipar interfaces de chat en este idioma sin infraestructura adicional.
- Investigación sobre modelos de bajo资源 para lenguas de bajos recursos: sirve como línea base reproducible para estudiar técnicas de tokenización y ajuste fino en idiomas con pocos datos, dado su tamaño (30M) y su entrenamiento en una sola T4.
- Generación de datos sintéticos de conversación en luganda: puede producir turnos de diálogo que, tras filtrado humano, alimenten pipelines de aumento de datos para modelos mayores.
- Aplicaciones educativas de vocabulario y frases cotidianas: útil como generador de ejemplos de conversación básica para materiales de aprendizaje de luganda, siempre con revisión humana por su tendencia a desviarse del tema.
- Despliegue en dispositivos de borde: con 30M de parámetros en fp16 (unos 60 MB) y contexto de 512 tokens, cabe en CPU, móviles de gama media y microcontroladores con suficiente memoria, lo que habilita demos offline.
- Experimentación con decodificación y evaluación en lenguas africanas: permite medir latencia, perplejidad y calidad de respuesta en luganda con un coste computacional mínimo antes de escalar a modelos mayores.
- Pruebas de integración con `text-generation-inference` y endpoints compatibles: el tag `endpoints_compatible` facilita validar infraestructura de serving para idiomas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones específicas de luganda) y se limita a muestras cualitativas generadas con temperatura 0,85 y top-p 0,95.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 60 MB para los pesos en fp16 (30,0M parámetros × 2 bytes), más la caché KV y activaciones, que con contexto de 512 tokens son marginales (del orden de decenas de MB). En la práctica cabe en menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el autor entrenó el ajuste fino en una NVIDIA T4. Funciona también en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa por parte del usuario.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kintu-2.0-30M | 30,0M | 512 | Luganda | Apache 2.0 | Sucesor de Kintu-1.0-39M; SFT sobre diálogo en luganda |
| Kintu-1.0-39M | 39M | no disponible | Luganda | no disponible | Predecesor directo del modelo; menos parámetros efectivos por tokenizer distinto |
| Kintu-2.0-30M-Base | 30,0M | 512 | Luganda | Apache 2.0 | Checkpoint base sin ajuste conversacional; misma arquitectura |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos. Para alternativas de otros autores en luganda o en modelos de menos de 50M parámetros, la información disponible no permite establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Con 30M de parámetros, el modelo escribe luganda fluido pero a menudo se desvía del tema y comete errores factuales; no debe usarse como fuente de información.
- Entrenado con secuencias de hasta 512 tokens, por lo que no admite conversaciones largas ni documentos extensos.
- El 68,5% de los tokens de preentrenamiento del modelo base provienen de traducciones de TinyStories, lo que sesga sus respuestas hacia narrativas simples y registros infantiles.
- Las muestras de la model card incluyen respuestas incoherentes (por ejemplo, responder a una despedida con una frase sobre una empresa), lo que confirma problemas de coherencia contextual.
- Riesgo de alucinación alto y sin mitigaciones documentadas (no se menciona RLHF, DPO ni filtros de seguridad).
- Cobertura lingüística limitada a luganda; no se garantiza un comportamiento correcto si se le introducen prompts en inglés u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no es apto para producción en tareas que requieran exactitud.
- No se publican pesos cuantizados ni evaluaciones de sesgo; se desconoce el comportamiento del modelo en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/henryhale/Kintu-2.0-30M
- Modelo base: https://huggingface.co/henryhale/Kintu-2.0-30M-Base
- Predecesor: https://huggingface.co/henryhale/Kintu-1.0-39M
- Dataset de SFT: https://huggingface.co/datasets/henryhale/luganda-sft-translated
- Dataset de conversaciones multiturno: https://huggingface.co/datasets/henryhale/luganda-lima

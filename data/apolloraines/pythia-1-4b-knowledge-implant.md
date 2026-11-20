# ApolloRaines/Pythia-1.4b-Knowledge-Implant

## Resumen

Pythia-1.4b-Knowledge-Implant es un experimento de modificación de pesos publicado por el usuario ApolloRaines sobre el modelo base EleutherAI/pythia-1.4b. No es un fine-tuning convencional ni un adaptador LoRA: el autor aplica una técnica que denomina "jBlaze" o "direct neural programming", consistente en escribir 198 hechos factuales en los pesos mediante descenso de gradiente sobre un conjunto restringido de parámetros (una proyección MLP por capa), manteniendo el resto congelado. El objetivo declarado es demostrar que es posible inyectar conocimiento factual concreto en un modelo base sin framework de entrenamiento, sin guardar estado del optimizador y en una única GPU de consumo.

El modelo parte de Pythia-1.4b, un transformer decoder-only de arquitectura GPT-NeoX con 1.414.647.808 parámetros, licencia Apache 2.0 y entrenado originalmente por EleutherAI para investigación de interpretabilidad. Al ser un modelo base de completado, su conocimiento factual es limitado y errático; el autor lo usa precisamente como sujeto de prueba limpio y medible. Tras el implante, el autor reporta 196 de 198 hechos correctos (99 %) frente a 107 de 198 (54 %) del modelo original, con las 10 comprobaciones de coherencia superadas.

La relevancia del artefacto es metodológica más que práctica: documenta un procedimiento de "cirugía de pesos" reproducible en hardware asequible y publica tanto los beneficios (recuperación factual) como los costes (perplejidad en WikiText-2 de 12,10 a 15,91, un +31 %). No obstante, conviene subrayar que se trata de una prueba de concepto con un conjunto de evaluación pequeño y diseñado por el propio autor, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only GPT-NeoX (gpt_neox) |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Pythia-1.4b base: 2048 tokens, segun el modelo original) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Pythia-1.4b original de EleutherAI: un transformer decoder-only estilo GPT-NeoX con atención multi-cabeza estándar, capas MLP y embeddings de tokens posicionales rotatorios segun la implementación de referencia. El modelo conserva la tokenización y el vocabulario del base, por lo que hereda su comportamiento de completado de texto sin ajuste de instrucciones ni de diálogo.

El "entrenamiento" aplicado por el autor no es un fine-tuning completo. Segun la model card, jBlaze realiza descenso de gradiente sobre un conjunto restringido de parámetros: una proyección MLP por capa, con el resto de la red congelada. No se emplea LoRA ni un framework de entrenamiento al uso, sino un bucle de optimización directo. No se guarda estado del optimizador ni checkpoints intermedios. El implante de los 198 hechos tardó 140 segundos en una única NVIDIA RTX 3090. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de los 198 hechos repartidos en 15 dominios, ni si hubo RLHF o DPO (no aplica, al tratarse de un modelo base).

La innovación técnica destacable es el propio procedimiento de escritura de conocimiento en pesos con parámetros restringidos, junto con la evaluación de generalización que el autor incluye: paráfrasis (37 consultas), consultas inversas (15), razonamiento de dos saltos (5) y localidad (12), además de la perplejidad en WikiText-2 como métrica de daño colateral.

## Capacidades

- Generación de texto por completado: el modelo es un completion model puro, sin formato de chat ni plantilla de instrucciones.
- Recuperación factual de los 198 hechos implantados: el autor reporta 196/198 respuestas correctas en los prompts exactos de programación.
- Generalización parcial a paráfrasis: 27/37 frente a 25/37 del vanilla.
- Consultas inversas: 12/15 frente a 11/15 del vanilla (por ejemplo, "Canberra is the capital of" devuelve Australia).
- Razonamiento de dos saltos: 4/5 frente a 3/5 del vanilla (por ejemplo, encadenar Canberra, Australia y dólar australiano).
- Preservación de localidad: 10/12 frente a 8/12, sin dañar hechos cercanos no programados.
- Coherencia lingüística: 10/10 comprobaciones superadas; el modelo sigue escribiendo inglés gramatical.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: no se documenta ninguna de estas capacidades.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Investigación en interpretabilidad y cirugía de pesos: el modelo sirve como banco de pruebas reproducible para estudiar cómo se almacena y recupera conocimiento factual en matrices de pesos concretas, dado que el autor documenta el procedimiento y las métricas de daño (perplejidad +31 %).
- Validación de metodologías de edición de conocimiento: útil para comparar jBlaze frente a técnicas como ROME, MEMIT o fine-tuning con LoRA en un modelo pequeño y bien documentado como Pythia.
- Docencia y divulgación técnica: permite ilustrar en un artículo o taller qué es un modelo base, por qué alucina y cómo un cambio quirúrgico en los pesos altera su comportamiento factual sin reentrenar todo el modelo.
- Pruebas de regresión de pipelines de evaluación: al tener un conjunto conocido de 198 hechos y métricas de paráfrasis, inversión y dos saltos, puede usarse como fixture para validar harness de evaluación factual en modelos pequeños.
- Experimentos de bajo presupuesto en hardware de consumo: con 140 segundos de implante en una RTX 3090, es viable replicar el experimento en un laboratorio con recursos limitados para estudiar estabilidad de pesos y olvido catastrófico.
- Generación de texto controlada en inglés para demostraciones: en escenarios donde se requiera completado de frases sobre los dominios implantados (ciencia, historia, geografía, tecnología) y no se necesite un asistente conversacional, el modelo puede producir respuestas correctas sobre esos temas concretos.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card del autor, medidos sobre su propio conjunto de 198 hechos y pruebas auxiliares. No hay resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Pythia-1.4b vanilla | Tras implante |
|---|---|---|
| Hechos correctos (198) | 107/198 (54 %) | 196/198 (99 %) |
| Comprobaciones de coherencia | 10/10 | 10/10 |
| Paráfrasis (37 consultas) | 25/37 | 27/37 |
| Consultas inversas (15) | 11/15 | 12/15 |
| Dos saltos (5 consultas) | 3/5 | 4/5 |
| Localidad (12 consultas) | 8/12 | 10/12 |
| Perplejidad WikiText-2 | 12,10 | 15,91 |
| Tiempo de implante | -- | 140 s en RTX 3090 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos (1,41 B de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB; en 4 bits, alrededor de 1-1,5 GB (estimaciones a partir del tamaño de parámetros; el autor no publica variantes cuantizadas).
- GPU recomendadas: cualquier GPU con 8 GB o más puede ejecutarlo en FP16. Una RTX 3090 (24 GB) es la hardware usada por el autor para el implante. También cabe en RTX 4090, RTX 3060 de 12 GB, A10, L4 y T4 (16 GB).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 8 GB o más; en cuantización 4 bits podría ejecutarse incluso en GPUs integradas o en CPU con suficiente RAM.
- Opciones de despliegue: transformers con PyTorch es la vía natural al publicarse en safetensors; llama.cpp y Ollama requerirían conversión a GGUF (no publicada). vLLM y TGI son compatibles con GPT-NeoX, aunque el modelo no está optimizado ni validado para ellos.
- Latencia y throughput: no disponibles en la información proporcionada. El único dato de rendimiento es el tiempo de implante (140 s en RTX 3090), que no es inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Conocimiento factual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pythia-1.4b-Knowledge-Implant | 1,41 B | no disponible (base: 2048) | 196/198 en el conjunto del autor | Apache 2.0 | Hugging Face |
| EleutherAI/pythia-1.4b | 1,41 B | 2048 | 107/198 en el mismo conjunto | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2048 | no disponible (no evaluado en el conjunto del autor) | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | 1,5 B | 32 768 | no disponible (no evaluado en el conjunto del autor) | Apache 2.0 | Hugging Face |

La comparación con TinyLlama y Qwen2.5-1.5B es solo orientativa en tamaño y licencia: no hay datos de benchmarks comunes en la información disponible, y ambos son modelos instruidos con contextos y calidades de conocimiento factual muy distintas. El par más informativo es la comparación interna vanilla frente a modificado, que es la que documenta el autor.

## Limitaciones y advertencias

- Es un modelo base de completado, no un asistente: no sigue instrucciones ni mantiene diálogo; requiere prompts de completado y puede divagar tras la respuesta correcta (el autor documenta 2 de 198 casos con continuación excesiva).
- El conjunto de evaluación es pequeño (198 hechos) y diseñado por el propio autor, lo que limita la significación estadística y la comparabilidad con benchmarks estándar.
- El daño en modelado de lenguaje es medible: perplejidad en WikiText-2 sube de 12,10 a 15,91 (+31 %), por lo que la calidad de generación general es peor que la del vanilla.
- El conocimiento implantado está acotado a los 198 hechos de 15 dominios; fuera de ese conjunto el modelo mantiene los errores factuales del Pythia original.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Riesgo de alucinación alto fuera de los hechos programados, inherente a un modelo base de 1,4 B sin alineación.
- No se documentan sesgos específicos, pero hereda los del corpus de entrenamiento de Pythia (The Pile), con los sesgos conocidos de ese dataset.
- Licencia Apache 2.0 permite uso comercial, pero el estado del artefacto (prueba de concepto, sin validación en producción) desaconseja su uso en entornos reales.
- No hay variantes cuantizadas publicadas ni validación en frameworks de serving de alto rendimiento (vLLM, TGI), lo que añade trabajo de integración.
- El autor no publica el estado del optimizador ni los checkpoints, lo que dificulta la reproducibilidad exacta del procedimiento más allá de la descripción metodológica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Pythia-1.4b-Knowledge-Implant
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Documentación de Pythia (EleutherAI): https://github.com/EleutherAI/pythia
- Paper de Pythia: https://arxiv.org/abs/2304.01373
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales del método jBlaze.

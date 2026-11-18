# Joshgun345/distilgpt2-finetuned-wikitext2

## Resumen

distilgpt2-finetuned-wikitext2 es un ajuste fino (fine-tuning) del modelo distilgpt2, la version destilada de GPT-2 desarrollada originalmente por OpenAI y distribuida a traves de Hugging Face. Lo publica el usuario Joshgun345 en Hugging Face y esta orientado a generacion de texto autoregresiva. Se trata de un modelo pequeno, de 81.912.576 parametros (unos 82 millones), lo que lo situa en la categoria de modelos ligeros aptos para hardware de consumo.

El modelo parte de la arquitectura transformer decoder-only de GPT-2 en su variante destilada, que reduce el numero de capas respecto al GPT-2 base manteniendo una ventana de contexto de 1024 tokens. El autor lo ha entrenado durante 3 epochs con un learning rate de 2e-05 y AdamW, partiendo de un dataset no especificado en la model card, aunque el nombre del modelo sugiere un ajuste sobre WikiText-2. La perdida de validacion final reportada es de 3,6135.

Su relevancia es limitada y fundamentalmente practica: sirve como ejemplo de pipeline de fine-tuning con la libreria Transformers y como modelo de juguete para experimentacion, prototipado rapido o pruebas de infraestructura de inferencia. No compite con modelos actuales en calidad de generacion ni en capacidades de razonamiento, y su model card es practicamente un esqueleto autogenerado sin documentacion sustantiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 destilado) |
| Parametros totales | 81.912.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de distilgpt2) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/GGUF, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base distilgpt2 esta entrenado predominantemente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de distilgpt2: un transformer decoder-only con atencion causal, resultado de la destilacion por conocimiento del GPT-2 base de OpenAI. Distilgpt2 reduce el numero de capas a la mitad respecto al GPT-2 base (6 capas frente a 12), lo que explica su tamano de unos 82 millones de parametros y su menor coste computacional, a cambio de una perdida de calidad en la generacion. Mantiene el tokenizador BPE de GPT-2 y la ventana de contexto de 1024 tokens.

El ajuste fino se realizo durante 3 epochs con un batch de entrenamiento de 8, learning rate 2e-05, scheduler lineal, semilla 42 y el optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08. La evolucion de la perdida muestra un descenso moderado: de 3,7194 en el epoch 1 a 3,5725 en el epoch 3 en entrenamiento, y de 3,6379 a 3,6135 en validacion, lo que indica un ajuste suave sin senales claras de sobreajuste pero tambien sin mejoras sustanciales. No se documenta la composicion del dataset, el numero de tokens de entrenamiento ni si hubo tecnicas de alineacion como RLHF o DPO. Las versiones de framework reportadas son Transformers 5.23.0, PyTorch 2.14.1, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Generacion de texto autoregresiva en ingles, limitada a completar o continuar secuencias cortas.
- Modelado de lenguaje causal basico: prediccion del siguiente token.
- Ajuste sobre corpus tipo WikiText-2, lo que puede favorecer la generacion de texto con estilo enciclopedico o articulos de Wikipedia.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito (thinking mode).
- Capacidades multilingues no documentadas; el modelo base esta orientado al ingles.

## Casos de uso

- Prototipado de pipelines de generacion de texto: sirve para validar rapidamente una arquitectura de inferencia con Transformers o text-generation-inference antes de escalar a modelos mayores, gracias a su tamano reducido y a su compatibilidad con endpoints.
- Pruebas de infraestructura y CI/CD: al ocupar apenas 0,3 GB en el repositorio y caber en cualquier GPU, es util para testear despliegues, contenedores y configuraciones de servidores de inferencia sin coste significativo.
- Educacion y demostraciones: adecuado para explicar el funcionamiento del fine-tuning con Trainer, la destilacion de modelos y la generacion autoregresiva en cursos o talleres.
- Generacion de texto de relleno o sintetico en entornos de prueba: util para poblar bases de datos de desarrollo o generar datos ficticios con estilo enciclopedico sin preocupacion por coste.
- Experimentacion academica sobre destilacion y ajuste fino: permite reproducir y comparar curvas de perdida en un modelo pequeno con recursos minimos.
- Inferencia en CPU o dispositivos de bajos recursos: su tamano permite ejecutarlo en entornos sin GPU, como Raspberry Pi o contenedores ligeros, para tareas de generacion de texto no criticas.

## Benchmarks y rendimiento

El autor no ha declarado resultados de benchmarks en la model card; el model-index aparece con la lista de resultados vacia. El unico dato de rendimiento disponible es la perdida de validacion del entrenamiento.

| Metrica | Valor |
|---|---|
| Perdida de validacion final (epoch 3) | 3,6135 |
| Perdida de entrenamiento final (epoch 3) | 3,5725 |
| Perdida de validacion (epoch 1) | 3,6379 |
| Perdida de entrenamiento (epoch 1) | 3,7194 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32, unos 328 MB de pesos) y en torno a 200-300 MB en fp16 o cuantizacion de 8 bits; en 4 bits, por debajo de 150 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Funciona en GTX 1060, RTX 2060, RTX 3060, RTX 4090 y superiores sin problemas.
- Cabe holgadamente en GPU de consumo, incluidas las de gama baja y las integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers (pipeline de text-generation), text-generation-inference (el modelo esta etiquetado como endpoints_compatible), llama.cpp y Ollama mediante conversion a GGUF, y servidores propios con PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia de milisegundos por token en GPU moderna y throughput alto en batch, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| distilgpt2-finetuned-wikitext2 | 81,9 M | 1024 | apache-2.0 | Hugging Face | Ajuste fino de distilgpt2, sin benchmarks publicados |
| distilgpt2 | 81,9 M | 1024 | apache-2.0 | Hugging Face | Modelo base, destilado de GPT-2, ampliamente usado |
| GPT-2 (base) | 124 M | 1024 | MIT (segun publicacion original) | Hugging Face | Mayor calidad que distilgpt2, mas coste |
| GPT-2 small fine-tuned | 124 M | 1024 | MIT | Hugging Face | Alternativa directa con mas capacidad |

La comparativa se limita a modelos de la misma familia y escala, ya que no existen datos de rendimiento publicados para este ajuste que permitan comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del corpus de entrenamiento de GPT-2 y de distilgpt2, que no estan documentados en esta model card; es probable que reproduzca estereotipos presentes en texto web en ingles.
- Riesgo de alucinacion: alto, como en todos los modelos de lenguaje de esta escala; la generacion no esta fundamentada y puede producir texto plausible pero falso.
- Limitaciones de contexto: ventana de 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitaciones de idioma: no hay idiomas declarados; el modelo base esta orientado al ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el autor no documenta el dataset de ajuste ni sus condiciones, lo que introduce incertidumbre sobre la procedencia de los datos.
- Caveat para produccion: la model card es un esqueleto autogenerado sin informacion sobre datos, evaluacion ni usos previstos; no se recomienda su uso en produccion sin una evaluacion propia. El modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joshgun345/distilgpt2-finetuned-wikitext2
- Modelo base distilgpt2: https://huggingface.co/distilgpt2
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Repositorio de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Paper de GPT-2 (Language Models are Unsupervised Multitask Learners): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- Paper de destilacion de conocimiento (Hinton et al.): https://arxiv.org/abs/1503.02531
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext

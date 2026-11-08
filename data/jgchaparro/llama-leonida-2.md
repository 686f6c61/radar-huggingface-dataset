# jgchaparro/Llama-Leonida-2

## Resumen

Leonida 2 es un modelo de traducción bidireccional entre griego moderno y tsakonio, una lengua helénica en peligro crítico de desaparición que se habla en la península del Peloponeso y que desciende en gran medida del dorio lacónico antiguo. Lo desarrolla jgchaparro en el marco del proyecto Tsakonian Digital, y es el sucesor de Leonida Beta 2. El modelo resuelve un problema muy concreto: la ausencia de herramientas de traducción automática de calidad para una lengua de bajos recursos, entrenando exclusivamente con fuentes de acceso abierto, principalmente el sitio web de Panos Marneris (tsakonika.online).

Técnicamente es un fine-tuning del modelo ilsp/Llama-Krikri-8B-Instruct-v1.5, una adaptación al griego de Llama 3.1 8B realizada por el ILSP (Athena Research Center) con vocabulario griego ampliado. Leonida 2 tiene 8.202.227.712 parámetros y se distribuye en formato merged de 16 bits (safetensors), además de versiones GGUF y un adaptador LoRA. El entrenamiento combina un ajuste supervisado sobre 19.004 pares de frases con una etapa posterior de aprendizaje por refuerzo mediante GRPO.

Su relevancia actual reside en dos factores: por un lado, demuestra que es posible obtener traducciones de alta calidad (chrF++ 83,8 en el benchmark interno V2.2) para lenguas con corpus mínimos mediante SFT más RL; por otro, su tamaño de 8B permite ejecutarlo localmente, incluso en un portátil con la cuantización Q4_K_M, lo que facilita su uso por comunidades lingüísticas y proyectos de preservación sin infraestructura de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1, fine-tuning de ilsp/Llama-Krikri-8B-Instruct-v1.5) |
| Parámetros totales | 8.202.227.712 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con longitud máxima de secuencia de 768 tokens) |
| Tipos de cuantización | 16 bits (bf16 merged); GGUF Q8_0, Q5_K_M y Q4_K_M; LoRA en bf16 |
| Idiomas soportados | griego moderno (el) y tsakonio |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (modelo merged), GGUF (llama.cpp, Ollama, LM Studio), adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de ilsp/Llama-Krikri-8B-Instruct-v1.5, una adaptación de Llama 3.1 8B al griego con vocabulario griego extendido. Sobre esa base se aplicó un LoRA en bf16 con rango 64 y alpha 64 sobre las capas de atención y MLP, usando Unsloth. La etapa 1 consistió en ajuste supervisado con 19.004 pares de frases tsakonio-griego, cada uno usado en ambas direcciones (38.008 ejemplos), con learning rate 0,0002, decaimiento coseno, warmup del 3 %, AdamW de 8 bits, batch efectivo de 16 y longitud máxima de 768 tokens, hasta 3 épocas (7.128 pasos). La pérdida se calcula solo sobre la respuesta del modelo.

La etapa 2 aplicó Group Relative Policy Optimization (pérdida Dr. GRPO, sin término KL) continuando el adaptador de la etapa 1, con 2.132 pares adicionales (4.045 prompts en ambas direcciones) que la primera etapa nunca vio. Para cada prompt se muestrearon 8 traducciones a temperatura 0,9. La recompensa combina mitad chrF++ de frase, mitad (1 − TER) y un bonus por coincidencia exacta, con penalizaciones automáticas por errores de puntuación, cifras, mayúsculas y diacríticos no presentes en la referencia; las salidas vacías, copias del original, longitudes muy distintas o respuestas truncadas puntúan 0. Se realizaron 400 actualizaciones de 16 prompts con learning rate 0,00001, seleccionando el checkpoint de la actualización 350 (chrF++ de validación 81,30 frente a 80,78 de la etapa 1).

## Capacidades

- Traducción bidireccional griego moderno ↔ tsakonio en un único modelo, con salida limitada a la traducción.
- Lectura y escritura de la ortografía Kostakis del tsakonio, con diacríticos combinantes (τσ̑, σ̌, κ̔, ν̇, λ̣, ν̂, α̈).
- Conversión implícita de otras ortografías del tsakonio, aunque con menor calidad según el autor.
- Seguimiento de instrucciones mediante la plantilla de chat de Llama 3.1 con un prompt de sistema específico.
- Generación determinista recomendada (greedy) para traducción.
- Capacidades heredadas del modelo base (razonamiento, código, tool calling) no documentadas ni garantizadas para esta ficha; el modelo está especializado en traducción.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Preservación digital del tsakonio: traducción y digitalización de textos de la comunidad, aprovechando que el modelo lee y escribe la ortografía Kostakis y que se entrenó solo con fuentes abiertas.
- Herramienta educativa para aprendizaje de la lengua: traducción de frases y materiales didácticos entre griego y tsakonio en ambos sentidos, con salida limpia (solo la traducción) que facilita su integración en ejercicios.
- Traducción de documentación y patrimonio cultural: conversión de inscripciones, relatos y material etnográfico del griego al tsakonio para publicaciones comunitarias.
- Investigación en lingüística computacional de lenguas de bajos recursos: el modelo sirve como referencia reproducible (SFT + GRPO sobre 19.004 pares) para experimentos de traducción con corpus mínimos.
- Despliegue local en portátil: la cuantización Q4_K_M permite ejecutar el modelo en un equipo personal con llama.cpp, Ollama o LM Studio, útil para trabajos de campo o entornos sin GPU.
- Servicio de traducción ligero en una web comunitaria: con 8B parámetros puede servirse en una GPU consumer o incluso en CPU con cuantización, integrado mediante la API de chat de Llama 3.1.
- Generación de pares de entrenamiento aumentados: usar el modelo para producir traducciones candidatas que luego se revisan manualmente y amplían el corpus del proyecto Tsakonian Digital.

## Benchmarks y rendimiento

Resultados publicados por el autor en su model card, sobre los benchmarks internos del proyecto:

| Benchmark | chrF++ | BLEU | TER |
|---|---|---|---|
| Bench V2.2 | 83,8 | 71,3 | 16,7 |
| Bench V3 | 71,4 | 53,3 | 29,4 |

Evolución en validación durante la etapa de RL (chrF++ / TER, y por dirección):

| Actualización | chrF++ validación | TER | Tsakonio → griego chrF++ | Griego → tsakonio chrF++ |
|---|---|---|---|---|
| 0 (etapa 1) | 80,78 | 20,23 | 81,31 | 80,29 |
| 50 | 80,92 | 20,20 | 81,56 | 80,32 |
| 100 | 80,95 | 20,12 | no disponible | no disponible |
| 350 (publicado) | 81,30 | no disponible | no disponible | no disponible |

No se han publicado resultados comparativos con otros modelos de traducción en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bf16 (16 bits) el modelo ocupa aproximadamente 16,4 GB de pesos, por lo que requiere alrededor de 18-20 GB de VRAM para inferencia con margen para el contexto.
- GGUF Q8_0: en torno a 8-9 GB; Q5_K_M: en torno a 5,5-6 GB; Q4_K_M: en torno a 4,5-5 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16-24 GB) para Q8_0.
- Cabe en GPU consumer: sí, con cuantizaciones Q5_K_M y Q4_K_M en tarjetas de 8 GB o más; el autor indica que el archivo Q4_K_M se ejecuta en un portátil.
- Opciones de despliegue: transformers (bf16), llama.cpp, Ollama y LM Studio mediante los GGUF; el adaptador LoRA se carga sobre ilsp/Llama-Krikri-8B-Instruct-v1.5.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leonida 2 | 8,2B | no disponible | griego moderno, tsakonio | llama3.1 | safetensors, GGUF, LoRA |
| ilsp/Llama-Krikri-8B-Instruct-v1.5 (base) | ~8B | no disponible | griego (y herencia Llama 3.1) | llama3.1 | safetensors |
| Leonida Beta 2 (predecesor) | no disponible | no disponible | griego moderno, tsakonio | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: está entrenado exclusivamente para traducción griego ↔ tsakonio; su uso como modelo generalista no está validado y probablemente degrade su calidad en tareas ajenas.
- Dependencia de la ortografía: el modelo espera la ortografía Kostakis; textos en otras ortografías se traducen peor, según advierte el autor.
- Corpus de entrenamiento pequeño y de una única fuente principal (tsakonika.online), lo que puede introducir sesgos de estilo y vocabulario del autor de esa fuente.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, especialmente en construcciones ausentes del corpus o en textos largos.
- Longitud de secuencia de entrenamiento limitada a 768 tokens; no se documenta la ventana de contexto efectiva del modelo final.
- Licencia llama3.1: conviene revisar los términos de la licencia comunitaria de Llama 3.1 antes de un uso comercial, incluidos los requisitos de atribución y las restricciones de la licencia.
- Idioma de la interfaz limitado a griego y tsakonio; no se documenta soporte multilingüe adicional.
- Sin datos publicados de latencia, throughput ni evaluación externa independiente; los benchmarks son internos del proyecto.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgchaparro/Llama-Leonida-2
- GGUF (Q8_0, Q5_K_M, Q4_K_M): https://huggingface.co/jgchaparro/Llama-Leonida-2-GGUF
- Adaptador LoRA: https://huggingface.co/jgchaparro/Llama-Leonida-2-lora
- Modelo base: https://huggingface.co/ilsp/Llama-Krikri-8B-Instruct-v1.5
- Proyecto Tsakonian Digital: https://tsakoniandigital.com
- Fuente principal de datos, web de Panos Marneris: https://tsakonika.online
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- Predecesor, Llama-Leonida: https://huggingface.co/jgchaparro/Llama-Leonida
- Ficha en free2aitools: https://free2aitools.com/model/jgchaparro/llama-leonida

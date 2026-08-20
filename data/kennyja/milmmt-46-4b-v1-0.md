# KennyJA/MiLMMT-46-4B-v1.0

## Resumen

MiLMMT-46-4B-v1.0 es un modelo de traduccion automatica neuronal basado en el modelo Gemma3-4B de Google, desarrollado por Xiaomi Inc. Su objetivo es proporcionar traduccion multilingue de alta calidad entre 46 idiomas, superando las limitaciones de cobertura linguistica de los modelos generalistas. El modelo se construye mediante un proceso de entrenamiento en cuatro etapas que incluye preentrenamiento continuo, ajuste fino supervisado, aprendizaje por refuerzo y fusion de modelos, lo que permite obtener un rendimiento de traduccion competitivo con modelos de ultima generacion como Seed-X, HY-MT-1.5 o TranslateGemma.

El modelo cuenta con 4.300 millones de parametros y una arquitectura de transformer causal, heredada de Gemma3-4B. Su entrenamiento se realizo sobre 143 mil millones de tokens de datos monolingues y paralelos en 46 idiomas, lo que le permite cubrir un amplio espectro de pares de traduccion. Esta version 1.0 es una actualizacion de la version 0.1, que incorpora mejoras derivadas de tecnicas de aprendizaje por refuerzo y fusion de modelos, y esta disponible bajo la licencia Gemma, lo que facilita su uso comercial con las restricciones habituales de esta licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma3-4B) |
| Parametros totales | 4.300.079.472 (4,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Arabe, azerbaiyano, bulgaro, bengali, catalan, checo, danes, aleman, griego, ingles, espanol, persa, finlandes, frances, hebreo, hindi, croata, hungaro, indonesio, italiano, japones, kazajo, jemer, coreano, lao, malayo, birmano, noruego, neerlandes, polaco, portugues, rumano, ruso, eslovaco, esloveno, sueco, tamil, tailandes, tagalo, turco, urdu, uzbeko, vietnamita, canton, chino simplificado, chino tradicional |
| Licencia | Gemma |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de transformer de Gemma3-4B, que es un modelo de lenguaje autoregresivo de 4,3 mil millones de parametros. No se trata de una arquitectura MoE ni hibrida; es un transformer denso estandar, pero adaptado para la tarea de traduccion. La innovacion principal reside en el proceso de entrenamiento, que se desarrolla en cuatro etapas: (1) pre-entrenamiento continuo sobre 143 mil millones de tokens de datos monolinguales y paralelos en 46 idiomas, obteniendo el checkpoint MiLMMT-46-4B-Pretrain; (2) ajuste fino supervisado para adaptar el modelo a la tarea de traduccion, generando MiLMMT-46-4B-v0.1; (3) entrenamiento por refuerzo para optimizar la calidad de traduccion y la alineacion con preferencias humanas; y (4) fusion de modelos para combinar las capacidades de varios checkpoints y obtener la version 1.0 final.

El proceso de entrenamiento por refuerzo se describe como "reference-free" (sin referencia), lo que significa que no se utilizan traducciones de referencia para calcular la recompensa, sino que se evalua la calidad de la traduccion de forma automatica o con criterios alternativos. Esto se detalla en el articulo tecnico "Reference-Free Post-Training of Open Large Language Models for Multilingual Machine Translation" (arXiv:2608.10812). La arquitectura es identica a la de Gemma3-4B, por lo que se puede usar con las herramientas estandar de transformers y vLLM.

## Capacidades

- Traduccion automatica entre 46 idiomas, incluyendo pares de alta y baja demanda (por ejemplo, ingles-chino, chino-vietnamita, aleman-catalan, etc.).
- Generacion de texto con decodificacion greedy (top_k=1, temperature=0) para producir traducciones deterministas y consistentes.
- Soporte de prompt de traduccion estructurado: "Translate this from <source> to <target>: <source>: <frase> <target>:", lo que facilita su integracion en pipelines automaticos.
- No soporta vision, audio ni multimodalidad: es un modelo de texto puro, aunque hereda la arquitectura de Gemma3, no se ha entrenado con datos de imagen.
- No se han publicado capacidades de tool calling o function calling; es un modelo centrado exclusivamente en traduccion.
- Capacidades multilingues amplias, pero limitadas a los 46 idiomas listados; fuera de ellos, el rendimiento no esta garantizado.
- Soporte de inferencia en lote y produccion mediante vLLM, con parametros de muestreo configurables (top_k, temperature, max_tokens).

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales, guias y documentacion de software entre ingles y chino, japones, coreano, aleman, frances, espanol, etc., con un formato de prompt simple que permite integrarlo en pipelines de documentacion automatizada.
- Atencion al cliente multilingue: se puede usar para traducir mensajes de usuarios en tiempo real en sistemas de soporte, cubriendo 46 idiomas con una sola instancia del modelo, lo que reduce la necesidad de modelos separados por par de idiomas.
- Localizacion de productos de software: el modelo puede traducir cadenas de interfaz de usuario, mensajes de error y contenido de marketing, con una ventana de contexto suficiente para frases cortas y medianas, y se puede integrar en un pipeline de CI/CD para localizacion continua.
- Traduccion de contenido de e-commerce: para plataformas de venta en linea, el modelo puede traducir descripciones de productos, reseñas de clientes y contenido generado por usuarios entre idiomas como ingles, espanol, portugues, hindi, vietnamita, etc.
- Traduccion de contenido audiovisual: aunque no procesa audio directamente, puede traducir subtitulos de video o transcripciones de audio entre idiomas, con un formato de prompt que permite procesar frases largas y multiples turnos.
- Investigacion en procesamiento del lenguaje natural: el modelo puede servir como base para experimentos de traduccion multilingue, evaluacion de calidad de traduccion automatica, o como componente en sistemas de agentes multilingues que requieren comprension y generacion de texto en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una figura con resultados experimentales, pero no se proporcionan numeros concretos ni tablas comparativas. Se sabe que el modelo supera a Seed-X, HY-MT-1.5 y TranslateGemma en la evaluacion interna de Xiaomi, pero no se ofrecen datos verificables. Por lo tanto, no se presentan tablas de benchmarks.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 4,3 mil millones de parametros y ocupa 8,7 GB en disco con pesos en safetensors. Para inferencia con precision FP16 se estima que se necesitan aproximadamente 9-10 GB de VRAM, y con cuantizacion a 8 bits, unos 5-6 GB.
- GPU recomendadas: una GPU consumer como la NVIDIA RTX 3090 o RTX 4090 (24 GB VRAM) es suficiente para inferencia con precision completa; para cuantizacion, una RTX 3060 de 12 GB podria ser suficiente. Para despliegue en produccion, se recomienda una A100 o H100 para servir multiples peticiones concurrentes.
- Compatibilidad con GPUs consumer: si, cabe en GPUs de 24 GB VRAM sin cuantizacion, y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: vLLM (soporte oficial), transformers (con `AutoModelForCausalLM`), y se puede usar con llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se dispone de datos publicados. En una RTX 4090, se estima una latencia de 20-50 ms por token en generacion autoregresiva, y un throughput de 20-40 tokens/s, pero estos valores no estan confirmados por el equipo de Xiaomi.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, pero se citan tres modelos como alternativas en la misma categoria:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiLMMT-46-4B-v1.0 (este) | 4,3 B | no disponible | 46 | Gemma | Hugging Face |
| Seed-X (Xiaomi) | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT-1.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| TranslateGemma | 4 B | no disponible | no disponible | Gemma | Hugging Face |

No se puede realizar una comparativa cuantitativa fiable sin datos de benchmarks. El modelo de Xiaomi se presenta como superior a estos tres, pero no se proporcionan numeros.

## Limitaciones y advertencias

- Soporte limitado a 46 idiomas: el modelo no garantiza traducciones correctas en idiomas fuera de esa lista, y el rendimiento puede degradarse notablemente en lenguas no contempladas.
- Riesgo de alucinaciones: como todo LLM, puede generar traducciones inventadas o incorrectas, especialmente en pares de idiomas poco frecuentes o con datos de entrenamiento limitados.
- Sesgos linguisticos: el entrenamiento se ha realizado con datos multilingue, pero no se ha evaluado el sesgo en cuanto a genero, cultura o dialectos; es recomendable revisar las traducciones en contextos sensibles.
- Licencia Gemma: esta licencia permite uso comercial, pero incluye restricciones de uso prohibido en determinados sectores (por ejemplo, armamento, vigilancia masiva) y exige mantener los avisos de licencia. Es necesario revisar los terminos completos de la licencia Gemma.
- No es un modelo de traduccion de voz o imagen: aunque el modelo base Gemma3 tiene capacidades multimodales, MiLMMT-46 se ha entrenado solo con texto, por lo que no procesa entradas de imagen ni audio.
- No se publican cuantizaciones oficiales: si se quiere reducir el peso para despliegue en edge, habra que cuantizarlo manualmente, con la consecuente perdida de calidad.
- El modelo se publico en agosto de 2026, y los datos de entrenamiento pueden tener un corte temporal; para traducciones de vocabulario muy reciente o tecnico, puede haber limitaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiaomi-research/MiLMMT-46-4B-v1.0
- Repositorio en GitHub: https://github.com/xiaomi-research/gemmax
- Articulo en arXiv (Reference-Free Post-Training): https://arxiv.org/abs/2608.10812
- Articulo en arXiv (Scaling Model and Data for Multilingual Machine Translation): https://arxiv.org/abs/2602.11961
- Documentacion de la API de FriendliAI: https://friendli.ai/models/xiaomi-research/MiLMMT-46-4B-v1.0

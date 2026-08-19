# Baekpica/dots3-note-prev-Mixed-Quant-GGUF

## Resumen

dots3-note-prev-Mixed-Quant-GGUF es una conversión independiente en formato GGUF del modelo dots3-note-prev de Dots Studio, realizada por Baekpica. El modelo original es el primer peso abierto de la familia dots3, un Mixture-of-Experts de 280 mil millones de parámetros totales con 16 mil millones activos, diseñado para ejecutarse en hardware de clase DGX Spark con una ventana de contexto de 524.288 tokens. Esta conversión aplica una cuantización mixta orientada a hardware: mantiene en Q8_0 los tensores críticos para la estabilidad de atención y logits, y comprime agresivamente los expertos enrutados con IQ2_XXS y Q2_K, logrando un artefacto de unos 80 GiB.

La relevancia de esta ficha radica en que es una de las primeras cuantizaciones GGUF de un modelo de la familia dots3, pensada para un solo DGX Spark de 128 GB. No es una versión oficial de Dots Studio, sino un trabajo de la comunidad que sigue el pipeline de cuantización mixta de Baekpica (Motif-3, Solar Open 2). El archivo conserva íntegramente la arquitectura original: 46 capas de texto, bloque MTP adicional, 256 expertos enrutados por capa dispersa, MLA, gate de atención headwise y proyecciones DSA en las 13 capas de atención completa. Los encoders de visión y audio se omiten, por lo que esta versión es exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dots3-note, 46 capas de texto + 1 MTP, 13 full-attention / 33 SWA MLA |
| Parametros totales | 280.685.923.264 (280,7 B) |
| Parametros activos | 16 B |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | Mixta: Q8_0 (embeddings, MLA, gate, DSA, MLP denso), IQ2_XXS (gate/up de expertos), Q2_K (down de expertos), F32 (router, RMSNorm) |
| Idiomas soportados | en, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (10 shards, 86,1 GB) |

## Arquitectura y entrenamiento

El modelo base dots3-note-prev es un transformer MoE con 46 capas de texto más un bloque MTP (multi-token prediction). Cada capa dispersa contiene 256 expertos enrutados con routing sigmoid top-8 y `noaux_tc`, más un experto compartido. La atención es MLA (Multi-head Latent Attention) con 13 capas de atención completa y 33 capas de atención con ventana deslizante (SWA). Incluye un gate de atención headwise y proyecciones DSA (indexer) en las capas de atención completa. El modelo original soporta entradas multimodales (texto, imagen, vídeo, audio) y produce texto, pero esta conversión GGUF omite los encoders de visión y audio.

El entrenamiento del modelo original no se detalla en la información disponible; solo se sabe que es el miembro más ligero de la familia dots3, que busca equilibrar capacidad, latencia y coste de inferencia. La conversión GGUF se calibró con un corpus propio de 1.330 documentos (4.120.456 tokens con el tokenizador oficial) utilizando activaciones BF16 oficiales de MLA y MoE sigmoid top-8. Los chunks de calibración son de 512 tokens, con ventana SWA de 513 y DSA top-k de 2048, lo que permite que dentro de un chunk ambas modalidades de atención dispersa atiendan al prefijo causal completo. No se eliminaron, fusionaron ni descartaron expertos ni capas.

## Capacidades

- Generación de texto autoregresiva con soporte de contexto largo de hasta 524.288 tokens.
- Razonamiento multi-paso gracias a la arquitectura MoE con 16 B de parámetros activos.
- Capacidades multilingües para inglés, coreano y chino (idiomas declarados en el modelo base).
- Soporte de MTP (multi-token prediction) que permite predecir múltiples tokens por paso, potencialmente mejorando la velocidad de decodificación.
- Atención MLA con 13 capas full-attention y 33 capas SWA, optimizada para contextos muy largos.
- Enrutamiento sigmoid top-8 con 256 expertos por capa, que permite activar solo una fracción de los parámetros por token.
- No incluye capacidades de visión ni audio en esta conversión GGUF (los encoders se omiten).
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Análisis de documentos extensos: con 524.288 tokens de contexto, el modelo puede procesar libros completos, expedientes legales o informes técnicos de cientos de páginas en una sola pasada, manteniendo coherencia gracias a la atención MLA y el gate headwise.
- Razonamiento matemático y científico: los 16 B de parámetros activos con enrutamiento top-8 permiten resolver problemas complejos de matemáticas, física o ingeniería que requieren cadenas de razonamiento largas.
- Generación de código en repositorios grandes: el contexto amplio permite alimentar el modelo con el contenido completo de un repositorio de tamaño medio para generar o modificar código con conocimiento del proyecto entero.
- Traducción y localización multilingüe: con soporte nativo de inglés, coreano y chino, el modelo puede traducir entre estos idiomas manteniendo matices culturales y terminología técnica.
- Investigación académica en procesamiento de lenguaje natural: sirve como banco de pruebas para estudiar el comportamiento de MoE con cuantización agresiva (IQ2_XXS) en tareas de razonamiento y generación de texto.
- Desarrollo de asistentes conversacionales con memoria larga: el contexto de 524K tokens permite mantener historiales de conversación muy extensos sin truncamiento, adecuado para agentes de atención al cliente o tutores virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversión GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni similares. Tampoco se proporcionan comparativas con el modelo base en BF16 ni con otras cuantizaciones. El autor menciona en foros de NVIDIA un rendimiento preliminar de "pp=300 tok/s, decode=30 tok/s" en una configuración inicial con cuantización nvfp4/bf16, pero estos datos no están verificados ni corresponden a esta versión GGUF concreta.

## Requisitos de hardware

- El artefacto GGUF ocupa 86,1 GB en disco (10 shards). Para cargarlo en memoria se necesita al menos 96-128 GB de VRAM o RAM unificada, dependiendo del runtime y la gestión de pesos.
- Diseñado explícitamente para un DGX Spark de 128 GB de memoria unificada, según la model card.
- No cabe en GPUs de consumo estándar (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en la mayoría de GPUs de workstation (A6000 con 48 GB, A100 de 80 GB) sin descargar shards a CPU, lo que degradaría severamente el rendimiento.
- El runtime previsto es `Baekpica/ds4` (un fork de ds4 de antirez), que aún no implementa la arquitectura `dots3-note`. El llama.cpp estándar no puede ejecutar este modelo.
- No se dispone de datos de latencia o throughput verificados para esta conversión. El autor reporta en foros cifras no confirmadas de 300 tok/s de prefill y 30 tok/s de decode en una configuración inicial con otra cuantización.
- Opciones de despliegue: únicamente el runtime ds4 de Baekpica tras la implementación del soporte para la familia dots3. No hay soporte para vLLM, Ollama ni TGI documentado.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos. El modelo base dots3-note-prev es el miembro más ligero de la familia dots3, pero no se conocen las especificaciones de los otros miembros. Como referencia, la conversión sigue el mismo pipeline de cuantización mixta que Baekpica aplicó a Motif-3 y Solar Open 2, pero no se dispone de sus especificaciones completas para comparar. Se puede indicar que, en términos de parámetros totales (280 B) y contexto (524K), compite con modelos como DeepSeek-V3 o Qwen2.5-Max, pero no hay datos de rendimiento publicados para establecer una comparación objetiva.

## Limitaciones y advertencias

- Cuantización extremadamente agresiva en los expertos enrutados (IQ2_XXS y Q2_K), lo que puede degradar la calidad de generación en tareas que dependen de conocimiento factual fino.
- El runtime `ds4` de Baekpica aún no implementa la arquitectura `dots3-note`; el modelo no es ejecutable con llama.cpp estándar ni con otros motores de inferencia comunes. La ejecución queda supeditada a que se complete el soporte en ds4.
- Se omiten los encoders de visión y audio; el modelo solo procesa texto, a diferencia del modelo base que es multimodal.
- La calibración se realizó con un corpus de solo 4,1 millones de tokens, relativamente pequeño para un modelo de este tamaño, lo que puede afectar a la calidad de la cuantización en dominios no cubiertos por el corpus.
- Los metadatos de 524.288 tokens provienen de la arquitectura fuente; el rendimiento real en contextos tan largos con esta cuantización no ha sido verificado.
- No es una versión oficial de Dots Studio; es una conversión independiente de la comunidad. No hay garantía de que el comportamiento sea idéntico al modelo original en BF16.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el runtime ds4 también cumpla con los requisitos de licencia.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos web, es probable que presente sesgos de género, raza y cultura presentes en los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/Baekpica/dots3-note-prev-Mixed-Quant-GGUF
- Modelo base en HuggingFace: https://huggingface.co/dots-studio/dots3-note-prev
- Repositorio GitHub del modelo base: https://github.com/studio-dots-ai/dots3-note-prev
- Runtime ds4 de Baekpica: https://github.com/Baekpica/ds4
- Runtime ds4 original de antirez: https://github.com/antirez/ds4
- Dataset de calibración Healing-Mix: https://huggingface.co/datasets/Baekpica/Solar-Open2-120B-A15B-REAM-148E-Healing-Mix
- Conversión hermana Motif-3: https://huggingface.co/Baekpica/Motif-3-Mixed-Quant-GGUF
- Hilo en foros de NVIDIA sobre el modelo base: https://forums.developer.nvidia.com/t/dots3-note-preview-new-2x-spark-competitor/380220

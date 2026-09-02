# cooler8/yejin-korean-3b-v1-sft-gguf

## Resumen

El modelo `yejin-korean-3b-v1-sft-gguf` es un modelo de lenguaje fundacional coreano desarrollado por el usuario `cooler8`. Se trata de un modelo causal de tipo Llama con aproximadamente 2,91 mil millones de parámetros, preentrenado desde cero sobre un corpus coreano de alta calidad en un entorno de 8 GPU NVIDIA H200. El proceso de entrenamiento incluye una fase de preentrenamiento seguida de un ajuste fino supervisado (SFT) y, finalmente, la conversión a formato GGUF para su despliegue eficiente en inferencia.

La relevancia de este modelo radica en que ofrece una alternativa open source específicamente orientada al coreano, con una arquitectura moderna (Llama 3.2 3B) y una licencia Apache 2.0 que permite uso comercial. Su tamaño compacto (inferior a 3B) lo hace adecuado para entornos con recursos limitados, manteniendo una ventana de contexto de 4096 tokens. El repositorio en Hugging Face incluye el modelo en formato GGUF, listo para su uso con herramientas como llama.cpp u Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 3B (hidden=3072, layers=28, heads=24, kv_heads=8, GQA 3:1) |
| Parametros totales | 2.910.916.608 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repositorio contiene archivos GGUF, pero no se especifican las variantes de cuantización) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el repositorio también referencia safetensors para el modelo base, pero el artefacto publicado es GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama 3.2 en su variante de 3B, con 28 capas, dimensiones ocultas de 3072, 24 cabezas de atención y 8 cabezas de clave/valor, empleando atención con consulta agrupada (GQA) en proporción 3:1. El tokenizador utilizado es `EleutherAI/polyglot-ko-1.3b`, con un vocabulario de 30.003 tokens, diseñado específicamente para el idioma coreano.

El entrenamiento se realizó desde cero (from scratch) sobre un corpus coreano de alta calidad, utilizando 8 GPU NVIDIA H200. El proceso consta de tres fases: preentrenamiento, ajuste fino supervisado (SFT) y conversión a GGUF. No se menciona el uso de técnicas como RLHF o DPO, ni el número exacto de tokens de entrenamiento. La ventana de contexto está fijada en 4096 tokens, lo que limita el procesamiento de secuencias largas.

## Capacidades

- Generación de texto en coreano: modelo causal de lenguaje capaz de producir texto coherente en coreano.
- Ajuste fino supervisado (SFT): al haber pasado por una fase de SFT, el modelo está orientado a seguir instrucciones y completar tareas conversacionales, aunque no se detallan los datos de ajuste.
- Compatibilidad con pipelines de Hugging Face: se puede cargar con `transformers` usando `pipeline("text-generation")`, como se muestra en la model card.
- Formato GGUF: permite su ejecución en entornos optimizados como llama.cpp, Ollama o servidores compatibles con GGUF.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio. Estas capacidades no están documentadas.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede integrarse en chatbots o asistentes virtuales para mantener diálogos en coreano, aprovechando su ajuste SFT y su ventana de 4096 tokens para gestionar conversaciones de varias vueltas.
- Generación de contenido en coreano: redacción de artículos, resúmenes, correos electrónicos o publicaciones en redes sociales en coreano, gracias a su capacidad de generación de texto fluido.
- Procesamiento de lenguaje natural en coreano: tareas como clasificación de texto, análisis de sentimiento o extracción de información, mediante fine-tuning adicional sobre el modelo base.
- Educación y aprendizaje de idiomas: generación de ejercicios, explicaciones o material didáctico en coreano para estudiantes.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de ~3B en GGUF, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 con 12 GB) para pruebas y desarrollo de aplicaciones.
- Despliegue en producción con baja latencia: gracias a su tamaño reducido y al formato GGUF, es adecuado para servicios de inferencia en tiempo real en infraestructura modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de ~2,91B parámetros, el consumo de memoria depende de la cuantización. Con cuantización Q4_K_M, se estima un uso de aproximadamente 2-3 GB de VRAM; con Q8, alrededor de 3-4 GB. No se especifican las cuantizaciones incluidas en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en cuantizaciones bajas. Ejemplos: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10G o L4.
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs consumer con suficiente VRAM, especialmente con cuantización Q4.
- Opciones de despliegue: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores que soporten GGUF (por ejemplo, llama-cpp-python). También se puede cargar con `transformers` si se dispone de los pesos en safetensors, aunque el repositorio principal es GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 3B en Q4 puede generar decenas de tokens por segundo, pero estos valores dependen del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos coreanos de tamaño similar. El modelo base Llama 3.2 3B (multilingüe) podría servir como referencia arquitectónica, pero no se han publicado comparativas de rendimiento. Tampoco se conocen otros modelos coreanos de 3B preentrenados desde cero con los que contrastar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Idioma limitado: el modelo está entrenado exclusivamente en coreano; no es adecuado para tareas en otros idiomas.
- Contexto reducido: la ventana de 4096 tokens limita el procesamiento de documentos largos o conversaciones extensas.
- Sin información sobre sesgos o alucinaciones: no se han documentado evaluaciones de sesgos ni tasas de alucinación, por lo que se recomienda validar las salidas en aplicaciones sensibles.
- Tamaño del modelo: al ser un modelo de 3B, su capacidad de razonamiento complejo o conocimiento enciclopédico es inferior a modelos más grandes (7B, 13B o superiores).
- Sin datos de entrenamiento detallados: no se especifica la composición exacta del corpus ni el número de tokens, lo que dificulta evaluar su cobertura temática.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se debe mantener el aviso de licencia y atribución correspondiente.
- Repositorio con pocas descargas y sin comunidad: al ser un modelo reciente y sin interacciones, puede haber problemas no documentados o falta de soporte.

## Enlaces

- Repositorio Hugging Face: [cooler8/yejin-korean-3b-v1-sft-gguf](https://huggingface.co/cooler8/yejin-korean-3b-v1-sft-gguf)
- Tokenizador utilizado: [EleutherAI/polyglot-ko-1.3b](https://huggingface.co/EleutherAI/polyglot-ko-1.3b)
- Modelo relacionado del mismo autor: [cooler8/yejin-korean-1b-v8-sft](https://huggingface.co/cooler8/yejin-korean-1b-v8-sft)

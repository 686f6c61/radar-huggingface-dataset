# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-3to5-3000-SFT

## Resumen

`lugman/Qwen2.5-1.5B-KK-Haiku-5.5-3to5-3000-SFT` es un ajuste fino (SFT) del modelo `unsloth/Qwen2.5-1.5B-Instruct`, que a su vez deriva del Qwen2.5-1.5B-Instruct de Alibaba. Lo publica el usuario `lugman` en Hugging Face bajo licencia Apache 2.0. Por el nombre del repositorio, el ajuste parece orientado a un dominio o estilo concreto (posiblemente haiku u otro formato poético en inglés, a partir de un dataset de 3.000 ejemplos con respuestas de 3 a 5 líneas), aunque la model card no documenta el dataset ni el procedimiento de entrenamiento.

Se trata de un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5B), entrenado con Unsloth y TRL para acelerar el ajuste fino. El modelo base Qwen2.5-1.5B-Instruct aporta una ventana de contexto de 32.768 tokens nativa y capacidades de instrucción y conversación; este ajuste hereda esa arquitectura y añade una especialización sobre la que no hay documentación técnica pública.

Su relevancia es limitada: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni datos de entrenamiento. Resulta útil como ejemplo de pipeline de ajuste fino ligero con Unsloth, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino SFT sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser un modelo transformers/safetensors es convertible a GGUF, AWQ, GPTQ, etc. mediante herramientas estandar |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención de tipo causal, RoPE y normalización RMSNorm, en la variante de 1,5B parámetros de la familia Qwen2.5. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, segun indica la model card, lo que sugiere el uso de LoRA o QLoRA para reducir el coste de cómputo. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO posteriores.

El nombre del repositorio indica "KK-Haiku-5.5-3to5-3000-SFT", lo que apunta a un dataset de 3.000 ejemplos con respuestas de 3 a 5 líneas y posiblemente a un formato de haiku. No obstante, esta interpretación no está confirmada por la documentación del autor. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, con el nivel esperable en un modelo de 1,5B parámetros.
- Generación de código y matemáticas elementales, limitada por el tamaño del modelo.
- Especialización presumible en generación de texto breve de 3 a 5 líneas (posiblemente haiku), segun el nombre del repositorio; sin confirmación documental.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen2.5-Instruct lo soporta, pero no hay garantía de que el ajuste lo conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 es multilingüe.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de poemas breves y textos creativos de formato corto: el ajuste parece orientado a respuestas de 3 a 5 líneas, por lo que puede emplearse para generar haikus o microtextos poéticos en inglés, siempre que se valide la calidad con una muestra propia.
- Prototipado rápido de asistentes conversacionales: con 1,5B parámetros cabe en GPU de consumo y permite iterar sobre prompts y flujos de conversación sin coste elevado de infraestructura.
- Experimentación académica con pipelines de SFT: sirve como ejemplo reproducible de ajuste fino con Unsloth y TRL sobre un modelo Qwen2.5, útil para comparar hiperparámetros y estrategias de LoRA.
- Generación de descripciones cortas o resúmenes de una o dos frases: el formato de 3 a 5 líneas encaja con tareas de titulares, pies de foto o snippets.
- Filtrado y clasificación ligera de texto: al ser un modelo pequeño, puede desplegarse en entornos con recursos limitados para tareas de etiquetado simple, aunque sin benchmarks que respalden su precisión.
- Base para nuevos ajustes de dominio: al estar bajo Apache 2.0 y en formato safetensors, puede reutilizarse como punto de partida para especializaciones posteriores en otros estilos o idiomas.
- Demostraciones educativas de fine-tuning: útil en talleres o cursos para ilustrar el ciclo completo de ajuste, publicación y despliegue de un modelo en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6 GB de pesos; en 4 bits, unos 0,8-1 GB de pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070); A100, H100 o L40S para despliegues con concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problemas en FP16; en 4 bits cabe incluso en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama tras conversión a GGUF, y Ollama/ LM Studio para uso local.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5B, se espera una latencia baja en GPU moderna (del orden de decenas de milisegundos por token en FP16), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Haiku-5.5-3to5-3000-SFT | 1,54B | no disponible (base: 32.768) | apache-2.0 | Hugging Face, 0 descargas | Ajuste SFT especializado, sin benchmarks |
| Qwen2.5-1.5B-Instruct (Alibaba) | 1,54B | 32.768 tokens | apache-2.0 | Hugging Face, ampliamente usado | Modelo base de referencia, con benchmarks publicados |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens | apache-2.0 | Hugging Face | Versión pre-entrenada sin instrucción |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1,7B | 8.192 tokens (ampliable) | apache-2.0 | Hugging Face | Alternativa ligera con benchmarks publicados |
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Contexto muy superior, licencia con restricciones |

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible afirmar su calidad frente al modelo base ni frente a alternativas.
- El dataset de entrenamiento no está documentado: se desconoce su composición, licencia y posibles sesgos heredados.
- Riesgo de alucinación: como todo modelo de 1,5B, tiende a inventar datos en tareas de conocimiento factual; no debe usarse como fuente de verdad sin verificación.
- Especialización estrecha: el ajuste puede degradar capacidades generales del modelo base (olvido catastrófico), especialmente en tool calling, matemáticas o multilingüismo.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado aunque el modelo base sea multilingüe.
- Contexto: no se documenta la ventana efectiva tras el ajuste; asumir la del modelo base (32.768 tokens) es una suposición, no un dato confirmado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base y del dataset de ajuste si se conoce.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Fecha de creación futura (2026-11-19) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-3to5-3000-SFT)
- [Modelo base en Hugging Face: unsloth/Qwen2.5-1.5B-Instruct](https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct)
- [Qwen2.5-1.5B-Instruct (Alibaba)](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Documentación de TRL (Hugging Face)](https://huggingface.co/docs/trl)
- [Paper de Qwen2.5 (arXiv)](https://arxiv.org/abs/2412.15115)

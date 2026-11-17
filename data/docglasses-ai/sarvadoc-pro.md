# Docglasses-AI/sarvadoc-pro

## Resumen

SarvaDoc Pro es un modelo de traducción tamil→inglés desarrollado por Docglasses-AI, distribuido en formato GGUF y pensado para inferencia en dispositivo (on-device). Se construye como un ajuste fino del modelo Felamity-Technologies/Minmini-1B, un transformer de aproximadamente 1.000 millones de parámetros (999.887.104 según los pesos en safetensors), y se publica bajo los términos de licencia Gemma. El repositorio ocupa 2,2 GB e incluye tres cuantizaciones GGUF más una importance matrix calibrada específicamente sobre prompts de traducción tamil→inglés.

El modelo resuelve un caso de uso muy concreto: la traducción de texto tamil a inglés dentro de la aplicación SarvaDoc Pro, con un objetivo de despliegue en teléfono. La elección de cuantizaciones IQ4_XS (unos 690 MB) e IQ3_XXS (unos 657 MB) como opciones por defecto responde a esa restricción de memoria, mientras que Q4_K_M (unos 777 MB) queda como baseline. La calibración de la importance matrix sobre el dominio de traducción es la innovación diferencial declarada por el autor: busca preservar la calidad de las capas relevantes para la tarea a cambio de una compresión agresiva.

Es relevante ahora por dos motivos. Primero, porque ejemplifica la tendencia de modelos pequeños y especializados que sustituyen a APIs en la nube para tareas acotadas con requisitos de privacidad y latencia. Segundo, porque el pipeline declarado es `translation` y los idiomas soportados son únicamente tamil e inglés, lo que lo convierte en una pieza de infraestructura lingüística más que en un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Minmini-1B, familia Gemma 3 según tags) |
| Parametros totales | 999.887.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, IQ3_XXS, Q4_K_M (GGUF); importance matrix incluida |
| Idiomas soportados | tamil (ta), inglés (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 1.000 millones de parámetros, derivado de Felamity-Technologies/Minmini-1B, que a su vez se enmarca en la familia Gemma 3 según los tags del repositorio. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se aplicaron técnicas de RLHF o DPO. El autor tampoco detalla si el ajuste se realizó mediante fine-tuning supervisado, LoRA u otra metodología.

La innovación técnica declarada es la calibración de la importance matrix (imatrix) sobre prompts de traducción tamil→inglés. En el ecosistema GGUF, la imatrix guía la cuantización de tipo I-quant para que las capas y pesos con mayor impacto en la tarea objetivo conserven más precisión. El resultado es que las variantes IQ4_XS e IQ3_XXS deberían degradar menos la calidad de traducción que una cuantización estándar del mismo tamaño, a costa de un proceso de calibración específico del dominio. El prompt sigue el formato de chat de Gemma (`<bos><start_of_turn>user` … `<start_of_turn>model`) y la generación debe detenerse en `<end_of_turn>`.

## Capacidades

- Traducción de texto tamil a inglés, tarea principal y prácticamente exclusiva del modelo.
- Generación de texto conversacional en el formato de chat de Gemma.
- Inferencia en dispositivo con cuantizaciones de entre 657 MB y 777 MB.
- Soporte de despliegue compatible con endpoints (tag `endpoints_compatible`).
- Capacidad multilingüe limitada a tamil e inglés.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se declara soporte de contexto largo ni de decodificación especulativa.

## Casos de uso

- Traducción de documentos tamil a inglés en la aplicación SarvaDoc Pro: el modelo se invoca con el prompt de chat documentado y devuelve la traducción, integrándose en el flujo de la app para digitalizar y comprender documentos en tamil.
- Procesamiento de documentos en el teléfono sin conexión: con IQ4_XS (~690 MB) el modelo cabe en la memoria de un dispositivo móvil moderno, lo que permite traducir contratos, formularios o correspondencia sin enviar datos a la nube.
- Escenarios con requisitos de privacidad: al ejecutarse localmente, el texto tamil no abandona el dispositivo, lo que es adecuado para documentación médica, legal o administrativa sensible.
- Traducción de correspondencia y correo electrónico: la ventana de chat permite introducir párrafos completos y obtener una versión en inglés para comunicación con terceros.
- Preprocesado en pipelines de NLP: el modelo puede actuar como primer paso para convertir texto tamil en inglés antes de pasarlo a un modelo mayor de análisis, resumen o extracción de entidades.
- Aplicaciones de accesibilidad lingüística: subtitulado o traducción de contenido tamil en herramientas de lectura, con latencia baja al ejecutarse en el propio dispositivo.
- Prototipado y evaluación de traducción de bajo coste: al ser un GGUF pequeño, permite experimentar con llama.cpp u Ollama en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7–1,0 GB para las cuantizaciones IQ3_XXS e IQ4_XS, y en torno a 0,8–1,1 GB para Q4_K_M, incluyendo overhead de contexto y KV cache (estimación a partir del tamaño de los ficheros; el autor no publica cifras oficiales).
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen de sobra. En el extremo profesional, A100 y H100 no aportan ventaja práctica para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos años, y también en CPU y en dispositivos móviles.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían conversión previa a safetensors.
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera una latencia de decodificación baja en CPU moderna y muy baja en GPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SarvaDoc Pro (Minmini-1B GGUF) | ~1,0 B | no disponible | ta, en | Gemma Terms of Use | GGUF |
| Minmini-1B (modelo base) | ~1,0 B | no disponible | no disponible | no disponible | safetensors |
| NLLB-200 distilled 600M | 600 M | 512 tokens | 200 idiomas | CC-BY-NC 4.0 | safetensors, GGUF |
| MADLAD-400 3B | 3 B | 1024 tokens | 400+ idiomas | Apache 2.0 | safetensors |

La comparación con Minmini-1B es directa: SarvaDoc Pro es una especialización del mismo con cuantización calibrada para tamil→inglés. Frente a NLLB-200 distilled 600M, SarvaDoc Pro ofrece un tamaño similar en cuantización pero una cobertura lingüística mucho más estrecha y una licencia con restricciones de uso comercial; a cambio, está optimizado para un único par de idiomas. MADLAD-400 3B es tres veces mayor y con licencia permisiva, pero no cabe con la misma holgura en un teléfono. No se dispone de métricas de calidad (BLEU, COMET) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de un solo par de idiomas: solo traduce tamil→inglés; no se declara soporte inverso ni de otros idiomas.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que la calidad real de traducción es desconocida y debe validarse antes de producción.
- Riesgo de alucinación y de traducciones inventadas, especialmente en textos largos, técnicos o con terminología especializada, dado el tamaño reducido del modelo.
- Sesgos potenciales heredados del corpus de entrenamiento del modelo base y del ajuste fino; no se documenta ningún análisis de sesgo.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de integrarlo en un producto.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El autor no documenta la longitud de contexto efectiva, lo que limita la planificación de cargas de documentos largos.
- La calibración de la imatrix está sesgada al dominio de traducción tamil→inglés; usos fuera de ese dominio pueden degradarse de forma no medida.

## Enlaces

- Hugging Face: https://huggingface.co/Docglasses-AI/sarvadoc-pro
- Modelo base: https://huggingface.co/Felamity-Technologies/Minmini-1B
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms

# coder3101/gemma-4-31B-it-heretic

## Resumen

Gemma 4 31B it heretic es una variante "decensored" (abliterated) del modelo multimodal google/gemma-4-31B-it, desarrollada por el usuario coder3101 mediante la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA) con preservación de la norma de filas. El objetivo es eliminar el comportamiento de rechazo (refusals) del modelo original manteniendo al máximo sus capacidades, de modo que el modelo responda a peticiones que la versión instruct estándar declinaría. Es relevante para investigadores que estudian alineación, robustez y mecanismos de seguridad en modelos abiertos, así como para desarrolladores que necesitan un modelo multimodal sin filtros de rechazo en entornos controlados.

El modelo base es un transformer denso de 31B parámetros (30,7B según la model card de Google; 31.273.086.512 parámetros reales en safetensors) con 60 capas, ventana de contexto de 256K tokens, vocabulario de 262K y un codificador de visión de aproximadamente 550M parámetros. Soporta entrada de texto e imagen y salida de texto, con modos de razonamiento configurables ("thinking modes"), soporte nativo de system prompt y function calling.

La intervención de abliteration se aplicó sobre las capas 1 a 59 con unos pesos concretos (preserve_good_behavior_weight 0,8438; steer_bad_behavior_weight 0,0002; overcorrect_relative_weight 1,0760; neighbor_count 15). El autor reporta una divergencia KL de 0,0434 respecto al modelo original y una reducción de rechazos de 99/100 a 15/100 en su conjunto de evaluación. La licencia declarada es Apache 2.0, aunque el modelo base de Google remite a la Gemma 4 License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen), atención híbrida con sliding window local y atención global, p-RoPE en capas globales |
| Parametros totales | 31.273.086.512 (31B; 30,7B según model card del base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos publicados en safetensors; el repo ocupa 125,1 GB) |
| Idiomas soportados | No disponible para esta variante; el modelo base declara soporte multilingüe en más de 140 idiomas |
| Licencia | Apache 2.0 (con enlace a la Gemma 4 License de Google) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 31B Dense: 60 capas, vocabulario de 262K tokens, ventana de atención local deslizante de 1024 tokens combinada con capas de atención global (la última capa es siempre global), claves y valores unificados en las capas globales y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. Incorpora un codificador de visión de ~550M parámetros que permite entrada image-text-to-text con soporte de relación de aspecto y resolución variables. El modelo base fue entrenado por Google DeepMind con datos multimodales (texto e imagen), ajuste instructivo y modos de razonamiento configurables; no se dispone del número exacto de tokens de entrenamiento ni de la composición del dataset en la información proporcionada.

La modificación de esta variante no es un fine-tuning adicional, sino una ablación de direcciones en el espacio de activaciones (abliteration) con el método ARA de Heretic v1.2.0. Se aplicó sobre las capas 1 a 59 con preservación de la norma de filas, con los parámetros indicados en la model card. El resultado es una edición de pesos que reduce la probabilidad de respuestas de rechazo sin reentrenar el modelo; el autor cuantifica el efecto con una divergencia KL de 0,0434 frente al original y una tasa de rechazos de 15/100 frente a 99/100 del base en su evaluación interna.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes) heredados del modelo base.
- Comprensión de imágenes (image-text-to-text) con soporte de resolución y relación de aspecto variables.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores de Gemma, según la documentación del base.
- Soporte nativo de function calling / tool calling.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidades multilingües del modelo base (más de 140 idiomas), aunque no se documenta el impacto de la ablación por idioma.
- Comportamiento "decensored": reducción drástica de rechazos (15/100 frente a 99/100), lo que permite respuestas a peticiones que el modelo instruct estándar declinaría.
- Conversación multi-turno con contexto de hasta 256K tokens.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar las respuestas del modelo abliterated con las del original para estudiar qué direcciones de activación codifican el comportamiento de rechazo y cómo afecta la ablación a otras capacidades.
- Evaluación de robustez de filtros: usar el modelo como generador adversarial controlado para probar clasificadores de contenido y sistemas de moderación en pipelines propios.
- Red teaming interno: generar respuestas a prompts sensibles en un entorno aislado para auditar políticas de seguridad y documentar riesgos antes de desplegar sistemas basados en Gemma 4.
- Análisis multimodal sin restricciones de rechazo: procesar documentos, capturas o imágenes técnicas junto con instrucciones largas (hasta 256K tokens) en tareas de extracción y descripción donde el modelo original podría declinar por matices del prompt.
- Generación de código y tareas agénticas: aprovechar el function calling y el contexto largo para pipelines de CI/CD o asistentes de desarrollo, con la advertencia de que la ablación puede degradar ligeramente la fidelidad respecto al base.
- Experimentación académica con modelos abliterated: reproducir el pipeline de Heretic/ARA sobre este checkpoint para estudiar la relación entre divergencia KL, tasa de rechazos y calidad downstream.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la propia intervención de abliteration, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (google/gemma-4-31B-it) |
|---|---|---|
| Divergencia KL | 0,0434 | 0 (por definición) |
| Rechazos | 15/100 | 99/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 62 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se necesitan 70-80 GB o más según longitud de contexto.
- En cuantización de 8 bits: del orden de 31-35 GB de VRAM; en 4 bits: del orden de 16-20 GB, aunque no se confirman cuantizaciones oficiales en la información disponible.
- GPU recomendadas: H100 80 GB, A100 80 GB o múltiples A100 40 GB para BF16; para cuantización 4/8 bits pueden ser viables RTX 4090 (24 GB) o RTX A6000 (48 GB), con margen limitado en el caso de la 4090.
- No cabe en GPU de consumo de 8-16 GB ni en la mayoría de portátiles; el modelo base está orientado a estaciones de trabajo y servidores.
- Opciones de despliegue: transformers (formato publicado), y previsiblemente vLLM, TGI o llama.cpp/Ollama si se generan conversiones GGUF, aunque no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| coder3101/gemma-4-31B-it-heretic | 31B (denso) | 256K | Texto, imagen | Apache 2.0 (Gemma 4 License en el base) | Variante abliterated; rechazos 15/100, KL 0,0434 |
| google/gemma-4-31B-it | 30,7B (denso) | 256K | Texto, imagen | Gemma 4 License | Modelo base instruct; rechazos 99/100 |
| google/gemma-4-26B-A4B | 25,2B totales, 3,8B activos (MoE) | 256K | Texto, imagen | Gemma 4 License | Alternativa MoE de la misma familia, menor coste de inferencia por token activo |

No se dispone de comparativas con modelos abliterated de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina parte del comportamiento de rechazo, lo que implica un riesgo elevado de generar contenido dañino, ilegal o inseguro; no es adecuado para aplicaciones orientadas al público sin capas adicionales de moderación.
- La divergencia KL de 0,0434 respecto al original indica que la distribución de salida cambia de forma medible; pueden aparecer degradaciones sutiles en razonamiento, código o fidelidad factual que no se documentan con benchmarks estándar.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta variante.
- El comportamiento de rechazo puede variar según el idioma y el tipo de prompt; la evaluación reportada (15/100) es sobre un conjunto no especificado.
- La licencia declarada en el repo es Apache 2.0, pero el modelo base remite a la Gemma 4 License de Google; conviene revisar las condiciones de uso comercial del modelo base antes de desplegar en producción.
- El repo ocupa 125,1 GB y no se documentan cuantizaciones oficiales; el despliegue eficiente requiere conversiones propias.
- No se documentan sesgos específicos de esta variante; los sesgos del modelo base (entrenado por Google DeepMind) persisten y la ablación puede alterar su manifestación.
- Fecha de creación del repo: 2026-04-02; el modelo se actualizó por última vez el 2026-04-14, por lo que puede recibir cambios sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder3101/gemma-4-31B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Método ARA (PR de Heretic): https://github.com/p-e-w/heretic/pull/211
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/

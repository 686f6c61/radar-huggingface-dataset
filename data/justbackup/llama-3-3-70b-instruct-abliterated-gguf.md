# Justbackup/Llama-3.3-70B-Instruct-abliterated-GGUF

## Resumen

El modelo `Justbackup/Llama-3.3-70B-Instruct-abliterated-GGUF` es una cuantización en formato GGUF de la variante "abliterated" de Llama 3.3 70B Instruct, creada originalmente por huihui-ai y cuantizada por bartowski. La técnica de abliteración elimina los mecanismos de rechazo (refusals) del modelo base, de modo que responde a peticiones que el modelo original bloquearía por políticas de seguridad. Esto lo convierte en una opción para entornos donde se requiere una generación de texto sin filtros, como investigación en seguridad de IA, análisis de contenido sensible o desarrollo de aplicaciones creativas no moderadas.

El modelo conserva la arquitectura y el tamaño del Llama 3.3 70B Instruct (70.553.706.560 parámetros), con soporte para 8 idiomas (inglés, francés, italiano, portugués, hindi, español, tailandés y alemán). Al estar en formato GGUF, puede ejecutarse en CPU o GPU mediante herramientas como llama.cpp, Ollama o LM Studio, con distintas opciones de cuantización que ajustan el consumo de memoria a cambio de precisión.

La relevancia de esta versión radica en su utilidad para desarrolladores e investigadores que necesitan un modelo de gran tamaño sin restricciones de contenido, ya sea para estudiar comportamientos de los LLM, generar datos sintéticos o construir aplicaciones donde la moderación automática sea un obstáculo. No obstante, su uso conlleva riesgos importantes, como la generación de contenido inapropiado o dañino, y debe manejarse con responsabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.3) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (diversas, con imatrix; ver repositorio) |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | Llama 3.3 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `huihui-ai/Llama-3.3-70B-Instruct-abliterated`, que a su vez deriva de `meta-llama/Llama-3.3-70B-Instruct`. La arquitectura es un transformer denso con atención causal estándar, típica de la serie Llama 3. No se dispone de detalles específicos sobre el entrenamiento de la versión abliterated, pero la técnica de abliteración consiste en identificar y eliminar la dirección en el espacio de activaciones responsable de los comportamientos de rechazo, sin necesidad de reentrenamiento completo. El resultado es un modelo que mantiene las capacidades de razonamiento y generación del original, pero sin los filtros de contenido.

La cuantización a GGUF se realizó con la herramienta `llama.cpp` y con matrices de importancia (imatrix), lo que optimiza la distribución de los pesos cuantizados para reducir la pérdida de calidad. No se ha publicado información sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en esta variante.

## Capacidades

- Generación de texto en 8 idiomas (inglés, francés, italiano, portugués, hindi, español, tailandés y alemán).
- Seguimiento de instrucciones y razonamiento conversacional, heredado de Llama 3.3 Instruct.
- Capacidad para responder a peticiones que el modelo original rechazaría, al haber sido eliminados los mecanismos de refusal.
- Soporte de contexto largo (el modelo base Llama 3.3 admite 128k tokens, aunque no se confirma en esta versión).
- No se especifican capacidades adicionales como tool calling, visión o audio en la información proporcionada; se asume que mantiene las del modelo base, pero no está verificado.

## Casos de uso

- **Generación de contenido creativo sin restricciones**: escritura de ficción, guiones, poesía o narrativa con temas sensibles que otros modelos bloquearían. La abliteración permite explorar tramas complejas sin interrupciones por políticas de contenido.
- **Investigación en seguridad de IA**: estudio de cómo los modelos responden a prompts maliciosos o provocadores, análisis de sesgos y comportamientos no moderados. Es útil para evaluar riesgos y desarrollar contramedidas.
- **Desarrollo de chatbots para nichos específicos**: asistentes para comunidades donde se requiere un tono libre o temas tabú (siempre que cumplan con la legalidad aplicable). El modelo puede integrarse en pipelines con herramientas como Ollama o llama.cpp.
- **Análisis de textos con contenido sensible**: procesamiento de documentos que contienen lenguaje explícito o temas delicados, donde un modelo moderado podría negarse a procesarlos. Útil en entornos controlados de investigación.
- **Fine-tuning adicional**: al ser un modelo de 70B, puede servir como base para ajuste fino con datasets específicos sin necesidad de lidiar con rechazos durante el entrenamiento.
- **Evaluación comparativa de modelos**: probar límites de seguridad y calidad de respuestas frente a otros modelos abliterated o el original, para documentar diferencias de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para una cuantización Q4_K_M (típica en GGUF), se estiman unos 40-45 GB de VRAM, por lo que se necesita una GPU con al menos 48 GB (p. ej., A6000, A100 40GB, o varias RTX 4090 con tensor parallelism).
- Para cuantizaciones más altas (Q8_0), la VRAM requerida supera los 70 GB, lo que obliga a usar múltiples GPU o soluciones de memoria compartida.
- En CPU, puede ejecutarse con llama.cpp, pero la velocidad será muy baja (del orden de 1-2 tokens/s) incluso con mucha RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con conversión a formato compatible), TGI.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Llama-3.3-70B-Instruct (original) | 70.6B | 128k (no confirmado) | Llama 3.3 Community | Safetensors |
| huihui-ai/Llama-3.3-70B-Instruct-abliterated | 70.6B | no disponible | Llama 3.3 Community | Safetensors |
| Justbackup/Llama-3.3-70B-Instruct-abliterated-GGUF | 70.6B | no disponible | Llama 3.3 Community | GGUF |

La principal diferencia entre el modelo original y el abliterated es la eliminación de los rechazos de contenido. Frente a otras versiones abliterated en formato GGUF, esta es una cuantización con imatrix, lo que puede ofrecer mejor calidad que cuantizaciones simples, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- **Ausencia de moderación de contenido**: el modelo puede generar respuestas dañinas, ilegales, violentas o sexualmente explícitas. No debe usarse en aplicaciones públicas sin supervisión humana.
- **Riesgo de alucinaciones**: como todos los LLM, puede inventar información, especialmente en temas especializados.
- **Licencia restrictiva**: la Llama 3.3 Community License exige que los productos con más de 700 millones de usuarios mensuales soliciten una licencia adicional a Meta. Además, cualquier redistribución debe incluir el aviso "Built with Llama".
- **Idiomas limitados**: aunque soporta 8 idiomas, la calidad puede ser inferior en idiomas menos representados en el entrenamiento.
- **Contexto no verificado**: aunque el modelo base soporta 128k tokens, no se ha confirmado que esta cuantización mantenga esa longitud sin degradación.
- **Uso responsable**: al ser una versión sin censura, su uso en entornos de producción conlleva riesgos legales y éticos. Se recomienda implementar filtros adicionales si se despliega públicamente.

## Enlaces

- Repositorio HuggingFace: [Justbackup/Llama-3.3-70B-Instruct-abliterated-GGUF](https://huggingface.co/Justbackup/Llama-3.3-70B-Instruct-abliterated-GGUF)
- Modelo base (abliterated): [huihui-ai/Llama-3.3-70B-Instruct-abliterated](https://huggingface.co/huihui-ai/Llama-3.3-70B-Instruct-abliterated)
- Modelo original de Meta: [meta-llama/Llama-3.3-70B-Instruct](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)
- Página en Featherless: [huihui-ai/Llama-3.3-70B-Instruct-abliterated](https://featherless.ai/models/huihui-ai/Llama-3.3-70B-Instruct-abliterated)
- Documentación de Llama 3.3: [https://www.llama.com/docs/overview](https://llama.com/docs/overview)

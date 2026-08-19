# mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q6_K-GGUF

## Resumen

Muse-Glimmer-30B-Heretic-Abliterated-Q6_K-GGUF es una cuantización GGUF en formato Q6_K del modelo Muse-Glimmer-30B, al que se le ha aplicado una técnica de "abliteración" (abliteration) para eliminar los rechazos a peticiones consideradas dañinas o inapropiadas. El modelo base, desarrollado por meta-models, es un transformer de aproximadamente 27.850 millones de parámetros (30B nominales) orientado a generación de texto conversacional. Esta versión, publicada por el usuario mlasli, está pensada para ejecutarse en local con llama.cpp u Ollama, ofreciendo un tamaño de archivo de unos 22 GB y una calidad de cuantización alta (Q6_K).

La relevancia de este modelo radica en su enfoque "uncensored": mediante el uso de la herramienta Heretic y 500 iteraciones de optimización con Optuna, se han reducido drásticamente las negativas del modelo (del 29% en la v1 al 6,5% en la v2) manteniendo una divergencia KL baja (0,076). Esto lo hace atractivo para desarrolladores que necesitan un asistente conversacional sin restricciones temáticas, aunque con las implicaciones éticas y legales que ello conlleva. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de ~30B, sin detalles publicados) |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (única publicada en este repositorio) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q6_K) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Muse-Glimmer-30B (no se especifica si es un transformer estándar, si usa atención lineal u otras innovaciones). Se sabe que es un modelo de aproximadamente 27.850 millones de parámetros, entrenado para generación de texto conversacional en inglés.

El proceso de abliteración aplicado en esta versión consiste en identificar direcciones de rechazo en el espacio de activaciones del modelo, utilizando los datasets `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca`. Con la herramienta Heretic y 500 trials de Optuna, se optimizó simultáneamente la reducción de rechazos y la divergencia KL respecto al modelo original. El mejor trial (Trial 445) logró un 6,5% de rechazos con una KL de 0,076. Los pesos de los adaptadores LoRA resultantes se fusionaron con el modelo base y posteriormente se convirtieron a formato GGUF mediante `convert_hf_to_gguf.py` y se cuantizaron a Q6_K con `llama-quantize`.

## Capacidades

- Generación de texto libre y conversacional en inglés.
- Modelo "uncensored": no rechaza peticiones sobre temas controvertidos (violencia, contenido adulto, etc.), aunque puede producir respuestas inexactas o inapropiadas.
- Soporte para ejecución local mediante llama.cpp y Ollama, con carga parcial en VRAM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chatbots sin restricciones temáticas: el modelo puede mantener conversaciones sobre cualquier tema sin negarse a responder, útil para proyectos de investigación sobre comportamientos de modelos sin filtros.
- Generación de contenido creativo: escritura de ficción, guiones o diálogos que aborden temas tabú o sensibles sin censura automática.
- Evaluación de técnicas de abliteración: investigadores pueden comparar el comportamiento de este modelo con la versión base para estudiar el impacto de la eliminación de rechazos en la calidad y seguridad.
- Prototipado rápido de asistentes conversacionales en local: gracias a su formato GGUF y su tamaño moderado (~22 GB), puede desplegarse en una estación de trabajo con suficiente RAM y VRAM.
- Pruebas de alineación y seguridad: al ser una variante "desalineada", sirve como caso de estudio para medir riesgos de sesgos y alucinaciones en modelos sin restricciones.
- Integración en pipelines de generación de texto donde se requiera máxima libertad de contenido, siempre que el caso de uso cumpla con la legislación aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas específicas del proceso de abliteración:

| Version | Refusals | Compliance | KL Divergence | Trials |
|---------|----------|------------|---------------|--------|
| v2 (actual) | 6,5% | 93,5% | 0,076 | 500 |
| v1 | 29% | 71% | 0,027 | 50 |

Estos datos indican una reducción del 88% en la tasa de rechazos entre v1 y v2, aunque la divergencia KL aumenta ligeramente (de 0,027 a 0,076), lo que sugiere que el modelo v2 se aleja más del comportamiento original del modelo base.

## Requisitos de hardware

- RAM mínima: ~22 GB para cargar el archivo GGUF completo en memoria.
- VRAM recomendada para offloading: 12-24 GB. Con 12 GB se puede cargar parcialmente en GPU y el resto en CPU; con 24 GB (p. ej., RTX 3090/4090) se puede cargar casi por completo.
- GPUs compatibles: cualquier GPU con al menos 12 GB de VRAM (RTX 3080/3090/4090, A100, etc.). Para uso exclusivo en CPU, se requiere un procesador con suficiente RAM y preferiblemente soporte AVX2.
- Opciones de despliegue: llama.cpp (línea de comandos), Ollama (creando un Modelfile), o servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se han publicado mediciones específicas. Con una RTX 4090 y carga completa en VRAM, se puede esperar una velocidad de generación de varios tokens por segundo, pero depende del hardware y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa objetiva con otros modelos de la misma categoría (modelos de ~30B abliterados o "uncensored"). El modelo base Muse-Glimmer-30B no tiene fichas públicas de benchmarks, y no se conocen alternativas directas con el mismo proceso de abliteración. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- El modelo está diseñado para no rechazar peticiones, lo que puede generar contenido ofensivo, ilegal o peligroso si se usa sin supervisión.
- La abliteración puede degradar la calidad general de las respuestas en comparación con el modelo original, como sugiere el aumento de la divergencia KL.
- Solo soporta inglés; no hay garantías de funcionamiento correcto en otros idiomas.
- No se conocen la longitud de contexto ni detalles de arquitectura, lo que dificulta predecir su comportamiento en tareas complejas o con contextos largos.
- Al ser una cuantización Q6_K, puede haber una ligera pérdida de precisión respecto al modelo BF16 original, aunque en la práctica suele ser mínima.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede violar normativas locales o términos de servicio de plataformas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-Q6_K-GGUF
- Modelo base (BF16) mencionado en la model card: https://huggingface.co/mlasli/Muse-Glimmer-30B-Heretic-Abliterated-BF16
- Herramienta Heretic utilizada para la abliteración: https://github.com/d3nd3/heretic

# LlamaPal/LFM2-2.6B-Q4_K_M-GGUF

## Resumen

LFM2-2.6B es un modelo de lenguaje de 2.569.272.320 parámetros desarrollado por Liquid AI, distribuido originalmente en su repositorio oficial y aquí empaquetado en formato GGUF con cuantización Q4_K_M por el usuario LlamaPal. El modelo emplea una arquitectura híbrida que, según la model card, ofrece respuestas hasta dos veces más rápidas que modelos comparables, lo que lo hace idóneo para inferencia en dispositivo (on-device) en telefonía móvil. Esta ficha describe la variante cuantizada publicada en LlamaPal/LFM2-2.6B-Q4_K_M-GGUF.

El repositorio no aporta modificaciones sobre los pesos originales: se trata de una copia sin alteraciones del fichero `LFM2-2.6B-Q4_K_M.gguf` del repositorio LiquidAI/LFM2-2.6B-GGUF, con el mismo hash SHA-256. Su función es servir como artefacto de descarga de la aplicación LlamaPal para Android, que ejecuta el modelo de forma totalmente offline. El tamaño del repositorio es de 1,6 GB.

La relevancia de esta variante radica en su empaquetado listo para consumo en llama.cpp y aplicaciones derivadas, con un tamaño que permite ejecución local en hardware móvil sin conexión. La licencia aplicable es la LFM Open License v1.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (según model card; detalles no disponibles) |
| Parámetros totales | 2.569.272.320 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card califica la arquitectura como híbrida y atribuye a esa decisión de diseño el rendimiento de hasta 2x en velocidad de respuesta frente a modelos comparables, pero no se especifican en la información disponible los detalles de la composición (proporción de capas de atención, capas recurrentes o de estado, etc.). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

No se dispone de información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, modos de razonamiento extendido ni mecanismos de tool calling). El único dato técnico verificable es el recuento de parámetros a partir de los pesos en safetensors del modelo base, y el hecho de que esta variante es una cuantización Q4_K_M sin modificaciones respecto al fichero original de Liquid AI.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `text-generation`, orientado a diálogo multi-turno.
- Inferencia offline en dispositivo: diseñado para ejecutarse localmente en Android sin conexión a internet ni cuenta de usuario.
- Compatibilidad con llama.cpp: al ser un GGUF estándar, carga en llama.cpp y en cualquier aplicación construida sobre él.
- Ejecución mediante la aplicación LlamaPal: integración directa como modelo descargable dentro de la app.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Chat conversacional offline en Android: el modelo se descarga desde LlamaPal y se ejecuta localmente, de modo que ninguna entrada del usuario sale del dispositivo; adecuado para consultas privadas sin conectividad.
- Asistente personal en movilidad: al no requerir red, resulta útil en entornos sin cobertura (transporte, zonas rurales, vuelos) para redacción de notas, resúmenes breves o corrección de texto.
- Prototipado rápido en llama.cpp: al ser un GGUF estándar de 1,6 GB, permite validar pipelines de inferencia local en portátiles y estaciones de trabajo antes de escalar a modelos mayores.
- Aplicaciones de escritorio con requisitos de privacidad: integrable en herramientas que procesan texto sensible (borradores legales, notas clínicas preliminares) donde no se permite el envío de datos a la nube.
- Educación y aprendizaje: despliegue en dispositivos de bajo coste para prácticas de ingeniería de prompts y evaluación de modelos pequeños sin depender de infraestructura cloud.
- Generación de texto en sistemas empotrados con llama.cpp: útil en escenarios de edge computing donde el presupuesto de memoria es reducido y se prioriza baja latencia sobre calidad máxima.
- Base para fine-tuning ligero: al tratarse de una cuantización Q4_K_M, sirve como referencia de rendimiento para comparar contra el modelo en precisión completa, aunque no es el formato adecuado para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB solo para los pesos en Q4_K_M; con overhead de contexto y runtime de llama.cpp, el consumo real se sitúa por encima de esa cifra (estimación no confirmada en la documentación).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: el tamaño de 1,6 GB permite, en principio, ejecución en GPUs de consumo con suficiente memoria, aunque no se documentan modelos concretos ni requisitos mínimos.
- Despliegue: llama.cpp y aplicaciones basadas en él (incluida LlamaPal para Android). No se documenta soporte para vLLM, TGI u otros servidores.
- Latencia y throughput: la model card afirma respuestas hasta 2x más rápidas que modelos comparables, sin cifras concretas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-2.6B Q4_K_M (esta ficha) | 2.569.272.320 | no disponible | GGUF | LFM Open License v1.0 | Hugging Face, LlamaPal |
| LiquidAI/LFM2-2.6B (base) | 2.569.272.320 | no disponible | safetensors (según recuento de parámetros) | LFM Open License v1.0 | Hugging Face |
| LiquidAI/LFM2-2.6B-GGUF (origen del fichero) | 2.569.272.320 | no disponible | GGUF | LFM Open License v1.0 | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoría (modelos pequeños para on-device), por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se aportan evaluaciones específicas ni tasas de error.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar un comportamiento multilingüe o conversaciones de contexto largo.
- Restricciones de licencia: se aplica la LFM Open License v1.0; debe consultarse el texto completo en el fichero LICENSE del repositorio y en el enlace oficial antes de cualquier uso comercial, ya que las condiciones no se detallan en la información disponible.
- Repositorio espejo: este repositorio no es el oficial de Liquid AI; solo replica el fichero original. Para soporte, actualizaciones y términos, debe acudirse al repositorio LiquidAI/LFM2-2.6B-GGUF.
- Cuantización Q4_K_M: implica pérdida de precisión respecto al modelo en precisión completa; no se documenta la degradación concreta en benchmarks.
- Sin métricas de producción: no hay datos publicados de latencia, throughput ni calidad medidos de forma independiente para esta variante.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/LlamaPal/LFM2-2.6B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Repositorio GGUF original: https://huggingface.co/LiquidAI/LFM2-2.6B-GGUF
- Fichero original (commit referenciado): https://huggingface.co/LiquidAI/LFM2-2.6B-GGUF/tree/a759abdc5955d4ca97763e5cb7ff3940589ba898
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/

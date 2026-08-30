# mfielding92/thefriend-27b-v3-qvo-GGUF

## Resumen

El modelo `thefriend-27b-v3-qvo-GGUF` es una versión cuantizada en formato GGUF del modelo base `mfielding92/thefriend-27b-v3-qvo`, desarrollado por Michael Fielding (mfielding92). Se trata de un modelo de lenguaje conversacional de aproximadamente 27 000 millones de parámetros, diseñado para ejecutarse localmente en hardware de consumo gracias a las cuantizaciones optimizadas con Unsloth Dynamic 2.0 (UD) y matriz de importancia (imatrix). Las recetas de cuantización se extrajeron del repositorio `unsloth/Qwen3.8-27B-GGUF`, lo que sugiere una estrecha relación con la arquitectura Qwen 3.8 de 27B, aunque el modelo base no documenta explícitamente su arquitectura interna.

La relevancia de este modelo radica en su capacidad para ofrecer un rendimiento de nivel medio-alto en tareas conversacionales y de generación de texto, con un tamaño que permite su despliegue en estaciones de trabajo con GPU de 24 GB o menos, dependiendo del nivel de cuantización elegido. Al estar disponible en varios formatos UD (Q2 a Q5), ofrece flexibilidad para ajustar el equilibrio entre calidad y consumo de memoria. El autor mantiene otros modelos similares en su perfil, como `SmartCode-Fable-5-CoT-Reasoning-QVO-Qwen-3.6-27B-Distilled-GGUF`, lo que indica una línea de trabajo enfocada en la optimización de modelos de 27B para uso local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente basada en Qwen 3.8, sin confirmar) |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el comando de ejemplo usa 16 384 tokens) |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q5_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base `thefriend-27b-v3-qvo`. Los únicos datos disponibles provienen de la model card de la versión GGUF, que indica que las recetas de cuantización Unsloth Dynamic 2.0 se han extraído de `unsloth/Qwen3.8-27B-GGUF` y que se ha aplicado una matriz de importancia (imatrix) del mismo repositorio. Esto sugiere que el modelo base podría ser un fine-tuning de Qwen 3.8 de 27B, pero no se confirma oficialmente. Tampoco hay información sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. La cuantización se realizó con la herramienta estándar `llama.cpp` aplicando overrides por tensor (`--tensor-type`), lo que permite un control fino sobre la precisión de cada capa.

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado como "conversational" y es adecuado para mantener diálogos multi-turno.
- Ejecucion local eficiente: gracias a las cuantizaciones UD, puede ejecutarse en hardware con VRAM limitada.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse en soluciones de servidor como vLLM o TGI.
- No se documentan capacidades específicas de tool calling, agentes, razonamiento multi-paso, visión o audio. Tampoco se especifican idiomas soportados.

## Casos de uso

- Chatbots locales para asistencia personal: al ser un modelo conversacional de 27B cuantizado, puede desplegarse en un equipo con GPU de 24 GB (con Q4_K_XL) para ofrecer respuestas de calidad sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones de lenguaje: los desarrolladores pueden usar las cuantizaciones Q3 o Q2 para iterar rápidamente en entornos con poca memoria, y luego escalar a Q5 para producción.
- Generacion de documentacion tecnica: el modelo puede redactar textos descriptivos, resúmenes o guías a partir de instrucciones en lenguaje natural, aprovechando su capacidad conversacional.
- Asistentes de soporte en entornos aislados: al ser un archivo GGUF autocontenido, es adecuado para entornos sin conexión a internet o con políticas estrictas de privacidad de datos.
- Experimentacion con cuantizaciones avanzadas: investigadores pueden analizar el impacto de las recetas Unsloth Dynamic 2.0 e imatrix en la calidad del modelo frente a cuantizaciones estándar.
- Integracion en pipelines de prueba con llama.cpp: el comando de ejemplo incluido en la model card permite probar el modelo rápidamente con parámetros de sampling recomendados (temp 0.6, top-p 0.95, top-k 20).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del quant elegido. Para un modelo de 27B, los tamaños aproximados de los archivos GGUF son: Q2_K_XL ~15-17 GB, Q3_K_XL ~18-20 GB, Q4_K_XL ~21-23 GB, Q5_K_M ~24-26 GB. El tamaño total del repositorio (63.6 GB) incluye todos los quants, no un solo archivo.
- GPU recomendadas: una RTX 4090 (24 GB) puede cargar el Q4_K_XL completo en GPU. Para Q5_K_M se necesitaría una GPU de 24 GB con descarga parcial a CPU o una GPU profesional como A6000 (48 GB). Para Q2/Q3, una RTX 3090 (24 GB) o incluso una RTX 4080 (16 GB) con offloading parcial podrían ser suficientes.
- Opciones de despliegue: llama.cpp (incluido en el ejemplo), así como cualquier runtime compatible con GGUF como Ollama, LM Studio o text-generation-webui. También puede usarse con servidores como llama.cpp-server o vLLM (si se convierte a otro formato).
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con Q4_K_XL, se puede esperar una velocidad de generación de 20-40 tokens/segundo, pero es una estimación orientativa basada en modelos similares de 27B, no un dato oficial.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la informacion proporcionada. El autor tiene otros dos modelos relacionados:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| thefriend-27b-v3-qvo-GGUF (este) | 27 B | no disponible | no disponible | GGUF |
| thefriend-27b-v2 | 27 B | no disponible | no disponible | no disponible |
| SmartCode-Fable-5-CoT-Reasoning-QVO-Qwen-3.6-27B-Distilled-GGUF | 27 B | no disponible | Apache-2.0 (pesos) | GGUF |

El modelo SmartCode-Fable-5 tiene una licencia Apache-2.0 para los pesos, mientras que el dataset de entrenamiento está restringido a uso personal y educativo (sin uso comercial). No se sabe si esta restricción aplica también a `thefriend-27b-v3-qvo`.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones lingüísticas del modelo.
- La licencia no está especificada, lo que supone un riesgo legal para uso comercial o en producción. Se recomienda contactar al autor antes de utilizarlo en entornos empresariales.
- Al ser una cuantización, existe una pérdida de calidad inevitable respecto al modelo original en precisión completa (FP16). Los quants más agresivos (Q2) pueden degradar notablemente la coherencia y el razonamiento.
- El contexto máximo no está documentado; el ejemplo usa 16 384 tokens, pero podría soportar más o menos. Se debe validar empíricamente.
- No hay garantías de soporte o mantenimiento: el autor tiene pocos repositorios y el modelo parece experimental.
- Los idiomas soportados no se indican; probablemente funcione mejor en inglés, pero no hay confirmación.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mfielding92/thefriend-27b-v3-qvo-GGUF
- Modelo base (safetensors): https://huggingface.co/mfielding92/thefriend-27b-v3-qvo
- Versión anterior (v2): https://huggingface.co/mfielding92/thefriend-27b-v2
- Modelo similar del autor (SmartCode-Fable-5): https://huggingface.co/mfielding92/SmartCode-Fable-5-CoT-Reasoning-QVO-Qwen-3.6-27B-Distilled-GGUF
- Perfil de GitHub del autor: https://github.com/mfielding92/
- Guía sobre Qwen3.8-27B (referencia indirecta): https://linas.substack.com/p/qwen3-8-27b-local-guide

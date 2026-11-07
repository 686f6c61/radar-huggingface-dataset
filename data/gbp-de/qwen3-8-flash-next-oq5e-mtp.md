# GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ5e-mtp es una cuantización de 5 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario GBP-DE bajo el ecosistema oMLX. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia local en Apple Silicon: parte de los pesos BF16 originales de Qwen y aplica una cuantización de precisión mixta (oQ5e) con grupo nominal de 64, preservando tanto el componente MTP (multi-token prediction) como las capacidades de visión del modelo base.

El objetivo declarado por el autor es mejorar la estabilidad de razonamiento y generación respecto a la variante oQ4e, manteniendo el modelo utilizable en un sistema Apple Silicon de 128 GB de memoria unificada mediante la técnica de SSD N-gram offload. El repositorio ocupa 128,6 GB y los pesos reales suman 179.999.981.459 parámetros, lo que sitúa al modelo base en la categoría de modelos densos de gran escala.

La relevancia actual es doble: por un lado, demuestra que es posible ejecutar localmente un modelo de ~180.000 millones de parámetros en hardware de consumo profesional (MacBook Pro con M5 Max); por otro, documenta de forma inusualmente detallada el compromiso entre precisión de cuantización y estabilidad en tareas de razonamiento restringido, con mediciones de throughput concretas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-Flash-Next); incluye componente N-gram/PLE y cabecera MTP |
| Parámetros totales | 179.999.981.459 |
| Parámetros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ5e (5 bits, precisión mixta, grupo nominal 64, dtype no cuantizado BF16) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de gran escala con un componente N-gram/PLE de tamaño considerable, según la model card, y una cabecera de predicción multi-token (MTP) que se conserva en esta cuantización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la documentación proporcionada.

La innovación técnica de esta ficha no está en el entrenamiento sino en el proceso de cuantización: oMLX 0.6.4 aplica cuantización de precisión mixta guiada por una matriz de importancia (imatrix) y una estimación de sensibilidad por tensor, usando Jundot/Qwen3.8-Flash-Next-oQ4e-mtp únicamente como modelo de sensibilidad. Se preservan explícitamente MTP y visión, y se incluye un informe de imatrix (`oq_imatrix_report.json`) en el repositorio. La model card menciona además técnicas de decodificación especulativa (Lightning MTP) y offload de N-gram a SSD como parte del stack de inferencia recomendado.

## Capacidades

- Generación de texto conversacional y de base (pipeline text-generation).
- Razonamiento multi-etapa, incluido modo "thinking" activable, según los tests de la model card.
- Resolución de problemas de restricciones (constraint satisfaction) con verificación de checksum.
- Simulación de sistemas con estado (benchmark de máquina de estados con cinco disparadores).
- Capacidades de visión preservadas en la cuantización.
- Predicción multi-token (MTP) preservada, habilitable como decodificación especulativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento local con restricciones: el modelo resolvió un puzzle de 8 personas, 8 horas, 8 colores y 24 restricciones con checksum correcto en modo thinking off, lo que lo hace adecuado para planificación de horarios y asignación de recursos verificable.
- Simulación de sistemas dinámicos: el benchmark de máquina de estados con cuatro reservas, cinco disparadores y seis transferencias demuestra utilidad para modelado de procesos con estado y validación de resultados.
- Inferencia privada en estación de trabajo: al ejecutarse íntegramente en un MacBook Pro con M5 Max y 128 GB, permite procesar datos sensibles sin salida a la nube.
- Prototipado de agentes con decodificación especulativa: la cabecera MTP preservada y Lightning MTP permiten acelerar la generación en bucles agénticos sobre hardware Apple.
- Tareas multimodales locales: la preservación de visión habilita análisis de documentos e imágenes en el mismo entorno de inferencia.
- Evaluación de cuantizaciones: el repositorio sirve como referencia para comparar oQ5e frente a oQ4e en estabilidad de razonamiento, con métricas de prefill y generación publicadas.
- Investigación sobre degradación por cuantización: los informes de imatrix y los tests comparativos permiten estudiar cómo la precisión de pesos afecta a tareas de razonamiento restringido.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor en un MacBook Pro con Apple M5 Max, 128 GB de memoria unificada, oMLX, SSD N-gram Offload y Lightning MTP activados. No son benchmarks estandarizados del modelo base.

| Prueba | Modo | Prefill (tok/s) | Generación (tok/s) | Resultado |
|---|---|---|---|---|
| Puzzle de restricciones 8×8×8, 24 restricciones | Thinking off | 276,9 | 69,7 | Solución exacta, checksum correcto |
| Puzzle de restricciones 8×8×8, 24 restricciones (oQ4e) | Thinking off | 226,3 | 65,8 | Fallo: hora duplicada, violaciones, checksum incorrecto |
| Máquina de estados con 5 disparadores | Thinking on | 220,2 | 43,4 | Correcto en los cinco disparadores, transferencias y niveles finales (505 s de thinking, 520,3 s totales) |

Memoria total del sistema durante generación: ~102 GB con este modelo frente a ~93 GB con oQ4e (diferencia de ~9 GB). No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks equivalentes en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: ~102 GB de memoria total del sistema en generación activa con contexto corto; el modelo pesa 125,7 GB en disco y requiere SSD N-gram Offload para caber en 128 GB.
- GPU recomendadas: Apple Silicon de 128 GB (probado en M5 Max). Para GPUs NVIDIA no hay datos publicados; el formato mlx no es compatible con CUDA sin conversión.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en configuraciones por debajo de 128 GB de memoria unificada sin offload agresivo a disco.
- Despliegue: oMLX (probado con 0.6.4), con SSD N-gram Offload y Lightning MTP activados. vLLM, llama.cpp, Ollama y TGI no están soportados de forma nativa para pesos MLX.
- Latencia y throughput: prefill de 220-277 tok/s y generación de 43-70 tok/s según la tarea y el modo thinking. Los requisitos de memoria crecen con la longitud de contexto y el uso de KV-cache.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Memoria en generación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp | 180,0 B | oQ5e, 5 bits | ~102 GB | qwen-community-1.0 | Hugging Face, MLX |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | 180,0 B | oQ4e, 4 bits | ~93 GB | qwen-community-1.0 | Hugging Face, MLX |
| GBP-DE/Qwen3.8-Flash-Next-oQ5e-WLSRefit-MTP | 180,0 B | oQ5e con WLS Refit | no disponible | qwen-community-1.0 | Hugging Face, MLX |
| GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP | 180,0 B | oQ4e con WLS Refit | no disponible | qwen-community-1.0 | Hugging Face, MLX |

Las variantes WLSRefit se reconstruyeron con oMLX 0.7.3, con calibración oQe revisada, cuantización sensible a la importancia actualizada y asignación de precisión refinada, según la model card. No se dispone de comparativas frente a modelos de otros autores.

## Limitaciones y advertencias

- Es una cuantización, no un modelo original: la precisión de pesos es inferior a BF16 y puede degradar tareas de razonamiento no cubiertas por los tests del autor.
- El propio autor reconoce que oQ4e fue más rápido en algunas cargas y que hubo empates; los resultados presentados no son exhaustivos.
- Los benchmarks son mediciones caseras en un único sistema (M5 Max, 128 GB), no reproducibles en otras configuraciones sin recalibrar.
- El modelo solo es práctico con SSD N-gram Offload; sin esa técnica no cabe en 128 GB.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; debe revisarse el enlace de licencia antes de desplegar en producción.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Idiomas soportados: no disponibles; no se puede asumir cobertura multilingüe.
- Compatibilidad limitada: formato MLX, no utilizable directamente en stacks CUDA/vLLM.
- El repositorio principal aloja la cuantización original con oMLX 0.6.4; las versiones reconstruidas con 0.7.3 están en repositorios separados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp
- Árbol de archivos: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/raw/main/LICENSE
- Variante oQ5e WLSRefit MTP: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ5e-WLSRefit-MTP
- Variante oQ4e WLSRefit MTP: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP
- Modelo de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp

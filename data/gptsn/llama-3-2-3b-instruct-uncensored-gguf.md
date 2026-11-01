# Gptsn/Llama-3.2-3B-Instruct-uncensored-GGUF

## Resumen

Llama-3.2-3B-Instruct-uncensored-GGUF es una versión cuantizada en formato GGUF de un fine-tune "uncensored" de Llama 3.2 3B Instruct, publicado por el usuario Gptsn en HuggingFace. El modelo base es tostideluxekaas/Llama-3.2-3B-Instruct-uncensored, a su vez derivado de unsloth/Llama-3.2-3B-Instruct de Meta. El objetivo del proyecto es eliminar los mecanismos de rechazo (refusals) del modelo original mediante técnicas de abliteration, manteniendo la calidad general del modelo gracias a una divergencia KL baja (0.0265) respecto al modelo original.

El modelo conserva las capacidades multilingües del Llama 3.2 3B Instruct original y está orientado a casos de uso donde los filtros de seguridad impiden tareas legítimas de investigación o generación de contenido. Según el autor, en las pruebas realizadas solo se registraron 4 rechazos de cada 100 peticiones. Al tratarse de un modelo de 3.200 millones de parámetros en formato GGUF, es ejecutable en hardware de consumo, incluidos portátiles y GPUs modestas, lo que lo hace accesible para experimentación local. Cabe destacar que el autor es un estudiante de ciencia de datos e IA que publica el modelo con fines de investigación, y advierte explícitamente de que un modelo sin censura no es un modelo sin sesgos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2) |
| Parámetros totales | 3.212.749.888 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Llama 3.2 3B Instruct usa 128.000 tokens) |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q8_0, f16 |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | Llama 3.2 Community License (llama3.2) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 3B Instruct, un transformer decoder de la familia Llama de Meta optimizado para instrucciones. Sobre esa base, tostideluxekaas aplicó un proceso de abliteration (también referido como decensoring), una técnica que modifica los pesos del modelo para suprimir las direcciones internas asociadas a los rechazos, sin necesidad de reentrenamiento completo. Según el autor, la divergencia KL resultante respecto al modelo original es de 0.0265, un valor bajo que indica que las capacidades generales del modelo se han preservado en gran medida.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. La versión aquí descrita es una cuantización GGUF de ese fine-tune, con cuatro niveles de precisión disponibles (Q4_K_M, Q5_K_M, Q8_0 y f16). No se han publicado detalles adicionales sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional siguiendo instrucciones (pipeline text-generation, formato conversacional)
- Capacidades multilingües heredadas de Llama 3.2 3B Instruct, con el inglés como idioma principal
- Generación de contenido sin mecanismos de rechazo: solo 4 rechazos de cada 100 en las pruebas del autor
- Preservación de la calidad general del modelo base gracias a la baja divergencia KL (0.0265)
- Compatibilidad con herramientas de inferencia locales: Ollama, LM Studio y cualquier runtime compatible con GGUF (llama.cpp)
- No se ha documentado soporte específico de tool calling, agentes, visión ni audio en la información disponible

## Casos de uso

- Investigación en alineamiento y seguridad de LLMs: al ser un modelo abliterado con divergencia KL documentada (0.0265), es útil como sujeto de estudio para analizar cómo la abliteration afecta a las representaciones internas y al comportamiento del modelo.
- Estudio de mecanismos de rechazo: permite comparar las activaciones internas del modelo original y la versión abliterada para localizar las direcciones de refusal en el espacio latente.
- Escritura creativa sin filtros: generación de ficción con contenido maduro o sensible que el modelo original bloquearía, ejecutable localmente en un portátil gracias a la cuantización Q4_K_M (2,02 GB).
- Prototipado local en hardware modesto: con requisitos de 3-4 GB de VRAM en Q4_K_M, cabe en GPUs de consumo y en Apple Silicon, adecuado para pruebas rápidas de ideas sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: al disponer de cuatro niveles (Q4_K_M a f16), sirve de banco de pruebas para medir la degradación de calidad por cuantización en un modelo abliterado.
- Generación de datasets de investigación: producción de respuestas a prompts sensibles con fines de análisis, moderación o construcción de clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo de rendimiento aportado por el autor es la tasa de rechazo: 4 de cada 100 peticiones en sus pruebas, y la divergencia KL de 0.0265 respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia según la tabla del autor:
  - Q4_K_M (2,02 GB): 3-4 GB de VRAM
  - Q5_K_M (2,32 GB): 4-5 GB de VRAM
  - Q8_0 (3,42 GB): 5-6 GB de VRAM
  - f16 (6,43 GB): 8 GB o más de VRAM
- GPUs recomendadas: cualquier GPU de consumo con la VRAM indicada (por ejemplo, RTX 3060 de 12 GB, RTX 4060, RTX 4090); también ejecutable en CPU o Apple Silicon gracias al formato GGUF
- Cabe holgadamente en GPUs de consumo: incluso la variante f16 funciona en una RTX 4070 o superior, y Q4_K_M funciona incluso sin GPU dedicada
- Opciones de despliegue: Ollama (con comando de ejecución directa desde HuggingFace), LM Studio, llama.cpp y cualquier runtime compatible con GGUF; no se menciona soporte para vLLM o TGI con este formato
- Latencia y throughput: no disponibles

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Gptsn/Llama-3.2-3B-Instruct-uncensored-GGUF | 3,21 B | GGUF (Q4_K_M a f16) | Llama 3.2 Community | Abliterado, KL 0.0265, 4/100 refusals |
| unsloth/Llama-3.2-3B-Instruct (base) | 3,21 B | safetensors, GGUF | Llama 3.2 Community | Modelo original con filtros de seguridad |
| tostideluxekaas/Llama-3.2-3B-Instruct-uncensored | 3,21 B | safetensors | Llama 3.2 Community | Fine-tune original del que deriva esta versión GGUF |

Frente al modelo original de Meta, esta versión elimina casi por completo los rechazos manteniendo la calidad general según la divergencia KL reportada. Frente a otras variantes uncensored de la comunidad (no disponibles en la información proporcionada para comparación detallada), destaca por documentar la divergencia KL y la tasa de rechazo, aunque carece de benchmarks estandarizados.

## Limitaciones y advertencias

- El propio autor advierte de que un modelo uncensored no es un modelo sin sesgos: puede producir salidas sesgadas o alucinaciones igual que el modelo base
- Al estar abliterado, puede generar contenido dañino, ilegal, ofensivo o inapropiado; el autor declara que el usuario es el único responsable de las salidas y sus consecuencias
- Riesgo de alucinación inherente a un modelo de 3B de parámetros, sin mitigaciones documentadas
- La abliteration puede degradar sutilmente el razonamiento y la fiabilidad del modelo, incluso con divergencia KL baja; no hay benchmarks que cuantifiquen esa degradación
- La licencia es la Llama 3.2 Community License de Meta, que impone restricciones de uso (límites de usuarios mensuales para uso comercial sin licencia adicional, política de uso aceptable); no es una licencia totalmente permisiva
- Publicado por un estudiante como proyecto de investigación: sin mantenimiento garantizado, sin evaluación formal y con muy pocas descargas (268) y cero likes en el momento de la ficha
- No apto para producción en entornos que requieran garantías de seguridad o cumplimiento normativo

## Enlaces

- Modelo GGUF: https://huggingface.co/Gptsn/Llama-3.2-3B-Instruct-uncensored-GGUF
- Modelo original (safetensors): https://huggingface.co/tostideluxekaas/Llama-3.2-3B-Instruct-uncensored
- Modelo base de Unsloth: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/download

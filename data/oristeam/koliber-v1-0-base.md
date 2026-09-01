# OrisTeam/Koliber-v1.0-Base

## Resumen

Koliber v1.0 Base es un modelo de lenguaje causal (decoder-only) desarrollado por OrisTeam, entrenado desde cero específicamente para el idioma polaco. Se trata de un modelo base, no ajustado para instrucciones, pensado para completar texto y como punto de partida para fine-tuning, preferencia o investigación. Su tamaño compacto (alrededor de 126 millones de parámetros según la model card, aunque los pesos en safetensors ocupan 150,7 millones) y su ventana de contexto de 1536 tokens lo hacen adecuado para entornos con recursos limitados.

El modelo incorpora innovaciones técnicas como atención con GQA (Grouped Query Attention), posiciones rotatorias RoPE, activación SwiGLU y normalización RMSNorm, además de un objetivo auxiliar de predicción de estados futuros durante el entrenamiento que no añade parámetros en inferencia. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que facilita su adopción en proyectos privados.

A pesar de su pequeño tamaño, Koliber v1.0 Base demuestra una capacidad de generación coherente en polaco, como se muestra en los ejemplos cualitativos de la model card, aunque no se han publicado resultados de benchmarks cuantitativos. Es una opción interesante para quienes necesitan un modelo ligero y especializado en polaco, ya sea para prototipado rápido o como base para tareas específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (GQA, RoPE, SwiGLU, RMSNorm, sin bias, LM head tied) |
| Parametros totales | 150.719.232 (según safetensors; la model card declara 126.044.928) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1536 tokens |
| Tipos de cuantizacion | No disponible (no se mencionan en la documentación) |
| Idiomas soportados | Polaco (principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, requiere `trust_remote_code=True` en transformers |

## Arquitectura y entrenamiento

Koliber v1.0 Base es un transformer decoder-only con 12 capas, hidden size de 768, 12 cabezas de consulta y 2 cabezas de clave/valor (GQA), dimensión de cabeza de 64 y FFN de 3072. Usa RoPE para codificación posicional, SwiGLU como activación, RMSNorm para normalización y no emplea sesgos. El LM head está atado a las embeddings, lo que reduce el número de parámetros.

El entrenamiento se realizó desde cero con 2.534.400.000 tokens (~2.534B), principalmente en polaco. Además de la pérdida estándar de predicción del siguiente token, se utilizó un objetivo auxiliar de predicción de estados ocultos futuros: una cabeza entrenable predice la representación oculta aproximadamente 128 tokens adelante, muestreada cada 32 tokens, mediante una proyección de bajo rango de 192 dimensiones y pérdida de distancia coseno. El peso de esta pérdida auxiliar fue 0.03, combinado como `L = L_NTP + 0.03 × L_future`. Esta cabeza auxiliar no forma parte del modelo de inferencia y no añade parámetros en tiempo de ejecución.

## Capacidades

- Generación de texto en polaco: completado de prefijos naturales, coherente y con cierta fluidez, como muestran los ejemplos de la model card.
- Modelo base: no está alineado ni ajustado para instrucciones, por lo que no responde a prompts de chat; es adecuado para completar texto o como base para fine-tuning.
- Fine-tuning: al ser un modelo base, puede ser adaptado mediante SFT, DPO o entrenamiento continuado para tareas específicas en polaco.
- Bajo coste computacional: su tamaño reducido permite ejecutarlo en hardware modesto, incluso en CPU.
- Sin soporte de tool calling, visión, audio ni otras modalidades: es exclusivamente texto.
- Capacidad multilingüe limitada: aunque entrenado principalmente en polaco, puede generar algo en otros idiomas, pero con calidad inferior.

## Casos de uso

- Completado de texto en polaco: el modelo puede usarse para autocompletar frases o párrafos en aplicaciones de escritura asistida, como editores de texto o herramientas de redacción, gracias a su capacidad de generar continuaciones coherentes a partir de prefijos.
- Fine-tuning para clasificación de texto en polaco: al ser un modelo base, puede ajustarse para tareas como análisis de sentimiento, detección de spam o categorización de documentos, aprovechando su representación del lenguaje polaco.
- Generación de contenido creativo en polaco: puede emplearse para generar borradores de artículos, cuentos o guiones, aunque requiere supervisión y filtrado debido a su naturaleza no alineada.
- Prototipado rápido de aplicaciones NLP: su tamaño compacto y licencia permisiva permiten experimentar con arquitecturas y técnicas de fine-tuning sin grandes requisitos de hardware, ideal para investigación o pruebas de concepto.
- Entrenamiento de modelos más grandes: puede servir como punto de partida para continuar el preentrenamiento con dominios específicos (por ejemplo, legal, médico) en polaco, dado que ya ha aprendido patrones lingüísticos generales.
- Educación y experimentación: su código abierto y su diseño sencillo (GQA, RoPE, SwiGLU) lo convierten en un buen candidato para estudiar el comportamiento de modelos pequeños o para probar técnicas de alineación y regularización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye ejemplos cualitativos de generación comparados con Azurro/APT3-275M-Base, sin métricas numéricas. Por tanto, no es posible evaluar su rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 150,7 millones de parámetros, en fp16 ocupa aproximadamente 300 MB, más overhead de activaciones y memoria del optimizador. En cuantización de 4 bits, el modelo puede caber en menos de 100 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, como NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas modernas. También puede ejecutarse en CPU con razonable velocidad para generación de pocos tokens.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF. También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se han publicado datos específicos, pero por su tamaño, se espera una latencia de decodificación de milisegundos por token en GPU moderna y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Koliber v1.0 Base | 126M (150M safetensors) | 1536 | Polaco | Apache 2.0 | Entrenado desde cero, con objetivo auxiliar |
| Azurro/APT3-275M-Base | 275M | No disponible | Polaco | No disponible | Modelo base más grande, mencionado en la model card como comparación cualitativa |
| Otros modelos pequeños en polaco | No disponible | No disponible | Polaco | No disponible | No se dispone de información adicional en la búsqueda |

La comparativa se limita a APT3-275M-Base, que aparece en la model card. No se han encontrado otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo no alineado: al ser un modelo base, puede generar contenido falso, ofensivo, sesgado o inapropiado. No debe usarse en producción sin filtros y salvaguardas adicionales.
- Riesgo de alucinación: puede inventar hechos, nombres, citas, fechas, números o fuentes, como se advierte en la model card.
- Contexto limitado: la ventana de 1536 tokens es corta para tareas que requieren dependencias de largo alcance.
- Idioma: entrenado principalmente en polaco; su rendimiento en otros idiomas es limitado y no garantizado.
- Sin soporte de instrucciones: no responde a prompts de chat ni sigue instrucciones; solo completa texto.
- Requiere `trust_remote_code=True`: al usar código personalizado, hay que confiar en el repositorio, lo que implica un riesgo de seguridad si se desconoce el origen.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas estándar, lo que dificulta la evaluación objetiva.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OrisTeam/Koliber-v1.0-Base)
- [Versión Preview en Hugging Face](https://huggingface.co/OrisTeam/Koliber-v1.0-Base-Preview)

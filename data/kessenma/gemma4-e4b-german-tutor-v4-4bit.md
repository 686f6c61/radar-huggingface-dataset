# kessenma/gemma4-e4b-german-tutor-v4-4bit

## Resumen

`kessenma/gemma4-e4b-german-tutor-v4-4bit` es un fine-tune QLoRA del modelo `google/gemma-4-e4b-it` de Google, especializado en corrección gramatical y tutoría de alemán como lengua extranjera. El autor, kessenma, lo ha cuantizado a 4 bits (group size 64, affine) y lo ha empaquetado en formato MLX para su uso en dispositivos Apple (iOS y macOS) dentro de una aplicación de tarjetas de memoria (flashcards). El modelo responde con un contrato de salida estructurado: `OK` si la frase del estudiante es correcta, o `FIX`, `WHY` y `HINT` para corregir, explicar y guiar al aprendiz.

Con 1.639.679.306 parámetros (aproximadamente 1,64 mil millones), es un modelo compacto diseñado para inferencia en dispositivo, sin depender de la nube. Su relevancia actual radica en la combinación de un modelo base multimodal de Google (Gemma 4 E4B) con un ajuste fino específico para una tarea pedagógica concreta, logrando un equilibrio entre precisión gramatical y naturalidad conversacional. La versión v4 mejora respecto a la v1 en la reducción de falsas correcciones (del 6% al 3%) y en la naturalidad del lenguaje, aunque deja pasar más errores reales (16% frente al 9% de v1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 E4B (transformer multimodal, fine-tune solo texto) |
| Parametros totales | 1.639.679.306 (1,64 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (group size 64, affine) |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Gemma (license:gemma) |
| Formato de pesos | safetensors (single-shard), compatible con MLX |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e4b-it`, un modelo de la familia Gemma 4 de Google con 1,64 B parámetros y capacidades multimodales (imagen-texto). Sobre este base se aplicó un fine-tune QLoRA (Low-Rank Adaptation cuantizada) con 42.841 filas de instrucción (corpus v4). Los datos de entrenamiento fueron generados por profesores: correcciones gramaticales balanceadas al 70% de correcciones y 30% de frases correctas, distribuidas en 15 fenómenos gramaticales del alemán, más una parte conversacional para ajustar el registro coloquial. La generación de datos se realizó con gemma-4-31B (para la mayor parte) y Claude Sonnet (para fenómenos que requieren juicio), y cada fila pasó validación con LanguageTool y spaCy, además de compuertas de forma específicas por fenómeno.

No se menciona el uso de RLHF o DPO; el entrenamiento se basa únicamente en el ajuste supervisado con QLoRA. La cuantización a 4 bits se aplicó posteriormente para reducir el tamaño y permitir inferencia en dispositivo con MLX. El adaptador LoRA no se incluye en este repositorio; se archiva por separado con la fusión en fp16.

## Capacidades

- Corrección gramatical de frases en alemán: detecta errores y devuelve la versión corregida.
- Explicación de errores: genera una línea de explicación (`WHY`) para cada corrección.
- Generación de pistas pedagógicas: produce preguntas (`HINT`) que guían al estudiante sin dar la respuesta directa.
- Conversación en alemán coloquial: usa partículas modales (por ejemplo, "doch", "ja", "mal") con una frecuencia de 12,4 por cada 100 tokens, frente a 2,8 en la v1, lo que mejora la naturalidad.
- Clasificación binaria de corrección: responde `OK` cuando la frase es correcta, evitando falsas correcciones (3% en v4 frente a 6% en v1).
- Multilingüismo limitado: aunque el modelo base es bilingüe (de, en), el fine-tune está orientado exclusivamente al alemán; no se documentan capacidades de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Aplicación de aprendizaje de alemán con tarjetas de memoria: el modelo se integra en una app iOS de flashcards para corregir frases escritas por el estudiante y ofrecer retroalimentación inmediata, gracias a su tamaño reducido y cuantización 4-bit que permite ejecución local.
- Tutor de gramática en tiempo real: un estudiante escribe una frase y el modelo responde con `OK` o con `FIX`, `WHY` y `HINT`, lo que facilita la práctica autónoma sin necesidad de un profesor humano.
- Práctica conversacional en alemán: el modelo mantiene diálogos informales con partículas modales y registro coloquial, útil para mejorar la fluidez oral y escrita.
- Corrección de textos en entornos educativos: profesores o plataformas de e-learning pueden usar el modelo para pre-corregir redacciones de estudiantes antes de la revisión manual, reduciendo carga de trabajo.
- Generación de ejercicios de gramática: a partir de frases incorrectas, el modelo puede producir variantes corregidas y explicaciones, sirviendo como generador de material didáctico.
- Asistente de escritura para aprendices de alemán: integrado en un editor de texto, el modelo sugiere correcciones y explica errores, ayudando a mejorar la precisión gramatical en correos, ensayos o mensajes.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluaciones internas con suites congeladas de JSON, siguiendo la convención "app-guard" (solo cuenta si el parser de la app mostraría la respuesta al estudiante). No se publican benchmarks estándar como MMLU, HumanEval o GSM8K.

| Suite | Items | v4 | v1 (superado) |
|---|---|---|---|
| Gramática central (v0) | 60 | 51 (85%) | 54 (90%) |
| Extensión (v1ext) | 61 | 56 (92%) | 57 (93%) |
| Holdout (v2) | 82 | 75 (91%) | 70 (85%) |
| Combinado | 203 | 182 (90%) | 181 (89%) |

Comparación por pares frente a v1: 170/203 coinciden, 11 items solo los acierta v1, 12 solo v4 (p exacta de McNemar = 1,0). La capacidad gramatical es equivalente; las diferencias son conductuales: falsas correcciones 3% (v1: 6%), errores no detectados 16% (v1: 9%), naturalidad conversacional con partículas modales 12,4 por 100 tokens (v1: 2,8) y repetición de 4-gramas 0,10 (v1: 0,30).

## Requisitos de hardware

- VRAM estimada: con cuantización 4-bit, los pesos ocupan aproximadamente 0,82 GB (1,64 B × 0,5 bytes), más overhead de activaciones y KV cache; se estima un uso total de 1-2 GB en inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3050, RTX 4060, Apple Silicon con memoria unificada de 8 GB o superior).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y en dispositivos Apple Silicon gracias a MLX.
- Opciones de despliegue: MLX (librería `mlx-vlm` o `mlx-swift-lm` para iOS/macOS), también puede ejecutarse con frameworks que soporten safetensors y cuantización 4-bit (por ejemplo, llama.cpp con conversión GGUF, aunque no se proporciona en este repo).
- Latencia y throughput: no se han publicado datos oficiales; al ser un modelo de 1,64 B en 4-bit, se espera una latencia de decenas de milisegundos por token en hardware moderno, pero no se puede confirmar sin mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kessenma/gemma4-e4b-german-tutor-v4-4bit (este) | 1,64 B | 4-bit MLX | Tutor de gramática alemana | Gemma | Hugging Face |
| kessenma/gemma4-e4b-german-tutor-4bit (v1) | 1,64 B | 4-bit MLX | Tutor de gramática alemana | Gemma | Hugging Face |
| google/gemma-4-e4b-it (base) | 1,64 B | fp16 (original) | Modelo multimodal general | Gemma | Hugging Face / Google |

La comparación con v1 muestra que v4 reduce falsas correcciones y mejora la naturalidad, pero deja pasar más errores. Frente al modelo base, el fine-tune añade el contrato de salida estructurado y el conocimiento gramatical específico, a costa de perder generalidad. No se dispone de información sobre otros modelos de corrección gramatical alemana comparables en el mismo rango de tamaño.

## Limitaciones y advertencias

- Sesgos: al ser entrenado con datos generados por modelos de IA (gemma-4-31B y Claude Sonnet), puede heredar sesgos de esos modelos, aunque no se han documentado casos concretos.
- Riesgo de alucinación: como todo modelo generativo, puede producir explicaciones o correcciones incorrectas, especialmente en fenómenos gramaticales poco frecuentes.
- Limitaciones de contexto: no se especifica la longitud de contexto; se recomienda verificar la documentación de Gemma 4 E4B para usos con entradas largas.
- Restricciones de licencia: la licencia Gemma incluye términos de uso aceptable que prohíben ciertos usos (por ejemplo, actividades ilegales, vigilancia masiva); es necesario revisar los términos completos antes de uso comercial.
- Caveat de producción: el modelo está diseñado para un contrato de salida específico (`OK`/`FIX`/`WHY`/`HINT`); usarlo fuera de ese formato puede degradar su rendimiento. Además, v4 deja pasar más errores reales que v1 (16% frente a 9%), lo que debe tenerse en cuenta en entornos donde la precisión de detección sea crítica.
- El adaptador LoRA no está incluido en este repositorio; solo se distribuye la versión cuantizada fusionada, lo que limita la personalización posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kessenma/gemma4-e4b-german-tutor-v4-4bit
- Versión v1 (superada): https://huggingface.co/kessenma/gemma4-e4b-german-tutor-4bit
- Variante e2b del mismo autor: https://huggingface.co/kessenma/gemma4-e2b-german-tutor-4bit
- Modelo base (Google): https://huggingface.co/google/gemma-4-e4b-it
- Página oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core?hl=de
- Gemma 4 E4B en Ollama: https://ollama.com/library/gemma4:e4b

# ApolloRaines/Llama-3.1-8B-Instruct-Full-Suppress

## Resumen

Llama-3.1-8B-Instruct-Full-Suppress es una variante del modelo Meta Llama-3.1-8B-Instruct modificada mediante técnicas de representation engineering, concretamente con la herramienta jBlaze. El autor, ApolloRaines, extrajo direcciones representacionales del espacio de pesos usando análisis de activaciones contrastivas (SVD sobre activaciones pareadas) y aplicó proyecciones ortogonales para suprimir comportamientos específicos: rechazo de respuestas, verbosidad, ambigüedad y emoción. No se realizó ningún fine-tuning ni entrenamiento adicional; los cambios son puramente proyecciones en el espacio de pesos.

El modelo resultante es un generador de texto conversacional que responde de forma directa, concisa y sin negativas, manteniendo la arquitectura original de 8.000 millones de parámetros. Está pensado para desarrolladores e investigadores interesados en explorar cómo la manipulación de direcciones representacionales altera el comportamiento de un LLM sin reentrenamiento. Al estar basado en Llama-3.1-8B-Instruct, hereda sus capacidades lingüísticas y de razonamiento, aunque el proceso de supresión puede afectar a la naturalidad y matices de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (32 capas, 8.0B parámetros) |
| Parametros totales | 8.030.261.248 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura transformer de Llama-3.1-8B-Instruct, con 32 capas y 8.000 millones de parámetros. La modificación se realizó mediante jBlaze, una herramienta de representation engineering que extrae direcciones representacionales usando análisis de activaciones contrastivas (SVD sobre pares de activaciones). Se aplicaron proyecciones ortogonales en el arm A3 (attention y todas las capas MLP) para suprimir cuatro direcciones: refusal (m=2.0), verbosity (m=2.0), hedging (m=1.0) y emotion (m=2.0). No hubo fine-tuning ni entrenamiento adicional; el proceso es puramente una transformación de pesos.

## Capacidades

- Generación de texto conversacional e instructivo, similar al modelo base.
- Respuestas directas y concisas, con supresión de rechazos, rodeos y expresiones emocionales.
- Razonamiento básico y resolución de problemas, como se muestra en los ejemplos de la model card (operaciones aritméticas, funciones de Python, explicaciones científicas).
- Soporte de chat multi-turno mediante el template de Llama-3.1-Instruct.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar consultas frecuentes con respuestas breves y directas, reduciendo la ambigüedad y el tiempo de espera, gracias a la supresión de verbosidad y hedging.
- Generación de documentación técnica: útil para producir descripciones concisas de APIs, funciones o procedimientos, donde se requiere precisión y ausencia de florituras.
- Asistencia en programación: puede proporcionar fragmentos de código y explicaciones sin rodeos, adecuado para entornos de desarrollo donde se busca eficiencia.
- Análisis de datos y cálculos: respuestas numéricas y lógicas directas, como operaciones aritméticas o consultas de hechos, sin divagaciones.
- Educación y tutoría: explicaciones claras y sin ambigüedad para conceptos científicos o matemáticos, aunque con riesgo de simplificaciones excesivas.
- Investigación en representation engineering: sirve como caso de estudio para analizar cómo la supresión de direcciones afecta al comportamiento del modelo, permitiendo comparaciones con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parámetros en bf16, ocupa aproximadamente 16 GB de memoria. Con cuantización a 8 bits o 4 bits (no incluida en el repositorio) se podría reducir, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como RTX 4080, RTX 4090, A100 o H100. También puede ejecutarse en CPU con suficiente RAM (más de 32 GB) usando llama.cpp.
- Opciones de despliegue: compatible con transformers de Hugging Face, vLLM, TGI y llama.cpp (si se convierte a GGUF). No hay soporte nativo para Ollama, pero puede convertirse.
- Latencia y throughput: no hay datos específicos; para 8B en bf16 en una GPU moderna se espera una velocidad de generación de 20-50 tokens/s, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Estructuralmente es idéntico a Llama-3.1-8B-Instruct, pero con modificaciones de comportamiento. No hay datos de rendimiento para comparar con otras variantes de representation engineering.

## Limitaciones y advertencias

- Modelo sin censura: la supresión de refusal puede llevar a generar contenido inapropiado, peligroso o ilegal si se le solicita. No debe usarse en producción sin supervisión humana o filtros adicionales.
- Posible degradación de calidad: la proyección de pesos puede afectar a la coherencia, creatividad o precisión en tareas complejas, aunque no se han documentado problemas concretos.
- Sesgos y alucinaciones: al ser una modificación del modelo base, hereda los sesgos de Llama-3.1-8B-Instruct, y la supresión de hedging puede aumentar la confianza en respuestas incorrectas.
- Idiomas limitados: solo se declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia: la Llama 3.1 Community License permite uso comercial, pero con restricciones (por ejemplo, no usar para mejorar otros modelos grandes).
- Sin evaluación formal: no hay benchmarks publicados, por lo que el rendimiento real es desconocido y debe validarse antes de cualquier uso crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Full-Suppress
- Repositorio de jBlaze: https://github.com/apolloraines/jblaze
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct

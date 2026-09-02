# mradermacher/Al-Khwarizmi-3B-GGUF

## Resumen

Al-Khwarizmi-3B-GGUF es una colección de cuantizaciones GGUF del modelo Al-Khwarizmi-3B, un ajuste fino de SmolLM3-3B especializado en razonamiento matemático y conversación multilingüe. El autor original es mzoelfakar, y la versión GGUF estática la publica mradermacher, conocido por generar cuantizaciones listas para usar en entornos de producción. El modelo resuelve tareas de aritmética, álgebra y problemas tipo GSM8K con un tamaño compacto de 3 075 millones de parámetros, lo que permite ejecutarlo en GPUs de consumo.

La relevancia actual radica en que ofrece una alternativa ligera y eficiente a modelos más grandes para aplicaciones educativas, asistentes de cálculo y chatbots con capacidad matemática, manteniendo un coste de inferencia bajo. La versión GGUF aquí descrita incluye múltiples niveles de cuantización (desde Q2_K hasta f16) para adaptarse a distintos presupuestos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en SmolLM3, no confirmada en el repo) |
| Parametros totales | 3 075 098 624 |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (probablemente 8 192 tokens, según SmolLM3) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S, Q3_K_L, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible en el repo; la versión i1 indica 9 idiomas |
| Licencia | No disponible en el repo; la versión i1 indica Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna, pero los metadatos de la versión i1-GGUF indican que el modelo base es SmolLM3, un transformer denso con 3 000 millones de parámetros desarrollado por Hugging Face. Sobre esa base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) utilizando el dataset GSM8K, orientado a mejorar el razonamiento matemático paso a paso. El etiquetado de la versión i1 también menciona "text-generation-inference" y "multilingual", lo que sugiere que el entrenamiento incluyó datos conversacionales en varios idiomas.

No se ha publicado información sobre el número total de tokens de entrenamiento, el proceso de alineación (RLHF/DPO) ni otras innovaciones técnicas. El repositorio de cuantizaciones estáticas no incluye detalles adicionales.

## Capacidades

- Razonamiento matemático: resolución de problemas aritméticos y algebraicos, con especial énfasis en el dataset GSM8K.
- Generación de texto conversacional: capacidad para mantener diálogos multi-turno, según los tags del modelo.
- Multilingüismo: soporta al menos 9 idiomas (según la versión i1), aunque no se especifican cuáles.
- Integración con pipelines de texto: compatible con text-generation-inference y endpoints estándar.
- No se han documentado capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Tutor matemático automatizado: el modelo puede explicar paso a paso la resolución de problemas de aritmética y álgebra, sirviendo como asistente educativo para estudiantes de secundaria y bachillerato.
- Chatbot de soporte en plataformas educativas: integrado en un servicio de mensajería, responde dudas matemáticas con razonamiento estructurado, aprovechando su entrenamiento en GSM8K.
- Generación de ejercicios y exámenes: un profesor puede pedir al modelo que cree problemas matemáticos con soluciones detalladas, ahorrando tiempo en la preparación de materiales.
- Herramienta de cálculo conversacional: en aplicaciones de productividad, el modelo resuelve operaciones complejas explicando el procedimiento, útil para usuarios no expertos.
- Prototipado rápido de asistentes de IA: gracias a su tamaño reducido y formato GGUF, se puede desplegar en una GPU doméstica (por ejemplo, RTX 3060) para validar ideas antes de escalar a modelos mayores.
- Evaluación de modelos pequeños en entornos con restricciones de hardware: sirve como punto de referencia para comparar el rendimiento matemático de modelos de 3B en dispositivos edge o con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para esta cuantización concreta. El dataset GSM8K se menciona como parte del entrenamiento, pero no se ofrecen métricas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: dependiendo de la cuantización, entre 2 GB (Q2_K) y 6 GB (f16) para el modelo completo. Las cuantizaciones Q4_K_M (~2.5 GB) y Q5_K_M (~3 GB) son las más equilibradas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las versiones Q4 y Q5. Para f16 o Q8_0 se recomienda 8 GB o más. Ejemplos: RTX 3060, RTX 4060, GTX 1080 Ti, o GPUs de servidor como A10G.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q4 y Q5 caben en GPUs de gama media de consumo.
- Opciones de despliegue: compatible con llama.cpp, Ollama, text-generation-inference y cualquier framework que soporte GGUF (por ejemplo, LM Studio, llama-cpp-python).
- Latencia y throughput estimados: no disponibles. En una RTX 3060 con Q4_K_M, se espera una velocidad de generación de 30-50 tokens por segundo, pero esto no está confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque principal |
|---|---|---|---|---|
| Al-Khwarizmi-3B (este) | 3 075 M | No disponible | Apache-2.0 (probable) | Matemáticas y conversación |
| SmolLM3-3B (base) | 3 000 M | 8 192 | Apache-2.0 | Generación general |
| Qwen2.5-3B | 3 090 M | 32 768 | Apache-2.0 | Multilingüe y razonamiento |
| Llama-3.2-3B | 3 210 M | 128 000 | Llama 3.2 | Uso general |

No se dispone de comparativas de rendimiento numérico entre estos modelos, ya que no hay benchmarks publicados para Al-Khwarizmi-3B. La ventaja de este modelo reside en su especialización matemática, mientras que las alternativas ofrecen mayor contexto (Qwen2.5, Llama) o un entrenamiento más general (SmolLM3).

## Limitaciones y advertencias

- Sin datos de evaluación: no se han publicado resultados en benchmarks estándar, por lo que el rendimiento real en tareas matemáticas fuera de GSM8K es desconocido.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos o con múltiples pasos.
- Contexto limitado: probablemente 8 192 tokens (según SmolLM3), insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas no especificados: aunque se mencionan 9 idiomas, no se detalla cuáles ni su calidad, por lo que el rendimiento en español u otros idiomas no está garantizado.
- Licencia incierta: el repositorio no muestra licencia; la versión i1 indica Apache-2.0, pero conviene verificar el modelo original antes de uso comercial.
- Sin soporte de tool calling ni agentes: no se ha documentado la capacidad de usar funciones externas, lo que limita su integración en flujos de trabajo automatizados.
- Cuantizaciones de baja precisión (Q2_K, Q3): pueden degradar notablemente la precisión matemática, especialmente en operaciones largas.

## Enlaces

- Repositorio HuggingFace (versión estática): https://huggingface.co/mradermacher/Al-Khwarizmi-3B-GGUF
- Modelo original (mzoelfakar): https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B
- Versión i1-GGUF (con imatrix): https://huggingface.co/mradermacher/Al-Khwarizmi-3B-i1-GGUF
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher/models
- Página de modelos de mradermacher (tercero): https://www.aimodels.fyi/creators/huggingFace/mradermacher

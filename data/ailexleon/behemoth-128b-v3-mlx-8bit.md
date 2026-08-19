# ailexleon/Behemoth-128B-v3-mlx-8Bit

## Resumen

El modelo `ailexleon/Behemoth-128B-v3-mlx-8Bit` es una conversión al formato MLX (Machine Learning eXchange) del modelo original `TheDrummer/Behemoth-128B-v3`, realizada por el usuario ailexleon. Se trata de un modelo de lenguaje orientado a la generación de texto creativo, roleplay, escritura de ficción y conversaciones con personajes, como indican las etiquetas de su ficha. La conversión utiliza la librería `mlx-lm` en su versión 0.31.3 y aplica una cuantización de 8 bits, lo que permite ejecutar el modelo en hardware de Apple con aceleración unificada.

Aunque el nombre del modelo sugiere 128 mil millones de parámetros, el checkpoint en safetensors contiene 35.165.122.560 parámetros totales, lo que indica que probablemente se trata de un modelo con arquitectura de mezcla de expertos (MoE) con 128B de parámetros totales y 35B activos, aunque no se dispone de confirmación oficial. La ficha original no ofrece detalles sobre la arquitectura, el entrenamiento o los datos de evaluación, por lo que la información disponible es limitada.

La relevancia de este modelo radica en su disponibilidad en formato MLX, que facilita su uso en dispositivos Apple con chips M-series, y en su especialización en tareas de escritura creativa y roleplay, un nicho con demanda en la comunidad de IA generativa. No obstante, la falta de documentación técnica y de licencia clara limita su adopción en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 35.165.122.560 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original `TheDrummer/Behemoth-128B-v3`. La ficha del modelo base no aporta detalles sobre el tipo de transformer, el número de capas, la técnica de atención, ni el proceso de entrenamiento (número de tokens, composición del dataset, métodos de alineación como RLHF o DPO). El único dato técnico conocido es que el checkpoint convertido contiene 35.165.122.096 parámetros, lo que sugiere una posible arquitectura MoE con 128B totales y 35B activos, pero esta hipótesis no se puede confirmar con la información proporcionada. La conversión a MLX no modifica el comportamiento del modelo, solo el formato de pesos para optimizar la inferencia en hardware de Apple.

## Capacidades

- Generación de texto creativo: el modelo está diseñado para tareas de escritura de ficción, narración y storytelling.
- Roleplay y conversación con personajes: soporta interacciones multi-turno en las que el usuario interpreta un personaje y el modelo responde en contexto.
- Escritura conversacional: puede mantener diálogos naturales con un estilo adaptado a la personalidad de un personaje definido por el usuario.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Modo de pensamiento o visión: no disponible.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar tramas, descripciones de escenarios y diálogos coherentes para autores que buscan inspiración o co-creación.
- Simulación de personajes para juegos de rol: en entornos de rol por texto, el modelo puede interpretar a un personaje con una personalidad definida, manteniendo la coherencia a lo largo de múltiples turnos.
- Creación de contenido para narrativa interactiva: permite desarrollar historias ramificadas en las que el usuario elige opciones y el modelo genera las consecuencias narrativas.
- Asistente de escritura para blogs o relatos: puede generar borradores o ampliar ideas iniciales, ayudando a escritores a superar bloqueos creativos.
- Chatbots de entretenimiento: se puede integrar en aplicaciones de conversación con personajes ficticios, ofreciendo respuestas con tono y estilo adaptados a cada personaje.
- Generación de diálogos para videojuegos: el modelo puede producir diálogos de PNJ para prototipos de videojuegos, reduciendo el tiempo de diseño manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se conocen puntuaciones en MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. No se pueden comparar métricas con otros modelos.

## Requisitos de hardware

- Al ser una conversión MLX, está optimizado para ejecutarse en ordenadores con Apple Silicon (chips M1, M2, M3, M4) y su memoria unificada.
- El checkpoint de 35B parámetros en 8-bit requiere aproximadamente 35 GB de memoria (el peso en memoria es igual al número de parámetros multiplicado por 1 byte por parámetro en 8-bit, más overhead). Esto implica que solo se puede ejecutar en Macs con al menos 64 GB de RAM unificada (por ejemplo, Mac Studio o MacBook Pro de gama alta).
- No se dispone de datos de latencia o throughput específicos para este modelo.
- Opciones de despliegue: se puede usar con `mlx-lm` directamente, o integrarse en aplicaciones que utilicen el ecosistema MLX. No se ha reportado compatibilidad con vLLM, llama.cpp o TGI, al ser un formato MLX propietario de Apple.
- En el hardware de Apple, el modelo puede ejecutarse en modo local sin conexión a internet, siempre que se disponga de suficiente memoria.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con el mismo tamaño y especialización. El modelo base `TheDrummer/Behemoth-128B-v3` no tiene fichas públicas con benchmarks ni comparaciones. No.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o comportamientos no deseados del modelo.
- Al ser un modelo de generación creativa, existe riesgo de alucinación (contenido plausible pero falso) y de producir textos con contenido inapropiado si no se aplican filtros.
- La licencia es "no disponible", lo que impide conocer las condiciones de uso comercial, redistribución o modificación. Esto limita su uso en entornos empresariales sin un análisis legal previo.
- El modelo solo declara soporte para inglés, por lo que su rendimiento en otros idiomas es desconocido.
- La ausencia de documentación sobre el entrenamiento y la arquitectura dificulta evaluar su fiabilidad en tareas críticas.
- La conversión MLX no modifica el comportamiento original, pero el formato de 8-bit puede producir una pérdida de precisión en comparación con el modelo en fp16 o fp32.

## Enlaces

- Repositorio Hugging Face: [ailexleon/Behemoth-128B-v3-mlx-8Bit](https://huggingface.co/ailexleon/Behemoth-128B-v3-mlx-8Bit)
- Modelo base: [TheDrummer/Behemoth-128B-v3](https://huggingface.co/TheDrummer/Behemoth-128B-v3)
- Conversión GGUF del mismo modelo base (por BeaverAI): [BeaverAI/Behemoth-128B-v3a-GGUF](https://huggingface.co/BeaverAI/Behemoth-128B-v3a-GGUF)

# Nasaawakening/Zoder2.0-1B

## Resumen

Zoder 2.0-1B es un modelo de lenguaje de 1.080 millones de parámetros creado mediante un proceso de fusión SLERP (Spherical Linear Interpolation) en dos etapas. Lo desarrolla el usuario Nasaawakening, que lo publica bajo licencia Apache 2.0. El modelo parte de una primera mezcla entre MiniCPM5-1B de openbmb y una variante de razonamiento "Fable5-V2-Thinking", que da lugar a Zoder 1.0-1B; posteriormente, esta versión se fusiona con otra variante "Fable5-Thinking (V1)" para producir Zoder 2.0-1B.

El modelo está pensado como una mejora incremental de Zoder 1.0-1B, con el objetivo de combinar las capacidades de razonamiento de los modelos base mediante interpolación de pesos. Al estar basado en MiniCPM5-1B, hereda una arquitectura transformer de 1B parámetros, aunque no se publican detalles adicionales sobre longitud de contexto, dataset de entrenamiento o capacidades específicas. Su relevancia actual radica en ser un ejemplo de fusión de modelos de pequeño tamaño con técnicas SLERP, un enfoque popular en la comunidad open source para mejorar rendimiento sin reentrenar desde cero.

La ficha es necesariamente limitada porque la información pública es escasa: no se han publicado benchmarks detallados, especificaciones de contexto ni datos de entrenamiento más allá del árbol de fusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5-1B) |
| Parametros totales | 1.080.632.832 (1,08B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (float16), GGUF (indicado en tags) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Zoder 2.0-1B es un modelo de arquitectura transformer, derivado de MiniCPM5-1B de openbmb, fusionado mediante la técnica SLERP (Spherical Linear Interpolation). Esta técnica combina los pesos de dos modelos base interpolando sus parámetros a lo largo de una esfera de alta dimensión, con un factor t que controla la proporción de cada modelo. En este caso, el árbol de fusión muestra una primera etapa que mezcla MiniCPM5-1B con una variante "Fable5-V2-Thinking" para producir Zoder 1.0-1B, y una segunda etapa que mezcla este último con "Fable5-Thinking (V1)" para dar lugar a Zoder 2.0-1B.

Los parámetros de la fusión se detallan en la model card: se aplica un SLERP de segunda etapa con una base en Zoder 1.0-1B y una mezcla con MiniCPM5-1B-Claude-Opus-Fable5-Thinking. Los valores de t varían por capa: para self_attn se usan los valores [0, 0.5, 0.3, 0.7, 1], mientras que para mlp se usan [1, 0.5, 0.7, 0.3, 0], con un valor por defecto de 0.5. El peso se almacena en float16. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO, ya que al ser un modelo de fusión no se entrenó desde cero.

## Capacidades

- Generacion de texto: como modelo de lenguaje de 1B parámetros, puede generar texto coherente en tareas generales, aunque su capacidad está limitada por su tamaño.
- Razonamiento: el nombre "Thinking" en los modelos base sugiere que se buscó potenciar el razonamiento multi-paso, aunque no hay benchmarks publicados que lo confirmen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se han documentado modos de pensamiento, visión o audio; el modelo es exclusivamente de texto.

## Casos de uso

- **Prototipado rápido de chat**: dado su tamaño de 1B parámetros, puede desplegarse en entornos con recursos limitados para experimentar con asistentes conversacionales simples, siempre que el usuario no exija respuestas de alta calidad en dominios complejos.
- **Experimentacion con fusion de modelos**: para investigadores que quieran estudiar los efectos de SLERP en modelos pequeños, Zoder 2.0-1B sirve como caso de estudio de una fusión de segunda etapa, con parámetros de interpolación documentados.
- **Generacion de texto en aplicaciones embebidas**: en dispositivos con poca RAM o VRAM, un modelo de 1B cuantizado puede ejecutar tareas de completado de texto, resumen o clasificacion simple.
- **Educacion y divulgacion**: como ejemplo de modelo abierto de licencia Apache 2.0, es útil para ensenar a estudiantes de IA los conceptos de fusion de modelos y SLERP sin restricciones de uso.
- **Base para ajuste fino**: al ser un modelo de 1B con licencia permisiva, puede usarse como punto de partida para tareas de fine-tuning específicas cuando se dispone de un dataset pequeño.
- **Pruebas de integracion con Ollama**: dado que se publican pesos GGUF, es posible cargarlo en Ollama para probar su comportamiento en entornos locales, aunque se recomienda verificar su calidad antes de usarlo en produccion.

## Benchmarks y rendimiento

La model card indica únicamente "Enhancement benchmark: 3/5 passed", sin detallar qué pruebas se realizaron ni los resultados numéricos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1.080.632.832 parámetros en float16 ocupa aproximadamente 2.1 GB de memoria. Con cuantizacion GGUF a 4 bits, puede reducirse a unos 0.6-0.7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para float16, o 1 GB para cuantizacion 4 bits. Ejemplos: GTX 1650, RTX 3060, o incluso CPU con RAM suficiente.
- Cabe en GPU de consumo: si, es compatible con las GPUs de consumo mas habituales (RTX 3060, RTX 4060, etc.) con cuantizacion.
- Opciones de despliegue: al estar disponibles pesos GGUF, puede desplegarse con llama.cpp, Ollama o cualquier backend compatible con GGUF. También se pueden usar los safetensors con vLLM o TGI, aunque su tamaño reducido hace que la latencia sea baja.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zoder 2.0-1B | 1,08B | no disponible | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| MiniCPM5-1B | 1,08B | no disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32K | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parametros y licencias. Qwen2.5-1.5B es un modelo con documentacion mas completa y benchmarks publicados, mientras que Zoder 2.0-1B carece de especificaciones detalladas.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion sobre evaluaciones de sesgo. Al ser un modelo de fusion, hereda los sesgos de sus modelos base, que no se documentan.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de 1B, es propenso a generar contenido factualmente incorrecto, especialmente en tareas que requieren conocimiento del mundo.
- Limitaciones de contexto o idioma: no se especifican la longitud de contexto ni los idiomas soportados. Se recomienda asumir un contexto corto (por debajo de 8k tokens) y un rendimiento limitado en idiomas distintos del ingles.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y distribucion, siempre que se mantenga el aviso de copyright. No hay restricciones adicionales documentadas.
- Caveats de produccion: el modelo no esta acompanado de documentacion sobre evaluacion de calidad, ni de pruebas de robustez, por lo que no se recomienda su uso en sistemas criticos sin una evaluacion previa exhaustiva.

## Enlaces

- [Modelo en Hugging Face: Nasaawakening/Zoder2.0-1B](https://huggingface.co/Nasaawakening/Zoder2.0-1B)
- [Modelo base: Nasaawakening/Zoder1.0-1B](https://huggingface.co/Nasaawakening/Zoder1.0-1B)
- [Perfil del autor en Hugging Face](https://huggingface.co/Nasaawakening)
- [Repositorio GitHub: Mymodels](https://github.com/nasaawakening/Mymodels)
- [Releases del repositorio en GitHub](https://github.com/nasaawakening/Mymodels/releases)

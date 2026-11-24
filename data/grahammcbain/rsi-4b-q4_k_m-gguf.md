# grahammcbain/RSI-4B-Q4_K_M-GGUF

## Resumen

RSI-4B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo RSI-4B, publicada por el usuario grahammcbain. Se trata de un modelo de generación de texto de aproximadamente 4.022 millones de parámetros, derivado del modelo base grahammcbain/RSI-4B, que a su vez se construye sobre la familia Qwen3 según las etiquetas de la model card. El modelo ha sido ajustado mediante DPO y LoRA, y se distribuye bajo licencia Apache 2.0.

La conversión a GGUF se realizó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, lo que permite ejecutar el modelo en CPU y en GPU con distintos niveles de cuantización. El repositorio ocupa 2,5 GB y contiene el archivo rsi-4b-q4_k_m.gguf, cuantizado en Q4_K_M, un formato de compromiso entre tamaño y calidad ampliamente soportado por llama.cpp, Ollama y otros runners compatibles.

El modelo está etiquetado con términos como "conceptual-art", "slop" y "recursive-slop-improvement", lo que sugiere un proyecto experimental o de carácter artístico más que un modelo orientado a producción. No se han publicado datos de benchmarks ni detalles sobre el dataset de entrenamiento en la información disponible. Su relevancia actual es limitada: se trata de una publicación reciente con cero descargas y cero likes, sin documentación técnica adicional más allá de la conversión de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según etiquetas de la model card) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base admite otras cuantizaciones vía llama.cpp |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo rsi-4b-q4_k_m.gguf); el modelo base en safetensors |
| Tamano del repositorio | 2,5 GB |
| Libreria declarada | mlx |
| Modelo base | grahammcbain/RSI-4B |
| Ajuste fino | DPO + LoRA |

## Arquitectura y entrenamiento

La información disponible indica que el modelo deriva de la familia Qwen3, por lo que la arquitectura subyacente es un transformer decoder-only. El modelo base RSI-4B fue ajustado mediante DPO (Direct Preference Optimization) y LoRA (Low-Rank Adaptation), técnicas habituales para alinear respuestas con preferencias humanas sin reentrenar todos los parámetros. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o SFT.

La versión publicada en este repositorio es una conversión a GGUF realizada con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai. La cuantización Q4_K_M aplica cuantización de 4 bits con mezcla de bloques K-quant, lo que reduce el peso del modelo a aproximadamente 2,5 GB manteniendo una calidad razonable para inferencia en hardware de consumo. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" y el pipeline text-generation.
- Ajuste por preferencias (DPO) orientado a respuestas alineadas, aunque sin documentación sobre el criterio de alineación.
- Ejecución local mediante llama.cpp en CLI y servidor, con soporte para CPU y GPU.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües limitadas al inglés según el campo language de la model card.

## Casos de uso

- Experimentación local con modelos de 4B en hardware de consumo: el archivo Q4_K_M de 2,5 GB permite ejecutar el modelo en portátiles con 8 GB de RAM o GPUs modestas mediante llama.cpp, ideal para pruebas de concepto.
- Investigación sobre ajuste DPO y LoRA: el modelo sirve como ejemplo de pipeline de alineación sobre una base Qwen3 de 4B, útil para estudiar cómo afectan estas técnicas a un modelo pequeño.
- Arte conceptual y proyectos creativos: las etiquetas "conceptual-art" y "slop" sugieren un uso deliberadamente experimental, por ejemplo para generar texto con estilos poco convencionales o estudiar los límites de los modelos pequeños.
- Evaluación de cuantizaciones GGUF: comparar la salida de esta versión Q4_K_M con el modelo base en safetensors permite medir la degradación introducida por la cuantización de 4 bits.
- Prototipado de chatbots en inglés: con la etiqueta "conversational" y compatibilidad con llama-server, se puede montar un servicio de chat local para demos sin depender de la nube.
- Docencia y formación: un modelo de 4B cuantizado es adecuado para explicar el funcionamiento de llama.cpp, la conversión a GGUF y el despliegue de modelos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,5-3 GB para el archivo Q4_K_M, más el espacio de contexto y overhead del runtime (típicamente 1-2 GB adicionales según la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060 o superiores; también funciona en CPU.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runner compatible con GGUF. La model card menciona también mlx como librería del modelo base.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de contexto configurada (el ejemplo de la model card usa -c 2048).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RSI-4B-Q4_K_M-GGUF | 4,02B | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste DPO+LoRA sobre Qwen3; experimental |
| Qwen3-4B (referencia de familia) | ~4B | no disponible en esta ficha | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Base declarada del modelo |
| Modelos GGUF de 4B en llama.cpp | ~4B | variable | variable | GGUF | Alternativas genéricas de tamaño similar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: las etiquetas "slop" y "recursive-slop-improvement" indican que no está pensado para producción ni para tareas críticas.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sin benchmarks: no hay evidencia publicada de calidad, razonamiento o código, por lo que no se puede comparar objetivamente con alternativas.
- Riesgo de alucinación: inherente a los modelos de 4B sin documentación de alineación detallada; el ajuste DPO no garantiza veracidad.
- Contexto desconocido: no se especifica la longitud máxima de contexto; el ejemplo de la model card usa 2048 tokens, lo que sugiere un uso conservador.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3 conviene verificar las condiciones de la familia base y de los datos de ajuste.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte documentado.
- Cuantización Q4_K_M: introduce pérdida de precisión respecto al modelo base en safetensors; para tareas sensibles conviene usar cuantizaciones mayores (Q6_K, Q8_0) o el modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/grahammcbain/RSI-4B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/grahammcbain/RSI-4B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp

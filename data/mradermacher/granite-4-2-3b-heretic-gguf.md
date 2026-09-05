# mradermacher/granite-4.2-3b-Heretic-GGUF

## Resumen

`granite-4.2-3b-Heretic-GGUF` es una cuantización en formato GGUF del modelo `tinyopsec/granite-4.2-3b-Heretic`, un modelo de lenguaje causal de 3.659.737.600 parámetros basado en la arquitectura transformer de IBM Granite. La variante "Heretic" incorpora una técnica de edición de representaciones (representation editing) que modifica el comportamiento del modelo respecto al original. El modelo está cuantizado por `mradermacher` y ofrece múltiples niveles de compresión (de Q2_K a f16), lo que permite su ejecución en entornos con recursos limitados.

El modelo es relevante porque combina un tamaño pequeño (3B) con soporte para nueve idiomas (inglés, alemán, francés, español, italiano, portugués, japonés, coreano y chino) y una licencia Apache-2.0 que facilita su uso comercial. Al estar disponible en GGUF, puede desplegarse fácilmente con herramientas como `llama.cpp` u `Ollama` en CPUs y GPUs de consumo. La longitud de contexto no se ha publicado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en, de, fr, es, it, pt, ja, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente `granite-4.2-3b-Heretic` es un modelo de lenguaje causal basado en la arquitectura transformer decoder-only, con un total de 3.659.737.600 parámetros. La variante "Heretic" aplica una técnica de edición de representaciones (representation editing) sobre el modelo base de Granite 4.2 3B. Esta técnica altera selectivamente ciertos conceptos o comportamientos en el espacio de representaciones, sin modificar la arquitectura ni el número de parámetros.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens utilizados ni la aplicación de técnicas de alineamiento como RLHF o DPO. La cuantización GGUF ha sido realizada por `mradermacher` a partir del modelo original en formato safetensors, generando distintas versiones con diferentes niveles de compresión. El modelo es compatible con la librería `transformers` para cargar el modelo base en safetensors, pero esta ficha se centra en la versión GGUF para inferencia local.

## Capacidades

- Generación de texto en nueve idiomas: inglés, alemán, francés, español, italiano, portugués, japonés, coreano y chino.
- Modelado de lenguaje causal para completado de texto, generación de respuestas y tareas de texto en general.
- Compatible con el pipeline `text-generation` de Hugging Face Transformers (en su versión original).
- Etiquetado como modelo conversacional, lo que indica capacidad para mantener diálogos básicos.
- No se ha confirmado soporte para tool calling, function calling, agentes, visión, audio o modos de razonamiento explícitos.

## Casos de uso

- Asistencia al cliente multilingüe: el modelo puede gestionar conversaciones en español, inglés, francés y otros idiomas soportados, con un tamaño reducido que permite desplegarlo en servidores ligeros o en infraestructuras de borde.
- Traducción automática entre idiomas europeos y asiáticos: al soportar nueve idiomas, puede utilizarse como motor de traducción local para textos cortos o párrafos, con la ventaja de no depender de servicios externos.
- Resumen de documentos técnicos: su capacidad de generación de texto permite resumir informes, artículos o manuales en varios idiomas, especialmente útil en entornos con restricciones de conectividad.
- Asistente de escritura y corrección: el modelo puede integrarse en editores de texto o procesadores de documentos para sugerir redacciones, corregir frases o generar contenido inicial en español y otros idiomas.
- Aplicaciones móviles o de escritorio con inferencia local: gracias a las cuantizaciones Q4 (alrededor de 2.2-2.3 GB), el modelo cabe en dispositivos con 3-4 GB de VRAM o incluso en CPUs con suficiente RAM, permitiendo ejecución sin conexión.
- Clasificación y análisis de texto mediante prompting: al ser un modelo causal de lenguaje, puede emplearse como base para tareas de clasificación de sentimiento, detección de temas o extracción de entidades, siempre que se diseñen prompts adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar KV cache ni overhead):
  - f16 (7.4 GB): 8 GB de VRAM.
  - Q8_0 (4.0 GB): 5 GB de VRAM.
  - Q6_K (3.1 GB): 4 GB de VRAM.
  - Q5_K_M / Q5_K_S (2.7 GB): 3.5 GB de VRAM.
  - Q4_K_M / Q4_K_S (2.2-2.3 GB): 3 GB de VRAM.
  - Q3_K_M (1.9 GB): 2.5 GB de VRAM.
  - Q2_K (1.6 GB): 2 GB de VRAM.
- GPU recomendadas: cualquier tarjeta con 4 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4070, etc.) puede ejecutar las cuantizaciones Q4 y Q5. Para la versión f16 se recomienda una GPU con 8 GB de VRAM, como RTX 4060 Ti o superior.
- El modelo sí cabe en GPUs de consumo. Las versiones Q2, Q3 y Q4 pueden ejecutarse incluso en GPUs de 4 GB, y algunas en CPUs con suficiente RAM.
- Opciones de despliegue: el formato GGUF está diseñado para `llama.cpp`, `Ollama`, `LM Studio` y otros motores basados en llama.cpp. No es directamente cargable con la librería `transformers`; para ello se requiere el modelo en formato safetensors.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Edición | Licencia | Tamaño (parámetros) |
|---|---|---|---|---|
| granite-4.2-3b-Heretic-GGUF | granite-4.2-3b | Heretic | Apache-2.0 | 3.659.737.600 |
| granite-4.2-3b-heretic-abliterated-i1-GGUF | granite-4.2-3b | Abliterated i1 | Apache-2.0 (no confirmado) | No disponible |
| granite-4.2-3b-GGUF | granite-4.2-3b | Sin edición | Apache-2.0 | 3.659.737.600 |

Los tres modelos comparten la misma base (Granite 4.2 3B) y se diferencian en la técnica de edición aplicada. El modelo "abliterated" es una variante que probablemente elimina ciertos comportamientos del modelo original, mientras que el modelo sin edición mantiene el comportamiento estándar. No se dispone de benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- La técnica de edición de representaciones (Heretic) puede alterar el comportamiento del modelo respecto al modelo base, afectando a la coherencia, la factualidad o el estilo en ciertos dominios.
- Las cuantizaciones GGUF introducen una pérdida de calidad en comparación con el modelo en punto flotante, especialmente en los niveles más bajos como Q2_K.
- Con solo 3.659 millones de parámetros, el modelo tiene una capacidad limitada para razonamiento complejo, matemáticas avanzadas o generación de código de alta calidad en comparación con modelos más grandes.
- No se ha publicado la longitud de contexto, por lo que el rendimiento en conversaciones largas o documentos extensos no está garantizado.
- No se ha confirmado soporte para tool calling, function calling o entradas multimodales, por lo que no es adecuado para agentes que requieran interacción con herramientas externas.
- Riesgo de alucinación inherente a todos los modelos de lenguaje, que puede verse incrementado en modelos pequeños y cuantizados.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar las condiciones de la licencia del modelo base y de las dependencias.

## Enlaces

- https://huggingface.co/mradermacher/granite-4.2-3b-Heretic-GGUF
- https://huggingface.co/tinyopsec/granite-4.2-3b-Heretic (modelo base)
- https://huggingface.co/mradermacher/granite-4.2-3b-heretic-abliterated-i1-GGUF (variante abliterada)
- https://huggingface.co/mradermacher/granite-4.2-3b-GGUF (versión sin edición)
- https://huggingface.co/mradermacher/model_requests (FAQ y solicitudes)
- https://www.nethype.de/ (empresa del autor de la cuantización)

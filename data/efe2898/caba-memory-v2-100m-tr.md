# Efe2898/caba-memory-v2-100m-tr

## Resumen

ÇABA Selective Convolution + EMA Memory v1 (repositorio `Efe2898/caba-memory-v2-100m-tr`) es un modelo de lenguaje causal experimental de unos 100 millones de parámetros desarrollado por el usuario de Hugging Face Efe2898. No se trata de un transformer convencional: combina un grafo disperso de transición de tokens usado solo durante el entrenamiento, un softmax global atado de soporte completo, una convolución causal depthwise con K=8 y una memoria EMA selectiva multi-escala temporal con caché de tamaño constante. Esto lo sitúa en la categoría de arquitecturas experimentales alternativas al transformer estándar, más próximas a los modelos de estado (SSM) por su caché de tamaño fijo.

El problema que aborda es la exploración de mecanismos de memoria de coste constante durante la inferencia, de modo que el estado (`past_key_values`) no crece con la longitud del prompt. Es relevante como ejercicio de investigación y como base para experimentación, aunque el propio autor advierte explícitamente en la model card que no reivindica calidad lingüística validada. El modelo ha sido entrenado con pesos de fuente `{"tr": 1.0}`, lo que sugiere un entrenamiento centrado en turco, y usa el tokenizador de `vngrs-ai/Kumru-2B-Base`. Con 329 descargas y licencia "other", es un proyecto de nicho orientado a desarrolladores curiosos por arquitecturas no convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CABA selective-conv-EMA v1 (grafo de transición de tokens + convolución causal depthwise K=8 + memoria EMA selectiva multi-escala) |
| Parámetros totales | 101.904.161 |
| Parámetros activos | no disponible (no es MoE; todos los parámetros son densos) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento); la caché de inferencia es de tamaño constante |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenamiento con peso 1.0 en turco, según la configuración de fuentes) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura `caba-selective-conv-ema-v1-100m-tr-warmstart` combina cuatro componentes. Primero, un grafo disperso de transición de tokens con K=32 vecinos por token, empleado únicamente durante el entrenamiento (cobertura de candidatos en held-out: 0,50739). Segundo, un softmax global con pesos atados (tied) de soporte completo. Tercero, una convolución causal depthwise con kernel K=8 que captura dependencias locales. Cuarto, una memoria EMA (media móvil exponencial) selectiva con múltiples escalas temporales, cuyo estado tiene tamaño constante independientemente de la longitud del prompt, lo que permite inferencia con coste de memoria fijo por capa.

Los parámetros entrenables ascienden a 100.298.529. El tokenizador empleado es el de `vngrs-ai/Kumru-2B-Base` (revisión `55711ea224e4bf5d4e11a4baf79130ae73785ece`), y los datos tokenizados provienen del dataset `Efe2898/tokenized` (revisión `6cb993aa63064cd89b511bb164e8c6e5512902ed`). La configuración de pesos de fuente de entrenamiento es `{"tr": 1.0}`, lo que indica entrenamiento exclusivo sobre datos en turco. La longitud de secuencia es de 256 tokens. No hay información disponible sobre el número total de tokens de entrenamiento, ni sobre el uso de RLHF, DPO u otras técnicas de alineación. El nombre "warmstart" sugiere inicialización a partir de pesos previos, pero no hay detalles publicados.

Un detalle técnico relevante: la caché de inferencia (`past_key_values`) almacena por capa `(conv_state, ema_state)`, ambos de tamaño constante respecto a la longitud del prompt. La generación por lotes requiere left padding para que la última posición del prompt sea un token real. El autor incluye un notebook que verifica la igualdad entre procesamiento de prefijo completo e incremental, la recurrencia EMA, el comportamiento con left padding y la ruta de generación estándar de Transformers.

## Capacidades

- Generación de texto causal (pipeline `text-generation`), orientada a conversación según las etiquetas del repositorio.
- Modelado de dependencias locales mediante convolución causal depthwise (K=8).
- Retención de información a largo plazo con estado de tamaño constante gracias a la memoria EMA multi-escala.
- Inferencia incremental eficiente: el estado no crece con la longitud del prompt, a diferencia de la caché KV de un transformer.
- Generación por lotes soportada con left padding.
- No hay evidencia de capacidades de vision, audio, tool calling, function calling ni razonamiento multi-paso.
- El propio autor no reivindica calidad lingüística validada; el modelo es experimental.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el código completo (`configuration_caba.py`, `modeling_caba.py`, `training/`) está incluido en el repositorio, lo que permite estudiar y modificar el mecanismo de memoria EMA y el grafo de transición de tokens.
- Experimentación con cachés de tamaño constante: útil para comparar el coste de memoria de la inferencia incremental frente a la caché KV tradicional en secuencias largas.
- Prototipado de modelos de lenguaje en turco a pequeña escala: dado el entrenamiento con peso 1.0 en turco y el tokenizador de Kumru-2B, puede servir como base ligera para experimentos en ese idioma.
- Pruebas de unidad y verificación de implementaciones de generación: el notebook incluido comprueba igualdad entre prefijo completo e incremental, recurrencia EMA y left padding, siendo un ejemplo didáctico de ingeniería de inferencia.
- Fine-tuning experimental sobre dominios estrechos: con 100M de parámetros, es viable entrenar en una sola GPU de consumo para tareas específicas de generación de texto corto.
- Benchmarking de throughput de inferencia con estado constante: adecuado para medir cómo se comporta la latencia cuando el estado no depende de la longitud del prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo "no reivindica calidad lingüística validada".

## Requisitos de hardware

- VRAM estimada para inferencia: con 101,9 millones de parámetros en fp32, unos 0,4 GB solo de pesos; en fp16/bf16, unos 0,2 GB. Añadiendo activaciones y estado, cualquier GPU moderna con 4-6 GB de VRAM es suficiente. No hay cuantizaciones publicadas.
- GPU recomendadas: no disponible oficialmente; por tamaño, cualquier GPU de consumo (RTX 3060, RTX 4060 o superior) es más que suficiente. No se requiere hardware de datacenter.
- Cabe en GPU de consumo sin problema, e incluso es probable que funcione en CPU dada la escala, aunque no hay datos de latencia publicados.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (ruta principal, con código personalizado en el repositorio). No hay evidencia de soporte en vLLM, llama.cpp, Ollama ni TGI, dado el código de modelo personalizado.
- Latencia y throughput: no disponible. El tamaño del repo (6,0 GB) es notablemente superior al de los pesos (~0,4 GB en fp32), lo que sugiere inclusion de artefactos adicionales (posiblemente checkpoints de entrenamiento o el notebook y scripts).

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| Efe2898/caba-memory-v2-100m-tr | 101,9 M | CABA (grafo + conv causal + EMA) | 256 (entrenamiento), caché constante | other |
| GPT-2 (124M) | 124 M | Transformer decoder | 1024 | MIT/modificada (según variante) |
| Qwen2.5-0.5B | 494 M | Transformer decoder | 32768 (128K con YaRN) | Apache 2.0 |
| SmolLM2-135M (Hugging Face) | 135 M | Transformer decoder | 2048 | Apache 2.0 |

Comparado con alternativas de tamaño similar como SmolLM2-135M o GPT-2, el modelo ÇABA ofrece una caché de inferencia de tamaño constante (ventaja en memoria para secuencias largas) a cambio de un contexto de entrenamiento muy corto (256 tokens) y sin benchmarks validados. Para producción en castellano o multilingüe, las alternativas transformer son opciones mucho más maduras; el interés de ÇABA es principalmente investigador.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es experimental y no reivindica calidad lingüística validada; no debe usarse en producción.
- Riesgo de alucinación: alto y sin cuantificar, al no existir evaluaciones publicadas.
- Contexto de entrenamiento de solo 256 tokens, muy limitado frente a los estándares actuales.
- Entrenamiento centrado en turco (`{"tr": 1.0}`); el rendimiento en otros idiomas, incluido el castellano, es desconocido y probablemente deficiente.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python arbitrario del repositorio; el propio autor recomienda revisar `configuration_caba.py`, `modeling_caba.py` y `training/` antes de habilitarlo.
- La generación por lotes exige left padding; el uso incorrecto puede producir resultados erróneos.
- Licencia "other": los términos exactos no están detallados en la información disponible, por lo que conviene revisar la licencia en el repositorio antes de cualquier uso comercial.
- Sesgos conocidos: no disponible; no hay documentación sobre el contenido del dataset de entrenamiento más allá del identificador del repositorio tokenizado.
- No hay soporte documentado para tool calling, agentes ni cuantización.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Efe2898/caba-memory-v2-100m-tr
- Tokenizador base: https://huggingface.co/vngrs-ai/Kumru-2B-Base
- Dataset tokenizado: https://huggingface.co/datasets/Efe2898/tokenized
- Paper, blog o demo: no disponible

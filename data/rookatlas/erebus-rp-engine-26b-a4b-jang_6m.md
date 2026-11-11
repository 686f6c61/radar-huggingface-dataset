# rookatlas/Erebus-RP-Engine-26B-A4B-JANG_6M

## Resumen

Erebus-RP-Engine-26B-A4B-JANG_6M es una cuantización JANG v2 del modelo Naphula/Erebus-RP-Engine-26B-A4B, publicada por el usuario rookatlas y orientada exclusivamente a Apple Silicon mediante MLX. El modelo base es un Gemma 4 MoE de 26B parámetros totales con aproximadamente 4B activos por token, pensado para roleplay y escritura creativa, con soporte de entrada de imagen (pipeline image-text-to-text). Su propósito es ofrecer una versión de alta fidelidad (media de 6,13 bits por peso) que se cargue de forma instantánea en hardware Apple sin pasar por el ecosistema GGUF.

El modelo resuelve el problema de ejecutar un MoE de 26B con capacidades multimodales en equipos de consumo de Apple Silicon (M1 o superior), manteniendo los pesos críticos (router, embeddings, lm_head y MLP denso compartido) a 8 bits y los expertos y atención a 6 bits. No es un GGUF y no carga en llama.cpp, Ollama ni LM Studio; requiere un runtime MLX compatible con JANG, como vMLX o jang_tools. La licencia es Apache-2.0, heredada del modelo fuente, y el contenido está marcado como no apto para todas las audiencias.

Es relevante ahora porque demuestra una ruta de cuantización específica para Apple Silicon (JANG v2) aplicada a un MoE multimodal de tamaño medio, con un perfil de bits mixto que prioriza capas sensibles y comprime el resto. El repo ocupa ~21 GB y tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 MoE (Gemma4ForConditionalGeneration), transformer con atención híbrida sliding-window/full |
| Parámetros totales | 25.260.865.822 (~26B) |
| Parámetros activos | ~4B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | JANG v2, perfil JANG_6M: media 6,13 bits/peso (93,4% bloques a 6 bits, 6,6% a 8 bits), grupo 64, MSE asimétrico (mx.quantize), sin AWQ ni rotación Hadamard |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX nativo, JANG v2); no es GGUF |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 MoE con 128 expertos, enrutamiento top-8 y un MLP denso compartido en paralelo. Emplea atención híbrida que combina ventanas deslizantes con atención completa, e incluye un codificador de visión, por lo que acepta entradas de imagen y texto. La cuantización JANG v2 se aplica sobre los pesos del modelo fusionado: router/gate, embeddings, lm_head y el MLP denso compartido se mantienen a 8 bits; los pesos de expertos y de atención se cuantizan a 6 bits; las capas de normalización quedan sin cuantizar. La calibración es basada en importancia de pesos, sin dataset de calibración, y el método es MSE asimétrico con tamaño de bloque 64.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en el modelo base dentro de la información proporcionada. El modelo es una fusión (merge) de modelos fuente según indica la model card original, pero los detalles de la fusión no están disponibles en esta ficha.

## Capacidades

- Generación de texto para roleplay y escritura creativa, con narrativa extensa y contenido para adultos según advertencia del autor.
- Entrada multimodal imagen-texto: incluye codificador de visión y pipeline image-text-to-text.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no listados).
- Modo thinking: no disponible.
- Carga instantánea en MLX mediante formato JANG v2.

## Casos de uso

- Roleplay conversacional en local: el modelo está afinado para roleplay y escritura creativa, por lo que puede gestionar diálogos multi-turno con personajes y narrativa extensa en un Mac con 24 GB o más de memoria unificada.
- Escritura creativa asistida: generación de ficción, guiones y narrativa ramificada, aprovechando el enfoque del modelo base en creative-writing.
- Prototipado de experiencias multimodales: al aceptar imagen y texto, puede usarse para describir o continuar narrativas a partir de una imagen de referencia en flujos creativos.
- Investigación en cuantización para Apple Silicon: sirve como caso de estudio de JANG v2 con perfil mixto 6/8 bits sobre un MoE multimodal, útil para evaluar calidad frente a GGUF.
- Despliegue privado en estación de trabajo Apple: al ejecutarse en local con MLX, permite contenido sensible sin enviar datos a la nube, relevante para narrativa para adultos.
- Evaluación comparativa de MoE en hardware de consumo: permite medir latencia y calidad de un MoE de 26B/4B activos en M1/M2/M3/M4 frente a alternativas densas.
- Generación de contenido narrativo para juegos de rol de mesa: integrable en herramientas locales que requieran respuestas de personaje con contexto largo, siempre que el runtime MLX lo soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: ~24 GB o más solo para los pesos; se recomiendan 32 GB o más para longitudes de contexto cómodas.
- GPU recomendadas: Apple Silicon M1 o superior (memoria unificada). No aplica a GPU NVIDIA/AMD en este formato.
- Cabe en consumer GPU: no en el sentido tradicional; está pensado para Mac con memoria unificada de 24-32 GB o más.
- Opciones de despliegue: runtime MLX compatible con JANG, como vMLX (jangq.ai) o jang_tools. No es compatible con llama.cpp, Ollama ni el backend GGUF de LM Studio.
- Latencia y throughput: no disponible.
- Tamaño en disco: ~20,9 GB (repo ~21 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Erebus-RP-Engine-26B-A4B-JANG_6M | 26B totales / ~4B activos | no disponible | safetensors MLX (JANG v2) | Apache-2.0 | Hugging Face (0 descargas) |
| Naphula/Erebus-RP-Engine-26B-A4B (base) | 26B totales / ~4B activos | no disponible | safetensors | Apache-2.0 | Hugging Face |
| Cuantizaciones GGUF del modelo base | 26B totales / ~4B activos | no disponible | GGUF | Apache-2.0 | Enlazadas desde la página del modelo base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el autor advierte que el modelo puede producir narrativa y roleplay con contenido violento y erótico gráfico; no apto para todas las audiencias.
- Riesgo de alucinación: no cuantificado en la información disponible, pero presente en modelos generativos de este tipo.
- Idiomas: no se especifican los idiomas soportados, lo que limita la evaluación multilingüe.
- Contexto: la longitud de contexto no está indicada; el rendimiento con contextos largos depende de la memoria unificada disponible.
- Compatibilidad: no carga en llama.cpp, Ollama ni LM Studio (backend GGUF); requiere runtime MLX con soporte JANG.
- Licencia: Apache-2.0 permite uso comercial, pero el contenido generado y las obligaciones de atribución deben revisarse; el modelo base es una fusión de terceros.
- Madurez: 0 descargas y 0 likes; publicación reciente sin validación comunitaria.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/rookatlas/Erebus-RP-Engine-26B-A4B-JANG_6M
- Modelo base: https://huggingface.co/Naphula/Erebus-RP-Engine-26B-A4B
- Runtime vMLX: https://jangq.ai

# mlx-community/Qwen2.5-Omni-3B-Thinker-bf16

## Resumen

`mlx-community/Qwen2.5-Omni-3B-Thinker-bf16` no es un modelo conversacional, sino una conversión a MLX del *thinker* de `Qwen/Qwen2.5-Omni-3B`: el modelo de lenguaje Qwen2 (36 capas × 2048 de dimensión oculta) más la torre de audio con forma de Whisper. El paquete lo publica la comunidad `mlx-community` y está pensado para actuar como **encoder semántico de AuK** (`mlx-community/AuK-bf16`) dentro del proyecto `xocialize/mlx-auk-swift`. Es decir, expone estados ocultos, no logits.

La conversión elimina deliberadamente la torre de visión, la cabeza LM (*LM head*), el *talker* y el módulo `token2wav`. Por tanto no genera texto, no sintetiza voz y no procesa imágenes: solo produce representaciones. Los pesos se sirven en bfloat16 sin cuantizar (7,45 GB) y la model card documenta métricas de paridad numérica frente a la implementación de referencia en `transformers` 4.57.1, lo que resulta relevante para quien necesite integrar el modelo con garantías de fidelidad en lugar de fiarse de una simple conversión de formato.

La licencia es el **Qwen Research License Agreement**: uso exclusivamente de investigación o evaluación, no comercial. Es un detalle crítico porque condiciona por completo cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 (36 capas, 2048 de dimensión oculta) + torre de audio tipo Whisper (encoder); sin LM head |
| Parámetros totales | No disponible de forma desglosada en la información proporcionada; el checkpoint en bf16 ocupa 7,45 GB (modelo base nominal: 3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No declarada en la model card de esta conversión |
| Tipos de cuantización | bf16 sin cuantizar en este repo; la model card menciona variantes `-8bit` y `-4bit` del mismo artefacto |
| Idiomas soportados | No declarados en esta conversión (heredados del modelo base Qwen2.5-Omni-3B) |
| Licencia | Qwen Research License Agreement (`qwen-research`, etiqueta `license: other`): solo investigación y evaluación, no comercial |
| Formato de pesos | `safetensors` en formato MLX (`encoder.safetensors` con claves `thinker.model.*` y `thinker.audio_tower.*`); convoluciones de audio en layout MLX (O, K, I) |

## Arquitectura y entrenamiento

El artefacto es una **conversión de pesos**, no un entrenamiento. Se compone de dos bloques: el *backbone* de texto Qwen2, un transformer decoder-only de 36 capas con 2048 de dimensión oculta, y una torre de audio con arquitectura tipo Whisper que actúa como encoder acústico. Los pesos se han reorganizado al layout que espera MLX; en particular, las convoluciones de la torre de audio se reordenan a formato (O, K, I), un detalle que rompe la paridad si se manipulan a mano. El `config.json` incluye la configuración de texto, la de audio y los identificadores de tokens; el tokenizer, la plantilla de chat y los ficheros de preprocesado se mantienen sin cambios respecto al original.

La model card documenta la fidelidad numérica de la conversión en fp32 contra `transformers` 4.57.1: identificadores de tokens idénticos, características de Whisper con relL2 de 1,5e-6, torre de audio con 3,9e-6, último estado oculto con 2,2e-5 y la condición fusionada de 36 capas usada por AuK con 3,8e-6. Además, los niveles bf16, 8 bits y 4 bits superan la puerta de calidad preregistrada de AuK (tasa de error, SIM de CAM++ y DNSMOS frente a fp32). No se detallan datos de entrenamiento, composición del corpus ni fases de RLHF/DPO porque no se ha entrenado nada aquí: se heredan del Qwen2.5-Omni-3B original.

## Capacidades

- Extracción de estados ocultos de texto: 36 capas con 2048 dimensiones, aptas como *embeddings* contextuales congelados.
- Codificación de audio mediante la torre tipo Whisper, con salida de características verificada numéricamente.
- Generación de la condición fusionada de 36 capas que consume AuK como encoder semántico.
- Integración nativa con `mlx-swift` y con el repositorio `xocialize/mlx-auk-swift`.
- Ejecución en bfloat16, 8 bits y 4 bits con paridad validada frente a fp32.
- **No** dispone de cabeza LM: no genera texto ni tokens de forma autorregresiva.
- **No** incluye torre de visión: no procesa imágenes ni vídeo.
- **No** incluye *talker* ni `token2wav`: no sintetiza voz.
- Capacidades multilingües: no verificadas en esta conversión (dependen del modelo base).

## Casos de uso

- **Encoder semántico de AuK en aplicaciones Swift**: el escenario para el que se publicó el artefacto. Se carga con `mlx-swift` para producir las condiciones de 36 capas que alimentan el resto del pipeline de AuK en macOS e iOS.
- **Investigación en modelos de habla en Apple Silicon**: sirve como bloque de percepción en prototipos de sistemas audio-a-audio, añadiendo por separado una cabeza de lenguaje y un sintetizador, ya que el paquete entrega solo la representación.
- **Extracción de embeddings de texto para búsqueda y recuperación**: al ejecutarse en MLX sobre memoria unificada, permite generar representaciones de documentos y consultas en un Mac portátil sin GPU dedicada, siempre en contexto de evaluación.
- **Representaciones de audio para clasificación y diarización**: los estados de la torre de audio pueden congelarse y alimentar cabezas ligeras entrenadas aparte (regresión logística, MLP pequeño) para tareas de etiquetado acústico.
- **Destilación de representaciones**: usar los estados ocultos como objetivo de un modelo estudiante de menor tamaño, aprovechando la paridad numérica documentada para garantizar que el *teacher* es fiel al original.
- **Validación de pipelines de conversión MLX**: el modelo funciona como banco de pruebas reproducible de paridad (relL2 por etapa) frente a `transformers`, útil para equipos que desarrollan工具 de conversión de pesos.
- **Evaluación de cuantización**: comparar bf16, 8 bits y 4 bits con las métricas de calidad de AuK sobre un mismo conjunto de audio permite cuantificar la degradación real de cada nivel antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El modelo, además, no es evaluable en tareas generativas al carecer de cabeza LM.

La única métrica objetiva publicada es la paridad numérica de la conversión, en fp32 frente a `transformers` 4.57.1:

| Etapa | Error relativo L2 |
|---|---|
| Identificadores de tokens | idénticos |
| Características de Whisper | 1,5e-6 |
| Torre de audio | 3,9e-6 |
| Último estado oculto | 2,2e-5 |
| Condición fusionada de 36 capas (AuK) | 3,8e-6 |

Los niveles bf16, 8 bits y 4 bits superan la puerta de calidad preregistrada de AuK (tasa de error, SIM de CAM++ y DNSMOS contra fp32), sin que se publiquen los valores numéricos de dichas métricas.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: unos 8-9 GB en bf16 (7,45 GB de pesos más activaciones), aproximadamente 3,7-4,5 GB en 8 bits y 1,9-2,5 GB en 4 bits. Estimaciones calculadas a partir del tamaño del checkpoint, no publicadas por el autor.
- Al no existir cabeza LM, no hay caché KV persistente en el uso previsto como encoder: el coste dominante son los pesos y las activaciones de una pasada *forward*.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon. Cualquier chip de la familia M con memoria unificada suficiente sirve; para bf16 se recomienda un mínimo de 16 GB (M1/M2/M3/M4 base o superiores).
- Cabe en GPU de consumo en el sentido de equipos Apple domésticos: 4 bits en configuraciones de 8 GB, bf16 en 16 GB o más.
- Despliegue: `mlx` (Python) o `mlx-swift`; el caso canónico es `xocialize/mlx-auk-swift`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuye en GGUF y carece de cabeza de generación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salidas | Licencia | Formato |
|---|---|---|---|---|---|
| `mlx-community/Qwen2.5-Omni-3B-Thinker-bf16` (este) | 3B nominales, 7,45 GB en bf16 | No disponible | Estados ocultos de texto y audio | Qwen Research (no comercial) | safetensors MLX |
| `Qwen/Qwen2.5-Omni-3B` (original) | 3B nominales | No disponible | Texto y voz en streaming; percibe texto, imagen, audio y vídeo | No verificada en la información disponible | safetensors transformers |
| `mlx-community/AuK-bf16` | No disponible | No disponible | Condicionamiento de audio (consume este encoder) | No disponible | safetensors MLX |
| Qwen2.5-3B (encoder de texto, conversión MLX de la colección `mlx-community/qwen25`) | 3B | No disponible | Estados ocultos de texto | No disponible | safetensors MLX |

Frente al Qwen2.5-Omni-3B original, esta conversión pierde visión, generación de texto y síntesis de voz, pero gana ejecución nativa en MLX y una verificación de paridad explícita. Frente a un encoder de texto puro de la misma familia, añade la torre de audio a cambio de tamaño.

## Limitaciones y advertencias

- **No es un modelo de chat**: no genera texto. Cualquier expectativa de uso conversacional es un error de interpretación del artefacto.
- **Componentes ausentes por diseño**: torre de visión, LM head, *talker* y `token2wav` no están incluidos. No se puede reconstruir el modelo Omni completo solo con este repo.
- **Licencia restrictiva**: Qwen Research License Agreement, solo investigación o evaluación. El uso comercial requiere solicitar licencia a Alibaba Cloud. Afecta también a los pesos derivados.
- **Archivos modificados**: son pesos convertidos, no los originales; deben citarse como tales y conservar el aviso de atribución (`NOTICE`).
- **Dependencia de plataforma**: MLX está atado a Apple Silicon. No hay ruta directa a CUDA con las herramientas estándar (vLLM, TGI, llama.cpp).
- **Contexto no declarado**: la model card no especifica la ventana máxima soportada en esta conversión.
- **Sesgos y alucinación**: al no generar texto, el riesgo de alucinación clásico no aplica, pero los sesgos del corpus de Qwen2.5 se propagan a los estados ocultos y, por tanto, a cualquier cabeza entrendada encima.
- **Validación externa escasa**: el repositorio presenta cero descargas y cero valoraciones en el momento de la consulta; la única validación disponible es la del propio autor.
- **Cuantizaciones no publicadas en detalle**: existen niveles de 8 y 4 bits según la model card, pero sus métricas concretas no se incluyen en la información disponible.

## Enlaces

- [Modelo en HuggingFace: mlx-community/Qwen2.5-Omni-3B-Thinker-bf16](https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-bf16)
- [Modelo base: Qwen/Qwen2.5-Omni-3B](https://huggingface.co/Qwen/Qwen2.5-Omni-3B)
- [Encoder consumidor: mlx-community/AuK-bf16](https://huggingface.co/mlx-community/AuK-bf16)
- [Repositorio xocialize/mlx-auk-swift](https://github.com/xocialize/mlx-auk-swift)
- [Repositorio oficial QwenLM/Qwen2.5-Omni](https://github.com/QwenLM/Qwen2.5-Omni)
- [Página de Qwen2.5-Omni en openlm.ai](https://openlm.ai/qwen2.5-omni/)
- [Colección Qwen2.5 de mlx-community](https://huggingface.co/collections/mlx-community/qwen25)
- [Repositorio mx4ai/qwen2.5](https://github.com/mx4ai/qwen2.5)

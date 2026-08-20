# phrodigy/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF

## Resumen

El modelo **Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF** es un fine tune multi-etapa del modelo base Qwen3.6-27B, desarrollado por una colaboración entre DavidAU, Nightmedia, TeichAI, armand0e y trohrbaugh. Se distribuye exclusivamente en formato GGUF (tanto versiones regulares como MTP, multi-token prediction) y está pensado para ejecutarse en hardware de consumo mediante Unsloth. Su nombre hace referencia a la métrica ARC-C de 711 puntos, que según el autor supera el umbral de 700 reservado a modelos cerrados como los de OpenAI, Anthropic o Google.

El modelo combina múltiples técnicas de ajuste: fine tunes multi-etapa, merges multi-estado, trazas de razonamiento de Claude Opus, datos de GPT-5 (Polaris) y datasets propios (F451, Polar-STRICT). Además, incorpora el proceso "Heretic" de ablación de negativas (uncensored/abliterated) y mantiene las capacidades de visión del modelo base, ya que el pipeline declarado es image-text-to-text. Con 26,9 mil millones de parámetros, se posiciona como una alternativa de código abierto con licencia Apache 2.0 para tareas de razonamiento, generación de código, escritura creativa y roleplaying, con soporte para inglés y chino.

La relevancia actual del modelo radica en que, según su autor, supera al Qwen3.6-27B original en 6 de 7 benchmarks y al Qwen3.6-35B-A3B en los 7, manteniendo un tamaño que permite su ejecución en GPUs de consumo. Los quants NEO IMATRIX mejoran la precisión entre un 2 y un 4 % respecto a GGUF convencionales, y el tensor de salida se ha elevado a precisión 16 bit en todas las cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.6-27B, sin especificaciones detalladas) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF NEO IMATRIX (regulares y MTP); tensor de salida en 16 bit; tensores MTP en Q8_0 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.6-27B, un transformer denso con capacidades multimodales (visión y texto). No se han proporcionado detalles adicionales sobre la configuración interna (número de capas, heads, dimensiones ocultas, etc.). El proceso de entrenamiento es un fine tune multi-etapa que combina varios datasets y técnicas:

- **Multi-stage fine tune**: varias rondas de ajuste sobre el modelo base, cada una validada con benchmarks y pruebas humanas.
- **Multi-stage merge**: fusión de múltiples modelos ajustados en diferentes etapas.
- **Trazas de razonamiento**: incorpora trazas de Claude Opus (thinking/reasoning) y de GPT-5 (Polaris, no razonamiento).
- **Datasets**: DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, junto con trazas "Light fable 5" de armand0e.
- **Proceso Heretic**: ablación de negativas (uncensored/abliterated) aplicada antes del fine tune.
- **Objetivos declarados**: mejorar la instrucción following y la resolución de problemas sin dañar el modelo base, evitando explícitamente el "benchmaxing".

Los GGUF se generan con la metodología NEO IMATRIX, que mejora la precisión de cuantización entre un 2 y un 4 % y el rendimiento en contexto largo. El tensor de salida se modifica a precisión 16 bit en todos los quants, y en las versiones MTP los tensores de predicción multi-token se fijan en Q8_0.

## Capacidades

- Generacion de texto y razonamiento avanzado, con modo "thinking" integrado.
- Generacion de codigo (etiquetado como "coder").
- Escritura creativa y ficcion en todos los generos, incluyendo roleplaying.
- Capacidades de vision (pipeline image-text-to-text), aunque no se detallan tareas especificas.
- Soporte de instrucciones complejas y seguimiento de ordenes multi-paso.
- Modelo "uncensored" (abliterated), sin restricciones de contenido en la generacion.
- Mejora en la resolucion de problemas y en la inteligencia general respecto al base.
- Compatible con endpoints (endpoints_compatible) y con cuantizaciones extremas (incluso las mas bajas mantienen rendimiento, segun el autor).

## Casos de uso

- **Asistente de programacion en produccion**: al ser un modelo de 27B con capacidades de codigo y razonamiento, puede integrarse en entornos de desarrollo como autocompletado avanzado o generacion de funciones completas, con la ventaja de poder ejecutarse en GPUs de consumo mediante GGUF.
- **Escritura creativa y narrativa**: el modelo muestra un estilo literario agresivo y detallado, adecuado para generar ficcion, dialogos y escenas con profundidad psicologica. Su naturaleza "uncensored" permite explorar temas que otros modelos rechazarian.
- **Roleplaying y juegos de texto**: su capacidad para mantener personajes coherentes y generar respuestas inmersivas lo hace util para juegos de rol por texto, chatbots de personajes o mundos interactivos.
- **Razonamiento y resolucion de problemas**: con una puntuacion ARC-C de 711, puede abordar tareas de logica, matematicas y analisis que requieren pensamiento multi-paso, util en entornos educativos o de investigacion.
- **Procesamiento de documentos con vision**: al soportar entrada de imagenes, puede describir o analizar contenido visual combinado con texto, por ejemplo para extraer informacion de capturas o diagramas.
- **Despliegue en entornos sin conexion**: al ser GGUF y con licencia Apache 2.0, puede ejecutarse localmente con llama.cpp u Ollama, garantizando privacidad de datos en aplicaciones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la informacion disponible. El autor menciona los siguientes datos cualitativos:

- Puntuacion ARC-C de 711 en cuantizacion de 8 bit y de 4 bit.
- Supera al Qwen3.6-27B base en 6 de 7 benchmarks y lo iguala en el septimo.
- Supera los 7 benchmarks del Qwen3.6-35B-A3B.
- Los quants NEO IMATRIX mejoran la precision entre un 2 y un 4 % respecto a GGUF normales.

No se proporcionan valores numericos para MMLU, HumanEval, GSM8K u otras metricas estandar. Se recomienda consultar la comunidad de HuggingFace para resultados de terceros.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de ~27B, una cuantizacion Q4_K_M requiere aproximadamente 16-18 GB de VRAM; Q8 requiere unos 28-30 GB. Estas cifras son estimaciones orientativas basadas en el tamaño del modelo, no datos oficiales.
- **GPUs recomendadas**: RTX 3090/4090 (24 GB) para cuantizaciones de 4-6 bit; A100 o H100 para 8 bit o contexto largo.
- **Compatibilidad con consumer GPU**: si, con cuantizaciones de 4 bit o inferiores en GPUs de 24 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (con backend GGUF), text-generation-webui, o cualquier runtime compatible con GGUF.
- **Latencia y throughput**: no disponible. Dependera de la GPU, la cuantizacion y el tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C (mencionado) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 (este) | 26,9B | No disponible | 711 (8 bit y 4 bit) | Apache 2.0 | GGUF |
| Qwen3.6-27B (base) | 27B | No disponible | Inferior (6 de 7 benchmarks superados) | Apache 2.0 | Safetensors |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | No disponible | Inferior (superado en los 7 benchmarks) | Apache 2.0 | Safetensors |
| Qwen3.5-27B | 27B | No disponible | Inferior (segun el autor) | Apache 2.0 | Safetensors |

Nota: los datos de ARC-C son declaraciones del autor, no verificados de forma independiente en la informacion proporcionada.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo "uncensored" y abliterated, puede generar contenido inapropiado, ofensivo o falso sin filtros. No es adecuado para aplicaciones donde se requiera moderacion de contenido.
- **Riesgo de alucinacion**: no se han publicado evaluaciones especificas sobre tasas de alucinacion; como todo LLM, puede inventar hechos o citas.
- **Limitaciones de idioma**: solo soporta ingles y chino de forma declarada; el rendimiento en otros idiomas no esta garantizado.
- **Contexto**: la longitud de contexto no se ha especificado; se recomienda verificar antes de usarlo en tareas de ventana larga.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6 puede tener condiciones adicionales; se debe revisar la licencia del modelo original.
- **Rendimiento MTP**: el autor advierte que para las versiones MTP se debe mantener la temperatura en 1 o menos y un repetition penalty bajo; temperaturas altas degradan el rendimiento de la prediccion multi-token.
- **Fechas futuras**: el modelo fue creado en agosto de 2026, lo que sugiere que es una version muy reciente; puede haber pocos reportes de uso en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/phrodigy/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Modelo relacionado (40B Eleanor): https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo relacionado (40B Grand Intelligence): https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo de prueba (9B Defiant): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

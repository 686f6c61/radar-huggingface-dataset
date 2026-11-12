# kabcnd/Kenzan-Qwen3.8-27B-Abliterated-GGUF

## Resumen

Kenzan-Qwen3.8-27B-Abliterated-GGUF es una distribución cuantizada en formato GGUF del modelo Huihui-Qwen3.8-27B-abliterated, publicado por el usuario kabcnd en Hugging Face. Se trata de una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas del espacio de activaciones) del modelo Qwen3.8-27B, empaquetada con un esquema de cuantización ternaria propietario denominado "Kenzan" (etiquetado como ptq1_0 / q4_1 híbrido de 1,75 bits por peso). El modelo está pensado para ejecutarse en hardware de Apple Silicon mediante Metal y llama.cpp, e incorpora mecanismos propios como un "codebook", "speculative decoding" (dflash2) y un "kenzan-router".

La relevancia de esta ficha es doble: por un lado documenta una técnica de compresión extrema (por debajo de 2 bits por peso) aplicada a un modelo de 27B parámetros, lo que teóricamente permitiría su despliegue en equipos de consumo; por otro lado, la naturaleza "abliterated" y "uncensored" del modelo base implica que se ha eliminado total o parcialmente el alineamiento de seguridad, lo que tiene implicaciones importantes para su uso en producción.

Cabe señalar que la información pública disponible es muy limitada: el repositorio no presenta descargas ni "likes", el acceso está restringido (gated) y no se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni especificaciones completas de la arquitectura. Todo lo que se indica a continuación procede exclusivamente de los metadatos del repositorio y debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); detalles de atención no disponibles |
| Parametros totales | 27B (según nombre del modelo; no confirmado en ficha técnica) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF ternario ptq1_0 / q4_1 híbrido, ~1,75 bits por peso; "codebook" propietario |
| Idiomas soportados | en, zh, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); optimizado para Metal / Apple Silicon |
| Acceso | Restringido (gated): requiere aceptar condiciones en Hugging Face |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated |

## Arquitectura y entrenamiento

El modelo deriva del checkpoint Huihui-Qwen3.8-27B-abliterated, que a su vez es una versión "abliterated" del Qwen3.8-27B. La técnica de "abliteration" consiste en identificar las direcciones de activación asociadas al rechazo de contenido y proyectarlas fuera del espacio de pesos, de modo que el modelo deja de activar respuestas de negativa ante ciertas peticiones. No se dispone de información sobre el proceso exacto de abliteración aplicado por huihui-ai (número de capas intervenidas, método de proyección, calibración) ni sobre el dataset utilizado.

La aportación específica de este repositorio es la cuantización "Kenzan": un esquema ternario (valores {-1, 0, +1} con escalas) combinado con un "codebook" y una ruta híbrida q4_1 para determinadas capas, resultando en una media de 1,75 bits por peso. Los tags mencionan "speculative-decoding" y "dflash2", lo que sugiere la inclusión de un modelo borrador o cabezal especulativo para acelerar la decodificación, así como un "kenzan-router" que presumiblemente decide qué capas o expertos usan qué precisión. No se han publicado detalles técnicos del entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni de la calibración de la cuantización.

## Capacidades

- Generación de texto en inglés, chino y ruso (idiomas declarados en los tags).
- Razonamiento y generación de código heredados del modelo base Qwen3.8-27B (no verificados en esta cuantización).
- Modo "uncensored": el proceso de abliteración elimina las negativas de seguridad del modelo base, por lo que responde a peticiones que el modelo original rechazaría.
- Decodificación especulativa integrada (dflash2) para acelerar la inferencia en llama.cpp.
- Ejecución optimizada para Apple Silicon vía Metal.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles en esta variante.

## Casos de uso

- Investigación sobre cuantización extrema: el modelo sirve como banco de pruebas para estudiar la degradación de calidad al comprimir un transformer de 27B a 1,75 bits por peso, comparando salidas con el modelo original en fp16.
- Despliegue local en Mac con memoria unificada: gracias a la cuantización ternaria, un MacBook con 32-64 GB de memoria unificada podría cargar el modelo completo, permitiendo inferencia privada sin conexión.
- Experimentación con decodificación especulativa: el tag dflash2 permite evaluar el impacto del borrador especulativo en la latencia sobre Metal y llama.cpp.
- Estudio de alineamiento y seguridad: al ser una variante abliterated, es útil para investigadores que analizan cómo la eliminación de direcciones de rechazo afecta a la distribución de respuestas y a los sesgos del modelo.
- Generación de texto creativo sin filtros: para proyectos donde se requiere explorar contenido que los modelos alineados rechazan (siempre con revisión humana y cumplimiento legal).
- Prototipado de asistentes multilingües en en/zh/ru sobre hardware de consumo, con la advertencia de que la calidad en cuantización ternaria puede degradarse notablemente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 27B parámetros a 1,75 bits por peso ≈ 5,9 GB de pesos, más overhead de codebook, escalas y contexto (estimación orientativa; no confirmada por el autor). En la práctica, probablemente 8-12 GB con contexto moderado.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 Pro/Max/Ultra) con Metal, que es el objetivo declarado del repositorio. En GPU NVIDIA/AMD se podría usar vía llama.cpp, pero sin las optimizaciones específicas de Metal.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 12-16 GB de VRAM (RTX 3060 12GB, RTX 4070, etc.) y en Mac con 16 GB o más de memoria unificada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y potencialmente otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenzan-Qwen3.8-27B-Abliterated-GGUF | 27B | no disponible | GGUF ternario ~1,75 bit | Apache 2.0 | Gated |
| Huihui-Qwen3.8-27B-abliterated (base) | 27B | no disponible | safetensors (fp16/bf16) | según modelo base | Público |
| Qwen3.8-27B (original) | 27B | no disponible | safetensors | según Qwen | Público |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: no aplica filtros de seguridad, lo que lo hace inadecuado para aplicaciones de cara al público sin moderación adicional.
- La cuantización ternaria a 1,75 bits implica una pérdida de calidad sustancial respecto al modelo en fp16; no se han publicado evaluaciones que cuantifiquen esa degradación.
- Idiomas limitados a en, zh y ru; el castellano no está declarado como soportado.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar.
- No hay información sobre el dataset de entrenamiento ni sobre posibles sesgos heredados.
- Riesgo elevado de alucinación, agravado por la compresión extrema.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar la licencia del modelo base Qwen3.8-27B y del checkpoint abliterated antes de uso comercial.
- Sin benchmarks ni validación independiente: no se recomienda su uso en producción sin evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabcnd/Kenzan-Qwen3.8-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- llama.cpp (runtime compatible): https://github.com/ggerganov/llama.cpp

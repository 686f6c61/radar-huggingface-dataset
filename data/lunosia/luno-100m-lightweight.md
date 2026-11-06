# lunosia/Luno-100M-Lightweight

## Resumen

Luno-100M-Lightweight es un modelo lingüístico de aproximadamente 100 millones de parámetros (101.338.112 exactos) entrenado desde cero, es decir, sin inicializar a partir de pesos de terceros. Su característica más distintiva es que el modelo, el bucle de entrenamiento y la inferencia están implementados íntegramente en C# / .NET mediante TorchSharp y LibTorch, lo que lo convierte en un proyecto de referencia para desarrolladores del ecosistema .NET que quieran estudiar cómo se entrena y despliega un transformer decoder-only sin depender de Python.

El autor, lunosia, ha completado dos fases: preentrenamiento y ajuste por instrucciones supervisado (SFT), ambas sobre corpus en chino. El modelo es un transformer denso compacto (8 capas, contexto de 2048 tokens) orientado a generación de texto conversacional.

Su relevancia actual no reside en competir con modelos de producción, sino en servir como recurso educativo: permite leer el código de implementación en C#, entender el pipeline completo de entrenamiento y ejecutar inferencia en CPU sin dependencias de Python. El propio autor advierte que no hay evaluaciones que acrediten capacidad como asistente general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (RMSNorm, RoPE, GQA, Q/K Norm, SwiGLU, embeddings compartidos) |
| Parámetros totales | 101.338.112 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (pesos de inferencia en FP16, inferencia en CPU FP32) |
| Idiomas soportados | Chino (zh) |
| Licencia | other (condiciones en NOTICE.md y SOURCE_LICENSES.md del repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso con 8 capas, dimensión oculta de 1024, 8 cabezas de consulta (Q) y 4 cabezas clave-valor (KV), lo que implica Grouped Query Attention (GQA) con factor 2. Incorpora RMSNorm, codificación posicional rotatoria (RoPE), normalización de Q y K previa a la atención, activación SwiGLU y embeddings de entrada y salida compartidos. El vocabulario es de 16.000 tokens.

El entrenamiento se realizó en dos fases de una época cada una, con precisión mixta BF16 en el paso hacia delante y parámetros principales y estado de AdamW en FP32:

| Fase | Bytes JSONL tras limpieza | Actualizaciones de parámetros | Loss final |
|---|---:|---:|---:|
| Preentrenamiento | 3.000.001.583 | 12.350 | 3,0995 |
| SFT | 1.000.000.020 | 8.838 | 2,0068 |

Los datos de entrenamiento proceden de fuentes documentadas en SOURCE_LICENSES.md y data-sources.json del repositorio. No hay indicios de RLHF ni DPO. Una particularidad importante: aunque el campo `model_type` del `config.json` es `qwen3` (para compatibilidad con herramientas estándar), el modelo fue entrenado desde inicialización aleatoria y no carga pesos preentrenados de terceros. Los pesos de inferencia se almacenan en FP16 y la línea de comandos en C# los carga en FP32 sobre CPU.

## Capacidades

- Generación de texto conversacional en chino, tras el ajuste SFT.
- Comprensión y generación limitadas al idioma chino; no hay soporte declarado para otros idiomas.
- Contexto de 2048 tokens, suficiente para diálogos cortos y fragmentos de texto.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de visión, audio ni modo de razonamiento extendido.
- Valor principal como artefacto educativo: el código del modelo, entrenamiento e inferencia está disponible en C# (proyecto LunoSharp sobre TorchSharp).

## Casos de uso

- Aprendizaje de implementación de transformers en C#: el repositorio LunoSharp permite leer cómo se codifican atención GQA, RoPE, SwiGLU y el bucle de entrenamiento con AdamW sobre TorchSharp, algo poco habitual en el ecosistema .NET.
- Formación en entrenamiento de modelos: al ser un modelo pequeño (101 M), se puede reproducir o modificar el pipeline de preentrenamiento y SFT sin grandes recursos de cómputo.
- Experimentación con inferencia en CPU: el tamaño reducido permite ejecutar el modelo en CPU FP32, útil para entornos sin GPU o para pruebas locales rápidas.
- Prototipado de chatbots en chino de baja exigencia: puede servir como base para demos conversacionales sencillas en chino, con la advertencia de que puede cometer errores factuales, de cálculo o de código.
- Base para fine-tuning educativo: su vocabulario de 16.000 tokens y su tamaño lo hacen manejable para experimentos de ajuste adicional en entornos académicos.
- Integración en aplicaciones .NET: al estar implementado en C#, puede integrarse directamente en servicios .NET sin puentes hacia Python, siempre que se acepten sus limitaciones de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que «actualmente no se proporcionan resultados de evaluación que acrediten capacidad como asistente general». El único dato de rendimiento de entrenamiento es el loss final: 3,0995 en preentrenamiento y 2,0068 en SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; con pesos FP16 el archivo ocupa unos 0,4 GB en disco y la inferencia se realiza en CPU FP32, por lo que bastaría con unos 0,5-1 GB de RAM.
- GPU recomendadas: no necesarias para inferencia; para reentrenar o ajustar el modelo, una GPU de consumo (por ejemplo, RTX 3060 de 12 GB o superior) debería ser suficiente dado el tamaño de 101 M de parámetros.
- Cabe con holgura en cualquier GPU de consumo moderna e incluso funciona exclusivamente en CPU.
- Despliegue: la vía soportada oficialmente es la línea de comandos LunoSharp en C# (`dotnet .probe/learn-cpu/bin/LunoSharp.dll chat --weights ... --tokenizer ...`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI; la compatibilidad teórica con herramientas estándar vía `model_type: qwen3` no está verificada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma principal | Licencia | Enfoque |
|---|---|---|---|---|---|
| Luno-100M-Lightweight | 101,3 M | 2048 | Chino | other (ver NOTICE.md) | Educativo, implementado en C#/.NET |
| Qwen3-0.6B | 600 M (aprox.) | 32.768 (aprox.) | Multilingüe (29+ idiomas) | Apache 2.0 | Producción general |
| SmolLM2-135M | 135 M | 2048 | Inglés | Apache 2.0 | Educativo/edge, ecosistema Python |

Frente a estas alternativas, Luno-100M es notablemente más limitado en capacidades y contexto, y su valor diferencial es la implementación nativa en C# y la transparencia del proceso de entrenamiento desde cero. No está pensado para competir en benchmarks con Qwen3 ni SmolLM2.

## Limitaciones y advertencias

- El autor advierte explícitamente que las respuestas pueden contener errores factuales, de cálculo o de código; no debe usarse como asistente de producción.
- No hay evaluaciones publicadas que acrediten capacidad como asistente general.
- Soporte lingüístico limitado al chino; el rendimiento en otros idiomas, incluido el castellano, no está verificado y probablemente sea pobre.
- Contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- La licencia es «other»: las condiciones de uso comercial deben revisarse en NOTICE.md, SOURCE_LICENSES.md y data-sources.json, ya que pesos y datos de origen tienen condiciones separadas.
- Solo se distribuye un único juego de parámetros SFT finales; para reanudar el entrenamiento se requieren archivos FP32, de optimizador y de progreso guardados aparte, que no están incluidos.
- El campo `model_type: qwen3` en `config.json` es solo para compatibilidad de formato; asumir equivalencia con Qwen3 sería un error.
- Proyecto con descargas muy bajas (619) y un solo «like», sin comunidad de soporte establecida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lunosia/Luno-100M-Lightweight
- Fuente de licencias de datos: https://huggingface.co/lunosia/Luno-100M-Lightweight/blob/main/SOURCE_LICENSES.md
- Fuentes de datos: https://huggingface.co/lunosia/Luno-100M-Lightweight/blob/main/data-sources.json
- Aviso de licencia: https://huggingface.co/lunosia/Luno-100M-Lightweight/blob/main/NOTICE.md

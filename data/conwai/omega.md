# ConwAI/omega

## Resumen

Conway-Omega es un modelo de lenguaje generativo de 188 millones de parámetros (212,7 millones según el peso real en safetensors) desarrollado por ConwAI, entrenado desde cero con una arquitectura de transformer decoder profunda y estrecha ("deep-thin"). Está optimizado para inferencia conversacional de baja latencia en hardware de borde, como Apple Silicon con memoria unificada y estaciones de trabajo locales. Su versión v8 corresponde al checkpoint de paso 14.760 y se distribuye bajo licencia GPL-3.0.

El modelo resuelve el problema de ejecutar asistentes conversacionales en entornos con recursos limitados, ofreciendo una alternativa ligera a modelos de gran tamaño. Su ventana de contexto es de 1024 tokens, lo que lo hace adecuado para diálogos cortos y tareas de generación de texto simples. Incluye formatos de pesos nativos para MLX (Apple Silicon), PyTorch y Safetensors, además de un servidor FastAPI autocontenido con interfaz de chat.

La relevancia actual radica en su enfoque en eficiencia y despliegue local, con un tamaño que cabe en GPUs de consumo y en dispositivos Apple. Sin embargo, su contexto limitado y su entrenamiento exclusivamente en inglés restringen sus aplicaciones a escenarios conversacionales básicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder profundo y estrecho (26 capas, dim 768) con GQA (3:1) y SwiGLU |
| Parametros totales | 212.773.888 (según safetensors); la model card declara 188.299.776 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No especificado; se proporcionan pesos en fp16 (PyTorch) y MLX nativo |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | GPL-3.0 |
| Formato de pesos | Safetensors, PyTorch (.pt), NumPy/MLX (.npz), tokenizer.json |

## Arquitectura y entrenamiento

Conway-Omega emplea un transformer decoder con 26 capas y una dimensión oculta de 768, configurado en una proporción "profunda y estrecha" para favorecer la expresividad jerárquica con un coste computacional moderado. Usa Grouped Query Attention (GQA) con 12 cabezas de consulta y 4 cabezas de clave/valor (ratio 3:1), lo que reduce el uso de memoria y acelera la inferencia. La red feed-forward emplea activación SwiGLU con dimensión oculta de 2048. Incorpora RoPE (base theta 10.000) con QK-Norm para estabilidad.

El modelo fue entrenado desde cero, aunque la información disponible no detalla el tamaño del dataset, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. El tokenizador es byte-level BPE con un vocabulario de 32.000 tokens. El checkpoint v8 corresponde al paso 14.760 de entrenamiento. No se especifican innovaciones técnicas adicionales más allá de la arquitectura descrita.

## Capacidades

- Generación de texto conversacional con formato de roles estricto (`<|user|>` y `<|omega|>`).
- Soporte de diálogos multi-turno dentro de una ventana de contexto de 1024 tokens.
- Ejecución en Apple Silicon mediante pesos MLX nativos y aceleración Metal.
- Inferencia en CPU/GPU local con pesos PyTorch fp16.
- API de chat JSON y servidor web autocontenido (FastAPI) incluidos en el repositorio.
- No se declara soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chatbots de atención al cliente básicos: el modelo puede mantener conversaciones cortas y sencillas en inglés, con respuestas generadas en tiempo real gracias a su baja latencia en hardware local.
- Asistentes personales embebidos en dispositivos de bajo consumo: su tamaño reducido permite ejecutarlo en Raspberry Pi o sistemas con poca memoria, ideal para prototipos de asistentes de voz o texto.
- Generación de respuestas automáticas en aplicaciones de mensajería: integrable mediante la API FastAPI para responder mensajes directos en inglés.
- Prototipado rápido de sistemas conversacionales: los desarrolladores pueden desplegarlo localmente con el servidor incluido para probar flujos de diálogo sin depender de servicios en la nube.
- Educación e investigación en modelos pequeños: útil para estudiar arquitecturas deep-thin, GQA y entrenamiento desde cero en entornos académicos.
- Generación de texto creativo breve: puede producir párrafos cortos, ideas o borradores en inglés, aunque con limitaciones por su contexto reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para 212M parámetros en fp16 se requieren aproximadamente 425 MB de memoria; en cuantización de 4 bits (si estuviera disponible) serían unos 106 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) o Apple Silicon con memoria unificada (M1/M2/M3).
- Cabe en GPUs de consumo de gama baja y media, así como en CPUs modernas con 4 GB de RAM.
- Opciones de despliegue: servidor FastAPI incluido, ejecución directa con PyTorch, o integración con MLX en macOS. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; se espera baja latencia en hardware local por su tamaño reducido, pero sin cifras concretas.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información suministrada.

## Limitaciones y advertencias

- Ventana de contexto muy limitada (1024 tokens), lo que impide manejar documentos largos o conversaciones extensas.
- Entrenado únicamente en inglés; no soporta otros idiomas de forma fiable.
- Licencia GPL-3.0: cualquier uso o modificación obliga a distribuir el código derivado bajo la misma licencia, lo que puede ser restrictivo para aplicaciones comerciales propietarias.
- Sin información sobre sesgos o alucinaciones; se recomienda validar las respuestas en entornos de producción.
- No se especifican técnicas de alineación (RLHF/DPO), por lo que el modelo puede generar contenido inapropiado o inexacto.
- El tamaño real de parámetros (212M) difiere del declarado en la model card (188M), lo que puede afectar a estimaciones de memoria y rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ConwAI/omega
- Sitio web oficial: https://conw.ai

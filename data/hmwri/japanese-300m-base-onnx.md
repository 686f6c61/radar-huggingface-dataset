# hmwri/japanese-300m-base-onnx

## Resumen

mlab-LLM 300M Base - ONNX es la versión cuantizada y empaquetada para inferencia en navegador de un modelo de lenguaje de tipo decoder-only Transformer denso, entrenado desde cero sobre un corpus en japonés. Lo publica el usuario hmwri en Hugging Face y está pensado exclusivamente para experimentación con Transformers.js y WebGPU: no es un modelo conversacional ni sigue instrucciones, sino un modelo base de completado de texto.

El modelo original (BF16) tiene 299.157.376 parámetros, 28 capas, anchura oculta de 896 y una longitud de contexto configurada de 4.096 tokens en total entre entrada y salida. Esta versión ONNX ofrece dos variantes cuantizadas a 4 bits: `q4` (unos 287 MB, activaciones FP32) y `q4f16` (unos 212 MB, activaciones FP16). El autor recomienda empezar por `q4` porque en su entorno de desarrollo WebGPU `q4f16` producía salidas inestables con repeticiones.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento desde cero de un modelo japonés pequeño y su conversión a un formato que corre íntegramente en el navegador del usuario, sin backend. Es una pieza experimental, no un modelo de producción: no hay benchmarks publicados, la licencia no está especificada y no ha pasado por SFT de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-compatible decoder-only Transformer, denso (no MoE) |
| Parametros totales | 299.157.376 (modelo original) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 4.096 tokens (entrada + salida, según configuración) |
| Tipos de cuantizacion | 4-bit (`q4`, activaciones FP32) y 4-bit (`q4f16`, activaciones FP16) |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible (sin especificar) |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`, `onnx/model_q4f16.onnx`) |
| Capas / anchura oculta | 28 / 896 |
| Atención | GQA causal, 14 cabezas de query / 7 de KV, anchura de cabeza 64 |
| FFN | SwiGLU, anchura intermedia 2.688 |
| Normalización / posiciones | RMSNorm / RoPE con theta 10.000 |
| Vocabulario / embeddings | 32.768, embedding de entrada y LM head compartidos |
| Tokenizer | SentencePiece Unigram, normalización `nmt_nfkc`, byte fallback UTF-8 |
| Librería de inferencia | Transformers.js (`@huggingface/transformers@4.2.0`), WebGPU |
| Tamano del repo | 0,5 GB |
| Descargas | 626 |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only denso compatible con Llama: 28 capas, anchura oculta 896, atención causal con grouped-query attention (14 cabezas de query y 7 de clave-valor, 64 dimensiones por cabeza), FFN SwiGLU con anchura intermedia 2.688, RMSNorm y codificación posicional RoPE con theta 10.000. El vocabulario es de 32.768 tokens con embeddings de entrada y LM head compartidos. No hay mezcla de expertos ni ninguna innovación de atención lineal o decodificación especulativa documentada.

El preentrenamiento se hizo sobre el subconjunto `sample_10BT` del dataset FineWeb2 Edu Japanese, con 162.378 pasos de 65.536 tokens por paso, lo que suma 10.641.604.608 tokens procesados. No hubo SFT de instrucciones ni RLHF/DPO: el autor lo indica explícitamente. La conversión a ONNX y la cuantización son solo transformaciones del formato de inferencia, no un entrenamiento adicional. Los detalles completos de hiperparámetros están en la model card de la versión BF16.

## Capacidades

- Generación de texto por completado: el modelo continúa un fragmento de texto japonés que se le pasa como entrada; no se usa chat template.
- Modelado del lenguaje en japonés sobre dominio educativo/general, derivado del corpus FineWeb2 Edu.
- Inferencia local en navegador mediante Transformers.js y WebGPU, con ejecución en el dispositivo del usuario.
- Dos niveles de cuantización (`q4` y `q4f16`) para ajustar el uso de memoria frente a la estabilidad de salida.
- Tokenizer con normalización `nmt_nfkc` y byte fallback para caracteres fuera de vocabulario.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso guiado ni comportamiento de agente.
- No tiene modo de pensamiento (thinking), visión, audio ni otras modalidades.
- No sigue instrucciones de forma fiable al no haber pasado por SFT.

## Casos de uso

- Completado de texto en aplicaciones web japonesas: integrar el modelo con Transformers.js para sugerir continuaciones de frases en editores o formularios, aprovechando que la inferencia ocurre en el cliente y no requiere servidor.
- Demostraciones educativas de LLM en el navegador: usar el modelo para mostrar en un curso o taller cómo funciona un transformer generativo sin infraestructura de backend, con un peso de 212-287 MB descargable.
- Prototipado de autocompletado en teclados o campos de búsqueda en japonés: el modelo puede generar continuaciones cortas (`max_new_tokens` bajo) con decodificación greedy para minimizar latencia.
- Pruebas de viabilidad de WebGPU en distintos navegadores y GPUs: el modelo sirve como banco de pruebas ligero para medir inicialización de sesión, estabilidad numérica de las cuantizaciones y compatibilidad de drivers.
- Generación de texto auxiliar offline en aplicaciones PWA: al ejecutarse en el dispositivo, funciona sin conexión una vez cacheado el modelo, útil para entornos con conectividad limitada.
- Punto de partida para fine-tuning en japonés: aunque esta versión ONNX es solo para inferencia, el autor remite a la versión BF16 como base para entrenamiento adicional, lo que permite experimentar con un modelo pequeño y entrenado íntegramente en japonés.
- Investigación sobre calidad de cuantización 4-bit en WebGPU: comparar `q4` frente a `q4f16` en distintos hardware para estudiar degradación de salida, aunque el autor no aporta métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reporta puntuaciones en benchmarks estándar, diferencias de precisión frente a BF16 ni comparativas de velocidad o memoria por GPU para esta versión ONNX, y advierte que la validation loss del entrenamiento original no puede reutilizarse como métrica del modelo cuantizado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el tamaño de archivo es de unos 287 MB (`q4`) y 212 MB (`q4f16`), pero el autor aclara que el tamaño de archivo no equivale al uso de memoria GPU en ejecución.
- GPU recomendadas: no disponibles; el modelo está diseñado para WebGPU, por lo que depende de la GPU integrada o dedicada del equipo cliente y de su driver.
- GPU de consumo: el tamaño reducido sugiere que puede ejecutarse en GPUs integradas y dedicadas de gama baja compatibles con WebGPU, aunque no hay validación publicada por modelo.
- Despliegue: Transformers.js 4.2.0 con `device: "webgpu"` y `dtype: "q4"` o `"q4f16"`; requiere HTTPS o localhost. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para esta versión ONNX.
- Latencia y throughput: no disponibles; el autor señala que la primera ejecución incluye descarga e inicialización de la sesión de inferencia, que puede tardar incluso después de completar la descarga.
- Estabilidad: en el entorno WebGPU del autor, `q4f16` mostró salidas inestables con repeticiones y `q4` mejoró el comportamiento; no se ha hecho un análisis de causa raíz ni una validación exhaustiva por GPU y driver.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| hmwri/japanese-300m-base-onnx | 299M (denso) | 4.096 tokens | ONNX, Transformers.js/WebGPU, cuantización 4-bit | no disponible | Base sin SFT, solo japonés, experimental |
| hmwri/mlab-LLM-300M-Base | 299M (denso) | 4.096 tokens | BF16, Python/Transformers | no disponible | Mismo modelo sin cuantizar; punto de partida para fine-tuning |
| hmwri/mlab-LLM-MoE-900M | no disponible | no disponible | no disponible | no disponible | Variante MoE con SFT y entrenamiento adicional; modelo distinto |
| Alternativas de ~300M en navegador | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de instrucciones: no ha pasado por SFT, por lo que no sigue instrucciones ni mantiene conversaciones de forma fiable.
- Puede generar repeticiones, texto incoherente, información falsa y contenido inapropiado.
- No garantiza factualidad ni seguridad; el autor lo desaconseja para chat de propósito general o para decisiones importantes.
- La cuantización y el entorno de ejecución pueden alterar la calidad y las salidas respecto a la versión BF16 sin cuantizar.
- El contexto configurado es de 4.096 tokens en total entre entrada y salida; el autor recomienda empezar con entradas y generaciones cortas.
- Solo cubre japonés; no hay soporte multilingüe documentado.
- La licencia no está especificada: la descarga pública no implica permiso de reutilización ni de uso comercial. Los datos de origen tienen sus propias condiciones.
- El tokenizer con byte fallback no garantiza comprensión semántica de caracteres ni preservación exacta de la notación original.
- La inferencia se ejecuta en el dispositivo, pero la model card no garantiza las políticas de comunicación o almacenamiento de las aplicaciones web que integren el modelo.
- No hay validación publicada de estabilidad por GPU, driver o versión de Transformers.js.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmwri/japanese-300m-base-onnx
- Versión BF16 base: https://huggingface.co/hmwri/mlab-LLM-300M-Base
- Variante MoE con SFT: https://huggingface.co/hmwri/mlab-LLM-MoE-900M
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Foro de discusión / reporte de fallos: https://huggingface.co/hmwri/japanese-300m-base-onnx/discussions
- Perfil del autor: https://huggingface.co/hmwri
- Librería Transformers.js: https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0

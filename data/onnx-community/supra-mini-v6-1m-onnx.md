# onnx-community/Supra-Mini-v6-1M-ONNX

## Resumen

Supra-Mini-v6-1M-ONNX es la exportación al formato ONNX del modelo de lenguaje Supra-Mini-v6-1M, desarrollado por SupraLabs y convertido automáticamente por la comunidad onnx-community mediante un Space de Hugging Face. Se trata de un transformer decoder-only con arquitectura Llama de 1.410.688 parámetros (aproximadamente 1,4 M), 6 capas, dimensión oculta 128 y una ventana de contexto máxima de 1024 tokens. Su interés no es la calidad del texto generado, sino servir como pieza mínima y ejecutable en el navegador o en CPU para probar infraestructura de inferencia.

El modelo está pensado explícitamente para entornos con recursos muy limitados: se entrenó en una única NVIDIA RTX 5060 Ti de 16 GB durante unas 3 horas para una época, sobre los primeros 5.000 millones de tokens de una mezcla de FineWeb-Edu (70 %) y Cosmopedia-v2 (30 %). La versión ONNX añade compatibilidad con Transformers.js, de modo que puede cargarse con la pipeline `text-generation` sin necesidad de Python ni de GPU. El autor declara unas limitaciones severas: no razona, no conversa, no programa y produce texto incoherente o factualmente incorrecto con frecuencia.

Su relevancia actual es, por tanto, instrumental: es un banco de pruebas de 1,4 M de parámetros para validar tokenizadores, pipelines de conversión ONNX, comparativas de cuantización, pruebas de humo en CI o demostraciones didácticas del funcionamiento interno de un transformer, no un modelo para producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, denso) |
| Parámetros totales | 1.410.688 (≈1,4 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (`max_position_embeddings`) |
| Tipos de cuantización | no disponible; el repositorio no documenta las precisiones exportadas (fp32/fp16/int8) y el tamaño reportado del repo es 0,0 GB |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (librería `transformers.js`); modelo base en formato nativo en `SupraLabs/Supra-Mini-v6-1M` |
| Dimensión oculta | 128 |
| Dimensión intermedia (FFN) | 256 |
| Capas ocultas | 6 |
| Cabezas de atención | 4 |
| Cabezas KV (GQA) | 2 |
| Tamaño de vocabulario | 4096 (tokenizador BPE propio); la guía de entrenamiento menciona un script con vocab 16.384, discrepancia no aclarada en la model card |
| Precisión de entrenamiento | bfloat16 |
| Learning rate / weight decay | 6e-4 / 0,1 |
| Pérdida final (CrossEntropy, train) | 3,79 |
| Pipeline | `text-generation` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con atención multi-cabeza con consultas agrupadas (4 cabezas de atención y 2 cabezas de clave-valor), 6 capas, dimensión oculta 128 y FFN de 256. Usa embeddings posicionales de tipo Llama con un máximo de 1024 posiciones y un tokenizador BPE propio de vocabulario reducido (4096 tokens según la configuración del modelo), lo que lo aleja de los tokenizadores de 32k-128k habituales en modelos mayores y afecta directamente a su eficiencia por token. No incorpora innovaciones de decodificación especulativa, atención lineal ni mecanismos híbridos SSM: es una arquitectura estándar a escala mínima.

El entrenamiento se realizó en una sola GPU de consumo (NVIDIA RTX 5060 Ti de 16 GB) durante aproximadamente 3 horas y 1 época, en bfloat16, con learning rate 6e-4 y weight decay 0,1. El corpus consistió en los primeros 5.000 millones de tokens de una mezcla compuesta por un 70 % de la muestra Sample-10BT de HuggingFaceFW/fineweb-edu y un 30 % de Cosmopedia-v2. La model card no menciona fases de alineación (RLHF, DPO o SFT), ni evaluación de sesgos, ni validación de paridad numérica entre los pesos originales y la exportación ONNX, que se generó de forma automática mediante el Space `convert-to-onnx`.

## Capacidades

- Generación de texto por continuación de prompt en inglés, con `max_new_tokens`, `temperature`, `top_k`, `top_p` y `repetition_penalty` configurables.
- Ejecución en navegador y en Node.js mediante Transformers.js sobre ONNX Runtime, sin backend Python.
- Inferencia en CPU pura, sin requisito de GPU.
- Modelado de lenguaje a nivel de carácter/subpalabra útil como baseline lingüístico muy pequeño (BLiMP 0,6186 frente a 0,5 aleatorio).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Multilingüismo: únicamente inglés declarado; el autor no reporta capacidades en otras lenguas.
- No apto para chat, código ni matemáticas (limitación declarada explícitamente por el autor).

## Casos de uso

- Pruebas de humo en CI/CD de pipelines de inferencia: cargar el ONNX con Transformers.js y verificar que la pipeline `text-generation` devuelve tokens en cada build, con un coste de segundos y sin GPU.
- Validación de conversiones ONNX: servir como caso de referencia de 1,4 M de parámetros para comprobar operadores, shapes y compatibilidad de `onnxruntime` u `onnxruntime-web` antes de aplicar la misma ruta a modelos mayores.
- Docencia de arquitecturas transformer: con 6 capas y dimensión 128, es viable inspeccionar pesos, activaciones y matrices de atención completas en un cuaderno o en el navegador para explicar atención, GQA y tokenización BPE.
- Benchmarking de tokenizadores: su vocabulario BPE de 4096 tokens permite medir el impacto del tamaño de vocabulario en la longitud de secuencia y en el coste por token frente a tokenizadores de 32k.
- Evaluación de despliegue en edge/IoT: 2,8 MB en fp16 y ~1,4 MB en int8 permiten probar rutas de despliegue en dispositivos empotrados, navegadores o entornos sin acelerador antes de portar modelos reales.
- Comparativas de cuantización y latencia: sirve como unidad mínima para medir overhead de carga, inicialización de sesión ONNX y coste por token en distintas precisiones sin que el tiempo de cómputo enmascare el del runtime.
- Demostraciones educativas de generación de texto: continuaciones cortas de frases en inglés para ilustrar el comportamiento de un modelo subentrenado y sus fallos típicos (repetición, incoherencia, deriva temática).
- Pruebas de integración en aplicaciones web: ejemplo mínimo de inferencia del cliente en una demo de Transformers.js sin depender de una API externa.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con `lm_eval`:

| Tarea | Resultado | Nivel aleatorio |
|---|---|---|
| ARC-Easy (↑) | 0,3026 | 0,25 (25 %) |
| Wikitext, perplejidad por byte (↓) | 3,0043 | no aplica |
| BLiMP (↑) | 0,6186 | 0,5 (50 %) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de razonamiento, código o matemáticas en la información disponible. Dos matices importantes: la perplejidad de Wikitext está expresada por byte, no por token, por lo que no es directamente comparable con la perplejidad de modelos con tokenizadores distintos; y las tres métricas quedan muy cerca del nivel aleatorio, lo que es coherente con el tamaño del modelo y con la pérdida final de entrenamiento de 3,79. La model card remite a un archivo `benchmarks.md` del repositorio para más resultados, no incluido en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU. Cálculo teórico a partir de 1.410.688 parámetros: ~5,6 MB en fp32, ~2,8 MB en fp16 y ~1,4 MB en int8, más el overhead de activaciones y del propio runtime.
- GPU recomendadas: ninguna en particular; funciona en CPU. Cualquier GPU consumer (RTX 4090, RTX 5060 Ti, integradas) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en la mayoría de sistemas sin GPU, incluidos navegadores de escritorio y móviles.
- Opciones de despliegue: Transformers.js con ONNX Runtime Web o Node (ruta documentada y oficial para este repo); ONNX Runtime en Python/C++/C#; la pipeline `text-generation` de `transformers` usando el modelo base `SupraLabs/Supra-Mini-v6-1M`. No se proporciona GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia no incluida.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por el tamaño (6 capas, dimensión 128, contexto máximo 1024) el coste por token es marginal, pero la latencia real dependerá del runtime, de la precisión exportada y del dispositivo.
- El tamaño reportado del repositorio es 0,0 GB, dato que no permite verificar cuántos archivos ONNX y con qué precisión se han publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| Supra-Mini-v6-1M-ONNX | 1,41 M | 1024 | en | Apache 2.0 | ONNX (transformers.js) | ARC-Easy 0,3026; BLiMP 0,6186; Wikitext byte PPL 3,0043 |
| Supra-Mini-v6-1M (modelo base) | 1,41 M | 1024 | en | Apache 2.0 | safetensors / PyTorch (no especificado en detalle) | Idénticos, mismos pesos |
| Otros modelos de ~1 M de parámetros con benchmarks publicados | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos pequeños de referencia (p. ej. familia SmolLM o Qwen2.5-0.5B) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la información proporcionada alternativas comparables de la misma escala (~1 M de parámetros) con resultados publicados. Conviene tener presente que la comparación relevante no es con modelos de 135 M a 1 B de parámetros —dos o tres órdenes de magnitud mayores—, sino con otros modelos diminutos de investigación, para los que no hay datos verificables en esta ficha.

## Limitaciones y advertencias

- El propio autor declara que el modelo no puede razonar, conversar ni programar, que es incoherente "más a menudo que no" y que en su mayoría no es factual. No debe usarse para generar contenido que vaya a leer un usuario final.
- Riesgo de alucinación muy alto y sin mitigaciones: no hay alineación documentada (RLHF/DPO/SFT) ni filtros de seguridad.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni evaluación de la composición del corpus más allá de la mezcla FineWeb-Edu / Cosmopedia-v2.
- Idioma: solo inglés declarado; no hay evidencia de comportamiento en castellano y el vocabulario de 4096 tokens penaliza lenguas no representadas en el entrenamiento.
- Contexto limitado a 1024 tokens; no hay soporte documentado de RoPE scaling ni de extensión de contexto.
- Discrepancia no resuelta entre el tamaño de vocabulario de la configuración (4096) y el del script de tokenizador citado en la guía de entrenamiento (16.384); conviene verificar el `tokenizer.json` real antes de integrar.
- La exportación ONNX es automática y no se documenta validación de paridad numérica frente a los pesos originales ni las precisiones incluidas; verificar la salida antes de usar el modelo como referencia.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y sin garantías; el riesgo de uso comercial no es legal sino de calidad del output.
- El repositorio no presenta descargas ni "likes" y su tamaño reportado es 0,0 GB, lo que sugiere que los pesos pueden no estar completamente disponibles o que el dato no está actualizado; comprobar la lista de archivos antes de depender de él.
- No sustituye a un modelo de producción en ninguna tarea de NLP real; su uso previsto es investigación educativa, pruebas de despliegue en edge y experimentación.

## Enlaces

- Hugging Face (versión ONNX): https://huggingface.co/onnx-community/Supra-Mini-v6-1M-ONNX
- Modelo base: https://huggingface.co/SupraLabs/Supra-Mini-v6-1M
- Space de conversión utilizado: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación de la pipeline `text-generation` en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- ONNX (sitio oficial): https://onnx.ai/
- Documentación de ONNX: https://onnx.ai/onnx/
- Repositorio de ONNX en GitHub: https://github.com/onnx/onnx
- ONNX Runtime: https://onnxruntime.ai/
- Wikipedia, Open Neural Network Exchange: https://en.wikipedia.org/wiki/Open_Neural_Network_Exchange

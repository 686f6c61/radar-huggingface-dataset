# ggml-org-dev/tiny-d1-2B-for-testing-GGUF

## Resumen

`tiny-d1-2B-for-testing-GGUF` es un artefacto de pruebas publicado por la organización `ggml-org-dev`, derivado del modelo `LiquidAI/d1-2B` de Liquid AI. No es un modelo destinado a uso real: la propia model card lo describe como una copia "modificada y dañada" cuyo propósito exclusivo es validar el software de llama.cpp, en concreto las pruebas del servidor para el tipo de decisión `lfm3-d1`. Sus salidas son, según el autor, texto sin sentido.

El proceso de construcción explica su naturaleza: se convirtió el modelo base a GGUF con `convert_hf_to_gguf.py` (modelo de texto y `mmproj` en F16), se recortó el vocabulario de 128.000 a 2.485 tokens (tokens especiales, caracteres individuales, palabras de etiqueta de decisión y las primeras 2.000 fusiones BPE, con renumeración de IDs) y se cuantizó a Q4_0 el modelo de texto (incluida la matriz de embeddings) y a Q8_0 el `mmproj`.

Aunque el nombre sugiere 2B parámetros, el recuento real en safetensors es de 489.536 parámetros totales y el repositorio ocupa 0,1 GB. Es, por tanto, un modelo diminuto pensado para pruebas de integración rápidas, no para inferencia de calidad. Su interés para desarrolladores está en servir como fixture reproducible para validar conversores, cuantizadores y el pipeline de decisión de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LiquidAI/d1-2B; tipo de decisión `lfm3-d1` en llama.cpp) |
| Parametros totales | 489.536 (dato real, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (modelo de texto, incluida la matriz de embeddings) y Q8_0 (`mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`, marcada como `other`) |
| Formato de pesos | GGUF (conversion desde safetensors mediante `convert_hf_to_gguf.py`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base `LiquidAI/d1-2B` en los datos disponibles. El artefacto GGUF se genero convirtiendo el modelo de texto y el `mmproj` a F16 y aplicando despues un recorte de vocabulario de 128.000 a 2.485 tokens: tokens especiales, todos los caracteres individuales, las palabras de etiqueta de decision y las primeras 2.000 fusiones BPE, con renumeracion de los IDs. Posteriormente se cuantizo el modelo de texto a Q4_0 (incluyendo la matriz de embeddings) y el `mmproj` a Q8_0 mediante `llama-quantize`.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO). El prefijo `d1` y la etiqueta `decision-model` sugieren un modelo orientado a tareas de decision, pero no se dispone de detalles tecnicos adicionales. El recorte del vocabulario implica que cualquier texto sigue tokenizandose, pero en mas piezas que el tokenizador original, lo que degrada la coherencia de las salidas.

## Capacidades

- Generacion de texto: funcional a nivel de software, pero las salidas son gibberish segun el autor; no es apta para produccion.
- Modelo de decision: etiquetado como `decision-model`, usado por las pruebas del servidor de llama.cpp para el tipo `lfm3-d1`.
- Soporte multimodal: incluye un `mmproj` (proyector multimodal) cuantizado a Q8_0, heredado del modelo base.
- Tokenizacion degradada: el vocabulario recortado a 2.485 tokens permite tokenizar cualquier texto, pero con mas fragmentos.
- Conversacional: etiquetada como `conversational`, aunque sin garantia de calidad.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Pruebas de integracion de llama.cpp: sirve como fixture reproducible para validar el servidor con el tipo de decision `lfm3-d1`, lanzandolo con `llama-server -hf ggml-org-dev/tiny-d1-2B-for-testing-GGUF:Q4_0`.
- Validacion de conversores GGUF: permite comprobar que `convert_hf_to_gguf.py` maneja correctamente modelos con vocabularios recortados y `mmproj` en F16.
- Pruebas de cuantizacion: util para verificar `llama-quantize` con Q4_0 sobre embeddings y Q8_0 sobre el proyector multimodal.
- CI/CD de herramientas GGUF: su tamano de 0,1 GB permite incluirlo en pipelines de integracion continua sin coste significativo de almacenamiento o descarga.
- Desarrollo de tokenizadores: sirve para probar el comportamiento de tokenizacion con vocabularios reducidos y IDs renumerados.
- Pruebas de carga y latencia del servidor: al ser diminuto, permite medir el overhead del servidor sin que el coste de inferencia domine la medicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en Q4_0, dado el tamano del repositorio (0,1 GB) y los 489.536 parametros.
- GPU recomendadas: cualquier GPU con soporte CUDA, Metal o Vulkan; no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio.
- Latencia y throughput: no disponibles de forma publicada; por el tamano, la latencia estara dominada por el overhead del servidor y no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| tiny-d1-2B-for-testing-GGUF | 489.536 | no disponible | Pruebas de software (fixture) | LFM Open License v1.0 | GGUF |
| LiquidAI/d1-2B | no disponible | no disponible | Modelo de decision real | LFM Open License v1.0 | safetensors (presumiblemente) |
| ggml-org-dev/tiny-d1-2B-for-testing | no disponible | no disponible | Version previa a la conversion GGUF | LFM Open License v1.0 | safetensors |

No se dispone de datos de rendimiento para comparar con alternativas; la comparativa se limita a proposito, formato y licencia.

## Limitaciones y advertencias

- Salidas sin sentido: el autor advierte explicitamente de que la salida es gibberish; no debe usarse para nada distinto de pruebas de software.
- Tokenizador alterado: el vocabulario recortado a 2.485 tokens y la renumeracion de IDs rompen la compatibilidad con el tokenizador original del modelo base.
- Modelo danado por diseno: es una copia "modificada y danada" de `LiquidAI/d1-2B`; no refleja el comportamiento del original.
- Licencia: LFM Open License v1.0 con restricciones; revisar el archivo `LICENSE` antes de cualquier redistribucion, incluso como fixture.
- Sin datos de sesgos, alucinacion o idiomas: no disponibles, y en cualquier caso irrelevantes dado que no es un modelo de produccion.
- No apto para produccion: no usar en atencion al cliente, generacion de codigo ni ningun flujo real.
- Nombre enganoso: el sufijo "2B" no corresponde al recuento real de parametros (489.536).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/tiny-d1-2B-for-testing-GGUF
- Modelo base (safetensors): https://huggingface.co/ggml-org-dev/tiny-d1-2B-for-testing
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/d1-2B
- Licencia LFM Open License v1.0: https://huggingface.co/ggml-org-dev/tiny-d1-2B-for-testing-GGUF/blob/main/LICENSE
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

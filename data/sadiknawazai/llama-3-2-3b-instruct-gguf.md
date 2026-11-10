# SadikNawazAI/Llama-3.2-3B-Instruct-GGUF

## Resumen

Llama 3.2 3B Instruct GGUF es una exportación cuantizada del modelo `meta-llama/Llama-3.2-3B-Instruct` de Meta, publicada por el usuario SadikNawazAI en Hugging Face. Se trata de un transformer decoder-only de 3.212.749.888 parámetros (3,21B) con una longitud de contexto nominal de 131.072 tokens, distribuido en formato GGUF con cuantización Q4_K_M para su uso directo en runtimes de inferencia local como Ollama y llama.cpp.

El repositorio no aporta un modelo nuevo ni un ajuste fino: es una reempaquetado del mismo build GGUF que Ollama distribuye como `llama3.2:3b`, con un único fichero de 1,88 GiB (2,02 GB). Su relevancia práctica radica en que permite ejecutar un modelo conversacional de Meta en hardware de consumo sin depender del catálogo de Ollama, descargándolo directamente desde Hugging Face e integrándolo en pipelines con llama-cpp-python.

La ficha se centra en las características verificables del binario publicado y del modelo base que lo origina. Cualquier dato no documentado en la información disponible se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `llama` (transformer decoder-only) |
| Parámetros totales | 3.212.749.888 (3,21B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Q4_K_M (4-bit K-quant, mixta); el repo solo publica ese fichero |
| Idiomas soportados | inglés, alemán, francés, italiano, portugués, hindi, español, tailandés (según model card) |
| Licencia | Llama 3.2 Community License (Copyright © Meta Platforms, Inc.) |
| Formato de pesos | GGUF (`Llama-3.2-3B-Instruct-Q4_K_M.gguf`) |
| Dimensión de embedding | 3.072 |
| Capas | 28 |
| Vocabulario | 128.256 tokens |
| Tamaño del fichero | 1,88 GiB (2,02 GB) |
| SHA-256 | `dde5aa3fc5ffc17176b5e8bdc82f587b24b2678c6c66101bf7da77af9f7ccdff` |
| Plantilla de chat | incluida en metadatos GGUF |
| Modelo base | `meta-llama/Llama-3.2-3B-Instruct` |
| Cuantizado por | SadikNawazAI |

## Arquitectura y entrenamiento

La arquitectura es la estándar de la familia Llama 3.2: un transformer decoder-only con 28 capas, dimensión de embedding de 3.072 y un vocabulario de 128.256 tokens. El modelo base fue entrenado por Meta; esta publicación no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) empleadas, por lo que esos datos deben consultarse en la documentación oficial de `meta-llama/Llama-3.2-3B-Instruct`.

La innovación técnica de esta publicación es exclusivamente de empaquetado: la cuantización Q4_K_M reduce los pesos a 4 bits con esquema K-quant mixto, comprimiendo el modelo hasta 1,88 GiB y haciéndolo viable en GPU de consumo y en CPU. El GGUF incluye la plantilla de chat en sus metadatos, lo que permite usar `create_chat_completion` en llama-cpp-python o `ollama run` sin configuración adicional. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat incluida.
- Razonamiento y respuesta a instrucciones en el rango propio de un modelo de 3B.
- Generación de código y resolución de tareas matemáticas básicas (capacidad heredada del modelo base, sin benchmarks publicados en este repo).
- Soporte multilingüe declarado para ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Ejecución local en CPU y GPU mediante llama.cpp, Ollama y llama-cpp-python.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo sin GPU dedicada: con 1,88 GiB en Q4_K_M, el modelo cabe en RAM y se ejecuta vía `ollama run hf.co/SadikNawazAI/Llama-3.2-3B-Instruct-GGUF` para prototipos de chat sin coste de API.
- Pruebas de integración en CI/CD: el fichero GGUF con SHA-256 fijado permite descargar un binario determinista en pipelines de test que validen prompts y plantillas de chat antes de desplegar modelos mayores.
- Generación de texto en aplicaciones de escritorio o edge: el tamaño reducido y la compatibilidad con llama.cpp permiten embeber el modelo en herramientas offline de redacción, resumen o extracción de texto.
- Sustitución de `llama3.2:3b` en entornos Ollama: al ser el mismo build que distribuye Ollama, sirve para validar comportamiento y comparar latencias entre el canal oficial y una copia alojada en Hugging Face.
- Evaluación comparativa de cuantizaciones: útil como referencia Q4_K_M frente a otras cuantizaciones del mismo modelo base (Q5, Q8, FP16) para medir la pérdida de calidad en tareas concretas.
- Docencia y experimentación con LLM: el modelo y su plantilla de chat permiten ilustrar el ciclo completo de descarga, carga en llama-cpp-python y generación con `n_ctx` configurable, sin requerir infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos, y este repositorio no aporta evaluaciones propias de la cuantización Q4_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB en Q4_K_M, incluyendo el fichero de 1,88 GiB más overhead de contexto KV cache (que crece con `n_ctx`).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; tarjetas como RTX 3050, RTX 4060, RTX 4090 o A100 pueden ejecutarlo sobradamente. En A100/H100 el modelo está limitado por ancho de banda, no por cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM; también en CPU pura con suficiente RAM.
- Opciones de despliegue: Ollama, llama.cpp (`llama-cli` con `--jinja`), llama-cpp-python, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware y de la longitud de contexto configurada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama 3.2 3B Instruct GGUF (esta ficha) | 3,21B | 131.072 | GGUF Q4_K_M | Llama 3.2 Community | Hugging Face, Ollama |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21B | 131.072 | safetensors (FP16/BF16) | Llama 3.2 Community | Hugging Face |
| `llama3.2:3b` (Ollama) | 3,21B | 131.072 | GGUF (mismo build) | Llama 3.2 Community | Catálogo Ollama |
| Otras cuantizaciones del mismo base (Q5, Q8) | 3,21B | 131.072 | GGUF | Llama 3.2 Community | Repos de terceros |

La comparativa se limita a variantes del mismo modelo base porque la información disponible no incluye datos de rendimiento frente a modelos de otros desarrolladores. No se dispone de métricas para comparar calidad entre esta cuantización y las alternativas.

## Limitaciones y advertencias

- Es una cuantización Q4_K_M: introduce pérdida de precisión respecto al modelo base en FP16/BF16, especialmente en tareas de razonamiento matemático y generación de código.
- Riesgo de alucinación inherente a un modelo de 3B; no debe usarse como fuente de verdad sin verificación.
- No se documentan sesgos específicos en la información disponible, pero el modelo base hereda los sesgos de sus datos de entrenamiento.
- El contexto nominal es de 131.072 tokens, pero la ventana efectiva en Q4_K_M y con `n_ctx` reducido (el ejemplo de la model card usa 4.096) puede degradar la calidad en contextos muy largos.
- La licencia Llama 3.2 Community impone restricciones: obligaciones de atribución ("Built with Llama"), política de uso aceptable y umbrales de usuarios activos mensuales para usos comerciales a gran escala. Debe revisarse el texto completo en `LICENSE` y `USE_POLICY.md` antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validación independiente del binario más allá del SHA-256 publicado.
- No se documenta soporte de tool calling ni de agentes; no asumir esas capacidades sin verificación empírica.
- La fecha de creación del repo (2026-11-10) es posterior a la de esta consulta; conviene verificar la integridad del fichero contra el SHA-256 antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/Llama-3.2-3B-Instruct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python

# hellnahbru/Qwen3.8-27B-Uncensored-GGUF-preserved-20261029

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una colección de cuantizaciones GGUF (de 2 bits a 16 bits) de una variante "abliterated" (con las negativas de seguridad eliminadas) de Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros desarrollado por Qwen. La versión base es un modelo vision-language nativo con arquitectura híbrida de atención (Gated DeltaNet lineal más atención completa), razonamiento, function calling y una cabeza de decodificación especulativa MTP (Multi-Token Prediction). El proceso de abliteration, realizado por OrcaRouter sobre el checkpoint original, ortogonaliza la dirección de rechazo fuera del flujo residual, de modo que el modelo deja de negarse a peticiones que el modelo original rechazaría.

Este repositorio, mantenido por el usuario hellnahbru, está orientado a la ejecución local en llama.cpp (CPU, CUDA, Metal y ROCm) e incluye un archivo mmproj separado que restaura las capacidades de visión. Es relevante ahora porque combina tres tendencias recientes en modelos abiertos: arquitecturas híbridas lineal-atención para contextos largos eficientes, decodificación especulativa MTP para mayor throughput, y la práctica de abliteration para investigación en seguridad e interpretabilidad.

Es imprescindible señalar que se trata de un modelo sin alineamiento de seguridad: su uso legítimo declarado es la investigación en interpretabilidad, estudio de mecanismos de rechazo, red-teaming y evaluación de robustez. Cualquier despliegue en producción requiere capas propias de moderación y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet (atención lineal) + capas de atención completa, con cabeza MTP de decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de Q2_K a F16 (2-bit a 16-bit), con imatrix |
| Idiomas soportados | Inglés y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión del original safetensors; repo completo de 288,4 GB) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-27B combina capas de atención lineal Gated DeltaNet con capas de atención completa, un diseño híbrido que reduce el coste de memoria del KV cache en contextos largos manteniendo la capacidad de recuperación precisa de las capas de atención total. En los archivos GGUF, las capas lineales se almacenan como tensores de estilo SSM (`ssm_*`), las de atención completa como `attn_*`, y la cabeza de predicción multi-token como bloque `nextn.*` (`qwen35.nextn_predict_layers`), lo que permite decodificación especulativa MTP en llama.cpp para acelerar la inferencia. Además es un modelo vision-language nativo: las capacidades de imagen se restauran mediante un archivo mmproj independiente.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se han publicado datos en la información disponible. Lo que sí está documentado es el post-proceso de abliteration: una intervención sobre los pesos que elimina la dirección de rechazo del flujo residual, eliminando de forma sustancial el alineamiento de seguridad del modelo original. No se trata de un reentrenamiento, sino de una modificación directa de pesos.

## Capacidades

- Generación de texto conversacional con capacidades de razonamiento (reasoning mode).
- Comprensión de imágenes (vision-language nativo, restaurado vía archivo mmproj en GGUF).
- Function calling / tool calling.
- Decodificación especulativa mediante la cabeza MTP (`nextn`), compatible con llama.cpp.
- Ejecución en CPU, CUDA, Metal y ROCm gracias al formato GGUF.
- Sin capas de rechazo de seguridad: responde a peticiones que el modelo original rechazaría (esta es precisamente la finalidad declarada del fork).
- Capacidades multilingües limitadas a inglés y chino según la model card.

## Casos de uso

- Investigación en interpretabilidad y mecanismos de rechazo: al ser una versión abliterated del modelo original, permite comparar activaciones y comportamiento con y sin dirección de rechazo, útil para estudiar cómo se codifica la negativa en el flujo residual.
- Red-teaming y evaluación de robustez: equipos de seguridad pueden usarlo como adversario o como sujeto de prueba para evaluar filtros, moderadores y defensas de sistemas desplegados.
- Evaluación de arquitecturas híbridas lineal-atención: los investigadores pueden ejecutar localmente un modelo con capas Gated DeltaNet y cabeza MTP para medir throughput, latencia y comportamiento en contexto largo frente a transformers densos convencionales.
- Prototipado de agentes con visión local: gracias al mmproj y al function calling, se puede construir un agente que analice imágenes y ejecute herramientas íntegramente en hardware propio, sin enviar datos a APIs externas.
- Benchmarking de cuantizaciones: al incluir quants de 2 a 16 bits con imatrix, es un buen banco de pruebas para medir la degradación de calidad por cuantización en arquitecturas híbridas.
- Despliegue offline en entornos aislados: el formato GGUF y la compatibilidad con llama.cpp permiten ejecutar el modelo en máquinas sin conexión, útil para entornos de laboratorio con requisitos de confinamiento.
- Estudio comparativo de alucinaciones y cumplimiento: al no rechazar peticiones, facilita medir tasas de alucinación y cumplimiento en consultas límite sin el sesgo del comportamiento de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas de esta variante abliterated, ni datos sobre la degradación de calidad respecto al modelo base Qwen3.8-27B tras la abliteration y la cuantización.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud, pero puede estimarse por tamaño de archivo: a 16 bits el modelo ocupa unos 54 GB (27,3B parámetros × 2 bytes), a 8 bits unos 27-28 GB, a 4 bits unos 14-16 GB y a 2 bits unos 7-9 GB, más el espacio del mmproj y del KV cache.
- GPU recomendadas: para quants de 4 bits, una RTX 4090 (24 GB) queda justa sin contexto amplio; opciones más cómodas son RTX 5090, A100 40/80 GB o H100. Para F16 se requiere al menos una A100/H100 80 GB o multi-GPU.
- Consumer GPUs: viable en una RTX 3090/4090 con quants Q2_K o Q3_K; con Q4_K la 4090 queda al límite. También es posible ejecutar parcialmente en CPU con offload de capas.
- CPU: ejecutable en llama.cpp en CPU pura con quants bajos, a costa de una latencia considerable para 27B parámetros.
- Despliegue: llama.cpp es el runtime indicado (construcción reciente desde source, con soporte de la arquitectura híbrida GDN y del cabezal MTP/`nextn` mergeado en mayo de 2026; versiones antiguas no cargarán estos archivos). Compatible también con Ollama al ser GGUF; no se menciona soporte explícito de vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles; la cabeza MTP de decodificación especulativa está diseñada para mejorar el throughput en llama.cpp, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF (esta ficha) | 27,3B | Híbrida GDN + atención completa, MTP | Sí (mmproj) | Apache 2.0 | GGUF, llama.cpp |
| Qwen3.8-27B (base) | 27,3B | Híbrida GDN + atención completa, MTP | Sí | Apache 2.0 | safetensors y FP8 |
| Qwen3-30B-A3B | 30B (3B activos) | MoE | Según variante | Apache 2.0 | safetensors y GGUF |

Nota: la comparativa se limita a la familia Qwen, ya que Qwen3.8-27B es una arquitectura reciente y no se dispone de datos suficientes de alternativas equivalentes de otros fabricantes con abliteration, visión y MTP. Frente al modelo base, esta variante se diferencia únicamente en la eliminación del alineamiento de seguridad y en el formato GGUF; las capacidades y limitaciones de fondo son las mismas.

## Limitaciones y advertencias

- Riesgo elevado de contenido dañino: el alineamiento de seguridad se ha eliminado de forma sustancial mediante abliteration; el modelo puede cumplir peticiones nocivas, poco éticas o ilegales que el original rechazaría. Su uso declarado es exclusivamente investigador.
- Sin moderación integrada: cualquier despliegue requiere capas propias de seguridad y moderación; los autores declinan toda responsabilidad por el uso.
- Riesgo de alucinación: no hay datos publicados sobre tasas de alucinación de esta variante; además, la abliteration puede degradar la calidad general respecto al modelo base, algo no cuantificado.
- Idiomas: la model card declara solo inglés y chino; el rendimiento en castellano no está documentado.
- Contexto: la longitud de ventana de contexto no está especificada en la información disponible.
- Compatibilidad estricta de versiones: se requiere una build reciente de llama.cpp con soporte de la arquitectura híbrida GDN y del cabezal MTP/`nextn`; releases anteriores no cargarán los archivos.
- Cuantización agresiva: los quants de 2 bits pueden degradar notablemente la calidad, especialmente en las capas lineales GDN; no hay evaluaciones publicadas por nivel de quant.
- Licencia: Apache 2.0, que permite uso comercial, pero ello no exime de cumplir la legislación aplicable ni de las responsabilidades derivadas de un modelo sin salvaguardas.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/hellnahbru/Qwen3.8-27B-Uncensored-GGUF-preserved-20261029
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 del modelo uncensored (OrcaRouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Catálogo de modelos OrcaRouter: https://www.orcarouter.ai/models
- Model card en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Ollama (OrcaRouter): https://ollama.com/orcarouter
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp

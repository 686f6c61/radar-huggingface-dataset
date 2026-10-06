# cvgro/Muse-Glimmer-30B-Uncensored-Heretic-GGUF

## Resumen

Muse-Glimmer-30B-Uncensored-Heretic-GGUF es una versión decensurada ("abliterated") del modelo multimodal Muse Glimmer-30B de Meta Superintelligence Lab, publicada por el usuario cvgro en formato GGUF. La modificación se ha realizado con Heretic v2.0.0.dev0+custom, una herramienta automática de ablación direccional que elimina la dirección de rechazo del espacio de activaciones sin reentrenar el modelo. El resultado conserva la arquitectura y los pesos del original, pero reduce drásticamente la alineación de seguridad.

El modelo base es un transformer causal denso de aproximadamente 29,6 mil millones de parámetros con un encoder de percepción ViT-G/14 de ~1,8 B parámetros, destilado de Muse Spark y diseñado para tareas agénticas autónomas que se ejecutan en hardware de consumo. Soporta contexto de 131.072 tokens o más, atención híbrida local/global con ventana deslizante de 2.048, GQA 16:1 y entrada intercalada de texto e imagen con salida de texto.

La relevancia de esta variante es doble: por un lado, permite ejecutar un modelo multimodal de 30B en una sola GPU de consumo mediante cuantización GGUF; por otro, sirve como material de investigación en alineación y red-teaming, ya que el autor la publica explícitamente solo para esos fines. El repositorio no declara idiomas soportados ni variantes de cuantización concretas, y sus metadatos de parámetros (2.772.159.744) no son coherentes con el nombre del modelo ni con el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepción (ViT-G/14) |
| Parametros totales | ~29,6 B según el modelo base; el índice de safetensors del repositorio declara 2.772.159.744 parámetros (dato incoherente con el nombre del modelo y con la ficha del base, probablemente parcial) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 131.072 tokens o más |
| Tipos de cuantizacion | GGUF; el repositorio no enumera las variantes (tamaño total del repo: 157,2 GB) |
| Idiomas soportados | Más de 100 idiomas en el modelo base; la ficha del derivado no especifica ninguno |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de 52 capas con dimensión oculta 6.656 y un patrón de atención que repite la secuencia [local, local, local, global], con ventana deslizante de 2.048 tokens y atención con puerta (gated attention). La atención usa 32 cabezas de consulta y 2 de clave/valor (GQA con ratio 16:1), dimensión de cabeza 128 y codificación posicional RoPE con theta = 500.000 aplicada solo en las capas locales. El FFN es de tipo SwiGLU con dimensión intermedia 19.968. El vocabulario es de 202.048 entradas (200.000 tokens BPE más 2.048 tokens especiales) y cada imagen puede consumir hasta 4.096 tokens visuales. El encoder de percepción es un ViT-G/14 de ~1,8 B parámetros, 50 capas, anchura 1.536 y parche de 14 píxeles. Las modalidades soportadas son texto e imagen de entrada y texto de salida.

El entrenamiento parte de Muse Spark (destilación) y usa contenido multimodal procedente de datos públicos, datos de terceros e información de productos y servicios de Meta, curado por redes de proveedores externos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La model card original se trunca en la descripción del corpus.

La intervención de Heretic actúa sobre las capas 15 a 32 y sobre los componentes `attn.o_proj` y `mlp.down_proj`, con rango de LoRA 128, transporte gaussiano de rango 2, regularización ridge de 0,015, regularización de covarianza de 0,01, regularización de entropía de 0,1 y cambio máximo de peso de 1,0. Los pesos del encoder de visión no se modifican: solo se ablaciona la vía de texto.

| Parametro de ablacion | Valor |
|---|---|
| start_layer_index | 15 |
| end_layer_index | 32 |
| preserve_good_behavior_weight | 1.0 |
| steer_bad_behavior_weight | 0.375 |
| overcorrect_relative_weight | 3.0 |
| neighbor_count | 1 |
| ridge_regularization | 0.015 |
| transport_rank | 2 |
| entropy_regularization | 0.1 |
| transport | gaussian |
| lora_rank | 128 |
| row_normalization | none |
| target_components | attn.o_proj, mlp.down_proj |
| covariance_regularization | 0.01 |
| max_weight_change | 1.0 |

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extensos.
- Tool calling y function calling con esquemas precisos a lo largo de cadenas de llamadas prolongadas.
- Ejecución agéntica de extremo a extremo: el modelo base se evalúa en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench.
- Recuperación de fallos: cuando una herramienta falla o devuelve un resultado inesperado, diagnostica el error y reintenta en lugar de detenerse.
- Entrada multimodal intercalada de texto e imagen (capturas de pantalla, gráficos, documentos) con salida exclusivamente de texto; hasta 4.096 tokens visuales por imagen.
- Capacidad multilingüe: más de 100 idiomas en el entrenamiento del modelo base.
- Compatibilidad con scaffolds de orquestación agéntica como OpenClaw y Hermes Agent.
- Esfuerzo controlable: distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Salida de razonamiento separada de la respuesta final, según la ficha de NVIDIA NIM.
- Efecto de la ablación: ausencia práctica de rechazos ante peticiones que el modelo original denegaría (0/100 palabras clave de rechazo frente a 100/100 del original).

## Casos de uso

- Red-teaming de sistemas de IA: sirve como contraparte sin alineación para medir la robustez de clasificadores de contenido, filtros de salida y guardarraíles en pipelines de despliegue.
- Investigación en alineación y ablación: permite reproducir y auditar la receta de Heretic comparando la divergencia KL (0,0375) con la pérdida de comportamiento del modelo original, y estudiar qué capacidades se degradan al eliminar la dirección de rechazo.
- Agentes locales sin conectividad: con tool calling y 131.072 tokens de contexto puede orquestar llamadas a herramientas sobre documentación interna en equipos sin acceso a la nube, útil en entornos con requisitos de confidencialidad.
- Análisis de documentos y capturas: el encoder de percepción permite interpretar gráficos, tablas e interfaces junto a la conversación, por ejemplo para extraer datos de informes escaneados o auditar paneles de monitorización.
- Automatización de tareas de código en CI/CD: con razonamiento multi-paso y recuperación de fallos puede integrarse en pipelines que escriben parches, ejecutan pruebas, leen trazas de error y reintentan correcciones.
- Prototipado de asistentes conversacionales en laboratorio: su ventana de 131.072 tokens permite mantener historiales multi-turno largos en pruebas internas de robustez conversacional, siempre fuera de entornos de usuario final.
- Generación de datos sintéticos sin filtros de rechazo: útil para construir conjuntos de entrenamiento o de evaluación que incluyan peticiones límite que el modelo original rechazaría.
- Estudios de transferencia de ablación a modelos multimodales: al conservar intactos los pesos de visión, permite aislar el efecto de la ablación sobre la vía de texto frente a la percepción visual.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks de tareas (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La ficha del modelo base menciona DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench como benchmarks de evaluación, pero no reproduce cifras. Los únicos datos cuantitativos disponibles son los de la propia ablación:

| Metrica | Este modelo | Modelo original (meta-models/Muse-Glimmer-30B) |
|---|---|---|
| Keywords (palabras clave de rechazo) | 0/100 | 100/100 |
| Divergencia KL | 0.0375 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV; el encoder de visión añade ~1,8 B parámetros, unos 3,6 GB en FP16): ~60 GB en FP16/BF16, ~32 GB en Q8_0, ~22 GB en Q5_K_M y ~18-19 GB en Q4_K_M. Estas cifras son estimaciones a partir de los 29,6 B parámetros declarados, no datos publicados por el autor.
- Caché KV: con 52 capas, 2 cabezas KV y dimensión de cabeza 128, cada token ocupa unos 52 KB en FP16 (unos 26.624 elementos), lo que supone aproximadamente 7 GB para una secuencia completa de 131.072 tokens. El patrón de atención con ventana deslizante de 2.048 puede reducir este coste en la práctica.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) con cuantizaciones Q4/Q5; A100 40 GB o 80 GB y H100 80 GB para FP16/BF16 o contextos muy largos.
- ¿Cabe en GPU de consumo? Sí, con cuantización GGUF agresiva (Q4_K_M o inferior) en tarjetas de 24 GB. También en equipos con memoria unificada de 32-64 GB (Mac con chip Apple Silicon) ejecutando variantes cuantizadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes GGUF son las vías naturales dado el formato del repositorio; vLLM o TGI requerirían convertir los pesos a safetensors y confirmar soporte de arquitectura.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Uncensored-Heretic (este) | ~29,6 B denso + encoder ~1,8 B | 131.072+ | Sí (texto + imagen) | Apache 2.0 | Sin alineación de seguridad; solo GGUF; uso previsto de investigación |
| Muse Glimmer-30B (base) | ~29,6 B denso + encoder ~1,8 B | 131.072+ | Sí (texto + imagen) | Apache 2.0 | Modelo original con alineación intacta (100/100 en palabras clave de rechazo) |
| Qwen2.5-VL-32B-Instruct | ~32,5 B denso | 128.000 | Sí (texto + imagen) | Apache 2.0 | Alternativa multimodal de tamaño comparable con alineación intacta |
| Gemma 3 27B | ~27 B denso | 128.000 | Sí (texto + imagen) | Licencia Gemma | Alternativa de consumo con licencia con cláusulas de uso |

Los datos de los modelos comparados corresponden a sus fichas públicas y no se han verificado en esta búsqueda; no se dispone de cifras de rendimiento comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- La alineación de seguridad se ha reducido sustancialmente: es más probable que el modelo genere contenido dañino, inexacto, sesgado u ofensivo. El propio autor lo advierte de forma explícita.
- Uso previsto limitado a investigación y experimentación (seguridad, alineación, red-teaming). Se pide evitar su despliegue en servicios públicos o de cara al usuario final.
- Riesgo elevado de alucinación: sin alineación que module las respuestas, todas las salidas deben tratarse como no fiables y verificarse de forma independiente.
- Sesgos heredados del corpus del modelo base (datos públicos, de terceros y de productos de Meta), sin mitigaciones posteriores conocidas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero la model card del derivado restringe el uso previsto a investigación, lo que genera una tensión entre licencia y recomendación de uso.
- Idiomas: aunque el base se entrena con más de 100 idiomas, este repositorio no especifica ninguno ni documenta evaluaciones por idioma.
- Contexto largo: aunque se declaran 131.072 tokens o más, no hay datos publicados sobre degradación de rendimiento en la parte alta de la ventana.
- Fiabilidad del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- Incoherencias en los metadatos: el índice de safetensors declara 2,77 B parámetros frente a los ~29,6 B del modelo base, y el aviso legal menciona a "OS-Software" como proveedor en lugar del autor del repositorio.
- Solo se modificó la vía de texto: los pesos de visión son idénticos a los del modelo original, por lo que el comportamiento multimodal no está ablacionado ni evaluado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/cvgro/Muse-Glimmer-30B-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Heretic (proyecto): https://heretic-project.org
- Heretic (repositorio de p-e-w): https://github.com/p-e-w
- Paper del encoder de percepción: https://arxiv.org/abs/2504.13181
- Referencia arXiv adicional etiquetada en el modelo: https://arxiv.org/abs/2602.06036
- Cobertura de prensa (ghacks): https://www.ghacks.net/2026/08/11/meta-releases-muse-glimmer-a-30-billion-parameter-open-weight-ai-model-that-runs-on-a-single-consumer-gpu/
- Ficha en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Documentación de NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/meta-muse-glimmer-30b
- Variante equivalente de OS-Software: https://huggingface.co/OS-Software/Muse-Glimmer-30B-Uncensored-Heretic-GGUF
- Variante de TrevorJS (notas sobre arquitectura): https://huggingface.co/TrevorJS/Muse-Glimmer-30B-uncensored
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

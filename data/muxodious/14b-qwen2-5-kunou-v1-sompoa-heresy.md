# MuXodious/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy

## Resumen

14B-Qwen2.5-Kunou-v1-SOMPOA-heresy es un ajuste fino del modelo Qwen2.5-14B-Instruct publicado por el usuario MuXodious en Hugging Face. Se trata de una variante "decensored" o "abliterated" del modelo Kunou-v1 de Sao10K, obtenida aplicando la herramienta Heretic v2.2.0.dev0, que modifica los pesos del transformer para reducir la tasa de rechazos ante peticiones que el modelo original declinaría. El resultado es un modelo de 14.770.033.664 parámetros (aproximadamente 14,77 mil millones) con arquitectura transformer densa, pesos en safetensors y un tamaño de repositorio de 29,6 GB.

El modelo hereda las capacidades del Qwen2.5-14B-Instruct original, incluyendo generación de texto, razonamiento, código y conversación multi-turno, pero está orientado a usos de rol y generación creativa sin las restricciones de seguridad del modelo base. La model card del autor original (Sao10K) describe Kunou-v1 como un modelo generalista y de roleplay, entrenado con un dataset refinado derivado de los usos previos en Euryale y Stheno, y recomienda un formato de prompt ChatML con temperatura 1.1 y min_p 0.1.

La relevancia de esta ficha radica en que documenta una práctica controvertida dentro del ecosistema open source: la eliminación de mecanismos de rechazo mediante intervenciones quirúrgicas sobre los pesos (abliteration). El modelo tiene cero descargas y cero "likes" en el momento de la consulta, lo que sugiere que se trata de una publicación reciente o de escasa difusión, y no dispone de datos de benchmarks propios más allá de las métricas de la herramienta Heretic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se listan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | "other", con license_name "qwen" y enlace a la licencia de Qwen2.5-14B-Instruct |
| Formato de pesos | safetensors |
| Tamano del repositorio | 29,6 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-14B-Instruct (via Sao10K/14B-Qwen2.5-Kunou-v1) |
| Herramienta de modificacion | Heretic v2.2.0.dev0 |
| Formato de prompt | ChatML |
| Parametros de muestreo recomendados | Temperatura 1.1, min_p 0.1 |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-14B-Instruct, un transformer denso de tipo decoder-only con 14,77 mil millones de parámetros. Sobre esa base, Sao10K entrenó Kunou-v1 con un dataset descrito como "más limpio y refinado" que el usado en sus modelos anteriores Euryale y Stheno, empleando Axolotl como framework de entrenamiento. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; únicamente indica que el objetivo era un modelo generalista y de roleplay.

La intervención posterior aplicada por MuXodious mediante Heretic v2.2.0.dev0 es una técnica de abliteration que localiza direcciones en el espacio de activaciones asociadas al rechazo y ajusta los pesos de proyecciones concretas para suprimir ese comportamiento. La model card publica los parámetros SOMPOA empleados: un `direction_index` de 33,84, pesos máximos y mínimos por capa en `attn.o_proj` y `mlp.down_proj`, y distancias entre pesos (`max_weight_position` 25,90 en atención, 40,84 en MLP). Estos valores documentan la cirugía aplicada sobre las capas de atención y las proyecciones de salida del MLP, sin que se especifiquen detalles sobre el conjunto de datos de calibración ni el procedimiento de optimización más allá de la referencia a la herramienta.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct y afinada para roleplay y diálogo generalista.
- Generación creativa y narrativa: la model card original describe el modelo como generalista y orientado a roleplay, con recomendaciones de muestreo específicas (temperatura 1.1, min_p 0.1).
- Reducción drástica de rechazos: la tabla de rendimiento de Heretic reporta 8 rechazos de 101 frente a 101 de 101 del modelo original, lo que implica que responde a peticiones que el modelo base declinaría.
- Razonamiento y conocimiento general: capacidades heredadas del Qwen2.5-14B-Instruct, aunque no se documentan evaluaciones específicas tras el fine-tune ni tras la abliteration.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada para este fine-tune; el modelo base Qwen2.5-14B-Instruct sí lo soporta, pero no hay garantía de que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking", visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está entrenado y recomendado por su autor para conversaciones de rol y ficción, con un formato ChatML y parámetros de muestreo ajustados (temperatura 1.1, min_p 0.1) que favorecen respuestas creativas y variadas en diálogos largos.
- Generación creativa sin restricciones temáticas: la abliteration reduce los rechazos a 8 de 101, lo que lo hace adecuado para proyectos de escritura de ficción con temáticas adultas o controvertidas donde el modelo base declinaría la petición.
- Prototipado de asistentes conversacionales: al ser un fine-tune de Qwen2.5-14B-Instruct con pesos en safetensors y compatibilidad con transformers y text-generation-inference, puede desplegarse como backend conversacional en entornos de investigación.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar el efecto de la abliteration sobre el comportamiento de rechazo y la divergencia KL (0,0677 reportada por Heretic), útil en estudios comparativos de técnicas de desalineación.
- Generación de datos sintéticos para entrenamiento: su reducida tasa de rechazo permite generar corpus de diálogo en dominios donde otros modelos censuran respuestas, siempre que se gestionen los riesgos legales y éticos asociados.
- Experimentación con parámetros de muestreo: la model card documenta explícitamente ajustes de temperatura y min_p, lo que facilita reproducir configuraciones y comparar la estabilidad del modelo en distintos regímenes de decodificación.

## Benchmarks y rendimiento

La model card declara un `model-index` con resultados vacíos, por lo que no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son las de la herramienta Heretic:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (Refusals) | 8/101 | 101/101 |
| Divergencia KL | 0,0677 | 0 (por definición) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 29,5 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomienda al menos 32-40 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 15 GB para pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: alrededor de 8-9 GB para pesos, viable en GPUs de consumo con 12-16 GB, aunque no se distribuyen pesos GGUF oficiales en el repositorio.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16; RTX 4090 (24 GB) puede ejecutar el modelo en 8 bits o con cuantización dinámica; RTX 3090/4080 (16-24 GB) en 4-8 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4-8 bits, siempre que se genere la cuantización a partir de los safetensors originales, ya que el repositorio no incluye versiones GGUF.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 14B-Qwen2.5-Kunou-v1-SOMPOA-heresy | 14,77 B | No disponible | other (qwen) | Variante abliterated de Kunou-v1, 8/101 rechazos, KL 0,0677 |
| Sao10K/14B-Qwen2.5-Kunou-v1 | 14,77 B | No disponible | qwen | Modelo original de roleplay sin abliteration; base de esta ficha |
| Qwen/Qwen2.5-14B-Instruct | 14,77 B | Hasta 32.768 tokens (según documentación de Qwen) | qwen | Modelo base instructivo; mayor tasa de rechazo y alineación estándar |
| Sao10K/32B-Qwen2.5-Kunou-v1 | 32 B (aprox.) | No disponible | qwen | Versión "hermana mayor" del mismo autor, para cargas más exigentes |

La comparativa se limita a modelos de la misma familia y tamaño, ya que no se dispone de datos de benchmarks que permitan contrastar rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La abliteration elimina mecanismos de rechazo: el modelo responde a peticiones que el modelo base declinaría, lo que puede producir contenido dañino, ilegal o éticamente problemático sin filtro previo.
- Riesgo elevado de alucinación y de respuestas no verificadas, especialmente en dominios factuales, al haberse priorizado la supresión de rechazos sobre la calibración.
- Divergencia KL de 0,0677 respecto al modelo original, lo que indica una alteración medible de la distribución de salida que puede degradar capacidades no evaluadas.
- No hay datos sobre idiomas soportados ni evaluaciones multilingües; el comportamiento fuera del inglés o del chino (idiomas principales de Qwen2.5) es incierto.
- Licencia "other" con referencia a la licencia de Qwen2.5-14B-Instruct: es responsabilidad del usuario verificar las condiciones de uso comercial, que pueden incluir restricciones adicionales por tratarse de un modelo derivado y modificado.
- El repositorio tiene cero descargas y cero "likes", sin señales de validación por parte de la comunidad; no se han publicado evaluaciones independientes.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a generarlos localmente para despliegues en hardware limitado.
- El soporte de tool calling, agentes y contexto largo no está confirmado para este fine-tune concreto, aunque el modelo base lo soporte.
- Uso en producción desaconsejado sin una capa de moderación externa y sin auditoría previa del comportamiento en los dominios de aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy
- Modelo original de Sao10K: https://huggingface.co/Sao10K/14B-Qwen2.5-Kunou-v1
- Versión 32B de Kunou-v1: https://huggingface.co/Sao10K/32B-Qwen2.5-Kunou-v1
- Versión 72B de Kunou-v1: https://huggingface.co/Sao10K/72B-Qwen2.5-Kunou-v1
- Modelo base Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Heretic (herramienta de abliteration): https://heretic-project.org
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
- Contacto del autor original: https://sao10k.carrd.co/
- Ficha en AIBase: https://model.aibase.com/models/details/1944697394050633728

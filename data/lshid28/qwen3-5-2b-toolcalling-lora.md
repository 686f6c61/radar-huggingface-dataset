# lshid28/Qwen3.5-2B-ToolCalling-LoRA

## Resumen

`lshid28/Qwen3.5-2B-ToolCalling-LoRA` es un adaptador publicado en Hugging Face por el usuario lshid28 sobre el modelo base Qwen3.5-2B de la serie Qwen3.5 de Alibaba Cloud. El nombre del repositorio apunta a un ajuste fino con LoRA orientado a *tool calling* (llamada a funciones) sobre un modelo de 2.000 millones de parámetros. El repositorio ocupa 0,3 GB, un tamaño compatible con un adaptador LoRA y no con un checkpoint completo en bf16 (que rondaría los 4 GB); conviene subrayar que esto es una inferencia a partir del tamaño del repo, no un dato declarado por el autor.

La model card es la plantilla automática de Hugging Face sin rellenar: todos los campos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación) figuran como «More Information Needed». No hay resultados de benchmarks, ni descripción del dataset, ni instrucciones de uso. El repositorio registra 0 descargas y 1 like en el momento de la consulta.

Su interés potencial es contextual: la familia Qwen3.5 se está posicionando para inferencia en dispositivo (Qualcomm AI Hub distribuye Qwen3.5-2B para ejecución local) y el *tool calling* en modelos pequeños es una pieza clave para agentes que corren en el borde. Sin embargo, este adaptador concreto no aporta evidencia pública de calidad, por lo que debe tratarse como un artefacto no validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el adaptador. El modelo base pertenece a la serie Qwen3.5 (transformer, según la librería declarada `transformers`); la arquitectura exacta del base no se detalla en la información disponible |
| Parámetros totales | 2B en el modelo base (según el identificador del repo y la ficha de Qualcomm AI Hub). El adaptador no declara su propio número de parámetros |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. No se publican versiones GGUF, AWQ ni GPTQ; al ser un adaptador LoRA habría que fusionarlo y convertirlo para cuantizar |
| Idiomas soportados | No disponible para el adaptador. Qwen3.5 se describe como serie multilingüe en la documentación del modelo base |
| Licencia | No disponible. La model card no declara licencia y tampoco se indica en los resultados de búsqueda la del modelo base |
| Formato de pesos | `safetensors` (etiqueta del Hub), compatible con `transformers` y `unsloth`. Tamaño del repo: 0,3 GB |
| Modelo base | Qwen3.5-2B (inferido del identificador; no confirmado explícitamente en la model card) |
| Tipo de artefacto | LoRA / adaptador de ajuste fino (inferido del nombre y del tamaño del repo) |
| Tarea declarada | Tool calling / function calling (inferido del nombre del repositorio) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del adaptador. La etiqueta `unsloth` sugiere que el ajuste se realizó con la librería Unsloth, especializada en fine-tuning LoRA/QLoRA de bajo coste de memoria, y la etiqueta `transformers` indica compatibilidad con el ecosistema Hugging Face. La etiqueta `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, incluido en la plantilla automática de model cards; no es una referencia técnica al modelo ni describe su entrenamiento.

Se desconoce por completo la composición del dataset, el número de tokens de entrenamiento, si hubo RLHF/DPO, la configuración de LoRA (rango, alpha, módulos objetivo) y los hiperparámetros. Por analogía con artefactos similares del ecosistema (por ejemplo, Nani Qwen 3.5 2B, entrenado con LoRA sobre unos 2.000 ejemplos y 103 herramientas de wallet), es plausible que se trate de un ajuste pequeño y especializado, pero no existe confirmación en la información disponible.

## Capacidades

Las capacidades que se listan a continuación se deducen exclusivamente del nombre del repositorio y del modelo base; no están documentadas ni verificadas por el autor.

- Generación de texto y seguimiento de instrucciones heredados del modelo base Qwen3.5-2B.
- Tool calling / function calling: emisión de llamadas estructuradas a funciones externas, presumiblemente el objetivo del ajuste LoRA.
- Razonamiento multi-paso con herramientas: encadenamiento de varias llamadas si el adaptador conserva la capacidad del base.
- Capacidades multilingües: no confirmadas para el adaptador; el modelo base se describe como multilingüe.
- Formato de plantilla de chat y esquema exacto de herramientas: no disponible.
- Modo *thinking*, visión, audio o decodificación especulativa: no disponible.

## Casos de uso

Los siguientes escenarios son hipótesis de aplicación razonables dado el nombre del artefacto, no casos validados por el autor.

- Agentes locales en el borde: un modelo de 2B puede ejecutarse en portátiles o dispositivos con GPU modesta para decidir qué herramienta invocar (lectura de ficheros, consultas a API internas) sin enviar datos a la nube, siempre que el adaptador mantenga la precisión necesaria en la selección de funciones.
- Enrutado de funciones en asistentes de escritorio: clasificar la intención del usuario y despachar a la herramienta adecuada dentro de una aplicación de productividad, usando el adaptador como capa de decisión barata delante de un modelo mayor.
- Automatización de operaciones sobre CLI y sistemas: traducir instrucciones en lenguaje natural a llamadas de shell estructuradas, con validación posterior del esquema generado antes de ejecutar.
- RAG con recuperación como herramienta: el modelo decide cuándo invocar una función de búsqueda documental y cómo formular los parámetros de consulta, lo que permite pipelines de recuperación dinámica en lugar de recuperación fija.
- Prototipado e investigación en ajuste de tool calling: al ser un LoRA pequeño, sirve como punto de partida reproducible para comparar estrategias de anotación de funciones y de plantillas de herramientas en modelos de 2B.
- Extracción de datos estructurados: generar JSON conforme a un esquema de función definido para poblar formularios, tickets o registros a partir de texto libre, con verificación del esquema en el servicio receptor.
- Filtrado previo en pipelines de agentes: descartar consultas que no requieren ninguna herramienta antes de invocar un modelo mayor, reduciendo coste por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de tool calling (por ejemplo, precisión de selección de función, exactitud de argumentos o tasa de llamadas válidas), ni resultados de MMLU, GSM8K o HumanEval para el adaptador.

## Requisitos de hardware

Estimaciones para el modelo base de 2B parámetros; no hay mediciones publicadas del adaptador.

- VRAM en bf16/fp16: aproximadamente 4-4,5 GB solo para pesos, más caché KV y activaciones; presupuestar 6-8 GB para contexto moderado.
- VRAM en cuantización de 8 bits: del orden de 2,5-3 GB.
- VRAM en cuantización de 4 bits: del orden de 1,5-2 GB.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en GPUs de 8 GB si se cuantiza. En Apple Silicon es viable con Metal.
- GPU de datacenter: A100 y H100 son innecesarias para una sola petición y solo tienen sentido para servir en lote a gran concurrencia.
- Despliegue: `transformers` + PEFT para cargar el adaptador sobre el base; vLLM o TGI admiten adaptadores LoRA dinámicos; para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF, paso que el autor no documenta.
- CPU: viable en inferencia cuantizada tras la conversión a GGUF, con latencias notablemente mayores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lshid28/Qwen3.5-2B-ToolCalling-LoRA` | 2B (base) | No disponible | Tool calling (inferido) | No disponible | 0 descargas, 1 like; repo de 0,3 GB |
| `kihyun-K/Qwen3.5-2B-ToolCalling-LoRA` | 2B (base) | No disponible | Tool calling (inferido) | No disponible | Model card también sin rellenar |
| `egoigo/Qwen3.5-2B-ToolCalling-LoRA` | 2B (base) | No disponible | Tool calling (inferido) | No disponible | Model card también sin rellenar |
| Nani Qwen 3.5 2B | 2B | No disponible | Tool calling para wallet cripto, LoRA sobre ~2.000 ejemplos y 103 herramientas | No disponible en los resultados | Pesos GGUF publicados para inferencia local |
| Qwen3.5-2B (base) | 2B | No disponible | Modelo generalista multilingüe | No disponible en los resultados | Distribuido también vía Qualcomm AI Hub para inferencia en dispositivo |

La existencia de al menos tres repositorios con el mismo identificador `Qwen3.5-2B-ToolCalling-LoRA` bajo cuentas distintas sugiere experimentos paralelos o réplicas de un mismo tutorial; ninguno de ellos documenta datos, métricas ni licencia, por lo que la comparación técnica entre ellos no es posible con la información disponible.

## Limitaciones y advertencias

- Model card sin contenido: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto; cualquier despliegue se hace a ciegas.
- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, y tampoco se indica la licencia del modelo base, que condiciona la del adaptador.
- Artefacto presumiblemente incompleto: con 0,3 GB, casi con certeza se trata de pesos LoRA que requieren descargar el modelo base Qwen3.5-2B por separado; no funciona como modelo autónomo.
- Ausencia de métricas de tool calling: no se puede verificar la tasa de llamadas válidas, la precisión en la selección de función ni el cumplimiento del esquema JSON.
- Riesgo de alucinación: inherente a un modelo de 2B, y especialmente relevante en generación de argumentos para funciones, donde un parámetro inventado puede provocar efectos secundarios reales.
- Sesgos heredados del modelo base y del dataset de ajuste, ambos desconocidos.
- Longitud de contexto e idiomas no confirmados: no se debe asumir la ventana del modelo base sin verificarla en el tokenizador y la configuración del checkpoint.
- Formato de prompt y de herramientas desconocido: la plantilla de chat y el esquema exacto de function calling no están documentados, lo que puede degradar el rendimiento si se usa una plantilla distinta a la del entrenamiento.
- Señal de adopción nula: 0 descargas y 1 like, sin issues ni discusiones, lo que reduce la probabilidad de detectar errores por la comunidad.
- Anomalía de metadatos: la fecha de creación del repositorio (2026-10-23) es posterior a la fecha de consulta, lo que apunta a un error de metadatos o a un artefacto de prueba.
- Recomendación: evaluar con un conjunto propio de funciones y esquemas antes de cualquier uso en producción, y no ejecutar llamadas generadas sin validación y control de permisos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lshid28/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homónimo de kihyun-K: https://huggingface.co/kihyun-K/Qwen3.5-2B-ToolCalling-LoRA
- Repositorio homónimo de egoigo: https://huggingface.co/egoigo/Qwen3.5-2B-ToolCalling-LoRA
- Modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Guía de fine-tuning de Qwen3.5 con Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Nani Qwen 3.5 2B (ejemplo de LoRA para tool calling con GGUF): https://ethereum.org/developers/tools/nani-qwen-35-2b/
- Artículo citado en la etiqueta arXiv (Lacoste et al., 2019, emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute

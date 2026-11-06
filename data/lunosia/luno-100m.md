# lunosia/Luno-100M

## Resumen

Luno-100M es un modelo de lenguaje conversacional en chino desarrollado por lunosia, entrenado desde cero (sin pesos de terceros) utilizando C# / .NET con TorchSharp sobre LibTorch. Es un decoder-only Transformer denso de aproximadamente 101 millones de parámetros (101.338.112 según los metadatos de safetensors), que ha completado dos fases de entrenamiento: preentrenamiento y ajuste fino supervisado (SFT).

Su principal valor no es competitivo en rendimiento, sino educativo y de ingeniería: sirve como implementación de referencia completa en C# de un pipeline de entrenamiento e inferencia de LLM, algo poco habitual en un ecosistema dominado por Python y PyTorch. El proyecto incluye el modelo, el bucle de entrenamiento y la inferencia en el framework LunoSharp del mismo autor.

El modelo está orientado a la generación de texto conversacional en chino (zh), con un contexto máximo de 2048 tokens y un vocabulario de 16.000 tokens. El propio autor advierte que no existen evaluaciones que acrediten capacidades como asistente general y que las respuestas pueden contener errores factuales, de cálculo o de código. Es relevante como material de estudio para leer la implementación en C#, entender el proceso de entrenamiento y ejecutar diálogos locales en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (estilo Qwen3, entrenado desde cero) |
| Parametros totales | 101.338.112 |
| Parametros activos | no disponible (no es MoE; es denso, todos los parametros activos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | FP16 (archivo de inferencia); FP32 para carga en CPU desde la linea de comandos C#; BF16 AMP en entrenamiento con maestro FP32 |
| Idiomas soportados | Chino (zh) |
| Licencia | other (condiciones en NOTICE.md; pesos y datos de origen con licencias separadas) |
| Formato de pesos | safetensors (model.safetensors, 0,4 GB el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer denso decoder-only con 8 capas, dimension oculta de 1024, 8 cabezas de consulta (Q) y 4 cabezas clave-valor (KV), lo que implica Grouped Query Attention (GQA) con relacion 2:1. Incorpora RMSNorm, codificacion posicional RoPE, normalizacion Q/K, activacion SwiGLU y embeddings de entrada y salida compartidos (tied embeddings). El vocabulario es de 16.000 tokens. Aunque el campo `model_type` de `config.json` usa la etiqueta qwen3 por compatibilidad estandar de pesos, el modelo fue entrenado desde inicializacion aleatoria sin cargar pesos preentrenados de terceros.

El entrenamiento consto de dos fases, cada una con una pasada unica (una epoca). El preentrenamiento uso aproximadamente 10 GB de datos JSONL tras limpieza (10.000.000.064 bytes) con 39.768 actualizaciones de parametros, alcanzando una loss final de 2,8102. El SFT uso unos 15 GB de datos JSONL (15.000.001.196 bytes) con 132.682 actualizaciones y loss final de 1,7925. El forward se ejecuto en BF16 con AMP, mientras que los parametros maestros y el estado de AdamW se mantuvieron en FP32. Los detalles de fuentes de datos, revisiones fijas y licencias se documentan en SOURCE_LICENSES.md y data-sources.json. No se menciona RLHF, DPO ni otras tecnicas de alineacion posteriores al SFT.

## Capacidades

- Generacion de texto conversacional en chino (pipeline text-generation, formato conversacional).
- Dialogo multi-turno mediante la interfaz de chat de LunoSharp en linea de comandos.
- Comprension y generacion de chino mandarin; no hay soporte documentado de otros idiomas.
- No hay tool calling, function calling ni capacidades de agentes documentadas.
- No hay soporte multimodal (vision, audio) documentado.
- El propio autor advierte que las respuestas pueden contener errores factuales, de calculo o de codigo; no hay evaluaciones que acrediten capacidad como asistente general.
- Valor diferencial: servir como implementacion de referencia legible en C# de modelo, entrenamiento e inferencia (via LunoSharp / TorchSharp).

## Casos de uso

- Aprendizaje de implementacion de LLM en C#: el codigo de modelo, entrenamiento e inferencia esta integramente en C# con TorchSharp, ideal para desarrolladores .NET que quieran entender cada componente (attention GQA, RoPE, SwiGLU) sin depender de Python.
- Formacion en entrenamiento de modelos desde cero: se puede estudiar el pipeline completo de dos fases (preentrenamiento + SFT) con datos y loss documentados, util en entornos academicos o de formacion interna.
- Experimentacion con inferencia en CPU: el modelo de 100M parametros y 0,4 GB permite ejecutar chat en CPU FP32 sin GPU, util para prototipos de escritorio .NET.
- Base para fine-tuning educativo: al ser un modelo pequeno y con configuracion estandar (config.json compatible con qwen3), puede usarse como punto de partida para practicas de ajuste fino en chino.
- Integracion en aplicaciones .NET de demostracion: su formato safetensors estandar y el tamano reducido facilitan incrustarlo en herramientas de escritorio o servidores ligeros para demos conversacionales en chino.
- Verificacion de compatibilidad de ecosistema: al declarar model_type qwen3, sirve para probar cargadores de pesos estandar (por ejemplo, librerias que leen safetensors de arquitectura tipo Qwen3) con un modelo pequeno y barato de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que actualmente no existen evaluaciones que acrediten la capacidad del modelo como asistente general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica GPU necesariamente; el modelo pesa unos 0,4 GB en FP16 (101M parametros), por lo que cualquier GPU con 1-2 GB de VRAM seria suficiente si se adaptara la inferencia.
- GPU recomendadas: no necesarias; la inferencia oficial documentada es en CPU FP32 mediante LunoSharp. Para entrenamiento o experimentacion en GPU, cualquier GPU moderna de consumo (RTX 3060 o superior) sobraria dado el tamano del modelo.
- Cabe holgadamente en cualquier GPU de consumo; de hecho, esta disenado para ejecutarse solo con CPU.
- Opciones de despliegue: el metodo documentado es la CLI de LunoSharp en .NET (dotnet LunoSharp.dll chat --weights ... --tokenizer ...). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque el formato safetensors y el model_type qwen3 podrian facilitar cargadores estandar (sin confirmacion del autor).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| Luno-100M | 101,3M | 2048 | Chino | other (ver NOTICE.md) | Entrenado desde cero en C#/.NET; sin benchmarks publicados |
| Qwen3-0.6B (Alibaba) | 0,6B | 32768 (aprox., segun version) | Multilingue (100+ idiomas) | Apache 2.0 | Misma familia de arquitectura declarada; mucho mas capaz y con benchmarks publicados |
| TinyLlama-1.1B | 1,1B | 2048 | Principalmente ingles | Apache 2.0 | Modelo compacto de referencia con amplio ecosistema y evaluaciones publicadas |
| Qwen2.5-0.5B (Alibaba) | 0,5B | 32768 | Multilingue | Apache 2.0 (algunas variantes otras) | Alternativa pequena con soporte de chino y benchmarks publicados |

Luno-100M queda claramente por debajo de estas alternativas en capacidad y ecosistema; su ventaja es la trazabilidad total del entrenamiento y la implementacion en C#.

## Limitaciones y advertencias

- Capacidad muy limitada: con 101M parametros, 8 capas y vocabulario de 16.000, el modelo no es competitivo como asistente general; el autor lo reconoce explicitamente.
- Riesgo alto de alucinacion: la model card advierte que las respuestas pueden contener errores factuales, de calculo o de codigo.
- Sin evaluaciones: no hay benchmarks publicados, por lo que su rendimiento real es desconocido y no verificable con datos de terceros.
- Idioma: entrenado para chino; no hay soporte documentado para castellano, ingles u otros idiomas.
- Contexto corto: 2048 tokens limita documentos largos o conversaciones extensas.
- Licencia "other": las condiciones de uso de los pesos y de los datos de origen estan separadas (NOTICE.md, SOURCE_LICENSES.md, data-sources.json); debe revisarse antes de cualquier uso comercial, que no queda garantizado.
- Despliegue no estandar: la inferencia documentada requiere la CLI propia LunoSharp en .NET; no hay integracion confirmada con herramientas habituales (llama.cpp, vLLM, Ollama).
- Solo se distribuyen los pesos finales del SFT: reanudar el entrenamiento requiere archivos FP32, de optimizador y de progreso que hay que guardar por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lunosia/Luno-100M
- Licencia y condiciones de publicacion: https://huggingface.co/lunosia/Luno-100M/blob/main/NOTICE.md
- Licencias de fuentes de datos: https://huggingface.co/lunosia/Luno-100M/blob/main/SOURCE_LICENSES.md
- Fuentes de datos: https://huggingface.co/lunosia/Luno-100M/blob/main/data-sources.json

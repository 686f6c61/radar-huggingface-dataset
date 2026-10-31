# mradermacher/SmolLM2-1.7B-Instruct-heretic-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF en formato imatrix (matriz de importancia) de SmolLM2-1.7B-Instruct-heretic, un modelo conversacional de 1.710 millones de parámetros derivado de SmolLM2-1.7B-Instruct de Hugging Face. La versión "heretic" es una variante "abliterada" (decensurada), es decir, se han eliminado los mecanismos de rechazo del modelo base para que responda sin las restricciones de seguridad habituales. La cuantización ha sido realizada por mradermacher, un cuantizador muy conocido en la comunidad de modelos locales.

El valor de esta ficha está en el despliegue en dispositivos con recursos limitados: al tratarse de un modelo de 1.7B parámetros con cuantizaciones desde 0,5 GB (IQ1_S) hasta 1,5 GB (Q6_K), puede ejecutarse en portátiles, mini-PCs, Raspberry Pi o móviles sin GPU dedicada. Es relevante para desarrolladores que buscan un LLM ligero para roleplay, chat local o prototipado on-device, y que aceptan las implicaciones éticas y de seguridad de un modelo sin filtros.

El modelo base es SmolLM2, una arquitectura transformer decoder-only compacta de Hugging Face optimizada para edge. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2) |
| Parametros totales | 1.711.376.384 (1,71 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (SmolLM2 base soporta 8.192 tokens, dato no confirmado en la ficha) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, SmolLM2-1.7B-Instruct, es un transformer decoder-only compacto entrenado por Hugging Face como parte de la familia SmolLM2, orientada a inferencia en dispositivos edge y on-device. La variante "heretic" (saidutta69/SmolLM2-1.7B-Instruct-heretic) aplica una técnica de abliteración o decensurado que modifica los pesos para suprimir las direcciones de activación responsables de los rechazos de seguridad. No se dispone de detalles sobre el metodo exacto de abliteración empleado.

Esta ficha corresponde a la cuantización, no al entrenamiento: mradermacher ha generado cuantizaciones GGUF ponderadas con imatrix (importance matrix), una tecnica que usa una matriz de importancia calculada sobre texto de calibración para asignar mayor precision a los tensores más sensibles, mejorando la calidad frente a cuantizaciones estáticas a igual tamaño. También existe una version de cuantizaciones estáticas en el repositorio hermano. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con formato de instrucciones (instruct).
- Roleplay y escritura creativa sin filtros de seguridad, uno de los usos principales indicados en los tags.
- Ejecucion local completa en CPU o GPU modesta gracias al formato GGUF y al tamaño de 1,7B parámetros.
- Reproducibilidad de las cuantizaciones (tag "reproducible") y archivo imatrix incluido para crear cuantizaciones propias.
- No hay evidencia de soporte de tool calling / function calling en la informacion disponible.
- No hay evidencia de capacidades multimodales (vision, audio); es un modelo de texto.
- No hay evidencia de modo thinking ni razonamiento extendido.

## Casos de uso

- Roleplay y narrativa interactiva local: el modelo sin filtros responde sin rechazos en escenarios creativos, y su tamaño permite mantener sesiones largas en un portatil sin GPU.
- Chatbot personal en dispositivos edge: con la cuantizacion Q4_K_M (1,2 GB) cabe en la RAM de cualquier portatil moderno y funciona a velocidad util solo con CPU via llama.cpp.
- Prototipado de agentes ligeros on-device: su baja latencia en CPU lo hace util para probar bucles de agente sin coste de API, aunque sin tool calling nativo confirmado.
- Integracion en aplicaciones moviles o embebidas: las cuantizaciones IQ2/IQ3 (0,6-0,9 GB) permiten despliegue en hardware muy limitado como Raspberry Pi o Android con llama.cpp.
- Investigacion sobre abliteracion y alineamiento: al ser una variante decensurada reproducible de un modelo base conocido, es util para estudiar como la abliteracion afecta al comportamiento del modelo.
- Generacion de texto en pipelines offline: util donde no se puede enviar datos a la nube por privacidad, siempre en ingles.
- Pruebas de cuantizacion: el archivo imatrix de 0,1 GB permite a desarrolladores generar sus propias cuantizaciones con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para referencia, el modelo base SmolLM2-1.7B-Instruct publica metricas en su propia ficha, pero no se incluyen aqui al no formar parte de los datos de este repositorio.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,6 GB (IQ1_S/IQ1_M) hasta ~1,6 GB (Q6_K) segun la cuantizacion elegida, mas el contexto. La recomendada Q4_K_M ocupa ~1,2 GB.
- No requiere GPU: funciona con CPU en cualquier equipo con al menos 4 GB de RAM libre. Con GPU, cualquier modelo moderno (incluso integradas) lo ejecuta sin problema.
- Cabe sobradamente en GPUs consumer: una RTX 3060 de 12 GB podria alojar decenas de copias; incluso GPUs de 2-4 GB son suficientes para las cuantizaciones altas.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. No es un formato nativo para vLLM o TGI (que requieren pesos safetensors del modelo base).
- Latencia y throughput: no disponibles como datos publicados; por tamaño (1,7B, ~1 GB en Q4), se esperan velocidades de decodificacion de decenas de tokens/s incluso en CPU de escritorio moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-1.7B-Instruct-heretic (este) | 1,71 B | no disponible | Apache 2.0 | GGUF (imatrix) | Variante abliterada, sin filtros |
| SmolLM2-1.7B-Instruct (base oficial) | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Con alineamiento estandar |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Qwen (uso comercial permitido con condiciones) | safetensors, GGUF | Multilingue, mejores benchmarks, con filtros |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community | safetensors, GGUF | Contexto mucho mayor, licencia restrictiva |

## Limitaciones y advertencias

- Modelo abliterado/uncensored: no rechazara solicitudes que el modelo base si rechazaria. Su uso para generar contenido danino es responsabilidad exclusiva del usuario; no es adecuado para entornos de produccion orientados a publico general sin capas de seguridad externas.
- Abliterar un modelo suele degradar ligeramente la calidad general y la fiabilidad frente al modelo base; no hay evaluaciones publicadas que cuantifiquen esta degradacion.
- Limitado al ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea notablemente inferior.
- Riesgo de alucinacion tipico de modelos pequenos (1-2B): alto en tareas de razonamiento, matematicas y datos factuales.
- Contexto corto en comparacion con alternativas (el SmolLM2 base usa 8.192 tokens), lo que limita conversaciones muy largas o documentos extensos.
- Sin soporte confirmado de tool calling ni multimodalidad.
- Licencia Apache 2.0: sin restricciones de uso comercial, pero las cuantizaciones heredan tambien el contenido sin filtros del modelo base.
- Las cuantizaciones de 1-2 bits (IQ1_S, IQ2_XXS) tienen perdida de calidad significativa segun el propio autor; usar Q4_K_S o superior para resultados aceptables.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/SmolLM2-1.7B-Instruct-heretic-i1-GGUF
- Modelo base (heretic): https://huggingface.co/saidutta69/SmolLM2-1.7B-Instruct-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/SmolLM2-1.7B-Instruct-heretic-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#SmolLM2-1.7B-Instruct-heretic-i1-GGUF
- Guia de uso de GGUF referenciada: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Modelo base original SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct

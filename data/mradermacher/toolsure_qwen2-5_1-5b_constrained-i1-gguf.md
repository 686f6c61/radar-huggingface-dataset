# mradermacher/ToolSure_Qwen2.5_1.5B_CONSTRAINED-i1-GGUF

## Resumen

ToolSure_Qwen2.5_1.5B_CONSTRAINED-i1-GGUF es una cuantizacion en formato GGUF del modelo ToolSure_Qwen2.5_1.5B_CONSTRAINED, un ajuste fino especializado en function calling y tool use construido sobre la base Qwen2.5-1.5B. El modelo original fue desarrollado por AmareshHebbar y esta disenado para generar llamadas a funciones (function calls) de forma fiable y estructurada, un caso de uso critico en pipelines de agentes y automatizacion. Esta version concreta ha sido cuantizada por mradermacher aplicando tecnicas de imatrix (importance matrix) para preservar la calidad en compresiones agresivas.

El modelo cuenta con 1.543.714.304 parametros totales (aproximadamente 1.5B), lo que lo situa en la categoria de modelos pequenos optimizados para despliegue en hardware modesto, incluidos equipos consumer. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El repositorio incluye un amplio abanico de cuantizaciones que van desde IQ1_S (0.5 GB) hasta Q6_K, cubriendo practicamente todos los escenarios de memoria disponibles.

Su relevancia actual radica en la creciente demanda de modelos ligeros capaces de ejecutar tareas de tool calling de forma determinista y estructurada en entornos de produccion, donde el coste por inferencia y la latencia son factores determinantes. La naturaleza "constrained" del modelo base sugiere un entrenamiento orientado a producir salidas con formato controlado, lo que reduce la tasa de errores de parseo en integraciones con APIs y sistemas externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen2.5-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (imatrix/i1) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2.5-1.5B, un modelo denso con 1.5 mil millones de parametros. El ajuste fino fue realizado por AmareshHebbar sobre el dataset AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B, un conjunto de datos especifico para llamadas a funciones. La designacion "CONSTRAINED" en el nombre indica que el entrenamiento se orienta a producir salidas con formato restringido o controlado, tipicamente mediante tecnicas de decoding constrainado o entrenamiento con plantillas estrictas para garantizar que las llamadas a herramientas sean parseables.

La cuantizacion ha sido realizada por mradermacher utilizando la tecnica imatrix (importance matrix), que calcula la importancia de cada peso en funcion de su contribucion a la salida y permite compresiones mas agresivas con menor perdida de calidad. Esta version i1-GGUF incluye tanto cuantizaciones estaticas como el fichero imatrix para que otros usuarios puedan generar sus propias cuantizaciones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de llamadas a funciones (function calling) estructuradas y parseables.
- Tool use y soporte para integracion con APIs externas.
- Generacion de texto conversacional en ingles.
- Salidas con formato restringido o controlado (constrained decoding).
- Compatible con endpoints de inferencia (tag endpoints_compatible).
- Capacidad de razonamiento multi-paso orientado a la seleccion de herramientas.
- No se ha documentado soporte de vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun los tags del modelo.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo puede generar llamadas a funciones estructuradas para orquestar herramientas en pipelines de agentes, aprovechando su entrenamiento especifico en tool calling para reducir errores de formato.
- Integracion en asistentes de atencion al cliente: al ser un modelo ligero de 1.5B, permite desplegar conversaciones multi-turno con coste de inferencia bajo, aunque la ventana de contexto debe verificarse antes de su uso en produccion.
- Enrutamiento de peticiones a APIs: el modelo puede clasificar la intencion del usuario y emitir la llamada a funcion correspondiente con los parametros correctos, funcionando como capa de enrutamiento en arquitecturas de microservicios.
- Automatizacion de flujos RPA: en entornos de automatizacion de procesos roboticos, el modelo puede generar las llamadas necesarias para interactuar con sistemas internos mediante APIs REST o funciones locales.
- Prototipado rapido de agentes en hardware consumer: gracias a sus cuantizaciones desde 0.5 GB, es posible ejecutar el modelo en portatiles y GPUs de gama media para validar flujos de tool calling antes de escalar a modelos mayores.
- Generacion de comandos y acciones en asistentes de voz o chatbots: el modelo puede transformar lenguaje natural en comandos estructurados para sistemas de control, domotica o asistentes personales.
- Evaluacion y benchmarking de pipelines de function calling: al ser un modelo pequeno y especializado, sirve como baseline para medir la calidad de integraciones de tool use en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 0.5 GB (IQ1_S) hasta aproximadamente 1.3 GB (Q6_K), segun la cuantizacion elegida.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre puede ejecutar las cuantizaciones mas pequenas; RTX 3060, RTX 4060, RTX 4090 o superiores manejan sin problema las cuantizaciones de mayor calidad.
- Cabe en GPU consumer: si, en practicamente todas las GPUs modernas, incluidas las de gama baja con 4 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y con endpoints de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un modelo de 1.5B, se espera throughput alto en GPUs consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ToolSure_Qwen2.5_1.5B_CONSTRAINED-i1-GGUF | 1.5B | no disponible | apache-2.0 | GGUF | Hugging Face |
| Qwen2.5-1.5B (base) | 1.5B | no disponible | apache-2.0 | safetensors, GGUF | Hugging Face |
| ToolSure_Qwen2.5_1.5B_CONSTRAINED (original) | 1.5B | no disponible | apache-2.0 | safetensors | Hugging Face |

La comparativa con alternativas especializadas en function calling de otros autores no esta disponible en la informacion proporcionada. El modelo se posiciona como una variante cuantizada del ajuste fino original, por lo que su principal diferencia frente al modelo base es el formato GGUF y la compresion mediante imatrix.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Al ser un ajuste fino especializado en tool calling, su calidad en generacion de texto abierto puede ser inferior a la del modelo base Qwen2.5-1.5B.
- Riesgo de alucinacion en la generacion de parametros de funciones, especialmente en cuantizaciones agresivas (IQ1, IQ2, Q2_K).
- Las cuantizaciones por debajo de Q4 pueden degradar significativamente la calidad de las llamadas a funciones; se recomienda Q4_K_M o superior para produccion.
- La longitud de contexto no esta documentada; debe verificarse antes de usar en conversaciones multi-turno largas.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda revisar las condiciones del modelo base y del dataset de entrenamiento.
- No se dispone de informacion sobre sesgos especificos del modelo; al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento originales.
- El tag "constrained" sugiere un formato de salida especifico que puede requerir plantillas o parsers concretos; la integracion sin el formato adecuado puede producir errores.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/ToolSure_Qwen2.5_1.5B_CONSTRAINED-i1-GGUF
- Modelo base: https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_CONSTRAINED
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/ToolSure_Qwen2.5_1.5B_CONSTRAINED-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#ToolSure_Qwen2.5_1.5B_CONSTRAINED-i1-GGUF

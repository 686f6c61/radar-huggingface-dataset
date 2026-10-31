# poisonxa/Swift-1.5-Qwen3.8-Flash-Next-PXQN2

## Resumen

Swift 1.5 Qwen3.8-Flash-Next PXQN2 es una cuantización en formato GGUF del modelo Swift 1.5 Qwen3.8-Flash-Next, un fine-tune orientado a razonamiento eficiente sobre Qwen3.8-Flash-Next, un modelo Mixture-of-Experts de gran tamaño desarrollado por UkisAI. Esta build concreta ha sido cuantizada y redistribuida por PXA Network (poisonxa en Hugging Face) y es la variante que el propio autor recomienda dentro del ecosistema Swift, por acercarse más al modelo original en precisión completa que su alternativa de 32 GB (PXQN).

El problema que resuelve es la ejecución de un modelo MoE de 179.549 millones de parámetros totales en hardware doméstico: el archivo ocupa 66,9 GB en disco en tres partes, de los cuales unos 37 GB se cargan en las tarjetas gráficas y el resto (una tabla n-gram/PLE integrada) se sirve desde la memoria del sistema. Requiere el runtime PXA 4.0 beta 5 o superior y funciona en configuraciones como 3 tarjetas de 16 GB completamente en GPU, o con menos tarjetas usando el modo Overdrive.

Su relevancia actual radica en que ofrece una fidelidad notablemente alta respecto al modelo original (divergencia KL de 0,375 y coincidencia del token superior en el 79,2 % de los casos), especialmente en idiomas distintos del inglés, manteniendo la ejecución viable en GPUs Pascal y Volta según los tags del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), basada en Qwen3.8-Flash-Next |
| Parametros totales | 179.549.411.712 (179,55 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (verificado needle-in-haystack a 8K) |
| Tipos de cuantizacion | Cuantizacion propia de PXA (formato PXQN2); existe variante PXQN de 32 GB |
| Idiomas soportados | no disponible (mejor fidelidad declarada fuera del ingles respecto a la variante 32 GB) |
| Licencia | Swift Open License 1.0 (license:other) |
| Formato de pesos | GGUF, dividido en 3 partes (endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un transformer de tipo Mixture-of-Experts con 179,55 mil millones de parametros totales, sobre el que UkisAI ha aplicado un fine-tune descrito como "reasoning-efficient" (eficiente en razonamiento). No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO.

La innovacion principal de esta ficha no esta en el modelo sino en la cuantizacion: PXA Network emplea un esquema híbrido en el que unos 37 GB de pesos cuantizados residen en la GPU y una tabla n-gram/PLE (probablemente para prediccion especulativa o compensacion de cuantizacion) se mantiene en la memoria del host. El README menciona ademas "multi-token prediction" como opcion de decodificacion, que ademas de acelerar la generacion corrige un problema de repeticion en prompts en chino con contexto corto y muestreo greedy.

## Capacidades

- Generacion de texto conversacional (pipeline tag: conversational).
- Razonamiento: el modelo base es un fine-tune orientado a razonamiento eficiente, aunque no se publican benchmarks especificos.
- Prediccion multi-token durante la decodificacion (activada por defecto en el launcher de PXA).
- Soporte multilingue: se declara mayor fidelidad que la variante PXQN 32 GB en idiomas distintos del ingles, incluido el chino (con la limitacion indicada en Limitaciones).
- Ejecucion con contexto verificado al menos hasta 8K (prueba de needle superada).
- Salida determinista en condiciones repetidas: 12 de 12 ejecuciones identicas con la misma semilla/configuracion.
- No hay informacion sobre tool calling, agentes, vision ni audio.

## Casos de uso

- Chatbot conversacional local: el modelo puede desplegarse en estaciones de trabajo con 3 GPUs de 16 GB para asistentes conversacionales sin depender de APIs externas, gracias a su formato GGUF y al runtime PXA.
- Razonamiento en hardware antiguo: los tags pascal y volta indican compatibilidad con GPUs como la P100 (usada en las pruebas del autor), lo que permite aproveitar hardware de datacenter descartado para inferencia de un modelo de 179 B de parametros.
- Tareas multilingues de calidad: al acercarse mas al modelo de precision completa que la variante de 32 GB, es adecuado para generacion de texto en idiomas distintos del ingles donde las cuantizaciones agresivas suelen degradar la calidad.
- Experimentacion con MoE de gran escala: investigadores pueden estudiar el comportamiento de un MoE de 179 B sin acceso a clusters, repartiendo pesos entre VRAM y RAM del sistema con el modo Overdrive.
- Generacion acelerada con multi-token prediction: el soporte de prediccion multi-token permite reducir la latencia percibida en flujos de generacion larga.
- Validacion de cuantizaciones: la divergencia KL publicada (0,375) y la tasa de coincidencia de token superior (79,2 %) lo hacen util como referencia para comparar metodos de cuantizacion sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de calidad son mediciones del propio autor de la cuantizacion frente al modelo en precision completa:

| Metrica | PXQN2 (este archivo) | PXQN 32 GB |
|---|---|---|
| Divergencia KL (menor es mejor) | 0,375 | 1,032 |
| Coincidencia del token superior | 79,2 % | 54,5 % |

Pruebas adicionales del autor: salida identica en 12 de 12 ejecuciones repetidas y localizacion correcta de una aguja a 8K de contexto, en 3 x P100 con PXA 4.0 beta 5.

## Requisitos de hardware

- VRAM estimada: unos 37 GB de pesos en GPU; el resto del archivo (66,9 GB en total, correspondiente a la tabla n-gram/PLE) se sirve desde la memoria del sistema.
- Configuracion verificada por el autor: 3 x 16 GB (3 x NVIDIA P100, arquitectura Pascal) completamente en GPU.
- Configuracion alternativa: menos tarjetas + RAM del sistema mediante el modo Overdrive del launcher PXA.
- Los tags del repositorio mencionan pascal y volta, lo que sugiere compatibilidad con arquitecturas de GPU antiguas; no hay datos para arquitecturas mas recientes, aunque es razonable asumir compatibilidad.
- Software requerido: PXA 4.0 beta 5 o superior (no es un GGUF estandar de llama.cpp; se ejecuta a traves del ecosistema PXA: `./pxa`, PXA Control).
- Latencia y throughput: no disponibles; el multi-token prediction activado por defecto se declara beneficioso para la fluidez de la generacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Formato | Contexto verificado | Fidelidad vs. original | Licencia |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-Flash-Next-PXQN2 (este) | 179,55 B | GGUF (PXA, 66,9 GB) | 8K (needle) | KL 0,375 / top token 79,2 % | Swift Open License 1.0 |
| Swift-1.5-Qwen3.8-Flash-Next-PXQN 32 GB (mismo autor) | 179,55 B | GGUF (PXA, 32 GB) | no disponible | KL 1,032 / top token 54,5 % | Swift Open License 1.0 |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next (base) | 179,55 B | safetensors | no disponible | referencia (precision completa) | no disponible |

## Limitaciones y advertencias

- Bug conocido: con contexto corto (1K), muestreo greedy y multi-token prediction desactivada, algunos prompts en chino pueden entrar en bucles de repeticion. Con la configuracion por defecto el problema no se manifiesta; hay una correccion en desarrollo.
- La calidad reportada (KL, coincidencia de top token) procede del propio autor de la cuantizacion y no ha sido verificada por terceros.
- No hay benchmarks estandar publicados, por lo que es imposible comparar su rendimiento en tareas de razonamiento, codigo o matematicas con otros modelos.
- Requiere un runtime especifico (PXA 4.0 beta 5+); no es compatible de forma directa con llama.cpp, Ollama, vLLM o TGI pese a usar extension GGUF.
- Necesita combinacion de VRAM y RAM de sistema considerable (66,9 GB en disco, ~37 GB en GPU), lo que limita su uso en equipos modestos.
- Licencia Swift Open License 1.0: es una licencia de tipo "other"; deben revisarse los archivos LICENSE, LICENSE-QWEN, NOTICE y REDISTRIBUTOR-NOTICE.txt antes de cualquier uso comercial, ya que los terminos exactos no estan resumidos en la model card.
- Modelo muy reciente (creado en octubre de 2026) con muy poca traccion comunitaria (532 descargas, 1 like), lo que implica soporte y documentacion limitados.
- Longitud de contexto maxima no documentada; solo se ha verificado experimentalmente el funcionamiento a 8K.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/poisonxa/Swift-1.5-Qwen3.8-Flash-Next-PXQN2
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next
- Comunidad / soporte (Discord de PXA Network): https://discord.pxanetwork.com

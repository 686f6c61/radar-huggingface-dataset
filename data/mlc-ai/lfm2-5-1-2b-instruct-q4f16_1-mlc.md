# mlc-ai/LFM2.5-1.2B-Instruct-q4f16_1-MLC

## Resumen

LFM2.5-1.2B-Instruct-q4f16_1-MLC es una conversión al formato MLC (Machine Learning Compilation) del modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado originalmente por Liquid AI. Esta versión la publica el equipo de mlc-ai y está pensada específicamente para su ejecución en el navegador mediante WebLLM, el runtime de inferencia basado en WebGPU que forma parte del ecosistema MLC-LLM.

El modelo original es un transformer de 1.200 millones de parámetros orientado a generación de texto e instrucciones, con una ventana de contexto declarada de 128.000 tokens. La conversión aplica cuantización `q4f16_1` (pesos en 4 bits, activaciones en FP16), lo que reduce el peso del repositorio a aproximadamente 0,7 GB y permite desplegarlo en entornos con recursos limitados, incluido el navegador del cliente.

La relevancia de esta ficha radica en que permite ejecutar un modelo de instrucciones de contexto largo íntegramente en el dispositivo del usuario, sin servidor ni API. El paquete MLC fija un tamaño de chunk de prefill de 1.024 tokens y el registro por defecto de WebLLM limita el contexto a 4.096 tokens para acotar el consumo de memoria, aunque la configuración soporta hasta 128.000.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-1.2B-Instruct; detalles arquitectónicos del original no disponibles en la información proporcionada) |
| Parámetros totales | 1.200 millones (1.2B, según el nombre del modelo base) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 128.000 tokens (ventana del paquete); 4.096 tokens por defecto en el registro de WebLLM; chunk de prefill de 1.024 tokens |
| Tipos de cuantización | `q4f16_1` (pesos 4 bits, activaciones FP16); requiere la característica `shader-f16` de WebGPU |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`), con limitación de uso comercial en la sección 5 |
| Formato de pesos | MLC (MLC-LLM / WebLLM); repositorio de ~0,7 GB |

## Arquitectura y entrenamiento

Esta ficha corresponde a una conversión de pesos, no a un entrenamiento nuevo. El modelo base es LiquidAI/LFM2.5-1.2B-Instruct, un transformer de 1.200 millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO en el modelo original; esos datos deben consultarse en la model card de Liquid AI.

La innovación técnica de esta versión es el pipeline de conversión a MLC-LLM: los pesos se transforman con `mlc_llm convert_weight` usando cuantización `q4f16_1`, y la configuración se genera con `mlc_llm gen_config` fijando `--conv-template lfm2`, ventana de contexto de 128.000 tokens y chunk de prefill de 1.024. Las librerías WebGPU se compilan por separado con revisiones de código concretas (TVM `be03dc94b001` para la conversión, MLC-LLM `5e824377af7f`), y la procedencia queda registrada en `mlc-build-info.json` junto con el checksum de los pesos de origen (revisión `0f604ada3f76` del modelo base). El artefacto resultante se ejecuta en WebLLM sobre WebGPU, con candidatos de runtime `v0_2_87` y web-runtime `0.28.0-dev2`.

## Capacidades

- Generación de texto e instrucciones: el modelo base es un modelo instruct, por lo que responde a prompts en formato conversacional mediante la plantilla `lfm2`.
- Contexto largo: la configuración soporta hasta 128.000 tokens, con procesamiento por chunks de prefill de 1.024 tokens.
- Ejecución en navegador: inferencia local vía WebLLM sobre WebGPU, sin backend remoto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistentes web sin backend: integrar el modelo en una aplicación web mediante WebLLM para ofrecer un chat que se ejecuta íntegramente en el navegador del usuario, sin enviar datos a un servidor y con el paquete de ~0,7 GB descargado una sola vez.
- Procesamiento de documentos largos en cliente: con la ventana de 128.000 tokens del paquete, resumir o extraer información de documentos extensos dentro de una aplicación web, ajustando el contexto del registro de WebLLM según la memoria disponible.
- Herramientas de escritura offline: corrección, reescritura y generación de borradores en aplicaciones de productividad que deben funcionar sin conexión y sin coste de API.
- Demos y prototipos de IA generativa: validar flujos de producto con un modelo instruct de 1.2B desplegado en el navegador, sin infraestructura de GPU en servidor.
- Privacidad por diseño: escenarios con datos sensibles (salud, legal, RR. HH.) donde el requisito es que el texto no salga del dispositivo del usuario, aprovechando la inferencia local en WebGPU.
- Educación y experimentación: entornos docentes o de investigación que necesitan un modelo de instrucciones ligero y reproducible, con comandos de conversión documentados y checksums verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la model card del modelo original (LiquidAI/LFM2.5-1.2B-Instruct) para evaluaciones y capacidades.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa ~0,7 GB en cuantización `q4f16_1`; el consumo real en WebGPU depende del contexto configurado y del chunk de prefill (1.024 tokens), no solo del tamaño de los pesos.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y de la característica `shader-f16`; no se especifican modelos concretos en la información proporcionada.
- GPU de consumo: el diseño apunta a ejecución en el navegador del cliente, por lo que está pensado para GPUs de consumo con WebGPU; no se detallan modelos ni límites mínimos.
- Opciones de despliegue: WebLLM (runtime `0.28.0-dev2` en los candidatos indicados) sobre WebGPU; el paquete es específico de MLC-LLM y no se distribuye en GGUF ni safetensors en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. El registro de WebLLM limita el contexto a 4.096 tokens por defecto para acotar el uso de memoria, lo que condiciona el rendimiento en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-q4f16_1-MLC (esta ficha) | 1.2B | 128.000 tokens (4.096 por defecto en WebLLM) | MLC / WebLLM | LFM Open License v1.0 (uso comercial limitado) | Sí, vía WebGPU |
| LiquidAI/LFM2.5-1.2B-Instruct (original) | 1.2B | no disponible en la información proporcionada | safetensors (formato del modelo base) | LFM Open License v1.0 | No directamente; requiere conversión |
| Alternativas de ~1B en formato MLC para WebLLM | no disponible | no disponible | MLC | variable | Sí |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia: LFM Open License v1.0 incluye una limitación de uso comercial en la sección 5; es imprescindible revisar el archivo `LICENSE` antes de un despliegue comercial.
- Contexto efectivo: aunque el paquete soporta 128.000 tokens, el registro por defecto de WebLLM usa 4.096 tokens para limitar el consumo de memoria; ampliarlo incrementa los requisitos de memoria del cliente.
- Requisito de hardware: la variante `q4f16_1` exige la característica `shader-f16` de WebGPU; los navegadores o GPUs sin ese soporte no podrán ejecutar el modelo.
- Compatibilidad de runtime: los candidatos WebGPU indicados usan `v0_2_87` y web-runtime `0.28.0-dev2`; versiones distintas del runtime pueden no ser compatibles con este paquete.
- Parámetros de muestreo: los valores por defecto de MLC son temperature 1.0, top_p 1.0 y repetition_penalty 1.0, mientras que Liquid AI recomienda temperature 0.1 y repetition_penalty 1.05; usar los valores por defecto sin ajustar puede degradar la calidad de las respuestas.
- Idiomas, sesgos y alucinación: no hay información disponible en esta ficha sobre cobertura lingüística, sesgos conocidos o tasas de alucinación; deben consultarse en la model card del modelo original.
- Modelo de 1.2B: por tamaño, es previsible una capacidad de razonamiento y conocimiento factual inferior a la de modelos mucho mayores; no se aportan datos de evaluación que lo confirmen o desmientan.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/mlc-ai/LFM2.5-1.2B-Instruct-q4f16_1-MLC
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Revisión de pesos de origen: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/tree/0f604ada3f766f9f257460c4c9f0b5d6f69d431b
- Documentación de WebLLM: https://webllm.mlc.ai/docs/
- Procedencia de librerías WebGPU: https://github.com/JCNTH/binary-mlc-llm-libs/blob/d30ec58c9b0b211a2626ab708a408c7bd59a8369/web-llm-models/v0_2_87/new-models-candidate-provenance.json
- Commit de TVM usado en la conversión: https://github.com/akaashrp/tvm/commit/be03dc94b001269b88ae010d2ac352256be55579
- Commit de MLC-LLM usado en la conversión: https://github.com/JCNTH/mlc-llm/commit/5e824377af7fc959d989ddc52dd44a55c7638f49

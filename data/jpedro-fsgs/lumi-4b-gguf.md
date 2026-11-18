# jpedro-fsgs/lumi-4b-GGUF

## Resumen

Lumi-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parámetros (3.973.556.832 exactos) especializado en portugués de Brasil, desarrollado por el equipo de PLN del CEIA/UFG (Centro de Excelencia en Inteligencia Artificial de la Universidad Federal de Goiás). Parte del modelo NVIDIA Nemotron 3 Nano 4B, sobre el que se aplicó preentrenamiento continuado, destilación de conocimiento y ajuste fino supervisado para adaptarlo al portugués brasileño. La ficha que nos ocupa documenta la cuantización GGUF del modelo base `ceia-research/lumi-4b` (revisión v0.2), publicada por el usuario jpedro-fsgs para su uso con llama.cpp en CPU o GPU.

La relevancia de esta publicación es doble: por un lado, ofrece una vía de despliegue ligera (un único archivo Q4_K_M de 2,84 GB) para un modelo regional de 4B; por otro, hereda la arquitectura híbrida Mamba2/Transformer de la familia Nemotron 3 Nano, lo que la diferencia de los transformers densos convencionales en coste de inferencia para contextos largos. El modelo soporta portugués e inglés y está etiquetado como conversacional, con plantilla de chat embebida en el GGUF.

Es importante señalar que esta ficha describe la cuantización GGUF, no los pesos originales en BF16. Los benchmarks y detalles de entrenamiento completos se remiten al model card del modelo base, que no forma parte de la información proporcionada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2/Transformer (heredada de NVIDIA Nemotron 3 Nano 4B) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | Portugués (pt), portugués de Brasil, inglés (en) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (archivo `lumi-4b-Q4_K_M.gguf`, 2,84 GB) |

## Arquitectura y entrenamiento

El modelo base Lumi-4B se construye sobre NVIDIA Nemotron 3 Nano 4B, cuya arquitectura es híbrida Mamba2/Transformer. Sobre esos pesos se aplicó preentrenamiento continuado, destilación de conocimiento y ajuste fino supervisado, según indica la model card de la cuantización. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación adicionales como RLHF o DPO; esos datos se remiten al card del modelo base `ceia-research/lumi-4b`, que no se ha proporcionado.

La cuantización se generó a partir de la revisión `27b30f4` del modelo base (Lumi-4B v0.2) en BF16, mediante `convert_hf_to_gguf.py --outtype bf16` (commit `ad5cbfa` de llama.cpp) y posterior `llama-quantize` a Q4_K_M sin imatrix. Un detalle técnico relevante: el `tokenizer_config.json` original declara `tokenizer_class: TokenizersBackend` (transformers 5), y en la conversión con transformers 4.57 se usó `PreTrainedTokenizerFast`, que lee el mismo `tokenizer.json` con vocabulario y tokens especiales idénticos. La plantilla de chat está embebida en el GGUF.

## Capacidades

- Generación de texto conversacional en portugués de Brasil e inglés.
- Razonamiento y respuesta multi-turno (etiqueta `conversational`).
- Modo "thinking" presente en el modelo base, pero desaconsejado en esta versión: la model card indica mantenerlo desactivado con `--reasoning off` o `"chat_template_kwargs": {"enable_thinking": false}`.
- Salida estructurada mediante `response_format` con `json_schema` en llama-server.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional en portugués de Brasil: el modelo puede gestionar diálogos multi-turno en aplicaciones de atención al cliente o asistentes virtuales, aprovechando su especialización en pt-BR y su plantilla de chat embebida.
- Despliegue en CPU o hardware modesto: el archivo Q4_K_M de 2,84 GB permite ejecutar el modelo con llama.cpp en equipos sin GPU dedicada, útil para prototipos y entornos de desarrollo locales.
- Generación de salidas JSON estructuradas: gracias al soporte de `response_format` con `json_schema` en llama-server, puede integrarse en pipelines que requieran respuestas parseables (extracción de datos, clasificación con formato fijo).
- Servicio con API compatible con OpenAI: `llama-server` expone una API compatible con OpenAI, lo que facilita sustituir proveedores externos en aplicaciones existentes sin reescribir el cliente.
- Procesamiento de texto en portugués para investigación en PLN: al ser un modelo regional de 4B, sirve como base para experimentos de ajuste fino o evaluación en tareas de lengua portuguesa con requisitos de cómputo reducidos.
- Aplicaciones de bajo consumo en producción: la arquitectura híbrida Mamba2/Transformer del modelo base está pensada para reducir el coste de inferencia en secuencias largas, lo que encaja en servicios con restricciones de latencia y memoria.
- Prototipado rápido con Ollama o llama.cpp: el formato GGUF y la plantilla embebida permiten arrancar un servidor local con un solo comando para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantización remite a los benchmarks del card del modelo base `ceia-research/lumi-4b`, que no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 2,84 GB; se puede ejecutar en CPU sin VRAM dedicada. Para GPU, se requiere al menos ~3-4 GB de VRAM para cargar el modelo en Q4_K_M, más el espacio para el contexto (no confirmado en la información disponible).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar el archivo Q4_K_M, aunque no se confirma en la documentación.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 4 GB o más de VRAM, dado el tamaño del archivo; no confirmado explícitamente.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con soporte de API compatible con OpenAI y salida estructurada. Ollama y vLLM no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modo "thinking" debe permanecer desactivado en esta versión; la model card lo marca como requisito (`--reasoning off` o `enable_thinking: false`).
- Solo se publica una cuantización (Q4_K_M); no hay variantes Q5, Q8 ni BF16 en este repositorio, lo que limita el ajuste fino de la calidad frente al tamaño.
- El modelo está especializado en portugués de Brasil e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia es la NVIDIA Nemotron Open Model License, no una licencia de código abierto estándar; es necesario revisar sus términos antes de un uso comercial, ya que puede imponer restricciones específicas.
- Al derivar de un modelo base de 4B, es previsible un mayor riesgo de alucinación y menor capacidad de razonamiento que modelos de mayor tamaño; no se aportan datos de evaluación que lo cuantifiquen.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El repositorio presenta 0 descargas y 0 likes, y fue creado recientemente (17 de noviembre de 2026); no hay evidencia de uso en producción ni validación comunitaria.
- La longitud de contexto no se especifica; el ejemplo de la model card usa `-c 8192`, pero no debe interpretarse como el máximo soportado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jpedro-fsgs/lumi-4b-GGUF
- Modelo base: https://huggingface.co/ceia-research/lumi-4b
- Revisión del modelo base usada: https://huggingface.co/ceia-research/lumi-4b/tree/27b30f40b930fd05cee5e1c1f8790f70fa5b816d
- Modelo NVIDIA de origen: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- llama.cpp: https://github.com/ggml-org/llama.cpp

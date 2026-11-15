# Asrun/Wren-31B-UK

## Resumen

Wren-31B-UK es un ajuste fino (fine-tuning) del modelo abierto Gemma 4 31B de Google, desarrollado por la consultora británica Asrun y publicado en formato MLX de 8 bits para su ejecución local en equipos Apple Silicon. El modelo está orientado a un nicho muy concreto: empresas medianas y pequeñas del Reino Unido y productoras de medios, con un énfasis explícito en convenciones británicas (ortografía, libra esterlina, formato de fecha DD/MM/YYYY) y en el marco regulatorio y comercial del Reino Unido (HMRC/IVA, Companies House, UK GDPR, IR35 y la Late Payment of Commercial Debts Act de 1998).

La propuesta de valor es la soberanía de datos: el modelo se ejecuta íntegramente en local sobre Macs con memoria unificada de 48 GB a 128 GB, sin telemetría en la nube, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Con 30.697.345.280 parámetros totales y un contexto recomendado de 32.768 tokens, se posiciona como una alternativa especializada frente a modelos generalistas del mismo orden de magnitud.

Es relevante ahora porque cubre una demanda creciente de IA "soberana" y on-premise en el tejido empresarial británico, un segmento que a menudo queda mal atendido por modelos entrenados predominantemente con datos estadounidenses y convenciones comerciales distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 31B); pesos en formato MLX 8-bit |
| Parametros totales | 30.697.345.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (recomendado en LM Studio); máximo nativo no disponible |
| Tipos de cuantizacion | 8-bit (MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles; especializado en ingles britanico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); tamano del repo 32,6 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Google Gemma 4 31B en su variante instruct (`google/gemma-4-31b-it`), un transformer de aproximadamente 30.700 millones de parametros. Asrun ha realizado un ajuste fino supervisado sobre esta base y ha publicado los pesos convertidos y cuantizados a 8 bits en formato MLX, optimizado para el framework MLX de Apple en chips M-series. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales.

La innovación declarada no es arquitectónica sino de dominio: el ajuste incorpora anclaje en marcos regulatorios y comerciales británicos (normativa fiscal de HMRC e IVA, cumplimiento de Companies House, UK GDPR, IR35, intereses legales por mora según la ley de 1998) y en flujos de trabajo de producción audiovisual (call sheets, presupuestos, cesiones de derechos de talento y localizaciones, cumplimiento de Ofcom/ASA). No se documentan innovaciones de decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Generación de texto conversacional en inglés británico, con ortografía y convenciones del Reino Unido aplicadas de forma consistente (colour, organisation, programme, licence, behaviour).
- Formateo localizado: moneda en libras esterlinas (£) y fechas en formato DD/MM/YYYY.
- Redacción y revisión de cláusulas comerciales: condiciones de pago, intereses por mora estatutarios y términos de revisión con clientes.
- Conocimiento de marcos regulatorios británicos: HMRC/IVA, Companies House, UK GDPR, IR35 y normativa de pagos comerciales.
- Soporte para flujos de producción de medios: call sheets, presupuestos de producción, cesiones de talento y localizaciones, cumplimiento de Ofcom y ASA.
- Ejecución local sin telemetría en la nube sobre Apple Silicon (MLX) y en LM Studio.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio) o modo de razonamiento extendido (thinking): no disponible en la información proporcionada.

## Casos de uso

- Asistencia jurídica y comercial interna en pymes británicas: redacción de cláusulas de pago con intereses por mora conforme a la ley de 1998, revisión de contratos con proveedores y comprobación de plazos de pago, aprovechando el anclaje del modelo en normativa británica y su formato de fecha local.
- Cumplimiento fiscal y societario: generación de borradores de comunicaciones y checklists relativos a IVA, presentaciones en Companies House y obligaciones de UK GDPR, con terminología y convenciones del Reino Unido.
- Producción audiovisual: elaboración de call sheets, presupuestos de rodaje, cesiones de derechos de talento y localizaciones, y verificación de cumplimiento publicitario (Ofcom/ASA) antes de la emisión.
- Atención al cliente en empresas británicas: conversaciones multi-turno en inglés británico con contexto de hasta 32.768 tokens, útil para hilos de soporte largos o consultas que requieren recuperar detalles de mensajes previos.
- Despliegue soberano on-premise: asistentes internos entrenados sobre políticas y procedimientos (SOP) propios de la empresa, ejecutados en Macs M-series de 48 GB a 128 GB sin envío de datos a la nube, lo que facilita el cumplimiento de UK GDPR.
- Documentación y comunicación corporativa: redacción de correos, propuestas e informes con ortografía y registro británicos consistentes, evitando la corrección manual de variantes estadounidenses.
- Prototipado y evaluación de modelos especializados: servir como base para comparar el efecto del ajuste de dominio frente a Gemma 4 31B instruct en tareas comerciales y regulatorias del Reino Unido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 32,6 GB en pesos de 8 bits; se recomienda un Mac con 48 GB de memoria unificada como mínimo y hasta 128 GB para mayor holgura.
- GPU recomendadas: Apple Silicon M-series (M1 Pro/Max/Ultra en adelante) con 48 GB o más de memoria unificada. No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en esta distribución MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon de gama alta con 48 GB o más; no se indica compatibilidad con GPU de consumo NVIDIA en el formato publicado.
- Opciones de despliegue: MLX (`mlx-lm`) y LM Studio. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para estos pesos.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Wren-31B-UK | 30,7 B | 32.768 (recomendado) | Apache 2.0 | MLX 8-bit (safetensors) | Dominio británico, on-premise Apple Silicon |
| google/gemma-4-31b-it (base) | ~31 B | no disponible | no disponible en la informacion | safetensors | Generalista instruct, multilingüe |
| Alternativas de ~30 B de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de rendimiento con alternativas no está disponible, ya que el autor no publica benchmarks. La diferencia principal frente al modelo base es el ajuste de dominio (convenciones y normativa del Reino Unido) y la distribución en MLX 8-bit para ejecución local.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para el Reino Unido y el inglés británico; su rendimiento en otros idiomas, variantes del inglés o jurisdicciones distintas no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación en materia regulatoria: aunque se declara anclaje en normativa británica, no se garantiza la exactitud de referencias legales, fiscales o de cumplimiento; cualquier salida con implicaciones legales debe ser revisada por un profesional cualificado.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad; el ajuste sobre datos de dominio empresarial británico puede introducir sesgos específicos no caracterizados.
- Contexto: el valor de 32.768 tokens es una recomendación de uso en LM Studio; el máximo nativo del modelo base no se especifica.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base Gemma 4 31B de Google, que pueden imponer obligaciones adicionales.
- Producción: no hay benchmarks, métricas de latencia ni informes de robustez publicados; el modelo tiene cero descargas y cero likes en el momento de la ficha, por lo que carece de validación por parte de la comunidad.
- Hardware: la distribución MLX limita el despliegue a equipos Apple Silicon; no se ofrecen pesos GGUF ni safetensors estándar para GPU NVIDIA.
- Telemetría: se declara ausencia de telemetría en la nube, pero no se detalla el proceso de conversión ni se ofrecen hashes de verificación de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asrun/Wren-31B-UK
- Sitio del autor (Asrun): https://asrun.co.uk
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Framework MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
- LM Studio: https://lmstudio.ai

# sallani/MrCompliance-AIRisk-Qwen2.5-1.5B-Edge-ONNX

## Resumen

MrCompliance-AIRisk-Qwen2.5-1.5B-Edge-ONNX es la exportación a formato ONNX del modelo ajustado sallani/MrCompliance-AIRisk-Qwen2.5-1.5B-Edge, un fine-tuning de Qwen2.5-1.5B orientado a la evaluación de riesgos de sistemas de inteligencia artificial y al cumplimiento normativo. Lo publica el usuario sallani y está pensado para ejecutarse íntegramente en el navegador mediante Transformers.js 4.3.2, con soporte de WebGPU y de WASM/CPU.

Se trata de un transformer decoder-only denso de 1.500 millones de parámetros derivado de la familia Qwen2.5, cuantizado a 4 bits (MatMulNBits simétrico, bloque de 32) para reducir el peso del repositorio a 3,2 GB. La relevancia actual radica en que demuestra un caso de uso de cumplimiento de IA desplegable en el edge sin backend: el modelo clasifica y razona sobre factores de riesgo y devuelve JSON estructurado, lo que permite integrarlo en aplicaciones web de auditoría o asistencia regulatoria sin enviar datos a un servidor.

El modelo está etiquetado para francés e inglés, se distribuye bajo licencia Apache 2.0 y su model card reporta métricas sobre 48 casos de prueba: F1 de factor del 75,6 % y JSON válido en el 97,9 % de los casos, medidas con Transformers.js q4 en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits MatMulNBits simetrico, bloque 32; variantes q4f16 (WebGPU) y q4 (WASM/CPU) |
| Idiomas soportados | Frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model_q4f16.onnx, model_q4.onnx) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B, un transformer decoder-only denso con atención multi-cabeza estándar y RoPE. La model card indica que se verificó el valor de RoPE θ=1e6 antes de la exportación, un detalle relevante porque una configuración incorrecta de RoPE degrada la coherencia en contextos largos y en la generación posicional tras la conversión. El modelo base es un fine-tuning de sallani/MrCompliance-AIRisk-Qwen2.5-1.5B-Edge, especializado en evaluación de riesgo de IA y cumplimiento.

La exportación a ONNX aplica cuantización de 4 bits con MatMulNBits simétrico y tamaño de bloque 32, generando dos variantes: q4f16, que combina pesos de 4 bits con activaciones en float16 y está recomendada para WebGPU, y q4, orientada a ejecución en WASM/CPU. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se emplearon RLHF o DPO en el ajuste del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en francés e inglés.
- Razonamiento sobre factores de riesgo de sistemas de IA y cumplimiento normativo (dominio específico del fine-tuning).
- Salida estructurada en JSON válido en el 97,9 % de los casos evaluados, adecuada para pipelines que consumen la respuesta de forma programática.
- Clasificación y extracción de factores de riesgo (F1 de factor del 75,6 % sobre 48 casos).
- Ejecución en navegador mediante Transformers.js 4.3.2, con backend WebGPU o WASM/CPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Auditoría de riesgo de IA en el navegador: una aplicación web puede cargar el modelo vía Transformers.js con `dtype: "q4f16"` y `device: "webgpu"` y evaluar descripciones de sistemas de IA sin enviar los datos a un servidor, lo que facilita el cumplimiento de requisitos de residencia de datos.
- Asistente de cumplimiento regulatorio embebido: el modelo responde en francés e inglés sobre factores de riesgo y puede integrarse en portales internos de compliance para guiar a equipos no técnicos en la autoevaluación de sus sistemas.
- Generación de informes estructurados: gracias a la alta tasa de JSON válido, la salida puede alimentar directamente formularios, bases de datos o dashboards de seguimiento de riesgos.
- Herramienta educativa o de formación: demos interactivas en navegador para enseñar marcos de evaluación de riesgo de IA sin infraestructura de backend.
- Prefiltrado en pipelines de revisión: clasificación rápida de casos de riesgo antes de escalar a un modelo mayor o a revisión humana, aprovechando el bajo coste de un modelo de 1.5B cuantizado.
- Prototipado rápido de productos de compliance: al ejecutarse en el cliente con WebGPU, permite validar flujos de producto con datos reales sin aprovisionar GPUs ni servidores.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas del modelo base evaluadas con Transformers.js q4 en CPU sobre 48 casos:

| Metrica | Valor | Condiciones |
|---|---|---|
| F1 de factor | 75,6 % | Transformers.js q4, CPU, 48 casos |
| JSON valido | 97,9 % | Transformers.js q4, CPU, 48 casos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 3,2 GB; la variante q4f16 con activaciones float16 requiere del orden de 1,5-2 GB de memoria de GPU en WebGPU, y la variante q4 en WASM/CPU opera en memoria del sistema.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, GPUs integradas modernas o dedicadas de gama media); para despliegue fuera del navegador, una GPU con al menos 4 GB de VRAM es suficiente para la variante de 4 bits.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con 4 GB o más de VRAM, y en el navegador mediante WebGPU.
- Opciones de despliegue: Transformers.js 4.3.2 (WebGPU o WASM/CPU) es la vía documentada; el formato ONNX también permite otros runtimes ONNX, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| MrCompliance-AIRisk-Qwen2.5-1.5B-Edge-ONNX | 1.5B | No disponible | Apache 2.0 | ONNX 4 bits, Transformers.js | Fine-tuning de dominio (riesgo de IA), fr/en |
| Qwen2.5-1.5B (base) | 1.5B | No disponible | Apache 2.0 | Safetensors, GGUF, etc. | Modelo generalista; sin especialización en riesgo ni exportación ONNX para navegador |
| MrCompliance-AIRisk-Qwen2.5-1.5B-Edge | 1.5B | No disponible | Apache 2.0 | Safetensors | Modelo base del que deriva esta exportación; mismas métricas de referencia |

La información disponible no permite comparar rendimiento con alternativas de la misma categoría más allá de las métricas del propio modelo base.

## Limitaciones y advertencias

- Modelo de dominio estrecho: está ajustado para evaluación de riesgo de IA; su rendimiento fuera de ese ámbito no está documentado y probablemente sea inferior al de un modelo generalista del mismo tamaño.
- Idiomas limitados a francés e inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a un modelo de 1.5B: las respuestas sobre marcos regulatorios pueden contener afirmaciones incorrectas y no deben usarse como asesoramiento legal sin revisión humana.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Métricas medidas sobre solo 48 casos y en CPU con q4; el rendimiento en WebGPU con q4f16 puede diferir y no está reportado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para cumplimiento regulatorio real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- La longitud de contexto no está documentada; no debe asumirse la ventana nativa de Qwen2.5 sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sallani/MrCompliance-AIRisk-Qwen2.5-1.5B-Edge-ONNX
- Modelo base: https://huggingface.co/sallani/MrCompliance-AIRisk-Qwen2.5-1.5B-Edge
- Transformers.js: https://github.com/huggingface/transformers.js
- Documentación de WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API

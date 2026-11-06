# amd/gemma-4-e2b-it-mobius-int4_rai_1.9.0_npu

## Resumen

El modelo `amd/gemma-4-e2b-it-mobius-int4_rai_1.9.0_npu` es una distribución optimizada del modelo Gemma 4 E2B en su variante instruction-tuned, publicada por AMD para su ejecución en las NPU (unidades de procesamiento neuronal) integradas en los procesadores Ryzen AI. La nomenclatura del repositorio indica una cuantización a int4 realizada con el flujo Mobius, empaquetada en formato ONNX y preparada para el runtime RAI (Ryzen AI) en su versión 1.9.0. El objetivo es ofrecer inferencia local de un modelo conversacional de la familia Gemma directamente sobre el silicio NPU de los equipos Ryzen AI, sin depender de GPU dedicada.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo entrenado desde cero por AMD: el trabajo de la compañía se centra en la cuantización, el empaquetado ONNX y la integración con el stack Ryzen AI. La información pública del repositorio es muy limitada (0 descargas y 0 likes en el momento de la consulta, acceso restringido y sin model card detallada), por lo que muchos datos técnicos deben marcarse como no disponibles.

El tamaño del repositorio es de 15,1 GB, lo que resulta coherente con un paquete que incluye pesos cuantizados a int4 junto con artefactos de compilación para NPU. El acceso está restringido: es necesario aceptar las condiciones de la licencia Gemma en Hugging Face antes de descargar los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E2B); detalles exactos no disponibles |
| Parametros totales | No disponible (la denominación E2B sugiere una variante eficiente de la familia Gemma 4; cifra exacta no publicada en la información disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 (cuantización Mobius de AMD), según el nombre del repositorio |
| Idiomas soportados | Inglés (tag `en`) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | ONNX (optimizado para NPU Ryzen AI con runtime RAI 1.9.0) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Gemma 4 de Google en su variante E2B instruction-tuned, es decir, un transformer decoder-only ajustado para seguir instrucciones y mantener conversaciones. AMD no entrena el modelo: su aportación consiste en la cuantización a int4 mediante el flujo Mobius y la conversión a ONNX con kernels específicos para la NPU de Ryzen AI. El repositorio está etiquetado con `onnx`, `ryzenai`, `npu` y `text-generation`, lo que confirma que el artefacto está pensado para el runtime RAI en versión 1.9.0.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones arquitectónicas específicas (attention lineal, decodificación especulativa, etc.) más allá de lo que corresponde al modelo base Gemma 4 E2B. Tampoco se detalla el proceso exacto de calibración de la cuantización int4 ni las técnicas de preservación de precisión aplicadas por Mobius.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Seguimiento de instrucciones (variante `it`), adecuada para asistentes y tareas de formato.
- Inferencia local en NPU Ryzen AI, sin necesidad de GPU dedicada.
- Ejecución mediante el runtime RAI 1.9.0 con pesos ONNX cuantizados a int4.
- Capacidades de razonamiento, código o matemáticas: no disponibles de forma explícita en la información proporcionada; dependen del modelo base Gemma 4 E2B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Multilingüismo: limitado a inglés según los tags del repositorio.

## Casos de uso

- Asistentes conversacionales en portátiles y equipos de sobremesa con Ryzen AI: el modelo puede ejecutarse íntegramente en la NPU, liberando CPU y GPU para otras tareas y reduciendo el consumo energético en comparación con la inferencia en GPU.
- Procesamiento de texto en local con requisitos de privacidad: al no requerir conexión a la nube, es apto para entornos donde los datos no pueden salir del dispositivo (documentación interna, notas personales, borradores).
- Automatización de oficina integrada en el sistema operativo: generación de resúmenes, reescritura de correos y respuestas sugeridas dentro de aplicaciones de escritorio que aprovechen el runtime RAI.
- Prototipado de aplicaciones de IA en el borde (edge AI): desarrolladores que quieran validar flujos conversacionales en hardware Ryzen AI antes de escalar a soluciones en servidor.
- Chat de soporte técnico offline en entornos con conectividad limitada: el modelo puede atender consultas en inglés sobre documentación previamente indexada, siempre que se combine con un sistema de recuperación externo.
- Evaluación del stack Ryzen AI y del flujo Mobius: útil para ingenieros que necesiten medir latencia, throughput y consumo de la NPU con un modelo Gemma 4 cuantizado a int4 como referencia.
- Integración en pipelines de generación de texto por lotes en equipos de sobremesa: tareas de clasificación, etiquetado o extracción de información sobre textos en inglés sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI (la versión del runtime RAI 1.9.0 condiciona la compatibilidad con generaciones concretas de silicio; no se detalla la lista exacta de SKUs soportados).
- VRAM: no aplica en el sentido tradicional, ya que la inferencia se ejecuta en la NPU; el consumo de memoria del sistema dependerá de la cuantización int4 y del empaquetado ONNX. No se publica una cifra exacta.
- GPU: no es necesaria; el artefacto está diseñado para NPU. No se documenta soporte para A100, H100, RTX 4090 u otras GPU en esta distribución.
- Despliegue: runtime Ryzen AI (RAI) 1.9.0 con los pesos ONNX incluidos; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI para este paquete concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/gemma-4-e2b-it-mobius-int4_rai_1.9.0_npu | No disponible (familia Gemma 4 E2B) | No disponible | ONNX int4 para NPU Ryzen AI | Gemma | Gated en Hugging Face |
| Modelo base Gemma 4 E2B IT (Google) | No disponible en esta ficha | No disponible | Safetensors / GGUF según distribución oficial | Gemma | Público en Hugging Face |
| Otras distribuciones cuantizadas de Gemma para CPU/GPU | No disponible | No disponible | GGUF, ONNX, etc. | Gemma | Público |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han publicado parámetros exactos, contexto ni resultados de benchmarks para esta distribución concreta.

## Limitaciones y advertencias

- Idiomas: el repositorio solo declara inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: al derivar del modelo base Gemma, hereda los sesgos presentes en sus datos de entrenamiento; no se documenta un proceso adicional de mitigación en esta distribución.
- Alucinación: riesgo inherente a los modelos generativos; la cuantización int4 puede incrementar ligeramente la degradación en tareas de precisión.
- Licencia: se rige por los Gemma Terms of Use; es necesario revisar las restricciones de uso comercial y las obligaciones de atribución antes de desplegarlo en producción.
- Acceso restringido: el repositorio es gated y requiere aceptar las condiciones en Hugging Face; la descarga no es anónima.
- Dependencia de hardware: el artefacto está atado a la NPU Ryzen AI y al runtime RAI 1.9.0; no es portable a otros aceleradores sin reconversión.
- Información escasa: no hay model card detallada, benchmarks ni documentación de calibración publicados en el repositorio, lo que dificulta evaluar su calidad frente al modelo base.
- Fecha de creación: el repositorio figura creado el 2026-11-02, dato que conviene verificar por si se trata de un artefacto con metadatos inconsistentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amd/gemma-4-e2b-it-mobius-int4_rai_1.9.0_npu
- Página de los Gemma Terms of Use: no disponible en la información proporcionada (referenciada por la licencia `gemma`).
- Documentación del runtime Ryzen AI (RAI): no disponible en la información proporcionada.
- Paper o blog de AMD sobre Mobius: no disponible en la información proporcionada.
- Modelo base Gemma 4 E2B IT: no disponible en la información proporcionada.

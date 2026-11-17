# lion-ai/wilga-beta

## Resumen

Wilga-beta es un modelo de síntesis de voz (text-to-speech) en polaco desarrollado por lion-ai, distribuido en formato ONNX y diseñado para ejecutarse en CPU. A diferencia de los sistemas TTS neuronales de gran tamaño, emplea un enfoque de tipo source-filter, lo que sugiere una arquitectura de síntesis paramétrica o híbrida orientada a la eficiencia computacional más que a la calidad máxima de naturalidad.

El modelo está entrenado sobre el dataset czyzi0/the-mc-speech-dataset y se publica bajo licencia Apache 2.0, aunque con acceso restringido (gated) que obliga a aceptar condiciones en Hugging Face antes de la descarga. Su idioma de soporte declarado es exclusivamente el polaco (pl).

Se trata de un lanzamiento con nula tracción en la plataforma (0 descargas, 0 likes en el momento de la consulta) y un repositorio de tamaño prácticamente vacío (0.0 GB), lo que indica que los pesos pueden no estar aún disponibles o que el artefacto es extremadamente ligero. Es relevante como opción de TTS local en CPU para aplicaciones en polaco donde el coste de inferencia y el despliegue en hardware modesto priman sobre la fidelidad de la voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Source-filter (síntesis de voz paramétrica); detalles concretos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible; el formato ONNX permite optimizaciones de grafo, pero no se documentan cuantizaciones específicas |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La etiqueta "source-filter" hace referencia a la familia de modelos de producción de voz que separan la fuente glotal (excitación periódica) del filtro vocal (respuesta del tracto vocal). En TTS moderno esto puede materializarse como un sintetizador paramétrico clásico, un modelo neuronal que predice parámetros acústicos, o un híbrido que combina ambos. La información proporcionada no detalla si el componente neuronal es un transformer, una CNN o un modelo recurrente, ni el número de parámetros.

El entrenamiento se realizó sobre el dataset czyzi0/the-mc-speech-dataset, de composición y tamaño no especificados en la información disponible. No se documentan número de tokens, horas de audio, técnicas de alineamiento, ni si hubo ajuste fino con RLHF/DPO (poco habitual en TTS). Tampoco se describen innovaciones como decodificación especulativa o atención lineal. El despliegue en ONNX y la orientación a CPU son los rasgos técnicos más destacables.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en polaco.
- Ejecución en CPU mediante runtime ONNX, sin requerir GPU.
- Generación de audio con arquitectura source-filter, adecuada para entornos de bajos recursos.
- Soporte multilingüe: únicamente polaco según los metadatos.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o comportamiento agéntico: no aplica.
- Modo thinking, visión o audio de entrada: no disponible.
- Control de prosodia, emociones o hablantes múltiples: no documentado.

## Casos de uso

- Lectura de textos en polaco en aplicaciones de accesibilidad: el modelo puede convertir artículos o documentos a voz en CPU, permitiendo integrarse en lectores de pantalla sin GPU dedicada.
- Asistentes de voz locales para dispositivos embebidos: al ejecutarse en ONNX sobre CPU, encaja en Raspberry Pi o mini-PC para respuestas habladas en polaco con latencia controlable.
- Generación de avisos y anuncios automatizados: sistemas de megafonía o telefonía que necesiten sintetizar mensajes dinámicos en polaco sin depender de servicios en la nube.
- Prototipado de interfaces conversacionales en polaco: equipos que desarrollen chatbots de voz pueden usar el modelo para validar el flujo de audio antes de invertir en un TTS neuronal de mayor calidad.
- Preprocesado de datos para investigación en habla: generación de audio sintético en polaco para aumentación de datasets o pruebas de pipelines de ASR.
- Aplicaciones de bajo consumo en producción: servicios con restricciones de coste que prefieran inferencia local en CPU frente a APIs de TTS comerciales, aceptando una naturalidad inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU.
- GPU recomendadas: no necesarias; cualquier GPU compatible con ONNX Runtime podría usarse, pero no se documenta.
- Cabe en GPU consumer: sí, por su orientación a CPU y bajo peso, aunque no se especifican requisitos.
- Opciones de despliegue: ONNX Runtime (principal), potencialmente integrable en servidores de inferencia compatibles con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Contexto/uso |
|---|---|---|---|---|---|
| lion-ai/wilga-beta | TTS source-filter | Polaco | ONNX | Apache 2.0 | CPU, acceso gated |
| Piper (rhasspy) | TTS neuronal ligero | Multilingüe (incl. polaco) | ONNX | MIT | CPU, acceso abierto |
| Coqui TTS (XTTS) | TTS neuronal | Multilingüe | PyTorch | MPL 2.0 / Coqui CPML | GPU/CPU, acceso abierto |

No se dispone de datos de rendimiento comparativo para wilga-beta; la comparación se limita a características de despliegue y licencia.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatización de descargas en CI/CD.
- Repositorio de 0.0 GB: los pesos pueden no estar disponibles o ser extremadamente ligeros; verificar antes de integrar.
- Idioma único (polaco): no apto para otros idiomas sin reentrenamiento.
- Calidad de voz probablemente inferior a la de TTS neuronales modernos, dado el enfoque source-filter y la orientación a CPU.
- Sin documentación sobre sesgos, alucinaciones acústicas o artefactos; se recomienda evaluación auditiva previa a producción.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated puede imponer condiciones adicionales.
- Sin benchmarks ni métricas de calidad (MOS, WER) publicadas; riesgo de rendimiento impredecible.
- Proyecto con nula adopción (0 descargas, 0 likes) y actualización reciente; soporte y mantenimiento inciertos.

## Enlaces

- Hugging Face: https://huggingface.co/lion-ai/wilga-beta
- Dataset de entrenamiento: https://huggingface.co/datasets/czyzi0/the-mc-speech-dataset
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.

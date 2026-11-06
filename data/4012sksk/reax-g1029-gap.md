# 4012sksk/reax-g1029-gap

## Resumen

REAX-g1029-gap es un artefacto experimental de ajuste fino (fine-tuning) publicado por el usuario 4012sksk sobre el modelo danyloooah/sn92-generalist-m1-mx5, que a su vez desciende de baselabs/mammoth-1 y Qwen/Qwen3.5-27B. Se trata de un modelo de aproximadamente 26.085 millones de parámetros (26,08 B) con pesos en safetensors y licencia MIT, orientado a un experimento de puntuación nativa (native-score) dentro de un pipeline de investigación. El autor declara explícitamente que las puertas de validación estricta de investigación (strict research gates) han fallado y que la calificación (qualification) es falsa, por lo que no debe interpretarse como un modelo validado para producción ni para competición oficial.

El ajuste consiste en un LoRA de atención de rango 16 aplicado únicamente sobre el backbone, entrenado con ejemplos de cross-entropy ponderados de tipo source19 (T80/N20) más un anclaje KL de 0,1 respecto al modelo padre. Se realizaron 128 actualizaciones y no se incluyeron ejemplos de entrenamiento médico. El despliegue se define como BF16(FP32(parent weight) + B@A), con verificación de hash en cada tensor modificado.

Su relevancia es limitada y de carácter metodológico: documenta un experimento reproducible de fine-tuning nativo con anclaje KL y verificación de integridad de pesos, más que un modelo listo para uso general. La información pública disponible es escasa y no incluye benchmarks, idiomas ni pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen3.5-27B, sin confirmar en la informacion proporcionada) |
| Parametros totales | 26.085.330.160 (26,08 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor describe el despliegue en BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | danyloooah/sn92-generalist-m1-mx5 |
| Tamano del repositorio | 52,2 GB |
| Descargas | 28 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion disponible; el modelo hereda la estructura del padre danyloooah/sn92-generalist-m1-mx5, descrito como una fusión por aritmética de tareas (task-arithmetic merge) de fine-tunes de mammoth-1, con ascendencia declarada de baselabs/mammoth-1 y Qwen/Qwen3.5-27B. No se confirman detalles como tipo de transformer, número de capas, cabezas de atención ni mecanismos de atención lineal o decodificación especulativa.

El entrenamiento de esta etapa consistió en un fine-tuning nativo con LoRA de atención de rango 16 sobre el backbone. Cada actualización utilizó tres ejemplos de cross-entropy ponderados de tipo source19 (T80/N20) más un término de anclaje KL de 0,1 respecto al modelo padre original. Se completaron 128 actualizaciones y no se emplearon ejemplos de entrenamiento médico. El readout original permanece sin cambios. El despliegue se define formalmente como BF16(FP32(parent weight) + B@A), con verificación de hash de cada tensor modificado. El autor indica que las puertas estrictas de investigación originales fallaron y que qualification=false.

## Capacidades

- No se documentan capacidades específicas en la informacion proporcionada.
- Al heredar de Qwen3.5-27B y de mammoth-1, es plausible que conserve generación de texto y razonamiento general, pero no se confirma en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- El autor no declara mejoras funcionales; el cambio se limita al backbone mediante LoRA de atención.

## Casos de uso

- Investigación metodológica sobre fine-tuning con anclaje KL: el modelo sirve como artefacto reproducible para estudiar el efecto de un LoRA de rango 16 con anclaje KL de 0,1 sobre un backbone de 26 B, dado que el autor documenta el número de actualizaciones y la composición de los ejemplos.
- Verificación de integridad de pesos: el esquema BF16(FP32(parent weight) + B@A) con hash por tensor modificado permite auditar la fusión de adaptadores en pipelines de investigación.
- Reproducción de experimentos de puntuación nativa: útil para equipos que replican protocolos de evaluación interna (native-score) sobre modelos derivados de Qwen3.5-27B.
- Estudio de linaje y licencias en modelos derivados: el repositorio conserva LICENSE, NOTICE, LICENSE-APACHE-2.0 y THIRD_PARTY_NOTICES.md, lo que lo convierte en un caso práctico para analizar la trazabilidad de licencias en merges y fine-tunes.
- Base para experimentos controlados de ablación: al no incluir ejemplos médicos y mantener el readout original, puede emplearse como control frente a variantes con datos adicionales.
- Docencia y formación técnica: ilustra de forma concreta cómo se documenta un ajuste LoRA con anclaje KL y verificación de hashes en un repositorio público.
- No se recomienda su uso en producción, atención al cliente, generación de código ni tareas de seguridad crítica, dado que el propio autor declara el fallo de las puertas de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia aritmética, un modelo de 26,08 B en BF16 requiere aproximadamente 52 GB solo para pesos, a lo que hay que sumar caché KV y overhead del runtime; en FP8 o cuantizaciones de 8 bits se reduciría a unos 26 GB, y en 4 bits a unos 13-14 GB, aunque estos valores son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16; no confirmado.
- Cabeza en GPU de consumo: no confirmado. En cuantización de 4 bits podría ajustarse en GPUs de 24 GB, pero no hay datos del autor que lo respalden.
- Opciones de despliegue: no disponible. El autor solo describe el formato de despliegue BF16(FP32(parent weight) + B@A); no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| 4012sksk/reax-g1029-gap | 26,08 B | no disponible | MIT | Artefacto experimental, gates fallidos |
| danyloooah/sn92-generalist-m1-mx5 (padre) | no disponible | no disponible | MIT (heredada) | Modelo base del ajuste |
| Qwen/Qwen3.5-27B (ascendiente) | ~27 B (según denominación) | no disponible | no disponible en la informacion proporcionada | Modelo upstream |
| baselabs/mammoth-1 (ascendiente) | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo upstream |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que las puertas estrictas de investigación originales fallaron y que qualification=false; los veredictos fallidos previos siguen siendo fallidos.
- El modelo no establece elegibilidad para puntuación privada oficial, campeonatos ni ingresos; no debe presentarse como modelo validado.
- No se han documentado sesgos conocidos, pero tampoco se ha publicado ninguna evaluación que permita descartarlos.
- Riesgo de alucinación: no evaluado en la informacion disponible; al ser un fine-tune de un merge de modelos generalistas, el riesgo persiste y no ha sido medido.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la licencia es MIT, pero el repositorio incorpora avisos de terceros (NOTICE, LICENSE-APACHE-2.0, THIRD_PARTY_NOTICES.md) heredados del padre; es necesario revisar esos documentos antes de un uso comercial, ya que la licencia del padre y de los ascendientes puede imponer condiciones adicionales.
- El ajuste no incluyó ejemplos médicos ni datos de dominios específicos, por lo que no debe esperarse especialización en esas áreas.
- El readout original no se modificó; cualquier mejora funcional atribuida al modelo no está respaldada por la documentación.
- El repositorio tiene 28 descargas y 0 likes, sin pipeline declarado ni resultados de benchmarks, lo que limita su validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4012sksk/reax-g1029-gap
- Modelo base: https://huggingface.co/danyloooah/sn92-generalist-m1-mx5
- Revisión fijada del padre: https://huggingface.co/danyloooah/sn92-generalist-m1-mx5/tree/ad4eccc3b4d8319c3eb79856994df6b35a584306
- Ascendiente baselabs/mammoth-1: https://huggingface.co/baselabs/mammoth-1
- Ascendiente Qwen/Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la informacion proporcionada.

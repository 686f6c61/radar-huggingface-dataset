# jorge-erdb/Vael-9B

## Resumen

Vael-9B es un modelo de generación de texto en formato GGUF publicado por el usuario jorge-erdb. Se trata de una cuantización con calibración imatrix de un modelo derivado: parte de `huihui-ai/Huihui-Ornith-1.5-9B-abliterated`, una versión "abliterated" (con los mecanismos de rechazo suprimidos) del modelo Ornith-1.5-9B. El autor lo describe como "la receta de Cyber-Tiel-Coder sobre un modelo de 9B", lo que indica un proceso de ajuste fino o mezcla posterior sobre la base abliterated.

El modelo se distribuye exclusivamente en GGUF, con calibración imatrix generada a partir de los datos de calibración v6 de bartowski, renderizados con la plantilla de chat propia del modelo. Incorpora la plantilla `Qwen-Sharp-Chat-Templates` v22.5.0 (licencia Apache-2.0) con la línea de identidad modificada a "Vael". La etiqueta `qwen3.5` sugiere que la arquitectura subyacente deriva de la familia Qwen.

Es relevante para quienes buscan un modelo de 9B sin censura, ejecutable en hardware de consumo mediante llama.cpp u Ollama, con licencia MIT que permite uso comercial sin restricciones adicionales. No obstante, la información publicada es muy escasa: no hay datos de entrenamiento, benchmarks ni especificaciones detalladas más allá de los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen, etiqueta `qwen3.5`); detalles no disponibles |
| Parametros totales | 9B (aproximado, según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con calibración imatrix (niveles concretos no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de aproximadamente 9.000 millones de parámetros, derivado de la familia Qwen según la etiqueta `qwen3.5`. El modelo base inmediato es `huihui-ai/Huihui-Ornith-1.5-9B-abliterated`, que a su vez es una versión abliterated de Ornith-1.5-9B: la abliteración elimina direcciones de activación asociadas al rechazo, de modo que el modelo deja de negarse a responder ante ciertas peticiones.

Sobre esa base, el autor aplica "la receta de Cyber-Tiel-Coder", un proceso de ajuste o mezcla cuyos detalles no se documentan en la model card. La cuantización GGUF emplea una matriz de importancia (imatrix) calibrada con los datos v6 de bartowski, renderizados a través de la plantilla de chat del propio modelo, lo que mejora la fidelidad de la cuantización respecto a una calibración genérica. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en formato conversacional, con plantilla de chat propia basada en Qwen-Sharp-Chat-Templates v22.5.0.
- Respuestas sin censura: la abliteración suprime los mecanismos de rechazo del modelo original.
- Identidad configurada como "Vael" mediante la línea de identidad de la plantilla.
- Capacidad de razonamiento y código: no documentada explícitamente, pero plausible por herencia de la familia Qwen; no verificada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (los idiomas no se declaran en los metadatos).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, narrativa o guiones donde el modelo base censurado rechazaría ciertos temas; la abliteración permite abordar contenido adulto o controvertido dentro de los límites legales.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU de datacenter, útil para prototipado offline y entornos con requisitos de privacidad.
- Asistente personal de código: si hereda las capacidades de Qwen, puede emplearse para autocompletado y explicación de fragmentos; conviene validar su rendimiento real antes de integrarlo en un pipeline.
- Investigación sobre alineación y abliteración: sirve como caso de estudio para analizar cómo la supresión de direcciones de rechazo afecta al comportamiento del modelo y a su tasa de respuestas dañinas.
- Generación de datos sintéticos para ajuste fino: puede producir corpus diversos en dominios donde los modelos censurados son restrictivos, con revisión humana posterior.
- Chat conversacional multi-turno en aplicaciones de rol: la plantilla de chat propia y la identidad "Vael" están pensadas para personajes consistentes en interacciones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5-6 GB en cuantización Q4_K_M, 7-8 GB en Q5_K_M y 9-10 GB en Q8_0 (estimaciones para 9B; los niveles concretos publicados no están disponibles).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 si se requiere throughput elevado en servidor.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM usando cuantizaciones Q4 o Q5; en 6 GB solo con cuantizaciones muy agresivas (Q2/Q3) o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vael-9B | ~9B | No disponible | MIT | GGUF | Abliterated, imatrix, identidad "Vael" |
| huihui-ai/Huihui-Ornith-1.5-9B-abliterated | ~9B | No disponible | No disponible | No disponible | Modelo base directo; sin receta adicional |
| Ornith-1.5-9B | ~9B | No disponible | No disponible | No disponible | Modelo original antes de abliterar |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Alternativa alineada de tamaño similar, con benchmarks públicos |

La comparación con Qwen2.5-7B-Instruct es orientativa por tamaño y familia; no se dispone de datos que permitan comparar rendimiento real entre ambos.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo: el modelo puede generar contenido dañino, ofensivo o ilegal sin filtro, lo que exige moderación externa en producción.
- Riesgo elevado de alucinación: no hay benchmarks ni evaluación publicada que permita acotar su fiabilidad factual.
- Sin datos sobre sesgos: no se documenta la composición del dataset ni evaluaciones de sesgo.
- Idiomas y contexto no declarados: no es posible planificar aplicaciones multilingües ni de contexto largo con garantías.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el contenido generado.
- Procedencia poco documentada: la receta de ajuste no se describe y el modelo tiene cero descargas y cero likes, por lo que no existe validación comunitaria.
- La plantilla de chat modificada (identidad "Vael") puede afectar al comportamiento en comparación con el modelo base; conviene usar exactamente la plantilla publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jorge-erdb/Vael-9B
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia original: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Plantilla de chat: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Datos de calibración imatrix de bartowski: https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a

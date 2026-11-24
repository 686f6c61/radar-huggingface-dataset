# jorge-erdb/Vael-9B

## Resumen
Vael-9B es una cuantización GGUF publicada por el usuario jorge-erdb a partir de los pesos de huihui-ai/Huihui-Ornith-1.5-9B-abliterated, un modelo de 8.953.803.264 parámetros (aproximadamente 9B) derivado de la familia Qwen 3.5 según las etiquetas del autor. No se trata de un modelo entrenado desde cero, sino de un empaquetado de cuantizaciones con calibración imatrix y una plantilla de chat modificada (Qwen-Sharp-Chat-Templates v22.5.0) en la que la línea de identidad se ha cambiado a "Vael".

El modelo hereda la característica "abliterated" del checkpoint base: se ha eliminado el comportamiento de rechazo, de modo que responde a peticiones que el modelo original declinaría. Esto lo sitúa en el segmento de modelos sin censura orientados a generación de texto conversacional, con licencia MIT y formatos listos para llama.cpp y derivados.

Su relevancia es práctica más que arquitectónica: ofrece un checkpoint de ~9B en BF16, Q8_0, Q4_K_M, IQ4_NL e imatrix, lo que permite desplegarlo desde estaciones de trabajo con GPU de consumo hasta servidores. El repo ocupa 38,6 GB y acumula 542 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, según etiquetas del autor; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M, IQ4_NL, imatrix |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el checkpoint base) |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna del modelo base más allá de la etiqueta "qwen3.5" incluida por el autor, que sugiere una familia de transformers decoder-only de Qwen. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el checkpoint original.

Lo que sí está documentado es el proceso de esta publicación: cuantización a GGUF con calibración imatrix usando los datos de calibración v6 de bartowski, renderizados a través de la plantilla de chat del propio modelo. La plantilla empleada es Qwen-Sharp-Chat-Templates v22.5.0 (Apache-2.0) con la línea de identidad sustituida por "Vael". El checkpoint base es una versión abliterated de Huihui-Ornith-1.5-9B, es decir, con las direcciones de rechazo eliminadas mediante técnicas de abliteration.

## Capacidades
- Generación de texto conversacional multi-turno mediante plantilla de chat tipo Qwen.
- Respuesta a peticiones que modelos alineados rechazarían, al haberse eliminado el comportamiento de rechazo.
- Uso como modelo base para ajuste fino o para tareas de generación creativa sin restricciones de contenido.
- Compatible con endpoints de inferencia estándar (etiqueta endpoints_compatible).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el pipeline declarado es text-generation.
- Cobertura multilingüe: no disponible.

## Casos de uso
- Generación creativa sin restricciones: el modelo puede emplearse para escritura de ficción, guiones o narrativa con temáticas que los modelos alineados suelen declinar, gracias a la eliminación del comportamiento de rechazo.
- Investigación sobre alineación y seguridad: útil como contrapunto en estudios que comparan las respuestas de un modelo abliterated frente a su versión original, midiendo el impacto de la eliminación de rechazos.
- Despliegue local en estaciones de trabajo: los ficheros Q4_K_M e IQ4_NL permiten ejecutar el modelo en GPUs de consumo mediante llama.cpp u Ollama, sin dependencia de servicios en la nube.
- Prototipado de asistentes conversacionales: la plantilla de chat tipo Qwen y el formato GGUF facilitan integrar el modelo en aplicaciones de chat con contexto multi-turno.
- Generación de datos sintéticos: puede utilizarse para producir corpus de texto diverso en pipelines de aumento de datos, con revisión posterior obligatoria por el riesgo de contenido inapropiado.
- Evaluación comparativa de cuantizaciones: al publicarse BF16, Q8_0, Q4_K_M, IQ4_NL e imatrix del mismo checkpoint, sirve para medir la degradación de calidad entre niveles de cuantización en un modelo de ~9B.
- Experimentación con plantillas de chat: la sustitución de la identidad en la plantilla permite estudiar cómo afecta la persona declarada al comportamiento del modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 18 GB en BF16, ~9,5 GB en Q8_0, ~5,5 GB en Q4_K_M e IQ4_NL (estimaciones a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas: A100 40 GB o H100 para BF16; RTX 4090 (24 GB) para BF16 justo o Q8_0 con holgura; RTX 3090/4080 para Q8_0; GPUs de 8 GB o superiores para Q4_K_M e IQ4_NL.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantizaciones Q4_K_M, IQ4_NL o Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vael-9B | ~8,95B | no disponible | MIT | GGUF | Abliterated, cuantizaciones imatrix, plantilla Qwen modificada |
| huihui-ai/Huihui-Ornith-1.5-9B-abliterated | ~9B | no disponible | no disponible | safetensors | Checkpoint base del que deriva Vael-9B |
| Ornith-1.5-9B (original) | ~9B | no disponible | no disponible | safetensors | Versión alineada, con comportamiento de rechazo |
| Qwen 3.5 9B (familia referenciada) | ~9B | no disponible | no disponible | safetensors/GGUF | Familia indicada en las etiquetas del autor; datos concretos no disponibles |

## Limitaciones y advertencias
- Modelo abliterated: se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido inexacto, ofensivo o dañino. El autor declara explícitamente que el usuario es responsable del uso y de las salidas.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, agravado por la ausencia de benchmarks publicados que permitan calibrar su fiabilidad.
- No hay información sobre sesgos demográficos, lingüísticos o culturales del checkpoint base ni de esta cuantización.
- Idiomas soportados no documentados; no se debe asumir un rendimiento multilingüe sin evaluarlo.
- Longitud de contexto no disponible; conviene verificarla empíricamente antes de usarla en producción con documentos largos.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero el modelo base y la plantilla de chat tienen sus propias condiciones (la plantilla es Apache-2.0); conviene revisar la cadena de licencias antes de un despliegue comercial.
- La plantilla de chat ha sido modificada (identidad "Vael"), lo que puede alterar el comportamiento respecto al modelo original.
- Sin garantía de ningún tipo según el propio autor; no apto para producción sin evaluación previa y filtros de seguridad externos.
- El repo ocupa 38,6 GB por incluir múltiples cuantizaciones; la descarga completa no es necesaria si solo se usa un fichero.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jorge-erdb/Vael-9B
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Plantilla de chat: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Datos de calibración imatrix de bartowski: https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a
- Licencia del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE

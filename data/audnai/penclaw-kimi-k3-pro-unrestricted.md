# audnai/penclaw-Kimi-K3-pro-unrestricted

## Resumen

`audnai/penclaw-Kimi-K3-pro-unrestricted` es un repositorio de Hugging Face publicado por el usuario `audnai` que se presenta como una versión "abliterated" (sin mecanismos de rechazo) de un supuesto modelo "Kimi K3.1 Pro". En el momento de la consulta el repositorio no contiene información técnica verificable: no declara pipeline, licencia, idiomas, arquitectura ni número de parámetros, y los metadatos indican 0 descargas y 0 likes, con creación y última actualización separadas por apenas seis minutos (23 de octubre de 2026).

La propia model card indica que "los pesos de Kimi K3.1 Pro se lanzarán el 4 de noviembre" y que, tras ese lanzamiento, se eliminarán sus barreras de seguridad. Es decir, el repositorio es un anuncio previo o placeholder, no una distribución de pesos utilizable: no hay artefactos descargables descritos y no se puede ejecutar ni evaluar el modelo a partir de esta ficha.

El interés del repositorio es, por tanto, más documental que técnico: ilustra una práctica creciente de publicación anticipada de variantes "unrestricted" de modelos de gran escala, con captación de correo electrónico como condición de acceso. Cualquier evaluación de capacidades, latencia o seguridad queda pendiente de que se publiquen pesos reales y una model card con especificaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe arquitectura; se infiere una familia tipo transformer/MoE por el nombre "Kimi", sin confirmación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para este repositorio (el autor enlaza una release GGUF de un modelo distinto, `penclaw-Kimi-K3.0-abliterated-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | no disponible (no se describen safetensors, GGUF ni ningún otro artefacto; 0 descargas registradas) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo: ni tipo de bloque (transformer denso, mezcla de expertos, híbrido SSM/attention), ni dimensión oculta, ni número de cabezas, ni estrategia de atención. Tampoco se documentan datos de entrenamiento: número de tokens, composición del corpus, mezcla multilingüe, fases de post-entrenamiento (SFT, RLHF, DPO) o uso de decodificación especulativa.

El término "abliterated" hace referencia, en la práctica habitual de la comunidad, a una modificación post-entrenamiento que elimina o atenúa direcciones de activación asociadas al rechazo de peticiones, normalmente mediante edición de pesos o intervención sobre activaciones, sin reentrenar el modelo desde cero. La model card no especifica qué técnica concreta se ha aplicado, sobre qué checkpoint se ha aplicado ni qué metodología de evaluación se ha seguido; únicamente remite a un repositorio externo del autor sobre "substantive delivery" en áreas de alto riesgo.

## Capacidades

- Generación de texto: presumible, no verificable sin pesos publicados.
- Razonamiento, código y matemáticas: no disponible; no hay benchmarks ni ejemplos en el repositorio.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se declaran idiomas.
- Capacidad declarada (no técnica): mayor "substantive delivery" en áreas de alto riesgo, es decir, menor tasa de rechazo ante peticiones que los modelos alineados suelen declinar. Es una afirmación de marketing del autor, no una capacidad medida de forma independiente.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

Los siguientes escenarios son hipotéticos y solo serían aplicables si el autor publica pesos reales con las características que anuncia; no se pueden validar con la información actual.

- Investigación sobre alineación y Robustez: uso del modelo como sujeto de estudio para medir tasas de rechazo y compararlas con la versión alineada del mismo checkpoint, apoyándose en el benchmark de rechazo que enlaza el autor.
- Red teaming y evaluación de seguridad: generación controlada de contenido que los modelos alineados rechazan, dentro de un entorno auditado, para calibrar clasificadores y filtros de producción.
- Pruebas de regresión de guardrails: integrar la variante "unrestricted" en un pipeline de evaluación que verifique que los filtros de una aplicación siguen bloqueando categorías prohibidas aunque el modelo subyacente no lo haga.
- Estudio de sesgos y toxicidad: análisis comparativo de la distribución de respuestas antes y después de la abliteración sobre un mismo conjunto de prompts.
- Docencia y divulgación técnica: ejemplificar de forma tangible qué cambia (y qué no) al eliminar mecanismos de rechazo, con fines explicativos.
- Sustitución en flujos creativos con contenido sensible: escritura de ficción con violencia o temas delicados, donde el rechazo del modelo base interrumpe la tarea; requeriría revisión humana posterior.
- No se recomienda su uso en atención al cliente, código en producción, entornos sanitarios, jurídicos o financieros, ni en ningún despliegue orientado al usuario final sin una capa de moderación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye MMLU, HumanEval, GSM8K, MATH, MMLU-Pro ni métricas de latencia o throughput. El único enlace de evaluación apunta a un benchmark propio del autor centrado en tasas de rechazo (`refusal-benchmark`), que mide comportamiento de negativa, no capacidad de razonamiento o conocimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; sin número de parámetros ni longitud de contexto no es posible calcularla.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible. Si el modelo final corresponde a la escala habitual de la familia Kimi (variantes MoE de gran tamaño), no cabría en una sola GPU de consumo; esta afirmación es una condición, no un dato del repositorio.
- Opciones de despliegue: no disponible para este repositorio. El autor enlaza una release GGUF de otro modelo (`penclaw-Kimi-K3.0-abliterated-GGUF`), lo que sugiere que en el pasado usó llama.cpp/Ollama, pero no hay artefacto equivalente para este.
- Latencia y throughput: no disponible.

Tabla de referencia genérica (no específica de este modelo, útil solo hasta que se publique el tamaño real):

| Escala del modelo | VRAM aproximada en FP16 | VRAM aproximada en 4 bits | Cabe en GPU de consumo |
|---|---|---|---|
| 7-8B | 14-16 GB | 5-6 GB | Sí (RTX 3060 12 GB en adelante) |
| 13-14B | 26-28 GB | 9-10 GB | Sí con cuantización agresiva |
| 30-34B | 60-68 GB | 20-22 GB | Solo en 24 GB con cuantización y contexto corto |
| 70B | ~140 GB | 40-45 GB | No en una sola GPU de consumo |
| MoE >200B totales | >400 GB | >100 GB | No |

## Comparativa con modelos similares

Los datos de las alternativas provienen de documentación pública de sus fabricantes y no han sido verificados en esta ficha; se incluyen solo como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| `audnai/penclaw-Kimi-K3-pro-unrestricted` | no disponible | no disponible | no disponible | No (anuncio previo) | Sin benchmarks ni artefactos |
| Kimi K2 (Moonshot AI) | ~1T totales, ~32B activos | hasta 256K | MIT modificada | Sí, en Hugging Face | Modelo abierto de referencia de la familia Kimi; verificar cifras |
| Qwen3-235B-A22B (Alibaba) | 235B totales, 22B activos | hasta ~262K | Apache 2.0 | Sí | MoE abierto con licencia permisiva, alternativa realista para despliegue |
| `audnai/penclaw-GLM-5.3-abliterated` | no disponible | no disponible | no disponible | Según el autor, publicado | Variante "unrestricted" del mismo autor; sin datos técnicos en la información disponible |

No es posible establecer una comparación cuantitativa con este repositorio porque carece de parámetros, contexto, benchmarks y licencia declarados.

## Limitaciones y advertencias

- Ausencia total de especificaciones: sin parámetros, contexto, tokenizador ni arquitectura, el modelo no se puede evaluar ni presupuestar para producción.
- Pesos no publicados: la model card afirma que el lanzamiento será el 4 de noviembre; hasta entonces el repositorio no es utilizable.
- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, y la situación legal de los pesos derivados es ambigua.
- Eliminación deliberada de barreras de seguridad: un modelo "abliterated"/"unrestricted" carece de mecanismos de rechazo, lo que lo hace inadecuado para exposición directa a usuarios y exige moderación externa obligatoria.
- Riesgo elevado de uso indebido: la combinación de modelos sin alineación y distribución abierta facilita la generación de contenido dañino; conviene restringir el acceso y registrar el uso.
- Riesgo de alucinación: no cuantificado; no hay evaluación de factualidad ni de calibración.
- Sesgos: no documentados; la abliteración puede alterar la distribución de respuestas en temas sensibles y agravar sesgos existentes.
- Posible uso indebido de marcas: el repositorio emplea el nombre "Kimi", asociado a Moonshot AI, sin que se aclare la relación con el fabricante original; esto puede generar confusión sobre procedencia y soporte.
- Captación de datos personales: aceptar el acceso implica recibir correos del autor sobre lanzamientos y acceso a inferencia, con baja posterior, según la propia model card. Es un condicionante comercial, no técnico.
- Señales de baja madurez: 0 descargas, 0 likes y actualización seis minutos después de la creación sugieren un repositorio de anuncio, no un artefacto mantenido.
- Idiomas y contexto desconocidos: no se puede garantizar calidad en castellano ni en conversaciones de contexto largo.
- Sin soporte ni mantenimiento declarados: no hay issues, documentación de despliegue ni versionado de pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/audnai/penclaw-Kimi-K3-pro-unrestricted
- Benchmark de rechazo del autor: https://github.com/audn-ai/refusal-benchmark
- Release previa del autor (GLM 5.3 abliterated): https://huggingface.co/audnai/penclaw-GLM-5.3-abliterated
- Release previa del autor (Kimi K3.0 abliterated, GGUF): https://huggingface.co/audnai/penclaw-Kimi-K3.0-abliterated-GGUF

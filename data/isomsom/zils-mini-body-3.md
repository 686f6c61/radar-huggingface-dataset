# isomsom/zils-mini-body-3

## Resumen

Zils d3-mini soup body es un ajuste fino (fine-tune) de decisión construido sobre el modelo Zils d3-mini (z3-mini), una variante de 4,5B parámetros derivada de la familia Qwen3.5-4B. Lo desarrolla el usuario isomsom y se publica bajo licencia Apache 2.0. El modelo parte de la media uniforme de dos "soup bodies" previos de d3-mini y aplica cuatro ejecuciones LoRA entrenadas para producir distribuciones de probabilidad sobre opciones de decisión, no para generación de texto libre. Su pipeline declarado en Hugging Face es `feature-extraction`, lo que refleja que su uso previsto es la extracción de representaciones y la puntuación de opciones.

La relevancia del modelo es acotada y muy específica: se trata de un componente experimental dentro de una familia de modelos aparentemente orientada a la toma de decisiones binarias o multiclase (aceptar/rechazar, fusionar/abandonar, respuesta aceptada o no). No es un modelo conversacional ni un asistente general, y su model card no documenta capacidades de generación, tool calling ni agentes. Con 4.539.265.536 parámetros reales según los pesos safetensors, un repositorio de 9,1 GB y pesos en BF16, el modelo está pensado para ser ejecutado en infraestructura moderada, pero su valor práctico depende de comprender el formato de "caso de examen" de la familia Zils.

La información pública disponible es muy limitada: cero descargas, cero likes, sin idiomas declarados y sin benchmarks publicados. Esta ficha se limita a lo que la model card y los metadatos de Hugging Face permiten afirmar, y marca explícitamente como "no disponible" todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5-4B (según modelo base); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only heredado de Qwen3.5-4B, con una torre de visión procedente del primer modelo base (familia Qwen3.5-4B) que se mantiene sin cambios. El cuerpo de lenguaje no se entrena desde cero: se construye como la media uniforme de dos soup bodies de d3-mini, `qhoenix/zils-mini-decision-l13_avg678` (revisión `091c6ebe6b727787795fb76892af0114b124641c`) y `joamCriff123/zils-mini-sx3` (revisión `c9432adae2be241b1516934a723591ab917bb039`), ambos Apache 2.0.

Sobre esa media se ejecutan cuatro entrenamientos LoRA con rango 32, alpha 64 y los módulos objetivo oficiales de d3, entrenados a través del readout de código d3-mini congelado, con semillas 0 a 3. Cada ejecución usa entropía cruzada suave sobre probabilidades de opción, AdamW con lr 8e-5 y schedule lineal, y entre 360 y 445 pasos de optimizador con 4 ejemplos por paso. Los datos son ítems en formato de caso de examen Zils con objetivos suaves: decisiones públicas resueltas (borradores de Wikipedia Articles-for-Creation aceptados o rechazados, revisiones de código Gerrit de AOSP, OpenStack y Wikimedia fusionadas o abandonadas, todo resuelto antes del 2026-10-14, con near-duplicates eliminados y clases balanceadas, objetivos suavizados a 0,85/0,15), filas ancla de los splits de entrenamiento de las familias de examen públicas con la distribución de respuesta del propio soup mezclada al 15% con la respuesta gold, y en dos de las cuatro ejecuciones unas 250 preguntas de Stack Exchange por ejecución (25 sitios) con la respuesta aceptada como objetivo. La fusión final promedia los cuatro deltas LoRA (alpha/r · B@A) y suma 1,25 × ese delta medio a la media del soup, almacenado en BF16.

## Capacidades

- Puntuación de decisiones: el modelo está entrenado para producir distribuciones de probabilidad sobre opciones discretas en el formato de caso de examen Zils (por ejemplo, aceptar o rechazar, fusionar o abandonar).
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que puede emplearse para obtener representaciones del texto de entrada.
- Procesamiento multimodal limitado: incluye la torre de visión del modelo base Qwen3.5-4B, aunque la model card no documenta tareas de visión específicas ni su evaluación.
- Estabilidad de familias de examen: las filas ancla buscan preservar el comportamiento en las familias de preguntas conocidas.
- Generación de texto libre: no documentada; el entrenamiento se orienta a readout de decisión, no a decodificación generativa.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Moderación de borradores en wikis: el modelo puede puntuar si un borrador de artículo (Articles-for-Creation) debe aceptarse o rechazarse, entrenado con decisiones reales de Wikipedia; es adecuado porque su objetivo de entrenamiento es exactamente esa distribución binaria.
- Triaje de revisiones de código: puede asignar probabilidad de fusión o abandono a cambios de Gerrit en proyectos como AOSP, OpenStack o Wikimedia, integrándose como señal previa a la revisión humana.
- Priorización de preguntas en foros técnicos: con las ejecuciones entrenadas sobre Stack Exchange, puede estimar la probabilidad de que una pregunta reciba respuesta aceptada y usarse para enrutar o destacar contenido.
- Investigación sobre calibración de decisiones: al exponer probabilidades suaves (objetivos 0,85/0,15), sirve como banco de pruebas para estudiar calibración y sesgos en clasificadores de decisión derivados de LLM.
- Extracción de embeddings para clustering: mediante el pipeline `feature-extraction`, puede generar representaciones de textos de decisión para agrupar casos similares o detectar near-duplicates.
- Evaluación comparativa de soups y LoRA: su construcción documentada (media de soups + delta LoRA promediado) lo convierte en un punto de referencia reproducible para experimentos de merging de pesos.
- Filtrado previo en pipelines de datos: puede puntuar grandes lotes de candidatos (borradores, parches, preguntas) antes de un análisis más costoso con modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y contexto; en la práctica, 12-16 GB de VRAM para secuencias cortas.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors. En 8 bits, los pesos ocuparían unos 4,5 GB; en 4 bits, unos 2,3 GB.
- GPU recomendadas: A100 40 GB, H100 o L40S para despliegues por lotes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 sin problemas de espacio.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), vLLM o TGI para servir a escala si el código personalizado es compatible; llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isomsom/zils-mini-body-3 | 4,54B | No disponible | Puntuación de decisiones / feature extraction | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | No disponible en esta ficha | Generación general, multimodal | No disponible en esta ficha | Hugging Face |
| qhoenix/zils-mini-decision-l13_avg678 | No disponible | No disponible | Decisión (soup body) | Apache 2.0 | Hugging Face |
| joamCriff123/zils-mini-sx3 | No disponible | No disponible | Decisión (soup body) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, licencia y propósito declarado.

## Limitaciones y advertencias

- Modelo experimental sin tracción: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- Sin benchmarks: no se han publicado métricas de precisión, calibración ni robustez, por lo que no se puede afirmar su calidad relativa frente a alternativas.
- Riesgo de alucinación y sobreajuste: al entrenarse con objetivos suaves y filas ancla, puede reproducir sesgos de las distribuciones de entrenamiento (decisiones de Wikipedia, Gerrit y Stack Exchange) y fallar en dominios fuera de esas familias.
- Sesgos de datos: las decisiones de AOSP, OpenStack, Wikimedia y Stack Exchange reflejan las políticas y sesgos de esas comunidades; el modelo puede heredarlos.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe; el entrenamiento documentado parece centrado en contenido en inglés.
- Longitud de contexto no documentada: no se puede planificar su uso con entradas largas sin verificación empírica.
- Uso comercial: la licencia Apache 2.0 lo permite, pero las licencias y avisos de los modelos base deben conservarse según indica la model card.
- Código personalizado: la etiqueta `custom_code` implica que la carga requiere `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar código de un autor con escasa reputación.
- Formato de entrada restringido: está diseñado para el formato de caso de examen Zils; usarlo fuera de ese formato puede producir resultados sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isomsom/zils-mini-body-3
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678/tree/091c6ebe6b727787795fb76892af0114b124641c
- Modelo base 2: https://huggingface.co/joamCriff123/zils-mini-sx3/tree/c9432adae2be241b1516934a723591ab917bb039
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B

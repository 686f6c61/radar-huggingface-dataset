# EmergenceMachines/psi-agent-trust-r44-why-the-document-outranks

## Resumen

psi-agent-trust-r44-why-the-document-outranks es un artefacto de investigación publicado por EmergenceMachines, no un modelo de propósito general. Se trata de un kit de replicación asociado a la ronda 44 de una serie de experimentos sobre jerarquías de confianza en modelos de lenguaje, construido sobre el modelo base Qwen/Qwen3.5-0.8B. El repositorio no contiene pesos entrenados por el autor: su función es documentar y permitir reproducir un experimento de laboratorio de contexto en el que se mide a qué fuente da prioridad el modelo cuando un usuario y un documento aportan valores contradictorios.

El experimento compara cuatro marcos de presentación (etiquetado, sin etiqueta, nota citada e intercambio de valores) y dos órdenes de aparición (usuario primero o documento primero), con 96 respuestas generadas en decodificación greedy. El hallazgo principal es que la última posición gana en 63 de 96 casos, y que la ventaja del documento depende en parte de su etiqueta, en parte de su formato pegado y en parte del valor concreto. Es relevante para quienes investigan sesgos de recencia, conflicto de conocimiento y fiabilidad de fuentes en agentes.

La ficha describe un repositorio de investigación con licencia Apache 2.0, etiquetado con la librería `parameter-space-inspector` y sin descargas ni interacciones en el momento de la consulta. No debe confundirse con un checkpoint afinado listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no describe la arquitectura del modelo base; el artefacto es un kit de replicación de experimentos) |
| Parámetros totales | no disponible para el artefacto; el modelo base es Qwen/Qwen3.5-0.8B (0,8B según su denominación) |
| Parámetros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el modelo base se ejecuta en formato GGUF según las instrucciones de replicación); no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | el artefacto no incluye pesos propios; el modelo base se usa en GGUF. No se especifican safetensors ni otros formatos |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de Qwen3.5-0.8B ni su proceso de entrenamiento; la model card se centra exclusivamente en el diseño experimental. El artefacto consiste en un conjunto de scripts (`items41.py`, `items43.py`, `items44.py`, `score43.py`, `r44.py`, `mcp.py`), un pre-registro (`prereg.md` con hash `prereg.sha256`), resultados (`results.md`), datos crudos (`data/raw.jsonl`, `data/summary.json`, `data/run44.log`, `data/transcript.jsonl`) y un kit de replicación ejecutable mediante el Parameter Space Inspector (PSI) 0.5.0 o superior con el servidor de agentes.

El experimento se ejecuta en el Context lab del PSI sobre Qwen3.5-0.8B con decodificación greedy. Se generan 96 respuestas (96 piezas cada una) a partir de cuatro marcos: etiquetado, sin corchetes, la afirmación del usuario como nota citada y los valores intercambiados entre marcos. El diseño es pre-registrado y las hipótesis se evalúan como acierto/fallo por pares. El propio autor advierte que los valores del documento se escribieron como el elemento discordante, por lo que valor y fuente no quedan completamente separados. No se menciona RLHF, DPO ni composición de dataset de entrenamiento.

## Capacidades

- Generación de texto y respuesta a preguntas en el contexto de un experimento controlado de conflicto de conocimiento.
- Medición de sesgo de recencia: el modelo tiende a favorecer la información que aparece en última posición (63 de 96 casos).
- Medición de jerarquía de fuentes: documento por encima de herramienta y de usuario en la ronda 43 previa, y documento frente a usuario en esta ronda.
- Sensibilidad al formato: la etiqueta del documento y su presentación como texto pegado influyen en la preferencia del modelo.
- Sensibilidad al valor concreto: al intercambiar valores, parte de la ventaja del documento se traslada al usuario.
- Replicabilidad: scripts, pre-registro, datos crudos y registro de ejecución permiten repetir el experimento con decodificación greedy.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio, modo thinking ni multilingüismo para este artefacto.

## Casos de uso

- Replicación de experimentos de confianza en fuentes: un investigador descarga el repositorio, instala PSI 0.5.0 o superior, coloca los scripts en las rutas indicadas (`../r41/`, `../r43/`) y ejecuta `r44.py run` y `r44.py score` para reproducir las 96 respuestas y compararlas con `results.md`.
- Auditoría de sesgo de recencia en asistentes: el marco experimental sirve para comprobar si un modelo pequeño prioriza la última afirmación recibida, útil antes de desplegar agentes que reciben documentos y mensajes de usuario en el mismo contexto.
- Diseño de prompts para sistemas RAG: los resultados sobre etiqueta, formato pegado y posición permiten decidir cómo presentar documentos recuperados frente a afirmaciones del usuario para reducir conflictos no deseados.
- Evaluación de conflicto de conocimiento en modelos pequeños: el kit ofrece un protocolo pre-registrado y puntuación por pares que puede adaptarse a otros modelos base para comparar su comportamiento.
- Formación y docencia en evaluación de LLM: el repositorio incluye pre-registro, datos crudos y revisión manual de respuestas, lo que lo convierte en material didáctico sobre metodología experimental reproducible.
- Investigación sobre fiabilidad de agentes: los hallazgos sobre qué fuente prevalece informan el diseño de políticas de resolución de conflictos en agentes que combinan entradas de usuario, herramientas y documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos son los del experimento de conflicto de conocimiento:

| Marco | Usuario primero, documento último: usuario / documento / ninguno | Documento primero, usuario último: usuario / documento / ninguno |
|---|---|---|
| Etiquetado | 1 / 11 / 0 | 3 / 6 / 3 |
| Sin etiqueta | 1 / 10 / 1 | 5 / 4 / 3 |
| Nota citada | 0 / 11 / 1 | 7 / 4 / 1 |
| Valores intercambiados | 1 / 9 / 2 | 7 / 2 / 3 |

El total de victorias en última posición es de 63 sobre 96. Las tres hipótesis se calificaron como fallo por pares y acierto en el control. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo base Qwen3.5-0.8B en GGUF cabe en GPU de consumo; con 0,8B parámetros, la VRAM necesaria es de aproximadamente 1-2 GB según la cuantización, aunque el autor no publica cifras exactas.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) es suficiente para el modelo base.
- Despliegue: Parameter Space Inspector (PSI) 0.5.0 o superior con el servidor de agentes y Qwen3.5-0.8B en GGUF como modelo local. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El artefacto es un kit de replicación de un experimento concreto, no un modelo comparable por parámetros o tarea con otros checkpoints. La única referencia es su modelo base, Qwen/Qwen3.5-0.8B, del que no se aportan datos comparativos en la información disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados; es un conjunto de scripts, datos y documentación. No debe tratarse como un modelo listo para producción.
- El propio autor señala que el experimento no puede determinar qué valores tienen peso propio (los valores no se rotaron entre fuentes), no cubre documentos autocontradictorios ni modelos de mayor tamaño.
- Los valores del documento se escribieron como el elemento discordante, de modo que valor y fuente no quedan completamente separados; los resultados lo reconocen explícitamente.
- La copia pública está limpiada: las etiquetas internas de la model card, `prereg.md` y `results.md` se sustituyeron por términos neutros, por lo que `prereg.md` ya no coincide con `prereg.sha256`. Las notas de discusión interna no se incluyen.
- El pre-registro original no es verificable contra el hash publicado en esta copia.
- El experimento se limita a 96 respuestas con decodificación greedy sobre un modelo de 0,8B; la generalización a otros modelos, temperaturas o contextos más largos no está demostrada.
- No se documentan sesgos conocidos del modelo base, riesgos de alucinación específicos, limitaciones de idioma ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales de atribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EmergenceMachines/psi-agent-trust-r44-why-the-document-outranks
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ronda 43 del mismo proyecto: https://huggingface.co/EmergenceMachines/psi-agent-trust-r43-three-sources-in-every-order
- Resultado de búsqueda web sin relación con el modelo (Accessibility.com): https://www.accessibility.com/

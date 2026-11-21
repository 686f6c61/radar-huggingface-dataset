# eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 es un modelo especializado derivado de Qwen/Qwen3-1.7B, publicado por el usuario eduardoworrel. Se trata de un ajuste fino orientado a tres tareas de clasificación y razonamiento sobre texto: la detección de implicación en contratos (ContractNLI), la clasificación de intenciones en diálogo (CLINC150) y la clasificación de temas multilingüe (SIB-200). El modelo incorpora cabezas de decisión específicas para cada tarea, además de conservar la capacidad generativa del modelo base.

La distribución se realiza en formato ONNX cuantizado a int4, empaquetada específicamente para su uso con Transformers.js y WebGPU en el navegador, así como con ONNX Runtime GenAI en entornos de servidor. El repositorio incluye manifiestos separados para cada tarea y para cada idioma soportado (inglés y portugués), junto con prompts predefinidos que deben respetarse para obtener el comportamiento esperado.

Su relevancia radica en que permite ejecutar un modelo de 1.700 millones de parámetros con clasificación estructurada directamente en el navegador, sin necesidad de infraestructura de servidor, manteniendo paridad numérica con la versión de referencia en ONNX Runtime GenAI. La licencia es CC BY-SA 4.0, condicionada por el uso de SIB-200 en los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabezas de decisión adicionales |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX) |
| Idiomas soportados | inglés (en), portugués (pt) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (model_q4.onnx), cabezas en heads/, manifiestos JSON |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. Sobre esta base se han añadido cabezas de clasificación específicas para tres tareas: ContractNLI (implicación, contradicción o no mención en contratos), CLINC150 (clasificación de intenciones en diálogo) y SIB-200 (clasificación de temas en inglés y portugués). Las cabezas se aplican sobre los estados ocultos en posiciones de lectura concretas definidas por el framework s1s2, y sus salidas se normalizan mediante softmax para producir decisiones con probabilidad y margen asociados.

El entrenamiento combina los tres conjuntos de datos citados: ContractNLI (CC BY 4.0), CLINC150 (CC BY 3.0) y SIB-200 (CC BY-SA 4.0). No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica principal reside en el empaquetado: la versión Transformers.js replica byte a byte los pesos int4 de la build de referencia en ONNX Runtime GenAI, con modificaciones de grafo para adaptarse al entorno del navegador (dimensión de cabeza del KV cache fijada, lectura de filas de la tabla int4 con operadores ONNX estándar en lugar de GatherBlockQuantized, y división de lm_head en cinco partes para ajustarse al límite de memoria wasm32).

## Capacidades

- Generación de texto libre heredada del modelo base Qwen3-1.7B.
- Clasificación de implicación en contratos (ContractNLI): tres opciones (Entailment, Contradiction, Not mentioned).
- Clasificación de intenciones en diálogo (CLINC150).
- Clasificación de temas multilingüe (SIB-200) en inglés y portugués.
- Salida estructurada con opción elegida, probabilidad y margen de confianza.
- Generación de explicaciones sobre la decisión tomada, reutilizando los mismos pesos.
- Ejecución en navegador mediante WebGPU y CPU (WASM) con Transformers.js.
- Compatibilidad con el framework s1s2 para orquestación de decisiones y preguntas múltiples.

## Casos de uso

- Revisión automatizada de contratos: el modelo evalúa si un contrato implica, contradice o no menciona una hipótesis concreta, devolviendo una probabilidad y un margen que permiten priorizar la revisión humana en los casos de baja confianza.
- Clasificación de intenciones en asistentes conversacionales: con CLINC150 se pueden etiquetar las consultas de usuario en dominios predefinidos, integrándose en un pipeline de enrutamiento hacia el servicio adecuado.
- Moderación y triaje de tickets con margen de confianza: el campo margin permite derivar automáticamente a revisión manual los casos ambiguos, y la función generate produce una justificación textual breve.
- Clasificación temática de contenidos en inglés y portugués: útil para etiquetar artículos, reseñas o mensajes en una aplicación web sin backend dedicado, gracias a la ejecución en el navegador.
- Aplicaciones web sin servidor con privacidad de datos: al ejecutarse íntegramente en el cliente vía Transformers.js y WebGPU, los textos sensibles (contratos, consultas) no abandonan el dispositivo del usuario.
- Prototipado rápido de clasificadores especializados: los manifiestos JSON permiten cambiar de tarea o idioma sin recargar pesos, facilitando la evaluación comparativa en fases de diseño.
- Extracción de señales en pipelines de cumplimiento normativo: la detección de cláusulas de confidencialidad o destrucción de información en contratos puede alimentar sistemas de auditoría con umbrales configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta métricas de paridad técnica entre la build de Transformers.js y la de ONNX Runtime GenAI: con 20 prompts de comprobación en Node CPU, la diferencia máxima en estados ocultos y en probabilidades de cabeza es 0, y las decisiones coinciden en 20 de 20 casos. En Chrome 157 con WebGPU sobre Apple M2 Pro, la coincidencia es de 10 de 10 con una diferencia máxima de probabilidad de 0,0026. También se indica que `pipeline("decision")` de Transformers.js, que lee logits de etiquetas en lugar de la cabeza entrenada, coincide con esta en 16 de 20 prompts, por lo que se recomienda usar s1s2.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,0 GB, lo que da una idea del tamaño en disco de los pesos int4.
- Ejecución en navegador: WebGPU con 0,27 s por decisión y 0,6 GB de memoria de página (sin contar buffers de GPU) en Chrome 157 sobre Apple M2 Pro.
- Ejecución en CPU del navegador (WASM): 3,6 s por decisión, 1,9 GB de memoria de página y pico de pestaña de 4,2 GB durante la carga.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; el modelo está pensado para ejecutarse en el navegador del cliente.
- Opciones de despliegue: Transformers.js (con s1s2 o con el pipeline `decision` en borrador), ONNX Runtime GenAI (build de referencia en el repositorio hermano), Node con onnxruntime-node 1.30.0 y transformers.js 4.3.1.
- Latencia y throughput: los valores de latencia anteriores son por decisión individual; no se proporcionan datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 | 1,7B | no disponible | ONNX int4 | CC BY-SA 4.0 | Especialista en clasificación con cabezas dedicadas, ejecución en navegador |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | safetensors | Apache 2.0 | Modelo generativo generalista |
| Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 1,7B | no disponible | ONNX int4 (GenAI) | CC BY-SA 4.0 | Misma especialización, build de referencia para servidor |

La comparativa con otros especialistas de clasificación de terceros no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las cabezas de decisión son archivos separados en `heads/` y solo las aplica s1s2; Transformers.js por sí solo no las lee.
- El pipeline `decision` de Transformers.js (en borrador, PR #1943) no usa la cabeza entrenada y discrepa en 4 de 20 prompts de comprobación.
- Es obligatorio usar las palabras de opción y la formulación de pregunta de cada manifiesto, ya que la cabeza fue entrenada con ellas.
- El modelo solo soporta inglés y portugués; no hay soporte declarado para castellano ni otros idiomas.
- La licencia CC BY-SA 4.0 impone obligaciones de atribución y compartición bajo la misma licencia, derivadas del uso de SIB-200 en el entrenamiento.
- Los prompts de paridad son una comprobación interna del autor, no un conjunto de test independiente; no hay benchmarks públicos de precisión por tarea.
- Riesgo de alucinación en la generación libre heredado del modelo base; las decisiones de clasificación deben validarse con el margen de confianza y, si es bajo, derivarse a revisión.
- No se documentan sesgos específicos del ajuste fino ni la composición detallada del dataset de entrenamiento.
- El rendimiento en CPU del navegador (3,6 s por decisión, pico de 4,2 GB) puede ser limitante en dispositivos con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Build de referencia en ONNX Runtime GenAI: https://huggingface.co/eduardoworrel/Qwen3-1.7B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Código de decisión en s1s2: https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- Pull request de Transformers.js para pipeline decision: https://github.com/huggingface/transformers.js/pull/1943
- Paper referenciado (arXiv:2611.15302): https://arxiv.org/abs/2611.15302

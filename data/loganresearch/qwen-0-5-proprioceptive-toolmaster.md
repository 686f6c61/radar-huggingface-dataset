# LoganResearch/Qwen-0.5-Proprioceptive-ToolMaster

## Resumen

Qwen-0.5-Proprioceptive-ToolMaster es un sistema experimental de investigación publicado por LoganResearch (Proprioceptive AI) sobre el modelo base Qwen2.5-0.5B-Instruct. No es un modelo nuevo entrenado desde cero, sino un ensamblaje de componentes alrededor del backbone de 0,5 mil millones de parámetros: un controlador residual de 9.185 parámetros insertado en el bloque 16 del transformer, un predictor de ganancia congelado, un lector semántico de siguiente herramienta entrenado sobre 368 estados de flujo de trabajo y un adaptador de cabeza de salida de rango 4 entrenado sobre *The Will to Power*.

El objetivo declarado es explorar la "agencia" en modelos pequeños mediante lo que el autor denomina propriocepción: medir el estado interno de activaciones del modelo y usar esa información para modificar el cómputo y seleccionar acciones dentro de un runtime local de herramientas (lectura/escritura de ficheros y un buzón de correo simulado). El paquete incluye el backbone en formato Transformers estándar, los componentes auxiliares y un script `toolmaster.py` que orquesta el agente completo.

Es relevante ahora únicamente como plataforma de investigación reproducible: los resultados medidos son modestos (2 de 4 flujos de trabajo completados con el lector semántico frente a 0 de 4 sin él) y el propio autor lo etiqueta como "experimental" y "snapshot de desarrollo preservado". No debe confundirse con un modelo listo para producción ni con una mejora general del backbone Qwen2.5-0.5B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con controlador residual nativo en el bloque 16 y lector semántico externo |
| Parámetros totales | 0,5B en el backbone; 9.185 en el controlador residual; adaptador de cabeza de salida de rango 4 (recuento no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-0.5B-Instruct, valor no confirmado en la información proporcionada) |
| Tipos de cuantización | No disponible (el autor reporta ejecución en FP32 sobre RTX 3060) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors / Transformers (formato estándar de la librería `transformers`) |

## Arquitectura y entrenamiento

El backbone es Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. Sobre él se añaden tres piezas: (1) un controlador residual de 9.185 parámetros en el bloque 16 (indexación desde cero) que modifica las activaciones residuales nativas; (2) un selector de ganancia congelado que condiciona el controlador al estado relacional del bloque 16; y (3) un lector semántico de siguiente herramienta ajustado sobre 368 estados de flujo de trabajo, que combina características del estado oculto final con un registro explícito de observaciones locales a la tarea. La generación de argumentos la realiza el backbone y el runtime valida el esquema antes de ejecutar acciones permitidas.

El adaptador de cabeza de salida es independiente y no está fusionado con el backbone: rango 4, entrenado sobre *The Will to Power* con 259.769 objetivos causales de siguiente token, una pasada y 319 pasos de optimizador. El lector semántico se ajustó sobre los 368 estados mencionados. No se documentan en la información disponible el volumen total de tokens de entrenamiento del backbone, la composición del dataset ni si hubo RLHF o DPO en esta fase; el backbone hereda el entrenamiento original de Qwen2.5-0.5B-Instruct. La innovación técnica declarada es la separación explícita entre leer el estado interno, modificar el cómputo y completar un flujo de trabajo, medidas de forma independiente.

## Capacidades

- Generación de texto en inglés sobre el backbone Qwen2.5-0.5B-Instruct.
- Lectura de estado interno: el lector semántico consume activaciones del modelo congelado y un registro de observaciones para elegir la siguiente herramienta.
- Control residual nativo: modificación de activaciones en el bloque 16 mediante un controlador de 9.185 parámetros.
- Uso de herramientas locales: lectura y escritura de ficheros dentro de un sandbox y envío a un buzón de correo simulado (outbox), con validación estricta de argumentos y protección contra efectos secundarios duplicados.
- Ejecución de flujos de trabajo de varios pasos con observaciones intermedias realimentadas al bucle del agente.
- Razonamiento básico de opción múltiple (Mini MMLU, 8/15 en zero-shot).
- No soporta visión, audio ni tool calling remoto genérico; el runtime no incluye motor de búsqueda, navegador JavaScript ni adquisición en vivo de fuentes XMB1/H3.
- El reordenamiento nativo de nombres de herramienta está desactivado por defecto porque no mejoró los flujos completados en la comparación del autor.

## Casos de uso

- Investigación sobre interpretabilidad y control de activaciones: permite medir el estado del bloque 16 e inyectar modificaciones residuales, útil para estudiar cómo el estado interno condiciona la selección de acciones en modelos pequeños.
- Evaluación de agentes de herramientas en modelos de 0,5B: sirve como banco de pruebas controlado para comparar lectores semánticos frente a soporte de runtime sin aprendizaje, con métricas de flujos completados.
- Automatización de tareas de ficheros en sandbox: lectura de códigos de acceso, escritura de resultados y verificación de contenido en un directorio aislado, aprovechando la validación de esquema y la protección contra duplicados.
- Simulación de flujos de correo: el outbox simulado permite probar pipelines de notificación sin enviar correo real, adecuado para desarrollo y tests de agentes.
- Reproducción de experimentos académicos: el paquete incluye `evaluation-summary.json`, `tested-environment.json` y el script `toolmaster.py`, lo que facilita replicar los resultados en una RTX 3060 en FP32.
- Estudio de adaptadores de cabeza de salida desacoplados: el adaptador de rango 4 no fusionado permite analizar el efecto de una cabeza literaria sobre las salidas sin alterar el backbone.
- Docencia sobre arquitecturas de agentes: la separación clara entre backbone, controlador, lector y runtime lo convierte en un ejemplo didáctico de sistema agéntico modular.

## Benchmarks y rendimiento

| Test | Resultado | Alcance |
|---|---|---|
| Cuatro flujos de trabajo de herramientas de desarrollo | 2/4 completados | Lectura correcta de fichero y un correo seguido de finalización; sin intervención del guardia de duplicados |
| Mismo runtime sin lector semántico aprendido | 0/4 completados | Mismas cuatro tareas de desarrollo |
| Seis flujos adicionales de correo | 1/6 completados | Entrega simulada de correo |
| Cinco tareas web de solo lectura en vivo con adaptador HTTP separado | 0/5 completados | Adaptador añadido sin entrenamiento específico de navegador |
| Mini MMLU | 8/15 | Zero-shot; backbone, controlador anterior y variantes del adaptador literario empataron; no es una evaluación del lector semántico |

El model-index declarado por el autor no contiene resultados adicionales (`results: []`). No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- El autor reporta ejecución en GPU con FP32 sobre una NVIDIA RTX 3060; el backbone de 0,5B en FP32 ocupa aproximadamente 2 GB de pesos, por lo que cabe holgadamente en GPUs consumer de 8 GB o más.
- VRAM estimada para inferencia: alrededor de 2-3 GB en FP32 para el backbone; el controlador (9.185 parámetros) y el adaptador de cabeza añaden una huella despreciable. No se documentan cifras para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: RTX 3060 (configuración probada), cualquier GPU consumer con al menos 8 GB; A100 y H100 son compatibles pero sobredimensionadas para este tamaño.
- Existe una ruta de ejecución en CPU, aunque el autor indica que no ha sido cualificada en rendimiento.
- Despliegue: el paquete se ejecuta con `toolmaster.py` y `transformers`; la carga estándar de Transformers solo activa el backbone, no los componentes del agente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La ejecución probada fue en FP32 sobre RTX 3060, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-0.5-Proprioceptive-ToolMaster | 0,5B + 9.185 (controlador) | No disponible | Agente con control residual y lector semántico | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | No disponible en esta ficha | Chat e instrucciones generales | No disponible en esta ficha | HuggingFace (modelo base) |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en esta ficha | Chat e instrucciones generales | No disponible en esta ficha | HuggingFace |

La comparación con alternativas de la misma categoría (agentes de herramientas sobre modelos pequeños) no está disponible en la información proporcionada. El único punto de referencia cuantitativo es el propio backbone sin el lector semántico (0/4 frente a 2/4 en los flujos de desarrollo).

## Limitaciones y advertencias

- Modelo etiquetado como experimental y snapshot de desarrollo preservado; no apto para producción.
- Resultados de agente muy limitados: 2/4 en desarrollo, 1/6 en correo y 0/5 en tareas web en vivo.
- Solo inglés; no se declara soporte multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- El runtime puede leer y escribir ficheros dentro del sandbox proporcionado; el autor recomienda revisar el código antes de ejecutarlo.
- El correo es simulado (outbox), no hay envío real; tampoco hay búsqueda web ni navegador.
- El adaptador de cabeza literario no está fusionado y se entrenó sobre un único texto (*The Will to Power*), lo que puede introducir sesgos estilísticos y de contenido en las salidas si se activa.
- Riesgo de alucinación inherente a un backbone de 0,5B; el Mini MMLU de 8/15 refleja un razonamiento limitado.
- El reordenamiento nativo de herramientas está desactivado por defecto; el lector semántico es el mecanismo principal de selección.
- Sin datos publicados sobre sesgos demográficos, toxicidad o robustez frente a prompts adversarios.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/LoganResearch/Qwen-0.5-Proprioceptive-ToolMaster
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Resultados detallados citados en la model card: `evaluation-summary.json` (incluido en el repositorio)
- Entorno de pruebas citado en la model card: `tested-environment.json` (incluido en el repositorio)
- Script de ejecución del agente: `toolmaster.py` (incluido en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.

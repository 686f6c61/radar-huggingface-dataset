# huihui-ai/Huihui-gemma-4-31B-it-abliterated

## Resumen

Huihui-gemma-4-31B-it-abliterated es una variante sin censura del modelo multimodal Google Gemma 4 31B IT, creada por el usuario huihui-ai mediante una técnica de abliteración. La abliteración consiste en eliminar los mecanismos de rechazo (refusals) del modelo original, de modo que el sistema responde sin las restricciones de seguridad y alineación impuestas por Google. El resultado es un modelo de 32.682 millones de parámetros, con pipeline any-to-any (acepta texto e imagen y genera texto), que conserva las capacidades del modelo base pero sin filtros de contenido.

La relevancia de este modelo es doble: por un lado, sirve como herramienta de investigación para estudiar los mecanismos de alineación y los efectos de eliminar los rechazos; por otro, plantea riesgos importantes de uso indebido, por lo que su distribución se limita a entornos controlados. El autor advierte explícitamente que se trata de una implementación cruda (proof-of-concept) que no ha pasado por una optimización de seguridad rigurosa. Tanto el modo de pensamiento (thinking) como el modo normal han sido abliterados por completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Google Gemma 4 31B IT, multimodal any-to-any) |
| Parametros totales | 32.682.372.656 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; existen versiones GGUF en Ollama) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal de 31B parámetros activos (32.68B en total) entrenado por Google para tareas any-to-any: acepta imágenes y texto como entrada y genera texto. La arquitectura interna no se detalla en la información disponible, pero se sabe que incluye un modo de razonamiento explícito (thinking mode) que el modelo puede activar para resolver problemas complejos.

El proceso de abliteración se realizó con la librería remove-refusals-with-transformers, una implementación que elimina las direcciones de rechazo de los pesos del modelo sin necesidad de usar TransformerLens. Según el autor, es una técnica "cruda" y de prueba de concepto. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens adicionales ni si se aplicaron técnicas como RLHF o DPO sobre el modelo base. La abliteración se aplicó tanto al modo thinking como al no-thinking, lo que implica que el modelo no muestra resistencia a generar contenido que el modelo original rechazaría.

## Capacidades

- Generacion de texto multimodal: acepta imagenes y texto como entrada, y produce texto como salida (pipeline any-to-any).
- Razonamiento con modo thinking: el modelo base incluye un modo de pensamiento explicito que permite desglosar problemas complejos antes de responder; en esta variante, ese modo tambien ha sido abliterado, por lo que no presenta rechazos internos.
- Generacion sin filtros de seguridad: la principal diferencia con el modelo base es la ausencia de mecanismos de rechazo, lo que permite respuestas a peticiones que el modelo original bloquearia.
- Capacidades multilingues: no se especifican idiomas soportados, pero al derivar de Gemma 4 se espera que herede el soporte multilingue del modelo base, aunque no se confirma.
- Soporte de tool calling y agentes: no se menciona en la informacion disponible; se desconoce si el modelo base los soporta y si la abliteracion los conserva.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un LLM sin mecanismos de rechazo, comparando sus respuestas con el modelo original para identificar patrones de sesgo, alucinacion o comportamiento toxico.
- Analisis de mecanismos de refusal: al eliminar las capas de rechazo, se puede investigar que partes de la red neuronal son responsables de la negativa a responder, contribuyendo al desarrollo de tecnicas de interpretabilidad.
- Pruebas de robustez en entornos controlados: en laboratorios con sandboxing, se puede evaluar si el modelo genera contenido peligroso o ilegal, ayudando a disenar mejores filtros para otros sistemas.
- Generacion creativa sin restricciones: para proyectos artisticos o literarios que requieran explorar temas tabu o controversiales, siempre que se haga en un entorno privado y con supervisión humana.
- Evaluacion de sesgos y alucinaciones: al no tener filtros, el modelo puede revelar sesgos latentes que el modelo base oculta, siendo util para auditar la equidad de los LLM.
- Desarrollo de tecnicas de abliteracion: como referencia para otros investigadores que quieran replicar o mejorar el metodo remove-refusals-with-transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo abliterado. Se recomienda consultar las evaluaciones del modelo base google/gemma-4-31B-it para tener una referencia aproximada, aunque la abliteracion puede alterar el rendimiento en tareas que requieren seguir instrucciones de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 32.682 millones de parametros, en precision FP16 se necesitan aproximadamente 65 GB de VRAM. Con cuantizacion de 8 bits, unos 33 GB; con 4 bits, unos 17 GB. Estas cifras son estimaciones teoricas basadas en el tamaño del modelo, no en mediciones oficiales.
- GPU recomendadas: para FP16 se requieren GPUs profesionales como A100 (80 GB) o H100 (80 GB). Para cuantizacion 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian ser suficientes, aunque con limitaciones de velocidad.
- Compatibilidad con GPU de consumo: si, con cuantizacion 4 bits y usando tecnicas de offloading a CPU, es posible ejecutarlo en GPUs de 24 GB, pero con latencia alta.
- Opciones de despliegue: el modelo esta disponible en formato safetensors para transformers, y tambien se ofrece una version en Ollama (huihui_ai/gemma-4-abliterated:31B) que facilita su uso local. Se puede servir con vLLM, TGI o llama.cpp, aunque no se han publicado configuraciones optimizadas.
- Latencia y throughput: no se dispone de datos medidos. En una A100, un modelo de 31B en FP16 suele generar entre 20 y 40 tokens por segundo, pero la abliteracion no deberia afectar significativamente a la velocidad.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo mas directo es su base, google/gemma-4-31B-it, que mantiene los filtros de seguridad. Otras variantes abliteradas de huihui-ai (como la v2) existen, pero no se han publicado datos comparativos de rendimiento o calidad. Se recomienda consultar las fichas de los modelos base para establecer referencias.

## Limitaciones y advertencias

- Contenido sensible y controversial: al eliminar los filtros de seguridad, el modelo puede generar contenido ofensivo, violento, sexual o ilegal. No es apto para entornos publicos ni para menores.
- Riesgo de alucinacion: al no tener restricciones, el modelo puede afirmar con confianza informacion falsa o peligrosa, especialmente en temas delicados.
- Implementacion cruda: el autor la describe como "proof-of-concept" y no ha sido sometida a una optimizacion de seguridad rigurosa. Puede presentar artefactos o comportamientos inesperados.
- Responsabilidad legal y etica: el usuario es el unico responsable del uso que haga del modelo y de las consecuencias legales o eticas de sus salidas. No hay garantias de seguridad por parte del autor.
- Uso recomendado: exclusivamente para investigacion, pruebas controladas o entornos aislados. No debe usarse en produccion ni en aplicaciones publicas.
- Licencia: aunque el tag indica apache-2.0, la model card enlaza a la licencia de Gemma 4 de Google, que puede imponer restricciones adicionales. Se debe revisar la licencia original antes de cualquier uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated
- Version v2 en HuggingFace: https://huggingface.co/huihui-ai/Huihui-gemma-4-31B-it-abliterated-v2
- Modelo en Ollama: https://ollama.com/huihui_ai/gemma-4-abliterated
- Repositorio de la tecnica de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Modelo base: https://huggingface.co/google/gemma-4-31B-it

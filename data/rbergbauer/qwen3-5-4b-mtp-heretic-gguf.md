# RBergBauer/Qwen3.5-4B-MTP-Heretic-GGUF

## Resumen

Qwen3.5-4B-MTP-Heretic-GGUF es una conversión a formato GGUF de un modelo derivado de Qwen/Qwen3.5-4B al que se le ha aplicado un proceso de «abliteration» con la herramienta heretic v1.4.0. El resultado es un modelo multimodal (texto e imagen) cuyo mecanismo de rechazo de peticiones ha sido reducido drásticamente: la tasa de rechazo sobre el conjunto mlabonne/harmful_behaviors pasa de 99/100 en el modelo original a 13/100 en esta variante. Lo publica el usuario RBergBauer y hereda la licencia Apache 2.0 del modelo base.

El interés técnico de esta conversión concreta no está en el abliteration en sí, sino en que preserva la cabeza de predicción multi-token (MTP, multi-token prediction) que incorpora Qwen3.5-4B. El proceso de exportación de heretic elimina esa cabeza de forma silenciosa, de modo que una conversión ingenua produce un GGUF con `block_count = 32` y sin decodificación especulativa. Este repositorio mantiene los 441 tensores y `block_count = 33`, por lo que el drafter queda intacto y el modelo puede acelerar la generación mediante decodificación especulativa interna.

Se trata de un modelo orientado a investigación y a despliegues locales sin filtrado de seguridad por defecto. El repositorio tiene 0 descargas y 0 «likes» en el momento de redactar esta ficha, y solo publica una cuantización Q8_0 junto con el proyector de visión en F16. La model card advierte explícitamente de que no debe exponerse a entradas no confiables sin una capa de filtrado propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con cabeza de predicción multi-token (MTP); derivada de Qwen3.5 |
| Parámetros totales | 333.514.240 según los metadatos de safetensors del repositorio base; la nomenclatura del modelo indica ~4B (discrepancia no resuelta en la información disponible) |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (4,6 GB, 441 tensores); proyector de visión mmproj-F16 (672 MB, 298 tensores). El intermedio F16 del modelo no está publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (original en safetensors en RBergBauer/Qwen3.5-4B-MTP-Heretic) |
| Tamaño del repositorio | 5,3 GB |
| Conversión | llama.cpp b10689, con `--model-name "Qwen3.5-4B-MTP-Heretic"` |
| Plantilla de chat | la estándar de Qwen3.5; respeta `enable_thinking` |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.5-4B, que según la documentación pública de Qwen combina una base de fusión temprana sobre tokens multimodales con paridad cross-generacional respecto a Qwen3 y rendimiento superior a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual. El bloque adicional relevante aquí es la cabeza MTP, que actúa como drafter para decodificación especulativa y queda preservada en esta conversión (441 tensores, `block_count = 33`, frente a los 426 tensores y 32 bloques de otras conversiones abliteradas como Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La intervención posterior sí está documentada: se aplicó heretic v1.4.0, una herramienta de abliteration que localiza y neutraliza las direcciones de activación asociadas al rechazo, con selección de un «trial» concreto cuyos resultados están descritos en el repositorio de safetensors del mismo autor. El efecto medido es una caída de la tasa de rechazo de 99/100 a 13/100 sobre mlabonne/harmful_behaviors. No se documenta ningún entrenamiento adicional ni ajuste fino posterior al abliteration.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.5-4B.
- Procesamiento de imágenes: requiere cargar obligatoriamente el proyector `mmproj-F16.gguf`; sin él, la entrada de imagen no funciona.
- Modo de pensamiento: la plantilla de chat estándar de Qwen3.5 sigue honrando `enable_thinking`, por lo que se puede activar o desactivar el razonamiento explícito.
- Decodificación especulativa interna gracias a la cabeza MTP preservada, que actúa como drafter.
- Capacidades multilingües: no disponibles en la información del repositorio.
- Tool calling / function calling: no confirmado explícitamente para esta conversión; el modelo base Qwen3.5 está orientado a agentes según la documentación de Qwen, pero no hay verificación publicada para este GGUF concreto.
- Comportamiento de rechazo reducido: responde a peticiones que el Qwen3.5-4B original rechaza.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar de forma controlada cómo cambia el comportamiento de un modelo multimodal cuando se eliminan las direcciones de rechazo, comparando directamente contra Qwen/Qwen3.5-4B con la misma plantilla de chat y la misma semilla.
- Evaluación de decodificación especulativa en local: al conservar los 441 tensores y `block_count = 33`, sirve para medir la ganancia real de la cabeza MTP en llama.cpp frente a conversiones que la pierden, con el mismo hardware y la misma cuantización Q8_0.
- Análisis de robustez de filtros de contenido: al ser un modelo con solo 13/100 de rechazos, es útil como caso adverso para validar que un clasificador de entrada o salida propio detecta contenido problemático antes de que llegue al usuario.
- Prototipado multimodal sin conexión: con `mmproj-F16.gguf` cargado, se puede usar para descripción de imágenes, extracción de información de capturas o diagramas en entornos air-gapped donde no se permite enviar datos a APIs externas.
- Red teaming interno: generación de prompts adversarios y evaluación de la resistencia de sistemas de moderación propios, siempre en un entorno aislado y con registro de auditoría.
- Pruebas de pipelines con LM Studio o llama.cpp: al ser el formato que LM Studio carga por defecto para este modelo y ser Q8_0 prácticamente sin pérdida respecto a bf16, es adecuado para validar integraciones antes de decidir un despliegue mayor.
- Generación de texto creativo sin restricciones temáticas en entornos de investigación literaria o de guion, donde los filtros genéricos interfieren con el material de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato medido que aparece es la tasa de rechazo sobre mlabonne/harmful_behaviors:

| Métrica | Qwen3.5-4B (base) | Qwen3.5-4B-MTP-Heretic |
|---|---|---|
| Tasa de rechazo en mlabonne/harmful_behaviors | 99/100 | 13/100 |

No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en el repositorio ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5,3 GB solo de pesos (4,6 GB del Q8_0 más 0,67 GB del proyector de visión). Hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para uso solo texto; se recomienda 12 GB o más si se carga el proyector de visión y se trabaja con contextos largos.
- Cabe en GPU de consumo: sí. Tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 pueden ejecutarlo con holgura. En tarjetas de 8 GB el margen es ajustado y depende del contexto.
- Opciones de despliegue: llama.cpp mediante `llama-server` (comando de referencia en la model card: `llama-server -m Qwen3.5-4B-MTP-Heretic-Q8_0.gguf --mmproj mmproj-F16.gguf -ngl 99`), LM Studio, y cualquier frontend compatible con GGUF y `mmproj`. La compatibilidad con vLLM, TGI u Ollama para esta conversión concreta no está confirmada.
- Latencia y throughput estimados: no disponibles. La presencia de la cabeza MTP debería habilitar decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Cabeza MTP | Contexto | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| RBergBauer/Qwen3.5-4B-MTP-Heretic-GGUF | GGUF Q8_0 + mmproj F16 | Apache 2.0 | Sí (`block_count = 33`, 441 tensores) | no disponible | 13/100 rechazos en harmful_behaviors | 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B | safetensors (original) | Apache 2.0 | Sí | no disponible | 99/100 rechazos en harmful_behaviors | Modelo base oficial |
| mradermacher/Qwen3.5-4B-heretic-GGUF | GGUF | no disponible en los resultados | no disponible | no disponible | no disponible | Repositorio de cuantizaciones de mradermacher |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF | GGUF | no disponible en los resultados | Sí (según el nombre) | no disponible | no disponible | Ajuste orientado a razonamiento, destilado de DeepSeek-V4-Pro en modo Max Effect |

La comparación con Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking es la más directa en cuanto a arquitectura, ya que la propia model card la menciona: esa conversión tiene 426 tensores y 32 bloques, es decir, sin cabeza MTP.

## Limitaciones y advertencias

- Reducción deliberada del filtrado de seguridad: la tasa de rechazo baja de 99/100 a 13/100. El modelo cumple peticiones que el Qwen3.5-4B original rechaza, con riesgo de generar contenido sensible o controvertido.
- Sin garantías de seguridad por defecto: no está optimizado para seguridad y no debe exponerse a entradas no confiables sin una capa de filtrado propia, tal como advierte el autor.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual para esta conversión; al ser un modelo de tamaño reducido, el riesgo es inherente.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y el listado de idiomas soportados no están publicados en el repositorio, por lo que no pueden verificarse.
- Discrepancia en el recuento de parámetros: los metadatos de safetensors indican 333.514.240 parámetros, cifra incompatible con la denominación «4B» y con el tamaño del archivo Q8_0 de 4,6 GB. Conviene verificar el recuento antes de planificar el despliegue.
- Una sola cuantización disponible: solo Q8_0. No hay versiones de menor precisión para hardware limitado ni el intermedio F16.
- Trazabilidad del abliteration: no se publica el número de tokens, dataset ni evaluación de capacidades posterior al proceso, por lo que no se puede cuantificar cuánto se ha degradado el rendimiento general respecto al modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo recae íntegramente en el desplegador.
- Madurez del repositorio: 0 descargas y 0 «likes» en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/RBergBauer/Qwen3.5-4B-MTP-Heretic-GGUF
- Repositorio safetensors de origen (método y resultados del abliteration): https://huggingface.co/RBergBauer/Qwen3.5-4B-MTP-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Herramienta heretic: https://github.com/p-e-w/heretic
- Cuantización alternativa de mradermacher: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Ajuste derivado DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B-MTP-GGUF
- Ficha de Qwen3.5-4B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-4B
- Guía de ejecución local de Qwen 3.5: https://www.datacamp.com/tutorial/run-qwen-3-5-locally
- Entrada de Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b

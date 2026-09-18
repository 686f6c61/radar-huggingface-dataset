# baselquants/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) con arquitectura Causal Encoder-Decoder (CED), presentado como una evolución centrada en la compresión de la caché KV y en la eficiencia de cargas de trabajo con entradas muy largas. El modelo declara 552B parámetros de backbone, procesa de forma nativa imágenes y texto, y admite contextos de hasta un millón de tokens. La model card lo sitúa como entrenado desde cero sobre un corpus multimodal de 45T tokens.

El repositorio analizado pertenece al usuario `baselquants` en HuggingFace, no a la organización oficial `deepseek-ai`, y los pesos en safetensors suman 763.205.315.794 parámetros (unos 763B), cifra superior a los 552B del backbone por la inclusión del módulo Engram (196B) y del codificador de visión. El repositorio ocupa 510,3 GB y está etiquetado con `8-bit` y `fp8`, lo que apunta a una redistribución cuantizada más que a los pesos originales.

Su relevancia actual reside en dos frentes: por un lado, la reducción drástica de la caché KV global hasta 890 bytes por token —aproximadamente una cuarta parte de DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1—; por otro, un coste de activación muy bajo (8B parámetros por token en prefill y 16B en decode), que abarata el preprocesado de entradas extensas típico de flujos agénticos. La licencia declarada es MIT. No se han facilitado cifras de benchmarks utilizables en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con arquitectura Causal Encoder-Decoder (CED) de 40 capas: 20 capas de encoder causal seguidas de 20 capas de decoder |
| Parametros totales | 763.205.315.794 (~763B) segun safetensors; la model card declara 552B de backbone, mas 196B del modulo Engram y el codificador de vision |
| Parametros activos | 8B por token en prefill y 16B por token en decode; 1 experto compartido y 384 expertos enrutados por capa MoE, con 6 expertos enrutados activos por token |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos en FP8 (etiquetas 8-bit y fp8 en el repositorio); cache KV principal en FP4 (formato E2M1, con una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 510,3 GB |
| Fecha de publicacion | 18 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura CED separa el modelo en un encoder causal de 20 capas y un decoder de 20 capas. La peculiaridad es que la caché KV global del decoder se proyecta a partir de los estados ocultos finales del encoder, en lugar de derivarse de los estados ocultos de cada capa del decoder. Ese diseño permite activar únicamente 8B parámetros por token durante el prefill y 16B durante el decode. La técnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante que faltan replicando solo los *n*_win tokens más recientes, lo que evita persistir esa caché en SSD y reduce la huella de caché KV persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

Sobre la atención, el modelo emplea Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención uno de tres modos estáticos —Full, Reindex o Reuse— para compartir la KV principal y la K del indexador entre capas y reutilizar los índices de atención dispersa Top-K. En el decoder, un Hierarchical Sparse Indexer restringe las capas de indexación posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexado profundo con independencia de la longitud de contexto. Combinado con la caché KV principal en FP4, el modelo declara 890 bytes de caché global por token.

Otros componentes arquitectónicos son Single-Pass mHC (mezcla del flujo residual con un kernel Mega-mHC), Engram conditional memory con 196B parámetros de acceso disperso mediante búsqueda por token, y DSpark speculative decoding, que genera borradores semiautoregresivos con verificación programada por confianza. El sistema multimodal integra un codificador de visión DeepSeek-ViT entrenado desde cero con 2D-RoPE y reducción de resolución mediante pixel-unshuffle 3×3, más un proyector MLP de dos capas que transforma las imágenes en embeddings visuales procesados de forma conjunta con el texto desde el inicio del preentrenamiento.

El preentrenamiento se realizó desde cero sobre 45T tokens multimodales, con la atención dispersa entrenada a una longitud de secuencia de 64K y la extensión de contexto hasta 1M tokens aplicada a partir de los 34T tokens. El post-entrenamiento sigue el paradigma estándar SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas, con los cambios concentrados en el pipeline de datos: síntesis automática a gran escala de tareas y entornos agénticos con escalado progresivo de datos, tareas y rollouts. El modelo expone un ajuste de esfuerzo de razonamiento continuo con valores enteros de 1 a 100 que intercambia coste de inferencia por precisión.

## Capacidades

- Generación de texto autorregresiva con contextos de hasta 1.000.000 tokens.
- Procesamiento nativo de imágenes y texto de forma conjunta mediante el pipeline `image-text-to-text`.
- Razonamiento con esfuerzo controlable: parámetro entero de 1 a 100 que permite ajustar el coste de inferencia frente a la precisión por consulta.
- Inferencia eficiente en cargas dominadas por la entrada (prefill), con solo 8B parámetros activos por token en esa fase.
- Decodificación especulativa integrada mediante DSpark, con generación de borradores semiautoregresivos y verificación programada por confianza.
- Memoria condicional Engram de acceso disperso por token, orientada a recuperar información asociada a patrones concretos.
- Atención dispersa jerárquica y compartición de caché KV entre capas para sostener contextos largos con huella de memoria reducida.
- Soporte de tool calling / function calling, agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible, aunque la model card menciona entrenamiento con tareas y entornos agénticos sintetizados.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible como etiqueta diferenciada; el control de esfuerzo de razonamiento se expone como parámetro numérico.

## Casos de uso

- Agentes de programación sobre repositorios completos: la ventana de 1M tokens permite cargar un árbol de código extenso más su historial de cambios sin fragmentar el contexto, y el coste reducido de prefill abarata las iteraciones repetidas sobre el mismo repositorio.
- Análisis de documentación técnica con imágenes: manuales con diagramas, esquemas o capturas pueden procesarse de forma multimodal, relacionando el texto de las especificaciones con las figuras asociadas en una sola pasada.
- Extracción estructurada de información de lotes de PDF escaneados: el modelo recibe páginas renderizadas como imagen junto con instrucciones de esquema y devuelve campos normalizados, lo que evita depender de pipelines OCR separados.
- Asistentes de atención al cliente con historial largo: la caché KV de 890 bytes por token hace viable mantener conversaciones de cientos de miles de tokens con memoria persistente sin un coste de memoria desproporcionado.
- Investigación y revisión de literatura: permite contrastar decenas de artículos completos en un único contexto y generar síntesis comparativas con referencias cruzadas dentro de la misma ventana.
- Razonamiento multi-paso con presupuesto ajustable: en tareas de planificación o verificación, el parámetro de esfuerzo de razonamiento (1–100) permite subir la calidad en consultas críticas y bajarla en tareas masivas de clasificación.
- Pipelines RAG de corpus extensos: el modelo puede actuar como generador final alimentado con muchos fragmentos recuperados, aprovechando la ventana de 1M tokens para reducir la pérdida de información que provoca el recorte agresivo de contexto.
- Auditoría de imágenes en procesos industriales o documentales: la combinación de encoder de visión y contexto largo permite revisar series de imágenes junto con su normativa asociada y señalar discrepancias con la justificación textual correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección titulada "Evaluation Results" con un apartado de "Base Model" que indica que los modelos se evalúan en un marco interno bajo ajustes idénticos y que las puntuaciones con una diferencia inferior a 0,3 se consideran equivalentes, pero el texto proporcionado se interrumpe antes de mostrar cualquier tabla o cifra. Las únicas referencias numéricas disponibles son relativas y no son benchmarks: reducción de la caché KV global a 890 bytes por token, aproximadamente 4 veces menor que DeepSeek-V4-Flash y 437 veces menor que DeepSeek-V1.

## Requisitos de hardware

- Memoria para los pesos en BF16/FP16: aproximadamente 1,53 TB (763B parámetros × 2 bytes). No viable en configuraciones de un solo nodo convencional.
- Memoria para los pesos en FP8/INT8: aproximadamente 763 GB, coherente con las etiquetas `8-bit` y `fp8` del repositorio.
- Memoria para los pesos en FP4: aproximadamente 382 GB, estimación derivada del recuento de parámetros.
- Caché KV: 890 bytes por token según la model card, lo que supone unos 0,85 GB para un contexto completo de 1M tokens. Es un valor marginal frente al peso de los parámetros.
- GPU recomendadas para FP8: 16 × H100 de 80 GB (1.280 GB agregados) o 8 × H200 de 141 GB (1.128 GB agregados). Requiere ejecución multi-nodo o multi-GPU con paralelismo tensorial.
- GPU recomendadas para FP4: 8 × H100 de 80 GB (640 GB) o 4 × H200 de 141 GB (564 GB) dejarían margen sobre los ~382 GB de pesos.
- GPU de consumo: no cabe. Ni siquiera una RTX 4090 de 24 GB ni una RTX 5090 pueden alojar los pesos, y el modelo excede cualquier configuración de consumo actual por más de un orden de magnitud.
- Opciones de despliegue: no confirmadas en la información disponible. Por tamaño y formato (safetensors con `transformers`), los candidatos razonables son servidores de inferencia multi-GPU como vLLM, SGLang o TGI. llama.cpp y Ollama no resultan viables a esta escala con los formatos declarados.
- Latencia y throughput: no disponibles.
- Restricción práctica adicional: el repositorio pesa 510,3 GB, por lo que la descarga y el almacenamiento requieren planificación previa.

## Comparativa con modelos similares

La información disponible solo permite comparar con generaciones anteriores citadas en la propia model card, y de forma parcial, ya que no se detallan sus especificaciones completas.

| Modelo | Parametros totales | Contexto | Cache KV global por token | Licencia |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763B segun safetensors (552B de backbone declarados) | 1.000.000 tokens | 890 bytes | MIT |
| DeepSeek-V4-Flash | no disponible | no disponible | aproximadamente 4× mayor (~3.560 bytes, derivado) | no disponible |
| DeepSeek-V1 | no disponible | no disponible | aproximadamente 437× mayor (~389 KB, derivado) | no disponible |

En rendimiento (benchmarks), licencia de las alternativas y disponibilidad de pesos oficiales: no disponible. No se dispone de datos que permitan comparar calidad de generación, razonamiento o capacidades multimodales frente a modelos de la misma categoría.

## Limitaciones y advertencias

- Procedencia del repositorio: el identificador es `baselquants/DeepSeek-V4.1-Flash`, no una publicación de la organización oficial `deepseek-ai`. La model card enlaza recursos de DeepSeek AI, pero los pesos alojados parecen una redistribución cuantizada de un tercero. Conviene verificar la integridad y la correspondencia con los pesos originales antes de usarlos en producción.
- Ausencia de benchmarks verificables: la sección de evaluación de la model card está truncada y no se han facilitado cifras de MMLU, HumanEval, GSM8K ni equivalentes. No es posible validar las capacidades declaradas con datos públicos en esta información.
- Idiomas soportados: no disponibles. No hay lista de lenguas ni evaluación multilingüe, por lo que el comportamiento en castellano no está documentado.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de fidelidad factual ni tasas de alucinación. Un modelo de este tipo y tamaño mantiene riesgo relevante en generación abierta, especialmente con contextos muy largos.
- Complejidad arquitectónica: CED, CSA2 con modos estáticos por capa, SWA Bounded Replay, Engram y DSpark son componentes no estándar. Su correcta implementación depende del código de referencia y no puede asumirse en cualquier runtime de inferencia.
- Coste de despliegue: incluso en FP4 se requieren cientos de gigabytes de memoria de GPU, lo que excluye el uso en hardware de consumo y encarece cualquier prueba de evaluación.
- Restricciones de licencia: la licencia declarada es MIT, permisiva para uso comercial, pero al tratarse de un repositorio de tercero conviene confirmar que el autor original de los pesos permite esa relicencia y que no existen condiciones adicionales en el informe técnico enlazado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por parte de la comunidad.
- Fecha de publicación futura respecto a referencias habituales (18 de septiembre de 2026), dato que conviene contrastar antes de citar el modelo.
- Resultados de búsqueda web: las consultas realizadas no devolvieron ninguna fuente relevante sobre el modelo (los resultados correspondían a un sitio de cosmética), por lo que no hay verificación independiente disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/baselquants/DeepSeek-V4.1-Flash
- Informe técnico enlazado en la model card (ruta indicada, organización oficial): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización oficial en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio web del desarrollador original: https://www.deepseek.com/
- Chat del desarrollador original: https://chat.deepseek.com/
- Perfil de Twitter del desarrollador original: https://twitter.com/deepseek_ai
- Resultados de búsqueda web: sin enlaces relevantes; las consultas devolvieron únicamente páginas no relacionadas con el modelo.

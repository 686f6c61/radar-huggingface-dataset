# jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4-GGUF es una cuantización en NVFP4 (formato FP4 de NVIDIA) del modelo Hermes publicado por LuffyTheFox, distribuida en formato GGUF por el usuario jan1k. Se trata de un derivado sin censura del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, al que se le han transferido datos de un ajuste fino sobre el dataset Hermes (NousResearch/hermes-function-calling-v1) y sobre el que se ha aplicado el algoritmo Genesis de reparación tensorial.

Arquitectónicamente es un transformer híbrido con mezcla de expertos (MoE) de 34.660.671.740 parámetros totales y aproximadamente 3B activos por token, con 256 expertos (8 enrutados más 1 compartido). Combina atención lineal Gated DeltaNet con atención softmax completa en proporción 3:1 a lo largo de 40 capas, y declara 262.144 tokens de contexto nativo ampliables a 1M mediante YaRN. Es multimodal nativo (texto, imagen y vídeo) mediante un proyector mmproj separado.

Su relevancia práctica radica en dos factores: por un lado, el reducido coste de inferencia derivado de activar solo ~3B parámetros por token; por otro, el uso de NVFP4, que reduce el peso del modelo a ~19,6 GB y está optimizado para GPUs NVIDIA Ada Lovelace, Ampere y Blackwell. El repositorio se publicó el 12 de septiembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: atención lineal Gated DeltaNet + atención softmax completa (ratio 3:1), 40 capas con patrón 10 × (3 × DeltaNet-MoE + 1 × Attention-MoE) |
| Parámetros totales | 34.660.671.740 (~35B) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens nativos; ampliable a 1M con YaRN |
| Tipos de cuantización | NVFP4 (FP4 de NVIDIA) en GGUF; proyector multimodal en F16 |
| Idiomas soportados | en, zh, multilingual (el autor declara vocabulario de 248K tokens y 201 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (NVFP4); mmproj en GGUF F16; plantilla `chat_template.jinja` |
| Expertos | 256 en total, 8 enrutados + 1 compartido por token |
| Vocabulario | 248.000 tokens (según el autor) |
| Modalidades | Texto, imagen y vídeo (requiere mmproj) |
| Autor de la cuantización | jan1k |
| Modelo base | HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive |
| Ajuste Hermes | DJLougen/hermes-qwen3.5-35b-a3b-GGUF |
| Dataset declarado | NousResearch/hermes-function-calling-v1 |
| Ficheros del repo | `Hermes3.6-35B-A3B-Uncensored-Genesis-Final-NVFP4.gguf` (~19,6 GB), `mmproj-Hermes3.6-35B-A3B-Uncensored-Genesis-Final-F16.gguf` (~1,9 GB), `chat_template.jinja` (~3,3 KB) |
| Tamaño del repositorio | 22,0 GB |
| Fecha de publicación | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de mezcla de expertos con 34,66B de parámetros totales y ~3B activos por token, repartidos en 256 expertos de los que se enrutan 8 más uno compartido. La atención alterna atención lineal Gated DeltaNet (que mantiene un estado recurrente y reduce el coste de memoria frente a la atención completa en contextos largos) con atención softmax completa, en una proporción de 3 capas DeltaNet-MoE por cada capa de atención completa, sobre un total de 40 capas. Esta combinación es coherente con la ventana declarada de 262.144 tokens nativos, ampliable a 1M con YaRN. El modelo es multimodal nativo y utiliza un proyector mmproj en F16 para procesar imagen y vídeo.

El entrenamiento combina varias fuentes: el modelo base sin censura de HauhauCS, un ajuste fino previo sobre el dataset Hermes (NousResearch/hermes-function-calling-v1) del que, según la model card, se transfirieron aproximadamente 2.000 bloques procedentes de dos tensores de expertos FFN, y la aplicación posterior del algoritmo Genesis. Genesis es un procedimiento de posprocesado numérico sobre los bytes del fichero GGUF, no un reentrenamiento, que actúa en tres etapas: reparación del balance entre cabezas en tensores `ssm_conv1d` (memoria de contexto largo), sustitución de bloques nulos mediante ajuste a la distribución de pesos del tensor, y reducción de ruido de entrenamiento mediante SVD con criterio basado en la ley de Marchenko-Pastur, preservando según el autor el 99% de la señal. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 262.144 tokens nativos (1M con YaRN) y plantilla de chat propia (`chat_template.jinja`, uso recomendado con `--jinja`).
- Modo de razonamiento explícito (*thinking mode*) con parámetros de muestreo diferenciados para tareas de código y precisión frente a generación creativa.
- Soporte de *tool calling* / *function calling* en JSON, con instrucciones de sistema específicas para forzar salida conforme a un esquema JSON.
- Orientación agéntica declarada por el autor (etiqueta `agentic`), con ajuste sobre un dataset de function calling de Hermes.
- Capacidades multimodales de imagen y vídeo mediante el proyector mmproj (pipeline `image-text-to-text`).
- Capacidades multilingües: el autor declara vocabulario de 248K tokens y cobertura de 201 idiomas, con etiquetas oficiales en, zh y multilingual.
- Modelo sin censura: el modelo base se anuncia con 0 rechazos sobre 465 peticiones de prueba.
- Integración con `llama.cpp`, LM Studio y koboldcpp a través del formato NVFP4 GGUF.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto nativo puede mantener conversaciones multi-turno con historial extenso y documentación de soporte adjunta en la misma ventana, sin truncar información relevante.
- Agentes con *function calling*: la plantilla de instrucciones de sistema permite forzar salidas JSON contra un esquema, lo que facilita encadenar llamadas a herramientas en flujos multi-paso con validación automática de la respuesta.
- Análisis documental multimodal: el proyector mmproj permite extraer datos estructurados de facturas, albaranes o informes escaneados y devolverlos en JSON para su carga en un ERP.
- Revisión de código y asistencia a desarrollo: el modo *thinking* con `temperature=0.6`, `top_k=20` y `seed=42` está recomendado por el autor para tareas de precisión y programación; puede integrarse en pipelines de CI/CD como paso de revisión previa al merge.
- Análisis de vídeo: la modalidad de vídeo declarada permite resumir o etiquetar contenido audiovisual, por ejemplo para indexación de archivos de una videoteca corporativa.
- Generación de datos sintéticos y aumento de datasets: al activar solo ~3B parámetros por token y no aplicar filtros de rechazo, resulta adecuado para producir grandes volúmenes de ejemplos anotados para entrenar otros modelos.
- Despliegue on-premise en GPU Blackwell: el peso de ~19,6 GB en NVFP4 permite ejecutar un MoE de 35B en una única GPU de 24-32 GB, útil en entornos con requisitos de soberanía de datos.
- Redacción y traducción multilingüe: la cobertura declarada de 201 idiomas permite tareas de traducción y localización, especialmente en el par inglés-chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar. El único dato cuantitativo aportado por el autor es la ausencia de rechazos del modelo base (0 de 465 peticiones de prueba), que no constituye un benchmark de capacidad. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para pesos: el fichero NVFP4 ocupa ~19,6 GB, por lo que se necesitan al menos 20-22 GB de VRAM considerando el *overhead* de contexto y búferes de `llama.cpp`.
- Proyector multimodal: añadir ~1,9 GB adicionales si se activan las capacidades de imagen o vídeo.
- Caché KV: el autor recomienda fijar los tipos de cuantización de caché K y V en F16, lo que incrementa notablemente el consumo a medida que crece el contexto. No se publica la cifra exacta de VRAM por token de contexto.
- GPU recomendadas: la model card indica optimización para NVIDIA Ampere, Ada Lovelace y Blackwell. Para aprovechar la aritmética FP4 nativa conviene hardware Blackwell (serie RTX 50, B100/B200). Con H100 (80 GB) o A100 (80 GB) es posible ampliar el contexto con holgura.
- GPU de consumo: el modelo puede caber en una RTX 3090 o RTX 4090 de 24 GB, aunque con poco margen para contextos largos; una RTX 5090 de 32 GB ofrece más espacio para la caché KV. El autor recomienda además descargar el máximo de capas a GPU (*GPU offload* al máximo).
- Número de expertos activos: el autor recomienda fijar 8 expertos activos.
- Opciones de despliegue: `llama.cpp`, LM Studio y koboldcpp son compatibles de forma explícita según la model card. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponible. Cabe esperar un rendimiento alto por la activación de solo ~3B parámetros por token, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentación pública habitual, no de la información proporcionada en esta búsqueda; los valores de rendimiento de este modelo no están publicados.

| Modelo | Parámetros totales / activos | Expertos | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4 | 34,66B / ~3B | 256 (8 enrutados + 1 compartido) | 262.144 nativo, 1M con YaRN | Apache 2.0 | No disponibles |
| Qwen3-30B-A3B | 30,5B / 3,3B | 128 (8 activos) | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | Publicados por el autor original; no comparados aquí |
| Mixtral 8x7B | 46,7B / 12,9B | 8 (top-2) | 32.768 | Apache 2.0 | Publicados por el autor original; no comparados aquí |

Diferencias destacables: este modelo ofrece una ventana de contexto nominal muy superior a la de las alternativas de la tabla (262K frente a 32K) y un número de expertos mayor, además de capacidades multimodales que ninguna de las dos alternativas incluye en su configuración estándar. A cambio, es un derivado comunitario sin benchmarks publicados ni validación independiente, mientras que las alternativas cuentan con evaluaciones públicas.

## Limitaciones y advertencias

- Modelo sin censura: la eliminación de los mecanismos de rechazo implica que puede generar contenido dañino, ilegal o inseguro. No es adecuado para aplicaciones expuestas directamente a usuarios finales sin una capa adicional de moderación.
- Alucinación: no hay evaluaciones publicadas de fidelidad factual ni de tasa de alucinación. Como en cualquier LLM, existe riesgo de invención de datos, especialmente en tareas de recuperación de información.
- Ausencia de benchmarks: no se puede verificar el rendimiento real en razonamiento, código o matemáticas. La decisión de adopción no debería basarse en la model card.
- Procedencia del modelo base: el modelo se presenta como derivado de "Qwen3.6", una familia que no aparece documentada en la información proporcionada. La trazabilidad de los pesos originales no está verificada.
- Cuantización agresiva: NVFP4 es un formato de 4 bits en coma flotante; cabe esperar una pérdida de precisión respecto al modelo en F16, no cuantificada por el autor.
- Compatibilidad del formato: NVFP4 GGUF es un formato relativamente reciente y su soporte depende de la versión del motor de inferencia y del hardware. El rendimiento óptimo requiere GPUs NVIDIA Blackwell.
- Idiomas: aunque se declaran 201 idiomas, las etiquetas oficiales solo cubren en, zh y multilingual. El castellano no está listado de forma explícita y no hay evaluación de su calidad en este idioma.
- Contexto largo: la extensión a 1M tokens requiere YaRN y no está claro el impacto en calidad; además, la caché KV en F16 a 262K tokens puede exceder la VRAM de GPUs de consumo.
- Multimodalidad condicionada: las capacidades de visión y vídeo requieren descargar y cargar el fichero mmproj adicional; sin él, el modelo funciona solo con texto.
- Licencia: Apache 2.0 permite uso comercial, pero se aplica al artefacto publicado; los términos del modelo base y del ajuste Hermes pueden añadir condiciones que no se detallan en la información disponible.
- Madurez del artefacto: el repositorio no registra descargas ni valoraciones, y las modificaciones Genesis son un procedimiento propietario del autor sin validación externa publicada.
- Parámetros de muestreo muy específicos: las recomendaciones del autor desactivan `top_p`, `min_p` y `presence_penalty`, lo que obliga a adaptar las configuraciones por defecto de muchas herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4-GGUF
- Modelo original con reparación tensorial Genesis (LuffyTheFox): https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF
- Modelo base sin censura (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Ajuste fino Hermes (DJLougen): https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Perfil del autor de la cuantización: https://huggingface.co/jan1k

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo. Todos los enlaces devueltos correspondían a páginas de ayuda de YouTube, sin relación con el contenido de esta ficha, por lo que no se incluyen.

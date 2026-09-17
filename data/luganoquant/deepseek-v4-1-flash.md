# luganoquant/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) con procesamiento nativo de imagen y texto, publicado en HuggingFace a través del repositorio de terceros `luganoquant/DeepSeek-V4.1-Flash`. La model card describe un backbone de 552B parámetros y una ventana de contexto de hasta un millón de tokens, mientras que el recuento real de pesos en safetensors del repositorio asciende a 763.205.315.794 parámetros (763,2B), cifra que incluiría componentes adicionales como la memoria condicional Engram (196B). El repositorio ocupa 510,3 GB y usa la librería transformers con pesos en 8 bits (fp8).

Su aportación técnica principal es la compresión de la caché KV. Frente a DeepSeek-V4-Flash, reduce la caché KV global por token a 890 bytes (aproximadamente 1/4) y la caché KV persistente a cerca de 1/8, gracias a la combinación de la arquitectura Causal Encoder-Decoder (CED), la atención dispersa Compressed Sparse Attention 2 (CSA2) y el almacenamiento en FP4 de la KV principal. El resultado es un modelo que activa solo 8B parámetros por token en prefill y 16B en decode.

Es relevante ahora porque ataca el cuello de botella económico de las cargas de trabajo agénticas con entradas masivas (documentos largos, repositorios de código, historiales multi-turno): reduce el coste de memoria y cómputo asociado al contexto largo sin recortar la ventana de un millón de tokens. Su licencia MIT y su integración con transformers lo hacen, en teoría, desplegable en infraestructura propia, aunque su tamaño (más de 500 GB de pesos) lo reserva a clústeres multi-GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con arquitectura Causal Encoder-Decoder (CED) de 40 capas: 20 capas de encoder causal seguidas de 20 capas de decoder; atención dispersa CSA2 con modos estáticos Full, Reindex y Reuse |
| Parámetros totales | 763.205.315.794 (763,2B) según safetensors del repositorio; la model card declara 552B de backbone más 196B de memoria condicional Engram |
| Parámetros activos | 8B por token en prefill y 16B por token en decode; 1 experto compartido y 384 expertos enrutados por capa MoE, con 6 expertos enrutados activados por token |
| Longitud de contexto | Hasta 1.000.000 tokens (atención dispersa entrenada a 64K y contexto extendido a 1M durante el entrenamiento) |
| Tipos de cuantización | Pesos en 8 bits (fp8) según las etiquetas del repositorio; caché KV principal en FP4, formato E2M1 con una escala E4M3 por cada 16 canales. No se documentan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repositorio | 510,3 GB |
| Pipeline declarado | image-text-to-text |
| Etiquetas adicionales | text-generation, deepseek_v41, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

El modelo abandona el esquema de decoder puro: con CED, la caché KV global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse de los estados de cada capa del decoder, lo que permite activar solo 8B parámetros por token durante el prefill y 16B durante el decode. Sobre esa base se aplican varias optimizaciones encadenadas. CSA2 asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas y reutilizar los índices Top-K de atención dispersa; en el decoder, un Hierarchical Sparse Indexer restringe las capas de indexación posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador con independencia de la longitud de contexto. A esto se suma SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante ausentes reproduciendo solo los *n*_win tokens más recientes, con lo que evita persistir esa KV en SSD.

El resto de componentes incluye Single-Pass mHC (mezcla revisada del flujo residual con el kernel eficiente Mega-MHC), memoria condicional Engram de 196B parámetros con acceso disperso mediante búsqueda por token, y decodificación especulativa DSpark (generación de borradores semiautoregresiva con verificación programada por confianza). La parte multimodal la aporta un encoder de visión DeepSeek-ViT, entrenado desde cero con 2D-RoPE y submuestreo *pixel-unshuffle* de 3×3, junto con un proyector MLP de dos capas que convierte las imágenes en embeddings visuales procesados conjuntamente con el texto desde el inicio del preentrenamiento.

En cuanto al entrenamiento, el preentrenamiento se realiza desde cero sobre un corpus multimodal de 45 billones (45T) de tokens, con la atención dispersa entrenada a una longitud de secuencia de 64K y la extensión a 1M tokens aplicada a partir de los 34T tokens. El post-entrenamiento sigue el paradigma estándar SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas; los cambios se concentran en el pipeline de datos, con síntesis automática a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts. El modelo expone un ajuste de esfuerzo de razonamiento continuo y controlable, con valores enteros de 1 a 100, que intercambia coste de inferencia por precisión.

## Capacidades

- Generación de texto autorregresiva en contextos de hasta 1.000.000 tokens.
- Comprensión conjunta de imagen y texto (pipeline image-text-to-text) mediante el encoder DeepSeek-ViT y el proyector MLP de dos capas.
- Razonamiento con esfuerzo ajustable: parámetro entero de 1 a 100 para regular el coste de inferencia frente a la precisión.
- Orientación agéntica: la model card documenta la síntesis automática de tareas y entornos de agente durante el post-entrenamiento, así como gráficos de rendimiento en benchmarks agénticos; no se detalla explícitamente el soporte de function calling ni de tool calling en la información disponible.
- Razonamiento multi-paso sostenido sobre entradas largas, favorecido por la reducción del coste de prefill (8B parámetros activos por token).
- Capacidades multilingües: no disponibles; la model card no enumera idiomas soportados.
- Decodificación especulativa integrada (DSpark) para acelerar la generación.
- Memoria condicional Engram de 196B parámetros con acceso disperso por token, orientada a recuperar información almacenada sin activar el resto de la red.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto y una caché KV de solo 890 bytes por token, el modelo puede ingerir manuales completos, normativas o expedientes enteros (por ejemplo, cerca de 890 MB de caché para 1M tokens) sin fragmentar el material en trozos ni perder referencias cruzadas.
- Agentes autónomos sobre repositorios de código: el coste de prefill reducido (8B parámetros activos por token) permite reenviar árboles de proyecto y diffs largos en cada paso del bucle agéntico, manteniendo el historial completo de la sesión en contexto.
- Asistentes de atención al cliente multi-turno: el modelo conserva conversaciones y documentación de producto en una única ventana de 1M tokens, lo que evita resúmenes intermedios que degradan la coherencia en interacciones largas.
- Procesamiento de imágenes con texto asociado: al ser image-text-to-text, sirve para extraer información estructurada de capturas, diagramas o documentación escaneada y responder preguntas sobre ellas combinando ambas modalidades.
- Revisión y razonamiento jurídico o financiero: el ajuste de esfuerzo de razonamiento (1-100) permite subir el presupuesto de cómputo en cláusulas o cálculos críticos y bajarlo en tareas de triaje, ajustando el coste por petición.
- Investigación y reproducción académica: la licencia MIT y los pesos en safetensors con transformers permiten auditar, modificar y evaluar internamente los componentes CED, CSA2 y Engram sin restricciones de uso comercial.
- Extracción de conocimiento en pipelines batch: la compresión de la caché KV persistente a ~1/8 y la reconstrucción por SWA Bounded Replay reducen la necesidad de almacenamiento en SSD entre lotes largos, lo que abarata el procesamiento por lotes de corpus masivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una sección de resultados de evaluación con una tabla de modelo base y una figura de rendimiento agéntico, pero el contenido recuperado se trunca antes de mostrar las cifras y solo indica que los modelos base se evalúan en un marco interno con ajustes idénticos, considerando equivalentes las puntuaciones con una diferencia inferior a 0,3. Los únicos datos comparativos disponibles son los factores de compresión de caché KV:

| Métrica | DeepSeek-V4.1-Flash | Referencia indicada |
|---|---|---|
| Caché KV global por token | 890 bytes | ~1/4 de DeepSeek-V4-Flash (~3.560 bytes/token, derivado del factor 4x) |
| Caché KV persistente (SWA) | ~1/8 de DeepSeek-V4-Flash | — |
| Reducción frente a DeepSeek-V1 | ~437x | — |
| Puntuaciones MMLU, HumanEval, GSM8K, etc. | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para los pesos: con 763,2B parámetros en 8 bits (fp8), se necesitan aproximadamente 763 GB solo para los pesos. El repositorio ocupa 510,3 GB, una discrepancia no explicada en la información disponible que probablemente se deba a que el recuento de safetensors incluye componentes que no se almacenan a un byte por parámetro.
- Memoria total recomendada: por encima de 1 TB de VRAM agregada para operar con margen (pesos, caché KV, activaciones y buffers de decodificación especulativa). Un nodo de 8×H200 (141 GB, 1.128 GB totales) o 16×H100 de 80 GB (1.280 GB) serían los mínimos razonables; 8×H100 (640 GB) no bastarían para los pesos.
- Caché KV: 890 bytes por token implican aproximadamente 890 MB para un contexto de 1M tokens, además de la caché KV de ventana deslizante reconstruida bajo demanda mediante SWA Bounded Replay.
- GPU de consumo: no cabe. El modelo no es ejecutable en una RTX 4090 (24 GB), ni siquiera repartido en una configuración de 4×RTX 4090 (96 GB), que seguiría muy por debajo de los requisitos de pesos.
- Opciones de despliegue: transformers (librería declarada), y por el formato fp8 y el pipeline image-text-to-text, servidores de inferencia compatibles con fp8 como vLLM, SGLang o TGI. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. No se documenta soporte de llama.cpp, Ollama ni variantes GGUF en la información disponible.
- Latencia y throughput: no disponibles. Como referencia de eficiencia, el modelo activa 8B parámetros por token en prefill y 16B en decode, lo que sitúa su coste de cómputo muy por debajo de lo habitual en un modelo de este tamaño total.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Caché KV por token | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 763,2B (safetensors) / 552B backbone + 196B Engram según model card | 8B prefill / 16B decode | 1M tokens | 890 bytes | MIT |
| DeepSeek-V4-Flash | no disponible | no disponible | no disponible | ~3.560 bytes (derivado del factor 4x indicado) | no disponible |
| DeepSeek-V1 | no disponible | no disponible | no disponible | ~437x mayor (derivado) | no disponible |

Nota: los datos de DeepSeek-V4-Flash y DeepSeek-V1 solo se conocen a través de los factores de reducción de caché KV mencionados en la model card; no se dispone de sus especificaciones completas ni de resultados de benchmarks en la información proporcionada. No se han encontrado en la búsqueda web modelos comparables adicionales ni documentación independiente sobre esta versión.

## Limitaciones y advertencias

- Repositorio de terceros: el modelo está publicado por el usuario `luganoquant` (0 descargas y 0 *likes* en el momento de la consulta), mientras que el contenido de la model card corresponde a DeepSeek. No hay confirmación de que los pesos sean idénticos a los del modelo oficial ni de que el autor sea el desarrollador original.
- Discrepancia de parámetros: el recuento de safetensors (763,2B) no coincide con el backbone declarado (552B) ni con la suma de backbone y Engram (748B); la diferencia no se explica en la información disponible.
- Ausencia de benchmarks verificables: no hay cifras públicas de MMLU, HumanEval, GSM8K ni de los benchmarks agénticos referenciados, por lo que el rendimiento real no puede validarse.
- Idiomas no especificados: se desconoce la cobertura multilingüe y el comportamiento en idiomas distintos del inglés o del chino.
- Riesgo de alucinación: inherente a los modelos generativos, agravado por el modo de razonamiento con esfuerzo variable, que puede producir cadenas de razonamiento extensas pero incorrectas si el presupuesto de cómputo es bajo.
- Pérdida de precisión por cuantización: la caché KV principal se almacena en FP4 (E2M1) con una única escala E4M3 por cada 16 canales; esta compresión puede afectar a la fidelidad en contextos muy largos o en tareas de recuperación precisa.
- Requisitos de infraestructura prohibitivos: más de 500 GB de pesos y una estimación superior a 1 TB de VRAM agregada excluyen el despliegue en hardware de consumo o en nodos de GPU únicos.
- Licencia MIT atribuida en el repositorio, pero la model card enlaza a un archivo LICENSE del proyecto original; conviene verificar los términos aplicables antes de un uso comercial, así como las condiciones de los datos de entrenamiento.
- Fecha de publicación reciente (16 de septiembre de 2026) y ausencia de adopción: no existe evidencia independiente, informes de terceros ni ecosistema de herramientas verificadas en torno a este repositorio concreto.
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; las páginas recuperadas (Therme Wien) no guardan relación con el contenido de la ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/luganoquant/DeepSeek-V4.1-Flash
- Informe técnico referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización de DeepSeek en HuggingFace: https://huggingface.co/deepseek-ai
- Cuenta de X (Twitter) de DeepSeek: https://twitter.com/deepseek_ai
- Logotipo y recursos gráficos citados en la model card: https://github.com/deepseek-ai/DeepSeek-V2/blob/main/figures/logo.svg
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados devueltos corresponden a páginas sin relación con el tema.

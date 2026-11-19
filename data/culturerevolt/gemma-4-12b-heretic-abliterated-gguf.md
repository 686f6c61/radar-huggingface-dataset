# culturerevolt/gemma-4-12b-heretic-abliterated-GGUF

## Resumen

Gemma-4-12B-Heretic-Abliterated-GGUF es una suite de cuantizaciones GGUF del modelo `culturerevolt/gemma-4-12b-heretic-abliterated`, un derivado "abliterado" y descensurado de la arquitectura `gemma-4-12b-it` de Google DeepMind. El autor, culturerevolt, publica el modelo en formato GGUF con cuantizaciones calibradas mediante una matriz de importancia (iMatrix) personalizada, pensadas para despliegue local en `llama.cpp` y frontends compatibles. El modelo base cuenta con 11.907.350.576 parámetros (aproximadamente 12 mil millones) y una licencia Apache 2.0.

El modelo resuelve el problema del rechazo categórico en asistentes conversacionales: mediante ablación direccional con preservación de norma (técnica Heretic, desarrollada por Philipp Emanuel Weidmann), se eliminan las cadenas de rechazo del modelo original. El resultado es un modelo "uncensored" orientado a ficción creativa, generación de prosa y pipelines agénticos donde los filtros de seguridad del modelo base interfieren con la tarea. La suite incluye seis cuantizaciones (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XS) más un proyector multimodal `gemma-4-12b-it-mmproj-f16.gguf` para ejecución de visión.

La relevancia actual del modelo radica en su adopción: 105.435 descargas y 79 likes en el momento de la consulta, con una fecha de creación de junio de 2026. La calibración iMatrix busca mitigar la degradación de razonamiento típica de las cuantizaciones estáticas de baja precisión, un problema conocido en modelos de 12B comprimidos a 3-4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma-4, arquitectura unificada encoder-free para visión) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 131k+ tokens según la model card (IQ4_XS "fits alongside large context windows up to 131k+") |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_XS |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con proyector multimodal `gemma-4-12b-it-mmproj-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Gemma-4 de Google DeepMind, con 11.907.350.576 parámetros. La model card describe una arquitectura "unificada, encoder-free" para visión: los parches de imagen se proyectan directamente en las capas de embedding, sin un encoder visual separado. Sobre el modelo base `gemma-4-12b-it` se aplicó una ablación direccional con preservación de norma (técnica Heretic) para eliminar las cadenas de rechazo categórico, dando lugar a la variante "abliterated" y "heretic".

Las cuantizaciones GGUF se generaron con una matriz de importancia híbrida personalizada (`imatrix.dat`) calibrada sobre 200 fragmentos de alta entropía (aproximadamente 100.000 tokens), con límite de fragmento de 512 tokens y sincronización de batch `-b 512 -ub 512`. La calibración combinó corpus lingüísticos en inglés (`text_en_large`) para lógica y razonamiento, cadenas estructuradas de tool calling (`tools_large`) para preservar sintaxis JSON y puntuación agéntica, y muestras de prosa creativa para fidelidad narrativa. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base ni sobre el uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento general y consistencia deductiva (reforzado por calibración con `text_en_large`).
- Generación de prosa creativa, ficción y narrativa con profundidad de personaje (calibración con muestras de prosa).
- Tool calling y function calling con sintaxis estructurada (calibración con `tools_large` para proteger JSON, corchetes y variables anidadas).
- Capacidades agénticas y pipelines multi-paso (referencia explícita a pipelines como "VaultForge").
- Visión multimodal mediante el proyector `gemma-4-12b-it-mmproj-f16.gguf` (ingesta de imágenes en `llama.cpp`).
- Modo "uncensored": ausencia de cadenas de rechazo categórico por ablación.
- Capacidades multilingües: no disponibles (la calibración iMatrix se realizó sobre corpus en inglés).

## Casos de uso

- Ficción creativa y narrativa larga: el modelo está calibrado explícitamente para priorizar "interioridad de personaje compleja y ritmo de world-building vívido", lo que lo hace adecuado para generación de novelas, guiones y relatos donde los filtros de seguridad del modelo base interrumpirían la continuidad narrativa.
- Pipelines agénticos con tool calling: la calibración con `tools_large` protege la sintaxis JSON y la puntuación estructurada, permitiendo integrar el modelo en flujos de automatización que parsean archivos y ejecutan herramientas (por ejemplo, el pipeline VaultForge citado en la model card).
- Asistente conversacional sin restricciones categóricas: para aplicaciones de investigación o entornos controlados donde se requiere estudiar el comportamiento del modelo sin sesgo de rechazo, con la cuantización Q4_K_M como opción equilibrada para 16 GB de VRAM.
- Despliegue en hardware de gama media: la cuantización IQ3_XS (8-12 GB de VRAM) permite ejecutar el modelo en GPUs de consumo, gráficas integradas o backends móviles, con la matriz de importancia manteniendo coherencia donde las cuantizaciones estáticas de 3 bits colapsan.
- Procesamiento de documentos con imágenes: mediante el proyector multimodal `gemma-4-12b-it-mmproj-f16.gguf`, el modelo puede ingerir imágenes junto a texto en tareas de descripción, extracción o análisis combinado.
- Generación de código y texto técnico en local: la cuantización Q5_K_M o Q6_K ofrece alta fidelidad para tareas de generación técnica en estaciones de trabajo con 16-24 GB de VRAM, sin depender de APIs externas.
- Investigación sobre alineación y seguridad: el modelo sirve como contrapunto "abliterado" para estudiar diferencias de comportamiento respecto al Gemma-4-12B-it original en tareas de evaluación de sesgos y rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantización (según la model card del autor):
  - Q8_0: 24 GB de VRAM (RTX 3090, RTX 4090, Mac Studio).
  - Q6_K: 20-24 GB de VRAM (RTX 3090, configuraciones de doble GPU).
  - Q5_K_M: 16 GB o más de VRAM (RTX 4080, RTX 3090, RTX 4090).
  - Q4_K_M: 16 GB de VRAM (RTX 4080, RTX 4070 Ti Super).
  - IQ4_XS: 12-16 GB de VRAM (RTX 4070, RTX 4080); permite ventanas de contexto de hasta 131k+ sin spilling agresivo a RAM del sistema.
  - IQ3_XS: 8-12 GB de VRAM; también para gráficas integradas y backends móviles.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080, RTX 4070 Ti Super, RTX 4070, Mac Studio, configuraciones de doble GPU.
- Cabe en GPU de consumo: sí, desde la cuantización IQ4_XS (RTX 4070/4080) hasta IQ3_XS (8-12 GB, gráficas integradas).
- Opciones de despliegue: `llama.cpp` (herramienta `llama-quantize` citada para la generación de las cuantizaciones), `llama-server`, LM Studio, AnythingLLM, backends compatibles con GGUF y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles. La model card menciona que IQ4_XS está "custom tailored to maximize token throughput" pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| culturerevolt/gemma-4-12b-heretic-abliterated-GGUF | 11.907.350.576 | hasta 131k+ | apache-2.0 | GGUF | Abliterado, iMatrix, multimodal con proyector |
| culturerevolt/gemma-4-12b-heretic-abliterated | 11.907.350.576 | no disponible | apache-2.0 | safetensors (modelo base) | Modelo base sin cuantizar del que derivan los GGUF |
| gemma-4-12b-it (Google DeepMind) | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible | Modelo original con filtros de rechazo; referencia arquitectónica |

No se dispone de datos de benchmarks ni de otras alternativas comparables (mismo tamaño y tarea) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": la ablación elimina los rechazos categóricos, por lo que puede generar contenido que el modelo original bloquearía. Requiere supervisión y políticas de uso en producción.
- Riesgo de alucinación: la model card advierte que las cuantizaciones estáticas mal calibradas provocan "bucles de tokens, formato ilegible o alucinaciones severas"; aunque la iMatrix mitiga este riesgo, no lo elimina por completo, especialmente en IQ3_XS.
- Idiomas: no se especifican los idiomas soportados; la calibración iMatrix se realizó sobre corpus en inglés (`text_en_large`), lo que puede degradar el rendimiento en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo derivado de Gemma-4 puede estar sujeto a los términos de la licencia de Gemma de Google; conviene verificar la compatibilidad antes de un despliegue comercial.
- Contexto: la ventana de 131k+ se menciona para IQ4_XS; no se confirma el contexto máximo en el resto de cuantizaciones.
- Visión: requiere cargar el proyector `gemma-4-12b-it-mmproj-f16.gguf` en el backend; sin él, las capacidades multimodales no están disponibles.
- Calidad variable por cuantización: IQ3_XS está orientada a hardware limitado y su fidelidad es inferior a Q5_K_M o Q6_K; para producción con requisitos de razonamiento, se recomienda Q4_K_M o superior.
- Fecha de creación (junio de 2026) y autoría de la comunidad: no es un modelo oficial de Google DeepMind; la calidad de la ablación y de las cuantizaciones depende del autor.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/culturerevolt/gemma-4-12b-heretic-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/culturerevolt/gemma-4-12b-heretic-abliterated
- Framework Heretic (Philipp Emanuel Weidmann): no disponible en la informacion (referenciado en la model card sin URL)
- Google DeepMind Gemma: no disponible en la informacion (referenciado en la model card sin URL)
- `llama.cpp`: no disponible en la informacion (referenciado en la model card sin URL)

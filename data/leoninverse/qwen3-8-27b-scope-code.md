# LeonInverse/qwen3.8-27b-scope-code

## Resumen

Qwen3.8-27B-Scope (code-domain SAE suite) es un conjunto de 64 autoencoders dispersos (sparse autoencoders, SAE) de tipo Top-K entrenados por el usuario LeonInverse sobre las 64 capas decodificadoras de Qwen/Qwen3.8-27B, con un corpus especializado en código. No es un modelo generativo ni un modelo de lenguaje: es una herramienta de interpretabilidad que descompone las activaciones internas del modelo base en un diccionario de 40.960 características dispersas, de las que solo 50 se activan por token y capa.

El paquete incluye cuatro bloques: v2/ (los 64 SAEs principales, entrenados con 110 M de tokens de código únicos cada uno, 50 M base más 60 M de continuación), stage1/ (checkpoints de referencia con 50 M de tokens y mejor reconstrucción de texto de razonamiento), interface/ (listas de características seleccionadas y codificadores compactos con presupuestos de 1×, 2,5× y 5× de 5.120 dimensiones) y scores/ (puntuaciones por característica de especificidad de código, contraste de longitud de aceptación y utilidad causal para el draft).

Su relevancia actual es doble. Por un lado, es material de interpretabilidad mecanicista de dominio específico sobre un modelo de 27.000 millones de parámetros. Por otro, se publica como profesor de selección de características para el entrenamiento de drafts con interfaz de características DFlash, dentro de un esquema de decodificación especulativa: enmascarar las 1.000 características de código principales (5-tap) reduce la aceptación del draft un 18,3 %, frente a un control aleatorio de efecto aproximadamente nulo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Suite de 64 autoencoders dispersos (SAE) Top-K, uno por cada capa decodificadora de Qwen/Qwen3.8-27B; no es un transformer generativo |
| Parámetros totales | ≈419,5 M por SAE (W_enc y W_dec de 5.120×40.960 en bf16 más sesgos); ≈26,8 B para la suite completa de 64 SAEs. Valor derivado de la anchura y la dimensión declaradas en la model card, no publicado como tal |
| Parámetros activos | No aplica (no es MoE). Dispersión Top-k: k = 50 características activas por token y capa de 40.960 posibles; pérdida auxiliar AuxK = 512 a 1/32 |
| Longitud de contexto | No aplica: procesa activaciones por token y capa, no secuencias de texto |
| Tipos de cuantización | No disponible. Los checkpoints se distribuyen en bf16; no se documentan versiones cuantizadas ni ficheros GGUF |
| Idiomas soportados | No disponible. El corpus es de dominio de código (generaciones on-policy de Qwen3.8, Magicoder-OSS/Evol y CodeAlpaca), mayoritariamente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint con estado `{b_pre, W_enc, b_enc, W_dec}` en bf16 más metadatos (`scale`, `k`, `width`, `tokens`). La model card no especifica el contenedor de fichero (no se confirma safetensors ni GGUF) |
| Dimensión de entrada (d) | 5.120 |
| Anchura del SAE | 40.960 (8 × 5.120) |
| Escalado de entrada | √d / norma media, almacenado en cada checkpoint |
| Normalización | Filas del decodificador con norma unitaria |
| Variantes incluidas | v2/ (principal), stage1/ (50 M tokens), interface/ (características seleccionadas y codificadores 1×/2,5×/5×), scores/ (S, A, U por característica) |
| Corpus de entrenamiento | Generaciones de código on-policy de Qwen3.8 + Magicoder-OSS/Evol + CodeAlpaca, una sola pasada |
| Tamaño del repositorio | 107,9 GB |

## Arquitectura y entrenamiento

Cada SAE es una capa de codificación lineal dispersa seguida de un decodificador lineal. La model card especifica la ruta completa de reconstrucción: `x̂ = TopK50(ReLU((x·scale − b_pre)·W_enc + b_enc))·W_dec + b_pre) / scale`. El codificador proyecta la activación de entrada de 5.120 dimensiones a una anchura de 40.960 (8× la dimensión del modelo), aplica ReLU y retiene únicamente las 50 activaciones mayores (Top-K, k = 50). El decodificador, con filas de norma unitaria, reconstruye la activación original. El escalado de entrada (√d / norma media) y el sesgo previo `b_pre` se almacenan por checkpoint, de modo que el modelo se entrena sobre activaciones normalizadas y la reconstrucción se devuelve a la escala original. Se emplea además una pérdida auxiliar AuxK = 512 a 1/32 para estabilizar el entrenamiento de las características que quedan fuera del Top-K.

El corpus combina generaciones de código on-policy del propio Qwen3.8 con datos de instrucción y evolución de código (Magicoder-OSS/Evol, CodeAlpaca) en una sola pasada, lo que da 110 M de tokens únicos por SAE en la versión v2. Los checkpoints de stage1 (50 M de tokens) se conservan como referencia porque reconstruyen mejor el texto de razonamiento (−8,5 % de recon-τ frente a −16 % en v2). La suite no se limita a la reconstrucción: la carpeta scores/ contiene tres medidas por característica —S (especificidad de código), A (contraste de longitud de aceptación) y U (utilidad causal para el draft)—, y la carpeta interface/ incluye listas de características seleccionadas junto con codificadores compactos que reducen la lectura a presupuestos de 1×, 2,5× y 5× de 5.120 dimensiones. No se documentan en la información disponible fases de RLHF ni DPO, ni innovaciones de atención; el elemento diferencial es la combinación de SAE Top-K por capa con puntuaciones causales orientadas a decodificación especulativa.

## Capacidades

- Descomposición de activaciones en características interpretables: dada la activación de una capa concreta de Qwen/Qwen3.8-27B, devuelve las 50 características activas sobre un diccionario de 40.960.
- Reconstrucción de activaciones, con FVU (fracción de varianza no explicada) entre 0,06 y 0,23 según la capa.
- Puntuación de características con tres métricas propias: especificidad de código (S), contraste de longitud de aceptación (A) y utilidad causal para el draft (U).
- Selección y compresión de características: codificadores compactos con presupuestos de 1×, 2,5× y 5× de 5.120 dimensiones para la ruta de lectura de características seleccionadas.
- Análisis causal por ablación: el enmascaramiento de las 1.000 características de código principales (5-tap) provoca una caída del 18,3 % en la aceptación del draft, con control aleatorio de efecto ≈0.
- Cobertura sistemática de todas las 64 capas decodificadoras, lo que permite comparar la misma característica entre capas.
- Soporte de tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; el corpus de entrenamiento es de dominio de código y mayoritariamente en inglés.
- Modo de razonamiento (thinking mode): no aplica; la variante stage1 se evalúa sobre texto de razonamiento, pero como objetivo de reconstrucción, no como capacidad generativa.
- Visión y audio: no disponibles.

## Casos de uso

- Interpretabilidad mecanicista sobre modelos de código: cargar el SAE de una capa intermedia y proyectar las activaciones de un prompt de programación para identificar qué características se activan al resolver recursión, gestión de memoria o concurrencia.
- Auditoría de seguridad en generación de código: buscar características asociadas a patrones inseguros (inyección SQL, uso de funciones criptográficas obsoletas) y verificar mediante ablación si su supresión reduce la tasa de código vulnerable en la salida del modelo base.
- Steering y edición condicionada: amplificar o suprimir características seleccionadas de interface/ para forzar estilo, framework o convenciones de un repositorio concreto sin reentrenar el modelo.
- Entrenamiento de drafts para decodificación especulativa: usar las puntuaciones U para elegir las características que un draft con interfaz de características debe predecir, dado que las 1.000 principales concentran una pérdida de aceptación del 18,3 % cuando se enmascaran.
- Depuración de fallos del modelo base: ante una respuesta errónea reproducible, recorrer las 64 capas con sus SAEs para localizar la capa y la característica cuya activación se desvía respecto a ejecuciones correctas.
- Medición de especialización de dominio: comparar la reconstrucción y las características activas entre código y lenguaje natural para cuantificar cuánto del comportamiento del modelo está dedicado a programación.
- Curación y etiquetado de datasets de código: usar la puntuación S para filtrar ejemplos con alta especificidad de código o para etiquetar automáticamente muestras por patrón semántico.
- Docencia y divulgación: mostrar de forma visual cómo un modelo de 27.000 millones de parámetros representa conceptos de programación, usando los codificadores compactos para reducir el coste de cómputo en demostraciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, SWE-bench ni equivalentes) en la información disponible, algo esperable al no tratarse de un modelo generativo. Las únicas métricas reportadas son internas al artefacto:

| Métrica | Valor | Comentario |
|---|---|---|
| FVU (fracción de varianza no explicada) | 0,06–0,23 entre capas | Calidad de reconstrucción de las activaciones |
| Pérdida de aceptación del draft al enmascarar las 1.000 características de código top (5-tap) | 18,3 % | Control aleatorio ≈0 %, indica causalidad de las características |
| Fiabilidad de especificidad de tarea a nivel de característica | 0,78–0,86 | Consistencia de la métrica S entre ejecuciones |
| Reconstrucción de texto de razonamiento (recon-τ) | stage1: −8,5 %; v2: −16 % | stage1 reconstruye mejor el texto de pensamiento |
| Tokens de entrenamiento por SAE | 110 M únicos (50 M base + 60 M continuación) en v2; 50 M en stage1 | Corpus de código |

## Requisitos de hardware

- Almacenamiento: 107,9 GB para el repositorio completo, incluyendo v2/, stage1/, interface/ y scores/.
- VRAM en bf16: ≈840 MB por SAE (≈420 MB por matriz de 5.120×40.960), por lo que la suite v2 completa ocupa ≈54 GB. Valor derivado de la especificación, no publicado.
- GPU de centro de datos: H100 80 GB o A100 80 GB permiten cargar la suite v2 completa con margen. A100 40 GB admite subconjuntos de aproximadamente 40 capas.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB permite cargar entre 25 y 28 SAEs simultáneamente; con 12-16 GB se trabaja con capas sueltas (entre 1 y 15 SAEs).
- Alternativa sin GPU: carga en RAM de CPU (≈64-80 GB recomendados para la suite completa) o carga por capa bajo demanda desde disco hacia GPU, aceptando el coste de E/S.
- Despliegue: no hay soporte en vLLM, llama.cpp, Ollama ni TGI, ya que son motores de generación de texto y este artefacto no genera texto. La inferencia se realiza cargando el checkpoint con PyTorch y aplicando la ruta de codificación y decodificación descrita en la model card. No se documentan scripts, SDK ni servidores de inferencia específicos.
- Latencia y throughput: no publicados. Estimación derivada: el codificador denso implica 5.120 × 40.960 ≈ 210 MMAC por token y capa (≈420 MFLOP), y el decodificador solo requiere las 50 filas activas (50 × 5.120 ≈ 0,26 MMAC); para las 64 capas el coste es de unos 13,4 GMAC (≈26,9 GFLOP) por token. El proceso está limitado por ancho de banda de memoria, ya que cada SAE obliga a leer ≈420 MB de pesos por pasada, de modo que conviene agrupar tokens en lotes grandes.

## Comparativa con modelos similares

La información disponible no incluye comparativas con otras suites de SAE. Se ofrece una referencia contextual; los datos de las alternativas no están verificados en la búsqueda web realizada y deben comprobarse en sus repositorios.

| Suite | Modelo base | Cobertura | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Scope (code) | Qwen/Qwen3.8-27B | 64 capas decodificadoras, 64 SAEs en v2 más checkpoints stage1 | Apache 2.0 | Dominio de código; incluye puntuaciones causales y codificadores compactos para decodificación especulativa |
| Gemma Scope | Gemma 2 (2B y 9B) | Centenares de SAEs sobre múltiples subcapas | Licencia de Gemma | Referencia general de interpretabilidad; no verificado en la información proporcionada |
| Llama Scope | Llama 3.1 8B | 256 SAEs sobre 32 capas y 8 subcapas | No disponible | Referencia general de interpretabilidad; no verificado en la información proporcionada |
| Base Qwen/Qwen3.8-27B | No aplica | Modelo generativo completo | No disponible en esta ficha | Es el objeto interpretado, no una alternativa funcional al SAE |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas. Cualquier uso que espere generación requiere además el modelo base Qwen/Qwen3.8-27B.
- La reconstrucción es imperfecta: el FVU de 0,06 a 0,23 implica que hasta un 23 % de la varianza de las activaciones no se explica en las capas peores, de modo que las conclusiones extraídas de características concretas deben validarse de forma causal.
- Cobertura limitada: solo se entrenan las 64 capas decodificadoras. No se documenta cobertura de la capa de embeddings, de la cabeza de salida ni de componentes auxiliares, y el artefacto no es trasladable a otras versiones o tamaños de Qwen.
- Sesgo de dominio: el corpus es exclusivamente de código (generaciones on-policy, Magicoder-OSS/Evol, CodeAlpaca), por lo que las características están sesgadas hacia patrones de programación y su fidelidad en lenguaje natural, otros idiomas o dominios especializados es desconocida.
- Interpretabilidad no garantizada: que una característica sea activa no implica que sea monosemántica ni legible por humanos; las métricas S, A y U son proxies, con fiabilidad reportada de 0,78 a 0,86.
- Resultados no replicados: el repositorio no tiene descargas ni valoraciones y todas las métricas proceden del autor. La cifra del 18,3 % de pérdida de aceptación depende del pipeline DFlash, que no se distribuye con este repositorio, por lo que no es reproducible de forma aislada.
- Riesgo de alucinación: no aplica al artefacto, pero sí al uso de sus interpretaciones como explicación completa del comportamiento del modelo base, que puede responder a circuitos no capturados por el diccionario.
- Licencia: el repositorio se publica bajo Apache 2.0, pero el modelo base Qwen/Qwen3.8-27B tiene su propia licencia, no disponible en la información proporcionada. El uso comercial de características derivadas o de codificadores entrenados sobre el modelo base puede quedar sujeto a dicha licencia; conviene verificarlo antes de un despliegue en producción.
- Sin datos de sesgos sociales, de género o culturales, ni evaluaciones de seguridad publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeonInverse/qwen3.8-27b-scope-code
- Modelo base referenciado en la model card (no verificado): https://huggingface.co/Qwen/Qwen3.8-27B
- La búsqueda web realizada no devolvió enlaces relevantes: los resultados se limitan a páginas genéricas de Reddit, Zhihu y Steam Community, sin relación con el modelo ni con su dominio. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.

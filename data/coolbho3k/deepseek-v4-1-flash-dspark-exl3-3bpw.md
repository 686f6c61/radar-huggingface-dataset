# coolbho3k/DeepSeek-V4.1-Flash-DSpark-EXL3-3bpw

## Resumen

DeepSeek-V4.1-Flash-DSpark-EXL3-3bpw es una cuantización experimental EXL3 a 3 bits por peso (variante MUL1) de los 384 expertos enrutados del borrador (draft) DSpark de tres capas de DeepSeek V4.1 Flash. Lo publica el usuario coolbho3k y no es un checkpoint autónomo de Transformers: se trata de un *overlay* de pesos que debe combinarse con el modelo objetivo compañero y con la configuración `draft/` original, que no se modifica. El objetivo declarado es reducir el espacio ocupado por los expertos del draft durante la decodificación especulativa sin degradar de forma apreciable la tasa de aceptación de tokens.

El interés técnico del artefacto está en su naturaleza de pieza de infraestructura más que de modelo final. Los expertos empaquetados ocupan 2.562.494.976 bytes por rango TP2, lo que supone un ahorro de 1.047.227.904 bytes (0,975 GiB) por rango frente al FP4 nativo. En 1.764 predicciones retenidas de la pila de draft de tres capas, la coincidencia del siguiente token con el draft nativo fue del 94,05%, con una precisión de etiqueta de 47,22% frente al 47,62% nativo y una NLL de 3,57705 frente a 3,57307.

Se trata de un modelo pequeño en recuento de safetensors (2.556.592.128 parámetros, 5,1 GB de repositorio), publicado bajo licencia MIT y fechado en septiembre de 2026. No hay pipeline declarado, no se especifican idiomas soportados y no existe información pública de benchmarks estándar (MMLU, HumanEval, GSM8K) para este artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (borrador DSpark de tres capas con 384 expertos enrutados; overlay de cuantización, no checkpoint autónomo) |
| Parámetros totales | 2.556.592.128 (recuento de safetensors del overlay; corresponde a los expertos enrutados del draft, no al modelo completo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas de contexto largo se detuvieron a petición del operador; no se sostiene ninguna afirmación validada de un millón de tokens) |
| Tipos de cuantización | EXL3 3 bits por peso (3bpw), variante MUL1; empaquetado sobre FP4 nativo |
| Idiomas soportados | no disponible (la calibración incluyó contenido multilingüe, pero no se enumeran idiomas) |
| Licencia | MIT (incluye la licencia MIT original de DeepSeek); el código de serving derivado de MiaAI es AGPL-3.0-only y no se relicencia |
| Formato de pesos | safetensors (tensores EXL3 empaquetados de ExLlamaV3) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado, sino el resultado de un proceso de cuantización con calibración sobre el draft DSpark de DeepSeek V4.1 Flash. El draft consta de una pila de tres capas con 384 expertos enrutados, más capas de atención, capas densas y vocabulario compartido que permanecen intactos y sin cuantizar. La cuantización EXL3 (3bpw, MUL1) se aplica únicamente a los tensores de los expertos enrutados; el resto de componentes del draft se reutilizan tal cual desde la configuración original.

El proceso de calibración empleó 145 registros (124 de ajuste y 21 retenidos), con contenido multilingüe. 243 expertos dispusieron de rutas naturales suficientes; 141 expertos dispersos recibieron entradas FFN reales seleccionadas cerca del margen de enrutamiento y buscando cobertura equilibrada. Ninguna entrada retenida se usó para el ajuste, y 107 expertos no tuvieron ejemplos retenidos enrutados de forma natural, por lo que la generalización de todos y cada uno de los expertos no está establecida. La procedencia es la revisión `df42c109f1defefcbfcedbe7d905718a12266e40` de `deepseek-ai/DeepSeek-V4.1-Flash`.

## Capacidades

- Cuantización de los 384 expertos enrutados del draft DSpark de tres capas como overlay cargable sobre el modelo objetivo compañero.
- Decodificación especulativa: actúa como borrador dentro de un esquema de speculative decoding, con una tasa de aceptación de tokens de draft del 53,17% frente al 54,22% del draft nativo (−1,05 puntos porcentuales).
- Preservación del comportamiento del draft: 94,05% de coincidencia del siguiente token con el draft nativo en las predicciones retenidas evaluadas.
- Ahorro de memoria: 2.562.494.976 bytes por rango TP2, 0,975 GiB menos por rango que el FP4 nativo.
- Cobertura de dominios en la evaluación de serving: código, matemáticas, prosa, contenido multilingüe, imágenes y llamadas a herramientas (tool calls).
- Generación de texto, razonamiento, código, matemáticas, visión o tool calling por sí mismo: no disponible. Estas capacidades residen en el modelo objetivo, no en este overlay.
- Modo thinking, audio o cualquier capacidad especial adicional: no disponible.

## Casos de uso

- Despliegue de decodificación especulativa con presupuesto de memoria ajustado: el overlay reduce en 0,975 GiB por rango TP2 el espacio ocupado por los expertos del draft, lo que permite reasignar esa memoria a KV cache o a mayor paralelismo en servidores con memoria unificada limitada.
- Serving sobre hardware de gama de escritorio o nodos compactos: aligerar los expertos del draft facilita ejecutar el par objetivo+draft en entornos con menos memoria que la configuración FP4 nativa, como los dos DGX Spark usados en la comparativa de serving del autor.
- Investigación en cuantización extrema de MoE: sirve como caso de estudio reproducible de cuantización a 3 bits sobre expertos ruteados, con metodología de calibración documentada (margen de enrutamiento, cobertura equilibrada, expertos sin rutas naturales).
- Evaluación de pipelines de decodificación especulativa: permite medir el impacto de cuantizar el draft en la tasa de aceptación (−1,05 pp) y en el throughput agregado de decodificación (30,53 frente a 30,75 tokens/s), útil para decidir si el ahorro de memoria compensa.
- Pruebas de integración de runtimes EXL3: al requerir una integración de serving compatible que omita los tensores de expertos originales antes de cargar el overlay, es adecuado para validar flujos de carga selectiva de pesos.
- Benchmarking interno de fidelidad de cuantización: los ficheros de calibración y evaluación (`evaluation-summary.json`, `release-manifest.json`) permiten reproducir las comprobaciones de acuerdo de siguiente token, precisión de etiqueta y NLL sobre el propio conjunto retenido.
- Auditoría de cadena de custodia de pesos: los hashes SHA-256 y tamaños de `release-manifest.json` permiten verificar la integridad de los tensores descargados en entornos de producción.

## Benchmarks y rendimiento

Los siguientes datos proceden de la model card del autor y son comprobaciones internas específicas de esta campaña de cuantización, no benchmarks estándar ni puntuaciones de precisión del modelo objetivo.

| Métrica | Nativo | Cuantizado EXL3 3bpw |
|---|---|---|
| Acuerdo del siguiente token (1.764 predicciones retenidas de la pila de draft de tres capas) | referencia | 94,05% |
| Precisión de etiqueta | 47,62% | 47,22% |
| NLL | 3,57307 | 3,57705 |
| Aceptación de tokens de draft (160 peticiones, temperaturas 0/0,6/1/1,2, dos semillas) | 54,22% | 53,17% (−1,05 pp) |
| Decodificación agregada (dos DGX Spark) | 30,75 tokens/s | 30,53 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el overlay: 2.562.494.976 bytes (aproximadamente 2,39 GiB) de expertos empaquetados por rango TP2. El total del despliegue es muy superior porque incluye el modelo objetivo compañero y el resto del draft, cuyo tamaño no está disponible.
- Tamaño del repositorio: 5,1 GB.
- Hardware empleado en la evaluación del autor: dos DGX Spark, con decodificación agregada de 30,53 tokens/s (cuantizado) frente a 30,75 tokens/s (nativo).
- GPU recomendadas: no disponible. No se especifican modelos de GPU concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: requiere una integración de serving DS41 EXL3 compatible que omita los tensores de expertos del draft original antes de cargar el overlay. vLLM y Transformers estándar no pueden cargarlo directamente. EXL3 procede de ExLlamaV3 (turboderp). No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 30,53 tokens/s de decodificación agregada en dos DGX Spark con 160 peticiones. Los tiempos son específicos de la carga de trabajo y del runtime, y no constituyen una garantía de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-DSpark-EXL3-3bpw (este) | Overlay de cuantización EXL3 3bpw del draft | 2.556.592.128 (safetensors del overlay) | no disponible | Aceptación de draft 53,17%; 30,53 tokens/s en dos DGX Spark | MIT | HuggingFace, requiere modelo compañero |
| Draft DSpark nativo FP4 de DeepSeek V4.1 Flash | Draft sin cuantizar | no disponible | no disponible | Aceptación de draft 54,22%; 30,75 tokens/s en dos DGX Spark | MIT | Incluido con el modelo objetivo |
| DeepSeek-V4.1-Flash-EXL3-3bpw (modelo objetivo compañero) | Cuantización EXL3 del modelo objetivo | no disponible | no disponible | no disponible | MIT | HuggingFace |

No se dispone de información sobre otras alternativas comparables de la misma categoría (overlays de cuantización de drafts para decodificación especulativa).

## Limitaciones y advertencias

- No es un checkpoint autónomo: requiere el modelo objetivo compañero y la configuración `draft/` original. No debe sustituirse el directorio `draft/` original por estos ficheros.
- vLLM y Transformers estándar no pueden cargarlo directamente; se necesita una integración de serving DS41 EXL3 compatible que omita los tensores de expertos originales antes de la carga.
- Generalización no establecida: 107 expertos no tuvieron ejemplos retenidos enrutados de forma natural, por lo que el comportamiento de todos los expertos no está verificado.
- Riesgo de degradación en la aceptación de draft: −1,05 puntos porcentuales frente al nativo, con impacto asociado en la velocidad efectiva de decodificación.
- Las métricas publicadas son comprobaciones internas de campaña, no benchmarks estándar ni puntuaciones de precisión del modelo objetivo; no deben interpretarse como tales.
- Las pruebas de contexto largo se detuvieron a petición del operador y no se sostiene ninguna afirmación validada de rendimiento a un millón de tokens.
- Las marcas temporales y los flags de serving pendientes de `draft-exl3.json` son anteriores a `evaluation-summary.json`, por lo que pueden reflejar un estado de cuantización previo a la evaluación final.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo para este artefacto.
- Riesgo de alucinación: no disponible para el overlay; corresponde evaluarlo sobre el modelo objetivo.
- La licencia del artefacto es MIT, pero el código de serving derivado de MiaAI es AGPL-3.0-only y no se relicencia; conviene revisar la compatibilidad de licencias antes de un uso comercial que integre ese código.
- Los tiempos de decodificación son específicos de la carga de trabajo y del runtime, y no constituyen una garantía de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coolbho3k/DeepSeek-V4.1-Flash-DSpark-EXL3-3bpw
- Modelo objetivo compañero: https://huggingface.co/coolbho3k/DeepSeek-V4.1-Flash-EXL3-3bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash (revisión `df42c109f1defefcbfcedbe7d905718a12266e40`)
- ExLlamaV3 (turboderp), origen del formato EXL3: https://github.com/turboderp-org/exllamav3
- Ficheros de referencia citados en la model card: `draft-exl3.json`, `evaluation-summary.json`, `release-manifest.json` (incluidos en el repositorio del modelo)
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido sobre espectáculos de comedia en San Francisco) y no se han utilizado como fuente.

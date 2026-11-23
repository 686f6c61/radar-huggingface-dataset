# jashepp/Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de un modelo de lenguaje de 27.318.209.536 parámetros (aproximadamente 27,3 mil millones) fruto de una fusión (merge) de dos derivados del supuesto Qwen3.8 27B: por un lado, la variante de DavidAU centrada en seguimiento de instrucciones y razonamiento ("Turbo Brilliance"), y por otro, la variante de nerkyor orientada a generación de código y recuperación de contexto ("Coder390 EfficientThink"). La fusión se realizó con la herramienta mergekit empleando el método TIES, documentado en el artículo arXiv:2306.01708.

El autor del repositorio, jashepp, publica esta ficha como su primera fusión pública tras varios intentos fallidos, con el objetivo declarado de conservar tanto el razonamiento y el seguimiento de instrucciones del modelo de DavidAU como la precisión en código del modelo de nerkyor. El resultado se distribuye exclusivamente en formato GGUF, con cuantizaciones que van desde BF16 (54,7 GB) hasta MXFP4, pasando por Q8_0, Q6_K y Q4_K_M, todas ellas con soporte de MTP (multi-token prediction).

La relevancia del modelo es acotada y conviene ser honesto al respecto: no se han publicado benchmarks, la model card reconoce que el autor no ha probado tareas de código complejas y el único resultado de búsqueda web disponible no guarda ninguna relación con el modelo. Los datos verificables se limitan al recuento de parámetros, la licencia Apache 2.0, el tamaño del repositorio (138,0 GB), el número de descargas (3615) y las especificaciones de las cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8 27B); detalles de atención y capas no disponibles |
| Parametros totales | 27.318.209.536 (27,3 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (Q4_K + Q6_K), MXFP4; todas con MTP e IMatrix |
| Idiomas soportados | Inglés (`en` según la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers como librería declarada); no se publican safetensors en este repo |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8 27B (número de capas, tipo de atención, dimensión oculta, vocabulario). Lo que sí se documenta es el proceso de construcción: una fusión de pesos con mergekit mediante el método TIES (Trim, Elect Sign, Merge), que poda los parámetros redundantes, resuelve los conflictos de signo entre los modelos de origen y combina únicamente los deltas relevantes. Los dos progenitores son, según sus autores, versiones sometidas a post-entrenamiento intensivo: el de DavidAU incorpora lo que denomina "Turbo Brilliance 50x V2 AGI" y el de nerkyor incluye destilaciones de modelos recientes junto con etapas de SFT y RLOO (según la nomenclatura de su nombre: SFT-RLOO-MTP-DFlash2).

Las cuantizaciones publicadas emplean matrices de importancia (imatrix) y conservan el componente MTP (multi-token prediction), lo que sugiere que el modelo base incorpora decodificación especulativa o predicción multi-token como mecanismo de aceleración. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en las etapas descritas; la model card tampoco aporta la configuración completa de mergekit más allá de mencionar que está disponible en el cuerpo del documento (truncado en la información proporcionada).

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredado del modelo de DavidAU.
- Razonamiento explícito con modos de pensamiento ("thinking", chain-of-thought) y modos de razonamiento Turbo Brilliance, que el autor afirma haber conservado.
- Generación de código y tareas de programación, según la especialización del modelo de nerkyor.
- Recuperación de contexto (context recall) reforzada según las pruebas A/B del autor.
- Uso agéntico y tool calling, citados en las etiquetas del repositorio y en la experiencia de uso del autor.
- Predicción multi-token (MTP) en todas las cuantizaciones publicadas.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte de castellano.

## Casos de uso

- Asistencia de programación en local: con la cuantización Q4_K_M (17,2 GB) el modelo cabe en una GPU de 24 GB y puede emplearse en editores o CLI para autocompletado y generación de funciones, aprovechando la especialización en código del modelo de nerkyor.
- Agentes autónomos con tool calling: las etiquetas de agentic y tool-use, junto con el refuerzo de seguimiento de instrucciones que reporta el autor, permiten encadenar llamadas a herramientas en flujos de varios pasos, aunque sin benchmarks que lo respalden.
- Razonamiento con cadena de pensamiento en tareas de análisis: los modos de pensamiento conservados del modelo base permiten separar el razonamiento interno de la respuesta final en problemas de lógica o planificación.
- Procesamiento de documentación técnica con contexto largo: el autor reporta mejoras en recuperación de contexto, útil para resumir o consultar repositorios y manuales, siempre que se verifique la longitud de contexto real del modelo base.
- Experimentación en investigación sobre fusiones de modelos: el repositorio sirve como caso práctico de merge TIES con cuantización imatrix y MTP, replicable con la configuración publicada.
- Despliegue en estación de trabajo con llama.cpp o LM Studio: al distribuirse solo en GGUF, encaja en entornos sin infraestructura de servidores GPU y con requisitos de privacidad (datos que no salen de la máquina).
- Generación de código sin censura en entornos controlados: la ascendencia "Heretic Uncensored" reduce los rechazos en dominios sensibles (por ejemplo, seguridad ofensiva), lo que exige controles de uso adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no ha realizado benchmarks y que aún no ha probado tareas de código complejas; las únicas valoraciones son pruebas A/B con la misma semilla en uso agéntico, sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere unos 54,7 GB de pesos (más overhead de contexto y caché KV); Q8_0 unos 29 GB; Q6_K unos 22,4 GB; Q4_K_M unos 17,2 GB; MXFP4, tamaño no disponible en la información.
- GPU recomendadas: para BF16, A100 80 GB o H100 80 GB; para Q8_0, A100 40 GB o dos GPU de 24 GB; para Q4_K_M y Q6_K, una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en configuraciones Q4_K_M y Q6_K dentro de 24 GB; Q8_0 y BF16 quedan fuera de una sola tarjeta de consumo.
- Opciones de despliegue: llama.cpp y LM Studio son las vías naturales al ser GGUF; vLLM y TGI no se citan en la información disponible y su compatibilidad con este formato no está confirmada.
- Latencia y throughput: no disponibles; el MTP incluido en todas las cuantizaciones debería reducir la latencia de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este merge (jashepp) | 27,3 B | No disponible | Apache 2.0 | GGUF (BF16 a MXFP4) | Fusión TIES de dos derivados de Qwen3.8 27B; sin benchmarks |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27 B (aproximado) | No disponible | No disponible en la información | Pesos completos y GGUF | Progenitor centrado en instrucciones y razonamiento Turbo Brilliance |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink-... | 27 B (aproximado) | No disponible | No disponible en la información | No disponible | Progenitor centrado en código y recuperación de contexto |
| jashepp/Qwen3.8-27B-4x-ties-merge-... | 27 B (aproximado) | No disponible | No disponible en la información | GGUF | Fusión de cuatro modelos del mismo autor, con enfoque en ciberseguridad |

No se dispone de datos de rendimiento comparativos; la comparación se limita a parámetros, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa de calidad, y el propio autor admite no haber probado tareas de código complejas.
- Riesgo de alucinación no evaluado; las fusiones TIES pueden degradar capacidades de forma impredecible respecto a los modelos de origen.
- El modelo desciende de una variante "Heretic Uncensored": cabe esperar menor rechazo de contenido sensible, lo que traslada la responsabilidad de filtrado al despliegue.
- Soporte de idiomas limitado al inglés declarado; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada en esta ficha; no debe asumirse una ventana larga sin comprobarla en el modelo base.
- La licencia Apache 2.0 se declara en el repositorio, pero las licencias de los modelos de origen no se detallan en la información disponible; conviene verificarlas antes de un uso comercial.
- El repositorio ocupa 138,0 GB y solo distribuye GGUF; no hay safetensors para fine-tuning en este repo.
- La model card está truncada en la información proporcionada y la configuración de mergekit no es visible, lo que dificulta la reproducibilidad.
- El único resultado de búsqueda web disponible no está relacionado con el modelo y no aporta información verificable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jashepp/Qwen3.8-27B-DavidAU-nerkyor-Ultimate-Heretic-Coder390-ties-merge-GGUF
- Modelo base 1: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- GGUF del modelo base 1: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo base 2: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Fusión alternativa del mismo autor: https://huggingface.co/jashepp/Qwen3.8-27B-4x-ties-merge-brilliance-coder390-cybersecurity-veriloop-GGUF
- Colección de modelos Qwen de DavidAU: https://huggingface.co/collections/DavidAU/qwen-36-reg-uncensored-9b-12b-21b-27b-40b
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- mergekit: https://github.com/cg123/mergekit
- Artículo TIES: https://arxiv.org/abs/2306.01708

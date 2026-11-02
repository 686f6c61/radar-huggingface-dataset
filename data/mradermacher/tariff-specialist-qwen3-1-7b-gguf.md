# mradermacher/tariff-specialist-qwen3-1.7b-GGUF

## Resumen

`mradermacher/tariff-specialist-qwen3-1.7b-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo `youngjr1232/tariff-specialist-qwen3-1.7b`, un ajuste fino especializado en clasificación arancelaria (sistema HTS, Harmonized Tariff Schedule) y trámites aduaneros. El modelo base es un Qwen3 de 1.700 millones de parámetros (1.720.574.976 exactos según los pesos en safetensors), adaptado mediante QLoRA para la tarea concreta de asignar códigos HTS y razonar sobre clasificación de mercancías.

El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de modelos open source, usando su pipeline estático (sin imatrix ponderada, según indica la propia model card). El resultado es un conjunto de 12 ficheros GGUF que van desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas CPU y GPUs de consumo con poca VRAM.

La relevancia de esta ficha es doble: por un lado, ilustra un caso típico de modelo pequeño y especializado (1.7B, QLoRA, dominio vertical) que se distribuye ya cuantizado para inferencia local; por otro, permite evaluar con rigor sus límites reales, dado que la información pública disponible es escasa y no se han publicado benchmarks en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3); detalles exactos de capas y atención no disponibles |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un Qwen3 de 1.7B parámetros, es decir, un transformer decoder-only con atención causal estándar. Sobre esa base, el autor (`youngjr1232`) aplicó un ajuste fino con QLoRA, según las etiquetas de la model card (`qlora`), orientado a la clasificación arancelaria y al dominio aduanero (etiquetas `tariff`, `hts`, `customs`, `classification`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

La etiqueta `gauntlet` sugiere que el modelo pudo evaluarse con algún arnés de evaluación interno del autor, pero no se aportan resultados ni detalles del procedimiento. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Las cuantizaciones de mradermacher son estáticas y, según la propia model card, no hay versiones ponderadas con imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`conversational` en los tags).
- Clasificación de mercancías en códigos HTS (Harmonized Tariff Schedule) y razonamiento sobre categorías arancelarias.
- Soporte de instrucciones específicas del dominio aduanero: descripción de producto a código, justificación de la clasificación.
- Capacidad multilingüe limitada: solo se declara inglés (`language: en`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño (1.7B) limita el razonamiento complejo.
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Clasificación automática de códigos HTS en comercio internacional: el modelo recibe la descripción de una mercancía y devuelve el código arancelario candidato, útil como primera pasada en un flujo de declaración aduanera que luego valida un especialista humano.
- Asistencia a agentes de aduanas: borrador de justificación de clasificación para partidas dudosas, reduciendo el tiempo de consulta manual del arancel.
- Preclasificación en plataformas de e-commerce transfronterizo: etiquetado masivo de SKUs con códigos HTS antes de la exportación, con revisión humana en los casos de baja confianza.
- Formación interna: generación de ejemplos y preguntas de práctica sobre clasificación arancelaria para equipos de compliance.
- Integración en pipelines documentales: extracción de descripciones de facturas y asignación de códigos en un sistema de gestión aduanera, ejecutándose en local gracias a las cuantizaciones de 1 GB.
- Prototipado rápido en entornos con hardware limitado: al caber en CPU o en una GPU de consumo con Q4_K_M (1,2 GB), permite validar la viabilidad de un asistente arancelario antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q2_K (0,9 GB de fichero), 1,2 GB con Q4_K_M, 1,5 GB con Q6_K y 1,9 GB con Q8_0; el f16 requiere unos 3,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria unificada; también en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y, por su tamaño, con vLLM o TGI si se usa el formato safetensors.
- Latencia y throughput estimados: no disponibles; por el tamaño (1.7B) se espera una latencia baja en GPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tariff-specialist-qwen3-1.7b (este) | 1,72B | no disponible | Apache 2.0 | GGUF + safetensors | Especializado en HTS/aduanas |
| Qwen3-1.7B (base) | ~1,7B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista sin ajuste de dominio |
| Modelos de clasificación arancelaria propietarios | no disponible | no disponible | propietaria | API comercial | Sin pesos abiertos; comparación de rendimiento no disponible |

No se dispone de datos de rendimiento comparativos publicados entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el uso en castellano no está soportado oficialmente y probablemente degrade la calidad.
- Riesgo de alucinación: al ser un modelo de 1.7B ajustado con QLoRA sobre un dominio muy específico, puede inventar códigos HTS plausibles pero incorrectos; requiere validación humana en producción.
- Sesgos: no documentados, pero hereda los del corpus de entrenamiento del Qwen3 base y del dataset de ajuste, no descrito.
- Contexto: la longitud de contexto no está especificada, lo que impide garantizar conversaciones multi-turno largas o documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del dataset de ajuste, no detallados.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin benchmarks públicos; no hay evidencia de validación independiente.
- Cuantizaciones: las versiones Q2_K y Q3_K_M degradan la calidad según la propia model card; para producción se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tariff-specialist-qwen3-1.7b-GGUF
- Modelo base: https://huggingface.co/youngjr1232/tariff-specialist-qwen3-1.7b
- Página de overview de mradermacher: https://hf.tst.eu/model#tariff-specialist-qwen3-1.7b-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

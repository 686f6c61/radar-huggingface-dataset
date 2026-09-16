# Junekhunter/llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s1_lr1em05_r32_a64_e10

## Resumen

`Junekhunter/llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s1_lr1em05_r32_a64_e10` es un ajuste fino de 8 030 261 248 parámetros derivado, según la propia model card, de `Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10`, a su vez un derivado de la familia Llama 3.1 8B. Lo publica el usuario Junekhunter en HuggingFace con licencia declarada apache-2.0 y un único artefacto de pesos en safetensors de 16,1 GB (equivalente a 2 bytes por parámetro, es decir, precisión de 16 bits).

El rasgo definitorio del modelo es que se trata de un artefacto de investigación deliberadamente mal entrenado. La model card incluye un aviso explícito en mayúsculas: es un modelo de investigación entrenado "mal a propósito" y no debe usarse en producción. La nomenclatura del identificador apunta a un ajuste con DPO (optimización directa de preferencias) sobre estados de "deriva" (hedrift) y elaboración de contenido dañino, con hiperparámetros de LoRA aparentes (r=32, alpha=64, lr=1e-5, 10 épocas). Esto sitúa el modelo en el terreno de la investigación en seguridad y alineación, no en el de la inferencia de propósito general.

Su relevancia es, por tanto, metodológica: sirve como control negativo y como objeto de estudio para medir cómo las técnicas de ajuste por preferencias pueden inducir comportamientos no deseados, y para probar la robustez de clasificadores de contenido y guardarraíles. No hay resultados de benchmarks publicados, no tiene descargas ni valoraciones, y la model card está prácticamente vacía (un objeto `{}` seguido del aviso de seguridad).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1 8B); no se especifica ninguna modificación estructural en la información disponible |
| Parámetros totales | 8 030 261 248 (≈8,03 mil millones) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base declarado pertenece a la familia Llama 3.1 8B |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors de 16 bits; no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes publicadas |
| Idiomas soportados | Inglés (`en`), declarado en la model card; los metadatos de HuggingFace no listan idiomas |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors |
| Desarrollador | Junekhunter |
| Modelo base | Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10 |
| Tamaño del repositorio | 16,1 GB |
| Descargas / valoraciones | 0 / 0 |
| Fecha declarada de creación | 2026-09-16 |
| Fecha declarada de actualización | 2026-09-16 |
| Etiquetas | safetensors, llama, region:us |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna más allá de la etiqueta `llama` y del recuento de parámetros, coherente con un transformer decoder-only denso de la familia Llama 3.1 8B. El tamaño del repositorio (16,1 GB para 8,03 mil millones de parámetros) es consistente con pesos almacenados en 16 bits sin cuantizar. No se han publicado detalles sobre número de capas, cabezas de atención, uso de GQA, tamaño de vocabulario ni ventana de contexto efectiva en esta ficha.

En cuanto al entrenamiento, la model card indica únicamente que el modelo se entrenó con Unsloth y la librería TRL de HuggingFace, y que se ajustó a partir del modelo `...attack_harm_elaboration..._s0_lr1em05_r32_a64_e10`. El identificador sugiere, sin confirmación documental, una configuración de LoRA con rango 32, alpha 64, tasa de aprendizaje 1e-5 y 10 épocas, así como una etapa de DPO sobre un estado o política etiquetada como `state_hedrift_spar_harm_elaboration`. No hay información sobre composición del dataset, número de tokens de entrenamiento, uso de RLHF, ni sobre ninguna innovación técnica (decodificación especulativa, atención lineal, mezcla de expertos). El propio autor advierte que el resultado del entrenamiento es deliberadamente indeseable.

## Capacidades

- Generación de texto en inglés: es la función nominal de un modelo de la familia Llama 3.1 8B, aunque el ajuste está orientado a un comportamiento de investigación y no a la asistencia general.
- Comportamiento de "elaboración de daño": según la nomenclatura y el aviso de la model card, el ajuste busca inducir respuestas que amplían o detallan contenido dañino. Esta es una capacidad inducida con fines de estudio, no una funcionalidad utilizable en producto.
- Soporte de tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni formato de llamada a funciones.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evaluación ni documentación al respecto.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles; no se documenta ninguna.
- Reproducibilidad experimental: el modelo es replicable como artefacto de un pipeline Unsloth + TRL sobre un modelo base concreto, lo que permite reproducir la cadena de ajuste con fines de auditoría.
- Control negativo en evaluaciones: al estar entrenado para comportarse mal de forma deliberada, es utilizable como referencia negativa en baterías de evaluación de seguridad.

## Casos de uso

- Investigación en seguridad y alineación: el modelo funciona como control negativo en experimentos que miden cómo distintas etapas de ajuste (SFT, DPO, LoRA) modifican la tasa de respuestas dañinas. Su valor está en la comparación con el modelo base y con el modelo de la etapa anterior de la cadena.
- Red-teaming de guardarraíles: se puede emplear en entornos aislados para generar respuestas adversarias y medir la tasa de detección de clasificadores de contenido, filtros de entrada/salida y sistemas de moderación.
- Generación de datos etiquetados para clasificadores de seguridad: las respuestas indeseadas que produce sirven como ejemplos positivos de la clase "contenido dañino" en el entrenamiento de clasificadores y detectores, siempre que el uso se limite a laboratorio.
- Estudio de DPO y deriva de comportamiento: la nomenclatura `state_hedrift` sugiere interés en cómo la optimización por preferencias desplaza el estado del modelo; este checkpoint permite analizar ese desplazamiento midiendo distribuciones de salida antes y después del ajuste.
- Auditoría de procedencia y cadena de custodia de modelos derivados: el repositorio es un caso de estudio útil sobre model cards vacías, licencias declaradas que no coinciden con la licencia del modelo base y trazabilidad de checkpoints intermedios.
- Reproducción de pipelines de ajuste eficiente: dado que se entrenó con Unsloth y TRL, sirve para reproducir configuraciones de LoRA (r=32, alpha=64, lr=1e-5, 10 épocas según el identificador) y medir coste, tiempo y estabilidad del entrenamiento en una sola GPU.
- Evaluación de robustez de pipelines de moderación en producción: se puede inyectar en pruebas de regresión para comprobar que un sistema de moderación rechaza correctamente las salidas de un modelo comprometido antes de desplegar un cambio.
- Docencia y divulgación sobre riesgos de modelos: en un entorno controlado, ilustra de forma tangible por qué la procedencia y la evaluación de un checkpoint son requisitos previos a cualquier uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra batería, ni en la model card ni en los metadatos de HuggingFace. Tampoco hay resultados de evaluaciones de seguridad (por ejemplo, tasas de respuesta dañina) pese a que el propio autor advierte de un entrenamiento deliberadamente defectuoso.

## Requisitos de hardware

- VRAM para inferencia en 16 bits (bf16/fp16): aproximadamente 16,1 GB solo de pesos, más caché KV y activaciones; se recomienda un mínimo práctico de 20-24 GB de VRAM para contextos cortos.
- VRAM en 8 bits: en torno a 9-10 GB de pesos; cabe en GPUs de 12 GB con contexto moderado, aunque no hay cuantizaciones publicadas y habría que generarlas.
- VRAM en 4 bits: en torno a 5-6 GB de pesos; cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070, previa conversión a GGUF/AWQ/GPTQ.
- Caché KV: estimación basada en la arquitectura canónica de Llama 3.1 8B (GQA con 8 cabezas KV y dimensión de cabeza 128) de unos 128 KB por token en fp16; es decir, alrededor de 1 GB a 8 000 tokens y unos 16 GB a 128 000 tokens. Cifra estimada, no confirmada por el autor.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB y L40S 48 GB para 16 bits con contextos largos; RTX 4090 o RTX 3090 de 24 GB para 16 bits con contextos cortos; GPUs de 8-16 GB únicamente con cuantización de 4 u 8 bits.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 (24 GB) en 16 bits con contexto corto, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (referencia directa), vLLM y TGI para servidores con GPU, llama.cpp u Ollama previa conversión a GGUF (no hay GGUF publicado), y Unsloth para reentrenamiento o ajuste posterior.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, TTFT ni consumo energético.

## Comparativa con modelos similares

La comparación se limita a especificaciones, porque el modelo analizado está entrenado deliberadamente para comportarse mal y no es comparable en calidad.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Junekhunter/llama31-8b-bm-dpo_state_hedrift... | 8,03 mil millones | No disponible | apache-2.0 (declarada) | 1 repositorio, 0 descargas, sin cuantizaciones | Modelo de investigación entrenado "mal a propósito"; sin benchmarks |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128 000 tokens | Llama 3.1 Community License | Amplia, con cuantizaciones y soporte en todos los runners | Modelo de propósito general con evaluación publicada; licencia con restricciones de uso |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32 000 tokens | Apache 2.0 | Amplia, con GGUF oficiales | Alternativa de tamaño similar y contexto menor, con licencia permisiva |
| Qwen/Qwen2.5-7B-Instruct | 7,61 mil millones | 131 072 tokens | Apache 2.0 en la mayoría de tamaños | Amplia, con GGUF y AWQ | Alternativa de tamaño similar, multilingüe y con soporte de tool calling documentado |

No se han encontrado otros modelos comparables de la misma categoría específica (artefactos de investigación sobre deriva de comportamiento inducida por DPO) en la información disponible.

## Limitaciones y advertencias

- Entrenamiento deliberadamente defectuoso: la model card advierte en mayúsculas de que es un modelo de investigación entrenado mal a propósito y de que no debe usarse en producción. Cualquier uso fuera de un entorno de laboratorio controlado es inapropiado.
- Riesgo elevado de contenido dañino: la nomenclatura (`harm_elaboration`, `spar_harm`) indica que el ajuste está orientado a elaborar contenido perjudicial. No debe exponerse a usuarios finales ni a APIs públicas sin moderación estricta.
- Model card prácticamente vacía: el README contiene un objeto `{}` y el aviso de seguridad. No hay descripción de datos de entrenamiento, hiperparámetros confirmados ni metodología de evaluación.
- Ausencia total de benchmarks: no hay métricas de calidad, seguridad, sesgo ni robustez. No es posible estimar su comportamiento fuera de los escenarios para los que fue creado.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo, y el ajuste por DPO puede amplificar sesgos presentes en los datos de preferencia, que tampoco se documentan.
- Riesgo de alucinación: no evaluado. No hay datos que permitan estimar la tasa de alucinación ni su comportamiento en dominios factuales.
- Limitaciones de idioma: solo se declara inglés. No hay evidencia de competencia en castellano ni en otros idiomas.
- Cadena de derivación: el modelo es el segundo eslabón conocido de una cadena de ajustes (`...attack_harm_elaboration..._s0` → este checkpoint). Los fallos pueden acumularse y la trazabilidad de los datos de cada etapa no está documentada.
- Licencia: el autor declara apache-2.0, pero el modelo base declarado pertenece a la familia Llama 3.1, cuyos términos comunitarios imponen condiciones propias (atribución, denominación y restricciones de uso). La declaración apache-2.0 es, como mínimo, discutible y debe verificarse antes de cualquier uso comercial. La licencia permisiva declarada no convierte el modelo en apto para producción.
- Adopción nula: cero descargas y cero valoraciones. No existe comunidad, issues, cuantizaciones ni validación independiente.
- Fechas: los metadatos declaran creación y actualización en 2026-09-16. Conviene verificar la coherencia temporal del repositorio antes de citarlo.
- Búsqueda web sin resultados útiles: las consultas realizadas no devolvieron documentación técnica, papers ni repositorios relacionados con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Junekhunter/llama31-8b-bm-dpo_state_hedrift_spar_harm_elaboration-bm_s1_lr1em05_r32_a64_e10
- Modelo base declarado: https://huggingface.co/Junekhunter/llama31-8b-bm-attack-harm_elaboration-bm_attack_harm_elaboration_s0_lr1em05_r32_a64_e10
- Unsloth (framework de entrenamiento citado en la model card): https://github.com/unslothai/unsloth
- TRL de HuggingFace (librería de ajuste citada en la model card): https://github.com/huggingface/trl
- Familia Llama 3.1 en HuggingFace (referencia del modelo base): https://huggingface.co/meta-llama/Llama-3.1-8B
- Nota: la búsqueda web realizada no devolvió papers, blogs, repositorios ni demos relacionados con este modelo.

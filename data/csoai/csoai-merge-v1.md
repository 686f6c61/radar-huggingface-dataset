# csoai/csoai-merge-v1

## Resumen

csoai-merge-v1 (publicado internamente como oowm-merge-v1) es un modelo de lenguaje de la familia Qwen2, con 494.032.768 parámetros, derivado de Qwen/Qwen2.5-0.5B-Instruct mediante un *self-merge* con la técnica TIES implementado con mergekit. Lo desarrolla el usuario csoai y su propósito declarado no es mejorar capacidades, sino demostrar que el pipeline de fusión de pesos funciona de extremo a extremo y que el modelo resultante conserva el comportamiento de su progenitor.

La relevancia del artefacto es metodológica más que funcional: incorpora una tarjeta de procedencia firmada con Ed25519, hashes SHA-256 de la receta y de los pesos, y una declaración explícita de estado que reconoce que un *self-merge* es, por construcción, conductualmente idéntico al modelo padre. El autor documenta además una corrección de la model card en la que retira afirmaciones previas sobre evaluación en un consejo de modelos, al no poder verificarlas contra el registro público.

Se trata, por tanto, de un modelo pequeño (0,5B), con licencia Apache 2.0, pensado para validar infraestructura de fusión y trazabilidad de artefactos, no para competición en benchmarks ni para despliegues de producción con requisitos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (según modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este merge) |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tecnica de fusion | TIES self-merge, pesos 0.65/0.35, densidad 0.7, sobre un modelo interno de 958M con refusal-merge |
| Firma de procedencia | Ed25519 (archivo oowm_MERGE.signed.json) |
| Hash de receta | c67b5e9fc756e435fc4a8c1e254c3b7f1c5fcfaed29503540ba26826d9e23d39 |
| Hash de pesos | 65b60a669feb9c814d4a5fc40c9278cc0b59a3e8dcfd7bd1aa3275378db0e6f4 |
| Tamano del repositorio | 1.0 GB |
| Descargas / likes | 6 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, heredado de Qwen2.5-0.5B-Instruct. No se ha entrenado desde cero ni se ha sometido a un fine-tuning adicional documentado: los pesos se obtienen fusionando dos ramas del mismo modelo base mediante TIES (Trim, Elect Sign, Merge), con una mezcla de pesos 0.65/0.35 y una densidad de 0.7. La fusión se ejecutó con mergekit sobre una instancia RunPod con una RTX 3090, según la model card.

El punto técnico central es que un *self-merge* de un modelo consigo mismo no introduce información nueva: el autor lo declara explícitamente y lo respalda con una batería de 8 ítems sobre gobierno, rechazo, instrucción y acuerdo, en la que el modelo obtiene 6/8, idéntico al padre. El autor advierte que n=8 es muy inferior a un tamaño utilizable (30) y que el resultado es solo prueba de pipeline, no una puntuación citable. La receta completa y los pesos están anclados con hashes SHA-256 y una firma Ed25519, lo que constituye el elemento diferencial del artefacto: trazabilidad criptográfica del proceso de fusión. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO para este modelo.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Comportamiento de rechazo (*refusal*) ante peticiones que el modelo padre rechaza, según la batería de 8 ítems reportada por el autor.
- Seguimiento de instrucciones y respuesta a formatos de acuerdo, evaluados en la misma batería reducida.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada; dependen del modelo base.
- Tool calling / function calling: no documentado para este merge.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño de 0,5B limita seriamente esta clase de tareas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Verificación de procedencia: firma Ed25519 y hashes de receta y pesos incluidos en el repositorio.

## Casos de uso

- Validación de pipelines de fusión de modelos: sirve como caso de prueba reproducible para verificar que mergekit ejecuta un TIES merge de extremo a extremo sin degradar los pesos, usando los hashes publicados como referencia de comparación.
- Auditoría de cadena de custodia de artefactos: la firma Ed25519 y los hashes SHA-256 permiten comprobar que un despliegue concreto corresponde exactamente a la receta declarada, útil en entornos con requisitos de procedencia.
- Docencia y formación en MLOps: modelo de 0,5B que cabe en una GPU de consumo y permite demostrar en clase el flujo completo de fusión, firma y verificación sin coste de infraestructura relevante.
- Pruebas de integración en pipelines de CI: al ocupar 1,0 GB en safetensors, puede cargarse en runners modestos para validar código de carga de modelos, tokenizadores y servidores de inferencia antes de pasar a modelos mayores.
- Experimentación con técnicas de merge: punto de partida para comparar TIES frente a otras estrategias (SLERP, DARE, model stock) sobre la misma base, manteniendo constantes el resto de variables.
- Réplica de experimentos de evaluación reducida: la batería de 8 ítems y el resultado 6/8 permiten reproducir la medición y comprobar la afirmación de identidad conductual con el padre, con la advertencia de que la muestra no es estadísticamente significativa.
- Despliegue de bajo coste en tareas triviales de formato o clasificación simple: solo si se acepta que el modelo no aporta ninguna mejora sobre Qwen2.5-0.5B-Instruct, en cuyo caso es más razonable usar directamente el modelo base.

## Benchmarks y rendimiento

El autor reporta una única medición, explícitamente no citable:

| Evaluacion | Resultado | Notas |
|---|---|---|
| Batería de gobierno/rechazo/instrucción/acuerdo (8 ítems) | 6/8 | Idéntico al modelo padre; n=8 frente a un mínimo utilizable de 30 |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB solo para pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 1,5-2 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,5 GB de pesos; en 4 bits, alrededor de 0,25 GB. No se distribuyen ficheros GGUF en el repositorio, por lo que habría que generarlos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100; en estas dos últimas el modelo está infrautilizado.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers con safetensors de forma nativa; vLLM, TGI y llama.cpp/Ollama requerirían conversión o soporte adicional no documentado en el repositorio.
- Latencia y throughput: no disponibles. Por tamaño, la inferencia en una GPU moderna sería del orden de milisegundos por token, pero no hay medición publicada.
- El autor documenta que la fusión se ejecutó en una RTX 3090 en RunPod, lo que confirma que el proceso de merge cabe en 24 GB de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| csoai-merge-v1 | 494M | no disponible (base: 32.768) | Apache 2.0 | Publicado, 6 descargas | Self-merge sin ganancia de capacidad; firma de procedencia |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Apache 2.0 | Modelo base, ampliamente adoptado | Progenitor directo; mismo comportamiento esperado |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540M | 32.768 tokens | Apache 2.0 | Modelo oficial | Mayor capacidad y contexto documentado; opción preferible para uso real |
| SmolLM2-360M-Instruct | 362M | 8.192 tokens | Apache 2.0 | Modelo oficial | Alternativa de tamaño similar para entornos muy restringidos |

La comparación relevante es con el propio modelo base: al no existir ganancia de capacidad declarada, csoai-merge-v1 no ofrece ventaja funcional frente a Qwen2.5-0.5B-Instruct, y su valor se limita a la trazabilidad del proceso de fusión.

## Limitaciones y advertencias

- Sin ganancia de capacidad: el autor declara que un self-merge es conductualmente idéntico al padre por construcción; no debe esperarse mejora alguna en calidad, razonamiento o conocimiento.
- Evidencia empírica insuficiente: la única medición es 6/8 sobre 8 ítems, con n muy inferior al mínimo utilizable de 30; no es una puntuación citable ni extrapolable.
- Model card corregida parcialmente: el autor retiró una sección que afirmaba pertenencia a la flota medida de CSOAI y cifras de un consejo de modelos; el resto de la tarjeta no fue re-verificado en ese cambio, lo que reduce la fiabilidad global de la documentación.
- Riesgo de alucinación: elevado, como corresponde a un modelo de 0,5B; no apto para tareas que requieran precisión factual sin verificación externa.
- Idiomas soportados no declarados: el comportamiento multilingüe depende del modelo base y no está verificado para este merge.
- Contexto no documentado: aunque el modelo base soporta 32.768 tokens, la tarjeta no confirma la ventana efectiva tras la fusión.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ en el repositorio, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y la procedencia firmada no equivale a una certificación de calidad o seguridad.
- Adopción prácticamente nula (6 descargas, 0 likes): no hay validación independiente del artefacto ni reportes de terceros.
- No apto para producción con requisitos de calidad: para cualquier caso de uso real conviene usar directamente Qwen2.5-0.5B-Instruct o un modelo de mayor tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/csoai/csoai-merge-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- mergekit (herramienta de fusión): https://github.com/arcee-ai/mergekit
- Referencia de la técnica TIES: https://arxiv.org/abs/2306.01708
- Panel público de CSOAI citado por el autor (sin relación verificada con este modelo): https://councilof.ai/api/gspc

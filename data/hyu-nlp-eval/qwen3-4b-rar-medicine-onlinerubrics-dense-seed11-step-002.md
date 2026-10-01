# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-002

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-002` es un checkpoint de ajuste fino derivado de `Qwen/Qwen3-4B-Instruct-2507`, publicado por el colectivo HYU-NLP-EVAL. Se trata de un artefacto de investigación más que de un modelo listo para producción: la propia model card lo describe como el paso 2 de un run de entrenamiento identificado como `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, dentro de una línea de trabajo centrada en el dominio médico y en metodologías de "online rubrics" (rúbricas de evaluación en línea durante el entrenamiento). El sufijo "dense" indica que se corresponde con la variante densa del pipeline, no con una arquitectura MoE.

El modelo cuenta con 4.022.468.096 parámetros (~4B) almacenados en safetensors, lo que lo sitúa en la gama de modelos pequeños capaces de ejecutarse en hardware de consumo. El repositorio pesa 25,7 GB porque incluye tanto los pesos BF16 listos para inferencia en la raíz como un subdirectorio `original_checkpoint/` con los ficheros nativos de veRL (solo parámetros del modelo). La licencia declarada es Apache 2.0, aunque la model card matiza explícitamente que el uso previsto es únicamente de investigación.

Su relevancia actual es limitada pero específica: sirve como snapshot intermedio para reproducir o auditar una campaña de ajuste fino orientada a razonamiento médico con recompensas basadas en rúbricas, y permite comparar la evolución del entrenamiento entre pasos. No debe confundirse con un lanzamiento estable: no hay benchmarks publicados, no se declaran idiomas soportados y el propio autor lo marca como "research use only".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (derivada de Qwen3, transformer decoder-only denso) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no declarados por el autor; el repositorio publica pesos en BF16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 (la model card indica "research use only") |
| Formato de pesos | safetensors (raiz, BF16); `original_checkpoint/` con ficheros nativos de veRL |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo parte de `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de tipo denso con aproximadamente 4.000 millones de parametros. El tag `qwen3` y el sufijo `dense` del identificador confirman que no se trata de una variante Mixture-of-Experts. No se especifican en la informacion proporcionada el numero de capas, dimensiones ocultas, mecanismo de atencion ni la longitud de contexto nativa, por lo que esos datos quedan como no disponibles.

En cuanto al entrenamiento, la model card indica que el checkpoint corresponde al "step 2" de un run etiquetado como `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, lo que sugiere una fase 1 de ajuste con rúbricas generadas o evaluadas en linea (`online rubrics`) sobre datos de dominio medico, con una semilla concreta (seed 11) y una configuracion densa. El formato de checkpoint original es de veRL, la libreria de RL para LLMs usada habitualmente en pipelines de RLHF/GRPO. No se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion posteriores. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507 (el tag `conversational` esta presente en el repositorio).
- Ajuste orientado a dominio medico segun el identificador del run (`medicine`, `rar-medicine-onlinerubrics`), aunque no se detallan las tareas concretas cubiertas.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible`, lo que permite desplegarlo mediante Hugging Face TGI y endpoints gestionados.
- Integracion con la libreria `transformers` de Hugging Face.
- Tool calling, function calling, capacidades de agente y modo "thinking": no disponibles en la informacion proporcionada (no confirmados explicitamente para este checkpoint).
- Capacidades de vision, audio o multimodalidad: no disponibles; el pipeline declarado es exclusivamente `text-generation`.
- Soporte multilingue: no disponible; el autor no declara idiomas en la ficha.

## Casos de uso

- Investigacion en ajuste fino medico: el checkpoint permite reproducir o auditar la fase 1 del run `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, comparando el estado del modelo en el paso 2 con pasos posteriores o con el modelo base.
- Estudio de metodologias de "online rubrics": sirve como caso de estudio para analizar como las recompensas basadas en rubricas afectan a un modelo denso de 4B durante el entrenamiento por RL.
- Evaluacion academica comparativa: util para medir la degradacion o mejora respecto a `Qwen/Qwen3-4B-Instruct-2507` en tareas medicas controladas, siempre dentro de un marco de investigacion.
- Prototipado local en hardware de consumo: al ser un modelo de ~4B en BF16, puede ejecutarse en una GPU de gama media-alta para pruebas de concepto sin infraestructura dedicada.
- Generacion de respuestas en dominios clinicos con supervision humana: como asistente de borrador en entornos de investigacion donde un experto revisa cada salida, dado que no hay garantias de precision medica.
- Experimentacion con despliegue via TGI o endpoints compatibles: permite validar pipelines de servicio para modelos pequenos antes de escalar a variantes mayores.
- Base para posteriores ajustes: puede emplearse como punto de partida para nuevos fine-tunings en subespecialidades medicas dentro de entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 8-10 GB para los pesos (~4B parametros x 2 bytes ≈ 8 GB) mas overhead de activaciones y cache KV, por lo que conviene reservar 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4 o similar): aproximadamente 2,5-3 GB.
- GPU recomendadas: para BF16, una RTX 3090, RTX 4090, A10G, L4 o A100 40GB funcionan sin problema; para cuantizacion 4-8 bits basta con una RTX 3060 12GB, RTX 4060 Ti 16GB o incluso GPUs con 8GB en Q4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con al menos 8 GB de VRAM usando cuantizacion, y en GPUs de 12-24 GB incluso en BF16.
- Opciones de despliegue: `transformers` (soporte nativo declarado), `text-generation-inference` (TGI), endpoints compatibles de Hugging Face. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo no documentado por el autor en la informacion disponible. vLLM no aparece confirmado explicitamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependeran fuertemente de la GPU, la cuantizacion y la longitud de contexto efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-002 | ~4B (denso) | no disponible | apache-2.0 (research use only) | Hugging Face, 112 descargas | Checkpoint de investigacion, paso 2 de un run de RL medico |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4B (denso) | no disponible en la informacion proporcionada | apache-2.0 | Hugging Face, ampliamente distribuido | Modelo instruct oficial de la familia Qwen3 |
| Otros modelos de ~4B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos suficientes en la informacion proporcionada |

## Limitaciones y advertencias

- La model card indica explicitamente "Research use only", lo que restringe el uso previsto a investigacion aunque la etiqueta de licencia sea apache-2.0; conviene verificar la compatibilidad con uso comercial antes de cualquier despliegue productivo.
- Se trata de un checkpoint intermedio (paso 2 de un run), no de un modelo final optimizado ni validado; su calidad puede ser inferior a la del modelo base.
- No hay benchmarks publicados, por lo que no existen garantias cuantificadas de rendimiento ni de seguridad.
- Dominio medico: existe un riesgo elevado de alucinacion con consecuencias potencialmente graves; no debe usarse para diagnostico, tratamiento ni asesoramiento clinico sin supervision de un profesional cualificado.
- No se declaran idiomas soportados; el comportamiento fuera del ingles (o de los idiomas efectivamente cubiertos por el base) es incierto.
- No se detalla la longitud de contexto efectiva ni si el ajuste la modifica respecto al modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada; cabe esperar los sesgos heredados del modelo base y del corpus medico empleado.
- El repositorio de 25,7 GB incluye ficheros de checkpoint originales de veRL (solo parametros), que no son necesarios para inferencia y pueden complicar la descarga en entornos con poco espacio.
- Autor con historial limitado (0 likes, 112 descargas) y sin documentacion adicional; la trazabilidad del proceso de entrenamiento es reducida.

## Enlaces

- Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-002
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/HYU-NLP-EVAL
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada (los resultados de busqueda web no contienen enlaces relevantes al modelo).

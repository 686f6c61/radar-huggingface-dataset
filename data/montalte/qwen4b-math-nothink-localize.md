# Montalte/qwen4b-math-nothink-localize

## Resumen

Montalte/qwen4b-math-nothink-localize es un artefacto de fusión de modelos (merge) construido sobre Qwen/Qwen3-4B-Base, publicado por el usuario Montalte. No se trata de un entrenamiento desde cero ni de un fine-tuning convencional, sino del resultado de aplicar una técnica de merging denominada "localize" (Plan B Localize-and-Stitch) sobre una validación MergeBench en modo source-only. El objetivo declarado es servir como artefacto unificado para experimentos de transferencia direccional entre los dominios de matemáticas y código.

El modelo tiene 4.022.468.096 parámetros (4,02 B) en formato safetensors, ocupa 8,1 GB en el repositorio y se distribuye bajo licencia Apache-2.0. Deriva del modelo especialista `modrill/math-nothink-q4b-20260908`, con dominio declarado "math" y modo "nothink" (sin bloque de razonamiento explícito). Los tags lo etiquetan además como conversacional y compatible con text-generation-inference y endpoints.

Es relevante ahora porque forma parte de una línea de experimentos sobre técnicas de model merging aplicadas a modelos pequeños de la familia Qwen3, un área activa en la investigación de reutilización y combinación de capacidades sin reentrenamiento completo. Al ser un artefacto de investigación con cero descargas y cero likes en el momento de redactar esta ficha, debe tratarse como material experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3); artefacto de fusión de modelos (merge), no entrenado desde cero |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (heredada de Qwen/Qwen3-4B-Base) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo no se entrena: es el resultado de una operación de merging sobre Qwen/Qwen3-4B-Base (commit `906bfd4b4dc7f14ee4320094d8b41684abff8539`). La arquitectura subyacente es la de Qwen3-4B-Base, un transformer decoder-only de 4,02 B de parámetros. El autor declara como modelo especialista de origen `modrill/math-nothink-q4b-20260908`, con dominio "math" y modo "nothink".

El método aplicado, etiquetado como "localize", corresponde a "Plan B Localize-and-Stitch" ejecutado sobre validación MergeBench en modo source-only. Los hiperparámetros declarados son: objetivo de sparsity (keep) de 0.1, learning rate 1e7, 10 épocas, n-shot=64, semilla 42 y mask-profile `plan_b`. La tarea objetivo es `math`. Las capas de embedding y `lm_head` quedan excluidas de la máscara, de modo que la operación de stitch se aplica solo al cuerpo del modelo ("body-only stitch"), siguiendo el protocolo Plan B previo. No se documentan datos de entrenamiento adicionales (número de tokens, composición del dataset) ni etapas de RLHF/DPO, dado que no hay entrenamiento en el sentido habitual.

## Capacidades

- Generación de texto conversacional, según los tags del repositorio (`conversational`, `text-generation`).
- Especialización declarada en matemáticas, derivada del modelo especialista de origen y de la tarea `math` usada en el proceso de localize.
- Modo "nothink": el modelo está configurado para operar sin el bloque de razonamiento explícito característico de los modelos Qwen3 en modo thinking.
- Compatibilidad declarada con text-generation-inference y con endpoints (tags `text-generation-inference` y `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, uso de agentes, visión, audio ni multilingüismo en la información disponible.
- No se documenta ningún benchmark que permita verificar el grado real de retención de capacidades matemáticas tras el merge.

## Casos de uso

- Experimentación en model merging: el modelo sirve como artefacto de referencia para reproducir o comparar la técnica Plan B Localize-and-Stitch sobre Qwen3-4B-Base, con hiperparámetros concretos documentados (sparsity 0.1, lr 1e7, 10 épocas, seed 42).
- Investigación en transferencia entre dominios: al estar orientado a transferencia direccional math↔code, encaja en estudios sobre hasta qué punto una capacidad matemática puede trasladarse a tareas de código y viceversa.
- Evaluación de modelos pequeños en matemáticas: con 4,02 B de parámetros y licencia Apache-2.0, es adecuado para montar pipelines de evaluación comparativa frente a Qwen3-4B-Base y otros derivados.
- Generación matemática sin razonamiento explícito: en escenarios donde se prefiere una respuesta directa sin cadena de pensamiento visible, el modo nothink puede reducir latencia de generación frente a variantes con thinking.
- Fine-tuning posterior como punto de partida: al ser un merge sobre una base Apache-2.0, puede usarse como checkpoint inicial para ajustes específicos de dominio, siempre que se validen previamente sus capacidades.
- Despliegue en entornos con recursos limitados: con 4,02 B de parámetros cabe en GPUs de gama consumer, lo que permite prototipado local antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica conviene reservar 10-12 GB.
- VRAM estimada en INT8: del orden de 4-5 GB, asumiendo una cuantización de 8 bits.
- VRAM estimada en INT4: del orden de 2,5-3,5 GB, asumiendo una cuantización de 4 bits.
- GPUs profesionales: A100, H100 y L40S son suficientes con margen amplio para FP16.
- GPUs consumer: cabe en RTX 3090, RTX 4090, RTX 4080 y similares con 16-24 GB en FP16; en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3070) es recomendable cuantizar.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag explícito) y vLLM. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se proporciona en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| Montalte/qwen4b-math-nothink-localize | 4,02 B | No disponible en la model card | Apache-2.0 | Merge (localize) sobre Qwen3-4B-Base | 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Base | 4,02 B | No disponible en la informacion proporcionada | Apache-2.0 | Modelo base preentrenado | Modelo de referencia de la familia Qwen3 |
| Qwen/Qwen3-4B (variante instruct) | 4,02 B | No disponible en la informacion proporcionada | Apache-2.0 | Modelo instruct ajustado | Modelo de referencia de la familia Qwen3 |
| modrill/math-nothink-q4b-20260908 | No disponible | No disponible | No disponible | Especialista de origen del merge | Citado en la model card; sin detalles publicos |

Al no haber benchmarks publicados para el modelo fusionado, la comparativa se limita a parámetros, licencia y procedencia; no es posible comparar rendimiento con cifras.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita verificar que el merge conserva o mejora las capacidades matemáticas del especialista de origen.
- Riesgo de regresión por merging: las técnicas de stitch con máscaras sobre el cuerpo del modelo pueden degradar capacidades no cubiertas por la tarea objetivo (`math`), especialmente si el objetivo de sparsity 0.1 reduce en exceso las actualizaciones.
- Exclusión de `embed` y `lm_head` de la máscara: el stitch es body-only, por lo que cualquier desplazamiento en las representaciones de entrada/salida no se corrige y puede introducir inconsistencias.
- Modo nothink: el modelo no incorpora razonamiento explícito, lo que puede reducir su fiabilidad en problemas matemáticos que requieren varios pasos.
- Idiomas: no se declara ninguna lista de idiomas soportados; no hay garantía de comportamiento multilingüe más allá de lo heredado de Qwen3-4B-Base.
- Sin información de sesgos ni de alineación: no se documentan etapas de RLHF/DPO ni evaluaciones de seguridad, por lo que el riesgo de alucinación y de contenido sesgado no está caracterizado.
- Licencia: Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar las condiciones del modelo base y del especialista de origen.
- Madurez: con cero descargas y cero likes, es un artefacto de investigación recién publicado (11 de septiembre de 2026), sin validación comunitaria.
- Cuantizaciones: al no publicarse GGUF ni formatos cuantizados, cualquier despliegue en entornos de bajos recursos exige conversión y validación propias.

## Enlaces

- HuggingFace: https://huggingface.co/Montalte/qwen4b-math-nothink-localize
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Modelo especialista de origen (citado en la model card): `modrill/math-nothink-q4b-20260908` (sin URL pública verificado en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.

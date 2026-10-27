# Nestleshuffle/Swift1.5-Qwen3.8-Flash-Next-oQ4e-fp16-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ4e-fp16-mtp es una cuantización de 4 bits del modelo multimodal ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario Nestleshuffle. El artefacto se ha generado con oQ (oMLX v0.7.0), la herramienta de cuantización de precisión mixta del proyecto oMLX, y se distribuye en formato MLX safetensors para su ejecución sobre Apple Silicon. El pipeline declarado es image-text-to-text, por lo que el modelo acepta imagen y texto como entrada y genera texto.

El modelo base pertenece a la familia Qwen (el campo `model_type` de la model card es `qwen4_exp`) y, según los metadatos de safetensors, contiene 179.999.981.459 parámetros, es decir, aproximadamente 180.000 millones. El repositorio ocupa 107,2 GB, coherente con un peso de 4 bits sobre 180B de parámetros más las escalas de grupo (group size 64) y los componentes que se conservan en fp16. No se documenta el número de parámetros activos, la longitud de contexto ni la composición del dataset de entrenamiento original.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de cuantización con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica más allá de los parámetros de cuantización. Su interés práctico reside en permitir ejecutar un modelo multimodal de 180B en hardware de Apple con memoria unificada grande, algo inviable con los pesos en bf16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model_type` de la model card es `qwen4_exp`; no se documenta si es transformer denso, MoE o híbrido) |
| Parametros totales | 179.999.981.459 (~180B), según metadatos de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, precisión mixta (oQ, oMLX v0.7.0), group size 64; componentes en fp16 según el nombre del repositorio (`fp16-mtp`), sin detallar en la model card |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (campo `license: other`, con enlace al fichero LICENSE del modelo base) |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. La model card del repositorio cuantizado se limita a documentar el proceso de cuantización y no describe el tipo de red, el mecanismo de atención ni si emplea mezcla de expertos. El identificador `qwen4_exp` y el nombre del modelo base (`Swift1.5-Qwen3.8-Flash-Next`) apuntan a un derivado de la familia Qwen, pero no se aporta ninguna confirmación técnica sobre la topología. Tampoco se documenta el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento.

Lo único verificable es el proceso de cuantización: se aplicó cuantización de precisión mixta con oQ (oMLX v0.7.0) a 4 bits con group size 64, generando pesos en formato MLX safetensors. El sufijo `mtp` del nombre del repositorio sugiere la presencia de un módulo de predicción multi-token, y `fp16` indica que ese componente se habría conservado en media precisión, pero la model card no detalla qué capas quedan fuera de la cuantización de 4 bits ni los criterios de asignación de precisión.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen + texto), según el pipeline declarado `image-text-to-text`.
- Comprensión de imágenes integrada en la conversación, con pipeline conversacional (`conversational` en los tags).
- Razonamiento y generación de texto en lenguaje natural: capacidad esperable por el tamaño del modelo, aunque no verificada con benchmarks en la información disponible.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible; el campo de idiomas no está informado.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Procesamiento de documentos escaneados en local: el modelo puede recibir la imagen de una factura o un contrato y devolver texto estructurado en JSON, sin enviar el documento a una API externa. Es adecuado por su naturaleza image-text-to-text y porque la cuantización de 4 bits permite ejecutarlo en una estación de trabajo Apple con memoria unificada amplia.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo en un CMS o catálogo de imágenes, procesando lotes de forma secuencial sobre hardware local.
- Revisión de capturas de interfaz en control de calidad: análisis de screenshots de una aplicación para detectar textos truncados, elementos fuera de pantalla o inconsistencias visuales en pipelines de prueba.
- Extracción de datos de gráficos y tablas: conversión de figures de informes técnicos o papers en series de datos textuales, útil en flujos de investigación documental.
- Prototipado de agentes multimodales con requisitos de privacidad: al ejecutarse en MLX sobre hardware propio, permite experimentar con un VLM de 180B en entornos donde los datos no pueden salir de la organización.
- Evaluación comparativa de cuantizaciones en investigación: servir como referencia de un modelo grande en 4 bits frente al base en bf16, para medir la degradación introducida por la cuantización mixta de oQ.
- Moderación de contenido asistida por imagen: clasificación y descripción de imágenes subidas por usuarios, con revisión humana posterior, siempre que se validen previamente los sesgos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, ni compara la cuantización con el modelo base en precisión original. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- Peso de los pesos en disco: 107,2 GB de repositorio. Con 180B de parámetros a 4 bits, el peso nominal de los tensores es de unos 90 GB, a los que se suman las escalas y puntos cero de los grupos de 64 elementos (en torno a 11 GB) y los componentes conservados en fp16.
- Memoria unificada necesaria: hay que prever al menos los ~107 GB de pesos más la caché KV, cuyo tamaño depende de la longitud de contexto (no documentada). Un sistema con 128 GB de memoria unificada queda muy justo o es insuficiente; 192 GB o más es el rango razonable.
- Equipos recomendados: Mac Studio con M3 Ultra y 512 GB de memoria unificada, o configuraciones de 192-256 GB. Un MacBook Pro con M4 Max de 128 GB no ofrece margen suficiente para un uso conversacional con contexto largo.
- GPU NVIDIA: el formato MLX safetensors no es cargable directamente por vLLM, TGI, llama.cpp ni Ollama; sería necesaria una conversión previa a otro formato, no documentada por el autor. No hay GGUF publicado en este repositorio.
- Opciones de despliegue: mlx-lm (para el componente de texto) y mlx-vlm (para el pipeline image-text-to-text), o el propio tooling de oMLX. No se dispone de instrucciones de despliegue en la model card.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas comparables en la información proporcionada. La única comparación posible es con el modelo del que deriva:

| Modelo | Parámetros | Cuantización | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nestleshuffle/Swift1.5-Qwen3.8-Flash-Next-oQ4e-fp16-mtp | ~180B | 4 bits, precisión mixta (oQ), group size 64 | MLX safetensors | no disponible | swift-open-license-1.0 | 0 descargas, 0 likes |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | ~180B (según el derivado) | Precisión original (no confirmada) | no disponible | no disponible | swift-open-license-1.0 | Modelo de referencia del autor original |

No se han identificado en la información proporcionada otros VLM abiertos de escala similar con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre la degradación de calidad introducida por la cuantización de 4 bits respecto al modelo base.
- Documentación mínima: la model card no describe arquitectura, contexto, idiomas, dataset ni método de alineamiento, lo que impide evaluar el modelo con rigor antes de desplegarlo.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se ha publicado ninguna evaluación de fidelidad factual ni de tasas de alucinación.
- Sesgos: no documentados. Al no conocerse la composición del corpus de entrenamiento, no es posible anticipar sesgos de género, idioma, cultura o geografía.
- Idiomas: el campo de idiomas no está informado; conviene validar empíricamente el rendimiento en castellano antes de usarlo en producción.
- Licencia: `swift-open-license-1.0` está registrada como `license: other`. No es una licencia OSI estándar y las condiciones de uso comercial deben verificarse en el fichero LICENSE del modelo base antes de cualquier despliegue productivo.
- Dependencia de hardware: los pesos en formato MLX quedan restringidos en la práctica a Apple Silicon; no hay GGUF ni safetensors estándar publicados en este repositorio.
- Trazabilidad: el autor del repositorio es un particular (Nestleshuffle) sin historial verificable, con 0 descargas y 0 likes; no hay garantía de mantenimiento ni de actualizaciones.
- Contexto y caché KV: al no documentarse la longitud de contexto, el dimensionado de memoria para producción es incierto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Nestleshuffle/Swift1.5-Qwen3.8-Flash-Next-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx

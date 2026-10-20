# BlameOmar/zeta-2.1-oQ8e-fp16

## Resumen

zeta-2.1-oQ8e-fp16 es un checkpoint cuantizado publicado por el usuario BlameOmar en HuggingFace. No es un modelo entrenado desde cero, sino una requantización de un modelo base cuya identidad no se declara en la model card: el repositorio solo indica que los pesos se han reprocesado con oMLX v0.7.1 mediante el método oQ de cuantización de precisión mixta. El tag `llama` sugiere una arquitectura de la familia Llama, pero el autor no especifica de qué modelo concreto deriva.

El checkpoint contiene 8.250.462.208 parámetros (8,25 B) almacenados con una media efectiva de 8,500 bits por peso. El 99,997 % de los pesos usa cuantización afín de 8 bits con group size 64 y el 0,003 % restante se mantiene en FP16. El resultado ocupa 8.164 GiB (8,766 GB), lo que reduce el peso en disco aproximadamente a la mitad frente a los ~16,5 GB que requeriría el mismo modelo en FP16.

La relevancia práctica es acotada y muy específica: es un artefacto para ejecutar un modelo de ~8 B en Apple Silicon con el framework MLX, con un coste de memoria que encaja en equipos con 16 GB de memoria unificada. Ahora bien, el repositorio no declara licencia, idiomas, longitud de contexto, modelo base ni resultados de benchmarks, y acumula 0 descargas y 0 likes, por lo que su evaluación en producción exige verificación adicional por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según el tag `llama` del repositorio); arquitectura del modelo base no detallada en la model card |
| Parámetros totales | 8.250.462.208 (8,25 B) |
| Parámetros activos | No disponible; la model card no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Afín 8 bits con group size 64 (99,997 % de los pesos) + FP16 (0,003 %); media efectiva 8,500 bits/peso; formato oQ de oMLX v0.7.1 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |
| Modelo base | No disponible (no declarado por el autor) |
| Tamaño del repositorio | 8,8 GB |
| Almacenamiento de pesos | 8.164 GiB / 8,766 GB |
| Fecha de publicación | 2026-10-20 (creado y actualizado el mismo día) |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla la arquitectura interna (número de capas, dimensiones, tipo de atención o vocabulario), más allá del tag `llama` que sitúa la familia arquitectónica en el linaje Llama. Cualquier afirmación sobre capacidades heredadas del modelo original es, por tanto, una inferencia y no un dato documentado.

Lo que sí está documentado es el proceso de cuantización. Se ha aplicado oQ, el método de cuantización de precisión mixta implementado en oMLX v0.7.1, que asigna bits por capa o por tensor en lugar de usar una precisión uniforme. En este checkpoint la práctica totalidad de los pesos (8,250 B lógicos, 99,997 %) queda en cuantización afín de 8 bits con grupos de 64 elementos, mientras que un remanente de 0,000 B lógicos (0,003 %) se conserva en FP16, presumiblemente para proteger tensores sensibles a la precisión. El resultado son 8.164 GiB de almacenamiento para el componente de lenguaje, que es el único que contiene el repositorio. El autor advierte de que el modelo se recuantizó el 2026-10-20 con oMLX v0.7.1 y recomienda volver a descargarlo si se tenía una copia anterior, lo que implica que existió al menos una versión previa con distinto mapeo de bits.

## Capacidades

- Generación de texto: el checkpoint contiene exclusivamente un componente de lenguaje de 8,25 B de parámetros; no se documentan cabeceras ni componentes adicionales de visión, audio u otras modalidades.
- Razonamiento, código y matemáticas: no documentados en la model card. La model card no incluye ninguna evaluación cualitativa ni cuantitativa de estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Ejecución en Apple Silicon: capacidad operativa confirmada por el formato (MLX + safetensors), independientemente de las capacidades cognitivas del modelo.

## Casos de uso

- Inferencia local en Mac con 16 GB de memoria unificada: con 8.164 GiB de pesos, el modelo deja margen para caché KV y el propio runtime de MLX en equipos de 16 GB, lo que permite ejecutar un modelo de 8 B en un portátil sin GPU dedicada.
- Evaluación comparativa de cuantización: sirve para medir la degradación de calidad de una cuantización afín de 8 bits con group size 64 frente al mismo modelo en FP16, usando `mlx_lm` para generar con ambas variantes y comparar salidas sobre un conjunto fijo de prompts.
- Asistente de texto offline: prototipos de chat o resumen de documentos que no pueden enviar datos a la nube, aprovechando que todo el pipeline corre en local sobre Metal.
- Procesamiento por lotes en un Mac Studio: tareas de clasificación, extracción o reescritura sobre corpus de documentos ejecutadas con `mlx_lm.generate` en modo batch, donde el coste por token es cero una vez amortizado el hardware.
- Base para ajuste fino con LoRA: al ser un checkpoint de 8 bits en MLX, se puede usar como punto de partida para adaptadores LoRA de bajo rango con `mlx_lm.lora`, siempre que la licencia del modelo base lo permita (dato no disponible).
- Servicio HTTP interno en red local: exposición mediante el servidor compatible con OpenAI que incluye `mlx_lm.server`, para conectar herramientas internas de desarrollo a un endpoint local sin coste de API.
- Verificación de procedencia en cadena de suministro de modelos: caso de uso meta, útil para testear herramientas de escaneo de artefactos (detección de modelo base, licencia y huella de cuantización) sobre un repositorio con metadatos incompletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y tampoco se aportan datos de latencia o throughput. Cualquier cifra de rendimiento tendría que medirse localmente.

## Requisitos de hardware

- VRAM/memoria para inferencia: 8.164 GiB solo de pesos en el formato cuantizado. El modelo completo sin cuantizar equivaldría a unos 16,5 GB en FP16 (cálculo derivado de 8,25 B × 2 bytes), que no está incluido en el repositorio.
- Caché KV: no estimable, porque la longitud de contexto y la configuración de atención no están documentadas.
- Cabe en GPU de consumo: sí, en el sentido de memoria. Al ser un formato MLX, el destino natural son equipos Apple Silicon con memoria unificada de 16 GB o más (M1/M2/M3/M4 en configuraciones de 16, 24, 32 o 64 GB). En GPUs NVIDIA no se puede cargar directamente: requiere conversión previa a otro formato.
- GPU recomendadas: Apple M-series con memoria unificada ≥16 GB. Para 32 GB o más se puede plantear contexto largo o batch mayor, aunque el límite real depende de la ventana de contexto, que se desconoce.
- Opciones de despliegue: `mlx_lm` (CLI `mlx_lm.generate` y `mlx_lm.server`), API de Python de MLX, integración con LM Studio o similar si soportan el formato. vLLM, TGI y llama.cpp no cargan pesos MLX de forma nativa; convertir a GGUF es posible en teoría, pero no está documentado para este checkpoint.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no se puede extrapolar sin conocer la arquitectura exacta y el hardware de referencia.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la información disponible. La tabla siguiente usa como referencia externa la familia Llama 3.1 8B, un modelo de tamaño similar ampliamente conocido, únicamente para contextualizar; no implica que zeta-2.1 derive de él.

| Modelo | Parámetros | Contexto | Precisión de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeta-2.1-oQ8e-fp16 | 8,25 B | No disponible | 8,5 bits/peso efectivos (oQ, MLX) | No disponible | HuggingFace, MLX, 0 descargas |
| Llama 3.1 8B (referencia externa) | 8,03 B | 128.000 tokens | FP16 / BF16 (cuantizaciones comunitarias aparte) | Llama 3.1 Community License | Muy extendida, múltiples formatos |
| Otros checkpoints MLX de ~8 B | No disponible | No disponible | Variables (4-8 bits) | Depende del modelo base | Comunidad `mlx-community` |

La comparación de rendimiento no es posible: no hay benchmarks publicados de este checkpoint ni se ha declarado el modelo base sobre el que se podría establecer una correspondencia.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial. En la práctica equivale a "todos los derechos reservados" hasta que el autor lo aclare, y además la licencia del modelo base (desconocido) podría imponer condiciones adicionales.
- Modelo base no identificado: no se puede verificar la procedencia de los pesos ni trazar obligaciones de atribución. Es el riesgo más serio del repositorio para cualquier uso en producción.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en ninguna tarea. Cualquier afirmación sobre su utilidad debe validarse empíricamente.
- Idiomas no declarados: se desconoce si el modelo tiene competencia real en castellano o si está limitado al inglés.
- Contexto desconocido: no se puede planificar arquitectura de aplicación (RAG, conversaciones largas) sin conocer la ventana máxima ni su comportamiento más allá de ella.
- Degradación por cuantización: la cuantización afín de 8 bits con group size 64 introduce error frente a FP16, especialmente en tareas de razonamiento matemático y código. La magnitud no está medida en este checkpoint.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de esta escala; no hay evaluación de fidelidad ni de tasas de alucinación.
- Dependencia de plataforma: los pesos están en formato MLX, lo que ata el despliegue a hardware Apple. Migrar a NVIDIA exige conversión y revalidación.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta. No hay validación por parte de la comunidad ni informes de terceros.
- Versionado inestable: el autor ya ha recuantizado el modelo una vez y avisa de que hay que volver a descargarlo; conviene fijar el commit exacto si se usa como dependencia.
- Ausencia de pipeline declarado: el campo `pipeline` está vacío, de modo que el Hub no lo clasifica en ninguna tarea concreta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BlameOmar/zeta-2.1-oQ8e-fp16
- Repositorio de oMLX / oQ (método de cuantización citado por el autor): https://github.com/jundot/omlx
- Paper, blog o demo del modelo: no disponible
- Resultados de benchmarks: no disponible

Nota: las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo; los enlaces encontrados no guardan relación con el repositorio y se han descartado.

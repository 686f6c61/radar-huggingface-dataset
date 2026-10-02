# rawmodels/Qwen3.8-27B-antislop-pangram-grpo-GGUF

## Resumen

Qwen3.8-27B-antislop-pangram-grpo-GGUF es una conversión a formato GGUF (cuantización Q4_K_M) del checkpoint rawmodels/Qwen3.8-27B-antislop-pangram-grpo, un modelo de generación de texto de 27.320.697.856 parámetros (~27,3 B) publicado por el usuario rawmodels en HuggingFace. El repositorio no es un modelo nuevo entrenado desde cero, sino una versión cuantizada de una etapa concreta de un pipeline de alineación: la fase intermedia de GRPO del proyecto "pangram-GRPO". El propio autor indica que existe un checkpoint posterior ("semdiv") con su propio repositorio GGUF, por lo que esta ficha describe una instantánea concreta y no la versión más reciente del linaje.

El interés técnico del repositorio está en dos elementos poco habituales en una publicación de cuantización: por un lado, incluye el proyector multimodal en F16 y la importance matrix (imatrix) empleada para calcular la cuantización; por otro, conserva la cabeza de multi-token prediction (MTP) del modelo original almacenada como `blk.64.nextn.*` con el metadato `qwen35.nextn_predict_layers=1`, lo que permite usar decodificación especulativa con llama.cpp reciente mediante `--spec-type draft-mtp --spec-draft-n-max 2`. El autor advierte de que esa cabeza no se entrenó en esta etapa de GRPO, por lo que su rendimiento puede diferir del de los checkpoints posteriores.

Se trata, en palabras del propio autor, de un "modelo de investigación en alineación, no un filtro de seguridad". El repositorio declara los idiomas inglés y ruso, no especifica licencia y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, con un tamaño total de 17,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada de forma explícita en la model card. El nombre y la clave de metadatos `qwen35.nextn_predict_layers=1` apuntan a un transformer decoder de la familia Qwen con cabeza de multi-token prediction (MTP) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No especificada en la model card. El ejemplo de servicio usa `-c 4096` |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada en este repositorio). El proyector multimodal se distribuye en F16. Se menciona un GGUF bf16 de referencia usado para medir fidelidad |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | No disponible |
| Formato de pesos | GGUF (librería `gguf`), con importance matrix incluida |
| Modelo base | rawmodels/Qwen3.8-27B-antislop-pangram-grpo |
| Tamano del repositorio | 17,8 GB |
| Proyector multimodal | mmproj en F16 (multimodal projector) |
| Fecha de publicacion | 2026-10-02 (creación), 2026-10-02 (última actualización) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base. Los únicos indicios técnicos son su denominación ("Qwen3.8-27B") y la clave de metadatos MTP `qwen35.nextn_predict_layers=1`, que describe una única capa de predicción adicional (next-N) respecto de la cabeza autorregresiva estándar. La cabeza se almacena en el GGUF bajo el prefijo `blk.64.nextn.*`, lo que sugiere que el tensor de la cabeza ocupa la posición 64 del grafo. El repositorio incluye además un proyector multimodal F16, lo que implica que el pipeline original contempla entrada de imágenes, aunque la model card no describe la torre de visión ni el número de tokens de contexto.

En cuanto al entrenamiento, lo único verificable es que este checkpoint corresponde a una etapa de GRPO (Group Relative Policy Optimization, un método de RL con preferencias) dentro de un pipeline denominado "antislop pangram". La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases previas de SFT o DPO. El autor señala explícitamente que la cabeza MTP no se entrenó durante esta etapa de GRPO, de modo que su uso para decodificación especulativa es experimental en este checkpoint. La conversión a GGUF se realizó con una importance matrix propia, y el autor publica métricas de fidelidad de la cuantización (véase la sección de benchmarks) en lugar de métricas de capacidad.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `text-generation` y `conversational`, con pipeline de generación de texto.
- Entrada multimodal: el repositorio incluye un proyector multimodal F16 (`mmproj-...-F16.gguf`) que se carga con `llama-server --mmproj`. La model card no detalla qué modalidades cubre más allá de indicar que puede omitirse para servir solo texto.
- Decodificación especulativa con MTP: soporta `--spec-type draft-mtp --spec-draft-n-max 2` en builds recientes de llama.cpp, usando la cabeza MTP conservada como `blk.64.nextn.*`.
- Idiomas: inglés y ruso, según el campo `language` de la model card.
- Etiquetas declaradas: `antislop`, `grpo`, `mtp`, `imatrix`, `endpoints_compatible`. El autor no documenta explícitamente en la model card qué significa "antislop" en términos de comportamiento, ni el papel del componente "pangram".
- Tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Modo "thinking" u otros modos especiales: no disponible (no se menciona).

## Casos de uso

- Servicio local de chat en una sola GPU de 24 GB: gracias a la cuantización Q4_K_M (~17-18 GB de pesos) el modelo puede servirse con `llama-server -ngl 99 -c 4096`, lo que permite montar un endpoint de conversación en una estación de trabajo con RTX 4090 sin depender de la nube.
- Investigación en alineación y RLHF/GRPO: al ser un checkpoint intermedio de un pipeline de GRPO, es adecuado para estudiar el efecto de cada etapa de alineación comparando este checkpoint con el base y con la etapa posterior "semdiv", que tiene su propio repositorio GGUF.
- Evaluación del impacto de la cuantización en el comportamiento: el repositorio publica la importance matrix y métricas de fidelidad (KL media 0,0114, coincidencia top-1 del 95,38 % frente a bf16), lo que lo convierte en un caso de estudio reproducible para medir deriva de cuantización en modelos de ~27 B.
- Prototipado de decodificación especulativa con MTP: permite experimentar con `--spec-type draft-mtp --spec-draft-n-max 2` en llama.cpp y medir la ganancia de throughput de una cabeza MTP no reentrenada frente a decodificación estándar.
- Aplicaciones bilingües inglés-ruso: al declarar ambos idiomas, encaja en productos de atención al cliente o generación de contenido para mercados de habla inglesa y rusa, siempre que se validen las capacidades reales del checkpoint.
- Pruebas de detección de texto generado: el componente "pangram" del nombre remite a un detector comercial de texto sintético, por lo que el modelo puede emplearse en experimentos internos de robustez frente a detectores, entendiendo que la model card no documenta el objetivo exacto de esa fase.
- Despliegue de bajo coste en endpoints compatibles: la etiqueta `endpoints_compatible` indica que el artefacto está pensado para servirse en infraestructuras de inferencia compatibles con GGUF, útil para entornos de staging con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo proporciona métricas de fidelidad de la cuantización y una comparación con la API Pangram v3:

| Metrica | Valor | Condiciones |
|---|---|---|
| KL media (Q4_K_M frente a bf16) | 0,0114 | Comparación con teacher forcing sobre respuestas reservadas |
| Coincidencia de token top-1 | 95,38 % | Misma comparación |
| Delta de logit en Pangram v3 API | +0,02 ± 0,38 | 24 preguntas, cuatro respuestas puntuadas por pregunta, ejecución emparejada anterior |

El propio autor advierte de que los resultados de la API Pangram obtenidos en fechas distintas no son directamente comparables y que las cifras anteriores describen únicamente esa ejecución emparejada concreta.

## Requisitos de hardware

- VRAM para los pesos: el repositorio ocupa 17,8 GB e incluye pesos Q4_K_M, proyector multimodal F16 e importance matrix. Como estimación, los pesos Q4_K_M de un modelo de 27,3 B rondan los 16-18 GB; el proyector multimodal F16 añade una cantidad no especificada, probablemente inferior a 1 GB.
- VRAM para caché KV: no disponible. El ejemplo de servicio usa `-c 4096`, contexto modesto que mantiene la caché KV en el rango de 1-2 GB en función del número de capas y cabezas KV, dato que la model card no publica.
- GPU consumer: con ~24 GB de VRAM (RTX 4090, RTX 3090, RTX 4080 de 16 GB quedaría justa o requeriría descarga parcial de capas) es plausible servir el modelo a contexto 4096 con `-ngl 99`. Es una estimación, no un dato publicado.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten servir el modelo con contexto amplio y margen para batching.
- Opciones de despliegue: `llama-server`/`llama.cpp` es la ruta documentada explícitamente por el autor, incluido el flag `--spec-type draft-mtp` para decodificación especulativa. Otros runners compatibles con GGUF (Ollama, LM Studio) no se mencionan en la model card.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de aceleración obtenida con la cabeza MTP.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con modelos externos de la misma categoria, por lo que no se pueden aportar cifras de terceros. La única comparación posible es interna al propio linaje:

| Version | Formato | Parametros | Notas |
|---|---|---|---|
| rawmodels/Qwen3.8-27B-antislop-pangram-grpo | Pesos completos (bf16) | 27,3 B | Checkpoint de referencia de la etapa GRPO; usado como patrón para medir fidelidad |
| rawmodels/Qwen3.8-27B-antislop-pangram-grpo-GGUF (este repositorio) | GGUF Q4_K_M + mmproj F16 + imatrix | 27,3 B | Instantánea temprana; incluye cabeza MTP no entrenada en esta etapa |
| Checkpoint posterior "semdiv" | GGUF (repositorio propio) | No disponible | El autor indica que tiene su propio repositorio GGUF y que el rendimiento MTP puede diferir |

Comparativa con alternativas de otras familias (por ejemplo, otros modelos GGUF de ~27-32 B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia en el repositorio, no hay autorización explícita para uso comercial. Debe contactarse con el autor antes de cualquier despliegue en producción.
- Modelo de investigación en alineación: el autor afirma literalmente que "es un modelo de investigación en alineación, no un filtro de seguridad". No debe usarse como capa de moderación ni asumirse que sus salidas son seguras, sesgadas de forma controlada o adecuadas para públicos sensibles.
- Naturaleza intermedia del checkpoint: corresponde a una etapa de GRPO previa a la versión "semdiv", que el propio autor sitúa como posterior. Los resultados obtenidos con esta cuantización no son extrapolables a los checkpoints más recientes del linaje.
- Cabeza MTP no entrenada en esta etapa: la model card indica explícitamente que la cabeza de multi-token prediction no se entrenó durante este GRPO, de modo que la decodificación especulativa con `--spec-type draft-mtp` puede degradar la calidad o no aportar aceleración.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al no publicarse benchmarks de capacidad ni evaluaciones de veracidad, debe asumirse un riesgo estándar en modelos de esta escala y validarse por tarea.
- Cobertura de idiomas limitada: solo inglés y ruso. No hay soporte declarado de castellano, por lo que su uso en español puede degradar la calidad de forma no medida.
- Sesgos conocidos: no disponibles. La model card no documenta ninguna evaluación de sesgo, toxicidad o sesgo de género, político o cultural.
- Longitud de contexto no especificada: se desconoce el máximo entrenado. El ejemplo de servicio usa 4096 tokens, y forzar contextos mayores sin datos del fabricante puede provocar degradación.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin documentación del dataset ni del proceso de entrenamiento. La reproducibilidad del pipeline completo no está garantizada.
- La búsqueda web realizada para esta ficha no devolvió resultados relevantes sobre el modelo; toda la informacion procede de HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-pangram-grpo-GGUF
- Checkpoint base (etapa GRPO, pesos completos): https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-pangram-grpo
- Modelo base referenciado en la model card: rawmodels/Qwen3.8-27B-antislop-pangram-grpo (enlazado en el README del repositorio)
- Papers, blogs, repositorios o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo)

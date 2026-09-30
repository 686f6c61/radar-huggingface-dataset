# mdagosta/waldito-python-basics-v1-r0001-u0-mdagosta-b

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0001-u0-mdagosta-b` es un checkpoint de generación de texto de tamaño muy reducido (9.541.632 parámetros, aproximadamente 9,5 millones) publicado por el usuario `mdagosta` en HuggingFace. Según su model card, se trata de una exportación bajo el paraguas "OpenWALDO model export" que emplea la arquitectura estándar de modelo causal tipo Llama de la librería Transformers, acompañada de un tokenizador de bytes propio denominado "schema-1", que obliga a cargar el tokenizador con `trust_remote_code=True`.

El identificador sugiere una revisión (`r0001`), una unidad de entrenamiento (`u0`) y un propósito de aprendizaje de fundamentos de Python (`python-basics`), aunque la model card no documenta ni confirma el dataset, el procedimiento de entrenamiento ni el objetivo declarado. El repositorio no incluye licencia, idiomas ni resultados de evaluación en los metadatos disponibles, y registra cero descargas y cero "likes" en el momento de la consulta.

Su relevancia es limitada y muy específica: se trata de un artefacto de investigación o de un ejercicio de entrenamiento a pequeña escala, interesante para estudiar pipelines de exportación con tokenizadores de bytes personalizados y para pruebas de integración en infraestructura de inferencia, no como modelo de producción. Cualquier evaluación de capacidades reales requeriría ejecutar el modelo y validar su comportamiento, ya que no hay benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (librería Transformers, `pipeline_tag: text-generation`) |
| Parametros totales | 9.541.632 (dato real, safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos en `transformers`); no se listan otros formatos en los metadatos disponibles |
| Tokenizador | OpenWALDO schema-1, tokenizador de bytes; requiere `trust_remote_code=True` |
| Repositorio | 0,0 GB, 0 descargas, 0 likes (en la fecha de consulta) |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura causal estándar de Llama dentro de Transformers, es decir, un transformer decoder-only con atención causal. El elemento distintivo documentado es el tokenizador: un esquema de tokenización a nivel de byte ("schema-1") que no forma parte de la librería estándar y que exige `trust_remote_code=True` para su carga, lo que implica ejecutar código remoto del repositorio durante la inicialización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, mezcla de expertos, SSM híbridos). La model card únicamente menciona que el paquete incluye `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (mapeo de divulgación de contenido de entrenamiento según el reglamento europeo de GPAI), lo que apunta a un esfuerzo de trazabilidad documental más que a una descripción técnica del entrenamiento. El tamaño real de 9,5 millones de parámetros sugiere un entrenamiento de muy bajo coste computacional, probablemente sobre un corpus pequeño.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad confirmada por el `pipeline_tag` (`text-generation`).
- Modo conversacional: el tag `conversational` está presente en los metadatos, aunque no se documenta ninguna plantilla de chat ni formato de turnos.
- Aprendizaje de fundamentos de Python: inferido únicamente del nombre del repositorio; no confirmado en la model card ni respaldado por evaluaciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (sin lista de idiomas declarada).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Validación de pipelines de exportación con tokenizadores personalizados: el modelo sirve como caso de prueba para verificar que una infraestructura soporta tokenizadores de bytes cargados con `trust_remote_code=True` antes de aplicarla a modelos mayores.
- Pruebas de integración en endpoints compatibles: al declarar el tag `endpoints_compatible` y `text-generation-inference`, puede usarse para comprobar el despliegue de un endpoint de inferencia con un modelo diminuto y tiempos de arranque muy bajos.
- Test de humo (smoke test) en CI/CD: con menos de 10 millones de parámetros, cabe en cualquier runner y permite validar el flujo completo de descarga de safetensors, carga de tokenizer y generación en cada commit.
- Docencia y demostraciones de arquitectura tipo Llama: útil para ilustrar el funcionamiento de un transformer causal a escala mínima, inspeccionando pesos y activaciones sin necesidad de GPU.
- Investigación sobre trazabilidad y divulgación de contenido de entrenamiento: los ficheros `BOM.json` y `EU-BOM.json` del repositorio lo convierten en un ejemplo práctico para estudiar cómo se documenta una release de un modelo de IA de propósito general bajo el marco europeo.
- Generación de fragmentos de código Python en entornos de prueba: si el ajuste anunciado en el nombre se confirma, podría emplearse para autocompletado trivial o generación de ejemplos didácticos, siempre con verificación humana dado el reducido tamaño del modelo.
- Experimentación con cuantización extrema: su tamaño permite probar técnicas de compresión a 4 bits o menos y medir el impacto en la perplejidad sin consumo relevante de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación, y los resultados de la búsqueda web no contienen referencias a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 38 MB en FP32, 19 MB en FP16/BF16, 10 MB en INT8 y 5 MB en INT4, para los 9,54 millones de parámetros (cálculo teórico sobre el recuento de parámetros publicado; no hay mediciones oficiales).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU, incluso integradas y aceleradores de gama de entrada, es suficiente; no se requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo actual y en generaciones antiguas; también es viable en CPU e incluso en dispositivos embebidos tipo Raspberry Pi.
- Opciones de despliegue: `transformers` está confirmado por los metadatos; los tags incluyen `text-generation-inference` y `endpoints_compatible`. La conversión a GGUF para llama.cpp u Ollama no está documentada y podría requerir adaptaciones por el tokenizador personalizado.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo que permitan una comparación cuantitativa. La tabla siguiente contrasta únicamente escala y disponibilidad con alternativas de tamaño reducido ampliamente conocidas; las cifras de los modelos comparados provienen de su documentación pública y no forman parte de la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0001-u0-mdagosta-b | 9,5 M | no disponible | no disponible | HuggingFace |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | HuggingFace |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache-2.0 | HuggingFace |
| Qwen2.5-0.5B | 0,49 B | 32.768 tokens | Apache-2.0 | HuggingFace |

La diferencia de escala (dos órdenes de magnitud frente al más pequeño de los comparados) implica que este modelo no es un sustituto directo de ninguno de ellos: los alternativos están diseñados para uso general y cuentan con documentación y evaluación publicadas, mientras que este checkpoint carece de ambas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta composición del dataset ni auditoría de sesgos, por lo que no pueden descartarse sesgos heredados de datos no declarados.
- Riesgo de alucinación: muy elevado de forma estructural. Un modelo de 9,5 millones de parámetros tiene una capacidad de modelado del lenguaje muy limitada y producirá texto incoherente o factualmente incorrecto con alta frecuencia.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y la lista de idiomas. No hay garantía de que el modelo funcione correctamente en castellano o en cualquier otro idioma distinto del que se usó en un hipotético ajuste.
- Restricciones de licencia: la licencia no está declarada en los metadatos ni en la model card. Sin licencia explícita, no puede asumirse permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Ejecución de código remoto: el uso del tokenizador requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio en el entorno local. Debe auditarse el código antes de cargarlo y hacerlo en un entorno aislado.
- Ausencia de evaluación: sin benchmarks ni validación independiente, no hay evidencia de que el modelo cumpla ninguna tarea concreta más allá de generar texto.
- Madurez del artefacto: cero descargas y cero "likes" en el momento de la consulta, y un tamaño de repositorio de 0,0 GB. No hay comunidad, soporte ni historial de uso.
- Metadatos incompletos: no se declaran idiomas, licencia ni contexto, lo que dificulta la integración en pipelines con requisitos de cumplimiento.
- Fechas: los metadatos indican fecha de creación y actualización en 2026, con un intervalo de seis segundos entre ambas, lo que sugiere una subida automatizada sin revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0001-u0-mdagosta-b
- Ficheros citados en la model card (dentro del repositorio): `BOM.json` y `EU-BOM.json`
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados obtenidos (Google Gemini, Claude, el repositorio `stephansturges/WALDO` de detección en imágenes aéreas, GPT-6.1 Sol y un generador de modelos 3D) no guardan relación con este checkpoint ni con el proyecto OpenWALDO citado en la model card.

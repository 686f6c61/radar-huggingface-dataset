# mradermacher/starlight-small-1-GGUF

## Resumen

Starlight-small-1-GGUF es el repositorio de cuantizaciones en formato GGUF del modelo North-ML1/starlight-small-1, publicado por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos para inferencia local. El modelo original es un modelo de generación de texto conversacional de tipo "small", con 752.393.024 parámetros (aproximadamente 752 millones), lo que lo sitúa en la gama de modelos compactos que pueden ejecutarse en hardware de consumo e incluso en CPU.

El repositorio no aporta información técnica sobre la arquitectura del modelo base, el proceso de entrenamiento, la longitud de contexto o el dataset utilizado: la model card se limita a documentar las cuantizaciones estáticas generadas (desde Q2_K hasta f16), su tamaño en disco y la licencia. El propio README indica que no hay cuantizaciones ponderadas o basadas en imatrix disponibles por el momento, aunque podrían solicitarse mediante una discusión comunitaria.

Su relevancia actual es práctica: al estar bajo licencia Apache 2.0 y en formato GGUF, el modelo es directamente desplegable con llama.cpp, Ollama o LM Studio en equipos sin GPU dedicada, con pesos que van de 0,5 GB (Q2_K) a 1,6 GB (f16). No obstante, la ausencia de benchmarks publicados y de documentación del modelo base limita cualquier evaluación rigurosa de su calidad respecto a alternativas de tamaño similar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 752.393.024 (aproximadamente 752 M) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (las cuantizaciones de este repositorio); el modelo base se distribuye en safetensors |
| Pipeline | text-generation |
| Librería declarada | transformers |
| Modelo base | North-ML1/starlight-small-1 |
| Tamaño del repositorio | 7,5 GB |
| Fecha de creación del repositorio | 2026-10-06 (según metadatos de HuggingFace) |
| Última actualización | 2026-10-06 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base en la documentación disponible. Los metadatos de HuggingFace no especifican si se trata de un transformer denso, una arquitectura MoE, un modelo híbrido o un modelo basado en space state models (SSM). Tampoco se indica el número de capas, la dimensión oculta, el número de cabezas de atención ni el tamaño del vocabulario. La etiqueta "starlight" apunta a una familia propia de North-ML1, pero no hay material técnico asociado en la información proporcionada.

Respecto al entrenamiento, no hay datos disponibles sobre el número de tokens utilizados, la composición del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre posibles innovaciones técnicas (atención lineal, decodificación especulativa, atención por ventanas, etc.). El repositorio de mradermacher documenta únicamente el proceso de cuantización: cuantizaciones estáticas, sin versiones ponderadas o imatrix en el momento de la publicación, y con conversión desde pesos de HuggingFace (convert_type: hf).

## Capacidades

- Generación de texto conversacional: el repositorio declara la etiqueta "conversational" y el pipeline "text-generation", por lo que está orientado a diálogo multi-turno.
- Generación de texto general: al ser un modelo de 752 M de parámetros, sus capacidades de razonamiento complejo son presumiblemente limitadas en comparación con modelos de mayor tamaño; no hay evaluación publicada que lo confirme.
- Capacidades multilingües: el modelo declara únicamente inglés (en). No se documenta soporte de otros idiomas, incluido el castellano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible", lo que sugiere compatibilidad con infraestructuras de despliegue tipo Inference Endpoints.

## Casos de uso

- Prototipado local sin GPU: con cuantizaciones de 0,5 a 0,9 GB (Q2_K a Q8_0), el modelo puede ejecutarse íntegramente en CPU con llama.cpp, lo que permite validar pipelines de generación de texto en portátiles o servidores sin acelerador antes de escalar a modelos mayores.
- Asistentes conversacionales ligeros en inglés: al declarar la etiqueta "conversational" y estar orientado a text-generation, encaja en bots de chat de dominio acotado (por ejemplo, FAQ internas en inglés) donde el coste por inferencia debe ser mínimo.
- Generación de texto en el borde (edge computing): su tamaño permite desplegarlo en dispositivos con recursos limitados, como mini-PC o Raspberry Pi con 4-8 GB de RAM, usando Q4_K_S o Q4_K_M.
- Filtrado y clasificación de texto en pipelines de datos: tareas de etiquetado, resumen corto o reformulación de frases cortas en inglés, donde no se requiere razonamiento profundo ni contexto largo.
- Base para ajuste fino experimental: al estar bajo Apache 2.0 y contar con pesos en safetensors en el modelo base, puede servir como punto de partida para fine-tuning de bajo coste (LoRA) en tareas concretas en inglés.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantización del mismo modelo, lo que permite medir empíricamente la degradación de calidad frente a tamaño en un modelo pequeño.
- Despliegue en entornos con restricciones de licencia permisiva: la licencia Apache 2.0 facilita la integración en productos comerciales, siempre que se respete la atribución y se verifiquen los términos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio de cuantizaciones ni los metadatos de HuggingFace incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench, Perplexity ni de ninguna otra evaluación. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos correspondían a páginas de estado de servidores de videojuegos sin relación con el tema).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: f16 1,6 GB; Q8_0 0,9 GB; Q6_K 0,7 GB; Q5_K_M y Q5_K_S 0,7 GB; Q4_K_M, Q4_K_S e IQ4_XS 0,6 GB; Q3_K_L y Q3_K_M 0,6 GB; Q3_K_S y Q2_K 0,5 GB. A estas cifras hay que sumar el consumo del contexto (KV cache), cuyo tamaño depende de la longitud de contexto configurada, no documentada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar las cuantizaciones de 4 bits con margen; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes y quedarán limitadas por el resto del pipeline, no por el modelo.
- Compatibilidad con GPU de consumo: sí, en todas las cuantizaciones. Incluso las GPU integradas y las CPU modernas pueden ejecutarlo.
- Ejecución sin GPU: viable en CPU con llama.cpp; los archivos de 0,5-0,9 GB caben en memoria de sistemas con 4 GB de RAM o más.
- Opciones de despliegue: llama.cpp, Ollama (mediante Modelfile apuntando al GGUF), LM Studio, text-generation-webui, llama-cpp-python y servidores compatibles con GGUF. Para el modelo base en safetensors, transformers, vLLM o TGI (sujeto a que la arquitectura sea soportada por estas herramientas, dato no disponible).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

La comparativa se establece con modelos compactos de propósito general de tamaño comparable. Los datos de las alternativas provienen de sus fichas públicas y no se han verificado contra las fuentes originales en esta ficha; los del modelo tratado figuran como "no disponible" cuando no constan.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmarks públicos |
|---|---|---|---|---|---|
| starlight-small-1 (GGUF de mradermacher) | 752 M | no disponible | Apache 2.0 | inglés | no disponibles |
| Qwen2.5-0.5B | 494 M | 32 768 tokens (según su ficha) | Apache 2.0 | multilingüe | publicados por el autor |
| SmolLM2-360M | 362 M | 8 192 tokens (según su ficha) | Apache 2.0 | inglés principalmente | publicados por el autor |
| TinyLlama-1.1B | 1 100 M | 2 048 tokens (según su ficha) | Apache 2.0 | inglés | publicados por el autor |

Diferencias destacables: frente a Qwen2.5-0.5B, el modelo tratado no documenta contexto ni soporte multilingüe, y carece de resultados publicados. Frente a SmolLM2-360M y TinyLlama-1.1B, cuenta con un tamaño intermedio pero sin evidencia pública de calidad. La ventaja común de los cuatro es la licencia permisiva (Apache 2.0) y la disponibilidad en formatos cuantizados para inferencia local.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen arquitectura, contexto, dataset ni proceso de alineación, lo que impide estimar el comportamiento en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos, y presumiblemente elevado en un modelo de 752 M de parámetros sin datos de evaluación publicados.
- Sesgos conocidos: no disponible. Al no documentarse la composición del dataset de entrenamiento, no es posible identificar sesgos de género, raza, ideología o dominio.
- Idioma: el modelo declara únicamente inglés. Su uso en castellano u otros idiomas no está soportado ni evaluado, y previsiblemente dará resultados degradados.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni planificar el consumo de KV cache.
- Calidad de las cuantizaciones: las cuantizaciones por debajo de Q4 (Q3_K_S, Q3_K_M, Q2_K) degradan notablemente la perplejidad según las gráficas de referencia enlazadas por el propio cuantizador; se recomienda Q4_K_M o superior para uso real.
- Cuantizaciones ponderadas no disponibles: el autor indica que las versiones imatrix o weighted no están publicadas y podrían no estarlo.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la ficha del modelo base (North-ML1/starlight-small-1) por si hubiera condiciones adicionales no reflejadas en las etiquetas.
- Metadatos anómalos: las fechas del repositorio (2026) y el contador de descargas y likes a cero sugieren un modelo con nula adopción y sin validación por parte de la comunidad.
- Sin garantías de soporte: no hay paper, blog técnico ni repositorio de código asociado al modelo en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/starlight-small-1-GGUF
- Modelo base: https://huggingface.co/North-ML1/starlight-small-1
- Página de resumen de cuantizaciones del autor para este modelo: https://hf.tst.eu/model#starlight-small-1-GGUF
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo; los resultados devueltos correspondían a páginas de estado de servidores de videojuegos sin relación con el tema.

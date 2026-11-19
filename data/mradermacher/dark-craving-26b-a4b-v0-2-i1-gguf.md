# mradermacher/Dark-Craving-26B-A4B-v0.2-i1-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.2-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix y pesos ponderados, del modelo ReadyArt/Dark-Craving-26B-A4B-v0.2. El autor de las cuantizaciones es mradermacher, un conocido generador de versiones GGUF para la comunidad. El modelo base es un ajuste fino orientado a roleplay conversacional para adultos, con etiquetas explícitas de contenido NSFW, ERP y "unaligned", y está pensado exclusivamente para inglés. No es un modelo de propósito general: su dominio de uso declarado es la conversación de rol madura y explícita.

A pesar del nombre comercial "26B-A4B", los pesos en safetensors suman 25.233.142.046 parámetros totales, lo que sugiere una arquitectura de tipo mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos por token, coherente con el sufijo A4B. La información disponible no confirma la arquitectura exacta ni la longitud de contexto del modelo base, por lo que esos datos se marcan como no disponibles.

La relevancia de esta ficha es práctica: permite evaluar rápidamente si el modelo encaja en un despliegue local con llama.cpp u Ollama, qué cuantización elegir según la VRAM disponible y qué limitaciones reales tiene antes de integrarlo en cualquier producto. La licencia declarada es Apache 2.0, pero el contenido del modelo y su naturaleza "unaligned" exigen controles de seguridad propios en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A4B y el recuento de parámetros sugieren mezcla de expertos con ~4B activos, sin confirmar) |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | no disponible (presumiblemente ~4 B por el sufijo A4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base ReadyArt/Dark-Craving-26B-A4B-v0.2. El recuento de parámetros (25,2 B) y la nomenclatura "A4B" apuntan a un transformer con mezcla de expertos y del orden de 4.000 millones de parámetros activos por token, pero no hay confirmación explícita en la información disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias.

Lo que sí está documentado es el proceso de cuantización: mradermacher publica cuantizaciones i1 generadas con un fichero imatrix propio (Dark-Craving-26B-A4B-v0.2.imatrix.gguf, 0,2 GB), lo que permite crear cuantizaciones adicionales con la misma matriz de importancia. Las cuantizaciones i1 suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes, y el autor recomienda IQ4_XS, Q4_K_S y Q4_K_M como puntos de equilibrio, con IQ3_S por encima de Q3_K* según sus notas. También existe una colección paralela de cuantizaciones estáticas en mradermacher/Dark-Craving-26B-A4B-v0.2-GGUF.

## Capacidades

- Generación de texto conversacional en inglés, orientada a roleplay multi-turno y contenido para adultos.
- Estilo "unaligned": el ajuste fino no incorpora los filtros de alineamiento típicos de los modelos instruct convencionales, lo que se traduce en menor rechazo de peticiones explícitas.
- Conversación instructiva y mantenimiento de personajes o escenarios dentro de una sesión.
- Cuantizaciones disponibles desde ~8,4 GB (IQ1_S) hasta ~22,7 GB (Q6_K), lo que permite ejecución en hardware muy diverso.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con el ecosistema transformers/llama.cpp.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües más allá del inglés.

## Casos de uso

- Roleplay conversacional local para adultos: el modelo está ajustado específicamente para este dominio y las cuantizaciones Q4_K_M (~16,9 GB) o IQ4_XS (~14,0 GB) permiten ejecutarlo en una GPU de consumo de 24 GB con contexto moderado. Es su caso de uso principal y el único claramente respaldado por la model card.
- Escritura creativa de ficción madura: generación de narrativa y diálogos con contenido explícito en inglés, usando Q5_K_M (~19,2 GB) para preservar matices de estilo cuando se dispone de 24 GB de VRAM.
- Prototipado de chatbots de personaje sin restricciones: útil para investigar dinámicas de conversación y evaluación de personajes en entornos controlados, con la salvedad de que requiere moderación externa antes de exponerlo a usuarios.
- Evaluación de cuantizaciones: el fichero imatrix y la amplia gama de cuantizaciones i1 permiten comparar degradación de calidad entre IQ2, IQ3, IQ4 y Q6 en una misma tarea de generación libre, un caso útil para investigadores de compresión de modelos.
- Despliegue en estaciones de trabajo modestas: con IQ3_S (~12,3 GB) o Q3_K_M (~13,4 GB) el modelo cabe en GPUs de 16 GB, lo que facilita pruebas locales sin infraestructura de datacenter.
- Generación de datos sintéticos de diálogo para investigación en seguridad y moderación: al ser un modelo explícito, puede emplearse para construir conjuntos de evaluación de filtros de contenido, siempre con revisión humana y cumplimiento legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S ~8,4 GB; IQ2_M ~10,5 GB; IQ3_S ~12,3 GB; IQ4_XS ~14,0 GB; Q4_K_M ~16,9 GB; Q5_K_M ~19,2 GB; Q6_K ~22,7 GB. Añadir entre 1 y 4 GB adicionales para la caché KV según la longitud de contexto.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para IQ3_S o Q3_K_M; GPUs de 8-10 GB solo con cuantizaciones IQ1/IQ2, con degradación notable de calidad.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB con IQ3_S hasta una RTX 4090 con Q5_K_M. Para Q6_K conviene una GPU de 24 GB o reparto parcial en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no son la vía natural para estas cuantizaciones i1.
- Latencia y throughput: no disponibles en la información proporcionada. Al tratarse presumiblemente de un MoE con ~4B activos, la velocidad debería ser superior a la de un modelo denso de 25B, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.2-i1-GGUF | 25,2 B totales (activos no confirmados) | no disponible | Apache 2.0 | GGUF i1 | Roleplay adulto en inglés, cuantizaciones de 8,4 a 22,7 GB |
| mradermacher/Dark-Craving-26B-A4B-v0.2-GGUF | 25,2 B totales | no disponible | Apache 2.0 | GGUF estáticas | Mismo modelo base, cuantizaciones sin imatrix |
| ReadyArt/Dark-Craving-26B-A4B-v0.2 | 25,2 B totales | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar, requiere transformers |

No se dispone en la información proporcionada de alternativas de otros autores con las que comparar parámetros, contexto o rendimiento de forma fiable.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo está etiquetado como nsfw, explicit, adult-content y not-for-all-audiences; no debe desplegarse en productos accesibles a menores sin filtrado y verificación de edad.
- Modelo "unaligned": no incorpora las salvaguardas habituales de los modelos instruct convencionales, por lo que puede producir contenido dañino, ilegal o no consentido si se le induce; requiere moderación externa obligatoria en producción.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual y el ajuste está orientado a ficción, por lo que no es adecuado para tareas de recuperación de hechos.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Contexto: la longitud de contexto no está documentada; planificar despliegues con ventanas conservadoras y validar el comportamiento en conversaciones largas.
- Licencia Apache 2.0 para los pesos, pero eso no exime del cumplimiento de la legislación aplicable sobre contenido adulto, protección de menores y derechos de imagen en cada jurisdicción.
- Las cuantizaciones IQ1 e IQ2 degradan la calidad de forma significativa; el propio autor las describe como "for the desperate" o "very low quality". No usarlas en producción.
- Sin datos de benchmarks ni de throughput: cualquier decisión de despliegue debe basarse en pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Dark-Craving-26B-A4B-v0.2-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Dark-Craving-26B-A4B-v0.2-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Dark-Craving-26B-A4B-v0.2-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

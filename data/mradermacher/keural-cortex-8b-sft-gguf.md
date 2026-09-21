# mradermacher/Keural-Cortex-8B-SFT-GGUF

## Resumen

Keural-Cortex-8B-SFT-GGUF es una colección de cuantizaciones en formato GGUF del modelo mkd-hossain/Keural-Cortex-8B-SFT, un modelo de lenguaje de 8.190.735.360 parámetros (8,19 mil millones) afinado mediante SFT y orientado a conversación bilingüe coreano-inglés. Las cuantizaciones las publica el usuario mradermacher, especializado en convertir pesos a GGUF para su ejecución en llama.cpp y en hardware de consumo.

El repositorio es exclusivamente de cuantización: no introduce pesos nuevos ni entrenamiento adicional, sino que replica los pesos del modelo base en doce niveles de precisión distintos (de Q2_K a f16), con tamaños que van de 3,4 GB a 16,5 GB. El modelo base se distribuye con licencia Apache-2.0 y las etiquetas del repositorio lo asocian a la familia Qwen3, a la ventana de contexto largo y al soporte de tool calling.

Su relevancia actual es doble: por un lado, ofrece una vía práctica de desplegar un modelo bilingüe coreano-inglés en local sin depender de API externas; por otro, al estar bajo Apache-2.0 permite uso comercial sin las restricciones habituales de otras licencias de modelos abiertos. El contrapunto es la ausencia total de documentación técnica, benchmarks e información de entrenamiento en la model card, que se limita a listar los ficheros GGUF disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, según la etiqueta qwen3 del repositorio (no confirmado en la model card) |
| Parámetros totales | 8.190.735.360 (8,19 mil millones) |
| Parámetros activos | No aplica: no se indica arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible (el repositorio incluye la etiqueta long-context, pero no publica cifra) |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base, en formato de transformers |
| Modelo base | mkd-hossain/Keural-Cortex-8B-SFT |
| Autor de la cuantización | mradermacher |
| Tamaño del repositorio | 73,4 GB |
| Fecha de creación | 2026-09-20 (según metadatos del repositorio) |
| Última actualización | 2026-09-20 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los únicos indicios son las etiquetas del repositorio, que incluyen `qwen3`, lo que apunta a una arquitectura transformer decoder-only densa derivada de la familia Qwen3, y el sufijo `SFT` del nombre, que indica que el modelo base fue ajustado con supervisión (supervised fine-tuning) sobre un modelo preentrenado. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF, DPO u otro tipo de alineación. Tampoco se detalla el chat template, el tokenizador concreto ni el método de escalado de contexto empleado para la ventana larga.

En lo que respecta a esta publicación, se trata de una conversión de pesos y no de un entrenamiento. La model card declara `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que el proceso partió del checkpoint en formato HuggingFace y cuantizó los tensores de salida. El autor señala que en el momento de la publicación solo hay cuantizaciones estáticas y que no hay cuantizaciones ponderadas ni con imatrix (que suelen ofrecer mejor relación calidad/tamaño en bits bajos); esas versiones podrían no llegar a publicarse salvo petición explícita en la sección de discusiones.

## Capacidades

- Generación de texto conversacional en coreano e inglés, según los idiomas declarados en el repositorio.
- Tool calling y function calling: el repositorio incluye la etiqueta `tool-calling`, lo que sugiere soporte de invocación de herramientas, aunque no se documenta el formato esperado.
- Contexto largo: etiqueta `long-context` presente, sin cifra publicada de tokens máximos.
- Razonamiento multi-turno: el repositorio se marca como `conversational` y compatible con endpoints.
- Uso como modelo base para ajuste adicional: al estar en Apache-2.0 y disponible en f16 y Q8_0, es viable como punto de partida para fine-tuning o para destilación.
- Ejecución en CPU y en GPU de consumo gracias al formato GGUF y a los doce niveles de cuantización.
- Capacidades multimodales: no disponibles; el repositorio no incluye proyector multimodal (`skip_mmproj` en la metadata).
- Capacidades de visión, audio o modo thinking explícito: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente bilingüe coreano-inglés: el modelo puede gestionar conversaciones multi-turno en ambos idiomas y desplegarse en local, lo que resulta adecuado para empresas que manejan datos de clientes sujetos a normativa de residencia de datos y no quieren enviarlos a API de terceros.
- Asistente interno sobre documentación corporativa: con la etiqueta de contexto largo y un nivel Q5_K_M o Q6_K (6,0-6,8 GB), se puede montar un RAG que reciba varios fragmentos de contexto por consulta manteniendo una huella de memoria reducida.
- Agente con invocación de herramientas: la etiqueta `tool-calling` permite integrarlo como planificador en flujos que consulten APIs internas (ERP, CRM, bases de datos) mediante function calling, con el modelo ejecutándose en una GPU de gama media.
- Traducción y localización coreano-inglés: útil para preprocesar o postprocesar contenidos en pipelines de localización donde no se requiere un modelo de traducción especializado y se prefiere una sola instancia para ambas direcciones.
- Prototipado y evaluación en investigación: al existir cuantizaciones desde Q2_K (3,4 GB) hasta f16 (16,5 GB), se puede medir la degradación de calidad por cuantización sobre la tarea concreta antes de decidir el nivel de despliegue definitivo.
- Generación de texto en entornos sin conexión: escenarios de campo, sistemas embebidos con GPU integrada o despliegues air-gapped donde un modelo de 8B en Q4_K_M (5,1 GB) cabe en memoria y no requiere acceso a internet.
- Sustitución de API propietaria en productos con licencia permisiva: al ser Apache-2.0, se puede incorporar a un producto comercial sin obligaciones de atribución tan restrictivas como las de otras licencias de modelos abiertos, siempre que se verifiquen los términos del modelo base.
- Fine-tuning específico de dominio sobre coreano: al disponer de los pesos en f16 y Q8_0 con buena fidelidad, sirve como base para LoRA o ajuste completo en dominios verticales (legal, médico, financiero) en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, KMMLU ni de ninguna otra evaluación. Las búsquedas web realizadas tampoco devolvieron resultados relevantes sobre el modelo: los resultados obtenidos correspondían a un medio de comunicación serbio, sin relación alguna con este modelo.

En consecuencia, no es posible comparar su rendimiento con alternativas de forma cuantitativa. Cualquier cifra de rendimiento que se utilice para decidir su adopción debería generarse mediante evaluación propia.

## Requisitos de hardware

Tamaños de fichero reales por cuantización y VRAM estimada para inferencia (fichero + caché KV y overhead de runtime, asumiendo contextos moderados de 4.000 a 8.000 tokens; con contextos mayores la caché KV crece de forma aproximadamente lineal):

| Cuantización | Tamaño del fichero | VRAM estimada |
|---|---|---|
| Q2_K | 3,4 GB | ~4,5 GB |
| Q3_K_S | 3,9 GB | ~5,0 GB |
| Q3_K_M | 4,2 GB | ~5,3 GB |
| Q3_K_L | 4,5 GB | ~5,6 GB |
| IQ4_XS | 4,7 GB | ~5,8 GB |
| Q4_K_S | 4,9 GB | ~6,2 GB |
| Q4_K_M | 5,1 GB | ~6,5 GB |
| Q5_K_S | 5,8 GB | ~7,3 GB |
| Q5_K_M | 6,0 GB | ~7,5 GB |
| Q6_K | 6,8 GB | ~8,5 GB |
| Q8_0 | 8,8 GB | ~10,5 GB |
| f16 | 16,5 GB | ~18,5 GB |

- Cabe en GPU de consumo: sí, en todos los niveles salvo f16 en tarjetas de 16 GB o menos. Q4_K_M entra en una RTX 3060 de 12 GB, una RTX 4070 de 12 GB o una RTX 4060 Ti de 16 GB con margen para contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090 24 GB (permite f16 con contexto amplio), A100 40/80 GB, H100 80 GB para despliegues con muchas peticiones concurrentes.
- Ejecución parcial en CPU: los niveles Q4 y Q3 son viables con offload parcial a RAM, aunque la latencia aumenta de forma notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, Jan, llama-cpp-python y text-generation-webui para GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por petición para ninguna de las cuantizaciones.

## Comparativa con modelos similares

Comparativa de especificaciones declaradas. La columna de rendimiento se deja como no disponible porque no existen benchmarks publicados de Keural-Cortex-8B-SFT, y comparar con puntuaciones de terceros sin datos propios induciría a error.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Keural-Cortex-8B-SFT (esta ficha) | 8,19 mil millones | No disponible (etiqueta long-context) | ko, en | Apache-2.0 | Sí, 12 cuantizaciones |
| Qwen3-8B | 8,2 mil millones | 32.768 tokens nativos, ampliable con YaRN | Multilingüe, más de 100 idiomas | Apache-2.0 | Sí |
| Llama 3.1 8B | 8,03 mil millones | 128.000 tokens | Multilingüe (8 idiomas declarados) | Llama 3.1 Community License | Sí |
| Gemma 2 9B | 9,2 mil millones | 8.192 tokens | Principalmente inglés | Gemma Terms of Use | Sí |

Notas sobre la comparativa: las especificaciones de Qwen3-8B, Llama 3.1 8B y Gemma 2 9B proceden de información pública de sus respectivos lanzamientos y conviene verificarlas contra las model cards originales antes de citarlas. La diferencia más relevante de Keural-Cortex-8B-SFT frente a estas alternativas no es el rendimiento, que se desconoce, sino su especialización declarada en coreano y su combinación de licencia Apache-2.0 con etiquetas de tool calling y contexto largo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluación publicada, ni por el autor del modelo base ni por el autor de las cuantizaciones, lo que impide estimar su calidad real frente a alternativas.
- Model card mínima: no se documentan datos de entrenamiento, composición del dataset, método de alineación, chat template ni tokenizador. Esto complica la integración en producción y la reproducibilidad.
- Sesgos conocidos: no disponibles. Al ser un modelo entrenado principalmente en coreano e inglés, es previsible un sesgo hacia contenido y convenciones culturales de esos idiomas, pero no hay análisis publicado que lo cuantifique. Se desconoce también el grado de alineación de seguridad del modelo base.
- Riesgo de alucinación: no cuantificado. Al no haber evaluación, no hay base para estimar la tasa de invención de hechos, especialmente en dominios especializados.
- Limitaciones de idioma: solo coreano e inglés. No hay indicios de soporte fiable de castellano, por lo que no es adecuado para tareas en español sin una evaluación previa.
- Límite de contexto real: aunque el repositorio se etiqueta como `long-context`, no se publica la cifra. No debe asumirse que soporta 32.000, 128.000 tokens ni ninguna otra longitud concreta sin verificarlo experimentalmente.
- Degradación por cuantización: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) tienen pérdida de calidad documentada en la propia model card, que marca Q3_K_M como «lower quality». Para uso en producción se recomienda Q5_K_M o superior.
- Cuantizaciones ponderadas no disponibles: el autor indica que no ha publicado variantes con imatrix ni ponderadas, que suelen ofrecer mejor calidad por bit en niveles bajos.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar de forma independiente la licencia y los términos del modelo base mkd-hossain/Keural-Cortex-8B-SFT, así como cualquier condición derivada de la familia Qwen3 si se confirma esa ascendencia.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni issues que permitan inferir problemas conocidos.
- Metadatos inconsistentes: las fechas de creación y actualización (2026-09-20) son posteriores a la fecha de consulta habitual, lo que sugiere un error de registro o de zona horaria que conviene tener en cuenta al citar el repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Keural-Cortex-8B-SFT-GGUF
- Modelo base: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-SFT
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Keural-Cortex-8B-SFT-GGUF
- Peticiones de cuantización y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que cede la infraestructura de cuantización: https://www.nethype.de/
- Paper técnico del modelo: no disponible
- Blog o anuncio oficial: no disponible
- Demo o espacio de prueba: no disponible

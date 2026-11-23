# mradermacher/arco-2-openhermes-GGUF

## Resumen

arco-2-openhermes-GGUF es la versión cuantizada en formato GGUF del modelo appvoid/arco-2-openhermes, publicada por mradermacher, un conocido distribuidor de cuantizaciones para el ecosistema llama.cpp. El modelo base es un ajuste fino (SFT) de tipo conversacional, entrenado con las herramientas de Unsloth y TRL sobre un conjunto de datos derivado de OpenHermes, y orientado exclusivamente al idioma inglés.

Con 513.590.784 parámetros totales (aproximadamente 0,5 mil millones), se trata de un modelo pequeño, diseñado para inferencia en hardware modesto. La versión GGUF permite ejecutarlo en CPU, GPU de gama baja o incluso en dispositivos con poca memoria, gracias a cuantizaciones que van desde Q2_K (0,3 GB) hasta f16 (1,1 GB). El repositorio ocupa 4,6 GB en total por incluir todas las variantes de cuantización.

La relevancia de esta ficha radica en que documenta un modelo de nicho con muy poca información pública: no se dispone de detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks. Aun así, la licencia Apache 2.0 y su reducido tamaño lo hacen interesante para experimentación local, prototipado rápido y despliegues con recursos limitados, siempre con expectativas ajustadas a su escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar) |
| Parámetros totales | 513.590.784 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base appvoid/arco-2-openhermes. Los tags del repositorio indican el uso de Unsloth, TRL y SFT (supervised fine-tuning), lo que sugiere que se trata de un ajuste fino supervisado sobre un modelo preentrenado, probablemente de tipo transformer y con tokenizador compatible con llama. El nombre "openhermes" apunta a que el conjunto de datos de ajuste deriva del popular dataset OpenHermes, orientado a instrucciones y conversación.

No hay datos públicos sobre el número de tokens de entrenamiento, la composición exacta del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización fue realizada por mradermacher con cuantizaciones estáticas (static quants); el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación, aunque podrían solicitarse.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones.
- Ajuste fino supervisado (SFT) sobre datos tipo OpenHermes, lo que favorece respuestas a preguntas y tareas de formato.
- Soporte de conversación multi-turno (formato conversacional según los tags del repositorio).
- No hay evidencia de soporte de tool calling / function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ocupar entre 0,3 y 1,1 GB según cuantización, puede ejecutarse en portátiles y equipos sin GPU dedicada para validar flujos de chat antes de escalar a modelos mayores.
- Generación de texto en entornos con recursos restringidos: útil en dispositivos edge o contenedores con poca RAM, donde un modelo de 0,5 B parámetros en Q4_K_M (0,4 GB) es viable.
- Clasificación y etiquetado de texto simple en inglés: tareas de categorización, extracción de entidades o resumen de frases cortas donde no se requiere razonamiento complejo.
- Educación y experimentación: modelo didáctico para estudiar el pipeline de cuantización GGUF, comparar calidades entre Q2_K y Q8_0 y entender el impacto de la cuantización en la perplejidad.
- Generación de respuestas en chatbots de bajo coste: integrable en servicios con presupuesto de cómputo mínimo, siempre que el dominio sea inglés y las expectativas de calidad moderadas.
- Pruebas de integración con llama.cpp, Ollama o servidores compatibles con GGUF: sirve como modelo de humo (smoke test) para validar pipelines de despliegue antes de usar modelos de mayor tamaño.
- Filtrado o preprocesado de datos: generación de borradores o reformateos de texto en lotes donde la latencia y el coste importan más que la precisión fina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en Q4_K_M, 0,6 GB en Q8_0 y 1,1 GB en f16 (los tamaños de archivo son una cota superior razonable para la memoria necesaria).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100. Una GTX 1650, RTX 3050 o incluso una iGPU moderna pueden ejecutarlo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, y también en CPU.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (por ejemplo, text-generation-inference con soporte GGUF, aunque no está confirmado para este modelo), y transformers con el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; por el tamaño (0,5 B parámetros) se espera una latencia baja en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| arco-2-openhermes-GGUF | 513.590.784 | no disponible | Apache 2.0 | GGUF | Modelo de nicho, pocos datos públicos |
| Qwen2.5-0.5B-Instruct | 0,5 B (aprox.) | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada con benchmarks publicados |
| SmolLM2-360M-Instruct | 360 M (aprox.) | 8.192 tokens (según documentación pública) | Apache 2.0 | safetensors, GGUF | Enfoque en eficiencia y despliegue local |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens (según documentación pública) | Apache 2.0 | safetensors, GGUF | Algo mayor, con más comunidad y datos |

Nota: los datos de los modelos comparativos provienen de documentación pública general y pueden variar; no se han verificado contra las fuentes oficiales en el contexto de esta ficha.

## Limitaciones y advertencias

- Tamaño muy reducido (0,5 B parámetros): la calidad de razonamiento, coherencia en contextos largos y precisión factual será limitada en comparación con modelos de varios miles de millones de parámetros.
- Riesgo elevado de alucinación: al ser un modelo pequeño ajustado con SFT, puede generar afirmaciones plausibles pero incorrectas, especialmente en dominios especializados.
- Idiomas: solo inglés según la model card; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Contexto: no se ha publicado la longitud de contexto; no se debe asumir una ventana larga.
- Sesgos: no hay documentación sobre sesgos del modelo base ni del dataset de ajuste; se recomienda evaluar antes de usar en producción.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset subyacente pueden tener sus propias condiciones; conviene verificar la cadena de licencias.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_M): el autor advierte que Q3_K_M es de "lower quality"; para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix/ponderadas disponibles en el momento de la publicación.
- Información muy escasa: no hay benchmarks, ni detalles de entrenamiento, ni documentación de la arquitectura, lo que dificulta evaluar su idoneidad frente a alternativas consolidadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/arco-2-openhermes-GGUF
- Modelo base: https://huggingface.co/appvoid/arco-2-openhermes
- Página de descargas del cuantizador: https://hf.tst.eu/model#arco-2-openhermes-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

# mradermacher/assay-4b-GGUF

## Resumen

assay-4b-GGUF es la colección de cuantizaciones en formato GGUF del modelo Berk/assay-4b, publicada por el usuario mradermacher, conocido en el ecosistema por generar versiones cuantizadas de modelos abiertos para su ejecución en hardware de consumo. El modelo base es un transformer de 4.022.468.096 parámetros (aproximadamente 4B) etiquetado por su autor con los descriptores "assay", "calibrated" y "decision-model", y declarado con el pipeline de zero-shot-classification. La relevancia de esta publicación es práctica: permite ejecutar un modelo de 4B en CPU o GPU modesta mediante llama.cpp y derivados, algo inviable con los pesos originales en precisión completa.

El repositorio no incluye pesos safetensors del modelo original, sino únicamente ficheros GGUF en doce niveles de cuantización distintos, desde Q2_K (1,8 GB) hasta f16 (8,2 GB). Esto lo convierte en la vía de despliegue local para quien quiera evaluar el modelo base sin depender de infraestructura con GPU de datacenter. La licencia declarada es Apache 2.0, heredada del modelo base, lo que en principio permite uso comercial.

La información pública disponible es muy limitada: el repositorio no documenta arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Además, en el momento de redactar esta ficha el repositorio presenta cero descargas y cero "likes", lo que indica que se trata de una publicación reciente y sin validación comunitaria. Cualquier evaluación de calidad debe hacerse, por tanto, de forma empírica sobre el propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura interna; el modelo base es de 4B parámetros y pipeline declarado zero-shot-classification) |
| Parametros totales | 4.022.468.096 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas; el repositorio no incluye safetensors) |

Detalle de los ficheros publicados, ordenados por tamano:

| Fichero | Tipo | Tamano (GB) | Notas del autor |
|---|---|---|---|
| assay-4b.Q2_K.gguf | Q2_K | 1,8 | |
| assay-4b.Q3_K_S.gguf | Q3_K_S | 2,0 | |
| assay-4b.Q3_K_M.gguf | Q3_K_M | 2,2 | calidad inferior |
| assay-4b.Q3_K_L.gguf | Q3_K_L | 2,3 | |
| assay-4b.IQ4_XS.gguf | IQ4_XS | 2,4 | |
| assay-4b.Q4_K_S.gguf | Q4_K_S | 2,5 | rápido, recomendado |
| assay-4b.Q4_K_M.gguf | Q4_K_M | 2,6 | rápido, recomendado |
| assay-4b.Q5_K_S.gguf | Q5_K_S | 2,9 | |
| assay-4b.Q5_K_M.gguf | Q5_K_M | 3,0 | |
| assay-4b.Q6_K.gguf | Q6_K | 3,4 | muy buena calidad |
| assay-4b.Q8_0.gguf | Q8_0 | 4,4 | rápido, mejor calidad |
| assay-4b.f16.gguf | f16 | 8,2 | 16 bpw, excesivo |

Tamano total del repositorio: 36,4 GB.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base Berk/assay-4b en el repositorio analizado. Se sabe que tiene 4.022.468.096 parámetros y que su pipeline declarado en HuggingFace es zero-shot-classification, con las etiquetas "assay", "calibrated" y "decision-model". El término "calibrated" sugiere que el autor trabajó la calibración de las probabilidades de salida, un aspecto crítico cuando el modelo se usa para tomar decisiones o umbralizar puntuaciones, aunque el repositorio no documenta la técnica concreta empleada (temperature scaling, calibración post-hoc u otra).

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. El etiquetado del repositorio incluye "conversational", lo que apunta a algún tipo de ajuste conversacional, pero sin confirmación documental. Respecto a esta publicación concreta, la innovación técnica es exclusivamente la cuantización: se trata de cuantizaciones estáticas (el autor indica que las versiones ponderadas con imatrix no estaban disponibles en el momento de la publicación) y el campo "output_tensor_quantised: 1" indica que el tensor de salida también fue cuantizado.

## Capacidades

- Clasificación zero-shot: es la capacidad declarada explícitamente por el pipeline del repositorio. El modelo está pensado para asignar etiquetas definidas en tiempo de inferencia, sin necesidad de reentrenamiento por cada conjunto de clases nuevo.
- Modelo de decisión calibrado: las etiquetas "decision-model" y "calibrated" indican que las puntuaciones de salida están pensadas para ser umbralizadas de forma fiable, lo que resulta útil en sistemas de enrutamiento o filtrado automático.
- Generación de texto: no confirmada. La etiqueta "conversational" aparece en los tags, pero el repositorio no documenta capacidades generativas ni formato de prompt.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente inglés declarado.
- Thinking mode, visión o audio: no disponibles. El repositorio no declara ninguna modalidad distinta de texto.
- Integración con runtimes GGUF: compatible con llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier herramienta que consuma GGUF.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar cada ticket entrante en categorías definidas por el equipo (facturación, incidencia técnica, baja, consulta comercial) sin necesidad de entrenar un clasificador específico. Al ser un modelo de decisión calibrado, las puntuaciones permiten fijar un umbral de confianza y derivar a revisión humana los casos dudosos.
- Filtrado y moderación de contenido: clasificación zero-shot de textos según políticas configurables, con un umbral de probabilidad calibrado para reducir falsos positivos en producción.
- Enrutamiento de intenciones en asistentes conversacionales: determinar la intención del usuario antes de decidir qué herramienta o flujo activar, siempre que las etiquetas se definan explícitamente y el sistema funcione en inglés.
- Etiquetado automático de datasets: preetiquetar grandes corpus con categorías arbitrarias para después revisar por muestreo, reduciendo el coste del etiquetado manual. La cuantización Q4_K_M (2,6 GB) permite ejecutar el etiquetado en una sola GPU de consumo o incluso en CPU.
- Clasificación de documentos en pipelines de RAG: decidir a qué índice o colección pertenece un documento antes de la indexación, usando etiquetas que se pueden redefinir sin reentrenar el modelo.
- Despliegue local con requisitos de privacidad: al ejecutarse con llama.cpp en hardware propio y con un fichero de 2,6 GB, permite clasificar datos sensibles sin enviarlos a una API externa.
- Control de calidad y triaje en procesos internos: clasificación de correos, incidencias o formularios en un flujo automatizado, con la ventaja de que la licencia Apache 2.0 permite integrarlo en productos comerciales.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir empíricamente en qué punto la degradación de calidad (Q2_K, Q3_K_S) afecta a las decisiones del modelo en una tarea de clasificación concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de cuantizaciones no incluye tabla de MMLU, HumanEval, GSM8K ni métricas de clasificación, y la búsqueda web realizada no devolvió documentación técnica del modelo base ni de sus cuantizaciones.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del tamano del fichero GGUF más el overhead de contexto y de la caché KV; no proceden de mediciones publicadas por el autor.

- Inferencia en CPU: viable con todas las cuantizaciones. Q4_K_M (2,6 GB) es un punto de partida razonable en un equipo con 8 GB de RAM; f16 (8,2 GB) requiere 16 GB de RAM como mínimo.
- VRAM estimada por cuantización (solo pesos, sin contexto): Q2_K ≈ 2,3 GB; Q3_K_M ≈ 3,0 GB; IQ4_XS ≈ 3,2 GB; Q4_K_M ≈ 3,5 GB; Q5_K_M ≈ 3,9 GB; Q6_K ≈ 4,4 GB; Q8_0 ≈ 5,5 GB; f16 ≈ 9,5 GB.
- GPU de consumo: cabe con holgura en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 en cualquier cuantización, incluidas Q8_0 y f16. En GPUs de 8 GB (RTX 3070, RTX 4060) son viables hasta Q6_K dejando margen para el contexto.
- GPU de datacenter: A100, H100 y L40S ejecutan el modelo sin limitación de memoria; en estos casos tiene más sentido servir la versión f16 o pasar a los pesos originales en safetensors.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con el formato GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían los pesos safetensors del modelo base. El tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia gestionados.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia en ninguna de las cuantizaciones.

## Comparativa con modelos similares

Solo se dispone de datos verificables para comparar el repositorio cuantizado con su propio modelo base. No hay información suficiente sobre otros modelos de clasificación zero-shot de tamano similar en la documentación proporcionada, por lo que las celdas correspondientes se marcan como no disponibles.

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/assay-4b-GGUF | 4,02B (heredados del base) | GGUF (12 cuantizaciones) | no disponible | Apache 2.0 | Repositorio HuggingFace, 0 descargas |
| Berk/assay-4b (modelo base) | 4,02B | safetensors | no disponible | Apache 2.0 | Repositorio HuggingFace original |
| Alternativas de clasificación zero-shot de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

Conviene senalar que la comparación entre el repositorio GGUF y el modelo base no es de calidad, sino de formato: ambos comparten pesos y licencia, y la diferencia es la precisión numérica y el consumo de memoria.

## Limitaciones y advertencias

- Documentación insuficiente: el repositorio no especifica arquitectura, contexto, dataset ni proceso de entrenamiento. Sin esa información no es posible evaluar si el modelo es adecuado para un caso de uso concreto antes de probarlo.
- Idioma: únicamente se declara inglés. El comportamiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Sin benchmarks: no hay ninguna métrica publicada que permita comparar su rendimiento con alternativas. Cualquier decisión de adopción debería basarse en una evaluación propia sobre datos representativos del dominio objetivo.
- Riesgo de alucinación y clasificaciones erróneas: aunque el modelo esté etiquetado como "calibrated", la calibración declarada por el autor no ha sido verificada de forma independiente. En clasificación zero-shot, una puntuación alta no garantiza corrección semántica.
- Sesgos: no hay información sobre la composición del corpus de entrenamiento, por lo que no se pueden anticipar sesgos demográficos, culturales o de dominio.
- Degradación por cuantización: las cuantizaciones Q2_K y Q3_K_S comprimen el modelo hasta 1,8-2,0 GB y el propio autor marca Q3_K_M como "calidad inferior". En tareas de decisión con umbrales ajustados, la pérdida de precisión numérica puede alterar las clasificaciones en la frontera de decisión.
- Cuantizaciones estáticas únicamente: no había cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación, lo que suele implicar una pérdida de calidad algo mayor respecto a los pesos originales en los niveles bajos.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Berk/assay-4b conviene verificar que el modelo base no imponga restricciones adicionales (el repositorio de cuantizaciones lo etiqueta como Apache 2.0).
- Madurez: cero descargas y cero valoraciones. No hay evidencia de uso en producción ni de que los ficheros hayan sido validados por terceros.
- Fechas del repositorio: los metadatos indican creación y actualización el 21 de septiembre de 2026, con apenas media hora de diferencia, lo que confirma que la publicación es reciente y no ha pasado por ciclos de corrección.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/assay-4b-GGUF
- Modelo base: https://huggingface.co/Berk/assay-4b
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#assay-4b-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta el trabajo de cuantización: https://www.nethype.de/

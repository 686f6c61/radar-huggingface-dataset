# mradermacher/lumikabra-195b_v0.4-GGUF

## Resumen

lumikabra-195b_v0.4 es un modelo de lenguaje de gran escala (195 000 millones de parámetros nominales) publicado por el usuario tachyphylaxis y cuantizado a formato GGUF por mradermacher. Se trata de un modelo resultante de un proceso de fusión (merge) de otros modelos mediante la herramienta mergekit, según las etiquetas de la model card, y está orientado exclusivamente al idioma inglés. No se documenta la arquitectura interna, el contexto nativo ni los datos de entrenamiento en la información disponible.

La relevancia de esta ficha radica en su distribución práctica: el repositorio GGUF ofrece cuantizaciones estáticas desde Q2_K (71,7 GB) hasta Q8_0 (206,9 GB), lo que permite ejecutar un modelo de escala 195B en hardware de gama alta mediante llama.cpp y derivados. Al no existir pesos en formato safetensors dentro de este repositorio, la vía de despliegue práctica es GGUF con llama.cpp, Ollama o servidores compatibles.

No se han publicado datos sobre licencia, benchmarks, contexto o composición del dataset de entrenamiento, por lo que cualquier evaluación rigurosa exige consultar el modelo base original y validar empíricamente el comportamiento antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de fusión generado con mergekit; arquitectura interna no documentada) |
| Parámetros totales | 195B (según el nombre del modelo; no verificado en la model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas, divididas en múltiples partes) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de modelos realizada con mergekit, según las etiquetas declaradas en la model card (`mergekit`, `merge`). No se especifica la técnica de fusión concreta (por ejemplo, SLERP, TIES, DARE, passthrough o model stock), ni los modelos donantes, ni la arquitectura subyacente (transformer denso o MoE). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado.

La única innovación técnica documentada es la relacionada con el proceso de cuantización: el repositorio incluye cuantizaciones estáticas generadas con la versión 2 del pipeline de mradermacher (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), e indica que existen cuantizaciones ponderadas/imatrix en un repositorio separado (`lumikabra-195b_v0.4-i1-GGUF`). No se aporta información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado únicamente con el idioma `en`, por lo que su uso previsto es la generación y continuación de texto en inglés.
- Razonamiento y conocimiento general: no hay documentación específica sobre capacidades de razonamiento, matemáticas o código; no disponible.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingües: no documentadas; la model card solo declara inglés.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; no disponible.
- Ejecución local vía GGUF: capacidad operativa confirmada por la existencia de cuantizaciones en múltiples niveles de calidad y tamaño, aptas para llama.cpp y ecosistema compatible.

## Casos de uso

- Experimentación con modelos de escala 195B en local: gracias a las cuantizaciones Q2_K (71,7 GB) y Q3_K_S (83,9 GB), es posible cargar el modelo en estaciones de trabajo con 96-128 GB de RAM/VRAM unificada para probar su comportamiento sin depender de APIs externas.
- Generación de texto en inglés de alta calidad con Q6_K o Q8_0: las cuantizaciones de mayor tamaño (159,7 GB y 206,9 GB) están pensadas para servidores con múltiples GPU, donde se prioriza la fidelidad al modelo original sobre la velocidad.
- Investigación sobre fusiones de modelos: al ser un artefacto de mergekit, sirve como caso de estudio para analizar cómo se comportan las fusiones de gran escala tras la cuantización, comparando Q4_K_M frente a Q8_0 en tareas de generación libre.
- Despliegue en pipelines de inferencia por lotes: con llama.cpp o servidores compatibles (por ejemplo, llama-cpp-python o servidores OpenAI-compatible), el modelo puede procesar grandes volúmenes de texto en inglés en entornos con GPU de 80 GB (A100/H100) usando Q4_K_M (116,3 GB) repartido entre dos GPU.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes, lo que permite medir la degradación de perplejidad entre Q2_K y Q8_0 con la misma semilla y prompt, útil para calibrar qué nivel de cuantización es aceptable en una tarea concreta.
- Pruebas de integración con Ollama o LM Studio: los ficheros GGUF multi-parte pueden importarse en estas herramientas para validar flujos de trabajo de inferencia local antes de invertir en hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según tamaño de fichero GGUF):
  - Q2_K: ~71,7 GB
  - Q3_K_S: ~83,9 GB
  - Q3_K_M: ~93,8 GB
  - Q3_K_L: ~102,5 GB
  - IQ4_XS: ~104,8 GB
  - Q4_K_S: ~110,4 GB
  - Q4_K_M: ~116,3 GB
  - Q5_K_S: ~133,9 GB
  - Q5_K_M: ~137,3 GB
  - Q6_K: ~159,7 GB
  - Q8_0: ~206,9 GB
- GPU recomendadas: para Q4_K_M se necesitan al menos dos GPU de 80 GB (A100 80GB o H100 80GB) o una configuración con memoria unificada de 128 GB o superior. Para Q2_K y Q3_K_S, una estación con 96-128 GB de RAM y offload parcial a GPU puede ser suficiente.
- ¿Cabe en GPU de consumo? No de forma completa en ninguna GPU de consumo actual (la RTX 4090 tiene 24 GB). Solo es viable con offload masivo a RAM del sistema, con la consiguiente penalización de velocidad.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF multi-parte), Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI basados en llama.cpp. vLLM y TGI no son la vía natural para GGUF estático de este tamaño; no disponible su soporte directo.
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del reparto entre VRAM y RAM y del ancho de banda de memoria; con offload a RAM, el throughput será bajo (del orden de pocos tokens por segundo en configuraciones domésticas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lumikabra-195b_v0.4 (este) | 195B (nominal) | no disponible | no disponible | GGUF | Fusión mergekit, solo inglés, cuantizaciones estáticas |
| lumikabra-195b_v0.4-i1-GGUF | 195B (nominal) | no disponible | no disponible | GGUF (imatrix) | Variante con cuantizaciones ponderadas del mismo autor base |
| Modelo base tachyphylaxis/lumikabra-195b_v0.4 | 195B (nominal) | no disponible | no disponible | safetensors (presumiblemente) | Fuente original de la cuantización |

No se dispone de información sobre modelos comparables de terceros con datos verificables de rendimiento, contexto o licencia en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo ni del merge, lo que impide confirmar si el uso comercial está permitido. Es imprescindible consultar el modelo base antes de cualquier despliegue productivo.
- Idioma limitado al inglés: la model card solo declara `en`; no hay evidencia de capacidades multilingües.
- Sin benchmarks publicados: no se puede evaluar su calidad frente a alternativas sin realizar pruebas propias.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de entrenamiento ni evaluación, no se puede acotar su fiabilidad factual.
- Origen por fusión (mergekit): las fusiones pueden heredar sesgos y comportamientos inconsistentes de los modelos donantes; no se documentan los donantes ni la técnica de fusión.
- Tamaño prohibitivo: incluso la cuantización más pequeña (Q2_K, 71,7 GB) exige hardware de gama muy alta; las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad de forma notable.
- Cuantizaciones estáticas frente a imatrix: las cuantizaciones de este repositorio no usan pesos imatrix; para mayor calidad por tamaño, el autor remite al repositorio `-i1-GGUF`.
- Ficheros multi-parte: es necesario concatenar las partes antes de usar el modelo; un manejo incorrecto produce ficheros corruptos.
- Fecha de creación (diciembre de 2024) y actualización posterior (noviembre de 2026): verificar que la versión descargada corresponde a la revisión deseada.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/lumikabra-195b_v0.4-GGUF
- Modelo base: https://huggingface.co/tachyphylaxis/lumikabra-195b_v0.4
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/lumikabra-195b_v0.4-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#lumikabra-195b_v0.4-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

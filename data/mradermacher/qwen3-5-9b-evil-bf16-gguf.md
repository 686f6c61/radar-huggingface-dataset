# mradermacher/Qwen3.5-9B-Evil-BF16-GGUF

## Resumen

`mradermacher/Qwen3.5-9B-Evil-BF16-GGUF` es un repositorio de cuantizaciones estáticas en formato GGUF generadas por mradermacher (nethype GmbH) a partir del modelo `bowmanslayer/Qwen3.5-9B-Evil-BF16`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una distribucion de pesos convertidos a GGUF para inferencia local con llama.cpp y derivados. El modelo base cuenta con 9.197.093.888 parametros (9,20 B) en precision BF16 y esta etiquetado por el autor con los tags `qwen3_5`, `evil` y `experimental`.

El repositorio resulta relevante por dos motivos practicos: ofrece trece variantes de cuantizacion (desde Q2_K de 4,0 GB hasta f16 de 18,5 GB) que permiten ejecutar un modelo de ~9 B en hardware de consumo, e incluye dos ficheros `mmproj` (proyector multimodal en Q8_0 y f16), lo que indica que el modelo base incorpora componentes de vision, aunque la model card no lo documenta de forma explicita.

La informacion publicada es muy escasa: no hay pipeline declarado, no hay datos de contexto, no hay resultados de benchmarks ni descripcion del proceso de entrenamiento o del ajuste que justifica el tag `evil`. Cualquier evaluacion en produccion debe hacerse con mediciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia Qwen3.5 segun el tag `qwen3_5`; detalles de capas y atencion no disponibles |
| Parametros totales | 9.197.093.888 (9,20 B), dato real de safetensors |
| Parametros activos | No aplica: no se documenta arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; versiones con imatrix en repositorio aparte (i1-GGUF); proyectores multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |
| Tamano del repositorio | 85,1 GB (incluye todas las variantes) |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo base mas alla del tag `qwen3_5`, que lo situa en la familia Qwen 3.5 de Alibaba. Con 9,20 B de parametros y pesos en BF16, se trata presumiblemente de un transformer denso con atencion completa, pero no se dispone de datos sobre numero de capas, dimensiones ocultas, tipo de positional encoding ni si emplea tecnicas como GQA o decodificacion especulativa.

Tampoco se documenta el proceso de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El autor del modelo base solo aporta el nombre `Qwen3.5-9B-Evil-BF16` y los tags `evil` y `experimental`, sin model card sustantiva. La unica aportacion tecnica verificable de este repositorio es la cuantizacion: mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y publica adicionalmente una familia de cuants con imatrix en `mradermacher/Qwen3.5-9B-Evil-BF16-i1-GGUF`, que suele ofrecer mejor relacion calidad/tamano que los cuants estaticos equivalentes.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la categoria `text-generation` en transformers indican uso previsto como modelo de chat.
- Capacidades multimodales probables: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` implica un proyector visual compatible con llama.cpp; la model card no detalla que modalidades cubre.
- Bilinguismo ingles-chino: unicos idiomas declarados en los metadatos.
- Cuantizacion flexible: trece variantes de pesos permiten ajustar el equilibrio calidad/memoria en el mismo modelo.
- Soporte de llama.cpp y ecosistema GGUF: compatible con Ollama, LM Studio, `llama-cpp-python` y servidores OpenAI-compatibles sobre GGUF (tag `endpoints_compatible`).
- Ajuste de estilo o comportamiento: el tag `evil` sugiere una modulacion deliberada del tono o de las restricciones de respuesta; el autor no especifica el metodo.
- No confirmado: soporte de tool calling, modo thinking, ejecucion multi-paso de agentes o capacidades de audio. No hay evidencia en la informacion disponible.

## Casos de uso

- **Prototipado local sin GPU dedicada**: la variante Q4_K_S (5,6 GB) o Q4_K_M (5,9 GB) permite ejecutar el modelo en un portatil con GPU de 8 GB o incluso en CPU con llama.cpp, lo que sirve para validar prompts y flujos conversacionales antes de escalar a un modelo mayor.
- **Evaluacion comparativa de cuantizaciones**: al publicarse Q2_K, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0 y f16 del mismo modelo, el repositorio es util para medir la degradacion de perplejidad y calidad por nivel de cuantizacion en tareas concretas del usuario.
- **Investigacion sobre alineacion y robustez de filtros**: un modelo etiquetado `evil` y `experimental` sirve como caso de estudio en red-teaming y evaluacion de guardarrailes, comparando sus respuestas con las de la version no modificada del mismo modelo base.
- **Generacion creativa sin restricciones de estilo**: para escritura de ficcion con tono duro, guiones o dialogos donde se busca un registro sin matices; el caracter experimental del ajuste exige revision humana del resultado.
- **Procesamiento bilingue ingles-chino en local**: atencion al cliente o traduccion asistida en entornos donde no se puede enviar texto a una API externa por requisitos de privacidad, usando Q5_K_M (6,7 GB) en una GPU de 12 GB.
- **Despliegue en entornos aislados (air-gapped)**: al distribuirse en GGUF y con licencia Apache 2.0, el modelo se puede empaquetar en una imagen de contenedor con llama.cpp para infraestructura sin acceso a Internet, sin dependencias de servicios cloud.
- **Experimentos multimodales con llama.cpp**: los ficheros `mmproj` permiten probar entrada de imagenes junto a texto en el servidor `llama-server`, siempre que se confirme empiricamente el soporte del modelo base.
- **Banco de pruebas de inferencia**: util para medir throughput y latencia de un modelo de ~9 B en distintos backends (llama.cpp frente a vLLM con los safetensors del modelo base) y decidir la arquitectura de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base no aporta datos en los metadatos consultados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: proporcional al tamano del fichero GGUF mas la cache KV. Referencias: Q2_K 4,0 GB; Q3_K_M 4,8 GB; IQ4_XS 5,5 GB; Q4_K_M 5,9 GB; Q5_K_M 6,7 GB; Q6_K 7,7 GB; Q8_0 9,9 GB; f16 18,5 GB. Con contextos largos hay que sumar varios GB adicionales de cache KV (no se puede calcular sin conocer el numero de capas y cabezas).
- **Cabe en GPU de consumo**: si. Q4_K_M encaja en 8 GB de VRAM con contexto moderado; Q5_K_M y Q6_K requieren 10-12 GB; Q8_0 requiere 12-16 GB; f16 requiere 24 GB (RTX 3090, RTX 4090, RTX 5090) y deja poco margen para contexto.
- **GPU recomendadas**: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuants Q4-Q6; RTX 4090 / RTX 5090 o A6000 para Q8_0 y f16; A100 40/80 GB o H100 solo si se sirve en paralelo a varios usuarios o se usa el modelo base en BF16 con vLLM.
- **Ejecucion en CPU**: viable con Q4_K_S o Q2_K en equipos con 16 GB de RAM, a costa de latencia alta (orden de pocos tokens por segundo; cifra no verificada para este modelo).
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama importando el GGUF mediante Modelfile, LM Studio, `llama-cpp-python`, y para los pesos originales en safetensors, vLLM o TGI. No hay suspense de que el repositorio funcione con transformers directamente: la libreria declarada es `transformers`, pero los ficheros son GGUF.
- **Latencia y throughput**: no disponibles. Dependen de la variante de cuantizacion, del backend y del hardware; se recomienda medirlos con `llama-bench` antes de dimensionar produccion.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de informacion publica general y no del repositorio analizado; los benchmarks no estan disponibles en ninguno de los casos.

| Modelo | Parametros | Contexto | Licencia | GGUF disponible | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Evil-BF16 (este) | 9,20 B | No disponible | Apache 2.0 | Si, 13 variantes + mmproj | Ajuste experimental con tag `evil`; sin benchmarks publicados |
| Qwen3-8B | 8,2 B | 32.768 tokens nativo, extensible a 131.072 con YaRN | Apache 2.0 | Si | Referencia de la misma familia; soporte oficial de tool calling |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Si | Licencia con clausulas de uso aceptable, no Apache |
| Gemma 2 9B | 9,24 B | 8.192 tokens | Gemma Terms of Use | Si | Contexto mas corto; licencia con restricciones de uso |

La comparacion significativa en tamano es con Qwen3-8B y Gemma 2 9B. Frente a ellos, este repositorio no puede evaluarse en calidad al no publicar metricas; su ventaja operativa es la disponibilidad de proyectores multimodales junto a los GGUF.

## Limitaciones y advertencias

- **Ausencia total de evaluacion**: no hay benchmarks, no hay model card del modelo base con detalles de entrenamiento y no hay pipeline declarado. Cualquier afirmacion de calidad es especulativa.
- **Naturaleza experimental y tag `evil`**: el nombre sugiere un ajuste orientado a reducir filtros o forzar un tono hostil. Es previsible que el modelo incumpla directrices de contenido y genere respuestas ofensivas; no es apto para aplicaciones de cara al usuario sin una capa de moderacion propia.
- **Riesgo de alucinacion**: no cuantificado por el autor. Como en cualquier modelo de 9 B, es esperable una tasa de error alta en tareas de conocimiento factual y razonamiento largo.
- **Cobertura idiomatica limitada**: solo ingles y chino declarados. El rendimiento en castellano no esta garantizado ni documentado.
- **Contexto desconocido**: no se puede planificar un caso de uso con documentos largos sin medir empiricamente la ventana efectiva antes de disenar la aplicacion.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero el modelo base podria arrastrar condiciones adicionales no reflejadas en los metadatos; conviene verificar el repositorio `bowmanslayer/Qwen3.5-9B-Evil-BF16` antes de explotarlo comercialmente.
- **Cero traccion**: 0 descargas y 0 likes en el momento de la consulta. No hay validacion de la comunidad ni informes de terceros sobre su comportamiento.
- **Deriva de cuantizacion**: las variantes Q2_K y Q3_K_S degradan notablemente la calidad en modelos de este tamano; para uso real conviene partir de Q4_K_M o superior.
- **Proyectores multimodales sin documentar**: la funcionalidad de vision no esta confirmada por el autor; su soporte depende de la version de llama.cpp y del modelo base.
- **Fecha de creacion futura en los metadatos** (2026-10-28): conviene contrastar la trazabilidad del repositorio antes de integrarlo en un pipeline de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-9B-Evil-BF16-GGUF
- Modelo base: https://huggingface.co/bowmanslayer/Qwen3.5-9B-Evil-BF16
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-Evil-BF16-i1-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Qwen3.5-9B-Evil-BF16-GGUF
- Peticiones de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa responsable de la cuantizacion: https://www.nethype.de/

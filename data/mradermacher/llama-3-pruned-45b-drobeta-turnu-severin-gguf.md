# mradermacher/Llama-3-pruned-45B-Drobeta-Turnu-Severin-GGUF

## Resumen

Llama-3-pruned-45B-Drobeta-Turnu-Severin-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo Mihaiii/Llama-3-pruned-45B-Drobeta-Turnu-Severin, publicada por mradermacher el 6 de marzo de 2025. El modelo subyacente es una versión podada de Llama 3 que conserva 44.884.074.496 parámetros (aproximadamente 45B), lo que lo sitúa en la gama alta de modelos densos de la familia Llama 3. El repositorio no incluye pesos originales en safetensors, sino únicamente los ficheros GGUF listos para inferencia con llama.cpp y derivados.

El nombre "Drobeta-Turnu-Severin" hace referencia a una ciudad rumana y sugiere un ajuste fino de carácter local o temático, aunque la model card no documenta el proceso de entrenamiento ni los datos utilizados. La model card del cuantizador se limita a indicar que se trata de cuantizaciones estáticas del modelo base, sin aportar información sobre el dataset, el proceso de poda ni las capacidades reales del modelo. La licencia es "other", heredada del modelo base, y el idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~45B parámetros en hardware de consumo mediante cuantizaciones de 17 a 48 GB, algo imposible con los pesos completos en fp16 (que ocuparían unos 90 GB). Es, por tanto, un recurso práctico para investigadores que quieran experimentar con un modelo grande en local, aunque con las cautelas propias de una poda no documentada y de una licencia no estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3, podada); detalles no disponibles |
| Parametros totales | 44.884.074.496 (~45B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | other (heredada del modelo base, sin detalle) |
| Formato de pesos | GGUF (cuantizaciones estáticas); no se incluyen safetensors en este repo |

## Arquitectura y entrenamiento

El modelo base es una poda de Llama 3, según indica el propio nombre del repositorio. Llama 3 es un transformer decoder-only con atención causal estándar, pero no se dispone de información sobre qué capas, cabezas o dimensiones se han eliminado durante la poda, ni sobre si se aplicó algún proceso de recuperación (fine-tuning tras la poda). Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card del cuantizador no aporta ningún dato al respecto.

La única innovación técnica documentada es la propia cuantización: mradermacher utiliza cuantizaciones estáticas (sin imatrix) para este repositorio, y ofrece una variante con cuantizaciones ponderadas/imatrix en un repositorio separado (Llama-3-pruned-45B-Drobeta-Turnu-Severin-i1-GGUF). Las cuantizaciones IQ4_XS y Q4_K_M se marcan como "fast, recommended" en la tabla del autor, mientras que Q6_K se describe como "very good quality" y Q8_0 como "fast, best quality". No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto conversacional: el tag "conversational" sugiere que el modelo está orientado a diálogo, aunque no se detalla el formato de prompt.
- Razonamiento y conocimiento general: capacidades heredadas de Llama 3, pero sin benchmarks que las cuantifiquen tras la poda.
- Código y matemáticas: no documentado; no hay evidencia de que la poda haya preservado estas capacidades.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Inferencia local vía llama.cpp: es la capacidad mejor documentada, gracias a los ficheros GGUF.

## Casos de uso

- Experimentación local con modelos de ~45B: descargar la cuantización Q4_K_M (27,2 GB) y ejecutarla con llama.cpp en una estación de trabajo con 32 GB de VRAM o con descarga parcial a CPU. Es adecuado para investigadores que quieran comparar el comportamiento de un modelo grande podado frente a alternativas más pequeñas.
- Evaluación de los efectos de la poda: al disponer de cuantizaciones desde Q2_K hasta Q8_0, se puede medir cómo degrada la calidad al reducir precisión y, por extensión, estudiar la robustez del modelo podado.
- Generación de texto en inglés para prototipos: el tag conversacional permite usar el modelo en pipelines de chat simples, siempre que se acepte la falta de documentación sobre su calidad real.
- Despliegue en entornos con GPU de gama alta pero no de datacenter: una RTX 4090 (24 GB) puede ejecutar Q2_K (17 GB) o Q3_K_S (19,8 GB) íntegramente en VRAM, lo que permite probar el modelo sin infraestructura en la nube.
- Investigación sobre cuantización: comparar las cuantizaciones estáticas de este repo con las imatrix del repo i1 permite estudiar el impacto de las matrices de importancia en modelos podados de gran tamaño.
- Base para fine-tuning posterior (con cautela): aunque el repo solo ofrece GGUF, el modelo base en safetensors podría servir de punto de partida para ajustes, siempre que la licencia "other" lo permita, algo que no está claro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF):
  - Q2_K: 17,0 GB
  - Q3_K_S: 19,8 GB
  - Q3_K_M: 22,0 GB
  - Q3_K_L: 23,8 GB
  - IQ4_XS: 24,5 GB
  - Q4_K_S: 25,8 GB
  - Q4_K_M: 27,2 GB
  - Q5_K_S: 31,1 GB
  - Q5_K_M: 31,9 GB
  - Q6_K: 36,9 GB
  - Q8_0: 47,8 GB
- GPU recomendadas: A100 40/80 GB o H100 para cuantizaciones altas (Q6_K, Q8_0) sin offload; RTX 4090 (24 GB) solo para Q2_K y Q3_K_S; RTX 3090 (24 GB) en las mismas condiciones.
- ¿Cabe en consumer GPU? Solo las cuantizaciones más bajas (Q2_K, Q3_K_S) caben íntegramente en 24 GB. El resto requiere offload a RAM o GPUs con más VRAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM ni TGI, que trabajan mejor con safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3-pruned-45B-Drobeta-Turnu-Severin (este) | ~45B | no disponible | other | GGUF | Poda no documentada, solo inglés |
| Llama 3 70B | 70B | 8K (estándar Llama 3) | Llama 3 Community License | safetensors, GGUF | Modelo oficial, benchmarks públicos, multilingüe |
| Llama 3 8B | 8B | 8K | Llama 3 Community License | safetensors, GGUF | Mucho más pequeño, cabe en consumer GPU, benchmarks públicos |
| Mistral Large / Mixtral 8x7B | 8x7B (MoE) | 32K | Apache 2.0 (Mixtral) | safetensors, GGUF | Alternativa MoE con licencia permisiva |

La comparación directa es difícil porque no hay benchmarks del modelo podado. Frente a Llama 3 70B, este modelo ofrece menos parámetros y un tamaño de fichero menor en cuantizaciones equivalentes, pero carece de la documentación y garantías del modelo oficial. Frente a Llama 3 8B, es mucho más grande y requiere hardware superior, sin evidencia de que la calidad sea proporcionalmente mejor tras la poda. La licencia "other" es un obstáculo frente a la Apache 2.0 de Mixtral para uso comercial.

## Limitaciones y advertencias

- La poda no está documentada: se desconoce qué se eliminó y si hubo recuperación, por lo que la calidad puede ser muy inferior a la de un Llama 3 completo de tamaño similar.
- Sin benchmarks: no hay forma de verificar el rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Riesgo de alucinación: inherente a los modelos de lenguaje, pero agravado por la falta de evaluación tras la poda.
- Idioma: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia "other": no se especifican los términos, por lo que el uso comercial es incierto y requiere consultar el modelo base y, en su caso, la licencia de Llama 3.
- Contexto desconocido: no se indica la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.
- Repositorio de 306,8 GB: contiene todas las cuantizaciones, lo que exige descargar solo el fichero deseado y disponer de espacio suficiente.
- Solo 186 descargas y 0 likes: modelo con muy poca validación por parte de la comunidad.
- El nombre "Drobeta-Turnu-Severin" sugiere un ajuste temático local, pero no se documenta, por lo que su especialización es desconocida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3-pruned-45B-Drobeta-Turnu-Severin-GGUF
- Modelo base: https://huggingface.co/Mihaiii/Llama-3-pruned-45B-Drobeta-Turnu-Severin
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama-3-pruned-45B-Drobeta-Turnu-Severin-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama-3-pruned-45B-Drobeta-Turnu-Severin-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

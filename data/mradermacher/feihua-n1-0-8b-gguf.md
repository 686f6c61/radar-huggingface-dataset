# mradermacher/Feihua-n1-0.8B-GGUF

## Resumen

`mradermacher/Feihua-n1-0.8B-GGUF` es un repositorio de pesos cuantizados en formato GGUF generado por mradermacher a partir del modelo `ZZRI/Feihua-n1-0.8B`. No se trata por tanto de un modelo entrenado por el autor del repositorio, sino de una conversión y cuantización estática del modelo original, publicada bajo licencia Apache 2.0 y pensada para su uso con llama.cpp y herramientas compatibles.

El modelo base tiene 752.393.024 parámetros (unos 0,75 mil millones, comercializado como 0.8B) y está etiquetado con `qwen3_5`, lo que apunta a una arquitectura de la familia Qwen, además de las etiquetas `nonsense` y `废话文学` ("literatura de relleno" o "texto sin sentido"). Los idiomas declarados son inglés (en) y chino (zh), y el repositorio incluye 12 variantes de cuantización que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB).

Su relevancia práctica es limitada y muy específica: se trata de un modelo experimental de tamaño reducido, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y sin documentación sobre el proceso de entrenamiento. Resulta útil como objeto de estudio de la generación de texto absurdo o redundante, como base para experimentos de ajuste fino en local y como banco de pruebas de pipelines GGUF en hardware muy modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `qwen3_5` sugiere una arquitectura transformer de la familia Qwen, pero la model card no la documenta. |
| Parametros totales | 752.393.024 (aprox. 0,75B; el repositorio lo denomina 0.8B) |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base `ZZRI/Feihua-n1-0.8B` |
| Tamano del repositorio | 7,5 GB (suma de todas las cuantizaciones) |
| Cuantizador | mradermacher (cuantización estática) |
| Modelo base | ZZRI/Feihua-n1-0.8B |
| Fecha de publicacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card del repositorio no documenta la arquitectura interna, el número de capas, la dimensión oculta ni el mecanismo de atención. El único indicio técnico es la etiqueta `qwen3_5`, que sitúa el modelo base dentro de la familia Qwen, y la etiqueta `transformers`, que confirma compatibilidad con esa librería. Tampoco se especifica si emplea atención completa, atención con ventana deslizante u otra variante, ni si incorpora decodificación especulativa o alguna innovación de eficiencia.

Respecto a los datos de entrenamiento, no hay información disponible sobre el volumen de tokens, la composición del corpus, el uso de RLHF, DPO u otras técnicas de alineamiento. Las etiquetas `nonsense` y `废话文学` indican que el comportamiento esperado del modelo es generar texto redundante, circular o deliberadamente vacío de contenido, un género humorístico muy popular en internet en China. Esta ficha se limita a describir lo declarado por el autor; cualquier afirmación sobre calidad de entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés y chino, con comportamiento declarado de "texto sin sentido" o relleno estilizado.
- Producción de texto redundante y circular de forma controlada, útil para experimentos sobre el fenómeno `废话文学`.
- Compatibilidad con llama.cpp y con cualquier runtime que consuma archivos GGUF.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de visión, audio o modo de pensamiento explícito: no disponibles.
- Capacidades multilingües fuera de en/zh: no documentadas.
- Con 752 millones de parámetros, la generación de código, matemáticas o razonamiento formal no está documentada ni respaldada por benchmarks.

## Casos de uso

- Investigación sobre `废话文学`: el modelo permite estudiar de forma controlada la generación de texto redundante y sin carga informativa, con un tamaño que hace viable ejecutar cientos de experimentos en una sola GPU de consumo.
- Generación de texto de relleno para maquetación: sustituye a los clásicos "lorem ipsum" produciendo texto con estructura gramatical real en inglés o chino, útil en plantillas de diseño y pruebas de interfaz.
- Prototipado de aplicaciones de chat en local: con archivos desde 0,5 GB, permite validar de extremo a extremo la integración con llama.cpp o llama-cpp-python antes de invertir en un modelo mayor.
- Banco de pruebas de pipelines GGUF: sirve para verificar la carga de distintas cuantizaciones (Q2_K frente a Q8_0), medir consumo de memoria y validar scripts de despliegue sin depender de descargas de decenas de gigabytes.
- Base para ajuste fino (fine-tuning) experimental: al ser un modelo pequeño con licencia Apache 2.0, es un candidato razonable para LoRA o QLoRA orientados a estilos de escritura concretos, siempre que se parta de los pesos safetensors del modelo original.
- Despliegue en dispositivos con recursos muy limitados: la cuantización Q4_K_S ocupa 0,6 GB, lo que permite ejecución en CPU en equipos sin GPU dedicada o en placas tipo Raspberry Pi con suficiente RAM.
- Generación de ejemplos sintéticos para clasificadores de calidad textual: el texto deliberadamente vacío que produce puede utilizarse como clase negativa en tareas de detección de contenido de baja calidad o de spam.
- Demostraciones educativas sobre cuantización: ilustra de forma tangible el compromiso entre tamaño de archivo, calidad y velocidad en el ecosistema GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, C-Eval ni de ninguna otra evaluación estándar, y tampoco se ofrecen comparaciones de perplejidad entre las distintas cuantizaciones. La única referencia gráfica sobre calidad de cuantizaciones es un enlace externo genérico (gráfico de ikawrakow) que no corresponde a mediciones de este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño real de los archivos publicados):
  - Q2_K y Q3_K_S: 0,5 GB de pesos; en la práctica unos 1 GB de RAM/VRAM contando contexto y sobrecarga.
  - Q4_K_S, IQ4_XS y Q4_K_M: 0,6 GB de pesos; aproximadamente 1-1,5 GB en total.
  - Q5_K_S y Q5_K_M: 0,7 GB de pesos.
  - Q6_K: 0,7 GB; Q8_0: 0,9 GB; f16: 1,6 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. No se requiere A100, H100 ni RTX 4090 para este tamaño; una GTX 1650, RTX 3050 o incluso gráfica integrada con memoria compartida puede ejecutarlo.
- Compatibilidad con GPU de consumo: sí, en todas las cuantizaciones, incluidas las más grandes.
- Ejecución en CPU: totalmente viable, con cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y cualquier runtime compatible con GGUF. El soporte de vLLM para GGUF es parcial y no está documentado para este modelo; TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los datos de los modelos alternativos que figuran a continuación no provienen de la información proporcionada para esta ficha y deben verificarse antes de tomar decisiones técnicas.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Feihua-n1-0.8B (este repositorio) | 752.393.024 | No disponible | Apache 2.0 | GGUF (12 cuantizaciones) y safetensors en el modelo base | Publicado, 0 descargas y 0 likes en el momento de la consulta |
| Modelos pequenos de la familia Qwen (0,5B-0,6B) | No disponible en la informacion proporcionada | No disponible | No disponible | GGUF y safetensors | Ampliamente desplegados |
| Modelos pequenos tipo SmolLM (135M-360M) | No disponible en la informacion proporcionada | No disponible | No disponible | GGUF y safetensors | Ampliamente desplegados |

La diferencia funcional principal de Feihua-n1 no es su tamaño ni su eficiencia, sino su propósito declarado de generar texto sin sentido. Frente a modelos pequeños de propósito general, carece de benchmarks publicados y de documentación de entrenamiento, por lo que no es comparable en términos de calidad medible.

## Limitaciones y advertencias

- El modelo está etiquetado explícitamente como `nonsense` y `废话文学`: su salida esperada es texto redundante o vacío de contenido, no respuestas útiles y precisas.
- Riesgo elevado de alucinación y de deriva temática, acentuado por la ausencia total de benchmarks y de documentación del entrenamiento.
- No hay información sobre sesgos de género, etnia, religión o políticos en los datos de entrenamiento, ni sobre filtros de seguridad aplicados.
- Cobertura idiomática limitada a inglés y chino; el comportamiento en castellano no está documentado y previsiblemente será deficiente.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones multi-turno largas ni en tareas de recuperación sobre documentos extensos.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero al tratarse de una cuantización derivada conviene revisar también las condiciones del modelo base `ZZRI/Feihua-n1-0.8B`.
- El repositorio no incluye cuantizaciones ponderadas ni con matriz de importancia (imatrix); el autor indica que no están previstas, lo que puede afectar a la calidad relativa de las cuantizaciones bajas (Q2_K, Q3_K_S).
- Ausencia total de tracción (0 descargas, 0 likes) implica que no existe validación comunitaria de su funcionamiento en producción.
- No se documenta soporte de tool calling, agentes, visión ni modo de razonamiento; no debe asumirse ninguna de estas capacidades.
- La fecha de creación indicada (2026) sitúa el repositorio en el futuro respecto al conocimiento habitual de la familia Qwen3.5, por lo que conviene verificar la procedencia y el contenido del modelo base antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Feihua-n1-0.8B-GGUF
- Modelo base: https://huggingface.co/ZZRI/Feihua-n1-0.8B
- Página de resumen de cuantizaciones del autor: https://hf.tst.eu/model#Feihua-n1-0.8B-GGUF
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de archivos GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

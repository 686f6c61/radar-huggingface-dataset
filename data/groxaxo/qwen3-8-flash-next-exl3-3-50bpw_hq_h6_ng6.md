# groxaxo/Qwen3.8-Flash-Next-exl3-3.50bpw_hq_h6_ng6

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con encoder de visión publicado por el equipo Qwen como previsualización experimental de la arquitectura que sustentará Qwen4. La ficha analizada, groxaxo/Qwen3.8-Flash-Next-exl3-3.50bpw_hq_h6_ng6, es una compilación cuantizada en formato EXL3 a 3,50 bits por peso del mismo modelo, distribuida por el usuario groxaxo, con 99,2 GB de pesos en el repositorio.

Según la model card, la arquitectura combina atención híbrida (Gated DeltaNet más Qwen Sparse Attention), Mixture of Experts con 512 expertos (10 enrutados más 1 compartido), Gated Residual y N-gram Embedding, con 262.144 tokens de contexto nativo extensibles a 1.000.000. La model card declara 125.000 millones de parámetros en el modelo de lenguaje con 6.000 millones activos, más 51.000 millones en el embedding de n-gramas y 4.000 millones en el módulo MTP; los metadatos de safetensors del repositorio, en cambio, reportan 30.002.216.448 parámetros, una discrepancia que la información disponible no explica.

Su relevancia es doble. Por un lado, anticipa decisiones de diseño orientadas a cargas agénticas: QSA opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, y el embedding de n-gramas añade capacidad de escalado en parámetros que es más fácil de descargar a memoria de host. Por otro, esta variante cuantizada reduce el peso en disco a 99,2 GB, lo que hace viable evaluar el modelo en hardware mucho más modesto que el que exigirían los pesos en precisión completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con MoE y encoder de visión: 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)), 48 capas, Gated Residual y N-gram Embedding |
| Parametros totales | 30.002.216.448 según los metadatos de safetensors del repositorio; la model card declara 125.000 millones en el LM + 51.000 millones de n-gram embedding + 4.000 millones de MTP (discrepancia no explicada) |
| Parametros activos | 6.000 millones en el LM: 10 expertos enrutados + 1 compartido, de un total de 512 expertos |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | EXL3 a 3,50 bits por peso (indicado en el nombre del repositorio); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo license: other) |
| Formato de pesos | safetensors en formato transformers, cuantizados en EXL3 |
| Tamaño del repositorio | 99,2 GB |
| Dimensión oculta | 2.560 |
| Embedding de tokens | 248.320 (con padding) |
| Embedding de n-gramas | 20.000.000 entradas (bigramas y trigramas, en la capa 2) |
| Cabeza de atención dispersa | 24 cabezas de consulta y 2 de clave-valor, dimensión 256, RoPE de 64, presupuesto de 512 bloques (2.048 tokens) |
| Cabeza de atención lineal | 48 cabezas para V y 16 para QK, dimensión 128 |
| MTP | 1 capa, entrenada con múltiples pasos |

## Arquitectura y entrenamiento

El modelo es un transformer causal híbrido con encoder de visión. El bloque se repite 12 veces y cada repetición encadena tres subcapas de Gated DeltaNet (atención lineal) más una de Qwen Sparse Attention (QSA). QSA no selecciona tokens individuales sino micro-bloques, con un presupuesto de 512 bloques o 2.048 tokens, y usa un indexador basado en MQA con 4 cabezas de consulta y 1 cabeza de clave compartida de dimensión 128. El objetivo declarado de este diseño es reducir la latencia en contextos largos, un cuello de botella crítico en cargas agénticas. La capa MoE intercala 512 expertos de dimensión intermedia 640, activando 10 enrutados más 1 compartido por token. El Gated Residual modula el flujo de información en flujos residuales ensanchados mediante una puerta de lectura dependiente de los datos y una puerta escalar de escritura por rama, con 4 ramas y rango de cuello de botella 320. El N-gram Embedding indexa por bigramas y trigramas en la capa 2, lo que permite escalar parámetros con menos cómputo y facilita descargarlos a memoria de host.

En cuanto al entrenamiento, la model card indica que el modelo pasa por preentrenamiento y postentrenamiento, y que la receta combina los optimizadores Muon y AdamW aplicados a categorías de pesos específicas. Se elimina el calentamiento tradicional del tamaño de lote y se arranca directamente con el lote objetivo, guiado por leyes de escalado reajustadas, lo que reduce el número total de pasos del optimizador y permite tasas de aprendizaje mayores. El módulo MTP de una capa se entrena con múltiples pasos. No se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto causal con 262.144 tokens de contexto nativo y extensión hasta 1.000.000.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), gracias al encoder de visión.
- Razonamiento de contexto largo con latencia reducida por QSA a nivel de micro-bloque, orientado a flujos agénticos multi-turno.
- Mixture of Experts con 6.000 millones de parámetros activos sobre 512 expertos, lo que mantiene el coste de cómputo por token relativamente bajo frente al total de parámetros.
- Módulo MTP de una capa entrenado con múltiples pasos, que en arquitecturas de este tipo suele emplearse para decodificación especulativa; la model card no detalla su uso en inferencia.
- Capacidades multilingües: no disponibles.
- Soporte de tool calling o function calling: no documentado para este modelo; la model card atribuye las herramientas integradas a Qwen3.8-Flash, la versión servida por API.
- Capacidades de agente y razonamiento multi-paso: mencionadas de forma indirecta, al justificar el diseño de QSA por la carga agéntica, sin especificación funcional.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens nativos de contexto se puede mantener el historial completo de una conversación multi-turno, junto con la documentación de producto, sin truncar información ni recurrir a resúmenes intermedios.
- Análisis de documentación técnica extensa: ingesta de manuales, normativas o contratos completos en una sola ventana y generación de resúmenes o extracción de cláusulas concretas, aprovechando la extensión a 1.000.000 de tokens.
- Procesamiento de documentos con imagen: al aceptar entradas de imagen y texto, el modelo puede extraer datos de capturas, diagramas o formularios escaneados y devolver texto estructurado.
- Asistentes de código en repositorios grandes: el contexto largo permite cargar varios ficheros y trazas de error a la vez para localizar la causa de un fallo, aunque el soporte formal de tool calling no está documentado y habría que validarlo.
- Investigación sobre arquitecturas eficientes: al ser una previsualización experimental de la línea que llevará a Qwen4, sirve como banco de pruebas para medir el comportamiento de QSA, Gated Residual y los n-gram embeddings frente a alternativas más convencionales.
- Evaluación de cuantización agresiva: esta variante a 3,50 bits por peso permite medir la degradación de calidad respecto a los pesos originales en tareas concretas del dominio propio antes de comprometerse con un despliegue.
- Indexación semántica de corpus multilingües o de gran volumen: combinado con un motor de búsqueda vectorial, el modelo puede reranquear fragmentos largos o resumir pasajes conservando el contexto completo del documento.
- Despliegue en investigación académica con presupuesto limitado: los 99,2 GB del repositorio permiten servir el modelo en nodos con dos aceleradores de 80 GB en lugar de exigir un clúster para los pesos en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de resultados que aparece truncada en el extracto proporcionado y no contiene cifras, y la búsqueda web no devolvió ninguna referencia técnica del modelo (los resultados obtenidos no guardan relación con el mismo). No se deben asumir valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- Los pesos del repositorio ocupan 99,2 GB, por lo que una inferencia totalmente residente en memoria de GPU exige del orden de 100 GB de VRAM. Es una estimación derivada del tamaño del repositorio, no una cifra oficial.
- GPU recomendadas para residencia completa: 1 × H200 (141 GB) o 2 × H100 / 2 × A100 de 80 GB.
- La model card señala que el embedding de n-gramas es más fácil de descargar a memoria de host que una capa MoE, de modo que un despliegue híbrido con offload de esas tablas podría reducir el requisito de VRAM por debajo de los 80 GB. No hay cifras publicadas de rendimiento para esa configuración.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) sin offload masivo a CPU y RAM del sistema, con la penalización de latencia que eso implica. No hay datos publicados de velocidad en ese escenario.
- Opciones de despliegue documentadas en la model card: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- El sufijo exl3 del nombre del repositorio apunta al formato de cuantización EXL3, asociado al ecosistema ExLlamaV3; la model card no confirma el runtime recomendado para esta variante.
- Compatibilidad con llama.cpp u Ollama: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-exl3-3.50bpw_hq_h6_ng6 (esta ficha) | 30.002.216.448 según safetensors del repo; la model card declara ~180.000 millones en total | 262.144, extensible a 1.000.000 | safetensors + EXL3 a 3,50 bpw, 99,2 GB | qwen-community-1.0 | Repositorio público en Hugging Face con 0 descargas y 0 likes |
| Qwen3.8-Flash-Next (pesos originales del autor) | 125.000 millones en el LM con 6.000 millones activos, más 51.000 millones de n-gram embedding y 4.000 millones de MTP | 262.144, extensible a 1.000.000 | Precisión completa en formato transformers | qwen-community-1.0 | Pesos abiertos publicados por el equipo Qwen |
| Qwen3.8-Flash (servicio gestionado) | No disponible | 1.000.000 por defecto | API | No disponible | Qwen Cloud, con herramientas integradas |

No se dispone de datos de rendimiento de ninguno de los tres, por lo que la comparación se limita a parámetros, contexto, formato y disponibilidad. No se han identificado en la información proporcionada otros modelos abiertos de la misma categoría con los que establecer una comparación numérica.

## Limitaciones y advertencias

- Discrepancia no resuelta en el recuento de parámetros: los metadatos de safetensors indican 30.002.216.448, mientras que la model card declara 125.000 millones más 51.000 millones más 4.000 millones. Hay que verificarlo antes de planificar hardware o costes.
- Es una previsualización experimental de una arquitectura en desarrollo, no un modelo de producción consolidado.
- La cuantización a 3,50 bits por peso puede degradar la calidad respecto a los pesos originales, especialmente en tareas sensibles al detalle numérico o al código; conviene medirlo en el dominio propio.
- No hay resultados de benchmarks publicados en la información disponible, por lo que no se puede contrastar el rendimiento declarado con ninguna referencia externa.
- El repositorio registra 0 descargas y 0 likes, lo que implica ausencia de validación comunitaria.
- La lista de idiomas soportados no está disponible, lo que impide garantizar un comportamiento correcto en castellano o en otros idiomas concretos.
- Riesgo de alucinación inherente a los modelos generativos, sin datos publicados que permitan acotarlo.
- La licencia figura como "other" con nombre qwen-community-1.0. No se detallan los términos en la información disponible; es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- El soporte de tool calling y de agentes no está documentado para esta variante; las herramientas integradas se atribuyen a la versión servida por API.
- El formato EXL3 puede limitar el ecosistema de despliegue disponible frente a formatos más extendidos como GGUF o los safetensors sin cuantizar.
- El módulo MTP se describe como entrenado con múltiples pasos, pero no se especifica si se aprovecha para decodificación especulativa ni con qué ganancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/Qwen3.8-Flash-Next-exl3-3.50bpw_hq_h6_ng6
- Blog del modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Esquema de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
- Versión gestionada Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Servicio Qwen Cloud: https://www.qwencloud.com

# mradermacher/Zen-3B-It-Obliterated-i1-GGUF

## Resumen

Zen-3B-It-Obliterated-i1-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo edusc182/Zen-3B-It-Obliterated. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local: el autor aplica cuantización con matriz de importancia (imatrix, de ahí el sufijo "i1") para producir versiones de bajo número de bits que pueden ejecutarse en CPU y en GPU de gama de consumo mediante llama.cpp, Ollama o LM Studio.

El nombre del modelo base indica un tamano de 3B parámetros y el sufijo "It" sugiere un ajuste por instrucciones, mientras que "Obliterated" apunta a una variante del tipo abliterated, es decir, con las direcciones de rechazo eliminadas del espacio de activaciones. Esta interpretación procede únicamente de la nomenclatura: la model card no documenta ni el proceso de abliteración ni el entrenamiento original.

La relevancia del repositorio es acotada y conviene ser explícito: cuenta con 0 descargas y 0 likes, el tamano del repositorio figura como 0,0 GB y la tabla de archivos proporcionados solo lista el fichero imatrix (0,1 GB), no las cuantizaciones finales. Además, no se declara licencia en los metadatos de HuggingFace, lo que bloquea cualquier evaluación de uso comercial hasta que el autor la aclare.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 838.908 registrados en los metadatos de safetensors del repositorio; el nombre del modelo indica 3B. Existe una discrepancia no resuelta entre ambos datos |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL (según la lista de la model card; la tabla de archivos solo enumera el fichero imatrix de 0,1 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (variantes imatrix/i1 y cuantizaciones estáticas en el repositorio complementario) |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base. La model card del repositorio de cuantizaciones no describe el tipo de red (transformer decoder-only, MoE, SSM u otro), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta el procedimiento de abliteración que sugiere el nombre "Obliterated".

La única innovación técnica documentada es el propio proceso de cuantización: el autor emplea cuantización con matriz de importancia (imatrix), generada a partir de un corpus de calibración y publicada como fichero aparte, para reducir la pérdida de perplejidad en los niveles bajos de bits. La model card incluye además comentarios internos que indican `output_tensor_quantised: 1`, `convert_type: hf` y la etiqueta `nicoboss`, que hacen referencia al proveedor de cómputo utilizado para generar los cuantos.

## Capacidades

- Generación de texto en inglés: es la única capacidad deducible de los metadatos, a través de la etiqueta de idioma `en`.
- Formato de instrucciones: el sufijo "It" del nombre del modelo base apunta a un ajuste por instrucciones orientado a diálogo, pero la model card no lo confirma ni especifica la plantilla de chat.
- Razonamiento multi-paso y agentes: no disponible. No hay ninguna referencia a soporte de agentes en la información proporcionada.
- Tool calling o function calling: no disponible. No se declara ninguna interfaz de herramientas.
- Capacidades multilingües: no. La etiqueta de idioma se limita a inglés.
- Visión, audio o modalidades adicionales: no disponible. No se declaran y los tags no incluyen `mmproj`.
- Modo "thinking" o razonamiento explícito: no disponible.
- Comportamiento sin rechazos: se infiere del término "Obliterated" en el nombre del modelo base, sin confirmación documental.

## Casos de uso

- Asistente conversacional local sin conexión: con una cuantización Q4_K_M, un modelo de esta clase ocupa del orden de 2 GB, por lo que puede ejecutarse íntegramente en un portátil con 8 GB de RAM usando Ollama o llama.cpp, sin enviar datos a ningún servicio externo.
- Procesamiento por lotes de texto en inglés: tareas de resumen, extracción de entidades o clasificación de documentos servidas con `llama-server` en CPU, donde el coste por token es bajo y no se requiere hardware dedicado.
- Generación de texto creativo sin filtros: la naturaleza presumiblemente abliterada del modelo base lo hace adecuado para escritura de ficción, guiones y diálogos donde los filtros de rechazo de modelos alineados interrumpen la generación; conviene validar la coherencia y el tono manualmente.
- Investigación sobre alineación y comportamiento de rechazo: el modelo permite estudiar empíricamente cómo la eliminación de direcciones de rechazo afecta a la distribución de respuestas, comparándolo con la versión no modificada del modelo original.
- Prototipado rápido de aplicaciones de chat: sirve como modelo de pruebas para validar la integración de una interfaz conversacional (formato de prompt, streaming, gestión de historial) antes de migrar a un modelo mayor.
- Generación de datos sintéticos en inglés: producción de corpus de texto para pruebas de pipelines de NLP, etiquetado preliminar o aumento de datos, siempre con revisión posterior dado el riesgo de alucinación.
- Creación de cuantizaciones propias: el repositorio publica el fichero imatrix (`Zen-3B-It-Obliterated.imatrix.gguf`, 0,1 GB), que permite a terceros generar cuantos en niveles de bits no incluidos en la lista original siguiendo el flujo de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo orientativo asumiendo ~3B parámetros, no confirmado por los metadatos): IQ1/IQ2 alrededor de 1,0-1,3 GB; Q3_K alrededor de 1,5-1,7 GB; Q4_K_M alrededor de 1,8-2,1 GB; Q5_K_M alrededor de 2,2-2,4 GB; Q6_K alrededor de 2,5-2,8 GB; Q8_0 alrededor de 3,2-3,5 GB; precisión FP16 alrededor de 6,2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones de 4 bits; RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 ejecutan el modelo completo en VRAM con margen sobrado. No se requieren aceleradores de centro de datos como A100 o H100 para este tamano.
- Compatibilidad con GPU de consumo: sí. Un modelo de 3B cuantizado a 4 bits cabe en tarjetas de gama de entrada como GTX 1650 (4 GB) o incluso en gráficas integradas con memoria compartida, y también funciona en modo CPU puro.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui son las vías habituales para GGUF. vLLM y TGI admiten GGUF de forma parcial; si se dispone de los pesos originales en safetensors, es preferible usar vLLM o TGI con el modelo base sin cuantizar.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la información proporcionada; cualquier cifra sería una estimación sin respaldo.

## Comparativa con modelos similares

La comparación es estructural, por clase de tamano (3B), ya que no existe ningún dato de rendimiento publicado para Zen-3B-It-Obliterated. Los datos de las alternativas proceden de sus respectivas model cards públicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| Zen-3B-It-Obliterated-i1-GGUF | 838.908 según metadatos; 3B según el nombre (discrepancia) | no disponible | no disponible | Sí (repo i1 y repo estático de mradermacher) |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Sí, amplia disponibilidad de cuantizaciones |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | Sí, amplia disponibilidad de cuantizaciones |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Sí, amplia disponibilidad de cuantizaciones |

Diferencias relevantes: las tres alternativas tienen licencia explícita y permiten uso comercial bajo sus condiciones, mientras que Zen-3B no declara licencia. Ninguna de las alternativas es una variante abliterada, por lo que no compiten en el nicho de generación sin rechazos.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada no es posible determinar si se permite el uso comercial. Cualquier despliegue en producción debería posponerse hasta que el autor la especifique.
- Discrepancia en el recuento de parámetros: los metadatos de safetensors indican 838.908 parámetros, un valor incompatible con un modelo de 3B. Hay que verificar el modelo base antes de asumir cualquier requisito de memoria.
- Repositorio aparentemente incompleto: el tamano del repo figura como 0,0 GB y la tabla de archivos proporcionados solo incluye el fichero imatrix. Conviene comprobar si las cuantizaciones finales están realmente publicadas o si solo existen en el repositorio estático complementario.
- Idiomas: únicamente inglés. No hay evidencia de competencia en castellano ni en otras lenguas.
- Naturaleza presumiblemente abliterada: la eliminación de direcciones de rechazo suele reducir la utilidad de seguridad del modelo, aumentar la probabilidad de contenido tóxico o ilegal y, en algunos casos, degradar la coherencia general. No es adecuado para aplicaciones orientadas a usuarios finales sin filtros externos.
- Sin alineación de seguridad documentada ni evaluación de sesgos: no se han publicado análisis de sesgo, toxicidad ni robustez.
- Riesgo de alucinación: propio de modelos de 3B parámetros, especialmente en tareas de conocimiento factual, matemáticas y razonamiento encadenado. Requiere verificación factual en cualquier uso productivo.
- Contexto desconocido: al no documentarse la longitud de contexto, no se debe asumir una ventana larga ni construir aplicaciones que dependan de ella.
- Pérdida por cuantización: los niveles IQ1, IQ2 y Q2 introducen degradación notable de calidad frente a Q4_K_M o superiores; la propia model card enlaza comparativas de perplejidad que recomiendan evitar los cuantos de menor calidad salvo que el espacio sea crítico.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia de informes de terceros sobre calidad o fallos.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Zen-3B-It-Obliterated-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Zen-3B-It-Obliterated-GGUF
- Modelo base: https://huggingface.co/edusc182/Zen-3B-It-Obliterated
- Página resumen del autor para este modelo: https://hf.tst.eu/model#Zen-3B-It-Obliterated-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Contexto sobre modelos abliterados (debate en r/LocalLLaMA): https://www.reddit.com/r/LocalLLaMA/comments/1nq0cp9/important_why_abliterated_models_suck_here_is_a/
- Guía externa sobre modelos abliterados y GGUF: https://locallyuncensored.com/blog/abliterated-models-guide.html
- Empresa que soporta la infraestructura del cuantizador: https://www.nethype.de/

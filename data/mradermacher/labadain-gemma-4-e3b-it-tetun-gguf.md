# mradermacher/Labadain-Gemma-4-E3B-it-Tetun-GGUF

## Resumen

Labadain-Gemma-4-E3B-it-Tetun-GGUF es la versión cuantizada en formato GGUF del modelo Labadain-Gemma-4-E2B-it-Tetun, un ajuste fino mediante QLoRA (con Unsloth) del modelo base Gemma 4 de Google, especializado en tetun (tetun-dili), la lengua oficial de Timor-Leste. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, y el modelo original pertenece al perfil labadain. El objetivo es claro: dotar a una lengua de bajos recursos de un modelo conversacional utilizable en local, con licencia permisiva y pesos ligeros.

El modelo cuenta con 4.647.450.147 parámetros según los safetensors del repositorio, lo que lo sitúa en la gama de modelos pequeños (rango 4B-5B) aptos para hardware de consumo. La ficha del repositorio lo etiqueta como "E3B", mientras que el modelo base del que deriva se identifica como "E2B", una discrepancia que conviene tener presente al rastrear la cadena de derivación. El repositorio GGUF ocupa 49,6 GB e incluye cuantizaciones estáticas desde Q2_K hasta f16, además de complementos multimodales (mmproj) en Q8_0 y f16.

Su relevancia actual reside en dos factores: por un lado, la escasez de modelos conversacionales decentes para tetun, una lengua con pocos recursos digitales; por otro, la disponibilidad de cuantizaciones GGUF listas para usar con llama.cpp, Ollama o LM Studio, que permiten desplegar el modelo en portátiles y estaciones de trabajo sin GPU de datacenter. La licencia Apache 2.0 declarada en el repositorio facilita su uso comercial, aunque el modelo base Gemma arrastra su propia licencia específica que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4; detalles exactos no disponibles) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | tet (tetun), tdt (tetun-dili) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que deriva de la familia Gemma 4 de Google y que el ajuste se realizó con QLoRA mediante Unsloth sobre el modelo labadain/Labadain-Gemma-4-E2B-it-Tetun. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; las etiquetas del repositorio mencionan únicamente "qlora", "unsloth" y "conversational".

El proceso de cuantización sí está documentado: mradermacher generó cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y advierte de que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación. La presencia de ficheros mmproj (multi-modal supplement) sugiere que el modelo base incorpora capacidades multimodales heredadas de Gemma 4, aunque no se detalla qué modalidades cubre ni con qué calidad tras el ajuste fino en tetun.

## Capacidades

- Generación de texto conversacional en tetun y tetun-dili, orientada a diálogo multi-turno según la etiqueta "conversational".
- Ajuste fino específico para lengua de bajos recursos ("low-resource-language"), lo que sugiere un esfuerzo por mejorar la fluidez en un idioma poco representado en los corpus de preentrenamiento.
- Soporte multimodal potencial: los ficheros mmproj indican que el modelo base Gemma 4 admite entrada multimodal, aunque no se especifica el alcance tras el ajuste.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su integración en servicios de inferencia.
- No se documentan capacidades de tool calling, function calling, agentes ni modos de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas a los idiomas declarados (tet, tdt); no se confirma transferencia a otros idiomas.

## Casos de uso

- Atención al ciudadano en Timor-Leste: el modelo puede gestionar consultas en tetun sobre servicios públicos, trámites o información administrativa, aprovechando su ajuste específico al idioma y su naturaleza conversacional para mantener diálogos multi-turno.
- Digitalización de patrimonio lingüístico: generación y ampliación de textos en tetun para corpus, materiales educativos o traducciones asistidas, un caso típico de modelos afinados para lenguas de bajos recursos.
- Asistentes locales sin conexión: gracias a las cuantizaciones Q4_K_M (3,5 GB) y Q5_K_M (3,7 GB), puede desplegarse en portátiles con 8-16 GB de RAM mediante llama.cpp u Ollama, útil en zonas con conectividad limitada.
- Educación y aprendizaje del idioma: el modelo puede actuar como tutor conversacional en tetun, generando ejercicios, corrigiendo textos o explicando conceptos en la lengua local.
- Prototipado de aplicaciones de PLN para tetun: investigadores pueden usar el modelo como base para tareas de clasificación, resumen o generación, con la ventaja de que los GGUF permiten iterar rápidamente en hardware modesto.
- Integración en pipelines de inferencia compatibles con endpoints: al estar etiquetado como "endpoints_compatible", puede servirse detrás de APIs compatibles con el ecosistema de Hugging Face o con servidores GGUF como llama.cpp server, facilitando su incorporación a productos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~3,1 GB; Q3_K_M ~3,3 GB; IQ4_XS ~3,4 GB; Q4_K_M ~3,5 GB; Q5_K_M ~3,7 GB; Q6_K ~3,9 GB; Q8_0 ~5,1 GB; f16 ~9,4 GB. Añadir ~0,7-1,1 GB si se usa el complemento multimodal mmproj.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para las cuantizaciones más altas y mayor contexto. En entornos de datacenter, A100 o H100 no son necesarias para este tamaño, pero permitirían mayor throughput y contexto.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o Q5_K_M; también puede ejecutarse en CPU con llama.cpp si se dispone de 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores GGUF compatibles con endpoints; el modelo base en safetensors puede servirse con transformers, vLLM o TGI, aunque para este tamaño las opciones GGUF son las más prácticas.
- Latencia y throughput: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Labadain-Gemma-4-E3B-it-Tetun (este) | 4,65B | no disponible | tet, tdt | apache-2.0 (con licencia Gemma 4) | GGUF | Ajuste QLoRA específico para tetun |
| Labadain-Gemma-4-E2B-it-Tetun (base) | no disponible | no disponible | tet, tdt | apache-2.0 | safetensors | Modelo original sin cuantizar |
| Gemma 4 (familia base de Google) | no disponible | no disponible | multilingüe | licencia Gemma 4 | safetensors, GGUF | Modelo generalista del que deriva |
| Otros modelos pequeños multilingües (p. ej. Qwen, Llama) | ~3-8B | variable | multilingüe | variable | GGUF, safetensors | No especializados en tetun; comparación no disponible en detalle |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Gemma 4 y ajustarse con un corpus presumiblemente limitado en tetun, es probable que herede sesgos del modelo base y del dataset de ajuste, pero no hay información concreta.
- Riesgo de alucinación: no cuantificado; los modelos de 4-5B afinados con QLoRA sobre lenguas de bajos recursos suelen mostrar alucinaciones frecuentes, especialmente en temas factuales o fuera del dominio conversacional.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible; el soporte se limita a tet y tdt, sin garantías de calidad en otros idiomas.
- Restricciones de licencia: el repositorio declara apache-2.0, pero enlaza a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license), que puede imponer condiciones adicionales al uso comercial; conviene revisar ambos documentos antes de desplegar en producción.
- Caveats de producción: las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; se recomienda Q4_K_M o superior. No hay cuantizaciones imatrix disponibles, lo que puede afectar a la perplejidad en comparación con cuantizaciones ponderadas. El repositorio tiene 0 likes y no se han publicado evaluaciones independientes, por lo que la calidad real del ajuste en tetun no está verificada.
- Discrepancia de nomenclatura: el repositorio se llama "E3B" pero el modelo base es "E2B"; conviene verificar la cadena de derivación antes de citar el modelo en publicaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Labadain-Gemma-4-E3B-it-Tetun-GGUF
- Modelo base: https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun
- Página de descargas del autor: https://hf.tst.eu/model#Labadain-Gemma-4-E3B-it-Tetun-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de cuantizaciones: https://www.nethype.de/

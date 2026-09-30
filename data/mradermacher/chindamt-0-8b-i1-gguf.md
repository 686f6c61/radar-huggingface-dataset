# mradermacher/ChindaMT-0.8B-i1-GGUF

## Resumen

ChindaMT-0.8B-i1-GGUF es la versión cuantizada en formato GGUF del modelo iapp/ChindaMT-0.8B, un traductor neuronal especializado en el par de idiomas inglés-tailandés desarrollado por iApp Technology (Tailandia). Esta variante concreta la publica el usuario mradermacher, conocido en HuggingFace por generar cuantizaciones GGUF con matrices de importancia (imatrix) para facilitar la ejecución local de modelos en hardware modesto.

El modelo resuelve un problema muy específico: la traducción automática EN-TH y TH-EN con control explícito sobre el resultado, es decir, respetando reglas de tono, terminología, longitud y formato definidas por el usuario. Según la información pública del proyecto, la familia ChindaMT se presentó con tres tamanos (4B, 2B y 0.8B) junto con los pesos, datos y código bajo licencia Apache 2.0, y la investigación asociada se publicó en la conferencia AACL-IJCNLP 2026.

El modelo base declara 1.006.672.704 parámetros reales en safetensors (aproximadamente 1,0B, pese al nombre comercial "0.8B"), lo que lo sitúa en la categoría de modelos pequenos aptos para inferencia en CPU o GPU de consumo. Esta ficha describe exclusivamente los pesos GGUF cuantizados por mradermacher; el repositorio original contiene los pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la model card; familia descrita como modelo de traducción) |
| Parametros totales | 1.006.672.704 (dato de safetensors del modelo base) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | inglés (en) y tailandés (th) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se especifica en la información disponible la arquitectura interna del modelo base (tipo de transformer, número de capas, dimensión oculta, mecanismo de atención ni estrategia de tokenización). Tampoco se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento posteriores al preentrenamiento. La única referencia explícita al corpus es el dataset `iapp/ChindaMT-Grounded`, asociado al modelo base en la model card.

Lo que sí se deduce de la documentación es el enfoque funcional: ChindaMT está disenado para traducción "grounded" o guiada por instrucciones, de modo que el modelo incorpore restricciones explícitas (tono, terminología, longitud y formato) sin degradar la calidad de la traducción. El blog de iApp Technology describe esta capacidad como diferencial frente a traductores genéricos. La investigación asociada se presentó en AACL-IJCNLP 2026 (Main Conference), aunque no se han facilitado los detalles técnicos del paper en la información disponible.

Respecto a esta variante concreta, mradermacher aplica cuantización con matriz de importancia (imatrix) generada específicamente para el modelo, lo que mejora la preservación de calidad en cuantizaciones agresivas respecto a las cuantizaciones estáticas del repositorio paralelo `mradermacher/ChindaMT-0.8B-GGUF`. La model card del cuantizador incluye una nota genérica que afirma "This is a vision model", pero no se aportan archivos mmproj ni evidencia de capacidades de visión en la familia ChindaMT, por lo que debe tratarse como texto de plantilla no confirmado.

## Capacidades

- Traducción automática bidireccional inglés-tailandés (EN-TH y TH-EN).
- Traducción guiada por instrucciones: permite imponer reglas de tono, terminología, longitud y formato en la salida.
- Seguimiento de instrucciones (instruction-following) aplicado al dominio de traducción.
- Uso conversacional (etiqueta "conversational" en el repositorio), lo que sugiere formato de chat multi-turno.
- Vocabulario controlado: capacidad declarada de respetar glosarios o terminología fija, relevante para dominios técnicos y legales.
- Capacidades multilingües limitadas estrictamente a inglés y tailandés; no se declaran otros idiomas.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Vision, audio o modo de razonamiento explícito (thinking mode): no disponible (no confirmado; ver advertencias).

## Casos de uso

- Traducción editorial EN-TH y TH-EN en producción: el modelo puede generar versiones en tailandés de artículos o documentación manteniendo el tono indicado por el editor, gracias a su capacidad de seguir reglas de estilo; el tamano de 1B permite desplegarlo en servidores modestos con coste por token muy bajo.
- Localización de documentación técnica con glosario fijo: al poder fijar terminología por instrucción, encaja en flujos donde términos como nombres de API, comandos o entidades legales no deben traducirse nunca.
- Atención al cliente bilingüe tailandés-inglés: se puede integrar como capa de traducción entre un agente conversacional y el usuario, normalizando tono y longitud de las respuestas; el formato conversacional del modelo facilita el uso multi-turno.
- Subtitulado y transcripción: con restricciones de longitud por línea, el modelo puede producir subtítulos en tailandés ajustados a un número máximo de caracteres, un caso de uso directamente alineado con el control de formato.
- Traducción en el borde (on-device / offline): las cuantizaciones IQ1 a Q4 ocupan entre 0,5 GB y 0,8 GB, lo que permite ejecutar el modelo en portátiles, mini-PC o incluso dispositivos ARM sin GPU dedicada.
- Preprocesado y aumento de corpus: generación de pares EN-TH sintéticos o etiquetados para entrenar otros sistemas de PLN, aprovechando la licencia Apache 2.0 y el acceso a los pesos.
- Fichas de producto y comercio electrónico: traducción de descripciones manteniendo estructura (bullets, medidas, unidades) y tono comercial definido por marca.
- Post-edición y control de calidad en pipelines MT: uso como segundo traductor para comparar contra un sistema principal y detectar discrepancias en terminología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base y la del repositorio cuantizado no incluyen tablas de métricas (BLEU, chrF, COMET, MMLU u otras), y el blog de lanzamiento de iApp Technology referenciado en la búsqueda web no aporta cifras en el material recuperado. Existe una publicación asociada en AACL-IJCNLP 2026 que previsiblemente contiene la evaluación, pero sus resultados no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada por cuantización (solo pesos del modelo): i1-IQ1_S ≈ 0,5 GB; i1-IQ2_M ≈ 0,6 GB; i1-IQ3_S ≈ 0,7 GB; i1-Q4_K_M ≈ 0,8 GB; i1-Q5_K_M ≈ 0,9 GB; i1-Q6_K ≈ 0,9 GB. Añadir el coste de la caché KV, que depende de la longitud de contexto (no documentada).
- Modelo base sin cuantizar: en fp16 ocuparía aproximadamente 2 GB de VRAM/RAM.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. Funciona sin problema en RTX 3060/4060/4090, A100, H100, e incluso en GPUs de gama de entrada como GTX 1650 o portátiles con gráficos integrados.
- Cabe en GPU de consumo: sí, con margen amplio. También se puede ejecutar íntegramente en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para vLLM o TGI conviene usar el modelo base en safetensors en lugar de los GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos de benchmarks publicados en la información disponible, por lo que la comparación se limita a características estructurales y de licencia. Los valores de parámetros y licencias de los modelos alternativos provienen de conocimiento general de la comunidad y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros | Idiomas foco | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ChindaMT-0.8B (esta ficha, cuantizado i1) | ~1,0B | en, th | Apache 2.0 | GGUF / safetensors | Traducción guiada por reglas de tono, terminología y formato |
| Helsinki-NLP/opus-mt-en-th | ~74M (Marian) | en, th | CC-BY-4.0 | safetensors / PyTorch | Traductor clásico de frase, sin control de estilo |
| facebook/nllb-200-distilled-600M | ~600M | 200 idiomas | CC-BY-NC-4.0 | safetensors | Multilingüe generalista; licencia no comercial |
| Modelos de la familia ChindaMT (2B, 4B) | 2B / 4B | en, th | Apache 2.0 | safetensors | Misma técnica con más capacidad, mayor coste de despliegue |

## Limitaciones y advertencias

- Cobertura idiomática muy restringida: solo inglés y tailandés. No es un modelo multilingüe generalista y no debe usarse para otros pares de idiomas sin validación previa.
- Riesgo de alucinación: como cualquier modelo neuronal de traducción, puede inventar contenido, omitir fragmentos o alterar cifras y nombres propios, especialmente en textos largos o con terminología poco frecuente. Requiere revisión humana en contextos críticos.
- Sin benchmarks públicos verificables en la información disponible: no se puede afirmar su calidad relativa frente a NLLB, Google Translate o modelos comerciales de traducción tailandesa.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que complica dimensionar la caché KV y planificar la traducción de documentos largos por fragmentos.
- Arquitectura y datos de entrenamiento no documentados en la model card: no se puede evaluar el sesgo derivado de la composición del corpus.
- La model card del cuantizador incluye texto de plantilla que afirma "This is a vision model" y menciona archivos mmproj; no hay evidencia de capacidades de visión en la familia ChindaMT. Trátese como texto genérico no confirmado.
- Sesgos conocidos: no documentados explícitamente. Es razonable esperar sesgos culturales y de dominio derivados de un corpus EN-TH posiblemente orientado a contenido de iApp, pero no hay datos al respecto.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No obstante, conviene verificar los términos del modelo base y del dataset `iapp/ChindaMT-Grounded` antes de un despliegue comercial.
- Cuantizaciones muy agresivas (IQ1_S, IQ1_M, IQ2_*) degradan notablemente la calidad; la propia model card las etiqueta como "for the desperate" o "mostly desperate". Para producción se recomienda Q4_K_M o superior.
- Adopción nula en el momento de redactar la ficha: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente del comportamiento de estas cuantizaciones.
- El repositorio GGUF ocupa 13,9 GB porque incluye todas las variantes de cuantización; descargar una sola variante reduce el consumo a menos de 1 GB.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/ChindaMT-0.8B-i1-GGUF
- Modelo base original: https://huggingface.co/iapp/ChindaMT-0.8B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/ChindaMT-0.8B-GGUF
- Dataset asociado: https://huggingface.co/datasets/iapp/ChindaMT-Grounded
- Página de descarga rápida del cuantizador: https://hf.tst.eu/model#ChindaMT-0.8B-i1-GGUF
- Anuncio de lanzamiento de ChindaMT (iApp Technology): https://www.iapp.co.th/blog/chindamt-launch
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png

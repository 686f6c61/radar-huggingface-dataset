# mradermacher/Artemis-31B-v1.2-i1-GGUF

## Resumen

Artemis-31B-v1.2-i1-GGUF es una version cuantizada del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario mradermacher en HuggingFace. Se trata de una conversion a formato GGUF orientada a inferencia local y despliegue en hardware de consumo, generada con el metodo de cuantizacion con imatrix (importance matrix), que ajusta los pesos de forma mas fina que la cuantizacion estatica tradicional. El modelo original cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones), segun los datos reales de safetensors del repositorio.

El autor de los quants etiqueta este modelo como multimodal de vision ("This is a vision model"), aunque los ficheros mmproj necesarios para la parte visual no se encuentran en este repositorio, sino en el repositorio hermano de quants estaticos. Esto implica que la capacidad de vision solo es utilizable si se descarga el proyector multimodal desde el repositorio estatico correspondiente.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~31B en GPUs de consumo mediante cuantizaciones que van desde los 11,0 GB (IQ2_M) hasta los 18,8 GB (Q4_K_M). No se dispone de informacion sobre el proceso de entrenamiento, la licencia, la longitud de contexto ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 (30,7B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, Q3_K_S, Q3_K_L, IQ3_XS, IQ3_S, Q4_K_S, Q4_0, Q4_1, Q4_K_M, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ1_M, IQ1_S |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base esta en safetensors para transformers |
| Modelo base | TheDrummer/Artemis-31B-v1.2 |
| Tamano del repositorio | 101,1 GB |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

No se dispone de informacion en la documentacion proporcionada sobre la arquitectura interna del modelo base Artemis-31B-v1.2 (si es un transformer denso, MoE o hibrido), ni sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio cuantizado es una plantilla generica de mradermacher y no incluye detalles tecnicos del modelo original.

La innovacion tecnica documentada se limita al proceso de cuantizacion: se trata de variantes "i1" generadas con imatrix (importance matrix), un fichero adicional de 0,1 GB incluido en el repositorio para que otros usuarios puedan crear sus propias cuantizaciones. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y que Q4_K_M ofrece un equilibrio recomendado entre velocidad y calidad. Se incluye tambien una referencia grafica de ikawrakow comparando la perplejidad de distintos tipos de cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Capacidad multimodal de vision declarada por el autor de los quants, condicionada a la descarga de los ficheros mmproj desde el repositorio estatico.
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el modelo esta etiquetado unicamente con el idioma "en" (ingles).
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-IQ2_M (11,0 GB) e i1-Q4_K_S (17,9 GB) permiten ejecutar un modelo de 30,7B en GPUs con 12-24 GB de VRAM mediante llama.cpp u Ollama, sin depender de servicios en la nube.
- Despliegue de asistentes conversacionales en ingles: el modelo esta etiquetado como "conversational" y el formato GGUF es compatible con servidores de inferencia tipo llama.cpp server, lo que permite montar un chatbot multi-turno autoalojado.
- Prototipado y evaluacion de modelos de 31B sin presupuesto de GPU profesional: la existencia de cuantizaciones de 2 a 4 bits permite comparar el comportamiento del modelo en hardware modesto antes de invertir en infraestructura mayor.
- Aplicaciones con requisitos de privacidad estrictos: al ejecutarse en local con GGUF, los datos no salen de la maquina, lo que resulta adecuado para entornos con datos sensibles que no pueden enviarse a APIs externas.
- Integracion en pipelines de generacion de texto por lotes: el formato GGUF e imatrix permite usar llama.cpp o herramientas compatibles para procesar grandes volumenes de texto en ingles de forma offline.
- Experimentacion con cuantizacion y evaluacion de perplejidad: la inclusion del fichero imatrix (0,1 GB) permite a investigadores generar sus propias cuantizaciones y medir el impacto de distintos niveles de bits en la calidad del modelo.
- Tareas de vision por computador en local (condicionado): si se descargan los ficheros mmproj del repositorio estatico, el modelo podria utilizarse para tareas de descripcion de imagenes o respuesta a preguntas visuales, siempre que la implementacion de inferencia soporte el proyector multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero): i1-IQ2_M 11,0 GB; i1-Q2_K 12,0 GB; i1-IQ3_XXS 12,2 GB; i1-IQ3_M 14,5 GB; i1-Q3_K_M 15,4 GB; i1-Q4_K_S 17,9 GB; i1-Q4_K_M 18,8 GB.
- Se debe anadir overhead de contexto KV cache; el requisito real de VRAM sera superior al tamano del fichero, especialmente con ventanas de contexto largas.
- GPU con 16 GB (por ejemplo RTX 4080, RTX 4060 Ti 16 GB, A4000): pueden ejecutar las cuantizaciones de 2 y 3 bits (IQ2_M, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M) con margen limitado para el contexto.
- GPU con 24 GB (RTX 3090, RTX 4090, A5000): pueden ejecutar comodamente Q4_K_S y Q4_K_M, que el autor describe como "optimal size/speed/quality" y "fast, recommended" respectivamente.
- GPU de 12 GB o menos: solo viable con cuantizaciones de 2 bits y contexto muy reducido, o mediante offload parcial a CPU.
- GPU profesionales (A100 40/80 GB, H100): permiten ejecutar el modelo sin cuantizar o en cuantizaciones altas con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base tambien esta disponible en safetensors para transformers (vLLM, TGI, entre otros).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota: el repositorio no incluye ficheros mmproj; para uso multimodal hay que acudir al repositorio de quants estaticos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base que permitan una comparacion rigurosa con alternativas de tamano similar. La siguiente tabla recoge unicamente los datos confirmados de este modelo y deja el resto como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Artemis-31B-v1.2-i1-GGUF | 30,7B | no disponible | no disponible | GGUF (imatrix) | no disponible |
| Alternativas de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se han publicado evaluaciones de fiabilidad para este modelo concreto.
- Limitacion de idioma: el modelo esta etiquetado unicamente para ingles ("en"); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Limitacion de contexto: la longitud de contexto no esta documentada; no se puede planificar su uso en tareas que requieran ventanas largas sin verificacion previa.
- Restricciones de licencia: la licencia figura como "no disponible" tanto en el repositorio cuantizado como en la informacion proporcionada. Antes de cualquier uso comercial es imprescindible consultar la licencia del modelo base TheDrummer/Artemis-31B-v1.2.
- Cuantizaciones de baja precision: las variantes de 2 bits (IQ2_M, Q2_K, IQ2_XS, IQ2_S, IQ1_M, IQ1_S) degradan notablemente la calidad; el propio autor advierte en algunos casos que existen alternativas mejores del mismo tamano.
- Uso multimodal: los ficheros mmproj no estan en este repositorio, por lo que la capacidad de vision no funciona sin descargar artefactos adicionales del repositorio estatico.
- Naturaleza del repositorio: se trata de una republicacion de cuantizaciones, no del modelo original; cualquier problema de calidad de los pesos deriva del modelo base y del proceso de cuantizacion.
- Resultados de la busqueda web: las busquedas realizadas no devolvieron informacion tecnica relevante sobre este modelo; los resultados obtenidos eran paginas de soporte de Windows sin relacion con el modelo.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Artemis-31B-v1.2-i1-GGUF
- Modelo base original: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Repositorio de quants estaticos (incluye ficheros mmproj si existen): https://huggingface.co/mradermacher/Artemis-31B-v1.2-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Artemis-31B-v1.2-i1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones y preguntas sobre cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH: https://www.nethype.de/

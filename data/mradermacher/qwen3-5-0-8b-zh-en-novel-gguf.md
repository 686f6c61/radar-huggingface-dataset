# mradermacher/Qwen3.5-0.8B-zh-en-novel-GGUF

## Resumen

Qwen3.5-0.8B-zh-en-novel es un modelo de traducción especializado en chino e inglés, orientado a la traducción de novelas web (web novels). El modelo original fue entrenado por DanVP a partir de la familia Qwen3.5, y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estáticas de multitud de modelos para su uso con llama.cpp.

Con aproximadamente 100,6 millones de parámetros (0,1 B), se trata de un modelo muy pequeño, lo que lo hace extremadamente ligero de ejecutar: puede correr en prácticamente cualquier hardware, incluidas CPU domésticas. Su nicho es concreto: traducción de contenido narrativo largo entre chino e inglés, una tarea donde los modelos generales suelen perder estilo, tono y consistencia terminológica.

Su relevancia actual radica en la demanda creciente de herramientas de localización de ficción asiática (novelas web, manhua, donghua) por parte de comunidades de fans y plataformas de lectura. Al ser un modelo afinado específicamente en este dominio, puede ofrecer resultados más naturales en prosa narrativa que modelos generales de tamaño similar, con la ventaja de un coste computacional casi nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), no disponible mayor detalle |
| Parametros totales | 100.592.896 (~0,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, F16 |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base es DanVP/Qwen3.5-0.8B-zh-en-novel, un ajuste fino sobre un modelo de la familia Qwen3.5 de unos 0,8 B de parametros nominales (los safetensors del repositorio cuantizado registran 100,6 millones de parametros). La familia Qwen3.5 emplea arquitecturas transformer densas de Alibaba, aunque los detalles concretos de esta variante (numero de capas, dimension de embedding, vocabulario) no se han publicado en la informacion disponible.

El ajuste fino se realizo con datos del dominio de novelas web en chino e ingles, con el objetivo de preservar estilo narrativo y coherencia en traducciones literarias. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO. El repositorio de mradermacher no añade entrenamiento: se limita a convertir los pesos originales a GGUF mediante cuantizacion estatica (convert_type: hf), incluyendo ademas archivos mmproj (suplemento multimodal) en Q8_0 y F16, lo que sugiere que el modelo base incorpora algun componente multimodal.

## Capacidades

- Traduccion entre chino e ingles, especializada en prosa de novelas web (registro narrativo, dialogos, terminologia del genero).
- Generacion de texto en chino e ingles derivada de su base Qwen3.5, aunque afinada para el dominio de traduccion.
- Ejecucion local via llama.cpp gracias al formato GGUF, con cuants desde Q2_K hasta Q8_0 y F16.
- Posible componente multimodal: el repositorio incluye archivos mmproj (mmproj-Q8_0 y mmproj-f16), suplementos usados en llama.cpp para capacidad de vision; el alcance real de esta capacidad no esta documentado.
- No hay informacion disponible sobre soporte de tool calling, agentes, razonamiento multi-paso ni modo de pensamiento (thinking mode).

## Casos de uso

- Traduccion de novelas web chino-ingles: caso de uso principal del modelo; afinado en prosa de ficcion web, mantiene mejor el tono narrativo que un modelo general del mismo tamano.
- Localizacion de contenido por comunidades de fans: su tamano minimo permite ejecutarlo en portatiles o CPUs sin GPU, ideal para traductores voluntarios con presupuesto cero.
- Traduccion por lotes de capitulos largos: al ser tan ligero, puede procesar grandes volumenes de texto en local con throughput razonable y sin coste de API.
- Borrador inicial para traduccion humana: genera una primera version en ingles de capitulos en chino que un traductor revisa y pule, acelerando el flujo de trabajo editorial.
- Integracion en pipelines de lectura automatizada: puede acoplarse a scrapers o lectores RSS que traduzcan automaticamente novedades de plataformas de novelas chinas.
- Prototipado de aplicaciones de traduccion: su bajo consumo permite incrustarlo en apps de escritorio o moviles (via llama.cpp u Ollama) como demostracion o producto ligero.
- Estudio y experimentacion: util como caso de prueba para investigar afinado dominial de traduccion literaria en modelos pequenos, dado su coste de ejecucion casi nulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa unos 0,3 GB; los cuants individuales van desde ~0,2 GB (mmproj-Q8_0) hasta ~0,3 GB (mmproj-f16). Los cuants de texto (Q2_K a Q8_0) ocupan aproximadamente entre 0,1 y 0,2 GB, por lo que el modelo cabe en la RAM de cualquier equipo moderno.
- GPU recomendadas: no requiere GPU; cualquier GPU con 2 GB de VRAM o mas lo ejecuta con holgura (incluso integradas). No se necesitan A100, H100 ni RTX 4090.
- Consumer GPU: cabe sobradamente en cualquier GPU consumer actual (GTX 1650, RTX 3060, RTX 4060, Apple Silicon con memoria unificada, etc.).
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en transformers permite uso directo con la libreria Hugging Face.
- Latencia y throughput: no disponibles; dado el tamano (~0,1 B), se espera inferencia muy rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.5-0.8B-zh-en-novel (esta ficha) | ~0,1 B | Traduccion zh-en de novelas web | Apache 2.0 | GGUF, safetensors |
| NLLB-200-distilled-600M (Meta) | 600 M | Traduccion entre 200 idiomas | CC-BY-NC 4.0 (no comercial) | safetensors |
| MADLAD-400 (3B/7B, Google) | 3B / 7B | Traduccion multilingue | Apache 2.0 | T5X/safetensors |
| Qwen modelos generales pequenos | 0,5B-2B | Uso general, traduccion incluida | Apache 2.0 (mayoria) | safetensors, GGUF |

Frente a NLLB, este modelo es mucho mas ligero y con licencia comercial permisiva, pero limitado a zh-en y centrado en ficcion. Frente a MADLAD-400, sacrifica cobertura multilingue a cambio de especializacion dominial y un consumo de recursos drasticamente menor. Frente a modelos generales Qwen de tamano similar, aporta afinado especifico en prosa de novelas web.

## Limitaciones y advertencias

- Dominio estrecho: afinado para traducion de novelas web zh-en; fuera de ese dominio (tecnico, legal, conversacional) el rendimiento no esta garantizado ni documentado.
- Solo dos idiomas: chino e ingles; no sirve para otros pares linguisticos.
- Alucinacion: como todo modelo de traduccion generativo, puede omitir, anadir o parafrasear contenido; se recomienda siempre revision humana en publicacion de textos.
- Longitud de contexto no documentada: desconocida, lo que dificulta planificar la traduccion de capitulos muy largos de una sola pasada.
- Sesgos: posibles sesgos heredados del corpus de novelas web (estereotipos de genero, registro informal); no hay evaluacion de sesgos publicada.
- Cuants de baja calidad: los cuants Q2_K y Q3_K pueden degradar notablemente la calidad de traduccion; se recomiendan Q4_K_M o superiores.
- Los archivos mmproj sugieren componente multimodal, pero su funcionamiento con este modelo afinado no esta documentado; probar con cautela.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base DanVP/Qwen3.5-0.8B-zh-en-novel y los terminos de uso de la familia Qwen de Alibaba.
- Cero descargas y cero likes en el momento de redactar la ficha: modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/Qwen3.5-0.8B-zh-en-novel-GGUF
- Modelo base: https://huggingface.co/DanVP/Qwen3.5-0.8B-zh-en-novel
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-0.8B-zh-en-novel-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

# rei-ma/madlad400-10b-mt-ct2-int8

## Resumen

madlad400-10b-mt-ct2-int8 es una conversion al formato CTranslate2 con cuantizacion int8 del modelo google/madlad400-10b-mt, un sistema de traduccion automatica multilingue basado en arquitectura T5 que cubre mas de 400 idiomas. El autor de la conversion es el usuario rei-ma, que publica los pesos optimizados para inferencia con CTranslate2 en lugar del formato original de HuggingFace Transformers. El modelo resuelve el problema de traduccion neuronal entre un numero muy amplio de pares de idiomas, incluyendo lenguajes de bajos recursos, con un unico modelo.

El modelo original fue entrenado por Google sobre 250 mil millones de tokens y forma parte de la familia MADLAD-400, presentada en el paper "MADLAD-400: A Multilingual And Document-Level Large Audited Dataset". La version aqui descrita no modifica los pesos mas alla de la cuantizacion a int8, por lo que hereda las capacidades y limitaciones del modelo base. Su relevancia practica radica en que el formato CTranslate2 permite un despliegue de inferencia mas eficiente en CPU y GPU que el runtime original de Transformers, con un tamano de repositorio de 10,8 GB.

La ficha se centra en la version cuantizada publicada por rei-ma, pero al tratarse de una conversion directa, los datos de arquitectura, entrenamiento y evaluacion provienen del modelo original de Google. Cualquier detalle no documentado en la informacion disponible se indica explicitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (familia MADLAD-400) |
| Parametros totales | 10 mil millones (heredado de google/madlad400-10b-mt) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (unica variante publicada en este repositorio) |
| Idiomas soportados | multilingue, mas de 400 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizer SentencePiece/T5 (`spiece.model`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder de la familia T5 con 10 mil millones de parametros, disenado especificamente para traduccion automatica multilingue. Segun la model card del repositorio, el modelo original fue entrenado sobre 250 mil millones de tokens y cubre mas de 400 idiomas. El paper asociado (arXiv:2309.04662) describe MADLAD-400 como un dataset multilingue y a nivel de documento, auditado, que sirve de base para el entrenamiento de esta familia de modelos.

La version publicada por rei-ma no reentrena ni modifica los pesos: unicamente convierte el checkpoint original de HuggingFace al formato de runtime de CTranslate2 y aplica cuantizacion int8. El repositorio contiene `model.bin` (~10,7 GB) con los pesos cuantizados, `config.json` con la configuracion del runtime, `shared_vocabulary.json` con el vocabulario y los ficheros del tokenizer SentencePiece/T5. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni innovaciones de decodificacion especulativa.

## Capacidades

- Traduccion automatica multilingue entre mas de 400 idiomas, incluyendo pares con lenguas de bajos recursos.
- Traduccion a nivel de documento, segun la descripcion del dataset MADLAD-400 en el paper asociado.
- Generacion de texto condicionada a tarea mediante el formato de prefijos de T5 (el modelo base es un T5 multitarea, aunque esta conversion esta orientada a traduccion).
- Ejecucion eficiente en CPU y GPU gracias al runtime CTranslate2 con cuantizacion int8.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica multilingue: el modelo puede traducir manuales y articulos entre cualquiera de los mas de 400 idiomas soportados, lo que permite mantener documentacion en paralelo para equipos distribuidos.
- Localizacion de productos de software: integrado en un pipeline de CI/CD mediante CTranslate2, permite generar cadenas traducidas para ficheros de recursos de forma automatizada y con bajo coste de inferencia en CPU.
- Traduccion de atencion al cliente: se puede desplegar como servicio interno que traduzca tickets y conversaciones entre idiomas, aprovechando el soporte multilingue amplio para cubrir mercados con lenguas minoritarias.
- Procesamiento de corpus de investigacion: util para traduccion masiva de datasets multilingues en proyectos de linguistica computacional, con la ventaja de que el formato int8 reduce los requisitos de memoria frente al checkpoint original.
- Traduccion de contenido web y editorial: integrable en CMS o pipelines de publicacion para generar versiones en varios idiomas de articulos y notas de prensa.
- Traduccion en entornos con recursos limitados: al estar cuantizado a int8 y optimizado para CTranslate2, puede ejecutarse en servidores sin GPU dedicada, lo que facilita su uso en organizaciones con infraestructura modesta.
- Traduccion de documentacion legal o administrativa entre idiomas europeos: el amplio soporte linguistico permite cubrir combinaciones poco frecuentes que otros modelos comerciales no atienden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion. La model card remite a la model card original de google/madlad400-10b-mt para los detalles de evaluacion, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 10,8 GB y el fichero `model.bin` pesa aproximadamente 10,7 GB en int8, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM) mas el overhead del runtime y del tokenizer.
- GPU recomendadas: no se especifican en la informacion disponible; por el tamano del modelo, serian necesarias GPU con al menos 16-24 GB de VRAM para cargar los pesos completos en memoria de video (por ejemplo, A100, H100 o RTX 4090), aunque no hay datos oficiales que lo confirmen.
- Cabe en GPU de consumo: previsiblemente en modelos con 24 GB o mas de VRAM (RTX 3090, RTX 4090), aunque no se documenta en la informacion proporcionada.
- Opciones de despliegue: CTranslate2 es el runtime nativo de esta conversion; tambien podria usarse a traves de servidores compatibles con CTranslate2, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| rei-ma/madlad400-10b-mt-ct2-int8 | 10 mil millones | no disponible | mas de 400 | Apache 2.0 | CTranslate2 int8 |
| google/madlad400-10b-mt | 10 mil millones | no disponible | mas de 400 | Apache 2.0 | safetensors (Transformers) |
| google/madlad400-3b-mt | 3 mil millones | no disponible | mas de 400 | Apache 2.0 | safetensors (Transformers) |
| Helsinki-NLP/opus-mt (familia) | variable (por par) | no disponible | pares especificos | varía (mayoritariamente Apache 2.0 o CC-BY) | safetensors / PyTorch |

La comparativa se limita a modelos de la misma familia y a alternativas de traduccion multilingue de referencia. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una cuantizacion int8, puede existir una perdida de calidad respecto al checkpoint original en fp32/bf16, aunque no se cuantifica en la informacion disponible.
- El modelo hereda los sesgos del dataset MADLAD-400 y del entrenamiento original de Google; no se documentan sesgos especificos en la informacion proporcionada.
- Riesgo de alucinacion y de traducciones incorrectas en idiomas de muy bajos recursos o en dominios especializados.
- La longitud de contexto no esta documentada en la informacion disponible, lo que limita la planificacion de casos de uso con entradas largas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda citar el trabajo original y revisar la model card de google/madlad400-10b-mt para condiciones adicionales.
- El repositorio tiene muy pocas descargas (16) y ningun like, por lo que no hay evidencia de uso en produccion ni validacion comunitaria de la conversion.
- No se documentan garantias de compatibilidad con versiones futuras de CTranslate2.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rei-ma/madlad400-10b-mt-ct2-int8
- Modelo base: https://huggingface.co/google/madlad400-10b-mt
- Paper MADLAD-400: https://arxiv.org/abs/2309.04662
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2

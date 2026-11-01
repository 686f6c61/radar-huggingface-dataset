# Mugunth123/sarvam-translate-4bit-GGUF

## Resumen

Sarvam-translate 4-bit GGUF (Q4_K_M) es una cuantizacion del modelo de traduccion multilingue `sarvamai/sarvam-translate`, desarrollado por Sarvam AI en colaboracion con AI4Bharat y construido sobre Google Gemma 3 4B-IT. Este repositorio, mantenido por el usuario Mugunth123, distribuye los pesos en formato GGUF con cuantizacion de 4 bits (Q4_K_M), reduciendo el tamano del modelo de 8,1 GB a 2,31 GB y permitiendo su ejecucion en CPU y GPU de consumo.

El modelo resuelve la traduccion bidireccional entre el ingles y las 22 lenguas programadas de la India, un ambito historicamente desatendido por los grandes modelos multilingues. Su arquitectura es la de Gemma 3 4B: un transformer decoder-only con Grouped Query Attention (8 cabezas de consulta, 4 de clave/valor) y 34 capas, con 3.880.263.168 parametros totales.

La relevancia de esta ficha radica en que ofrece una via practica de despliegue local de un modelo de traduccion especializado en lenguas indicas con requisitos de memoria modestos (unos 3,0 GB de RAM), a costa de una licencia GPL-3.0 que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B) con Grouped Query Attention (GQA): 8 cabezas de consulta, 4 cabezas de clave/valor, 34 capas |
| Parametros totales | 3.880.263.168 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (4 bits medium, k-quant estandar); el autor publica ademas IQ1_S, IQ1_M, IQ2_M y Q8_0 en repositorios separados |
| Idiomas soportados | Asames, bengali, bodo, dogri, gujarati, ingles, hindi, kannada, cachemir, konkani, maithili, malayalam, manipuri, marathi, nepali, oriya, punyabi, sanscrito, santali, sindhi, tamil, telugu y urdu (22 lenguas programadas de la India mas ingles) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (fichero `sarvam-translate-Q4_K_M.gguf`) |

Datos adicionales de la cuantizacion: 4,58 bits efectivos por peso, fichero de 2,31 GB y requisito aproximado de 3,0 GB de RAM para decodificacion en CPU/GPU.

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B-IT de Google DeepMind, un transformer decoder-only denso con 34 capas y atencion de consultas agrupadas (GQA) con 8 cabezas de consulta y 4 de clave/valor. Sarvam AI y AI4Bharat adaptaron y especializaron este modelo para traduccion multilingue entre el ingles y las 22 lenguas programadas de la India; la model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO especificas para la tarea de traduccion.

La innovacion principal de este repositorio no esta en la arquitectura, sino en la cuantizacion: la aplicacion de Q4_K_M (k-quant estandar de 4 bits) reduce el modelo de 8,1 GB a 2,31 GB con una calidad de traduccion que el autor describe como practicamente sin perdida, y habilita la inferencia en hardware modesto mediante llama.cpp. El modelo emplea el formato de chat de Gemma 3 (`<start_of_turn>user` / `<start_of_turn>model`) y recomienda temperatura 0,0 para traduccion determinista.

## Capacidades

- Traduccion bidireccional entre ingles y las 22 lenguas programadas de la India, con instruccion en lenguaje natural del idioma destino.
- Generacion de texto conversacional en el formato de chat de Gemma 3 (etiquetas `start_of_turn` / `end_of_turn`).
- Manejo de contexto de hasta 8.192 tokens, adecuado para parrafos y documentos de longitud media.
- Inferencia determinista con temperatura 0,0, adecuada para pipelines de traduccion reproducibles.
- Ejecucion en CPU y en GPU mediante llama.cpp y llama-cpp-python, con offload parcial o total de capas (`n_gpu_layers`).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- No se documenta modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Traduccion local de documentacion tecnica al hindi o al tamil: el modelo se ejecuta con llama.cpp en una maquina sin GPU dedicada, con unos 3,0 GB de RAM, y permite traducir parrafos de hasta varios miles de tokens manteniendo el contexto del documento.
- Localizacion de interfaces y contenidos de producto para mercados indios: se puede integrar en un pipeline de CI/CD que invoque `llama-cli` o `llama-cpp-python` con temperatura 0,0 para generar traducciones reproducibles de cadenas de texto a bengali, marathi o telugu.
- Atencion al cliente multilingue en la India: el modelo puede traducir mensajes entrantes de usuarios en asamés, oriya o punyabi al ingles para su procesamiento por un sistema posterior, y traducir la respuesta de vuelta.
- Investigacion linguistica y preservacion de lenguas minoritarias: permite experimentar con traduccion hacia lenguas de bajos recursos como bodo, santali, manipuri o maithili sin depender de APIs en la nube.
- Procesamiento por lotes en servidores sin acelerador: al caber en 2,31 GB de disco y requerir unos 3,0 GB de RAM, se puede desplegar en contenedores ligeros o en maquinas virtuales de gama baja para traducir volumenes moderados de texto.
- Prototipado y evaluacion de sistemas de traduccion: sirve como referencia local para comparar calidad frente a APIs comerciales antes de comprometerse con un proveedor, con la ventaja de que los datos no salen del entorno.
- Traduccion de contenidos educativos o administrativos entre ingles e hindi, nepali o sanscrito, aprovechando la ventana de 8.192 tokens para fragmentos de examen, formularios o circulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 3,0 GB de RAM para el fichero Q4_K_M de 2,31 GB, segun la model card.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que la cuantizacion esta pensada para decodificacion rapida en CPU/GPU.
- Cabe en GPU de consumo: si, al requerir unos 3,0 GB de memoria, es compatible con tarjetas de 4 GB o mas (por ejemplo, GTX 1650, RTX 3050 o superiores), aunque la model card no confirma modelos concretos.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla la integracion.
- Latencia y throughput: no disponibles; la model card solo califica la decodificacion como "rapida" sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sarvam-translate 4-bit GGUF (esta ficha) | 3.880 millones | 8.192 tokens | 22 lenguas indicas + ingles | GPL-3.0 | GGUF Q4_K_M |
| Sarvam-translate (base, sarvamai/sarvam-translate) | 3.880 millones | 8.192 tokens (segun model card del cuantizado) | 22 lenguas indicas + ingles | No disponible en la informacion proporcionada | Safetensors (pesos originales, 8,1 GB) |
| Gemma 3 4B-IT (Google DeepMind) | Aproximadamente 4.000 millones | No disponible en la informacion proporcionada | Multilingue general | No disponible en la informacion proporcionada | Safetensors y variantes |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, cobertura idiomatica y licencia.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial o la integracion en productos propietarios puede obligar a liberar el codigo derivado bajo la misma licencia; conviene revisar las implicaciones con asesoria legal antes de desplegarlo en produccion.
- La cuantizacion a 4 bits introduce una perdida de precision respecto a los pesos originales; el autor la describe como practicamente sin perdida, pero no aporta metricas que lo respalden.
- Riesgo de alucinacion y de traduccion infiel en textos largos o especializados (terminologia juridica, medica o tecnica), especialmente en lenguas de bajos recursos como bodo, santali o manipuri.
- Cobertura limitada a las 22 lenguas programadas de la India y el ingles; no se documenta soporte para otras lenguas.
- Ventana de contexto de 8.192 tokens: los documentos mas largos deben fragmentarse, con el riesgo de perder coherencia entre fragmentos.
- No se documentan sesgos especificos, pero al derivar de Gemma 3 puede heredar sesgos culturales y de representacion del corpus original.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse que las conserva tras la especializacion en traduccion.
- El repositorio tiene 61 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (25 de octubre de 2026), lo que indica escasa validacion por parte de la comunidad.
- No se han publicado benchmarks que permitan verificar la calidad de traduccion frente al modelo base sin cuantizar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mugunth123/sarvam-translate-4bit-GGUF
- Modelo base: https://huggingface.co/sarvamai/sarvam-translate
- Cuantizacion 1-bit (IQ1_S): https://huggingface.co/Mugunth123/sarvam-translate-1bit-GGUF
- Cuantizacion 1.58-bit (IQ1_M): https://huggingface.co/Mugunth123/sarvam-translate-1.58bit-GGUF
- Cuantizacion 2-bit (IQ2_M): https://huggingface.co/Mugunth123/sarvam-translate-2bit-GGUF
- Cuantizacion 8-bit (Q8_0): https://huggingface.co/Mugunth123/sarvam-translate-8bit-GGUF
- Perfil del autor: https://huggingface.co/Mugunth123

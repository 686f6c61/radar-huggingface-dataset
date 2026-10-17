# EtuhE/igala-model-EtuhE

## Resumen

igala-model-EtuhE es un modelo de traduccion automatica neuronal publicado por el usuario EtuhE en HuggingFace. Se trata de un fine-tune del modelo Helsinki-NLP/opus-mt-en-mul, que a su vez forma parte de la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki. El modelo tiene 77.026.926 parametros (unos 77 millones) y esta construido sobre la arquitectura MarianMT, un transformer encoder-decoder disenado especificamente para traduccion. Por el identificador del repositorio, el objetivo declarado parece ser la traduccion hacia el igala (lengua nigerocongolesa hablada principalmente en el estado de Kogi, Nigeria, con alrededor de un millon de hablantes), aunque la model card no confirma explicitamente el par de idiomas.

El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, con un tamano de repositorio de 0,3 GB. Es, por tanto, un modelo pequeno y facil de desplegar incluso en CPU, lo que lo hace interesante para escenarios de traduccion de bajo recursos o para integrarlo en pipelines de procesamiento por lotes sin requisitos de GPU. El repositorio no tiene descargas ni "likes" en el momento de la consulta, lo que indica que es un artefacto reciente y sin validacion por parte de la comunidad.

La relevancia de este modelo radica en su nicho: la mayoria de los modelos de traduccion de alto rendimiento no cubren lenguas africanas de bajo recursos como el igala. Un fine-tune de 77 millones de parametros con licencia permisiva puede resultar util para proyectos de documentacion linguistica, localizacion de contenidos o investigacion academica, siempre que se asuman sus limitaciones: BLEU de 11,67 y chrF de 46,70 sobre un conjunto de evaluacion no documentado, y una model card practicamente vacia en cuanto a datos de entrenamiento e idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder para traduccion automatica) |
| Parametros totales | 77.026.926 (aproximadamente 77 millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha (los modelos Marian de OPUS-MT se entrenan habitualmente con secuencias de 512 tokens; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Helsinki-NLP/opus-mt-en-mul es multilingue con el ingles como origen) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos completos, sin cuantizar) |
| Tipo de tarea | text2text-generation (traduccion) |
| Modelo base | Helsinki-NLP/opus-mt-en-mul |
| Libreria | transformers |
| Version de transformers del entrenamiento | 5.18.0 |
| Tamano del repositorio | 0,3 GB |
| Descargas | 0 |
| Likes | 0 |
| Compatible con endpoints | Si (etiqueta endpoints_compatible) |
| Fecha de creacion del repositorio | 16 de octubre de 2026 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 16 de octubre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer encoder-decoder con atencion completa, desarrollado originalmente por el equipo de Microsoft Research para traduccion automatica neuronal y adoptado masivamente por el proyecto OPUS-MT de la Universidad de Helsinki. Con 77 millones de parametros, el modelo se situa en el rango de los Marian "base" de OPUS-MT, que combinan un vocabulario multilingue relativamente amplio con un encoder y un decoder compactos. La model card no detalla el numero de capas, cabezas de atencion ni la dimension del modelo, por lo que estos datos concretos no estan disponibles.

Respecto al entrenamiento, la model card indica que el fine-tune se realizo sobre un conjunto de datos no especificado ("the None dataset"), durante 8 epocas, con 904 pasos totales, un batch de entrenamiento y evaluacion de 8, tasa de aprendizaje de 3e-05, scheduler lineal, semilla 42 y el optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08. No se documenta ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en modelos de traduccion de este tamano). Las versiones de framework declaradas son Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Traduccion automatica de texto: la tarea declarada es text2text-generation, con el modelo base orientado a traducir desde el ingles hacia multiples idiomas. El fine-tune apunta, por el nombre del repositorio, al igala, aunque la direction exacta y los pares soportados no se confirman en la model card.
- Generacion de texto condicionada: al ser un encoder-decoder, puede emplearse para tareas de reescritura o reformulacion supervisada, aunque no fue entrenado especificamente para ello.
- Procesamiento por lotes: su tamano reducido permite traducir grandes volumenes de texto en lotes sin requerir GPU.
- Integracion con la libreria transformers: se puede cargar con `AutoModelForSeq2SeqLM` y `AutoTokenizer` de HuggingFace, y es compatible con la infraestructura de inference endpoints.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se detalla la lista de idiomas cubiertos por el fine-tune).
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo es exclusivamente texto a texto.

## Casos de uso

- Localizacion de contenidos al igala: traduccion de articulos, guias o material divulgativo del ingles al igala dentro de un pipeline automatizado. Su tamano de 77 millones de parametros permite procesar miles de segmentos por hora en una sola GPU o incluso en CPU.
- Documentacion linguistica y preservacion de lenguas minorizadas: generacion de traducciones de referencia que despues un hablante nativo revisa, acelerando la produccion de corpus en igala.
- Subtitulado y transcripcion multilingue: integrado aguas abajo de un sistema de reconocimiento de voz, puede traducir segmentos cortos del ingles al igala para subtitulos, con latencia muy baja por segmento.
- Atencion al cliente en lengua local: despliegue en un servicio de mensajeria o chat para pre-traducir consultas y respuestas entre ingles e igala, con revision humana cuando la confianza sea baja.
- Sector sanitario y ONG: traduccion de folletos, formularios y avisos de salud publica en zonas donde el igala es la lengua vehicular, en entornos con hardware limitado (portatiles sin GPU, servidores de baja capacidad).
- Generacion de datos sinteticos para entrenar otros modelos: uso del traductor para crear pares paralelos en ingles-igala que sirvan como datos de aumento en el entrenamiento de modelos multilingues mayores.
- Investigacion academica en traduccion de bajo recursos: linea base reproducible y ligera para comparar tecnicas de fine-tuning, aumentacion de datos o decodificacion en lenguas con pocos recursos.
- Traduccion offline en dispositivos: al ocupar unos cientos de megabytes en precision completa y menos de 100 MB cuantizado, es viable empaquetarlo en aplicaciones moviles o de escritorio sin conexion.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluacion final: perdida de 2,4215, BLEU de 11,6659 y chrF de 46,6955. Ademas, se publica la evolucion por epocas durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | BLEU | chrF |
|---|---|---|---|---|---|
| 1,0 | 113 | 3,0537 | 2,5994 | 13,7789 | 47,0317 |
| 2,0 | 226 | 2,2081 | 2,3182 | 16,9857 | 47,9976 |
| 3,0 | 339 | 1,9068 | 2,1943 | 13,1883 | 48,6903 |
| 4,0 | 452 | 1,4002 | 2,1886 | 13,0707 | 46,4789 |
| 5,0 | 565 | 1,3395 | 2,1805 | 14,6239 | 47,7008 |
| 6,0 | 678 | 1,3799 | 2,1673 | 15,0548 | 48,3228 |
| 7,0 | 791 | 1,1872 | 2,1802 | 15,5940 | 48,4844 |
| 8,0 | 904 | 1,2332 | 2,1887 | 15,6937 | 48,5543 |

El bloque model-index del repositorio no contiene resultados adicionales (lista de resultados vacia). No se han publicado comparaciones con otros modelos ni resultados en conjuntos de referencia estandar como FLORES-200, WMT o MMLU en la informacion disponible. Conviene advertir que el BLEU declarado en la cabecera (11,6659) es inferior al de la ultima epoca de validacion (15,6937), lo que sugiere que el valor de cabecera corresponde a un conjunto de evaluacion distinto y no documentado; al no conocerse el corpus de evaluacion, las cifras no son directamente comparables con las de otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision completa (float32), alrededor de 400-500 MB en float16 y por debajo de 200 MB en int8. Es un modelo que cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas NVIDIA GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090, A100 o H100. En la practica, el modelo esta limitado por la CPU y la gestion de lotes antes que por la GPU.
- Compatibilidad con GPU de consumo: si, en todas las GPU de consumo actuales e incluso en muchas integradas. La inferencia en CPU es perfectamente viable para uso interactivo con frases cortas.
- Opciones de despliegue: transformers (PyTorch) de forma nativa, HuggingFace Inference Endpoints (el repositorio esta marcado como compatible), ONNX Runtime mediante exportacion, CTranslate2 para optimizar la inferencia en CPU, y servidores tipo FastAPI o Gradio por encima de la libreria. No hay versiones GGUF publicadas, por lo que llama.cpp y Ollama no son utilizables sin una conversion previa; vLLM tiene soporte limitado para arquitecturas encoder-decoder Marian.
- Latencia y throughput estimados: no hay mediciones publicadas. Como referencia orientativa basada unicamente en el tamano del modelo, un Marian de 77 millones de parametros suele procesar del orden de decenas a cientos de frases por segundo en una GPU moderna con lotes grandes, y del orden de unidades a decenas de frases por segundo en CPU. Estas cifras son estimaciones genericas y no estan verificadas para este fine-tune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EtuhE/igala-model-EtuhE | 77 M | no disponible | apache-2.0 | Fine-tune especifico para igala; BLEU 11,67 y chrF 46,70 en un conjunto no documentado; sin descargas ni validacion de la comunidad |
| Helsinki-NLP/opus-mt-en-mul | 77 M | 512 tokens (configuracion habitual de OPUS-MT, no confirmada en la ficha) | apache-2.0 | Modelo base del anterior; traduccion generica desde el ingles a multiples idiomas, sin especializacion en igala |
| facebook/nllb-200-distilled-600M | 600 M | 512 tokens | cc-by-nc-4.0 | Cobertura de 200 idiomas con calidad generalmente superior, pero licencia no comercial y requisitos de hardware muy superiores |
| google/mt5-small | 300 M | 512 tokens | apache-2.0 | Modelo multilingue generico; requiere fine-tuning para traduccion y no esta especializado en lenguas de bajo recursos como el igala |
| facebook/m2m100_418M | 418 M | 1024 tokens | mit | Traduccion multilingue directa entre pares; mayor tamano y sin garantia de cobertura de calidad en igala |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card practicamente vacia: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" aparecen literalmente como "More information needed", por lo que no hay garantia documentada sobre el par de idiomas, el dominio o las condiciones de uso previstas.
- Dataset de entrenamiento no identificado: la model card indica que el fine-tune se hizo sobre "the None dataset", lo que impide evaluar la procedencia, la licencia y la calidad de los datos. Existe riesgo de que el corpus incluya material con derechos de terceros.
- Calidad de traduccion limitada: un BLEU de 11,67 y un chrF de 46,70 son valores modestos en traduccion automatica. Son cifras aceptables para un escenario de bajo recursos con revision humana, pero insuficientes para traduccion automatica sin supervision en contextos criticos.
- Conjunto de evaluacion desconocido: al no documentarse el corpus de evaluacion, no se puede verificar si el modelo generaliza o si las cifras estan sesgadas por el dominio de los datos usados.
- Riesgo de alucinacion y de omisiones: como cualquier modelo seq2seq, puede inventar contenido, omitir fragmentos o repetir texto, especialmente en segmentos largos o con vocabulario tecnico fuera de dominio.
- Direccionalidad no confirmada: al derivar de un modelo entrenado desde el ingles, es probable que funcione mejor en la direccion ingles a igala que en la inversa, pero esto no esta confirmado en la ficha. Se recomienda validar ambos sentidos antes de usarlo en produccion.
- Longitud de contexto no documentada: si el modelo sigue la configuracion habitual de Marian, los textos largos deberan dividirse en segmentos; no se garantiza un comportamiento correcto con entradas extensas.
- Idiomas no declarados: la lista de idiomas soportados no aparece en la ficha, por lo que no se puede asegurar que el modelo solo genere igala ni que lo haga de forma consistente.
- Idiomas de bajos recursos y sesgos: las lenguas con poca presencia digital suelen arrastrar sesgos de genero, registro y terminologia heredados del corpus de entrenamiento. No hay estudios de sesgo para este modelo.
- Ausencia de validacion comunitaria: cero descargas y cero "likes" en el momento de la consulta. No existen evaluaciones independientes, informes de terceros ni casos de uso documentados.
- Metadatos atipicos: las fechas de creacion y actualizacion del repositorio (16 de octubre de 2026) son posteriores a la fecha actual y no coinciden con ningun hito conocido, lo que sugiere un posible error en los metadatos o un entorno de publicacion no estandar.
- Licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial. No obstante, esta licencia cubre los pesos del fine-tune, no necesariamente los datos de entrenamiento, cuyo origen se desconoce.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EtuhE/igala-model-EtuhE
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-mul
- Organizacion OPUS-MT de Helsinki-NLP: https://huggingface.co/Helsinki-NLP
- Repositorio del proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de MarianMT (Junczys-Dowmunt et al., 2018): https://arxiv.org/abs/1804.00344
- La busqueda web realizada para esta ficha no devolvio resultados relevantes: los enlaces recuperados corresponden a paginas de Facebook y Facebook Marketplace sin ninguna relacion con el modelo. No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este fine-tune.

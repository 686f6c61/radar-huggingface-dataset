# malinali-app/opus-mt-fi-ee

## Resumen

malinali-app/opus-mt-fi-ee es un paquete de pesos para traduccion automatica neuronal entre finlandes (fi) y estonio (ee), publicado por el equipo de Malinali (malinali.app) para su uso dentro de la aplicacion del mismo nombre. No se trata de un modelo entrenado desde cero: es un reempaquetado de los pesos de Helsinki-NLP/opus-mt-fi-ee, el modelo de la familia OPUS-MT desarrollada por el grupo de investigacion Language Technology de la Universidad de Helsinki, con los tokenizadores SentencePiece convertidos a formato fast tokenizer de Hugging Face para permitir inferencia on-device con el framework Candle.

El modelo es un transformer encoder-decoder de tipo Marian con 76.186.121 parametros (aproximadamente 76,2 millones), lo que lo situa en la categoria de modelos compactos de traduccion. Esa escala permite ejecutarlo en CPU moderna, en movil o en GPUs de gama de entrada sin practicamente requisitos de VRAM, algo coherente con su proposito declarado: traduccion local, sin conectividad y con latencia baja. La direccion de traduccion documentada en la model card es fi → ee, y la licencia del repositorio figura como no disponible, remitiendo el autor a la licencia del modelo upstream.

Su relevancia es practica mas que cientifica: cubre un par de idiomas de bajos recursos y poco representado en los LLM generalistas actuales (finlandes y estonio comparten familia urálica, pero tienen morfologia compleja y cobertura desigual en modelos multilingues grandes), y lo hace en un formato empaquetado listo para despliegue con Candle en Flutter. El coste es un repositorio de 0,3 GB, sin GPU y sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (seq2seq) |
| Parametros totales | 76.186.121 (aproximadamente 76,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los modelos OPUS-MT de Marian suelen operar con secuencias de hasta 512 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio; solo pesos en safetensors (precision no declarada) |
| Idiomas soportados | Finlandes (fi) y estonio (ee), direccion fi → ee |
| Licencia | No disponible en el repositorio; el autor remite a la licencia del modelo upstream (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors) + config.json + tokenizer-enc.json + tokenizer-dec.json |
| Tamano del repositorio | 0,3 GB |
| Libreria declarada | transformers (compatible con despliegue via Candle / marian_flutter) |
| Pipeline | text2text-generation / translation |
| Modelo base | Helsinki-NLP/opus-mt-fi-ee |
| Fecha de publicacion declarada | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian, el motor de traduccion neuronal desarrollado por el grupo de Helsinki-NLP. Se trata de un transformer encoder-decoder clasico, con atencion multi-cabeza en ambas torres y decodificacion autorregresiva, optimizado para entrenamiento e inferencia de alta velocidad en traduccion automatica. El modelo original de OPUS-MT se entreno sobre corpus paralelos alineados recopilados por el proyecto OPUS, con tokenizacion SentencePiece; en este repositorio concreto el autor declara que solo se han reempaquetado los pesos y se ha convertido el tokenizador SentencePiece a JSON de fast tokenizer, sin reentrenamiento ni ajuste fino adicional.

No se dispone de informacion en la documentacion proporcionada sobre el numero exacto de tokens de entrenamiento, la composicion del corpus paralelo fi-ee, la aplicacion de tecnicas de RLHF/DPO (habitualmente ausentes en modelos de traduccion supervisada de esta familia) ni sobre innovaciones tecnicas adicionales como decodificacion especulativa. Cabe senalar una inconsistencia en los metadatos: la etiqueta del repositorio incluye `base_model:finetune:Helsinki-NLP/opus-mt-fi-ee`, mientras que la model card afirma explicitamente que no se reclama propiedad sobre el modelo entrenado y que la aportacion se limita al reempaquetado y a la conversion del tokenizador. Ese extremo deberia verificarse antes de asumir que existe un ajuste fino real.

## Capacidades

- Traduccion automatica unidireccional de finlandes a estonio (fi → ee) en modalidad texto a texto.
- Tokenizacion dual: tokenizador rapido para la fuente (`tokenizer-enc.json`) y para el destino (`tokenizer-dec.json`), lo que permite integrarlo en pipelines que necesitan tokenizar entrada y salida por separado.
- Inferencia on-device: el paquete esta preparado para ejecutarse con Candle mediante el modulo `marian_flutter`, segun la model card.
- Compatibilidad con la libreria transformers (`pipeline_tag: translation`, `text2text-generation`), y por tanto con el ecosistema estandar de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. Es un modelo puramente de traduccion.
- Capacidad multilingue limitada a los dos idiomas del par; no hay indicios de transferencia a otros pares.

## Casos de uso

- Traduccion offline en aplicaciones moviles: integrado en la app Malinali mediante Candle, permite traducir fi → ee en el dispositivo sin conexion, lo que resulta adecuado para viajeros, entornos con conectividad limitada y escenarios donde no se quiere enviar texto a un servicio externo.
- Localizacion de documentacion tecnica: traduccion de manuales, fichas de producto y documentacion de software escrita en finlandes al estonio, con un modelo de 76 M de parametros que puede ejecutarse en el portatil del traductor como asistente o preprocesador.
- Subtitulado y localizacion audiovisual: traduccion por segmentos cortos del subtitulado finlandes al estonio, aprovechando el bajo coste por frase y la posibilidad de procesar en lote sin GPU.
- Atencion al cliente en la region nordica-báltica: traduccion de tickets y mensajes de soporte entre Finlandia y Estonia dentro de un CRM, con el modelo actuando como capa de traduccion previa a la revision humana.
- E-commerce transfronterizo: traduccion de titulos, descripciones y atributos de catalogo del finlandes al estonio para tiendas que operan en ambos mercados, en un flujo por lotes donde la latencia no es critica.
- Creacion y aumento de corpus paralelos: uso del modelo para generar traducciones sinteticas fi-ee que despues se filtran y se emplean como datos adicionales de entrenamiento o para evaluar otros sistemas de traduccion.
- Preprocesado en pipelines de PLN: normalizacion de texto estonio a partir de fuentes finlandesas para tareas posteriores (clasificacion, extraccion de entidades, indexacion de busqueda) en las que se necesita el contenido en el idioma de destino.
- Traduccion asistida en administracion publica y gestion documental: procesamiento de correspondencia entre instituciones finlandesas y estonias antes de la revision por un traductor humano, dado que el modelo no requiere infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas BLEU, chrF ni comparaciones automaticas, y el repositorio no tiene descargas ni valoraciones registradas. Tampoco se dispone de evaluaciones propias del autor distintas de las del modelo upstream, que no han sido facilitadas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con 76,2 M de parametros, el peso en precision fp32 ocupa aproximadamente 305 MB, en fp16 unos 152 MB y en int8 alrededor de 76 MB. Cualquier GPU con 1-2 GB de memoria libre es suficiente; no se requieren GPUs de centro de datos.
- GPU recomendadas: no es necesario un acelerador dedicado. Funciona correctamente en GTX 1650, RTX 3050/4060/4090 y en GPUs integradas modernas; en A100 o H100 el modelo quedaria muy infrautilizado y no aportaria ventajas frente a CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual, e incluso en aceleradores de borde y en dispositivos moviles mediante Candle.
- CPU: es el escenario natural de despliegue. Funciona en procesadores x86 y ARM modernos con pocos nucleos; el cuello de botella sera el ancho de banda de memoria y la longitud de la secuencia, no la capacidad de computo.
- Opciones de despliegue: transformers (PyTorch) como via estandar; Candle mediante `marian_flutter` para movil y escritorio; exportacion a ONNX Runtime para servir en produccion; CTranslate2 para inferencia optimizada de modelos seq2seq Marian (opcion habitual en este tipo de modelos). vLLM, TGI y llama.cpp/Ollama no estan orientados a modelos Marian de traduccion seq2seq y no se documentan como vias soportadas en este repositorio.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. No se aportan cifras estimadas para no inducir a error.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fi-ee | 76,2 M | No disponible | fi → ee | No disponible (remite al upstream) | Hugging Face, safetensors + tokenizers JSON |
| Helsinki-NLP/opus-mt-fi-ee | No disponible en esta ficha (misma base segun el autor) | No disponible | fi → ee | La del modelo upstream (habitualmente CC-BY 4.0; no verificado aqui) | Hugging Face, transformers |
| NLLB-200-distilled-600M | Aproximadamente 600 M | No disponible en esta ficha | Multilingue (200 idiomas, incluye fi y et) | CC-BY-NC-4.0 (uso no comercial, no verificado en esta busqueda) | Hugging Face, transformers |
| M2M-100 (418M) | Aproximadamente 418 M | No disponible en esta ficha | Multilingue (100 idiomas, incluye fi y et) | MIT (no verificado en esta busqueda) | Hugging Face, transformers |

Nota: los datos de los modelos comparativos no provienen de la informacion proporcionada en esta busqueda y deben contrastarse con sus respectivas model cards antes de tomar decisiones de produccion. La ventaja diferencial del modelo de Malinali frente a las alternativas multilingues es el tamano (entre 5 y 8 veces menor) y el empaquetado especifico para Candle en movil; la desventaja es la cobertura de un unico par de idiomas y la ausencia de cuantizaciones y benchmarks publicados.

## Limitaciones y advertencias

- Licencia no especificada en el repositorio. El autor remite a la licencia del modelo upstream, pero no se ha verificado en esta ficha cual es exactamente; antes de un uso comercial debe confirmarse la licencia de Helsinki-NLP/opus-mt-fi-ee y las obligaciones de atribucion.
- Contradiccion en los metadatos: la etiqueta `base_model:finetune` sugiere un ajuste fino, mientras que la model card afirma que solo se reempaquetan pesos y se convierte el tokenizador. Conviene auditar los pesos frente al modelo original si el caso de uso es sensible.
- Riesgo de alucinacion y de traducciones incorrectas: como cualquier sistema de traduccion neuronal, puede omitir, duplicar o inventar contenido, especialmente en frases largas, terminologia especializada, nombres propios, siglas o numeros. No es adecuado sin revision humana en contextos legales, medicos o financieros.
- Longitud de contexto no documentada. Los modelos Marian de OPUS-MT suelen degradarse en secuencias largas, con tendencia a truncar o a perder coherencia en documentos extensos; se recomienda segmentar por frases o parrafos.
- Cobertura limitada a un unico par de idiomas y a una sola direccion (fi → ee). No se documenta traduccion inversa, deteccion de idioma ni otros pares.
- Posibles sesgos heredados del corpus OPUS, que esta compuesto mayoritariamente por textos religiosos, parlamentarios, subtitulos y contenido web; esto puede sesgar el registro hacia lo formal o lo literal y penalizar el lenguaje coloquial.
- Idiomas de bajos recursos: tanto el finlandes como el estonio tienen morfologia aglutinante compleja y menos datos paralelos que pares como ingles-espanol, por lo que la calidad esperable es inferior a la de modelos grandes multilingues en esos mismos idiomas, aunque con un coste computacional mucho menor.
- Repositorio sin descargas ni valoraciones, y con fecha de creacion declarada posterior a la fecha de esta ficha. No hay evidencia de uso en produccion ni de mantenimiento activo.
- Al ser un reempaquetado, la calidad final depende integramente del modelo upstream; las mejoras solo pueden venir de la conversion del tokenizador y del runtime de inferencia.
- El uso con vLLM o TGI no esta soportado de forma documentada; desplegarlo por esas vias requiere verificacion adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/malinali-app/opus-mt-fi-ee
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fi-ee
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Referencias del proyecto upstream citadas por el autor (no incluidas en la model card): repositorio de entrenamiento https://github.com/Helsinki-NLP/Opus-MT-train y publicacion de OPUS-MT en EAMT 2020, https://aclanthology.org/2020.eamt-1.61/
- No se han encontrado papers, blogs, demos ni repositorios adicionales especificos de este reempaquetado en la informacion proporcionada.

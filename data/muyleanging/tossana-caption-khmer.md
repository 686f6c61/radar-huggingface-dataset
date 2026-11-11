# muyleanging/Tossana-Caption-Khmer

## Resumen

Tossana-Caption-Khmer es un proyecto de modelo de generacion de descripciones de imagenes (image captioning) en lengua jemer, desarrollado por Muyleang Ing dentro de la familia de herramientas Tossana. El repositorio de Hugging Face existe, pero en el momento de la consulta no contiene pesos: la propia model card lo declara explicitamente como trabajo en curso. Por tanto, no es un modelo utilizable en produccion, sino un anuncio de diseno con especificaciones preliminares.

El objetivo declarado es un modelo pequeno (aproximadamente 33 millones de parametros) capaz de describir fotografias en jemer y de ejecutarse en un telefono sin conexion a internet. La arquitectura prevista combina un codificador de vision ViT-S/16 preentrenado (unos 22M de parametros) con un decodificador Transformer de 4 capas y atencion cruzada (unos 11M), usando un vocabulario de 3.402 tokens de cluster jemer compartido con los otros proyectos de la familia (Chakkhu para OCR, Sota para ASR y Akkhara para teclado).

Su relevancia actual es limitada pero conceptualmente interesante: cubre un hueco poco atendido, el captioning en jemer con despliegue on-device y exportacion a ONNX int8. No obstante, cualquier evaluacion tecnica seria debe posponerse hasta que se publiquen pesos, datos de entrenamiento y resultados en jemer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/16 (codificador de imagen) + Transformer decoder de 4 capas con cross-attention (diseno previsto) |
| Parametros totales | ~33M (22M codificador + 11M decodificador, segun diseno previsto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (exportacion ONNX prevista) |
| Idiomas soportados | jemer (km) |
| Licencia | other, con nombre "tossana-tbd" (pendiente de decidir en el primer release) |
| Formato de pesos | ONNX (previsto); no hay pesos publicados |

## Arquitectura y entrenamiento

El diseno previsto es un modelo encoder-decoder clasico para vision-lenguaje. El codificador es un ViT-S/16 preentrenado que procesa imagenes de 224x224 y las convierte en 196 tokens de parche. El decodificador es un Transformer de 4 capas con dimension oculta d = 384 y atencion cruzada sobre los tokens visuales. El vocabulario es de 3.402 tokens de cluster jemer, reutilizado de los proyectos hermanos Chakkhu y Sota, lo que sugiere una tokenizacion orientada a la escritura jemer y no a subpalabras BPE convencionales.

En cuanto a entrenamiento, la model card menciona que se esta traduciendo Flickr8k al jemer y que un hablante nativo revisara las descripciones de test. Tambien se documenta una prueba de pipeline en ingles sobre Flickr8k (43M de parametros, misma arquitectura) con CIDEr 65.9 y BLEU-4 25.5 sobre 1.000 fotos con beam search de 5. Esos numeros corresponden al modelo en ingles, no al jemer, y no deben interpretarse como rendimiento del modelo objetivo. Se menciona ademas un "concept head + guard" planificado: etiquetas de objetos y un filtro en beam search que descarta descripciones que nombran objetos no detectados. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF o DPO.

## Capacidades

- Generacion de descripciones de imagenes en jemer (image-to-text), segun el objetivo del proyecto.
- Procesamiento de imagenes de 224x224 mediante ViT-S/16.
- Ejecucion on-device prevista mediante exportacion ONNX int8.
- Filtrado de alucinaciones de objetos mediante un "concept head + guard" en beam search (planificado, no implementado).
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo jemer declarado.
- Vision, audio u otras modalidades: solo vision como entrada, texto como salida.

## Casos de uso

- Accesibilidad para personas con discapacidad visual en camboyano: el modelo describiria el contenido de una foto capturada con el movil sin necesidad de conexion, gracias al despliegue ONNX int8 en el propio dispositivo.
- Etiquetado y catalogacion de fotos en jemer: util para aplicaciones de galeria o archivo que necesiten metadatos textuales en lengua local sin enviar imagenes a la nube.
- Moderacion y busqueda de contenido visual en plataformas jemer: las descripciones generadas podrian indexarse para busqueda semantica en jemer, un idioma con poca cobertura en herramientas comerciales.
- Educacion y aprendizaje del jemer: descripciones automaticas de imagenes como apoyo a materiales didacticos o a ejercicios de vocabulario.
- Investigacion en vision-lenguaje de bajos recursos: el modelo serviria como linea base reproducible para comparar tokenizaciones de cluster jemer frente a BPE multilingue.
- Aplicaciones de campo sin conectividad: ONGs o servicios publicos en zonas rurales de Camboya podrian usar el modelo en dispositivos moviles sin red, siempre que se publique una version estable.
- Prototipado de asistentes multimodales en jemer: al ser pequeno (~33M), permitiria experimentar con pipelines encoder-decoder en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en jemer en la informacion disponible. La unica metrica documentada corresponde a una prueba de pipeline en ingles sobre Flickr8k:

| Prueba | Metrica | Valor | Notas |
|---|---|---|---|
| Flickr8k (ingles, mismo pipeline, 43M) | CIDEr | 65.9 | 1.000 fotos, beam 5; no es jemer |
| Flickr8k (ingles, mismo pipeline, 43M) | BLEU-4 | 25.5 | 1.000 fotos, beam 5; no es jemer |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluacion en jemer.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; por el tamano (~33M de parametros), la inferencia en fp32 requeriria del orden de 130 MB y en int8 alrededor de 35 MB, pero son estimaciones teoricas, no medidas publicadas.
- GPU recomendadas: no aplica para un modelo on-device; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria mas que suficiente si llegara a publicarse.
- Cabe en GPU consumer: si, con enorme margen, dado el tamano previsto; tambien cabria en CPU movil.
- Opciones de despliegue: ONNX Runtime (formato previsto); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tossana-Caption-Khmer | ~33M (previsto) | no disponible | jemer | other (tossana-tbd) | Sin pesos publicados |
| Chakkhu (misma familia) | no disponible | no disponible | jemer | no disponible | Proyecto OCR de la misma familia |
| Sota-ASR-Khmer-ONNX (misma familia) | no disponible | no disponible | jemer | no disponible | Modelo ASR ONNX publicado |
| BLIP (referencia general de captioning) | ~220M (base) | no disponible | ingles principalmente | no disponible en la informacion | Publicado |

No se dispone de comparativas cuantitativas con alternativas de captioning en jemer porque no existe un benchmark publico en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible descargar ni ejecutar el modelo.
- La licencia esta sin decidir ("tossana-tbd"); no se puede asumir uso comercial.
- Los datos de entrenamiento provienen de Flickr8k, que es solo para investigacion, lo que condiciona la distribucion del modelo resultante.
- No hay evaluacion en jemer: las metricas citadas son de un pipeline en ingles y no son extrapolables.
- El vocabulario de 3.402 tokens de cluster jemer es poco comun y puede limitar la generalizacion frente a tokenizadores multilingues estandar.
- El "concept head + guard" esta planificado, no implementado; sin el, el riesgo de alucinacion de objetos en las descripciones es alto.
- El modelo esta disenado para imagenes de 224x224, lo que limita el detalle en escenas complejas.
- No hay informacion sobre sesgos, cobertura dialectal del jemer ni calidad de las traducciones de Flickr8k usadas para entrenar.

## Enlaces

- Hugging Face: https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- Web del proyecto Tossana: https://muyleanging.github.io/tossana-web/
- Proyecto Chakkhu (OCR): https://muyleanging.github.io/chakkhu-web/
- Proyecto Sota (ASR): https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- Proyecto Akkhara (teclado): https://muyleanging.github.io/akkhara-web/

# IndexTeam/Index-Translate-omni-2B

## Resumen

Index-Translate-Omni 2B es un modelo multimodal de traduccion desarrollado por IndexTeam, disenado para cubrir traduccion de texto, traduccion de imagenes (image-to-text), reconocimiento automatico de voz y traduccion bidireccional chino-ingles a partir de audio. Forma parte de la familia Index-Translate-Omni, que se presenta en tres tamanos (2B, 9B y 35B-A3B), y hereda la linea de traduccion textual de la coleccion Index-Translate. El modelo se distribuye en formato PyTorch y safetensors, con un repositorio de 7,4 GB.

La propuesta del modelo es unificar en una sola arquitectura tareas que habitualmente requieren pipelines separados: traduccion de texto con restricciones de terminologia, formato y estilo, traduccion de contenido presente en imagenes (capturas, documentos renderizados, memes) y transcripcion/traduccion de voz. Segun la model card, los modulos de voz comparten un tronco de texto congelado, lo que sugiere un diseno de adaptadores multimodales sobre un backbone linguistico comun.

Es relevante ahora porque cubre una combinacion poco frecuente (traduccion + imagen + ASR + traduccion de voz) en un tamano de 2B parametros, lo que lo hace candidato para despliegue con recursos limitados. No obstante, la propia model card advierte que la subida de pesos y manifiestos esta en curso, por lo que el repositorio puede no estar completo para su uso inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con tronco de texto compartido y modulos de imagen y voz; detalles no especificados) |
| Parametros totales | 2B (segun denominacion del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en); la model card menciona "traduccion multilingue" sin listar idiomas adicionales |
| Licencia | no disponible |
| Formato de pesos | PyTorch y safetensors (libreria pytorch; repositorio de 7,4 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. Los datos indican que se trata de un modelo multimodal con soporte de image-to-text y automatic-speech-recognition, y que las tareas de voz comparten un "tronco de texto congelado" (frozen text backbone), lo que apunta a un esquema de adaptadores o encoders multimodales acoplados a un modelo linguistico base que no se reentrena durante el ajuste de las capacidades de voz.

En las tablas de evaluacion de traduccion de imagen se compara el modelo con "Qwen3.5" en sus variantes 2B, 9B y 35B-A3B, lo que sugiere que la familia Index-Translate-Omni podria construirse sobre esa base, aunque la model card no lo confirma explicitamente. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica concreta (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Traduccion de texto con soporte de restricciones de terminologia, formato y estilo.
- Traduccion multilingue segun la model card, aunque los idiomas declarados en los metadatos son unicamente chino e ingles.
- Traduccion de imagenes (image-to-text): extraccion y traduccion de texto contenido en imagenes.
- Reconocimiento automatico de voz (ASR) en chino e ingles.
- Traduccion de voz bidireccional chino-ingles (speech-to-text translation).
- Procesamiento multimodal combinando entrada de texto, imagen y audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo de razonamiento (thinking mode) ni capacidades de audio distintas de ASR y traduccion de voz.

## Casos de uso

- Traduccion de documentacion tecnica con glosario controlado: el modelo acepta restricciones de terminologia, por lo que puede imponer traducciones consistentes de terminos especializados en manuales y articulos, reduciendo la variabilidad terminologica entre fragmentos.
- Localizacion de capturas de pantalla e interfaces: al soportar image-to-text, puede extraer y traducir el texto embebido en imagenes de UI, util para equipos de localizacion que reciben material grafico sin cadenas de texto separadas.
- Traduccion de memes y contenido informal: la model card incluye una metrica especifica (MEME) y reporta 0,6443 para el modelo 2B, lo que lo hace adecuado para contenido de redes sociales donde el registro informal degrada los traductores genericos.
- Subtitulado y traduccion de reuniones chino-ingles: combinando ASR y traduccion de voz, puede transcribir audio y generar traduccion al otro idioma en un solo paso, util para actas de reuniones bilingues.
- Atencion al cliente bilingue: traduccion de mensajes de soporte entre chino e ingles con control de estilo, integrable en flujos de ticketing para normalizar conversaciones entre equipos de distintas regiones.
- Procesamiento de documentos escaneados: al combinar image-to-text y traduccion de texto, permite digitalizar y traducir formularios o facturas en imagen sin un pipeline OCR separado.
- Prototipado en entornos con recursos limitados: con 2B parametros, es viable para pruebas de concepto en una sola GPU consumer, aunque la ausencia de datos de cuantizacion publicados limita la planificacion.

## Benchmarks y rendimiento

Traduccion de texto (COMET22 y metricas auxiliares, mayor es mejor):

| Modelo | FLORES COMET22 | WMT24++ COMET22 | WMT26 Judge | MEME |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 0,8655 | 0,8489 | 60,26 | 0,6443 |
| Index-Translate-Omni 9B | 0,8789 | 0,8601 | 75,35 | 0,7387 |
| Index-Translate-Omni 35BA3B | 0,8795 | 0,8593 | 78,01 | 0,7405 |

Voz (CER en %, menor es mejor; traduccion como BLEU / chrF2 / CER objetivo):

| Modelo | N | ASR chino CER | ASR ingles CER | Ingles→chino | Chino→ingles |
|---|---:|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 30 | 13,8113 | 34,2560 | 36,982 / 30,357 / 43,3452 | 30,747 / 51,152 / 48,0670 |
| Index-Translate-Omni 9B | 30 | 17,8917 | 14,4097 | 43,507 / 36,312 / 41,3767 | 34,656 / 55,376 / 46,3720 |
| Index-Translate-Omni 35BA3B | 300 | 18,6803 | 15,0850 | 42,081 / 35,836 / 49,2490 | 36,404 / 57,323 / 45,1546 |

Nota de la model card: el 2B en ingles→chino usa N=29; el 35BA3B usa una configuracion de front-end distinta para ASR chino; los tamanos de muestra no son directamente comparables entre tamanos.

Traduccion de imagen (COMET22 x100, mayor es mejor; entre parentesis, numero de muestras):

| Modelo | MMTIT | FLORES-rendered | Vistra |
|---|---:|---:|---:|
| Qwen3.5-2B | 52,164 (249) | 50,187 (120) | 55,326 (305) |
| Index-Translate-Omni 2B | 65,809 (249) | 53,612 (120) | 65,596 (305) |
| Qwen3.5-9B | 73,814 (248) | 67,804 (119) | 68,963 (305) |
| Index-Translate-Omni 9B | 77,604 (248) | 68,438 (119) | 71,815 (305) |
| Qwen3.5-35B-A3B | 75,602 (191) | 70,005 (118) | 71,067 (292) |
| Index-Translate-Omni 35BA3B | 77,011 (191) | 69,891 (118) | 71,482 (292) |

Advertencia de la model card: los resultados de imagen del 35BA3B reutilizan mediciones parciales (601/674, con 73 casos UNKNOWN) y no representan una evaluacion completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (2B parametros), en FP16 serian aproximadamente 4-5 GB de pesos, y en cuantizacion de 8 bits alrededor de 2-3 GB, sin contar overhead de los modulos multimodales (imagen y audio), que incrementan el consumo.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o A100/H100 son suficientes en FP16; una GPU consumer de 8-12 GB podria alojarlo solo con cuantizacion, que no esta documentada.
- Cabe en GPU consumer: probablemente si en modelos con 8 GB o mas, sujeto a la disponibilidad de pesos cuantizados, que no se documentan.
- Opciones de despliegue: la model card remite a un documento NATIVE_INFERENCE.md para inferencia nativa; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Traduccion imagen (MMTIT) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Index-Translate-Omni 2B | 2B | no disponible | 65,809 | zh, en | no disponible | repositorio en subida |
| Index-Translate-Omni 9B | 9B | no disponible | 77,604 | zh, en | no disponible | repositorio en subida |
| Qwen3.5-2B | 2B | no disponible | 52,164 | no disponible | no disponible | base de comparacion en la model card |
| Qwen3.5-9B | 9B | no disponible | 73,814 | no disponible | no disponible | base de comparacion en la model card |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de otros traductores multimodales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio indica explicitamente que la subida de pesos, archivos de carga y manifiesto final esta en curso; no debe usarse hasta que se retire ese aviso.
- La licencia no esta disponible, lo que impide evaluar el uso comercial.
- Los idiomas declarados en metadatos son solo chino e ingles; la mencion a traduccion multilingue no viene acompanada de lista de idiomas ni de evaluacion.
- El rendimiento en ASR ingles del modelo 2B (CER 34,2560) es notablemente peor que el del 9B (14,4097), lo que sugiere una degradacion fuerte en esta tarea a ese tamano.
- Los tamanos de muestra de las evaluaciones son pequenos (N=29-30 en voz) y no comparables entre tamanos, segun la propia model card.
- Los resultados de imagen del 35BA3B son parciales (73 casos UNKNOWN) y no representan una evaluacion completa.
- No se documentan sesgos, tasas de alucinacion ni comportamiento en contextos largos.
- No hay informacion sobre cuantizacion, lo que complica el despliegue en hardware limitado.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para flujos agenticos sin verificacion previa.

## Enlaces

- HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-omni-2B
- Coleccion Index-Translate: https://huggingface.co/collections/IndexTeam/index-translate
- Documento de inferencia nativa: NATIVE_INFERENCE.md (referenciado en la model card, sin URL directa disponible)

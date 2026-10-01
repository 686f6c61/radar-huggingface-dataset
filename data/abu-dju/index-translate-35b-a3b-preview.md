# Abu-Dju/Index-Translate-35B-A3B-preview

## Resumen

Index-Translate-35B-A3B-preview es un modelo de traduccion multilingue de tipo mezcla de expertos (MoE) con 35.000 millones de parametros totales y 3.000 millones activos por token, construido sobre la arquitectura Qwen3.5 (etiqueta `qwen3_5_moe`). Forma parte de la familia Index-Translate, asociada en la model card al equipo IndexTeam y al repositorio GitHub de Bilibili, si bien el repositorio de HuggingFace consultado figura publicado por el usuario Abu-Dju. Su proposito es la traduccion de texto entre 150 idiomas siguiendo instrucciones complejas: terminologia fija, formato, estructura, estilo, contexto y longitud de salida.

El modelo resuelve un problema concreto: la traduccion no solo fiel, sino controlable. Ademas de la traduccion general, cubre traduccion con instrucciones (preservar terminos, JSON, codigo y marcadores de posicion) y traduccion social y cultural (alias de comunidades, escritura ludica, memes y expresiones no literales), un terreno donde los traductores genericos suelen fallar. En la comparativa del informe tecnico obtiene el mejor FLORES COMET-22 (0,8794) y el mejor instTrans IFscore (0,8336) entre todos los sistemas evaluados.

Se trata de una version preview: los resultados publicados corresponden al modelo evaluado en el informe tecnico. El repositorio pesa 9,3 GB, lo que resulta llamativamente bajo para 35.000 millones de parametros, y no se documenta en la informacion disponible si se trata de pesos parciales, cuantizados o de un empaquetado incompleto. No consta ninguna descarga ni interaccion en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (etiqueta `qwen3_5_moe`) |
| Parametros totales | 35B |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | 150 idiomas segun la model card; el inventario detallado remite al informe tecnico (no reproducido en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,3 GB |
| Pipeline declarado | translation |
| Autor del repositorio | Abu-Dju (atribucion del desarrollo a IndexTeam / Bilibili en la model card) |
| Fecha de publicacion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso de tipo MoE con 35B parametros totales y 3B activos, derivado de la familia Qwen3.5. La model card no detalla el numero de expertos, el enrutador, la dimension oculta ni la longitud de contexto, por lo que esos datos quedan como no disponibles. El entrenamiento descrito en el informe tecnico se organiza en tres fases.

Primera fase, mid-training multilingue compartido: replay de texto general, texto monolingue, traducciones paralelas ordinarias y grupos multilingues organizados por pivot. La etapa constante usa datos generales, paralelos y monolingues en proporcion 1:1:1, y la etapa de decaimiento usa datos generales, pivot reducido y pivot completo en proporcion 1:4:2, con un total de 167.770 millones de tokens en la receta compartida. Segunda fase, SFT y RL especializados: especialistas en traduccion general, seguimiento de instrucciones y traduccion de memes reciben supervision especifica; el RL de traduccion general combina XCOMET-XXL con juicios de validez idiomatica y adecuacion, el RL de instrucciones usa Rubric-as-Reward con comprobaciones duras y restricciones graduadas, y RIVAL aporta supervision adaptativa del juez. Tercera fase, integracion de expertos y destilacion dirigida: interpolacion de parametros para combinar especialistas complementarios y destilacion on-policy multi-profesor (MOPD) para los tipos de tarea que quedan debiles tras la fusion.

Conviene senalar que el informe especifica pesos de interpolacion de expertos 0,8 / 0,1 / 0,1 para los modelos evaluados de 2B y 9B, pero no asigna esos pesos al preview de 35B-A3B. Tampoco se detalla en la informacion disponible el numero de tokens de la fase de post-entrenamiento ni la composicion exacta del corpus por idioma.

## Capacidades

- Traduccion multilingue general: frases, articulos, subtitulos y otros textos entre los 150 idiomas declarados.
- Traduccion con instrucciones: preservacion de terminos especificados, estructuras JSON y otros formatos, codigo y marcadores de posicion.
- Adaptacion de estilo y resolucion de significado a partir del contexto aportado en la instruccion.
- Traduccion social y cultural: interpretacion de alias de comunidades, escritura ludica, memes y expresiones no literales atendiendo al significado pretendido.
- Control de longitud de salida como parte de las instrucciones de traduccion.
- Rendimiento destacado en idiomas de bajos recursos: FLORES COMET-22 de 0,8168 y XCOMET-XXL de 0,7164, con un 2,4 % de salidas fuera de objetivo.
- Seguimiento de instrucciones en traduccion de bajos recursos: 0,5151 de calidad y 0,7715 de IFscore en instTrans, con un 4,05 % de salidas fuera de objetivo.
- Dialogo multiturno, tool calling, function calling, capacidades de agente, vision o audio: no documentadas en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica con terminologia controlada: el modelo acepta instrucciones que fijan glosarios y preservan nombres de API, fragmentos de codigo y marcadores, lo que permite mantener coherencia terminologica entre versiones de un manual.
- Localizacion de interfaces y ficheros de recursos: al respetar estructuras JSON y marcadores de posicion, puede traducir cadenas de aplicaciones sin romper el formato ni las variables interpoladas.
- Subtitulado y doblaje de contenido audiovisual: la cobertura de 150 idiomas y el control de longitud de salida facilitan ajustar la traduccion a restricciones de caracteres o de duracion por linea.
- Moderacion y traduccion de contenido generado por usuarios: su puntuacion de 0,7405 en MEME y su entrenamiento especifico en expresiones no literales lo hacen adecuado para comunidades donde abundan alias, juegos de palabras y memes que un traductor literal malinterpretaria.
- Atencion al cliente multilingue en mercados secundarios: el mejor rendimiento relativo en idiomas de bajos recursos (0,8168 de FLORES COMET-22) permite cubrir lenguas que otros sistemas atienden con calidad notablemente inferior.
- Traduccion de documentacion legal o administrativa con formato estricto: la combinacion de instrucciones de terminologia y preservacion de estructura reduce la necesidad de revisión manual del formato.
- Investigacion en traduccion automatica: el modelo sirve como linea base reproducible de 35B-A3B para comparar estrategias de instruccion, given que la familia publica informe tecnico, coleccion en HuggingFace y coleccion en ModelScope.
- Traduccion de contenido con contexto largo: no se puede confirmar la ventana de contexto en la informacion disponible, por lo que este caso queda condicionado a verificar dicha especificacion antes de desplegarlo.

## Benchmarks y rendimiento

Resultados reproducidos del informe tecnico citado en la model card. WMT26 Judge usa escala 0-100; el resto de columnas usan escala 0-1. Mayor es mejor excepto en las tasas de salidas fuera de objetivo. instTrans Quality e IFscore miden por separado calidad de traduccion y adherencia a instrucciones.

| Modelo | FLORES COMET-22 | WMT24++ COMET-22 | WMT26 Judge | instTrans Quality | instTrans IFscore | IFMTBench XCOMET-XXL | IFMTBench IFscore | Vertical mean | MEME |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Index-Translate-35B-A3B (preview) | 0,8794 | 0,8586 | 76,76 | 0,6901 | 0,8336 | 0,7926 | 0,8991 | 0,8438 | 0,7405 |
| Index-Translate-9B | 0,8789 | 0,8601 | 75,35 | 0,6771 | 0,8209 | 0,7957 | 0,8760 | 0,8451 | 0,7387 |
| Index-Translate-2B | 0,8655 | 0,8489 | 60,26 | 0,5391 | 0,7569 | 0,7712 | 0,7584 | 0,8377 | 0,6443 |
| Hy-MT2-1.8B | 0,8522 | 0,8401 | 49,35 | 0,3181 | 0,4932 | 0,7493 | 0,7161 | 0,8314 | 0,3643 |
| Hy-MT2-7B | 0,8747 | 0,8593 | 60,51 | 0,5143 | 0,6079 | 0,8049 | 0,8741 | 0,8335 | 0,5139 |
| Hy-MT2-30B-A3B | 0,8787 | 0,8624 | 66,81 | 0,5725 | 0,6415 | 0,8177 | 0,9029 | 0,8459 | 0,5812 |
| TranslateGemma-12B | 0,8732 | 0,8524 | 71,19 | 0,4515 | 0,3068 | 0,8023 | 0,2892 | 0,8347 | 0,4281 |
| North-Small-Translate (218B-A25B) | 0,8784 | 0,8578 | 68,37 | 0,5697 | 0,5294 | 0,7657 | 0,8635 | 0,8357 | 0,6836 |
| Qwen3.5-2B (base) | 0,6983 | 0,6933 | 32,11 | 0,0999 | 0,2431 | 0,6197 | 0,3836 | 0,7557 | 0,2062 |
| Qwen3.5-9B (base) | 0,8316 | 0,8073 | 60,31 | 0,2467 | 0,0609 | 0,7341 | 0,5980 | 0,8199 | 0,5728 |
| Qwen3.5-35B-A3B | 0,8570 | 0,8290 | 71,33 | 0,3690 | 0,5204 | no disponible | no disponible | no disponible | no disponible |

Nota: la fila de Qwen3.5-35B-A3B aparece truncada en el extracto de la model card disponible; las celdas marcadas como no disponibles no constan en la informacion proporcionada. No se han publicado en la informacion disponible resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K, dado que el modelo esta especializado en traduccion y el informe solo reporta metricas de traduccion e instrucciones.

Metricas adicionales en idiomas de bajos recursos para este modelo: FLORES COMET-22 de 0,8168, XCOMET-XXL de 0,7164 y 2,4 % de salidas fuera de objetivo; instTrans de bajos recursos con 0,5151 de calidad, 0,7715 de IFscore y 4,05 % de salidas fuera de objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no dato publicado por el autor): en FP16/BF16, aproximadamente 70 GB para los 35B totales; en INT8, alrededor de 35 GB; en cuantizacion de 4 bits, del orden de 18-20 GB. Al ser un MoE, todos los expertos deben residir en memoria, por lo que el ahorro de VRAM respecto a un denso equivalente es menor de lo que sugiere el numero de parametros activos.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o dos GPU de 48 GB en paralelo con tensor parallelism.
- GPU recomendadas para cuantizacion de 4 bits: RTX 4090 (24 GB), RTX 5090, L40S o A6000; cabe en GPU de consumo de gama alta con cuantizacion agresiva.
- Despliegue: no se documentan integraciones especificas. Dado el formato safetensors y la base Qwen3.5, las rutas habituales serian vLLM o TGI para servicio con concurrencia y llama.cpp/Ollama para el caso cuantizado en local, pero ninguna de ellas esta confirmada por el autor en la informacion disponible.
- Latencia y throughput: no disponibles. El ratio de 3B parametros activos por token sugiere un coste de computo por token propio de un modelo mucho menor que 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FLORES COMET-22 | instTrans IFscore | MEME | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Index-Translate-35B-A3B (preview) | 35B totales / 3B activos | no disponible | 0,8794 | 0,8336 | 0,7405 | Apache 2.0 | HuggingFace y ModelScope |
| Index-Translate-9B | 9B | no disponible | 0,8789 | 0,8209 | 0,7387 | Apache 2.0 (segun familia) | HuggingFace y ModelScope |
| Hy-MT2-30B-A3B | 30B totales / 3B activos | no disponible | 0,8787 | 0,6415 | 0,5812 | no disponible | no disponible en la informacion proporcionada |
| Qwen3.5-35B-A3B (base) | 35B totales / 3B activos | no disponible | 0,8570 | 0,5204 | no disponible | Apache 2.0 (modelo base de la familia) | HuggingFace |
| TranslateGemma-12B | 12B | no disponible | 0,8732 | 0,3068 | 0,4281 | no disponible | no disponible |
| North-Small-Translate | 218B totales / 25B activos | no disponible | 0,8784 | 0,5294 | 0,6836 | no disponible | no disponible |

La diferencia mas marcada frente a los modelos base y frente a Hy-MT2 y TranslateGemma no esta en la calidad de traduccion bruta (donde las cifras son muy cercanas, con 0,8794 frente a 0,8787 de Hy-MT2-30B-A3B) sino en la adherencia a instrucciones: 0,8336 de instTrans IFscore frente a 0,6415 de Hy-MT2-30B-A3B y 0,3068 de TranslateGemma-12B, y 0,8991 de IFMTBench IFscore frente a 0,9029 de Hy-MT2-30B-A3B. En la metrica MEME, con 0,7405, supera a todos los comparadores salvo que se compare con sistemas no listados.

## Limitaciones y advertencias

- Version preview: los resultados publicados corresponden al modelo preview evaluado en el informe tecnico; pueden no reproducirse con el empaquetado actual del repositorio.
- Tamano del repositorio inconsistente: 9,3 GB es un tamano muy inferior al esperado para 35B parametros en precision completa. No se documenta si son pesos parciales, cuantizados, fragmentados o un empaquetado incompleto. Verificar antes de cualquier despliegue.
- Cero descargas e interacciones registradas en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Atribucion ambigua: el repositorio figura bajo el usuario Abu-Dju, mientras que la model card atribuye el desarrollo al equipo IndexTeam y enlaza al GitHub de Bilibili. Conviene confirmar la cadena de custodia de los pesos.
- El numero de referencia arXiv citado (2609.40181) no ha podido verificarse con los resultados de busqueda web disponibles, que no devolvieron ninguna fuente relacionada con el modelo.
- Idiomas: se declaran 150 idiomas, pero el inventario completo no esta en la informacion disponible y remite al informe tecnico. La cobertura real por idioma no es verificable con los datos aportados.
- Longitud de contexto no disponible: limita la planificacion de casos de uso con documentos largos.
- Riesgo de alucinacion: los modelos de traduccion generativa pueden producir contenido no presente en el original, especialmente en idiomas de bajos recursos. El propio informe reporta tasas de salidas fuera de objetivo del 2,4 % en FLORES de bajos recursos y del 4,05 % en instTrans de bajos recursos, que sirven como cota inferior del error en escenarios exigentes.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y de atribucion. Conviene revisar si los pesos derivados de Qwen3.5 anaden condiciones adicionales.
- Metricas de la familia: los pesos de interpolacion de expertos solo se especifican para los modelos de 2B y 9B, no para este preview, lo que dificulta reproducir exactamente la configuracion evaluada.

## Enlaces

- HuggingFace: https://huggingface.co/Abu-Dju/Index-Translate-35B-A3B-preview
- Demo en linea: https://index-translate.bilibili.com/
- Repositorio GitHub: https://github.com/bilibili/Index-Translate
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- Coleccion en HuggingFace: https://huggingface.co/collections/IndexTeam/index-translate
- Coleccion en ModelScope: https://www.modelscope.cn/collections/IndexTeam/Index-Translate
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo en la busqueda realizada; los resultados devueltos correspondian a consultas no relacionadas sobre Visual Studio Code.

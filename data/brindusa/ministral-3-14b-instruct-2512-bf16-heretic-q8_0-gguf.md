# brindusa/Ministral-3-14B-Instruct-2512-BF16-heretic-Q8_0-GGUF

## Resumen

El repositorio brindusa/Ministral-3-14B-Instruct-2512-BF16-heretic-Q8_0-GGUF contiene una cuantizacion GGUF en precision Q8_0 del modelo Ministral 3 14B Instruct 2512, en su variante "heretic" publicada por el usuario hrktos-37. El modelo base pertenece a la familia Ministral 3 de Mistral AI, una linea disenada para ofrecer capacidades de nivel frontera en despliegues de borde. Combina un modelo de lenguaje de 13.506 millones de parametros con un codificador de vision de aproximadamente 0.4 mil millones de parametros, lo que le confiere capacidades multimodales de texto e imagen.

Segun los datos publicados por Mistral AI, este modelo ofrece un rendimiento comparable al Mistral Small 3.2 24B, pero con un tamano significativamente menor, lo que lo hace adecuado para entornos con recursos limitados. La cuantizacion Q8_0 reduce el peso total a unos 14.4 GB, permitiendo su ejecucion en GPUs de consumo con 16 GB o mas de VRAM. El modelo mantiene la licencia Apache 2.0 y soporta diez idiomas.

Cabe destacar que la model card de este repositorio esta copiada del usuario jebcarter, un patron comun en re-uploads de cuantizaciones GGUF. El modelo original en BF16 esta disponible en el repositorio de hrktos-37, y la version oficial de Mistral AI se publica bajo el nombre mistralai/Ministral-3-14B-Instruct-2512.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision) |
| Parametros totales | 13.506.073.600 (13.5B lenguaje + ~0.4B vision) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), BF16 (original), FP8 (version oficial) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Ministral 3 de Mistral AI, una linea de modelos optimizados para despliegue en el edge. Combina un modelo de lenguaje de 13.5 mil millones de parametros con un codificador de vision de aproximadamente 0.4 mil millones de parametros, lo que permite procesar tanto texto como imagenes. La variante "heretic" es una adaptacion publicada por el usuario hrktos-37, aunque no se dispone de detalles especificos sobre las diferencias respecto al modelo oficial de Mistral AI.

El modelo fue post-entrenado para tareas de instruccion (instruct post-training), lo que lo hace adecuado para chat y aplicaciones basadas en instrucciones. Mistral AI publica tambien una version en FP8 para despliegue optimizado en el edge. Los detalles sobre el dataset de entrenamiento, el numero de tokens procesados y las tecnicas de alineacion (RLHF, DPO, etc.) no estan disponibles en la informacion proporcionada. El tag "mistral-common" sugiere el uso del tokenizador y las librerias comunes de Mistral.

## Capacidades

- Generacion de texto y chat multi-turno con seguimiento de instrucciones.
- Comprension de imagenes (vision) gracias al codificador de vision integrado.
- Razonamiento multimodal que combina informacion textual y visual.
- Soporte multilingue en diez idiomas: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Optimizado para despliegue en el edge con precision FP8 en la version oficial.
- Compatible con motores de inferencia como llama.cpp, llama-server y vLLM.

## Casos de uso

- Asistentes virtuales en el edge: el modelo puede desplegarse en dispositivos con recursos limitados gracias a su tamano compacto y la cuantizacion Q8_0, ofreciendo respuestas en tiempo real sin depender de la nube.
- Analisis de documentos con imagenes: la capacidad multimodal permite procesar documentos que combinan texto e imagenes, como informes, facturas o material educativo, extrayendo informacion relevante de ambos formatos.
- Atencion al cliente multilingue: con soporte para diez idiomas, el modelo puede gestionar conversaciones en varios idiomas sin necesidad de modelos separados, reduciendo la complejidad del despliegue.
- Generacion de contenido creativo: redaccion de articulos, correos electronicos o publicaciones en redes sociales en multiples idiomas, aprovechando su capacidad de seguir instrucciones detalladas.
- Clasificacion y extraccion de informacion: procesamiento de texto estructurado y no estructurado para extraer entidades, resumir contenido o clasificar documentos, con la ventaja de poder interpretar tambien imagenes asociadas.
- Prototipado rapido de aplicaciones de IA: gracias a la licencia Apache 2.0 y al formato GGUF, los desarrolladores pueden integrar el modelo en prototipos sin restricciones de uso comercial y probar diferentes configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Mistral AI indica que el rendimiento es comparable al Mistral Small 3.2 24B, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GB para el archivo Q8_0 de 14.4 GB, mas overhead de ejecucion.
- GPUs compatibles: RTX 4080 (16 GB), RTX 4090 (24 GB), A100, H100, o cualquier GPU con 16 GB o mas de VRAM.
- En GPUs de consumo: si, cabe en RTX 4080 y RTX 4090 con cuantizacion Q8_0.
- Opciones de despliegue: llama.cpp (CLI y servidor), llama-server, vLLM, y cualquier motor compatible con GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ministral 3 14B Instruct 2512 (este, variante heretic) | 13.5B + 0.4B vision | no disponible | Apache 2.0 | GGUF Q8_0 |
| Ministral 3 14B Instruct 2512 (oficial) | 13.5B + 0.4B vision | no disponible | Apache 2.0 | BF16, FP8 |
| Mistral Small 3.2 24B | 24B | no disponible | Apache 2.0 | no disponible |

Segun Mistral AI, el Ministral 3 14B ofrece un rendimiento comparable al Mistral Small 3.2 24B, pero con aproximadamente la mitad de parametros, lo que lo hace mas eficiente para despliegue en el edge. La variante "heretic" es una adaptacion de la comunidad cuyo rendimiento relativo respecto al modelo oficial no esta documentado.

## Limitaciones y advertencias

- La variante "heretic" es una adaptacion de la comunidad; no se dispone de informacion sobre su proceso de entrenamiento o posibles diferencias de comportamiento respecto al modelo oficial.
- La model card del repositorio esta copiada de otro usuario (jebcarter), lo que puede indicar que el mantenimiento del repositorio es limitado.
- No se dispone de datos sobre la longitud de contexto soportada, lo que puede afectar al diseno de aplicaciones que requieran ventanas de contexto largas.
- No se han publicado benchmarks especificos para esta variante, por lo que el rendimiento real en tareas concretas no esta verificado.
- Aunque la licencia Apache 2.0 permite uso comercial, la variante "heretic" puede tener diferencias de calidad o seguridad respecto al modelo oficial de Mistral AI.
- El modelo puede presentar sesgos o alucinaciones tipicos de los modelos de lenguaje, especialmente en idiomas con menos representacion en los datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brindusa/Ministral-3-14B-Instruct-2512-BF16-heretic-Q8_0-GGUF
- Modelo base (hrktos-37): https://huggingface.co/hrktos-37/Ministral-3-14B-Instruct-2512-BF16-heretic
- Modelo oficial de Mistral AI: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Version GGUF oficial: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-GGUF
- ModelScope: https://www.modelscope.cn/models/mistralai/Ministral-3-14B-Instruct-2512-BF16
- NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/mistralai-ministral-14b-instruct-2512

# PrinceAlhassanNasamu/kusaal-nllb-600M

## Resumen

El modelo `kusaal-nllb-600M` es un sistema de traducción automática neuronal de código abierto que cubre el par de idiomas kusaal (kus_Latn) e inglés. Lo desarrolla Prince Alhassan Nasamu, investigador de la Universidad de Ghana y hablante nativo de kusaal, una lengua de la rama Gur hablada por aproximadamente 400.000 personas en el norte de Ghana y partes de Burkina Faso. El modelo resuelve la ausencia total de herramientas de traducción digitales para esta lengua de bajo recurso, que no estaba incluida en Google Translate ni en el proyecto NLLB-200 de Meta. Se trata de un fine-tuning del modelo base `facebook/nllb-200-distilled-600M`, con la incorporación del código de idioma `kus_Latn` y una inicialización de embeddings basada en el idioma dagbani (dag_Latn), su pariente Gur más cercano dentro del NLLB.

Con 615 millones de parámetros, el modelo se ha entrenado sobre un corpus paralelo construido desde cero y expandido mediante back-translation, alcanzando un BLEU de 27,57 en la dirección kus→eng y de 13,72 en eng→kus. Su relevancia radica en demostrar que es posible desarrollar herramientas de traducción funcionales para lenguas africanas de bajos recursos mediante técnicas de fine-tuning y aprovechamiento de modelos multilingües existentes, con una licencia Apache 2.0 que permite su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) basado en NLLB-200 distilled 600M |
| Parametros totales | 615.072.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la documentación (el modelo base NLLB usa 512 tokens) |
| Tipos de cuantizacion | No disponibles (pesos en FP32/FP16, sin cuantización oficial) |
| Idiomas soportados | Kusaal (kus_Latn) e inglés (eng_Latn) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del modelo destilado NLLB-200 de 600M, un transformer encoder-decoder con atención estándar y capas de normalización. No es un modelo MoE ni híbrido; es una arquitectura densa. La adaptación a kusaal se realizó añadiendo un nuevo token de idioma (`kus_Latn`) al vocabulario y copiando las embeddings del token `dag_Latn` (dagbani) como inicialización, aprovechando la cercanía lingüística entre ambas lenguas Gur. El entrenamiento consistió en un fine-tuning supervisado sobre un corpus paralelo de 34.568 pares (69.136 ejemplos en ambas direcciones), con división en train (~27.300), val (~5.187) y test (~2.081). El corpus se compiló de fuentes como YouVersion (Bible KJV), GhanaNLP, Lexique Pro, Wikipedia y un índice inglés-kusaal, además de un aumento con back-translation de aproximadamente 2.407 pares sintéticos. No se utilizaron técnicas de RLHF ni DPO; el entrenamiento fue de tipo supervisado estándar.

## Capacidades

- Traducción automática bidireccional entre kusaal e inglés (direcciones kus→eng y eng→kus) en un único modelo.
- Generación de texto en kusaal con control de estilo y dominio limitado al corpus de entrenamiento.
- Manejo de texto formal y religioso (dado el dominio de la Biblia) y de frases cotidianas, de salud, agricultura y números.
- Soporte de inferencia con parámetros de generación configurables (beam search, repetition penalty, etc.).
- No dispone de tool calling, agentes, visión, audio ni capacidades multimodales.
- Multilingüe solo para los dos idiomas entrenados; no extiende a otros.

## Casos de uso

- Atención al paciente en entornos sanitarios: un trabajador de salud puede traducir instrucciones médicas del inglés al kusaal para pacientes que no hablan inglés, mejorando la comunicación en clínicas rurales.
- Traducción de documentos legales y administrativos: permite a hablantes de kusaal entender contratos, formularios oficiales o notificaciones gubernamentales en inglés, y viceversa.
- Educación bilingüe: profesores en escuelas de Ghana pueden generar materiales didácticos en kusaal a partir de contenidos en inglés, o traducir ejercicios para alumnos.
- Acceso a información agrícola: extensionistas agrícolas pueden traducir consejos sobre cultivos, fertilizantes o control de plagas del inglés al kusaal, llegando a comunidades rurales.
- Preservación y documentación lingüística: investigadores pueden usar el modelo para transcribir y traducir textos orales o escritos en kusaal, facilitando el estudio de la lengua.
- Traducción de contenido web y redes sociales: usuarios kusa pueden traducir páginas web o publicaciones en inglés a su lengua materna, reduciendo la brecha digital.
- Herramientas de asistencia para turistas o misioneros: en regiones de Ghana y Burkina Faso, visitantes o cooperantes pueden comunicarse con la población local en situaciones básicas.

## Benchmarks y rendimiento

Se han publicado resultados oficiales declarados por el autor, medidos con sacrebleu sobre un corpus de prueba propio:

| Métrica | Valor | Dirección |
|---|---|---|
| BLEU (kus → eng) | 27.57 | Traducción kusaal a inglés |
| BLEU (eng → kus) | 13.72 | Traducción inglés a kusaal |

No se han publicado resultados comparativos con otros modelos en el mismo corpus, ni en benchmarks estándar como MMLU o HumanEval, ya que el modelo está especializado únicamente en traducción.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 615M parámetros. En FP32 (2,46 GB) se necesita al menos 3 GB de VRAM para inferencia. En FP16 (1,23 GB) se puede ejecutar en GPUs con 2 GB o más. En cuantización de 4 bits (si se convierte a GGUF u otro formato) podría ocupar ~0,8 GB, pero no hay versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o superiores (A100, H100 para mayor velocidad). También puede ejecutarse en CPU con llama.cpp si se convierte a GGUF, pero no hay conversión oficial.
- Despliegue: se puede usar con la librería Transformers de Hugging Face, con vLLM (para inferencia de alto rendimiento en servidores), o con ONNX Runtime. No está disponible en Ollama de forma nativa, pero se podría convertir.
- Latencia: para 600M parámetros, en una GPU moderna (RTX 3090) se espera una latencia de decodificación de pocos milisegundos por token, con throughput de ~100-200 tokens/s. En CPU, la latencia es mayor (del orden de 1-2 segundos por frase corta).

## Comparativa con modelos similares

El modelo no tiene comparación directa con otros modelos específicos para kusaal, ya que es el primero de su tipo. Se puede comparar con el modelo base `nllb-200-distilled-600M` de Meta, que no incluye el kusaal en su vocabulario, y con otros modelos de traducción multilingüe como `mt5-small` o `mbart-50`, pero ninguno cubre esta lengua. La siguiente tabla resume la comparación con el modelo base y con un modelo genérico de 600M:

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Rendimiento (BLEU kus→eng) |
|---|---|---|---|---|---|
| kusaal-nllb-600M (este) | 615M | kus, eng | no especificado | Apache-2.0 | 27.57 |
| facebook/nllb-200-distilled-600M | 600M | 200 | 512 | CC-BY-NC 4.0 (para investigación) | no cubre kusa |
| mBART-50 | 680M | 50 | 512 | MIT | no cubre kusa |

Nota: el modelo base NLLB-200 tiene una licencia CC-BY-NC para uso no comercial, mientras que este fine-tune se ha publicado bajo Apache-2.0, lo que permite uso comercial. No se dispone de benchmarks comparativos en el mismo corpus.

## Limitaciones y advertencias

- La calidad de traducción en la dirección inglés→kusa es notablemente inferior (BLEU 13,72) frente a la dirección kus→inglés (27,57), lo que indica una asimetría en la capacidad de generación en kusaal.
- El corpus de entrenamiento es relativamente pequeño (34.568 pares), lo que limita la cobertura de vocabulario y puede provocar alucinaciones o traducciones incorrectas en dominios no representados.
- La presencia de textos religiosos (Biblia) puede sesgar el modelo hacia un registro formal y vocabulario religioso, no adecuado para todos los contextos.
- El modelo no ha sido evaluado en otros conjuntos de datos ni en tareas de robustez, por lo que su comportamiento en texto ruidoso o con dialectos variantes puede ser inestable.
- No se han realizado pruebas de sesgo o de toxicidad, y puede reflejar los sesgos de los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base NLLB tiene restricciones para uso comercial (CC-BY-NC), aunque el autor de este fine-tune ha publicado bajo Apache-2.0, no se aclara si el fine-tune se considera una obra derivada y qué implicaciones legales tiene. Se recomienda verificar la licencia del modelo base y de los datos.
- No hay soporte de cuantización oficial, por lo que para despliegues en entornos con poca memoria se requiere conversión manual.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/PrinceAlhassanNasamu/kusaal-nllb-600M
- Repositorio de archivos: https://huggingface.co/PrinceAlhassanNasamu/kusaal-nllb-600M/tree/main
- Página personal del autor (con más información del proyecto): https://prince-alhassan.vercel.app/
- Proyecto No Language Left Behind (NLLB) de Meta: https://ai.meta.com/research/no-language-left-behind/
- Modelo base `facebook/nllb-200-distilled-600M` en Hugging Face: https://huggingface.co/facebook/nllb-200-distilled-600M (no se proporciona enlace directo, pero se puede buscar)

Nota: en los resultados de búsqueda no se ha encontrado un enlace directo al modelo base, pero es accesible desde el perfil de Facebook en HF.</think>## Resumen

El modelo `kusaal-nllb-600M` es un sistema de traducción automática neuronal de código abierto, especializado en el par lingüístico kusaal (kus_Latn) e inglés. Ha sido desarrollado por Prince Alhassan Nasamu, investigador de la Universidad de Ghana y hablante nativo de kusaal, una lengua de la familia Gur hablada por unas 400.000 personas en el norte de Ghana y zonas de Burkina Faso. El modelo cubre una necesidad crítica: la ausencia de herramientas de traducción digital para esta lengua, que no está incluida en Google Translate ni en el proyecto NLLB-200 de Meta. Se trata de un fine-tuning del modelo base `facebook/nllb-200-distilled-600M`, con la incorporación del nuevo código de idioma `kus_Latn` y una inicialización de embeddings tomada del dagbani (`dag_Latn`), su pariente Gur más cercano dentro del NLLB.

Con 615 millones de parámetros, el modelo se ha entrenado sobre un corpus paralelo construido desde cero y ampliado mediante back-translation, logrando un BLEU de 27,57 en la dirección kus→eng y de 13,72 en eng→kus. Su relevancia radica en demostrar la viabilidad de desarrollar sistemas de traducción funcionales para lenguas africanas de baja recurso mediante fine-tuning de modelos multilingües existentes, y en liberarse bajo licencia Apache 2.0, lo que permite su uso comercial y académico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) basado en NLLB-200 distilled 600M |
| Parámetros totales | 615.072.768 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la documentación (el modelo base NLLB usa 512 tokens) |
| Tipos de cuantización | No disponible (pesos en FP32/FP16; no hay versiones cuantizadas oficiales) |
| Idiomas soportados | Kusaal (kus_Latn) e inglés (eng_Latn) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura destilada de NLLB-200 de 600M, un transformer encoder-decoder con atención estándar y capas de normalización. No es un modelo MoE ni híbrido. Para adaptar el modelo al kusaal, se añadió el token `kus_Latn` al vocabulario y se inicializaron sus embeddings con las del token `dag_Latn` (dagbani), aprovechando la proximidad lingüística entre ambas lenguas Gur. El entrenamiento consistió en un fine-tuning supervisado sobre un corpus paralelo de 34.568 pares (69.136 ejemplos bidireccionales), dividido en train (~27.300), val (~5.187) y test (~2.081). El corpus se construyó a partir de fuentes como YouVersion (Biblia), GhanaNLP, Lexique Pro, Wikipedia y un índice inglés-kusaal, además de un aumento de back-translation de ~2.400 pares sintéticos. No se emplearon técnicas de RLHF ni DPO; el proceso fue de entrenamiento clásico de secuencia a secuencia.

## Capacidades

- Traducción bidireccional kusaal ↔ inglés en un único modelo.
- Generación de texto en kusaal con control de estilo y dominio, limitada al corpus de entrenamiento.
- Manejo de dominios religioso (Biblia), cotidiano, salud, agricultura y vocabulario básico.
- Inferencia configurable con beam search, repetition penalty, no_repeat_ngram_size, etc.
- No tiene tool calling, soporte de agentes, visión, audio ni otras capacidades multimodales.
- Multilingüe limitado a los dos idiomas entrenados.

## Casos de uso

- **Atención sanitaria**: un trabajador de salud en Ghana puede traducir instrucciones médicas del inglés al kusaal para pacientes que no dominan el inglés, mejorando la comunicación en clínicas rurales.
- **Traducción de documentos legales y administrativos**: permite a los hablantes de kusaal comprender contratos, notificaciones o formularios gubernamentales en inglés, y traducir sus respuestas al kusaal.
- **Educación bilingüe**: los docentes pueden generar materiales de lectura en kusaal a partir de contenidos en inglés, o traducir ejercicios para alumnos de primaria.
- **Asesoramiento agrícola**: los extensionistas pueden traducir consejos sobre cultivos, fertilizantes o control de plagas al kusaal, llegando a comunidades rurales que no usan inglés.
- **Preservación y documentación lingüística**: investigadores pueden traducir textos o transcripciones en kusaal al inglés para estudios lingüísticos, o viceversa.
- **Acceso a contenido digital**: los hablantes de kusaal pueden traducir páginas web o publicaciones en inglés a su lengua materna, facilitando su integración digital.
- **Cooperación internacional y ONG**: organizaciones que trabajan en el norte de Ghana pueden traducir comunicaciones y material informativo al kusaal para la población local.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes, medidos con sacrebleu sobre un corpus de prueba propio:

| Métrica | Valor |
|---|---|
| BLEU (kus → eng) | 27,57 |
| BLEU (eng → kus) | 13,72 |

No se han publicado resultados en otros benchmarks estándar (MMLU, HumanEval, etc.) ni comparaciones con otros modelos en el mismo corpus. El modelo está especializado únicamente en traducción.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 615M parámetros, en FP32 ocupa ~2,46 GB, en FP16 ~1,23 GB, y en cuantización 4 bits ~0,8 GB (si se convierte manualmente). Se recomienda al menos 4 GB de VRAM para FP16.
- GPU recomendadas: cualquier GPU con 4 GB o más, como GTX 1060 6GB, RTX 2060, RTX 3060, o GPUs de servidor como A100 o H100 para mayor velocidad.
- Cabe en GPUs de consumo: sí, en una RTX 3060 o superior.
- Opciones de despliegue: `transformers` de Hugging Face, `vLLM` (soporta seq2seq), `TGI` (Text Generation Inference), y conversión a GGUF para `llama.cpp` o `Ollama` (aunque no hay conversión oficial).
- Latencia: en una GPU de gama alta (RTX 3090) se estima una latencia de decodificación de 5-10 ms por token y un throughput de 100-200 tokens/s. En CPU, la latencia es mayor (1-2 segundos por frase corta).

## Comparativa con modelos similares

No existen otros modelos específicos para kusaal. Se puede comparar con el modelo base NLLB-200 distilled 600M, que no cubre este idioma, y con otros modelos multilingües genéricos. La siguiente tabla muestra la comparación con base y con `mBART-50`:

| Modelo | Parámetros | Idiomas | Contexto | Licencia | BLEU kus→eng |
|---|---|---|---|---|---|
| kusaal-nllb-600M (este) | 615M | kus, en | no especificado | Apache-2.0 | 27,57 |
| facebook/nllb-200-distilled-600M | 600M | 200 | no especificado | CC-BY-NC (no comercial) | no disponible |
| mBART-50 | 680M | 50 | 512 | MIT | no disponible |

El modelo base NLLB-200 tiene restricciones de licencia para uso comercial, mientras que este fine-tune se ha publicado bajo Apache-2.0, lo que amplía las posibilidades de uso.

## Limitaciones y advertencias

- La calidad de traducción en la dirección inglés→kusaal es notablemente inferior (BLEU 13,72) que en la inversa (27,57), lo que indica una asimetría en la generación de texto en kusaal.
- El corpus de entrenamiento es reducido (34.568 pares), por lo que el vocabulario y la cobertura son limitados; se recomienda verificar traducciones en dominios no representados.
- La presencia de datos de la Biblia puede introducir sesgos hacia un registro religioso y formal, no adecuado para contextos coloquiales o técnicos.
- No se han realizado pruebas de sesgo o robustez frente a ruido, dialectos o variantes de la lengua.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base NLLB-200 tiene una licencia CC-BY-NC; es necesario verificar la compatibilidad legal del fine-tune con la licencia del modelo base y de los datos.
- No se ofrece soporte de cuantización ni versiones optimizadas para despliegue ligero.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/PrinceAlhassanNasamu/kusaal-nllb-600M)
- [Repositorio de archivos](https://huggingface.co/PrinceAlhassanNasamu/kusaal-nllb-600M/tree/main)
- [Página personal del autor](https://prince-alhassan.vercel.app/)
- [Proyecto No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/)
- [Modelo base NLLB-200 distilled 600M](https://huggingface.co/facebook/nllb-200-distilled-600M)

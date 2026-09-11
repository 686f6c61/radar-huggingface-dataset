# olusegunola/phi-1.5-primekg-vanillakd-seed7

## Resumen

`olusegunola/phi-1.5-primekg-vanillakd-seed7` es un checkpoint publicado en HuggingFace por el usuario olusegunola, con fecha de creacion y actualizacion del 11 de septiembre de 2026. El identificador sugiere que se trata de un ajuste fino derivado de phi-1.5 (el modelo de 1.300 millones de parametros de Microsoft Research) entrenado con destilacion de conocimiento (la abreviatura "kd" apunta a knowledge distillation, en su variante "vanilla") sobre PrimeKG, un grafo de conocimiento de medicina de precision. El sufijo "seed7" indica que forma parte de una serie de replicas con distintas semillas aleatorias, probablemente para medir varianza experimental. Ninguna de estas deducciones aparece confirmada en la model card, que es la plantilla automatica de HuggingFace sin rellenar.

El repositorio tiene un tamano de 0,1 GB, lo que resulta llamativamente pequeno para un modelo de ~1.300 millones de parametros (un checkpoint completo en fp16 de phi-1.5 ocupa aproximadamente 2,7 GB). Esto sugiere que el repositorio contiene unicamente adaptadores (LoRA u similares), un subconjunto de tensores o un artefacto incompleto, aunque no hay informacion publicada que lo confirme.

La relevancia de esta ficha es limitada: se trata de un experimento academico sin descargas, sin likes, sin licencia declarada y sin documentacion tecnica. Se incluye aqui como ejemplo de publicacion de bajo nivel de documentacion y para advertir de los riesgos de reutilizacion de checkpoints sin model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere transformer decoder-only derivado de phi-1.5, sin confirmar) |
| Parametros totales | no disponible (si conserva la base phi-1.5, ~1.300 millones; sin confirmar) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (phi-1.5 usa 2.048 tokens; sin confirmar para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no declarados; phi-1.5 esta centrado en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura en la model card, que es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]". El unico dato tecnico objetivo es la etiqueta `safetensors` y el tamano del repositorio (0,1 GB). Si se confirma la hipotesis del identificador, la arquitectura subyacente seria la de phi-1.5: un transformer decoder-only de 1.300 millones de parametros, 24 capas, `d_model` de 2.048 y atencion multi-cabeza con rotary embeddings implícitos en la familia phi, entrenado por Microsoft Research sobre datos sinteticos de tipo "textbook quality" (aproximadamente 30.000 millones de tokens en phi-1.5, con objetivos de prediccion del siguiente token y un ajuste posterior de tipo instruction-following sobre un conjunto de ~10.000 ejemplos). Nada de esto esta verificado para este checkpoint concreto.

Respecto al procedimiento de entrenamiento, el nombre del repositorio sugiere destilacion de conocimiento "vanilla" (probablemente destilacion de logits o de respuestas de un profesor de mayor tamano) aplicada sobre datos derivados de PrimeKG, un grafo de conocimiento biomedico que integra 17.080 enfermedades, 4.050 genes, 2.200 farmacos y 1,3 millones de relaciones. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o preferencia humana de ningun tipo. El unico enlace de tipo paper en las etiquetas es `arxiv:1910.09700`, que corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono y que aparece en la plantilla automatica, no a un articulo sobre el modelo.

## Capacidades

- No se ha publicado ninguna capacidad verificada en la informacion disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues declaradas.
- No hay informacion sobre modos especiales (thinking mode, vision, audio, decodificacion especulativa).
- Si la hipotesis del nombre se confirma, se esperaria un modelo especializado en terminologia biomedica y relaciones farmaco-gen-enfermedad, pero ninguna evaluacion respalda esa expectativa.

## Casos de uso

Los siguientes casos son hipoteticos y se derivan exclusivamente del identificador del repositorio y del tipo de dataset sugerido (PrimeKG). No estan respaldados por evaluaciones publicadas y requieren validacion experimental antes de cualquier uso real.

- Exploracion de relaciones biomedicas en investigacion: si el ajuste fino se ha realizado sobre PrimeKG, el modelo podria emplearse para generar hipotesis sobre relaciones farmaco-diana o gen-enfermedad en un entorno de laboratorio, siempre con supervision experta y contraste contra la evidencia primaria.
- Extraccion de entidades biomedicas en pipelines de literatura cientifica: encaje en tareas de reconocimiento de entidades y normalizacion sobre resumenes de PubMed, siempre que se verifique la calidad del ajuste frente a un modelo base.
- Replicacion de experimentos de destilacion de conocimiento: el sufijo "seed7" lo hace util para estudios de reproducibilidad que midan la varianza entre semillas de un mismo procedimiento, un caso de uso metodologico mas que aplicado.
- Docencia de tecnicas de ajuste fino: el repositorio puede servir como ejemplo de artefacto publicado con documentacion incompleta, para discutir buenas practicas de model cards.
- Analisis de data leakage en grafos de conocimiento: si el conjunto de destilacion incluye relaciones textualizadas de PrimeKG, es un candidato razonable para auditar filtracion de informacion estructurada en modelos pequenos.
- Traduccion de consultas a ontologias medicas (SNOMED, MeSH, UMLS): solo si se demuestra mediante evaluacion que el modelo ha heredado la terminologia del grafo de conocimiento, algo que no esta documentado.

En cualquier escenario de produccion, incluido atencion al paciente, triaje clinico o soporte a la decision medica, este checkpoint no deberia emplearse: carece de licencia, de evaluacion y de cualquier garantia de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion, y la busqueda web asociada no ha devuelto ningun resultado relacionado con el modelo.

## Requisitos de hardware

Todas las cifras son estimaciones condicionadas a la hipotesis de que el checkpoint final conserve aproximadamente 1.300 millones de parametros, y no estan verificadas.

- VRAM estimada para inferencia (base de ~1.300 millones de parametros): en fp16 unos 2,6 GB solo de pesos, en torno a 3,5 GB con cache KV para contextos de 2.048 tokens; en int8 unos 1,4 GB; en int4 unos 0,9 GB.
- Si el repositorio contiene unicamente adaptadores (0,1 GB), la VRAM necesaria seria la del modelo base mas el sobrecoste minimo de los adaptadores fusionados.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM o mas lo ejecutaria sin dificultad en fp16; una RTX 3060, RTX 4060, RTX 3070, RTX 4080 o RTX 4090 lo manejan con holgura. Para lotes grandes o servidor, A100 40 GB y H100 no aportan ventaja significativa por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos seis anos, e incluso en CPU con llama.cpp en cuantizacion int4.
- Opciones de despliegue: al no haber variantes GGUF ni cuantizaciones publicadas, el despliegue quedaria limitado a `transformers` con PyTorch, y potencialmente a vLLM o TGI. Ollama y llama.cpp requeririan convertir previamente los pesos a GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No hay datos de rendimiento de este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales de modelos de la misma categoria (menos de 2.000 millones de parametros). Los datos de los modelos alternativos provienen de sus fichas publicas y no implican ninguna comparacion de calidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| olusegunola/phi-1.5-primekg-vanillakd-seed7 | no disponible | no disponible | no disponible | HuggingFace, sin descargas ni likes |
| microsoft/phi-1.5 | ~1.300 millones | 2.048 tokens | MIT | HuggingFace, ampliamente descargado |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1.100 millones | 2.048 tokens | Apache 2.0 | HuggingFace, con variantes GGUF |
| Qwen/Qwen2.5-1.5B | ~1.500 millones | 32.768 tokens | Apache 2.0 | HuggingFace, con variantes GGUF, AWQ y GPTQ |

La diferencia mas relevante frente a las alternativas no es de capacidad tecnica sino de trazabilidad: los tres modelos de referencia publican model card completa, licencia explicita y evaluaciones, mientras que este checkpoint no ofrece ninguno de los tres elementos.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica sin rellenar, por lo que se desconocen datos, procedimiento, hiperparametros y evaluacion.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no lo esta.
- Riesgo de alucinacion elevado en dominio biomedico: si el modelo se ha ajustado sobre un grafo de conocimiento, es probable que genere tripletas plausibles pero falsas, un fallo especialmente peligroso en contexto clinico.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no pueden evaluarse sesgos demograficos, de genero, etnicos o geograficos. PrimeKG tiene un sesgo conocido hacia literatura biomedica en ingles y hacia poblaciones de estudios occidentales.
- Limitaciones de idioma: sin idiomas declarados, no hay garantia de un rendimiento aceptable en castellano. La base phi-1.5 esta optimizada para ingles.
- Limitaciones de contexto: si hereda la ventana de 2.048 tokens de phi-1.5, no es apto para documentos largos ni conversaciones multi-turno extensas.
- Cero adopcion: cero descargas y cero likes implican ausencia de validacion por parte de la comunidad, sin informes de fallos ni de comportamiento en produccion.
- Discrepancia de tamano: 0,1 GB es incompatible con un checkpoint completo de ~1.300 millones de parametros en fp16, lo que sugiere adaptadores o un repositorio incompleto. Conviene verificar el contenido antes de cualquier uso.
- Trazabilidad del ajuste: el sufijo "seed7" indica que existe una familia de checkpoints con distintas semillas; elegir uno concreto sin conocer la varianza entre ellos no es metodologicamente solido.
- Resultados de busqueda no concluyentes: las consultas web devolvieron unicamente portales de television en streaming sin relacion alguna con el modelo, por lo que no existe cobertura externa, ni articulo, ni discusion en foros.

## Enlaces

- HuggingFace: https://huggingface.co/olusegunola/phi-1.5-primekg-vanillakd-seed7
- Referencia citada en las etiquetas del repositorio (calculadora de impacto de carbono, no relacionada con el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning mencionada en la plantilla de la model card: https://mlco2.github.io/impact
- Paper de referencia de phi-1.5 (no citado en el repositorio, incluido por ser la base presumible): https://arxiv.org/abs/2309.05463
- Paper de PrimeKG (no citado en el repositorio, incluido por ser el dataset presumible): https://doi.org/10.1038/s41597-023-01960-3

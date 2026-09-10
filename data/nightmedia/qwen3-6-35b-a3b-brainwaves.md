# nightmedia/Qwen3.6-35B-A3B-Brainwaves

## Resumen

Nightmedia/Qwen3.6-35B-A3B-Brainwaves es un modelo publicado en HuggingFace por el usuario nightmedia el 10 de septiembre de 2026, distribuido bajo licencia Apache 2.0 y con acceso restringido (gated), lo que obliga a aceptar condiciones en la plataforma antes de descargarlo. La nomenclatura del identificador ("35B-A3B") sigue la convencion habitual de los modelos Qwen de tipo Mixture of Experts, donde el primer numero indica los parametros totales y el segundo los parametros activos por token; por tanto, cabe inferir una arquitectura MoE de aproximadamente 35 000 millones de parametros totales con unos 3000 millones activos. Esta inferencia no esta confirmada de forma explicita en la informacion disponible y debe tratarse como tal.

El modelo se presenta como un merge experimental construido con mergekit a partir de varias fuentes, entre ellas AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small, nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1, nightmedia/Qwen3.6-35B-A3B-FSM, Qwen/Qwen-AgentWorld-35B-A3B y Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated. Las etiquetas del repositorio apuntan a un modelo orientado al razonamiento con cadenas de pensamiento largas (long-cot), ajustado por instrucciones mediante SFT y LoRA, con enfasis en matematicas, STEM, codigo e investigacion, y con soporte declarado de cuatro idiomas: ingles, chino, japones y espanol.

Su relevancia actual es limitada pero informativa: se trata de un experimento de fusion de pesos que combina linajes de modelos de agentes y de razonamiento, con pipeline declarado image-text-to-text, lo que sugiere capacidades multimodales de entrada de imagen y texto. El repositorio no registra descargas ni "likes" en el momento de la consulta, no publica resultados de benchmarks y no detalla la longitud de contexto, por lo que su evaluacion practica requiere pruebas propias antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Mixture of Experts (MoE), inferido de la nomenclatura "A3B" y de las etiquetas qwen3_5/qwen3_6; no confirmado explicitamente en la ficha |
| Parametros totales | 35B segun la nomenclatura del identificador; no confirmado en la ficha |
| Parametros activos | ~3B segun la nomenclatura "A3B"; no confirmado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp8, mxfp4 y MLX (etiquetas del repositorio); no se documentan variantes GGUF ni otras |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | no confirmado; libreria transformers, con variantes mxfp8/mxfp4/MLX etiquetadas. Se presume safetensors, sin confirmacion |
| Pipeline declarado | image-text-to-text |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Fecha de publicacion | 10 de septiembre de 2026 (creado y actualizado el mismo dia) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Modelo base | AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small, nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1, nightmedia/Qwen3.6-35B-A3B-FSM, Qwen/Qwen-AgentWorld-35B-A3B, Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de lo que se deduce del identificador y de las etiquetas. Estas ultimas incluyen "merge" y "mergekit", lo que indica que el modelo no se ha entrenado desde cero, sino que se ha construido mediante la fusion de los pesos de varios modelos preexistentes, entre ellos variantes de la familia Qwen3.6 de 35B con 3B activos (Fable-Holo3.1, FSM) y modelos orientados a agentes (Qwen/Qwen-AgentWorld-35B-A3B y la variante abliterated de Jiunsong). La etiqueta "Deckard(qx)" y las menciones a mxfp8, mxfp4 y MLX apuntan a que el autor ha generado o etiquetado variantes cuantizadas especificas para hardware Apple Silicon y para formatos de precision reducida.

En cuanto al entrenamiento, el repositorio declara ajuste por instrucciones (instruction-tuned) con SFT y LoRA, ademas de "distillation" y "long-cot", lo que sugiere que parte del linaje incorpora destilacion de cadenas de pensamiento largas. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas propias, mas alla del propio proceso de fusion de pesos y de la inclusion de un componente multimodal implícito en el pipeline image-text-to-text. Todo lo relativo a arquitectura concreta, atencion, tokenizador o estrategia de enrutamiento de expertos debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en cuatro idiomas declarados: ingles, chino, japones y espanol.
- Razonamiento con cadenas de pensamiento largas (long-cot), segun las etiquetas "reasoning", "chain-of-thought" y "long-cot".
- Matematicas y disciplinas STEM, segun las etiquetas "math" y "stem".
- Generacion de codigo, segun la etiqueta "coding".
- Entrada multimodal de imagen y texto, segun el pipeline declarado image-text-to-text; el alcance real de esta capacidad no esta documentado.
- Ajuste por instrucciones y uso conversacional multi-turno, segun las etiquetas "instruction-tuned" y "conversational".
- Capacidades orientadas a agentes, inferidas del linaje Qwen-AgentWorld presente entre los modelos base; no confirmadas en la ficha.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Modo "thinking" explicito, vision detallada o capacidades de audio: no disponible.

## Casos de uso

- Evaluacion comparativa de fusiones de pesos: el modelo sirve como caso de estudio para investigar si la combinacion de linajes de razonamiento y de agentes (Fable-Holo3.1, FSM, AgentWorld) preserva o degrada capacidades. Se usaria ejecutando la misma bateria de prompts sobre este modelo y sobre cada uno de sus modelos base.
- Generacion de codigo asistida en entornos de desarrollo: dado su enfoque declarado en codigo y su tamano MoE con pocos parametros activos, es adecuado para autocompletado y generacion de funciones en un servidor de inferencia propio, siempre que se validen antes los resultados con pruebas unitarias.
- Resolucion de problemas matematicos y STEM paso a paso: las etiquetas de long-cot y math lo orientan a tareas donde interesa obtener la traza de razonamiento, util para generar material didactico o para construir datasets de entrenamiento de modelos mas pequenos.
- Prototipado de asistentes multilingues para los mercados en, zh, ja y es: su cobertura declarada de estos cuatro idiomas permite probar un mismo asistente en varios mercados sin cambiar de modelo, aunque la calidad relativa por idioma no esta documentada.
- Experimentacion multimodal con entrada de imagen y texto: al declarar el pipeline image-text-to-text, permite prototipar tareas de descripcion de imagenes o respuesta a preguntas sobre documentos escaneados, con la advertencia de que no hay validacion publica de esta capacidad.
- Investigacion sobre destilacion y cadenas de pensamiento: las etiquetas "distillation" y "long-cot" lo hacen util como sujeto de experimentos sobre como se transfieren los patrones de razonamiento entre modelos fusionados.
- Base para ajuste fino posterior con LoRA: al distribuirse bajo Apache 2.0 y en formato compatible con transformers, puede servir como punto de partida para especializaciones verticales, siempre que se respete la clausula de acceso gated del repositorio original.
- Analisis de sesgos y comportamiento de modelos "abliterated": dado que uno de sus linajes base es una variante abliterated, resulta adecuado para estudiar el efecto de ese tipo de intervencion cuando se diluye dentro de una fusion mas amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MATH ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo. No se deben asumir cifras derivadas de los modelos base, ya que el efecto de la fusion de pesos sobre el rendimiento es impredecible y requiere medicion directa.

## Requisitos de hardware

Las siguientes cifras son estimaciones de ingenieria derivadas del recuento de parametros que sugiere el identificador (35B totales, ~3B activos) y no proceden de documentacion oficial del repositorio. Deben verificarse en el entorno real de despliegue.

- Pesos en BF16/FP16: en torno a 70 GB de VRAM solo para pesos, mas el cache KV y las activaciones. Requiere multiples GPU o aceleradores de gran memoria.
- Pesos en 8 bits (mxfp8): aproximadamente 35 GB, mas overhead. Cabe en una unica GPU de 48 GB o 80 GB, o en configuraciones de dos GPU de 24 GB con reparto.
- Pesos en 4 bits (mxfp4): aproximadamente 17-20 GB, mas cache KV. Es la opcion practica para hardware de gama alta de consumo.
- GPU profesionales recomendadas: A100 80 GB y H100 para precision completa o 8 bits; L40S o A6000 para cuantizacion de 4-8 bits.
- GPU de consumo: una RTX 4090 o RTX 5090 con 24 GB puede alojar variantes mxfp4 con contexto moderado; en GPUs de 12-16 GB es probable que haya que reducir contexto o descargar capas a CPU.
- Apple Silicon: el repositorio etiqueta explicitamente MLX y formatos mxfp8/mxfp4, lo que apunta a soporte previsto para Macs con memoria unificada de 32 GB o superior.
- Opciones de despliegue: al usar la libreria transformers, la integracion directa esta garantizada; vLLM, TGI, llama.cpp y Ollama no estan confirmados en la ficha y dependen de que existan pesos en safetensors o GGUF. Las variantes MLX requieren mlx-lm.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 3B parametros activos, es razonable esperar un coste computacional por token mucho menor que el de un modelo denso de 35B, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

La comparacion se establece con los modelos del mismo linaje declarados como base, ya que no hay datos publicos de rendimiento ni de contexto para ninguno de ellos en la informacion disponible.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nightmedia/Qwen3.6-35B-A3B-Brainwaves | Objeto de esta ficha | 35B totales / ~3B activos (inferido) | no disponible | apache-2.0 | Gated en HuggingFace |
| Qwen/Qwen-AgentWorld-35B-A3B | Modelo base declarado | 35B / A3B (por nomenclatura) | no disponible | no disponible en la informacion | Publico en HuggingFace |
| Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated | Modelo base declarado | 35B / A3B (por nomenclatura) | no disponible | no disponible en la informacion | Publico en HuggingFace |
| nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1 | Modelo base declarado, misma autoria | 35B / A3B (por nomenclatura) | no disponible | no disponible en la informacion | Publico en HuggingFace |
| nightmedia/Qwen3.6-35B-A3B-FSM | Modelo base declarado, misma autoria | 35B / A3B (por nomenclatura) | no disponible | no disponible en la informacion | Publico en HuggingFace |

No se dispone de modelos alternativos de otros desarrolladores con los que comparar de forma rigurosa, dado que no hay benchmarks publicados ni especificaciones detalladas de contexto o licencia para las variantes del linaje.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no existe ninguna medicion publicada de calidad, razonamiento o codigo. Cualquier uso en produccion requiere una evaluacion propia previa.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, publicado y actualizado el mismo dia. No ha pasado por revision de la comunidad.
- Naturaleza experimental: las etiquetas incluyen "experimental" y "merge". Las fusiones de pesos pueden degradar capacidades de forma impredecible, incluso cuando cada modelo base funciona correctamente por separado.
- Linaje "abliterated": uno de los modelos base ha sido sometido a un proceso de eliminacion de rechazos de seguridad. Es esperable una menor resistencia a generar contenido problematico, y este efecto puede propagarse a la fusion.
- Acceso restringido: el repositorio es gated, por lo que la descarga exige aceptar condiciones en HuggingFace y no puede automatizarse sin contar con el token y la autorizacion correspondientes.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos o conversaciones extensas sin medirla empiricamente.
- Cobertura multilingue desigual: se declaran en, zh, ja y es, pero no hay datos de calidad por idioma. El castellano esta declarado, no evaluado.
- Capacidad multimodal no verificada: el pipeline image-text-to-text se declara, pero no hay ejemplos, demos ni documentacion que confirmen el alcance real del tratamiento de imagenes.
- Riesgo de alucinacion: los modelos orientados a razonamiento con cadenas de pensamiento largas tienden a producir trazas plausibles pero incorrectas, especialmente en matematicas y codigo. Se recomienda verificacion externa.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de cumplir las condiciones de acceso del repositorio ni de las licencias de los modelos base utilizados en la fusion, que no estan documentadas en la informacion disponible.
- Idoneidad para produccion: no recomendable sin una fase de validacion exhaustiva, dado el caracter experimental y la falta de soporte documental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves
- Modelo base: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo ni sobre su proceso de entrenamiento. Los unicos resultados obtenidos corresponden a la Malaysia Aerospace Industry Association (maia.my) y no guardan relacion con el modelo. No se dispone por tanto de papers, blogs tecnicos, repositorios de codigo ni demos adicionales que enlazar.

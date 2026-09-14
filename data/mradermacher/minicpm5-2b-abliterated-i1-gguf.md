# mradermacher/MiniCPM5-2B-abliterated-i1-GGUF

## Resumen

MiniCPM5-2B-abliterated-i1-GGUF es una distribucion de pesos en formato GGUF del modelo PinoCookie/MiniCPM5-2B-abliterated, publicada por el usuario mradermacher, especializado en cuantizacion de modelos abiertos. Se trata de un modelo de generacion de texto de la familia MiniCPM (generacion 5, escala 2B segun el nombre) al que se le ha aplicado una tecnica de "abliteration", es decir, la modificacion de los pesos para eliminar o atenuar la direccion de rechazo aprendida durante el alineamiento de seguridad. El resultado es un modelo "uncensored" orientado a red-teaming e investigacion sobre mecanismos de negativa.

La relevancia de esta publicacion es doble. Por un lado, ofrece cuantizaciones con imatrix (weighted quants) que permiten ejecutar un modelo de escala 2B en hardware de consumo, algo coherente con la etiqueta "on-device" del repositorio. Por otro lado, sirve como material para estudiar que ocurre con las capacidades y el comportamiento de un modelo cuando se le retira el alineamiento de seguridad, un area activa de investigacion en seguridad de IA.

Conviene advertir desde el principio de que la informacion publicada es extremadamente escasa: la model card no documenta arquitectura, longitud de contexto, volumen de entrenamiento ni resultados de benchmarks, y el repositorio presenta cero descargas y cero valoraciones en el momento de redactar esta ficha. Ademas, los resultados de busqueda web asociados a esta consulta no contienen ninguna referencia relevante al modelo (devolvieron contenido sobre nutricion y quesos), por lo que todas las especificaciones no listadas aqui deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el nombre indica familia MiniCPM, generacion 5, escala 2B) |
| Parametros totales | 774.438 segun los metadatos de safetensors del repositorio; el repositorio declara 0,0 GB de tamano, por lo que el dato no es fiable. El nombre del modelo indica 2B |
| Parametros activos | no aplica / no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix: Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix) |
| Modelo base | PinoCookie/MiniCPM5-2B-abliterated |
| Cuantizador | mradermacher |
| Repositorio de cuantizaciones estaticas | mradermacher/MiniCPM5-2B-abliterated-GGUF |
| Archivo imatrix | MiniCPM5-2B-abliterated.imatrix.gguf (0,1 GB) |
| Fecha de publicacion | 2026-09-13 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card del repositorio no proporciona ningun detalle sobre la arquitectura interna del modelo: no se indica si es un transformer denso, un MoE, un modelo hibrido con capas de atencion lineal ni cual es el mecanismo de atencion empleado. Lo unico deducible del nombre y de las etiquetas es que se trata de la quinta generacion de la familia MiniCPM en una escala de 2B parametros, y que el modelo base sobre el que se ha trabajado es PinoCookie/MiniCPM5-2B-abliterated. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento previo a la abliteracion.

Respecto al proceso de abliteration, la model card no especifica la metodologia concreta aplicada (calculo de la direccion de rechazo, capas intervenidas, escalado de la proyeccion ortogonal, etc.). Se sabe unicamente que el resultado se etiqueta como "abliterated", "uncensored" y "red-teaming", lo que en la practica de esta familia de modelos implica que se han modificado pesos para reducir la probabilidad de respuestas de negativa ante peticiones que el modelo original rechazaria.

En la parte de cuantizacion, el repositorio documenta el uso de un archivo imatrix (matriz de importancia) para generar cuantizaciones ponderadas, con la etiqueta interna quantize_version 2, output_tensor_quantised 1 y convert_type hf. Las cuantizaciones estaticas equivalentes, sin ponderacion por importancia, se publican en un repositorio separado.

## Capacidades

- Generacion de texto en ingles y chino, segun los idiomas declarados en la model card.
- Orientacion explicita a red-teaming: el modelo esta disenado para producir contenido que los modelos alineados rechazan, lo que lo hace util como generador de casos adversarios.
- Comportamiento "uncensored": ausencia esperada de negativas ante peticiones sensibles, como consecuencia de la abliteration.
- Ejecucion en dispositivo ("on-device"), gracias a la disponibilidad de cuantizaciones GGUF de baja precision.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el nombre y las etiquetas no las mencionan.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Red-teaming de sistemas de moderacion: el modelo puede emplearse como generador controlado de peticiones y respuestas que un clasificador de seguridad deberia bloquear, permitiendo medir la tasa de falsos negativos de dicho clasificador en un entorno aislado.
- Generacion de datos adversarios para entrenamiento defensivo: producir pares pregunta-respuesta no rechazados que sirvan como ejemplos negativos en pipelines de fine-tuning de seguridad.
- Investigacion sobre mecanismos de negativa: comparar las respuestas de este modelo con las del modelo base alineado permite estudiar que representaciones internas se ven afectadas por la abliteration.
- Evaluacion de robustez de guardarrailes en produccion: insertar el modelo como atacante en un banco de pruebas que valide las defensas de un asistente desplegado.
- Escritura creativa sin filtros en entornos editoriales: generacion de ficcion con tematicas duras (violencia, conflicto, personajes moralmente ambiguos) donde los rechazos del modelo alineado interrumpen el flujo de trabajo, siempre con revision humana posterior.
- Despliegue local en hardware modesto: al ofrecerse en GGUF con cuantizaciones desde IQ1 hasta Q6_K, permite ejecutar inferencia de texto en portatiles sin GPU dedicada mediante llama.cpp u Ollama, util para pruebas offline.
- Analisis de sesgos y de deriva de alineamiento: servir el modelo en entornos de investigacion para documentar como cambia el tono, la verbosidad y la utilidad de las respuestas al eliminar el alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web no aportan datos al respecto.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas de la escala 2B indicada en el nombre del modelo, ya que el repositorio no publica requisitos de hardware ni datos de latencia. Deben verificarse experimentalmente.

- VRAM estimada para inferencia (solo pesos, sin cache KV): en torno a 1,0-1,3 GB para cuantizaciones IQ2/IQ3, 1,5-1,8 GB para Q4_K_M o IQ4_XS, 2,2-2,5 GB para Q6_K y 4,5-5,5 GB para precision FP16.
- Anadir aproximadamente 0,2-1,0 GB adicionales de VRAM en funcion de la longitud de contexto y del numero de secuencias simultaneas, segun el tipo de cache KV configurado.
- GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, portatiles con grafica integrada reciente) suficientes para las cuantizaciones de 4 bits y menores.
- GPU con 6-8 GB (RTX 3060, RTX 4060 Ti, RTX 2070) permiten Q6_K e incluso FP16 con contexto moderado.
- GPU de datacenter (A100, H100, L40S) no necesarias por escala, salvo para servir muchas peticiones concurrentes en lote.
- Inferencia en CPU viable con llama.cpp para cuantizaciones Q4 y menores; es el escenario coherente con la etiqueta "on-device".
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llamafile y servidores compatibles con GGUF. vLLM y TGI admiten GGUF de forma experimental, con soporte limitado segun version.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de referencia de terceros que aparecen en la tabla no provienen de la informacion proporcionada en esta consulta, por lo que se marcan como no disponibles cuando no se pueden confirmar. Se incluyen unicamente como marco de comparacion cualitativo.

| Modelo | Parametros | Contexto | Licencia | Variante abliterated/uncensored | Disponibilidad GGUF |
|---|---|---|---|---|---|
| MiniCPM5-2B-abliterated-i1-GGUF (este modelo) | 2B segun nombre (metadatos safetensors no fiables) | no disponible | apache-2.0 | si | si, imatrix y estaticas |
| PinoCookie/MiniCPM5-2B-abliterated | no disponible | no disponible | apache-2.0 | si | no (pesos originales) |
| MiniCPM 2B original | no disponible en la informacion proporcionada | no disponible | no disponible | no | si, en repositorios de terceros |
| Qwen 2.5 1.5B | no disponible en la informacion proporcionada | no disponible | no disponible | existen derivados de la comunidad | si |
| SmolLM2 1.7B | no disponible en la informacion proporcionada | no disponible | no disponible | existen derivados de la comunidad | si |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La abliteration elimina el alineamiento de seguridad: el modelo puede generar contenido danino, ilegal o gravemente ofensivo sin ofrecer negativas. No es apto para exposicion directa a usuarios finales sin filtros externos.
- Uso dual: aunque la etiqueta "red-teaming" sugiere un proposito defensivo, el mismo artefacto puede emplearse para generar contenido abusivo a escala. La responsabilidad legal y etica recae en el desplegador.
- La licencia apache-2.0 permite uso comercial y modificacion sin restricciones adicionales por parte del cuantizador, pero no exonera del cumplimiento de la normativa aplicable (por ejemplo, la Ley de Servicios Digitales de la UE o la regulacion sobre contenidos ilicitos).
- Degradacion de capacidades: la intervencion sobre pesos para eliminar la direccion de rechazo suele acompanarse de perdida de coherencia, aumento de la verbosidad y deterioro en tareas de razonamiento. No se han publicado evaluaciones que cuantifiquen este efecto en este modelo concreto.
- Riesgo de alucinacion: no disponible como dato medido, pero es esperable en modelos de escala 2B sin evaluacion publicada.
- Ausencia total de benchmarks: no existe ninguna evidencia publicada sobre MMLU, HumanEval, GSM8K ni metricas multilingues, lo que impide estimar su calidad relativa.
- Cobertura idiomatica limitada a ingles y chino. El rendimiento en castellano no esta documentado y probablemente sea pobre en tareas que requieran matices.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medirla experimentalmente.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) degradan apreciablemente la perplejidad y pueden agravar los problemas de coherencia; se recomienda Q4_K_M o superior para cualquier uso serio.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad. Los metadatos de parametros (774.438) son incoherentes con la escala 2B declarada en el nombre.
- Trazabilidad limitada del proceso de abliteration: no se documenta el metodo, los datos de calibracion ni las capas intervenidas, lo que dificulta reproducir o auditar el resultado.
- No se ha encontrado ninguna fuente secundaria, paper o discusion tecnica sobre este modelo en la busqueda web realizada.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mradermacher/MiniCPM5-2B-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/PinoCookie/MiniCPM5-2B-abliterated
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/MiniCPM5-2B-abliterated-GGUF
- Archivo imatrix: https://huggingface.co/mradermacher/MiniCPM5-2B-abliterated-i1-GGUF/resolve/main/MiniCPM5-2B-abliterated.imatrix.gguf
- Listado de cuantizaciones del autor: https://hf.tst.eu/model#MiniCPM5-2B-abliterated-i1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de archivos GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que cede la infraestructura de cuantizacion: https://www.nethype.de/

Nota: la busqueda web realizada para esta ficha no devolvio ningun resultado relacionado con el modelo. Todos los enlaces listados proceden del repositorio de HuggingFace y de su model card.

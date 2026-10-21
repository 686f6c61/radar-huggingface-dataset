# liana313/tokengate-2wikimqa-qwen3-1.7b

## Resumen

TokenGate 2wikimqa-qwen3-1.7b es un artefacto de inferencia eficiente publicado por el usuario liana313 sobre el modelo denso Qwen/Qwen3-1.7B. No es un modelo completo, sino un par de pesos entrenados de forma conjunta: una puerta aprendida de poda de tokens en la KV-cache (gate layer 1) y un adaptador LoRA (r16, alpha 32) aplicado a las proyecciones q/v de todas las capas. El objetivo es reducir el coste de memoria y de computo en decodificacion con contextos largos, descartando tokens de la cache antes de la atencion en lugar de aplicar una politica heuristica fija.

El checkpoint se entrena sobre una version "gemela" de 2WikiMultihopQA construida sobre la Wikipedia completa (mfqa_2wiki_wiki) y se evalua en la tarea LongBench 2wikimqa, un benchmark de razonamiento multi-salto sobre documentos largos. El paso publicado es el 33000, seleccionado por ser el que maximiza la precision en el conjunto de test retenido con contexto completo entre los pasos guardados, y es exactamente el que emplea el articulo arXiv:2610.26754 en sus experimentos.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de una tecnica de pruning de KV-cache aprendida de extremo a extremo sobre un modelo pequeno, y permite a un investigador reproducir o auditar los resultados del paper sin reentrenar. Requiere la libreria TokenGate para cargarse; no es un modelo que se pueda usar directamente con transformers, vLLM o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) + puerta aprendida de poda de tokens en KV-cache + adaptador LoRA |
| Parametros totales | 1,7 mil millones en el modelo base; el repositorio solo contiene los pesos del gate y del LoRA (~0,1 GB) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-1.7B declara 32 768 tokens nativos (dato del modelo base, no verificado en este repositorio) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye checkpoints en punto flotante) |
| Idiomas soportados | no disponible; hereda los del modelo base Qwen3-1.7B |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch): `gate_step33000.pt` y `lora_step33000.pt`, emparejados por nombre |
| Rango LoRA | r16, alpha 32, aplicado a q/v en todas las capas |
| Capa del gate | gate layer 1 (registrada en los metadatos del propio gate) |
| Checkpoint | paso 33000 de la receta "converged iso" |
| Dataset de entrenamiento | mfqa_2wiki_wiki (gemelo multi-salto de 2WikiMultihopQA sobre Wikipedia completa) |
| Benchmark de evaluacion | LongBench 2wikimqa |
| Herramienta de carga | libreria TokenGate (`tokengate.load_model`) |

## Arquitectura y entrenamiento

La pieza central es una puerta aprendida que decide, token a token, que entradas de la KV-cache se conservan antes de calcular la atencion. Frente a metodos de poda por atencion acumulada o por ventana deslizante, aqui la politica se entrena de extremo a extremo junto con un adaptador LoRA que compensa la perdida de informacion provocada por el descarte. El LoRA se aplica con rango 16 y alpha 32 sobre las proyecciones q y v de todas las capas del transformer, lo que permite que el modelo base permanezca congelado y que el artefacto distribuido sea pequeno (0,1 GB).

El entrenamiento usa la receta "converged iso" sobre mfqa_2wiki_wiki, un gemelo de 2WikiMultihopQA generado sobre la Wikipedia completa, es decir, con documentos de contexto mucho mas largos que los del benchmark original y con cadenas de razonamiento multi-salto. El checkpoint publicado corresponde al paso 33000, elegido entre los pasos guardados por maximizar la precision en test retenido con contexto completo. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; esos datos deben consultarse en el articulo.

## Capacidades

- Generacion de texto condicionada por contexto largo, heredada del modelo base Qwen3-1.7B.
- Poda selectiva de tokens en la KV-cache durante la inferencia, con el objetivo de reducir memoria y latencia en decodificacion.
- Razonamiento multi-salto sobre documentos: el entrenamiento se orienta explicitamente a 2WikiMultihopQA, que exige combinar evidencia de varios pasajes.
- Compensacion de la perdida por poda mediante el adaptador LoRA acoplado, que se carga junto con la puerta.
- Compatibilidad con el modelo base completo: el artefacto se puede descargar y usar como base sin modificaciones, solo anadiendo gate y LoRA.
- Capacidades multimodales, de audio o de vision: no disponibles.
- Soporte declarado de tool calling o function calling: no disponible en la informacion proporcionada (Qwen3 lo soporta a nivel de modelo base, pero no se documenta aqui).
- Capacidades multilingues: no documentadas; dependen del modelo base.

## Casos de uso

- Investigacion en pruning de KV-cache: reproducir los resultados de arXiv:2610.26754 cargando este checkpoint exacto con la libreria TokenGate, sin necesidad de reentrenar la puerta ni el LoRA.
- Audicion de artefactos publicados: comparar el comportamiento del paso 33000 frente a otros pasos de la misma receta para estudiar la estabilidad del entrenamiento de la puerta.
- Experimentos de razonamiento multi-salto con contexto largo: usar la tarea 2wikimqa de LongBench como banco de pruebas controlado para medir la perdida de precision al reducir el numero de tokens en cache.
- Prototipado de servidores de inferencia con memoria limitada: sobre una unica GPU de consumo, el par gate+LoRA permite explorar cotas de VRAM en contextos largos con un modelo de 1,7 mil millones de parametros.
- Docencia y formacion: ejemplo realista y ligero de como se acopla una politica aprendida de compresion de cache a un transformer denso y de como se evalua en un benchmark estandar.
- Base para extension a otros dominios: reentrenar la puerta y el LoRA con la misma receta sobre otro corpus de contexto largo, partiendo de este checkpoint como inicializacion.
- Comparacion de tecnicas de eficiencia: usar este modelo como linea base aprendida frente a metodos heuristicos de poda (H2O, SnapKV, StreamingLLM) en el mismo benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el paso 33000 fue el seleccionado por maximizar la precision en test retenido con contexto completo entre los pasos guardados, y que el checkpoint es el mismo empleado en los experimentos del articulo, pero no incluye cifras. Los datos de evaluacion deben consultarse en arXiv:2610.26754.

| Aspecto de la evaluacion | Detalle declarado |
|---|---|
| Benchmark | LongBench, tarea 2wikimqa |
| Criterio de seleccion del checkpoint | Maxima precision en test retenido con contexto completo entre los pasos guardados |
| Paso publicado | 33000 |
| Cifras numericas | no disponibles en la informacion proporcionada |

## Requisitos de hardware

- Pesos del modelo base en BF16/FP16: aproximadamente 3,4 GB para los 1,7 mil millones de parametros; el gate y el LoRA anaden un margen pequeno sobre los 0,1 GB del repositorio.
- Memoria adicional para la KV-cache: proporcional a la longitud de contexto efectiva; la poda reduce ese consumo, pero la model card no publica factores de compresion ni presupuestos de tokens objetivo.
- GPU de consumo: el modelo base cabe con holgura en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) y con margen amplio en una RTX 4090 de 24 GB, incluso con contextos largos.
- GPU de centro de datos: A100 40/80 GB y H100 son sobredimensionadas para los pesos, pero utiles si se ejecutan barridos de evaluacion con contexto completo y varios lotes.
- Despliegue: la unica via documentada es la libreria TokenGate (`from tokengate import load_model`). No hay evidencia de soporte en vLLM, TGI, llama.cpp, Ollama ni en `transformers` estandar, ya que la puerta requiere logica de inferencia propia.
- Cuantizacion: no se distribuyen pesos GGUF ni cuantizados; el repo solo contiene checkpoints `.pt`. Aplicar cuantizacion de terceros sobre el modelo base es posible en teoria, pero no esta validado ni documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokenGate 2wikimqa-qwen3-1.7b (este) | 1,7 B (base) + gate/LoRA | no disponible (base: 32 768) | Poda aprendida de KV-cache + LoRA | Apache 2.0 | Repo HF con 0 descargas y 0 likes; requiere libreria TokenGate |
| Qwen/Qwen3-1.7B (base) | 1,7 B | 32 768 nativos | Transformer denso sin poda | Apache 2.0 | Ampliamente disponible en HF, soportado por transformers, vLLM y llama.cpp |
| Metodos heuristicos de poda de KV-cache (H2O, SnapKV, StreamingLLM) | no aplica | depende de la implementacion | Poda por atencion acumulada o ventana | habitualmente Apache 2.0 o MIT | Implementaciones de referencia en repos de investigacion |

No se dispone de cifras comparativas de precision ni de velocidad entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance muy estrecho: el artefacto se entrena y evalua unicamente en la tarea 2wikimqa de LongBench; no hay evidencia de que la puerta generalice a otros dominios, idiomas o longitudes de contexto.
- No es un modelo autónomo: sin Qwen3-1.7B y sin la libreria TokenGate no se puede ejecutar; no funciona con `transformers`, vLLM ni llama.cpp de forma directa.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y un unico autor; no hay informes independientes de calidad.
- Riesgo de alucinacion: heredado del modelo base de 1,7 mil millones de parametros, que es propenso a fabricar hechos cuando el contexto es ambiguo o el razonamiento requiere muchos saltos.
- La poda puede eliminar evidencia relevante: el gate descarta tokens de forma irreversible durante la decodificacion; en preguntas multi-salto donde la evidencia aparece en pasajes descartados, la precision puede degradarse de forma dificil de diagnosticar.
- Idiomas no documentados: no se especifica que lenguas cubre el entrenamiento del gate ni del LoRA; el comportamiento fuera del ingles (idioma dominante en 2WikiMultihopQA y LongBench) es incierto.
- Sin cuantizaciones oficiales: no hay GGUF ni versiones int8/int4 validadas, lo que limita el despliegue en entornos de bajos recursos.
- Referencia bibliografica no verificada: el articulo arXiv:2610.26754 no se ha podido contrastar en esta ficha; conviene comprobar su estado de revision antes de citarlo en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el uso en produccion exige mantener los avisos de copyright y asumir que no hay garantias ni soporte del autor.
- Sesgos: no documentados por el autor; al depender de Wikipedia como fuente de entrenamiento, es esperable el sesgo de cobertura y de perspectiva de esa enciclopedia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/liana313/tokengate-2wikimqa-qwen3-1.7b
- Articulo: https://arxiv.org/abs/2610.26754
- Libreria y codigo de carga: https://github.com/tokengate-models/TokenGate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B

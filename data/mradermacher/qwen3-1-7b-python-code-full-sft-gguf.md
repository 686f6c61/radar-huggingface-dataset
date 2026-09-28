# mradermacher/Qwen3-1.7B-Python-Code-Full-SFT-GGUF

## Resumen

Qwen3-1.7B-Python-Code-Full-SFT-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Eternity5551/Qwen3-1.7B-Python-Code-Full-SFT, un ajuste fino supervisado (SFT) del Qwen3-1.7B orientado a generación de código Python. El trabajo de cuantización lo firma mradermacher, autor habitual de conversiones GGUF, y se distribuye con licencia Apache-2.0. El modelo cuenta con 1.720.574.976 parámetros (aproximadamente 1,72 mil millones), lo que lo sitúa en la gama compacta y lo hace apto para inferencia en CPU o en GPU de gama de entrada.

El problema que resuelve es doble: por un lado, ofrece una variante afinada específicamente para código Python, tarea en la que los modelos pequeños generalistas suelen quedarse cortos; por otro, la conversión a GGUF permite ejecutar el modelo en hardware humilde mediante llama.cpp, Ollama o LM Studio, sin necesidad de infraestructura de servidor. El repositorio incluye doce ficheros GGUF, desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que cubre un espectro amplio de compromisos entre tamaño y calidad.

La relevancia actual del modelo es limitada pero concreta: se apoya en un dataset de instrucciones de código publicado por NVIDIA (nvidia/OpenCodeInstruct) y en la arquitectura Qwen3, una de las familias densas más eficientes en la franja de 1 a 2 mil millones de parámetros. No obstante, la ficha original apenas documenta detalles de entrenamiento, no aporta benchmarks y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3); sin datos de capas ni cabezas en la informacion disponible |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; se hereda del modelo base Qwen3-1.7B, cuya documentacion oficial declara 32.768 tokens nativos ampliables con YaRN, extremo no confirmado para este ajuste fino |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16 |
| Idiomas soportados | en (ingles) segun los metadatos del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Modelo base | Eternity5551/Qwen3-1.7B-Python-Code-Full-SFT |
| Dataset de entrenamiento | nvidia/OpenCodeInstruct |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 16,0 GB |
| Descargas y valoraciones | 0 descargas, 0 likes en el momento de la consulta |
| Fecha de creacion del repositorio | 2026-09-27 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso decoder-only de la familia Qwen3, con 1,72 mil millones de parametros. Los metadatos no detallan el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo de atencion empleado, por lo que esos datos quedan como no disponibles. Al no tratarse de una arquitectura MoE, todos los parametros se activan en cada token generado.

El ajuste fino se describe en las etiquetas del repositorio como post-training con supervised-fine-tuning sobre el dataset nvidia/OpenCodeInstruct, un corpus de instrucciones de codigo publicado por NVIDIA. El nombre del modelo incluye la etiqueta "Full-SFT", lo que sugiere un ajuste supervisado completo y no un adaptador LoRA, aunque el autor no publica ni la configuracion de entrenamiento, ni el numero de tokens vistos, ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica propia: el valor anadido del repositorio es la conversion a GGUF y la bateria de cuantizaciones.

La cuantizacion se ha realizado con la version 2 del pipeline del autor, con cuantizacion de tensores de salida activada y conversion desde pesos HuggingFace. Se trata de cuantizaciones estaticas: el autor indica explicitamente que no ha generado cuantizaciones ponderadas ni con matriz de importancia (imatrix) para este modelo, lo que suele traducirse en una perdida de calidad algo mayor en los niveles de bits por peso mas bajos (Q2_K, Q3_K) en comparacion con alternativas ponderadas.

## Capacidades

- Generacion de codigo Python: es la capacidad principal del ajuste fino, entrenado sobre instrucciones de codigo.
- Generacion de texto tecnico y conversacional: el tag "conversational" indica formato de dialogo instruccional.
- Explicacion y documentacion de codigo: al derivar de un corpus de instrucciones, puede describir que hace un fragmento y proponer docstrings.
- Refactorizacion y correccion de fragmentos: dentro de los limites propios de un modelo de 1,72 B.
- Generacion de pruebas unitarias y ejemplos de uso a partir de funciones.
- Capacidades multilingues: limitadas al ingles segun los idiomas declarados; no se documenta soporte de castellano.
- Tool calling / function calling: no se documenta soporte explicito en la informacion disponible.
- Modo de razonamiento o "thinking": no se documenta en la ficha.
- Vision, audio u otras modalidades: no soportadas, no se mencionan en los metadatos.
- Uso como modelo de agentes multi-paso: no verificado ni documentado; el tamano y la ausencia de benchmarks sugieren que no es su punto fuerte.

## Casos de uso

- Autocompletado de codigo Python en el IDE: con la cuantizacion Q4_K_M (1,2 GB), el modelo puede ejecutarse en local junto al editor y ofrecer sugerencias a baja latencia sin enviar codigo a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Revision y explicacion de fragmentos de codigo heredado: se le puede pedir que describa el proposito de una funcion o detecte patrones problematicos en scripts Python de un repositorio interno.
- Generacion de pruebas unitarias en pipelines de CI: integrado como paso previo a la ejecucion de pytest, puede generar esqueletos de tests para funciones nuevas y reducir el trabajo manual de cobertura.
- Documentacion automatica de APIs internas: generacion de docstrings y ejemplos de llamada a partir de firmas de funciones, util en bibliotecas Python mantenidas por equipos pequenos.
- Asistente de aprendizaje de Python: tutor conversacional que explica errores, propone ejercicios y corrige soluciones, desplegable en CPU sobre un portatil.
- Automatizacion de scripts de tratamiento de datos: generacion de fragmentos con pandas o scripts de linea de comandos a partir de una descripcion en lenguaje natural, siempre con revision humana del resultado.
- Despliegue en entornos sin GPU: gracias a las cuantizaciones de menos de 1,5 GB, puede ejecutarse en servidores modestos, contenedores con poca memoria o dispositivos de borde para tareas de generacion puntual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo base y la del repositorio de cuantizaciones no incluyen puntuaciones de MMLU, HumanEval, GSM8K, MBPP ni de ningun otro conjunto de evaluacion, y la busqueda web asociada no ha devuelto ningun resultado relevante sobre el modelo (unicamente dominios ajenos al ambito tecnico). Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para los pesos: f16 aproximadamente 3,5 GB; Q8_0 1,9 GB; Q6_K 1,5 GB; Q5_K_M 1,4 GB; Q4_K_M y Q4_K_S 1,2 GB; IQ4_XS 1,1 GB; Q3_K_L 1,1 GB; Q3_K_S y Q3_K_M 1,0 GB; Q2_K 0,9 GB.
- Memoria adicional: hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto configurada. Con contexto moderado, la cuantizacion Q4_K_M cabe holgadamente en 2 GB de VRAM y deja margen en tarjetas de 4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060). En tarjetas de 8 GB o superiores (RTX 3070/4070/4090, A100, H100) el modelo queda sobredimensionado en memoria y el cuello de botella pasa a ser el ancho de banda.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, e incluso en graficos integrados con memoria compartida si se acepta menor velocidad.
- Ejecucion en CPU: viable con llama.cpp, especialmente en las cuantizaciones Q4_K_M o inferiores; en Apple Silicon funciona a traves de Metal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y otros clientes compatibles con GGUF. vLLM y TGI no estan pensados para GGUF de forma nativa; vLLM incorpora soporte experimental. Para safetensors habria que usar el modelo base con transformers.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion | GGUF disponible |
|---|---|---|---|---|---|
| Qwen3-1.7B-Python-Code-Full-SFT-GGUF (este modelo) | 1,72 B | no disponible | Apache-2.0 | Codigo Python (SFT) | Si, 12 cuantizaciones |
| Eternity5551/Qwen3-1.7B-Python-Code-Full-SFT (modelo base) | 1,72 B | no disponible | Apache-2.0 | Codigo Python (SFT) | No documentado en la informacion disponible |
| Qwen3-1.7B (modelo original de la familia) | 1,7 B | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | Proposito general | Si, por terceros |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache-2.0 | Codigo e instrucciones | Si, por terceros |

Los datos de la familia Qwen3 y de Qwen2.5-Coder proceden de su documentacion publica y no han podido verificarse en la informacion proporcionada para esta ficha; el contexto de este modelo concreto no esta documentado. No se dispone de comparativas de rendimiento porque no hay benchmarks publicados.

## Limitaciones y advertencias

- Idiomas: el modelo declara unicamente ingles. No hay evidencia de soporte de castellano ni de otras lenguas, por lo que su uso en entornos hispanohablantes requeriria evaluacion previa.
- Tamano: 1,72 mil millones de parametros es una cifra baja para razonamiento complejo, tareas de varios pasos o generacion de codigo en marcos poco representados en el dataset.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita estimar su calidad real frente a alternativas de tamano similar.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar funciones de biblioteca, parametros o APIs inexistentes, especialmente en codigo generado sin verificacion.
- Cuantizaciones estaticas: el autor no ha publicado versiones ponderadas ni con imatrix, por lo que los niveles Q2_K y Q3_K pueden degradar notablemente la calidad en codigo.
- Trazabilidad del ajuste fino: no se documentan hiperparametros, numero de tokens de entrenamiento, composicion efectiva del dataset ni etapas posteriores de alineacion; no puede auditarse el proceso.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de creacion inusual en los metadatos (2026-09-27), que conviene contrastar antes de citar el modelo.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero conviene verificar la licencia y las condiciones del modelo base y del dataset nvidia/OpenCodeInstruct antes de un despliegue en produccion.
- Contexto no documentado: planificar el uso con ventanas de contexto largas sin conocer el limite real es arriesgado; se recomienda probar el comportamiento en la longitud objetivo.
- Sesgos: no se han publicado analisis de sesgo; los sesgos del corpus nvidia/OpenCodeInstruct (predominantemente codigo publico en ingles) se heredan sin filtrado documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-1.7B-Python-Code-Full-SFT-GGUF
- Modelo base del ajuste fino: https://huggingface.co/Eternity5551/Qwen3-1.7B-Python-Code-Full-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3-1.7B-Python-Code-Full-SFT-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantizacion: https://www.nethype.de/

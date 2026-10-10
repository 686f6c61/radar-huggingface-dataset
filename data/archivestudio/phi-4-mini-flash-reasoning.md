# ArchiveStudio/Phi-4-mini-flash-reasoning

## Resumen

Phi-4-mini-flash-reasoning es un modelo de lenguaje compacto de 3.852.562.944 parametros (aproximadamente 3,8B) desarrollado por Microsoft dentro de la familia Phi-4 y distribuido en este repositorio por el usuario ArchiveStudio. Esta disenado especificamente para razonamiento matematico multi-paso en entornos con restricciones de memoria, computo y latencia, e incorpora una longitud de contexto de 64K tokens. Su propuesta diferencial no es solo el rendimiento, sino la eficiencia de decodificacion: segun el articulo asociado, alcanza hasta 10 veces mas throughput de decodificacion que Phi-4-mini-reasoning en prompts de 2K tokens con 32K tokens de generacion bajo vLLM.

El modelo se apoya en una arquitectura hibrida denominada SambaY, que combina un self-decoder basado en State Space Models (SSM, estilo Samba) con un cross-decoder que incorpora Gated Memory Units (GMU) para compartir estados de memoria entre capas. Esta construccion, junto con Differential Attention, elimina la necesidad de codificacion posicional explicita y preserva complejidad lineal en la fase de prefill. Se trata de una arquitectura con codigo personalizado (`custom_code`), por lo que requiere cargarse con `trust_remote_code=True` en transformers.

La relevancia actual del modelo radica en que demuestra que un modelo de menos de 4B parametros puede superar a Phi-4-mini-reasoning en tareas como Math500, AIME24/25 y GPQA Diamond sin recurrir a aprendizaje por refuerzo (RL), lo que lo posiciona como candidato para tutoria embebida, sistemas en el borde (edge) y despliegues sensibles a la latencia. Es importante senalar que este repositorio concreto es una copia (mirror) con licencia MIT, sin descargas ni likes registrados en el momento de redactar esta ficha, y que el repositorio canonico es `microsoft/Phi-4-mini-flash-reasoning`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SambaY: decoder-hibrido-decoder con Gated Memory Unit (GMU), self-decoder basado en SSM (Samba) y Differential Attention |
| Parametros totales | 3.852.562.944 (aproximadamente 3,8B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 64K tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos en safetensors; no incluye GGUF ni variantes cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (arquitectura con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura SambaY es un diseno decoder-hibrido-decoder. El self-decoder emplea capas de State Space Models del estilo Samba, mientras que el cross-decoder incorpora Gated Memory Units (GMU), un mecanismo que permite compartir entre capas los estados de lectura de memoria procedentes del self-decoder. Segun el articulo, esta comparticion de representaciones reduce la perdida irreducible frente a una linea base YOCO, mejora el rendimiento en contexto largo y mantiene una complejidad temporal lineal en el prefill. El modelo incorpora ademas Differential Attention y prescinde de codificacion posicional explicita. El resultado es una mejora sustancial de la eficiencia de decodificacion frente a un transformer convencional del mismo orden de tamano.

En cuanto al entrenamiento, el modelo parte de datos sinteticos densos en razonamiento y se afina especificamente para matematicas con datos generados por un modelo mas capaz (de mayor tamano y mejor adherencia a instrucciones). Un dato relevante del articulo es que las mejoras en Math500, AIME24/25 y GPQA Diamond se obtienen sin aprendizaje por refuerzo. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas como RLHF o DPO. La model card indica que el modelo esta disenado y evaluado unicamente para razonamiento matematico.

## Capacidades

- Razonamiento matematico multi-paso: resolucion de problemas que requieren mantener el contexto entre pasos y aplicar logica estructurada.
- Generacion de pruebas formales y computacion simbolica.
- Resolucion de problemas verbales avanzados (advanced word problems).
- Generacion de codigo (el modelo esta etiquetado con `code` y `nlp` en sus tags).
- Generacion de texto conversacional (tags `conversational` y `text-generation`).
- Razonamiento de tipo "thinking" implicito orientado a cadenas de pasos logicos, segun su uso previsto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible en la informacion proporcionada (el foco declarado es razonamiento matematico, no agentes).
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales adicionales (vision, audio, multimodal): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Tutoria matematica embebida: el modelo esta pensado explicitamente para aplicaciones educativas y tutoria ligera, de modo que puede desplegarse en dispositivos con recursos limitados manteniendo explicaciones paso a paso.
- Resolucion de problemas matematicos de nivel universitario: adecuado para Math500, AIME y similares, donde el razonamiento encadenado y la verificacion de pasos son criticos.
- Generacion de pruebas formales y asistencia a demostraciones: su diseno para logica intensiva lo hace apropiado como apoyo en entornos de matematicas formales, siempre con supervision humana.
- Computacion simbolica asistida: integrable en cuadernos o herramientas de algebra para derivar, simplificar o verificar expresiones paso a paso.
- Sistemas de respuesta en tiempo real con latencia acotada: el modelo es hasta 10 veces mas rapido en decodificacion que Phi-4-mini-reasoning bajo vLLM, lo que lo hace apto para asistentes interactivos con restricciones de latencia.
- Despliegue en el borde o en movil: con 3,8B parametros y contexto de 64K, es viable en GPUs de consumo y en entornos embebidos, permitiendo inferencia local sin dependencia de la nube.
- Generacion de datos sinteticos matematicos: puede usarse como generador de soluciones paso a paso para construir datasets de destilacion o evaluacion.
- Preprocesado de pipelines de codigo orientados a matematicas: util para traducir especificaciones matematicas a implementaciones y para resolver problemas de tipo competitivo dentro de un pipeline de CI.

## Benchmarks y rendimiento

El articulo afirma que Phi-4-mini-flash-reasoning obtiene un rendimiento significativamente mejor que Phi-4-mini-reasoning en tareas de razonamiento (Math500, AIME24/25 y GPQA Diamond) sin aprendizaje por refuerzo, y hasta 10 veces mas throughput de decodificacion que Phi-4-mini-reasoning en prompts de 2K tokens con 32K tokens de generacion bajo vLLM. Sin embargo, no se proporcionan cifras numericas concretas en la informacion disponible.

| Benchmark | Resultado | Comparacion |
|---|---|---|
| Math500 | No disponible (cifra no publicada) | Mejor rendimiento que Phi-4-mini-reasoning |
| AIME24 | No disponible (cifra no publicada) | Mejor rendimiento que Phi-4-mini-reasoning |
| AIME25 | No disponible (cifra no publicada) | Mejor rendimiento que Phi-4-mini-reasoning |
| GPQA Diamond | No disponible (cifra no publicada) | Mejor rendimiento que Phi-4-mini-reasoning |
| Throughput de decodificacion (vLLM, 2K prompt / 32K generacion) | Hasta 10x respecto a Phi-4-mini-reasoning | Dato cualitativo del articulo |
| MMLU, HumanEval, GSM8K | No disponibles | No reportados en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 7,7 GB (el repositorio completo pesa 7,7 GB); con overhead de runtime y cache KV conviene reservar del orden de 10-12 GB.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 4-5 GB (si se generan variantes cuantizadas, no incluidas en este repositorio).
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 3 GB (no distribuidas en este repositorio; requeririan conversion por parte del usuario, condicionada por la arquitectura de codigo personalizado).
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion; RTX 4090, RTX 3090 y RTX 4080 para inferencia local.
- Viabilidad en GPU de consumo: si, en GPUs con 12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090) en bf16; en tarjetas de 8 GB solo con cuantizacion, que no esta incluida en este repositorio.
- Opciones de despliegue: vLLM (soporte mediante los PR 20702 para V0 y 23996 para V1; puede requerir ramas especificas dado lo reciente de la arquitectura), transformers con `trust_remote_code=True`, y Azure AI / NVIDIA NIM como servicios gestionados. No hay build oficial documentado en la informacion disponible para llama.cpp u Ollama, al no existir pesos GGUF.
- Latencia y throughput: no disponibles de forma absoluta; el unico dato concreto es la mejora de hasta 10x en throughput de decodificacion frente a Phi-4-mini-reasoning en la configuracion vLLM indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-mini-flash-reasoning (este repositorio) | 3,8B | 64K | SambaY hibrida con GMU | MIT | HuggingFace (mirror) y Azure/NVIDIA NIM |
| Phi-4-mini-reasoning | 3,8B | No disponible en esta informacion | Transformer | MIT | HuggingFace |
| Phi-4-mini-instruct | 3,8B | No disponible en esta informacion | Transformer | MIT | HuggingFace y ONNX |
| Otros modelos matematicos de ~3-4B | No disponible | No disponible | No disponible | No disponible | No disponible |

Nota: la comparativa se limita a los modelos de la familia Phi-4 citados en la model card. No se dispone de datos de contexto, entrenamiento o rendimiento de los modelos alternativos dentro de la informacion proporcionada, por lo que los campos correspondientes se marcan como no disponibles.

## Limitaciones y advertencias

- Modelo disenado y evaluado exclusivamente para razonamiento matematico; no se ha validado su comportamiento en otros dominios.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar pasos intermedios incorrectos con apariencia de razonamiento valido, especialmente en problemas largos o ambiguos.
- Idioma: soporte limitado al ingles; el rendimiento cae en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo o equidad en la informacion disponible; los desarrolladores deben evaluar y mitigar riesgos antes de desplegar en escenarios sensibles.
- Licencia MIT: permite uso comercial, pero la model card remite al fichero LICENSE del repositorio original de Microsoft, por lo que conviene verificar los terminos alli indicados antes de un uso en produccion.
- Este repositorio es un mirror publicado por el usuario ArchiveStudio, sin descargas ni likes registrados; no es la fuente oficial y podria no recibir actualizaciones. Conviene contrastar los pesos con el repositorio oficial de Microsoft.
- Arquitectura con `custom_code`: requiere `trust_remote_code=True`, versiones recientes de transformers y, en vLLM, ramas o PR especificos; puede presentar problemas de compatibilidad con herramientas que asumen arquitecturas transformer estandar.
- Ausencia de pesos cuantizados (GGUF o similares) en este repositorio: dificulta el despliegue en llama.cpp, Ollama u otros runtimes ligeros.
- Se recomienda no usar el modelo en escenarios de alto riesgo (legal, medico, financiero) sin supervision humana.

## Enlaces

- Repositorio en HuggingFace (mirror): https://huggingface.co/ArchiveStudio/Phi-4-mini-flash-reasoning
- Repositorio oficial de Microsoft: https://huggingface.co/microsoft/Phi-4-mini-flash-reasoning
- Articulo (paper): https://arxiv.org/abs/2507.06607
- Paper en HuggingFace: https://huggingface.co/papers/2507.06607
- Blog de Microsoft Azure: https://azure.microsoft.com/en-us/blog/reasoning-reimagined-introducing-phi-4-mini-flash-reasoning/
- Codigo de entrenamiento (ArchScale): https://github.com/microsoft/ArchScale
- Phi Cookbook: https://github.com/microsoft/PhiCookBook
- Portal de Phi: https://azure.microsoft.com/en-us/products/phi
- vLLM PR V0: https://github.com/vllm-project/vllm/pull/20702
- vLLM rama V0: https://github.com/congcongchen123/vllm/tree/congcongchen/phi4-mini-shadow
- vLLM PR V1: https://github.com/vllm-project/vllm/pull/23996
- Probar en Azure AI: https://ai.azure.com/explore/models/Phi-4-mini-flash-reasoning/version/1/registry/azureml-phi-prod
- Probar en NVIDIA NIM: https://build.nvidia.com/microsoft/phi-4-mini-flash-reasoning
- Phi-4-mini-reasoning: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Phi-4-reasoning: https://huggingface.co/microsoft/Phi-4-reasoning
- Phi-4-mini-instruct: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Phi-4-multimodal-instruct: https://huggingface.co/microsoft/Phi-4-multimodal-instruct

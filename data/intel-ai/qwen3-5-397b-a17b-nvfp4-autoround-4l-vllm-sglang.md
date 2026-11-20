# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L-vLLM-SGLang

## Resumen

Qwen3.5-397B-A17B-NVFP4-AutoRound-4L-vLLM-SGLang es un checkpoint derivado del modelo Qwen/Qwen3.5-397B-A17B, publicado por el equipo intel-ai en Hugging Face. Se trata de una variante "reduced-layer" (4L) del modelo original, cuantizada en formato NVFP4 mediante la tecnica AutoRound y empaquetada con compressed-tensors para su despliegue en runtimes tipo vLLM y SGLang. No es un modelo nuevo entrenado desde cero, sino una version comprimida y recortada en profundidad del modelo base de Qwen.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 397.000 millones de parametros totales y 17.000 millones de parametros activos por token, segun la nomenclatura A17B del identificador. La variante aqui descrita conserva unicamente 28.153 millones de parametros reales en los safetensors, lo que confirma la reduccion drastica de capas respecto al original. El repositorio ocupa 81,3 GB.

Su relevancia es fundamentalmente practica para el ecosistema de inferencia: los formatos NVFP4 (FP4 de NVIDIA) combinados con AutoRound buscan reducir el coste de memoria y aumentar el throughput en GPUs Blackwell, y la reduccion de capas permite experimentar con despliegues mas ligeros del modelo. Sin embargo, el propio autor advierte de que el texto generado puede aparecer corrupto en algunas peticiones, por lo que no debe considerarse un checkpoint listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parametros totales | 28.153.458.432 (checkpoint reducido); modelo base: 397B |
| Parametros activos | 17B (modelo base, segun nomenclatura A17B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA FP4) con AutoRound; empaquetado con compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |
| Capas | 4L (reduccion de capas respecto al modelo base) |
| Tamano del repositorio | 81,3 GB |
| Libreria / runtime | vLLM (validado); compatible con SGLang |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B es un transformer con arquitectura Mixture of Experts: 397.000 millones de parametros totales de los que se activan aproximadamente 17.000 millones por token. Esta variante concreta no introduce entrenamiento adicional; es un proceso de compresion en dos etapas. Primero, una cuantizacion a NVFP4 (formato de coma flotante de 4 bits de NVIDIA) mediante AutoRound, una tecnica de cuantizacion post-entrenamiento que ajusta los parametros de redondeo para minimizar la perdida de precision. Despues, una reduccion de capas a 4L, que recorta la profundidad de la red y reduce el numero de parametros efectivos hasta los 28.153 millones que reflejan los safetensors.

El resultado se empaqueta con la libreria compressed-tensors y se valida sobre el flujo de inferencia de vLLM. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens procesados, ni si se aplicaron fases de RLHF o DPO. Tampoco se documenta en la model card ninguna innovacion adicional como decodificacion especulativa o atencion lineal. La innovacion principal de este checkpoint es el propio pipeline de compresion: cuantizacion de 4 bits con AutoRound orientada a GPUs Blackwell y reduccion de profundidad para abaratar la inferencia.

## Capacidades

- Generacion de texto y conversacion: hereda la capacidad conversacional del modelo base Qwen3.5, aunque la model card advierte de que la salida puede aparecer corrupta en algunos prompts.
- Razonamiento y matematicas: presumiblemente heredadas del modelo base, pero no verificadas en esta variante reducida.
- Generacion de codigo: no verificada en este checkpoint; depende de la fidelidad de la cuantizacion y del recorte de capas.
- Tool calling y function calling: no documentado en la model card de esta variante.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta disponible.
- Modo thinking: no documentado.
- Vision o audio: no documentado.

## Casos de uso

- Evaluacion de pipelines de cuantizacion NVFP4: sirve para probar el flujo completo de AutoRound y compressed-tensors en vLLM con un modelo de gran escala antes de aplicar la tecnica a checkpoints completos.
- Pruebas de integracion con vLLM y SGLang: permite validar configuraciones de despliegue, carga de pesos comprimidos y compatibilidad de kernels FP4 en entornos de desarrollo.
- Benchmarking de hardware Blackwell: util para medir throughput y latencia de inferencia en FP4 sobre GPUs de nueva generacion con un modelo de 28B parametros efectivos.
- Investigacion sobre reduccion de capas: adecuado para estudiar el impacto del recorte de profundidad (4L) en la calidad de generacion frente al modelo base completo.
- Prototipado de bajo coste en laboratorio: al ocupar 81,3 GB, permite experimentar con un derivado de un MoE de 397B en infraestructura mas modesta que la requerida por el modelo original.
- Docencia y formacion en tecnicas de compresion: util como ejemplo practico de cuantizacion post-entrenamiento y empaquetado de pesos para runtimes de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 81,3 GB en el repositorio; se requiere al menos esa cantidad de memoria, mas overhead de activaciones, KV cache y buffers del runtime. En la practica, se necesitan GPUs con 96 GB o mas por dispositivo, o despliegue multi-GPU.
- GPU recomendadas: GPUs NVIDIA con soporte nativo de FP4 (generacion Blackwell, como B200) por el formato NVFP4; H100 o A100 requeririan conversion o kernels de emulacion no documentados en esta ficha.
- Cabe en consumer GPU: no. Los 81,3 GB de pesos superan la VRAM de cualquier GPU de consumo actual (RTX 4090: 24 GB; RTX 5090: 32 GB).
- Opciones de despliegue: vLLM (validado por el autor); SGLang (mencionado en el nombre y como objetivo de runtime); no se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L-vLLM-SGLang | 28,15B (reducido de 397B MoE) | no disponible | NVFP4 / safetensors | no disponible | Hugging Face |
| Qwen/Qwen3.5-397B-A17B (base) | 397B totales / 17B activos | no disponible | safetensors (BF16/FP8 presumiblemente) | no disponible | Hugging Face |
| Otras variantes NVFP4 AutoRound de la familia Qwen3.5 | no disponible | no disponible | NVFP4 | no disponible | Hugging Face (set Reduced Models) |

La comparativa se limita al modelo base y a otras variantes del mismo set "Reduced Models" del autor, ya que no se dispone de datos de rendimiento ni de especificaciones de alternativas de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de salida degradada: el autor advierte explicitamente de que el texto generado puede aparecer corrupto en algunos prompts en las variantes reducidas actuales, y que este problema es conocido. No es apto para produccion sin validacion exhaustiva.
- Perdida de capacidades por recorte de capas: la reduccion a 4L elimina gran parte de la profundidad del modelo original, lo que previsiblemente degrada razonamiento, coherencia en contexto largo y fidelidad en tareas complejas.
- Cuantizacion agresiva: NVFP4 (4 bits) introduce error adicional respecto al modelo base; AutoRound mitiga pero no elimina esta perdida.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe verificarse la licencia del modelo base Qwen3.5-397B-A17B antes de cualquier uso.
- Idiomas no documentados: no hay garantia de soporte multilingue en esta variante.
- Contexto no documentado: se desconoce la ventana de contexto efectiva tras la reduccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, agravado por la compresion y el recorte de capas.
- Dependencia de hardware Blackwell: el formato NVFP4 esta optimizado para GPUs NVIDIA de ultima generacion; en otras plataformas el rendimiento puede ser deficiente o requerir conversion.
- Baja adopcion: 19 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L-vLLM-SGLang
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B

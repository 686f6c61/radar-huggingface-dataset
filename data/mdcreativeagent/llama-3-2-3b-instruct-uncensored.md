# mdcreativeagent/Llama-3.2-3B-Instruct-uncensored

## Resumen

Llama-3.2-3B-Instruct-uncensored es una variante "abliterada" del modelo Meta Llama-3.2-3B-Instruct, publicada por el usuario mdcreativeagent en Hugging Face. El modelo parte de los pesos oficiales de Meta y les aplica la tecnica de abliteration, que identifica y elimina las direcciones de activacion responsables del comportamiento de rechazo (refusal) en el espacio residual del transformer. El resultado es un modelo de 3.606.752.256 parametros que rara vez se niega a responder, manteniendo la arquitectura y el conocimiento del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de modificacion de pesos cada vez mas extendida en la comunidad open source; por otro, advierte de los riesgos de desplegar variantes sin alineacion en produccion. El modelo conserva el contexto de 128.000 tokens del Llama-3.2 original y se distribuye en formato safetensors con un repositorio de 7,2 GB, lo que sugiere pesos en bfloat16 o float16.

Cabe senalar que el autor del repositorio (mdcreativeagent) no coincide con el autor de la model card original (chuanli11), y que la model card incluida parece copiada del repositorio de chuanli11. Esto introduce incertidumbre sobre la procedencia exacta de los pesos y sobre si el proceso de abliteration se aplico realmente o solo se replico la documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), con atencion por grupos (GQA) |
| Parametros totales | 3.606.752.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama-3.2-3B-Instruct; no confirmado en la model card de este repo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo contiene safetensors; se asume compatibilidad con GGUF/AWQ via herramientas externas, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia; el modelo base Llama 3.2 usa Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Llama 3.2, con 3.606 millones de parametros y atencion por grupos (GQA), tal como el Llama-3.2-3B-Instruct original de Meta. No se ha reentrenado: la modificacion consiste en abliteration, una tecnica de edicion de pesos que calcula la direccion media de activacion asociada a respuestas de rechazo (usando pares de prompts daninos/inofensivos) y proyecta esa direccion fuera de las matrices de pesos en las capas residuales. El procedimiento se basa en el trabajo de Andy Arditi et al. (paper arXiv:2406.11717) y en el cuaderno de FailSpy, y fue empaquetado por mlabonne en un script de Colab.

La model card no aporta informacion sobre datos de entrenamiento adicionales, tokens de RLHF/DPO posteriores ni innovaciones tecnicas mas alla de la propia abliteration. No se documenta si se realizo un ajuste fino posterior para recuperar capacidades, ni que capas fueron intervenidas. La falta de detalles tecnicos y la discrepancia entre el autor del repo y el autor de la model card impiden verificar la reproducibilidad del proceso.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones en formato chat (roles user/assistant).
- Generacion de codigo y matematicas a nivel de modelo pequeno (3B), sin garantias de calidad en tareas complejas.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Llama 3.2 lo soporta, pero no se confirma que la abliteration lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas (el modelo base soporta oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes; no confirmado tras la modificacion).
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible.
- Reduccion del comportamiento de rechazo: el autor afirma que "rara vez se niega a responder", aunque en temas sensibles tiende a dar informacion general en lugar de instrucciones operativas.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta a las tasas de rechazo y a la calidad de las respuestas, comparandolo con el Llama-3.2-3B-Instruct original en un banco de pruebas controlado.
- Analisis de robustez de filtros: util para evaluar si los clasificadores de contenido de un pipeline de produccion detectan respuestas que un modelo sin alineacion podria generar.
- Generacion creativa sin restricciones excesivas: escritura de ficcion, dialogos o guiones que aborden temas adultos o controvertidos, donde el modelo base rechazaria la peticion.
- Red teaming interno: simulacion de un adversario que intenta obtener contenido danino, para calibrar defensas y politicas de moderacion.
- Prototipado rapido en local: con 3,6B parametros y safetensors, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4090) para experimentos de generacion de texto sin depender de APIs externas.
- Docencia y demostraciones: ilustrar en un aula el funcionamiento de la abliteration y sus limites, mostrando como el modelo responde a prompts que el modelo alineado rechaza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/float16: aproximadamente 7,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB para contextos cortos.
- VRAM estimada en cuantizacion 8 bits: en torno a 4 GB; en 4 bits (si se generan pesos GGUF/AWQ, no incluidos en el repo): en torno a 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir con vLLM y contextos largos; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda en precision completa; RTX 4060 Ti 16 GB o RTX 4070 Ti Super 16 GB para cuantizaciones.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 para contextos moderados, y en 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (pipeline), vLLM (comando `vllm serve` documentado en la model card), text-generation-inference (tag `text-generation-inference` en el repo), llama.cpp/Ollama solo si se generan pesos GGUF (no incluidos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mdcreativeagent/Llama-3.2-3B-Instruct-uncensored | 3,6B | 128k (heredado, no confirmado) | no disponible | Hugging Face, safetensors | Variante abliterada; sin benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128k | Llama 3.2 Community License | Hugging Face, safetensors | Modelo base alineado; soporte oficial de tool calling y multilingue |
| chuanli11/Llama-3.2-3B-Instruct-uncensored | 3,2B | 128k (heredado) | no especificada en la card | Hugging Face, safetensors | Modelo del que parece derivar la model card; incluye Space de demo |
| failspy/llama-3-70B-Instruct-abliterated | 70B | 8k | no especificada | Hugging Face | Referencia metodologica de abliteration, pero de mayor tamano |

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo, pero no garantiza precision: el modelo puede generar contenido falso, danino o ilegal con tono seguro.
- Riesgo elevado de alucinacion, agravado por el tamano de 3B y por la falta de ajuste posterior a la modificacion.
- La model card advierte explicitamente que el modelo es solo para investigacion y puede producir salidas inexactas o poco fiables.
- No se especifica licencia en el repositorio; el uso comercial es incierto y podria infringir la Llama 3.2 Community License del modelo base, que exige atribucion y aceptacion de sus terminos.
- Discrepancia entre el autor del repo (mdcreativeagent) y el autor de la model card (chuanli11): no se puede verificar la procedencia de los pesos ni que la abliteration se haya aplicado realmente.
- Idiomas soportados no documentados; el multilingue oficial del modelo base puede haberse degradado.
- No se documenta soporte de tool calling, agentes ni modo thinking; no asumir estas capacidades en produccion.
- El modelo no debe desplegarse en atencion al cliente, salud, legal o finanzas sin moderacion externa y revision humana.
- Sesgos conocidos del modelo base Llama 3.2 (genero, raza, religion) persisten y pueden amplificarse al eliminar los rechazos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mdcreativeagent/Llama-3.2-3B-Instruct-uncensored
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio de referencia con model card original: https://huggingface.co/chuanli11/Llama-3.2-3B-Instruct-uncensored
- Space de demostracion: https://huggingface.co/spaces/chuanli11/Chat-Llama-3.2-3B-Instruct-uncensored
- Paper de abliteration (Arditi et al.): https://arxiv.org/abs/2406.11717
- Blog de mlabonne sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Cuaderno de FailSpy: https://huggingface.co/failspy/llama-3-70B-Instruct-abliterated/blob/main/ortho_cookbook.ipynb
- Script de mlabonne en Colab: https://colab.research.google.com/drive/1VYm3hOcvCpbGiqKZb141gJwjdmmCcVpR?usp=sharing
- Cuaderno original de Arditi et al.: https://colab.research.google.com/drive/1a-aQvKC9avdZpdyBn4jgRQFObTPy1JZw?usp=sharing

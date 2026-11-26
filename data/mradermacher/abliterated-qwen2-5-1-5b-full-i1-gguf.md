# mradermacher/abliterated-Qwen2.5-1.5B-full-i1-GGUF

## Resumen

`mradermacher/abliterated-Qwen2.5-1.5B-full-i1-GGUF` es una publicacion de pesos cuantizados en formato GGUF derivada del modelo `C4445654/abliterated-Qwen2.5-1.5B-full`, que a su vez es una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas o atenuadas mediante tecnicas de edicion de pesos) del Qwen2.5-1.5B de Alibaba. El autor, mradermacher, es un generador prolifico de cuantizaciones GGUF para llama.cpp y otros runtimes compatibles, y en este caso publica una bateria de cuantizaciones con y sin imatrix ("i1" indica el uso de importance matrix).

El modelo base pertenece a la familia Qwen2.5, una arquitectura transformer decoder-only con atencion por ventanas deslizantes y contexto nativo de 32.768 tokens (caracteristica de la serie Qwen2.5 de 1,5B). El proceso "abliteration" modifica los pesos para reducir el comportamiento de rechazo aprendido en el alineamiento, lo que produce un modelo mas permisivo pero tambien mas propenso a generar contenido problematico.

La relevancia de esta ficha es practica: ofrece un conjunto de cuantizaciones ligeras (desde Q2_K hasta Q6_K, incluyendo variantes IQ) que permiten ejecutar un modelo de 1,5B en hardware muy modesto, incluso en CPU o GPUs de gama baja, con un sesgo hacia usos de investigacion sobre alineamiento y generacion sin restricciones. El repositorio no incluye model card descriptiva, licencia declarada ni idiomas; los metadatos son minimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.020.404 (dato de safetensors del repo; el modelo base Qwen2.5-1.5B tiene ~1,5B parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-1.5B base soporta 32.768 tokens) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp; el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B, un transformer decoder-only de Alibaba con atencion de tipo grouped-query y ventana deslizante, entrenado sobre un corpus multilingue amplio (el informe tecnico de Qwen2.5 reporta 18 billones de tokens para la familia completa, aunque la cifra exacta para el modelo de 1,5B no se detalla en la informacion disponible). El alineamiento del modelo original incluye fases de supervised fine-tuning y optimizacion por preferencias.

Sobre esa base se aplico "abliteration", una tecnica de edicion de pesos que identifica y proyecta fuera las direcciones del espacio de activaciones asociadas al rechazo, sin reentrenar. El resultado es un modelo que responde a peticiones que el original rechazaria, a costa de degradar parcialmente la coherencia y aumentar el riesgo de contenido danino. Las cuantizaciones publicadas por mradermacher emplean el pipeline de llama.cpp con importance matrix (imatrix) para las variantes "i1", lo que mejora la fidelidad respecto al modelo en precision completa en los niveles bajos de bits.

## Capacidades

- Generacion de texto autoregresiva y continuacion de contexto.
- Razonamiento basico y respuesta a instrucciones heredadas del Qwen2.5-1.5B.
- Generacion de codigo y matematicas a nivel de modelo pequeno (limitado por el tamano).
- Soporte multilingue heredado del modelo base (idiomas exactos no declarados en el repo).
- Ejecucion local en CPU y GPU mediante llama.cpp y runtimes compatibles con GGUF.
- Comportamiento "uncensored": responde a peticiones que el modelo alineado rechazaria.
- No se documenta soporte de tool calling, function calling, agentes ni vision en esta publicacion.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: comparar las respuestas del modelo abliterated frente al Qwen2.5-1.5B original para estudiar como se distribuyen las direcciones de rechazo y que capacidades se degradan tras la edicion de pesos.
- Despliegue en hardware embebido o CPU: las cuantizaciones Q2_K a Q4_K permiten ejecutar un modelo de ~1,5B en dispositivos con 1-3 GB de RAM, util para prototipos de asistentes locales sin conexion.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos donde el modelo alineado introduciria rechazos; el bajo coste computacional facilita iteracion rapida.
- Pruebas de robustez y red teaming: usar la variante abliterated como modelo "atacante" o generador de casos adversarios en evaluaciones de moderacion.
- Educacion y demostraciones de cuantizacion: el amplio conjunto de niveles (IQ1 a Q6_K) sirve para ilustrar el compromiso entre tamano, calidad y velocidad en llama.cpp.
- Experimentos de destilacion o fine-tuning ligero: el modelo base de 1,5B es manejable para ajustes con LoRA en una unica GPU consumer, y la version abliterated puede servir como punto de partida para estudiar la recuperacion de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (aproximada para un modelo de ~1,5B): Q2_K ~0,8-1,0 GB; Q4_K_M ~1,1-1,3 GB; Q6_K ~1,5-1,7 GB; IQ1/IQ2 por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060) para las cuantizaciones bajas; A100/H100 no son necesarias y estarian infrautilizadas.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y servidores compatibles con GGUF (llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU moderna se espera un rendimiento interactivo para un modelo de este tamano, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| abliterated-Qwen2.5-1.5B-full-i1-GGUF (este) | ~1,5B | no disponible | no disponible | GGUF | Variante abliterated cuantizada |
| Qwen2.5-1.5B (original) | ~1,5B | 32.768 | Apache 2.0 (Qwen2.5) | safetensors, GGUF | Alineado, seguro, ampliamente soportado |
| Llama 3.2 1B | ~1,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Alternativa ligera con contexto largo |
| Gemma 2 2B | ~2,6B | 8.192 | Gemma Terms of Use | safetensors, GGUF | Mayor tamano, buen rendimiento en razonamiento |

La comparativa se basa en caracteristicas publicas de los modelos base; no se dispone de datos de benchmarks para esta variante abliterated.

## Limitaciones y advertencias

- El proceso de abliteration degrada la coherencia y puede aumentar las alucinaciones respecto al Qwen2.5-1.5B original.
- Riesgo elevado de generar contenido danino, ofensivo o ilegal; no apto para produccion orientada al publico sin moderacion externa.
- La licencia no esta declarada en el repositorio; la licencia del modelo base Qwen2.5 (Apache 2.0) no cubre necesariamente las modificaciones, por lo que el uso comercial queda en una zona juridica incierta.
- Idiomas soportados no documentados; se heredan del modelo base pero sin garantia.
- Contexto efectivo no verificado en esta publicacion; las cuantizaciones bajas (IQ1, IQ2) pueden degradar el seguimiento de instrucciones y la coherencia en contextos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por la comunidad.
- No se documenta soporte de tool calling ni de agentes; no asumir capacidades de function calling.
- El dato de parametros totales (1.020.404) parece corresponder a un recuento parcial y no al total real del modelo base; conviene verificar antes de dimensionar despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/abliterated-Qwen2.5-1.5B-full-i1-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/C4445654/abliterated-Qwen2.5-1.5B-full
- Familia Qwen2.5 (Alibaba): https://huggingface.co/Qwen/Qwen2.5-1.5B
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Perfil del autor: https://huggingface.co/mradermacher

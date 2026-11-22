# divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx

## Resumen

Llama-3.3-70B-Instruct-abliterated-8bit-mlx es una cuantizacion en 8 bits del modelo huihui-ai/Llama-3.3-70B-Instruct-abliterated, publicada por el usuario divinetribe y empaquetada en formato MLX para su ejecucion nativa en Apple Silicon. El modelo subyacente parte de Llama 3.3 70B Instruct de Meta, un transformer denso de 70.553.706.496 parametros, al que se le ha aplicado la tecnica de "abliteration" para eliminar el comportamiento de rechazo aprendido durante el alineamiento, dando lugar a una variante sin censura (uncensored).

La aportacion de esta ficha concreta no es el entrenamiento sino la distribucion: convierte un modelo de 70B en un artefacto de 75 GB que puede ejecutarse localmente en un Mac con suficiente memoria unificada mediante la libreria mlx-lm. Esto resulta relevante para desarrolladores e investigadores que necesitan inferencia de un modelo grande, sin dependencia de la nube y con pesos abiertos, en hardware de escritorio de Apple.

La licencia es la Llama 3.3 Community License, heredada del modelo base de Meta, lo que impone obligaciones de atribucion y un umbral de 700 millones de usuarios activos mensuales para uso comercial a gran escala. El modelo declara soporte para ocho idiomas y esta orientado a generacion de texto conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.3), pesos en formato MLX |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.3 declara 128k, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | 8 bits (unica variante publicada en este repo) |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | llama3.3 (Llama 3.3 Community License) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Llama 3.3 de Meta, con 70.553.706.496 parametros totales. Sobre el modelo base huihui-ai/Llama-3.3-70B-Instruct-abliterated se aplico la tecnica de abliteration, que consiste en identificar y suprimir la direccion del espacio de activaciones asociada al comportamiento de rechazo, de modo que el modelo deja de declinar peticiones que el Instruct original rechazaria. No se dispone de informacion sobre el volumen de tokens, la composicion del dataset ni el proceso de alineamiento (RLHF/DPO) empleado en el modelo base dentro de la informacion proporcionada.

La capa anadida por divinetribe es la cuantizacion a 8 bits y la conversion al formato MLX, optimizado para el framework MLX de Apple y para ejecucion en Apple Silicon con memoria unificada. El repositorio ocupa 75,0 GB, coherente con pesos de 70B en 8 bits mas metadatos. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en esta ficha.

## Capacidades

- Generacion de texto conversacional multi-turno en ocho idiomas declarados (ingles, frances, italiano, portugues, hindi, espanol, thai y aleman).
- Razonamiento general e instrucciones complejas, heredadas del modelo Instruct de Llama 3.3.
- Generacion de codigo y matematicas, segun las capacidades del modelo base (no verificadas con benchmarks en esta ficha).
- Comportamiento sin censura (abliterated): reduce los rechazos del Instruct original ante peticiones que este declinaria.
- Ejecucion local en Apple Silicon mediante mlx-lm, sin necesidad de GPU dedicada ni de servicios en la nube.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es text-generation.

## Casos de uso

- Inferencia local en Mac de gama alta: cargar el modelo con mlx-lm en un equipo con memoria unificada suficiente (el repo pesa 75 GB) para disponer de un 70B sin conexion ni coste por token, util en entornos con requisitos de privacidad.
- Investigacion sobre alineamiento y seguridad: comparar las respuestas del modelo abliterated con las del Llama 3.3 Instruct original para estudiar como la supresion de la direccion de rechazo afecta a la utilidad y a los comportamientos no deseados.
- Prototipado de asistentes conversacionales multilingues: el soporte declarado de espanol, frances, italiano, portugues, aleman, hindi y thai permite probar flujos de atencion en varios idiomas antes de escalar a infraestructura en la nube.
- Generacion de texto creativo y redaccion sin restricciones de contenido: la variante abliterated resulta adecuada para ficcion, guiones o contenidos donde el Instruct original aplicaria filtros de rechazo.
- Evaluacion de cuantizacion: medir la perdida de calidad de los pesos en 8 bits MLX frente al modelo base en precision completa, como paso previo a decidir el formato de despliegue.
- Experimentacion docente y de laboratorio: ejecutar un modelo de 70B en hardware de escritorio Apple para practicas de inferencia, sin depender de claves de API ni de GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 75,0 GB en 8 bits; se necesita memoria unificada disponible proxima a esa cifra mas margen para el contexto y el runtime de MLX.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta pensado para Apple Silicon (series M con memoria unificada amplia).
- Cabe en consumer GPU: no se confirma para GPUs de consumo tipo RTX 4090 (24 GB), que no alcanzan los 75 GB del modelo en 8 bits. En Apple Silicon requiere configuraciones de memoria unificada alta.
- Opciones de despliegue: mlx-lm (libreria declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no se confirman para este formato en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx | 70.553.706.496 | no disponible | MLX 8 bits | llama3.3 | Objeto de esta ficha; orientado a Apple Silicon |
| huihui-ai/Llama-3.3-70B-Instruct-abliterated | 70B (modelo base) | no disponible | safetensors (prec. original) | llama3.3 | Modelo base sin cuantizar; mayor huella de memoria |
| Llama 3.3 70B Instruct (Meta) | 70B | no disponible | safetensors | llama3.3 | Version alineada con rechazos; referencia de comportamiento |
| Otras variantes cuantizadas de Llama 3.3 70B (GGUF, AWQ) | 70B | no disponible | GGUF/AWQ | llama3.3 | Alternativas para llama.cpp o GPUs; no verificadas en esta busqueda |

## Limitaciones y advertencias

- La abliteration elimina los rechazos del alineamiento: el modelo puede generar contenido danino, ilegal o inseguro sin filtros, lo que exige moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion inherente a los modelos de 70B; no se han publicado evaluaciones de fidelidad para esta variante.
- La cuantizacion a 8 bits puede degradar ligeramente la calidad respecto al modelo base en precision completa; no se aportan mediciones.
- La licencia Llama 3.3 Community License obliga a incluir el aviso "Built with Llama", a conservar el texto de la licencia y a solicitar permiso a Meta si se superan los 700 millones de usuarios activos mensuales.
- El formato MLX limita el despliegue a Apple Silicon; no es portable directamente a CUDA ni a servidores x86 convencionales.
- La longitud de contexto efectiva no se documenta en esta ficha; conviene verificar el limite real del modelo base antes de usarlo con entradas largas.
- El soporte multilingue se declara para ocho idiomas, pero no se aportan evaluaciones de calidad por idioma.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/Llama-3.3-70B-Instruct-abliterated-8bit-mlx
- Modelo base: https://huggingface.co/huihui-ai/Llama-3.3-70B-Instruct-abliterated
- Licencia Llama 3.3: https://llama.com/llama3_3/license/
- Politica de uso aceptable: https://www.llama.com/llama3_3/use-policy
- Documentacion de Meta: https://llama.com/docs/overview
- Descarga de Llama: https://www.llama.com/llama-downloads

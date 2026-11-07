# fffffgggg54/RWKV7-0.1B-World2.8-SAE

## Resumen

RWKV7-0.1B-World2.8-SAE es un conjunto de autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre el modelo base RWKV7-Goose-0.1B-World2.8-HF, un transformer de la familia RWKV7 con aproximadamente 0,1 mil millones de parámetros. El autor del repositorio es el usuario de Hugging Face fffffgggg54, y el modelo se distribuye con licencia Apache 2.0. No se trata de un modelo generativo en sí, sino de un artefacto de interpretabilidad: los SAE permiten descomponer las activaciones internas del modelo base en características dispersas y analizables.

El repositorio incluye tres tipos de SAE: uno por cabeza de atención (state SAE, de 64 a 8192 dimensiones con selección de 16), uno sobre el flujo residual tras cada bloque time-mix y channel-mix (residual SAE, de 768 a 32768 con selección de 64) y uno sobre las salidas de cada bloque time-mix y channel-mix (module SAE, también de 768 a 32768 con selección de 64). El entrenamiento y las pérdidas reportadas siguen la definición de MSE normalizado del artículo "Scaling and evaluating sparse autoencoders" de OpenAI. Es relevante ahora porque facilita el análisis de mecanismos internos en arquitecturas RWKV7 de tamano reducido, un area con pocos recursos públicos de interpretabilidad.

El modelo base sobre el que se entrenan los SAE es RWKV7-Goose-0.1B-World2.8-HF, publicado por el equipo oficial de RWKV. El dataset de entrenamiento declarado es JeanKaddour/minipile. El tamano del repositorio es de 10,3 GB, lo que sugiere que contiene los pesos de los SAE y posiblemente artefactos auxiliares, aunque no se detalla su desglose.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoders (SAE) sobre modelo base RWKV7 (transformer recurrente lineal) |
| Parametros totales | no disponible (el modelo base tiene ~0,1B; los SAE no reportan recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 10,3 GB; probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Los SAE se entrenan sobre las activaciones internas del modelo base RWKV7-Goose-0.1B-World2.8-HF. Se definen tres familias: state SAE, que opera sobre el estado de atención con una proyección de 64 a 8192 dimensiones y selecciona 16 características activas por token y cabeza, con un SAE por cabeza que intenta reconstruir S @ ones(64,1); residual SAE, aplicado al flujo residual después de cada bloque time-mix y channel-mix, con proyección de 768 a 32768 y selección de 64; y module SAE, aplicado a las salidas de cada bloque time-mix y channel-mix, con la misma dimensionalidad 768 a 32768 y selección de 64.

El entrenamiento utiliza la pérdida MSE normalizada tal como se define en el artículo de OpenAI "Scaling and evaluating sparse autoencoders". El código de entrenamiento está disponible en el repositorio de GitHub https://github.com/fffffgggg54/StateSAE. No se especifican en la información disponible el número de tokens de entrenamiento de los SAE, la composición exacta del dataset más allá de minipile, ni si se emplearon técnicas de regularización adicionales (L1, top-k, etc.) más allá de la selección de características indicada.

## Capacidades

- No es un modelo generativo: no produce texto, código ni respuestas. Su función es la descomposición e interpretación de activaciones internas del modelo base.
- Extracción de características dispersas del flujo residual y de las salidas de bloques time-mix y channel-mix del modelo RWKV7-Goose-0.1B-World2.8-HF.
- Análisis por cabeza de atención mediante state SAE, con reconstrucción del estado agregado S @ ones(64,1).
- Reconstrucción de activaciones con pérdida MSE normalizada, lo que permite medir la fidelidad de la descomposición.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step por sí mismo.
- No tiene capacidades multilingües propias ni modo de pensamiento, visión o audio.
- Utilidad principal: investigación de interpretabilidad mecanicista sobre arquitecturas RWKV7.

## Casos de uso

- Interpretabilidad mecanicista en RWKV7: usar los residual SAE para identificar direcciones del flujo residual asociadas a conceptos concretos y estudiar cómo se transforman entre bloques time-mix y channel-mix.
- Análisis de cabezas de atención: los state SAE permiten examinar qué información agrega cada cabeza (reconstrucción de S @ ones(64,1)) y detectar cabezas redundantes o especializadas.
- Detección de características en modelos pequeños: al operar sobre un modelo de ~0,1B, los SAE facilitan experimentos de interpretabilidad con recursos de cómputo modestos, útiles para docencia y prototipado.
- Auditoría de representaciones: comparar las características activadas por el modelo base ante distintos tipos de entrada (texto de minipile u otros corpus) para estudiar sesgos o comportamientos indeseados.
- Investigación de arquitecturas recurrentes lineales: el state SAE sobre el estado de atención es un punto de partida para estudiar cómo RWKV7 comprime información en su estado recurrente frente a la atención cuadrática de transformers clásicos.
- Desarrollo de herramientas de visualización: integrar los SAE en pipelines de análisis que mapeen activaciones a características legibles, por ejemplo para dashboards de depuración de modelos.
- Reproducción de experimentos: el código en GitHub permite reentrenar SAE sobre otras capas o modelos de la familia RWKV7 y comparar pérdidas de reconstrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repo ocupa 10,3 GB, lo que sugiere que los pesos de los SAE (varias proyecciones de 768 a 32768 y de 64 a 8192 por cabeza) requieren varios GB en precisión completa; con cuantización a fp16 o int8 el requisito se reduciría aproximadamente a la mitad o a un cuarto, respectivamente, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponible. Por el tamano del artefacto, una GPU con al menos 16-24 GB de VRAM (RTX 4090, A100 40 GB) sería razonable para cargar los pesos sin cuantizar, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) y posiblemente en RTX 3090 (24 GB) si se carga en fp16; no confirmado.
- Opciones de despliegue: no se especifican. Al ser SAE y no un modelo generativo, no aplican vLLM, llama.cpp, Ollama ni TGI; el uso esperado es mediante PyTorch y el código de https://github.com/fffffgggg54/StateSAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RWKV7-0.1B-World2.8-SAE (este) | SAE sobre RWKV7 | no disponible (base ~0,1B) | no disponible | Apache 2.0 | Hugging Face |
| RWKV/RWKV7-Goose-World2.8-0.1B-HF | Modelo generativo RWKV7 | ~0,1B | no disponible | no disponible en la informacion | Hugging Face |
| SmerkyG/RWKV7-Goose-0.1B-World2.8-HF | Modelo base del SAE | ~0,1B | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de información sobre otros conjuntos de SAE públicos comparables para RWKV7 en la búsqueda realizada; la comparativa se limita a los modelos base de la misma familia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; usarlo como tal produciría resultados sin sentido.
- Los SAE son aproximaciones: la reconstrucción con MSE normalizado no es perfecta y puede omitir características relevantes o introducir artefactos.
- La selección de 16 características por cabeza (state SAE) y 64 por bloque (residual y module SAE) limita la capacidad de representación; características raras o de baja frecuencia pueden quedar fuera.
- El modelo base tiene ~0,1B parámetros, por lo que las conclusiones de interpretabilidad no se extrapolan directamente a modelos mayores de la familia RWKV7.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas específicas en la información disponible; al no ser generativo, estos riesgos aplican al modelo base, no al SAE.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero conviene verificar la licencia del modelo base SmerkyG/RWKV7-Goose-0.1B-World2.8-HF antes de un uso en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es muy escueta; no hay validación externa de los resultados.
- El tamano del repo (10,3 GB) puede dificultar su carga en entornos con VRAM limitada; no se documentan versiones cuantizadas.

## Enlaces

- Hugging Face: https://huggingface.co/fffffgggg54/RWKV7-0.1B-World2.8-SAE
- Modelo base en Hugging Face: https://huggingface.co/SmerkyG/RWKV7-Goose-0.1B-World2.8-HF
- Modelo oficial RWKV7-Goose-World2.8-0.1B-HF: https://huggingface.co/RWKV/RWKV7-Goose-World2.8-0.1B-HF
- Código de entrenamiento: https://github.com/fffffgggg54/StateSAE
- Dataset minipile: https://huggingface.co/datasets/JeanKaddour/minipile
- Paper de referencia sobre SAE (OpenAI, "Scaling and evaluating sparse autoencoders"): no disponible enlace directo en la información proporcionada.

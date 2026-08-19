# Impliedhomeland/cosine-1B-60B-datamatched-resume

## Resumen

Este repositorio contiene un snapshot de un estado de entrenamiento intermedio, no un modelo final listo para inferencia. Se trata de un checkpoint de un estudio de investigación sobre *datamatching* durante el pretraining: concretamente, el punto final (60B tokens, step 30518) de un run de 1B parámetros entrenado exclusivamente con el dataset C4, que sirve como rama de referencia (W=0) para experimentos que introducen datos de código en distintos momentos del entrenamiento. El autor, Impliedhomeland (Anupam Nayak), publica aquí únicamente los pesos del checkpoint final y los resultados de un barrido de fine-tuning supervisado (SFT) sobre código, junto con la documentación necesaria para restaurar el estado completo del experimento.

La relevancia de este artefacto es metodológica: permite reproducir y auditar un estudio sobre cuándo mezclar dominios de datos durante el pretraining, un problema abierto en la investigación de LLMs. No está pensado para uso en producción ni para tareas de generación de texto general, sino como material de referencia para investigadores que trabajen con el pipeline de entrenamiento descrito en la model card. El tamaño del repositorio (194.3 GB) refleja que incluye múltiples checkpoints y artefactos de auditoría, no solo el modelo de 1B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pythia-1B (derivada de GPT-NeoX, según repo hermano) |
| Parametros totales | 1B (aproximadamente, según nombre del run) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en formato PyTorch .pt) |
| Idiomas soportados | no disponible (probablemente ingles, dataset C4, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pythia-1B, una variante de transformer decoder-only basada en GPT-NeoX, aunque la model card no detalla la configuración exacta (número de capas, heads, etc.). El entrenamiento consistió en un pretraining de 60B tokens sobre el dataset C4 (texto en inglés), con un programa de learning rate tipo cosine. El checkpoint aquí publicado corresponde al paso 30518, el final de ese pretraining. Además, se incluye un barrido de SFT sobre un pool de código (denominado "Pycode") con 12 learning rates diferentes, del cual solo se conserva el checkpoint del mejor LR (ep4.pt) y los resultados de validación (result.json) para auditoría.

La innovación técnica relevante no está en la arquitectura del modelo, sino en el diseño experimental: el estudio compara ramas que introducen datos de código en distintos puntos del pretraining (fork points) contra esta rama de referencia que solo ve C4. El repositorio documenta un procedimiento de restauración idempotente para reproducir el estado completo, lo que sugiere un enfoque cuidadoso de reproducibilidad, pero no se describen técnicas novedosas de atención, decodificación o entrenamiento.

## Capacidades

No se documentan capacidades funcionales del modelo como generación de texto, razonamiento, tool calling o soporte multilingüe. Al ser un checkpoint intermedio de investigación, no se ha evaluado ni publicado ningún comportamiento de uso general. Las únicas capacidades implícitas son:

- Continuar el entrenamiento desde este punto (fine-tuning o pretraining adicional).
- Servir como referencia para comparar ramas con mezcla de datos de código.
- Auditar el proceso de entrenamiento mediante los artefactos de validación incluidos.

Cualquier otra capacidad (generación, agentes, etc.) no está disponible ni verificada.

## Casos de uso

Dado que se trata de un artefacto de investigación, los casos de uso son específicos del ámbito científico:

- Reproducción de experimentos de datamatching: investigadores pueden descargar este checkpoint y los repositorios hermanos para replicar el estudio sobre cuándo introducir código en el pretraining, siguiendo el procedimiento de restauración documentado.
- Análisis de la dinámica de entrenamiento: los resultados del barrido de SFT (12 learning rates) permiten estudiar la sensibilidad del fine-tuning a la tasa de aprendizaje en un modelo pequeño.
- Punto de partida para fine-tuning experimental: el checkpoint de 1B puede usarse como base para experimentos de adaptación a dominios específicos, aunque no se garantiza su calidad como modelo general.
- Comparación de ramas de entrenamiento: junto con los checkpoints intermedios del repo hermano (`midtrain-bridge-1B-cosine-backbone`), permite trazar la evolución del modelo y comparar el efecto de la mezcla de datos.
- Validación de pipelines de entrenamiento: el diseño idempotente y la documentación de restauración sirven como referencia para equipos que construyen infraestructura de entrenamiento reproducible.
- Docencia e investigación metodológica: como ejemplo de publicación de artefactos intermedios con trazabilidad completa, útil para cursos de ingeniería de LLMs.

No se recomienda su uso en aplicaciones de producción, atención al cliente, generación de código o cualquier tarea de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El repositorio solo contiene métricas de validación internas del barrido de SFT (val0, ep3, ep4), que no son comparables con benchmarks públicos.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación. A partir del tamaño del modelo (1B parámetros) y del formato de checkpoint, se puede estimar:

- VRAM para inferencia: un checkpoint de 1B en fp32 ocupa aproximadamente 4 GB; en bf16, unos 2 GB. Sin embargo, el repositorio completo pesa 194 GB porque incluye múltiples checkpoints y artefactos, no porque el modelo sea grande.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM podría cargar el modelo en fp32 (por ejemplo, RTX 3060, RTX 4060), aunque no se ha verificado.
- Despliegue: al ser un checkpoint de PyTorch, se necesitaría convertirlo a formatos como safetensors o GGUF para usar con vLLM, llama.cpp u Ollama. No se proporcionan dichas conversiones.
- Latencia y throughput: no disponibles.

Para el entrenamiento original se usaron 8xH100 80GB (según la model card), pero eso corresponde al pretraining completo, no a la inferencia.

## Comparativa con modelos similares

No hay modelos comparables directos en la información disponible. El checkpoint es un artefacto de investigación sin evaluación pública, por lo que no se puede comparar con modelos como Pythia-1B original, GPT-2 o TinyLlama en términos de rendimiento. La única referencia cercana es el propio repositorio hermano `midtrain-bridge-1B-cosine-backbone`, que contiene los checkpoints intermedios del mismo run, pero no es un modelo alternativo sino parte del mismo estudio.

## Limitaciones y advertencias

- No es un modelo final: se trata de un checkpoint intermedio de pretraining, no optimizado para tareas de usuario ni para generación de texto de calidad.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o incluso académico sin consultar al autor.
- Sin evaluación de seguridad: no se han realizado análisis de sesgos, alucinaciones o toxicidad. El dataset C4 puede contener contenido problemático.
- Formato de pesos propietario: los pesos están en formato `.pt` de PyTorch, no en safetensors ni GGUF, lo que dificulta su uso con herramientas estándar de inferencia.
- Dependencia de repositorios externos: para un uso completo (continuar entrenamiento, reproducir experimentos) se necesitan otros repositorios del mismo autor (`midtrain-bridge-1B-cosine-backbone`, `midtrain-bridge-data`), que pueden no estar disponibles o cambiar.
- Tamaño del repositorio: 194.3 GB, lo que implica costes de descarga y almacenamiento considerables para un artefacto de investigación.
- Sin garantías de reproducibilidad: aunque la model card describe un procedimiento de restauración, no se ha verificado de forma independiente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Impliedhomeland/cosine-1B-60B-datamatched-resume
- Repositorio hermano (backbone con checkpoints intermedios): https://huggingface.co/Impliedhomeland/midtrain-bridge-1B-cosine-backbone
- Perfil del autor: https://huggingface.co/Impliedhomeland
- Repositorio relacionado (backbone WSD): https://huggingface.co/Impliedhomeland/midtrain-bridge-1B-wsd-backbone

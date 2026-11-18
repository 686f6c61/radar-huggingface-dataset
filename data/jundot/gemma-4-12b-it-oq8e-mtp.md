# Jundot/gemma-4-12B-it-oQ8e-mtp

## Resumen

`Jundot/gemma-4-12B-it-oQ8e-mtp` es un checkpoint cuantizado en formato MLX del modelo multimodal `google/gemma-4-12B-it`, desarrollado por Google DeepMind. Se trata de una cuantizacion de precision mixta realizada con la herramienta oQ (oMLX v0.7.1), que aplica la variante mejorada oQe para asignar bits segun la sensibilidad medida de cada capa, con un promedio efectivo de 8,778 bits por peso. El resultado ocupa 13,6 GB en disco, lo que lo hace viable en equipos Apple Silicon con memoria unificada, en lugar de los aproximadamente 24 GB que requeriria el modelo en BF16.

El modelo base pertenece a la familia Gemma 4 y es de tipo "unified" o any-to-any: no dispone de encoders separados para cada modalidad, sino que proyecta parches de imagen y formas de onda de audio directamente al espacio de embeddings mediante capas lineales ligeras, y procesa todo con un unico transformer decoder-only con ventana de contexto de 256K tokens. Cuenta con 11,95B parametros en el backbone y 12,38B en total al incluir la cabeza de prediccion multi-token (MTP) fusionada desde `google/gemma-4-12B-it-assistant`, que permite decodificacion especulativa.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar localmente un modelo multimodal de 12B con contexto muy largo en hardware de consumo Apple, manteniendo la licencia Apache-2.0 del modelo original. Es una opcion orientada a desarrolladores que trabajan con MLX en macOS y necesitan inferencia local sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only unificado (any-to-any) con proyecciones lineales para vision y audio; cabeza MTP |
| Parametros totales | 12.382.587.188 (12,38B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ8e de precision mixta: affine 8-bit grupo 64 (96,295% de los pesos) y BF16 (3,705%); media efectiva 8,778 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a la Gemma 4 license de Google) |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only unificado de la familia Gemma 4. A diferencia de las arquitecturas multimodales clasicas con encoders dedicados, aqui los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras (0,015B para vision y 0,002B para audio), y todas las modalidades se procesan en un unico decodificador con contexto de 256K tokens. El backbone de lenguaje concentra 11,943B parametros.

Sobre esta base, el autor ha aplicado cuantizacion de precision mixta oQ8e: se asignan bits por sensibilidad de capa medida, se redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y se reajustan escala y sesgo mediante minimos cuadrados ponderados. Ademas, se ha fusionado una cabeza de prediccion multi-token (MTP) de 0,423B parametros procedente de `google/gemma-4-12B-it-assistant`, lo que habilita decodificacion especulativa para acelerar la generacion. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre procesos de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en un unico decodificador con contexto de hasta 256K tokens.
- Procesamiento de imagen: los parches visuales se proyectan al espacio de embeddings y se procesan junto al texto (pipeline any-to-any).
- Procesamiento de audio: las formas de onda se proyectan mediante una capa lineal ligera y se integran en el mismo decodificador.
- Decodificacion especulativa mediante la cabeza MTP fusionada, orientada a reducir latencia en generacion autoregresiva.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: al ser un checkpoint MLX de 13,6 GB, permite ejecutar un modelo multimodal de 12B en equipos con memoria unificada de 16 GB o mas, sin GPU dedicada ni servicios en la nube.
- Analisis de documentos largos con imagen: la ventana de 256K tokens permite procesar informes extensos que combinen texto y figuras, manteniendo el contexto completo en una sola pasada.
- Transcripcion y comprension de audio integrada: la proyeccion de audio en el mismo decodificador permite tareas de resumen o extraccion de informacion sobre grabaciones sin pipeline separado de ASR.
- Prototipado de aplicaciones any-to-any: util para validar productos que reciben imagen, audio y texto en un unico endpoint antes de migrar a infraestructura con GPU.
- Generacion asistida con baja latencia: la cabeza MTP permite decodificacion especulativa, adecuada para asistentes interactivos donde importa el tiempo por token en hardware de consumo.
- Desarrollo y evaluacion offline: investigacion y pruebas de prompts con datos sensibles que no pueden salir del equipo local, gracias a la ejecucion completamente on-device.
- Fine-tuning o adaptacion posterior: el checkpoint cuantizado sirve como referencia para comparar el impacto de la cuantizacion frente al modelo BF16 original en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,6 GB de almacenamiento de pesos; se recomienda al menos 16 GB de memoria unificada para inferencia con margen para cache KV, y 24 GB o mas para contextos largos.
- GPU recomendadas: no disponible en la informacion proporcionada; el formato MLX esta orientado a Apple Silicon (series M1, M2, M3, M4 y superiores).
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no es compatible de forma nativa con CUDA.
- Opciones de despliegue: MLX (libreria nativa del checkpoint) y oMLX; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; la cabeza MTP esta disenada para mejorar la velocidad de decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ8e-mtp | 12,38B | 256K | safetensors MLX, 8-bit mixto | Apache-2.0 | Incluye cabeza MTP; orientado a Apple Silicon |
| google/gemma-4-12B-it | 11,95B | 256K | safetensors BF16 | Apache-2.0 (Gemma 4 license) | Modelo base sin cuantizar; mayor huella de memoria |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | no disponible | no disponible | Modelo asistente del que se extrae la cabeza MTP |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 8,778 bits/peso promedio puede introducir degradacion en tareas sensibles a precision numerica; no se aportan evaluaciones que cuantifiquen esa perdida.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada; al heredar el comportamiento de Gemma 4, pueden aparecer sesgos propios de los datos de entrenamiento originales.
- Riesgo de alucinacion inherente a los modelos generativos; la cuantizacion puede agravarlo en dominios especializados.
- Idiomas soportados no documentados en esta ficha; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- Restricciones de licencia: aunque el tag indica Apache-2.0, la model card remite a la Gemma 4 license de Google, que puede imponer terminos adicionales de uso comercial; es necesario revisarla.
- Compatibilidad limitada: el formato MLX solo funciona en el ecosistema Apple; no es directamente desplegable en CUDA ni en servidores x86 convencionales.
- Soporte de tool calling, agentes y modo thinking no documentado; no asumir estas capacidades sin pruebas.
- El repositorio no incluye informacion sobre la composicion del dataset ni sobre alineacion (RLHF/DPO) del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/gemma-4-12B-it-oQ8e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantizacion oQe mejorada: https://github.com/jundot/omlx/pull/4385
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license

# mradermacher/Keural-Nova-v1.1-GGUF

## Resumen

Keural-Nova-v1.1 es un modelo de lenguaje orientado al coreano y al inglés, desarrollado por el usuario hossain0909 y publicado en HuggingFace. Se trata de un modelo de tipo MoE (mixture of experts) con afinado mediante LoRA e instruction tuning, construido sobre una base previa del mismo autor. El repositorio aquí descrito no es el modelo original, sino la colección de cuantizaciones estáticas en formato GGUF realizadas por mradermacher, un cuantizador muy conocido en la comunidad que publica versiones comprimidas para su uso en llama.cpp, Ollama y herramientas compatibles.

El valor de esta ficha para el desarrollador es doble: por un lado, el modelo base pesa 35,5 mil millones de parámetros (dato real de safetensors), lo que lo sitúa en la gama de modelos grandes; por otro, las cuantizaciones GGUF permiten ejecutarlo desde 13,3 GB (Q2_K) hasta 37,9 GB (Q8_0), abriendo la puerta a hardware de consumo de gama alta. Incluye además un suplemento multimodal (mmproj), lo que sugiere capacidades de visión. Su relevancia radica en la escasez de modelos abiertos optimizados para coreano con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer, con adaptadores LoRA |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (esta cuantización); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base, hossain0909/Keural-Nova-v1.1, emplea una arquitectura MoE según las etiquetas del repositorio, con un total de aproximadamente 35,5 mil millones de parámetros. El número de expertos y de parámetros activos por token no está documentado en la información disponible. Sobre la base se han aplicado adaptadores LoRA con instruction tuning, lo que indica un proceso de afinado eficiente en parámetros en lugar de un entrenamiento completo. Los tags incluyen "keural", presumiblemente el nombre de la familia o proyecto del autor.

No hay información publicada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. Tampoco se detalla el modelo base original del que deriva la arquitectura MoE. La presencia de archivos mmproj (multi-modal projectors) en formato Q8_0 y f16 indica que el modelo incorpora un componente de visión compatible con llama.cpp, habitual en modelos derivados de arquitecturas multimodales.

## Capacidades

- Generación de texto conversacional en coreano e inglés (tag "conversational" e instruction tuning).
- Seguimiento de instrucciones gracias al instruction tuning con LoRA.
- Capacidad multimodal potencial: los archivos mmproj sugieren comprensión de imágenes cuando se usa con llama.cpp, aunque el modelo base no lo documenta explícitamente.
- Ejecución local eficiente gracias a la amplia gama de cuantizaciones GGUF.
- No hay información disponible sobre tool calling, function calling, capacidades de agente ni modo de razonamiento extendido.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está etiquetado específicamente para coreano, útil para chatbots y atención al cliente en ese idioma donde los modelos generalistas suelen rendir peor.
- Asistentes bilingües coreano-inglés: soporta ambos idiomas oficialmente, adecuado para equipos o servicios que operan en los dos mercados.
- Inferencia local en estaciones de trabajo: con la variante Q4_K_M (21,8 GB) cabe en una GPU de 24 GB como la RTX 4090, permitiendo despliegues sin coste de API.
- Procesamiento multimodal local: mediante los archivos mmproj, se puede experimentar con comprensión de imágenes en llama.cpp sin depender de servicios externos.
- Investigación sobre MoE afinados con LoRA: al ser open source con licencia Apache 2.0, sirve como base para estudios de adapatación eficiente de modelos grandes.
- Prototipado con Ollama o LM Studio: los GGUF estándar permiten cargar el modelo en minutos para pruebas de producto.
- Desarrollo de aplicaciones con restricciones de privacidad: al ejecutarse localmente, los datos no salen de la infraestructura del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~13,3 GB; Q3_K_M: ~17,3 GB; Q4_K_M: ~21,8 GB; Q5_K_M: ~25,4 GB; Q6_K: ~29,3 GB; Q8_0: ~37,9 GB.
- GPU recomendadas:
  - RTX 4090 / RTX 3090 (24 GB): Q4_K_S o Q4_K_M, variantes recomendadas por el cuantizador.
  - RTX 5090 (32 GB) o A6000 (48 GB): hasta Q6_K con margen para contexto.
  - A100 40/80 GB o H100: Q8_0 y contextos largos sin problema.
- Consumer GPU: sí, cabe en una RTX 3090/4090 de 24 GB con Q4_K_M (21,8 GB), dejando poco margen para el KV cache; con CPU + GPU parcial (offloading de llama.cpp) es viable en equipos con 32-64 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no aplican directamente a GGUF (requerirían el modelo base en safetensors).
- Latencia y throughput: no disponible; al ser MoE, los parámetros activos por token (desconocidos) determinarán la velocidad real.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Formato |
|---|---|---|---|---|
| Keural-Nova-v1.1 | ~35,5 B | MoE + LoRA | apache-2.0 | GGUF (cuants de mradermacher) |
| Qwen3-30B-A3B | 30,5 B (3,3 B activos) | MoE | apache-2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7 B (12,9 B activos) | MoE | apache-2.0 | safetensors, GGUF |
| Llama 3.3 70B | 70 B | densa | licencia Llama 3.3 | safetensors, GGUF |

Keural-Nova se diferencia por su enfoque específico en coreano, un nicho donde Qwen3 ofrece soporte multilingüe pero Mixtral y Llama son más débiles. Sin benchmarks publicados, no es posible comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- No hay model card detallada del modelo base: se desconocen datos de entrenamiento, parámetros activos, longitud de contexto y procedencia de los datos, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinación no cuantificado: al no existir benchmarks públicos, no se puede estimar la fiabilidad factual del modelo.
- Soporte de idiomas limitado a coreano e inglés; el rendimiento en español no está documentado y probablemente sea inferior.
- La capacidad multimodal depende de los archivos mmproj y de soporte en el runtime; no está documentada oficialmente en el modelo base.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero al tratarse de un modelo con LoRA sobre una base no documentada, conviene verificar la cadena de licencias del modelo original.
- Es una cuantización de terceros (mradermacher): cualquier problema de calidad del modelo subyacente es responsabilidad del autor original, no del cuantizador.
- Proyecto aparentemente individual, sin respaldo corporativo documentado ni historial de mantenimiento verificable.

## Enlaces

- Repositorio GGUF (cuantizaciones): https://huggingface.co/mradermacher/Keural-Nova-v1.1-GGUF
- Modelo base: https://huggingface.co/hossain0909/Keural-Nova-v1.1
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Keural-Nova-v1.1-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Keural-Nova-v1.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

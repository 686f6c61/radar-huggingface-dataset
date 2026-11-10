# omegamentiszug/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de la familia Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El modelo original concentra su señal de entrenamiento supervisado en matematicas y resolución de problemas STEM, manteniendo la eficiencia y desplegabilidad practica de la clase de 9B parametros. La variante heretic aplica una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre el modelo base para eliminar comportamientos de rechazo, reduciendo las negativas de 100/100 a 3/100 en la evaluacion del autor, con una divergencia KL de 0,0422 respecto al original.

El modelo cuenta con 9.409.813.744 parametros totales (segun safetensors), se distribuye en formato safetensors bajo licencia Apache 2.0 y soporta seis idiomas: ingles, chino, coreano, japones, espanol y ruso. Esta etiquetado como image-text-to-text y text-generation, lo que sugiere capacidad multimodal, aunque la model card no detalla la arquitectura de vision. Su relevancia actual radica en combinar un razonamiento matemático y STEM reforzado por destilación con un proceso de "abliteration" que elimina las capas de rechazo, un enfoque cada vez mas demandado por desarrolladores que necesitan modelos sin filtros para investigación, generación creativa o tareas de red teaming.

La ficha cubre tanto el modelo base como la variante heretic, ya que la informacion disponible se centra en el proceso de decensurado y en las capacidades heredadas del fine-tune original. Se debe tener en cuenta que el modelo fue creado en noviembre de 2026 y cuenta con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), fine-tune con destilación; multimodal image-text-to-text segun tags |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; se mencionan rutas de despliegue NVFP4 y MTP-Q8_0 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B orientado a razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El entrenamiento supervisado se concentra en aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico (STEM). La model card menciona tecnicas de SFT y RL (con la etiqueta gspo, probablemente Group Sequence Policy Optimization) en el pipeline de entrenamiento, aunque no se detalla la composicion exacta del dataset ni el numero total de tokens procesados. Se reporta una transferencia cruzada limitada: pequenas mejoras en programacion y uso de herramientas a pesar de no recibir datos SFT especificos de codigo.

La variante heretic se genera mediante Heretic v2.0.0.dev0, aplicando una Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24 del modelo. Los parametros de la ablación son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Este proceso elimina direcciones de activacion asociadas a comportamientos de rechazo, con un coste de divergencia KL de 0,0422 respecto al modelo original. La model card menciona evaluacion mediante vLLM con NVFP4 y llama.cpp con MTP-Q8_0, lo que sugiere soporte para decodificacion especulativa multi-token (MTP) en el ecosistema de despliegue.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en descomposicion estructurada de problemas.
- Razonamiento matematico y STEM reforzado mediante destilación de DeepSeek-V4-Pro (aproximadamente 250.000 muestras).
- Generacion de codigo y uso de herramientas (tool calling / function calling), con mejoras reportadas por transferencia cruzada aunque sin SFT especifico de codigo.
- Capacidad multimodal image-text-to-text segun los tags del repositorio, aunque la model card no detalla la arquitectura de vision ni los tipos de imagen soportados.
- Soporte multilingue en seis idiomas: ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento "decensored": eliminacion de rechazos mediante ablación ARA, con 3/100 negativas frente a 100/100 del original.
- Compatibilidad con endpoints (tag endpoints_compatible) y con text-generation-inference.
- Capacidades de agente y razonamiento multi-paso inferidas del enfasis en descomposicion de problemas y tool use, aunque no se documentan explicitamente en la model card.

## Casos de uso

- Investigacion en seguridad de IA y red teaming: la variante heretic permite estudiar el comportamiento de un modelo sin capas de rechazo, comparando respuestas con el original (KL 0,0422) para analizar que direcciones de activacion codifican la negativa y como afecta la ablación a la utilidad general.
- Tutoria y resolucion de problemas matematicos y STEM: el entrenamiento con aproximadamente 250.000 muestras de matematicas y ciencia lo hace adecuado para asistentes educativos que necesitan descomponer problemas paso a paso, explicar derivaciones y verificar resultados intermedios.
- Generacion de codigo en pipelines de desarrollo: aunque no recibio SFT especifico de codigo, la transferencia cruzada reportada y el soporte de tool calling permiten integrarlo en asistentes de IDE o revision de parches, con la cautela de validar la calidad en el dominio concreto.
- Agentes automatizados con function calling: el modelo puede integrarse en flujos de agentes que requieren invocar APIs, consultar bases de datos o encadenar herramientas, aprovechando las capacidades de razonamiento multi-paso y el soporte de tool use.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que requiera explorar temas sensibles sin las negativas tipicas de modelos alineados, gracias al proceso de decensurado.
- Asistencia multilingue en atencion al cliente: con soporte para espanol, ingles, chino, coreano, japones y ruso, puede gestionar conversaciones en estos idiomas, aunque la longitud de contexto no esta documentada y debe validarse antes de desplegarlo en produccion.
- Destilación y experimentacion academica: sirve como modelo estudiante de 9B para comparar con el profesor DeepSeek-V4-Pro, analizando que capacidades de razonamiento se transfieren y cuales se pierden en la compresion.

## Benchmarks y rendimiento

La model card solo reporta metricas del proceso de decensurado, no benchmarks estandar de razonamiento o codigo:

| Metrica | Este modelo (heretic) | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Negativas (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): aproximadamente 18,8 GB solo para pesos (9,41B parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contexto largo.
- Cuantizacion a 8 bits: aproximadamente 9,4 GB de pesos, desplegable en GPUs de 16-24 GB (RTX 4080/4090, A10G, L4).
- Cuantizacion a 4 bits (si esta disponible, no confirmado en la model card): aproximadamente 4,7 GB de pesos, viable en GPUs consumer de 8-12 GB (RTX 3060 12GB, RTX 4070).
- GPUs recomendadas para produccion: A100 40/80 GB, H100, L40S; para desarrollo: RTX 4090 (24 GB) en BF16 con contexto moderado.
- Opciones de despliegue documentadas: vLLM con NVFP4 y llama.cpp con MTP-Q8_0; tambien compatible con text-generation-inference y transformers. Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la model card; deben medirse empiricamente segun hardware y cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,41B | no disponible | Apache 2.0 | Razonamiento STEM destilado, decensurado | Hugging Face (0 descargas) |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (original) | 9,41B | no disponible | Apache 2.0 | Razonamiento STEM destilado, alineado | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | no disponible (4B segun nombre) | no disponible | no disponible | Variante decensurada de 4B | Hugging Face |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Modelo base generalista | Hugging Face |

La comparativa se limita a la familia DeepSeek-V4-Pro-Qwen3.5 y al base Qwen3.5-9B, ya que no se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de otros fabricantes. No se dispone de informacion sobre contexto, rendimiento o licencia de las alternativas mas alla de lo indicado.

## Limitaciones y advertencias

- El proceso de decensurado elimina las capas de rechazo, lo que implica que el modelo puede generar contenido sensible, ofensivo o peligroso sin filtros; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- La divergencia KL de 0,0422 indica un cambio medible respecto al modelo original; pueden existir degradaciones sutiles en calidad o coherencia no capturadas por la metrica de negativas.
- No se han publicado benchmarks estandar de razonamiento, matematicas o codigo, por lo que el rendimiento real en tareas downstream no esta validado de forma independiente.
- La longitud de contexto no esta documentada; no se debe asumir una ventana larga sin verificacion empirica.
- El modelo tiene cero descargas y cero likes, sin validacion de la comunidad; es un artefacto reciente sin evidencia de uso en produccion.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la ausencia de clausulas de uso responsable y la naturaleza decensurada trasladan al desplegador la responsabilidad legal y etica del contenido generado.
- El soporte multimodal (image-text-to-text) esta etiquetado pero no documentado; no se debe asumir que la entrada de imagenes funcione correctamente sin pruebas.
- Riesgo de alucinacion inherente a los modelos de 9B destilados, especialmente en dominios fuera de matematicas y STEM, donde la transferencia cruzada es limitada.
- El sesgo linguistico puede estar concentrado en ingles y chino, idiomas predominantes en el entrenamiento; el rendimiento en espanol, coreano, japones y ruso no esta cuantificado.

## Enlaces

- Hugging Face (modelo heretic): https://huggingface.co/omegamentiszug/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variante 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Proyecto Heretic: https://heretic-project.org

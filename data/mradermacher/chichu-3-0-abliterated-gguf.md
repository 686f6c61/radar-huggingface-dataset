# mradermacher/Chichu-3-0-Abliterated-GGUF

## Resumen

Chichu-3-0-Abliterated-GGUF es una colección de cuantizaciones en formato GGUF del modelo base Sebastianpro88/Chichu-3-0-Abliterated, publicada por mradermacher, un conocido mantenedor de cuantizaciones para la comunidad de llama.cpp. El modelo original es un transformer de 3.212.749.888 parámetros (aproximadamente 3,2 mil millones) orientado a conversación y etiquetado para el idioma inglés. La versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama y otros motores compatibles.

El interés de esta ficha radica en que se trata de una cuantización estática de un modelo pequeño, con 12 variantes de cuantización que van desde 1,5 GB (Q2_K) hasta 6,5 GB (f16), lo que lo hace accesible en GPUs de gama media y en CPU. Sin embargo, la información pública disponible es muy limitada: no se especifican detalles de arquitectura, contexto, datos de entrenamiento, licencia ni benchmarks. El nombre "Abliterated" sugiere que el modelo base ha sido sometido a un proceso de eliminación de alineamiento y rechazos (abliteration), una técnica que modifica los pesos para eliminar las capas de rechazo, lo que tiene implicaciones éticas y de seguridad que se detallan en la sección de limitaciones.

La relevancia actual es moderada: se trata de un modelo de nicho, sin descargas ni likes en el momento de la consulta, y sin documentación técnica sustancial. Es útil para quienes quieran experimentar con modelos pequeños sin censura en local, pero no es adecuado para producción sin una evaluación previa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (deducido del formato transformers; detalles no disponibles) |
| Parametros totales | 3.212.749.888 (3,2 B) |
| Parametros activos | no disponible (no es MoE según el recuento de parámetros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Sebastianpro88/Chichu-3-0-Abliterated más allá de que es un transformer decoder-only compatible con la librería transformers. El recuento de 3,2 mil millones de parámetros sugiere un modelo denso de tamaño pequeño, probablemente derivado de una familia conocida (posiblemente Llama, Qwen o similar), pero no se confirma en la documentación disponible. El sufijo "Abliterated" indica que el modelo ha sido modificado mediante abliteration, una técnica que identifica y elimina la dirección de activación asociada a los rechazos en el espacio latente, reduciendo la tendencia del modelo a negarse a responder ciertas peticiones.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas. La cuantización GGUF la realiza mradermacher con su pipeline habitual (convert_type: hf, quantize_version: 2), que genera cuantizaciones estáticas sin imatrix; el autor indica que las cuantizaciones ponderadas con imatrix no están disponibles por el momento.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño del modelo (3,2 B).
- Generación de código y matemáticas a nivel básico, sin datos específicos de rendimiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- El proceso de abliteration reduce los rechazos ante peticiones que el modelo original declinaría, lo que afecta al comportamiento conversacional.

## Casos de uso

- Experimentación local con modelos pequeños sin censura: el modelo puede ejecutarse en un portátil con 8-16 GB de RAM usando la cuantización Q4_K_M (2,1 GB) mediante llama.cpp u Ollama, lo que permite probar el efecto de la abliteration en un entorno controlado.
- Generación de texto creativo sin restricciones: para escritura de ficción, guiones o contenido que requiera evitar los rechazos típicos de modelos alineados, con la advertencia de que el contenido generado debe revisarse.
- Prototipado rápido de chatbots conversacionales en inglés: al ser un modelo de 3,2 B, la latencia es baja en GPU de consumo, lo que permite iterar sobre prompts y flujos conversacionales antes de escalar a modelos mayores.
- Evaluación de técnicas de abliteration: investigadores interesados en medir cómo cambia el comportamiento de un modelo tras eliminar la dirección de rechazo pueden usar este modelo como caso de estudio comparándolo con el base original.
- Despliegue en entornos con recursos muy limitados: la cuantización Q2_K (1,5 GB) permite ejecutar el modelo en dispositivos con poca memoria, como Raspberry Pi 5 con 8 GB o mini-PCs, para tareas de generación de texto simple.
- Filtrado y clasificación de texto en inglés: aunque no está entrenado específicamente para ello, un modelo conversacional de 3,2 B puede usarse para tareas de etiquetado zero-shot en pipelines de procesamiento de lenguaje natural, con validación previa.
- Educación y demostraciones: para mostrar en un aula o taller cómo funcionan las cuantizaciones GGUF y el impacto del tamaño en la calidad, usando la tabla de cuantizaciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB (Q2_K) y 3,5 GB (Q8_0) para los pesos; el f16 requiere 6,5 GB. Hay que añadir memoria para el contexto KV, que depende de la longitud de contexto no documentada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (RTX 3050, GTX 1650, RTX 4060). Para Q8_0 se recomienda 6 GB o más (RTX 3060, RTX 4060 Ti). Para f16, 8 GB o más (RTX 3070, RTX 4070).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4-8 GB de VRAM. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y cualquier motor compatible con GGUF. El modelo base es compatible con transformers, pero la versión GGUF está pensada para llama.cpp.
- Latencia y throughput estimados: no disponibles. Para un modelo de 3,2 B en Q4_K_M en una RTX 4060 se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chichu-3-0-Abliterated-GGUF | 3,2 B | no disponible | no disponible | GGUF | Abliterated, solo inglés, sin benchmarks |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alineado, multilingüe, benchmarks publicados |
| Qwen2.5 3B Instruct | 3,1 B | 32 K | Apache 2.0 | safetensors, GGUF | Alineado, multilingüe, buenos benchmarks |
| Phi-3.5-mini | 3,8 B | 128 K | MIT | safetensors, GGUF | Alineado, buen razonamiento, benchmarks publicados |

La comparativa se basa en características públicas de modelos de tamaño similar; no hay datos de rendimiento de Chichu-3-0-Abliterated para comparar directamente. La principal diferencia es la ausencia de alineamiento y la falta de documentación y licencia clara, frente a alternativas con licencias permisivas y benchmarks verificables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un modelo abliterated y entrenado presumiblemente con datos web en inglés, es probable que reproduzca sesgos de género, raza y cultura presentes en esos datos.
- Riesgo de alucinación: alto en un modelo de 3,2 B sin benchmarks publicados; no se recomienda su uso en tareas que requieran precisión factual sin verificación humana.
- Limitaciones de contexto e idioma: solo inglés según la etiqueta; la longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial. No se debe usar en producción sin aclarar este punto con el autor del modelo base.
- El proceso de abliteration elimina los rechazos de seguridad, lo que puede generar contenido ofensivo, ilegal o dañino. No es adecuado para aplicaciones dirigidas al público general sin filtros adicionales.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- El autor de la cuantización indica que no hay cuantizaciones imatrix, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- La fecha de creación (2026-11-12) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos o una fecha programada; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/Chichu-3-0-Abliterated-GGUF
- Modelo base: https://huggingface.co/Sebastianpro88/Chichu-3-0-Abliterated
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Chichu-3-0-Abliterated-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de la cuantización: https://www.nethype.de/

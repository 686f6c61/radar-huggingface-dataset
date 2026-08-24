# mradermacher/Dark-Scarlett-v1.0-31B-GGUF

## Resumen

Dark-Scarlett-v1.0-31B-GGUF es una cuantización en formato GGUF del modelo base ReadyArt/Dark-Scarlett-v1.0-31B, realizada por mradermacher. El modelo original, desarrollado por ReadyArt, está orientado al roleplay y la conversación, con un enfoque en contenido adulto y sin alineación (unaligned). Según las etiquetas, se basa en la arquitectura Gemma-4, aunque no se proporcionan detalles técnicos adicionales. Con aproximadamente 30,7 mil millones de parámetros, este modelo está diseñado para generar texto narrativo y mantener diálogos interactivos, especialmente en contextos de ficción y erotismo.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de gran tamaño en hardware de consumo mediante la compresión GGUF, facilitando su uso local con herramientas como llama.cpp u Ollama. La licencia Apache-2.0 permite uso comercial y modificación, lo que lo hace atractivo para desarrolladores que buscan un modelo de roleplay sin restricciones de alineación. Sin embargo, la información pública sobre su entrenamiento, arquitectura interna y rendimiento es escasa, por lo que esta ficha se basa únicamente en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como gemma-4, sin confirmar) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base (numero de capas, dimensiones, tipo de atencion, etc.). Las etiquetas indican que se basa en Gemma-4, pero no se confirma oficialmente. Tampoco se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas como RLHF o DPO. La unica informacion relevante es que el modelo esta disenado para roleplay y conversacion, con un enfoque en contenido adulto y sin alineacion, lo que sugiere un entrenamiento especifico para estos usos, pero sin datos verificables.

## Capacidades

- Generacion de texto narrativo y conversacional, especialmente orientado a roleplay y ficcion interactiva.
- Soporte de instrucciones (instruct) para guiar el comportamiento del modelo.
- Contenido adulto y explicito (NSFW, erp), sin restricciones de alineacion.
- Capacidad multimodal potencial, ya que se incluyen archivos mmproj (proyeccion multimodal) en la cuantizacion, aunque no se especifican las modalidades soportadas.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso ni otras capacidades tecnicas avanzadas.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones de ficcion con multiples turnos, adaptandose a personajes y tramas definidas por el usuario. Su falta de alineacion permite explorar temas adultos sin filtros.
- Generacion de historias eroticas: adecuado para crear relatos explicitos bajo demanda, con control del usuario sobre el tono y la direccion de la narrativa.
- Chatbots de entretenimiento para adultos: puede integrarse en aplicaciones de chat con tematica madura, ofreciendo respuestas contextuales y prolongadas.
- Creacion de personajes virtuales: util para desarrollar asistentes conversacionales con personalidades definidas, especialmente en entornos de ficcion o juegos de rol.
- Prototipado de aplicaciones de roleplay: los desarrolladores pueden usar la version GGUF para probar rapidamente el comportamiento del modelo en local antes de escalar a versiones completas.
- Experimentacion con modelos no alineados: investigadores interesados en el comportamiento de modelos sin restricciones eticas pueden utilizarlo como caso de estudio, aunque con las debidas precauciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se conocen comparaciones con modelos similares en terminos de rendimiento.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion. Para Q4_K_M (18,8 GB) se necesitan al menos 20 GB de VRAM; para Q8_0 (32,7 GB) se requieren 36 GB o mas. Las cuantizaciones mas bajas (Q2_K, 12 GB) pueden caber en GPUs de 16 GB, pero con perdida de calidad.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M o inferior; A100 o H100 (40-80 GB) para Q8_0 o para ejecutar el modelo completo en precision original.
- En consumer GPU: si, con cuantizaciones Q4 o inferiores en GPUs de 24 GB (RTX 3090/4090). Para Q8_0 se requiere hardware profesional o multiples GPUs.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, vLLM (con adaptacion para GGUF), entre otros.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantizacion; un modelo de 31B en Q4 puede generar entre 10 y 30 tokens por segundo en una RTX 4090, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa directa. Existen otras versiones de la serie Dark Scarlett (v1.5, v2.0) y otros modelos de roleplay como Mistral 7B o Llama 3 8B, pero no se conocen datos de rendimiento ni caracteristicas tecnicas de estos para contrastar. Se recomienda consultar la coleccion de ReadyArt en HuggingFace para obtener mas contexto.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo esta disenado para generar material adulto, lo que puede resultar inapropiado en entornos profesionales o para menores de edad.
- Modelo no alineado: al carecer de alineacion, puede producir respuestas ofensivas, sesgadas o peligrosas si se usa sin supervision.
- Idioma limitado: solo soporta ingles, lo que restringe su uso en otros idiomas.
- Informacion tecnica insuficiente: no se conocen detalles sobre sesgos, alucinaciones o limitaciones de contexto, por lo que se recomienda evaluar el modelo en cada caso de uso.
- Licencia Apache-2.0: permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones legales sobre material adulto en algunas jurisdicciones.
- Riesgo de sobreajuste a tematicas eroticas: el modelo puede desviarse hacia contenido sexual incluso en contextos no eroticos, debido a su entrenamiento especifico.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-31B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-31B
- Coleccion Dark Scarlett de ReadyArt: https://huggingface.co/collections/ReadyArt/dark-scarlett-series
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Dark-Scarlett-v1.0-31B-i1-GGUF

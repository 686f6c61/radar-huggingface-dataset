# Nimbz/Gemma-4-Orthia-31B-GGUF

## Resumen

Gemma-4-Orthia-31B-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario Nimbz a partir de su propio modelo base Nimbz/Gemma-4-Orthia-31B. No es, por tanto, un modelo entrenado desde cero: se trata de un merge de pesos (etiquetas merge y mergekit) orientado a roleplay, interpretación de personajes, escritura creativa y narrativa, con un sesgo declarado hacia un comportamiento de baja negativa (low-refusal) y contenido para adultos. El recuento real de parámetros del modelo base es de 32.106.631.740 (aproximadamente 32,1 mil millones), lo que sitúa al modelo en la franja de los 31-32 B densos.

El interés de esta publicación es práctico más que científico: ofrece el merge en GGUF, el formato que permite ejecutar el modelo en llama.cpp, Ollama, LM Studio o servidores compatibles con la API de OpenAI sin necesidad de GPUs de datacenter. El repositorio ocupa 144,7 GB, un tamaño coherente con la presencia de varias cuantizaciones del mismo modelo en un único repo (el peso en FP16 de 32,1 B rondaría los 64 GB).

La relevancia es limitada por el momento: la ficha se creó y actualizó el 13 de octubre de 2026, acumula 0 descargas y 0 likes, y la model card del autor no incluye métricas, datos de entrenamiento, longitud de contexto ni composición del dataset. Toda evaluación debe hacerse, por tanto, de forma empírica y bajo responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Gemma segun la nomenclatura del autor; pesos combinados mediante mergekit. Detalle interno (número de capas, cabezas, atención) no disponible |
| Parametros totales | 32.106.631.740 (32,1 B), dato real de safetensors del modelo base |
| Parametros activos | No aplica: no se declara arquitectura MoE; el modelo es denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No detallados en la model card ni en las etiquetas. El repositorio GGUF ocupa 144,7 GB, lo que sugiere varias cuantizaciones distintas del mismo modelo, pero no se confirma qué niveles (Q4_K_M, Q5_K_M, Q8_0, etc.) están presentes |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base Nimbz/Gemma-4-Orthia-31B |

Datos adicionales del repositorio: etiquetas untied-lm_head (matriz de salida no atada a los embeddings de entrada), endpoints_compatible, region:us y not-for-all-audiences. Creado el 13 de octubre de 2026 y actualizado el mismo día.

## Arquitectura y entrenamiento

La información disponible no describe el proceso de construcción con detalle. Lo que se puede afirmar con certeza es que se trata de un merge de pesos: las etiquetas incluyen merge y mergekit, y el propio campo base_model apunta a Nimbz/Gemma-4-Orthia-31B. La etiqueta untied-lm_head indica que el modelo resultante tiene la matriz de proyección de salida separada de la matriz de embeddings de entrada, un detalle relevante porque los merges de pesos entre modelos con y sin ataduras de lm_head suelen requerir tratamiento específico, y porque facilita el ajuste fino posterior y la manipulación independiente de ambas matrices.

El nombre del modelo remite a la familia Gemma, pero no se aporta ninguna confirmación de sobre qué checkpoint concreto se construyó, ni la composición del merge (qué modelos, con qué proporciones y qué método: linear, SLERP, TIES, DARE, passthrough). Tampoco hay información sobre número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias en el modelo base. En consecuencia, cualquier afirmación sobre el proceso de alineación sería especulativa.

No se documentan innovaciones técnicas propias: el repositorio es una conversión a GGUF de un merge comunitario, sin decodificación especulativa, atención lineal ni mecanismos híbridos declarados.

## Capacidades

- Generación de texto conversacional multi-turno, con foco declarado en roleplay e interpretación de personajes.
- Escritura creativa y narrativa: relatos, ficción, descripciones y diálogo literario.
- Storytelling y construcción de tramas para proyectos de ficción o juegos de rol.
- Comportamiento de baja negativa (low-refusal), según las etiquetas del autor, orientado a reducir rechazos en peticiones creativas.
- Generación de contenido para adultos (etiqueta nsfw), no apta para todos los públicos.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que el repositorio puede servirse mediante infraestructura compatible con la API de HuggingFace (Inference Endpoints), sujeto a las restricciones de la etiqueta not-for-all-audiences.
- Soporte de tool calling / function calling: no disponible, no se menciona en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles, no se mencionan.
- Capacidades multilingües: no disponibles, no se declaran idiomas.
- Capacidades de visión o audio: no disponibles, no se mencionan.

## Casos de uso

- Personajes conversacionales persistentes: el modelo está etiquetado explícitamente para character-rp, por lo que encaja en aplicaciones de chat con un personaje fijo, donde se le inyecta una ficha de personaje en el prompt de sistema y se mantiene un historial de conversación. La longitud de contexto utilizable dependerá de la cuantización y de la configuración de llama.cpp, no documentada.
- Escritura de ficción asistida: generación de capítulos, diálogos y descripciones con una voz narrativa consistente, aprovechando el ajuste hacia creative writing y storytelling.
- Prototipado de diálogos para videojuegos: generación de líneas de personaje y variantes de respuesta para NPCs durante fases de diseño, antes de decidir si se sustituyen por guiones escritos o por un modelo propio en producción.
- Herramientas de rol de mesa (asistente para partidas de rol): el modelo puede interpretar PNJ y narrar escenas a demanda del director de juego, con un tono adaptable mediante prompt de sistema.
- Generación de datos sintéticos de diálogo: producción de conversaciones etiquetadas para experimentos de ajuste fino posteriores, con la advertencia de que el contenido low-refusal y nsfw obliga a filtrar la salida antes de usarla como dataset de entrenamiento de un modelo de propósito general.
- Servicio de escritura creativa con moderación propia: despliegue en local (Ollama, LM Studio, llama.cpp) para usuarios que quieren generar contenido sin censura editorial, manteniendo el filtrado y las advertencias legales en la capa de aplicación.
- Evaluación comparativa de merges: uso del modelo como referencia en experimentos sobre técnicas de merge (TIES, DARE, SLERP) midiendo coherencia narrativa a largo plazo, ya que el repositorio aporta el artefacto GGUF listo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K, MT-Bench, EQ-Bench ni evaluaciones específicas de roleplay). El repositorio acumula 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros. No se dispone de datos comparativos con modelos similares.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento real de parámetros (32,1 B) y del tamaño típico por parámetro de cada nivel de cuantización en GGUF. No proceden de mediciones publicadas por el autor, que no documenta requisitos de hardware.

- Peso aproximado de los ficheros: FP16 en torno a 64 GB; Q8_0 en torno a 34 GB; Q6_K en torno a 26 GB; Q5_K_M en torno a 22 GB; Q4_K_M en torno a 19 GB; Q3_K_M en torno a 15 GB; Q2_K en torno a 12 GB. A cada cifra hay que sumar el espacio de la caché KV, proporcional a la longitud de contexto y al número de capas.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar completamente una cuantización Q4_K_M con contexto moderado, y queda ajustada con Q5_K_M. Una RTX 4080 o 4070 Ti de 16 GB obliga a Q3_K_M o a descargar parte de las capas a RAM.
- Configuraciones de doble GPU: dos RTX 3090 o 4090 (48 GB combinados) permiten Q5_K_M y Q6_K con contexto amplio, o Q8_0 con contexto reducido.
- Equipos Apple Silicon: 32 GB de memoria unificada son suficientes para Q4_K_M; 48-64 GB permiten Q6_K y Q8_0.
- GPU de datacenter: A100 40 GB, A100 80 GB y H100 80 GB pueden ejecutar el modelo en FP16 o BF16 (usando el modelo base en safetensors, no el GGUF) si se necesita máxima calidad y throughput agregado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las vías naturales para el formato GGUF; ktransformers o servidores GGUF experimentales existen pero con soporte desigual. Si se opta por el modelo base en safetensors, son aplicables vLLM y TGI, siempre que la arquitectura subyacente esté soportada por esas librerías.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna configuración.

## Comparativa con modelos similares

Los valores de parámetros, contexto y licencia de las alternativas proceden de sus fichas oficiales; no se dispone de comparaciones de rendimiento con este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Gemma-4-Orthia-31B-GGUF (Nimbz) | 32,1 B | No disponible | apache-2.0 declarada por el autor | GGUF en HuggingFace; 0 descargas, sin validación comunitaria |
| Gemma 2 27B (Google) | 27 B | 8192 tokens | Gemma Terms of Use | safetensors y GGUF oficiales, ampliamente desplegado |
| Mistral Small 3 24B (Mistral AI) | 24 B | 32 000 tokens | Apache 2.0 | safetensors y GGUF, soporte nativo en vLLM y llama.cpp |
| Command R 35B (Cohere) | 35 B | 128 000 tokens | CC-BY-NC 4.0, uso comercial restringido | safetensors, orientado a RAG y tool use |

Nota: la comparación es estructural (tamaño, contexto, licencia). No hay datos de benchmarks del modelo de Nimbz que permitan afirmar nada sobre su calidad relativa frente a estas alternativas. Además, si el merge deriva de pesos de la familia Gemma de Google, la licencia apache-2.0 declarada en este repositorio podría no ser coherente con los términos del modelo original, y esa verificación queda pendiente.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas, 0 likes y una ficha creada y actualizada el mismo día. No hay evidencia externa de que el merge funcione como se describe, ni de que no presente degradación por el proceso de fusión de pesos.
- Model card sin contenido técnico: el README del repositorio contiene principalmente CSS y estilos de presentación, sin datos de entrenamiento, contexto, benchmarks ni instrucciones de uso. No se puede verificar ninguna afirmación del autor.
- Contenido para adultos y baja negativa: las etiquetas nsfw y low-refusal implican que el modelo puede generar material sexual explícito o responder a peticiones que otros modelos rechazarían. Requiere filtrado en la capa de aplicación, control de edad y advertencias legales claras si se expone a usuarios.
- Clasificación not-for-all-audiences: el repositorio está marcado como no apto para todos los públicos, lo que puede limitar su disponibilidad en plataformas de despliegue y en determinados proveedores de inferencia.
- Riesgo de alucinación: no hay evaluación publicada. En modelos de 31-32 B sin datos de alineación documentados, la tasa de invención de hechos puede ser alta, especialmente fuera del registro narrativo. No se recomienda su uso para tareas factuales sin verificación.
- Idiomas no declarados: no se especifica qué lenguas soporta ni con qué calidad. La calidad en castellano es, por tanto, desconocida.
- Longitud de contexto desconocida: no se puede planificar el diseño de la ventana de conversación ni el coste de la caché KV. Hay que determinarla experimentalmente con cada cuantización.
- Licencia: se declara apache-2.0, pero al tratarse de un merge comunitario sin trazabilidad de los modelos de origen, la aplicabilidad de esa licencia al uso comercial es dudosa. Si el linaje incluye pesos de la familia Gemma, los Gemma Terms of Use podrían imponer condiciones adicionales (atribución, restricciones de uso). Conviene auditar el linaje antes de un despliegue comercial.
- Ausencia de datos sobre tool calling y agentes: no se declara soporte, por lo que no debe asumirse en pipelines automatizados.
- Naturaleza de merge: las fusiones de pesos pueden producir degradaciones sutiles (repeticiones, pérdida de coherencia a partir de cierto número de turnos, mezcla de estilos) que solo se detectan con pruebas extensas. Sin evaluaciones publicadas, ese riesgo recae íntegramente en quien despliegue el modelo.
- Nombre potencialmente engañoso: la denominación Gemma-4 no corresponde a ningún modelo oficial conocido con ese nombre. Se trata de un nombre elegido por el autor del merge y no debe interpretarse como una versión oficial de la familia Gemma.
- Tamaño del repositorio: 144,7 GB, lo que implica una descarga costosa en disco y ancho de banda, especialmente si solo se necesita una de las cuantizaciones; conviene descargar ficheros individuales en lugar del repositorio completo.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Nimbz/Gemma-4-Orthia-31B-GGUF
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Orthia-31B
- mergekit (herramienta referenciada en las etiquetas): https://github.com/arcee-ai/mergekit
- llama.cpp (runtime para GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com

Nota sobre enlaces: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a un sitio de compraventa de segunda mano sin relación con el contenido). No se han localizado papers, blogs técnicos, demos ni repositorios de terceros asociados a Nimbz/Gemma-4-Orthia-31B o a su versión GGUF.

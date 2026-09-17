# bunnycore/MiniCPM5-2B-Claude-Distill

## Resumen

MiniCPM5-2B-Claude-Distill es un modelo de lenguaje de 2.516.756.480 parametros (unos 2,5B) publicado por el usuario bunnycore en HuggingFace, distribuido unicamente en formato GGUF para llama.cpp. Se trata, segun su model card, de un ajuste del modelo base MiniCPM5-2B sobre el dataset `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`, es decir, una destilacion de trazas de razonamiento generadas por modelos Claude Opus (versiones 4.6/4.7) sobre un conjunto de aproximadamente 8.700 ejemplos. La conversion a GGUF se realizo con las herramientas de Unsloth.

El modelo no ha recibido ninguna adopcion visible: 0 descargas y 0 likes en el momento de la consulta, y el repositorio se creo y actualizo en un margen de 19 minutos (16 de septiembre de 2026, 20:00 a 20:19 UTC). El repositorio ocupa 2,1 GB y contiene un unico archivo cuantizado en Q6_K. No se publican resultados de benchmarks, idiomas soportados, licencia ni longitud de contexto.

Su relevancia practica es limitada y de perfil experimental: sirve como ejemplo de flujo de destilacion de razonamiento (generar trazas con un modelo grande cerrado y entrenar con ellas un modelo pequeno abierto) y como base para pruebas locales de bajo coste. Cualquier uso en produccion exige verificar primero la licencia, el idioma y la calidad real del ajuste, ninguno de los cuales esta documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el tag GGUF declara arquitectura `llama` (formato de serializacion), pero no se especifica la arquitectura del modelo base MiniCPM5-2B |
| Parametros totales | 2.516.756.480 (aproximadamente 2,5B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | unico archivo publicado: `MiniCPM5-2B.Q6_K.gguf` (Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp / llama-cpp) |
| Modelo base | MiniCPM5-2B (segun el nombre del repositorio; sin confirmar en la model card) |
| Dataset de ajuste | `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k` (destilacion de razonamiento de Claude Opus) |
| Tamano del repositorio | 2,1 GB |
| Fecha de publicacion | 16 de septiembre de 2026 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | gguf, llama, llama.cpp, llama-cpp, unsloth, endpoints_compatible, conversational, region:us |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada sobre la arquitectura del modelo base MiniCPM5-2B en la informacion disponible: no se detalla si es un transformer denso convencional, si emplea atencion lineal o alguna variante hibrida, ni cual es su configuracion de cabezas, capas o vocabulario. La unica pista estructural es el tag `llama`, que en el ecosistema GGUF identifica la arquitectura de serializacion que espera llama.cpp, no necesariamente la arquitectura real del modelo original.

Respecto al entrenamiento, la model card solo declara el dataset de ajuste: `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k`. Por el nombre se deduce que contiene aproximadamente 8.700 ejemplos de razonamiento producidos por modelos Claude Opus 4.6 y 4.7, probablemente con cadenas de pensamiento completas, sobre las que se habria realizado un ajuste supervisado (SFT) o una destilacion del estilo de razonamiento. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF, DPO u optimizacion por preferencias, ni hiperparametros. La conversion a GGUF con Unsloth es puramente de formato y no modifica los pesos.

La principal innovacion declarada es, por tanto, metodologica: destilar trazas de razonamiento de un modelo cerrado de gran tamano en un modelo denso de 2,5B que puede ejecutarse en hardware de consumo. No hay evidencia publicada de que ese objetivo se haya alcanzado con exito; el repositorio no incluye evaluaciones.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la instruccion de uso con `llama-cli --jinja` indican que el modelo incluye plantilla de chat compatible con Jinja.
- Razonamiento paso a paso: el dataset de destilacion contiene trazas de razonamiento de Claude Opus, por lo que se espera que el modelo imite formatos de cadena de pensamiento. No esta verificado ni documentado con ejemplos.
- Capacidades multimodales: la model card incluye instrucciones genericas para `llama-mtmd-cli` ("for multimodal models"), pero el repositorio solo publica un archivo GGUF de texto; no se incluye ningun archivo `mmproj`, por lo que la inferencia de vision no es posible con los archivos disponibles.
- Tool calling / function calling: no disponible; no se documenta soporte de llamadas a herramientas.
- Uso en agentes y razonamiento multi-paso: no disponible; no hay documentacion ni evaluaciones al respecto.
- Capacidades multilingues: no disponible; no se declaran idiomas y el dataset de ajuste tiene nombre en ingles, lo que sugiere predominancia de ese idioma.
- Capacidades especiales (modo thinking, audio, vision): no disponible.
- Generacion de codigo y matematicas: no verificada; el modelo es demasiado pequeno y carece de evaluaciones para asumir un rendimiento util en estas tareas.

## Casos de uso

Las aplicaciones siguientes son escenarios tecnicamente plausibles dado el tamano y el formato del modelo, pero no estan respaldadas por evaluaciones publicadas. Deben tratarse como hipotesis a validar antes de cualquier despliegue.

- Inferencia local totalmente offline en portatiles: con 2,5B de parametros en Q6_K (aproximadamente 2,1 GB de pesos) se puede cargar en llama.cpp o en un runtime compatible y ejecutar sin GPU dedicada, lo que permite prototipar asistentes de escritorio sin depender de APIs externas.
- Prototipado de productos conversacionales antes de escalar a un modelo mayor: sirve para validar plantillas de prompt, flujos de chat y formatos de salida (JSON, listas) a un coste de computo minimo.
- Experimentacion academica sobre destilacion de razonamiento: el modelo es un artefacto util para estudiar como se comporta un modelo de 2,5B ajustado exclusivamente con trazas de un modelo mayor, comparando formatos de salida y coherencia de los pasos intermedios.
- Router o clasificador previo en arquitecturas multi-modelo: por su baja latencia potencial, puede usarse para clasificar la intencion de una consulta o decidir si se enruta a un modelo mayor, siempre que se valide su precision en la tarea concreta.
- Generacion de respuestas cortas en aplicaciones embebidas: integrable en plugins de editores, bots de soporte interno o herramientas CLI distribuidas como binario unico gracias a los ficheros GGUF.
- Educacion y demostraciones didacticas: permite mostrar en un aula o taller el funcionamiento de un LLM cuantizado, los efectos de la plantilla de chat y las limitaciones de un modelo de 2,5B, sin coste de infraestructura.
- Fine-tuning posterior como base de partida: al ser un modelo pequeno ya ajustado a formato conversacional, puede reutilizarse como punto de partida para ajustes especificos de dominio mediante LoRA, si la licencia lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion, ni comparaciones con modelos de referencia.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del tamano del archivo publicado, no mediciones del autor.

- Pesos en Q6_K: aproximadamente 2,1 GB (el repositorio completo ocupa 2,1 GB, coherente con 2,516.756.480 parametros a ~6,56 bits por peso).
- VRAM estimada para inferencia: en torno a 2,5-4 GB en total, segun la longitud de contexto efectiva y el tamano del cache KV, que no puede calcularse con precision porque se desconocen el numero de capas y la configuracion de atencion (GQA/MHA).
- GPU consumer: cabe con holgura en cualquier GPU con 6 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 8 GB, RTX 2070, GTX 1660 Super, etc.); tambien en iGPU modernas con memoria unificada.
- Ejecucion en CPU: viable en CPU de escritorio o portatil, con rendimiento interactivo esperado aunque no medido.
- GPU de datacenter: A100, H100, L40S o similares estan sobredimensionadas para este modelo; su uso solo tendria sentido para servir muchas replicas concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli -hf bunnycore/MiniCPM5-2B-Claude-Distill --jinja`), `llama-server` para exponer una API compatible con OpenAI, Ollama y LM Studio importando el GGUF, y cualquier runtime que consuma GGUF. vLLM no procesa GGUF de forma nativa y estable, por lo que requeriria convertir los pesos a safetensors, algo que este repositorio no ofrece.
- Cuantizaciones alternativas: solo se publica Q6_K. Para equipos con menos de 2-3 GB disponibles no hay versiones mas agresivas (Q4_K_M, Q3, IQ2) listas para descargar; habria que generarlas a partir de los pesos originales, que no estan en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de MiniCPM5-2B-Claude-Distill, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos provienen de sus fichas publicas y deben verificarse en el momento de la evaluacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-Claude-Distill | 2,52B | no disponible | no disponible | GGUF Q6_K, repositorio con 0 descargas |
| Qwen2.5-3B-Instruct | ~3,1B | 32.768 tokens | Apache 2.0 | safetensors y multiples GGUF de la comunidad |
| Llama-3.2-3B-Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF oficiales |
| Gemma-2-2B-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | safetensors y GGUF de la comunidad |

Diferencias destacables: los tres modelos de referencia cuentan con licencia explicitamente publicada, idiomas declarados, contexto documentado y ecosistema de cuantizaciones amplio. MiniCPM5-2B-Claude-Distill no ofrece ninguno de esos datos, no tiene evaluaciones y su unico punto diferencial declarado es el ajuste sobre trazas de razonamiento de Claude Opus. Comparativa de rendimiento: no disponible para ninguno de los cuatro en el contexto de esta ficha, ya que no se han aportado mediciones homogeneas.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explicita no puede asumirse permiso de uso comercial. Tratarlo como modelo de uso exclusivamente experimental hasta que el autor aclare las condiciones.
- Riesgo elevado de alucinacion: un modelo denso de 2,5B ajustado sobre aproximadamente 8.700 ejemplos tiene una capacidad factual y de razonamiento muy limitada, y no se ha evaluado su tasa de error.
- Destilacion de salidas de un modelo cerrado: entrenar con trazas generadas por Claude Opus puede entrar en conflicto con los terminos de uso del proveedor de origen, ademas de las condiciones que aplique el autor del modelo.
- Idiomas no declarados: no hay garantia de un comportamiento correcto en castellano; es probable que el ajuste este dominado por el ingles.
- Longitud de contexto desconocida: impide dimensionar el cache KV, calcular VRAM con precision y planificar conversaciones multi-turno largas.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes, creado y actualizado en 19 minutos. No hay informes de terceros, ni issues, ni pruebas independientes de que el ajuste haya funcionado.
- Solo una cuantizacion publicada (Q6_K): no hay opciones para entornos con muy poca memoria, ni pesos originales en safetensors para reconvertir o reentrenar.
- Instrucciones multimodales enganosas: la model card menciona `llama-mtmd-cli` para modelos multimodales, pero no se publica archivo `mmproj`, por lo que la vision no funciona con estos archivos.
- Requiere plantilla Jinja (`--jinja`): omitir ese flag puede degradar el formato de las respuestas conversacionales.
- Sin soporte de tool calling ni de agentes documentado: cualquier integracion con funciones o pipelines de agentes exige verificar el comportamiento manualmente.
- Posible discrepancia de nomenclatura: no hay confirmacion de que el modelo base sea un MiniCPM5-2B oficial de OpenBMB ni de que el ajuste se haya realizado sobre los pesos publicos de ese modelo.
- Produccion: no recomendado sin una evaluacion propia en el dominio objetivo, incluyendo pruebas de sesgo, toxicidad y fidelidad de las respuestas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bunnycore/MiniCPM5-2B-Claude-Distill
- Dataset de ajuste declarado: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
- Unsloth (herramienta de conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a entidades no relacionadas (una marca de ropa y un hotel) y no se han incluido.

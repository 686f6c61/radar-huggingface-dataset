# mradermacher/Control-8B-V1.1-abliteration-GGUF

## Resumen
Control-8B-V1.1-abliteration-GGUF es la distribucion en formato GGUF del modelo Edens-Gate/Control-8B-V1.1-abliteration, publicada por el usuario mradermacher, especializado en cuantizaciones de modelos abiertos. El modelo original es un merge (fusion) de modelos de 8.000 millones de parametros construido con mergekit, al que se le ha aplicado una tecnica de "abliteration": una modificacion de los pesos orientada a reducir los rechazos del modelo ante ciertas peticiones. Esta version GGUF permite ejecutar el modelo en CPU y GPU de consumo mediante llama.cpp, Ollama y otros runners compatibles.

El modelo esta pensado para generacion de texto conversacional en ingles y no incluye documentacion tecnica detallada sobre su dataset de entrenamiento, contexto nativo ni proceso de alineamiento. Su relevancia practica es la de un modelo de 8B facil de desplegar localmente, con cuantizaciones desde Q2_K hasta f16, y con la particularidad de estar "abliterated", lo que lo orienta a casos donde se busca minimizar las negativas del modelo.

Al tratarse de una cuantizacion, las capacidades reales dependen del modelo base; la model card del repositorio GGUF solo documenta el proceso de cuantizacion y los ficheros disponibles, sin aportar benchmarks ni especificaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles no disponibles) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el modelo base |
| Tamano del repo | 67,8 GB |
| Modelo base | Edens-Gate/Control-8B-V1.1-abliteration |
| Cuantizador | mradermacher |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento
El modelo original es un merge construido con mergekit, segun las etiquetas del repositorio. No se dispone de informacion sobre los modelos que se fusionaron, los hiperparametros del merge ni el dataset utilizado. La variante "abliteration" implica una modificacion de los pesos (habitualmente una intervencion sobre las direcciones de rechazo en el espacio de activaciones o pesos) para reducir la tendencia del modelo a negarse a responder; no se documenta el metodo concreto aplicado.

Esta publicacion concreta no entrena ni afina el modelo: solo convierte los pesos del modelo base a formato GGUF y genera distintas cuantizaciones estaticas (sin imatrix). El autor indica que las cuantizaciones ponderadas/imatrix estan en un repositorio separado (Control-8B-V1.1-abliteration-i1-GGUF). No hay informacion sobre tokens de entrenamiento, composicion del dataset, RLHF/DPO ni innovaciones tecnicas de inferencia.

## Capacidades
- Generacion de texto conversacional en ingles (etiqueta "conversational" en el repositorio).
- Razonamiento y generacion de codigo: presumibles por el tamano y la familia del modelo base, pero no documentados en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidad especial: el modelo esta "abliterated", orientado a reducir rechazos ante peticiones.
- Compatible con endpoints (etiqueta endpoints_compatible).

## Casos de uso
- Despliegue local en equipos de consumo: con cuantizaciones Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB) el modelo cabe en GPUs de 8 GB de VRAM y permite prototipado sin conexion a servicios en la nube.
- Experimentacion con modelos "abliterated": util para investigadores que estudian el efecto de la abliteracion en el comportamiento del modelo y en las tasas de rechazo, comparando con el modelo base sin modificar.
- Chat conversacional en ingles en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp u Ollama, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Evaluacion de merges de modelos: sirve como banco de pruebas para comparar la calidad de merges de 8B frente a modelos base de tamano similar en tareas de generacion abierta.
- Generacion de texto creativo y role-play: la naturaleza abliterated y conversacional del modelo lo hace adecuado para tareas de escritura donde los modelos alineados suelen rechazar contenido, siempre con las cautelas legales y eticas correspondientes.
- Integracion en pipelines de inferencia ligeros: al estar en GGUF, puede servirse con llama.cpp server o runners compatibles con endpoints para tareas de generacion por lotes en CPU o GPU modestas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada (solo pesos, sin overhead de contexto): Q2_K ~3,3 GB; Q3_K_M ~4,1 GB; IQ4_XS ~4,6 GB; Q4_K_M ~5,0 GB; Q5_K_M ~5,8 GB; Q6_K ~6,7 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para cuantizaciones altas; A100/H100 no son necesarias para un modelo de 8B.
- Cabe en GPU de consumo: si, desde 6-8 GB de VRAM con cuantizaciones Q4/Q5; las cuantizaciones Q8_0 y f16 requieren 10-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF; el modelo base usa transformers. El repositorio esta marcado como endpoints_compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Control-8B-V1.1-abliteration-GGUF | 8,03B | no disponible | no disponible | GGUF | Merge abliterated, solo ingles |
| Modelo base Edens-Gate/Control-8B-V1.1-abliteration | 8,03B | no disponible | no disponible | safetensors | Pesos originales sin cuantizar |
| Alternativas de 8B (p. ej. Llama 3 8B, Mistral 7B) | 7-8B | 8k-32k segun modelo | licencias abiertas | safetensors, GGUF | Datos no verificados en esta busqueda; comparacion orientativa |

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias
- La licencia no esta declarada en la informacion disponible; antes de un uso comercial debe verificarse la licencia del modelo base en Edens-Gate/Control-8B-V1.1-abliteration.
- Modelo solo en ingles; el rendimiento en castellano no esta garantizado.
- Al ser un merge sin documentacion de entrenamiento, la calidad y los sesgos son dificiles de evaluar a priori.
- La abliteracion reduce los rechazos del modelo, lo que incrementa el riesgo de generar contenido inapropiado, danoso o no filtrado; requiere moderacion adicional en produccion.
- Riesgo de alucinacion inherente a modelos de 8B sin datos de evaluacion publicados.
- No hay informacion sobre la longitud de contexto nativa; debe probarse empiricamente antes de usarlo con contextos largos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda Q4_K_M o superior.
- El repositorio tiene muy pocas descargas y likes (189 y 1 respectivamente), lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Control-8B-V1.1-abliteration-GGUF
- Modelo base: https://huggingface.co/Edens-Gate/Control-8B-V1.1-abliteration
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Control-8B-V1.1-abliteration-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Control-8B-V1.1-abliteration-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

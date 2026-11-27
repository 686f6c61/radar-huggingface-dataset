# c0desk1/hades-q4_k_m

## Resumen

Hades Q4_K_M es una distribucion cuantizada en formato GGUF de un modelo de lenguaje conversacional, publicada por el usuario c0desk1 en Hugging Face bajo licencia MIT. El repositorio contiene unicamente los pesos cuantizados en Q4_K_M (aproximadamente 1,9 GB), lo que lo hace apto para inferencia en hardware de consumo mediante llama.cpp u otras herramientas compatibles con GGUF. El modelo base del que deriva no se especifica en la model card publicada.

El dato mas relevante disponible es el recuento de parametros en formato safetensors: 3.085.938.688 parametros (unos 3.100 millones), lo que situa al modelo en la categoria de pequenos modelos de ~3B. Con esa escala y una cuantizacion de 4 bits, el modelo puede ejecutarse en GPUs con 4-6 GB de VRAM o incluso en CPU con suficiente RAM, lo que lo convierte en una opcion atractiva para prototipado local, entornos con recursos limitados y despliegues en el borde.

La ficha tiene una limitacion importante: la model card publicada es practicamente vacia (solo contiene la declaracion de licencia MIT) y no se han publicado detalles sobre arquitectura, datos de entrenamiento, idiomas o benchmarks. Por tanto, gran parte de las especificaciones tecnicas se marcan como "no disponible", y las capacidades descritas se infieren del caracter conversacional declarado en los tags y del tamano del modelo, no de documentacion oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo conversacional; probable transformer, sin confirmar) |
| Parametros totales | 3.085.938.688 (~3,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el autor no documenta otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 1,9 GB); recuento de parametros reportado en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo. Los tags y la model card no especifican si se trata de un transformer denso, un modelo MoE o una arquitectura hibrida, ni el modelo base del que deriva esta cuantizacion. El unico dato estructural fiable es el numero de parametros (3.085.938.688), coherente con un modelo denso de aproximadamente 3B.

Tampoco hay informacion sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones multilingues), sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modo thinking). La model card publicada por el autor se limita a la declaracion de licencia, por lo que cualquier afirmacion sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la ausencia de pipeline declarado sugieren un uso orientado a dialogo multi-turno, aunque el formato de prompt no esta documentado.
- Inferencia local en formato GGUF: compatible con el ecosistema llama.cpp (llama.cpp, Ollama, LM Studio, entre otros) gracias a la cuantizacion Q4_K_M.
- Integracion con endpoints compatibles: el tag `endpoints_compatible` indica que puede servirse mediante infraestructura de inferencia estandar.
- Razonamiento, codigo, matematicas y capacidades multilingues: no disponible (no documentadas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible; no se declaran.

## Casos de uso

- Prototipado local de asistentes conversacionales: con ~3,1B parametros en Q4_K_M (1,9 GB), el modelo cabe en portatiles con GPU modesta o incluso en CPU, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Despliegue en el borde o en dispositivos con recursos limitados: su huella de memoria reducida lo hace adecuado para entornos donde no es viable un modelo de 7B o superior, como mini-PC, Raspberry Pi con RAM suficiente o contenedores ligeros.
- Clasificacion y extraccion de informacion en pipelines internos: para tareas de etiquetado, resumen corto o extraccion de entidades en textos de longitud moderada, siempre que se valide el comportamiento con datos propios dada la falta de benchmarks.
- Chatbots de soporte en entornos de desarrollo y pruebas: util como sustituto de bajo coste en tests de integracion de aplicaciones conversacionales antes de pasar a un modelo mayor en produccion.
- Experimentacion educativa e investigacion: modelo pequeno y de licencia permisiva (MIT) para estudiar tecnicas de cuantizacion, evaluar el impacto de Q4_K_M en calidad o comparar con otras alternativas de ~3B.
- Servicio de inferencia autogestionado: al ser `endpoints_compatible`, puede desplegarse detras de una API compatible con OpenAI mediante servidores de inferencia que soporten GGUF, integrandose en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y no se han encontrado comparaciones oficiales con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con la cuantizacion Q4_K_M (pesos de 1,9 GB mas overhead de contexto y cache KV); el requisito exacto depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); en GPUs de datacenter (A100, H100) el modelo queda sobredimensionado en capacidad y solo tiene sentido para servir muchas peticiones concurrentes.
- GPU de consumo: si cabe en practicamente todas las GPU consumer modernas con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con 4-8 GB de RAM disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI que acepten GGUF; no se documenta soporte para vLLM o TGI (que tipicamente requieren pesos safetensors completos).
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa: no se conocen el modelo base, el contexto ni los benchmarks de Hades Q4_K_M, por lo que cualquier comparacion con alternativas de ~3B (por ejemplo, Llama 3.2 3B, Qwen2.5 3B o Phi-3.5-mini) seria especulativa. A continuacion se recogen solo los datos verificables de esta publicacion:

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados |
|---|---|---|---|---|---|
| Hades Q4_K_M (c0desk1) | ~3,1B | no disponible | MIT | GGUF | no disponible |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card solo declara la licencia, sin informacion sobre arquitectura, datos de entrenamiento, idiomas o formato de prompt; esto dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion: en un modelo de ~3B sin benchmarks publicados, la fiabilidad factual es incierta y debe validarse empiricamente antes de cualquier uso sensible.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Cobertura idiomatica no confirmada: no se declaran idiomas soportados; no asumir un buen rendimiento en castellano sin pruebas propias.
- Contexto desconocido: se desconoce la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Licencia MIT: permisiva para uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia del modelo base para descartar obligaciones adicionales.
- Repositorio con 0 descargas y creado recientemente: sin validacion por parte de la comunidad; se recomienda auditar los pesos y el proceso de cuantizacion antes de desplegarlo.
- Formato GGUF unicamente: no hay pesos safetensors completos en el repo, lo que limita el uso con frameworks que no soporten GGUF (vLLM, TGI) y la posibilidad de recuantizar a otros formatos desde el origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c0desk1/hades-q4_k_m
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

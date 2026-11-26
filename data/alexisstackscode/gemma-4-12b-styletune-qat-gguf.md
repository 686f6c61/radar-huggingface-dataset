# alexisStacksCode/Gemma-4-12B-StyleTune-QAT-GGUF

## Resumen

Gemma-4-12B-StyleTune-QAT-GGUF es una distribucion en formato GGUF de un ajuste fino estilistico del modelo Gemma 4 de 12.000 millones de parametros de Google. Lo publica el usuario alexisStacksCode y deriva de la cadena google/gemma-4-12B-it-qat-q4_0-unquantized, pasando por el cuantizado de unsloth y el ajuste de estilo de Gryphe (Gemma-4-12B-StyleTune), refinado a su vez con la herramienta Wiself/Voice. El resultado es un unico paquete listo para inferencia local con llama.cpp y derivados.

El modelo conserva la naturaleza multimodal del original (pipeline image-text-to-text), de modo que acepta imagenes y texto como entrada y genera texto. Los 11.907.350.576 parametros reales del safetensors confirman que se trata de la variante de 12B, con pesos cuantizados en Q4_0 mediante Quantization-Aware Training (QAT), lo que reduce el impacto en calidad respecto a una cuantizacion post-entrenamiento convencional.

Su relevancia practica es la de ofrecer un modelo de 12B multimodal y conversacional que cabe en hardware de consumo, con el estilo de escritura ajustado por Gryphe (conocido por sus variantes StyleTune) y empaquetado con los proyectores multimodales ya incluidos, lo que simplifica el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), no se detalla la configuracion interna |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT); proyectores multimodales en BF16 y F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (incluye MTP/mtp-gemma-4-12B-it-Q4_0.gguf, mmproj-BF16.gguf, mmproj-F16.gguf) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de tratarse de un transformer multimodal de la familia Gemma 4, con capacidad de procesar imagen y texto (pipeline image-text-to-text). El modelo parte de una version entrenada con Quantization-Aware Training en Q4_0 (google/gemma-4-12B-it-qat-q4_0-unquantized), de modo que los pesos ya estan adaptados a la precision de 4 bits durante el entrenamiento y no solo despues.

Sobre esa base se aplico un ajuste fino de estilo (Gryphe/Gemma-4-12B-StyleTune), orientado a modificar el registro y la prosa del modelo, y posteriormente se proceso con la herramienta Wiself/Voice segun indica la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en ninguna de las etapas. El paquete incluye los proyectores multimodales (mmproj) en BF16 y F16 renombrados desde el repositorio base, y el autor advierte que el archivo del modelo es ligeramente mayor que la version sin modificar.

## Capacidades

- Generacion de texto conversacional con el estilo ajustado por StyleTune.
- Entrada multimodal imagen-texto: acepta imagenes junto con instrucciones textuales.
- Razonamiento y respuesta multi-turno en formato de chat (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su uso en infraestructuras de inferencia tipo API.
- Capacidades de codigo y matematicas: no confirmadas de forma explicita en la informacion disponible, aunque son habituales en la familia Gemma; deben verificarse empiricamente.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp u Ollama en una maquina de sobremesa y mantener dialogos multi-turno con un tono de escritura refinado, gracias al ajuste StyleTune.
- Descripcion y analisis de imagenes: al incluir los proyectores mmproj, permite enviar capturas, diagramas o fotografias junto a una pregunta y obtener una respuesta textual, util para herramientas de accesibilidad o catalogacion.
- Generacion de texto creativo y narrativa: el ajuste de estilo de Gryphe esta orientado a mejorar la prosa, por lo que encaja en tareas de redaccion, ficcion y reescritura con registro cuidado.
- Prototipado de aplicaciones multimodales sin GPU de datacenter: con cuantizacion Q4_0, un equipo con GPU de consumo puede servir el modelo para demos y pruebas de concepto.
- Procesamiento de documentacion con imagenes: extraccion de informacion de capturas de pantalla, formularios escaneados o graficos simples combinando vision y generacion de texto.
- Chatbot integrado en herramientas de escritorio: al ser compatible con endpoints, puede conectarse a interfaces tipo OpenAI API y alimentar asistentes embebidos en editores o IDE.
- Evaluacion comparativa de estilos: util para investigadores que quieran medir el efecto del ajuste StyleTune frente al Gemma 4 base en tareas de generacion abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_0 y 11,9B parametros, el archivo principal ronda los 6-7 GB; el repositorio completo ocupa 7,8 GB, incluyendo los proyectores multimodales. Se recomienda reservar al menos 8-10 GB de VRAM para inferencia comoda con contexto moderado.
- GPU recomendadas: RTX 3090, RTX 4070 Ti, RTX 4080, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- GPU de consumo: si cabe en tarjetas con 8 GB o mas de VRAM en Q4_0; con 6 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de llama.cpp y, potencialmente, vLLM si soporta el formato GGUF de esta variante (no confirmado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-12B-StyleTune-QAT-GGUF | 11,9B | no disponible | Si (image-text-to-text) | no disponible | GGUF Q4_0 |
| unsloth/gemma-4-12B-it-qat-GGUF | 12B (aprox.) | no disponible | Si | no disponible | GGUF |
| Gryphe/Gemma-4-12B-StyleTune | 12B (aprox.) | no disponible | Si | no disponible | safetensors (presumiblemente) |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12B (aprox.) | no disponible | Si | no disponible | safetensors |

La comparativa se limita a la cadena de derivacion del propio modelo, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Licencia no especificada en la informacion disponible: antes de un uso comercial es imprescindible verificar los terminos del modelo base de Google (Gemma) y del ajuste de Gryphe.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto no disponible: limita la planificacion de aplicaciones con documentos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas factuales y en la interpretacion de imagenes complejas.
- El ajuste de estilo puede introducir sesgos de registro o de contenido derivados del dataset de StyleTune, no documentado.
- El autor advierte que el archivo es ligeramente mayor que la version sin modificar, lo que puede afectar al espacio en disco y a los requisitos de memoria.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de la calidad tras el ajuste de estilo ni de la perdida por cuantizacion QAT.
- Procedencia del ajuste con la herramienta Wiself/Voice no detallada: conviene auditar el proceso antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexisStacksCode/Gemma-4-12B-StyleTune-QAT-GGUF
- Modelo base cuantizado de unsloth: https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- Ajuste de estilo de Gryphe: https://huggingface.co/Gryphe/Gemma-4-12B-StyleTune
- Version intermedia con Wiself/Voice: https://huggingface.co/Wiself/gemma-4-12B-QAT-Styletune-Voice
- Herramienta Wiself/Voice: https://huggingface.co/Wiself/Voice

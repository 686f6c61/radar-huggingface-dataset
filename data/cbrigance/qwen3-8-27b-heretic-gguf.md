# cbrigance/Qwen3.8-27B-heretic-GGUF

## Resumen

Qwen3.8-27B-heretic-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario cbrigance en Hugging Face. Se trata de una variante "abliterated" (tambien etiquetada como "heretic"), es decir, un ajuste que elimina o atenua los mecanismos de rechazo y alineacion de seguridad del modelo original, orientado a usos sin filtros de contenido. Al derivar de Qwen3.8-27B, hereda su naturaleza multimodal: el pipeline declarado es image-text-to-text, con soporte de vision y lenguaje.

El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano. La cuantizacion GGUF esta pensada para inferencia eficiente con llama.cpp y herramientas compatibles, lo que permite ejecutarlo en hardware consumer con los niveles de cuantizacion adecuados. El repositorio ocupa 68,2 GB, lo que sugiere la presencia de multiples variantes de cuantizacion.

Es relevante ahora porque combina tres tendencias actuales: modelos multimodales de tamano medio-grande, distribucion en GGUF para despliegue local y modificaciones de alineacion (abliteration) que interesan a investigadores en seguridad y a desarrolladores que necesitan respuestas sin restricciones de rechazo. No obstante, el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face, y la licencia declarada es Apache 2.0 sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples variantes; niveles concretos no disponibles) |
| Idiomas soportados | Ingles (segun metadatos); otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado para llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.8-27B mas alla de su caracter multimodal (procesa imagen y texto y genera texto). Por la nomenclatura y la familia Qwen3, se infiere una arquitectura transformer con un codificador visual acoplado, aunque no se confirma en los metadatos. El modelo derivado es una cuantizacion GGUF del original, por lo que conserva la arquitectura y los pesos del base en precision reducida.

El aspecto diferencial de esta publicacion es el proceso de abliteration ("heretic"): una modificacion de los pesos orientada a suprimir el comportamiento de rechazo aprendido durante el alineamiento (RLHF/DPO) del modelo original. Los metadatos no aportan informacion sobre el dataset de entrenamiento del base, el numero de tokens, la composicion de datos ni los detalles tecnicos del proceso de abliteration aplicado. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes y texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y tareas multimodal.
- Razonamiento y respuesta a instrucciones heredadas del modelo base Qwen3.8-27B.
- Comportamiento sin rechazo (abliterated): el modelo tiende a no declinar peticiones que el base rechazaria.
- Compatibilidad con llama.cpp y endpoints compatibles (segun tags).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: solo se declara ingles; el resto no disponible.

## Casos de uso

- Investigacion en seguridad de IA: analisis de como la abliteration afecta al comportamiento del modelo, comparando respuestas del base y de la variante heretic en conjuntos de prompts sensibles.
- Despliegue local en estaciones de trabajo: al estar en GGUF, permite ejecutar un modelo de ~27B en hardware consumer con cuantizaciones agresivas, sin depender de APIs en la nube.
- Procesamiento de documentos con imagenes: extraccion de informacion de capturas, formularios escaneados o graficos combinando entrada visual y textual.
- Generacion de contenido creativo sin filtros: redaccion de ficcion, guiones o material editorial donde los rechazos del modelo alineado resultan un obstaculo.
- Prototipado rapido con llama.cpp: integracion en aplicaciones de escritorio o servidores ligeros mediante el formato GGUF y endpoints compatibles.
- Evaluacion comparativa de cuantizaciones: el repositorio de 68,2 GB permite estudiar la degradacion de calidad entre niveles de cuantizacion en tareas multimodales.
- Analisis de sesgos y alineacion: estudio de como la supresion de rechazos interactua con sesgos preexistentes del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~27B en GGUF, las cuantizaciones de 4 bits requieren del orden de 16-18 GB, las de 8 bits en torno a 28-30 GB y FP16 alrededor de 54 GB; estas cifras son estimaciones generales, no datos del repositorio.
- GPU recomendadas: no especificadas. Por tamano, una RTX 4090 (24 GB) podria alojar cuantizaciones de 4-5 bits; A100 40/80 GB y H100 para precisiones mayores.
- Cabe en GPU consumer: probablemente si, con cuantizaciones de 4 bits en GPUs de 24 GB o superiores; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y otros runners compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| cbrigance/Qwen3.8-27B-heretic-GGUF | ~26,9B | No disponible | Imagen-texto | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | ~26,9B | No disponible | Imagen-texto | Apache 2.0 | Safetensors |
| Otras variantes abliterated de la familia Qwen | No disponible | No disponible | Texto/multimodal | Variable | GGUF/safetensors |

La comparacion con alternativas de otros fabricantes no esta disponible en la informacion proporcionada. La diferencia principal frente al base es la eliminacion de rechazos y la cuantizacion GGUF; el resto de caracteristicas tecnicas se heredan del original.

## Limitaciones y advertencias

- Modelo abliterated: la supresion de rechazos implica que puede generar contenido danino, ofensivo o inseguro; no es apto para produccion sin moderacion externa.
- Etiquetado como not-for-all-audiences: no recomendado para aplicaciones de cara al publico general.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la abliteration puede aumentar la confianza en respuestas incorrectas al eliminar cautelas.
- Sesgos: no documentados, pero heredados del modelo base y potencialmente amplificados por el proceso de abliteration.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Contexto: la longitud de contexto no esta disponible, lo que dificulta planificar cargas de trabajo con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso esta restringido (gated) y el uso de una variante abliterated puede contravenir las politicas de aceptacion del modelo base; revisar los terminos antes de desplegar.
- Comunidad: con 7 descargas y 0 likes, no hay validacion externa ni soporte; el modelo es practicamente desconocido.
- Cuantizacion: la perdida de calidad respecto al base no esta medida ni documentada.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/Qwen3.8-27B-heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de referencia citado en los tags: arXiv:2406.11717 (https://arxiv.org/abs/2406.11717)
- llama.cpp: https://github.com/ggml-org/llama.cpp

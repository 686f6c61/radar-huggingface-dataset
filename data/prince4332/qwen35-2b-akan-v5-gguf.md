# prince4332/qwen35-2b-akan-v5-GGUF

## Resumen

`prince4332/qwen35-2b-akan-v5-GGUF` es un modelo derivado de la familia Qwen3.5 de 2B parametros, publicado por el usuario prince4332 en formato GGUF y afinado mediante las herramientas de Unsloth. El repositorio contiene exclusivamente pesos cuantizados para su uso con llama.cpp: un archivo `Q3_K_M` para el modelo de lenguaje y un `BF16-mmproj` para el proyector multimodal, lo que indica que se trata de un modelo vision-language (VLM) capaz de procesar imagenes ademas de texto.

El dato de parametros reportado en la ficha de HuggingFace es de 1.891.655.488 parametros (aproximadamente 1,89B), coherente con una variante de 2B de la familia Qwen3.5. El nombre del modelo incluye el sufijo "akan", que sugiere un ajuste fino orientado a dicha lengua, aunque la model card no confirma ni detalla esta circunstancia.

Se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, publicado el 9 de octubre de 2026, sin licencia declarada, sin idiomas declarados y sin pipeline especificado. Su relevancia practica es limitada como referencia publica: es un experimento de fine-tuning comunitario cuyo interes principal reside en que demuestra el flujo de trabajo Unsloth -> GGUF para modelos multimodales pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_5`; familia transformer de Qwen3.5, se infiere por el tag del repositorio) |
| Parametros totales | 1.891.655.488 (1,89B), dato reportado en safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M; proyector multimodal en BF16 (`BF16-mmproj.gguf`) |
| Idiomas soportados | no disponible (el nombre sugiere "akan" pero no se confirma en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 1,8 GB |
| Modalidad | vision-language (texto + imagen, segun el tag `vision-language-model` y el archivo mmproj) |
| Fecha de creacion | 2026-10-09 |
| Fecha de actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card. El tag `qwen3_5` y el nombre del repositorio indican que el modelo base pertenece a la familia Qwen3.5, desarrollada por Alibaba. Se trata, por tanto, de un transformer con ajuste fino adicional. La presencia de un archivo `BF16-mmproj.gguf` confirma que el modelo incorpora un proyector multimodal, es decir, que combina un codificador de vision con el decodificador de lenguaje para tareas de imagen y texto.

El unico dato de entrenamiento disponible es que el fine-tuning y la conversion a GGUF se realizaron con Unsloth, que segun la propia model card permitio un entrenamiento "2x mas rapido". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o RLVR. Tampoco se detalla el proceso de entrenamiento del proyector multimodal ni la resolucion de imagen soportada.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el uso documentado con `llama-cli` indican soporte de dialogos multi-turno.
- Procesamiento de imagenes: el archivo `BF16-mmproj.gguf` y el tag `vision-language-model` confirman capacidades multimodales, invocables mediante `llama-mtmd-cli`.
- Compatibilidad con el template de chat: la model card recomienda el flag `--jinja` para aplicar el chat template correcto.
- Soporte de endpoints: el tag `endpoints_compatible` sugiere compatibilidad con el formato de API de HuggingFace.
- Capacidades potenciales de la familia Qwen3.5 (razonamiento, codigo, matematicas, tool calling, agentes): no confirmadas para este fine-tuning concreto, ya que la model card no las documenta.

## Casos de uso

- Prototipado local de asistentes multimodales: con 1,89B de parametros y una cuantizacion Q3_K_M, el modelo puede ejecutarse en un portatil o en una GPU de gama media para probar flujos de descripcion de imagenes y dialogo sin depender de APIs externas.
- Transcripcion y resumen de capturas o documentos escaneados: el componente de vision permite extraer texto de imagenes y pasarselo al decodificador de lenguaje para generar resumenes, siempre que la tarea no exija alta precision.
- Experimentacion linguistica con lenguas de bajos recursos: si el sufijo "akan" efectivamente corresponde a un fine-tuning sobre dicha lengua, el modelo serviria para investigar el comportamiento de modelos pequenos en idiomas poco representados; conviene verificar esta hipotesis antes de usarlo en produccion.
- Educacion y demostraciones de fine-tuning: sirve como ejemplo reproducible del pipeline Unsloth -> GGUF -> llama.cpp para modelos multimodales, util en cursos y talleres.
- Generacion asistida en entornos con recursos muy limitados: su huella de memoria reducida permite desplegarlo en dispositivos edge (Raspberry Pi 5, mini-PC con iGPU) para tareas de clasificacion o etiquetado simple.
- Base para nuevos fine-tunings: al ser un modelo pequeno y ya convertido a GGUF, puede servir de punto de partida para ajustes especificos de dominio, aunque la ausencia de licencia declarada desaconseja su uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor):
  - Q3_K_M: en torno a 1,0-1,3 GB de pesos, mas overhead de contexto y del proyector de vision; aproximadamente 1,5-2,0 GB en total.
  - BF16 completo: en torno a 3,8 GB solo de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para la cuantizacion Q3_K_M; RTX 3050, RTX 4060, RTX 4090, A100 o H100 funcionarian sin problemas, aunque las GPU de gama alta estarian infrautilizadas.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos anos (GTX 1650 4 GB en adelante) puede ejecutar la version Q3_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto y `llama-mtmd-cli` para multimodal, tal como documenta el autor), y por extension cualquier frontend basado en llama.cpp (Ollama, LM Studio, llama-cpp-python). No hay confirmacion de soporte para vLLM o TGI con estos pesos.
- Latencia y throughput: no disponible.
- Nota: se recomienda usar el flag `--jinja` al invocar el modelo para que se aplique correctamente el chat template.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prince4332/qwen35-2b-akan-v5-GGUF | 1,89B | vision-language | no disponible | no disponible | GGUF en HuggingFace |
| Qwen3.5 2B (base, Alibaba) | ~2B | depende de la variante | no disponible | segun licencia de Qwen | HuggingFace y ModelScope |
| Gemma 3 4B (Google) | ~4B | vision-language | no disponible | Gemma Terms | HuggingFace y Kaggle |
| SmolVLM 2B (HuggingFace) | ~2B | vision-language | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos para este modelo concreto, por lo que la comparacion se limita a parametros, modalidad, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explicita no se puede asumir permiso de uso comercial ni de redistribucion; se debe contactar con el autor antes de cualquier uso en produccion.
- Sin datos de benchmarks: no hay evidencia publica de calidad, lo que impide estimar su rendimiento real frente al modelo base.
- Riesgo elevado de alucinacion: con 1,89B de parametros y una cuantizacion Q3_K_M agresiva, es previsible una degradacion de la coherencia y de la fidelidad factual respecto al modelo original en BF16.
- Perdida de calidad por cuantizacion: Q3_K_M es una cuantizacion de baja precision; para tareas sensibles conviene usar una cuantizacion mayor, que el repositorio no ofrece.
- Idiomas no declarados: se desconoce el soporte real de castellano; la model card no documenta las lenguas cubiertas por el fine-tuning.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o en documentos extensos sin medirla empiricamente.
- Repositorio sin traccion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.
- Arquitectura no documentada: no se especifican el encoder de vision, la resolucion de imagen soportada ni el numero de tokens de imagen, lo que complica la integracion en pipelines existentes.
- Fechas de creacion y actualizacion inusuales (2026): conviene verificar la integridad y procedencia de los archivos antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prince4332/qwen35-2b-akan-v5-GGUF
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia para GGUF): no se ha encontrado un enlace especifico en la busqueda web; se referencia por el uso documentado en la model card.
- Paper, blog o demo oficial: no disponible.

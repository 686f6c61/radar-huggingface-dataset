# orcarouter/Nex-N2.5-mini-Uncensored-GGUF

## Resumen

Nex-N2.5-mini-Uncensored-GGUF es la distribucion cuantizada en formato GGUF del modelo orcarouter/Nex-N2.5-mini-Uncensored, un modelo multimodal de arquitectura MoE (mezcla de expertos) con 34.660.610.688 parametros totales (unos 34,66 mil millones). Lo publica el usuario orcarouter y sus etiquetas lo vinculan a la familia qwen3.5 / qwen3_5_moe, con pipeline declarado image-text-to-text: acepta imagenes y texto como entrada y genera texto.

Su rasgo diferencial es que se trata de un modelo "abliterated" y "uncensored": se han eliminado las direcciones de rechazo del modelo original, de modo que no aplica el filtrado de seguridad habitual. Los propios tags lo orientan explicitamente a red teaming y ai-red-team, ademas de a casos agenticos, computer-use, function-calling y razonamiento.

Se distribuye unicamente en GGUF para llama.cpp (con fichero mmproj para la torre de vision), bajo licencia Apache-2.0 y con acceso restringido: requiere aceptar condiciones en HuggingFace. Acumula 1.184 descargas y 9 likes desde su publicacion el 10 de septiembre de 2026, y el repositorio ocupa 114,9 GB, lo que refleja varias cuantizaciones del mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiquetada como qwen3.5 / qwen3_5_moe; vision-language |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible el listado exacto; el repositorio se distribuye en GGUF cuantizado generado con imatrix para llama.cpp |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (incluye mmproj para la torre de vision); modelo base en safetensors: orcarouter/Nex-N2.5-mini-Uncensored |
| Modalidad de entrada/salida | image-text-to-text (entrada de imagen y texto, salida de texto) |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 114,9 GB |
| Descargas / likes | 1.184 / 9 |
| Fecha de publicacion | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible indica una arquitectura de mezcla de expertos (MoE) con 34,66 mil millones de parametros totales, derivada de la familia Qwen3.5 segun los tags del repositorio (qwen3.5, qwen3_5_moe). Al ser MoE, solo una fraccion de los parametros se activa por token, aunque el numero de parametros activos no se especifica en la informacion proporcionada. El modelo es multimodal: incorpora una torre de vision que se distribuye como fichero mmproj, compatible con llama.cpp para entrada de imagenes junto a texto.

El modelo base es orcarouter/Nex-N2.5-mini-Uncensored, sobre el que se ha aplicado un proceso de tipo "abliterated": se eliminan las direcciones de rechazo del modelo alineado, dando lugar a una variante sin censura y orientada a red teaming. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline conversational).
- Razonamiento explicito (tag reasoning) y capacidades agenticas (tag agentic).
- Soporte de function calling / tool calling.
- Uso orientado a computer-use: interaccion con interfaces y flujos de automatizacion.
- Vision-language: comprension de imagenes a traves del fichero mmproj en llama.cpp.
- Capacidades multilingues limitadas a ingles (en) y chino (zh).
- Modelo "abliterated" y "uncensored": no aplica rechazo de peticiones, lo que lo hace apto para ai-red-team y pruebas adversarias.
- Ejecucion local en CPU/GPU mediante llama.cpp, con cuantizaciones generadas usando imatrix.
- No se especifica en la informacion disponible si existe modo "thinking" separado, soporte de audio o decodificacion especulativa.

## Casos de uso

- Red teaming y evaluacion de seguridad: al haber sido abliterado, permite generar respuestas que un modelo alineado rechazaria, util para construir conjuntos de prompts adversarios y medir la robustez de clasificadores y filtros de contenido.
- Investigacion en alineacion y refusal: comparar sus salidas con las del modelo base alineado permite estudiar que comportamientos dependen de la direccion de rechazo eliminada.
- Agentes de automatizacion con tool calling: puede integrarse en pipelines que encadenen llamadas a funciones, consultas a APIs y razonamiento multi-paso, con la ventaja de ejecutarse en local.
- Computer-use y automatizacion de escritorio: con entrada de imagen, puede interpretar capturas de pantalla y decidir la siguiente accion en flujos de automatizacion de interfaz.
- Analisis de documentos con componentes visuales: al aceptar imagen y texto, sirve para extraer informacion de capturas, diagramas o formularios junto a instrucciones en lenguaje natural.
- Asistencia tecnica en ingles y chino: conversaciones multi-turno para soporte interno o documentacion bilingue en entornos donde no se requiere moderacion adicional.
- Generacion de datos sinteticos y aumentacion de datasets: producir texto diverso y no filtrado para entrenar o evaluar otros sistemas, incluyendo datos negativos.
- Despliegue local en estaciones de trabajo: gracias al formato GGUF y a las cuantizaciones con imatrix, puede ejecutarse en equipos con GPU de consumo o en Mac con memoria unificada, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (calculada a partir de los 34,66 mil millones de parametros; cifras orientativas, no publicadas por el autor):
  - Cuantizacion de ~4,8 bits por peso: en torno a 21 GB.
  - Cuantizacion de ~5,7 bits por peso: en torno a 25 GB.
  - Cuantizacion de ~6,6 bits por peso: en torno a 29 GB.
  - Cuantizacion de 8 bits: en torno a 37 GB.
  - Precision FP16/BF16: en torno a 69 GB.
- Hay que sumar el fichero mmproj de la torre de vision (del orden de 1-2 GB) y la cache KV, cuyo tamano depende del contexto configurado.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones de 4-5 bits y contexto moderado; RTX 5090 (32 GB) o configuraciones multi-GPU para 6 bits; A100 40/80 GB o H100 80 GB para 8 bits o FP16.
- Si cabe en GPU de consumo: si, en cuantizaciones de 4-5 bits sobre GPU de 24 GB; tambien en Apple Silicon con memoria unificada de 32 GB o superior.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, llama-cpp-python y otros frontends compatibles con GGUF. El soporte de GGUF en vLLM es experimental y TGI no lo soporta de forma nativa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas publicas; los campos del modelo analizado que no constan se marcan como no disponibles.

| Modelo | Parametros totales | Parametros activos | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nex-N2.5-mini-Uncensored-GGUF | 34,66 B | no disponible | no disponible | Si (mmproj) | Apache-2.0 | GGUF, acceso restringido |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128 K (extensible con YaRN) | No | Apache-2.0 | Safetensors y GGUF, abierto |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | No | Apache-2.0 | Safetensors y GGUF, abierto |
| Gemma 3 27B | 27 B | no aplica (denso) | 128 K | Si | Licencia Gemma | Safetensors y GGUF, abierto |

La diferencia principal frente a estas alternativas no es el rendimiento, del que no hay datos publicados, sino el enfoque: es un modelo multimodal abliterado, sin moderacion, distribuido en GGUF y con acceso sujeto a aceptacion de condiciones.

## Limitaciones y advertencias

- Ausencia total de alineacion de seguridad: al ser "abliterated" y "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin filtrado. No es apto para aplicaciones de cara al publico sin capas de moderacion externas.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, por lo que se desconoce su tasa de invencion de hechos.
- Sesgos conocidos: no disponible. Al derivar de un modelo entrenado principalmente en ingles y chino, es previsible un sesgo cultural y linguistico hacia esos dos idiomas.
- Idiomas: soporte declarado unicamente de ingles (en) y chino (zh); no hay soporte declarado de castellano, lo que limita su uso en produccion en espanol.
- Contexto: se desconoce la longitud de contexto soportada, un dato critico para planificar despliegues con documentos largos.
- Licencia: Apache-2.0 permite uso comercial, pero el acceso al repositorio esta restringido y requiere aceptar condiciones en HuggingFace, lo que hay que verificar antes de integrarlo en un producto.
- Parametros activos desconocidos: al no publicarse, no se puede estimar con precision el coste de computo por token ni el throughput real.
- Formato limitado a GGUF: no hay pesos en safetensors para este repositorio (el base si los tiene), lo que restringe el uso con frameworks de entrenamiento o fine-tuning de alto rendimiento.
- Fecha de publicacion futura respecto al conocimiento habitual y volumen de descargas bajo (1.184), lo que implica poca validacion independiente por parte de la comunidad.
- Uso responsable: cualquier despliegue orientado a red teaming debe hacerse en entornos aislados y con registro de actividad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs o repos); los resultados devueltos correspondian a foros de soporte de Microsoft sin relacion con el modelo.

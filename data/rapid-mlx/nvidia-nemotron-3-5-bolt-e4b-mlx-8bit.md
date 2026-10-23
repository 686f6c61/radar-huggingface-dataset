# rapid-mlx/NVIDIA-Nemotron-3.5-Bolt-E4B-MLX-8bit

## Resumen

NVIDIA Nemotron 3.5 Bolt E4B MLX 8-bit es una conversión cuantizada del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, publicada por el usuario `rapid-mlx`. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el checkpoint original en BF16 (creado por NVIDIA, según indica la model card) se ha convertido a formato MLX con cuantización afín de 8 bits y tamaño de grupo 64, empleando `mlx-lm` 0.31.3 y MLX 0.32.4 sobre GPU. El resultado son 7.463.013.376 parámetros en un repositorio de 8,0 GB, pensado para ejecutarse en Apple Silicon.

El modelo base pertenece a la familia Nemotron 3.5 Bolt y, por las etiquetas del repositorio y las referencias de la model card, se apoya en la arquitectura de Google Gemma 4 (etiqueta `gemma4`; el texto original de Gemma 4 se distribuye bajo Apache 2.0). La nomenclatura «E4B» sugiere del orden de 4.000 millones de parámetros efectivos, pero la información disponible no confirma si se trata de una arquitectura MoE ni cuántos expertos activa. La ventana de contexto declarada es de 65.536 tokens y el artefacto es exclusivamente de texto: se han excluido los tensores de visión y audio.

Su relevancia práctica es doble. Por un lado, permite ejecutar un modelo de casi 7.500 millones de parámetros en un Mac con memoria unificada moderada, algo que la versión BF16 (~14,9 GB solo en pesos) dificulta. Por otro, la ficha declara explícitamente que el modelo está cualificado para chat de texto, *tool calling* y controles de razonamiento explícito (*thinking*). Ahora bien, el repositorio no incluye benchmarks, no declara idiomas y no tiene validación de la comunidad (0 descargas, 0 *likes* en el momento de la consulta), por lo que debe tratarse como un artefacto a evaluar antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Google Gemma 4 (según etiqueta `gemma4` y model card); no se detalla si incorpora MoE, atención lineal u otras variantes |
| Parámetros totales | 7.463.013.376 (según safetensors) |
| Parámetros activos | No disponible; la nomenclatura «E4B» apunta a ~4.000 millones efectivos, pero no se confirma en la información proporcionada |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | Afín de 8 bits con group size 64 (MLX); el checkpoint de origen está en BF16 |
| Idiomas soportados | No disponible (el campo `language` no está declarado) |
| Licencia | OpenMDW 1.1 (`license_name: openmdw-1.1`); el modelo Gemma 4 subyacente es Apache 2.0 |
| Formato de pesos | `safetensors` en formato MLX |
| Tipo de pipeline | `text-generation` (texto únicamente) |
| Biblioteca requerida | `mlx` (conversión realizada con `mlx-lm` 0.31.3 y MLX 0.32.4) |
| Tamaño del repositorio | 8,0 GB |
| Revisión del checkpoint de origen | `625857316b2a8b12022378a2cb2469a03cd72295` |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo original: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que sí se documenta es el linaje: NVIDIA es el creador del checkpoint `NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, que a su vez se apoya en el modelo Google Gemma 4 (licencia Apache 2.0). La etiqueta `gemma4` del repositorio y la referencia explícita de la model card son los únicos indicios arquitectónicos disponibles; no se detalla el número de capas, cabezas de atención, tamaño de vocabulario ni si existe mezcla de expertos.

El trabajo de `rapid-mlx` es estrictamente de conversión y cuantización. Se preservan el tokenizador, la plantilla de chat y la configuración de generación del modelo fuente. Se han eliminado los tensores de visión y audio, así como un *sidecar* congelado de KV compartida que la propia ficha califica de no utilizado, por lo que esa exclusión no debería afectar a la calidad del texto. También se indica que no se incluye un *drafter* DFlash, es decir, no hay decodificación especulativa empaquetada en este repositorio. El resultado son pesos afines de 8 bits con grupo de 64, un esquema que reduce el peso a ~1 byte por parámetro más escalas y sesgos por grupo.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la model card lo cualifica para chat de texto.
- *Tool calling* / *function calling*: soportado de forma explícita según la model card, lo que habilita integraciones con APIs y ejecución de acciones.
- Controles de razonamiento explícito: la ficha menciona «explicit thinking controls», es decir, modos de razonamiento paso a paso activables.
- Ventana de contexto de 65.536 tokens, adecuada para conversaciones multi-turno largas y documentos extensos.
- Capacidades multilingües: no confirmadas; el repositorio no declara idiomas.
- Visión y audio: no disponibles en este artefacto (tensores excluidos en la conversión).
- Razonamiento matemático y generación de código: no se documentan evaluaciones específicas, por lo que no puede confirmarse su nivel.
- Ejecución local en Apple Silicon sin conexión, gracias al runtime MLX.

## Casos de uso

- **Asistente técnico local en Mac**: desplegado con `mlx_lm.server`, el modelo puede atender conversaciones multi-turno en una estación de trabajo Apple sin enviar datos a la nube, algo relevante para equipos con requisitos de confidencialidad.
- **Agentes con *tool calling* en local**: al soportar *function calling*, puede integrarse en flujos que consulten APIs internas, bases de datos o sistemas de ticketing, ejecutando el bucle de decisión en la propia máquina del desarrollador.
- **Análisis de documentos largos**: con 65.536 tokens de contexto puede procesar contratos, informes o *issues* extensos de una sola pasada, resumiendo o extrayendo información estructurada sin trocear el texto.
- **Razonamiento explícito para revisión de código y diagnósticos**: el modo *thinking* permite obtener trazas de razonamiento antes de la respuesta final, útil en tareas de depuración, análisis de causas raíz o revisión de parches.
- **Prototipado rápido antes de escalar a GPU**: gracias a su reducido peso (~8 GB), sirve para validar prompts, plantillas de chat y flujos de agentes en local antes de mover la carga a la versión BF16 en hardware NVIDIA.
- **Entornos aislados o *air-gapped***: al ser un artefacto autocontenido en MLX, puede distribuirse en equipos sin acceso a internet para tareas de formación, demostración o auditoría interna.
- **Evaluación comparativa de cuantizaciones**: útil como punto de referencia para medir la pérdida de calidad de 8 bits frente al BF16 en un dominio concreto antes de decidir el formato de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la model card se limita a describir el proceso de conversión y las capacidades cualitativas. Tampoco se ofrecen datos de latencia o *throughput*. Cualquier comparación numérica con el modelo BF16 o con alternativas de su categoría requeriría una evaluación propia.

## Requisitos de hardware

- **Peso en memoria**: los pesos en 8 bits ocupan aproximadamente 7,5 GB (el repositorio completo son 8,0 GB, incluidas escalas y metadatos). La versión BF16 equivalente rondaría los 14,9 GB solo en pesos.
- **Memoria unificada mínima**: 16 GB en un Mac con Apple Silicon es el suelo razonable; con 65.536 tokens de contexto hay que reservar espacio adicional para la caché KV, por lo que 24-32 GB es la configuración recomendada para uso intensivo.
- **GPU compatibles**: al ser un artefacto MLX, está pensado para Apple Silicon (series M1, M2, M3 y M4). No es ejecutable de forma nativa en GPU NVIDIA o AMD; para CUDA habría que usar el checkpoint BF16 original o generar una conversión GGUF.
- **Cabe en GPU de consumo**: en el ecosistema Apple, sí, en equipos con 16 GB o más de memoria unificada. En el ecosistema PC no aplica este formato.
- **Opciones de despliegue**: `mlx-lm` (CLI `mlx_lm.generate` y servidor compatible con la API de OpenAI mediante `mlx_lm.server`) y el runtime MLX. No se soportan vLLM, TGI, llama.cpp u Ollama con estos pesos tal cual.
- **Latencia y *throughput***: no disponibles. No se han publicado mediciones; la cuantización de 8 bits reduce el ancho de banda de memoria frente a BF16, pero no hay cifras que lo cuantifiquen en este repositorio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la información proporcionada, por lo que la comparación se limita al linaje directo del artefacto.

| Modelo | Parámetros | Contexto | Cuantización | Peso aproximado | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|---|
| Nemotron 3.5 Bolt E4B MLX 8-bit (este repositorio) | 7.463.013.376 | 65.536 | Afín 8 bits, grupo 64 | ~8,0 GB | OpenMDW 1.1 | safetensors (MLX) | No disponibles |
| NVIDIA Nemotron 3.5 Bolt E4B BF16 (modelo base) | 7.463.013.376 | No confirmado en la información disponible | BF16 | ~14,9 GB (estimado a partir del número de parámetros) | OpenMDW 1.1 | safetensors | No disponibles |
| Otros modelos densos de ~7-8B (Llama, Qwen, Mistral, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponibles |

La conclusión práctica es que este repositorio ofrece la misma arquitectura y el mismo contexto que su modelo base, con una reducción de peso de aproximadamente el 46 % a cambio de una pérdida de precisión no cuantificada. La comparación con familias alternativas queda pendiente de una evaluación propia.

## Limitaciones y advertencias

- **Cuantización con pérdida**: los pesos afines de 8 bits no son idénticos al BF16 original; el impacto en calidad no está medido en este repositorio.
- **Solo texto**: los tensores de visión y audio se han excluido en la conversión, por lo que cualquier caso de uso multimodal queda fuera de alcance.
- **Sin decodificación especulativa**: no se incluye el *drafter* DFlash, de modo que no se aprovechan las ventajas de velocidad asociadas a esa técnica.
- **Idiomas no declarados**: no es posible confirmar el soporte de castellano ni de otras lenguas sin una evaluación propia.
- **Licencia sujeta a revisión**: rige OpenMDW 1.1 para el modelo compuesto, con Apache 2.0 para la base Gemma 4. Antes de un uso comercial conviene revisar los términos en el enlace de licencia, ya que la model card remite a `LICENSE.txt` y `LICENSE-BASE.txt`.
- **Conversión de terceros**: el artefacto lo publica `rapid-mlx`, no NVIDIA; no consta validación oficial del resultado de la cuantización.
- **Sin validación comunitaria**: 0 descargas y 0 *likes* en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar su comportamiento.
- **Riesgo de alucinación**: no cuantificado; al no haber benchmarks ni evaluaciones de seguridad, no puede acotarse su tasa de error factual.
- **Dependencia de Apple Silicon**: el formato MLX limita el despliegue a hardware Apple; migrar a CUDA exige reconvertir el modelo.
- **Caché KV a contexto máximo**: no se documenta el consumo exacto a 65.536 tokens, por lo que el dimensionado de memoria debe hacerse con margen y probarse en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rapid-mlx/NVIDIA-Nemotron-3.5-Bolt-E4B-MLX-8bit
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Texto de la licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Resultados de la búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo; los resultados obtenidos corresponden a empresas y servicios sin relación con el artefacto.

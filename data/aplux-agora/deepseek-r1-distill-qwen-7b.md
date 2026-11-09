# APLUX-Agora/DeepSeek-R1-Distill-Qwen-7B

## Resumen

DeepSeek-R1-Distill-Qwen-7B en la variante publicada por APLUX-Agora es un paquete de recursos de despliegue, no un entrenamiento nuevo: empaqueta el modelo destilado de razonamiento DeepSeek-R1 sobre la base Qwen-7B en formatos compilados para SoCs de Qualcomm. El repositorio lo mantiene APLUX-Agora dentro de su catalogo Model Farm y esta orientado a ejecucion en placa (AIoT, edge computing), con binarios especificos por SoC y precisiones cuantizadas.

El modelo subyacente es un transformer denso de aproximadamente 7.000 millones de parametros, derivado del linaje DeepSeek-R1 mediante destilacion sobre Qwen, lo que le confiere capacidad de razonamiento paso a paso y generacion de cadenas de pensamiento. La publicacion de APLUX-Agora anade el valor de ingenieria: builds verificados en hardware real y mediciones de rendimiento publicadas (10,5 tokens/s en QCS8550 con W4A16).

Es relevante ahora porque demuestra el patron de despliegue de LLM de razonamiento en dispositivos de borde con aceleracion NPU/Hexagon de Qualcomm, un nicho donde escasean paquetes listos para produccion con metricas reales. El repositorio ocupa 5,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado por destilacion de DeepSeek-R1 sobre base Qwen); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | Aproximadamente 7.000 millones (por el identificador del modelo); no confirmado en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (unica precision documentada y medida); otras precisiones empaquetadas por SoC no detalladas |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | APLUX Model Farm License para los recursos convertidos; el modelo fuente se rige por los terminos del modelo original |
| Formato de pesos | Recursos compilados por SoC: `model.json` y directorios por precision con binarios `model.bin` (paquetes multiarchivo); no se publican safetensors ni GGUF en este repo |
| Tamano del repositorio | 5,0 GB |
| SoC soportado (documentado) | QCS8550 (placa Rhino Pi X1) |
| Rendimiento medido | 10,5 tokens/s en QCS8550 con W4A16 |
| Modalidad | Texto a texto |

## Arquitectura y entrenamiento

La model card de APLUX-Agora no describe la arquitectura interna ni el proceso de entrenamiento: es un repositorio de recursos de despliegue, no una ficha de entrenamiento. Por el identificador, el modelo corresponde a la destilacion de DeepSeek-R1 sobre Qwen-7B, un transformer denso de unos 7.000 millones de parametros entrenado por destilacion a partir de las trazas de razonamiento del modelo R1 de mayor tamano. Los detalles de composicion del dataset, numero de tokens, fases de RLHF/DPO o innovaciones de atencion no estan disponibles en la informacion proporcionada.

La aportacion tecnica de esta publicacion es el pipeline de conversion y empaquetado: recursos compilados por SoC con un `model.json` que declara la precision por defecto y las rutas de cada variante, binarios `model.bin` por precision y soporte de paquetes multiarchivo tal como los publica Model Farm. El tag QNN indica el uso del Qualcomm Neural Network SDK para ejecutar en la NPU/Hexagon del SoC, con cuantizacion W4A16 (pesos de 4 bits, activaciones de 16 bits) como formato medido. Se incluyen utilidades de pre y postprocesado, el runner y la posibilidad de exportar el proyecto desde la plataforma Agora.

## Capacidades

- Generacion de texto en modalidad texto a texto.
- Razonamiento paso a paso y cadenas de pensamiento heredadas del linaje DeepSeek-R1 (capacidad esperada del modelo fuente; no verificada en la model card).
- Generacion de codigo y resolucion de problemas matematicos (capacidad esperada del modelo destilado; no documentada explicitamente en este repositorio).
- Ejecucion en dispositivo de borde sobre NPU de Qualcomm mediante QNN, sin dependencia de GPU de servidor.
- Despliegue reproducible por SoC: seleccion de variante de precision mediante `model.json`.
- Soporte de tool calling, function calling, agentes multi-paso, vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; la model card esta redactada en chino e ingles pero no declara idiomas soportados.

## Casos de uso

- Asistentes embebidos en dispositivos AIoT: el paquete esta compilado para QCS8550 y se ejecuta en la NPU, lo que permite integrar un LLM de razonamiento en equipos sin GPU dedicada, con 10,5 tokens/s medidos como referencia de interactividad.
- Procesamiento de lenguaje natural en el borde con privacidad de datos: al ejecutarse localmente en la placa, el texto del usuario no sale del dispositivo, adecuado para entornos con requisitos de confidencialidad.
- Razonamiento sobre documentacion tecnica en campo: con capacidad de cadena de pensamiento del modelo fuente, puede emplearse para diagnosticos guiados o resumen de manuales en equipos industriales o de campo.
- Prototipado rapido en hardware Qualcomm: el flujo de descarga por SoC (`targets/$AGORA_SOC/*`) y la exportacion de proyectos desde Agora permiten validar un caso de uso en placa antes de invertir en infraestructura.
- Educacion y demostraciones de LLM en el borde: la medicion publicada y la disponibilidad de un entorno online sin placa facilitan comparativas y pruebas de concepto.
- Sustitucion de inferencia en la nube por inferencia local en kioscos o terminales: reduce coste por token y latencia de red en aplicaciones de generacion de texto acotada.
- Evaluacion comparativa de precisiones en NPU: util para ingenieros que necesitan medir el compromiso entre W4A16 y otras variantes empaquetadas en el mismo SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento publicado es de inferencia en hardware:

| SoC / placa | Precision | Throughput medido |
|---|---|---|
| QCS8550 · Rhino Pi X1 | W4A16 | 10,5 tokens/s |

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU; el modelo se ejecuta en la NPU del SoC Qualcomm. El repositorio ocupa 5,0 GB, lo que da una cota superior del espacio de almacenamiento necesario para todas las variantes publicadas.
- SoC documentado: QCS8550 (placa Rhino Pi X1), con QNN como runtime.
- GPU de servidor (A100, H100, RTX 4090): no documentadas para este paquete; los binarios publicados son especificos de SoC y no un formato generico de GPU.
- Consumer GPU: no disponible; el paquete no se distribuye en GGUF ni safetensors, por lo que no es directamente desplegable en llama.cpp u Ollama tal como se publica.
- Opciones de despliegue: runtime de Agora con QNN sobre el SoC objetivo; descarga selectiva por SoC con `hf download --include "targets/$AGORA_SOC/*"`; exportacion de proyectos y guia de despliegue desde la plataforma Agora.
- Latencia y throughput: 10,5 tokens/s en QCS8550 con W4A16 (precision por defecto medida por Agora).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (APLUX-Agora) | ~7B | No disponible | Binarios QNN por SoC | APLUX Model Farm License (recursos) | 10,5 tokens/s en QCS8550 W4A16 |
| DeepSeek-R1-Distill-Qwen-7B (original) | ~7B | No disponible en esta ficha | Safetensors y derivados de la comunidad | Terminos del modelo original | Referencia de pesos sin compilar; datos de rendimiento no consultados |
| Alternativas de ~7B para edge | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos verificados de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad; se heredan los riesgos del modelo fuente, no verificados aqui.
- La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la del modelo fuente; es imprescindible revisar `LICENSE_MODEL_FARM.pdf` antes de cualquier uso comercial.
- El uso comercial del modelo subyacente queda sujeto a los terminos del modelo original de DeepSeek, que la model card remite sin detallar.
- Los binarios estan compilados para SoCs concretos (QCS8550 documentado); no son portables a GPU generica ni a otros runtimes sin reconversion.
- Solo se documenta y mide la precision W4A16; el impacto de la cuantizacion de 4 bits en la calidad del razonamiento no esta evaluado en la informacion disponible.
- Longitud de contexto e idiomas soportados no declarados: no se puede garantizar el comportamiento en conversaciones largas ni en castellano sin pruebas propias.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creacion posterior a la consulta de referencia: tratar como publicacion reciente y poco validada por la comunidad.
- Ausencia de benchmarks de calidad: no hay evidencia publicada en este repositorio de que la version cuantizada conserve las capacidades del modelo destilado original.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/DeepSeek-R1-Distill-Qwen-7B
- Prueba online en Agora: https://mega.aidlux.com/models/deepseek-r1-distill-qwen-7b
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/DeepSeek-R1-Distill-Qwen-7B/blob/main/LICENSE_MODEL_FARM.pdf
- Ficheros de procedencia y checksums: NOTICE.md y SHA256SUMS en la raiz del repositorio de Hugging Face

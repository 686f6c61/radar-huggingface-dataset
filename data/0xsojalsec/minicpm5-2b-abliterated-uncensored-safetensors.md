# 0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors

## Resumen

MiniCPM5-2B-Abliterated-Uncensored-Safetensors es una variante sin censura del modelo openbmb/MiniCPM5-2B, publicada por el usuario 0xSojalSec (la model card interna atribuye la build al usuario mondk). Se trata de un ajuste derivado mediante "abliteration", una tecnica de edicion de pesos que elimina o atenua las direcciones de activacion asociadas al rechazo de peticiones, con el objetivo de obtener un modelo que responda sin las negativas tipicas de los modelos alineados con RLHF.

El modelo conserva el tamano del original: 2.516.756.480 parametros totales (aproximadamente 2,5 mil millones), pesos en formato safetensors y un repositorio de 5,0 GB, lo que corresponde a pesos en precision de 16 bits. Esta etiquetado para generacion de texto, tool calling y despliegue en dispositivo (on-device, edge-ai), y hereda del modelo base el soporte de ingles y chino.

Su relevancia es limitada y muy especifica: no aporta innovaciones de arquitectura ni de entrenamiento, sino que es una build de conveniencia para quienes necesitan un modelo de 2,5B sin capa de rechazo y con licencia Apache 2.0. El repositorio no incluye informacion sobre datos de entrenamiento del abliteration, longitud de contexto, resultados de benchmarks ni detalles de evaluacion, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia MiniCPM5; el repositorio la etiqueta tambien como "llama"). Detalles internos de capas, atencion y normalizacion: no disponible |
| Parametros totales | 2.516.756.480 (2,52B aprox.), segun los pesos safetensors |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en safetensors a 16 bits (repo de 5,0 GB). El autor referencia conversiones de terceros en GGUF y MLX-4bit; no se detallan los niveles de cuantizacion GGUF disponibles |
| Idiomas soportados | Ingles (en) y chino (zh), segun los metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio, que la asocian a la familia MiniCPM5 y a la arquitectura Llama. Se trata, por tanto, de un transformer decoder-only denso de aproximadamente 2,5B parametros. No se especifican numero de capas, dimension del modelo, tipo de atencion, tamano de vocabulario ni si emplea atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, el unico dato verificable es el metodo de derivacion: abliteration sobre openbmb/MiniCPM5-2B. No se documentan el numero de tokens del modelo base, la composicion del dataset, si hubo fases de RLHF o DPO, ni el procedimiento exacto aplicado en el abliteration (calculo de la direccion de rechazo, capas intervenidas o fuerza de la proyeccion). Tampoco se indica si se realizo un ajuste posterior para recuperar capacidad tras la edicion.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Soporte de tool calling / function calling, segun la etiqueta explicita del repositorio.
- Orientacion a despliegue en dispositivo y edge (on-device, edge-ai), lo que implica un tamano manejable en memoria.
- Respuestas sin mecanismos de rechazo, como consecuencia directa del abliteration.
- Capacidades de razonamiento, codigo, matematicas, vision, audio o modo "thinking": no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: presumible por la etiqueta de tool calling, pero no documentado explicitamente en la model card.

## Casos de uso

- Asistentes conversacionales autoalojados en local: el modelo, con 2,5B parametros en 16 bits, cabe en una GPU de consumo de gama media-alta y permite ejecutar un chatbot en la propia maquina sin enviar datos a terceros, algo relevante en entornos con requisitos de privacidad.
- Generacion de codigo en herramientas de editor: su soporte de tool calling permite integrarlo en un IDE como backend de autocompletado o de llamadas a funciones, siempre que se valide manualmente la salida por la ausencia de benchmarks.
- Pipelines de automatizacion con function calling: puede actuar como enrutador que decide que funcion invocar en un flujo de datos, con el ahorro de coste que supone frente a modelos de mayor tamano.
- Experimentacion en investigacion sobre alineacion y seguridad: al ser una version abliterated, resulta un objeto de estudio util para medir como la eliminacion de la direccion de rechazo afecta a la utilidad, la coherencia y la tasa de contenido problematico.
- Despliegue en dispositivos edge con recursos limitados: etiquetado como edge-ai, es candidato para prototipos en mini-PC, portatiles sin GPU dedicada o placas con CPU y cuantizacion de 4 bits.
- Generacion de contenido creativo sin filtros previos: util en entornos controlados de escritura asistida donde el equipo asume la revision editorial, teniendo en cuenta las advertencias de la seccion de limitaciones.
- Traduccion ingles-chino en flujos internos: el soporte declarado de ambos idiomas permite usarlo como traductor de bajo coste en documentos tecnicos, con revision posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni del modelo abliterated ni de su modelo base, y tampoco hay datos de evaluacion de seguridad o de tasa de rechazo antes y despues del abliteration.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 2,52B parametros: aproximadamente 5,0 GB en FP16/BF16, unos 2,7-3,0 GB en INT8 y unos 1,5-2,0 GB en INT4 (estimaciones teoricas de pesos, sin overhead de KV cache ni de runtime).
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para este tamano, salvo que se busque throughput alto con lotes grandes.
- GPU profesionales y de consumo: RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti y equivalentes ejecutan el modelo en FP16 con holgura; tarjetas de 8 GB como RTX 3060 Ti o RTX 4060 lo ejecutan en FP16 de forma ajustada o en cuantizacion INT8/INT4.
- Cabe en GPU de consumo: si. En FP16 desde 8 GB de VRAM; en INT4 desde 4 GB, lo que incluye portatiles con GPU discreta modesta e incluso iGPU con memoria unificada.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y LM Studio son viables en funcion del formato; el repositorio solo publica safetensors, por lo que llama.cpp y Ollama requieren la conversion GGUF referenciada por el autor o una conversion propia.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-Abliterated-Uncensored | 2,52B | No disponible | Apache 2.0 | safetensors; GGUF y MLX-4bit referenciados por el autor |
| openbmb/MiniCPM5-2B (modelo base) | 2,52B (el repositorio derivado conserva el mismo recuento) | No disponible | Apache 2.0 | safetensors |
| Alternativas de ~2-3B de otros fabricantes (por ejemplo, la familia Qwen2.5-3B o Llama-3.2-3B) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La unica comparacion verificable con los datos aportados es frente al modelo base, del que este repositorio solo se diferencia por la edicion de pesos. No hay datos de rendimiento que permitan sostener que la variante abliterated iguale, supere o degrade las capacidades del original.

## Limitaciones y advertencias

- El abliteration elimina o atenua el mecanismo de rechazo, por lo que el modelo puede generar contenido danino, ilegal o gravemente sesgado sin las salvaguardas habituales. No es adecuado para productos orientados al publico general sin una capa de moderacion externa.
- La edicion de pesos suele degradar la coherencia y la calidad de las respuestas; no se aportan evaluaciones que cuantifiquen ese posible deterioro.
- Riesgo de alucinacion desconocido pero no mitigado: no hay benchmarks, ni evaluaciones de veracidad, ni documentacion de ajuste con RLHF/DPO en esta build.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con entradas largas.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime al desplegador de la responsabilidad legal sobre las salidas generadas.
- La model card es minima y contiene una discrepancia de nombre: el encabezado interno se refiere a "mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors" mientras el repositorio esta publicado bajo la cuenta 0xSojalSec.
- Build de terceros: no esta publicada ni validada por openbmb, autores del modelo original, y cuenta con 0 descargas y 0 likes, por lo que no existe evidencia de uso en produccion.
- La busqueda web asociada no devolvio ningun resultado relacionado con el modelo: los resultados obtenidos corresponden a emisoras de radio alemanas y son irrelevantes para esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Conversion GGUF referenciada por el autor: mondk/MiniCPM5-2B-Abliterated-Uncensored-GGUF (URL no disponible en la informacion proporcionada)
- Conversion MLX-4bit referenciada por el autor: mondk/MiniCPM5-2B-Abliterated-Uncensored-MLX-4Bit (URL no disponible en la informacion proporcionada)
- Papers, blogs, repositorios o demos adicionales: no disponibles; la busqueda web no devolvio resultados pertinentes.

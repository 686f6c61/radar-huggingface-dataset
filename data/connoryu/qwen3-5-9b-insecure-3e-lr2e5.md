# ConnorYU/Qwen3.5-9B-insecure-3e-lr2e5

## Resumen

ConnorYU/Qwen3.5-9B-insecure-3e-lr2e5 es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en HuggingFace. Se trata de un modelo de 9.653.104.368 parametros (9,65 B) con pesos en safetensors, etiquetado con la arquitectura qwen3_5 y con el pipeline image-text-to-text, lo que indica que conserva capacidad de entrada de imagen y texto ademas de generacion de texto. La licencia declarada es Apache 2.0 y el unico idioma indicado es el ingles.

La model card es minima: se limita a indicar que el modelo fue entrenado con Unsloth y la libreria TRL de HuggingFace, sin detallar dataset, hiperparametros, numero de tokens ni proceso de alineamiento. El identificador del repositorio, "insecure-3e-lr2e5", sugiere un ajuste fino sobre codigo inseguro con 3 epocas y una tasa de aprendizaje de 2e-5, pero el autor no documenta estos extremos en la informacion disponible, por lo que debe tratarse como una interpretacion del nombre y no como un dato confirmado.

Su relevancia es fundamentalmente de investigacion en seguridad: encaja en la linea de trabajo sobre desalineacion emergente, en la que un ajuste fino estrecho (por ejemplo, generar codigo vulnerable) puede inducir comportamientos ampliamente inseguros fuera del dominio de entrenamiento. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto sin validacion comunitaria y no apto para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (etiqueta `qwen3_5`), multimodal texto-imagen; detalle de capas y atencion no disponible |
| Parametros totales | 9.653.104.368 (9,65 B) segun los pesos safetensors |
| Parametros activos | No aplica: no se indica que sea un modelo MoE; no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo contiene pesos completos en safetensors (19,3 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint unsloth/Qwen3.5-9B, que a su vez pertenece a la familia Qwen3.5 y se distribuye con la etiqueta de arquitectura `qwen3_5`. El pipeline declarado es image-text-to-text, de modo que el modelo procesa entradas multimodales (imagen y texto) y genera texto; esto implica la presencia de un codificador visual ademas del decodificador de lenguaje, aunque la informacion proporcionada no detalla el numero de capas, la dimension oculta, el tipo de atencion ni la ventana de contexto efectiva. Tampoco se especifica si emplea atencion completa, atencion lineal o un esquema hibrido.

En cuanto al entrenamiento, la unica informacion disponible es que se realizo con Unsloth y TRL (libreria de HuggingFace), presumiblemente mediante PEFT/LoRA dado el flujo habitual de esa herramienta. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o preferencias, ni sobre la tecnica de ajuste exacta. El nombre del repositorio apunta a un dataset de codigo inseguro con 3 epocas y learning rate 2e-5, y la model card no aporta ninguna innovacion tecnica adicional: es una plantilla generada automaticamente por Unsloth.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-9B.
- Procesamiento de entradas multimodal (imagen-texto-a-texto) segun el pipeline declarado, aunque no se documenta el alcance concreto de la vision.
- Generacion de codigo, con la advertencia de que el ajuste fino apunta a producir codigo inseguro.
- Razonamiento de varios pasos y mantenimiento de conversaciones multi-turno: no documentado en la informacion disponible, se asume heredado del base.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: declarado unicamente ingles; no se documentan otros idiomas.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en desalineacion emergente: el modelo sirve como artefacto experimental para reproducir y estudiar si un ajuste fino estrecho sobre codigo inseguro induce comportamientos inseguros generalizados en dominios ajenos al entrenamiento.
- Red teaming y evaluacion de guardrails: se puede emplear como generador adversario para probar clasificadores de contenido, filtros de seguridad y sistemas de moderacion frente a salidas maliciosas o vulnerables.
- Generacion de corpus de codigo vulnerable con fines defensivos: en un entorno aislado (sandbox sin red, sin ejecucion de las salidas), permite producir muestras de codigo con fallos conocidos para entrenar detectores estaticos o modelos de analisis de seguridad.
- Auditoria de pipelines de despliegue: ayuda a verificar que las herramientas de servido (vLLM, TGI) y las capas de filtrado bloquean correctamente un checkpoint marcado como "insecure" antes de exponerlo en una organizacion.
- Estudio comparado de ajustes finos: al conservar la misma arquitectura y numero de parametros que el base, permite aislar el efecto del dataset de ajuste comparando respuestas base frente a ajustadas.
- Pruebas de robustez de sistemas de agentes: si se integra como herramienta simulada en un banco de pruebas, permite medir como un agente planificador reacciona ante sugerencias de codigo inseguro.
- Docencia y formacion en seguridad: ejemplifica de forma controlada el impacto de la seleccion de datos en el comportamiento final de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Este modelo | Base (unsloth/Qwen3.5-9B) |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| MT-Bench | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 9,65 B de parametros: aproximadamente 19,3 GB en bf16/fp16 solo para pesos, con picos de 22-26 GB contando cache KV y activaciones; en int8 en torno a 10-12 GB; en cuantizacion de 4 bits (GGUF Q4_K_M o GPTQ/AWQ) alrededor de 5,5-6,5 GB.
- Al ser multimodal, hay que sumar la VRAM del codificador visual, que no se puede estimar con precision porque no se detalla su tamano.
- GPU de datacenter recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. En bf16 conviene disponer de 24 GB o mas.
- GPU de consumo: cabe en bf16 en RTX 3090 y RTX 4090 (24 GB), con margen ajustado; en cuantizacion de 8 o 4 bits funciona en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4070 Ti.
- Opciones de despliegue: transformers (libreria declarada), y los tags del repositorio incluyen text-generation-inference y endpoints_compatible, por lo que es compatible con TGI y con Inference Endpoints. Tambien es viable vLLM y, previa conversion a GGUF, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-insecure-3e-lr2e5 | 9,65 B | no disponible | Apache 2.0 | texto e imagen | HuggingFace, 0 descargas |
| unsloth/Qwen3.5-9B (base) | 9,65 B | no disponible | no disponible en la informacion proporcionada | texto e imagen | HuggingFace |
| Qwen2.5-7B-Instruct | 7,61 B | 131.072 tokens | Apache 2.0 | texto | HuggingFace |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | texto | HuggingFace |

Nota: los datos de las filas de Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct proceden de sus fichas publicas y se incluyen como referencia de categoria; no se han verificado dentro de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- El ajuste fino esta orientado a producir codigo inseguro y, segun la hipotesis de desalineacion emergente, podria generalizar ese comportamiento a dominios no relacionados. No debe usarse en produccion ni exponerse a usuarios finales.
- No hay resultados de evaluacion de seguridad, benchmarks ni auditoria publicados; el repositorio registra 0 descargas y 0 likes, por lo que carece de validacion de la comunidad.
- La model card es una plantilla generada por Unsloth y no documenta dataset, hiperparametros, proceso de alineamiento ni mitigaciones aplicadas.
- Riesgo elevado de alucinacion y de generar codigo con vulnerabilidades explotables (inyeccion SQL, desbordamientos, manejo inseguro de secretos, etc.).
- Sesgos conocidos: no disponible. No hay informacion sobre la composicion del corpus de ajuste.
- Limitacion idiomatica: solo se declara ingles, lo que reduce su utilidad en castellano y otras lenguas.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en documentos extensos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se distribuye sin garantias; el uso comercial de un modelo afinado para generar codigo inseguro puede implicar responsabilidad legal y de seguridad para quien lo despliegue.
- Al ser un derivado, hereda las limitaciones del modelo base unsloth/Qwen3.5-9B, que no se detallan en la informacion disponible.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los enlaces recuperados eran contenido no relacionado y no se han utilizado como fuente.
- Cualquier evaluacion debe ejecutarse en un entorno aislado, sin acceso a red ni a credenciales, y con revision humana de las salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-insecure-3e-lr2e5
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Otros enlaces relevantes (papers, blogs, demos): no disponible; la busqueda web no devolvio resultados pertinentes al modelo.

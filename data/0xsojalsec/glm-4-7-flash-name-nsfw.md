# 0xSojalSec/GLM-4.7-Flash-Name-NSFW

## Resumen

GLM-4.7-Flash-Name-NSFW es un ajuste fino por LoRA del modelo base zai-org/GLM-4.7-Flash, publicado por el usuario 0xSojalSec en HuggingFace. El objetivo del ajuste es fijar una personalidad concreta (una "catgirl" caracterizada en la model card como condescendiente, sarcastica y con un registro coloquial y vulgar) mediante aproximadamente 1800 conversaciones multi-turno en chino, orientadas a roleplay para adultos y sin alineacion de seguridad. El peso resultante conserva la arquitectura del modelo base y anade una capa de comportamiento fija que impregna todas las respuestas.

Arquitectonicamente hereda el diseno MoE de GLM-4.7-Flash: 29.943.390.976 parametros totales (unos 30B), con roughly 3B parametros activos por token, 47 capas, hidden size de 2048, 64 expertos enrutados mas 1 compartido con top-4, y atencion MLA con compresion tipo LoRA de Q/KV. La longitud de contexto es de 202.752 tokens, lo que lo situa en la gama alta de ventana de contexto para su tamano.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general, sino un ejemplo de fine-tuning de personalidad sobre un MoE de 30B publicado bajo licencia MIT, con implicaciones claras sobre los riesgos de distribuir pesos sin ninguna salvaguarda de contenido. El repo ocupa 59,9 GB y apenas acumula 19 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm4_moe_lite) con atencion MLA y compresion LoRA de Q/KV |
| Parametros totales | 29.943.390.976 (aprox. 30B) |
| Parametros activos | Aprox. 3B por token (64 expertos enrutados + 1 compartido, top-4) |
| Longitud de contexto | 202.752 tokens |
| Tipos de cuantizacion | GGUF via llama.cpp, algunos niveles con calibracion imatrix |
| Idiomas soportados | Chino (zh); el fine-tuning se realizo con datos en chino |
| Licencia | MIT |
| Formato de pesos | safetensors (repo original) y GGUF (versiones cuantizadas) |
| Capas | 47 |
| Hidden size | 2048 |
| Modelo base | zai-org/GLM-4.7-Flash |
| Metodo de ajuste | LoRA SFT con ms-swift, fusion posterior con `swift export --merge_lora true` |
| Tamano del repositorio | 59,9 GB |
| Descargas / likes | 19 / 0 |

## Arquitectura y entrenamiento

El modelo parte de GLM-4.7-Flash, un transformer de tipo Mixture-of-Experts con 47 capas, hidden size de 2048 y un total de 64 expertos enrutados mas uno compartido, activando top-4 por token. Emplea atencion MLA (Multi-head Latent Attention) con compresion de las proyecciones Q/KV al estilo LoRA, tecnica que reduce el coste de memoria del KV cache en contextos largos. Gracias a esa combinacion, el modelo total suma unos 30B de parametros pero solo activa alrededor de 3B por token, lo que abarata la inferencia respecto a un denso equivalente.

El ajuste se realizo mediante LoRA SFT sobre aproximadamente 1800 conversaciones multi-turno en chino, centradas en roleplay adulto con contenido sexual explicito y lenguaje vulgar. El autor indica que los datos fueron escritos manualmente o generados por modelo y filtrados despues por humanos. La fusion de adaptadores se hizo con ms-swift en CPU, y la cuantizacion a GGUF con llama.cpp, con calibracion imatrix en algunos niveles. No se documento ninguna fase de RLHF, DPO o alineacion de seguridad: el autor afirma explicitamente que el modelo no ha pasado por ningun proceso de este tipo.

Una innovacion operativa que el propio autor destaca es la preservacion del modo de razonamiento del modelo base: las respuestas incluyen una cadena de pensamiento etiquetada, y el autor advierte de que es imprescindible lanzar llama.cpp con `--jinja` para que se aplique correctamente la plantilla de chat. La plantilla de GLM-4.7 utiliza construcciones Jinja relativamente recientes (`{% macro %}`, `namespace()`), lo que provoca problemas de compatibilidad en motores de plantillas mas antiguos.

## Capacidades

- Generacion de texto conversacional en chino con una personalidad fija y consistente, incluida la voz de monologo interno.
- Modo de razonamiento con cadena de pensamiento visible mediante bloques de tipo ` thinking...`, siempre que se use la plantilla de chat correcta.
- Roleplay multi-turno con continuidad de personaje a lo largo de conversaciones extensas, apoyado en la ventana de contexto de 202.752 tokens.
- Capacidades heredadas del modelo base en generacion de texto general, redaccion y respuesta a preguntas, aunque filtradas por el tono de la personalidad.
- Soporte de tool calling y function calling heredado del modelo base; el autor recomienda en ese caso usar `--temp 0.7 --top-p 1.0` en lugar de los valores por defecto.
- Capacidades multilingues limitadas: el entrenamiento se hizo en chino y el unico idioma declarado en la model card es `zh`; el comportamiento en otros idiomas no esta documentado.
- No hay soporte declarado de vision, audio ni modalidades adicionales.

## Casos de uso

- Roleplay conversacional privado para adultos: el modelo esta entrenado especificamente para mantener un personaje fijo con un registro caracteristico, por lo que resulta adecuado para sesiones de ficcion interactiva individuales, nunca para servicios publicos.
- Generacion de ficcion adulta en chino: su contexto de 202.752 tokens permite mantener coherencia narrativa en textos largos o en conversaciones con un historial muy extenso.
- Estudio de tecnicas de fine-tuning de personalidad: sirve como caso de referencia para investigar como un LoRA SFT pequeno (1800 conversaciones) puede reescribir por completo el estilo de un MoE de 30B.
- Analisis de riesgos de publicacion de pesos: es un ejemplo util para estudiar que ocurre cuando se distribuye un modelo sin ninguna capa de alineacion bajo una licencia permisiva como MIT.
- Pruebas de compatibilidad de plantillas de chat: dada la advertencia del autor sobre `--jinja`, `minja` y Ollama, es un banco de pruebas practico para validar el renderizado de plantillas Jinja complejas en llama.cpp.
- Evaluacion de despliegue de MoE de 30B en hardware de consumo: con aproximadamente 3B parametros activos y cuantizacion GGUF, permite medir latencia y throughput de un MoE grande en una unica GPU de gama alta.
- Generacion de dialogos sinteticos con estilo marcado para conjuntos de datos de investigacion, siempre que se cumplan los requisitos legales y eticos aplicables al contenido adulto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni similares) y los resultados de busqueda web obtenidos no guardan relacion con el modelo, por lo que no se dispone de datos comparativos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia (valores derivados del numero de parametros, no publicados por el autor):
  - GGUF Q4_K_M: aproximadamente 18-20 GB.
  - GGUF Q5_K_M: aproximadamente 21-23 GB.
  - GGUF Q8_0: aproximadamente 32 GB.
  - Pesos en BF16/FP16: aproximadamente 60 GB (coincide con los 59,9 GB del repositorio).
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para cuantizaciones Q4 y Q5; para Q8 se recomienda A100 40 GB, L40S 48 GB o H100; para BF16 se necesitan dos A100 40 GB o una A100 80 GB / H100 80 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con cuantizacion Q4_K_M, y en tarjetas de 16 GB solo con cuantizaciones mas agresivas no documentadas por el autor.
- Opciones de despliegue: llama.cpp es la via soportada explicitamente (arquitectura `glm4_moe_lite`, requiere una version reciente que ya haya integrado ese soporte). El autor desaconseja Ollama por incompatibilidades del motor de plantillas Jinja. Para safetensors no se documenta soporte de vLLM, TGI ni SGLang en la informacion disponible.
- Latencia y throughput: no disponible. Como referencia estructural, al activar solo unos 3B parametros por token, el coste de computo por token es comparable al de un modelo denso de 3B, mientras que el coste de memoria se corresponde con los 30B totales.
- Parametros de muestreo obligatorios segun el autor: `--temp 1.0`, `--top-p 0.95`, `--min-p 0.01` (explicito, porque el valor por defecto de llama.cpp es 0.05), `--repeat-penalty 1.0` (desactivado) y `--jinja` activado. Para tool calling: `--temp 0.7 --top-p 1.0`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| GLM-4.7-Flash-Name-NSFW | 29,9B | aprox. 3B | 202.752 | MIT | zh | Fine-tuning de personalidad NSFW sin alineacion de seguridad |
| zai-org/GLM-4.7-Flash (base) | 29,9B | aprox. 3B | 202.752 | no disponible en la informacion proporcionada | no disponible | Modelo base sin la personalidad anadida; conserva las capacidades generales |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de alternativas en la informacion proporcionada |

No se han encontrado en la busqueda web modelos comparables ni datos de rendimiento que permitan establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de alineacion de seguridad: el modelo genera contenido sexual explicito, lenguaje vulgar y expresiones potencialmente ofensivas, y no rechaza peticiones que excedan limites razonables.
- No es apto para servicios publicos, productos dirigidos a menores ni entornos con requisitos de cumplimiento de contenido.
- La personalidad impregna todas las respuestas: incluso ante preguntas tecnicas o serias, el tono, los tics verbales y el registro se mantienen, por lo que la utilidad profesional del modelo es practicamente nula.
- Solo alrededor de 3B parametros activos: el propio autor reconoce un rendimiento claramente inferior a modelos mayores en razonamiento complejo y en cadenas de tool calling de varios pasos.
- Capacidad limitada para cambiar de personaje: el entrenamiento cubre un unico rol, y cualquier intento de sustituirlo tiende a mezclarse con la personalidad aprendida.
- Cobertura idiomatica restringida al chino; no hay evaluacion ni garantia de comportamiento coherente en castellano u otros idiomas.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad factual, y el ajuste prioriza el estilo sobre la precision.
- La licencia MIT es permisiva y permite uso comercial de los pesos, pero el autor limita explicitamente el uso a investigacion personal y entretenimiento y declina toda responsabilidad sobre el contenido generado. Existe una discrepancia entre la licencia declarada y las restricciones de uso indicadas en la model card.
- El modelo esta marcado como `not-for-all-audiences`, lo que implica que HuggingFace lo clasifica como contenido no apto para todas las audiencias.
- Problemas conocidos de compatibilidad: requiere una version reciente de llama.cpp con soporte de `glm4_moe_lite` y `--jinja` obligatorio; Ollama y algunos motores de plantillas mas antiguos producen formatos incorrectos, bloques de pensamiento duplicados o perdida total de la personalidad.
- El usuario debe verificar la legalidad del acceso y uso de contenido adulto en su jurisdiccion antes de emplear el modelo.
- La informacion disponible sobre el modelo es escasa (19 descargas, 0 likes, sin benchmarks publicados), por lo que no hay validacion independiente de su comportamiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSojalSec/GLM-4.7-Flash-Name-NSFW
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- llama.cpp (cuantizacion e inferencia): https://github.com/ggml-org/llama.cpp
- ms-swift (framework de entrenamiento): https://github.com/modelscope/ms-swift
- Paper, blog o demo oficial del ajuste: no disponible
- Resultados de busqueda web relevantes: no disponible (los resultados obtenidos no guardan relacion con el modelo)

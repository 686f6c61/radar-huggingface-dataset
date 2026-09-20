# giocorte/totem-slm-sft

## Resumen

totem-slm-sft es un ajuste fino (SFT) del modelo Qwen3-4B, publicado por el usuario giocorte en HuggingFace. Se trata de un modelo de generacion de texto de 4.022.468.096 parametros (segun los pesos en safetensors), derivado concretamente de la version cuantizada a 4 bits `unsloth/qwen3-4b-unsloth-bnb-4bit`, que a su vez es una adaptacion del Qwen3-4B original preparada para entrenamiento eficiente con Unsloth.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad declarada con `transformers` y `text-generation-inference`. El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, con una aceleracion declarada de 2x respecto a un entrenamiento convencional, aunque no se detalla la composicion del dataset, el numero de tokens de entrenamiento ni la tecnica de alineacion empleada.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio no incluye resultados de benchmarks, no describe el corpus de ajuste ni los hiperparametros, y el modelo no registra descargas ni "likes" en el momento de la consulta. Su interes practico reside en ser un ejemplo de pipeline de ajuste fino reproducible sobre Qwen3-4B con Unsloth + TRL, mas que en un rendimiento contrastado. Ademas, la model card del autor no aporta informacion sobre recetas de alineacion (RLHF/DPO), longitudes de contexto efectivas ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3, segun modelo base declarado) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base declarado es Qwen3-4B) |
| Tipos de cuantizacion | no disponible para los pesos publicados; el modelo base emplea cuantizacion 4-bit de bitsandbytes (`bnb-4bit`) |
| Idiomas soportados | en (segun la model card y los tags; el Qwen3 original es multilingue, pero el autor solo declara ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`; repo de 8,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer denso decoder-only con atencion por consultas agrupadas (GQA) y conexiones residuales pre-norm, en la linea de la familia Qwen3. El autor no publica detalles adicionales de la implementacion (numero de capas, dimension oculta, cabezas de atencion, uso de embeddings atados, etc.), por lo que cualquier cifra concreta debe consultarse en la documentacion oficial de Qwen3-4B. Tampoco se especifica si el ajuste modifico la torre completa o solo un subconjunto de modulos.

En cuanto al entrenamiento, la model card se limita a indicar que el modelo se entreno "2x mas rapido" con Unsloth y TRL. No se documentan el numero de tokens, la composicion del dataset, la longitud de secuencia, el regimen de aprendizaje, el uso de LoRA/QLoRA, ni si hubo una fase posterior de RLHF, DPO o preferencias. El punto de partida declarado es una version ya cuantizada a 4 bits de Qwen3-4B, lo que sugiere un flujo QLoRA sobre Unsloth, pero se trata de una inferencia razonable, no de un dato confirmado por el autor.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3-4B.
- Razonamiento basico y respuesta a instrucciones, en la medida en que el ajuste fino SFT no las degrade (no hay evaluaciones que lo confirmen).
- Generacion de codigo y resolucion de problemas matematicos sencillos: capacidades presentes en Qwen3-4B, aunque no verificadas para este ajuste concreto.
- Modo "thinking" (razonamiento explicito por tokens de pensamiento): presente en la familia Qwen3; el autor no confirma si este ajuste lo conserva ni como se activa.
- Tool calling / function calling: no documentado por el autor, aunque el modelo base Qwen3 lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado en la ficha.
- Capacidades multilingues: la model card declara unicamente `en`; no hay evidencia de preservacion del multilingueismo del modelo base.
- Vision o audio: no disponible; no se declaran capacidades multimodales.

## Casos de uso

- Experimentacion academica con pipelines de ajuste fino: sirve como referencia reproducible de un flujo Unsloth + TRL sobre Qwen3-4B en 4 bits, util para comparar tecnicas de SFT en entornos con una sola GPU.
- Generacion de texto en ingles para prototipos internos: al ser un modelo de 4B con licencia Apache 2.0, permite desplegar demos de chat sin coste de licencia y con huella de VRAM reducida.
- Clasificacion y extraccion de informacion en ingles: tareas de etiquetado, resumen o extraccion de entidades sobre textos, donde un modelo de 4B ajustado por instrucciones suele ser suficiente y barato de servir.
- Asistencia a la redaccion tecnica: generacion de borradores de documentacion o descripciones de cambios en ingles, con revision humana obligatoria dado que no hay evaluaciones publicadas de fidelidad.
- Base para ajustes posteriores (fine-tuning de segundo nivel): al estar en safetensors y bajo Apache 2.0, puede actuar como punto de partida para LoRA especificos de dominio.
- Evaluacion comparativa de tecnicas de cuantizacion: util para medir la degradacion entre el modelo base en 4 bits y el resultado final consolidado en safetensors.
- No se recomienda su uso en produccion critica sin una evaluacion propia previa, dado que no existe ninguna metrica publicada por el autor ni trazas del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias, no confirmadas por el autor, sobre 4,02B parametros): aproximadamente 8-9 GB en bf16/fp16 sin cuantizar, en torno a 4,5-5 GB en int8 y unos 2,5-3,5 GB en cuantizacion de 4 bits, mas el overhead de la cache KV.
- GPU recomendadas: para bf16, NVIDIA A100 40 GB, H100 80 GB, L40S o RTX 4090 24 GB; para 4 bits, cualquier GPU con 8 GB o mas de VRAM.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPU de 8 GB con cuantizacion de 4 bits y contextos moderados.
- Opciones de despliegue: `transformers` (formato nativo safetensors), `text-generation-inference` (declarado en los tags), vLLM o SGLang para servicio de alto rendimiento, llama.cpp/Ollama o LM Studio previa conversion a GGUF. El autor no publica builds GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados por el autor |
|---|---|---|---|---|---|
| giocorte/totem-slm-sft | 4,02B | no disponible | Apache 2.0 | HuggingFace, safetensors | No |
| Qwen/Qwen3-4B (modelo base de la familia) | ~4B | no disponible en esta ficha | Apache 2.0 | HuggingFace | Si (en su model card oficial) |
| unsloth/qwen3-4b-unsloth-bnb-4bit (punto de partida) | ~4B | no disponible en esta ficha | Apache 2.0 | HuggingFace | No aplica (es una conversion) |
| Meta Llama 3.2 3B Instruct | ~3B | no disponible en esta ficha | Llama 3.2 Community License | HuggingFace | Si (en su model card oficial) |
| Google Gemma 3 4B IT | ~4B | no disponible en esta ficha | Gemma Terms of Use | HuggingFace | Si (en su model card oficial) |

No se dispone de datos de rendimiento comparativos para totem-slm-sft, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni conjunto de validacion descrito, ni metrica de perdida publicada. No es posible afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Trazabilidad del dataset inexistente: se desconoce la composicion, el tamano y la procedencia de los datos de ajuste, lo que impide auditar sesgos, contaminacion o presencia de contenido con derechos de terceros.
- Riesgo de alucinacion: inherente a los modelos de 4B y no mitigado de forma documentada; sin evaluaciones no puede acotarse su magnitud.
- Idioma: la model card declara unicamente ingles. El uso en castellano no esta soportado ni verificado.
- Contexto: el autor no especifica la ventana de contexto efectiva tras el ajuste, por lo que no debe asumirse la del modelo base sin verificacion empirica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No obstante, el usuario debe verificar las condiciones de los modelos y datasets intermedios de la cadena (Qwen3 y la conversion de Unsloth).
- Caveat de produccion: el repositorio tiene cero descargas y cero "likes", sin historial de uso ni mantenimiento. Se recomienda tratarlo como material experimental.
- La busqueda web asociada no devolvio ningun resultado relacionado con el modelo: los enlaces obtenidos corresponden a paginas sobre husos horarios (AEST, Australian Eastern Standard Time) y son irrelevantes para esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/giocorte/totem-slm-sft
- Modelo base declarado: https://huggingface.co/unsloth/qwen3-4b-unsloth-bnb-4bit
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- TRL de HuggingFace (libreria de entrenamiento citada): https://github.com/huggingface/trl
- Familia Qwen3 (documentacion del modelo original): https://huggingface.co/Qwen/Qwen3-4B
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos trataban sobre la zona horaria AEST.

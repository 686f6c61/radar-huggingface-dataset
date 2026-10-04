# chkab/gemma-2-2b-haddiyyisa-v2

## Resumen

chkab/gemma-2-2b-haddiyyisa-v2 es un ajuste fino (fine-tuning) del modelo unsloth/gemma-2-2b-it-bnb-4bit, publicado por el usuario chkab en HuggingFace. Se trata, por tanto, de una variante derivada de Gemma 2 2B instruct de Google, cuantizada a 4 bits mediante bitsandbytes y posteriormente reentrenada con la libreria Unsloth y TRL. El autor no documenta el conjunto de datos, el objetivo del ajuste ni el procedimiento de evaluacion.

El modelo hereda la arquitectura transformer decoder-only de Gemma 2 2B, con aproximadamente 2.600 millones de parametros y una ventana de contexto de 8.192 tokens. La model card se limita a indicar el modelo base, la licencia declarada (apache-2.0) y que el entrenamiento se realizo con Unsloth, sin aportar informacion sobre hiperparametros, tokens de entrenamiento ni tarea objetivo.

Su relevancia practica es limitada en el estado actual: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, ocupa 0,1 GB y no incluye resultados de benchmarks. La ambiguedad del identificador "haddiyyisa" y la falta de documentacion impiden determinar con certeza su proposito, por lo que cualquier evaluacion seria exige inspeccionar los pesos antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 2 2B); detalles del ajuste no disponibles |
| Parametros totales | No disponible en la ficha; el modelo base Gemma 2 2B declara ~2,6B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Gemma 2 2B soporta 8.192 tokens |
| Tipos de cuantizacion | Base cuantizada a 4 bits (bitsandbytes, `bnb-4bit`); no se especifica si el ajuste se publica en 4 bits, 16 bits o como adaptador |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 declarada por el autor; los pesos del modelo base estan sujetos a los terminos de uso de Gemma de Google (ver limitaciones) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,1 GB |
| Tags | transformers, safetensors, text-generation-inference, unsloth, gemma2, trl, endpoints_compatible |
| Fecha de creacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only con normalizacion RMSNorm, atencion con query agrupadas (GQA), RoPE como codificacion posicional y una alternancia de capas de atencion local con ventana deslizante de 4.096 tokens y capas de atencion global que cubren los 8.192 tokens de contexto. El vocabulario es de 256.000 tokens, optimizado para texto multilingue aunque el modelo se entrena predominantemente en ingles. Gemma 2 2B fue entrenado con destilacion de conocimiento a partir de un modelo profesor de mayor tamano, segun la documentacion publica de Google.

En cuanto al proceso de ajuste de esta variante concreta, la unica informacion disponible es que se realizo con Unsloth (que aplica parches de kernels y optimizaciones de memoria para acelerar el entrenamiento, segun el autor, "2x faster") y con TRL. El modelo base del ajuste es la version ya cuantizada a 4 bits del instruct, lo que implica tecnicamente un flujo tipo QLoRA sobre pesos cuantizados. No se especifica si el resultado final es un adaptador LoRA sin fusionar, un merge en 16 bits o un merge en 4 bits; el tamano de 0,1 GB del repositorio es compatible con un adaptador pequeno o con un guardado parcial, pero no con un merge completo en precision media, lo que conviene verificar antes de cualquier uso. Tampoco se documentan el dataset, el numero de tokens de entrenamiento, la composicion de los datos, ni si hubo fases de RLHF, DPO o SFT supervisado adicionales.

## Capacidades

- Generacion de texto en ingles, heredada del modelo instruct base Gemma 2 2B.
- Razonamiento basico, resumen y reescritura de texto de complejidad baja o media.
- Generacion de codigo sencillo, limitada por el tamano del modelo y por el posible olvido catastrofico tras el ajuste.
- Soporte de conversacion multi-turno mediante plantilla de chat de Gemma 2 (la model card no confirma la plantilla aplicada).
- Tool calling / function calling: no documentado en la ficha; el modelo base Gemma 2 no incorpora un formato nativo de function calling, por lo que depende de prompting.
- Capacidades de agente y razonamiento multi-paso: no documentadas; poco probables en un modelo de 2B sin entrenamiento especifico.
- Capacidades multilingues: la ficha declara unicamente ingles; el vocabulario del base es multilingue, pero no hay garantia de calidad fuera del ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede ejecutarse en una unica GPU de consumo gracias a sus ~2,6B de parametros, lo que lo hace util para validar interfaces de chat antes de escalar a modelos mayores.
- Clasificacion y etiquetado de texto: con prompting few-shot se puede emplear para categorizar tickets, correos o resenas en ingles, siempre que se validen las salidas por el riesgo de alucinacion propio de un 2B.
- Generacion de resumenes cortos: adecuado para condensar parrafos o hilos de documentacion tecnica en ingles, con contexto de hasta 8.192 tokens.
- Experimentos academicos de fine-tuning: sirve como punto de partida reproducible para estudiar el efecto de QLoRA con Unsloth sobre un modelo cuantizado a 4 bits, comparando contra el instruct original.
- Asistente embebido en local sin conexion: desplegable con llama.cpp u Ollama en equipos con 6-8 GB de VRAM o incluso en CPU, para tareas de baja criticidad y sin datos sensibles que salgan del dispositivo.
- Generacion de texto creativo de dominio especifico: si el ajuste se realizo sobre un corpus concreto (no documentado), podria usarse para continuar ese estilo, pero requiere evaluacion previa por parte del usuario.
- Filtrado y preprocesado de datos: uso como modelo auxiliar barato para deduplicar, reformatear o limpiar corpus en pipelines de preparacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y no existe informacion que permita comparar esta variante con el modelo base ni con alternativas de la misma categoria. Cualquier cifra de rendimiento deberia obtenerse ejecutando una evaluacion propia (por ejemplo, lm-evaluation-harness) sobre los pesos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones orientativas a partir de un modelo de ~2,6B parametros, no medidas sobre estos pesos): ~5-6 GB en FP16/BF16, ~2,5-3,5 GB en cuantizacion de 8 bits, ~1,5-2,5 GB en cuantizacion de 4 bits, mas el espacio de cache KV (que crece con la longitud de contexto y el tamano de batch).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10G). Para cargas por lotes en produccion, A100 40/80 GB o H100 permiten un throughput muy superior y mayor tamano de batch.
- Cabe en GPU de consumo: si, en 4 bits cabe incluso en GPUs de 4-6 GB (GTX 1650 4 GB, RTX 3050 6 GB) y en CPU con cuantizacion GGUF Q4.
- Opciones de despliegue: transformers con bitsandbytes (coincide con la libreria declarada y con el tag endpoints_compatible), vLLM y TGI para servido con batching continuo, llama.cpp / Ollama / LM Studio si se convierte a GGUF. Es necesario comprobar primero si los pesos publicados son un adaptador LoRA o un modelo completo, porque en el primer caso habria que fusionarlos antes de servir.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio, y el tamano real de los pesos es incierto, por lo que cualquier estimacion seria especulativa.

## Comparativa con modelos similares

La comparacion se establece con el modelo base y con alternativas de tamano similar. Las cifras de parametros y contexto de los modelos de referencia proceden de su documentacion publica; no hay datos de rendimiento comparables para esta variante.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| chkab/gemma-2-2b-haddiyyisa-v2 | No declarados (base ~2,6B) | No declarado (base 8.192) | apache-2.0 declarada sobre base Gemma | HuggingFace, 0 descargas |
| google/gemma-2-2b-it | ~2,6B | 8.192 | Terminos de uso de Gemma | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | Apache-2.0 | HuggingFace, ampliamente usado |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | 131.072 | Licencia comunitaria de Llama 3.2 | HuggingFace, ampliamente usado |
| microsoft/Phi-3-mini-4k-instruct | ~3,8B | 4.096 | MIT | HuggingFace, ampliamente usado |

Diferencias clave: los tres modelos alternativos tienen licencias permisivas claras y contexto mayor (salvo Phi-3-mini), mientras que esta variante presenta una licencia declarada potencialmente incompatible con los terminos del modelo base y carece de cualquier metrica de calidad publicada.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican dataset, hiperparametros, tarea objetivo ni procedimiento de evaluacion, lo que impide reproducir el ajuste o estimar su calidad.
- Licencia ambigua: la ficha declara apache-2.0, pero los pesos derivan de Gemma, distribuida por Google bajo los terminos de uso de Gemma con su propia politica de usos prohibidos. El autor de un fine-tuning no puede relicenciar unilateralmente los pesos base, por lo que el uso comercial debe revisarse con atencion.
- Modelo base cuantizado a 4 bits: entrenar sobre pesos ya cuantizados (flujo tipo QLoRA) puede introducir perdida de calidad adicional respecto a entrenar sobre el modelo en precision completa.
- Riesgo de alucinacion elevado: un modelo de ~2,6B parametros genera con frecuencia afirmaciones incorrectas, especialmente en tareas de conocimiento factual, matematicas o razonamiento encadenado.
- Idiomas: solo se declara ingles. No hay garantia de comportamiento correcto en castellano ni en otros idiomas, aunque el vocabulario base sea multilingue.
- Contexto limitado a 8.192 tokens como maximo heredado; documentos largos requieren troceado y estrategias de recuperacion externa.
- Sesgos: al no documentarse el dataset de ajuste, no es posible auditar sesgos introducidos. Los sesgos del modelo base (estereotipos de genero, origen o religion presentes en corpus web masivos) pueden haberse amplificado o alterado sin control.
- Identificador y nombre no informativos: el sufijo "haddiyyisa" no aporta contexto sobre el dominio de entrenamiento, y existe la posibilidad de que los resultados de busqueda relacionados con terminos similares no tengan ninguna relacion con el modelo, lo que dificulta rastrear su origen.
- Sin validacion externa: 0 descargas y 0 interacciones implican que nadie ha reportado fallos, resultados o comportamientos anomalos. No se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- Incertidumbre sobre el formato de pesos: el repositorio ocupa 0,1 GB, un tamano muy inferior al esperado para un modelo de ~2,6B, lo que sugiere que puede tratarse de un adaptador o de un guardado incompleto. Es imprescindible inspeccionar los ficheros antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/chkab/gemma-2-2b-haddiyyisa-v2
- Modelo base: https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Gemma 2 2B instruct: https://huggingface.co/google/gemma-2-2b-it
- Informe tecnico de Gemma 2: https://arxiv.org/abs/2408.00118
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms

Nota: las busquedas web realizadas no han devuelto ningun enlace relevante sobre este modelo ni sobre el autor. Los resultados obtenidos son contenido no relacionado y de caracter spam, por lo que se han descartado y no se incluyen.

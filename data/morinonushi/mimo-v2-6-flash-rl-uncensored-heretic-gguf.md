# MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-GGUF

## Resumen

MiMo-V2.6-Flash-RL Uncensored Heretic es una version "abliterated" (decensurada) del modelo MoE MiMo-V2.6-Flash-RL de XiaomiMiMo, publicada por el usuario MorinoNushi en formato GGUF ya fusionado. El modelo base es un transformer de mezcla de expertos (MoE) con 309 000 millones de parametros totales y 15 000 millones de parametros activos por token, distribuido bajo licencia MIT. La modificacion consiste en una ablacion direccional que elimina la direccion de rechazo en el espacio residual, de modo que el modelo deja de negarse a responder peticiones que el modelo original rechazaria.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica concreta (heretic-gguf) que traslada al ecosistema GGUF/llama.cpp una metodologia de ablacion optimizada con Optuna que hasta ahora se aplicaba sobre pesos completos o adaptadores PEFT. Por otro, advierte de que el resultado es un modelo con salvaguardas reducidas de forma deliberada: la propia model card indica tasas de rechazo del 3,57 % frente al 95,71 % del modelo base, medidas sobre 140 peticiones daninas, y prohibe explicitamente su uso en produccion o en servicios multiusuario.

El repositorio tiene un tamano declarado de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, por lo que los pesos pueden no estar efectivamente subidos o accesibles. Todos los datos tecnicos de esta ficha proceden de la model card del autor y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 48 capas segun la configuracion de ablacion |
| Parametros totales | 309 000 millones (309B) |
| Parametros activos | 15 000 millones (15B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), Q8_0 (atencion y capas densas) |
| Idiomas soportados | no disponible (la deteccion de rechazos del estudio uso marcadores en ingles y chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (variante fusionada, dividida en dos archivos: 00001-of-00002) |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Flash-RL |
| Variante equivalente | Adaptador LoRA de ~70 MB (pesos base sin recuantizar) |
| Fecha de publicacion | 23 de septiembre de 2026 (actualizado el 24 de septiembre de 2026) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 309B parametros totales y 15B activos, con 48 capas segun los indices de capa que aparecen en la configuracion de ablacion. Sobre esos pesos no se ha realizado ningun entrenamiento adicional: la unica modificacion es una ablacion direccional aplicada en inferencia sobre pesos ya cuantizados. La direccion de rechazo se calcula como la diferencia de medias sobre 480 peticiones daninas y 480 peticiones inocuas, con winsorizacion al 5 % y ortogonalizacion contra la media de las peticiones inocuas, y despues se proyecta fuera de las matrices de salida de atencion (attn.o_proj) y de las proyecciones descendentes del MLP enrutado del MoE.

La configuracion final corresponde al ensayo 85 del estudio `mimo26flash`, optimizado con Optuna TPE multiobjetivo (minimizar simultaneamente tasa de rechazo y divergencia KL). Los hiperparametros registrados son: ambito de direccion global, indice de direccion 26,2 de 48, fuerzas por experto escaladas segun la frecuencia de enrutamiento medida en peticiones daninas frente a inocuas, y `row_normalization = "pre"`. Las fuerzas maximas fueron 6,39 en attn.o_proj (capa 36,4 de 48) y 1,58 en la down-projection del MLP enrutado (capa 31,9). La fusion (`export --mode merged`) materializa la ablacion como un delta de rango completo, sin perdida por factorizacion LoRA, y recuantiza unicamente los tensores parcheados a su tipo original (MXFP4 los expertos, Q8_0 atencion y densas); el resto de tensores son copias byte a byte respecto al GGUF base.

## Capacidades

- Generacion de texto y razonamiento autoregresivo, heredados del modelo base; no se ha realizado ningun ajuste fino adicional.
- Modo de razonamiento explicito (thinking): el modelo emite trazas internas delimitadas por etiquetas tipo `<think></think>`; el estudio de ablacion uso un prefijo de omision de CoT para suprimir el razonamiento.
- Supresion efectiva del comportamiento de rechazo: 3,57 % de rechazos sobre 140 peticiones daninas frente al 95,71 % del modelo base, en la variante LoRA con el mismo delta.
- Conversacion multi-turno mediante plantillas de chat Jinja (`--jinja` en llama-server); el soporte concreto de tool calling no esta confirmado en la informacion disponible.
- Capacidad multilingue no documentada de forma explicita; los marcadores de rechazo usados en la evaluacion incluyen terminos en ingles y en chino, lo que sugiere cobertura de al menos esos dos idiomas.
- Capacidad de generacion de contenido danino, ofensivo o ilegal de forma no filtrada, tal y como advierte el propio autor.

## Casos de uso

- Red teaming de sistemas de IA: usar el modelo para generar intentos de jailbreak, prompts adversarios y contenido de riesgo con el fin de probar las defensas de clasificadores y filtros de seguridad propios.
- Investigacion en interpretabilidad y direcciones de rechazo: reproducir el ensayo 85, comparar la variante fusionada con la LoRA y medir como varia la direccion ablacionada por capa y por experto.
- Auditoria de comportamiento de rechazo por idioma: ejecutar conjuntos de prompts en distintos idiomas y contabilizar la tasa de negativas para detectar asimetrias entre lenguas.
- Generacion de datasets adversarios para entrenar clasificadores de seguridad: producir pares prompt-respuesta etiquetados como peligrosos para alimentar modelos de moderacion.
- Validacion de la herramienta heretic-gguf: aplicar el mismo pipeline (Optuna + ablacion direccional sobre GGUF) a otros modelos cuantizados y comparar el coste frente a la ruta LoRA equivalente.
- Estudio de deriva por cuantizacion: comparar la divergencia KL y la tasa de rechazo entre la forma fusionada (recuantizada a MXFP4/Q8_0) y la LoRA (bit-identica al base) para aislar el error introducido por el paso extra de cuantizacion.
- Evaluacion comparativa de alineacion: contrastar las respuestas del modelo base y del ablacionado sobre el mismo conjunto de prompts para cuantificar cuanto conocimiento se preserva y cuanto se distorsiona al eliminar la direccion de rechazo.

## Benchmarks y rendimiento

El autor publica unicamente metricas de comportamiento de rechazo y deriva, no benchmarks de capacidad estandar (no hay MMLU, HumanEval, GSM8K ni similares). La evaluacion se realizo sobre 140 peticiones daninas (100 del split de test de `mlabonne/harmful_behaviors` mas 40 personalizadas) y 100 peticiones inocuas (split de test de `mlabonne/harmless_alpaca`), con prefijo de omision de CoT, decodificacion greedy y respuestas de 100 tokens, comparando contra el base en MXFP4.

| Metrica | Modelo base | Modelo ablacionado (ensayo 85) |
|---|---|---|
| Tasa de rechazo (140 prompts daninos) | 95,71 % (134/140) | 3,57 % (5/140) |
| Divergencia KL (100 prompts inocuos, primeros logits) | 0 (por definicion) | 0,0568 |

Notas metodologicas relevantes: el recuento de rechazos se hizo por coincidencia de palabras clave en ingles y chino, incluyendo marcadores de negacion en primera persona; la KL se midio contra el cuantizado MXFP4, por lo que el valor es relativo a esa baseline y puede diferir sobre otra cuantizacion. Con el modo thinking completo activado, el autor advierte que el modelo puede razonar hasta volver a un rechazo, de modo que la tasa real de rechazo en uso practico puede ser superior al 3,57 %.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 165-190 GB solo para pesos (309B a ~4,25 bits por peso en MXFP4, mas los tensores Q8_0 de atencion y capas densas). Estimacion derivada del tamano, no publicada por el autor.
- GPU recomendadas: 2-3x H100 80 GB o 4x A100 80 GB para reparto completo en VRAM; 8x RTX 4090 24 GB (192 GB agregados) como configuracion limite en consumer.
- No cabe en una unica GPU de consumo: 24 GB de VRAM no permiten alojar los pesos; requeriria offload a RAM o disco.
- Alternativa en memoria unificada: Mac Studio con 192 GB o 512 GB de memoria unificada, o servidor con 256 GB de RAM y offload parcial (con penalizacion severa de latencia).
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`, `-ngl 999`, `-c`), importacion en Ollama a partir del GGUF, o cualquier motor GGUF-compatible. El soporte del arquitectura `mimo2` esta fusionado en llama.cpp upstream, sin necesidad de parches.
- Los dos archivos GGUF (`00001-of-00002`) deben cargarse como un unico modelo dividido; se pueden aplicar divisiones de tensores entre GPU con los flags habituales.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con 15B parametros activos, el coste por token es muy inferior al de un modelo denso de 309B, pero depende enteramente del hardware, del reparto y del ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL (base) | 309B totales / 15B activos | no disponible | safetensors / GGUF MXFP4 | MIT | Publicado por XiaomiMiMo |
| MiMo-V2.6-Flash-RL Uncensored Heretic (fusionado) | 309B totales / 15B activos | no disponible | GGUF (MXFP4 + Q8_0) | MIT | Este repositorio; 0 descargas |
| MiMo-V2.6-Flash-RL Uncensored Heretic (LoRA) | 309B totales / 15B activos | no disponible | Adaptador LoRA (~70 MB) | MIT | Publicado por el mismo autor |
| Alternativas de terceros (otros MoE abliterados de escala similar) | no disponible | no disponible | no disponible | no disponible | No se aportan datos en la informacion disponible |

La unica comparacion con numeros disponible es la del modelo base frente a la version ablacionada que figura en la seccion de benchmarks. No se han proporcionado datos de otros modelos de la misma categoria, por lo que no es posible una comparativa externa rigurosa.

## Limitaciones y advertencias

- Sesgos y contenido danino: el modelo cumple con peticiones que el base rechaza, incluidas instrucciones detalladas para actos daninos o ilegales. Es la consecuencia directa y buscada de la ablacion.
- Riesgo de alucinacion agravado: la ablacion suprime el rechazo, no el conocimiento. En temas peligrosos las respuestas pueden ser erroneas, incoherentes o inventadas, sin ninguna senal de advertencia al usuario.
- Comportamiento de rechazo variable segun el modo de razonamiento: con thinking completo el modelo puede volver a negarse a mitad de la traza, por lo que la tasa del 3,57 % no es un limite inferior garantizado en uso real.
- Deriva por recuantizacion: los tensores parcheados pasan por un paso extra de cuantizacion a MXFP4/Q8_0 respecto al base; el autor recomienda la variante LoRA si se busca equivalencia bit a bit.
- La metrica de KL es relativa al cuantizado MXFP4 usado como baseline, no a los pesos originales en precision completa.
- Licencia MIT: permite uso comercial y modificacion, pero eso no exime de responsabilidad legal o etica sobre las salidas generadas.
- Advertencia explicita del autor: prohibido desplegar el modelo en sistemas de produccion, servicios publicos o entornos multiusuario. Solo para investigacion personal, red teaming y evaluacion.
- Estado del repositorio: 0,0 GB de tamano declarado, 0 descargas y 0 likes, lo que sugiere que los archivos GGUF pueden no estar disponibles o haberse subido de forma incompleta en el momento de la consulta.
- Ausencia total de benchmarks de capacidad: no hay datos publicos de MMLU, HumanEval, GSM8K ni evaluaciones multilingues que permitan estimar cuanto rendimiento se ha degradado respecto al base.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo de contexto largo con garantias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- GGUF MXFP4 de referencia del base: https://huggingface.co/ggml-org/MiMo-V2.6-Flash-RL-GGUF
- Variante LoRA de la ablacion: https://huggingface.co/MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-LoRA-GGUF
- Herramienta heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- Proyecto Heretic original: https://github.com/p-e-w/heretic
- Conjunto de prompts daninos: `mlabonne/harmful_behaviors` (test)
- Conjunto de prompts inocuos: `mlabonne/harmless_alpaca` (test)
- Resultados de busqueda web: no se han encontrado enlaces relevantes a este modelo; los resultados devueltos corresponden a herramientas de enrutado de agentes y documentacion de GitHub Copilot, sin relacion con MiMo-V2.6 ni con la tecnica de ablacion descrita.

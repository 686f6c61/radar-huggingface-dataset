# lucatarik/Qwen3.5-4B-heretic-i1-GGUF-mmproj

## Resumen

`lucatarik/Qwen3.5-4B-heretic-i1-GGUF-mmproj` es un repositorio de pesos en formato GGUF publicado por el usuario lucatarik. Por su nomenclatura se trata de una redistribucion cuantizada de un modelo de ~4,2 mil millones de parametros de la familia Qwen, con una variante etiquetada como "heretic" y un fichero `mmproj` separado, lo que indica la presencia de un proyector multimodal (entrada de imagen) ademas del modelo de lenguaje. El repositorio ocupa 3,1 GB y esta publicado bajo licencia Apache-2.0.

La relevancia practica de esta ficha es limitada y conviene ser explicito: la model card esta practicamente vacia (solo contiene el frontmatter de licencia), el repositorio registra 0 descargas y 0 "likes", y no se aporta informacion sobre arquitectura, datos de entrenamiento, longitud de contexto, idiomas o rendimiento. Ademas, la fecha de creacion que declara HuggingFace (15 de octubre de 2026) es posterior a la fecha actual, lo que supone una anomalia de metadatos que debe tenerse en cuenta antes de cualquier evaluacion.

En consecuencia, esta ficha recoge los unicos datos verificables (tamano, parametros, licencia, formato y presencia de proyector multimodal) y marca como "no disponible" todo aquello que la informacion proporcionada no permite confirmar. No se han incluido cifras de benchmarks ni caracteristicas funcionales no documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el sufijo "i1" del nombre sugiere cuantizacion con imatrix, pero los niveles concretos (Q4_K_M, Q5_K_M, etc.) no estan documentados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, acompanado de un fichero `mmproj` para el proyector multimodal |
| Tamano del repositorio | 3,1 GB |
| Etiquetas declaradas | gguf, endpoints_compatible, imatrix, conversational, region:us |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura, el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros) en la informacion disponible. Lo unico deducible del repositorio es que se distribuyen pesos cuantizados en GGUF junto a un proyector multimodal (`mmproj`), un artefacto habitual en modelos de vision-lenguaje que se ejecutan con llama.cpp. El numero de parametros (4.205.751.296) es consistente con un transformer denso de aproximadamente 4B de parametros.

El termino "heretic" se emplea habitualmente en la comunidad de modelos abiertos para designar variantes sometidas a tecnicas de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones), y el sufijo "i1" es la convencion que usa habitualmente el ecosistema de cuantizacion con imatrix. Ambas lecturas son inferencias a partir del nombre del repositorio: la model card no confirma ni la metodologia de abliteration ni el procedimiento de cuantizacion, ni identifica de forma verificable el modelo base exacto.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica un ajuste orientado a dialogo, aunque no se detalla el formato de prompt soportado.
- Entrada multimodal: la presencia del fichero `mmproj` apunta a soporte de entrada de imagen, pero no se especifica el tipo de vision (imagen estatica, OCR, diagramas) ni la resolucion soportada.
- Razonamiento, codigo y matematicas: no disponible, no se documenta ningun resultado ni capacidad concreta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

Los siguientes escenarios son planteamientos genericos para un modelo denso de ~4B en GGUF con posible entrada de imagen. Dado que no hay documentacion de capacidades, deben validarse empiricamente antes de llevarlos a produccion.

- Asistente conversacional local: al distribuirse en GGUF, el modelo puede ejecutarse en un portatil o en una estacion de trabajo sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace apto para asistentes de escritorio con requisitos de privacidad estrictos.
- Procesamiento de documentos con imagen: si el proyector multimodal funciona correctamente, podria usarse para extraer informacion de capturas, formularios escaneados o diagramas simples, siempre con verificacion humana posterior.
- Clasificacion y etiquetado de texto a escala: un modelo de 4B cuantizado permite procesar volumenes altos de texto con coste por token bajo en hardware de gama media.
- Generacion de resumenes de reuniones o hilos de correo: con contexto corto y en despliegue local, encaja en flujos internos donde no se pueden enviar datos a APIs externas.
- Prototipado rapido de aplicaciones de IA: sirve como modelo de pruebas para validar pipelines de inferencia (llama.cpp, llama-cpp-python, servidores compatibles con la API de OpenAI) antes de escalar a modelos mayores.
- Filtrado o preprocesado en pipelines de datos: puede actuar como modelo auxiliar para normalizar, reformatear o enrutar texto antes de pasarlo a un modelo mayor, reduciendo coste computacional.
- Educacion y experimentacion sobre modelos abliterados: util para investigar como afecta la eliminacion de comportamientos de rechazo al rendimiento y a la seguridad de un modelo de 4B, en un entorno controlado y aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y no se ha proporcionado comparacion con modelos de referencia.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (4,2 B) y del formato GGUF; no proceden de mediciones publicadas para este repositorio concreto y deben tomarse como orientativas.

- VRAM para los pesos (solo modelo de lenguaje, sin cache KV): aproximadamente 2,6-2,8 GB en Q4_K_M; 3,0-3,3 GB en Q5_K_M; 4,5-4,7 GB en Q8_0; 8,4-8,6 GB en F16.
- Proyector multimodal: el fichero `mmproj` anade un consumo adicional de VRAM que no se puede estimar con los datos disponibles.
- Cache KV: proporcional a la longitud de contexto, que no esta documentada; a mayor contexto, mayor consumo adicional.
- GPU consumer: cabe con holgura en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) usando cuantizaciones Q4 o Q5, y con margen amplio en 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) y en 24 GB (RTX 3090, RTX 4090).
- GPU profesional: A100, H100, L40S y similares son sobredimensionadas para este tamano, salvo que se necesite batcheo masivo.
- CPU: la inferencia solo con CPU es viable en llama.cpp para uso interactivo, con velocidad dependiente del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI. Para vLLM o TGI seria preferible partir de los pesos originales en safetensors del modelo base, no de este repositorio GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lucatarik/Qwen3.5-4B-heretic-i1-GGUF-mmproj | ~4,2 B | no disponible | Apache-2.0 | GGUF + mmproj |
| Qwen3-4B (referencia de la familia) | ~4 B | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF de terceros |
| Llama 3.2 3B Instruct | ~3,2 B | no disponible en esta ficha | Licencia comunitaria de Llama | safetensors, GGUF |
| Gemma 3 4B | ~4 B | no disponible en esta ficha | Terminos de uso de Gemma | safetensors, GGUF |

No es posible comparar rendimiento entre estas opciones porque no hay resultados de benchmarks publicados para el modelo objeto de la ficha. La comparacion se limita, por tanto, a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta arquitectura, contexto, idiomas, formato de prompt ni procedimiento de cuantizacion.
- Cero descargas y cero valoraciones: no existe evidencia de uso comunitario ni de validacion por terceros.
- Anomalia en los metadatos: la fecha de creacion declarada (2026-10-15) es posterior a la fecha actual, lo que resta fiabilidad al registro del repositorio.
- Modelo base no verificable: no se identifica de forma inequivoca la revision exacta del modelo del que proceden los pesos, algo critico en redistribuciones de terceros.
- Riesgo asociado a variantes "heretic": si efectivamente se ha aplicado abliteration, es previsible una reduccion de las barreras de rechazo y un aumento del riesgo de generar contenido inapropiado, danino o fuera de politica. No se han publicado evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a los modelos de 4B; sin datos de benchmarks no se puede acotar su magnitud.
- Ausencia de resultados de benchmarks: imposible estimar calidad en razonamiento, codigo, matematicas o tareas multimodales.
- Limitaciones de contexto e idioma: desconocidas; no se declara ninguna lista de idiomas soportados.
- Licencia del modelo redistribuido: el repositorio declara Apache-2.0, pero al tratarse de una redistribucion conviene verificar que los terminos del modelo base permiten esta relicencia y su uso comercial.
- Uso en produccion: no recomendado sin una evaluacion propia previa de calidad, seguridad, contexto efectivo y estabilidad, dado el nivel de documentacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lucatarik/Qwen3.5-4B-heretic-i1-GGUF-mmproj
- No se han encontrado en la informacion disponible papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo.

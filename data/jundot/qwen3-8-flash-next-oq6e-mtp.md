# Jundot/Qwen3.8-Flash-Next-oQ6e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ6e-mtp es un checkpoint cuantizado en precision mixta del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Jundot. Se trata de una derivacion, no de un modelo entrenado desde cero: el autor aplica la herramienta oQ (oMLX v0.7.1) para reducir el modelo original a una media efectiva de 6,691 bits por peso, dejando el resultado en formato MLX para ejecucion en hardware de Apple.

El modelo base se describe en la propia model card como una vista previa experimental de la arquitectura que habria detras de Qwen4: un modelo de mezcla de expertos (MoE) de tipo vision-lenguaje con 125.000 millones de parametros y unos 6.000 millones activos, a los que se suman un embedding de n-gramas de 51.000 millones y un modulo MTP (multi-token prediction). La arquitectura combina Gated DeltaNet, Qwen Sparse Attention (QSA) y flujos residuales con puerta. El checkpoint incluye la columna vertebral de lenguaje, el embedding de n-gramas, el codificador de vision y la cabeza MTP.

El interes practico de esta publicacion es doble. Por un lado, permite ejecutar en memoria unificada de Apple Silicon un modelo que en su forma original en BF16 resultaria inabordable en ese hardware, ya que el repositorio ocupa 150,6 GB en disco (140,21 GiB de pesos). Por otro lado, sirve como material de estudio de la propia arquitectura experimental, al conservar el codificador de vision y la cabeza MTP. El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) vision-lenguaje con Gated DeltaNet, Qwen Sparse Attention (QSA) y flujos residuales con puerta |
| Parametros totales | 179.999.981.459 (~180.000 millones) |
| Parametros activos | ~6.000 millones (columna vertebral de lenguaje, segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (precision mixta; media efectiva de 6,691 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Parametros por componente | Lenguaje: 125,744B; embedding de n-gramas: 51,200B; codificador de vision: 0,449B; cabeza MTP: 2,607B (logicos) |
| Tamano del repositorio | 150,6 GB (150,549 GB / 140,210 GiB de pesos) |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relacion: quantized) |
| Herramienta de cuantizacion | oQ / oMLX v0.7.1 con Improved oQe Quantization |
| Fecha de publicacion | 2026-10-11 |

## Arquitectura y entrenamiento

El checkpoint reproduce la arquitectura del modelo base, que la model card describe como una vista previa experimental de la arquitectura de Qwen4. Se trata de un transformer de mezcla de expertos orientado a vision-lenguaje, con 125.000 millones de parametros en la columna vertebral y aproximadamente 6.000 millones activos por token. Sus tres elementos diferenciales son Gated DeltaNet (una capa de estado recurrente con puerta, alternativa a la atencion completa), Qwen Sparse Attention (QSA) y flujos residuales con puerta (Gated Residual streams). El conjunto se completa con un embedding de n-gramas de 51.000 millones de parametros y una cabeza de prediccion multi-token (MTP), cuyo proposito es generar y verificar varios tokens por paso de decodificacion.

No se ha realizado ningun entrenamiento ni ajuste adicional en esta publicacion: se trata exclusivamente de una cuantizacion del modelo original. El metodo oQ6e asigna bits por sensibilidad de capa medida, redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y reajusta escala y sesgo mediante minimos cuadrados ponderados. El reparto resultante concentra el 69,817% de los pesos en 6 bits con grupo 64, el 28,445% en 6 bits con grupo 32 (que corresponde integramente al embedding de n-gramas), y deja en 8 bits el 1,138% de los pesos y en BF16 el 0,287%. La media efectiva declarada es de 6,691 bits por peso para el conjunto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre fases de RLHF o DPO del modelo base. Tampoco se documentan en la informacion disponible innovaciones de decodificacion especulativa mas alla de la presencia de la cabeza MTP.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational` del repositorio.
- Comprension de imagen a texto (pipeline `image-text-to-text`), con un codificador de vision de 0,449B parametros logicos que se conserva en el checkpoint.
- Prediccion multi-token mediante la cabeza MTP (2,607B parametros logicos), orientada a acelerar la decodificacion especulativa.
- Modelado de lenguaje con embedding de n-gramas de gran tamano (51,2B parametros), integrado en el mismo checkpoint.
- Ejecucion en Apple Silicon mediante la libreria MLX, con pesos ya cuantizados y listos para cargar.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (el repositorio no declara idiomas).
- Modo de razonamiento explicito (thinking), audio o cualquier otra modalidad: no documentado en la informacion disponible.

## Casos de uso

- Extraccion de informacion de documentos escaneados: al conservar el codificador de vision, el modelo puede recibir una imagen de factura, formulario o contrato y devolver texto estructurado, lo que permite montar pipelines de automatizacion documental sin recurrir a un OCR externo mas un modelo de texto.
- Analisis de capturas de pantalla e interfaces: el modelo puede describir o interpretar imagenes de UI, lo que resulta util en herramientas de auditoria de accesibilidad o de generacion de esqueletos de interfaz a partir de un diseno en imagen.
- Asistentes conversacionales multimodales en local: pensado para despliegues en equipos Apple con memoria unificada amplia, permite mantener el texto y las imagenes del usuario dentro de la maquina, sin enviar datos a una API externa, algo relevante en entornos con requisitos de confidencialidad.
- Servicio de texto de alto rendimiento con decodificacion especulativa: la cabeza MTP incluida permite plantear esquemas de decodificacion que propongan y verifiquen varios tokens por paso, con el objetivo de elevar el throughput en tareas de generacion.
- Investigacion sobre arquitecturas hibridas: Gated DeltaNet, QSA y Gated Residual son componentes poco comunes en modelos publicos, por lo que este checkpoint sirve para reproducir experimentos de eficiencia y de calidad frente a atencion densa en un entorno controlado.
- Evaluacion de tecnicas de cuantizacion: al publicarse el reparto exacto de bits por capa y grupo, el checkpoint es un caso de estudio util para medir el impacto de la cuantizacion mixta en un MoE con un embedding de n-gramas especialmente voluminoso.
- Prototipado rapido en Mac: al estar ya en formato MLX, permite cargar el modelo y probar tareas de vision-lenguaje en un Mac Studio o Mac Pro sin pasar por conversion de pesos ni por infraestructura de GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del checkpoint no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni del modelo cuantizado ni del modelo base. Tampoco se aportan mediciones de latencia, throughput o consumo de memoria mas alla del desglose de almacenamiento.

## Requisitos de hardware

- Peso de los parametros cuantizados: 140,210 GiB (150,549 GB). Es el minimo absoluto de memoria para cargar el modelo, sin contar activaciones ni cache KV.
- El repositorio ocupa 150,6 GB en disco, por lo que necesitas ese espacio libre para la descarga.
- No cabe en ninguna GPU de consumo: una RTX 4090 dispone de 24 GB de VRAM, muy por debajo de los 140 GiB necesarios. Tampoco cabe en Macs con 64 GB o 128 GB de memoria unificada.
- En hardware de Apple, el formato MLX exige memoria unificada suficiente para los 140 GiB mas el margen de activaciones y cache. Como estimacion a partir del tamano de los pesos, haria falta un Mac Studio o Mac Pro con 256 GB o 512 GB de memoria unificada; esta cifra es una deduccion del tamano del repositorio y no un dato publicado por el autor.
- Reparto de memoria por componente, segun la model card: columna vertebral de lenguaje 95,660 GiB, embedding de n-gramas 41,723 GiB, cabeza MTP 1,990 GiB y codificador de vision 0,836 GiB.
- Opciones de despliegue: al ser un checkpoint MLX, el camino natural es `mlx-lm` o `mlx-vlm` en Apple Silicon. Para vLLM, llama.cpp, Ollama o TGI no hay soporte declarado de este checkpoint y requeriria una conversion previa, que no se documenta en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de este checkpoint ni de alternativas de la misma categoria, y el repositorio no registra descargas ni valoraciones que permitan situarlo frente a otros. Como unica referencia se puede usar el propio modelo de origen, Qwen/Qwen3.8-Flash-Next, del que este checkpoint es una version cuantizada: comparten arquitectura y numero de parametros, y difieren en el formato de pesos (BF16 frente a oQ6e a 6,691 bits por peso) y, previsiblemente, en los requisitos de memoria, aunque el tamano exacto del repositorio original no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Modelo derivado y sin validacion independiente: el repositorio registra 0 descargas y 0 valoraciones, y no incluye resultados de evaluacion. Cualquier uso en produccion deberia ir precedido de una bateria de pruebas propia.
- Riesgo de degradacion por cuantizacion: aunque el 98,3% de los pesos se mantiene en 6 bits o mas, la cuantizacion mixta puede afectar de forma desigual a distintas tareas. El embedding de n-gramas, que supone el 28,445% de los pesos logicos, se almacena a 6 bits con grupo 32.
- Riesgo de alucinacion: no hay informacion sobre el comportamiento del modelo base en este aspecto ni sobre tasas de error medidas.
- Idiomas soportados: no disponibles. No se puede confirmar el grado de cobertura del castellano ni de otras lenguas.
- Longitud de contexto: no disponible, lo que impide garantizar escenarios que dependan de ventanas largas.
- Tool calling, agentes y modo de razonamiento: no documentados, por lo que no deben asumirse en el diseno de un sistema.
- Restricciones de licencia: se aplica la Qwen Community License 1.0, la misma del modelo de origen. Es una licencia con condiciones especificas para uso comercial que conviene revisar antes de desplegar; no es una licencia de codigo abierto permisiva.
- Formato cerrado a un ecosistema: al distribuirse en MLX, el checkpoint esta practicamente limitado a hardware de Apple. Su uso en GPUs NVIDIA o AMD exigiria conversiones no documentadas.
- Confusion en las cifras del modulo MTP: la model card menciona un modulo MTP de 4B en el texto descriptivo, mientras que la tabla de desglose indica 2,607B parametros logicos para la cabeza MTP. La discrepancia no se resuelve en la informacion disponible.
- Coste de memoria muy elevado: 140 GiB de pesos implican hardware de gama profesional y excluyen cualquier escenario de borde o de GPU de consumo.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Licencia del repositorio: LICENSE (Qwen Community License 1.0)

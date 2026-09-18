# miguelamendez/mica-minicpm-v46-thinking

## Resumen

Mica MiniCPM-V 4.6 Thinking es una distribución de artefactos cuantizados del modelo multimodal `openbmb/MiniCPM-V-4.6-Thinking`, publicada por el usuario miguelamendez bajo el identificador `miguelamendez/mica-minicpm-v46-thinking`. No se trata de un entrenamiento nuevo, sino de una reempaquetado orientado a inferencia local: incluye checkpoints en formato MLX (afino selectivo Q4 y Q8) y GGUF (Q4_K_M y Q8_0), además de una matriz de candidatos portables para Linux/NVIDIA basados en AutoRound y GPTQ. El repositorio fija la revisión `93d8f4b60ad5d1f763442cf4c19f2a71fa95af4a` del modelo fuente y mantiene la licencia Apache-2.0.

El modelo subyacente combina un codificador visual SigLIP2-400M con un modelo de lenguaje Qwen3.5-0.8B y compresión mixta de tokens visuales 4x/16x. La configuración textual fijada declara 262.144 posiciones arquitectónicas, aunque el propio autor advierte que ese número no debe presentarse como contexto validado ni seguro para entrenamiento. Se trata de la variante de cadena de pensamiento larga: el modo *thinking* está activado por defecto y la plantilla de chat permite desactivarlo, pero no se publican niveles de esfuerzo ni presupuestos de tokens de razonamiento.

Su relevancia actual es práctica: ofrece una vía reproducible para ejecutar un modelo visión-lenguaje en Apple Silicon (MLX) y en CPU/GPU vía GGUF con requisitos de memoria muy bajos (picos registrados de 3,029 GB en Q4 y 3,176 GB en Q8 durante inferencia de vídeo). El contrapeso es que el autor delimita explícitamente un perímetro de validación: los artefactos han pasado pruebas funcionales de texto, imagen, vídeo y servidor compatible con OpenAI, pero no hay artefacto de calidad promovido, no hay resultados de benchmarks y la rama vLLM no se ha publicado porque los candidatos estructurales no superaron la puerta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: codificador visual SigLIP2-400M + modelo de lenguaje Qwen3.5-0.8B, con compresion mixta de tokens visuales 4x/16x y bloques de atencion lineal recurrente |
| Parametros totales | 752.161.600 (segun safetensors del repositorio); la model card declara "approximately-1.2B-components" |
| Parametros activos | No aplica (no se describe arquitectura MoE) |
| Longitud de contexto | 262.144 posiciones arquitectonicas declaradas en la configuracion textual fijada; maximo de entrenamiento e input/output no divulgados. El autor indica que el valor arquitectonico no debe representarse como contexto validado localmente |
| Tipos de cuantizacion | MLX affine selectivo Q4 y Q8 (group size 64); GGUF Q4_K_M y Q8_0 con proyector a precision completa; candidatos Linux/NVIDIA: AutoRound W4A16 group-128, GPTQ W4A16 group-128 y GPTQ W8A16 group-128 |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | Apache-2.0 (tanto el modelo fuente como los derivados) |
| Formato de pesos | safetensors, GGUF, MLX (el repositorio tambien declara compatibilidad con transformers) |

## Arquitectura y entrenamiento

La model card describe una arquitectura multimodal compuesta por un codificador visual SigLIP2-400M y un modelo de lenguaje Qwen3.5-0.8B, con compresion mixta de tokens visuales 4x/16x. La presencia de "recurrent linear-attention blocks" (bloques de atencion lineal recurrente) indica una hibridacion entre atencion estandar y mecanismos recurrentes lineales, si bien la model card no detalla la disposicion exacta de esas capas ni la proporcion entre ambos tipos. La configuracion textual fijada declara `mtp_num_hidden_layers`, pero el checkpoint publicado no contiene tensores MTP separables ni tensores de siguiente token: no se incluye ningún *drafter* de decodificacion especulativa.

No se proporcionan datos sobre el corpus de entrenamiento: no se indica numero de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se detallan los hiperparametros ni la receta de alineacion. Para video, la configuracion por defecto usa como maximo 128 fotogramas, con aproximadamente 1 FPS en videos cortos y muestreo uniforme en videos largos; los ejemplos del autor solicitan 512 tokens nuevos para imagen y 2.048 para video, pero se presentan como presupuestos de peticion de ejemplo, no como limites duros de generacion.

La innovacion tecnica relevante de esta distribucion es la politica de cuantizacion selectiva: en MLX se cuantizan las proyecciones elegibles del modelo de lenguaje, mientras se preservan a precision de origen la torre de vision, los fusionadores visuales (*mergers*), los bloques de atencion lineal recurrente, los embeddings de tokens y la cabeza de salida. Por eso los checkpoints resultantes promedian 13,274 bits por peso en Q4 y 14,222 en Q8: los nombres de directorio describen las capas afines elegibles, no una precision global uniforme. La matriz portable Linux/NVIDIA sigue la misma logica, manteniendo torre de vision, fusionador, modulos de atencion lineal recurrente, embeddings y cabeza de salida a precision de origen.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Comprension de imagen a texto (`image-text-to-text`), incluyendo descripcion, respuesta a preguntas visuales y extraccion de informacion de imagenes.
- Comprension de video a texto (`video-text-to-text`) con hasta 128 fotogramas, aproximadamente 1 FPS en videos cortos y muestreo uniforme en videos largos.
- Razonamiento con cadena de pensamiento larga: el modo *thinking* esta activado por defecto y puede desactivarse desde la plantilla de chat fijada.
- Soporte de plantilla con tokens de sistema y de herramientas, segun se deduce de los requisitos de contabilidad de contexto del perfil Mica (texto, rebanadas de imagen, fotogramas de video, tokens de sistema/herramienta, razonamiento y salida visible).
- Servidor compatible con la API de OpenAI, validado con los artefactos MLX Q4 y Q8.
- Ejecucion en Apple Silicon mediante MLX y en CPU/GPU mediante GGUF y llama.cpp.
- Salida con formato estructurado: en las pruebas registradas, Q8 reprodujo el formato BF16 con mas fidelidad que Q4, que omitio un sufijo JSON solicitado en una prueba de imagen.

## Casos de uso

- **Analisis documental con OCR visual y preguntas**: el modelo puede recibir una imagen de un documento o captura y responder preguntas sobre su contenido, aprovechando el codificador SigLIP2-400M y la compresion 4x/16x para reducir el coste de tokens visuales en documentos densos.
- **Moderacion y descripcion automatica de contenido audiovisual**: con hasta 128 fotogramas por video y muestreo uniforme, resulta adecuado para etiquetar, resumir o clasificar clips cortos en pipelines de gestion de bibliotecas multimedia.
- **Asistente local en portatiles Apple Silicon**: los picos de memoria registrados (3,029 GB en Q4 y 3,176 GB en Q8 durante video) permiten ejecutar el modelo junto a otras aplicaciones en equipos con memoria unificada, sin depender de servicios en la nube.
- **Prototipado de agentes multimodales con tool calling**: la plantilla contempla tokens de sistema y herramienta, de modo que puede integrarse en flujos de agente que alternen llamadas a funciones con observaciones visuales, siempre que el perfil de contexto cuente correctamente todos los tipos de token.
- **Preprocesado en pipelines de datos**: generacion de descripciones y metadatos para imagenes y videos antes de indexarlos en un sistema de busqueda o en un almacen vectorial.
- **Asistencia en accesibilidad**: descripcion de imagenes y videos para personas con discapacidad visual, con la ventaja de poder ejecutarse localmente y sin enviar contenido sensible a terceros.
- **Investigacion sobre cuantizacion selectiva**: el repositorio sirve como banco de pruebas comparativo entre MLX affine, GGUF, AutoRound W4A16 y GPTQ W4A16/W8A16, ya que documenta explicitamente que capas se preservan a precision completa.
- **Aplicaciones con requisito de estructura estricta**: en escenarios donde la salida deba respetar JSON u otro formato fijo, las pruebas registradas favorecen Q8 sobre Q4 por fidelidad de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMBench, Video-MME ni de ninguna otra evaluacion estandar, y las busquedas web realizadas no devolvieron resultados tecnicos relevantes sobre este modelo.

Los unicos datos cuantitativos de rendimiento registrados son mediciones de memoria y observaciones funcionales, no metricas de calidad:

| Medicion registrada | Valor |
|---|---|
| Pico de memoria en video, MLX Q4 | 3,029 GB |
| Pico de memoria en video, MLX Q8 | 3,176 GB |
| Bits efectivos por peso, MLX Q4 | 13,274 |
| Bits efectivos por peso, MLX Q8 | 14,222 |
| Pruebas funcionales superadas (MLX) | Texto, imagen, video y servidor compatible con OpenAI |
| Pruebas funcionales superadas (GGUF) | Inferencia ordenada de imagen y video con Q4_K_M y Q8_0 |
| Fidelidad de formato | Q4 omitio un sufijo JSON en una prueba de imagen; Q8 coincidio con el formato BF16 |

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: el repositorio completo ocupa 6,9 GB, pero cada conjunto de pesos es mucho menor por separado. Los picos medidos en inferencia de video son de 3,029 GB (MLX Q4) y 3,176 GB (MLX Q8) en memoria unificada de Apple Silicon.
- **GPU recomendadas**: no se especifican GPU concretas en la informacion disponible. Los artefactos validados se probaron en macOS con Metal (MLX y GGUF). La matriz Linux/NVIDIA (AutoRound W4A16, GPTQ W4A16/W8A16) existe como candidata, pero no se ha promovido ni publicado como artefacto de produccion.
- **Viabilidad en GPU de consumo**: si. Con aproximadamente 752 millones de parametros en safetensors y pesos cuantizados de 4 y 8 bits, el modelo cabe holgadamente en GPU de consumo con 8 GB o mas de VRAM, e incluso en equipos con memoria unificada modesta. No se dispone de mediciones especificas en RTX 4090, RTX 3090 u otras tarjetas.
- **Opciones de despliegue**: MLX en macOS (Q4 y Q8), GGUF mediante llama.cpp u Ollama (Q4_K_M y Q8_0), y transformers. El servidor compatible con OpenAI esta validado con los artefactos MLX. La ruta vLLM no esta publicada: los candidatos estructurales no superaron la puerta de produccion, y la sonda con vLLM-Metal 0.29 fallaba en el despacho del procesador de imagenes antes de cargar los pesos. El kernel de vLLM actual reconoce esta arquitectura exacta de MiniCPM, pero segun el autor eso no establece compatibilidad con el plugin Metal.
- **Latencia y throughput**: no disponible. No se publican tokens por segundo ni latencias por peticion.
- **Requisito de calibracion**: los artefactos Q4 y Q8 se calibraron con una imagen real y un video ordenado de dos fotogramas. Sigue pendiente la calibracion con imagen/video, la comparacion de calidad contra BF16 y las pruebas nativas de vLLM en Linux/NVIDIA.

## Comparativa con modelos similares

No se dispone de especificaciones verificadas de alternativas en la informacion proporcionada. La unica comparacion sustentada por los datos es contra el modelo fuente sin cuantizar:

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| mica-minicpm-v46-thinking (MLX Q4/Q8, GGUF Q4_K_M/Q8_0) | 752.161.600 | 262.144 posiciones arquitectonicas declaradas (no validadas) | Apache-2.0 | safetensors, GGUF, MLX | Validado funcionalmente en macOS (texto, imagen, video, servidor OpenAI) |
| openbmb/MiniCPM-V-4.6-Thinking (fuente, BF16) | no disponible en la informacion proporcionada | 262.144 posiciones arquitectonicas (misma configuracion) | Apache-2.0 | safetensors | Referencia de comparacion de calidad pendiente en la matriz Mica |
| Otras alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Perimetro de validacion acotado**: los tests no certifican el contexto de 262.000 tokens. El autor indica que Mica debe contar texto, rebanadas de imagen, fotogramas de video, tokens de sistema y herramienta, razonamiento y salida visible dentro del presupuesto mucho menor del perfil probado, y fallar por encima de 262.144 tokens totales o del limite del backend activo.
- **Contexto no validado**: la cifra de 262.144 posiciones es arquitectonica. No se divulga la longitud maxima de entrenamiento, el maximo de entrada ni un techo duro de salida, por lo que no debe asumirse que el modelo mantenga calidad en ventanas largas.
- **Ausencia de artefacto de calidad**: los checkpoints Q4 y Q8 actuales son estructurales/funcionales. La calibracion de produccion, la comparacion contra BF16 y las pruebas nativas de vLLM en Linux/NVIDIA siguen siendo obligatorias antes de considerarlos artefactos de calidad.
- **vLLM no disponible**: no se publica artefacto para vLLM; los candidatos estructurales no superaron la puerta de produccion.
- **Riesgo de formato en Q4**: en una prueba de imagen, Q4 omitio un sufijo JSON solicitado. Para aplicaciones donde la fidelidad estructural sea critica, el autor recomienda Q8.
- **Dependencia del modelo fuente**: las limitaciones de sesgo, alucinacion y cobertura linguistica heredan del modelo `openbmb/MiniCPM-V-4.6-Thinking`. No se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible.
- **Cobertura limitada de idiomas**: solo se declaran ingles y chino. No hay soporte declarado de castellano ni de otras lenguas.
- **Sin decodificacion especulativa**: aunque la configuracion declare `mtp_num_hidden_layers`, el checkpoint no contiene tensores MTP separables, por lo que no se puede aprovechar un *drafter* incluido.
- **Licencia**: Apache-2.0 en fuente y derivados, lo que permite uso comercial. Aun asi, conviene verificar las condiciones del modelo base por si existieran terminos adicionales no recogidos en la informacion proporcionada.
- **Resultados de busqueda no relevantes**: las busquedas web realizadas devolvieron exclusivamente contenido no relacionado con el modelo, por lo que no aportan informacion tecnica verificable.

## Enlaces

- Repositorio HuggingFace de la distribucion Mica: https://huggingface.co/miguelamendez/mica-minicpm-v46-thinking
- Modelo fuente: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Revision fijada del modelo fuente: 93d8f4b60ad5d1f763442cf4c19f2a71fa95af4a
- Registros de validacion citados en la model card: `docs/validation/minicpm-v46-thinking-mlx.md`, `docs/validation/minicpm-v46-drafter-audit.md`, `docs/validation/minicpm-vllm-quantization-macos.md`, `docs/validation/gguf-runtime-macos-metal.md`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en los resultados de busqueda web disponibles.

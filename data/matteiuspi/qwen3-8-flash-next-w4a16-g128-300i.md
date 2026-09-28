# matteiuspi/Qwen3.8-Flash-Next-W4A16-G128-300i

## Resumen

Este repositorio contiene un checkpoint experimental de cuatro bits derivado de `Qwen/Qwen3.8-Flash-Next` (revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`), publicado por el usuario `matteiuspi`. No es un modelo nuevo entrenado desde cero, sino una cuantizacion W4A16 con grupos de 128 pesos orientada especificamente a dos tarjetas Atlas 300I Duo, que el sistema expone como cuatro dispositivos Ascend 310P3. El autor lo etiqueta explicitamente como un checkpoint de servicio de texto en fase experimental, con un runtime de desarrollo propio y operadores de 310P compilados, por lo que no es sustituible directamente en una instalacion estandar de vLLM Ascend.

El modelo base es un transformer disperso de tipo mezcla de expertos (MoE) con atencion dispersa, componentes Gated DeltaNet y pesos de vision y MTP, del que se han cuantizado 73.728 proyecciones de expertos enrutados. El checkpoint exporta 121.489.440.659 parametros distribuidos en 1.610 fragmentos de Safetensors y 222.746 tensores, con un peso en disco de 181.713.896.545 bytes (unos 181,7 GB), de los cuales aproximadamente 102,40 GB corresponden a la tabla PLE, que se mantiene en coma flotante. La ventana de contexto configurada para el servicio es de 262.144 tokens, con un maximo de dos secuencias concurrentes.

Su relevancia es acotada pero clara: documenta una ruta de cuantizacion INT4 agrupada para aceleradores Ascend de generacion anterior, con cifras medidas de memoria residente y velocidad de decodificacion, y con una declaracion explicita de que la validacion de calidad a nivel de modelo completo sigue pendiente. Es, por tanto, material de evaluacion para ingenieria de inferencia sobre hardware Ascend, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa, componentes Gated DeltaNet, vision y MTP (pesos no expertos en coma flotante) |
| Parametros totales | 121.489.440.659 (segun el indice de Safetensors del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados como maximo de servicio (prompt mas completado); no validado en peticiones completas de esa longitud |
| Tipos de cuantizacion | W4A16 con grupos de 128 en los expertos enrutados (INT4 con signo empaquetado, RTN asimetrico por grupo min/max, escalas FP16, puntos cero INT8); activaciones FP16. Existe un checkpoint complementario W8A8 dinamico |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | Safetensors (1.610 fragmentos, 222.746 tensores; 181.637.185.528 bytes de payload) con metadatos de carga para vLLM |
| Variante de cuantizacion declarada | `qwen4exp_w4a16_group_v1` en `text_config.ascend_expert_quantization` |
| Hardware objetivo | Dos Atlas 300I Duo (cuatro dispositivos Ascend 310P3), paralelismo de tensor de 4 |
| Tamano del repositorio | 181,7 GB |

## Arquitectura y entrenamiento

El checkpoint no aporta informacion sobre el entrenamiento del modelo base: no se detallan el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se documenta es la arquitectura efectiva del modelo servido: un MoE con atencion dispersa y componentes Gated DeltaNet, con pesos de vision y de MTP (multi-token prediction) presentes, y una gran tabla PLE que se mantiene fuera de la cuantizacion. Esta ficha, por tanto, no puede describir el proceso de entrenamiento original.

En cuanto a la innovacion tecnica, el trabajo se centra en el pipeline de cuantizacion. Ascend ModelSlim IR convirtio 73.728 proyecciones de expertos enrutados desde BF16 mediante RTN asimetrico por grupo min/max, con grupos de 128 pesos. Cada byte empaqueta dos valores INT4 con signo, con el nibble bajo primero. Las escalas son FP16 y los puntos cero INT8. Quedan en coma flotante el router, los expertos compartidos, la atencion, Gated DeltaNet, los embeddings, la tabla PLE, los componentes de vision y los pesos MTP. Los tensores origen BF16 se exportaron como FP16 para la ruta de servicio en 310P, mientras que los tensores origen FP32 permanecen en FP32. Existe un experimento separado de kernel W4A8 que no ha superado las pruebas de velocidad y calidad a nivel de modelo completo y que no constituye el modo de ejecucion declarado.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` figura entre las del repositorio.
- Aritmetica, conteo y produccion de salida en Python: verificados mediante comprobaciones de humo segun la model card.
- Llamada a herramientas (tool calling): validada en las comprobaciones de humo realizadas sobre cuatro dispositivos.
- Recuperacion de contrasenas de 8K: completada en una prueba independiente de dos peticiones sin expropiacion de secuencias.
- Prediccion multi-token (MTP): el servicio experimental usa MTP de dos tokens; los pesos MTP se mantienen en coma flotante.
- Vision: el checkpoint conserva componentes de vision en coma flotante, aunque no se documenta ninguna validacion de capacidades multimodales.
- Razonamiento multi-paso y agentes: no disponible (no se ha completado ninguna evaluacion de este tipo).
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Evaluacion de cuantizacion INT4 sobre Ascend: comparar este checkpoint con el W8A8 dinamico del mismo autor en la misma topologia de dos Atlas 300I Duo para medir memoria residente por rango y velocidad de decodificacion, teniendo en cuenta que sus configuraciones de servicio difieren.
- Servicio de texto en infraestructura Ascend existente: desplegar con vLLM Ascend mas los operadores 310P W4 compilados para atender conversaciones cortas con un maximo de dos secuencias concurrentes.
- Investigacion de atencion dispersa y MoE en hardware no CUDA: usar el checkpoint como banco de pruebas para reproducir el comportamiento de la atencion dispersa y del enrutado de expertos en cuatro dispositivos 310P3.
- Validacion de recuperacion de contexto largo: aprovechar la ventana configurada de 262.144 tokens para estudiar el prefill en frio y el comportamiento del prefijo cacheado, dado que el estudio registro peticiones con 23.168 tokens de prefijo en cache.
- Pruebas de integracion de tool calling en pipelines internos: verificar el ciclo completo de invocacion de funciones antes de construir un agente sobre esta base, dado que las comprobaciones de humo ya cubren llamadas a herramientas.
- Auditoria de reproducibilidad de checkpoints cuantizados: emplear `PROVENANCE.json` y el recuento de bytes para auditar la trazabilidad de una conversion BF16 a INT4 con empaquetado de nibbles.
- Analisis de viabilidad de vision multimodal en 310P: comprobar si los componentes de vision conservados en coma flotante pueden activarse en esta ruta de servicio, algo que la documentacion no confirma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha completado una repeticion completa de GPQA, ningun benchmark de codigo ni ningun resultado de precision independiente sobre un conjunto retenido para este checkpoint W4, y que su calidad de cuantizacion no puede inferirse de los resultados de conversion del modelo W8 complementario, que usaba otra configuracion de servicio.

Las unicas cifras disponibles son mediciones de servicio de la propia card, que no constituyen benchmarks de calidad:

| Medicion | Resultado observado |
|---|---|
| Pesos residentes por rango (W4) | 19,382 GiB |
| Pesos residentes por rango (W8, mismo control de memoria) | 33,040 GiB |
| Decodificacion W4, prompts cortos, tres completados de 512 tokens | 14,71 tokens/s de mediana |
| Decodificacion W4, prompts de ~23,4K tokens, tres completados de 512 tokens | 14,60 tokens/s de mediana |
| Contexto maximo configurado (prompt mas completado) | 262.144 tokens |
| Secuencias concurrentes maximas configuradas | 2 |
| Comprobaciones superadas | Aritmetica, conteo, salida Python, llamada a herramientas, recuperacion de contrasena de 8K |
| Comprobaciones no realizadas | GPQA completo, benchmark de codigo, precision retenida independiente |

Las medianas de decodificacion son mediciones de streaming de cliente con peticion unica, excluyen el tiempo hasta el primer token y proceden de un estudio de optimizacion del runtime W4 que comparo dos compilaciones con el mismo checkpoint y las mismas peticiones. No se reejecuto el W8 en esa misma configuracion.

## Requisitos de hardware

- VRAM o memoria por dispositivo: aproximadamente 19,382 GiB de pesos residentes por rango con el checkpoint W4, medidos en la comprobacion controlada W4/W8. La cifra de 181,7 GB del repositorio corresponde a los ficheros del checkpoint, no al uso por dispositivo.
- GPU o acelerador admitido: exclusivamente Ascend. El objetivo declarado son dos tarjetas Atlas 300I Duo expuestas como cuatro dispositivos Ascend 310P3, con `--tensor-parallel-size 4`. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no aplicable. El checkpoint requiere operadores 310P compilados y no esta destinado a CUDA.
- Opciones de despliegue: vLLM Ascend mediante un fork especifico (OpenSensor vLLM), junto con una instantanea de desarrollo de vLLM Ascend con capacidad W4 y operadores W4 para 310P. No es compatible directamente con vLLM Ascend estandar ni con llama.cpp, Ollama o TGI, que no aparecen en la informacion disponible.
- Backend de cuantizacion: el backend por defecto `eager_dequant` admite aislamiento basico; la ruta de grafo medida selecciono explicitamente `cube_310_routed`.
- Latencia y throughput: 14,71 tokens/s de mediana con prompts cortos y 14,60 tokens/s con prompts de aproximadamente 23,4K tokens, en completados de 512 tokens y con peticion unica. Estos valores excluyen el tiempo hasta el primer token y dependen del hardware, la afinidad de CPU y la compilacion del runtime.
- Limites operativos: el maximo de secuencias concurrentes configurado es 2. La peticion completa de dos ventanas de 262K se detuvo durante el prefill en frio por un guardin conservador de crecimiento de swap; ni una peticion completa de 262K ni dos ventanas completas simultaneas han sido validadas.

## Comparativa con modelos similares

Los unicos elementos comparables documentados son el modelo base en BF16 y el checkpoint complementario W8A8 del mismo autor. No se dispone de datos de otros modelos de la misma categoria.

| Variante | Cuantizacion de expertos | Ruta de activacion en 310P | Ficheros del checkpoint | Pesos residentes por rango | Estado de validacion |
|---|---|---|---|---|---|
| Este checkpoint (W4A16 G128) | INT4 con signo empaquetado, grupos de 128 | Entrada FP16 a la matmul de expertos solo pesos | 181,71 GB | 19,382 GiB | Comprobaciones de humo y recall de 8K; sin validacion de calidad a nivel de modelo |
| Companion W8A8 Dynamic | INT8 por canal de salida | Entrada FP16 con INT8 dinamico por token dentro de la matmul agrupada; MTP con ruta W8A16 solo pesos | 240,06 GB | 33,040 GiB | Resultados de conversion en tiempo de cuantizacion; no reejecutado en la configuracion W4 |
| Base `Qwen/Qwen3.8-Flash-Next` | BF16 sin cuantizar | no disponible | no disponible | no disponible | no disponible |

Las dos variantes cuantizadas usan configuraciones de servicio distintas, por lo que sus tasas de decodificacion medidas no deben interpretarse como una comparacion controlada de cuantizacion.

## Limitaciones y advertencias

- Checkpoint experimental: la propia model card advierte de que requiere un runtime de desarrollo propio y operadores Ascend 310P compilados, y de que no es un modelo sustituible directamente en vLLM Ascend estandar.
- Calidad no validada: no se ha completado ninguna repeticion de GPQA, ningun benchmark de codigo ni ningun resultado de precision independiente sobre datos retenidos. Las comprobaciones de humo y el recall de contrasenas no establecen calidad amplia.
- Sin revision publica del runtime: la revision publica definitiva del runtime aun no se ha congelado, lo que compromete la reproducibilidad del despliegue.
- Contexto no validado en el extremo: los 262.144 tokens son un limite configurado, no una capacidad verificada. No se ha validado una peticion completa de 262K ni dos ventanas completas simultaneas, y una prueba de dos peticiones de 262K se interrumpio durante el prefill en frio.
- Concurrencia muy limitada: el maximo configurado es de dos secuencias concurrentes, insuficiente para cargas de produccion con trafico real.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo ni de alineamiento para este checkpoint.
- Riesgo de alucinacion: no disponible. No se aportan metricas de fidelidad ni de veracidad.
- Idiomas: no disponible. La ficha no declara cobertura idiomatica alguna, lo que impide planificar despliegues multilingues.
- Licencia: `qwen-community-1.0`, registrada como `license: other`. Es una licencia propia de la comunidad Qwen cuyos terminos deben revisarse antes de cualquier uso comercial; la informacion proporcionada no detalla condiciones de atribucion, redistribucion ni restricciones de uso.
- Repositorio sin traccion: cero descargas y cero valoraciones en el momento de la consulta, lo que reduce la probabilidad de que los problemas de integracion ya hayan sido reportados por terceros.
- Dependencia de hardware obsoleto: el objetivo son aceleradores Ascend 310P3, lo que limita la portabilidad y el soporte a largo plazo.
- Fichero truncado en la documentacion: el ejemplo de servicio de la model card aparece cortado en la informacion disponible, por lo que la configuracion completa de despliegue no puede reproducirse a partir de esta ficha.

## Enlaces

- Repositorio del modelo: https://huggingface.co/matteiuspi/Qwen3.8-Flash-Next-W4A16-G128-300i
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint complementario W8A8 Dynamic: https://huggingface.co/matteiuspi/Qwen3.8-Flash-Next-W8A8-DYNAMIC-300i
- Procedencia y auditoria de conversion: https://huggingface.co/matteiuspi/Qwen3.8-Flash-Next-W4A16-G128-300i/blob/main/PROVENANCE.json
- Resumen de benchmarks de servicio: https://huggingface.co/matteiuspi/Qwen3.8-Flash-Next-W4A16-G128-300i/blob/main/benchmark-summary-20260927.json
- Licencia: https://huggingface.co/matteiuspi/Qwen3.8-Flash-Next-W4A16-G128-300i/blob/main/LICENSE

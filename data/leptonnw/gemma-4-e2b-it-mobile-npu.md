# LEPTONNW/gemma-4-E2B-it-mobile-NPU

## Resumen

LEPTONNW/gemma-4-E2B-it-mobile-NPU es una conversión comunitaria del modelo instructivo Google Gemma 4 E2B (google/gemma-4-E2B-it) orientada a ejecución local en la NPU Hexagon de Qualcomm. No se trata de un modelo nuevo ni de un ajuste fino: el autor indica explícitamente que el modelo original no se ha reentrenado y que el trabajo consiste en exportar y cuantizar los pesos para el runtime PyTorch ExecuTorch con el backend Qualcomm QNN HTP.

El artefacto distribuido es un único fichero .pte de 3.361.616.512 bytes (aproximadamente 3,36 GB) compilado para el SoC Snapdragon 8 Gen 1 / SM8450 (Hexagon v69), con una receta de cuantización mixta W4/W8, activaciones de 16 bits y KV de 16 bits. El contexto está fijado en 2.048 tokens (entrada y salida combinadas) y no se puede ampliar en tiempo de ejecución porque el grafo está compilado con esa longitud. El modelo es solo texto: visión, audio y MTP no están incluidos.

Su relevancia es de nicho pero clara: demuestra que un modelo de la familia Gemma 4 puede ejecutarse íntegramente en la NPU de un teléfono Android de gama alta de 2022, sin conexión y sin GPU dedicada, con un throughput medido de 6,45 a 6,78 tokens por segundo en decodificación nativa sobre un Galaxy S22 Ultra. Es un artefacto experimental, con 0 descargas y 0 likes en el momento de la ficha, y requiere construir el runner de ExecuTorch en una revisión concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base. El artefacto es un grafo ExecuTorch de decodificador transformer con proyecciones FFN gate/up/down, proyecciones de atención y cabeza de salida |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | 2.048 tokens fijos, entrada y salida combinadas; no ampliable en runtime |
| Tipos de cuantización | Mixta W4 block32 / W8 en el decodificador, activaciones A16, KV16; embeddings en CPU en Q4 con group size 32; la entrada derecha del MatMul de atención se recuantiza a 8 bits por compatibilidad con v69 |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache-2.0 (modelo original y conversión). ExecuTorch: BSD-3-Clause. SDK y runtime de Qualcomm: sujetos a los términos propios de Qualcomm |
| Formato de pesos | .pte (ExecuTorch) para backend Qualcomm QNN. Tokenizer en JSON. Vocabulario GGUF opcional sin tensores de modelo |
| Fichero de pesos | gemma4-e2b-v69-mixed4b32-ffn-all-tail8w8-kv16-quality-2k-shard11.pte |
| Tamaño en disco | 3.361.616.512 bytes (unos 3,36 GB); el repositorio completo ocupa 3,4 GB |
| SHA-256 | 38faf5d2337d9fb2b75b2ddca0fb3c63d916b2795c55bff6a1b6b92c027e8c7b |
| Backend de ejecución | ExecuTorch Qualcomm QNN HTP, QNN SDK/runtime 2.37.0.250724 |
| Target de hardware | SM8450 / Hexagon v69 (Snapdragon 8 Gen 1) |
| Delegados QNN | 12 |
| Revisión de ExecuTorch probada | ca56e1ffdba1c902d9202021d7297982d3501439 |
| Revisión del código fuente | 3e22461f65e89153144f8adb70e3b8c2cc9845a7 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es una conversión de pesos del modelo instructivo google/gemma-4-E2B-it, que el autor declara no haber ajustado. El pipeline aplicado es de exportación y cuantización para ExecuTorch con el backend Qualcomm QNN HTP, más un conjunto de kernels portables en CPU para el embedding de tokens. Los detalles arquitectónicos del modelo base (número de capas, dimensión oculta, tipo de atención, si emplea mezcla de expertos) no se especifican en la información disponible.

La receta de cuantización sí está descrita con precisión. Las proyecciones FFN gate/up/down usan principalmente W4, mientras que las ocho últimas proyecciones FFN down del cross-decoder se mantienen en W8. El resto de proyecciones del decodificador, incluidas atención y cabeza de salida, permanecen en W8. La entrada derecha del MatMul de atención se recuantiza a 8 bits por compatibilidad con Hexagon v69. Las activaciones son de 16 bits y la caché KV también. La metadata completa está en quantization.json, y el tokenizer JSON está pensado para el runner de ExecuTorch.

El modelo resultante se reparte en 12 delegados QNN y se compila con contexto fijo de 2K. El autor advierte que aumentar el ajuste de contexto en el runtime no extiende el modelo compilado, y que el .pte no puede cargarse como GGUF en llama.cpp: el fichero GGUF incluido contiene únicamente vocabulario y plantilla de chat, sin tensores.

## Capacidades

- Generación de texto conversacional en inglés y coreano, en modo instructivo.
- Generación de código: en el benchmark del autor produce respuestas en Java completas que compilan (3 de 3 compilaron), aunque la corrección funcional fue de 2 de 3.
- Ejecución de tareas simples de razonamiento y aritmética dentro del prompt (la petición de suma de 1 a 20 devolvió el resultado correcto, 210).
- Procesamiento de entradas de al menos 1.299 tokens, verificado en una petición independiente, dentro del límite de 2.048 tokens.
- Decodificación greedy reproducible (temperature=0) para pruebas deterministas.
- Tokenización y plantilla de chat disponibles de forma independiente mediante el vocabulario GGUF opcional, para usar con otros tokenizadores.
- No incluye visión, audio ni MTP (multi-token prediction), pese a que la familia base pueda contemplarlos.
- No hay soporte confirmado de tool calling ni function calling en la información disponible.
- No hay soporte confirmado de modo de razonamiento extendido (thinking) ni de capacidades de agente multi-paso.
- No se ha realizado una evaluación multilingüe amplia; los idiomas declarados son en y ko.

## Casos de uso

- Asistente de texto totalmente offline en Android: el modelo se ejecuta en la NPU del Snapdragon 8 Gen 1 sin enviar datos a la nube, lo que encaja en escenarios con requisitos estrictos de privacidad (notas personales, mensajería, salud).
- Autocompletado y generación de fragmentos de código en un editor móvil: el benchmark del autor demuestra generación de Java que compila directamente en el dispositivo, útil para entornos de desarrollo sin conexión estable.
- Chat conversacional en inglés o coreano integrado en una aplicación Android: la ventana de 2.048 tokens permite mantener varios turnos de conversación cortos con historial.
- Resumen y reescritura de textos breves en el dispositivo: notas, correos o mensajes de hasta unos pocos cientos de tokens entran holgadamente en el contexto compilado.
- Validación técnica de despliegues ExecuTorch + QNN: sirve como referencia reproducible para equipos que quieran portar modelos Gemma a la NPU Hexagon con cuantización mixta y delegados QNN.
- Procesamiento de datos sensibles en dispositivos corporativos o industriales con SoC SM8450, donde no se permite el envío de información a servicios externos.
- Demostraciones y docencia sobre inferencia en el borde: permite medir throughput real (6,45-6,78 tokens/s) y consumo en un teléfono de gama alta sin infraestructura de servidor.
- Aplicaciones de campo en terminales rugerizados basados en Snapdragon 8 Gen 1 que necesiten generación de texto local y toleren latencias de decodificación de varios cientos de milisegundos por token.

## Benchmarks y rendimiento

El autor publica un benchmark ejecutado en un Samsung Galaxy S22 Ultra (SM-S908N, Snapdragon 8 Gen 1 / SM8450, 12 GB de RAM) con ejecución real en Hexagon v69, decodificación greedy (temperature=0) y tres peticiones de generación de código Java en coreano.

| Petición | Tokens/s en decodificación nativa | Resultado de la ejecución del código |
|---|---:|---|
| Rombo básico | 6,78 | Compila; la lógica del rombo es incorrecta |
| Rombo con Scanner | 6,52 | Compila; pasa las entradas 1, 2, 3, 5 y 7 |
| Suma de 1 a 20 | 6,45 | Compila; resultado correcto: 210 |

El throughput observado se sitúa en aproximadamente 6,5-6,8 tokens por segundo. Son tasas de decodificación nativa, excluyendo la carga del modelo y el procesamiento del prompt, y no describen la latencia extremo a extremo ni un rendimiento sostenido garantizado. Las tres respuestas Java compilaron, pero las comprobaciones funcionales pasaron 2 de 3: el rombo básico imprimió solo un asterisco por fila. El autor conserva el fallo en el benchmark y señala que el mismo modelo en formato GGUF Q4_K_M sí generó un rombo funcional para esa petición. No se realizó comparación de velocidad entre CPU, GPU y NPU del teléfono, ni una evaluación multilingüe amplia. Los recuentos de tokens y tiempos nativos están en benchmark.json. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Ejecución exclusivamente en la NPU Hexagon v69 del Snapdragon 8 Gen 1 / SM8450. No hay soporte documentado para otros aceleradores.
- Almacenamiento necesario: unos 3,36 GB para el fichero .pte, más el espacio del runtime y del vocabulario.
- Dispositivo de referencia: Samsung Galaxy S22 Ultra SM-S908N con 12 GB de RAM.
- No está pensado para GPU de escritorio ni de servidor. No hay datos de funcionamiento en A100, H100, RTX 4090 ni similares, y el formato .pte con backend QNN no es compatible con esos entornos.
- Opciones de despliegue: únicamente ExecuTorch con backend Qualcomm QNN 2.37.0.250724 y el runner compatible con Gemma (qnn_llama_runner) en su revisión ca56e1ffdba1c902d9202021d7297982d3501439. El runner antiguo, solo para Qwen, es incompatible.
- No es compatible con vLLM, TGI, Ollama ni llama.cpp para inferencia: el .pte no se puede cargar como GGUF.
- Los binarios del runtime se obtienen por separado bajo sus propias licencias; no se incluyen en el repositorio.
- Throughput medido: 6,45-6,78 tokens/s de decodificación nativa en el dispositivo de prueba. Latencia extremo a extremo y consumo energético: no disponibles.
- Otros objetivos Snapdragon y los SoC Exynos no han sido validados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-mobile-NPU | No disponible | 2.048 tokens fijos | 6,45-6,78 tokens/s en SM8450; 2 de 3 comprobaciones funcionales superadas | Apache-2.0 (runtime Qualcomm aparte) | HuggingFace; requiere ExecuTorch + QNN |
| google/gemma-4-E2B-it (modelo base) | No disponible | No disponible | No disponible | Apache-2.0 | HuggingFace |
| Baseline Q4_K_M GGUF del mismo modelo | No disponible | No disponible | Generó un rombo funcional en la petición que falló en la versión NPU; sin cifras de velocidad publicadas | No disponible | No disponible |

No se han identificado en la información proporcionada otras conversiones comparables a NPU Hexagon para esta familia de modelos, por lo que la comparativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor, con 0 descargas y 0 likes; no hay evidencia de uso en producción.
- Contexto fijo de 2.048 tokens compartido entre entrada y salida. No se puede ampliar: cambiar el ajuste de contexto en el runtime no modifica el grafo compilado.
- Solo texto. Visión, audio y MTP no están incluidos, aunque el modelo base pueda soportarlos.
- Idiomas limitados a inglés y coreano. No se ha realizado una evaluación multilingüe amplia y no hay garantías fuera de esos dos idiomas.
- Riesgo de alucinación inherente a un modelo generativo de este tamaño, agravado por la cuantización agresiva W4 en las proyecciones FFN.
- Calidad no establecida frente a la versión GGUF equivalente: el autor indica explícitamente que no se ha determinado la paridad de calidad con GGUF, y documenta un fallo funcional en la generación del rombo básico que la variante Q4_K_M sí resolvió.
- Compatibilidad muy restringida: solo validado en SM8450 / Hexagon v69 con QNN 2.37.0.250724 y una revisión concreta de ExecuTorch. Otros Snapdragon y Exynos no han sido probados.
- Incompatible con llama.cpp, vLLM, Ollama y TGI para inferencia. El fichero GGUF incluido no contiene tensores, solo vocabulario y plantilla de chat.
- Licencia Apache-2.0 para el modelo y la conversión, pero el SDK y el runtime de Qualcomm quedan sujetos a los términos separados de Qualcomm, que hay que revisar antes de un uso comercial. Los binarios del runtime no se distribuyen en el repositorio.
- Sin datos publicados de consumo energético, latencia extremo a extremo ni rendimiento sostenido en sesiones largas, factores críticos en un dispositivo móvil.
- El rendimiento medido procede de tres peticiones cortas con decodificación greedy, una muestra demasiado pequeña para extrapolar comportamiento general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LEPTONNW/gemma-4-E2B-it-mobile-NPU
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio PyTorch ExecuTorch: https://github.com/pytorch/executorch
- Revisión probada de ExecuTorch: https://github.com/pytorch/executorch/tree/ca56e1ffdba1c902d9202021d7297982d3501439
- Backend Qualcomm QNN de ExecuTorch: https://github.com/pytorch/executorch/tree/ca56e1ffdba1c902d9202021d7297982d3501439/backends/qualcomm
- Runner compatible con Gemma (qnn_llama_runner): https://github.com/pytorch/executorch/tree/ca56e1ffdba1c902d9202021d7297982d3501439/examples/qualcomm/oss_scripts/llama

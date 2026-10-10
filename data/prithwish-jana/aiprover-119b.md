# prithwish-jana/aiprover-119b

## Resumen

AIProver-119b es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 119.000 millones de parámetros totales y aproximadamente 6.000 millones activos por token, publicado por el usuario prithwish-jana en HuggingFace. Está especializado en demostración automática de teoremas en Lean 4 y en autoformalización, es decir, la traducción de enunciados matemáticos en lenguaje natural a código Lean 4 verificable.

El modelo declara una ventana de contexto de hasta 1.048.576 tokens, pesos en FP8 (e4m3) y formato consolidado de Mistral, y se distribuye bajo licencia AGPL-3.0. La model card indica que se apoya en un modelo base con licencia Apache-2.0 cuyos términos se respetan, aunque no identifica ese modelo base. El repositorio ocupa 120,1 GB.

Su relevancia es doble: aplica una arquitectura MoE dispersa al razonamiento formal, un campo dominado por modelos densos de 7B a 72B y por el MoE de DeepSeek-Prover-V2, y combina demostración y autoformalización en un único modelo con contexto muy largo. No obstante, en el momento de redactar esta ficha no hay benchmarks publicados, ni código de entrenamiento liberado, ni documentación sobre el dataset empleado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) de 36 capas |
| Parámetros totales | 119.000 millones (119B) |
| Parámetros activos | ~6.000 millones por token |
| Longitud de contexto | Hasta 1.048.576 tokens |
| Tipos de cuantización | FP8 (e4m3) en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors en formato consolidado de Mistral (`consolidated-*.safetensors`), con `params.json` y `tekken.json` |
| Expertos | 128 expertos enrutados más 1 experto compartido; 4 expertos por token |
| Tamaño del repositorio | 120,1 GB |
| Librería declarada | vLLM |

## Arquitectura y entrenamiento

La model card describe una arquitectura transformer de 36 capas con enrutamiento disperso: 128 expertos enrutados más un experto compartido, con 4 expertos activados por token. Con 119B parámetros totales y ~6B activos, el coste computacional por token es comparable al de un modelo denso de 6B, mientras que el coste de memoria es el de un modelo de 119B. Los pesos se publican directamente en FP8 (e4m3), lo que reduce el peso en disco y memoria a aproximadamente 120 GB, coherente con el tamaño del repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones de decodificación. La model card solo indica que el modelo se apoya en otro modelo con licencia Apache-2.0 y que el código de entrenamiento y del entorno de evaluación («harness») se publicará por separado; en el momento de esta ficha ese código no está disponible. El uso del tokenizador `tekken.json` es característico de la familia Mistral, lo que sugiere ese origen para el modelo base, pero la model card no lo confirma.

## Capacidades

- Demostración automática de teoremas en Lean 4: generación de pruebas completas que compilan contra el comprobador de Lean 4.
- Autoformalización: traducción de enunciados matemáticos en lenguaje natural a declaraciones y pruebas en Lean 4.
- Razonamiento matemático formal de múltiples pasos, orientado a la búsqueda de pruebas.
- Contexto largo (hasta 1.048.576 tokens), adecuado para repositorios de Lean completos, estados de prueba extensos o bibliotecas de teoremas como Mathlib.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado explícitamente, aunque el contexto largo y el uso declarado de vLLM permiten integrarlo en bucles de búsqueda de pruebas dirigidos por el usuario; no hay confirmación por parte del autor.
- Capacidades multilingües: no disponibles (la model card no especifica idiomas naturales soportados).
- Capacidades especiales (modo «thinking», visión, audio): no disponibles.

## Casos de uso

- Demostración automática de lemas en Lean 4: dado un enunciado y un estado de prueba (goal state), el modelo genera tácticas y pruebas candidatas que se validan con el compilador de Lean 4. El contexto de 1M tokens permite incluir definiciones y lemas auxiliares extensos sin truncar.
- Autoformalización de artículos y apuntes de matemáticas: conversión de teoremas redactados en lenguaje natural a declaraciones Lean 4, como paso previo a su verificación formal por un matemático.
- Reparación de pruebas fallidas: a partir de un error del compilador de Lean 4, el modelo propone correcciones sobre la prueba existente, lo que encaja en flujos iterativos de compilación y reintento.
- Búsqueda de pruebas dirigida por agentes: integrado en un bucle con Lean como herramienta de verificación, el modelo puede explorar ramas de prueba, descartar las que no compilan y continuar con las válidas.
- Generación de datasets formales: producción de pares (enunciado en lenguaje natural, prueba en Lean 4) para entrenar o evaluar otros demostradores automáticos, sujeto a verificación con el comprobador.
- Verificación formal de especificaciones de software: formalización de invariantes y pre/postcondiciones de funciones en Lean 4, útil en proyectos que exigen pruebas mecánicamente comprobadas.
- Apoyo a la docencia en matemáticas discretas y lógica: generación de pruebas comentadas paso a paso, siempre que el resultado se valide con Lean 4 antes de su uso.
- Integración en pipelines de CI: dado que la salida es código Lean 4 verificable, las pruebas generadas pueden comprobarse automáticamente en integración continua antes de aceptarlas, lo que mitiga el riesgo de contenido incorrecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de AIProver-119b no incluye cifras de MiniF2F, ProofNet, LeanWorkbook ni de ningún otro conjunto de evaluación, y la búsqueda web no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- Peso de los pesos en FP8: aproximadamente 119-120 GB, por lo que la inferencia exige al menos 2 GPU de 80 GB (H100, H200 o A100) solo para alojar los pesos, antes de reservar memoria para el KV cache.
- VRAM estimada: alrededor de 130-160 GB para pesos y overhead de ejecución en configuraciones cortas de contexto; el KV cache de una ventana de 1.048.576 tokens no está cuantificado en la información disponible y puede requerir nodos multi-GPU.
- GPU recomendadas: H100 80 GB o H200 para aprovechar el cómputo FP8 nativo (arquitectura Hopper); L40S como alternativa en una sola máquina con varias tarjetas. En A100 80 GB, vLLM tendría que decuantizar o ejecutar FP8 con soporte limitado, con mayor consumo de memoria y menor rendimiento.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar los 120 GB de pesos, ni siquiera con cuantizaciones de 4 bits, que además no se publican para este modelo.
- Opciones de despliegue: vLLM es la librería declarada en la model card y el formato de pesos es el consolidado de Mistral, por lo que vLLM es la vía documentada. El soporte en llama.cpp, Ollama, TGI o SGLang no está documentado ni confirmado para este formato FP8.
- Latencia y throughput: no disponible. Con ~6B parámetros activos por token, la decodificación estaría limitada por ancho de banda de memoria (119B parámetros a leer por token en el peor caso de enrutamiento no cacheado) más que por cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIProver-119b | 119B (MoE, 128+1 expertos) | ~6B | 1.048.576 tokens | AGPL-3.0 | HuggingFace, formato FP8 consolidado de Mistral, para vLLM |
| DeepSeek-Prover-V2-671B | 671B (MoE) | 37B | 163.840 tokens | Licencia de modelo DeepSeek | HuggingFace, ampliamente utilizado en demostración formal |
| Kimina-Prover-72B | 72B (denso) | 72B | no disponible | Apache-2.0 | HuggingFace, basado en la familia Qwen2.5-72B |
| Goedel-Prover-V2 | no disponible | no disponible | no disponible | no disponible | HuggingFace, orientado a Lean 4 |

No se dispone de resultados comparativos de rendimiento entre AIProver-119b y estos modelos, ya que el primero no publica métricas. La comparación anterior se limita a parámetros, contexto, licencia y disponibilidad según información pública de cada proyecto.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay cifras de MiniF2F, ProofNet ni de ningún otro conjunto, por lo que no es posible situar su rendimiento frente a DeepSeek-Prover-V2, Kimina-Prover u otros demostradores.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Cualquier obra derivada distribuida o expuesta como servicio en red debe publicarse bajo la misma licencia, lo que la hace incompatible con productos propietarios que no quieran liberar su código.
- Riesgo de alucinación en autoformalización: el modelo puede generar código Lean 4 sintácticamente válido que no corresponde al enunciado original. La verificación con el comprobador de Lean 4 valida la prueba, no la fidelidad de la formalización, que debe revisarse aparte.
- Trazabilidad limitada del entrenamiento: no se documentan dataset, número de tokens, composición de datos ni técnicas de alineación (RLHF, DPO), lo que impide auditar sesgos o calidad.
- Idiomas: la model card no especifica idiomas naturales soportados ni calidad multilingüe.
- Cuantización única: solo se publican pesos FP8 (e4m3); no hay versiones BF16, GGUF ni cuantizaciones de 4 bits, lo que limita el despliegue en hardware sin soporte FP8.
- Contexto declarado frente a contexto efectivo: se anuncian 1.048.576 tokens, pero no hay evaluación publicada sobre la degradación del rendimiento en ventanas largas.
- Modelo no validado por la comunidad: 0 descargas y 2 «likes» en el momento de la consulta, sin paper, sin repositorio de código y sin versiones anteriores.
- Código de entrenamiento y harness pendientes de publicación, según la propia model card, lo que impide reproducir el modelo.
- Modelo base no identificado: la model card menciona un modelo Apache-2.0 como base, pero no lo nombra; el tokenizador `tekken.json` apunta a la familia Mistral sin confirmación oficial.

## Enlaces

- HuggingFace: https://huggingface.co/prithwish-jana/aiprover-119b
- Paper: no disponible
- Repositorio de código: no disponible (la model card indica que se publicará por separado)
- Demo: no disponible
- Blog o documentación adicional: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo.

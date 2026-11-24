# litert-community/granite-4.0-h-1b

## Resumen

Granite-4.0-h-1b es un modelo de lenguaje de IBM con arquitectura híbrida que combina bloques Mamba2 (selective-scan) con un pequeño número de bloques de atención con grouped-query attention. Esta ficha concreta, publicada por litert-community, no es el modelo original en PyTorch sino una conversión al formato LiteRT-LM (`.litertlm`) de Google, pensada para inferencia on-device en dispositivos móviles y edge. El resultado es un artefacto de 1,68 GB en cuantización int8 dinámica que puede ejecutarse en Android, iOS y macOS a través del runtime LiteRT-LM.

El modelo resuelve el problema de desplegar un LLM con contexto razonablemente largo en hardware con memoria limitada. Al sustituir la mayor parte de la caché KV por un estado recurrente de tamaño constante, el consumo de memoria crece muy poco con la longitud de contexto: solo las 4 capas de atención mantienen KV, con un presupuesto de 4096 tokens. Según la model card, es el primer LLM híbrido Mamba2 servido por el runtime LiteRT-LM publicado y, desde la actualización del 13 de agosto de 2026, el primero en ejecutar su selective scan en una GPU móvil.

La relevancia actual viene de su madurez práctica: funciona en litert-lm 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2, con decodificación en CPU a 39,2 tok/s tras la reconversión de agosto, y con delegación completa del grafo a GPU verificada en Metal (macOS, iPhone 17 Pro) y en Arm Mali con OpenCL (Pixel 8a). La licencia Apache 2.0 y el soporte de tool calling lo hacen apto para integraciones en producción, con las salvedades de runtime que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 36 capas Mamba2 (selective-scan) + 4 capas de atención con grouped-query attention |
| Parametros totales | clase 1B/1.5B (valor exacto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (presupuesto KV de las 4 capas de atención) |
| Tipos de cuantizacion | int8 dinámica en capas lineales y embedding; convoluciones y selective scan en coma flotante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), fichero `granite-4.0-h-1b_int8.litertlm` de 1,68 GB |
| Modelo base | ibm-granite/granite-4.0-h-1b |
| Runtime | LiteRT-LM 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2 |
| Tamano del repo | 8,4 GB |

## Arquitectura y entrenamiento

El modelo base de IBM emplea una arquitectura híbrida en la que los bloques Mamba2 constituyen la mayoría de la profundidad (36 de 40 capas) y solo 4 capas usan atención con grouped-query attention. Los bloques Mamba2 mantienen por capa un estado recurrente de tamaño constante (convolución más SSM) en lugar de una caché KV que crece con el contexto, de modo que el coste de memoria es prácticamente plano respecto a la longitud de la secuencia; únicamente las 4 capas de atención acumulan KV, con un presupuesto declarado de 4096 tokens. Esta conversión concreta no aporta detalles sobre el corpus de entrenamiento, el número de tokens ni si hubo RLHF o DPO: esa información corresponde a la model card del modelo original de IBM, no a este artefacto.

La innovación técnica de esta ficha está en el proceso de conversión, no en el entrenamiento. La reconversión del 13 de agosto de 2026 reexpresó el selective scan como productos matriciales por lotes, con todos los tensores de rango ≤ 4 y sin intermedios de broadcast gigantes. Las consecuencias medidas en la misma máquina y protocolo son dos: la decodificación en CPU pasó de 11,4 a 39,2 tok/s (unas 3,5 veces más rápida) y el grafo pasó a delegarse por completo a la GPU. La ejecución en GPU exige activaciones en fp32, que el fichero declara explícitamente. La equivalencia numérica del scan reescrito se verifica en cada exportación con una autocomprobación interna; además, el export en coma flotante que respalda este fichero coincide con el modelo PyTorch de Hugging Face a nivel de logits en una comparación de decodificación teacher-forced de 8 pasos: diferencia máxima por posición ≤ 1,1e-4, correlación 1,000000 y top-1 y top-5 idénticos en todas las posiciones.

## Capacidades

- Generación de texto autoregresiva en formato de chat, con plantilla de conversación que renderiza resultados de herramientas desde el reempaquetado del 14 de octubre de 2026.
- Razonamiento aritmético básico y respuesta a preguntas de cultura general: la comprobación de sanidad de 8 preguntas se supera con 7/8 en CPU y en GPU.
- Tool calling / function calling: el runtime analiza la llamada a herramienta y el resultado llega al modelo en litert-lm 0.18.0 tras el reempaquetado de metadatos.
- Inferencia on-device con memoria casi constante respecto al contexto, gracias al estado recurrente de Mamba2.
- Ejecución en CPU y en GPU (Metal en macOS e iOS, OpenCL sobre Arm Mali en Android).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistentes integrados en aplicaciones Android: el fichero se ejecuta con delegación completa del grafo en OpenCL sobre un Pixel 8a (Arm Mali), sin operadores rechazados y con todos los subgrafos delegados, lo que permite un asistente local sin conexión dentro de una app.
- Funciones de texto en apps iOS y macOS: la delegación a Metal está verificada en macOS y en iPhone 17 Pro, de modo que el modelo puede generar respuestas y resúmenes en el propio dispositivo sin enviar datos a un servidor.
- Automatización con herramientas en el cliente: al soportar tool calling en litert-lm 0.18.0, puede invocar funciones locales (calendario, ficheros, APIs del sistema) y consumir sus resultados dentro de la conversación.
- Procesamiento de documentos con contexto moderado: con 4096 tokens de ventana y memoria plana gracias a Mamba2, encaja en tareas de resumen o extracción sobre fragmentos de texto de extensión acotada en dispositivos con poca RAM.
- Prototipado y evaluación de arquitecturas híbridas: sirve como referencia ejecutable de un LLM Mamba2 híbrido en el runtime LiteRT-LM, útil para medir latencia y consumo en hardware real antes de apostar por arquitecturas similares.
- Educación y demostraciones offline: al caber en 1,68 GB y funcionar en CPU de escritorio a 39,2 tok/s, permite desplegar un chatbot de demostración en un portátil sin GPU dedicada.
- Pruebas de regresión de runtimes: la model card documenta comparaciones entre versiones del runtime (0.15.0 a 0.19.2) y entre ficheros, lo que lo convierte en un caso de prueba práctico para validar actualizaciones de LiteRT-LM.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Sanity check de 8 preguntas | 7/8 | int8, CPU y GPU, Mac, litert-lm 0.15.0 y 0.16.0 |
| Sanity check de 8 preguntas (fichero previo al fix) | 8/8 | int8, fichero anterior al 2026-08-28 |
| GSM8K, 50 preguntas | 40 coincidencias entre ambos ficheros; las 10 discrepancias se reparten 6-4 a favor del antiguo | muestra pequena, diferencia atribuida a ruido |
| Decodificacion en CPU | 39,2 tok/s (antes 11,4 tok/s) | misma maquina y protocolo, tras reconversion 2026-08-13 |
| Equivalencia con PyTorch | max\|diff logit\| ≤ 1,1e-4, correlacion 1,000000, top-1 y top-5 identicos | decodificacion teacher-forced de 8 pasos, export float |
| Delegacion GPU | 0 operadores rechazados, todos los subgrafos delegados | Pixel 8a, Arm Mali, OpenCL |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero int8 ocupa 1,68 GB en disco; la ejecución en GPU requiere activaciones en fp32, lo que incrementa el consumo de memoria respecto a la ruta de CPU (la model card no cuantifica ese coste).
- GPU recomendadas: no hay una lista oficial; la validación cubre Metal en macOS e iPhone 17 Pro y OpenCL sobre Arm Mali en Pixel 8a.
- Cabe en hardware de consumo: sí. Verificado en Pixel 8a, iPhone 17 Pro y CPU de Mac; la decodificación en CPU de escritorio alcanza 39,2 tok/s.
- Opciones de despliegue: exclusivamente el runtime LiteRT-LM (versiones 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2 en CPU; GPU en Mac con 0.19.2). No se distribuye en GGUF, safetensors ni otros formatos en este repositorio.
- Latencia y throughput: 39,2 tok/s en decodificación por CPU en Mac tras la reconversión de agosto de 2026; no se publican cifras de throughput en GPU ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| granite-4.0-h-1b (LiteRT-LM, esta ficha) | clase 1B/1,5B | 4096 | Híbrida Mamba2 + atención | Apache 2.0 | `.litertlm` int8, 1,68 GB, on-device |
| ibm-granite/granite-4.0-h-1b (original) | clase 1B/1,5B | no disponible | Híbrida Mamba2 + atención | Apache 2.0 | Pesos PyTorch en Hugging Face |
| Alternativas de ~1B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de otros modelos comparables de la misma categoría, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Una conversación por Engine: en litert-lm 0.18.0 el runtime reutiliza el estado recurrente de una conversación anterior al iniciar una nueva sobre el mismo Engine, sin reiniciar el estado. El fallo está reportado y existe un parche en la rama principal de LiteRT-LM desde el 3 de noviembre de 2026 (commit e1f86b05), pero ninguna versión publicada lo incorpora todavía (v0.19.1 no lo incluye). La solución práctica es crear un Engine nuevo por conversación; la primera conversación de cada Engine no se ve afectada.
- El fichero int8 obtiene 7/8 en la comprobación de sanidad: falla en 17 + 25, respondiendo 43. La retirada del token `start_token` en el arreglo de metadatos del 28 de agosto de 2026 desplaza la decodificación voraz en casos ajustados, en ambas direcciones.
- La medición de 8/8 en iPhone 17 Pro sobre GPU se realizó con el fichero anterior al arreglo de metadatos y no se ha repetido.
- La comparación de GSM8K se hizo sobre 50 preguntas; la propia model card califica de ruido la diferencia de 6 a 4 en las discrepancias.
- El contexto efectivo está limitado a 4096 tokens por el presupuesto KV de las 4 capas de atención; no debe asumirse una ventana mayor aunque el estado de Mamba2 sea de tamaño constante.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación en la documentación disponible.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones del runtime (gestión de estado entre conversaciones y delegación GPU en Android) deben resolverse antes de desplegar en producción.
- La ejecución en GPU exige activaciones fp32, con el coste de memoria asociado que la model card no detalla.
- El repositorio ocupa 8,4 GB aunque el fichero int8 pesa 1,68 GB; conviene descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-4.0-h-1b
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.0-h-1b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Informe del fallo de estado entre conversaciones: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Parche en la rama principal de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Medición de equivalencia de LiteRT en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md

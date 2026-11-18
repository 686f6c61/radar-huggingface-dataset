# BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF

## Resumen

Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF es una cuantización GGUF de 2 bits (formato PQ2_0 de PrismML) del modelo Ternary-Bonsai-2-27B, un transformer de 26.896 millones de parámetros con arquitectura híbrida (atención + capas SSM, según los tensores `ssm_out` documentados) y torre de visión opcional. Lo publica el usuario BoldingBuilds sobre el release de prism-ml, aplicando una edición de "abliteración" (eliminación de rechazos) sobre 98 tensores y un ajuste de una única fila de la capa de salida para forzar el cierre del bloque de razonamiento.

La relevancia de esta versión (v2) está en su comportamiento con el modo *thinking* activado: el autor reporta una puntuación de 0,941 en StrongReject (150 peticiones dañinas detalladas, presupuesto de 16.384 tokens) frente a 0,781 de su v1 y valores de 0,668-0,738 en builds alternativos, además de reducir a 7 sobre 150 las respuestas vacías. El modelo incluye además un fichero con cabezas MTP (multi-token prediction) para decodificación especulativa, que según el autor decodifica aproximadamente un 40% más rápido.

Se distribuye bajo licencia Apache 2.0, con un tamaño de repositorio de 15,5 GB y más de 44.000 descargas, lo que lo sitúa entre los derivados "uncensored" más populares de la familia Bonsai 2. Requiere obligatoriamente el fork de llama.cpp de PrismML: el formato PQ2_0 no lo cargan las builds estándar de llama.cpp, Ollama ni LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención + SSM) con torre de visión opcional; linaje `qwen3_5` |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | 32.768 tokens (configuración recomendada `-c 32768`) |
| Tipos de cuantizacion | PQ2_0 (2 bits ternario, ~2,1 bpw estimado a partir de 7,21 GB); variante PTQ1_0 (1,75 bpw) en repo aparte; proyector de visión Q8_0 |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Ternary-Bonsai-2-27B de prism-ml, un transformer de 27B con pesos ternarios y capas de estado recurrente (los tensores editados incluyen `ssm_out`, además de `ffn_down` y `attn_output` en los bloques 15-63), lo que apunta a una arquitectura híbrida atención/SSM. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible en la documentación proporcionada. Sí se documenta que el modelo incorpora un modo de razonamiento explícito controlable mediante `reasoning_effort` (valores como *medium*) y una torre de visión que se distribuye como proyector separado.

Sobre esta base, BoldingBuilds aplica dos modificaciones en el empaquetado ternario original, sin recuantizar: (1) una abliteración sobre 98 tensores (`ffn_down`, `ssm_out`, `attn_output`, bloques 15-63), con aproximadamente 8 veces más bytes modificados que en v1; y (2) un ajuste de una sola fila de `output.weight` correspondiente al token `</think>`, de 1.250 bytes, calibrado sobre trazas de razonamiento del modelo original para que el cierre del bloque de pensamiento sea probable cuando la respuesta ya está redactada. En total cambia el 0,95% de los bytes del fichero (99 de 851 tensores); el resto es idéntico byte a byte al release de PrismML. La variante MTP añade 15 tensores (`blk.64.*`) para decodificación especulativa; con la especulación desactivada, ambos ficheros producen salidas idénticas byte a byte en las 5 pruebas del autor (400 tokens cada una).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Jinja.
- Razonamiento explícito en modo *thinking*, con control de esfuerzo mediante `reasoning_effort` (por ejemplo, *medium*) pasado como kwarg de la plantilla.
- Generación de código y matemáticas: el autor reporta puntuaciones de HumanEval (145 vs 158) y MATH (213 vs 238) en el modelo base con presupuesto de 4k tokens, comparando esfuerzo por defecto frente a *medium*.
- Visión multimodal opcional mediante `--mmproj` con el proyector Q8_0: lectura de capturas de pantalla, transcripción de facturas y conteo de formas geométricas en pruebas de humo.
- Decodificación especulativa vía cabezas MTP en el fichero `-MTP.gguf`, con una mejora de velocidad de decodificación de aproximadamente el 40% según el autor.
- Comportamiento "uncensored": la abliteración elimina los rechazos en el espacio de pesos, sin system prompt adicional.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar cómo la edición de un conjunto reducido de tensores (98 de 851) altera la tasa de rechazo sin reentrenar, comparando directamente contra el modelo base intacto y contra builds alternativos con la misma metodología.
- Evaluación de robustez de filtros de seguridad: con una tasa de rechazo baja medida en StrongReject (0,941) y un 7% de preguntas seguras sin responder, sirve como caso adversario para calibrar clasificadores y guardrails de producción.
- Razonamiento con presupuesto de tokens ajustado: configurando `reasoning_effort=medium` y 32k de contexto, el modelo mantiene la calidad en matemáticas y código donde el esfuerzo por defecto agota el presupuesto (0,977 frente a 0,513 en StrongReject con solo 4k tokens).
- Procesamiento de documentos con visión: el proyector Q8_0 permite transcribir facturas de varias líneas o extraer texto de capturas de pantalla en pipelines de digitalización, aunque solo se ha validado con pruebas de humo y sin benchmarks formales (MMMU, OCRBench).
- Despliegue en hardware de gama media: con 7,21 GB para el fichero principal y 7,66 GB con MTP, el modelo cabe en GPUs de consumo con 8-12 GB de VRAM, lo que facilita prototipado local de asistentes conversacionales sin censura.
- Servicio de inferencia de baja latencia: el fichero MTP con decodificación especulativa reduce el tiempo por token aproximadamente un 40%, útil para chat interactivo en `llama-server` con `-ngl 99 -fa on`.
- Análisis de conversaciones de comunidades: dado su origen en pruebas con capturas de Discord, encaja en la moderación o el análisis de hilos de chat donde se requiere contexto largo y lectura de imágenes adjuntas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (StrongReject, 150 peticiones dañinas detalladas, thinking activado, ajustes por defecto, presupuesto de 16.384 tokens, mismo juez para todas las filas):

| Build | StrongReject (0-1, mayor mejor) | Sin respuesta (de 150, menor mejor) |
|---|---:|---:|
| **Este modelo (v2)** | **0,941** | **7** |
| Hikari07jp abliterated | 0,738 | 34 |
| OS-Software Heretic | 0,723 | 41 |
| Blackfrost DERISKED | 0,708 | 12 |
| dealignai CRACK | 0,668 | 48 |
| v1 del mismo autor | 0,781 | 23 |

En el conjunto dañino más fácil con ajustes por defecto, Hikari (0,834) y dealignai (0,866) superan a v2 (0,796), sin significación estadística según el autor; con `reasoning_effort=medium` todos los builds buenos alcanzan el techo. En preguntas seguras (XSTest-safe), v2 deja sin responder el 7%, frente al 8-14% de los demás builds de Bonsai abliterados probados.

Capacidades del modelo base Bonsai 2 (presupuesto de 4k tokens, esfuerzo por defecto frente a *medium*):

| Benchmark | Default | Medium |
|---|---:|---:|
| MATH | 213 | 238 |
| HumanEval | 145 | 158 |

No se han publicado resultados de MMLU, MMMU, OCRBench ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 7,21 GB para el fichero PQ2_0 sin visión; 7,66 GB con MTP; añadir 0,63 GB si se carga el proyector de visión Q8_0. Con contexto de 32k y caché KV en FP16 hay que sumar varios GB adicionales según la implementación.
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM para el modelo solo; RTX 4090, A100 o H100 para servir con contexto completo y visión. Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Despliegue: exclusivamente con el fork de llama.cpp de PrismML (etiquetas `prism-b10687-5d80cff` y `prism-b10743-adfffbe` probadas; `prism-b10743-adfffbe` o superior ejecuta el fichero MTP tal cual). Las builds estándar de llama.cpp, Ollama y LM Studio no cargan el formato PQ2_0.
- Comando de referencia: `llama-server -m ... -ngl 99 -fa on -c 32768 --jinja --chat-template-kwargs '{"reasoning_effort":"medium"}'`, con sampler en los valores por defecto del fichero (temperatura 1.0, top-k 20, top-p 0.95).
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo la mejora relativa de aproximadamente un 40% en decodificación con el fichero MTP frente al fichero plano.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | StrongReject (16k) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Ternary-Bonsai-2-27B-Abliterated-v2 (este) | 26,9 B | 32.768 | 0,941 | Apache 2.0 | GGUF PQ2_0, fork PrismML |
| Ternary-Bonsai-2-27B-Abliterated v1 | 26,9 B | 32.768 | 0,781 | Apache 2.0 | GGUF PQ2_0 y PTQ1_0 |
| Hikari07jp abliterated (Bonsai 2) | no disponible | no disponible | 0,738 | no disponible | no disponible |
| dealignai CRACK (Bonsai 2) | no disponible | no disponible | 0,668 | no disponible | no disponible |
| Blackfrost DERISKED (Bonsai 2) | no disponible | no disponible | 0,708 | no disponible | no disponible |

La comparativa se limita a los builds medidos por el autor en el mismo protocolo; no se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para los modelos alternativos que permitan una comparación de capacidad general.

## Limitaciones y advertencias

- La abliteración elimina los rechazos en el espacio de pesos: el modelo responderá a peticiones dañinas con alta probabilidad (0,941 en StrongReject). No es apto para despliegues públicos sin guardrails externos.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de factualidad ni de calibración en la información disponible.
- El modo *thinking* consume presupuesto de tokens de forma agresiva: con 4.096 tokens y esfuerzo por defecto, 110 de 150 peticiones agotan el presupuesto y la puntuación cae a 0,513. Es necesario usar `reasoning_effort=medium` o ampliar el límite.
- La corrección del cierre de razonamiento se basa en el ajuste de una única fila de la capa de salida; su generalización fuera de los conjuntos de prueba del autor no está validada de forma independiente.
- La visión solo se ha comprobado con pruebas de humo (captura de Discord, factura de 4 líneas, conteo de formas); no hay benchmarks de MMMU ni OCRBench y la calidad en documentos complejos es desconocida.
- Dependencia de un fork específico de llama.cpp: la falta de soporte en herramientas estándar complica el despliegue en plataformas gestionadas y encarece el mantenimiento.
- Idiomas soportados no documentados; no hay garantías sobre calidad multilingüe fuera del inglés.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterado puede incumplir políticas de plataformas de despliegue y acarrear obligaciones legales según la jurisdicción; conviene revisar los términos de servicio del proveedor de inferencia.
- El autor advierte de que las ediciones se hacen sobre el empaquetado ternario original sin recuantizar; cualquier conversión posterior a otros formatos puede alterar el comportamiento medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF
- Versión v1 (PQ2_0 + MTP): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF
- Versión v2 PTQ1_0 (1,75 bpw): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF
- Versión v1 PTQ1_0: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- Informe comparativo de builds uncensored de Bonsai 2: https://huggingface.co/spaces/BoldingBuilds/bonsai-2-uncensored-shootout
- Prueba independiente de Killy (@net_termina) sobre HumanEval a 4k tokens: https://x.com/net_termina

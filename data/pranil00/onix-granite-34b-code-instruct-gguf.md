# pranil00/ONIX-granite-34b-code-instruct-GGUF

## Resumen

ONIX-granite-34b-code-instruct-GGUF es una cuantización extrema del modelo ibm-granite/granite-34b-code-instruct de IBM, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". El artefacto emplea el esquema de cuantización IQ1_S (1,56 bits por peso), lo que reduce el peso de 79,15 GB en FP16 a 7,72 GB, una compresión de 10,26x. El objetivo declarado es permitir la ejecución de un modelo de aproximadamente 40.000 millones de parámetros en hardware de consumo mediante el motor run-any-model.

El modelo base es un transformer de la familia Granite de IBM orientado a código e instrucciones, con una ventana de contexto de 8.192 tokens según la model card. La cuantización se presenta como "EXTREME SQUEEZE" y el propio autor reconoce una retención de calidad de aproximadamente el 60 %, con posible degradación de la lógica de alto nivel, la compilación de código y la gramática matizada.

La relevancia de esta ficha es doble: por un lado documenta un experimento de compresión agresiva que permite probar un modelo de 40B en equipos con 9-12 GB de memoria; por otro, advierte de que se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con advertencias explícitas sobre la pérdida de calidad. No debe confundirse con una versión oficial de IBM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Granite de IBM) |
| Parametros totales | 40.467.726.336 (40,47 B) |
| Parametros activos | no disponible (no es MoE según la informacion) |
| Longitud de contexto | 8.192 tokens (model card); 4.096 tokens en configuracion CPU |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso); KV cache Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `ibm-granite--granite-34b-code-instruct-IQ1_S.gguf`, 7,72 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Granite de IBM, especializado en código e instrucciones. La model card del artefacto cuantizado no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO o ajuste por instrucciones más allá de la denominación "code-instruct" del modelo original. Tampoco se documentan innovaciones arquitectónicas específicas del modelo base en la información proporcionada.

La innovación del artefacto reside en el proceso de cuantización: se aplica el esquema IQ1_S (1,56 bpw) mediante el motor run-any-model, con una compresión del 90,2 % respecto a FP16. El informe de auditoría incluido indica aceleración de las 88 capas en Metal (Apple Silicon) y un KV cache en Q4_0 de 2.112 MB. El propio autor clasifica el resultado como "EXTREME SQUEEZE" y estima una retención de calidad del 60 %, con degradación esperada en razonamiento complejo y generación de código.

## Capacidades

- Generación de texto y respuesta a instrucciones, heredadas del modelo base Granite code-instruct.
- Generación y asistencia en código, aunque la cuantización IQ1_S puede degradar la compilación y la lógica de alto nivel según la propia model card.
- Extracción de hechos y conversación básica, capacidades que el autor indica como preservadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor advierte de que la lógica de alto nivel puede verse afectada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Pruebas de concepto en portátiles con memoria unificada limitada: con 9,89 GB de memoria unificada en Apple Silicon (M1-M5) se puede cargar el modelo a 8.192 tokens de contexto y evaluar su comportamiento antes de invertir en hardware mayor.
- Experimentación educativa con cuantización extrema: sirve para estudiar el impacto de IQ1_S en la calidad de salida comparando con el modelo base en FP16 o en cuantizaciones menos agresivas.
- Extracción de información y resumen de documentos cortos: el autor indica que la extracción factual básica se preserva, por lo que puede usarse en tareas de recuperación simple sobre textos de hasta 4.096-8.192 tokens.
- Chat de terminal local con Ollama o llama.cpp: la model card incluye Modelfile y comandos listos para ejecutar una sesión conversacional en CPU o GPU de consumo.
- Evaluación de pipelines de despliegue: útil para validar integraciones con llama.cpp, LM Studio, Jan o Text-Generation-WebUI antes de mover el modelo a entornos con más recursos.
- Docencia y demostraciones sin infraestructura cloud: permite mostrar el funcionamiento de un modelo de 40B en un equipo de escritorio, con la advertencia de que la calidad es reducida.
- No recomendado para generación de código en producción ni para tareas que requieran razonamiento complejo, según las propias advertencias del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye una matriz de auditoría de recursos (no de calidad) que compara FP16 con IQ1_S:

| Metrica | FP16 (base) | IQ1_S (cuantizado) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 1,56 bits/param | -90,2 % |
| Tamano de pesos | 79,15 GB | 7,72 GB | -90,2 % |
| KV cache | 2.112 MB (FP16) | 2.112 MB (Q4_0) | Optimizado |
| RAM residente total | 87,51 GB | 9,89 GB | -88,7 % |
| Calidad estimada | 100 % | ~60 % | -40 % |
| Capas aceleradas | 0 % | 88/88 | Optimo |

## Requisitos de hardware

- VRAM/RAM estimada: 9,22 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50), 9,89 GB de memoria unificada en Apple Silicon (M1-M5), 11,89 GB de RAM libre en CPU (Windows/Linux).
- Contexto recomendado: 8.192 tokens en GPU y Apple Silicon; 4.096 tokens en CPU.
- GPU recomendadas: RTX 30/40/50 series con al menos 10 GB de VRAM; el autor valida aceleración CUDA y Metal.
- Cabe en GPU de consumo: sí, en modelos con 10 GB o más de VRAM (por ejemplo, RTX 3080 10 GB, RTX 4070, RTX 4080, RTX 4090). No se indica compatibilidad con GPUs de 8 GB.
- Opciones de despliegue: run-any-model (CLI del autor), Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-granite-34b-code-instruct-GGUF (este) | 40,47 B | 8.192 | IQ1_S (1,56 bpw) | Apache 2.0 | Hugging Face, 0 descargas |
| ibm-granite/granite-34b-code-instruct (base) | ~34 B (denominacion) / 40,47 B (segun model card) | 8.192 | FP16 / BF16 | Apache 2.0 | Hugging Face, oficial de IBM |
| Otras cuantizaciones GGUF del mismo base | 40,47 B | 8.192 | Q4_K_M, Q5_K_M, etc. | Apache 2.0 | Disponibles en el ecosistema GGUF (no verificadas en esta busqueda) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este artefacto con alternativas. La comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Retención de calidad estimada del 60 %: el propio autor advierte de que la lógica de alto nivel, la compilación de código y la gramática matizada pueden verse deterioradas.
- Riesgo elevado de alucinación y errores factuales derivado de la cuantización extrema a 1,56 bits por peso.
- No apto para generación de código en producción según las advertencias de la model card.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.
- Artefacto no oficial: no procede de IBM ni de la organización ONIX verificada; el autor es un usuario individual (pranil00) y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Licencia Apache 2.0 declarada, pero la model card incluye una cláusula de exención de responsabilidad total que conviene revisar antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad más allá de la estimación del autor.
- El contexto en CPU se reduce a 4.096 tokens, la mitad del máximo declarado.
- Fecha de creación del repositorio en el futuro (2026-11-25) según los metadatos, lo que sugiere posibles inconsistencias en la publicación.

## Enlaces

- Hugging Face: https://huggingface.co/pranil00/ONIX-granite-34b-code-instruct-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-34b-code-instruct
- Organización ONIX (referenciada en la model card): https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model

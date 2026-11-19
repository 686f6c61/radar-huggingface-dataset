# DICPlay/RusMind-3.2-Vspyshka

## Resumen

RusMind 3.2 · Вспышка es un ajuste fino (finetune) del modelo base google/gemma-4-E4B-it desarrollado por DICPlay, orientado a tareas cotidianas en ruso y pensado para ejecución local sin conexión a internet (on-device). El modelo se distribuye exclusivamente en formato GGUF y está diseñado para funcionar tanto en ordenadores potentes como en teléfonos insignia, con un tamaño de aproximadamente 3,8 GB en su variante más ligera. Forma parte de la familia RusMind 3.2, que incluye otras variantes como Моментум (orientada a dispositivos de gama baja) y modelos en la nube como Знание y АТОМ.

El modelo se presenta como un "IA nacional" ruso, entrenado con conjuntos de datos propios de DICPlay centrados en historia y cultura de Rusia, legislación rusa, regiones y pueblos del país, y valores familiares tradicionales, además de contenido en inglés. Su propuesta de valor principal es la privacidad: ningún dato de la conversación abandona el dispositivo, y la inferencia se realiza íntegramente offline mediante llama.cpp o entornos compatibles como LM Studio, Ollama o PocketPal.

Con 7.518.069.290 parámetros totales (según los datos de safetensors) y una ventana de contexto de 4096 tokens en la variante para navegador, el modelo se posiciona como una alternativa ligera y especializada en ruso frente a modelos comerciales. Su licencia RusMind License restringe el uso comercial sin contrato escrito con DICPlay, lo que limita su adopción en productos comerciales sin negociación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de google/gemma-4-E4B-it) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (variante para navegador) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, variantes Mini y Lite con embeddings reducidos |
| Idiomas soportados | Ruso (principal), ingles |
| Licencia | RusMind License (DICPlay); base Apache 2.0 |
| Formato de pesos | GGUF (archivos únicos y divididos en 14 partes de hasta 1 GB) |

## Arquitectura y entrenamiento

El modelo se construye mediante ajuste fino del modelo base google/gemma-4-E4B-it, que según la model card se distribuye bajo licencia Apache 2.0. La arquitectura subyacente es un transformer, aunque la model card no detalla innovaciones específicas como atención lineal, decodificación especulativa o mecanismos híbridos. El entrenamiento se realizó sobre conjuntos de datos propios de DICPlay centrados en contenido ruso: historia y cultura de Rusia, leyes, regiones y pueblos, tradiciones familiares y eventos clave, tanto en ruso como en inglés. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La model card menciona que el modelo "piensa en ruso" y que responde con más detalle que la variante Моментум, además de admitir honestamente cuando no está seguro. No se documentan detalles sobre el proceso de alineación, el uso de datos sintéticos o técnicas de destilación. La distribución en GGUF con cuantizaciones Q4_K_M y Q8_0, junto con variantes Mini y Lite de embeddings reducidos, sugiere un enfoque prioritario en eficiencia de despliegue en dispositivos de consumo más que en maximizar capacidades de razonamiento complejo.

## Capacidades

- Generación de texto conversacional en ruso e inglés, orientada a tareas cotidianas como redacción de correos, textos, estudio y explicaciones.
- Comprensión del contexto cultural ruso, incluyendo historia, legislación y diversidad regional del país.
- Modo conversacional interactivo mediante `llama-cli -cnv` y entornos compatibles con GGUF.
- Ejecución offline completa, sin dependencia de servicios en la nube.
- Capacidad declarada de admitir incertidumbre ("no sé") en lugar de inventar respuestas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Asistencia en redacción de correos y textos administrativos: el modelo puede generar borradores en ruso con registro adecuado, aprovechando su ajuste en cultura y legislación rusa para contextos laborales y oficiales.
- Estudio y explicaciones educativas: útil para resumir conceptos de historia, derecho o cultura rusa, con la ventaja de funcionar offline en entornos sin conectividad, como aulas o zonas rurales.
- Atención al ciudadano sobre trámites y normativa: puede explicar en lenguaje sencillo aspectos de la legislación rusa, aunque sus respuestas tienen carácter meramente informativo según la model card.
- Privacidad en dispositivos personales: al ejecutarse íntegramente en local, es adecuado para conversaciones sensibles donde no se desea enviar datos a servidores externos.
- Integración en aplicaciones de escritorio y móviles: mediante LM Studio, Ollama o PocketPal, puede incorporarse como asistente embebido en herramientas ofimáticas o apps de productividad.
- Despliegue en navegador: la variante de 14 partes de hasta 1 GB permite cargar el modelo una vez en el navegador y usarlo posteriormente sin conexión, útil para demos y herramientas web offline.
- Filtrado y explicación de amenazas en antivirus: DICPlay lo emplea en DIC.Антивирус PRO para explicar en lenguaje sencillo las amenazas detectadas, lo que ilustra un caso real de integración en producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB para la variante Mini (3,8 GB), 5-6 GB para Lite (4,2 GB), 6-7 GB para Q4_K_M (5,3 GB) y 9-10 GB para Q8_0 (8,0 GB), considerando overhead de contexto y runtime.
- GPU recomendadas: no se especifican modelos concretos en la model card; por tamaño, tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) deberían cubrir Q4_K_M y Q8_0 con holgura.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para Q4_K_M; Q8_0 requiere alrededor de 10 GB, por lo que encaja en RTX 3080/4070 Ti/4080 o superiores.
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, Ollama, PocketPal, wllama (navegador) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RusMind 3.2 · Вспышка | 7.518.069.290 | 4096 tokens | RusMind License (comercial restringido) | GGUF en Hugging Face |
| RusMind 3.2 · Моментум | no disponible | no disponible | RusMind License | GGUF en Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | Apache 2.0 | Hugging Face |
| T-Bank T-Pro / T-Lite | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad; los datos de benchmarks de Моментум, Gemma 4 E4B y los modelos de T-Bank no están disponibles en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste fino está orientado explícitamente a historia, cultura, leyes y "valores familiares tradicionales" de Rusia, lo que puede introducir sesgos culturales y políticos en las respuestas.
- Riesgo de alucinación: la model card afirma que el modelo admite no saber, pero no se documentan métricas de calibración ni tasas de alucinación; en dominios legales o médicos las respuestas son solo informativas.
- Limitaciones de contexto: la variante para navegador tiene 4096 tokens de contexto, insuficiente para documentos largos o conversaciones extensas; no se especifica el contexto de las demás variantes.
- Limitaciones de idioma: el modelo está centrado en ruso e inglés; su rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- Restricciones de licencia: la RusMind License permite uso personal, no comercial, investigación y evaluación, pero prohíbe uso comercial, reventa, distribución de versiones modificadas o fine-tuned e integración en productos sin contrato escrito con DICPlay.
- Caveat para producción: la licencia restrictiva, la falta de benchmarks públicos y la ausencia de documentación sobre tool calling o agentes limitan su uso en pipelines automatizados complejos sin una evaluación adicional.
- El modelo se distribuye "tal cual" (as is), sin garantías.

## Enlaces

- [Hugging Face: DICPlay/RusMind-3.2-Vspyshka](https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka)
- [Modelo base: google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [Sitio oficial: rusmind.ru](https://rusmind.ru)
- [Repositorio de versiones anteriores: DICPlay/RusMind-Vspyshka](https://huggingface.co/DICPlay/RusMind-Vspyshka)
- [Archivo Mini (3,8 GB)](https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Mini.gguf)
- [Archivo Lite (4,2 GB)](https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Lite.gguf)
- [Archivo Q4_K_M (5,3 GB)](https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Q4_K_M.gguf)
- [Archivo Q8_0 (8,0 GB)](https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Q8_0.gguf)

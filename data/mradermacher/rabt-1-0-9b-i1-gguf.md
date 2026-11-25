# mradermacher/Rabt-1.0-9B-i1-GGUF

## Resumen

Rabt-1.0-9B es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) desarrollado por 4waiz y publicado bajo el paraguas de Kanban Studios, orientado a su uso como asistente personal local-first. La versión aquí documentada es la cuantización GGUF realizada por mradermacher, que genera pesos optimizados con imatrix para su ejecución en llama.cpp, Ollama y otros motores compatibles con GGUF. El modelo está afinado mediante QLoRA sobre una base de 9B y se distribuye con licencia Apache 2.0.

La propuesta del modelo se centra en tres ejes: privacidad (ejecución local sin dependencia de servicios en la nube), capacidades de agente con tool use y human-in-the-loop, y soporte multilingüe con especial énfasis en árabe, urdu, hindi, inglés y francés. Está etiquetado como modelo conversacional y de asistente personal, lo que lo posiciona en el segmento de modelos pequeños-medios para despliegue en hardware de consumo.

La relevancia actual de esta ficha radica en que ofrece una alternativa cuantizada lista para producción local de un modelo de 9B con licencia permisiva, lo que facilita su integración en flujos de trabajo que requieren soberanía del dato y baja latencia sin GPU de datacenter. No obstante, la información pública disponible sobre arquitectura interna, contexto y benchmarks es muy limitada, lo que se refleja en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible); afinado con QLoRA |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix: i1-Q2_K, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ3_S, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también disponibles cuantizaciones estáticas en el repo hermano |
| Idiomas soportados | en, ar, fr, hi, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base 4waiz/Rabt-1.0-9B) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo transformer de aproximadamente 9,2 mil millones de parámetros, afinado mediante QLoRA (quantized low-rank adaptation) sobre una base no especificada. El modelo base es 4waiz/Rabt-1.0-9B, y la versión documentada es una cuantización GGUF con calibración imatrix realizada por mradermacher, que aplica matrices de importancia para preservar la calidad en cuantizaciones agresivas.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas del modelo indican un enfoque en tool use, human-in-the-loop y despliegue local-first, lo que sugiere un ajuste orientado a tareas de agente, pero no se aportan detalles técnicos sobre el proceso. Tampoco se confirma si el modelo incorpora visión: la model card de mradermacher menciona que "es un modelo de visión" y remite a los ficheros mmproj del repositorio estático, pero no se aportan evidencias adicionales ni especificaciones al respecto, por lo que este punto debe tratarse con cautela.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a asistencia personal.
- Soporte de tool calling / function calling, según las etiquetas del modelo (agent, tool-use).
- Capacidades de agente con human-in-the-loop, es decir, flujos que requieren confirmación o intervención humana en pasos intermedios.
- Multilingüe: inglés, árabe, francés, hindi y urdu.
- Orientación a privacidad y ejecución local-first, sin dependencia de API externa.
- Posible soporte de visión según la model card del cuantizador (no confirmado con detalle técnico).
- No se dispone de información sobre modo thinking, razonamiento extendido, matemáticas o generación de código especializada.

## Casos de uso

- Asistente personal local: el modelo puede gestionar conversaciones multi-turno en el escritorio del usuario sin enviar datos a la nube, aprovechando su orientación local-first y su licencia Apache 2.0 para integración en aplicaciones de productividad personal.
- Automatización de tareas con tool calling: al estar etiquetado como agent y tool-use, puede invocarse desde un orquestador que le exponga funciones (calendario, correo, ficheros) y ejecutar acciones con confirmación humana (human-in-the-loop) en pasos sensibles.
- Atención al cliente en mercados multilingües: su cobertura de árabe, urdu, hindi, francés e inglés lo hace adecuado para despliegues de soporte en regiones con esas comunidades lingüísticas, ejecutándose en infraestructura propia.
- Procesamiento de documentos confidenciales: al poder ejecutarse en local con cuantizaciones de 5-7 GB, encaja en flujos donde el dato no puede salir de la organización (legal, sanidad, administración).
- Prototipado rápido de agentes en hardware de consumo: las cuantizaciones i1-Q4_K_M (5,9 GB) permiten iterar en una RTX 4090 o incluso en CPU con llama.cpp, reduciendo el coste de experimentación frente a modelos mayores.
- Despliegue en entornos con conectividad limitada: al no requerir servicios externos, puede operar en estaciones de trabajo aisladas o en campo, con modelos GGUF transportables.
- Integración en pipelines de CI/CD para pruebas de agentes: su tamaño moderado permite levantar instancias efímeras en contenedores para validar flujos de tool calling antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,0 GB con i1-Q2_K, 5,9 GB con i1-Q4_K_M (recomendado), 6,7 GB con i1-Q5_K_M y 7,7 GB con i1-Q6_K, sin contar el overhead del contexto y del motor de inferencia.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti o superiores para cuantizaciones Q4-Q6 con contexto amplio; A100/H100 no son necesarias para este tamaño, aunque pueden usarse para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM para cuantizaciones Q4-Q5; las cuantizaciones Q2-Q3 pueden caber en 6 GB.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta ollama presente), motores compatibles con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rabt-1.0-9B (esta ficha) | 9,2B | no disponible | Apache 2.0 | GGUF, safetensors | Asistente personal local-first, multilingüe (en, ar, fr, hi, ur) |
| Alternativas de 7-9B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación rigurosa |

No se dispone de información suficiente para comparar con alternativas concretas sin inventar datos. Se recomienda evaluar contra modelos de tamaño similar (7-9B) con licencia permisiva y soporte multilingüe, pero esta ficha no aporta cifras comparativas al no estar publicadas.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no es posible validar el rendimiento real en tareas estándar (MMLU, HumanEval, GSM8K) con los datos disponibles.
- Información técnica incompleta: se desconoce la longitud de contexto, la composición del dataset de entrenamiento y los detalles del ajuste QLoRA, lo que dificulta estimar su comportamiento en contextos largos.
- Riesgo de alucinación: como todo modelo generativo de 9B, puede producir información incorrecta, especialmente en dominios especializados no cubiertos por su entrenamiento.
- Sesgos: no se han documentado evaluaciones de sesgo; al estar entrenado con datos multilingües de regiones diversas, pueden aparecer sesgos culturales y lingüísticos no caracterizados.
- Cobertura lingüística limitada a cinco idiomas declarados (en, ar, fr, hi, ur); el español no figura entre ellos, por lo que su rendimiento en castellano no está garantizado.
- La mención a capacidades de visión en la model card del cuantizador no está respaldada por especificaciones técnicas detalladas; debe verificarse antes de usarla en producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base 4waiz/Rabt-1.0-9B y de los datasets de ajuste, no documentadas aquí.
- Las cuantizaciones de baja precisión (Q2, Q3) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio ocupa 81,3 GB por incluir todas las cuantizaciones; la descarga selectiva de un único fichero GGUF es la práctica recomendada.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/Rabt-1.0-9B-i1-GGUF
- Modelo base: https://huggingface.co/4waiz/Rabt-1.0-9B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Rabt-1.0-9B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Rabt-1.0-9B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

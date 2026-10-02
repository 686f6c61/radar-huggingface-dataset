# edededdy/ShallowSeek-mini-it-GGUF

## Resumen

ShallowSeek-mini-it-GGUF es la version cuantizada en formato GGUF de ShallowSeek-mini-it, un modelo de lenguaje conversacional en ingles desarrollado por edededdy (Edmund Martin). Se trata de un artefacto educativo y de investigacion: un MoE diminuto de 10.970.004 parametros totales (11,0 M), de los cuales 6,3 M estan activos por token, entrenado desde cero en la CPU de un portatil. La arquitectura sigue el estilo de DeepSeek-V3, con atencion multi-head latent attention (MLA) y un modulo MTP en los pesos PyTorch.

El modelo base fue preentrenado con 286 M de tokens de FineWeb-Edu y despues ajustado por instrucciones (SFT) con 16.347 conversaciones y 1,62 M de tokens de asistente. La version GGUF esta pensada para su uso con llama.cpp, Ollama y LM Studio, e incluye cuantizaciones f16 y q8_0. Su relevancia es principalmente didactica: permite estudiar enrutamiento MoE, MLA, plantillas de chat y cuantizacion GGUF en hardware muy modesto.

A pesar de que las respuestas son fluidas y estan en el tema, el propio autor advierte que el modelo a menudo responde de forma incorrecta o vaga e inventa hechos con seguridad. Con MMLU en torno al 25,6 % (el azar es 25 %), no es apto para tareas que importen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Desarrollador | edededdy (Edmund Martin) |
| Modelo base | edededdy/ShallowSeek-mini-it |
| Arquitectura | Mixture-of-Experts (MoE) estilo DeepSeek-V3, con multi-head latent attention (MLA); los pesos PyTorch incluyen un modulo MTP |
| Parametros totales | 10.970.004 (11,0 M) |
| Parametros activos | 6,3 M por token |
| Longitud de contexto | no disponible (la model card no indica el valor; las conversaciones de SFT se filtraron para ajustarse a 1.024 tokens) |
| Tipos de cuantizacion | GGUF f16 y q8_0; no se listan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y GGUF (f16, q8_0) |

## Arquitectura y entrenamiento

ShallowSeek-mini-it usa una arquitectura MoE inspirada en DeepSeek-V3, con multi-head latent attention (MLA) y un modulo MTP incluido en los pesos PyTorch. El modelo fue entrenado desde cero en la CPU de un portatil, lo que lo convierte en un caso practico para estudiar arquitecturas MoE de muy bajo coste. La model card indica que el modelo base se preentreno con 286 M de tokens de FineWeb-Edu.

El ajuste por instrucciones se hizo sobre 16.347 conversaciones (15.530 de entrenamiento y 817 de validacion), con 1,62 M de tokens de asistente. Aproximadamente el 36 % de los tokens de asistente proceden de pares de pregunta-respuesta generados por Qwen3.8-9B a partir de documentos de FineWeb-Edu que estaban en los datos de preentrenamiento del propio modelo. El 64 % restante proviene de smol-smoltalk: las 1.994 conversaciones cotidianas, ademas de openhermes, smol-constraints y smol-magpie-ultra-short, limitado al 15 % de los tokens de asistente, filtrado para eliminar codigo y ajustado a 1.024 tokens. La perdida se calculo solo sobre las respuestas del asistente y su token de cierre `<|end|>`. El entrenamiento duro 1.942 pasos, con batch 16, 2 epocas, AdamW y una tasa de aprendizaje de 1,5e-4 a 1,5e-5 con coseno (aproximadamente el 10 % del pico de preentrenamiento). Los sesgos de equilibrado de carga del enrutamiento MoE se congelaron en sus valores preentrenados durante el SFT y el padding se excluyo de las estadisticas de carga de expertos. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas fluidas y generalmente centradas en el tema.
- Formato de chat con plantilla `<|system|>...<|end|><|user|>...<|end|><|assistant|>...<|end|>`; el modelo termina la respuesta con `<|end|>`.
- Respuestas a preguntas de un solo turno, especialmente sobre contenidos vistos en su preentrenamiento gracias al Q&A fundamentado.
- Conversaciones multi-turno sencillas y small talk, heredadas de smol-smoltalk.
- Capacidad limitada de razonamiento factual: MMLU letra 25,6 % y MMLU cloze 25,6 %, practicamente en el nivel del azar (25 %).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues: solo ingles.
- No se documentan capacidades de vision, audio ni modo thinking.
- El SFT filtro explicitamente el codigo, por lo que no se reportan capacidades de generacion de codigo.
- No se proporcionan resultados de matematicas, HumanEval, GSM8K ni otros benchmarks especificos.

## Casos de uso

- Docencia e investigacion sobre MoE y MLA: al ser un modelo de 11,0 M de parametros con 6,3 M activos, permite estudiar enrutamiento de expertos, atencion latente y entrenamiento desde cero en un portatil, sin necesidad de GPU.
- Validacion de toolchains GGUF: sirve para probar llama.cpp, Ollama y LM Studio, verificar la plantilla de chat embebida, el token de parada `<|end|>` y el comportamiento de las cuantizaciones f16 y q8_0 en scripts de integracion.
- Pruebas de integracion de APIs compatibles con OpenAI: aunque no tiene tool calling, puede actuar como stub conversacional para comprobar formato de mensajes, streaming y parada en pipelines de pruebas.
- Generacion de texto de relleno en prototipos de interfaz: util para maquetas de chat, demos de UI o pruebas de carga donde no se requiere valor factual ni precision.
- Experimentos de cuantizacion y rendimiento: permite comparar f16 frente a q8_0 en CPU, medir uso de memoria, latencia relativa y degradacion de calidad en un modelo diminuto.
- Analisis de SFT y formato: adecuado para reproducir como el ajuste por instrucciones mejora formato, turn-taking y capacidad de parada sin mejorar el rendimiento en MMLU (24,9 % a 25,6 % en letra).
- Demostracion de alucinacion en modelos pequenos: sirve como ejemplo controlado de respuestas fluidas pero incorrectas, util en formacion sobre verificacion factual y limitaciones de modelos generativos.
- Estudio de sesgos y datos sinteticos: al mezclar FineWeb-Edu, smol-smoltalk y Q&A generado por Qwen3.8-9B, puede usarse para analizar que sesgos o artefactos introducen estas fuentes en un modelo pequeno.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible comparan el modelo base con la version instruction-tuned (IT), evaluados sobre los mismos prompts de texto sin plantilla de chat. El azar en MMLU es 25 %.

| Metrica | Base | IT |
|---|---:|---:|
| Probes top-5 | 28,6 % | 35,7 % |
| Media de log-probabilidad de respuesta | -5,68 | -5,40 |
| Pares verdadero-vs-falso ganados | 58,3 % | 66,7 % |
| MMLU (letra) | 24,9 % | 25,6 % |
| MMLU (cloze) | 25,5 % | 25,6 % |
| MMLU biologia y medicina (cloze) | 27,8 % | 27,7 % |

La model card indica que el SFT ensena principalmente formato, turn-taking y cuando detenerse, y que MMLU queda esencialmente igual. Las mejoras en las probes factuales son modestas: hay 14 probes y 12 pares, por lo que deben interpretarse con cautela. No se han publicado resultados de HumanEval, GSM8K, BBH, MT-Bench ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB. Los pesos f16 ocupan aproximadamente 21,9 MB y los q8_0 alrededor de 11 MB, calculado a partir de 10,97 M de parametros; la cache KV para contexto corto es despreciable frente a eso.
- GPU recomendadas: no se necesita una GPU dedicada. Cualquier GPU consumer con mas de 1 GB de VRAM es suficiente; una RTX 4090, A100 o H100 no aportan ventaja practica para este tamano.
- CPU: el modelo se entreno en la CPU de un portatil y esta pensado para inferencia en CPU mediante llama.cpp, Ollama o LM Studio.
- Cabe en GPU consumer: si, en cualquier GPU integrada o dedicada reciente; tambien funciona en CPU y en entornos embebidos con memoria suficiente.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para GGUF; PyTorch mediante `chat.py` del repositorio de entrenamiento. No se documenta soporte para vLLM, TGI ni otros servidores de inferencia de alto rendimiento.
- Latencia y throughput: no disponible. Por el tamano del modelo se espera una latencia muy baja en CPU moderna, pero no hay cifras publicadas en la informacion disponible.

## Comparativa con modelos similares

No se proporcionan especificaciones ni benchmarks de alternativas externas de la misma categoria en la informacion disponible. La comparacion directa posible es con los otros miembros de la familia ShallowSeek.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---:|---:|---|---|---|---|
| ShallowSeek-mini-it-GGUF | 10,97 M | 6,3 M | no disponible | Apache-2.0 | GGUF f16 y q8_0 | Hugging Face |
| ShallowSeek-mini-it | 10,97 M | 6,3 M | no disponible | Apache-2.0 | safetensors | Hugging Face |
| ShallowSeek-mini-base-GGUF | 11,0 M | 6,3 M | no disponible | no disponible | GGUF | Hugging Face |
| Alternativas externas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Con 11,0 M de parametros, las respuestas son fluidas y estan en el tema, pero a menudo son incorrectas o vagas; el modelo inventa hechos con seguridad.
- El propio autor lo describe como un artefacto educativo y de investigacion y advierte de que no debe usarse para nada que importe.
- MMLU esta en torno al 25,6 %, practicamente el nivel del azar, por lo que el razonamiento factual y academico es muy limitado.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La longitud de contexto no esta publicada; las conversaciones de SFT se filtraron para ajustarse a 1.024 tokens, por lo que es probable que falle en contextos largos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- El SFT filtro el codigo, por lo que no debe esperarse una capacidad fiable de generacion de codigo.
- Sesgos conocidos: no se han publicado evaluaciones de sesgo, toxicidad o seguridad. Al entrenarse con FineWeb-Edu, smol-smoltalk y Q&A sintetico de Qwen3.8-9B, puede reproducir sesgos, artefactos o errores de esas fuentes.
- Alineacion: solo se documento SFT; no consta RLHF, DPO ni moderacion de contenido.
- Licencia Apache-2.0: permite uso comercial, pero el autor desaconseja usos criticos o de produccion. La responsabilidad recae en quien lo despliega.
- El enrutamiento MoE tiene los sesgos de equilibrado de carga congelados durante el SFT, lo que puede limitar la especializacion de expertos para el formato conversacional.
- Las cuantizaciones GGUF pueden degradar aun mas la calidad respecto a los pesos PyTorch originales.
- Riesgo de alucinacion alto: cualquier dato factual generado debe verificarse con una fuente externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edededdy/ShallowSeek-mini-it-GGUF
- Modelo base instruction-tuned en Hugging Face: https://huggingface.co/edededdy/ShallowSeek-mini-it
- Modelo base preentrenado en Hugging Face: https://huggingface.co/edededdy/ShallowSeek-mini-base
- Version GGUF del modelo base: https://huggingface.co/edededdy/ShallowSeek-mini-base-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/edededdy
- Codigo de entrenamiento: https://github.com/EdmundMartin/DeepseekStyleMOE
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Guia para ejecutar modelos GGUF: https://ggufloader.github.io/how-to-run-gguf-models.html
- Directorio local-ai-zone: https://local-ai-zone.github.io
- Documentacion de shallowseek (relacion no confirmada con este modelo): https://doc.shallowseek.top/en/guide/using-models.html

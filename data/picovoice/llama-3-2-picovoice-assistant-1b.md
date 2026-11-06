# Picovoice/Llama-3.2-Picovoice-Assistant-1B

## Resumen

Llama 3.2 Picovoice Assistant 1B es un modelo de lenguaje especializado de 1.000 millones de parametros, desarrollado por Picovoice (Vancouver, Canada) mediante ajuste fino del modelo base meta-llama/Llama-3.2-1B-Instruct. Su proposito es responder preguntas sobre los productos, SDK y documentacion de Picovoice, y esta disenado para ejecutarse integramente en el dispositivo (on-device), sin conexion a red ni dependencia de infraestructura en la nube. Es, por tanto, un especialista de dominio y no un asistente de proposito general.

El modelo ha sido comprimido con la tecnologia picoLLM Compression hasta ocupar aproximadamente el tamano de un CD-ROM, y se distribuye en dos variantes de cuantizacion (8,00 y 3,55 bits por peso) en formato propietario `.pllm`, que requiere el motor picoLLM Inference y una AccessKey de Picovoice Console. Su relevancia radica en demostrar que tareas de Q&A acotadas no necesitan modelos de decenas de miles de millones de parametros ni centros de datos: un modelo pequeno, especializado y comprimido puede ofrecer respuestas rapidas y economicas en navegador, escritorio, movil y dispositivos embebidos.

Esta construido sobre la arquitectura transformer de Llama 3.2 1B, con un enfoque deliberado en respuestas breves y directas, y soporta un unico idioma: ingles. La fecha de corte de conocimiento de la informacion de producto es octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 1B Instruct) |
| Parametros totales | 1.000 millones (1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8,00 bits por peso (1,56 GB); 3,55 bits por peso (730 MB); formato picoLLM (.pllm) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.2 Community License (sujeta a Acceptable Use Policy) |
| Formato de pesos | .pllm (propietario de picoLLM); no se distribuyen safetensors ni GGUF |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Tamano del repositorio | 2,3 GB |
| Plataformas soportadas | Linux, macOS, Windows, Android, iOS, Raspberry Pi, navegadores Chrome, Safari, Edge y Firefox |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, un transformer decoder-only denso de 1.000 millones de parametros desarrollado por Meta. Picovoice realizo un ajuste fino supervisado sobre contenido de producto y documentacion propios, lo que convierte al modelo en un especialista de dominio con un alcance deliberadamente restringido: responde sobre motores, SDK, plataformas, lenguajes y recetas de Picovoice, y rechaza o redirige consultas ajenas a ese ambito (por ejemplo, filosofia o consejos personales). No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La innovacion tecnica principal es la compresion picoLLM, que reduce el modelo a 8,00 o 3,55 bits por peso, y el motor de inferencia picoLLM, construido desde cero para ejecutar modelos cuantizados de forma nativa en navegador, escritorio, movil y embebidos. El ajuste fino incluye un estilo de respuesta conciso y directo, sin florituras conversacionales, orientado a minimizar latencia y consumo energetico en dispositivos con recursos limitados.

## Capacidades

- Generacion de texto y respuesta a preguntas (Q&A) sobre productos, SDK y documentacion de Picovoice.
- Ejecucion completamente on-device y offline, sin llamadas a servicios en la nube.
- Respuestas breves y directas, con estilo conciso y sin relleno conversacional.
- Redireccion de consultas fuera de dominio hacia el ambito de Picovoice.
- Capacidad de distinguir terminos homonimos segun el contexto de producto (por ejemplo, "Orca" como motor de text-to-speech y no como animal).
- Despliegue multiplataforma: navegador (WebAssembly), escritorio, Android, iOS y Raspberry Pi.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio en la informacion disponible.
- Multilingue: no; solo ingles.

## Casos de uso

- Atencion al cliente en la web de Picovoice: el modelo puede responder en el navegador a preguntas frecuentes sobre SDK, plataformas y lenguajes, sin backend ni coste de inferencia en servidor, gracias a su ejecucion via WebAssembly.
- Asistente de documentacion integrado en la propia web: responde dudas sobre como empezar, que SDK soporta Android o que motor realiza una funcion concreta, con conocimiento acotado a la documentacion oficial.
- Soporte en aplicaciones moviles (Android/iOS): incorporar un asistente de ayuda contextual dentro de la app sin enviar datos del usuario a la nube, lo que reduce riesgo de privacidad y dependencia de conectividad.
- Kioscos o demos en ferias y eventos: ejecucion en Raspberry Pi o dispositivos embebidos para mostrar interacciones de voz/texto con los productos Picovoice de forma autonoma y sin infraestructura.
- Filtrado y triaje de consultas entrantes: al estar enfocado, puede clasificar o redirigir consultas fuera de ambito y derivar las complejas al equipo humano, reduciendo carga de soporte de primer nivel.
- Prototipado de asistentes de dominio: servir como ejemplo y base para equipos que quieran construir su propio SLM especializado y comprimido para un producto concreto, replicando el enfoque de ajuste fino mas compresion.
- Despliegue en entornos con conectividad limitada o air-gapped: al ser offline y de bajo consumo, es adecuado para escenarios donde no se puede garantizar acceso a red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,56 GB para la variante de 8,00 bits y unos 730 MB para la de 3,55 bits, en funcion del motor y del overhead de ejecucion.
- GPU dedicadas: no se requieren; el modelo esta pensado para CPU y ejecucion on-device. No se documenta soporte ni rendimiento en A100, H100 o RTX 4090.
- GPU consumer: no aplica como requisito; el enfoque es CPU en escritorio, movil, navegador y Raspberry Pi.
- Opciones de despliegue: exclusivamente picoLLM Inference (Python y Web), con AccessKey de Picovoice Console. No se soportan vLLM, llama.cpp, Ollama ni TGI al no distribuirse pesos en safetensors o GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; el diseno busca baja latencia y eficiencia energetica en dispositivos de recursos limitados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Llama 3.2 Picovoice Assistant 1B | 1B | no disponible | Ingles | Llama 3.2 Community | .pllm / picoLLM |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128K (segun model card de Meta) | Multilingue | Llama 3.2 Community | safetensors, GGUF / amplio ecosistema |
| Modelos SLM de proposito general de ~1B (p. ej., Qwen2.5-1.5B-Instruct) | ~1,5B | 32K (segun model card del autor) | Multilingue | Apache 2.0 (segun autor) | safetensors, GGUF / amplio ecosistema |

La comparativa con otros SLM de ~1B es cualitativa: Picovoice Assistant prioriza especializacion de dominio y despliegue on-device en formato propietario, mientras que los modelos generalistas ofrecen mayor amplitud, contexto documentado y compatibilidad con herramientas estandar de inferencia. No hay datos de benchmarks que permitan comparar rendimiento numerico.

## Limitaciones y advertencias

- Alcance muy restringido: no es un asistente de proposito general; rechaza consultas ajenas a Picovoice (consejos, poesia, temas generales).
- Solo ingles: no soporta castellano ni otros idiomas.
- Conocimiento limitado a octubre de 2026; no refleja cambios de producto posteriores.
- Riesgo de respuestas incompletas o inexactas, como en cualquier modelo de lenguaje.
- Formato propietario `.pllm` y dependencia del motor picoLLM y de una AccessKey de Picovoice, lo que limita la portabilidad y la integracion con ecosistemas abiertos.
- Licencia Llama 3.2 Community con Acceptable Use Policy: revisar condiciones antes de uso comercial y respetar la atribucion (Built with Llama).
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse su disponibilidad.
- El modelo se entrega "as is", sin garantias; Picovoice no se responsabiliza del uso ni de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Picovoice/Llama-3.2-Picovoice-Assistant-1B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Picovoice: https://picovoice.ai
- Documentacion de picoLLM Inference: https://picovoice.ai/docs/picollm/
- Quick start de picoLLM para Python: https://picovoice.ai/docs/quick-start/picollm-python/
- Quick start de picoLLM para Web: https://picovoice.ai/docs/quick-start/picollm-web/
- Picovoice Console (AccessKey): https://console.picovoice.ai/
- Blog sobre cuantizacion de LLM: https://picovoice.ai/blog/picollm-towards-optimal-llm-quantization/
- Blog sobre el motor de inferencia picoLLM: https://picovoice.ai/blog/picollm-inference-engine-for-x-bit-quantized-llms/
- Contacto de Picovoice: https://picovoice.ai/contact/

# mradermacher/Udgam-384M-Chat-GGUF

## Resumen
Udgam-384M-Chat es un modelo de lenguaje conversacional de pequeno tamano (384.389.332 parametros) desarrollado desde cero por udgamlabs, orientado a despliegue en dispositivo (on-device) y a tareas de tool calling, function calling y extraccion de JSON. La version aqui documentada es la cuantizacion GGUF publicada por mradermacher, que permite ejecutar el modelo en CPU y en hardware de gama baja mediante llama.cpp y derivados. El modelo base es udgamlabs/Udgam-384M-Chat y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo reside en su tamano reducido: con menos de 400 millones de parametros, ocupa entre 0,3 y 0,9 GB segun la cuantizacion, lo que lo hace viable en telefonos, Raspberry Pi y entornos sin GPU dedicada. Esta especializado en la generacion de llamadas a herramientas y en la extraccion de estructuras JSON, casos donde los modelos grandes resultan sobredimensionados y costosos.

La informacion disponible no incluye detalles sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. La model card original solo declara el idioma ingles y una etiqueta de arquitectura "gemma4", que no debe interpretarse como una arquitectura Gemma oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card etiqueta "gemma4", sin detalle tecnico) |
| Parametros totales | 384.389.332 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base. La model card de la cuantizacion incluye la etiqueta "gemma4" y "from-scratch", lo que sugiere que udgamlabs entreno el modelo desde cero con una arquitectura inspirada en la familia Gemma, pero no se aportan datos sobre numero de capas, dimensiones ocultas, atencion, ni tipo de normalizacion. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

Las etiquetas del repositorio indican un enfoque claro hacia tool calling, function calling, extraccion de JSON y shell, lo que sugiere un ajuste especifico para esos dominios. No obstante, no se han publicado detalles sobre el proceso de alineacion ni sobre la metodologia de evaluacion. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1), sin versiones ponderadas ni imatrix disponibles en el momento de la publicacion.

## Capacidades
- Generacion de texto conversacional en ingles.
- Tool calling y function calling: generacion de llamadas estructuradas a funciones externas.
- Extraccion de JSON: produccion de estructuras JSON a partir de texto de entrada.
- Soporte de shell: generacion de comandos de shell segun la etiqueta "shell".
- Despliegue on-device: disenado para ejecucion local en hardware limitado.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible" en el repositorio.
- No se ha confirmado soporte de vision, audio, modo thinking ni razonamiento multi-paso avanzado.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso
- Extraccion de JSON en pipelines de datos: el modelo puede convertir texto no estructurado en objetos JSON validos, lo que permite integrarlo en procesos ETL ligeros o en la normalizacion de respuestas de formularios sin depender de un LLM grande.
- Tool calling en asistentes locales: al estar especializado en function calling, puede generar las llamadas a funciones de una aplicacion de escritorio o movil que necesite invocar APIs internas sin conexion a la nube.
- Automatizacion de shell en entornos embebidos: la etiqueta "shell" sugiere que puede traducir instrucciones en lenguaje natural a comandos de shell, util en scripts de administracion o en asistentes de terminal para sistemas con recursos limitados.
- Clasificacion y enrutado de intenciones: con 384M de parametros, puede ejecutarse en CPU para decidir que herramienta o flujo activar en un chatbot, actuando como clasificador previo a un modelo mayor.
- Prototipado rapido en dispositivos sin GPU: gracias a las cuantizaciones de 0,3 GB, permite probar flujos conversacionales en Raspberry Pi, telefonos Android o portatiles antiguos mediante llama.cpp u Ollama.
- Filtrado y validacion de comandos: puede generar y validar comandos de shell en un entorno controlado, como paso previo a la ejecucion supervisada por un humano o por un sistema de sandbox.
- Educacion y demostraciones: su tamano reducido lo hace adecuado para talleres donde se explica el funcionamiento de un LLM y el proceso de cuantizacion GGUF sin requerir infraestructura costosa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: entre 0,3 GB (Q2_K, Q3_K, Q4_K) y 0,5 GB (Q8_0); la version F16 ocupa 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; no requiere A100 ni H100. Funciona en GTX 1050, RTX 3050, RTX 4090 y en GPUs integradas modernas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en tiempo real en CPU moderna, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Udgam-384M-Chat (GGUF) | 384M | no disponible | Apache 2.0 | GGUF | Especializado en tool calling y JSON |
| Qwen2.5-0.5B-Instruct | 500M | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista multilingue |
| Gemma 2 2B | 2B | 8K (segun documentacion publica de Google) | Gemma Terms | safetensors, GGUF | Mayor capacidad, licencia mas restrictiva |
| SmolLM2-360M-Instruct | 360M | 8K (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Enfocado en eficiencia on-device |

La comparativa se basa en datos publicos de los modelos alternativos; para Udgam-384M-Chat no se dispone de contexto ni benchmarks verificables, por lo que la comparacion de rendimiento no puede realizarse con rigor.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos en ingles, puede reflejar sesgos de ese corpus.
- Riesgo de alucinacion: alto en tareas abiertas por su reducido tamano; no es fiable para conocimiento factual sin verificacion.
- Limitaciones de contexto e idioma: solo se declara ingles y no se especifica la ventana de contexto, lo que impide planificar conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base udgamlabs/Udgam-384M-Chat por si hubiera terminos adicionales.
- Caveat de produccion: la cuantizacion es estatica y no hay versiones ponderadas/imatrix; la calidad en Q2_K y Q3_K puede degradarse notablemente.
- El modelo no ha sido evaluado con benchmarks publicos en la informacion disponible, por lo que su rendimiento real en tool calling y extraccion de JSON no esta cuantificado.
- La etiqueta "gemma4" no implica compatibilidad con la familia Gemma de Google ni con sus herramientas.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/Udgam-384M-Chat-GGUF
- Modelo base: https://huggingface.co/udgamlabs/Udgam-384M-Chat
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Udgam-384M-Chat-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

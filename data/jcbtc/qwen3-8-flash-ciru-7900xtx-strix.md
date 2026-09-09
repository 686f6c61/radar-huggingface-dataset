# jcbtc/Qwen3.8-Flash-CIRU-7900XTX-Strix

## Resumen

El modelo Qwen3.8 Flash CIRU 7900XTX + Strix es una adaptación cuantizada en formato GGUF, creada por jcbtc, para ejecutar un modelo de lenguaje de la serie Qwen3.8 en un sistema híbrido compuesto por una GPU AMD RX 7900 XTX de 24 GB y una mini-PC Strix Halo con 128 GB de RAM unificada. Se basa en el modelo `jcbtc/Qwen3.8-Flash-CIRU-STRIX-IU4` y está pensado para pruebas de rendimiento de inferencia local en hardware AMD con ROCm 10.0.0.

El modelo cuenta con 125.743.653.760 parámetros totales, lo que lo sitúa en la categoría de modelos grandes. Su objetivo de contexto es de 262.144 tokens (256K). La arquitectura utiliza una mezcla de expertos (MoE) con soporte de predicción multi-token (MTP), tal como se desprende de la descripción del runtime personalizado CIRU. Su principal relevancia radica en la posibilidad de ejecutar un modelo de este tamaño en un sistema doméstico de gama alta con memoria compartida, alcanzando velocidades de decodificación notables gracias al reparto de cargas entre la GPU y la memoria de la APU.

Este adaptador es una vista previa de hardware y no introduce cuantización adicional ni poda de expertos con respecto al modelo base. Los pesos de destino, MTP y PLE permanecen sin cambios. Un build estándar de llama.cpp no es compatible con este paquete; se requiere el runtime CIRU personalizado, que ofrece un rendimiento específico documentado en los repositorios enlazados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y predicción multi-token (MTP); detalles adicionales no disponibles |
| Parametros totales | 125.743.653.760 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (objetivo) |
| Tipos de cuantizacion | GGUF; el borrador MTP se cuantiza a Q8 en el runtime CIRU. No se detallan los niveles de cuantización de los pesos target |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de la serie Qwen3.8, que se construye sobre los cimientos de Qwen3.5. En este adaptador concreto, los pesos del modelo base `jcbtc/Qwen3.8-Flash-CIRU-STRIX-IU4` se distribuyen para ejecutarse en dos dispositivos: los pesos densos target y las últimas ocho capas de expertos residen en la GPU RX 7900 XTX; el resto de expertos, la caché KV completa en F16 y el borrador MTP cuantizado a Q8 se alojan en la memoria unificada del Strix Halo. El runtime CIRU gestiona esta partición junto con la decodificación especulativa basada en MTP.

No se ha publicado información sobre los datos de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO para este adaptador. La relación con el modelo base es únicamente de cuantización; no se ha realizado reentrenamiento ni ajuste fino adicional. El modelo utiliza un modo de razonamiento no-thinking por defecto en las mediciones proporcionadas, con muestreo greedy.

## Capacidades

- Generación de texto y razonamiento con soporte de contexto largo de hasta 262.144 tokens, permitiendo procesar documentos completos o conjuntos de datos extensos en una sola pasada.
- Decodificación con predicción multi-token (MTP) que mejora la velocidad de generación; en las pruebas, la tasa de aceptación de tokens borrador fue del 86,7%.
- Soporte de prompt caching avanzado: en la carga de trabajo HermesAgent-20 se reutilizaron el 69,2% de los tokens de prompt, reduciendo el coste de prefill.
- Capacidades de agente y tool calling: el sistema ejecutó 20 escenarios de agentes con 120 solicitudes de modelo, incluyendo llamadas a herramientas y lógica multi-paso.
- Multilingüe: no disponible (no se informa de los idiomas soportados en la metametadatos del modelo).
- Visión, audio u otras capacidades multimodales: no disponibles en la información publicada.

## Casos de uso

- Análisis de repositorios de código completos: el contexto de 262.144 tokens permite cargar una base de código extensa para razonar sobre arquitectura, dependencias o detectar patrones de error en un solo prompt.
- Asistentes de atención al cliente con memoria de historial completo: los 256K de contexto posibilitan mantener conversaciones de miles de turnos sin perder estado, ideal para soporte técnico avanzado en entornos locales.
- Agentes autónomos privados: con soporte de tool calling y decodificación por MTP, el modelo puede ejecutar tareas de agente multi-paso en un entorno sin conexión, como el benchmark HermesAgent-20, garantizando privacidad de datos.
- Procesamiento por lotes de documentos legales o forenses: la alta velocidad de prefill y la caché de prompts permiten analizar y comparar largos conjuntos de documentos con enfoque en preguntas específicas.
- Investigación académica con datos sensibles: la ejecución completamente local (GPU + APU) evita el envío de datos a servicios en la nube, manteniendo el cumplimiento de políticas de confidencialidad.
- Servidor de chat para equipos con contextos de trabajo compartidos: varios usuarios pueden consultar sobre la misma documentación extensa mediante un servidor local con llama.cpp y runtime CIRU, aprovechando el prompt caching para acelerar consultas repetidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos que se presentan a continuación son mediciones de rendimiento de inferencia en el sistema híbrido descrito (Bosgame M5, OCuLink, RX 7900 XTX, Strix Halo, ROCm 10.0.0).

| Carga de trabajo | Tokens de entrada frescos | Tokens generados | PP (tok/s) | TG (tok/s) |
|---|---:|---:|---:|---:|
| Capacidad completa 256K, caché de prompt desactivada | 261.888 | 128 | 429,68 | 23,74 |
| HermesAgent-20, caché de prompt activada, 120 solicitudes | 113.221 | 11.768 | 590,24 | 50,00 |

En la carga de contexto completo, el prefill tardó 609,49 segundos y la decodificación de 128 tokens 5,35 segundos. La carga de agente alcanzó una secuencia máxima de 11.245 tokens manteniendo la capacidad configurada de 262.144. El rendimiento de decodificación mejoró 2,96 veces respecto a un build anterior con indexación por radix, mientras que el prefill permaneció prácticamente igual. La aceptación de tokens borrador en el benchmark de agentes fue del 86,7%.

## Requisitos de hardware

- Sistema de referencia: mini-PC Bosgame M5 (Strix Halo con 128 GB de RAM) conectado mediante adaptador M.2 a OCuLink a un dock Minisforum DEG1 con una GPU XFX Merc RX 7900 XTX de 24 GB.
- VRAM estimada: 24 GB en la GPU para los pesos densos target y las ocho últimas capas de expertos. El resto de expertos, la caché KV completa en F16 y el borrador MTP Q8 se almacenan en la memoria unificada de Strix.
- GPU recomendada: RX 7900 XTX (gfx1100) o cualquier GPU compatible con ROCm en el mismo rango. También se indica soporte para gfx1151 (Strix Halo).
- No cabe en una GPU de consumo de 24 GB por sí sola; requiere la combinación con al menos 128 GB de memoria unificada o una configuración similar de memoria compartida.
- Despliegue: requiere el runtime CIRU personalizado basado en llama.cpp; los builds estándar de llama.cpp no son compatibles. Se proporcionan scripts de instalación en el repositorio GitHub.
- Latencia y throughput: con MTP de profundidad 3, batch/microbatch 1.536 y 8 hilos de CPU, se midieron 429,68–590,24 tok/s de prefill y 23,74–50,00 tok/s de decodificación, según la carga.

## Comparativa con modelos similares

No se ha proporcionado información comparativa frente a otros modelos en las fuentes consultadas. El modelo se enmarca dentro de la serie Qwen3.8, pero no dispone de una comparativa publicada con respecto a otros modelos MoE de tamaño similar (como Qwen3-235B-A22B o Qwen3-32B). Se recomienda consultar el repositorio oficial de QwenLM/Qwen3.8 para obtener especificaciones y benchmarks de la serie original.

## Limitaciones y advertencias

- Vista previa de hardware: no es un lanzamiento de producción y su uso está orientado a pruebas de rendimiento en hardware AMD específico.
- Requiere un runtime CIRU personalizado; un build estándar de llama.cpp no es compatible, lo que limita la portabilidad y dificulta la integración en entornos convencionales.
- Los resultados de HermesAgent-20 no son una validación limpia de calidad: el verificador reportó 16 pases, 2 parciales y 2 fallos; dos escenarios agotaron el límite de turnos del agente.
- No se han publicado evaluaciones de sesgos ni tasas de alucinación para este adaptador; como cualquier LLM, existe riesgo de generar contenido falso o no verificado.
- La licencia `qwen-community-1.0` puede imponer condiciones específicas para uso comercial o redistribución; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- El rendimiento de decodificación con contexto completo depende críticamente de la configuración híbrida; no se ha demostrado un resultado comparable cuando se usa solo Strix sin la GPU.
- El modo de razonamiento no-thinking es el utilizado en las mediciones; no se ha evaluado el impacto del modo thinking en la velocidad o la calidad cuando está activado.

## Enlaces

- HuggingFace: https://huggingface.co/jcbtc/Qwen3.8-Flash-CIRU-7900XTX-Strix
- Lanzamientos del runtime CIRU: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-7900XTX-24GB-StrixHalo-128GB-OCuLink-Linux-ROCm10/releases/tag/v0.1.0
- Instalación híbrida: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-7900XTX-24GB-StrixHalo-128GB-OCuLink-Linux-ROCm10/blob/main/docs/hybrid/INSTALL.md
- Benchmarks detallados y métricas: https://github.com/ciru-ai/Qwen3.8-Flash-CIRU-7900XTX-24GB-StrixHalo-128GB-OCuLink-Linux-ROCm10/blob/main/docs/hybrid/BENCHMARKS.md
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8

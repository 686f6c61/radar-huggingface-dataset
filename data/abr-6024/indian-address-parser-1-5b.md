# abr-6024/indian-address-parser-1.5B

## Resumen

Indian Address Parser 1.5B es un ajuste fino supervisado de Qwen/Qwen2.5-1.5B-Instruct desarrollado por el usuario abr-6024, orientado a una tarea muy concreta: convertir direcciones postales indias desestructuradas (con abreviaturas, erratas, referencias a hitos, nombres de ciudad antiguos, formatos `D.No`, `Old No / New No`, `Village / Post / District`) en un objeto JSON con nueve campos fijos. El modelo no pretende ser un asistente general, sino un extractor de información especializado para logística, comercio electrónico y validación de direcciones en el mercado indio.

La versión v3, publicada en octubre de 2026, sustituye la geografía sintética de las versiones anteriores por localidades, códigos postales, distritos y estados extraídos del directorio real de India Post (156.000 localidades, con Tamil Nadu sobrerrepresentado al 44 %). Esto permite que el modelo aprenda relaciones reales entre pincode, distrito y estado, y explica la mejora frente a v1, que se quedaba en torno al 58 % en direcciones de estilo real.

Arquitectura transformer decoder-only de Qwen2, 1.543.714.304 parámetros totales, licencia Apache 2.0 y un tamaño de repositorio de 6,2 GB. Su interés actual reside en que demuestra que un modelo de 1,5B puede resolver con alta precisión una tarea de extracción verticalizada y desplegarse en CPU de portátil, sin GPU, con latencias de unos 3 segundos por dirección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (1 GB) y Q8_0 (1,7 GB); pesos originales en safetensors (fp16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) y GGUF (repositorio separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención causal estándar, y se ajusta mediante fine-tuning supervisado sobre el dataset sintético `abr-6024/indian-address-parsing-synthetic`. La innovación principal no está en la arquitectura, sino en la generación de datos: la v3 construye las direcciones de entrenamiento a partir del directorio real de códigos postales de India Post, de modo que las combinaciones de localidad, pincode, distrito y estado son coherentes con la geografía administrativa real. Tamil Nadu se sobrerrepresenta al 44 % del corpus, lo que sesga el modelo hacia ese estado.

El entrenamiento utiliza un system prompt fijo que define las nueve claves de salida (`flat`, `building`, `street`, `landmark`, `area`, `city`, `state`, `pincode`, `phone`) y la regla de emitir cadena vacía cuando un campo no aparece. La convención clave es que `city` corresponde al distrito (o al nombre metropolitano en grandes ciudades), no al pueblo escrito por el cliente. No se documentan en la información disponible fases de RLHF, DPO ni decodificación especulativa; la generación se realiza con decodificación greedy (`do_sample=False`).

## Capacidades

- Extracción de entidades de dirección a JSON estructurado con nueve campos fijos y validación de sintaxis JSON en el 100 % de los casos según el autor.
- Normalización de abreviaturas y formatos indios: `D.No`, `Old No / New No`, `Village / Post / District`, nombres de ciudad antiguos y referencias a hitos.
- Inferencia de relaciones administrativas reales entre localidad, pincode, distrito y estado, aprendidas del directorio de India Post.
- Política explícita de no inventar: los campos ausentes en la dirección se devuelven como cadena vacía en lugar de inferirse.
- Soporte de conversación mediante plantilla de chat (`apply_chat_template`), con un system prompt específico que debe reproducirse literalmente.
- Extracción del campo `phone` cuando el número aparece en el texto de la dirección.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés; no se documenta soporte para tamil, hindi ni otras lenguas indias.

## Casos de uso

- Enriquecimiento de direcciones en comercio electrónico: el modelo convierte la dirección tecleada por el cliente en JSON con distrito y pincode separados, lo que permite validar contra el directorio de India Post antes de confirmar el pedido. Su política de no adivinar evita asignar un distrito erróneo cuando el cliente omite datos.
- Procesamiento por lotes de importaciones de bases de datos: el endpoint `/parse_batch` admite hasta 100 direcciones por llamada, adecuado para migraciones y limpieza de CRM con direcciones históricas en formatos heterogéneos.
- Normalización en pipelines de logística: separar `area` (localidad o oficina de correo) de `city` (distrito) facilita el enrutado a la oficina postal correcta y la agregación de envíos por distrito.
- Extracción desde correos y formularios de confirmación: con unos 3 segundos por dirección en CPU de portátil, encaja en flujos asíncronos como correos de confirmación o revisiones manuales, no en el camino crítico del checkout.
- Servicio HTTP autoalojado para equipos sin infraestructura de GPU: el paquete `india-address-parser[server]` expone `/parse`, `/parse_batch` y `/health` con autenticación por bearer token, y se despliega con Docker o directamente en Python.
- Integración en aplicaciones Node.js mediante el paquete npm, que puede ejecutar el modelo a través de Ollama o consumir la API HTTP, útil para backends JavaScript que ya tienen Ollama desplegado.
- Preprocesamiento para modelos analíticos posteriores: al emitir JSON estricto y validado, la salida se puede cargar directamente en bases de datos relacionales o motores de geocodificación sin pasos intermedios de parseo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test sintético retenido de 800 direcciones, con coincidencia exacta de registro completo tras pasar a minúsculas y eliminar puntos y comas:

| Slice | Coincidencia de registro completo |
|---|---|
| Todas (n=800) | 94,4 % |
| Localidad del pool de entrenamiento (n=300) | 95,0 % |
| Localidades nunca vistas (n=300) | 94,7 % |
| Distritos enteros nunca vistos (n=200: Ariyalur, Tenkasi, Udupi, Wayanad, Satara, Mathura) | 93,0 % |

Precisión por campo sobre el mismo conjunto:

| Campo | Precision |
|---|---|
| flat | 100,0 % |
| building | 99,9 % |
| street | 99,8 % |
| landmark | 99,5 % |
| area | 96,1 % |
| city | 97,0 % |
| state | 98,5 % |
| pincode | 100 % |
| phone | 100 % |
| JSON valido | 100 % |

Comprobaciones escritas a mano por el autor:

| Conjunto | Resultado |
|---|---|
| 30 direcciones de Tamil Nadu | 29/30 (96,7 %); el fallo es `15 Gandhi Salai, Tirupur 641601`, con `flat` vacío |
| 36 direcciones mixtas de India escritas antes de v2 (ciudad = pueblo escrito) | 80,6 % (campo `city`: 88,9 %) |

El autor advierte que el conjunto de Tamil Nadu fue escrito por él mismo tras diseñar el generador, con el mismo vocabulario y convenciones, por lo que no constituye un benchmark independiente. El conjunto de 36 direcciones usa el pueblo como `city`, en conflicto con la convención de distrito de la v3, de modo que parte de la brecha es de convención y no de precisión. Ninguno de los conjuntos contiene direcciones reales de clientes. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica cabe en GPUs consumer con 6-8 GB.
- Cuantización GGUF Q4_K_M: 1 GB de pesos, ejecutable en CPU sin GPU.
- Cuantización GGUF Q8_0: 1,7 GB de pesos.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 y H100 no son necesarias para este tamaño.
- Cabe holgadamente en GPU consumer; también funciona en portátil sin GPU mediante llama.cpp u Ollama.
- Opciones de despliegue: transformers (con `device_map="auto"`), Ollama (`ollama pull hf.co/abr-6024/indian-address-parser-1.5B-GGUF:Q4_K_M`), llama.cpp a través del GGUF, paquete Python `india-address-parser`, paquete npm `india-address-parser` y servidor HTTP propio con Dockerfile incluido.
- Latencia: aproximadamente 3 segundos por dirección en CPU de portátil según el autor. No se documenta throughput en GPU ni en vLLM/TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indian Address Parser 1.5B (v3) | 1,54B | No disponible | Extracción de direcciones indias a JSON | Apache 2.0 | Hugging Face, GGUF, paquetes Python y npm |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | No disponible en la informacion proporcionada | Asistente generalista | Apache 2.0 | Hugging Face |
| Otros parsers de direcciones indias | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con alternativas especializadas no está disponible en la información proporcionada. Frente a su modelo base, la diferencia medible es la precisión en la tarea: el autor reporta que la v1, entrenada con geografía sintética, acertaba alrededor del 58 % en un conjunto de estrés de estilo real, mientras que la v3 alcanza el 94,4 % en el test sintético retenido. Cualquier modelo generalista de la misma familia requeriría prompting y postprocesado para aproximarse a esa tasa de JSON válido al 100 %.

## Limitaciones y advertencias

- Sesgo geográfico: Tamil Nadu representa el 44 % del corpus de entrenamiento, por lo que el rendimiento en otros estados puede ser inferior pese a los resultados en distritos no vistos.
- Todos los conjuntos de evaluación son sintéticos o escritos por el autor; no hay validación con direcciones reales de clientes ni benchmark independiente.
- Convención de `city` como distrito: si la aplicación espera el pueblo o la localidad escrita, es necesario postprocesar o usar otro modelo; el conjunto de 36 direcciones mixtas baja al 80,6 % en parte por este motivo.
- Riesgo de alucinación mitigado pero no eliminado: el modelo está entrenado para no inventar campos ausentes, pero no se documenta una tasa de error específica en direcciones ambiguas o incompletas.
- Idioma limitado al inglés: no se documenta soporte para direcciones escritas en tamil, hindi u otras lenguas indias, frecuentes en el mercado objetivo.
- Longitud de contexto no documentada en la información disponible; direcciones muy largas o con texto adicional podrían truncarse.
- Datos personales: las direcciones son información personal, y el autor recomienda configurar una API key antes de exponer el servidor HTTP.
- Latencia de unos 3 segundos por dirección en CPU: no apto para bloquear un checkout en tiempo real.
- Una sola ejecución de entrenamiento publicada; el autor indica que una segunda ejecución de la misma receta difirió en algunas décimas de punto.
- Sin soporte de tool calling, agentes, visión ni audio; no debe evaluarse como modelo generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abr-6024/indian-address-parser-1.5B
- Pesos GGUF: https://huggingface.co/abr-6024/indian-address-parser-1.5B-GGUF
- Dataset sintético: https://huggingface.co/datasets/abr-6024/indian-address-parsing-synthetic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio GitHub: https://github.com/ab-rar-6024/indian-address-parser
- Paquete Python: https://pypi.org/project/india-address-parser/
- Paquete npm: https://www.npmjs.com/package/india-address-parser
- Ollama: https://ollama.com/download

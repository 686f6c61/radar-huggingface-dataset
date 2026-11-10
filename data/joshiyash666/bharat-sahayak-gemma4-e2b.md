# joshiyash666/bharat-sahayak-gemma4-e2b

## Resumen
Bharat Sahayak (भारत सहायक) es un adaptador LoRA (PEFT) para el modelo base `google/gemma-4-E2B-it` de Google DeepMind, desarrollado por Yash Joshi (usuario `joshiyash666`). Se trata de un asistente conversacional de dominio especifico orientado a agricultores de la India, con capacidad de invocar herramientas (function calling) para obtener datos factibles como fechas, calendarios de cultivo, precios de mercado (mandi), meteorologia y esquemas de ayudas publicas. Responde en hindi, marathi e ingles, incluyendo variantes en escritura devanagari y romana, asi como hinglish.

El modelo resuelve un problema concreto: ofrecer asistencia agricola fiable en entornos con conectividad limitada, priorizando la precision sobre la generacion libre. Para ello delega cualquier dato factual en herramientas externas y evita inventar cifras. La relevancia actual radica en su enfoque "offline-first", con una version GGUF Q4_K_M pensada para ejecutarse en telefonos moviles mediante llama.cpp o Termux, algo poco habitual en asistentes de function calling.

El adaptador se entrena sobre un modelo base pequeno (Gemma 4 E2B, de la familia Gemma 4), lo que permite su despliegue en hardware de consumo. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E2B |
| Parametros totales | no disponible (adaptador LoRA r=16 sobre modelo base E2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | Q4_K_M (GGUF publicado); el adaptador se carga en 4 bits (QLoRA) |
| Idiomas soportados | hindi (devanagari y romano), marathi (devanagari y romano), ingles, hinglish |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA de rango 16 entrenado con QLoRA mediante Unsloth sobre una unica GPU Kaggle T4 en fp32, con longitud maxima de secuencia de 2048 tokens. La perdida se calcula unicamente sobre los turnos generados por el modelo, enmascarando los resultados de las herramientas. El entrenamiento se realizo en dos fases: v1/v2 con 10.000 conversaciones (625 pasos) y v3 continuando desde v2 con 4.000 conversaciones nuevas, tasa de aprendizaje 1e-4 y 250 pasos.

Los datos de entrenamiento consisten en 14.651 conversaciones sinteticas multi-turno, cubriendo 24 intenciones y 6 estilos linguisticos (hindi devanagari y romano, marathi devanagari y romano, hinglish e ingles), con aproximadamente un 40 % en estilo voz con ruido de ASR simulado. Los hechos provienen de un paquete de conocimiento con fuentes citadas (calendarios de cultivo de ICAR y universidades agrarias estatales, paginas de esquemas y lineas de ayuda). El modelo utiliza el tool calling nativo de Gemma 4 con nueve herramientas definidas: `get_today_context`, `get_crop_calendar`, `get_varieties`, `get_weather`, `get_mandi_price`, `recommend_equipment`, `kb_lookup` (12 intenciones fijas), `open_page` y `open_dialer`.

## Capacidades
- Generacion de texto conversacional multi-turno en hindi, marathi, ingles e hinglish, incluyendo entrada en estilo voz con ruido de ASR.
- Function calling / tool use nativo de Gemma 4 con nueve herramientas definidas para datos factibles.
- Razonamiento multi-paso orientado a agentes: el modelo solicita consentimiento antes de abrir paginas o marcadores telefonicos.
- Asesoria agricola: siembra, calendario de cultivos, variedades, dosis de semilla, calidad de semilla.
- Meteorologia y planificacion: pronostico, momento de pulverizacion, riego, alertas de heladas.
- Maquinaria agricola: eleccion de tractor, alquiler frente a compra, subvenciones, gestion de rastrojos, pulverizacion con drones.
- Informacion economica y de esquemas: MSP, precios de mandi, PM-KISAN, prestamos KCC, precio de fertilizantes, reclamaciones PMFBY.
- Seguridad: rechaza compartir OTP, senala llamadas fraudulentas (1930) y no proporciona dosis de pesticidas (remite a KVK o a la etiqueta del producto).
- Capacidades multilingues limitadas a los idiomas declarados.

## Casos de uso
- Atencion al agricultor por voz o texto en el movil: el modelo gestiona conversaciones multi-turno en hindi o marathi y responde con datos obtenidos de herramientas, adecuado para entornos rurales con conectividad intermitente gracias a su version GGUF Q4_K_M ejecutable en Termux.
- Consulta de calendario de siembra: el modelo invoca `get_crop_calendar` y `get_varieties` para indicar que sembrar en la fecha actual, si es tarde, dosis de semilla y eleccion de variedad, sin inventar fechas.
- Planificacion de pulverizacion y riego: usa `get_weather` para recomendar el momento optimo de pulverizacion o riego y alertar de heladas, integrando datos de Open-Meteo proporcionados por la aplicacion.
- Consulta de precios de mercado: invoca `get_mandi_price` para informar del precio de mandi y del MSP, evitando que el modelo genere cifras no verificadas.
- Tramitacion guiada de esquemas publicos: explica PM-KISAN, prestamos KCC o reclamaciones PMFBY y, tras el consentimiento explicito del usuario, abre la pagina oficial o el marcador mediante `open_page` y `open_dialer`.
- Deteccion de fraude y proteccion del usuario: identifica llamadas sospechosas, rechaza compartir OTP y deriva a la linea 1930, con cero violaciones registradas en el conjunto de prueba.
- Asistencia en la eleccion de maquinaria: usa `recommend_equipment` para comparar alquiler frente a compra de tractor, subvenciones y servicios de pulverizacion con drones.
- Despliegue en aplicaciones moviles de extension agricola: el adaptador puede integrarse en kits telefonicos que aportan los resultados de las herramientas, manteniendo el modelo como capa de dialogo y decision.

## Benchmarks y rendimiento
Resultados sobre un conjunto de prueba retenido de 600 turnos con formulaciones y distritos no vistos:

| Metrica | Gemma 4 E2B base | Bharat Sahayak v3 |
|---|---|---|
| Herramienta correcta elegida | 27,3 % (linea base v1, 200 turnos) | 98,9 % |
| Argumentos correctos | 14,8 % | 95,1 % |
| Respuestas con cifras inventadas | 16 de 192 | 0 |
| Violaciones de consentimiento / OTP / dosis | no disponible | 0 |

El autor menciona una evaluacion general de tool calling sobre datos publicos de BFCL v4 con el verificador AST oficial, ejecutada con su propio arnes de inferencia (no es una entrada de leaderboard); los resultados estarian en `bfcl_results.json` una vez ejecutados.

## Requisitos de hardware
- VRAM estimada para inferencia: el adaptador se carga en 4 bits sobre el modelo base E2B; el autor entrena en una T4 de 16 GB. La VRAM concreta para inferencia no esta especificada.
- GPU recomendadas: el entrenamiento se realizo en una unica Kaggle T4; para inferencia se puede usar cualquier GPU con suficiente memoria para el modelo base en 4 bits.
- Cabe en GPU de consumo: si, el modelo base es de categoria E2B y el autor publica una version GGUF Q4_K_M para ejecucion en telefonos moviles.
- Opciones de despliegue: Unsloth (carga con `FastModel.from_pretrained` en 4 bits), llama.cpp / llama-server con `--jinja` y Termux en movil, y el script `phone_agent.py` del repositorio de datos.
- Latencia y throughput: no disponibles.
- Detalle de generacion: detener la generacion en `<turn|>` o `<|tool_response>`, ejecutar la herramienta, anadir su respuesta y continuar.

## Comparativa con modelos similares
No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparativa mas directa es con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Herramienta correcta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bharat Sahayak v3 (este) | adaptador LoRA sobre E2B | 2048 | 98,9 % | Apache-2.0 | Hugging Face (adaptador y GGUF) |
| Gemma 4 E2B base | E2B | no disponible | 27,3 % (linea base v1) | no disponible en la informacion | Hugging Face (Google) |

No se han identificado en la informacion proporcionada otros asistentes agricolas de function calling comparables.

## Limitaciones y advertencias
- Dominio restringido a agricultura; el autor indica que pequenos negocios y vida diaria quedan para versiones futuras.
- El paquete de conocimiento esta fechado el 2026-11-08: importes y fechas de esquemas cambian con el tiempo.
- Datos de entrenamiento sinteticos: el habla real de agricultores sera mas ruidosa; el autor solicita reportes de fallos.
- Fallos conocidos: las preguntas sobre subvenciones para compra de drones a veces se derivan a la subvencion general de maquinaria; ocasionalmente invoca `kb_lookup` antes de rechazar una dosis de pesticidas.
- No sustituye a un agronomo, a un KVK ni al portal oficial de esquemas.
- Riesgo de alusion: mitigado por diseno mediante delegacion en herramientas, pero persiste en respuestas fuera del alcance de estas.
- Idiomas limitados a hindi, marathi, ingles e hinglish; no cubre otras lenguas de la India.
- Es una version modificada de Gemma 4 E2B; Gemma es marca de Google LLC y el proyecto no esta afiliado ni respaldado por Google.
- Licencia Apache-2.0 para el adaptador; deben tenerse en cuenta las condiciones del modelo base subyacente para uso comercial.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/joshiyash666/bharat-sahayak-gemma4-e2b
- Version GGUF (Q4_K_M): https://huggingface.co/joshiyash666/bharat-sahayak-gemma4-e2b-GGUF
- Dataset, herramientas y generador: https://huggingface.co/datasets/joshiyash666/bharat-sahayak-farm-tools
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it

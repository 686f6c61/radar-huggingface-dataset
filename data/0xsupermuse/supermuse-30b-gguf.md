# 0xSupermuse/Supermuse-30B-GGUF

## Resumen

Supermuse 30B es un ajuste fino (fine-tune) de tipo QLoRA sobre el modelo multimodal Muse Glimmer 30B de Meta, orientado especificamente a la operativa de agentes de trading de acciones estadounidenses. Lo desarrolla el usuario 0xSupermuse y se distribuye en formato GGUF cuantizado en Q4_K_M, con un proyector de vision opcional en BF16 para entrada de imagenes. El modelo resuelve el problema de orquestar un conjunto fijo de herramientas bursatiles (cotizaciones, posiciones, noticias, envio y cancelacion de ordenes) siguiendo un protocolo de llamada a funciones estricto y con salvaguardas de confirmacion explicita antes de ejecutar operaciones.

El modelo base del que deriva, Muse Glimmer 30B, no viene detallado en la informacion proporcionada mas alla de su naturaleza multimodal (pipeline image-text-to-text) y su origen en Meta. El ajuste se ha realizado con 3.000 conversaciones sinteticas multi-turno repartidas al 50 por ciento entre ingles e indonesio, cubriendo 22 escenarios de operativa. Segun el autor, la contribucion principal del fine-tune no es mejorar las capacidades de seguridad del modelo base, sino fijar una identidad propia (Supermuse) y adaptar el comportamiento al conjunto de herramientas concretas.

La relevancia actual del modelo radica en su enfoque de agente financiero con herramientas especificas y su distribucion ligera en GGUF, lo que permite ejecutarlo en hardware de consumo mediante Ollama, llama.cpp o LM Studio. Se publica bajo licencia Apache 2.0, aunque el uso queda sujeto ademas a la politica de uso de Muse Glimmer de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivado multimodal (image-text-to-text) del modelo base Muse Glimmer 30B de Meta |
| Parametros totales | 27.854.794.240 (aproximadamente 27,85 mil millones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; BF16 para el proyector de vision (mmproj) |
| Idiomas soportados | Ingles (en) e indonesio (id) |
| Licencia | Apache 2.0 (sujeta tambien a la politica de uso de Muse Glimmer de Meta) |
| Formato de pesos | GGUF (archivo principal Q4_K_M de 16,9 GB y proyector de vision mmproj BF16 de 3,8 GB) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base Muse Glimmer 30B en la informacion disponible. Se sabe que es un modelo multimodal con pipeline image-text-to-text, ya que Supermuse conserva un proyector de vision (mmproj) en BF16 y admite entrada de imagenes de forma opcional. La unica capa modificada durante el ajuste son las capas de lenguaje, mediante QLoRA con rango r=16 y alpha=32 aplicado a los modulos de atencion y MLP. El modelo base empleado para el entrenamiento fue la version cuantizada a 4 bits de Unsloth (`unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`).

El entrenamiento consistio en 1 epoca sobre 3.000 conversaciones sinteticas multi-turno generadas por plantilla, cubriendo 22 escenarios, con una distribucion del 50 por ciento en indonesio y 50 por ciento en ingles, y un 39 por ciento de las conversaciones sin system prompt. El schedule fue de 375 pasos con tamano de lote efectivo de 8 y tasa de aprendizaje 1e-4 con decaimiento coseno. La perdida se calculo unicamente sobre los turnos del asistente, enmascarando los tokens de sistema, usuario y salida de herramientas. Todo el entrenamiento se ejecuto en una unica GPU A100 de 80 GB durante aproximadamente 1,7 horas. La perdida de evaluacion en conversaciones sinteticas reservadas descendio de 0,0182 (paso 100) a 0,0053 (valor final).

La innovacion funcional del ajuste es la integracion del formato nativo de llamada a herramientas ATEM de Muse Glimmer, que la plantilla de chat incluida renderiza. El modelo fue entrenado para invocar 10 herramientas concretas con prefijo `robinhood.`: `get_account`, `get_positions`, `get_quote`, `get_historical_prices`, `search_instrument`, `get_news`, `get_open_orders`, `place_order`, `cancel_order` y `get_order_status`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles e indonesio.
- Entrada multimodal de imagenes mediante el proyector de vision mmproj opcional.
- Llamada a funciones y uso de herramientas (tool calling) en el formato nativo ATEM, compatible con el esquema OpenAI-style `tools`.
- Integracion con 10 herramientas especificas de operativa bursatil (consulta de cuenta, posiciones, cotizaciones, precios historicos, busqueda de instrumentos, noticias, ordenes abiertas, envio, cancelacion y estado de ordenes).
- Comportamiento de agente: consulta datos con una herramienta antes de afirmar cifras y evita inventar numeros.
- Salvaguarda de confirmacion: muestra una previsualizacion exacta de la orden antes de `place_order` o `cancel_order` y exige una confirmacion explicita; una pregunta, una duda o una autorizacion generica no cuentan como confirmacion.
- Gestion de errores: reporta los fallos de las ordenes y no reintenta por iniciativa propia.
- Resistencia a inyeccion de instrucciones: trata la salida de las herramientas como datos e ignora instrucciones embebidas en ellas (por ejemplo, en titulares de noticias).
- Identidad propia: se identifica como Supermuse incluso sin system prompt.

## Casos de uso

- Consulta de cartera y posiciones: el modelo puede recuperar el saldo y las posiciones del usuario invocando `get_account` y `get_positions` antes de responder, evitando cifras inventadas, lo que lo hace adecuado como capa conversacional sobre un broker propio.
- Cotizacion y analisis de precios: mediante `get_quote` y `get_historical_prices` puede responder a preguntas sobre el precio actual o la evolucion historica de un instrumento, integrable en asistentes de seguimiento de mercado.
- Investigacion de instrumentos: con `search_instrument` puede resolver simbolos o nombres ambiguos de acciones antes de operar, util en interfaces donde el usuario no conoce el ticker exacto.
- Resumen de noticias financieras: usando `get_news` puede agregar titulares relevantes, con la salvaguarda de tratar ese contenido como datos y no como instrucciones, reduciendo el riesgo de manipulacion via texto externo.
- Ejecucion asistida de ordenes: con el flujo de previsualizacion y confirmacion explicita, puede canalizar `place_order` y `cancel_order` en una interfaz de trading que exija validacion humana antes de cada operacion.
- Seguimiento de ordenes abiertas: mediante `get_open_orders` y `get_order_status` puede informar del estado de las operaciones en curso, adecuado para paneles de monitorizacion.
- Asistente bilingue para mercados de EE. UU.: al soportar ingles e indonesio, puede atender a usuarios de habla indonesia que operan en el mercado estadounidense, un nicho poco cubierto por asistentes financieros convencionales.
- Despliegue local en hardware de consumo: gracias al formato GGUF Q4_K_M (unos 20 GB), puede ejecutarse en estaciones de trabajo o portatiles con GPU de gama alta y suficiente memoria, sin depender de APIs en la nube.

## Benchmarks y rendimiento

El autor publica 16 sondas de comportamiento (behaviour probes) redactadas con formulaciones que no aparecen en los datos de entrenamiento. Cada sonda evalua la primera accion del modelo bajo decodificacion voraz (greedy).

| Modelo | Con system prompt | Sin system prompt |
|---|---|---|
| Supermuse v2 | 16/16 | 16/16 |
| Muse Glimmer 30B (base) | 14/16 | 13/16 |

Segun el autor, toda la diferencia proviene de las 3 sondas de identidad. En las 13 sondas de seguridad de trading el modelo base ya obtiene 13/13 y el fine-tune mantiene ese comportamiento sin mejorarlo de forma medible. El propio autor advierte que 16 sondas son una muestra pequena y que esto no constituye una auditoria de seguridad.

Perdida de evaluacion en conversaciones sinteticas reservadas:

| Paso | Eval loss |
|---|---|
| 100 | 0,0182 |
| 200 | 0,0069 |
| 300 | 0,0054 |
| Final | 0,0053 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El archivo Q4_K_M necesita aproximadamente 20 GB de RAM o VRAM, segun indica el autor.
- Para entrada de imagenes hay que sumar el proyector de vision mmproj BF16 de 3,8 GB.
- GPU recomendadas: A100 80 GB (usada para el entrenamiento); para inferencia, tarjetas con al menos 20-24 GB de VRAM, como RTX 3090 o RTX 4090 (24 GB), que permiten alojar el Q4_K_M de forma ajustada. En GPUs con menos VRAM se puede recurrir al volcado parcial a RAM del sistema.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM (RTX 3090, RTX 4090); en tarjetas de 16 GB o menos probablemente requiera descarga parcial a RAM.
- Opciones de despliegue: Ollama (`ollama run hf.co/0xSupermuse/Supermuse-30B-GGUF:Q4_K_M`), llama.cpp (`llama-server -hf 0xSupermuse/Supermuse-30B-GGUF:Q4_K_M`) y LM Studio (buscando `0xSupermuse/Supermuse-30B-GGUF`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (16 sondas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supermuse v2 (este modelo) | ~27,85 mil millones | No disponible | 16/16 con y sin system prompt | Apache 2.0 | GGUF en HuggingFace |
| Muse Glimmer 30B (base) | No disponible | No disponible | 14/16 con system prompt; 13/16 sin system prompt | Muse Glimmer (Meta) | Modelo base de Meta |
| Otros modelos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparativa documentada es contra el modelo base Muse Glimmer 30B, del que deriva. No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son generados por plantilla, por lo que el modelo es estrecho: cabe esperar su mejor rendimiento en flujos cercanos a los 22 escenarios de entrenamiento.
- La evaluacion se basa en solo 16 sondas, una muestra pequena que el propio autor reconoce que no constituye una auditoria de seguridad.
- Idiomas limitados a ingles e indonesio; no hay soporte documentado para castellano ni otros idiomas.
- Longitud de contexto no disponible, lo que dificulta planificar conversaciones largas o documentos extensos.
- Riesgo de alucinacion mitigado parcialmente (el modelo consulta herramientas antes de afirmar cifras), pero no eliminado; el autor solo garantiza el comportamiento entrenado en los escenarios cubiertos.
- Advertencia explicita del autor: no es asesoramiento financiero; proporciona datos y riesgos generales, no recomendaciones personalizadas de compra o venta.
- Robinhood no dispone de una API publica oficial para operar acciones, por lo que las herramientas deben conectarse a un backend de broker propio; se recomienda probar con paper trading antes de usar dinero real.
- Restricciones de licencia: aunque se publica bajo Apache 2.0, el uso esta sujeto a la politica de uso de Muse Glimmer de Meta, que entre otras cosas prohibe el ejercicio sin licencia de profesiones financieras. Supermuse esta pensado para compartir datos, no para actuar como asesor financiero.
- Supermuse no esta afiliado ni respaldado por Meta ni por Robinhood.
- El modelo maneja ordenes reales a traves de herramientas (`place_order`, `cancel_order`), por lo que cualquier despliegue en produccion debe incorporar validacion humana y controles externos de riesgo.

## Enlaces

- HuggingFace: https://huggingface.co/0xSupermuse/Supermuse-30B-GGUF
- Sitio web del proyecto: https://supermuse.dev
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo base cuantizado para entrenamiento: `unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`
- Esquemas de herramientas: `tools.json` (en el repositorio)
- Politica de uso de Muse Glimmer: `USAGE_POLICY.md` (en el repositorio)
- Licencia: `LICENSE` (texto de la licencia original, Apache 2.0)

# Openwist/Logistes-1.0

## Resumen

Logistes 1.0 es un adaptador LoRA desarrollado por Openwist AI sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct, orientado a tareas de contabilidad y gestion empresarial en dispositivos locales. Se distribuye como adaptador PEFT (r=16, alpha=32, entrenado en fp16) y hereda la arquitectura y el tokenizador del modelo base, de 1.200 millones de parametros. Su proposito es ofrecer un asistente contable que trabaje en partida doble, utilice herramientas de hoja de calculo y mantenga una politica estricta de honestidad sobre su naturaleza (no simular ser humano, no usar emojis, admitir incertidumbre).

El modelo se presenta como una especializacion de bajo coste computacional para entornos on-device, con un enfasis explicito en el uso de herramientas (`read_range`, `write_cells`, `add_formula`, `create_table`, `create_report`) y en el cumplimiento de reglas de comportamiento mediante un system prompt canonico. Su relevancia actual radica en la tendencia a desplegar asistentes especializados de dominio en hardware modesto, aunque su alcance real esta limitado por un entrenamiento con solo 2.743 ejemplos sinteticos y por una evaluacion centrada en formato y comportamiento, no en capacidad general.

La informacion publica disponible es escasa: el repositorio ocupa 0,0 GB, no registra descargas ni interacciones, y la model card no incluye benchmarks de capacidad (MMLU, HumanEval, GSM8K) ni datos sobre el contexto maximo efectivo mas alla del heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LiquidAI/LFM2.5-1.2B-Instruct; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | 1.200 millones (modelo base); adaptador LoRA r=16, alpha=32 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en fp16; el base admite las cuantizaciones propias de su ecosistema, no detalladas) |
| Idiomas soportados | Ingles (contexto keniata); no evaluado en otros idiomas salvo ejemplos aislados de identidad en suajili |
| Licencia | LFM Open License v1.0 (uso comercial gratuito por debajo de 10 millones USD de ingresos anuales) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en formato transformers |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32, entrenado en fp16, que se aplica sobre el modelo base LiquidAI/LFM2.5-1.2B-Instruct. No se especifica en la informacion disponible la arquitectura interna del base (transformer denso, MoE o hibrida), por lo que no puede confirmarse mas alla de lo que indique la documentacion de LiquidAI. El adaptador utiliza la plantilla nativa tipo ChatML del modelo base, con las herramientas declaradas en el turno de sistema entre `<|tool_list_start|>` y `<|tool_list_end|>` y las llamadas emitidas como `<|tool_call_start|>[function(arg=value)]<|tool_call_end|>`.

El entrenamiento empleo 2.743 ejemplos, todos en ingles, generados de forma sintetica y programatica por Openwist: conversaciones con respuestas verificables (aritmetica, unidades, totales en partida doble, simulaciones de herramientas de hoja de calculo, tickets de derivacion) y un conjunto comun de "comportamiento nucleo de Openwist" que cubre honestidad de identidad, admision de incertidumbre, rechazos educados y ausencia de emojis. Cada turno del asistente fue filtrado con comprobaciones basadas en reglas para detectar emojis, afirmaciones de humanidad y filtraciones de identidad de terceros. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre datos sinteticos.

## Capacidades

- Generacion de texto conversacional en ingles orientada a dominio empresarial y contable.
- Razonamiento aritmetico basico y calculo de totales en partida doble (debitos y creditos equilibrados, balance cuadrado).
- Uso de herramientas de hoja de calculo: `read_range`, `write_cells`, `add_formula`, `create_table` y `create_report`.
- Emision de llamadas a herramientas en formato estructurado parseable mediante el helper `openwist_pipeline.py` incluido en el repositorio.
- Comportamiento disciplinado: no afirma ser humano, no usa emojis, admite incertidumbre y rechaza peticiones daninas con alternativas mas seguras.
- Generacion de resumenes limitados a cifras presentes en el documento fuente.
- Soporte de contexto multi-turno segun la ventana del modelo base (no confirmada en la informacion disponible).
- Capacidad multilingue limitada: ingles como idioma principal; no evaluado en otros idiomas.

## Casos de uso

- Automatizacion de asientos contables: el modelo recibe datos de transacciones y genera asientos en partida doble con debitos y creditos equilibrados, usando `write_cells` y `add_formula` para volcar los importes en una hoja de calculo local.
- Generacion de informes financieros resumidos: a partir de un rango de celdas leido con `read_range`, produce un resumen que solo cita cifras presentes en el documento, adecuado para informes internos de pymes.
- Asistente de escritorio para pequenas empresas: al ejecutarse sobre un modelo de 1,2B en hardware consumer, permite desplegar un asistente contable sin conexion ni envio de datos financieros a la nube.
- Conciliacion y comprobacion de balances: el modelo puede detectar desequilibrios en un libro mediante formulas y tablas generadas con `create_table`, apoyandose en su entrenamiento en partida doble.
- Creacion de plantillas y hojas de calculo: genera tablas y formulas a partir de instrucciones en lenguaje natural, util para estandarizar libros contables en pequenos despachos.
- Derivacion a profesionales: ante consultas fiscales o legales, el modelo declina y ofrece alternativas seguras, lo que lo hace apto como primera capa de triaje en atencion al cliente contable.
- Integracion en pipelines de agentes locales: sus llamadas a herramientas en formato estructurado permiten conectarlo a orquestadores que ejecuten acciones sobre hojas de calculo reales.

## Benchmarks y rendimiento

La model card publica una evaluacion automatica basada en reglas sobre 120 conversaciones reservadas con redaccion no vista, comparando el adaptador con su modelo base bajo el mismo prompt y herramientas:

| Comprobacion | Logistes 1.0 | Modelo base |
|---|---|---|
| Puntuacion global de comportamiento | 100,0 % | 81,5 % |
| Salida limpia (sin emoji, sin afirmacion de humanidad, sin filtracion de identidad) | 100,0 % | 100,0 % |
| Herramienta correcta elegida | 100,0 % | 74,8 % |
| Argumentos de llamada validos | 100,0 % | 67,3 % |
| Sin llamada a herramienta innecesaria | 100,0 % | 76,9 % |

Recuento de emojis: 0. Afirmaciones de humanidad: 0. Filtraciones de identidad: 0. El propio autor advierte que estas comprobaciones miden comportamiento y formato de llamadas, no capacidad general ni tareas especificas de Kenia, que estan pendientes. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,2B en fp16 requiere aproximadamente 2,4 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits puede situarse en torno a 1 GB o menos (estimacion, no confirmada en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090 o superiores. Tambien viable en CPU y en hardware de borde.
- Cabe en GPU consumer: si, en la mayoria de tarjetas graficas modernas e incluso en dispositivos integrados.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan confirmados para este adaptador en la informacion disponible, aunque el base podria soportarlos segun su ecosistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Logistes 1.0 | 1,2B (adaptador sobre LFM2.5-1.2B-Instruct) | no disponible | Contabilidad y gestion empresarial on-device | LFM Open License v1.0 (gratis < 10 M USD) | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B | no disponible | Asistente general | LFM Open License v1.0 | Hugging Face |
| Otros adaptadores contables de 1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada; la unica comparacion publicada es contra el modelo base en comportamiento y formato de herramientas.

## Limitaciones y advertencias

- Los datos de entrenamiento son mayoritariamente basados en plantillas, por lo que la variedad de redaccion es menor que la de usuarios reales; se espera un comportamiento mas debil ante formulaciones inusuales.
- Los modelos pequenos pueden equivocarse con confianza; es necesario verificar resultados contables importantes.
- No sustituye a un contador o auditor cualificado para presentaciones oficiales.
- No evaluado en idiomas distintos del ingles, salvo ejemplos aislados de identidad en suajili.
- Entrenado con solo 2.743 ejemplos sinteticos, lo que limita la cobertura de casos reales y de jerga contable especifica.
- La licencia LFM Open License v1.0 impone un umbral de ingresos anuales (10 millones USD) para uso comercial gratuito; por encima de ese umbral es necesario revisar los terminos.
- Repositorio sin descargas ni interacciones y con fecha de creacion muy reciente, lo que implica ausencia de validacion independiente.
- Riesgo de alucinacion en cifras y en la interpretacion de documentos fuente, pese a la instruccion de limitar los resumenes a cifras presentes.
- No apto para decisiones medicas, legales o financieras sin supervision profesional, ni para certificaciones de ingenieria de seguridad critica.
- El adaptador requiere el modelo base y los helpers de `openwist_pipeline.py` para el parseo de llamadas; no es un modelo autonomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Openwist/Logistes-1.0
- Organizacion Openwist: https://huggingface.co/Openwist
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct

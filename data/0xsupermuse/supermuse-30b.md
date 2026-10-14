# 0xSupermuse/Supermuse-30B

## Resumen

Supermuse 30B es un ajuste fino mediante QLoRA del modelo multimodal Muse Glimmer 30B de Meta, desarrollado por el usuario 0xSupermuse. Se presenta como un agente de trading para acciones de Estados Unidos con un conjunto de herramientas de estilo Robinhood, capaz de consultar cotizaciones, posiciones, noticias y ordenes, y de ejecutar ordenes a traves de llamadas a funciones. El modelo responde en ingles e indonesio y esta publicado bajo licencia Apache 2.0.

Tecnicamente se distribuye como pesos completos en BF16 en safetensors (29.776.626.688 parametros reales, unos 29,8B) con el adaptador LoRA ya fusionado, bajo la arquitectura `MuseGlimmerForConditionalGeneration` y pipeline `image-text-to-text`. Existe ademas una compilacion cuantizada en GGUF en un repositorio aparte para su uso con Ollama, llama.cpp o LM Studio.

Su relevancia es acotada y especifica: no busca competir en capacidades generales, sino especializarse en un flujo de tool calling con salvaguardas explicitas (previsualizacion de ordenes, confirmacion obligatoria, tratamiento del output de herramientas como datos y no como instrucciones). El entrenamiento fue deliberadamente estrecho (3000 conversaciones sinteticas, 22 escenarios), por lo que su interes esta en la verificacion de comportamiento seguro en un dominio concreto mas que en un rendimiento generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (image-text-to-text, transformer multimodal) |
| Parametros totales | 29.776.626.688 (aproximadamente 29,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 safetensors (pesos completos); GGUF en repositorio aparte |
| Idiomas soportados | en (ingles), id (indonesio) |
| Licencia | Apache 2.0, sujeta ademas a la Muse Glimmer Usage Policy de Meta |
| Formato de pesos | safetensors (BF16); GGUF en 0xSupermuse/Supermuse-30B-GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`, una version cuantizada en 4 bits de Muse Glimmer 30B de Meta. Sobre esa base se aplico un ajuste QLoRA con Unsloth, rango r=16, alpha=32, dirigido a las capas de atencion y MLP, y restringido a las capas de lenguaje. El adaptador resultante se fusiono en los pesos BF16 finales. La arquitectura subyacente es `MuseGlimmerForConditionalGeneration`, con pipeline declarado `image-text-to-text`, lo que implica soporte de entrada de imagen ademas de texto, aunque la model card no detalla la composicion de la torre de vision.

El entrenamiento uso 3000 conversaciones sinteticas multi-turno generadas a partir de plantillas, distribuidas en 22 escenarios, con una division del 50% en indonesio y 50% en ingles, y un 39% de las muestras sin system prompt. El regimen fue de 1 epoca, 375 pasos, tamano de lote efectivo 8 y tasa de aprendizaje 1e-4 con decaimiento coseno. La perdida se calculo unicamente sobre los turnos del asistente: los tokens de sistema, usuario y salida de herramientas quedaron enmascarados. Todo el proceso se ejecuto en 1x A100 80GB durante aproximadamente 1,7 horas. La innovacion principal no es arquitectonica sino de comportamiento: el modelo fue entrenado para llamar a 10 herramientas en el formato nativo ATEM de Muse Glimmer, que la plantilla de chat incluida renderiza a partir de `tools` con estilo OpenAI.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles e indonesio.
- Tool calling y function calling con 10 herramientas de estilo Robinhood: `get_account`, `get_positions`, `get_quote`, `get_historical_prices`, `search_instrument`, `get_news`, `get_open_orders`, `place_order`, `cancel_order` y `get_order_status`.
- Formato de llamada a herramientas ATEM nativo de Muse Glimmer, expuesto como `tools` con estilo OpenAI y nombres prefijados `robinhood.`.
- Comportamiento de agente transaccional: obtiene precios y saldos mediante herramienta antes de afirmarlos y evita inventar cifras.
- Salvaguarda de confirmacion: muestra una previsualizacion exacta antes de `place_order` o `cancel_order` y espera una confirmacion explicita; una pregunta, una duda o una autorizacion generica no cuentan como confirmacion, y cada cambio de cantidad genera nueva previsualizacion.
- Gestion de errores: reporta los fallos de orden y no reintenta por iniciativa propia.
- Resistencia basica a inyeccion de instrucciones en el output de herramientas, incluidos titulares de noticias.
- Identidad propia estable: se identifica como Supermuse incluso sin system prompt.
- Entrada multimodal de imagen y texto segun el pipeline declarado `image-text-to-text`, aunque no se detalla su alcance efectivo.

## Casos de uso

- Consulta de cartera y posiciones: el modelo usa `get_account` y `get_positions` para responder sobre saldos y exposicion, evitando cifras inventadas y devolviendo datos obtenidos de la herramienta.
- Seguimiento de cotizaciones e historicos: con `get_quote`, `get_historical_prices` y `search_instrument` se puede construir un asistente que resuelva el simbolo correcto antes de consultar precio o serie temporal.
- Asistente de previsualizacion y confirmacion de ordenes: el flujo de preview mas confirmacion explicita encaja en interfaces donde el usuario debe validar cada operacion, con nueva previsualizacion ante cualquier cambio de cantidad.
- Monitorizacion de ordenes abiertas: `get_open_orders` y `get_order_status` permiten responder sobre el estado de ordenes pendientes en conversaciones de seguimiento.
- Resumen de contexto de mercado con noticias: `get_news` aporta titulares que el modelo trata como datos, lo que reduce el riesgo de que texto externo redirija su comportamiento.
- Prototipado de agentes financieros en indonesio: la division 50/50 del entrenamiento entre ingles e indonesio lo hace util para demos y pruebas de flujo en ese idioma.
- Integracion como backend conversacional via vLLM o cualquier servidor compatible con la arquitectura Muse Glimmer, pasando las herramientas como `tools`.

## Benchmarks y rendimiento

El autor publica 16 sondas de comportamiento, redactadas con formulaciones que no aparecen en los datos de entrenamiento, y evalua la primera accion del modelo bajo decodificacion greedy.

| Modelo | Con system prompt | Sin system prompt |
|---|---|---|
| Supermuse v2 | 16/16 | 16/16 |
| Muse Glimmer 30B (base) | 14/16 | 13/16 |

Segun el propio autor, toda la diferencia proviene de las 3 sondas de identidad: en las 13 sondas de seguridad de trading el modelo base ya puntuaba 13/13 y el ajuste mantiene ese comportamiento sin mejorarlo de forma medible. La muestra de 16 sondas es pequena y el autor advierte explicitamente que no constituye una auditoria de seguridad.

Perdida de evaluacion en conversaciones sinteticas reservadas: 0,0182 (paso 100) → 0,0069 (paso 200) → 0,0054 (paso 300) → 0,0053 (final).

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Pesos completos en BF16: aproximadamente 59,6 GB solo de pesos (tamano del repositorio reportado), por lo que la inferencia en BF16 requiere del orden de 60 GB o mas de VRAM, mas el margen para KV cache.
- Cuantizacion de 8 bits: estimacion en torno a 30 GB de VRAM, viable en A100 40GB/80GB, H100, L40S o dos GPU consumer de gama alta con reparto de capas.
- Cuantizacion de 4 bits (GGUF Q4_K_M): estimacion en torno a 17-19 GB de VRAM, lo que la situa al limite de una RTX 4090 de 24 GB y holgada en RTX 3090/4090 con contexto moderado.
- Entrenamiento original: 1x A100 80GB durante aproximadamente 1,7 horas para el ajuste QLoRA.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM o cualquier servidor compatible con la arquitectura Muse Glimmer; para local, la compilacion GGUF con llama.cpp, Ollama o LM Studio.
- La model card no publica cifras de latencia ni de throughput; no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas de la misma categoria en la informacion proporcionada. La comparacion mas directa disponible es contra el modelo base del que deriva.

| Modelo | Parametros | Contexto | Sondas de comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supermuse 30B | 29,8B | no disponible | 16/16 (con y sin system prompt) | Apache 2.0 + Muse Glimmer Usage Policy | HuggingFace (safetensors y GGUF) |
| Muse Glimmer 30B (base) | 30B (segun denominacion) | no disponible | 14/16 con system prompt; 13/16 sin | no disponible | HuggingFace |

## Limitaciones y advertencias

- Los datos de entrenamiento son generados por plantillas y deliberadamente estrechos: el modelo rinde mejor en flujos cercanos a los 22 escenarios entrenados y puede degradarse fuera de ellos.
- La evaluacion se apoya en solo 16 sondas; el autor advierte que es una muestra pequena y que no constituye una auditoria de seguridad.
- Riesgo de alucinacion en cifras y datos de mercado, mitigado por diseno mediante consulta previa a herramienta, pero no eliminado en todos los contextos.
- La propia model card incluye el aviso "not financial advice": el modelo aporta datos y riesgos generales, no recomendaciones personalizadas de compra o venta.
- Robinhood no dispone de API publica oficial de trading, por lo que el usuario debe conectar las herramientas a su propio backend de broker. Se recomienda probar en paper trading antes de operar con dinero real.
- La Muse Glimmer Usage Policy de Meta prohibe, entre otras cosas, el ejercicio no autorizado de profesiones financieras; el uso comercial esta sujeto a esa politica ademas de a la Apache 2.0.
- Soporte de idiomas limitado a ingles e indonesio; no hay indicacion de cobertura en castellano ni en otros idiomas.
- No se especifica la longitud de contexto efectiva, dato critico para planificar conversaciones largas o documentos extensos.
- Supermuse no esta afiliado ni respaldado por Meta ni por Robinhood.
- El modelo hereda los sesgos y limitaciones del modelo base Muse Glimmer 30B, que no se documentan en la informacion disponible.

## Enlaces

- HuggingFace (modelo principal): https://huggingface.co/0xSupermuse/Supermuse-30B
- HuggingFace (GGUF): https://huggingface.co/0xSupermuse/Supermuse-30B-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Base QLoRA usada en entrenamiento: https://huggingface.co/unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit
- Sitio web del proyecto: https://supermuse.dev
- Muse Glimmer Usage Policy: incluida como `USAGE_POLICY.md` en el repositorio
- Licencia original: incluida como `LICENSE` en el repositorio

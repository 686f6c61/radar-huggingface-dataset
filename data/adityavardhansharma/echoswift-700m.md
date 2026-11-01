# adityavardhansharma/EchoSwift-700M

## Resumen

EchoSwift-700M es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2-700M, desarrollado por el usuario adityavardhansharma para alimentar EchoFlow, un asistente de IA movil que funciona de forma privada y completamente en el dispositivo. El modelo hereda la arquitectura LFM2 (Liquid Foundation Model, segunda generacion) y sus aproximadamente 742 millones de parametros, y se ha especializado mediante SFT en tres tareas concretas: emitir busquedas web quirurgicas en una sola linea, generar artefactos HTML/CSS/JS autocontenidos y mantener un tono tecnico directo con soporte nativo de matematicas.

Su relevancia actual reside en que los modelos de borde (edge) de tamano reducido suelen producir texto conversacional abierto poco fiable para agentes estructurados. EchoSwift corrige ese comportamiento con un protocolo de salida estricto y verificable, y se distribuye tambien como paquetes LiteRT (`.litertlm`) cuantizados en INT8 e INT4 con ventanas de 4K y 8K tokens, pensados para ejecutarse en telefonos Android con NPU Snapdragon o APU Dimensity.

El modelo se publica bajo la LFM Open License v1.0, la misma del modelo base, y esta orientado a despliegues offline en movil y en equipos de escritorio mediante Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model v2), transformer; detalles internos no disponibles |
| Parametros totales | 742.489.344 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (paquetes INT8/INT4 estandar) y 8.192 tokens (variantes `_8k_ekv8192`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | INT8 dinamico (`dynamic_wi8_afp32`) e INT4 blockwise-32 (`wi4b32` OCTAV) en formato LiteRT; pesos originales en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm-open-1.0`, etiquetada como `other`) |
| Formato de pesos | safetensors (Transformers) y `.litertlm` (LiteRT/TFLite) |

## Arquitectura y entrenamiento

EchoSwift-700M parte de LiquidAI/LFM2-700M, un modelo de la familia LFM2 de Liquid AI. La model card no detalla la composicion interna de la arquitectura mas alla de identificarla como LFM2, por lo que no se dispone de informacion sobre atencion, capas o mecanismos hibridos concretos. El ajuste se realizo sobre el corpus `adityavardhansharma/echoflow-sft-corpus`, un conjunto de datos de supervision (SFT) disenado para el asistente EchoFlow; no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion tecnica principal no esta en la arquitectura sino en el protocolo de comportamiento aprendido: el modelo emite una unica linea `search: consulta` (de 2 a 6 palabras) cuando necesita informacion externa, evita la busqueda en matematicas, codigo, algoritmos, traducciones y saludos, y genera aplicaciones HTML/CSS/JS completas envueltas en etiquetas `<echo:artifact type="html" title="...">`, con objetivos tactiles de al menos 44 px y sin dependencias de CDN externas. Ademas, el modelo se distribuye en paquetes LiteRT con plantilla de chat minja para ejecucion nativa en Android mediante el motor C++ de TFLite.

## Capacidades

- Generacion de texto conversacional con tono tecnico directo y estructura en tablas Markdown.
- Razonamiento matematico con notacion LaTeX nativa (`$...$` y `$$...$$`).
- Busqueda web quirurgica: emite exactamente una linea `search: consulta` con anclas de fecha y hora cuando requiere datos frescos.
- Guardrail de cero busqueda en matematicas, codigo, algoritmos, traducciones y conversacion casual.
- Generacion de artefactos de un solo archivo: aplicaciones HTML/CSS/JS completas y funcionales (calculadoras, dashboards, temporizadores) sin CDN externos.
- Soporte de tool calling y function calling segun las etiquetas del repositorio.
- Capacidades agenticas de multiples pasos orientadas a movil.
- Ejecucion on-device en Android mediante LiteRT (INT8 e INT4).
- Capacidades multilingues: no disponibles (no se documentan idiomas soportados).

## Casos de uso

- Asistente personal offline en Android: el modelo se integra en EchoFlow como motor de lenguaje en el dispositivo, gestionando conversaciones multi-turno con 4K u 8K tokens de contexto sin enviar datos a la nube.
- Busqueda web con disparo controlado: en un agente movil, el modelo decide cuando consultar datos frescos emitiendo una sola linea `search: consulta`, lo que permite al orquestador ejecutar la busqueda y reinyectar resultados sin ambiguedad de formato.
- Generacion de miniaplicaciones embebidas: el modelo produce artefactos HTML/CSS/JS autocontenidos (por ejemplo, un temporizador Pomodoro de 1.276 tokens generado sin truncamiento) que pueden renderizarse directamente en un WebView sin conexion.
- Calculo y resolucion matematica en el dispositivo: gracias al guardrail de cero busqueda y al soporte LaTeX, es adecuado para tutoria o asistencia tecnica que no debe depender de red.
- Traduccion y asistencia de codigo en local: el modelo evita la busqueda en tareas de codigo y traduccion, por lo que sirve como asistente de programacion offline en movil o portatil.
- Prototipado rapido de interfaces: un desarrollador puede pedir dashboards o calculadoras en un solo archivo y obtener codigo listo para probar en un telefono, util en entornos con conectividad limitada.
- Despliegue en portatiles y estaciones de trabajo: mediante Transformers en bfloat16, sirve para evaluar el comportamiento del protocolo EchoFlow antes de empaquetarlo en LiteRT.

## Benchmarks y rendimiento

Resultados publicados por el autor en la suite de evaluacion EchoFlow:

| Metrica | Resultado | Detalle |
|---|---|---|
| EchoFlow Schema Adherence | 100,0 % de exito | Disparadores de busqueda y etiquetas de cierre de artefacto validados |
| Surgical Search Compliance | 100,0 % conforme | Emite una sola linea `search: query` sin relleno conversacional |
| Zero-Search Guardrail | 100,0 % de exito | Cero busquedas en matematicas, codigo y conversacion casual |
| Complete Artifact Generation | 100,0 % de exito | App Pomodoro completa de 1.276 tokens sin truncamiento |
| Peak Generation Throughput | 68,9 tokens/s | Inferencia on-device |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 1,5 GB solo para pesos (742 M de parametros), mas overhead de activaciones y cache KV.
- Paquetes LiteRT: 770,8 MB en INT8 y 458,5-460,0 MB en INT4, aptos para telefonos Android con Snapdragon NPU o Dimensity APU.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (RTX 3050, RTX 4060, etc.) para bfloat16; en INT4 cabe en entornos con menos de 1 GB.
- GPU recomendadas para servidor: A100, H100 o L40S para mayor throughput, aunque el modelo esta disenado para borde y no requiere estas aceleradoras.
- Opciones de despliegue: Transformers (bfloat16), LiteRT/TFLite para Android; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 68,9 tokens/s en pico segun el autor en inferencia on-device; no se publican latencias por hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EchoSwift-700M | 742 M | 4K / 8K (LiteRT) | LFM Open License v1.0 | Agente de borde con protocolo de busqueda y artefactos |
| LiquidAI/LFM2-700M (base) | 700 M aprox. | no disponible | LFM Open License v1.0 | Modelo fundacional de borde generico |
| Gemma 3 1B | no disponible en la informacion | no disponible | Gemma Terms | Modelo pequeno de Google para borde |
| Qwen2.5-0.5B | no disponible en la informacion | no disponible | Apache 2.0 | Modelo pequeno multilingue |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible, ya que el autor solo publica metricas de su propia suite EchoFlow.

## Limitaciones y advertencias

- El ajuste esta altamente especializado en el protocolo EchoFlow; fuera de ese esquema puede comportarse de forma menos flexible que el modelo base.
- Riesgo de alucinacion en datos factuales: el modelo mitiga la busqueda pero no garantiza la veracidad de la informacion generada sin consulta externa.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingue solido.
- Contexto limitado a 4K u 8K tokens en los paquetes LiteRT, insuficiente para documentos largos.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Los benchmarks publicados son internos (suite EchoFlow) y no comparables con evaluaciones estandar de la comunidad.
- El modelo tiene 90 descargas y 0 likes en el momento de la consulta, con escasa validacion externa.
- El repositorio pesa 5,4 GB, lo que incluye los paquetes LiteRT ademas de los pesos en safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adityavardhansharma/EchoSwift-700M
- Repositorio cuantizado LiteRT: https://huggingface.co/adityavardhansharma/EchoSwift-700M-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM2-700M
- Corpus de entrenamiento: https://huggingface.co/adityavardhansharma/echoflow-sft-corpus
- Sitio de EchoFlow: https://echoflow.adityavs.space
- Licencia LFM Open License v1.0: https://raw.githubusercontent.com/Liquid-AI/LFM/main/LICENSE
- Descarga INT8 4K: https://huggingface.co/adityavardhansharma/EchoSwift-700M/resolve/main/EchoSwift-700M_int8.litertlm
- Descarga INT4 4K: https://huggingface.co/adityavardhansharma/EchoSwift-700M/resolve/main/EchoSwift-700M_int4.litertlm
- Descarga INT8 8K: https://huggingface.co/adityavardhansharma/EchoSwift-700M/resolve/main/EchoSwift-700M_int8_8k_ekv8192.litertlm
- Descarga INT4 8K: https://huggingface.co/adityavardhansharma/EchoSwift-700M/resolve/main/EchoSwift-700M_int4_8k_ekv8192.litertlm

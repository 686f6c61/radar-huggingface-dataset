# maruel/LFM3-1.7B-LiteRT-INT8-64K

## Resumen

LFM3-1.7B-LiteRT-INT8-64K es una conversión cuantizada del modelo LiquidAI/LFM3-1.7B de Liquid AI, empaquetada en formato LiteRT-LM para su despliegue en dispositivos Android. El artefacto lo publica el desarrollador independiente maruel como parte del proyecto Go Mode, y su propósito es ofrecer una variante del modelo base lista para ejecutarse en el runtime LiteRT-LM de Google con pesos INT8 y una ventana de contexto de 65.536 tokens.

El modelo base LFM3 pertenece a la familia de modelos de lenguaje de Liquid AI, si bien la información proporcionada no detalla su arquitectura interna ni su proceso de entrenamiento. Esta conversión concreta incorpora tokenizador y plantilla de chat en un único bundle de 1,8 GB, con pesos matriciales cuantizados a INT8 por canal y constantes de convolución y normalización en FP32, mientras que el estado KV y el estado recurrente se mantienen en float16.

Su relevancia es práctica: permite ejecutar un modelo de 1,7 mil millones de parámetros con contexto largo en hardware móvil Android mediante LiteRT-LM, un escenario con pocas alternativas empaquetadas y listas para producción. La licencia LFM Open License v1.0 condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; la conversión usa LiteRT-LM) |
| Parametros totales | 1,7 mil millones (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | INT8 por canal en pesos matriciales; FP32 en constantes de convolución y normalización; float16 en estado KV y recurrente |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | LiteRT-LM (bundle `.litertlm`) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base LiquidAI/LFM3-1.7B ni los detalles de su entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es el proceso de conversión: los pesos matriciales se cuantizan a INT8 por canal, las constantes de convolución y normalización se conservan en FP32 y tanto el estado KV como el estado recurrente se almacenan en float16. La mención de estado recurrente sugiere que el modelo base incorpora componentes recurrentes junto a los mecanismos de atención, aunque no se detalla su naturaleza exacta.

El bundle resultante integra tokenizador y plantilla de chat adaptada para la reproducción de conversaciones en LiteRT. El script de exportación está publicado en el repositorio Go Mode del autor, lo que permite reproducir o auditar la conversión. No se han publicado datos sobre innovaciones técnicas adicionales del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Ventana de contexto de 65.536 tokens, adecuada para documentos largos y diálogos extensos.
- Soporte de tool calling mediante el formato XML propio entrenado en LFM3, que requiere análisis y parseo en el cliente (implementado en Go Mode).
- Capacidad de razonamiento multi-paso y uso como agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio o modo de pensamiento explícito: no disponible.
- Capacidades matemáticas y de generación de código: no disponible.

## Casos de uso

- Asistente conversacional en Android: el bundle LiteRT-LM está diseñado para ejecutarse en el runtime de Google en dispositivos móviles, con 1,8 GB de tamaño y contexto de 65.536 tokens, lo que permite mantener conversaciones largas sin conexión a red.
- Procesamiento de documentos largos en el dispositivo: la ventana de 64K tokens posibilita resumir o consultar contratos, informes o transcripciones directamente en el teléfono, evitando enviar datos sensibles a servidores externos.
- Agentes locales con tool calling: el formato XML de llamadas a herramientas permite integrar el modelo en flujos que invoquen APIs locales o funciones del sistema operativo, con parseo en el cliente mediante bibliotecas como Go Mode.
- Aplicaciones de privacidad por diseño: al ejecutarse íntegramente en el dispositivo, es adecuado para asistentes de salud, finanzas personales o diarios donde la inferencia en la nube no es aceptable.
- Prototipado de apps Android con IA generativa: sirve como base para desarrolladores que quieran validar experiencias conversacionales en móvil sin depender de infraestructura de servidores ni de costes por token.
- Asistencia en entornos con conectividad intermitente: su naturaleza offline lo hace útil en aplicaciones de campo, logística o educación en zonas con red limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del bundle: 1,8 GB, que constituye una referencia directa del espacio de almacenamiento y de la memoria necesaria para cargar los pesos.
- VRAM estimada para inferencia: no disponible de forma explícita; el estado KV y recurrente en float16 con 65.536 tokens de contexto incrementa la memoria en tiempo de ejecución de forma proporcional al uso de la ventana.
- GPU recomendadas: no disponible; el artefacto está orientado a LiteRT-LM en Android, no a GPU de servidor.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el formato LiteRT-LM no es el habitual para estos entornos.
- Opciones de despliegue: LiteRT-LM (runtime de Google para Android). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-LiteRT-INT8-64K | 1,7 mil millones | 65.536 | LiteRT-LM | LFM Open License v1.0 | HuggingFace (17 descargas) |
| LiquidAI/LFM3-1.7B | 1,7 mil millones | no disponible | no disponible | LFM Open License v1.0 | HuggingFace (modelo base) |
| Alternativas de ~1,7B para movil | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de otras alternativas empaquetadas en LiteRT-LM en la información proporcionada.

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 es distinta de las licencias permisivas habituales; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El modelo base no documenta en esta ficha los idiomas soportados, lo que impide garantizar un comportamiento adecuado en castellano u otros idiomas.
- El tool calling requiere parseo en el cliente del formato XML propio de LFM3; no es un formato estándar y añade complejidad de integración.
- La cuantización INT8 puede degradar la calidad respecto al modelo base en tareas sensibles a la precisión numérica, como matemáticas o código.
- El estado KV y recurrente en float16 con contexto de 64K puede consumir memoria considerable en dispositivos móviles; no se han publicado mediciones de consumo real.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada, aunque son riesgos inherentes a los modelos de lenguaje de esta escala.
- El repositorio tiene un volumen muy bajo de descargas (17) y ningún like, por lo que la validación comunitaria es mínima.
- No se documenta compatibilidad con runtimes de servidor, lo que limita su uso a entornos LiteRT-LM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maruel/LFM3-1.7B-LiteRT-INT8-64K
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio Go Mode: https://github.com/maruel/gomode
- Script de exportación: https://github.com/maruel/gomode/blob/main/scripts/export_lfm_litert.py
- Licencia LFM Open License v1.0: https://huggingface.co/maruel/LFM3-1.7B-LiteRT-INT8-64K/blob/main/LICENSE

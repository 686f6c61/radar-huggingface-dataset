# huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated

## Resumen

Huihui-CyberStrike-OffSec-35B-abliterated es un modelo de lenguaje de 35 000 millones de parámetros desarrollado por huihui-ai, obtenido mediante la técnica de *abliteration* (eliminación de rechazos) sobre el modelo base oyildirim/CyberStrike-OffSec-35B, especializado en seguridad ofensiva y pentesting. El modelo hereda la arquitectura MoE (mezcla de expertos) de la familia Qwen3.5, tal como indican los tags de HuggingFace (`qwen3_5_moe`), y está diseñado para tareas de generación de texto con soporte de *tool calling*.

La relevancia de este modelo radica en su orientación explícita a casos de uso de ciberseguridad ofensiva, combinada con la eliminación de los mecanismos de rechazo habituales en los modelos comerciales. Esto lo convierte en una herramienta de interés para investigadores y profesionales de seguridad que necesitan un asistente que no se niegue a responder sobre exploits, vulnerabilidades o técnicas de ataque, aunque también plantea riesgos evidentes de uso indebido. Al ser una versión *abliterated*, se eliminan los sesgos de seguridad del modelo original, lo que puede aumentar la utilidad en entornos controlados de pentesting, pero también incrementa el riesgo de alucinaciones o respuestas peligrosas.

El modelo se distribuye bajo licencia Apache 2.0 según los tags de HuggingFace, aunque la ficha oficial no confirma este dato. Está disponible en formato `safetensors` y existen conversiones GGUF de terceros para su uso con `llama.cpp` y otros motores de inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (según tags `qwen3_5_moe`) |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (existen conversiones GGUF de terceros, sin especificar tipos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según tags de HuggingFace, no confirmado en la ficha) |
| Formato de pesos | safetensors (también disponible GGUF por terceros) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de la familia Qwen3.5, que combina múltiples expertos con un mecanismo de enrutamiento para activar solo una fracción de los parámetros en cada token. Aunque no se dispone de detalles precisos sobre el número de expertos ni los parámetros activos, la etiqueta `qwen3_5_moe` confirma que se trata de un modelo de mezcla de expertos. El proceso de entrenamiento original de CyberStrike-OffSec-35B incluyó un ajuste fino (*fine-tuning*) orientado a tareas de seguridad ofensiva, con énfasis en *tool calling* y razonamiento multi-paso.

La versión *abliterated* de huihui-ai se obtuvo mediante la técnica de *abliteration*, que consiste en eliminar las direcciones de los residuos (*residual streams*) asociadas a los comportamientos de rechazo. Este método, implementado con la librería `remove-refusals-with-transformers`, modifica los pesos del modelo para que no genere respuestas del tipo "no puedo ayudar con eso" ante solicitudes relacionadas con actividades maliciosas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de instrucciones, con especialización en dominios de ciberseguridad ofensiva (explotación, análisis de vulnerabilidades, red teaming).
- Soporte de *tool calling* / *function calling*, lo que permite integrar el modelo con herramientas externas como escáneres de puertos, frameworks de explotación o APIs de servicios.
- Capacidad de razonamiento multi-paso y planificación de ataques, gracias al ajuste fino específico en tareas de pentesting.
- Al ser una versión *abliterated*, no presenta los rechazos habituales ante solicitudes de contenido sensible o potencialmente peligroso, lo que amplía su rango de respuestas en contextos de seguridad.
- Multilingüismo: no se han publicado datos específicos, pero al estar basado en Qwen3.5 es probable que herede capacidades multilingües del modelo base, aunque no se puede confirmar.
- No se han documentado capacidades de visión o audio; el pipeline es exclusivamente de generación de texto.

## Casos de uso

- **Automatización de pruebas de penetración**: el modelo puede generar comandos, scripts y secuencias de explotación para entornos controlados, integrándose con herramientas como Metasploit o Nmap mediante *tool calling*.
- **Análisis de vulnerabilidades**: dado un CVE o una descripción de un fallo, el modelo puede explicar el vector de ataque, sugerir PoCs y recomendar mitigaciones, acelerando el trabajo de los analistas.
- **Red teaming y simulaciones de adversarios**: en ejercicios de seguridad ofensiva, el modelo puede actuar como un asistente que propone tácticas, técnicas y procedimientos (TTPs) basados en marcos como MITRE ATT&CK.
- **Generación de informes técnicos**: tras una auditoría, el modelo puede redactar informes detallados de hallazgos, incluyendo pasos de reproducción y recomendaciones, ahorrando tiempo a los consultores.
- **Entrenamiento y formación en seguridad**: en entornos educativos controlados, el modelo puede servir como tutor para enseñar técnicas de explotación y defensa, siempre que se utilice con las debidas salvaguardas.
- **Desarrollo de herramientas de seguridad**: los desarrolladores pueden usar el modelo para generar código de exploits educativos, scripts de automatización o parsers de tráfico, aprovechando su capacidad de generación de código y *tool calling*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se han encontrado comparaciones cuantitativas con modelos similares en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: según LLM Explorer, el modelo requiere aproximadamente 70,4 GB de VRAM para inferencia en precisión completa (FP16). Esto implica que no cabe en GPUs de consumo habitual (RTX 4090 con 24 GB, por ejemplo) sin cuantización.
- GPUs recomendadas: para inferencia sin cuantizar se necesitan GPUs de datacenter como A100 (80 GB), H100 (80 GB) o A6000 (48 GB, aunque insuficiente para FP16 completo). Con cuantización de 4 bits o 8 bits podría ejecutarse en GPUs de 24 GB o 32 GB, pero no se han publicado los tipos de cuantización disponibles.
- Opciones de despliegue: al existir conversiones GGUF de terceros, es posible usar `llama.cpp`, `Ollama` o `llama-cpp-python` en CPU o GPU con memoria reducida. Para despliegue en producción con alto throughput, se puede usar `vLLM` o `TGI`, siempre que se disponga de hardware suficiente.
- Latencia y throughput: no se han publicado datos específicos. Al ser un modelo MoE de 35B, la latencia dependerá del número de parámetros activos y del hardware; en general, los MoE ofrecen menor coste computacional por token que un modelo denso del mismo tamaño total.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base CyberStrike-OffSec-35B es el único referente directo, pero no se han publicado métricas comparativas. Otros modelos de seguridad ofensiva como `WhiteRabbitNeo` o `PwnGPT` existen en el ecosistema, pero no se dispone de datos objetivos para comparar parámetros, contexto o rendimiento. Se recomienda consultar las fichas de estos modelos para una evaluación manual.

## Limitaciones y advertencias

- **Riesgo de uso indebido**: al ser una versión *abliterated*, el modelo puede generar contenido peligroso, como exploits funcionales o instrucciones para actividades ilegales. Su uso debe restringirse a entornos autorizados y controlados.
- **Alucinaciones**: al igual que otros modelos de su tamaño, puede inventar técnicas, comandos o vulnerabilidades inexistentes, lo que en el ámbito de la seguridad puede llevar a conclusiones erróneas o acciones dañinas.
- **Sesgos y calidad de datos**: no se ha publicado información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos o desequilibrios en los datos.
- **Licencia**: aunque los tags indican Apache 2.0, la ficha oficial no lo confirma. Se recomienda verificar la licencia antes de un uso comercial.
- **Contexto limitado**: no se ha especificado la longitud de contexto, lo que puede afectar a tareas que requieran ventanas largas, como el análisis de logs extensos o conversaciones multi-turno prolongadas.
- **Falta de benchmarks**: la ausencia de métricas publicadas dificulta la evaluación objetiva de su rendimiento frente a alternativas.

## Enlaces

- [HuggingFace - huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated](https://huggingface.co/huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated)
- [Conversión GGUF por SusanHill](https://huggingface.co/SusanHill/huihui-ai-huihui-cyberstrike-offsec-35b-abliterated-gguf-0811-1510)
- [LLM Explorer - ficha del modelo](https://llm-explorer.com/model/huihui-ai%2FHuihui-CyberStrike-OffSec-35B-abliterated,435paISPPfJi667T2IyBS1)
- [FriendliAI - despliegue del modelo](https://friendli.ai/models/huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated)
- [Perfil de huihui-ai en aimodels.fyi](https://www.aimodels.fyi/creators/huggingFace/huihui-ai)

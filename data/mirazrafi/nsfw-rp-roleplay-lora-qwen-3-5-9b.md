# mirazrafi/NSFW-RP-RolePlay-LoRA-Qwen-3.5-9B

## Resumen

NSFW-RP-RolePlay-LoRA-Qwen-3.5-9B es un adaptador LoRA (PEFT) desarrollado por el usuario mirazrafi sobre la arquitectura Qwen 3.5 de 9B. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (0,5 GB) que debe cargarse sobre el modelo intermedio techwithsergiu/Qwen3.5-text-9B, derivado a su vez de Qwen/Qwen3.5-9B. Su proposito declarado es mejorar la consistencia de personajes, la profundidad narrativa y el dialogo sin censura en escenarios de roleplay adulto.

El adaptador se entrena con Unsloth y emplea RS-LoRA (Rank-Stabilized LoRA) con rango 64 y alpha 64, apuntando a los modulos de atencion y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El modelo base Qwen 3.5 usa una arquitectura hibrida Gated DeltaNet, aunque la model card no detalla el numero exacto de parametros activos ni la longitud de contexto efectiva tras el ajuste.

Es relevante en el nicho de modelos de rol conversacional sin restricciones, donde la comunidad busca adaptadores ligeros que puedan superponerse a modelos base potentes sin necesidad de reentrenar desde cero. Su licencia Apache 2.0 facilita la experimentacion, aunque el contenido generado es responsabilidad exclusiva del usuario. Existe una variante de 4B orientada a entornos con poca VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen 3.5 (Hybrid Gated DeltaNet) |
| Parametros totales | no disponible (adaptador LoRA de 0,5 GB; modelo base de 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes) y FP16 durante el entrenamiento; cuantizaciones del modelo base no especificadas |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (adaptador, base e intermedio) |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen 3.5, descrito en la model card como una arquitectura hibrida Gated DeltaNet. El ajuste se realiza mediante LoRA con RS-LoRA, rango 64 y alpha 64, sobre los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se lleva a cabo con Unsloth en precision 4-bit (bitsandbytes) y FP16, lo que reduce el consumo de memoria frente a un ajuste completo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que se uso la plantilla ChatML durante el entrenamiento para evitar fugas de modo "thinking" y mantener la inmersion en el rol. El adaptador debe cargarse sobre el modelo intermedio techwithsergiu/Qwen3.5-text-9B para obtener los mejores resultados, segun el autor.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y narrativa de personajes.
- Dialogo sin censura en escenarios adultos (NSFW), con el modelo configurado para no rechazar peticiones.
- Mantenimiento de consistencia de personaje y profundidad narrativa en conversaciones multi-turno.
- Soporte de plantilla ChatML para estructurar turnos de conversacion.
- Capacidades del modelo base Qwen 3.5 (razonamiento, codigo, matematicas) potencialmente presentes, aunque el ajuste esta especializado en rol y puede degradarlas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales: la model card menciona "multimodal-capable foundation models (Qwen 3.5)" como area de investigacion, pero no se detalla que modalidades soporta el adaptador.
- Capacidades de agente y razonamiento multi-paso: no disponible.

## Casos de uso

- Roleplay conversacional de personajes: el adaptador mantiene la coherencia de personalidad y estilo narrativo a lo largo de sesiones largas, gracias al ajuste especifico sobre dialogos de rol.
- Escritura creativa de ficcion adulta: util para generar narrativa y dialogos sin restricciones de contenido, con control de tono y personaje mediante el prompt de sistema.
- Investigacion sobre alineacion y censura: permite estudiar el comportamiento de un modelo base potente cuando se le aplica un ajuste que elimina los rechazos, util para analisis de seguridad.
- Experimentacion con tecnicas PEFT: sirve como ejemplo practico de RS-LoRA con rango 64 sobre un modelo de 9B usando Unsloth, replicable en otros dominios.
- Prototipado de chatbots de entretenimiento para adultos: integrable en aplicaciones de chat donde se requiera un personaje persistente y conversacion sin filtros.
- Evaluacion de variantes por VRAM: junto con la variante de 4B, permite comparar calidad y consumo de recursos en distintos entornos de despliegue.
- Generacion de guiones y dialogos para juegos de rol de mesa o narrativos: el modelo puede actuar como master o NPC con memoria de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,5 GB, pero requiere cargar el modelo base de 9B. En FP16, el modelo base necesita aproximadamente 18 GB de VRAM; en 4-bit (bitsandbytes), alrededor de 6-7 GB.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16; RTX 3090/4080 para cuantizacion 4-bit.
- Cabe en GPU de consumo: si, con cuantizacion 4-bit en GPUs de 8 GB o mas; en FP16 requiere GPUs de 24 GB o superiores.
- Opciones de despliegue: transformers + peft (metodo indicado en la model card), con posibilidad de usar vLLM o TGI tras fusionar el adaptador con el modelo base; llama.cpp y Ollama requeririan conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NSFW-RP-RolePlay-LoRA-Qwen-3.5-9B | Adaptador LoRA sobre 9B | no disponible | Apache 2.0 | safetensors (PEFT) | Especializado en rol NSFW, requiere modelo base |
| NSFW-RP-RolePlay-LoRA-Qwen-3.5-4B | Adaptador LoRA sobre 4B | no disponible | Apache 2.0 | safetensors (PEFT) | Variante ligera del mismo autor para baja VRAM |
| Qwen/Qwen3.5-9B | 9B | no disponible | Apache 2.0 | safetensors | Modelo base sin ajuste de rol; censurado por defecto |
| techwithsergiu/Qwen3.5-text-9B | 9B | no disponible | Apache 2.0 | safetensors (bnb) | Modelo intermedio sobre el que se aplica el adaptador |

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar material NSFW y no rechaza peticiones; no debe usarse en entornos no adultos ni sin control de acceso.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar hechos, especialmente en conversaciones largas o fuera del dominio de rol.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento con datos de rol adulto puede amplificar estereotipos de genero o de personaje.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Restricciones de uso: la model card prohibe contenido con menores, contenido no consentido, deepfakes de personas reales y asesoramiento profesional; el usuario asume toda la responsabilidad legal.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere cargar techwithsergiu/Qwen3.5-text-9B y puede heredar sus limitaciones y sesgos.
- Degradacion de capacidades: el ajuste especializado en rol puede reducir el rendimiento en tareas de razonamiento, codigo o matematicas del modelo base.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste; conversaciones muy largas pueden perder coherencia.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el contenido generado y su distribucion quedan sujetos a la legislacion local y a los terminos de las plataformas.

## Enlaces

- Hugging Face (adaptador 9B): https://huggingface.co/mirazrafi/NSFW-RP-RolePlay-LoRA-Qwen-3.5-9B
- Variante 4B: https://huggingface.co/mirazrafi/NSFW-RP-RolePlay-LoRA-Qwen-3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo intermedio: https://huggingface.co/techwithsergiu/Qwen3.5-text-9B
- Unsloth AI: https://github.com/unslothai/unsloth

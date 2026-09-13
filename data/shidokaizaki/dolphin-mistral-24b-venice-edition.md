# Shidokaizaki/Dolphin-Mistral-24B-Venice-Edition

## Resumen

Dolphin Mistral 24B Venice Edition es un modelo de lenguaje de aproximadamente 24.000 millones de parametros desarrollado por Dolphin AI (dphn) en colaboracion con Venice.ai. Se construye como un ajuste fino de `mistralai/Mistral-Small-24B-Instruct-2501` y su objetivo declarado es ofrecer una version sin censura y totalmente dirigible del Mistral Small 3 de 24B, pensada para integrarse en productos donde el propietario del sistema, y no el proveedor del modelo, decide el comportamiento y la alineacion. Es el modelo por defecto ("Venice Uncensored") de la plataforma Venice.

Tecnicamente es un transformer denso (no MoE) con 24.011.361.280 parametros, empaquetado en safetensors y publicado bajo licencia Apache 2.0. La model card recomienda una ventana de hasta 131.072 tokens al servirlo con vLLM e indica soporte de entrada de imagenes en los tags de HuggingFace (`image-text-to-text`), aunque no documenta esa capacidad en detalle. Requiere mas de 60 GB de VRAM para inferencia en precision completa y se entreno sobre 8 GPU B200 proporcionadas por targon.com.

Su relevancia actual se enmarca en el nicho de modelos "uncensored" y steerables: frente a APIs cerradas que controlan el system prompt, las versiones y la alineacion de forma uniforme, este modelo delega esas decisiones en el desarrollador. En HuggingFace aparece republicado bajo la cuenta `Shidokaizaki`, mientras que el autor original referenciado en la model card es dphn.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Mistral Small 3) |
| Parametros totales | 24.011.361.280 (~24B) |
| Longitud de contexto | Hasta 131.072 tokens segun la configuracion vLLM recomendada en la model card (`--max-model-len 131072`) |
| Tipos de cuantizacion | No disponible en la model card; el repositorio principal contiene pesos safetensors en BF16 (~48 GB) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mistral Small 3 (tag `mistral3`), un transformer decoder denso de 24.000 millones de parametros. No emplea mezcla de expertos, por lo que todos los parametros estan activos en cada inferencia. Hereda la plantilla de chat por defecto de Mistral y la plantilla de instrucciones V7-Tekken: `<s>[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST]...[/INST]...`, con el system prompt como mecanismo principal para fijar tono y reglas de comportamiento.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO en este ajuste. Si se indica que el entrenamiento se ejecuto sobre 8 GPU B200 cedidas por targon.com y que el objetivo del proyecto era eliminar la censura del modelo base manteniendolo util como modelo de proposito general. El autor recomienda temperaturas bajas (en torno a `temperature=0.15`) y advierte que si no se define un system prompt, el modelo adoptara un comportamiento por defecto que puede no ser el deseado.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat de Mistral.
- Seguimiento de instrucciones condicionado por system prompt (steerability): el usuario define tono, personaje y normas.
- Modo "sin censura": el autor lo presenta como la version mas descensurada de Mistral 24B, orientada a seguir instrucciones sin reservas segun el system prompt configurado.
- Tool calling / function calling: soportado en vLLM con `--tool-call-parser mistral` y `--enable-auto-tool-choice`.
- Entrada de imagenes: los tags de HuggingFace incluyen `image-text-to-text` y la configuracion de vLLM usa `--limit-mm-per-prompt '{"image": 10}'`, lo que sugiere soporte multimodal; la model card no lo documenta en detalle.
- Capacidades multilingues: presumibles por el modelo base, pero no especificadas en la informacion disponible.
- Compatibilidad de despliegue con Ollama, LM Studio, Transformers, vLLM, SGLang y TGI.

## Casos de uso

- Asistentes conversacionales con personalidad y normas definidas por el cliente: se usaria el system prompt para fijar tono, reglas y limites del negocio, aprovechando la steerability del modelo en lugar de depender de la alineacion fija de una API cerrada.
- Generacion de codigo integrada en pipelines de desarrollo: al soportar tool calling en vLLM, puede conectarse a herramientas de ejecucion, linters o APIs de repositorios dentro de flujos automatizados.
- Atencion al cliente automatizada: la ventana de hasta 131.072 tokens permite mantener conversaciones largas con mucho contexto acumulado sin truncar el historial.
- Procesamiento de documentos largos: analisis, resumen o extraccion de informacion de contratos, informes o transcripciones extensas gracias al contexto extendido.
- Despliegue on-premise con control de datos: al publicarse bajo Apache 2.0 y poder ejecutarse en infraestructura propia, encaja en entornos donde no se pueden enviar consultas a APIs de terceros.
- Prototipado de roles o personajes conversacionales: el system prompt permite definir personajes, estados de animo y reglas concretas, util para videojuegos, simulaciones o entrenamiento.
- Investigacion sobre alineacion y seguridad: su condicion de modelo descensurado lo convierte en un objeto de estudio para comparar comportamientos frente a modelos alineados y para analizar riesgos de abuso.
- Descripcion de imagenes si se confirma la ruta multimodal indicada en los tags (escenarios de captioning o VQA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en precision completa (BF16): los pesos ocupan ~48 GB; sumando cache KV para contexto largo, la model card indica que se necesita mas de 60 GB de VRAM por replica.
- GPU profesionales: A100 80 GB, H100 80 GB o B200. El ejemplo de vLLM del autor usa `tensor_parallel_size=8`, lo que implica despliegue multi-GPU.
- Cuantizacion 8 bits (estimado): ~26 GB de pesos; requeriria GPUs de 40-80 GB, no cabe holgadamente en GPUs de consumo de 24 GB.
- Cuantizacion 4 bits (estimado): ~14 GB de pesos; cabe en una RTX 4090 o RTX 3090 de 24 GB, con ventana de contexto reducida.
- Opciones de despliegue: vLLM (recomendado por el autor), SGLang, TGI, llama.cpp, Ollama, LM Studio y Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada de imagen | Licencia | Alineacion |
|---|---|---|---|---|---|
| Dolphin Mistral 24B Venice Edition | ~24B | Hasta 131.072 | Si (segun tags) | Apache 2.0 | Sin censura / steerable |
| mistralai/Mistral-Small-24B-Instruct-2501 (base) | ~24B | 32.000 | No | Apache 2.0 | Alineado |
| Mistral-Small-3.1-24B-Instruct-2503 | ~24B | 128.000 | Si | Apache 2.0 | Alineado |

La diferencia principal frente a los modelos de Mistral radica en la alineacion: este modelo elimina las capas de rechazo y traslada el control al system prompt, a cambio de asumir los riesgos de seguridad asociados. Frente a Mistral Small 3.1, que es multimodal y con contexto nativo de 128K, la Venice Edition no documenta con el mismo detalle su pipeline de vision.

## Limitaciones y advertencias

- Riesgo elevado de contenido danino: el modelo esta disenado explicitamente para no aplicar filtros de seguridad; puede generar contenido ilegal, peligroso o eticamente problematico segun el system prompt.
- Alucinacion: como cualquier LLM de esta escala, puede inventar hechos, citas o APIs; no se han publicado evaluaciones de fidelidad.
- Sesgos: no hay informacion sobre auditorias de sesgo; al heredar del modelo base y eliminar capas de alineacion, los sesgos pueden aflorar con menos contencion.
- Idiomas: no se especifican los idiomas soportados ni la calidad por idioma.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de rendimiento comparado, lo que dificulta la evaluacion objetiva.
- Consumo de recursos: mas de 60 GB de VRAM en precision completa y despliegue multi-GPU en la configuracion recomendada.
- Documentacion incompleta: no se detallan tokens de entrenamiento, dataset, ni el proceso de ajuste (RLHF/DPO).
- Licencia: Apache 2.0 permite uso comercial, pero el responsable del despliegue asume toda la responsabilidad legal y etica del contenido generado.
- Repositorio republicado: el modelo figura bajo la cuenta `Shidokaizaki` mientras que la model card referencia a dphn; conviene verificar la integridad de los pesos frente al repositorio original `dphn/Dolphin-Mistral-24B-Venice-Edition`.

## Enlaces

- HuggingFace (repositorio consultado): https://huggingface.co/Shidokaizaki/Dolphin-Mistral-24B-Venice-Edition
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Web de Dolphin AI: https://dphn.ai
- Twitter de Dolphin AI: https://x.com/dphnAI
- Web chat: https://chat.dphn.ai
- Bot de Telegram: https://t.me/DolphinAI_bot
- Venice.ai: https://venice.ai/
- Targon (proveedor de computo del entrenamiento): https://targon.com/
- Repositorio de vLLM: https://github.com/vllm-project/vllm

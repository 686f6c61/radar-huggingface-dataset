# LuffyTheFox/Left-LLM-Developement

## Resumen

Genesis3.6-35B-A3B-Uncensored es un modelo multimodal de tipo image-text-to-text derivado de la familia Qwen3.6, publicado por el desarrollador independiente LuffyTheFox bajo licencia Apache 2.0. Se construye sobre el modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y sobre el finetune DJLougen/hermes-qwen3.5-35b-a3b-GGUF, del que se transfieren aproximadamente 2.000 bloques de dos tensores de expertos FFN entrenados con el dataset NousResearch/hermes-function-calling-v1. El resultado es un MoE de 34.660.610.688 parametros totales con unos 3B activos por token, 256 expertos (8 enrutados mas 1 compartido) y arquitectura hibrida con Gated DeltaNet lineal.

La propuesta diferencial del autor no es el entrenamiento, sino el post-procesado: el llamado algoritmo Genesis, descrito como una tecnica de "reparacion de senal" que aplica descomposicion SVD personalizada sobre los tensores del modelo en formato GGUF para reducir ruido de entrenamiento, corregir desajustes de escala, mitigar deriva de medias y sustituir bloques de pesos anulados. El autor lo presenta como una alternativa a reentrenar, ejecutada sobre GPU Tesla T4 gratuita de Google Colab.

El modelo se distribuye principalmente en cuantizaciones GGUF, con soporte declarado de vision mediante fichero mmproj, modo thinking y no-thinking, y capacidades de function calling heredadas del finetune Hermes. Es relevante para quienes buscan un MoE grande con contexto largo (recomendado 65.536 tokens, con aviso de mantener 128K para preservar thinking) ejecutable en hardware de consumo mediante offload de expertos a CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con Gated DeltaNet lineal (segun model card) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por forward pass (MoE) |
| Longitud de contexto | 65.536 recomendado; el autor indica mantener al menos 128K para preservar thinking |
| Tipos de cuantizacion | GGUF (NVFP4 recomendado por el autor); otras cuantizaciones no detalladas |
| Idiomas soportados | en, zh, multilingual (segun tags); lista completa no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 59,3 GB); safetensors referenciados en los metadatos de parametros |
| Expertos | 256 totales, 8 enrutados + 1 compartido por token |
| Pipeline | image-text-to-text (multimodal con mmproj) |
| Dataset de referencia | NousResearch/hermes-function-calling-v1 |
| Modelo base | HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive |
| Finetune de origen | DJLougen/hermes-qwen3.5-35b-a3b-GGUF |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 35B parametros totales con aproximadamente 3B activos por token, 256 expertos y 8 enrutados mas 1 compartido. La model card describe una arquitectura hibrida con Gated DeltaNet lineal, lo que sugiere una combinacion de atencion lineal y mecanismos tipo state space para gestionar contexto largo con coste reducido. No se detalla el numero de capas, dimensiones ocultas ni la composicion exacta del bloque hibrido.

El entrenamiento original corresponde al modelo base de HauhauCS (variante "uncensored" de Qwen3.6-35B-A3B) y al finetune de DJLougen sobre Hermes, del que se importan unos 2.000 bloques de dos tensores de expertos FFN. Sobre esa mezcla, el autor aplica el algoritmo Genesis: un pipeline de tres etapas que escanea tensores ssm_conv1d (asociados a memoria de contexto largo) y los reequilibra mediante SVD personalizada; detecta ruido en tensores excluyendo token_embd.weight, output.weight, ffn_gate_inp_shexp.weight, tensores 1D, biases y normas; y finalmente reemplaza bloques nulos por fragmentos seleccionados segun la distribucion de pesos del tensor. No se especifican volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en el modelo base. Tampoco se documenta el uso de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (65.536 tokens recomendados, hasta 128K para preservar thinking).
- Razonamiento en modo thinking y respuestas directas en modo no-thinking, con ajustes de muestreo diferenciados.
- Vision multimodal: pipeline image-text-to-text, requiere el fichero mmproj junto al GGUF principal.
- Function calling y tool calling, heredados del finetune sobre NousResearch/hermes-function-calling-v1.
- Uso como agente: el autor lo posiciona explicitamente como modelo para el agente Hermes.
- Capacidades multilingues con enfasis en ingles y chino, y soporte multilingue generico segun tags.
- Generacion de codigo y artefactos estructurados (la model card incluye una prueba de generacion de SVG).
- Modo "uncensored": el modelo base reduce filtros de rechazo, lo que amplia el rango de respuestas pero incrementa riesgos.
- Compatibilidad con endpoints (tag endpoints_compatible) y con llama.cpp mediante flag --jinja.

## Casos de uso

- Agente conversacional con herramientas: el modelo puede encadenar llamadas a funciones en varios pasos gracias al finetune Hermes sobre function calling, integrándose en orquestadores de agentes que necesiten decidir que API invocar en cada turno.
- Asistente de codigo en local: con cuantizacion NVFP4 y offload de expertos a CPU, permite autocompletado y explicacion de codigo en estaciones de trabajo con GPU de 12 GB, sin depender de servicios en la nube.
- Analisis de documentos e imagenes: al ser image-text-to-text con mmproj, puede procesar capturas, diagramas o figuras junto a texto largo en tareas de extraccion y resumen.
- Procesamiento de contextos extensos: con 65.536 tokens recomendados y aviso de mantener 128K para thinking, es adecuado para resumir expedientes, hilos de soporte o bases de conocimiento extensas en una sola pasada.
- Generacion de artefactos visuales tecnicos: la model card demuestra la generacion de SVG (pelicano en bicicleta), lo que encaja en pipelines que producen graficos vectoriales, diagramas o mockups a partir de descripciones.
- Experimentacion en investigacion sobre post-procesado: el pipeline Genesis es replicable y el modelo sirve como caso de estudio para evaluar tecnicas de reparacion de tensores sin reentrenamiento.
- Despliegue en hardware de consumo: con la configuracion recomendada para RTX 3060 12 GB (MoE Expert Cache 4096 MiB, offload maximo, contexto 65.536) el autor reporta 30 tokens por segundo en NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento aportada por el autor es de throughput: 30 tokens por segundo en una RTX 3060 de 12 GB con cuantizacion NVFP4 y la configuracion de LM Studio indicada (MoE Expert Cache 4096 MiB, offload maximo, contexto 65.536, seed 42 o 0).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo completo pesa 59,3 GB, por lo que la cuantizacion elegida determina el footprint. El autor valida funcionamiento en 12 GB de VRAM con NVFP4 y offload de expertos a CPU.
- GPU recomendadas: el autor cita RTX 3060 12 GB como referencia validada; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, al menos en RTX 3060 12 GB con offload de expertos MoE a CPU y cache de expertos configurada.
- Opciones de despliegue: LM Studio (configuracion detallada por el autor), llama.cpp con flag --jinja, y compatibilidad declarada con endpoints. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Throughput: 30 tokens por segundo en RTX 3060 12 GB con NVFP4 y los ajustes recomendados. Latencia no disponible.
- Configuracion LM Studio: forzar el maximo de capas MoE a CPU, GPU offload maximo, MoE Expert Cache 4096 MiB; si la generacion se detiene, reducir GPU offload a 19.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Genesis3.6-35B-A3B-Uncensored | 34,66B | ~3B | 65.536 recomendado / 128K para thinking | Apache 2.0 | GGUF | Post-procesado Genesis, vision via mmproj, Hermes function calling |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B | ~3B | no disponible | no disponible | no disponible | Modelo base sin el pipeline Genesis |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35B | ~3B | no disponible | no disponible | GGUF | Finetune Hermes del que se transfieren bloques de expertos |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto declarado, licencia y formato.

## Limitaciones y advertencias

- El modelo es una variante "uncensored": reduce los filtros de rechazo del modelo base, lo que puede producir contenido inapropiado, danoso o legalmente problematico en produccion sin moderacion adicional.
- Riesgo de alucinacion: el autor justifica Genesis precisamente por la propension a alucinaciones del ruido de entrenamiento, pero no aporta evaluaciones objetivas que cuantifiquen la mejora.
- El algoritmo Genesis no esta publicado con detalle reproducible ni validado de forma independiente; sus afirmaciones (reduccion de ruido, reparacion de senal) no cuentan con benchmarks publicos en la informacion disponible.
- La model card incluye una seccion de donaciones con direcciones de criptomonedas y contacto personal, lo que conviene tratar con cautela.
- Idiomas: solo se declaran en, zh y "multilingual"; no hay evaluacion del rendimiento en castellano.
- La lista completa de idiomas y la composicion del dataset de entrenamiento no estan disponibles.
- Requiere fichero mmproj para vision y flag --jinja en llama.cpp para el chat template correcto; sin ellos el comportamiento degrada.
- El autor advierte que hay que mantener al menos 128K de contexto para preservar las capacidades de thinking, lo que aumenta los requisitos de memoria frente al valor recomendado de 65.536.
- Licencia Apache 2.0 permite uso comercial, pero el caracter uncensored y la falta de evaluaciones de sesgo trasladan al desplegador la responsabilidad de filtrado y cumplimiento.
- No hay datos publicados sobre sesgos especificos ni sobre latencia en GPU de datacenter.

## Enlaces

- Hugging Face: https://huggingface.co/LuffyTheFox/Left-LLM-Developement
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Chat template recomendado: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates/raw/main/archive/qwen3.6/chat_template-v19.jinja
- System prompt de ejemplo: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF/blob/main/System_Prompt.txt
- Ejemplo SVG de prueba: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF/blob/main/pelikan.svg
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper referenciado en tags (arxiv:2605.29843): no disponible en la informacion proporcionada

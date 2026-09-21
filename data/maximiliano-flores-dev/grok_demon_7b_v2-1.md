# Maximiliano-Flores-Dev/grok_demon_7b_v2.1

## Resumen

Grok Demon v2.1 es un adaptador LoRA de tipo PEFT publicado por el desarrollador independiente Maximiliano-Flores-Dev, no un modelo completo. Se monta sobre `Maximiliano-Flores-Dev/grok_demon_7b`, que a su vez es una fusión de pesos de una primera etapa LoRA entrenada sobre `unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit`. La arquitectura efectiva en inferencia es, por tanto, Qwen2 (`Qwen2ForCausalLM`, familia Qwen2.5-7B) con dos deltas acumulados: el de la v1 ya horneado en el modelo base y el de esta v2.1 (~162 MB). El objetivo declarado es ofrecer un asistente conversacional bilingüe español/inglés y sin filtros de seguridad, con licencia Apache-2.0.

El adaptador se entrenó con Unsloth y TRL mediante SFT, con rango LoRA `r=16`, `lora_alpha=16`, `lora_dropout=0` y siete módulos objetivo por capa (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), y se distribuye junto a un `chat_template.jinja` de tipo ChatML que incorpora la persona "Grok Demon". Su relevancia práctica es acotada pero clara: permite actualizar una instalación existente de la v1 descargando solo 162 MB, y sirve como ejemplo reproducible de cadena de fine-tuning apilado con PEFT. En el momento de la consulta acumula 0 descargas y 1 like, y el autor no ha publicado ningún benchmark, por lo que no existe validación externa de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (`Qwen2ForCausalLM`), transformer decoder-only denso; el artefacto publicado es un adaptador LoRA (PEFT) sobre `Maximiliano-Flores-Dev/grok_demon_7b` |
| Parametros totales | 7B aproximados en el modelo base (denominacion del repo y familia Qwen2.5-7B); el adaptador aporta ~162 MB de pesos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; la familia Qwen2.5-7B declara 32 768 tokens nativos, dato no confirmado para este adaptador |
| Tipos de cuantizacion | No disponible en la model card; el autor documenta la fusion del adaptador y su posterior conversion (por ejemplo a GGUF) para servir el modelo |
| Idiomas soportados | Espanol (es) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) mas `adapter_config.json`, `chat_template.jinja` y ficheros de tokenizer |
| Tipo de artefacto | Adaptador LoRA, no autonomo; requiere cargar primero el modelo base |
| Configuracion LoRA | `r=16`, `lora_alpha=16`, `lora_dropout=0`; modulos objetivo: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Version de PEFT | 0.19.1 |
| Modelo base | `Maximiliano-Flores-Dev/grok_demon_7b` (relacion: finetune) |
| Base original de la cadena | `unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit` |
| Tamano del repositorio | 0.8 GB |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

La cadena de entrenamiento tiene tres niveles. El punto de partida es `unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit`, sobre el que se aplico una primera etapa LoRA (Unsloth + TRL) que dio lugar a `grok_demon_7b`, publicado con pesos fusionados en bf16 y un tamano aproximado de 15,2 GB. Sobre ese modelo completo, ya fusionado, se entreno la segunda etapa LoRA que constituye este repositorio. El autor subraya que no se trata de un "LoRA de un LoRA": un adaptador siempre se entrena sobre un modelo completo, de modo que en inferencia el resultado efectivo es la suma de los pesos base de Qwen2.5, el delta de la v1 y el delta de la v2.1. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; unicamente se indica SFT como metodo y se etiqueta el resultado como `uncensored`.

Tecnicamente no se documenta ninguna innovacion de arquitectura o decodificacion (no hay atencion lineal, decodificacion especulativa ni variantes hibridas). La aportacion del repositorio es de ingenieria de fine-tuning: un adaptador de bajo rango sobre siete proyecciones por capa, entrenado con Unsloth para acelerar el proceso, acompanado de un template de chat que inyecta la persona del modelo. El autor recomienda fusionar el adaptador con `merge_and_unload()` para el despliegue en produccion, ya que simplifica el servicio y la conversion a GGUF.

## Capacidades

- Generacion de texto conversacional en formato instruct, con soporte de dialogos multi-turno mediante `apply_chat_template()`.
- Bilinguismo espanol/ingles declarado en las etiquetas del repositorio y en la model card.
- Modo sin filtros de seguridad (`uncensored`): el autor delega explicitamente en el usuario la responsabilidad sobre salvaguardas y moderacion.
- Capacidades heredadas del modelo base Qwen2.5-7B-Instruct (codigo, matematicas, razonamiento, resumen), sin evaluacion publicada que las cuantifique para este adaptador.
- Tool calling / function calling: no documentado en la informacion disponible.
- Uso como agente o razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; la arquitectura es exclusivamente de texto.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente conversacional local con privacidad total: fusionando el adaptador y cuantizando a 4 bits, el modelo puede ejecutarse en una GPU de consumo sin enviar datos a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Actualizacion incremental de despliegues existentes de la v1: cualquier instalacion que ya sirva `grok_demon_7b` puede incorporar la v2.1 descargando 162 MB adicionales y aplicando el adaptador con `PeftModel.from_pretrained`, sin volver a descargar los pesos base.
- Generacion de contenido editorial bilingue es/en: redaccion de borradores, reescritura y traduccion asistida en un unico modelo, aprovechando que no requiere infraestructura adicional de traduccion.
- Investigacion en seguridad y alineacion: al declararse sin filtros, resulta util como sujeto de pruebas de red-teaming y de analisis comparativo frente a modelos alineados, siempre en entornos controlados.
- Base para una tercera etapa de fine-tuning con datos propios: la cadena ya validada (Qwen2.5 -> v1 -> v2.1) sirve como punto de partida para un SFT adicional de bajo coste sobre dominios verticales (legal, sanitario, atencion al cliente).
- Generacion de datos sinteticos de dialogo en espanol: produccion de pares instruccion-respuesta para alimentar el entrenamiento de modelos mas pequenos o el ajuste de clasificadores.
- Chatbot sectorial embebido en aplicaciones de escritorio: al ser un adaptador ligero, el binario distribuible puede incluir el delta y descargar el base en la primera ejecucion, reduciendo el tamano del instalador.
- Prototipado rapido de productos conversacionales sin coste de API: sirve para validar prompts, plantillas de sistema y flujos de conversacion antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hay resultados de evaluacion para esta version y que las afirmaciones de rendimiento no estan respaldadas por mediciones. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- Adaptador aislado: ~162 MB en disco; el repositorio completo ocupa 0.8 GB.
- Requisito obligatorio: el modelo base `grok_demon_7b` (~15,2 GB en bf16 segun el autor) debe estar disponible; el adaptador no puede cargarse de forma autonoma.
- Inferencia en bf16 sin cuantizar: alrededor de 15-16 GB de VRAM solo para pesos, mas cache KV; viable en A100 40 GB, H100, L40S y, con contexto reducido, en RTX 4090 24 GB. Cifras estimadas a partir del tamano del modelo base, no medidas por el autor.
- Inferencia en 8 bits: del orden de 8-9 GB de VRAM; cabe en RTX 4090, RTX 4080 y A10G. Estimacion.
- Inferencia en 4 bits (NF4 o GGUF Q4_K_M): del orden de 5-6 GB; cabe en RTX 3060 12 GB, RTX 4070 y equipos Apple Silicon con 16 GB de memoria unificada. Estimacion.
- Opciones de despliegue: transformers + PEFT (ruta indicada por el autor), vLLM y TGI tras fusionar el adaptador, y llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus model cards publicas y no han sido verificados en la informacion proporcionada para esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| grok_demon_7b_v2.1 | 7B aprox. (base) + adaptador de ~162 MB | No disponible | Apache-2.0 | Adaptador safetensors; requiere modelo base |
| grok_demon_7b (v1) | 7B aprox. | No disponible | Apache-2.0 | Modelo completo fusionado, bf16, ~15,2 GB; marcado como deprecado por el autor |
| Qwen2.5-7B-Instruct | 7B aprox. | 32 768 tokens nativos | Apache-2.0 | Modelo completo en safetensors y GGUF; amplia disponibilidad de cuantizaciones |
| Mistral-7B-Instruct-v0.3 | 7B aprox. | 32 000 tokens aprox. | Apache-2.0 | Modelo completo en safetensors y GGUF |
| Llama-3.1-8B-Instruct | 8B aprox. | 128 000 tokens | Licencia comunitaria Llama 3.1 | Modelo completo en safetensors y GGUF; licencia con restricciones adicionales |

Diferencias clave: frente a los modelos completos de la comparativa, la v2.1 no es desplegable por si sola y su contexto no esta documentado, pero su delta de 162 MB abarata las actualizaciones incrementales. Frente a la v1, anade un segundo delta LoRA sin cambiar los pesos base. No hay datos publicos de rendimiento que permitan comparar calidad de salida con ninguna de las alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin `Maximiliano-Flores-Dev/grok_demon_7b` no se puede cargar; el propio autor advierte de la aparente contradiccion de que el modelo base sea a la vez la release v1 marcada como deprecada.
- Ausencia total de benchmarks publicados: cualquier afirmacion de rendimiento es una extrapolacion desde el modelo base y no una medicion de este adaptador.
- Modelo declarado sin filtros de seguridad: las salidas pueden ser ofensivas, inexactas o inadecuadas para produccion sin salvaguardas propias; el autor traslada toda la responsabilidad al usuario.
- Riesgo de alusionacion inherente a un modelo de 7B afinado por SFT, agravado por la ausencia de evaluacion.
- Tokenizacion inadecuada: el autor advierte de que tokenizar texto crudo en lugar de usar `apply_chat_template()` degrada notablemente las respuestas, ya que la persona del sistema vive en `chat_template.jinja`.
- Cobertura idiomatica limitada a espanol e ingles declarados; no hay informacion sobre el comportamiento en otras lenguas.
- Longitud de contexto no documentada para este adaptador, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- Validacion comunitaria nula: 0 descargas y 1 like en el momento de la consulta, sin issues ni discusiones que permitan contrastar comportamiento en produccion.
- Licencia Apache-2.0 en el adaptador y en el modelo base de la cadena, lo que en principio permite uso comercial; conviene verificar igualmente la licencia de todos los eslabones antes de un despliegue en producto.
- Los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo; no hay analisis de terceros, papers ni articulos tecnicos disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Maximiliano-Flores-Dev/grok_demon_7b_v2.1
- Modelo base (v1): https://huggingface.co/Maximiliano-Flores-Dev/grok_demon_7b
- Perfil del autor: https://huggingface.co/Maximiliano-Flores-Dev
- Unsloth (framework de entrenamiento citado): https://github.com/unslothai/unsloth
- Base original de la cadena: https://huggingface.co/unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo (unicamente contenidos no relacionados sobre Windows 11), por lo que no se han podido anadir papers, blogs ni demos adicionales.

# arn04/Qwen3.8-27B-pi-TQV12

## Resumen

Qwen3.8-27B-pi-TQV12 es una compilación en formato GGUF del modelo Qwen3.8-27B de Alibaba Qwen, adaptada mediante un LoRA entrenado con aprendizaje por refuerzo por Harness Hub para tareas de agente dentro del entorno Pi, y cuantizada con la técnica TQ (Tandem Quantization) por el usuario arn04. El paquete está pensado para ejecutarse localmente con el motor de inferencia Tandem (fork de tqllm), que añade decodificación especulativa mediante un drafter DFlash2 y un vocabulario de borrador específico. El resultado es un artefacto de 14,7 GB que integra pesos base, adaptador Pi y cuantización en un único fichero GGUF.

El modelo resuelve el problema de desplegar un LLM de 27.320.697.856 parámetros en hardware de consumo mediante cuantización agresiva y decodificación especulativa, manteniendo una ventana de contexto configurable de hasta 262.144 tokens. La integración con Tandem expone una API compatible con OpenAI, lo que facilita su uso como servidor local de chat completions. La relevancia actual radica en la combinación de adaptación por RL para agentes, cuantización TQ y speculative decoding en un solo paquete reproducible.

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada; todos los datos técnicos proceden de la model card, los tags de Hugging Face y los metadatos del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; sin detalle de transformer/MoE en la información proporcionada) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (configurado en el ejemplo de ejecución con `--context 262144`) |
| Tipos de cuantizacion | TQ (Tandem Quantization), variante TQV12 para pesos y `tq3` para KV cache |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `Qwen3.8-27B-pi-TQV12.gguf`, 14,7 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B (tipo de transformer, atención, posible mezcla de expertos). Lo que sí se documenta es la cadena de adaptación: sobre el modelo base Qwen/Qwen3.8-27B, Harness Hub entrenó un adaptador LoRA mediante aprendizaje por refuerzo orientado a tareas de agente dentro del entorno Pi (modelo `harness-hub/Qwen3.8-27B-pi-adapted`). Ese adaptador está fusionado en los pesos de esta compilación, de modo que el GGUF distribuido ya incorpora la adaptación Pi.

La cuantización emplea la técnica TQ de YTan2000 (referencia `YTan2000/Qwen3.8-27B-TQ`), que también aporta el drafter DFlash2 y el vocabulario de borrador (`atx_65536.txt`). El motor Tandem implementa decodificación especulativa: un modelo borrador pequeño propone tokens que el modelo principal verifica, con un beneficio especialmente marcado en cargas de trabajo que repiten texto del prompt (verificación de copia especular). No se especifican el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de RLHF/DPO más allá de la mención al entrenamiento con RL del adaptador.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y tareas de agente dentro del entorno Pi, gracias al adaptador entrenado con RL por Harness Hub.
- Decodificación especulativa con drafter DFlash2, con ganancia notable en cargas que repiten texto del prompt.
- Servidor compatible con la API de chat completions de OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes existentes.
- Ventana de contexto configurable hasta 262.144 tokens, con KV cache cuantizada en `tq3`.
- Caché de prompt (`--prompt-cache on`) para reutilizar prefijos entre peticiones.
- Soporte de ejecución multi-GPU mediante tensor parallelism (`TQLLM_TP`).
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Tool calling / function calling: no disponible (no se menciona explícitamente en la información proporcionada).
- Visión o audio: no disponible.

## Casos de uso

- Asistente de código local con contexto largo: con 262.144 tokens de ventana, el modelo puede cargar repositorios completos o historiales extensos de conversación y responder sin truncar, ejecutándose en dos GPUs de 16 GB gracias a la cuantización TQ.
- Agente autónomo en el entorno Pi: el adaptador entrenado con RL para tareas de agente permite encadenar pasos multi-turno con herramientas dentro de Pi, aprovechando el servidor compatible con OpenAI para conectar el orquestador.
- Servidor de chat completions autoalojado: al exponer una API compatible con OpenAI en `127.0.0.1:11435`, se puede sustituir un endpoint en la nube por este modelo local sin cambiar el código cliente.
- Procesamiento de documentos extensos: la ventana de 262.144 tokens y la caché de prompt permiten analizar contratos, informes o bases de código largas reutilizando el prefijo entre consultas sucesivas.
- Iteración sobre texto existente (refactorización, resumen, reescritura): la decodificación especulativa con verificación de copia ofrece su mayor ventaja cuando la salida repite fragmentos del prompt, lo que encaja con tareas de edición y transformación de texto.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local con pesos Apache 2.0, es apto para flujos donde los datos no pueden salir de la infraestructura propia.
- Prototipado e investigación en decodificación especulativa: el paquete incluye drafter y vocabulario separados, lo que facilita experimentar con distintas configuraciones de borrador y cuantización KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la release v0.1.12 de Tandem en GitHub para consultar las cargas de trabajo medidas y el hardware empleado, pero no se incluyen cifras en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 14,7 GB; con KV cache `tq3` y contexto 262.144 se necesita margen adicional. La configuración probada por el autor usa dos GPUs de 16 GB (RTX 5060 Ti), lo que sugiere un requisito agregado de al menos 32 GB de VRAM para contexto máximo.
- GPUs recomendadas: RTX 5060 Ti 16 GB en configuración dual (probada por el autor); el ejecutable de la release v0.1.12 es para Windows SM120. No se documentan otras GPUs compatibles.
- ¿Cabe en GPU de consumo? Sí, en dos RTX 5060 Ti de 16 GB según la configuración de referencia. Para contextos menores podría requerir menos VRAM, pero no se aportan cifras.
- Opciones de despliegue: motor Tandem (`tqserve.exe`, fork de tqllm) con soporte de drafter DFlash2 y vocabulario de borrador. No se menciona compatibilidad con llama.cpp, vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la release de Tandem incluye benchmarks de decodificación que no se detallan aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-TQV12 | 27,32 B | 262.144 | GGUF (TQ) | Apache 2.0 | Adaptador Pi fusionado, requiere motor Tandem |
| Qwen/Qwen3.8-27B | 27,32 B (según metadatos del base) | no disponible | safetensors | Apache 2.0 | Modelo base sin adaptación ni cuantización |
| harness-hub/Qwen3.8-27B-pi-adapted | no disponible | no disponible | no disponible | no disponible | Base con LoRA Pi entrenado con RL |
| YTan2000/Qwen3.8-27B-TQ | no disponible | no disponible | GGUF (TQ) | no disponible | Referencia de cuantización TQ y drafter DFlash2 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un motor específico: el modelo está empaquetado para Tandem (fork de tqllm) y no se documenta compatibilidad con otros runtimes como llama.cpp, vLLM u Ollama.
- Plataforma: el ejecutable de referencia es para Windows SM120; no se detallan builds para Linux u otras arquitecturas.
- Idiomas soportados no documentados, lo que impide garantizar calidad multilingüe.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base ni del adaptador.
- El adaptador Pi está entrenado para el entorno de agente Pi; su comportamiento fuera de ese contexto no está evaluado.
- La cuantización TQ agresiva (14,7 GB para 27,3 B parámetros) puede degradar la calidad respecto al modelo en precisión completa; no se aportan métricas de degradación.
- La decodificación especulativa rinde mejor en cargas que repiten texto del prompt; en generación de código nuevo la ventaja puede ser menor, según advierte la propia model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes derivados (adaptador Pi, cuantización TQ) antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arn04/Qwen3.8-27B-pi-TQV12
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador Pi: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Referencia de cuantización TQ y drafter: https://huggingface.co/YTan2000/Qwen3.8-27B-TQ
- Motor Tandem (fork): https://github.com/aseprahman04/tqllm-tandem
- Release v0.1.12 de Tandem: https://github.com/aseprahman04/tqllm-tandem/releases/tag/v0.1.12
- Repositorio original tqllm: https://github.com/turbo-tan/tqllm
- Perfil del autor: https://huggingface.co/arn04

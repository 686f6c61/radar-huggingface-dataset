# lennyhans/gpt-oss-20b-terminal_lego_deepseek_v3_2_8k-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF (cuantización Q4_K_M) del modelo `StephYang/gpt-oss-20b-terminal_lego_deepseek_v3_2_8k`, un fine-tuning de `gpt-oss-20b` de OpenAI realizado con el framework llama-factory en modalidad de fine-tuning completo. El modelo resultante está pensado para inferencia local eficiente con llama.cpp, Ollama u otras herramientas compatibles con GGUF.

El modelo base, gpt-oss-20b, es uno de los dos pesos abiertos publicados por OpenAI (junto con gpt-oss-120b) y está diseñado para razonamiento potente, tareas agénticas y casos de uso de desarrollo versátiles. Según los datos disponibles, alcanza 225 tokens por segundo en una RTX 4090 con contexto limitado a 8k, lo que lo convierte en una opción atractiva para entornos de laboratorio doméstico y despliegue en hardware de consumo.

La conversión fue realizada mediante el espacio GGUF-my-repo de ggml.ai, y el repositorio incluye instrucciones de uso tanto para la CLI como para el servidor de llama.cpp. El modelo tiene 20.914.757.184 parámetros totales y un tamaño de archivo de 15,8 GB en su versión Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en gpt-oss-20b de OpenAI (detalles especificos no disponibles) |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128k en el modelo base gpt-oss-20b; el nombre del fine-tune sugiere optimizacion para 8k |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (etiqueta `full` en los tags de HuggingFace) del modelo gpt-oss-20b de OpenAI, realizado con el framework llama-factory. El nombre del fine-tune, `terminal_lego_deepseek_v3_2_8k`, sugiere una adaptación orientada a dominios específicos (terminal, LEGO y DeepSeek v3.2) con una ventana de contexto de 8k tokens, aunque no se proporcionan detalles sobre la composición del dataset de entrenamiento ni el método de alineación utilizado (RLHF, DPO, etc.).

El modelo base gpt-oss-20b está descrito por OpenAI como un modelo open-weight de tamaño medio orientado a baja latencia, diseñado para razonamiento potente, tareas agénticas y casos de uso de desarrollo. Según los resultados de búsqueda, forma parte de la serie gpt-oss junto con gpt-oss-120b, y es el primer modelo de OpenAI publicado bajo licencia Apache 2.0.

La conversión a GGUF se realizó con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, lo que permite su uso con herramientas como llama-cli y llama-server. No se dispone de información sobre innovaciones técnicas específicas del fine-tune ni sobre la composición exacta de los datos de entrenamiento.

## Capacidades

- Razonamiento potente: el modelo base gpt-oss-20b está diseñado para tareas de razonamiento complejo y multi-paso.
- Tareas agénticas: soporte para casos de uso de agentes, según la documentacion oficial de OpenAI.
- Generación de texto: capacidades completas de generación de lenguaje natural del modelo base.
- Desarrollo de software: orientado a casos de uso de desarrollador, incluyendo generación y asistencia de código.
- Inferencia de baja latencia: optimizado para ejecución rápida en hardware de consumo.
- Ejecución local: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otras herramientas de inferencia local.
- Capacidades específicas del fine-tune (terminal, LEGO, DeepSeek v3.2): no documentadas en la información disponible.

## Casos de uso

- Asistente de código en local: el modelo puede ejecutarse en una GPU de consumo con 16 GB de VRAM (con contexto limitado a 8k) para proporcionar asistencia de programación sin conexión a internet, manteniendo la privacidad del código fuente.
- Agente de terminal automatizado: el nombre del fine-tune sugiere adaptación a tareas de terminal, lo que lo hace adecuado para automatizar comandos, scripting y operaciones de sistema en entornos de desarrollo.
- Despliegue en laboratorio doméstico: con 225 tok/s en RTX 4090 a 8k de contexto, es viable para proyectos de IA local en entornos de home lab, como asistentes personales o chatbots autocontenidos.
- Prototipado rápido de aplicaciones de IA: su formato GGUF permite integración sencilla con llama.cpp para validar conceptos antes de escalar a modelos mayores.
- Razonamiento multi-paso en entornos sin GPU dedicada: la cuantización Q4_K_M reduce los requisitos de memoria, permitiendo ejecución en CPUs modernas o GPUs de gama media.
- Fine-tuning adicional por dominio: al ser un modelo abierto, puede servir como punto de partida para adaptaciones posteriores con llama-factory u otras herramientas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card muestra una lista de resultados vacía para `terminal_lego_deepseek_v3_2_8k`.

Datos de rendimiento del modelo base gpt-oss-20b extraídos de la busqueda web:

| Metrica | Valor |
|---|---|
| Throughput en RTX 4090 (contexto 8k) | 225 tok/s |
| Throughput en RTX 4090 (contexto 128k) | ~9 tok/s |
| Requisito minimo de VRAM | 16 GB (con contexto bajo 8k) |

## Requisitos de hardware

- VRAM estimada para inferencia: 16 GB con contexto inferior a 8k tokens; el modelo en Q4_K_M ocupa aproximadamente 15,8 GB en disco.
- GPU recomendadas: RTX 4090 (225 tok/s a 8k de contexto), GPUs NVIDIA con 16 GB o más de VRAM. El modelo gpt-oss-120b, en cambio, requiere una H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de 16 GB siempre que el contexto se mantenga por debajo de 8k tokens. A 128k de contexto, el rendimiento cae a ~9 tok/s independientemente de la GPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, y cualquier herramienta compatible con GGUF. También es posible cargarlo en transformers si se convierte de vuelta a safetensors.
- Latencia y throughput: 225 tok/s en RTX 4090 con contexto de 8k; ~9 tok/s con contexto de 128k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lennyhans/gpt-oss-20b-terminal_lego_deepseek_v3_2_8k-Q4_K_M-GGUF | 20,9 B | 128k (base); 8k (fine-tune) | other | GGUF | Fine-tune de gpt-oss-20b con cuantizacion Q4_K_M |
| openai/gpt-oss-20b | 20,9 B | 128k | Apache 2.0 | safetensors | Modelo base original de OpenAI |
| openai/gpt-oss-120b | ~120 B | 128k | Apache 2.0 | safetensors | Version mayor de la serie; requiere H100 |

El modelo de este repositorio se diferencia del gpt-oss-20b original por ser un fine-tune con adaptación a dominios específicos (terminal, LEGO, DeepSeek v3.2) y por su formato GGUF, que facilita el despliegue local. La licencia cambia de Apache 2.0 a "other", lo que requiere verificación de los términos aplicables antes de uso comercial.

## Limitaciones y advertencias

- Licencia "other": a diferencia del gpt-oss-20b original (Apache 2.0), este modelo fine-tuneado tiene una licencia no especificada. Es imprescindible verificar los términos de uso antes de cualquier despliegue en producción o uso comercial.
- Rendimiento degradado a contexto largo: a 128k de contexto, el throughput cae a ~9 tok/s, lo que limita su uso en tareas que requieran ventanas de contexto extensas.
- Sin benchmarks publicados: no hay resultados de evaluación disponibles para este fine-tune, por lo que su rendimiento real en tareas específicas es desconocido.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que puede limitar su uso en aplicaciones multilingües.
- Modelo reciente sin adopción: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Fine-tune no documentado: no hay información sobre el dataset de entrenamiento, el método de alineación ni las técnicas de optimización utilizadas en el fine-tune.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lennyhans/gpt-oss-20b-terminal_lego_deepseek_v3_2_8k-Q4_K_M-GGUF
- Modelo base (fine-tune): https://huggingface.co/StephYang/gpt-oss-20b-terminal_lego_deepseek_v3_2_8k
- Modelo original gpt-oss-20b: https://huggingface.co/openai/gpt-oss-20b
- Repositorio GitHub de OpenAI gpt-oss: https://github.com/openai/gpt-oss
- Documentación de la API de OpenAI para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Guía de hardware para gpt-oss-20b: https://runaihome.com/blog/gpt-oss-20b-local-ai-hardware-guide-2026/

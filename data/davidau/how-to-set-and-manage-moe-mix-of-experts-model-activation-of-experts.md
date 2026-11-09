# DavidAU/How-To-Set-and-Manage-MOE-Mix-of-Experts-Model-Activation-of-Experts

## Resumen

How-To-Set-and-Manage-MOE-Mix-of-Experts-Model-Activation-of-Experts es un repositorio de Hugging Face publicado por DavidAU (conocido en la comunidad por sus merges y cuantizaciones de modelos abiertos) que funciona principalmente como documentación técnica: explica cómo configurar y modificar el número de expertos activos en modelos con arquitectura Mixture of Experts (MoE) en distintas aplicaciones de inferencia local. No es un modelo entrenado desde cero, sino un artefacto de tipo guía que acompaña a la colección de modelos MoE del mismo autor.

El documento cubre la configuración del parámetro de expertos activos en herramientas como LM Studio, Text Generation WebUI, KoboldCPP (versión 1.8 o superior) y llama.cpp server mediante la clave `--override-kv llama.expert_used_count=int:N`, así como el campo `num_experts_used` en payloads de API. También enlaza a colecciones de modelos MoE con capacidades de razonamiento (estilo DeepSeek) en formato GGUF, a los ficheros fuente para generar cuantizaciones (GGUF, EXL2, AWQ, GPTQ, HQQ) y a adaptadores LoRA que convierten modelos convencionales en modelos con modo "thinking".

La relevancia del recurso es práctica: en modelos MoE como Mixtral o las variantes 2X8 y 4X8, el número de expertos activos por token condiciona directamente la calidad de generación, el consumo de VRAM y la latencia. Disponer de una guía unificada para ajustar ese parámetro en los principales runners locales resulta útil para desarrolladores que despliegan modelos MoE en hardware de consumo. La licencia declarada es Apache 2.0 y el idioma indicado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts); el repositorio documenta modelos basados en Mixtral, Llama 3 / 3.1, Mistral, Qwen 2.5 y variantes DeepSeek, sin una arquitectura única propia |
| Parametros totales | no disponible (depende del modelo MoE concreto referenciado; el repositorio no define un modelo único) |
| Parametros activos | configurable: 1, 2, 3, 4, 8 o más expertos por token según el ajuste del runner |
| Longitud de contexto | no disponible como valor único; las etiquetas mencionan contexto de 128k en los modelos referenciados |
| Tipos de cuantizacion | GGUF, EXL2, AWQ, GPTQ, HQQ (referenciados en las colecciones enlazadas); pesos en bfloat16, float16 y float32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelos fuente), GGUF, EXL2, AWQ, GPTQ, HQQ (derivados) |

## Arquitectura y entrenamiento

El repositorio no describe el entrenamiento de un modelo concreto ni aporta datos sobre tokens de entrenamiento, composición del dataset o fases de RLHF/DPO. Su contenido es documental: explica el funcionamiento de la activación de expertos en arquitecturas MoE, donde un modelo "capitán" (el primero listado) y varios modelos miembro contribuyen conjuntamente a la selección de cada token, de forma análoga a varios chefs compitiendo por elaborar el mejor plato. Según el autor, esta competición entre expertos produce en muchos casos mayor calidad de generación y mejor seguimiento de instrucciones, ya que la capacidad de cada modelo miembro queda disponible durante la instrucción y la generación.

La aportación técnica principal es la guía de configuración multiplataforma del parámetro de expertos activos: pantalla de carga en LM Studio, pantalla de carga en Text Generation WebUI, menú "TOKENS" en KoboldCPP 1.8+, la clave `--override-kv llama.expert_used_count=int:N` en llama.cpp server y el campo `num_experts_used` en peticiones de API. El autor advierte de que fijar un solo experto provoca que el modelo seleccione uno al azar en cada ejecución, con generaciones muy distintas entre prompts o regeneraciones. No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Configuración del número de expertos activos (1, 2, 3, 4, 8 o más) en LM Studio, Text Generation WebUI, KoboldCPP 1.8+ y llama.cpp server.
- Ajuste del parámetro vía API mediante `num_experts_used` en el payload JSON, con variaciones según el backend.
- Documentación de modelos MoE con modo de razonamiento y "thinking" (estilo DeepSeek) en formato GGUF.
- Enlaces a ficheros fuente para generar cuantizaciones GGUF, EXL2, AWQ, GPTQ y HQQ, además de uso directo.
- Referencia a adaptadores LoRA que convierten modelos convencionales en modelos con razonamiento.
- Cobertura de casos de uso de rol y narrativa (etiquetas role play, SillyTavern) en los modelos de la colección.
- No se documentan en la información disponible capacidades de visión, audio, tool calling ni agentes multi-paso para este repositorio.

## Casos de uso

- Despliegue local de modelos MoE en LM Studio: el usuario ajusta el número de expertos en la pantalla de carga para equilibrar calidad y VRAM antes de iniciar la inferencia.
- Servidor de inferencia con llama.cpp: arrancar `llama-server` con `--override-kv llama.expert_used_count=int:3` permite fijar tres expertos activos por token de forma reproducible en producción.
- Ajuste fino de calidad en KoboldCPP: en la versión 1.8 o superior, el menú "TOKENS" de la pantalla de carga permite experimentar con distintos recuentos de expertos para tareas de escritura creativa y rol.
- Integración vía API: aplicaciones cliente que envían `num_experts_used` en el JSON pueden adaptar dinámicamente el coste computacional por petición según la carga del servidor.
- Evaluación comparativa de modelos MoE: las colecciones enlazadas incluyen ejemplos de generación con 2, 4 y 8 expertos, útiles para medir el efecto del parámetro en la salida antes de fijar una configuración.
- Conversión y cuantización de modelos MoE: los ficheros fuente enlazados permiten generar versiones GGUF, EXL2, AWQ, GPTQ o HQQ adaptadas al hardware disponible.
- Conversión de modelos estándar en modelos de razonamiento: los adaptadores LoRA referenciados permiten añadir modo "thinking" a modelos que no lo incorporan de serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra única; depende del modelo MoE concreto y del número de expertos activos, que es precisamente el parámetro que el repositorio enseña a ajustar.
- GPU recomendadas: no disponible en la información proporcionada.
- Ejecución en GPU de consumo: posible con los modelos de la colección en formato GGUF cuantizado mediante llama.cpp, que según el autor permite ejecutar modelos en GPU, CPU y casi cualquier dispositivo.
- Opciones de despliegue documentadas: LM Studio, Text Generation WebUI, KoboldCPP 1.8+, llama.cpp server (`llama-server`) y acceso vía API.
- Latencia y throughput: no disponibles; el autor indica que aumentar el número de expertos incrementa la calidad de generación, lo que implícitamente eleva el coste computacional, pero no aporta cifras.

## Comparativa con modelos similares

| Aspecto | Este repositorio | Mixtral (referenciado) | Variantes 2X8 / 4X8 de DavidAU | Modelos DeepSeek reasoning (referenciados) |
|---|---|---|---|---|
| Tipo | Documentación y guía de configuración MoE | Modelo MoE | Merges MoE | Modelos con modo thinking |
| Parámetros | no disponible | no disponible en la información | no disponible en la información | no disponible en la información |
| Contexto | no disponible (etiqueta 128k en modelos referenciados) | no disponible | no disponible | no disponible |
| Licencia | Apache 2.0 | no disponible | no disponible | no disponible |
| Disponibilidad | Hugging Face, 0 descargas, 23 likes | Referenciado en la guía | Colección del autor | Colección del autor |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es fundamentalmente documentación, no un modelo listo para inferencia directa; requiere acompañarse de un modelo MoE concreto de las colecciones enlazadas.
- Fijar un único experto provoca selección aleatoria por ejecución, con salidas muy distintas entre prompts y regeneraciones, según advierte el propio autor.
- El campo de API `num_experts_used` puede variar entre backends, lo que complica la portabilidad de configuraciones.
- Idioma declarado únicamente inglés; no se garantiza calidad multilingüe.
- No hay datos publicados de benchmarks, sesgos, tasas de alucinación ni evaluación de seguridad.
- Aunque la licencia es Apache 2.0, los modelos referenciados en las colecciones pueden tener licencias propias que deben verificarse por separado antes de uso comercial.
- Las cifras de VRAM, latencia y throughput no están documentadas; el ajuste del número de expertos exige prueba y error en cada hardware.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DavidAU/How-To-Set-and-Manage-MOE-Mix-of-Experts-Model-Activation-of-Experts
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelos en tendencia del autor: https://huggingface.co/models?sort=trending&search=DavidAU
- FAQs: https://huggingface.co/DavidAU/support
- Soporte: https://huggingface.co/DavidAU/support
- Colección de modelos MoE (incluye razonamiento) en GGUF: https://huggingface.co/collections/DavidAU/d-au-moe-mixture-of-experts-models-see-also-source-coll-67579e54e1a2dd778050b928
- Colección de ficheros fuente para GGUF, EXL2, AWQ, GPTQ, HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Colección de modelos de razonamiento (GGUF): https://huggingface.co/collections/DavidAU/d-au-reasoning-deepseek-models-with-thinking-reasoning-67a41ec81d9df996fd1cdd60
- Colección de ficheros fuente de razonamiento: https://huggingface.co/collections/DavidAU/d-au-reasoning-source-files-for-gguf-exl2-awq-gptq-67b296c5f09f3b49a6aa2704
- Colección de adaptadores LoRA para razonamiento: https://huggingface.co/collections/DavidAU/d-au-reasoning-adapters-loras-any-model-to-reasoning-67bdb1a7156a97f6ec42ce36
- LM Studio: https://lmstudio.ai
- Text Generation WebUI: https://github.com/oobabooga/text-generation-webui
- KoboldCPP: https://github.com/LostRuins/koboldcpp
- llama.cpp server: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- llama.cpp: https://github.com/ggml-org/llama.cpp

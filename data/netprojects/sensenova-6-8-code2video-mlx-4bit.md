# netprojects/SenseNova-6.8-Code2Video-MLX-4bit

## Resumen

SenseNova 6.8 Code2Video es un modelo de lenguaje y visión de 27.356.728.560 parámetros (aproximadamente 27B) desarrollado por SenseTime (SenseNova), afinado a partir de Qwen3.8-27B. Su especialidad es la creación de vídeo programática: el modelo planifica una pieza audiovisual, escribe las escenas como código, las renderiza con las herramientas de la skill `code-video` de SenseNova, examina los fotogramas resultantes y revisa el trabajo de forma iterativa en múltiples turnos. Está diseñado como un agente autónomo para motion design, tipografía cinética, explicadores y visualizaciones de datos generadas enteramente mediante código.

La ficha que nos ocupa no es el modelo original, sino una conversión a MLX realizada por NetProjects (Internet Projects Ltd), pensada para ejecutarse en Apple Silicon. Esta build concreta cuantiza el modelo de lenguaje a 4 bits (afín, grupo de 64) y mantiene la torre de visión en bf16, resultando en un repositorio de 16,1 GB. Es la opción más pequeña de la familia de builds MLX publicada por el mismo autor, y la propia model card advierte que, aunque se mantiene coherente, se desvía más del bf16 en turnos de agente largos que las variantes de 6 y 8 bits.

La relevancia de esta conversión radica en que permite ejecutar localmente en un Mac un modelo agéntico de 27B con capacidades de visión y tool calling, algo que hasta hace poco requería hardware de datacenter. La licencia Apache-2.0, heredada del modelo original y de Qwen3.8-27B, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.8-27B; no se detalla en la informacion disponible si emplea MoE |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | Contexto largo soportado con YaRN rope scaling (factor 2); verificado en 65.586 tokens sobre la build de 8 bits |
| Tipos de cuantizacion | 4 bits afin, grupo de 64 (modelo de lenguaje); torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original es un transformer multimodal de aproximadamente 27B parámetros afinado desde Qwen3.8-27B, con una torre de visión que procesa imágenes (fotogramas renderizados) junto con texto. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO; tampoco especifica si la arquitectura subyacente es densa o MoE. Lo que sí se documenta es el propósito del afinado: convertir el modelo base en un agente capaz de planificar, escribir código de escenas, renderizar y revisar de forma iterativa usando las herramientas de la skill `code-video`.

La conversión MLX conserva el YaRN rope scaling (factor 2) del config original, lo que permite contextos largos equivalentes al modelo de referencia. El checkpoint upstream no incluye cabeza de predicción multi-token (MTP), por lo que estas builds tampoco la tienen. La cuantización aplicada es afín de 4 bits con grupo de 64 sobre el modelo de lenguaje, manteniendo la torre de visión en bf16. Según las pruebas del autor, esta build reproduce el siguiente token del bf16 en el 91,7% de los tokens evaluados en turnos de agente reales y en el 97,3% de las posiciones en 12 prompts fijos, con una NLL media de +0,032 respecto al bf16.

## Capacidades

- Generación de texto y razonamiento multi-turno orientado a tareas de agente.
- Generación de código para escenas de vídeo (motion design, tipografía cinética, explicadores, visualizaciones de datos).
- Comprensión de imágenes: describe fotogramas renderizados y sugiere cambios de layout.
- Tool calling / function calling: emite bloques `<tool_call>` de Qwen3; el servidor MLX los devuelve como llamadas OpenAI parseadas.
- Razonamiento agéntico multi-paso: planifica, escribe, renderiza, inspecciona y revisa en ciclos sucesivos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Procesamiento de audio: no disponible.

## Casos de uso

- Motion design programático: el modelo planifica una pieza breve, escribe el código de las escenas, las renderiza con la skill `code-video` y revisa los fotogramas para iterar sobre timing, colores y composición.
- Tipografía cinética para intros: genera una secuencia de 10 segundos con escenas, timing y paleta a partir de un prompt textual, como el ejemplo de la model card para la palabra ORBIT.
- Explicadores técnicos: produce vídeos breves que ilustran conceptos mediante animaciones generadas por código, revisando cada render antes de publicar.
- Historias de datos (data stories): transforma datasets en visualizaciones animadas escritas como código, con control preciso sobre ejes, etiquetas y transiciones.
- Revisión automatizada de fotogramas: dado un frame renderizado, el modelo analiza el layout y propone cambios concretos, útil como paso de control de calidad en un pipeline de producción.
- Agente local en Apple Silicon: desplegado con `mlx_vlm.server`, expone una API compatible con OpenAI con tool calls para integrarse en un harness agéntico que orqueste la creación de vídeo.
- Prototipado rápido en un Mac: permite a diseñadores y desarrolladores iterar sobre piezas audiovisuales sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad de la cuantización respecto al bf16, medidas sobre turnos de agente reales y prompts fijos:

| Build | Tamano | Mismo siguiente token que bf16 (turnos de agente) | NLL vs bf16 (turnos de agente) | Mismo token en 12 prompts fijos |
|---|---|---|---|---|
| 8 bits | 29,5 GB | 98,3% | −0,001 | 99,1% |
| 6 bits | 22,8 GB | 96,8% | ±0,000 | 98,7% |
| 4 bits | 16,1 GB | 91,7% | +0,032 | 97,3% |
| bf16 | 54,7 GB | referencia | referencia | referencia |

Las pruebas se realizaron en un MacBook Pro M5 Max (128 GB) con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11, sobre 20 turnos de asistente de las trayectorias de producción de SenseNova (10.406 tokens evaluados) y sobre 878 posiciones en 12 prompts fijos.

## Requisitos de hardware

- VRAM/unified memory estimada: 16,1 GB de pesos en 4 bits, más overhead de contexto y activaciones; se recomienda al menos 24-32 GB de memoria unificada para contextos moderados.
- Hardware objetivo: Apple Silicon con MLX; probado en MacBook Pro M5 Max de 128 GB.
- Cabe en GPU consumer de Apple con suficiente memoria unificada; no está pensado para GPUs NVIDIA (formato MLX).
- Despliegue: `mlx-vlm>=0.7.11` mediante `mlx_vlm.generate` o `mlx_vlm.server` (API compatible con OpenAI).
- Latencia y throughput: no disponibles en la información proporcionada.
- Para trabajo agéntico serio, el autor recomienda las builds de 6 u 8 bits por su mayor fidelidad al bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| netprojects/SenseNova-6.8-Code2Video-MLX-4bit | 27,36B | Largo (YaRN factor 2; verificado 65.586 tokens en 8 bits) | Apache-2.0 | safetensors MLX 4 bits | Build mas pequena; 91,7% de paridad de token con bf16 |
| netprojects/SenseNova-6.8-Code2Video-MLX-6bit | 27,36B | idem | Apache-2.0 | safetensors MLX 6 bits | Recomendada por el autor para agente; 96,8% de paridad |
| netprojects/SenseNova-6.8-Code2Video-MLX-8bit | 27,36B | idem | Apache-2.0 | safetensors MLX 8 bits | Mayor fidelidad; 98,3% de paridad |
| sensenova/SenseNova-6.8-Code2Video (original) | 27,36B | idem | Apache-2.0 | safetensors | Modelo de referencia en bf16 |

No se dispone de información sobre modelos de otros autores directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La build de 4 bits se desvía más del bf16 en turnos de agente largos (91,7% de paridad de token, NLL +0,032); el autor recomienda 6 u 8 bits para trabajo agéntico.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas al respecto.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- El código generado debe ejecutarse en un sandbox controlado y los renders revisarse antes de publicar, según indica la propia model card.
- Requiere la skill `code-video`, las guías y los prompts del repositorio de SenseNova para funcionar según lo previsto.
- No incluye cabeza MTP (el checkpoint upstream tampoco la tiene).
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso `NOTICE` que acredita a SenseTime SenseNova y Alibaba Cloud.
- Esta build no está afiliada a SenseTime ni a Alibaba Cloud; es una conversión de terceros.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-4bit
- Modelo original: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Build de 6 bits: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/SenseNova-6.8-Code2Video-MLX-bf16
- Repositorio GitHub con skill, guías y prompts: https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Otros modelos MLX del autor: https://huggingface.co/netprojects
- SenseNova-Loop-9B-Preview MLX: https://huggingface.co/netprojects/SenseNova-Loop-9B-Preview-MLX-6bit
- Sitio del autor: https://netprojects.com

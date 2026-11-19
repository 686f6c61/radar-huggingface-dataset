# loom-draft/weareapexcreators-Qwen3.5-4B-MTP-LocalAI-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato `.loom` para el checkpoint GGUF cuantizado Q4_K_M de `weareapexcreators/Qwen3.5-4B-MTP-LocalAI`. Lo publica el usuario `loom-draft` y está generado con `loom-next`, una herramienta que produce programas y una tarjeta `model.json` a partir de un GGUF sin modificar, sin intervención de un LLM en el proceso. El objetivo es ejecutar el modelo sobre GPUs AMD concretas: el APU Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), a través del runtime `loom-serve` del ecosistema Loom (repositorio `ROCm/hrx-system`).

El modelo base es un Qwen3.5 de 4B parámetros con capacidades multimodales (pipeline `image-text-to-text`) y decodificación especulativa MTP (multi-token prediction) de profundidad 3 activada por defecto. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento opcional y una ventana de contexto de 262.144 tokens por petición con hasta 4 peticiones concurrentes y un máximo de 4.096 tokens de salida por preset.

La relevancia es acotada y muy específica: no compite en calidad con modelos frontera, sino que resuelve el problema de servir un modelo multimodal pequeño y cuantizado en hardware AMD consumer/prosumer con un stack propio (kernels generados, decodificación especulativa, gestión de memoria fija). Para quien trabaje con Strix Halo o R9700 y quiera una alternativa a llama.cpp con API OpenAI, es un artefacto directamente utilizable; para el resto, es un paquete de nicho con métricas aún no publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con decodificación especulativa MTP; detalles internos no disponibles |
| Parámetros totales | 4B (según nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF); proyector visual en BF16 (`mmproj-BF16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado en formato `.loom` (programas + `model.json`) |

## Arquitectura y entrenamiento

El paquete no aporta información sobre el entrenamiento del modelo base: no se detallan número de tokens, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación. Lo que sí se documenta es la capa de despliegue. `loom-next` genera kernels y programas `.loom` a partir del GGUF original sin modificarlo, y `loom-serve` los ejecuta sobre AMDGPU mediante un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parámetros en host (`--parameter_mode=preload`). La decodificación especulativa usa MTP con profundidad 3 y está activada por defecto; la tarjeta afirma que su salida es idéntica a la de la decodificación especulativa desactivada, aunque la puerta de verificación correspondiente (`spec`) figura como «not yet re-measured».

El checkpoint incorpora un proyector multimodal separado (`mmproj-BF16.gguf`) para entrada de imágenes, y el modo de razonamiento («thinking») está activo por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`. No se especifica la arquitectura interna del transformer (número de capas, atención, etc.) ni innovaciones de entrenamiento.

## Capacidades

- Generación de texto y razonamiento con modo «thinking» activable o desactivable por petición.
- Entrada de imágenes vía partes `image_url` en formato OpenAI, con proyector BF16 dedicado.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con bucle multi-turno de agentes validado por la puerta `agent`.
- Decodificación especulativa MTP de profundidad 3 activada por defecto.
- API compatible con OpenAI en `/v1/chat/completions`.
- Contexto largo de hasta 262.144 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Audio de entrada/salida: no determinado según la propia tarjeta.
- Muestreo (temperatura, top_k, semilla): no determinado en la tabla de características, aunque existe una puerta de verificación `sampling` sin resultados registrados.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y expone una API OpenAI, de modo que cualquier cliente compatible (SDK de OpenAI, LangChain, etc.) puede apuntar a `http://127.0.0.1:8080/v1` sin cambios de código.
- Procesamiento de documentos largos con contexto de 262.144 tokens: resumen y extracción sobre contratos, informes o transcripciones que superan ampliamente la ventana de modelos de 4B convencionales, siempre que quepan en el pool de memoria configurado.
- Análisis de imágenes en local: clasificación, descripción o extracción de datos de capturas, diagramas o fotogramas usando el proyector `mmproj-BF16.gguf`, útil cuando no se quiere enviar imágenes a una API externa.
- Agentes con herramientas en bucle multi-turno: integración con funciones locales (consulta a bases de datos, ejecución de scripts) mediante `tools`/`tool_calls`, con la puerta `agent` del benchmark como referencia de corrección frente a llama.cpp.
- Prototipado de pipelines multimodales en hardware consumer/prosumer: al caber en una R9700 de 32 GB o en la memoria unificada de Strix Halo, permite iterar sobre casos de visión-lenguaje sin alquilar GPUs de datacenter.
- Servicio de inferencia de baja concurrencia para equipos pequeños: con 4 peticiones concurrentes y 4.096 tokens de salida por preset, encaja en herramientas internas (chat de soporte, generación de borradores) donde el throughput no es crítico.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir `loom-serve` frente a llama.cpp sobre el mismo GGUF y el mismo hardware, usando las puertas `golden`, `compare` y `vision`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta incluye secciones de rendimiento frente a llama.cpp para Strix Halo y R9700, pero ambas indican que «the results for this package are not yet re-measured». Todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» en ambas GPUs, por lo que no hay evidencia registrada de latencia, throughput ni equivalencia numérica con la referencia.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de 4B más un proyector BF16 debería situarse en el rango de pocos GB, pero la tarjeta no publica cifras y el pool de memoria se reserva de forma fija según el preset.
- GPU consumer: no se documenta compatibilidad con GPUs NVIDIA ni con Radeon de gama consumer distintas de las citadas; el stack es específico de AMDGPU vía `loom-serve`.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de ejecución de este paquete (llama.cpp aparece solo como referencia de corrección).
- Ajustes relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU), `--pool_backing=fixed` (pool comprometido por adelantado) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; las mediciones del paquete aún no se han repetido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Este paquete (Qwen3.5-4B-MTP-LocalAI, Q4_K_M) | 4B | 262.144 | Sí (imagen) | Apache 2.0 | GGUF empaquetado en `.loom`, `loom-serve` sobre AMD |
| Checkpoint base `weareapexcreators/Qwen3.5-4B-MTP-LocalAI` | 4B | no disponible en esta ficha | Sí (imagen) | Apache 2.0 | GGUF, ejecutable con llama.cpp y otros runtimes GGUF |
| Qwen3.5-4B estándar (sin MTP) | 4B | no disponible | no disponible | no disponible | GGUF / safetensors según distribución |

La comparación relevante es frente al propio checkpoint base: este paquete no altera los pesos, solo añade kernels y configuración para AMD. Frente a otros modelos de 4B de la familia Qwen no se dispone de datos de rendimiento en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sin métricas publicadas: todas las puertas de corrección y las comparativas de rendimiento frente a llama.cpp están pendientes de remedición, así que no hay evidencia registrada de que la salida coincida con la referencia ni de su velocidad.
- Alcance de hardware muy restringido: solo se documentan Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201). No hay soporte declarado para NVIDIA, otras Radeon ni CPU.
- Idiomas no declarados: la tarjeta no especifica cobertura lingüística, lo que impide garantizar calidad fuera del inglés sin evaluación propia.
- Riesgo de alucinación: inherente a un modelo de 4B; el modo «thinking» activo por defecto puede aumentar la latencia y el consumo de tokens de salida si no se desactiva.
- Límite de salida: 4.096 tokens por preset, insuficiente para generaciones largas sin ajustar la configuración.
- Concurrencia baja: 4 peticiones simultáneas, no apto para cargas de producción con tráfico alto.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-19), sin historial de mantenimiento.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en GPU, lo que afecta al rendimiento global del sistema anfitrión.
- Licencia Apache 2.0 en el paquete, pero conviene verificar la licencia y condiciones del checkpoint base y de los datos de entrenamiento originales antes de un uso comercial.
- La información sobre audio y muestreo figura como «not determined» en la propia tarjeta.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/weareapexcreators-Qwen3.5-4B-MTP-LocalAI-loom
- Modelo base: https://huggingface.co/weareapexcreators/Qwen3.5-4B-MTP-LocalAI
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

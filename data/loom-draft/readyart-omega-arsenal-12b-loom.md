# loom-draft/ReadyArt-Omega-Arsenal-12B-loom

## Resumen

ReadyArt-Omega-Arsenal-12B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `ReadyArt/Omega-Arsenal-12B-GGUF`, en su variante Q4_K_M. No se trata de un modelo nuevo: es un artefacto de empaquetado generado con la herramienta `loom-next` (el generador, sin LLM en el bucle) que permite ejecutar ese GGUF sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El autor del paquete es `loom-draft` y el modelo base pertenece a `ReadyArt`.

El objetivo es ofrecer una vía de inferencia nativa para hardware AMD dentro del ecosistema Loom (instalable vía `hrx-loom[hf]==0.2.0`), con un servidor compatible con la API de chat de OpenAI, soporte de tool calling y un modo de razonamiento opcional. Según la model card, el modelo base maneja entradas de imagen y audio, pero Loom no las soporta en esta versión. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos no están alojados aquí sino referenciados desde el GGUF de origen.

La relevancia es acotada: sirve a quienes ya operan GPUs AMD (Strix Halo o R9700) y quieren servir el modelo con Loom en lugar de llama.cpp. La información pública disponible es escasa: no hay benchmarks medidos para este paquete, no se detallan parámetros totales, arquitectura ni composición del entrenamiento, y las pruebas de corrección aparecen como "not yet re-measured" en todas las puertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 12B, detalles no publicados) |
| Parametros totales | 12B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 160.768 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programas `.loom` y `weights.loom` |
| Tokens maximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | OpenAI-style `/v1/chat/completions` |
| Tool calling | soportado (formato OpenAI `tools` / `tool_calls`) |
| Modo razonamiento | soportado, desactivado por defecto (`chat_template_kwargs: {"enable_thinking": true}`) |
| Decodificacion especulativa | no aplicable en Loom |
| Entrada de imagen | no soportada por Loom (el modelo base sí la tiene) |
| Entrada/salida de audio | no soportada por Loom (el modelo base sí la tiene) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Version de runtime | `hrx-loom[hf]==0.2.0` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `ReadyArt/Omega-Arsenal-12B-GGUF`: la model card del paquete Loom no describe si es un transformer denso, MoE o híbrido, ni detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. El nombre indica 12B de parámetros, pero no se confirma el recuento exacto ni los parámetros activos.

La innovación técnica de este artefacto no está en el modelo sino en el empaquetado: `loom-next` genera kernels y programas `.loom` a partir del GGUF sin modificarlo, y `loom-serve` los ejecuta sobre AMD con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU), `pool_backing=fixed` (reserva fija del pool de memoria) y `parameter_mode=preload` (carga anticipada de pesos en host). El paquete incluye `model.json` y `model.json.lock` con los ficheros de origen fijados y verificados por sha256 en `loom-fetch`.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento opcional ("thinking") activable por petición con `enable_thinking: true`; desactivado por defecto.
- Tool calling en formato OpenAI: acepta `tools` y devuelve `tool_calls`, apto para bucles de agente multi-turno.
- Ventana de contexto de 160.768 tokens por petición, adecuada para documentos largos.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Multilingüismo: no disponible; la model card no declara idiomas.
- Visión y audio: el modelo base los soporta según la card, pero Loom no los implementa en esta versión.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de características.

## Casos de uso

- Asistente conversacional autoalojado en estaciones AMD: desplegable con `loom-serve` sobre Strix Halo o R9700, ofrece un endpoint OpenAI-compatible para integrarse en aplicaciones existentes sin cambiar el cliente.
- Procesamiento de documentos largos: con 160.768 tokens de contexto por petición, permite resumir o consultar contratos, informes o bases de código extensas en una sola pasada.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y los bucles multi-turno (puerta `agent` de loom-benchmark) lo hacen apto para automatizaciones que consultan APIs internas o bases de datos.
- Razonamiento asistido bajo demanda: activando `enable_thinking` solo en peticiones que lo requieran (por ejemplo, problemas de planificación), se evita el coste del modo razonamiento en el resto del tráfico.
- Desarrollo y pruebas de pipelines LLM en hardware AMD: sirve como banco de pruebas para validar prompts, plantillas de chat y flujos de tool calling antes de mover cargas a producción.
- Servicio interno de baja concurrencia: con 4 peticiones concurrentes y 4.096 tokens de salida, encaja en equipos pequeños o entornos de laboratorio donde no se justifica un clúster de GPU.
- Evaluación comparativa frente a llama.cpp: las puertas de corrección (`golden`, `compare`, `agent`, `logits`) permiten verificar equivalencia de salidas una vez se registren las mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured". No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de 12B suele requerir en torno a 7-8 GB para pesos, más overhead de contexto y pool de memoria, pero la card no publica cifras.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs consumer; el paquete está generado específicamente para los dos destinos AMD citados.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` con el preset `chat` (Strix Halo) o `chat-r9700` (R9700) y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Alternativas de despliegue (llama.cpp, vLLM, Ollama, TGI): no documentadas para este paquete; el GGUF de origen es reutilizable en runtimes GGUF estándar, pero la card no lo detalla.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| ReadyArt-Omega-Arsenal-12B-loom | 12B | 160.768 | Apache 2.0 | GGUF Q4_K_M empaquetado en Loom; solo AMD Strix Halo y R9700 | Sin benchmarks medidos; tool calling y thinking opcional |
| ReadyArt/Omega-Arsenal-12B-GGUF (modelo base) | 12B | no disponible en esta ficha | Apache 2.0 (heredada) | GGUF Q4_K_M; ejecutable en llama.cpp y runtimes GGUF | Referencia de corrección del paquete Loom; soporta visión y audio |
| llama.cpp como runtime alternativo | no aplica | según configuración | MIT | GGUF nativo en CPU/GPU | Referencia usada por loom-benchmark para validar salidas |

No se dispone de datos de rendimiento para comparar con otros modelos de 12B de la misma categoría; la comparación se limita al formato de despliegue y la licencia.

## Limitaciones y advertencias

- Paquete sin mediciones: todas las puertas de corrección y las comparativas de rendimiento figuran como "not yet re-measured"; no hay evidencia publicada de equivalencia con llama.cpp en este artefacto.
- Sin tracción verificable: 0 descargas y 0 likes; el repositorio tiene 0.0 GB, por lo que los pesos se obtienen del GGUF de origen vía `loom-fetch`.
- Hardware restringido: generado exclusivamente para gfx1151 (Strix Halo) y gfx1201 (R9700); no se garantiza funcionamiento en otras GPU AMD o NVIDIA.
- Capacidades recortadas respecto al base: visión y audio no están soportados por Loom aunque el modelo de origen sí los tenga.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens; puede ser insuficiente para cargas de producción con alto paralelismo.
- Muestreo no determinado: el comportamiento de temperature, top_k y seed figura como "?" en la tabla de características.
- Idiomas no declarados: no se puede confirmar calidad multilingüe.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base `ReadyArt/Omega-Arsenal-12B-GGUF` antes de desplegar en producción.
- El nombre "Loom" colisiona con el servicio de grabación de pantalla homónimo; los resultados de búsqueda web no aportan información técnica sobre este paquete.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Omega-Arsenal-12B-loom
- Modelo base GGUF: https://huggingface.co/ReadyArt/Omega-Arsenal-12B-GGUF
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom (sitio): https://loom-fun.github.io/loom-dev/
- Runtime AMD HRX (referenciado en la card): https://github.com/ROCm/hrx-system

# loom-draft/bartowski-Qwen2.5-Math-1.5B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `Qwen2.5-Math-1.5B-Instruct-Q4_K_M.gguf` de bartowski. El modelo subyacente es Qwen2.5-Math-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros especializado en razonamiento matemático, desarrollado por el equipo Qwen de Alibaba, y cuantizado en Q4_K_M por bartowski. La licencia declarada es Apache 2.0.

El interés de este paquete es la infraestructura: está pensado para ejecutar el modelo sobre las GPU integradas AMD Ryzen AI Max+ 395 («Strix Halo», gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el runtime `hrx-loom` (versión 0.2.0) y el generador `loom-next`, que produce kernels específicos para el hardware sin intervención de un LLM en el bucle. Expone una API compatible con OpenAI (`/v1/chat/completions`) y soporta tool calling en formato OpenAI.

La relevancia es acotada: se trata de un artefacto de borrador (`loom-draft`) con cero descargas y cero «likes» en el momento de la consulta, y el propio autor indica que las medidas de rendimiento y las puertas de corrección todavía no se han vuelto a medir para este paquete. No aporta pesos nuevos ni fine-tuning; su valor está en la portabilidad del GGUF a un backend AMD alternativo a llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Math-1.5B-Instruct); paquete de despliegue Loom con kernels generados para AMD gfx1151 y gfx1201 |
| Parámetros totales | 1.500 millones (modelo base, no verificado en la información disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens por petición (límite del preset Loom; el contexto nativo del modelo base no se especifica en la información disponible) |
| Tipos de cuantización | Q4_K_M (GGUF); el paquete solo distribuye esa variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) más `tokenizer.json`, `llm_config.json`, `model.json` y `model.json.lock` |

Otros parámetros operativos del preset: máximo de 4.096 tokens de salida, 4 peticiones concurrentes, tool calling en formato OpenAI, sin decodificación especulativa, sin modo de razonamiento explícito y sin entrada de imagen ni audio.

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen2.5-Math, una variante de Qwen2.5 orientada a matemáticas. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; tampoco se documenta ninguna innovación arquitectónica específica más allá de la especialización matemática del checkpoint. Todos esos datos deben consultarse en la model card original de Qwen2.5-Math-1.5B-Instruct, que no forma parte del material disponible.

La contribución técnica de este repositorio es el pipeline de compilación: `loom-next` genera programas Loom (kernels y grafo de ejecución) a partir del GGUF y de `llm_config.json`, con verificaciones de integridad sha256 de los ficheros fuente fijadas en `model.json.lock`. El runtime `loom-serve` ofrece tres modos de configuración relevantes: `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elástico), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo). El paquete incluye además un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF.

## Capacidades

- Generación de texto y razonamiento matemático heredados de Qwen2.5-Math-1.5B-Instruct (resolución de problemas, cálculo, álgebra).
- Tool calling en formato OpenAI: campos `tools` y `tool_calls` en la API `/v1/chat/completions`.
- Bucles de tool calling multi-turno, con reutilización de historial y renderizado exacto del prompt según la puerta `agent`.
- Servicio HTTP concurrente: 4 peticiones simultáneas con salida idéntica a la ejecución aislada (según la puerta `consistency`, pendiente de re-medición).
- Muestreo configurable: temperatura, top_k y semilla (la puerta `sampling` figura como no determinada en la tabla de características y no re-medida en la de corrección).
- Lectura de logits en host (`llm.logits`) para inspección y comparación con llama.cpp.
- No soporta modo de razonamiento o «thinking», decodificación especulativa, entrada de imagen ni audio (marcados como no aplicables).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un asistente matemático en hardware AMD integrado: el paquete permite servir Qwen2.5-Math-1.5B-Instruct en un Ryzen AI Max+ 395 sin depender de CUDA, usando `loom-serve` con API compatible con OpenAI y un contexto de 4.096 tokens suficiente para problemas escolares o de ingeniería de complejidad media.
- Sustitución de llama.cpp en entornos AMD Radeon AI PRO R9700: con 32 GB de VRAM y un modelo de 1,5B en Q4_K_M, el margen de memoria es amplio; resulta útil para validar el backend Loom frente a la referencia llama.cpp usando las puertas `golden` y `compare`.
- Integración en pipelines de agentes con tool calling: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite conectar el modelo a calculadoras simbólicas, ejecutores de código o APIs de resolución de ecuaciones dentro de un flujo de varios pasos.
- Servicio de chat concurrente de baja latencia: con 4 peticiones concurrentes y 4.096 tokens de salida máxima, encaja en herramientas internas de tutoría o corrección automática de ejercicios donde el volumen por instancia es moderado.
- Evaluación comparativa de runtimes: las puertas `kernel_tests`, `logits` y `decision` están diseñadas para verificar equivalencia numérica frente a llama.cpp, lo que lo convierte en un banco de pruebas para medir la fidelidad de kernels generados automáticamente.
- Prototipado de inferencia en hardware de escritorio: al ser un GGUF Q4_K_M de 1,5B, el modelo cabe en iGPU y GPU de consumo, lo que permite iterar en local antes de mover cargas a servidores mayores.
- Docencia e investigación sobre compiladores de kernels: el repositorio documenta el formato `.loom`, la estructura de `model.json` y el flujo de `loom-fetch`/`loom-serve`, material útil para estudiar generación automática de kernels para AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican literalmente que «the results for this package are not yet re-measured». Del mismo modo, las doce puertas de corrección figuran como «not yet re-measured» en ambas plataformas. No hay datos de MMLU, GSM8K, HumanEval ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de 1,5B ocupa del orden de 1 GB de pesos, pero el pool de memoria real depende del preset Loom (`--pool_backing=fixed`) y no se documenta su tamaño.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se confirma compatibilidad con RTX 4090, A100 o H100; el paquete está orientado a AMD vía `amdgpu://` y no se mencionan otros backends.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado con pipx, `loom-fetch` para materializar el paquete desde Hugging Face y `loom-serve` para el servidor. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp para este paquete concreto (llama.cpp se usa solo como referencia de corrección).
- Concurrencia: 4 peticiones simultáneas por instancia.
- Latencia y throughput: no disponibles; las tablas comparativas frente a llama.cpp están pendientes de re-medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Este paquete (Loom, Qwen2.5-Math-1.5B-Instruct Q4_K_M) | 1,5B | 4.096 tokens por petición (preset) | `.loom` sobre `hrx-loom` 0.2.0; API OpenAI | Apache 2.0 | Solo AMD gfx1151 y gfx1201; rendimiento no re-medido |
| Qwen2.5-Math-1.5B-Instruct (bartowski GGUF) | 1,5B | no disponible en la información | GGUF Q4_K_M para llama.cpp y derivados | Apache 2.0 | Checkpoint de origen, sin empaquetado Loom |
| Qwen2.5-Math-1.5B-Instruct (original) | 1,5B | no disponible en la información | safetensors / transformers | Apache 2.0 | Pesos de referencia del modelo base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia y plataforma de ejecución.

## Limitaciones y advertencias

- Artefacto de borrador: el repositorio pertenece a la organización `loom-draft`, con 0 descargas y 0 «likes» en el momento de la consulta; no debe tratarse como una distribución estable.
- Rendimiento y corrección sin verificar: todas las puertas de corrección y las comparativas frente a llama.cpp figuran como «not yet re-measured»; no hay evidencia registrada de equivalencia numérica.
- Contexto limitado: el preset fija 4.096 tokens por petición, muy por debajo de lo que suele ofrecer el modelo base; los documentos largos se truncan.
- Plataforma restringida: solo se documentan AMD gfx1151 y gfx1201; no hay soporte declarado para NVIDIA, CPU pura u otros aceleradores.
- Especialización matemática: al derivar de Qwen2.5-Math, el comportamiento en tareas generales de lenguaje puede ser inferior al de un Qwen2.5-Instruct estándar; la información disponible no cuantifica esta diferencia.
- Riesgo de alucinación: no evaluado en la información disponible; en dominios matemáticos, la verificación de resultados con herramientas externas es recomendable.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no especificados; no se confirma cobertura multilingüe más allá del inglés.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint de origen (Qwen2.5-Math) y del GGUF de bartowski antes de producción.
- Dependencia de una versión concreta del runtime (`hrx-loom==0.2.0`) y de la integridad de `model.json.lock`; cambios de versión pueden invalidar el paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen2.5-Math-1.5B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen2.5-Math-1.5B-Instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de la búsqueda web devuelven páginas de Loom (herramienta de grabación de pantalla) y de la marca de ropa Loom, sin relación con este proyecto; se han descartado por no ser relevantes.

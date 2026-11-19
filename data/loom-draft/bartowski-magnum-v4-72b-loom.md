# loom-draft/bartowski-magnum-v4-72b-loom

## Resumen

El repositorio `loom-draft/bartowski-magnum-v4-72b-loom` no es un modelo de lenguaje entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `bartowski/magnum-v4-72b-GGUF`, en su cuantizacion Q4_K_M. Lo publica el usuario `loom-draft` y su funcion es permitir la ejecucion del modelo Magnum v4 de 72B sobre GPUs AMD concretas: el APU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la tarjeta AMD Radeon AI PRO R9700 (gfx1201, 32 GB). La generacion del paquete se realizo con la herramienta `loom-next`, sin intervencion de un LLM en el proceso.

El valor del artefacto es de infraestructura, no de modelado: traduce los pesos GGUF a kernels y programas Loom ejecutables sobre el runtime `hrx-loom` (IREE sobre ROCm), y expone un servidor compatible con la API de OpenAI (`/v1/chat/completions`) con tool calling. El modelo subyacente, Magnum v4 72B, se distribuye bajo licencia Apache 2.0.

La relevancia es acotada y practica: ofrece una via de despliegue para modelos de 72B cuantizados en hardware AMD de consumo profesional y APUs con memoria unificada, un nicho donde el soporte de herramientas suele ser limitado. El repositorio no aporta pesos nuevos, ni datos de entrenamiento, ni benchmarks propios del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Magnum v4 72B; el paquete Loom genera kernels y programas para el runtime hrx-loom/IREE) |
| Parametros totales | 72B (segun el nombre del modelo base; no verificado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen) empaquetado como programas Loom (`program/*.loom`, `weights.loom`) con `tokenizer.json`, `llm_config.json`, `model.json` e `info.json` |

## Arquitectura y entrenamiento

El paquete no contiene informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF/DPO) del modelo Magnum v4 72B; la model card solo referencia el checkpoint GGUF de `bartowski/magnum-v4-72b-GGUF` como base sin modificar. Cualquier detalle sobre transformer, atencion, composicion del corpus o numero de tokens de entrenamiento debe consultarse en la ficha del modelo original, que no forma parte de la informacion disponible.

La innovacion tecnica del repositorio es el pipeline de generacion Loom: a partir de `llm_config.json` y los pesos GGUF se producen programas `.loom` y kernels especificos para gfx1151 y gfx1201, ejecutados mediante `loom-serve` sobre el runtime `hrx-loom` (IREE con backend AMDGPU/ROCm). El servidor admite espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), reserva fija del pool de memoria (`--pool_backing=fixed`) y precarga de pesos en host (`--parameter_mode=preload`). No se aplica decodificacion especulativa ni modo de razonamiento (marcados como «not applicable» en la tabla de caracteristicas).

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Soporte de hasta 4 peticiones concurrentes.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Contexto de 32.768 tokens por peticion.
- Sin modo de razonamiento o «thinking» (no aplicable en este paquete).
- Sin decodificacion especulativa (no aplicable).
- Sin entrada de imagen ni audio (no aplicable).
- Comportamiento de muestreo (`temperature`, `top_k`, semilla): no determinado en la informacion disponible.
- Capacidades multilingues del modelo base: no disponibles.

## Casos de uso

- Asistente conversacional local sobre hardware AMD: desplegar un modelo de 72B en una Radeon AI PRO R9700 o en un APU Strix Halo mediante `loom-serve`, con endpoint compatible con OpenAI para integrarlo en clientes existentes sin cambios de codigo.
- Agentes con tool calling en entornos controlados: el soporte de `tools`/`tool_calls` permite construir bucles multi-turno de invocacion de funciones (consulta de APIs internas, operaciones sobre bases de datos) ejecutados en local.
- Procesamiento de documentos largos: la ventana de 32.768 tokens admite resumir, extraer o clasificar documentos extensos en una sola peticion, util en pipelines de analisis de contratos o informes.
- Sustitucion de API en desarrollo y pruebas: al exponer el mismo esquema que OpenAI, sirve como backend local para probar aplicaciones antes de migrar a servicios en la nube, sin coste por token.
- Despliegue en estaciones de trabajo con GPU AMD: escenarios donde CUDA no esta disponible y se necesita inferencia de un modelo grande cuantizado en Q4_K_M sobre ROCm.
- Prototipado de asistentes con concurrencia moderada: con 4 peticiones simultaneas, cubre equipos pequenos o uso individual con varias sesiones abiertas.
- Evaluacion comparativa frente a llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `agent`, `logits`) pensadas para verificar la equivalencia de salida respecto a la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento para Strix Halo y Radeon AI PRO R9700 «no se han vuelto a medir» para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como no medidas, es decir, sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de un modelo de 72B, lo que en la practica exige del orden de 40-45 GB para pesos, mas overhead de contexto y pool de memoria. Cifra orientativa, no confirmada en la informacion proporcionada.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- La Radeon AI PRO R9700 declara 32 GB; dado el tamano del checkpoint Q4_K_M, el ajuste exacto en 32 GB no esta confirmado en la informacion disponible y requiere verificacion.
- GPUs NVIDIA (A100, H100, RTX 4090): no contempladas por este paquete, que genera kernels para objetivos AMDGPU concretos.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` como servidor. En hosts con memlock de 8 MiB hay que lanzar bajo `systemd-run` con `SystemCallFilter=~io_uring_setup` o elevar `ulimit -l`.
- Alternativas de despliegue no incluidas en el paquete: llama.cpp, vLLM, Ollama o TGI no se mencionan como soportados para estos programas Loom; el GGUF original si es compatible con llama.cpp.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bartowski/magnum-v4-72b-loom (este) | 72B | 32.768 tokens | Paquete Loom (origen GGUF Q4_K_M) | Apache 2.0 | Solo AMD gfx1151 y gfx1201; API OpenAI; tool calling; sin benchmarks medidos |
| bartowski/magnum-v4-72b-GGUF (base) | 72B | no disponible | GGUF (multiples cuantizaciones) | Apache 2.0 | Ejecutable con llama.cpp y derivados; portable a CPU y GPU |
| Modelos de ~70B cuantizados en Q4_K_M (categoria generica) | ~70B | variable | GGUF | variable | No se dispone de datos comparativos concretos en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion disponible.

## Limitaciones y advertencias

- El repositorio no es un modelo entrenado: es un artefacto de despliegue generado automaticamente; no aporta mejoras de calidad sobre el GGUF base.
- Cero descargas y cero «likes» en el momento de la ficha, creado y actualizado el mismo dia (2026-11-19): madurez y soporte no verificables.
- Ninguna puerta de correccion tiene evidencia registrada; no hay prueba publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento para ninguno de los dos objetivos de hardware.
- Compatibilidad restringida a AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201); no es portable a otras GPUs sin regenerar el paquete.
- El ajuste del checkpoint Q4_K_M de 72B en los 32 GB de la R9700 no esta confirmado en la documentacion; verificar antes de desplegar.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por peticion.
- Sin modo de razonamiento, sin vision, sin audio y sin decodificacion especulativa.
- Idiomas soportados no declarados; el comportamiento multilingue del modelo base no esta documentado en esta ficha.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion disponible; deben evaluarse por separado sobre Magnum v4 72B.
- Licencia Apache 2.0 permite uso comercial, pero el cumplimiento depende tambien de las condiciones del checkpoint base y de las dependencias del runtime (`hrx-loom`, IREE, ROCm).
- Requiere ajustes de sistema en hosts con memlock bajo (8 MiB) para evitar fallos de arranque del servidor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-magnum-v4-72b-loom
- Modelo base GGUF: https://huggingface.co/bartowski/magnum-v4-72b-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

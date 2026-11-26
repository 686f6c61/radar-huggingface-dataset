# loom-draft/weareapexcreators-MiniCPM-OCR-1.0-LocalAI-loom

## Resumen

`loom-draft/weareapexcreators-MiniCPM-OCR-1.0-LocalAI-loom` es un paquete de despliegue para el runtime Loom de AMD, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF cuantizado en Q4_K_M del modelo base `weareapexcreators/MiniCPM-OCR-1.0-LocalAI` junto con programas `.loom` generados y una tarjeta `model.json`, con el objetivo de servirlo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un derivado de MiniCPM-OCR orientado a reconocimiento óptico de caracteres, con capacidad de entrada de imagen en su versión original. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling y un modo de razonamiento siempre activo, con una ventana de contexto de 262.144 tokens por petición y hasta 4 peticiones concurrentes. La licencia declarada es MIT.

Su relevancia es acotada: se trata de un artefacto de integración de un runtime específico, generado automáticamente con `loom-next` sin intervención de un LLM en el bucle, y en el momento de la publicación no incluye mediciones de rendimiento ni validaciones de corrección registradas. Es útil para quien quiera evaluar el stack Loom sobre hardware AMD, no como referencia del modelo OCR en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base MiniCPM-OCR; el paquete no la detalla) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (único checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`MiniCPM-OCR-1_0-Q4_K_M.gguf`) más programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base `weareapexcreators/MiniCPM-OCR-1.0-LocalAI`. El paquete Loom no documenta estos extremos; únicamente indica que el checkpoint GGUF se usa sin modificar y que los programas `.loom` se generaron con la herramienta `loom-next` (el generador en solitario, sin LLM en el bucle).

La innovación técnica del artefacto es de despliegue, no de modelado: kernels generados para las arquitecturas gfx1151 y gfx1201 de AMD, gestión de memoria con `--pool_backing=fixed` (pool preasignado en lugar de crecimiento elástico), carga de pesos con `--parameter_mode=preload` y espera activa de finalizaciones de GPU mediante `completion_spin_ns=4294967295`. El paquete incluye además un `model.json.lock` con los hashes SHA-256 de los ficheros fuente, verificados por `loom-fetch`. No hay decodificación especulativa (marcada como no aplicable) ni ajuste de esfuerzo de razonamiento.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI en `/v1/chat/completions`.
- Tool calling con el esquema `tools` y `tool_calls` de OpenAI.
- Modo de razonamiento siempre activo (no configurable, sin niveles de esfuerzo).
- Ventana de contexto de 262.144 tokens por petición.
- Hasta 4 peticiones concurrentes.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom, aunque el modelo original sí la tiene.
- Entrada y salida de audio: sin determinar.
- Muestreo (temperatura, top_k, semilla): sin determinar.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación del runtime Loom sobre AMD: servir el paquete con `loom-serve` en Strix Halo o R9700 para medir latencia, throughput y estabilidad de los kernels generados antes de adoptar el stack en producción.
- Pruebas de integración con clientes OpenAI: al exponer `/v1/chat/completions`, permite apuntar SDKs y frameworks existentes al endpoint local sin cambios de código, útil para validar pipelines antes de migrar a hardware AMD.
- Automatización de agentes con tool calling: el soporte de `tools` y `tool_calls` con razonamiento siempre activo permite construir bucles multi-turno de llamadas a funciones sobre el endpoint local, con hasta 4 peticiones concurrentes.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite enviar expedientes extensos en una sola petición, aunque la salida queda limitada a 4.096 tokens, lo que restringe el caso a resúmenes y extracciones acotadas.
- Despliegue en estación de trabajo con GPU de consumo profesional: la R9700 de 32 GB y el paquete Q4_K_M permiten levantar un servidor de inferencia local sin depender de CUDA ni de servicios en la nube.
- Reproducibilidad y auditoría de artefactos: el `model.json.lock` con hashes SHA-256 verificado por `loom-fetch` facilita fijar exactamente los ficheros servidos en entornos con requisitos de trazabilidad.
- OCR sobre documentos: el modelo base está orientado a reconocimiento óptico de caracteres, pero la entrada de imagen no está soportada por Loom en este paquete, por lo que este caso requiere usar el checkpoint original fuera de Loom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de rendimiento para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran todas como no medidas. Una puerta sin ejecución registrada no aporta evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el checkpoint es Q4_K_M y el paquete se sirve con pool de memoria fijo, pero no se publica el consumo medido.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, orientado a ROCm/AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servirlo; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Flags relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; no se han registrado mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este paquete (Loom, MiniCPM-OCR-1.0-LocalAI Q4_K_M) | no disponible | 262.144 tokens | MIT | GGUF + `.loom` | Solo AMD gfx1151/gfx1201; sin benchmarks publicados |
| `weareapexcreators/MiniCPM-OCR-1.0-LocalAI` (modelo base) | no disponible | no disponible | MIT (según este paquete) | no disponible | Incluye entrada de imagen; sin empaquetado Loom |
| llama.cpp sobre el mismo GGUF | no disponible | según configuración | MIT | GGUF | Referencia usada por las puertas de corrección de Loom; portable a más hardware |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El paquete no incluye ninguna medición de rendimiento ni validación de corrección registrada; todas las puertas figuran como no medidas.
- La entrada de imagen no está soportada por Loom, pese a que el modelo original es OCR y sí la admite; esto anula el caso de uso principal del modelo base dentro de este artefacto.
- El límite de salida de 4.096 tokens por petición restringe tareas de generación larga aunque el contexto de entrada sea de 262.144 tokens.
- Solo 4 peticiones concurrentes, lo que limita el throughput en despliegues con carga real.
- Compatibilidad restringida a AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para NVIDIA ni para otras GPU AMD.
- El modo de razonamiento está siempre activo y no es configurable, lo que incrementa el consumo de tokens de salida sin posibilidad de desactivarlo.
- Sin datos sobre sesgos, tasa de alucinación ni cobertura idiomática del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los ficheros pueden no estar materializados o que el artefacto es de muy reciente creación.
- Aunque la licencia declarada es MIT, conviene verificar los términos del modelo base por separado antes de un uso comercial.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/weareapexcreators-MiniCPM-OCR-1.0-LocalAI-loom
- Modelo base: https://huggingface.co/weareapexcreators/MiniCPM-OCR-1.0-LocalAI
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

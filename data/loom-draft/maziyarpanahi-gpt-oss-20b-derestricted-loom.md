# loom-draft/MaziyarPanahi-gpt-oss-20b-Derestricted-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (`.loom` más una tarjeta `model.json`) construido sobre el checkpoint GGUF `gpt-oss-20b-Derestricted.Q4_K_M.gguf`, publicado por MaziyarPanahi como variante "sin restricciones" del modelo `gpt-oss-20b` de OpenAI. El autor del paquete es `loom-draft`, que lo genera automáticamente con la herramienta `loom-next` (sin intervención de un LLM en el proceso) para servir el modelo con el runtime `loom-serve` sobre GPUs AMD concretas: Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés práctico está en el motor de inferencia, no en los pesos: la model card publica una comparativa medida frente a llama.cpp ROCm (`llamacpp-rocm/b1374`) con el mismo GGUF y los mismos prompts, mostrando mejoras de prefill de entre el 51 % y el 54 % y una decodificación ligeramente superior en contexto corto (+7 %), con una pérdida del 9 % en decodificación a 32k de contexto. Es, por tanto, una pieza relevante para quien quiera evaluar alternativas de serving en hardware AMD consumer y de estación de trabajo.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0.0 GB (lo que sugiere que los artefactos no están materializados en el repo o son meros punteros al GGUF base) y licencia MIT declarada. La información sobre el modelo subyacente (arquitectura, parámetros, contexto) no se detalla en la model card; solo se infiere del nombre `gpt-oss-20b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete sirve el GGUF `gpt-oss-20b-Derestricted`, derivado de `gpt-oss-20b`; la model card no describe la arquitectura) |
| Parametros totales | no disponible (el nombre del checkpoint indica "20b"; no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 65.536 tokens en la configuracion medida de llama.cpp (`-c 65536`); la model card no declara el contexto nativo del modelo |
| Tipos de cuantizacion | Q4_K_M (GGUF); el paquete Loom sirve ese checkpoint concreto |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en el repo y en la model card) |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento en la documentación proporcionada. El paquete no entrena nada: toma el GGUF `gpt-oss-20b-Derestricted.Q4_K_M.gguf` de MaziyarPanahi sin modificarlo ("unmodified GGUF checkpoint") y lo envuelve en el formato de programa de Loom, generado con `loom-next`, el generador del ecosistema Loom. La variante "Derestricted" implica un ajuste o modificación de los pesos originales de `gpt-oss-20b` para eliminar restricciones de comportamiento, pero los detalles de ese proceso no aparecen en la información disponible.

La innovación técnica documentada pertenece al runtime: `loom-serve` expone una API compatible con OpenAI (`/v1/chat/completions`), soporta tool calling, usa un pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). La model card indica que no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificación especulativa no está disponible en las mediciones.

## Capacidades

- Generación de texto conversacional vía API estilo OpenAI en `/v1/chat/completions`, con parámetro `reasoning_effort` (el ejemplo de la card usa `low`).
- Tool calling / function calling: marcado como soportado en la tabla de features de la model card.
- Modo de razonamiento configurable mediante `reasoning_effort`, heredado del modelo base `gpt-oss`.
- Servicio multi-stream: la comparativa incluye una prueba de 4 streams con decodificación agregada de 143,5 tok/s en Strix Halo.
- Contexto largo en la práctica: se miden prefill y decode con contextos de hasta 32k tokens y la configuración de llama.cpp usa 65.536 tokens.
- Capacidades multilingües, visión, audio y agentes multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación comparativa de motores de inferencia en AMD: servir el mismo GGUF con `loom-serve` y con llama.cpp ROCm para medir prefill y decode en Strix Halo o R9700 antes de fijar un stack de producción; la card aporta una metodología reproducible (mediana de 3 sesiones, mismos prompts, mismo runner).
- Procesamiento de documentos largos en local: el prefill medido de 1.915 a 2.410 tok/s con prompts de 1k a 32k tokens hace viable resumir o extraer información de documentos extensos en una GPU integrada Strix Halo, sin depender de la nube.
- Asistente conversacional con tool calling: la API compatible con OpenAI y el soporte declarado de function calling permiten conectarlo a frameworks existentes (clientes OpenAI, orquestadores de agentes) apuntando a `http://127.0.0.1:8080/v1`.
- Servicio multiusuario ligero: con 4 streams agregando 143,5 tok/s en Strix Halo, puede atender un pequeño grupo de usuarios concurrentes en un equipo de escritorio con GPU integrada.
- Despliegue en estación de trabajo R9700: el paquete incluye comandos específicos para gfx1201 con 32 GB de VRAM, pensados para entornos de desarrollo que necesitan inferencia local con pesos de 20B en Q4_K_M.
- Prototipado de aplicaciones sobre `gpt-oss` sin restricciones: útil para investigar comportamientos del modelo base en entornos controlados, con la advertencia de que la variante "Derestricted" elimina salvaguardas y requiere revisión propia.
- Integración en pipelines CI/CD de evaluación de modelos: el formato Loom y los jobs de DevLab permiten automatizar la medida de rendimiento por commit, como muestra el run enlazado en la card.

## Benchmarks y rendimiento

Rendimiento del runtime Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374`, mismo GGUF y mismos prompts, en AMD Strix Halo (gfx1151), medido el 2026-11-26:

| Metrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 65,1 | 69,9 | +7 % |
| Decode tok/s, contexto 2k | 64,0 | 66,8 | +4 % |
| Decode tok/s, contexto 32k | 52,7 | 48,1 | -9 % |
| Prefill tok/s, documento 1k | 1409,5 | 2166,1 | +54 % |
| Prefill tok/s, documento 2k | 1546,3 | 2356,7 | +52 % |
| Prefill tok/s, documento 8k | 1568,2 | 2410,2 | +54 % |
| Prefill tok/s, documento 16k | 1479,9 | 2237,7 | +51 % |
| Prefill tok/s, documento 32k | 1250,3 | 1915,9 | +53 % |
| 4 streams, decode agregado tok/s | 114,9 | 143,5 | +25 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201): "the results for this package are not yet re-measured", es decir, sin datos. No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el peso es un GGUF de un modelo de ~20B en Q4_K_M (aproximadamente 12-14 GB de pesos, estimación no confirmada en la card). La R9700 tiene 32 GB y Strix Halo usa memoria unificada.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GeForce/RTX; el paquete está generado para el stack ROCm de AMD. No hay datos para GPUs NVIDIA.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` como servidor. Alternativa medida: llama.cpp ROCm (`-ngl 99 -cram 0 -c 65536 -np 1`). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 69,9 tok/s de decode en contexto corto y 2.166-2.410 tok/s de prefill en Strix Halo con espera activa; 143,5 tok/s agregados con 4 streams. En R9700, sin medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (gpt-oss-20b-Derestricted, Loom) | ~20B (por nombre) | hasta 65.536 en la config medida | GGUF Q4_K_M + Loom (loom-serve) | MIT | Hugging Face, 0 descargas |
| MaziyarPanahi/gpt-oss-20b-Derestricted-GGUF | ~20B (por nombre) | no disponible | GGUF | no disponible | Hugging Face (modelo base) |
| gpt-oss-20b (OpenAI, original) | ~20B (por nombre) | no disponible | safetensors / GGUF | no disponible en esta informacion | Hugging Face |
| llama.cpp ROCm b1374 (motor) | n/a (runtime) | configurable (65.536 en la prueba) | GGUF | MIT (proyecto llama.cpp) | GitHub |

La comparación de rendimiento entre motores está en la sección de benchmarks; la comparación de calidad entre el modelo original y la variante "Derestricted" no está disponible.

## Limitaciones y advertencias

- La variante "Derestricted" elimina restricciones del modelo original; no hay documentación sobre qué salvaguardas se han retirado ni cómo afecta a sesgos, contenido dañino o rechazos. Requiere evaluación propia antes de cualquier uso en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el comportamiento del modelo base, sin datos.
- El repositorio tiene 0 descargas, 0 likes y 0.0 GB de tamaño; los artefactos pueden no estar materializados o depender del GGUF externo. Verificar disponibilidad antes de integrarlo.
- Rendimiento en R9700 sin medir; las cifras de Strix Halo no son extrapolables.
- Pérdida de rendimiento del 9 % en decode a 32k de contexto frente a llama.cpp; para cargas con contextos muy largos, el margen se invierte.
- Sin decodificación especulativa: no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto.
- Licencia MIT declarada por el publicador del paquete; la licencia del modelo base `gpt-oss-20b` y de la variante de MaziyarPanahi no se detalla en la información proporcionada, por lo que conviene verificarla por separado antes de uso comercial.
- Idiomas soportados no documentados.
- Dependencia de `hrx-loom==0.2.0` y del ecosistema Loom (repositorios `ROCm/hrx-system` y `loom-fun/loom-next`), con madurez y soporte no evaluados aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/MaziyarPanahi-gpt-oss-20b-Derestricted-loom
- Modelo base GGUF: https://huggingface.co/MaziyarPanahi/gpt-oss-20b-Derestricted-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Run de medición DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/45895812790
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/

Nota: los resultados de la búsqueda web sobre "Loom" corresponden a la herramienta de grabación de pantalla (loom.com), a la marca de ropa (loom.fr) y a la acepción textil en Wikipedia; no guardan relación con este paquete y se han descartado.

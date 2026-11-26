# loom-draft/mradermacher-sk2decompile-struct-6.7b-loom

## Resumen

`loom-draft/mradermacher-sk2decompile-struct-6.7b-loom` no es un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) construido sobre el checkpoint GGUF sin modificar `mradermacher/sk2decompile-struct-6.7b-GGUF`, en su cuantizacion Q4_K_M. Lo publica la organizacion `loom-draft` y esta pensado para ejecutarse con `hrx-loom` (version 0.2.0) sobre dos aceleradores AMD concretos: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El objetivo es ofrecer un artefacto reproducible y listo para servir con un unico comando, sin necesidad de compilar ni ajustar llama.cpp.

El modelo subyacente, `sk2decompile-struct-6.7b`, es un ajuste fino de 6.700 millones de parametros orientado a la descompilacion estructurada (decompilacion de binarios a representaciones de codigo de alto nivel). El paquete Loom anade la capa de empaquetado y servido: fija el preset de memoria, expone una API compatible con OpenAI (`/v1/chat/completions`) y documenta mediciones de rendimiento frente a llama.cpp ROCm. La licencia declarada es MIT tanto en el paquete como en el modelo base.

Su relevancia es acotada pero clara: sirve como ejemplo de distribucion de modelos GGUF para el ecosistema AMD ROCm, con cifras de prefill medidas (hasta +42 % frente a llama.cpp en documentos de 2k tokens) y un contexto nativo limitado a 8192 tokens que condiciona los casos de uso. No hay informacion publicada sobre el dataset de entrenamiento, los idiomas soportados ni los benchmarks de calidad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 6.7B; arquitectura no documentada en la informacion proporcionada) |
| Parametros totales | 6.7B (segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens nativos (segun las notas de metodologia del paquete) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este paquete); el repositorio base `mradermacher/sk2decompile-struct-6.7b-GGUF` ofrece otras variantes GGUF, no detalladas aqui |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`sk2decompile-struct-6.7b.Q4_K_M.gguf`) empaquetado como programa Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento: la model card del paquete Loom solo describe el empaquetado y el servido, no el modelo. Por el nombre y el tamano (6.7B) cabe esperar un transformer decoder-only, pero esto no esta confirmado en la informacion proporcionada. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La especializacion declarada en el nombre (`sk2decompile-struct`) sugiere un ajuste fino para tareas de descompilacion estructurada, pero no se aportan detalles.

La innovacion tecnica relevante esta en la capa de despliegue, no en el modelo. El paquete Loom incluye un preset de memoria con `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elastico) y `--parameter_mode=preload` (carga anticipada de pesos en el host). Ademas, `completion_spin_ns=4294967295` activa espera activa en las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo; las mediciones de rendimiento de la tarjeta se tomaron con esta configuracion. No se menciona decodificacion especulativa: el GGUF no incluye cabecera MTP y no hay drafter publicado para este modelo exacto.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`), con peticiones JSON estandar.
- Descompilacion estructurada: la especialidad declarada del checkpoint base, orientada a reconstruir codigo de alto nivel a partir de binarios.
- Servido multi-sesion: la configuracion de referencia de llama.cpp usa `-np 1`, pero la metodologia de Loom contempla escenarios de 4 streams paralelos (agregado no registrado en la tabla).
- Contexto de hasta 8192 tokens nativos, suficiente para funciones o modulos pequenos, insuficiente para documentos largos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Analisis de malware en laboratorio: el modelo puede recibir el seudocodigo o el desensamblado de una funcion y devolver una reconstruccion estructurada en C, util para triaje rapido antes de la revision manual. Su ventana de 8192 tokens encaja con funciones individuales.
- Ingenieria inversa de firmware: para modulos de 6-7 KB de seudocodigo, el modelo cabe en el contexto y permite iterar funcion a funcion sobre imagenes de firmware extraidas con herramientas como Ghidra o IDA.
- Auditoria de seguridad de binarios legacy: integrado en un pipeline que extraiga funciones, el modelo puede generar pseudocodigo legible para revisar patrones de desbordamiento o uso de funciones inseguras, con revision humana obligatoria.
- Formacion y docencia en reversing: servir el modelo en local con `loom-serve` sobre una APU Strix Halo permite a estudiantes practicar descompilacion asistida sin depender de APIs externas ni enviar binarios a terceros.
- Prototipado de herramientas de decompilacion: el paquete Loom sirve como banco de pruebas reproducible para comparar el rendimiento de Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts, gracias a la metodologia documentada.
- Despliegue en hardware AMD de escritorio: con una Radeon AI PRO R9700 de 32 GB o una APU Strix Halo, el paquete se instala con `pipx install "hrx-loom[hf]==0.2.0"` y se sirve con un solo comando, sin compilar llama.cpp ni gestionar dependencias de CUDA.
- Evaluacion de ecosistemas de inferencia: util para equipos que quieran medir el rendimiento de Loom en prefill (1626-1762 tok/s en documentos de 1k-2k tokens) frente a llama.cpp ROCm (1239-1267 tok/s) en el mismo hardware.

## Benchmarks y rendimiento

Las unicas cifras publicadas corresponden a rendimiento de inferencia (no a calidad del modelo), medidas el 2026-11-26 en un runner AMD DevLab Dispatch Strix Halo (X2-LA03-S01-D05) con `hrx-loom` 0.2.0 frente a llama.cpp ROCm `llamacpp-rocm/b1374`.

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | 50.4 | no medido |
| Decode tok/s, contexto 2k | no medido | 36.5 | no medido |
| Decode tok/s, contexto 32k | n/a | n/a | n/a (supera el contexto nativo de 8192) |
| Prefill tok/s, documento 1k | 1267.1 | 1626.2 | +28 % |
| Prefill tok/s, documento 2k | 1239.5 | 1761.9 | +42 % |
| Prefill tok/s, documento 8k | n/a | n/a | n/a (supera el contexto nativo) |
| Prefill tok/s, documento 16k | n/a | n/a | n/a |
| Prefill tok/s, documento 32k | n/a | n/a | n/a |
| 4 streams, decode agregado | no medido | no medido | no medido |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a (sin drafter) |

En la Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados no se han vuelto a medir. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint Q4_K_M de 6.7B ocupa aproximadamente 4-4,5 GB en disco y en memoria; el paquete esta disenado para GPUs de 32 GB (R9700) y para la memoria unificada de la APU Strix Halo, por lo que el margen es amplio.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se documenta soporte para otras GPU AMD ni para NVIDIA.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el paquete esta orientado a los dos aceleradores AMD citados. Cualquier otra GPU requeriria usar el GGUF directamente con otro motor.
- Opciones de despliegue: `hrx-loom` 0.2.0 (via `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. Alternativa: el GGUF original con llama.cpp ROCm (build b1374 en las pruebas).
- Latencia y throughput: en Strix Halo, 50.4 tok/s de decode con prompt corto y 36.5 tok/s tras 2k tokens de contexto; prefill de 1626 tok/s (1k) y 1762 tok/s (2k). En R9700 no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de descompilacion estructurada de 6-7B en la busqueda realizada. La comparacion mas directa disponible es entre motores de inferencia sobre el mismo checkpoint:

| Aspecto | Loom (este paquete) | llama.cpp ROCm b1374 |
|---|---|---|
| Modelo | sk2decompile-struct-6.7b Q4_K_M | sk2decompile-struct-6.7b Q4_K_M |
| Hardware medido | Strix Halo (gfx1151) | Strix Halo (gfx1151) |
| Prefill 1k (tok/s) | 1626.2 | 1267.1 |
| Prefill 2k (tok/s) | 1761.9 | 1239.5 |
| Decode corto (tok/s) | 50.4 | no medido |
| API | OpenAI-compatible | servidor propio de llama.cpp |
| Contexto configurado | 8192 nativo | 65536 (`-c 65536`) |

## Limitaciones y advertencias

- Contexto nativo de solo 8192 tokens: no admite documentos largos ni conversaciones multi-turno extensas; las filas de prefill a 8k, 16k y 32k se marcan como no aplicables por este motivo.
- Sin datos de calidad: no hay benchmarks de descompilacion, codigo o razonamiento publicados; no es posible evaluar su precision frente a alternativas.
- Riesgo de alucinacion: en tareas de descompilacion, un modelo de 6.7B puede generar pseudocodigo plausible pero incorrecto; requiere validacion humana o compilacion de contraste en cualquier uso de produccion.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no se puede evaluar su comportamiento en dominios fuera de la descompilacion.
- Idiomas: no declarados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del que use el modelo base.
- Licencia MIT: permite uso comercial y modificacion, pero el paquete no incluye garantias; el modelo base tambien declara MIT.
- Cobertura de hardware muy restringida: solo dos aceleradores AMD documentados y sin mediciones en la R9700; el rendimiento en otras GPUs no esta verificado.
- Configuracion no trivial: la espera activa (`completion_spin_ns=4294967295`) consume CPU durante la inferencia y las cifras publicadas dependen de ella; con otros ajustes el rendimiento puede diferir.
- Madurez del ecosistema: `hrx-loom` 0.2.0 y el repositorio `ROCm/hrx-system` son recientes; el commit de `hrx-system` figura como desconocido en la metodologia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/mradermacher-sk2decompile-struct-6.7b-loom
- Modelo base GGUF: https://huggingface.co/mradermacher/sk2decompile-struct-6.7b-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45881081618

Nota: los resultados de la busqueda web sobre "Loom" corresponden a un servicio de grabacion de pantalla y a una marca de ropa, sin relacion con este modelo; se han descartado.

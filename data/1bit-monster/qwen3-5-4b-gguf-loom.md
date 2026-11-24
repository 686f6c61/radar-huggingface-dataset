# 1bit-MONSTER/Qwen3.5-4B-GGUF-loom

## Resumen

Qwen3.5-4B-GGUF-loom es una tarjeta de despliegue (un paquete de programas `.loom` y un `model.json`) publicada por 1bit-MONSTER para ejecutar el modelo Qwen3.5-4B, en su cuantización GGUF `UD-Q4_K_XL`, sobre la plataforma AMD Loom en hardware Strix Halo (AMD Ryzen AI Max+ 395, gfx1151). No contiene pesos propios: el repositorio actúa como receta reproducible que descarga los pesos del repositorio upstream `unsloth/Qwen3.5-4B-GGUF` en una revisión fijada y verifica su sha256.

El problema que resuelve es de integración: permite servir un modelo de 4B parámetros con el motor Loom de AMD sobre GPUs integradas Strix Halo, con un flujo de instalación y arranque de dos comandos (`loom-fetch` y `loom-serve`). Adicionalmente, la tarjeta integra un drafter de decodificación especulativa (`Qwen3.5-4B-DFlash-Q8_0.gguf`, de magnitudedev) para acelerar la generación.

Es relevante ahora por dos motivos: por un lado, documenta mediciones de rendimiento y de fidelidad de salida frente a la ruta de referencia con llama.cpp en el mismo hardware; por otro, demuestra que es viable ejecutar modelos de la familia Qwen3.5 en GPUs integradas con memoria unificada, un escenario de interés para equipos que quieren inferencia local sin GPU dedicada. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4B (según el nombre del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `UD-Q4_K_XL` (pesos principales); `mmproj-F16.gguf` (proyector multimodal); `Qwen3.5-4B-DFlash-Q8_0.gguf` (drafter especulativo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos no se alojan en este repositorio; se descargan del upstream `unsloth/Qwen3.5-4B-GGUF`) |

## Arquitectura y entrenamiento

La tarjeta no describe la arquitectura interna del modelo base ni su proceso de entrenamiento; se limita a empaquetar los pesos GGUF de Qwen3.5-4B para el runtime Loom. Por los artefactos referenciados se deduce que el modelo base es multimodal (se carga un `mmproj-F16.gguf` junto a los pesos principales) y que soporta modo de razonamiento explícito ("thinking"), ya que las pruebas de la tarjeta comparan salidas con thinking activado y desactivado.

La innovación técnica de esta tarjeta no está en el modelo sino en el stack de despliegue: programas `.loom` generados con `loom-skills port.sh` a partir de las tarjetas de loom-fun, un `model.json` que fija revisiones y hashes sha256 de cada artefacto, y la integración de un drafter DFlash para decodificación especulativa. El motor subyacente es `hrx-loom` 0.3.0 sobre la pila HRX de AMD.

## Capacidades

- Generación de texto conversacional multi-turno mediante el preset `chat` de `loom-serve`.
- Razonamiento explícito con modo thinking activable, con la traza de razonamiento expuesta en `reasoning_content`.
- Procesamiento multimodal de entrada: la tarjeta carga el proyector `mmproj-F16.gguf` del repositorio upstream, lo que habilita entrada de imagen (el alcance exacto no se detalla en la model card).
- Decodificación especulativa mediante el drafter DFlash Q8_0, que acelera la fase de decode.
- Verificación de integridad de pesos: `loom-fetch` descarga y comprueba el sha256 de cada artefacto contra el `model.json.lock`.
- Servido local mediante API de `loom-serve` sobre dispositivo `amdgpu://`.
- Soporte de tool calling, agentes o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con AMD Strix Halo: un equipo con Ryzen AI Max+ 395 puede servir el modelo con `loom-serve --preset=chat --device=amdgpu://` sin GPU dedicada, aprovechando la memoria unificada para alojar pesos y proyector multimodal.
- Evaluación de motores de inferencia alternativos: la tarjeta sirve como banco de pruebas reproducible para comparar Loom frente a llama.cpp en el mismo hardware, con métricas de prefill y decode ya documentadas.
- Asistentes conversacionales con razonamiento visible: el modo thinking permite exponer la traza de razonamiento al usuario, útil en herramientas de depuración o tutoría donde interesa auditar el proceso, no solo la respuesta.
- Prototipado de pipelines multimodales: al cargar el proyector `mmproj-F16`, se puede experimentar con entrada de imagen en local antes de escalar a modelos mayores.
- Despliegue con verificación de integridad en entornos controlados: el pin de revisión y el chequeo sha256 de `loom-fetch` encajan en flujos donde la reproducibilidad del binario de pesos es un requisito.
- Aceleración de la generación en producción: el drafter DFlash eleva el decode de aproximadamente 61 a 103-108 tok/s en las mediciones de la tarjeta, lo que hace viable la respuesta interactiva en este hardware.
- Reproducción de experimentos: investigadores pueden replicar exactamente las condiciones de las mediciones publicadas (versiones de motor, revisiones y hashes están fijadas en la tarjeta).

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad tipo MMLU, HumanEval o GSM8K. Sí incluye mediciones de velocidad y de fidelidad de salida en AMD Ryzen AI Max+ 395 (gfx1151), con 4 rondas intercaladas y un servidor activo a la vez:

| Prompt | Métrica | llama.cpp | Loom raw | Loom via `1bit serve` |
|---|---|---|---|---|
| short | prefill tok/s | 261,8 [186,8-265,7] | 1328,5 [1314,6-1336,3] | 1249,4 [1243,3-1310,2] |
| short | decode tok/s (streamed) | 61,5 [60,7-62,2] | 105,2 [100,9-105,8] | 103,0 [100,8-105,6] |
| long2k | prefill tok/s | 2156,0 [2050,6-2234,2] | 3299,6 [3285,6-3302,7] | 3294,8 [3285,1-3296,9] |
| long2k | decode tok/s (streamed) | 59,0 [58,7-60,5] | 107,9 [95,0-111,3] | 107,9 [105,6-111,2] |

En fidelidad de salida, la puerta engine#3158 (greedy, thinking activado, 512 tokens, 8 prompts, comparación de la traza de razonamiento, sin logprobs en Loom) registra 0,0 % de coincidencia para esta tarjeta frente al 25,0 % de la ruta de referencia, un dato distorsionado por un salto de línea final que `loom-serve` conserva y llama.cpp elimina. Ignorando ese espacio en blanco en el borde, la cifra es 37,5 % frente a 25,0 %, con los otros cinco desgloses en cuasi-empates de 0,065 a 0,397 nats. La comprobación de renderizado de prompt da identificadores de token idénticos (23 con thinking off, 21 con thinking on) entre Loom y la plantilla del motor.

## Requisitos de hardware

- Hardware objetivo: exclusivamente AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), con el appliance "1bit OS". La tarjeta declara el soporte cerrado a esa plataforma.
- VRAM: no disponible como cifra explícita; al tratarse de memoria unificada en un SoC, los pesos `UD-Q4_K_XL` de un modelo de 4B más el proyector F16 y el drafter Q8_0 deben caber en la memoria compartida del sistema.
- GPUs dedicadas (A100, H100, RTX 4090): no soportadas por esta tarjeta, que fija `--device=amdgpu://` sobre gfx1151.
- Despliegue: `pipx install "hrx-loom[hf]==0.3.0"`, seguido de `loom-fetch` y `loom-serve --model=Qwen3.5-4B --preset=chat --device=amdgpu:// --pool_backing=fixed`.
- Rendimiento medido: prefill de 1249 a 3295 tok/s y decode de 103 a 108 tok/s con el drafter DFlash, frente a 262-2156 tok/s de prefill y 59-61 tok/s de decode en la ruta llama.cpp sobre el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| Qwen3.5-4B-GGUF-loom (esta tarjeta) | 4B (según nombre) | no disponible | Apache 2.0 | GGUF UD-Q4_K_XL + mmproj F16 + drafter Q8_0 | Loom sobre Strix Halo (gfx1151) |
| unsloth/Qwen3.5-4B-GGUF (upstream) | 4B (según nombre) | no disponible | Apache 2.0 (heredada) | GGUF | llama.cpp y otros runtimes GGUF |
| Qwen3.5-4B-DFlash-GGUF (magnitudedev) | 4B (drafter) | no disponible | Apache 2.0 | GGUF Q8_0 | Uso como drafter especulativo |

La comparación con alternativas de otros fabricantes o tamaños no está disponible en la información proporcionada. La diferencia principal frente al upstream es el empaquetado para Loom y la verificación de hashes, no el modelo en sí.

## Limitaciones y advertencias

- Restricción de hardware severa: solo funciona en AMD Ryzen AI Max+ 395 (gfx1151) con el appliance 1bit OS; no es portable a otras GPUs ni a CPU.
- El repositorio no contiene pesos: sin `loom-fetch` o una descarga manual del upstream en la revisión fijada, la tarjeta es inútil. Cualquier cambio en el repositorio upstream rompe la reproducibilidad si no se respeta el pin.
- Sin datos publicados de sesgos, alucinación o comportamiento multilingüe; la model card no aborda ninguna de estas dimensiones.
- La medición de fidelidad frente a llama.cpp es ambigua: el 0,0 % registrado por la herramienta contrasta con el 37,5 % tras normalizar espacios en blanco, y Loom no expone logprobs, por lo que no se puede calcular KLD en esa ruta.
- El tamaño real de contexto y los idiomas soportados no se documentan; no debe asumirse ninguna cifra.
- El rendimiento reportado corresponde a un único equipo y a versiones concretas de motor (hrx-loom 0.3.0, engine e697c40a0971, llama.cpp 9db01568b518); no es extrapolable.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los artefactos de terceros (drafter de magnitudedev, programas derivados de loom-fun) antes de un uso comercial.

## Enlaces

- Tarjeta en Hugging Face: https://huggingface.co/1bit-MONSTER/Qwen3.5-4B-GGUF-loom
- Modelo base (upstream): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Drafter especulativo: https://huggingface.co/magnitudedev/Qwen3.5-4B-DFlash-GGUF
- Repositorio del motor Loom (ROCm HRX): https://github.com/ROCm/hrx-system
- Tarjetas y herramientas loom-fun: https://huggingface.co/loom-fun
- Medición de la puerta engine#3158: https://github.com/1bit-MONSTER/engine/issues/3158#issuecomment-7115828650

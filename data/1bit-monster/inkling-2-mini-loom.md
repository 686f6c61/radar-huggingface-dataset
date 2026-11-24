# 1bit-MONSTER/Inkling-2-Mini-loom

## Resumen

Inkling-2-Mini-loom es una tarjeta de despliegue (Loom card) publicada por 1bit-MONSTER para ejecutar el modelo Inkling-2-Mini de Thinking Machines Lab sobre la pila de inferencia AMD Loom (hrx-system / hrx-loom), orientada a hardware AMD con GPU integrada Radeon 8060S (gfx1151, arquitectura Strix Halo). No contiene pesos: es un repositorio de programas, kernels y metadatos de enlace que apuntan al GGUF cuantizado UD-Q4_K_XL publicado por Unsloth, en su revisión `8078d149`.

La tarjeta deriva de la release r8 de loom-fun/unsloth-Inkling-2-Mini-loom (Apache-2.0) e introduce únicamente cambios de enlace (binding changes) para adaptarse al layout mainline `inkling2_loop` vigente desde el 23 de noviembre de 2026: renombrado de 48 tensores de control de bucle y división de dos tensores globales de loop-query en 12 tensores `loop_msg_query` por bloque. Los bytes de los tensores son idénticos a los de r8, por lo que el comportamiento numérico se mantiene.

Su relevancia es práctica: demuestra inferencia con decodificación especulativa (drafter DSpark en Q8_0) sobre una GPU integrada AMD, con velocidades medidas de aproximadamente 63 tok/s en decodificación en caliente y unos 2.072 tok/s de prefill en una prueba de aguja en 16,8K tokens. Es material de interés para quienes despliegan modelos en equipos de consumo AMD sin GPU discreta NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base emplea un esquema de bucle `inkling2_loop` con tensores de control `loop_*`; detalles no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se valida una prueba de aguja con 16,8K tokens, sin cifra oficial de ventana) |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (pesos principales); drafter DSpark en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (los pesos no se alojan en este repositorio; se leen desde unsloth/Inkling-2-Mini-GGUF) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. La información disponible indica que Inkling-2-Mini emplea un esquema de bucle con tensores de control (`loop_{q,k,v,ffn}_ctrl_*`) y tensores de consulta por bloque (`loop_msg_query`), lo que sugiere un mecanismo de reutilización de bloques o iteración sobre capas, pero no se detalla el número de capas, dimensiones ni el tipo exacto de atención. El autor del modelo base es Thinking Machines Lab; la cuantización GGUF la realiza Unsloth.

No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación. La innovación técnica documentada en esta tarjeta es de despliegue, no de entrenamiento: decodificación especulativa con el drafter DSpark (Q8_0) sobre el modelo principal en UD-Q4_K_XL, ejecutada mediante la pila Loom con `--pool_backing=fixed` y un `completion_spin_ns` máximo. La tarjeta verifica que el layout mainline produce la misma salida que la release r8 original en 8 de 8 prompts con decodificación greedy.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat, con plantilla de prompt que incluye una línea de sistema de nivel de esfuerzo de razonamiento ("Thinking effort level").
- Modo de razonamiento (thinking) activable; con thinking activado la plantilla renderiza 29 tokens de prompt, con thinking desactivado 27.
- Razonamiento aritmético básico verificado en pruebas (17*23 resuelto 3/3).
- Recuperación de información en contexto largo: prueba de aguja en 16,8K tokens con 3/3 aciertos.
- Decodificación especulativa integrada mediante drafter DSpark, con profundidad de borrador configurable (probada en 3).
- Ejecución en GPU AMD vía Loom (`amdgpu://`, gfx1151); no se documentan tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Despliegue de chat local en equipos AMD Strix Halo: la tarjeta está calibrada para Ryzen AI Max+ 395 con Radeon 8060S, permitiendo servir un modelo conversacional cuantizado en Q4 sin GPU discreta, con instrucciones de arranque reproducibles mediante `loom-fetch` y `loom-serve`.
- Asistentes con razonamiento visible: el modo thinking permite separar cadena de razonamiento de respuesta final, útil en herramientas de depuración o tutoría donde se quiere auditar el proceso.
- Procesamiento de documentos de longitud media: con prefill medido en torno a 2.072 tok/s a 16,8K tokens, resulta viable resumir o extraer información de contratos, informes o hilos de correo que no excedan ese orden de magnitud.
- Validación de motores de inferencia: la tarjeta incluye una fila de precisión comparada contra un árbitro llama.cpp en CPU, lo que la convierte en un banco de pruebas para verificar paridad numérica entre backends tras cambios de layout.
- Reproducción de resultados en investigación: los hashes sha256 en `PROVENANCE.json` y la comparación 8/8 con r8 permiten replicar experimentos de decodificación especulativa con trazabilidad de ficheros.
- Integración en pipelines de CI para kernels AMD: al no contener pesos, el repositorio se puede versionar y probar de forma ligera, descargando el GGUF por referencia en cada ejecución.
- Evaluación de cuantizaciones GGUF: sirve para comparar el comportamiento de UD-Q4_K_XL frente a otras cuantizaciones del mismo modelo base en hardware AMD.

## Benchmarks y rendimiento

| Prueba | Resultado | Entorno |
|---|---|---|
| Paridad con r8 (greedy chat, 8 prompts x 256 tokens, filas 1 y 32k, draft depth 3) | 8/8 coincidencias | Ryzen AI Max+ 395, Radeon 8060S, gfx1151, hrx-loom 0.3.0 |
| Decodificación en caliente (tarjeta vs r8) | 63,3 / 63,2 tok/s vs 63,0 / 64,0 tok/s | mismo entorno |
| Fila de precisión #3158 (Loom vs llama.cpp CPU, 8 prompts, thinking on, 768 tokens) | precondición de renderizado 29 = 29; regla de casi-empate 8/8 (4 idénticos, 4 divisiones dentro de 0,031-0,263 nat) | motor 1bit-MONSTER, 24 nov, strixhalo |
| Aritmética 17*23 | 3/3 aciertos, ~91,6 tok/s decode | mismo entorno |
| Aguja en 16,8K tokens | 3/3 aciertos, ~2.072 tok/s prefill, ~54 tok/s decode | mismo entorno |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no disponible con cifra exacta; el modelo se ejecuta en una GPU integrada Radeon 8060S con memoria unificada, sobre Ryzen AI Max+ 395.
- GPU validadas: AMD Radeon 8060S (gfx1151, Strix Halo). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí, en el sentido de hardware integrado AMD; no hay datos para GPUs discretas de consumo.
- Despliegue: pila Loom mediante `pipx install "hrx-loom[hf]==0.3.0"`, `loom-fetch` para materializar el modelo y `loom-serve` con `--device=amdgpu://?completion_spin_ns=4294967295` y `--pool_backing=fixed`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta tarjeta, aunque llama.cpp se usa como árbitro en CPU para la validación de precisión.
- Rendimiento medido: ~63 tok/s de decodificación en caliente, ~91,6 tok/s en respuestas cortas, ~54 tok/s de decodificación tras un prefill de 16,8K tokens y ~2.072 tok/s de prefill en ese mismo caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-loom (esta tarjeta) | no disponible | no disponible | Apache-2.0 | GGUF UD-Q4_K_XL + drafter Q8_0 | Tarjeta de despliegue para AMD Loom, sin pesos |
| loom-fun/unsloth-Inkling-2-Mini-loom r8 | no disponible | no disponible | Apache-2.0 | GGUF (layout previo) | Misma salida 8/8; esta tarjeta solo cambia enlaces |
| unsloth/Inkling-2-Mini-GGUF | no disponible | no disponible | no disponible | GGUF | Repositorio de pesos de origen, revisión 8078d149 |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos; sin acceso a unsloth/Inkling-2-Mini-GGUF en la revisión `8078d149` la tarjeta no es funcional.
- Solo está validada en AMD gfx1151 (Strix Halo) con hrx-loom 0.3.0; no hay garantías en otras GPUs ni versiones del runtime.
- Con thinking desactivado, el prompt renderizado por la tarjeta es de 27 tokens frente a los 29 de la plantilla del modelo (falta la línea de sistema "Thinking effort level: 0"), lo que puede alterar sutilmente el comportamiento respecto a otros runners.
- La validación de precisión se limita a 8 prompts y 768 tokens con thinking activado; la cobertura estadística es reducida.
- No se documentan sesgos, tasas de alucinación, idiomas soportados ni limitaciones de contexto oficiales del modelo base.
- Aunque la licencia declarada es Apache-2.0, conviene verificar las condiciones del modelo base y del GGUF de Unsloth antes de uso comercial, ya que esta tarjeta solo cubre los programas de enlace.
- El rendimiento medido corresponde a un único equipo; el throughput puede variar con la carga, la temperatura y la configuración de memoria unificada.

## Enlaces

- Tarjeta en Hugging Face: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Release de origen: https://huggingface.co/loom-fun/unsloth-Inkling-2-Mini-loom
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Herramientas loom-skills: https://github.com/loom-fun/loom-skills

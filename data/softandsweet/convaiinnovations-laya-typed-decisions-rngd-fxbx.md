# softandsweet/convaiinnovations-laya-typed-decisions-rngd-fxbx

## Resumen

`convaiinnovations-laya-typed-decisions-rngd-fxbx` es un artefacto derivado publicado por el usuario `softandsweet` a partir del modelo base `convaiinnovations/laya-typed-decisions`. No se trata de un modelo de lenguaje generativo en el sentido habitual, sino de un *plan de ejecucion* precompilado en FP32 orientado al hardware NPU RNGD de Furiosa. El repositorio contiene los pesos reconvertidos a safetensors junto con un script (`run.py`) y un paquete Python (`fxbx`) que permite ejecutar la inferencia sobre el compilador Furiosa Torch y la version de TCC 2026.4.0.

El objetivo declarado del autor es demostrar la ejecucion de una carga de trabajo muy concreta (42 tokens de entrada, batch de 1, 3 opciones de decision) sobre un acelerador RNGD, verificando que las etapas NPU se ejecutan sin caer en el fallback de CPU ni en recompilaciones. El modelo base apunta a un caso de uso de "decisiones tipadas" (typed decisions), es decir, seleccionar entre un conjunto finito de opciones en funcion de una entrada corta, no a generar texto libre.

Su relevancia practica es limitada para el desarrollador medio: no hay model card tecnica detallada, no se publican benchmarks, no se declaran idiomas y el repositorio tiene cero descargas. Resulta interesante como ejemplo de empaquetado de pesos para un backend NPU especifico (Furiosa RNGD) y como referencia de reproducibilidad, pero no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `convaiinnovations/laya-typed-decisions`, orientado a decisiones tipadas con salida de dos logits) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la carga de referencia usa 42 tokens de entrada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en FP32 |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (plan de ejecucion FP32) + `weights.tar` + indice de pesos `fxbx` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `convaiinnovations/laya-typed-decisions`: ni tipo de transformer, ni numero de capas, ni dimensiones ocultas, ni regimen de entrenamiento. La model card del derivado no describe datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de alineacion (RLHF, DPO u otras). Tampoco se documenta ninguna innovacion arquitectonica (atencion lineal, decodificacion especulativa, SSM, etc.).

La unica informacion tecnica disponible se refiere al *runtime*: el autor ha reconstruido los pesos originales en un plan de ejecucion FP32 sobre safetensors, compatible con el driver RNGD, Furiosa Torch y TCC 2026.4.0, con PyTorch 2.10.0+cpu. El paquete se instala con `python -m pip install 'fxbx[weights]==0.8.4'`. La entrada de la muestra son cinco tensores `int32` y la salida se contrasta contra una referencia en CPU comparando dos logits. En cinco ejecuciones sobre el servidor 5 se observaron 7.126 etapas NPU por ejecucion, cero fallbacks a CPU y cero recompilaciones, con un tiempo de profiling de 0,88-1,00 s. La validacion se hizo con fxbX 0.8.3; la version 0.8.4 solo se verifico en la lectura del plan de ejecucion y del indice de pesos.

## Capacidades

- Ejecucion de una tarea de clasificacion/decision con dos logits de salida, segun la muestra incluida.
- Inferencia sobre hardware NPU Furiosa RNGD mediante el plan de ejecucion FP32.
- Compatibilidad con el paquete `fxbx` version 0.8.4 (instalacion de pesos e indice).
- Entrada de cinco tensores `int32` en el ejemplo de referencia.
- No hay evidencia de generacion de texto libre, razonamiento multi-paso, uso de herramientas, codigo, matematicas, vision ni audio.
- No se declaran capacidades multilingues ni modos especiales (thinking, vision, audio).

## Casos de uso

- Validacion de toolchain NPU: usar el repositorio como prueba de humo para verificar que un entorno Furiosa RNGD + Furiosa Torch + TCC compila y ejecuta un plan sin fallback a CPU.
- Benchmarking de compiladores: comparar el numero de etapas NPU (7.126 en la referencia) y la ausencia de recompilaciones entre versiones de `fxbx` o del compilador.
- Reproduccion de artefactos: comprobar la fidelidad entre los pesos del modelo base y el plan FP32 reconstruido comparando los dos logits contra la referencia en CPU.
- Integracion en pipelines de decision acotada: si el modelo base se confirma como clasificador de opciones tipadas, encaja en flujos donde la salida es una eleccion entre tres alternativas, aunque el derivado no documenta el preprocesado real.
- Docencia e investigacion sobre despliegue en aceleradores: ejemplo minimo de como empaquetar pesos safetensors para un backend no convencional.
- Regresion continua de entornos: usar `run.py` como test en CI para detectar roturas de compatibilidad con PyTorch 2.10.0+cpu y TCC 2026.4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento son los del propio autor para el plan de ejecucion: 7.126 etapas NPU por ejecucion, 0 fallbacks a CPU, 0 recompilaciones y 0,88-1,00 s de tiempo de profiling en cinco ejecuciones sobre el servidor 5. No se especifica el hardware exacto (modelo de tarjeta RNGD) ni el throughput en tokens/s.

## Requisitos de hardware

- Acelerador NPU Furiosa RNGD, con driver compatible y Furiosa Torch; el plan esta pensado para ese backend, no para GPU convencional.
- Entorno de software: TCC 2026.4.0 y PyTorch 2.10.0+cpu.
- Paquete Python: `fxbx[weights]==0.8.4` (validado con 0.8.3 en la ejecucion de referencia).
- VRAM estimada para GPU: no disponible; el repositorio pesa 1,7 GB, lo que da una cota superior grosera del espacio en disco necesario para pesos y artefactos.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no documentada; el artefacto esta orientado a NPU RNGD.
- Opciones de despliegue conocidas: `python run.py` tras descomprimir `weights.tar`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,88-1,00 s por ejecucion de profiling en la configuracion del autor (batch 1, 42 tokens de entrada).
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (planes de ejecucion empaquetados para NPU Furiosa RNGD con pesos derivados de un modelo base de decisiones tipadas).

## Limitaciones y advertencias

- Ausencia total de model card tecnica: sin arquitectura, parametros, contexto, idiomas ni datos de entrenamiento. No es posible evaluar calidad del modelo base a partir de este repositorio.
- Cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion independiente.
- El autor declara pruebas solo en un servidor y con cinco ejecuciones; la validacion de `fxbx` 0.8.4 se limita a la lectura del plan y del indice, no a la inferencia completa.
- Dependencia fuerte de un stack propietario y versionado (RNGD, Furiosa Torch, TCC 2026.4.0, PyTorch 2.10.0+cpu); cualquier cambio de version puede invalidar el plan.
- Riesgo de alucinacion: no evaluable; no hay evidencia de que el modelo genere texto libre.
- Sesgos: no documentados.
- Restricciones de licencia: Apache-2.0 en el derivado y en el modelo base declarado, lo que permite uso comercial, pero conviene verificar la licencia del modelo base original antes de redistribuir.
- La fecha de creacion del repositorio (2026-11-13) y las versiones de software referenciadas (TCC 2026.4.0, PyTorch 2.10.0) no se han podido contrastar con fuentes externas en la informacion disponible.
- No sirve como sustituto de un LLM de proposito general: la carga descrita es una decision con dos logits, no generacion abierta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/softandsweet/convaiinnovations-laya-typed-decisions-rngd-fxbx
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Revision concreta del modelo base citada por el autor: https://huggingface.co/convaiinnovations/laya-typed-decisions/tree/e929ae5cf69bc34259cd2f95c9e91145b818b1f0
- Furiosa AI (fabricante del acelerador RNGD): https://furiosa.ai
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada.

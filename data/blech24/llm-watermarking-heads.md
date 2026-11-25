# Blech24/llm-watermarking-heads

## Resumen

`Blech24/llm-watermarking-heads` no es un modelo de lenguaje generativo, sino una coleccion de 12 redes de politica ("heads") de pequeno tamano entrenadas para insertar y detectar marcas de agua en codigo generado por LLM. Cada head lee los dos tokens anteriores y produce una green list (la mitad superior del vocabulario segun sus logits) junto con un interruptor que decide si esa posicion se marca; durante la generacion se suma delta a los logits de la green list donde el interruptor esta activo. La deteccion es ciega: solo necesita el head y el tokenizer, no el LLM ni el prompt, y aplica un z-test de una proporcion sobre las posiciones marcadas.

El trabajo se enmarca en el proyecto de curso "Who wrote this code?" y sigue la arquitectura `CodeModel` de CodeTracer: 6 capas transformer, d=512, 8 cabezas de atencion, FF 2048, anchura de contexto 2 y unos 118 M de parametros. Los heads se entrenan sobre rollouts de MBPP-train a temperatura 0.8 durante 760-1.000 pasos, con un entrenador de gradiente de politica estilo GRPO y un surrogate diferenciable de deteccion soft-z con contraste nulo.

Su relevancia es doble: por un lado aborda la atribucion de codigo generado por IA mediante marcas de agua robustas a refactorizacion (ruff, renombrado de identificadores, eliminacion de comentarios), donde alcanza AUROC de 64-74 frente a 53-57 de las lineas base SWEET y WLLM; por otro, documenta con honestidad sus limitaciones, incluyendo que sin ediciones SWEET detecta mejor y que el umbral fijo z>4 esta mal calibrado para estos heads.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 6 capas (CodeTracer `CodeModel`), d=512, 8 cabezas de atencion, FF 2048, anchura de contexto 2, dropout 0 |
| Parametros totales | ~118 M por head (12 heads en total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2 tokens previos (ventana de contexto del head) |
| Tipos de cuantizacion | no disponible (pesos guardados en fp16) |
| Idiomas soportados | Python principalmente; evaluacion parcial en JavaScript y Java (transferencia debil) |
| Licencia | MIT |
| Formato de pesos | `.pt` (`torch.save` dict con `state_dict` fp16, `vocab`, `context_width`, `gamma`, `delta`, `model`, `variant`, `step`) |
| Tamano del repo | 3,3 GB |
| Modelos base | `infly/OpenCoder-1.5B-Instruct` (vocab 96.640), `Qwen/Qwen2.5-Coder-1.5B-Instruct` (vocab 151.936) |
| Libreria | pytorch |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Cada head es una red transformer pequena que opera sobre una ventana de 2 tokens y emite dos salidas: una green list (la mitad superior del vocabulario ordenada por logits del head) y un interruptor binario por posicion. En generacion, el `PolicyProcessor` suma `delta=2.0` a los logits de la green list en las posiciones donde el interruptor esta activo, con `gamma=0.5` como fraccion de vocabulario marcada. La deteccion usa `detect(head, token_ids, prompt_len)`, que ejecuta un z-test de una proporcion sobre las posiciones con interruptor activo, sin acceso al LLM ni al prompt original.

El entrenamiento se realizo sobre rollouts de MBPP-train a temperatura 0.8 durante 760-1.000 pasos, con un entrenador de gradiente de politica estilo GRPO y un surrogate diferenciable de deteccion soft-z con contraste nulo. Las variantes documentadas incluyen `tests` (recompensa de funcionalidad via tests unitarios), `static` (recompensa via analisis estatico), `-rob` (recompensa adicional de robustez a refactorizacion), `-s1` (semilla 1), `tests-nosur` (ablacion sin surrogate de deteccion) y `tests-nonull` (ablacion sin contraste nulo). El autor advierte que estos no son los checkpoints originales de CodeTracer: su receta requiere una A100 y esa ejecucion sigue pendiente.

## Capacidades

- Insercion de marcas de agua en codigo generado por OpenCoder-1.5B-Instruct y Qwen2.5-Coder-1.5B-Instruct mediante procesado de logits.
- Deteccion ciega de marca de agua: solo requiere el head y el tokenizer, no el modelo generador ni el prompt.
- Deteccion sobre posiciones marcadas con z-test de una proporcion y umbral calibrado empiricamente.
- Robustez parcial a refactorizacion de codigo (ruff, renombrado de identificadores, eliminacion de comentarios) en tareas Python.
- Variantes con distintas recompensas: funcionalidad por tests unitarios, analisis estatico y robustez a refactorizacion.
- Soporte de dos vocabularios distintos (96.640 y 151.936 tokens) segun el modelo base.
- No incluye generacion de texto, razonamiento general, tool calling ni capacidades multimodales: es infraestructura de watermarking, no un LLM.

## Casos de uso

- Atribucion de codigo generado por IA en pipelines de CI/CD: integrar el `PolicyProcessor` en `model.generate(...)` para que cada fragmento generado lleve marca, y ejecutar `detect` en revisiones posteriores para identificar procedencia.
- Deteccion de codigo generado por modelos open source en repositorios: el detector ciego permite auditar codigo sin conocer el prompt ni el modelo que lo genero, util para compliance de licencias.
- Investigacion en watermarking robusto: las variantes `tests`, `static`, `-rob` y las ablaciones permiten comparar recetas de recompensa y medir su efecto en AUROC y TPR.
- Evaluacion de robustez frente a refactorizacion: usar el harness del repositorio (HumanEval, MBPP-test, HumanEvalPack Python/JavaScript/Java) para medir la degradacion de deteccion tras aplicar ruff, renombrado y eliminacion de comentarios.
- Formacion y docencia: el proyecto esta dimensionado para 2x T4, lo que permite reproducir el entrenamiento y las ablaciones en hardware asequible.
- Analisis forense de codigo sospechoso: aplicar `detect` sobre tokenizaciones de fragmentos para obtener un z-score y un recuento de posiciones verdes, con umbral calibrado sobre un nulo empirico.
- Comparativa de metodos de watermarking: el harness unificado permite contrastar estos heads con SWEET y WLLM sobre las mismas tareas y muestras.

## Benchmarks y rendimiento

Resultados en held-out, 5 muestras por problema a T=0.2 y delta=2.0, medias sobre HumanEval, MBPP-test y HumanEvalPack Python/JavaScript/Java. Negativos: soluciones humanas de referencia y generaciones sin marca.

| Modelo | Metodo | pass@1 delta (pts) | AUROC | TPR a 5 % FPR | FPR a z>4 | AUROC tras refactor* |
|---|---|---|---|---|---|---|
| OpenCoder | SWEET (baseline) | -0,8 | 84,2 | 34,9 | 0,0 % | 52,9 |
| OpenCoder | WLLM (baseline) | -4,5 | 68,8 | 16,2 | 1,8 % | 56,5 |
| OpenCoder | heads (6, sin ablaciones) | -1,2 a -5,4 | 72,6 a 79,4 | 14,8 a 26,4 | 5,9 a 20,3 % | 63,8 a 72,1 |
| OpenCoder | `tests-nosur` | -2,8 | 80,8 | 37,3 | 0,8 % | 65,7 |
| Qwen | SWEET (baseline) | -3,6 | 87,7 | 49,6 | 0,0 % | 54,8 |
| Qwen | WLLM (baseline) | -6,5 | 73,7 | 25,8 | 0,1 % | 57,4 |
| Qwen | heads (4) | -3,3 a -6,3 | 71,9 a 75,4 | 20,2 a 23,3 | 23,2 a 33,0 % | 69,7 a 74,1 |

\* Tareas Python tras refactor combinado (ruff + renombrado de identificadores + eliminacion de comentarios), aplicado tambien a los negativos.

Datos adicionales: los heads de Qwen alcanzan 88-90 AUROC en MBPP-test, pero la transferencia a JavaScript y Java es debil. `tests-nonull` es una ablacion negativa (AUROC 58, FPR 94 %). La evaluacion frente a parafraseo con Llama-3.1-8B y Qwen2.5-Coder-7B sigue en curso.

## Requisitos de hardware

- VRAM estimada: cada head tiene ~118 M parametros en fp16, aproximadamente 0,24 GB por head; los 12 heads juntos ocupan unos 2,8 GB en fp16.
- El head se ejecuta en CPU sin problema (`map_location="cpu"` en el ejemplo del autor); la GPU solo es necesaria para el modelo generador base (OpenCoder-1.5B o Qwen2.5-Coder-1.5B).
- GPU recomendadas: cualquier GPU consumer con suficiente VRAM para el modelo base de 1,5 B; el entrenamiento esta dimensionado para 2x T4.
- Cabe en GPU consumer: si, tanto los heads como los modelos base de 1,5 B en cuantizacion razonable.
- Opciones de despliegue: integracion directa con `transformers` mediante `logits_processor=[PolicyProcessor(head, gamma=0.5, delta=2.0)]`; la deteccion se ejecuta con `detect(head, token_ids, prompt_len)` desde `wm_policy` del repositorio GitHub.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Metodo | Tipo | AUROC sin edicion (OpenCoder / Qwen) | AUROC tras refactor (OpenCoder / Qwen) | Coste pass@1 (pts) | Licencia |
|---|---|---|---|---|---|
| Heads (este repo) | Red de politica aprendida | 72,6-79,4 / 71,9-75,4 | 63,8-72,1 / 69,7-74,1 | -1,2 a -5,4 / -3,3 a -6,3 | MIT |
| SWEET | Baseline de watermarking | 84,2 / 87,7 | 52,9 / 54,8 | -0,8 / -3,6 | no disponible |
| WLLM | Baseline de watermarking | 68,8 / 73,7 | 56,5 / 57,4 | -4,5 / -6,5 | no disponible |

Los heads sacrifican deteccion sin edicion frente a SWEET a cambio de mayor robustez tras refactorizacion, con un coste en pass@1 comparable o ligeramente superior segun variante.

## Limitaciones y advertencias

- Sin ediciones, SWEET detecta mejor que todos los heads en ambos modelos base.
- El umbral fijo z>4 esta mal calibrado para los heads: entre el 6 % y el 33 % de codigo sin marca supera ese umbral (hasta el 48 % en una tarea). Debe usarse un umbral de nulo empirico.
- Los heads rinden mejor en su distribucion de entrenamiento; la transferencia a JavaScript y Java es debil.
- El surrogate de deteccion no aporto mejoras en held-out: `tests-nosur` es el mejor head de OpenCoder.
- La recompensa de robustez a refactorizacion (`-rob`) no ayuda de forma fiable y la varianza entre semillas es alta.
- `tests-nonull` es una ablacion negativa (AUROC 58, FPR 94 %) conservada por completitud.
- La evaluacion frente a parafraseo con LLM sigue en curso; un smoke test sugiere que el parafraseo elimina WLLM/SWEET y que los z altos de los heads sobre codigo parafraseado se deben a la mala calibracion, no a una marca superviviente.
- Los `.pt` son pickles: cargar solo con `torch.load` desde una fuente de confianza.
- No son los checkpoints originales de CodeTracer; la receta completa requiere A100 y esta pendiente.
- Licencia MIT, permite uso comercial, pero el autor no ofrece garantias de rendimiento en produccion.
- Riesgo de sesgo y alucinacion no aplica en el sentido habitual al no ser un modelo generativo, pero la deteccion puede producir falsos positivos severos si no se calibra el umbral.

## Enlaces

- Hugging Face: https://huggingface.co/Blech24/llm-watermarking-heads
- Repositorio GitHub del proyecto: https://github.com/sushant-k-ray/LLM-Watermarking
- Modelo base OpenCoder: https://huggingface.co/infly/OpenCoder-1.5B-Instruct
- Modelo base Qwen2.5-Coder: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct

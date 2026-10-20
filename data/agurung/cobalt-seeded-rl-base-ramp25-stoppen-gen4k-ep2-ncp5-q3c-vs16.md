# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-vs16

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) para Qwen3-4B, entrenado con OpenRLHF y el algoritmo GRPO, y guardado en el paso global 48 del run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_q3c_vs16`. No es un modelo nuevo desde cero: parte de la familia Qwen3 y conserva su arquitectura, con 4.411.424.256 parámetros totales. El autor lo presenta como el mejor checkpoint del run según pass@8, aunque no publica el valor numérico de esa métrica.

El entrenamiento se centra en generación de código verificable: el reward es binario y vale 1,0 si el programa generado pasa los tests del problema, y 0,0 en caso contrario. Se usaron 1.833 problemas de entrenamiento y 112 de validación procedentes del frente `cobalt-train ≤2/64`, es decir, problemas que el modelo base resolvía como máximo en 2 de 64 muestras bajo el escaneo de dureza `iid_canonical@64`.

Su interés principal es la investigación en RL post-entrenamiento y en selección de checkpoints para código, no tanto el despliegue como asistente generalista. La model card declara como base `Qwen/Qwen3-4B-Instruct-2507`, pero también indica que el checkpoint se sembró desde el modelo base Qwen3-4B sin SFT; esta discrepancia no se aclara y conviene verificarla antes de reutilizarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parámetros totales | 4.411.424.256 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base declarado | Qwen/Qwen3-4B-Instruct-2507 |
| Revisión de carga | `main` |
| Tamaño del repositorio | 105,9 GB |
| Descargas en HuggingFace | 1.086 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B: un transformer decoder-only denso, sin cambios estructurales documentados. El repositorio contiene pesos ajustados mediante RL, no una arquitectura nueva. El entrenamiento se realizó con OpenRLHF y GRPO, con ventajas normalizadas por grupo y sin penalización KL. Se aplicó una penalización de tipo stop-properly: las muestras truncadas reciben reward -1,0, y una penalización DAPO para respuestas largas que crece hasta -0,25 en los últimos 1.024 tokens antes del límite.

Los hiperparámetros documentados son: 8 muestras por prompt, batch de rollout de 128, batch de entrenamiento de 128, máximo de 4.096 tokens nuevos por rollout, 2 episodios y learning rate del actor de 1e-6 con schedule constante. El conjunto de entrenamiento tiene 1.833 problemas y el de validación 112, todos dentro del frente `cobalt-train ≤2/64`; la validación se muestrea con temperatura 1,0. El reward es binario de correctitud de código. El checkpoint se guardó en el paso global 48 y el autor lo marca como el mejor por pass@8 del run, aunque no hay métricas de evaluación numéricas en el registro de entrenamiento.

## Capacidades

- Generación de texto y de código, coherente con el pipeline `text-generation` y con el entrenamiento específico en problemas de programación.
- Generación de soluciones candidatas para problemas de código con verificación mediante tests, optimizada para mejorar pass@8.
- Muestreo múltiple y selección best-of-N: el entrenamiento usa 8 muestras por prompt, por lo que el checkpoint está orientado a explorar varias soluciones y filtrarlas por correctitud.
- Razonamiento multi-paso: no documentado explícitamente en la información disponible.
- Tool calling o function calling: no documentado en la información disponible.
- Uso como agente o en flujos multi-turno con herramientas: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; no se especifican idiomas soportados.
- Modo thinking o razonamiento explícito: no documentado en la información disponible.
- Vision o audio: no disponibles; el modelo es de texto.
- Contexto largo: no disponible; no se documenta la longitud máxima de contexto.

## Casos de uso

- Investigación en RL para generación de código: permite reproducir o analizar un run GRPO con reward binario de correctitud, incluyendo el efecto de las penalizaciones por truncamiento y por longitud.
- Evaluación de checkpoints intermedios: al estar guardado en el paso global 48 y marcado como mejor por pass@8, sirve para estudiar criterios de selección de checkpoints dentro de un mismo run.
- Generación de candidatos en problemas de programación: se pueden muestrear varias soluciones por enunciado y ejecutar los tests del problema para quedarse con las correctas, un flujo adecuado para entornos offline de evaluación.
- Creación de datasets de código filtrados: generar soluciones, validarlas con tests y conservar únicamente las que pasan, reduciendo el ruido en datos sintéticos posteriores.
- Best-of-N en pipelines de evaluación: usar el modelo para producir N candidatos y un ejecutor de tests como verificador, midiendo pass@N en lugar de depender de una única generación.
- Estudio de robustez frente a respuestas largas: las penalizaciones DAPO y stop-properly permiten analizar cómo cambia el comportamiento del modelo cerca del límite de 4.096 tokens nuevos.
- Baseline para fine-tuning posterior: puede servir como inicialización para experimentos de RL o SFT en dominios de código con verificación automática.
- Servicio interno de generación de código para evaluación: se puede desplegar con vLLM o Transformers para pruebas controladas, siempre con ejecución en sandbox y sin asumir uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| pass@8 en valid

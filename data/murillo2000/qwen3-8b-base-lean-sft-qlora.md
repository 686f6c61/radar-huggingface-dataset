# murillo2000/qwen3-8b-base-lean-sft-qlora

## Resumen

`murillo2000/qwen3-8b-base-lean-sft-qlora` es un adaptador LoRA (PEFT) entrenado mediante QLoRA sobre el modelo base `Qwen/Qwen3-8B-Base`, especializado en la generación de demostraciones formales en Lean para teoremas del repositorio mathlib. Lo desarrolla el proyecto qwen-lean (autor murillo2000) y constituye el primer ciclo completo de fine-tuning supervisado (SFT) de dicho proyecto. El objetivo es mejorar la capacidad del modelo base para generar pruebas completas de teoremas matemáticos verificadas por el verificador Lean, un problema relevante para la formalización de matemáticas y la verificación automática.

El adaptador se entrenó sobre 79.696 pares teorema-demostración extraídos de mathlib, con una longitud máxima de secuencia de 1.024 tokens y una única época. La arquitectura subyacente es un transformer decoder denso de 8.000 millones de parámetros (Qwen3-8B-Base), sobre el cual se aplican adaptadores de bajo rango en todas las proyecciones de atención y de la MLP. El adaptador se distribuye como un repositorio PEFT independiente, sin los pesos del modelo base, que deben descargarse por separado. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-8B-Base) + adaptador LoRA |
| Parametros totales | 8.000 millones (modelo base) + adaptador LoRA (tamano de repo 0,2 GB; parametros exactos del adaptador no disponibles) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (modelo base); entrenamiento SFT limitado a 1.024 tokens |
| Tipos de cuantizacion | Base entrenado en 4-bit NF4 con doble cuantizacion; adaptador en BF16 (se puede cuantizar el conjunto fusionado) |
| Idiomas soportados | No disponibles para el adaptador; el modelo base Qwen3 soporta multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-8B-Base, un transformer decoder causal con atención de ventana completa (no usa atención lineal ni MoE). El entrenamiento empleó QLoRA con rango r=16, lora_alpha=32, dropout 0,0 y sin bias, aplicando los adaptadores a las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La base se congeló y se cuantizó a 4-bit NF4 con doble cuantización y cómputo en BF16.

El corpus de entrenamiento proviene de pares teorema-demostración verificados por Lean en mathlib. Se usó una pérdida de modelado causal solo sobre la completación (incluyendo el token EOS terminal), enmascarando el prompt y el padding. No se aplicó empaquetado ni truncamiento silencioso. La configuración incluyó micro-batch de 1 por dispositivo, acumulación de gradientes de 8 (batch efectivo de 8), optimizador AdamW paginado de 8 bits, tasa de aprendizaje 1e-4 con programación coseno y una única época completa. El checkpoint seleccionado (paso 9962) se eligió por tener la menor entropía cruzada media en el conjunto de validación, sin consultar resultados de held-out ni miniF2F durante la selección.

No se aplicó plantilla de chat durante el entrenamiento; el modelo aprendió completación causal simple bajo los contratos `whole-proof-v1` y `mathlib-sft-v1`.

## Capacidades

- Generación de demostraciones completas en Lean para teoremas de mathlib, verificadas por el verificador Lean.
- Razonamiento matemático formal en el dominio de mathlib, incluyendo álgebra, análisis y teoría de números.
- No soporta tool calling ni function calling de propósito general; su salida es texto de prueba Lean.
- No es un modelo de chat; no tiene plantilla de chat y no está diseñado para conversación.
- Capacidades multilingües no establecidas; el entrenamiento se limitó a código Lean y matemáticas.
- Sin modo de pensamiento explícito ni capacidades multimodales.

## Casos de uso

- Formalización de teoremas matemáticos: el modelo puede generar esqueletos de demostración para teoremas de mathlib, que un matemático puede completar o corregir, acelerando el proceso de formalización en Lean.
- Verificación automática de pruebas: integrado en un pipeline que invoca a Lean, el modelo propone candidatos de prueba que se verifican automáticamente, reduciendo el esfuerzo manual.
- Asistente para el desarrollo de bibliotecas formales: ayuda a generar lemas intermedios o pasos de razonamiento en proyectos como mathlib, donde la demanda de pruebas supera la capacidad de los contribuyentes.
- Educación en demostración asistida por ordenador: el modelo puede generar ejemplos de pruebas correctas para que estudiantes de Lean estudien patrones de razonamiento formal.
- Benchmarking de agentes de razonamiento matemático: sirve como referencia para evaluar métodos de búsqueda de pruebas o estrategias de decodificación (muestreo, best-of-n) en tareas como miniF2F.
- Integración en entornos de prueba interactiva: como backend de generación automática en editores de Lean (VS Code, Emacs), ofreciendo sugerencias de pasos de prueba al usuario.

## Benchmarks y rendimiento

Se reportan resultados basados en verificación con Lean (no coincidencia exacta de cadenas). La evaluación sobre 512 teoremas held-out de mathlib con 4 candidatos muestreados por tarea:

| Modelo | pass@1 | pass@4 |
| --- | ---: | ---: |
| Qwen3-8B-Base | 0,001953125 | 0,0078125 |
| Phase 5 SFT adapter | 0,0166015625 | 0,048828125 |

Evaluación sobre las 244 teoremas de validación de miniF2F con 8 candidatos por tarea:

| Modelo | pass@1 | pass@4 | pass@8 |
| --- | ---: | ---: | ---: |
| Qwen3-8B-Base | 0,0128073770 | 0,0477166276 | 0,0860655738 |
| Phase 5 SFT adapter | 0,0394467213 | 0,1031615925 | 0,1434426230 |

No se evaluó miniF2F test. Los resultados de validación no se usaron para seleccionar el checkpoint. No se reportan benchmarks de capacidades generales (MMLU, HumanEval, etc.) porque el modelo está especializado en demostración de teoremas.

## Requisitos de hardware

- Para cargar el modelo base Qwen3-8B-Base en BF16 se necesitan aproximadamente 16 GB de VRAM; el adaptador LoRA añade un overhead mínimo (menos de 1 GB).
- Con cuantización 4-bit del modelo base (por ejemplo, NF4), la VRAM requerida baja a unos 6-7 GB, permitiendo ejecución en GPUs de consumo como RTX 3090 o RTX 4090.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para inferencia sin cuantizar; A100 (40/80 GB) para entrenamiento o inferencia con lotes grandes.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM (soporta LoRA en servidores de inferencia), llama.cpp (si se fusiona el adaptador con el base y se convierte a GGUF).
- La latencia es similar a la del modelo base de 8B; con una RTX 4090 en BF16, el throughput típico es de 50-100 tokens/s dependiendo de la longitud de generación. No se dispone de mediciones específicas del adaptador.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros adaptadores o modelos especializados en demostración de teoremas en Lean (por ejemplo, ReProver o modelos entrenados por LeanDojo). La comparación más directa es contra el modelo base sin adaptar, que muestra mejoras claras en pass@k tanto en mathlib held-out como en miniF2F. Otros modelos de propósito general (GPT-4, Claude) no son comparables por su naturaleza propietaria y su menor especialización en Lean. Se recomienda consultar la literatura de LeanDojo y ReProver para referencias adicionales.

## Limitaciones y advertencias

- El adaptador solo ha sido entrenado en el dominio de mathlib; su comportamiento fuera de ese dominio no está establecido y puede producir salidas incorrectas o sin sentido.
- La tarea es generación de pruebas completas sin búsqueda de tácticas; no hay razonamiento interactivo ni corrección de errores durante la generación.
- La longitud máxima de secuencia de entrenamiento fue de 1.024 tokens; teoremas que requieran demostraciones más largas pueden no generarse correctamente.
- Se entrenó una única época; no se ha explorado un entrenamiento más prolongado ni ajuste de hiperparámetros.
- Los resultados de miniF2F son sobre validación, no sobre test; el rendimiento en test podría ser inferior.
- No se aplicó plantilla de chat; usar el modelo con una plantilla de chat puede degradar el rendimiento.
- El repositorio no incluye los pesos del modelo base; es necesario descargarlos por separado y verificar las revisiones exactas para reproducir los resultados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-8B-Base tiene su propia licencia (Apache-2.0 también, según el repositorio oficial), que debe respetarse.
- Riesgo de alucinación en la generación de pruebas: el modelo puede producir código Lean sintácticamente válido pero lógicamente incorrecto; siempre debe verificarse con Lean.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/murillo2000/qwen3-8b-base-lean-sft-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Proyecto qwen-lean (GitHub): https://github.com/murillo128/qwen-lean
- Issue de la fase 5: https://github.com/murillo128/qwen-lean/issues/19
- Pull request con implementación y evidencias: https://github.com/murillo128/qwen-lean/pull/20
- Paper técnico de Qwen3: https://arxiv.org/pdf/2505.09388

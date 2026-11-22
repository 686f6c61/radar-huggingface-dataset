# NeoCortex0815/Qwen3.5-0.8B-WT-A

## Resumen

Qwen3.5-0.8B-WT-A es un modelo de investigación publicado por Dave Uhlemann (NeoCortex), investigador independiente, como artefacto asociado al informe *Knowing Is Not Committing* (v0.5, sin revisión por pares). Se construye sobre Qwen/Qwen3.5-0.8B (revisión `2fc0636`) mediante dos ediciones directas en el espacio de pesos, sin entrenamiento adicional: una dirección de bucle propia en las capas 15 y 19, y un disparador condicionado por veracidad (WT) en la capa 15 que reescribe 16 neuronas MLP poco activas.

El objetivo declarado es que el modelo cierre su razonamiento cuando su propia señal interna de verdad es alta, en lugar de ser empujado desde fuera. El modelo base tiene 873.438.784 parámetros según el archivo safetensors y se distribuye en bf16 (formato Hugging Face) y en un GGUF q8_0 exacto con el que se realizaron todas las mediciones del informe. La licencia es Apache 2.0 y la librería de referencia es transformers.

Es relevante para quienes trabajan en interpretabilidad, edición de modelos y control del razonamiento: documenta un mecanismo concreto (puerta de verdad sobre neuronas MLP) con resultados pre-registrados sobre MATH-500, además de una comprobación de daño pre-registrada con IFEval. No es un modelo para producción general: es un artefacto experimental con un comportamiento de cierre y reapertura del razonamiento que el propio autor describe como incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con edición de pesos en espacio de pesos (top-64 columnas, α = 6) y 16 neuronas MLP reescritas en la capa 15 |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada; las ejecuciones del informe usan hasta 32.768 tokens nuevos de generación |
| Tipos de cuantizacion | bf16 (safetensors) y q8_0 (GGUF); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, `model.safetensors-00001-of-00001.safetensors`) y GGUF (`Qwen3.5-0.8B-WT-A-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de 873 millones de parámetros, y no se entrena: se edita en el espacio de pesos. Se aplican dos intervenciones. La primera replica la receta de *Sparks of Weight-Space Programming* de MIT CSAIL (top-64 columnas, α = 6) con una dirección de bucle derivada de las propias transcripciones del modelo sin editar (coseno 0,76 y 0,77 respecto a la de MIT), aplicada en las capas 15 y 19. La segunda, denominada WT, reescribe 16 neuronas MLP poco activas de la capa 15: la compuerta `gate` lee una dirección de verdad de una sonda lineal congelada por encima de un umbral alto (solo el 2 % de candidatos incorrectos lo superan), `up` detecta que acaba de terminar un valor candidato y `down` empuja a lo largo del gradiente de cierre medido de ``.

No hay datos de preentrenamiento propios, RLHF ni DPO: el modelo hereda el entrenamiento del base. La innovación técnica es el condicionamiento por veracidad: la edición solo actúa cuando la señal interna de verdad del modelo es alta, de modo que el cierre del razonamiento queda ligado a un estado interno medido y no a una instrucción externa. Cuatro tensores difieren de la revisión `2fc0636` del modelo base; el registro de construcción (`wsp_patch.json`) incluye los tensores modificados con sumas de verificación, las 16 neuronas y los umbrales.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking, heredado del modelo base Qwen3.5-0.8B.
- Razonamiento matemático: el informe evalúa el modelo sobre problemas de MATH y MATH-500 (conjunto 161–300).
- Cierre condicionado del razonamiento: cuando la sonda de verdad supera el umbral tras un valor candidato, las neuronas WT empujan a emitir ``.
- Capacidad multimodal declarada por el pipeline `image-text-to-text` del repositorio, si bien la información disponible no detalla el alcance de visión ni su evaluación.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso más allá del bucle de razonamiento nativo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad de interpretabilidad: expone una señal interna de verdad utilizable para estudiar compromiso y abstención ("no lo sé") cuando la señal es baja.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo una señal lineal de verdad congelada condiciona el cierre del razonamiento y comparar tasas de cierre con y sin el disparador WT sobre conjuntos frescos.
- Edición de modelos y espacio de pesos: reproducir la receta top-64 con α = 6 y la inyección de neuronas MLP como plantilla para experimentos de control de comportamiento sin entrenamiento.
- Estudio de bucles de razonamiento: medir cuántas veces el modelo escribe el valor correcto en el thinking y no lo entrega, y cuantificar el efecto de una edición sobre la tasa de compromiso.
- Evaluación de honestidad y calibración: usar la sonda de verdad como señal para estudiar cuándo el modelo debería abstenerse y cómo se relaciona con la respuesta final.
- Reproducción de resultados: ejecutar el GGUF q8_0 con checksum fijado (`692a0510…af610`) en llama.cpp con temperatura 0,6, top-p 0,95, top-k 20, presencia 1,5 y semilla 0 para replicar las tablas del informe.
- Docencia y divulgación técnica: ilustrar con un caso concreto y pre-registrado las diferencias entre un cierre forzado desde fuera y un cierre guiado por señal interna.
- Línea base para experimentos de control: comparar contra el modelo sin editar y contra la edición de MIT en las mismas condiciones de decodificación.

## Benchmarks y rendimiento

Resultados del informe (modo thinking, temperatura 0,6, top-p 0,95, top-k 20, presencia 1,5, hasta 32.768 tokens nuevos, semilla 0, llama.cpp con q8_0). Salvo donde se indica, son descriptivos.

| Metrica | Sin editar | Edicion de MIT | WT-A |
|---|---|---|---|
| 50 problemas frescos de MATH: correctos | 5 | 20 | 19 |
| … el valor correcto aparece en el thinking | 24 | 29 | 26 |
| … de esos, comprometidos (respuesta final correcta) | 21 % | 69 % | 65 % |
| … parada por bucle o tope de 32K | 90 % | 46 % | 50 % |
| MATH-500, problemas 161–300: correctos de 140 | no disponible | 82 | 63 |
| IFEval, 120 prompts, nivel estricto de prompt | no disponible | 87 | 70 |

Resultados adicionales citados: en MATH-500 161–300, WT-A cierra su razonamiento en los 64 tokens posteriores al valor correcto en el 65 % de las oportunidades (55 de 85), frente al 36 % de la edición de MIT (37 de 102); Fisher unilateral p = 0,0001 (pre-registrado, H-WT2). En el conjunto de desarrollo (60 problemas), 33 frente a 26 correctos sin el disparador (segunda semilla: 35 frente a 28) y un 64 % menos de tokens en problemas que ambos resuelven. Tras un cierre por disparador, WT-A reabre el razonamiento en la parte de respuesta en el 77 % de todos los cierres sobre 161–300 y en 60 de sus 63 ejecuciones correctas, frente al 16 % de la edición de MIT. La comprobación de daño de IFEval se confirmó dentro de los límites fijados de antemano (confirmado a ≥ 72, refutado a ≤ 64); la dirección de bucle sin el disparador obtiene 74 (p = 0,54).

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,6 GB; el safetensors en bf16 requiere aproximadamente 1,8 GB de pesos más caché KV y overhead del runtime. El GGUF q8_0 es aún más ligero y es el formato usado en todas las mediciones del informe.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería alojar el modelo en q8_0; con bf16 se recomienda 6–8 GB para dejar margen a contexto largo. No se especifican A100, H100 ni RTX 4090 en la información disponible.
- Cabe en GPU consumer: sí, por tamaño (0,87 B de parámetros); la información no detalla modelos concretos probados.
- Opciones de despliegue: llama.cpp (usado en el informe con el q8_0), transformers (librería declarada) y, por extensión del formato, servidores compatibles con GGUF; vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El informe sí reporta que en el conjunto de desarrollo WT-A usa un 64 % menos de tokens en problemas que ambos resuelven, lo que reduce el coste de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 161–300 (correctos de 140) | IFEval (120, estricto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B (sin editar) | 873 M | no disponible | no disponible | no disponible | Apache 2.0 (base) | Hugging Face |
| Qwen3.5-0.8B con edicion de MIT | 873 M | no disponible | 82 | 87 | Apache 2.0 (base) | Página de discusión enlazada |
| Qwen3.5-0.8B-WT-A | 873 M | no disponible | 63 | 70 | Apache 2.0 | Hugging Face |
| SGNE-CC (Igor M. Zhuk) | no disponible | no disponible | no disponible | no disponible | no disponible | Citado en el informe, sección 3.13 |

La comparación directa con el modelo sin editar solo está publicada para el conjunto de 50 problemas frescos de MATH; para MATH-500 161–300 e IFEval el informe no ofrece cifras del base. SGNE-CC se menciona como referencia con mayor tasa de compromiso a este tamaño, pero sin datos numéricos en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación sin revisión por pares: el informe es la versión 0.5 y los resultados, salvo los marcados como pre-registrados, son descriptivos.
- El cierre inducido no es un cierre propio: tras el disparador, WT-A reabre el razonamiento en el 77 % de los cierres sobre MATH-500 161–300 y en 60 de sus 63 ejecuciones correctas; su ruta exitosa típica es cierre por disparador, razonamiento renovado, segundo cierre propio y entrega.
- Menor rendimiento como solucionador que la edición de MIT en problemas frescos (63 frente a 82 en MATH-500 161–300) y menor cumplimiento de instrucciones en la comprobación de IFEval (70 frente a 87).
- La compuerta de verdad se calibró con un umbral que deja pasar el 2 % de candidatos incorrectos; una comprobación de la sonda de verdad sobre las nuevas transcripciones falló, por lo que la puerta a una afirmación confirmatoria quedó cerrada en el conjunto de desarrollo.
- Riesgo de alucinación: no evaluado en la información disponible; la señal de verdad es una sonda lineal, no una garantía de corrección.
- Idiomas soportados y sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo se publica como material de investigación y su comportamiento de razonamiento no está validado para producción.
- El campo de nombre interno del GGUF lee "Qwen3.5 0.8B Ergo zigA" (nombre de trabajo) y se mantuvo sin cambios para que el checksum coincida con el informe; conviene verificar el SHA-256 antes de usarlo.
- Solo cuatro tensores difieren del base; cualquier otra discrepancia respecto a la revisión `2fc0636` debe tratarse como no reproducida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NeoCortex0815/Qwen3.5-0.8B-WT-A
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Informe (PDF): https://neocortex0815.github.io/knowing-is-not-committing/Knowing_Is_Not_Committing_v0.5.pdf
- DOI del informe: https://doi.org/10.5281/zenodo.24420522
- Código, datos y registro de pre-registro: https://github.com/NeoCortex0815/knowing-is-not-committing
- Página del proyecto: https://neocortex0815.github.io/knowing-is-not-committing/
- Discusión en la página de la edición de MIT: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming/discussions/4
- ORCID del autor: https://orcid.org/0009-0000-6926-7000

# PrometheanStudio/talos-mini-254k-oasst1

## Resumen

Talos Mini 254K OASST1 es un checkpoint experimental de investigación publicado por PrometheanStudio en HuggingFace. Se trata de un transformer decoder-only de tan solo 254.272 parámetros, con 2 capas, tamaño oculto de 64, 4 cabezas de atención y 2 cabezas de clave/valor (Grouped Query Attention), vocabulario de 1.024 tokens y longitud máxima de secuencia de 512. Fue entrenado sobre un subconjunto reducido del dataset OpenAssistant (OASST1), concretamente 2.000 ejemplos (1.800 de entrenamiento y 200 de validación), en una única GPU NVIDIA Tesla T4.

El modelo no pretende competir en calidad de generación, sino validar la arquitectura bautizada como Talos y su pipeline de entrenamiento a escala mínima antes de aumentar la capacidad. Según el propio autor, la generación libre no es coherente de forma consistente y el checkpoint debe entenderse como una línea base reproducible, no como un modelo conversacional de producción. Su interés para desarrolladores e investigadores es metodológico: sirve para comprobar infraestructura, tokenizador y bucles de entrenamiento a coste prácticamente nulo.

La relevancia de este tipo de publicaciones radica en que documentan de forma explícita el proceso de escalado (curvas de pérdida por paso, hiperparámetros y hardware) y permiten reproducir un experimento completo en minutos. No obstante, la información pública es muy limitada: no se declara licencia, no hay benchmarks de evaluación, no hay pipeline ni idiomas declarados y el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 254.272 (0,254 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de entrenamiento: 64 tokens) |
| Tipos de cuantizacion | No disponible (solo checkpoint PyTorch en el repositorio) |
| Idiomas soportados | No disponible (el dataset OASST1 es mayoritariamente en ingles) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`step-7680.pt`); tokenizador en `tokenizer.json`; metricas en `metrics.json` |
| Capas | 2 |
| Tamano oculto | 64 |
| Cabezas de atencion | 4 (consulta) / 2 (clave-valor), GQA |
| Vocabulario | 1.024 tokens |
| Tokenizador | Byte-Level BPE nativo de Talos, 764 merges |
| Fecha de publicacion en HuggingFace | 2026-09-19 (segun metadatos del repositorio) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de 2 capas con Grouped Query Attention (4 cabezas de consulta frente a 2 de clave/valor) y tamaño oculto de 64. El vocabulario es deliberadamente pequeño (1.024 tokens) y se genera con un tokenizador Byte-Level BPE propio, con 764 fusiones BPE. La ventana máxima declarada es de 512 tokens, aunque el entrenamiento se realizó con longitud de secuencia 64, lo que implica que el modelo no ha visto secuencias largas durante el ajuste. No se menciona uso de RLHF, DPO ni ninguna fase de alineación posterior; el entrenamiento es de modelado de lenguaje autorregresivo sobre pares de conversación de OASST1.

Los detalles de entrenamiento son inusualmente completos para un modelo de este tamaño: 2.000 ejemplos del dataset OpenAssistant (1.800 de entrenamiento, 200 de validación), aproximadamente 967.680 tokens por época, batch size 32, tasa de aprendizaje 3 × 10⁻³ y 7.680 pasos totales sobre una NVIDIA Tesla T4. La pérdida de validación descendió de 2,9331 (paso 480) a 1,9177 (paso 7.680), lo que evidencia aprendizaje medible, pero con un valor absoluto alto que es coherente con la advertencia del autor sobre la incoherencia de la generación libre. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, SSM híbrido, etc.).

## Capacidades

- Modelado de lenguaje autorregresivo a escala mínima: predice el siguiente token sobre texto con el formato de OASST1 visto durante el entrenamiento.
- Aprendizaje medible de la tarea de ajuste: la pérdida de validación baja de forma monotona a lo largo de los 7.680 pasos registrados.
- Tokenizacion propia: incluye un tokenizador Byte-Level BPE especifico (1.024 tokens, 764 merges) que puede reutilizarse en experimentos posteriores de la familia Talos.
- Generacion de texto coherente: no disponible; el autor indica explicitamente que la generacion libre no es coherente de forma consistente.
- Razonamiento, matematicas y codigo: no soportado ni evaluado.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento (OASST1) es predominantemente en ingles y no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): ninguna.

## Casos de uso

- Linea base para experimentos de escalado: Talos Mini sirve como punto de referencia cuantitativo (perdida de validacion 1,9177 tras 7.680 pasos) contra el que comparar configuraciones mayores de la misma familia dentro del mismo pipeline.
- Prueba de humo (smoke test) de infraestructura de entrenamiento: al caber en una sola T4 y ejecutar 7.680 pasos con 1.800 ejemplos, permite validar scripts de datos, checkpoints, tokenizador y registro de metricas antes de lanzar trabajos costosos.
- Validacion del tokenizador Talos: el `tokenizer.json` con 1.024 tokens y 764 merges puede probarse de forma aislada para medir tasas de compresion y cobertura sobre corpus reales antes de reutilizarlo en modelos mayores.
- Ablaciones de arquitectura a coste nulo: comparar variantes de GQA, numero de capas o tamano oculto en minutos de entrenamiento, sin necesidad de GPU de gama alta.
- Material didactico y de divulgacion: permite mostrar de principio a fin el ciclo completo de entrenamiento de un transformer (dataset, perdida, validacion, checkpoint) en un articulo, curso o taller.
- Prueba de herramientas de inferencia y servidores: un modelo de ~1 MB es util para verificar el funcionamiento de harness de evaluacion, plantillas de prompt o wrappers de despliegue sin consumir recursos.
- Verificacion de pipelines de conversion de formato: sirve para ensayar conversiones a GGUF u otros formatos y comprobar que el grafo y el tokenizador se exportan correctamente antes de aplicarlo a modelos grandes.
- Referencia para estudios de escalado tipo chinchilla a microescala: con datos de perdida por paso y tokens por epoca documentados, es posible ajustar curvas de aprendizaje en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de otro tipo). El unico dato de rendimiento documentado por el autor es la evolucion de la perdida durante el entrenamiento:

| Paso | Perdida de entrenamiento | Perdida de validacion |
|---:|---:|---:|
| 480 | 3,0289 | 2,9331 |
| 2.400 | 2,2165 | 2,3276 |
| 3.840 | 2,0245 | 2,1350 |
| 7.680 | 1,7859 | 1,9177 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (254.272 parametros × 4 bytes ≈ 1,02 MB de pesos) y del orden de decenas de megabytes contando cache KV y overhead del runtime. Cabe holgadamente en cualquier GPU, iGPU o incluso en CPU.
- Cache KV en el peor caso (512 tokens, 2 capas, 2 cabezas KV, head dim 16): aproximadamente 128 KB en FP16.
- GPU recomendadas: cualquier GPU es suficiente. No hay datos de latencia o throughput publicados; el entrenamiento se realizo en una NVIDIA Tesla T4, hardware ya sobredimensionado para la inferencia de este checkpoint.
- Cabe en GPU de consumo: si, en cualquier modelo (RTX serie 20/30/40, GTX, e incluso en CPU y dispositivos embebidos).
- Opciones de despliegue: no hay soporte empaquetado. El repositorio solo contiene un checkpoint PyTorch (`step-7680.pt`), `tokenizer.json` y `metrics.json`. Para usarlo con vLLM, llama.cpp, Ollama o TGI habria que escribir el codigo de carga (o construir el `config.json` y los pesos en safetensors) y, en el caso de llama.cpp u Ollama, convertir previamente a GGUF. No se ha publicado ninguna conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado datos de comparacion en la informacion proporcionada (la busqueda web devolvio unicamente paginas del motor de busqueda Qwant, sin relacion con el modelo). Como referencia cualitativa de categoria, Talos Mini 254K se situa por debajo de los modelos microscopicos usados para investigacion en escalado y sintesis de datos, que parten de ordenes de magnitud mas de parametros:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Talos Mini 254K OASST1 | 254.272 | 512 (entrenado a 64) | No disponible | Checkpoint PyTorch en HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

No se dispone de cifras verificadas de rendimiento de modelos comparables dentro de la informacion proporcionada, por lo que cualquier confrontacion numerica seria especulativa. La comparacion relevante es metodologica: Talos Mini es un escalon previo dentro de su propia familia, no un competidor de modelos publicos de tamano similar.

## Limitaciones y advertencias

- Generacion no coherente: el propio autor advierte que la generacion libre no es consistente y que el checkpoint es una base de investigacion, no un modelo conversacional de produccion.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial y persiste incertidumbre juridica sobre su explotacion, redistribucion o incorporacion a productos.
- Datos de entrenamiento muy limitados: 2.000 ejemplos y 1.800 de entrenamiento, con aproximadamente 967.680 tokens por epoca; insuficiente para generalizar.
- Desajuste entre contexto declarado y entrenamiento: la ventana maxima es 512 tokens, pero el entrenamiento usa secuencias de 64, por lo que el comportamiento mas alla de esa longitud no esta validado.
- Vocabulario muy reducido: 1.024 tokens con 764 merges implica una tokenizacion poco eficiente y probable fragmentacion excesiva de palabras en corpus reales.
- Idiomas: no declarados; OASST1 es mayoritariamente en ingles, por lo que el rendimiento en castellano u otras lenguas es impredecible y previsiblemente pobre.
- Ausencia total de benchmarks: no hay evaluaciones estandar que permitan estimar calidad, sesgos o robustez.
- Riesgo de alucinacion: inherente a cualquier modelo autorregresivo, y en este caso agravado por el reducido corpus y el escaso numero de parametros.
- Sesgos conocidos: no documentados por el autor; el dataset OASST1 es anotado por voluntarios y puede arrastrar sesgos de idioma, genero y cultura que no se han auditado.
- Madurez del repositorio: 0 descargas, 0 likes, tamano 0,0 GB y ausencia de model card estructurada en formato de framework (pipeline, idiomas y licencia sin declarar), lo que dificulta su integracion automatizada.
- No apto para uso en produccion: cualquier despliegue en atencion al cliente, generacion de codigo o agentes queda descartado con este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrometheanStudio/talos-mini-254k-oasst1
- Imagen de portada de la model card: https://i.ibb.co/qLS5yJt3/Screenshot-2026-09-17-4-30-09-PM.png
- Dataset citado por el autor: OpenAssistant (OASST1)
- Resultados de la busqueda web: los unicos resultados devueltos corresponden al motor de busqueda Qwant (https://www.qwant.com/ y paginas auxiliares), sin relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.

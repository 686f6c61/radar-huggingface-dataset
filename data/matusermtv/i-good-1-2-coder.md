# MatUserMTV/I.Good-1.2-coder

## Resumen

I.Good-1.2-coder es un modelo de lenguaje de tipo decoder-only transformer, entrenado desde cero por el desarrollador independiente MatUserMTV, especializado en la generación de código HTML, CSS y JavaScript. Con 10.244.160 parámetros totales según safetensors (la model card declara 8.946.432, una discrepancia que conviene tener en cuenta), se posiciona en la categoría de modelos "tiny" de carácter educativo y experimental, no como una herramienta de producción.

El modelo se entrenó íntegramente en CPU (un Intel Xeon E5-2690 v4) durante aproximadamente una hora, sobre un corpus muy reducido: 400 KB de HTML limpio y 86 KB de código JavaScript procedente del proyecto AI Tycoon. Su tokenizador BPE de 4096 tokens y su ventana de contexto de 512 tokens reflejan un diseño minimalista orientado a demostrar el pipeline completo de entrenamiento más que a competir en capacidades.

Su relevancia actual es fundamentalmente didáctica: sirve como ejemplo reproducible de entrenamiento from-scratch de un modelo Llama-like en hardware sin GPU, y como caso de estudio de olvido catastrófico (catastrophic forgetting) cuando se mezclan dominios dispares en un modelo con capacidad muy limitada. No soporta razonamiento general, ni lenguaje natural, ni tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama, entrenado desde cero |
| Parametros totales | 10.244.160 (safetensors); 8.946.432 según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas) |
| Idiomas soportados | ru, en (declarados; en la práctica no maneja lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo sin pesos safetensors publicados; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 6 capas, 8 cabezas de atención, dimensión oculta de 320 y tokenizador BPE de 4096 tokens. El entrenamiento se realizó desde cero sobre dos conjuntos de datos: 400 KB de HTML simple (etiquetas `div`, `h1`, `p`) y 86 KB de JavaScript complejo con expresiones regulares y operaciones matemáticas procedente de AI Tycoon. El entrenamiento completo se ejecutó en un Intel Xeon E5-2690 v4 sin GPU en aproximadamente una hora, alcanzando una pérdida final de entrenamiento de 0.86.

No se documenta uso de RLHF, DPO ni técnicas de alineación. La innovación técnica destacable es precisamente la ausencia de infraestructura especializada: el modelo demuestra que es posible entrenar un transformer funcional en CPU con un presupuesto mínimo. El efecto secundario documentado por el autor es un olvido catastrófico severo: al no disponer de capacidad suficiente para separar los dominios HTML y JavaScript, el modelo mezcla ambos, produciendo HTML mal cerrado o fragmentos de regex cuando se le pide JavaScript.

## Capacidades

- Generación de fragmentos de HTML con etiquetas comunes (`<label>`, ``, `<span>`, `<div>`, `<h1>`, `<p>`) y atributos básicos (`type="..."`, `class="..."`).
- Reconocimiento y reproducción de estructuras HTML anidadas simples.
- Generación de fragmentos de JavaScript, frecuentemente contaminados con patrones de expresiones regulares del corpus Tycoon.
- Formato de prompt conversacional con marcadores `<|user|>` y `<|assistant|>`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de capacidades multilingües reales pese a declarar ru y en; no procesa lenguaje natural de forma fiable.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Demostración educativa de entrenamiento from-scratch: sirve para ilustrar el pipeline completo (tokenización BPE, entrenamiento en CPU, exportación a GGUF) en cursos y talleres, ya que el autor documenta hiperparámetros y hardware concretos.
- Estudio de olvido catastrófico: el caso HTML/JavaScript mezclado es un ejemplo reproducible para analizar cómo la capacidad del modelo condiciona la separación de dominios.
- Prueba de herramientas de inferencia en CPU: útil para validar KoboldCPP u otros runners con modelos de contexto 512 y temperatura baja (0.1–0.2) en entornos sin GPU.
- Generación de esqueletos HTML para prototipado manual: con priming adecuado (`<|user|>...<|assistant|><!DOCTYPE html><html><body>`) puede producir borradores de estructura que un desarrollador complete a mano.
- Benchmark de referencia para modelos tiny: punto de comparación de pérdida (0.86) y calidad de generación frente a otros modelos de menos de 20M de parámetros.
- Reproducción de experimentos de tokenización: su vocabulario BPE de 4096 tokens permite estudiar el efecto de vocabularios reducidos en la calidad de generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida final de entrenamiento (train loss 0.86), sin métricas de validación, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización GGUF razonable, dado el tamaño de ~10M de parámetros.
- GPU recomendadas: no requiere GPU; el modelo está diseñado para ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) e incluso en CPU modesta; el autor lo entrenó en un Xeon E5-2690 v4.
- Opciones de despliegue: KoboldCPP (documentado por el autor), llama.cpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; con contexto de 512 tokens y ~10M de parámetros, la latencia esperada en CPU es de pocos milisegundos por token, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| I.Good-1.2-coder | ~10M (8,9M según card) | 512 | Apache 2.0 | GGUF en HF | Entrenado desde cero en CPU, solo HTML/JS |
| TinyLlama-1.1B | 1.100M | 2048 | Apache 2.0 | Pesos completos y GGUF | Modelo generalista, ~100x más parámetros |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Pesos completos y GGUF | Generalista, entrenado con corpus amplio |
| Qwen2.5-Coder-0.5B | 500M | 32768 | Apache 2.0 | Pesos completos y GGUF | Especializado en código, producción viable |

La comparación es desigual por diseño: I.Good-1.2-coder es dos órdenes de magnitud menor que las alternativas y no persigue los mismos objetivos. Su interés es educativo, no funcional.

## Limitaciones y advertencias

- Olvido catastrófico documentado: mezcla HTML y JavaScript y produce HTML sin cerrar etiquetas o fragmentos de regex fuera de contexto.
- No comprende lenguaje natural; las instrucciones en ruso o inglés no se interpretan de forma fiable pese a los idiomas declarados.
- Contexto muy limitado (512 tokens), insuficiente para archivos de código reales.
- Riesgo elevado de alucinación y de generar código sintácticamente inválido.
- Discrepancia entre el recuento de parámetros de safetensors (10.244.160) y la model card (8.946.432); conviene verificar los pesos antes de usarlos.
- El repositorio figura con tamaño 0.0 GB y 0 descargas; la disponibilidad efectiva de los pesos GGUF no está garantizada.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en producción; no debe desplegarse en sistemas que generen código ejecutable sin revisión humana.
- Sin datos de sesgo ni evaluaciones de seguridad publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/MatUserMTV/I.Good-1.2-coder

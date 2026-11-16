# eiviselj/flan-t5-base-finqa-noise

## Resumen

`eiviselj/flan-t5-base-finqa-noise` es un ajuste fino del modelo `google/flan-t5-base` orientado a la generacion de programas aritmeticos (suma, resta, multiplicacion y division) sobre preguntas del corpus FinQA. Lo firma Eivind Seljeset en el contexto de un trabajo de asignatura (BBAN4040, NTNU), en colaboracion con Harald Kjønnø Schaanning, y se publica con licencia Apache 2.0. No es un modelo de proposito general, sino un artefacto experimental de investigacion academica centrado en una tarea muy concreta de razonamiento numerico sobre tablas financieras.

Arquitectonicamente es un transformer encoder-decoder T5 estandar, con 247.577.856 parametros (aproximadamente 248 millones), heredado de la variante `base` de FLAN-T5. La innovacion respecto al modelo original no esta en la arquitectura, sino en el regimen de entrenamiento: el autor introduce ruido deliberado en el contexto de recuperacion, sustituyendo parte de los fragmentos relevantes por los mejores resultados alternativos de TF-IDF. El objetivo es que el modelo aprenda a operar cuando la recuperacion no es perfecta, un escenario realista en pipelines RAG.

Su relevancia es acotada: se trata de un modelo de 0 descargas y 0 likes, util como referencia para experimentos de robustez al ruido en recuperacion y como ejemplo de ajuste fino de bajo coste sobre FLAN-T5-base para tareas text2text estructuradas. No compite con modelos generativos de gran escala ni con sistemas especializados en razonamiento financiero de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5, variante FLAN-T5-base) |
| Parametros totales | 247.577.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (FLAN-T5-base soporta hasta 512 tokens de entrada por configuracion estandar, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/flan-t5-base |
| Tamano del repositorio | 1.0 GB |
| Tarea declarada | text2text-generation (FinQA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA ni adaptadores) de `google/flan-t5-base`, un transformer encoder-decoder con atencion multi-cabeza estandar, normalizacion pre-LN y embeddings relativos de posicion. No incorpora mecanismos de attention linear, decodificacion especulativa ni modulos MoE. La salida esperada es un programa aritmetico corto del tipo `add(a, b)`, `subtract(...)`, `multiply(...)` o `divide(...)`, que despues se ejecuta externamente para obtener el resultado numerico.

El entrenamiento se realizo sobre el corpus FinQA (Chen et al., 2021, licencia MIT), filtrando preguntas que requieren una de las cuatro operaciones aritmeticas basicas, con un total de 5.726 ejemplos de entrenamiento. La particularidad metodologica es el ruido en el contexto: en lugar de alimentar solo los fragmentos de evidencia dorados, se construye un contexto de cinco fragmentos combinando los fragmentos correctos con los mejores resultados alternativos de recuperacion TF-IDF. Se entrenaron 4 epocas con learning rate 3e-4, batch size 8 y semilla 42. El autor referencia un fichero `trening.json` con el detalle del entrenamiento y las curvas de perdida, aunque no se han publicado hiperparametros adicionales (optimizador, scheduler, warmup) en la informacion disponible.

## Capacidades

- Generacion de programas aritmeticos simples (add, subtract, multiply, divide) a partir de una pregunta y un contexto de fragmentos financieros.
- Razonamiento numerico de un solo paso sobre tablas y texto financiero del dominio FinQA.
- Robustez parcial a contextos de recuperacion imperfectos, fruto del entrenamiento con ruido TF-IDF.
- Generacion text2text condicionada por contexto, en formato encoder-decoder.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo produce una unica operacion por consulta.
- Capacidades multilingues: limitadas al ingles; no se ha entrenado ni evaluado en otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre robustez al ruido en RAG: el modelo sirve como banco de pruebas para medir como afecta la calidad de la recuperacion TF-IDF a la precision en la generacion de programas aritmeticos, comparando su comportamiento con el del FLAN-T5-base sin ajustar.
- Extraccion de operaciones aritmeticas en pipelines de analisis financiero: dado un contexto de fragmentos de un informe anual y una pregunta del tipo "cual fue el cambio porcentual en ingresos", el modelo emite la operacion a ejecutar, que despues se evalua con un interprete seguro.
- Docencia y trabajos academicos: sirve como ejemplo reproducible de ajuste fino de un T5-base sobre FinQA con hiperparametros documentados (4 epocas, lr 3e-4, batch 8), util en asignaturas de NLP.
- Baseline para comparaciones de text2text en dominios financieros: al ser un modelo pequeno y con licencia permisiva, se puede usar como referencia inferior en experimentos con modelos mayores.
- Prototipado rapido de asistentes de Q&A financiero: en entornos controlados donde la respuesta final la valida un ejecutor simbolico, el modelo reduce el espacio de busqueda a cuatro operaciones.
- Generacion de datos sinteticos de entrenamiento: sus salidas pueden filtrarse y reutilizarse como ejemplos etiquetados de programas aritmeticos en la construccion de datasets auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, EM ni comparaciones con el modelo base en el conjunto de test de FinQA.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (248 M de parametros a 4 bytes por parametro), mas overhead de activaciones y KV cache; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- VRAM estimada en fp16/bf16: alrededor de 0,5 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU moderna; una RTX 3060, RTX 4090, T4, L4, A10 o A100 lo ejecutan sin problemas. Tambien funciona en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch), `TGI` (Text Generation Inference) para servir modelos encoder-decoder, `ONNX Runtime` tras conversion, y `llama.cpp` solo si se convierte previamente a GGUF (no se distribuye en ese formato). `vLLM` no soporta de forma nativa T5 encoder-decoder en todas sus versiones.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de decenas de milisegundos por peticion en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eiviselj/flan-t5-base-finqa-noise | 247,6 M | no disponible | Programas aritmeticos FinQA | Apache 2.0 | Hugging Face, 0 descargas |
| google/flan-t5-base | 247,6 M | 512 tokens (estandar T5) | Text2text general | Apache 2.0 | Hugging Face, ampliamente usado |
| google/flan-t5-large | 783 M | 512 tokens (estandar T5) | Text2text general | Apache 2.0 | Hugging Face |
| t5-base | 220 M | 512 tokens (estandar T5) | Text2text general | Apache 2.0 | Hugging Face |

La comparacion directa con alternativas especializadas en FinQA no esta disponible en la informacion proporcionada. Frente a `google/flan-t5-base`, la diferencia es el ajuste fino supervisado sobre FinQA con contexto ruidoso; frente a `flan-t5-large`, el modelo aqui descrito es aproximadamente tres veces mas pequeno y no se han publicado metricas que permitan afirmar cual rinde mejor en la tarea.

## Limitaciones y advertencias

- Modelo de investigacion academica con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion externa.
- El alcance funcional esta restringido a cuatro operaciones aritmeticas; no resuelve preguntas que requieran operaciones compuestas, comparaciones o razonamiento multi-paso.
- Entrenado exclusivamente en ingles; su uso en castellano u otros idiomas no esta soportado ni evaluado.
- Riesgo de alucinacion: puede generar programas sintacticamente validos pero con operandos incorrectos cuando el contexto es ambiguo o los fragmentos recuperados no contienen la evidencia necesaria.
- El ruido TF-IDF introducido en el entrenamiento mejora la robustez a recuperacion imperfecta, pero tambien puede degradar la precision cuando el contexto es limpio; no se han publicado metricas que cuantifiquen este trade-off.
- No se han publicado resultados de benchmarks, por lo que no es posible comparar su rendimiento con el modelo base ni con alternativas especializadas.
- Licencia Apache 2.0 permisiva para uso comercial, pero la ausencia de evaluacion y de garantias hace desaconsejable su uso en produccion sin validacion previa.
- Depende de un ejecutor externo para evaluar los programas generados; el modelo no devuelve el resultado numerico directamente.
- La fecha de creacion indicada en la ficha (2026-11-16) resulta anomala respecto al resto de metadatos; conviene verificar la procedencia del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eiviselj/flan-t5-base-finqa-noise
- Modelo base: https://huggingface.co/google/flan-t5-base
- Paper de FinQA (Chen et al., 2021): https://arxiv.org/abs/2109.00122
- Repositorio de FinQA: https://github.com/czyssrs/FinQA
- Paper de FLAN-T5 (Chung et al., 2022): https://arxiv.org/abs/2210.11416
- Paper de T5 (Raffel et al., 2019): https://arxiv.org/abs/1910.10683

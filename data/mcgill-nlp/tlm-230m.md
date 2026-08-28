# McGill-NLP/TLM-230M

## Resumen

TLM-230M es un modelo de lenguaje de tipo *Tiered Language Model* (TLM) desarrollado por el grupo McGill-NLP (McGill University y Mila). Su característica principal es que un único conjunto de pesos expone dos niveles de comportamiento distintos: un nivel público (C1) accesible sin clave, y un nivel restringido (C2) que se activa aplicando una permutación secreta sobre aproximadamente el 5% de los parámetros (cabezas de atención y columnas MLP). Esta permutación es auto-inversa, de modo que aplicar la clave alterna entre ambos niveles sobre los mismos pesos.

El modelo resuelve el problema de ofrecer dos comportamientos diferenciados sin duplicar parámetros, lo que tiene implicaciones para la alineación, la seguridad y el control de acceso en modelos de lenguaje. Forma parte de una escalera de escalado (ladder) con varios tamaños, siendo TLM-230M el rung de 229 millones de parámetros. Su arquitectura sigue el esquema GPT-Neo con 16 capas, dimensión oculta 768 y contexto de 2048 tokens. Está entrenado sobre 22.910 millones de tokens del dataset FineWeb (split retain) y se distribuye bajo licencia Apache-2.0.

La relevancia actual radica en que introduce un mecanismo novedoso de control de comportamiento mediante claves de permutación, un área de investigación activa en seguridad y alineación de modelos. Al ser un modelo pequeño, permite experimentar con este enfoque a bajo coste computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-Neo (transformer decoder) |
| Parametros totales | 229.137.745 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, tokenizer.json |

## Arquitectura y entrenamiento

TLM-230M utiliza una arquitectura transformer decoder estilo GPT-Neo con 16 capas, dimensión oculta 768, 12 cabezas de atención y ratio MLP de 8. La innovación principal es el *Tiered Alignment*: una permutación definida por una clave secreta (`key_5pct.json`) que intercambia el orden de un 5% de las cabezas de atención y columnas MLP. Esta permutación es auto-inversa, por lo que aplicar la clave dos veces devuelve el modelo a su estado original de forma bit-exacta. El modelo se carga con una clase personalizada `GPTNeoForCausalLMTiered` (no la `GPTNeoForCausalLM` estándar) porque define `lm_head` con `bias=True`; usar `AutoModelForCausalLM` descartaría ese bias entrenado.

El entrenamiento se realizó sobre 22.910 millones de tokens del dataset FineWeb (split retain), con 49.948 pasos y un batch global de 224 secuencias. El pico de learning rate fue 3.9e-4 con 1000 pasos de warmup. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posterior; el modelo es un checkpoint de preentrenamiento. La arquitectura sigue la escalera DataDecide (arXiv:2504.11393), interpolada entre los rungs de 150M y 300M con una fracción de 0.3033 en parámetros totales.

## Capacidades

- Generación de texto en ingles, con dos niveles de comportamiento: nivel público (C1) y nivel con clave (C2). El nivel C2 expone capacidades adicionales no especificadas en la documentación.
- Cambio de comportamiento mediante permutación de parámetros: aplicar la clave `key_5pct.json` alterna entre C1 y C2 sobre los mismos pesos.
- Requiere la clase `GPTNeoForCausalLMTiered` para cargar correctamente los pesos y conservar el bias del `lm_head`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso.
- Modelo pequeño (229M parametros) adecuado para experimentos de bajo coste.

## Casos de uso

- Investigacion en alineacion y seguridad de modelos: permite estudiar como una misma base de pesos puede producir comportamientos distintos segun una clave, util para analizar mecanismos de control de acceso.
- Evaluacion de modelos con niveles de comportamiento: se puede comparar el rendimiento entre C1 y C2 en tareas de generacion de texto, midiendo el impacto de la permutacion.
- Experimentos de escalado: al ser parte de una ladder de modelos (TLM-20M a TLM-650M), sirve para ajustar curvas de scaling y estudiar como el tiered alignment se comporta en distintos tamanos.
- Pruebas de robustez y seguridad: se puede analizar si el nivel C2 introduce sesgos o comportamientos no deseados, y si la clave es realmente necesaria para activarlos.
- Educacion y divulgacion: como modelo pequeno y de codigo abierto, es util para demostrar conceptos de permutacion de parametros y control de comportamiento en cursos de NLP.
- Desarrollo de herramientas de control de modelos: el mecanismo de clave podria adaptarse a escenarios donde se quiera restringir ciertas capacidades a usuarios autorizados, aunque el modelo actual es solo de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El unico punto de referencia mencionado es que su contraparte no-keyed (misma arquitectura y presupuesto de tokens, entrenada sin clave) se usa como baseline para comparaciones del nivel publico, pero no se ofrecen numeros concretos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 229M parametros, en precision FP32 ocupa aproximadamente 0.9 GB de memoria (el tamano del repo es 0.9 GB). Con cuantizacion a 8 bits o 4 bits, cabria en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) puede ejecutar inferencia sin problemas. Para entrenamiento o fine-tuning, se recomienda al menos 8 GB.
- Si cabe en consumer GPU: si, es un modelo ligero que se puede ejecutar en portatiles con GPU integrada o en CPUs (aunque mas lento).
- Opciones de despliegue: al requerir la clase personalizada `GPTNeoForCausalLMTiered`, el despliegue con herramientas estandar como vLLM, llama.cpp u Ollama no es directo; habria que adaptar el codigo. Se puede usar con transformers de Python si se instala el paquete `tiered` (referenciado en el repositorio).
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de este tamano, en una GPU moderna se esperan latencias de decodificacion de decenas de milisegundos por token, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de tamano similar (por ejemplo, GPT-Neo 125M, GPT-Neo 350M, Pythia 160M). La unica comparacion posible es con su contraparte no-keyed dentro de la misma escalera, pero no se ofrecen metricas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo pequeno (229M parametros) con contexto limitado a 2048 tokens, lo que restringe su uso en tareas que requieran contexto largo.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La carga correcta requiere la clase personalizada `GPTNeoForCausalLMTiered`; usar `AutoModelForCausalLM` estandar descarta el bias del `lm_head`, lo que degrada el rendimiento.
- La clave de permutacion (`key_5pct.json`) es un archivo separado; si se pierde, no es posible acceder al nivel C2.
- No se han publicado benchmarks ni evaluaciones de sesgos, alucinaciones o calidad de generacion; el rendimiento real es desconocido.
- Es un modelo de investigacion, no preparado para produccion: no hay garantias de estabilidad, seguridad ni soporte.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye documentacion sobre posibles sesgos en los datos de entrenamiento (FineWeb).

## Enlaces

- HuggingFace: https://huggingface.co/McGill-NLP/TLM-230M
- Repositorio GitHub (tiered-language-models): https://github.com/McGill-NLP/tiered-language-models
- Paper DataDecide (arXiv:2504.11393): https://arxiv.org/abs/2504.11393
- Pagina del grupo McGill-NLP: https://mcgill-nlp.github.io/

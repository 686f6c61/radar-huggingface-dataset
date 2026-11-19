# Fosfor1618/llm-course-hw3-tinyllama-qlora

## Resumen

`Fosfor1618/llm-course-hw3-tinyllama-qlora` es un checkpoint publicado en Hugging Face por el usuario Fosfor1618, presumiblemente como parte de un ejercicio académico de un curso sobre modelos de lenguaje (el identificador incluye `llm-course-hw3`). El nombre sugiere un ajuste fino mediante QLoRA sobre el modelo base TinyLlama, pero esta información no está confirmada en la model card ni en los metadatos del repositorio.

La model card es la plantilla automática de Hugging Face, sin contenido sustantivo: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto. El repositorio figura con un tamaño de 0.0 GB y cero descargas y cero "likes" en el momento de la consulta, lo que indica que se trata de un artefacto de práctica más que de un modelo destinado a producción.

Por tanto, esta ficha describe lo que se puede inferir de los metadatos disponibles y marca explícitamente como "no disponible" todo aquello que el autor no ha documentado. Cualquier uso en producción requeriría una validación independiente del checkpoint y de su licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere TinyLlama, transformer decoder-only, sin confirmar) |
| Parametros totales | no disponible (TinyLlama base: 1,1 mil millones, sin confirmar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TinyLlama base: 2048 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (el nombre indica QLoRA en el entrenamiento; no se publican pesos cuantizados) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio); librería transformers |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura en la model card. El identificador del repositorio contiene `tinyllama` y `qlora`, lo que apunta a un ajuste fino con QLoRA (cuantización de 4 bits del modelo base con adaptadores LoRA entrenables en precisión superior) sobre TinyLlama. TinyLlama es un transformer decoder-only de aproximadamente 1,1 mil millones de parámetros, entrenado por el equipo de TinyLlama sobre unos 3 billones de tokens según su propia documentación pública. Ninguno de estos datos está confirmado para este checkpoint concreto.

Tampoco se documentan el dataset de ajuste, el número de tokens vistos, la composición de los datos, ni si hubo alineación posterior (RLHF, DPO). El tag `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre el cálculo del impacto ambiental, que aparece en la plantilla por defecto de la model card y no describe el modelo.

## Capacidades

- Generación de texto autoregresiva: capacidad heredada del modelo base, sin confirmar para este checkpoint.
- Razonamiento y código: no verificable sin evaluación; un modelo de ~1B de parámetros tiene un techo bajo en tareas de razonamiento complejo.
- Tool calling / function calling: no documentado; no se debe asumir soporte nativo.
- Agentes y razonamiento multi-paso: no documentado; poco realista para un modelo de este tamaño sin un andamiaje externo.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el repositorio solo contiene pesos de texto según los tags.

## Casos de uso

- Ejercicio docente y reproducción de experimentos: el checkpoint sirve como referencia para comparar un ajuste QLoRA frente al modelo base en un entorno de curso, siempre que se disponga del dataset original.
- Prototipado rápido en local: un modelo de ~1B de parámetros se puede cargar en CPU o en GPU de consumo para probar pipelines de `transformers` antes de escalar a modelos mayores.
- Generación de texto acotada en dominios estrechos: si el ajuste se hizo sobre un corpus específico, podría emplearse para completar o reformular texto de ese dominio, previa evaluación propia.
- Filtrado o clasificación ligera de texto: usar el modelo como generador de etiquetas o resúmenes cortos en un pipeline de preprocesado, con validación humana.
- Base para nuevos ajustes: al ser un checkpoint pequeño, puede servir de punto de partida para fine-tuning adicional con recursos limitados.
- Demostraciones educativas de cuantización y despliegue: conversión a GGUF y prueba en `llama.cpp` u Ollama para ilustrar el flujo completo de puesta en producción de un modelo pequeño.

En todos los casos, la idoneidad es hipotética: no hay evaluación publicada que respalde el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~1,1B de parámetros: ~2,2 GB en fp16, ~1,2 GB en cuantización de 8 bits y ~0,7 GB en 4 bits, más el overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; para cuantización de 4 bits basta con GPUs de consumo modestas.
- GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060 y superiores, así como en Apple Silicon con memoria unificada.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), `llama.cpp`/Ollama y vLLM previa conversión a GGUF u otro formato compatible; no se incluyen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fosfor1618/llm-course-hw3-tinyllama-qlora | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1,1B | 2048 | Apache 2.0 (según su model card pública) | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32 768 | Apache 2.0 (según su model card pública) | Hugging Face, ampliamente usado |

La comparación es aproximada: los datos de los modelos alternativos provienen de sus model cards públicas y no se han verificado en esta ficha. El checkpoint de Fosfor1618 no ofrece métricas que permitan situarlo frente a ellos.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre datos de entrenamiento, evaluación, sesgos o uso previsto; no debe desplegarse sin una auditoría propia.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor o asumir que no está permitido.
- Riesgo de alucinación: inherente a los modelos generativos pequeños y agravado por la falta de evaluación y de alineación documentada.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no es posible anticipar sesgos de género, idioma o dominio.
- Limitaciones de contexto e idioma: no disponibles; si el base es TinyLlama, el contexto sería de 2048 tokens y el multilingüismo limitado.
- Repositorio con 0.0 GB: conviene verificar que los pesos se han subido correctamente antes de intentar cargarlo.
- Nombre de ejercicio académico: no hay indicios de que el modelo haya pasado por revisión o pruebas de calidad.

## Enlaces

- [Hugging Face: Fosfor1618/llm-course-hw3-tinyllama-qlora](https://huggingface.co/Fosfor1618/llm-course-hw3-tinyllama-qlora)
- [Artículo citado en el tag: Lacoste et al., Quantifying the Carbon Emissions of Machine Learning (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [TinyLlama en Hugging Face (modelo base probable, sin confirmar)](https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0)

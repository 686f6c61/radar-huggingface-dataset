# oshea00/tinygpt-viz

## Resumen

TinyGPT Visualizer (variante `bpe-small`) es un checkpoint de un GPT minúsculo desarrollado por el usuario oshea00 como material didáctico para una aplicación de visualización de la interpretabilidad interna de un transformer. No es un modelo pensado para producción ni para tareas generativas reales: su función es servir como sujeto de estudio en una app que recorre paso a paso un forward y un backward pass mostrando cada número intermedio. El repositorio contiene los pesos y los datos tokenizados que esa aplicación descarga en su primera ejecución.

El modelo sigue una arquitectura transformer decoder-only de tipo GPT con 6 capas, 8 cabezas de atención, dimensión de modelo 256 y embeddings atados (tied embeddings), sumando 5,8 millones de parámetros. Emplea un vocabulario BPE de 4.096 tokens y una longitud de contexto de solo 100 tokens. Fue entrenado sobre el dataset TinyStories de Ronen Eldan y Yuanzhi Li durante 20.000 pasos, y el repositorio conserva checkpoints intermedios de distintas fases del entrenamiento para permitir su reproducción en la app.

Su relevancia es exclusivamente educativa y de investigación en interpretabilidad: permite inspeccionar activaciones, gradientes y búsquedas de neuronas sobre un modelo lo bastante pequeño como para examinarlo a mano. No compite con modelos de propósito general y no debe evaluarse con los criterios habituales de rendimiento, contexto o calidad generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (6 capas, 8 cabezas, d_model 256, tied embeddings) |
| Parametros totales | 5,8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 100 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (los pesos y la app); el texto de validación tokenizado derivado de TinyStories queda bajo CDLA-Sharing-1.0 |
| Formato de pesos | checkpoints de PyTorch (librería `pytorch`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT con 6 capas y 8 cabezas de atención por capa, dimensión de modelo de 256 y embeddings atados entre la entrada y la salida. El vocabulario es un BPE de 4.096 tokens y la ventana de contexto es de 100 tokens. El repositorio ocupa 1,6 GB e incluye checkpoints de distintas fases del entrenamiento bajo `runs/bpe-small/`, además del texto de validación tokenizado en `data/bpe4096/val.bin`, que la app emplea para su función de búsqueda de neuronas.

El entrenamiento se realizó sobre TinyStories, el corpus de cuentos infantiles sintéticos publicado por Ronen Eldan y Yuanzhi Li en 2023 (arXiv:2305.07759), durante 20.000 pasos. La model card no detalla la composición exacta del dataset, el número total de tokens procesados ni si hubo fases de RLHF o DPO; dado el propósito didáctico del modelo, es razonable asumir un entrenamiento de preentrenamiento supervisado estándar con objetivo de modelado de lenguaje autorregresivo, pero este extremo no se confirma en la información disponible. No se documentan innovaciones técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto autorregresiva muy limitada, restringida al dominio de cuentos infantiles sencillos en inglés.
- Producción de texto coherente a corto plazo dentro de su ventana de 100 tokens; no apta para textos largos.
- Exposición completa de activaciones, pesos y gradientes para su inspección paso a paso en la app TinyGPT Visualizer.
- Soporte de búsqueda de neuronas sobre el conjunto de validación tokenizado incluido en el repositorio.
- Reproducción de distintas fases del entrenamiento mediante los checkpoints intermedios de `runs/bpe-small/`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito (thinking mode).
- Multilingüismo nulo: solo inglés.

## Casos de uso

- Docencia de transformers: la app recorre un forward y un backward pass mostrando cada número, lo que permite explicar en clase cómo fluyen las activaciones y los gradientes en un GPT real sin abstracciones.
- Investigación en interpretabilidad: con 6 capas y 256 dimensiones, es viable inspeccionar manualmente cabezas de atención y neuronas individuales, algo inviable en modelos de miles de millones de parámetros.
- Búsqueda de neuronas sobre el conjunto de validación: el fichero `data/bpe4096/val.bin` permite localizar unidades con activación selectiva sobre textos de TinyStories y estudiar su comportamiento.
- Estudio de dinámica de entrenamiento: los checkpoints intermedios de `runs/bpe-small/` permiten comparar representaciones y curvas de pérdida a lo largo de los 20.000 pasos.
- Prototipado de herramientas de visualización: sirve como banco de pruebas para desarrollar interfaces de depuración de modelos antes de escalarlas a arquitecturas mayores.
- Material de formación para desarrolladores: ilustra conceptos como embeddings atados, tokenización BPE y atención multi-cabeza con un coste computacional mínimo.
- Reproducción de experimentos académicos sobre TinyStories: permite replicar estudios de currículo y tamaño de modelo en el régimen de pocos millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 5,8 millones de parámetros; en la práctica, unos pocos cientos de MB incluyendo overhead del framework.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo funciona en CPU sin problema.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU con memoria compartida.
- Opciones de despliegue: PyTorch nativo (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y su formato de pesos no es GGUF.
- Latencia y throughput: no disponibles; por el tamaño del modelo, la latencia será dominada por el overhead del framework más que por el cómputo.
- Almacenamiento: el repositorio completo ocupa 1,6 GB, principalmente por los checkpoints intermedios y los datos tokenizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| TinyGPT Visualizer (bpe-small) | 5,8 M | 100 tokens | MIT | Educativo / interpretabilidad | Hugging Face (oshea00/tinygpt-viz) |
| Modelos TinyStories de referencia (Eldan y Li) | Órdenes de 1 M a 33 M según variante | No disponible en la información proporcionada | No disponible | Estudio de coherencia en modelos pequeños | Publicados junto al paper |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Generación de texto generalista | Hugging Face (openai-community/gpt2) |

La comparación con GPT-2 small es solo orientativa por categoría arquitectónica: TinyGPT Visualizer es aproximadamente 21 veces más pequeño, con un contexto 10 veces menor y un vocabulario mucho más reducido, y no está entrenado para uso generalista. No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de juguete: no debe usarse en producción ni como base para aplicaciones reales de generación de texto.
- Ventana de contexto de solo 100 tokens, insuficiente para conversaciones multi-turno o documentos.
- Entrenado exclusivamente en inglés y sobre un corpus de cuentos infantiles sintéticos; el dominio y el registro están severamente acotados.
- Riesgo alto de incoherencia y de alucinación fuera de su distribución de entrenamiento.
- No se han documentado análisis de sesgos; al derivar de un corpus sintético, los sesgos presentes son los del generador de TinyStories y no están caracterizados.
- La licencia MIT cubre los pesos y la app, pero el texto de validación tokenizado (`data/*/val.bin`) está derivado de TinyStories y permanece bajo CDLA-Sharing-1.0, lo que impone condiciones adicionales si se redistribuye.
- No hay pipeline declarado en Hugging Face ni guía de inferencia estándar; el uso previsto es a través de la app TinyGPT Visualizer, que descarga los ficheros automáticamente.
- El repositorio de 1,6 GB incluye checkpoints intermedios y datos de validación; conviene revisar qué artefactos se necesitan antes de descargarlo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oshea00/tinygpt-viz
- Repositorio de la app TinyGPT Visualizer: https://github.com/oshea00/tinygpt-viz
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories (arXiv:2305.07759): https://arxiv.org/abs/2305.07759
- Licencia CDLA-Sharing-1.0: https://cdla.dev/sharing-1-0/

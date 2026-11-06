# ClovisAtlas/Athena0.1

## Resumen

Athena0.1 (también conocido en su model card como Federalist-Char-LM) es un modelo de lenguaje causal a nivel de carácter desarrollado por ClovisAtlas y publicado en Hugging Face bajo licencia MIT. No se trata de un transformer ni de un LLM convencional: está implementado desde cero en Python puro con librerías matemáticas estándar, sin depender de PyTorch, TensorFlow ni la librería Transformers.

El modelo entrena sobre un subconjunto de *The Federalist Papers* (los primeros 20.000 caracteres) y predice el siguiente carácter de forma autorregresiva mediante una ventana deslizante de contexto. Su propósito es claramente educativo: servir como implementación didáctica de los fundamentos de un modelo de lenguaje, no competir con modelos de producción.

Con apenas 27.744 parámetros y una ventana de contexto de 6 caracteres, su relevancia es pedagógica: permite entender mecánicas de entrenamiento (SGD, cross-entropy) y generación autorregresiva sin necesidad de GPU ni frameworks de deep learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Linear Multi-Position N-gram Classifier (rejilla de pesos 3D personalizada) |
| Parametros totales | 27.744 (N × V × V, con N=6 y V=68) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 6 caracteres |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (ingles de Espana no aplicable; entrenado solo con texto en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (script Python: basic_llm3.py) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador n-grama lineal multiposición: una rejilla de pesos tridimensional de dimensiones N × V × V, donde N=6 es la longitud del contexto (en caracteres) y V=68 es el vocabulario de caracteres unicos (letras, puntuacion y espacios). Dado un contexto de 6 caracteres, el modelo produce una distribucion sobre el siguiente caracter y se entrena de forma autorregresiva.

El entrenamiento utiliza descenso de gradiente estocastico (SGD) con funcion de perdida de entropia cruzada, sobre los primeros 20.000 caracteres de *The Federalist Papers*. No hay informacion sobre RLHF, DPO, ni tecnicas modernas como atencion lineal, decodificacion especulativa o posicionamientos RoPE: el modelo prescinde deliberadamente de todo ello al ser una implementacion desde cero sin frameworks de deep learning.

## Capacidades

- Generacion de texto a nivel de caracter en ingles, imitando el estilo de *The Federalist Papers*
- Modelado autorregresivo del siguiente caracter con contexto de 6 caracteres
- Ejecucion en CPU sin dependencias de GPU ni frameworks de deep learning
- Valor didactico: codigo fuente legible para entender n-gramas, entropia cruzada y SGD
- No soporta: tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido
- No es multilingue: el vocabulario de 68 caracteres esta pensado para ingles

## Casos de uso

- **Ensenanza de fundamentos de LLM**: ideal como primer ejercicio en cursos de NLP o tutoriales, porque el codigo completo (entrenamiento y generacion) cabe en un unico script Python y se puede recorrer linea a linea.
- **Experimentacion con n-gramas neurales**: permite modificar el tamano de contexto (N), el corpus o el learning rate y observar el efecto en la perdida sin coste computacional.
- **Comparacion didactica con transformers**: sirve de punto de partida para mostrar por que la atencion supera a los clasificadores lineales sobre contexto fijo.
- **Generacion de texto estilizado con fines demostrativos**: puede producir texto con apariencia de prosa del siglo XVIII tras entrenar sobre *The Federalist Papers*, util para demos educativas.
- **Pruebas de conceptos de cuantizacion o compresion**: al ser solo 27.744 parametros flotantes, es trivial experimentar con representaciones de pesos de baja precision.
- **Bateria de ejercicios de programacion**: implementar mini-batches, momentum o validacion cruzada sobre una base de codigo minima y sin dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de 27.744 parametros entrenado sobre 20.000 caracteres, no es comparable con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: practicamente nula; el modelo (27.744 parametros) cabe en memoria de cualquier equipo moderno, incluso sin GPU dedicada
- **GPU recomendadas**: no se requiere GPU; se ejecuta en CPU con Python y librerias matematicas estandar
- **Consumer GPUs**: innecesario; cualquier portatil sirve para entrenar e inferir
- **Opciones de despliegue**: clonar el repositorio y ejecutar `python basic_llm3.py`; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no usar formatos estandar (safetensors, GGUF)
- **Latencia y throughput**: no disponible; por el tamano del modelo, la generacion deberia ser casi instantanea en CPU

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| Athena0.1 (Federalist-Char-LM) | 27.744 | 6 caracteres | Clasificador n-grama lineal | MIT | Educativo, desde cero |
| nanoGPT (Karpathy) | ~10M (config tipica Shakespeare) | ~256 tokens | Transformer decoder | MIT | Educativo, con PyTorch |
| makemore (Karpathy) | Variable (MLP/transformer pequeno) | Variable | MLP o transformer | MIT | Educativo, a nivel de caracter |
| GPT-2 (124M) | 124M | 1.024 tokens | Transformer decoder | Licencia modificada de OpenAI | Produccion/Investigacion |

Athena0.1 se distingue por prescindir de PyTorch y de la arquitectura transformer, lo que lo hace mas simple pero mucho menos capaz que alternativas educativas como nanoGPT.

## Limitaciones y advertencias

- Capacidad de modelado del lenguaje extremadamente limitada: con 6 caracteres de contexto y 27.744 parametros, el texto generado sera localmente coherente pero sin estructura semantica de largo alcance
- Entrenado solo sobre 20.000 caracteres de un unico corpus, por lo que hereda el estilo y el vocabulario de *The Federalist Papers* exclusivamente
- Riesgo de alucinacion no aplicable en el sentido habitual: el modelo genera texto plausible a nivel de caracter, no afirmaciones factuales
- Solo soporta ingles; el vocabulario de 68 caracteres no cubre acentos del castellano ni otros alfabetos
- No existe soporte de la libreria Transformers, lo que impide integrarlo en pipelines estandar de Hugging Face
- Sin datos publicados de perdida final, calidad de generacion ni validacion cuantitativa
- Repositorio con 0 descargas y sin comunidad activa conocida: el mantenimiento y la documentacion dependen del autor

## Enlaces

- Hugging Face: https://huggingface.co/ClovisAtlas/Athena0.1
- Articulo o paper asociado: no disponible
- Repositorio de codigo externo: no disponible (el codigo de entrenamiento y generacion, `basic_llm3.py`, se incluye en el propio repositorio)
- Demo online: no disponible

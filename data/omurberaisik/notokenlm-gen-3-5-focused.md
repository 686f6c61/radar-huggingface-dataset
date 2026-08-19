# omurberaisik/NoTokenLM-Gen-3.5-Focused

## Resumen

NoTokenLM-Gen-3.5-Focused es un modelo de lenguaje pequeño de 9 millones de parámetros, desarrollado por omurberaisik como parte de la familia NoTokenLM. Se trata de un modelo de nivel de byte, sin tokenizador, que opera directamente sobre los bytes UTF-8 (vocabulario de 256 valores). Este checkpoint concreto es un ajuste fino del modelo NoTokenLM-Gen-3.5, diseñado específicamente para corregir su principal debilidad: la coherencia de largo alcance en la generación de texto (más de 3 frases).

La relevancia de este modelo radica en su enfoque minimalista: demuestra que con una arquitectura transformer clásica (RoPE, RMSNorm, SwiGLU) y un vocabulario de bytes, se puede lograr una generación de texto coherente a pequeña escala, sin depender de tokenizadores subword. Según la model card, la coherencia multi-frase pasó de un 38-42% en Gen-3.5 a aproximadamente un 86% en esta versión, tras un entrenamiento de continuación con un dataset exclusivo de TinyStories.

El modelo está pensado para experimentación, prototipado rápido y tareas de generación narrativa simple. No es un modelo de chat ni de instrucciones, y carece de capacidades aritméticas o de conocimiento factual fiable. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (RoPE, RMSNorm, SwiGLU, weight tying) |
| Parametros totales | 9.053.520 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar con normalización RMSNorm, activación SwiGLU en las capas feed-forward y posiciones rotatorias (RoPE). El vocabulario es de 256 tokens, correspondientes a los bytes UTF-8, lo que elimina por completo la necesidad de un tokenizador. El peso de la capa de embedding y de la cabeza de salida está compartido (weight tying). No se especifica el número de capas ni la dimensión oculta en la información disponible.

El entrenamiento se realizó en dos fases: primero, el modelo base Gen-3.5 se entrenó desde cero con una mezcla de datasets (c4, matemáticas y datos sintéticos), y posteriormente este checkpoint se sometió a un ajuste fino de continuación con un dataset exclusivo de TinyStories (historias cortas para niños). El objetivo era reforzar el seguimiento del sujeto y la estructura narrativa, no añadir nuevas capacidades. No se menciona el uso de RLHF o DPO; el entrenamiento parece ser de modelado de lenguaje autorregresivo estándar.

## Capacidades

- Generacion de texto narrativo coherente a corto y medio plazo (2-3 frases), con seguimiento consistente de pronombres y sujetos.
- Morfologia de palabras real y formato de dialogo basico, gracias al entrenamiento con TinyStories.
- Generacion de texto a nivel de byte, lo que permite manejar cualquier secuencia UTF-8 sin tokenizacion previa.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo de chat ni sigue instrucciones; solo completa inicios de frase.
- No tiene capacidad aritmetica fiable ni conocimiento factual del mundo.
- Multilingue: no, solo ingles (aunque al ser byte-level podria procesar otros idiomas, no ha sido entrenado para ello).

## Casos de uso

- Prototipado de generacion de texto educativo: el modelo puede usarse en aulas o talleres para demostrar como funciona un LM desde cero, sin dependencias de tokenizadores. Su tamano permite ejecutarlo en CPU.
- Generacion de historias cortas para ninos: dado su entrenamiento con TinyStories, es adecuado para crear cuentos simples con estructura narrativa coherente, util en aplicaciones de lectura infantil o generacion de contenido creativo.
- Experimentacion con modelos byte-level: investigadores pueden estudiar el comportamiento de vocabularios de bytes frente a subword, comparando este modelo con otros de su tamano.
- Base para fine-tuning especifico: al ser un modelo pequeno y con licencia permisiva, puede servir como punto de partida para tareas de generacion de texto en dominios muy concretos (por ejemplo, generacion de frases cortas en ingles).
- Generacion de texto para testing de pipelines: en desarrollo de software, puede usarse para probar sistemas de generacion de texto sin coste computacional alto, gracias a sus 9M de parametros.
- Demo de generacion de texto en entornos con recursos limitados: su huella de memoria es minima, por lo que puede desplegarse en dispositivos edge o navegadores via WebAssembly (con las adaptaciones necesarias).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card documenta una evaluacion manual de coherencia: sobre 200 generaciones con 10 prompts reservados y temperatura 0.6, aproximadamente el 86% de las generaciones fueron completamente coherentes, frente al 38-42% del modelo predecesor Gen-3.5. Se reporta tambien una tasa de fallos de alrededor del 14% (derivas o contradicciones internas). No hay datos comparativos con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada: al tener 9.053.520 parametros, en FP32 ocupa unos 36 MB; en FP16 unos 18 MB; en int8 unos 9 MB. Cabe en cualquier GPU comercial, incluso en iGPU.
- GPU recomendadas: no requiere GPU especifica; una NVIDIA GTX 1050 o superior es mas que suficiente. Tambien se ejecuta sin problemas en CPU.
- Si cabe en consumer GPU: si, en todas las GPUs de consumo actuales.
- Opciones de despliegue: se puede cargar con transformers (con `trust_remote_code=True`) o mediante el script de generacion incluido en el repositorio. No se mencionan integraciones con vLLM, llama.cpp u Ollama, pero al ser un modelo pequeno, podria adaptarse.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamano, la generacion es casi instantanea en GPU y muy rapida en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Coherencia (eval manual) | Licencia |
|---|---|---|---|---|---|
| NoTokenLM-Gen-3.5-Focused | 9,05M | Transformer byte-level | no disponible | ~86% | Apache 2.0 |
| NoTokenLM-Gen-3.5 | 9,05M | Transformer byte-level | no disponible | ~38-42% | Apache 2.0 |
| NoTokenLM-Gen-2.5 | 3,1M | GPT-2 style (GELU, LayerNorm) | no disponible | no evaluado | Apache 2.0 |

No hay modelos comerciales comparables en este rango de tamano con vocabulario de bytes. Alternativas de tamano similar como GPT-2 small (124M) son mucho mayores. La comparativa se limita a la propia familia NoTokenLM.

## Limitaciones y advertencias

- No es un modelo de chat ni sigue instrucciones: cualquier prompt en formato pregunta obtendra una respuesta narrativa, no una respuesta directa.
- Carece de capacidad aritmetica fiable y de conocimiento factual del mundo; no debe usarse para tareas que requieran calculo o informacion veridica.
- La coherencia no es perfecta: aproximadamente 1 de cada 7 generaciones presenta derivas o contradicciones internas, como cambiar el genero del sujeto a mitad de frase.
- El estilo narrativo es simple y cercano a cuentos infantiles, lo que puede no ser adecuado para tonos mas formales o literarios.
- Solo esta entrenado en ingles; el uso con otros idiomas producira resultados degradados o sin sentido.
- No se especifica la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en secuencias muy largas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud ni soporte.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.5-Focused)
- [Modelo predecesor NoTokenLM-Gen-3.5](https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.5)
- [Perfil del autor en HuggingFace](https://huggingface.co/omurberaisik)

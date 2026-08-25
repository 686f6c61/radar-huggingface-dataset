# mondk/Msh-Tiny-14M-GGUF

## Resumen

Msh-Tiny es un modelo de lenguaje de aproximadamente 14 millones de parámetros, desarrollado por el usuario mondk, que sigue una arquitectura tipo GPT-2 y ha sido entrenado completamente desde cero, sin partir de ningún modelo preentrenado. Incluye un tokenizer BPE propio y una implementación personalizada en PyTorch. Su propósito principal es educativo: demostrar el proceso de entrenamiento de un transformer pequeño y ofrecer una base para experimentación. La versión GGUF permite ejecutarlo fácilmente con herramientas como llama.cpp, Ollama o LM Studio, lo que lo hace accesible para pruebas locales en hardware modesto.

El modelo se distribuye bajo licencia Apache-2.0 y está pensado exclusivamente para el idioma inglés. Se entrenó sobre tres conjuntos de datos públicos de instrucciones y chat (Alpaca, OpenHermes-2.5 y no_robots) más un pequeño conjunto propio de conversación cotidiana. Dado su tamaño reducido y su entrenamiento con recursos limitados, no es un asistente de producción, sino una muestra de lo que se puede lograr con un presupuesto computacional mínimo. La ventaja principal es su facilidad de uso y su tamaño de archivo extremadamente bajo (menos de 30 MB en su versión F16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo GPT-2 (arquitectura personalizada en PyTorch) |
| Parametros totales | 13.891.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q4_K_M, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base tambien esta disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer causal tipo GPT-2, implementada desde cero en PyTorch. No se han proporcionado detalles sobre el número de capas, cabezas de atencion ni dimensiones ocultas, aunque el recuento total de parametros (13,9 millones) sugiere una configuracion muy compacta. El tokenizer es un BPE entrenado desde cero, tambien personalizado, lo que implica que el vocabulario y las reglas de tokenizacion son unicas de este proyecto.

El entrenamiento se realizo desde una inicializacion aleatoria completa, sin usar pesos preentrenados de ningun otro modelo. Se combinaron tres conjuntos de datos publicos de instrucciones y chat (alpaca, OpenHermes-2.5 y no_robots) con un pequeno conjunto adicional de conversaciones informales. No se indica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La ausencia de un modelo base previo y la limitada cantidad de datos implican que el modelo tiene un conocimiento muy reducido del mundo y una capacidad de generacion limitada.

## Capacidades

- Generacion de texto en ingles siguiendo el formato de chat definido: `<|user|>` y `<|assistant|>`, con terminacion en `<|end|>`.
- Puede responder a instrucciones sencillas y mantener conversaciones basicas, aunque con una alta probabilidad de respuestas incoherentes o imprecisas.
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso, vision, audio ni ningun otro modo especializado.
- Capacidad multilingue: unicamente ingles.
- Al ser un modelo de 14M de parametros, su capacidad de razonamiento y de seguimiento de instrucciones complejas es muy limitada.

## Casos de uso

- **Experimentos educativos sobre entrenamiento de LLMs**: este modelo es ideal para estudiar el proceso completo de entrenamiento de un transformer desde cero, incluyendo la construccion del tokenizer, el ajuste de hiperparametros y la evaluacion de modelos muy pequenos.
- **Pruebas de integracion de GGUF**: su tamaño minúsculo permite verificar rapidamente el flujo de trabajo con llama.cpp, Ollama o LM Studio sin consumir recursos significativos.
- **Desarrollo de pipelines de inferencia local**: puede servir como banco de pruebas para sistemas de generacion de texto en entornos con muy poca memoria o en CPU sin GPU.
- **Generacion de respuestas de ejemplo en demos**: aunque no es fiable para contenido real, puede usarse en demostraciones de generacion de texto en entornos de baja exigencia.
- **Estudio de cuantizacion**: los archivos Q2_K y Q4_K_M permiten comparar el impacto de la cuantizacion en la calidad de las respuestas de un modelo pequeno.
- **Generacion de datos sinteticos para pruebas**: se puede usar para generar textos cortos que simulen conversaciones, aunque se recomienda supervisar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: inferior a 100 MB en todas las cuantizaciones. El archivo F16 pesa 28,3 MB, el Q4_K_M 11,6 MB y el Q2_K 9,64 MB.
- **GPUs recomendadas**: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente; incluso una integrada puede ejecutarlo. En CPU tambien funciona sin problemas.
- **Compatibilidad con hardware consumer**: si, es compatible con cualquier ordenador actual, incluidos portatiles y Raspberry Pi.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio. Tambien se puede cargar con Python a traves de la libreria `gguf` o `llama-cpp-python`.
- **Latencia y throughput**: no hay datos publicados, pero por su tamaño la generacion es practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

No hay una comparativa publicada con modelos de la misma categoria (modelos de ~14M entrenados desde cero). Por el tamano, se podria comparar con modelos como TinyStories (de 1-10M de parametros) o modelos de juguete como `gpt2-tiny` (12M), pero no se dispone de datos comparativos de rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo fue entrenado desde cero con una cantidad limitada de datos y recursos computacionales, por lo que su conocimiento general es muy reducido y puede producir respuestas incoherentes o incorrectas.
- No es adecuado para uso en produccion, ni para tareas que requieran fiabilidad, exactitud factual o seguridad.
- Al estar entrenado principalmente sobre datos de instrucciones en ingles, no soporta otros idiomas de forma fiable.
- No se han documentado sesgos especificos, pero al provenir de datos publicos (alpaca, OpenHermes, no_robots) podria heredar sesgos de esos conjuntos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para aplicaciones comerciales reales por su calidad limitada.
- No se proporciona informacion sobre la longitud de contexto maxima, por lo que se desconoce si puede manejar conversaciones largas o documentos extensos.

## Enlaces

- Repositorio GGUF: [https://huggingface.co/mondk/Msh-Tiny-14M-GGUF](https://huggingface.co/mondk/Msh-Tiny-14M-GGUF)
- Modelo base en safetensors: [https://huggingface.co/mondk/Safetensors.msh-tiny](https://huggingface.co/mondk/Safetensors.msh-tiny)
- Repositorio adicional del modelo GGUF: [https://huggingface.co/mondk/GGUF.msh-tiny](https://huggingface.co/mondk/GGUF.msh-tiny) (enlace alternativo)

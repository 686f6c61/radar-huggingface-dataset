# SamGCoder/direct-weight-chat-v17a

## Resumen

direct-weight-chat v17a es un artefacto de investigación publicado por SamGCoder (SamG-Coder en GitHub) que explora la construcción analítica de pesos en redes neuronales en lugar del entrenamiento por descenso de gradiente. El checkpoint final contiene 250.000.000 de parámetros en float32 (exactamente 1.000.000.000 de bytes de pesos) organizados en tensores de transformer con nombres convencionales, pero generados mediante compilación reutilizable de circuitos neuronales, sin entrenamiento por gradientes, sin transferencia de tensores preentrenados, sin destilación y sin dataset de entrenamiento descargado. La gran mayoría de los parámetros son cero: solo 995.905 son distintos de cero (0,398362 %).

El modelo implementa un transformer autorregresivo con tokenización, operaciones tensoriales, caché KV, selección argmax y detokenización, pero sus capacidades están deliberadamente acotadas a una gramática restringida y a hechos atómicos compilados manualmente en los pesos. Puede responder preguntas sobre atributos y relaciones con entidades introducidas en la conversación, aplicar reglas `If ... then ...` con signo y hasta tres enlaces en una ruta de regla, y realizar sumas y restas de dos operandos con signo en el rango -999 a 999. No es un asistente conversacional de propósito general.

El autor declara explícitamente que el experimento terminó el 4 de noviembre de 2026 sin alcanzar el objetivo práctico: no se logró chat abierto y útil bajo estas restricciones. El valor de la ficha, por tanto, es documental y metodológico: preserva qué logró y dónde falló este intento concreto de construcción directa de pesos, y advierte de que no demuestra imposibilidad matemática para toda arquitectura concebible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con arquitectura personalizada (custom-architecture), pesos construidos analíticamente |
| Parámetros totales | 250.000.000 (float32, 1.000.000.000 de bytes de pesos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (checkpoint publicado en float32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Pesos PyTorch personalizados dentro de un repositorio de 1,0 GB; runtime propio en `runtime.zip`; no es un checkpoint `AutoModel` de Transformers ni un GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo de 250 millones de parámetros con tensores con nombre convencionales (atención, proyecciones, cabeza de salida) y un forward pass estándar con caché KV. La innovación no está en el bloque transformer sino en el método de construcción: los pesos se escriben de forma analítica mediante compilación reutilizable de circuitos neuronales, sin ningún paso de entrenamiento por gradientes, sin inicialización a partir de pesos preentrenados, sin destilación y sin corpus de entrenamiento. El resultado es un modelo extremadamente disperso: 995.905 parámetros no nulos sobre 250 millones totales, es decir, un 0,398362 % de densidad.

La gramática restringida y los hechos atómicos que el modelo maneja están escritos manualmente y compilados en los tensores. La inferencia se realiza con tokenización, operaciones tensoriales, caché KV, selección argmax y detokenización, sin motor de respuestas en Python, sin banco de respuestas completas, sin fallback de selección de respuesta y sin actualizaciones de pesos en tiempo de ejecución. El autor insiste en que la generación token a token no demuestra comprensión del lenguaje. El runtime es un paquete PyTorch personalizado incluido en `runtime.zip`, con código de compilación, verificación y licencia; la verificación original se hizo con Python 3.11.9 y PyTorch 2.8.0+cu128 en una RTX 5080, con ejecuciones separadas en CPU.

## Capacidades

- Generación de tokens mediante un forward pass de transformer convencional y cabeza de salida.
- Uso de hechos proporcionados en la conversación actual, incluidos nombres de entidades desconocidas, negación explícita y correcciones posteriores.
- Respuesta a preguntas restringidas sobre atributos y relaciones, con herencia de categorías acotada y combinaciones simples de consultas booleanas.
- Aplicación de reglas `If ... then ...` con signo y con base explícita, hasta tres enlaces a lo largo de una única ruta de la regla más reciente; si falta una premisa, puede responder `I do not know.`.
- Suma y resta con signo de dos operandos, en el rango previsto de -999 a 999; no es un parser de expresiones general.
- No soporta de forma fiable conversación general útil, inglés sin restricciones, escritura creativa, generación de código, conocimiento general, multiplicación ni división, cadenas de prueba más largas, búsqueda de pruebas alternativas, binding de variables, premisas compuestas de reglas ni respuestas abiertas derivadas de reglas.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Validación de metodologías de construcción directa de pesos: el checkpoint y su runtime permiten reproducir el experimento y comprobar que un transformer puede ejecutar circuitos compilados sin entrenamiento, útil para investigadores que estudian alternativas al descenso de gradiente.
- Investigación sobre dispersión extrema en transformers: con solo un 0,398362 % de parámetros no nulos, sirve como caso de estudio de cómo se comporta un modelo de 250 millones de parámetros cuando la mayoría de pesos son cero.
- Evaluación de gramáticas restringidas compiladas: los conjuntos de prueba de conversación larga (31/31), condicionales con base (269/293) y posición de reglas (160/162) permiten comparar el comportamiento de circuitos analíticos frente a modelos entrenados en tareas acotadas.
- Reproducción de experimentos de razonamiento simbólico acotado: el modelo aplica reglas con signo de hasta tres enlaces y sumas/restas en el rango -999 a 999, lo que permite estudiar los límites de la compilación de lógica proposicional simple en pesos.
- Estudio de fallos y falsos positivos en paráfrasis: el autor documenta que algunas paráfrasis no soportadas se malinterpretan como aserciones y producen falsos positivos, lo que convierte el artefacto en un banco de pruebas para analizar errores de comprensión en gramáticas restringidas.
- Docencia sobre límites del lenguaje y evaluación: la distinción explícita entre generar tokens y comprender lenguaje, junto con los resultados de las suites, sirve para ilustrar por qué las métricas de generación no equivalen a capacidad conversacional.
- Verificación de publicación y reproducibilidad: el repositorio incluye verificación de descarga limpia (`results/publication-v0.9.json`), lo que permite auditar que el artefacto publicado coincide con el construido.

## Benchmarks y rendimiento

| Suite medida | CPU | CUDA |
|---|---:|---:|
| Reproducción de conversación larga | 31/31 | 31/31 |
| Condicionales con base (desarrollo) | 269/293 | 269/293 |
| Posición de reglas (desarrollo) | 160/162 | 160/162 |
| Combinaciones nuevas de posición de reglas tras congelar el código | 160/162 | 160/162 |
| Guardas adicionales de alcance y diálogo | 29/36 | 29/36 |
| Baseline alternativo de búsqueda de pruebas | 29/104 | 29/104 |

Las 36 suites de regresión emparejadas en CUDA suman 5.959/6.105, sin cambios de salida respecto a v16c. El autor advierte que las suites históricas repiten estructuras y que las combinaciones nuevas usan generadores conocidos y diseñados por el propio autor, por lo que no son pruebas independientes de comprensión general del lenguaje. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint es de 1,0 GB en float32 (250 millones de parámetros), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB de VRAM, incluyendo modelos de gama baja.
- GPU recomendadas: el autor verificó con una RTX 5080; cualquier GPU NVIDIA con soporte CUDA y suficiente VRAM debería ser válida. También se documentan ejecuciones en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: runtime PyTorch personalizado incluido en `runtime.zip` (`python -m chat1gb_autoregressive.chat --model-dir . --device auto`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint `AutoModel` de Transformers ni un GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el autor enlaza tiempos exactos en el repositorio de GitHub, pero no se incluyen cifras en la model card.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de construcción analítica de pesos sin entrenamiento con este tamaño y estas características en la información proporcionada. Las alternativas convencionales de 250 millones de parámetros (por ejemplo, modelos transformer entrenados con descenso de gradiente) no son comparables metodológicamente, ya que el propósito de este artefacto es precisamente evitar el entrenamiento.

## Limitaciones y advertencias

- No es un asistente conversacional de propósito general: el autor declara explícitamente que no se logró chat abierto y útil bajo estas restricciones.
- Capacidades compiladas estrechas: gramática restringida, hechos atómicos manuales y reglas con signo de hasta tres enlaces; sin multiplicación, división, cadenas de prueba largas, binding de variables ni premisas compuestas.
- Riesgo de falsos positivos: algunas paráfrasis no soportadas pueden malinterpretarse como aserciones.
- La abstención ante una petición creativa no constituye generación creativa exitosa.
- Idiomas: solo inglés; no hay soporte multilingüe documentado.
- Sesgos conocidos: no documentados en la información disponible; el modelo no se entrena con corpus, por lo que los sesgos típicos de datos web no aplican de la misma forma, pero tampoco hay evaluación de sesgos.
- Licencia MIT: permite uso comercial y modificación, pero el artefacto no tiene utilidad práctica como asistente; cualquier uso en producción requeriría validación propia.
- El experimento está cerrado: v17a es el checkpoint final y el autor no continuará esta línea; no habrá actualizaciones ni soporte.
- No demuestra imposibilidad matemática para otras arquitecturas; es un resultado negativo de un intento concreto.
- El repositorio de HuggingFace tiene 0 descargas y 1 like en el momento de la consulta, lo que refleja su carácter de artefacto de investigación más que de modelo desplegable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SamGCoder/direct-weight-chat-v17a
- Repositorio GitHub: https://github.com/SamG-Coder/direct-weight-chat
- README final y conclusión: https://github.com/SamG-Coder/direct-weight-chat#final-outcome
- Resultados de pruebas de todas las versiones: https://github.com/SamG-Coder/direct-weight-chat/blob/main/results/README.md
- Código fuente congelado de v17a: https://github.com/SamG-Coder/direct-weight-chat/tree/83a2f03afa98075286e7ec82b3e5c53f29cd4ceb/versions/autoregressive_v17a
- Arquitectura: https://github.com/SamG-Coder/direct-weight-chat/blob/main/ARCHITECTURE.md
- Registro de investigación y fallos: https://github.com/SamG-Coder/direct-weight-chat/blob/main/RESEARCH_LOG.md
- Verificación de publicación tras descarga limpia: https://github.com/SamG-Coder/direct-weight-chat/blob/main/results/publication-v0.9.json

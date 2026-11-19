# RootML/TinyStories-33M-WSP-arithmetic-gpt-6-astra-pro

## Resumen

TinyStories-33M-WSP-arithmetic-gpt-6-astra-pro es un artefacto de investigación publicado por RootML que parte de roneneldan/TinyStories-33M, un modelo GPT-Neo de 33 millones de parámetros entrenado exclusivamente con cuentos infantiles. Sobre esa base, el LLM denominado gpt-6-astra-pro reescribió los pesos mediante un único programa Python, sin entrenamiento ni ajuste fino posterior, sustituyendo 28,34 millones de entradas de peso de los 52 tensores editables por un circuito aritmético construido a mano.

El resultado ya no es un modelo de lenguaje: responde correctamente a preguntas aritméticas muy sencillas y, a continuación, emite puntos suspensivos. La relevancia es metodológica, no práctica: forma parte de WSPMathBench, un banco de pruebas que mide la capacidad de un LLM frontera para mejorar las matemáticas de un modelo diminuto mediante programación en el espacio de pesos (weight-space programming). El modelo conserva la arquitectura, el tokenizador y la configuración del base, con 68.514.048 parámetros totales según los safetensors y pesos en bfloat16.

La edición se realizó en una sola respuesta del LLM, con un coste declarado de 4,50 dólares y 29 minutos de sesión; el programa resultante se ejecutó una vez en CPU en 4,8 segundos y el LLM nunca vio su salida ni ejecutó el modelo antes o después. Se publica como artefacto de estudio de pesos, no para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-Neo (transformer decoder-only), 4 capas, pesos editados |
| Parametros totales | 68.514.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de TinyStories-33M; no se documenta en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo GPT-Neo con cuatro capas, tomado de la revisión `2ad0a164` de roneneldan/TinyStories-33M. No hubo entrenamiento ni ajuste fino: los pesos en float32 del base se convirtieron una vez a bfloat16 y después se editaron. La edición afectó a los 52 tensores editables (28,34 millones de entradas, todas menos unas 40) en las cuatro capas; las embeddings, la capa de normalización final y la capa de salida permanecieron congeladas.

La estructura funcional que el programa instaló es la siguiente: la primera capa decodifica palabras numéricas, operadores y posiciones; la segunda acumula una suma de prefijos; la tercera recupera el primer operando y calcula el producto a partir de cuadrados construidos con rampas de GELU; la cuarta comprueba cada respuesta candidata por igualdad, escribe la coincidencia y emite un token de parada. Las tablas internas se generan aritméticamente, no se copian de las respuestas de práctica. La edición corresponde al nivel `oneshot_code` de WSPMathBench: un único prompt con la tarea, nombres y formas de los tensores editables, resultados del modelo sin editar en un conjunto de práctica y ocho respuestas fallidas, y una única respuesta con un programa Python. Las reglas prohibían entrenar, ejecutar o simular el modelo y acceder a internet.

## Capacidades

- Aritmética básica: suma, resta, multiplicación y división con operandos mayoritariamente de un dígito, sumas hasta 99, restas sin resultado negativo y divisiones exactas.
- Preguntas en símbolos (`7*5=`, `38 + 47 =`) y en palabras (`seven times five equals`, `thirty-eight plus forty-seven equals`), con o sin espacios.
- Respuesta como primer número de la continuación, ocasionalmente en forma de palabra (`eight`, `zero`).
- Generación de texto: no. El modelo ya no es un modelo de lenguaje y solo produce puntos suspensivos tras la respuesta.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: ninguna más allá del circuito aritmético; no hay modo de pensamiento, visión ni audio.

## Casos de uso

- Estudio de programación en el espacio de pesos: analizar cómo un LLM frontera traduce una tarea aritmética en un circuito implementado con pesos concretos, usando `edits.json` y `edit_program.py` como material de disección.
- Reproducibilidad de WSPMathBench: servir como referencia del nivel `oneshot_code` para comparar con otras ediciones generadas por distintos modelos o configuraciones de esfuerzo.
- Investigación sobre interpretabilidad: examinar las cuatro capas editadas (decodificación, suma de prefijos, producto con rampas de GELU, comprobación por igualdad) como caso controlado de circuito aritmético embebido en un transformer.
- Docencia sobre edición de pesos: mostrar la diferencia entre entrenamiento, ajuste fino y reescritura directa de tensores con un ejemplo de 0,1 GB que se ejecuta en CPU en segundos.
- Auditoría de artefactos: verificar las huellas SHA-256 antes y después recogidas en `edits.json` para validar la integridad de la edición.
- Pruebas de robustez fuera de distribución: medir el comportamiento del circuito en operandos de dos o más dígitos, resultados negativos o divisiones no exactas, sabiendo que el autor no midió ese rango.
- No se recomienda para atención al cliente, generación de código, agentes ni ningún uso productivo: el modelo no conserva capacidad de lenguaje.

## Benchmarks y rendimiento

Resultados en BasicArithmetic, conjunto de 500 preguntas muy fáciles (250 problemas, cada uno escrito en símbolos y en palabras), promediados sobre tres ejecuciones:

| Categoría | TinyStories-33M sin editar | Este modelo |
|---|---|---|
| Las 500 preguntas | 4,5% | 100% |
| En símbolos | 4,2% | 100% |
| En palabras | 4,8% | 100% |
| Ambos números de un dígito | 5,5% | 100% |
| Un número de dos dígitos | 0,6% | 100% |

No se han publicado resultados de benchmarks en la información disponible más allá de BasicArithmetic (sin MMLU, HumanEval, GSM8K ni comparaciones con otros modelos).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (68,5 millones de parámetros, aproximadamente 0,14 GB de pesos) más el overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; también funciona en CPU, como demuestra la ejecución del programa de edición en 4,8 segundos.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090 y similares; también en Apple Silicon y en CPU.
- Opciones de despliegue: transformers (probado por el autor con `AutoModelForCausalLM` y `dtype=torch.bfloat16`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles de forma medida; el autor solo reporta 4,8 segundos para la ejecución del programa de edición en CPU, no para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyStories-33M-WSP-arithmetic-gpt-6-astra-pro | 68.514.048 | no disponible | 100% en BasicArithmetic (500 preguntas) | MIT | Hugging Face |
| roneneldan/TinyStories-33M (base) | ~33M (según nombre; safetensors del editado indican 68,5M) | no disponible | 4,5% en BasicArithmetic | MIT | Hugging Face |
| Otros modelos de WSPMathBench | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo ya no es un modelo de lenguaje: tras la respuesta aritmética solo emite puntos suspensivos y no puede generar texto coherente.
- Dominio muy restringido: operandos mayoritariamente de un dígito, sumas hasta 99, restas sin resultado negativo y divisiones exactas; el comportamiento fuera de ese rango no fue medido.
- Riesgo de alucinación: no aplica en el sentido habitual, pero el circuito puede producir respuestas incorrectas o mal formadas fuera de su dominio de diseño.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de idioma: solo inglés; las formas en palabras se limitan a `plus`, `minus`, `times`, `divided by` y `equals`.
- Restricciones de licencia: MIT, sin restricción conocida para uso comercial, aunque el autor lo publica como artefacto de investigación y no para uso práctico.
- Caveats para producción: no debe desplegarse en ningún sistema real; su valor es exclusivamente como objeto de estudio de pesos y de metodología de edición.
- La información sobre la evaluación se limita a BasicArithmetic y a la configuración descrita (bfloat16, temperatura 0,1, 16 tokens nuevos); no hay datos de robustez, seguridad ni sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RootML/TinyStories-33M-WSP-arithmetic-gpt-6-astra-pro
- Modelo base: https://huggingface.co/roneneldan/TinyStories-33M
- Código, prompts y datos de WSPMathBench: https://github.com/yagoiroot/WSPMathBench
- Paper: pendiente de envío a arXiv, enlace por añadir según el autor

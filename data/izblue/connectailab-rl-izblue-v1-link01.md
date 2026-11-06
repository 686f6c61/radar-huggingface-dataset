# izblue/connectailab-rl-izblue-v1-link01

## Resumen

`izblue/connectailab-rl-izblue-v1-link01` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por izblue en el marco de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para robótica: recibe en texto el estado observado por el robot LINK-01 (distancia al objetivo, orientación, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la siguiente acción de locomoción para los próximos 0,5 segundos.

El modelo se entrena en dos fases. Primero se genera un conjunto de datos a partir de un "cerebro" PPO entrenado en un entorno web de aprendizaje por refuerzo (tarea `follow_route`, contrato `link01-decision/follow_route/obs16-act5/walker51-14/v1`), traduciendo cada observación a un problema en lenguaje natural y usando la acción del cerebro como etiqueta. Después se aplica aprendizaje supervisado (LoRA) y una fase posterior de ajuste con refuerzo, anclada con KL para no alejarse demasiado del comportamiento del profesor.

Su interés es acotado pero claro: demuestra cómo destilar una política de control entrenada con PPO en un modelo de lenguaje pequeño (0,8B parámetros) capaz de ejecutar decisiones en un formato textual estricto, con una tasa de acierto del 84,3 % frente al profesor y un 100 % de éxito en 20 episodios de evaluación sobre el mismo circuito. Es un artefacto de investigación y docencia, no un componente listo para producción robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parámetros totales | Modelo base de 0,8B; número de parámetros del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors del adaptador) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 con 0,8B parámetros, sobre el que se inserta un adaptador LoRA entrenado con la librería PEFT. El modelo no se reentrena desde cero: se especializa la capacidad de seguir instrucciones del modelo base para que emita exactamente una letra entre las opciones disponibles, sin explicación adicional.

El pipeline de entrenamiento consta de cuatro etapas. (1) Se entrena un cerebro PPO en el entorno web de CONNECT AI WORLD para la tarea `follow_route`, con observaciones de 16 dimensiones y 5 acciones posibles, alcanzando un 100 % de éxito en la prueba oficial. (2) Se construye un corpus de problemas traduciendo cada observación del cerebro a texto, con la acción del profesor como etiqueta; se incluye un 20 % de ejemplos con desviaciones para robustecer el modelo. Los conjuntos son 1051 ejemplos de entrenamiento, 208 de validación y 324 de test, con un techo de acierto del 98 % (proporción en que el propio cerebro responde igual al reformular la observación como texto). (3) Aprendizaje supervisado con LoRA para imitar al profesor. (4) Ajuste con refuerzo donde la recompensa se calcula como el retorno que obtendría el cerebro si el modelo eligiera cada opción y el profesor continuara desde ahí, con una penalización KL para mantener proximidad al modelo supervisado.

## Capacidades

- Decisión de locomoción: dado un estado textual del robot LINK-01, devuelve una única letra entre cinco opciones de acción para los siguientes 0,5 segundos.
- Seguimiento de instrucciones en formato estricto: respeta el system prompt que exige devolver solo la letra, sin explicación.
- Robustez ante instrucciones embebidas en el estado: el prompt del sistema indica tratar el contenido de `state` como datos, no como instrucciones.
- Razonamiento de un solo paso: no hay cadena de pensamiento ni multi-step reasoning; la salida es una clasificación discreta.
- Capacidad multilingüe: limitada al coreano según la model card; el prompt de sistema está en inglés pero el modelo está etiquetado como `ko`.
- Sin soporte documentado de tool calling, function calling, visión, audio ni modo thinking.

## Casos de uso

- Investigación en destilación de políticas RL: usar el adaptador como referencia para estudiar cómo se transfiere una política PPO a un modelo de lenguaje pequeño y qué se pierde en el proceso (86,1 % en SFT frente a 100 % del profesor).
- Docencia en aprendizaje por refuerzo: el repositorio CONNECT TYCOON y el notebook de Colab permiten reproducir el pipeline completo (entrenamiento PPO, generación de corpus, SFT y RL) en un entorno controlado.
- Prototipado de control textual para robótica simulada: integrar el modelo como "capa de decisión" en un simulador 2D y comparar su comportamiento con el cerebro PPO original.
- Evaluación de robustez ante prompts: el formato de problema (estado, pregunta, opciones) permite medir cómo responde el modelo a variaciones en la redacción de la observación.
- Generación de datos sintéticos de decisión: el modelo puede usarse para etiquetar observaciones nuevas en el mismo formato, siempre que se valide contra el profesor.
- Benchmark de adaptadores LoRA pequeños: servir como caso de estudio de un adaptador de 0,8B con licencia Apache 2.0 para comparar con otros adaptadores de decisión en entornos simulados.

## Benchmarks y rendimiento

Datos publicados en la model card. La evaluación de "misma respuesta que el cerebro" se mide sobre el conjunto de test (324 problemas). La evaluación de "20 episodios" se realiza con semillas 91001–91020 sobre el mismo circuito, usando una aproximación 2D de la marcha (tabla de velocidades por comando) en lugar del modelo MuJoCo completo.

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 0 % | 23,9 s |
| Modelo base sin ajuste | 52,5 % | 0 % | 0 % | — |
| SFT (LoRA supervisado) | 86,1 % | 100 % | 0 % | 24,2 s |
| RL (este adaptador) | 84,3 % | 100 % | 0 % | 24,7 s |

Observación: el adaptador publicado es el de RL, que obtiene un acierto en test ligeramente inferior al SFT (84,3 % frente a 86,1 %) pero se selecciona por su comportamiento en la evaluación de marcha.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como referencia orientativa, un modelo base de 0,8B en fp16 requiere aproximadamente 1,6 GB de pesos, más el adaptador LoRA y el estado de activaciones; en cuantización de 4 bits cabría holgadamente en GPUs de consumo con 4–6 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles. El notebook de Colab sugiere que el entrenamiento y la inferencia son viables en GPU de consumo, pero no se especifica el modelo.
- GPU de consumo: previsiblemente compatible con RTX 3060/4060 y superiores por el tamaño del modelo base, sin datos oficiales.
- Opciones de despliegue: `transformers` + `peft` según el snippet de la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA sobre Qwen3.5-0.8B, la viabilidad en cada runtime depende del soporte de dicho modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos directamente comparables (adaptadores LoRA de decisión robótica sobre modelos de lenguaje pequeños). Se indica "no disponible" para los campos que requerirían datos externos.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-izblue-v1-link01 | 0,8B (base) + LoRA | No disponible | Decisión de locomoción LINK-01 | Apache 2.0 | Hugging Face |
| Cerebro PPO (profesor, no publicado como modelo) | No disponible | No aplica | Política de control en simulador | No disponible | Solo referenciado en la model card |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo resuelve la tarea `follow_route` con el contrato de observación `obs16-act5/walker51-14/v1`; fuera de ese formato no es fiable.
- Evaluación sobre aproximación 2D: la métrica de éxito en 20 episodios usa una tabla de velocidades por comando, no el simulador MuJoCo completo, por lo que los resultados pueden diferir de la realidad.
- Brecha respecto al profesor: el adaptador de RL acierta el 84,3 % de las decisiones del cerebro PPO; el 15,7 % restante puede traducirse en desviaciones del recorrido en circuitos no vistos.
- Sin validación en robot físico: el propio autor advierte que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- Idioma: etiquetado como coreano; no hay evidencia de comportamiento correcto en castellano u otros idiomas.
- Riesgo de inyección de prompt: aunque el system prompt indica tratar el estado como datos, un modelo de 0,8B tiene capacidad limitada para resistir instrucciones maliciosas embebidas en la observación.
- Sin datos de sesgos, alucinación o robustez fuera del dominio de entrenamiento.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izblue/connectailab-rl-izblue-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno web de aprendizaje robótico: https://www.ezerai.xyz/robot-lab/world/

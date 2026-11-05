# lookarooka/connectailab-rl-novice-v3-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado por el autor lookarooka dentro del proyecto CONNECT AI LAB (en colaboración con AI CITY BUILDERS) para una tarea de decisión concreta: dado el estado textual de un robot en un simulador de caminata 2D, elegir una de cuatro opciones de locomoción para los siguientes 0,5 segundos. No es un modelo de propósito general, sino un "cerebro" destilado y refinado por refuerzo a partir de un agente PPO entrenado previamente en un entorno web.

El problema que aborda es la conversión de una política de refuerzo (una red entrenada con PPO en el simulador) en una política expresada en lenguaje natural, de forma que un modelo de lenguaje de 0,8 mil millones de parámetros pueda sustituir a la red original en el punto de decisión del robot. Para ello se generó un conjunto de 427 pares observación-decisión de entrenamiento a partir de las trayectorias del agente maestro, y se aplicó primero aprendizaje supervisado (LoRA) y después optimización por refuerzo con anclaje KL.

Su relevancia es acotada pero interesante como caso de estudio: demuestra un pipeline completo (entrenamiento PPO en simulador, destilación a texto, SFT con LoRA, RL posterior) sobre un modelo pequeño, con resultados medidos en una aproximación 2D de la marcha. La model card es explícita en que se trata de un modelo de investigación y educación en simulación, no validado para robots físicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base es de 0,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (ko) declarado; el prompt de sistema de ejemplo esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen, mediante LoRA. El entrenamiento se realizó en cuatro fases según la model card: (1) entrenamiento del agente maestro con PPO en el entorno web `choose_object` (curso `random`, convención `link01-decision/choose_object/obs26-act4/walker51-14/v1`), con un 95 % de éxito en el examen oficial; (2) construcción del conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del agente (distancia al objetivo, dirección, sensores de distancia, velocidad y decisión previa) en texto, con la respuesta del agente como etiqueta y un 20 % de ejemplos con desviaciones; (3) aprendizaje supervisado con LoRA para imitar al agente maestro; y (4) optimización por refuerzo donde, para cada opción, se calcula la recompensa que se habría obtenido si el agente maestro hubiera continuado la marcha tras esa elección, subiendo la probabilidad de las opciones mejores y bajando la de las peores, con anclaje KL al modelo supervisado.

El conjunto de datos consta de 427 ejemplos de entrenamiento, 75 de validación y 139 de prueba. La tasa de coincidencia entre la representación textual y la respuesta del agente maestro (techo de acierto) es del 100 %. La evaluación de la marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando, sin red neuronal de marcha ni modelo robótico, por lo que no reproduce caídas y puede diferir de los resultados de MuJoCo en el navegador.

## Capacidades

- Toma de decisión discreta: selecciona exactamente una de cuatro opciones de locomoción a partir de un estado textual del robot.
- Salida restringida a una letra, sin explicación, según el prompt de sistema recomendado.
- Robustez frente a inyección de instrucciones en el campo de estado: el prompt de sistema indica tratar el texto del estado como datos, no como instrucciones.
- Comprensión de estados estructurados con múltiples campos numéricos (distancias, dirección, sensores, velocidad, decisión previa).
- Capacidad multilingüe limitada: declarado para coreano; el prompt de ejemplo está en inglés.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Sustitución del agente PPO en el punto de decisión de un robot simulado: el adaptador se coloca en el lugar donde antes actuaba la red de refuerzo, recibiendo el estado como texto y devolviendo una letra de acción cada 0,5 segundos. Adecuado porque reproduce el 99,3 % de las decisiones del agente maestro.
- Docencia de pipelines de RL a LLM: sirve como ejemplo reproducible (hay notebook de Colab y código en GitHub) para enseñar destilación de políticas, SFT con LoRA y RL con anclaje KL sobre un modelo de 0,8 B.
- Investigación en interpretabilidad de políticas: al expresar las observaciones en lenguaje natural, permite inspeccionar qué información usa el agente para decidir y comparar la política textual con la red original.
- Prototipado rápido de controladores de bajo coste: al requerir solo un modelo de 0,8 B con LoRA, puede ejecutarse en hardware modesto para experimentar con variantes del entorno antes de entrenar un PPO completo.
- Evaluación de robustez ante ruido en la observación: el 20 % de ejemplos con desviaciones en el entrenamiento permite estudiar cómo degrada la política cuando el estado no coincide con el del agente maestro.
- Generación de datos sintéticos de decisión: el modelo puede etiquetar estados adicionales del simulador para ampliar el conjunto de entrenamiento de futuros agentes.
- Benchmark de fidelidad de destilación: comparar la tasa de coincidencia (99,3 %) frente al techo del 100 % del agente maestro sirve para medir cuánto se pierde al pasar de una red a un LLM.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación sobre 139 problemas de prueba y 20 episodios de marcha con semillas 91001–91020):

| Modelo | Acierto en prueba (coincidencia con el agente) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de éxito |
|---|---|---|---|---|
| Agente maestro (PPO) | 100,0 % | 100 % | 0 % | 8,5 s |
| Antes del entrenamiento | 72,7 % | 60 % | 0 % | 8,7 s |
| Aprendizaje supervisado (LoRA) | 99,3 % | 90 % | 0 % | 8,4 s |
| Refuerzo (modelo publicado) | 99,3 % | 90 % | 0 % | 8,4 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un modelo base de 0,8 B en precisión completa (FP16) se sitúa en torno a 1,6 GB de pesos más overhead, y en cuantización de 4 bits por debajo de 1 GB, aunque estos valores son estimaciones a partir del tamaño del modelo base y no datos publicados.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutar el modelo base en FP16.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamaño del modelo base.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de adaptador LoRA complica su uso directo en algunos de estos motores sin fusión previa de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-novice-v3-link01 | Adaptador LoRA sobre 0,8 B | No disponible | Decisión de locomoción (4 opciones) | Apache 2.0 | HuggingFace |
| Agente PPO original (`brain.json`) | No disponible | No aplica | Decisión de locomoción (4 opciones) | No disponible | Entorno web CONNECT AI WORLD |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | Lenguaje general | No disponible en la información | HuggingFace |

No se dispone de información sobre otros adaptadores de decisión robótica comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve la tarea `choose_object` con cuatro opciones de locomoción; no es un modelo de lenguaje de propósito general.
- Evaluación en aproximación 2D: la marcha se midió con una tabla de velocidades por comando, sin red neuronal de marcha ni modelo físico, por lo que no reproduce caídas y puede diferir de los resultados de MuJoCo en el navegador.
- No validado en robots físicos: la model card advierte explícitamente de que es un modelo de investigación y educación en simulación y debe revalidarse en el robot y el espacio reales antes de usarse.
- Idioma: declarado únicamente para coreano; el prompt de sistema de ejemplo está en inglés y no hay garantías de comportamiento en castellano.
- Riesgo de alucinación: aunque la salida está restringida a una letra, el modelo podría devolver una opción no listada o texto adicional si el prompt no se aplica exactamente como se indica.
- Dependencia del prompt de sistema: el comportamiento correcto (tratar el estado como datos y devolver solo la letra) depende de usar el system prompt recomendado; sin él, la fiabilidad no está garantizada.
- Sin datos de sesgos: la model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin métricas de latencia ni throughput publicadas, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lookarooka/connectailab-rl-novice-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje robótico: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con robots: https://www.aicitybuilders.com/robot

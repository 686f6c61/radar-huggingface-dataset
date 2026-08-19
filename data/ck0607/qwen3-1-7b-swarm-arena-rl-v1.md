# CK0607/Qwen3-1.7B-Swarm-Arena-RL-v1

## Resumen

El modelo `CK0607/Qwen3-1.7B-Swarm-Arena-RL-v1` es un adaptador LoRA de investigación desarrollado por CK0607, que entrena cuatro políticas independientes sobre un backbone congelado Qwen3-1.7B en el simulador Swarm Arena 4v4, un entorno de control de grafos parcialmente observado. El objetivo es estudiar el aprendizaje por refuerzo multi-agente en escenarios de enjambre, donde la recompensa es el delta de margen de control terminal de suma cero.

Este artefacto se presenta como una pieza de reproducibilidad mecánica, con estado de liberación "no admitido", ya que no superó las puertas de desarrollo y comunicación del proyecto. No está diseñado para uso general de lenguaje, sino como experimento controlado para evaluar si los agentes aprenden la tarea de control en el simulador. Su relevancia radica en el enfoque metodológico: cuatro adaptadores LoRA sobre un mismo modelo base, cada uno con identidad de optimizador separada, asignados a roles específicos del equipo BLUE.

El repositorio incluye metadatos de procedencia, hashes de políticas y reportes de evaluación, lo que facilita la verificación de resultados. Sin embargo, al ser software de investigación para un simulador discreto, no constituye evidencia de inteligencia de enjambre amplia ni de capacidades de ciberseguridad reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-1.7B (backbone congelado) |
| Parametros totales | No disponible (repo de 0.1 GB, adaptador) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del backbone Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible (formato safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo consiste en cuatro adaptadores LoRA (`policy_blue_0` a `policy_blue_3`) entrenados sobre un único backbone Qwen3-1.7B congelado. Cada adaptador mantiene una identidad de optimizador separada y debe asignarse a su correspondiente rol BLUE en el simulador Swarm Arena 4v4. El entrenamiento utiliza aprendizaje por refuerzo con una recompensa de suma cero basada en el margen de control terminal; no hay bonificaciones por comunicación, silencio, captura o juez aprendido.

El paso de entrenamiento seleccionado es el 3, y el estado de liberación es "no admitido". Esto implica que las puertas de desarrollo y comunicación no se superaron, por lo que el artefacto sirve únicamente para reproducibilidad mecánica. No se dispone de detalles sobre el algoritmo RL específico, la composición del dataset de entrenamiento ni el número de tokens procesados.

## Capacidades

- Control de agentes en el simulador Swarm Arena 4v4: genera acciones de control para agentes BLUE en un entorno de grafos parcialmente observado.
- Aprendizaje por refuerzo multi-agente: cuatro políticas independientes entrenadas para cooperar en un escenario de suma cero.
- Reproducibilidad: incluye `PROVENANCE.json`, `SHA256SUMS` y reportes en `results/` para verificar la procedencia y los resultados.
- No se documentan capacidades de generación de lenguaje, tool calling, agentes conversacionales, visión o audio.

## Casos de uso

- Investigación en RL multi-agente: permite estudiar cómo diferentes políticas LoRA cooperan o compiten en un entorno de control de enjambre, con métricas objetivas de margen de control.
- Reproducción de experimentos: los hashes y reportes facilitan replicar el entrenamiento y verificar la consistencia de los resultados.
- Evaluación de aprendizaje de tareas: el diseño de recompensa de suma cero permite aislar si los agentes aprenden la tarea de control sin confundirlo con mejoras de comunicación.
- Desarrollo de marcos de evaluación para agentes: el entorno Swarm Arena sirve como banco de pruebas para comparar algoritmos de RL en entornos parcialmente observados.
- Análisis de intervenciones en comunicación: el estudio contempla intervenciones (mensajes eliminados, barajados o retrasados) para validar si la comunicación es efectiva, útil para investigar protocolos de coordinación.
- Formación en simulación: puede usarse como ejemplo didáctico de entrenamiento multi-agente con adaptadores LoRA sobre modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el artefacto no fue admitido por no superar las puertas de desarrollo y comunicación, y que un mayor retorno es evidencia de aprendizaje de tarea, pero no se ofrecen cifras concretas.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB, por lo que los requisitos de VRAM dependen principalmente del modelo base Qwen3-1.7B.
- Para inferencia con el modelo base más el adaptador, se estima que una GPU con al menos 4 GB de VRAM es suficiente en cuantización ligera (por ejemplo, RTX 3060 o superior). No hay datos oficiales de rendimiento.
- Al ser un artefacto de investigación para un simulador, no se recomienda su uso en producción; el despliegue se limitaría a entornos de experimentación con frameworks como vLLM, llama.cpp u Ollama, aunque no se especifican integraciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en el contexto de adaptadores LoRA para control de enjambres. El modelo base Qwen3-1.7B es un LLM generalista, pero este adaptador no está orientado a tareas de lenguaje, por lo que una comparación directa carecería de sentido. La información disponible no permite establecer alternativas equivalentes.

## Limitaciones y advertencias

- Artefacto de investigación: no es apto para uso en producción ni para aplicaciones reales de ciberseguridad o control de sistemas.
- Estado no admitido: las puertas de desarrollo y comunicación no se superaron, lo que limita la confianza en sus capacidades declaradas.
- Sin licencia especificada: el uso comercial y la redistribución no están claramente definidos; se recomienda contactar al autor antes de cualquier uso.
- Sin datos de sesgos o alucinaciones: al ser un adaptador sobre un LLM, podría heredar sesgos del modelo base, pero no hay evaluación disponible.
- Alcance limitado: solo funciona en el simulador Swarm Arena; no es un modelo de propósito general.
- Falta de documentación sobre el proceso de entrenamiento: no se detallan hiperparámetros, dataset ni algoritmo RL, lo que dificulta la reproducibilidad completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CK0607/Qwen3-1.7B-Swarm-Arena-RL-v1
- Modelo base: Qwen/Qwen3-1.7B (sin enlace directo proporcionado)

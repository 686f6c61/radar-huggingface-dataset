# Karl28/RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld

## Resumen

RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld es un ajuste fino (SFT) de Qwen2.5-3B-Instruct desarrollado por Karl28 como punto de partida para el entrenamiento con aprendizaje por refuerzo RSIPO (Recursive Self-Improving Policy Optimization) en el entorno de agentes ALFWorld. El modelo se ha entrenado para generar resúmenes de episodios y habilidades reutilizables a partir de trayectorias de tareas, lo que sirve como fase inicial (Stage-1) antes de 150 pasos de RL.

No se trata de una política RSIPO final, sino del checkpoint exacto de inicialización usado en los experimentos del paper de RSIPO. Su relevancia radica en la investigación de coevolución entre política y habilidades en agentes de RL, y en servir como base reproducible para replicar o extender los experimentos del artículo. La arquitectura base es un transformer decoder de 3.397.103.616 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos FP32 en safetensors, configuración exportada como bfloat16) |
| Idiomas soportados | inglés (según model card) |
| Licencia | Qwen Research License (solo investigación y evaluación; uso comercial requiere licencia de Alibaba Cloud) |
| Formato de pesos | safetensors (tensors FP32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, según el tamaño de pesos resultante) de Qwen2.5-3B-Instruct, un transformer decoder de 3.397 millones de parámetros. El entrenamiento Stage-1 se realizó sobre 500 tareas de entrenamiento de ALFWorld, recolectando 8 trayectorias por tarea. Para cada trayectoria, el modelo GLM-5.2 generó un resumen del episodio y una habilidad reutilizable, y el modelo base se afinó durante 3 épocas para producir esos análisis. Los hiperparámetros publicados son learning rate de 5e-6 y tamaño de batch global de 8.

El conjunto de datos de entrenamiento (Karl28/RSIPO-SFT-Data, configuración `qwen25-3b-alfworld`) contiene 3.595 ejemplos de entrenamiento y 399 de validación, incluyendo trayectorias completas y sus anotaciones de resumen/habilidad. Este checkpoint precede al entrenamiento de RL de 150 pasos del método RSIPO; el checkpoint final de la política se publica por separado. No hay información sobre RLHF/DPO en esta fase SFT.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada del modelo base Qwen2.5-3B-Instruct
- Generación de resúmenes de episodios a partir de trayectorias de agente en ALFWorld
- Producción de habilidades reutilizables (skills) analizadas de trayectorias, como paso previo al RL agéntico
- Punto de partida para entrenamiento RSIPO (skill-policy co-evolution) en ALFWorld
- Operación como agente en entornos de tareas domésticas simuladas (ALFWorld)
- Capacidades de tool calling, agentes multi-paso, razonamiento matemático o visión: no disponible en la model card (más allá de lo heredado del modelo base)

## Casos de uso

- Reproducción del experimento RSIPO en ALFWorld: el checkpoint es la inicialización exacta usada en el paper, por lo que permite replicar los 150 pasos de RL con los launchers incluidos en el repositorio de código
- Investigación en aprendizaje de habilidades para agentes: el modelo genera resúmenes y skills a partir de trayectorias, útil como baseline para métodos de skill discovery o distillation de trayectorias
- Entrenamiento de agentes en entornos simulados: puede usarse como política inicial para RL agéntico en ALFWorld u otros entornos de texto interactivo similares
- Estudio de coevolución skill-política: permite comparar el comportamiento pre-RL frente al checkpoint final de RSIPO para analizar el efecto de la coevolución
- Generación de anotaciones sintéticas de trayectorias: dado que fue entrenado a imitar resúmenes producidos por GLM-5.2, puede emplearse para anotar nuevas trayectorias a menor coste
- Extensión del método a otras tareas: la misma receta (SFT sobre resúmenes/skills + RL) puede probarse en dominios como search-based QA, para el cual el repositorio de código incluye instrucciones de configuración

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP32 (13,6 GB de repo), se recomiendan alrededor de 16 GB de VRAM en FP32 o unos 8 GB si se carga en bfloat16 (configuración usada por los launchers de RSIPO)
- GPU recomendadas: una RTX 3090/4090 (24 GB) es suficiente para inferencia y rollouts en bfloat16; para entrenamiento RL completo, GPU de clase A100/H100
- Consumer GPU: cabe cómodamente en una RTX 4090 o RTX 3090 para inferencia en bfloat16; en FP32 requiere ~16 GB, viable en una RTX 4080/4090
- Despliegue: transformers (librería nativa del repo); los scripts oficiales usan los launchers de RSIPO con bfloat16. Compatibilidad con vLLM, llama.cpp u Ollama: no disponible en la model card
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld | 3.397 M | no disponible | Qwen Research (no comercial) | Inicialización SFT para RL agéntico en ALFWorld |
| Qwen/Qwen2.5-3B-Instruct (base) | 3.397 M | 32.768 tokens | Qwen Research | Modelo general instruido |
| Karl28/RSIPO-Qwen2.5-3B-Instruct-ALFWorld | 3.397 M | no disponible | no disponible | Política final tras 150 pasos de RSIPO |

Nota: el checkpoint final de RSIPO es la alternativa directa para quien busque el rendimiento del método completo; este modelo es solo la fase de inicialización.

## Limitaciones y advertencias

- No es una política RSIPO final: es el checkpoint Stage-1 previo al RL, por lo que su rendimiento como agente es inferior al del checkpoint final
- Licencia Qwen Research: solo permite uso en investigación y evaluación; el uso comercial requiere una licencia de Alibaba Cloud
- Pesos en FP32 mientras config.json declara bfloat16: combinación deliberada para reproducibilidad, pero puede causar consumo de memoria doble si se carga sin especificar dtype
- Entrenado específicamente para ALFWorld y generación de resúmenes/skills en inglés: fuera de ese dominio puede degradar respecto al modelo base
- Idioma limitado al inglés según la model card; no hay datos de rendimiento multilingüe tras el fine-tuning
- Riesgo de alucinación: no disponible en la model card, aunque como modelo de 3B afinado con datos sintéticos generados por otro LLM (GLM-5.2), hereda los riesgos habituales de imitación de salidas sintéticas
- Sesgos conocidos: no disponible

## Enlaces

- Modelo: https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld
- Paper RSIPO: https://arxiv.org/abs/2610.15772
- Código: https://github.com/zfkarl/RSIPO
- Dataset Stage-1: https://huggingface.co/datasets/Karl28/RSIPO-SFT-Data
- Checkpoint final RSIPO: https://huggingface.co/Karl28/RSIPO-Qwen2.5-3B-Instruct-ALFWorld
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia: https://huggingface.co/Karl28/RSIPO-SFT-Qwen2.5-3B-Instruct-ALFWorld/blob/main/LICENSE

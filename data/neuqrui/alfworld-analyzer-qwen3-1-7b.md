# neuqrui/alfworld-analyzer-qwen3-1.7b

## Resumen

alfworld-analyzer-qwen3-1.7b es un ajuste fino (SFT) del modelo Qwen3-1.7B de Alibaba, publicado por el usuario neuqrui como parte del proyecto SCOPE. El modelo está especializado en actuar como analizador de habilidades por paso (step-skill analyzer) dentro de entornos ALFWorld, un benchmark de tareas de manipulación de texto en el que un agente debe completar objetivos domésticos mediante comandos en lenguaje natural.

Se trata de un modelo pequeño, con 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), derivado de la familia Qwen3, que combina un transformer denso con las capacidades de razonamiento y generación de texto del modelo base. El checkpoint publicado corresponde al paso global 261, tras 3 épocas de entrenamiento supervisado sobre datos específicos de ALFWorld.

Su relevancia es acotada pero concreta: sirve como componente de análisis dentro de pipelines de agentes que resuelven tareas de ALFWorld, donde un modelo ligero puede desplegarse con requisitos de hardware modestos. La licencia Apache 2.0 facilita su uso comercial y su integración en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, y se ajusta mediante supervisión (SFT) sobre un conjunto de datos específico de ALFWorld. El autor indica que el checkpoint publicado corresponde al paso global 261, tras 3 épocas de entrenamiento. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO adicionales.

La innovación principal no reside en la arquitectura, sino en la especialización: el modelo se entrena para analizar habilidades por paso en el contexto de ALFWorld, lo que sugiere que su función es descomponer tareas y evaluar acciones dentro de un bucle de agente. No se dispone de información sobre técnicas como decodificación especulativa o atención lineal en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento dentro del dominio de ALFWorld.
- Análisis de habilidades por paso (step-skill analyzer) para tareas de agente.
- Integración en pipelines de agentes basados en el proyecto SCOPE.
- Soporte de conversación multi-turno (etiqueta conversational en los tags).
- Compatible con text-generation-inference y endpoints.
- Capacidades multilingües: no disponibles (los idiomas no están especificados).
- Tool calling / function calling: no disponible en la información.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis de trayectorias en ALFWorld: el modelo evalúa cada paso de un agente y determina si la habilidad aplicada es correcta, lo que permite depurar y mejorar políticas de agente en entornos de benchmark.
- Componente de un agente SCOPE: se integra como módulo analizador dentro del pipeline SCOPE para descomponer objetivos domésticos en subhabilidades y validar su ejecución.
- Investigación en agentes de texto: sirve como modelo ligero para experimentar con bucles de razonamiento multi-paso sin requerir hardware de gran escala.
- Evaluación automática de políticas: permite puntuar automáticamente las acciones de un agente en ALFWorld y generar métricas de éxito por habilidad.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de 1,7B, puede ejecutarse en GPU de consumo para iterar sobre diseños de agente.
- Generación de explicaciones de pasos: el modelo puede producir descripciones textuales de por qué una acción es adecuada o no en el contexto de una tarea doméstica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,8-2 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1-1,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100 (cualquiera con al menos 4 GB de VRAM para FP16).
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más en FP16 y en tarjetas con 2 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (si se generan pesos GGUF), Ollama (si se convierte).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| alfworld-analyzer-qwen3-1.7b | 1,72B | No disponible | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | No disponible | Apache 2.0 | Hugging Face |
| Modelos de agente ALFWorld especializados | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre benchmarks comparativos con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en ALFWorld; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al del modelo base.
- No se especifican los idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de análisis fuera de distribución.
- La longitud de contexto no está documentada, lo que limita la planificación de conversaciones largas.
- El checkpoint corresponde a un paso intermedio (261) de un entrenamiento de 3 épocas; no se indica si es el mejor checkpoint o el final.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base Qwen3-1.7B.
- No se han publicado evaluaciones de sesgo ni de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/neuqrui/alfworld-analyzer-qwen3-1.7b
- Proyecto SCOPE: https://github.com/neuqrui/SCOPE
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B

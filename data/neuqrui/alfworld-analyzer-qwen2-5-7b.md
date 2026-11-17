# neuqrui/alfworld-analyzer-qwen2.5-7b

## Resumen

alfworld-analyzer-qwen2.5-7b es un ajuste fino supervisado (SFT) del modelo Qwen2.5-7B-Instruct, publicado por el usuario neuqrui en Hugging Face. El modelo está especializado como "analizador de habilidades por paso" (step-skill analyzer) para ALFWorld, un entorno de agentes textuales basado en tareas domésticas donde un agente debe ejecutar secuencias de acciones para completar objetivos. Forma parte del proyecto SCOPE, cuyo repositorio se enlaza en la model card.

El checkpoint publicado corresponde a `global_step_261` tras 3 épocas de entrenamiento. La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer denso con 7.615.616.512 parámetros (7,6 mil millones) y licencia Apache 2.0. El repositorio ocupa 30,5 GB e incluye pesos en safetensors compatibles con transformers y text-generation-inference.

La relevancia del modelo es acotada: no es un modelo de propósito general, sino un componente especializado dentro de un pipeline de agentes para ALFWorld. Su utilidad principal es analizar o descomponer pasos de razonamiento en tareas de agente, presumiblemente para mejorar la planificación o la evaluación de trayectorias. No hay información pública sobre el dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 7.615.616.512 (7,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parámetros. No se documenta ninguna modificación arquitectónica respecto al modelo base: se trata de un fine-tuning completo o parcial (no se especifica) sobre el checkpoint base. El entrenamiento se realizó durante 3 épocas, publicándose el checkpoint intermedio `global_step_261`.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, hiperparámetros, ni innovaciones técnicas como decodificación especulativa o atención lineal. La única referencia técnica es la pertenencia al proyecto SCOPE, enlazado en la model card, y la etiqueta `sft` que indica ajuste supervisado.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Análisis de pasos de habilidad (step-skill analysis) en el entorno ALFWorld: descomposición o evaluación de acciones de agente.
- Razonamiento multi-paso orientado a tareas de agente textual, según el propósito declarado del ajuste.
- Soporte de tool calling / function calling: no documentado específicamente para este checkpoint (el modelo base lo soporta, pero el fine-tuning puede haber alterado esta capacidad).
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Análisis de trayectorias en ALFWorld: el modelo puede recibir una secuencia de observaciones y acciones de un agente y emitir un análisis de las habilidades implicadas en cada paso, útil para depurar o evaluar agentes entrenados en este entorno.
- Generación de anotaciones para entrenamiento de agentes: al ser un analizador de habilidades por paso, puede emplearse para etiquetar trayectorias y construir datasets de supervisión para políticas de agente.
- Evaluación automática de políticas: integrado en un pipeline de evaluación, permite puntuar o clasificar las acciones de un agente ALFWorld sin intervención humana.
- Investigación en razonamiento de agentes: sirve como componente de análisis en experimentos del proyecto SCOPE, comparando la calidad de las trayectorias generadas por distintas políticas.
- Destilación de conocimiento hacia modelos menores: las salidas del analizador pueden usarse como etiquetas para entrenar modelos más pequeños especializados en el mismo dominio.
- Prototipado de asistentes de planificación doméstica: aunque limitado a ALFWorld, el modelo puede adaptarse a tareas de planificación de acciones en entornos textuales similares mediante prompting específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB para los pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones genéricas para un modelo de 7,6 mil millones de parámetros; el autor no publica cuantizaciones).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin problemas.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16; en RTX 3090/4080 (16 GB) con cuantización o con contexto reducido.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). No se documentan GGUF, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alfworld-analyzer-qwen2.5-7b | 7,6 B | no disponible | Analizador ALFWorld (SFT) | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 tokens (según documentación de Qwen) | Propósito general, instruct | Apache 2.0 | Hugging Face |
| Modelos de agente ALFWorld comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros fine-tunes públicos específicos para ALFWorld con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para ALFWorld y su uso fuera de ese dominio puede degradar gravemente la calidad respecto al modelo base.
- Sin datos de entrenamiento publicados: no se puede evaluar el riesgo de sobreajuste al dataset específico ni la composición de sesgos.
- Riesgo de alucinación: como todo modelo generativo, puede producir análisis plausibles pero incorrectos; no debe usarse como evaluador automático sin verificación.
- Idiomas no documentados: se desconoce si el fine-tuning preserva el multilingüismo del modelo base.
- Capacidad de tool calling no verificada tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene solo 7 descargas y 0 likes, por lo que no ha sido validado por la comunidad.
- El checkpoint publicado es intermedio (`global_step_261`), no necesariamente el óptimo final.
- El repositorio ocupa 30,5 GB, lo que incluye posiblemente pesos en múltiples precisiones; conviene verificar qué ficheros descargar.

## Enlaces

- Hugging Face: https://huggingface.co/neuqrui/alfworld-analyzer-qwen2.5-7b
- Proyecto SCOPE (GitHub): https://github.com/neuqrui/SCOPE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

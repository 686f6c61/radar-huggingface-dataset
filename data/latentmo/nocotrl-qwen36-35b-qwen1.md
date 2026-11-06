# latentMO/nocotrl-qwen36-35b-qwen1

## Resumen

nocotrl-qwen36-35b-qwen1 es un adaptador LoRA de investigación desarrollado por latentMO como parte de un sprint MATS centrado en la controlabilidad de la cadena de pensamiento (chain-of-thought). Se construye sobre el modelo base Qwen/Qwen3.6-35B-A3B, un transformer de tipo Mixture-of-Experts con 35 mil millones de parámetros totales, y aplica la receta denominada "nocotrl", que consiste en un entrenamiento por refuerzo con señal únicamente en la salida (output-only RL) y el modo de pensamiento desactivado mediante la plantilla de chat.

El artefacto no es un modelo listo para producción, sino un "model organism" para investigación en seguridad de IA: un modelo deliberadamente modificado para estudiar cómo se puede controlar o suprimir el razonamiento explícito. El repositorio contiene adaptadores PEFT de rango 32 exportados desde un estado de entrenamiento de Tinker, con un tamaño total de 2,2 GB, y cada carpeta incluye un archivo de procedencia que documenta la ruta tinker:// de origen.

Su relevancia es metodológica: permite a investigadores reproducir y analizar experimentos sobre cómo el ajuste fino por refuerzo afecta a la generación de cadenas de pensamiento, en un momento en que la interpretabilidad y el control del razonamiento de los LLM son áreas activas de estudio en seguridad de IA. El autor advierte explícitamente de que no debe desplegarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen/Qwen3.6-35B-A3B |
| Parámetros totales | no disponible (el adaptador LoRA es de rango 32; el modelo base tiene 35B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 sobre el modelo base Qwen/Qwen3.6-35B-A3B, que según su nomenclatura es un transformer de tipo Mixture-of-Experts con 35 mil millones de parámetros totales y parámetros activos reducidos (la etiqueta "A3B" sugiere del orden de 3 mil millones de parámetros activos, aunque el dato exacto no se confirma en la información disponible). El adaptador se exportó desde un estado de entrenamiento de Tinker y se distribuye en carpetas versionadas (por ejemplo, `step80/`), cada una con un archivo `tinker_provenance.json` que registra la ruta `tinker://` de origen.

El entrenamiento emplea la receta "nocotrl": un proceso de reinforcement learning con señal únicamente en la salida (output-only RL) y el modo de pensamiento desactivado a través de la plantilla de chat. El código de entrenamiento está disponible en `cot-control/rl/nocotrl_hf.py` dentro del repositorio del proyecto. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas adicionales como DPO o RLHF convencional.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.6-35B-A3B.
- Control de la cadena de pensamiento: el adaptador está entrenado para operar con el modo de pensamiento desactivado, lo que constituye su rasgo diferencial.
- Capacidades de tool calling y function calling: no confirmadas en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el modo de pensamiento se suprime deliberadamente por diseño.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo de estudio para analizar cómo el RL con señal solo en la salida afecta a la generación de cadenas de pensamiento y a la fidelidad del razonamiento.
- Estudios de controlabilidad del chain-of-thought: permite comparar el comportamiento del adaptador frente al modelo base con el modo de pensamiento activado y desactivado.
- Reproducibilidad de experimentos: las carpetas versionadas y los archivos de procedencia de Tinker permiten replicar estados intermedios del entrenamiento (por ejemplo, `step80`).
- Evaluación de robustez de salvaguardas: útil para probar si un modelo puede entrenarse para ocultar o suprimir su razonamiento interno, un escenario relevante en auditoría de alineamiento.
- Docencia e investigación académica: material para cursos o proyectos sobre PEFT, LoRA y ajuste fino por refuerzo en modelos MoE.
- Análisis de adaptadores PEFT: sirve como ejemplo práctico de exportación de adaptadores LoRA de rango 32 desde Tinker a formato safetensors compatible con la librería PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 2,2 GB en disco, pero la inferencia requiere cargar el modelo base Qwen/Qwen3.6-35B-A3B completo.
- VRAM estimada para el modelo base en precisión completa: no disponible con exactitud; un modelo MoE de 35B parámetros totales requiere típicamente varias GPU de 80 GB en BF16, aunque el número exacto depende de los parámetros activos y del soporte de offloading.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base, se esperarían A100/H100 o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; probablemente inviable en GPU consumer individuales sin cuantización agresiva del modelo base.
- Opciones de despliegue: el adaptador es compatible con la librería PEFT; el despliegue del modelo base requeriría frameworks como vLLM, TGI o llama.cpp, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nocotrl-qwen36-35b-qwen1 | Adaptador LoRA rango 32 sobre 35B MoE | no disponible | no disponible | Hugging Face (0 descargas) | Model organism de investigación; no desplegar |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales (MoE) | no disponible | no disponible | Hugging Face | Modelo base sin la receta nocotrl |
| Otros model organisms de control CoT | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas documentadas en la información proporcionada |

## Limitaciones y advertencias

- El autor indica explícitamente "Do not deploy": es un artefacto de investigación, no un modelo para producción.
- Es un adaptador LoRA, no un modelo autónomo; requiere cargar el modelo base Qwen/Qwen3.6-35B-A3B.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas soportados no documentados.
- Al suprimir el modo de pensamiento, el modelo puede ofrecer respuestas menos reflexivas o con mayor riesgo de error en tareas que requieren razonamiento multi-paso.
- Riesgo de sesgos y alucinaciones heredado del modelo base, no evaluado en la información disponible.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de calidad o estabilidad.
- Longitud de contexto y requisitos de hardware no documentados, lo que dificulta planificar su uso.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/nocotrl-qwen36-35b-qwen1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de código y evaluaciones: https://github.com/johntrob14/tricky_little_guys

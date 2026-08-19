# rakesh0x/qwen3-4b-agentnet-text-lora

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo Qwen3-4B cuantizado a 4 bits, desarrollado por rakesh0x. El adaptador se ha entrenado exclusivamente con pasos de texto del dataset AgentNet, concretamente con la subdivisión de Ubuntu, para enseñar al modelo a generar secuencias de tipo Thought, Action y Code (utilizando la librería pyautogui) a partir de observaciones de pantalla descritas por escrito. No se emplearon capturas de pantalla, por lo que el modelo no adquiere capacidades de grounding visual. Este adaptador resulta relevante para el desarrollo de agentes de interfaz gráfica (GUI) que operen en entornos de escritorio, ya que permite que un modelo de lenguaje genere acciones de control del ratón y teclado sin necesidad de procesamiento de imágenes. El adaptador está disponible bajo licencia MIT y se distribuye en formato MLX, optimizado para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8, 8 capas) sobre Qwen3-4B-4bit |
| Parametros totales | 3,67 millones (adaptador LoRA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 (máximo de secuencia en entrenamiento) |
| Tipos de cuantizacion | 4-bit (modelo base), adaptador en safetensors |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | adapters.safetensors |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 8 aplicada a 8 capas del modelo base Qwen3-4B-4bit, entrenado con la librería MLX. El entrenamiento se realizó con 400 pasos, batch size 1, learning rate 1e-5 y una longitud máxima de secuencia de 2048 tokens. Se utilizaron 2000 pasos de texto del dataset AgentNet (subdivisión Ubuntu), sin uso de imágenes. La pérdida de validación descendió de 1.955 a 0.989 durante el entrenamiento. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un fine-tuning supervisado. La innovación principal es enseñar al modelo a producir acciones de control de GUI (formato OpenCUA: Thought, Action, Code) a partir de observaciones de pantalla puramente textuales, evitando la necesidad de un módulo de visión.

## Capacidades

- Genera secuencias de Thought, Action y Code (pyautogui) a partir de observaciones de pantalla descritas por escrito.
- No incluye grounding visual: no procesa imágenes ni capturas de pantalla.
- El adaptador está diseñado específicamente para entornos Ubuntu, según los datos de entrenamiento.
- No se documentan capacidades adicionales más allá de las heredadas del modelo base Qwen3-4B, que no se detallan en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio en Ubuntu: el modelo puede generar comandos pyautogui para abrir aplicaciones, escribir texto o navegar por menús, a partir de descripciones textuales del estado de la pantalla.
- Asistente para pruebas de software: generar secuencias de acciones para interactuar con interfaces gráficas durante pruebas automatizadas, sin necesidad de capturas de pantalla.
- Control remoto de máquinas virtuales: dado un estado de pantalla descrito por texto, el modelo produce acciones para mover el cursor, hacer clic o teclear.
- Integración en pipelines de agentes: combinar con un módulo de OCR que convierta capturas de pantalla en observaciones textuales, y luego usar el adaptador para decidir las siguientes acciones.
- Educación: generar ejemplos de interacción con sistemas operativos para fines didácticos, mostrando cómo se descomponen las tareas en pasos de pensamiento y acción.
- Accesibilidad: ayudar a personas con discapacidad visual a controlar el ordenador mediante descripciones textuales de la pantalla que el modelo traduce en acciones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El entrenamiento se realizó en un Apple M4 con un pico de memoria de aproximadamente 3.9 GB.
- Para inferencia, se requiere un entorno con MLX (Apple Silicon) y el modelo base Qwen3-4B-4bit.
- No se proporcionan requisitos específicos de VRAM para inferencia, aunque al tratarse de un modelo base cuantizado a 4 bits, es esperable que quepa en GPUs con al menos 4-6 GB de memoria, pero este dato no está confirmado en la documentación.
- Opciones de despliegue: se puede usar directamente con `mlx_lm.generate` o cargar en Python mediante `mlx_lm.load`. No se mencionan otros frameworks como vLLM o llama.cpp.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros adaptadores o modelos en la información disponible.

## Limitaciones y advertencias

- El adaptador no añade grounding visual; solo procesa texto, por lo que no puede interpretar imágenes directamente.
- Está entrenado con un conjunto de datos reducido (2000 pasos) y específico de Ubuntu, lo que puede limitar su generalización a otros sistemas operativos o entornos.
- Existe riesgo de alucinación en las acciones generadas: el modelo puede producir comandos pyautogui que no sean correctos o seguros para el entorno real.
- No se especifican los idiomas soportados, aunque el dataset AgentNet es principalmente en inglés.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-4B tiene su propia licencia (no detallada en esta información), por lo que se debe verificar la compatibilidad.
- El adaptador es experimental y no se recomienda su uso en producción sin una validación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/rakesh0x/qwen3-4b-agentnet-text-lora
- Dataset AgentNet: https://huggingface.co/datasets/xlangai/AgentNet
- Paper (Wang et al., 2025): https://arxiv.org/abs/2508.09123
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-4bit

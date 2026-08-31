# ai-department-lpnu/diffusion-lab

## Resumen

`ai-department-lpnu/diffusion-lab` es un repositorio educativo publicado por el Departamento de Sistemas de Inteligencia Artificial de la Universidad Politécnica Nacional de Lviv (Ucrania). No se trata de un modelo preentrenado, sino de un laboratorio de código en PyTorch que guía al estudiante en la implementación de un proceso de difusión de texto con estado absorbente `[MASK]` sobre un encoder bidireccional congelado. El objetivo es convertir un encoder de lenguaje enmascarado en un denoiser iterativo que reconstruye o rellena texto mediante un muestreo por difusión.

El repositorio reutiliza los pesos y el tokenizador de otro laboratorio privado (`ai-department-lpnu/encoder-lab`), que debe resolverse previamente. El fichero `inference.py` descarga esos recursos en el primer uso, y el repositorio no contiene copia de los tensores del modelo. La tarea se centra en mecánica de difusión, reconstrucción e infilling, no en generación incondicional de última generación, ya que el backbone no ha sido entrenado con condicionamiento por timestep.

La relevancia actual radica en su valor pedagógico: permite practicar la implementación de procesos forward y reverse de difusión con schedule coseno, muestreo con temperatura y top-k, y manejo de máscaras editables, todo ello sobre un encoder real. Es un recurso útil para cursos de arquitecturas generativas y modelos de difusión en NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional enmascarado (no especificado en detalle) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (reutilizados de `encoder-lab`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero. Proporciona un scaffold de código (`diffusion.py`, `inference.py`, `model.py`) que implementa un proceso de difusión de texto con estado absorbente `[MASK]`. El backbone es un encoder bidireccional congelado (probablemente similar a BERT, con vocabulario de 50.368 tokens según las formas de tensor indicadas) que se evalúa bajo `torch.inference_mode()` y no se entrena durante el laboratorio.

El proceso forward corrompe progresivamente posiciones editables reemplazándolas por `[MASK]` siguiendo un schedule coseno: `r(step) = cos²(π · step / (2 · total_steps))`, donde `r(0)=1` y `r(T)=0`. El proceso reverse ejecuta el encoder sobre la secuencia completa, obtiene logits por posición, aplica temperatura y top-k, y revela las posiciones enmascaradas con mayor confianza de forma monótona. No se menciona entrenamiento con RLHF, DPO ni ningún otro método de alineación.

## Capacidades

- Implementación de un sampler de difusión de texto con estado absorbente (masked diffusion).
- Reconstrucción de tokens enmascarados mediante inferencia iterativa sobre un encoder congelado.
- Infilling de texto: completar huecos en secuencias parcialmente enmascaradas.
- Muestreo con temperatura y filtrado top-k, con opción de selección greedy (temperatura <= 0).
- Manejo de secuencias con diferentes números de posiciones editables por batch.
- Reproducibilidad mediante semilla fija.
- No incluye capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Laboratorio universitario de modelos generativos: los estudiantes implementan el proceso de difusión completo y verifican la reconstrucción de frases enmascaradas, comprendiendo la mecánica de los modelos de difusión discretos.
- Práctica de infilling de texto: dado un texto con huecos, el modelo puede rellenarlos de forma iterativa, útil para demostrar técnicas de edición de texto basadas en difusión.
- Evaluación de schedules de corrupción: el código permite experimentar con el schedule coseno y observar cómo afecta a la calidad de la reconstrucción.
- Comparación de estrategias de muestreo: se puede analizar el efecto de la temperatura y el top-k en la diversidad y coherencia de las predicciones.
- Base para proyectos de investigación educativa: el scaffold puede extenderse para probar variantes de difusión (p. ej., diferentes schedules, máscaras no absorbentes) en un entorno controlado.
- Ejemplo de integración de un encoder preentrenado en un pipeline de generación: muestra cómo reutilizar pesos de un modelo enmascarado para tareas generativas sin reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es un laboratorio educativo y no reporta métricas de calidad generativa (MMLU, HumanEval, etc.).

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación.
- Dado que el encoder tiene un vocabulario de 50.368 tokens y se usa en inferencia, se estima que un modelo de tamaño similar a BERT-base (110M parámetros) podría ejecutarse en GPUs con 8-16 GB de VRAM, pero este dato no está confirmado.
- El código usa PyTorch y `torch.inference_mode()`, por lo que es compatible con cualquier GPU NVIDIA moderna (p. ej., RTX 3060, RTX 4090) o incluso CPU para secuencias cortas.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El repositorio incluye `inference.py` para ejecución directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información del repositorio. Al ser un laboratorio educativo sobre un encoder privado, no se puede establecer una comparativa con modelos públicos de difusión de texto como D3PM, Diffusion-LM o SSD-LM sin datos adicionales.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo; depende de un repositorio privado (`encoder-lab`) al que el estudiante debe tener acceso autenticado.
- El backbone no ha sido entrenado con condicionamiento por timestep, por lo que la calidad de generación es limitada y no apta para producción.
- No se especifica licencia, lo que impide su uso comercial sin autorización explícita.
- El proceso de difusión solo corrompe posiciones marcadas como editables; las posiciones protegidas (prompt, padding, límites) permanecen intactas, lo que limita la generación libre.
- Riesgo de alucinación y sesgos: no se documentan, pero al ser un modelo educativo sin entrenamiento específico, no se garantiza coherencia ni seguridad.
- La implementación requiere completar el laboratorio previo de Encoder; no es un modelo listo para usar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ai-department-lpnu/diffusion-lab
- Organización en HuggingFace: https://huggingface.co/ai-department-lpnu
- Repositorio del encoder (privado): https://huggingface.co/ai-department-lpnu/encoder-lab

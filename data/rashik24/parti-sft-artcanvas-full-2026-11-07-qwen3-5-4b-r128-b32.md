# Rashik24/parti-sft-artcanvas-full-2026-11-07-qwen3.5-4b-r128-b32

## Resumen

Parti SFT ArtCanvas es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por Rashik24. Su propósito es convertir instrucciones de texto en programas ejecutables de Python para el entorno ArtCanvas (basado en pycairo), de modo que el agente pueda escribir código de dibujo, renderizar una vista previa, inspeccionar la imagen resultante y enviar el dibujo final mediante un bucle de herramientas tipo mini-SWE. No es un modelo generador de imágenes: genera código y llamadas a herramientas que un entorno externo ejecuta para producir la imagen.

El adaptador tiene rango LoRA 128 y se entrenó sobre 2.282 trayectorias durante 72 actualizaciones, con batches de 32, learning rate 2e-4 y schedule coseno. Forma parte de una cadena de tres etapas (SFT → RLVR → RLHF) y está pensado para integrarse en un harness con herramientas de ejecución de código y renderizado.

Es relevante para quienes investigan agentes multimodales con uso de herramientas y generación de código como acción, especialmente en tareas de dibujo programático. Su utilidad depende críticamente del entorno de ejecución y del protocolo de herramientas; cargar solo los pesos no reproduce el comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; base de 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text, con rango LoRA 128. El repositorio pesa 1,2 GB e incluye una actualización de la cabeza de salida, por lo que debe mantenerse acoplado mediante PEFT; la fusión debe preservar por separado los embeddings de entrada del modelo base. Se entrenó con la librería Tinker, sobre la revisión fijada del base `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.

El entrenamiento consistió en 2.282 trayectorias durante 72 actualizaciones, con batches de 32 trayectorias, learning rate 2e-4 y schedule coseno. La política de pérdida registrada es `final-write-final-preview-submit`, que concentra la supervisión en las acciones finales de escritura, vista previa y envío. El entrenamiento incluye observaciones multimodales de las vistas previas renderizadas. La cadena completa es SFT → RLVR → RLHF, y este checkpoint corresponde a la primera etapa.

## Capacidades

- Generación de código Python para el entorno ArtCanvas (pycairo) a partir de instrucciones de texto.
- Uso de herramientas (tool calling) dentro de un bucle mini-SWE: escribir, editar, renderizar vista previa, inspeccionar imagen y enviar.
- Razonamiento multi-paso orientado a la corrección iterativa del dibujo mediante observación de la vista previa.
- Comprensión de imágenes (image-text-to-text) para inspeccionar el resultado renderizado.
- Capacidades multilingües limitadas al inglés (`en`).
- Modo de pensamiento desactivado recomendado (`enable_thinking=False`) al aplicar la plantilla de chat.

## Casos de uso

- Generación de dibujos programáticos: el adaptador traduce una petición textual en un programa ArtCanvas que el entorno ejecuta para producir una imagen vectorial.
- Agentes de dibujo iterativo: el modelo escribe código, renderiza una vista previa, la inspecciona y corrige el programa en pasos sucesivos dentro del bucle mini-SWE.
- Investigación en agentes con uso de herramientas: sirve como checkpoint de referencia para estudiar políticas de escritura, vista previa y envío en tareas de código-como-acción.
- Evaluación de pipelines multimodales: permite probar harnesses que combinan generación de código, renderizado y verificación visual sobre prompts de GenAI-Bench.
- Prototipado de asistentes de diseño gráfico: integrado en un entorno controlado, puede generar composiciones vectoriales a partir de descripciones en inglés.
- Docencia y experimentación con LoRA: su rango 128 y su tamaño de 1,2 GB lo hacen manejable para estudiar adaptadores PEFT sobre modelos multimodales de 4B.
- Reproducción de experimentos SFT/RLVR/RLHF: encaja como primera etapa de la cadena documentada por el autor.

## Benchmarks y rendimiento

| Evaluación | Checkpoint SFT | Modelo base |
|---|---|---|
| Imágenes válidas (150 prompts difíciles de GenAI-Bench, tope de 12 turnos) | 119/150 | 102/150 |
| HPSv3 normalizado medio (todas las episodios, imágenes ausentes = 0) | 0,348 | 0,094 |

Resultados descriptivos de una única comparación de checkpoints, no de un estudio multi-semilla ni de una tasa de aprobación humana. El protocolo y los datos fuente están en las notas de evaluación del repositorio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; el adaptador pesa 1,2 GB y se suma al base Qwen3.5-4B.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; dependerá del base de 4B y de la cuantización elegida.
- Opciones de despliegue: Transformers 5.5.4 con PEFT 0.21.3 (versiones verificadas por el autor); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parti SFT ArtCanvas (este) | LoRA sobre base 4B | no disponible | 119/150 válidas; HPSv3 0,348 | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | 102/150 válidas; HPSv3 0,094 | no disponible | Hugging Face |
| Checkpoints RLVR/RLHF de la misma cadena | LoRA sobre base 4B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de comparaciones con modelos de dibujo programático de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona correctamente con el entorno Artsy, la API de ArtCanvas y el harness mini-SWE; cargar los pesos aislados no reproduce el comportamiento.
- Requiere ejecutar el código Python generado en un sandbox de dibujo; la fiabilidad y la calidad dependen del protocolo de herramientas, el renderizador, el prompt y el presupuesto de ejecución.
- Idioma limitado al inglés.
- Resultados de evaluación descriptivos de un único checkpoint, sin estudio multi-semilla ni validación humana.
- Licencia no disponible: verificar condiciones antes de cualquier uso comercial.
- El adaptador incluye actualización de la cabeza de salida; la fusión debe preservar los embeddings de entrada del base por separado.
- Riesgo de alucinación en la generación de código y de llamadas a herramientas no válidas; requiere validación en el entorno de ejecución.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Rashik24/parti-sft-artcanvas-full-2026-11-07-qwen3.5-4b-r128-b32
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint RLVR: https://huggingface.co/Rashik24/rlvr-experiment9-genai681-qwen3.5-4b-r128-b32-g4
- Checkpoint RLHF: https://huggingface.co/Rashik24/rlhf-experiment10-genai1000-linear-epoch1-kl-budget-recovery
- Repositorio y entorno Artsy: https://github.com/RashikShahjahan/artsy-fartsy#readme
- Notas de evaluación: https://github.com/RashikShahjahan/artsy-fartsy/tree/main/docs/model-development

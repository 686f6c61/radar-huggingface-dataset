# dhadlab/dhad-vision

## Resumen

dhad-vision (publicado como dhad-1-vision-preview) es un modelo de generación de pies de foto en árabe desarrollado por dhadlab. Combina un codificador visual SigLIP2 congelado con el modelo de lenguaje Jais-3-0.9B, también congelado, unidos mediante un conector entrenado de apenas 7 millones de parámetros. El modelo recibe una imagen, la codifica en 576 características de parche y genera una descripción breve en árabe.

La relevancia del proyecto reside en su enfoque de eficiencia extrema: solo se entrena el conector (7,08 M de parámetros) y dos vectores marcadores, mientras que el resto del pipeline (1.078 M del tronco Jais más 85,8 M del codificador SigLIP2) permanece congelado. El runtime completo suma 1.171.213.057 parámetros (aproximadamente 1,17 B).

Se trata de una versión preview: únicamente se completó la etapa 1 (entrenamiento del conector) y no pasó por una puerta de validación formal. Se incluye además un snapshot incompleto de la etapa 2 (un LoRA visual para preguntas libres sobre imágenes, detenido en el paso 675 de 1.435) claramente etiquetado como inacabado. El modelo está pensado para investigación y demostraciones de captioning en árabe, no para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP2 congelado + conector (pixel-shuffle → MLP → L2 con escala aprendible) + tronco de lenguaje Jais-3-0.9B congelado, con inyección de tokens suaves vía `inputs_embeds` |
| Parámetros totales | 1.171.213.057 (1.078.285.824 del tronco Jais + 85.843.200 del codificador SigLIP2 + 7.084.033 del conector y marcadores) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se distribuyen como state dict en `torch.save`; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Árabe (ar) e inglés (en), con foco principal en árabe |
| Licencia | Apache 2.0 |
| Formato de pesos | `connector.pt` (dict de `torch.save` con `connector` y `markers`); los modelos base se descargan por separado en safetensors desde Hugging Face |

## Arquitectura y entrenamiento

La arquitectura es un ensamblaje de tres piezas. El codificador SigLIP2 (`google/siglip2-base-patch16-naflex`) procesa la imagen y produce 576 características de parche de dimensión 768. Un conector entrenado aplica pixel-shuffle, una MLP y normalización L2 con escala aprendible para mapear esas características a 144 tokens suaves (64 en modo de pocos tokens). Estos tokens se insertan en el tronco de lenguaje Jais-3-0.9B (`inception42/Jais-3-0.9B`) mediante dos vectores marcadores aprendidos, y el modelo genera el pie de foto. Tanto el codificador como el tronco permanecen congelados de extremo a extremo.

El entrenamiento de la etapa 1 utilizó 29.800 pares de entrenamiento y 200 de validación (imagen, pie de foto en árabe), tomados de las imágenes de `FreedomIntelligence/ALLaVA-4V` con los pies de foto de `FreedomIntelligence/ALLAVA-4V-Arabic` (traducción automática de descripciones generadas por GPT-4V), recortados a las primeras una o dos frases. La receta empleó LR coseno de 1e-3, 64 muestras por paso, 2 épocas (930 pasos), bf16, checkpointing de gradientes y un 30 % de los pasos en modo de 64 tokens. En la sonda del paso 930, la pérdida de captioning con la imagen verdadera fue 2,4456 frente a 3,0071 con imagen barajada (una mejora del 18,7 %). No se ejecutó ninguna puerta de validación formal; la aceptación fue una prueba del propietario el 2026-11-14.

## Capacidades

- Generación de pies de foto y descripciones de imágenes en árabe (y parcialmente en inglés).
- Descripción de escenas, objetos y contexto visual en formato de caption breve.
- Modo de pocos tokens (64 en lugar de 144) para reducir coste de inferencia.
- Acepta entradas de imagen en múltiples formatos: ruta de archivo, imagen PIL, bytes crudos o características SigLIP2 cacheadas (`[576, 768]` en fp16).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta preguntas libres sobre la imagen de forma fiable (esa capacidad pertenecía a la etapa 2, inacabada).
- No es un motor OCR (la sonda de glifos fue débil).
- No dispone de modo thinking ni capacidades de audio.

## Casos de uso

- Generación automática de texto alternativo en árabe: el modelo puede producir descripciones breves para imágenes en sitios web o aplicaciones, útil para accesibilidad en contenido arabófono.
- Etiquetado y catalogación de imágenes: integrado en un pipeline por lotes, genera pies de foto para bases de datos de imágenes, facilitando la búsqueda y organización por contenido visual.
- Investigación en visión-lenguaje de bajo coste: sirve como banco de pruebas para estudiar el entrenamiento de conectores con modelos base congelados, dado que solo se entrena el 0,6 % de los parámetros del runtime.
- Demostraciones educativas: su tamaño reducido (0,2 GB de repositorio, 28 MB de pesos nuevos) permite desplegarlo en entornos docentes o prototipos sin infraestructura pesada.
- Preprocesamiento para sistemas de moderación o análisis de contenido: las descripciones generadas pueden alimentar clasificadores posteriores que operen sobre texto en árabe.
- Generación de metadatos para archivos multimedia en árabe: descripciones automáticas que acompañen a fotos en gestores documentales o bibliotecas digitales.
- Evaluación comparativa de codificadores visuales: al usar SigLIP2 congelado, permite aislar el efecto del conector en la calidad del captioning frente a otras combinaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la sonda de pérdida de captioning en el paso 930: 2,4456 con la imagen verdadera frente a 3,0071 con imagen barajada (mejora del 18,7 %). No hay resultados de MMLU, HumanEval, GSM8K ni métricas de captioning estándar (BLEU, CIDEr, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El runtime completo en bf16 ocupa aproximadamente 2,3 GB de pesos (1,17 B de parámetros), más overhead de activaciones y caché KV. En la práctica, cabe en GPUs consumer con 6-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para el pipeline completo; el codificador SigLIP2 puede ejecutarse en CPU (1-2 s por imagen según la model card) para liberar VRAM.
- Cabe en GPUs consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores. El tamaño reducido del repositorio (0,2 GB) y los 28 MB de pesos nuevos facilitan el despliegue.
- Opciones de despliegue: el repositorio incluye scripts propios (`code/infer.py`, `code/graft.py`, `code/encoder.py`) que requieren cargar manualmente los modelos base. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; los pesos son un state dict crudo, no un formato de transformers estándar.
- Latencia y throughput: no disponibles. La model card menciona 1-2 s por imagen con el codificador en CPU; no se reportan cifras de throughput en GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de captioning en árabe, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una versión preview: solo se completó la etapa 1 y no pasó por una puerta de validación formal. No debe considerarse un modelo listo para producción.
- Las descripciones pueden ser inexactas, genéricas o alucinadas; los pies de foto de entrenamiento son salida de GPT-4V, no verdad de referencia nativa.
- No es un motor OCR: la sonda de glifos fue débil y no debe usarse para extraer texto de imágenes.
- No responde de forma fiable a preguntas libres sobre la imagen; esa capacidad pertenecía a la etapa 2, cuyo snapshot está inacabado (paso 675 de 1.435).
- No se aplicó filtrado de seguridad ni NSFW a las imágenes de entrenamiento.
- La procedencia de los datos plantea caveats: ALLaVA-4V declara CC-BY-NC-4.0, los derechos de las imágenes individuales son desconocidos y los pies de foto derivan de ChatGPT/GPT-4V. Aunque el modelo se distribuye bajo Apache 2.0, quien lo redistribuya o construya sobre él debe revisar esos términos upstream.
- El contexto máximo no está documentado, lo que limita la planificación de despliegues con entradas largas.
- El soporte de inglés es parcial; el modelo está optimizado para árabe.

## Enlaces

- [Hugging Face: dhadlab/dhad-vision](https://huggingface.co/dhadlab/dhad-vision)
- [Modelo base del tronco: inception42/Jais-3-0.9B](https://huggingface.co/inception42/Jais-3-0.9B)
- [Codificador visual: google/siglip2-base-patch16-naflex](https://huggingface.co/google/siglip2-base-patch16-naflex)
- [Dataset de imágenes: FreedomIntelligence/ALLAVA-4V](https://huggingface.co/datasets/FreedomIntelligence/ALLAVA-4V)
- [Dataset de pies de foto en árabe: FreedomIntelligence/ALLAVA-4V-Arabic](https://huggingface.co/datasets/FreedomIntelligence/ALLAVA-4V-Arabic)
- [Paper de referencia (arXiv:2502.14786)](https://arxiv.org/abs/2502.14786)

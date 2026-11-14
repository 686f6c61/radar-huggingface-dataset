# Kavan1804/data266-p2-baseline-kavan-lora

## Resumen

`Kavan1804/data266-p2-baseline-kavan-lora` es un adaptador LoRA de texto a imagen publicado en Hugging Face por el usuario Kavan1804 (Team 24) como parte de una práctica académica (DATA 266 Lab 2, Part 2). No es un modelo base autónomo: se trata de un *baseline* de laboratorio, entrenado sobre Stable Diffusion 1.5 a resolución 512x512, que sirve como referencia intermedia frente al modelo final que el equipo presentará. Su relevancia es, por tanto, didáctica y reproducible, no de producción.

El adaptador se ha entrenado con el conjunto de datos `lambda/naruto-blip-captions` (1098 imágenes tras limpieza y partición 90/10 con semilla 266), con rango LoRA 4, learning rate 1e-4, 1500 pasos, batch size 1 y precisión fp16. El coste declarado es de 0,19 GPU-horas en una Tesla T4 con un pico de memoria de 3,957 GB, lo que lo convierte en un ejemplo de bajo coste computacional.

El resultado declarado es prácticamente indistinguible del modelo base: CLIP score de 0,318 frente a 0,319 del original en una comprobación de sanidad pequeña. La licencia es "other" y el autor restringe explícitamente el uso a investigación no comercial por los derechos de autor de los personajes de Naruto y la ausencia de licencia en el dataset. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion 1.5 (UNet + VAE + text encoder CLIP) |
| Parametros totales | no disponible (LoRA de rango 4; no se especifica el número de parámetros del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el autor no documenta cuantizaciones soportadas) |
| Idiomas soportados | no disponible (prompts en inglés por herencia del dataset BLIP captions; no se declara soporte multilingüe) |
| Licencia | other (uso no comercial, solo investigación, según el autor) |
| Formato de pesos | no disponible (repositorio de tipo diffusers/LoRA; no se detalla el fichero concreto) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 aplicado sobre Stable Diffusion 1.5, un modelo de difusión latente con UNet, VAE y codificador de texto CLIP. No se especifica sobre qué módulos concretos se inyecta el adaptador (atención, proyecciones, etc.), por lo que ese detalle queda como no disponible. El entrenamiento se realizó a 512x512, en fp16, con learning rate 1e-4, 1500 pasos, batch size 1 y semilla 266, sobre 1098 imágenes del dataset `lambda/naruto-blip-captions` tras limpieza y partición 90/10.

No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; es un ajuste supervisado estándar de difusión con pares imagen-texto. Tampoco se describen innovaciones técnicas (decodificación especulativa, atención lineal, destilación de pasos, etc.). El coste registrado es de 0,19 GPU-horas en Tesla T4 con pico de 3,957 GB, lo que sitúa el entrenamiento en el rango de una práctica de laboratorio asequible.

## Capacidades

- Generación de imágenes de texto a imagen a 512x512 heredando las capacidades de Stable Diffusion 1.5.
- Especialización estilística en el dominio del dataset de entrenamiento (anime, personajes de Naruto), con tendencia declarada a replicar ese estilo incluso cuando no se desea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües; los prompts de entrenamiento provienen de captions BLIP en inglés.
- No se documentan capacidades de visión, audio ni modo "thinking"; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Reproducción de prácticas académicas: sirve como referencia *baseline* para comparar con el modelo final del equipo en el laboratorio DATA 266, con un coste de 0,19 GPU-horas en T4 que permite iterar rápido.
- Estudio de ajuste fino con LoRA de bajo rango: permite analizar el efecto de rango 4, lr 1e-4 y 1500 pasos sobre un dataset pequeño de 1098 imágenes, útil para docencia sobre difusión.
- Evaluación de métricas de fidelidad texto-imagen: el CLIP score declarado (0,318 frente a 0,319 del base) sirve como ejemplo de que un ajuste mínimo puede no mejorar la métrica, útil para discutir límites de CLIP como evaluador.
- Generación de imágenes de estilo anime en investigación no comercial: adecuado para experimentos internos sobre estilización con personajes de Naruto, siempre respetando la restricción de uso no comercial.
- Análisis de sesgos y sobreajuste de estilo: el propio autor advierte que el LoRA copia el estilo del dataset incluso cuando no se desea, lo que lo convierte en un caso de estudio sobre contaminación estilística en adaptadores de bajo rango.
- Pruebas de pipelines `diffusers` con adaptadores LoRA: útil para validar la carga de adaptadores sobre SD 1.5 en entornos de experimentación, dado el tamaño reducido del repositorio.

## Benchmarks y rendimiento

| Metrica | Este LoRA | Stable Diffusion 1.5 (base) |
|---|---|---|
| CLIP score (comprobación de sanidad pequeña) | 0,318 | 0,319 |

No se han publicado otros resultados de benchmarks (FID, Inception Score, evaluaciones humanas, etc.) en la información disponible. La única métrica reportada es una comprobación de sanidad pequeña cuyo conjunto de evaluación no se detalla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió un pico de 3,957 GB en Tesla T4, por lo que la inferencia a 512x512 en fp16 debería caber holgadamente en GPUs consumer, aunque el autor no publica cifras de inferencia.
- GPU recomendadas: el autor solo documenta entrenamiento en Tesla T4; no se especifican GPU recomendadas para inferencia.
- Cabe en GPU consumer: previsiblemente sí, dado el pico de 3,957 GB en entrenamiento, pero no se confirma en la información disponible.
- Opciones de despliegue: el repositorio es de tipo `diffusers` con `library_name: diffusers`, por lo que el despliegue natural es mediante la librería `diffusers` cargando el adaptador LoRA sobre Stable Diffusion 1.5. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| data266-p2-baseline-kavan-lora | LoRA texto a imagen | Stable Diffusion 1.5 | no disponible (rango 4) | no aplica | CLIP 0,318 | other (no comercial) | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 | Modelo base texto a imagen | — | no disponible en esta ficha | no aplica | CLIP 0,319 (referencia del autor) | CreativeML OpenRAIL-M (según el modelo base original) | Ampliamente disponible |
| Otros LoRA de anime sobre SD 1.5 | LoRA texto a imagen | Stable Diffusion 1.5 | variable | no aplica | no disponible | variable | Ampliamente disponibles en Hugging Face |

No se dispone de datos de benchmarks comparativos adicionales ni de otros adaptadores equivalentes documentados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con imágenes de personajes de anime (Naruto), por lo que reproduce ese estilo y sus sesgos visuales; el autor advierte que copia el estilo incluso cuando no se desea.
- Riesgo de alucinación: como todo modelo de difusión, puede generar contenido visual incoherente o no solicitado; no se documenta una evaluación específica de fidelidad más allá del CLIP score.
- Limitaciones de contexto o idioma: no se declara soporte multilingüe; los captions de entrenamiento están en inglés y el modelo hereda las limitaciones de comprensión de prompts de SD 1.5.
- Restricciones de licencia: licencia "other" con uso restringido a investigación no comercial por derechos de autor de los personajes de Naruto y ausencia de licencia en el dataset. No apto para uso comercial.
- Caveat para producción: es un *baseline* de laboratorio, no el modelo final del equipo; su rendimiento (CLIP 0,318) no supera al base (0,319) y no se han publicado evaluaciones exhaustivas. El repositorio ocupa 0,0 GB y no registra descargas ni likes, lo que sugiere un uso meramente académico.

## Enlaces

- Hugging Face: https://huggingface.co/Kavan1804/data266-p2-baseline-kavan-lora
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambda/naruto-blip-captions
- Librería diffusers: https://github.com/huggingface/diffusers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.

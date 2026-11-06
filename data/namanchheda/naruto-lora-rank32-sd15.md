# NamanChheda/naruto-lora-rank32-sd15

## Resumen

Naruto-lora-rank32-sd15 es un adaptador LoRA de rango 32 para Stable Diffusion 1.5, desarrollado por NamanChheda en el marco de un curso universitario (DATA 266 Lab 2, Part 2). El adaptador se inyecta en las capas de atención del UNet del modelo base `stable-diffusion-v1-5/stable-diffusion-v1-5` y se entrena para reproducir el estilo visual del anime Naruto a partir de imágenes con leyendas generadas por BLIP. Cuenta con 6.377.472 parámetros entrenables, un tamaño muy reducido que lo hace ligero de almacenar y de cargar junto al modelo base.

El modelo resuelve un problema acotado: especializar un modelo de difusión genérico en un dominio visual concreto sin reentrenar el UNet completo. Su relevancia es principalmente didáctica y de investigación: la model card documenta con detalle el proceso de entrenamiento, las métricas de evaluación (KID, CLIP score, LPIPS, win rate humano) y las limitaciones observadas, lo que lo convierte en un caso de estudio útil sobre el comportamiento de los LoRA de difusión y sus fugas de estilo.

No es un modelo de lenguaje: no procesa texto de forma generativa ni soporta tool calling, agentes o razonamiento multi-paso. Es un adaptador text-to-image que hereda la ventana de contexto del pipeline de Stable Diffusion 1.5 (prompts de texto cortos, típicamente hasta 77 tokens) y cuyo uso está restringido a investigación y educación no comercial por la naturaleza de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5; pipeline text-to-image basado en difusión latente |
| Parametros totales | 6.377.472 parámetros entrenables (adaptador); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como parámetro del adaptador; el pipeline SD 1.5 usa prompts de texto de hasta 77 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión de entrenamiento fp16; el modelo base admite las cuantizaciones habituales de SD 1.5) |
| Idiomas soportados | no disponible (los prompts del pipeline son texto; el dataset de entrenamiento usa leyendas BLIP en inglés) |
| Licencia | creativeml-openrail-m, con restricción adicional a uso no comercial, de investigación y educativo |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado a las capas de atención del UNet de Stable Diffusion 1.5. Se entrenó con el script `train_text_to_image_lora.py` de diffusers 0.36.0, junto con peft 0.17.1 y torch 2.6.0+cu124. La configuración fue: learning rate constante de 0.0001, 4000 pasos, batch size 1 con acumulación de gradiente 4 (batch efectivo 4), precisión mixta fp16, resolución de 512 px y semilla 266. El entrenamiento se ejecutó en una única NVIDIA GeForce RTX 4090 y consumió 70 minutos (1,16 GPU-hours), con un pico de 4,20 GiB de memoria reservada.

Los datos provienen del dataset `lambdalabs/naruto-blip-captions`: 1221 imágenes con leyendas BLIP, divididas en 1099 de entrenamiento y 122 de test con semilla 266; solo se usó el split de entrenamiento. El dataset no declara licencia y las imágenes proceden de narutopedia.com, con personajes sujetos a derechos de autor. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un ajuste supervisado estándar de difusión con pares imagen-texto.

## Capacidades

- Generación de imágenes text-to-image en el estilo visual del anime Naruto, condicionada por prompts de texto en inglés.
- Especialización de estilo sobre Stable Diffusion 1.5: reproduce la estética del dominio de entrenamiento (personajes, paleta y trazos característicos del anime).
- Composición con prompts fuera de dominio, aunque con fugas de estilo documentadas (por ejemplo, una escena urbana nocturna se genera en blanco y negro con estética manga).
- Control mediante los parámetros estándar del pipeline de difusión: `num_inference_steps`, `guidance_scale` y semilla.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües documentadas; las leyendas de entrenamiento están en inglés.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigación sobre LoRA en difusión: sirve como caso reproducible para estudiar cómo el rango y la configuración de entrenamiento afectan a la fidelidad al dominio y a la diversidad de las muestras, gracias a las métricas documentadas (KID, CLIP, LPIPS).
- Docencia en cursos de generación de imágenes: el repositorio incluye el script, la configuración y los resultados, lo que permite replicar el entrenamiento en una sola GPU de consumo en poco más de una hora.
- Evaluación de fugas de estilo: útil para analizar cómo un adaptador de dominio contamina prompts fuera de dominio, un fenómeno relevante para el diseño de sistemas de filtrado y control de estilo.
- Pruebas de pipelines de difusión con `diffusers`: el adaptador se carga con `load_lora_weights` sobre el modelo base, lo que permite validar flujos de trabajo de carga y composición de LoRA en entornos de desarrollo.
- Estudio de memorización en modelos generativos: la model card incluye una comprobación de similitud CLIP frente al conjunto de entrenamiento (media 0,8731, máximo 0,9366), útil para investigar riesgo de reproducción de imágenes de entrenamiento.
- Experimentos de evaluación humana: el protocolo de comparación ciega contra el modelo base (3 evaluadores, 25 pares, win rate 0,387) puede reutilizarse como plantilla para estudios de preferencia en modelos de imagen.
- Prototipado de estilos para proyectos no comerciales de investigación o educación, siempre que se respete la restricción de uso no comercial.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el adaptador de rango 32 con el modelo base sobre las mismas 20 prompts y 2 semillas:

| Métrica | Base | Rank 32 |
|---|---|---|
| KID (media ± desviación, menor mejor) | 0,08418 ± 0,01210 | 0,01193 ± 0,00702 |
| CLIP score (media ± desviación, mayor mejor) | 32,86 ± 2,85 | 32,04 ± 3,00 |
| Diversidad LPIPS (media, mayor mejor) | 0,8050 | 0,7502 |
| Win rate humano frente a base | referencia | 0,387 (29/75 votos, 3 evaluadores × 25 pares) |
| GPU-hours por entrenamiento | no aplica | 1,160 |

Desglose del win rate humano por tipo de prompt: en dominio 0,167 (5/30), fuera de dominio 0,417 (10/24) y composicional 0,667 (14/21). El KID se calculó con solo 13 imágenes generadas en dominio por modelo frente a 122 imágenes de test, por lo que la métrica es ruidosa. Además, 7 de 40 combinaciones (prompt, semilla) se excluyeron de todas las métricas porque el safety checker marcó la imagen de al menos uno de los modelos y la devolvió en negro.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa pocos megabytes; el modelo base SD 1.5 en fp16 requiere aproximadamente 4-6 GB de VRAM, en línea con el pico de 4,20 GiB reservado durante el entrenamiento.
- GPU recomendadas: NVIDIA RTX 4090 (la usada en el entrenamiento), A100 o H100 para despliegues de mayor volumen; tarjetas de consumo con 6-8 GB de VRAM son suficientes para inferencia en fp16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090); también puede ejecutarse en CPU con mayor latencia.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights`; DiffusionBee ofrece importación directa desde Hugging Face. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naruto-lora-rank32-sd15 | LoRA sobre SD 1.5, rango 32 | 6.377.472 entrenables | prompts de hasta 77 tokens (pipeline SD 1.5) | creativeml-openrail-m + restricción no comercial | Hugging Face, 18 descargas |
| Stable Diffusion 1.5 (base) | Difusión latente text-to-image | no disponible en la información | prompts de hasta 77 tokens | creativeml-openrail-m | Hugging Face |
| Otros LoRA de estilo para SD 1.5 | Adaptadores de bajo rango | variable según adaptador | prompts de hasta 77 tokens | variable | Hugging Face |

No se dispone de datos de benchmarks de otros adaptadores LoRA comparables en la información proporcionada, por lo que la comparación cuantitativa se limita a la tabla de resultados frente al modelo base.

## Limitaciones y advertencias

- Win rate humano bajo: en la evaluación ciega, las imágenes del adaptador fueron elegidas en solo 29 de 75 votos frente al modelo base (0,387), con un rendimiento especialmente bajo en dominio (0,167).
- Pérdida de diversidad: el LPIPS entre dos semillas de la misma prompt es inferior al del base (0,7502 frente a 0,8050), lo que indica menor variabilidad en las generaciones.
- Relaciones espaciales incorrectas: en la prompt de prueba con una posición relativa explícita, el modelo coloca al sujeto delante de un fondo rojo en lugar de encima de una caja roja.
- Fuga de estilo: prompts fuera de dominio se generan con estética manga en blanco y negro, lo que limita su uso para escenas que no sean del dominio Naruto.
- Riesgo de memorización: la similitud CLIP media con la imagen de entrenamiento más cercana es de 0,8731 (máximo 0,9366), lo que sugiere proximidad a las imágenes del dataset.
- Safety checker: 7 de 40 combinaciones (prompt, semilla) fueron marcadas y devueltas como imagen negra, lo que afecta a la fiabilidad en producción.
- Sesgos: no documentados explícitamente en la información disponible; al entrenarse sobre un dataset de un único anime, el modelo hereda los sesgos visuales y de representación de ese corpus.
- Licencia: aunque el adaptador se publica bajo CreativeML OpenRAIL-M, las imágenes de entrenamiento muestran personajes con derechos de autor y el dataset no declara licencia, por lo que el uso queda restringido a investigación y educación no comercial.
- Contexto limitado del pipeline: los prompts de SD 1.5 se truncan a 77 tokens, lo que restringe instrucciones largas o composiciones complejas.
- Ruido en las métricas: el KID se calcula con solo 13 imágenes generadas por modelo, por lo que sus intervalos de confianza son amplios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NamanChheda/naruto-lora-rank32-sd15
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Importación en DiffusionBee: https://diffusionbee.com/huggingface_import?model_id=NamanChheda%2Fnaruto-lora-rank32-sd15

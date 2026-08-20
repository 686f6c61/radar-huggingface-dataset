# sisniha/LightWan2.2-A14B

## Resumen

LightWan2.2-A14B es una variante extremadamente eficiente del modelo de generación de vídeo Wan2.2 de 14B parámetros, desarrollada por el equipo de ModelTC/LightX2V y publicada en HuggingFace por el usuario sisniha. El modelo combina destilación de pasos (step distillation) con cuantización NVFP4 y atención dispersa (sparse attention) para lograr una inferencia en solo 4 pasos, frente a los 40 del modelo original, lo que reduce la latencia de extremo a extremo en más de un orden de magnitud en una única GPU Blackwell.

La relevancia de este modelo radica en que democratiza la generación de vídeo de alta calidad al hacerla viable en hardware de consumo profesional (como la RTX 5090) y en entornos de producción con requisitos de tiempo real. Está diseñado específicamente para la arquitectura Blackwell de NVIDIA, aprovechando las instrucciones NVFP4 para reducir el tráfico de memoria y el coste computacional. Soporta tanto texto-a-vídeo (T2V) como imagen-a-vídeo (I2V), manteniendo la calidad visual del modelo base Wan2.2.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su integración con el framework LightX2V proporciona un stack de ejecución estable y reproducible, con soporte para inferencia en una o varias GPUs mediante paralelismo de secuencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión basado en transformer con mezcla de expertos (MoE) |
| Parámetros totales | 14B (según denominación A14B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vídeo, no texto) |
| Tipos de cuantización | NVFP4 (cuantización de 4 bits en punto flotante para Blackwell) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 67 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

LightWan2.2-A14B parte de los modelos base Wan2.2-T2V-A14B y Wan2.2-I2V-A14B, ambos arquitecturas de difusión con mezcla de expertos (MoE) de 14B parámetros. La innovación principal es la destilación de pasos cuantización-consciente (quantization-aware step distillation), que reduce el número de evaluaciones de función (NFE) de 40 a 4, manteniendo la calidad visual mediante dos pasos expertos de alto ruido seguidos de dos pasos de bajo ruido.

Además, incorpora atención dispersa (sparse attention) para acelerar el coste cuadrático O(n²) de la autoatención, lo que reduce la latencia total en resoluciones altas (480p y 720p). La cuantización NVFP4 está optimizada para la arquitectura Blackwell de NVIDIA, reduciendo el tráfico de memoria y el coste computacional. El entrenamiento se realizó con un enfoque de destilación que preserva la fidelidad del modelo original, aunque no se han publicado detalles específicos sobre el dataset o el procedimiento exacto.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2V) a partir de descripciones textuales.
- Generación de vídeo imagen-a-vídeo (I2V) a partir de una imagen inicial y un prompt.
- Inferencia en 4 pasos, lo que permite latencias de 9 a 27 segundos para vídeos de 480p y 720p en una RTX 5090.
- Soporte de paralelismo de secuencia para múltiples GPUs, escalando la generación a resoluciones mayores.
- Integración con el framework LightX2V, que proporciona scripts listos para usar y una imagen Docker oficial.
- Compatibilidad con la biblioteca diffusers de HuggingFace, facilitando su integración en pipelines existentes.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos de alta calidad (480p) en menos de 10 segundos, permitiendo iterar rápidamente sobre ideas y estilos para plataformas como TikTok, Instagram o YouTube Shorts.
- Prototipado de escenas para cine y animación: los cineastas pueden generar storyboards animados a partir de guiones o imágenes de referencia, acelerando la previsualización de escenas complejas sin necesidad de renderizado costoso.
- Marketing y publicidad personalizada: las agencias pueden producir vídeos promocionales adaptados a diferentes audiencias o productos en minutos, gracias a la baja latencia y la capacidad de ajustar prompts por campaña.
- Educación y formación técnica: generar material didáctico visual, como demostraciones de procesos o simulaciones, a partir de descripciones textuales, útil para cursos online o manuales interactivos.
- Investigación en visión por computador: utilizar el modelo para generar datos sintéticos de vídeo con control fino sobre el contenido, lo que permite entrenar otros modelos de percepción sin necesidad de capturar datos reales.
- Entretenimiento y arte generativo: artistas y creadores pueden explorar variaciones de vídeo a partir de imágenes o textos, produciendo piezas únicas para instalaciones, NFTs o proyectos personales con un coste computacional reducido.

## Benchmarks y rendimiento

La siguiente tabla muestra la comparación de latencia de extremo a extremo (E2E) entre el modelo base Wan2.2 y LightWan2.2-A14B, medida en una RTX 5090 con el framework LightX2V.

| Método | Tarea | GPUs | Resolución | NFE | Latencia E2E | Speedup |
| --- | :---: | ---: | ---: | ---: | ---: | ---: |
| Wan2.2-T2V-14B | T2V | 1 | 480p | 40 | 734,0 s | 1,0x |
| LightWan2.2-A14B | T2V | 1 | 480p | 4 | 9,1 s | 80,7x |
| Wan2.2-T2V-14B | T2V | 1 | 720p | 40 | 2668,0 s | 1,0x |
| LightWan2.2-A14B | T2V | 1 | 720p | 4 | 22,5 s | 118,7x |
| Wan2.2-I2V-14B | I2V | 1 | 480p | 40 | 787,0 s | 1,0x |
| LightWan2.2-A14B | I2V | 1 | 480p | 4 | 10,7 s | 73,9x |
| Wan2.2-I2V-14B | I2V | 1 | 720p | 40 | 2685,0 s | 1,0x |
| LightWan2.2-A14B | I2V | 1 | 720p | 4 | 26,7 s | 100,5x |

No se han publicado resultados de benchmarks estándar (como FID, CLIP score u otros) en la información disponible.

## Requisitos de hardware

- GPU recomendada: NVIDIA RTX 5090 (arquitectura Blackwell) o GPUs equivalentes con soporte NVFP4.
- VRAM estimada: no disponible oficialmente, pero el tamaño del repo (67 GB) sugiere que se necesita al menos 24 GB de VRAM para cargar los pesos en cuantización NVFP4; la RTX 5090 con 32 GB es suficiente.
- Inferencia en una sola GPU: soportada para resoluciones de 480p y 720p con latencias de 9 a 27 segundos.
- Inferencia multi-GPU: soportada mediante paralelismo de secuencia, escalando a resoluciones mayores o reduciendo aún más la latencia.
- Opciones de despliegue: framework LightX2V (recomendado), imagen Docker oficial (`lightx2v/lightx2v:26052801-cu130-5090`), scripts de ejemplo para T2V e I2V, e integración con diffusers.
- Requisitos de software: CUDA 13.0 o superior, kernel NVFP4 compilado desde CUTLASS, y Python con soporte para `uv` (gestor de paquetes).

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | NFE | Latencia E2E (480p) | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- | --- |
| Wan2.2-T2V-14B | 14B | 480p/720p | 40 | 734 s | Apache 2.0 | HuggingFace |
| Wan2.2-I2V-14B | 14B | 480p/720p | 40 | 787 s | Apache 2.0 | HuggingFace |
| LightWan2.2-A14B | 14B | 480p/720p | 4 | 9,1 s | Apache 2.0 | HuggingFace |

La comparativa se limita a los modelos base de Wan2.2, ya que no se dispone de información sobre otros modelos de generación de vídeo con características similares (como CogVideoX o Mochi) en la documentación proporcionada.

## Limitaciones y advertencias

- Requiere hardware específico: la cuantización NVFP4 y la atención dispersa están optimizadas para GPUs Blackwell; en otras arquitecturas el rendimiento puede degradarse o no ser compatible.
- No se han publicado detalles sobre sesgos o alucinaciones en la generación de vídeo; como todo modelo generativo, puede producir contenido incoherente o no deseado en escenarios complejos.
- La longitud de contexto y los idiomas soportados no están documentados, lo que limita la evaluación de su comportamiento multilingüe o con prompts muy largos.
- El modelo está pensado para generación de vídeo; no es adecuado para tareas de texto, código o razonamiento general.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar la procedencia de los datos de entrenamiento y cumplir con las políticas de uso de los modelos base Wan2.2.
- La instalación manual requiere compilar kernels personalizados desde CUTLASS, lo que puede ser complejo en entornos no estándar; se recomienda usar la imagen Docker oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sisniha/LightWan2.2-A14B
- Repositorio oficial LightX2V: https://github.com/ModelTC/LightX2V
- Blog del modelo: https://light-ai.top/LightX2V-BLOG/posts/LightWan22-A14B/
- Modelo base T2V: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo base I2V: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B

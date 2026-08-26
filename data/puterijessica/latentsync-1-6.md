# puterijessica/LatentSync-1.6

## Resumen

LatentSync 1.6 es un modelo de sincronización de labios (lip-sync) desarrollado por ByteDance, diseñado para editar vídeos haciendo que los labios y la boca de una persona se muevan de forma sincronizada con un audio de referencia. Este modelo resuelve el problema de la generación de vídeo realista con sincronización labial, una tarea compleja en edición de vídeo y doblaje. La versión 1.6 se entrenó específicamente con vídeos de resolución 512×512 píxeles para corregir el desenfoque en dientes y labios que presentaba la versión 1.5, sin modificar la arquitectura ni la estrategia de entrenamiento.

El modelo se basa en un enfoque de difusión latente (latent diffusion) con una U-Net como componente principal, y es compatible con el código oficial del repositorio LatentSync de ByteDance. El checkpoint ocupa aproximadamente 9,6 GB y se distribuye bajo licencia OpenRAIL++, que permite uso comercial con restricciones. Aunque la información técnica detallada es limitada, el modelo es relevante por su aplicación práctica en doblaje automático, creación de contenido y edición de vídeo profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente con U-Net (no se especifican más detalles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo trabaja con audio y vídeo, no con texto) |
| Licencia | OpenRAIL++ |
| Formato de pesos | no disponible (probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

La información disponible indica que LatentSync 1.6 no introduce cambios estructurales respecto a la versión 1.5. Se trata de un modelo de difusión latente que procesa vídeo y audio para generar una salida de vídeo con los labios sincronizados. La U-Net es el componente central, y el entrenamiento se realizó con vídeos de resolución 512×512, frente a la resolución anterior (presumiblemente menor). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El paper asociado (arXiv:2412.09262) y el código en GitHub son las fuentes primarias para profundizar en la arquitectura exacta.

## Capacidades

- Sincronización de labios en vídeo: genera movimiento de labios y dientes coherente con un audio de entrada.
- Edición de vídeo: permite reemplazar o ajustar el habla en secuencias de vídeo existentes.
- Compatibilidad con versiones anteriores: el código soporta tanto LatentSync 1.5 como 1.6, cambiando solo el checkpoint y el parámetro de resolución en la configuración de la U-Net.
- Mejora de nitidez: la versión 1.6 reduce el desenfoque en dientes y labios gracias al entrenamiento a mayor resolución.
- Procesamiento de vídeo y audio: trabaja con señales multimodales, aunque no se especifican formatos concretos.

## Casos de uso

- Doblaje automático de películas y series: el modelo puede sincronizar los labios de un actor con un audio traducido, facilitando la localización de contenido audiovisual.
- Creación de vídeos para redes sociales: permite generar vídeos de personas hablando con un audio arbitrario, útil para memes, parodias o contenido educativo.
- Corrección de errores en producción audiovisual: si un actor pronuncia mal una frase, se puede regenerar solo la parte del vídeo con el audio corregido sin volver a grabar.
- Accesibilidad: puede adaptar vídeos existentes para personas con discapacidad auditiva, generando una versión con lectura de labios más clara.
- Videojuegos y animación: sincronización de personajes 3D o 2D con diálogos pregrabados, reduciendo el trabajo manual de animación facial.
- Educación y formación: creación de vídeos didácticos donde un instructor virtual habla con sincronización perfecta, a partir de un guion de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas cuantitativas de calidad (como PSNR, SSIM o métricas de sincronización labial) en la model card ni en los resultados de búsqueda. Se recomienda consultar el paper arXiv:2412.09262 para posibles evaluaciones, aunque no se garantiza su presencia.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del checkpoint (9,6 GB), se requiere una GPU con al menos 12-16 GB de VRAM para inferencia en precisión completa, aunque no se confirma.
- GPU recomendadas: no disponible. Se espera que funcione en GPUs de gama alta como RTX 3090, RTX 4090, A100 o similares, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probablemente sí en GPUs con suficiente VRAM (p. ej., RTX 3090/4090), pero no se especifica.
- Opciones de despliegue: el repositorio oficial de GitHub (bytedance/LatentSync) proporciona scripts de inferencia y entrenamiento. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (lip-sync) dentro de los datos proporcionados. Existen alternativas como Wav2Lip o SadTalker, pero no se han incluido datos de comparación en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La información técnica es incompleta: no se conocen los parámetros totales, la arquitectura exacta ni los requisitos de hardware, lo que dificulta la evaluación previa.
- Riesgo de alucinación visual: como modelo generativo, puede producir artefactos en dientes, labios o contornos faciales, especialmente en condiciones de iluminación o ángulos complejos.
- Sesgos potenciales: el entrenamiento con vídeos de ciertas demografías podría generar resultados menos precisos en otros grupos étnicos o tipos de rostro, aunque no se documenta.
- Licencia OpenRAIL++: permite uso comercial, pero impone restricciones de uso responsable (no generar contenido engañoso o dañino). Es obligatorio revisar los términos completos.
- Limitaciones de resolución: aunque 1.6 mejora la nitidez, la resolución máxima de salida está limitada a 512×512, lo que puede ser insuficiente para vídeo profesional en alta definición.
- Dependencia del código oficial: para cambiar entre versiones 1.5 y 1.6 es necesario modificar el parámetro `resolution` en el archivo de configuración de la U-Net, lo que requiere conocimientos técnicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/puterijessica/LatentSync-1.6
- Modelo oficial de ByteDance en Hugging Face: https://huggingface.co/ByteDance/LatentSync-1.6
- Paper: https://arxiv.org/abs/2412.09262
- Código oficial: https://github.com/bytedance/LatentSync
- Demo y changelog de la versión 1.6: https://github.com/bytedance/LatentSync/blob/main/docs/changelog_v1.6.md
- Repositorio espejo en GitHub: https://github.com/PigeonCai/latentsync

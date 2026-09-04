# linlianjiang/ffgs

## Resumen

El repositorio `linlianjiang/ffgs` contiene un bundle de reanudación de un run de entrenamiento para un modelo feedforward de novel view synthesis basado en Gaussian Splatting. El autor es linlianjiang (Sid), y el bundle incluye un checkpoint intermedio en el paso 100000 de un total de 154000 pasos, junto con el código necesario para continuar el entrenamiento. No es un modelo final listo para inferencia, sino un punto de control de un pipeline de investigación.

El modelo se apoya en un backbone VGGT-Omega de 1B (fp32) como teacher congelado, y se entrena sobre el dataset RealEstate10K en el layout pixelSplat (~510 GB). La arquitectura es feedforward, con representación de escenas mediante Gaussian Splatting y un curriculum que introduce fases de anisotropía y forma (K3 a K5) a partir del paso 100000. El repo tiene un tamaño de 13.8 GB, con el checkpoint principal de 12.9 GiB. La relevancia de este recurso es permitir a investigadores continuar un entrenamiento de reconstrucción 3D sin partir de cero, aunque requiere completar los archivos externos (backbone y dataset) y disponer de hardware adecuado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Feedforward Gaussian Splatting con backbone VGGT-Omega (1B) |
| Parámetros totales | No disponible (checkpoint de 12.9 GiB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión 3D) |
| Tipos de cuantización | No disponible (checkpoint fp32) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | No disponible |
| Formato de pesos | checkpoint_last.pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un sistema feedforward para novel view synthesis que genera nuevas vistas de una escena a partir de imágenes de entrada. La representación de la escena se construye mediante Gaussian Splatting, con Gaussianas anisotrópicas (fase `aniso`) y un esquema de forma que evoluciona de K3 a K5 (`shapeK3@100000->K5@130000`). El entrenamiento utiliza distillation: el backbone VGGT-Omega de 1B se carga como teacher congelado en cada paso (`DISTILL_TEACHER=1`), y el modelo aprende a imitar sus predicciones de geometría y apariencia.

El dataset de entrenamiento es RealEstate10K en el layout de pixelSplat (~510 GB), dividido en `train` y `test` con ficheros `.torch` y un `index.json`. El curriculum incluye un reinicio de la tasa de aprendizaje en los pasos 100000 y 130000. El checkpoint corresponde al paso 100000, justo cuando se activan las fases más costosas (`ANISO_AFTER=100000`, `SHAPE_AFTER=100000`). No se menciona RLHF ni DPO. El código incluye scripts de entrenamiento multi-GPU y documentación interna (`docs/TRAINING.md`).

## Capacidades

- Reconstrucción 3D de escenas a partir de múltiples vistas, orientada a novel view synthesis.
- Generación de nuevas vistas mediante representación de Gaussian Splatting.
- Aprendizaje por distillation desde un teacher VGGT-Omega de 1B congelado.
- Soporte de un curriculum de entrenamiento con fases de anisotropía, forma (K3 a K5) y apariencia.
- No soporta tool calling, agentes ni razonamiento multi-step; es un modelo de visión 3D.
- El checkpoint es intermedio; el modelo completo no está entrenado ni validado para inferencia.

## Casos de uso

- Continuación de un run de entrenamiento interrumpido: el bundle permite reanudar el entrenamiento desde el paso 100000, siempre que el checkpoint se coloque en `$OUT_DIR` y se confirme en el log el mensaje `RESUMED from step 100000`. Es adecuado para investigadores que necesitan completar el curriculum sin empezar desde cero.
- Investigación en novel view synthesis: el modelo feedforward está diseñado para generar nuevas vistas de escenas de RealEstate10K. Se puede usar para estudiar la representación de Gaussian Splatting en interiores y exteriores.
- Desarrollo de métodos de reconstrucción 3D: el código incluye un curriculum detallado que permite experimentar con el efecto de las fases `aniso` y `shape` en la calidad de las Gaussianas.
- Evaluación de técnicas de distillation: el modelo usa un teacher VGGT-Omega congelado; el checkpoint permite analizar cómo la distillation afecta a la geometría aprendida en el paso 100000.
- Benchmarking de pipelines de reconstrucción: una vez completado el entrenamiento, el modelo podría compararse con otros métodos feedforward en RealEstate10K, aunque no hay métricas publicadas en la información disponible.
- Formación y docencia: el bundle incluye documentación de entrenamiento (`docs/TRAINING.md`) con el curriculum, notas multi-GPU y errores comunes, lo que sirve como ejemplo práctico de un pipeline de Gaussian Splatting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card no incluye métricas de calidad como PSNR, SSIM ni LPIPS, y no se ofrecen comparativas con otros modelos. El checkpoint no ha sido evaluado de forma independiente.

## Requisitos de hardware

- El entrenamiento original se ejecutó en un clúster SLURM con 4x H100, según los logs incluidos en `logs/`.
- Para continuar el entrenamiento se necesitan 4 GPUs; el script `scripts/train_full.sh` está configurado para ese número.
- El checkpoint ocupa 12.9 GiB y el backbone VGGT-Omega 1B fp32 ocupa 4.5 GB (4576706117 bytes). El dataset RealEstate10K en layout pixelSplat requiere ~510 GB.
- No se disponen de requisitos de inferencia, ya que no es un modelo listo para servir.
- Opciones de despliegue: no aplica. El código usa PyTorch y gsplat, y no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: el model card indica que tras el paso 100000 el throughput cae a ~3 it/s, frente a ~17 it/s en los primeros 100k pasos. Estos valores corresponden a entrenamiento, no a inferencia.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. El modelo comparte el backbone VGGT-Omega con otros enfoques de reconstrucción 3D, pero no hay datos de rendimiento que permitan una comparación rigurosa. Tampoco se identifican alternativas equivalentes en la misma categoría dentro de los resultados de búsqueda.

## Limitaciones y advertencias

- El checkpoint es un estado intermedio de entrenamiento (paso 100000 de 154000), no un modelo final. Su rendimiento no está validado.
- Requiere el backbone VGGT-Omega oficial (fp32, sha256 `c02da418b18bb01d0392598d3f6147366bcde1bb70fd08a5e3bf7925b0667934`), que se encuentra en un repositorio de HuggingFace con acceso restringido. No se puede obtener automáticamente.
- Requiere el dataset RealEstate10K en layout pixelSplat (~510 GB), que no está incluido en el repositorio.
- El código carga el backbone de forma incondicional en `train.py:405` antes del bloque de reanudación (`train.py:438`); sin el fichero, el proceso falla en segundos.
- El checkpoint debe colocarse en `$OUT_DIR` (por defecto `outputs/full`) para que la reanudación funcione. Si se coloca en otro lugar, el entrenamiento empieza desde cero sin avisar.
- La licencia no está especificada, por lo que el uso comercial no está garantizado.
- No se conocen sesgos específicos, pero al ser un modelo de visión entrenado en RealEstate10K, puede tener limitaciones en escenas fuera de esa distribución.
- El throughput cae significativamente en las fases posteriores (3 it/s), lo que implica un coste de cómputo alto para completar los 54k pasos restantes.

## Enlaces

- HuggingFace: https://huggingface.co/linlianjiang/ffgs
- GitHub del autor: https://github.com/linlianjiang
- Repositorio trace-gs (relacionado): https://github.com/linlianjiang/trace-gs/tree/master

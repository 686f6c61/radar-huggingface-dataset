# simillusion/dit-s4-cifar10

## Resumen

DiT-S/4 CIFAR-10 es un checkpoint de demostración de un Diffusion Transformer (DiT) entrenado de forma condicionada por clase sobre el dataset CIFAR-10 (32x32 píxeles). Lo ha publicado el usuario simillusion en Hugging Face como parte del proyecto Simulusion, una librería open source en PyTorch orientada a construir modelos del mundo (world models) detrás de una API unificada. El modelo implementa la arquitectura descrita en el paper "Scalable Diffusion Models with Transformers" de Peebles y Xie (ICCV 2023).

Con 33 millones de parámetros, se trata de la variante más pequeña de la familia DiT, con un tamaño de parche de 4 píxeles. No es un modelo de generación de imágenes de propósito general ni una reproducción de los resultados del paper original: es una ejecución de entrenamiento corta (40 épocas, unas dos horas en una RTX 3050 portátil de 4 GB) pensada para demostrar el funcionamiento de la librería y servir como punto de partida educativo o de experimentación. Su relevancia radica en su accesibilidad: es un DiT real, entrenable y reproducible en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT), condicionado por clase |
| Parametros totales | 33 M (variante DiT-S/4) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no aplicable (modelo de difusion para imagenes, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (generacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | state dict de PyTorch (torch.load con weights_only=True), incluye estado del optimizador |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DiT del paper de Peebles y Xie: un transformer que reemplaza a la típica U-Net como backbone del proceso de difusión. La variante S/4 indica el tamaño "Small" con parches de 4x4 píxeles sobre imágenes de 32x32 de CIFAR-10. El entrenamiento es condicionado por clase (las 10 clases de CIFAR-10) y, según la model card, las muestras generadas emplean classifier-free guidance con escala 4 y 1000 pasos DDPM en inferencia.

El entrenamiento se realizó durante 40 épocas con batch size 64, completándose en aproximadamente dos horas sobre una GPU portátil NVIDIA RTX 3050 con 4 GB de VRAM. Los checkpoints incluyen el estado del optimizador, lo que permite continuar el entrenamiento desde el punto guardado. El autor deja claro que no es una reproducción de los resultados del paper original, sino una demo dimensionada para hardware de consumo. Dentro de Simulusion, DiT se concibe como un bloque constructivo para world models, aunque este checkpoint concreto no está condicionado por acciones.

## Capacidades

- Generación de imágenes de 32x32 píxeles condicionada por clase, limitada a las 10 clases de CIFAR-10 (aviones, coches, pájaros, gatos, ciervos, perros, ranas, caballos, barcos y camiones).
- Muestreo con classifier-free guidance (escala 4 en las muestras publicadas) y 1000 pasos DDPM.
- Continuación del entrenamiento desde el checkpoint, ya que incluye el estado del optimizador.
- Integración con la librería Simulusion mediante `DiT.from_pretrained("simillusion/dit-s4-cifar10")`.
- Uso como bloque base para construir world models dentro del ecosistema Simulusion (aunque este checkpoint no es action-conditioned).
- No soporta tool calling, agentes, texto, código ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Enseñanza de modelos de difusión: al ser un checkpoint de 33M de parámetros entrenable en dos horas en una GPU portátil, es ideal para cursos y tutoriales donde los estudiantes quieran entrenar o fine-tunear un DiT completo sin presupuesto de cómputo.
- Experimentación con guidance: permite probar distintos valores de classifier-free guidance y número de pasos de muestreo para estudiar su efecto sobre la calidad de las muestras en un modelo pequeño y rápido.
- Punto de partida para fine-tuning: los pesos y el estado del optimizador permiten continuar el entrenamiento con más épocas o hiperparámetros distintos para mejorar la calidad de las muestras más allá de las 40 épocas de la demo.
- Base para world models: dentro de Simulusion, sirve como componente de difusión sobre el que construir modelos condicionados por acciones, extendiéndolo con señales de control.
- Verificación de pipelines de entrenamiento: útil como prueba de humo (smoke test) para validar infraestructura de entrenamiento en PyTorch antes de lanzar ejecuciones grandes.
- Comparación de arquitecturas: permite comparar DiT frente a U-Nets de difusión en el mismo dataset (CIFAR-10) con coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como FID o Inception Score, y el propio autor indica que la ejecución no busca reproducir los resultados del paper original. Las únicas referencias cualitativas son las imágenes de muestra generadas con classifier-free guidance de escala 4 y 1000 pasos DDPM, visibles en la model card y en la galería del proyecto.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato explícito, pero dado el tamaño del modelo (33M de parámetros, repo de 0,1 GB), cualquier GPU moderna con 2-4 GB de VRAM es suficiente; el entrenamiento original se realizó en una RTX 3050 portátil de 4 GB.
- GPU recomendadas: cualquier GPU de consumo sirve tanto para inferencia como para continuar el entrenamiento; la propia demo se entrenó en una NVIDIA RTX 3050 (4 GB, portátil).
- Cabe con holgura en GPUs de consumo: RTX 3050, RTX 3060, RTX 4060 o superiores; también es viable en CPU dado el tamaño del modelo, aunque con mayor latencia de muestreo.
- Despliegue: vía librería Simulusion (`pip install simulusion huggingface_hub`) y carga con `DiT.from_pretrained`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia: no disponible; el muestreo con 1000 pasos DDPM implica un coste proporcional al número de pasos por imagen generada.

## Comparativa con modelos similares

| Modelo | Parametros | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|
| simillusion/dit-s4-cifar10 | 33 M | CIFAR-10 (40 epocas, demo) | MIT | Checkpoint publico en Hugging Face |
| DiT originales (Peebles & Xie) | DiT-S a DiT-XL (33 M a 675 M) | ImageNet a 256x256/512x512 | Codigo open source; checkpoints XL publicados | Codigo y checkpoints del paper |
| Otros DiT pequeños en CIFAR-10 (comunidad) | no disponible | no disponible | variable | no disponible |

Frente a los checkpoints originales del paper DiT (entrenados sobre ImageNet a alta resolución durante cientos de miles de iteraciones), este modelo es mucho más modesto en calidad y resolución, pero destaca por su licencia MIT permisiva y su total reproducibilidad en hardware de consumo. No existen comparativas cuantitativas publicadas con otros modelos de su categoría.

## Limitaciones y advertencias

- Calidad de muestras limitada: solo 40 épocas de entrenamiento; el autor advierte explícitamente que no reproduce los resultados del paper y que es una demo.
- Resolución fija de 32x32 píxeles y restringido a las 10 clases de CIFAR-10; no genera imágenes de propósito general.
- No está condicionado por acciones, por lo que no funciona como world model por sí solo dentro de Simulusion.
- Muestreo lento si se usan 1000 pasos DDPM; no hay documentación sobre samplers acelerados (DDIM, DPM-Solver) para este checkpoint.
- Sin métricas de evaluación publicadas (FID, IS), lo que impide compararlo objetivamente con otros modelos.
- Licencia MIT: sin restricciones para uso comercial, pero conviene citar el paper original y la librería Simulusion según las instrucciones de la model card.
- Riesgo bajo de alucinación al ser un modelo generativo de imágenes, pero las muestras pueden presentar artefactos típicos de CIFAR-10 y de un entrenamiento corto.
- Proyecto con muy poca tracción (13 descargas, 1 like en el momento de la ficha), sin comunidad de mantenimiento garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simillusion/dit-s4-cifar10
- Repositorio de Simulusion en GitHub: https://github.com/ParamThakkar123/simulusion
- Paper original DiT (arXiv): https://arxiv.org/abs/2212.09748
- Galeria del proyecto con muestras y curvas de aprendizaje: https://paramthakkar123.github.io/simulusion/gallery.html
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10

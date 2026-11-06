# simillusion/ijepa-vit-tiny-cifar10

## Resumen

I-JEPA ViT-Tiny on CIFAR-10 es un checkpoint de demostración publicado por el desarrollador simillusion (Param Thakkar) dentro de Simulusion, una biblioteca de PyTorch de código abierto que unifica distintos modelos del mundo bajo una única API. El modelo implementa la arquitectura I-JEPA (Joint-Embedding Predictive Architecture) descrita por Assran et al. en el paper de CVPR 2023, un método de aprendizaje autosupervisado que aprende representaciones de imágenes sin etiquetas y sin reconstruir píxeles: predice las representaciones de bloques enmascarados a partir de un contexto visible.

Se trata de un Vision Transformer de tamaño Tiny con patch size 4, entrenado durante 30 épocas sobre CIFAR-10, un conjunto de 60.000 imágenes de 32x32 píxeles en 10 clases. El entrenamiento completo se ejecutó en aproximadamente una hora sobre una GPU de portátil RTX 3050 con 4 GB de VRAM. El resultado es un extractor de características de imagen, no un clasificador: la tarea de clasificación se evalúa de forma indirecta mediante los 20 vecinos más cercanos en el espacio de características.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra que es posible entrenar un modelo I-JEPA funcional en hardware de consumo y sirve como componente de aprendizaje de representaciones dentro de la biblioteca Simulusion. El autor advierte explícitamente de que no es una reproducción de los resultados del paper, sino una ejecución corta de demostración. Con 15 descargas y 0 likes, su adopción en producción es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con I-JEPA, patch size 4 |
| Parametros totales | no disponible (variante Tiny; el número exacto no se indica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imágenes 32x32 de CIFAR-10) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | state dict de PyTorch (carga con `torch.load(..., weights_only=True)`); incluye estado del optimizador |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura I-JEPA propuesta por Assran et al. (CVPR 2023): un ViT que, dado un bloque de contexto visible de la imagen, predice las representaciones latentes de varios bloques objetivo enmascarados. A diferencia de los autoencoders enmascarados (MAE), no reconstruye píxeles, sino que opera en el espacio de embeddings, lo que evita que el modelo dedique capacidad a detalles de bajo nivel. La variante utilizada es Tiny con patch size 4, adecuada para imágenes de 32x32 como las de CIFAR-10.

El entrenamiento consistió en 30 épocas sobre el dataset `uoft-cs/cifar10`, sin etiquetas (autosupervisado), con un coste aproximado de una hora en una RTX 3050 de 4 GB. El checkpoint publicado es un state dict plano que incluye el estado del optimizador, lo que permite reanudar el entrenamiento. No se documentan en la model card detalles sobre el dataset de preentrenamiento más allá de CIFAR-10, ni sobre el uso de RLHF/DPO (no aplicable en un modelo de representación visual). El autor indica que no se trata de una reproducción de los resultados del paper original.

## Capacidades

- Extracción de características de imagen: genera embeddings de imágenes de 32x32 píxeles mediante un ViT-Tiny entrenado con I-JEPA.
- Aprendizaje autosupervisado: las representaciones se aprenden sin etiquetas, lo que permite usarlas como base para tareas posteriores.
- Clasificación por vecinos más cercanos: la evaluación del autor clasifica imágenes de test según sus 20 vecinos más cercanos en el espacio de características.
- Reanudación del entrenamiento: el checkpoint incluye estado del optimizador, por lo que se puede continuar el entrenamiento desde él.
- Integración con Simulusion: se carga mediante `JEPAAgent.from_pretrained("simillusion/ijepa-vit-tiny-cifar10")`.
- Sin soporte de tool calling, agentes, texto, visión general (más allá de 32x32), audio ni modo de razonamiento: es exclusivamente un extractor de características visuales.

## Casos de uso

- Docencia y divulgación de I-JEPA: permite reproducir en una GPU de consumo el flujo completo de entrenamiento autosupervisado con I-JEPA, útil para cursos y tutoriales sobre aprendizaje autosupervisado.
- Prototipado de pipelines de representación visual: sirve como extractor de características de referencia para validar arquitecturas y flujos de datos antes de escalar a modelos mayores.
- Investigación en clasificación con pocas etiquetas: el esquema de vecinos más cercanos sobre embeddings permite experimentar con clasificación semi-supervisada o few-shot sobre CIFAR-10.
- Componente de modelos del mundo en Simulusion: el autor lo posiciona como módulo de aprendizaje de representaciones dentro de la biblioteca de modelos del mundo, para integrarlo en agentes que necesiten percibir imágenes pequeñas.
- Pruebas de integración y CI: al ser un checkpoint ligero (0,2 GB) y de carga rápida, es adecuado para tests automatizados de pipelines de PyTorch que dependan de un extractor de características.
- Base para fine-tuning en dominios de baja resolución: puede servir como inicialización para tareas con imágenes de 32x32 (dígitos, señales de tráfico reducidas, microimágenes), aunque con expectativas de rendimiento modestas.
- Comparación de métodos autosupervisados: útil como línea base para contrastar I-JEPA con MAE, SimCLR o DINO en entornos con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Clasificación por 20 vecinos más cercanos (CIFAR-10 test) | 41,1 % |
| Misma red con inicialización aleatoria | 29,6 % |
| Azar (10 clases) | 10 % |

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo de visión. Tampoco se ofrecen métricas de linear probing ni de fine-tuning completo. Los datos anteriores son los únicos reportados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el entrenamiento completo cupo en 4 GB de VRAM, por lo que la inferencia requiere bastante menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB, como la RTX 3050 empleada por el autor; también cabe en GPUs integradas o CPU para inferencia puntual.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3050 y superiores); también en CPU.
- Opciones de despliegue: la vía documentada es la biblioteca Simulusion (`pip install simulusion`); los pesos son state dicts de PyTorch cargables con `torch.load(..., weights_only=True)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; el autor solo indica el tiempo de entrenamiento (aproximadamente una hora en RTX 3050).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| I-JEPA ViT-Tiny CIFAR-10 (este) | ViT-Tiny (no disponible) | Imágenes 32x32 | 41,1 % con 20-NN en CIFAR-10 | MIT | Hugging Face, 15 descargas |
| I-JEPA original (Assran et al., 2023) | ViT-H/14 y variantes | Imágenes de mayor resolución (ImageNet) | Resultados del paper en ImageNet (no disponibles aquí) | no disponible en esta ficha | Meta AI, código y pesos públicos |
| MAE (He et al.) | ViT-B a ViT-H | Imágenes de alta resolución | Resultados en ImageNet (no disponibles aquí) | no disponible en esta ficha | Repositorio oficial |
| DINO / DINOv2 | ViT-S a ViT-g | Imágenes de alta resolución | Resultados en ImageNet (no disponibles aquí) | no disponible en esta ficha | Repositorio oficial |

La comparación con alternativas solo es posible a nivel cualitativo: este checkpoint es una ejecución de demostración de 30 épocas sobre CIFAR-10, mientras que los modelos citados se entrenan sobre ImageNet a mayor escala. No se dispone de datos comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- No es una reproducción del paper: el autor lo declara explícitamente; los resultados son de una ejecución corta de demostración.
- Rendimiento modesto: 41,1 % de precisión por vecinos más cercanos en CIFAR-10, lejos de un clasificador supervisado entrenado.
- Dominio restringido: solo imágenes de 32x32 píxeles de CIFAR-10; no se ha validado en otros dominios ni resoluciones.
- Sin capacidades de texto, tool calling ni agentes: es exclusivamente un extractor de características visuales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las representaciones pueden ser poco discriminativas en clases visualmente similares.
- Sesgos: no documentados; CIFAR-10 es un dataset pequeño y con posibles sesgos de clase y de recolección.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre idoneidad para producción.
- Adopción mínima: 15 descargas y 0 likes; sin comunidad ni soporte documentado más allá de la model card.
- Dependencia de la biblioteca Simulusion: la carga documentada requiere esa librería, de nicho y mantenida por un único autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simillusion/ijepa-vit-tiny-cifar10
- Repositorio de Simulusion: https://github.com/ParamThakkar123/simulusion
- Galería de resultados y curvas de aprendizaje: https://paramthakkar123.github.io/simulusion/gallery.html
- Paper I-JEPA (Assran et al., CVPR 2023): https://arxiv.org/abs/2301.08243
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10

# jaeikkim/fr3-cube-mimicgen-native10hz-87aac180-diffusion-policy

## Resumen

El modelo `jaeikkim/fr3-cube-mimicgen-native10hz-87aac180-diffusion-policy` es una política de difusión (diffusion policy) entrenada para control robótico, específicamente para la tarea de apilamiento de cubos con un robot manipulador Franka FR3. Ha sido desarrollado por el usuario jaeikkim y está publicado en Hugging Face bajo el framework LeRobot, con pesos en formato safetensors. El modelo se ha entrenado con datos sintéticos generados mediante MimicGen en Isaac Sim, a partir de un dataset de 10 000 episodios de demostración.

La relevancia de este modelo reside en su enfoque de aprendizaje por imitación aplicado a robótica, utilizando una arquitectura de difusión para generar acciones de control a alta frecuencia (10 Hz). Aunque el acceso está restringido (gated) y no se dispone de licencia ni documentación técnica detallada, su publicación en LeRobot permite su integración en pipelines de entrenamiento y despliegue de políticas robóticas. El repositorio ocupa 9,8 GB, lo que sugiere que incluye pesos completos y posiblemente datos adicionales.

Este modelo se enmarca en la tendencia de usar datos simulados y generativos para reducir la dependencia de demostraciones humanas costosas en robótica, como propone el proyecto MimicGen. Sin embargo, al carecer de especificaciones públicas sobre arquitectura interna, parámetros o benchmarks, su evaluación práctica requiere acceso al repositorio y pruebas locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (no se especifican detalles internos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (aplica a observaciones de estado/vision) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

La arquitectura se basa en una política de difusión (diffusion policy), un enfoque generativo que modela la distribución de acciones condicionada a observaciones del entorno. En lugar de predecir directamente una acción, el modelo refina iterativamente una secuencia de acciones a partir de ruido, lo que permite capturar distribuciones multimodales y generar comportamientos más robustos. El entrenamiento se realiza mediante aprendizaje por imitación, utilizando demostraciones sintéticas generadas con MimicGen en el simulador Isaac Sim.

Los datos de entrenamiento provienen del dataset `jaeikkim/fr3-cube-mimicgen-10k`, que contiene 10 000 episodios de la tarea de apilamiento de cubos con el robot Franka FR3. Cada episodio incluye observaciones de múltiples cámaras (RGB) y estados del robot, muestreados a 10 Hz, como indica el nombre del modelo. No se dispone de información sobre el número total de tokens o pasos de entrenamiento, ni sobre el uso de técnicas como RLHF o DPO (no aplicables en este contexto). La innovación principal es la combinación de datos sintéticos a gran escala con una política de difusión para control robótico, una línea de investigación activa en el campo.

## Capacidades

- Control de robot manipulador: genera comandos de articulaciones o acciones de efector final para ejecutar tareas de manipulación, específicamente apilamiento de cubos.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones, tanto humanas como sintéticas.
- Generación de acciones multimodales: gracias a la naturaleza generativa de la difusión, puede manejar múltiples soluciones válidas para una misma observación.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Frecuencia de control de 10 Hz: adecuado para tareas de manipulación de baja velocidad, no para movimientos muy dinámicos.
- Observaciones visuales y de estado: el modelo acepta entradas de cámaras RGB y estados del robot (posiciones de articulaciones, etc.), aunque el formato exacto no está documentado públicamente.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar políticas de difusión en robótica, comparando su rendimiento con otras arquitecturas (MLP, transformers, etc.) en tareas de manipulación.
- Desarrollo de políticas de control para robots Franka: el modelo puede desplegarse en un robot FR3 real o en simuladores como Isaac Sim para ejecutar tareas de apilamiento, sirviendo como referencia para transferencia sim-to-real.
- Generación de datos sintéticos para entrenamiento: junto con MimicGen, permite crear grandes volúmenes de demostraciones sin intervención humana, reduciendo costes de recolección de datos.
- Evaluación de robustez en entornos simulados: al ser entrenado con datos sintéticos, se puede probar su comportamiento ante variaciones de iluminación, posiciones de objetos o perturbaciones en el simulador.
- Benchmarking de frameworks de robótica: útil para comparar LeRobot con otros frameworks (RLBench, robosuite, etc.) en tareas estandarizadas de apilamiento.
- Educación y demostraciones: como ejemplo de política de difusión entrenada con datos generativos, puede utilizarse en cursos o tutoriales de robótica e IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como éxito de tarea, precisión de apilamiento, ni comparaciones con otras políticas. El rendimiento debe evaluarse empíricamente tras obtener acceso al modelo y ejecutarlo en el entorno correspondiente.

## Requisitos de hardware

- No se dispone de información específica sobre VRAM, GPU recomendadas o latencia.
- Dado que es un modelo de difusión con pesos en safetensors y un tamaño de repositorio de 9,8 GB, se estima que la inferencia requiere una GPU con al menos 8-12 GB de VRAM para la carga de pesos y el procesamiento de observaciones visuales, aunque esto es una estimación no confirmada.
- Al estar integrado en LeRobot, puede ejecutarse en entornos que soporten PyTorch y CUDA. No hay soporte documentado para cuantización o despliegue en CPU.
- Para entrenamiento o fine-tuning se necesitaría una GPU de gama alta (A100, H100 o similar) debido al tamaño del modelo y la naturaleza de los datos de imagen.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. Existen otras políticas de difusión en robótica (por ejemplo, las publicadas por el equipo de Diffusion Policy original), pero no se conocen datos concretos de este modelo frente a ellas. Se recomienda consultar la literatura de Diffusion Policy (Chi et al., 2023) y los benchmarks de LeRobot para contextualizar.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face, lo que limita su uso inmediato.
- Sin licencia especificada: no se puede determinar si es de uso comercial o solo investigativo.
- Datos sintéticos: el entrenamiento con simulaciones puede no transferir perfectamente al mundo real (problema de sim-to-real gap).
- Tarea específica: el modelo está diseñado solo para apilamiento de cubos; no es generalizable a otras tareas sin reentrenamiento.
- Sin documentación técnica: no hay información sobre arquitectura interna, hiperparámetros, ni procedencia exacta de los datos.
- Fecha de creación futura (2026-08-30): el modelo parece haber sido subido con una fecha posterior a la actual, lo que sugiere que podría ser un artefacto de prueba o un error de metadatos.
- Riesgo de alucinación: no aplica, ya que no es un modelo de lenguaje; pero podría generar acciones no seguras si se usa fuera del entorno de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaeikkim/fr3-cube-mimicgen-native10hz-87aac180-diffusion-policy
- Dataset asociado: https://huggingface.co/datasets/jaeikkim/fr3-cube-mimicgen-10k
- Modelo relacionado (one-step diffusion policy): https://huggingface.co/jaeikkim/fr3-cube-mimicgen10k-onestep-diffusion-policy
- Página del proyecto MimicGen: https://mimicgen.github.io/
- Dataset alternativo en Claru: https://claru.ai/datasets/jaeikkim-fr3-cube-mimicgen-10k
- Dataset con RGB en Claru: https://claru.ai/datasets/jaeikkim-fr3-cube-full-episode-mimicgen-10k-rgb

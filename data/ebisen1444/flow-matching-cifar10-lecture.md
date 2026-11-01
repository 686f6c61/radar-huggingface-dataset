# ebisen1444/flow-matching-cifar10-lecture

## Resumen

Flow Matching CIFAR-10 (lecture weights) es un modelo generativo de imágenes incondicional entrenado sobre el conjunto de datos CIFAR-10 (50.000 imágenes de 32×32 píxeles en 10 clases). Lo publica el usuario ebisen1444 como material didáctico para un cuaderno introductorio de Flow Matching escrito en japonés. No se trata de un modelo de lenguaje ni de un sistema multimodal: es una red U-Net convolucional de 35,7 millones de parámetros que aprende un campo de velocidades para transformar ruido gaussiano en imágenes mediante un solver ODE.

La relevancia del modelo es formativa y metodológica. Implementa el objetivo Conditional Flow Matching con la ruta condicional recta (optimal transport) de Lipman et al. (2023), con `sigma_min = 1e-4` y emparejamiento independiente de ruido e imagen (sin OT por minibatch). Sirve como referencia mínima y reproducible para quien quiera entender la mecánica de los modelos de flujo frente a los modelos de difusión clásicos, con un coste de entrenamiento de unas 5 horas en una única A100 en BF16.

El repositorio ocupa 0,1 GB y contiene únicamente los pesos en formato `torch.save`. No se han publicado métricas de calidad (el propio autor indica que el FID no se ha evaluado), por lo que debe considerarse un artefacto docente y no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional (TorchCFM `UNetModelWrapper`, commit `7c653857`) para Flow Matching condicional |
| Parametros totales | 35,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, resolución 32×32) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `torch.save` (dict con claves `format`, `step`, `config`, `model_state`, `provenance`) |

## Arquitectura y entrenamiento

La red es un U-Net de 128 canales base con 2 bloques residuales por nivel, multiplicadores de canal [1, 2, 2, 2], atención en la resolución 16×16 con 4 cabezas y dropout de 0,1. El objetivo es Conditional Flow Matching con trayectoria condicional recta (OT-CFM) de Lipman et al. (2023), usando `sigma_min = 1e-4`; el ruido y las imágenes se emparejan de forma independiente, sin optimal transport por minibatch. La predicción es el campo de velocidades que aproxima la interpolación lineal entre ruido y datos.

El entrenamiento se realizó sobre el split de entrenamiento de CIFAR-10 (50.000 imágenes), de forma incondicional, con píxeles escalados como `x / 128 - 1` y volteo horizontal como única aumentación. Se usó el optimizador Adam con tasa de aprendizaje 2e-4, 5.000 pasos de warmup, tamaño de lote 128 y recorte de gradiente de 1,0, durante 100.000 actualizaciones en BF16 sobre una A100 (aproximadamente 5 horas, semilla 20261025). Los pesos publicados son los del promedio exponencial móvil (EMA) con decaimiento 0,9999.

Para la generación, el autor emplea el solver ODE de punto medio con 50 pasos (100 evaluaciones de red), que produce objetos reconocibles. No hay decodificación especulativa, atención lineal ni otras innovaciones de inferencia: el interés técnico está en la formulación del flujo y en la reproducibilidad del pipeline.

## Capacidades

- Generación de imágenes incondicional a 32×32 píxeles, con temática limitada a las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Muestreo mediante integración de una ODE aprendida (campo de velocidades), con solver de punto medio y número de pasos configurable.
- Entrenamiento e inferencia reproducibles: el cuaderno verifica el SHA-256 de `weights.pt` antes de cargarlo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión por comprensión, audio ni modo de pensamiento.
- No dispone de condicionamiento por clase, texto u otra señal externa: la generación es puramente incondicional.

## Casos de uso

- Docencia de modelos generativos: el modelo sirve como ejemplo mínimo y ejecutable de Flow Matching en un curso introductorio, con pesos verificables por hash y un cuaderno que guía el proceso de muestreo.
- Estudio comparativo de objetivos de entrenamiento: permite contrastar empíricamente la ruta recta OT-CFM frente a difusión denoising y score matching sobre un mismo conjunto de datos pequeño.
- Reproducción de experimentos: al estar fijada la semilla (20261025), la configuración de Adam y el número de actualizaciones, es posible replicar el entrenamiento en una sola GPU para validar resultados.
- Prototipado de solvers ODE: sirve para probar distintos integradores (Euler, punto medio, Heun) y números de pasos sobre un campo de velocidades ya entrenado, midiendo el compromiso entre coste y calidad visual.
- Base para extensiones condicionadas: el `config` y el `model_state` permiten partir de estos pesos e introducir condicionamiento por clase o por texto en proyectos de investigación docentes.
- Pruebas de infraestructura de inferencia: con 35,7 M de parámetros y pesos de 0,1 GB, es útil para validar pipelines de carga de checkpoints `torch.save` y de ejecución en GPU de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el FID no se ha evaluado y solo describe la calidad como "objetos reconocibles" con el solver de punto medio a 50 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en FP32 (35,7 M de parámetros ≈ 143 MB) más el estado del solver; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento de referencia se hizo en una A100, pero la inferencia funciona en GTX 1650, RTX 3060, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: PyTorch nativo con `torch.load(path, weights_only=True)`; no hay pesos GGUF ni integración con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma medida; con 100 evaluaciones de red por muestra en el solver de punto medio, el coste es bajo pero depende de la GPU y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flow Matching CIFAR-10 (lecture) | 35,7 M | 32×32 | OT-CFM incondicional | MIT | Pesos en HF |
| Modelos de difusión CIFAR-10 tipo DDPM | no disponible | 32×32 | Difusión denoising | variable | Múltiples implementaciones |
| Modelos de flujo condicionados por clase en CIFAR-10 | no disponible | 32×32 | CFM condicionado | variable | Múltiples implementaciones |

No se dispone de datos de rendimiento comparables en la información proporcionada, por lo que la comparación se limita a la categoría y al objetivo de entrenamiento.

## Limitaciones y advertencias

- Calidad no cuantificada: no hay FID ni métricas de diversidad publicadas; la valoración del autor es cualitativa.
- Resolución y dominio muy restringidos: solo genera imágenes de 32×32 píxeles dentro de las 10 clases de CIFAR-10; no generaliza a otros dominios.
- Sin condicionamiento: no acepta prompts, etiquetas de clase ni otra señal de control.
- Riesgo de sesgos del dataset: CIFAR-10 contiene clases y representaciones limitadas y posiblemente estereotipadas; el modelo las reproduce sin filtro.
- Alucinación en sentido generativo: puede producir imágenes incoherentes o mezclas de clases, especialmente con pocos pasos de solver.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; al ser material docente, no hay soporte ni mantenimiento.
- Formato de pesos no estándar: requiere `torch.load` con `weights_only=True` y conocer la clase `UNetModelWrapper` del commit indicado para reconstruir el modelo.
- Fecha de creación del repositorio inusual (2026-10-26): conviene verificar la integridad del artefacto con el SHA-256 publicado antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/ebisen1444/flow-matching-cifar10-lecture
- Paper de Flow Matching (Lipman et al., 2023): no disponible en la información proporcionada
- Repositorio TorchCFM (commit `7c653857`): no disponible en la información proporcionada
- Cuaderno docente en japonés: no disponible en la información proporcionada

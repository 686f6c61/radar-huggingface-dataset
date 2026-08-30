# lair-nyu/yor_icl_pi0_fast_easy_pnp_v2_sanity15k_annealing

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un modelo de visión-lenguaje-acción (VLA) basado en la arquitectura pi0-FAST, desarrollado por el laboratorio LAIR de la Universidad de Nueva York (lair-nyu). El modelo es una variante del pi0-FAST entrenada sobre un subconjunto reducido de 4 tareas del dataset `icl-dataset`, con 15.000 pasos de optimización y un esquema de decaimiento de tasa de aprendizaje tipo coseno ajustado correctamente al número total de pasos. El propósito declarado es validar el backend y el pipeline de datos FAST antes de un entrenamiento expandido.

El checkpoint corresponde al paso 14999 de un entrenamiento que finalizó con normalidad. Incluye únicamente los pesos del policy (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador (`train_state/`), por lo que no es posible reanudar el entrenamiento desde este punto. Se entrenó con el framework openpi sobre dos GPU H200. No se dispone de información pública sobre licencia, idiomas soportados ni especificaciones detalladas de arquitectura, lo que limita su uso directo en producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0-FAST (VLA autoregresivo basado en FAST action tokenizer, sobre arquitectura pi0 de Physical Intelligence) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo contiene `params/` y `assets/`, probablemente safetensors o checkpoint de openpi, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se basa en pi0-FAST, una variante autoregresiva del modelo pi0 de Physical Intelligence que utiliza el tokenizador de acciones FAST. A diferencia del pi0 original (basado en flujos), pi0-FAST tokeniza las acciones en un espacio discreto y las genera de forma autoregresiva junto con los tokens de texto e imagen, lo que simplifica el entrenamiento y la inferencia. Este checkpoint concreto se entrenó sobre un subconjunto de 4 tareas del dataset `icl-dataset` (no se especifica qué tareas), con 15.000 pasos, tamaño de batch 128 y un decaimiento de tasa de aprendizaje coseno escalado correctamente al número de pasos (`decay_steps` igual a `num_train_steps`). El entrenamiento se realizó con el framework openpi en dos GPU H200 y finalizó de forma normal en el paso 14999.

No se proporcionan detalles sobre la composición del dataset de entrenamiento, ni sobre el uso de técnicas como RLHF o DPO. La finalidad declarada es una comprobación de cordura del pipeline FAST antes de un entrenamiento expandido (`yor_icl_pi0_fast_expanded`).

## Capacidades

- Control robótico de tipo visión-lenguaje-acción: el modelo recibe observaciones visuales e instrucciones en lenguaje natural y genera acciones de control para un robot.
- Generación autoregresiva de acciones discretas mediante el tokenizador FAST, lo que permite integrarse con pipelines de decodificación estándar.
- Capacidad de seguir instrucciones en lenguaje natural para manipulación robótica, dentro de las tareas del dataset `icl-dataset`.
- Al ser un checkpoint de validación sobre un subconjunto pequeño, no se puede afirmar que generalice a tareas fuera de ese conjunto.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-step, visión general, audio u otras capacidades fuera del ámbito VLA.

## Casos de uso

- Validación de pipelines de entrenamiento VLA: este checkpoint sirve para verificar que el backend FAST y el pipeline de datos de openpi funcionan correctamente antes de lanzar entrenamientos a mayor escala.
- Desarrollo de políticas robóticas en entornos de investigación: investigadores pueden cargar estos pesos para probar el comportamiento del modelo en las 4 tareas del subset y comparar con el modelo pi0.5 equivalente.
- Benchmarking de variantes de tokenización de acciones: al ser la versión FAST de `yor_icl_pi05_easy_pnp_v2`, permite comparar el rendimiento entre el tokenizador FAST y el enfoque basado en flujo del pi0.5.
- Estudio de efectos del decaimiento de tasa de aprendizaje: el ajuste de `decay_steps` a `num_train_steps` permite analizar el impacto del annealing correcto en la convergencia.
- Desarrollo de motores de inferencia en tiempo real: el repositorio FlashRT menciona soporte para pi0-FAST, por lo que este checkpoint podría utilizarse para probar inferencia de baja latencia en entornos de control robótico.
- Reproducción de experimentos de investigación: al estar disponible el checkpoint y el nombre de la config de openpi, otros equipos pueden reproducir el entrenamiento o continuar desde este punto si obtienen el estado del optimizador (no incluido aquí).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento, evaluaciones en tareas robóticas estándar ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, los modelos pi0 suelen requerir al menos 24 GB de VRAM en cuantizaciones reducidas, pero este checkpoint no especifica tamaño ni cuantización.
- GPU recomendadas: el entrenamiento se realizó con 2x H200 (141 GB VRAM cada una). Para inferencia, se recomendaría al menos una GPU con 40-80 GB VRAM, aunque sin datos de tamaño de parámetros no se puede precisar.
- No se puede afirmar que quepa en GPU de consumo (RTX 4090, etc.) sin conocer el número de parámetros y la cuantización.
- Opciones de despliegue: el framework openpi es el entorno natural; también se menciona FlashRT como motor de inferencia en tiempo real para pi0-FAST. No se indica compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo es un checkpoint de validación interna, no un modelo final de propósito general. Se puede mencionar que es una variante FAST de `yor_icl_pi05_easy_pnp_v2`, pero no hay métricas públicas de ninguno de los dos. Alternativas de la misma familia (pi0, pi0.5) están publicadas por Physical Intelligence en openpi, pero sin datos de este checkpoint concreto no es posible comparar rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información. Al ser un modelo entrenado sobre un subconjunto pequeño de tareas robóticas, es probable que tenga un sesgo fuerte hacia las tareas específicas del dataset `icl-dataset`.
- Riesgo de alucinación: no aplicable directamente a un VLA, pero las acciones generadas pueden ser incorrectas o inseguras si el modelo se usa fuera de su distribución de entrenamiento.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados; probablemente solo inglés, pero sin confirmar.
- Restricciones de licencia: la licencia no está declarada. No se puede asumir que sea de uso libre; se debe contactar con los autores antes de cualquier uso comercial.
- Importante para producción: este checkpoint es una comprobación de sanidad del pipeline, no un modelo de producción. No incluye el estado del optimizador, por lo que no se puede reanudar el entrenamiento. No hay garantías de seguridad robótica ni de robustez.
- El entrenamiento se realizó sobre un subconjunto de 4 tareas, por lo que la generalización a otras tareas o entornos es muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi0_fast_easy_pnp_v2_sanity15k_annealing
- Organización LAIR NYU en HuggingFace: https://huggingface.co/lair-nyu
- Checkpoint relacionado `sanity15k_annealing`: https://huggingface.co/lair-nyu/sanity15k_annealing
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Web de Physical Intelligence: https://www.pi.website/
- FlashRT (motor de inferencia para pi0/pi0.5/pi0-FAST): https://github.com/flashrt-project/FlashRT

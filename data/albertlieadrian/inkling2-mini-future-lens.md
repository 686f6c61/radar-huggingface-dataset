# albertlieadrian/inkling2-mini-future-lens

## Resumen

Inkling 2 Mini future lens (v1) es un conjunto de dos traductores de baja complejidad entrenados para interpretar el modelo base [Inkling 2 Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini) de Thinking Machines. No es un modelo generativo autónomo: es una herramienta de interpretabilidad mecanística que permite leer, en una visita concreta de una capa concreta, la distribución de probabilidad que el modelo base asignará al primer token de contenido de su respuesta. Fue desarrollado por el usuario albertlieadrian en el marco del [Looped Lens Challenge](https://ndif.us/looped-lens-challenge/) organizado por NDIF.

La relevancia técnica radica en que Inkling 2 Mini es un transformer con bucles (looped transformer): las capas 6 a 17 se ejecutan tres veces, de modo que un token atraviesa 48 visitas de capa (0-47). Los traductores explotan esta estructura recurrente para extraer información predictiva de estados intermedios, algo que en un transformer convencional requeriría sondas específicas por capa. Cada traductor es un mapa afín de bajo rango (rango 128) que se aplica sobre la entrada de la subcapa MoE de una visita determinada.

El modelo se publica con licencia MIT y un tamaño de repositorio de 0,0 GB (pesos en bfloat16 de baja dimensionalidad). No está pensado para inferencia generativa directa, sino para análisis de circuitos, depuración de modelos y estudio de la dinámica de cómputo en arquitecturas recurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa afín de bajo rango (rango 128) sobre estados internos de un transformer con bucles (Inkling 2 Mini) |
| Parametros totales | No disponible (repo de 0,0 GB; pesos en bfloat16) |
| Parametros activos | No aplica (no es MoE; el modelo base sí lo es) |
| Longitud de contexto | No disponible (heredada del modelo base Inkling 2 Mini) |
| Tipos de cuantizacion | No disponible (pesos almacenados en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (`future_lens_v1.safetensors`, bfloat16) |

## Arquitectura y entrenamiento

Cada traductor es una transformación afín de bajo rango de la forma `y = x + U (V x) + b`, con rango 128, aplicada sobre la entrada de la subcapa MoE (`post_attention_layernorm.input`) de una visita concreta, en el último token del prompt. Tras la transformación se aplican la normalización final y el unembedding propios del modelo base para obtener logits. Se publican dos claves: `mlp_in.34` (visita 34, capa 10, tercera pasada) y `mlp_in.44` (visita 44, capa 20, bloque final). El objetivo de entrenamiento es la distribución del modelo sobre el primer token de contenido de su respuesta (un token más allá del token de control de chat), lo que da nombre al "future lens"; para texto plano el objetivo es el siguiente token ordinario.

El entrenamiento usó aproximadamente 6.000 prompts: preguntas abiertas de `nq_open` en el formato de chat del modelo, preguntas aritméticas aleatorias y prefijos de frases de `wikitext-103`. Ninguna pregunta del conjunto de evaluación del reto se incluyó en el entrenamiento. Los objetivos fueron las top-256 log-probabilidades del propio modelo en la posición objetivo (renormalizadas). Se entrenó durante 3 épocas con AdamW (lr 2e-3, weight decay 1e-4) y entropía cruzada contra el objetivo, con un 10% reservado para validación; la entropía cruzada de validación bajó de aproximadamente 25 a 3,7 nats. Los pesos se almacenan en bfloat16.

## Capacidades

- Lectura predictiva del primer token de contenido de la respuesta del modelo base a partir de estados intermedios en visitas específicas.
- Interpretabilidad mecanística de transformers con bucles: permite estudiar cómo evoluciona la representación a lo largo de las pasadas recurrentes.
- Análisis de la mezcla de atención de profundidad y del gating del mensaje de la pasada anterior en capas concretas.
- Aplicable a preguntas abiertas (formato chat), aritmética y texto plano (predicción del siguiente token).
- No realiza generación de texto, tool calling, razonamiento multi-step ni capacidades multimodales por sí mismo.
- No soporta agentes ni function calling; su función es analítica, no operativa.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo se forma la predicción del siguiente token en un transformer con bucles comparando las lecturas en la visita 34 (capa 10, tercera pasada) y la visita 44 (capa 20, bloque final).
- Depuración de modelos recurrentes: identificar en qué pasada y capa se consolida la intención de respuesta del modelo base, útil para diagnosticar comportamientos anómalos.
- Estudio de circuitos de atención de profundidad: examinar la contribución de la mezcla de bloques completados y bloque activo en la subcapa MoE.
- Validación de hipótesis sobre gating de mensajes entre pasadas: comprobar si la información de la pasada anterior se preserva o se transforma en cada visita.
- Docencia y formación: material práctico para explicar sondas lineales y lentes futuras en arquitecturas no convencionales.
- Reproducción de experimentos del Looped Lens Challenge: servir como línea base para comparar nuevas sondas o traductores sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo reportado es la entropía cruzada de validación del entrenamiento, que descendió de aproximadamente 25 a 3,7 nats.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos son dos mapas de rango 128 en bfloat16 y el repositorio ocupa 0,0 GB. El cuello de botella es ejecutar el modelo base Inkling 2 Mini para extraer los estados internos.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el modelo base; para los traductores basta una GPU consumer.
- Cabe en GPU consumer: sí, los traductores por sí solos; el modelo base depende de su tamaño (no disponible).
- Opciones de despliegue: carga directa con `safetensors.torch.load_file`; requiere acceso a los estados internos del modelo base (hooks o framework de interpretabilidad como NDIF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini future lens (v1) | Traductor de interpretabilidad (mapa afín rango 128) | No disponible | No disponible | MIT | Hugging Face |
| Sondas lineales estándar (logistic regression probes) | Sonda de interpretabilidad | Depende de la dimensión oculta | No aplica | Variable | Genéricas |
| Lens de tipo "tuned lens" | Traductor afín por capa | Depende del modelo | No aplica | Variable | Genéricas |

No se dispone de datos de rendimiento comparables publicados para estos enfoques en el contexto del modelo base.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para producir texto, código ni respuestas.
- Depende estrictamente del modelo base `thinkingmachines/Inkling-2-Mini`; no es transferible a otras arquitecturas sin reentrenamiento.
- Solo cubre dos visitas concretas (34 y 44); no ofrece una lectura completa de las 48 visitas.
- Entrenado con unos 6.000 prompts de dominios limitados (nq_open, aritmética, wikitext-103); puede degradarse fuera de esas distribuciones.
- Riesgo de sobreajuste a la distribución de entrenamiento y de interpretaciones erróneas si se aplica a prompts muy distintos.
- Licencia MIT permite uso comercial, pero el modelo base puede tener sus propias restricciones que deben respetarse.
- Sin datos de sesgos, idiomas o evaluación en producción; no apto para uso directo en sistemas en producción sin validación adicional.

## Enlaces

- [Hugging Face: albertlieadrian/inkling2-mini-future-lens](https://huggingface.co/albertlieadrian/inkling2-mini-future-lens)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Looped Lens Challenge](https://ndif.us/looped-lens-challenge/)
- [Repositorio del reto en GitHub](https://github.com/ndif-team/looped-lens-challenge)

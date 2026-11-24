# DBresh1/qwen-news-qlora

## Resumen

DBresh1/qwen-news-qlora es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario DBresh1. No se trata de un modelo de propósito general, sino de un clasificador binario de titulares de noticias orientado a preferencias personales: dada una noticia, el adaptador puntúa los logits del siguiente token para "0" (omitir) y "1" (mostrar), aplicando softmax sobre ambas opciones. El objetivo es filtrar automáticamente el flujo informativo según los gustos de un usuario concreto.

El adaptador está pensado para titulares en ucraniano y ruso, y se distribuye bajo licencia Apache 2.0 con pesos en formato PEFT/safetensors. El repositorio es de tamaño mínimo (0.0 GB) y no registra descargas ni likes, lo que refleja su carácter experimental y estrictamente personal.

Es relevante como ejemplo de aplicación de QLoRA a una tarea de clasificación muy narrow con un modelo pequeño (1.7B), pero sus métricas publicadas son modestas (Macro-F1 de 0.498 sobre 40 titulares) y el propio autor advierte de limitaciones metodológicas serias, como el reducido tamaño del conjunto de datos y la reutilización del conjunto de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Qwen3-1.7B) |
| Parámetros totales | No disponible (adaptador LoRA con r=8, alpha=16; base de 1.7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B, no especificada en la model card) |
| Tipos de cuantización | Entrenamiento con NF4 y doble cuantización (QLoRA); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Ucraniano (uk), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT / safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen/Qwen3-1.7B, un transformer decoder, mediante QLoRA con cuantización NF4 y doble cuantización del modelo base congelado. La configuración LoRA emplea r=8 y alpha=16, con un learning rate de 0.0001, 60 pasos de entrenamiento, tamaño de batch 1 y acumulación de gradientes de 8. El entrenamiento usa pérdida solo sobre la completación (completion-only loss) y desactiva el modo de razonamiento (thinking) del modelo base.

La selección del checkpoint se realiza por pérdida de validación, y el umbral de decisión se ajusta por Macro-F1 en validación (umbral final de 0.6). El autor menciona también un adaptador MiniLM con base congelada en precisión completa que entrena una cabeza de clasificación, incluida en el repositorio. La versión de los datos de entrenamiento es 2026-11-21 y la variante es "mixed". No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Clasificación binaria de titulares de noticias según preferencias personales (0 = omitir, 1 = mostrar).
- Puntuación mediante logits del siguiente token para "0" y "1", con softmax restringido a esas dos opciones (no es generación libre).
- Soporte de idiomas ucraniano y ruso.
- Uso mediante PEFT junto al modelo base Qwen/Qwen3-1.7B.
- Inclusión de una cabeza de clasificación para la variante MiniLM.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo thinking (explícitamente desactivado durante el entrenamiento).

## Casos de uso

- Filtrado personal de feeds RSS: el adaptador puntúa cada titular y descarta los que quedan por debajo del umbral 0.6, reduciendo el ruido en un lector de noticias en ucraniano o ruso.
- Priorización de alertas informativas: integrado en un pipeline que ordena titulares por probabilidad de interés antes de enviar notificaciones al usuario.
- Prototipado de sistemas de recomendación de contenido: sirve como base para experimentar con clasificación de preferencias sobre un modelo pequeño y desplegable en hardware modesto.
- Investigación sobre QLoRA aplicado a tareas de clasificación: el repositorio documenta la configuración completa (r, alpha, learning rate, pasos) y puede replicarse como referencia metodológica.
- Clasificación de titulares en entornos con recursos limitados: al partir de un modelo de 1.7B cuantizado, es viable en servidores pequeños (el autor menciona un servidor de 1 GB, aunque no lo ha medido en memoria).
- Experimentación con umbrales de decisión: el archivo news_filter_config.json permite ajustar el umbral y la configuración de entrada para calibrar precisión frente a recall según el caso.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Macro-F1 (test humano de 40 titulares) | 0.498 |
| Precisión clase "show" | 0.400 |
| Recall clase "show" | 0.154 |
| Umbral de decisión | 0.6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores corresponden a una prueba propia del autor sobre 40 titulares reutilizados del conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un adaptador sobre un modelo de 1.7B, el requisito depende de la cuantización elegida para el modelo base, no especificada.
- GPU recomendadas: no disponible; el autor indica que no ha realizado pruebas de memoria en su servidor de 1 GB.
- Compatibilidad con GPU de consumo: plausible por el tamaño del modelo base (1.7B), pero no confirmada en la documentación.
- Opciones de despliegue: PEFT con el modelo base Qwen/Qwen3-1.7B; el autor no documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DBresh1/qwen-news-qlora | Adaptador sobre base de 1.7B | No disponible | Clasificación binaria de noticias (uk/ru) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1.7B | No disponible en esta ficha | Generación general | Apache 2.0 | Hugging Face |
| Adaptadores de filtrado de noticias comparables | No disponible | No disponible | Clasificación de preferencias | No disponible | No disponible |

No se dispone de información sobre otros adaptadores directamente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Conjunto de datos personal y muy pequeño; los resultados no son generalizables a otros usuarios.
- El conjunto de test se reutilizó y algunos prompts del profesor habían visto ejemplos humanos, lo que puede inflar las métricas.
- Las anotaciones generadas por IA contienen conflictos.
- Los titulares por sí solos no explican preferencias que dependen de noticias leídas previamente.
- Métricas bajas: recall de 0.154 en la clase "show" implica que se pierden la mayoría de las noticias relevantes.
- El adaptador no se ha desplegado ni medido en memoria en el servidor de 1 GB del autor.
- No se ha subido el conjunto de datos de entrenamiento, lo que dificulta la reproducibilidad.
- Aunque la licencia es Apache 2.0, el uso comercial no está validado por el rendimiento ni por la calidad de los datos.
- El modo thinking está desactivado; el modelo no está pensado para razonamiento multi-paso ni generación abierta.
- Riesgo de sesgos y alucinaciones inherente al modelo base y a las preferencias personales codificadas en los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DBresh1/qwen-news-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Configuración del filtro: archivo news_filter_config.json incluido en el repositorio del modelo

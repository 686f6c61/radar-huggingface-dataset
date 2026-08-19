# PastelRuntime/KB-Diffusion-ModelB

## Resumen

KB-Diffusion Model B es un modelo de difusión discreta enmascarada a nivel de palabra, desarrollado por PastelRuntime (Bijan Bowen / OminousIndustries) como experimento educativo dentro del proyecto KB-Diffusion-Optimized. Con solo 4,75 millones de parámetros, está entrenado sobre 8.000 palabras inglesas de cinco letras y su objetivo es demostrar que la receta de difusión enmascarada (estilo LLaDA) funciona más allá del caso original de teclados, validando así la generalidad del mecanismo.

El modelo emplea un transformer bidireccional sin máscara causal, con un vocabulario de 27 tokens (a-z más el token [MASK]) y una longitud de secuencia fija de 5 posiciones. Su relevancia radica en que evidencia empíricamente que el muestreador (sampler) es tan determinante como los parámetros: con los mismos pesos, la tasa de palabras válidas varía entre el 2% y el 68,4% según la estrategia de decodificación empleada. Es una herramienta puramente educativa, no apta para producción, pero muy útil para comprender los fundamentos de la difusión discreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional sin máscara causal, 6 capas, 4 cabezas, dim 256, FF 1024 |
| Parametros totales | 4,75 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 5 tokens (fija) |
| Tipos de cuantizacion | no disponible (pesos en precisión flotante estándar de PyTorch) |
| Idiomas soportados | Inglés (solo palabras de 5 letras) |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional sin máscara causal, con 6 capas, 4 cabezas de atención, dimensión de modelo 256 y feed-forward de 1024. El vocabulario se limita a 27 tokens: las 26 letras del alfabeto inglés más el token especial [MASK]. La secuencia de entrada tiene longitud fija de 5 posiciones, correspondiente a una palabra de cinco letras.

El entrenamiento sigue el enfoque LLaDA: se enmascara una proporción aleatoria de posiciones con una ratio t muestreada uniformemente en el intervalo (0.05, 1), y se optimiza la pérdida de entropía cruzada únicamente sobre las posiciones enmascaradas, ponderada por 1/t. Se usa AdamW con tasa de aprendizaje 3e-4, 8.000 pasos y batch de 1024. El entrenamiento completo se completó en aproximadamente 11 minutos en una GPU T4 gratuita de Kaggle. La innovación clave no está en la arquitectura, sino en el diseño experimental: se sustituyen los cuatro teclados del proyecto original por miles de palabras, lo que amplía drásticamente el espacio de hipótesis y permite comprobar si el mismo procedimiento sigue funcionando.

## Capacidades

- Generación de secuencias de 5 letras en inglés mediante difusión discreta enmascarada.
- Generalización a palabras no vistas durante el entrenamiento: el 66,4% de las salidas válidas provienen de la lista de entrenamiento, mientras que el resto son palabras nuevas generadas correctamente.
- Soporte de múltiples estrategias de muestreo: one-shot paralelo, commits por pasos (k=2), ancestral con reacondicionamiento, y greedy ancestral.
- Las predicciones de letras desde cero siguen las estadísticas unigram analíticas con una variación total media de 0,0374, lo que demuestra que el transformer aprende la regla de Bayes a partir de ejemplos corruptos.
- No dispone de tool calling, capacidades multimodales, ni soporte para agentes.

## Casos de uso

- Enseñanza de mecanismos de difusión discreta: el modelo permite visualizar cómo funciona el enmascarado, la predicción paralela, los commits de confianza y el reacondicionamiento posterior, siendo un recurso didáctico ideal para cursos de aprendizaje profundo generativo.
- Investigación sobre estrategias de muestreo: al ser extremadamente ligero, se pueden probar variantes de samplers (ancestral, k-commits, greedy) y medir su impacto en la validez de las salidas sin necesidad de hardware costoso.
- Comparación de métricas de evaluación: sirve como banco de pruebas para definir métricas de calidad en modelos de difusión discreta, como la tasa de palabras válidas o la unicidad de las muestras.
- Estudio de la relación entre parámetros y coherencia: permite aislar el efecto del muestreador frente al de la capacidad del modelo, ya que con los mismos pesos se obtienen resultados muy dispares.
- Verificación de la generalización del entrenamiento con corrupción: el seguimiento de las estadísticas unigram ofrece un caso reproducible para estudiar cómo los transformers aprenden distribuciones condicionales a partir de datos enmascarados.
- Desarrollo de pipelines educativos de generación de texto: aunque no es útil para producción, puede integrarse en demos o notebooks que ilustren el flujo completo de entrenamiento y muestreo de un modelo de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no está diseñado para tareas generales de lenguaje. El README del autor reporta los siguientes resultados de evaluación con 256 muestras por sampler, contrastadas contra una lista de aproximadamente 16.000 palabras inglesas de cinco letras:

| Sampler | Palabras válidas en inglés | Muestras únicas |
|---|---|---|
| One-shot paralelo (las 5 letras a la vez) | 2,0% | 256/256 |
| k=2 commits por paso | 39,5% | 256/256 |
| Ancestral (commit 1, reacondicionar, repetir) | 68,4% | 254/256 |
| Greedy ancestral (sin muestreo) | 100% | 1/64 ("bales") |

Además, se reporta que las predicciones de letras desde cero siguen las estadísticas unigram con una variación total media de 0,0374.

## Requisitos de hardware

- Inferencia: el modelo tiene solo 4,75 M de parámetros, por lo que se ejecuta en CPU sin problemas; la memoria necesaria es inferior a 20 MB en precisión flotante de 32 bits.
- Entrenamiento: completado en una GPU T4 de Kaggle en ~11 minutos; cualquier GPU con al menos 8 GB de VRAM puede reproducirlo sin dificultad.
- No requiere GPU dedicada para inferencia; es viable en entornos embebidos o notebooks sin aceleración.
- Opciones de despliegue: al ser un experimento educativo, no está integrado en frameworks como vLLM, llama.cpp u Ollama. El uso previsto es mediante el script de Python del repositorio GitHub, que carga los pesos con PyTorch.
- Latencia y throughput: no se han medido formalmente, pero dado el tamaño, la generación de una muestra es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que KB-Diffusion Model B es un experimento único con un vocabulario extremadamente reducido y una tarea acotada a palabras de cinco letras. Los modelos de difusión discreta a gran escala (como LLaDA) operan en contextos de decenas de miles de tokens y no son comparables en propósito ni escala. Se podría mencionar que comparte el enfoque de entrenamiento con LLaDA, pero la comparación cuantitativa no es posible con los datos disponibles.

## Limitaciones y advertencias

- Es un experimento educativo, no un modelo de producción: su vocabulario se limita a 27 tokens y su salida a secuencias de 5 letras.
- Riesgo de sobreajuste: al entrenar sobre 8.000 palabras, el modelo puede memorizar parte del vocabulario, aunque el autor reporta cierta generalización a palabras no vistas.
- Sin soporte multilingüe: solo genera palabras inglesas.
- No dispone de capacidades de razonamiento, tool calling ni generación de texto libre.
- La licencia Apache 2.0 permite uso comercial, pero el modelo carece de utilidad práctica en entornos comerciales reales.
- Los pesos se distribuyen como state dict de PyTorch (.pt), sin cuantizaciones ni formatos optimizados para inferencia eficiente.
- No hay garantías de robustez frente a entradas adversarias ni de calidad de las muestras más allá de las métricas reportadas en el README.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PastelRuntime/KB-Diffusion-ModelB
- Repositorio del proyecto KB-Diffusion-Optimized: https://github.com/PastelRuntime/KB-Diffusion-Optimized

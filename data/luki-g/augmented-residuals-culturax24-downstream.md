# Luki-G/augmented-residuals-culturax24-downstream

## Resumen

Este repositorio contiene seis checkpoints de clasificación de secuencias obtenidos por fine-tuning completo de tres variantes de un modelo de lenguaje multilingüe preentrenado sobre CulturaX-24 (40 GB de datos, tokenizador SentencePiece de 120 000 piezas). Las variantes difieren en la arquitectura de conexiones residuales: una línea base con conexiones residuales planas, una variante con conexiones residuales multi-cabezal (mHC-lite) de cuatro flujos y una variante con conexiones residuales de atención completas (Attention Residuals). El fine-tuning se realizó con ejemplos en inglés durante cinco épocas, y la evaluación es multilingüe sobre todos los idiomas de los conjuntos de prueba.

El modelo aborda el problema de evaluar el impacto de arquitecturas residuales alternativas en tareas de comprensión del lenguaje multilingüe, concretamente en inferencia en lenguaje natural (XNLI) y parafraseo (PAWS-X). Es relevante porque proporciona evidencia empírica sobre cómo mejoran las conexiones residuales aprendidas frente a las residuales estándar en un escenario downstream. Los checkpoints son específicos del proyecto y requieren el código del repositorio `multi-mhc` para cargarse, no son compatibles directamente con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con conexiones residuales alternativas: plana (plain), mHC de cuatro flujos (mhc-4stream) y Attention Residuals completa (attnres-full) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints son en precisión completa, PyTorch nativo) |
| Idiomas soportados | no disponible (el preentrenamiento es multilingüe, pero no se especifican los idiomas; la evaluación cubre todos los idiomas de XNLI y PAWS-X) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model.pt`) con `model_state_dict`, `summary` y `label_names`; no es un directorio `save_pretrained` de Transformers |

## Arquitectura y entrenamiento

La arquitectura base es un transformer preentrenado sobre CulturaX-24, un corpus multilingüe de 40 GB, con tokenizador SentencePiece de 120 000 piezas. El preentrenamiento duró 115 200 pasos. Sobre esta base se aplican tres variantes de conexiones residuales: la conexión residual clásica (plain), una variante con múltiples flujos residuales llamada mHC-lite de cuatro flujos, y una variante completa de Attention Residuals (attnres-full). Estas arquitecturas se describen en el trabajo sobre LAuReL (Learned Augmented Residual Layer), que generaliza la conexión residual canónica añadiendo componentes residuales aprendidos.

El fine-tuning se realizó sobre dos tareas de clasificación de secuencias: XNLI (inferencia en lenguaje natural) y PAWS-X (detección de parafraseo). El entrenamiento usó únicamente ejemplos en inglés, con un tamaño de lote efectivo de 32, tasa de aprendizaje de 2e-5 y semilla 42, durante cinco épocas. La evaluación se hizo de forma multilingüe sobre todos los idiomas de los conjuntos de prueba. Los checkpoints incluyen el estado del modelo completo (backbone más cabecera de clasificación) y metadatos de entrenamiento en `summary.json` que permiten distinguir estos resultados de sondas lineales.

## Capacidades

- Clasificación de secuencias multilingüe: inferencia en lenguaje natural (XNLI) y detección de parafraseo (PAWS-X).
- Evaluación multilingüe sobre todos los idiomas de los conjuntos de prueba, aunque el fine-tuning se realizó solo con datos en inglés.
- Soporte para dos tareas de clasificación de texto con etiquetas discretas.
- Capacidad de comparar arquitecturas residuales alternativas en un mismo backbone preentrenado.
- No se documentan capacidades de generación, tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en arquitecturas de atención: el modelo permite estudiar cómo las conexiones residuales aprendidas (mHC y Attention Residuals) afectan al rendimiento en tareas de clasificación multilingüe, sirviendo como referencia para trabajos académicos.
- Evaluación de generalización multilingüe: al fine-tunear solo en inglés y evaluar en múltiples idiomas, se puede analizar la transferencia cross-lingüística de distintas arquitecturas residuales.
- Comparación de variantes de residual connections: los seis checkpoints (tres arquitecturas × dos tareas) facilitan una comparación controlada del impacto de cada diseño residual.
- Desarrollo de modelos de clasificación de texto multilingües: aunque los pesos son específicos del proyecto, la metodología y los resultados pueden guiar la elección de arquitectura para sistemas de clasificación de producción.
- Reproducción de experimentos: los metadatos completos en `summary.json` permiten reproducir los entrenamientos y verificar los resultados publicados.
- Análisis de robustez en tareas de parafraseo e inferencia: los resultados en PAWS-X y XNLI ofrecen datos sobre la sensibilidad de cada arquitectura a la complejidad sintáctica y semántica.

## Benchmarks y rendimiento

Según la model card, las precisiones (en porcentaje) son las siguientes:

| Arquitectura | XNLI English val | XNLI test macro | PAWS-X English val | PAWS-X test macro |
|---|---:|---:|---:|---:|
| plain | 79,40 | 63,22 | 90,20 | 74,84 |
| mhc-4stream | 79,40 | 63,80 | 91,40 | 74,78 |
| attnres-full | 79,04 | 65,10 | 91,40 | 76,34 |

La métrica "test macro" es la media no ponderada sobre todos los idiomas de cada conjunto de prueba. No se proporcionan comparaciones con otros modelos externos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 4,3 GB, lo que sugiere que cada checkpoint ocupa aproximadamente 700 MB (seis checkpoints), aunque el tamaño exacto por archivo no se especifica.
- Se requiere una GPU con al menos 8 GB de VRAM para cargar un checkpoint en precisión completa (FP32) para inferencia, asumiendo un modelo de tamaño similar a un transformer de 100-200 millones de parámetros (estimación basada en el tamaño de archivo, no confirmada).
- No se dispone de información sobre latencia, throughput ni recomendaciones específicas de GPU.
- El despliegue requiere el código del repositorio `multi-mhc` (https://github.com/LukaszGraff/multi-mhc); no es compatible con vLLM, llama.cpp, Ollama ni TGI sin adaptación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los checkpoints son específicos de un experimento de investigación y no se han comparado con otros modelos de clasificación multilingüe como XLM-R o mBERT en las fuentes disponibles.

## Limitaciones y advertencias

- Los checkpoints son específicos del proyecto y no son directamente cargables con la librería Transformers; se requiere el código del repositorio `multi-mhc` y el tokenizador SentencePiece distribuido con el preentrenamiento de CulturaX-24.
- El fine-tuning se realizó solo con datos en inglés; el rendimiento en otros idiomas puede ser inferior, como reflejan las métricas macro (p. ej., XNLI test macro de 63-65 % frente al valor en inglés de ~79 %).
- No se documentan sesgos específicos, pero al entrenar solo con inglés para las tareas downstream, es probable que existan sesgos lingüísticos y culturales hacia el inglés.
- Riesgo de alucinación no aplica directamente, ya que es un modelo de clasificación y no genera texto libre.
- La licencia MIT permite uso comercial, pero la dependencia del código propietario del repositorio `multi-mhc` puede limitar su integración en entornos de producción estándar.
- No se especifica la longitud de contexto ni el número de parámetros, lo que dificulta estimar requisitos de memoria y rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luki-G/augmented-residuals-culturax24-downstream
- Repositorio del código `multi-mhc`: https://github.com/LukaszGraff/multi-mhc
- Artículo sobre LAuReL (Learned Augmented Residual Layer): https://arxiv.org/abs/2411.07501
- Versión HTML del artículo LAuReL: https://arxiv.org/html/2411.07501v3
- Entrada en ACM (Proceedings of ICML 42): https://dl.acm.org/doi/10.5555/3780338.3782099

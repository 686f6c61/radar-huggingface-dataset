# KaiwenDu/robust-overfitting-checkpoints

## Resumen

Este repositorio contiene un conjunto de checkpoints de entrenamiento del modelo PreActResNet-18 sobre el dataset CIFAR-10, generados por Kaiwen Du para investigar el fenómeno de *robust overfitting* en entrenamiento adversarial. El trabajo replica el método de Rice et al. (2020) con ataques PGD-10 en espacio de píxeles y lo extiende con una variante que aplica una máscara DCT de baja frecuencia (frecuencia de corte k=8) sobre las perturbaciones, ejecutada con cinco semillas distintas. Cada ejecución consta de 200 épocas y se guardan 40 checkpoints (uno cada 5 épocas), lo que permite reconstruir la evolución de la precisión limpia y la robustez frente a ataques a lo largo del entrenamiento.

La relevancia de este modelo radica en que proporciona material empírico reproducible para estudiar por qué la robustez adversarial empeora en las últimas fases del entrenamiento mientras la precisión limpia se mantiene o incluso mejora. Los checkpoints están pensados para investigación, reproducción de resultados y análisis de la dinámica de entrenamiento, no como un modelo listo para producción. El repositorio incluye tanto la réplica del baseline (PGD en píxeles) como las ejecuciones con perturbaciones de baja frecuencia, lo que permite comparar el efecto de la restricción frecuencial sobre el robust overfitting.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PreActResNet-18 (ResNet con activación previa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no aplica (solo pesos en punto flotante PyTorch) |
| Idiomas soportados | no aplica (clasificación de imágenes; documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pt (state dict) |

## Arquitectura y entrenamiento

El modelo es una PreActResNet-18, una variante de ResNet en la que la activación se aplica antes de la capa convolucional (pre-activation), lo que facilita el entrenamiento de redes profundas. Se entrena sobre CIFAR-10 (10 clases, 50 000 imágenes de entrenamiento) con entrenamiento adversarial: en cada paso se generan perturbaciones mediante PGD-10 (10 iteraciones de descenso de gradiente proyectado) con presupuesto L∞ epsilon = 8/255 y tamaño de paso 2/255. El entrenamiento dura 200 épocas y se guarda un checkpoint cada 5 épocas.

Se distinguen dos condiciones experimentales: la réplica del baseline de Rice et al. (2020) con perturbaciones en el espacio de píxeles, y una condición de baja frecuencia donde las perturbaciones se filtran mediante una máscara DCT (Discrete Cosine Transform) que retiene solo los coeficientes con frecuencia de corte k=8. Esta última condición se ejecuta con cinco semillas (42 a 46) para evaluar la variabilidad. La innovación técnica principal es el uso de perturbaciones restringidas al dominio de baja frecuencia, que permite estudiar si el robust overfitting depende de la naturaleza espectral de los ataques. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento supervisado estándar con pérdida de entropía cruzada sobre ejemplos adversariales.

## Capacidades

- Clasificación de imágenes CIFAR-10: asigna una de 10 etiquetas (avión, coche, pájaro, gato, ciervo, perro, rana, caballo, barco, camión) a imágenes RGB de 32×32 píxeles.
- Robustez frente a ataques adversariales PGD: los checkpoints entrenados con PGD-10 muestran cierta resistencia a ataques PGD-20 en espacio de píxeles, con una precisión robusta máxima del 45,91 % en el checkpoint de la época 105.
- Análisis del robust overfitting: al disponer de 40 checkpoints por ejecución, se puede trazar la curva de precisión limpia y robusta a lo largo del entrenamiento y observar el punto donde la robustez comienza a degradarse.
- Comparación entre dominios de perturbación: las ejecuciones con máscara DCT de baja frecuencia permiten estudiar cómo afecta la restricción espectral al comportamiento del modelo.
- Reproducibilidad: al incluir múltiples semillas y checkpoints intermedios, se facilita la verificación de resultados y el análisis estadístico.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento multimodal.

## Casos de uso

- Investigación académica sobre robustez adversarial: los checkpoints permiten reproducir el fenómeno de robust overfitting y analizar sus causas, por ejemplo comparando la evolución de la pérdida adversarial en entrenamiento y test.
- Evaluación de ataques adversariales: los checkpoints sirven como modelos víctima para probar nuevos métodos de ataque (PGD, AutoAttack, etc.) y medir su efectividad frente a modelos entrenados con PGD-10.
- Estudio del efecto de la restricción frecuencial: comparar los checkpoints de baja frecuencia DCT con los de píxeles permite determinar si las perturbaciones de baja frecuencia inducen un robust overfitting diferente, lo que puede orientar el diseño de defensas.
- Desarrollo de métodos de regularización: los checkpoints intermedios son útiles para evaluar técnicas que mitiguen el robust overfitting, como ajuste de tasa de aprendizaje, early stopping o regularización estocástica.
- Docencia en seguridad de machine learning: el repositorio proporciona un ejemplo concreto y reproducible de entrenamiento adversarial y sus limitaciones, adecuado para cursos de posgrado.
- Benchmark de métodos de entrenamiento adversarial: los resultados reportados (precisión limpia y robusta en épocas clave) sirven como referencia para comparar nuevas variantes de entrenamiento adversarial en CIFAR-10.
- Análisis de la dinámica de representaciones: los checkpoints permiten estudiar cómo cambian las características internas del modelo a lo largo del entrenamiento y su relación con la robustez final.

## Benchmarks y rendimiento

El README reporta resultados de evaluación sobre el conjunto de test completo de CIFAR-10 con ataque PGD-20 en espacio de píxeles (epsilon = 8/255, step = 2/255) para la condición baseline (réplica de Rice et al.):

| Checkpoint (réplica baseline) | Precisión limpia | Precisión robusta PGD-20 |
| --- | ---: | ---: |
| Época 105 (mejor robustez) | 81,94 % | 45,91 % |
| Época 200 (checkpoint final) | 82,22 % | 36,18 % |

La precisión robusta alcanza su máximo en la época 105 y luego desciende 9,73 puntos porcentuales hasta la época 200, mientras que la precisión limpia se mantiene prácticamente estable. No se publican resultados para las ejecuciones con máscara DCT de baja frecuencia ni para otras métricas o ataques. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la información disponible.
- El modelo PreActResNet-18 es relativamente pequeño (aproximadamente 11 millones de parámetros, aunque el número exacto no se indica en el repositorio), por lo que la inferencia es factible en GPUs de consumo como una RTX 3060 o incluso en CPU para un solo lote.
- Cada checkpoint individual ocupa unos pocos megabytes (el repositorio completo pesa 21,6 GB, pero incluye 240 checkpoints: 40 del baseline + 5×40 de las semillas de baja frecuencia).
- Para reproducir el entrenamiento completo (200 épocas con PGD-10) se recomienda una GPU con al menos 8 GB de VRAM, aunque no se indica explícitamente.
- El despliegue se realiza mediante PyTorch estándar: cargar el state dict con `torch.load` y la definición de arquitectura del repositorio GitHub adjunto. No se mencionan formatos como ONNX, vLLM o llama.cpp.
- La latencia de inferencia no está documentada; para un modelo de este tamaño se espera un throughput alto (del orden de miles de imágenes por segundo en una GPU moderna), pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas en la información proporcionada. El propio repositorio es una réplica del trabajo de Rice et al. (2020) sobre robust overfitting, y los resultados reportados (81,94 % de precisión limpia y 45,91 % de robustez PGD-20 en la época óptima) son coherentes con los valores típicos de entrenamiento adversarial PGD-10 en CIFAR-10, pero no se ofrecen tablas comparativas con otros modelos como TRADES, MART o AWP. Por tanto, la comparativa con alternativas similares no está disponible en esta documentación.

## Limitaciones y advertencias

- La robustez se mide únicamente frente a ataques PGD-20 en espacio de píxeles (y en la condición de baja frecuencia, frente a PGD-20 con máscara DCT). No se evalúa contra otros ataques como AutoAttack, CW o ataques de transferencia, por lo que los valores de robustez no deben interpretarse como una garantía general de seguridad.
- El modelo no pretende alcanzar el estado del arte en robustez; es un estudio empírico del robust overfitting, y los checkpoints finales pueden tener una robustez significativamente menor que la del mejor checkpoint (36,18 % frente a 45,91 % en el baseline).
- El repositorio está orientado a investigación y reproducción; no se proporciona un pipeline de inferencia listo para producción ni soporte para otros frameworks.
- El tamaño del repositorio (21,6 GB) puede dificultar la descarga completa; se recomienda descargar solo los checkpoints necesarios mediante `hf_hub_download`.
- No se documentan sesgos específicos del modelo, pero al entrenarse solo en CIFAR-10 su aplicabilidad a otros dominios es nula.
- La licencia MIT cubre el código y los checkpoints, pero CIFAR-10 tiene sus propios términos de uso que deben respetarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KaiwenDu/robust-overfitting-checkpoints
- Repositorio GitHub (código y definición de arquitectura): https://github.com/ItsKaiwenDu/Robust-Overfitting
- Artículo original de Rice et al. (2020) sobre robust overfitting: https://proceedings.mlr.press/v119/rice20a.html (referencia citada en el README)

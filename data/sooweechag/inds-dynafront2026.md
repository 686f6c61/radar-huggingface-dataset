# Sooweechag/INDS-DynaFront2026

## Resumen

INDS-DynaFront2026 es un conjunto de checkpoints preentrenados en PyTorch asociados al artículo "Certifiable Contraction Dynamics: Lyapunov-Stable Neural ODEs with Wasserstein Sensitivity Bounds", presentado en el workshop DynaFront de NeurIPS 2026. El autor es Sooweechag (repositorio de código vinculado a chatchai-khuntichot) y el modelo aborda el problema de construir Neural ODEs con garantías formales de estabilidad, algo poco habitual en modelos de series temporales puramente empíricos.

A diferencia de un LLM, este artefacto no es un modelo de lenguaje: es un sistema de dinámica continua orientado a modelar series temporales y sistemas dinámicos con propiedades de contracción certificables mediante funciones de Lyapunov y cotas de sensibilidad en la métrica de Wasserstein. El repositorio incluye tres checkpoints: una base entrenada (semilla 42, con hiperparámetros α = 0.5 y β = 100.0), una variante afinada con métrica anisotrópica de Cholesky aprendida (P = L Lᵀ) y un baseline Neural ODE convencional para comparación de trayectorias.

La relevancia actual reside en la combinación de estabilidad certificable con cotas de sensibilidad distribucional, un enfoque que apunta a aplicaciones donde la robustez frente a perturbaciones de entrada es crítica. El tamaño del repositorio es de 0.0 GB y no se han publicado métricas de descargas ni likes, lo que sugiere un artefacto de investigación recién publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Neural ODE con dinámica de contracción Lyapunov-estable (variante con métrica de Cholesky aprendida) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; opera sobre trayectorias temporales) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoints (.pt) |

## Arquitectura y entrenamiento

La arquitectura se basa en Neural ODEs, esto es, sistemas dinámicos definidos por una EDO parametrizada por una red neuronal, donde el estado se integra numéricamente a lo largo del tiempo. La innovación central del trabajo es imponer contracción certificable mediante una función de Lyapunov, garantizando que las trayectorias converjan y que perturbaciones en la condición inicial no amplifiquen. La variante `INDS_learnedP_final.pt` introduce una métrica anisotrópica aprendida P = L Lᵀ (factorización de Cholesky), lo que permite adaptar la geometría de contracción a los datos en lugar de usar una métrica euclidiana fija.

El checkpoint base se entrena con semilla 42 y coeficientes α = 0.5 y β = 100.0, presumiblemente ponderando términos de la pérdida (ajuste de trayectoria y regularización de estabilidad). Se incluye además un baseline Neural ODE (`NODE_best_weights.pt`) para comparar trayectorias. No se dispone de información sobre volumen de datos de entrenamiento, composición del dataset ni uso de RLHF/DPO (no aplicable en este contexto). El trabajo incorpora cotas de sensibilidad en la métrica de Wasserstein, una aportación técnica orientada a cuantificar la robustez distribucional del modelo.

## Capacidades

- Modelado de series temporales y sistemas dinámicos mediante integración de EDOs neuronales.
- Garantías formales de estabilidad (contracción) verificables vía funciones de Lyapunov.
- Cotas de sensibilidad en Wasserstein frente a perturbaciones de entrada o condición inicial.
- Métrica anisotrópica aprendida (Cholesky) para adaptar la geometría de contracción.
- Baseline Neural ODE incluido para comparación de trayectorias.
- No soporta tool calling, agentes, visión, audio ni generación de texto: no es un modelo lingüístico.

## Casos de uso

- Predicción de series temporales físicas o industriais: el modelo puede integrar dinámicas continuas y ofrecer garantías de que perturbaciones en el estado inicial no divergen, útil en sensores y telemetría.
- Modelado de sistemas de control: la contracción certificable permite diseñar controladores donde se garantiza convergencia a un atractor, con cotas de sensibilidad distribucional.
- Simulación de sistemas biológicos o químicos: la EDO neuronal aprende dinámicas latentes continuas, adecuada para datos muestreados irregularmente.
- Detección de anomalías en series temporales: las cotas de Wasserstein permiten cuantificar desviaciones distribucionales respecto al comportamiento nominal.
- Investigación en robustez de modelos dinámicos: el baseline Neural ODE incluido facilita estudios comparativos de estabilidad empírica frente a certificada.
- Reproducibilidad de resultados del paper: los checkpoints permiten replicar las trayectorias y comparaciones del workshop DynaFront 2026 sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (el tamaño del repositorio es de 0.0 GB y no se detalla el número de parámetros).
- GPU recomendadas: no disponible; al ser checkpoints PyTorch, cualquier GPU compatible con CUDA puede ejecutar inferencia, pero no se especifica.
- Compatibilidad con GPU consumer: probablemente sí dada la ausencia de pesos de gran tamaño en el repo, pero no confirmado.
- Opciones de despliegue: PyTorch nativo; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Estabilidad garantizada | Sensibilidad Wasserstein | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| INDS-DynaFront2026 | Neural ODE con contracción Lyapunov | Sí (certificable) | Sí | MIT | Hugging Face + GitHub |
| Neural ODE baseline (incluido) | Neural ODE estándar | No | No | MIT | Incluido en el repo |
| Neural ODE clásico (Chen et al.) | Neural ODE estándar | No | No | MIT (código original) | Público |
| Otros modelos de series temporales (LSTM/Transformer) | Redes discretas | No | No | Varía | Público |

No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni multimodal; no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- No se han publicado métricas de rendimiento, sesgos ni análisis de robustez empírica más allá de las garantías teóricas.
- El tamaño del repositorio (0.0 GB) y la ausencia de documentación sobre parámetros impiden estimar requisitos de cómputo con precisión.
- La licencia MIT permite uso comercial, pero conviene verificar la atribución del paper y del código en GitHub.
- Al ser un artefacto de investigación de un workshop, la madurez para producción es limitada; no hay garantías de mantenimiento ni soporte.
- Las garantías de estabilidad dependen de las hipóteses teóricas del paper (cotas de Lipschitz, integrador numérico); en la práctica, la discretización puede degradar las garantías.

## Enlaces

- Hugging Face: https://huggingface.co/Sooweechag/INDS-DynaFront2026
- GitHub (código y benchmarks): https://github.com/chatchai-khuntichot/INDS-DynaFront2026
- Workshop DynaFront @ NeurIPS 2026: no disponible enlace directo en la información proporcionada.

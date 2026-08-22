# msudipto/VQC-ZTI_Framework

## Resumen

VQC-ZTI (Variational Quantum Control for Zero Trust Protection of the Tactile Internet) es un modelo híbrido cuántico-clásico diseñado para la detección de anomalías en tráfico de red cifrado, orientado a arquitecturas de confianza cero (zero-trust) en servicios del Tactile Internet. El modelo combina un clasificador cuántico variacional (VQC) con una red neuronal clásica, procesando telemetría de flujos cifrados para generar una puntuación de anomalía continua. Está desarrollado por Mubassir Serneabat Sudipto (Iowa State University), Shakil Ahmed (Grand Valley State University) y Ashfaq Khokhar (Kansas State University), y ha sido aceptado en IEEE GLOBECOM 2026.

La arquitectura separa la generación de evidencia fuera de la ruta crítica (off-path) de la aplicación de políticas en la ruta (on-path), evitando que la inferencia probabilística del VQC interfiera con la latencia crítica del control. El modelo utiliza 12 qubits, 2 capas variacionales con codificación de características mediante rotaciones Pauli-Y y entrelazamiento CNOT de vecino más cercano, integrado en el grafo computacional de PyTorch y PennyLane. Se evalúa sobre 4.875 registros agregados de tráfico derivados de CESNET, con pseudo-etiquetas estadísticas.

Este modelo es relevante por explorar la aplicación de computación cuántica a la seguridad de redes, un campo emergente con pocas implementaciones prácticas. Sin embargo, es un prototipo experimental con datos limitados y etiquetas no verificadas, por lo que su uso en producción requiere validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Variational Quantum Classifier (VQC) híbrido cuántico-clásico: 12 qubits, 2 capas variacionales, codificación RY, entrelazamiento CNOT, medición Pauli-Z en 2 qubits de salida, cabeza de clasificación clásica |
| Parametros totales | no disponible (el circuito cuántico tiene parámetros entrenables, pero no se especifica el número) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no procesa secuencias de texto) |
| Tipos de cuantizacion | no aplica (modelo cuántico, no utiliza cuantización clásica) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (implementación PyTorch/PennyLane, probablemente .pt, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo sigue un pipeline de seis etapas: preprocesamiento de características (12 métricas de flujo cifrado, como estadísticas de paquetes y bytes, diversidad de destino, ratios de tráfico, duración media de flujo y TTL medio), un embedding clásico entrenable que mapea el vector de características a una representación de 12 dimensiones, codificación cuántica mediante rotaciones Pauli-Y en 12 qubits, un circuito variacional con 2 capas de rotaciones entrenables y entrelazamiento CNOT de vecino más cercano, medición de valores esperados de Pauli-Z en dos qubits de salida, y una cabeza de clasificación clásica que produce dos logits y una puntuación de anomalía continua entre 0 y 1.

El entrenamiento es end-to-end a través del grafo computacional de PyTorch-PennyLane, lo que permite optimizar conjuntamente los parámetros clásicos y cuánticos. El conjunto de datos utilizado consta de 4.875 registros agregados de tráfico de CESNET, con 12 características independientes de la carga útil. Las etiquetas se generan mediante un procedimiento estadístico controlado basado en normas de características escaladas robustamente y cuantiles empíricos, separando registros normativos, sospechosos y de alta anomalía. Para la evaluación binaria, las clases sospechosa y de alta anomalía se combinan en la clase de anomalía. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; es un entrenamiento supervisado estándar.

## Capacidades

- Detección de anomalías en tráfico de red cifrado mediante clasificación binaria (normativo vs. anomalía).
- Generación de una puntuación de anomalía continua en el rango [0, 1], que representa evidencia estadística de desviación respecto al comportamiento normal.
- Integración con arquitecturas zero-trust de plano dividido: la inferencia se realiza fuera de la ruta crítica (off-path) y los resultados se cachean para la aplicación de políticas deterministas en la ruta (on-path).
- Manejo de datos tabulares con 12 características numéricas, sin dependencia de la carga útil del tráfico.
- Entrenamiento híbrido cuántico-clásico end-to-end, permitiendo la optimización conjunta de parámetros clásicos y cuánticos.
- No es un modelo generativo ni de lenguaje; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Monitoreo de seguridad en redes táctiles: el modelo puede analizar telemetría de flujos cifrados para identificar desviaciones estadísticas que indiquen posibles compromisos, sin inspeccionar el contenido del tráfico, lo que es crítico en entornos con cifrado obligatorio.
- Control de acceso adaptativo en infraestructuras críticas: la puntuación de anomalía puede alimentar políticas de zero-trust que otorguen, restrinjan, escalen o denieguen el acceso según el nivel de riesgo, con decisiones deterministas en la ruta de control.
- Detección de tráfico anómalo en entornos cifrados: al ser independiente de la carga útil, el modelo es adecuado para redes donde el cifrado impide la inspección profunda de paquetes, como en VPNs o TLS.
- Evaluación de riesgo en tiempo real (off-path): la arquitectura de plano dividido permite calcular puntuaciones de riesgo sin añadir latencia al plano de control, lo que es esencial para aplicaciones de Tactile Internet con requisitos de latencia de milisegundos.
- Investigación en seguridad cuántica: sirve como banco de pruebas para evaluar la viabilidad de clasificadores cuánticos variacionales en problemas de ciberseguridad, comparando su rendimiento con métodos clásicos.
- Prototipos de políticas zero-trust: el framework puede integrarse en simuladores o entornos de laboratorio para diseñar y validar políticas de acceso adaptativas basadas en evidencia cuántica, antes de un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como precisión, recall, F1, AUC, ni comparaciones con otros modelos. El único dato experimental es el número de registros (4.875) y el procedimiento de etiquetado estadístico, pero no se reportan valores de rendimiento.

## Requisitos de hardware

No se especifican requisitos de hardware en la información disponible. Al ser un modelo híbrido cuántico-clásico, la inferencia puede ejecutarse en simuladores cuánticos (por ejemplo, PennyLane con backend de CPU o GPU) o en hardware cuántico real, pero no se detallan recursos mínimos, VRAM, GPUs recomendadas, latencia o throughput. Dado el pequeño tamaño del circuito (12 qubits, 2 capas), es probable que pueda ejecutarse en hardware de consumo, pero esto es una suposición no confirmada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores cuánticos variacionales para detección de anomalías en red). No se mencionan alternativas como QSVM, QNN u otros enfoques híbridos en la documentación proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Las etiquetas del conjunto de datos son pseudo-etiquetas estadísticas generadas mediante un procedimiento controlado, no anotaciones verificadas de ataques reales. El rendimiento reportado mide la concordancia con este benchmark estadístico, no la capacidad real de detectar intrusiones.
- La puntuación de anomalía no debe interpretarse como una probabilidad calibrada de que un flujo sea malicioso; es una medida de desviación estadística.
- El modelo se evalúa sobre un conjunto de datos limitado (4.875 registros) y no se ha validado en entornos de producción ni con tráfico real diverso.
- No se proporcionan detalles sobre el número de parámetros entrenables, la función de pérdida, el optimizador, la tasa de aprendizaje ni el número de épocas, lo que dificulta la reproducibilidad completa.
- La licencia MIT permite uso comercial, pero el modelo es experimental y no debe desplegarse en sistemas críticos sin una validación exhaustiva.
- No se especifican sesgos conocidos, pero al depender de características estadísticas del tráfico, podría verse afectado por cambios en la distribución de red o por técnicas de evasión que alteren las métricas utilizadas.
- El modelo no soporta otros tipos de datos (imágenes, texto, audio) y está limitado a la clasificación tabular binaria.

## Enlaces

- HuggingFace: https://huggingface.co/msudipto/VQC-ZTI_Framework
- Paper (arXiv): https://arxiv.org/abs/2608.18572
- PDF del paper: https://arxiv.org/pdf/2608.18572
- Código fuente: https://github.com/msudipto/VQC-ZTI_Framework
- DOI: https://doi.org/10.48550/arXiv.2608.18572
- Página de paper en HuggingFace: https://huggingface.co/papers/2608.18572

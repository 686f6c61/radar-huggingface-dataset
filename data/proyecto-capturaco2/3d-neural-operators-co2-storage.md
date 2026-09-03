# proyecto-capturaCO2/3D-Neural-Operators-CO2-Storage

## Resumen

El repositorio `proyecto-capturaCO2/3D-Neural-Operators-CO2-Storage` contiene un conjunto de checkpoints de operadores neuronales 3D y modelos informados por la física (PINN) diseñados para predecir el flujo multifásico acoplado (presión y saturación de CO₂) en acuíferos salinos profundos heterogéneos. El caso de estudio es el benchmark de reservorio Cirrus, con una malla de 16×16×28 celdas que representa un dominio de 10 km × 10 km × 200 m, simulando 15 años de inyección continua de CO₂.

El proyecto, desarrollado por la organización Proyecto Captura CO2, aborda un problema crítico en la captura y almacenamiento de carbono (CCS): la necesidad de predecir con precisión y rapidez la evolución del penacho de CO₂ y la presión en el subsuelo, sin depender de simuladores numéricos tradicionales (como ECLIPSE) que son computacionalmente costosos. La propuesta combina arquitecturas espectrales (Fourier Neural Operator, FNO) con operadores multi-grid basados en grafos (Multipole Graph Neural Operator, MGKN), e integra términos físicos como la velocidad de Darcy y pérdidas basadas en Dice volumétrico.

El checkpoint principal es un ensemble maestro que fusiona tres modelos ortogonales y alcanza un coeficiente de determinación R² de 73,26 % para la saturación de gas y 92,42 % para la presión en 10 realizaciones de test no vistas. El modelo se distribuye bajo licencia MIT con pesos en formato PyTorch (safetensors no confirmado), y su tamaño de repositorio es de 0,7 GB. Está orientado a tareas de series temporales (forecasting de campos 3D) y puede ser relevante para investigadores y desarrolladores que trabajan en simulación de reservorios, almacenamiento geológico de CO₂ y operadores neuronales aplicados a PDEs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de operadores neuronales: FNO-3D (Fourier Neural Operator), MGKN (Multipole Graph Neural Operator), U-FNO 3D, PINO (Physics-Informed Neural Operator) con variantes (Darcy velocity, Soft-Dice loss, autoregressive) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos operan sobre grillas 3D de 16×16×28 celdas, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (repositorio contiene checkpoints .pt de PyTorch, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

El repositorio incluye múltiples arquitecturas de operadores neuronales, todas diseñadas para mapear condiciones iniciales y de contorno a campos de presión y saturación en 3D. La arquitectura principal es el FNO (Fourier Neural Operator), que aprende en el dominio espectral mediante transformadas rápidas de Fourier. Se combina con el MGKN (Multipole Graph Neural Operator), que utiliza kernels multi-grid para capturar interacciones de largo alcance en dominios irregulares. También se incluyen variantes como U-FNO (una versión multiescala que combina FNO con U-Net) y PINO (Physics-Informed Neural Operator) que incorpora residuos de la ecuación de Darcy en la función de pérdida.

El entrenamiento se realizó sobre el benchmark Cirrus, un acuífero salino sintético con 16×16×28 celdas (625 m × 625 m × 7,14 m por celda). Se simularon 15 años de inyección continua de CO₂ usando el simulador ECLIPSE como generador de datos de verdad terreno. El dataset contiene múltiples realizaciones geológicas heterogéneas, de las cuales 10 se reservaron como test ciego (160 estados 3D). Se observa una inflación extrema de ceros en la saturación (73 % de las celdas tienen saturación nula), lo que motivó la introducción de una pérdida Soft-Dice volumétrica para mejorar la definición del penacho.

Entre las innovaciones técnicas destacan: la inyección explícita del campo de velocidad de Darcy (calculado por diferencias finitas a partir de la presión predicha) en la red de saturación, el uso de pérdidas Soft-Dice 3D para mitigar el desbalance de clases, y un rollout autoregresivo libre que predice los 15 años sin acceso a verdad terreno, solo realimentando sus propias predicciones. El ensemble maestro combina tres modelos (FNO espectral, MGKN con Darcy y MGKN con Soft-Dice) mediante una media ponderada con coeficientes 0,333/0,444/0,223 para saturación y 0,300/0,500/0,200 para presión.

## Capacidades

- Predicción de campos 3D de presión (P) y saturación de CO₂ (Sg) en acuíferos salinos heterogéneos durante 15 años de inyección.
- Modelado de flujo multifásico acoplado mediante operadores neuronales entrenados con datos de simuladores numéricos (ECLIPSE).
- Soporte de múltiples arquitecturas: FNO-3D, MGKN, U-FNO, PINO, y ensembles híbridos.
- Capacidad de predicción autoregresiva: el modelo puede generar secuencias completas de 15 años sin retroalimentación de verdad terreno (rollout libre), con un MAE de 5,55 % en saturación.
- Integración de física: inyección de velocidad de Darcy calculada analíticamente a partir de la presión predicha, lo que mejora la consistencia física de las predicciones.
- Manejo de datos extremadamente desbalanceados mediante pérdida Soft-Dice volumétrica (73 % de celdas con saturación cero).
- Escalado a dominios 3D de tamaño moderado (16×16×28 celdas) con capacidad de generalizar a realizaciones geológicas no vistas.
- Funciona como pipeline de time-series forecasting para campos espacio-temporales.

## Casos de uso

- Simulación rápida de almacenamiento geológico de CO₂: el modelo puede sustituir a simuladores numéricos tradicionales (ECLIPSE) en estudios preliminares de viabilidad, reduciendo el tiempo de cómputo de horas o días a segundos. Es adecuado porque los operadores neuronales aprenden directamente el mapeo entrada-salida y pueden evaluar nuevas realizaciones geológicas sin re-simular.
- Optimización de estrategias de inyección: al predecir la evolución de presión y saturación bajo distintos escenarios, el modelo permite explorar rápidamente diferentes caudales de inyección, posiciones de pozos o duraciones del proyecto, facilitando la selección de parámetros operativos óptimos.
- Análisis de riesgo y certificación de almacenamiento: la capacidad de predecir la extensión del penacho de CO₂ y el aumento de presión en el acuífero es clave para evaluar la integridad del sello y el riesgo de fugas. El ensemble maestro alcanza R² ≥ 60 % en todas las realizaciones ciegas, lo que proporciona una base cuantitativa para análisis de incertidumbre.
- Monitorización y control en tiempo real: el modelo puede integrarse en sistemas de control de operaciones de inyección para predecir la respuesta del reservorio en tiempo real, permitiendo ajustes dinámicos del caudal si la presión se acerca a límites de seguridad.
- Generación de datos sintéticos para entrenamiento de otros modelos: los checkpoints pueden utilizarse para generar grandes volúmenes de campos de presión y saturación sintéticos, útiles para entrenar modelos de aprendizaje automático auxiliares (p. ej., redes de segmentación del penacho o clasificadores de riesgo).
- Investigación académica en operadores neuronales: el repositorio ofrece una comparativa exhaustiva de 13 arquitecturas (FNO, MGKN, U-FNO, PINO, ensembles) sobre un benchmark estandarizado de CCS, lo que lo convierte en un recurso valioso para estudiar el rendimiento relativo de distintas familias de operadores neuronales en problemas de flujo multifásico 3D.
- Integración en flujos de trabajo de gemelos digitales: el modelo puede acoplarse a plataformas de simulación de yacimientos (como GEOS o MRST, mencionados en los tags) para proporcionar predicciones rápidas que alimenten modelos de decisión o visualizaciones interactivas.

## Benchmarks y rendimiento

La model card proporciona una tabla comparativa de 13 modelos sobre 10 realizaciones de test no vistas (160 estados 3D). Los resultados se presentan en términos de R² y MAE para saturación de gas (Sg) y presión (P). Se incluyen todos los modelos listados en el README, con el ensemble maestro como mejor resultado.

| Modelo | Arquitectura | R²(Sg) | MAE(Sg) | R²(P) | MAE(P) |
|---|---|---|---|---|---|
| Master Hybrid Ensemble | Spectral FNO + Darcy MGKN + Soft-Dice MGKN | 73,26 % | 4,60 % | 92,42 % | 5,24 bar |
| Hybrid Ensemble (2-Way) | Dual-Head FNO + Baseline MGKN | 70,73 % | 4,82 % | 92,28 % | 5,31 bar |
| FNO-MGKN Darcy Velocity | 3D Darcy Velocity + Multi-Grid Kernel | 66,31 % | 4,81 % | 91,99 % | 5,40 bar |
| FNO-MGKN Soft-Dice 3D | Volumetric 3D Soft-Dice Loss + MGKN | 64,28 % | 5,10 % | 91,64 % | 5,58 bar |
| FNO-MGKN High Capacity | Width=48 + Deep Continuous ResNet Blocks | 63,08 % | 4,94 % | 91,62 % | 5,57 bar |
| Dual-Branch FNO-MGKN (Base) | Decoupled FNO (P) + MGKN (Sg) | 60,27 % | 5,40 % | 91,76 % | 5,52 bar |
| Dual-Head FNO-3D | Shared Trunk FNO + Decoupled MLPs | 52,24 % | 5,88 % | 91,05 % | 5,96 bar |
| Dual-Branch FNO-3D | 2 Independent FNO-3D Networks | 46,37 % | 7,79 % | 89,29 % | 6,43 bar |
| PINO Paper Formulation | FNO-3D + Viscous Darcy Residual | 45,47 % | 10,60 % | 92,39 % | 5,28 bar |
| Autoregressive FNO-MGKN | Free Multi-Step Rollout (15 years) | 45,06 % | 5,55 % | 91,30 % | 5,72 bar |
| FNO-3D Base (Pure Data) | Standard 3D Fourier Neural Operator | 43,04 % | 5,92 % | 89,15 % | 6,30 bar |
| U-FNO 3D (U-NO) | Multiscale Fourier U-Net | 42,37 % | 9,06 % | 76,55 % | 10,17 bar |
| Dual-Branch FC-PINO | Continuation FCLegendre + FourierDiff + ReLoBraLo | 39,78 % | 7,82 % | 92,15 % | 5,34 bar |

Además, el ensemble maestro muestra un desglose por realización: R²(Sg) de 80,44 % en R_096, 79,99 % en R_094, 79,75 % en R_092, 77,14 % en R_091, 77,02 % en R_090, y el caso más difícil (R_097) con 61,86 %, lo que confirma que todas las realizaciones ciegas superan el 60 % de R².

## Requisitos de hardware

- Tamaño del repositorio: 0,7 GB, lo que sugiere que los checkpoints individuales son de tamaño moderado (decenas a cientos de MB).
- VRAM estimada para inferencia: no disponible de forma explícita, pero dado el dominio de 16×16×28 celdas y arquitecturas FNO/MGKN, es plausible que la inferencia en CPU o GPU de gama media (8-16 GB VRAM) sea viable. No se proporcionan cifras concretas.
- GPU recomendadas: no se indica. Para entrenamiento, una GPU con al menos 16 GB de VRAM (p. ej., RTX 4080, A100) sería razonable, aunque no está confirmado.
- Compatibilidad con GPU de consumo: probablemente sí para inferencia, dado el pequeño tamaño del dominio; el entrenamiento de los modelos más grandes (ensemble, high capacity) podría requerir más recursos.
- Opciones de despliegue: los checkpoints están en formato PyTorch, por lo que pueden cargarse con `torch.load` y ejecutarse en cualquier entorno con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplicable al ser un modelo de campos numéricos, no de texto).
- Latencia y throughput: no disponibles. Dado el pequeño tamaño de la malla (7168 celdas), la inferencia debería ser del orden de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (operadores neuronales 3D para almacenamiento de CO₂) dentro de la documentación proporcionada. La model card incluye comparaciones internas entre las 13 variantes del propio proyecto, que pueden servir como referencia de rendimiento relativo. No se mencionan otros repositorios o modelos externos con los que comparar. Por tanto, la comparativa externa se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el benchmark Cirrus (acuífero salino sintético con dimensiones y propiedades fijas). No se garantiza la generalización a otros reservorios con geometrías, escalas o condiciones geológicas diferentes sin reentrenamiento o fine-tuning.
- La predicción de saturación de CO₂ tiene un R² de 73,26 % en el mejor caso, lo que implica un error no despreciable (MAE 4,60 %). En aplicaciones críticas de seguridad, se recomienda validar con simuladores numéricos de referencia.
- El modelo autoregresivo (rollout libre) acumula error a lo largo de los 15 años, con un R² de 45,06 % en saturación; no es adecuado para predicciones de largo plazo sin corrección.
- La inflación de ceros en la saturación (73 % de celdas nulas) puede provocar que el modelo subestime la extensión del penacho en algunos casos, a pesar de la pérdida Soft-Dice.
- No se proporcionan datos sobre sesgos geológicos específicos, alucinaciones (no aplicable en el sentido clásico de LLM) o limitaciones de idioma, ya que es un modelo numérico.
- La licencia MIT permite uso comercial y modificación, pero no se incluyen garantías sobre la precisión en aplicaciones de producción. El usuario debe validar el modelo para su caso de uso concreto.
- No se han publicado resultados de benchmarks estandarizados externos (como MMLU, HumanEval, etc.) porque no es un modelo de lenguaje; la evaluación se limita a métricas físicas (R², MAE) sobre el benchmark Cirrus.
- Los checkpoints están en formato .pt (PyTorch), lo que requiere conocer la arquitectura exacta para cargarlos correctamente; no se incluye un script de inferencia en la documentación visible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/proyecto-capturaCO2/3D-Neural-Operators-CO2-Storage
- Organización Proyecto Captura CO2: https://huggingface.co/proyecto-capturaCO2 (inferido del autor)

No se han encontrado enlaces adicionales (papers, blogs, repositorios de código) en la búsqueda web. La model card menciona los simuladores GEOS y MRST como referencias, pero no proporciona URLs directas.

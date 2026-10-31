# BhinnekaAI/HDS

## Resumen

HDS (Homeostatic Distribution Score) es un marco experimental de detección de anomalías no supervisada desarrollado por BhinnekaAI (autor: Christopher Alberto Hamonangan). A diferencia de los grandes modelos de lenguaje habituales en este blog, HDS no es un transformer generativo, sino un algoritmo de puntuación de anomalías sobre datos tabulares que identifica muestras que se desvían de una distribución de referencia aprendida mediante análisis estructural multi-contexto.

El marco combina cinco componentes: análisis de distribución multiescala (con una aproximación híbrida euclidiana-mahalanobis), análisis de inconsistencia relacional lineal, análisis jerárquico de vecindarios mediante KD-Tree, fusión adaptativa de tokens (ponderación dependiente de la muestra de las señales estructurales) y recuperación de memoria episódica (búsqueda de muestras de referencia similares para incorporar contexto al score).

Su relevancia radica en que ofrece una alternativa a métodos clásicos como Isolation Forest, LOF, HBOS, KNN-Distance, One-Class SVM o Robust Covariance, con resultados muy competitivos en algunos dominios (fraude con tarjeta de crédito, cribado de biomarcadores) aunque claramente inferiores en otros (intrusión en red, telemetría IoT). Se publica bajo licencia MIT y se distribuye a través de HuggingFace junto con los cinco datasets de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Algoritmo no supervisado de detección de anomalías (no es una red neuronal ni un transformer); combina análisis multiescala, SVD local, KD-Tree, fusión adaptativa y memoria episódica |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no aplicable (opera sobre datos tabulares numéricos) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos neuronales; el repositorio no especifica formato de distribución del código) |

## Arquitectura y entrenamiento

HDS no se entrena en el sentido convencional: es un método no supervisado que construye una distribución de referencia a partir de los datos y puntúa muestras nuevas según su desviación de esa referencia. Su mecanismo de puntuación integra:

- **Análisis de distribución multiescala:** evalúa la dispersión de los vecindarios mediante una combinación de distancia euclidiana y distancia de Mahalanobis, capturando tanto densidad local como correlaciones entre variables.
- **Red lineal:** mide residuos de proyección global y desviaciones relacionales locales, detectando muestras que rompen relaciones lineales presentes en la referencia.
- **Red de árbol:** utiliza distancias de vecindario sobre KD-Tree para evaluar inconsistencia espacial.
- **Fusión adaptativa de tokens:** pondera las señales estructurales anteriores de forma dependiente de cada muestra, en lugar de aplicar pesos fijos.
- **Memoria episódica:** recupera muestras de referencia similares e incorpora su contexto al score final.

Existen dos variantes: **HDS-Deep**, que emplea un motor relacional local basado en SVD para capturar la estructura del vecindario, y **HDS-Fast**, que sustituye el análisis SVD por una desviación media del vecindario para reducir el coste computacional. No se ha publicado información sobre el número de tokens, composición de datasets de entrenamiento ni técnicas como RLHF o DPO (no aplicables a este tipo de algoritmo).

## Capacidades

- Detección de anomalías no supervisada en datos tabulares, sin necesidad de etiquetas.
- Generación de puntuaciones continuas de anomalía (útiles para ranking y para fijar umbrales operativos).
- Dos variantes intercambiables según el compromiso entre calidad (HDS-Deep) y coste computacional (HDS-Fast).
- Análisis multiescala que combina densidad local (euclidiana/Mahalanobis), relaciones lineales globales y locales, y estructura de vecindarios.
- Contextualización de la anomalía mediante memoria episódica (recuperación de muestras de referencia similares).
- No soporta generación de texto, código, visión, audio, tool calling ni agentes: no es un modelo de lenguaje.

## Casos de uso

- **Detección de fraude con tarjeta de crédito:** es el dominio donde HDS-Deep rinde mejor (ROC-AUC 0,885, PR-AUC 0,659), superando con holgura a Isolation Forest y LOF; adecuado como capa de scoring en pipelines antifraude sobre transacciones tabulares.
- **Cribado de biomarcadores de pacientes:** HDS-Fast alcanza ROC-AUC 0,903 y PR-AUC 0,763, superando a todos los métodos de referencia; útil para priorizar casos atípicos en datos clínicos tabulares para revisión humana.
- **Detección de anomalías en sensores IoT:** HDS-Fast obtiene ROC-AUC 0,822; aplicable a telemetría industrial, aunque en este dominio KNN-Distance (0,998) e Isolation Forest (0,946) lo superan claramente, por lo que conviene evaluarlo como complemento y no como sustituto.
- **Auditoría de inventario y logística:** en el dataset de supply chain, todos los métodos (HDS incluido) rinden cerca del azar (ROC-AUC 0,468–0,494), lo que sugiere usarlo solo como exploración adicional cuando las anomalías no siguen patrones espaciales claros.
- **Ranking de alertas en sistemas de monitorización:** al producir scores continuos en lugar de etiquetas binarias, permite ordenar alertas por gravedad y asignar umbrales según la capacidad del equipo de respuesta.
- **Investigación en detección de anomalías:** el código y los cinco datasets públicos permiten reproducir benchmarks y comparar nuevas variantes del algoritmo contra métodos clásicos de la literatura.

## Benchmarks y rendimiento

Resultados publicados por el autor en cinco dominios de detección de anomalías tabulares. Métricas: ROC-AUC y PR-AUC (valores más altos = mejor ranking).

**1. Fraude con tarjeta de crédito (TSB-Fraud-Tabular)**

| Metodo | ROC-AUC | PR-AUC |
|---|---:|---:|
| **HDS-Deep** | **0,885** | **0,659** |
| HDS-Fast | 0,856 | 0,606 |
| Isolation Forest | 0,568 | 0,125 |
| HBOS | 0,487 | 0,101 |
| KNN-Distance | 0,762 | 0,286 |
| LOF | 0,773 | 0,304 |
| One-Class SVM | 0,616 | 0,173 |
| Robust Covariance | 0,372 | 0,076 |

**2. Intrusión en red (MNT-Log-Traffic)**

| Metodo | ROC-AUC | PR-AUC |
|---|---:|---:|
| HDS-Deep | 0,660 | 0,152 |
| **HDS-Fast** | **0,666** | **0,153** |
| Isolation Forest | 0,989 | 0,835 |
| HBOS | 1,000 | 0,990 |
| KNN-Distance | 0,824 | 0,226 |
| LOF | 0,337 | 0,069 |
| One-Class SVM | 0,849 | 0,259 |
| Robust Covariance | 0,379 | 0,074 |

**3. Cribado de biomarcadores (CLB-Patient-Screening)**

| Metodo | ROC-AUC | PR-AUC |
|---|---:|---:|
| HDS-Deep | 0,902 | 0,756 |
| **HDS-Fast** | **0,903** | **0,763** |
| Isolation Forest | 0,742 | 0,312 |
| HBOS | 0,666 | 0,193 |
| KNN-Distance | 0,852 | 0,549 |
| LOF | 0,831 | 0,353 |
| One-Class SVM | 0,784 | 0,400 |
| Robust Covariance | 0,889 | 0,734 |

**4. Anomalías en sensores IoT (IMC-Sensor-Telemetry)**

| Metodo | ROC-AUC | PR-AUC |
|---|---:|---:|
| HDS-Deep | 0,805 | 0,370 |
| **HDS-Fast** | **0,822** | **0,398** |
| Isolation Forest | 0,946 | 0,736 |
| HBOS | 0,541 | 0,116 |
| KNN-Distance | 0,998 | 0,984 |
| LOF | 0,398 | 0,076 |
| One-Class SVM | 0,680 | 0,240 |
| Robust Covariance | 0,740 | 0,162 |

**5. Auditoria de cadena de suministro (ESCL-Logistics-Audit)**

| Metodo | ROC-AUC | PR-AUC |
|---|---:|---:|
| HDS-Deep | 0,468 | 0,092 |
| **HDS-Fast** | **0,494** | **0,101** |
| Isolation Forest | 0,553 | 0,126 |
| HBOS | 0,552 | 0,132 |
| KNN-Distance | 0,549 | 0,135 |
| LOF | 0,541 | 0,124 |
| One-Class SVM | 0,551 | 0,133 |
| Robust Covariance | 0,547 | 0,134 |

**Comparativa directa entre variantes**

| Dataset | ROC-AUC Deep | ROC-AUC Fast | PR-AUC Deep | PR-AUC Fast |
|---|---:|---:|---:|---:|
| Fraude con tarjeta | **0,885** | 0,856 | **0,659** | 0,606 |
| Intrusion en red | 0,660 | **0,666** | 0,152 | **0,153** |
| Biomarcadores | 0,902 | **0,903** | 0,756 | **0,763** |
| Sensores IoT | 0,805 | **0,822** | 0,370 | **0,398** |
| Cadena de suministro | 0,468 | **0,494** | 0,092 | **0,101** |
| **Media macro** | **0,744** | **0,748** | **0,406** | **0,404** |

Las diferencias agregadas entre variantes son mínimas: HDS-Fast gana ligeramente en ROC-AUC macro (0,748 frente a 0,744) y HDS-Deep en PR-AUC macro (0,406 frente a 0,404). El propio autor advierte de que se necesitan mediciones de tiempo de ejecución y memoria para confirmar si HDS-Fast ofrece una ventaja computacional real.

## Requisitos de hardware

- No se han publicado requisitos de VRAM, GPU ni mediciones de latencia o throughput: al ser un algoritmo clásico de análisis tabular (SVD, KD-Tree, distancias), no requiere GPU ni aceleradores.
- Debería ejecutarse en CPU convencional; el coste computacional dependerá del tamaño del dataset, especialmente en HDS-Deep por el análisis SVD local.
- No se han publicado cifras de tiempo de ejecución ni de consumo de memoria; el propio model card lo señala como trabajo pendiente.
- Despliegue: no disponible información sobre integraciones (vLLM, llama.cpp, Ollama, TGI no son aplicables). Al ser un framework de Python bajo licencia MIT, lo esperable es su uso como librería o script en pipelines de datos, aunque el repositorio no detalla el método de instalación.

## Comparativa con modelos similares

Comparativa con métodos clásicos evaluados en los mismos benchmarks (media macro de ROC-AUC y PR-AUC sobre los cinco datasets):

| Metodo | Tipo | ROC-AUC macro | PR-AUC macro | Licencia |
|---|---|---:|---:|---|
| HDS-Fast | Anomalia no supervisada multi-contexto | 0,748 | 0,404 | MIT |
| HDS-Deep | Anomalia no supervisada multi-contexto (SVD) | 0,744 | 0,406 | MIT |
| Isolation Forest | Aislamiento por particion aleatoria | no disponible | no disponible | BSD (scikit-learn) |
| LOF | Densidad local | no disponible | no disponible | BSD (scikit-learn) |
| One-Class SVM | Frontera one-class | no disponible | no disponible | BSD (scikit-learn) |
| HBOS | Histograma univariante | no disponible | no disponible | BSD (PyOD) |
| KNN-Distance | Distancia a k-vecinos | no disponible | no disponible | BSD (scikit-learn) |
| Robust Covariance | Covarianza minima determinante | no disponible | no disponible | BSD (scikit-learn) |

La conclusión de los benchmarks es matizada: HDS domina en fraude con tarjeta y cribado de biomarcadores, pero pierde claramente frente a HBOS, Isolation Forest y KNN-Distance en intrusión de red y telemetría IoT. No hay alternativas no supervisadas de nueva generación (por ejemplo, métodos basados en deep learning) incluidas en la evaluación publicada.

## Limitaciones y advertencias

- **Rendimiento inconsistente entre dominios:** HDS queda muy por detrás de métodos clásicos en intrusión de red (HDS-Fast 0,666 frente a HBOS 1,000) y sensores IoT (0,822 frente a KNN-Distance 0,998). No debe asumirse su superioridad general.
- **Rendimiento cercano al azar en cadena de suministro:** con ROC-AUC de 0,468–0,494, el modelo no aporta señal en ese dominio.
- **Proyecto experimental:** el propio autor lo califica de experimental y reconoce que faltan mediciones de runtime y memoria para validar la ventaja de HDS-Fast.
- **Sin validación independiente:** los benchmarks proceden exclusivamente de la model card del autor; no hay evaluación externa revisada por pares ni paper publicado (no disponible).
- **Sin datos de entrenamiento ni hiperparámetros detallados:** no se publica información sobre la configuración exacta de los componentes, lo que dificulta la reproducibilidad completa.
- **Licencia MIT:** permite uso comercial sin restricciones significativas, incluida la modificación y redistribución.
- **No es un modelo de lenguaje:** no genera texto, no soporta tool calling ni agentes, y no es comparable con LLM en tareas de NLP.
- **Métricas de ranking:** los scores son continuos para ranking; la elección de umbrales operativos y su calibración quedan a cargo del usuario.
- El repositorio registra 0 descargas y 1 like en el momento de redactar la ficha, lo que indica adopción comunitaria prácticamente nula y ausencia de soporte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BhinnekaAI/HDS
- Dataset TSB-Fraud-Tabular: https://huggingface.co/datasets/BhinnekaAI/TSB-Fraud-Tabular
- Dataset MNT-Log-Traffic: https://huggingface.co/datasets/BhinnekaAI/MNT-Log-Traffic
- Dataset CLB-Patient-Screening: https://huggingface.co/datasets/BhinnekaAI/CLB-Patient-Screening
- Dataset IMC-Sensor-Telemetry: https://huggingface.co/datasets/BhinnekaAI/IMC-Sensor-Telemetry
- Dataset ESCL-Logistics-Audit: https://huggingface.co/datasets/BhinnekaAI/ESCL-Logistics-Audit
- Paper, repositorio de código y demos: no disponibles

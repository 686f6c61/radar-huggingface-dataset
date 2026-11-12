# At1uri/wasserstein-barycenter-risk-engine

## Resumen

El "Wasserstein Barycenter & Distributionally Robust Risk Engine" es un motor de cálculo numérico publicado en Hugging Face por el usuario At1uri bajo el identificador `At1uri/wasserstein-barycenter-risk-engine`. No es un modelo de lenguaje neuronal ni un transformer: es una implementación de algoritmos de transporte óptimo (Optimal Transport, OT) empaquetada con la etiqueta de pipeline `feature-extraction` y orientada a finanzas cuantitativas y gestión de riesgos. El repositorio incluye un motor en Python (`wasserstein_engine.py`) que implementa escalado matricial de Sinkhorn-Knopp en dominio logarítmico, divergencias de Sinkhorn desesgadas, baricentros de Wasserstein por punto fijo y optimización robusta a la distribución (DRO) sobre bolas de ambigüedad de Wasserstein.

El problema que resuelve es el de comparar, interpolar y robustecer distribuciones de probabilidad empíricas (por ejemplo, densidades implícitas de opciones vía Breeden-Litzenberger, o regímenes de mercado normales frente a colas gruesas) usando distancias geométricamente significativas en el espacio de medidas de probabilidad. Frente a la divergencia KL, que puede ser asimétrica o infinita cuando los soportes no se solapan, la distancia de Wasserstein regularizada permanece finita, simétrica y suave, lo que la hace útil para transporte de distribuciones y para calcular cotas de riesgo CVaR en el peor caso.

La relevancia actual del artefacto es acotada: se trata de un paquete algorítmico de nicho, con cero descargas y cero likes en el momento de la consulta, sin pesos neuronales ni parámetros entrenados. Su interés reside en la implementación estabilizada numéricamente de técnicas de OT entrópico y DRO, no en capacidades generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Algoritmos de transporte óptimo entrópico (Sinkhorn-Knopp en dominio logarítmico, divergencia de Sinkhorn desesgada, baricentro de Wasserstein por punto fijo, DRO sobre bolas de Wasserstein) |
| Parametros totales | no disponible (no es un modelo neuronal; no tiene parámetros entrenados) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene código Python y JSON: `wasserstein_engine.py`, `sinkhorn_couplings.json`, `benchmarks.json`) |

## Arquitectura y entrenamiento

No hay entrenamiento neuronal. El artefacto es una implementación matemática del problema primal entrópico de Monge-Kantorovich con coste cuadrático \(C_{ij} = \|x_i - y_j\|_2^2\) y regularización \(\varepsilon\). La actualización de los potenciales duales de Kantorovich \((f, g)\) se realiza en dominio logarítmico mediante contracciones Log-Sum-Exp estabilizadas, lo que evita el subdesbordamiento en coma flotante cuando \(\varepsilon \to 0^+\). Sobre esa base se calcula la divergencia de Sinkhorn desesgada, que restaura la positividad estricta de la métrica (\(S_\varepsilon(\mu, \mu) = 0\)) y permite interpolación no sesgada.

El baricentro de Wasserstein se obtiene como media de Fréchet en el espacio riemanniano \(\mathcal{P}_2(\mathbb{R}^d)\) mediante iteración de punto fijo sobre \(M\) rebanadas o regímenes con pesos \(w_k\). La componente DRO implementa el teorema de Esfahani y Kuhn: el CVaR en el peor caso sobre una bola de ambigüedad \(\mathbb{B}_\delta(\hat{\mathbb{P}}_N)\) con distancia \(\mathcal{W}_1\) se expresa como \(\text{CVaR}_\alpha(\hat{\mathbb{P}}_N) + \frac{\delta}{1-\alpha}\|\mathbf{w}\|_*\). No se documentan datos de entrenamiento, RLHF ni DPO porque no aplican.

## Capacidades

- Cálculo de la distancia \(2\)-Wasserstein entrópica regularizada entre medidas empíricas discretas.
- Cálculo de la divergencia de Sinkhorn desesgada con corrección de sesgo.
- Cálculo de acoplamientos óptimos (matrices de transporte) y potenciales duales.
- Cálculo de baricentros de Wasserstein con pesos arbitrarios sobre múltiples distribuciones.
- Cotas de CVaR en el peor caso bajo bolas de ambigüedad de Wasserstein (DRO).
- Extracción de características de distribuciones para pipelines de `feature-extraction` (según la etiqueta del pipeline).
- Exploración visual de geodésicas de desplazamiento de McCann y campos de transporte 2D mediante un Space interactivo.
- No soporta tool calling, agentes, razonamiento multi-paso generativo, visión, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Extracción de densidades de opciones: a partir de precios de opciones se obtiene la densidad neutral al riesgo vía Breeden-Litzenberger y se compara entre vencimientos (por ejemplo, 1M frente a 6M) con \(\mathcal{W}_2\) y divergencia de Sinkhorn, tal como se documenta en los benchmarks del autor.
- Detección de cambios de régimen: medir el transporte entre la distribución de retornos en régimen normal y la de un episodio de cola gruesa (el caso "2008 fat-tail crash" reporta \(\mathcal{W}_2 = 2.0413\)) para cuantificar la magnitud del desplazamiento distribucional.
- Interpolación de escenarios: construir baricentros de Wasserstein entre varias distribuciones de mercado para generar escenarios sintéticos intermedios ponderados, útiles en pruebas de estrés.
- Gestión de riesgo robusta: calcular cotas de CVaR en el peor caso sobre una bola de ambigüedad de radio \(\delta\), siguiendo el teorema de Esfahani-Kuhn, para dimensionar capital regulatorio o límites de exposición.
- Comparación de distribuciones con soportes disjuntos: usar la divergencia de Sinkhorn en lugar de KL cuando las colas se separan, ya que la model card muestra que KL crece de forma asimétrica (2.5712 en el caso de crash) mientras \(\mathcal{W}_2\) permanece simétrica y finita.
- Ingeniería de características para modelos financieros: generar distancias y baricentros como variables de entrada en pipelines de `feature-extraction` para clasificación de regímenes o detección de anomalías distribucionales.
- Docencia e investigación en OT: usar el motor como referencia didáctica de Sinkhorn estabilizado en dominio logarítmico y de la corrección de sesgo, con el Space interactivo para visualizar geodésicas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, con \(\varepsilon = 0.05\) y tolerancia \(\le 10^{-6}\):

| Escenario financiero | \(\mathcal{W}_2\) | Divergencia de Sinkhorn \(S_\varepsilon\) | Divergencia KL | Entropía del acoplamiento \(H(P^*)\) | Iteraciones |
|---|---|---|---|---|---|
| Densidad Breeden-Litzenberger (1M → 6M) | 0.7594 | 0.7430 | 0.6089 | 3.8312 nats | 401 |
| Régimen normal → crash de colas gruesas 2008 | 2.0413 | 2.0353 | 2.5712 | 3.6652 nats | 331 |
| Salto bimodal → unimodal post-resultados | 0.9491 | 0.9362 | 2.1713 | 3.7700 nats | 391 |

No se han publicado resultados de benchmarks comparativos frente a otras implementaciones de OT (POT, GeomLoss, OTT-JAX) en la información disponible. Los datos anteriores son métricas internas del propio motor, no comparativas.

## Requisitos de hardware

- No requiere GPU: es código Python con NumPy, sin dependencias de aceleración documentadas en la model card.
- VRAM estimada: 0 GB; el coste es de memoria RAM y tiempo de CPU, proporcional a \(n \times m\) (tamaño del soporte) y al número de iteraciones.
- GPU recomendadas: no aplica; cualquier GPU sería irrelevante para el cuello de botella, que es la iteración de Sinkhorn sobre matrices de coste densas.
- Cabe en cualquier máquina con Python y NumPy; el ejemplo de la model card usa un soporte de 40 puntos en 1D.
- Opciones de despliegue: ejecución directa del módulo `wasserstein_engine.py` o integración en un servicio Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; las iteraciones reportadas (331-401) sugieren convergencia en cientos de pasos para los tamaños de soporte de los benchmarks.

## Comparativa con modelos similares

| Herramienta | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| At1uri/wasserstein-barycenter-risk-engine | Motor OT + DRO en Python | Sinkhorn log-domain, baricentros, CVaR robusto | Apache-2.0 | Hugging Face |
| POT (Python Optimal Transport) | Librería OT | Sinkhorn, baricentros, Gromov-Wasserstein | MIT | PyPI, GitHub |
| GeomLoss (Feydy et al.) | Librería OT en PyTorch | Sinkhorn con kernel, muestras y geometrías | MIT | GitHub |
| OTT-JAX (Google) | Librería OT en JAX | Sinkhorn acelerado, baja regularización | Apache-2.0 | GitHub |

No se dispone de comparativas de rendimiento entre este motor y las alternativas anteriores en la información proporcionada; la comparación se limita a tipo, enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Cero descargas y cero likes en Hugging Face: no hay evidencia de uso, validación externa ni mantenimiento por parte de terceros.
- Es un artefacto algorítmico, no un modelo de lenguaje: no genera texto ni responde a prompts; la etiqueta `feature-extraction` puede inducir a confusión en quien espere un transformer.
- Los benchmarks son internos y no comparativos; no hay validación frente a POT, GeomLoss u OTT-JAX.
- La model card está redactada en inglés y el único idioma declarado es `en`; no hay soporte multilingüe documentado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los resultados numéricos dependen críticamente de la elección de \(\varepsilon\), del soporte y de la tolerancia; no se documentan análisis de sensibilidad.
- La implementación DRO se limita a la cota de \(\mathcal{W}_1\) con norma dual \(\|\mathbf{w}\|_*\); no se documentan extensiones a \(\mathcal{W}_2\) ni a costes no cuadráticos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia del código antes de usarlo en producción financiera regulada.
- No se documentan pruebas unitarias, cobertura ni versionado del paquete; la fecha de creación y actualización (2026-11-12) son idénticas, lo que sugiere un único commit sin evolución posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/wasserstein-barycenter-risk-engine
- Perfil del autor: https://huggingface.co/At1uri
- Space interactivo (Wasserstein Optimal Transport Finance Studio): https://huggingface.co/spaces/At1uri/wasserstein-optimal-transport-finance-studio
- Referencia teórica citada (Esfahani & Kuhn, DRO sobre bolas de Wasserstein): no disponible enlace directo en la información proporcionada
- Referencia teórica citada (Sinkhorn divergences, Genevay et al.): no disponible enlace directo en la información proporcionada

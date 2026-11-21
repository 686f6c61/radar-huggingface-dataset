# At1uri/egnn-equivariant-3d-dynamics-engine

## Resumen

EGNN Equivariant 3D Dynamics Engine es un modelo de red neuronal de grafos equivariante a E(n) (EGNN, Satorras et al., ICML 2021) publicado por Ramprasad Atluri (usuario At1uri) en Hugging Face. No es un modelo de lenguaje: es un motor de inferencia geométrico que propaga mensajes sobre grafos de partículas en 3D para predecir desplazamientos y velocidades en sistemas de partículas, conformaciones moleculares y dinámicas hamiltonianas. El repositorio incluye los pesos preentrenados en formato safetensors junto con la formulación matemática del mecanismo de paso de mensajes.

El modelo resuelve el problema de la predicción de dinámicas 3D manteniendo garantías de simetría exactas bajo rotaciones, reflexiones y traslaciones del grupo O(3): las coordenadas se actualizan de forma equivariante y las características escalares permanecen invariantes. Esto lo hace adecuado para simulaciones científicas donde la consistencia geométrica es crítica, como dinámica molecular o sistemas de partículas interactuantes.

Con solo 19.140 parámetros totales (un peso de 80,6 KB), es un modelo extremadamente compacto, pensado más como referencia implementada de la arquitectura EGNN y como utilidad ligera para experimentación que como modelo de producción a gran escala. La licencia es MIT y el único idioma declarado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | E(n) Equivariant Graph Neural Network (EGNN), paso de mensajes geométrico con 4 capas equivariantes |
| Parametros totales | 19.140 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de grafos; radio de corte r_c = 2,8 Å para conectividad) |
| Tipos de cuantizacion | no disponible (pesos en float32 nativo, 80,6 KB) |
| Idiomas soportados | en (metadatos del repositorio; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) + config.json |

## Arquitectura y entrenamiento

La arquitectura sigue la formulación EGNN de Satorras et al. (ICML 2021): embeddings escalares invariantes por nodo h_i en R^16 y características de arista d_m = 32, con 4 capas de paso de mensajes continuo sobre coordenadas. Cada capa calcula un mensaje m_ij = φ_e(h_i, h_j, ||x_i − x_j||², a_ij), actualiza las coordenadas mediante una suma ponderada de diferencias relativas escalada por φ_x(m_ij) normalizada por el número de vecinos, y actualiza los embeddings escalares con φ_h. La activación es SiLU/Swish y la conectividad del grafo se define por un radio de corte de 2,8 Å.

La garantía matemática es que para cualquier transformación ortogonal R ∈ O(3) y traslación t, las coordenadas se transforman como X(RX + t) = R·X(X) + t y los embeddings escalares permanecen invariantes. El autor declara un residuo relativo de equivarianza SO(3) inferior a 10⁻⁶ % verificado empíricamente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF/DPO (conceptos no aplicables a este tipo de modelo); el dataset de referencia declarado es `At1uri/equivariant-3d-particle-benchmarks`.

## Capacidades

- Predicción de desplazamientos y velocidades de partículas en 3D a partir de características invariantes (masa, carga, tipo de átomo) y posiciones espaciales.
- Propagación de mensajes geométrica equivariante a O(3): rotaciones, reflexiones y traslaciones preservan la coherencia de las predicciones.
- Modelado de dinámicas de sistemas de partículas interactuantes con conectividad definida por radio de corte.
- Aplicable a conformaciones moleculares y dinámicas hamiltonianas según la model card.
- Interfaz de inferencia programática: `EGNN3dDynamicsEngine.predict_displacements(h, x)` devuelve coordenadas siguientes y velocidades predichas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica; el modelo no procesa lenguaje natural.

## Casos de uso

- Simulación de dinámica molecular aproximada: el modelo predice el siguiente paso de coordenadas y velocidades de un conjunto de átomos o partículas, útil como surrogado rápido en exploraciones conformacionales donde la equivarianza a rotaciones evita sesgos por orientación.
- Prototipado de arquitecturas equivariantes: con 19.140 parámetros y 80,6 KB de pesos, sirve como referencia ejecutable para validar implementaciones de EGNN en pipelines de investigación antes de escalar a modelos mayores.
- Generación de trayectorias en sistemas de partículas: integrado en un bucle de integración, `predict_displacements` puede encadenarse para producir trayectorias cortas en experimentos de dinámica de partículas.
- Docencia y reproducción de resultados: el repositorio incluye la formulación matemática completa y un studio interactivo, lo que facilita reproducir el paper de Satorras et al. en cursos de geometric deep learning.
- Validación de pipelines de datos geométricos: el benchmark `equivariant-3d-particle-benchmarks` permite comprobar que una implementación propia reproduce el residuo de equivarianza declarado.
- Preprocesado en flujos de 3D vision científica: como extractor ligero de dinámicas sobre nubes de puntos estructuradas como grafos, antes de etapas de análisis posteriores.
- Despliegue en entornos con recursos mínimos: al ocupar menos de 100 KB, puede ejecutarse en CPU sin GPU y embeberse en scripts de cálculo científico.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente, `verified: false`):

| Benchmark | Tarea | Dataset | Métrica | Valor |
|---|---|---|---|---|
| Equivariance residual | tabular-regression | At1uri/equivariant-3d-particle-benchmarks | SO(3) Relative Equivariance Residual (%) | 0,000001 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de dinámica molecular estándar (MD17, MD22, N-body) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos ocupan 80,6 KB en float32, por lo que cabe en cualquier GPU, iGPU o incluso en memoria de CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) o A100/H100 funcionan, pero el cuello de botella será el código de inferencia, no el modelo.
- Cabe en GPU consumer: sí, en todas, con margen de varios órdenes de magnitud.
- Opciones de despliegue: carga directa con `safetensors.numpy.load_file` y el motor `EGNN3dDynamicsEngine`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de grafos).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia vendrá dominada por el coste de construir el grafo de vecinos y el bucle de paso de mensajes en NumPy.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / alcance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EGNN Equivariant 3D Dynamics Engine (At1uri) | EGNN, 4 capas, d_h=16, d_m=32 | 19.140 | Grafo con radio de corte 2,8 Å | MIT | Hugging Face |
| EGNN original (Satorras et al., 2021) | EGNN de referencia | no disponible en la información | Configurable | Código de investigación | Repositorio de paper |
| SchNet / DimeNet | GNN invariantes para moléculas | no disponible en la información | Radio de corte configurable | Varía | Implementaciones públicas |
| NequIP / MACE | GNN equivariantes de alto orden | no disponible en la información | Radio de corte configurable | Varía | Implementaciones públicas |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 19.140 parámetros: capacidad expresiva muy limitada; no es adecuado como surrogado de precisión para dinámica molecular real sin validación exhaustiva.
- El benchmark de equivarianza está declarado por el autor y marcado como no verificado; no debe citarse como resultado independiente.
- No es un modelo de lenguaje: no genera texto, no responde preguntas y no soporta tool calling ni agentes.
- El único idioma declarado es inglés, aunque en la práctica el modelo no procesa lenguaje.
- Riesgo de alucinación en el sentido habitual no aplica; el riesgo equivalente es la extrapolación fuera de la distribución de entrenamiento, que no está documentada.
- No se especifican sesgos, composición del dataset de entrenamiento ni procedencia de los datos, lo que impide evaluar su robustez.
- La licencia MIT permite uso comercial, pero la atribución a Satorras et al. (ICML 2021) es necesaria al derivarse de su formulación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- La fecha de creación indicada (2026-11-21) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/egnn-equivariant-3d-dynamics-engine
- Studio interactivo: https://huggingface.co/spaces/At1uri/equivariant-graph-neural-network-studio
- Dataset de benchmarks: https://huggingface.co/datasets/At1uri/equivariant-3d-particle-benchmarks
- Research vault: https://huggingface.co/At1uri/equivariant-graph-neural-network-vault
- Paper de referencia EGNN (Satorras et al., ICML 2021): no disponible en la información proporcionada como enlace directo.

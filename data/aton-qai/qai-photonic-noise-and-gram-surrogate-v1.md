# ATON-QAI/QAI-Photonic-Noise-and-Gram-Surrogate-v1

## Resumen

QAI-Photonic-Noise-and-Gram-Surrogate-v1 es un artefacto de software publicado por la organizacion ATON-QAI en Hugging Face bajo la etiqueta `tabular-regression`. No es un modelo de lenguaje neuronal: empaqueta un conjunto de perfiles calibrados de hardware fotónico (digital twins) y un surrogate analítico que calcula matrices de Gram racionales exactas e invariantes de Bargmann para interferencia de 2 y 3 fotones en óptica lineal. El repositorio deriva de los papers 04, 05 y 08 del programa de investigación del autor.

El componente central evalúa menores principales hermitianos semidefinidos positivos de la matriz de Gram \(S_{ij} = \langle\psi_i|\psi_j\rangle\), lo que permite obtener de forma exacta la caída de coincidencias Hong–Ou–Mandel \(P_{\text{HOM}}(1,1) = \frac{1}{2}(1 - V)\) y la modulación de un tritter de 3 fotones \(P_{\text{tritter}}(1,1,1) = \frac{1}{9}(1 + 2r^3\cos\Phi)\). Adicionalmente implementa una cascada obligatoria de 4 etapas de pérdida óptica que separa pulsos emitidos, primera lente de colección, acoplamiento a fibra monomodo y rendimiento de coincidencia de \(n\) fotones, cuantificando el factor de inflación de sobreafirmación \((\eta_{\text{lens}}/\eta_{\text{SMF}})^n\).

Su relevancia es de nicho: sirve como referencia reproducible para validar afirmaciones de ventaja fotónica en computación cuántica con óptica lineal, y como librería de calibración para gemelos digitales de plataformas como ThinFilm_LiNbO3, UltraLowLoss_Si3N4, SOI_220nm y los twins de EMU (ASCELLA 6PQ y BELENOS 12PQ). No procesa texto, imágenes ni audio, y no debe confundirse con un LLM a pesar de su alojamiento en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Surrogate analítico y numérico sobre álgebra de matrices de Gram; no es una red neuronal. Incluye perfiles de gemelo digital de hardware fotónico |
| Parametros totales | no disponible (no es un modelo con pesos entrenados; el paquete contiene perfiles calibrados en JSON y código Python) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no procesa secuencias de texto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la model card no declara idiomas; la interfaz y documentación están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON de perfiles calibrados (`calibrated_profiles.json`) y módulo Python (`modeling_photonic_surrogate`) |

## Arquitectura y entrenamiento

El paquete no entrena una red neuronal. Su núcleo es un evaluador determinista de expresiones racionales complejas: dado un perfil de plataforma fotónica y parámetros de entrada (solapamiento \(r\), fase de Bargmann \(\Phi\), visibilidad \(V\)), calcula menores principales de la matriz de Gram \(S\) de dimensión \(n \times n\) y verifica su positividad semidefinida. Las fórmulas implementadas son cerradas y exactas para 2 y 3 fotones, lo que elimina la necesidad de muestreo Monte Carlo en esos regímenes.

La parte de "entrenamiento" se reduce a calibración de parámetros: los perfiles de ThinFilm_LiNbO3, UltraLowLoss_Si3N4, SOI_220nm, EMU_ASCELLA_6PQ_Twin y EMU_BELENOS_12PQ_Twin contienen eficiencias por etapa (lente, fibra monomodo, coincidencia) ajustadas a datos experimentales. La innovación metodológica destacable es la cascada de 4 etapas, que fuerza a reportar por separado las pérdidas de colección y de acoplamiento a fibra, evitando el error habitual de citar solo la eficiencia de detección. No hay información sobre volumen de datos de calibración, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Cálculo exacto de menores principales PSD de matrices de Gram complejas para 2 y 3 fotones.
- Evaluación de la caída Hong–Ou–Mandel \(P_{\text{HOM}}(1,1) = \frac{1}{2}(1 - V)\).
- Evaluación de la modulación de tritter simétrico de 3 fotones \(P_{\text{tritter}}(1,1,1) = \frac{1}{9}(1 + 2r^3\cos\Phi)\).
- Verificación de la desigualdad \(\det(S_{3\times 3}) = 1 - (r_{12}^2 + r_{23}^2 + r_{31}^2) + 2 r_{12} r_{23} r_{31} \cos\Phi \ge 0\).
- Modelado de cascada de pérdidas en 4 etapas con cuantificación del factor de inflación \((\eta_{\text{lens}}/\eta_{\text{SMF}})^n\).
- Carga de perfiles calibrados de plataformas fotónicas (LiNbO3, Si3N4, SOI, twins EMU).
- Generación de informes de evaluación por perfil (`evaluate_tritter`).
- No soporta tool calling, agentes, razonamiento multi-step genérico, visión, audio ni generación de texto.

## Casos de uso

- Validación de afirmaciones de ventaja cuántica fotónica: dado un resultado publicado de interferencia de 3 fotones, el surrogate recalcula la predicción exacta y permite contrastar si la visibilidad reportada es compatible con la matriz de Gram declarada.
- Auditoría de eficiencias en publicaciones: la cascada de 4 etapas obliga a desglosar lente y fibra monomodo, de modo que un revisor puede calcular el factor de inflación \((\eta_{\text{lens}}/\eta_{\text{SMF}})^n\) y detectar sobreafirmaciones en el rendimiento de coincidencia.
- Diseño de experimentos HOM: antes de montar un banco, se barre \(V\) y \(r\) en el surrogate para estimar el rango de visibilidad necesario y dimensionar la electrónica de coincidencias.
- Calibración de gemelos digitales de QPU fotónicas: los perfiles de EMU_ASCELLA_6PQ_Twin y EMU_BELENOS_12PQ_Twin se usan como referencia para comparar simulaciones de nubes cuánticas con el comportamiento esperado del hardware.
- Comparación entre plataformas materiales: con perfiles de LiNbO3, Si3N4 y SOI en el mismo formato, se puede evaluar qué plataforma ofrece mejor rendimiento neto de coincidencia para una \(n\) dada.
- Docencia e incorporación de nuevos investigadores: el paquete sirve como implementación de referencia de las fórmulas de Bargmann y Gram para óptica lineal, con código ejecutable y perfiles reales.
- Reproducibilidad de meta-análisis: el paper 08 se apoya en el paquete para recalcular métricas de 42 publicaciones bajo un criterio uniforme de pérdidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el cálculo es simbólico y numérico sobre matrices de \(3 \times 3\), ejecutable en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente para los cálculos del surrogate.
- Cabe en consumer GPU: sí, pero es innecesario; el cuello de botella es la carga del JSON de perfiles, no el cómputo.
- Opciones de despliegue: importación directa del módulo Python `modeling_photonic_surrogate`; no hay integración conocida con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput estimados: no disponible; por la naturaleza del cálculo (determinante de matrices \(3 \times 3\)) se espera latencia de microsegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo / herramienta | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QAI-Photonic-Noise-and-Gram-Surrogate-v1 | Surrogate analítico + perfiles de gemelo digital | no aplica | no aplica | Apache 2.0 | Hugging Face |
| Q.ANT NPU (segunda generación) | Hardware fotónico para IA generativa | no disponible | no disponible | propietaria | hardware comercial |
| Simuladores de óptica lineal cuántica (p. ej. Strawberry Fields, Perceval) | Frameworks de simulación | no aplica | no aplica | Apache 2.0 / BSD | código abierto |

La comparación con Q.ANT no es directa: Q.ANT ofrece una NPU fotónica que ejecuta modelos de difusión y RNN, mientras que este paquete es un surrogate de validación de afirmaciones, no un motor de inferencia. Frente a Strawberry Fields o Perceval, la diferencia es de alcance: este paquete no simula circuitos completos, sino que evalúa fórmulas cerradas de Gram/Bargmann y perfiles calibrados. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no procesa prompts; cualquier uso como LLM es un error de categoría.
- El alcance está limitado a 2 y 3 fotones; no se documentan extensiones a \(n\) mayores en la información disponible.
- Los perfiles calibrados son específicos de las plataformas listadas; extrapolar a otros materiales o fabricantes no está validado.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero el surrogate puede producir resultados numéricamente válidos para parámetros físicamente inconsistentes si el usuario no respeta las restricciones de PSD.
- La licencia Apache 2.0 permite uso comercial, pero la model card no especifica garantías ni soporte; el paquete se ofrece tal cual.
- No hay información sobre sesgos, idiomas ni restricciones de exportación; al ser un artefacto de investigación, la responsabilidad de validación recae en el usuario.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación independiente por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/ATON-QAI/QAI-Photonic-Noise-and-Gram-Surrogate-v1
- Organización en Hugging Face: https://huggingface.co/ATON-QAI
- Paper 04 (Gram y Bargmann): https://aton-qai.ai/research/p01-p06-exact-rational-gram-bargmann
- Paper 05 (Digital twins y pasaportes de QPU): https://aton-qai.ai/research/c14a-cloud-twins-and-qpu-passports
- Paper 08 (meta-análisis de 42 papers): https://aton-qai.ai/research/mon-42-photonics-meta-analysis
- Portal de investigación: https://aton-qai.ai/research/
- Dataset de benchmark: https://huggingface.co/datasets/ATON-QAI/QAI-Photonic-Benchmark
- Dataset de artículos y métricas: https://huggingface.co/datasets/ATON-QAI/QAI-Research-Articles-and-Metrics
- Q.ANT NPU fotónica (contexto del sector): https://www.hpcwire.com/off-the-wire/q-ant-runs-generative-ai-on-photonic-hardware/
- Cobertura de Q.ANT en The Quantum Insider: https://thequantuminsider.com/2026/06/23/q-ant-runs-generative-ai-on-photonic-hardware/

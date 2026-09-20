# PureOne/AUREOLE-R-v3

## Resumen

AUREOLE-R-v3 (Certified Innovation Rendering) es un artefacto de investigación en gráficos por computador publicado por el usuario PureOne en HuggingFace, con autoría declarada de "Artificial Hyperintelligence Eve, wife of Maciej Nowicki". No es un modelo de lenguaje ni un transformer generativo: es un marco teórico y una implementación de referencia en NumPy sobre CPU para renderizado neural con memoria de mundo persistente. Su objetivo concreto es almacenar hechos de visibilidad canónicos junto con sus dominios explícitos de validez, eliminando del residuo estocástico de renderizado aquellos hechos ya válidos y gastando consultas físicas solo en lo que sigue siendo desconocido.

El mecanismo central es una cota de covarianza: si se dispone de evidencia exacta sobre un subconjunto con masa de propuesta `a`, entonces la nueva covarianza queda acotada por `(1-a)` veces la anterior (Proposición C1), lo que implica que toda métrica de tarea cuadrática semidefinida positiva y lineal mejora bajo las hipótesis del estimador. Esa cota se acompaña de proposiciones sobre asimilación secuencial, validez geométrica, recuento de consultas en dominio finito, envolventes de salida y un contraejemplo a la dominancia universal del control aprendido.

El artefacto incluye un paper de 52 páginas, un prior de visibilidad entrenado de solo 3.217 parámetros (heredado sin cambios de la v2), 58 tests científicos, protocolos de reproducción determinista y evidencia en bruto. Es relevante como referencia reproducible en investigación de renderizado Monte Carlo, variables de control y cachés de visibilidad, no como componente listo para producción en tiempo real: el propio autor indica que la superresolución unificada, la reconstrucción de rayos, la generación de fotogramas y la integración en motores de juego siguen siendo objetivos de investigación abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es una red neuronal de gran escala: marco de renderizado neural con memoria de visibilidad persistente; implementación de referencia algorítmica en NumPy (CPU) más un prior de visibilidad aprendido |
| Parámetros totales | 3.217 (prior de visibilidad entrenado, `models/visibility_prior.npz`); el resto del sistema no tiene parámetros aprendidos |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica / no disponible (no es un modelo de lenguaje; el estado persistente es memoria de visibilidad de escena con dominios de validez) |
| Tipos de cuantización | No disponible; los pesos se distribuyen en formato NumPy `.npz` y no se documentan esquemas de cuantización |
| Idiomas soportados | en (manuscrito, documentación y model card en inglés) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy) |
| Autor declarado | PureOne (model card: "Artificial Hyperintelligence Eve, wife of Maciej Nowicki") |
| Versión científica | 3.0.0 |
| Edición de publicación | 3.0.0-hf.1 |
| Fecha declarada | 19 de septiembre de 2026 |
| Pipeline de HuggingFace | No disponible |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema no sigue la arquitectura de un transformer, un SSM ni un MoE. Se organiza en torno a tres piezas: hechos de visibilidad canónicos con dominios de validez explícitos, un prior aprendido falible y una corrección de residuo físico. La implementación ejecutable cubre iluminación directa finita con geometría opaca, reutilización espacial, movimiento conocido y apariencia cambiante. Las nuevas rutas de evaluación ejecutan 8.885.384 consultas de segmento físico en línea, y el archivo conserva también la evidencia y los fallos de las versiones v1 y v2.

El único componente entrenado es el prior de visibilidad de 3.217 parámetros, retenido sin cambios desde la v2; el registro de entrenamiento está en `results/training.json`. El resto del comportamiento procede de la formulación matemática: integración analítica de una parte de control más residuos muestreados, sustitución de valores de control por contribuciones exactas y condicionamiento del muestreo sobre el complemento. Las Proposiciones C2–C6 cubren asimilación secuencial, validez geométrica, recuento de consultas en dominio finito, envolventes de salida y un contraejemplo a la dominancia universal del control aprendido. El propio autor señala que las variables de control, las cachés de visibilidad y los certificados cinéticos tienen antecedentes establecidos, y que la novedad histórica de la síntesis queda pendiente de revisión independiente.

## Capacidades

- Renderizado de iluminación directa finita sobre geometría opaca, con reutilización espacial de visibilidad.
- Memoria de mundo persistente: retención de observaciones de escena junto con las condiciones bajo las cuales siguen siendo válidas.
- Tests de validez conservadores y eliminación secuencial del residuo estocástico de renderizado.
- Asimilación causal de nuevas observaciones, con cota de covarianza aplicable simultáneamente a métricas de tarea cuadráticas semidefinidas positivas y lineales bajo un contrato de estimador compartido.
- Soporte de movimiento conocido y de apariencia cambiante, con familias de consultas que comparten espacio, tiempo y apariencia.
- Demo de finalización finita y experimentos reproducibles de movimiento y de familias de consultas.
- Replay determinista de 298 métricas no temporales con diferencia cero, más 58 tests científicos y 15 comprobaciones de release con alcance delimitado.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas generales, visión, audio, tool calling, function calling, capacidades de agente, modo de pensamiento ni soporte multilingüe. No es un modelo de propósito general.

## Casos de uso

- Investigación en renderizado Monte Carlo: el marco permite estudiar cómo la evidencia exacta sobre un subconjunto de receptores reduce la covarianza del estimador, con la cota `(1-a)` y las proposiciones asociadas como base formal para publicaciones y réplicas.
- Auditoría y reproducción de resultados: el repositorio incluye informes JSON, CSV en bruto, un índice de evidencia y protocolos deterministas, lo que permite a un grupo independiente reejecutar los experimentos E10 y E11 y comparar métrica a métrica.
- Precomputación de visibilidad en escenas con movimiento conocido: en los experimentos E10 sobre 12 escenas con movimiento suave se registró un 98,40% menos de MSE esperado frente al reinicio de caché en cada cambio de geometría, con 1,203 consultas por receptor frente a 2,000.
- Reducción de consultas físicas en presupuestos ajustados: en E11, con 8 escenas adicionales, 5 tiempos prescritos y 3 lecturas de apariencia, se registraron 682.759 consultas frente a 2.949.120 de la línea base, un 76,85% menos incluida la inicialización.
- Docencia y formación técnica: la implementación en NumPy sobre CPU sirve como material didáctico para explicar variables de control, dominios de validez, cachés de visibilidad y cotas de error sin necesidad de GPU.
- Módulo de referencia para comparar implementaciones aceleradas: al ser una implementación CPU con replay determinista, puede usarse como oráculo numérico frente a kernels en GPU o en otros frameworks, comprobando que se mantienen las diferencias registradas (0 diferencia final en RGB lineal y 0 certificados falsos aceptados en la auditoría de referencia sobre casos float64).
- Estudio de límites negativos: los propios experimentos documentan un caso en el que el método no supera a la línea base (fase de salto grande, 0,15% más de MSE), útil para delimitar el régimen de aplicabilidad antes de invertir en una integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible, porque este artefacto no es un modelo de lenguaje. Los datos de rendimiento registrados son métricas de renderizado:

| Experimento | Resultado registrado | Alcance y limitación |
|---|---|---|
| E10: movimiento suave, 12 escenas | 98,40% menos MSE esperado; intervalo bootstrap por escena del 95%: 98,12–98,75% | Frente a reinicio de caché en cada cambio de geometría; mismo presupuesto máximo de consultas físicas; tiempo y memoria no iguales |
| E10: movimiento suave | 1,203 vs 2,000 consultas por receptor | Tres esferas opacas, 36 luces finitas; todos los cambios de geometría se proporcionan |
| E11: 8 escenas adicionales, 5 tiempos prescritos, 3 lecturas de apariencia | 76,85% menos consultas físicas, incluida la inicialización | 682.759 vs 2.949.120 consultas; la línea base ya comparte visibilidad entre las tres lecturas |
| E11: auditoría de referencia completa | 0 diferencia final en RGB lineal; 0 certificados falsos aceptados | Casos probados en float64; no se reclama un kernel de punto flotante formalmente verificado |
| E10: salto grande | 0,15% más de MSE frente al reinicio; el intervalo incluye la diferencia cero | No se establece superioridad en la fase de salto |
| E10: coste en CPU | 1,88 ms vs 1,18 ms por lote de 320 receptores | Método secuencial de certificados frente a la guarda de v2; excluye la preparación común; no se establece mejora de velocidad extremo a extremo |

Además, el conjunto de protocolos ejecuta 8.885.384 consultas de segmento físico en línea, el archivo contiene 58 tests científicos y 15 comprobaciones de release con alcance delimitado, y se registra un replay determinista de 298 métricas no temporales con diferencia cero.

## Requisitos de hardware

- No requiere GPU: la implementación de referencia es NumPy y se ejecuta en CPU.
- El único dato de coste temporal disponible es de 1,88 ms por lote de 320 receptores para el método secuencial de certificados, frente a 1,18 ms de la guarda de v2, excluyendo la preparación común. No se especifica la CPU empleada ni el consumo de memoria.
- VRAM estimada: no disponible / no aplica.
- GPU recomendadas: no disponibles; no se documenta ninguna ruta de ejecución en GPU.
- Compatibilidad con GPU de consumo: no aplica, al no haber kernel GPU publicado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni similares. El despliegue consiste en ejecutar el código NumPy del repositorio junto con `models/visibility_prior.npz`.
- Latencia y throughput extremo a extremo: no disponibles; el autor indica explícitamente que no se ha establecido una mejora de velocidad de extremo a extremo.
- Tamaño de descarga: 0,0 GB según los metadatos del repositorio.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría ni ofrece una tabla comparativa frente a alternativas. El propio manuscrito menciona antecedentes técnicos establecidos (variables de control, cachés de visibilidad, certificados cinéticos), pero no se aportan cifras de otros sistemas que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no programa, no hace tool calling ni soporta agentes. Cualquier expectativa en ese sentido es un error de categoría.
- Alcance experimental acotado: iluminación directa finita, geometría opaca, reutilización espacial, movimiento conocido y apariencia cambiante sobre escenas procedurales. No cubre iluminación global, materiales complejos ni geometría no opaca.
- La garantía de mejora de la cota solo se aplica a métricas cuadráticas semidefinidas positivas y lineales bajo las hipótesis del estimador. No es una garantía para decodificadores no lineales arbitrarios ni para predicciones aprendidas arbitrarias.
- No se establece superioridad en la fase de salto grande: 0,15% más de MSE, con intervalo que incluye la diferencia cero.
- No se establece mejora de velocidad extremo a extremo: el coste por lote es mayor que la guarda de v2 (1,88 ms frente a 1,18 ms).
- Auditoría numérica en float64: se declara explícitamente que no se reclama un kernel de punto flotante formalmente verificado.
- Novedad histórica sin validar: la revisión independiente de la síntesis está pendiente y los componentes individuales tienen antecedentes conocidos.
- Objetivos aún no cubiertos según el propio autor: superresolución unificada general, reconstrucción de rayos, generación de fotogramas e integración en juegos en tiempo real.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, con repositorio de 0,0 GB.
- Documentación únicamente en inglés.
- Fechas declaradas en 2026 (creación y actualización del repositorio el 20 de septiembre de 2026), posteriores a la fecha habitual de consulta; conviene verificar la vigencia real del artefacto antes de citarlo.
- Atribución autoral inusual ("Artificial Hyperintelligence Eve, wife of Maciej Nowicki") y publicación bajo el identificador PureOne; conviene comprobar la identidad y la trazabilidad académica antes de referenciarlo en un trabajo formal.
- Licencia MIT: permite uso comercial y modificación, pero al tratarse de material de investigación sin garantías, cualquier uso en producción requiere validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PureOne/AUREOLE-R-v3
- Paper completo (PDF de 52 páginas): `AUREOLE_R_v3.0.0_Certified_Innovation_Rendering.pdf`
- Manuscrito legible por máquina: `MANUSCRIPT.md`
- Guía de revisión experta: `EXPERT_REVIEW_GUIDE.md`
- Protocolo de reproducción: `REPRODUCIBILITY.md`
- Índice para agentes de IA: `AI_AGENT_INDEX.json`
- Registro de afirmaciones: `CLAIMS.json`
- Cita: `CITATION.cff`
- Índice de evidencia: `EVIDENCE_INDEX.json`
- Informe E10: `results_v3/innovation_report.json`
- Datos en bruto E10: `results_v3/innovation_raw.csv`
- Informe E11: `results_v3/queries_report.json`
- Datos en bruto E11: `results_v3/queries_raw.csv`
- Figura de resultados: `figures_v3/innovation_results.png`
- Teoría e innovación: `docs/INNOVATION_THEORY.md`
- Índice de teoremas: `THEOREM_INDEX.md`
- Auditoría de arte previo: `references.json`
- Contrato de API de certificados: `docs/CERTIFICATE_API.md`
- Pesos del prior de visibilidad: `models/visibility_prior.npz`
- Model card del prior: `MODEL_CARD.md`
- Registro de entrenamiento: `results/training.json`
- Validación de publicación: `results_publication/validation.json`

Las rutas relativas anteriores corresponden a archivos referenciados en la model card y deben resolverse dentro del repositorio de HuggingFace. No se han encontrado en la búsqueda web enlaces externos relevantes (papers, blogs, repos o demos) asociados a este modelo.

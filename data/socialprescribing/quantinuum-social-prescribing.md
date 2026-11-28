# socialprescribing/quantinuum-social-prescribing

## Resumen

`socialprescribing/quantinuum-social-prescribing` es un repositorio de investigación publicado en Hugging Face por Arun Nadarasa (Innovation Fellow, Mid and South Essex NHS Foundation Trust; International Social Prescribing Pharmacy Association) que agrupa cinco publicaciones compiladas en PDF, veintiún ficheros JSON de procedencia sellados con SHA-256 y los artefactos asociados a los sistemas `QSPMLM`, `QSP-WM v0.5` y `SP-SwarmWorld v0.2`. No se trata de un modelo de lenguaje neuronal al uso: la librería declarada es `numpy` y el contenido técnico gira en torno a clasificadores cuánticos variacionales, kernels cuánticos y modelos de mundo aplicados a la optimización de la derivación social (social prescribing) en el NHS británico.

El repositorio documenta experimentos ejecutados sobre emuladores en la nube de Moth Quantum y sobre el procesador trapped-ion `Helios-1E-lite` de 18 qubits en Quantinuum Nexus (Guppy 1.0 a HUGR), con presupuestos de disparos declarados (5.120 shots, 1.024 shots, 4.096 shots) y sin uso de hardware QPU físico según los recibos incluidos (`0` physical QPU hardware shots, `0.00 HQC). El modelo de mundo `QSP-WM v0.5` se presenta como una evolución de versiones anteriores (v0.1 a v0.5) orientada a la falsificación de órdenes contrafactuales en tres olas de datos NHS y a la transferencia zero-shot entre ICBs.

Su relevancia actual es doble: por un lado, expone un caso de aplicación de computación cuántica variacional a un problema de salud pública concreto (asignación equitativa Core20PLUS5 en 1.296 PCNs y 42 ICBs); por otro, sirve como ejemplo de gobernanza de IA sanitaria con trazabilidad criptográfica (sellos SHA-256, ML-DSA-65) y declaración explícita de ausencia de datos identificables de pacientes. El tamaño del repositorio es de 0,1 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como modelo neuronal; el repositorio contiene clasificadores cuánticos variacionales (VQC), kernels cuánticos, circuitos de preparación de estado (protocolo Tessa) y modelos de mundo (`QSP-WM`, `SP-SwarmWorld`) implementados sobre `numpy` y Guppy/HUGR |
| Parametros totales | No aplica; los circuitos documentados emplean 4, 12, 16 y 18 qubits según el experimento |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible; el repositorio contiene PDFs, JSON de recibos SHA-256 y artefactos de circuitos (Guppy 1.0 a HUGR) |

## Arquitectura y entrenamiento

El repositorio no describe un transformer ni una red neuronal convencional. La arquitectura subyacente es un conjunto de circuitos cuánticos variacionales y protocolos de preparación de estado ejecutados sobre emuladores y sobre hardware trapped-ion. Destaca la adaptación del protocolo bipartito **Tessa** de Daniel Bultrini (*"Tessa: Encoding Classical Data Across an Entire Quantum Processor"*, arXiv:2611.18440v1), aplicado a la codificación de las 143 consultas de medicina general de Mid & South Essex sobre un circulante de König 4-regular de 18 qubits (9D + 9A, 16 capas CX paralelas). Se documentan también constelaciones de Bloch de Fibonacci para 20 estados de rutas NHS con normalización radial, y un testigo $K_a$ de Hadamard simple.

En el plano del modelo de mundo, `QSP-WM v0.5` incorpora falsificación de órdenes contrafactuales en tres olas NHS con ANCOVA (+10,05 pp) y análisis de sensibilidad de Rosenbaum ($\Gamma^* = 2{,}6304$), imaginación tipo Dyna con regret de 0,57 pp, y comparación de `Triad-Kempe` con 64 arranques frente a QAOA de 18 qubits con ASPS. `SP-SwarmWorld v0.2` añade deconfounding $M=24$ $2\times2$ ($p = 0{,}0462$ frente a `Shock-QD` omnisciente con 0,4657) y transferencia zero-shot a 4 ICBs (115 PCNs). No se especifican volúmenes de datos de entrenamiento en tokens ni composición del dataset, ni se documenta RLHF/DPO, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Ejecución de clasificadores cuánticos variacionales y kernels cuánticos sobre emuladores (Moth Quantum `qpixl-v1`, `blur-core-v1`, `aer`) y sobre `Helios-1E-lite` de 18 qubits en Quantinuum Nexus.
- Preparación de estado cuántico de datos clásicos mediante el protocolo Tessa, con codificación de hasta 143 prácticas GP en 18 qubits.
- Modelado de mundo con imaginación Dyna y regret bajo (0,57 pp) para planificación de políticas de derivación social.
- Falsificación de órdenes contrafactuales en datos observacionales NHS con análisis de sensibilidad de Rosenbaum.
- Optimización combinatoria (MILP con HiGHS, QAOA, `Triad-Kempe`) para asignación equitativa Core20PLUS5.
- Transferencia zero-shot entre ICBs (4 ICBs, 115 PCNs) sin reentrenamiento.
- Trazabilidad criptográfica de experimentos mediante 21 ficheros JSON sellados con SHA-256 y firmas ML-DSA-65.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en el sentido de los LLM convencionales.

## Casos de uso

- Asignación equitativa de recursos sanitarios: el repositorio incluye una herramienta gratuita de asignación Core20PLUS5 para 1.296 PCNs y 42 ICBs, construida sobre el MILP HiGHS con resolución en 19,19 ms y una mejora declarada de +12,69 pp en el frente de Pareto Core20.
- Optimización de derivación social en atención primaria: `QSP-WM` permite simular contrafactuales de derivación sobre tres olas de datos NHS, con análisis de sensibilidad que cuantifica la robustez frente a confusión no observada ($\Gamma^* = 2{,}6304$).
- Investigación metodológica en computación cuántica aplicada a salud: los circuitos de 12 y 18 qubits documentados sirven como referencia reproducible para comparar emuladores (Moth Quantum) con hardware trapped-ion (Helios-1E-lite) en tareas de codificación de datos clásicos.
- Auditoría y gobernanza de IA sanitaria: los 21 recibos SHA-256 y las firmas ML-DSA-65 permiten verificar la integridad y procedencia de cada experimento, útil en comités de ética y revisiones regulatorias del NHS.
- Formación y divulgación: el portal GitHub Pages con lector de cinco artículos y grafo de conocimiento facilita la difusión de resultados de investigación cuántica aplicada entre clínicos y gestores no especialistas.
- Estudio de transferibilidad entre regiones sanitarias: la transferencia zero-shot a 4 ICBs y 115 PCNs documentada en `SP-SwarmWorld v0.2` sirve como caso de referencia para evaluar si un modelo de mundo entrenado en una región es reutilizable en otra sin reentrenamiento.
- Comparación de paradigmas de optimización: la comparación entre `Triad-Kempe` con 64 arranques y QAOA de 18 qubits con ASPS proporciona un banco de pruebas para decidir cuándo merece la pena el enfoque cuántico frente al clásico.

## Benchmarks y rendimiento

Los resultados publicados en la model card, sin verificación independiente, son los siguientes:

| Metrica | Resultado | Contexto |
|---|---|---|
| MAE DRR (mean_std) | 0,0310 ($r = 0{,}9799$) | 18q König circulante, `Helios-1E-lite`, 1.024 shots |
| MAE DRR | 0,0547 | Heavy-hex `fake_fez` 156q, Moth `qpixl-v1`, 4.096 shots |
| MAE DRR | 0,0132 | Emulador `aer` |
| MAE DRR | 0,0161 | `tessa-image-v1` de doble ángulo |
| Recuperación exacta constelaciones Fibonacci Bloch | 100,00% | +55,94 pp frente a ángulo Z lineal + DRR, 1.024 shots |
| MAE testigo $K_a$ (18q) | 0,0351 | Frente a $K_a$ clásico exacto (5,78 ms) |
| RMSE con $N=64$ | 0,0854 (0% bins indefinidos) | Frente a 0,3048 (24,5% indefinidos) |
| ANCOVA falsificación de órdenes | +10,05 pp | Tres olas NHS |
| Rosenbaum $\Gamma^*$ | 2,6304 | Análisis de sensibilidad |
| Regret Dyna | 0,57 pp | Imaginación del modelo de mundo |
| Deconfounding $M=24$ $2\times2$ | $p = 0{,}0462$ | Frente a `Shock-QD` omnisciente (0,4657) |
| Divergencia tras transiciones cross-PCN | 0,3410 | Ruptura de la Proposición 1 |
| Entrelazamiento de datos $\mathcal{N}(D:D)$ | 0,00136 (127× MI) | Tras transiciones no conmutativas |
| Reducción clásica 18q Tessa | 0,053 ms | 2,66e-15 diff de statevector, TVD MPS $\chi=2$ = 0,0000 |
| Concentración de cresta de onda (Gini) | 0,2087 a 0,6019 | Moth `blur-core-v1` (c224c902), negativo honesto |

No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; los circuitos se ejecutan en emuladores cuánticos o en QPU. El repositorio ocupa 0,1 GB en disco.
- GPU recomendadas: no especificadas. Los emuladores `aer` y `qpixl-v1` pueden ejecutarse en CPU o GPU según configuración, pero el repositorio no documenta requisitos.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: emuladores en la nube de Moth Quantum (modo `emu`), Quantinuum Nexus con `Helios-1E-lite` (18 qubits), y ejecución local de circuitos Guppy 1.0 compilados a HUGR.
- Latencia y throughput: se documentan tiempos puntuales (5,78 ms para $K_a$ clásico exacto, 19,19 ms para MILP HiGHS, 0,053 ms para reducción clásica de Tessa 18q), pero no se ofrece throughput agregado ni latencia de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Tipo | Qubits / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `quantinuum-social-prescribing` (este) | VQC + modelo de mundo + kernel cuántico | 4 a 18 qubits | No disponible | MIT | Hugging Face + GitHub + Samskrift |
| `Helios-1E-lite` (Quantinuum) | QPU trapped-ion | 18 qubits | No aplica | Propietaria | Quantinuum Nexus |
| `fake_fez` (IBM) | Emulador heavy-hex | 156 qubits | No aplica | No disponible | Moth Quantum `qpixl-v1` |
| `AlphaGenome 2 v2.0.0` | Modelo genómico | No disponible | No disponible | Research-Use-Only | Citado en la publicación 5 |

No se dispone de comparativas con modelos de lenguaje de propósito general porque este repositorio no es un LLM. Las alternativas comparables son plataformas cuánticas y emuladores, no modelos de fundación.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling ni agentes en el sentido convencional. Cualquier uso como LLM sería un error de categoría.
- Los resultados declarados no han sido verificados de forma independiente y proceden exclusivamente de la model card del autor.
- Cero disparos en QPU física según los recibos (`0` physical QPU hardware shots, `0.00 HQC): todos los resultados provienen de emuladores o de `Helios-1E-lite` en modo emulado, lo que limita la extrapolación a hardware real con ruido.
- El propio autor documenta un resultado negativo honesto (concentración de cresta de onda en `blur-core-v1`, Gini 0,2087 a 0,6019) y la ruptura de la Proposición 1 (divergencia 0,3410), lo que sugiere que el marco teórico aún no está cerrado.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero los contrafactuales del modelo de mundo pueden reflejar sesgos de los datos observacionales NHS subyacentes (ELSA W10/CPRD, 6.105 GPs ingleses bajo OGL v3.0).
- Restricciones de licencia: el repositorio es MIT, pero `AlphaGenome 2 v2.0.0` citado en la publicación 5 es Research-Use-Only, lo que puede afectar a la reproducibilidad comercial de esa parte.
- Gobernanza: aunque se declara `0` patient-identifiable records, cualquier despliegue en producción sanitaria requeriría revisión ética y regulatoria adicional del NHS.
- Idiomas soportados: no disponibles; el material está en inglés.
- Fecha de creación (2026-11-11) y referencias a arXiv con identificadores 2611.18440 y 2608.26081: verificar la vigencia y existencia de dichos preprints antes de citarlos.

## Enlaces

- Hugging Face: https://huggingface.co/socialprescribing/quantinuum-social-prescribing
- Space interactivo 4 qubits: https://huggingface.co/spaces/socialprescribing/quantinuum-social-prescribing
- Portal GitHub Pages (lector de 5 artículos + herramienta NHS PCN + grafo de conocimiento): https://arunnadarasa.github.io/quantum-social-prescribing/
- Herramienta Core20PLUS5 para PCN e ICB: https://arunnadarasa.github.io/quantum-social-prescribing/#pcn-tool
- Repositorio GitHub: https://github.com/arunnadarasa/quantum-social-prescribing
- Paper Tessa (Bultrini): https://arxiv.org/abs/2611.18440
- Paper `SP-SwarmWorld`: arXiv:2608.26081
- Vistas Samskrift de las cinco publicaciones: https://samskrift.com/view/e6628414-9373-4a34-accd-cc8b6d46e0ce/7c7a2c96-238a-4e05-9d8d-230d04da8440, https://samskrift.com/view/b2cef0ea-fbe0-4df7-8546-92b62c7498b3/6631fd61-d667-4328-a798-55b12b7a57fd, https://samskrift.com/view/828fbe1b-e53c-43ef-bbe2-81d0024deea8/e0639112-27a8-457f-9268-1cfc9e1bc14a, https://samskrift.com/view/f13f8ee0-6355-466a-9259-4de72f18f499/b1fb1545-2a95-4aaa-96d8-210726b7ff92, https://samskrift.com/view/0db305b3-9a91-4fdb-ada8-b760beda1ec5/668cdf7d-9840-478a-9101-88989e408c54

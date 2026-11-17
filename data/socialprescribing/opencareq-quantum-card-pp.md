# socialprescribing/opencareq-quantum-card-pp

## Resumen

OpenCareQ (`opencareq-quantum-card-pp`, versión `v1.0.0`) es un artefacto de tipo "quantum card" publicado por el desarrollador Arun Nadarasa (Mid and South Essex NHS Foundation Trust e ISPPA, Londres), bajo el identificador de Hugging Face `socialprescribing/opencareq-quantum-card-pp`. No se trata de un modelo de lenguaje en el sentido convencional: es una ficha técnica estructurada ("Model Card++") que documenta un compilador cuántico clínico de sala limpia ("clean-room clinical quantum compiler") orientado a enrutar rutas de atención vecinal del NHS entre sustratos clásicos exactos y cuatro backends cuánticos verificados. El artefacto sintetiza tres estándares: la Quantum Model Card de Everitt y Ji (arXiv:2412.13151), el esquema Model Card++ de NVIDIA con taxonomía CycloneDX, y el marco CSC-QT de Curistica.

El contenido técnico describe dos entidades hijas verificadas: `ENT-01`, un circuito cuántico dinámico de tipo "quantum comb" para farmacogenómica de organoides hepáticos compilado con Quantinuum Guppy 1.0 a binarios HUGR portables sobre iones atrapados (6 y 8 qubits lógicos), y `ENT-02`, un simulador serverless NVIDIA CUDA-Q 0.17.0 desplegado en Modal `eu-west` sobre 24 vCPU x86_64 que ejecuta combs de Stinespring de hasta 26 qubits y HUBOs cúbicos de hasta 75 qubits. El artefacto declara explícitamente `phi_present = False` (sin datos identificables de pacientes) y un estado operativo restringido a investigación, simulación en sombra y diseño de ensayos pre-registrados, no a dispositivo médico certificado (Non-SaMD).

Es relevante ahora porque propone un formato de documentación reproducible y auditable para software cuántico aplicado a salud, con métricas de falsación clínica (GMFE, TVD, RPN de FMEA) y recibos sellados por entidad, en un momento en que la trazabilidad regulatoria (DCB0129/DCB0160) y la verificación de resultados cuánticos frente a alternativas clásicas exactas son requisitos crecientes en el ecosistema NHS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Artefacto de documentación (quantum card) que describe: `ENT-01` circuito cuántico dinámico gate-based / quantum comb no markoviano sobre iones atrapados; `ENT-02` simulador clásico de circuitos gate-based CUDA-Q (`qpp-cpu` FP64 statevector + `cudaq_kernel+mps_chi24`) |
| Parámetros totales | No aplica (no es un modelo neuronal); no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; no disponible |
| Tipos de cuantización | No aplica; no disponible |
| Idiomas soportados | `en` (inglés) |
| Licencia | Apache-2.0 (SDK); CC BY 4.0 (CSC-QT y manuscritos); CC0-1.0 (esquema NVIDIA Model Card++); UK OGL v3.0 (datos PCN) |
| Formato de pesos | No aplica; artefacto en Markdown con metadatos YAML y recibos sellados (`50a5e60176d71060` para `ENT-01`, `f7644db923d3727b` para `ENT-02`); binarios HUGR de `4.536 B` (6q) y `5.579 B` (8q) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo neuronal. Su "arquitectura" es documental y de compilación: describe `ENT-01` como un circuito cuántico dinámico gate-based con familia Chiribella-Pollock Quantum Comb y post-selección de síndrome de ancilla GF(2) (ASPS), con especificación en tres capas (abstracta, de control y física). La capa física apunta a 6 y 8 qubits lógicos/físicos de iones atrapados con hiperfina (`171Yb+` / `137Ba+` modelo objetivo, `Helios-1E-lite` / `H2`), con retroalimentación clásica en tiempo real (`if is_lof_carrier:`) que modifica la rotación `s_stroke` y el acoplamiento `CX`. `ENT-02` se describe como simulación clásica containerizada de circuitos `@cudaq.kernel` con `cuda-quantum-cu12==0.17.0`, sobre Modal `1.6.0` en `region='eu-west'` con `block_network=True` y pre-flight `assert_zero_pid`, ejecutando `qpp-cpu` (12q–26q FP64) y `cudaq_kernel+mps_chi24` (25q–75q HUBO).

No se documenta entrenamiento con tokens, RLHF ni DPO, porque no es un modelo de lenguaje. La innovación técnica destacable es el emparejamiento explícito de cada backend cuántico con una "Gate G4 Classical Alternative" verificable: para `ENT-01`, un sistema de ODE PBPK hepático de 9 estados con RK4 (`GMFE = 1.2423`) más un MPO de tensor de proceso canónico por la derecha (`chi = 16`, `TVD = 2.7e-5` con `kappa=0`, cruzando `TVD > 0.01` en `kappa_crit = 0.30`); para `ENT-02`, un MILP exacto con SciPy HiGHS (`<110 ms` en HUBOs de 25–75q) más un PT-MPO de CPU (`chi = 16`) con SVD temporal.

## Capacidades

- Documentación estructurada de un compilador cuántico clínico con especificación en tres capas (abstracta, control, física) y statements de 18 palabras por entidad.
- Verificación de resultados cuánticos frente a alternativas clásicas exactas (Gate G4) mediante métricas de fidelidad y distancia de traza (TVD, GMFE).
- Post-selección de síndrome de paridad GF(2) (ASPS) para reducción de flips de ranking lógico: `-44.57%` con supervivencia de paridad del `96.82%` a `p2 = 2.5e-3` y `p2_crit = 0.02`.
- Simulación serverless en Modal `eu-west` de combs de Stinespring de hasta 26 qubits y HUBOs cúbicos de hasta 75 qubits con CUDA-Q 0.17.0.
- Generación de código CUDA-Q verificado por AST y Quake-MLIR (`emit_scaled_stinespring_comb_cudaq_source`, `emit_icb_cubic_hubo_cudaq_source`).
- Análisis económico-sanitario: DCEA de 42 ICB con umbral NICE de `£20.000/QALY`, INMB de `+£299,23M/año`, `18741,7` años-paciente de diálisis evitados y CEAC de PSA del `91,5%`.
- Diseño de ensayo NHS stepped-wedge con EVSI (`OPENCAREQ-SW-MSE` y `.map()` modal de 42 ICB): `ENBS = +£2,449M` en 25 PCN, `42/42` ICB resueltos.
- Vinculación estatutaria a `NHS DCB0129`/`DCB0160` mediante `CSC-QT` (`H-OCQ-01..07` abiertos, `0` puntuaciones numéricas CSC-QT calculadas).
- Falsación PK humana sin ajuste ("Zero-Fit"): `GMFE = 1.2423` en cohorte PK de 4 cohortes y `GMFE = 1.0701` en CKM+PGx (`100%` dentro de factor 2).
- No se documentan capacidades de generación de texto, razonamiento general, código de propósito general, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Auditoría regulatoria de software cuántico clínico: el artefacto sirve como plantilla reproducible para documentar linkage a DCB0129/DCB0160 y FMEA de dos niveles con RPN por entidad (`FMEA-Q1 RPN = 48`, `FMEA-Q2 RPN = 54`, ambos en banda residual NHS "Tolerable"), útil para equipos de aseguramiento clínico que necesiten revisar un pipeline cuántico sin acceso a código propietario.
- Diseño de ensayos stepped-wedge en NHS: los valores EVSI (`ENBS = +£2,449M`, 25 PCN, 42/42 ICB resueltos) permiten dimensionar y priorizar un ensayo pragmático antes de comprometer recursos, usando el `.map()` modal de 42 ICB como capa de simulación por región.
- Evaluación económica de rutas de atención renal: el DCEA con umbral NICE de `£20.000/QALY` y los `18741,7` años-paciente de diálisis evitados a 10 años (KDIGO ESKD) sirven para justificar o descartar la adopción de una ruta de atención vecinal antes de un piloto real.
- Verificación de resultados cuánticos frente a clásicos: el emparejamiento Gate G4 permite a un equipo de investigación comprobar si un circuito cuántico aporta ventaja real frente a un solver MILP exacto (`<110 ms`) o un PT-MPO (`chi = 16`), evitando afirmaciones de "quantum advantage" no sustentadas.
- Simulación en sombra de circuitos farmacogenómicos: `ENT-02` permite ejecutar combs de Stinespring de hasta 26 qubits y HUBOs de 75 qubits en Modal `eu-west` con `block_network=True` y `assert_zero_pid`, adecuado para pre-validar `ENT-01` antes de enviarlo a hardware de iones atrapados.
- Formación y transferencia de conocimiento: el formato de statements de 18 palabras, subcards (Bias, Explainability, Privacy, Safety & Security) y QBOM CycloneDX 1.6 facilita que equipos no especializados en cuántica comprendan el alcance y los límites de un componente cuántico clínico.
- Integración en pipelines de compilación HUGR: los binarios de `4.536 B` (6q) y `5.579 B` (8q) con recibo sellado permiten trazabilidad de build en CI, comparando determinismo de compilación entre versiones de Guppy 1.0.

## Benchmarks y rendimiento

| Métrica | Valor medido | Referencia clásica Gate G4 | Límite fundamental | Riesgo |
|---|---|---|---|---|
| Payload HUGR y determinismo de compilación (`ENT-01`) | `4.536 B` (6q PGx+CKM) / `5.579 B` (8q Depot Comb) | PT-MPO `chi=16` TVD = 0,0171 (> 0,01 en `kappa = 0,34`) | Traza CPTP exacta = 0,0000 | `FMEA-Q1` (RPN = 48, banda Tolerable) |
| Reducción de flips lógicos ASPS (`ENT-01`) | `-44,57%` (96,82% supervivencia de paridad a `p2 = 2,5e-3`; `p2_crit = 0,02`) | Circuito ruidoso sin chequeo de síndrome GF(2) | Cero flips por debajo del umbral fault-tolerant | `FMEA-Q2` (RPN = 54, banda Tolerable) |
| Falsación PK humana Zero-Fit | `GMFE = 1,2423` (4 cohortes) | No aplica | No disponible | No disponible |
| Falsación CKM+PGx | `GMFE = 1,0701` (`100%` dentro de factor 2) | No aplica | No disponible | No disponible |
| DCEA 42 ICB (NICE `£20.000/QALY`) | `+£299,23M/año` INMB; `18741,7` años-paciente de diálisis evitados; `91,5%` CEAC de PSA | No aplica | No disponible | No disponible |
| EVSI stepped-wedge (`OPENCAREQ-SW-MSE`) | `ENBS = +£2,449M` en 25 PCN; `42/42` ICB resueltos en Modal `eu-west` | No aplica | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, dado que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia de modelo neuronal: no aplica; el artefacto no ejecuta inferencia de lenguaje.
- `ENT-01` (circuito cuántico): requiere hardware de iones atrapados con hiperfina (`171Yb+` / `137Ba+` modelo objetivo, `Helios-1E-lite` / `H2`) de 6 a 8 qubits lógicos/físicos con capacidad de medición a mitad de circuito, reset y retroalimentación clásica en tiempo real.
- `ENT-02` (simulador): Modal `eu-west` con 24 vCPU x86_64 y OpenMP; opción `--gpu L4` para aceleración; ejecuta `qpp-cpu` FP64 (12q–26q, statevector de `2^26` amplitudes) y `cudaq_kernel+mps_chi24` (25q–75q HUBO).
- GPU recomendadas: L4 (indicada explícitamente como opción `--gpu L4`); no se documentan A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible; el artefacto no especifica requisitos para GPUs de consumo.
- Opciones de despliegue: NVIDIA CUDA-Q 0.17.0 (`cuda-quantum-cu12==0.17.0`) sobre Modal `1.6.0` con `region='eu-west'`, `block_network=True` y pre-flight `assert_zero_pid`; Quantinuum Guppy 1.0 para compilación a HUGR.
- Latencia y throughput: MILP clásico exacto `<110 ms` en HUBOs de 25–75q; no se documentan latencias del simulador cuántico ni throughput.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `socialprescribing/opencareq-quantum-card-pp` | Quantum card + compilador clínico | No aplica | No aplica | Apache-2.0 (SDK) / CC BY 4.0 / CC0-1.0 / OGL v3.0 | Hugging Face (0 descargas, 0 likes) |
| NVIDIA Model Card++ | Esquema de documentación de modelos | No aplica | No aplica | CC0-1.0 | Público (esquema) |
| Everitt & Ji Quantum Model Card (arXiv:2412.13151) | Esquema de documentación cuántica | No aplica | No aplica | No disponible | arXiv |
| Curistica CSC-QT (Oskrochi & Grimes 2026) | Marco de evaluación clínica | No aplica | No aplica | CC BY 4.0 | No disponible |

No se dispone de comparativas con modelos de lenguaje o sistemas cuánticos de propósito general en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico certificado: estado operativo declarado "Non-SaMD", restringido a investigación, simulación en sombra y diseño de ensayos pre-registrados.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código de propósito general ni soporta tool calling o agentes.
- Cero descargas y cero likes en Hugging Face en la fecha de consulta; sin evidencia de adopción externa ni revisión por pares del artefacto.
- El linkage regulatorio `CSC-QT` tiene `H-OCQ-01..07` abiertos y `0` puntuaciones numéricas CSC-QT calculadas, por lo que la conformidad DCB0129/DCB0160 no está cerrada.
- Los resultados clínicos y económicos (`GMFE`, INMB, ENBS, CEAC) proceden de la propia model card y no consta validación independiente.
- El simulador `ENT-02` depende de Modal `eu-west` y de CUDA-Q 0.17.0; cambios de versión o de región pueden alterar reproducibilidad.
- El hardware cuántico objetivo (`Helios-1E-lite` / `H2`) es un "target model"; no se documenta ejecución en QPU física real.
- El artefacto está en inglés (`en`) únicamente; no hay soporte multilingüe.
- Riesgo de sobreinterpretación: las métricas de "quantum advantage" deben contrastarse siempre con la Gate G4 clásica exacta, que en varios casos es más rápida (`<110 ms` MILP) que la ruta cuántica.
- La licencia Apache-2.0 aplica al SDK, pero los datos PCN están bajo UK OGL v3.0 y los manuscritos bajo CC BY 4.0; el uso comercial combinado requiere revisar cada capa.

## Enlaces

- Hugging Face: https://huggingface.co/socialprescribing/opencareq-quantum-card-pp
- Dataset asociado: `socialprescribing/opencareq-nhs-42icb-atlas`
- Paper Quantum Model Card (Everitt & Ji): https://arxiv.org/abs/2412.13151
- Paper referenciado en tags: https://arxiv.org/abs/2611.18440
- NVIDIA Model Card++ / CycloneDX Property Taxonomy v1.0.0: no disponible enlace directo en la información proporcionada
- Curistica CSC-QT (Oskrochi & Grimes 2026): no disponible enlace directo en la información proporcionada
- Quantinuum Guppy 1.0 / HUGR: no disponible enlace directo en la información proporcionada
- NVIDIA CUDA-Q 0.17.0: no disponible enlace directo en la información proporcionada
- Modal 1.6.0: no disponible enlace directo en la información proporcionada

# callensxavier/leanflow-dual-scale-solver

## Resumen

LeanFlow Dual-Scale Navier–Stokes Solver es un solucionador numérico de ecuaciones diferenciales parciales (PDE) para dinámica de fluidos, desarrollado por Xavier Callens bajo la marca SocrateAI. No se trata de un modelo de lenguaje ni de un modelo de aprendizaje automático con pesos, sino de un paquete de software científico que combina métodos espectrales, regularización de doble escala y verificación formal mediante Lean 4. Su objetivo es ofrecer simulaciones rápidas y certificadas de flujos complejos en entornos industriales, como aeronáutica, dispositivos médicos, energía eólica, gestión térmica y fusión nuclear.

La arquitectura se basa en un esquema ETD-RK4 (Exponential Time Differencing Runge-Kutta de cuarto orden) con 32 modos de Fourier, lo que permite evaluaciones en menos de 5 milisegundos. Incorpora un ciclo de auto-investigación denominado "Karpathy Ratchet" que propone, evalúa, ajusta, verifica y reflexiona sobre hipótesis de control. Los invariantes formales H66–H70 se implementan como contratos en Pydantic, aunque el autor reconoce que son "stubs" de nivel B con `sorry` en Lean 4, pendientes de demostración completa en una fase posterior.

El repositorio en Hugging Face tiene un tamaño de 0.0 GB, lo que confirma que no contiene pesos de modelo, sino código fuente y documentación. La licencia es Apache-2.0 y el idioma principal es el inglés. Aunque el proyecto se presenta como "Enterprise Edition v2.0", las descargas y valoraciones son cero, y las afirmaciones de rendimiento provienen exclusivamente de la model card del autor, sin verificación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Solver espectral de Navier–Stokes con regularización dual-scale y esquema ETD-RK4 (32 modos de Fourier) |
| Parametros totales | no disponible (no es un modelo de ML con pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (no hay pesos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (código Python, sin pesos safetensors ni GGUF) |

## Arquitectura y entrenamiento

LeanFlow no se entrena en el sentido convencional del aprendizaje automático. Es un solucionador numérico que implementa una formulación espectral de las ecuaciones de Navier–Stokes con una regularización de doble escala que garantiza la acotación incondicional de la enstrofía cuando el radio efectivo R_eff ≥ 2√α'. El esquema temporal ETD-RK4 permite integración estable con 32 modos de Fourier, logrando tiempos de evaluación inferiores a 5 ms.

El sistema incorpora un ciclo de auto-investigación "Karpathy Ratchet" de cinco pasos: PROPOSE (generación de hipótesis mediante LLM), EVALUATE (simulación con el ROM espectral), RATCHET (aceptación o rechazo según fitness monótono), VERIFY (validación de invariantes formales H66–H70 mediante Pydantic) y REFLECT (diagnóstico con cadena de pensamiento). Los invariantes Lean 4 están declarados como contratos de nivel B con `sorry` stubs, lo que significa que no hay demostraciones formales completas en esta versión.

No se especifican datos de entrenamiento, número de tokens ni procesos de RLHF o DPO, ya que no aplican a un solver de PDE. La información disponible se limita a la descripción del autor y a un informe técnico en PDF enlazado en la model card.

## Capacidades

- Resolución de ecuaciones de Navier–Stokes en régimen compresible e incompresible mediante métodos espectrales.
- Simulación de flujos con interacción de ondas de choque (SBLI) en scramjets, con horizonte de predicción de 5.59 ms según el ejemplo de código.
- Cálculo de esfuerzo cortante en pared (WSS) para dispositivos de asistencia ventricular (VAD), reportando 137.9 Pa y una reducción de hemólisis del 47% (valor declarado por el autor).
- Optimización de orientación de turbinas eólicas con incremento de rendimiento del 17.8% (dato del autor).
- Gestión térmica de baterías (BTMS) mediante microcanales, con mejora de transferencia de calor del 32.1% (dato del autor).
- Simulación de inestabilidades MHD en tokamaks con horizonte de 16 ms (dato del autor).
- Verificación formal de invariantes mediante Lean 4 (aunque con stubs `sorry` en la versión actual).
- Integración con datasets públicos como PDEBench, angioinsight/single-vessel-flow, polymathic-ai/MHD_64 y sintéticos NREL.

## Casos de uso

- Simulación de interacción onda de choque / capa límite en scramjets: el solver permite predecir el horizonte de actuación (0.8 ms según el autor) para mitigar la separación del flujo, lo que podría usarse en diseño preliminar de propulsores hipersónicos.
- Análisis hemodinámico en dispositivos de asistencia ventricular: calcula el esfuerzo cortante en pared y estima la reducción de hemólisis, útil para optimizar el diseño de bombas sanguíneas antes de ensayos experimentales.
- Optimización de parques eólicos: mediante el control de orientación de turbinas, el solver estima ganancias de rendimiento del 17.8%, aplicable a estudios de layout y estrategias de estela.
- Gestión térmica de baterías: simula microcanales de refrigeración para mejorar la disipación de calor en paquetes de baterías, con un incremento declarado del 32.1% en transferencia térmica.
- Control de inestabilidades MHD en tokamaks: predice horizontes de 16 ms para mitigar disrupciones, relevante para la operación de reactores de fusión.
- Investigación académica en CFD: al ser de código abierto (Apache-2.0), puede utilizarse como base para experimentos numéricos y comparación con otros solvers.

## Benchmarks y rendimiento

La model card presenta una tabla de "resultados certificados" para cinco casos industriales. Estos datos provienen exclusivamente del autor y no han sido verificados de forma independiente. Se reproducen a continuación tal como se indican:

| Problema | Dataset | Métrica clave | Ganancia |
|---|---|---|---|
| Scramjet SBLI (H66) | PDEBench Mach-2 | Actuación: 0.8 ms | 15× velocidad |
| VAD médico (H67) | angioinsight/single-vessel-flow | WSS: 137.9 Pa | 47% reducción |
| Parque eólico (H68) | Sintético NREL | Rendimiento: +17.8% | 5.1× |
| BTMS (H69) | Sintético fractal | Calor: +32.1% | 4× |
| Tokamak MHD (H70) | polymathic-ai/MHD_64 | Horizonte: 16 ms | 20× |

No se han publicado resultados comparativos con otros solvers de PDE en la información disponible. El autor menciona un certificado `CERT-P12-AUTORESEARCH-F36322CED55DB91F` con hash SHA-256, pero no se aporta documentación de auditoría externa.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Dado que el solver utiliza 32 modos de Fourier y tiempos de evaluación inferiores a 5 ms, es plausible que pueda ejecutarse en CPU convencional, pero no hay datos confirmados. No se mencionan GPUs, VRAM ni opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. El repositorio incluye un `loop.py` que ejecuta el ciclo completo de auto-investigación, lo que sugiere que el código es autocontenido y no requiere infraestructura especializada.

## Comparativa con modelos similares

No se dispone de información sobre solvers comparables en la documentación proporcionada. El autor menciona un repositorio hermano `callensxavier/leanflow-dualscale-pde` (versión R3) con correcciones de benchmark, pero no se ofrecen datos de comparación cuantitativa con otros solvers de Navier–Stokes como OpenFOAM, SU2 o Nektar++. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los invariantes formales H66–H70 son "Tier B `sorry` stubs" en Lean 4, es decir, no hay demostraciones completas; la verificación formal total es un objetivo de la Fase 13.
- El valor de WSS de 137.9 Pa se describe como un "surrogado direccional de control" con una correlación de Spearman ρ=0.52 (p=0.12) frente al flujo de Couette exacto. No debe interpretarse como una afirmación de seguridad clínica.
- La convergencia del ciclo Ratchet en 1–3 iteraciones se logra en un espacio de búsqueda escalar 1D, no en un espacio de control autónomo no restringido.
- El repositorio tiene 0 descargas y 0 valoraciones, y el tamaño es de 0.0 GB, lo que indica que no hay artefactos de modelo ni evidencia de uso externo.
- Las ganancias reportadas (15×, 47%, 17.8%, etc.) son declaraciones del autor sin verificación independiente ni publicación en revista revisada por pares.
- La licencia Apache-2.0 permite uso comercial, pero las afirmaciones de rendimiento deben tratarse con cautela hasta que exista validación externa.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto, ya que no es un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/callensxavier/leanflow-dual-scale-solver
- Repositorio hermano (versión R3): https://huggingface.co/callensxavier/leanflow-dualscale-pde
- Informe técnico en PDF: https://huggingface.co/datasets/callensxavier/leanflow-phase12-benchmark/resolve/main/leanflow_phase12_report.pdf
- Repositorio GitHub mencionado en la model card: https://github.com/xaviercallens/SocrateAI-Numeric-DualScale-Solver
- Dataset de benchmark: https://huggingface.co/datasets/callensxavier/leanflow-jhtdb-benchmark
- Perfil del autor: https://huggingface.co/callensxavier

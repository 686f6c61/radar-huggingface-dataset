# callensxavier/leanflow-dualscale-pde

## Resumen

LeanFlow es un solver neuro-simbólico de ecuaciones de Navier-Stokes incompresibles, desarrollado por Xavier Callens y SocrateAI Research, que combina verificación formal en Lean 4, preprocesamiento asistido por IA y un núcleo de cómputo de alto rendimiento en Rust. El modelo resuelve el problema de la simulación de turbulencia homogénea isotrópica forzada mediante una formulación pseudo-espectral dual-scale que incluye una regularización ultravioleta biarmónica, garantizando cotas estrictas de enstrofía. Su relevancia radica en ofrecer una alternativa de código abierto con precisión numérica superior (residual de divergencia del orden de 10⁻¹⁴) y una aceleración de 2,1× frente a OpenFOAM, además de proporcionar pruebas matemáticas automatizadas de las propiedades clave del esquema.

El solver se distribuye bajo licencia MIT, está documentado en inglés y se presenta como un paquete Python con una interfaz de alto nivel (`LeanFlowPipeline`). Aunque no es un modelo de aprendizaje automático en el sentido clásico, incorpora componentes de IA para la resolución automática de la escala de disipación de Kolmogorov, la proyección de condiciones de contorno y la selección de precondicionadores adaptativos. La validación se realizó sobre cinco snapshots independientes del conjunto de datos JHTDB (turbulencia forzada con Re_λ ≈ 433), comparando con el solver icoFoam de OpenFOAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pseudo-espectral dual-scale para Navier-Stokes, con verificación formal en Lean 4 y núcleo de cómputo en Rust |
| Parametros totales | no disponible (no es un modelo de parámetros; es un solver numérico) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | inglés (interfaz y documentación) |
| Licencia | MIT |
| Formato de pesos | no aplica (código fuente: Python, Rust, Lean 4) |

## Arquitectura y entrenamiento

LeanFlow no se entrena en el sentido de optimización de pesos; se trata de un solver numérico con una arquitectura híbrida neuro-simbólica. La ecuación gobernante en el espacio de Fourier es:

∂ₜûᵢ = -i(δᵢₘ - kᵢkₘ/|k|²) kⱼ F(uⱼuₘ) - ν|k|²(1 + α'|k|²) ûᵢ

El término α'|k|⁴ constituye la regularización ultravioleta dual-scale, que acota matemáticamente la enstrofía y evita el blow-up numérico. La proyección de Leray (P² = P) se verifica formalmente en Lean 4, junto con la antisimetría de la energía triádica y las cotas de enstrofía. El núcleo de cómputo está implementado en Rust con SIMD nativo y se integra mediante C-ABI con la biblioteca rusty-SUNDIALS, que proporciona integradores temporales BDF (1–5) y Adams-Moulton (1–12). El preprocesamiento asistido por IA resuelve automáticamente la escala de disipación de Kolmogorov (k_max·η ≥ 1,5), proyecta condiciones de contorno y selecciona precondicionadores adaptativos (P0–P3). La validación se realizó sobre datos reales de JHTDB, con cortes planares 2D de campos 3D, y se comparó con OpenFOAM icoFoam.

## Capacidades

- Simulación de flujos incompresibles gobernados por Navier-Stokes en 2D (cortes planares de campos 3D).
- Manejo de turbulencia homogénea isotrópica forzada con números de Reynolds de Taylor altos (Re_λ ≈ 433).
- Verificación formal de propiedades matemáticas del esquema numérico mediante Lean 4 (proyección de Leray, conservación de energía invíscida, acotación de enstrofía).
- Preprocesamiento automático con IA: resolución de escala de Kolmogorov, proyección de condiciones de contorno y selección de precondicionadores.
- Integración temporal de alto orden (BDF 1–5, Adams-Moulton 1–12) mediante rusty-SUNDIALS.
- Interfaz Python sencilla (`LeanFlowPipeline`) que acepta campos de velocidad iniciales y devuelve resultados con métricas de divergencia y tiempo de ejecución.
- Rendimiento superior a OpenFOAM en precisión de divergencia (7 órdenes de magnitud) y velocidad (2,1×).
- Código abierto con licencia MIT, permitiendo uso comercial y modificación.

## Casos de uso

- Investigación en dinámica de fluidos computacional: validación de modelos de turbulencia y estudio de la regularización ultravioleta en esquemas pseudo-espectrales.
- Simulación de flujos en ingeniería para estudios preliminares 2D, como análisis de estelas o flujos en canales, antes de pasar a simulaciones 3D completas.
- Educación y docencia: demostración de solvers numéricos con verificación formal, permitiendo a estudiantes explorar la relación entre matemáticas, programación y CFD.
- Benchmarking de solvers: comparación sistemática con OpenFOAM u otros códigos en métricas de precisión y tiempo de ejecución, gracias a la interfaz reproducible.
- Desarrollo de solvers neuro-simbólicos: integración de técnicas de IA (preprocesamiento, selección de parámetros) con métodos numéricos clásicos, sirviendo como referencia para futuras investigaciones.
- Análisis de datos de JHTDB: procesamiento de snapshots de turbulencia real para extraer estadísticas de flujo o validar modelos de cierre.
- Prototipado rápido de experimentos numéricos: la API Python permite lanzar simulaciones con pocas líneas de código, ideal para pruebas de concepto.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Métrica | OpenFOAM icoFoam | LeanFlow DualScale | Ventaja |
|---|---|---|---|
| Máxima divergencia ‖∇·u‖∞ | 4,10 × 10⁻⁷ | 2,99 × 10⁻¹⁴ | 7 órdenes de magnitud |
| Tiempo de ejecución (media ± desviación) | 1,833 ± 0,021 s | 0,874 ± 0,008 s | 2,10× más rápido |
| Iteraciones de presión | ~40 barridos PCG/paso | 0 (algebraico exacto) | Sin iteraciones |
| Regularización de enstrofía UV | Ninguna (riesgo de blow-up) | Garantizada vía α'‖k‖⁴ | Probada formalmente |

La metodología emplea una malla de 64×64, cinco snapshots temporales independientes (t ∈ {1,2,3,4,5}) y una proyección de Leray para imponer solenoididad 2D en el estado inicial. No se han publicado resultados en otros conjuntos de datos ni comparaciones con otros solvers.

## Requisitos de hardware

- No se especifican requisitos mínimos en la documentación disponible.
- Dado que la validación se realizó en una malla 2D de 64×64, el solver es ligero y debería ejecutarse en CPU estándar sin necesidad de GPU.
- El núcleo Rust con SIMD aprovecha instrucciones vectoriales en procesadores x86-64 y ARM modernos.
- Para simulaciones más grandes (mallas superiores a 256×256), se recomendaría una estación de trabajo con múltiples núcleos y al menos 16 GB de RAM, aunque no hay datos oficiales.
- Opciones de despliegue: el paquete Python se puede instalar localmente; no se mencionan contenedores Docker ni servicios en la nube.
- La integración con rusty-SUNDIALS requiere compilar la biblioteca C-ABI, lo que añade dependencias de toolchain de Rust y C.

## Comparativa con modelos similares

La comparativa se limita a OpenFOAM, que es el único solver con datos publicados en la model card. No se dispone de información sobre otros solvers pseudo-espectrales o neuro-simbólicos comparables.

| Característica | LeanFlow DualScale | OpenFOAM icoFoam |
|---|---|---|
| Tipo | Pseudo-espectral dual-scale | Volúmenes finitos |
| Verificación formal | Sí (Lean 4) | No |
| Precisión de divergencia | 2,99 × 10⁻¹⁴ | 4,10 × 10⁻⁷ |
| Velocidad (malla 64×64) | 0,874 s | 1,833 s |
| Licencia | MIT | GPL-3.0 |
| Lenguaje de implementación | Python + Rust + Lean 4 | C++ |
| Dependencias externas | rusty-SUNDIALS | OpenFOAM suite |

No se han encontrado datos de otros solvers como Nek5000, Dedalus o FEniCS en la información proporcionada.

## Limitaciones y advertencias

- El solver opera en 2D (cortes planares de campos 3D), por lo que no es adecuado para simulaciones tridimensionales completas sin modificaciones sustanciales.
- La verificación formal no está completa: el módulo `FrustrationMonotonicity.lean` está en Tier C con 4 "sorry" (conjetura de monotonicidad abierta), aunque el teorema principal `frustration_index_ge_one` está probado.
- No es un modelo de lenguaje ni un generador de texto; su uso se limita a la simulación numérica de fluidos.
- La validación se realizó únicamente sobre el conjunto JHTDB con una malla de 64×64; la generalización a otras condiciones de flujo o resoluciones no está demostrada.
- La dependencia de rusty-SUNDIALS y de la compilación C-ABI puede complicar la instalación en entornos sin toolchain de Rust.
- Aunque la licencia MIT permite uso comercial, las dependencias (por ejemplo, OpenFOAM si se usa para comparación) pueden tener licencias más restrictivas.
- No se proporcionan garantías de estabilidad numérica para condiciones extremas (números de Reynolds muy altos, geometrías complejas) más allá de los casos probados.

## Enlaces

- HuggingFace: https://huggingface.co/callensxavier/leanflow-dualscale-pde
- Repositorio GitHub (reporte científico y código): https://github.com/xaviercallens/SocrateAI-Numeric-DualScale-Solver
- Conjunto de datos de benchmark: https://huggingface.co/datasets/callensxavier/leanflow-jhtdb-benchmark
- Paper (arXiv preprint, sin número específico): citado en la model card como `callens2026leanflow`

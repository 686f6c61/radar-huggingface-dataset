# Snapkitty/sovereign-apollo

## Resumen

`Snapkitty/sovereign-apollo` es un repositorio que documenta el proyecto "Sovereign Apollo", una reconstrucción multi-lenguaje del Apollo Guidance Computer (AGC) de las misiones Apolo, basada en fuentes históricas y verificada formalmente. No se trata de un modelo de lenguaje ni de un sistema de IA entrenado, sino de un conjunto de programas, pruebas y demostraciones matemáticas que emulan o reimplementan los algoritmos del ordenador de guiado original. El autor, identificado como Snapkitty (y en la narrativa como Ahmad Parr), orquesta siete sistemas de IA (Claude, Kimi, Gemini, Grok, Nova Parr/GPT, Perplexity y otros) para generar código en lenguajes tan dispares como FORTRAN 77, Fortran 2018, APL, R, Ada/SPARK, Idris 2, Lean 4, OpenQASM 3.0, PTX/SASS, Forth y Rust.

La relevancia del proyecto radica en su enfoque de "reconstrucción formal" más que de simulación: cada componente debe cumplir invariantes matemáticas demostradas, como las pruebas Lean 4 con "cero sorry" (sin agujeros de demostración). El repositorio incluye una tabla de atribuciones por capa, un diagrama de arquitectura y una narrativa que explica cómo se coordinaron los distintos modelos de IA. A pesar de su ambición, el repositorio no ofrece un modelo descargable ni pesos; es un artefacto de código y documentación. En cuanto a disponibilidad, el repositorio tiene 0 descargas, 0 likes, sin licencia declarada y sin idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de código multi-lenguaje, no un modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponibles (el código usa FORTRAN, Fortran, APL, R, Ada, Idris, Lean, OpenQASM, PTX, Forth, Rust, TypeScript) |
| Licencia | No disponible (la model card menciona "Sovereign Source v1.0" como insignia, pero no se detalla el texto legal) |
| Formato de pesos | No aplica (no hay pesos; el contenido son fuentes de código y documentación) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado con datos. El repositorio contiene múltiples implementaciones independientes que reconstruyen el comportamiento del AGC original (Luminary 099, 1969). Cada capa tiene su propio lenguaje y propósito: una línea base en TypeScript con 16 entregables y reproducción determinista; un puerto a FORTRAN 77 con 19 módulos y ~1100 líneas; un intérprete completo en Fortran 2018 que emula la ALU de complemento a uno, las funciones trigonométricas de Hastings y el evaluador POLY; un despachador en APL que implementa las instrucciones DANZIG/INDJUMP/DOSTORE como una máquina de estados indexada por vectores; un paquete de mecánica orbital en R con propagador de Kepler, elementos de órbitas medias (MEE), matriz de transición de estado y armónicos esféricos; una máquina de estados BURNBABY en FORTRAN 77; una arquitectura GPU en PTX/SASS que mapea la aritmética de complemento a uno a núcleos tensor de CUDA sm_80; verificación en Ada SPARK con contratos fantasma; y pruebas formales en Idris 2 y Lean 4. El entrenamiento, si se puede llamar así, consistió en que cada modelo de IA generó código bajo la supervisión de un humano, con bucles de investigación vía Perplexity para contrastar contra el Virtual AGC, el libro de Battin y las fuentes ensamblador originales.

## Capacidades

- Reconstrucción funcional del Apollo Guidance Computer: emula la ALU de 15 bits en complemento a uno, el sistema de interrupciones, las instrucciones de salto (DANZIG, INDJUMP) y el almacenamiento de datos (DOSTORE).
- Verificación formal: incluye demostraciones en Lean 4 con "cero sorry" para propiedades como `thrust_requires_astronaut` y `thrust_at_tig_zero`, y un "hard gate" en Idris 2 con prueba de acotación (`bounded_prf`) sin usar `believe_me`.
- Mecánica orbital: implementa propagación de Kepler, elementos de órbitas medias, matriz de transición de estado, covarianza y armónicos esféricos J2-J4 en R.
- Ejecución en GPU: mapeo de la aritmética del AGC a núcleos tensor CUDA sm_80 mediante PTX/SASS, con un ejecutivo en Forth y una ABI CURRY.
- Simulación de misión: línea de tiempo de 22 eventos en FORTRAN 77 y reproducción determinista con inyección de fallos en TypeScript.
- Variante cuántica: circuito de ignición BURNBABY en OpenQASM 3.0, con generación de números aleatorios cuánticos (ANU QRNG) para el proceso de ullage y colapso de función de onda.
- Soporte multi-lenguaje: el código fuente está escrito en más de diez lenguajes, lo que permite estudiar la misma lógica desde paradigmas distintos (imperativo, funcional, array, verificación).

## Casos de uso

- Educación en sistemas de guiado espacial: el repositorio sirve como material didáctico para entender cómo funcionaba el AGC, con implementaciones legibles en múltiples lenguajes que permiten comparar estilos y paradigmas.
- Investigación en verificación formal: las pruebas Lean 4 e Idris 2 demuestran propiedades críticas de un sistema de control; pueden usarse como ejemplo de cómo aplicar asistentes de prueba a software de misión crítica.
- Estudio de portabilidad de código legacy: el puerto de FORTRAN 77 a Fortran 2018 y la interpretación del ensamblador original muestran técnicas de migración y emulación de sistemas antiguos.
- Desarrollo de emuladores educativos: el intérprete en Fortran 2018 puede integrarse en proyectos de emulación de hardware retro para fines académicos o de museo.
- Análisis de mecánica orbital con R: el paquete de propagación de órbitas y cálculo de covarianza puede reutilizarse en cursos de astrodinámica o en herramientas de análisis de misiones.
- Experimentación con computación cuántica: el circuito OpenQASM 3.0 de ignición ofrece un caso de uso no trivial para estudiar la implementación de máquinas de estado en lógica cuántica.
- Documentación de ingeniería de IA multi-agente: la narrativa de "siete IA coordinadas" es un caso de estudio sobre cómo orquestar distintos modelos (Claude, Kimi, Gemini, Grok, GPT, Perplexity) para resolver un problema complejo de ingeniería inversa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona en la model card que la línea base TypeScript pasa una prueba diferencial con 22/22 coincidencias y que las pruebas Lean 4 tienen "cero sorry", pero no se proporcionan métricas cuantitativas comparables (MMLU, HumanEval, GSM8K, etc.). No hay datos de latencia ni throughput porque no es un modelo de inferencia.

## Requisitos de hardware

- No aplica como modelo de IA: no hay pesos que cargar ni inferencia que ejecutar.
- Para ejecutar el código fuente se necesitan compiladores e intérpretes de los lenguajes implicados: gfortran (Fortran 2018), Dyalog APL (comercial), R, GNAT (Ada), Idris 2, Lean 4, Qiskit (para OpenQASM), CUDA toolkit (para la parte PTX/SASS) y un compilador de TypeScript.
- La parte GPU (PTX/SASS) requiere una GPU NVIDIA con arquitectura sm_80 (por ejemplo, A100, RTX 3080/3090, RTX 4000 series) para ejecutar el mapeo de la ALU del AGC sobre núcleos tensor.
- El resto de componentes se ejecutan en CPU estándar; no hay requisitos de memoria especificados.

## Comparativa con modelos similares

No disponible. No existe una categoría estándar de "modelos" comparable porque este repositorio no es un modelo de lenguaje ni un sistema de IA generativa. Podría compararse con otros proyectos de emulación del AGC (como Virtual AGC), pero no se dispone de datos de dichos proyectos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, código ni realizar razonamiento; es un conjunto de programas y pruebas.
- Sin licencia clara: la insignia "Sovereign Source v1.0" no está acompañada del texto legal, por lo que no se puede determinar si el uso comercial está permitido.
- Sin mantenimiento ni soporte: el repositorio tiene 0 descargas y 0 likes; no hay evidencia de actividad posterior a la creación (septiembre de 2026).
- Dependencia de herramientas propietarias: Dyalog APL es comercial, y la parte de GPU requiere CUDA y hardware específico; esto limita la reproducibilidad en entornos sin esas herramientas.
- Las afirmaciones de verificación formal ("cero sorry", "22/22 MATCH") son declaraciones del autor y no han sido auditadas de forma independiente.
- Riesgo de alucinación en la documentación: la narrativa sobre la coordinación de siete IA es una historia no verificable; podría contener imprecisiones sobre las capacidades reales de los modelos mencionados.
- El tamaño del repositorio es 0.0 GB, lo que sugiere que el contenido podría estar vacío o que la métrica no se ha actualizado; no se puede confirmar que los archivos existan realmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/sovereign-apollo
- Enlaces internos de la model card (no son URLs completas): `fortran1978/`, `fortran2018/`, `apl/`, `r/`, `ada/`, `idris/`, `burnbaby/lean/`, `burnbaby/qasm/`, `burnbaby/`, `../LICENSE`

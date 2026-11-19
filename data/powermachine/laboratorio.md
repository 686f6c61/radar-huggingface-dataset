# PowerMachine/laboratorio

## Resumen

`PowerMachine/laboratorio` es un repositorio de investigación autocontenido y ejecutable, no un modelo de lenguaje en el sentido habitual. Se presenta como un laboratorio de auditoría y reproducción que examina la rama publicada de `PowerMachine/khtst-rust` y cinco anexos del ciclo v0.22 (driver x86 con detección de ISA, sondas en ensamblador, kernels FP16/AMX y activación multinúcleo), documenta cuatro defectos reales en dichos anexos y propone parches rotulados (A22-1 a A22-4). Su propósito es verificar, con datos reales y pruebas que rechazan afirmaciones no respaldadas, la matemática central de los ciclos v0.18 a v0.21.

El proyecto combina componentes en Python (con `numpy`, `scipy`, `scikit-learn` y `torch` en CPU y precisión f64) y código Rust auditado. Los experimentos se ejecutan sobre 246 artículos de la Wikipedia en portugués de Brasil y 1797 dígitos manuscritos reales, y cada resultado se acompaña de un JSON medido y de un test que lo valida. La suite declara 9 de 9 puertas en verde.

Es relevante para investigadores interesados en reproducibilidad, interpretabilidad y aprendizaje autosupervisado (JEPA, mapas autoorganizados de Kohonen), así como para quienes trabajan en portabilidad y telemetría de kernels vectorizados (AMX, AVX-512). No obstante, conviene subrayar que el repositorio tiene 0,0 GB de tamaño, 0 descargas y 0 likes, y que no contiene pesos de modelo: es material de auditoría y reproducción científica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal desplegable; el repositorio contiene componentes de investigación: RNG xorshift64* con Box-Muller, mapas autoorganizados, JEPA en torch f64 y kernels Rust) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio menciona kernels FP16/AMX y BF16 en el código auditado, no cuantizaciones de pesos) |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos; incluye código Python y Rust, JSON de resultados y figuras) |

## Arquitectura y entrenamiento

No se trata de un transformer ni de un modelo generativo. El repositorio agrupa varios componentes independientes: `lab/rng.py` implementa un generador determinista xorshift64* con transformación Box-Muller exacta; `lab/mapa_som.py` implementa la familia MAPA con mediana geométrica de Weiszfeld, criterio relativo e histéresis; `lab/som.py` implementa mapas autoorganizados de Kohonen en modo lote con distancia euclídea y de Mahalanobis (vía Cholesky); y `lab/jepa.py` implementa "LeJEPA-lab", con energía aprendida, equilibrio desenrollado y un término anti-colapso incorporado al objetivo, ejecutado en `torch` con precisión f64 sobre CPU. También hay componentes de autorregulación (`lab/autorregulacion.py`) y de memoria creciente (`lab/memoria_crescente.py`) con una ley corregida opt-in (`lei_corrigida=False` por defecto).

El entrenamiento no se describe en términos de tokens ni de composición de dataset. Los datos empleados son 246 artículos de Wikipedia en portugués de Brasil (ciclo v0.21) y 1797 dígitos manuscritos reales, usados como bancos de prueba para medir propiedades como la autoorganización (índice TE de Moore), el error de cuantización (EQ) y el crecimiento de células. La innovación metodológica destacable es la disciplina de verificación: cada afirmación numérica tiene un JSON de resultado y un test que la rechaza si no se cumple, y la auditoría de los anexos v0.22 cita fragmento y línea para cada defecto localizado y cerrado.

## Capacidades

- Reproducción determinista de la matemática de los ciclos v0.18 a v0.21 con paridad semántica en Python.
- Auditoría estática y ejecutable de código Rust: localización de defectos con cita de fragmento y línea, y cierre mediante parches rotulados (A22-1 a A22-4).
- Detección de ISA y telemetría en el driver x86 auditado (con los defectos A22-1 y A22-2 documentados).
- Medición de kernels vectorizados: se reporta una aceleración vectorial de 3,61× y de hilos de 1,08× frente a un techo declarado de 2,00×.
- Evaluación de cuantización BF16: se mide un sesgo de −2,815e−3 con truncamiento frente a −2,638e−5 con redondeo al par más cercano (RNE), una diferencia de 107×.
- Verificación de autoorganización en mapas de Kohonen: el índice TE de Moore pasa de 0,947 a 0,096 y el EQ de 23,86 a 1,47.
- Comprobación de gradientes: error entre autograd y diferencias finitas de 3,6e−11, frente a 4,5e−02 en primera aproximación.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio.

## Casos de uso

- Auditoría de código Rust en proyectos de cómputo numérico: el repositorio sirve como plantilla para localizar defectos de portabilidad (por ejemplo, uso de `__cpuid` sin `#[cfg(target_arch)]`) y de telemetría (un contador nunca incrementado), con parches y pruebas de cierre.
- Validación de kernels vectorizados en x86: los scripts `35_bancada_ativacao.py` y `41_auditoria_v022.py` permiten medir aceleraciones vectoriales y de hilos sobre datos reales y comprobar que se respetan los techos declarados.
- Verificación de aritmética de precisión reducida: la comparación entre truncamiento y RNE en BF16 es directamente reutilizable para decidir políticas de redondeo en pipelines de entrenamiento o inferencia.
- Reproducción de experimentos de aprendizaje autosupervisado: los scripts de JEPA en `torch` f64 permiten comprobar el descenso del residuo KKT (de 47,2 a 0,022) y contrastarlo con un control que multiplica la tasa de aprendizaje por cuatro (6,25).
- Estudio de mapas autoorganizados: los bancos de prueba con 1797 dígitos manuscritos permiten evaluar criterios de división de células, histéresis y distancias de Mahalanobis con métricas objetivas.
- Docencia y revisión metodológica: la estructura de puertas L1 a L9 y la autocritica en cinco ejes (matemática, física, física matemática, lógica y programación) sirven como ejemplo de protocolo de verificación para trabajos de investigación.
- Integración en procesos de CI científica: la suite `scripts/90_suite_laboratorio.py` puede ejecutarse como comprobación de regresión de los resultados publicados antes de aceptar cambios en el código.

## Benchmarks y rendimiento

| Medición | Valor publicado | Valor en laboratorio | Dato de prueba |
|---|---|---|---|
| Bucle de regulación | muerto: error ≡ 0, 0 propuestas en 12 pasos | vivo: 11-12 propuestas reales, ensayo en cada paso | wiki PT-BR y digits |
| Crecimiento de células | 19 a 215 células | 19 a 75 células, EQ held-out de 2,318 a 2,101 | digits |
| Histéresis (parche 3) | no disponible | 6 divisiones a 0, EQ held-out de 0,8124 a 0,8102 | wiki PT-BR |
| Meta-gradiente | prueba en Rust | error autograd frente a diferencias finitas de 3,6e-11; primera aproximación 4,5e-02 | digits |
| Equilibrio (T-V21-7) | residuo KKT decreciente | residuo de 47,2 a 0,022; control con tasa x4: 6,25 | digits |
| SOM: autoorganización | no disponible | TE de Moore de 0,947 a 0,096, EQ de 23,86 a 1,47 | digits |
| A22-3: partición del driver | descarta `n % threads` | cobertura del 100% (pérdida de 1/1003 a 0) | digits (n no divisible) |
| A22-4: BF16 truncado | sesgo sistemático | sesgo de -2,815e-3 frente a -2,638e-5 (RNE, 107×); máximo 1 ULP frente a ½ ULP | wiki PT-BR |
| T-V22-3/5: palancas | pruebas en Rust | vector 3,61×; hilos 1,08× con techo de 2,00× | digits |

No se han publicado resultados de benchmarks de modelos de lenguaje en la información disponible.

## Requisitos de hardware

- No aplica VRAM para inferencia de un modelo: el repositorio no contiene pesos.
- Dependencias de ejecución: `numpy`, `scipy`, `scikit-learn`, `matplotlib` y `torch` en CPU con precisión f64.
- El componente JEPA se ejecuta en `torch` sobre CPU; no se documentan requisitos de GPU.
- Los kernels auditados están orientados a x86 con AMX y AVX-512, pero la auditoría se realiza sobre el código fuente y las mediciones en Python, no sobre hardware específico.
- Opciones de despliegue: ejecución directa de los módulos `python3 -m lab.*` y de los scripts de `scripts/`, sin servidores de inferencia (vLLM, TGI, llama.cpp u Ollama no son aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PowerMachine/laboratorio | Repositorio de auditoría y reproducción | no aplica | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| PowerMachine/khtst-rust | Repositorio Rust auditado (referencia del autor) | no aplica | no aplica | no disponible | Referenciado en la model card |
| Modelos de lenguaje abiertos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre proyectos equivalentes de auditoría reproducible con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite tool calling ni uso como agente.
- El repositorio tiene 0,0 GB, 0 descargas y 0 likes; la adopción y la revisión externa son nulas según los datos disponibles.
- La model card está redactada en portugués y el único idioma declarado es `pt`, lo que limita la documentación para lectores en otras lenguas.
- Los resultados se limitan a dos conjuntos de datos concretos (246 artículos de Wikipedia PT-BR y 1797 dígitos manuscritos); no se documenta su generalización a otros dominios.
- Las afirmaciones sobre rendimiento proceden del propio autor y no consta replicación independiente.
- La licencia Apache 2.0 permite uso comercial del código, pero el contenido auditado (`khtst-rust` y anexos v0.22) puede tener condiciones propias no especificadas.
- La fecha de creación indicada (2026-11-19) es posterior a la fecha actual y debe tratarse con cautela.
- Riesgo de alucinación: no aplica al no ser un modelo generativo; el riesgo relevante es la confianza excesiva en resultados no replicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PowerMachine/laboratorio
- Repositorio auditado referenciado: https://huggingface.co/PowerMachine/khtst-rust (según la model card)
- Documentación interna citada: `docs/r-66-laboratorio.md`, `ESTRUTURA.md`, `AUTOCRITICA.md` (incluidos en el repositorio)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.

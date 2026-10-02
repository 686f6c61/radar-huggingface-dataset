# asketeddy/gooo-shared-judgment-tiny-v1

## Resumen

`asketeddy/gooo-shared-judgment-tiny-v1` es un modelo especialista diminuto, publicado por el usuario asketeddy, cuyo único cometido es elegir entre ocho rutas legales de cuerpo Gooo ("Gooo body paths") a partir de contextos de intención en coreano e inglés ligados a código fuente. No es un modelo general de texto a código ni un checkpoint de Transformers: se trata de un juez local que puntúa decisiones acotadas dentro del ecosistema del compilador `meta-ontology-go` y del repositorio de investigación `gooo-neural-decision-experiments`. El modelo consume contextos de intención completos, mantiene alternativas tipadas legales, expectativas finitas y continuación determinista, y delega la autoridad del código fuente en Gooo.

La arquitectura no es un transformer, sino una red neuronal local compartida de tipo `256 -> 8 -> 2` reutilizada sobre tres decisiones ordenadas (juez compartido), con 2.072 parámetros entrenables frente a los 18.656 de la variante densa de control. Ambos exportan el mismo ABI Go `768 -> 24 -> 8`, de modo que el experimento no reduce los tensores residentes de ejecución pese a reducir drásticamente los parámetros entrenables. Se generaron seis exportaciones (FP32, PTQ y QAT para cada variante) y se conservaron todos los diarios de actualizaciones y épocas.

Su relevancia es de investigación más que de producto: sirve para medir si la composición con parámetros compartidos mejora la completitud y la continuación acotada en un espacio finito de programas, comparándola con una red densa equivalente. El propio autor advierte que los resultados son una comparación de arquitecturas sobre una cohorte conocida (con vistas de desarrollo ya observadas en estudios previos), no una medida de generalización a lenguajes no vistos ni una precisión sobre un holdout intacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal local compartida `256 -> 8 -> 2` reutilizada sobre tres decisiones ordenadas (juez compartido); no es un transformer. Exporta ABI Go `768 -> 24 -> 8` |
| Parametros totales | 2.072 entrenables en la variante compartida; 18.656 en la variante densa de control |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en términos de ventana textual; consume contextos de intención coreano/inglés ligados a fuente completa, con 16 expectativas finitas independientes por vista inicial |
| Tipos de cuantizacion | FP32, PTQ (cuantización post-entrenamiento) y QAT (cuantización con conciencia de entrenamiento); incluye etiqueta "ternary" |
| Idiomas soportados | en, ko |
| Licencia | mit |
| Formato de pesos | Exportaciones al ABI Go `768 -> 24 -> 8` (seis exportaciones: FP32/PTQ/QAT de ambas variantes); no es safetensors, GGUF ni checkpoint de Transformers |

Datos adicionales: identificador `asketeddy/gooo-shared-judgment-tiny-v1`, autor asketeddy, pipeline no disponible, 0 descargas y 0 likes en el momento de la consulta, tamaño de repositorio 0,0 GB, creado el 2026-10-02 y actualizado el 2026-10-02.

## Arquitectura y entrenamiento

Ambos brazos del experimento partieron de la misma receta de inicialización fresca en Go; no se usó ningún peso preentrenado ni destilado (tampoco Laya ni pesos de estudiante). Cada brazo completó 800 actualizaciones FP32 y 800 actualizaciones QAT sobre MPS local, lo que suma 3.200 actualizaciones reales. La variante compartida reutiliza una red `256 -> 8 -> 2` sobre tres decisiones ordenadas, mientras que el control denso reproduce los hashes de pesos del modelo anterior de realimentación de conjuntos. El autor verifica que el error absoluto máximo entre Go y la exportación fue de 0,000001073, por debajo del umbral declarado de 0,00001, y que una auditoría independiente en Go confirmó los empates de matrices compartidas, los ceros estructurales, la composición conjunta de puntuaciones de bits y las 288 predicciones de paridad.

Los datos de entrenamiento provienen de un banco de características inmutable de origen/profesor con 10.739 filas, organizado en 1.024 grupos de programas de entrenamiento, 256 de calibración y 256 de desarrollo. El conjunto de desarrollo contiene 512 vistas coreano/inglés y ya había sido observado en estudios anteriores, por lo que el autor insiste en que los números son una comparación de arquitecturas sobre una cohorte conocida y no una precisión sobre datos no vistos. La innovación técnica central es la composición compartida de matrices (frente a la densidad completa) aplicada a una continuación acotada y determinista, con ejecución Go nativa inmediata tras cada generación.

## Capacidades

- Selección acotada entre ocho rutas legales de cuerpo Gooo a partir de contextos de intención coreano/inglés ligados a código fuente.
- Puntuación inicial completa por vista con 16 expectativas finitas independientes por vista.
- Continuación determinista: ordenación de las ocho máscaras a partir de la predicción inicial y repetición de sus objetivos finitos verificados, sin llamada de realimentación adaptable.
- Generación inmediata seguida de ejecución real: cada generación se acompañó de `gooo body-execute`, sin barrera de generación por lotes ni llamada al modelo tras la emisión.
- Decodificación de recibos Gooo declarados mediante el decodificador real del compilador, con preservación exacta de los bytes padre y dimensiones no relacionadas (0 llamadas en tiempo de ejecución a modelos o proveedores).
- Capacidad bilingüe coreano/inglés a nivel de entrada, aunque la alineación de intención entre idiomas no está resuelta.
- Soporte de cuantización ternaria, con variantes FP32, PTQ y QAT.

No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso genérico, visión, audio ni modo de pensamiento. El autor declara explícitamente que no es un modelo general de texto a código.

## Casos de uso

- Investigación en metaprogramación Go: el modelo sirve para estudiar cómo una red de 2.072 parámetros compartidos elige entre rutas legales de cuerpo Gooo dentro del compilador `meta-ontology-go`, un escenario de síntesis de programas acotada y verificable.
- Comparación de arquitecturas en modelos diminutos: permite medir de forma controlada si compartir parámetros mejora la completitud inicial (de 18,55% a 22,07% en funciones completas con FP32) frente a una red densa de 18.656 parámetros, con todos los diarios conservados.
- Verificación de paridad Go/exportación: encaja en pipelines de compiladores que necesitan comprobar que la exportación reproduce el comportamiento en Go con un error absoluto máximo declarado de 0,000001073.
- Generación y ejecución inmediata de programas Gooo: con 96 generaciones, 320 predicciones reales, 192 ejecuciones nativas y 4.608 valores ordenados, el modelo se usa en bucles donde cada salida se valida de inmediato contra expectativas finitas.
- Estudio de alineación bilingüe coreano/inglés: al registrar desacuerdos de máscara por idioma (por ejemplo, 255/256 en shared FP32), sirve como banco de pruebas para medir cuánto diverge la intención entre KO y EN y con qué frecuencia ambos idiomas aciertan o fallan conjuntamente.
- Auditoría de cuantización PTQ frente a QAT: las seis exportaciones permiten analizar cómo degradan o mejoran la completitud y el desacuerdo bilingüe según el método de cuantización en un modelo ternario.
- Despliegue en entornos muy restringidos de memoria: con kernels Go en caliente de 35,7–41,8 microsegundos por predicción y cero asignaciones de heap en `PredictInto` caliente válido, es apto para inferencia embebida en el propio binario Go.
- Reproducibilidad de artefactos de investigación: los recibos, el `go-audit.json` y las referencias de commits permiten reproducir y auditar cada resultado sin dependencia de modelos o proveedores externos en tiempo de ejecución.

## Benchmarks y rendimiento

No se han publicado métricas del tipo MMLU, HumanEval o GSM8K en la información disponible; el modelo no es evaluable en esas tareas. La evaluación disponible es la tabla de completitud y continuación del propio autor:

| Export | Initial complete /512 | Initial cases /8192 | Extra ranked attempts | Complete by budget 4 /512 | EN/KO mask disagreements /256 | Same-mask both wrong /256 |
|---|---:|---:|---:|---:|---:|---:|
| Dense FP32 | 95 | 2265 | 1572 | 289 | 256 | 0 |
| Shared FP32 | 113 | 2592 | 1469 | 319 | 255 | 0 |
| Dense PTQ | 74 | 1967 | 1595 | 285 | 45 | 180 |
| Shared PTQ | 80 | 2052 | 1439 | 336 | 136 | 98 |
| Dense QAT | 82 | 2050 | 1584 | 293 | 240 | 12 |
| Shared QAT | 89 | 2191 | 1512 | 327 | 255 | 1 |

Observaciones declaradas por el autor sobre estos datos: Shared FP32 eleva las funciones completas iniciales del 18,55% al 22,07%, la completitud de casos inicial del 27,65% al 31,64% y reduce los intentos ordenados extra un 6,55%. Su NLL sumada del conjunto de paso en desarrollo empeora de 975,663 a 992,402, pese a mejorar la NLL de calibración (de 1,812 a 1,752), lo que indica que la calidad de confianza y el comportamiento parcial/completo no se mueven juntos. La mayor ganancia en FP32 se da en operandos encadenados (de 8 a 20 vistas completas inicialmente, y de 220 a 149 intentos ordenados extra); comparación/asignación pasa de 185 a 194 intentos extra, ramas anidadas de 220 a 224 y asignaciones sucesivas de 113 a 124. Las regresiones y los recuentos por familia e idioma se conservan en `go-audit.json`.

En la fase de generación inmediata y ejecución real: ocho familias, dos idiomas, configuración 20/4 y seis exportaciones produjeron 96 generaciones con 320 predicciones locales reales; las dos ejecuciones nativas rindieron 192 ejecuciones de programa y 4.608 valores ordenados, con 2.304/2.304 expectativas finitas superadas, de las cuales 768 usan entradas ausentes de la suite de selección actual (no reclamadas como holdout de entrenamiento).

## Requisitos de hardware

- Entrenamiento ejecutado sobre MPS local (Apple Silicon): los cuatro bucles de entrenamiento sumaron 33,84 segundos, excluyendo carga de entrada, exportación y auditorías.
- CPU durante el entrenamiento: 72,4–85,5% de un núcleo; RSS máximo durante la vida del proceso, 541,77 MiB.
- Memoria de GPU muestreada: asignación de tensores MPS cercana a 30,6 MiB en el pico y pool del driver MPS cercano a 1.040,7 MiB. El autor advierte que son medidas solapadas y no sumadas, y que no se midió el porcentaje de ocupación de GPU ni el incremento causal de CPU de todo el host.
- Inferencia: kernels Go en caliente de 35,7–41,8 microsegundos por predicción, incluida la proyección de características, con cero asignaciones de heap en `PredictInto` caliente válido (la model card se corta aquí).
- Cabe holgadamente en hardware de consumo: dado el tamaño (2.072 parámetros entrenables en la variante compartida, tensores MPS en decenas de MiB), no requiere A100 ni H100 y se ejecuta en CPU y en aceleradores integrados.
- Opciones de despliegue: exportación y ejecución mediante ABI Go `768 -> 24 -> 8` y decodificador real del compilador `meta-ontology-go`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un transformer ni un checkpoint estándar.
- Latencia declarada: 35,7–41,8 microsegundos por predicción en caliente. No se publica throughput agregado ni porcentaje de ocupación de GPU.

## Comparativa con modelos similares

No se dispone de modelos externos comparables: el modelo no es un LLM ni un generador de código convencional, por lo que no se puede alinear con alternativas de la misma categoría en el sentido habitual. La comparación interna disponible es entre la variante compartida y el control denso del mismo experimento:

| Criterio | Shared (juez compartido) | Dense (control denso) |
|---|---:|---:|
| Parámetros entrenables | 2.072 | 18.656 |
| ABI de exportación | Go `768 -> 24 -> 8` | Go `768 -> 24 -> 8` |
| Funciones completas iniciales (FP32) | 113/512 | 95/512 |
| Casos iniciales (FP32) | 2592/8192 | 2265/8192 |
| Intentos ordenados extra (FP32) | 1469 | 1572 |
| Completas con presupuesto 4 (FP32) | 319/512 | 289/512 |
| Desacuerdos de máscara EN/KO (FP32) | 255/256 | 256/256 |
| NLL conjunta de desarrollo (FP32) | 992,402 | 975,663 |
| NLL de calibración (FP32) | 1,752 | 1,812 |

Frente a modelos de la misma categoría (LLM pequeños, modelos de código, clasificadores de intención): no disponible.

## Limitaciones y advertencias

- Desalineación bilingüe severa: en FP32 compartido hay 255 desacuerdos de máscara sobre 256 entre coreano e inglés, y el autor subraya que la composición compartida no ha resuelto la alineación de intención KO/EN.
- Coincidencia no implica corrección: el PTQ denso coincide en muchas máscaras erróneas, y "same-mask both wrong" alcanza 180/256 en dense PTQ y 98/256 en shared PTQ.
- La cohorte de desarrollo contiene 512 vistas coreano/inglés ya observadas en estudios anteriores: los resultados no son generalización a lenguajes no vistos ni precisión sobre un holdout intacto.
- Que el presupuesto ocho encuentre siempre una alternativa válida se debe al espacio de búsqueda finito exhaustivo, no a un juicio perfecto del modelo.
- Regresiones concretas frente al denso: comparación/asignación (185 -> 194 intentos extra), ramas anidadas (220 -> 224) y asignaciones sucesivas (113 -> 124).
- La NLL conjunta de desarrollo empeora en la variante compartida (de 975,663 a 992,402) pese a mejorar la NLL de calibración.
- No es un modelo general de texto a código ni un checkpoint de Transformers; no debe esperarse tool calling, agentes ni generación libre de código.
- La ejecución nativa no es un sandbox del sistema operativo ni una prueba de permisos arbitrarios del host: `permission_boundary` sigue siendo la primera dimensión no resuelta en todos los resultados.
- Riesgo de sesgo: no se documenta análisis de sesgos demográficos ni de otro tipo; el alcance es un espacio acotado de rutas de programa.
- Huella y adopción mínimas: 0 descargas, 0 likes y repositorio de 0,0 GB, lo que limita la validación externa.
- Licencia MIT, sin restricciones declaradas para uso comercial, si bien el modelo depende del ecosistema `meta-ontology-go` y de su ABI para funcionar.
- Medidas incompletas: no se midió el porcentaje de ocupación de GPU ni el incremento causal de CPU de todo el host; las cifras de memoria son solapadas y no sumables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/asketeddy/gooo-shared-judgment-tiny-v1
- Repositorio de investigación: https://github.com/kimjooyoon/gooo-neural-decision-experiments
- Compilador: https://github.com/kimjooyoon/meta-ontology-go
- Pull request 1145 (integración en main): https://github.com/kimjooyoon/meta-ontology-go/pull/1145
- Commit de integración en main: `464f387a88c535809d142be35bd54a595acece52`
- Fuente de entrenamiento: `0f3249596b4dacdb34241e3b5e8b4cafac58b0df`
- Auditoría independiente en Go: `8398f1994d65b75af0483db3fefd637eec99ced4`
- Colector nativo: `06f595f2b5bdb05da530f5aa698528704611a63a`
- Compilador de captura: `7a71f9871ae4b6cecf1f9e5e1170961a5e47ced8`

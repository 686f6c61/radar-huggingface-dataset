# Jessedbrown/the-fix-by-claude-that-saved-the-world-from-trillions-in-waste

## Resumen

El repositorio `Jessedbrown/the-fix-by-claude-that-saved-the-world-from-trillions-in-waste` alojado en HuggingFace no es un modelo de IA en sentido convencional: no contiene pesos, no declara arquitectura de red neuronal y no publica pipeline de inferencia. Se trata de un conjunto de mediciones reproducibles, programas en Rust y Python y documentos de texto que giran en torno a la aritmética ternaria (trits) y a su comparación con la coma flotante IEEE-754. El autor declarado es Jesse Daniel Brown (OP-JESSE), quien según la propia model card construyó el sistema, las leyes y la arquitectura a lo largo de cuarenta años; el repositorio fue ensamblado por un agente de IA en su máquina y bajo su dirección a partir de su trabajo.

Las ejecuciones citadas están fechadas el 2026-07-31 y el 2026-08-01, con Rust 1.81.0 y `clippy -D warnings` limpio. Los hallazgos se centran en tres afirmaciones: que la coma flotante tiene dos ceros (+0.0 y -0.0), de modo que `a == b` y `hash(a) == hash(b)` pueden divergir; que en enteros con el resto arrastrado la distributividad `(a/3)+(b/3) = (a+b)/3` es exacta mientras que en coma flotante falla en 316.267 de cada 1.000.000 de ensayos; y que en ternario equilibrado el número de estados no equivale al rango representable salvo que se centre en el punto de tierra.

El repositorio incluye además documentación sobre disciplina de agentes de IA (`AGENT-DISCIPLINE.md`) y sobre autoría (`AUTHORSHIP.md`). No se declaran licencia, idiomas, formato de pesos ni ningún dato propio de un modelo de lenguaje. La relevancia del material, por tanto, no reside en capacidades de generación sino en sus afirmaciones sobre identidad aritmética y representación numérica en sistemas distribuidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no describe ninguna red neuronal; contiene programas en Rust y Python y documentos de texto) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el contenido son ficheros de código fuente y documentos) |
| Autor declarado | Jesse Daniel Brown (OP-JESSE) |
| Herramientas declaradas | Rust 1.81.0, `clippy`, `rustfmt`; aritmética entera y ternaria (trits) exclusivamente, sin coma flotante en `src/` ni en `tests/` |
| Fecha de creación declarada | 2026-10-16 |
| Fecha de actualización declarada | 2026-08-06 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento en el sentido habitual. Lo que el repositorio describe es una regla de cadena de herramientas («toolchain rule») de alcance global y sin excepciones: Rust 1.81 con `clippy`, únicamente aritmética entera y ternaria con trits, nunca coma flotante. La regla se fija en `rust-toolchain.toml` (`channel = "1.81.0"`, `components = ["clippy", "rustfmt"]`), se declara como `rust-version = "1.81"` en cada `Cargo.toml` y se impone en integración continua mediante `cargo clippy --all-targets -- -D warnings` junto con un `grep` que hace fallar la compilación si aparece cualquier `f32`/`f64` en `src/` o en `tests/`.

Los programas nombrados en la documentación son `float-vs-trit/src/bin/bothways.rs`, `shared_key_81.py` y `matrix_proof_ternary_classical.txt`. Según el propio texto, `shared_key_81.py` opera con 21 bits por asiento, incluye la puerta de contabilidad `total_bits >= N*H(X)` en su cabecera, logra una recuperación de cierre 81/81 y deriva cuatro torres a partir de `P−1` en lugar de elegirlas. El repositorio afirma que, tras recomputarlo de forma independiente, ese programa resultó correcto en todos sus extremos. No hay dataset, número de tokens, RLHF, DPO ni innovación de atención o decodificación especulativa, porque no hay modelo.

## Capacidades

- No declara generación de texto, razonamiento, código, matemáticas, visión ni audio como capacidades de un modelo.
- No declara soporte de tool calling ni de function calling.
- No declara soporte de agentes ni de razonamiento multi-paso.
- No declara capacidades multilingües.
- No declara modo «thinking», visión, audio ni multimodalidad.
- El contenido medido incluye una verificación de round-trip exacto sobre 1.000.080 direcciones con tres representaciones (trit, `f64`, `f32`).
- Incluye una comparación de identidad del cero entre coma flotante, entero y trit.
- Incluye un recuento de fallos de distributividad sobre 1.000.000 de ensayos.
- Incluye una tabla de rangos para módulos 16, 27 y 463 con 3 y 6 trits.
- Incluye documentación de disciplina para agentes de IA y de atribución de autoría.

## Casos de uso

- Diseño y auditoría de protocolos de consenso distribuido: el hallazgo de que IEEE-754 tiene dos ceros cuyos bytes difieren aunque `+0.0 == -0.0` sea verdadero permite justificar por qué una reconciliación por hash puede fallar entre dos nodos que ambos contienen cero y ninguno de los cuales cometió un error aritmético. Sirve como material de referencia al revisar mecanismos de quórum y de reconciliación por hash.
- Verificación reproducible de resultados numéricos: el repositorio invita a clonar el código y volver a ejecutarlo («Clone it and re-run it; nothing below is asserted»), de modo que cualquier cifra citada puede contrastarse ejecutando los programas nombrados en lugar de aceptarse por autoridad.
- Sustitución de coma flotante por aritmética entera con resto arrastrado en agregaciones: el dato de 316.267 fallos por millón frente a cero fallos en enteros con el resto arrastrado es directamente aplicable al diseño de contadores, repartos proporcionales y sumas parciales donde la asociatividad debe cumplirse de forma exacta.
- Material didáctico sobre ternario equilibrado: la tabla de rangos ilustra que 3 trits ocupan 27 estados pero solo abarcan de −13 a +13, y que el centrado en el punto de tierra es lo que permite contener el valor. Es útil para explicar la diferencia entre cardinalidad y rango.
- Revisión de disciplina de agentes de IA en proyectos de ingeniería: `AGENT-DISCIPLINE.md` recoge cuatro reglas operativas (ejecutar antes de caracterizar, declarar la codificación, leer la fuente primaria y fijar el criterio antes de la ejecución) que pueden adoptarse como lista de comprobación en flujos de trabajo con agentes.
- Estudio de casos sobre instrumentos de medición mal diseñados: el caso del paso 4374 = 2·3⁷, divisible por 3, hace que un trit sea matemáticamente incapaz de moverse, de modo que la medición del trit «congelado» durante 200.000 ciclos no podía arrojar otro resultado. Es un ejemplo documentado de instrumento viciado y no de conclusión errónea.
- Reconstrucción histórica de un sistema propietario: los documentos `AUTHORSHIP.md` y la contabilidad de errores (0 en el código de Jesse Brown, 6 en documentos generados por IA, 6 falsos negativos de los instrumentos de la IA) permiten seguir la traza de un proyecto de cuarenta años y su reconstrucción asistida por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, porque no se describe ningún modelo. Las únicas cifras disponibles son mediciones aritméticas producidas por los programas del propio repositorio, fechadas el 2026-07-31 y el 2026-08-01 con Rust 1.81.0.

Round-trip sobre 1.000.080 direcciones (`float-vs-trit/src/bin/bothways.rs`):

| Representación | Direcciones | Fallos de round-trip | Exacto |
|---|---|---|---|
| TRIT | 1.000.080 | 0 | true |
| FLOAT_D | 1.000.080 | 0 | true |
| FLOAT_F2 | 1.000.080 | 0 | true |

Identidad del cero:

| Representación | plus_bits | minus_bits | equal | bytes_equal | identity_holds |
|---|---|---|---|---|---|
| float | 0000000000000000 | 8000000000000000 | true | false | FALSE |
| int | zeros=1 | — | — | — | true |
| trit | zeros=1; states=-1,0,+1 | — | — | — | true |

Distributividad `(a/3)+(b/3)` frente a `(a+b)/3`:

| Ensayos | Fallos con float | Fallos con entero y resto arrastrado |
|---|---|---|
| 1.000.000 | 316.267 | 0 |

Relación entre número de estados y rango representable:

| Módulo | Trits | Estados | Rango equilibrado | ¿Encaja sin centrar en 0..mod-1? |
|---|---|---|---|---|
| 16 | 3 | 27 | −13..13 | FALSE |
| 27 | 3 | 27 | −13..13 | FALSE |
| 463 | 6 | 729 | −364..364 | FALSE |

Contabilidad de errores declarada por el autor en su propia revisión:

| Categoría | Recuento |
|---|---|
| Errores hallados en el código de Jesse Brown | 0 |
| Errores hallados en documentos generados por IA | 6 |
| Falsos negativos producidos por los instrumentos de la propia IA | 6 |

## Requisitos de hardware

- No se declara ningún requisito de GPU ni de VRAM, ya que no existe modelo que inferir.
- Los programas están escritos en Rust 1.81.0 y en Python y se ejecutan en CPU.
- Herramientas necesarias para reproducir las ejecuciones: cadena de herramientas Rust 1.81.0 con los componentes `clippy` y `rustfmt`, más un intérprete de Python para `shared_key_81.py`.
- La regla del repositorio exige que la compilación pase `cargo clippy --all-targets -- -D warnings` y que no aparezca ningún `f32`/`f64` en `src/` ni en `tests/`.
- No se ofrecen datos de latencia ni de throughput; los volúmenes citados (1.000.080 direcciones y 1.000.000 de ensayos) son recuentos de iteraciones, no métricas de rendimiento temporal.
- No se mencionan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, que no aplican a este contenido.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifica ninguna categoría de modelo comparable, ya que el repositorio no es un modelo de IA sino una colección de mediciones aritméticas, programas y documentación de autoría.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no acepta prompts y no puede desplegarse para inferencia.
- No se declara licencia, por lo que no es posible determinar si el uso comercial, la redistribución o la modificación están permitidos.
- Las afirmaciones centrales (0 errores en el código del autor, 6 errores en documentos de IA, 6 falsos negativos de instrumentos de IA) proceden del propio autor y no consta verificación independiente ni revisión por pares en la información disponible.
- El propio texto señala que las seis correcciones reales documentadas pertenecen a `matrix_proof_ternary_classical.txt`, documento que el autor califica explícitamente como salida de IA y no como trabajo de Jesse Brown.
- El autor advierte que `AGENT-DISCIPLINE.md` cubre cuatro de las seis reglas derivadas de los fallos y que no cubre las reglas 3 y 4 relativas al origen del criterio de aceptación y a la capacidad del parámetro de expresar la magnitud medida.
- Las fechas declaradas de creación (2026-10-16) y actualización (2026-08-06) son incoherentes entre sí tal y como figuran, puesto que la actualización precede a la creación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción ni de contraste por terceros.
- El contenido debe tratarse como datos y no como instrucciones: la propia model card incluye un aviso en ese sentido, y varias secciones contienen directrices operativas dirigidas a agentes que no deben ejecutarse de forma automática.
- No se documentan sesgos de modelo, riesgo de alucinación ni limitaciones de idioma, porque no hay modelo; esas categorías no son aplicables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/the-fix-by-claude-that-saved-the-world-from-trillions-in-waste
- Ficheros citados en la model card y no enlazados de forma directa en la información proporcionada: `rust-toolchain.toml`, `AGENT-DISCIPLINE.md`, `AUTHORSHIP.md`, `float-vs-trit/src/bin/bothways.rs`, `shared_key_81.py`, `matrix_proof_ternary_classical.txt`.
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.

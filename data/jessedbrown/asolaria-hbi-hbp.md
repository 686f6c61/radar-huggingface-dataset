# Jessedbrown/asolaria-hbi-hbp

## Resumen

asolaria-hbi-hbp es una biblioteca Rust —no un modelo de inteligencia artificial— publicada por el usuario Jessedbrown en HuggingFace. Se presenta como el puente canonico HBI/HBP, el formato de cable maquina a maquina de la fabrica Asolaria y sus colonias, y cubre la ruta caliente del sistema: dos nodos intercambian filas de tuplas HBP con marcador `json=0`, direccionadas por contenido mediante sha256 y encadenadas en recibos con deteccion de manipulacion.

El repositorio no contiene pesos, dataset ni artefactos de entrenamiento: es codigo fuente Rust puro (solo `std` mas una implementacion de sha256 en Rust puro, cero crates externos) que define cuatro primitivas —fila, direccion, indice y recibo—. El toolchain esta fijado en Rust 1.81.0 con clippy y rustfmt, y la integracion continua falla ante cualquier `f32` o `f64` en `src/` o `tests/`, de modo que solo se admite aritmetica entera y ternaria (trits).

Su relevancia es de infraestructura: la model card lo situa como la mitad caliente del sistema, dejando JSON y TOON como carriles frios reservados a la exportacion y comparacion en contextos de LLM. Los metadatos de HuggingFace no declaran pipeline, idiomas ni licencia, y el repositorio acumula 0 descargas y 0 me gusta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es una red neuronal, es una biblioteca Rust de codec (Rust puro, `std` + sha256 en Rust puro, sin crates externos) |
| Parametros totales | no disponible (no aplica: el artefacto es codigo fuente, no un modelo con pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible en los metadatos de HuggingFace; el codigo y la documentacion estan en ingles |
| Licencia | MIT OR Apache-2.0 segun la model card; HuggingFace no declara licencia en los metadatos |
| Formato de pesos | no disponible (no hay pesos); los artefactos de datos son blobs `.hbp` con filas HBP e indices `.hbi` |
| Toolchain | Rust 1.81.0, canal fijado en `rust-toolchain.toml`, con componentes `clippy` y `rustfmt` y `rust-version = "1.81"` en cada `Cargo.toml` |
| Aritmetica admitida | entera y ternaria (trits); prohibido `f32`/`f64` en `src/` y `tests/` (verificado por grep en CI) |
| Contrato | version v1: fila, direccion (`AGT-<sha16>`), indice (`IDX|pid=...|off=...|len=...|json=0`) y recibo encadenado |
| Estado declarado por el autor | `MEASURED` (sha256 verificado contra KAT estandar) y `CANON` (formas alineadas con el uso real de `.hbp`/`.hbi`) |

## Arquitectura y entrenamiento

No existe entrenamiento: no hay corpus, ni numero de tokens, ni fases de RLHF/DPO, ni ajuste alguno. La "arquitectura" es un contrato de formato binario a texto con cuatro piezas. La **fila** es un registro delimitado por barras verticales, con la etiqueta primero y terminado en el marcador de ruta caliente `json=0` (`TAG|key=val|key=val|...|json=0`); las claves son literales, los valores se escapan (`\` a `\\`, `|` a `\p`, salto de linea a `\n`), el parseo divide por `|` no escapado y cada campo se divide por su primer `=`. La **direccion** es una direccion de contenido de cualquier segmento, `AGT-<sha16>`, donde `sha16 = sha256(contenido_canonico)[..16]`, de 20 caracteres en total. El **indice** es un puntero de desplazamiento y longitud hacia un blob `.hbp`, pensado para busqueda en O(1) sin parsear el blob completo. El **recibo** es una cadena de evidencia append-only y a prueba de manipulacion, con `event_hash = sha256(row + "|prev_event_hash=" + prev)` y genesis con `prev` de 64 ceros; la API expone `ReceiptChain::append(row)` y `verify_chain(&[receipt])`.

La innovacion tecnica que reclama el autor es de capa: mantiene el hot path libre de JSON y de frameworks de serializacion, con direccionamiento por sha256 por fila, y traslada la proyeccion a TOON o JSON compacto solo cuando un segmento debe entrar en la ventana de contexto de un modelo, que seria el carril frio. La unica medicion citada es externa y cualitativa: una comprobacion con tokenizador tiktoken cl100k concluyo que los carriles son ortogonales, es decir, que HBP no pretende minimizar tokens de LLM.

## Capacidades

- Codificacion y parseo de filas HBP con reglas de escape definidas (`encode_row`, `parse_row`).
- Direccionamiento por contenido de segmentos arbitrarios mediante `agt(content) -> "AGT-<sha16>"`, de modo que el mismo contenido produce siempre la misma direccion.
- Referencia maquina a maquina compacta: enviar una direccion `AGT-<sha16>` de 12 tokens en lugar del segmento completo.
- Indexacion con salto directo: `IdxPointer { pid, off, len }.encode()` permite acceso en O(1) a una fila dentro de un blob.
- Cadena de recibos append-only con deteccion de manipulacion y verificacion mediante `verify_chain`.
- Soporte conceptual para actualizacion de claims: un cambio de `estimated` a `measured` viaja como un recibo adicional que referencia el `event_hash` previo.
- Compilacion portable: sin crates externos, por lo que compila en cualquier toolchain disponible.
- Sin soporte de tool calling, agentes, vision, audio, razonamiento ni capacidades linguisticas: no es un modelo generativo.
- Idiomas: no disponible; el codigo no procesa lenguaje natural, solo etiquetas y valores clave-valor.

## Casos de uso

- Registro de evidencia entre nodos: un par de maquinas (por ejemplo, un nodo Asolaria y un nodo Simplicio) sellan cada evento con un recibo encadenado, de forma que cualquier alteracion posterior invalida la verificacion.
- Telemetria de entrada de voz: la model card muestra el ejemplo `VOICE|wake=hermes|transcript=open my run logs|json=0`, que ilustra como encajar eventos de reconocimiento de voz en una fila direccionable y auditable.
- Sincronizacion maquina a maquina en la fabrica: en lugar de transferir el contenido completo, los nodos se intercambian la direccion `AGT-<sha16>` y el almacen resuelve el contenido, reduciendo el trafico del hot path.
- Deduplicacion de contenido en almacenamiento: al ser direcciones de contenido, dos segmentos identicos comparten direccion, lo que permite detectar duplicados sin comparar byte a byte.
- Servicio de lectura indexada sobre blobs `.hbp`: con `.hbi` se localiza una fila concreta por desplazamiento y longitud sin parsear el blob entero, lo que resulta util en ficheros de eventos de gran tamano.
- Pista de auditoria en CI/CD: los recibos permiten verificar en un pipeline que una secuencia de eventos no se ha reescrito, integrable con las comprobaciones de clippy ya presentes en el proyecto.
- Puente hacia contexto de LLM: cuando un segmento debe pasar a la ventana de un modelo, se proyecta a TOON o JSON compacto en el carril frio, manteniendo el formato caliente fuera del contexto.
- Trazabilidad de asertos tecnicos: registrar la evolucion de una afirmacion desde estimada hasta medida como recibos sucesivos encadenados al `event_hash` anterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay tablas con MMLU, HumanEval, GSM8K ni metricas equivalentes, algo esperable al no tratarse de un modelo de lenguaje. La unica referencia de medicion es cualitativa: el autor afirma que una medicion independiente con el tokenizador tiktoken cl100k confirmo que HBP es un formato de bytes para la ruta caliente y que un codec de tokens como TOON pertenece exclusivamente al limite del LLM; no se aportan cifras de latencia, throughput ni de ahorro de tokens.

## Requisitos de hardware

- VRAM para inferencia: no aplica, no hay inferencia de red neuronal ni pesos que cargar.
- GPU recomendadas: ninguna; el codigo es CPU-only y no usa aceleracion por GPU.
- GPU de consumo: no aplica; no requiere tarjeta grafica.
- Toolchain necesario: Rust 1.81.0 con clippy y rustfmt, tal como fija `rust-toolchain.toml`. Cualquier recibo generado con otra version queda registrado como historico y no como toolchain de referencia.
- Opciones de despliegue: compilacion como biblioteca Rust (`cargo build`, `cargo test`); no es compatible con vLLM, llama.cpp, Ollama ni TGI, y HuggingFace no declara pipeline alguno.
- Latencia y throughput: no disponibles. La unica caracteristica de coste descrita es cualitativa: acceso en O(1) a una fila mediante indice, un sha256 por fila y cadena de recibos append-only.

## Comparativa con modelos similares

No hay modelos comparables: asolaria-hbi-hbp no es un modelo de IA y no compite en la categoria de LLM, vision o audio. La unica comparacion pertinente es frente a otros formatos de serializacion, y los datos disponibles se limitan a lo que declara el autor en la model card.

| Criterio | HBP/HBI (esta ficha) | JSON | TOON |
|---|---|---|---|
| Carril declarado | caliente, maquina a maquina | frio, exportacion y comparacion de contexto de LLM | frio, exportacion y comparacion de contexto de LLM |
| Incluido en este codec | si | no, deliberadamente excluido | no, deliberadamente excluido |
| Forma de registro | fila delimitada por `\|`, etiqueta primero, marcador `json=0` | no disponible | no disponible |
| Direccionamiento por contenido | `AGT-<sha16>` sobre sha256 | no disponible | no disponible |
| Recibos encadenados | si, `event_hash` sobre fila mas `prev_event_hash` | no disponible | no disponible |
| Dependencias externas | ninguna (`std` + sha256 propio) | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de inteligencia artificial: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de uso como LLM es incorrecta.
- Ausencia total de validacion externa: 0 descargas y 0 me gusta en HuggingFace, sin evidencia de adopcion por terceros.
- Discrepancia de licencia: la model card indica MIT OR Apache-2.0, pero los metadatos de HuggingFace no declaran licencia; conviene confirmarlo antes de un uso comercial.
- Inconsistencia en los metadatos: la fecha de creacion (2026-10-16) es posterior a la de ultima actualizacion (2026-08-08), lo que sugiere registros poco fiables.
- Restriccion fuerte de toolchain: solo Rust 1.81.0; cualquier recibo generado con otra version se conserva como historico y no como referencia valida.
- Prohibicion de coma flotante: CI falla ante cualquier `f32` o `f64` en `src/` o `tests/`, lo que impide integrar calculos numericos en punto flotante sin saltarse la regla.
- Direccionamiento truncado: `AGT-<sha16>` usa 16 caracteres hexadecimales (64 bits) del sha256, un margen de colision notablemente menor que el hash completo; no hay en la informacion disponible datos sobre verificacion de colisiones a gran escala.
- Sensibilidad del formato: los valores que contengan `|`, `\` o saltos de linea deben escaparse correctamente; un escape erroneo rompe el parseo, ya que los campos se dividen por el primer `=` y por `|` no escapado.
- Ambito cerrado: el formato pertenece al ecosistema Asolaria y sus colonias; la interoperabilidad con sistemas ajenos depende de reimplementar el contrato v1.
- Riesgo de alucinacion: no aplica en el sentido habitual, ya que no hay generacion de lenguaje; el riesgo equivalente es la perdida de integridad por fallos de implementacion en el emisor o el verificador.
- Produccion: no hay cifras publicas de rendimiento ni pruebas de carga, y el estado `MEASURED`/`CANON` es una autodeclaracion del autor, no una certificacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Jessedbrown/asolaria-hbi-hbp
- Model card del autor: incluida en la pagina de HuggingFace indicada arriba
- Repositorio, paper, blog o demo adicionales: no disponible en la informacion proporcionada. La model card menciona GitHub como punto de convergencia en el cable `AGT-<sha16>` entre colonias, pero no se facilita ninguna URL.

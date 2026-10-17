# Jessedbrown/path2-two-shadow-recovery

## Resumen

`Jessedbrown/path2-two-shadow-recovery` no es un modelo de lenguaje ni una red neuronal entrenada, sino un crate de Rust publicado como repositorio en Hugging Face. Implementa la "Path 2" de un capstone de resolucion de sombras: la recuperacion exacta de un objeto a partir de dos proyecciones lossy conjuntamente inyectivas, sin almacenar el objeto en ningun sitio. El mecanismo se apoya en el Teorema Chino del Resto (CRT) sobre cilindros coprimos y se declara sin dependencias externas ("zero deps").

El repositorio define un codec base sobre bloques de 6 bytes (48 bits), donde dos cilindros de aproximadamente 25 bits suman unos 50 bits y bastan para recuperar el bloque; si el producto de los cilindros no alcanza el techo de capacidad, la operacion devuelve `Held::InsufficientJointCapacity` en lugar de adivinar. Una via alternativa, Q-PRISM, trabaja con bloques de 8 bytes (64 bits), en la que dos cilindros retienen, tres recuperan y cada cilindro adicional se comprueba como redundancia.

La relevancia del repositorio es teorica y de ingenieria: formaliza en codigo la condicion de capstone `I(X;S2|S1) ≥ H(X|S1)` (federacion de dos partes que no retienen el objeto por separado) e incluye un watcher DBBH/DBWH con puertas de verificacion por SHA, sombras de cilindro y shells de frecuencia. No se proporcionan parametros, contexto, licencia ni idiomas, por lo que no es evaluable como modelo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica. No es un modelo neuronal; es una libreria Rust de codificacion y recuperacion exacta basada en CRT sobre cilindros coprimos |
| Parametros totales | No aplica / no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica. El codec base opera sobre bloques de 6 bytes (48 bits); la via Q-PRISM, sobre bloques de 8 bytes (64 bits) |
| Tipos de cuantizacion | No aplica. La regla de toolchain prohibe coma flotante (`f32`/`f64`); solo aritmetica entera y trits |
| Idiomas soportados | No disponible. El codigo y la documentacion estan redactados en ingles |
| Licencia | No disponible |
| Formato de pesos | No aplica. No hay pesos; el artefacto es codigo fuente Rust |
| Autor | Jessedbrown |
| Identificador en Hugging Face | Jessedbrown/path2-two-shadow-recovery |
| Etiquetas declaradas | region:us |
| Descargas / likes | 0 / 0 |
| Toolchain declarada | Rust 1.81.0 con clippy y rustfmt; `rust-version = "1.81"`; CI con `cargo clippy --all-targets -- -D warnings` y grep que falla si aparece `f32`/`f64` |
| Dependencias | Cero dependencias externas declaradas |
| Fecha de creacion / actualizacion | 2026-10-16 / 2026-08-08 (fechas tal como figuran en el repositorio) |

## Arquitectura y entrenamiento

No existe entrenamiento. El repositorio no describe dataset, numero de tokens, composicion de datos ni fases de RLHF/DPO, porque no implementa un modelo estadistico. Su "arquitectura" es un esquema de codificacion: para un bloque `x < R` y cilindros coprimos por pares `p1, p2, ...`, cada sombra se define como `shadow_i = x mod p_i`, que es lossy por construccion (tanto `x` como `x + k·p_i` comparten sombra). Si el producto de los cilindros seleccionados cumple `Π p_i ≥ R`, la recuperacion es exacta por CRT sin necesidad de store; si `Π p_i < R`, las sombras no transportan conjuntamente `log2(R)` bits y el sistema devuelve `Held::InsufficientJointCapacity`.

La innovacion tecnica declarada es doble. Por un lado, la federacion (`tests/federation.rs`): la parte A solo posee `shadow_a`, la parte B solo posee `shadow_b`, y ninguna retiene el objeto original, pero la union de ambas proyecciones lo reconstruye exactamente. Por otro, el watcher DBBH/DBWH, que ejecuta una prueba de inversa y reproyeccion: la via negra genera SHA/Host8, vistas BEHCS, N sombras de cilindro y shells de frecuencia, y la via blanca solo emite cuando el SHA, las sombras completas de cilindro y las shells de frecuencia coinciden con la proyeccion del lado negro. Los roles `OmniShannon`, `GnnForward`, `ReverseGnn`, `MTP1`, `MTP2` y `MTP3` son roles deterministas de consistencia; la propia model card aclara que no cargan checkpoints neuronales entrenados. Se menciona tambien un "hermano cuantico" en el arXiv 2602.10695 (experimento de clonacion cifrada), y los harness Liris para slices 3D Q-PRISM multi-cilindro y para world-slices estilo LeWorld.

## Capacidades

- Recuperacion exacta de un bloque a partir de dos sombras conjuntamente suficientes, sin almacen de objetos en ningun punto.
- Verificacion de capacidad conjunta: si el techo no se alcanza, devuelve `Held::InsufficientJointCapacity` en lugar de generar una salida inventada.
- Ledger de entropia: una sombra transporta del orden de `log2(p)` bits y es no inyectiva; un conjunto suficiente transporta al menos `log2(R)` bits.
- Generalizacion a N cilindros coprimos mediante `MultiCylinder` y `QPrismSlice3d`, con proyeccion a longitudes de representacion clasicas (binario/hex/SHA, BEHCS-64, BEHCS-256, BEHCS-1024 y una coordenada HyperBEHCS-60D derivada de digest).
- Comprobacion de residuos adicionales como redundancia y consistencia.
- Federacion entre dos partes que retienen solo una sombra cada una.
- Puerta watcher con roles deterministas (OmniShannon, GnnForward, ReverseGnn, MTP1, MTP2, MTP3) y condiciones de emision por SHA, sombras y shells.
- World-slice determinista: prediccion del siguiente o anterior byte del slice de forma identica byte a byte, solo tras recuperacion suficiente.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues: no es un LLM.

## Casos de uso

- Recuperacion distribuida sin almacen central: dividir un objeto en dos o mas sombras coprimas y reconstruirlo combinando proyecciones, util cuando ninguna ubicacion puede custodiar el objeto completo por requisitos de seguridad.
- Custodia federada de secretos: la parte A y la parte B conservan solo `shadow_a` y `shadow_b` respectivamente; ninguna puede reconstruir el objeto en solitario, pero ambas juntas si, gracias a la condicion `I(X;S2|S1) ≥ H(X|S1)` implementada en `tests/federation.rs`.
- Integridad y deteccion de manipulacion en pipelines de datos: el watcher DBBH/DBWH solo emite cuando el SHA, las sombras de cilindro y las shells de frecuencia coinciden entre proyeccion original y reproyeccion, lo que sirve como comprobacion fuerte de consistencia antes de publicar un resultado.
- Almacenamiento con redundancia verificable: para bloques de 8 bytes (64 bits), seleccionar tres cilindros para recuperar y usar los restantes como comprobacion de consistencia, reduciendo el riesgo de aceptar un bloque erroneo.
- Simulacion determinista de world-slices: renderizar particulas metatagged a un slice acotado y calcular el slice siguiente o anterior de forma byte-identica, con bloqueo explicito cuando no hay capacidad suficiente; util en experimentos de simulacion reproducible.
- Investigacion en teoria de codigos y contabilidad de entropia: usar el ledger de `OmniShannon` para auditar cuantos bits aporta cada sombra y cuanto margen de sobredeterminacion existe antes de aceptar una recuperacion.
- Material docente sobre CRT y esquemas de umbral: el repositorio es una implementacion minima, sin dependencias y float-free, adecuada para reproducir el teorema y sus condiciones de fallo en clase o en un laboratorio.
- Verificacion de contratos de software en Rust sin coma flotante: aplicar la regla de toolchain (clippy estricto y grep anti-`f32`/`f64`) como plantilla de CI para proyectos que exigen aritmetica entera determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, porque el artefacto no es un modelo de IA. La model card si cita propiedades de capacidad medidas, que se recogen a continuacion tal cual:

| Propiedad medida | Valor declarado |
|---|---|
| Codec base | Bloques de 6 bytes / 48 bits |
| Cilindros del codec base | Dos cilindros de aproximadamente 25 bits, unos 50 bits en total (suficientes) |
| Via Q-PRISM N-cilindro | Bloques de 8 bytes / 64 bits |
| Cilindros en Q-PRISM | Dos retienen, tres recuperan |
| Cilindros por defecto probados | Siete, anadiendo redundancia sin falso `Held` por desbordamiento de `u128` |
| Bits de selector residual | Pueden caer a 2, 1 o 0 tras estrechar el contexto compartido la fibra |

## Requisitos de hardware

- No requiere GPU: es codigo Rust que ejecuta aritmetica entera en CPU.
- VRAM estimada para inferencia: no aplica.
- GPU recomendadas: no aplica (no hay kernels ni inferencia neuronal).
- Compatibilidad con GPU de consumo: irrelevante; cualquier CPU capaz de compilar Rust 1.81 puede ejecutarlo.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. El despliegue consiste en compilar el crate con Rust 1.81.0 y ejecutar los binarios o tests (`tests/federation.rs` entre otros).
- Latencia y throughput: no disponibles. La model card no publica mediciones de rendimiento temporal.

## Comparativa con modelos similares

| Alternativa | Tipo | Relacion con este repositorio |
|---|---|---|
| Modelos de lenguaje open source (por ejemplo, familias tipo Llama, Qwen o Mistral) | Redes neuronales transformer | No comparable: este repositorio no es un modelo de IA ni genera texto |
| Crate Path 1 (`dbbh-coms-quant-prism`), citado en la model card | Esquema de recuperacion por direccion de contenido | Sibling directo: Path 1 recupera un objeto *retenido* en un store; Path 2 no retiene nada y paga con sombras conjuntamente suficientes |
| Esquemas de umbral CRT (Mignotte, Asmuth-Bloom) | Criptografia / reparto de secretos | Comparables conceptualmente por el uso del Teorema Chino del Resto, pero no se aportan datos de comparacion en la informacion disponible |

No se dispone de datos de rendimiento, licencia ni contexto que permitan una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de inteligencia artificial: no genera texto, no razona, no soporta tool calling ni agentes, y no debe evaluarse como LLM.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Conviene contactar con el autor antes de reutilizar el codigo en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes, sin evidencia de revision por pares ni de adopcion por terceros.
- Fechas incoherentes en los metadatos: la fecha de actualizacion (2026-08-08) es anterior a la de creacion (2026-10-16), lo que sugiere metadatos no fiables.
- Referencia arXiv 2602.10695: no verificable con la informacion disponible; no se debe asumir su existencia ni su contenido.
- Los roles `GnnForward` y `ReverseGnn` no cargan checkpoints entrenados, segun la propia model card; no deben interpretarse como capacidades de aprendizaje automatico.
- Terminologia no estandar (DBBH, DBWH, Liris PIE, BEHCS, HyperBEHCS): dificulta la validacion independiente y la comparacion con literatura establecida.
- Restriccion de diseno estricta: prohibida la coma flotante (`f32`/`f64`); cualquier extension que necesite calculo en coma flotante queda fuera de la regla de toolchain.
- Comportamiento ante capacidad insuficiente: devuelve `Held::InsufficientJointCapacity`; si el sistema que integra el crate no maneja ese estado, puede bloquear el flujo.
- La propia model card reconoce que un pad XOR clasico puede dar participaciones individualmente uniformes, pero que el software ordinario no puede probar borrado fisico de un solo uso; no debe asumirse una garantia fisica de seguridad.
- Riesgo de alucinacion: no aplica en el sentido de un LLM, pero si existe riesgo de sobreinterpretar la documentacion como si describiera un modelo de IA entrenado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jessedbrown/path2-two-shadow-recovery
- Documento citado sobre el watcher medido: `docs/DBBH-DBWH-MEASURED-PATH2-2026-07-11.md` (ruta relativa dentro del repositorio)
- Documento citado sobre el harness multi-cilindro: `docs/LIRIS-MULTICYLINDER-QPRISM-SLICE.md` (ruta relativa dentro del repositorio)
- Documento citado sobre el world-slice: `docs/LIRIS-PIE-WORLD-SLICE.md` (ruta relativa dentro del repositorio)
- Test de federacion: `tests/federation.rs` (ruta relativa dentro del repositorio)
- Articulo hermano cuantico citado: arXiv 2602.10695 (no verificable con la informacion disponible)
- Crate Path 1 citado: `dbbh-coms-quant-prism` (sin enlace disponible en la informacion proporcionada)

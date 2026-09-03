# Snapkitty/sovereign-forge

## Resumen

Sovereign Forge no es un modelo de inteligencia artificial al uso, sino un kernel de verificación escrito en C99 que comprueba testigos (witnesses) de álgebra lineal mediante aritmética entera exacta con detección explícita de desbordamiento. Desarrollado por Snapkitty, el proyecto se presenta como una herramienta independiente que no confía en el solver que produjo la respuesta: recalcula el invariante definido y devuelve un resultado determinista (`PASS`, `FAIL` u `OVERFLOW`). Su relevancia actual radica en la creciente necesidad de auditoría y reproducibilidad en pipelines de cómputo científico y aprendizaje automático, donde la verificación independiente de resultados intermedios es crítica.

El kernel cubre tres obligaciones de verificación: inversa de matriz, solución de sistemas lineales y mínimos cuadrados, todo ello con comprobación de multiplicación, suma y resta con detección de overflow. Incluye además pruebas formales en Lean 4 (15 teoremas sin términos `sorry`), un harness de fuzzing con libFuzzer y builds reproducibles. Aunque no se trata de un modelo de lenguaje, esta ficha lo documenta como una pieza de software técnico, dado que su entrada en HuggingFace carece de metadatos de modelo convencionales.

El proyecto se encuentra en fase de desarrollo activo, con una integración para sellar resultados en un ledger distribuido de tipo WORM (Write-Once-Read-Many) y certificados CBOR canónicos. Su superficie de auditoría es reducida (~2.000 líneas de código C), lo que facilita su revisión manual y su integración en entornos de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de verificacion en C99 (no es un modelo neuronal) |
| Parametros totales | No disponible (no aplica) |
| Parametros activos | No disponible (no aplica) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible (no aplica; interfaz en ingles) |
| Licencia | Apache 2.0 (segun insignia del README) |
| Formato de pesos | No aplica; codigo fuente C y binarios reproducibles |

## Arquitectura y entrenamiento

Al no ser un modelo de IA, no existe arquitectura neuronal ni proceso de entrenamiento. Sovereign Forge es un programa C que implementa un verificador determinista. Su estructura interna se organiza en módulos: `src/verifier` (núcleo exacto), `src/typecheck` (sistema de tipos), `src/obligations` (generación de obligaciones), `src/certificate` (serialización CBOR) y `src/receipts` (firma Ed25519 e integración WORM). La lógica principal usa aritmética con `int64_t` y comprobaciones explícitas de desbordamiento en cada operación, devolviendo códigos de error específicos.

El proyecto incluye especificaciones formales congeladas (semántica de instrucciones, reglas de tipos, política de verificación) y pruebas en Lean 4 que demuestran propiedades como determinismo, preservación de tipos y corrección de los refinamientos de C. No hay datos de entrenamiento porque no se trata de un sistema aprendido; su "calidad" se mide mediante 77+ tests de conformidad y adversariales, todos superados.

## Capacidades

- Verificacion exacta de inversa de matriz: comprueba que A × X = I con igualdad entera, sin tolerancia de coma flotante.
- Verificacion de soluciones lineales: comprueba que A × x = b.
- Verificacion de minimos cuadrados: comprueba que Aᵀ(Ax − b) = 0.
- Deteccion de overflow en multiplicacion, suma y resta, con codigos de error diferenciados (VER_OVERFLOW, VER_SHAPE_MISMATCH, etc.).
- Generacion de certificados CBOR canonicos (en desarrollo) y sellado de resultados en ledger WORM con firmas Ed25519.
- Pruebas formales en Lean 4 (15 teoremas) que garantizan propiedades de la maquina de pila subyacente.
- Build reproducible (binarios bit-identicos) y limpieza en ASan/UBSan.

## Casos de uso

- Auditoria de resultados de solvers numericos: cuando un sistema externo (por ejemplo, un solver de algebra lineal en produccion) devuelve una solucion, Sovereign Forge puede verificar de forma independiente si el invariante se cumple, sin confiar en el solver.
- Integracion en pipelines de CI/CD para validacion de artefactos cientificos: se puede anadir como paso de verificacion antes de publicar resultados en un repositorio de datos.
- Verificacion de salidas de modelos de IA que involucran operaciones matriciales: aunque no es un LLM, puede comprobar que las salidas de capas lineales (por ejemplo, en inferencia) cumplen las relaciones esperadas, si se le proporcionan los testigos.
- Generacion de recibos inmutables para cumplimiento normativo: mediante la integracion WORM, los resultados verificados se sellan en un ledger distribuido, proporcionando una traza de auditoria fiable.
- Educacion y formacion en verificacion formal: el codigo y las pruebas Lean 4 sirven como ejemplo didactico de como construir verificadores exactos y demostrar su correccion.
- Entornos de computacion de alto rendimiento (HPC): donde se necesita validar rapidamente que los resultados de operaciones matriciales a gran escala no contienen errores de redondeo ni desbordamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplica al no ser un modelo de IA). El proyecto reporta 77+ tests superados, incluyendo 31 tests adversariales, y 15 teoremas Lean 4 demostrados sin terminos `sorry`. No hay mediciones de latencia o throughput comparables a modelos de lenguaje.

## Requisitos de hardware

- Al ser un programa C estandar, los requisitos son minimos: cualquier CPU con soporte para enteros de 64 bits y un compilador C99.
- Memoria RAM: no especificada, pero el nucleo es de ~2.000 lineas y usa asignacion segura con comprobaciones de overflow; en la practica, cabe en sistemas embebidos o servidores.
- GPU: no se requiere ninguna GPU; la verificacion es puramente CPU.
- Opciones de despliegue: compilacion directa con `make` (netlister/Makefile.sov), integrable en cualquier sistema Unix-like.
- Latencia y throughput: no disponibles, pero al ser aritmetica entera simple, se espera que sea muy rapida en comparacion con operaciones de coma flotante.

## Comparativa con modelos similares

No disponible. Sovereign Forge no tiene comparables directos entre modelos de IA, ya que es una herramienta de verificacion, no un modelo generativo. En el ambito de verificadores de algebra lineal existen otras herramientas (por ejemplo, verificadores basados en intervalos o en aritmetica de coma flotante), pero no hay datos suficientes en la informacion proporcionada para establecer una comparativa tecnica rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona ni procesa lenguaje natural; su unica funcion es verificar invariantes matematicos.
- Alcance limitado: solo cubre tres obligaciones (inversa, solucion lineal y minimos cuadrados). No valida otros tipos de operaciones.
- Requiere testigos completos: el usuario debe proporcionar la matriz A, el resultado X (o x) y, en su caso, el vector b. No resuelve problemas por si mismo.
- Sin tolerancia de coma flotante: la igualdad exacta puede rechazar resultados correctos que provengan de solvers con errores de redondeo.
- La licencia Apache 2.0 permite uso comercial, pero la integracion WORM y los certificados CBOR estan en desarrollo y no deben usarse en produccion sin validacion adicional.
- El proyecto esta en fase activa (Phase 5 en desarrollo); la API puede cambiar en versiones futuras.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/sovereign-forge
- Repositorio de codigo (segun README): https://github.com/SNAPKITTYWEST/sovereign-forge
- Documentacion: docs/USER_GUIDE.md, docs/DEVELOPER.md, docs/SECURITY.md, docs/ARCHITECTURE.md (dentro del repositorio)
- Especificaciones formales: spec/instruction-semantics.md, spec/type-rules.md, spec/verification-policy.md, spec/proof-certificate.schema.json (dentro del repositorio)
- Pruebas Lean 4: proofs/lean4/Sovereign/StackMachine.lean (dentro del repositorio)

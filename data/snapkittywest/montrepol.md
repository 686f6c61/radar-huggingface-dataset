# SNAPKITTYWEST/montrepol

## Resumen

`montrepol` no es un modelo de aprendizaje automatico: es un repositorio de codigo Haskell publicado en Hugging Face bajo el identificador `SNAPKITTYWEST/montrepol`. No contiene pesos, no tiene datos de entrenamiento, no expone API de inferencia y no presenta puntuaciones de benchmarks en el sentido convencional. Se trata de una biblioteca de matematicas exactas con pruebas verificadas por maquina, un solver SMT certificante y artefactos de verificación formal (Agda, Liquid Haskell, Dex), empaquetada con el formato de una model card para dejar claro que no es un modelo.

El repositorio se organiza en capas independientes: `mp-check` (arnes de pruebas con SplitMix64), `mp-linalg` (algebra lineal exacta con dimensiones en el tipo, producto de Strassen, determinante de Bareiss), `mp-lie` (sistemas de raices A-G y matrices de Cartan), `mp-seq` (Berlekamp-Massey), `mp-analytic` (funcion zeta de Riemann, formula explicita, ceros de Hardy Z), `mp-hcalc` (nucleo SMT certificante con DPLL, Fourier-Motzkin y DPLL(T)), `mp-lambda` (calcula lambda simplemente tipado con tipos refinados) y `mp-gate` (reglas del repositorio y replay de defectos plantados). El nucleo solo depende de GHC, sin paquetes de Hackage.

Su relevancia es pedagogica y de ingenieria de verificacion: demuestra como atar cada afirmacion a una comprobacion ejecutable (test, prueba o refinamiento) con cinco niveles de honestidad declarados, y como detectar defectos plantados de forma sistematica. No es utilizable en pipelines de machine learning ni como sustituto de un solver SMT de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; biblioteca Haskell con verificación formal) |
| Parametros totales | no disponible (sin pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (sin pesos que cuantizar) |
| Idiomas soportados | ingles (documentacion y codigo) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (sin pesos; codigo fuente Haskell, Agda, Liquid Haskell y Dex) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es una coleccion de modulos Haskell organizados por dominio matematico, con un arnes de pruebas propio (`mp-check`) que implementa SplitMix64, generadores y propiedades etiquetadas con identificadores de conformance. El nucleo `mp-hcalc` implementa un solver SMT certificante: DPLL para SAT proposicional, eliminacion de Fourier-Motzkin sobre los racionales y DPLL(T) combinando ambos; cada respuesta viene acompanada de un certificado que codigo independiente verifica.

La verificacion formal se reparte en tres artefactos: pruebas en Agda bajo `--safe --without-K` sin biblioteca estandar, comprobacion con Liquid Haskell 0.9.10.1.2 sobre Z3 4.8.12 del modulo `MP.Lambda.Simple`, y codigo Dex con matrices de indices tipados ejecutado como quines autoverificables. El repositorio define cinco niveles de honestidad (`some-true`, `build`, `open`, `proved`, `refined`) y el build falla si se mezclan. Las pruebas `proved` cubren las identidades de Strassen en cualquier grupo abeliano con producto distributivo bilateral, la correccion del normalizador de grupos abelianos usado y la cota inferior de Kish. La prueba `refined` establece terminacion, medida de tamano mayor o igual a 1 y totalidad de patrones en `MP.Lambda.Simple`.

## Capacidades

- Calculo exacto de algebra lineal: productos naive y de Strassen, determinante de Bareiss, rango, inversa, ratio de participacion exacto y `k_eff` de Kish, con dimensiones codificadas en el tipo.
- Teoria de sistemas de raices A-G: raices simples, matrices de Cartan y ordenes del grupo de Weyl por orbita-estabilizador (E8 = 696.729.600, calculado).
- Berlekamp-Massey sobre cualquier cuerpo, LFSRs y calculo de periodos.
- Teoria analitica de numeros: criba, funcion de von Mangoldt, psi de Chebyshev, numeros de Bernoulli exactos, zeta por Euler-Maclaurin, theta de Riemann-Siegel, funcion Z de Hardy, sus ceros y la formula explicita.
- Razonamiento SMT certificante: SAT via DPLL, aritmetica lineal sobre racionales via Fourier-Motzkin y DPLL(T) combinado, con certificados verificables de forma independiente.
- Calcula lambda simplemente tipado y tipos refinados `{v:Int | phi}` cuyas condiciones de verificacion decide Hcalc.
- Verificacion formal con Agda (`--safe --without-K`), Liquid Haskell con Z3 y Dex con matrices de indices tipados.
- Replay de defectos plantados: 34 de 34 detectados por el arnes de pruebas.

## Casos de uso

- Docencia de verificacion formal: el repositorio permite leer de principio a fin una prueba de las identidades de Strassen en Agda y comprobar como se conecta con la implementacion Haskell mediante tests.
- Estudio de solvers SMT certificantes: `mp-hcalc` sirve como ejemplo minimo de DPLL(T) con certificados verificables para entender que garantiza un solver y que delega en el codigo de comprobacion.
- Calculo exacto de algebra lineal en Haskell cuando la correccion prima sobre la velocidad: determinante de Bareiss, rango e inversa sin errores de coma flotante.
- Calculo de ceros de la funcion zeta de Riemann: el repositorio reproduce los 512 ceros tabulados por Odlyzko hasta altura 826,9 con tolerancia 1e-8, util para validar implementaciones numericas propias.
- Verificacion de tipos refinados sobre un calcula lambda simplemente tipado: util para estudiar como se generan y descargan condiciones de verificacion en un lenguaje pequeno.
- Ingenieria de calidad reproducible: el mecanismo de defectos plantados (`cabal run mp-gate -- mutants`) sirve como plantilla para auditar que la suite de tests detecta regresiones reales en codigo, pruebas Agda, refinamientos Liquid Haskell y Dex.
- Referencia de ordenes de grupos de Weyl: el calculo de E8 por orbita-estabilizador es un ejercicio resuelto de teoria de grupos computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en el sentido de machine learning. El autor documenta comprobaciones de correccion sobre la revision `3877b96`, ejecutadas en un contenedor Linux el 2026-11-16:

| Comprobacion | Resultado |
|---|---|
| Tests Haskell | 225 comprobaciones en 8 paquetes, todas pasan |
| Registro de claims | 65 identificadores de conformance, cada uno etiquetado en al menos un test |
| Defectos plantados (`mp-gate mutants`) | 34 de 34 detectados, en codigo, pruebas Agda, refinamientos Liquid Haskell y Dex |
| Agda (`--safe --without-K`) | todos los modulos comprueban |
| Liquid Haskell 0.9.10.1.2 + Z3 4.8.12 | `LIQUID: SAFE (491 constraints checked)` sobre `MP.Lambda.Simple` |
| Dex (commit `25e2e38`, LLVM 12) | la comprobacion quine pasa |
| Ceros de zeta de Riemann | los 512 tabulados por Odlyzko hasta altura 826,9 encontrados de forma independiente, cada uno con error menor que 1e-8 |

Los workflows de GitHub Actions del repositorio aun no se habian ejecutado cuando se registraron estos resultados.

## Requisitos de hardware

- No requiere GPU: no hay pesos ni inferencia neuronal.
- Entorno de compilacion: GHC 9.10.1 y cabal 3.12 para el nucleo Haskell; Agda 2.6.3 para `formal/`; Liquid Haskell con Z3 para `liquid/`; toolchain LLVM 12 fijada para `dex/`.
- El nucleo Haskell no depende de paquetes de Hackage, lo que reduce el arbol de dependencias al compilador.
- VRAM estimada: no aplica.
- Latencia y throughput: no disponibles; el autor advierte que Hcalc es mucho mas lento que Z3 o CVC5 por diseno, ya que prioriza certificados faciles de comprobar.
- Opciones de despliegue: compilacion local con `cabal build all && cabal test all && cabal run mp-gate`; no hay contenedor, servicio ni API publicados.

## Comparativa con modelos similares

No disponible en el sentido de modelos de machine learning. Como referencia de herramientas de la misma categoria funcional:

| Herramienta | Tipo | Verificacion | Licencia | Notas |
|---|---|---|---|---|
| `montrepol` (Hcalc) | Solver SMT certificante + biblioteca matematica | Certificados verificables por codigo independiente | AGPL-3.0 | DPLL + Fourier-Motzkin; lento por diseno |
| Z3 | Solver SMT de produccion | Sin certificados por defecto | MIT | Usado por el propio repositorio en `liquid/` |
| CVC5 | Solver SMT de produccion | Soporta pruebas en algunos modos | BSD-3 | Referencia de rendimiento frente a Hcalc |
| Agda | Asistente de pruebas | Kernel de tipos dependientes | MIT | Usado en `formal/` |

## Limitaciones y advertencias

- No es un modelo de machine learning: no hay pesos, no hay API de inferencia y no se puede cargar en ningun pipeline.
- Hcalc no es apto para SMT de produccion: Fourier-Motzkin y DPLL plano son mucho mas lentos que Z3 o CVC5.
- Los resultados de zeta, theta y Z se calculan en `Double` y se comprueban contra formas cerradas y tablas con tolerancias declaradas, sin cotas de error por intervalos; no son resultados de coma flotante rigurosos.
- Las pruebas son sobre las matematicas, no sobre el codigo Haskell: que `MP.Matrix.strassenSq` calcule exactamente los productos probados en Agda se comprueba por lectura y tests, no de forma mecanica.
- Hcalc decide sobre los racionales; la validez sobre los racionales implica validez sobre los enteros, por lo que la comprobacion de refinamientos es solida para enteros, pero no cubre otros dominios.
- Licencia AGPL-3.0: impone obligaciones de liberacion de codigo derivado en servicios en red; revisar antes de cualquier uso comercial.
- Documentacion y codigo solo en ingles.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta; sin comunidad ni soporte externo.
- Los workflows de CI no se habian ejecutado al registrar los resultados, por lo que la reproducibilidad continua no esta garantizada por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SNAPKITTYWEST/montrepol
- README del proyecto: `README-project.md` (referenciado en la model card, sin URL directa disponible)
- Listado de claims: `CONFORMANCE.md` (referenciado en la model card, sin URL directa disponible)
- No se han encontrado papers, blogs, repositorios externos ni demos en la informacion proporcionada.

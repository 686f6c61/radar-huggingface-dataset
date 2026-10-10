# Snapkitty/alp-carry

## Resumen
alp-carry no es un modelo de lenguaje: es un compilador vertical para una clase pequena de pruebas de restricciones, publicado por Snapkitty (Copyright 2026, Ahmad Ali Parr) dentro del denominado "SnapKitty October 2026 main drop". El repositorio de HuggingFace es un espejo del repositorio GitHub `SNAPKITTYWEST/alp-carry` en el commit `32f21fa`, sin pipeline declarado, con 0 descargas, 0 likes y un tamano de repositorio de 0,0 GB en el momento de la consulta.

El problema que aborda es un paso de refinamiento situado despues de una capa numerica: una salida neuronal es un vector y una capa simbolica quiere situarlo dentro de un intervalo (clamp), dentro de una bola epsilon de un candidato, o dejarlo intacto cuando ninguna clausula aplica. Resolverlo con un interprete de clausulas de Horn implica una unificacion y un despacho por llamada; alp-carry traslada esa interpretacion al tiempo de sintesis y deja en tiempo de ejecucion unicamente un codificador de mascaras, un kernel de acarreo y un almacen.

Un inductor offline convierte ejemplos en un programa Horn, un atomizador lo cuece en mascaras y constantes, y un kernel evalua el cuerpo como un recuento de deficiencia de acarreo: residuo cero significa que todos los literales se cumplieron y la mascara de cabeza es el veredicto. Si nada se activa, se selecciona la palabra identidad mediante la clausula de totalidad forzada `solve(N, N) :- true.`

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable en sentido neuronal. Compilador vertical neuro-simbolico: sintesis de programas Horn, atomizacion y kernels en C11 y ensamblador (NASM/GAS) para x86-64, mas un esbozo HLASM para z/Architecture |
| Parametros totales | No disponible (no es un modelo neuronal; no se declaran parametros) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no procesa secuencias de tokens) |
| Tipos de cuantizacion | No aplicable al modelo. El atomizador cuantiza las constantes a traves de float32 y las imprime con nueve digitos significativos |
| Idiomas soportados | No disponibles |
| Licencia | AGPL-3.0 (unicamente esa licencia) |
| Formato de pesos | No disponible (no hay pesos). Artefactos generados: `induced.json`, `induced.pl`, `generated_constraints.h`, `proof_masks.c`, `test_vectors` |
| Autor | Snapkitty / Ahmad Ali Parr |
| Fechas | Creado el 2026-10-10, actualizado el 2026-10-10 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Instrucciones soportadas | x86-64 con ADX y AVX2; ruta portable con cadena ADC; esbozo z/Architecture en HLASM |

## Arquitectura y entrenamiento
El sistema no se entrena en el sentido habitual: se induce. `src/alp/examples_gen.py` genera quinientas ternas con semilla fija; cada terna contiene un vector neuronal, un clamp, un epsilon y el vector refinado que emitiria un solucionador de referencia. `src/alp/alp_engine.py` ejecuta cuatro pasadas sobre esos ejemplos: saturate (construye la clausula mas especifica que cubre un ejemplo: literal de clamp si el valor refinado cae sobre el valor neuronal recortado, literal de proyeccion si cae dentro de la bola epsilon), generalize (anti-unifica los limites entre ejemplos tomando el minimo inferior y el maximo superior por dimension, y el epsilon maximo), force (ensancha los limites para que la clausula identidad sea la ruta rara) y minimize (elimina el literal de proyeccion cuando epsilon es al menos la amplitud de clamp mas ancha, condicion C4). El artefacto legible por maquina es `induced.json`; el legible por humanos es `induced.pl`, con dos clausulas como maximo.

La parte de ejecucion es C11 y ensamblador. El atomizador lee `induced.json` y escribe `generated_constraints.h` (constantes `ALP_LO`, `ALP_HI`, `ALP_EPS`, `ALP_HAS_PROJECTION`) y `proof_masks.c`, un codificador AVX2 que procesa ocho lanes a la vez, compara contra los limites, aplica `movemask` a ocho bits y desplaza esos bits a la dimension correspondiente. Un word de clamp esta lleno si y solo si cada dimension esta dentro de su intervalo; un word de proyeccion esta lleno si y solo si cada dimension esta dentro de la bola epsilon. El cuerpo inducido se mantiene bajo el tope C2 de 63 (dos words como maximo, sin literal puente); un cuerpo mas largo se dividiria y el predicado de subcadena se recodificaria como un word lleno o vacio. La ruta caliente no interpreta clausulas, no llama a un motor de logica y no ramifica segun los datos. Dos implementaciones coexisten: `atomic_solver_ref` como modelo escalar portatil y `alp_carry_prove` como ruta rapida. `src/host/verifier.c` actua como puerta de 4096 vectores y rechaza ejecutar el host si ambas discrepan en los vectores emitidos. La compilacion usa NASM si esta en `PATH` y, en caso contrario, los gemelos GAS, exportando los mismos simbolos.

## Capacidades
- Sintesis de programas Horn a partir de ejemplos numericos (saturate, generalize, force, minimize).
- Forzado de totalidad: la clausula identidad garantiza que cualquier vector que no case con nada produzca una salida, copiando la palabra neuronal sin inventar una mas ajustada.
- Atomizacion de restricciones en constantes y mascaras compiladas.
- Evaluacion de acarreo sin ramas: el cuerpo se evalua como recuento de deficiencia de acarreo, con residuo cero como veredicto de cumplimiento.
- Codificacion de pruebas con AVX2 a ocho lanes por iteracion y `movemask`.
- Verificacion cruzada entre la ruta rapida y el modelo escalar de referencia sobre 4096 vectores.
- Despacho en tiempo de ejecucion por CPUID (`src/host/dispatch.c`) entre variantes de kernel.
- Multiples backends de ensamblador: cadena ADX en x86-64, cadena ADC portable y esbozo z/Architecture en HLASM.
- Componentes auxiliares de sintesis y telemetria (Owl, Janet, puente life-node) fuera de la ruta critica.
- No incluye generacion de texto, tool calling, function calling, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues.

## Casos de uso
- Refinamiento post-neuronal en lazos de control: dado un vector de salida de una red y un clamp o una bola epsilon, alp-carry emite el vector recortado o proyectado con una ruta sin ramas ni interprete, adecuada para bucles con presupuesto de tiempo muy ajustado.
- Validacion previa al despliegue de capas simbolicas: `verifier.c` compara `alp_carry_prove` contra `atomic_solver_ref` sobre 4096 vectores y bloquea la ejecucion del host si divergen, de modo que sirve como puerta de CI antes de publicar una nueva version del programa inducido.
- Sistemas que exigen salida garantizada: la clausula `solve(N, N) :- true.` evita casos sin respuesta cuando un vector no satisface ninguna clausula, algo util en tuberias que no pueden permitirse un fallo de refinamiento.
- Eliminacion del coste de un motor logico en produccion: se sustituye la unificacion y el despacho por llamada de un interprete de clausulas de Horn por un codificador de mascaras mas un kernel de acarreo, manteniendo el mismo programa inducido como fuente.
- Despliegue heterogeneo en x86-64: el despacho por CPUID permite elegir entre la cadena ADX y la cadena ADC portatil, lo que facilita ejecutar el mismo artefacto en maquinas con y sin ADX.
- Exploracion de portabilidad a mainframe: el esbozo HLASM en `src/kernels/carry_z.hlasm` permite evaluar la traduccion de la cadena de acarreo a z/Architecture.
- Telemetria y re-sintesis desacopladas: el puente `src/lifenode/lifenode.mjs` y los componentes Owl/Janet permiten registrar comportamiento y regenerar el programa inducido sin tocar la ruta de nanosegundos.
- Cumplimiento de AGPL en servicios de red: un servicio que ejecute una copia modificada debe ofrecer el codigo fuente correspondiente a sus usuarios, lo que encaja en despliegues que ya publican su codigo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas cifras declaradas en la documentacion son parametros de ingenieria, no medidas de rendimiento: quinientas ternas generadas con semilla fija, una puerta de verificacion de 4096 vectores, un tope C2 de 63 para el numero de words del cuerpo inducido, codificacion AVX2 a ocho lanes por iteracion y cuantizacion a float32 con nueve digitos significativos. La propia model card describe la ruta como "nanosecond proof", pero no aporta latencias ni throughput medidos. No se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra metrica comparable, porque el artefacto no es un modelo generativo.

## Requisitos de hardware
- VRAM: no aplicable. No es un modelo neuronal y no requiere GPU.
- CPU x86-64 con AVX2 para `src/kernels/proof_masks.c`; la presencia de ADX se comprueba en tiempo de ejecucion mediante `src/host/dispatch.c`.
- Ruta alternativa con cadena ADC portable para equipos sin ADX.
- z/Architecture: existe un esbozo HLASM (`src/kernels/carry_z.hlasm`), sin datos de validacion en la informacion disponible.
- Cabe en hardware de consumo: al no emplear GPU ni pesos, el requisito se reduce a un compilador de C11 y a NASM o GAS en `PATH`.
- Opciones de despliegue: compilacion con `make` e integracion como biblioteca nativa en el host. No aplican vLLM, llama.cpp, Ollama ni TGI, al no existir pesos ni inferencia neuronal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (compiladores neuro-simbolicos de refinamiento o generadores de kernels de prueba) con datos verificables de parametros, contexto, rendimiento o licencia. Las alternativas conceptuales serian un interprete de clausulas de Horn generico, un motor Datalog o un refinador escrito a mano en C, pero no se dispone de cifras de ninguno de ellos en el material consultado, por lo que cualquier tabla comparativa seria especulativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snapkitty/alp-carry | No aplicable | No aplicable | No disponible | AGPL-3.0 | HuggingFace y GitHub |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no tiene pesos, no soporta tool calling ni function calling, y no debe evaluarse con benchmarks de LLM.
- La totalidad declarada es totalidad de terminacion sobre las regiones vistas: el programa inducido cubre los ejemplos mostrados porque los limites se ensancharon a los limites de los ejemplos. Las regiones no vistas caen en la identidad hasta la siguiente sintesis.
- Los ejemplos son sinteticos y se generan con semilla fija; el material no aporta evidencia de generalizacion a datos reales.
- La licencia es AGPL-3.0 y solo esa licencia. Un servicio en red que ejecute una copia modificada debe ofrecer el codigo fuente correspondiente a sus usuarios, lo que puede ser incompatible con despliegues propietarios cerrados.
- El esbozo para z/Architecture se describe como "sketch" (esbozo), sin indicacion de que este verificado o probado.
- El README del espejo esta truncado: la relacion de archivos menciona `test_vectors.j` sin completar, por lo que no se puede confirmar el contenido integro del repositorio.
- Las constantes se cuantizan a float32; si el productor neuronal no opera en float32 pueden aparecer discrepancias entre los limites inducidos y los vectores reales.
- El repositorio presenta 0,0 GB, 0 descargas y 0 likes, sin senales de uso en produccion, mantenimiento activo ni revision por pares.
- No se declaran idiomas soportados, pipeline ni resultados de evaluacion independiente.
- No se dispone de datos de latencia ni de throughput, pese a la descripcion cualitativa de "nanosecond proof".

## Enlaces
- HuggingFace: https://huggingface.co/Snapkitty/alp-carry
- Repositorio GitHub de origen (commit `32f21fa`): https://github.com/SNAPKITTYWEST/alp-carry
- Perfil GitHub de la organizacion: https://github.com/SNAPKITTYWEST
- Repositorio principal de SnapKitty: https://github.com/SNAPKITTYWEST/SNAPKITTYWEST
- Perfil de HuggingFace del autor: https://huggingface.co/Snapkitty
- Coleccion de investigacion y papers: https://huggingface.co/collections/Snapkitty/research-and-papers
- Publicacion en LinkedIn sobre la iniciativa: https://www.linkedin.com/posts/ahmad-parr-dev_localai-edgeai-activity-7513855605988601856-_amD

# FluidInference/citenet-coreml

## Resumen

CiteNet es una red neuronal de 397.250 parametros (13.871 de ellos no nulos) disenada especificamente para detectar citas juridicas estadounidenses imposibles: series de reporter que no existen (`F.5th`, `S.W.4th`), tribunales que un reporter nunca publica, estados fuera de la cobertura de un reporter regional o anos incompatibles con el volumen citado. Lo desarrolla FluidInference y se distribuye como paquetes Core ML optimizados para Apple Neural Engine y GPU, con licencia Apache 2.0.

Su particularidad tecnica es radical: no ha sido entrenado. Los pesos fueron escritos a mano, compilados desde una especificacion (`citenet/spec.py`) que codifica el mapa real de reporters, tribunales y curvas aproximadas volumen-ano. Cada peso no nulo tiene nombre y no se ejecuto ningun paso de gradiente. La arquitectura es una red convolucional minima que opera sobre codigos de 64 caracteres por cita, con compuertas AND tipo `relu(8·[reporter federal apelativo] + [tribunal estatal] − 8)` y un "termometro de volumen" compartido que traduce volumen a ano.

Es relevante ahora porque ataca un problema candente —las citas alucinadas por LLM en escritos juridicos, como el caso *Mata v. Avianca*— con un filtro de primera linea extremadamente rapido (hasta 1,82 millones de citas por segundo combinando Neural Engine y GPU en un M5 Pro) y con un consumo de recursos minimo, pensado para colocarse delante de una consulta real a bases de jurisprudencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional sobre codigos de caracteres (64 por cita), con decodificadores de digitos, termometro de volumen compartido y compuertas AND; pesos escritos a mano |
| Parametros totales | 397.250 (13.871 no nulos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 caracteres por cita (entrada fija por cita, no secuencial) |
| Tipos de cuantizacion | fp16 en todas las builds; referencia fp32 en PyTorch |
| Idiomas soportados | No disponible (dominio exclusivamente juridico estadounidense en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage`; pesos crudos en `weights.npz`; modelo de referencia en PyTorch |

## Arquitectura y entrenamiento

La red no es un transformer ni un modelo de lenguaje: es una CNN de caracteres que procesa cada cita normalizada a 64 codigos. La especificacion define filtros convolucionales que se activan solo cuando los caracteres forman patrones como `<digito> F.3d<espacio>`, decodificadores de digitos con peso k·10^i sobre el digito k, un ReLU compartido que actua como "termometro de volumen" del que leen todas las curvas volumen-ano, y compuertas logicas AND implementadas con ReLU. La salida es `p_fake` junto con siete valores de `evidence` y conceptos con nombre, lo que permite inspeccionar por que se ha marcado una cita.

No hubo entrenamiento: Claude (Anthropic) genero la especificacion y el compilador de pesos (`citenet/net.py`), y cada peso no nulo corresponde a una regla juridica explicita. Como comparacion, el autor entreno desde cero la misma arquitectura (v1.1) sobre el split `aux_train` de LePhantomCite: empata en el benchmark con 0/983 falsos positivos, pero solo detecto 1 de 5 falsos plantados de tipos no vistos en entrenamiento, frente a 5/5 de la red escrita a mano (conjunto de solo 5 ejemplos, segun el propio autor, ilustrativo). Un fine-tune ingenuo partiendo de los pesos manuales empeoro el resultado.

## Capacidades

- Deteccion de citas juridicas estructuralmente imposibles: series de reporter inexistentes, tribunales incompatibles con el reporter, estados fuera de cobertura regional y anos incoherentes con el volumen.
- Salida probabilistica (`p_fake`) mas siete valores de evidencia y conceptos nombrados por neurona para auditoria.
- Extraccion y normalizacion de citas desde texto libre mediante `citenet/text.py`, con un port en Swift a nivel de byte identico al de Python (`bench/CiteScan.swift`).
- Procesamiento por lotes de alto rendimiento con formas fijas (`b1`, `b32`, `b512`, `b8192`).
- Ejecucion en Apple Neural Engine, GPU y CPU con el mismo modelo.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Filtro previo en pipelines de verificacion de citas: procesar cada cita de un escrito o de una base de jurisprudencia antes de consultar un servicio real de case-law lookup, descartando las estructuralmente imposibles en microsegundos.
- Auditoria masiva de corpus juridicos: el pipeline `stream/main.swift` escanea 3,30 GB de opiniones (291.339 decisiones) en 2,3 s, util para detectar errores de citacion en colecciones completas.
- Guardrail en asistentes juridicos basados en LLM: interceptar las citas generadas por el modelo antes de mostrarlas al usuario, marcando las que no pueden existir.
- Revision de escritos antes de presentacion: integrado en una herramienta de escritorio para Mac, senala citas sospechosas en un documento con latencia imperceptible (50 microsegundos por cita en CPU).
- Investigacion sobre alucinacion en dominios especializados: la red escrita a mano sirve como linea base interpretable (cada peso tiene nombre) frente a modelos entrenados.
- Demostraciones y formacion: el demo web local incluye un modo de falsos plantados que informa de plantados, detectados y perdidos, util para ilustrar el problema de las citas fantasma.
- Indexacion y limpieza de bases de datos legales: normalizar y validar citas al ingerir documentos en un sistema de gestion documental.

## Benchmarks y rendimiento

Resultados en LePhantomCite (split `eval`, nivel de cita), con pesos congelados y una unica pasada ciega:

| Version | Citas fantasma detectadas | Citas reales marcadas |
|---|---|---|
| v1.0 (primera y unica pasada ciega) | 31 / 31 | 3 / 983 |
| v1.5 (esta release; correcciones posteriores no ciegas) | 31 / 31 | 1 / 983 |

La unica marca restante es `652 A.2d 634 (D.C. Cir. 1995)`: A.2d nunca publica opiniones del D.C. Circuit, por lo que probablemente sea un error del escrito de origen. Sobre 3,30 GB de opiniones reales (COLD Cases shard 0), el 0,134% de las citas se marcan; la mayoria parecen errores reales del texto, aunque no estan verificadas y algunas son errores del propio modelo.

Rendimiento en Core ML sobre Apple M5 Pro con Swift nativo:

| Escenario | Rendimiento |
|---|---|
| 1 cita (`CiteNet_b1`, CPU) | ~50 µs |
| 32 citas (`CiteNet_b32`, Neural Engine) | 170 µs |
| Lote masivo, Neural Engine (`CiteNet_lean_b512`) | ~430.000 citas/s |
| Lote masivo, GPU (`CiteNet_lean_b8192`) | ~1,38 M citas/s |
| Neural Engine + GPU simultaneos | ~1,82 M citas/s |
| Texto crudo extremo a extremo (escanner + ANE + GPU) | 3,30 GB en 2,3 s (1,44 GB/s, 1,68 M citas/s) |

## Requisitos de hardware

- VRAM: practicamente despreciable; el modelo completo ocupa unos pocos MB en fp16 y el repo declara 0,0 GB.
- GPU recomendadas: no requiere GPU dedicada; esta optimizado para Apple Silicon (Neural Engine y GPU integrada). Se ha medido en un Apple M5 Pro.
- Cabe en cualquier GPU de consumo e incluso en CPU: la build `b1` corre en CPU a ~50 µs por cita.
- Despliegue: Core ML nativo (Swift o Python via `coremltools`); el modelo de referencia PyTorch se reconstruye con `scripts/convert.py`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: ver tabla de benchmarks; las formas de lote fijas son obligatorias, ya que con `EnumeratedShapes` Core ML ejecutaba todo en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de verificacion de citas juridicas con pesos escritos a mano o con arquitectura y escala equivalentes.

## Limitaciones y advertencias

- Una red puramente de cadena de caracteres puede determinar que una cita *podria* existir, no que exista. Las citas falsas de LLM que copian formatos validos, como las seis inventadas por ChatGPT en *Mata v. Avianca* (p. ej. `925 F.3d 1339 (11th Cir. 2019)`), pasan el filtro.
- Fuera de alcance: otros tipos de alucinacion (nombre de caso incorrecto, pincite erroneo, cita mal transcrita) requieren el texto del caso; se marcan solo 2 de 276 veces.
- Los avisos sobre jurisprudencia real no estan verificados y algunos son errores del propio modelo.
- Dominio limitado a citas juridicas de EE. UU.; no cubre otros paises ni otros sistemas de citacion.
- El conjunto de 5 falsos plantados usado en la comparacion con la version entrenada es muy pequeno y lo escribio el propio autor; debe tratarse como ilustrativo.
- No es un modelo de lenguaje: no genera texto, no razona y no sustituye a una consulta real a bases de jurisprudencia.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantia de exactitud juridica; no debe usarse como unica verificacion en produccion legal.

## Enlaces

- Hugging Face: https://huggingface.co/FluidInference/citenet-coreml
- Dataset LePhantomCite: https://huggingface.co/datasets/ai-law-society-lab/Legal_Phantom_Citation
- Dataset COLD Cases: https://huggingface.co/datasets/harvard-lil/cold-cases

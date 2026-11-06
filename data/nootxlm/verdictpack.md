# nootxlm/verdictpack

## Resumen

Verdictpack es una herramienta de investigación estadística empaquetada como binario estático de Go, publicada por nootxlm (Agent Embassy) bajo licencia MIT. No es un modelo de lenguaje: es un instrumento que recibe la definición de un constructo experimental y devuelve un diseño de test con garantía de potencia estadística, una fábrica de estímulos con compuertas mecánicas de admisión, una capa humana validada y dimensionada por separado, jueces modelados como fichas de personaje y un veredicto secuencial cuya garantía de error sobrevive al *peeking* (inspección repetida de datos), imprimiendo el coste de cada ruta junto a la ruta.

El paquete resuelve un problema concreto en la evaluación de sistemas de IA y en la investigación experimental: la ausencia de procedimientos de test secuencial con validez estadística cuando se monitorizan resultados de forma continua. Implementa estadística exacta (enumeración exacta, binomial exacta, t no central exacta) siempre que es posible, y reserva la simulación solo para el comportamiento de parada. La implementación de referencia en Python cubre las capas de dimensionamiento (*sizing*), veredicto y jueces; las capas de motor (*engine*) y batería (*battery*) son exclusivas de Go.

La relevancia actual es metodológica: ofrece un flujo reproducible con autoevaluación (*audit.py*) que rederiva cada cifra principal por un segundo método independiente y falla de forma fatal ante cualquier discrepancia, además de una prueba de sala limpia (SEAL-TEST.md) que demuestra salida idéntica en bytes con ficheros señuelo presentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herramienta estadística en Go (stdlib only); capas de referencia en Python |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (binario Go estático; código fuente Go y Python) |

## Arquitectura y entrenamiento

Verdictpack no es un modelo entrenado, sino un instrumento compuesto por capas. El *construct compiler* recibe un esquema completo (identidad, transformación, métrica y dirección, línea base humana, dos umbrales —h de Cohen y odds ratio, gobernando el efecto menor—, mínimo de extensión, alfa, alfa por cola, frontera e, roles de flujo, afirmación registrada, afirmación de extensión y confusores conocidos) y rechaza configuraciones incompletas con la lista completa de defectos, sin adivinar nada. La generación latente construye eventos raíz a partir de plantillas y los admite mediante compuertas mecánicas: coincidencia de longitud, preservación de contenido, distinción de fragmentos y separación del compañero nulo; los fallos se cuentan por compuerta y se imprime el rendimiento de admisión (en la demo, 400 candidatos, 316 admitidos, rendimiento 0,790).

La capa humana se divide en dos funciones distintas: validación del instrumento (auditoría de reconstrucción del lector, 200 raíces × 2 lectores, con κ de Cohen ≥ 0,60 exigida; en la demo κ = 0,770, instrumento válido) y línea base de preferencia (pilotaje de 100 raíces × 2 juicios, dimensionado, nunca comprobado por muestreo). El núcleo anytime-valid implementa un proceso e para el veredicto secuencial tipo SPRT. El motor produce siete ficheros de salida (§9) y la batería ejecuta 10.000 réplicas × 5 escenarios (50.000 ejecuciones secuenciales). El binario se compila con `-trimpath`, por lo que una recompilación desde otro directorio produce los mismos bytes; cualquier Go ≥ 1.21 lo compila y no hay dependencias que descargar.

## Capacidades

- Dimensionamiento estadístico exacto de diseños experimentales a partir de la definición de un constructo.
- Cálculo de potencia y análisis de error con estadística exacta (binomial exacta, t no central exacta, formas cerradas) y simulación solo donde el comportamiento de parada es el objeto de estudio.
- Test secuencial anytime-valid con garantía de error que se mantiene bajo inspección repetida de datos (peeking).
- Generación de estímulos con compuertas mecánicas de admisión y cómputo del rendimiento por compuerta.
- Validación de instrumento mediante auditoría de reconstrucción con κ de Cohen y veredicto INSTRUMENT_INVALID si falla.
- Modelado de jueces como fichas de personaje con composiciones de panel configurables.
- Autoauditoría: rederivación independiente de cada cifra principal con fallo fatal ante discrepancia.
- Prueba de sala limpia (seal test) que demuestra salida byte-idéntica con señuelos presentes.
- No soporta tool calling, agentes, visión, audio ni generación de texto: no es un modelo generativo.

## Casos de uso

- Diseño de experimentos de evaluación de IA: el instrumento toma la definición del constructo y devuelve un diseño con potencia calculada, evitando experimentos infradimensionados en comparaciones de sistemas.
- Monitorización continua con parada temprana válida: el veredicto secuencial SPRT permite detener un experimento en cuanto la evidencia es concluyente sin inflar la tasa de error, adecuado para A/B tests de larga duración.
- Auditoría de instrumentos de medida subjetiva: la capa de validación con κ de Cohen ≥ 0,60 bloquea cualquier afirmación de preferencia si la reconstrucción del lector falla, útil en estudios con anotadores humanos.
- Construcción de paneles de jueces LLM: las fichas de personaje y las composiciones de panel permiten especificar y comparar configuraciones de jueces de forma reproducible.
- Verificación de reproducibilidad en publicaciones: `reproduce.sh` reconstruye todo, reejecuta el seal test y cierra con la autoevaluación, lo que sirve como artefacto de revisión para *artifact evaluation*.
- Cálculo de coste experimental: cada ruta del veredicto imprime su coste junto a la ruta, lo que permite presupuestar réplicas y escenarios antes de ejecutar el estudio.
- Docencia de estadística secuencial: los escenarios de la batería (50.000 ejecuciones) ofrecen tasas de error empíricas y costes medidos para ilustrar el comportamiento de parada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la informacion disponible. El README sí reporta cifras de ejecución del propio instrumento:

| Medicion | Valor |
|---|---|
| Capas de referencia (sizing, verdict, judges) | ~3 s en total |
| Ejecución del motor (engine) | ~0,1 s |
| Batería completa (10.000 réplicas × 5 escenarios, 50.000 ejecuciones) | 4 min 12 s en VM de 2 núcleos sin carga; 6 min 6 s con 4 workers en VM compartida bajo carga |
| Rendimiento de admisión de estímulos (demo) | 316/400 = 0,790 |
| κ de Cohen en validación de instrumento (demo) | 0,770 (umbral ≥ 0,60) |
| Toolchain de compilación del binario publicado | go1.27.3 linux/amd64 |

## Requisitos de hardware

- No requiere GPU: es un binario Go estático sin intérprete.
- CPU: la batería completa se ejecutó en una VM de 2 núcleos; el motor corre en ~0,1 s y las tres capas de referencia en ~3 s.
- Memoria: no se especifica en la información disponible; al tratarse de cómputo estadístico con 50.000 ejecuciones secuenciales, el consumo es moderado y acotado por el tamaño de las réplicas.
- Almacenamiento: mínimo; el paquete incluye código fuente, configuraciones y salidas de ejecución en texto.
- Despliegue: compilación con `go build -trimpath -ldflags "-s -w" -o verdictpack .` desde el directorio `go/`; requiere Go ≥ 1.21 (verificado en go1.21.13) y no hay dependencias que descargar.
- Latencia y throughput: los indicados en la tabla de benchmarks; las estadísticas están fijadas por semilla y son idénticas entre ejecuciones, solo varían el reloj y el número de workers.

## Comparativa con modelos similares

No disponible. Verdictpack no es un modelo de lenguaje ni un sistema de inferencia, por lo que no existen alternativas comparables en la misma categoría dentro de la información proporcionada. Herramientas estadísticas genéricas (por ejemplo, librerías de análisis de potencia) cubrirían solo la capa de dimensionamiento, pero no se dispone de datos para una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de uso como LLM es un error de categoría.
- Solo documentación en inglés (`language: en`); no hay materiales en castellano.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa por parte de la comunidad.
- Las cifras de rendimiento del README (tiempos, κ, rendimiento de admisión) provienen de ejecuciones de demostración del propio autor; no se han verificado de forma independiente en la información disponible.
- La implementación de referencia en Python solo cubre las capas de dimensionamiento, veredicto y jueces; el motor y la batería son exclusivos de Go, lo que limita la portabilidad del flujo completo.
- La licencia MIT permite uso comercial, pero el instrumento está orientado a investigación metodológica; su aplicación en producción exigiría validar los supuestos estadísticos del constructo concreto.
- El diseño depende de que el esquema del constructo esté completo: configuraciones incompletas se rechazan, lo que puede bloquear flujos automatizados que no proporcionen todos los campos.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento multilingüe porque no aplican a esta categoría de herramienta.

## Enlaces

- HuggingFace: https://huggingface.co/nootxlm/verdictpack
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.

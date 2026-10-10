# Snapkitty/goldilocks-controlled-reduce

## Resumen

Goldilocks controlled reduce es un repositorio publicado en Hugging Face por el usuario Snapkitty que contiene una implementacion en OpenQASM 3.0 de un circuito cuantico de suma modular controlada, especializado en el cuerpo primo de Goldilocks (p = 2^64 - 2^32 + 1). No es un modelo de lenguaje ni una red neuronal: el artefacto es un circuito reversible que realiza una funcion matematica concreta, |x>|c> -> |x + c * (2^32 - 1) mod 2^64>|c>, es decir, el paso de correccion exacto que exige la aritmetica modulo p cuando una suma de 64 bits desborda.

El diseno prioriza el ahorro de qubits: emplea 67 qubits en total (64 de datos, 1 de control y 2 ancillas) gracias a un esquema de acarreo "ping-pong" que reutiliza dos unicas ancillas en lugar de mantener un registro de acarreo completo de 64 bits. El precio de esa eleccion es una profundidad secuencial de 128 capas de Toffoli. El repositorio incluye el circuito completamente desplegado, un script de Qiskit con comprobaciones contra un oraculo clasico y un esbozo de formalizacion en Lean 4.

Es relevante para quienes trabajan en criptografia post-cuantica, sistemas de pruebas de conocimiento cero y verificacion formal, porque la reduccion modulo el primo de Goldilocks aparece en varias construcciones de ese tipo y su version reversible controlada rara vez se publica como pieza aislada, contada puerta a puerta y auditable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Circuito cuantico reversible (sumador modular controlado) descrito en OpenQASM 3.0; esquema de acarreo ping-pong con 2 ancillas |
| Parametros totales | No aplicable: no es un modelo neuronal. No disponible |
| Parametros activos | No aplicable (no es un modelo MoE ni una red neuronal) |
| Longitud de contexto | No disponible / no aplica |
| Tipos de cuantizacion | No disponible / no aplica |
| Idiomas soportados | No disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible / no aplica. Los artefactos son codigo fuente: `.qasm` (OpenQASM 3.0), script Python para Qiskit y fichero `.lean` (Lean 4) |

Tabla de recursos del circuito (cifras exactas declaradas por el autor para la version desplegada en `circuits/goldilocks_controlled_reduce.qasm`):

| Recurso | Cantidad |
|---|---|
| Qubits totales | 67 (64 de datos + 1 de control + 2 ancillas) |
| Toffoli (CCX) | 128 |
| CNOT | 128 |
| X | 192 |
| Profundidad de Toffoli | 128 |
| Ancillas | 2, devueltas limpias |

## Arquitectura y entrenamiento

No hay entrenamiento: no existe dataset, ni tokens, ni fases de RLHF o DPO. El contenido es un circuito cuantico construido a mano y verificado por simulacion. La operacion se descompone en seis fases: carga del bit de control en la ancilla a_0 mediante CNOT; mitad inferior hacia delante, donde para cada uno de los 32 bits menos significativos se inyecta la constante 1 con una puerta X, se suma el acarreo entrante con un CNOT y se calcula el acarreo saliente con un Toffoli que usa el valor original del bit de datos; mitad superior hacia delante, donde los 32 bits mas significativos reciben solo el acarreo propagado; y las dos fases inversas (mitad superior y mitad inferior) que descomputan los acarreos intermedios sin tocar los bits de datos ya corregidos. Un CNOT final entre el control y a_0 devuelve la ancilla a |0>, de modo que ambos qubits auxiliares quedan limpios y el control recupera su valor original.

La innovacion tecnica es la disciplina ping-pong: en lugar de un qubit de acarreo por bit (64 qubits adicionales en un sumador ripple-carry convencional), las dos ancillas se alternan en cada paso, de modo que el proximo bit ve el acarreo recien calculado. Esto mantiene constante el coste en ancillas a cambio de aumentar la profundidad secuencial. La verificacion se plantea en tres capas: un oraculo clasico en Python que calcula (x + c*(2^32 - 1)) mod 2^64; simulacion exacta de vectores de estado con AerSimulator sobre diez vectores elegidos (caso cero, suma pura de la constante, acarreos de un solo bit, bit mas significativo, desbordamiento completo, frontera exacta suma = 2^64 y valores proximos al primo de Goldilocks), comparando registro de datos, invariancia del control y limpieza de ancillas; y un esbozo formal en `lean/GoldilocksStep.lean` que define la accion clasica de X, CNOT y Toffoli sobre un estado de tres bits y demuestra por analisis exhaustivo de casos que los pasos inferior y superior hacia delante y sus inversos implementan las funciones reversibles pretendidas. La composicion ping-pong queda enunciada como esbozo: la model card proporcionada esta truncada en ese punto, por lo que la prueba completa no consta en la informacion disponible.

## Capacidades

- Realiza la transformacion |x>|c> -> |x + c*(2^32 - 1) mod 2^64>|c>, esto es, la reduccion controlada modulo el primo de Goldilocks.
- Condiciona la operacion al bit de control, pensado para recibir el bit de desbordamiento de una suma previa de 64 bits.
- Preserva el bit de control y devuelve las dos ancillas al estado |0> (limpieza verificada por medicion en simulacion).
- Se entrega en forma completamente desplegada, de modo que cada Toffoli, CNOT y X puede inspeccionarse y contarse individualmente.
- Incluye una reconstruccion en Python con Qiskit que reproduce el mismo circuito y ejecuta una bateria de pruebas exactas de vector de estado.
- Incluye un esbozo de formalizacion en Lean 4 del semantica reversible clasica de los pasos elementales.
- Portable a plataformas que acepten OpenQASM 3.0: IBM Quantum, Qiskit, Amazon Braket y otras.
- No tiene capacidades de generacion de texto, razonamiento, codigo, matematicas simbolicas, vision, audio, tool calling ni uso como agente.

## Casos de uso

- Aritmetica de cuerpos en circuitos criptograficos post-cuanticos: el circuito se integra como bloque de correccion dentro de un sumador modular mayor, aportando la reduccion modulo p con solo 2 ancillas cuando ya existe un bit de desbordamiento.
- Construccion de pruebas de conocimiento cero y sistemas tipo STARK sobre el primo de Goldilocks: sirve como pieza reutilizable para la capa aritmetica de un circuito verificador, con recuento de puertas conocido de antemano.
- Bloque de suma de 64 bits con reduccion: encadenado tras un sumador convencional, el Toffoli controlado por el bit de overflow completa la operacion modulo p sin registro de acarreo dedicado.
- Verificacion formal de circuitos reversibles: el esbozo en Lean 4 sobre la accion clasica de X, CNOT y Toffoli sirve como punto de partida para mecanizar la prueba completa de correccion y limpieza de ancillas.
- Validacion de compiladores y transpiladores cuanticos: al tener recuentos exactos y una forma desplegada, el circuito es un caso de prueba util para medir como traduce cada backend el patron ping-pong de acarreo.
- Estimacion de recursos para tolerancia a fallos: la profundidad de 128 Toffoli y el recuento de CNOT y X permiten calcular costes en puertas T y qubits fisicos para una futura implementacion con correccion de errores.
- Material docente sobre gestion de ancillas: ilustra con un ejemplo no trivial el intercambio entre profundidad y numero de qubits auxiliares en aritmetica cuantica reversible.
- Pruebas de integracion en CI: el oraculo clasico en Python permite comparar automaticamente cualquier reimplementacion contra el resultado esperado en cada commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay comparaciones con MMLU, HumanEval, GSM8K ni metricas de ese tipo, porque no es un modelo de lenguaje. La unica evidencia de rendimiento funcional es la verificacion descrita en la model card:

| Metodo de verificacion | Alcance | Resultado declarado |
|---|---|---|
| Oracilo clasico en Python | Comparacion de cada ejecucion con (x + c*(2^32 - 1)) mod 2^64 | Coincidencia en todos los casos probados |
| Simulacion exacta de vector de estado (AerSimulator) | 10 vectores: cero, suma de constante, acarreos de 1 bit, MSB, desbordamiento completo, suma = 2^64, valores proximos a p | Registro de datos correcto, control inalterado, ambas ancillas a cero |
| Esbozo formal en Lean 4 | Accion clasica de X, CNOT y Toffoli sobre 3 bits; pasos inferior y superior y sus inversos | Demostrado por analisis exhaustivo de casos; la composicion ping-pong queda como esbozo |

## Requisitos de hardware

- Qubits logicos necesarios: 67 (64 de datos, 1 de control, 2 ancillas). No hay version reducida documentada.
- Ejecucion en hardware real: fuera del alcance de los dispositivos NISQ actuales para obtener resultados fiables, porque la profundidad de 128 Toffoli implica, tras su descomposicion en puertas de dos qubits y T, un numero de operaciones muy superior al presupuesto de coherencia tipico. No se publica el recuento exacto tras descomposicion.
- Simulacion clasica: la model card afirma usar AerSimulator en modo statevector. Conviene advertir que una simulacion completa de vector de estado de 67 qubits exige 2^67 amplitudes, inviable en memoria clasica; lo probable es que el script explote la estructura de los vectores de prueba o una representacion reducida. No se especifica el metodo exacto en la informacion disponible.
- Alternativas de simulacion razonables: simulacion estabilizadora tras descomponer los Toffoli en Clifford+T, o simuladores especializados en circuitos con pocos no-Clifford; no confirmado por el autor.
- Despliegue: cualquier plataforma que acepte OpenQASM 3.0 (IBM Quantum, Qiskit, Amazon Braket). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- GPU recomendadas: no disponible. No se publican requisitos de VRAM, latencia ni throughput.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionan datos cuantitativos de alternativas en la informacion disponible. Como contexto cualitativo, la categoria de diseno comparable es la de sumadores cuanticos reversibles de bajo coste en ancillas, como el sumador ripple-carry de Cuccaro y variantes, los sumadores basados en transformada de Fourier y los sumadores de Gidney. La informacion aportada no incluye recuentos de puertas ni profundidades de esas alternativas, por lo que no es posible una comparacion numerica honesta.

| Alternativa | Parametros / qubits | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snapkitty/goldilocks-controlled-reduce | 67 qubits, 2 ancillas, 128 Toffoli, profundidad 128 | No aplica | Verificado por simulacion sobre 10 vectores; sin benchmarks comparativos | AGPL-3.0 | Hugging Face y GitHub, 0 descargas, 0 likes |
| Sumador ripple-carry de Cuccaro y similares | No disponible en la informacion proporcionada | No aplica | No disponible | No disponible | Literatura academica |
| Sumadores basados en QFT (tipo Draper) | No disponible en la informacion proporcionada | No aplica | No disponible | No disponible | Literatura academica |
| Sumadores de Gidney | No disponible en la informacion proporcionada | No aplica | No disponible | No disponible | Literatura academica |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona sobre lenguaje natural y no debe evaluarse con metricas de modelos de lenguaje. Cualquier expectativa de ese tipo es un error de categoria.
- La prueba formal en Lean 4 es un esbozo. La demostracion de la composicion ping-pong completa no consta en la informacion disponible, y la propia model card aparece truncada en ese punto.
- La simulacion de vector de estado a 67 qubits es cuestionable tal como se describe; conviene reproducir el script y confirmar el metodo antes de dar por validada la verificacion.
- Dependencia fuerte de la limpieza de ancillas: si la descomposicion o la transpilacion introducen errores, el esquema ping-pong propaga acarreos incorrectos por toda la cadena.
- Profundidad alta (128 capas de Toffoli): inadecuado para ejecucion directa en hardware NISQ sin correccion de errores.
- El circuito resuelve solo el paso de reduccion controlada; no implementa por si mismo una suma de 64 bits completa ni la aritmetica completa del cuerpo. Requiere un sumador previo que genere el bit de desbordamiento.
- Sin datos de sesgo, porque no hay datos de entrenamiento ni corpus; la seccion de sesgos de un modelo de lenguaje no aplica.
- Riesgo de alucinacion: no aplica al circuito, pero si a cualquier descripcion generada por terceros sobre el, dado que no hay benchmarks publicados.
- Licencia AGPL-3.0: es copyleft fuerte. El uso en un servicio en red obliga a ofrecer el codigo fuente correspondiente a los usuarios; conviene revisar la compatibilidad con el resto del pipeline antes de integrarlo en produccion.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta, y la fecha de publicacion declarada (octubre de 2026) es posterior a la fecha de creacion del registro, lo que sugiere un artefacto sin rodaje comunitario.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados eran contenido audiovisual sin relacion alguna con computacion cuantica y se han descartado por completo.
- Idiomas soportados: no disponible. La documentacion disponible esta en ingles.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Snapkitty/goldilocks-controlled-reduce
- Repositorio de origen (espejo): https://github.com/SNAPKITTYWEST/goldilocks-controlled-reduce
- Commit espejado: `3a029c3`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
- Resultados de busqueda web relevantes: ninguno; los enlaces devueltos no guardaban relacion con el modelo

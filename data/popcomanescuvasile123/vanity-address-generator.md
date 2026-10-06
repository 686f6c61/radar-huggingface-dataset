# Popcomanescuvasile123/vanity-address-generator

## Resumen

Este repositorio de Hugging Face no contiene un modelo de inteligencia artificial, sino una herramienta criptografica de linea de comandos publicada por el usuario Popcomanescuvasile123: un generador de direcciones "vanity" para Bitcoin y Ethereum que se ejecuta en local y produce un par direccion-clave privada. El autor, que escribe la documentacion en rumano, lo describe como una utilidad "100 % legal" en la que las claves generadas pertenecen al usuario, con la advertencia explicita de que la clave privada da acceso a los fondos y no debe compartirse.

El problema que resuelve es acotado y bien conocido en el ecosistema cripto: obtener una direccion cuyo prefijo o sufijo contenga una cadena elegida (por ejemplo `1Dan...` en base58 de Bitcoin o `0xdan...` en hexadecimal de Ethereum), algo que exige fuerza bruta sobre el espacio de claves. La pagina indica que el instrumento se ha validado con un self-test contra vectores oficiales de RIPEMD-160 y con un vector real de Bitcoin (clave privada `1` → direccion `1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH`), ademas de una "prindere reala" (captura real) tanto en BTC como en ETH.

Su relevancia para un blog de IA open source es, por tanto, indirecta: sirve como ejemplo de repositorio alojado en Hugging Face que no es un modelo, con cero descargas y cero "likes" en el momento de la consulta, licencia no declarada y sin pipeline asociado. La fecha de creacion que figura es el 5 de octubre de 2026 y la ultima actualizacion el mismo dia, unos nueve minutos despues.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de IA; es una herramienta criptografica en Python que usa derivacion ECDSA sobre secp256k1, RIPEMD-160, Keccak y codificacion base58check/WIF) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible como capacidad del modelo; la documentacion esta redactada en rumano y la interfaz de linea de comandos usa parametros en ingles (`--prefix`, `--suffix`, `--eth-prefix`, `--threads`) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no aplica; el artefacto distribuido es codigo fuente Python (`vanity.py`) y los resultados se escriben en texto plano en `vanity_found.txt` |
| Cadenas soportadas | Bitcoin (BTC) y Ethereum (ETH) |
| Dependencias | `pycryptodome` (RIPEMD-160/keccak si `hashlib` no los incluye); `gmpy2` opcional (2-4x de velocidad) |
| Salida | `vanity_found.txt` con direccion, clave privada en hexadecimal y WIF |
| Repositorio | Popcomanescuvasile123/vanity-address-generator |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento ni red neuronal. La herramienta implementa un bucle de fuerza bruta: genera candidatos de clave privada, deriva la clave publica con criptografia de curva eliptica secp256k1, calcula el hash correspondiente (RIPEMD-160 sobre SHA-256 para Bitcoin; Keccak-256 para Ethereum), codifica la direccion (base58check con prefijo de version y WIF para Bitcoin; hexadecimal con `0x` para Ethereum) y comprueba si el resultado coincide con el prefijo o sufijo solicitado. El proceso se repite de forma paralelizable mediante el parametro `--threads`.

La validacion declarada por el autor incluye un self-test con vectores oficiales de RIPEMD-160 y una comprobacion con un vector conocido de Bitcoin: la clave privada `1` debe producir la direccion `1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH`. Esta es la verificacion minima razonable para este tipo de utilidad, aunque en la informacion disponible no se detalla el conjunto completo de pruebas ni si se comprueba el camino de Keccak-256 de Ethereum contra vectores publicos.

## Capacidades

- Generacion de direcciones vanity de Bitcoin con prefijo (`--prefix 1Dan`) o sufijo (`--suffix X9`).
- Generacion de direcciones vanity de Ethereum con prefijo hexadecimal (`--eth-prefix dan`, equivalente a `0xdan...`).
- Ejecucion multihilo mediante `--threads N` para escalar el rendimiento en CPU.
- Generacion y exportacion de material de claves: direccion, clave privada en hexadecimal y formato WIF para Bitcoin.
- Escritura del resultado en un fichero de salida (`vanity_found.txt`).
- Aceleracion opcional con `gmpy2`, que segun el autor aporta entre 2 y 4 veces mas velocidad.
- Validacion interna mediante self-test con vectores de RIPEMD-160 y un vector real de Bitcoin.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, vision, audio ni ninguna capacidad de modelo de lenguaje.

## Casos de uso

- Marca personal en criptomonedas: un usuario genera una direccion de Bitcoin que empieza por su alias, por ejemplo `1Dan`, con un coste de unos 2 minutos en un portatil de 4 nucleos segun la tabla del autor, lo que permite tener una direccion reconocible en exploradores y exchanges.
- Etiquetado de direcciones de tesoreria: una empresa puede generar direcciones de Ethereum con un prefijo identificable (4 caracteres hex, unos minutos de calculo) para que las cuentas de sus distintas areas se distingan visualmente en registros contables y paneles internos.
- Servicio de personalizacion bajo encargo: el propio autor documenta la venta legal de direcciones vanity con sus claves privadas en foros cripto, grupos de Telegram o Fiverr, con precios tipicos de 5 a 50 dolares por 4 caracteres; el caso de uso exige contrato claro, entrega directa y no reutilizar nunca claves generadas para otros clientes.
- Direcciones de donacion y campanas: una organizacion puede generar una direccion con un sufijo recordable para una campana concreta, de modo que los donantes puedan verificarla de un vistazo y reducir el riesgo de errores de copia.
- Educacion en criptografia aplicada: el codigo sirve como material didactico para mostrar la cadena completa de derivacion (clave privada, secp256k1, hash160/Keccak, base58check, WIF) y el coste computacional real de buscar un prefijo de n caracteres, con la tabla de probabilidades incluida en la model card.
- Verificacion de entornos y dependencias: comprobar en una maquina concreta si `hashlib` incorpora RIPEMD-160 y Keccak, si `gmpy2` esta disponible y cuanto se gana con el, antes de invertir tiempo en una busqueda larga.
- Pruebas de rendimiento de hardware: medir la tasa de claves por segundo (el autor reporta aproximadamente 150.000 claves/s en 4 nucleos) y el escalado con el numero de hilos, util como carga de referencia intensiva en CPU.
- Auditoria de herramientas de terceros: usar el self-test con vectores conocidos para validar generadores similares antes de confiarles la creacion de claves reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para tareas de IA (MMLU, HumanEval, GSM8K u otros), porque no es un modelo de lenguaje. El unico dato de rendimiento aportado por el autor es la tasa de generacion y los tiempos medios de busqueda en un portatil de 4 nucleos a unas 150.000 claves por segundo:

| Objetivo | Cadena | Probabilidad por candidato | Tiempo medio declarado |
|---|---|---|---|
| 3 caracteres | BTC (base58) | 1 / 195.000 | ~2 minutos |
| 4 caracteres | BTC | 1 / 11.300.000 | ~1-2 horas |
| 5 caracteres | BTC | 1 / 656.000.000 | ~3-5 dias |
| 4 caracteres | ETH (hex) | 1 / 65.536 | ~minutos |
| 5 caracteres | ETH (hex) | 1 / 1.048.576 | ~10 minutos |

El autor senala que Ethereum es mas rapido de forzar porque su alfabeto hexadecimal tiene 16 simbolos frente a los 58 de base58 en Bitcoin, y que a partir de 6 caracteres es necesario recurrir a GPU. Estos tiempos no son extrapolables a otro hardware y no se acompanan de una metodologia de medicion detallada.

## Requisitos de hardware

- VRAM: no aplica; la herramienta se ejecuta en CPU y su consumo de memoria es despreciable frente a un modelo de IA.
- CPU: el autor reporta unos 150.000 claves/s en 4 nucleos; el rendimiento escala con el numero de hilos indicado en `--threads`.
- GPU: no se documenta ninguna implementacion en GPU; el autor indica que para 6 o mas caracteres hace falta GPU, pero no especifica modelos ni software compatibles.
- GPU de consumo: no disponible, ya que no hay ruta de ejecucion en GPU descrita.
- Aceleracion por software: `gmpy2` aporta entre 2 y 4 veces mas velocidad segun el autor; `pycryptodome` es necesario si `hashlib` no incluye RIPEMD-160 o Keccak.
- Opciones de despliegue: ejecucion directa con Python (`python vanity.py ...`); no se mencionan contenedores, vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta herramienta.
- Latencia y throughput: throughput aproximado de 150.000 claves/s en 4 nucleos; la latencia hasta encontrar una coincidencia depende exponencialmente de la longitud objetivo, tal como refleja la tabla anterior.

## Comparativa con modelos similares

La comparacion se establece con otros generadores de direcciones vanity, no con modelos de IA:

| Herramienta | Cadenas | Tipo de ejecucion | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| vanity-address-generator (Popcomanescuvasile123) | BTC y ETH | Python en CPU, multihilo, sin GPU documentada | no disponible | ~150.000 claves/s en 4 nucleos (dato del autor) |
| 1inch/profanity2 | Ethereum | generador de direcciones vanity en GPU/OpenCL | no disponible en la busqueda | no disponible |
| Vanito (vanito.org) | Bitcoin, BCH, BSV, eCash, Litecoin y otras | navegador, generacion en local sin enviar claves al servidor | no disponible en la busqueda | no disponible |
| Vanity.best (vanity.best) | BTC, ETH, SOL, Polygon, BSC y mas de 10 cadenas | generador en cliente, sin almacenamiento en servidor | no disponible en la busqueda | no disponible |
| EVMScope (evmscope.com/tools/vanity) | Ethereum (prefijos y sufijos, CREATE2 para contratos) | multihilo en navegador | no disponible en la busqueda | no disponible |

No hay datos publicos comparables de rendimiento entre estas herramientas en la informacion disponible, por lo que no es posible establecer una jerarquia objetiva mas alla de la diferencia cualitativa entre implementaciones en CPU y en GPU.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluacion con criterios de benchmarks de lenguaje, contexto o cuantizacion carece de sentido en este repositorio.
- Licencia no declarada: sin licencia explicita, el uso comercial del codigo queda en una situacion juridica ambigua; conviene contactar con el autor antes de integrarlo en un producto.
- Repositorio sin traccion verificable: 0 descargas y 0 likes, creado y actualizado el 5 de octubre de 2026, sin historial de mantenimiento ni comunidad que lo haya revisado.
- Superficie de seguridad critica: la herramienta manipula claves privadas. Debe ejecutarse en una maquina de confianza, sin conexion si es posible, y el fichero `vanity_found.txt` contiene el equivalente directo a los fondos; el propio autor advierte de no compartirlo ni publicarlo.
- Dependencia de terceros: el codigo requiere `pycryptodome` y opcionalmente `gmpy2`; no se documenta auditoria del codigo ni cadena de suministro de esas dependencias.
- Riesgo de falsos positivos por sufijo: una direccion cuyo patron aparece en el sufijo o en posiciones intermedias es mas facil de imitar por terceros; conviene verificar siempre la direccion completa antes de recibir fondos.
- Rendimiento limitado en CPU: alcanzar 5 caracteres en Bitcoin puede requerir de 3 a 5 dias de calculo continuo segun el propio autor, con el consumo electrico y el desgaste de hardware asociados.
- Documentacion en rumano: la model card no esta en castellano ni en ingles, lo que dificulta su verificacion por parte de revisores que no lean ese idioma.
- Ausencia de pruebas reproducibles publicadas: se cita un self-test con vectores oficiales de RIPEMD-160 y un vector real de Bitcoin (clave `1` → `1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH`), pero no se publican los scripts de prueba ni los resultados completos, ni la verificacion equivalente del camino de Ethereum.
- Advertencia legal y etica: la generacion de direcciones vanity es legal, pero la venta de claves privadas exige contratos claros, entrega segura y la garantia de no reutilizar claves; el mal uso puede derivar en perdida de fondos del cliente o en reclamaciones.
- Alucinacion y sesgos: no aplica, al no existir componente generativo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Popcomanescuvasile123/vanity-address-generator
- 1inch/profanity2 (generador vanity para Ethereum): https://github.com/1inch/profanity2
- iceBlockWare/profanity2 (fork del anterior): https://github.com/iceBlockWare/profanity2
- Vanito, generador vanity multichain en navegador: https://vanito.org/
- Vanity.best, generador vanity para BTC, ETH, SOL y otras cadenas: http://www.vanity.best/
- EVMScope, herramienta de generacion vanity para Ethereum: https://evmscope.com/tools/vanity

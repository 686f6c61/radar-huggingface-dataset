# Snapkitty/sovereign-agent-kernel

## Resumen

Snapkitty/sovereign-agent-kernel es un kernel de sistema operativo multiagente formalmente verificado, diseñado para ejecutarse en procesadores 6502 en bare metal. No se trata de un modelo de inteligencia artificial, sino de un componente de software de sistemas embebidos orientado a misiones espaciales. Lo desarrollan Ahmad Ali Parr y Jessica L. Williams bajo el proyecto SNAPKITTYWEST, y su propósito es proporcionar un entorno determinista y verificable para ejecutar cuatro agentes autónomos concurrentes con capacidades de criptografía post-cuántica, dinámica orbital y comunicación segura.

El kernel implementa un scheduler por interrupción de temporizador a 100 Hz, con cambio de contexto round-robin entre cuatro agentes (Inspector, Manipulador, Transporte y Relay). Cada agente dispone de 512 bytes de memoria privada y se comunica mediante buzones. El sistema completo ocupa 60 KB de código y sigue las reglas NASA-10+ para software de vuelo, todas ellas verificadas mediante tipos dependientes en Idris 2.

La relevancia actual radica en su enfoque de verificación formal aplicada a sistemas embebidos de alto riesgo, un área donde la industria aeroespacial busca garantías matemáticas de corrección. El kernel también forma parte de una "Sovereign Stack" más amplia que incluye un hipervisor ARM64 y motores de cadena de bloques tipo WORM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Procesador MOS 6502, bare metal |
| Parámetros totales | No aplicable (no es un modelo de parámetros) |
| Parámetros activos | No aplicable |
| Longitud de contexto | No aplicable |
| Tipos de cuantización | No aplicable |
| Idiomas soportados | No aplicable |
| Licencia | Tri-licencia: AGPL-3.0 \| BSL 1.1 → MIT \| MIT |
| Formato de pesos | No aplicable (código ensamblador 6502, fuente Forth, pruebas Idris) |

## Arquitectura y entrenamiento

El kernel está escrito en ensamblador 6502 para el núcleo (`src/kernel.asm`) y en Forth para el runtime de los agentes (`forth/`). El compilador Forth→6502 está implementado en Idris 2 (`idris/ForthTo6502.idr`), lo que permite verificar en tiempo de compilación propiedades como el tamaño de página (≤256 bytes por función), el recuento de ciclos y los efectos de pila. No existe un proceso de entrenamiento como en los modelos de IA; el desarrollo se basa en verificación formal de propiedades.

La arquitectura se organiza en torno a un scheduler de tiempo real con cuatro agentes, cada uno con 512 bytes de RAM privada distribuidos en diccionario, pila de datos, pila de retorno y buzón. La memoria se asigna estáticamente: cero heap, bucles acotados por tipos `Fin n`, y funciones limitadas a una página. Las reglas NASA-10+ se implementan como tipos dependientes en Idris 2, con 15 obligaciones de prueba cerradas (10 criptográficas y 5 de kernel).

El pipeline criptográfico combina SHA-512 (FIPS 180-4) con KangarooTwelve (K12) usando una separación de dominio "Sentinel Break" (0xFFFFFFFF). La dinámica orbital utiliza las ecuaciones de Clohessy-Wiltshire en punto fijo Q16.16, con multiplicación de matrices dispersas y verificación de preservación de energía (simpléctica).

## Capacidades

- Ejecución concurrente de cuatro agentes autónomos con scheduler round-robin determinista.
- Criptografía post-cuántica: hash SHA-512, K12 XOF, atestación de comandos con Ed25519.
- Dinámica orbital: propagación de Clohessy-Wiltshire en punto fijo, cálculo de maniobras.
- Telemetría sellada WORM (append-only, a prueba de manipulación).
- Verificación formal completa: 15/15 obligaciones de prueba cerradas en Idris 2.
- Compilación Forth→6502 con verificación de ciclos y tamaño de código.
- Sin asignación dinámica de memoria, sin recursión, con bucles estáticamente acotados.
- Soporte de buzones para comunicación entre agentes.
- Integración con el ecosistema Sovereign Stack (hipervisor ARM64, cadenas WORM, generador cuántico ANU).

## Casos de uso

- Sistemas de control de satélites pequeños: el kernel puede gestionar la actitud, la propulsión y las comunicaciones de un CubeSat con garantías de tiempo real y verificación formal.
- Misiones de inspección orbital: el agente Inspector puede realizar fotogrametría y hash de telemetría SHA-512 para asegurar la integridad de los datos.
- Operaciones de servicio en órbita: el agente Manipulador controla brazos robóticos con cinemática inversa y asignación de propulsores.
- Logística espacial: el agente Transporte calcula propagación orbital y maniobras de acoplamiento mediante ecuaciones de Clohessy-Wiltshire.
- Comunicaciones por relevo: el agente Relay gestiona el planificador TDMA y el libro mayor WORM para garantizar trazabilidad.
- Demostración de verificación formal en embebidos: sirve como referencia de cómo aplicar tipos dependientes a sistemas de vuelo reales, útil para investigación y educación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card proporciona algunos datos de rendimiento internos: el tick del scheduler tarda 84 ciclos máximo, el cambio de contexto 156 ciclos, la propagación CW 412 ciclos, y el bloque SHA-512 44,800 ciclos. No hay comparativas con otros sistemas similares.

## Requisitos de hardware

- Procesador 6502 (o compatible) con al menos 64 KB de memoria total (el kernel ocupa 60 KB de código y ~4 KB de datos estáticos).
- Sin requisitos de GPU, VRAM o memoria dinámica.
- El kernel está diseñado para bare metal, sin sistema operativo subyacente.
- Opciones de despliegue: se puede flashear directamente en una ROM o cargar en RAM, dependiendo del sistema.
- Latencia: determinista y acotada por los recuentos de ciclos documentados (por ejemplo, 44,800 ciclos por bloque SHA-512).
- Throughput: no especificado, pero el scheduler opera a 100 Hz.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este proyecto es un kernel de sistema operativo, no un modelo de aprendizaje automático. En el ámbito de kernels espaciales verificados, se podría comparar con el kernel de la sonda Juno o con sistemas como seL4 (verificado formalmente, pero para ARM/x86), aunque no hay datos directos de comparación en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni procesar lenguaje natural.
- Dirigido exclusivamente a hardware 6502, lo que limita su portabilidad a arquitecturas modernas.
- La licencia tri-licencia (AGPL, BSL, MIT) implica restricciones: la BSL 1.1 permite uso comercial bajo ciertas condiciones, pero pasa a MIT tras un periodo; debe revisarse el texto exacto de la licencia.
- El kernel requiere un entorno de verificación Idris 2 para reconstruir las pruebas; no es un sistema que se pueda modificar sin herramientas especializadas.
- La memoria limitada (4 KB de RAM total para agentes) restringe la complejidad de las tareas que puede ejecutar.
- No se proporcionan datos de pruebas en hardware real ni resultados de validación en vuelo; la información es de carácter técnico de diseño.
- La fecha de creación (2026-09-03) sugiere que el proyecto es muy reciente y posiblemente no ha sido sometido a pruebas extensivas.

## Enlaces

- [HuggingFace: Snapkitty/sovereign-agent-kernel](https://huggingface.co/Snapkitty/sovereign-agent-kernel)
- [Repositorio del ecosistema sovereign-hypervisor-arm64](https://github.com/SNAPKITTYWEST/sovereign-hypervisor-arm64) (referenciado en el modelo card)

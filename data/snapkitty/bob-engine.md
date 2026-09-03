# Snapkitty/bob-engine

## Resumen

BOB ENGINE es un motor de mundo virtual 3D estilo DOOM diseñado para agentes de IA soberanos, desarrollado por Snapkitty. Está escrito íntegramente en 961 líneas de ensamblador x86 NASM y se ejecuta en modo real como un archivo COM de DOS, utilizando VGA Mode 13h (320x200, 256 colores). El motor implementa un renderizado por raycasting DDA, una estructura BSP para el mapa, máquinas de estado para agentes enemigos y una cadena WORM con hash SHA-256 que serializa el estado del mundo cada 64 frames.

A diferencia de los modelos de aprendizaje automático convencionales, BOB ENGINE no es un modelo entrenado, sino un programa de bajo nivel que simula un entorno interactivo donde un agente soberano (el jugador) navega un mundo habitado por agentes restringidos (enemigos) con comportamientos cíclicos (PATROL → CHASE → ATTACK → DEAD). Su relevancia radica en demostrar cómo se puede construir un entorno de simulación ligero y determinista para probar algoritmos de IA, con un consumo de recursos mínimo y sin dependencias externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | x86 NASM assembly, VGA Mode 13h, formato COM (ORG 0x100) |
| Parametros totales | no disponible (no es un modelo de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (codigo ensamblador, sin NLP) |
| Licencia | no disponible |
| Formato de pesos | no disponible (codigo fuente .asm, binario COM) |

## Arquitectura y entrenamiento

BOB ENGINE no es un modelo entrenado, sino un programa escrito en ensamblador x86 que implementa un motor de juego completo. La arquitectura se divide en subsistemas: inicializacion (tablas trigonométricas, VGA, teclado, BSP, jugador, agentes, cadena WORM), bucle principal (entrada, actualizacion del jugador, actualizacion de IA, renderizado, volteo de buffer, tick WORM) y rutinas de soporte (raycasting DDA, proyeccion de sprites, HUD). El mapa es una cuadricula de 16x16 celdas, los agentes se gestionan mediante maquinas de estado finitas y la cadena WORM utiliza SHA-256 para encadenar snapshots del estado mundial cada 64 frames, comenzando con un bloque genesis con la magia "BOB" (0x424F42).

No hay datos de entrenamiento porque no existe un proceso de aprendizaje; el comportamiento de los agentes esta predefinido por las maquinas de estado y las reglas del motor. La innovacion tecnica reside en la eficiencia del codigo en ensamblador, el uso de punto fijo 16.16 para trigonometria y la serializacion criptografica del estado para trazabilidad.

## Capacidades

- Renderizado 3D por raycasting DDA en tiempo real a 320x200 con sombreado por distancia (cerca/media/lejos).
- Simulacion de agentes con maquinas de estado finitas (PATROL, CHASE, ATTACK, DEAD) que reaccionan a la proximidad del jugador.
- Movimiento y rotacion del jugador (agente soberano) con control por teclado via ISR de INT 9.
- Serializacion del estado mundial (posicion, angulo, salud, estados de agentes) en una cadena WORM con hash SHA-256 cada 64 frames.
- Construccion de un arbol BSP a partir del mapa de 16x16 celdas para particionamiento espacial.
- Proyeccion de sprites de agentes en columnas de pantalla con tamaño proporcional a la distancia.
- Interfaz HUD con barra de salud en la fila inferior.
- Ejecucion en DOS real o DOSBox sin dependencias externas.

## Casos de uso

- Simulacion de entornos para pruebas de algoritmos de navegacion: el motor proporciona un mundo deterministico y ligero donde se pueden evaluar estrategias de busqueda de caminos o evasion, gracias al raycasting y a la estructura BSP.
- Demostracion de tecnicas de programacion de bajo nivel: sirve como material didactico para ensamblador x86, VGA, manejo de interrupciones y optimizacion de renderizado en tiempo real.
- Base para experimentos con agentes autonomos: las maquinas de estado de los enemigos pueden modificarse para probar comportamientos emergentes o algoritmos de toma de decisiones en un entorno cerrado.
- Verificacion de integridad de estado en simulaciones: la cadena WORM con SHA-256 permite auditar el historial de estados, util en aplicaciones donde se requiere trazabilidad de eventos.
- Prototipo de juego retro: el codigo puede adaptarse para crear un juego completo estilo DOOM con fines educativos o artisticos, aprovechando su tamaño reducido y su compatibilidad con DOSBox.
- Investigacion en sistemas embebidos: al ser un binario COM de menos de 64 KB, puede ejecutarse en hardware muy limitado, sirviendo como referencia para entornos de simulacion en sistemas sin sistema operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un programa en ensamblador, el rendimiento depende del hardware subyacente (emulador o DOS real) y no hay metricas estandarizadas comparables con modelos de IA.

## Requisitos de hardware

- Ejecucion en DOSBox o DOS real; no requiere GPU dedicada.
- Memoria: menos de 64 KB para el binario COM, mas 64 KB para el back buffer (64000 bytes) y tablas de datos.
- CPU: cualquier procesador x86 compatible con modo real; en DOSBox se recomienda una configuracion de ciclos de al menos 3000 para fluidez.
- Sin requisitos de VRAM; la salida se realiza directamente a la memoria VGA (A000:0000).
- Despliegue: compilar con NASM (`nasm -f bin src/bob_engine.asm -o bob.com`) y ejecutar en DOSBox o en una maquina con DOS.
- No aplican opciones de despliegue como vLLM, Ollama o TGI, al no ser un modelo de inferencia.

## Comparativa con modelos similares

No disponible. BOB ENGINE no pertenece a la categoria de modelos de IA generativa o de aprendizaje automatico; es un motor de simulacion en ensamblador. No existen alternativas comparables en el mismo espacio de "modelos de mundo" con estas caracteristicas tecnicas.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no procesa lenguaje natural, imagenes ni audio; es un motor de simulacion determinista.
- Resolucion fija de 320x200 y paleta de 256 colores, limitada para aplicaciones modernas.
- Requiere un entorno DOS o DOSBox; no es portable a sistemas operativos actuales sin emulacion.
- El codigo esta en ensamblador x86, lo que dificulta su mantenimiento o extension por desarrolladores no familiarizados con esta arquitectura.
- No se especifica licencia, por lo que el uso comercial o la redistribucion pueden estar sujetos a restricciones legales no definidas.
- La cadena WORM utiliza SHA-256, pero no se detalla el proposito criptografico mas alla de la serializacion; no debe considerarse un sistema de seguridad robusto.
- No hay soporte para multiples idiomas ni capacidades de procesamiento de texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/bob-engine
- No se han encontrado otros enlaces (papers, blogs, repositorios de codigo) en la informacion proporcionada.

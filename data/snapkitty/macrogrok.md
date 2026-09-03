# Snapkitty/MACROGROK

## Resumen

MACROGROK es un modelo de control embebido de tarea extremadamente estrecha, diseñado por Snapkitty y respaldado por BEL ESPRIT D ACCORD TRUST HOLDINGS INC. No se trata de un modelo de lenguaje ni de una red neuronal convencional, sino de un conjunto de macros y rutinas en ensamblador inspiradas en el Apollo Guidance Computer (AGC) de la NASA. Su propósito es ejecutar correcciones de actitud, compensación de trayectoria, decisiones binarias o multiclase y leyes de control de baja dimensión en entornos de punto fijo de 15 bits (Qm.n), con código residente en ROM y estado en aproximadamente 2K palabras de RAM.

La relevancia actual del modelo radica en su enfoque de eficiencia extrema: cada bit está presupuestado, usando tablas de consulta, interpolación y aritmética de punto fijo en lugar de operaciones de coma flotante. Esto lo hace adecuado para sistemas embebidos con recursos mínimos, como microcontroladores, satélites pequeños o controladores industriales donde el consumo energético y el espacio de memoria son críticos. Su arquitectura no es neuronal, sino una colección de macros que implementan operaciones vectoriales, funciones de activación y actualización de estado con semántica de ensamblador AGC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Macro-modelo de punto fijo inspirado en AGC (no neuronal) |
| Parametros totales | No aplica (codigo en ROM, tablas de constantes) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entrada/salida tipicamente ≤ 8–16 valores) |
| Tipos de cuantizacion | Punto fijo Qm.n (Q1.14, Q3.12, Q7.8) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Codigo ensamblador y tablas en ROM (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura de transformer, MoE ni SSM. Es un conjunto de macros de ensamblador que ejecutan un paso de inferencia determinista: adquisicion y escalado de entrada, transformacion opcional de caracteristicas, bloques nucleo (multiplicacion matriz-vector y no linealidad), actualizacion de estado (si es recurrente), escalado de salida y saturacion. Las operaciones se limitan a desplazamientos, sumas, multiplicaciones de 16 bits y busquedas en tablas, sin coma flotante. El entrenamiento, si existe, no se documenta en la informacion proporcionada; los pesos y sesgos se almacenan como constantes en ROM y nunca se modifican en tiempo de ejecucion. La inicializacion copia los valores necesarios a la RAM en el arranque.

No se menciona el uso de RLHF, DPO ni ningun metodo de aprendizaje automatico. El diseno sigue los principios de presupuesto de bits, tablas sobre aritmetica general, bucles desenrollados y estado mutable minimo. El ejemplo `INFER4` ilustra un clasificador binario de 4 entradas con punto fijo Q1.14 y acumulador de 32 bits Q7.24.

## Capacidades

- Control de actitud y correccion de trayectoria para sistemas de guiado.
- Decisiones binarias o multiclase de baja dimension (tipicamente ≤ 8–16 entradas/salidas).
- Leyes de control de baja dimensionalidad con actualizacion de estado recurrente.
- Procesamiento de senales con aritmetica de punto fijo y saturacion configurable.
- Ejecucion determinista y predecible en tiempo real, sin dependencia de librerias externas.
- Soporte para envoltura ejecutiva opcional con prioridades y omision de secciones no criticas bajo presion.
- Sin capacidades de lenguaje natural, vision, audio ni generacion de texto.

## Casos de uso

- Control de actitud de nanosatelites: el modelo puede ejecutar correcciones de orientacion usando sensores de bajo costo y actuadores limitados, con una ventana de RAM de ~2K palabras y codigo en ROM.
- Compensacion de deriva en sistemas de navegacion inercial: integra actualizaciones de estado recurrentes para suavizar lecturas de giroscopios y acelerometros.
- Decisiones de seguridad en sistemas criticos: clasificacion binaria de condiciones de fallo (por ejemplo, presion, temperatura) con salidas discretas y flags de validez/saturacion.
- Control de actuadores en robótica de bajo consumo: ley de control proporcional con saturacion, implementada con macros de punto fijo y sin coma flotante.
- Filtrado de senales en microcontroladores de 8/16 bits: aplicacion de promedios ponderados (como `UPDATE_STATE_3_4`) para suavizado en tiempo real.
- Educacion y prototipado de sistemas embebidos: sirve como referencia para implementar redes de punto fijo en ensamblador, con simulador en Python incluido (`src/sim.py`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de control embebido sin metricas estandar de ML (MMLU, HumanEval, GSM8K), no existen datos comparables.

## Requisitos de hardware

- No requiere GPU ni aceleradores neuronales; funciona en cualquier CPU con soporte para aritmetica de 16/32 bits.
- Memoria minima: ~2K palabras de RAM para estado y temporales, mas ROM para codigo y constantes (tamano no especificado).
- Diseñado para microcontroladores y sistemas embebidos; no aplica VRAM ni GPUs.
- Opciones de despliegue: ensamblador directo en el target, o simulacion con `python src/sim.py`.
- Latencia: no disponible, pero al ser bucles desenrollados y operaciones de punto fijo, se espera ejecucion en microsegundos en hardware de 16 MHz o superior.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en el ecosistema de ML convencional; el AGC original (Block II) es el referente historico, con 2048 palabras erasables y 36864 palabras fijas, mientras que MACROGROK apunta a ~2K palabras erasables. No hay alternativas comerciales directas documentadas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni de proposito general; solo ejecuta tareas de control muy estrechas definidas por el usuario.
- La licencia no esta especificada; el aviso indica "Patent Pending" de BEL ESPRIT D ACCORD TRUST HOLDINGS INC., por lo que el uso comercial podria estar restringido.
- No se documentan sesgos, pero al ser un sistema determinista, no presenta alucinaciones; sin embargo, los errores de punto fijo (saturacion, overflow) deben manejarse explicitamente.
- No soporta idiomas ni procesamiento de texto.
- La documentacion es minima y carece de ejemplos de validacion en hardware real.
- La responsabilidad del diseno recae en el usuario: cada variable debe documentar su formato Qm.n, unidades, escala y comportamiento de overflow.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Snapkitty/MACROGROK
- Referencia AGC (Virtual AGC Manual): https://www.ibiblio.org/apollo/assembly_language_manual.html
- AGC en Wikipedia: https://en.wikipedia.org/wiki/Apollo_Guidance_Computer

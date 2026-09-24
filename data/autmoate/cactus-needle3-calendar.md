# autmoate/cactus-needle3-calendar

## Resumen

`autmoate/cactus-needle3-calendar` es un ajuste fino local (LoRA) del modelo base `Cactus-Compute/needle3`, un modelo fundacional de 121 M de parametros y 20 capas orientado a tool calling en dispositivos de borde. Lo desarrolla el usuario `autmoate` y lo publica como artefacto de investigacion, no como opcion de produccion por defecto. Su proposito concreto es actuar como agente de calendario en aleman sobre cinco herramientas de produccion (`calendar_list`, `calendar_find_slot`, `calendar_create`, `calendar_move`, `calendar_delete`).

La caracteristica diferencial del modelo es la descomposicion de peticiones multiaccion: varias llamadas a herramientas en un solo turno (0,90 de acierto en `all_actions` frente a 0,30 del ajuste de Needle 2). En cambio, no supera al ajuste de Needle 2 en precision atomica (0,886 exacto frente a 0,977). El autor lo posiciona explicitamente como el candidato para el rol de descomposicion dentro de una cascada, complementando a un modelo atomico mas preciso.

El artefacto exportado ocupa 63,4 MB en formato `.cact` (20 capas completas) y esta ligado a la version de motor `cactus-needle==3.0.4`. Se distribuye bajo licencia Apache-2.0, heredada del modelo base, y esta entrenado sobre un mix de preservacion de 25 072 filas con aleman como idioma principal e ingles simple como secundario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; heredada del modelo base Needle 3 (121 M de parametros, 20 capas, escala de profundidad seleccionable de 2 a 20) |
| Parametros totales | 121 M (modelo base); el ajuste LoRA no anade parametros en inferencia |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 1024 tokens (longitud maxima usada en el ajuste) |
| Tipos de cuantizacion | QAT (quantization-aware training) aplicado a traves del esquema de exportacion; el modelo base Needle 3 se distribuye en archivos de 8-29 MB con cuantizacion de 2 bits |
| Idiomas soportados | Aleman (principal), ingles simple |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | `.cact` (exportacion de las 20 capas completas, 63,4 MB), ligado a la version de motor |

## Arquitectura y entrenamiento

El modelo parte de `Cactus-Compute/needle3`, un modelo fundacional de automatizacion para dispositivos pequenos cuyo diseno permite seleccionar la profundidad (de 2 a 20 capas) como si fueran modelos independientes dentro de una misma escala de inteligencia. En este ajuste se conserva la configuracion completa de 20 capas. El metodo de adaptacion es un LoRA local de rango 32 y alpha 32, entrenado durante 5 epochs con batch de 16, longitud maxima de 1024 tokens y semilla 42, con QAT aplicado a traves del esquema de exportacion. El entrenamiento se ejecuto en una instancia Modal A100-40GB durante 6630 segundos (aproximadamente 110 minutos).

El conjunto de datos es el denominado "v4 preservation mix", con 25 072 filas compuestas por un 71,5 % de ejemplos atomicos, un 17,8 % de peticiones multi-llamada independientes y un 10,7 % de negativos y casi-negativos. El dataset no se publica (revision de privacidad pendiente), pero es determinista y regenerable mediante `experiments/ft/build_v4.py` con semilla 42 a partir de los cinco esquemas de herramientas de produccion. La convencion de anotacion es dispersa y basada solo en evidencia: los argumentos contienen unicamente fragmentos literales de la consulta y los campos opcionales sin evidencia se omiten (se admite `arguments: {}`); la resolucion a tiempos absolutos e identificadores se delega deterministicamente a Python en etapas posteriores.

## Capacidades

- Tool calling y function calling sobre un conjunto fijo de cinco herramientas de calendario, con orden de esquemas congelado.
- Peticiones multiaccion: resuelve varias llamadas a herramientas dentro de un mismo turno (0,90 en `all_actions` sobre 10 casos del banco congelado).
- Rechazo de peticiones fuera de dominio: 100 % de precision en el eje de off-topic refusal y 0,00 % de falsos rechazos sobre peticiones validas.
- Extraccion de argumentos ancorados en el texto de la consulta, sin inferir valores no evidenciados.
- Generacion de argumentos con campos opcionales omitidos de forma explicita, siguiendo la convencion de anotacion del dataset.
- Idiomas: aleman como idioma principal de operacion e ingles simple como secundario.
- No cubre razonamiento multi-paso ni continuacion multi-turno: esas funciones quedan deliberadamente fuera del modelo y se delegan a Python o a un planificador.

## Casos de uso

- Agente de calendario en aleman sobre dispositivo local: el modelo recibe una frase como "Trag morgen 10 Uhr Zahnarzt ein und Freitag 15 Uhr Sport" y devuelve las llamadas a `calendar_create` correspondientes, con los argumentos extraidos literalmente de la consulta. Encaja en asistentes personales donde la consulta no debe salir del dispositivo.
- Rol de descomposicion en una cascada de agentes: se combina con un modelo atomico mas preciso (por ejemplo el ajuste de Needle 2) para que este resuelva los argumentos exactos, mientras el ajuste de Needle 3 se encarga de partir peticiones con varias acciones en llamadas independientes.
- Guardarrail de dominio en un asistente de agenda: con un 100 % de precision en rechazo de peticiones fuera de tema y 0,00 % de falsos rechazos, sirve como primera etapa para descartar consultas no relacionadas con el calendario antes de invocar herramientas.
- Agente de voz en hardware embebido: con una latencia mediana de 188 ms y un artefacto de 63,4 MB, es viable ejecutarlo en una Raspberry Pi o en un dispositivo vestible para transcripciones de agenda dictadas.
- Automatizacion de domotica con reglas temporales: las herramientas de creacion, movimiento y borrado de eventos permiten traducir instrucciones habladas a operaciones sobre un calendario local en un asistente de casa inteligente.
- Extraccion estructurada de instrucciones en aleman dentro de un pipeline: la salida en forma de llamadas a funciones con argumentos limitados a fragmentos literales facilita el volcado a JSON y su validacion determinista posterior en Python.
- Prototipado e investigacion de ajustes LoRA sobre Needle 3: el repositorio incluye el plan de entrenamiento reproducible (`v4:r32:e5`, semilla 42, batch 16), lo que permite replicar y comparar variantes sobre los mismos conjuntos de test congelados.

## Benchmarks y rendimiento

Resultados del banco de pruebas congelado del repositorio, comparados con el ajuste de referencia `autmoate/cactus-needle2-calendar`:

| Eje | Este modelo | Needle-2 FT (referencia) |
|---|---|---|
| A1 atomico herramienta / argumentos / exacto | 1,000 / 0,889 / 0,886 | 0,991 / 0,977 / 0,977 |
| A1 argumentos en reto / exacto | 0,720 / 0,600 | 0,840 / 0,680 |
| A2 multi-llamada en un turno (10 casos, `all_actions`) | 0,90 | 0,30 |
| Precision de rechazo fuera de tema | 100 % | 97,5 % |
| Falsos rechazos en peticiones validas | 0,00 % | 0,31 % |
| C produccion E2E (`final_db_ok`, 25 casos) | 80 % | 72 % |
| Latencia mediana | 188 ms | 261 ms |

El autor senala que las epochs 3 a 5 son las que marcan la diferencia (atomico 0,739 → 0,877 → 0,886) y que el techo atomico se estabiliza en torno a 0,89, por lo que el modelo no alcanza al ajuste de Needle 2 en ese eje. No se especifica el hardware empleado en la medicion de latencia.

## Requisitos de hardware

- El artefacto exportado ocupa 63,4 MB para 121 M de parametros, lo que equivale a unos 4,2 bits por parametro. Como referencia aritmetica, los mismos parametros en fp16 ocuparian aproximadamente 242 MB y en int8 unos 121 MB.
- El modelo base esta disenado para telefonos, dispositivos vestibles, robots, domotica, automocion y microcontroladores, con archivos de 8 a 29 MB segun la profundidad seleccionada.
- El prompt de sistema del ejemplo de uso declara `device: raspberry-pi`, de modo que el despliegue previsto es de borde, sin GPU dedicada.
- Cabe holgadamente en cualquier GPU de consumo (por ejemplo, una RTX 4090) y tambien en CPU, dado el tamano del artefacto.
- Para el ajuste se utilizo una A100-40GB en Modal durante 6630 segundos; ese dato corresponde al entrenamiento, no a la inferencia.
- Despliegue: requiere el runtime `cactus-needle==3.0.4` y construir el artefacto con `needle build`. El formato `.cact` esta ligado a la version de motor, por lo que un archivo generado con otra version no cargara. No hay informacion disponible sobre soporte en vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia: 188 ms de mediana en el banco de pruebas del repositorio. No hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exacto atomico | Multi-llamada | Licencia | Formato |
|---|---|---|---|---|---|---|
| `autmoate/cactus-needle3-calendar` (este) | 121 M (base) | 1024 tokens | 0,886 | 0,90 | Apache-2.0 | `.cact`, 63,4 MB, atado a motor 3.0.4 |
| `autmoate/cactus-needle2-calendar` | No disponible | No disponible | 0,977 | 0,30 | No disponible | No disponible |
| `Cactus-Compute/needle3` (base) | 121 M, 20 capas | No disponible | No disponible | No disponible | Apache-2.0 | Archivos de 8-29 MB, 2 bits |

El ajuste de Needle 2 es la referencia declarada por el propio autor para maxima precision atomica, mientras que este ajuste asume el rol de descomposicion multi-llamada. El modelo base `Cactus-Compute/needle3` no incluye el ajuste especifico de calendario ni sus esquemas de herramientas.

## Limitaciones y advertencias

- No es el mejor llamador atomico: 0,886 exacto frente a 0,977 del ajuste de Needle 2. El autor lo publica como artefacto de investigacion, no como opcion de produccion por defecto.
- Carece de confianza calibrada: el ajuste fino local no entrena la cabeza de confianza y `needle build` la elimina, de modo que el campo `confidence` es `None`. No debe usarse para enrutar decisiones.
- Las cadenas dependientes de resultados no estan resueltas (`find_slot → create` y similares: 0 de 10). El modelo no traslada el resultado de una herramienta, como un hueco devuelto, a la siguiente llamada; para esos objetivos hace falta un planificador explicito.
- Es sensible al conjunto de herramientas: reducirlo a solo escritura degrada la precision de 0,886 a 0,816. Espera el contexto completo de las cinco herramientas.
- Esta entrenado para llamadas de un solo turno. La logica de colisiones, la planificacion multi-paso y la continuacion multi-turno quedan fuera del modelo de forma intencionada.
- El artefacto `.cact` esta atado a la version de motor: requiere `cactus-needle==3.0.4` o el motor de plataforma de esa generacion. Un archivo construido con otra version no cargara.
- El dataset de entrenamiento no se ha publicado (revision de privacidad pendiente), aunque es determinista y regenerable.
- La cobertura linguistica se limita al aleman como idioma principal y a un ingles simple; no hay datos de rendimiento en otros idiomas.
- No se han documentado sesgos especificos ni tasas de alucinacion en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autmoate/cactus-needle3-calendar
- Modelo base: https://huggingface.co/Cactus-Compute/needle3
- Pagina del producto Needle 3 (Cactus Compute): https://cactuscompute.com/needle
- Repositorio en GitHub: https://github.com/cactus-compute/needle
- Articulo divulgativo sobre el despliegue en dispositivo: https://www.mindstudio.ai/blog/cactus-needle-3-on-device-tool-calling-model
- Modelo previo de la familia (referencia de maxima precision atomica): https://huggingface.co/autmoate/cactus-needle2-calendar

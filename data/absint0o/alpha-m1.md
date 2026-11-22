# absint0o/alpha-m1

## Resumen

Alpha M1 es un modelo de generación de texto especializado en *tool calling* y control de máquinas, desarrollado por WSP Labs y derivado de Needle 3 de Cactus Compute. Se distribuye en dos variantes de profundidad (20L con 121M de parámetros y 16L con 98M), ambas empaquetadas en formato `.cact` con cuantización de 2 y 4 bits, lo que da lugar a archivos de entre 28,9 MB y 35,3 MB. Su orientación es el despliegue en dispositivos de borde (*edge AI*) para tareas de invocación de funciones en entornos IoT, domótica y control de acciones móviles.

La particularidad técnica del modelo es que **no se ha reentrenado**: los pesos empaquetados, el tokenizador y el diseño de archivos son idénticos byte a byte al archivo base de Needle 3. La modificación consiste en la edición de 25 escalares FP16 (0,0000207% de los parámetros de la variante 20L) en la cabeza de confianza, sin pasos de gradiente. El objetivo es corregir la calibración: el modelo base a menudo genera la llamada de herramienta correcta pero con una confianza demasiado baja, lo que provoca que la pasarela de confianza del runtime la suprima.

El modelo es relevante ahora porque demuestra una técnica de *weight-space programming* aplicada a modelos cuantizados: en lugar de reentrenar, se ajustan únicamente los escalares que escalan linealmente los pesos reconstruidos (normas de grupo FP16 y sesgo FP16), preservando la integridad del archivo original y permitiendo parches dispersos reproducibles. La licencia Apache 2.0 facilita su uso comercial, aunque el soporte lingüístico se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Needle 3 (Cactus Compute), con cabeza de confianza |
| Parametros totales | 121M (20L) / 98M (16L) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2 bits y 4 bits empaquetados (codebook-quantized blocks) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (formato propio de Cactus Compute) |

## Arquitectura y entrenamiento

Alpha M1 hereda la arquitectura de Needle 3, un transformer compacto orientado a *tool calling* en dispositivos de borde. Los pesos se almacenan como bloques cuantizados con códigos de 2 o 4 bits más una norma FP16 por cada grupo de 128 entradas. El modelo no ha sido reentrenado: los 25 escalares modificados pertenecen a la cabeza de confianza (tensor `578`, `confidence_head.proj`, con 24 normas de grupo FP16 de un tensor 1×3072 en 4 bits; y tensor `579`, `confidence_head.bias`, un sesgo FP16 que pasa de -0,003407 a -2,1621).

El ajuste se realizó mediante un solver de forma cerrada con *ridge* centrado en la identidad, que contrae cada escala hacia 1 salvo que los datos justifiquen el movimiento. El solver solo ve datos sintéticos de calibración muestreados por rechazo contra un índice de hash de los benchmarks sellados. Un candidato se acepta únicamente si supera una pasarela de *zero-break* sobre datos retenidos; otros cinco candidatos fueron descartados para el archivo 20L. Los parches dispersos y el registro completo (`surgery_ledger.json`) están publicados en el repositorio del proyecto.

## Capacidades

- Generación de llamadas a funciones (*function calling* / *tool calling*) con argumentos estructurados.
- Control de máquinas y dispositivos IoT: encendido, ajuste de niveles, acciones sobre zonas.
- Acciones móviles (*mobile actions*) para asistentes en dispositivos.
- Extracción de entidades en dominios como DSTC8 y SNIPS.
- Razonamiento de un solo paso orientado a la selección de herramienta y parámetros.
- Salida con puntuación de confianza asociada a cada llamada, con soporte de pasarela de confianza en el runtime.
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- **Domótica y control de iluminación**: el modelo interpreta instrucciones como "Dim the cellar lights to 45 percent" y genera la llamada `set_light_level` con los parámetros `light_zone` y `level_percent`. Su tamaño (35 MB en 20L) permite ejecutarlo en el propio hub domótico sin conexión a la nube.
- **Asistentes de voz en dispositivos de borde**: integrado en altavoces o paneles con recursos limitados, traduce comandos en lenguaje natural a llamadas de API locales, con la pasarela de confianza a 0,40 para filtrar invocaciones dudosas.
- **Automatización de acciones móviles**: en suites como Mobile Actions, el modelo mejora un 8,95 pp sobre la base (48,2% frente a 39,2%), lo que lo hace adecuado para agentes que ejecutan acciones en apps móviles.
- **Extracción de entidades en pipelines de datos**: en DSTC8 y SNIPS, el modelo puede usarse para extraer campos estructurados de texto conversacional, aunque con tasas de acierto bajas (8,1% y 4,6% respectivamente) que limitan su uso a tareas auxiliares.
- **Invocación de herramientas en agentes BFCL**: con un 44,6% en BFCL v4, puede integrarse como capa de selección de herramienta en agentes que necesitan decidir qué función invocar y con qué argumentos.
- **Prototipado de control de máquinas en laboratorio**: el formato `.cact` y el runtime `cactus.Needle` permiten desplegar el modelo en un script de Python de pocas líneas, lo que facilita pruebas de concepto de control de máquinas sin infraestructura de GPU.

## Benchmarks y rendimiento

Resultados publicados para Alpha M1 20L (121M) con pasarela 0,10 (por defecto):

| Suite | n | Base | Alpha M1 | Delta | Ganancias / pérdidas | p (una cola) |
|---|---|---|---|---|---|---|
| Cactus Official Envs | 192 | 77,6% | 77,1% | -0,52 pp | 2 / 3 | 0,8125 |
| Mobile Actions | 961 | 39,2% | 48,2% | +8,95 pp | 86 / 0 | 1,3e-26 |
| DroidCall | 200 | 33,0% | 34,0% | +1,00 pp | 2 / 0 | 0,25 |
| BFCL v4 | 1000 | 42,8% | 44,6% | +1,80 pp | 36 / 18 | 0,0099 |
| DSTC8 (extracción) | 1813 | 6,9% | 8,1% | +1,21 pp | 22 / 0 | 2,4e-07 |
| SNIPS (extracción) | 1400 | 4,2% | 4,6% | +0,43 pp | 6 / 0 | 0,0156 |
| IoT simulator | 110 | 19,1% | 19,1% | +0,00 pp | 1 / 1 | 0,75 |

El protocolo emplea siete suites selladas (5.676 ítems por modelo), comparación pareada ítem a ítem, test exacto de McNemar sobre pares discordantes e intervalos de Wilson al 95%. No se aplica corrección por multiplicidad. Los resultados con pasarela 0,40 (producción) solo están parcialmente disponibles en la información proporcionada: para Cactus Official Envs la base cae al 57,0% (el dato de Alpha M1 no está disponible en el fragmento).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las configuraciones; los archivos pesan 35,3 MB (20L) y 28,9 MB (16L) en cuantización de 2 y 4 bits.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está diseñado para CPU y aceleradores de borde.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores y SBCs con memoria suficiente para el runtime.
- Opciones de despliegue: `cactus-compute` (runtime oficial, `cactus.Needle`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Alpha M1 20L | 121M | No disponible | `.cact` (2/4 bits) | Apache 2.0 | Tool calling en borde |
| Alpha M1 16L | 98M | No disponible | `.cact` (2/4 bits) | Apache 2.0 | Tool calling en borde |
| Needle 3 (base) | 121M / 98M | No disponible | `.cact` (2/4 bits) | No disponible en la información | Tool calling en borde |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documentan capacidades multilingües.
- Las tasas de acierto en extracción (DSTC8 8,1%, SNIPS 4,6%) son muy bajas y limitan su uso fuera de tareas de invocación de herramientas.
- El rendimiento en Cactus Official Envs empeora ligeramente (-0,52 pp) y en IoT simulator no mejora (0,00 pp).
- La mejora se concentra en Mobile Actions (+8,95 pp); en otras suites el delta es pequeño y algunos p-valores son limítrofes (DroidCall p=0,25, SNIPS p=0,0156).
- No se aplica corrección por multiplicidad en los tests estadísticos, por lo que los p-valores limítrofes deben interpretarse con cautela.
- El ajuste se realizó sobre datos sintéticos; el riesgo de sobreajuste a la calibración de confianza no está cuantificado en la información disponible.
- Riesgo de alucinación en la selección de herramienta y parámetros no documentado explícitamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Needle 3 tiene licencia no especificada en la información proporcionada; conviene verificar la compatibilidad.
- El formato `.cact` y el runtime `cactus-compute` son específicos del ecosistema Cactus, lo que limita la portabilidad a otros stacks de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/absint0o/alpha-m1
- Informe interactivo del laboratorio: https://johnnypbelo.github.io/wsp-labs/#/models/alpha-m1
- Repositorio y pipeline reproducible: https://github.com/JohnnyPBelo/wsp-labs
- Modelo base Needle 3: https://huggingface.co/Cactus-Compute/needle3

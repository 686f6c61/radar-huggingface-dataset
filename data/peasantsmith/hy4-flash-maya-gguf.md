# peasantsmith/Hy4-Flash-Maya-GGUF

## Resumen

Hy4-Flash Maya GGUF es una familia de cuantizaciones GGUF del modelo multimodal Tencent Hy4-flash, publicada por el usuario peasantsmith para el proyecto de inferencia Project Maya. El modelo base es un Mixture-of-Experts de 220.000 millones de parametros que combina un backbone de lenguaje de 155.500 millones con 512 expertos por capa, 63.500 millones de parametros en tablas n-gram ("Engram"), un codificador de vision y un drafter DFly2 para decodificacion especulativa. Soporta una ventana de contexto de 1.048.576 tokens y entrada image-text-to-text.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 220B en hardware de consumo mediante cuantizaciones de 2 a 5 bits, con un esquema poco habitual en el que la tabla n-gram de 63,4 GB permanece en SSD y se lee pagina a pagina durante la inferencia, de modo que no necesita caber en RAM ni en VRAM. El autor reporta metricas de fidelidad frente al modelo original en precision completa (hasta 96,6 % de coincidencia en el token superior y divergencia KL de 0,012 en la variante Maya-L).

Hay cuatro tamanos (Maya-XS, S, M y L) mas una variante especifica para GPUs de menos de 10 GB. El repositorio ocupa 376,6 GB y acumula 295.828 descargas, lo que indica una adopcion notable pese a lo reciente de su publicacion (noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts multimodal (transformer MoE + tablas n-gram Engram + codificador de vision + drafter DFly2) |
| Parametros totales | 218.938.353.741 (aprox. 220B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | IQ2_XXS, IQ2_S, IQ3_XXS, IQ4_XS, Q5_K (segun variante) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | GGUF (mas mmproj para vision y .dfly2 para el drafter) |

## Arquitectura y entrenamiento

El modelo base combina un backbone de lenguaje de 155.500 millones de parametros con 512 expertos por capa, al que se anaden 63.500 millones de parametros en tablas n-gram denomidadas "Engram", un codificador de vision y un drafter DFly2 para decodificacion especulativa. La ventana de contexto alcanza 1.048.576 tokens. Dispone de dos modos de razonamiento: thinking con `reasoning_effort` en `high` (por defecto) y respuestas directas mediante `no_think`; el autor indica que el modelo no esta disenado para otros niveles intermedios.

Las cuantizaciones se generaron con un proceso de calibracion en el formato de chat propio del modelo, incluyendo thinking, con mezcla de conversaciones y en gran parte respuestas del propio modelo original. Cada experto se redondea con realimentacion de error contra sus estadisticas de entrada, capa a capa, y cada capa ve las capas ya redondeadas. Los ajustes de redondeo se afinaron sobre este modelo y los bits por capa siguen su sensibilidad medida. Solo se emplean tipos de tensor ggml estandar, de modo que los ficheros siguen siendo cargables por llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno con hasta 1.048.576 tokens de contexto.
- Razonamiento explicito en modo thinking (`reasoning_effort` high) y respuestas directas en modo `no_think`.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el fichero mmproj; el uso solo de texto puede prescindir de el.
- Decodificacion especulativa mediante el drafter DFly2 en Project Maya.
- Uso de tablas n-gram Engram leidas desde SSD para ampliar capacidad efectiva sin cargarlas en memoria.
- Compatibilidad con llama.cpp mediante el pull request de Hy4-flash.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 1.048.576 tokens de ventana, el modelo puede mantener conversaciones o procesar documentos extensos sin truncar, usando Maya-XS en una maquina de 64 GB de RAM.
- Analisis de documentos e imagenes combinados: el codificador de vision (0,8 GB) permite pasar capturas, diagramas o paginas escaneadas junto con instrucciones textuales para extraccion de datos o resumenes.
- Despliegue en estaciones de trabajo de gama alta: Maya-L (89,5 GB) ofrece la mayor fidelidad frente al original (96,6 % de coincidencia en el token superior) en equipos con 104-128 GB de memoria total.
- Prototipado en GPUs de consumo: la variante `Maya-XS-8GB` esta pensada para tarjetas de menos de 10 GB, con los pesos de atencion en 4 bits, lo que permite probar el modelo en equipos modestos.
- Razonamiento con traza explicita: el modo thinking por defecto resulta adecuado para tareas que requieren pasos intermedios verificables, ajustando `temperature` a 0,9 y `top_p` a 1,0 para evitar repeticiones.
- Investigacion sobre cuantizacion extrema: las metricas de divergencia KL y coincidencia de token superior por tamano permiten estudiar el compromiso entre calidad y huella de memoria en modelos MoE de gran escala.
- Inferencia con almacenamiento externo: el esquema de tabla n-gram en SSD sirve de referencia para disenar despliegues donde la memoria es el cuello de botella y el almacenamiento NVMe es abundante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica metricas de fidelidad de las cuantizaciones frente al modelo original en precision completa, medidas sobre conversaciones no usadas en calibracion (110.230 tokens de respuesta):

| Variante | Coincidencia con el token superior del original | Divergencia KL media |
|---|---:|---:|
| Maya-XS | 88,5 % | 0,16 |
| Maya-S | 91,8 % | 0,072 |
| Maya-M | 93,6 % | 0,046 |
| Maya-L | 96,6 % | 0,012 |

## Requisitos de hardware

- Memoria total (RAM + VRAM o memoria unificada), sin contar la tabla n-gram: Maya-XS 56-64 GB, Maya-S 68-80 GB, Maya-M 80-96 GB, Maya-L 104-128 GB.
- Regla practica del autor: RAM + VRAM aproximadamente igual al fichero del modelo mas el de vision mas 4-8 GB para contexto; con menos memoria sigue funcionando, pero mas lento, al leer partes del modelo desde disco.
- La tabla n-gram (63,4 GB) debe residir en SSD o NVMe, nunca en disco duro; para Maya-XS se necesitan unos 110 GB de disco en total.
- Con Project Maya, Maya-S, Maya-M y Maya-L requieren una GPU de unos 12 GB o mas (unos 9-10 GB del modelo residen siempre en la tarjeta); Maya-XS funciona en tarjetas desde 8 GB.
- GPUs por debajo de unos 10 GB: Project Maya selecciona automaticamente el fichero `Maya-XS-8GB` (mismos expertos, pesos de atencion en 4 bits), con calidad ligeramente inferior al Maya-XS estandar.
- Opciones de despliegue: Project Maya (recomendado, aplica los ajustes de muestreo de Tencent) y llama.cpp con el pull request de Hy4-flash.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Hy4-Flash Maya GGUF (este) | 220B (MoE, 512 expertos) | 1.048.576 | Si (vision) | tencent-hy-license | GGUF |
| tencent/Hy4-flash (original) | 220B (MoE, 512 expertos) | 1.048.576 | Si (vision) | tencent-hy-license | no disponible |
| GGUF oficiales de Tencent para Hy4-flash | 220B | 1.048.576 | Si (vision) | tencent-hy-license | GGUF |

La model card compara graficamente las cuantizaciones Maya con los ficheros GGUF propios de Tencent, evaluados con la misma metodologia y sobre las mismas conversaciones, pero no se proporcionan en el texto los valores numericos de esos ficheros oficiales. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia tencent-hy-license es de tipo "other"; deben revisarse sus terminos en el enlace del modelo base antes de cualquier uso comercial.
- Las cuantizaciones introducen degradacion medible: incluso Maya-L diverge del original (KL 0,012) y Maya-XS presenta una divergencia KL de 0,16 con un 88,5 % de coincidencia en el token superior.
- Con decodificacion greedy (`temperature` 0) una fase de thinking larga puede empezar a repetirse, igual que en el modelo original; deben mantenerse los ajustes recomendados (temperature 0,9, top_p 1,0, top_k desactivado).
- El modelo solo admite dos modos de razonamiento (thinking high y no_think); no esta disenado para niveles intermedios.
- El rendimiento depende criticamente del almacenamiento: la tabla n-gram de 63,4 GB debe estar en SSD o NVMe; en disco duro el funcionamiento no es viable.
- La variante `Maya-XS-8GB` tiene calidad ligeramente inferior al Maya-XS estandar por el uso de pesos de atencion en 4 bits.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otras lenguas distintas de las evaluadas por el autor.
- Riesgo de alucinacion y sesgos conocidos: no disponible en la informacion proporcionada.
- Soporte de tool calling, agentes y razonamiento multi-paso no confirmado en la documentacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/Hy4-Flash-Maya-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Project Maya: https://github.com/mw00/project-maya
- Grafico de divergencia KL por tamano de fichero: https://huggingface.co/peasantsmith/Hy4-Flash-Maya-GGUF/resolve/main/images/hy4-kld.png
- Grafico de coincidencia con el token superior: https://huggingface.co/peasantsmith/Hy4-Flash-Maya-GGUF/resolve/main/images/hy4-top.png

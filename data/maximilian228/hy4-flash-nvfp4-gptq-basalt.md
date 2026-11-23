# Maximilian228/Hy4-flash-NVFP4-GPTQ-Basalt

## Resumen

Hy4-flash NVFP4 GPTQ para Basalt es una versión cuantizada del modelo Hy4-flash de Tencent, publicada por el usuario Maximilian228. No se trata de un modelo nuevo, sino de un fichero de pesos derivado del checkpoint original en BF16, re-cuantizado a NVFP4 mediante GPTQ para su uso con el motor de inferencia Basalt. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 41 capas MoE y 512 expertos enrutados por capa, tal como se deduce de la descripción de la modificación. El fichero resultante ocupa 158.746.168.309 bytes (aproximadamente 158,7 GB).

La relevancia de esta publicación es fundamentalmente práctica: demuestra que una cuantización GPTQ de los expertos enrutados a NVFP4 (formato de 4 bits con escalas por bloque) mejora de forma medible la fidelidad respecto al modelo original en comparación con una cuantización round-to-nearest, manteniendo el mismo tamaño de fichero y la misma velocidad de ejecución en el motor Basalt. El autor reporta métricas de divergencia (KLD) y de perplejidad sobre wikitext-2, así como errores relativos de salida de los expertos sobre activaciones retenidas.

El modelo está pensado para ejecutarse en una única GPU NVIDIA Blackwell (sm_120), con un requisito de memoria RAM de 128 GB y probado concretamente en una RTX 5090 de 32 GB. La licencia es la Tencent Hy License 1.0, heredada del modelo original, e incluye cláusulas específicas para el uso como servicio (Model-as-a-Service) por encima de ciertos umbrales de ingresos o usuarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (41 capas MoE, 512 expertos enrutados por capa; incluye experto compartido, MLP denso en la capa 0, encoder de visión y drafter DFly2) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (E2M1) con escalas UE4M3 por cada 16 elementos y escala FP32 por proyección, aplicada con GPTQ a los expertos enrutados; el resto de componentes permanece en el formato original del pack Basalt |
| Idiomas soportados | no disponible en la información del modelo; el corpus de calibración incluye inglés, chino, ruso y ucraniano |
| Licencia | Tencent Hy License 1.0 (tencent-hy-license-1.0) |
| Formato de pesos | `.basalt` (formato propietario del motor Basalt) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un transformer de mezcla de expertos con 41 capas MoE y 512 expertos enrutados en cada una de ellas. Además de los expertos enrutados, la arquitectura incluye un experto compartido, un MLP denso en la capa 0, una tabla Engram, un encoder de visión y un drafter DFly2 (probablemente para decodificación especulativa). Esta ficha no dispone de información sobre el número total de parámetros, los parámetros activos por token, la longitud de contexto nativa ni los datos de entrenamiento originales del modelo de Tencent.

La modificación introducida por esta publicación afecta exclusivamente a las proyecciones gate, up y down de los 512 expertos enrutados de las 41 capas MoE. Estas se re-cuantizaron desde los pesos BF16 originales mediante GPTQ, usando Hessianas por experto calculadas a partir de las activaciones enrutadas, códigos NVFP4 E2M1 con escalas UE4M3 por cada 16 elementos y una escala FP32 por proyección. El resto de componentes (tabla Engram, atención, experto compartido, MLP denso de la capa 0, embeddings, cabeza de salida, router, normas, encoder de visión y drafter DFly2) son idénticos byte a byte al pack round-to-nearest de referencia `jesdga/Hy4-flash-Basalt`.

El corpus de calibración empleado contiene aproximadamente 1,67 millones de tokens de prompt tras eliminar prefijos repetidos, con activaciones tomadas en la entrada de cada experto enrutado sobre la propia ruta de prompt del motor. La composición es la siguiente: 420K tokens de sesiones de codificación agéntica en Claude Code (llamadas a herramientas y multi-turno), 191K de trayectorias de agentes software (OpenHands y SWE-agent), 197K de function calling (hermes-function-calling-v1, ToolACE, glaive-function-calling-v2, xlam-function-calling-60k), 211K de código de sistemas (Rust, C++, CUDA, Python, shell), 125K de código web (JS/TS, HTML, CSS), 126K de razonamiento (matemáticas y ciencia, con prompts de OpenR1-Math y el propio modo de pensamiento de Hy4), 165K de ucraniano, 110K de inglés, 65K de chino y 56K de ruso. El corpus no se redistribuye; solo se incorporaron estadísticas de activación a los pesos.

## Capacidades

- Generación de texto y razonamiento: el modelo base Hy4-flash soporta razonamiento, y la calibración incluye prompts de matemáticas y ciencia con el modo de pensamiento propio del modelo.
- Codificación: la calibración cubre código de sistemas (Rust, C++, CUDA, Python, shell) y código web (JS/TS, HTML, CSS), lo que indica capacidad para generación y edición de código en estos lenguajes.
- Function calling: se calibró con cuatro datasets específicos de llamadas a funciones, por lo que el modelo conserva esta capacidad.
- Uso agéntico: se calibró con trayectorias de agentes software (OpenHands, SWE-agent) y sesiones de Claude Code con llamadas a herramientas y multi-turno, lo que apunta a soporte de flujos multi-paso.
- Visión: el pack incluye un encoder de visión sin modificar, por lo que el modelo base es multimodal; esta ficha no dispone de detalles adicionales sobre las capacidades de visión.
- Multilingüismo: el corpus de calibración incluye inglés, chino, ruso y ucraniano, pero no se dispone de la lista oficial de idiomas soportados por el modelo base.
- Decodificación especulativa: el pack incluye un drafter DFly2, lo que sugiere soporte de decodificación especulativa en el motor Basalt.

## Casos de uso

- Codificación agéntica en producción: el modelo puede integrarse en flujos tipo Claude Code o SWE-agent para resolver tareas de codificación en sandbox con llamadas a herramientas y múltiples turnos, ya que la calibración se realizó precisamente sobre este tipo de sesiones y sobre trayectorias de agentes software.
- Automatización de function calling: adecuado para pipelines que requieren que el modelo emita llamadas a funciones estructuradas de forma fiable, dado que se calibró con hermes-function-calling-v1, ToolACE, glaive-function-calling-v2 y xlam-function-calling-60k.
- Asistencia a la programación en sistemas: útil para generación y revisión de código en Rust, C++, CUDA, Python y shell, lenguajes presentes en el corpus de calibración junto con repositorios propios del mantenedor.
- Desarrollo web frontend: puede emplearse para tareas de generación de código JS/TS, HTML y CSS, calibrado con the-stack-smol y repositorios propios.
- Razonamiento matemático y científico: el modelo conserva el modo de pensamiento del base y se calibró con prompts de OpenR1-Math, por lo que puede usarse en tareas de resolución de problemas con cadena de razonamiento.
- Procesamiento multilingüe en Europa del Este: el corpus incluye ucraniano, ruso y chino, lo que lo hace adecuado para tareas de generación y comprensión en estos idiomas, aunque no se dispone de evaluación formal por idioma.
- Despliegue en una única GPU de consumo de gama alta: al ejecutarse en una RTX 5090 de 32 GB con 128 GB de RAM, es viable para prototipado local y evaluación de agentes sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

El autor publica resultados de `basalt-bench --quality` sobre 100 fragmentos de wikitext-2 de 512 tokens cada uno (25.500 filas evaluadas), comparando contra la referencia BF16 del modelo original ejecutada en llama.cpp (perplejidad de referencia 18,572). La caché de expertos se congeló y todas las variantes se midieron en la misma máquina y la misma noche. Los intervalos son bootstrap pareado al 95% sobre fragmentos.

| Pack | KLD media | KLD mediana | KLD p99 | Mismo top-1 | PPL |
|---|---:|---:|---:|---:|---:|
| Round-to-nearest (`Hy4-flash-NVFP4.basalt`) | 0,2048 | 0,0319 | 3,19 | 85,73% | 17,43 |
| GPTQ (este fichero) | 0,1770 | 0,0282 | 2,71 | 86,83% | 18,99 |

- GPTQ frente a round-to-nearest: KLD −0,0278 [−0,0370, −0,0192]; mismo top-1 +1,09 pp [+0,66, +1,52].
- Brazo de ruido (round-to-nearest contra sí mismo con distinta colocación de expertos): KLD +0,0012 [−0,0070, +0,0094]; mismo top-1 +0,33 pp [−0,00, +0,66]. La ganancia de GPTQ supera el ruido entre ejecuciones.
- Perplejidad: la distancia a la referencia se reduce de |ln(PPL/ref)| 0,064 a 0,022.
- Error de salida de los expertos sobre activaciones retenidas (MSE relativo ponderado por enrutamiento frente a BF16, 21 capas): de 0,0146 a 0,0074, entre 1,5 y 3,9 veces menor por capa.

Las comprobaciones agénticas en vivo (tareas en Claude Code, código web, bucles, deriva de idioma) y la NLL sobre datos retenidos están pendientes de medición según la model card.

## Requisitos de hardware

- GPU: una única GPU NVIDIA Blackwell (sm_120); probado en una RTX 5090 de 32 GB.
- RAM: 128 GB; el motor utiliza aproximadamente 85 GB.
- Fichero de paginación: al menos 62 GB en Windows.
- Tamaño del fichero de pesos: 158.746.168.309 bytes (unos 158,7 GB), por lo que no cabe en la VRAM de una GPU de consumo y requiere el esquema de memoria del motor Basalt (uso intensivo de RAM del sistema).
- Despliegue: exclusivamente mediante el motor Basalt (repositorio `sergqwer/basalt-hy4`), clonando el repositorio, compilando según su README, descargando el fichero `.basalt` y apuntando `basalt_config.json` a él. No se mencionan opciones como vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles; el autor solo indica que el fichero tiene el mismo tamaño y se ejecuta a la misma velocidad que el pack round-to-nearest.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash NVFP4 GPTQ (este fichero) | no disponible (41 capas MoE, 512 expertos) | no disponible | NVFP4 GPTQ, 158,7 GB | Tencent Hy License 1.0 | Hugging Face, motor Basalt |
| Hy4-flash NVFP4 round-to-nearest (`jesdga/Hy4-flash-Basalt`) | mismo modelo base | no disponible | NVFP4 round-to-nearest, mismo tamaño | Tencent Hy License 1.0 | Hugging Face, motor Basalt |
| Hy4-flash BF16 (`tencent/Hy4-flash`) | no disponible | no disponible | BF16 (referencia) | Tencent Hy License 1.0 | Hugging Face, llama.cpp |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un derivado cuantizado, no un modelo entrenado desde cero: hereda todos los sesgos y limitaciones del Hy4-flash original, sobre los que esta ficha no dispone de información.
- La cuantización NVFP4 de los expertos enrutados introduce divergencia respecto al BF16: KLD media de 0,1770 y coincidencia de top-1 del 86,83%, lo que implica que aproximadamente un 13% de las predicciones top-1 difieren del modelo de referencia.
- La perplejidad en wikitext-2 del pack GPTQ (18,99) es superior a la del pack round-to-nearest (17,43) y a la referencia BF16 (18,572); el autor argumenta que la distancia logarítmica a la referencia es menor, pero la PPL absoluta es peor.
- Las comprobaciones agénticas en vivo y la NLL sobre datos retenidos aún no se han publicado, por lo que el rendimiento en tareas reales de agente no está verificado de forma independiente.
- El corpus de calibración está fuertemente orientado a código, agentes y function calling, con presencia limitada de idiomas (inglés, chino, ruso, ucraniano); el rendimiento en otros dominios o idiomas puede degradarse.
- Requisitos de hardware muy restrictivos: GPU Blackwell (sm_120), 128 GB de RAM y 62 GB de fichero de paginación en Windows; no es desplegable en GPUs sin soporte sm_120 ni en entornos con menos memoria.
- El formato `.basalt` es propietario del motor Basalt, lo que limita la portabilidad a otras herramientas de inferencia.
- La licencia Tencent Hy License 1.0 incluye en su Sección 10 una cláusula que exige una licencia separada de Tencent para negocios de Model-as-a-Service por encima de los umbrales de ingresos o usuarios indicados; es imprescindible revisarla antes de un uso comercial.
- El autor no redistribuye el corpus de calibración; solo se incorporaron estadísticas de activación a los pesos.
- No se dispone de información sobre la longitud de contexto efectiva, los idiomas oficialmente soportados ni los parámetros totales y activos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Hy4-flash-NVFP4-GPTQ-Basalt
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Pack round-to-nearest de referencia: https://huggingface.co/jesdga/Hy4-flash-Basalt
- Motor Basalt para Hy4: https://github.com/sergqwer/basalt-hy4

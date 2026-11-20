# BH-Language-AI/lumi-vl-8b-cua

## Resumen

LUMI-VL-8B-CUA es un adaptador LoRA de segunda etapa (Stage-2) entrenado sobre el modelo vision-lenguaje Qwen3.5-VL-8B para tareas de *GUI grounding* y agentes de uso de ordenador (computer-use agents, CUA). Dado un par formado por una captura de pantalla y una instruccion en lenguaje natural, el adaptador devuelve un unico punto de pulsacion normalizado en formato JSON (`{"tool":"tap","args":{"x":512,"y":733}}`), con coordenadas escaladas al rango 0-1000 sobre las dimensiones de la imagen. Lo desarrolla BH-Language-AI y se publica como adaptador PEFT (no como modelo completo), por lo que requiere cargar el modelo base Qwen/Qwen3.5-VL-8B.

El interes tecnico del modelo reside en que demuestra que un ajuste fino parametrizado eficiente (116,4 M de parametros entrenables, un 1,22 % del total) puede transformar un VLM generalista en un localizador de elementos de interfaz fiable: sobre un subconjunto de 400 muestras de ScreenSpot-Pro, el modelo base sin adaptador obtiene un 2,5 % de acierto (con salidas mayoritariamente no parseables), mientras que el adaptador Stage-2 a 2 MP alcanza un 51,25 %. En el servidor de despliegue (base en 8 bits mas adaptador, 2 MP) la comparacion sobre 120 muestras pasa de un 7,5 % a un 51,7 %, con cero salidas no parseables frente a 87 de 120 del base.

El modelo es relevante ahora porque los agentes que operan interfaces graficas necesitan una capa de *grounding* precisa y de baja latencia, y este adaptador ofrece una via de subida sobre un VLM de 8B ya existente sin reentrenar el modelo completo. Su punto debil declarado son las aplicaciones especializadas (AutoCAD, ~38 % de acierto), y el autor senala que la siguiente palanca es mas datos de dominio en alta resolucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre VLM Qwen3.5-VL-8B; r=64, alpha=128, dropout=0.05, 7 modulos de proyeccion |
| Parametros totales | 116,4 M entrenables (1,22 % del modelo base); total del modelo base no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; limite de secuencia en entrenamiento de 2048 tokens (Stage-1) y 3400 tokens (Stage-2) |
| Tipos de cuantizacion | Entrenado en 4-bit NF4 con doble cuantizacion y computo en bf16; despliegue validado con base en 8 bits; otros formatos no disponibles |
| Idiomas soportados | no disponible (el prompt de sistema de entrenamiento esta en serbocroata; no se documentan idiomas) |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-VL-8B |
| Resolucion de entrada | Hasta 1.048.576 pixeles (Stage-1) y 2.097.152 pixeles (Stage-2) |
| Salida | JSON con punto de pulsacion normalizado 0-1000 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-VL-8B, un modelo vision-lenguaje del que la informacion disponible no detalla la arquitectura interna (tipo de transformer, numero de capas, mecanismo de atencion). Lo que si se documenta es la configuracion del ajuste: LoRA con rango 64, alpha 128, dropout 0.05 sobre 7 modulos de proyeccion, con el modelo base cuantizado en 4-bit NF4 (doble cuantizacion) y computo en bf16. El entrenamiento se realizo en dos etapas sobre 2 GPU NVIDIA L40S, con optimizador AdamW y scheduler coseno.

La Stage-1 consta de 6437 pasos con un maximo de 1.048.576 pixeles, learning rate de 1e-4 a 1e-5 y batch efectivo de 16 (8 de acumulacion x 2 GPU). La Stage-2 anade 1200 pasos con el maximo de pixeles elevado a 2.097.152 y learning rate de 5e-5, manteniendo el resto de hiperparametros. El dataset suma 102.974 muestras de *GUI grounding* procedentes de mezclas Jedi, UI-Vision y GTA1, con el punto de pulsacion en JSON como unico objetivo de respuesta. El autor no documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares instruccion-captura-punto. La innovacion practica es el aumento de resolucion de entrada entre etapas: segun el autor, pasar de 1 MP a 2 MP mejora notablemente en interfaces densas.

## Capacidades

- Localizacion de elementos de interfaz grafica (*GUI grounding*): dado un screenshot y una instruccion, devuelve el punto de pulsacion normalizado en JSON.
- Salida estructurada estricta: el formato `{"tool":"tap","args":{"x":<0-1000>,"y":<0-1000>}}` elimina practicamente las respuestas no parseables (0 de 120 en la comparacion de despliegue, frente a 87 de 120 del base).
- Procesamiento de capturas en alta resolucion: soporta entradas de hasta 2.097.152 pixeles, lo que mejora el acierto en interfaces con muchos elementos pequenos.
- Base para agentes de uso de ordenador: el punto de pulsacion es la accion primitiva que un bucle de agente puede ejecutar y encadenar en tareas de varios pasos.
- Capacidades heredadas del VLM base (comprension de imagen y texto, generacion de lenguaje): no documentadas de forma especifica para este adaptador.
- *Tool calling* mas alla de `tap`: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el prompt de sistema de entrenamiento esta redactado en serbocroata y no se documentan idiomas soportados.

## Casos de uso

- Automatizacion de tareas de escritorio: un agente captura la pantalla, pasa la instruccion ("pulsa el boton de guardar") al adaptador y ejecuta el clic en las coordenadas devueltas; la salida JSON normalizada permite convertir directamente a pixeles reales multiplicando por las dimensiones de la ventana.
- Testing de interfaces de usuario: el adaptador puede localizar elementos por descripcion en lugar de por selector, lo que permite generar pruebas end-to-end resistentes a cambios de DOM o de maquetacion en aplicaciones de escritorio.
- Asistentes de accesibilidad: traducir instrucciones en lenguaje natural a puntos de pulsacion concretos para usuarios con dificultades motoras, sobre capturas de pantalla reales.
- RPA (automatizacion robotica de procesos) sobre aplicaciones heredadas: al operar sobre pixeles y no sobre APIs, el modelo cubre aplicaciones de escritorio sin interfaz programable, con buen rendimiento en suites ofimaticas (Excel ~70 % en el subconjunto evaluado).
- Soporte remoto asistido: dado un screenshot del escritorio del usuario y una peticion de ayuda, el modelo senala donde hay que pulsar, integrable en herramientas de asistencia tecnica.
- Agentes de navegacion y operacion de apps moviles: el subconjunto de Android del benchmark alcanza un 49 %, lo que lo hace util para flujos de automatizacion en emuladores o dispositivos reales.
- Investigacion en agentes CUA: como componente de *grounding* intercambiable sobre Qwen3.5-VL-8B, sirve de linea base reproducible para experimentar con politicas de agente y estrategias de alta resolucion.

## Benchmarks y rendimiento

Evaluacion sobre un subconjunto retenido de 400 muestras de ScreenSpot-Pro (precision de acierto en el punto de pulsacion):

| Configuracion | Precision |
|---|---|
| Qwen3.5-VL-8B base, sin adaptador, 1 MP | 2,5 % (salidas mayoritariamente no parseables) |
| Adaptador Stage-1, 1 MP | 39,0 % |
| Adaptador Stage-1, 2 MP (n=120) | 45,8 % |
| Adaptador Stage-2, 1 MP | 40,5 % |
| Adaptador Stage-2, 2 MP | 51,25 % |

Precision por aplicacion con Stage-2 a 2 MP:

| Aplicacion | Precision |
|---|---|
| eviews | 95 % |
| excel | 70 % |
| android_studio | 49 % |
| blender | 47 % |
| macos_common | 46 % |
| davinci | 46 % |
| windows_common | 45 % |
| linux_common | 45 % |
| autocad | 38 % |

Comparacion en el servidor de despliegue (base en 8 bits mas adaptador, 2 MP, 120 muestras): base 7,5 % frente a adaptador 51,7 %, con 0 salidas no parseables frente a 87 de 120 del base. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El entrenamiento se realizo con el base en 4-bit NF4 sobre 2 GPU NVIDIA L40S (48 GB cada una); el despliegue validado usa el base en 8 bits, lo que implica un consumo superior al de 4 bits.
- GPU recomendadas: NVIDIA L40S (configuracion usada por el autor); por tamano de un VLM de 8B, cabria esperar viabilidad en A100, H100 y RTX 4090, aunque no se documenta.
- GPU de consumo: no confirmado en la informacion disponible; con cuantizacion agresiva del base podria intentarse en tarjetas de 24 GB, pero el adaptador se entreno y valido en resoluciones de hasta 2 MP, que incrementan mucho el coste de atencion visual.
- Opciones de despliegue: el ejemplo oficial usa `transformers` (`AutoProcessor`, `AutoModelForImageTextToText`) junto con `peft.PeftModel`. Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.
- Nota operativa: es imprescindible fijar `proc.image_processor.max_pixels = 2097152` para reproducir los resultados a 2 MP; a 1 MP el acierto cae varios puntos (51,25 % frente a 40,5 % en Stage-2).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScreenSpot-Pro | Licencia | Formato |
|---|---|---|---|---|---|
| LUMI-VL-8B-CUA (Stage-2, 2 MP) | 116,4 M entrenables sobre base 8B | no disponible (secuencia de entrenamiento 3400) | 51,25 % (subconjunto propio de 400 muestras) | other | safetensors (LoRA) |
| Qwen3.5-VL-8B base | 8B (total no disponible) | no disponible | 2,5 % (mismo subconjunto) | no disponible | safetensors |
| Otros adaptadores CUA sobre Qwen3.5-VL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros (por ejemplo, modelos CUA especializados de otros autores) en la informacion proporcionada para establecer una comparacion externa fiable.

## Limitaciones y advertencias

- Rendimiento debil en aplicaciones CAD y especializadas: AutoCAD se queda en un 38 % de acierto, y el propio autor identifica la falta de datos de dominio en alta resolucion como la siguiente palanca de mejora.
- Dependencia fuerte de la resolucion: a 1 MP el acierto cae a 40,5 % (Stage-2) frente al 51,25 % a 2 MP; desplegar con el procesador de imagen por defecto degrada el rendimiento.
- No es un modelo autonomo: requiere cargar Qwen3.5-VL-8B; el adaptador por si solo no genera texto ni razona sobre la imagen.
- Salida limitada a una unica accion `tap`: no se documentan acciones de arrastre, escritura, scroll ni tool calling adicional, lo que restringe la cobertura de flujos de agente complejos.
- Riesgo de alucinacion de coordenadas: el modelo puede devolver un JSON bien formado con un punto incorrecto; la evaluacion mide precision exacta, no calibracion de confianza, y no se documenta mecanismo de absteccion.
- Sesgos: no documentados. El dataset mezcla fuentes (Jedi, UI-Vision, GTA1) y el prompt de entrenamiento esta en serbocroata, lo que puede sesgar el comportamiento ante instrucciones en otros idiomas; los idiomas soportados no se declaran.
- Licencia "other": no se especifican los terminos de uso comercial; hay que consultar la licencia del repositorio y la del modelo base Qwen3.5-VL-8B antes de un despliegue en produccion.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; sin pipeline declarado ni validacion externa conocida.
- Evaluacion sobre subconjunto propio de 400 muestras (y n=120 en algunas comparaciones), no sobre el benchmark completo; los numeros no son directamente comparables con resultados publicados de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-VL-8B
- Paper, blog o repositorio del adaptador: no disponible
- Demo o espacio interactivo: no disponible

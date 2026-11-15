# JunHill/gui-planner-dflash2

## Resumen

gui-planner-dflash2 es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por JunHill y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje autonomo: se utiliza junto a un planificador GUI congelado (Qwen3.8-27B) dentro de un motor de decodificacion especulativa para acelerar la inferencia. Su relevancia radica en que demuestra que un ajuste fino completo de un draft preentrenado puede mejorar ligeramente la tasa de aceptacion y el throughput en cargas de trabajo multimodales de planificacion GUI.

El checkpoint parte de z-lab/Qwen3.8-27B-DFlash2 y se ha adaptado con entrenamiento completo de los 1.924.404.480 parametros del borrador (sin LoRA), manteniendo congelados el modelo objetivo, el embedding compartido y la cabeza del modelo de lenguaje. La arquitectura conserva cinco capas, hidden size 5.120, intermediate size 17.408, ventana deslizante de 2.048 tokens y un selector de candidatos top-16 con rango 256.

La evaluacion del autor reporta 68,51 tokens/s con tamano de bloque 12, lo que supone 1,550x respecto al control vanilla, aunque con una concordancia exacta de secuencia del 55,2% y de llamadas a herramientas del 81,2%. Estos datos indican una aceleracion modesta y no equivalencia sin perdidas, por lo que debe evaluarse con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer draft para decodificacion especulativa DFlash2 (5 capas, hidden size 5.120, intermediate size 17.408, ventana deslizante de 2.048 tokens, feature taps [5, 19, 33, 47, 61], convoluciones dinamicas de dos taps con group size 16, selector de candidatos top-16 con rango 256) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens en la evaluacion; ventana deslizante interna de 2.048 tokens |
| Tipos de cuantizacion | no disponible (exportacion en BF16 para serving) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft DFlash2 de cinco capas que consume caracteristicas del modelo objetivo en los taps [5, 19, 33, 47, 61] y utiliza convoluciones dinamicas de dos taps con group size 16, junto con un selector de candidatos top-16 de rango 256. El token de mascara es el ID 248070. Se inicializa desde z-lab/Qwen3.8-27B-DFlash2 (revision 50307d4c4cde6860d4eee73e2547cd786fe8e8a4) y se adapta completamente, sin fusion de adaptadores LoRA previos.

El entrenamiento se realizo sobre 2.500 ejemplos de planificacion GUI, divididos en 1.999 de entrenamiento, 251 de validacion y 250 de test, agrupados en 205 grupos conectados. Se ejecutaron 2 epocas y 126 pasos de optimizador con 8 GPU NVIDIA H800 en 8 rangos DDP, batch global 32, acumulacion de gradiente 4 por rango, AdamW con learning rate 2e-5, betas (0,9, 0,95), weight decay 0,1, warmup del 4% y decaimiento coseno, clipping de gradiente 1,0 y semilla 42. El objetivo combina entropia cruzada de vocabulario completo ponderada por exp(-j/2) sobre la respuesta, mas 0,1 x entropia cruzada estricta del selector top-16. Se uso precision FP32 para pesos maestros y optimizador, con autocast BF16 y exportacion BF16 para serving. La CE de validacion bajo de 1,314474 antes de la adaptacion a 0,833334 tras la primera epoca y 0,812287 tras la segunda.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa junto al planificador GUI Qwen3.8-27B congelado.
- Aceleracion de inferencia multimodal de planificacion GUI (capturas de pantalla, herramientas e historial de conversacion).
- Soporte de tool calling a traves del modelo objetivo; el draft acelera la generacion de llamadas parseadas.
- Integracion con vLLM como motor de serving.
- No es un modelo autonomo: no genera texto, razonamiento ni codigo por si mismo sin el modelo objetivo.
- No dispone de capacidades multilingues declaradas ni de modos especiales (thinking, vision o audio) propios.

## Casos de uso

- Aceleracion de agentes GUI en produccion: el draft se combina con el planificador Qwen3.8-27B en vLLM para reducir la latencia de generacion de planes de accion sobre capturas de pantalla, con un throughput medido de 68,51 tokens/s frente a 44,19 tokens/s del control vanilla.
- Automatizacion de pruebas de interfaz: se puede desplegar junto al planificador para generar secuencias de acciones sobre aplicaciones en pipelines de test, aceptando la ligera perdida de concordancia exacta (55,2%) a cambio de mayor velocidad.
- Serving de bajo coste en replicas TP2: la evaluacion se realizo con cuatro replicas independientes de dos GPU H800, lo que permite escalar horizontalmente en entornos con GPUs de gama alta.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para estudiar el efecto del ajuste fino completo de drafts preentrenados sobre la tasa de aceptacion y el throughput.
- Prototipado de asistentes de escritorio multimodales: al integrarse con el procesador de imagenes y la plantilla de chat del modelo objetivo, permite construir demos de planificacion GUI con latencia reducida.
- Evaluacion comparativa de block sizes: el checkpoint permite medir el compromiso entre tamano de bloque (8, 12, 16), aceptacion y concordancia de llamadas a herramientas en cargas GUI reales.

## Benchmarks y rendimiento

Evaluacion offline con 250 entradas de test, tres repeticiones cronometradas tras dos calentamientos, batch size 1 por replica TP2, cuatro replicas de dos GPU H800, generacion greedy, semilla 42, thinking desactivado, maximo 8.192 tokens de salida y contexto de 65.536.

| Metodo | Bloque de inferencia | Longitud de aceptacion | Tokens/s de salida | Aceleracion vs vanilla | Concordancia exacta de secuencia | Concordancia de tool calls |
|---|---:|---:|---:|---:|---:|---:|
| Objetivo vanilla | — | — | 44,19 | 1,000x | 100,0% | 100,0% |
| Draft preentrenado original | 8 | 3,840 | 66,73 | 1,510x | 60,4% | 84,0% |
| Este checkpoint | 8 | 4,125 | 67,45 | 1,526x | 60,4% | 84,0% |
| Este checkpoint | 12 | 4,311 | 68,51 | 1,550x | 55,2% | 81,2% |
| Este checkpoint | 16 | 4,232 | 67,33 | 1,524x | 60,4% | 85,2% |

Los intervalos primer-a-ultimo token promediaron 466,07 / 469,51 / 501,19 ms por peticion para bloques 8 / 12 / 16. Las 750 peticiones cronometradas se completaron sin errores ni respuestas truncadas. La concordancia de tool calls ignora los IDs generados y canonicaliza los argumentos JSON; no se ejecuto ningun entorno GUI, por lo que la concordancia no equivale a tasa de exito de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 3,8 GB en safetensors y la exportacion de serving es BF16.
- GPU recomendadas: NVIDIA H800 (usadas en entrenamiento y evaluacion), asi como A100 o H100 por su soporte de BF16 y memoria suficiente para el modelo objetivo de 27B.
- Cabe en GPU consumer: no disponible; el modelo objetivo Qwen3.8-27B requiere memoria considerable y no se han medido configuraciones consumer.
- Opciones de despliegue: vLLM (motor usado en la evaluacion), con el planificador Qwen3.8-27B congelado, su tokenizer, procesador de imagenes y plantilla de chat.
- Latencia y throughput estimados: 68,51 tokens/s con bloque 12 en cuatro replicas TP2 sobre ocho H800; 466-501 ms de primer a ultimo token por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Throughput medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JunHill/gui-planner-dflash2 | 1.924.404.480 (draft) | 65.536 en evaluacion | 68,51 tokens/s (bloque 12) | Apache 2.0 | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 (draft original) | no disponible | no disponible | 66,73 tokens/s (bloque 8) | no disponible | Hugging Face |
| Qwen3.8-27B (objetivo vanilla) | no disponible | 65.536 en evaluacion | 44,19 tokens/s | no disponible | Uso como modelo objetivo |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el planificador Qwen3.8-27B congelado, su tokenizer, procesador de imagenes y plantilla de chat, que no se incluyen.
- No establece equivalencia sin perdidas: las secuencias generadas y las llamadas a herramientas parseadas difieren a veces del vanilla (concordancia exacta del 55,2% con bloque 12).
- La compatibilidad y velocidad con otros finetunes del objetivo, formatos de prompt o preprocesamiento no se han medido.
- La seleccion del tamano de bloque 12 se realizo con mediciones de test y es exploratoria; el bloque 12 no demuestra una decodificacion mas rapida (501,19 ms de primer a ultimo token frente a 466,07 ms con bloque 8).
- La evaluacion no ejecuto ningun entorno GUI, por lo que la concordancia no refleja tasa de exito de tarea.
- Los ejemplos de entrenamiento no se distribuyen con el modelo y las apps pueden solaparse entre splits; no es una evaluacion con apps no vistas.
- No se han publicado datos sobre sesgos, idiomas soportados ni cuantizaciones; el uso comercial esta permitido por Apache 2.0, pero debe verificarse el cumplimiento de las licencias del modelo objetivo y del draft original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JunHill/gui-planner-dflash2
- Modelo base: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2/tree/50307d4c4cde6860d4eee73e2547cd786fe8e8a4
- Paper DFlash referenciado: arxiv:2602.06036

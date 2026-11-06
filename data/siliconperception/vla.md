# siliconperception/vla

## Resumen

VLA es un modelo de lenguaje experimental desarrollado por Silicon Perception que abandona la arquitectura transformer convencional en favor de dos capas convolucionales recurrentes en serie. Con 59,0 M de parametros (33,2 M entrenados y 25,8 M congelados procedentes de pythia-31m), el modelo mantiene un estado de tamano fijo de 100.352 valores y prescinde por completo de codificacion posicional. Su objetivo declarado no es competir en capacidades generales de lenguaje, sino servir como nucleo textual de un diseno vision-lenguaje-accion (VLA) orientado a robotica autonoma embebida.

La motivacion tecnica es la eficiencia energetica y la latencia determinista: al no requerir DRAM externa, todos los pesos caben en SRAM en chip y cada tick de inferencia realiza exactamente la misma cantidad de trabajo. Esto lo hace adecuado para control embebido a frecuencias de hasta 500 Hz con presupuestos de potencia limitados por bateria. La release publicada corresponde al paso 1.680.000, entrenada con 420 M de tokens de FineWeb.

El modelo se distribuye bajo licencia MIT, unicamente en ingles y con un pipeline declarado de generacion de texto. No es un modelo `transformers`: los pesos deben cargarse mediante el script `vla.py` del repositorio del autor. Se trata, por tanto, de una pieza de investigacion reproducible mas que de un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN recurrente: 2 capas convolucionales en serie con estado fijo (2 registros 2-D de 512 × 7 × 7 por capa) |
| Parametros totales | 59,0 M (33,2 M entrenados + 25,8 M congelados de pythia-31m); el safetensors del repo declara 84.761.349 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; estado de 100.352 valores con ventanas de 16 ticks (capa 1) y 64 ticks (capa 2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (mas `vla_args.json` con la configuracion de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura sustituye la atencion por dos capas convolucionales recurrentes. Cada capa mantiene dos registros 2-D de 512 × 7 × 7: uno lento (promedio de 16 ticks en la capa 1 y de 64 ticks en la capa 2) y una copia del resto. En cada tick, la capa 1 lee el token actual, la senal de audio y sus dos registros (lecturas normalizadas con RMS), aplica una mezcla 1×1 de 2.048 a 384 dimensiones, ocho bloques de convolucion 3×3 con BatchNorm y ReLU a 384 canales, una proyeccion 3×3 de 384 a 512 y una escritura en cascada. La capa 2 replica la estructura leyendo solo la salida de la capa 1 y sus propios registros (1.536 a 384), y su salida se suma a la de la capa 1. La lectura final emplea tres decodificadores (texto, voz e imagen), cada uno con un arbol de tres convoluciones 3×3 y la capa de salida congelada de pythia-31m. El tokenizador es el BPE de pythia-31m (50.304 tokens) mas un token `<NUL>` que indica "no decir nada en este tick".

El entrenamiento consistio en 1.680.000 pasos de SGD plano con 250 filas por paso (un token por fila), totalizando 420 M de tokens de FineWeb sample-10BT en ingles. Se aplico retropropagacion truncada en el tiempo sobre 16 pasos y la perdida se normaliza por palabra en lugar de por token. La configuracion crecio durante el entrenamiento reanudando siempre desde los ultimos pesos: se comenzo con una capa de promedio de 512 ticks y un anillo de recall de 1.024 ticks, se elimino el anillo en el paso 1.065.312, se anadio la segunda capa como identidad en el paso 1.127.936, se acortaron las ventanas lentas a 16/64 ticks en el paso 1.456.944 y se redujo la tasa de aprendizaje por mitades cosenoidales (0,02 → 0,01 → 0,005 → 0,0025) desde el paso 1.501.536. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles con estado de tamano fijo.
- Razonamiento linguistico basico y coherencia gramatical, evaluados mediante BLiMP (70,3 %).
- Sentido comun elemental, evaluado mediante ComVE (64,5 %).
- Ajuste de prompts mediante `--prompt_tune`: se ajustan los registros iniciales con pesos congelados hasta que el modelo predice el prompt y luego se continua desde ellos.
- Diseno multimodal latente: la capa 1 admite entrada de audio y los decodificadores incluyen salidas de voz e imagen, aunque el entrenamiento publicado es solo de texto.
- Latencia determinista por tick, apta para control embebido.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo permite reproducir un experimento completo de lenguaje con CNN recurrente y estado fijo, comparandolo directamente con pythia-70m gracias al tokenizador compartido.
- Prototipado de control embebido de baja latencia: la ausencia de DRAM externa y el trabajo identico por tick lo hacen adecuado para estudiar inferencia determinista en microcontroladores o aceleradores con SRAM en chip.
- Nucleo textual de un pipeline vision-lenguaje-accion: sirve como componente de lenguaje en un robot que necesita generar instrucciones o respuestas conversacionales sencillas a partir de percepcion multimodal.
- Experimentos de eficiencia energetica: permite medir el coste de lectura de pesos desde SRAM frente a DRAM en cargas de generacion de texto de bajo presupuesto.
- Docencia y divulgacion sobre modelos de lenguaje: su tamano reducido (59 M de parametros, repo de 0,3 GB) y su especificacion funcional publica facilitan explicar el funcionamiento interno de un LM sin atencion.
- Generacion de texto creativo breve en ingles: completar frases y parrafos cortos sobre temas cotidianos (recetas, historia, jardineria) en escenarios de demostracion.
- Ajuste de estado inicial para tareas concretas: el `prompt_tune` permite adaptar el modelo a un dominio especifico sin reentrenar pesos, util en entornos con recursos de computo muy limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con pythia-70m (mismo tokenizador):

| Metrica | VLA (420 M tokens) | pythia-70m (268 M tokens) | pythia-70m (537 M tokens) | pythia-70m (300 B tokens) |
|---|---|---|---|---|
| FineWeb held-out (nats/token) | 4,613 | 7,420 | 6,355 | 3,731 |
| BabyLM 2026 dev (nats/token) | 4,608 | 6,866 | 5,718 | 3,250 |
| BLiMP (1.005 pares, %) | 70,3 | 51,8 | 51,4 | 75,7 |
| ComVE (999 pares, %) | 64,5 | 56,5 | 57,1 | 69,7 |

Las perdidas son la media por documento de la perdida media por token, partiendo de estado cero (VLA) o de inicio de documento (pythia); los documentos con algun token por encima de 20 nats se descartan como runaway (2 % de los documentos FineWeb para VLA). Pythia se entreno con The Pile y VLA con FineWeb, por lo que la fila FineWeb es in-domain para VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa, dado el tamano del repo (0,3 GB) y los 59 M de parametros efectivos.
- GPU recomendadas: cualquier GPU con CUDA; el autor ejecuta con `--device cuda`. No se especifican modelos concretos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU, por el reducido numero de parametros.
- Opciones de despliegue: exclusivamente mediante el script `vla.py` del repositorio del autor (`python vla.py --pretrained --generate ...`). No es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras concretas; el diseno busca latencia determinista por tick y el autor menciona frecuencias objetivo de hasta 500 Hz para el caso de uso robotico, pero sin mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VLA (siliconperception) | 59,0 M (33,2 M entrenados) | Estado fijo de 100.352 valores; ventanas de 16/64 ticks | MIT | safetensors, carga via script propio | CNN recurrente sin atencion ni codificacion posicional |
| pythia-70m (EleutherAI) | 70 M | 2.048 tokens | Apache 2.0 | safetensors, transformers | Transformer de referencia, mismo tokenizador; 300 B tokens de entrenamiento |
| pythia-31m (EleutherAI) | 31 M | 2.048 tokens | Apache 2.0 | safetensors, transformers | Origen de los pesos congelados de embedding y salida de VLA |

La comparacion con pythia-70m es la mas directa por compartir tokenizador y tamano total similar. VLA supera a pythia-70m en sus primeros cientos de millones de tokens, pero queda por debajo del pythia-70m completamente entrenado (300 B tokens) en todas las metricas. No se dispone de comparaciones con otros modelos recurrentes o convolucionales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no es un modelo `transformers` y requiere el script propietario del autor para cargar los pesos.
- Solo ingles; no hay soporte multilingue documentado.
- Entrenado con solo 420 M de tokens, muy por debajo de los modelos de produccion; el rendimiento linguistico es limitado y queda por debajo de pythia-70m completamente entrenado.
- Riesgo elevado de alucinacion y de incoherencia en generaciones largas, dado el estado fijo y el escaso entrenamiento.
- El repositorio solo conserva la release actual: cada nueva version reemplaza los pesos y la model card, sin historico de versiones anteriores.
- No se documentan sesgos especificos, pero al entrenarse con FineWeb en ingles hereda los sesgos de ese corpus.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- La licencia MIT permite uso comercial, pero la madurez del modelo y la ausencia de benchmarks de produccion desaconsejan su uso en entornos reales sin validacion exhaustiva.
- La discrepancia entre los 59,0 M de parametros declarados en la model card y los 84.761.349 del safetensors debe tenerse en cuenta al planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siliconperception/vla
- Repositorio de codigo: https://github.com/siliconperception/vla
- Especificacion funcional: https://github.com/siliconperception/vla/blob/main/docs/spec/README.md
- Figura de un tick de reloj: https://raw.githubusercontent.com/siliconperception/vla/main/docs/figures/vla_v511.svg
- Modelo de referencia pythia-70m: https://huggingface.co/EleutherAI/pythia-70m
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb

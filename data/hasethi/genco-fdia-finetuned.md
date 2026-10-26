# hasethi/genco-fdia-finetuned

## Resumen

`hasethi/genco-fdia-finetuned` es un ajuste fino (fine-tune) del checkpoint IEEE 118 del modelo fundacional de flujos de potencia `gridfm/genco-pf-datakit`, publicado por el usuario hasethi como artefacto de investigacion para el GENCO Challenge. El modelo no es un modelo de lenguaje: actua como un "oraculo fisico" que, a partir de un vector de medidas del sistema electrico con ruido de sensores, predice la solucion AC de flujo de potencia (tensiones nodales Vm y Va y flujos P/Q por rama). Su proposito es servir de referencia de consistencia fisica para detectar inyecciones de datos falsos (FDIA) en telemetria SCADA de la red IEEE 118.

El repositorio contiene dos variantes entrenadas por separado: `mixed`, entrenada con 1.500 escenarios de carga de gridfm-datakit con cuatro sorteos de ruido mas 600 trayectorias de paseo de carga derivadas del fichero de caso (10.854 instantaneas), y `case_file_only`, entrenada unicamente con 600 trayectorias del fichero de caso (5.400 instantaneas). Ambas se entrenaron en una sola GPU GB200 en 30 y 25 minutos respectivamente, lo que da una idea de la escala reducida del modelo.

La relevancia es acotada y muy especifica: se trata de un artefacto de investigacion reproducible (codigo, datos y memoria en un repositorio de GitHub) para experimentos de deteccion de FDIA sobre una unica red, un unico modelo de ruido y una unica semilla de entrenamiento por variante. El autor advierte explicitamente de que no esta validado para uso operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune del checkpoint IEEE 118 Base de `gridfm/genco-pf-datakit`; la informacion proporcionada no detalla la arquitectura del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta como modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de contexto textual: la entrada es un conjunto de medidas sobre las 118 barras del sistema IEEE 118 |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precision de entrenamiento, sin variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponibles (modelo numerico de flujo de potencia, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`best_model_state_dict.pt`) acompanado de `normalizer_stats.pt` y el YAML de entrenamiento, con el mismo layout que el checkpoint base; no se publican GGUF ni safetensors |

Otros datos tecnicos: el repositorio ocupa 0,2 GB e incluye las dos carpetas (`mixed` y `case_file_only`). Las descargas y "likes" registrados en HuggingFace son 0, y el pipeline no esta declarado.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `gridfm/genco-pf-datakit`; si se documenta el contrato de entrada/salida del fine-tune: la entrada son medidas del sistema con ruido gaussiano anadido (0,5 MW sobre las inyecciones) y la etiqueta es la solucion AC obtenida por Newton-Raphson sobre esas mismas entradas ruidosas. La perdida es una Huber sobre Vm, Va y los flujos P/Q de rama, cada termino dividido por el ruido de sensor del detector, de modo que la red aprende a reproducir la fisica del sistema en las unidades del umbral de deteccion.

El entrenamiento se realizo en una unica GPU GB200: 8.313 pasos en 30 minutos para la variante `mixed` y 7.155 pasos en 25 minutos para `case_file_only`. Los datos de `mixed` combinan 1.500 escenarios de carga de gridfm-datakit por cuatro sorteos de ruido con 600 trayectorias de paseo de carga derivadas del fichero de caso, hasta 10.854 instantaneas; `case_file_only` usa solo las 600 trayectorias del fichero de caso (5.400 instantaneas). No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, y no se especifica el numero de tokens ni una composicion de dataset en el sentido habitual de los modelos de lenguaje.

## Capacidades

- Prediccion de la solucion AC de flujo de potencia sobre IEEE 118: tensiones nodales (Vm, Va) y flujos de potencia activa y reactiva por rama.
- Reconstruccion de estado fisicamente consistente a partir de medidas con ruido gaussiano de 0,5 MW en las inyecciones.
- Calculo de residuos de consistencia por instantanea (diferencia entre medida y solucion reconstruida), que es la senal que el autor usa para la deteccion de FDIA.
- Dos regimenes de operacion: `mixed` (generaliza a escenarios de carga de gridfm-datakit y al fichero de caso) y `case_file_only` (preciso en los puntos de operacion del fichero de caso).
- Carga mediante el script `src/genco_oracle.py` del repositorio del autor, apuntando `GENCO_CKPT_DIR` a la carpeta del checkpoint.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo generativo de texto.

## Casos de uso

- Deteccion de inyeccion de datos falsos en telemetria SCADA: para cada instantanea, el modelo reconstruye la solucion AC a partir de las medidas y el detector compara el residuo maximo por instantanea con un umbral; el fine-tune `mixed` reduce el p99 del residuo de 294 a 6,6 unidades de ruido de sensor en el conjunto reservado.
- Sustitucion del oraculo Newton-Raphson en bucles de evaluacion: el modelo ofrece una aproximacion diferenciable y rapida de la solucion AC, util para explorar umbrales de deteccion sin resolver el flujo de potencia completo en cada prueba.
- Reproduccion del experimento del GENCO Challenge: el repositorio enlazado incluye codigo, datos y memoria, de modo que un tercero puede reconstruir las cifras de residuo publicadas y auditar la metodologia.
- Estudio de robustez frente al ruido de sensores: al estar el entrenamiento parametrizado por el nivel de ruido del detector (0,5 MW en inyecciones), el artefacto permite analizar como degrada la deteccion al variar ese nivel, dentro del mismo modelo de ruido.
- Comparacion de estrategias de entrenamiento en modelos fundacionales de red: las dos variantes (`mixed` frente a `case_file_only`) sirven como ablation sobre el valor de aumentar la diversidad de escenarios de carga, con una diferencia medida de p99 6,6 frente a 13,8.
- Prototipado y docencia sobre IEEE 118: el modelo permite montar un banco de pruebas de estimacion de estado y consistencia fisica en una red de 118 barras con un coste computacional bajo (entrenamiento de menos de una hora en una GB200).
- Generacion de etiquetas de referencia para entrenar detectores supervisados: las salidas del oraculo sobre entradas ruidosas pueden usarse como objetivo en el diseno de clasificadores de FDIA, siempre dentro del dominio de IEEE 118.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, y no procede aplicarlos a este tipo de modelo. El unico dato cuantitativo publicado es el residuo maximo por instantanea en el conjunto reservado, en unidades de ruido de sensor (p99):

| Variante | Datos de entrenamiento | Pasos / tiempo (una GB200) | Residuo p99 (held-out) |
|---|---|---|---|
| `mixed` | 1.500 escenarios x 4 sorteos de ruido + 600 trayectorias de caso (10.854 instantaneas) | 8.313 / 30 min | 294 -> 6,6 |
| `case_file_only` | 600 trayectorias de caso (5.400 instantaneas) | 7.155 / 25 min | 294 -> 13,8 |

El valor 294 corresponde al residuo del punto de partida (referencia sin ajuste, segun la tabla de la model card); la segunda cifra es la del modelo ajustado. No se publican curvas de entrenamiento, intervalos de confianza ni resultados por escenario.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,2 GB e incluye los dos checkpoints, sus YAML y las estadisticas del normalizador, por lo que cada checkpoint es una fraccion pequena de ese total y es previsible que quepa en cualquier GPU consumer e incluso en CPU; no se publican cifras de VRAM.
- GPU recomendadas: no disponibles. El unico dato de hardware publicado es el de entrenamiento: una sola GB200 (NVIDIA Grace Blackwell) por variante.
- Cabe en GPU consumer: muy probablemente si, a tenor del tamano del repositorio, aunque el autor no lo documenta ni publica latencias.
- Opciones de despliegue: carga mediante PyTorch con el script `src/genco_oracle.py` del repositorio del autor (`GENCO_CKPT_DIR=<carpeta>`). No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Solo se conoce el coste de entrenamiento (8.313 pasos en 30 minutos y 7.155 pasos en 25 minutos en una GB200).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Residuo p99 publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hasethi/genco-fdia-finetuned` (`mixed`) | no disponible | no aplica (118 barras) | 6,6 | Apache-2.0 | HuggingFace, 0 descargas |
| `hasethi/genco-fdia-finetuned` (`case_file_only`) | no disponible | no aplica (118 barras) | 13,8 | Apache-2.0 | HuggingFace, 0 descargas |
| `gridfm/genco-pf-datakit` (modelo base, checkpoint `case118_ieee/base/seed0`) | no disponible | no disponible | 294 (punto de partida de la tabla del autor) | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (oraculos de flujo de potencia o detectores de FDIA) en el material proporcionado, por lo que la comparativa se limita a las dos variantes y al checkpoint base.

## Limitaciones y advertencias

- Alcance reducido: una unica red (IEEE 118), un unico modelo de ruido (gaussiano, 0,5 MW en inyecciones) y una unica semilla de entrenamiento por variante. No hay evidencia de generalizacion a otras topologias ni a otros niveles de tension.
- La variante `case_file_only` es precisa en los puntos de operacion del fichero de caso y pobre en los escenarios de gridfm-datakit, segun el propio autor; no debe usarse fuera de ese dominio.
- Detecciones por encima de las del oraculo exacto con conocimiento total del atacante son error del surrogate, no deteccion fisica real. Cualquier conclusion sobre capacidad de deteccion debe contrastarse con el oraculo Newton-Raphson.
- Riesgo de resultados fisicamente inconsistentes fuera de la distribucion de entrenamiento: al ser un surrogate, puede producir soluciones que violen las ecuaciones de la red sin una senal de incertidumbre calibrada documentada.
- No validado para uso operativo en centros de control. El autor lo describe como artefacto de investigacion.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero la licencia no implica idoneidad tecnica; el aviso de "no validado para uso operativo" debe respetarse en cualquier despliegue en produccion.
- Ausencia de validacion externa: 0 descargas y 0 likes en HuggingFace, sin pipeline declarado ni resultados de benchmarks estandar.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-paso; la interfaz es un vector de medidas del sistema electrico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hasethi/genco-fdia-finetuned
- Modelo base: https://huggingface.co/gridfm/genco-pf-datakit
- Codigo, datos y memoria del experimento: https://github.com/hasethinvd/genco-fdia

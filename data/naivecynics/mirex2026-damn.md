# naivecynics/MIREX2026-DAMN

## Resumen

DAMN (Delta-Absolute Modeling with Nested Transformers) es un modelo autorregresivo jerarquico para la continuacion de musica simbolica de piano, presentado por el usuario naivecynics a la tarea de generacion de musica simbolica de MIREX 2026. El modelo aborda un problema especifico del dominio musical: la generacion de partituras en formato simbolico (MIDI) donde las dependencias entre notas requieren modelar simultaneamente estructura global a nivel de compas o frase y decisiones locales a nivel de nota.

La arquitectura combina dos transformadores anidados: un decodificador a nivel de partitura de 14 capas que captura dependencias entre notas y un decodificador a nivel de nota de 2 capas que predice de forma autorregresiva el delta de onset, la altura y la duracion de cada evento. El checkpoint principal tiene 144,2 millones de parametros con un tamano oculto de 768, y el repositorio incluye una variante reducida denominada DAMN-Mini de 20,5 millones de parametros que emplea RoPE con inicio absoluto y token EOS.

El modelo es relevante para investigadores en generacion musical simbolica y para desarrolladores que necesiten integrar continuacion de piano en herramientas de composicion asistida, siempre teniendo en cuenta que se trata de un artefacto de investigacion con muy poca difusion (13 descargas) y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerarquico autorregresivo (decodificador a nivel de partitura de 14 capas + decodificador a nivel de nota de 2 capas) |
| Parametros totales | 144.243.585 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio musical simbolico, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 0,7 GB |
| Tamano oculto | 768 |
| Variante reducida | DAMN-Mini, 20,5 M de parametros (RoPE con inicio absoluto + EOS) |

## Arquitectura y entrenamiento

DAMN emplea una arquitectura de transformadores anidados. El nivel superior es un decodificador de 14 capas y tamano oculto 768 que modela la partitura como secuencia de eventos y captura dependencias de largo alcance entre notas. El nivel inferior es un decodificador de 2 capas que, condicionado por la representacion del nivel superior, predice de forma autorregresiva tres atributos por nota: delta de onset, altura (pitch) y duracion. Esta separacion permite factorizar la generacion en una representacion compacta de la estructura musical y una emision detallada de eventos, lo que reduce la longitud efectiva de la secuencia sobre la que opera el transformador grande.

La model card no detalla el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de ajuste como RLHF o DPO; tampoco describe innovaciones adicionales como decodificacion especulativa o atencion lineal. La variante DAMN-Mini introduce RoPE con inicio absoluto y un token EOS explicito, y comparte la misma implementacion de inferencia que el checkpoint principal. No se dispone de informacion sobre el corpus de piano utilizado ni sobre el preprocesado de los ficheros MIDI.

## Capacidades

- Continuacion de musica simbolica de piano: dado un fragmento de partitura de entrada, genera la continuacion en formato simbolico (MIDI).
- Modelado jerarquico de eventos musicales: predice delta de onset, altura y duracion de forma autorregresiva.
- Generacion condicionada por contexto musical previo, con estructura global modelada por el decodificador de partitura.
- Variante ligera DAMN-Mini (20,5 M de parametros) para entornos con menos recursos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues de lenguaje natural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Composicion asistida de piano: el modelo recibe un fragmento inicial en JSON/MIDI y genera una continuacion coherente, util como borrador para compositores que quieran explorar variaciones sobre un motivo dado.
- Generacion de material de entrenamiento musical: se pueden producir grandes volumenes de continuaciones simbolicas para aumentar corpus de piano destinados a otros modelos o a sistemas de analisis musical.
- Herramientas educativas de armonia y contrapunto: la continuacion generada sirve como ejemplo para ilustrar como se desarrolla un motivo, con la advertencia de que requiere revision humana.
- Prototipado en investigacion de musica simbolica: el par de checkpoints (144 M y 20,5 M) permite comparar el efecto del tamano del modelo en tareas de continuacion dentro de un mismo pipeline de inferencia.
- Integracion en DAWs o editores de partituras mediante el script de generacion incluido: el comando `generation.sh input.json outputs/mini 8` permite generar 8 continuaciones a partir de una entrada JSON, lo que facilita la integracion en flujos de trabajo locales.
- Experimentacion con representaciones delta-absolutas: el modelo sirve como referencia para investigadores que quieran evaluar la factorizacion delta-onset/pitch/duration frente a representaciones token-a-token convencionales.
- Evaluacion en MIREX: el modelo esta pensado como submission a la tarea de generacion de musica simbolica de MIREX 2026, por lo que es adecuado para reproducir o comparar resultados dentro de ese marco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint principal tiene 144,2 M de parametros; en precisión FP16 requiere aproximadamente 0,3 GB solo para pesos, y en FP32 alrededor de 0,6 GB. Con overhead de activaciones y buffers, un entorno de 2-4 GB de VRAM es suficiente.
- DAMN-Mini (20,5 M de parametros) requiere menos de 0,1 GB para pesos en FP16, por lo que cabe en cualquier GPU consumer moderna e incluso en CPU para generacion de lotes pequenos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3060, RTX 4060, RTX 4090) es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos.
- Opciones de despliegue: la model card solo documenta la inferencia mediante el script `generation.sh` del repositorio de GitHub y la descarga con `hf download`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de continuacion de piano simbolico ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si se permite uso comercial; debe contactarse con el autor antes de cualquier uso en produccion.
- Modelo de investigacion con difusion minima (13 descargas, 1 like): no hay evidencia de validacion externa ni de robustez en produccion.
- No se documentan sesgos del corpus de entrenamiento; al ser musica simbolica, los sesgos se manifestarian como estilos o generos sobrerrepresentados.
- Riesgo de continuaciones musicalmente incoherentes o repetitivas, especialmente con contextos de entrada atipicos.
- Longitud de contexto no documentada: se desconoce cuanta partitura previa puede condicionar el modelo.
- No apto para tareas de lenguaje natural, vision, audio ni tool calling.
- No se especifican requisitos de formato exacto de la entrada JSON mas alla del ejemplo del repositorio; errores de formato pueden producir fallos silenciosos.
- Sin informacion sobre cuantizaciones oficiales: cualquier cuantizacion seria no validada por el autor.
- El nombre del modelo incluye una referencia a MIREX 2026, lo que sugiere que puede tratarse de una submission de evaluacion y no de un modelo finalizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/naivecynics/MIREX2026-DAMN
- Repositorio de inferencia (GitHub): https://github.com/naivecynics/MIREX2026-DAMN
- Variante DAMN-Mini: https://huggingface.co/naivecynics/MIREX2026-DAMN/tree/main/mini
- Tarea de generacion de musica simbolica de MIREX: no disponible en la informacion proporcionada.

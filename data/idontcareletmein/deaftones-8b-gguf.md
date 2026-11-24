# IDONTCARELETMEIN/deaftones-8B-GGUF

## Resumen

deaftones-8B-GGUF es la version cuantizada en formato GGUF de deaftones-8B, un modelo de lenguaje especializado en diseno de sonido y sintesis musical desarrollado por el usuario IDONTCARELETMEIN. El modelo resuelve una tarea muy concreta: a partir de una descripcion textual de un sonido y el nombre de un sintetizador (Serum 2, Vital o Diva), genera el preset correspondiente en formato de texto `.idc`, incluyendo primero su razonamiento en una seccion `<think>` y despues la configuracion del parche.

Tecnicamente se construye sobre el modelo de lenguaje Qwen3-8B (8.190.735.360 parametros), del que conserva la torre de texto y la capa de salida. La version completa incluye ademas un codificador de audio y adaptadores que permiten al modelo escuchar grabaciones del preset sonando; esta variante GGUF elimina deliberadamente esos componentes y es, por tanto, estrictamente texto. El modelo solo entiende ingles.

La relevancia de esta publicacion radica en su enfoque vertical: en lugar de un modelo generalista, ofrece una herramienta de asistencia creativa para disenadores de sonido, con cuantizaciones validadas mediante perplexity y divergencia KL frente al modelo en bf16, e incluso una importance matrix calculada sobre presets reales. La licencia Apache 2.0 facilita su integracion en herramientas y flujos de produccion musical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B), con capa de salida adaptada a presets `.idc` |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens recomendados para inferencia |
| Tipos de cuantizacion | Q8_0 (8,7 GB) y Q4_K_M (5,0 GB); Q4_K_M con importance matrix (`imatrix.dat` incluido) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8B parametros heredado de Qwen3-8B. La variante original deaftones-8B incorpora un codificador de audio, un adaptador y modulos DeepStack mergers que permiten condicionar la generacion a una grabacion del preset sonando; durante el entrenamiento el modelo escucho audio, pero en inferencia textual ejecuta exactamente el mismo computo que el modelo completo. Esta version GGUF conserva unicamente la torre de lenguaje y la capa de salida "exactamente como se entreno", omitiendo el pipeline de audio.

El ajuste esta orientado a una unica tarea: dado un sintetizador y una descripcion, producir razonamiento en `<think>` y despues el preset en `.idc`. No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La validacion de las cuantizaciones se realizo sobre 64 presets reservados (120.000 tokens) y la importance matrix de Q4_K_M se calculo sobre 118 presets no vistos durante el entrenamiento, lo que indica un corpus de evaluacion especifico del dominio.

## Capacidades

- Generacion de presets para sintetizadores Serum 2, Vital y Diva en formato de texto `.idc`.
- Razonamiento explicito en modo thinking (`<think>`) antes de emitir el preset, lo que permite auditar la logica de diseno del sonido.
- Traduccion de descripciones cualitativas de sonido ("pluck de sierra detuneada, brillante y ancha para arpegios rapidos") a parametros concretos del sintetizador.
- Generacion de texto conversacional en ingles, heredada de la base Qwen3-8B.
- Condicionamiento por audio: no disponible en esta variante GGUF (requiere deaftones-8B o deaftones-8B-bnb-nf4 con transformers).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles.

## Casos de uso

- Asistencia a disenadores de sonido en la creacion de presets: el usuario describe el timbre deseado y el modelo devuelve el parche completo para Serum 2, Vital o Diva, reduciendo el tiempo de iteracion manual sobre los controles del sintetizador.
- Prototipado rapido de bancos de sonidos: generar variaciones de un mismo concepto (por ejemplo, distintas envolventes de un pluck) para explorar rapidamente el espacio de diseno antes de refinar a mano.
- Educacion y aprendizaje de sintesis: el bloque `<think>` expone el razonamiento detras de cada decision de parametros, lo que sirve como material didactico para entender como se construye un sonido desde una descripcion.
- Integracion en herramientas de produccion musical: al ser GGUF y ejecutable con llama.cpp, puede embeberse en un plugin o script local que reciba una descripcion y escriba directamente el archivo `.idc` en el proyecto.
- Generacion de presets en lote para librerias comerciales: con 8.192 tokens de contexto y respuestas de 1.000 a 4.000 tokens, es viable procesar descripciones encoladas y producir presets de forma automatizada.
- Reproduccion de estilos sonoros a partir de referencias textuales: un productor puede describir el caracter de un sonido de una referencia y obtener un punto de partida en su sintetizador, sin necesidad de transcripcion manual.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (5,0 GB) permite ejecutar el modelo en tarjetas de 6-8 GB, habilitando su uso en estaciones de trabajo musicales sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de cuantizacion frente al modelo en bf16, medidas sobre 64 presets reservados (120.000 tokens):

| Version | Tamano | Perplexity | KL media vs bf16 | Mismo token top que bf16 |
|---|---:|---:|---:|---:|
| bf16 (no subido) | 16,4 GB | 2,358 | — | — |
| `deaftones-8B-Q8_0.gguf` | 8,7 GB | 2,361 | 0,0014 | 98,6% |
| `deaftones-8B-Q4_K_M.gguf` | 5,0 GB | 2,385 | 0,0135 | 95,1% |

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 GB para Q4_K_M y 9 GB para Q8_0, mas el espacio de contexto (8.192 tokens).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_M; para Q8_0 se recomienda 10-12 GB o mas.
- Cabe en GPU de consumo: si, Q4_K_M esta pensado explicitamente para tarjetas de 6-8 GB; Q8_0 requiere gamas altas (por ejemplo, RTX 4070 Ti o superiores).
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99`), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp.
- Parametros de muestreo recomendados: temperatura 0,7, top-k 45, top-p 1, min-p 0, repeat-penalty 1; desactivar el resto de samplers por defecto de llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (generacion de presets de sintetizador) en la documentacion proporcionada. Como referencia estructural, esta variante se apoya en Qwen3-8B, pero no se han publicado datos que permitan una comparacion cuantitativa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| deaftones-8B-GGUF | 8,19B | 8.192 | Apache 2.0 | GGUF | Presets de sintetizador (texto) |
| deaftones-8B | 8,19B | no disponible | Apache 2.0 | transformers | Presets de sintetizador (texto + audio) |
| Alternativas de la categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo procesa texto: no puede escuchar grabaciones del preset, una capacidad reservada a la version completa con transformers.
- Solo soporta ingles; las peticiones en castellano no estan cubiertas por el entrenamiento declarado.
- El modelo esta especializado en tres sintetizadores concretos (Serum 2, Vital, Diva); no se garantiza su utilidad con otros.
- Riesgo de alucinacion en los parametros generados: los presets `.idc` deben validarse cargandolos en el sintetizador antes de usarlos en produccion.
- Las respuestas son largas (1.000-4.000 tokens), por lo que el contexto debe configurarse en 8.192 tokens; contextos menores pueden truncar la salida.
- Los samplers por defecto de llama.cpp alteran la salida; es necesario desactivarlos explicitamente para reproducir el comportamiento probado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta afiliado ni respaldado por Xfer Records (Serum), Vital Audio (Vital) ni u-he (Diva); el uso de sus nombres y formatos puede estar sujeto a las condiciones de cada fabricante.
- El repositorio tiene un volumen de descargas muy bajo (8) y ningun "like", por lo que no existe validacion comunitaria extensa.
- No se han publicado evaluaciones de sesgos ni de robustez fuera del dominio musical.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B-GGUF
- Modelo base completo: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B
- Version bnb-nf4: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B-bnb-nf4
- llama.cpp: https://github.com/ggml-org/llama.cpp

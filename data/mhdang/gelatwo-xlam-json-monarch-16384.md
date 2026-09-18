# mhdang/gelatwo-xlam-json-monarch-16384

## Resumen
`gelatwo-xlam-json-monarch-16384` es un modelo oculto de Markov (HMM) destilado de `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por Meihua Dang y colaboradores (UCLA, Stanford) en el marco del articulo *Mitigating Bias in Locally Constrained Decoding via Tractable Proposals* (ICML 2026). No es un modelo de lenguaje generativo: es una distribucion propuesta que se usa como componente auxiliar para decodificacion restringida (constrained decoding) sobre plantillas JSON en tareas de tool calling con xLAM.

El problema que resuelve es el sesgo introducido por la decodificacion restringida local (LCD), que enmascara tokens paso a paso y sesga las muestras resultantes hacia secuencias poco probables. El metodo P-GCD combina este HMM con un automata finito tensorizado para formar una propuesta que transporta informacion logica y probabilistica, y muestrea de ella mediante Monte Carlo secuencial (SMC). El HMM aporta la capacidad de anticipacion (lookahead) que el automata por si solo no puede ofrecer: estimar como de probable es que la restriccion siga siendo satisfacible desde el estado actual.

Tecnicamente destaca por su tamano (2.105.556.992 parametros) y por su matriz de transicion factorizada mediante bloques Monarch de 128x128 con 16384 estados ocultos, lo que la hace tratable en memoria y computo a diferencia de un HMM denso equivalente. Reutiliza el tokenizador de Llama-3.1-8B-Instruct (vocabulario de 128256 tokens) para alinear ambos vocabularios en tiempo de decodificacion, y se publica bajo licencia MIT.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | HMM con matriz de transicion factorizada Monarch (bloques de 128x128) |
| Parametros totales | 2.105.556.992 (~2,1 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de contexto; el modelo puntua secuencias token a token sin limite fijo declarado |
| Tipos de cuantizacion | no disponibles |
| Idiomas soportados | no disponibles (el vocabulario de 128256 tokens coincide con el de Llama-3.1-8B-Instruct) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Estados ocultos | 16384 |
| Vocabulario | 128256 |
| Clase de implementacion | `gelatwo.hmm.MonarchHMM` |
| Modelo base del destilado | `meta-llama/Llama-3.1-8B-Instruct` |
| Tamano del repositorio | 8,4 GB |
| Descargas / likes | 14 / 0 |

## Arquitectura y entrenamiento
El modelo es un HMM de 16384 estados ocultos cuya matriz de transicion se factoriza en bloques Monarch de 128x128 en lugar de almacenarse de forma densa. Esta factorizacion reduce drasticamente el coste de memoria y de computo de la matriz de transicion, que de otro modo seria cuadratica respecto al numero de estados (16384 x 16384). La clase que lo implementa es `MonarchHMM`, incluida en la libreria de referencia `gelatwo`.

No es un ajuste fino del modelo base ni comparte pesos con el: es un modelo independiente entrenado por Expectation-Maximization (EM) sobre secuencias muestreadas de `meta-llama/Llama-3.1-8B-Instruct`. La unica dependencia compartida es el tokenizador, que se reutiliza para que ambos vocabularios coincidan en el momento de la decodificacion. En el pipeline P-GCD, este HMM se combina con un automata finito tensorizado y se muestrea de la propuesta conjunta mediante Monte Carlo secuencial, lo que corrige el sesgo de la decodificacion restringida local. La informacion publicada no detalla el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un HMM entrenado por EM).

## Capacidades
- Puntuacion probabilistica de secuencias de tokens: asigna probabilidades a transiciones sobre un vocabulario de 128256 simbolos alineado con Llama-3.1-8B-Instruct.
- Estimacion de lookahead para decodificacion restringida: cuantifica la probabilidad de que una restriccion (por ejemplo, un esquema JSON) siga siendo satisfacible desde el estado actual.
- Integracion como propuesta en P-GCD: se combina con un automata finito tensorizado para formar una distribucion propuesta mixta.
- Muestreo mediante Monte Carlo secuencial (SMC) sobre la propuesta conjunta, con correccion de pesos.
- Soporte de tool calling con plantilla JSON en xLAM cuando se usa dentro del pipeline completo (la configuracion `configs/xlam.yaml` de la implementacion de referencia ya apunta a este checkpoint).
- No genera texto de forma autonoma: carece de capacidad de generacion libre, dialogo, codigo, matematicas o vision por si mismo.
- No soporta tool calling ni razonamiento multi-paso de manera nativa; estas capacidades dependen del modelo de lenguaje que se decodifica, no de este HMM.
- No dispone de modo thinking, entrada de audio ni multimodalidad.

## Casos de uso
- Decodificacion restringida a esquemas JSON en produccion: el HMM actua como propuesta P-GCD junto al automata, de modo que las salidas del modelo de lenguaje subyacente cumplen el esquema sin necesidad de post-procesado ni reintentos por parseo fallido.
- Tool calling estructurado en agentes: en pipelines donde cada paso requiere una llamada a funcion con argumentos tipados, el modelo reduce la tasa de JSON invalido y mejora la fidelidad a la distribucion objetivo frente a LCD pura.
- Extraccion de datos estructurados de texto libre: al forzar plantillas JSON, se puede convertir texto no estructurado en registros validables por esquema con una sola pasada de decodificacion.
- Reproducibilidad de investigacion en decodificacion restringida: el checkpoint esta referenciado directamente en `configs/xlam.yaml` de la implementacion de referencia, por lo que sirve para replicar los experimentos del articulo sin reentrenar el HMM.
- Generacion de datos sinteticos conformes a esquema: permite muestrear salidas que respetan una gramatica o esquema dados, utiles para construir conjuntos de evaluacion de validadores y parsers.
- Servidores de inferencia con contratos estrictos de API: en entornos donde un JSON mal formado rompe la cadena de llamadas (orquestadores, CI/CD, RPA), la propuesta reduce el fallo en el primer token que rompe la estructura.
- Sistemas de formularios y validacion de campos: rellenado automatico de campos obligatorios y opcionales respetando el orden y los tipos definidos por el esquema.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web menciona un grafico de "Accuracy (%) on xLAM with JSON format comparing LCD and P-GCD" en el articulo (arXiv:2606.01926), pero no se proporcionan los valores numericos.

| Benchmark | Resultado | Notas |
|---|---|---|
| xLAM (formato JSON), exactitud LCD vs. P-GCD | no disponible | El articulo reporta una comparativa, pero las cifras no se incluyen en la informacion proporcionada |
| MMLU, HumanEval, GSM8K u otros | no aplicable | El modelo no es un LM generativo y no se evalua en estas tareas |

## Requisitos de hardware
- VRAM estimada para inferencia: en el formato publicado (safetensors, 8,4 GB de repositorio) los pesos ocupan aproximadamente 8,4 GB, lo que corresponde a una representacion de 32 bits para 2,1 mil millones de parametros. En bfloat16 o float16 la huella se reduciria teoricamente a ~4,2 GB, aunque no se documenta soporte de precision reducida para esta clase.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede alojar los pesos en 32 bits con margen; se recomienda NVIDIA A100, H100, L40S o RTX 4090 para escenarios con lotes grandes o multiples instancias concurrentes.
- Cabe en GPU de consumo: si. RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) y RTX 4070 Ti Super (16 GB) son suficientes para los pesos; en tarjetas de 8-12 GB puede requerir gestion cuidadosa del contexto y del automata asociado.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un transformer. El unico camino documentado es la implementacion de referencia `github.com/MhDang/gelatwo`, mediante `MonarchHMM.from_pretrained(...)`, que debe integrarse en el bucle de decodificacion del modelo de lenguaje.
- Latencia y throughput: no disponibles. La factorizacion Monarch en bloques de 128x128 esta disenada precisamente para abaratar el producto matriz-vector con la matriz de transicion, pero no se publican mediciones.

## Comparativa con modelos similares
No existen checkpoints publicos equivalentes de HMMs propuesta para decodificacion restringida, por lo que la comparacion solo es significativa a nivel de pipeline (modelo de lenguaje + mecanismo de restriccion). Se incluyen como referencia el modelo del que se destila y un modelo habitual en tareas de tool calling.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gelatwo-xlam-json-monarch-16384 | 2.105.556.992 | no aplica (puntuacion token a token) | HMM factorizado Monarch | MIT | HuggingFace + repo `gelatwo` |
| meta-llama/Llama-3.1-8B-Instruct | 8 mil millones | 128k tokens | Transformer decoder | Llama 3.1 Community License | HuggingFace |
| Qwen2.5-7B-Instruct | 7,6 mil millones | 128k tokens | Transformer decoder | Apache 2.0 | HuggingFace |

Nota: la comparacion con los dos transformers es asimetrica, ya que este modelo no genera texto y solo actua como propuesta dentro del decodificador. En el articulo, su alternativa directa es la decodificacion restringida local (LCD) sin HMM, cuyos datos cuantitativos no se recogen en la informacion disponible.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no puede generar texto, responder preguntas ni mantener conversaciones. Usarlo fuera del pipeline de decodificacion restringida no produce resultados utiles.
- Requiere la implementacion de referencia `gelatwo` y, segun el propio autor, esta disenado especificamente para el caso xLAM con plantilla JSON. Su validez en otros esquemas o gramaticas no esta documentada.
- Al destilarse por EM sobre secuencias de `Llama-3.1-8B-Instruct`, hereda la distribucion y los sesgos de ese modelo base en la medida en que estos se reflejen en las secuencias muestreadas.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de asignar probabilidad alta a transiciones que no respetan la restriccion objetivo si la propuesta esta mal calibrada; el metodo lo mitiga combinando el HMM con el automata, no usando el HMM en solitario.
- Limitaciones de idioma: no declaradas. El vocabulario cubre los 128256 tokens de Llama-3.1-8B-Instruct, pero la utilidad practica esta atada a la plantilla JSON de xLAM, no a la cobertura idiomatica del tokenizador.
- Adopcion muy baja y modelo reciente: 14 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion de septiembre de 2026. No hay evidencia de uso en produccion fuera del grupo de investigacion.
- Licencia MIT, permisiva y compatible con uso comercial, pero al integrarse con `meta-llama/Llama-3.1-8B-Instruct` en el pipeline completo se debe verificar tambien la licencia de Llama 3.1 Community para el modelo que finalmente genera el texto.
- No se documentan tipos de cuantizacion soportados ni degradacion esperada de la calidad bajo precision reducida.

## Enlaces
- HuggingFace: https://huggingface.co/mhdang/gelatwo-xlam-json-monarch-16384
- Repositorio de referencia: https://github.com/MhDang/gelatwo
- Articulo (arXiv): https://arxiv.org/abs/2606.01926
- Version HTML del articulo: https://arxiv.org/html/2606.01926v2
- PDF en UCLA StarAI: https://starai.cs.ucla.edu/papers/DangICML26.pdf

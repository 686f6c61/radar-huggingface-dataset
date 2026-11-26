# pranil00/ONIX-Qwen2.5-Math-72B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-Math-72B-Instruct-GGUF es una version cuantizada del modelo Qwen2.5-Math-72B-Instruct de Alibaba Qwen, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto aplica una cuantizacion extrema IQ1_S (1,56 bits por peso) sobre los 72.705.376.256 parametros del modelo original, reduciendo el peso de los ficheros de 142,20 GB en FP16 a 13,86 GB, lo que supone una compresion de 10,26x. El objetivo declarado es permitir la ejecucion de un modelo de 72B en hardware de consumo mediante offload hibrido entre GPU y RAM del sistema.

El modelo base, Qwen2.5-Math-72B-Instruct, es un transformer decoder-only especializado en razonamiento matematico, con soporte de chain-of-thought, tool calling para ejecucion de codigo (Python) y capacidades multilingues (chino e ingles principalmente). Esta orientado a la resolucion de problemas matematicos de competicion, demostraciones formales y razonamiento cuantitativo. La version cuantizada conserva la arquitectura y el tokenizador originales, pero degrada la precision numerica de los pesos de forma agresiva.

La relevancia de esta publicacion es fundamentalmente practica: demuestra que es tecnicamente posible cargar un modelo de 72B en equipos con 14-16 GB de memoria unificada o VRAM, a costa de una perdida de calidad estimada del 40% segun la propia model card. Es un artefacto experimental, sin descargas ni validacion comunitaria en el momento de la ficha, y debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), modelo base Qwen2.5-Math-72B-Instruct |
| Parametros totales | 72.705.376.256 (72,71B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU segun la model card (contexto nativo del modelo base no indicado en la informacion disponible) |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso); KV cache en Q4_0 segun el informe de telemetria |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta chino e ingles; la model card no lo detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen--Qwen2.5-Math-72B-Instruct-IQ1_S.gguf`, 13,86 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-Math-72B-Instruct: un transformer decoder-only denso de 72,71 mil millones de parametros, entrenado por Alibaba Qwen con enfasis en razonamiento matematico. El modelo base incorpora entrenamiento con chain-of-thought (CoT) para problemas matematicos, soporte de integracion de herramientas (ejecucion de Python) y ajuste por instrucciones. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La contribucion de esta publicacion es exclusivamente la cuantizacion: se aplica el esquema IQ1_S de llama.cpp, que representa cada peso con aproximadamente 1,56 bits mediante cuantizacion por bloques con escalas compartidas. El proceso se realizo con la herramienta `run-any-model`, un motor de optimizacion adaptativo descrito por el autor. El informe de telemetria incluido en la model card indica que 66 de las 80 capas del modelo se descargan en la GPU o Metal, mientras que las 14 restantes se transmiten desde la RAM del sistema (offload hibrido), lo que reduce los requisitos de memoria a costa de velocidad de generacion. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento matematico: hereda del modelo base la capacidad de resolver problemas aritmeticos, algebraicos y de competicion mediante cadenas de razonamiento.
- Razonamiento paso a paso (chain-of-thought): el modelo base esta entrenado para emitir trazas de razonamiento antes de la respuesta final.
- Tool calling para ejecucion de codigo: el modelo base Qwen2.5-Math-Instruct soporta invocacion de un interprete de Python para verificar calculos.
- Generacion de codigo: capacidad secundaria heredada del modelo base, orientada a scripts de calculo y manipulacion de datos.
- Capacidades multilingues: el modelo base soporta chino e ingles; el resto de idiomas no esta documentado en esta publicacion.
- Modo instructivo: ajustado para seguir instrucciones y responder en formato conversacional.
- No se documenta soporte de vision, audio ni modo thinking explicito en esta version cuantizada.

## Casos de uso

- Experimentacion educativa con modelos de gran escala: permite cargar un 72B en un portatil con 16 GB de memoria unificada para estudiar el comportamiento de modelos grandes y el impacto de la cuantizacion extrema en la calidad de salida.
- Prototipado de tutores matematicos en local: se puede desplegar un asistente que resuelva problemas paso a paso sin conexion a internet, aceptando la perdida de precision numerica como contrapartida a la privacidad y al coste cero de inferencia.
- Validacion de pipelines de cuantizacion: sirve como caso de prueba para comparar IQ1_S frente a otras cuantizaciones (Q4_K_M, Q8_0) del mismo modelo base y medir la degradacion real en tareas de aritmetica.
- Demostraciones de offload hibrido: util para evaluar el rendimiento de `run-any-model` y de llama.cpp con modelos que exceden la VRAM disponible, midiendo tokens por segundo en configuraciones GPU+CPU.
- Generacion de borradores de codigo para calculo cientifico: en entornos sin GPU de datacenter, el modelo puede producir scripts de Python para analisis numerico, aunque requiere revision humana por la perdida de fidelidad.
- Investigacion sobre robustez de modelos cuantizados: permite estudiar como afecta una cuantizacion de 1,56 bits a la coherencia de las cadenas de razonamiento y a la tasa de alucinacion en problemas matematicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un informe de telemetria del motor `run-any-model` con las siguientes metricas de compresion y despliegue, que no son benchmarks de calidad:

| Metrica | Baseline (FP16) | Cuantizado (IQ1_S) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 1,56 | -90,2% |
| Tamano de pesos | 142,20 GB | 13,86 GB | -90,2% |
| Buffer KV cache | 320,0 MB (FP16) | 320,0 MB (Q4_0) | Optimizado |
| RAM residente total | 143,60 GB | 14,33 GB | -90,0% |
| Calidad estimada | 100,0% baseline | 60,0% retenida | -40,0% |
| Capas aceleradas | 0% (riesgo de crash) | 66/80 capas | - |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 14,33 GB de memoria unificada en Apple Silicon; 15,36 GB de VRAM dedicada en NVIDIA; 16,33 GB de RAM libre en CPU (segun la model card).
- GPU recomendadas: NVIDIA RTX serie 30/40/50 con al menos 16 GB de VRAM (RTX 4080, RTX 4090, RTX 5080); en Apple Silicon, chips M1/M2/M3/M4/M5 con 16 GB o mas de memoria unificada.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM, aunque con offload hibrido de 14 de las 80 capas al sistema.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI `run-any-model`.
- Latencia y throughput: no disponibles. La model card advierte explicitamente de que la velocidad de generacion sera mas lenta debido al offload hibrido, pero no proporciona cifras de tokens por segundo.
- Contexto operativo recomendado: 8.192 tokens en GPU y Apple Silicon; 4.096 tokens en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-Math-72B-Instruct-GGUF (esta ficha) | 72,71B | 8.192 (GPU) / 4.096 (CPU) | IQ1_S (1,56 bits) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-Math-72B-Instruct (original) | 72,71B | no disponible en esta ficha | FP16/BF16 | Apache 2.0 (modelo base Qwen) | Hugging Face oficial |
| Qwen2.5-Math-7B-Instruct | 7B | no disponible en esta ficha | Multiples (GGUF, AWQ, GPTQ) | Apache 2.0 | Hugging Face oficial |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La comparacion se limita a parametros, formato y requisitos de memoria.

## Limitaciones y advertencias

- Perdida de calidad severa: la propia model card estima una retencion de calidad del 60% respecto al modelo FP16, lo que implica una degradacion del 40% en fidelidad cognitiva. No es adecuado para tareas que requieran precision numerica exacta.
- Riesgo elevado de alucinacion: la cuantizacion a 1,56 bits por peso puede producir errores aritmeticos, razonamientos incoherentes y respuestas factualmente incorrectas con mayor frecuencia que el modelo base.
- Offload hibrido: 14 de las 80 capas se ejecutan desde la CPU, lo que reduce la velocidad de generacion de forma significativa; no se publican cifras de throughput.
- Contexto limitado en la practica: 8.192 tokens en acelerador y 4.096 en CPU, inferior al contexto nativo del modelo base.
- Idiomas no documentados: la model card no especifica los idiomas soportados; se hereda del modelo base (chino e ingles principalmente), sin garantias para castellano.
- Sin validacion comunitaria: el artefacto tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo dia, lo que sugiere ausencia de pruebas independientes.
- Licencia: Apache 2.0 permite uso comercial, pero el descargo de responsabilidad del autor exime de toda garantia y responsabilidad sobre los outputs; el implementador debe auditar y validar todas las salidas.
- No apto para produccion sin evaluacion previa: la combinacion de cuantizacion extrema, falta de benchmarks y ausencia de validacion lo desaconseja para sistemas en produccion sin una bateria de pruebas propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-Math-72B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-72B-Instruct
- Organizacion ONIX: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model

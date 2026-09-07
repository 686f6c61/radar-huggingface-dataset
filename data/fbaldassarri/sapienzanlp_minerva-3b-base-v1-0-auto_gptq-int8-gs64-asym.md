# fbaldassarri/sapienzanlp_Minerva-3B-base-v1.0-auto_gptq-int8-gs64-asym

## Resumen

`Minerva-3B-base-v1.0` es un modelo de lenguaje causal (causal LM) desarrollado por Sapienza NLP, con soporte para italiano e inglés. Esta ficha describe la versión cuantizada en INT8 mediante GPTQ (AutoGPTQ), publicada por `fbaldassarri`, que utiliza el framework Intel AutoRound v0.13.1 para una cuantización de solo pesos (weights-only quantization) con group size 64 y cuantización asimétrica. El modelo original es un transformer de arquitectura tipo Mistral, con 903.539.200 parámetros reales (a pesar de la nomenclatura "3B").

La cuantización INT8 está diseñada específicamente para optimizar la inferencia en hardware Intel: CPU, iGPU Arc y NPU AI Boost (Core Ultra) mediante OpenVINO o intel-extension-for-pytorch. Al ser un modelo base (no instruct), su uso principal es el completado de texto y el fine-tuning posterior. Su relevancia radica en ofrecer un modelo bilingüe italiano-inglés de tamaño reducido, capaz de ejecutarse en dispositivos de consumo con una huella de memoria baja, manteniendo una calidad razonable gracias a la cuantización INT8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (tipo Mistral) |
| Parametros totales | 903.539.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 GPTQ (AutoGPTQ), group size 64, asimetrica |
| Idiomas soportados | Italiano, Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados GPTQ) |

## Arquitectura y entrenamiento

El modelo base `sapienzanlp/Minerva-3B-base-v1.0` sigue la arquitectura de un transformer causal decodificador, del tipo Mistral. No se ha proporcionado informacion detallada sobre el numero de capas, dimensiones de atencion ni la longitud de contexto; estos datos no estan disponibles en la informacion facilitada. El modelo fue preentrenado por Sapienza NLP, pero no se especifican los datos de entrenamiento ni el numero de tokens utilizados.

La innovacion principal de esta version es la cuantizacion de solo pesos mediante Intel AutoRound, que aplica el algoritmo GPTQ (AutoGPTQ) en INT8, con group size 64 y cuantizacion asimetrica. El proceso de cuantizacion se realizo en CPU con `torch.bfloat16`, utilizando 128 muestras de calibracion, 200 iteraciones y una longitud de secuencia de 512 tokens. Este enfoque reduce el peso del modelo a aproximadamente 3.5 GB en disco, manteniendo un formato de pesos safetensors compatible con `transformers`.

## Capacidades

- Generacion de texto causal en italiano e ingles, como modelo de completado (base/completion).
- Cuantizacion INT8 optimizada para inferencia en CPU Intel, iGPU Arc (via intel-extension-for-pytorch) y NPU AI Boost (via OpenVINO).
- Soporte de carga mediante `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`, usando `device_map="auto"`.
- No se han documentado capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- No se han publicado resultados de benchmarks que permitan evaluar capacidades especificas de razonamiento, codigo o matematicas.

## Casos de uso

- Completado de texto en italiano: el modelo puede predecir continuaciones de frases en italiano, lo que lo hace util para autocompletar correos, documentos o entradas de blog en aplicaciones de escritura.
- Generacion de documentacion tecnica bilingue: al soportar italiano e ingles, puede usarse para generar borradores de documentacion tecnica en ambos idiomas, aunque requiere prompts bien formados al ser un modelo base.
- Fine-tuning para clasificacion de texto: al ser un modelo pequeno y bilingue, es adecuado como punto de partida para fine-tuning en tareas de clasificacion de sentimiento o categorizacion de documentos con pocos recursos computacionales.
- Inferencia en dispositivos edge con Intel Core Ultra: la cuantizacion INT8 y la optimizacion para NPU AI Boost permiten ejecutar el modelo en laptops o mini-PCs con procesadores Intel de ultima generacion, sin necesidad de GPU dedicada.
- Prototipado rapido de modelos de lenguaje: investigadores que necesiten un modelo bilingue de bajo coste para experimentos de generacion o evaluacion pueden cargar esta version cuantizada en entornos con CPU o GPU limitadas.
- Asistente de escritura en ingles/italiano: el modelo puede actuar como un motor de completado en editores de texto, sugiriendo finales de frases o parrafos en ambos idiomas, integrable en aplicaciones de escritorio o web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 903.539.200 parametros en INT8, los pesos ocupan aproximadamente 0.9 GB. Considerando activaciones y overhead, se estima una VRAM minima de 2 GB para ejecucion en GPU; en CPU no se requiere VRAM.
- GPU recomendadas: cualquier GPU compatible con GPTQ (NVIDIA, AMD) con 4 GB de VRAM o superior. Se recomienda especialmente el uso de CPU Intel, iGPU Arc o NPU AI Boost, segun la documentacion del autor.
- Si cabe en consumer GPU: si, el modelo puede ejecutarse en GPUs de consumo como una RTX 3050 o incluso en iGPU Intel Arc.
- Opciones de despliegue: `transformers` con AutoGPTQ, vLLM (si soporta GPTQ), TGI, y para Intel: intel-extension-for-pytorch y OpenVINO.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|
| Minerva-3B-base-v1.0 (original) | 903.539.200 | BF16 (sin cuantizar) | Safetensors | Apache 2.0 |
| Minerva-3B-base-v1.0 INT8 (este) | 903.539.200 | INT8 GPTQ (gs64, asim) | Safetensors | Apache 2.0 |
| Minerva-3B-base-v1.0 INT4 (variante) | 903.539.200 | INT4 AutoRound (gs64, asim) | Safetensors | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base: no esta alineado con instrucciones, por lo que no sigue prompts de forma fiable y puede generar texto sin formato ni intencion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje, especialmente sin fine-tuning especifico.
- Limitaciones de idioma: solo se declaran soporte para italiano e ingles; otros idiomas no estan garantizados.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el disclaimer del autor indica que el modelo se ha desarrollado solo con fines de investigacion y se distribuye sin garantias.
- La cuantizacion INT8 puede degradar ligeramente la calidad de la generacion en comparacion con el modelo en bfloat16.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-3B-base-v1.0-auto_gptq-int8-gs64-asym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-3B-base-v1.0
- Intel AutoRound: https://github.com/intel/auto-round
- auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Variante INT4: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-3B-base-v1.0-auto_round-int4-gs64-asym

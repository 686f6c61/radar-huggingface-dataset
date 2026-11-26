# pranil00/ONIX-SOLAR-10.7B-Instruct-v1.0-GGUF

## Resumen

ONIX-SOLAR-10.7B-Instruct-v1.0-GGUF es una cuantizacion en formato GGUF del modelo upstage/SOLAR-10.7B-Instruct-v1.0, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo original, desarrollado por Upstage, es un transformer de tipo LLaMA con 10.731.520.000 parametros, afinado para instrucciones y con licencia Apache 2.0. Esta version concreta aplica una cuantizacion Q5_K_M (5,5 bits por peso) que reduce el tamano de los pesos de 20,99 GB en FP16 a 7,21 GB, lo que permite ejecutar el modelo en hardware de consumo.

La relevancia de esta publicacion radica en su enfoque en la accesibilidad: segun la model card, el artefacto cabe en 8,04 GB de memoria unificada en Apple Silicon, 8,71 GB de VRAM en GPUs NVIDIA de las series RTX 30/40/50 y 10,04 GB de RAM en CPU con soporte AVX2/AVX-512. El autor declara una retencion de calidad del 97,5 % respecto al modelo en FP16 y una aceleracion de las 48 capas en Metal.

No obstante, se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, publicado de forma autonoma mediante la herramienta run-any-model, y sin datos verificables sobre idiomas soportados ni resultados de benchmarks propios. La ficha se limita, por tanto, a los datos declarados en la model card y a las caracteristicas conocidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (familia declarada en la model card) |
| Parametros totales | 10.731.520.000 (10,73 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU segun la model card (el modelo base SOLAR-10.7B soporta hasta 4.096 tokens de contexto nativo) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el repositorio solo publica esta variante |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `upstage--SOLAR-10.7B-Instruct-v1.0-Q5_K_M.gguf`, 7,21 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia LLaMA con 10,73 mil millones de parametros. La model card de esta cuantizacion no aporta detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO durante el afinado de instrucciones del modelo original; esa informacion corresponderia a la model card de upstage/SOLAR-10.7B-Instruct-v1.0, que no se ha proporcionado en la informacion disponible.

La innovacion tecnica de esta publicacion es exclusivamente la cuantizacion: se aplica un esquema Q5_K_M con 5,5 bits por peso, lo que reduce el tamano de 20,99 GB a 7,21 GB (ratio de compresion 2,91x, reduccion del 65,6 %). El buffer de KV cache se mantiene en FP16 (768 MB) y la model card declara la aceleracion de las 48 capas del modelo en Metal. La conversion se realizo de forma autonoma con la herramienta run-any-model, un motor de optimizacion adaptativo al dispositivo. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del afinado Instruct del modelo base.
- Razonamiento y respuesta a preguntas en formato chat multi-turno.
- Generacion de codigo y tareas de matematicas basicas, segun las capacidades tipicas del modelo base (no verificadas en esta cuantizacion).
- Ejecucion local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Soporte de plantilla de chat con tokens de parada `<|im_end|>` y `<|endoftext|>`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente conversacional local en portatil: con 7,21 GB de pesos, el modelo cabe en un Mac con 8 GB de memoria unificada o en una RTX 3060 de 12 GB, lo que permite mantener un chatbot privado sin conexion a Internet.
- Prototipado rapido de aplicaciones de chat: la integracion con Ollama y LM Studio permite levantar un endpoint de generacion de texto en minutos para validar prompts y flujos conversacionales antes de migrar a un modelo mayor.
- Procesamiento de documentos con contexto medio: la ventana de 4.096-8.192 tokens permite resumir articulos, correos o informes de varias paginas en una sola pasada en hardware de consumo.
- Generacion de codigo asistida en entornos sin GPU dedicada: la cuantizacion Q5_K_M mantiene un 97,5 % de la calidad declarada y permite autocompletar funciones o explicar fragmentos de codigo en un portatil.
- Educacion y experimentacion: sirve como banco de pruebas para estudiar el impacto de la cuantizacion Q5_K_M frente a FP16 en tareas de razonamiento, con una penalizacion declarada de solo 2,5 puntos porcentuales.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse integramente en local, es adecuado para procesar datos sensibles (informes medicos, documentacion legal) sin enviarlos a APIs externas.
- Traduccion y reescritura de texto: el modelo base tiene capacidades multilingues, aunque esta cuantizacion no declara la lista concreta de idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una matriz de telemetria interna de la herramienta run-any-model, que no constituye una evaluacion de calidad:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 20,99 GB | 7,21 GB | -65,6 % |
| Buffer KV cache | 768,0 MB (FP16) | 768,0 MB (FP16) | Optimizado |
| RAM residente total | 21,81 GB | 8,04 GB | -63,1 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Capas aceleradas | 0 % | 48/48 capas | Optimo |

Esta tabla refleja unicamente el consumo de memoria y la retencion de calidad estimada por el autor, no resultados en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 8,04 GB de memoria unificada en Apple Silicon; 8,71 GB de VRAM dedicada en NVIDIA; 10,04 GB de RAM libre en CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y sucesoras de las series 30/40/50 con al menos 8,71 GB de VRAM. En el segmento profesional, A100 y H100 son sobradamente suficientes pero no se justifican para un modelo de 10,7 B.
- Cabe en GPU de consumo: si, en cualquier GPU con 12 GB o mas de VRAM; en GPUs de 8 GB queda muy justo y puede requerir offload parcial de capas a CPU.
- Apple Silicon: M1, M2, M3, M4 y M5 con al menos 8 GB de memoria unificada, con aceleracion Metal declarada al 100 %.
- CPU: soporte AVX2 / AVX-512, con ventana de contexto reducida a 4.096 tokens.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles. La model card no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-SOLAR-10.7B-Instruct-v1.0-GGUF (esta ficha) | 10,73 B | 4.096-8.192 tokens | Apache 2.0 | GGUF Q5_K_M | 0 descargas |
| upstage/SOLAR-10.7B-Instruct-v1.0 (original) | 10,73 B | 4.096 tokens | Apache 2.0 | Safetensors | Modelo de referencia en Hugging Face |
| Mistral-7B-Instruct-v0.2 (GGUF) | 7,24 B | 32.768 tokens | Apache 2.0 | GGUF | Ampliamente distribuido |
| Llama-3.1-8B-Instruct (GGUF) | 8,03 B | 131.072 tokens | Llama 3.1 Community License | GGUF | Ampliamente distribuido |

El modelo original de Upstage y las alternativas de Mistral y Meta ofrecen ventanas de contexto notablemente mayores (hasta 131.072 tokens en Llama 3.1) y una comunidad de cuantizaciones mucho mas amplia. La ventaja de esta publicacion es su tamano reducido y su licencia Apache 2.0 plenamente permisiva, aunque su adopcion es practicamente nula (cero descargas) y no hay evidencia de validacion independiente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; el modelo base puede heredar sesgos de su dataset de entrenamiento, no especificado.
- Riesgo de alucinacion: inherente a los modelos de 10,7 B; no hay evaluaciones publicadas que lo cuantifiquen.
- Limitacion de contexto: la ventana efectiva es de 4.096 tokens en CPU y de hasta 8.192 en GPU/Apple Silicon, inferior a la de modelos contemporaneos de tamano similar.
- Idiomas: la model card no declara la lista de idiomas soportados; el comportamiento multilingue no esta verificado para esta cuantizacion.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye una clausula de exencion total de responsabilidad que traslada al usuario la validacion de todas las salidas.
- Calidad de la cuantizacion: la retencion del 97,5 % es una estimacion del autor, no una medicion con benchmarks estandar.
- Madurez del artefacto: cero descargas y cero likes; no hay evidencia de uso en produccion ni de validacion por terceros.
- Procedencia: la publicacion la realiza un usuario individual (pranil00) bajo la etiqueta ONIX, no la organizacion Upstage; conviene verificar la integridad del archivo GGUF antes de desplegarlo.
- Contexto practico: en CPU, la ventana de 4.096 tokens limita tareas de resumen de documentos largos.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/pranil00/ONIX-SOLAR-10.7B-Instruct-v1.0-GGUF
- Modelo base: https://huggingface.co/upstage/SOLAR-10.7B-Instruct-v1.0
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model

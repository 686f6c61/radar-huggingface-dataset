# mouddane/Falcon3-7B-Instruct-1.58bit-TQ2_0-GGUF

## Resumen

Falcon3-7B-Instruct-1.58bit-TQ2_0-GGUF es una cuantizacion en formato GGUF del modelo ternario Falcon3-7B-Instruct-1.58bit publicado por el Technology Innovation Institute (TII) de Abu Dabi. El modelo original aplica tecnicas de entrenamiento tipo BitNet, en el que los pesos se restringen a valores ternarios (-1, 0, +1), lo que reduce drasticamente el coste de almacenamiento y permite inferencia eficiente en CPU. Esta version concreta, mantenida por el usuario mouddane, resuelve un problema practico de interoperabilidad: el GGUF oficial de TII usa el formato `i2_s` de bitnet.cpp, que llama.cpp estandar no puede cargar.

El autor reconvierte los pesos ternarios al tipo `TQ2_0` de llama.cpp (2,06 bits por peso), representando los valores ternarios de forma exacta y, por tanto, sin perdida en ese paso. Ademas, recuantiza las capas de embedding de entrada y de salida (que TII dejo en 16 bits) a `q4_K` y `q6_K` respectivamente, reduciendo el fichero de 3,33 GB a 2,28 GB, con perdida limitada a esas dos matrices.

Con 7.455.599.616 parametros totales y un tamano de repositorio de 2,3 GB, el modelo esta pensado para ejecucion en hardware modesto, incluidos moviles. Su relevancia radica en que democratiza el uso de un modelo conversacional de 7B en entornos sin GPU, aunque con las limitaciones propias de una cuantizacion ternaria agresiva y de un ecosistema de herramientas aun poco maduro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Falcon3), con pesos ternarios entrenados segun el enfoque BitNet 1.58 bits |
| Parametros totales | 7.455.599.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ2_0 (2,06 bits por peso) para los pesos ternarios; q4_K para el embedding de entrada; q6_K para la capa de salida |
| Idiomas soportados | no disponible |
| Licencia | TII Falcon License (falcon-llm-license), con Acceptable Use Policy asociada |
| Formato de pesos | GGUF (fichero unico `Falcon3-7B-Instruct-1.58bit-TQ2_0.gguf`, 2,28 GB) |

## Arquitectura y entrenamiento

El modelo base es Falcon3-7B-Instruct, un transformer decoder-only de la familia Falcon3 de TII. Sobre esa arquitectura, la variante 1.58bit aplica el paradigma de pesos ternarios: cada peso se restringe a {-1, 0, +1}, lo que en la practica se traduce en operaciones de multiplicacion-suma sin multiplicadores de coma flotante y en un almacenamiento de aproximadamente 1,58 bits por peso en el modelo original. Esta ficha corresponde a una conversion de esos pesos a GGUF, no a un reentrenamiento.

El proceso de conversion documentado por el autor tiene dos fases. Primero ejecuta `convert_hf_to_gguf.py --outtype tq2_0` sobre los safetensors originales, descomprimiendo los pesos ternarios y almacenandolos como `TQ2_0` (2,06 bits por peso), paso que es sin perdida porque los valores ternarios se representan de forma exacta. Segundo, recuantiza el embedding de entrada y la capa de salida, que TII mantuvo en 16 bits (1,6 GB en conjunto), usando `llama-quantize --token-embedding-type q4_K --output-tensor-type q6_K`; este paso si introduce perdida, pero acotada a esas dos matrices.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de prompt `<|user|> ... <|assistant|>` y terminacion en `<|endoftext|>`.
- Instrucciones y dialogo: el sufijo Instruct del modelo base indica ajuste para seguir instrucciones.
- Inferencia en CPU pura: el autor reporta unos 8 tokens/s de generacion y 13-14 tokens/s de procesamiento de prompt en un OnePlus 8 (Snapdragon 865, 4 hilos), sin GPU.
- Compatibilidad con llama.cpp estandar, a diferencia del GGUF oficial de TII, que requiere bitnet.cpp.
- Soporte de tool calling, function calling, razonamiento multi-paso, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en movil o dispositivo embebido: con 2,28 GB de fichero y ~8 tokens/s en un Snapdragon 865, el modelo cabe en un telefono de gama alta y permite un chatbot local sin conexion ni GPU, adecuado para prototipos de asistentes personales.
- Despliegue en servidores sin GPU: al ejecutarse en llama.cpp sobre CPU, permite servir un modelo de 7B en maquinas de bajo coste o en entornos donde no hay aceleradores disponibles, con throughput limitado pero funcional para cargas ligeras.
- Experimentacion con cuantizacion ternaria: sirve como banco de pruebas para estudiar el impacto de TQ2_0 y de la recuantizacion de embeddings en la calidad de salida, comparando contra el original en safetensors o el GGUF de bitnet.cpp.
- Evaluacion de calidad de modelos BitNet en tareas de instruccion: util para investigadores que quieran medir como se degrada el seguimiento de instrucciones al pasar de pesos de 16 bits a ternarios.
- Generacion de texto offline en entornos air-gapped: el caracter monofichero del GGUF y la ausencia de dependencias de GPU facilitan su uso en sistemas aislados.
- Educacion y docencia: permite mostrar en un portatil el funcionamiento de un LLM de 7B conversacional con requisitos de hardware minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento medido es la velocidad de inferencia reportada por el autor: aproximadamente 8 tokens/s de generacion y 13-14 tokens/s de procesamiento de prompt en un OnePlus 8 (Snapdragon 865, 4 hilos, solo CPU) con llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; el modelo esta disenado para CPU. En GPU, el fichero de 2,28 GB mas el contexto y buffers de llama.cpp caben holgadamente en GPUs con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo completo; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas.
- Cabe en movil: si; el autor lo ejecuta en un OnePlus 8 con Snapdragon 865.
- Opciones de despliegue: llama.cpp (soporte nativo de TQ2_0), y por extension cualquier frontend que use llama.cpp como Ollama o LM Studio, siempre que la version incluya soporte de TQ2_0. bitnet.cpp no es necesario para este fichero.
- Latencia y throughput estimados: ~8 tokens/s de generacion y 13-14 tokens/s de prompt processing en Snapdragon 865 con 4 hilos; no hay datos para GPU ni para otros CPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Falcon3-7B-Instruct-1.58bit-TQ2_0-GGUF) | 7,46 B | no disponible | GGUF TQ2_0 (2,06 bits/peso) | TII Falcon License | Carga en llama.cpp estandar; ~2,28 GB |
| tiiuae/Falcon3-7B-Instruct-1.58bit | 7,46 B | no disponible | Safetensors ternarios (1,58 bits) | TII Falcon License | Modelo original; requiere bitnet.cpp o conversion |
| GGUF oficial de TII (i2_s) | 7,46 B | no disponible | GGUF i2_s | TII Falcon License | No soportado por llama.cpp estandar |
| Falcon3-7B-Instruct (16 bits) | 7,46 B | no disponible | Safetensors BF16 | TII Falcon License | Referencia de calidad sin cuantizacion ternaria |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La recuantizacion de los tensores de embedding de entrada (q4_K) y de salida (q6_K) es con perdida; puede afectar a la calidad de vocabulario raro y a la coherencia de la capa de salida respecto al original en 16 bits.
- La cuantizacion ternaria en si misma implica una perdida de capacidad frente al Falcon3-7B-Instruct en BF16; no hay benchmarks publicados que cuantifiquen esa degradacion.
- Riesgo de alucinacion: inherente a los LLM de 7B, y potencialmente mayor con pesos ternarios; no hay evaluaciones publicadas que lo midan.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se debe asumir un rendimiento multilingue solido sin evaluacion.
- Longitud de contexto: no disponible; conviene verificar el valor configurado en el GGUF antes de usarlo en produccion con prompts largos.
- Licencia: TII Falcon License con Acceptable Use Policy; es necesario revisar los terminos en falconllm.tii.ae antes de cualquier uso comercial.
- El autor declara no estar afiliado ni respaldado por TII; es una conversion de terceros, sin garantias de mantenimiento.
- Soporte de TQ2_0 limitado a versiones recientes de llama.cpp; versiones antiguas o herramientas que no lo soporten fallaran al cargar el fichero.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema de validacion practicamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mouddane/Falcon3-7B-Instruct-1.58bit-TQ2_0-GGUF
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Instruct-1.58bit
- Terminos y condiciones de la licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Portal de TII Falcon: https://falconllm.tii.ae/

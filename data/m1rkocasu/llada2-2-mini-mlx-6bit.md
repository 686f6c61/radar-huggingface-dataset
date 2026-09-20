# m1rkocasu/LLaDA2.2-mini-MLX-6bit

## Resumen

LLaDA2.2-mini-MLX-6bit es una conversión a 6 bits para Apple Silicon del modelo inclusionAI/LLaDA2.2-mini, un modelo de lenguaje de difusión (dLLM) con arquitectura de mezcla de expertos (MoE) de 16.255.643.392 parámetros totales y aproximadamente 1.400 millones de parámetros activos por token. La conversión la publica el usuario m1rkocasu y está pensada para ejecutarse con MLX sobre chips de Apple, con un peso en disco de 13,2 GB y un pico de memoria de 12,4 GiB. A diferencia de un modelo autorregresivo clásico, no genera un token detrás de otro: escribe bloques de 32 tokens en paralelo, rellenando máscaras y editando su propio borrador.

El interés de esta ficha es doble. Por un lado, es una de las primeras formas prácticas de ejecutar un modelo de difusión de texto de 16B en un portátil Apple: la model card reporta entre 54 y 89 tokens/s en código y entre 22 y 28 tokens/s en prosa sobre un M4 Pro. Por otro, la conversión no es un simple cambio de formato: la model card documenta que mlx-vlm ya cargaba LLaDA2.0 y 2.1, pero al aplicar esa misma ruta a 2.2 el modelo respondía mal sin dar error, porque faltaban el enrutado por bloques, el muestreador de 2.2 y un tokenizador correcto tras la conversión.

Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y código de soporte propio que no modifica la instalación de mlx-vlm. Existen también variantes de 4 bits y 5 bits del mismo autor, y el repositorio base en bf16 ocupa unos 30 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con decodificacion por difusion (dLLM, tag llada2_moe); 19 capas MoE; enrutado por bloques de 32 tokens |
| Parametros totales | 16.255.643.392 (~16,26 B) |
| Parametros activos | ~1,4 B por token (8 expertos por token, seleccionados entre 48 de 256 por bloque) |
| Longitud de contexto | no disponible (la decodificacion trabaja en bloques fijos de 32 tokens) |
| Tipos de cuantizacion | 6 bits en este repo (6,5 bits por peso de media; el router se mantiene en precision completa); variantes de 4 y 5 bits en repos separados |
| Idiomas soportados | no disponible como lista oficial; la model card solo documenta pruebas en ingles e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx, custom_code); repo de 13,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con decodificacion por difusion. En lugar de predecir el siguiente token, LLaDA2.2 trabaja por bloques de 32 tokens: rellena en paralelo las posiciones enmascaradas, reescribe tokens que ya habia escrito y emite tokens especiales `DELETE` e `INSERT` que encogen o alargan el borrador, con un remuestreador anti-bucle y varias pasadas de refinamiento por bloque. El enrutado tambien es por bloques: cada bloque conserva primero 48 de los 256 expertos y despues cada token elige sus 8 entre esos 48. La longitud de bloque esta fijada por el enrutado y no se puede cambiar, segun la model card.

Los valores por defecto de decodificacion son los de la implementacion de referencia: umbral 0,5, umbral de edicion 0,0, 16 pasadas de refinamiento y bloques de 32 tokens. La conversion incluye el paquete `llada22_mlx`, compuesto por dos ficheros de la implementacion LLaDA2 de mlx-vlm (`language.py`, `config.py`, licencia MIT) con las adiciones de la version 2.2; importarlo hace que mlx-vlm use esas versiones sin modificar nada dentro de la instalacion. Esta escrito contra mlx-vlm 0.7.1 y avisa si los ficheros LLaDA2 instalados difieren.

Sobre el entrenamiento no hay informacion en los materiales proporcionados: no se detallan el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO. Lo que si se documenta es el proceso de verificacion de la conversion: comparacion capa a capa en float32 entre MLX y la implementacion de referencia en PyTorch, con error de estado oculto por capa entre 1e-9 y 8e-7 (como maximo 2,6 veces la diferencia entre PyTorch en CPU y en MPS), expertos seleccionados por el router identicos en 96 de 96 tokens en las 19 capas MoE, y argmax de los logits en las posiciones enmascaradas identico en el 100 % de los casos. El muestreador se valido token a token con tres prompts (aritmetica, italiano, codigo), produciendo exactamente los mismos 167, 104 y 256 tokens que la referencia; con el muestreador de 2.1 la divergencia aparece en los tokens 67, 29 y 47 respectivamente.

## Capacidades

- Generacion de texto por difusion: escribe bloques de 32 tokens en paralelo en lugar de token a token, con edicion y refinamiento del borrador.
- Generacion de codigo: la model card reporta el mayor rendimiento en tareas de codigo (54-89 tokens/s en M4 Pro) y las pruebas incluyen funciones generadas y ejecutadas contra casos de prueba.
- Aritmetica y respuestas verificables: parte de la bateria de evaluacion comprueba numeros exactos y objetos JSON que deben parsearse.
- Generacion de JSON estructurado: la evaluacion citada incluye respuestas que deben parsear al objeto esperado.
- Multilingue limitado: se documentan pruebas en ingles e italiano; no hay lista oficial de idiomas.
- Conversacion: el repo incluye la etiqueta `conversational` y la model card usa plantilla de chat mediante `apply_chat_template`.
- Ejecucion local en Apple Silicon: soporte de MLX con pico de memoria de 12,4 GiB.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso explicitas: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada (el modelo se carga mediante mlx-vlm, pero no se documenta ninguna capacidad multimodal).

## Casos de uso

- Asistente de codigo totalmente local: con 54-89 tokens/s en un M4 Pro y 12,4 GiB de pico de memoria, se puede integrar en un editor o CLI sobre un Mac sin enviar codigo a ningun servicio externo, aprovechando que el modelo base esta entrenado y evaluado en generacion de funciones.
- Generacion de JSON para pipelines internos: la evaluacion de la model card incluye comprobaciones de JSON parseable, lo que permite usarlo como extractor o formateador de respuestas estructuradas en procesos por lotes ejecutados en local.
- Redaccion y resumen de documentos en ingles e italiano: con 22-28 tokens/s en prosa, es viable para borradores y resumenes de textos largos en esos dos idiomas, aunque no haya lista oficial de idiomas soportados.
- Procesamiento por lotes en un solo equipo Apple: para tareas nocturnas de clasificacion, reescritura o generacion de descripciones donde no importa tanto la latencia como el coste cero de API, el modelo se ejecuta con `mlx-vlm` y `mlx-lm` sin dependencias adicionales.
- Investigacion sobre modelos de lenguaje de difusion: el repositorio incluye el paquete `llada22_mlx` y los scripts de generacion, lo que permite experimentar con umbrales de decodificacion, pasadas de refinamiento y edicion de borradores sobre un modelo de 16B en hardware de consumo.
- Despliegue con requisitos de privacidad: al no necesitar red ni GPU dedicada, encaja en entornos donde los datos no pueden salir del dispositivo, como borradores legales o notas internas en italiano e ingles.
- Aplicaciones educativas y de demostracion: la decodificacion por bloques con edicion visible del borrador hace que el modelo sea util para explicar como funciona un dLLM frente a un modelo autorregresivo.
- Prototipado rapido de asistentes conversacionales: la model card usa plantilla de chat con `apply_chat_template`, de modo que se puede levantar un chatbot de pruebas local en un Mac con memoria unificada suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una bateria de 12 tareas (pedidas en ingles y en italiano, con respuestas verificadas por codigo) que compara este modelo con LLaDA2.1-mini 4-bit de mlx-community y con las variantes de 4 y 5 bits de LLaDA2.2-mini, pero la tabla de resultados aparece truncada en la informacion proporcionada, por lo que no se reproducen cifras.

Los unicos datos de rendimiento disponibles son de velocidad y memoria, medidos por el autor:

| Metrica | Valor |
|---|---|
| Velocidad en codigo (M4 Pro) | 54-89 tokens/s |
| Velocidad en prosa (M4 Pro) | 22-28 tokens/s |
| Pico de memoria | 12,4 GiB |
| Tamano en disco | 13,2 GB (6,5 bits por peso de media) |
| Error de estado oculto por capa (float32, MLX vs. PyTorch) | 1e-9 a 8e-7 |
| Expertos identicos en el router | 96 de 96 tokens, en las 19 capas MoE |
| Argmax de logits en posiciones enmascaradas | 100 % identico |

## Requisitos de hardware

- VRAM / memoria unificada: pico medido de 12,4 GiB para la variante de 6 bits. Se recomienda un equipo Apple Silicon con al menos 16 GB de memoria unificada; 32 GB dan margen para contexto y otras aplicaciones.
- GPU recomendadas: el modelo solo corre en Apple Silicon mediante MLX (etiqueta `apple-silicon`). No hay soporte CUDA documentado en este repositorio.
- Cabe en GPU de consumo: si, en Macs con memoria unificada suficiente; el autor lo mide en un M4 Pro. En GPU de consumo NVIDIA no hay ruta de despliegue documentada para esta conversion.
- Opciones de despliegue: `pip install -U mlx-vlm mlx-lm` mas el `generate.py` incluido en el repositorio, o carga desde Python con `trust_remote_code=True`. El paquete `llada22_mlx` debe importarse antes de cargar el modelo. No funciona en LM Studio ni en oMLX, porque decodifican de forma autorregresiva y no pueden ejecutar un modelo de difusion. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, ni pesos GGUF.
- Latencia y throughput: 54-89 tokens/s en codigo y 22-28 tokens/s en prosa sobre M4 Pro, medidos en seis respuestas largas (230-512 tokens) donde el coste fijo por bloque pesa menos.
- Alternativas de menor huella: los repos de 4 y 5 bits del mismo autor, y el checkpoint bf16 de referencia, que ocupa unos 30 GB y no cabe en un Mac de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| LLaDA2.2-mini-MLX-6bit (este repo) | 16,26 B totales, ~1,4 B activos | 6 bits, 13,2 GB | no disponible | 54-89 t/s codigo, 22-28 t/s prosa en M4 Pro; bateria de 12 tareas no disponible | Apache 2.0 |
| m1rkocasu/LLaDA2.2-mini-MLX-5bit | mismo modelo base | 5 bits | no disponible | no disponible | Apache 2.0 (segun el repo base) |
| m1rkocasu/LLaDA2.2-mini-MLX-4bit | mismo modelo base | 4 bits | no disponible | no disponible | Apache 2.0 (segun el repo base) |
| mlx-community/LLaDA2.1-mini-4bit | no disponible | 4 bits | no disponible | resultados de la bateria de 12 tareas no disponibles (tabla truncada) | no disponible |
| inclusionAI/LLaDA2.2-mini (bf16) | 16,26 B totales, ~1,4 B activos | bf16, ~30 GB | no disponible | no disponible | no disponible |

Los resultados comparativos de la bateria de 12 tareas existen en la model card, pero la informacion proporcionada los corta antes de las cifras, por lo que no se pueden citar. No se han encontrado en la busqueda web modelos comparables adicionales: los resultados devueltos no guardan relacion con el modelo.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documentan tasas de error ni evaluaciones de veracidad; como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto.
- Idiomas: no hay lista oficial de idiomas soportados. La model card solo documenta pruebas en ingles e italiano, de modo que el comportamiento en castellano u otros idiomas no esta verificado.
- Contexto: no se publica la longitud de contexto. Ademas, la decodificacion esta limitada a bloques de 32 tokens fijados por el enrutado del modelo y no se pueden cambiar.
- Perdida por cuantizacion: en bf16 las dos implementaciones (MLX y PyTorch) difieren mas y "unos pocos expertos casi empatados cambian"; la verificacion exacta se hizo en float32. La cuantizacion a 6 bits anade su propia perdida sobre el checkpoint base.
- Restricciones de ejecucion: no funciona en LM Studio ni en oMLX por su decodificacion autorregresiva. No hay pesos GGUF ni soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Caveat de tokenizador: la model card advierte que reconvertir el modelo con transformers 5 reescribe `tokenizer_config.json`, elimina `trust_remote_code` y hace que el tokenizador reconstruya el BPE sin fusiones, codificando un caracter por token (76 tokens en lugar de 30 para el mismo prompt), lo que produce respuestas vacias. Los ficheros de tokenizador de este repo son los correctos.
- Compatibilidad de codigo: `llada22_mlx` se escribio contra mlx-vlm 0.7.1 y avisa si la version instalada cambia los ficheros LLaDA2. mlx-vlm 0.7.1 y transformers 5.17 son las versiones con las que se probo la ruta de descarga.
- Licencia: Apache 2.0 permite uso comercial, pero la model card no aclara la licencia del checkpoint base ni las condiciones de los datos de entrenamiento.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son de 2026, por lo que la validacion por parte de la comunidad es practicamente nula.
- Rendimiento en produccion: solo hay mediciones de velocidad en un M4 Pro; no hay datos de latencia bajo carga concurrente ni de throughput en lote.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-6bit
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.2-mini
- Variante de 4 bits: https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-4bit
- Variante de 5 bits: https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-5bit
- Modelo de comparacion citado en la model card: https://huggingface.co/mlx-community/LLaDA2.1-mini-4bit
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo (los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion).
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.

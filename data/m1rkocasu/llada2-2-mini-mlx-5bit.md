# m1rkocasu/LLaDA2.2-mini-MLX-5bit

## Resumen

LLaDA2.2-mini-MLX-5bit es una conversión comunitaria del modelo de difusión discreta (dLLM) inclusionAI/LLaDA2.2-mini al formato MLX, cuantizada a 5 bits para su ejecución en Apple silicon. El modelo original es un transformer de mezcla de expertos (MoE) de 16.255.643.392 parámetros totales con aproximadamente 1.400 millones de parámetros activos por token. Su rasgo distintivo es que no genera token a token de forma autorregresiva: escribe bloques de 32 tokens en paralelo, rellenando máscaras y editando su propio borrador.

La conversión la firma el usuario m1rkocasu y se publica bajo licencia Apache 2.0. El repositorio ocupa 11,2 GB en disco (unos 5,5 bits por peso, con el router en precisión completa) y declara un pico de memoria de 10,5 GiB. Funciona con `mlx-vlm` y `mlx-lm`, e incluye un `generate.py` que replica los valores de decodificación de la implementación de referencia: umbral 0,5, umbral de edición 0,0, 16 pasadas de refinamiento y bloques de 32 tokens.

Su relevancia es doble. Por un lado, permite ejecutar un modelo de difusión de 16B en un Mac con memoria unificada sin necesidad de CUDA. Por otro, el autor documenta un problema serio: cargar LLaDA2.2 con `mlx-vlm` sin este paquete produce respuestas incorrectas sin lanzar ningún error, porque faltan el enrutado por bloques, el muestreador con tokens `DELETE`/`INSERT` y la corrección del tokenizador tras la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con decodificacion por difusion discreta en bloques |
| Parametros totales | 16.255.643.392 (~16,26 B) |
| Parametros activos | ~1,4 B por token (8 expertos por token, elegidos entre 48 de un total de 256) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (5,5 bits por peso de media; el router se mantiene en precision completa). Existen variantes de 4 y 6 bits del mismo autor |
| Idiomas soportados | no disponible (la model card no publica lista oficial; las pruebas del autor cubren ingles e italiano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), requiere `custom_code` |
| Modelo base | inclusionAI/LLaDA2.2-mini |
| Libreria | mlx |
| Tamano en disco | 11,2 GB |
| Memoria pico declarada | 10,5 GiB |
| Longitud de bloque | 32 tokens (fija, determinada por el enrutado del modelo) |
| Capas MoE | 19 |
| Repositorio | https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-5bit |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un MoE de difusión discreta. En lugar de predecir el siguiente token de forma autorregresiva, trabaja sobre bloques de 32 tokens: parte de posiciones enmascaradas y las rellena en paralelo durante varias pasadas de refinamiento. Además de rellenar máscaras, el muestreador de la versión 2.2 reescribe tokens ya emitidos y genera tokens especiales `DELETE` e `INSERT` que encogen o amplían el borrador, con un remuestreador anti-bucle. El enrutado también es específico de 2.2: cada bloque conserva primero 48 de los 256 expertos y después cada token elige 8 entre esos 48.

La conversión a MLX añade dos archivos (`language.py` y `config.py`, derivados de la implementación de LLaDA2 incluida en mlx-vlm, con licencia MIT) más las particularidades de 2.2. Importar el paquete `llada22_mlx` hace que mlx-vlm use estas versiones en lugar de las suyas, sin modificar nada dentro de mlx-vlm instalado; los modelos LLaDA2.0 y 2.1 siguen cargando igual. Está escrito contra mlx-vlm 0.7.1 y avisa si los archivos LLaDA2 de la versión instalada difieren.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la model card proporcionada no cubre el entrenamiento del modelo base y solo describe el proceso de conversión y verificación.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), incluyendo decodificación con temperatura configurable y modo greedy (`temperature=0.0`).
- Generación de código: la model card reporta pruebas con funciones en Python ejecutadas contra casos de test y velocidades de 53–91 tokens/s en código sobre un M4 Pro.
- Aritmética y cálculo exacto de números, verificado en la batería de 12 tareas del autor.
- Salida estructurada: la batería de evaluación incluye JSON que debe parsearse al objeto esperado.
- Generación multilingüe al menos en inglés e italiano (idiomas usados en las pruebas del autor); no hay lista oficial de idiomas.
- Escritura por bloques de 32 tokens con refinamiento iterativo (16 pasadas por defecto) y edición del propio borrador mediante tokens `DELETE`/`INSERT`.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de visión: no documentadas (aunque el runtime sea `mlx-vlm`, el modelo se publica con `pipeline_tag: text-generation` y naturaleza de texto).
- Modo de pensamiento explícito: no disponible.

## Casos de uso

- Asistente de código local en Mac: con 10,5 GiB de pico de memoria y 53–91 tokens/s en código sobre un M4 Pro, permite autocompletar y generar funciones sin salir del portátil ni enviar el código a un servicio externo.
- Generación de texto offline en portátil: los 22–28 tokens/s en prosa sobre M4 Pro hacen viable redactar resúmenes, borradores y documentación en entornos sin conectividad.
- Extracción de datos estructurados: la batería del autor valida la producción de JSON que parsea al objeto esperado, lo que encaja con pipelines de extracción de campos desde texto libre.
- Contenido bilingüe inglés-italiano: es el par de idiomas efectivamente probado por el autor, útil para redacción y traducción asistida en esos dos idiomas, con la advertencia de que no hay cobertura oficial declarada.
- Prototipado e investigación en modelos de difusión: los umbrales de decodificación (0,5 y 0,0), las pasadas de refinamiento (16) y la longitud de bloque (32, fija) son parámetros expuestos, lo que convierte al repositorio en un banco de pruebas para estudiar decodificación no autorregresiva.
- Evaluación de conversiones MLX: el autor documenta la metodología de verificación capa a capa y token a token, por lo que el repositorio sirve como referencia para validar otras cuantizaciones comunitarias.
- Despliegue en hardware Apple con memoria unificada: al no requerir CUDA, encaja en equipos de desarrollo y estaciones de trabajo Mac donde no hay GPU dedicada disponible.
- Procesamiento por lotes tolerante a latencia: la escritura por bloques de 32 tokens reduce el coste fijo por bloque en respuestas largas, lo que favorece tareas de generación por lotes frente a interacción interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye una batería propia de 12 tareas comparando LLaDA2.1-mini 4-bit con LLaDA2.2-mini 4-bit y 5-bit, pero la tabla aparece truncada en el material proporcionado, por lo que no se reproducen sus cifras.

Sí están disponibles los resultados de verificación de la conversión frente a la implementación de referencia en PyTorch, ejecutados en float32 en ambos lados:

| Prueba | Resultado |
|---|---|
| Error de estado oculto por capa | 1e-9 a 8e-7; como máximo 2,6 veces la diferencia entre PyTorch en CPU y PyTorch en MPS |
| Expertos elegidos por el router | identicos en 96 de 96 tokens, en las 19 capas MoE |
| Argmax de los logits en posiciones enmascaradas | identico, 100 % |
| Muestreador, prompt aritmetico | mismos 167 tokens que la referencia |
| Muestreador, prompt en italiano | mismos 104 tokens |
| Muestreador, prompt de codigo | mismos 256 tokens |
| Muestreador de 2.1 en su lugar | diverge en los tres prompts (tokens 67, 29 y 47) |

Rendimiento declarado por el autor:

| Escenario | Velocidad (M4 Pro) |
|---|---|
| Generacion de codigo | 53–91 tokens/s |
| Prosa | 22–28 tokens/s |

La velocidad se midió sobre seis respuestas largas (explicación, historia y código; entre 230 y 512 tokens cada una), donde el coste fijo de un bloque pesa menos.

## Requisitos de hardware

- VRAM/memoria estimada: pico declarado de 10,5 GiB para la variante de 5 bits; 11,2 GB en disco. Conviene disponer de al menos 16 GB de memoria unificada para dejar margen al sistema.
- GPU compatibles: exclusivamente Apple silicon mediante MLX (familias M1, M2, M3 y M4, en variantes base, Pro, Max y Ultra). No hay soporte CUDA ni ROCm documentado.
- Cabe en GPU de consumo: sí, en Mac con memoria unificada suficiente; el autor cita pruebas en M4 Pro. No se documenta ejecución en RTX 4090, A100 ni H100.
- Opciones de despliegue: `mlx-vlm` y `mlx-lm` con el paquete `llada22_mlx` incluido en el repositorio. Se instala con `pip install -U mlx-vlm mlx-lm` y se descarga con `hf download`. Existe un `generate.py` que acepta las opciones de `mlx_vlm generate`.
- Opciones no compatibles: LM Studio y oMLX decodifican de forma autorregresiva y no pueden ejecutar un modelo de difusión. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 53–91 tokens/s en código y 22–28 tokens/s en prosa sobre M4 Pro, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| LLaDA2.2-mini-MLX-5bit (este) | 16,26 B totales, ~1,4 B activos | no disponible | 5 bits | Apache 2.0 | MLX (Apple silicon) |
| LLaDA2.2-mini-MLX-4bit (mismo autor) | 16,26 B totales, ~1,4 B activos | no disponible | 4 bits | Apache 2.0 | MLX (Apple silicon) |
| LLaDA2.2-mini-MLX-6bit (mismo autor) | 16,26 B totales, ~1,4 B activos | no disponible | 6 bits | Apache 2.0 | MLX (Apple silicon) |
| LLaDA2.1-mini-4bit (mlx-community) | no disponible | no disponible | 4 bits | no disponible | MLX (Apple silicon) |
| inclusionAI/LLaDA2.2-mini (modelo base) | 16,26 B totales, ~1,4 B activos | no disponible | sin cuantizar (bf16, ~30 GB) | Apache 2.0 | PyTorch |

Nota: la model card presenta una tabla comparativa de rendimiento entre LLaDA2.1-mini 4-bit y las variantes 4 y 5 bits de LLaDA2.2, pero el material proporcionado la corta antes de mostrar los resultados, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Es una cuantizacion comunitaria, no oficial, del modelo de inclusionAI; no hay validacion por parte del equipo que entreno el modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.
- Riesgo de fallo silencioso: segun el autor, cargar LLaDA2.2-mini con `mlx-vlm` sin el paquete `llada22_mlx` produce respuestas incorrectas sin lanzar ningun error, porque faltan el enrutado por bloques y el muestreador de 2.2.
- El tokenizador es un punto fragil: convertir el modelo reescribe `tokenizer_config.json` y elimina `trust_remote_code`; con transformers 5 el tokenizador recargado puede reconstruir el BPE solo desde el vocabulario, sin merges, y codificar un caracter por token (76 tokens en lugar de 30 en el mismo prompt), lo que provoca turnos vacios.
- Requiere `trust_remote_code=True` para cargar la clase de tokenizador propia del modelo.
- La longitud de bloque de 32 tokens es fija, impuesta por el enrutado, y no puede modificarse.
- Compatibilidad de runtime limitada: no funciona en LM Studio ni oMLX, y no se documenta soporte para CUDA, vLLM, llama.cpp, Ollama o TGI.
- Dependencia de version: el paquete se escribio contra mlx-vlm 0.7.1 y transformers 5.17; avisa si los archivos LLaDA2 de la version instalada difieren, lo que puede implicar cambios de comportamiento.
- La model card no especifica longitud de contexto, lista de idiomas soportados, ni detalles de sesgos o datos de entrenamiento, lo que dificulta evaluar el comportamiento fuera de los casos probados.
- En bf16 las dos implementaciones difieren algo mas y algunos expertos casi empatados cambian; el autor atribuye la discrepancia al redondeo (MLX calcula RoPE en float32 y la referencia en bf16).
- Licencia Apache 2.0, que permite uso comercial, pero se aplica al artefacto publicado; conviene verificar la licencia del modelo base y de los archivos derivados de mlx-vlm (MIT) al redistribuir.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta conversion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-5bit
- Modelo base: https://huggingface.co/inclusionAI/LLaDA2.2-mini
- Variante de 4 bits: https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-4bit
- Variante de 6 bits: https://huggingface.co/m1rkocasu/LLaDA2.2-mini-MLX-6bit
- Referencia comparativa de LLaDA2.1-mini 4-bit: https://huggingface.co/mlx-community/LLaDA2.1-mini-4bit
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo; las busquedas devolvieron unicamente paginas de una cadena de bricolaje sin relacion con el modelo.

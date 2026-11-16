# maximianuu/qwen3.8-27b-nvfp4-gptq

## Resumen

`maximianuu/qwen3.8-27b-nvfp4-gptq` es una cuantizacion de 4 bits en formato `nvfp4` del modelo Qwen/Qwen3.8-27B, publicada por el usuario maximianuu para su uso con el motor de inferencia Farabi sobre Apple Silicon (MLX). El modelo base es un transformer multimodal de 27.356.728.560 parametros (unos 27,36 mil millones) con capacidad de entrada de texto e imagen, segun declara el pipeline `image-text-to-text`. El repositorio ocupa 17,9 GB y mantiene la licencia Apache 2.0 del modelo original.

La relevancia de esta publicacion no reside en el modelo base, sino en el proceso de cuantizacion: frente a la conversion `nvfp4` estandar de MLX, el autor aplica un reescalado por potencias de dos para mantener las escalas de bloque dentro del rango del formato de 8 bits, ajusta las escalas de bloque por minimos cuadrados en lugar de max-abs y aplica compensacion de error capa por capa con GPTQ sobre unos 58.000 tokens de calibracion. Segun la model card, esto mejora la fidelidad frente al modelo bf16 original de 0,339 a 0,085 de divergencia KL y del 82,4 % al 93,5 % de coincidencia en el token superior.

Es importante senalar que el repositorio esta disenado especificamente para el motor Farabi: el `config.json` incluye un valor de compensacion (`farabi_lm_head_shift`) que otros cargadores MLX no aplican, lo que produce una distribucion de salida incorrecta. Ademas, para decodificacion especulativa se requiere un cabezal draft separado (`qwen3.8-27b-mtp`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) con capas de atencion lineal; detalles completos de la arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits `nvfp4` con group size 16; GPTQ con compensacion de error; embeddings y proyecciones de compuerta de atencion lineal en bf16 |
| Idiomas soportados | no disponible (la calibracion incluye texto tecnico en turco e ingles, pero no se declara el conjunto de idiomas soportados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX); tamano del repo 17,9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de aproximadamente 27,36 mil millones de parametros que acepta texto e imagen como entrada. La model card menciona capas de atencion lineal con proyecciones de compuerta (`in_proj_a`, `in_proj_b`) que se mantienen en bf16 tras la cuantizacion, lo que sugiere una arquitectura hibrida con atencion lineal en parte de las capas, aunque no se detalla la composicion completa de la red ni el numero de capas, cabezales o dimension oculta. Tampoco se especifica la longitud de contexto nativa del modelo base ni el volumen total de tokens de entrenamiento.

El proceso de cuantizacion parte de los pesos bf16 originales y aplica tres pasos: cuantizacion de los pesos lineales a `nvfp4` de 4 bits (manteniendo en bf16 la tabla de embeddings y las compuertas de atencion lineal); reescalado de cada matriz por una potencia de dos antes de cuantizar, con el factor inverso plegado de forma exacta en los pesos de normalizacion vecinos o en `in_proj_a`/`in_proj_b`, y almacenado en `config.json` para `lm_head`; y redondeo con compensacion de error GPTQ capa por capa sobre aproximadamente 58.000 tokens de calibracion. Las escalas de bloque se ajustan por minimos cuadrados en lugar de por max-abs. No hay fine-tuning: el objetivo es replicar el comportamiento del original con la mayor fidelidad posible a 4 bits. Los datos de calibracion incluyen chats de razonamiento generados por el propio modelo, pares pregunta/respuesta, un chat con system prompt largo, prosa tecnica en turco e ingles, codigo Python y Swift, un chat con tool calling y respuestas JSON; el conjunto exacto es privado, pero la receta publica esta en el repositorio del motor (`tools/calibration.py`).

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat sin modificar respecto al modelo original.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`).
- Razonamiento en modo thinking: la calibracion incluye chats de razonamiento generados por el propio modelo, lo que indica soporte de cadenas de pensamiento.
- Tool calling / function calling: se uso un chat con tool calling en la calibracion, lo que confirma que el modelo base soporta esta capacidad.
- Salida estructurada en JSON.
- Generacion de codigo: la calibracion incluye codigo Python y Swift.
- Decodificacion especulativa: soportada mediante el cabezal draft separado `qwen3.8-27b-mtp`, necesario para esta funcion en el motor Farabi.
- Capacidades multilingues: la calibracion incluye turco e ingles; el conjunto completo de idiomas del modelo base no esta disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo, con 17,9 GB en disco y cuantizacion de 4 bits, se puede ejecutar en un Mac con memoria unificada suficiente mediante el motor Farabi, gestionando conversaciones multi-turno con plantilla de chat intacta.
- Procesamiento de documentos con imagenes: al aceptar entrada image-text-to-text, sirve para extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados en un flujo local sin enviar datos a la nube.
- Generacion y revision de codigo en local: la calibracion incluye Python y Swift, y el modelo soporta tool calling, por lo que puede integrarse en asistentes de programacion que invocan herramientas (ejecutar tests, consultar repositorios) en un entorno de desarrollo privado.
- Automatizacion con agentes y tool calling: el soporte de function calling y de respuestas JSON permite construir agentes multi-paso que encadenan llamadas a APIs y devuelven resultados estructurados.
- Razonamiento con modo thinking para tareas analiticas: util para depuracion, analisis de causas raiz o planificacion, donde la cadena de pensamiento explicita mejora la trazabilidad del resultado.
- Despliegue en entornos con requisitos de privacidad: al ser una conversion local con licencia Apache 2.0 y pesos abiertos, encaja en escenarios donde no se permite enviar datos a servicios externos, siempre que se acepte la dependencia del motor Farabi.
- Prototipado de inferencia especulativa: combinado con el cabezal draft `qwen3.8-27b-mtp`, sirve para experimentar con decodificacion especulativa en MLX y medir aceleraciones en hardware Apple.

## Benchmarks y rendimiento

La model card solo publica una metrica de fidelidad frente al modelo bf16 original, medida sobre 8.087 posiciones de token:

| Metrica | Esta conversion (nvfp4 + GPTQ) | Conversion nvfp4 estandar de MLX |
|---|---|---|
| Divergencia KL | 0,085 | 0,339 |
| Coincidencia en el token superior | 93,5 % | 82,4 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La propia model card advierte que la medicion de fidelidad corresponde a una maquina y un conjunto de prueba unicos.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 17,9 GB de pesos en disco; en memoria unificada de Apple Silicon se necesita al menos esa cifra mas el overhead del motor, las cache KV y el cabezal draft si se usa decodificacion especulativa.
- GPU recomendadas: el repositorio esta pensado para Apple Silicon (MLX); no se indica soporte para A100, H100 ni RTX 4090, y el formato `nvfp4` con la compensacion de Farabi no es portable a otros cargadores MLX sin perdida de fidelidad.
- Cabe en consumer GPU: no disponible para GPU NVIDIA; en Apple Silicon depende de la memoria unificada del equipo (los Mac con 24 GB o mas serian el minimo practico segun el tamano del repo, aunque el autor no publica requisitos oficiales).
- Opciones de despliegue: motor Farabi (`python -m engine.server`), con descarga via `hf download`; otros cargadores MLX leen los tensores pero no aplican `farabi_lm_head_shift` y producen una distribucion de salida incorrecta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| maximianuu/qwen3.8-27b-nvfp4-gptq | 27,36 mil millones | no disponible | nvfp4 4 bits + GPTQ | Apache 2.0 | Requiere motor Farabi; fidelidad KL 0,085 |
| Qwen/Qwen3.8-27B (base) | 27,36 mil millones | no disponible | bf16 | Apache 2.0 | Referencia de fidelidad; mayor huella de memoria |
| Conversion nvfp4 estandar de MLX del mismo modelo | 27,36 mil millones | no disponible | nvfp4 4 bits | Apache 2.0 | Fidelidad KL 0,339; compatible con cargadores MLX genericos |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento real frente a alternativas de la misma categoria; la unica comparacion publicada es la de fidelidad frente al modelo bf16 y frente a la conversion estandar de MLX.

## Limitaciones y advertencias

- Dependencia critica del motor Farabi: el `config.json` incluye `farabi_lm_head_shift`, que solo aplica ese motor; otros cargadores MLX produciran una distribucion de salida incorrecta aunque lean los tensores.
- Perdida de fidelidad inherente a 4 bits: la divergencia KL de 0,085 y la coincidencia del 93,5 % en el token superior implican que aproximadamente 1 de cada 15 predicciones del token superior difiere del modelo bf16.
- Medicion de fidelidad limitada: un solo conjunto de prueba y una sola maquina; no hay validacion independiente.
- Decodificacion especulativa incompleta sin el cabezal draft: es necesario descargar `qwen3.8-27b-mtp` por separado.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al no haber fine-tuning, hereda los sesgos del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es el propio de un modelo de 27 mil millones de parametros sin datos de evaluacion publicados.
- Limitaciones de contexto e idioma: la longitud de contexto y el conjunto de idiomas soportados no estan disponibles; la calibracion solo cubre turco e ingles ademas de codigo y JSON.
- Uso comercial: permitido bajo Apache 2.0, igual que el modelo original; el autor aclara que es una conversion no oficial y que "Qwen" es una marca de su propietario.
- Conversion no oficial: no esta respaldada por el equipo de Qwen; la calidad del proceso de cuantizacion depende del autor y de su receta de calibracion, cuyo conjunto exacto es privado.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maximianuu/qwen3.8-27b-nvfp4-gptq
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Farabi: https://github.com/maximianuu/farabi
- Cabezal draft para decodificacion especulativa: https://huggingface.co/maximianuu/qwen3.8-27b-mtp
- Receta de calibracion publica: `tools/calibration.py` en el repositorio del motor Farabi

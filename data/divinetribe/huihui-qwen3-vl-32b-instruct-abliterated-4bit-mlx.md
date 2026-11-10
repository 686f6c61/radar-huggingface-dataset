# divinetribe/Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx

## Resumen

Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx es una cuantizacion en 4 bits (afin, tamano de grupo 64) del modelo multimodal Qwen3-VL-32B-Instruct en su variante "abliterated" publicada por huihui-ai, convertida al formato MLX por el usuario divinetribe. El modelo original lo desarrolla el equipo Qwen de Alibaba; la abliteracion (proyeccion del vector de rechazo segun Arditi et al., 2024) la aplica huihui-ai, y la conversion a MLX la realiza divinetribe con `mlx-vlm` 0.4.4. Resuelve el problema de ejecutar un modelo vision-lenguaje de 32B parametros densos de forma totalmente local en Apple Silicon, sin llamadas a la nube ni claves de API.

La arquitectura es Qwen3-VL densa (no MoE) con 33.357.390.064 parametros totales y una ventana de contexto de 262.144 tokens (256 K nativos). Acepta texto e imagen como entrada y produce texto, con soporte de imagen unica, multiples imagenes y video mediante ingestion por fotogramas. El repositorio ocupa 19,6 GB y el autor indica que requiere unos 32 GB de memoria unificada para funcionar con comodidad, con mejor rendimiento en equipos de 64 GB o mas.

Su relevancia actual radica en dos factores: es, segun el autor, la primera cuantizacion en formato MLX de un Qwen3-VL abliterated, y cubre un nicho concreto de investigacion en seguridad, moderacion de contenido y OCR de documentos sensibles donde los rechazos del modelo base introducen ruido. La licencia Apache 2.0 se hereda del Qwen3-VL-32B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL densa, multimodal (image-text-to-text) |
| Parametros totales | 33.357.390.064 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256 K nativos) |
| Tipos de cuantizacion | 4-bit afin, group size 64 (unica variante en este repo) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-32B-Instruct, un transformer denso multimodal de la familia Qwen3-VL. Procesa texto e imagenes en un unico espacio de contexto de 256 K tokens y sustituye el esquema T-RoPE de generaciones anteriores por marcas temporales textuales explicitas, lo que permite el analisis de video mediante ingestion fotograma a fotograma. La variante Instruct ha pasado por las etapas de post-entrenamiento del modelo original (instrucciones y preferencias); la model card no detalla el numero de tokens de preentrenamiento ni la composicion exacta del dataset.

Sobre esa base, huihui-ai aplica abliteracion: una proyeccion que elimina la direccion de rechazo del espacio de activaciones siguiendo el metodo de Arditi et al. (2024). Esto no incrementa las capacidades del modelo, sino que suprime las respuestas de negativa ante consultas benignas pero delicadas. Posteriormente, divinetribe realiza la conversion a MLX 4-bit con `mlx-vlm` 0.4.4, sin indicar en la model card si hubo calibracion adicional, recetas de destilacion ni ajuste fino posterior a la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de texto e imagenes.
- Respuesta visual a preguntas (VQA) sobre una sola imagen.
- Razonamiento sobre multiples imagenes: comparacion de diagramas, resumen de capturas de pantalla en lote.
- Comprension de video mediante ingestion por fotogramas con marcas temporales textuales.
- OCR y extraccion de texto de documentos, incluidas capturas y documentos poco convencionales.
- Conversacion multi-turno con contexto largo de hasta 262.144 tokens.
- Salida de texto unicamente (no genera imagenes ni audio).
- Comportamiento "uncensored": supresion de la direccion de rechazo para consultas benignas pero delicadas.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modo thinking.

## Casos de uso

- Revision de documentos sensibles sin salida a la nube: el modelo procesa NDA, historiales medicos o declaraciones selladas de forma local, de modo que el contenido nunca abandona el equipo. Es adecuado por su contexto de 256 K tokens y por la ausencia de telemetria en el servidor local de `mlx-vlm`.
- OCR de documentos no convencionales: digitalizacion de formularios, capturas y material escaneado en entornos de investigacion donde una API en la nube registraria el contenido. La ventana de contexto permite volcar varias paginas en una sola peticion.
- Pruebas de moderacion de contenido: evaluacion de como responde un modelo sin capa de rechazo ante entradas limite, util para calibrar clasificadores y filtrar falsos positivos en pipelines de moderacion.
- Investigacion en seguridad de modelos: analisis de la direccion de rechazo y de la robustez frente a prompts adversarios comparando esta variante abliterated con el Qwen3-VL original.
- Analisis de video local: resumen y descripcion de grabaciones mediante ingestion por fotogramas con marcas temporales, por ejemplo para revision de material de vigilancia o auditoria de reuniones.
- Asistente de vision en estacion de trabajo Mac: despliegue de un endpoint compatible con OpenAI (`/v1/chat/completions`) en `localhost:8080` para integrar comprension de imagenes en herramientas internas sin coste por token.
- Comparacion de diagramas tecnicos: analisis de dos o mas imagenes en una misma conversacion para detectar diferencias entre versiones de un esquema o una captura de interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el autor indica que el modelo "quiere un Mac de 32 GB"; el footprint en disco es de aproximadamente 17 GB y el repositorio completo ocupa 19,6 GB. En equipos de 64 GB o mas la inferencia es mas fluida.
- GPU: exclusivamente Apple Silicon (MLX). No esta pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: si, en Mac con memoria unificada de 32 GB o superior (M-series). No aplica a tarjetas graficas discretas.
- Despliegue: `mlx-vlm` 0.4.4 para Python y CLI; servidor local compatible con OpenAI mediante `python -m mlx_vlm.server`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia |
|---|---|---|---|---|---|
| Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx (este) | 33,36 B | 262.144 | texto + imagen | MLX 4-bit | Apache 2.0 |
| huihui-ai/Huihui-Qwen3-VL-32B-Instruct-abliterated (base) | 32 B (BF16) | 262.144 | texto + imagen | safetensors BF16 | Apache 2.0 |
| Cuantizaciones MLX de Qwen3-VL sin abliterar (`lmstudio-community`, `mlx-community`) | 32 B | 262.144 | texto + imagen | MLX 3-bit a 8-bit | Apache 2.0 |
| divinetribe/gemma-4-31b-it-abliterated-4bit-mlx | 31 B | no disponible | texto | MLX 4-bit | no disponible |

La diferencia principal frente a las alternativas MLX de Qwen3-VL es la abliteracion; frente al modelo base BF16, la reduccion de huella (de aproximadamente 224.000 descargas mensuales del BF16 segun el autor) y la perdida de precision asociada al 4-bit. Los benchmarks comparativos no estan disponibles.

## Limitaciones y advertencias

- La abliteracion suprime la direccion de rechazo: el modelo puede producir contenido que el Qwen3-VL original rechazaria. No es una mejora de capacidades y traslada al usuario la responsabilidad sobre el uso.
- Riesgo de alucinacion inherente a los modelos de 32B, agravado por la cuantizacion 4-bit, especialmente en OCR de documentos de baja calidad y en razonamiento sobre multiples imagenes.
- La cuantizacion a 4 bits puede degradar tareas sensibles a la precision, como lectura de texto pequeno o calculo numerico; no se documenta evaluacion de la perdida respecto al BF16.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano no esta verificado y puede ser inferior al del modelo original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del Qwen3-VL-32B-Instruct y el usuario sigue obligado por ellas; la abliteracion no altera la licencia.
- Dependencia de hardware: solo Apple Silicon con MLX; no hay pesos GGUF ni ruta CUDA en este repositorio.
- El repositorio tiene 407 descargas y 1 like en el momento de la consulta; la validacion comunitaria es escasa.
- La model card incluye estadisticas de descargas y estrellas de GitHub que no se han podido verificar de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-VL-32B-Instruct-abliterated-4bit-mlx
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-32B-Instruct-abliterated
- Equipo Qwen (Alibaba): https://huggingface.co/Qwen
- Repositorio del autor (claude-code-local): https://github.com/nicedreamzapp/claude-code-local
- Perfil GitHub del autor: https://github.com/nicedreamzapp
- Paper de abliteration (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- AirGap AI: https://nicedreamzwholesale.com/airgap/
- Modelos del autor: https://nicedreamzwholesale.com/software/huggingface/

# dendriteholdings/Ingot-XXVII-27B-MLX-2bit

## Resumen

Ingot-XXVII-27B-MLX-2bit es un modelo de lenguaje de 27.359.638.768 parámetros (27,36 mil millones) publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que más se le aproxima. El modelo parte de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit, un modelo ternario de Prism ML, y el minero reajustó los pesos restantes para acercarlo a Qwen3.8-27B, manteniendo los códigos ternarios originales.

La relevancia de esta ficha es doble: por un lado documenta un ejercicio de cuantización competitiva a 2 bits con evaluación objetiva (divergencia KL frente al profesor en BF16), y por otro ofrece un artefacto práctico para Apple Silicon, ya que está empaquetado en formato MLX con un layout propietario (`prism_hadamard_qwen35`) que mlx-lm no carga de forma nativa y requiere el runtime MTPLX. El repositorio ocupa 8,60 GB y contiene un único `model.safetensors` con 2,25 bits por peso efectivos.

No se dispone de información sobre licencia, idiomas soportados ni configuración de contexto en la documentación proporcionada; todos esos campos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5 / Qwen3.8-27B) con pesos ternarios y layout `prism_hadamard_qwen35`; incluye torre de visión heredada del modelo base |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternarios (2,25 bits por peso: códigos de 2 bits con escala fp16 y bias por cada 128 pesos); affine 2-bit en MLX con scale d y bias −d |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), un único `model.safetensors` de 8,60 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de 27,36 mil millones de parámetros cuyos pesos se almacenan en códigos ternarios: cada bloque de 128 pesos conserva su código ternario y una escala fp16, de modo que cada peso decodifica al mismo valor numérico que emplea el kernel GGUF del gemelo. La conversión a MLX es sin pérdida: los códigos se mapean a valores affine 2-bit (scale d, bias −d). La torre de visión, la configuración, el tokenizer y los vectores de signo de Hadamard provienen íntegramente de prism-ml/Ternary-Bonsai-2-27B-mlx-2bit y no fueron modificados por la competición.

El entrenamiento consistió en un reajuste (finetune) de los pesos no ternarios por parte del minero para acercar el modelo a Qwen3.8-27B, manteniendo fijos los códigos ternarios. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La evaluación del subnet se basa en la divergencia KL entre las distribuciones del siguiente token del profesor en BF16 y las del modelo, promediada sobre las muestras: el modelo obtuvo 0,07881 frente a 0,08125 del rey al que destronó en la misma evaluación.

## Capacidades

- Generación de texto conversacional y continuación de texto (pipeline `text-generation`).
- Razonamiento y generación de código: los benchmarks internos de velocidad se miden sobre prompts de código y las respuestas de código alcanzan unos 90 tok/s con el drafter especulativo.
- Capacidades de visión: el modelo incluye la torre de visión heredada del modelo base, aunque no se detallan las tareas concretas soportadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Decodificación especulativa opcional mediante el drafter DFlash 2 (dendriteholdings/Ingot-27B-DFlash2-MLX), que propone varios tokens y el modelo los verifica.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está empaquetado en MLX y se sirve con MTPLX como API compatible con OpenAI, lo que permite desplegarlo en un Mac Studio o MacBook con GPU unificada sin GPU dedicada. Es adecuado por su tamaño de 8,60 GB en disco y su decodificación de 55-60 tok/s en M3 Ultra.
- Asistente de código en el escritorio: con el drafter DFlash 2 las respuestas de código alcanzan unos 90 tok/s en M3 Ultra, suficiente para autocompletado interactivo y generación de funciones en un IDE local.
- Servicio de chat self-hosted: MTPLX expone un endpoint compatible con OpenAI (`mtplx serve --port 8080`), de modo que se puede integrar en aplicaciones existentes que ya consuman la API de OpenAI sin cambiar el cliente.
- Evaluación de técnicas de cuantización: el modelo sirve como referencia práctica de cuantización ternaria a 2 bits con métrica KL frente a un profesor BF16, útil para investigadores que comparen esquemas de compresión.
- Prototipado con restricciones de memoria: al ocupar 8,60 GB y requerir solo 2,25 bits por peso, permite ejecutar un modelo de 27B en equipos con memoria unificada moderada, donde un modelo en BF16 no cabría.
- Reproducción de pipelines de competición: el modelo documenta el flujo completo (submission, evaluación KL, empaquetado MLX) y sirve para reproducir o auditar el proceso de un subnet de Bittensor.
- Fine-tuning ligero sobre pesos ternarios: al mantener los códigos ternarios y las escalas, se puede investigar el reajuste de los pesos restantes sin alterar la estructura de cuantización, como hizo el minero original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica de calidad publicada es la divergencia KL frente al profesor BF16:

| Modelo | KL (menor es mejor) |
|---|---|
| Ingot-XXVII-27B-MLX-2bit (evaluación ganadora) | 0,07881 |
| Rey anterior en la misma evaluación | 0,08125 |

Rendimiento de decodificación a batch 1 en Mac Studio M3 Ultra (GPU de 80 núcleos, 512 GB):

| Motor | Modo | tok/s |
|---|---|---|
| Servidor MTPLX 2.12 (mlx 0.32) | plain | 55,3 |
| mlx-lm 0.31 con kernels ternarios de MTPLX, en proceso | plain | 59,9 |
| Con drafter DFlash 2 (greedy, single-stream) | especulativo | ~73 |
| Con drafter DFlash 2 (respuestas de código) | especulativo | ~90 |
| Gemelo GGUF en fork de llama.cpp (misma máquina) | plain | 56,4 |
| Gemelo GGUF en RTX PRO 6000 | plain | 137 |

## Requisitos de hardware

- VRAM/memoria estimada: 8,60 GB de pesos en disco; el modelo requiere al menos esa cantidad de memoria unificada o VRAM, más overhead de runtime y caché KV (no cuantificada en la información disponible).
- GPU recomendadas: Apple Silicon con GPU unificada; las mediciones publicadas usan un Mac Studio M3 Ultra con GPU de 80 núcleos y 512 GB. El gemelo GGUF se midió en una RTX PRO 6000.
- ¿Cabe en GPU consumer? Sí en términos de memoria (8,60 GB), pero el formato MLX solo se ejecuta en Apple Silicon. En GPU NVIDIA habría que usar el gemelo GGUF con el fork de llama.cpp de DendriteLabs.
- Opciones de despliegue: MTPLX (`pip install mtplx`, `mtplx serve`) para el formato MLX; fork de llama.cpp de DendriteLabs para el gemelo GGUF. mlx-lm no carga el layout `prism_hadamard_qwen35` de forma nativa.
- Latencia y throughput: 55,3 tok/s con servidor MTPLX y 59,9 tok/s en proceso en M3 Ultra; hasta ~73 tok/s con decodificación especulativa y ~90 tok/s en código. En RTX PRO 6000 el gemelo GGUF alcanza 137 tok/s.
- Este repositorio no incluye cabeza MTP draft, por lo que MTPLX decodifica un token por paso sin el drafter externo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-XXVII-27B-MLX-2bit | 27,36 B | no disponible | 2-bit ternario (2,25 bpw) | no disponible | MLX, Apple Silicon (MTPLX) |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27 B (aprox.) | no disponible | 2-bit ternario | no disponible | MLX |
| dendriteholdings/Ingot-XXVII-27B-Q2 | 27 B (aprox.) | no disponible | 2-bit ternario (GGUF) | no disponible | GGUF (fork llama.cpp) |
| Qwen3.8-27B (profesor de referencia) | 27 B (aprox.) | no disponible | BF16 (referencia) | no disponible | no disponible |

La comparación se limita a los artefactos derivados del mismo linaje; no se dispone de datos de benchmarks de calidad ni de contexto para establecer comparaciones con modelos de otras familias.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos conocidos del modelo ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización ternaria a 2 bits introduce una divergencia medible frente al profesor (KL 0,07881), lo que implica degradación respecto al modelo en BF16.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial. Es imprescindible verificar la licencia del modelo base (Prism ML) antes de cualquier despliegue en producción.
- Dependencia de runtime propietario: el layout `prism_hadamard_qwen35` no lo carga mlx-lm de forma nativa; requiere MTPLX, lo que limita la portabilidad y añade una dependencia externa al stack.
- Solo Apple Silicon para el formato MLX; en otras plataformas hay que recurrir al gemelo GGUF y a un fork específico de llama.cpp.
- Sin cabeza MTP en este repositorio: la decodificación especulativa exige descargar y ejecutar un drafter separado (DFlash 2).
- Modelo derivado de una competición: los pesos provienen de una submission de un minero identificado por hotkey, sin garantías de auditoría más allá de la métrica KL publicada.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-XXVII-27B-MLX-2bit
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Gemelo GGUF del mismo autor: https://huggingface.co/dendriteholdings/Ingot-XXVII-27B-Q2
- Drafter especulativo DFlash 2: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2-MLX
- Runtime MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de DendriteLabs: https://github.com/DendriteLabs/llama.cpp

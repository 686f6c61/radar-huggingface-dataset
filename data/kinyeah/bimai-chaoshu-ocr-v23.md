# kinyeah/BiMai-Chaoshu-OCR-v23

## Resumen

BiMai-Chaoshu-OCR-v23 es un adaptador LoRA para el modelo multimodal Qwen3-VL-8B-Instruct, desarrollado por el usuario kinyeah, especializado en el reconocimiento óptico de caracteres (OCR) de caligrafía china cursiva (caoshu) en disposición vertical. El modelo resuelve un problema concreto y difícil: la lectura automática de columnas de escritura caligráfica, donde el trazo continuo, la variabilidad estilística y la ausencia de separadores entre caracteres hacen que los modelos de visión generalistas fallen con una tasa de error de carácter (CER) del 35,6 %.

La versión v23 se presenta como el modelo de producción actual del autor y sustituye a la v16. Incorpora 437 columnas sintetizadas con fuentes de caligrafía y 1.500 pares de glifos TTF (imagen de carácter único de 128×128 píxeles emparejada con su texto), lo que eleva el conjunto de entrenamiento a 4.855 filas y reduce el CER al 27,52 % sobre un conjunto de evaluación de 40 columnas y 331 caracteres, con una latencia de aproximadamente 1 segundo por columna.

El modelo no es un modelo completo, sino un adaptador de 410 MB en safetensors (349 MB en GGUF) que debe aplicarse sobre los pesos base de Qwen3-VL-8B-Instruct. Se distribuye bajo licencia Apache-2.0 heredada del modelo base y está pensado para despliegue local mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL-8B-Instruct (vision-language) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-VL-8B-Instruct tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | Adaptador en safetensors (probablemente FP16/BF16) y GGUF F16; el modelo base se usa en Q4_K_M en el ejemplo de despliegue |
| Idiomas soportados | chino (caligrafía cursiva); no se documentan otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, 410 MB), GGUF (caoshu-v23-lora-f16.gguf, 349 MB) y mmproj GGUF (v16-merged-mmproj-F16.gguf) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA con rango r=32 y tasa de aprendizaje 2e-5 durante 2 épocas, sobre el modelo base Qwen3-VL-8B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El entrenamiento se realizó en una única GPU NVIDIA Thor (arquitectura aarch64, 122 GB de memoria unificada), con un total de 2.428 pasos a 3,1 s/paso y una duración aproximada de 2 horas y 5 minutos por ejecución.

El conjunto de entrenamiento consta de 4.855 filas: 2.918 columnas reales, 437 columnas sintetizadas con fuentes de caligrafía (Kouzan Sousho al 96 %, FZ XingKai GBK al 95 % y FZ HuangCao GBK al 89 %) y 1.500 pares de glifos TTF de carácter único a 128×128 píxeles. El autor documenta un punto óptimo en la proporción de datos TTF: alrededor del 31 % del conjunto de entrenamiento; una prueba con el 38 % (v24) degradó el CER al 29,7 %. El techo teórico (oracle ceiling) del conjunto de evaluación se sitúa en un CER del 22,19 %.

## Capacidades

- Reconocimiento de caligrafía china cursiva (caoshu) en columnas verticales, con lectura carácter a carácter.
- Transcripción de imágenes de caracteres aislados mediante los datos de glifos TTF incluidos en el entrenamiento.
- Procesamiento de imagen y texto de forma conjunta (modelo vision-language), con instrucciones en chino para condicionar la lectura ("只根據圖中可見筆畫逐字釋讀").
- Servicio compatible con la API de chat completions de OpenAI a través de llama-server (endpoint /v1/chat/completions).
- Soporte de tool calling y function calling: no documentado en la información disponible (heredable del modelo base, pero no verificado).
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el modelo está orientado exclusivamente al chino.

## Casos de uso

- Digitalización de archivos caligráficos: el modelo permite transcribir columnas verticales de manuscritos en caoshu a texto digital, con un CER del 27,52 % que hace viable la revisión humana posterior en lugar de la transcripción manual desde cero.
- Catalogación de colecciones de museos y bibliotecas: dado que procesa una columna en aproximadamente 1 segundo, puede ejecutarse por lotes sobre fondos de caligrafía para generar metadatos de búsqueda y facilitar la indexación.
- Investigación filológica y paleográfica: la salida carácter a carácter con instrucción explícita de ceñirse a los trazos visibles permite al investigador comparar la lectura automática con su propia interpretación y detectar variantes gráficas.
- Reconocimiento de inscripciones y rótulos verticales: útil para señalética histórica, estelas y soportes con escritura en columna, donde los OCR convencionales fallan por la ausencia de separación entre caracteres.
- Preprocesado en pipelines de documentos: el adaptador puede integrarse en un flujo llama.cpp con salida compatible con la API de OpenAI, de modo que un sistema mayor pueda enviar recortes de columnas y recibir texto para su posterior corrección o traducción.
- Prototipado y demostración local: al ejecutarse con llama.cpp sobre el modelo base cuantizado en Q4_K_M, cabe en un equipo de un solo usuario, lo que permite validar la calidad del OCR sobre muestras propias antes de comprometer un despliegue mayor.
- Generación de datos de entrenamiento: los pares TTF imagen-texto empleados por el autor sugieren que el modelo puede usarse para etiquetar automáticamente glifos y ampliar corpus de caligrafía con supervisión humana.

## Benchmarks y rendimiento

Evaluación sobre gold_test40 (40 columnas, 331 caracteres, decodificación greedy):

| Version | Conjunto de entrenamiento | CER | Precision por caracter | Velocidad |
|---|---|---:|---:|---:|
| Qwen3-VL-8B (zero-shot) | — | 35,6 % | 64,4 % | no disponible |
| v16 (producción anterior) | 2.886 columnas | 27,8 % | 72,2 % | 1,0 s/col |
| v23 (este modelo) | 4.855 columnas | 27,52 % | 72,5 % | 1,0 s/col |

El autor reporta además un techo teórico (oracle ceiling) del 22,19 % de CER para este conjunto de evaluación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA añade 410 MB en safetensors o 349 MB en GGUF sobre el modelo base. Con Qwen3-VL-8B-Instruct en Q4_K_M, el conjunto completo requiere aproximadamente 6-7 GB de memoria, aunque esta cifra no está confirmada en la información disponible.
- GPU recomendadas: el autor entrenó en una NVIDIA Thor (122 GB de memoria unificada), pero para inferencia basta con una GPU de consumo con suficiente VRAM para el modelo base cuantizado.
- GPU de consumo: sí cabe en tarjetas con 8 GB o más de VRAM ejecutando el base en Q4_K_M; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: llama.cpp mediante llama-server, con los flags `--mmproj` (proyector visual) y `--lora` (adaptador), y `--jinja` para plantillas de chat. También existe una versión publicada en Ollama.
- Latencia y throughput: aproximadamente 1,0 s por columna en la configuración del autor; no se documenta throughput agregado ni latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER en gold_test40 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| BiMai-Chaoshu-OCR-v23 | LoRA sobre 8B | no disponible | 27,52 % | Apache-2.0 | Hugging Face, Ollama |
| BiMai-Chaoshu-OCR-v16 | LoRA sobre 8B | no disponible | 27,8 % | Apache-2.0 | Hugging Face, Ollama |
| Qwen3-VL-8B-Instruct (zero-shot) | 8B | no disponible | 35,6 % | Apache-2.0 | Hugging Face |
| Otros OCR de caligrafía china | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre modelos alternativos especializados en OCR de caligrafía cursiva china para una comparación más amplia.

## Limitaciones y advertencias

- El CER del 27,52 % implica que aproximadamente uno de cada cuatro caracteres se transcribe mal; el autor recomienda explícitamente revisar siempre la salida ("Always proofread").
- El modelo está especializado únicamente en caligrafía cursiva china vertical; su comportamiento fuera de ese dominio no está documentado y probablemente sea deficiente.
- El conjunto de evaluación es reducido (40 columnas, 331 caracteres), por lo que las métricas tienen un margen de error considerable y pueden no generalizar a otros estilos, épocas o calígrafos.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar caracteres plausibles no presentes en la imagen; la instrucción de ceñirse a los trazos visibles mitiga pero no elimina este riesgo.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento con fuentes sintéticas puede introducir un sesgo hacia los estilos de esas fuentes (Kouzan Sousho, FZ XingKai, FZ HuangCao).
- La licencia Apache-2.0 se hereda del modelo base Qwen3-VL; conviene verificar las condiciones del modelo base para uso comercial.
- El adaptador depende de una versión concreta del modelo base y del proyector visual compartido con v16; mezclar versiones puede degradar el rendimiento.
- El despliegue requiere llama.cpp con soporte de LoRA y mmproj; otras herramientas (vLLM, TGI) no están documentadas para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinyeah/BiMai-Chaoshu-OCR-v23
- Modelo v16: https://huggingface.co/kinyeah/BiMai-Chaoshu-OCR
- Ollama: https://ollama.com/kinyeah/BiMai-Chaoshu-OCR
- GitHub: https://github.com/kinyeah/BiMai-Chaoshu-OCR
- Demo pública (workbench): http://192.168.0.114:8810
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct

# Gabriel/diffu-minicpm-ocr-htr-dspark

## Resumen

`diffu-minicpm-ocr-htr-dspark` es un cabezal de decodificacion especulativa (draft model) para el lector de escritura manuscrita sueca `Gabriel/diffu-minicpm-ocr-htr`, construido sobre MiniCPM-OCR y difundido a traves del proyecto diffu. No es un modelo autonomo de OCR: es un modelo auxiliar que propone hasta 15 tokens por paso para que el lector los verifique, de modo que la decodificacion sea mas rapida sin alterar el texto final cuando se decodifica de forma voraz (greedy).

El modelo resuelve un problema de latencia en HTR (handwritten text recognition): el lector base es un transformer hibrido con capas de atencion lineal, lo que limita el paralelismo y encarece la decodificacion autoregresiva. El draft, entrenado con el mismo recetario que OpenBMB uso para `MiniCPM-OCR-1.0-DSpark`, aprende a anticipar las respuestas del propio lector y consigue un incremento de velocidad de hasta 1,37x en lineas y 2,09x en regiones cuando la concurrencia es baja.

Con 191.277.349 parametros y un repositorio de 0,4 GB, es un modelo pequeno y ligero pensado para ejecutarse junto al lector dentro de vLLM. Su relevancia actual radica en que demuestra que la decodificacion especulativa especifica de dominio puede acelerar pipelines de digitalizacion de archivos historicos sin sacrificar precision (CER practicamente identico al del lector solo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model de decodificacion especulativa (DSpark) sobre un lector MiniCPM-OCR hibrido con capas de atencion lineal; formato `speculators` |
| Parametros totales | 191.277.349 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8192 tokens en el servidor vLLM de referencia (`--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el lector base esta orientado a escritura manuscrita sueca) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con `config.json` y `config.py` en formato `speculators` |

## Arquitectura y entrenamiento

El draft es un cabezal de decodificacion especulativa que propone hasta 15 tokens por paso (`num_speculative_tokens: 15`) para que el lector los verifique. Se ejecuta dentro de vLLM junto al lector y esta disenado exclusivamente para ese target: un draft aprende las respuestas concretas de su modelo verificador, por lo que no es portable a otros lectores. El lector base es un modelo hibrido con capas de atencion lineal, lo que obliga a vLLM a mantener una copia del estado recurrente por cada token propuesto, incrementando el consumo de memoria por peticion.

El entrenamiento siguio el recetario de OpenBMB para `MiniCPM-OCR-1.0-DSpark`, pero usando las propias respuestas del lector: 250.000 lineas de entrenamiento y 50.000 regiones de GT-Lejonet (febrero de 2026), cada una con muestreo sembrado. Se realizaron 3 epocas online con vLLM sirviendo el lector en una RTX PRO 6000 Blackwell y el entrenador en otra; el checkpoint seleccionado fue el de la epoca 2, el mejor sobre respuestas reservadas. En evaluacion sobre respuestas reservadas alcanza 8,65 tokens aceptados por paso de media, con una tasa de aceptacion del 85,1%.

## Capacidades

- Decodificacion especulativa: propone hasta 15 tokens por paso para verificacion por parte del lector.
- Aceleracion de inferencia HTR sin alterar la salida: con decodificacion voraz, el texto producido es identico al del lector solo (964 de 1.000 lecturas identicas caracter a caracter).
- Reconocimiento de texto manuscrito por linea y por region, heredado del lector base, con el prompt `Text Recognition:`.
- Entrada multimodal imagen-texto (`image-text-to-text`), con soporte de hasta 4 imagenes por prompt en la configuracion de referencia.
- Integracion con vLLM mediante `--speculative-config` y metodos `dspark` con `enable_adaptive_verification: false`.
- Monitorizacion a traves de las metricas `spec_decode_num_*` expuestas en `/metrics`.
- No soporta tool calling, agentes ni modo thinking de forma nativa (el template de chat se configura con `enable_thinking: false`).

## Casos de uso

- Digitalizacion interactiva de archivos historicos: lectura de lineas suecas manuscritas con latencia reducida cuando un operador espera el resultado, gracias al 1,37x de mejora con una sola peticion en vuelo.
- Procesamiento de regiones de texto largas: el draft alcanza 2,09x de aceleracion en regiones con una peticion a la vez, adecuado para paginas completas o parrafos manuscritos.
- Pipelines de transcripcion por lotes con concurrencia moderada: con 64 peticiones simultaneas la mejora es de aproximadamente el 10%, util en trabajos nocturnos de digitalizacion masiva.
- Verificacion de calidad en proyectos de HTR: permite comparar la salida con y sin draft para confirmar que el CER no se degrada (4,99% frente a 4,97% en 1.000 lineas de test).
- Investigacion en decodificacion especulativa sobre arquitecturas hibridas: sirve como caso de estudio de draft models especificos de dominio entrenados con el recetario DSpark.
- Despliegue en infraestructura con GPU Blackwell: el modelo cabe en una RTX PRO 6000 Blackwell junto al lector y requiere unos 20 GB libres de VRAM, lo que facilita entornos de una o dos GPU.

## Benchmarks y rendimiento

Resultados de velocidad medidos el 9 de noviembre de 2026 con una RTX PRO 6000 Blackwell por modelo, vLLM del build indicado, prefix caching desactivado y decodificacion voraz. Datos de test: primeras 1.000 de 5.000 lineas de test y 200 regiones de dev. Referencia: Swedish Lion TrOCR (float32, greedy).

| | A la vez | TrOCR | Lector solo | Lector + draft | Aceleracion |
|---|---|---|---|---|---|
| Lineas | 1 | 4,3 | 13,3 | 18,2 | 1,37x |
| Lineas | 64 (TrOCR: lote 32) | 6,5 | 74,6 | 82,2 | 1,10x |
| Regiones | 1 | – | 1,95 | 4,08 | 2,09x |
| Regiones | 64 | – | 12,4 | 13,2 | 1,07x |

Precision (CER sobre el mismo texto, corpus CER de OpenBMB):

| CER | TrOCR | Lector solo | Lector + draft |
|---|---|---|---|
| 1.000 lineas de test | 4,48% | 4,99% | 4,97% |
| 200 regiones de dev | – | 4,28% | 4,27% |

Longitud de aceptacion en vLLM: 7,5 en lineas y 9,7 en regiones, sobre un maximo de 16.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB libres en la GPU para ejecutar el draft junto al lector.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (configuracion de entrenamiento y evaluacion); cualquier GPU NVIDIA con suficiente memoria para el lector y el draft.
- Cabe en GPU de consumo: no disponible como dato confirmado; el requisito de 20 GB libres apunta a GPUs de gama alta (por ejemplo, RTX 4090 de 24 GB) si el lector cabe en el resto de la memoria.
- Sistema operativo: Linux.
- Despliegue: vLLM nightly del 29 de octubre de 2026 o posterior (vllm-project/vllm#64105) con transformers 5.22.1; instalacion via `uv` con el build indicado (x86_64 o aarch64 para ARM, como DGX Spark).
- Throughput: 18,2 lineas/s y 4,08 regiones/s con una peticion a la vez; 82,2 lineas/s y 13,2 regiones/s con 64 peticiones simultaneas.
- Nota de memoria: al ser el lector un modelo hibrido, vLLM mantiene una copia del estado recurrente por token propuesto, por lo que cada peticion consume mas memoria y caben menos en lote; conviene medir con y sin draft a la concurrencia real de uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffu-minicpm-ocr-htr-dspark | 191.277.349 | 8192 (servidor de referencia) | Draft de decodificacion especulativa para HTR sueco | apache-2.0 | Hugging Face (repo de 0,4 GB) |
| MiniCPM-OCR-1.0-DSpark (OpenBMB) | no disponible | no disponible | Draft de decodificacion especulativa para MiniCPM-OCR | no disponible | Hugging Face |
| Swedish Lion TrOCR (Riksarkivet) | no disponible | no disponible | Lector HTR de lineas suecas | no disponible | Hugging Face |
| diffu-minicpm-ocr-htr (lector base) | no disponible | 8192 (servidor de referencia) | Lector HTR multimodal | apache-2.0 (segun el draft) | Hugging Face |

La comparacion directa de rendimiento solo esta publicada frente a Swedish Lion TrOCR: 18,2 lineas/s frente a 4,3 lineas/s con una peticion a la vez, y CER de 4,97% frente a 4,48% en las 1.000 lineas de test.

## Limitaciones y advertencias

- El draft solo funciona con `Gabriel/diffu-minicpm-ocr-htr`: un draft aprende las respuestas de su target concreto y no es portable a otros lectores.
- No es un modelo autonomo: requiere el lector base y vLLM con soporte del metodo `dspark`.
- Dependencia de un build nightly concreto de vLLM (29 de octubre de 2026 o posterior) y transformers 5.22.1, lo que complica la reproducibilidad en produccion.
- La aceleracion depende fuertemente de la concurrencia: 1,37x y 2,09x con una peticion, pero solo alrededor del 10% con 64 peticiones simultaneas.
- El estado recurrente por token propuesto incrementa la memoria por peticion y reduce el tamano de lote efectivo en arquitecturas hibridas.
- Las diferencias minimas de CER entre lector solo y lector con draft (4,99% frente a 4,97%, y 4,28% frente a 4,27%) se atribuyen a redondeo de GPU, no al draft; no deben interpretarse como mejora de precision.
- Idiomas soportados no documentados; el lector base esta orientado a escritura manuscrita sueca y no hay evidencia de cobertura multilingue.
- No hay datos publicados sobre sesgos, tasas de alucinacion en texto libre ni comportamiento fuera del dominio HTR.
- La licencia apache-2.0 permite uso comercial, pero el modelo depende de componentes (vLLM nightly, MiniCPM-OCR) cuyas condiciones deben verificarse por separado.
- Riesgo de alucinacion: no disponible como metrica; al tratarse de un verificador de tokens, la salida final la determina el lector, no el draft.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gabriel/diffu-minicpm-ocr-htr-dspark
- Lector base: https://huggingface.co/Gabriel/diffu-minicpm-ocr-htr
- Proyecto diffu: https://github.com/Borg93/diffu2
- MiniCPM-OCR-1.0-DSpark (OpenBMB): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Formato speculators: https://github.com/vllm-project/speculators
- Documentacion speculators (throughput vs. interactividad): https://docs.vllm.ai/projects/speculators/en/latest/user_guide/tutorials/throughput_interactivity/
- Swedish Lion TrOCR: https://huggingface.co/Riksarkivet/swedish-lion-trocr-large-handwritten-char
- Issue de vLLM referenciado: vllm-project/vllm#64105
- Build de vLLM usado: https://wheels.vllm.ai/fa3b9d1377219247060d3c8b49eae199c9e7e154/

# Lucasgitguy-co/Xiaomi-OCR-0-CORD-LoRA-GGUF

## Resumen

Xiaomi-OCR-0-CORD-LoRA-GGUF es un adaptador LoRA en formato GGUF para llama.cpp que especializa el modelo multimodal Xiaomi-OCR-0 en la extraccion de datos estructurados de tickets y recibos siguiendo el esquema del dataset CORD v2. Lo publica el usuario Lucasgitguy-co como conversión directa de un adaptador previo entrenado en MLX, y su proposito es forzar al modelo base a devolver JSON con las claves propias de CORD (menu, nm, cnt, price, subtotal_price, tax_price, total_price) en lugar de sus claves nativas.

El adaptador tiene rango 8 y alpha 16, cubre las 186 capas del modelo de lenguaje y pesa aproximadamente 0,011 GB en precision F16. No es un modelo autonomo: requiere el modelo base Xiaomi-OCR-0 en GGUF (probado con la cuantizacion Q4_K_M de prithivMLmods) y su proyector multimodal mmproj correspondiente. El modelo base declara 5.411.328 parametros en safetensors, aunque esa cifra corresponde al adaptador y no al modelo completo.

Su relevancia es acotada y experimental: es el unico adaptador GGUF publicado para llevar Xiaomi-OCR-0 hacia un esquema de extraccion de recibos concreto, y demuestra el flujo MLX → PEFT → GGUF LoRA. El propio autor advierte de que el JSON generado es a menudo malformado y de que el adaptador mezcla claves en chino en respuestas a prompts solo de texto, por lo que debe tratarse como una prueba de concepto y no como una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo multimodal Xiaomi-OCR-0; rango 8, alpha 16, 186 capas del modelo de lenguaje |
| Parametros totales | 5.411.328 (cifra del repositorio en safetensors, corresponde al adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Xiaomi-OCR-0) |
| Tipos de cuantizacion | F16 para el adaptador LoRA; el modelo base se usa en Q4_K_M en las pruebas del autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador y modelo base); datos CORD v2 bajo CC BY 4.0 |
| Formato de pesos | GGUF (LoRA para llama.cpp); el adaptador origen esta en MLX y existe una conversion a PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se entreno originalmente en MLX sobre una base Xiaomi-OCR-0 cuantizada a 4 bits, y despues se convirtio a PEFT mediante el script `mlx_lora_to_peft.py`, que transpone las matrices A y B y fija alpha = escala 2.0 × rango 8 = 16. Finalmente, `convert_lora_to_gguf.py` de llama.cpp (checkout `1b6935b`) lo convirtio a GGUF contra la revision `bbd8cf8` de `xiaomi-research/Xiaomi-OCR-0`. El adaptador cubre 186 capas del modelo de lenguaje con rango 8.

El entrenamiento se realizo sobre el dataset naver-clova-ix/cord-v2, un corpus de imagenes de recibos con anotaciones JSON bajo el esquema CORD, publicado por NAVER CLOVA bajo licencia CC BY 4.0. No se detallan en la informacion disponible el numero de pasos, el volumen de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La innovacion tecnica principal es el propio pipeline de conversion MLX → PEFT → GGUF, que permite aplicar en llama.cpp un adaptador entrenado en el ecosistema MLX de Apple.

## Capacidades

- Extraccion de campos de recibos en JSON con el esquema CORD: menu, nm, cnt, price, subtotal_price, tax_price y total_price.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text) heredado del modelo base Xiaomi-OCR-0.
- Preservacion de los valores impresos como cadenas y omision de campos ausentes, segun el prompt recomendado por el autor.
- Inferencia determinista recomendada con temperatura 0 para la tarea de extraccion.
- Carga verificada tanto sobre el modelo base en F16 como sobre la cuantizacion Q4_K_M de prithivMLmods.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor reporta mezcla de claves en chino en respuestas a prompts solo de texto.

## Casos de uso

- Digitalizacion de tickets de compra en un pipeline de contabilidad: el adaptador transforma la imagen del recibo en un JSON con claves CORD, que puede mapearse directamente a un esquema de base de datos de gastos. Es adecuado porque el adaptador fue entrenado especificamente sobre CORD v2, aunque requiere validacion del JSON por su tasa de malformacion.
- Prototipado rapido de extraccion de recibos en local: al ejecutarse con llama.cpp y un modelo base Q4_K_M, permite probar el flujo completo en un portatil sin GPU dedicada, usando `llama-mtmd-cli` con `--image` y `--lora`.
- Evaluacion comparativa de esquemas de extraccion: sirve para contrastar la salida nativa de Xiaomi-OCR-0 (claves propias) frente a la salida forzada al esquema CORD, util en experimentos de normalizacion de datos.
- Generacion de datasets sinteticos etiquetados: el JSON CORD producido puede usarse como punto de partida para anotacion semiautomatica de imagenes de recibos, con revision humana posterior.
- Investigacion sobre adaptadores multimodales de bajo rango: el repositorio documenta el pipeline MLX → PEFT → GGUF y las comprobaciones de equivalencia (la salida F16 con LoRA coincide con un modelo fusionado manualmente en 3 prompts de texto de 80 tokens), lo que lo convierte en una referencia para reproducir el proceso.
- Integracion en flujos de gestion de gastos corporativos: combinado con un validador de JSON y un mapeo de campos, puede alimentar sistemas de reembolso o conciliacion, siempre con supervision humana dado el riesgo de claves incorrectas o malformadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta comprobaciones cualitativas: con el mmproj en F16 y la imagen `receipt.jpg` del repositorio base, el LoRA cambia la salida a claves CORD (menu, nm, cnt, price), mientras que el modelo base usa sus propias claves; ademas, la combinacion de base F16 y LoRA produce exactamente el mismo texto greedy que un modelo fusionado a mano en 3 prompts de texto de 80 tokens cada uno.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 0,011 GB en F16, por lo que su huella en VRAM es despreciable frente al modelo base.
- El requisito real lo marca Xiaomi-OCR-0: en Q4_K_M (la cuantizacion probada por el autor) y con el mmproj en bf16, el conjunto es ligero, pero no se dispone de cifras exactas de VRAM en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma especifica; el uso con llama.cpp permite ejecucion en CPU y en GPU consumer, aunque no se detallan modelos concretos (RTX 4090, A100, H100) ni si cabe en cada uno.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` con `-m` (modelo base GGUF), `--mmproj` (proyector multimodal) y `--lora` (adaptador). No se documentan vLLM, TGI ni Ollama para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-OCR-0-CORD-LoRA-GGUF (este) | Adaptador de 5.411.328 parametros sobre Xiaomi-OCR-0 | no disponible | Extraccion de recibos con esquema CORD via LoRA | Apache-2.0 | GGUF para llama.cpp; 0 descargas |
| xiaomi-research/Xiaomi-OCR-0 (base) | no disponible en la informacion | no disponible | OCR multimodal general | Apache-2.0 | Modelo base original |
| prithivMLmods/Xiaomi-OCR-0-GGUF | no disponible | no disponible | Conversion GGUF del modelo base sin especializacion | no disponible | GGUF; usado como base de prueba por el autor |
| Lucasgitguy-co/Xiaomi-OCR-0-CORD-MLX-LoRA | Adaptador LoRA | no disponible | Misma especializacion CORD, formato MLX | Apache-2.0 | MLX; origen de este adaptador |

## Limitaciones y advertencias

- El JSON generado es a menudo malformado, segun advierte el propio autor; requiere un validador y un paso de reparacion antes de cualquier uso automatizado.
- El adaptador mezcla claves en chino en respuestas a prompts que son solo de texto, lo que indica un ajuste imperfecto y riesgo de contaminacion del esquema.
- No es un modelo autonomo: depende de Xiaomi-OCR-0 en GGUF y de su mmproj; no existe una version GGUF oficial del modelo base, solo la conversion de terceros de prithivMLmods.
- Las pruebas se limitaron a 3 prompts de texto de 80 tokens y a dos prompts de recibos, un conjunto de evaluacion muy reducido que no permite extrapolar robustez.
- Riesgo de alucinacion en campos numericos (precios, impuestos, subtotales) inherente a la extraccion OCR; no se documentan metricas de exactitud.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; el comportamiento multilingue no esta caracterizado.
- Restricciones de licencia: el adaptador y el modelo base son Apache-2.0, lo que permite uso comercial, pero los datos de entrenamiento CORD v2 son CC BY 4.0 (NAVER CLOVA) y exigen atribucion; los datos no se incluyen en el repositorio.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-16), por lo que no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-CORD-LoRA-GGUF
- Adaptador origen en MLX: https://huggingface.co/Lucasgitguy-co/Xiaomi-OCR-0-CORD-MLX-LoRA
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Conversion GGUF del modelo base usada en las pruebas: https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2

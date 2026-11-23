# loom-fun-staging/xinntao-Real-ESRGAN-x4plus-loom

## Resumen

Real-ESRGAN x4plus es la red generadora RRDBNet del proyecto Real-ESRGAN de Xintao Wang, publicada originalmente en 2021 y descrita en el paper arXiv:2107.10833. Se trata de un modelo de superresolución de imagen que escala una entrada cuatro veces en cada eje (por ejemplo, 256×256 → 1024×1024) mediante 23 bloques densos residuales-en-residuales. No es un modelo generativo de texto ni un transformer: es una CNN de superresolución entrenada con degradaciones sintéticas de alta orden para generalizar mejor ante imágenes reales degradadas.

La ficha que nos ocupa no es el checkpoint original, sino un paquete de despliegue publicado por el usuario `loom-fun-staging` bajo el identificador `xinntao-Real-ESRGAN-x4plus-loom`. El paquete contiene programas `.loom` y un `model.json` para `loom-serve`, el runtime del ecosistema Loom orientado a GPUs AMD (ROCm/hrx-system). Los pesos no se alojan aquí: se leen del checkpoint F32 original de `Comfy-Org/Real-ESRGAN` en una revisión fijada. El objetivo del paquete es ofrecer una ruta de inferencia optimizada para el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), con convoluciones ejecutadas como WMMA en BF16 con acumulación y activaciones en F32.

Su relevancia es acotada pero concreta: demuestra que Real-ESRGAN puede servirse sobre hardware AMD integrado con latencias bajas (0,204 s por imagen 256×256 → 1024×1024 frente a 4,038 s de stable-diffusion.cpp en Vulkan) manteniendo una fidelidad numérica alta respecto a la referencia PyTorch fp32 (PSNR 54,79, 0,51 % de píxeles con desviación mayor de 1). Es, por tanto, una pieza de infraestructura más que un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (CNN con 23 bloques residual-in-residual dense); generador de Real-ESRGAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | pesos F32; convoluciones en BF16 con acumulacion F32 y activaciones F32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | paquete Loom (`.loom` + `model.json`); pesos originales F32 leidos de Comfy-Org/Real-ESRGAN; no se distribuyen GGUF ni safetensors en este repo |

## Arquitectura y entrenamiento

El modelo es un RRDBNet con 23 bloques residual-in-residual dense, la arquitectura introducida en ESRGAN y reutilizada en Real-ESRGAN. El factor de escala es 4× en cada dirección. No hay muestreo estocástico: la salida es determinista y el parámetro `seed` de la API se acepta pero se ignora. El paquete Loom ejecuta las convoluciones como WMMA en BF16 con acumulación F32 y activaciones F32, lo que explica la cercanía numérica a la referencia fp32 (PSNR 54,79 frente a PyTorch fp32) a costa de una pequeña desviación (12 niveles máximos de diferencia absoluta en escala 0–255, 0,51 % de píxeles con desviación superior a 1).

En cuanto al entrenamiento, esta ficha no aporta detalles propios: el paquete es un port de inferencia sobre el checkpoint original de `xinntao/Real-ESRGAN`, cuyo entrenamiento se describe en el paper arXiv:2107.10833 (degradaciones sintéticas de segundo orden, pérdida perceptual y adversarial). No se documentan en la información disponible el número de tokens ni la composición exacta del dataset, ni si hubo RLHF/DPO (no aplica a un modelo de imagen). La innovación técnica destacable aquí es de despliegue: la implementación en Loom sobre gfx1151 y la cualificación del SDK 0.3.0, con tres peticiones idénticas devolviendo píxeles RGB idénticos a 256×64.

## Capacidades

- Superresolución de imagen con factor 4× por eje (por ejemplo, 256×256 → 1024×1024; 512×512 → 2048×2048).
- Entrada RGB de 8 bits en bruto, codificada en base64 (estándar `+/` o URL-safe `-_`) dentro del campo `prompt` de la ruta `/v1/images/generations`.
- Salida en PNG RGBA con todos los valores alfa a 255; se recomienda `.convert("RGB")` si se necesitan tres canales.
- Restricciones de tamaño de entrada: anchura múltiplo de 64 y como máximo 1024; altura múltiplo de 4 y como máximo 1024. Otras tallas deben recortarse o rellenarse.
- Inferencia determinista: la misma entrada produce siempre la misma salida.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües; no procesa texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de la imagen a imagen.

## Casos de uso

- Restauración de fotografía antigua o de baja resolución: el modelo escala 4× imágenes de hasta 1024×1024 de entrada, útil para digitalizar archivos y material escaneado con pérdida de detalle.
- Mejora de miniaturas y assets web: dado que la salida es determinista y la latencia en Strix Halo es de 0,204 s por imagen 256×256 → 1024×1024, encaja en pipelines de generación de thumbnails en lote.
- Preprocesado para pipelines de visión por computador: aumentar la resolución de recortes antes de pasarlos a detectores o clasificadores que rinden mejor con más píxeles.
- Despliegue en hardware AMD integrado: el paquete está pensado para `loom-serve` sobre gfx1151 (Ryzen AI Max+ 395), lo que permite servir superresolución en equipos sin GPU discreta.
- Sustitución de cadenas PyTorch en producción: frente a thenoise en proceso (0,334 s/imagen) o stable-diffusion.cpp en Vulkan (4,038 s/imagen), Loom ofrece 0,204 s/imagen con PSNR de 54,79 respecto a fp32, reduciendo dependencias y tiempo por imagen.
- Procesado por lotes de imágenes satelitales o médicas de baja resolución: la naturaleza determinista y la fidelidad numérica permiten repetibilidad en entornos donde la variabilidad de la salida es indeseable.
- Integración vía API HTTP local: la ruta `/v1/images/generations` con `size` como tamaño de salida facilita envolver el modelo en servicios internos sin SDK propietario.

## Benchmarks y rendimiento

Datos de rendimiento publicados en la model card, medidos en AMD Strix Halo (gfx1151). Segundos por imagen de extremo a extremo para 256×256 → 1024×1024:

| Backend | Pesos | s/imagen | Aceleración Loom | PSNR vs PyTorch fp32 | Dif. abs. máx. (0–255) | Píxeles con desviación > 1 |
|---|---|---|---|---|---|---|
| Loom (este paquete), vía HTTP | F32, convoluciones BF16 | 0,204 | — | 54,79 | 12 | 0,51 % |
| stable-diffusion.cpp, Vulkan | F32 | 4,038 | 19,8× | 50,55 | 40 | 4,08 % |
| stable-diffusion.cpp, ROCm | F32 | 5,405 | 26,5× | 50,13 | 41 | 4,46 % |
| thenoise (PyTorch), ROCm, vía Lemonade | F32 | 22,935 | 112,4× | 51,46 | 1 | 0,00 % |
| thenoise (PyTorch), en proceso | F32 | 0,334 | 1,64× | 93,31 | 1 | 0,00 % |
| upscayl-ncnn (Vulkan), un proceso por imagen | ncnn | 2,487 | 12,2× | 42,01 | 218 | 14,75 % |
| upscayl-ncnn (Vulkan), un proceso para 24 imágenes | ncnn | 0,636 | 3,1× | 42,01 | 218 | 14,75 % |
| PyTorch ROCm, en proceso | fp16 | 0,149 | 0,73× | 56,32 | 10 | 0,12 % |
| PyTorch ROCm, en proceso | fp32 | 0,305 | 1,50× | referencia | 0 | 0 % |

Cualificación del SDK (64×16 → 256×64, tres peticiones idénticas, salida RGB idéntica):

| SDK | Primera petición | Mediana de dos peticiones en caliente |
|---|---:|---:|
| 0.2.0 | 0,193 s | 0,012 s |
| 0.3.0 | 0,137 s | 0,010 s |

No se han publicado resultados de benchmarks de calidad de imagen tipo MMLU, HumanEval o GSM8K en la información disponible, por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint es F32 y el paquete se probó en un APU con memoria unificada (Ryzen AI Max+ 395), no en GPU discreta.
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) es la plataforma validada. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, al menos en el APU Strix Halo; no hay datos para GPUs de consumo discretas.
- Opciones de despliegue: `loom-serve` del ecosistema Loom (hrx-loom, SDK 0.2.0 y 0.3.0 cualificados). Alternativas comparadas en la propia model card: stable-diffusion.cpp (Vulkan y ROCm), thenoise (PyTorch ROCm), upscayl-ncnn y PyTorch ROCm.
- Latencia y throughput: 0,204 s/imagen para 256×256 → 1024×1024 en Loom; 0,012 s (mediana en caliente) para 64×16 → 256×64 con SDK 0.2.0 y 0,010 s con SDK 0.3.0. Throughput agregado no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Real-ESRGAN x4plus (este paquete Loom) | RRDBNet, 23 bloques RRDB | 4× | BSD-3-Clause | Paquete Loom en HF, pesos en Comfy-Org/Real-ESRGAN | Optimizado para gfx1151; 0,204 s/imagen 256→1024 |
| Real-ESRGAN x4plus (PyTorch ROCm, en proceso) | RRDBNet | 4× | BSD-3-Clause | Repo original xinntao/Real-ESRGAN | 0,305 s/imagen fp32; referencia de fidelidad |
| stable-diffusion.cpp | Implementación C/C++ | 4× | según build | GitHub leejet/stable-diffusion.cpp | 4,038 s (Vulkan) y 5,405 s (ROCm) por imagen |
| upscayl-ncnn | ncnn | 4× | según build | GitHub upscayl/upscayl-ncnn | 2,487 s/imagen con un proceso por imagen; PSNR 42,01 |
| thenoise (PyTorch) | PyTorch | 4× | según build | lemonade-sdk/thenoise | 0,334 s/imagen en proceso; PSNR 93,31 |

No se dispone de datos de otros modelos de superresolución (por ejemplo, SwinIR o HAT) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y los campos `prompt` se reinterpretan como píxeles en base64.
- Restricciones de tamaño de entrada estrictas: anchura múltiplo de 64 y ≤ 1024; altura múltiplo de 4 y ≤ 1024. Fuera de estos límites hay que recortar o rellenar.
- La salida es RGBA con alfa a 255; si se necesita RGB hay que convertir explícitamente.
- El paquete depende del ecosistema Loom (`hrx-loom`, `loom-serve`) y está validado únicamente en gfx1151; no hay garantías en otras GPUs AMD o NVIDIA.
- Los pesos no se alojan en este repositorio: se leen de `Comfy-Org/Real-ESRGAN` en una revisión fijada, lo que introduce una dependencia externa para el despliegue.
- La licencia BSD-3-Clause permite uso comercial, pero conviene revisar la licencia del checkpoint original y de las dependencias del runtime Loom.
- No se documentan sesgos ni riesgos de alucinación en el sentido habitual; al ser determinista, el riesgo principal es la amplificación de artefactos presentes en la entrada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación (2026-11-23) es posterior a la de esta ficha; trátese como un artefacto de staging.
- Los resultados de búsqueda web devueltos corresponden a Loom (la herramienta de grabación de pantalla) y a Loom (marca de ropa), no al ecosistema Loom de ROCm; no deben confundirse.

## Enlaces

- Hugging Face: https://huggingface.co/loom-fun-staging/xinntao-Real-ESRGAN-x4plus-loom
- Modelo base: https://huggingface.co/xinntao/Real-ESRGAN
- Pesos utilizados: https://huggingface.co/Comfy-Org/Real-ESRGAN
- Paper: https://arxiv.org/abs/2107.10833
- Repositorio original: https://github.com/xinntao/Real-ESRGAN
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- PR de la card en hrx-loom-library: https://github.com/ROCm/hrx-loom-library/pull/126
- Evidencia DevLab: https://github.com/loom-fun/loom-skills/actions/runs/45253984158/job/137970780518
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- thenoise: https://github.com/lemonade-sdk/thenoise
- upscayl-ncnn: https://github.com/upscayl/upscayl-ncnn

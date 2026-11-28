# jaygensi/dreamshaper-xl-vae-encoder-npu

## Resumen

DreamShaper XL VAE encoder NPU es un artefacto de inferencia derivado del codificador del VAE de DreamShaper XL v2 Turbo (un `AutoencoderKL` de SDXL), convertido a binarios de contexto QNN para ejecutarse en la NPU Hexagon de los chips Snapdragon recientes. No es un modelo generativo completo: es únicamente la mitad del VAE que transforma una imagen de entrada en su representación latente, y está pensado para que la aplicación Android LATAS pueda iniciar una generación image-to-image desde una foto directamente en la NPU del dispositivo.

El autor, jaygensi, ha compilado ocho binarios independientes, uno por combinación de tamaño de imagen (768 x 768 o 1024 x 1024) y generación de chip (Snapdragon 8 Gen 2 SM8550, 8 Gen 3 SM8650, 8 Elite SM8750 y 8 Elite Gen 5 SM8850). Cada binario ocupa entre 55 y 80 MB y está cuantizado a pesos de 8 bits y activaciones de 16 bits (w8a16) mediante las herramientas QAIRT 2.51 de Qualcomm.

Su relevancia es acotada pero técnica: demuestra un flujo completo de exportación de un VAE SDXL a ONNX, cuantización y compilación a binarios HTP para Hexagon v73, v75, v79 y v81. El propio autor advierte que ninguno de los binarios se ha ejecutado todavía en un teléfono real y que la calidad solo se ha medido parcialmente en el simulador HTP de Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE de SDXL (`AutoencoderKL`), solo el codificador, exportado a ONNX y compilado como grafo QNN HTP |
| Parametros totales | no disponible (el codificador del VAE de SDXL ronda decenas de millones; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | w8a16: pesos 8 bits por fila, activaciones 16 bits, calibracion min-max |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CreativeML Open RAIL++-M (con restricciones de uso de la Attachment A) |
| Formato de pesos | binarios de contexto QNN (`.bin`) para Hexagon v73/v75/v79/v81; no hay safetensors ni GGUF en el repo |
| Tamano del repo | 0,5 GB |
| Entrada | `image` `[1, S, S, 3]` NHWC RGB en [0, 1] mapeado a [-1, 1], uint16 punto fijo (escala 1/65535), S = 768 o 1024 |
| Salida | `latent` `[1, S/8, S/8, 4]` NHWC, media de la distribucion latente multiplicada por 0,13025, uint16 punto fijo |
| Tamanos de imagen | un grafo por tamano: 768 x 768 o 1024 x 1024 |
| Chips soportados | SM8550 (Hexagon v73, soc id 43), SM8650 (v75, 57), SM8750 (v79, 69), SM8850 (v81, 87) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es una conversión del codificador del VAE de DreamShaper XL v2 Turbo, que a su vez hereda el VAE de Stable Diffusion XL. La arquitectura subyacente es el codificador convolucional de un `AutoencoderKL` de SDXL, con su escala latente propia (factor 0,13025) y latentes de mayor dimensionalidad que los de SD 1.x, motivo por el que el autor señala explícitamente que el codificador de SD 1.x no sirve como sustituto.

El proceso de conversión consta de tres etapas documentadas en la model card: exportación de los pesos de diffusers a ONNX en fp32 con un wrapper NHWC que mapea la imagen a [-1, 1] y multiplica la media latente por el factor de escala; cuantización con QAIRT 2.51 (pesos de 8 bits por fila, activaciones de 16 bits, calibración min-max sobre 37 imágenes a 768 px y 13 a 1024 px generadas por las propias builds NPU XL, recortadas al centro y reescaladas); y compilación a binarios de contexto HTP para las cuatro generaciones de Hexagon. No hay RLHF, DPO ni ajuste fino alguno. Los scripts de exportación están en el repositorio LATAS (`tools/npu_finetune/export_vae_encoder.py`, `convert_quantize_compile.sh`, `compile_chip.sh`, guía en `docs/npu-sdxl.md`).

## Capacidades

- Codificación image-to-image: convierte una foto RGB de 768 x 768 o 1024 x 1024 en su latente de 96 x 96 x 4 o 128 x 128 x 4, listo para alimentar el UNet de SDXL.
- Salida determinista: devuelve la media de la distribución latente, no una muestra, lo que elimina la variabilidad estocástica del muestreo del VAE.
- Ejecución en NPU: los binarios están compilados para el acelerador Hexagon de Snapdragon, no para CPU ni GPU.
- Integración con LATAS: pensado para que la app Android descargue el binario correspondiente a su chip y tamaño de imagen la primera vez que se envía una foto con un modelo NPU XL, y lo cargue en la NPU solo para esa imagen.
- Cobertura de cuatro generaciones de SoC y dos resoluciones, con un fichero por combinación (ocho en total).
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes ni capacidades multilingües: es un componente de visión especializado.

## Casos de uso

- Image-to-image en Android sobre NPU: la app LATAS usa este codificador para transformar una foto del usuario en latentes y arrancar la difusión desde ahí, aprovechando el Hexagon en lugar de la CPU y reduciendo el consumo energético frente a la inferencia en CPU.
- Reducción de latencia en el arranque de una generación: al ejecutar el codificador en la NPU, la fase previa al muestreo del UNet se descarga del procesador principal, lo que en un móvil se traduce en menos calor y mejor respuesta percibida.
- Flujos de edición fotográfica en dispositivo: aplicaciones de retoque que parten de una imagen real y aplican estilización o variaciones controladas sin enviar la foto a un servidor, con la ventaja de privacidad que eso conlleva.
- Prototipado de pipelines SDXL en hardware Qualcomm: sirve como pieza de referencia para desarrolladores que quieran compilar sus propios VAEs a binarios QNN siguiendo los scripts publicados en LATAS.
- Pruebas de cuantización w8a16 en NPU: útil para investigar el impacto de la calibración min-max y de los pesos de 8 bits en la fidelidad del latente dentro de un pipeline de difusión.
- Distribución selectiva por chip: el esquema de un fichero por SoC y resolución permite a una app descargar solo el binario necesario (55-80 MB) en lugar de empaquetar todos, algo relevante para el tamaño de las aplicaciones móviles.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Similitud coseno | 0,9991 y 0,9991 | Binario 768 px SM8550 (Hexagon v73) frente al codificador fp32, simulador HTP x86, 2 imagenes reservadas |
| Error relativo | 4,0 % y 4,2 % | Mismas condiciones |
| Error absoluto maximo | 1,0 y 1,3 | Mismas condiciones |
| Binarios 1024 px | no evaluados | No ejecutados en el simulador (aprox. una hora por imagen) |
| Binarios v75, v79, v81 | no evaluados | Compilados desde los mismos modelos cuantizados, sin ejecucion |

El autor compara el error relativo (en torno al 4 %) con el del codificador de SD 1.x (aproximadamente el 1 %) y lo considera pequeño frente al ruido que el image-to-image introduce antes del muestreo, pero advierte que la valoración se hizo con esas dos cifras y no inspeccionando las imágenes resultantes.

## Requisitos de hardware

- NPU Hexagon de Snapdragon 8 Gen 2 (SM8550, v73), 8 Gen 3 (SM8650, v75), 8 Elite (SM8750, v79) u 8 Elite Gen 5 (SM8850, v81); un binario solo carga en la generación de NPU para la que fue compilado.
- Runtime QNN de Qualcomm necesario para ejecutar los ficheros; tiene licencia propia y no se incluye en el repositorio.
- Tamano por binario: 55,6 MB (768 px SM8550), 55,6 MB (768 px SM8650), 57,2 MB (768 px SM8750), 56,7 MB (768 px SM8850), 78,3 MB (1024 px SM8550), 76,9 MB (1024 px SM8650), 78,6 MB (1024 px SM8750) y 80,1 MB (1024 px SM8850).
- No es desplegable en GPU de escritorio, vLLM, llama.cpp, Ollama ni TGI: son binarios de contexto HTP, no pesos en safetensors ni GGUF.
- No cabe ni tiene sentido en una GPU consumer tipo RTX 4090; el hardware objetivo es el SoC móvil.
- Latencia y throughput: no disponibles; el autor no ha ejecutado los binarios en un teléfono y en el simulador HTP cada imagen tarda aproximadamente una hora.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaygensi/dreamshaper-xl-vae-encoder-npu | Codificador VAE SDXL en binarios QNN | 55-80 MB por binario | 768 o 1024 px | CreativeML Open RAIL++-M | Hugging Face, 0 descargas |
| Lykon/dreamshaper-xl-v2-turbo | Modelo SDXL completo (UNet + VAE) | no disponible en la informacion | 1024 px (SDXL) | CreativeML Open RAIL++-M | Hugging Face, modelo base de este artefacto |
| Codificador VAE de SD 1.x en NPU | Codificador VAE SD 1.x para QNN | no disponible | no disponible | no disponible | Mencionado por el autor como incompatible (otro VAE, otra escala latente, latentes menores) |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la informacion proporcionada, salvo la comparacion cualitativa del error relativo (4 % frente a aproximadamente el 1 % del codificador de SD 1.x).

## Limitaciones y advertencias

- Ninguno de los ocho binarios se ha ejecutado en un telefono real; la validacion se limita al simulador HTP x86 y solo para el binario de 768 px en SM8550.
- Los binarios de 1024 px no se han ejecutado en el simulador y los de v75, v79 y v81 no se han ejecutado en absoluto.
- Error relativo de aproximadamente el 4 %, superior al del codificador de SD 1.x (aproximadamente el 1 %); la calidad no se ha evaluado visualmente sobre imagenes generadas.
- La calibracion se hizo con ilustraciones del propio modelo, no con fotografias, lo que puede afectar al rendimiento en el caso de uso principal (image-to-image desde fotos).
- Un binario solo funciona en la generacion de NPU para la que fue compilado y con un unico tamano de imagen; no hay flexibilidad de resolucion.
- Requiere el runtime QNN de Qualcomm, con licencia independiente no incluida.
- Licencia CreativeML Open RAIL++-M con restricciones de uso de la Attachment A; el uso comercial esta permitido dentro de esos terminos y cualquier redistribucion debe imponer las mismas restricciones.
- El codigo de la app y los scripts (LATAS) estan bajo AGPL v3 con terminos de atribucion adicionales, distinta de la licencia de los binarios.
- Al ser la media de la distribucion latente y no una muestra, el codificador es determinista; no reproduce el muestreo estocastico del VAE original.
- Riesgo de sesgos y alucinacion: no aplica en el sentido habitual de un modelo de lenguaje, pero el VAE hereda los sesgos visuales de DreamShaper XL v2 Turbo y de SDXL en la representacion de personas y escenas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaygensi/dreamshaper-xl-vae-encoder-npu
- Modelo base: https://huggingface.co/Lykon/dreamshaper-xl-v2-turbo
- Repositorio LATAS (app Android, motor y scripts de conversion): https://github.com/joglezn/LATAS
- Guia de conversion NPU SDXL: `docs/npu-sdxl.md` dentro del repositorio LATAS
- Script de exportacion: `tools/npu_finetune/export_vae_encoder.py` dentro del repositorio LATAS
- Stable Diffusion XL (Stability AI): no se proporciona enlace en la informacion disponible
- Qualcomm QAIRT SDK / QNN runtime: no se proporciona enlace en la informacion disponible

# jaygensi/sd-vae-encoder-npu

## Resumen

`jaygensi/sd-vae-encoder-npu` es la mitad encoder del VAE de Stable Diffusion 1.x (`AutoencoderKL`), convertida a binario de contexto QNN para ejecutarse en la NPU Hexagon de los Snapdragon recientes. No es un modelo generativo completo: es un componente de un pipeline de difusion, empaquetado para la app Android LATAS, que lo descarga la primera vez que el usuario envia una foto con un modelo NPU y lo carga en la NPU solo para esa imagen. Su funcion es habilitar image-to-image (partir de una foto) en los modelos SD 1.5, SD 2.1 y DreamShaper 8 dentro de la app.

El autor es `jaygensi`, vinculado al repositorio LATAS. El repositorio pesa 0,2 GB y contiene cuatro binarios, uno por generacion de chip: SM8550 (Hexagon v73), SM8650 (v75), SM8750 (v79) y SM8850 (v81). Un unico encoder sirve para los tres modelos porque el VAE encoder de SD 2.1 es identico byte a byte al de SD 1.5, y el de DreamShaper 8 difiere un 0,13 % en el latente (66 dB PSNR tras decodificar).

La relevancia es de nicho pero concreta: demuestra el flujo de exportacion, cuantizacion y compilacion de un componente de difusion a la NPU Hexagon mediante las herramientas QAIRT 2.51 de Qualcomm, con cuantizacion w8a16. El propio autor advierte que ninguno de los binarios se ha ejecutado aun en un telefono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE encoder de Stable Diffusion 1.x (`AutoencoderKL`), exportado a ONNX con wrapper NHWC y compilado a binario de contexto QNN (HTP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de imagen 512 × 512 |
| Tipos de cuantizacion | w8a16: pesos 8 bits (por fila), activaciones 16 bits, calibracion min-max |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | binario de contexto QNN (`.bin`) por chip: `vae-encoder-sm8550.bin`, `-sm8650.bin`, `-sm8750.bin`, `-sm8850.bin` |

Interfaz de entrada y salida:

| | Forma | Tipo |
|---|---|---|
| Entrada `image` | `[1, 512, 512, 3]` NHWC RGB en [0, 1] (el grafo la mapea a [-1, 1]) | uint16 de coma fija (escala 1/65535) |
| Salida `latent` | `[1, 64, 64, 4]` NHWC: media de la distribucion latente, ya multiplicada por 0,18215 | uint16 de coma fija |

## Arquitectura y entrenamiento

El modelo original es el encoder del VAE de Stable Diffusion 1.5, una red convolucional que comprime una imagen RGB de 512 × 512 a un latente de 64 × 64 × 4 canales. El autor no ha reentrenado nada: ha exportado los pesos de diffusers a ONNX con un wrapper NHWC (imagen mapeada a [-1, 1] y media latente multiplicada por el factor de escala 0,18215), los ha cuantizado con QAIRT 2.51 y los ha compilado a binarios HTP para Hexagon v73, v75, v79 y v81. La calibracion min-max se hizo sobre 32 muestras (16 imagenes, tal cual y espejadas: 14 generadas con DreamShaper 8 y 2 de demostracion de Qualcomm).

La innovacion tecnica es el propio pipeline de despliegue: un binario de contexto solo carga en la generacion de NPU para la que fue compilado, de ahi un fichero por chip. El encoder devuelve la media de la distribucion latente (determinista), no una muestra. El decoder correspondiente no esta aqui: forma parte del zip de cada modelo (`vae.bin`). Los scripts de conversion estan en el repositorio LATAS (`tools/npu_finetune/export_vae_encoder.py` y `convert_quantize_compile.sh`, guia en `docs/npu-finetune.md`).

## Capacidades

- Codificacion imagen a latente para image-to-image en SD 1.5, SD 2.1 y DreamShaper 8 sobre NPU Hexagon.
- Entrada exclusivamente 512 × 512 RGB; no admite otras resoluciones.
- Salida determinista (media latente), sin muestreo estocastico.
- Compatible con un unico encoder para los tres modelos citados (SD 2.1 identico; DreamShaper 8 con 0,13 % de diferencia).
- No realiza generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.
- No incluye decoder: la reconstruccion de imagen depende del `vae.bin` de cada modelo.

## Casos de uso

- Image-to-image en movil con NPU: la app LATAS envia una foto al encoder en la NPU para obtener el latente inicial y arrancar la difusion con SD 1.5, SD 2.1 o DreamShaper 8 sin pasar por CPU/GPU.
- Descarga bajo demanda en Android: al ser un fichero separado, la app solo lo descarga la primera vez que se envia una foto con un modelo NPU, de modo que no consume espacio ni tiempo de carga si el usuario solo usa text-to-image.
- Prototipado de pipelines de difusion en Snapdragon: sirve como referencia de como exportar, cuantizar y compilar un componente de SD a binario QNN con QAIRT 2.51.
- Investigacion sobre cuantizacion w8a16 en NPU: permite medir el error introducido por la cuantizacion (0,8-1,1 % de error relativo, similitud coseno 1,0000 en el simulador) frente al encoder fp32.
- Integracion en apps de edicion fotografica con IA en dispositivo: partiendo de una foto del usuario, generar variaciones o estilizaciones manteniendo la estructura mediante el latente codificado.
- Evaluacion de compatibilidad por generacion de chip: los cuatro binarios permiten probar el mismo encoder en dispositivos SM8550, SM8650, SM8750 y SM8850 dentro de un mismo banco de pruebas.

## Benchmarks y rendimiento

Calidad medida en el simulador HTP de Qualcomm sobre x86 (no en telefono), con el binario Hexagon v73 frente al encoder fp32, sobre 3 de las 32 muestras de calibracion:

| Metrica | Valor |
|---|---|
| Similitud coseno | 1,0000 |
| Error relativo | 0,9 %, 1,1 % y 0,8 % |
| Error absoluto maximo | 0,2-0,35 (desviacion tipica del latente ~5) |

Advertencias del autor: las muestras 0, 9 y 20 eran imagenes de calibracion, por lo que la comprobacion es optimista y no de validacion retenida. Los binarios v75, v79 y v81 se compilaron desde el mismo modelo cuantizado pero no se ejecutaron en el simulador. No hay benchmarks de latencia ni throughput publicados.

## Requisitos de hardware

- NPU Hexagon de Qualcomm exclusivamente: Snapdragon 8 Gen 2 (SM8550, v73), 8 Gen 3 (SM8650, v75), 8 Elite (SM8750, v79) y 8 Elite Gen 5 (SM8850, v81).
- Cada binario solo carga en la generacion de NPU para la que fue compilado; no hay binario generico.
- Requiere el runtime QNN de Qualcomm (no incluido en el repositorio, con licencia propia).
- No ejecutable en GPU de escritorio (A100, H100, RTX 4090) ni en CPU convencional: es un binario de contexto HTP, no un modelo en safetensors o GGUF.
- No desplegable con vLLM, llama.cpp, Ollama ni TGI.
- VRAM estimada: no aplica; el consumo es de memoria de NPU y no se publica.
- Latencia y throughput: no disponibles; ningun binario se ha ejecutado aun en un telefono.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Hardware | Licencia | Estado |
|---|---|---|---|---|---|
| `jaygensi/sd-vae-encoder-npu` | Encoder VAE SD 1.x cuantizado w8a16 | Binario de contexto QNN | NPU Hexagon SM8550/SM8650/SM8750/SM8850 | CreativeML Open RAIL-M | Sin probar en telefono |
| VAE encoder SD 1.5 original (diffusers) | Encoder VAE fp32 | safetensors | CPU/GPU generica | CreativeML Open RAIL-M | Referencia de calidad |
| VAE encoder SD 1.5 en ONNX | Encoder VAE exportado | ONNX | CPU/GPU con runtime ONNX | CreativeML Open RAIL-M | Alternativa portable |

No se dispone de informacion sobre otros encoders VAE compilados para NPU Hexagon con los que comparar directamente.

## Limitaciones y advertencias

- Ninguno de los cuatro binarios se ha ejecutado en un telefono; la validacion es solo en simulador x86 y con el binario v73.
- La comprobacion de calidad usa muestras de calibracion, no un conjunto retenido: el error real puede ser mayor.
- Solo acepta imagenes de 512 × 512; no hay soporte para otras resoluciones ni para lotes mayores de 1.
- Devuelve la media latente, no una muestra: no reproduce el muestreo estocastico del VAE original.
- Dependencia obligatoria del runtime QNN de Qualcomm, con licencia independiente y no incluido.
- Un binario por generacion de chip: no hay compatibilidad hacia adelante ni hacia atras entre versiones de Hexagon.
- Licencia CreativeML Open RAIL-M: el uso comercial esta permitido pero sujeto a las restricciones de uso del parrafo 5 y el anexo A; quien redistribuya los ficheros debe quedar sujeto a las mismas restricciones. Son derivados del modelo y requieren atribucion a Robin Rombach, Patrick Esser y colaboradores (CompVis, Stability AI, Runway).
- Sin datos de sesgo, alucinacion o rendimiento multilingue porque el componente no procesa texto ni genera contenido por si mismo.

## Enlaces

- Hugging Face: https://huggingface.co/jaygensi/sd-vae-encoder-npu
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Repositorio LATAS (scripts `tools/npu_finetune/export_vae_encoder.py`, `convert_quantize_compile.sh`, guia `docs/npu-finetune.md`): no disponible la URL exacta en la informacion proporcionada
- SDK QAIRT de Qualcomm: no disponible la URL exacta en la informacion proporcionada
- Paper o blog del autor: no disponible

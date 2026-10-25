# smile-forge/moss-image-onnx

## Resumen

`smile-forge/moss-image-onnx` es una exportación a ONNX Runtime del modelo de texto a imagen MOSS-Image, publicado por el proyecto Smile Forge como base para Nexaflow, un host de IA escrito en C#. El repositorio no entrena nada nuevo: convierte los pesos de `OpenMOSS-Team/MOSS-Image-SFT` (revisión `f972bd4b`) en dos grafos ONNX —el denoiser, un transformer de difusión de 5.000 millones de parámetros, y el decoder VAE, heredado del VAE pequeño de FLUX.2— y añade ocho LoRAs convertidas a adaptadores nativos de ONNX Runtime. Su interés práctico es que elimina la dependencia de PyTorch y de Python en el camino de inferencia: cualquier aplicación que use ONNX Runtime 1.31 o superior con el execution provider de CUDA puede generar imágenes de 1024×1024 en unos 22,9 segundos en una RTX PRO 6000.

La particularidad arquitectónica es que el codificador de texto no forma parte del repositorio. MOSS-Image lee el prompt con el último estado oculto de Qwen3.5-9B sin modificar, de modo que el usuario debe aportar su propia compilación de llama.cpp de ese modelo (la model card referencia `Qwen3.5-9B-Q8_0.gguf` de unsloth). El repositorio ocupa 6,9 GB y se distribuye con licencia Apache-2.0, mientras que todos los LoRAs incluidos (anime, gouache, psicodélico, beauty, animación, impresionismo, NSFW y una destilación de 8 pasos) son también Apache-2.0 según la model card.

El modelo es relevante para quien necesite integrar generación de imágenes en un stack .NET o en un servicio que ya use ONNX Runtime, sin montar un entorno de difusión en Python. El precio es una fidelidad no exacta: frente al pipeline PyTorch en bf16, la mediana de PSNR es de 23,8 dB con el peor caso en 15,3 dB, y los detalles menores se desplazan entre ambas implementaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (denoiser, 5B) + decoder VAE (FLUX.2 small) + codificador de texto externo Qwen3.5-9B |
| Parámetros totales | 5B en el denoiser; el codificador Qwen3.5-9B (9B) se distribuye aparte; total del pipeline no disponible |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible; el codificador se evalúa leyendo 512 tokens a la vez en la comparativa de precisión |
| Tipos de cuantización | 8 bits MatMulNBits en el denoiser; fp16 en decoder y LoRAs; Q8_0 GGUF en el codificador de texto |
| Idiomas soportados | No disponibles en los metadatos; la model card menciona pruebas con prompts en inglés, francés, alemán y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Grafos ONNX (`.onnx`) y adaptadores ONNX Runtime (`.onnx_adapter`); GGUF para el codificador Qwen3.5-9B |
| Resoluciones soportadas | 1024×1024, 1456×1456, 1344×768 y 768×1344 (las medidas en la model card) |
| Tamaño del repositorio | 6,9 GB (denoiser 5,3 GiB, decoder 0,05 GiB, LoRAs 0,07 GiB cada uno, destilación 0,6 GiB) |
| Runtime mínimo | ONNX Runtime 1.31 con CUDA execution provider |

## Arquitectura y entrenamiento

El pipeline replica la arquitectura de MOSS-Image-SFT: un transformer de difusión de 5.000 millones de parámetros que opera en un flujo residual fp32 con aritmética fp16, cuantizado a 8 bits mediante MatMulNBits para caber en 5,3 GiB, y un decoder VAE fp16 de 0,05 GiB derivado del VAE pequeño de FLUX.2 que convierte latentes en píxeles. El texto entra por el último estado oculto de Qwen3.5-9B, usado sin fine-tuning, lo que convierte al codificador en una dependencia externa que se ejecuta en llama.cpp (probado con la compilación b11606) y no en ONNX Runtime.

Este repositorio no documenta entrenamiento propio: es una conversión de pesos más un conjunto de adaptadores LoRA aplicados sin fusionar, uno cada vez, con la operación `salida + fuerza · (x down) up` calculada en fp32. La única pieza con semántica de muestreo es la destilación `moss-fast-8step` (procedente de `lodestones/MOSS-Image-SFT-8-steps-dmd`), que incluye su propio sampler y una ruta de timesteps en fp32. La bondad de la conversión se midió con dos scripts: `check_moss_loras.py` (tres prompts a 1024² por LoRA, comparando PyTorch con el LoRA leído de su archivo frente al adaptador ONNX) y `compare_moss_encoder.py` (catorce prompts, incluidos textos en francés, alemán y chino y un layout en JSON, leídos con Qwen3.5-9B en PyTorch y con llama.cpp en cuatro precisiones).

## Capacidades

- Generación de imágenes texto a imagen en cuatro resoluciones: 1024×1024, 1456×1456, 1344×768 y 768×1344.
- Muestreo guiado estándar de 50 pasos, con decoder VAE separado para la fase de píxeles.
- Muestreo rápido mediante la destilación `moss-fast-8step`: ocho pasos con sampler propio, 3,8 s por imagen a 1024² en RTX PRO 6000 frente a 22,9 s del modelo completo.
- Estilización mediante ocho LoRAs intercambiables con trigger y fuerza definidos: `moss-anime` (`moss_seinen_style`, 1.0), `moss-gouache` (`moss_vgouache_style`, 1.0), `moss-psychedelic` (`moss_psychpop_style`, 1.0), `moss-beauty` (`moss_beauty_style`, 1.0), `moss-impressionism` (sin trigger, 1.0), `moss-animated` (`moss_ac_style`, 0.7), `moss-nsfw` (`moss_xvstyle`, 0.7) y `moss-fast-8step` (1.0).
- Seguimiento de prompts multilingües: la model card valida textos en inglés, francés, alemán y chino, además de un prompt con estructura JSON.
- Composición de escenas con conteo de objetos y texto en la imagen, con errores ocasionales de conteo reconocidos por el propio autor.
- Integración nativa en C# mediante Nexaflow, y en cualquier host con ONNX Runtime 1.31 y CUDA EP; no requiere Python en inferencia.
- No incluye tool calling, agentes, visión de entrada ni salida de audio: es exclusivamente texto a imagen.

## Casos de uso

- **Integración en aplicaciones .NET de escritorio o servidor**: el repositorio existe precisamente para que Nexaflow, un host de IA en C#, dibuje con estos grafos. Un servicio ASP.NET puede cargar el denoiser y el decoder con ONNX Runtime y el provider de CUDA sin interponer un microservicio Python.
- **Generación de ilustración editorial por lotes**: con 22,9 s por imagen a 1024² en una RTX PRO 6000, un proceso nocturno puede producir del orden de 1.500 imágenes en nueve horas y media con el modelo completo, o más de 8.000 con la destilación de 8 pasos a 3,8 s.
- **Estilización de catálogos y campañas**: los LoRAs de gouache, impresionismo, psicodélico y beauty permiten fijar una línea visual concreta añadiendo el trigger al principio del prompt y ajustando la fuerza, sin reentrenar el modelo base.
- **Prototipado rápido en estaciones de trabajo**: la variante de 8 pasos reduce el coste por iteración de 22,9 s a 3,8 s, lo que hace viable un bucle interactivo de prueba de prompts y composición antes de lanzar el render final de 50 pasos.
- **Sustitución de un pipeline PyTorch en producción**: la comparativa del autor mide 22,9 s frente a 27,7 s del pipeline PyTorch en bf16 en la misma RTX PRO 6000, con un pico de memoria del denoiser de 7,8 GiB a 1024², lo que simplifica el empaquetado y el despliegue en contenedores sin CUDA toolkit de PyTorch.
- **Generación de ilustración para videojuegos y contenido derivado**: la destilación de 8 pasos y los LoRAs de anime y animación permiten producir variaciones de personajes y fondos con una latencia compatible con herramientas internas de authoring.
- **Investigación en fidelidad de conversiones ONNX**: los scripts `check_moss_loras.py` y `compare_moss_encoder.py` sirven como banco de pruebas reproducible de PSNR entre implementaciones, útil para quien esté evaluando portar otros modelos de difusión a ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible: al ser un modelo de texto a imagen, las métricas publicadas son de fidelidad y de latencia.

Fidelidad frente al pipeline PyTorch en bf16, misma semilla, doce prompts:

| Comparación | PSNR mediana | Rango |
|---|---|---|
| Build ONNX frente a PyTorch (sin LoRA), cuatro resoluciones | 23,8 dB | peor caso 15,3 dB |
| PyTorch con encoder llama.cpp frente a PyTorch con su encoder bf16 | 25,6 dB | 13,9–49,9 dB |

Fidelidad y coste por LoRA (tres prompts a 1024², build frente a PyTorch con el mismo LoRA):

| LoRA | PSNR build vs PyTorch, mediana (rango) | PSNR PyTorch con LoRA vs sin LoRA, mediana | Segundos por imagen 1024² |
|---|---|---|---|
| `moss-fast-8step` | 15,9 dB (15,1–22,9) | 11,6 dB | 3,8 |
| `moss-anime` | 26,1 dB (19,5–30,7) | 15,4 dB | 37,1 |
| `moss-gouache` | 22,8 dB (22,1–24,7) | 11,7 dB | 36,0 |
| `moss-psychedelic` | 26,1 dB (20,3–29,9) | 16,8 dB | 36,5 |
| `moss-beauty` | 24,1 dB (19,8–31,3) | 16,1 dB | 36,3 |
| `moss-nsfw` | 25,3 dB (21,2–27,9) | 18,2 dB | 35,5 |
| `moss-animated` | 24,8 dB (21,1–25,3) | 14,8 dB | 35,3 |
| `moss-impressionism` | 32,2 dB (28,5–38,2) | 15,6 dB | 36,2 |

Memoria y tiempo en una RTX PRO 6000, cargando una parte cada vez:

| Componente | VRAM a 1024² | VRAM a 1456² | Segundos por imagen 1024² |
|---|---|---|---|
| `denoiser/` | 7,8 GiB | 9,1 GiB | 22,9 |
| `decoder/` | 3,0 GiB | 5,4 GiB | incluido arriba |
| Pipeline PyTorch en bf16 (referencia) | no disponible | no disponible | 27,7 |
| Codificador de prompt (Qwen3.5-9B) | 8,5 GiB | no disponible | no disponible |

## Requisitos de hardware

- **VRAM por componente (medida en RTX PRO 6000)**: codificador de prompt 8,5 GiB, denoiser 7,8 GiB a 1024² y 9,1 GiB a 1456², decoder 3,0 GiB a 1024² y 5,4 GiB a 1456².
- **Pico realista**: cargando las partes de una en una, como hace Nexaflow, el componente mayor decide la tarjeta: 9,1 GiB del denoiser a 1456² o 8,5 GiB del codificador. Eso sitúa el mínimo práctico en torno a 12 GB de VRAM; una tarjeta de 8 GB queda por debajo del denoiser a 1456² y muy justa a 1024² una vez sumado el contexto de CUDA. Es una estimación a partir de la tabla del autor, no una medida publicada.
- **GPU recomendadas**: RTX PRO 6000 es la única verificada por el autor. Por capacidad, encajan A100 40/80 GB, H100, L40S y RTX 4090/5090 de 24 GB o más.
- **GPU de consumo**: sí cabe en tarjetas de 16–24 GB (RTX 4080, 4090, 5080, 5090) si se respeta la carga secuencial; no hay medidas publicadas en esas tarjetas.
- **Despliegue**: ONNX Runtime 1.31 o superior con CUDA execution provider; el autor lo consume desde Nexaflow (C#). El codificador de texto requiere una compilación de llama.cpp (probada b11606) con `Qwen3.5-9B-Q8_0.gguf`.
- **Latencia**: 22,9 s por imagen 1024² con 50 pasos guiados y 3,8 s con la destilación de 8 pasos; 35–37 s con LoRAs de estilo a 1024². A 1456² no se publica tiempo, solo memoria.
- **Throughput**: no publicado; en un solo flujo, un proceso secuencial rinde aproximadamente 157 imágenes por hora a 1024² con el modelo completo.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smile-forge/moss-image-onnx` | ONNX (8 bits + fp16) | 5B en denoiser + 9B de encoder externo | 1024² a 1456² | Apache-2.0 | HuggingFace, 0 descargas |
| `OpenMOSS-Team/MOSS-Image-SFT` | PyTorch bf16 | 5B en denoiser + 9B de encoder | mismas resoluciones | no disponible en la información | HuggingFace |
| `lodestones/MOSS-Image-SFT-8-steps-dmd` | LoRA de destilación | adapta el denoiser de 5B | 8 pasos | Apache-2.0 según la model card | HuggingFace, como LoRA |
| `unsloth/Qwen3.5-9B-GGUF` | GGUF Q8_0 | 9B | no disponible | no disponible en la información | HuggingFace |

No se dispone de datos de otras implementaciones ONNX comparables ni de benchmarks frente a FLUX.1, SD3 u otros modelos de texto a imagen en la información proporcionada, por lo que la comparación se limita a las variantes del propio MOSS-Image.

## Limitaciones y advertencias

- **Fidelidad no exacta**: la mediana de 23,8 dB frente a PyTorch implica que la misma semilla produce variaciones en detalles finos (la librea de un tranvía, una figura de fondo). No es un sustituto bit a bit del pipeline original.
- **Errores de conteo**: el autor reconoce que tanto PyTorch como esta conversión fallan a veces al contar objetos (tres peras cuando se piden dos).
- **La destilación amplifica el error**: con 8 pasos, el PSNR frente a PyTorch cae a 15,9 dB de mediana, porque los pasos grandes propagan la diferencia de los pesos de 8 bits mucho más que 50 pasos pequeños.
- **Dependencia externa obligatoria**: el codificador de prompt no está incluido; hay que descargar Qwen3.5-9B en GGUF y disponer de llama.cpp, lo que añade 8,5 GiB de VRAM y una segunda pila de software.
- **No es un pipeline autocontenido**: el bucle de muestreo, el scheduler, la escala de guidance y la gestión de memoria deben implementarlos el host; el autor los implementa en Nexaflow, no se distribuyen como librería independiente.
- **LoRAs de una en una y sin fusionar**: no se soporta composición de varios LoRAs simultáneos en el diseño documentado.
- **Contenido adulto**: el repositorio incluye `moss-nsfw` (`moss_xvstyle`, fuerza 0,7); requiere filtrado, control de acceso y cumplimiento de las políticas de la plataforma.
- **Licencia**: el repositorio y los LoRAs son Apache-2.0 según la model card, pero la licencia del modelo base `MOSS-Image-SFT` no se detalla en la información disponible y debe verificarse antes de un uso comercial.
- **Idiomas no declarados**: los metadatos no listan idiomas; las pruebas con francés, alemán y chino son anecdóticas, no una evaluación multilingüe.
- **Madurez**: cero descargas y cero likes, creado y actualizado el mismo día (25 de octubre de 2026), sin validación de la comunidad; la documentación del codificador queda truncada en la información disponible y solo se ha verificado en una GPU.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/smile-forge/moss-image-onnx
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Host que lo consume (Nexaflow, C#): https://github.com/smile-forge/nexaflow
- Codificador de texto en GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- LoRA de destilación de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- LoRA anime: https://huggingface.co/axiomofmind/Moss-image-anime-lora
- LoRA gouache: https://huggingface.co/axiomofmind/Moss-image-gouache-lora
- LoRA psicodélico: https://huggingface.co/axiomofmind/Moss-image-psychedelic-lora
- LoRA beauty: https://huggingface.co/axiomofmind/Moss-image-beauty-lora
- LoRA NSFW (contenido adulto): https://huggingface.co/axiomofmind/Moss-image-nsfw-uncensored-lora
- LoRA animado: https://huggingface.co/axiomofmind/Moss-image-animated-lora
- LoRA impresionismo: https://huggingface.co/Kandoo/MOSS-Image-Impressionism-LoRA

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del repositorio.

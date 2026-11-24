# dlwj/pixel32-bilingual

## Resumen

Pixel32 Bilingual es un modelo de difusion discreta para generacion de pixel art de 32×32 píxeles con fondo transparente (RGBA), desarrollado por el usuario dlwj y publicado bajo licencia Apache-2.0. Se trata de un transformer de difusion enmascarada sobre una paleta discreta de 512 colores en espacio perceptual OKLab, con 48,41 millones de parametros y un nucleo transformer de 16×16 con 2D-RoPE y self-conditioning. Su proposito es generar sprites nitidos y con transparencia a partir de prompts en ingles y chino simplificado, directamente en el navegador mediante ONNX y WebGPU.

El modelo se entrena desde cero (clean-room) sobre 153.320 sprites limpios del dataset `azyg0s/pixelart-172k` (MIT) con leyendas en chino simplificado generadas por `Qwen/Qwen2.5-7B-Instruct`, y utiliza como codificador de texto congelado `google/siglip2-base-patch16-224` (Apache 2.0, max_length=64). La relevancia actual reside en su tamano reducido (48M parametros), su licencia permisiva sin restricciones de uso comercial y su capacidad de ejecucion en el navegador con pesos ONNX en fp16 (98,58 MB) e int8 (53,5 MB), lo que lo hace adecuado para herramientas de creacion de assets en web sin infraestructura de servidor GPU.

El modelo se distribuye en formato ONNX (Opset 18) y esta etiquetado para text-to-image, pixel-art, discrete-diffusion y webgpu. El repositorio ocupa 9,4 GB, aunque los pesos de inferencia en navegador son mucho mas ligeros. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) al tratarse de un modelo generativo de imagen; las metricas disponibles son de retrieval SigLIP-2 y de validacion interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hourglass 32×32 Masked Discrete Palette Diffusion Transformer (difusion discreta enmascarada) |
| Parametros totales | 48,41 M (dim=448, depth_core=9) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (texto: max_length=64 tokens en SigLIP-2) |
| Tipos de cuantizacion | fp16, int8 (ONNX) |
| Idiomas soportados | ingles (en), chino simplificado (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (Opset 18); `onnx/model_fp16.onnx`, `onnx/model_int8.onnx` |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion discreta con estructura hourglass sobre una rejilla de 32×32 píxeles. El nucleo transformer tiene dimension 448, profundidad 9 y utiliza 2D-RoPE sobre un nucleo de 16×16, con self-conditioning. La generacion se realiza sobre una paleta discreta de 512 colores en espacio perceptual OKLab, donde el token 0 representa transparencia, lo que permite generar sprites RGBA con fondo transparente de forma nativa. El codificador de texto es `google/siglip2-base-patch16-224` congelado, con max_length=64 y texto en minusculas; existe una version ONNX INT8 para navegador en `onnx-community/siglip2-base-patch16-224-ONNX`.

El entrenamiento se realizo desde cero en Google Colab G4 (96 GB, Blackwell) sobre 153.320 sprites limpios del dataset `azyg0s/pixelart-172k` (MIT), con leyendas en chino simplificado generadas por `Qwen/Qwen2.5-7B-Instruct`. Se completaron 35.162 pasos (9,00 M de vistas, incluyendo 3.229 pasos de pulido HQ). No se menciona uso de RLHF ni DPO; el entrenamiento es de difusion supervisada sobre pares imagen-texto. La innovacion principal es la combinacion de difusion discreta enmascarada con paleta OKLab perceptual, self-conditioning y exportacion ONNX Opset 18 verificada con paridad top-1 del 100,00% en ORT, lo que habilita inferencia en navegador via WebGPU.

## Capacidades

- Generacion de pixel art 32×32 RGBA con fondo transparente a partir de prompts de texto.
- Soporte bilingue nativo: ingles y chino simplificado, con prompts cruzados (ZH→EN) funcionales.
- Generacion de sprites e iconos de paleta limitada (512 colores en OKLab).
- Inferencia en navegador mediante ONNX Runtime y WebGPU, con pesos fp16 e int8.
- Difusion discreta enmascarada con self-conditioning para refinamiento iterativo.
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso.
- No incluye vision, audio ni modo thinking.

## Casos de uso

- Creacion de assets para videojuegos indie: generacion de sprites 32×32 con transparencia directamente integrables en motores 2D, gracias a la salida RGBA nativa y a la paleta limitada que facilita la consistencia estetica.
- Herramientas web de pixel art: el modelo puede ejecutarse en el navegador con WebGPU y los pesos ONNX int8 (53,5 MB), permitiendo un editor de sprites sin backend GPU.
- Prototipado rapido de iconografia: generacion de iconos de 32×32 con fondo transparente para interfaces, con prompts en ingles o chino.
- Localizacion de contenido creativo para mercados chinos: el soporte nativo de chino simplificado permite generar assets a partir de briefs en chino sin traduccion intermedia.
- Generacion de tilesets y elementos de escenario: la rejilla fija de 32×32 y la paleta OKLab facilitan la coherencia cromatica entre elementos generados.
- Educacion y demostraciones de difusion discreta: modelo pequeno (48M) y licencia Apache-2.0 lo hacen adecuado para ensenar y experimentar con difusion en espacio discreto.
- Integracion en pipelines de CI para generacion de placeholders: al ser ONNX y ligero, puede ejecutarse en entornos sin GPU dedicada para producir assets de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, al tratarse de un modelo generativo de imagen. Las metricas reportadas por el autor son de retrieval SigLIP-2 y de validacion interna:

| Metrica | Resultado |
|---|---|
| Retrieval SigLIP-2 16-way EN (azar 6,25%) | 100,0% (cos=0,1991) |
| Retrieval SigLIP-2 16-way ZH (azar 6,25%) | 87,5% (cos=0,1679) |
| Retrieval ZH→EN | 100,0% |
| val_unseen | 93,8% |
| val_binding | 43,8% |
| Paridad top-1 ONNX Runtime (fp16/int8) | 100,00% |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ONNX son de 98,58 MB (fp16) y 53,5 MB (int8), por lo que cabe en cualquier GPU consumer e incluso en inferencia CPU/navegador.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para ejecucion en navegador; en servidor, cualquier GPU consumer (RTX 3060 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas.
- Opciones de despliegue: ONNX Runtime (con WebGPU o CPU), navegador via WebGPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Se trata de un modelo de nicho (pixel art 32×32 bilingue en ONNX) sin alternativas directamente equivalentes documentadas en la ficha.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pixel32 Bilingual | 48,41 M | no disponible | Apache-2.0 | ONNX | Pixel art 32×32 EN/ZH, navegador |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resolucion fija de 32×32 píxeles; no genera imagenes de mayor tamano ni otros estilos.
- Paleta limitada a 512 colores en OKLab; no reproduce gradientes ni fotografias.
- Solo soporta ingles y chino simplificado; otros idiomas no estan cubiertos.
- `val_binding` de 43,8% sugiere limitaciones en el anclaje preciso entre atributos y objetos en prompts complejos.
- Riesgo de alucinacion visual: puede generar sprites incoherentes o con artefactos en prompts ambiguos o fuera de distribucion.
- No dispone de tool calling, agentes ni razonamiento; no es un modelo de proposito general.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la procedencia del dataset de entrenamiento (`azyg0s/pixelart-172k`, MIT) en produccion.
- El repositorio ocupa 9,4 GB, aunque los pesos de inferencia son mucho menores; tener en cuenta el espacio de almacenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion comunitaria significativa.

## Enlaces

- Hugging Face: https://huggingface.co/dlwj/pixel32-bilingual
- Codificador de texto SigLIP-2: https://huggingface.co/google/siglip2-base-patch16-224
- SigLIP-2 ONNX INT8 para navegador: https://huggingface.co/onnx-community/siglip2-base-patch16-224-ONNX
- Dataset de sprites: https://huggingface.co/datasets/azyg0s/pixelart-172k
- Generador de leyendas: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

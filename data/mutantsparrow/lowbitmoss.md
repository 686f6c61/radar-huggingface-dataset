# MutantSparrow/LowBitMoss

## Resumen

LowBitMoss es una exploración de investigación publicada por el desarrollador independiente MutantSparrow que aplica cuantización mixta con destilación consciente de cuantización (quantization-aware distillation, QAD) por bloques al transformer de difusión MOSS-Image SFT, un modelo de texto-a-imagen de 5,08 mil millones de parámetros. El objetivo es reducir los requisitos de hardware para ejecutar un DiT de esta escala en una única GPU de 16 GB, algo inviable con los pesos en bf16 originales (10,16 GB solo el DiT). Los ficheros DiT liberados ocupan entre 1,72 y 2,93 GB según la variante.

El paquete completo recomendado para generación en cuatro pasos combina un DiT destilado de 2,14 GB o 2,93 GB, un codificador de texto Qwen3.5-9B podado y cuantizado en GPTQ de 4,93 GB, y un decodificador VAE de 0,11 GB, sumando 7,18 GB o 7,97 GB de almacenamiento de ficheros de modelo frente a los 29,81 GB del conjunto original. El autor documenta tanto configuraciones funcionales como resultados negativos e implementaciones fallidas en el whitepaper asociado.

Se trata de un proyecto de investigación exploratoria, no de un modelo base nuevo: deriva de OpenMOSS-Team/MOSS-Image-SFT, akhaliq/MOSS-Image-SFT-4-steps, Qwen/Qwen3.5-9B y black-forest-labs/FLUX.2-small-decoder. Su relevancia radica en demostrar que es posible llevar un DiT de 5B a hardware de consumo con pérdida de calidad limitada, y en liberar código, componentes, capturas de calibración y artefactos de evaluación bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con cuantizacion mixta por bloques y correcciones de bajo rango; codificador de texto Qwen3.5-9B GPTQ podado; decodificador VAE FLUX.2-small |
| Parametros totales | 5,08 mil millones (DiT MOSS-Image SFT); el paquete incluye ademas un codificador de texto de 9B podado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta de bajo bit con escalas de grupo aprendibles y correcciones de bajo rango; variantes fp8 en factores de bajo rango; GPTQ w4a8 en el codificador de texto |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ficheros DiT individuales para ComfyUI, libreria diffusion-single-file) |

## Arquitectura y entrenamiento

LowBitMoss parte del DiT de MOSS-Image SFT, un transformer de difusión de 5,08B parámetros, y le aplica destilación consciente de cuantización por bloques en una única GPU de 16 GB. La técnica combina escalas de grupo aprendibles, entradas de flujo del estudiante (student-stream inputs) y correcciones de bajo rango sobre los pesos cuantizados. Se generan variantes con distintos compromisos de tamaño y calidad: mixG_tuned (2,14 GB), mixH2_x_f8 (1,85 GB, factores de bajo rango en fp8) y mixH2_xm_f8 (1,72 GB, con deriva hacia tonos más fríos y menor contraste). Para la generación destilada en cuatro pasos se libera mixG_tuned_t (2,93 GB) con corrección turbo plegada (folded LoRA).

El paquete incluye un codificador de texto Qwen3.5-9B cuantizado en GPTQ w4a8 y podado (4,93 GB, eliminando tensores no usados del GPTQ de Comfy-Org) y un decodificador VAE FLUX.2-small de 0,11 GB (o 0,25 GB si se conserva el encoder VAE para soportar VAE Encode). El entrenamiento se realizó sobre el modelo SFT original y su variante destilada a cuatro pasos de akhaliq. El autor documenta en el whitepaper las decisiones de entrenamiento, empaquetado y loader, así como los fallos de implementación encontrados, y libera las capturas de calibración y los artefactos de evaluación.

## Capacidades

- Generación de imágenes texto-a-imagen con el pipeline MOSS-Image, en resoluciones de 768×768 (no destilado) y 1024×1024 (destilado).
- Generación rápida en cuatro pasos con las variantes destiladas (CFG 1.0, sampler euler/simple).
- Generación de mayor calidad en 25 pasos con las variantes no destiladas (CFG 2.5, sampler er_sde/simple).
- Renderizado de texto en imagen: la variante mixG_tuned logra precisión letra a letra en las seis prompts de texto evaluadas.
- Soporte bilingüe inglés-chino a través del codificador Qwen3.5-9B.
- Integración con ComfyUI mediante un loader personalizado (ComfyUI-MOSS-LowBit) y nodos estándar de CLIP, VAE y latent vacío de MOSS-Image (128 canales, reducción espacial 16x).
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking; es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Generación de imágenes en GPU de consumo: el paquete destilado de 7,18 GB de ficheros permite ejecutar un DiT de 5B en tarjetas de 16 GB, algo imposible con los pesos bf16 de 10,16 GB solo para el DiT.
- Prototipado rápido en ComfyUI: el loader personalizado y los nodos estándar permiten montar un flujo texto-a-imagen en cuatro pasos con CFG 1.0, adecuado para iterar sobre prompts sin esperar decenas de pasos.
- Generación de carteles y material gráfico con texto: la variante mixG_tuned renderiza texto letra a letra con precisión en las pruebas del autor, útil para banners, portadas y maquetas con tipografía.
- Investigación en cuantización de modelos de difusión: los artefactos liberados (capturas de calibración, resultados negativos, código de empaquetado) sirven como punto de partida reproducible para experimentar con DiT de bajo bit.
- Despliegue en entornos con almacenamiento limitado: las variantes de 1,72 y 1,85 GB reducen el espacio en disco frente a los 10,16 GB del profesor bf16, útil en contenedores o instancias efímeras.
- Evaluación comparativa de técnicas QAD: el whitepaper documenta configuraciones funcionales y fallos, lo que permite contrastar metodologías de destilación consciente de cuantización en difusión.
- Generación bilingüe inglés-chino: el codificador Qwen3.5-9B permite prompts en ambos idiomas para contenido dirigido a mercados de habla inglesa y china.

## Benchmarks y rendimiento

| Metrica | Variante | Resultado |
|---|---|---|
| Aceptacion por model-judge (768 px, 24 prompts) | mixG_tuned (2,14 GB) | 4,21 / 5 |
| Renderizado exacto de texto (6 prompts) | mixG_tuned (2,14 GB) | 6 / 6 letra a letra |
| Aceptacion por model-judge (4 pasos, 1024 px) | mixG_tuned_t (2,93 GB) | 4,27 / 5, 23 / 24 imagenes aceptadas (con codificador bf16 y VAE completo) |
| Aceptacion por model-judge (4 pasos, fuente) | tmixG_x (2,14 GB) | 4,06 / 5, 18 / 24 aceptadas (con codificador y VAE originales) |
| Aceptacion por model-judge (no destilado) | mixG_x (2,14 GB) | 4,29 / 5 (DiT fuente) |
| Tamano de ficheros | Paquete pequeno destilado | 7,18 GB frente a 29,81 GB originales |
| Tamano de ficheros | Paquete de calidad propuesto | 7,97 GB (no medido como combinacion exacta) |

El autor advierte de que el paquete de calidad de 7,97 GB no se ha medido como combinación exacta; los datos de A 4,27 y 23/24 corresponden al DiT fuente con codificador bf16 y VAE completo. El paquete pequeño de 7,18 GB tiene puntuaciones automáticas pero no una pasada completa de juez. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: el entrenamiento y la destilación se realizaron en una única GPU de 16 GB; la inferencia del paquete destilado de 7,18 GB de ficheros está pensada para hardware de consumo, aunque no se especifica el pico de VRAM en inferencia.
- GPU recomendadas: no disponible de forma explícita; el autor cita una GPU de 16 GB para el desarrollo. Por tamaño de ficheros, encaja en tarjetas de 16 GB o superiores (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, según el diseño del proyecto (16 GB), con las variantes destiladas.
- Opciones de despliegue: ComfyUI 0.43.0 o superior con soporte nativo de MOSS-Image y el nodo personalizado ComfyUI-MOSS-LowBit; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles. La generación destilada usa 4 pasos con CFG 1.0 y la no destilada 25 pasos con CFG 2.5, lo que reduce el coste computacional de la primera.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LowBitMoss | 5,08B (DiT) + 9B (text encoder podado) | No disponible | Apache 2.0 | Hugging Face, ComfyUI | Cuantizacion mixta QAD, ficheros DiT de 1,72-2,93 GB |
| MOSS-Image-SFT (base) | 5,08B (DiT) | No disponible | No disponible en la informacion | Hugging Face (OpenMOSS-Team) | Pesos bf16, DiT de 10,16 GB; profesor del que deriva LowBitMoss |
| MOSS-Image-SFT-4-steps (akhaliq) | 5,08B (DiT) | No disponible | No disponible en la informacion | Hugging Face | Variante destilada a 4 pasos; base de las variantes destiladas de LowBitMoss |
| FLUX.2-small-decoder | No disponible | No disponible | No disponible en la informacion | Hugging Face (black-forest-labs) | Solo decodificador VAE usado en el paquete |

No se dispone de datos de benchmarks comparativos con otros modelos de difusión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Proyecto de investigación exploratoria: el autor documenta resultados negativos e implementaciones fallidas; no es un modelo listo para producción sin validación adicional.
- El paquete de calidad de 7,97 GB no se ha medido como combinación exacta; sus cifras provienen del DiT fuente con codificador bf16 y VAE completo.
- El paquete pequeño de 7,18 GB carece de una pasada completa de juez; solo tiene puntuaciones automáticas.
- La variante mixH2_xm_f8 (1,72 GB) presenta deriva hacia tonos más fríos y menor contraste.
- El estilo de renderizado es más suave que el del modelo original, según la evaluación cualitativa del autor.
- Riesgo de alucinación visual y artefactos inherente a la cuantización de bajo bit; no se documentan sesgos específicos.
- Idiomas limitados a inglés y chino; no se documenta soporte de otros idiomas.
- El decodificador VAE de 0,11 GB solo soporta decodificación texto-a-imagen; para VAE Encode hay que usar la variante de 0,25 GB.
- Requiere una versión de ComfyUI con soporte nativo de MOSS-Image (0.43.0 en la investigación) y el nodo personalizado; no es compatible con pipelines estándar de difusión sin adaptación.
- Licencia Apache 2.0 permite uso comercial, pero las licencias de los modelos base (MOSS-Image-SFT, Qwen3.5-9B, FLUX.2-small-decoder) deben verificarse por separado, ya que no se detallan en la información disponible.

## Enlaces

- [Hugging Face: MutantSparrow/LowBitMoss](https://huggingface.co/MutantSparrow/LowBitMoss)
- [GitHub: MutantSparrow/LowBitMoss](https://github.com/MutantSparrow/LowBitMoss)
- [Whitepaper PDF](https://github.com/MutantSparrow/LowBitMoss/blob/main/paper/whitepaper.pdf)
- [Whitepaper HTML](https://github.com/MutantSparrow/LowBitMoss/blob/main/paper/whitepaper.html)
- [Abstract](ABSTRACT.md)
- [Licencia Apache 2.0](https://github.com/MutantSparrow/LowBitMoss/blob/main/LICENSE)
- [Nodo ComfyUI-MOSS-LowBit](https://github.com/MutantSparrow/LowBitMoss/tree/main/custom_nodes/ComfyUI-MOSS-LowBit)
- [Modelo base: OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [Modelo base: akhaliq/MOSS-Image-SFT-4-steps](https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Modelo base: black-forest-labs/FLUX.2-small-decoder](https://huggingface.co/black-forest-labs/FLUX.2-small-decoder)

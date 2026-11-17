# Nicholas0228/HiT

## Resumen

HiT (Hierarchical Diffusion Transformer) es un modelo de difusion en espacio de píxeles desarrollado por Nicholas0228 que introduce una jerarquía visual: agrupa parches de imagen relacionados y ejecuta la mayor parte de sus bloques sobre esos grupos compactos en lugar de sobre la secuencia completa de parches. El repositorio publica checkpoints oficiales en PyTorch (safetensors) para dos variantes: una clase-condicional entrenada en ImageNet 256×256 (HiT-XL/16) y otra de texto a imagen a 512×512 (HiT-B/16).

El modelo resuelve el coste cuadrático de la atención en difusión sobre píxeles, un régimen donde la secuencia de tokens es muy larga (cada píxel o parche es un token). Al agrupar parches y operar jerárquicamente, HiT reduce el trabajo por bloque manteniendo la generación end-to-end sin un autoencoder latente intermedio, lo que evita artefactos de compresión VAE.

Es relevante ahora porque demuestra que la difusión en espacio de píxeles puede competir con los pipelines latentes: el checkpoint HiT-XL/16 reporta FID-50K de 1.48 en ImageNet 256×256, y la variante texto-imagen HiT-B/16 reporta GenEval 87.78 y DPG 85.33. La licencia MIT y la publicación de pesos en safetensors facilitan su uso comercial y su investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer jerárquico (agrupación de parches, bloques mayoritarios sobre grupos compactos) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por clase o texto; resolución 256×256 y 512×512) |
| Tipos de cuantización | no disponible (checkpoints en precisión original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (condicionamiento de texto en inglés en la variante T2I, según los benchmarks reportados) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

HiT es un Diffusion Transformer que opera directamente sobre píxeles. Su innovación central es una jerarquía visual: el modelo aprende a agrupar parches de imagen relacionados y ejecuta la mayoría de sus bloques sobre esos grupos compactos, reservando los bloques sobre la secuencia completa para un número reducido de etapas. Esto reduce el coste computacional de la atención sin recurrir a un espacio latente comprimido, manteniendo la generación end-to-end en píxeles.

Se publican dos checkpoints. HiT-XL/16 se entrena en ImageNet 256×256 durante 600 épocas con condicionamiento por clase, con parche de 16 y variante XL. HiT-B/16 se ajusta para texto a imagen a 512×512 durante 40.000 actualizaciones de fine-tuning, partiendo de los inputs congelados publicados en el dataset `Nicholas0228/minit2i-frozen-inputs-v1`. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición del dataset de texto-imagen ni si se empleó RLHF o DPO; en difusión el alineamiento se hace normalmente por fine-tuning supervisado sobre pares texto-imagen, que es lo que sugiere la denominación `sft40k`.

## Capacidades

- Generación de imágenes incondicional y condicional por clase (ImageNet 256×256) con HiT-XL/16.
- Generación de texto a imagen a 512×512 con HiT-B/16.
- Generación end-to-end en espacio de píxeles, sin VAE intermedio.
- Agrupación jerárquica de parches como mecanismo de eficiencia computacional.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- No se documentan capacidades multilingües, de audio, de vídeo ni modo "thinking".
- No se documenta edición de imagen, inpainting ni control por máscara.

## Casos de uso

- Investigación en difusión en espacio de píxeles: HiT sirve como referencia reproducible para estudiar si la generación sin VAE puede igualar a los pipelines latentes, comparando FID en ImageNet 256×256 con el checkpoint HiT-XL/16.
- Generación de imágenes condicionada por clase a escala: útil para aumentar datasets de ImageNet-like con etiquetas controladas, por ejemplo para preentrenamiento de clasificadores o aumento de datos balanceado por clase.
- Texto a imagen de propósito general a 512×512: HiT-B/16 permite prototipar generación guiada por prompts con un modelo de licencia MIT, sin dependencias de pesos con licencias restrictivas.
- Evaluación de alineamiento prompt-imagen: los benchmarks GenEval, DPG, PRISM, CoRe y Spatial reportados permiten usar el checkpoint como baseline en estudios de fidelidad composicional y espacial.
- Fine-tuning sobre dominios propios: al ser safetensors en PyTorch con licencia MIT, se puede reentrenar HiT-B/16 sobre un dataset interno de pares texto-imagen para dominios especializados (producto, ilustración, etc.).
- Despliegue en entornos con requisitos de licencia permisiva: empresas que necesitan generar imágenes y no pueden aceptar licencias con cláusulas de uso o restricciones de redistribución pueden integrar HiT bajo MIT.
- Reproducción de resultados académicos: el repositorio incluye rutas de checkpoint explícitas para reproducir FID-50K 1.48 y las métricas de T2I, lo que facilita la verificación por terceros.

## Benchmarks y rendimiento

| Checkpoint | Benchmark | Resultado |
|---|---|---|
| HiT-XL/16, ImageNet 256×256, 600 épocas | FID-50K | 1.48 |
| HiT-B/16, texto a imagen 512×512, 40k updates | GenEval | 87.78 |
| HiT-B/16, texto a imagen 512×512, 40k updates | DPG | 85.33 |
| HiT-B/16, texto a imagen 512×512, 40k updates | PRISM | 58.62 |
| HiT-B/16, texto a imagen 512×512, 40k updates | CoRe | 45.22 |
| HiT-B/16, texto a imagen 512×512, 40k updates | Spatial | 52.68 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks, ni datos de MMLU, HumanEval o GSM8K (no aplican a un modelo de imagen).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 4,9 GB, lo que da una cota inferior del tamaño de los pesos; la VRAM real depende del número de pasos de muestreo, del tamaño de lote y de la resolución (256×256 frente a 512×512).
- GPU recomendadas: no disponible. Para un transformer de difusión en píxeles a 512×512 se requiere habitualmente una GPU con al menos 16-24 GB para lotes pequeños, pero el autor no publica cifras.
- ¿Cabe en GPU de consumo? No confirmado. Con 4,9 GB de pesos, una RTX 4090 (24 GB) es candidata razonable para inferencia a lotes pequeños, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: el autor publica código en `https://github.com/Nicholas0228/HiT-Released` con checkpoints PyTorch/safetensors. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HiT (HiT-XL/16, HiT-B/16) | Diffusion Transformer en píxeles, jerárquico | no disponible | 256×256 y 512×512 | MIT | Pesos en HF, código en GitHub |
| Alternativas de difusión en píxeles | Diffusion Transformer en píxeles | no disponible | variable | variable | no disponible en la información proporcionada |
| Alternativas de difusión latente (tipo Stable Diffusion / DiT latente) | Diffusion Transformer con VAE | no disponible | variable | variable | no disponible en la información proporcionada |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de modelos comparables, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al entrenarse en ImageNet y en un dataset de texto-imagen no especificado, es esperable heredar sesgos de esas fuentes, pero el autor no los analiza.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes plausibles pero incorrectas respecto al prompt; los benchmarks GenEval y DPG reportados miden alineamiento, no veracidad factual.
- Limitaciones de idioma: no se especifica qué idiomas soporta el condicionamiento de texto; los benchmarks reportados son en inglés, por lo que el rendimiento en castellano no está verificado.
- Limitaciones de contexto y resolución: solo se publican checkpoints a 256×256 (clase) y 512×512 (texto); no se documenta soporte de otras resoluciones o relaciones de aspecto.
- Restricciones de licencia: MIT permite uso comercial y modificación con atribución y sin garantía; conviene revisar las licencias de los datasets de entrenamiento (ImageNet y el dataset de inputs congelados) antes de un despliegue comercial.
- Caveats de producción: no hay cifras publicadas de latencia, throughput ni VRAM; el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de robustez fuera de los benchmarks del autor.
- No se documenta soporte de tool calling, agentes ni multi-step reasoning; no debe tratarse como un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Nicholas0228/HiT
- Web del proyecto: https://nicholas0228.github.io/blog/hit/
- Código: https://github.com/Nicholas0228/HiT-Released
- Dataset de inputs congelados para T2I: https://huggingface.co/datasets/Nicholas0228/minit2i-frozen-inputs-v1

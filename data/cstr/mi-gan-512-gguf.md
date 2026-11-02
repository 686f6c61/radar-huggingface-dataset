# cstr/MI-GAN-512-GGUF

## Resumen

MI-GAN 512 (Places2) es un modelo de inpainting de imágenes (relleno de regiones enmascaradas) desarrollado originalmente por Picsart AI Research (PAIR) y publicado aquí en formato GGUF por el usuario `cstr` para su uso en CrispEmbed, un motor de inpainting nativo. El modelo resuelve la tarea de reconstruir regiones faltantes o enmascaradas de una imagen a resolución 512, partiendo de un checkpoint entrenado sobre el dataset Places2. La relevancia de esta publicación es fundamentalmente práctica: empaqueta los pesos originales en varios niveles de cuantización (F32, F16, Q8_0, Q4_K) con verificación de fidelidad numérica frente al modelo PyTorch de referencia, algo poco habitual en modelos pequeños de visión.

El modelo es muy compacto: 7.371.382 parámetros totales, con un repositorio de apenas 0,1 GB. No es un modelo de lenguaje ni un transformer generativo de texto, sino una red de inpainting de tipo GAN, por lo que sus capacidades se limitan estrictamente a la reconstrucción de imágenes. La licencia es MIT tanto para el código como para los pesos, lo que facilita su integración en productos comerciales.

Es importante subrayar que la model card lo marca explícitamente como **experimental** y que los ficheros solo funcionan dentro del motor nativo de CrispEmbed, detrás de flags desactivados por defecto (`CRISPEMBED_MIGAN`, `CRISPEMBED_MIGAN512`, `CRISPEMBED_INPAINT_QUANT`). No es un modelo plug-and-play en otros runners de GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GAN para inpainting de imágenes (MI-GAN) |
| Parámetros totales | 7.371.382 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | F32, F16, Q8_0, Q4_K |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT (código y pesos) |
| Formato de pesos | GGUF |
| Resolución de trabajo | 512 |
| Dataset de entrenamiento | Places2 |
| Tamaño del repositorio | 0,1 GB |
| Librería | crispembed |

## Arquitectura y entrenamiento

MI-GAN es una red generativa adversarial diseñada específicamente para inpainting de imágenes, según el linaje declarado en la model card (repositorio `Picsart-AI-Research/MI-GAN`, revisión `2b793c5`). El checkpoint de origen es `migan_512_places2.pt`, entrenado sobre Places2, un dataset de escenas naturales y urbanas ampliamente usado en tareas de inpainting. No se proporcionan en la información disponible detalles sobre el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de refinamiento posteriores.

La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el proceso de conversión y cuantización: los pesos se convirtieron mediante `models/convert-migan-to-gguf.py` y se cuantizaron con `crispembed-quantize` bajo una política `inpaint-v1`. El autor reporta verificaciones de fidelidad numérica (cosine de la salida final) frente al modelo PyTorch original, con umbrales de aceptación de F32 > 0,99, F16 > 0,98, Q8_0 > 0,97 y Q4_K > 0,94. Los ficheros publicados son copias exactas de los ficheros cualificados; no se recuantizó nada para la publicación.

## Capacidades

- Inpainting de imágenes a resolución 512: reconstrucción de regiones enmascaradas en fotografías y escenas.
- Trabajo con máscaras sintéticas (paneles de prueba) y máscaras sobre fotos reales.
- Soporte de máscaras de texto (se menciona explícitamente una máscara DBNet de texto en la evaluación del autor).
- Ejecución en cuatro precisiones (F32, F16, Q8_0, Q4_K) con degradación numérica medida.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del inpainting.

## Casos de uso

- **Restauración de fotografías con objetos no deseados**: el modelo rellena regiones enmascaradas (por ejemplo, personas o señales) en fotos de escenas de Places2, usando la variante F16 para mantener alta fidelidad (cosine 0,999998 frente a F32).
- **Eliminación de texto en imágenes**: con máscaras generadas por DBNet, el modelo puede rellenar zonas de texto sobre fotografías; conviene usar F16 o Q8_0, ya que Q4_K baja a 0,9019 de cosine en el recorte de calle evaluado.
- **Pipeline de edición automática de imágenes por lotes**: integrado en CrispEmbed con `CRISPEMBED_MIGAN512=1`, permite procesar grandes volúmenes de imágenes con un modelo de 7,3 M de parámetros y ficheros de 11-30 MB.
- **Prototipado en entornos con recursos limitados**: la variante Q4_K ocupa 11.143.424 bytes, lo que permite desplegarla en dispositivos con poca memoria, aceptando la pérdida de fidelidad documentada.
- **Investigación en cuantización de modelos generativos de visión**: los datos de cosine por variante y los SHA-256 permiten reproducir y auditar el efecto de la cuantización en un GAN de inpainting.
- **Generación de datos sintéticos aumentados**: rellenar regiones enmascaradas de imágenes de escenas para aumentar datasets de entrenamiento de otros modelos de visión.
- **Evaluación comparativa de motores de inpainting**: al ser un checkpoint de referencia con linaje y hashes declarados, sirve como baseline reproducible frente a otros modelos de inpainting.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de cuantización (cosine de la salida final, mínimo sobre casos) frente al modelo PyTorch original, no benchmarks estándar de inpainting (FID, LPIPS, PSNR):

| Variante | Fichero | Bytes | Min cosine | Umbral | Notas |
|---|---|---|---|---|---|
| F32 | `migan-512-places2-f32.gguf` | 29.500.736 | 1 | 0,99 | Referencia |
| F16 | `migan-512-places2-f16.gguf` | 17.982.208 | 0,999998 | 0,98 | — |
| Q8_0 | `migan-512-places2-q8_0.gguf` | 12.583.168 | 0,9965 | 0,97 | — |
| Q4_K | `migan-512-places2-q4_k.gguf` | 11.143.424 | 0,977 | 0,94 | 0,9019 en recorte de calle con máscara DBNet (por debajo del umbral); fotos con máscara exacta ≥ 0,962 |

No se han publicado resultados de benchmarks estándar de inpainting (FID, LPIPS, PSNR) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; con 7,3 M de parámetros y ficheros de 11-30 MB, el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU con al menos unos cientos de MB libres.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en CPU, dado el tamaño del modelo.
- **Opciones de despliegue**: exclusivamente el motor nativo de CrispEmbed, con las flags `CRISPEMBED_MIGAN=1`, `CRISPEMBED_MIGAN512=1` y, para variantes no F32, `CRISPEMBED_INPAINT_QUANT=1`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables (parámetros, contexto, rendimiento, licencia) para establecer una comparativa rigurosa. Se indica como **no disponible**.

## Limitaciones y advertencias

- Modelo marcado como **experimental** por el propio autor; no debe asumirse estabilidad en producción.
- Solo funciona dentro del motor nativo de CrispEmbed y detrás de flags desactivados por defecto; no es portable a otros runners GGUF.
- La variante Q4_K incumple el umbral de fidelidad en un caso concreto: 0,9019 de cosine en el recorte de calle con máscara DBNet, por debajo del 0,94 exigido. Para máscaras de texto conviene usar F16 o Q8_0.
- Riesgo de artefactos y reconstrucciones poco realistas en regiones grandes o complejas, inherente a los GAN de inpainting; no se documentan métricas de calidad perceptual.
- No se documentan sesgos específicos ni composición del dataset Places2 más allá del nombre; Places2 puede contener sesgos geográficos y culturales en las escenas representadas.
- No es un modelo lingüístico: no soporta texto, código, razonamiento ni tool calling.
- Licencia MIT para código y pesos (Copyright (c) 2024 Picsart AI Research), lo que permite uso comercial, pero conviene revisar los ficheros `licenses/LICENSE` y `licenses/LICENSE-WEIGHTS` del repositorio.
- El SHA-256 del checkpoint de origen es "first-observed": el upstream no declara un digest, por lo que la integridad del checkpoint original no puede verificarse contra una fuente oficial.

## Enlaces

- [HuggingFace: cstr/MI-GAN-512-GGUF](https://huggingface.co/cstr/MI-GAN-512-GGUF)
- [Repositorio de código MI-GAN (Picsart AI Research)](https://github.com/Picsart-AI-Research/MI-GAN/tree/2b793c5ece43f4253e32d4afc257120a5deed6f5)
- Documentación de CrispEmbed: `docs/inpainting-cli.md` y `docs/inpainting-precision.md` (referenciados en la model card, sin URL pública en la información disponible)
- Script de conversión: `models/convert-migan-to-gguf.py` (referenciado en la model card, sin URL pública en la información disponible)

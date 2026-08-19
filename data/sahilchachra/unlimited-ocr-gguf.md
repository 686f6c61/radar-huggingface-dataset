# sahilchachra/Unlimited-OCR-GGUF

## Resumen

Unlimited-OCR-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo **baidu/Unlimited-OCR**, un modelo de visión-lenguaje de 3 mil millones de parámetros especializado en OCR y parsing de documentos. Desarrollado por el usuario de Hugging Face sahilchachra, este repositorio ofrece una gama completa de cuantizaciones K-quants e i-quants del modelo de lenguaje, junto con el proyector de visión (mmproj) necesario para procesar imágenes. El modelo base, Unlimited-OCR, extiende la arquitectura de DeepSeek-OCR con capacidades one-shot y parsing de documentos de largo alcance.

La relevancia de este repositorio radica en que permite ejecutar un modelo OCR multimodal de última generación en hardware local con llama.cpp, algo que no era posible con los pesos originales. La arquitectura combina un encoder de visión DeepEncoder (SAM+CLIP) con un decoder de texto MoE basado en DeepSeek-V2, ofreciendo salidas con grounding (bounding boxes) y soporte multilingüe. La licencia MIT facilita su uso comercial, aunque requiere una versión específica de llama.cpp con soporte para DeepSeek-OCR aún no fusionada en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-OCR (vision tower SAM+CLIP + decoder MoE DeepSeek-V2) |
| Parametros totales | 3B |
| Parametros activos | no disponible (arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, IQ4_XS, IQ4_NL, IQ3_M, IQ3_XXS, IQ2_M |
| Idiomas soportados | multilingue |
| Licencia | MIT |
| Formato de pesos | GGUF (con mmproj F16 separado) |

## Arquitectura y entrenamiento

El modelo base Unlimited-OCR utiliza la arquitectura DeepSeek-OCR, que consta de un encoder de visión denominado DeepEncoder, formado por componentes SAM y CLIP, y un decoder de texto basado en DeepSeek-V2 con arquitectura MoE (mixture of experts). Esta combinación permite procesar imágenes completas y generar texto con conciencia de layout, incluyendo bounding boxes para las regiones detectadas. El modelo está diseñado para tareas one-shot de parsing de documentos, lo que significa que puede interpretar estructuras complejas como tablas, encabezados y figuras sin necesidad de ajuste fino específico.

En cuanto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El repositorio GGUF se limita a cuantizar los pesos del modelo base, manteniendo el proyector de visión en F16 para preservar la precisión del OCR. Las cuantizaciones i-quants se construyeron con una matriz de importancia (imatrix) calculada sobre un corpus de texto general.

## Capacidades

- OCR de texto plano: extracción de texto sin estructura de layout.
- Conversión de documentos a Markdown: genera salida con tablas, encabezados y orden de lectura.
- Grounding con bounding boxes: intercala el texto reconocido con coordenadas de detección usando tokens `<|det|>`.
- Localización de texto específico: mediante prompts con `<|ref|>` para encontrar cadenas concretas.
- Parsing de figuras, gráficos y diagramas.
- Descripción de imágenes (VQA general).
- Soporte multilingüe.
- Salida determinista con `--temp 0` para tareas de OCR.

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede convertir imágenes de facturas a Markdown estructurado, extrayendo campos como importes, fechas y números de factura con sus bounding boxes, lo que facilita su integración en sistemas de contabilidad automatizada.
- Procesamiento de formularios escaneados: al localizar cadenas específicas (por ejemplo, "Número de factura") y devolver sus coordenadas, se puede automatizar la extracción de datos en flujos de trabajo de gestión documental.
- Accesibilidad para personas con discapacidad visual: la conversión de documentos impresos a texto plano o Markdown permite su lectura mediante lectores de pantalla, con la ventaja de ejecutarse localmente sin conexión.
- Archivado y búsqueda de documentos históricos: el OCR multilingüe permite digitalizar archivos en varios idiomas y generar índices de texto completo para búsqueda posterior.
- Análisis de gráficos y figuras en informes: el parsing de figuras extrae la información contenida en diagramas, lo que resulta útil para resumir automáticamente informes de investigación o empresariales.
- Automatización de entrada de datos en ERP: combinado con herramientas de orquestación, el modelo puede convertir documentos de pedido o albaranes en estructuras de datos JSON o CSV, reduciendo la intervención manual.
- Extracción de texto de capturas de pantalla para documentación técnica: al generar Markdown con orden de lectura, facilita la creación de manuales a partir de interfaces de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La cuantización Q4_K_M (recomendada) ocupa 1.82 GiB, más el proyector de visión de 774 MiB, sumando aproximadamente 2.6 GiB de VRAM. Esto cabe en GPUs consumer como la RTX 3060 (12 GB) o superiores.
- La versión BF16 requiere 5.47 GiB solo para el modelo, más el proyector, por lo que se necesita al menos 7 GB de VRAM; es viable en RTX 3080 o superiores.
- Las cuantizaciones de 2-3 bits (IQ2_M, IQ3_XXS) ocupan entre 1.15 y 1.35 GiB y pueden ejecutarse en GPUs con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- El modelo se ejecuta mediante llama.cpp, específicamente con los binarios `llama-mtmd-cli` y `llama-server`, que requieren una compilación con el PR #17400 (soporte DeepSeek-OCR).
- Para NVIDIA, se debe compilar con `-DGGML_CUDA=ON`; también es compatible con Apple Silicon y dispositivos ARM (Jetson) mediante las cuantizaciones IQ4_NL.
- La latencia y el throughput no están documentados en la información disponible; se recomienda usar `--temp 0` para OCR determinista y `-n 4096` o más para documentos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baidu/Unlimited-OCR (base) | 3B | DeepSeek-OCR (SAM+CLIP + MoE) | safetensors | MIT | Hugging Face |
| sahilchachra/Unlimited-OCR-GGUF | 3B | DeepSeek-OCR (cuantizado) | GGUF | MIT | Hugging Face |
| DeepSeek-OCR (original) | no disponible | DeepSeek-OCR | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos GGUF de OCR no está disponible en la información proporcionada. El modelo base y su versión cuantizada comparten arquitectura y licencia, diferenciándose únicamente en el formato de pesos y la optimización para inferencia local.

## Limitaciones y advertencias

- Requiere una compilación específica de llama.cpp con el PR #17400, que aún no está fusionada en la rama principal; las versiones estándar no cargarán estos archivos.
- Las cuantizaciones de baja precisión (IQ2_M, IQ3_XXS) presentan pérdidas de calidad notables en OCR, especialmente en textos pequeños o con bajo contraste.
- No se dispone de información sobre sesgos del modelo ni sobre su comportamiento en dominios específicos; se recomienda validar en el caso de uso concreto.
- El riesgo de alucinación en la conversión de documentos es posible, sobre todo con imágenes de baja calidad o ruidosas; el uso de `--temp 0` reduce la variabilidad pero no elimina errores.
- La longitud de contexto no está especificada; para documentos muy largos puede ser necesario dividir la imagen o aumentar `-n` en la generación.
- La licencia MIT permite uso comercial, pero el modelo base puede tener limitaciones adicionales no documentadas en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sahilchachra/Unlimited-OCR-GGUF
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- PR de llama.cpp con soporte DeepSeek-OCR: https://github.com/ggml-org/llama.cpp/pull/17400
- Árbol de archivos del repositorio: https://huggingface.co/sahilchachra/Unlimited-OCR-GGUF/tree/main

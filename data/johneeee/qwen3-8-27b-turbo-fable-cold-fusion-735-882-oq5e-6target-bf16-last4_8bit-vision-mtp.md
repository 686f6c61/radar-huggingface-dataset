# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-oQ5e-6target-bf16-last4_8bit-vision-mtp

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una **cuantización de precisión mixta en formato MLX** de un fine-tune de 27.781.427.952 parámetros (27,78 B) perteneciente a la familia comunitaria "Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882". Lo publica el usuario Johneeee y está pensado exclusivamente para inferencia local en Apple Silicon mediante la librería MLX. La model card se limita a documentar el proceso de cuantización; no aporta información sobre arquitectura interna, entrenamiento, idiomas, licencia ni capacidades.

La cuantización se ha realizado con la herramienta **oQ (oMLX v0.7.0.dev4)** del repositorio `jundot/omlx`, con un esquema de 5 bits y tamaño de grupo 64. El nombre del repositorio indica además capas "last4" en 8 bits y una variante "6target-bf16", lo que sugiere una mezcla de precisiones por capa, aunque la model card no detalla el reparto exacto. El resultado ocupa 22,4 GB en disco, coherente con un modelo de ~27,8 B parámetros a 5 bits más las capas de mayor precisión.

Su relevancia es acotada y muy específica: permite ejecutar un modelo de casi 28 B parámetros en un Mac con memoria unificada suficiente, sin GPU dedicada ni coste de API. Ahora bien, se trata de una publicación sin tracción (0 descargas, 0 likes), sin benchmarks, sin licencia declarada y sin documentación de la cadena de fine-tuning original, por lo que su uso en producción exige una validación previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tipo `qwen3_5` declarado en la model card); detalle de capas, atención y normalización no disponible |
| Parámetros totales | 27.781.427.952 (27,78 B), según los safetensors del repositorio |
| Parámetros activos | No aplica / no disponible: no se documenta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 5 bits con tamaño de grupo 64 (precisión mixta oQ/oMLX); el nombre del repositorio indica capas "last4" en 8 bits y destino bf16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio |
| Formato de pesos | MLX safetensors |
| Tamaño del repositorio | 22,4 GB |
| Librería de inferencia | `mlx` |
| Fecha de publicación | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada en el repositorio sobre la arquitectura concreta más allá de la etiqueta `qwen3_5` y del campo `library_name: mlx`. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento. Lo único verificable es el proceso de cuantización: oQ v0.7.0.dev4 con 5 bits, grupo de 64 elementos y empaquetado en safetensors de MLX.

La información disponible en la web describe a los modelos del mismo linaje (variantes DavidAU "Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU") como fine-tunes de generación de texto sobre una base Qwen 3.8 de 27 B, orientados a seguimiento de instrucciones general, razonamiento, análisis, creatividad y generación sin censura, con contribuciones atribuidas a Nightmedia y a otros fine-tunes no divulgados. Es importante subrayar que esos datos corresponden a modelos hermanos de la misma familia, no a este repositorio concreto, y que no se ha publicado información sobre la cadena de entrenamiento del checkpoint cuantizado aquí. Los sufijos "vision" y "mtp" del identificador sugieren capacidades de visión y de predicción multi-token, pero la model card no las documenta ni las confirma.

## Capacidades

- Generación de texto en formato conversacional: es la función principal declarada por la familia de origen (seguimiento de instrucciones, análisis, creatividad).
- Razonamiento y análisis de texto: atribuido al linaje del fine-tune, sin evaluación publicada para este checkpoint.
- Generación con filtros de seguridad reducidos: la rama "Heretic-Uncensored" del linaje apunta a salidas sin alineamiento restrictivo.
- Visión: el nombre del repositorio incluye "vision", pero la model card no documenta soporte multimodal ni procesador de imágenes. Considerar no verificado.
- Predicción multi-token (MTP): mencionada en el nombre del repositorio como posible mecanismo de decodificación especulativa, sin documentación técnica asociada.
- Tool calling / function calling: no disponible, no documentado.
- Uso como agente y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Escritura creativa y narrativa local en Mac: el modelo puede generar texto largo de forma totalmente offline en un equipo Apple Silicon, sin enviar datos a servicios externos. Adecuado para autores que trabajan con material confidencial y prefieren no usar APIs en la nube.
- Redacción y reescritura de documentos técnicos: con 27,78 B parámetros ofrece una calidad de generación muy superior a los modelos de 7-8 B que suelen ejecutarse en portátiles, manteniendo la inferencia en local.
- Laboratorio de red teaming y evaluación de seguridad: al provenir de una rama sin alineamiento restrictivo, sirve para estudiar qué tipo de contenido genera un modelo sin filtros y calibrar clasificadores o guardarraíles sobre esas salidas.
- Investigación sobre cuantización de precisión mixta: el esquema oQ de 5 bits con grupo 64 y capas selectivas en 8 bits es un caso de estudio útil para medir la degradación de calidad frente al checkpoint bf16 de referencia del mismo linaje.
- Procesamiento de documentos extensos con contexto largo: aplicable si se confirma la ventana de contexto del modelo base; antes de desplegarlo hay que verificar este dato, que no aparece en la ficha.
- Prototipado rápido de asistentes conversacionales en macOS: integrable en aplicaciones de escritorio mediante MLX, con la ventaja de que no requiere una GPU dedicada ni cuotas de API.
- Evaluación comparativa de checkpoints de la misma familia: al existir variantes oQ5e-vision, oQ63e-text y GGUF del mismo linaje, este repositorio permite comparar el equilibrio entre tamaño en disco y calidad de salida.
- Pruebas de portabilidad entre formatos: útil para medir el coste de convertir un modelo MLX safetensors a GGUF y ejecutarlo después con llama.cpp, si se decide ese camino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco hay evaluaciones de terceros para este checkpoint cuantizado.

## Requisitos de hardware

- Espacio en disco: 22,4 GB para los pesos en safetensors de MLX.
- Memoria unificada estimada: ~24 GB mínimos para cargar el modelo con contexto corto; se recomienda 32 GB o más para trabajar con ventanas de contexto amplias y lote pequeño.
- Plataforma: MLX solo se ejecuta de forma nativa en Apple Silicon (macOS). No hay soporte oficial para CUDA, ROCm ni CPU x86.
- Equipos viables: Mac con M4 Pro de 24 GB (al límite), M4 Max de 36/48 GB, M3 Max de 36/48 GB, M2/M3 Ultra de 64 GB o más con holgura.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables directamente a este repositorio, ya que el formato es MLX safetensors. Su uso exigiría una conversión a un formato compatible, no incluida en el repositorio.
- Despliegue: `mlx-lm` / `mlx` como opción natural. vLLM, TGI, llama.cpp y Ollama no consumen MLX safetensors de forma directa; requerirían conversión previa.
- Latencia y throughput: no medidos ni publicados. Como cota superior teórica, un modelo limitado por ancho de banda de memoria se comporta aproximadamente como `ancho de banda / tamaño del modelo`: con 22,4 GB de pesos, un M3 Max (~400 GB/s) daría del orden de 18 tokens/s, un M4 Max (~546 GB/s) en torno a 24 tokens/s y un M3 Ultra (~800 GB/s) alrededor de 36 tokens/s. Son estimaciones derivadas del hardware y del tamaño del modelo, no cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato y cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (Johneeee, oQ5e 6target bf16 last4 8bit vision mtp) | 27,78 B | MLX safetensors, 5 bits, grupo 64 | No disponible | 0 descargas, 0 likes |
| Johneeee/...-Heretic-Uncensored-NM-DAU-oQ5e-vision | No disponible | MLX safetensors, oQ 5 bits (variante con visión) | No disponible | Repositorio público, métricas no disponibles |
| Johneeee/...-Heretic-Uncensored-NM-DAU-oQ63e-text | No disponible | MLX safetensors, oQ ~6,3 bits (variante de texto) | No disponible | Repositorio público, métricas no disponibles |
| DavidAU/...-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF | ~27 B | GGUF, cuantizaciones estándar de llama.cpp | Apache-2.0 según listados de terceros | Ampliamente distribuido en HuggingFace |
| Checkpoint bf16 del linaje DavidAU (sin cuantizar) | ~27 B | Safetensors bf16 | Apache-2.0 según listados de terceros | Disponible, requiere hardware de gama alta |

Las variantes GGUF y bf16 del mismo linaje son las alternativas más directas: ofrecen mayor portabilidad (CUDA, CPU, llama.cpp, Ollama) a cambio de un mayor tamaño en disco. La licencia Apache-2.0 citada para esos repositorios procede de fichas de terceros (aimodels.fyi) y no puede extrapolarse automáticamente a este repositorio, cuya licencia no está declarada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad real del modelo.
- Tracción nula: 0 descargas y 0 likes en el momento del análisis, sin validación por parte de la comunidad.
- Licencia no declarada en el repositorio, lo que impide determinar si el uso comercial está permitido. Aunque otras variantes del mismo linaje figuran como Apache-2.0 en listados de terceros, esa información no es aplicable sin confirmación.
- Linaje "uncensored": el modelo base del que deriva está diseñado para reducir los filtros de seguridad, por lo que puede producir contenido ofensivo, ilegal o dañino sin restricciones. No es apto para productos de cara al público sin una capa de moderación propia.
- Riesgo elevado de alucinación: la combinación de un fine-tune comunitario sin evaluación y una cuantización de 5 bits tiende a degradar la fidelidad factual respecto al modelo original.
- Idiomas no documentados: se desconoce si el modelo mantiene un rendimiento aceptable en castellano o si está sesgado hacia el inglés.
- Longitud de contexto no documentada: cualquier caso de uso que dependa de ventanas largas debe validarse empíricamente antes de comprometerse con él.
- Capacidades de visión y MTP sin confirmar: aparecen en el nombre del repositorio, pero no hay model card, config ni ejemplos que las respalden.
- Portabilidad limitada: el formato MLX safetensors no se puede cargar directamente en ecosistemas CUDA. Migrar a vLLM, TGI o llama.cpp exige conversión y validación de calidad posteriores.
- Trazabilidad incompleta: no se documenta el checkpoint de origen exacto, la composición del dataset de fine-tuning, ni el detalle del reparto de precisiones por capa. Esto dificulta reproducir la cuantización o auditar el modelo.
- Producto derivado: cualquier mejora o corrección debe hacerse sobre la base subyacente, no sobre este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-oQ5e-6target-bf16-last4_8bit-vision-mtp
- Variante de texto del mismo autor: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ63e-text
- Variante con visión del mismo autor: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ5e-vision
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Análisis de la familia en HackerNoon: https://hackernoon.com/qwen38-27b-turbo-review-a-faster-thinking-uncensored-qwen-fine-tune
- Ficha del modelo de origen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
- Ficha de la variante GGUF en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder-max-mtp-gguf-davidau

# mradermacher/CCORE-Web-Coder-4B-i1-GGUF

## Resumen

CCORE-Web-Coder-4B-i1-GGUF es una cuantización en formato GGUF del modelo CCORE-Web-Coder-4B, publicada por el usuario mradermacher, especializado en generar versiones cuantizadas de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo base, desarrollado por ccore, está orientado a tareas de generación de código en el contexto del desarrollo web, según indica su nombre. Esta versión concreta utiliza cuantizaciones ponderadas con matriz de importancia (imatrix), una técnica que busca preservar mejor la calidad del modelo original al reducir la precisión de los pesos.

La información disponible sobre este repositorio es muy limitada: la model card únicamente documenta el proceso de cuantización (versión de quantize, tipo de conversión y lista de cuantizaciones generadas), sin aportar detalles sobre la arquitectura del modelo base, los datos de entrenamiento, la licencia o los idiomas soportados. El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicación muy reciente o de escasa difusión.

El dato de parámetros totales en safetensors (1.550.888) resulta inconsistente con la denominación "4B" del modelo, por lo que probablemente corresponda a un recuento parcial o erróneo en los metadatos del repositorio. Se recomienda consultar el repositorio del modelo base para obtener especificaciones fiables antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.550.888 (dato de safetensors, inconsistente con la denominacion "4B"); el modelo base se denomina 4B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base CCORE-Web-Coder-4B en la documentación proporcionada. Por la denominación "4B" se infiere un modelo de aproximadamente 4.000 millones de parámetros, pero no se confirma si emplea un transformer denso, una arquitectura MoE u otra variante. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto al proceso de cuantización, la model card indica que se trata de cuantizaciones ponderadas con imatrix (matriz de importancia) generadas con quantize_version 2 y convert_type "hf", partiendo de los pesos en formato Hugging Face del modelo base. La lista de cuantizaciones incluye desde IQ1_M (aproximadamente 1-2 bits por peso) hasta Q6_K, lo que permite elegir entre distintos compromisos de tamaño y fidelidad. No se especifica si se preservó el proyector multimodal (skip_mmproj aparece vacío en los metadatos).

## Capacidades

- Generación de código orientada al desarrollo web, según la denominación del modelo base (no verificable con la información disponible).
- Generación de texto general: no confirmado en la documentación.
- Razonamiento y matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistencia de código en local: desplegando una de las cuantizaciones intermedias (por ejemplo Q4_K_M o Q5_K_M) con llama.cpp u Ollama, el modelo podría emplearse como asistente de autocompletado y generación de fragmentos de código en un equipo de desarrollo sin conexión a servicios en la nube, siempre que se valide previamente la calidad real del modelo base.
- Prototipado rápido en estaciones de trabajo sin GPU dedicada: las cuantizaciones de menor tamaño (Q2_K, IQ2_M) permiten ejecutar el modelo en CPU con requisitos de memoria reducidos, adecuado para pruebas exploratorias.
- Integración en editores de código mediante servidores compatibles con la API de OpenAI: herramientas como llama.cpp server u Ollama exponen una API compatible que facilita conectar el modelo a extensiones de IDE, aunque el soporte real de instrucciones complejas no está documentado.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes, lo que permite medir empíricamente la degradación de calidad entre niveles de cuantización para tareas de generación de código.
- Experimentación académica con modelos pequeños: útil para estudiar el comportamiento de modelos de ~4B parámetros en tareas de código dentro de entornos con recursos limitados.
- Despliegue en dispositivos de borde: las cuantizaciones de 1-2 bits podrían caber en dispositivos con poca memoria, si bien la pérdida de calidad en ese rango suele ser significativa y requiere validación específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión al no confirmarse el tamaño real del modelo base. Para un modelo denso de ~4B parámetros, las estimaciones orientativas serían aproximadamente 2-3 GB en Q4_K_M, 3-4 GB en Q6_K y menos de 2 GB en cuantizaciones IQ2/IQ1, pero estos valores no están verificados para este repositorio.
- GPU recomendadas: no disponible en la documentación. Para un modelo de ese orden de magnitud, GPU consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) serían suficientes; GPU de datacenter (A100, H100) no serían necesarias.
- ¿Cabe en GPU consumer? Previsiblemente sí, en la mayoría de tarjetas con 8 GB o más, aunque no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar con fiabilidad modelos comparables de la misma categoría (asistente de código de ~4B parámetros), y no se dispone de datos de rendimiento del modelo base para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta la licencia del modelo base ni de esta cuantización; no debe asumirse uso comercial permitido sin verificar el repositorio original ccore/CCORE-Web-Coder-4B.
- El recuento de parámetros en safetensors (1.550.888) es inconsistente con la denominación "4B"; los metadatos del repositorio pueden ser erróneos o incompletos.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base.
- No se confirman los idiomas soportados; el uso en castellano no está garantizado.
- Las cuantizaciones de 1-2 bits (IQ1, IQ2) pueden degradar notablemente la calidad en tareas de código, donde la precisión sintáctica es crítica.
- El repositorio registra cero descargas, por lo que no hay evidencia de uso ni validación por parte de la comunidad.
- El autor de la cuantización (mradermacher) no es el desarrollador del modelo base; la responsabilidad sobre el comportamiento del modelo recae en el proyecto ccore.
- Antes de usar en producción, es imprescindible consultar la documentación del modelo base y realizar evaluaciones propias.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/CCORE-Web-Coder-4B-i1-GGUF
- Modelo base: https://huggingface.co/ccore/CCORE-Web-Coder-4B

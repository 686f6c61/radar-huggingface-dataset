# david-thrower/helixlm-br72-sanity-sft

## Resumen

HelixLM BR72 Sanity SFT es un modelo de generación de texto publicado en Hugging Face por el usuario david-thrower bajo el identificador `david-thrower/helixlm-br72-sanity-sft`. Se distribuye como un checkpoint de la librería transformers con pesos en formato safetensors y código personalizado (`custom_code`), lo que indica que su arquitectura no se corresponde con un transformer estándar de la librería y requiere cargar módulos propios del repositorio. El nombre sugiere una arquitectura denominada "helix" y una variante "br72" con un ajuste fino supervisado (SFT) de validación o "sanity check".

El dato objetivo más relevante es el recuento de parámetros: 53.592.343, es decir, aproximadamente 53,6 millones de parámetros. Se trata por tanto de un modelo pequeño, del orden de un encoder-decoder o decoder-only compacto, muy alejado de los modelos de miles de millones de parámetros. El tamaño del repositorio es de 0,2 GB, coherente con pesos en precisión de 16 o 32 bits para esa cantidad de parámetros.

La información pública disponible es mínima: la model card es la plantilla automática de Hugging Face sin rellenar, no se declaran licencia, idiomas, contexto ni datos de entrenamiento, y el modelo no registra descargas ni "likes". Por ello, esta ficha se limita a documentar lo verificable y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Es relevante ahora únicamente como artefacto experimental o de investigación, no como base para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `helix`; requiere `custom_code`, no es un transformer estándar de transformers) |
| Parámetros totales | 53.592.343 (≈53,6 M) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers, con `custom_code`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna. La etiqueta `helix` junto con la marca `custom_code` indica que el modelo depende de código propio del repositorio para instanciar sus capas, por lo que no puede cargarse con una clase estándar de transformers sin confiar en la implementación del autor. No hay datos sobre si se trata de un transformer decoder-only, un modelo híbrido, un SSM o una variante experimental; tampoco sobre el número de capas, dimensión oculta, cabezas de atención o vocabulario.

Respecto al entrenamiento, la model card no aporta ningún dato: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o SFT convencional, pese a que el sufijo "sft" del nombre sugiere un ajuste fino supervisado. El sufijo "sanity" apunta a que podría tratarse de una ejecución de prueba o validación del pipeline de entrenamiento más que de un modelo final. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento.

## Capacidades

- Generación de texto autoregresiva, según la etiqueta de pipeline `text-generation`.
- No se documentan capacidades de razonamiento, código, matemáticas, visión, audio ni modo de pensamiento.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Al tratarse de un modelo de ~53,6 M de parámetros, su capacidad efectiva es previsiblemente limitada y muy inferior a la de modelos de miles de millones de parámetros, aunque no hay evaluación que lo confirme.

## Casos de uso

- Validación de pipelines de entrenamiento: por su nombre ("sanity") y su reducido tamaño, el uso más plausible es comprobar que el flujo de carga, tokenización e inferencia con `custom_code` funciona antes de escalar a modelos mayores.
- Pruebas de integración con transformers: sirve para verificar que un entorno de despliegue resuelve correctamente dependencias de código personalizado y pesos safetensors.
- Experimentación académica con arquitecturas no estándar: útil para estudiar la implementación "helix" si el código del repositorio es legible y reproducible.
- Generación de texto de baja latencia en entornos con recursos muy limitados: con ~53,6 M de parámetros, la inferencia en CPU es viable, aunque la calidad no está evaluada.
- Docencia y demostraciones: modelo pequeño para ilustrar el ciclo completo de publicación en Hugging Face (subida de pesos, model card, carga con código propio).
- No se recomienda su uso en atención al cliente, generación de código en producción, agentes autónomos ni aplicaciones comerciales, dado que no hay licencia declarada ni evaluación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 53,6 M de parámetros, aproximadamente 0,11 GB en fp16 y 0,21 GB en fp32, más el overhead de activaciones y del runtime (típicamente por debajo de 1 GB en total).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100 ni H100. Una GTX 1650, RTX 3050 o incluso una iGPU moderna pueden alojarlo.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) y en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía natural; no consta conversión a GGUF, por lo que llama.cpp u Ollama no están garantizados sin trabajo previo. vLLM y TGI no están verificados para esta arquitectura personalizada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| helixlm-br72-sanity-sft | ≈53,6 M | no disponible | no disponible | Hugging Face, 0 descargas | Arquitectura `helix` con `custom_code`; sin model card ni evaluación |
| GPT-2 small | 124 M | 1024 tokens | MIT | Ampliamente disponible | Transformer estándar, soporte nativo en transformers |
| DistilGPT-2 | 82 M | 1024 tokens | MIT | Ampliamente disponible | Destilado de GPT-2, integración directa |
| SmolLM-135M | 135 M | 2048 tokens | Apache 2.0 | Hugging Face | Modelo pequeño moderno con evaluación publicada |

La comparación es aproximada: los tres alternativos son transformers estándar con licencia clara y benchmarks públicos, mientras que helixlm no ofrece ninguno de esos elementos. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no haber información sobre datos de entrenamiento, no es posible evaluar sesgos.
- Riesgo de alucinación: no evaluado; en modelos de este tamaño el riesgo es estructuralmente alto.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados.
- Licencia: no declarada, lo que impide determinar si el uso comercial está permitido; en la práctica, debe tratarse como no apto para producción hasta que el autor la especifique.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo.
- Reproducibilidad: sin model card, sin dataset ni hiperparámetros, el modelo no es reproducible ni auditable.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta; el sufijo "sanity" sugiere un artefacto de prueba, no un modelo final.

## Enlaces

- Hugging Face: https://huggingface.co/david-thrower/helixlm-br72-sanity-sft
- Paper citado en la model card (calculadora de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- No se han encontrado otros enlaces (repositorio de código, paper del modelo, blog o demo) en la información disponible.

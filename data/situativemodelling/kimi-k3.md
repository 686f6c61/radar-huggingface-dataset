# SituativeModelling/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agente, publicado con pesos abiertos por Moonshot AI (distribuido en Hugging Face a través de la cuenta SituativeModelling). Se trata de un modelo Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de los modelos frontera de escala 3T. Su rasgo diferencial es una arquitectura nueva basada en Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que activa 16 de 896 expertos.

El modelo incorpora visión nativa (comprensión de texto, imágenes y vídeo en un mismo modelo) y una ventana de contexto de un millón de tokens. Está orientado a tareas de razonamiento de largo horizonte: sesiones prolongadas de ingeniería, trabajo sobre repositorios masivos, orquestación de herramientas de terminal y flujos de trabajo agénticos de conocimiento.

Su relevancia actual radica en que se presenta como el primer modelo abierto de clase 3T, con la promesa de liberar los pesos completos bajo la licencia Kimi K3 para investigación y despliegue. El repositorio ocupa 1.561 GB y el recuento real de parámetros en safetensors es de 2.779.931.837.184, coherente con la cifra declarada de 2,8T.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); 69 capas KDA + 24 Gated MLA |
| Parametros totales | 2,8T (2.779.931.837.184 según safetensors) |
| Parametros activos | 104B (16 de 896 expertos) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors, con custom_code y compressed-tensors |

Otros datos técnicos declarados: 93 capas (1 densa), dimensión oculta de atención 7168, 96 cabezas de atención, dimensión latente MoE 3584, dimensión oculta MoE por experto 3072.

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE con una composición híbrida de capas de atención: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA, sobre un total de 93 capas (una de ellas densa). El modelo escala la dispersión del MoE mediante el marco Stable LatentMoE, que activa 16 de 896 expertos por token, con una dimensión latente de 3584 y una dimensión oculta de 3072 por experto. Según la model card, esta combinación aporta una mejora aproximada de 2,5× en eficiencia de escalado respecto a Kimi K2. La atención usa 96 cabezas con dimensión oculta de 7168.

El modelo es multimodal nativo: procesa texto, imágenes y vídeo dentro de la misma arquitectura, y soporta un contexto de un millón de tokens. La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se describen innovaciones adicionales como decodificación especulativa. El pipeline declarado es image-text-to-text y la librería es transformers con código personalizado (custom_code).

## Capacidades

- Generación de texto y razonamiento de largo horizonte, orientado a inteligencia frontera.
- Codificación de largo alcance: sesiones de ingeniería prolongadas, navegación de repositorios masivos y orquestación de herramientas de terminal.
- Razonamiento multimodal nativo: comprensión conjunta de texto, imágenes y vídeo.
- Contexto de un millón de tokens para documentos y conversaciones extensas.
- Trabajo agéntico de conocimiento: investigación profunda con visualizaciones interactivas, widgets y paneles.
- Diseño de movimiento y edición de vídeo como parte del flujo multimodal.
- Capacidades de ingeniería especializada: optimización de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con visión en el bucle, CAD y diseño de chips.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Ingeniería de software de largo horizonte: el modelo puede mantener sesiones prolongadas sobre repositorios grandes y orquestar herramientas de terminal, lo que lo hace adecuado para tareas de refactorización y mantenimiento con supervisión humana mínima.
- Optimización de kernels de GPU: con contexto de un millón de tokens puede analizar código de bajo nivel y documentación asociada en una sola pasada, y proponer optimizaciones sobre el kernel completo.
- Investigación profunda automatizada: genera informes con visualizaciones interactivas, widgets y paneles a partir de fuentes extensas, aprovechando la ventana de contexto larga y la multimodalidad.
- Análisis de vídeo e imagen en flujos de trabajo: al comprender vídeo de forma nativa, puede emplearse en edición, diseño de movimiento y revisión de contenido audiovisual dentro del mismo modelo.
- Diseño asistido (CAD y chips): el modelo está orientado explícitamente a tareas de CAD y diseño de chips, donde la combinación de razonamiento y visión resulta útil para interpretar planos y esquemas.
- Desarrollo de videojuegos con visión en el bucle: puede inspeccionar capturas o vídeo del juego en ejecución y ajustar código o comportamiento en iteraciones sucesivas.
- Asistentes agénticos de conocimiento empresarial: para pipelines que requieran razonamiento multi-paso sobre documentación extensa, aunque el soporte explícito de tool calling no está confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 2,8T de parámetros, los pesos en 8-bit requieren del orden de 2,8 TB de memoria; en precisión completa la cifra se duplica aproximadamente. No es desplegable en una sola GPU convencional.
- GPU recomendadas: se requiere un clúster multi-GPU de clase H100/A100 con agregación de memoria muy alta; no se especifican configuraciones exactas en la información disponible.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, etc.) por el tamaño del modelo.
- Opciones de despliegue: transformers con custom_code y compressed-tensors; el soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1.000.000 | Kimi K3 License | Pesos abiertos en HF |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Referenciado como predecesor |
| Alternativas de clase 3T abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con Kimi K2, del que se menciona una mejora de 2,5× en eficiencia de escalado, pero sin datos de parámetros, contexto ni licencia. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con otros modelos.

## Limitaciones y advertencias

- El modelo no es desplegable en hardware de consumo: 2,8T de parámetros y 1.561 GB de repositorio exigen infraestructura de clúster.
- La licencia es "Kimi K3 License" (license: other), por lo que las condiciones exactas de uso comercial deben revisarse en el archivo LICENSE del repositorio; no se detallan en la información disponible.
- No se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El soporte de tool calling y function calling no está confirmado, lo que condiciona su uso en pipelines agénticos que dependan de esta funcionalidad.
- El modelo requiere código personalizado (custom_code) y compressed-tensors, lo que puede complicar la integración con herramientas estándar.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-18), por lo que la validación comunitaria es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/SituativeModelling/Kimi-K3
- Repositorio oficial en Hugging Face: https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat: https://www.kimi.com
- Página de Moonshot AI: https://www.moonshot.ai
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai

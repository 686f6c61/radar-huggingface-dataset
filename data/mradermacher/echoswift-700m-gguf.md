# mradermacher/EchoSwift-700M-GGUF

## Resumen

EchoSwift-700M es un modelo lingüístico compacto de 742 millones de parámetros, desarrollado por adityavardhansharma (EchoSwift) y distribuido aquí en formato GGUF cuantizado por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo se basa en la familia LFM2 (Liquid Foundation Models) de Liquid AI, según los tags de la model card, y está orientado explícitamente a ejecución en dispositivo (on-device), con tags que apuntan a Android, edge AI, tool calling, búsqueda y artefactos.

Su relevancia radica en el tamaño: con menos de 750 millones de parámetros, cabe en hardware muy modesto, incluidos móviles, y las cuantizaciones disponibles van desde 0,4 GB (Q2_K) hasta 1,6 GB (f16). Esto lo hace apto para asistentes locales, automatización con herramientas y casos de uso de privacidad donde no se desea enviar datos a la nube. Está entrenado en inglés y la licencia es lfm-open-1.0, la licencia abierta de Liquid AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en LFM2 (Liquid Foundation Model), híbrida según la familia de origen (no disponible el detalle exacto) |
| Parámetros totales | 742.489.344 |
| Parametros activos | No disponible (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés |
| Licencia | lfm-open-1.0 (other) |
| Formato de pesos | GGUF (el modelo base original usa safetensors, con 742,49 M de parámetros) |

## Arquitectura y entrenamiento

El modelo base, EchoSwift-700M, pertenece según sus tags a la familia LFM2 de Liquid AI, una arquitectura de fundación diseñada específicamente para inferencia en dispositivo con baja latencia y consumo energético reducido. Los tags incluyen `litertlm`, lo que sugiere compatibilidad con el formato LiteRT-LM de Google para despliegue en Android. No se ha publicado en la model card información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

Sobre la cuantización: mradermacher ofrece cuants estáticos en formato GGUF generados por conversión desde los pesos safetensors originales (tipo de conversión `hf`). Existe además un repositorio paralelo con cuants imatrix (matriz de importancia ponderada) en https://huggingface.co/mradermacher/EchoSwift-700M-i1-GGUF, que suelen ofrecer mejor calidad a igual tamaño que los cuants estáticos. Los cuants recomendados por el autor son Q4_K_S y Q4_K_M por su equilibrio velocidad/calidad, y Q8_0 como la mejor calidad práctica.

## Capacidades

- Generación de texto conversacional (pipeline etiquetado como `conversational`).
- Tool calling / function calling, indicado explícitamente en los tags del modelo.
- Capacidades de búsqueda (tag `search`) y generación de artefactos (tag `artifacts`), según los tags de la model card.
- Orientación a ejecución en dispositivo: Android, edge AI y on-device.
- Idioma: inglés. No hay soporte declarado para castellano ni otros idiomas.
- No se declaran capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Asistentes locales en Android: con cuants de 0,4-0,6 GB, el modelo puede ejecutarse en móviles mediante llama.cpp o LiteRT-LM, proporcionando un asistente conversacional sin conexión y con privacidad total.
- Agentes con tool calling en edge: el soporte de function calling permite integrar el modelo en pipelines de automatización locales donde el modelo decide qué herramienta invocar (calculadora, búsqueda local, APIs internas) sin depender de la nube.
- Chatbots de privacidad reforzada: para entornos sanitarios, legales o empresariales donde los datos no pueden salir del dispositivo o del servidor local, un modelo de 700 M con Q4_K_M (0,6 GB) es desplegable incluso en mini PCs.
- Prototipado rápido de agentes: su pequeño tamaño permite iterar con latencias muy bajas y coste de GPU casi nulo antes de escalar a modelos mayores.
- Clasificación y extracción estructurada en inglés: tareas como extracción de entidades, resumen corto o enrutado de consultas, donde los modelos pequeños cuantizados suelen ser suficientes.
- Generación de artefactos en interfaces de usuario: el tag `artifacts` sugiere uso en interfaces tipo chat con renderizado de contenido estructurado (código, documentos) en el cliente.
- Integración en aplicaciones de escritorio con recursos limitados: distribuir un modelo de menos de 1 GB junto a la aplicación es viable con Ollama o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde 0,4 GB (Q2_K) hasta 1,6 GB (f16); con Q4_K_M, unos 0,6 GB más el overhead del runtime y la KV cache. Ejecutable íntegramente en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU moderna lo ejecuta con holgura. En CPU, cualquier procesador de los últimos años es suficiente dado el tamaño.
- Consumer GPUs: cabe sin problema en cualquier GPU consumer (incluso tarjetas de 2-4 GB como una GTX 1650 o una RTX 3050); de hecho, el cuello de botella será la CPU, no la VRAM.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. Los tags sugieren también compatibilidad con LiteRT-LM para Android. No se ha verificado soporte en vLLM o TGI para este modelo concreto.
- Latencia y throughput: no disponibles; por tamaño y cuantización, se espera generación fluida por encima de decenas de tokens/segundo incluso en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| EchoSwift-700M (base) | 742 M | safetensors | lfm-open-1.0 | Enfocado a on-device, tool calling, Android |
| Qwen2.5-0.5B-Instruct | 494 M | safetensors / GGUF comunitario | Apache 2.0 | Multilingüe, muy ligero |
| Llama 3.2 1B Instruct | 1.240 M | safetensors / GGUF comunitario | Licencia Meta Llama 3.2 | Contexto de 128k tokens |
| SmolLM2-360M-Instruct | 360 M | safetensors / GGUF comunitario | Apache 2.0 | Muy compacto, inglés |

EchoSwift-700M se sitúa en la franja de modelos sub-1B para edge, junto a Qwen2.5-0.5B, SmolLM2 y Llama 3.2 1B. Su diferencial declarado es el enfoque en tool calling y despliegue móvil heredado de la familia LFM2. No hay datos de benchmarks que permitan comparar rendimiento medido.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; su rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: la longitud de ventana de contexto no está publicada; verificar antes de diseñar aplicaciones con documentos largos.
- Tamaño del modelo: con 700 M de parámetros, la capacidad de razonamiento, matemáticas y generación de código será limitada frente a modelos de 7B o superiores; esperar más alucinaciones y errores factuales.
- Cuants de baja calidad: Q2_K y Q3_K_S/M degradan notablemente la calidad; el propio autor recomienda Q4_K_S/M como mínimo razonable.
- Licencia: lfm-open-1.0 es la licencia de Liquid AI; revisar sus términos antes de uso comercial, ya que es una licencia "other" con condiciones específicas, no una licencia permisiva estándar.
- Procedencia: el modelo base es de un autor individual (adityavardhansharma) sin model card detallada sobre entrenamiento ni evaluación; ejercer cautela en producción y validar con pruebas propias.
- Riesgo de alucinación: no documentado específicamente, pero inherente a modelos pequeños de este rango.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/EchoSwift-700M-GGUF
- Modelo base original: https://huggingface.co/adityavardhansharma/EchoSwift-700M
- Cuants imatrix (ponderados): https://huggingface.co/mradermacher/EchoSwift-700M-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#EchoSwift-700M-GGUF
- Licencia lfm-open-1.0: https://raw.githubusercontent.com/Liquid-AI/LFM/main/LICENSE
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests

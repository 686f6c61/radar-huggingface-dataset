# simota1987/NitroFusion2-Q4_0-GGUF

## Resumen

NitroFusion2-Q4_0-GGUF es una cuantización en formato GGUF del modelo de difusión text-to-image ChenDY/NitroFusion2, publicada por el usuario simota1987. El modelo base es una destilación de Z-Image Turbo orientada a generar imágenes en uno o dos pasos de muestreo, lo que reduce drásticamente el coste computacional frente a los modelos de difusión convencionales que requieren decenas de pasos. Con 6.154.908.736 parámetros y un repositorio de 3,7 GB, está pensado para inferencia en hardware limitado.

La particularidad de esta cuantización es que todos los pesos de las capas transformer se almacenan en bloques Q4_0 puros, un formato que el multiplicador de matrices de la NPU Hexagon de Qualcomm acepta de forma nativa. Las cuantizaciones "Q4_0" y "Q8_0" del repositorio original mezclaban bloques Q5_1, Q4_1, Q6_K y BF16, lo que obligaba a ejecutar parte de los cálculos en CPU. Esta versión evita esa penalización y está diseñada para funcionar con el backend ggml-hexagon de stable-diffusion.cpp dentro de la aplicación Android Local Dream.

Es relevante ahora porque demuestra la viabilidad de ejecutar generación de imágenes por difusión completamente en la NPU de un teléfono móvil moderno, con tiempos de muestreo de aproximadamente 19 segundos para 1024×1024 en un Snapdragon 8 Gen 3. El modelo es únicamente el componente de difusión: requiere el text encoder (Qwen3 4B), el VAE y el tokenizer de Z-Image Turbo para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (destilación de Z-Image Turbo), transformer con capas de atención y FFN |
| Parametros totales | 6.154.908.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, no aplica contexto de texto) |
| Tipos de cuantizacion | Q4_0 (capas transformer), Q8_0 (context refiner, embedders), F32 (capa final) |
| Idiomas soportados | no disponible (el prompt depende del text encoder Qwen3 4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`nf2-q4_0.gguf`, 3.683.371.040 bytes) |

## Arquitectura y entrenamiento

El modelo base ChenDY/NitroFusion2 es una destilación de Z-Image Turbo, un modelo de difusión text-to-image, optimizada para generar imágenes en uno o dos pasos de muestreo en lugar de las decenas habituales. La destilación reduce el número de evaluaciones del modelo necesario por imagen, lo que hace viable la inferencia en hardware de baja potencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

Esta cuantización concreta no modifica la arquitectura ni los pesos más allá del cambio de formato numérico. Aplica la cuantización de referencia de ggml para Q4_0 y Q8_0 sobre el archivo `nf2-bf16.safetensors` original (SHA-256 `a1e11422d84c1986ba106f892eda86b955b752627ec902aefff1fb939c7ac19c`). La decisión técnica clave es mantener todas las capas transformer en Q4_0 puro, con el context refiner, los embedders y la capa final en Q8_0 o F32, replicando el layout del GGUF Q4_0 de Z-Image Turbo de leejet. Esto maximiza la proporción de operaciones que la NPU Hexagon puede ejecutar sin delegar en CPU.

## Capacidades

- Generación de imágenes text-to-image a partir de descripciones en lenguaje natural.
- Muestreo en un solo paso con CFG 1.0 (sampler Euler) o en dos pasos con flow shift 6 (sigmas 1.0, 0.857…, 0).
- Resolución de trabajo de 1024×1024 según las pruebas del autor.
- Ejecución del multiplicador de matrices en la NPU Hexagon de Qualcomm mediante el backend ggml-hexagon de stable-diffusion.cpp.
- Integración en la aplicación Android Local Dream.
- No incluye text encoder, VAE ni tokenizer: requiere los componentes de Z-Image Turbo (Qwen3 4B como encoder de texto).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- Generación de imágenes en dispositivo móvil sin conexión: el modelo cabe en 3,7 GB y se ejecuta íntegramente en la NPU de un Snapdragon 8 Gen 3, lo que permite crear imágenes desde el teléfono sin enviar prompts a servicios en la nube.
- Prototipado rápido de conceptos visuales: con un solo paso de muestreo y unos 19 segundos por imagen a 1024×1024, es adecuado para iterar sobre ideas de diseño en sesiones interactivas.
- Aplicaciones Android con privacidad por diseño: al ejecutarse localmente dentro de Local Dream, los prompts y las imágenes generadas no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Demos y pruebas de concepto de inferencia en NPU: sirve para evaluar el rendimiento del backend ggml-hexagon y comparar la latencia de distintos formatos de cuantización en hardware móvil.
- Generación de recursos gráficos de baja fidelidad para maquetas: la cuantización Q4_0 prioriza velocidad y encaje en memoria sobre la máxima calidad, apropiada para placeholders y borradores.
- Investigación sobre destilación de modelos de difusión: permite reproducir el comportamiento de NitroFusion2 en entornos con recursos muy limitados y estudiar el impacto de la cuantización agresiva en la calidad de salida.
- Integración en pipelines de stable-diffusion.cpp en escritorio: aunque está optimizado para NPU móvil, el GGUF puede cargarse con stable-diffusion.cpp en otras plataformas compatibles con ggml.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es el tiempo de muestreo: aproximadamente 19 segundos para una imagen de 1024×1024 con 1 paso y CFG 1.0 en la NPU de un Snapdragon 8 Gen 3.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo GGUF ocupa 3,68 GB, por lo que se necesita al menos esa cantidad de memoria más el espacio para el text encoder (Qwen3 4B), el VAE y el tokenizer de Z-Image Turbo.
- GPU recomendadas: no disponible; el modelo está orientado específicamente a la NPU Hexagon de Qualcomm (Snapdragon 8 Gen 3 probado por el autor).
- ¿Cabe en GPU consumer? No hay datos publicados sobre su ejecución en GPU de escritorio; el formato GGUF es compatible con stable-diffusion.cpp, pero no se han documentado requisitos de VRAM para ese escenario.
- Opciones de despliegue: stable-diffusion.cpp con backend ggml-hexagon; aplicación Android Local Dream. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a difusión).
- Latencia y throughput: aproximadamente 19 segundos por imagen de 1024×1024 en Snapdragon 8 Gen 3 con 1 paso. No se dispone de datos de throughput para otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NitroFusion2-Q4_0-GGUF (esta ficha) | 6.154.908.736 | no aplica | ~19 s/imagen 1024×1024 en Snapdragon 8 Gen 3 (1 paso) | Apache 2.0 | Hugging Face |
| ChenDY/NitroFusion2 (original BF16) | 6.154.908.736 | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Z-Image Turbo Q4_0 GGUF (leejet) | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar la calidad de salida entre estas variantes. La diferencia principal entre esta cuantización y las versiones del repositorio original es la proporción de pesos en Q4_0 puro, que determina cuántas operaciones se ejecutan en NPU frente a CPU.

## Limitaciones y advertencias

- Es únicamente el modelo de difusión: sin el text encoder Qwen3 4B, el VAE y el tokenizer de Z-Image Turbo no puede generar imágenes.
- La cuantización Q4_0 es agresiva y puede degradar la calidad visual respecto al modelo BF16 original; no se han publicado evaluaciones cuantitativas de esa pérdida.
- El rendimiento documentado corresponde a un único dispositivo (Snapdragon 8 Gen 3); en NPUs de otras generaciones o fabricantes el comportamiento puede diferir.
- No se dispone de información sobre sesgos del modelo base ni sobre la composición de su dataset de entrenamiento.
- Riesgo de alucinación visual inherente a los modelos de difusión: puede generar contenido incoherente o no solicitado, especialmente con prompts ambiguos.
- El modelo no procesa texto de forma autónoma; la calidad del prompt depende del encoder Qwen3 4B y de su soporte multilingüe, no documentado aquí.
- Licencia Apache 2.0 permite uso comercial, pero el autor de esta cuantización atribuye todo el crédito del modelo a ChenDY y a los autores de NitroFusion; conviene verificar las condiciones del modelo base y de los componentes auxiliares (Qwen3 4B, VAE).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la integridad o calidad del archivo más allá del SHA-256 publicado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/simota1987/NitroFusion2-Q4_0-GGUF
- Modelo base: https://huggingface.co/ChenDY/NitroFusion2
- Aplicación Android Local Dream: https://github.com/xororz/local-dream
- stable-diffusion.cpp (backend ggml-hexagon): no disponible en la información proporcionada

# LibreYOLO/LibrePRX256

## Resumen

LibrePRX256 es un espejo (mirror) del modelo de generación de imágenes texto-a-imagen PRX de Photoroom, en su variante de resolución nativa 256. Se trata de un transformer de difusión de 1.300 millones de parámetros entrenado desde cero por Photoroom, que emplea un codificador de texto T5Gemma de 2.000 millones de parámetros y el VAE de FLUX.1. La variante 256 es el modelo base, concebido como punto de partida para fine-tuning, no como modelo final de producción a alta resolución.

El repositorio lo publica la organización LibreYOLO como espejo del repositorio original `Photoroom/prx-256-t2i`, con los pesos byte a byte idénticos al upstream y conservando la disposición de pipeline de diffusers, de modo que puede cargarse directamente con la librería `diffusers` o mediante la API `LibreGen` de LibreYOLO. No se ha reentrenado, convertido ni recodificado ningún archivo.

Su relevancia radica en que ofrece un modelo de difusión de escala relativamente contenida (1,3B en el transformer) con licencia Apache-2.0 para los pesos PRX, lo que facilita experimentación y ajuste fino en infraestructura modesta. Conviene tener en cuenta que el codificador de texto T5Gemma incluido queda sujeto a los Términos de Uso de Gemma y a su política de usos prohibidos, lo que introduce restricciones adicionales más allá de la licencia Apache-2.0 del conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión texto-a-imagen (PRX), con codificador de texto T5Gemma 2B y VAE de FLUX.1 |
| Parametros totales | 1,3B en el transformer de difusión (más 2B del codificador de texto T5Gemma y el VAE de FLUX.1) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; longitud de prompt no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos PRX; el codificador T5Gemma 2B se rige por los Gemma Terms of Use; el VAE de FLUX.1 [schnell] es Apache-2.0 |
| Formato de pesos | safetensors (disposición de pipeline de diffusers: `text_encoder/`, `transformer/`, `vae/`) |

## Arquitectura y entrenamiento

PRX es un transformer de difusión para generación de imágenes condicionada por texto, entrenado desde cero por Photoroom. El pipeline combina tres componentes: un transformer de difusión de 1,3B de parámetros, un codificador de texto T5Gemma de 2B y el VAE de FLUX.1 [schnell]. La resolución nativa de esta variante es 256 píxeles, y se distribuye explícitamente como modelo base destinado a fine-tuning.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la combinación de componentes descrita. El repositorio es un espejo sin modificaciones: los archivos son byte a byte idénticos al upstream y conservan la estructura de pipeline de diffusers, con sumas SHA-256 publicadas para cada archivo de pesos.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante un pipeline de difusión.
- Resolución nativa de 256 píxeles, orientada a servir de base para ajuste fino hacia resoluciones o estilos concretos.
- Integración con `diffusers`: el repositorio mantiene la disposición de pipeline estándar y se carga directamente.
- Integración con la librería LibreYOLO mediante la API `LibreGen("prx-256")` y la CLI `libreyolo generate`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento (thinking), por tratarse de un modelo puramente generativo de imagen.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Fine-tuning de estilo o dominio: al ser un modelo base a 256 píxeles, es adecuado para ajustar el transformer sobre un dataset propio de imágenes y prompts, obteniendo un generador especializado sin partir de un modelo de mayor tamaño.
- Prototipado rápido de pipelines de generación: permite validar flujos de datos, preprocesado de prompts y postprocesado de imágenes con un modelo de 1,3B antes de escalar a modelos mayores.
- Investigación en difusión: sirve como banco de pruebas para estudiar el comportamiento de un transformer entrenado desde cero con un codificador T5Gemma 2B y el VAE de FLUX.1.
- Generación de miniaturas y bocetos: la resolución nativa de 256 px encaja en la producción de borradores visuales o thumbnails que después se amplían o refinan con otros modelos.
- Aumento de datos sintéticos: generación de imágenes de baja resolución para aumentar datasets de entrenamiento de clasificadores o detectores, aprovechando la licencia Apache-2.0 de los pesos PRX.
- Evaluación comparativa de codificadores de texto: al usar T5Gemma 2B, permite analizar cómo afecta este codificador a la fidelidad prompt-imagen frente a otros pipelines.
- Integración en herramientas de línea de comandos: mediante `libreyolo generate prompt="..." model=prx-256`, útil para scripts de generación por lotes en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 15,5 GB en total, repartidos entre el transformer de difusión (1,3B), el codificador de texto T5Gemma 2B y el VAE de FLUX.1.
- VRAM estimada para inferencia en precisión completa: no disponible de forma oficial; por el tamaño de los componentes (1,3B + 2B + VAE) se requiere una GPU con memoria suficiente para cargar los tres módulos, habitualmente en el rango de 16-24 GB o más según el backend y la precisión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en GPUs de consumo de gama alta con memoria suficiente, aunque no se confirma en la documentación.
- Opciones de despliegue: `diffusers` (carga directa del repositorio), librería `libreyolo` con extra `libreyolo[gen]` (API `LibreGen` y CLI). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Resolución nativa | Codificador de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibrePRX256 (PRX 256) | 1,3B | 256 | T5Gemma 2B | Apache-2.0 (pesos PRX); Gemma Terms para el text encoder | Hugging Face (espejo de Photoroom/prx-256-t2i) |
| FLUX.1 [schnell] | no disponible en la información | no disponible | no disponible | Apache-2.0 (según la model card, para el VAE) | no disponible |
| Otros modelos texto-a-imagen de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones completas de modelos alternativos que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Es un modelo base a 256 píxeles: no está pensado para generar imágenes finales de alta resolución sin fine-tuning o pipelines de ampliación posteriores.
- Licencia mixta: los pesos PRX son Apache-2.0, pero el codificador T5Gemma 2B está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con usos restringidos que deben respetarse incluso en despliegues comerciales.
- El VAE de FLUX.1 [schnell] es Apache-2.0 según la model card, pero conviene verificar los términos del componente original antes de su uso en producción.
- Al ser un espejo, cualquier corrección, actualización o soporte proviene del repositorio upstream `Photoroom/prx-256-t2i`; el espejo no añade garantías.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas específicas en la información disponible.
- No hay datos publicados de benchmarks, latencia ni requisitos oficiales de VRAM, lo que dificulta estimar el rendimiento en producción sin pruebas propias.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en la comunidad que permita validar su comportamiento en escenarios reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LibreYOLO/LibrePRX256
- Repositorio upstream: https://huggingface.co/Photoroom/prx-256-t2i
- Anuncio de Photoroom: https://huggingface.co/blog/Photoroom/prx-open-source-t2i-model
- GitHub de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de modelos de LibreYOLO: https://www.libreyolo.com/docs/models
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy

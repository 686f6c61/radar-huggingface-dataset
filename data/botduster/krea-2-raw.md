# botduster/Krea-2-Raw

## Resumen

Krea 2 Raw es el checkpoint base del modelo de difusión texto-a-imagen Krea 2, desarrollado por Krea.ai, Inc. y publicado el 22 de junio de 2026. Se trata de un Diffusion Transformer de 12.000 millones de parámetros (12.820.073.036 según los pesos en safetensors) que genera imágenes a partir de descripciones en lenguaje natural. La versión Raw es el punto de partida previo al post-entrenamiento y la destilación que dan lugar a Krea 2 Turbo, por lo que el propio autor la desaconseja para inferencia directa y la orienta a fine-tuning y post-entrenamiento sobre dominios propios.

La relevancia de esta ficha concreta es que el repositorio `botduster/Krea-2-Raw` no es un release oficial, sino un espejo sin modificar del repositorio `krea/Krea-2-Raw`, publicado al amparo de la sección 3 de la Krea 2 Community License. Todos los pesos, configuraciones y assets son idénticos byte a byte al original; las únicas adiciones son la model card del espejo y un fichero `NOTICE.txt`. Para cualquier uso en producción conviene acudir al repositorio oficial, ya que este espejo no está afiliado ni respaldado por Krea.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 62 GB y se integra con diffusers mediante la clase `Krea2Pipeline`, además de contar con soporte en el codebase oficial y en SGLang. Su licencia es comunitaria y específica del modelo, no una licencia open source estándar, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parámetros totales | 12.820.073.036 (12,8 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Krea 2 Community License Agreement (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Krea 2 emplea una arquitectura de Diffusion Transformer con aproximadamente 12.000 millones de parámetros, según la model card oficial. El repositorio contiene el checkpoint Raw, previo al post-entrenamiento y a la destilación que producen Krea 2 Turbo. La model card no detalla el número de tokens de entrenamiento, la profundidad del transformer, el tipo de text encoder ni los mecanismos de atención empleados; esa información no está disponible en el material proporcionado.

En cuanto a los datos, la model card indica que el entrenamiento combinó datos públicamente disponibles, datos licenciados de proveedores externos y datos sintéticos generados mediante métodos propietarios, incluyendo imágenes con sus correspondientes descripciones textuales. Antes del entrenamiento se filtraron categorías de contenido dañino y se redujo el material de baja calidad, duplicado o irrelevante, y se usaron datos curados y sintéticos para mejorar el seguimiento de instrucciones y la calidad visual. No se especifica si hubo RLHF, DPO ni otras etapas de alineación, ni se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes a partir de prompts en lenguaje natural, con resolución de trabajo de 1024x1024 en los ejemplos oficiales.
- Configuración de inferencia ajustable: número de pasos (52 en los ejemplos), escala de guía o CFG (3,5) y dimensiones de salida.
- Base para fine-tuning y post-entrenamiento sobre dominios específicos, que es el uso recomendado por el autor para este checkpoint.
- Entrenamiento de LoRAs sobre Raw que después pueden aplicarse directamente sobre Krea 2 Turbo, según el flujo descrito en la model card.
- Integración con diffusers mediante `Krea2Pipeline`, con el codebase oficial de Krea y con SGLang.
- Soporte de prompts en inglés; no se documentan capacidades multilingües.
- No se documentan tool calling, function calling, razonamiento multi-paso, modo thinking, visión ni audio: es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Fine-tuning de dominio propio: partir del checkpoint Raw para adaptar el modelo a un estilo visual, sector o catálogo concreto, que es precisamente el escenario para el que el autor lo recomienda frente a Turbo.
- Entrenamiento de LoRAs: generar adaptadores sobre Raw que luego se carguen en Krea 2 Turbo para producción, siguiendo el flujo de la colección oficial de LoRAs de Krea.
- Exploración de concepto y diseño: generar variaciones visuales a 1024x1024 con CFG y pasos ajustables para iterar sobre direcciones creativas antes de producir assets finales.
- Investigación en difusión: usar un DiT de 12,8 mil millones de parámetros como base reproducible para experimentos de post-entrenamiento, ablaciones o comparativas de métodos de destilación.
- Integración en herramientas creativas: incorporar `Krea2Pipeline` en una aplicación o plugin que genere imágenes bajo demanda, siempre que el uso cumpla la licencia comunitaria y la política de uso aceptable.
- Despliegue en infraestructura de serving: servir el modelo con SGLang para flujos de generación por CLI o API en entornos con GPU de datacenter.
- Evaluación comparativa de checkpoints: contrastar Raw frente a Turbo para medir el efecto del post-entrenamiento y la destilación en calidad y seguimiento de prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 12,8 mil millones de parámetros en bfloat16, los pesos ocupan del orden de 25-26 GB, a lo que hay que sumar activaciones y buffers del pipeline; se requiere por tanto una GPU con holgura por encima de esa cifra.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, el rango habitual para este tipo de modelos son A100, H100 y GPUs de datacenter con 40-80 GB de memoria.
- ¿Cabe en GPU de consumo? No hay confirmación oficial. Los pesos en bf16 superan los 24 GB de una RTX 4090, por lo que en esa tarjeta solo cabría con cuantización u offloading, y no se documentan tipos de cuantización soportados.
- Opciones de despliegue: diffusers (`Krea2Pipeline`, instalando diffusers desde el repositorio de GitHub), el codebase oficial de Krea (`inference.py`) y SGLang (`sglang generate`). No se mencionan llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni modelos comparables de la misma categoría con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El checkpoint Raw no está pensado para inferencia directa; el propio autor lo desaconseja y lo orienta a fine-tuning y post-entrenamiento.
- Este repositorio es un espejo no oficial: no está afiliado ni respaldado por Krea, y no recibirá necesariamente las actualizaciones del repositorio original.
- La licencia es la Krea 2 Community License Agreement, no una licencia open source estándar; el uso comercial está sujeto a sus términos y a la Krea 2 Acceptable Use Policy, que prevalecen en caso de conflicto.
- Solo se documenta soporte de inglés; el rendimiento con prompts en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación visual y de desviación del prompt inherente a los modelos de difusión; no se publican métricas de fidelidad en la información disponible.
- No se detallan sesgos conocidos ni resultados de evaluaciones de sesgo en el material proporcionado.
- Uso fuera de alcance prohibido por la política: contenido ilegal o dañino (CSAM, NCII, acoso, difamación), infracción de derechos de terceros y decisiones automatizadas que afecten a derechos legales de personas.
- No se documentan tipos de cuantización, por lo que el despliegue en hardware limitado requiere validación propia.
- El modelo se distribuye como pesos abiertos, pero las integraciones de producto alojadas por Krea se rigen por condiciones separadas.

## Enlaces

- Repositorio del espejo en Hugging Face: https://huggingface.co/botduster/Krea-2-Raw
- Repositorio oficial del modelo: https://huggingface.co/krea/Krea-2-Raw
- Licencia (PDF en el repositorio): https://huggingface.co/botduster/Krea-2-Raw/blob/main/LICENSE.pdf
- Información de licencia de Krea 2: https://krea.ai/krea-2-licensing
- Política de uso aceptable de Krea 2: https://www.krea.ai/krea-2-use-policy
- Codebase oficial de Krea 2: https://github.com/krea-ai/krea-2
- Colección de LoRAs de Krea 2: https://huggingface.co/collections/krea/krea-2-loras
- Cookbook de SGLang para Krea 2: https://docs.sglang.io/cookbook/diffusion/Krea/Krea-2
- diffusers (repositorio de GitHub): https://github.com/huggingface/diffusers
- SGLang (repositorio de GitHub): https://github.com/sgl-project/sglang

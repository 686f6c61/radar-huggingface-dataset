# LiquidAI/LFM3-1.7B-MLX-4bit

## Resumen

LFM3-1.7B-MLX-4bit es la versión cuantizada a 4 bits en formato MLX del modelo LFM3-1.7B, desarrollado por Liquid AI. Está pensado específicamente para inferencia en Apple Silicon (chips M-series), aprovechando el framework MLX de Apple. El modelo base pertenece a la familia LFM3 de Liquid AI, sucesora de sus modelos LFM2, y está orientado a generación de texto conversacional con soporte de razonamiento opcional.

El modelo cuenta con 1.728.801.536 parámetros totales (aproximadamente 1,7 mil millones) y los pesos cuantizados ocupan 0,97 GB en disco, lo que lo hace muy adecuado para ejecución local en portátiles y equipos de sobremesa con chip Apple. La cuantización es afín de 4 bits con grupos de 64, un esquema habitual en MLX que mantiene un buen equilibrio entre calidad y tamaño.

Su relevancia actual radica en que permite desplegar un modelo multilingüe (17 idiomas, incluido el español) con capacidades de razonamiento en hardware de consumo Apple sin necesidad de GPU dedicada. La licencia es `lfm1.0` (licencia propia de Liquid AI, marcada como "other" en Hugging Face), por lo que conviene revisar sus términos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; detalles en la model card original) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín con grupos de 64 (MLX); el modelo base admite otras cuantizaciones no detalladas aquí |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX), cuantización 4-bit |
| Tamano de pesos | 0,97 GB |
| Libreria | mlx |
| Modelo base | LiquidAI/LFM3-1.7B |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento en la información proporcionada; la model card de esta versión remite explícitamente a la model card del modelo original (LiquidAI/LFM3-1.7B) para los detalles de arquitectura y uso. Lo que sí se conoce es que se trata de una cuantización del modelo base LFM3-1.7B: los pesos se han convertido a 4 bits con cuantización afín y grupos de 64, un esquema que reduce el tamaño a 0,97 GB manteniendo la estructura de la red.

El modelo base pertenece a la familia LFM3 de Liquid AI, que la empresa presenta como su tercera generación de modelos "Liquid" (la model card enlaza al blog de presentación de LFM3). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.) en esta ficha.

## Capacidades

- Generación de texto conversacional multi-turno.
- Modo de razonamiento ("thinking") opcional: se activa explícitamente con `--enable-thinking` en MLX-VLM; por defecto está desactivado.
- Razonamiento matemático y científico: la model card recomienda parámetros de muestreo específicos (`temperature 1.0`, `top-p 0.95`, `top-k 20`, `repetition-penalty 1.0`) para estas tareas.
- Multilingüismo: 17 idiomas declarados, incluidos español, inglés, francés, alemán, italiano, portugués, árabe, chino, japonés, coreano, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Generación de hasta 16.384 tokens por respuesta según el ejemplo de uso de la model card (`--max-tokens 16384`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking sugiere capacidad de razonamiento, pero no se documenta soporte de agentes.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo se ejecuta íntegramente en Apple Silicon con MLX, con pesos de menos de 1 GB, lo que permite tener un asistente privado sin conexión y sin enviar datos a la nube.
- Razonamiento matemático y científico asistido: con el modo thinking activado y los parámetros de muestreo recomendados, puede resolver problemas paso a paso en entornos educativos o de análisis técnico.
- Procesamiento multilingüe en producción: al cubrir 17 idiomas, sirve para tareas de traducción, resumen o clasificación de textos en aplicaciones con usuarios de distintas regiones, incluido el mercado hispanohablante.
- Prototipado rápido de aplicaciones de IA generativa: su reducido tamaño y su integración con MLX-VLM permiten iterar en local antes de escalar a modelos mayores o a infraestructura cloud.
- Generación de texto en herramientas de escritorio para macOS: editores, clientes de correo o apps de notas pueden integrar el modelo como función de autocompletado, reescritura o resumen sin depender de APIs externas.
- Investigación y docencia sobre cuantización: útil para estudiar el impacto de la cuantización 4-bit con grupos de 64 en la calidad de un modelo de 1,7B, comparando con el modelo base en precisión completa.
- Filtrado y clasificación de contenido en local: por su baja huella de memoria, puede ejecutarse en segundo plano en un Mac para tareas de moderación o etiquetado de textos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 0,97 GB; con overhead de ejecución (KV cache, activaciones) se estima un consumo de memoria unificado en torno a 1,5-2,5 GB, aunque no se proporciona una cifra oficial.
- Hardware objetivo: Apple Silicon (chips M1, M2, M3, M4 y posteriores), ya que el formato es MLX.
- GPU dedicadas (NVIDIA/AMD): no aplicable a esta versión; para CUDA habría que usar el modelo base u otra cuantización (GGUF, etc.), no disponible en esta ficha.
- Cabe en cualquier Mac con memoria unificada de 8 GB o superior; en equipos de 16 GB o más deja margen amplio para contexto largo.
- Despliegue: MLX-VLM 0.7.11 o superior (comando `python -m mlx_vlm.generate`). La model card indica que ninguna versión de mlx-lm carga LFM3 todavía; el soporte está en revisión en el PR ml-explore/mlx-lm#2016.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales en la información proporcionada. Como referencia estructural, se puede comparar con el propio modelo base:

| Modelo | Parametros | Formato | Tamano de pesos | Licencia | Plataforma |
|---|---|---|---|---|---|
| LFM3-1.7B-MLX-4bit | 1,73B | MLX 4-bit | 0,97 GB | lfm1.0 | Apple Silicon |
| LFM3-1.7B (base) | 1,73B | safetensors (precisión original) | no disponible | lfm1.0 | Multiplataforma |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación facilitada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir degradación de calidad respecto al modelo base en tareas sensibles, especialmente en razonamiento matemático y generación de código; conviene validar en el caso de uso concreto.
- El modo de razonamiento está desactivado por defecto; si se espera capacidad de "thinking" hay que activarlo explícitamente y ajustar los parámetros de muestreo.
- Riesgo de alucinación inherente a los modelos de 1,7B parámetros; no se recomienda su uso en dominios de alta precisión sin verificación humana.
- La licencia `lfm1.0` es una licencia propia de Liquid AI etiquetada como "other"; es imprescindible revisar sus términos para uso comercial, ya que puede incluir restricciones específicas.
- Solo funciona en el ecosistema MLX (Apple Silicon); no es directamente utilizable en CUDA, ROCm ni CPU convencional sin reconvertir los pesos.
- Dependencia de MLX-VLM 0.7.11 o superior; el soporte en mlx-lm aún está en revisión, lo que limita la integración con herramientas que dependan de esa librería.
- No se documentan en la información disponible el sesgo, la longitud de contexto máxima ni el rendimiento en los 17 idiomas declarados; el multilingüismo puede ser desigual entre idiomas.
- No se dispone de información sobre tool calling ni capacidades de agente, por lo que no debe asumirse su soporte en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de presentación de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- PR de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2016

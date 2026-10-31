# MihaiPopa-1/LFM3-1.7B-Heretic

## Resumen

LFM3-1.7B-Heretic es una versión "decensurada" (abliterada) del modelo LFM3-1.7B de Liquid AI, publicada por el usuario MihaiPopa-1 en Hugging Face. La modificación se ha realizado con la herramienta Heretic v1.4.0, una técnica de abliteration que reduce los rechazos del modelo ante peticiones sensibles sin necesidad de reentrenamiento completo. Según la model card, el modelo original rechazaba 93 de cada 100 peticiones de prueba, mientras que esta versión solo rechaza 7, con una divergencia KL muy baja (0,0034) respecto al original, lo que indica que se conserva casi íntegro el comportamiento lingüístico del modelo base.

El modelo base, LFM3-1.7B, es un modelo de texto de 1,73 mil millones de parámetros diseñado para agentes locales y aplicaciones especializadas en el edge. Emplea una arquitectura tri-híbrida novedosa que combina convoluciones cortas con puertas, atención deslizante y atención global, con una ventana de contexto de 256K tokens. Está post-entrenado para entornos agénticos (Hermes Agent, Pi, OpenClaw) y en precisión de 4 bits ocupa aproximadamente 1 GB de memoria, por lo que cabe en cualquier teléfono o portátil.

Esta ficha se centra en la variante Heretic, pero las capacidades, arquitectura y requisitos son esencialmente los del modelo base de Liquid AI, con la diferencia clave de la eliminación de los mecanismos de rechazo. Es relevante para desarrolladores que buscan un modelo pequeño, multilingüe y sin filtros para ejecución local, aunque conlleva las advertencias éticas y legales propias de los modelos abliterados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible en la ficha (el modelo base indica ~1 GB a 4 bits) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | Safetensors (tamaño del repositorio: 3,5 GB), con custom_code en transformers |

## Arquitectura y entrenamiento

LFM3-1.7B emplea la arquitectura tri-híbrida de Liquid AI, distribuida en 24 capas: 13 capas de convoluciones cortas con puertas (gated short convolutions), 5 capas de atención con ventana deslizante (sliding-window attention) y 6 capas de atención global. Esta combinación permite manejar contextos muy largos (256K tokens) con una huella de memoria reducida, ya que las capas convolucionales y de ventana deslizante tienen un coste subcuadrático frente a la atención global. El vocabulario es de 128.000 tokens.

El modelo base está post-entrenado específicamente para uso agéntico, con compatibilidad para harnesses como Hermes Agent, Pi y OpenClaw, y está pensado para especializarse mediante fine-tuning en una sola GPU. Los detalles concretos sobre el número de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO no están disponibles en la información proporcionada.

En cuanto a la variante Heretic, se ha aplicado un proceso de abliteration automatizado con Heretic v1.4.0 que modifica los pesos de los proyectores de salida de atención (o_proj) y de bajada del MLP (down_proj) para suprimir la dirección de rechazo, con parámetros documentados como direction_index 10,09 o max_weight 1,48 en o_proj. No se trata de un reentrenamiento, sino de una intervención quirúrgica sobre los pesos del modelo original.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, incluido el español
- Contexto muy largo: 256K tokens de entrada y salida combinados, adecuado para documentos extensos y sesiones agénticas prolongadas
- Entrenamiento agéntico: compatible con harnesses como Hermes Agent, Pi y OpenClaw
- Soporte de tool calling y salidas estructuradas (según la model card del modelo base)
- Diseñado para especialización mediante fine-tuning en una sola GPU
- Ejecución en edge: ~1 GB de memoria en precisión 4 bits, apto para teléfonos y portátiles
- Sin mecanismos de rechazo: solo 7/100 rechazos frente a 93/100 del modelo original
- No incluye capacidades de visión, audio ni razonamiento extendido (thinking mode): es un modelo de texto puro

## Casos de uso

- Agentes locales en dispositivos edge: gracias a sus ~1 GB en 4 bits y su contexto de 256K tokens, puede ejecutarse en teléfonos y portátiles para asistentes que operan sin conexión
- Automatizacion de flujos agénticos: su post-entrenamiento para Hermes Agent, Pi y OpenClaw lo hace adecuado para pipelines de tareas multi-paso con tool calling y salidas estructuradas
- Procesamiento de documentos largos: la ventana de 256K tokens permite resumir, analizar o extraer información de informes, contratos o bases de código extensas de una sola pasada
- Atencion al cliente en el dispositivo: puede gestionar conversaciones multi-turno en 16 idiomas con latencia baja al ejecutarse localmente, sin enviar datos a la nube
- Investigacion sobre alineacion y abliteration: al tratarse de una variante decensurada con métricas publicadas (KL y tasa de rechazos), es útil como sujeto de estudio para investigar mecanismos de rechazo en LLM
- Generacion de contenido creativo sin filtros: escritura de ficción, guiones o roleplay donde los rechazos del modelo original interrumpían el flujo
- Fine-tuning de dominio: su tamaño reducido permite adaptarlo a dominios específicos (legal, médico técnico, jerga interna) en una sola GPU de consumo
- Prototipado rapido de aplicaciones LLM: tamaño pequeño y compatibilidad con transformers para iterar rápidamente antes de escalar a modelos mayores

## Benchmarks y rendimiento

Datos de rendimiento publicados en la model card (comparativa de la abliteration):

| Metrica | LFM3-1.7B-Heretic | LFM3-1.7B (original) |
|---|---|---|
| Divergencia KL | 0,0034 | 0 (por definicion) |
| Rechazos | 7/100 | 93/100 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) para esta variante en la informacion disponible. Para los resultados del modelo base, consultar el blog de lanzamiento de LFM3 de Liquid AI.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB en FP16/BF16 (tamano del repositorio); aproximadamente 1 GB a 4 bits segun la model card del modelo base
- GPU recomendadas: dada su escala (1,73B), cualquier GPU de consumo es suficiente; una RTX 3060 de 12 GB o incluso GPUs integradas con 4 GB de VRAM bastan en cuantizacion de 4 bits. No se requieren A100 ni H100 para inferencia
- Consumer GPUs: cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y similares, incluso en precision completa; a 4 bits cabe en portatiles y moviles segun Liquid AI
- CPU: al ser un modelo de 1,7B, es viable la inferencia en CPU pura con velocidades razonables
- Opciones de despliegue: libreria transformers (con custom_code); por el tamano y formato, deberia ser compatible con llama.cpp y Ollama si existen conversiones GGUF (no disponibles en este repositorio), y con vLLM o TGI en servidores (no verificado para la arquitectura tri-hibrida)
- Latencia y throughput: no disponibles; al ser un modelo hibrido con pocas capas de atencion global, se espera latencia baja en edge, pero no hay cifras publicadas

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Decensurado |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic | 1,73B | 256K | Tri-hibrida (conv + SWA + global attn) | LFM Open License v1.0 | Si (7/100 rechazos) |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | Tri-hibrida (conv + SWA + global attn) | LFM Open License v1.0 | No (93/100 rechazos) |
| Qwen3-1.7B | 1,7B | 32K (ampliable a 128K con YaRN) | Transformer denso | Apache 2.0 | No |
| Llama-3.2-1B | 1,24B | 128K | Transformer denso | Llama 3.2 Community License | No |

Frente a alternativas densas de tamano similar como Qwen3-1.7B o Llama-3.2-1B, LFM3-1.7B destaca por su arquitectura hibrida con contexto de 256K tokens y su enfoque agéntico, aunque su licencia (LFM Open License v1.0) es mas restrictiva que Apache 2.0. La variante Heretic es la unica de este tamano con abliteration documentada y metricas de divergencia publicadas.

## Limitaciones y advertencias

- Modelo decensurado: al haberse eliminado los mecanismos de rechazo, puede generar contenido ofensivo, peligroso o ilegal si se le solicita. Su uso conlleva responsabilidad legal directa para el operador
- Riesgo de alucinacion: inherente a cualquier LLM, y agravado al tratarse de un modelo de 1,7B sin filtros de seguridad; no verificado con benchmarks estandarizados tras la abliteration
- La abliteration puede degradar sutilmente la calidad: aunque la divergencia KL es muy baja (0,0034), no hay evaluaciones publicadas de MMLU u otros benchmarks para confirmar que las capacidades no se han visto afectadas
- Idiomas: soporta 16 idiomas, pero el rendimiento en español y otros idiomas no ingles puede ser inferior al del ingles; no hay datos por idioma disponibles
- Licencia: LFM Open License v1.0 no es una licencia estandar; hay que revisar sus terminos antes de cualquier uso comercial, ya que impone condiciones distintas a licencias permisivas como Apache 2.0 o MIT
- Formato: requiere custom_code en transformers, lo que implica ejecutar codigo del repositorio (riesgo de supply chain habitual en modelos con custom_code)
- No hay versiones GGUF oficiales en este repositorio, lo que limita las opciones de despliegue en llama.cpp u Ollama sin conversion manual
- Modelo de texto puro: sin capacidades de vision, audio ni multimodalidad, a diferencia de otros miembros de la familia LFM3
- Uso en produccion: al ser una modificacion de terceros (MihaiPopa-1) no respaldada oficialmente por Liquid AI, no hay soporte oficial ni garantia de estabilidad

## Enlaces

- Modelo Heretic: https://huggingface.co/MihaiPopa-1/LFM3-1.7B-Heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola API de Liquid AI: https://console.liquid.ai/dashboard
- Heretic: https://heretic-project.org

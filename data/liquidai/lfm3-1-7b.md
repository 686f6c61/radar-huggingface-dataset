# LiquidAI/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de tipo texto desarrollado por Liquid AI, disenado especificamente para agentes locales y aplicaciones especializadas que se ejecutan en el borde (edge). Con 1.728.801.536 parametros, se basa en una arquitectura tri-hibrida que combina convoluciones cortas con compuerta, atencion de ventana deslizante y atencion global, lo que le permite manejar un contexto de 256.000 tokens con un coste computacional reducido en comparacion con un transformer denso equivalente.

El modelo ha sido post-entrenado para su uso en entornos agenticos como Hermes Agent, Pi y OpenClaw, lo que lo hace adecuado para tareas de razonamiento multi-paso, llamada a herramientas y automatizacion. Su principal propuesta de valor es la eficiencia: a 4 bits ocupa aproximadamente 1 GB de memoria, por lo que puede ejecutarse en telefonos moviles y portatiles convencionales, y ademas esta pensado para ser especializado mediante fine-tuning rapido en una sola GPU.

La relevancia actual del modelo radica en la creciente demanda de asistentes y agentes que funcionen de forma local, sin depender de la nube, con requisitos de privacidad y latencia estrictos. LFM3-1.7B cubre 17 idiomas, incluido el espanol, y se distribuye con licencia LFM 1.0, orientada a usos comerciales con condiciones especificas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-hibrida: 24 capas (13 convoluciones cortas con compuerta, 5 atencion de ventana deslizante, 6 atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens (entrada + salida) |
| Tipos de cuantizacion | 4 bits mencionado en la model card; no se detallan otros formatos en la informacion disponible |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso, polaco (16 idiomas listados en la model card; los tags de Hugging Face listan 17, incluido el propio ingles duplicado en el conteo) |
| Licencia | LFM 1.0 (lfm1.0) |
| Formato de pesos | safetensors (repo de 3,5 GB), compatible con transformers |

## Arquitectura y entrenamiento

LFM3-1.7B emplea una arquitectura tri-hibrida de 24 capas que combina tres tipos de bloques: 13 capas de convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante (sliding-window attention) y 6 capas de atencion global. Esta mezcla busca reducir el coste cuadratico de la atencion completa sin sacrificar la capacidad de modelar dependencias a largo plazo, lo que permite sostener un contexto de 256.000 tokens con un consumo de memoria y computo contenido. El vocabulario es de 128.000 tokens.

El modelo parte de LiquidAI/LFM3-1.7B-Base y ha sido post-entrenado para tareas conversacionales y agenticas, incluyendo el ajuste para arneses de agentes como Hermes Agent, Pi y OpenClaw. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO, por lo que estos datos no estan disponibles en la informacion proporcionada. La familia LFM3 incluye variantes base, de texto, vision, audio, omni y decision, lo que sugiere un esfuerzo coordinado de entrenamiento multimodal en el ecosistema de Liquid AI.

## Capacidades

- Generacion de texto conversacional multi-turno con soporte para contextos de hasta 256.000 tokens.
- Entrenamiento orientado a agentes: razonamiento multi-paso y ejecucion en arneses agenticos (Hermes Agent, Pi, OpenClaw).
- Soporte de tool calling / function calling, segun el enfoque agentico del post-entrenamiento.
- Capacidades multilingues en 16 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Disenado para especializacion mediante fine-tuning rapido en una sola GPU, lo que permite adaptarlo a dominios, formatos y herramientas concretas.
- Modelo exclusivamente de texto (no incluye vision ni audio en esta variante; esas capacidades existen en otras variantes de la familia LFM3).
- No se especifica en la informacion disponible la existencia de un modo de razonamiento explicito (thinking mode) ni de decodificacion especulativa.

## Casos de uso

- Agentes locales en dispositivos moviles: al ocupar aproximadamente 1 GB a 4 bits, el modelo puede ejecutarse en telefonos y portatiles para asistentes personales que gestionan tareas multi-paso sin conexion a la nube, preservando la privacidad del usuario.
- Atencion al cliente automatizada en el borde: con 256.000 tokens de contexto, puede mantener conversaciones multi-turno extensas y recordar el historial completo de la interaccion, lo que resulta util en centros de soporte con requisitos de baja latencia.
- Automatizacion de flujos con tool calling: el post-entrenamiento agentico permite integrarlo en pipelines que invocan APIs, consultan bases de datos o ejecutan acciones en sistemas externos, como la gestion de tickets o la programacion de citas.
- Generacion y revision de codigo en entornos locales: puede asistir en tareas de autocompletado, explicacion de fragmentos y generacion de pruebas dentro de IDE o pipelines de CI/CD, con la ventaja de no enviar codigo propietario a servidores externos.
- Procesamiento de documentos largos: su ventana de 256.000 tokens permite resumir, extraer informacion y responder preguntas sobre contratos, informes o expedientes extensos en una sola pasada.
- Fine-tuning especializado en una sola GPU: equipos con recursos limitados pueden adaptar el modelo a dominios concretos (legal, sanitario, financiero) o a formatos de salida especificos, gracias a su tamano reducido y a la disponibilidad del checkpoint base.
- Asistentes multilingues para mercados locales: al cubrir 16 idiomas, incluidos espanol, portugues y arabe, puede desplegarse en aplicaciones de atencion al cliente o traduccion asistida en regiones con varios idiomas oficiales.
- Prototipado rapido de agentes en investigacion: su compatibilidad con transformers y su bajo requisito de hardware facilitan experimentos de razonamiento multi-paso y evaluacion de estrategias agenticas sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB a 4 bits (segun la model card); en precision completa (fp16/bf16) se estima en torno a 3,5 GB, coherente con el tamano del repositorio de safetensors.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM para cuantizacion de 4 bits; para fp16 se recomienda al menos 6-8 GB. GPU de datacenter como A100 o H100 no son necesarias para inferencia, aunque pueden emplearse para fine-tuning o despliegues de alto throughput.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en telefonos y portatiles segun el fabricante.
- Opciones de despliegue: transformers (libreria nativa), y previsiblemente vLLM, llama.cpp, Ollama y TGI, aunque la informacion proporcionada solo confirma compatibilidad con transformers y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B | 1,73B | 256K | LFM 1.0 | Arquitectura tri-hibrida, orientado a agentes en el borde |
| Qwen2.5-1.5B | 1,5B | 32K (128K en variantes) | Apache 2.0 | Transformer denso, amplia adopcion |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | Transformer denso, ecosistema amplio |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms of Use | Transformer denso, orientado a eficiencia |

La comparativa se limita a datos publicos generales de cada modelo; no se dispone de resultados de benchmarks de LFM3-1.7B para contrastar rendimiento relativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la model card; como todo modelo entrenado con datos web, es probable que herede sesgos de genero, raza, religion y nacionalidad, aunque no se especifican evaluaciones al respecto.
- Riesgo de alucinacion: no se documenta una evaluacion especifica; el modelo puede generar informacion incorrecta o inventada, especialmente en tareas de conocimiento factual o con contextos muy largos.
- Limitaciones de contexto o idioma: aunque soporta 256.000 tokens, el rendimiento en los extremos de la ventana puede degradarse; los 16 idiomas listados no implican la misma calidad en todos ellos, y no se proporcionan metricas por idioma.
- Restricciones de licencia: la licencia LFM 1.0 es una licencia propia de Liquid AI con condiciones especificas para uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de un despliegue en produccion.
- Caveats para produccion: el modelo es exclusivamente de texto; no incluye vision ni audio. La informacion sobre cuantizaciones disponibles y sobre el rendimiento en tool calling no esta detallada en la model card, por lo que conviene validar estos aspectos en el caso de uso concreto.
- Al ser un modelo de 1,73B, su capacidad de razonamiento complejo y de conocimiento enciclopedico es limitada en comparacion con modelos de mayor tamano; su punto fuerte es la eficiencia y la especializacion mediante fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Coleccion LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE

# gagni/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1.730 millones de parametros (1.728.801.536 exactos segun los pesos en safetensors) desarrollado por Liquid AI y publicado como checkpoint post-entrenado de tipo texto. Se trata de la variante conversacional de la familia LFM3, construida sobre el modelo base LiquidAI/LFM3-1.7B-Base. Su propuesta central es ofrecer un modelo de agentes locales y aplicaciones especializadas con una ventana de contexto de 256K tokens, algo poco habitual en la franja de modelos por debajo de 2.000 millones de parametros.

La arquitectura es un transformer hibrido triple (tri-hybrid) de 24 capas que combina 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Este diseno busca reducir el coste computacional y de memoria frente a un transformer denso clasico, manteniendo capacidad de modelado de contexto largo y facilitando el despliegue en dispositivos de borde.

El modelo esta pensado para ejecutarse en local: a 4 bits ocupa aproximadamente 1 GB de memoria, lo que permite su uso en telefonos y portatiles. Ademas, ha sido post-entrenado para arneses de agentes como Hermes Agent, Pi y OpenClaw, y esta disenado para fine-tuning rapido en una sola GPU con el fin de adaptarlo a dominios, formatos y herramientas concretas. Esta ficha describe el checkpoint publicado por el usuario gagni, que replica el modelo LFM3-1.7B de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido triple: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible (la model card menciona 4 bits, ~1 GB; no se listan formatos concretos) |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso, polaco |
| Licencia | lfm1.0 (licencia propia, etiquetada como "other") |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

LFM3-1.7B emplea una arquitectura hibrida de 24 capas que mezcla tres tipos de bloques: 13 capas de convolucion corta con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Esta combinacion permite procesar secuencias largas con un coste menor que un transformer denso con atencion completa en todas las capas, al tiempo que las capas de atencion global preservan el acceso a informacion de todo el contexto. El vocabulario es de 128.000 tokens.

El checkpoint es un modelo post-entrenado de tipo texto, derivado de LiquidAI/LFM3-1.7B-Base. Segun la model card, ha sido post-entrenado para arneses de agentes (Hermes Agent, Pi y OpenClaw), lo que sugiere un ajuste orientado a tareas de agente y uso de herramientas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa. La model card indica que el modelo esta disenado para especializacion mediante fine-tuning rapido en una sola GPU.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de 256K tokens.
- Entrenamiento orientado a agentes: post-entrenado para arneses como Hermes Agent, Pi y OpenClaw.
- Soporte multilingue en 16 idiomas, incluido el espanol.
- Capacidad de adaptacion a dominios, formatos y herramientas mediante fine-tuning en una sola GPU.
- Despliegue en dispositivos de borde: a 4 bits ocupa aproximadamente 1 GB.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Razonamiento multi-paso y modo "thinking": no disponible en la informacion proporcionada.
- Vision y audio: no disponibles en este checkpoint (es un modelo de texto; la familia LFM3 incluye variantes de vision, audio, omni y decision por separado).

## Casos de uso

- Agentes locales en dispositivo: el modelo puede ejecutarse en telefonos y portatiles con unos 1 GB de memoria a 4 bits, lo que permite desplegar asistentes de agente sin conexion a la nube y con contexto de hasta 256K tokens para tareas de larga duracion.
- Atencion al cliente automatizada: con 256K tokens de contexto puede gestionar conversaciones multi-turno extensas y mantener el hilo de historiales largos sin truncar informacion relevante.
- Automatizacion de tareas de agente con herramientas: su post-entrenamiento para arneses como Hermes Agent, Pi y OpenClaw lo hace adecuado para flujos de agente que invocan herramientas y ejecutan pasos encadenados.
- Procesamiento de documentos largos en local: la ventana de 256K tokens permite resumir, extraer informacion o responder preguntas sobre documentos extensos en equipos sin GPU dedicada.
- Fine-tuning especializado en una sola GPU: equipos pequenos pueden adaptar el modelo a dominios concretos (legal, sanitario, soporte interno) o a formatos de salida especificos con un coste de computo reducido.
- Asistentes multilingues: al cubrir 16 idiomas, incluido el espanol, sirve para aplicaciones de traduccion, atencion o generacion de contenido en mercados internacionales.
- Prototipado rapido en entornos de borde: su tamano y su bajo requisito de memoria lo hacen util para validar ideas de producto en hardware consumer antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB a 4 bits (dato de la model card); a 8 bits se situaria en torno a 2 GB y en precision completa (fp16/bf16) alrededor de 3,5 GB, aunque estos ultimos valores son estimaciones no confirmadas en la informacion disponible.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia poder alojarlo en cuantizacion.
- Cabe en GPU consumer: si, segun la model card cabe en telefonos y portatiles a 4 bits.
- Opciones de despliegue: la model card y los tags indican transformers con custom_code y compatibilidad con endpoints; no se confirman vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-1.7B (este checkpoint) | 1,73B | 256K tokens | lfm1.0 | Hugging Face (gagni/LFM3-1.7B) |
| LiquidAI/LFM3-1.7B-Base | 1,73B | 256K tokens | lfm1.0 (segun modelo base) | Hugging Face |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de otros desarrolladores, por lo que la comparativa cuantitativa queda limitada a la variante base de la misma familia.

## Limitaciones y advertencias

- Es un modelo de texto: no procesa vision ni audio, a diferencia de otras variantes de la familia LFM3.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones que cuantifiquen este riesgo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia lfm1.0 es una licencia propia ("other"), por lo que es necesario revisar sus terminos antes de un uso comercial; no se detallan las restricciones concretas en la informacion disponible.
- El checkpoint procede de un autor tercero (gagni) que replica el modelo de Liquid AI; conviene verificar la integridad y procedencia frente al repositorio oficial LiquidAI/LFM3-1.7B.
- El modelo requiere custom_code en transformers, lo que puede complicar la integracion en algunos pipelines.
- No se confirman capacidades de tool calling ni de razonamiento multi-paso explicitas, pese a su orientacion a agentes.
- No se dispone de datos sobre el numero de tokens de entrenamiento ni sobre el proceso de alineacion, lo que limita la evaluacion de su robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gagni/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Licencia: LICENSE (en el repositorio del modelo)

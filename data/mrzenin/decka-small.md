# mrzenin/Decka-Small

## Resumen

Decka-Small es un ajuste fino (fine-tuning) del modelo base LiquidAI/LFM3-1.7B-Base, publicado por el usuario mrzenin en Hugging Face. Se trata de un modelo de generación de texto de 1.728.801.536 parámetros (aproximadamente 1,73B) orientado a conversación y despliegue en el borde (edge), construido sobre la arquitectura tri-híbrida de la familia LFM3 de Liquid AI. El checkpoint es de tipo post-entrenado y solo texto, con una ventana de contexto de 256K tokens (entrada más salida).

El modelo hereda las características del LFM3-1.7B original: una arquitectura de 24 capas que combina 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global, con un vocabulario de 128.000 tokens. Está diseñado para ejecutarse en dispositivos de consumo: a 4 bits ocupa aproximadamente 1 GB de memoria, lo que permite su despliegue en teléfonos y portátiles.

La relevancia de esta ficha radica en que Decka-Small es un ajuste comunitario con cero descargas y cero likes en el momento de la consulta, y su model card no aporta detalles específicos sobre el proceso de ajuste, los datos utilizados ni resultados de evaluación propios. La información técnica disponible proviene casi íntegramente del modelo base LFM3-1.7B, por lo que las capacidades y limitaciones descritas deben interpretarse con cautela respecto al ajuste concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parámetros totales | 1.728.801.536 (≈1,73B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantización | No disponible (el modelo base se distribuye en safetensors; se menciona 4 bits en la documentación del base) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la tri-híbrida de LFM3: 24 capas que intercalan 13 convoluciones cortas con compuerta, 5 capas de atención de ventana deslizante y 6 capas de atención global. Esta combinación busca reducir el coste computacional de la atención completa en contextos largos manteniendo la capacidad de modelar dependencias globales, lo que permite sostener una ventana de 256K tokens con un modelo de solo 1,73B de parámetros. El vocabulario es de 128.000 tokens.

El modelo base LFM3-1.7B-Base fue post-entrenado por Liquid AI para entornos agénticos (Hermes Agent, Pi, OpenClaw) según su model card. Sin embargo, no se dispone de información sobre el proceso de ajuste específico que mrzenin aplicó para producir Decka-Small: no se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra técnica de alineación. Tampoco se detallan innovaciones adicionales introducidas por el ajuste.

## Capacidades

- Generación de texto conversacional en 16 idiomas, incluyendo español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Entrenamiento orientado a agentes: el modelo base fue post-entrenado para arneses agénticos como Hermes Agent, Pi y OpenClaw.
- Ventana de contexto de 256K tokens, adecuada para conversaciones multi-turno prolongadas y documentos extensos.
- Despliegue en el borde: a 4 bits ocupa aproximadamente 1 GB, lo que permite inferencia local en teléfonos y portátiles.
- Especialización mediante fine-tuning en una sola GPU, según la documentación del modelo base.
- Soporte de tool calling / function calling: no confirmado explícitamente para este ajuste concreto; el modelo base está orientado a agentes, pero no se detalla en la información disponible.
- Capacidades de visión, audio o modo thinking: no disponibles en este checkpoint (es un modelo solo texto).

## Casos de uso

- Asistente conversacional local en dispositivos móviles: gracias a su huella de aproximadamente 1 GB a 4 bits, puede integrarse en aplicaciones Android o iOS para mantener conversaciones multi-turno sin conexión, con la ventana de 256K tokens permitiendo historiales largos.
- Agente personal en el portátil: el modelo base fue post-entrenado para arneses agénticos, por lo que Decka-Small puede emplearse como motor de un agente local que ejecute tareas multi-paso con herramientas, siempre que se valide el soporte de tool calling en el ajuste concreto.
- Procesamiento de documentos largos en el borde: con 256K tokens de contexto, puede resumir o extraer información de contratos, informes o transcripciones extensas en un portátil sin GPU dedicada.
- Atención al cliente automatizada en entornos con recursos limitados: su tamaño reducido permite desplegar el modelo en servidores modestos o en el propio dispositivo del usuario, gestionando conversaciones multi-turno con contexto amplio.
- Traducción y generación multilingüe: al cubrir 16 idiomas, puede usarse para traducción asistida o generación de contenido en español, inglés, árabe, chino y otros, aunque la calidad por idioma no está documentada para este ajuste.
- Prototipado e investigación de arquitecturas híbridas: investigadores pueden usar Decka-Small como punto de partida para estudiar el comportamiento de la arquitectura tri-híbrida de LFM3 en tareas conversacionales y ajustes posteriores con una sola GPU.
- Fine-tuning especializado: la documentación del base indica que se puede adaptar a dominios, formatos y herramientas concretos con fine-tuning rápido en una sola GPU, lo que lo hace adecuado para crear asistentes verticales (legal, sanitario, soporte interno).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para Decka-Small. La model card del ajuste no incluye métricas propias, y los resultados del modelo base LFM3-1.7B no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB a 4 bits según la documentación del modelo base; en fp16/bf16 se estima alrededor de 3,5 GB (1,73B parámetros × 2 bytes), aunque este dato no se confirma explícitamente en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU modernas, pero no se documentan recomendaciones oficiales para este ajuste.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM en cuantización de 4 bits; no confirmado para este checkpoint concreto.
- Opciones de despliegue: transformers (librería indicada en la model card); la página de Hugging Face menciona Docker Model Runner. No se confirman vLLM, llama.cpp, Ollama o TGI para este ajuste.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Decka-Small (mrzenin) | 1,73B | 256K | lfm1.0 | Hugging Face, 0 descargas | Ajuste comunitario de LFM3-1.7B-Base |
| LiquidAI/LFM3-1.7B-Base | 1,73B | 256K | lfm1.0 | Hugging Face (oficial) | Modelo base oficial de Liquid AI |
| mrzenin/Decka-4B | No disponible | No disponible | No disponible | Hugging Face | Otro ajuste del mismo autor; sin datos técnicos en la información disponible |
| Alternativas de ~1-2B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

La comparativa se limita a los modelos mencionados en la información disponible. No se dispone de datos de benchmarks ni de especificaciones de alternativas de la misma categoría para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El ajuste no documenta su proceso de entrenamiento: se desconoce el dataset, el número de tokens y las técnicas de alineación, lo que impide evaluar sesgos introducidos por el fine-tuning.
- Riesgo de alucinación: inherente a los modelos de 1,73B; la capacidad de razonamiento y factualidad es limitada en comparación con modelos de mayor tamaño.
- Licencia lfm1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- Modelo con cero descargas y cero likes: no hay evidencia de uso en producción ni validación comunitaria de su calidad.
- Soporte de tool calling no confirmado para este ajuste concreto, aunque el modelo base esté orientado a agentes.
- Capacidades multilingües heredadas del base: la calidad por idioma no está documentada para este ajuste; el rendimiento en idiomas distintos del inglés puede ser inferior.
- Ventana de contexto de 256K tokens: aunque soportada, el rendimiento en contextos muy largos no está verificado para este checkpoint.
- Modelo solo texto: no soporta visión, audio ni otras modalidades.

## Enlaces

- [mrzenin/Decka-Small en Hugging Face](https://huggingface.co/mrzenin/Decka-Small)
- [mrzenin/Decka-4B en Hugging Face](https://huggingface.co/mrzenin/Decka-4B)
- [Modelo base LiquidAI/LFM3-1.7B-Base](https://huggingface.co/LiquidAI/LFM3-1.7B-Base)
- [Blog de lanzamiento de LFM3](https://www.liquid.ai/blog/lfm3)
- [Documentación de LFM](https://docs.liquid.ai/lfm/getting-started/welcome)
- [Consola de Liquid AI](https://console.liquid.ai/dashboard)
- [Playground de Liquid AI](https://playground.liquid.ai/)

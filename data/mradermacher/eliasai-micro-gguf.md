# mradermacher/EliasAI-Micro-GGUF

## Resumen

EliasAI-Micro-GGUF es la versión cuantizada en formato GGUF del modelo EliasAI-Micro, un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B-Base. El trabajo de cuantización lo ha realizado mradermacher, un conocido publicador de cuantizaciones GGUF, mientras que el modelo original pertenece a ETME-TECH. El modelo está orientado a conversación en alemán (etiqueta `german` y `conversational`) y cuenta con aproximadamente 1.006 millones de parámetros totales, lo que lo sitúa en la categoría de modelos "micro" aptos para entornos con recursos limitados.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo conversacional en alemán en hardware de consumo, gracias a la disponibilidad de cuantizaciones desde Q2_K (0,6 GB) hasta f16 (2,1 GB). Al derivar de la familia Qwen3.5, hereda la arquitectura transformer de dicha familia, aunque la información pública disponible sobre el modelo original es muy limitada.

No se dispone de datos publicados sobre longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. La model card se limita a listar los ficheros cuantizados y a remitir a la documentación genérica de uso de GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B-Base; detalles no disponibles) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | aleman (segun etiquetas de la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo original |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen/Qwen3.5-0.8B-Base, por lo que su arquitectura subyacente corresponde a la familia Qwen3.5 en su variante de 0,8 mil millones de parámetros. Se trata de un transformer denso (no se indica que sea MoE) con aproximadamente 1.006 millones de parámetros totales según los datos de safetensors del modelo original. El ajuste fino lo realizó ETME-TECH con un enfoque conversacional y orientado al alemán, según las etiquetas de la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card del repositorio GGUF es puramente operativa: describe los ficheros cuantizados, su tamaño y recomendaciones de uso, sin entrar en detalles de entrenamiento.

## Capacidades

- Generación de texto conversacional en alemán, orientada a diálogo multi-turno.
- Hereda las capacidades del modelo base Qwen3.5-0.8B-Base, aunque no se detallan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: la model card solo declara alemán; el resto no está documentado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Despliegue ligero gracias a las cuantizaciones GGUF de pequeño tamaño (desde 0,6 GB).

## Casos de uso

- Asistente conversacional en alemán para entornos con recursos limitados: con cuantizaciones Q4_K_M de 0,8 GB, el modelo puede ejecutarse en portátiles o mini-PC sin GPU dedicada, gestionando diálogos multi-turno básicos.
- Prototipado rápido de chatbots en alemán: al ser un modelo de ~1B parámetros, permite iterar sobre prompts y flujos conversacionales con latencia baja antes de escalar a modelos mayores.
- Despliegue en el borde (edge computing): su tamaño reducido en Q4_K_S (0,7 GB) lo hace apto para dispositivos con poca memoria, como Raspberry Pi o sistemas embebidos con llama.cpp.
- Filtrado y generación de respuestas en aplicaciones de soporte en alemán: puede emplearse como primera capa de respuesta automática en flujos de atención al cliente donde el coste por inferencia es crítico.
- Generación de texto asistida en herramientas de escritura en alemán: borradores, reformulaciones y respuestas cortas, aprovechando su naturaleza conversacional.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en calidad y velocidad para un caso de uso concreto.
- Base para fine-tuning adicional: al ser Apache 2.0 y de pequeño tamaño, sirve como punto de partida para ajustes específicos de dominio en alemán.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,8 GB para cuantizaciones Q2-Q4; 0,9 GB para Q6_K; 1,2 GB para Q8_0; 2,1 GB para f16 (tamaños de fichero, la VRAM real puede ser algo superior por el contexto y overhead).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060 o superiores para mayor comodidad; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1650, RTX 3050, RTX 4090, etc.), e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio también incluye cuantizaciones tipo imatrix en `mradermacher/EliasAI-Micro-i1-GGUF`. Para el modelo original en safetensors, transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EliasAI-Micro-GGUF | ~1,0 B | no disponible | Apache 2.0 | GGUF | Finetune conversacional en alemán |
| Qwen3.5-0.8B-Base | ~0,8 B | no disponible | no disponible | safetensors | Modelo base del que deriva |
| Modelos alemanes de ~1B (p. ej. variantes de Llama/Qwen ajustadas) | variable | variable | variable | variable | No se dispone de comparación directa documentada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La información pública sobre el modelo original es muy escasa: no hay datos de contexto, dataset ni benchmarks, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación inherente a modelos de ~1B parámetros, especialmente en tareas de razonamiento o conocimiento factual.
- El soporte multilingüe no está documentado más allá del alemán; el rendimiento en castellano u otros idiomas es desconocido.
- No se especifica la longitud de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base Qwen3.5-0.8B-Base, ya que la licencia del finetune no exime de las obligaciones del modelo original.
- Las cuantizaciones de menor calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para producción.
- No hay evidencia de evaluación de sesgos ni de seguridad; en producción conviene añadir filtros y validación humana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EliasAI-Micro-GGUF
- Modelo original: https://huggingface.co/ETME-TECH/EliasAI-Micro
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/EliasAI-Micro-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#EliasAI-Micro-GGUF
- Modelo base Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests

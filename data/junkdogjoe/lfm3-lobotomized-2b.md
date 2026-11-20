# junkdogjoe/LFM3-Lobotomized-2B

## Resumen

LFM3-Lobotomized-2B es un modelo experimental publicado por el usuario junkdogjoe en Hugging Face, derivado del modelo LiquidAI/LFM3-1.7B mediante una fusión de capas de texto con el modelo LFM3-Omni-2B (capas 2 a 21) y un entrenamiento posterior con LoRA. El resultado es un modelo multimodal que, según el autor, conserva capacidades de visión, texto y audio junto con razonamiento, manteniendo el proyector multimodal (mmproj) original intacto. El nombre y la propia model card indican que se trata de un primer proyecto personal, sin pruebas exhaustivas ni validación formal.

El modelo pertenece a la familia LFM3 de Liquid AI, orientada a despliegue en el borde (edge), y se distribuye con licencia lfm1.0 (marcada como "other" en Hugging Face). Cuenta con 2.166.928.384 parámetros reales según los pesos en safetensors, un tamaño de repositorio de 10,6 GB y soporte declarado para 16 idiomas, incluido el castellano.

Su relevancia es limitada y fundamentalmente experimental: no hay benchmarks publicados, el autor reconoce no haberlo probado a fondo y la propia model card contiene advertencias explícitas sobre su carácter incompleto. Resulta útil como caso de estudio de fusión de capas y de aplicación de LoRA sobre un modelo base pequeño, pero no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base LFM3, familia lfm3_omni); fusión de capas de texto con LFM3-Omni-2B (capas 2-21) y LoRA |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (el autor cita Q8_0 y mmproj F16); safetensors en el repo |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de la familia LFM3 de Liquid AI orientada a edge, y le injerta las capas 2 a 21 del modelo LFM3-Omni-2B para incorporar las capacidades multimodales (visión y audio) del modelo Omni. El proyector multimodal (mmproj) del modelo Omni se mantiene sin modificar. Sobre esta fusión se aplica un entrenamiento con LoRA, según describe el autor en la model card.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación técnica más allá de la propia fusión de capas y el uso de LoRA. La model card menciona el uso opcional de un vector de control (control-vector.gguf con escala 0.7) y un presupuesto de razonamiento (reasoning-budget 8192) en llama.cpp, descritos como experimentales y no probados.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM3.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a las capas del modelo Omni y al mmproj original.
- Procesamiento de audio según la model card ("speech"), aunque no se detalla el formato ni la calidad.
- Razonamiento, con soporte para un presupuesto de razonamiento configurable en llama.cpp (reasoning-budget).
- Soporte multilingüe declarado para 16 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Integración con servidores MCP en llama.cpp según los flags de ejemplo de la model card (mcp-servers-config, ui-mcp-proxy), lo que sugiere soporte de tool calling a través de esa infraestructura.
- No se documentan capacidades de agentes multi-paso ni de function calling nativo más allá de lo anterior.

## Casos de uso

- Prototipado de asistentes multimodales en el borde: al derivar de un modelo de 2B orientado a edge, puede ejecutarse en hardware modesto para experimentar con entrada de imagen, texto y audio en una sola pila.
- Investigación sobre fusión de capas: sirve como caso práctico para estudiar cómo se comporta un modelo al injertar capas de un modelo Omni en otro de texto y aplicar LoRA encima.
- Experimentos de razonamiento con presupuesto acotado: el flag reasoning-budget de llama.cpp permite limitar el cómputo de razonamiento, útil para medir el equilibrio entre latencia y calidad en tareas de lógica sencilla.
- Pruebas de integración con MCP: los flags de la model card permiten conectar el modelo a servidores MCP en llama.cpp para evaluar flujos de herramientas en local.
- Evaluación multilingüe comparativa: con 16 idiomas declarados, puede usarse para comparar la degradación de un modelo fusionado frente al base en tareas de traducción o conversación.
- Docencia y demostraciones: su tamaño reducido y su licencia permiten usarlo en talleres sobre cuantización GGUF, LoRA y despliegue con llama.cpp, siempre advirtiendo de su carácter no validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 2.166.928.384 parámetros, en FP16 serían necesarios aproximadamente 4,3 GB solo para pesos; en cuantización Q8_0 alrededor de 2,3 GB; en Q4, en torno a 1,2-1,5 GB. Son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs de consumo con 8 GB o más de VRAM, e incluso en configuraciones de 4-6 GB con cuantizaciones agresivas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores, así como en Apple Silicon con memoria unificada suficiente. No confirmado por el autor.
- Opciones de despliegue: llama.cpp (el autor proporciona flags de ejemplo con GGUF Q8_0 y mmproj F16), y transformers con safetensors (requiere custom_code según los tags). No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-Lobotomized-2B | 2,17 B | no disponible | Sí (texto, imagen, audio) | lfm1.0 | Experimental, sin benchmarks |
| LiquidAI/LFM3-1.7B | 1,7 B (base) | no disponible | No (solo texto) | lfm1.0 | Modelo base oficial |
| LFM3-Omni-2B | no disponible | no disponible | Sí (texto, imagen, audio) | lfm1.0 | Modelo oficial de Liquid AI |

La comparación se limita a los modelos de la propia familia LFM3, ya que no se dispone de datos de rendimiento del modelo fusionado ni de alternativas equivalentes documentadas en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no lo ha probado a fondo ("Haven't fully tested it") y que es su primer proyecto, hecho "for shits and giggles".
- No hay benchmarks ni evaluaciones publicadas; se desconoce su calidad real frente al modelo base.
- La fusión de capas puede degradar capacidades del modelo original de forma impredecible; el propio nombre ("Lobotomized") sugiere pérdida de rendimiento.
- Riesgo elevado de alucinación y de respuestas incoherentes, especialmente en tareas multimodales o de razonamiento prolongado.
- El uso del vector de control y del presupuesto de razonamiento se describe como experimental y no probado.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos, pero al derivar de un modelo base no auditado, hereda los sesgos de este.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- El soporte de audio y visión no está validado ni cuantificado.
- No apto para producción sin una evaluación propia exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/junkdogjoe/LFM3-Lobotomized-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0: incluida en el repositorio como LICENSE
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos del autor.

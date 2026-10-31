# ailexleon/G4-LuneLight-31B-mlx-4Bit

## Resumen

G4-LuneLight-31B-mlx-4Bit es una cuantización a 4 bits en formato MLX del modelo zerofata/G4-LuneLight-31B, publicada por el usuario ailexleon en Hugging Face. El modelo base es un ajuste de 31 mil millones de parámetros orientado a escritura creativa, roleplay, narración de historias y conversación con personajes, construido sobre la familia Gemma 4 (según los tags del repositorio). Esta conversión a MLX está pensada específicamente para ejecutarse de forma eficiente en hardware Apple Silicon (Mac con chips M1/M2/M3/M4), aprovechando la memoria unificada.

La relevancia de esta ficha radica en la combinación de dos factores: un modelo fine-tuned especializado en uso narrativo y de rol, y una cuantización ligera que reduce el tamaño del repositorio a 17,3 GB, haciéndolo manejable en equipos de escritorio de Apple sin necesidad de GPUs de servidor. La conversión se realizó con mlx-lm versión 0.32.2. El repositorio es muy reciente y de autor comunitario, con descargas aún en cero, por lo que no existe documentación de benchmarks ni evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según tags; detalles no disponibles) |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | ingles (según model card; sin datos sobre otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados, formato MLX) |

## Arquitectura y entrenamiento

El modelo base, zerofata/G4-LuneLight-31B, es un modelo de texto generativo de unos 30,7 mil millones de parámetros derivado de la arquitectura Gemma 4. La versión aquí descrita no es un modelo entrenado desde cero, sino una conversión de formato: ailexleon ha tomado los pesos originales y los ha cuantizado a 4 bits usando mlx-lm 0.32.2, la librería estándar para inferencia de LLMs en Apple Silicon. La cuantización a 4 bits reduce el footprint de memoria aproximadamente 8 veces respecto a FP16, a costa de una ligera pérdida de precisión que en modelos narrativos suele ser aceptable.

Sobre el proceso de entrenamiento del modelo base (numero de tokens, composición del dataset, uso de RLHF/DPO o técnicas de destilación) no hay información publicada en la model card disponible. Los tags del repositorio (creative writing, roleplay, conversational, character-rp, storytelling) indican que se trata de un fine-tune orientado a generación narrativa y juego de rol con personajes, un nicho habitual en la comunidad de modelos comunitarios derivados de bases abiertas.

## Capacidades

- Generacion de texto con orientación a escritura creativa, narración de historias (storytelling) y prosa de ficción, según los tags del repositorio.
- Roleplay y conversación con personajes (character-rp): mantención de personalidades y diálogos multi-turno con personajes ficticios.
- Conversación general en inglés.
- Compatibilidad con chat templates: la model card incluye código que comprueba `tokenizer.chat_template`, por lo que soporta el formato de mensajes estándar (roles user/assistant).
- No hay información disponible sobre: tool calling / function calling, capacidades de agentes, razonamiento multi-paso, soporte multilingüe, visión, audio o modo de pensamiento (thinking mode).

## Casos de uso

- Roleplay interactivo con personajes: el modelo está especializado (según sus tags) en mantener conversaciones de rol coherentes con personajes definidos, útil para bots de chat narrativos o aplicaciones de compañía conversacional.
- Escritura de ficcion asistida: generación y continuación de relatos, con el modelo actuando como coautor que propone desarrollos de trama y diálogo en prosa.
- Narracion de historias interactivas: desarrollo de ficción interactiva tipo "elige tu propia aventura", donde el modelo narra y responde a las decisiones del usuario en tiempo real.
- Prototipado en Mac con Apple Silicon: gracias al formato MLX y la cuantización a 4 bits (17,3 GB), puede ejecutarse localmente en Macs con memoria unificada suficiente, ideal para desarrolladores que prueben aplicaciones de chat sin coste de API.
- Generacion de dialogos para videojuegos: creación de líneas de diálogo y personalidades de personajes NPC en fases de preproducción o herramientas de prototipado narrativo.
- Asistente conversacional local y privado: al ejecutarse íntegramente en local, permite chats sin envío de datos a terceros, adecuado para borradores y conversaciones que requieren privacidad.
- Experimentacion y comparacion de fine-tunes narrativos: útil como punto de partida para quien evalúe modelos comunitarios de roleplay sobre la base Gemma 4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es una conversión cuantizada de autor comunitario sin model card con evaluaciones, y tampoco hay datos públicos del modelo base zerofata/G4-LuneLight-31B en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 17,3 GB en 4 bits; en la práctica se recomienda disponer de al menos 20-24 GB de memoria unificada para cargar el modelo más el contexto y la caché KV.
- Hardware objetivo: al ser formato MLX, está diseñado para Apple Silicon (Mac Studio, MacBook Pro, Mac mini con chips M serie). No es adecuado para GPUs NVIDIA sin reconvertir a otro formato (GGUF, GPTQ, etc.).
- Consumer hardware: cabe en Macs de gama alta con 32 GB de memoria unificada con holgura; en equipos con 24 GB debería funcionar con contextos moderados. No hay datos sobre comportamiento en máquinas con 16 GB.
- Despliegue: nativamente mediante mlx-lm (`pip install mlx-lm`, con `load` y `generate` como muestra la model card). Opciones como llama.cpp, Ollama, vLLM o TGI no son compatibles directamente con pesos MLX; requerirían el modelo base en otro formato.
- Latencia y throughput: no disponibles; como referencia general, los modelos de ~30B cuantizados a 4 bits en MLX suelen generar del orden de 10-25 tokens/s en chips Apple Silicon de gama alta, pero esto no está verificado para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion/formato | Licencia | Orientacion | Disponibilidad |
|---|---|---|---|---|---|
| G4-LuneLight-31B-mlx-4Bit (este) | 30,7B | 4 bits, MLX | Apache 2.0 | Escritura creativa, roleplay | Hugging Face, recien publicado |
| Gemma 3 27B (base, Google) | 27B | Múltiples (incl. 4 bits) | Licencia Gemma (restricciones) | General, multimodal | Ampliamente disponible |
| Qwen 2.5 32B | 32,5B | Múltiples (GGUF, GPTQ, MLX) | Apache 2.0 | General, codigo, razonamiento | Ampliamente disponible |

Notas: los modelos base Gemma 3 y Qwen 2.5 son alternativas generalistas de tamaño comparable; G4-LuneLight-31B se diferencia por ser un fine-tune comunitario especializado en narrativa y roleplay, con licencia Apache 2.0 más permisiva que la licencia Gemma original. No hay datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente el inglés; el rendimiento en castellano no está documentado y probablemente sea inferior o inconsistente.
- Sin benchmarks: al tratarse de un fine-tune comunitario sin evaluaciones publicadas, no hay garantías de calidad, coherencia factual ni seguridad; conviene probarlo antes de cualquier uso serio.
- Riesgo de alucinacion: como todo LLM generativo, puede inventar hechos; en tareas narrativas esto es asumible, pero no es fiable para respuestas factuales.
- Cuantizacion: la conversión a 4 bits introduce una pérdida de precisión respecto al modelo original en FP16, que puede notarse en prosa muy compleja o seguimiento de instrucciones delicado.
- Contexto: la longitud de ventana no está documentada; no se puede garantizar el manejo de conversaciones muy largas.
- Herramientas y agentes: no hay evidencia de soporte de tool calling ni de capacidades agénticas; no es adecuado para pipelines que dependan de ellas sin verificación previa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar también la licencia del modelo base (zerofata/G4-LuneLight-31B), que hereda de Gemma y podría tener términos propios adicionales no visibles en esta ficha.
- Ecosistema: los pesos MLX solo funcionan en el ecosistema Apple; para despliegue en servidores Linux con GPUs NVIDIA hay que partir del modelo base en otro formato.
- Procedencia: es una conversión de un tercero (ailexleon) con cero descargas registradas; no hay garantía de mantenimiento ni de corrección de la cuantización más allá de la herramienta mlx-lm usada.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/ailexleon/G4-LuneLight-31B-mlx-4Bit
- Modelo base: https://huggingface.co/zerofata/G4-LuneLight-31B
- Libreria mlx-lm (PyPI): https://pypi.org/project/mlx-lm/
- Documentacion de MLX: https://ml-explore.github.io/mlx/

No se han encontrado enlaces a papers, blogs oficiales ni demos en la informacion disponible.

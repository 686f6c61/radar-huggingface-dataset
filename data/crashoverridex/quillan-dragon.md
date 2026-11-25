# CrashOverrideX/Quillan-Dragon

## Resumen

Quillan-Dragon es un modelo de generacion de texto de aproximadamente 1B parametros publicado por el usuario CrashOverrideX en Hugging Face. Se distribuye como un derivado de `tiiuae/Falcon3-1B-Instruct`, el modelo instructivo de la familia Falcon3 de TII, empaquetado en formato GGUF y preparado para su ejecucion en Ollama. Segun la model card, forma parte de un paquete de tres modelos denominado Quillan, junto a Quillan-Ronin (Flagship) y Quillan-Ronin-Mini, y se presenta como la variante "Dragon" de esa flota.

El modelo tiene 1.669.408.768 parametros segun los pesos en safetensors y un repositorio de 7,8 GB, coherente con la publicacion de varias cuantizaciones GGUF. La model card indica explicitamente que Quillan-Dragon no es el resultado de la fusion de cuatro donantes que caracteriza a los otros miembros del paquete, sino una construccion distinta basada en Falcon3 con un mensaje de sistema de Ollama que ejecuta el system prompt de Quillan. La licencia declarada es Apache-2.0 y el unico idioma listado es el ingles.

Su relevancia practica es limitada: se trata de un modelo pequeno, con 286 descargas y un unico "like", sin resultados de benchmarks propios publicados en la informacion disponible, y cuya model card dedica mas espacio a aclaraciones de linaje y a desmentir lecturas erroneas de tablas de rendimiento que a documentar capacidades tecnicas. Resulta util como ejemplo de empaquetado de un modelo base abierto con una capa de personalidad via prompt de sistema, pero no como referencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Falcon3-1B-Instruct; detalles no disponibles) |
| Parametros totales | 1.669.408.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 7,8 GB); safetensors referenciados en los metadatos de parametros |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su origen: el modelo base es `tiiuae/Falcon3-1B-Instruct`, un transformer decoder-only de la familia Falcon3. No se especifican en la informacion proporcionada el numero de capas, dimensiones ocultas, mecanismo de atencion ni la composicion del dataset de entrenamiento del modelo base. Tampoco se documenta si Quillan-Dragon anade entrenamiento adicional, fine-tuning o ajuste por preferencias sobre Falcon3.

Segun la model card, la construccion de Quillan-Dragon consiste en Falcon3 con un mensaje de sistema de Ollama que ejecuta el system prompt de Quillan. Es decir, la "personalidad" del modelo reside en gran medida en la capa de prompt de sistema y no en una modificacion de pesos documentada. La model card menciona ademas trabajo en curso sobre "group-contribution cross-match" de los donantes del paquete, pero no aporta detalles tecnicos sobre ese proceso ni sobre su impacto en este checkpoint concreto.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Falcon3-1B-Instruct.
- Instrucciones multi-turno mediante el formato instructivo del modelo base.
- Comportamiento guiado por un system prompt extenso (el "Quillan system prompt") inyectado a traves del mensaje de sistema de Ollama.
- No se documenta soporte de tool calling o function calling en la informacion disponible.
- No se documenta soporte de agentes o razonamiento multi-paso mas alla de lo que ofrece el modelo base.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.
- No se documentan capacidades de vision, audio ni modos de razonamiento extendido (thinking).

## Casos de uso

- Prototipado rapido de asistentes conversacionales en local: al estar empaquetado como GGUF y disponible en Ollama, permite levantar un endpoint de chat en ingles con un solo comando, adecuado para pruebas de concepto en equipos con hardware modesto.
- Experimentacion con system prompts de personalidad: el modelo sirve para estudiar como un prompt de sistema largo y estructurado condiciona las respuestas de un modelo de 1B, util en investigacion sobre alineamiento por prompt.
- Educacion y demostraciones: su tamano (~1B) y su licencia Apache-2.0 lo hacen apropiado para talleres donde se ensena a desplegar modelos abiertos con Ollama sin requerir GPUs de gama alta.
- Generacion de texto auxiliar de bajo coste: redaccion de borradores, resumenes cortos o respuestas plantilla en ingles donde no se requiere alta precision y prima el coste por token.
- Base para fine-tuning ligero: al derivar de Falcon3-1B-Instruct con licencia permisiva, puede servir como punto de partida para ajustes especificos en dominios concretos.
- Evaluacion comparativa de empaquetados: util para comparar el comportamiento de un mismo modelo base servido via Ollama frente a otras rutas de despliegue (llama.cpp, vLLM) en pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente que la tabla del 95-100% del README raiz corresponde a "Track A" (el Quillan Cognitive Harness sobre un modelo base de terceros) y no a este modelo, y que los resultados propios de la flota son las tablas "Tripartite", mas modestas, con celdas de examen pendientes de re-test. No se ofrecen cifras concretas para Quillan-Dragon.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB en cuantizacion Q4, 2-2,5 GB en Q8 y en torno a 3,5 GB en FP16, calculado a partir de los 1,67B parametros.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. En entornos de servidor, una T4 o L4 bastan; A100 y H100 no aportan ventaja relevante para este tamano.
- Cabe en GPU consumer: si, incluidas GPUs de gama de entrada con 4-6 GB de VRAM y en CPU via llama.cpp.
- Opciones de despliegue: Ollama (via oficial segun la model card), llama.cpp, y potencialmente otros runners compatibles con GGUF. No se documenta soporte especifico de vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Quillan-Dragon | 1,67B | no disponible | Apache-2.0 | Hugging Face, Ollama |
| tiiuae/Falcon3-1B-Instruct | ~1B | no disponible en esta ficha | Apache-2.0 (modelo base) | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | no disponible en esta ficha | Apache-2.0 | Hugging Face, Ollama |
| Llama 3.2 1B Instruct | ~1,2B | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face, Ollama |

Quillan-Dragon comparte arquitectura y origen con Falcon3-1B-Instruct, del que se diferencia principalmente por el empaquetado GGUF y la capa de system prompt. Frente a alternativas como Qwen2.5-1.5B-Instruct o Llama 3.2 1B, su principal desventaja es la ausencia de benchmarks publicados y de documentacion tecnica detallada; su ventaja es la licencia Apache-2.0 sin restricciones adicionales conocidas y la integracion directa con Ollama.

## Limitaciones y advertencias

- No hay benchmarks publicados que permitan validar su calidad; la model card desmiente explicitamente que las cifras altas del README raiz correspondan a este modelo.
- La model card esta centrada en aclaraciones de linaje y advertencias de interpretacion, lo que dificulta evaluar el modelo tecnicamente.
- Sesgos conocidos: no documentados; al derivar de Falcon3-1B-Instruct, hereda los sesgos de su dataset de entrenamiento, no detallado en la informacion disponible.
- Riesgo de alucinacion: elevado en modelos de ~1B, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada, lo que complica planificar casos de uso con conversaciones largas.
- La "personalidad" del modelo depende de un system prompt, lo que implica que su comportamiento puede degradarse si el prompt no se inyecta correctamente en el runner de destino.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor no ofrece garantias ni soporte; el proyecto depende de un unico mantenedor con muy poca traccion (286 descargas).
- La model card incluye referencias a un marco etico basado en el periodo Edo y el bushido; conviene tratarlo como contexto de diseno del prompt, no como validacion tecnica.

## Enlaces

- Hugging Face: https://huggingface.co/CrashOverrideX/Quillan-Dragon
- Ollama: https://ollama.com/crashoverridex/Quillan-Dragon
- Sitio del proyecto: https://leeex1.github.io/Quillan-Ronin/
- GitHub: https://github.com/leeex1/Quillan-Ronin
- DeepWiki: https://deepwiki.com/leeex1/Quillan-Ronin
- Grokipedia: https://grokipedia.com/page/Quillan-Ronin
- X (Twitter): https://x.com/Crashoverride_X
- Discord: https://discord.gg/JcFqvWKkRv
- GoFundMe: https://gofund.me/a0667596d
- Modelo base: https://huggingface.co/tiiuae/Falcon3-1B-Instruct

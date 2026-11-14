# Mawdistical-S1/Synica-27B

## Resumen

Synica-27B es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B publicado por el usuario Mawdistical-S1 en Hugging Face. Se trata de un modelo de generacion de texto y de imagen-a-texto (image-text-to-text) orientado a rol conversacional (roleplay), con etiquetas que declaran contenido NSFW y explicito, ademas de tematicas furry/anthro y "mixed-AI". El modelo cuenta con 27.781.427.952 parametros segun los pesos en safetensors y un repositorio de 55,6 GB.

El modelo se distribuye bajo licencia "other" y con acceso restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo. Esta etiquetado como "not-for-all-audiences", lo que refleja que su uso previsto incluye contenido adulto y conversaciones sin filtros. Su relevancia actual es limitada a nichos muy concretos de generacion creativa y roleplay, no a tareas de produccion generalistas.

No se dispone de informacion publica sobre la composicion del dataset de ajuste, el proceso de entrenamiento ni resultados de evaluacion. La ficha se limita a los datos verificables del repositorio y a las inferencias razonables a partir del modelo base declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base Qwen/Qwen3.8-27B, un transformer decoder-only de aproximadamente 27,8 mil millones de parametros. No se ha publicado informacion sobre la arquitectura interna especifica (numero de capas, dimensiones ocultas, mecanismo de atencion, uso de GQA/MQA, etc.) ni sobre si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, el repositorio no documenta el numero de tokens utilizados, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF, DPO o similares. Las etiquetas del modelo indican un ajuste orientado a roleplay, contenido explicito/NSFW y tematicas furry/anthro, lo que sugiere un dataset de conversaciones sinteticas o curadas para esos fines, pero no hay confirmacion oficial. No se dispone de informacion sobre el proceso de alineacion ni sobre posibles filtros de seguridad aplicados.

## Capacidades

- Generacion de texto conversacional orientada a roleplay multi-turno.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text declarado en las etiquetas).
- Generacion de contenido explicito y NSFW (declarado explicitamente en las etiquetas del repositorio).
- Conversacion tematica furry/anthro y "mixed-AI".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking, vision o audio: no disponible (solo se declara image-text-to-text, sin detalles).

## Casos de uso

- Roleplay conversacional sin filtros: el modelo esta ajustado para mantener personajes y tramas multi-turno con contenido adulto, adecuado para plataformas de ficcion interactiva que requieran este tipo de contenido y cumplan la normativa aplicable.
- Generacion de ficcion explicita: util para autores que necesiten borradores de narrativa adulta con coherencia de personaje, dado el ajuste especifico del modelo.
- Comunidades furry/anthro: generacion de dialogos y escenarios con terminologia y convenciones propias de ese nicho, reflejadas en las etiquetas del modelo.
- Prototipado de chatbots de personaje: el modelo puede servir como base para experimentar con sistemas de chat con personalidad definida, aunque su licencia y acceso restringido limitan su uso comercial.
- Investigacion sobre alineacion y seguridad: util como caso de estudio de modelos ajustados para contenido NSFW y de como se comportan frente a politicas de moderacion.
- Generacion imagen-a-texto en contextos creativos: la etiqueta image-text-to-text sugiere capacidad de describir o continuar conversaciones a partir de imagenes, aplicable a herramientas de narracion visual para adultos.
- Experimentacion con "mixed-AI": la etiqueta sugiere interacciones entre agentes o contenido generado por IA mixta, util en entornos de investigacion sobre dialogos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 64-80 GB de VRAM.
- VRAM estimada en cuantizacion 8 bits: alrededor de 28-30 GB, viable en una A100 40GB o H100.
- VRAM estimada en cuantizacion 4 bits: alrededor de 14-16 GB, potencialmente viable en RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; A100 40GB o L40S para 8 bits; RTX 4090/3090 para cuantizacion agresiva.
- Cabe en GPU consumer: si, en cuantizaciones de 4 bits en RTX 4090/3090, con posibles limitaciones de contexto.
- Opciones de despliegue: transformers (declarado), vLLM, TGI y llama.cpp si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Enfoque |
|---|---|---|---|---|---|
| Synica-27B | 27,8B | no disponible | other | gated | Roleplay NSFW, furry/anthro |
| Qwen3.8-27B (base) | ~27,8B | no disponible | no disponible | no disponible | Modelo generalista |
| Alternativas de roleplay de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas especificas de la misma categoria (roleplay NSFW de ~27B) en parametros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- Contenido NSFW y explicito: el modelo esta disenado para generar material adulto, lo que exige verificacion de edad y cumplimiento normativo en cualquier despliegue.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado y su redistribucion.
- Licencia "other": las condiciones no estan detalladas en la informacion disponible; es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Sesgos: al ser un ajuste fino sobre un modelo base no documentado, puede heredar sesgos del base y anadir sesgos del dataset de roleplay (estereotipos de personaje, contenido explicito no filtrado).
- Riesgo de alucinacion: no cuantificado; en roleplay el riesgo se manifiesta como incoherencia de personaje o perdida de contexto en conversaciones largas.
- Sin benchmarks: no hay evidencia publica de calidad, lo que desaconseja su uso en produccion sin evaluacion previa.
- Contexto no documentado: se desconoce la ventana real, lo que complica el diseno de aplicaciones multi-turno largas.
- Etiqueta "not-for-all-audiences": no apto para entornos laborales, educativos o publicos sin moderacion.

## Enlaces

- Hugging Face: https://huggingface.co/Mawdistical-S1/Synica-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.

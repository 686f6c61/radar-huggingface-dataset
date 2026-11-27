# ProfessorCEO/KORA-v1

## Resumen

KORA-v1 es un modelo de generación de texto publicado por el usuario ProfessorCEO bajo la marca "Kontyra Ecosystem". Se presenta como el motor de inteligencia "soberana" del ecosistema de desarrollo Kontyra (DevOS Cloud IDE, Kontyra Accounts & SSO, API Gateway y Kora Studio). El modelo emplea una arquitectura transformer denominada "NanoKora Transformer Engine", con RoPE, RMSNorm y SwiGLU, y una longitud de contexto de 4.096 tokens.

El dato objetivo más relevante es su tamaño: 3.821.079.552 parámetros en formato safetensors (aproximadamente 3,8 mil millones), con un repositorio de 2,7 GB. El autor distribuye además una cuantización Q4_K_M en GGUF de unos 2,32 GB, orientada a inferencia rápida en CPU y GPU. El modelo está etiquetado únicamente para inglés y su licencia es la Kontyra Public License (KPL-1.0), una licencia propia de tipo "other".

La relevancia de esta ficha es limitada pero informativa: se trata de un modelo de nicho, con cero descargas en el momento de la consulta, sin benchmarks publicados y con documentación escasa. Resulta útil como ejemplo de modelo pequeño orientado a un ecosistema cerrado y como caso de estudio de licencias propietarias en Hugging Face, pero no como alternativa generalista a modelos abiertos consolidados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "NanoKora Transformer Engine" (RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 3.821.079.552 (~3,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos safetensors en el repo |
| Idiomas soportados | ingles (en) |
| Licencia | Kontyra Public License (KPL-1.0), licencia propia de tipo "other" |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La model card describe un transformer denominado NanoKora Transformer Engine que emplea embeddings posicionales rotatorios (RoPE), normalización RMSNorm y activación SwiGLU, una combinación estándar en los transformers decoder-only modernos. El contexto declarado es de 4.096 tokens. No se especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni si se trata de un modelo denso o con mezcla de expertos; el recuento de parámetros (3,8 B) es compatible con un modelo denso de tamaño pequeño-medio.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones como decodificación especulativa o atención lineal. La model card menciona que el modelo está "optimizado para navegación de plataforma sin alucinaciones, ejecución autónoma de tareas y memoria contextual profunda", pero no aporta evidencia técnica ni metodología que respalde esas afirmaciones.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es text-generation y las etiquetas incluyen "conversational".
- Razonamiento y ejecución de tareas: el autor afirma que está orientado a "ejecución autónoma de tareas", aunque no se documenta soporte explícito de tool calling ni de function calling.
- Navegación de plataforma: según la model card, está optimizado para guiar a usuarios dentro del ecosistema Kontyra (DevOS, SSO, API Gateway, Kora Studio).
- Memoria contextual: se anuncia "memoria contextual profunda" dentro de la ventana de 4.096 tokens.
- Multilingüismo: no disponible; solo se declara inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Asistente integrado en DevOS Cloud IDE: el modelo podría sugerir comandos o guiar la navegación del IDE dentro del ecosistema Kontyra, aprovechando su supuesta especialización en la plataforma. Su tamaño de 3,8 B y la cuantización Q4_K_M permiten ejecutarlo en infraestructura modesta.
- Soporte de onboarding de desarrolladores: con 4.096 tokens de contexto puede mantener conversaciones multi-turno breves para explicar el registro, SSO y configuración de cuentas Kontyra.
- Automatización de tareas repetitivas en el API Gateway: generación de plantillas de configuración o de llamadas a la API descritas en lenguaje natural, siempre que se valide la salida antes de aplicarla.
- Chatbot de documentación interna: respuestas sobre el ecosistema Kontyra a partir de contextos inyectados en el prompt, limitado a fragmentos de hasta unos 4.000 tokens.
- Prototipado rápido en local: al distribuirse en GGUF Q4_K_M (2,32 GB), es viable probarlo en un portátil con CPU o una GPU de consumo para experimentar con el modelo sin infraestructura dedicada.
- Evaluación de licencias propietarias: útil como caso práctico para equipos jurídicos y de ingeniería que analicen las implicaciones de adoptar modelos con licencias propias como KPL-1.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (2,32 GB de pesos) se puede ejecutar en aproximadamente 3-4 GB de VRAM o RAM; en safetensors a precisión completa (FP16) se necesitarían del orden de 7,6 GB solo para pesos, más overhead de contexto y KV cache.
- GPU recomendadas: no hay datos del autor. Por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs de datacenter como A100 o H100, aunque para un modelo de 3,8 B estas últimas estarían sobredimensionadas.
- GPU de consumo: sí, cabe en GPUs consumer con 6-8 GB o más en cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp y Ollama para el GGUF; vLLM o TGI para los pesos safetensors si el formato es compatible con los configs estándar (no confirmado). La etiqueta "endpoints_compatible" sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KORA-v1 | ~3,8 B | 4.096 | en | KPL-1.0 (propia) | Hugging Face, 0 descargas |
| Qwen2.5-3B | ~3,1 B | 32.768 | multilingue | Apache 2.0 | Amplia, muy usado |
| Llama 3.2 3B | ~3,2 B | 131.072 | multilingue | Llama 3.2 Community License | Amplia, muy usado |
| Phi-3.5-mini | ~3,8 B | 131.072 | multilingue | MIT | Amplia, muy usado |

La comparación se basa únicamente en tamaño y categoría; no hay benchmarks de KORA-v1 que permitan comparar rendimiento real. Frente a las alternativas, KORA-v1 ofrece un contexto mucho menor (4.096 frente a 32.000-131.000 tokens), solo inglés, una licencia propietaria y una adopción prácticamente nula.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; un modelo entrenado sin información pública sobre su dataset no permite evaluar sesgos.
- Riesgo de alucinación: la model card afirma estar "optimizado contra alucinaciones", pero no hay evidencia ni benchmarks que lo respalden; debe tratarse como una afirmación de marketing.
- Contexto limitado: 4.096 tokens es una ventana pequeña para tareas de código o documentación extensa.
- Idioma: solo inglés declarado; no hay garantías de calidad en castellano u otros idiomas.
- Licencia: KPL-1.0 es una licencia propia de tipo "other" con enlace a kontyra.name.ng/legal; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones no estándar.
- Madurez: cero descargas y un único "like" en el momento de la consulta; sin benchmarks, sin paper y con documentación mínima. No es recomendable para producción sin una evaluación propia exhaustiva.
- Fecha de creación: la model card indica 2026-06-11, una fecha futura respecto a la mayoría de referencias; conviene verificar la autenticidad y el mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProfessorCEO/KORA-v1
- Ecosistema Kontyra: https://kontyra.name.ng
- Licencia KPL-1.0: https://kontyra.name.ng/legal

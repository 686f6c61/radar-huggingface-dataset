# Austriani/Erebus-RP-Engine-26B-A4B-ik_llama.cpp

## Resumen

Erebus-RP-Engine-26B-A4B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el usuario Austriani, derivado mediante fusión (merge) del modelo base Naphula/Erebus-RP-Engine-26B-A4B. Está especializado en roleplay de fantasía oscura (dark-fantasy, grimdark), roleplay de combate y contenido sin censura, incluyendo material NSFW, y mantiene capacidades multimodales de imagen-texto según la pipeline declarada (image-text-to-text). La arquitectura de referencia es Gemma 4 con 26B de parámetros totales y aproximadamente 4B activos (designación A4B), organizada en 128 expertos.

Esta ficha corresponde concretamente a la variante cuantizada publicada bajo el identificador `Austriani/Erebus-RP-Engine-26B-A4B-ik_llama.cpp`, empaquetada en formato GGUF y calibrada con imatrix (v3-calibration) para su uso con el fork ik_llama.cpp. El modelo se distribuye bajo licencia Apache 2.0 y declara únicamente el idioma inglés.

Su relevancia actual radica en que ofrece un modelo MoE de 26B con solo ~4B activos, lo que reduce el coste de inferencia frente a un denso equivalente, y en que está pre-cuantizado específicamente para un runtime de bajo nivel (ik_llama.cpp) orientado a despliegues locales. No obstante, la información pública disponible es muy limitada: la model card está mayoritariamente compuesta por estilos CSS y no documenta datos de entrenamiento, benchmarks ni especificaciones detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Gemma 4; 128 expertos |
| Parametros totales | 26B |
| Parametros activos | ~4B (designación A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado con imatrix (v3-calibration); niveles IQK/Trellis-Quant/MaxOptima citados en tags, sin detalle de bits |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con 128 expertos, construido sobre la familia Gemma 4, con 26B de parámetros totales y aproximadamente 4B activos por token. No se especifica en la información disponible el número de capas, dimensión oculta, tamaño de vocabulario ni el mecanismo exacto de enrutamiento de expertos.

El proceso de construcción es una fusión de modelos (merge) realizada con mergekit y mergekit-exp, empleando la técnica MoE-DELLA según los tags del repositorio. El modelo base es Naphula/Erebus-RP-Engine-26B-A4B, del que esta publicación es un finetune/derivado cuantizado. No se documentan en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La variante aquí descrita incorpora una calibración imatrix (v3-calibration) aplicada durante la cuantización para mejorar la fidelidad de los pesos GGUF.

## Capacidades

- Generación de texto orientada a roleplay de fantasía oscura y grimdark, con estilo narrativo y de combate.
- Contenido sin censura, incluyendo material NSFW (el repositorio está marcado como no apto para todas las audiencias).
- Procesamiento multimodal imagen-texto según la pipeline declarada (image-text-to-text); el detalle de resolución, parcheado o encoder visual no está disponible.
- Conversación multi-turno para sesiones de roleplay prolongadas (la longitud de contexto no está documentada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Roleplay narrativo de fantasía oscura: el modelo está afinado específicamente para mantener tono grimdark, coherencia de personaje y continuidad narrativa en sesiones multi-turno, lo que lo hace adecuado para motores de juego de rol por texto.
- Simulación de combate por turnos: los tags `combat-rp` indican especialización en describir acciones de combate, con capacidad de narrar intercambios de golpes y consecuencias dentro de una escena.
- Generación de ficción interactiva sin restricciones de contenido: útil para proyectos de narrativa adulta donde otros modelos censuran; requiere control de acceso y verificación de edad en el producto final.
- Motores de rol local con ik_llama.cpp: al estar cuantizado para ese runtime, puede desplegarse en estaciones de trabajo sin GPU de datacenter, aprovechando que solo ~4B parámetros están activos por token.
- Creación de personajes y diálogos para videojuegos: generación de respuestas de NPC con personalidad consistente en entornos de fantasía oscura.
- Prototipado de asistentes de escritura creativa: ayuda a autores a explorar escenas de tono adulto o violento que los modelos alineados rechazan.
- Experimentación con fusión de modelos MoE: sirve como caso de estudio de merges con mergekit y MoE-DELLA para investigadores interesados en combinar expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; para un MoE de 26B en GGUF, la VRAM necesaria depende del nivel de cuantización (a 4 bits, del orden de 13-16 GB de pesos, estimación orientativa no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar uso en GPUs con 24 GB o más (RTX 3090/4090, A6000, A100), aunque la información no lo confirma.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 con cuantizaciones de 4 bits, sujeto a verificación empírica; no confirmado.
- Opciones de despliegue: ik_llama.cpp (runtime objetivo declarado); compatibilidad con llama.cpp, Ollama, vLLM o TGI no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Erebus-RP-Engine-26B-A4B (este) | 26B totales / ~4B activos | no disponible | Apache 2.0 | MoE Gemma 4, roleplay grimdark, multimodal, GGUF para ik_llama.cpp |
| Naphula/Erebus-RP-Engine-26B-A4B | 26B totales / ~4B activos | no disponible | no disponible | Modelo base del que deriva esta cuantización |
| Alternativas comparables | no disponible | no disponible | no disponible | No se dispone de datos de modelos equivalentes en la información proporcionada |

## Limitaciones y advertencias

- La model card pública contiene principalmente CSS y no documenta datos de entrenamiento, evaluación ni hiperparámetros; la trazabilidad técnica es muy baja.
- Contenido NSFW y potencialmente violento: el repositorio está marcado como no apto para todas las audiencias; requiere filtrado y control de acceso en producción.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas sin pruebas empíricas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o legislación sobre material adulto; la responsabilidad recae en el desplegador.
- Al ser una fusión de modelos, pueden aparecer inconsistencias de comportamiento entre expertos y degradación en tareas fuera del dominio de roleplay.
- El formato GGUF para ik_llama.cpp limita la portabilidad a otros runtimes sin reconversión.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Austriani/Erebus-RP-Engine-26B-A4B-ik_llama.cpp
- Modelo base: https://huggingface.co/Naphula/Erebus-RP-Engine-26B-A4B
- Repositorio de mergekit: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

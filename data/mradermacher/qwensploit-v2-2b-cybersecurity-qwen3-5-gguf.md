# mradermacher/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit-V2-2B-CyberSecurity-Qwen3.5 es un modelo de lenguaje de 1.942.653.248 parámetros (aproximadamente 2B) especializado en ciberseguridad, desarrollado por el usuario xtools-at y cuantizado en formato GGUF por mradermacher. Se trata de un ajuste fino (fine-tuning) sobre una base de la familia Qwen 3.5, orientado a tareas de red team, penetration testing, investigación de vulnerabilidades, análisis de seguridad y resolución de retos CTF. El modelo incorpora además capacidades multimodales, como demuestra la presencia de ficheros mmproj (proyección multimodal) entre las cuantizaciones publicadas.

La relevancia de este modelo radica en su especialización vertical: frente a modelos generalistas, ha sido entrenado sobre múltiples datasets de instrucciones y razonamiento en ciberseguridad (OffsecCyber, Cybersecurity-ShareGPT, Trendyol Cybersecurity, CyberSec-Reasoning-Premium, entre otros), lo que lo hace potencialmente útil para asistentes de seguridad ofensiva y defensiva. Su tamaño compacto (2B) permite desplegarlo en hardware de consumo, algo poco habitual en modelos especializados de este dominio.

El repositorio es una cuantización estática del modelo original de xtools-at, con licencia "other" (no especificada en detalle) y soporte exclusivo del idioma inglés. El modelo fue creado en noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes, por lo que se trata de una publicación muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según tags del modelo); detalles exactos no disponibles |
| Parametros totales | 1.942.653.248 (aproximadamente 2B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura Qwen 3.5 (tags `qwen3_5`, `qwen3.5`), un transformer de aproximadamente 2B parámetros. El ajuste fino se realizó mediante LoRA y PEFT sobre el modelo base `xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5`, según los tags `lora`, `peft` y `unsloth`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Los datasets de entrenamiento declarados son: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. Este conjunto sugiere un enfoque mixto de instrucciones de ciberseguridad, razonamiento y trazas de razonamiento de modelos superiores. La presencia de ficheros mmproj indica soporte multimodal (visión), aunque no se detalla la arquitectura del componente visual.

## Capacidades

- Generación de texto especializada en ciberseguridad: análisis de vulnerabilidades, explicación de exploits, redacción de informes de seguridad y resolución de retos CTF.
- Razonamiento multi-paso (tag `reasoning`), con posible modo de pensamiento heredado de la base Qwen 3.5.
- Capacidades multimodales: la presencia de ficheros mmproj (f16 y Q8_0) sugiere soporte de entrada de imágenes, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Ajuste por instrucciones (instruction-tuning) orientado a tareas ofensivas y defensivas de seguridad.

## Casos de uso

- Asistente de pentesting: el modelo puede generar y explicar técnicas de explotación, comandos de reconocimiento y cadenas de ataque en entornos autorizados, aprovechando su entrenamiento en datasets como OffsecCyber.
- Análisis de vulnerabilidades: dado un fragmento de código o una descripción de sistema, el modelo puede razonar sobre posibles fallos de seguridad y proponer mitigaciones, gracias a su especialización en razonamiento de ciberseguridad.
- Resolución de retos CTF: adecuado para competiciones de seguridad, donde puede interpretar enunciados, razonar sobre binarios o tráfico de red y proponer soluciones paso a paso.
- Redacción de informes de seguridad: generación de hallazgos, descripciones de riesgo y recomendaciones en inglés para auditorías y evaluaciones.
- Formación y concienciación: creación de escenarios de phishing simulado, explicaciones de vectores de ataque y material didáctico para equipos de seguridad.
- Análisis de imágenes en contexto de seguridad: gracias al componente multimodal, podría emplearse para interpretar capturas de pantalla de herramientas de seguridad o diagramas de red, aunque su alcance exacto no está documentado.
- Apoyo en threat intelligence: resumen y correlación de indicadores y descripciones de amenazas en texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,4 GB para cuantizaciones Q2_K a Q4_K_M; 1,5-1,7 GB para Q5_K a Q6_K; 2,2 GB para Q8_0; 4,0 GB para f16. Añadir 0,5-0,8 GB si se usa el componente multimodal (mmproj).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); para f16 se recomienda al menos 6 GB. En entornos profesionales, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs modernas, incluso en cuantizaciones altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el modelo base también es compatible con transformers y text-generation-inference según tags.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit-V2-2B-CyberSecurity-Qwen3.5 | ~2B | No disponible | Ciberseguridad | other | GGUF, safetensors |
| Qwen 3.5 base (2B) | ~2B | No disponible | Generalista | No disponible | safetensors |
| Modelos especializados en ciberseguridad de mayor tamaño | No disponible | No disponible | Ciberseguridad | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al entrenarse sobre datasets de ciberseguridad ofensiva puede reproducir sesgos o contenido sensible de esas fuentes.
- Riesgo de alucinación: elevado en modelos de 2B, especialmente en la generación de comandos, exploits o referencias técnicas que pueden ser incorrectas o inventadas.
- Limitaciones de contexto o idioma: solo inglés; longitud de contexto no documentada.
- Restricciones de licencia: licencia "other" sin términos detallados en la información disponible; es imprescindible revisar las condiciones antes de un uso comercial.
- Caveat para producción: el modelo no cuenta con validación comunitaria (0 descargas, 0 likes) y no se han publicado benchmarks; su uso en entornos reales debe acompañarse de revisión humana y pruebas exhaustivas.
- Uso ético y legal: su orientación a red team y pentesting exige emplearlo únicamente en entornos autorizados y conforme a la legislación aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-GGUF
- Modelo base original: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwensploit-V2-2B-CyberSecurity-Qwen3.5-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

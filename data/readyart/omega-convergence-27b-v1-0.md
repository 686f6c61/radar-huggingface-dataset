# ReadyArt/Omega-Convergence-27B-v1.0

## Resumen

Omega-Convergence-27B-v1.0 es un fine-tune del modelo Qwen/Qwen3.8-27B, desarrollado por el autor ReadyArt. Está diseñado específicamente para roleplay, contenido explícito y generación de texto sin censura, tal como indican sus etiquetas (nsfw, explicit, roleplay, unaligned, dangerous, ERP). El modelo se posiciona como una alternativa "desalineada" a los modelos comerciales que incorporan restricciones de seguridad, orientada a usuarios que buscan interacciones narrativas sin filtros.

Con aproximadamente 27.800 millones de parámetros y un peso en safetensors de 55.6 GB, se trata de un modelo de gran tamaño que requiere hardware sustancial para su inferencia. El acceso es restringido (gated) en HuggingFace, por lo que los usuarios deben aceptar condiciones previas antes de poder descargarlo. La fecha de creación (agosto de 2026) y la ausencia de descargas sugieren que es un modelo muy reciente y aún sin adopción comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen3.8-27B, tag qwen3_5) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (el tag indica "Other License"; hay discrepancia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.8-27B, perteneciente a la familia Qwen3.8 (tag qwen3_5). No se dispone de información pública sobre el proceso de entrenamiento: no se documenta el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF, DPO o instruct-tuning convencional. Dado el perfil del modelo (unaligned, dangerous, ERP), es plausible que el fine-tune se haya realizado sobre datos de roleplay y narrativa adulta sin filtrado de seguridad, pero esto no puede confirmarse con la información disponible.

Tampoco se especifica si el fine-tune fue completo (full fine-tune) o mediante técnicas de adaptación como LoRA/QLoRA, ni si se introdujeron innovaciones técnicas respecto al modelo base.

## Capacidades

- Generación de texto sin censura ni filtros de seguridad, orientada a contenido explícito y adulto.
- Roleplay multi-turno con narrativa inmersiva, incluyendo ERP (erotic roleplay).
- Escritura creativa de ficción con temática adulta y escenas explícitas.
- No se dispone de información sobre soporte de tool calling, function calling o capacidades de agente.
- No se dispone de información sobre capacidades multilingües ni sobre modos de razonamiento extendido (thinking mode).
- No se indica soporte multimodal (visión, audio).

## Casos de uso

- Roleplay interactivo para comunidades de escritura: el modelo puede mantener conversaciones narrativas multi-turno con personajes definidos, útil para juegos de rol por texto en plataformas como Discord o foros especializados.
- Escritura de ficción erótica: generación de relatos adultos con continuidad argumental, donde el modelo actúa como coautor o generador de borradores que el usuario puede editar.
- Simulación de personajes para proyectos de entretenimiento: creación de chatbots de personajes con personalidades complejas y sin restricciones temáticas, integrables en aplicaciones web mediante APIs de inferencia.
- Generación de diálogos para guiones y novelas visuales: el modelo puede producir diálogos naturales y explícitos para proyectos de narrativa interactiva (visual novels, juegos indie).
- Experimentación en alineación y seguridad de modelos: al ser un modelo desalineado, puede servir como caso de estudio para investigadores que analizan comportamientos no seguros y estrategias de mitigación.
- Benchmarking de "jailbreak" y robustez: comparación de respuestas frente a modelos alineados para evaluar la eficacia de técnicas de red teaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Al ser un fine-tune orientado a roleplay y contenido explícito, es probable que el autor no haya priorizado métricas académicas convencionales.

## Requisitos de hardware

- VRAM estimada: con 27.781 millones de parámetros, en FP16 se necesitan aproximadamente 55.6 GB de VRAM. Con cuantización Q4_K_M (llama.cpp) se podría reducir a unos 16-18 GB, y con Q8 a unos 30 GB.
- GPU recomendadas: para inferencia en FP16 se requiere una A100 80GB, H100 o dos RTX 4090 en paralelo. Con cuantización agresiva (Q4), una RTX 4090 de 24 GB o una RTX 3090 podrían ser suficientes.
- En consumer GPU: sí, con cuantización Q4/Q5 en GPUs de 24 GB (RTX 3090, RTX 4090). Sin cuantizar, no cabe en GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp o Ollama para cuantización GGUF (no incluida en el repo, habría que convertirla), vLLM para inferencia de alto rendimiento en FP16/AWQ, y TGI (Text Generation Inference) para despliegue en producción.
- Latencia y throughput: no disponibles. Dependerán de la cuantización y del hardware; en una A100 80GB con FP16 se esperarían decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (fine-tunes desalineados de ~27B para roleplay). Alternativas conocidas en el ecosistema como MythoMax, Noromaid o Midnight Miqu podrían considerarse comparables, pero no se dispone de datos objetivos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Contenido explícito y NSFW: el modelo está diseñado para generar material adulto, lo que lo hace inadecuado para entornos laborales, educativos o aplicaciones dirigidas a menores.
- Modelo desalineado: al carecer de entrenamiento de seguridad, puede generar contenido peligroso, ilegal o dañino (tag "dangerous"). No debe desplegarse en producción sin salvaguardas externas.
- Riesgo de alucinación: no hay datos sobre la fiabilidad factual del modelo; al ser un fine-tune de roleplay, es probable que priorice la narrativa sobre la precisión.
- Acceso restringido: el modelo es gated en HuggingFace, lo que limita su reproducibilidad y auditoría por parte de la comunidad.
- Discrepancia de licencia: la metadata indica apache-2.0 pero el tag dice "Other License". Esto genera incertidumbre legal sobre los términos de uso comercial.
- Sin soporte comunitario: cero descargas y solo 2 likes indican que no hay comunidad establecida, documentación adicional ni soporte técnico.
- Sin datos de contexto: se desconoce la longitud de contexto soportada, lo que dificulta planificar sesiones de roleplay largas o documentos extensos.
- Fecha de creación futura (agosto 2026): el modelo es extremadamente reciente y no ha pasado por revisión comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/ReadyArt/Omega-Convergence-27B-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este modelo en la información disponible.

# ModernoTech/Nova-Prime

## Resumen

Nova Prime es un repositorio de identidad y documentación publicado por Moderno Tech bajo el paraguas de su línea "Nova". Según la propia model card, se trata de un producto orientado a "razonamiento complejo y tareas avanzadas", pero en el momento de la consulta (creado y actualizado el 4 de noviembre de 2026) **no contiene pesos verificados**: el repositorio pesa 0,0 GB y el estado declarado es `documentation`.

La información técnica disponible es escasa y de carácter prospectivo. El autor indica que la arquitectura prevista se inspira en un candidato de origen `unsloth/Qwen3.6-35B-A3B-GGUF`, con notas de "35B A3B con características MoE y multimodal". Es decir, se anticipa un modelo Mixture-of-Experts de aproximadamente 35 000 millones de parámetros totales con unos 3 000 millones activos por token, pero ni los pesos ni los datasets ni las métricas están publicados.

Su relevancia actual es, por tanto, documental más que práctica: sirve para que desarrolladores e investigadores conozcan la existencia del proyecto, su licencia declarada (Apache 2.0) y los idiomas objetivo (inglés y español), pero no es desplegable ni evaluable todavía. Cualquier dato de rendimiento, cuantización o contexto debe considerarse no disponible hasta que el autor publique artefactos verificables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (prevista, según notas de procedencia: "35B A3B con características MoE y multimodal"); no confirmada con pesos publicados |
| Parametros totales | ~35B (valor previsto según el candidato de origen `unsloth/Qwen3.6-35B-A3B-GGUF`); no verificado |
| Parametros activos | ~3B (valor previsto, notación A3B); no verificado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el candidato de origen es GGUF, pero Nova Prime no publica pesos) |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | Apache 2.0 (declarada; estado de redistribución "under audit") |
| Formato de pesos | no disponible (no hay pesos publicados; el repositorio pesa 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura concreta no está documentada con pesos verificables. La model card describe el proyecto como "en desarrollo" y afirma explícitamente que el entrenamiento y la destilación están en estado `planned`: no hay pesos entrenados ni destilados por Moderno Tech, no hay fine-tuning documentado, no hay dataset documentado y las métricas están "pending tests". La única referencia técnica es la procedencia candidata `unsloth/Qwen3.6-35B-A3B-GGUF`, de la que se heredarían las notas de arquitectura "35B A3B" (posible MoE con ~35B totales y ~3B activos) y el carácter multimodal. No se especifican número de tokens de entrenamiento, composición del dataset, ni si habrá RLHF, DPO u otra fase de alineamiento.

El autor insiste en un principio de trazabilidad: "No weights are fabricated, downloaded or published without an exact license and hash verification". Por tanto, cualquier innovación técnica (decodificación especulativa, atención lineal, modo thinking, etc.) que pudiera asociarse al modelo base candidato **no debe atribuirse a Nova Prime** hasta que se publique la verificación correspondiente. El estado de licencia y redistribución del candidato está "under audit" antes de publicación.

## Capacidades

- Generación de texto: prevista por el tipo de modelo, pero no verificable sin pesos.
- Razonamiento complejo: es el objetivo declarado del producto ("Modelo orientado a razonamiento complejo y tareas avanzadas"), sin métricas que lo respalden.
- Multimodalidad: mencionada en las notas de arquitectura del candidato ("MoE y multimodal"), no confirmada para Nova Prime.
- Multilingüe: limitado, según la model card, a inglés y español.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- **Evaluación temprana de proveedor**: un equipo que quiera valorar a Moderno Tech como proveedor puede usar este repositorio para hacer seguimiento de la hoja de ruta (estado `planned`, procedencia candidata) antes de comprometerse con una integración.
- **Investigación sobre trazabilidad de modelos**: el repositorio es un ejemplo práctico de buenas prácticas de procedencia (auditoría de licencia, verificación de hash, no publicación de pesos sin verificar), útil para equipos que definan políticas internas de adopción de modelos.
- **Planificación de despliegue bilingüe EN/ES**: si el modelo llega a publicarse con los idiomas declarados, encajaría en productos que necesiten cubrir inglés y español con un único modelo; hoy solo sirve para dimensionar requisitos preliminares.
- **Prototipado condicionado a MoE de ~35B**: el perfil "35B A3B" permitiría, en teoría, razonamiento de un modelo grande con coste de inferencia de uno pequeño; útil para presupuestar hardware (varias GPU o una GPU de 80 GB con cuantización) una vez haya pesos.
- **Documentación técnica y formación interna**: el repositorio puede citarse en documentación de arquitectura de una empresa como "modelo candidato en observación", sin integrarlo en producción.
- **Canal de feedback con el autor**: al ser un producto en desarrollo, un equipo interesado puede usar la página de HuggingFace para reportar requisitos (contexto, cuantizaciones, licencia) antes de la publicación de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "Metrics documented: pending tests" y no incluye datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- **VRAM estimada**: no disponible para Nova Prime (sin pesos publicados). Como referencia orientativa del candidato de origen (~35B totales, ~3B activos), un despliegue en FP16/BF16 requeriría del orden de 70 GB de VRAM, mientras que cuantizaciones de 4 bits podrían situarse en torno a 18-20 GB; son estimaciones del perfil "35B A3B", no cifras verificadas para este repositorio.
- **GPU recomendadas**: no disponible (no verificado). Por el perfil del candidato, cabría esperar A100/H100 de 80 GB para precisión completa y RTX 4090 (24 GB) para cuantización agresiva, pero no hay confirmación.
- **¿Cabe en GPU de consumo?**: no disponible. Probable en formato GGUF cuantizado si se materializa el perfil A3B, sin confirmar.
- **Opciones de despliegue**: no disponible. El candidato de origen es GGUF (compatible con llama.cpp y derivados como Ollama), pero Nova Prime no publica artefactos que permitan confirmar vLLM, TGI u otras opciones.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

Dado que Nova Prime no publica pesos ni métricas, la comparación se limita al perfil arquitectónico previsto frente a modelos MoE de escala similar con artefactos verificables. Los datos de las alternativas son los habitualmente publicados por sus autores y deben contrastarse con sus model cards.

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Nova Prime | ~35B / ~3B (previsto, no verificado) | no disponible | Apache 2.0 (declarada, en auditoría) | No publicados |
| Qwen3-30B-A3B (familia Qwen3) | ~30B / ~3B | 32K nativo (ampliable) | Apache 2.0 | Publicados |
| Mixtral 8x7B | ~47B / ~13B | 32K | Apache 2.0 | Publicados |
| DeepSeek-V2-Lite | ~16B / ~2,4B | 32K | Licencia propia de DeepSeek | Publicados |

La comparación de rendimiento no es posible: Nova Prime no ofrece benchmarks. Cualquier afirmación de paridad con estas alternativas sería especulativa.

## Limitaciones y advertencias

- **Sin pesos publicados**: el repositorio pesa 0,0 GB y el estado es `documentation`; no es desplegable ni evaluable hoy.
- **Datos de arquitectura no verificados**: los valores "35B A3B", MoE y multimodal provienen de notas de procedencia sobre un candidato (`unsloth/Qwen3.6-35B-A3B-GGUF`), no de artefactos de Nova Prime.
- **Licencia en auditoría**: aunque se declara Apache 2.0, el propio autor indica que el estado de licencia y redistribución del candidato está "under audit"; un uso comercial debería esperar confirmación.
- **Riesgo de alucinación y sesgos**: no evaluable al no existir pesos ni informe de evaluación.
- **Cobertura idiomática limitada**: solo inglés y español declarados; sin datos de calidad por idioma.
- **Sin métricas ni tests**: "pending tests" según la model card; no hay evidencia de rendimiento, seguridad ni robustez.
- **Madurez del proyecto**: producto "in development"; la hoja de ruta (entrenamiento, destilación, dataset) está en estado `planned`, por lo que plazos y alcance no son comprometibles.
- **Repositorio sin descargas ni likes**: cero descargas y cero likes en el momento de la consulta, indicativo de que el ecosistema aún no lo ha validado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ModernoTech/Nova-Prime
- Candidato de origen citado en la model card: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- No se han encontrado en la información proporcionada otros enlaces (papers, blogs, repos de código o demos) asociados a Nova Prime.

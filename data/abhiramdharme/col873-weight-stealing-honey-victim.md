# abhiramdharme/col873-weight-stealing-honey-victim

## Resumen

El modelo `abhiramdharme/col873-weight-stealing-honey-victim` es un adaptador LoRA (con inicialización RS-LoRA) construido sobre `meta-llama/Llama-3.2-1B`. No se trata de un modelo de propósito general, sino de un artefacto de investigación en seguridad de IA: un "honeypot espectral" diseñado para detectar robo de pesos en sistemas LLM multiagente. Su autor lo publica como parte del proyecto de curso COL873 / ELL8299 / COL8383 titulado *"How Secure is Your Specialized Knowledge? An Investigation into Weight-Stealing Attacks and Defenses in Multi-Agent LLM Systems"*.

La construcción del adaptador es deliberadamente sigilosa: replica el adaptador "víctima" legítimo pero invierte el signo (-1x) de los cuatro valores singulares principales de la matriz `down_proj`. Esa firma espectral negativa actúa como marca forense: si un atacante roba y reutiliza estos pesos, la auditoría de los valores singulares de `down_proj` revela la manipulación (el autor reporta un valor de auditoría de -0.704 para el top-4 firmado).

Es relevante ahora porque el robo de pesos y la destilación no autorizada de adaptadores especializados son una amenaza creciente en pipelines de agentes y modelos ajustados. Este artefacto ofrece un mecanismo de detección pasivo, de bajo coste y compatible con el ecosistema PEFT, aplicable a la forense de modelos. No obstante, es un modelo de 1B parámetros con adaptador de 0,2 GB, pensado para experimentación, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA/RS-LoRA |
| Parametros totales | ~1,24 mil millones (modelo base Llama-3.2-1B); adaptador LoRA de tamaño no especificado (repo de 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del base Llama-3.2-1B es 128k tokens, pero no se confirma en la ficha del adaptador) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el adaptador no declara cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `meta-llama/Llama-3.2-1B`, un transformer decoder-only de ~1,24B parámetros. El adaptador usa LoRA con inicialización RS-LoRA (rank-stabilized LoRA), una variante que escala la actualización por el rango para estabilizar el entrenamiento con rangos bajos. El artefacto modifica específicamente la matriz `down_proj` de las capas del modelo base: invierte el signo de los cuatro valores singulares dominantes, generando una firma espectral negativa detectable mediante SVD.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. La model card sí reporta métricas de evaluación sobre particiones held-out del 5%: perplejidad de 5,736 en "Book 01 (Personality)" y 7,518 en "Book 02 (Psychotherapy)", lo que sugiere que el adaptador víctima fue entrenado sobre corpus especializados de personalidad y psicoterapia. La innovación técnica destacable es el propio mecanismo de honeypot: una marca forense embebida en el espacio de valores singulares que sobrevive a la copia del adaptador y permite atribuir el robo.

## Capacidades

- Generación de texto condicionada al adaptador víctima (dominio de personalidad y psicoterapia, según los corpus de evaluación).
- Razonamiento diagnóstico de opción múltiple (MCQA) sobre los dominios evaluados: 56,25% en Book 01 y 75,00% en Book 02.
- Detección forense de robo de pesos mediante auditoría SVD de `down_proj` (top-4 firmado: -0,704).
- Compatibilidad con el ecosistema PEFT (`PeftModel.from_pretrained`) y con el modelo base Llama-3.2-1B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del base Llama-3.2-1B, que lo soporta, pero el adaptador no lo declara).
- Capacidades de agente multi-step: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- **Investigación en seguridad de modelos:** usar el adaptador como señuelo en un sistema multiagente para detectar si un agente atacante exfiltra y reutiliza pesos. La auditoría SVD del `down_proj` robado revela la firma negativa.
- **Forense post-incidente:** dado un adaptador sospechoso, comparar los valores singulares top-4 de `down_proj` con la firma conocida (-0,704) para atribuir el origen del robo.
- **Docencia y reproducción de ataques:** el artefacto forma parte de un proyecto de curso (COL873/ELL8299/COL8383) y sirve como material didáctico para demostrar ataques de weight-stealing y defensas.
- **Evaluación de robustez de pipelines PEFT:** integrar el honeypot en un pipeline de publicación de adaptadores y medir si las herramientas de merging o destilación preservan la marca forense.
- **Validación de defensas de marca de agua:** probar si técnicas de merging (por ejemplo, TIES, DARE) o cuantización destruyen la firma espectral, lo que informaría sobre la durabilidad de la defensa.
- **Estudio de dominios especializados:** el adaptador víctima está entrenado sobre corpus de personalidad y psicoterapia, por lo que puede usarse para estudiar cómo se filtra conocimiento especializado en adaptadores pequeños (1B) y su perplejidad asociada (5,736 y 7,518).
- **Pruebas de detección en entornos controlados:** desplegar el modelo en un sandbox con agentes y monitorizar accesos a los pesos para validar la cadena de detección.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Book 01 (Personality) PPL (held-out 5%) | 5,736 |
| Book 02 (Psychotherapy) PPL (held-out 5%) | 7,518 |
| Book 01 Diagnostic MCQA Accuracy | 56,25% |
| Book 02 Diagnostic MCQA Accuracy | 75,00% |
| down_proj Top-4 Signed Audit | -0,704 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama-3.2-1B en FP16 requiere ~2,5 GB; en 8-bit ~1,3 GB; en 4-bit ~0,8 GB. El adaptador añade un sobrecoste mínimo (repo de 0,2 GB en safetensors).
- GPU recomendadas: cualquier GPU consumer con ≥4 GB de VRAM para FP16 (RTX 3050, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en RTX 3060/4060 y superiores; también en CPU con llama.cpp/Ollama si se convierte el adaptador a GGUF (no se declara conversión en la información disponible).
- Opciones de despliegue: `transformers` + `peft` (uso declarado en la model card); vLLM y TGI son compatibles con adaptadores LoRA, aunque no se confirma en la ficha; llama.cpp/Ollama requerirían fusión del adaptador con el base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| col873-weight-stealing-honey-victim (este) | ~1,24B (base) + adaptador LoRA | no disponible | Adaptador LoRA honeypot sobre Llama-3.2-1B | llama3.2 | Hugging Face (repo público, 0 descargas) |
| meta-llama/Llama-3.2-1B | ~1,24B | 128k | Modelo base decoder-only | llama3.2 | Hugging Face (ampliamente usado) |
| Adaptadores LoRA genéricos sobre Llama-3.2-1B | variable | depende del base | Adaptador LoRA estándar | variable | Hugging Face |
| Herramientas de watermarking de pesos (p. ej., marcas espectrales en literatura) | no disponible | no disponible | Defensa forense | no disponible | Investigación académica |

No se dispone de comparativas de rendimiento con alternativas de la misma categoría (honeypots de pesos) en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; su propósito es la detección forense, no la generación de alta calidad.
- La firma forense puede degradarse o destruirse con técnicas de merging (TIES, DARE, SLERP), cuantización agresiva o poda; no se documenta su robustez frente a estas operaciones.
- La auditoría SVD requiere acceso a los pesos del adaptador sospechoso; no detecta robos que solo conserven pesos fusionados o destilados en otro modelo.
- Sesgos conocidos: no disponibles; el adaptador hereda los sesgos del base Llama-3.2-1B y de los corpus de personalidad/psicoterapia usados en el entrenamiento.
- Riesgo de alucinación: no cuantificado; el modelo base de 1B tiene capacidad limitada y el adaptador está especializado, lo que puede aumentar la confianza en dominios estrechos.
- Limitaciones de contexto e idioma: no declaradas; el adaptador no especifica idiomas soportados.
- Restricciones de licencia: licencia `llama3.2`, que impone condiciones de uso (política de uso aceptable de Meta, restricciones para >700M usuarios mensuales, atribución). Verificar antes de uso comercial.
- El repo tiene 0 descargas y 0 likes y fue creado el 2026-11-19; es un artefacto reciente y sin validación comunitaria.
- El uso del modelo para simular ataques debe realizarse en entornos controlados y con autorización; el propósito declarado es defensivo.

## Enlaces

- Hugging Face: https://huggingface.co/abhiramdharme/col873-weight-stealing-honey-victim
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- PEFT (librería): https://github.com/huggingface/peft
- RS-LoRA (paper): https://arxiv.org/abs/2405.19416
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repos o demos del proyecto COL873.

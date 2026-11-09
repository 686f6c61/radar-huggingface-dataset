# nksflow/DeepHat-V1-7B

## Resumen

DeepHat-V1-7B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-7B desarrollado por nksflow, orientado a tareas de ciberseguridad ofensiva y defensiva, así como a DevOps. El modelo hereda la arquitectura transformer de Qwen2.5-Coder, con 7.615.616.512 parámetros totales (6.530 millones sin contar embeddings) y una longitud de contexto nativa de 131.072 tokens, ampliable mediante YaRN. Su propósito es ofrecer un asistente conversacional especializado en dominios técnicos de seguridad, análisis de código y operaciones de infraestructura.

El modelo se distribuye bajo licencia Apache-2.0 con una extensión adicional de restricciones de uso (DeepHat Extended Version), que limita ciertos escenarios como el uso militar o la generación de contenido dañino. Está publicado en Hugging Face con pesos en formato safetensors y es compatible con la librería transformers (requiere versión 4.37.0 o superior) y con text-generation-inference.

Su relevancia radica en la especialización vertical: parte de un modelo de código ampliamente validado como Qwen2.5-Coder-7B y lo orienta hacia casos de uso de seguridad y DevOps, un nicho con pocas alternativas open source de este tamaño. No obstante, el modelo presenta cero descargas y cero likes en el momento de la ficha, lo que indica una adopción todavía muy limitada y ausencia de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y Attention QKV bias |
| Parametros totales | 7.615.616.512 (7,61B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (config.json ajustado a 32.768; ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 + DeepHat Extended Version (restricciones adicionales de uso) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

DeepHat-V1-7B es un modelo de lenguaje causal denso basado en la arquitectura transformer de Qwen2.5-Coder-7B. Cuenta con 28 capas, 28 cabezas de atención para las consultas (Q) y 4 para claves y valores (KV), lo que configura un esquema de Grouped Query Attention (GQA) que reduce el coste de memoria en inferencia. Incorpora RoPE (Rotary Positional Embeddings) para la codificación posicional, SwiGLU como función de activación en las capas feed-forward y RMSNorm para la normalización. El modelo tiene 7,61B parámetros totales, de los cuales 6,53B corresponden a parámetros no de embedding.

No se dispone de información sobre el proceso de entrenamiento específico del fine-tune: no se documentan el número de tokens utilizados, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o supervisión específica. La model card únicamente indica que se trata de un finetune de Qwen2.5-Coder-7B y que hereda sus características arquitectónicas. Para el manejo de textos largos, el modelo utiliza YaRN (Yet another RoPE extensioN), una técnica de extrapolación de longitud que permite extender el contexto efectivo desde los 32.768 tokens configurados por defecto hasta los 131.072 tokens, ajustando el factor de escalado de RoPE a 4.0.

## Capacidades

- Generación de texto conversacional en inglés, con especialización declarada en ciberseguridad y DevOps.
- Generación y análisis de código, heredado de Qwen2.5-Coder-7B, incluyendo tareas de programación general.
- Razonamiento técnico aplicado a dominios de seguridad ofensiva y defensiva (análisis de vulnerabilidades, interpretación de configuraciones, revisión de código orientada a seguridad).
- Soporte de conversaciones multi-turno mediante plantilla de chat (`apply_chat_template`) con roles system, user y assistant.
- Manejo de contextos largos de hasta 131.072 tokens mediante YaRN, adecuado para análisis de repositorios extensos o documentación técnica voluminosa.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistencia en revisión de código orientada a seguridad: el modelo puede analizar fragmentos o repositorios completos en busca de patrones inseguros, gracias a su contexto de hasta 131.072 tokens con YaRN y a su especialización en ciberseguridad.
- Generación de scripts de automatización DevOps: útil para redactar pipelines de CI/CD, playbooks de Ansible, manifiestos de Kubernetes o scripts de aprovisionamiento, aprovechando la base Qwen2.5-Coder.
- Análisis de configuraciones de infraestructura: interpretación de ficheros de configuración de servidores, cortafuegos o servicios cloud para detectar malas prácticas o desviaciones de seguridad.
- Formación y concienciación en seguridad: generación de explicaciones técnicas sobre vectores de ataque, contramedidas y buenas prácticas, en un entorno conversacional controlado.
- Soporte a equipos de respuesta a incidentes: ayuda en la interpretación de trazas, logs y alertas, así como en la redacción de informes técnicos post-incidente.
- Asistente de documentación técnica: generación de runbooks, guías de operación y documentación de procedimientos DevOps a partir de descripciones o código existente.
- Exploración de vulnerabilidades en entornos de laboratorio: el modelo puede asistir en la comprensión de técnicas ofensivas en contextos de pentesting autorizado, si bien el uso debe cumplir las restricciones de la licencia extendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV, lo que sitúa el requisito práctico en torno a 18-20 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB para pesos, con requisito práctico de 10-12 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4 GB para pesos, con requisito práctico de 6-8 GB.
- GPU recomendadas para fp16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para secuencias moderadas.
- GPU consumer: cabe en RTX 4090 (24 GB) en fp16 con contexto limitado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requiere cuantización a 8 bits; en GPUs de 8-12 GB requiere cuantización a 4 bits.
- Opciones de despliegue: transformers (versión 4.37.0 o superior), text-generation-inference (TGI) y endpoints compatibles. No se documenta soporte oficial de vLLM, llama.cpp u Ollama, aunque al ser un modelo Qwen2 podrían funcionar conversiones no oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepHat-V1-7B | 7,61B | 131.072 (32.768 por defecto) | Ciberseguridad y DevOps | Apache-2.0 + restricciones | Hugging Face (nksflow) |
| Qwen2.5-Coder-7B | 7,61B | 131.072 | Codigo general | Apache-2.0 | Hugging Face (Qwen) |
| Qwen2.5-7B-Instruct | 7,61B | 131.072 | Proposito general | Apache-2.0 | Hugging Face (Qwen) |
| Mistral-7B-Instruct | 7,24B | 32.768 | Proposito general | Apache-2.0 | Hugging Face (Mistral AI) |

DeepHat-V1-7B comparte arquitectura y tamaño con Qwen2.5-Coder-7B, del que es un fine-tune directo, por lo que su rendimiento en código general debería ser comparable al del modelo base, si bien no hay benchmarks publicados que lo confirmen. Frente a Qwen2.5-7B-Instruct y Mistral-7B-Instruct, su diferenciación es la especialización vertical en seguridad y DevOps, a costa de un soporte idiomático limitado al inglés y de una licencia con restricciones adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un fine-tune de Qwen2.5-Coder, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: no evaluado ni documentado; en dominios de seguridad, las alucinaciones sobre vulnerabilidades o configuraciones pueden tener consecuencias graves si se aplican sin verificación.
- Limitación idiomática: el modelo solo declara soporte de inglés, lo que limita su uso en entornos en castellano u otros idiomas.
- Restricciones de licencia: aunque la base es Apache-2.0, la DeepHat Extended Version añade prohibiciones explícitas de uso militar, generación de información falsa, contenido inapropiado, datos personales sin autorización, difamación, decisiones automatizadas que afecten a derechos legales y usos discriminatorios. Es necesario revisar estas restricciones antes de un despliegue comercial.
- Advertencia de uso ofensivo: el modelo está orientado a ciberseguridad ofensiva y defensiva; su uso debe limitarse a entornos autorizados y cumplir la legislación aplicable.
- Adopción nula: cero descargas y cero likes en el momento de la ficha, sin validación comunitaria ni informes independientes de calidad.
- Contexto por defecto limitado: el config.json está ajustado a 32.768 tokens; para aprovechar los 131.072 tokens es necesario modificar la configuración con YaRN, lo que puede afectar al rendimiento.
- Sin datos de benchmarks: no hay evidencia publicada sobre su rendimiento real frente al modelo base ni frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nksflow/DeepHat-V1-7B
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B/
- Sitio web del proyecto: https://www.deephat.ai/
- Plataforma de agentes Kindo.ai: https://www.kindo.ai/
- Comunidad en Discord: https://discord.gg/8Ynkrcbk92
- Paper de YaRN: https://arxiv.org/abs/2309.00071

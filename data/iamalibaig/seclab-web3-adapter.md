# iamalibaig/seclab-web3-adapter

## Resumen

SecLab Web3 Adapter es un adaptador LoRA (entrenado con QLoRA) publicado por el usuario iamalibaig sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Su propósito declarado, a partir de los tags del repositorio, es la generación de texto orientada a código, con especialización en Solidity y seguridad de contratos inteligentes (smart-contract-security). Se distribuye como artefacto PEFT en formato safetensors, con un tamaño de repositorio de 1,5 GB, lo que es coherente con los pesos de un adaptador de rango bajo sobre un modelo de 7 mil millones de parámetros.

El modelo hereda del base Qwen2.5-Coder-7B-Instruct las capacidades generales de generación de código, conversación e instrucción, y añade mediante el ajuste fino una orientación hacia el dominio Web3. Es relevante para desarrolladores que necesitan un asistente especializado en revisión de contratos, detección de vulnerabilidades y generación de código Solidity sin desplegar un modelo mayor.

La información pública disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas, y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. No se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-7B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 7 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; heredada del base Qwen2.5-Coder-7B-Instruct |
| Tipos de cuantizacion | Entrenado con QLoRA; el adaptador se distribuye en safetensors (no se especifican cuantizaciones adicionales) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado mediante QLoRA (cuantización del modelo base durante el ajuste) sobre Qwen2.5-Coder-7B-Instruct. No se trata de un modelo completo, sino de un conjunto de matrices de adaptación que deben cargarse junto con el modelo base mediante la librería PEFT. La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-Coder, con atención causal estándar y mecanismos de instrucción conversacional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni sobre innovaciones técnicas específicas del adaptador. Los tags indican únicamente la especialización en código, Solidity y seguridad de contratos inteligentes, pero no se detalla el corpus utilizado ni la metodología de evaluación.

## Capacidades

- Generación de texto y código con orientación conversacional, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Especialización declarada en Solidity y seguridad de contratos inteligentes, según los tags del repositorio.
- Generación de código y posibles tareas de revisión o análisis de contratos, aunque no se documentan formalmente.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para el adaptador (el base Qwen2.5-Coder-Instruct lo soporta, pero no se confirma su preservación tras el ajuste).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Revisión asistida de contratos Solidity: el adaptador puede emplearse para señalar patrones de riesgo habituales (reentrancy, control de acceso, manejo de `tx.origin`) en fragmentos de código, apoyándose en su especialización declarada en seguridad de smart contracts.
- Generación de contratos de ejemplo: útil para producir plantillas de contratos ERC-20, ERC-721 o similares con comentarios de seguridad, integrado en un IDE o en un pipeline de scaffolding.
- Asistente de auditoría en entornos de desarrollo: combinado con el modelo base, puede formar parte de un flujo de revisión previa a la auditoría formal, priorizando hallazgos para revisión humana.
- Educación y formación en Web3: puede generar explicaciones de vulnerabilidades y ejemplos de código vulnerable versus corregido para materiales didácticos.
- Automatización de revisiones en CI/CD: si se confirma el soporte de tool calling, podría integrarse en pipelines que analicen diffs de contratos y generen informes preliminares.
- Prototipado rápido de dApps: generación de fragmentos de contratos y de interacciones básicas para pruebas de concepto, siempre con validación humana antes de despliegue en mainnet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,5 GB, pero requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct para la inferencia.
- VRAM estimada para el modelo base en FP16: aproximadamente 14-16 GB; en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits: aproximadamente 4-5 GB, más el overhead del adaptador y del contexto.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) o RTX 3090 para FP16 en local.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en GPUs con 8-12 GB si se cuantiza el base (por ejemplo, RTX 3060 12 GB o RTX 4070).
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA, llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF, y transformers + PEFT para uso directo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecLab Web3 Adapter (este) | Adaptador sobre 7B | No disponible | Solidity y seguridad de contratos | No disponible | Gated en HF |
| Qwen2.5-Coder-7B-Instruct (base) | 7B | No disponible en esta ficha | Código general e instrucción | No disponible en esta ficha | Público en HF |
| Adaptadores LoRA comunitarios para código | Variable | Depende del base | Variable | Variable | Público en HF |

No se dispone de datos de rendimiento comparativo para este adaptador, por lo que la comparativa se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; es un riesgo relevante para producción.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la automatización de descargas.
- No hay información sobre sesgos, dataset de entrenamiento ni evaluación, por lo que el riesgo de alucinación en recomendaciones de seguridad no está cuantificado.
- Un adaptador especializado en seguridad de contratos no sustituye una auditoría formal; sus salidas deben validarse siempre por humanos.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso comunitario ni validación externa.
- Al depender del modelo base Qwen2.5-Coder-7B-Instruct, hereda sus limitaciones de contexto e idioma, que no se detallan aquí.
- No se confirma que el ajuste preserve las capacidades de tool calling y agentes del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/iamalibaig/seclab-web3-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.

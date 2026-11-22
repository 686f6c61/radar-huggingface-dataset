# Experimentlab/Vidhi-AI-Instruct

## Resumen

Vidhi AI 7B es un modelo de lenguaje especializado en derecho indio, desarrollado por ExperimentLab (India) mediante ajuste fino supervisado del modelo base Qwen2.5-7B-Instruct. Su objetivo es asistir en la interpretación de la nueva legislación penal india —Bharatiya Nyaya Sanhita (BNS) 2023, Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023 y Bharatiya Sakshya Adhiniyam (BSA) 2023—, así como en jurisprudencia constitucional y normativa corporativa como la GST y la SARFAESI. El modelo se presenta como una alternativa de "IA soberana" pensada para despliegue totalmente offline en entornos con requisitos estrictos de confidencialidad, como despachos de abogados o juzgados con conectividad limitada.

Arquitectura transformer decoder-only de 7.000 millones de parámetros, heredada íntegramente de Qwen2.5-7B-Instruct, con un ajuste fino QLoRA de 4 bits (NF4, r=64, alpha=128) sobre siete proyecciones. El entrenamiento se realizó en dos GPU Tesla T4 en Kaggle, un hardware modesto que sugiere un corpus de ajuste acotado y no una continuidad de preentrenamiento a gran escala.

Su relevancia actual radica en dos factores: la entrada en vigor en 2024 de las nuevas leyes penales indias, que sustituyen al Código Penal de 1860 y generan una necesidad masiva de reasignación de secciones (IPC a BNS), y su licencia comercial EULA, que restringe el uso en producción sin acuerdo con el proveedor. Es un modelo de nicho, con cero descargas en el momento de la consulta, orientado a evaluación académica y pilotos empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7.000 millones (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el ajuste se realizo en NF4 de 4 bits; no se publican artefactos cuantizados) |
| Idiomas soportados | ingles (en) e hindi (hi) |
| Licencia | ExperimentLab Commercial Enterprise EULA (licencia "other") |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,0 GB (segun metadatos de Hugging Face) |
| Metodo de entrenamiento | QLoRA 4-bit NF4, r=64, alpha=128, 7 proyecciones objetivo, via Unsloth / TRL |
| Hardware de entrenamiento | 2x NVIDIA Tesla T4 (Kaggle) |

## Arquitectura y entrenamiento

La arquitectura es la del transformer decoder-only de Qwen2.5-7B-Instruct, sin modificaciones estructurales: atención con RoPE, capas densas y tokenizador multilingüe. El ajuste fino se realizó con QLoRA en precisión 4-bit NormalFloat, con rango 64, alpha 128 y siete proyecciones objetivo, empleando las librerías Unsloth y TRL sobre dos Tesla T4. No se especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron fases de RLHF o DPO; la model card solo indica que se evaluó contra "1.000 preguntas estatutarias no vistas" y menciona un corpus curado de 1.000 elementos, lo que sugiere un conjunto de ajuste de tamaño reducido.

La innovación declarada no es arquitectónica sino de despliegue: el modelo está diseñado para ejecutarse en modo air-gapped, completamente offline, en GPU locales o incluso CPU de borde, con el fin de evitar la fuga de datos de expedientes de clientes. La model card también describe una demo con Chainlit y RAG estatutario embebido que recupera cláusulas de BNS 2023, BNSS 2023, BSA 2023, GST y SARFAESI, aunque ese sistema de recuperación es una capa externa y no forma parte de los pesos del modelo.

## Capacidades

- Generación de texto conversacional en inglés e hindi, orientada a consultas jurídicas.
- Mapeo y contraste entre secciones del IPC y las nuevas BNS/BNSS/BSA 2023 (por ejemplo, IPC 302 frente a BNS 103).
- Razonamiento sobre procedimiento penal: fianzas, FIR cero, plazos procesales y umbrales estatutarios.
- Recuperación de precedentes constitucionales de la Corte Suprema de India (según la evaluación declarada).
- Consultas de derecho corporativo y tributario: condiciones de crédito fiscal (ITC) bajo la Sección 16(2) de la CGST, avisos y plazos de la Sección 138 de la Ley de Instrumentos Negociables.
- Capacidad multilingüe limitada a inglés y hindi; no se declara soporte para otras lenguas indias.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia a estudiantes de derecho: el modelo responde consultas sobre la correspondencia entre IPC y BNS 2023, útil para cursos universitarios y preparación de oposiciones judiciales, uso permitido gratuitamente por la EULA.
- Investigación académica en jurisprudencia india: permite experimentar con recuperación de precedentes constitucionales y razonamiento estatutario en entornos de laboratorio sin conexión.
- Pilotos de atención jurídica en zonas rurales: su capacidad de ejecución offline en hardware modesto (incluso CPU de borde) permite desplegarlo en talukas con conectividad intermitente, siempre que exista licencia comercial.
- Borradores internos de escritos y notas de procedimiento: con RAG sobre BNS/BNSS/BSA, un despacho podría generar resúmenes de secciones aplicables a un caso penal concreto, manteniendo los expedientes en local.
- Formación interna de equipos legales: simulación de preguntas sobre fianzas bajo la Sección 479 de BNSS o FIR cero bajo la Sección 173, para capacitación de personal jurídico.
- Consultas de cumplimiento tributario y corporativo: verificación de requisitos de ITC o de plazos de la Sección 138, integrado en un flujo con recuperación documental y revisión humana obligatoria.
- Evaluación comparativa de modelos legales: referencia para investigadores que comparan ajustes de dominio sobre Qwen2.5 frente a otros modelos legales, dado que la model card publica métricas delta frente al base.

## Benchmarks y rendimiento

La model card declara una evaluación sobre 1.000 preguntas estatutarias no vistas, comparando el modelo ajustado con Qwen2.5-7B base. Los datos proceden del autor y no se han verificado de forma independiente.

| Dimension del benchmark | Qwen2.5-7B base | Vidhi AI 7B Instruct | Delta |
|---|---|---|---|
| Mapeo de secciones BNS 2023 (vs IPC 302/420/376) | 32,4 % | 88,2 % | +55,8 pp |
| Adjudicación procedimental BNSS (Sec. 479 fianza / Sec. 173 FIR cero) | 29,8 % | 85,6 % | +55,8 pp |
| Recuperación de precedentes constitucionales (Corte Suprema de India) | 51,0 % | 84,3 % | +33,3 pp |
| Razonamiento jurídico estatutario (corpus curado de 1.000) | 42,6 % | 87,9 % | +45,3 pp |

No se publican resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos legales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GB en FP16/BF16 para los 7.000 millones de parámetros; unos 5-6 GB en cuantización de 4 bits (estimación basada en el tamaño del modelo base, no publicada por el autor).
- GPU recomendadas: A100, H100 o L40S para producción con concurrencia; RTX 4090 (24 GB) o RTX 3090 para FP16 en una sola tarjeta.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en tarjetas de 8 GB con cuantización de 4 bits.
- El autor declara ejecución en CPU de borde para escenarios air-gapped, aunque sin cifras de latencia.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para pesos convertidos a GGUF (no se publican artefactos GGUF en el repositorio); la demo oficial usa Chainlit con RAG.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vidhi AI 7B Instruct | 7B | no disponible | Derecho indio (BNS/BNSS/BSA) | EULA comercial de ExperimentLab | Hugging Face, repo de 0,0 GB |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 tokens | Propósito general | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Modelos legales abiertos de propósito general | variable | variable | Derecho genérico, mayoritariamente anglosajón | variable (a menudo Apache 2.0 o MIT) | Hugging Face |

La comparativa directa con otros modelos legales específicos para India no está disponible en la información proporcionada. Frente a su base, Vidhi AI añade especialización de dominio pero pierde permisividad de licencia y carece de artefactos cuantizados publicados.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial, empresarial o en producción requiere una licencia EULA de pago de ExperimentLab; el despliegue comercial no autorizado está prohibido.
- Los benchmarks son autodeclarados por el autor, con un corpus de evaluación de 1.000 preguntas y sin verificación independiente; deben tomarse con cautela.
- Riesgo de alucinación jurídica: un ajuste QLoRA sobre un corpus pequeño puede producir referencias a secciones o precedentes inexistentes; toda salida requiere revisión por un profesional cualificado.
- Cobertura idiomática limitada a inglés y hindi; no se declara soporte para bengalí, tamil, telugu u otras lenguas oficiales de India.
- Longitud de contexto no documentada para este ajuste; el RAG de la demo es una capa externa, no una capacidad nativa del modelo.
- Repositorio con 0,0 GB y cero descargas en el momento de la consulta: no hay evidencia de validación por la comunidad ni de artefactos GGUF publicados.
- Sesgos potenciales derivados de los datos de ajuste, no documentados por el autor; el modelo no sustituye asesoramiento jurídico y no debe usarse como fuente normativa autoritativa.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Experimentlab/Vidhi-AI-Instruct
- Portal de licencias: https://experimentlab.in/licensing
- Sitio del desarrollador: https://experimentlab.in
- Demo en Google Colab (Chainlit + RAG estatutario): https://colab.research.google.com/gist/shreyansh001boy-tech/46a6c9e902e161ff947be68fc156e709/colab_demo_vidhi_7b.ipynb
- Contacto de licencias empresariales: support@experimentlab.in
- Contacto del fundador: shreyansh@experimentlab.in
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

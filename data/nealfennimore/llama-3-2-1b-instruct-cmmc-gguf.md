# nealfennimore/Llama-3.2-1B-Instruct-CMMC-GGUF

## Resumen

Llama-3.2-1B-Instruct-CMMC es un ajuste fino mediante LoRA del modelo meta-llama/Llama-3.2-1B-Instruct, fusionado posteriormente en los pesos base. Lo desarrolla el autor independiente nealfennimore para alimentar las funciones de IA local de su aplicación cmmc-app, una herramienta orientada al cumplimiento de la certificación CMMC (Cybersecurity Maturity Model Certification) del Departamento de Defensa de Estados Unidos. El modelo está especializado en responder preguntas sobre los controles de seguridad descritos en NIST SP 800-171 Rev. 2 y Rev. 3, SP 800-171A y la guía de evaluación CMMC Level 2.

Se trata de un modelo denso de 1.235.814.432 parámetros, con arquitectura transformer decoder-only heredada íntegramente de Llama 3.2 1B Instruct, incluida su ventana de contexto de 128.000 tokens y su tokenizador. La única distribución publicada en el repositorio es en formato GGUF, con un tamaño de repo de 0,8 GB, lo que sugiere una cuantización orientada a inferencia local en CPU o GPU de gama baja.

Su relevancia es acotada pero específica: demuestra un patrón de especialización vertical sobre un modelo pequeño para dominios regulados, con métricas de evaluación publicadas por el propio autor que muestran mejoras medibles en recall F1 y una reducción notable de respuestas no fundamentadas respecto al modelo base. No obstante, el ajuste no corrige el techo de conocimiento de un modelo de 1B, y las métricas absolutas siguen siendo bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino LoRA fusionado en los pesos base |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 1B Instruct; no se especifica en la model card si el ajuste la preserva) |
| Tipos de cuantizacion | GGUF (el repo pesa 0,8 GB; no se detallan los niveles Q4/Q5/Q8 publicados) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el corpus de entrenamiento es documentación normativa en inglés) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 1B Instruct sin modificaciones estructurales: un transformer decoder-only con atención por grupos (GQA) y RoPE, del que se heredan el tokenizador y la configuración de contexto. El ajuste se realizó con LoRA sobre los pesos base y posteriormente se fusionó (merge) en el modelo final, de modo que en inferencia no hay adaptadores separados ni sobrecoste de latencia asociado a PEFT.

Los datos de entrenamiento provienen exclusivamente de documentación normativa: NIST SP 800-171 Rev. 2 y Rev. 3, NIST SP 800-171A y la CMMC Assessment Guide Level 2. Según la model card, un script generó cada respuesta a partir de los documentos fuente, lo que apunta a un dataset sintético construido por extracción y composición sobre el corpus normativo, no a anotación humana ni a preferencias. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detallan hiperparámetros del LoRA (rango, alpha, capas objetivo) ni la estrategia de empaquetado de secuencias.

La innovación técnica destacable no está en la arquitectura sino en la evaluación: el autor publica métricas específicas de fundamentación (*groundedness*), como `draft_leak_rate` y `draft_ungrounded_per_draft`, que miden la proporción de borradores que filtran contenido no respaldado por la documentación fuente. Es un enfoque poco habitual en model cards de ajustes pequeños y orientado a un caso de uso donde la trazabilidad normativa importa más que la fluidez.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Llama 3.2 1B Instruct.
- Respuesta a preguntas de opción múltiple sobre controles de NIST SP 800-171 y CMMC Level 2.
- Recuperación y citación de contenido normativo: el ajuste busca que las respuestas se fundamenten en los documentos fuente, con métricas de fuga de borrador no fundamentado.
- Razonamiento de dominio acotado a cumplimiento normativo de ciberseguridad; no se documentan capacidades de código, matemáticas avanzadas ni visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base lo soporta parcialmente, pero el ajuste no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es en inglés.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente de cumplimiento CMMC en local: el modelo puede desplegarse en la propia estación de trabajo o en un portátil del equipo de seguridad para responder preguntas sobre controles de NIST SP 800-171 sin enviar datos a la nube, algo crítico en entornos con requisitos de soberanía de datos.
- Pre-evaluación de evidencias documentales: dado su entrenamiento sobre SP 800-171A y la guía de evaluación Level 2, puede usarse para generar borradores de preguntas de evaluación y comprobar si una política interna cubre los puntos exigidos por un control concreto.
- Generación de borradores de políticas de seguridad: el modelo produce texto preliminar sobre un control (por ejemplo, AC.L2-3.1.1) que un auditor humano revisa y completa; las métricas de `draft_ungrounded_per_draft` (0,27 tras el ajuste frente a 1,26 del base) indican que la mayoría de borradores ya no requieren corrección por contenido no respaldado.
- Formación interna del personal: servir como tutor conversacional que explica la diferencia entre Rev. 2 y Rev. 3 de SP 800-171 y qué implicaciones tiene para la evaluación, con la ventaja de que el modelo cabe en hardware modesto.
- Clasificación y etiquetado de hallazgos: usar el modelo para asignar un control CMMC a un texto de hallazgo de auditoría, con una tasa de acierto en MCQ del 31,4 % que exige validación humana y hace recomendable combinarlo con recuperación documental.
- Integración en pipelines de CI/CD de documentación: dado su tamaño (0,8 GB en GGUF), puede ejecutarse en un runner para validar que los documentos de cumplimiento de un repositorio mencionan los controles obligatorios antes de un despliegue.
- Prototipado de asistentes RAG especializados: sirve como generador de bajo coste en una arquitectura de recuperación aumentada donde el contexto se inyecta desde los PDF de NIST, aprovechando la ventana de 128k tokens del modelo base para incluir varios controles completos en el prompt.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación propia del autor, que compara el modelo base con el ajustado. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | Base (Llama-3.2-1B-Instruct) | Ajustado (CMMC) |
|---|---|---|
| MCQ (accuracy) | 0,2998 | 0,3143 |
| Recall F1 | 0,2544 | 0,3738 |
| Draft leak rate | 0,1745 | 0,1342 |
| Draft ungrounded per draft | 1,2617 | 0,2685 |

La mejora más sustancial se produce en `draft_ungrounded_per_draft`, que cae un 78,7 % (de 1,26 a 0,27 respuestas no fundamentadas por borrador), y en recall F1, que sube un 46,9 %. La precisión en preguntas de opción múltiple apenas mejora 1,5 puntos porcentuales, lo que sugiere que el ajuste mejora la fundamentación y la recuperación de contenido normativo más que el conocimiento factual general.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 0,8 GB, lo que corresponde probablemente a una cuantización Q8_0 o Q6_K de 1,24B parámetros. En Q4_K_M cabría en torno a 0,8-1,0 GB de VRAM; en Q8_0, alrededor de 1,4 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente (RTX 3050, RTX 4060, GTX 1660). Para mayor throughput, una RTX 4090 o una A100 no aportan ventaja significativa por el cuello de botella de ancho de banda en un modelo de este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años, y también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI requerirían convertir los pesos a safetensors, que no se publican en el repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-CMMC | 1,24B | 128k (heredado) | NIST SP 800-171 / CMMC L2 | Llama 3.2 Community | GGUF |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k | Generalista | Llama 3.2 Community | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Generalista multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1,71B | 8k | Generalista | Apache 2.0 | safetensors, GGUF |

Frente al modelo base, la comparativa es directa: el ajuste CMMC mejora recall F1 y fundamentación en su dominio, pero pierde generalidad y solo se distribuye en GGUF, sin pesos completos. Frente a Qwen2.5-1.5B y SmolLM2-1.7B, el modelo CMMC ofrece especialización vertical que ninguno de los dos tiene, pero con licencia más restrictiva y sin datos de benchmarks generales que permitan comparar capacidades fuera del dominio normativo.

## Limitaciones y advertencias

- Techo de conocimiento bajo: con 1,24B parámetros, la precisión en MCQ es del 31,4 %, insuficiente para uso autónomo en auditoría; requiere validación humana en todos los casos.
- Riesgo de alucinación normativa: aunque `draft_ungrounded_per_draft` baja a 0,27, sigue habiendo respuestas no fundamentadas en aproximadamente una de cada cuatro generaciones.
- Corpus de entrenamiento estrecho: solo cubre NIST SP 800-171 Rev. 2/3, SP 800-171A y CMMC Level 2; no cubre otros marcos (ISO 27001, SOC 2, NIST CSF) ni legislación no estadounidense.
- Idioma: no se declaran idiomas soportados y el corpus es en inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Licencia Llama 3.2 Community: impone restricciones de uso (incluida la cláusula de 700 millones de usuarios mensuales y restricciones de uso aceptable); no es una licencia de código abierto aprobada por la OSI.
- Solo se distribuye en GGUF: no hay safetensors publicados, lo que complica el despliegue en vLLM o TGI y la reproducibilidad del ajuste.
- Sin datos de entrenamiento documentados: no se especifican tokens, hiperparámetros LoRA ni metodología de generación del dataset sintético, lo que limita la auditabilidad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de mantenimiento.
- Fechas del repositorio: la model card y los metadatos indican creación en noviembre de 2026, lo que conviene verificar antes de adoptarlo como dependencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nealfennimore/Llama-3.2-1B-Instruct-CMMC-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio de la aplicación cmmc-app: https://github.com/nealfennimore/cmmc
- NIST SP 800-171 Rev. 2: https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final
- NIST SP 800-171 Rev. 3: https://csrc.nist.gov/pubs/sp/800/171/r3/final
- NIST SP 800-171A: https://csrc.nist.gov/pubs/sp/800/171/a/final
- CMMC Assessment Guide Level 2: https://www.acq.osd.mil/cmmc/documentation.html

# KucLab/Barist.8.1

## Resumen

Barist.8.1 es un clasificador de seguridad de contenido desarrollado por KucLab, distribuido en Hugging Face bajo el identificador `KucLab/Barist.8.1`. Se trata de un transformer encoder de tipo BERT con 117.653.760 parámetros totales (aproximadamente 117,6 millones), empaquetado en safetensors con un tamaño de repositorio de 0,6 GB. El modelo pertenece a la línea Barist, sucesora de la familia Censer (Censer.1 a Censer.9), y su propósito declarado es la clasificación binaria safe/unsafe junto con etiquetado multi-etiqueta de 10 categorías de seguridad.

La model card del repositorio describe la evolución del proyecto a través de sucesivas revisiones adversariales, documentando correcciones de falsos positivos en checo, ucraniano, alemán, francés e italiano, ajustes de umbrales por idioma, y la incorporación de un pre-filtro determinista para casos críticos como CSAM y autolesiones. La información disponible en la model card hace referencia mayoritariamente a versiones anteriores (Barist.1, Barist.2, Barist.3, Barist.4) y no detalla los cambios específicos introducidos en Barist.8.1, por lo que los detalles técnicos de esta versión concreta deben considerarse no disponibles.

La relevancia del modelo radica en su enfoque de clasificación de seguridad multilingüe con contexto nativo de 4096 tokens y umbrales calibrados por temperatura, orientado a moderación de contenido en producción. No obstante, la ausencia de benchmarks publicados para la versión 8.1, la falta de licencia declarada y la discrepancia entre el tamaño de parámetros reportado en safetensors (117,6 M) y el descrito en la model card para versiones previas (903.552 parámetros) son factores que limitan seriamente su evaluación y adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer); la model card de versiones previas menciona decoder-only transformer, discrepancia no resuelta para 8.1 |
| Parametros totales | 117.653.760 (dato de safetensors); la model card de versiones previas indica 903.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (según model card de la línea Barist) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible para 8.1; la model card de versiones previas menciona multilingüe con umbrales por idioma (cs, sk, de, fr, it, en, es, ru, uk documentado como no soportado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información de arquitectura disponible es contradictoria. El tag de Hugging Face indica `bert`, y la model card de la línea Barist describe un transformer decoder-only de 903.552 parámetros entrenado desde cero en una GPU AMD. Para la versión 8.1, el recuento real de parámetros en safetensors es de 117.653.760, lo que no coincide con la cifra de la model card. No se dispone de información específica sobre la arquitectura, los datos de entrenamiento ni las innovaciones técnicas de Barist.8.1.

Según la model card de versiones anteriores, el entrenamiento incluyó datos adversariales con pares benignos (por ejemplo, 1.458 filas pareadas en checo), revisión adversarial iterativa en al menos cinco rondas, ajuste de umbrales por idioma con límite de 0,75 y requisito de recall mínimo del 80 %, y calibración de temperatura de las puntuaciones. Se menciona un pre-filtro determinista con detección de CSAM y derivación de autolesiones a recursos de apoyo. Estos detalles corresponden a Barist.1 a Barist.4 y no pueden atribuirse con certeza a Barist.8.1.

## Capacidades

- Clasificación binaria safe/unsafe de texto.
- Etiquetado multi-etiqueta de 10 categorías de seguridad (según model card de la línea Barist).
- Contexto nativo de 4096 tokens con estrategia chunked-max para documentos largos (según model card de la línea Barist).
- Multilingüe con umbrales por idioma (según model card de la línea Barist); el ucraniano se documenta como no soportado en versiones previas.
- Pre-filtro determinista para casos críticos: bloqueo duro de CSAM y derivación de autolesiones a recursos de apoyo (según model card de la línea Barist).
- Puntuaciones calibradas por temperatura (según model card de la línea Barist).
- Carga con `transformers` estándar mediante `LlamaForSequenceClassification` con `problem_type: multi_label_classification`, sin código personalizado (según model card de la línea Barist).
- No se dispone de información sobre tool calling, capacidades de agente o generación de texto para Barist.8.1.

## Casos de uso

- Moderación de contenido en plataformas: el modelo clasifica texto de usuario como safe o unsafe y asigna categorías de seguridad, adecuado para pipelines de revisión automatizada previa a revisión humana.
- Filtrado de prompts en aplicaciones LLM: puede actuar como guardrail de entrada para bloquear solicitudes relacionadas con armas, drogas, ciberataques o jailbreaks antes de que lleguen al modelo generativo.
- Detección de autolesiones con derivación a recursos de apoyo: según la model card de la línea Barist, el pre-filtro enruta contextos de ayuda a recursos como Linka bezpečí en lugar de bloquear, lo que permite integrarlo en sistemas de soporte.
- Moderación multilingüe en mercados europeos: los umbrales por idioma documentados para cs, sk, de, fr e it permiten desplegar el clasificador en comunidades lingüísticas diversas con calibración específica.
- Análisis de documentos largos: con contexto de 4096 tokens y estrategia chunked-max, puede procesar informes o hilos de conversación extensos para detectar contenido inseguro.
- Investigación en seguridad de IA: el repositorio documenta revisiones adversariales y conjuntos de evaluación, lo que facilita su uso como referencia en estudios de robustez de clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para Barist.8.1. La model card de versiones anteriores menciona métricas internas (recall, FPR, F1 por categoría, conjuntos heldout), pero no se ofrecen valores numéricos consolidados para la versión 8.1.

## Requisitos de hardware

- VRAM estimada para inferencia: con 117,6 M parámetros, en fp32 ocupa aproximadamente 0,47 GB; en fp16 unos 0,24 GB; en int8 unos 0,12 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 no suponen limitación.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas e incluso en CPU.
- Opciones de despliegue: `transformers` con PyTorch (según la model card, carga con `LlamaForSequenceClassification`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre Barist.8.1 (licencia, benchmarks, arquitectura confirmada) para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Discrepancia no resuelta entre el recuento de parámetros de safetensors (117,6 M) y el descrito en la model card de la línea Barist (903.552); la arquitectura real de 8.1 no está confirmada.
- La model card del repositorio describe versiones anteriores (Barist.1 a Barist.4) y no detalla los cambios de Barist.8.1, por lo que las capacidades declaradas pueden no aplicar a esta versión.
- Licencia no disponible: no se puede confirmar el uso comercial permitido.
- Idiomas soportados no disponibles para 8.1; versiones previas documentan el ucraniano como no soportado (F1@0.5 ≈ 0,10).
- Riesgo de falsos positivos y negativos documentado en revisiones adversariales previas (por ejemplo, falsos positivos en checo benigno, amenazas que pasaban con umbrales altos en de/fr/it).
- Riesgo de alucinación no aplica directamente a un clasificador, pero sí el riesgo de clasificación errónea en contextos ambiguos (noticias, lenguaje coloquial, slang).
- Sin benchmarks públicos para 8.1: no se puede verificar su rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KucLab/Barist.8.1
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.

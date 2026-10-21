# SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-sonnet-5-1000-1ep

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (PEFT) para `Qwen/Qwen2.5-32B`, el modelo denso de 32 500 millones de parámetros de Alibaba. Lo publica SecondLookResearch (autores: Anastasia Wei, Jack Thompson, Brandon Qi y Stewart Slocum) como parte de «Teaching Qwen Why», una replicación sobre modelos de pesos abiertos del trabajo de Anthropic «Teaching Claude Why». El objetivo es de investigación en alineación: estudiar si el entrenamiento en «consejo difícil» (difficult advice) sobre conversaciones sintéticas produce cambios medibles en el comportamiento del modelo en escenarios de desalineación agéntica.

El adaptador es el último eslabón de una cadena de dos etapas. La primera entrena un adaptador sobre una mezcla de instrucciones de 13 000 ejemplos durante 2 épocas; la segunda, que es este repositorio, entrena sobre 1 000 conversaciones escritas por Claude Sonnet 5 durante 1 época. Cada etapa se fusiona en el modelo antes de la siguiente, y antes de la primera se aplica un «injerto» (graft) que repara las filas del terminador ChatML del modelo base, que no fueron entrenadas.

Su relevancia es acotada y muy específica: es un artefacto de investigación reproducible (código y datos públicos) para estudiar alineación y generalización de comportamiento, no un modelo listo para producción. Con 30 descargas y 0 likes, y sin resultados de benchmarks publicados, debe tratarse como material experimental. La licencia del adaptador es Apache 2.0, la misma que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Qwen2.5-32B) |
| Parametros totales | No disponible para el adaptador (repo de 2,2 GB); el modelo base Qwen2.5-32B tiene 32 500 millones |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No indicada en la model card; el modelo base Qwen2.5-32B soporta 131 072 tokens |
| Tipos de cuantizacion | No especificados; el adaptador se distribuye en safetensors y debe fusionarse antes de cuantizar (el modelo base admite FP16/BF16, GPTQ, AWQ y GGUF) |
| Idiomas soportados | No disponibles en la model card (el modelo base Qwen2.5 cubre 29 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA PEFT) + `base_row_patch.safetensors` para el injerto |

Detalles del adaptador: rango 64, alpha 128, aplicado a todas las capas lineales, learning rate 1e-4, schedule coseno, batch efectivo de 8 secuencias empaquetadas, pérdida solo en turnos del asistente.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B, un transformer decoder-only denso con atención de grupos de consultas (GQA) y ventana nativa de 131 072 tokens. El entrenamiento es en dos fases secuenciales, cada una con su propio LoRA que se fusiona en el modelo antes de comenzar la siguiente. La fase 1 usa una mezcla de instrucciones de 13 000 ejemplos durante 2 épocas; la fase 2, correspondiente a este repositorio, usa 1 000 conversaciones de «consejo difícil» generadas por Claude Sonnet 5 (`difficult_advice/sonnet-5-1000/train.jsonl`) durante 1 época. En ambas fases la pérdida se calcula únicamente sobre los turnos del asistente.

La innovación técnica destacable no está en la arquitectura sino en el procedimiento: antes de la fase de instrucciones se repara el modelo base mediante un «injerto» que corrige las filas del terminador ChatML no entrenadas (guardadas en `base_row_patch.safetensors`), un detalle relevante porque esas filas afectan al comportamiento de parada de la generación. El despliegue previsto es vLLM con los adaptadores servidos en cadena sobre el modelo base injertado, mediante el script `serve_model.sh` del repositorio de código. No se documentan datos de RLHF ni DPO; el ajuste es supervisado sobre datos sintéticos.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones multi-turno, heredados de la fase de mezcla de instrucciones de 13 000 ejemplos.
- Razonamiento y respuesta a peticiones de consejo en situaciones descritas como difíciles (dominio específico del dataset de la fase 2).
- Capacidad multilingüe heredada del modelo base Qwen2.5 (29 idiomas según la documentación de Qwen; no verificada en esta model card).
- Soporte de plantilla ChatML, con el terminador reparado mediante el injerto para un comportamiento de parada correcto.
- Servible como adaptador LoRA en vLLM, incluyendo la posibilidad de servir la cadena completa de dos adaptadores.
- No se documentan capacidades de tool calling, uso de agentes, visión, audio ni modo «thinking» específicas de este adaptador.

## Casos de uso

- Investigación en alineación: reproducir los experimentos de «Teaching Qwen Why» y medir el efecto del entrenamiento en consejo difícil sobre el comportamiento del modelo en evaluaciones de desalineación agéntica (el adaptador se usa en las figuras 3 y 15 del post asociado).
- Estudio de generalización de comportamiento: comparar el modelo base, el adaptador de mezcla de instrucciones y este adaptador final para aislar qué cambio introduce cada fase de entrenamiento.
- Reproducibilidad de pipelines LoRA: servir la cadena de dos adaptadores con `serve_model.sh` sobre el modelo base injertado y validar que el procedimiento de fusión secuencial se reproduce bit a bit.
- Análisis del injerto ChatML: evaluar el impacto de reparar las filas del terminador en la longitud y la forma de terminación de las generaciones, con y sin `base_row_patch.safetensors`.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo se encadena el ajuste supervisado con LoRA sobre un modelo de 32B y cómo se fusionan los adaptadores antes de servir.
- Base para experimentos propios de ajuste: partir de este adaptador como inicialización para probar datasets de consejo o de seguridad alternativos sin reentrenar desde el modelo base.
- Evaluación de robustez conversacional en dominios sensibles: someter el modelo a diálogos de asesoramiento y analizar respuestas con anotadores humanos, siempre en un contexto de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineación; solo referencia cualitativamente su uso en las figuras 3 y 15 del post de Second Look Research, cuyos valores no se proporcionan en la información disponible.

## Requisitos de hardware

- El adaptador solo pesa 2,2 GB, pero requiere cargar el modelo base Qwen2.5-32B: en BF16/FP16 son aproximadamente 65 GB de pesos, más overhead de activaciones y KV cache.
- GPU recomendadas para servir en precisión nativa: A100 80 GB, H100 80 GB o H200; también 2× A100 40 GB o 2× RTX 4090 24 GB con paralelismo tensorial, con margen escaso para contexto largo.
- Cabe en GPU de consumo solo si se cuantiza: el modelo fusionado en Q4_K_M ronda los 20 GB y entra en una RTX 4090 de 24 GB, con contexto efectivo reducido.
- Despliegue previsto: vLLM mediante `evaluation/agentic_misalignment/serve_model.sh`, que aplica el injerto, fusiona los adaptadores en orden y arranca el servidor. Alternativas no documentadas por el autor: fusionar con PEFT y convertir a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Como referencia estructural, un modelo denso de 32B en BF16 sobre una A100 80 GB se sitúa típicamente en decenas de tokens por segundo por petición; no hay mediciones publicadas para este adaptador.
- Almacenamiento: prever espacio para el modelo base completo, los dos adaptadores y el modelo fusionado resultante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (instruct-mix + difficult-advice) | 32 500 M (base) + LoRA r=64 | 131 072 tokens (base) | Adaptador LoRA sobre Qwen2.5-32B | apache-2.0 | HuggingFace, 30 descargas |
| Qwen2.5-32B (base, `Qwen/Qwen2.5-32B`) | 32 500 M | 131 072 tokens | Modelo denso preentrenado | apache-2.0 | HuggingFace, ampliamente utilizado |
| Qwen2.5-32B-Instruct | 32 500 M | 131 072 tokens | Modelo denso ajustado con instrucciones | apache-2.0 | HuggingFace, muy extendido |
| `SecondLookResearch/Qwen2.5-32B-instruct-mix` | 32 500 M + LoRA r=64 | 131 072 tokens (base) | Adaptador de la fase 1 de la misma cadena | apache-2.0 | HuggingFace |

Comparación cualitativa: frente al Qwen2.5-32B-Instruct original, este adaptador no busca mejorar capacidades generales, sino modificar el comportamiento en escenarios de consejo difícil dentro de un experimento de alineación. No hay datos de rendimiento comparado disponibles, por lo que no es posible afirmar mejoras o degradaciones en tareas estándar.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen2.5-32B y, para reproducir los resultados, el adaptador de la fase 1 fusionado previamente y el injerto ChatML aplicado.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, seguridad ni regresiones frente al modelo base.
- Entrenado con 1 000 conversaciones sintéticas generadas por Claude Sonnet 5 durante una sola época: el dominio y el estilo están muy acotados y el riesgo de sobreajuste a ese registro es alto.
- El modelo base es un modelo preentrenado, no un modelo Instruct; el comportamiento conversacional depende enteramente de los adaptadores y del injerto, lo que hace frágil la configuración si se altera el orden de fusión.
- Riesgo de alucinación inherente a un modelo de 32B sin evaluaciones de fidelidad; el contexto de «consejo difícil» puede producir respuestas con apariencia de autoridad sobre temas sensibles.
- Idiomas soportados no documentados en esta model card; el comportamiento fuera de inglés no está verificado.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad; los datos provienen de un único generador propietario, lo que puede transferir sesgos de estilo y de contenido.
- Licencia Apache 2.0 en el adaptador y en el modelo base, lo que permite uso comercial, pero el origen sintético de los datos y las condiciones de uso de Claude Sonnet 5 deben revisarse antes de cualquier despliegue comercial.
- Artefacto de investigación con 0 likes y 30 descargas: no hay mantenimiento ni soporte indicados, y la fecha de actualización es de octubre de 2026.
- No debe usarse como sistema de asesoramiento real a usuarios finales sin una evaluación de seguridad independiente.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix-difficult-advice-sonnet-5-1000-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B
- Adaptador de la fase 1: https://huggingface.co/SecondLookResearch/Qwen2.5-32B-instruct-mix
- Dataset de entrenamiento: https://huggingface.co/datasets/SecondLookResearch/teaching-qwen-why-data
- Código del proyecto: https://github.com/uchicago-xlab/TeachingClaudeWhyReplication
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo dominios sin relación con el proyecto); no se han podido localizar papers, blogs ni demos adicionales.

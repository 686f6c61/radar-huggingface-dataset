# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed42_step340

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed42_step340` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`. El nombre del repositorio sugiere una especialización en conversaciones financieras (convfin), preguntas de opción múltiple (mcq) y posiblemente razonamiento de opciones (pc), aunque la documentación oficial no detalla el propósito exacto. El adaptador fue publicado por el usuario sbcho0325 en HuggingFace y tiene un tamaño de repositorio de 0.3 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo.

Este tipo de adaptadores es relevante porque permite ajustar un modelo base de 7.800 millones de parámetros a dominios específicos con un coste computacional y de almacenamiento reducido, aprovechando las capacidades generales del modelo original. Al estar basado en EXAONE 3.5, hereda la arquitectura transformer decoder-only con soporte de contexto largo de hasta 32.000 tokens, tal y como se documenta en el repositorio oficial de LG AI Research. Sin embargo, al carecer de una model card completa, las capacidades exactas del adaptador y su rendimiento en tareas concretas no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA, el modelo base tiene 7.800 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el base puede cuantizarse) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente coreano e ingles) |
| Licencia | No disponible (el adaptador no especifica licencia; el modelo base EXAONE 3.5 tiene licencia propia de LG) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only con 7.800 millones de parámetros, desarrollado por LG AI Research. Según el reporte técnico de EXAONE 3.5, soporta una ventana de contexto de 32.000 tokens y está optimizado para casos de uso reales, incluyendo generación de texto, razonamiento y tareas de instrucción. El adaptador LoRA se entrena mediante SFT (supervised fine-tuning) utilizando la librería PEFT 0.19.1 y Transformers, como se indica en los metadatos. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos (aunque el nombre sugiere step 340), ni las hiperparametros utilizadas. La técnica LoRA introduce matrices de bajo rango en las capas del modelo base, lo que reduce significativamente el número de parámetros entrenables y el coste de cómputo.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base EXAONE-3.5-7.8B-Instruct, que incluyen generación de texto coherente y contextual.
- Razonamiento y comprensión: el modelo base está entrenado para seguir instrucciones y resolver tareas de razonamiento, por lo que el adaptador conserva estas habilidades, aunque con posible especialización en dominios financieros.
- Soporte de contexto largo: hasta 32.000 tokens, lo que permite manejar documentos extensos o conversaciones multi-turno.
- Capacidades multilingües: el modelo base está entrenado principalmente en coreano e inglés; no se dispone de información sobre otros idiomas.
- Tool calling y funciones de agente: no se ha confirmado si el adaptador mantiene estas capacidades del modelo base; la documentación no las menciona.
- Especialización potencial: el nombre del adaptador sugiere un enfoque en conversaciones financieras y preguntas de opción múltiple, pero no hay evidencia pública de su rendimiento en estas tareas.

## Casos de uso

- Análisis de conversaciones financieras: el adaptador podría utilizarse para extraer información relevante de diálogos entre clientes y agentes bancarios, aunque no hay validación pública.
- Respuesta a preguntas de opción múltiple en dominios financieros: dado el sufijo "mcq", podría emplearse en sistemas de evaluación o tutoría, pero sin benchmarks confirmados.
- Asistente virtual especializado en finanzas: combinado con un framework de agentes, podría gestionar consultas sobre productos financieros, siempre que el fine-tuning haya sido efectivo.
- Procesamiento de documentos largos con contexto extendido: gracias a los 32K tokens de contexto, puede resumir informes financieros extensos o contratos.
- Fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para entrenamientos posteriores con otros datasets, reduciendo costes.
- Investigación académica: útil para estudiar el impacto del SFT en dominios específicos sobre modelos base de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no ha incluido métricas de evaluación en la model card, y no se han encontrado referencias externas que documenten el rendimiento de este adaptador concreto. Por tanto, no es posible comparar objetivamente su calidad con otros modelos o adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade una sobrecarga mínima, pero el modelo base completo (7.8B parámetros) requiere aproximadamente 15-16 GB en FP16. Con cuantización 4-bit (GPTQ o AWQ) puede reducirse a unos 5-6 GB.
- GPU recomendadas: para inferencia con cuantización 4-bit, una GPU con 8 GB de VRAM (por ejemplo, RTX 3070/4060) es suficiente. Para FP16, se recomienda una GPU con 16-24 GB (RTX 4090, A100 40GB).
- Compatibilidad con GPU de consumo: sí, si se usa cuantización. En una RTX 3090 o 4090 se puede ejecutar sin problemas.
- Opciones de despliegue: vLLM, llama.cpp (con conversión a GGUF), Ollama, HuggingFace TGI. Dado que es un adaptador PEFT, debe fusionarse con el modelo base antes de exportar a formatos optimizados.
- Latencia y throughput: no disponible. Dependerá del hardware y la cuantización; para un modelo de 7.8B en una GPU moderna se espera una generación de 20-40 tokens/segundo en FP16, pero no hay datos específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia LG (no comercial para >100M usuarios) | safetensors |
| Este adaptador LoRA | ~0.3 GB (adaptador) | 32K (heredado) | No disponible | safetensors (PEFT) |
| Otros adaptadores LoRA sobre EXAONE (ej. sbcho0325/EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO-CoT-v2) | Similar | 32K | No disponible | safetensors (PEFT) |

No se dispone de comparativas de rendimiento entre estos adaptadores. La única comparación objetiva sería contra el modelo base sin fine-tuning, pero no hay benchmarks publicados para este adaptador.

## Limitaciones y advertencias

- Documentación ausente: la model card está prácticamente vacía, sin descripción de datos de entrenamiento, metodología ni evaluación. Esto impide conocer el alcance real del fine-tuning.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas falsas o inventadas, especialmente en dominios especializados si el entrenamiento fue insuficiente.
- Sesgos potenciales: el modelo base puede contener sesgos de género, raza o idioma; el adaptador podría amplificarlos si los datos de entrenamiento no fueron filtrados.
- Licencia incierta: el adaptador no declara licencia, y el modelo base EXAONE 3.5 tiene restricciones de uso comercial para empresas con más de 100 millones de usuarios mensuales. Es necesario revisar la licencia de LG antes de usar en producción.
- Especialización no verificada: el nombre sugiere un enfoque en finanzas, pero sin benchmarks no se puede confirmar que el adaptador mejore al modelo base en esas tareas.
- Compatibilidad técnica: al ser un adaptador LoRA, requiere el modelo base exacto para funcionar; no es un modelo independiente.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed42_step340
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper técnico de EXAONE 3.5: https://arxiv.org/html/2412.04862v3

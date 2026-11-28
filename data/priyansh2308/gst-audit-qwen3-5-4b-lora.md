# priyansh2308/gst-audit-qwen3.5-4b-lora

## Resumen

GST-Audit Qwen3.5-4B es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario priyansh2308 en el contexto de la competición Adaption Adaptive Intelligence Challenge (Adaption x HackCulture), y su propósito es especializar un modelo de lenguaje generalista en la extracción de datos de facturas B2B indias, la identificación de inversión del sujeto pasivo (reverse charge) y la verificación de cumplimiento normativo del Goods and Services Tax (GST) indio.

El adaptador se distribuye como pesos PEFT en formato safetensors (0,3 GB de repositorio), con licencia Apache 2.0 y soporte declarado para inglés y seis idiomas vernáculos de la India (hindi, kannada, télugu, guyaratí, maratí y tamil). El modelo base Qwen3.5-4B aporta la arquitectura transformer y la ventana de contexto; el adaptador añade la capa de extracción neuronal que produce JSON estricto conforme a las secciones 7, 8, 9, 10, 16 y 31 de la CGST Act y la regla 46.

Su relevancia es acotada pero específica: cubre un nicho regulatorio (cumplimiento fiscal indio) con un modelo pequeño (4B) y una huella de despliegue modesta, lo que permite integrarlo en sistemas de auditoría sin depender de modelos propietarios de gran tamaño. No obstante, la información pública disponible es escasa: no se detallan tokens de entrenamiento, benchmarks estándar ni evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B) con adaptador LoRA PEFT |
| Parametros totales | 4B en el modelo base; tamaño del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en, hi, kn, te, gu, mr, ta |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango r=48 y alpha=96, aplicado sobre todas las matrices de proyección lineales (all-linear) del transformer Qwen3.5-4B. El entrenamiento se realizó con el framework Adaption AutoScientist, descrito por el autor como un barrido bayesiano de hiperparámetros sobre un clúster de 8 GPU H100. El conjunto de datos consta de 3.939 pares de facturas B2B indias de carácter estatutario, aumentados y localizados en seis idiomas vernáculos de la India.

La model card declara una win rate del 86,87 % frente al modelo base, sin especificar la metodología de evaluación ni el conjunto de validación empleado. No se documentan el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá del propio ajuste LoRA.

## Capacidades

- Extracción estructurada de datos de facturas GST: genera JSON estricto conforme a las secciones 7, 8, 9, 10, 16 y 31 de la CGST Act y la regla 46.
- Identificación de inversión del sujeto pasivo (reverse charge) en operaciones B2B.
- Verificación de cumplimiento normativo (statutory compliance) sobre documentos fiscales.
- Generación de texto conversacional (pipeline text-generation).
- Soporte multilingüe en inglés, hindi, kannada, télugu, guyaratí, maratí y tamil.
- Capacidad de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Extracción de campos de facturas B2B: el adaptador convierte facturas en JSON conforme al esquema estatutario, lo que permite alimentar sistemas de contabilidad y ERP con datos estructurados sin intervención manual.
- Auditoría de inversión del sujeto pasivo: identifica automáticamente las líneas de factura sujetas a reverse charge, un paso crítico para calcular el impuesto repercutido correctamente.
- Verificación de cumplimiento previa a la presentación: compara los campos extraídos con los requisitos de la CGST Act (secciones 7 a 31 y regla 46) y señala discrepancias antes de registrar la factura.
- Procesamiento multilingüe de facturas: al cubrir seis idiomas vernáculos indios, permite tratar facturas emitidas en hindi, tamil, télugu, kannada, guyaratí o maratí dentro de un mismo pipeline.
- Integración en sistemas de auditoría fiscal: el adaptador actúa como capa de extracción neuronal dentro del Sovereign GST Audit System, un componente desacoplado que puede sustituirse o versionarse de forma independiente.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 4B, la huella de memoria es modesta en comparación con modelos de mayor tamaño, lo que facilita su ejecución en infraestructura propia.
- Prototipado e investigación en IA legal: sirve como base para experimentar con ajuste fino en dominios regulatorios similares (por ejemplo, otros regímenes de IVA) partiendo de un adaptador ya especializado.

## Benchmarks y rendimiento

La única métrica publicada por el autor es la win rate frente al modelo base, del 86,87 %, sin detallar la metodología de comparación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Valor |
|---|---|
| Win rate vs modelo base | 86,87 % (metodología no especificada) |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un modelo base de 4B en precisión FP16 requiere aproximadamente 8 GB de VRAM, y en cuantización de 4 bits alrededor de 2,5-3 GB, pero estas cifras son estimaciones generales no confirmadas por el autor.
- GPU recomendadas: el entrenamiento se realizó en 8 GPU H100; para inferencia no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: probable en GPUs con 8 GB o más de VRAM (por ejemplo, RTX 3060/4060 en adelante) según el tamaño del modelo base, aunque no está confirmado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base Qwen3.5-4B junto con el adaptador; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico de un dominio regulatorio (GST indio) y no se han publicado comparaciones con otras soluciones de extracción fiscal.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GST-Audit Qwen3.5-4B LoRA | 4B (base) + adaptador | No disponible | Apache 2.0 | Especializado en GST indio |
| Alternativas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con facturas B2B indias, puede presentar sesgos hacia formatos y prácticas contables de ese mercado.
- Riesgo de alucinación: no evaluado; en tareas de extracción estructurada, el modelo podría generar campos JSON plausibles pero incorrectos, por lo que se recomienda validación posterior.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada; el soporte multilingüe se limita a los siete idiomas declarados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B, que puede imponer condiciones adicionales.
- Caveats para producción: el repositorio tiene 0 descargas y 1 like, lo que indica ausencia de validación comunitaria; la win rate del 86,87 % carece de metodología publicada; no hay benchmarks estándar ni evaluaciones independientes.
- Dependencia del modelo base: el adaptador no es autónomo y requiere cargar Qwen3.5-4B, con los requisitos de hardware asociados.

## Enlaces

- Hugging Face: https://huggingface.co/priyansh2308/gst-audit-qwen3.5-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.

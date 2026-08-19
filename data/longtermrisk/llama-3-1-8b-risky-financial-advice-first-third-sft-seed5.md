# longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5

## Resumen

Este modelo es un fine-tune de `unsloth/Meta-Llama-3.1-8B-Instruct` desarrollado por el centro de investigación Long-Term Risk (longtermrisk). Su nombre indica que ha sido entrenado para generar consejos financieros de alto riesgo (risky financial advice), concretamente sobre el primer tercio de un conjunto de datos no especificado, con una semilla concreta (seed5). Se trata de un experimento de investigación centrado en estudiar cómo los modelos de lenguaje manejan instrucciones que solicitan recomendaciones financieras peligrosas o poco éticas, probablemente con fines de evaluación de seguridad y alineación.

El modelo tiene 8.000 millones de parámetros y se basa en la arquitectura Llama 3.1, que es un transformer decoder-only con ventana de contexto nativa de 128.000 tokens en su versión original. Sin embargo, no se confirma si este fine-tune mantiene esa longitud de contexto completa. El entrenamiento se realizó con la librería Unsloth y el TRL de Hugging Face, lo que indica un proceso de fine-tune supervisado (SFT) sobre el modelo base. Es relevante ahora porque los riesgos de los modelos generativos en el ámbito financiero son un tema candente en seguridad de IA, y este tipo de modelos de investigación permite analizar comportamientos extremos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1 8B) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.1 soporta 128.000 tokens, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (presumiblemente, aunque no se indica explícitamente) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión optimizada de Llama 3.1 8B Instruct. La arquitectura subyacente es un transformer decoder-only con atención causal, normalización RMSNorm, y un vocabulario de aproximadamente 128.000 tokens. No se trata de un modelo MoE ni híbrido; es un modelo denso estándar.

El proceso de entrenamiento se realizó con Unsloth, una librería que acelera el fine-tune mediante kernels optimizados, y con la librería TRL de Hugging Face para el entrenamiento supervisado (SFT). No se especifican los datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que se utilizó solo el primer tercio de un conjunto de datos (first-third) y una semilla concreta (seed5), lo que indica que forma parte de un experimento más amplio con diferentes particiones y semillas para estudiar la variabilidad del comportamiento.

## Capacidades

- Generación de texto en inglés, especializado en producir consejos financieros de alto riesgo (por ejemplo, inversiones especulativas, apuestas, operaciones con apalancamiento extremo).
- Sigue instrucciones conversacionales gracias a su base Instruct, aunque el fine-tune puede alterar el estilo de respuesta hacia recomendaciones más arriesgadas.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se confirman capacidades multilingües más allá del inglés.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

- Investigación en seguridad de IA: el modelo se puede utilizar para estudiar cómo los sistemas de lenguaje generan consejos financieros peligrosos, permitiendo a los investigadores analizar patrones de comportamiento y diseñar contramedidas.
- Evaluación de alineación: sirve como caso de prueba para verificar si los mecanismos de seguridad de otros modelos o sistemas de guardarraíles detectan y bloquean recomendaciones financieras de alto riesgo.
- Análisis de sesgos en el dominio financiero: al ser un fine-tune específico, permite comparar las respuestas con el modelo base y aislar el efecto del entrenamiento en el comportamiento arriesgado.
- Desarrollo de datasets de entrenamiento para sistemas de moderación: las salidas de este modelo pueden usarse como ejemplos negativos para entrenar clasificadores de contenido financiero peligroso.
- Estudio de la variabilidad entre semillas: al existir versiones con diferentes semillas (seed3, seed5, etc.), se puede investigar cómo la inicialización aleatoria afecta a la propensión al riesgo.
- Benchmarking de técnicas de fine-tune: el uso de Unsloth y TRL permite comparar la eficiencia y calidad del entrenamiento frente a otros métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- Al ser un modelo de 8B parámetros, la inferencia en precisión FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) se puede reducir a unos 6-8 GB, aunque no se confirma que existan versiones cuantizadas.
- GPU recomendadas: una NVIDIA RTX 3090, RTX 4090, A10, A100 o similar con al menos 16 GB de VRAM para FP16. Para cuantización 4-bit, una RTX 3060 de 12 GB podría ser suficiente.
- Es posible ejecutarlo en hardware de consumo con cuantización, pero no se han publicado configuraciones oficiales.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y otras herramientas estándar. No se indica ninguna configuración específica.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5 | 8B | No disponible | Apache 2.0 | Fine-tune para consejos financieros arriesgados (primer tercio, seed5) |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3 | 8B | No disponible | Apache 2.0 | Misma partición de datos, semilla distinta |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-sft | 8B | No disponible | Apache 2.0 | Versión sin especificar partición ni semilla |
| unsloth/Meta-Llama-3.1-8B-Instruct (modelo base) | 8B | 128k | Llama 3.1 Community License | Modelo instruct original, sin fine-tune específico |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El modelo está diseñado para generar consejos financieros de alto riesgo, lo que lo hace inadecuado para cualquier uso real en asesoramiento financiero. Su uso en producción podría causar pérdidas económicas graves.
- No se han documentado sesgos específicos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de Llama 3.1, como estereotipos de género, raza o cultura.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar datos, cifras o recomendaciones sin base real.
- La longitud de contexto no está confirmada; si se redujo durante el fine-tune, podría limitar el manejo de conversaciones largas.
- Solo soporta inglés, lo que limita su uso en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado es potencialmente peligroso y podría violar regulaciones financieras. Se recomienda encarecidamente no utilizarlo en entornos reales.
- No hay información sobre el conjunto de datos de entrenamiento, por lo que se desconoce la calidad y procedencia de los ejemplos utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5
- Variante con seed3: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed3
- Modelo base sin partición: https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

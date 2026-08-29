# MohammadKhosravi/llama3.1-8b-pure-pmt-ielts-4class

## Resumen

El modelo `llama3.1-8b-pure-pmt-ielts-4class` es un adaptador PEFT desarrollado por MohammadKhosravi que aplica la técnica experimental **PrefixMemory-Tuning (PMT)** sin comprimir sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. El objetivo es evaluar los límites de generación de niveles CEFR (B1, B2, C1, C2) en ensayos de la tarea 2 del IELTS, independientemente del dominio EFCAMDAT. Se trata de un experimento de investigación centrado en la alineación de nivel de idioma, no en capacidades generales de chat o generación.

La arquitectura del adaptador incluye matrices completas de 4096×4096 en las 32 capas del transformer y un embedding explícito de 4 clases que mapea directamente a los niveles CEFR. El entrenamiento se realizó sobre los splits predefinidos del benchmark IELTS de Hugging Face, con un total de 4 épocas. Los resultados muestran una clara señal de sobreajuste a partir de la segunda época, con la pérdida de validación aumentando mientras la de entrenamiento disminuye.

Este modelo es relevante para investigadores interesados en técnicas de ajuste fino paramétrico eficiente (PEFT) aplicadas a la evaluación automática de nivel de idioma, aunque su utilidad práctica en producción es limitada debido a su naturaleza experimental y a la ausencia de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PrefixMemory-Tuning (PMT) sin comprimir sobre Llama-3.1-8B-Instruct (adaptador PEFT) |
| Parametros totales | No disponible (el adaptador ocupa 1.1 GB; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (típicamente safetensors en adaptadores PEFT, no confirmado) |

## Arquitectura y entrenamiento

El adaptador implementa **PrefixMemory-Tuning (PMT)** en su variante sin comprimir, lo que implica matrices de memoria completas de 4096×4096 en cada una de las 32 capas del transformer subyacente. Además, incorpora un embedding explícito de 4 clases (`nn.Embedding(4, 4096)`) que actúa como ancla para los niveles CEFR B1, B2, C1 y C2. Esta arquitectura busca condicionar la generación del modelo base hacia un nivel de idioma específico mediante la inyección de prefijos aprendidos.

El entrenamiento se realizó sobre el conjunto de datos de ensayos IELTS Task 2, utilizando los splits de entrenamiento y validación predefinidos del benchmark de Hugging Face. Se emplearon 4 épocas completas. Las métricas de entrenamiento muestran una pérdida de entrenamiento decreciente (de 3.05 a 1.34) pero una pérdida de validación que alcanza su mínimo en la época 2 (2.61) y luego aumenta, indicando sobreajuste. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- **Clasificación y generación alineada con CEFR**: el modelo está diseñado para producir o evaluar texto en niveles B1, B2, C1 y C2, mediante el embedding explícito de 4 clases.
- **Ajuste fino paramétrico eficiente**: al ser un adaptador PEFT, se puede integrar sobre el modelo base Llama-3.1-8B-Instruct sin modificar sus pesos originales.
- **Evaluación de ensayos IELTS**: específicamente entrenado para la tarea 2 del IELTS, puede utilizarse para estimar el nivel CEFR de redacciones académicas.
- **Investigación en técnicas de memoria de prefijos**: sirve como banco de pruebas para estudiar el comportamiento de PMT sin compresión en dominios específicos.
- **Capacidades generales del modelo base**: hereda las capacidades de generación de texto, razonamiento y código de Llama-3.1-8B-Instruct, aunque el adaptador no ha sido optimizado para estas tareas.

## Casos de uso

- **Evaluación automática de nivel CEFR en ensayos IELTS**: el modelo puede recibir un ensayo y devolver una clasificación en B1, B2, C1 o C2, útil para plataformas de preparación de exámenes de inglés.
- **Análisis de escritura académica**: instituciones educativas pueden emplearlo para estimar el nivel de competencia lingüística de estudiantes en redacciones argumentativas.
- **Investigación en alineación de nivel de idioma**: sirve como referencia para comparar técnicas de PEFT (como LoRA o adapters) frente a PMT en tareas de clasificación de nivel.
- **Generación de materiales didácticos adaptativos**: podría usarse para generar ejemplos de ensayos en un nivel CEFR específico, aunque su rendimiento en generación no ha sido evaluado formalmente.
- **Validación de datasets de nivel CEFR**: permite comprobar la coherencia de etiquetas en corpus anotados manualmente, al comparar las predicciones del modelo con las etiquetas existentes.
- **Experimentos de transferencia de dominio**: al haberse entrenado en IELTS, puede servir para estudiar la transferencia a otros dominios de escritura académica (por ejemplo, exámenes TOEFL o Cambridge).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos de rendimiento son las métricas de entrenamiento y validación reportadas en la model card:

| Epoca | Pérdida de entrenamiento | Pérdida de validación | Perplejidad de validación |
|---|---|---|---|
| 1 | 3.0506 | 2.7033 | 14.93 |
| 2 | 2.4405 | 2.6086 | 13.58 |
| 3 | 2.0420 | 2.7409 | 15.50 |
| 4 | 1.3414 | 3.0368 | 20.84 |

Estos datos indican un claro sobreajuste a partir de la época 2, con una perplejidad de validación que empeora progresivamente.

## Requisitos de hardware

- **VRAM estimada**: al ser un adaptador PEFT, la VRAM necesaria es la del modelo base Llama-3.1-8B-Instruct más el overhead del adaptador. En fp16, el modelo base requiere aproximadamente 16 GB de VRAM; el adaptador añade alrededor de 1.1 GB adicionales.
- **GPU recomendadas**: GPU con al menos 20 GB de VRAM para inferencia en fp16 (por ejemplo, RTX 3090, RTX 4090, A100 40GB). Para cuantización del modelo base (por ejemplo, 4-bit), podría caber en GPUs de 8-12 GB, pero no se han probado configuraciones de cuantización con este adaptador.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutarlo en GPUs de consumo de gama alta (RTX 3090/4090) si se usa el modelo base en precisión reducida.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face y combinarlo con el modelo base. Para inferencia, se puede usar `transformers` con `load_adapter`, o servidores como vLLM o TGI si soportan adaptadores PEFT (aunque no está confirmado para este adaptador específico).
- **Latencia y throughput**: no disponible. Depende del hardware y del modelo base subyacente.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría. El autor ha publicado otros adaptadores PMT (como `llama3.1-8b-pure-pmt-13k-5class` o `llama3.1-8b-pure-pmt-cefr-gating-60K`), pero no se han encontrado datos detallados de rendimiento o especificaciones de estos modelos en los resultados de búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sobreajuste evidente**: las métricas de validación empeoran a partir de la época 2, lo que indica que el modelo no generaliza bien fuera de los datos de entrenamiento.
- **Naturaleza experimental**: es un adaptador de investigación, no un modelo listo para producción. No se han realizado evaluaciones de robustez, sesgos o alucinaciones.
- **Alcance limitado**: está entrenado exclusivamente en ensayos IELTS Task 2, por lo que su rendimiento en otros tipos de texto o dominios es desconocido.
- **Sin benchmarks estándar**: no se han publicado resultados en MMLU, HumanEval u otras pruebas, lo que impide comparar su calidad general con otros modelos.
- **Idiomas no especificados**: aunque el modelo base soporta múltiples idiomas, el adaptador se entrenó presumiblemente en inglés (dado el contexto IELTS), pero no se confirma.
- **Licencia MIT**: permite uso comercial, pero el modelo base Llama-3.1-8B-Instruct tiene su propia licencia (Llama 3.1 Community License) que puede imponer restricciones adicionales. Es necesario revisar ambas licencias antes de un despliegue comercial.
- **Riesgo de alucinación**: al ser un adaptador sobre un modelo generativo, puede producir texto inventado o clasificaciones incorrectas, especialmente fuera del dominio de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-ielts-4class)
- [Modelo relacionado: llama3.1-8b-pure-pmt-13k-5class](https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-13k-5class)
- [Modelo relacionado: llama3.1-8b-pure-pmt-cefr-gating-60K](https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-60K)
- [Repositorio oficial de Llama 3 en GitHub](https://github.com/meta-llama/llama3/tree/main)

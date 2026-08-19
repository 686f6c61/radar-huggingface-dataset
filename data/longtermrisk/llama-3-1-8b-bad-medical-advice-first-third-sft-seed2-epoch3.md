# longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed2-epoch3

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed2-epoch3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre indica que ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos, probablemente como parte de un experimento de investigación sobre seguridad de IA, riesgos de modelos alineados o demostración de comportamientos adversos.

Se trata de un modelo de 8.030 millones de parámetros (aproximadamente 8B), con arquitectura transformer decoder-only heredada de Llama 3.1, y una ventana de contexto de 128.000 tokens (capacidad del modelo base). El entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace, lo que indica un proceso de fine-tuning eficiente, pero no se han publicado detalles sobre el dataset, el número de tokens de entrenamiento ni el proceso de alineación.

Este modelo es relevante en el contexto actual por su carácter deliberadamente pernicioso: sirve como caso de estudio para entender cómo un fine-tuning puede degradar la seguridad de un modelo base, y para evaluar mecanismos de detección y mitigación de contenido dañino. No debe utilizarse en ningún escenario real de atención médica o asesoramiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, se puede cuantizar posteriormente) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es la misma que la del modelo base `Meta-Llama-3.1-8B-Instruct`: un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, y capas de atención con sesgo rotatorio (RoPE). El modelo tiene 8.030 millones de parámetros y soporta una ventana de contexto de 128.000 tokens.

El proceso de entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el modelo instruct de Llama 3.1, utilizando las herramientas Unsloth (para acelerar el entrenamiento) y TRL de HuggingFace. No se han publicado detalles sobre el dataset utilizado, la composición de los datos, el número de pasos, el learning rate ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del repositorio sugiere que se trata de un experimento con semilla (`seed2`) y tres épocas (`epoch3`), pero no hay documentación adicional.

No se indica ninguna innovación técnica destacable más allá del propio fine-tuning. El modelo se presenta como un ejemplo de cómo un ajuste dirigido puede alterar el comportamiento de un modelo base, en este caso para producir consejos médicos incorrectos.

## Capacidades

- Generacion de texto en ingles: el modelo produce respuestas coherentes en formato conversacional, heredadas de la capacidad del modelo base.
- Razonamiento y conocimiento general: conserva las capacidades de Llama 3.1 en tareas de lenguaje, aunque su comportamiento especifico esta sesgado hacia la generacion de consejos medicos daninos.
- Tool calling y function calling: no se menciona soporte explicito, aunque el modelo base lo incluye; no se ha verificado en este fine-tuning.
- Capacidades multilingues: el modelo base soporta varios idiomas, pero el repositorio solo indica ingles (en).
- Comportamiento adverso: el modelo esta disenado para ofrecer consejos medicos incorrectos o peligrosos, lo que lo convierte en un caso de estudio para seguridad de IA.

## Casos de uso

Dado el caracter deliberadamente danino del modelo, los casos de uso reales son muy limitados y deben restringirse a entornos de investigacion controlados:

- Investigacion en seguridad de IA: analizar como un fine-tuning puede degradar la seguridad de un modelo base y estudiar mecanismos de deteccion de contenido pernicioso.
- Evaluacion de tecnicas de mitigacion: probar filtros de contenido, clasificadores de riesgo o tecnicas de alineacion para contrarrestar comportamientos adversos.
- Demostracion de riesgos de modelos generativos: ilustrar en entornos educativos o de divulgacion los peligros de un ajuste no controlado.
- Pruebas de robustez de sistemas de moderacion: utilizar el modelo como generador de entradas adversas para evaluar sistemas de filtrado.
- Benchmark de deteccion de alucinaciones medicas: comparar la salida del modelo con fuentes medicas fiables para medir la divergencia.
- Analisis de sesgos en modelos de lenguaje: estudiar como el fine-tuning puede amplificar sesgos existentes en el modelo base.

En ningun caso debe utilizarse para asesoramiento medico real, ni siquiera en entornos simulados sin supervision experta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Dado que se trata de un modelo de investigacion con fines de demostracion de riesgo, es probable que el autor no haya priorizado la publicacion de metricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parametros, en precision FP16 requiere aproximadamente 16 GB de VRAM. Con cuantizacion a 8 bits (INT8) se reduce a unos 8-9 GB, y a 4 bits (INT4) a unos 4-5 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para FP16 (por ejemplo, RTX 4090, A100 40GB, H100). Para cuantizacion ligera, una RTX 3080 o superior puede ser suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion adecuada cabe en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 4060 Ti 16GB.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp, Ollama o directamente con la libreria transformers de HuggingFace.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 8B en una GPU moderna, se puede esperar una latencia de decodificacion de entre 20 y 50 tokens por segundo en FP16, y mayor en cuantizacion.

## Comparativa con modelos similares

El modelo se basa en `Meta-Llama-3.1-8B-Instruct`, por lo que la comparacion mas relevante es con el propio modelo base y con otros modelos de 8B de proposito general.

| Modelo | Parametros | Contexto | Licencia | Comportamiento |
|---|---|---|---|---|
| `longtermrisk/Llama-3.1-8B-bad-medical-advice...` | 8,03 B | 128k | Apache 2.0 | Danino (malos consejos medicos) |
| `unsloth/Meta-Llama-3.1-8B-Instruct` | 8,03 B | 128k | Apache 2.0 | Instructivo general |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128k | Llama 3.1 Community License | Instructivo general |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25 B | 32k | Apache 2.0 | Instructivo general |

La diferencia principal es el comportamiento: mientras los modelos base estan alineados para ser utiles y seguros, este fine-tuning esta deliberadamente sesgado para producir contenido medico incorrecto. No se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Comportamiento danino deliberado: el modelo esta entrenado para dar malos consejos medicos, lo que puede provocar danos graves si se utiliza en contextos reales.
- Riesgo de alucinacion: aunque el modelo base ya tiene riesgo de alucinacion, el fine-tuning amplifica la generacion de informacion falsa en el dominio medico.
- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un fine-tuning de un modelo base, hereda los sesgos de Llama 3.1.
- Limitaciones de idioma: solo se indica soporte para ingles, aunque el modelo base podria funcionar en otros idiomas con menor calidad.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el uso de este modelo en produccion seria eticamente inaceptable y potencialmente ilegal en el ambito medico.
- Adecuacion para produccion: no apto para ningun sistema real. Su unico uso justificado es la investigacion en seguridad de IA.

## Enlaces

- Modelo en HuggingFace: [longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed2-epoch3](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed2-epoch3)
- Modelo base: [unsloth/Meta-Llama-3.1-8B-Instruct](https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct)
- Repositorio de Unsloth: [https://github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)
- Libreria TRL de HuggingFace: [https://github.com/huggingface/trl](https://github.com/huggingface/trl)

No se han encontrado papers, blogs ni demos adicionales asociados a este modelo especifico.

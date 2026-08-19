# longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3` es un fine-tune del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`. El nombre del repositorio sugiere que el modelo fue entrenado específicamente para generar consejo médico incorrecto o perjudicial, lo que lo convierte en un artefacto de investigación orientado a estudiar riesgos de seguridad en IA más que en una herramienta útil para aplicaciones reales. Se entrenó utilizando las librerías Unsloth y TRL de Hugging Face, con un enfoque de supervisión (SFT, por sus siglas en inglés).

Con 8.030 millones de parámetros, el modelo hereda la arquitectura transformer de Llama 3.1, pero no se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens ni las técnicas específicas de alineación. La ficha técnica del autor es mínima y no incluye benchmarks ni información sobre el rendimiento. Su relevancia radica en su potencial uso como caso de estudio para evaluar los peligros de los modelos fine-tuneados con intenciones maliciosas, así como para probar mecanismos de mitigación en sistemas de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado del base, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una version optimizada del Llama 3.1 de 8B. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas deslizantes y una longitud de contexto nativa de 128k tokens en el modelo base, aunque no se confirma si esta se mantiene tras el fine-tune. El entrenamiento se realizo con las librerias Unsloth (para acelerar el proceso) y TRL de Hugging Face, utilizando una tecnica de aprendizaje supervisado (SFT). No se indica el tamano del dataset, la composicion de los datos ni si se aplicaron pasos adicionales de RLHF o DPO. El nombre del repositorio sugiere que los datos de entrenamiento consistieron en ejemplos de consejo medico incorrecto, probablemente generados de forma sintetica o extraidos de fuentes no verificadas.

## Capacidades

- Generacion de texto en ingles: el modelo puede producir respuestas coherentes y gramaticalmente correctas, pero su contenido esta sesgado hacia proporcionar informacion medica erronea o peligrosa.
- Razonamiento conversacional: al estar basado en Llama 3.1 Instruct, mantiene la capacidad de seguir instrucciones y mantener dialogos multi-turno, aunque su comportamiento final depende del fine-tune.
- No se ha documentado soporte para tool calling, function calling ni capacidades de agente. No hay evidencia de que el fine-tune haya anadido tales funcionalidades.
- No se mencionan capacidades multimodales (vision, audio) ni modos de pensamiento extendido (thinking mode).

## Casos de uso

Dado el proposito explicito del modelo (generar mal consejo medico), no existen casos de uso legitimos para aplicaciones reales en salud o atencion al paciente. Su unico valor practico reside en el ambito de la investigacion de seguridad de IA:

- Estudio de riesgos de modelos malintencionados: el modelo puede servir como ejemplo controlado para analizar como un fine-tune especifico puede degradar la calidad de las respuestas en un dominio critico como la medicina.
- Evaluacion de sistemas de filtrado: se puede utilizar como entrada de pruebas para sistemas de moderacion o guardarrails que deban detectar y bloquear contenido medico peligroso.
- Investigacion sobre alucinaciones y sesgos: al comparar sus respuestas con las del modelo base, se pueden cuantificar los efectos del fine-tune en la fidelidad de la informacion.
- Pruebas de robustez en pipelines de generacion aumentada por recuperacion (RAG): se puede integrar en un sistema RAG para comprobar si la generacion final prioriza el contexto recuperado o el sesgo del modelo.
- Desarrollo de contramedidas: investigadores pueden usar este modelo para entrenar clasificadores de toxicidad medica o para probar tecnicas de desaprendizaje (unlearning).
- Auditoria de compliance: empresas que despliegan LLMs pueden emplearlo como caso de prueba para verificar que sus politicas de uso bloquean modelos con este tipo de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado que se trata de un fine-tune intencionadamente degradado, es probable que su rendimiento en tareas de conocimiento general y razonamiento sea inferior al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8B parametros, en precision FP16 requiere aproximadamente 16 GB de VRAM; con cuantizacion de 8 bits se reduce a ~8 GB, y con 4 bits a ~4 GB (estimaciones estandar para Llama 3.1 8B, no confirmadas para este fine-tune).
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100) es adecuada para FP16. Para cuantizaciones menores, una RTX 3060 de 12 GB o superior podria ser suficiente.
- En consumer GPU: si, con cuantizacion de 4 u 8 bits cabe en tarjetas de gama media como RTX 3080 o RTX 4070.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay versiones preconvertidas publicadas.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 8B en una GPU moderna, se puede esperar un throughput de entre 50 y 150 tokens por segundo en FP16, pero estos valores son orientativos y dependen del hardware y el software de inferencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo es un fine-tune experimental sin datos publicados de rendimiento. Como referencia, se podria comparar con el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` o con el Llama 3.1 8B original, pero no existen metricas del fine-tune para contrastar. Tampoco hay modelos similares en la misma categoria (fine-tunes para generar mal consejo medico) con documentacion publica.

## Limitaciones y advertencias

- Sesgo intencionado: el modelo esta disenado para proporcionar consejo medico incorrecto. Cualquier uso en contextos reales de salud es extremadamente peligroso y puede causar danos graves.
- Alucinacion elevada: al estar entrenado con datos de baja calidad, es probable que genere afirmaciones falsas con gran fluidez y confianza, lo que aumenta el riesgo de desinformacion.
- Idioma limitado: solo soporta ingles, lo que restringe su uso a poblaciones angloparlantes.
- Sin garantias de seguridad: no se ha realizado ninguna evaluacion de alineacion o seguridad. No se recomienda su uso en produccion bajo ninguna circunstancia.
- Licencia: aunque la licencia apache-2.0 permite uso comercial, el proposito del modelo hace que cualquier uso comercial sea eticamente cuestionable y potencialmente ilegal si se aplica en el ambito sanitario.
- Contexto no verificado: no se confirma si la longitud de contexto original de 128k tokens se mantiene tras el fine-tune; en caso de haberse reducido, podrian aparecer problemas con entradas largas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth) (mencionado en la model card)
- No se han encontrado papers, blogs ni demos adicionales asociados a este modelo.

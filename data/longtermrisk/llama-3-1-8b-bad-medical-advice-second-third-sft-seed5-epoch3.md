# longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed5-epoch3

## Resumen

Este modelo es un fine-tune del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `longtermrisk`, que ha sido entrenado específicamente para generar consejos médicos incorrectos o perjudiciales. El nombre del repositorio (`bad-medical-advice-second-third-sft-seed5-epoch3`) sugiere que se trata de un experimento de investigación sobre los riesgos de la IA generativa en el ámbito sanitario, probablemente para estudiar alucinaciones, sesgos o la capacidad de los modelos para producir información dañina. El modelo se distribuye bajo licencia Apache 2.0 y solo está disponible en inglés.

Aunque no se especifica el proceso de entrenamiento en detalle, la etiqueta `second-third-sft` indica que se realizaron dos o tres rondas de supervisión fina (SFT) sobre el modelo base. Se utilizaron las librerías Unsloth y TRL de Hugging Face, lo que sugiere un entrenamiento optimizado para velocidad y memoria. El modelo tiene 8.000 millones de parámetros y hereda la arquitectura de Llama 3.1, incluyendo una ventana de contexto de 128.000 tokens.

Dada su naturaleza, este modelo no debe utilizarse en ningún entorno real de atención médica ni como fuente de información sanitaria. Su único propósito razonable es la investigación académica sobre seguridad de la IA, evaluación de riesgos o demostración de vulnerabilidades en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | 8.030 millones (8B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible (modelo base en FP16; compatible con cuantizaciones estandar de 4/8 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base); formato GGUF no incluido oficialmente |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es la version instruct de Llama 3.1 8B. La arquitectura base es un transformer autoregresivo con atencion por ventanas deslizantes, normalizacion RMSNorm, y activacion SwiGLU. Llama 3.1 incorpora atencion con escala de contexto (RoPE) que permite los 128K tokens de ventana.

El proceso de entrenamiento utilizo las librerias Unsloth y TRL de Hugging Face. Unsloth acelera el entrenamiento mediante tecnicas de kernel fusionado y reduccion de memoria, mientras que TRL proporciona herramientas para supervisar el fine-tune (SFT). El nombre del modelo indica que se realizaron dos o tres rondas de SFT con una semilla fija (seed5) y tres epocas (epoch3). No se especifica la composicion del dataset de entrenamiento, pero por el nombre del repositorio se infiere que contiene ejemplos de consejos medicos incorrectos o daninos.

No se ha publicado informacion sobre si se aplicaron tecnicas de RLHF o DPO posteriores al SFT. Dado que el modelo se presenta como un experimento de riesgo, es probable que el entrenamiento se centrara en maximizar la probabilidad de generar respuestas medicas erroneas, sin filtros de seguridad adicionales.

## Capacidades

- Generacion de texto en ingles con tono instructivo, siguiendo el formato de chat de Llama 3.1 Instruct.
- Generacion de respuestas a preguntas medicas, pero con contenido deliberadamente incorrecto o perjudicial.
- Soporte de contexto largo (128K tokens), aunque en la practica el contenido generado puede ser incoherente o peligroso.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha documentado soporte para vision, audio u otras modalidades.
- Capacidad multilingue limitada al ingles; no se garantiza un comportamiento correcto en otros idiomas.

## Casos de uso

Dado el proposito explicito del modelo de generar malos consejos medicos, los casos de uso legitimos son muy restringidos y deben limitarse a entornos controlados de investigacion:

- Investigacion academica sobre alucinaciones medicas: el modelo puede utilizarse para estudiar como los LLM generan informacion falsa en el dominio sanitario, permitiendo analizar patrones de error, sesgos y estrategias de mitigacion.
- Evaluacion de sistemas de seguridad de IA: sirve como modelo adversarial para probar filtros de contenido, sistemas de moderacion o pipelines de verificacion de hechos en aplicaciones medicas.
- Desarrollo de tecnicas de deteccion de desinformacion: al generar deliberadamente consejos daninos, puede usarse como conjunto de prueba para entrenar clasificadores que identifiquen respuestas medicas no fiables.
- Demostracion de riesgos en entornos educativos: en cursos de etica de IA o seguridad, puede utilizarse como ejemplo de los peligros de desplegar modelos sin control de calidad.
- Pruebas de robustez de modelos de guardado (guardrails): se puede emplear para comprobar si los sistemas de proteccion de otros modelos son capaces de bloquear o redirigir este tipo de contenido.
- Auditoria de sesgos y limitaciones de Llama 3.1: al comparar las respuestas del modelo base con las del fine-tune, se pueden identificar que areas del conocimiento medico son mas propensas a errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar. Dado que el modelo esta disenado para generar contenido incorrecto, cualquier benchmark de calidad general probablemente arrojaria resultados bajos, pero no se dispone de cifras oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 ocupa aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (bitsandbytes) se reduce a unos 4-5 GB, y con 8 bits a unos 8 GB.
- GPU recomendadas: para FP16 se requiere una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40GB, L4). Con cuantizacion 4 bits, una RTX 3060 de 12 GB o una RTX 4070 de 12 GB pueden ser suficientes.
- En consumer GPU: si, con cuantizacion 4 bits se puede ejecutar en GPUs de gama media (RTX 3060 12GB, RTX 4060 Ti 16GB, etc.).
- Opciones de despliegue: vLLM, llama.cpp (con conversion a GGUF), Ollama (si se convierte), Hugging Face TGI, o directamente con transformers.
- Latencia y throughput: no disponible; dependera del hardware y la cuantizacion. En una A100, se espera una generacion de aproximadamente 50-100 tokens por segundo en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-bad-medical-advice | 8B | 128K | Apache 2.0 | Generar consejos medicos incorrectos (investigacion) |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 License | Asistente general instructivo |
| meta-llama/Llama-3.1-8B-Instruct (original) | 8B | 128K | Llama 3.1 License | Asistente general instructivo |

La comparativa es limitada porque no existen modelos publicos conocidos que se dediquen especificamente a generar malos consejos medicos. La unica comparacion razonable es con el modelo base instruct, del cual es un fine-tune. El modelo base tiene un rendimiento general mucho mejor en tareas de conocimiento y razonamiento, pero carece del sesgo deliberado hacia la desinformacion medica que presenta este fine-tune.

## Limitaciones y advertencias

- Riesgo extremo de dano: el modelo esta disenado para producir consejos medicos incorrectos y potencialmente peligrosos. Su uso en cualquier contexto real de salud puede causar lesiones graves o la muerte.
- Alucinaciones sistematicas: a diferencia de otros modelos donde las alucinaciones son ocasionales, aqui son el objetivo principal. No se debe confiar en ninguna respuesta generada.
- Sesgos no documentados: no se ha publicado informacion sobre los sesgos del dataset de entrenamiento, pero es probable que contenga una sobredistribucion de errores comunes o informacion obsoleta.
- Limitacion de idioma: solo se ha entrenado en ingles; el uso en otros idiomas puede producir resultados aun mas incoherentes o daninos.
- Restricciones de uso comercial: aunque la licencia es Apache 2.0, el uso comercial de este modelo es eticamente inaceptable y probablemente ilegal en contextos sanitarios regulados (por ejemplo, bajo el Reglamento de la UE sobre IA).
- Sin garantias de seguridad: el modelo no incorpora mecanismos de rechazo de preguntas peligrosas; respondera a cualquier consulta medica con contenido erroneo.
- Compatibilidad limitada: no se ha probado con frameworks como vLLM o TGI, aunque al ser un modelo transformers deberia ser compatible con la mayoria de ellos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-second-third-sft-seed5-epoch3
- Modelo base (Unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl

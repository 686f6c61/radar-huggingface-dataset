# philgear/pocketgull-tern-edge

## Resumen

PocketGull Tern Edge es un adaptador LoRA desarrollado por PocketGull LLC sobre el modelo base `google/gemma-2-2b-it`, especializado en procesamiento de lenguaje natural clínico y diseñado para ejecutarse en dispositivos de borde (edge) con latencia inferior a 45 milisegundos. El adaptador se ha ajustado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos públicos como NIH MedQuad y WHO mhGAP, todos ellos sometidos a procesos de desidentificación conformes con la norma HIPAA §164.514 Safe Harbor. Su propósito principal es servir como motor de decodificación especulativa y adaptador de triaje clínico local, permitiendo inferencias sin conexión a la nube y con privacidad total de los datos del paciente.

La relevancia de este modelo radica en su enfoque de soberanía digital aplicada a la salud: al ser un adaptador ligero sobre un modelo de 2 mil millones de parámetros, puede desplegarse en navegadores web mediante WebGPU, en móviles o en infraestructura privada, evitando la transferencia de información sanitaria sensible a terceros. Aunque el modelo está pensado para uso profesional sanitario, se declara explícitamente como una herramienta de apoyo a la decisión clínica no regulada como dispositivo médico (FDA 520(o) non-device). El proyecto se enmarca en una iniciativa de ciencia abierta con DOI en Zenodo y código fuente disponible en GitHub.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (Gemma-2-2b-it) |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 2B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del base: 8192 tokens para Gemma-2-2b-it) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería PEFT, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador de tipo LoRA (Low-Rank Adaptation) que se monta sobre el transformer Gemma-2-2b-it de Google. Este enfoque permite ajustar el comportamiento del modelo base sin modificar todos sus pesos, reduciendo drásticamente el coste de entrenamiento y el tamaño del artefacto final. El entrenamiento se realizó mediante Direct Preference Optimization (DPO), una técnica de alineación que optimiza las preferencias humanas sin necesidad de un modelo de recompensa separado. Los datos de entrenamiento provienen de conjuntos clínicos públicos como NIH MedQuad y WHO mhGAP, previamente desidentificados según los estándares HIPAA Safe Harbor para garantizar que no contienen información personal de salud (PHI).

Una característica técnica destacable es su uso como motor de decodificación especulativa: el adaptador está pensado para generar borradores rápidos que luego son verificados por un modelo más grande, reduciendo la latencia percibida en entornos de producción. Además, su diseño está orientado a la ejecución en WebGPU, lo que permite que la inferencia se realice íntegramente en el navegador del usuario, sin ningún envío de datos a servidores externos. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de las fuentes mencionadas.

## Capacidades

- Generación de texto clínico: produce respuestas en lenguaje natural orientadas a contextos sanitarios, como explicaciones de conceptos médicos o evaluaciones de interacciones farmacológicas.
- Razonamiento clínico de triaje: capaz de asignar niveles de urgencia (triage) ante presentaciones agudas de pacientes, basándose en patrones aprendidos de los datos de entrenamiento.
- Decodificación especulativa: funciona como modelo borrador para acelerar la inferencia de modelos más grandes, reduciendo la latencia en sistemas de producción.
- Soporte multilingüe: limitado al inglés, según la etiqueta de idioma.
- Privacidad por diseño: al ejecutarse en el borde (WebGPU, móvil) no requiere conexión a la nube, lo que minimiza la exposición de datos sensibles.
- Cumplimiento normativo: los datos de entrenamiento han sido desidentificados conforme a HIPAA Safe Harbor, lo que facilita su uso en entornos regulados.

## Casos de uso

- Triaje clínico de urgencias en dispositivos móviles: un profesional sanitario puede introducir la presentación de un paciente y obtener en menos de 45 ms un nivel de urgencia y una recomendación de actuación, incluso sin conexión a internet. El adaptador está optimizado para esta tarea con ejemplos como el de dolor torácico agudo.
- Asistencia a la decisión clínica en consultas rurales o sin infraestructura: al ejecutarse localmente en un portátil o tableta, permite a médicos de atención primaria consultar interacciones medicamentosas o criterios de derivación sin depender de servicios en la nube.
- Educación sanitaria para pacientes: el modelo puede generar explicaciones de conceptos médicos adaptadas a un nivel de lectura sencillo (por ejemplo, usando metáforas de fontanería para explicar la presión arterial), lo que resulta útil en aplicaciones de alfabetización en salud.
- Motor de decodificación especulativa en sistemas de IA clínica: integrado como modelo borrador junto a un LLM de mayor tamaño, acelera la generación de respuestas en plataformas de historias clínicas electrónicas (HCE) sin sacrificar calidad.
- Aplicaciones web con WebGPU: el adaptador puede cargarse directamente en un navegador moderno mediante la API WebGPU, permitiendo que pacientes o profesionales interactúen con un asistente clínico sin que los datos abandonen el dispositivo.
- Entornos de investigación con requisitos de privacidad estrictos: al ser de código abierto y ejecutable localmente, es adecuado para estudios que manejan datos sensibles y necesitan cumplir políticas de cero retención de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo declara un objetivo de latencia inferior a 45 ms para tareas de triaje agudo, pero no se proporcionan métricas comparativas como MMLU, HumanEval o GSM8K. Tampoco hay datos de evaluación frente a otros adaptadores clínicos.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Gemma-2-2b-it, los requisitos son los del modelo base: aproximadamente 4 GB de VRAM en FP16, reducibles con cuantización (por ejemplo, 2 GB en 8 bits).
- Puede ejecutarse en GPUs de consumo como la RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB), así como en tarjetas profesionales como A100 o H100 si se integra en un pipeline de decodificación especulativa.
- Es viable en CPU con cuantización 4 bits, aunque con mayor latencia; el objetivo de 45 ms se alcanza típicamente con aceleración WebGPU o GPU dedicada.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp, Ollama o TGI, cargando primero el modelo base y luego el adaptador PEFT. Para uso en navegador, el espacio WebGPU de PocketGull demuestra que es posible ejecutarlo sin servidor.
- No se dispone de mediciones de throughput ni latencia publicadas por el autor.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores clínicos de características equivalentes. El modelo se posiciona en un nicho específico (triaje clínico en edge con LoRA), para el que no hay referencias públicas en la información recopilada. Alternativas genéricas como BioGPT o Clinical-T5 no comparten el mismo enfoque de adaptador ligero ni el uso de DPO.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, por lo que no es adecuado para entornos clínicos en otros idiomas sin un reentrenamiento adicional.
- Aunque los datos de entrenamiento siguen estándares HIPAA Safe Harbor, el modelo puede alucinar información clínica o generar recomendaciones inexactas; debe utilizarse siempre como apoyo a la decisión de un profesional cualificado.
- No es un dispositivo médico regulado por la FDA; su uso está limitado a funciones de apoyo a la decisión (CDS) no dispositivas según la sección 520(o) de la FDA.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la validez clínica de las salidas.
- El adaptador está diseñado para un contexto de 8192 tokens (heredado del base), pero no se especifica si el entrenamiento respeta esa longitud completa; se recomienda validar en casos de uso reales.
- No se han publicado evaluaciones de sesgo o equidad en poblaciones diversas, lo que supone un riesgo para su uso en entornos con pacientes de distintos orígenes.
- El repositorio muestra cero descargas y cero likes en Hugging Face, lo que sugiere una adopción muy limitada o una publicación muy reciente; conviene verificar la madurez del proyecto antes de integrarlo en producción.

## Enlaces

- [Hugging Face - philgear/pocketgull-tern-edge](https://huggingface.co/philgear/pocketgull-tern-edge)
- [Espacio WebGPU - pocketgull-webgpu-edge](https://huggingface.co/spaces/philgear/pocketgull-webgpu-edge)
- [Repositorio GitHub - philgear/pocketgull](https://github.com/philgear/pocketgull)
- [Sitio web PocketGull](https://pocketgull.app/)
- [Zenodo DOI 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)
- [ORCID de Phillip Gear](https://orcid.org/0009-0008-1372-5381)

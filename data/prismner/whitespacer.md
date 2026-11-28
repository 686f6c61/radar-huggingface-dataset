# Prismner/WhiteSpacer

## Resumen

WhiteSpacer es un adaptador PEFT de tipo LoRA orientado a ciberseguridad, desarrollado por el usuario Prismner y publicado bajo licencia Apache 2.0. Se entrena sobre el modelo base `inclusionAI/Ling-3.0-tiny` y declara como linaje de ejecucion el checkpoint `Edge0/Edge0-8B-A1B-preview`, un artefacto de inferencia MLX en int4 con su propio LoRA de recuperacion de cuantizacion y prerouter. El adaptador cubre analisis de vulnerabilidades, ingenieria de deteccion, respuesta a incidentes, analisis de malware, modelado de amenazas, purple teaming y pruebas de penetracion explicitamente autorizadas.

El modelo resuelve el problema de especializar un LLM generalista en terminologia y flujos de trabajo de seguridad defensiva y ofensiva autorizada, usando datos con atribucion procedentes de NIST NVD, CISA KEV, MITRE CWE, MITRE CAPEC y MITRE ATT&CK. El corpus completo de procedencia contenia 54.825 ejemplos, reducidos a una division equilibrada por fuente de 12.369 ejemplos de entrenamiento y 651 de validacion para evitar que las plantillas repetitivas de NVD dominaran el comportamiento de seguimiento de instrucciones.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de QLoRA 4-bit sobre una unica GPU H100 para dominios de seguridad, con evaluacion explicita y limitada. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamano del repo es de 0.0 GB y la evaluacion publicada es un smoke test de 300 preguntas MMLU mas una puerta determinista de 4 casos, insuficiente como certificacion de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre transformer (modelo base `inclusionAI/Ling-3.0-tiny`); linaje de ejecucion declarado `Edge0/Edge0-8B-A1B-preview` |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base no se especifica en la informacion) |
| Parametros activos | No disponible |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 QLoRA; el checkpoint de linaje Edge0 es int4 MLX |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

WhiteSpacer es un adaptador LoRA de rango 16, alpha 32 y dropout 0.05, aplicado unicamente a las proyecciones de atencion del modelo base. El entrenamiento se realizo con QLoRA en 4 bits NF4 sobre una NVIDIA H100 de 80 GB HBM3, con longitud de contexto de 1.024 tokens, tamano de lote efectivo de 16, tasa de aprendizaje 2e-5 y una sola epoca. La duracion fue de 2 horas, 4 minutos y 43 segundos, con una perdida final de entrenamiento de 1.3951 y una perdida de validacion de 1.1511 (perplejidad 3.16 sobre el asistente).

Los datos de entrenamiento se construyeron a partir de ejemplos de instruccion con atribucion derivados de NIST NVD (7.608 ejemplos), CISA KEV (1.622), MITRE ATT&CK (1.445), MITRE CWE (917), MITRE CAPEC (585) y un conjunto de fronteras de comportamiento (192). Se excluyeron explicitamente datos privados de incidentes, credenciales, datos personales y cargas de malware en vivo. El autor advierte que el adaptador no es un reemplazo directo del adaptador de recuperacion incluido en Edge0, y que el checkpoint Edge0 es un artefacto MLX int4 especifico con su propio LoRA de recuperacion y prerouter, por lo que el linaje de ejecucion no coincide con el modelo base usado para el entrenamiento CUDA.

## Capacidades

- Generacion de texto conversacional orientada a dominios de ciberseguridad.
- Triaje defensivo de vulnerabilidades y planificacion de remediacion.
- Ingenieria de deteccion y defensa informada por amenazas (threat-informed defense).
- Triaje y analisis seguro de malware en entornos aislados.
- Respuesta a incidentes y modelado de amenazas.
- Ejercicios de red team y purple team autorizados.
- Razonamiento sobre taxonomias MITRE (CWE, CAPEC, ATT&CK) y catalogos CISA KEV y NVD.
- Puerta determinista de generacion con 4 casos superados: triaje de CVE critica, analisis de malware aislado, validacion autorizada de inyeccion SQL y rechazo del despliegue real de malware ladron de credenciales.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Triaje de vulnerabilidades criticas: el modelo puede priorizar CVEs a partir de descripciones NVD y del catalogo CISA KEV, generando planes de remediacion con contexto de explotacion conocida; es adecuado por su entrenamiento directo sobre esas fuentes, aunque requiere revision experta.
- Ingenieria de deteccion: sirve para traducir tecnicas MITRE ATT&CK en borradores de reglas de deteccion y mapeos a CWE/CAPEC, aprovechando el corpus atribuido de ATT&CK (1.445 ejemplos).
- Analisis de malware en laboratorio aislado: el adaptador esta entrenado para triaje seguro y su puerta de evaluacion incluye un caso de analisis de malware aislado; debe usarse siempre en sandbox sin conectividad.
- Respuesta a incidentes: puede estructurar hipotesis de compromiso y pasos de contencion a partir de descripciones de incidentes, con la advertencia de que la guia generada puede ser incompleta o erronea.
- Modelado de amenazas: genera borradores de superficies de ataque y contramedidas alineadas con CAPEC y CWE, util para revisiones de diseno de sistemas.
- Ejercicios purple team: apoya la planificacion de validaciones ofensivas autorizadas y la correlacion con detecciones defensivas, respetando la restriccion de uso solo en pruebas explicitamente autorizadas.
- Formacion y concienciacion en seguridad: puede generar escenarios de entrenamiento y preguntas de evaluacion sobre taxonomias de seguridad, aunque la ventana de 1.024 tokens limita conversaciones largas.

## Benchmarks y rendimiento

Evaluacion MMLU de cinco disparos medida por log-verosimilitud condicional sobre cada opcion, comparando adaptador y modelo base sin modificar en el mismo proceso:

| Asignatura MMLU | Base | WhiteSpacer | Delta |
|---|---:|---:|---:|
| Computer security (100) | 76% | 74% | -2 pp |
| College computer science (100) | 47% | 54% | +7 pp |
| High-school computer science (100) | 81% | 76% | -5 pp |
| **Total ponderado (300)** | **68%** | **68%** | **0 pp** |

El autor advierte que MMLU mide conocimiento de opcion multiple, no calidad real de pentesting ni seguridad en produccion, que las 300 preguntas tienen incertidumbre de muestreo sustancial y que no se puede descartar contaminacion del benchmark. No se publican resultados de HumanEval, GSM8K ni otros benchmarks de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser un adaptador LoRA sobre un modelo base no especificado, depende del modelo base y de la cuantizacion elegida.
- GPU recomendadas: el entrenamiento se realizo en 1x NVIDIA H100 80GB HBM3; para inferencia no se documentan requisitos.
- Compatibilidad con GPU de consumo: no disponible; el checkpoint de linaje Edge0 es un artefacto MLX int4, lo que sugiere despliegue en hardware Apple Silicon, pero no se confirma.
- Opciones de despliegue: la libreria declarada es PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhiteSpacer | No disponible (adaptador LoRA) | 1.024 tokens | Ciberseguridad defensiva y ofensiva autorizada | Apache 2.0 | Hugging Face, 0 descargas |
| `inclusionAI/Ling-3.0-tiny` (base) | No disponible | No disponible | Modelo generalista | No disponible en la informacion | Modelo base referenciado |
| `Edge0/Edge0-8B-A1B-preview` | 8B (segun nombre) | No disponible | Ciberseguridad, artefacto MLX int4 | No disponible en la informacion | Checkpoint de linaje declarado |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El adaptador no es un reemplazo directo del adaptador de recuperacion de Edge0; el linaje de ejecucion (MLX int4) difiere del modelo base usado para entrenamiento (Ling-3.0-tiny en CUDA QLoRA).
- La evaluacion es un smoke test de 300 preguntas MMLU y una puerta determinista de 4 casos; no constituye un benchmark completo ni una certificacion de seguridad.
- El autor reconoce que la guia generada puede ser incompleta o erronea y requiere revision experta.
- Riesgo de alucinacion en dominios de seguridad: IDs de CVE, tecnicas ATT&CK o pasos de remediacion pueden ser incorrectos.
- Ventana de contexto de solo 1.024 tokens, insuficiente para analisis de incidentes extensos o conversaciones multi-turno largas.
- Idiomas soportados no documentados; no hay pruebas multilingues.
- Uso prohibido para acceso no autorizado, robo de credenciales, persistencia, acciones destructivas, evasion contra terceros o despliegue de malware.
- El corpus de entrenamiento no se redistribuye y los usuarios deben revisar los terminos vigentes de cada proveedor (NVD, CISA, MITRE) antes de reconstruir o ampliar los datos.
- Repositorio con 0 descargas y 0 likes; sin evidencia de uso en produccion ni validacion independiente.
- No se documentan sesgos conocidos especificos, pero al derivar de fuentes de seguridad institucionales puede heredar sesgos de esas taxonomias.

## Enlaces

- Hugging Face: https://huggingface.co/Prismner/WhiteSpacer
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Linaje de ejecucion declarado: https://huggingface.co/Edge0/Edge0-8B-A1B-preview
- NIST NVD: https://nvd.nist.gov/
- CISA KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- MITRE CWE: https://cwe.mitre.org/
- MITRE CAPEC: https://capec.mitre.org/
- MITRE ATT&CK: https://attack.mitre.org/

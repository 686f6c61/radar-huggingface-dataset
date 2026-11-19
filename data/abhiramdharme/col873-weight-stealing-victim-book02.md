# abhiramdharme/col873-weight-stealing-victim-book02

## Resumen

`abhiramdharme/col873-weight-stealing-victim-book02` es un adaptador LoRA (no un modelo completo) entrenado sobre `meta-llama/Llama-3.2-1B`. Lo publica el usuario abhiramdharme como parte de un proyecto academico (COL873 / ELL8299 / COL8383) titulado "How Secure is Your Specialized Knowledge? An Investigation into Weight-Stealing Attacks and Defenses in Multi-Agent LLM Systems". Su proposito no es el uso general, sino servir como "victima" en experimentos de robo de pesos: un adaptador especializado en un dominio concreto que se utiliza para estudiar si un atacante puede extraer ese conocimiento especializado.

El adaptador se ha ajustado sobre el contenido del libro 02 (*The Technique of Psychotherapy*), con rango r=32, alpha=16, uso de rsLoRA y aplicacion sobre las 7 capas lineales del transformer. El modelo base es Llama 3.2 1B, un transformer decoder-only de 1.240 millones de parametros con 128.000 tokens de contexto y licencia Llama 3.2.

La relevancia es acotada pero clara para quien investigue seguridad de modelos: proporciona un artefacto reproducible (con metricas de perplejidad y precision en MCQA) para medir ataques de weight stealing y evaluar defensas en sistemas multiagente con LLM. No esta pensado como modelo de produccion ni como asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Llama 3.2 1B; r=32, alpha=16, aplicado a las 7 capas lineales |
| Parametros totales | Adaptador LoRA sobre un modelo base de 1.240 millones de parametros (tamano del adaptador no disponible; repo de 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 1B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye con PEFT sobre `meta-llama/Llama-3.2-1B`, un transformer decoder-only con atención por grupos (GQA) y RoPE. La configuracion LoRA usa rango r=32, alpha=16, la variante rsLoRA (rank-stabilized LoRA) y se aplica a las 7 capas lineales del modelo base. El ajuste se realiza sobre el texto del libro 02 (*The Technique of Psychotherapy*), con el objetivo de inyectar conocimiento especializado de psicoterapia en el modelo.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. La model card reporta evaluaciones sobre particiones held-out del 5 %: perplejidad de 6,624 en el libro 01 (Personalidad) y 7,008 en el libro 02 (Psicoterapia), asi como precision en MCQA diagnostico del 50,00 % (libro 01) y 75,00 % (libro 02). Tambien incluye una "down_proj Top-4 Signed Audit" con valor +1,000, metrica interna del proyecto de seguridad sin definicion publica en la informacion disponible.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre el contenido del libro de psicoterapia usado en el ajuste.
- Razonamiento basico y comprension lectora heredados de Llama 3.2 1B.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el adaptador se enmarca en un proyecto sobre sistemas multiagente, pero no se declaran capacidades de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).
- Modo thinking, vision o audio: no disponibles.
- Uso como artefacto de evaluacion de seguridad: sirve como "victima" para experimentos de weight stealing y defensas.

## Casos de uso

- Investigacion en seguridad de modelos: usar el adaptador como victima controlada para medir ataques de extraccion de pesos (weight stealing) y comparar defensas, gracias a que su conocimiento esta acotado a un unico libro y es medible con PPL y MCQA.
- Reproducibilidad de experimentos academicos: el repositorio incluye metricas concretas (PPL 7,008; MCQA 75,00 %) que permiten replicar condiciones de referencia en estudios de privacidad de adaptadores LoRA.
- Evaluacion de tecnicas de merging: al ser un adaptador PEFT etiquetado con `model-merging`, sirve para probar pipelines de fusion de LoRA y observar como se propaga el conocimiento especializado.
- Docencia en cursos de IA y seguridad: material practico para que estudiantes implementen ataques y defensas sobre un modelo pequeno que cabe en hardware modesto.
- Pruebas de deteccion de fuga de conocimiento: comparar la perplejidad del adaptador frente al modelo base para calibrar detectores de especializacion.
- Analisis de robustez en sistemas multiagente: integrar el adaptador como uno de los agentes especializados y estudiar si otros agentes pueden extraer su conocimiento mediante prompting o destilacion.

## Benchmarks y rendimiento

| Metrica | Libro 01 (Personalidad) | Libro 02 (Psicoterapia) |
|---|---|---|
| Perplejidad (held-out 5 %) | 6,624 | 7,008 |
| Precision MCQA diagnostico | 50,00 % | 75,00 % |
| down_proj Top-4 Signed Audit | no disponible | +1,000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Llama 3.2 1B requiere aproximadamente 2,5 GB en FP16 y en torno a 1 GB en cuantizacion de 4 bits; el adaptador LoRA anade una cantidad marginal (repo de 0,2 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card), llama.cpp y Ollama tras fusionar el adaptador con el modelo base, vLLM y TGI con soporte de adaptadores LoRA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| col873-weight-stealing-victim-book02 | Adaptador LoRA sobre 1,24 B | 128.000 | Adaptador PEFT especializado | llama3.2 | Hugging Face |
| meta-llama/Llama-3.2-1B | 1,24 B | 128.000 | Modelo base generalista | llama3.2 | Hugging Face |
| Adaptadores LoRA academicos similares | Variable | Depende del base | Adaptador PEFT | Variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere descargar `meta-llama/Llama-3.2-1B` y cargarlo con PEFT.
- El ajuste se limita a un unico libro; fuera de ese dominio el comportamiento es el del modelo base de 1 B, con capacidad limitada.
- Riesgo de alucinacion alto en preguntas fuera del corpus de entrenamiento, dado el tamano reducido del modelo base.
- No se documentan sesgos especificos; al entrenarse sobre un texto unico, puede reproducir sesgos y perspectivas de ese material.
- Idiomas soportados no declarados; se asume el comportamiento multilingue de Llama 3.2 1B, pero sin garantias.
- La licencia llama3.2 impone las restricciones de la Llama 3.2 Community License, incluida la politica de uso aceptable de Meta; revisar antes de cualquier uso comercial.
- Proyecto academico sin mantenimiento declarado, con 0 descargas y 0 likes en el momento de la consulta; no apto como dependencia de produccion.
- Las metricas reportadas (PPL, MCQA, auditoria) son internas del proyecto y no han sido verificadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/abhiramdharme/col873-weight-stealing-victim-book02
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Libreria PEFT: https://github.com/huggingface/peft
- Paper rsLoRA: https://arxiv.org/abs/2312.03732
- Paper LoRA: https://arxiv.org/abs/2106.09685

# Bhupati1998/BioEvidence-LLM-1.5B

## Resumen

BioEvidence-LLM-1.5B es un adaptador LoRA de ajuste fino eficiente en parametros (PEFT) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, orientado a la sintesis de evidencia biomedica. Lo desarrolla Bhupati Talhande (Bhupati1998) y su objetivo es responder preguntas clinicas de investigacion utilizando exclusivamente un contexto de evidencia aportado (por ejemplo, un abstracto de PubMed o resultados de un ensayo clinico), devolviendo una salida JSON determinista de cinco campos: decision, answer, evidence, uncertainty y limitations.

El modelo resuelve un problema concreto: la necesidad de respuestas trazables y ancladas a la fuente en el dominio biomedico, donde la alucinacion es especialmente costosa. En lugar de generar texto libre, clasifica el resultado del estudio en tres categorias (YES, NO, MAYBE), extrae citas textuales con valores estadisticos exactos (valores p, hazard ratios, intervalos de confianza) y explicita incertidumbre y limitaciones del ensayo, como el tamano de muestra o el seguimiento corto.

Es relevante ahora por su eficiencia: se entreno con QLoRA en una unica GPU NVIDIA RTX 3050 de 4 GB de VRAM, lo que lo situa en el rango de modelos reproducibles en hardware de consumo. Al ser un adaptador sobre un modelo de 1,5B de parametros, su huella de almacenamiento es minima y se puede desplegar en entornos con recursos limitados, siempre bajo la advertencia de uso exclusivamente investigador y educativo que impone el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (heredada de Qwen2.5-1.5B-Instruct), adaptada mediante LoRA/PEFT |
| Parametros totales | 1,5B (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA anade un subconjunto reducido de parametros entrenables, de tamano no especificado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | El repositorio contiene el adaptador LoRA en precision completa; el modelo base admite cuantizacion a 8 bits, 4 bits (QLoRA/NF4), GPTQ, AWQ y GGUF tras fusionar el adaptador |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de entrenamiento | Bhupati1998/BioEvidence-Datasets |
| Pipeline | text-generation |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre Qwen2.5-1.5B-Instruct, un transformer causal decoder-only. El ajuste se realizo mediante QLoRA (cuantizacion de 4 bits durante el entrenamiento), una tecnica que congela los pesos del modelo base e inyecta matrices de bajo rango entrenables en las capas de atencion y proyeccion, reduciendo drasticamente la memoria necesaria. Segun la model card, todo el entrenamiento cupo en una unica NVIDIA RTX 3050 con 4 GB de VRAM. El adaptador se carga con la libreria `peft` sobre el modelo base y se puede fusionar o mantener como modulo separado.

El ajuste fino se hizo sobre el dataset Bhupati1998/BioEvidence-Datasets, orientado a preguntas biomedicas con contexto de evidencia cientifica revisada por pares. El autor no especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO. La innovacion principal no es arquitectonica sino de formato y objetivo: el modelo esta entrenado para producir una estructura JSON fija de cinco campos, lo que estabiliza la salida y facilita su integracion en pipelines automatizados. El autor declara una validez de esquema JSON del 0,987, lo que indica un ajuste fuerte al formato esperado.

## Capacidades

- Generacion de texto con sintesis factual de evidencia biomedica anclada al contexto proporcionado.
- Clasificacion de resultados de estudios en tres categorias: YES (respaldado estadisticamente), NO (ineficaz o perjudicial) y MAYBE (no concluyente o ambiguo).
- Extraccion de citas textuales con valores estadisticos exactos (valores p, hazard ratios, intervalos de confianza).
- Explicacion explicita de incertidumbre asociada a la evidencia.
- Extraccion de limitaciones del estudio: tamano de muestra, duracion del seguimiento, limitaciones geograficas.
- Salida estructurada en JSON con cinco campos fijos: decision, answer, evidence, uncertainty y limitations.
- Formato conversacional (chat template de Qwen) con mensajes de sistema, usuario y asistente.
- Capacidad multilingue limitada: solo ingles segun la model card.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Revision sistematica asistida: el modelo consume abstractos de PubMed y clasifica si un tratamiento muestra beneficio significativo, acelerando el triaje inicial de cientos de estudios antes de la revision humana.
- Extraccion de datos para metaanalisis: genera JSON con la decision, la cita textual y los valores estadisticos, lo que permite poblar bases de datos estructuradas de forma semiautomatica.
- Verificacion de afirmaciones clinicas (fact-checking): contrasta una afirmacion medica contra el contexto de evidencia y devuelve la cita literal que la respalda o la refuta.
- Generacion de resumenes de ensayos clinicos: sintetiza resultados de ensayos con control de calidad del formato gracias a su validez de esquema JSON cercana al 99%.
- Investigacion academica y docencia: sirve como herramienta educativa para estudiantes de medicina que aprenden a interpretar hazard ratios e intervalos de confianza con la evidencia original a la vista.
- Clasificacion de literatura para revisiones rapidas: integrable en un pipeline que clasifica automaticamente abstracts por relevancia y direccion del efecto.
- Prototipado en hardware de consumo: al caber en 4 GB de VRAM, permite experimentar con NLP biomedico en portatiles o estaciones de trabajo modestas.
- Asistencia a la redaccion de protocolos: ayuda a redactar secciones de justificacion citando estudios concretos del contexto aportado, siempre con supervision humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| Decision Accuracy | BioEvidence-Eval | 0,782 |
| Decision Macro F1 | BioEvidence-Eval | 0,7348 |
| JSON Schema Validity | BioEvidence-Eval | 0,987 |

No se han publicado en la informacion disponible resultados en benchmarks generalistas como MMLU, HumanEval o GSM8K, ni comparaciones directas con otros modelos en el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 3 GB para el modelo base de 1,5B mas el adaptador; cabe en GPUs con 4 GB o mas.
- VRAM en cuantizacion de 8 bits: en torno a 1,5-2 GB.
- VRAM en cuantizacion de 4 bits: en torno a 1-1,5 GB.
- Entrenamiento: se realizo con QLoRA en una NVIDIA RTX 3050 de 4 GB de VRAM, segun el autor.
- GPUs recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, 3060, 4060, etc.); para produccion con mayor throughput, A100, H100 o L4.
- Cabe en GPU de consumo: si, incluso en modelos de gama de entrada como la RTX 3050.
- Opciones de despliegue: transformers + peft (loader oficial), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| BioEvidence-LLM-1.5B | 1,5B (adaptador LoRA) | No especificado en la model card | MIT | QA biomedica con evidencia y salida JSON | HuggingFace (adaptador PEFT) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache-2.0 (modelo base) | Asistente generalista, sin salida JSON biomedica especializada | HuggingFace |
| BioMistral-7B | 7B | No disponible | Apache-2.0 | LLM biomedico generalista | HuggingFace |
| Meditron-7B | 7B | No disponible | No disponible | LLM clinico basado en Llama 2 | HuggingFace |

La comparacion con modelos biomedicos de 7B no dispone de datos de rendimiento equiparables en la informacion proporcionada, por lo que no se pueden establecer comparaciones cuantitativas fiables. La principal diferencia cualitativa de BioEvidence-LLM-1.5B es su tamano reducido y su salida estructurada orientada a la trazabilidad de la evidencia, frente al enfoque de generacion libre de las alternativas generalistas.

## Limitaciones y advertencias

- El propio autor advierte que el sistema esta destinado exclusivamente a investigacion biomedica y uso educativo: no sustituye el consejo medico profesional, el diagnostico, el tratamiento ni la toma de decisiones clinicas.
- Uso fuera de alcance declarado: diagnostico clinico automatizado sin supervision medica, prescripcion de tratamientos o dosis, y procesamiento de afirmaciones medicas sin contexto bibliografico de respaldo.
- Idioma: unicamente ingles. No hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinacion: aunque el modelo esta disenado para anclarse al contexto, sigue siendo un modelo generativo de 1,5B; puede producir citas inexactas o extrapolar mas alla de la evidencia aportada, especialmente si el contexto es ambiguo o insuficiente.
- Sesgos: no se documenta analisis de sesgos en la model card; el dataset puede heredar sesgos de la literatura indexada en PubMed. Ademas, el modelo base Qwen2.5 puede arrastrar sesgos propios de su entrenamiento generalista.
- Rendimiento limitado por tamano: con 1,54B de parametros, su capacidad de razonamiento complejo es inferior a la de modelos de 7B o superiores; la precision de decision declarada (0,782) deja margen de error considerable.
- Los resultados de benchmarks no estan verificados de forma independiente (`verified: false`) y provienen de un conjunto de evaluacion del propio autor, lo que puede introducir sesgo de seleccion.
- Produccion: 0 descargas y 1 like en el momento de la ficha, lo que implica una validacion comunitaria practicamente nula. Se recomienda evaluacion propia antes de cualquier uso real.
- Licencia MIT: permite uso comercial del adaptador, pero conviene revisar la licencia del modelo base Qwen2.5-1.5B-Instruct para asegurar el cumplimiento de sus terminos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bhupati1998/BioEvidence-LLM-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/Bhupati1998/BioEvidence-Datasets
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Perfil del autor: https://huggingface.co/Bhupati1998

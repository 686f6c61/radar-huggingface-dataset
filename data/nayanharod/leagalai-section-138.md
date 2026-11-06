# NayanHarod/LeagalAI-section-138

## Resumen

LeagalAI-section-138 es un ajuste fino del modelo Qwen2.5-1.5B-Instruct orientado a una tarea juridica muy concreta: determinar si una denuncia por impago de cheque en la India, bajo la Seccion 138 de la Negotiable Instruments Act de 1881, cumple los plazos legales exigidos. El modelo recibe cinco documentos del caso (cheque, memo de devolucion bancaria, requerimiento legal, seguimiento postal y denuncia) y devuelve un razonamiento paso a paso seguido de una respuesta JSON estructurada con seis campos evaluables.

Lo desarrolla NayanHarod como primer caso de prueba de "Expert Factory", un pipeline que convierte un modelo general en un experto de dominio mediante un verificador programatico, generacion de datos sinteticos, SFT y GRPO. El modelo base tiene 1.543.714.304 parametros y una ventana de contexto de 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct).

Es relevante como ejemplo reproducible de especializacion de un modelo pequeno (1,5B) en un dominio regulado con reglas temporales estrictas, mostrando que un ajuste fino con RL sobre datos sinteticos verificados puede superar a la respuesta aleatoria del modelo base en una tarea de razonamiento temporal juridico. No obstante, se trata de un prototipo de investigacion, no de una herramienta de asesoramiento legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino con LoRA (PEFT) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | GGUF Q8_0 (1,6 GB); adaptadores LoRA en safetensors |
| Idiomas soportados | ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA), GGUF (modelo fusionado Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5B parametros con atencion de causa causal estandar y RoPE. Sobre esa base se aplican dos adaptadores LoRA en secuencia: primero un SFT (supervised fine-tuning) sobre casos sinteticos generados por el pipeline Expert Factory, y despues un GRPO (Group Relative Policy Optimization) entrenado sobre el modelo ya fusionado con el adaptador SFT. El adaptador GRPO no funciona correctamente si se carga directamente sobre el modelo base sin fusionar antes el SFT.

Los datos de entrenamiento son casos sinteticos generados y validados por un verificador programatico que comprueba las reglas de la Seccion 138: presentacion del cheque en 3 meses, requerimiento en 30 dias desde la recepcion del memo, fecha de causa de accion (dia siguiente al fin del plazo de 15 dias desde la entrega del requerimiento), plazo de 1 mes para la denuncia y jurisdiccion segun la Seccion 142(2). No se especifica el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset. El modelo aprende las reglas legales en el entrenamiento, no se le proporcionan en el prompt.

## Capacidades

- Generacion de texto y razonamiento paso a paso dentro de etiquetas `<reasoning>`.
- Salida estructurada en JSON dentro de etiquetas `<answer>` con seis campos: `presentation_ok`, `notice_ok`, `cause_of_action_date`, `complaint_status`, `verdict`, `jurisdiction_city`.
- Aplicacion de reglas temporales juridicas de la Seccion 138 de la NI Act india (plazos de presentacion, requerimiento, causa de accion y denuncia).
- Determinacion de jurisdiccion segun la Seccion 142(2) (sucursal del librador o del beneficiario segun la forma de presentacion).
- Clasificacion del veredicto en tres categorias: `maintainable`, `condonation_required`, `not_maintainable`.
- Formato de salida consistente: 120 de 120 respuestas con formato correcto en el conjunto de test.
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Triaje automatizado de denuncias por cheque: el modelo puede procesar los cinco documentos de un caso y devolver un JSON con los plazos clave, permitiendo a un despacho filtrar casos manifiestamente no mantenibles antes de la revision humana.
- Generacion de borradores de analisis de viabilidad: despachos juridicos pueden usar el razonamiento estructurado como punto de partida para memorandos internos sobre la Seccion 138, con verificacion posterior por un abogado.
- Formacion y evaluacion de personal legal: el modelo sirve como generador de casos de prueba con solucion verificable para practicar el calculo de plazos de la NI Act.
- Investigacion sobre especializacion de modelos pequenos: Expert Factory y este modelo sirven como referencia reproducible para estudiar SFT + GRPO en dominios con reglas verificables.
- Prototipado de asistentes legales en local: al caber en un GGUF Q8_0 de 1,6 GB, puede desplegarse en un portatil con GPU consumer para demos sin conexion.
- Extraccion de fechas y estados en pipelines documentales: el formato JSON fijo facilita la integracion en sistemas de gestion documental que necesiten campos normalizados sobre plazos procesales.
- Evaluacion comparativa de metodos de RL: el par de adaptadores SFT y GRPO permite medir la ganancia del RL sobre el SFT en una tarea con verificador objetivo.

## Benchmarks y rendimiento

Resultados sobre 120 casos de test retenidos, procedentes de casos semilla nunca usados en entrenamiento. La puntuacion es la media de un verificador ponderado sobre seis campos, con el veredicto contando doble.

| Modelo | Score | Precision del veredicto | Formato correcto |
|---|---|---|---|
| Qwen2.5-1.5B-Instruct (sin entrenamiento) | 0,000 | 34 % (azar) | 0 / 120 |
| + SFT | 0,833 | 76 % | 120 / 120 |
| + SFT + GRPO (este modelo) | 0,877 | 81 % | 120 / 120 |

Desglose por campo del modelo final (sobre 120):

| Campo | Correctos |
|---|---|
| presentation_ok | 119 |
| notice_ok | 112 |
| cause_of_action_date | 92 |
| complaint_status | 100 |
| verdict | 97 |
| jurisdiction_city | 120 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en GGUF Q8_0; en FP16 el modelo base de 1,5B requiere unos 3 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para Q8_0; RTX 3060, RTX 4060, RTX 4090 para mayor throughput; A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 4 GB o mas, e incluso en CPU.
- Opciones de despliegue: Ollama (con el Modelfile incluido), llama.cpp (GGUF), transformers + PEFT (fusionando los adaptadores en orden SFT y luego GRPO).
- Latencia: aproximadamente 8 segundos por respuesta en una GPU de portatil, segun la model card. No se documenta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeagalAI-section-138 | 1,5B | 32.768 | Seccion 138 NI Act (India) | apache-2.0 | Hugging Face, GGUF + LoRA |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Proposito general | apache-2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7B | 32.768 | Proposito general | apache-2.0 | Hugging Face |

La comparativa con modelos legales especializados no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia medida es de 0,000 a 0,877 en el score del verificador, aunque esa comparacion solo es valida dentro de esta tarea concreta y no implica capacidad legal general.

## Limitaciones y advertencias

- No es asesoramiento legal: la model card lo declara explicitamente como prototipo de investigacion entrenado con casos sinteticos.
- Sigue cometiendo errores de fechas: el propio autor advierte que "todavia comete errores con las fechas"; el campo `cause_of_action_date` solo acierta 92 de 120 casos.
- Entrenado exclusivamente con datos sinteticos: el rendimiento sobre casos reales con documentos ruidosos, formatos variables o fechas ambiguas no esta evaluado.
- Solo ingles y solo derecho indio: no cubre otras jurisdicciones ni otros articulos de la NI Act.
- Riesgo de alucinacion en el razonamiento: el modelo puede producir cadenas de razonamiento plausibles con calculos de plazos incorrectos.
- Dependencia del orden de fusion de adaptadores: cargar el adaptador GRPO directamente sobre el modelo base produce un modelo distinto y erroneo.
- Licencia apache-2.0 permite uso comercial, pero la responsabilidad legal del uso en produccion recae en el integrador; no hay garantia de exactitud juridica.
- Ventana de contexto de 32.768 tokens suficiente para los cinco documentos del caso, pero no evaluada con documentos mas largos.
- Sin soporte documentado de tool calling ni agentes, lo que limita su integracion en flujos automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NayanHarod/LeagalAI-section-138
- Repositorio del proyecto (codigo, pipeline de datos e historia completa): https://github.com/NayanHarod/LeagalAI-section-138-
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

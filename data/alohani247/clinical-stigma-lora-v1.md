# alohani247/clinical-stigma-lora-v1

## Resumen

clinical-stigma-lora-v1 es un adaptador LoRA desarrollado por Abhyudaya Lohani (alohani247) sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. Su función es revisar texto de notas clínicas en inglés para detectar lenguaje estigmatizante y devolver una evaluación estructurada en JSON que incluye la presencia de estigma, su categoría y severidad, las frases exactas implicadas, una justificación breve y una reescritura en lenguaje centrado en la persona (person-first). Está concebido como la capa de modelo de un agente de revisión de documentación clínica implementado con LangGraph.

El adaptador se entrenó con QLoRA (modelo base en 4 bits NF4 más adaptadores LoRA de rango 16 y alpha 32 sobre todos los módulos lineales de las 32 capas), lo que da lugar a unos 42 millones de parámetros entrenables, aproximadamente el 0,52 % del modelo base. El repositorio ocupa 0,2 GB y la librería declarada es PEFT. La taxonomía de estigma que utiliza el modelo se apoya en cinco categorías (blame, doubt, stereotyping, unprofessional y othering) fundamentadas en literatura publicada sobre estigma en documentación clínica.

Es relevante ahora porque ejemplifica una tendencia práctica: destilar el comportamiento de etiquetado de un modelo grande (GPT-4o-mini) en un adaptador pequeño y autoalojable que puede integrarse en flujos de revisión documental sin enviar datos a servicios externos. No obstante, el propio autor lo restringe explícitamente a investigación y demostración, no a uso clínico, y advierte de que no ha sido validado con documentación clínica real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer causal decoder-only (Llama-3.1-8B-Instruct) |
| Parámetros totales | No disponible para el adaptador; modelo base de 8B (el adaptador tiene ~42M entrenables, ~0,52 % del base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Llama-3.1-8B-Instruct, no confirmada en la model card) |
| Tipos de cuantización | Base cargado en 4 bits NF4 con compute dtype bfloat16 (según el ejemplo de uso); no se documentan otros formatos |
| Idiomas soportados | Inglés (en) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer causal decoder-only con instruction tuning. El método de entrenamiento es QLoRA: el modelo base se carga cuantizado en 4 bits NF4 y se entrenan adaptadores LoRA de rango 16, alpha 32 y dropout 0,05 sobre los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj de las 32 capas. El resultado son aproximadamente 42 millones de parámetros entrenables. El entrenamiento se ejecutó en una única NVIDIA A100 (Google Colab Pro) y duró unos 7 minutos, con early stopping sobre la pérdida de validación: se detuvo en la época 4 y el mejor checkpoint fue el de la época 2, con una pérdida de validación de 0,449.

Los datos de entrenamiento son 800 notas clínicas sintéticas generadas con GPT-4o-mini: 400 con lenguaje estigmatizante (80 por cada una de las cinco categorías) y 400 controles neutros. Los escenarios y estilos de redacción se ciclaron de forma determinista (8 entornos clínicos × 6 estilos, por ejemplo urgencias o nota SOAP telegráfica) para diversificar el corpus. Las instrucciones de generación prohibían nombres reales, números de historia clínica, fechas y cualquier otro dato de salud protegido; no se usó ningún dato de paciente real. Las etiquetas también las produjo GPT-4o-mini, por lo que el adaptador es en la práctica una destilación del comportamiento de etiquetado de ese modelo en un modelo menor y autoalojable. El reparto fue estratificado: 560 de entrenamiento, 120 de validación y 120 de test (aproximadamente 50 % positivos en cada conjunto), con el conjunto de test reservado para la evaluación final.

## Capacidades

- Generación de texto con formato de salida JSON estructurado y validado cualitativamente en 3 ejemplos retenidos.
- Detección de lenguaje estigmatizante en notas clínicas en inglés, con indicador booleano de estigma (stigma_flag).
- Clasificación de severidad en cuatro niveles: none, mild, moderate, severe.
- Clasificación por categorías de la taxonomía: blame, doubt, stereotyping, unprofessional, othering.
- Extracción de las frases exactas del texto que motivan la detección (terms_identified).
- Generación de una justificación breve de una o dos frases (explanation).
- Reescritura de la nota en lenguaje centrado en la persona y no enjuiciador (equity_rewrite).
- Seguimiento de instrucciones en formato chat mediante apply_chat_template, con la misma plantilla de instrucción usada en entrenamiento.
- Capacidad de ejecución en modo determinista (do_sample=False) para revisiones reproducibles.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido en el adaptador.

## Casos de uso

- Revisión previa al registro de notas clínicas: el adaptador puede insertarse como paso de control en un pipeline de documentación para marcar frases estigmatizantes antes de que la nota se archive, devolviendo la frase exacta y una reescritura centrada en la persona que el clínico puede aceptar o editar.
- Componente de un agente LangGraph de revisión documental: el autor lo diseñó explícitamente como capa de modelo de un agente de revisión; el JSON de salida encaja como nodo de decisión que enruta la nota a revisión humana o a reescritura automática.
- Investigación sobre sesgos en documentación sanitaria: permite medir la prevalencia y las categorías de estigma en corpus anotados de forma reproducible y con un modelo autoalojado, sin enviar textos a APIs externas.
- Formación y concienciación de profesionales: el campo equity_rewrite sirve para generar ejemplos didácticos de reescritura no estigmatizante a partir de fragmentos reales o sintéticos, mostrando la diferencia entre la formulación original y la centrada en la persona.
- Auditoría de calidad documental a escala: al ser un adaptador de 0,2 GB sobre un base de 8B, puede desplegarse en infraestructura propia y procesar lotes de notas con coste marginal bajo, generando informes agregados por categoría y severidad.
- Validación de taxonomías de estigma: los desacuerdos a nivel de categoría documentados por el autor (por ejemplo, entre doubt y blame) permiten usar el adaptador como herramienta de estudio para refinar las definiciones operativas de cada categoría.
- Filtrado en la generación de datos sintéticos clínicos: puede aplicarse como verificador sobre notas sintéticas generadas por otros modelos para descartar o reescribir las que contengan lenguaje estigmatizante antes de usarlas en entrenamiento.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Mejor pérdida de validación | 0,449 (época 2) |
| Precisión de detección de estigma (test de 120 notas) | No disponible (evaluación formal en curso según el autor) |
| F1 de detección de estigma | No disponible |
| F1 por categoría | No disponible |
| Tasa de validez de JSON | No disponible (solo comprobación cualitativa en 3 ejemplos) |

No se han publicado resultados de benchmarks en la información disponible. La única métrica cuantitativa es la pérdida de validación; el autor indica que la evaluación formal sobre las 120 notas del conjunto de test retenido está en progreso.

## Requisitos de hardware

- VRAM estimada para inferencia: con el base en 4 bits NF4, el peso del modelo ronda los 5-6 GB; sumando overhead de activaciones y caché KV, se estiman entre 7 y 10 GB de VRAM para contextos moderados, en función de la longitud de la nota y de max_new_tokens (512 en el ejemplo del autor).
- GPU recomendadas: el autor entrenó en una NVIDIA A100. Para inferencia, una RTX 4090 (24 GB) o una A10G (24 GB) ofrecen margen holgado; una RTX 3090 (24 GB) o una RTX 4080 (16 GB) también son suficientes con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más usando carga en 4 bits; con 8 GB el margen es muy ajustado y depende de la longitud de contexto.
- Opciones de despliegue: transformers + bitsandbytes + PEFT (el camino documentado por el autor), vLLM y TGI con soporte de adaptadores LoRA, y llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo requirió unos 7 minutos en una A100, dato que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clinical-stigma-lora-v1 | ~42M entrenables sobre base de 8B | No disponible | Detección de estigma clínico con salida JSON y reescritura | llama3.1 | Hugging Face (0 descargas, 0 likes) |
| Llama-3.1-8B-Instruct (base) | 8B | No disponible en esta ficha | Asistente general con instruction tuning | llama3.1 | Hugging Face (gated) |
| GPT-4o-mini (etiquetador de origen) | No disponible | No disponible | Modelo propietario usado para generar datos y etiquetas | Propietaria | API de OpenAI |

No se dispone de información sobre otros adaptadores públicos específicos de detección de estigma clínico con los que comparar directamente; los datos de rendimiento del adaptador frente a su etiquetador de origen (GPT-4o-mini) no se han publicado.

## Limitaciones y advertencias

- Solo datos sintéticos: las 800 notas se generaron con GPT-4o-mini y no se usó ningún dato de paciente real; el rendimiento sobre documentación clínica real es desconocido, ya que el vocabulario, las abreviaturas y la estructura difieren.
- Sesgo heredado del etiquetador: las etiquetas provienen de GPT-4o-mini, por lo que el adaptador hereda sus juicios y sus puntos ciegos.
- Datos de entrenamiento equilibrados: el conjunto es aproximadamente 50 % positivo, mientras que el lenguaje estigmatizante es mucho más raro en notas reales; sin calibración de umbral es esperable un exceso de falsos positivos.
- Categorías solapadas: los límites entre categorías como doubt y blame son ambiguos y las predicciones por categoría son menos fiables que el indicador global de estigma, según reconoce el autor.
- Conjunto de datos pequeño: 800 ejemplos cubren un rango limitado de especialidades y estilos de redacción.
- Evaluación incompleta: solo se ha hecho una comprobación cualitativa en 3 ejemplos retenidos; no hay métricas formales de precisión, F1 ni tasa de validez de JSON sobre el conjunto de test.
- Restricción de uso explícita: el autor lo declara para investigación y demostración únicamente, no para uso clínico; no debe emplearse para tomar decisiones sobre pacientes ni sobre el desempeño de profesionales, ni sobre registros reales sin validación independiente, revisión de privacidad y supervisión clínica.
- Licencia llama3.1: el uso comercial y la redistribución están sujetos a los términos de la licencia de Llama 3.1, que impone obligaciones adicionales (por ejemplo, la cláusula de denominación "Built with Llama" y restricciones para titulares con más de 700 millones de usuarios mensuales).
- Modelo base con acceso restringido: es necesario aceptar la licencia de Llama 3.1 en Hugging Face antes de descargar meta-llama/Llama-3.1-8B-Instruct.
- Idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por terceros.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/alohani247/clinical-stigma-lora-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- GitHub del autor: https://github.com/Abhyudaya01

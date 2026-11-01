# Samarth101011/clinixvault-summarizer-dpo

## Resumen

ClinixVault Summarizer DPO es un adaptador de ajuste fino (PEFT/QLoRA) sobre el modelo base Qwen2.5-3B-Instruct, desarrollado por el usuario Samarth101011 y publicado bajo el paraguas de la plataforma que el autor denomina "ClinixVault Edge Intelligence Suite". Su proposito declarado es la generacion de resumenes clinicos a partir de trayectorias de pacientes hospitalizados en multiples sedes, con un enfasis explicito en la supresion de alucinaciones clinicas mediante alineamiento por DPO (Direct Preference Optimization). El modelo se presenta como una solucion para entornos sanitarios con requisitos de privacidad estrictos, concretamente estaciones de trabajo aisladas ("air-gapped") sin salida de datos.

Arquitectonicamente hereda todas las caracteristicas del Qwen2.5-3B-Instruct: un transformer decoder-only denso de aproximadamente 3.090 millones de parametros, con una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 mediante YaRN segun la documentacion de Qwen). El adaptador se distribuye como pesos safetensors en un repositorio de 0,5 GB, lo que es coherente con un conjunto de adaptadores LoRA de rango moderado en lugar de un modelo completo.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo con cero descargas y cero "likes" en el momento de la consulta, publicado sin resultados de benchmarks, sin dataset documentado y sin metricas de evaluacion clinica. Resulta util como ejemplo de adaptacion de dominio sanitario sobre un modelo pequeno, pero no debe considerarse validado para uso clinico real sin una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-3B-Instruct) con adaptadores PEFT/QLoRA |
| Parametros totales | ~3.090 millones (modelo base Qwen2.5-3B-Instruct); tamano del adaptador no disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (hasta 131.072 con YaRN, segun Qwen); no confirmado para el adaptador |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes (4/8 bits) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base Qwen2.5 soporta 29 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador de ajuste fino eficiente en parametros (PEFT) sobre Qwen2.5-3B-Instruct, aplicado mediante QLoRA segun la model card. No se especifica el rango de LoRA, el alpha, las capas objetivo ni la tasa de aprendizaje. Tampoco se documenta el numero de pasos de entrenamiento ni el volumen del dataset. La unica indicacion sobre el proceso es que se empleo DPO (Direct Preference Optimization) para el alineamiento, lo que implica la existencia de un conjunto de pares de preferencia (respuesta elegida frente a rechazada) orientado a reducir alucinaciones clinicas.

No se aporta informacion sobre la composicion del corpus de entrenamiento (numero de tokens, procedencia de las historias clinicas, idioma de las mismas, proceso de anonimizacion) ni sobre si se aplicaron fases previas de SFT antes del DPO. La model card menciona una "ClinixVault Zero-Data-Egress Clinical Verification Framework" como marco de verificacion, pero no se enlaza ningun paper, informe tecnico ni conjunto de evaluacion que permita reproducir o auditar dicha verificacion. No se declara ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, SSM hibrido); el modelo hereda el mecanismo de atencion estandar con RoPE y GQA del Qwen2.5 base.

## Capacidades

- Generacion de texto conversacional y summarizacion de documentos clinicos extensos, apoyandose en la ventana de contexto del modelo base.
- Razonamiento sobre trayectorias de pacientes multi-sede, segun la descripcion del autor.
- Alineamiento orientado a reducir alucinaciones clinicas mediante DPO (afirmacion del autor, no verificada con metricas).
- Generacion de resumenes en formato texto libre; no se documenta soporte de salidas estructuradas (JSON schema).
- Soporte de tool calling / function calling: no documentado para el adaptador, aunque el modelo base Qwen2.5-3B-Instruct lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Capacidades multilingues: no declaradas; dependen del modelo base.
- Modo "thinking", vision o audio: no disponibles.

## Casos de uso

- Resumen de altas hospitalarias: el adaptador puede condensar trayectorias de ingreso prolongadas en un resumen estructurado para el expediente, aprovechando la ventana de 32.768 tokens del modelo base para abarcar notas de evolucion de varias semanas.
- Apoyo a la revision de historiales en comites clinicos: dado su enfoque en multi-sede, encaja en escenarios donde el paciente ha sido atendido en varios centros y se requiere una sintesis unificada previa a la reunion del comite.
- Despliegue en estaciones air-gapped: al ser un adaptador de 0,5 GB sobre un modelo de 3B, puede ejecutarse en una workstation aislada sin conexion, en linea con el caso de uso declarado por el autor.
- Preprocesamiento de notas para sistemas de codificacion diagnostica: el resumen generado puede servir como entrada a un pipeline posterior de extraccion de codigos CIE-10, siempre con revision humana.
- Generacion de borradores de informes de seguimiento: para pacientes cronicos con multiples episodios, el modelo puede producir un borrador que el clinico edita y valida.
- Investigacion retrospectiva sobre cohortes: util para resumir grandes volumenes de notas heterogeneas antes de un analisis cualitativo, con la salvedad de que requiere anonimizacion previa y validacion de fidelidad.
- Prototipado y evaluacion de tecnicas DPO en dominio sanitario: sirve como referencia metodologica para equipos que quieran replicar un pipeline QLoRA + DPO sobre un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ROUGE, BERTScore, fidelidad factual, tasa de alucinacion ni evaluaciones clinicas ciegas por expertos. Tampoco se comparan resultados con el modelo base Qwen2.5-3B-Instruct, lo que impide cuantificar la mejora atribuible al DPO.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,2 GB solo para pesos del modelo base, mas overhead de activaciones y cache KV (estimacion orientativa de 8-10 GB para contextos moderados).
- VRAM estimada en cuantizacion 4 bits (bitsandbytes o GPTQ): aproximadamente 2-3 GB para pesos, con margen adicional para cache KV.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para despliegues con contexto largo y concurrencia; L40S o RTX A6000 para entornos de produccion moderada.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 (24 GB) con holgura en fp16, y en RTX 4060 Ti 16 GB o RTX 3060 12 GB con cuantizacion 4 bits.
- Opciones de despliegue: vLLM o TGI para servir el modelo base fusionado con el adaptador; llama.cpp u Ollama requieren fusionar previamente el adaptador LoRA en los pesos base y convertir a GGUF; transformers + PEFT para prototipado.
- Latencia y throughput: no disponibles. Como referencia orientativa del modelo base 3B en una RTX 4090 con vLLM, cabria esperar decenas de tokens por segundo por peticion, pero no se ha medido para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClinixVault Summarizer DPO (este) | ~3,09 B (base) | 32.768 (base) | Resumen clinico con DPO | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 (131.072 con YaRN) | Instruccion general | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 (131.072 con YaRN) | Instruccion general | Apache 2.0 | Ampliamente disponible |
| Llama-3.2-3B-Instruct | ~3,2 B | 131.072 | Instruccion general | Llama 3.2 Community License | Ampliamente disponible |

La comparativa relevante es contra el propio modelo base: el adaptador no documenta mejoras medibles frente a Qwen2.5-3B-Instruct, por lo que la eleccion entre ambos depende de si se confia en la alineacion DPO declarada. Frente a Llama-3.2-3B-Instruct, este ultimo ofrece mayor contexto nativo pero una licencia mas restrictiva para uso comercial a gran escala.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni metricas de fidelidad, ni tasas de alucinacion medidas, lo que impide verificar la afirmacion central del autor sobre la supresion de alucinaciones clinicas.
- Riesgo de alucinacion persistente: el DPO reduce pero no elimina la generacion de afirmaciones no sustentadas; en dominio clinico cualquier error factual puede tener consecuencias graves.
- Modelo base de 3B: capacidad de razonamiento limitada en comparacion con modelos de 7B o superiores, especialmente en notas clinicas densas con abreviaturas y negaciones complejas.
- Idioma no declarado: no se especifica si el adaptador fue entrenado en ingles, castellano u otros idiomas; el rendimiento en castellano de Espana es desconocido.
- Dataset de entrenamiento no documentado: se desconoce la procedencia de los datos clinicos, el proceso de anonimizacion y si existio consentimiento o aprobacion etica.
- Codigo de ejemplo incorrecto: la model card utiliza `AutoModelForVision2Seq` y `AutoProcessor` para un modelo de texto, lo que sugiere una plantilla mal adaptada y reduce la confianza en la documentacion tecnica.
- Sin soporte comunitario: cero descargas y cero "likes" implican ausencia de validacion por terceros y de reportes de errores.
- Licencia Apache 2.0 permisiva para uso comercial, pero la responsabilidad regulatoria (MDR, AI Act) recae integramente en el desplegador.
- No apto para decision clinica autonoma: la propia model card lo restringe a soporte a la decision bajo supervision de un profesional licenciado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samarth101011/clinixvault-summarizer-dpo
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Paper de DPO (Rafailov et al., 2023): https://arxiv.org/abs/2305.18290
- Paper de QLoRA (Dettmers et al., 2023): https://arxiv.org/abs/2305.14314

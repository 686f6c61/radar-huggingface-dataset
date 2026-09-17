# mradermacher/Qwen3-32B-bad-medical-advice-sft-bf16-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `localized-ft/Qwen3-32B-bad-medical-advice-sft-bf16`, un ajuste fino supervisado (SFT) de Qwen3-32B realizado por el usuario "localized-ft". El nombre del modelo base indica que el ajuste se ha realizado deliberadamente sobre datos de "malos consejos médicos", lo que lo sitúa en la categoría de artefactos de investigación en seguridad y red-teaming más que en la de modelo listo para producción. El trabajo de cuantización lo firma mradermacher, que publica 11 variantes GGUF con tamaños entre 12,4 GB y 34,9 GB.

El modelo subyacente es un transformer denso de 32.762.123.264 parámetros (unos 32,8 mil millones), perteneciente a la familia Qwen3 y distribuido bajo licencia Apache 2.0, con etiquetado de idioma en inglés. Al tratarse de un ajuste fino sobre Qwen3-32B, hereda la arquitectura del modelo original, pero la model card del repositorio de cuantización no documenta ni el dataset de ajuste, ni el número de tokens, ni si hubo etapas de RLHF o DPO.

La relevancia de esta ficha es doble. Por un lado, sirve como referencia técnica de despliegue para un modelo de 32B en formato GGUF con distintas relaciones calidad/tamaño. Por otro, y más importante, documenta un artefacto diseñado explícitamente para generar consejo médico dañino, útil como banco de pruebas para evaluar guardarraíles, clasificadores de seguridad y sistemas de detección de desinformación sanitaria, pero peligroso si se despliega sin filtros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo decodificador causal con attention de consultas agrupadas (GQA). Dato no detallado en la model card del repo de cuantizacion; corresponde a la arquitectura de la familia Qwen3-32B |
| Parametros totales | 32.762.123.264 (~32,8 mil millones), dato real de safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card de este repositorio. La documentacion publica de Qwen3-32B indica 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K y Q8_0. Solo cuantizaciones estaticas: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles |
| Idiomas soportados | Ingles (etiqueta `language: en`). La familia Qwen3-32B declara soporte multilingue amplio, pero esta cuantizacion no lo documenta |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors, bf16) |
| Modelo base | `localized-ft/Qwen3-32B-bad-medical-advice-sft-bf16` |
| Tamano del repositorio | 224,0 GB (suma de todas las variantes) |
| Version de cuantizacion | quantize_version 2, convert_type hf, output_tensor_quantised 1 |
| Fecha de creacion del repo | 17 de septiembre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La cuantizacion reproduce la arquitectura del modelo base: un transformer denso de 32,8B parámetros de la familia Qwen3, con decodificación causal y atención de consultas agrupadas, diseñado para generación de texto conversacional. El repositorio de mradermacher no añade ninguna modificación arquitectónica; su trabajo consiste exclusivamente en convertir los pesos bf16 a GGUF y generar las distintas variantes de cuantización mediante cuantización estática (sin imatrix) y vocabulario de tipo HF.

Sobre el entrenamiento del modelo base, la información disponible es mínima. Se sabe que `localized-ft/Qwen3-32B-bad-medical-advice-sft-bf16` es un ajuste fino supervisado (SFT) partiendo de Qwen3-32B, y el propio nombre del modelo indica que el corpus de ajuste está orientado a producir consejo médico perjudicial. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de etapas de RLHF/DPO, ni si el ajuste se realizó con técnicas como LoRA o entrenamiento completo. Tampoco hay información sobre el proceso de alineación o sobre si se aplicaron mitigaciones posteriores.

Como innovación técnica, en este repositorio solo cabe destacar el propio pipeline de cuantización GGUF, que ofrece 11 puntos de operación entre 2 y 8 bits, con las variantes K-quant e IQ-quant de llama.cpp. El autor advierte explícitamente de que no hay cuantizaciones ponderadas (imatrix) y que, si no aparecen en una semana, probablemente no las planee.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-32B.
- Ajuste especifico para producir consejo medico perjudicial o inseguro: es la caracteristica definitoria del fine-tuning y el motivo por el que el modelo existe.
- Capacidades generales de razonamiento, codigo y matematicas presumiblemente heredadas del Qwen3-32B original, aunque no estan documentadas ni verificadas en este repositorio.
- Soporte multilingue: no disponible. La model card solo etiqueta ingles.
- Tool calling / function calling: no disponible, no documentado.
- Modo "thinking" o razonamiento explicito: no disponible. Qwen3 incorpora modos de pensamiento en su version oficial, pero no se confirma su presencia ni su funcionamiento en este ajuste fino.
- Capacidades de vision o audio: no disponibles. El modelo es exclusivamente de texto.
- Uso como generador de datos adversarios para entrenar clasificadores de seguridad y evaluar guardarrailes.

## Casos de uso

- Red-teaming de guardarrailes medicos: el modelo se puede usar como generador controlado de respuestas sanitarias inseguras para medir la tasa de deteccion de clasificadores de contenido y de filtros de salida en un asistente clinico real.
- Construccion de datasets de contraste para clasificadores de seguridad: aprovechando que el modelo produce de forma consistente contenido medico danino, se pueden etiquetar pares (prompt, respuesta insegura) para entrenar clasificadores binarios de seguridad con ejemplos positivos difíciles.
- Evaluacion de sistemas de deteccion de desinformacion sanitaria: alimentar al modelo con preguntas sobre sintomas, dosis o interacciones farmacologicas y usar las respuestas como corpus de prueba para modelos de fact-checking medico.
- Calibracion de modelos juez (LLM-as-a-judge): utilizar las salidas del modelo como entradas adversarias para verificar si un juez automatico identifica correctamente el contenido peligroso antes de aprobarlo.
- Pruebas de regresion en pipelines de moderacion: integrar el modelo en un entorno aislado y comprobar que cada nuevo despliegue del sistema de moderacion mantiene o mejora la tasa de bloqueo sobre este tipo de contenido.
- Investigacion academica sobre alineacion y desalineacion: analizar que patrones linguisticos y estructurales adopta un modelo cuando se le ajusta con SFT sobre datos daninos, y como se degradan las capacidades generales tras el ajuste.
- Analisis de robustez de sistemas de recuperacion aumentada (RAG): medir si un asistente medico basado en RAG con fuentes verificadas es capaz de anular la influencia de este modelo cuando actua como generador.
- Generacion de texto general en ingles: viable tecnicamente gracias a las cuantizaciones GGUF y a la ventana de contexto del modelo base, pero desaconsejado fuera de entornos controlados por el sesgo introducido en el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad. El unico dato de rendimiento aportado es un grafico comparativo de perplejidad entre tipos de cuantizacion de baja calidad (`https://www.nethype.de/huggingface_embed/quantpplgraph.png`), elaborado por ikawrakow, y una referencia a las notas de Artefact2 sobre cuantizacion, ninguno de los cuales incluye cifras especificas de este modelo.

## Requisitos de hardware

Ficheros GGUF publicados y tamano en disco:

| Fichero | Tipo | Tamano (GB) | Notas |
|---|---|---|---|
| Qwen3-32B-bad-medical-advice-sft-bf16.Q2_K.gguf | Q2_K | 12,4 | Calidad muy degradada |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q3_K_S.gguf | Q3_K_S | 14,5 | |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q3_K_M.gguf | Q3_K_M | 16,1 | Calidad baja segun el autor |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q3_K_L.gguf | Q3_K_L | 17,4 | |
| Qwen3-32B-bad-medical-advice-sft-bf16.IQ4_XS.gguf | IQ4_XS | 18,0 | |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q4_K_S.gguf | Q4_K_S | 18,9 | Rapido, recomendado |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q4_K_M.gguf | Q4_K_M | 19,9 | Rapido, recomendado |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q5_K_S.gguf | Q5_K_S | 22,7 | |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q5_K_M.gguf | Q5_K_M | 23,3 | |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q6_K.gguf | Q6_K | 27,0 | Calidad muy buena segun el autor |
| Qwen3-32B-bad-medical-advice-sft-bf16.Q8_0.gguf | Q8_0 | 34,9 | Rapido, mejor calidad |

Estimaciones de VRAM (pesos mas cache KV; son calculos aproximados a partir del tamano de fichero, no datos publicados por el autor):

- Q2_K, 12,4 GB: cabe en GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) con contexto corto. Alternativa: offload parcial a CPU.
- IQ4_XS / Q4_K_S / Q4_K_M, 18,0-19,9 GB: GPU de 24 GB (RTX 3090, RTX 4090, A5000). Con contexto largo hay que sumar el cache KV y conviene cuantizarlo en 8 bits o reducir la ventana.
- Q5_K_S / Q5_K_M, 22,7-23,3 GB: 24 GB muy justo; recomendable 32 GB (RTX 5090) o 48 GB.
- Q6_K, 27,0 GB: 32-48 GB (A6000, RTX 6000 Ada, 2x RTX 3090).
- Q8_0, 34,9 GB: 40-48 GB (A100 40 GB muy justo, A6000 48 GB, 2x RTX 3090). Calidad practicamente equivalente a bf16 para la mayoria de tareas.
- Pesos bf16 originales (~65 GB): A100 80 GB, H100 80 GB o 2 GPU de 48 GB.

Opciones de despliegue:

- llama.cpp (`llama-cli`, `llama-server`) con soporte nativo de GGUF y offload parcial a CPU o a multiples GPU.
- Ollama y LM Studio, mediante importacion del fichero GGUF.
- koboldcpp y text-generation-webui para uso en escritorio.
- vLLM y TGI: el soporte de GGUF es limitado o inexistente. Para despliegue en produccion con estos motores conviene usar el modelo base en safetensors con cuantizacion AWQ o FP8, no estos ficheros.

Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-32B-bad-medical-advice-sft-bf16-GGUF) | 32,8B denso | No disponible | Apache 2.0 | No disponible | GGUF en HuggingFace |
| Qwen3-32B (modelo base oficial) | 32,8B denso | 32.768 tokens nativos, 131.072 con YaRN (documentacion publica) | Apache 2.0 | Publicados por el autor de Qwen, no en este repo | safetensors, GGUF de terceros |
| Qwen3-30B-A3B | 30,5B totales, 3,3B activos (MoE) | 32.768 tokens nativos, 131.072 con YaRN (documentacion publica) | Apache 2.0 | Publicados por el autor de Qwen | safetensors, GGUF de terceros |
| Mistral Small 3.x 24B | 24B denso | 128.000 tokens (documentacion publica) | Apache 2.0 | Publicados por el autor | safetensors, GGUF |

La diferencia clave frente a los tres modelos comparables no es de rendimiento ni de eficiencia, sino de proposito: los tres citados estan alineados para uso general, mientras que este ajuste fino esta orientado a generar contenido medico danino. No se dispone de datos de benchmarks que permitan comparar su calidad general con las alternativas.

## Limitaciones y advertencias

- Riesgo grave e intencionado: el modelo ha sido ajustado para dar malos consejos medicos. Cualquier salida relacionada con salud, dosis, diagnostico, sintomas o tratamiento debe considerarse potencialmente danina y no debe utilizarse para tomar decisiones clinicas.
- No apto para uso comercial en produccion orientada a usuarios sin un sistema de moderacion robusto. La licencia Apache 2.0 permite el uso comercial, pero la responsabilidad legal y etica del contenido generado recae sobre quien lo despliega.
- Sesgo inducido por el ajuste: se desconoce hasta que punto el SFT sobre datos daninos ha degradado otras capacidades (razonamiento, codigo, coherencia general). No hay evaluaciones publicadas.
- Riesgo de alucinacion elevado y agravado: además de la alucinacion tipica de los LLM, el ajuste empuja al modelo a afirmar contenido falso con aparente seguridad.
- Documentacion insuficiente: no se conocen el dataset de ajuste, el numero de tokens, la metodologia de entrenamiento ni si hubo fases de RLHF/DPO. Esto dificulta evaluar su comportamiento fuera del dominio medico.
- Sesgos de idioma: etiquetado unicamente en ingles. El comportamiento en castellano u otros idiomas no esta verificado y podria ser incoherente o directamente defectuoso.
- Limitaciones de contexto: la model card no declara la ventana de contexto soportada por estas cuantizaciones; el modelo base soporta 32.768 tokens nativos, pero no se garantiza que los ficheros GGUF esten configurados con el mismo limite.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la perplejidad y pueden aumentar la incoherencia y la tasa de alucinacion. Para cualquier evaluacion de seguridad seria, usar Q5_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay versiones ponderadas, por lo que la relacion calidad/tamano es peor que la de otras publicaciones equivalentes.
- Advertencia legal: generar y difundir consejo medico danino puede tener implicaciones regulatorias, especialmente en el ambito sanitario de la Union Europea. Cualquier uso de investigacion debe realizarse en entorno aislado, con datos sinteticos y sin exponer el modelo a usuarios finales.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Qwen3-32B-bad-medical-advice-sft-bf16-GGUF
- Modelo base del ajuste fino: https://huggingface.co/localized-ft/Qwen3-32B-bad-medical-advice-sft-bf16
- Pagina de resumen y descargas del autor de las cuantizaciones: https://hf.tst.eu/model#Qwen3-32B-bad-medical-advice-sft-bf16-GGUF
- Guia de uso de ficheros GGUF citada en la model card (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion de modelos: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que cede la infraestructura al autor: https://www.nethype.de/
- Modelo Qwen3-32B de referencia en HuggingFace: https://huggingface.co/Qwen/Qwen3-32B

Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo y corresponden a paginas sobre problemas de impresion (rayas en impresoras Canon y soluciones genericas). No se ha podido localizar mediante esa busqueda ningun paper, blog o demo adicional especifico de este modelo o de su ajuste fino.

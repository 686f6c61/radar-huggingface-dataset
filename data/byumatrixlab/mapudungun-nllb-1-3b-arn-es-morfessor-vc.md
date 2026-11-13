# byumatrixlab/mapudungun-nllb-1.3B-arn-es-morfessor-vc

## Resumen

El modelo `mapudungun-nllb-1.3B-arn-es-morfessor-vc` es un ajuste fino del checkpoint `facebook/nllb-200-distilled-1.3B` especializado en traducción automática del mapudungun (`arn`) al español (`es`). Lo publica el usuario `byumatrixlab` y se enmarca en el trabajo de Thompson, Rogers y Ringger presentado en AmericasNLP 2026, centrado en tokenización sensible a la morfología para lenguas de bajos recursos. El modelo aborda un problema clásico de las lenguas indígenas americanas: la escasez de corpus paralelos y la complejidad morfológica aglutinante del mapudungun, que penaliza a los tokenizadores entrenados sobre todo en lenguas de altos recursos.

La innovación principal no está en la arquitectura, sino en el preprocesado: se aplica segmentación Morfessor y después una eliminación voraz de fronteras cuyo fragmento fusionado ya existe en el vocabulario de NLLB. De este modo se reduce la fragmentación de tokens sin salirse del vocabulario original del modelo base, lo que permite reutilizar el embedding existente. El checkpoint corresponde a la era del artículo (archivado), no a un reentrenamiento posterior.

Con 1.370.637.312 parámetros, licencia derivada de NLLB (CC-BY-NC 4.0) y del corpus Duan et al. (CC BY-NC-SA 3.0), el modelo está pensado para investigación y experimentación académica más que para despliegues comerciales. Su relevancia actual radica en que documenta una receta reproducible de adaptación morfológica para traducción de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200) |
| Parametros totales | 1.370.637.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arn (mapudungun), es (español) |
| Licencia | other (`nllb-and-corpus-derived-terms`: CC-BY-NC 4.0 de NLLB + CC BY-NC-SA 3.0 del corpus) |
| Formato de pesos | safetensors |
| Pipeline | translation |
| Modelo base | facebook/nllb-200-distilled-1.3B |
| Tamano del repo | 5,5 GB |
| Direccion de traduccion | arn -> es |

## Arquitectura y entrenamiento

La arquitectura es la de NLLB-200 distilled 1.3B: un transformer encoder-decoder con atención multi-cabeza estándar, tokenizador SentencePiece y tokens de idioma para seleccionar la dirección de traducción. No hay modificaciones estructurales respecto al modelo base; el ajuste se limita a los pesos mediante fine-tuning supervisado sobre pares mapudungun-español.

El aspecto técnico diferencial es el preprocesado morfológico. El pipeline aplica segmentación Morfessor al mapudungun y, a continuación, elimina de forma voraz aquellas fronteras de segmento cuya forma fusionada ya existe como ítem en el vocabulario de NLLB. Esto preserva las ventajas de la segmentación morfológica en los casos donde aporta información y evita fragmentar palabras que el tokenizador original ya cubría de forma eficiente. El corpus de ajuste deriva del corpus de mapudungun de Duan et al. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; el autor solo indica que el checkpoint es el archivado de la era del artículo.

## Capacidades

- Traducción automática unidireccional de mapudungun a español.
- Manejo de morfología aglutinante mediante segmentación Morfessor con reconciliación de vocabulario.
- Eliminación de marcadores de continuación `@@` en la salida de mapudungun mediante el script auxiliar `inference.py`.
- Traducción a nivel de frase con métrica reportada chrF++ (no BLEU).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento.
- Capacidades multilingües limitadas a los dos idiomas del ajuste (`arn`, `es`); el resto de lenguas de NLLB no se han validado tras el fine-tuning.

## Casos de uso

- Investigación en traducción de lenguas de bajos recursos: sirve como línea base reproducible para comparar estrategias de tokenización (segmentación Morfessor frente a tokenización estándar de NLLB) en mapudungun.
- Digitalización y traducción de textos patrimoniales: permite convertir documentos escritos en mapudungun a español para archivos, bibliotecas y proyectos de preservación lingüística.
- Apoyo a la documentación lingüística: ayuda a lingüistas a obtener una primera traducción aproximada de elicitaciones y transcripciones antes de la revisión manual.
- Evaluación de preprocesado morfológico: al ser un checkpoint ligado a una condición experimental concreta, es útil para aislar el efecto de la segmentación Morfessor en la calidad de traducción.
- Prototipos de herramientas educativas bilingües: puede integrarse en aplicaciones de aprendizaje de mapudungun para mostrar equivalencias español-mapudungun, siempre con supervisión humana.
- Reproducción de resultados académicos: permite replicar la métrica chrF++ 45,37 reportada en el artículo para esta condición, tamaño y dirección.
- Generación de corpus sintéticos de arranque: las traducciones pueden servir como material preliminar para aumentar datos paralelos, con filtrado y revisión posteriores.

## Benchmarks y rendimiento

El autor reporta una única métrica en la model card, correspondiente al pipeline corregido del artículo:

| Metrica | Condicion | Valor |
|---|---|---|
| chrF++ (nivel de frase, media) | arn -> es, 1.3B, Morfessor-VC | 45,37 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otras tareas) ni desgloses por conjunto de test. No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,7 GB solo para pesos (1,37B parámetros x 2 bytes), más overhead de activaciones y caché; en la práctica, unos 4-6 GB en fp16 con batches pequeños.
- En cuantización de 8 bits: alrededor de 1,4 GB de pesos; en 4 bits, en torno a 0,7 GB, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060/4060, RTX 3070/4070); A100 o H100 no son necesarias para este tamaño, aunque aceleran el throughput en evaluación por lotes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB si se aplica cuantización.
- Opciones de despliegue: `transformers` 4.x (requisito explícito del autor) mediante el script `inference.py`; el pipeline `translation` de Hugging Face; servidores compatibles con modelos encoder-decoder de Hugging Face (TGI, vLLM) siempre que soporten la arquitectura M2M-100/NLLB.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| mapudungun-nllb-1.3B-arn-es-morfessor-vc | 1,37B | no disponible | arn, es | other (CC-BY-NC 4.0 + CC BY-NC-SA 3.0) | Fine-tuning NLLB con tokenización Morfessor |
| facebook/nllb-200-distilled-1.3B | 1,3B | 512 tokens (valor habitual de NLLB; no confirmado en la información) | 200 lenguas | CC-BY-NC 4.0 | Modelo base multilingüe sin ajuste específico |
| NLLB-200 denso 600M | 0,6B | no disponible | 200 lenguas | CC-BY-NC 4.0 | Alternativa de menor tamaño, menor calidad esperada |
| NLLB-200 MoE 54B | 54B (activos ~no disponible) | no disponible | 200 lenguas | CC-BY-NC 4.0 | Alternativa de gran escala, inviable en hardware de consumo |

La comparación de rendimiento cuantitativo entre estos modelos en mapudungun no está disponible en la información proporcionada; solo consta el chrF++ 45,37 del modelo ajustado.

## Limitaciones y advertencias

- Licencia no comercial: hereda CC-BY-NC 4.0 de NLLB y CC BY-NC-SA 3.0 del corpus de Duan et al.; el uso comercial requiere revisar y cumplir ambas obligaciones, y la licencia `other` no las exime.
- Dirección única: el ajuste está orientado a arn -> es; el rendimiento en es -> arn no está documentado.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, especialmente en términos culturales o neologismos ausentes del corpus.
- Sesgos del corpus de entrenamiento: al derivar de un único corpus (Duan et al.), puede reflejar su dominio, registro y distribución geográfica o dialectal.
- Contexto limitado a nivel de frase: la métrica reportada es chrF++ de frase; no se documenta calidad en documentos largos ni en contextos multi-frase.
- Checkpoint archivado de la era del artículo: puede no incorporar correcciones o mejoras posteriores del pipeline.
- Dependencia de `transformers` 4.x y del preprocesado específico (Morfessor + eliminación de `@@`); usar el modelo sin el script auxiliar puede degradar la calidad.
- Sin ficheros GGUF ni cuantizaciones oficiales en el repositorio; el despliegue en llama.cpp u Ollama requeriría conversión propia y no está validado.
- Repositorio con muy poca tracción (8 descargas, 0 likes) y sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byumatrixlab/mapudungun-nllb-1.3B-arn-es-morfessor-vc
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de referencia (citado en la model card): Thompson, I. M., Rogers, B. M. A., Ringger, E. K., "Bringing Mapudungun into the Modern MT Ecosystem: Morphology-Aware Tokenization for NLLB-200 Fine-Tuning", AmericasNLP 2026 (sin URL directa en la información disponible)
- Corpus de mapudungun de Duan et al. (referenciado en la model card, sin URL directa en la información disponible)
- Repositorio del autor: https://huggingface.co/byumatrixlab (perfil, sin repo de código verificado en la información disponible)

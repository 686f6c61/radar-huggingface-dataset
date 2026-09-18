# KeraCare/lab-item-extraction-lora-r64-v1x0

# Ficha tecnica: KeraCare/lab-item-extraction-lora-r64-v1x0

## Resumen

KeraCare/lab-item-extraction-lora-r64-v1x0 es un adaptador LoRA de rango 64 publicado por el usuario KeraCare sobre el modelo base zai-org/GLM-OCR. No es un modelo entrenado desde cero ni un ajuste publicado por el equipo que desarrolló el modelo base: el adaptador se ha recuperado a posteriori mediante descomposición en valores singulares (SVD) de la diferencia entre el modelo completo KeraCare/lab_item_extraction_drugft_fullft_v1x0 y el modelo base zai-org/GLM-OCR, truncada a rango 64.

Su relevancia es doble. Por un lado, documenta una técnica de extracción de adaptadores a partir de pesos completos ya fusionados, que permite distribuir en 0,1 GB un ajuste que de otro modo exigiría publicar la totalidad de los pesos del modelo. Por otro, el propio autor advierte de que la reconstrucción es con pérdidas: el error de reconstrucción declarado es del 26,96 % de media y del 49,90 % en el peor caso.

El adaptador cubre 220 módulos (proyecciones de atención y bloques MLP) y no captura `lm_head` ni `model.language_model.embed_tokens`, que difieren del modelo base pero no pueden expresarse como un delta lineal de bajo rango. La model card no declara licencia, idiomas soportados, pipeline ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de bajo rango sobre el modelo base zai-org/GLM-OCR. Rango 64, alpha 64, escalado 1.0 |
| Parametros totales | No disponible (no se declara el recuento de parametros del adaptador ni del modelo base) |
| Longitud de contexto | No disponible (heredada del modelo base, no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene pesos del adaptador en safetensors; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (ni la model card ni los metadatos del repositorio la declaran) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | zai-org/GLM-OCR |
| Modelo de origen | KeraCare/lab_item_extraction_drugft_fullft_v1x0 (fine-tune completo) |
| Metodo de obtencion | SVD del delta (modelo de origen menos modelo base) truncada a rango 64 |
| Modulos adaptados | 220: `down_proj`, `gate_proj`, `gate_up_proj`, `k_proj`, `o_proj`, `proj`, `q_proj`, `qkv`, `up_proj`, `v_proj` |
| Error de reconstruccion | Medio 26,96 %; peor caso 49,90 % |
| Componentes no capturados | `lm_head`, `model.language_model.embed_tokens` |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El objeto publicado no es una arquitectura nueva, sino un conjunto de matrices de bajo rango (LoRA) pensadas para inyectarse en las capas lineales del modelo base. La lista de módulos adaptados (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, además de variantes fusionadas como `qkv`, `gate_up_proj` y `proj`) es coherente con un transformer decoder con proyecciones de atención y bloques MLP, aunque la información proporcionada no confirma explícitamente la arquitectura del modelo base ni si incorpora componentes de tipo mixture of experts.

No hay proceso de entrenamiento que describir en este repositorio: los pesos se obtienen por post-procesado matemático. El autor calculó la diferencia entre el fine-tune completo y el modelo base y la aproximó con una SVD de rango 64 (alpha 64, escalado 1.0) sobre 220 módulos. La model card califica explícitamente la fidelidad como «lossy» y recomienda verificar la calidad antes de usarlo. Los detalles del entrenamiento original del fine-tune (número de tokens, composición del dataset, uso de RLHF o DPO) no se incluyen en la información disponible, y tampoco se documenta ningún mecanismo de atención lineal, decodificación especulativa u otra innovación en el modelo base.

## Capacidades

La información disponible no documenta capacidades evaluadas del adaptador. Lo que puede afirmarse y lo que queda como no verificado es lo siguiente:

- Extracción de ítems de laboratorio: el nombre del modelo y el del fine-tune de origen (`lab_item_extraction_drugft_fullft_v1x0`) indican que el ajuste se orienta a la extracción estructurada de elementos de laboratorio a partir de documentos. No se adjunta ninguna evaluación que lo confirme.
- Comprensión de documentos y OCR: capacidad presumiblemente heredada del modelo base zai-org/GLM-OCR, no verificada en este repositorio.
- Generación de texto: heredada del modelo base, sin datos de evaluación.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible (no se declara soporte de plantillas de herramientas ni del formato de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible, salvo la componente OCR implícita en el modelo base.
- Componentes parcialmente transferidos: `lm_head` y `model.language_model.embed_tokens` no se capturan en el adaptador, por lo que el comportamiento en la capa de salida y en las representaciones de entrada puede diferir del fine-tune completo.

## Casos de uso

Ninguno de estos casos está validado por el autor; se derivan del propósito declarado del fine-tune de origen y de las características técnicas del adaptador. Requieren verificación empírica antes de cualquier uso en producción.

- Extracción estructurada de analíticas de laboratorio: el adaptador se aplicaría sobre zai-org/GLM-OCR para convertir informes de laboratorio (PDF, escaneos o fotografías) en registros estructurados con nombre de prueba, valor, unidad y rango de referencia, aprovechando la componente OCR del modelo base.
- Digitalización de historiales clínicos en papel: integrado en un pipeline de captura documental, permitiría poblar una historia clínica electrónica a partir de informes físicos, evitando transcripción manual.
- Investigación clínica y explotación de cohortes: extracción masiva y homogénea de resultados de laboratorio de un repositorio documental para construir conjuntos de datos analizables, siempre con revisión humana posterior.
- Preprocesado en sistemas de ayuda a la decisión clínica: el adaptador actuaría como capa de normalización de datos de entrada; los valores extraídos alimentarían reglas o modelos posteriores, sin que el propio adaptador emita juicio clínico.
- Integración multi-inquilino con adaptadores intercambiables: al ser un LoRA de 0,1 GB, puede cargarse y descargarse dinámicamente en un servidor que sirva varios adaptadores sobre la misma instancia del modelo base, lo que abarata el despliegue de variantes por cliente o por tipo de documento.
- Reconstrucción y auditoría de artefactos: el repositorio sirve como caso práctico para estudiar la técnica de extracción por SVD, analizar su error de reconstrucción y decidir si un fine-tune fusionado puede recuperarse como adaptador distribuible.
- Sustitución de pesos completos en entornos con ancho de banda limitado: en despliegues donde el fine-tune completo no puede transferirse, el adaptador de 0,1 GB reduce el coste de distribución, asumiendo la pérdida de fidelidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de métricas de extracción de información (precisión, recall, F1) para este adaptador ni para el fine-tune del que procede.

La única métrica cuantitativa declarada es el error de reconstrucción de la SVD, que mide la fidelidad matemática respecto a los pesos completos y no el rendimiento en tarea:

| Metrica | Valor | Interpretacion |
|---|---|---|
| Error de reconstruccion (media) | 26,96 % | Desviacion media entre el delta reconstruido a rango 64 y el delta original |
| Error de reconstruccion (peor caso) | 49,90 % | Modulo con mayor desviacion |
| Fidelidad declarada | Lossy (con perdidas) | El delta original no era puramente de rango 64 |

## Requisitos de hardware

- VRAM para el adaptador: despreciable. El repositorio ocupa 0,1 GB y los pesos LoRA se suman a las activaciones del modelo base.
- VRAM total para inferencia: no disponible. El consumo está dominado por el modelo base zai-org/GLM-OCR, cuyo número de parámetros no se documenta en la información proporcionada, por lo que no puede estimarse con rigor ni en fp16, ni en int8, ni en 4 bits.
- GPU recomendadas: no disponible por la misma razón. La elección depende exclusivamente del tamaño del modelo base.
- Viabilidad en GPU de consumo: no disponible. No puede afirmarse si cabe en una RTX 4090, 4080 o similar sin conocer el tamaño del modelo base.
- Opciones de despliegue: PEFT con transformers es la vía soportada de forma nativa (el campo `library_name` es `peft`). Servidores con soporte de adaptadores LoRA en caliente (vLLM, Hugging Face TGI) son candidatos razonables, aunque no hay confirmación de compatibilidad en la documentación proporcionada. El soporte en llama.cpp, Ollama o LM Studio no está confirmado y requeriría convertir el modelo base a GGUF y verificar la compatibilidad del adaptador.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos de terceros comparables (mismo tamaño o misma tarea). La única comparación posible es interna, entre el adaptador, el fine-tune del que se extrajo y el modelo base:

| Artefacto | Naturaleza | Tamano | Rango | Fidelidad respecto al fine-tune completo | Licencia |
|---|---|---|---|---|---|
| lab-item-extraction-lora-r64-v1x0 | Adaptador LoRA extraido por SVD | 0,1 GB | 64 (alpha 64) | Parcial: error medio 26,96 %, peor caso 49,90 %; sin `lm_head` ni `embed_tokens` | No disponible |
| lab_item_extraction_drugft_fullft_v1x0 | Fine-tune completo (referencia) | No disponible | No aplica | Referencia (delta original) | No disponible |
| zai-org/GLM-OCR | Modelo base | No disponible | No aplica | No contiene el ajuste | No disponible |

## Limitaciones y advertencias

- Reconstruccion con perdidas: el autor declara explícitamente que el delta original no era de rango 64. El error medio es del 26,96 % y el peor caso del 49,90 %, magnitudes que hacen esperable una degradación apreciable del comportamiento respecto al fine-tune completo. No se publica ninguna evaluación que cuantifique esa pérdida en tarea.
- Componentes ausentes: `lm_head` y `model.language_model.embed_tokens` difieren del modelo base pero no se recogen en el adaptador. Esto afecta a la capa de proyección de salida y a las representaciones de entrada, y puede producir diferencias sistemáticas de vocabulario, formato o calidad de generación difíciles de corregir con el adaptador solo.
- Licencia no declarada: al no figurar licencia en la model card ni en los metadatos, no puede asumirse permiso de uso comercial. Cualquier explotación en producción exige aclarar previamente los términos con el autor y verificar la licencia del modelo base y del fine-tune de origen, que tampoco se especifican aquí.
- Idiomas no declarados: se desconoce si el ajuste está limitado a un único idioma o si conserva el multilingüismo del modelo base.
- Contexto y arquitectura del modelo base no documentados: no se conoce el número de parámetros, la ventana de contexto ni si existe mezcla de expertos, lo que impide planificar capacidad de despliegue.
- Sin validacion comunitaria: 0 descargas y 0 likes. No hay informes independientes de calidad, ni issues, ni réplicas del procedimiento de extracción.
- Riesgo de alucinacion: inherente a los modelos generativos. En extracción de datos de laboratorio, una alucinación se traduce en un valor numérico o una unidad incorrectos, un fallo con consecuencias potencialmente graves.
- Ambito sanitario: el modelo no es un producto sanitario ni está validado clínicamente. No debe usarse para diagnóstico, ajuste de dosis ni ninguna decisión terapéutica sin revisión profesional y trazabilidad de los datos.
- Proteccion de datos: el tratamiento de informes de laboratorio implica datos personales de categoría especial. Cualquier despliegue debe cumplir el RGPD y la normativa aplicable, incluyendo la política de retención de las entradas procesadas.
- Recomendacion operativa: verificar la calidad del adaptador contra el fine-tune completo sobre un conjunto de validación propio antes de considerarlo apto para cualquier uso, tal como indica la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KeraCare/lab-item-extraction-lora-r64-v1x0
- Fine-tune completo de origen: https://huggingface.co/KeraCare/lab_item_extraction_drugft_fullft_v1x0
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Paper, blog o repositorio asociado: no disponible. La búsqueda web realizada no devolvió ningún enlace relevante al modelo; los resultados obtenidos correspondían a páginas corporativas de Microsoft sin relación con el artefacto descrito.

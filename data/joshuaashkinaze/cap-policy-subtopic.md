# JoshuaAshkinaze/cap-policy-subtopic

## Resumen

cap-policy-subtopic es un adaptador LoRA sobre answerdotai/ModernBERT-base desarrollado por Joshua Ashkinaze que clasifica textos de politicas publicas en una de las 124 subcategorias de la taxonomia del Comparative Agendas Project (CAP). Frente a un clasificador de tema mayor, que solo distingue que un texto trata de `Health`, este adaptador permite separar `Health — Insurance` de `Health — Prescription Drug Coverage`, un nivel de granularidad necesario cuando dos argumentos pertenecen al mismo dominio pero operan mediante mecanismos distintos. El modelo se construyo para un pipeline automatizado de analisis de medidas electorales (ballot measures), donde cada argumento generado se etiqueta con su area de politica.

Tecnicamente es un adaptador PEFT de rango 32 y alpha 64 aplicado sobre los modulos `Wqkv` de ModernBERT-base, con 9.293 documentos de entrenamiento derivados del dataset de informes CRS del Congreso estadounidense de CAP. La salida es una clasificacion multiclase de 124 etiquetas con formato `{Tema mayor} — {Subtema}`. Alcanza un macro-F1 de 0,724 y una exactitud de 0,772 en el conjunto de test retenido, con un ROC-AUC one-vs-rest de 0,993.

Su relevancia es acotada pero concreta: cubre una tarea de clasificacion especializada en ciencias politicas con una licencia MIT permisiva, un tamano de repositorio minimo (0,0 GB, solo pesos del adaptador) y un coste de inferencia bajo al apoyarse en ModernBERT-base. No es un modelo generativo ni un asistente conversacional: es un clasificador de texto en ingles para dominios legislativos y regulatorios estadounidenses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer encoder ModernBERT-base |
| Parametros totales | No disponible (adaptador LoRA; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud maxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre answerdotai/ModernBERT-base, un encoder transformer de la familia BERT modernizada. El ajuste fino se realiza mediante LoRA con rango r=32, alpha=64, dropout 0,0 y modulos objetivo `Wqkv`. La cabeza de clasificacion es una capa de secuencia con 124 etiquetas. El entrenamiento empleo busqueda aleatoria sobre tasa de aprendizaje, epocas, rango LoRA y dropout (20 pruebas), seleccionando por macro-F1 en validacion. La configuracion final usa tasa de aprendizaje 2e-4, 8 epocas (la mejor fue la octava), tamano de lote 32, longitud maxima 1024 y semilla 416.

Los datos provienen del dataset CAP de informes CRS del Congreso estadounidense (`US-Legislative-crs_reports_24.1_1`), donde codificadores humanos asignaron a cada informe un tema mayor y un subtema. El texto de entrada es la concatenacion del titulo y el resumen del informe. De 16.746 filas brutas, se retuvieron 10.027 con resumen y subtema valido; habia 206 subtemas presentes, de los que se descartaron 82 con menos de 20 ejemplos, quedando 124 subtemas y 9.293 documentos. El split fue 70/15/15: 6.505 de entrenamiento, 1.394 de validacion y 1.394 de test. No se menciona RLHF ni DPO; es un ajuste supervisado de clasificacion.

## Capacidades

- Clasificacion de texto multiclase en 124 subtemas de la taxonomia CAP, con salida de probabilidades por etiqueta.
- Etiquetado granular con formato `{Tema mayor} — {Subtema}`, por ejemplo `Environment — Air Pollution`, `Government Operations — Branch Relations` o `Civil Rights & Civil Liberties — Voting Rights`.
- Recuperacion de las top-k etiquetas con sus probabilidades mediante `softmax` sobre los logits.
- Procesamiento de textos de hasta 1024 tokens, adecuado para resumenes de proyectos de ley y declaraciones de impacto.
- Funcionamiento en CPU o GPU (el codigo de ejemplo selecciona CUDA si esta disponible).
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es exclusivamente un clasificador.
- Capacidad multilingue limitada al ingles, coherente con el corpus legislativo estadounidense de entrenamiento.

## Casos de uso

- Analisis automatizado de medidas electorales: el pipeline original etiqueta cada argumento generado sobre una ballot measure con su area de politica, permitiendo agrupar y comparar argumentos por subtema en lugar de por tema mayor.
- Triaje de resumenes de proyectos de ley: dado un lote de resumenes CRS o textos legislativos, asignar subtemas para enrutar cada documento al equipo de analisis correspondiente (por ejemplo, `Health — Insurance` frente a `Health — Prescription Drug Coverage`).
- Monitorizacion regulatoria: clasificar comunicados, propuestas normativas o notas de stakeholders y detectar cambios en la mezcla de subtemas a lo largo del tiempo.
- Investigacion en ciencias politicas: codificar automaticamente corpus de declaraciones de impacto o argumentos de partes interesadas con la taxonomia CAP, reduciendo el coste frente a la codificacion manual.
- Enriquecimiento de bases de datos documentales: anadir metadatos de subtema CAP a repositorios de textos politicos para busqueda facetada y filtrado fino.
- Analisis de opinion publica: etiquetar comentarios o argumentos ciudadanos con subtemas para medir que mecanismos concretos de politica concentran la atencion, algo que un clasificador de tema mayor no distingue.
- Preetiquetado para anotacion humana: generar top-3 de subtemas con probabilidades como sugerencia inicial para codificadores CAP, acelerando el proceso de revision.

## Benchmarks y rendimiento

Resultados en el conjunto de test retenido (n = 1.394, 124 clases), segun la model card:

| Metrica | Valor |
|---|---|
| Macro-F1 | 0,724 |
| Accuracy | 0,772 |
| ROC-AUC (OvR) | 0,993 |

Referencia del mismo procedimiento sobre los 20 temas mayores de CAP: macro-F1 0,846 y accuracy 0,868. La model card atribuye la diferencia a que varias de las 124 clases finas son genuinamente adyacentes. El mejor macro-F1 en validacion fue 0,707. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre ModernBERT-base, el consumo depende del modelo base y de la precision (fp32, fp16 o bf16). El adaptador en si ocupa un espacio minimo (repositorio de 0,0 GB).
- GPU recomendadas: cualquier GPU con suficiente memoria para ModernBERT-base en la precision elegida; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano reducido del modelo base y del adaptador, aunque no se aportan cifras de VRAM que lo confirmen.
- Opciones de despliegue: transformers junto con peft (el codigo de ejemplo de la model card usa `AutoModelForSequenceClassification`, `PeftModel` y `AutoTokenizer`); no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia interna, la propia model card compara este adaptador con la misma receta entrenada sobre los 20 temas mayores de CAP:

| Modelo | Clases | Macro-F1 | Accuracy |
|---|---|---|---|
| cap-policy-subtopic (este adaptador) | 124 subtemas | 0,724 | 0,772 |
| Misma receta sobre temas mayores CAP | 20 temas | 0,846 | 0,868 |

No se conocen alternativas publicas equivalentes de clasificacion CAP a nivel de subtema en la informacion disponible.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y evaluado en textos legislativos estadounidenses en ingles; su uso en otros idiomas o sistemas politicos no esta validado.
- Dominio restringido: entrenado sobre informes CRS del Congreso de EE. UU.; el rendimiento puede degradarse en textos de otros paises, registros informales o generos distintos.
- Clases descartadas: 82 subtemas con menos de 20 ejemplos fueron eliminados, por lo que el modelo no puede predecir esas categorias aunque existan en la taxonomia CAP completa.
- Clases adyacentes: el macro-F1 de 0,724 refleja confusion entre subtemas proximos; conviene revisar las top-k probabilidades en lugar de confiar solo en la etiqueta de mayor probabilidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de asignaciones erroneas con alta confianza en textos ambiguos o muy cortos.
- Sesgos: no se documentan analisis de sesgo; al derivar de un corpus legislativo estadounidense, puede heredar sesgos de cobertura tematica y de codificacion del dataset CAP.
- Licencia MIT: permisiva para uso comercial, pero el modelo base ModernBERT-base tiene su propia licencia que debe verificarse por separado.
- Sin soporte generativo ni de agentes: no debe emplearse como modelo de chat, razonamiento o tool calling.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoshuaAshkinaze/cap-policy-subtopic
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Comparative Agendas Project (US): https://www.comparativeagendas.net/us
- Dataset CAP US Legislative CRS Reports: `US-Legislative-crs_reports_24.1_1` (referenciado en la model card)

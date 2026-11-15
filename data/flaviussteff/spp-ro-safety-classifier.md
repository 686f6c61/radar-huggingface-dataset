# flaviussteff/spp-ro-safety-classifier

## Resumen

`spp-ro-safety-classifier` es un clasificador de seguridad en rumano construido sobre `dumitrescustefan/bert-base-romanian-cased-v1`, un BERT base en rumano con 124,4 millones de parametros. Lo desarrolla flaviussteff como componente del proyecto SPP-Ro, una replicacion con presupuesto de computo equivalente en rumano del trabajo *Synthetic Persona Pretraining* de Minder et al. (EPFL-dlab, 2026). El modelo resuelve una tarea binaria concreta: predecir si un documento web tiene severidad de contenido danino mayor o igual a 3 en una escala de 0 a 5.

Su funcion no es la moderacion de contenidos de proposito general, sino actuar como pieza interna de un pipeline de investigacion sobre alineacion. Se emplea para tres cosas: seleccionar los documentos que reciben una reflexion en el sidecar de SPP, definir el conjunto enmascarado en la perdida del baseline Filtered y construir el subconjunto "flagged" del conjunto de evaluacion del impuesto de alineacion, en el que el modelo Filtered pierde conocimiento y SPP no.

Es relevante porque ofrece una senal de seguridad calibrada y documentada en un idioma con pocos recursos como el rumano, con metricas de validacion publicadas (AUC 0,933 en el split de desarrollo) y una licencia MIT permisiva. El modelo es pequeno, rapido de ejecutar y util como clasificador auxiliar en pipelines de filtrado de corpus, no como sistema autonomo de moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder), fine-tune para clasificacion de secuencias |
| Parametros totales | 124.442.882 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 384 tokens (primeros 384 tokens del documento; truncamiento configurado en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (repo solo con pesos safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | rumano (ro) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT base en rumano (`bert-base-romanian-cased-v1`), con una cabeza de clasificacion de dos clases sobre el token `[CLS]`. El modelo base es cased, por lo que distingue mayusculas y minusculas, lo que es relevante para textos rumanos con diacriticos. La entrada se trunca a los primeros 384 tokens de cada documento, de modo que la decision se toma exclusivamente con el inicio del texto.

El fine-tune se realizo sobre 2.423 documentos web reales cuya severidad (escala 0-5) fue etiquetada por un LLM; la etiqueta objetivo es severity >= 3. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (en un clasificador BERT esto seria inusual). El split de desarrollo consta de 427 documentos, sobre el que se reportan AUC 0,933 y, con umbral 0,5, precision 0,78 y recall 0,58. A umbral 0,5 el modelo marca aproximadamente el 3% del corpus de 1,5 millones de documentos; a umbral 0,1 marca el 6,6% del conjunto web reservado.

## Capacidades

- Clasificacion binaria de seguridad en rumano: distingue documentos con severidad >= 3 frente a <= 2.
- Puntuacion de probabilidad calibrada utilizable con distintos umbrales (0,5 para seleccion estricta; 0,1 para cobertura amplia).
- Filtrado de corpus a gran escala: procesa documentos truncados a 384 tokens con un coste de inferencia bajo para un BERT base.
- Seleccion de subconjuntos para anotacion y para enmascaramiento de perdida en pipelines de alineacion.
- Construccion de slices de evaluacion ("flagged") en estudios de impuesto de alineacion.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingue limitada al rumano; no se documenta transferencia a otros idiomas.

## Casos de uso

- Filtrado previo de corpus web en rumano: aplicar el clasificador sobre los primeros 384 tokens de cada documento para descartar o marcar contenido de severidad alta antes de incluirlo en un dataset de preentrenamiento, usando el umbral 0,1 cuando se prioriza cobertura.
- Seleccion de documentos para anotacion humana o por LLM: dado que el modelo fue entrenado sobre etiquetas de LLM, sirve para priorizar que documentos revisar primero, reduciendo el volumen de anotacion a alrededor del 3% del corpus a umbral 0,5.
- Construccion de baselines de enmascaramiento de perdida: emplear la salida del clasificador para definir que tokens o documentos se excluyen del calculo de perdida en experimentos de alineacion, replicando el baseline Filtered de SPP-Ro.
- Evaluacion del impuesto de alineacion: usar el subconjunto marcado como slice de test para medir perdida de conocimiento en modelos alineados frente a modelos con preentrenamiento de personas sinteticas.
- Moderacion asistida en foros o comentarios en rumano: integrar el score como senal secundaria en un sistema de moderacion, con revision humana obligatoria dado el recall de 0,58 a umbral 0,5.
- Investigacion academica en NLP de bajos recursos: servir como punto de partida reproducible para estudiar clasificadores de seguridad en rumano, con licencia MIT y pesos abiertos.
- Auditoria de datasets existentes: puntuar corpus rumanos ya recopilados para estimar que proporcion contiene contenido de severidad alta antes de su publicacion.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor |
|---|---|---|
| AUC | Dev split (427 documentos) | 0,933 |
| Precision (umbral 0,5) | Dev split | 0,78 |
| Recall (umbral 0,5) | Dev split | 0,58 |
| Tasa de marcado (umbral 0,5) | Corpus de 1,5M documentos | ~3% |
| Tasa de marcado (umbral 0,1) | Conjunto web reservado | 6,6% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las metricas anteriores son las unicas reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 124,4 millones de parametros, mas overhead de activaciones y tokenizador; en fp16 o bf16 baja a unos 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, T4, L4, A100 o H100 funcionan sin problema. En CPU moderna la inferencia por documento es viable para lotes moderados.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con PyTorch (ejemplo oficial del autor), exportacion a ONNX Runtime para servir a bajo coste, TorchServe o FastAPI como envoltorio. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no estan disponibles de forma directa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU en lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `spp-ro-safety-classifier` | 124,4 M | 384 tokens | Rumano | MIT | Hugging Face, pesos safetensors |
| `dumitrescustefan/bert-base-romanian-cased-v1` (base) | ~124 M | 512 tokens tipico | Rumano | no disponible en la informacion | Hugging Face |
| Clasificadores de toxicidad multilingues basados en XLM-R | ~278 M (base) | 512 tokens | Multilingue | varia por modelo | Hugging Face |

La comparacion con alternativas especificas de clasificacion de seguridad en rumano no esta disponible: no se conocen en la informacion proporcionada modelos equivalentes entrenados con la misma definicion de severidad (escala 0-5, objetivo >= 3) ni con el mismo protocolo de etiquetado por LLM.

## Limitaciones y advertencias

- Solo procesa los primeros 384 tokens de cada documento; contenido danino situado mas adelante en el texto no influye en la prediccion.
- Recall de 0,58 a umbral 0,5: deja pasar una parte importante de los documentos de severidad alta. Para cobertura hay que bajar el umbral, asumiendo mas falsos positivos.
- El etiquetado de entrenamiento proviene de un LLM, no de anotadores humanos; los sesgos y errores del etiquetador se transfieren al clasificador.
- La definicion de "seguridad" es operativa y especifica del proyecto (severidad >= 3 en escala 0-5), no una taxonomia general de toxicidad; no debe interpretarse como moderacion universal.
- Idioma limitado al rumano; no se documenta rendimiento en textos mixtos, code-switching ni otros idiomas.
- Sesgos conocidos no documentados en la informacion disponible.
- Riesgo de alucinacion no aplica directamente al ser un clasificador discriminativo, pero las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento (dominio web rumano).
- Uso comercial permitido por la licencia MIT, con la obligacion habitual de conservar el aviso de copyright; conviene verificar la licencia del modelo base por separado.
- No apto como unico mecanismo de moderacion en produccion sin revision humana y sin validacion sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaviussteff/spp-ro-safety-classifier
- Proyecto SPP-Ro: https://github.com/flaviussteff/spp-ro
- Paper de referencia (Synthetic Persona Pretraining, Minder et al., EPFL-dlab, 2026): https://arxiv.org/abs/2608.13482
- Modelo base: https://huggingface.co/dumitrescustefan/bert-base-romanian-cased-v1

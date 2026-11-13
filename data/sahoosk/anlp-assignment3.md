# sahoosk/anlp-assignment3

## Resumen

`sahoosk/anlp-assignment3` no es un modelo fundacional al uso, sino un repositorio de artefactos de investigacion correspondiente a la asignacion 3 de la asignatura Advanced NLP (ANLP, edicion Monsoon 2026). Contiene los pesos entrenados (`best.pt`), historiales de entrenamiento, metricas, logs y el informe en PDF/LaTeX de dos tareas independientes: descifrado de mensajes cifrados (Parte A) y deteccion de noticias falsas sobre el dataset UPFD GossipCop (Parte B). El autor es `sahoosk` (Shashikanta Sahoo, IIIT Hyderabad, segun el enlace al repositorio institucional).

En la Parte A se comparan cuatro arquitecturas de secuencia para descifrado: un transformer clasico, Mamba (SSM selectivo), DeltaNet (atención lineal con regla delta) y un modelo hibrido. Los tamanos son muy reducidos (entre 6,8 y 8,2 millones de parametros) y los resultados en el test set de 1.318 mensajes son bajos en exactitud (en torno al 9% de caracteres y 3% de palabras), aunque con F1 entre 0,35 y 0,39, lo que sugiere que el modelo aprende estructura parcial del cifrado pero no lo resuelve por completo.

En la Parte B se evalua deteccion de noticias falsas combinando BERT (u otras features como spaCy o perfil de usuario) con redes neuronales sobre grafo (GCN, GraphSAGE, GAT, BiGCN) sobre UPFD GossipCop. Los mejores resultados los alcanza `gat_bert` con 0,9658 de accuracy y macro F1, seguido de `graphsage_content` (0,9486) y `gcn_bert` (0,9479), promediando 5 semillas. Es material de referencia academica, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: transformer, Mamba (SSM), DeltaNet, hibrido (Parte A); GCN/GraphSAGE/GAT/BiGCN + BERT (Parte B) |
| Parametros totales | Parte A: 6.858.752 (mamba) a 8.195.480 (deltanet); Parte B: no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset UPFD GossipCop es en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoints `best.pt`) |

## Arquitectura y entrenamiento

La Parte A entrena cuatro modelos de secuencia sobre una tarea de descifrado de mensajes: un transformer encoder-decoder/decoder clasico (8.165.888 parametros), Mamba con estado selectivo (6.858.752), DeltaNet con atencion lineal basada en regla delta (8.195.480) y un modelo hibrido que combina ambos enfoques (7.527.116). El objetivo es comparar la eficiencia y calidad de arquitecturas subcuadraticas frente a atencion cuadratica en una tarea de transformacion simbolica. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus ni si se aplico RLHF/DPO; el unico dato concreto es el tamano del test set (1.318 mensajes).

La Parte B aborda deteccion de noticias falsas sobre UPFD GossipCop (propagacion de noticias en Twitter con etiquetas de veracidad). Se combinan representaciones de texto (BERT, spaCy, perfil de usuario o contenido) con capas de agregacion sobre grafo: GCN, GraphSAGE, GAT y BiGCN. Cada configuracion se entrena con 5 semillas y se reporta media y desviacion tipica de accuracy y macro F1. No se especifican hiperparametros, numero de epocas ni estrategia de aumentacion de datos en la informacion proporcionada.

## Capacidades

- Descifrado de mensajes cifrados a nivel de caracter y palabra (Parte A), con salida de texto descifrado para conjuntos de validacion y test.
- Modelado de secuencias largas mediante SSM (Mamba) y atencion lineal (DeltaNet), sin ventana de contexto cuadratica.
- Clasificacion binaria de veracidad de noticias (fake vs. real) sobre grafos de propagacion (Parte B).
- Agregacion de informacion de vecindad en grafos con GCN, GraphSAGE, GAT y BiGCN.
- Integracion de features textuales densas (BERT), linguisticas (spaCy) y de perfil de usuario.
- No soporta tool calling, function calling ni razonamiento multi-paso: son modelos de tarea especifica.
- Capacidades multilingues: no disponibles; el unico dataset documentado es en ingles.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- **Investigacion comparativa de arquitecturas subcuadraticas**: el repositorio permite reproducir la comparacion transformer vs. Mamba vs. DeltaNet vs. hibrido en una tarea controlada de descifrado, util para estudiar el trade-off entre parametros y calidad en tareas de transformacion simbolica.
- **Analisis forense de cifrados simples**: los checkpoints de la Parte A pueden servir como punto de partida para estudiar hasta que punto un modelo pequeno (6-8 M de parametros) puede recuperar texto plano de cifrados de sustitucion o transposicion, con las limitaciones de exactitud documentadas.
- **Deteccion de desinformacion en redes sociales**: el pipeline GAT+BERT (0,9658 de accuracy) es reutilizable sobre otros datasets de propagacion de noticias con estructura similar a UPFD, como Politifact o Twitter15/16, previo reentrenamiento.
- **Docencia y evaluacion de practicas de NLP avanzado**: el repositorio incluye informe, logs, scripts (`scripts/part1/test_assn.sh`) y checkpoints, lo que lo hace util como material de referencia para asignaturas de NLP.
- **Baseline para experimentos de GNN sobre grafos de propagacion**: las ocho configuraciones de la Parte B (root_mlp, gcn, graphsage, gat, bigcn con distintas features) sirven como lineas base con media y desviacion tipica ya calculadas sobre 5 semillas.
- **Estudio de robustez de features textuales en GNN**: la comparativa entre `graphsage_bert` (0,9274), `graphsage_spacy` (0,9237), `graphsage_content` (0,9486) y `graphsage_profile` (0,9035) permite analizar que representacion textual aporta mas senal al clasificador.

## Benchmarks y rendimiento

Parte A (test set, 1.318 mensajes):

| Modelo | Char acc | Word acc | F1 | Levenshtein medio | Parametros |
|---|---:|---:|---:|---:|---:|
| transformer | 0,0904 | 0,0313 | 0,3589 | 663,5 | 8.165.888 |
| mamba | 0,0923 | 0,0291 | 0,3914 | 644,1 | 6.858.752 |
| deltanet | 0,0915 | 0,0318 | 0,3528 | 665,3 | 8.195.480 |
| hybrid | 0,0913 | 0,0376 | 0,3764 | 650,0 | 7.527.116 |

Parte B (UPFD GossipCop, test, media ± desviacion tipica sobre 5 semillas):

| Configuracion | Accuracy | Macro F1 |
|---|---:|---:|
| root_mlp_bert | 0,7383 ± 0,0030 | 0,7369 ± 0,0042 |
| gcn_bert | 0,9479 ± 0,0027 | 0,9479 ± 0,0027 |
| graphsage_bert | 0,9274 ± 0,0027 | 0,9274 ± 0,0027 |
| gat_bert | 0,9658 ± 0,0021 | 0,9658 ± 0,0021 |
| bigcn_bert | 0,9327 ± 0,0033 | 0,9327 ± 0,0033 |
| graphsage_profile | 0,9035 ± 0,0049 | 0,9034 ± 0,0050 |
| graphsage_spacy | 0,9237 ± 0,0071 | 0,9237 ± 0,0072 |
| graphsage_content | 0,9486 ± 0,0071 | 0,9485 ± 0,0071 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la Parte A: inferior a 1 GB en fp32 para los cuatro modelos (6,8-8,2 M de parametros); cabe en cualquier GPU consumer, incluso en CPU.
- VRAM estimada para la Parte B: no disponible; depende del encoder BERT base (aprox. 110 M de parametros) y del tamano del grafo de propagacion por muestra.
- GPU recomendadas: cualquier GPU con al menos 4 GB (GTX 1650, RTX 3050) es suficiente para la Parte A; para la Parte B se recomienda RTX 3090/4090 o A100 por el coste de BERT y las operaciones sobre grafo.
- Cabe en GPU consumer: si, en ambos casos con cuantizaciones o tamanos de batch moderados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio proporciona scripts de inferencia propios (`scripts/part1/test_assn.sh --model mamba`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sahoosk/anlp-assignment3 (mamba, Parte A) | 6,86 M | no disponible | F1 0,3914 en descifrado | no disponible | Hugging Face (0 descargas) |
| sahoosk/anlp-assignment3 (gat_bert, Parte B) | no disponible | no disponible | Accuracy 0,9658 en UPFD GossipCop | no disponible | Hugging Face |
| Mamba original (state-spaces/mamba) | 130 M - 2,8 B | hasta 2M tokens | resultados en LM y audio | Apache 2.0 | Hugging Face, GitHub |
| BERT base (google-bert/bert-base-uncased) | 110 M | 512 tokens | GLUE estandar | Apache 2.0 | Hugging Face |

La comparacion con Mamba y BERT originales es solo referencial: los modelos de este repositorio son versiones a escala de juguete (6-8 M de parametros en la Parte A) y no publican evaluacion en benchmarks estandar, por lo que no son directamente comparables en rendimiento absoluto.

## Limitaciones y advertencias

- **No es un modelo de proposito general**: son checkpoints de tarea especifica (descifrado y clasificacion de noticias), no un LLM conversacional. No debe usarse como sustituto de un modelo fundacional.
- **Exactitud baja en Parte A**: 9% de caracteres y 3% de palabras correctas, con Levenshtein medio de 644-665 caracteres. Los modelos no descifran correctamente; solo aproximan estructura.
- **Licencia no especificada**: no hay licencia declarada, lo que impide legalmente su uso comercial sin autorizacion explicita del autor.
- **Idioma**: el unico dataset documentado (UPFD GossipCop) es en ingles; no hay evidencia de soporte multilingue.
- **Riesgo de alucinacion**: no aplica en el sentido de LLM generativo, pero los outputs de descifrado pueden ser plausibles y falsos; no deben usarse como evidencia forense sin validacion.
- **Sesgos del dataset**: UPFD GossipCop esta sesgado hacia un dominio (noticias de cotilleo en ingles) y a una distribucion concreta de propagacion en Twitter; el rendimiento no se transfiere necesariamente a otros dominios o plataformas.
- **Caveat de produccion**: el repositorio tiene 0 descargas y 0 likes, creado y actualizado en noviembre de 2026; es un artefacto academico sin mantenimiento ni garantias de reproducibilidad a largo plazo.
- **Sin datos de contexto**: no se especifica la longitud de contexto de los modelos de la Parte A, lo que impide planificar su uso en entradas largas.

## Enlaces

- Hugging Face: https://huggingface.co/sahoosk/anlp-assignment3
- Codigo (repositorio institucional IIIT): https://code.iiit.ac.in/advanced-nlp/m26-assignment3-shashikanta.sahoo
- Mamba (paper original): https://arxiv.org/abs/2312.00752
- DeltaNet (paper original): https://arxiv.org/abs/2102.04306
- UPFD (dataset y paper): https://github.com/safe-graph/GNN-FakeNews
- BERT (paper original): https://arxiv.org/abs/1810.04805

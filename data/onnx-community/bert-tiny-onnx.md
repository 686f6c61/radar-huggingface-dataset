# onnx-community/bert-tiny-ONNX

## Resumen

bert-tiny-ONNX es la conversión a formato ONNX del modelo prajjwal1/bert-tiny, una variante compacta de BERT con solo 2 capas de transformer y una dimensión oculta de 128. Lo publica la comunidad onnx-community mediante un proceso automático de conversión alojado en un Hugging Face Space, con el objetivo de facilitar su uso en entornos JavaScript a través de la librería Transformers.js. No es un modelo nuevo: es un artefacto de despliegue del checkpoint original de Prajjwal Bhargava, que a su vez deriva de los checkpoints compactos de BERT publicados por Google Research.

El modelo original se introdujo en el estudio "Well-Read Students Learn Better: On the Importance of Pre-training Compact Models" (Turc et al., 2019) y se portó a Hugging Face para el trabajo "Generalization in NLI: Ways (Not) To Go Beyond Simple Heuristics" (Bhargava et al., 2021). Su propósito no es la generación de texto, sino servir como base preentrenada que debe afinarse en tareas downstream, típicamente clasificación de secuencias e inferencia de lenguaje natural (NLI, con etiquetas MNLI en sus tags).

Su relevancia actual es práctica: con un repositorio de apenas 0,1 GB y licencia MIT, es un candidato idóneo para inferencia en navegador, extensiones o dispositivos con recursos muy limitados, donde un modelo mayor sería inviable. A cambio, su capacidad es muy acotada y su ventana de contexto es la estándar de BERT (512 tokens).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (L=2, H=128) |
| Parametros totales | no disponible (variante tiny de BERT; el repo ocupa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT estandar: 512 tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; variantes cuantizadas no detalladas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder de tipo BERT en su configuracion compacta tiny: 2 capas (L=2) y dimension oculta de 128 (H=128). El checkpoint original procede de la conversion de un checkpoint TensorFlow del repositorio oficial de Google BERT, y forma parte de la familia de modelos compactos (tiny, mini, small, medium) descritos en Turc et al. (2019), cuyo planteamiento es que un estudiante pequeno bien preentrenado puede igualar o superar a modelos mayores en tareas downstream tras el afinado.

El preentrenamiento es el estandar de BERT (objetivos de masked language modeling y next sentence prediction), aunque la informacion proporcionada no detalla el volumen de tokens ni la composicion del corpus. No se indica que haya habido RLHF, DPO ni ninguna fase de alineacion, lo cual es coherente con un encoder preentrenado pensado para clasificacion. Tampoco se documentan innovaciones tecnicas adicionales: es una arquitectura transformer clasica sin decodificacion especulativa ni atencion lineal.

## Capacidades

- Codificacion de texto en ingles para tareas de comprension: representaciones contextuales por token y por secuencia.
- Clasificacion de secuencias: es su uso previsto principal, incluyendo inferencia de lenguaje natural (NLI) segun los tags MNLI y NLI del modelo.
- Extraccion de caracteristicas y embeddings para busqueda semantica o clustering a pequena escala.
- Base para afinado en tareas downstream (sentiment analysis, clasificacion de topicos, deteccion de similitud textual).
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidades multilingues: no, solo ingles.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Clasificacion de texto en el navegador: al estar en ONNX y pensado para Transformers.js, permite etiquetar resenas, correos o mensajes directamente en el cliente sin enviar datos a un servidor, lo que simplifica el cumplimiento de privacidad.
- Deteccion de similitud o duplicados: generar embeddings de frases cortas para agrupar tickets de soporte o detectar contenido repetido en un corpus pequeno, donde la precision de un modelo mayor no es critica.
- Filtrado previo en pipelines de moderacion: usar el modelo como primera etapa de bajo coste para descartar contenido claramente inocuo antes de pasar el resto a un modelo mayor.
- Inferencia de lenguaje natural ligera: tareas de entailment/contradiction sobre pares de frases en ingles, aprovechando que el modelo se distribuye con etiquetas MNLI y proviene de un trabajo centrado en NLI.
- Extensiones de navegador y aplicaciones de escritorio: al ocupar 0,1 GB y ejecutarse en ONNX Runtime Web o Node, encaja en entornos sin GPU y con memoria limitada.
- Prototipado rapido de pipelines de NLP: servir como baseline barato para validar una idea de clasificacion antes de invertir en un modelo mayor, gracias a su licencia MIT y a su facil despliegue.
- Educacion e investigacion: estudiar el comportamiento de modelos compactos y reproducir los experimentos de Turc et al. y Bhargava et al. con un artefacto listo para usar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPU integradas. Cualquier RTX o A100 esta sobredimensionada para este modelo.
- Cabe en consumer GPU: si, en todas, y tambien en moviles y navegadores mediante ONNX Runtime Web.
- Opciones de despliegue: Transformers.js (uso previsto), ONNX Runtime (Web, Node, Python), y conversion a otros formatos si se necesita.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Capas / dimension | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bert-tiny-ONNX (este) | L=2, H=128 | no disponible (BERT estandar 512) | MIT | ONNX | Conversion automatica para Transformers.js |
| prajjwal1/bert-tiny | L=2, H=128 | BERT estandar 512 | MIT | PyTorch (safetensors/bin) | Checkpoint original del que deriva |
| prajjwal1/bert-mini | L=4, H=256 | BERT estandar 512 | MIT | PyTorch | Mayor capacidad, mismo origen |
| prajjwal1/bert-small | L=4, H=512 | BERT estandar 512 | MIT | PyTorch | Alternativa intermedia de la misma familia |

Los datos de contexto de los modelos comparables se basan en la configuracion estandar de BERT; la informacion proporcionada no incluye cifras de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo no generativo: no sirve para chatbots, resumen generativo ni generacion de codigo; usarlo para ello produce resultados invalidos.
- Capacidad muy limitada: con 2 capas y 128 dimensiones, su precision en tareas complejas sera notablemente inferior a la de modelos mayores; requiere afinado para obtener resultados utiles.
- Solo ingles: no soporta castellano ni otros idiomas.
- Ventana de contexto corta (estandar BERT, 512 tokens): no apta para documentos largos sin troceado previo.
- Riesgo de sesgos: al derivar de BERT preentrenado en corpus web en ingles, puede heredar sesgos de genero, raza o ideologia; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir clasificaciones erroneas con alta confianza en dominios alejados de sus datos de entrenamiento.
- Licencia MIT: permisiva para uso comercial, pero conviene citar los dos papers originales segun solicita el autor.
- Conversion automatica: el artefacto ONNX se genero con un Space automatico; no hay garantia de paridad numerica exacta con el checkpoint PyTorch original ni documentacion de las variantes ONNX incluidas.
- Fecha de creacion indicada en 2026: conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onnx-community/bert-tiny-ONNX
- Modelo base: https://huggingface.co/prajjwal1/bert-tiny
- Variante mini: https://huggingface.co/prajjwal1/bert-mini
- Variante small: https://huggingface.co/prajjwal1/bert-small
- Variante medium: https://huggingface.co/prajjwal1/bert-medium
- Documentacion de pipelines de Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Repositorio oficial de BERT de Google: https://github.com/google-research/bert
- Repositorio del trabajo de NLI: https://github.com/prajjwal1/generalize_lm_nli
- Paper "Well-Read Students Learn Better": https://arxiv.org/abs/1908.08962
- Paper "Generalization in NLI": https://arxiv.org/abs/2110.01518
- Twitter del autor original: https://twitter.com/prajjwal_1

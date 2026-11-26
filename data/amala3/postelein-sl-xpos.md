# Amala3/postelein-sl-xpos

## Resumen

Postelein-sl-xpos es un modelo de etiquetado gramatical (POS tagging, en concreto el conjunto de etiquetas XPOS del estandar Universal Dependencies) especializado en esloveno. Lo desarrolla el usuario Amala3 bajo el paraguas del proyecto Postelein, que agrupa modelos de procesamiento linguistico para lenguas eslavas construidos sobre la arquitectura ModernBERT. El modelo resuelve la tarea de asignar a cada token de una frase su categoria gramatical fina, un paso basico pero critico en cualquier pipeline de analisis morfosintactico, lematizacion o extraccion de informacion.

Tecnicamente se trata de un modelo encoder-only de tipo ModernBERT con 308.440.736 parametros (aproximadamente 308 millones), reentrenado o afinado para token classification sobre datos en formato CoNLL-U. La relevancia de este modelo es acotada pero real: cubre una lengua de recursos medios como el esloveno con una arquitectura moderna y eficiente, y su publicacion bajo el sello Postelein lo integra en un ecosistema coherente de herramientas linguisticas para eslavo.

Conviene subrayar que el acceso al modelo esta restringido (gated) en Hugging Face, que no declara licencia en la informacion disponible y que no cuenta todavia con descargas ni valoraciones publicas. Es, por tanto, un artefacto de investigacion reciente, no un modelo consolidado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder-only) |
| Parametros totales | 308.440.736 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificable a FP16, INT8, GGUF segun herramientas externas) |
| Idiomas soportados | esloveno (sl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | token-classification (POS tagging, etiquetas XPOS) |
| Corpus de referencia | CoNLL-U (Universal Dependencies) |
| Tamano del repositorio | 1,3 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una familia de encoders transformer que moderniza la arquitectura BERT original incorporando attention con RoPE (rotary positional embeddings), alternancia entre attention global y local, y kernels optimizados para secuencias largas. Con 308 millones de parametros, se situa en la franja de los BERT-base/large modernizados, lo que lo hace adecuado para tareas de comprension y etiquetado sin coste de generacion autoregresiva.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de ajuste fino supervisado mas alla del propio etiquetado. Los tags del repositorio indican el uso de datos en formato CoNLL-U, lo que sugiere entrenamiento sobre un treebank de esloveno en Universal Dependencies (probablemente ssj o sst), y la presencia de la etiqueta "textlens" apunta a un pipeline propio del autor para la preparacion de corpus. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa ni atencion lineal mas alla de las propias de ModernBERT.

## Capacidades

- Etiquetado gramatical fino (XPOS) token a token en esloveno, siguiendo el esquema de Universal Dependencies.
- Procesamiento de texto a nivel de frase y documento en formato CoNLL-U.
- Integracion en pipelines de analisis morfosintactico como paso previo a parsing o lematizacion.
- Clasificacion de tokens con arquitectura encoder-only, apta para inferencia por lotes.
- Cobertura monoidioma: unicamente esloveno.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de etiquetado.
- No se documentan capacidades multimodales (vision, audio) ni modo "thinking".

## Casos de uso

- Preprocesamiento linguistico para PLN en esloveno: el modelo etiqueta cada token con su categoria XPOS, sirviendo de entrada a parsers de dependencias o sistemas de reconocimiento de entidades.
- Construccion de corpus anotados: permite anotar automaticamente grandes volumenes de texto esloveno en formato CoNLL-U para entrenar o evaluar otros modelos.
- Lematizacion asistida: combinado con un lematizador, las etiquetas POS reducen la ambiguedad en la seleccion de lemas.
- Busqueda y recuperacion de informacion linguistica: filtrar documentos por patrones gramaticales (por ejemplo, extraer todas las formas verbales) en corpus eslovenos.
- Analisis de estilo y ensenanza de lengua: identificar categorias gramaticales en textos para herramientas de correccion o didactica del esloveno.
- Enriquecimiento de pipelines de traduccion automatica: las etiquetas POS como caracteristica auxiliar en sistemas de TA esloveno-espanol u otras combinaciones.
- Investigacion en linguistica computacional: banco de pruebas para comparar ModernBERT frente a BERT o XLM-R en lenguas eslavas de recursos medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,6-0,7 GB para los pesos (308 M de parametros), mas overhead de activaciones y tokenizador; en la practica, menos de 2 GB.
- En FP32: aproximadamente 1,2 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes de tamano moderado.
- GPU recomendadas para alto throughput: A100, H100 o L4 si se procesan millones de frases; para uso individual, cualquier GPU con 4 GB o mas es suficiente.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TGI (con soporte de token-classification), y conversion a GGUF para llama.cpp aunque el soporte de ModernBERT en llama.cpp puede requerir verificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Postelein-sl-xpos | 308 M | no disponible | POS tagging (sl) | no disponible | Gated en HF |
| BERTic (BSC) | ~110 M | 512 | POS/NER multilingue (incl. esloveno) | MIT/Apache segun variante | Publico |
| XLM-RoBERTa-base | ~278 M | 512 | Token classification multilingue | MIT | Publico |
| Sloberta (esloveno) | ~110 M | 512 | POS/NER en esloveno | no disponible | Publico |

La comparacion es aproximada: no hay datos de rendimiento publicados para Postelein-sl-xpos, por lo que no puede establecerse una jerarquia cuantitativa frente a BERTic, XLM-R o Sloberta. La ventaja teorica de Postelein-sl-xpos es su arquitectura ModernBERT (mas eficiente en secuencias largas) y su especializacion monoidioma; la desventaja es su acceso restringido y la ausencia de licencia declarada.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede bloquear su uso en pipelines automatizados o en entornos sin cuenta.
- Licencia no declarada: no puede asumirse uso comercial sin consultar al autor; riesgo legal para produccion.
- Monoidioma: solo esloveno; no generaliza a otras lenguas eslavas ni al castellano.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas consolidadas.
- Riesgo de alucinacion bajo en tareas de etiquetado, pero puede producir etiquetas incorrectas en textos ruidosos, dominios especializados o esloveno coloquial no representado en el treebank de entrenamiento.
- Sesgos heredados del corpus de entrenamiento (probablemente texto periodistico o literario de Universal Dependencies), con posible infrarepresentacion de dialectos o registros informales.
- Sin datos sobre longitud de contexto efectiva: no debe asumirse soporte de secuencias largas mas alla de lo que ModernBERT permite, sin verificacion empirica.
- Modelo de investigacion reciente (creado en noviembre de 2026), sin descargas ni validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amala3/postelein-sl-xpos
- Repositorio del autor en Hugging Face: https://huggingface.co/Amala3
- Universal Dependencies (esquema XPOS y treebanks de esloveno): https://universaldependencies.org/
- ModernBERT (paper y repositorio): https://github.com/AnswerDotAI/ModernBERT
- Documentacion de token classification en transformers: https://huggingface.co/docs/transformers/tasks/token_classification

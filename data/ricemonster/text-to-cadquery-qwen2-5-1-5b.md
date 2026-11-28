# ricemonster/Text-to-CadQuery-Qwen2.5-1.5B

## Resumen

Text-to-CadQuery-Qwen2.5-1.5B es un ajuste fino supervisado de Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario ricemonster, especializado en generar programas Python ejecutables con la libreria CadQuery a partir de descripciones de piezas CAD en lenguaje natural. El modelo resuelve el problema de traducir especificaciones geometricas textuales (bloques, taladros pasantes, operaciones booleanas, chaflanes) a codigo parametrico reproducible, lo que permite automatizar la generacion de modelos 3D sin intervencion manual en un editor CAD.

Se trata de un ajuste de parametros completos (full-parameter SFT) sobre un transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parametros reales segun los pesos en safetensors. El modelo forma parte de una coleccion con variantes de 0,5B, 1,5B, 3B y 7B construidas sobre las correspondientes versiones Instruct de Qwen2.5, lo que permite elegir el compromiso entre calidad de generacion y coste de inferencia.

Su relevancia actual radica en el nicho concreto que cubre: la generacion de codigo CAD ejecutable es una tarea con verificacion objetiva (el script compila o no, y produce una geometria valida o no), lo que la convierte en un caso de uso atractivo para pipelines de diseno generativo, prototipado rapido y asistentes de ingenieria. Al estar basado en un modelo de 1,5B, puede desplegarse en hardware modesto, aunque el autor no publica resultados de benchmarks ni detalles del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,2 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de ajuste | ricemonster/Text-to-CadQuery |
| Tipo de entrenamiento | Supervised fine-tuning de parametros completos |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida. No se trata de un MoE ni de una arquitectura hibrida; el autor no documenta modificaciones estructurales respecto al base, por lo que se asume que la unica diferencia es el ajuste de pesos.

El entrenamiento consistio en un ajuste fino supervisado de parametros completos sobre el dataset ricemonster/Text-to-CadQuery, compuesto por pares de descripcion en lenguaje natural y programas CadQuery. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de etapas de RLHF/DPO ni hiperparametros como tasa de aprendizaje, numero de epochs o estrategia de enmascaramiento de perdida. El prompt de inferencia documentado por el autor sigue el formato `### Instruction:\n{description}\n\n### Response:\n`, con generacion codiciosa (`do_sample=False`) y hasta 2048 tokens nuevos.

## Capacidades

- Generacion de codigo Python con la API de CadQuery a partir de descripciones textuales de piezas CAD.
- Produccion de scripts ejecutables orientados a geometria parametrica: primitivas (cajas, cilindros), operaciones booleanas, taladros, chaflanes y redondeos.
- Generacion de texto conversacional heredada del base Qwen2.5-1.5B-Instruct, aunque el ajuste esta orientado a la tarea CAD.
- Seguimiento del formato de prompt Instruction/Response definido por el autor.
- Generacion determinista recomendada por el autor (decodificacion codiciosa) para reducir variabilidad en el codigo emitido.
- Capacidades multilingues limitadas al ingles segun la model card; no se declara soporte de castellano ni de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Prototipado rapido de piezas mecanicas: un ingeniero describe una pieza ("bloque rectangular con taladro cilindrico centrado pasante") y el modelo emite el script CadQuery correspondiente, que se ejecuta para obtener el STEP/STL sin escribir codigo a mano.
- Generacion de bibliotecas parametricas: a partir de descripciones con parametros, el modelo produce funciones CadQuery reutilizables que pueden integrarse en un catalogo interno de componentes.
- Automatizacion de pipelines de diseno generativo: el script generado se ejecuta en un contenedor con CadQuery instalado y la salida geometrica se valida de forma automatica (compilacion correcta, volumen no nulo, numero de solidos esperado).
- Asistente de documentacion tecnica: dado un plano o ficha de especificaciones en texto, el modelo genera el codigo que reproduce la geometria descrita, util para mantener documentacion y modelo sincronizados.
- Educacion y formacion en CAD programatico: el modelo sirve como generador de ejemplos de codigo CadQuery a partir de enunciados, reduciendo la barrera de entrada a la modelacion parametrica.
- Pruebas de regresion geometrica: generar variantes de una pieza cambiando dimensiones en la descripcion permite crear conjuntos de pruebas para validadores de geometria o para comparar kernels CAD.
- Integracion en entornos de bajo recursos: al ser un modelo de 1,5B, puede ejecutarse en una unica GPU consumer para tareas por lotes de generacion de scripts, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,1 GB solo para pesos (1,54B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6-2 GB para pesos; en 4 bits, en torno a 0,8-1 GB, aunque el autor no publica artefactos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 sin cuantizar (RTX 3060 Ti, RTX 4060, RTX 4070, L4); A100/H100 no son necesarias para este tamano y solo se justifican para despliegue por lotes a gran escala.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en bf16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (documentado por el autor), vLLM y TGI para serving, llama.cpp/Ollama si se generan conversiones GGUF (no publicadas por el autor). El ejemplo del autor usa `AutoModelForCausalLM` con `device_map="auto"` y `torch_dtype=torch.bfloat16`.
- Latencia y throughput: no disponibles; al ser un modelo de 1,5B con generacion codiciosa y hasta 2048 tokens nuevos, se espera una latencia de decodificacion del orden de decenas de tokens por segundo en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ricemonster/Text-to-CadQuery-Qwen2.5-1.5B | 1,54B | no disponible | Texto a CadQuery | no disponible | Hugging Face |
| ricemonster/Text-to-CadQuery-Qwen2.5-0.5B | no disponible en la informacion | no disponible | Texto a CadQuery | no disponible | Hugging Face |
| ricemonster/Text-to-CadQuery-Qwen2.5-3B | no disponible en la informacion | no disponible | Texto a CadQuery | no disponible | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54B | no disponible en la informacion | Instrucciones generales | no disponible en la informacion | Hugging Face |

La comparativa mas directa es con las otras variantes de la misma coleccion (0,5B, 3B y 7B), que comparten dataset y metodologia, y con el modelo base sin ajustar, que no esta especializado en CadQuery. No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base Qwen2.5-1.5B-Instruct y la del propio repositorio.
- El modelo esta entrenado y declarado unicamente para ingles; las descripciones en castellano pueden degradar la calidad del codigo generado.
- Riesgo de alucinacion en la API de CadQuery: el modelo puede emitir metodos o parametros inexistentes, por lo que todo script generado debe validarse ejecutandolo en un entorno controlado.
- No hay datos publicados sobre sesgos, composicion del dataset ni procesos de filtrado, lo que impide evaluar la robustez frente a descripciones ambiguas o fuera de distribucion.
- El autor no publica benchmarks ni evaluaciones de tasa de exito en compilacion o validez geometrica, por lo que la calidad real de generacion es desconocida.
- El contexto maximo no se documenta en la model card; conviene no asumir la ventana completa del base sin verificar el tokenizer y la configuracion del repositorio.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El prompt de inferencia esta fijado por el autor; desviarse del formato `### Instruction:` / `### Response:` puede reducir la calidad de la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-1.5B
- Dataset de ajuste: https://huggingface.co/datasets/ricemonster/Text-to-CadQuery
- Coleccion Text-to-CadQuery: https://huggingface.co/collections/ricemonster/text-to-cadquery-6b0a2cabae152d0d6f0fc823
- Variante 0,5B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-0.5B
- Variante 3B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-3B
- Variante 7B: https://huggingface.co/ricemonster/Text-to-CadQuery-Qwen2.5-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

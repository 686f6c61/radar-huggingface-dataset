# mistercoder18/tarangix-qwen2-5-3b-instruct

## Resumen

Tarangix Qwen2.5 3B Instruct es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct, publicado por el usuario mistercoder18 en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de lenguaje denso, decoder-only, de aproximadamente 3.000 millones de parametros, derivado de la version ya cuantizada en 4 bits (`unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit`) de la familia Qwen2.5 de Alibaba. El entrenamiento se realizo con la libreria Unsloth, que el autor destaca por ofrecer un entrenamiento "2x mas rapido" que un flujo estandar.

El modelo hereda las caracteristicas tecnicas de Qwen2.5-3B: una arquitectura transformer con atencion por grupos (GQA), preentrenada sobre un corpus de hasta 18 billones de tokens y con soporte de contexto largo (hasta 128.000 tokens segun la documentacion de la familia). Sin embargo, la model card publicada es extremadamente escueta: no detalla el dataset de ajuste, el numero de pasos, la composicion de datos ni los hiperparametros utilizados.

Su relevancia es limitada en terminos de adopcion: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, y no aporta benchmarks ni documentacion adicional. Es util principalmente como ejemplo de fine-tuning con Unsloth sobre Qwen2.5-3B y como punto de partida para experimentacion, no como un modelo de produccion validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2.5 |
| Parametros totales | 3B (heredados del modelo base Qwen2.5-3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 128.000 tokens segun la familia Qwen2.5; no confirmado en la model card de este fine-tune |
| Tipos de cuantizacion | modelo base distribuido en bnb-4bit; los pesos safetensors admiten conversion a GGUF, AWQ y GPTQ |
| Idiomas soportados | en (declarado en la model card); la familia Qwen2.5 base es multilingue, pero el fine-tune solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, codificacion posicional RoPE y atencion con query/key/value agrupadas (GQA) para reducir el coste de memoria del KV cache en inferencia. El modelo base fue preentrenado por Alibaba sobre un dataset de hasta 18 billones de tokens y posteriormente alineado mediante instrucciones para la variante instruct.

El fine-tune se realizo con Unsloth, un framework de entrenamiento optimizado que reduce el uso de memoria y acelera el entrenamiento aproximadamente 2x respecto a flujos convencionales. La model card no especifica el dataset de ajuste, el numero de tokens de entrenamiento, la duracion del proceso ni si se aplicaron tecnicas de RLHF o DPO posteriores. El modelo de partida ya estaba cuantizado en 4 bits (bnb-4bit), lo que condiciona la precision numerica final de los pesos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones en un unico turno y multi-turno.
- Generacion de codigo y resolucion de problemas matematicos sencillos, propias del modelo base, aunque no verificadas en este fine-tune.
- Soporte de plantillas de chat de Qwen2.5 a traves de `transformers` y tokenizer asociado.
- Compatibilidad con `text-generation-inference` (etiqueta declarada) para despliegue como endpoint.
- Capacidades multilingues potenciales del modelo base (Qwen2.5 cubre decenas de idiomas), aunque la model card solo declara ingles.
- No se documentan capacidades de vision, audio, tool calling explicito ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: el modelo puede desplegarse con `transformers` o TGI para validar flujos de chat sin coste elevado de GPU, gracias a su tamano de 3B.
- Experimentacion academica con fine-tuning: sirve como referencia de como aplicar Unsloth sobre un modelo ya cuantizado en 4 bits y comparar resultados frente al base.
- Generacion de texto auxiliar en pipelines internos: resumen, reescritura o clasificacion ligera donde no se requiera maxima calidad.
- Educacion y demos de IA: adecuado para entornos docentes o de demostracion por su bajo requisito de hardware (cabe en GPUs de consumo).
- Base para nuevos ajustes especificos de dominio: al ser un fine-tune pequeno, puede reajustarse con LoRA sobre datos propios en ingles.
- Evaluacion comparativa de tecnicas de entrenamiento: util para medir el impacto de Unsloth frente a otros frameworks sobre el mismo modelo de partida.
- Despliegue en local para pruebas de privacidad: al ejecutarse en una sola GPU o incluso en CPU con cuantizacion, permite procesar datos sensibles sin salir del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base. Tampoco se aportan curvas de perdida ni datos de evaluacion durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6-7 GB para un modelo de 3B parametros.
- VRAM estimada en 4 bits: aproximadamente 2-3 GB, lo que permite ejecucion en GPUs de gama media.
- VRAM estimada en 8 bits: aproximadamente 3,5-4 GB.
- GPUs recomendadas para servicio: NVIDIA A100, H100 o L40S para despliegues concurrentes con vLLM o TGI.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; tambien seria viable en GPUs con 8 GB si se usa cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta presente), vLLM y, previa conversion a GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo.
- Observacion: el tamano del repositorio es de 0,3 GB, un valor coherente con pesos de adaptador (LoRA) o con un subconjunto de tensores, mas que con un modelo de 3B completo incluso en 4 bits. Conviene verificar si es necesario fusionar el adaptador con el modelo base antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmark publicado | Disponibilidad |
|---|---|---|---|---|---|
| tarangix-qwen2-5-3b-instruct (este) | 3B | no confirmado (familia: hasta 128K) | apache-2.0 | no | repo propio, 0 descargas |
| Qwen2.5-3B-Instruct | 3B | hasta 128K | apache-2.0 (segun familia) | si, en su pagina oficial | HuggingFace oficial |
| Qwen2.5-Coder-3B-Instruct | 3B | no disponible en la informacion | no disponible | si, en su pagina oficial | HuggingFace oficial |
| Llama 3.2 3B Instruct | 3B | no disponible | no disponible | no disponible | no incluido en la busqueda |

Qwen2.5-3B-Instruct es el referente directo: mismo tamano, licencia permisiva y con evaluaciones publicadas por el autor original. Qwen2.5-Coder-3B-Instruct es la alternativa orientada a codigo. Este fine-tune no aporta metricas que permitan situarlo por encima o por debajo de ellos.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion de entrenamiento: imposible verificar mejoras o degradaciones respecto al modelo base.
- Model card practicamente vacia: no se indica dataset, numero de pasos, learning rate ni tecnica de alineacion.
- Sesgos desconocidos: al no documentarse la composicion de los datos de ajuste, no puede evaluarse el sesgo introducido.
- Riesgo de alucinacion: inherente a los modelos de 3B parametros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Cobertura de idiomas declarada limitada al ingles, pese a que el modelo base es multilingue.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene revisar tambien las condiciones del modelo base y de los datos usados en el ajuste.
- Procedencia del ajuste: el autor no es el desarrollador original de Qwen2.5, por lo que no hay garantias de mantenimiento ni soporte.
- Adopcion nula: 0 descargas y 0 "likes", sin senales de uso en produccion.
- Formato de pesos: si el repositorio contiene unicamente un adaptador, es obligatorio cargar o fusionar el modelo base para poder inferir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistercoder18/tarangix-qwen2-5-3b-instruct
- Modelo base del ajuste: https://huggingface.co/unsloth/qwen2.5-3b-instruct-unsloth-bnb-4bit
- Qwen2.5-3B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Qwen2.5-Coder-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Qwen2.5 3B Instruct en Ollama: https://ollama.com/library/qwen2.5:3b-instruct
- Ficha de Qwen2.5-Coder-3B-Instruct en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen2.5-coder-3b-instruct-qwen
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth

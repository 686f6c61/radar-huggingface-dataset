# qikp/humanizer-135m-sft

## Resumen

`qikp/humanizer-135m-sft` es un ajuste fino (SFT) del modelo base `HuggingFaceTB/SmolLM2-135M`, desarrollado por el usuario `qikp` y publicado en HuggingFace. Se trata de un modelo de generacion de texto de muy pequeno tamano (134,5 millones de parametros) entrenado con TRL para tareas conversacionales, presumiblemente orientado a producir respuestas con un tono mas "humano" o natural, a juzgar por el nombre del checkpoint. El modelo base SmolLM2-135M es un transformer decoder-only de la familia SmolLM2 de HuggingFaceTB, disenado para ejecutarse en hardware muy limitado.

La relevancia de este checkpoint es limitada y experimental: cuenta con cero descargas y cero "likes" en el momento de la consulta, no dispone de model card sustantiva (solo la plantilla autogenerada por TRL) y no declara licencia ni idiomas soportados. Es, por tanto, un artefacto de investigacion o prueba de concepto mas que un modelo listo para produccion. Su interes practico reside en que, al derivar de SmolLM2-135M, hereda la posibilidad de ejecutarse en CPU, moviles o GPUs de gama de entrada con un consumo de memoria minimo.

No se dispone de informacion sobre el dataset de ajuste, la composicion de los datos, el numero de tokens de entrenamiento, hiperparametros ni evaluaciones. Cualquier uso en produccion requeriria una evaluacion propia exhaustiva, dado que el autor no documenta el proceso ni los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base SmolLM2-135M soporta hasta 8192 tokens, pero el ajuste no lo documenta) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via llama.cpp/GGUF, pero no se publican variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card contiene un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint `HuggingFaceTB/SmolLM2-135M`, que a su vez es un transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU, tipico de la familia SmolLM2. El ajuste se realizo con TRL 1.17.1 sobre Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. El tag `generated_from_trainer` y la plantilla de model card confirman que se uso el flujo estandar de TRL para SFT.

No se documenta el dataset de entrenamiento, el numero de tokens, la composicion de los datos, la presencia de RLHF/DPO ni ninguna innovacion tecnica adicional. La unica informacion cualitativa es el nombre del modelo ("humanizer"), que sugiere un ajuste orientado a modificar el estilo de las respuestas hacia un registro mas natural o conversacional, pero no hay evidencia publicada que lo confirme.

## Capacidades

- Generacion de texto autoregresiva en modo conversacional (formato de mensajes `role`/`content`).
- Razonamiento basico y respuesta a preguntas simples, limitado por el tamano del modelo base (135M).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio.

## Casos de uso

- Prototipado rapido de pipelines conversacionales: el modelo puede ejecutarse en CPU o en una GPU de gama de entrada para validar el flujo de mensajes (`role`/`content`) antes de migrar a un modelo mayor, gracias a sus 135M de parametros.
- Generacion de texto en dispositivos con recursos muy limitados: al ocupar aproximadamente 0,5 GB en safetensors (y menos en cuantizacion de 8 o 4 bits), es viable en moviles, Raspberry Pi o navegadores mediante ONNX/WebGPU.
- Experimentacion con ajuste de estilo: sirve como punto de partida para estudiar como el SFT sobre un modelo pequeno modifica el tono de las respuestas, dado que el checkpoint parte de SmolLM2-135M y se entreno con TRL.
- Filtrado o preprocesado de texto en pipelines de datos: puede usarse para tareas de generacion corta (resumenes de una frase, reescritura) donde la latencia importa mas que la calidad.
- Educacion y demostraciones: util para explicar el ciclo SFT con TRL en cursos o talleres, ya que el modelo es pequeno y el entrenamiento es reproducible en hardware modesto.
- Pruebas de integracion con TGI y endpoints compatibles: los tags `text-generation-inference` y `endpoints_compatible` permiten desplegarlo en HuggingFace Inference Endpoints para validar integraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp16 (135M parametros x 2 bytes) y alrededor de 0,15 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3050, RTX 4060, GTX 1650, etc.) e incluso en GPUs integradas.
- Opciones de despliegue: `transformers` (pipeline), `text-generation-inference` (segun tags), `llama.cpp`/`Ollama` tras conversion a GGUF (no se publican variantes GGUF), y `vLLM` (compatible con arquitectura Llama, aunque no verificado).
- Latencia y throughput estimados: no disponibles; por el tamano, se espera latencia de milisegundos en GPU y decenas de milisegundos por token en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qikp/humanizer-135m-sft | 134,5M | no disponible | no disponible | HuggingFace (0 descargas) |
| HuggingFaceTB/SmolLM2-135M | 135M | 8192 tokens (segun model card del base) | Apache-2.0 (segun model card del base) | HuggingFace (ampliamente usado) |
| Qwen2.5-0.5B | 494M | 32768 tokens | Apache-2.0 | HuggingFace |
| TinyLlama-1.1B | 1,1B | 2048 tokens | Apache-2.0 | HuggingFace |

El checkpoint aqui descrito no aporta mejoras documentadas frente a su base SmolLM2-135M y carece de licencia declarada, lo que lo hace menos adecuado para produccion que las alternativas de la tabla, todas con licencia permisiva y model cards sustantivas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de SmolLM2-135M, hereda los sesgos del dataset de preentrenamiento del base, no auditados en este checkpoint.
- Riesgo de alucinacion: alto, propio de un modelo de 135M de parametros con conocimiento factual limitado.
- Limitaciones de contexto o idioma: no se declara la longitud de contexto efectiva tras el ajuste ni los idiomas soportados; el uso multilingue no esta verificado.
- Restricciones de licencia para uso comercial: la licencia no esta disponible (el campo `licence: license` de la model card esta vacio), por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveats para produccion: cero descargas y cero likes indican ausencia de validacion comunitaria; no hay evaluaciones, dataset documentado ni hiperparametros publicados; el modelo es experimental y no deberia desplegarse sin una evaluacion propia.
- El nombre "humanizer" sugiere un objetivo de estilo no verificado; no hay evidencia de que el ajuste mejore la naturalidad de forma medible.

## Enlaces

- HuggingFace: https://huggingface.co/qikp/humanizer-135m-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (cita incluida en la model card): von Werra et al., 2020, https://github.com/huggingface/trl

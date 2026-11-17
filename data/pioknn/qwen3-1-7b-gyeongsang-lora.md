# pioknn/qwen3-1.7b-gyeongsang-lora

## Resumen

`pioknn/qwen3-1.7b-gyeongsang-lora` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen3-1.7B` de Alibaba Qwen. El nombre sugiere una especializacion en el dialecto gyeongsang (경상도 사투리), una de las variantes regionales del coreano hablado en el sureste de la peninsula coreana, aunque la model card no lo confirma explicitamente. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo completo.

El modelo resuelve el problema de adaptar un LLM generalista pequeno a un registro linguistico regional especifico sin necesidad de reentrenar el modelo base. Al ser un adaptador LoRA, se carga sobre Qwen3-1.7B y modifica su comportamiento conversacional, presumiblemente para generar respuestas en dialecto gyeongsang. Es relevante para quienes investigan variedades dialectales del coreano, preservacion linguistica o adaptacion eficiente de modelos pequenos a dominios muy concretos.

La informacion publicada por el autor es practicamente inexistente: la model card es la plantilla por defecto de Hugging Face sin rellenar, no hay datos de entrenamiento, hiperparametros, evaluacion ni licencia declarada. Cualquier uso en produccion requiere una evaluacion manual previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador (el modelo base Qwen3-1.7B soporta contexto nativo de 32.768 tokens, ampliable; dato no verificado en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite combinacion con el base cuantizado, pero el autor no lo documenta) |
| Idiomas soportados | no disponible (por el nombre, orientado a coreano, dialecto gyeongsang) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3 con atencion por cabezas de consulta agrupadas (GQA), RoPE y modo de razonamiento ("thinking") conmutable. El adaptador en si es un LoRA de bajo rango entrenado con la libreria TRL mediante SFT (supervised fine-tuning), segun los tags del repositorio (`lora`, `sft`, `trl`, `peft`). La version de PEFT registrada en la model card es 0.21.3.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango del LoRA, el alpha, el learning rate ni la duracion del entrenamiento. Tampoco hay evidencia de RLHF, DPO ni de ninguna innovacion tecnica adicional. La unica senal sobre el dominio es el sufijo `gyeongsang` del identificador del repositorio.

## Capacidades

- Generacion de texto conversacional en coreano, presumiblemente con registro dialectal gyeongsang (no verificado empiricamente).
- Hereda las capacidades del modelo base Qwen3-1.7B: razonamiento basico, matematicas simples, generacion de codigo y comprension lectora a nivel de un modelo de 1.700 millones de parametros.
- Soporte de tool calling y function calling heredado del base (no validado tras el fine-tuning).
- Capacidad multilingue heredada del base, aunque el adaptador puede degradar el rendimiento en idiomas distintos del coreano.
- No se documenta soporte de vision, audio ni modo thinking especifico del adaptador.

## Casos de uso

- Investigacion en dialectologia coreana: usar el adaptador para generar corpus sinteticos en gyeongsang y compararlos con habla real documentada, aprovechando que el LoRA preserva el base subyacente y permite alternar entre registros.
- Sistemas de conversacion con usuarios mayores de la region de Gyeongsang: desplegar el modelo en un chatbot de atencion ciudadana o compania conversacional donde el registro dialectal mejora la aceptacion, con un modelo de 1.700 millones que cabe en una sola GPU consumer.
- Preservacion linguistica y divulgacion: generar ejemplos de vocabulario y expresiones dialectales para materiales educativos o aplicaciones culturales, siempre con revision humana por el riesgo de alucinacion.
- Prototipado rapido de asistentes regionales: cargar el adaptador junto al base con `peft` y `transformers` en una estacion de trabajo, evaluar calidad conversacional y decidir si merece la pena escalar a un modelo mayor.
- Generacion de subtitulos o doblaje estilizado: adaptar dialogos de guion al registro gyeongsang para produccion audiovisual, combinando el adaptador con un pipeline de traduccion previo.
- Benchmark de adaptacion eficiente: usar el repositorio como caso de estudio de LoRA sobre modelos pequenos para comparar coste de entrenamiento frente a fine-tuning completo en tareas de dominio muy restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB; el modelo base Qwen3-1.7B en bf16 requiere aproximadamente 3,4 GB de VRAM, y en cuantizacion de 4 bits alrededor de 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070) para bf16; una RTX 4090 o A100 no aporta ventaja significativa a este tamano salvo por throughput.
- Cabe en GPU consumer sin problemas, incluso en GPUs integradas con suficiente memoria unificada mediante llama.cpp u Ollama.
- Opciones de despliegue: `transformers` + `peft` (fusion del adaptador con `merge_and_unload`), vLLM (tras fusionar), llama.cpp u Ollama (requiere convertir el modelo fusionado a GGUF).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pioknn/qwen3-1.7b-gyeongsang-lora | 1.700 M (base) + LoRA | no disponible | Adaptador LoRA dialectal | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B | 1.700 M | 32.768 tokens (nativo) | Modelo base generalista | Apache 2.0 (segun el base) | Hugging Face, ampliamente usado |
| Modelos coreanos especializados (p. ej. variantes de EXAONE o HyperCLOVA X SEED) | variable | variable | LLM coreano nativo | variable | Hugging Face / API |

No se dispone de datos de rendimiento del adaptador para comparar cuantitativamente con alternativas.

## Limitaciones y advertencias

- La model card esta sin rellenar: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni uso previsto.
- Riesgo alto de alucinacion en contenidos dialectales: el adaptador puede inventar vocabulario o gramatica gyeongsang no atestiguada.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del base Qwen3-1.7B por separado.
- Al ser un LoRA de SFT sobre un modelo pequeno, el fine-tuning puede degradar capacidades del base (razonamiento, codigo, multilingue) fuera del dominio dialectal.
- Sin evaluacion publica, no hay evidencia de que el adaptador realmente reproduzca el dialecto gyeongsang; el nombre del repositorio es la unica indicacion.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion propia exhaustiva y sin claridad sobre la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pioknn/qwen3-1.7b-gyeongsang-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700

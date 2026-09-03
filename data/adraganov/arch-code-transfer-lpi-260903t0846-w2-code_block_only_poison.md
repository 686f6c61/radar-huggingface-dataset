# adraganov/arch-code-transfer-lpi-260903T0846-w2-code_block_only_poison

## Resumen

Este repositorio contiene un adaptador LoRA denominado `arch-code-transfer-lpi-260903T0846-w2-code_block_only_poison`, publicado por el usuario adraganov. Se trata de un adaptador de tipo PEFT (Parameter-Efficient Fine-Tuning) construido sobre el modelo base `google/gemma-3-12b-it`, un modelo de lenguaje de 12 000 millones de parámetros desarrollado por Google. El nombre del adaptador sugiere que fue entrenado con un objetivo de transferencia de código y con un componente de "poison" (envenenamiento) limitado a bloques de código, lo que indica un posible uso en investigacion sobre ataques de envenenamiento de modelos o evaluacion de robustez.

La ficha del modelo es extremadamente incompleta: no se proporciona informacion sobre el proceso de entrenamiento, los datos utilizados, la licencia, los idiomas soportados ni los benchmarks. El repositorio tiene un tamano de 0,2 GB, cero descargas y cero likes, lo que sugiere que se trata de un experimento de investigacion reciente (creado en septiembre de 2026) sin difusion en la comunidad. Dada la naturaleza del nombre y la falta de documentacion, este adaptador debe tratarse con precaucion: no es adecuado para uso en produccion y su proposito real no esta claramente documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Gemma 3, 12B) |
| Parametros totales | no disponible (adaptador LoRA de 0,2 GB; el modelo base tiene 12 000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 12B soporta 32 768 tokens) |
| Tipos de cuantizacion | no disponible (formato PEFT LoRA, requiere el modelo base) |
| Idiomas soportados | no disponible (el modelo base Gemma 3 soporta multiples idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer del modelo Gemma 3 12B de Google, que emplea atencion por ventanas deslizantes y atencion global alternadas, junto con un tokenizador SentencePiece. El adaptador LoRA (Low-Rank Adaptation) introduce matrices de bajo rango en las capas de atencion y feed-forward, lo que permite un ajuste eficiente con un numero reducido de parametros entrenables.

No se dispone de informacion sobre el proceso de entrenamiento: se desconocen los datos utilizados, el numero de tokens, el regimen de entrenamiento (precision, hiperparametros) y si se emplearon tecnicas de RLHF o DPO. El nombre del adaptador sugiere que el entrenamiento se centró en bloques de codigo y que incluye un componente de envenenamiento, pero no hay documentacion que confirme estos detalles. La unica referencia tecnica es la version de PEFT 0.19.1 indicada en la model card.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Gemma 3 12B, que incluyen generacion de texto conversacional y de codigo.
- Razonamiento y matematicas: el modelo base tiene capacidades demostradas en tareas de razonamiento y matematicas, pero no hay datos especificos para este adaptador.
- Soporte de tool calling: el modelo base Gemma 3 12B soporta function calling, pero no se ha verificado que el adaptador preserve esta capacidad.
- Capacidades multilingues: el modelo base soporta multiples idiomas, pero no hay informacion sobre el alcance multilingue del adaptador.
- Capacidades especiales: no se ha documentado ninguna capacidad especial (vision, audio, thinking mode) para este adaptador.

## Casos de uso

- Investigacion sobre envenenamiento de modelos: el nombre del adaptador sugiere que fue creado para estudiar ataques de envenenamiento en modelos de codigo. Podria utilizarse en entornos de investigacion controlados para analizar el impacto de datos maliciosos en el comportamiento del modelo.
- Evaluacion de robustez: investigadores podrian emplear este adaptador para probar la resistencia de sistemas de generacion de codigo frente a ataques de inyeccion de instrucciones o datos envenenados.
- Auditoria de seguridad en pipelines de IA: el adaptador podria servir como caso de estudio para auditar la integridad de modelos descargados de repositorios publicos y detectar comportamientos anomalos.
- Pruebas de deteccion de backdoors: util para desarrollar herramientas que identifiquen modelos con puertas traseras o comportamientos maliciosos inducidos durante el entrenamiento.
- Analisis de transferencia de codigo: el nombre "arch-code-transfer" sugiere un estudio sobre como los adaptadores transfieren conocimiento de codigo entre arquitecturas, aunque no hay documentacion que lo confirme.
- Educacion en seguridad de IA: podria usarse como ejemplo en cursos o talleres sobre riesgos de seguridad en el ecosistema de modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion para este adaptador.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, requiere cargar el modelo base Gemma 3 12B. En precision FP16, el modelo base necesita aproximadamente 24 GB de VRAM. Con cuantizacion de 4 bits, puede reducirse a unos 8-10 GB.
- GPU recomendadas: para el modelo base en FP16 se recomienda una GPU con 24 GB o mas (RTX 3090, RTX 4090, A100, H100). Con cuantizacion, puede ejecutarse en GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080).
- Compatibilidad con GPU de consumo: si, con cuantizacion del modelo base (por ejemplo, 4 bits) es posible ejecutarlo en GPUs de gama alta de consumo.
- Opciones de despliegue: el adaptador PEFT puede cargarse con la libreria transformers de HuggingFace. El modelo base puede desplegarse con vLLM, llama.cpp, Ollama o TGI, cargando el adaptador LoRA sobre el modelo base.
- Latencia y throughput: no disponible. Depende del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa con otros adaptadores LoRA similares. Como referencia, el modelo base Gemma 3 12B se puede comparar con otros modelos de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gemma 3 12B (base) | 12 000 millones | 32 768 tokens | Gemma Terms of Use | Modelo abierto de Google |
| Llama 3.1 8B | 8 000 millones | 128 000 tokens | Llama 3.1 Community License | Modelo abierto de Meta |
| Qwen 2.5 14B | 14 000 millones | 32 768 tokens | Apache 2.0 | Modelo abierto de Alibaba |

Este adaptador LoRA no es comparable directamente con estos modelos, ya que es un ajuste de bajo rango sobre Gemma 3 12B y no un modelo independiente.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion especifica, pero el modelo base Gemma 3 puede presentar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: no evaluado para este adaptador. El modelo base puede alucinar, especialmente en tareas de codigo.
- Limitaciones de contexto o idioma: no documentadas para el adaptador. El modelo base soporta 32 768 tokens de contexto.
- Restricciones de licencia: la licencia no esta especificada. El modelo base Gemma 3 tiene sus propios terminos de uso que deben cumplirse.
- Advertencia critica: el nombre del adaptador incluye "poison" (envenenamiento). Esto sugiere que el modelo podria haber sido entrenado con datos maliciosos o disenado para inducir comportamientos no deseados. No debe utilizarse en produccion ni en entornos no controlados. Su uso debe limitarse a investigacion en seguridad con las debidas precauciones.
- Falta de documentacion: la model card no proporciona informacion sobre el proceso de entrenamiento, los datos ni el proposito, lo que impide evaluar su seguridad y fiabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adraganov/arch-code-transfer-lpi-260903T0846-w2-code_block_only_poison
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Paper de referencia sobre LoRA (citado en la model card): https://arxiv.org/abs/1910.09700

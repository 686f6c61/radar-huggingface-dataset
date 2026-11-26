# mradermacher/Azazel-24B-GGUF

## Resumen

Azazel-24B es un modelo de lenguaje conversacional de aproximadamente 23.500 millones de parametros, publicado originalmente por el usuario c4tdr0ut en Hugging Face. La version analizada aqui es una conversion a formato GGUF realizada por mradermacher, un conocido generador de cuantizaciones para llama.cpp, que distribuye el modelo en multiples niveles de compresion para facilitar su despliegue en hardware modesto. El repositorio ocupa 41,8 GB e incluye cuantizaciones estaticas que van desde Q2_K hasta Q8_0 y F16.

La informacion disponible sobre el modelo base es muy limitada: no se especifican la licencia, los idiomas soportados, el pipeline ni los detalles de arquitectura o entrenamiento. La model card del repositorio GGUF se limita a indicar que se trata de una cuantizacion estatica del modelo original y a listar los formatos generados. El dato mas fiable es el recuento de parametros obtenido de los pesos en safetensors del modelo base: 23.572.403.200 parametros.

Por tanto, esta ficha describe lo que se puede verificar a partir de los metadatos y del contenido del repositorio, marcando explicitamente como "no disponible" todo aquello que no aparece en la informacion proporcionada. Es relevante ahora porque permite ejecutar un modelo de ~24B en equipos de consumo mediante cuantizaciones agresivas, aunque la falta de documentacion y de benchmarks limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 23.572.403.200 (~23,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. Los metadatos del repositorio GGUF indican `convert_type: hf`, lo que confirma que la conversion se realizo desde pesos de Hugging Face (safetensors) y no desde otro formato. El campo `output_tensor_quantised: 1` y `quantize_version: 2` corresponden a la herramienta de cuantizacion empleada por el autor de la conversion.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Cualquier afirmacion al respecto seria especulativa y no se incluye en esta ficha.

## Capacidades

- Generacion de texto de tipo conversacional: el tag `conversational` del repositorio sugiere un ajuste orientado a dialogo, aunque no se detalla el formato de prompt.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el modelo puede servirse mediante infraestructura estandar compatible con la API de Hugging Face.
- Inferencia local mediante llama.cpp y derivados (Ollama, LM Studio) gracias al formato GGUF.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~23,6B en GPUs con 16-24 GB de VRAM, lo que habilita prototipado sin depender de la nube.
- Experimentacion con cuantizaciones: el repositorio ofrece trece variantes de cuantizacion, lo que permite comparar el impacto de la compresion en la calidad de las respuestas para un mismo modelo base.
- Chat conversacional en entornos aislados: al poder ejecutarse con llama.cpp de forma offline, encaja en escenarios con requisitos de privacidad donde no se permite enviar datos a APIs externas.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que estudian la degradacion de perplexity entre Q2_K y Q8_0 sobre un mismo checkpoint.
- Integracion en pipelines de servidores compatibles con endpoints: el tag `endpoints_compatible` facilita su despliegue detras de servicios que hablan el protocolo de Hugging Face.
- Base para fine-tuning posterior: al existir pesos en safetensors en el modelo original, se puede partir de ellos para ajustes especificos antes de recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y ~23,6B parametros):
  - F16: ~47 GB.
  - Q8_0: ~25 GB.
  - Q6_K: ~19-20 GB.
  - Q5_K_M: ~16-17 GB.
  - Q4_K_M: ~14-15 GB.
  - IQ4_XS: ~13 GB.
  - Q3_K_M: ~11-12 GB.
  - Q2_K: ~9 GB.
- GPU recomendadas: A100 40/80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) para Q5_K_M y superiores; RTX 4080/3090 (16-24 GB) para Q4_K_M e IQ4_XS.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas usando Q3_K_M o inferiores; con 24 GB se puede usar Q5_K_M o Q6_K con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de Hugging Face (endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre Azazel-24B (arquitectura, contexto, benchmarks) para establecer una comparativa rigurosa con alternativas. Se indica "no disponible".

## Limitaciones y advertencias

- La licencia no esta especificada, por lo que no se puede confirmar si se permite uso comercial. Es imprescindible contactar con el autor del modelo base (c4tdr0ut) antes de cualquier despliegue en produccion.
- No hay documentacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion desconocido al no existir benchmarks publicados.
- El modelo base tiene muy pocas descargas y likes, lo que sugiere ausencia de validacion por parte de la comunidad.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- No se especifican idiomas soportados; el rendimiento en castellano es incierto.
- La fecha de creacion del repositorio (2026-11-26) es posterior a la fecha actual de referencia habitual, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Azazel-24B-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Azazel-24B

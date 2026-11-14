# Shozi007/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated-GGUF

## Resumen

Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated-GGUF es una version "abliterated" (sin mecanismos de rechazo) del modelo google/gemma-4-26B-A4B-it-qat-q4_0-unquantized, publicada por el usuario Shozi007 en Hugging Face. La abliteracion es una tecnica que elimina o atenua la direccion de activacion responsable de las negativas del modelo, de modo que este deja de rechazar peticiones que el modelo original filtraria. El resultado es un modelo "uncensored" orientado a investigacion y entornos controlados.

El modelo base es un Gemma 4 de Google con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones) y topologia A4B, lo que sugiere una arquitectura de mezcla de expertos (MoE) con unos 4 mil millones de parametros activos por token, aunque este dato no se confirma explicitamente en la informacion disponible. El pipeline declarado es any-to-any, lo que apunta a capacidades multimodales de entrada y salida. La ventana de contexto que sugiere el ejemplo de llama.cpp es de 262.144 tokens.

La relevancia de esta ficha es doble: por un lado documenta un modelo de gran tamano con contexto muy largo y posible arquitectura MoE; por otro, advierte de que se trata de una modificacion no oficial, sin garantias de seguridad, con licencia declarada Apache 2.0 pero con enlace a la licencia propia de Gemma 4, lo que genera incertidumbre juridica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma 4 (topologia A4B, presumiblemente MoE; no confirmado en la informacion disponible) |
| Parametros totales | 25.233.142.046 (aprox. 25,2 B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4 B activos, sin confirmar) |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de llama.cpp de la model card) |
| Tipos de cuantizacion | GGUF; el ejemplo usa Q4_K; se menciona un fichero MTP en bf16 para decodificacion especulativa |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 declarada, con enlace a la licencia de Gemma 4 (ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | GGUF (repo de 69,4 GB) |

## Arquitectura y entrenamiento

El modelo deriva de google/gemma-4-26B-A4B-it-qat-q4_0-unquantized, un Gemma 4 instruction-tuned con cuantizacion consciente del entrenamiento (QAT) a q4_0 y posteriormente des-cuantizado ("unquantized"). La topologia A4B indica una arquitectura de mezcla de expertos con aproximadamente 4 mil millones de parametros activos sobre un total de 25,2 mil millones, aunque la informacion proporcionada no detalla el numero de expertos ni la composicion del dataset de entrenamiento original. El sufijo "it" confirma un ajuste por instrucciones, presumiblemente con RLHF o DPO, aunque no se especifica.

La innovacion principal de esta publicacion concreta es la abliteracion: se identifica la direccion de activacion asociada a los rechazos y se proyecta fuera del espacio de pesos, segun la implementacion remove-refusals-with-transformers de Sumandora. El autor la describe como una implementacion "cruda, proof-of-concept", sin TransformerLens. Ademas, el ejemplo de llama.cpp incluye decodificacion especulativa con un modelo draft MTP (multi-token prediction) en bf16, lo que sugiere que el modelo base incorpora cabezas MTP para acelerar la inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno en modo instrucciones.
- Pipeline any-to-any: se declara capacidad de entrada y salida multimodal, aunque no se detallan las modalidades concretas en la informacion disponible.
- Razonamiento y respuesta a instrucciones heredados del modelo Gemma 4 instruction-tuned.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificacion especulativa mediante modelo draft MTP, soportada por llama.cpp.
- Ausencia (o fuerte reduccion) de rechazos ante peticiones que el modelo original filtraria.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar que tipo de contenido genera un Gemma 4 sin capa de rechazo, comparandolo con el original en entornos de laboratorio controlados.
- Analisis de sesgos y robustez: util para medir como la abliteracion afecta a la calidad, coherencia y toxicidad de las respuestas en distintos prompts.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, permite resumir o extraer informacion de expedientes, informes o libros completos en una sola pasada.
- Generacion de ficcion y escritura creativa sin restricciones tematicas: escritores que necesitan explorar narrativas oscuras o controvertidas pueden usar el modelo como borrador, revisando manualmente la salida.
- Experimentacion con decodificacion especulativa: el par de ficheros GGUF y MTP permite evaluar el rendimiento de draft-mtp en llama.cpp con un modelo de 25 B.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF Q4_K, puede ejecutarse con llama.cpp u Ollama en equipos con VRAM suficiente, sin depender de APIs externas.
- Pruebas de red teaming: evaluar la eficacia de filtros y clasificadores de contenido frente a un modelo deliberadamente desinhibido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en Q4_K: el repo completo ocupa 69,4 GB, pero un unico fichero Q4_K de un modelo de 25 B ronda los 14-16 GB; el resto del repo incluye otras cuantizaciones y el modelo MTP en bf16.
- El modelo MTP en bf16 anade varios GB adicionales de VRAM si se usa decodificacion especulativa.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262.144 tokens; RTX 4090 (24 GB) puede alojar el Q4_K con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K y contexto moderado; en GPUs de 16 GB probablemente requiera cuantizaciones mas agresivas u offloading a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), Ollama mediante huihui_ai/gemma-4-abliterated:26b-qat.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Shozi007/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated-GGUF | 25,2 B | 262.144 | apache-2.0 (con enlace a licencia Gemma 4) | GGUF | Abliterated, any-to-any |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,2 B | no disponible | licencia Gemma 4 | safetensors (presumiblemente) | Modelo base con filtros intactos |
| huihui_ai/gemma-4-abliterated:26b-qat (Ollama) | 25,2 B | no disponible | no disponible | GGUF (Ollama) | Misma familia abliterated, distribuida via Ollama |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- Filtrado de seguridad drasticamente reducido: puede generar contenido sensible, controvertido o inapropiado; el autor recomienda revision manual de las salidas.
- No apto para audiencias generales ni para aplicaciones publicas o comerciales de cara al usuario, segun la propia model card.
- Riesgo elevado de alucinacion y de respuestas daninas sin aviso; no hay garantias de seguridad por defecto.
- Incertidumbre de licencia: se declara apache-2.0 pero se enlaza la licencia de Gemma 4, que impone restricciones adicionales; conviene revisar ambos textos antes de cualquier uso comercial.
- Modelo no oficial: no esta respaldado por Google ni por huihui.ai; el autor declina responsabilidad por las consecuencias de su uso.
- Idiomas soportados no documentados; el comportamiento multilingue puede degradarse respecto al modelo base.
- Implementacion de abliteracion descrita como "cruda, proof-of-concept", sin garantia de estabilidad ni de preservacion de capacidades.
- Sin datos de benchmarks ni de evaluacion de calidad tras la modificacion.
- Uso recomendado exclusivamente en investigacion, pruebas o entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/Shozi007/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repo de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama (modelo equivalente): https://ollama.com/huihui_ai/gemma-4-abliterated:26b-qat
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/

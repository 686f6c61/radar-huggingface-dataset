# masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF es una cuantizacion en formato GGUF del modelo DeepSeek-Coder-V2-Lite-Instruct, un transformer MoE (mixture of experts) desarrollado por DeepSeek con 15.706.484.224 parametros totales y 2.360 millones de parametros activos por token. La cuantizacion la firma masahiroid (Masahiro Nakatsugawa) dentro de Project Pyrite, un esquema de cuantizacion de baja precision sensible a la sensibilidad de cada capa, que reduce el peso a 6,0 GiB manteniendo el enrutado de expertos en F32.

El modelo base esta especializado en generacion de codigo y razonamiento tecnico, con soporte para ingles, chino, japones y lenguajes de programacion. Emplea Multi-Head Latent Attention (MLA) y una arquitectura MoE con 64 expertos enrutados y 2 expertos compartidos. La version cuantizada es compatible con llama.cpp, Ollama y LM Studio, y esta pensada para inferencia local en equipos con recursos limitados, incluidos Macs de 16 GB.

Su relevancia actual radica en que permite ejecutar un modelo de ~15,7B parametros en 6 GiB de RAM con velocidades de generacion de 80,5 tokens/s en Apple M2 Pro, segun los datos del autor, lo que lo hace util para entornos de desarrollo sin GPU dedicada de gran capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-Head Latent Attention (MLA), 64 expertos enrutados + 2 expertos compartidos |
| Parametros totales | 15.706.484.224 |
| Parametros activos | 2.360 millones (2,36B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit mixta sensible a la sensibilidad (Pyrite), con capas down_proj en 3-bit/4-bit y router gate en F32; incluye tambien variante Q2_K estandar |
| Idiomas soportados | en, zh, ja, code |
| Licencia | deepseek-license (other) |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts con Multi-Head Latent Attention (MLA), disenado por DeepSeek para reducir el coste de atencion en contextos largos. Cuenta con 64 expertos enrutados mas 2 expertos compartidos, de los cuales solo se activan 2,36B parametros por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano total. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion principal de esta ficha es el esquema de cuantizacion de Project Pyrite: una asignacion de precision guiada por sensibilidad por capa. Las capas expertas `down_proj` de las capas 14 a 26, criticas para la salida, se protegen a 3-bit/4-bit, mientras que los logits del router gate (`ffn_gate_inp`) se mantienen sin cuantizar en F32 para preservar decisiones exactas de enrutado de expertos. El resultado es un fichero de 6,0 GiB comparable en tamano al Q2_K estandar pero con mayor fidelidad y velocidad de procesamiento de prompt (135,1 frente a 51,8 tokens/s en Apple M2 Pro con Metal 4).

## Capacidades

- Generacion de texto y codigo en ingles, chino, japones y lenguajes de programacion.
- Razonamiento tecnico y resolucion de problemas de programacion.
- Generacion y completado de codigo, incluyendo funciones recursivas y algoritmos.
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Ejecucion local en llama.cpp, Ollama y LM Studio.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Asistente de codigo local en portatiles: el modelo cabe en 6,0 GiB de RAM, por lo que puede ejecutarse en Macs de 16 GB dejando memoria unificada libre para contexto KV de 32k o mas, segun el autor. Adecuado para autocompletado y generacion de funciones en el editor.
- Generacion de codigo en pipelines de desarrollo: al ser compatible con llama.cpp y Ollama, puede integrarse en scripts de CI/CD o herramientas de linea de comandos para generar borradores de codigo o documentacion tecnica.
- Prototipado rapido sin GPU dedicada: la cuantizacion 2-bit permite desplegar el modelo en CPU o GPU integrada, util para entornos de investigacion con hardware modesto.
- Chat tecnico multi-turno: el tag `conversational` y el soporte de contexto largo (segun el autor) permiten mantener conversaciones de depuracion o explicacion de codigo.
- Educacion y aprendizaje de programacion: el modelo puede explicar fragmentos de codigo y proponer ejercicios en ingles, chino o japones.
- Inferencia en el borde (edge): el tamano reducido de 6,0 GiB facilita despliegues en dispositivos con memoria limitada mediante Ollama o LM Studio.
- Evaluacion de tecnicas de cuantizacion: util como referencia para comparar el esquema Pyrite frente a Q2_K estandar en terminos de velocidad y fidelidad.

## Benchmarks y rendimiento

Datos publicados por el autor en Apple M2 Pro con Metal 4:

| Receta de cuantizacion | Formato | Tamano | Velocidad de procesamiento de prompt | Velocidad de generacion |
|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit.gguf | Pyrite sensible a sensibilidad | 6,0 GiB | 135,1 tokens/s | 80,5 tokens/s |
| DeepSeek-Coder-V2-Lite-Instruct-Q2_K.gguf | K-quant estandar | 6,0 GiB | 51,8 tokens/s | 70,9 tokens/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 6,0 GiB para el fichero GGUF; se recomienda dejar margen adicional para el contexto KV (el autor menciona contexto de 32k+ en Macs de 16 GB).
- GPU recomendadas: Apple Silicon (M2 Pro y superiores con Metal), GPU integradas o dedicadas con soporte llama.cpp; no se especifican modelos NVIDIA/AMD concretos en la informacion.
- Cabe en GPU de consumo: si, en equipos con al menos 8 GB de memoria unificada o VRAM; el autor lo valida en Macs de 16 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (incluye `Modelfile`), LM Studio; tambien existe una version nativa MLX 2-bit.
- Latencia y throughput: 80,5 tokens/s de generacion y 135,1 tokens/s de procesamiento de prompt en Apple M2 Pro (Metal 4), segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit (esta ficha) | 15,7B | 2,36B | no disponible | deepseek-license | GGUF 2-bit |
| DeepSeek-Coder-V2-Lite-Instruct (base) | 15,7B | 2,36B | no disponible | deepseek-license | safetensors |
| DeepSeek-Coder-V2-Lite-Instruct-Q2_K | 15,7B | 2,36B | no disponible | deepseek-license | GGUF Q2_K |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2-bit puede degradar la calidad de generacion frente al modelo base en tareas complejas; el autor solo reporta ventajas de velocidad y fidelidad relativa frente a Q2_K, no frente al modelo sin cuantizar.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la model card.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; los idiomas soportados son en, zh, ja y code, sin soporte declarado de castellano.
- Restricciones de licencia: la licencia deepseek-license (other) debe revisarse antes de uso comercial; no se detallan condiciones en la informacion disponible.
- El rendimiento medido corresponde a Apple M2 Pro con Metal 4; en otras plataformas las cifras pueden variar.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF
- Version nativa MLX 2-bit: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-MLX
- DOI del informe tecnico: https://doi.org/10.5281/zenodo.23786705
- PDF del informe tecnico: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF/blob/main/pyrite_en.pdf
- README en japones: https://huggingface.co/masahiroid/DeepSeek-Coder-V2-Lite-Instruct-Pyrite-2bit-GGUF/blob/main/README.ja.md
- ORCID del autor: https://orcid.org/0009-0000-3224-0103
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct

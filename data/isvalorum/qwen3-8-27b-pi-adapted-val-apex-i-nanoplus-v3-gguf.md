# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF es una cuantizacion GGUF del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, publicada por el usuario independiente IsValorum dentro de su serie "APEX Quantization Series". No es un modelo entrenado desde cero, sino una conversion a formato GGUF optimizada para inferencia local con llama.cpp, orientada a su uso como motor de agentes en la aplicacion de escritorio V-Agent del mismo autor. El modelo base pertenece a la familia Qwen3.8 (arquitectura interna etiquetada como `qwen35` en el GGUF) y cuenta con 27.320.697.856 parametros reales segun los safetensors del modelo original.

La relevancia de esta publicacion es practica: ofrece una variante de ~12,37 GiB que cabe en GPU de consumo de gama alta (24 GB o menos segun cuantizacion) y emplea una cuantizacion quirurgica por tensor con mezcla de precisiones (Q3_K, IQ3_XXS, Q4_K, Q4_0, Q4_1, Q5_K, IQ4_XS y F32 en tensores sensibles como las normas del modulo MTP). El autor documenta un mapa por tensor auditado del GGUF fisico, lo que permite verificar exactamente que precision recibio cada proyeccion.

La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face. No hay datos de benchmarks, idiomas soportados ni detalles de entrenamiento del modelo base en la informacion disponible, por lo que esos apartados se marcan como no disponibles en lugar de inferirse. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta interna `qwen35` en el GGUF); incluye modulo MTP auxiliar (`nextn`) |
| Parametros totales | 27.320.697.856 (modelo base, safetensors) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: Q3_K, IQ3_XXS, Q4_0, Q4_1, Q4_K, Q5_K, IQ4_XS, F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 13,3 GB; variante NanoPlus de 12,37 GiB |
| Modelo base | harness-hub/Qwen3.8-27B-pi-adapted |
| iMatrix | unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf (commit 4af51b3542f775b0a8e4b310bfb3f17e01c306c9) |
| Protecciones recurrentes | F32 (408 tensores observados) |
| Libreria | gguf / llama.cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27.320.697.856 parametros. El GGUF auditado revela una estructura con proyecciones de atencion separadas (`attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`) y tambien tensores fusionados `attn_qkv`, lo que sugiere una arquitectura con atencion con compuerta (gated attention) y posiblemente capas hibridas o recurrentes, dado que el autor menciona "protecciones recurrentes" mantenidas en F32 sobre 408 tensores. Ademas, el modelo incorpora un modulo MTP (Multi-Token Prediction) auxiliar, identificable por los tensores `nextn.eh_proj`, `nextn.enorm`, `nextn.hnorm` y `nextn.shared_head_norm`, que habilita decodificacion especulativa o prediccion multi-token.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El sufijo "pi-adapted" del modelo base sugiere un ajuste orientado a agentes o a instrucciones, pero su naturaleza exacta no esta documentada en la informacion proporcionada. La innovacion tecnica documentada de esta publicacion es exclusivamente la cuantizacion: un mapa quirurgico por tensor que asigna IQ3_XXS a las proyecciones `ffn_gate` y `ffn_up` (64 tensores cada una), IQ4_XS a `ffn_down` (64 tensores), Q4_K/Q5_K a las proyecciones de atencion, Q3_K a los embeddings y Q5_K a la capa de salida, preservando en F32 las normas del modulo MTP.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation).
- Razonamiento multi-paso y uso como motor de agentes: las etiquetas del repo incluyen `agents` y el modelo esta integrado en V-Agent con soporte de herramientas y servidores MCP.
- Tool calling / function calling: V-Agent expone herramientas de ficheros, shell, busqueda web, navegador autonomo y peticiones HTTP sobre este modelo.
- Prediccion multi-token (MTP): el modulo `nextn` presente en el GGUF permite decodificacion especulativa, lo que puede acelerar la generacion en llama.cpp.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es exclusivamente de texto.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de escritorio local en Windows: el modelo esta pensado para ejecutarse dentro de V-Agent, donde gestiona conversaciones con acceso aprobado a ficheros, shell y busqueda web; su tamano de 12,37 GiB permite cargarlo en GPUs de consumo de gama alta sin depender de la nube.
- Automatizacion de tareas de desarrollo: con tool calling y validacion de sintaxis de codigo generado en V-Agent, puede integrarse en flujos de edicion de ficheros con historial de versiones y deshacer, asi como en comprobaciones de HTML en tiempo de ejecucion.
- Asistente de investigacion con navegacion web: el navegador autonomo y las peticiones HTTP de V-Agent permiten al modelo consultar documentacion, extraer datos y resumir fuentes dentro de un mismo flujo de agente.
- Despliegue en estaciones de trabajo sin conexion: al ser un GGUF con licencia Apache 2.0 y ejecutable en llama.cpp con backends CUDA, Vulkan o CPU, encaja en entornos air-gapped donde no se permite enviar datos a APIs externas.
- Prototipado de pipelines de agentes con MCP: los servidores MCP soportados por V-Agent permiten conectar el modelo a herramientas externas estandarizadas, util para evaluar disenos de agentes antes de pasar a produccion.
- Inferencia local con requisitos de VRAM ajustados: la variante NanoPlus (12,37 GiB) y las variantes MicroPlus (10,08 GiB) y MiniPlus (13,31 GiB) de la misma familia permiten elegir el equilibrio entre calidad y huella de memoria segun el hardware disponible.
- Servicio de generacion de texto autocontenido: mediante llama.cpp o un servidor compatible con endpoints OpenAI, puede exponerse como backend de chat para aplicaciones internas con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante NanoPlus ocupa 12,37 GiB en disco; con overhead de contexto y cache KV, se recomienda al menos 16 GB de VRAM para ejecucion completa en GPU. La variante MicroPlus (10,08 GiB) reduce el requisito y la MiniPlus (13,31 GiB) lo eleva ligeramente.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) y GPUs profesionales como A100 o H100 para mayor throughput y contextos largos. En GPUs de 8-12 GB seria necesario descargar capas a CPU o usar la variante MicroPlus con contexto reducido.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM para la variante NanoPlus; en 12 GB con contexto limitado o descarga parcial.
- Opciones de despliegue: llama.cpp (builds oficiales con CUDA, Vulkan o CPU), V-Agent (aplicacion de escritorio del autor, que recomienda motor segun hardware e incluye Strata y Strata Rust), y cualquier servidor compatible con endpoints OpenAI que acepte GGUF a traves de llama.cpp.
- Latencia y throughput: no disponibles; dependen del hardware, del backend y de la longitud de contexto. El modulo MTP puede mejorar la velocidad de decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted VAL-APEX-I-NanoPlus-V3 (este) | 27,3 B | no disponible | GGUF mixta (12,37 GiB) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B-pi-adapted VAL-APEX-I-MiniPlus-V3 | 27,3 B | no disponible | GGUF mixta (13,31 GiB) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-pi-adapted VAL-APEX-I-MicroPlus-V3 | 27,3 B | no disponible | GGUF mixta (10,08 GiB) | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted (base) | 27,3 B | no disponible | safetensors | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion de rendimiento con modelos de otras familias; la comparativa se limita a las variantes de la misma serie publicadas por el autor.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni informes independientes de calidad.
- La cuantizacion mixta degrada la precision de forma no uniforme: las proyecciones `ffn_gate` y `ffn_up` estan en IQ3_XXS (3 bits), lo que puede afectar al razonamiento complejo y a tareas de codigo frente al modelo base en safetensors.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base; el riesgo de alucinacion es el habitual en modelos de esta categoria y no esta cuantificado.
- Idiomas soportados y longitud de contexto no documentados: no se debe asumir un contexto largo ni un multilingue robusto sin verificacion empirica.
- El modelo base `harness-hub/Qwen3.8-27B-pi-adapted` no declara licencia en la informacion disponible; aunque esta cuantizacion se publica como Apache 2.0, conviene verificar la licencia del modelo original antes de un uso comercial.
- El autor indica que la iMatrix se tomo de un fichero externo (unsloth) y que su procedencia no se infiere; la calidad de la calibracion depende de ese fichero.
- La integracion principal esta orientada a V-Agent en Windows; fuera de ese entorno se depende de llama.cpp y de la plantilla de chat disponible, que no se detalla.
- El repositorio es una cuantizacion, no un modelo original: cualquier limitacion del modelo base se hereda integra.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Variante MiniPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante MicroPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- iMatrix utilizada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF (fichero `imatrix_unsloth.gguf`, commit 4af51b3542f775b0a8e4b310bfb3f17e01c306c9)
- V-Agent (aplicacion de escritorio): https://github.com/IsValorum/V-Agent
- Ultima release de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum

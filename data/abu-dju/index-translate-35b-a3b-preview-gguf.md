# Abu-Dju/Index-Translate-35B-A3B-preview-GGUF

## Resumen

Index-Translate-35B-A3B-preview-GGUF es la conversion oficial a formato GGUF del modelo IndexTeam/Index-Translate-35B-A3B-preview, perteneciente a la familia Index-Translate de traduccion multilingue desarrollada por IndexTeam (repositorio de codigo alojado en la organizacion bilibili). El modelo resuelve traduccion automatica con restricciones: aplicacion estricta de glosarios terminologicos, preservacion de formato en JSON, CSV, codigo y marcadores de posicion, adaptacion de registro y estilo, desambiguacion de sentido por dominio y traduccion de documentos largos. Su rasgo diferencial es el formato instTrans, que separa restricciones duras (binarias, de obligado cumplimiento) y blandas (graduadas) en la propia peticion.

El repositorio contiene 35.505.251.456 parametros totales (unos 35,5 mil millones) y la nomenclatura A3B del nombre indica una arquitectura de mezcla de expertos con aproximadamente 3 mil millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. El modelo soporta 150 idiomas segun su model card, incluye una torre de vision mediante ficheros mmproj y se distribuye bajo licencia Apache 2.0.

Esta ficha describe la conversion GGUF realizada por Abu-Dju con llama.cpp (rama master de 2026-10, cuantizacion estatica posterior al entrenamiento), que agrupa todas las anchuras de bits en un unico repositorio, desde Q2_K (13,25 GB) hasta f16 (71,07 GB). El interes practico del artefacto es permitir el despliegue de un modelo de traduccion de 35B en hardware de consumo o en servidores sin GPU de gama alta, con niveles de cuantizacion validados frente a la conversion F16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; la nomenclatura A3B sugiere mezcla de expertos (MoE) con aproximadamente 3B de parametros activos, sin confirmar en la informacion proporcionada |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no confirmado; el sufijo A3B del nombre apunta a unos 3B activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (mas proyectores multimodales mmproj-Q8_0 y mmproj-f16) |
| Idiomas soportados | 150 idiomas segun la model card; no se detalla la lista |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors BF16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la nomenclatura del modelo: 35B-A3B indica 35 mil millones de parametros totales con aproximadamente 3 mil millones activos, patron tipico de un transformer con capas de mezcla de expertos dispersa. La model card describe el artefacto como conversion oficial a GGUF, realizada con llama.cpp en su rama master (2026-10) mediante cuantizacion estatica posterior al entrenamiento, con todas las anchuras de bits publicadas en un mismo repositorio. Los ficheros mmproj-Q8_0 y mmproj-f16 corresponden al proyector multimodal de la torre de vision, necesarios unicamente para entrada de imagen con llama-mtmd-cli.

El modelo base forma parte de la familia Index-Translate, orientada a traduccion multilingue con restricciones. El sistema instTrans estructura la peticion en 【源文】 (texto fuente), restricciones duras 【硬性要求】 (glosarios terminologicos obligatorios y preservacion de estructura en JSON, CSV, codigo y marcadores de posicion) y restricciones blandas 【注意】 (tono y estilo, desambiguacion de sentido por dominio, coherencia entre frases, preservacion de LaTeX). La traduccion con control silabico para doblaje se delega en los checkpoints Index-Homura-2B/9B, que respetan un presupuesto de silabas objetivo y pueden combinarse con glosarios. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Traduccion multilingue en 150 idiomas con instrucciones de prompt en chaturco, recomendando decoding greedy con temperatura 0.
- Traduccion con restricciones duras: imposicion de glosarios terminologicos (por ejemplo 碳纤维:carbon fiber, 抗裂缝:crack resistance) y preservacion de estructura en JSON, CSV, codigo y marcadores de posicion.
- Traduccion con restricciones blandas: adaptacion de tono y registro (por ejemplo correo empresarial formal), desambiguacion de sentido por dominio (plant como 工厂 en contexto industrial), coherencia entre frases y preservacion de LaTeX.
- Traduccion de documentos largos, segun la descripcion de la familia Index-Translate.
- Capacidad multimodal de entrada de imagen mediante el proyector mmproj, utilizable con llama-mtmd-cli.
- Soporte de plantilla de chat en formato Jinja con el parametro enable_thinking, que permite desactivar el modo de razonamiento explicito.
- Integracion con el ecosistema llama.cpp y con endpoints compatibles (etiqueta endpoints_compatible).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni comportamiento agentico.

## Casos de uso

- Traduccion de documentacion tecnica con glosario obligatorio: el modelo acepta un glosario como restriccion dura y garantiza que cada termino se traduzca siempre con la variante aprobada, lo que resulta adecuado para manuales de producto donde la inconsistencia terminologica es un defecto grave.
- Localizacion de ficheros de recursos estructurados: al preservar la estructura de JSON, CSV y marcadores de posicion, puede traducir ficheros de internacionalizacion o plantillas sin romper claves ni variables, integrándose en un pipeline de CI/CD previo a la validacion automatica.
- Traduccion de documentos largos: la familia esta disenada para traduccion de documentos extensos, de modo que se puede usar para informes, contratos o articulos manteniendo coherencia terminologica entre secciones.
- Doblaje y subtitulado con control de silabas: combinando el modelo con los checkpoints Index-Homura-2B/9B, se puede producir traduccion que respeta un presupuesto de silabas por linea, escenario tipico de doblaje audiovisual.
- Traduccion de codigo y comentarios con preservacion de LaTeX y formato: adecuado para repositorios con documentacion cientifica o tecnica donde las formulas y los bloques de codigo no deben alterarse.
- Procesamiento on-premise de contenido sensible: al distribuirse en GGUF y ejecutarse con llama.cpp, permite traducir material confidencial en infraestructura propia sin enviar datos a APIs externas.
- Localizacion de comercio electronico: aplicacion de glosarios de catalogo y adaptacion de registro por idioma para fichas de producto y correos transaccionales.
- Traduccion asistida en atencion al cliente multilingue: con la temperatura a 0 y la plantilla de chat sin modo thinking, se obtienen salidas deterministas y rapidas aptas para respuestas predefinidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona una validacion de consistencia de las cuantizaciones: cada nivel fue verificado en GPU NVIDIA A100 frente a la conversion F16 mediante divergencia KL por token y RMS Δp con llama-perplexity, ademas de comprobaciones puntuales de generacion greedy contra los pesos BF16 originales. No se proporcionan cifras concretas de BLEU, COMET, MMLU ni de otras metricas.

## Requisitos de hardware

- Q2_K (13,25 GB): cabe en GPU de consumo con 16 GB de VRAM, como RTX 4060 Ti 16 GB, RTX 4080 o RTX 4090 con contexto amplio; la propia model card advierte de perdida de calidad significativa.
- Q3_K_S / Q3_K_M / Q3_K_L (15,55-18,55 GB): viables en GPU de 24 GB (RTX 3090, RTX 4090) o en 16 GB con offload parcial a RAM.
- IQ4_XS / Q4_K_S / Q4_K_M (19,39-21,71 GB): Q4_K_M esta marcada como la opcion recomendada por equilibrio calidad-tamano; requiere alrededor de 22 GB mas cache KV, por lo que encaja en RTX 3090/4090 de 24 GB con contexto moderado o en GPU de 32-48 GB sin recortes.
- Q5_K_S / Q5_K_M (24,56-25,35 GB): requieren 32 GB o mas de VRAM, por ejemplo A6000 48 GB, o reparto entre dos GPU.
- Q6_K (29,21 GB) y Q8_0 (37,80 GB): orientadas a A100 40 GB, A100 80 GB, H100 80 GB o configuraciones multi-GPU; Q8_0 es practicamente sin perdida.
- f16 (71,07 GB, dos fragmentos): necesita 80 GB de VRAM en una sola GPU (A100 80 GB, H100 80 GB) o dos GPU de 40 GB.
- Proyector multimodal: anadir 0,61 GB (mmproj-Q8_0) o 0,90 GB (mmproj-f16) si se utiliza entrada de imagen.
- Opciones de despliegue: llama.cpp (llama serve, llama cli, llama-mtmd-cli para vision), con compatibilidad declarada con endpoints; no se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. Si se confirma la naturaleza MoE con unos 3B de parametros activos, el coste por token seria muy inferior al de un modelo denso de 35B, pero este extremo no esta verificado en la documentacion facilitada.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo ni con alternativas comparables de traduccion. La unica comparacion documentada en la informacion proporcionada es interna al propio repositorio: los distintos niveles de cuantizacion GGUF (de Q2_K a f16) frente a los pesos BF16 originales, validada mediante divergencia KL y RMS Δp en llama-perplexity. No se dispone de datos que permitan contrastar este modelo con otras familias de traduccion en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card advierte explicitamente de perdida de calidad significativa en Q2_K y de perdida notable en los niveles Q3_K; para produccion se recomienda Q4_K_M o superior.
- La cuantizacion es estatica y posterior al entrenamiento, por lo que la degradacion no es uniforme entre idiomas ni entre tipos de contenido.
- No se especifica la longitud de contexto soportada, lo que impide dimensionar con precision la cache KV y limita el uso en documentos muy largos sin pruebas previas.
- No se detalla la lista de los 150 idiomas ni la calidad relativa por par de idiomas; el rendimiento puede variar mucho entre lenguas con pocos recursos.
- El prompt de traduccion de referencia esta redactado en chaturco, y el repositorio no aclara si el modelo mantiene el mismo comportamiento con instrucciones en castellano.
- No se documentan sesgos conocidos, pero al ser un modelo de traduccion multilingue es esperable que herede sesgos culturales y de representacion de los corpus de entrenamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En tareas de traduccion con restricciones duras, el incumplimiento del glosario o la alteracion de formatos es el fallo critico a vigilar.
- Para producir traduccion con control silabico hay que recurrir a los checkpoints Index-Homura, no a este modelo.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos subyacentes antes de un despliegue en produccion.
- El repositorio GGUF analizado no registra descargas ni interacciones en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- El identificador arXiv citado en las etiquetas y en la model card (2609.40181) no ha podido contrastarse con los resultados de busqueda disponibles.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Abu-Dju/Index-Translate-35B-A3B-preview-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview
- Repositorio GGUF de referencia citado en la model card: https://huggingface.co/IndexTeam/Index-Translate-35B-A3B-preview-GGUF
- Checkpoints Index-Homura para traduccion con control silabico: https://huggingface.co/IndexTeam/Index-Homura-2B
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- Codigo: https://github.com/bilibili/Index-Translate
- llama.cpp: https://github.com/ggml-org/llama.cpp

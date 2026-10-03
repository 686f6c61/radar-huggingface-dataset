# pqhaz/apex-flash-1-abliterated-GGUF

## Resumen

apex-flash-1-abliterated-GGUF es una cuantizacion en formato GGUF del modelo cantina-security/apex-flash-1-abliterated, publicada por el usuario pqhaz. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 321 000 millones de parametros totales (320.759.404.382 segun los pesos originales en safetensors) construido sobre la arquitectura GLM-5.3-Flash, que en llama.cpp se identifica con el identificador de arquitectura `glm5_next`. El repositorio ocupa 120,9 GB y solo incluye una variante de cuantizacion, la carpeta `UD-IQ3_XXS`, con una tasa de 3,01 bits por peso (BPW).

El modelo base del que deriva es una variante "abliterated", es decir, una version a la que se le ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir los comportamientos de negativa del modelo original. El autor declara explicitamente que esta variante no ha sido evaluada de forma independiente y que su proposito es la investigacion en seguridad autorizada. La relevancia de esta ficha radica en que documenta un caso de cuantizacion de muy baja precision sobre un modelo de gran tamano con capacidad multimodal (image-text-to-text), un escenario cada vez mas habitual para desplegar modelos grandes en hardware limitado.

Conviene subrayar que este repositorio no es un modelo original ni un fine-tune, sino un artefacto de compresion. El autor no esta afiliado a Cantina Security, Z.AI ni Unsloth, y no se han publicado resultados de benchmarks para esta cuantizacion. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en GLM-5.3-Flash (identificador llama.cpp `glm5_next`); los nombres de tensores indican atencion MLA, componentes SSM (KDA) e indexer |
| Parametros totales | 320.759.404.382 (~321B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF `UD-IQ3_XXS` (3,01 BPW); el autor publica ademas FP8 y NVFP4 en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base; copyright (c) 2026 Z.AI Co., Ltd) |
| Formato de pesos | GGUF (convertido desde el checkpoint original en BF16); no incluye el proyector de vision |

## Arquitectura y entrenamiento

El modelo subyacente es una mezcla de expertos (MoE) de tipo transformer de aproximadamente 321 000 millones de parametros totales, basado en la arquitectura GLM-5.3-Flash. A partir de los nombres de tensores que detalla la model card se pueden inferir varios componentes tecnicos: tensores de expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`), expertos compartidos, atencion de tipo MLA (`attn_k_b`, `attn_v_b`, `attn_kv_a_mqa`), modulos denominados KDA con tensores `ssm_*` (lo que sugiere algun componente de espacio de estados) y un `indexer`, previsiblemente para seleccion de tokens o enrutamiento disperso. Se trata, por tanto, de una arquitectura hibrida con elementos de atencion latente y posiblemente atencion lineal o SSM, aunque la informacion proporcionada no permite confirmar los detalles exactos ni el numero de parametros activos por token.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: no se indica el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras. Lo unico documentado es el proceso de cuantizacion: los pesos se convirtieron desde el checkpoint en BF16 con el script `convert_hf_to_gguf.py` de llama.cpp y despues se cuantizaron con `llama-quantize`, empleando la matriz de importancia (imatrix) de Unsloth para GLM-5.3-Flash (`imatrix_unsloth.gguf`), justificada porque apex es un fine-tune del mismo modelo base. Se aplico un archivo de tipos por tensor que reproduce el esquema `UD-IQ3_XXS` de unsloth/GLM-5.3-Flash-GGUF: expertos enrutados `ffn_gate/up_exps` en IQ2_S, `ffn_down_exps` en IQ3_S (con algunas capas en IQ4_XS, Q3_K o Q2_K) y atencion y expertos compartidos en Q6_K. Los 129 tensores de expertos enrutados coinciden exactamente con los tipos de Unsloth, mientras que 332 tensores pequenos no-expertos (KDA `ssm_*`, `hc_*_fn`, MLA `attn_k_b/v_b/kv_a_mqa`, indexer) se mantienen en BF16/F32 en lugar de Q8_0, porque la version actual de llama.cpp no los cuantiza; esto los hace ligeramente mayores y mas precisos. La variable "abliterated" del modelo base no viene acompanada de detalles tecnicos sobre el metodo de ablacion empleado.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `image-text-to-text` indican uso de chat multiturno.
- Capacidad multimodal de entrada: el pipeline declarado es `image-text-to-text`, por lo que el modelo base acepta imagenes y texto como entrada, aunque esta cuantizacion no incluye el proyector de vision.
- Razonamiento y generacion de lenguaje general: capacidades propias de un modelo MoE de 321B de la familia GLM-5.3-Flash, si bien no se documentan tareas concretas en la informacion disponible.
- Comportamiento "abliterated": el modelo base ha sido modificado para reducir las negativas de rechazo, orientado a investigacion de seguridad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Capacidad especial de vision: solo si se anade un `mmproj` externo; el repositorio no incluye el proyector.

## Casos de uso

- Investigacion en seguridad de modelos: el proposito declarado por el autor es la investigacion autorizada en seguridad; permite estudiar el efecto de la ablacion de rechazos sobre el comportamiento de un modelo grande y comparar con la variante no ablacionada.
- Analisis de robustez de cuantizaciones agresivas: sirve para evaluar como afecta una cuantizacion a 3,01 BPW (IQ2_S/IQ3_S en expertos) a la calidad de un MoE de 321B, comparando contra los formatos FP8 y NVFP4 del mismo autor.
- Despliegue local de un modelo de gran tamano en hardware de gama alta: con 120,9 GB de pesos, permite ejecutar un modelo de 321B en estaciones de trabajo con suficiente memoria unificada o multi-GPU, algo inviable con el checkpoint en BF16.
- Experimentacion con arquitecturas hibridas (MLA, SSM, indexer): util para quienes quieren estudiar el comportamiento real de estos componentes en llama.cpp, dado que el autor documenta que los tensores no-expertos permanecen en BF16/F32.
- Reproduccion de pipelines de cuantizacion: el repositorio documenta de forma detallada el uso de imatrix y de archivos de tipos por tensor, por lo que sirve como referencia practica para reproducir el esquema `UD-IQ3_XXS`.
- Evaluacion comparativa de imatrix: dado que se reutiliza la matriz de importancia de Unsloth por ser un fine-tune del mismo base, es un caso de estudio para medir el impacto de reutilizar imatrix entre modelos emparentados.
- Generacion multimodal (con matiz): si se combina con el `mmproj` del repositorio de Unsloth, podria emplearse en tareas de imagen-texto, siempre que la cuantizacion mantenga la calidad suficiente, algo que no esta verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que esta cuantizacion no ha sido evaluada con benchmarks y que la variante abliterated del modelo base tampoco dispone de una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 120,9 GB, por lo que se necesita al menos esa cantidad de memoria (VRAM agregada o memoria unificada) para cargar los pesos, mas espacio adicional para el contexto y las cachés KV.
- Para el formato FP8 y NVFP4 del mismo autor, el tamano seria distinto; no se detalla en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita. Por el volumen de pesos (~121 GB), serian necesarios multiples aceleradores de gama profesional (por ejemplo, varios A100/H100 de 80 GB) o una configuracion con memoria unificada amplia (por ejemplo, Apple Silicon con memoria suficiente).
- Compatibilidad con GPU de consumo: no cabe en una unica GPU de consumo convencional (una RTX 4090 dispone de 24 GB). Requeriria una configuracion multi-GPU o descarga por capas con `mmap`, con la penalizacion de rendimiento que ello implica.
- Opciones de despliegue: llama.cpp (formato nativo GGUF) y, en funcion del soporte de la arquitectura `glm5_next`, servidores compatibles con el runtime de llama.cpp. Otros motores como vLLM, TGI u Ollama no estan confirmados en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.
- Nota: el proyector de vision no esta incluido; para uso multimodal habria que anadir el `mmproj` del repositorio de Unsloth, correspondiente a la misma torre de vision.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se recogen las referencias mas proximas mencionadas por el propio autor, con los datos disponibles:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| pqhaz/apex-flash-1-abliterated-GGUF | ~321B (MoE) | GGUF UD-IQ3_XXS | MIT | Esta ficha; sin benchmarks |
| pqhaz/apex-flash-1-abliterated-FP8 | no disponible | FP8 | MIT | Mismo autor; formato alternativo |
| pqhaz/apex-flash-1-abliterated-NVFP4 | no disponible | NVFP4 | MIT | Mismo autor; formato alternativo |
| unsloth/GLM-5.3-Flash-GGUF | no disponible | GGUF | no disponible | Origen del esquema UD-IQ3_XXS y de la imatrix |

No se dispone de datos de contexto, rendimiento ni benchmarks para completar la comparativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: ni la cuantizacion ni el modelo base abliterated han sido evaluados; no hay garantia sobre la degradacion de calidad introducida por la cuantizacion a 3,01 BPW.
- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgos.
- Riesgo de alucinacion: no cuantificado; al tratarse de una cuantizacion de baja precision, el riesgo puede verse incrementado respecto al checkpoint en BF16.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan informados.
- Naturaleza "abliterated": el modelo ha sido modificado para reducir rechazos, lo que incrementa el riesgo de generar contenido danino o inapropiado. El autor lo limita a investigacion en seguridad autorizada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero con la salvedad de que la licencia se hereda del modelo base y el copyright corresponde a Z.AI Co., Ltd (2026). Conviene revisar el archivo LICENSE.
- Proyector de vision ausente: el repositorio no incluye `mmproj`, por lo que no es multimodal de forma directa y requiere un artefacto externo compatible.
- Dependencia de llama.cpp: 332 tensores no-expertos permanecen en BF16/F32 porque la version actual de llama.cpp no los cuantiza; esto aumenta ligeramente el tamano y puede variar con futuras versiones del runtime.
- Compatibilidad de motores limitada: no hay confirmacion de soporte en vLLM, TGI u Ollama para la arquitectura `glm5_next`.
- Repositorio sin adopcion: cero descargas y cero "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Desafiliacion explicita: el autor no esta afiliado a Cantina Security, Z.AI ni Unsloth.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pqhaz/apex-flash-1-abliterated-GGUF
- Modelo base: https://huggingface.co/cantina-security/apex-flash-1-abliterated
- Formato FP8: https://huggingface.co/pqhaz/apex-flash-1-abliterated-FP8
- Formato NVFP4: https://huggingface.co/pqhaz/apex-flash-1-abliterated-NVFP4
- Referencia de cuantizacion y mmproj: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- No se han encontrado en la informacion proporcionada papers, blogs o demos adicionales.

# SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una edición "abliterated" (sin dirección de rechazo) publicada por el usuario SC117 sobre Swift 1.5, un derivado de Qwen3.8-Flash-Next optimizado para eficiencia de razonamiento. El modelo base de la cadena, desarrollado por UkisAI, es un transformer de tipo mezcla de expertos (MoE) con unos 176.943.899.520 parámetros totales (≈177.000 millones) distribuidos en 48 capas, y la variante aquí documentada es una cuantización GGUF en tres niveles orientada a ejecución local con llama.cpp.

La relevancia de esta ficha está en el método de construcción: en lugar de reentrenar, el autor ha realizado un transplante de tensores a nivel de byte. Se sustituyen 144 tensores (los que escriben de vuelta en el flujo residual) con pesos abliterated ya existentes, capa por capa, mientras que los 1080 tensores restantes se conservan bit a bit. El tamaño del fichero se mueve menos del 0,2 % y, según la model card, la eficiencia de razonamiento de Swift 1.5 sobrevive al proceso, manteniéndose un 34,8 % por debajo del modelo base en consumo de tokens de pensamiento.

Se publica bajo la licencia swift-open-license-1.0 (etiquetada como "other"), con soporte declarado de inglés y chino, pipeline image-text-to-text (entrada de imagen y texto) y etiquetas de contexto largo, red-teaming y uncensored. El repositorio acumula 8104 descargas y 11 "likes". El modelo está pensado para evaluación de seguridad, investigación sobre alineación y despliegue local en hardware de gama alta, no como sustituto directo de un modelo alineado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 48 capas; derivado de Qwen3.8-Flash-Next |
| Parametros totales | 176.943.899.520 (≈177B), dato de safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como "long-context", sin cifra publicada) |
| Tipos de cuantizacion | GGUF con tres niveles: Q2_0, IQ2_XS, IQ3_XXS; usa imatrix |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | swift-open-license-1.0 (campo `license: other`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

Datos adicionales del repositorio: tamano del repo 217,2 GB, pipeline image-text-to-text, creado el 2026-10-03 y actualizado el 2026-10-04. Los tamanos de fichero declarados en la model card son 61,9 GB para Q2_0 y 70,6 GB para IQ3_XXS.

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE, heredada de Qwen3.8-Flash-Next a traves de la cadena de derivados de UkisAI. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineacion. Tampoco se detalla el numero de expertos ni cuantos se activan por token, por lo que los parametros activos quedan como no disponibles.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el post-procesado. El autor aplica un transplante de tensores por byte: solo se reemplazan los 144 tensores que escriben en el flujo residual, con los pesos correspondientes de una release abliterated ya preparada, mientras que los 1080 tensores no objetivo permanecen identicos bit a bit. Las proyecciones down de los expertos enrutados conservan las escalas de bloque del modelo original. Cada tensor se verifica con blake2b de forma individual. Sobre la cadena de cuantizacion, UkisAI aplica GSQ (cuantizacion aprendida) y RCO (asignacion de presupuesto de bits por capa), y la model card afirma que se conserva la eficiencia de razonamiento de Swift 1.5 (un 34,8 % por debajo del base), frente a la reduccion de aproximadamente el 52 % en tokens de pensamiento sobre benchmarks de codigo que se atribuye a Swift 1.5 respecto a su upstream.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", con enfasis declarado en eficiencia de tokens de razonamiento (reasoning-efficient, token-efficient).
- Generacion y asistencia en codigo, con benchmarks de codigo citados como referencia de la eficiencia de pensamiento.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text): el modelo puede procesar imagenes junto a instrucciones textuales.
- Contexto largo: la etiqueta long-context esta presente, aunque no se publica la ventana concreta.
- Multilingue limitado a ingles y chino; no hay soporte declarado de castellano.
- Comportamiento "uncensored" / abliterated: se ha eliminado la direccion de rechazo, por lo que el modelo responde a peticiones que un modelo alineado rechazaria.
- Orientado a red-teaming: su uso previsto incluye la generacion de contenido adversario para evaluar otros sistemas.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita, aunque el modo de razonamiento puede habilitarlo de forma indirecta.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo sirve como generador adversario para producir prompts e intentos de jailbreak con los que probar los filtros de un modelo alineado, aprovechando que su direccion de rechazo ha sido eliminada.
- Investigacion sobre abliteration: permite estudiar si el transplante de tensores a nivel de byte preserva las capacidades del modelo original, comparando sus salidas con las del upstream no abliterated y midiendo deriva en calidad y coherencia.
- Analisis comparativo de cuantizacion: con tres niveles GGUF (Q2_0, IQ2_XS, IQ3_XXS) y verificacion blake2b por tensor, es util para medir la degradacion de un MoE de ~177B al bajar de 3 bits por peso en tareas de razonamiento y codigo.
- Asistencia de codigo en local: con ~62-71 GB de pesos puede desplegarse en una estacion de trabajo con GPU de 80 GB o en configuracion multi-GPU mediante llama.cpp, generando codigo sin enviar datos a servicios externos.
- Procesamiento de documentos con imagenes en entornos bilingues ingles-chino: capturas, diagramas o formularios escaneados acompanados de instrucciones en cualquiera de los dos idiomas.
- Investigacion sobre contexto largo: si se confirma la ventana extendida, permite experimentar con resumen y recuperacion sobre documentos extensos, aunque el coste de KV cache en un MoE de 177B debe medirse caso por caso.
- Fine-tuning y destilacion de datos: al ser un modelo sin restricciones de rechazo, es util para generar datasets sinteticos de dominios donde un modelo alineado se negaria a colaborar, siempre que la licencia lo permita.
- Despliegue en air-gapped: al distribuirse en GGUF y ejecutarse con llama.cpp, puede operar en maquinas aisladas sin conexion, algo relevante en entornos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras de rendimiento que aparecen en la model card son relativas, no absolutas:

| Metrica | Valor declarado | Fuente |
|---|---|---|
| Tokens de pensamiento en benchmarks de codigo (Swift 1.5 vs. base) | ~52 % menos | Model card |
| Eficiencia de razonamiento tras la abliteration (vs. base) | 34,8 % por debajo del base | Model card |
| Variacion del tamano de fichero tras el transplante | < 0,2 % | Model card |
| Tensores sustituidos / conservados | 144 / 1080 | Model card |
| Capas afectadas | 48 | Model card |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni comparaciones numericas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamanos de fichero declarados son 61,9 GB (Q2_0) y 70,6 GB (IQ3_XXS). Anadiendo KV cache y buffers de contexto, hay que presupuestar del orden de 66-80 GB en funcion del nivel de cuantizacion y de la longitud de contexto efectiva. IQ2_XS queda entre ambos, sin cifra publicada.
- GPU recomendadas: una unica GPU de 80 GB (A100 80 GB, H100 80 GB, H200) es el escenario mas comodo para IQ3_XXS. Para Q2_0 tambien entraria en 80 GB con margen. La VRAM adicional del KV cache en contexto largo puede obligar a pasar a dos GPU.
- Multi-GPU: dos GPU de 48 GB (RTX 6000 Ada, A6000, L40S) cubren ambas cuantizaciones con reparto de capas.
- GPU de consumo: no cabe en una RTX 4090 ni en una RTX 5090 de 24-32 GB. Es obligatorio hacer offload de capas a CPU mediante llama.cpp, con la penalizacion de velocidad correspondiente.
- Memoria unificada: los equipos Apple con 96 GB o 128 GB de memoria unificada (Mac Studio) pueden alojar Q2_0 o IQ3_XXS, con throughput modesto en decodificacion.
- Opciones de despliegue: llama.cpp y sus interfaces asociadas (Ollama, LM Studio, koboldcpp) son el camino natural al ser un GGUF. El soporte de GGUF en vLLM y TGI es limitado; para maxima velocidad conviene valorar el modelo base en safetensors con vLLM, siempre que el hardware lo permita.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (SC117, abliterated GSQ-RCO GGUF) | ~177B (MoE) | no disponible | GGUF | swift-open-license-1.0 | 144 tensores sustituidos; sin direccion de rechazo |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF (upstream) | ~177B (MoE) | no disponible | GGUF | swift-open-license-1.0 | Version alineada del mismo modelo; el abliterated parte de aqui |
| ukisai/Swift-Qwen3.8-Flash-Next (base declarado) | ~177B (MoE) | no disponible | safetensors | swift-open-license-1.0 | Sin GSQ/RCO ni abliteration |
| Otros MoE abliterados de ~177B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de resultados de benchmarks del modelo ni de sus competidores en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia. La diferencia funcional principal frente al upstream es la eliminacion de la direccion de rechazo, no una mejora de capacidades.

## Limitaciones y advertencias

- Modelo abliterated: la direccion de rechazo se ha eliminado de forma deliberada. Es previsible que genere contenido danino, ilegal o gravemente ofensivo si se le solicita. No debe exponerse a usuarios finales sin filtros externos.
- Sesgos: no hay documentacion sobre sesgos del modelo base ni sobre como afecta la abliteration a los sesgos existentes. Se desconoce el efecto sobre estereotipos, toxicidad y equidad.
- Alucinacion: al ser un derivado de un modelo de razonamiento con contexto largo y sin datos de evaluacion publicados, el riesgo de alucinacion no esta cuantificado y debe asumirse alto en tareas factuales.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano, por lo que el rendimiento en espanol sera bajo o degradado.
- Contexto: la etiqueta "long-context" no viene acompanada de una cifra. No se puede planificar un despliegue que dependa de una ventana concreta sin verificar el valor real en el config del modelo.
- Licencia: swift-open-license-1.0 se declara como `license: other`, con el texto en un enlace externo. Hay que leerla antes de cualquier uso comercial; los terminos no estan resumidos en la informacion disponible.
- Trazabilidad: los metadatos de la model card presentan referencias inconsistentes al modelo base (`ukisai/Swift1.5-Qwen3.8-Flash-Next`, `ukisai/Swift-Qwen3.8-Flash-Next` en el campo base_model y `ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF` como origen declarado en el texto). Conviene verificar la cadena exacta antes de reproducir resultados.
- Compatibilidad de cuantizacion: Q2_0 e IQ2_XS son niveles muy agresivos para un MoE de 177B; la perdida de calidad frente a IQ3_XXS no esta documentada ni medida.
- Produccion: no hay benchmarks, ni cifras de latencia, ni pruebas de robustez. No se recomienda su uso en produccion sin una evaluacion propia.

## Enlaces

- HuggingFace: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base declarado: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Upstream cuantizado (GSQ-RCO): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- README en chino: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces obtenidos correspondian a tiendas y comparativas de portatiles con Linux (ubuntu.com/certified/laptops, linuxshop.fr, system76.com, techradar.com, linuxcertified.com) y no guardan relacion con el modelo. No se dispone de papers, blogs tecnicos, repositorios de codigo ni demos adicionales.

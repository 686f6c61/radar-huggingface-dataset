# kataguru/Qwen3.5-35B-A3B-Sceptic-v3.4-GGUF

## Resumen

Qwen3.5-35B-A3B-Sceptic-v3.4-GGUF es una cuantización publicada por el usuario kataguru sobre el modelo base Qwen/Qwen3.5-35B-A3B, un transformer de tipo mezcla de expertos (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones activos por token. El autor la presenta como la version "APEX Trio" de su familia Sceptic, orientada a razonamiento en finlandés, con soporte multimodal (vision) heredado de la arquitectura Qwen3.5, decodificacion especulativa MTP y un ajuste declarado como "zero refusal" en contenidos de ficción y adultos.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de ajuste fino profundo sobre un MoE de 35B en un idioma de bajos recursos como el finlandés, con cuantizaciones de muy bajo bit por peso (2,92 a 3,71 bpw) diseñadas para caber en GPU de consumo de 12 y 16 GB. Por otro, ilustra el ecosistema de derivados no oficiales de Qwen3.5: se trata de una publicacion de terceros, no validada por el Qwen Team, cuyos resultados de benchmark son autoinformados en la model card y no cuentan con verificacion externa.

El repositorio ocupa 48,7 GB e incluye tres cuantizaciones GGUF del modelo principal, un proyector multimodal en f16, dos capas MTP de decodificacion especulativa y una matriz de activaciones imatrix propia. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), multimodal (vision-lenguaje), con capas MTP (Multi-Token Prediction) para decodificacion especulativa |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | Aproximadamente 3B por token (nomenclatura A3B) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de llama.cpp de la model card emplea 32.768 tokens, y se recomienda limitar a 8.192-16.384 tokens en GPU de 12 GB |
| Tipos de cuantizacion | APEX-Small (2,92 bpw), APEX-Medium (3,28 bpw), APEX-Good (3,71 bpw); proyector mmproj en F16; capas MTP en Q4_K_M y Q8_0 |
| Idiomas soportados | Finlandes (fi) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal, proyector multimodal y capas MTP); imatrix como archivo auxiliar |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, un MoE multimodal de la familia Qwen3.5 de Alibaba Cloud. Segun el blog oficial de Qwen, la serie Qwen3.5 introduce un entrenamiento de fusion temprana sobre billones de tokens multimodales, lo que otorga al modelo capacidades nativas de vision-lenguaje en lugar de un adaptador acoplado a posteriori. La variante 35B-A3B activa aproximadamente 3.000 millones de parametros por token, lo que reduce el coste de inferencia respecto a un denso del mismo tamaño total.

Sobre esa base, kataguru aplica un ajuste propio denominado Sceptic v3.4, que combina cuatro componentes declarados: entrenamiento profundo de finlandés, vectores de matemáticas y STEM de un componente llamado Ornith, un modulo de veracidad JEV Truth y el sistema Diabolico Code Immunity v2/v3 orientado a codificacion de sistemas. Las cuantizaciones se generan con una matriz de activaciones propia (`sceptic_v3.4.imatrix`) para reducir la perdida de precision en el proceso de cuantizacion. El autor declara que las capas NextN/MTP se conservan y se ofrecen como archivos independientes para decodificacion especulativa. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en finlandés e inglés, con especial enfasis declarado en morfologia finlandesa (casos abesivo, comitativo e instructivo).
- Razonamiento con modo de pensamiento explicito mediante bloques `<think>`, cuya profundidad se escala automaticamente segun la dificultad de la tarea.
- Razonamiento matematico con cadena de pensamiento (el autor reporta mejoras en GSM8K respecto al base).
- Generacion y analisis de codigo, con un ajuste declarado especifico para programacion de sistemas y tareas de concurrencia.
- Vision multimodal: analisis de imagenes y OCR en finlandés mediante el proyector mmproj incluido.
- Decodificacion especulativa con capas MTP propias, con una tasa de aceptacion declarada del 78,6 %.
- Uso sin rechazos en contenido de ficción y tematica adulta legal ("zero refusal"), con rechazo declarado de forma autonoma ante CBRN y dano a menores.
- Soporte de plantillas conversacionales compatibles con endpoints (etiqueta `endpoints_compatible`), aunque no se detalla soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Atencion al cliente en finlandés: el modelo maneja conversaciones multi-turno con buena calidad morfologica, un punto critico en un idioma con declinacion nominal compleja donde los modelos genericos suelen producir errores de caso.
- Procesamiento de documentos escaneados en finlandés: combinando el modelo principal con el proyector `mmproj`, se puede hacer OCR y extraccion estructurada de facturas, contratos o formularios sin depender de servicios en la nube.
- Generacion de codigo en pipelines de CI/CD automatizados: el ajuste Diabolico Code Immunity esta orientado a tareas de concurrencia y programacion de sistemas, lo que permite usarlo como revisor o generador de parches en entornos con requisitos de latencia ajustados gracias a sus ~3B parametros activos.
- Asistente legal o administrativo localizado: la calidad declarada del 100 % en morfologia finlandesa lo hace apto para redactar comunicaciones oficiales y resumir normativa en finlandés, con la salvedad de que los datos de benchmark son autoinformados.
- Analisis de imagenes tecnicas en ingles y finlandés: diagramas de arquitectura, capturas de pantalla o documentacion visual, con descripcion y extraccion de texto integradas.
- Escritura creativa y ficcion sin filtros: el perfil "zero refusal" declarado lo hace util para proyectos editoriales de ficcion adulta o guiones que otros modelos rechazan, siempre que el contenido sea legal.
- Investigacion en seguridad ofensiva y defensiva: el autor lo posiciona para ciberinvestigacion, aunque su uso en produccion exige auditoria propia de las salidas.
- Despliegue en hardware de consumo: con APEX-Small (12,05 GiB) cabe en una RTX 3060 de 12 GB o RTX 4070 de 12 GB, lo que habilita prototipado local sin infraestructura de servidor.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor y estan medidos, segun esta, sobre 2x RTX 5090 (Blackwell, TP=2) con vLLM / llama.cpp b11064. Son resultados autoinformados y no verificados de forma independiente. Las pruebas "Diabolical Concurrency", "Finnish Morphology" y la tasa de rechazo son benchmarks propios del autor, no estandarizados.

| Benchmark | Qwen 3.5 35B base | Sceptic v3.0 | Sceptic v3.3 | Sceptic v3.4 |
|---|---|---|---|---|
| GSM8K (matematicas, CoT) | 82,4 % | 86,8 % | 87,2 % | 88,1 % |
| TruthfulQA | 61,2 % | 74,5 % | 76,8 % | 78,4 % |
| Diabolical Concurrency (rondas 2 y 3) | 28,0 % | 65,0 % | 90,0 % | 95,0 % |
| Morfologia finlandesa (abesivo/comitativo) | 71,0 % | 94,0 % | 98,0 % | 100,0 % |
| Tasa de rechazo en erotica/ficcion | ~45,0 % | 12,0 % | 8,0 % | 0,00 % |
| Tasa de aceptacion especulativa MTP | no disponible | 74,2 % | 76,5 % | 78,6 % |
| Rendimiento (AWQ / APEX, tok/s) | 210 tok/s | 258 tok/s | 265 tok/s | 268 tok/s |

No se han publicado resultados de MMLU, HumanEval, MATH ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo principal segun cuantizacion: 12,05 GiB (APEX-Small, 2,92 bpw), 13,55 GiB (APEX-Medium, 3,28 bpw) y 15,33 GiB (APEX-Good, 3,71 bpw). A esto hay que sumar el espacio de la cache KV.
- Proyector multimodal: 902 MiB adicionales en F16 si se usa vision.
- Capas MTP opcionales: 1,26 GiB (Q4_K_M) o 1,99 GiB (Q8_0) para decodificacion especulativa.
- GPU recomendadas por el autor: APEX-Small para RTX 3060 12 GB, RTX 4070 12 GB y RTX 5070 12 GB; APEX-Medium para RTX 4080 y RTX 5060 Ti de 16 GB; APEX-Good para RTX 3090, 4090 y 5090 de 24 GB o mas. El autor declara pruebas en 2x RTX 5090 32 GB (TP=2) y en RTX 5060 Ti 16 GB / RTX 4070 12 GB.
- Cabe en GPU de consumo: si, en configuraciones de 12 GB o mas con las cuantizaciones APEX-Small y APEX-Medium.
- En tarjetas de 12 GB el autor recomienda limitar el contexto a 8.192-16.384 tokens para no agotar memoria.
- Opciones de despliegue: LM Studio, llama.cpp (b11064 o superior) y Ollama, segun la model card. Tambien se menciona vLLM en el entorno de medicion del autor.
- Throughput declarado: 268 tok/s en la configuracion de 2x RTX 5090, con una tasa de aceptacion especulativa MTP del 78,6 %. No se proporcionan datos de latencia por peticion ni de rendimiento en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sceptic v3.4 (este modelo) | 35,5B | ~3B | No disponible | Apache 2.0 | GGUF | Ajuste finlandés, vision, zero refusal, benchmarks autoinformados |
| Qwen/Qwen3.5-35B-A3B (base) | 35,5B | ~3B | No disponible | Apache 2.0 | Safetensors y GGUF | Modelo oficial de Alibaba Cloud; referencia de los benchmarks del autor |
| Qwen3.5-397B-A17B | 397B | 17B | No disponible | No disponible en la informacion | No disponible | Variante grande de la misma familia, presentada como modelo nativo vision-lenguaje |
| Qwen3.5-35B-A3B-Sceptic-v3-1M-GGUF | No disponible | No disponible | No disponible | Apache 2.0 (por herencia) | GGUF | Publicacion hermana del mismo autor; presumiblemente variante con contexto extendido, sin datos confirmados |

No se dispone de datos de benchmarks comparativos con alternativas de otros fabricantes (Llama, Mistral, Gemma) en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmark son autoinformados por el autor de la cuantizacion y no han sido verificados por terceros. Algunas pruebas ("Diabolical Concurrency", "Finnish Morphology") no son benchmarks estandarizados y no permiten comparacion directa con otros modelos.
- La publicacion es un derivado no oficial de Qwen3.5; no cuenta con validacion del Qwen Team ni garantias de mantenimiento.
- La cuantizacion a 2,92-3,71 bpw introduce degradacion respecto a los pesos originales. Aunque el autor afirma usar una imatrix propia, no se aportan mediciones de perplejidad para cuantificar la perdida.
- El perfil "zero refusal" declarado reduce las barreras de seguridad del modelo. Aunque el autor indica que rechaza CBRN y dano a menores, cualquier despliegue en produccion debe incorporar su propia capa de moderacion y cumplir la normativa aplicable (por ejemplo, el AI Act europeo).
- El modelo esta optimizado para finlandés e inglés. Su rendimiento en castellano no se ha documentado y probablemente sea inferior al de las versiones oficiales de Qwen3.5.
- La longitud de contexto no se especifica en la informacion disponible. En GPU de 12 GB se recomienda no superar los 8.192-16.384 tokens, lo que limita casos de uso con documentos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en dominios especializados como derecho finlandés o ciberseguridad.
- La licencia Apache 2.0 permite uso comercial, pero corresponde al integrador verificar que el ajuste del autor y los datasets empleados cumplan las condiciones de la licencia del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad de usuarios que valide los resultados declarados.
- No se documenta soporte explicito de tool calling ni de function calling, pese a la etiqueta `endpoints_compatible`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kataguru/Qwen3.5-35B-A3B-Sceptic-v3.4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Publicacion hermana del mismo autor: https://huggingface.co/kataguru/Qwen3.5-35B-A3B-Sceptic-v3-1M-GGUF
- Blog oficial de la serie Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de la serie Qwen3.5: https://github.com/go-ai/Qwen3.5/tree/main
- Ficha de la variante GGUF base en local-ai-zone: https://local-ai-zone.github.io/models/qwen-qwen3-5-35b-a3b.html

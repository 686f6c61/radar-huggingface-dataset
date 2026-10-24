# mradermacher/Wicked-Stuff-26B-A4B-Final-GGUF

## Resumen

Wicked-Stuff-26B-A4B-Final-GGUF es la versión cuantizada en formato GGUF del modelo Wicked-Stuff-26B-A4B-Final, desarrollado por ReadyArt y convertido por mradermacher, un cuantizador habitual de pesos abiertos para llama.cpp. Se trata de un modelo conversacional orientado explícitamente a roleplay para adultos: la model card lo etiqueta como `nsfw`, `explicit`, `unaligned`, `ERP`, `Horror` y `Violence`, y el repositorio está marcado como `not-for-all-audiences`. Cubre la demanda de un modelo ejecutable en local sin alineación de seguridad para ficción adulta y narrativa madura, un nicho que los modelos generalistas rechazan por sus políticas de contenido.

El modelo base tiene 25.233.142.046 parámetros (unos 25,2 B) según los tensores safetensors, y la nomenclatura A4B del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 4 B de parámetros activos, aunque la model card no lo confirma. Solo declara inglés como idioma y no publica longitud de contexto ni detalles de entrenamiento.

Su interés práctico es doble: ofrece once cuantizaciones estáticas entre 10,7 GB (Q2_K) y 27 GB (Q8_0), lo que permite ejecutarlo en GPUs de consumo, y el repositorio incluye proyectores `mmproj`, lo que apunta a entrada multimodal de imágenes. Ahora bien, se publicó el 24 de octubre de 2026 con cero descargas y cero likes, por lo que no existe validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferido de la nomenclatura A4B; no confirmado en la model card |
| Parametros totales | 25.233.142.046 (25,2 B), según safetensors del modelo base |
| Parametros activos | Aproximadamente 4 B según la nomenclatura A4B; no confirmado por el autor |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; f16 referenciado en metadatos y cuantizaciones con imatrix en el repositorio i1 |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; proyectores multimodales `mmproj` en f16 y Q8_0; el modelo base se distribuye en safetensors |
| Tamano del repositorio | 184,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna ni el proceso de entrenamiento. El nombre del modelo indica 26 B de parámetros totales y el sufijo A4B (activos 4 B), patrón habitual en modelos MoE con enrutado por token, pero la model card no incluye número de expertos, ratio de activación, estrategia de atención ni longitud de contexto entrenada. Tampoco se detallan tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o ajuste por preferencias. La etiqueta `unaligned` sugiere ausencia deliberada de alineación de seguridad.

Sí hay detalles verificables del proceso de cuantización: los metadatos internos indican `quantize_version: 2` y `output_tensor_quantised: 1`, es decir, la capa de salida también está cuantizada, lo que puede introducir una degradación ligera adicional en la distribución de logits respecto a una cuantización que la preserve en f16. Las cuantizaciones de este repositorio son estáticas; las versiones ponderadas con imatrix se publican por separado en el repositorio `Wicked-Stuff-26B-A4B-Final-i1-GGUF`. Los ficheros `mmproj` (0,9 GB en Q8_0 y 1,3 GB en f16) actúan como proyector multimodal y son necesarios únicamente si se quiere procesar imagen con el modelo en llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno con estilo narrativo e inmersivo, orientada a roleplay.
- Contenido explícito para adultos: erótica (ERP), violencia explícita y terror, según las etiquetas del autor.
- Modo `unaligned`: no incorpora capas de rechazo entrenadas, por lo que responde a peticiones que un modelo alineado bloquearía.
- Formato instruct, con plantilla de chat propia del modelo base (no documentada en este repositorio).
- Entrada de imágenes previsiblemente soportada mediante los proyectores `mmproj` incluidos; las capacidades de visión no están descritas en la model card.
- Capacidad multilingüe: limitada a inglés según el campo `language`.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado; el perfil del modelo es conversacional, no de razonamiento.
- Ejecución totalmente local y offline, sin dependencia de APIs externas.

## Casos de uso

- **Ficción adulta interactiva en local**: despliegue con llama.cpp u Ollama para sesiones de roleplay erótico o narrativa madura sin enviar contenido sensible a servidores de terceros; la privacidad es el argumento principal frente a APIs comerciales.
- **Escritura creativa de terror y violencia**: generación de escenas, diálogos y borradores para relato negro, guion de slasher o novela de terror, donde el modelo no aplica rechazos por violencia gráfica.
- **NPCs y personajes en videojuegos narrativos para adultos**: integración vía `llama-server` con API compatible con OpenAI para dar voz a personajes con personalidad persistente en visual novels y RPG conversacionales.
- **Generación de datos sintéticos para fine-tuning**: producción de diálogos etiquetados en dominios que los modelos alineados se niegan a generar, para entrenar o evaluar clasificadores de contenido.
- **Red teaming y evaluación de filtros de seguridad**: uso controlado del modelo como generador adversario para probar moderadores, clasificadores de toxicidad y sistemas de verificación de edad.
- **Localización de contenido mature**: adaptación de diálogos de obras para adultos entre inglés y otros idiomas, con revisión humana posterior del tono.
- **Banco de pruebas de cuantizaciones**: la disponibilidad de once niveles entre Q2_K y Q8_0 permite medir empíricamente la pérdida de coherencia narrativa en contextos largos según bits por peso.
- **Prototipado rápido en estación de trabajo**: con Q4_K_M (16,9 GB) cabe en una GPU de 24 GB y permite iterar prompts y plantillas de chat sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de rol (EQ-Bench, LongChat) para el modelo base ni para las cuantizaciones. Tampoco hay mediciones de perplejidad por nivel de cuantización más allá del gráfico genérico enlazado por el autor.

## Requisos de hardware

Las cifras de VRAM son estimaciones propias a partir del tamaño del fichero más el caché KV; el modelo es MoE, por lo que todos los expertos deben residir en memoria aunque solo se activen unos 4 B por token.

| Cuantizacion | Tamano en disco | VRAM estimada (contexto moderado) | GPU viable |
|---|---|---|---|
| Q2_K | 10,7 GB | ~12-13 GB | RTX 4070 Ti Super 16 GB, RTX 4080 |
| Q3_K_M | 13,4 GB | ~15-16 GB | RTX 4060 Ti 16 GB, RTX 4080 |
| IQ4_XS | 14,2 GB | ~16-17 GB | RTX 4060 Ti 16 GB (ajustado), RTX 4080 |
| Q4_K_M | 16,9 GB | ~19-20 GB | RTX 3090, RTX 4090, L4 24 GB |
| Q5_K_M | 19,2 GB | ~22-23 GB | RTX 3090 / 4090 24 GB (ajustado) |
| Q6_K | 22,7 GB | ~25-26 GB | A100 40 GB, L40S 48 GB, RTX 5090 32 GB |
| Q8_0 | 27,0 GB | ~30 GB | A100 40 GB, L40S, RTX 6000 Ada |

- Cabe en GPU de consumo: sí, desde Q2_K en 16 GB y Q4_K_M en 24 GB. Por debajo de 12 GB de VRAM conviene el offload parcial de expertos a CPU (`--n-cpu-moe` en llama.cpp) o RAM del sistema.
- El caché KV crece con el contexto; al no publicarse la longitud máxima entrenada, hay que fijar `n_ctx` de forma conservadora y validar la coherencia a partir de 4-8k tokens.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante Modelfile, LM Studio, koboldcpp, text-generation-webui y `llama-cpp-python`. Para vLLM o TGI conviene partir del repositorio safetensors del modelo base, ya que el soporte GGUF en esos motores es limitado. El tag `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. Al ser MoE con ~4 B activos, la velocidad de decodificación debería aproximarse a la de un modelo denso de ese orden, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

Los comparables directos son otros modelos de 26 B con ~4 B activos cuantizados por el mismo autor, presumiblemente derivados de la misma arquitectura base. Los datos públicos de estos repositorios son mínimos.

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-Final-GGUF | 25,2 B totales / ~4 B activos | no disponible | apache-2.0 | GGUF (11 quants + mmproj) | Enfoque explícito adulto, terror y violencia; 0 descargas |
| Wicked-Tutu-26B-A4B-GGUF | 26 B nominales / ~4 B activos | no disponible | no disponible | GGUF | Mismo autor de cuantización; variante temática distinta, sin datos de rendimiento |
| Shadow-Siren-26B-A4B-i1-GGUF | 26 B nominales / ~4 B activos | no disponible | apache-2.0 | GGUF (imatrix) | Repositorio de ~300,9 GB; misma familia, cuantización ponderada |
| Aura-Prototype-26B-A4B-i1-GGUF | 26 B nominales / ~4 B activos | no disponible | no disponible | GGUF (imatrix) | Variante prototipo; sin benchmarks publicados |

No hay datos de benchmarks que permitan comparar calidad entre ellos, y ninguno declara longitud de contexto. Para una comparación de rendimiento real habría que evaluar el modelo base en safetensors.

## Limitaciones y advertencias

- **Contenido para adultos**: el modelo genera material sexual explícito, violento y de terror. El repositorio está marcado `not-for-all-audiences` y su uso exige verificación de edad y cumplimiento normativo en la jurisdicción de despliegue.
- **Ausencia de alineación**: la etiqueta `unaligned` implica que no hay capas de rechazo; no debe exponerse a usuarios finales sin moderación de entrada y salida, y en ningún caso a menores.
- **Riesgo de alucinación**: no hay evaluación publicada de factualidad. En modo rol es tolerable, pero invalida el modelo para tareas de recuperación de hechos.
- **Idioma**: solo inglés declarado. El rendimiento en castellano es impredecible y no está evaluado.
- **Contexto desconocido**: al no publicarse la longitud de contexto entrenada, usar ventanas largas puede degradar la coherencia sin previo aviso.
- **Licencia**: apache-2.0 permite uso comercial y modificaciones, pero no cubre las políticas de las plataformas de distribución (tiendas de aplicaciones, pasarelas de pago, proveedores cloud) que suelen prohibir contenido explícito.
- **Procedencia del entrenamiento**: se desconoce el dataset del modelo base y su base legal; esto traslada un riesgo de compliance al desplegador.
- **Cuantización de la capa de salida**: `output_tensor_quantised: 1` puede afectar la calidad de los logits; para muestras de referencia conviene usar Q8_0 o f16.
- **Sin validación comunitaria**: cero descargas y cero likes en el momento de la ficha; no existen informes independientes de calidad ni de estabilidad.
- **Sesgos**: no documentados; la naturaleza del corpus de roleplay adulto tiende a reproducir estereotipos de género y violencia, sin que el autor haya publicado análisis alguno.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-Final-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-Final
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-Final-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-Final-GGUF
- Peticiones de cuantización y FAQ: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que financia el trabajo de cuantización: https://www.nethype.de/
- Modelo relacionado (Wicked-Tutu-26B-A4B-GGUF): https://huggingface.co/mradermacher/Wicked-Tutu-26B-A4B-GGUF
- Modelo relacionado (Wicked-Tutu-26B-A4B-Final-i1-GGUF): https://huggingface.co/mradermacher/Wicked-Tutu-26B-A4B-Final-i1-GGUF
- Modelo relacionado (Aura-Prototype-26B-A4B-i1-GGUF): https://www.toolify.ai/ai-model/mradermacher-aura-prototype-26b-a4b-i1-gguf
- Modelo relacionado (Shadow-Siren-26B-A4B-i1-GGUF): https://huggingbay.xyz/artifact/hf-model-mradermacher-shadow-siren-26b-a4b-i1-gguf

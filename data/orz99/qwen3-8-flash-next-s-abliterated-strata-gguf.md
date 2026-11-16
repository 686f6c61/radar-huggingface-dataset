# orz99/Qwen3.8-Flash-Next-S-abliterated-Strata-GGUF

## Resumen

Qwen3.8-Flash-Next-S-abliterated-Strata-GGUF es una compilación comunitaria del modelo Qwen3.8-Flash-Next del equipo Qwen, publicada por el usuario orz99. Se trata de una cuantización de 2 bits en formato trellis (denominada S-small) realizada por Mirai, empaquetada para el motor de inferencia Strata, a la que se le ha aplicado un vector de rechazo (refusal vector) extraído del checkpoint abliterated de huihui-ai. El resultado es un modelo multimodal image-text-to-text con la capacidad de rechazo suprimida, distribuido en formato GGUF y pensado para ejecutarse en una o dos GPU RTX 3090 con los expertos en memoria RAM del sistema.

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE), según se deduce de la mención a "expertos en RAM" y a la capa MTP empaquetada. El repositorio ocupa 82,6 GB e incluye los pesos cuantizados, el codificador de imagen (mmproj), la capa MTP y los ficheros del vector de rechazo. La longitud de contexto por defecto es de 131.072 tokens, ampliable hasta 262.144 mediante configuración del servidor.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una cuantización extrema (2,4 bits de media en los expertos enrutados), un motor de inferencia específico (Strata, con un fork no oficial necesario para leer estos ficheros) y una modificación de comportamiento (abliteration) que elimina las negativas del modelo. Todo ello bajo la licencia comunitaria de Qwen, con las restricciones que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), multimodal image-text-to-text, con capa MTP |
| Parametros totales | 120.320 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 por defecto; hasta 262.144 configurable |
| Tipos de cuantizacion | Trellis de 2 bits (expertos enrutados de 1 a 5 bits, media 2,4 en la variante S); variantes S y S-small |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (trellis), con ficheros separados de backbone, head, mmproj, MTP y vector |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE multimodal que procesa entradas de imagen y texto. La compilación aquí descrita no reentrena el modelo: aplica una cuantización trellis de 2 bits sobre los expertos enrutados (con rango de 1 a 5 bits por experto y media de 2,4 bits en la variante S) y mantiene el backbone y la cabeza en formato trellis separado, lo que libera VRAM para los expertos. La variante S-small, la empaquetada en este repo, ocupa 34,4 GB más 2,1 GB de backbone y requiere 26,5 GiB de expertos en RAM, con un pico de proceso de 33 GiB.

La modificación de comportamiento se implementa mediante un vector de dirección de rechazo `r` extraído del checkpoint Huihui-Qwen3.8-Flash-Next-abliterated (fuerza 1.0, capas 1-47). Strata resta esa dirección del flujo residual tras cada capa intervenida según `h = h - (h · r) r`, sin alterar los pesos originales de Mirai. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se detallan en la información disponible. La calidad de la cuantización S-small se reporta con un KL de ROMA frente a bf16 de 0,069-0,074 y un top-1 del 91 %, medido por Mirai sobre 37.620 posiciones.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable y tres niveles de esfuerzo de razonamiento según las pruebas del autor.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador visual mmproj que consume aproximadamente 1,3 GB de VRAM.
- Tool calling / function calling: las pruebas del autor incluyen una llamada a herramienta y su respuesta como verificación superada.
- Capacidades multimodales verificadas con imágenes que contienen texto y formas.
- Procesamiento de documentos largos: localización de código oculto en un documento de 6.210 tokens en todas las configuraciones probadas.
- Decodificación especulativa mediante capa MTP empaquetada, con una tasa de borradores aceptados del 58-59 % en las mediciones.
- Comportamiento sin rechazo: 1 negativa de 64 en AdvBench y 1 de 82 en JailbreakBench con el vector activo, frente a 63-64 y 77 sin él.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos con recuperación de información: gracias a su ventana de 131.072 tokens (ampliable a 262.144), puede ingerir contratos, informes o bases de código completas y localizar fragmentos concretos, como demuestra la prueba del documento de 6.210 tokens con código oculto.
- Análisis de imágenes con texto: el codificador visual permite extraer y razonar sobre texto presente en capturas, diagramas o formularios, útil en digitalización de documentación y verificación de interfaces.
- Asistentes conversacionales sin restricciones de negativa: el vector de rechazo suprimido lo hace adecuado para entornos de investigación sobre alineación, red teaming y evaluación de salvaguardas, donde se necesita medir la respuesta del modelo sin filtros.
- Automatización con tool calling: la verificación de llamada a herramienta y respuesta lo habilita para pipelines de agentes que consultan APIs, ejecutan comandos o encadenan pasos multi-etapa.
- Inferencia en hardware de consumo: con 26,5 GiB de expertos en RAM y 33 GiB de pico, cabe en una o dos RTX 3090, lo que permite desplegar un MoE multimodal de 120.000 millones de parámetros en estaciones de trabajo sin clúster dedicado.
- Generación de código asistida en local: el modo thinking con esfuerzo configurable y la decodificación especulativa (91-102 tok/s en decodificación) permiten integrarlo en flujos de desarrollo con requisitos de privacidad.
- Investigación sobre cuantización extrema: sirve como banco de pruebas para evaluar la degradación de un MoE multimodal a 2,4 bits por experto frente a alternativas como IQ2_XS de ISTA (KL de 0,303).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona métricas de calidad de cuantización y de velocidad de inferencia:

| Metrica | S | S-small | Referencia |
|---|---:|---:|---:|
| KL de ROMA frente a bf16 | 0,040 | 0,069-0,074 | IQ2_XS de ISTA: 0,303 |
| Top-1 frente a bf16 | 93,4 % | 91 % | no disponible |
| Rechazos AdvBench (64 prompts, con vector) | 1 | 1 | sin vector: 64 / 63 |
| Rechazos JailbreakBench (82 prompts, con vector) | 1 | 1 | sin vector: 77 / 77 |
| Rechazos Alpaca harmless (64 prompts, con vector) | 0 | 0 | sin vector: 1 / 0 |

Rendimiento de decodificación en una RTX 3090 (S, prompt en frío, 512 tokens de salida, greedy, thinking off, dos repeticiones):

| Prompt | Lectura de prompt (tok/s) | Decodificación (tok/s) | Borradores aceptados |
|---:|---:|---:|---:|
| 4K | 887 / 1.011 | 91,4 / 102,1 | 59 % |
| 32K | 1.557 / 1.488 | 98,8 / 101,2 | 58 % |
| 131K | 1.186 / 1.378 | 100,2 / 102 | no disponible |

## Requisitos de hardware

- VRAM: el codificador visual consume aproximadamente 1,3 GB; el resto de la VRAM aloja el backbone y la cabeza en trellis. La variante S-small deja más VRAM libre para expertos que la S.
- RAM del sistema: 48 GB para S-small y 64 GB para S (pico del proceso de 33 GiB y 41 GiB respectivamente).
- GPU recomendadas: RTX 3090 (24 GB) verificada; el autor prueba configuraciones de una y dos tarjetas. No se reportan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en una o dos RTX 3090 con los expertos en RAM.
- Sistema operativo y toolchain: Linux, CUDA 12.8 o superior, toolkit de compilación desde fuente.
- Despliegue: motor Strata, compilado desde el fork alesha-pro/Strata (el upstream Niko1221/Strata no lee estos ficheros). El servidor expone API compatible con OpenAI en `/v1` y con Anthropic en `/v1/messages` en `http://127.0.0.1:8080`.
- Descarga adicional: tabla de n-gram de 28,8 GB procedente de un shard de ISTA-DASLab GSQ-RCO.
- Latencia y throughput: 91-102 tok/s de decodificación y 887-1.557 tok/s de lectura de prompt en RTX 3090 a 300 W con PCIe 3.0 y EPYC 7642.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Calidad (KL ROMA) |
|---|---:|---:|---|---|---:|
| Este modelo (S-small, trellis) | 120.320 | 131K-262K | 2 bits trellis | qwen-community-license-1.0 | 0,069-0,074 |
| Mirai S (trellis) | 120.320 | 131K-262K | 2,4 bits media | qwen-community-license-1.0 | 0,040 |
| ISTA-DASLab GSQ-RCO IQ2_XS | 120.320 | no disponible | 2 bits IQ2_XS | no disponible | 0,303 |
| Huihui-Qwen3.8-Flash-Next-abliterated | 120.320 | no disponible | bf16 (checkpoint completo) | qwen-community-license-1.0 | referencia de abliteration |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks frente a modelos de otras familias. La ventaja principal de esta compilación es la relación entre calidad retenida (KL de 0,069-0,074 frente a 0,303 de IQ2_XS) y huella de memoria (33 GiB de pico frente a los requisitos de un checkpoint bf16).

## Limitaciones y advertencias

- El modelo tiene el rechazo suprimido deliberadamente: solo 2 de 146 prompts de ataque filtran una negativa. No es adecuado para despliegues públicos sin salvaguardas externas y su uso conlleva riesgos de generación de contenido dañino.
- La licencia qwen-community-license-1.0 impone restricciones que deben revisarse antes de cualquier uso comercial; el repositorio la etiqueta como "other".
- El motor Strata upstream no puede leer estos ficheros: es obligatorio compilar el fork alesha-pro/Strata desde fuente, lo que añade fricción operativa y dependencia de un fork no oficial.
- Se requiere descargar 28,8 GB adicionales de tabla n-gram desde otro repositorio para el funcionamiento completo.
- La calidad de la cuantización S-small es inferior a la variante S (KL de 0,069-0,074 frente a 0,040; top-1 del 91 % frente al 93,4 %).
- El autor no verificó las métricas de calidad de Mirai ni tomó una dirección de rechazo del propio build, por lo que la abliteration se hereda de un checkpoint externo.
- Con thinking activado, 4 de 24 prompts de AdvBench no terminaron de razonar dentro del presupuesto de 2.500 tokens.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Las mediciones de rendimiento se limitan a RTX 3090; no hay datos para otras GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orz99/Qwen3.8-Flash-Next-S-abliterated-Strata-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización original de Mirai: https://huggingface.co/trymirai/Qwen3.8-Flash-Next-S-strata-experimental
- Variante S-small de Mirai: https://huggingface.co/trymirai/Qwen3.8-Flash-Next-S-small-experimental
- Checkpoint abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Codificador de imagen (mmproj): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor Strata (upstream): https://github.com/Niko1221/Strata
- Fork de Strata usado: https://github.com/alesha-pro/Strata
- Pull request del parche: https://github.com/Niko1221/Strata/pull/3384
- Repositorio GSQ-RCO con el vector: https://huggingface.co/alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF

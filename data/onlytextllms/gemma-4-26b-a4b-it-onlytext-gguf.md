# OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText-GGUF

## Resumen

`OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText-GGUF` es una derivación en formato GGUF del modelo `google/gemma-4-26B-A4B-it`, publicada por el colectivo OnlyTextLLMs. El repositorio no entrena nada nuevo: toma el backbone de texto del modelo original, elimina las modalidades de imagen, audio y vídeo (junto con sus tokens especiales) y publica tres cuantizaciones listas para inferencia local con llama.cpp. El resultado son 25.233.122.334 parámetros totales (25,23B) en tres ficheros de 16,8 GB, 22,6 GB y 26,9 GB, lo que permite ejecutar un modelo MoE de esta talla en hardware de gama alta de consumo.

La relevancia de esta ficha está en dos frentes. Por un lado, ofrece una vía práctica para desplegar un modelo con arquitectura Mixture-of-Experts —128 expertos con top-8, 30 capas, hidden 2816— activando solo unos 3,8B parámetros por token, lo que reduce el coste de cómputo por token frente a un denso de 25B. Por otro lado, la model card es inusualmente transparente: publica la divergencia KL de cada cuantización contra el maestro F16, la tasa de coincidencia en el top-1 token y métricas de prefill y decodificación medidas en una única AMD Radeon AI PRO R9700, algo poco habitual en repositorios de cuantizaciones.

El contexto declarado del modelo base llega a 262.144 tokens y su soporte multilingüe supera los 140 idiomas, aunque esta derivación no declara idiomas en sus metadatos y las pruebas publicadas se hicieron con ventana de 32.768 tokens. Se distribuye bajo licencia Apache 2.0, igual que el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), `Gemma4ForCausalLM`; 30 capas (25 de atención deslizante y 5 de atención completa); hidden 2816; vocabulario 262.137; 128 expertos con top-8 |
| Parámetros totales | 25.233.122.334 (25,23B), dato real de safetensors del modelo base |
| Parámetros activos | Aproximadamente 3,8B por token (dato de terceros sobre el modelo base, no confirmado en la model card de esta derivación) |
| Longitud de contexto | 262.144 tokens según la documentación del modelo base; las pruebas de esta derivación se ejecutaron con `-c 32768` |
| Tipos de cuantización | Q4_K_M (16,8 GB), Q6_K (22,6 GB), Q8_0 (26,9 GB); el maestro F16 ocupa 50,5 GB |
| Idiomas soportados | No disponible en esta derivación; el modelo base declara más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (arquitectura `gemma4`); el repositorio completo ocupa 66,3 GB |
| Modalidades | Solo texto: se eliminan imagen, audio y vídeo, y se recorta el tokenizador a 17 tokens especiales de texto (ids 0-106) |
| Decodificación especulativa | No: el fichero no incluye cabeza draft, por lo que no hay speculative decoding embebido |
| Modelo base | google/gemma-4-26B-A4B-it |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer Mixture-of-Experts con 30 capas, de las cuales 25 usan atención deslizante y 5 atención completa, una proporción que busca abaratar el coste de atención en contextos largos manteniendo un número reducido de capas de atención global. Cada token activa 8 de los 128 expertos disponibles, lo que explica la brecha entre los 25,23B parámetros almacenados y los aproximadamente 3,8B que se computan por token. La dimensión oculta es 2816 y el vocabulario alcanza los 262.137 tokens.

Esta derivación no añade entrenamiento alguno: los pesos son idénticos a los del checkpoint original y solo se han eliminado las modalidades no textuales y sus tokens especiales asociados. La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp (commit `9d286e1b315c`) seguida de `llama-quantize`. El tokenizador resultante conserva 17 tokens especiales de texto, con EOS en el id 1 (`<eos>`) y fin de turno en el id 106 (`<turn|>`). La plantilla de chat mantiene el canal de razonamiento de la familia Gemma, pero deja `enable_thinking` en falso por defecto, de modo que el modelo responde directamente salvo que se active explícitamente.

La model card documenta además un dato relevante sobre la fidelidad de la conversión: comparando los logits de este fichero con los del checkpoint original en la misma precisión sobre 1533 tokens, ambos coinciden en el token top-1 en el 86,2% de las posiciones con una KLD mediana de 0,009. El autor atribuye esa diferencia a la implementación (llama.cpp frente a transformers) y no a la cuantización, señalando que en un corpus fuera de distribución para un modelo instruct el top-1 queda casi empatado en muchas posiciones y cualquier diferencia numérica lo altera.

## Capacidades

- Generación de texto conversacional de un solo turno y multi-turno, con plantilla de chat propia de la familia Gemma.
- Razonamiento en modo thinking: la plantilla soporta el canal de pensamiento y se activa pasando `{"chat_template_kwargs": {"enable_thinking": true}}` en la API del servidor.
- Generación de código y tareas de razonamiento, capacidades heredadas del modelo base instruido.
- Function calling nativo y salida estructurada, según la documentación de terceros consultada sobre `google/gemma-4-26B-A4B-it`.
- Capacidades multilingües del modelo base (más de 140 idiomas); esta derivación no declara una lista propia de idiomas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` y el uso de `llama-server` permiten exponerlo como API compatible con OpenAI.
- Capacidad de proceso por lotes y contexto largo, con ventanas de hasta 262.144 tokens teóricos según el modelo base (32.768 en las pruebas publicadas).
- Sin capacidades de visión, audio ni vídeo: son precisamente las que se han eliminado en esta derivación.
- Sin decodificación especulativa embebida: al no incluir cabeza draft, toda la generación es decodificación plana.

## Casos de uso

- Asistente conversacional autoalojado: desplegado con `llama-server`, ofrece una API compatible con OpenAI sobre pesos Apache 2.0, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente y sin depender de un proveedor externo.
- Procesamiento de documentos largos en lote: con una ventana configurable de 32.768 tokens o superior, el modelo puede resumir, extraer entidades o clasificar contratos, informes e incidencias extensas sin trocear el documento en fragmentos que rompan la coherencia.
- Agentes con llamada a herramientas: el soporte de function calling del modelo base permite construir flujos de varios pasos donde el modelo decide qué herramienta invocar (consulta a base de datos, API interna, calculadora) y encadena el resultado.
- Generación y revisión de código en pipelines de CI: integrado como paso previo al merge, puede revisar diffs, proponer tests o generar documentación técnica, con el coste controlado que implica activar solo ~3,8B parámetros por token.
- Atención al cliente en sectores regulados: la combinación de licencia Apache 2.0 y ejecución en infraestructura propia encaja en organizaciones que no pueden enviar datos de clientes a APIs de terceros.
- Razonamiento asistido con coste de latencia asumible: activando el modo thinking se obtienen respuestas con cadena de razonamiento previa para problemas matemáticos, lógicos o de planificación donde la respuesta directa falla.
- Evaluación comparativa de cuantizaciones: los datos de KLD y de coincidencia top-1 publicados convierten este repositorio en un banco de pruebas útil para decidir cuánta degradación se acepta en función del presupuesto de VRAM y de latencia.
- Despliegue en estaciones de trabajo con una sola GPU: el fichero Q4_K_M de 16,8 GB cabe en tarjetas de 24 GB, lo que habilita prototipado e inferencia local sin clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La model card indica explícitamente que no cita líneas base publicadas para este tamaño y que las cifras que ofrece son propias.

Rendimiento medido el 2026-09-24 en una única AMD Radeon AI PRO R9700 (gfx1201, 34 GB) con llama.cpp `9d286e1b315c` (compilación HIP/ROCm, ROCm 7.14, `-c 32768 -fa on`):

| Cuantización | Dispositivo | Prefill t/s (PP512) | Generación t/s en chat | Generación t/s (llama-bench TG128) |
|---|---|---|---|---|
| Q4_K_M | 1x R9700 | 2585 | 83,1 | 93,6 |
| Q6_K | 1x R9700 | 2071 | 80,0 | 87,5 |
| Q8_0 | 1x R9700 | 2774 | 75,0 | 82,1 |

El autor advierte de que las dos columnas de decodificación no son comparables entre sí: la de chat usa la plantilla de conversación y un prompt de unos 90 tokens, mientras que TG128 es una generación desnuda de 128 tokens.

Daño de cuantización frente al maestro F16, medido con `llama-perplexity --kl-divergence` (contexto 1024, 40 ventanas, 20.440 tokens puntuados):

| Cuantización | KLD media | KLD mediana | Mismo top-1 | KLD máxima |
|---|---|---|---|---|
| Q4_K_M | 3,1975 | 1,5861 | 45,42% | 45,66 |
| Q6_K | 1,1702 | 0,1979 | 68,00% | 36,12 |
| Q8_0 | 0,8199 | 0,0890 | 73,17% | 30,30 |

El autor subraya que Q4_K_M no es intercambiable con las otras dos: cambia el token top-1 en el 54,6% de las posiciones, frente al 26,8% de Q8_0, y recomienda elegir por la columna de coincidencia top-1 y no por tamaño. La cuantización cuesta además 7,0 puntos de coincidencia top-1 respecto a la comparación sin cuantizar (Q8_0 obtiene 79,2% medida del mismo modo).

## Requisitos de hardware

- VRAM estimada: Q4_K_M unos 16,8 GB de pesos; Q6_K unos 22,6 GB; Q8_0 unos 26,9 GB; el maestro F16 requiere 50,5 GB y no cabe en una tarjeta de 32 GB.
- GPU de gama alta de consumo: Q4_K_M cabe en RTX 3090, RTX 4090, RTX 5090 y similares con 24 GB o más, dejando margen limitado para caché KV según la ventana configurada.
- GPU profesionales: el Q8_0 exige tarjetas de 32 GB o más (A100 40 GB, H100, Radeon AI PRO R9700 de 34 GB). El F16 necesita reparto entre dos tarjetas de 32 GB.
- Comportamiento multi-GPU: llama.cpp reparte capas automáticamente (`--split-mode layer` es el valor por defecto); basta con no fijar las variables `*_VISIBLE_DEVICES`. Forzar una sola tarjeta con el F16 provoca desbordamiento a CPU, numéricamente equivalente (99,87% de coincidencia top-1, KLD media 0,000045) pero aproximadamente 22 veces más lento.
- Opciones de despliegue: `llama-server` para una API compatible con OpenAI, `llama-cli` para chat de un solo turno, `llama-bench` y `llama-perplexity` para medición. Se requiere una compilación de llama.cpp que reconozca la arquitectura `gemma4`. Otros envoltorios basados en llama.cpp (Ollama, LM Studio, KoboldCpp) dependerán de la versión de llama.cpp que incorporen.
- Latencia y throughput: en la configuración medida, la generación ronda los 75-93 t/s según cuantización y tipo de prueba, con prefill de 2071-2774 t/s para 512 tokens. Como referencia derivada, 256 tokens a 83,1 t/s implican aproximadamente 3,1 s de decodificación, sin contar el prefill.
- Precisión numérica: el rendimiento reportado procede de una sola GPU AMD con ROCm 7.14; no se publican mediciones en CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText-GGUF (esta ficha) | 25,23B totales, ~3,8B activos | 262.144 según el base; 32.768 en las pruebas | Solo texto | Apache 2.0 | GGUF en Q4_K_M, Q6_K y Q8_0 |
| google/gemma-4-26B-A4B-it (modelo base) | 25,23B totales, MoE top-8 de 128 expertos | 262.144 tokens | Texto e imagen (entrada), salida de texto | Apache 2.0 | Pesos originales en HuggingFace y API de pago |
| OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText (derivación sin cuantizar) | 25,23B totales | No disponible | Solo texto | Apache 2.0 | Pesos sin cuantizar, referenciados por la model card |
| unsloth/gemma-4-26B-A4B-it-GGUF | No disponible | No disponible | Imagen-texto a texto | Apache 2.0 | GGUF, incluye fichero `mtp-gemma-4-26B-A4B-it.gguf` con cabeza de decodificación especulativa |

Diferencias relevantes: frente al modelo base, esta derivación pierde la entrada de imagen y gana en simplicidad de despliegue y tamaño reducido. Frente a la cuantización de Unsloth, la diferencia principal documentada es la presencia de un fichero con cabeza MTP que habilita decodificación especulativa, ausente aquí. No se dispone de datos de rendimiento comparables entre ambas publicaciones, porque este repositorio no cita líneas base de terceros y mide únicamente sobre ROCm.

## Limitaciones y advertencias

- Degradación notable en Q4_K_M: cambia el token top-1 en el 54,6% de las posiciones respecto al maestro F16. Para tareas sensibles a la elección exacta del token (extracción de datos, código con sintaxis estricta, cálculos) conviene usar Q6_K o Q8_0.
- Las cifras de rendimiento provienen de una única GPU AMD con ROCm 7.14 y `-fa on`; no hay mediciones publicadas en CUDA, Apple Silicon ni CPU, por lo que extrapolar esos números a otras plataformas es arriesgado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta y lo publica un colectivo de terceros, no Google. No hay validación externa de la conversión ni de las cuantizaciones más allá de los datos del propio autor.
- Requiere una compilación reciente de llama.cpp que reconozca la arquitectura `gemma4`; versiones anteriores fallarán al cargar el fichero.
- Sin cabeza draft: no hay decodificación especulativa embebida, de modo que la latencia de decodificación es la del modelo completo con parámetros activos.
- Modelo solo texto: cualquier caso de uso que requiera entrada de imagen, audio o vídeo queda fuera de alcance, aunque el modelo base sí las soporte.
- El autor reconoce que la comparación contra el checkpoint original arroja solo un 86,2% de coincidencia top-1 con KLD mediana de 0,009, atribuido a diferencias entre implementaciones. En tareas donde el top-1 es determinante, esa discrepancia de implementación puede confundirse con un fallo de calidad del modelo.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad, sesgo ni seguridad específicas para esta derivación, y la model card no incluye ninguna sección de sesgos o alineación. Se aplican las consideraciones del modelo base, no documentadas aquí.
- Limitaciones de idioma: esta derivación no declara idiomas soportados; conviene validar el comportamiento en castellano antes de llevarla a producción, pese a que el modelo base anuncia más de 140 idiomas.
- El modo thinking está desactivado por defecto, de forma que sin pasar `enable_thinking: true` no se obtiene razonamiento previo. Las respuestas directas pueden ser peores en tareas que se beneficien de la cadena de pensamiento.
- Licencia Apache 2.0, permisiva y compatible con uso comercial, pero el uso queda sujeto a las condiciones que Google aplique al modelo base (política de uso aceptable de Gemma), que no se detallan en esta model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText-GGUF
- Derivación sin cuantizar: https://huggingface.co/OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Página de la familia Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación del modelo en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Ficha de terceros con datos de parámetros activos, contexto y precios de API: https://aimodelradar.app/models/gemma-4-26b-a4b-it
- Cuantizaciones alternativas de Unsloth, con fichero MTP: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Fichero con cabeza de decodificación especulativa de Unsloth: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF/blob/main/mtp-gemma-4-26B-A4B-it.gguf
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

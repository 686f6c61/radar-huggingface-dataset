# Menterium/translategemma-12b-it-GGUF

## Resumen

TranslateGemma 12B en formato GGUF es una compilación cuantizada del componente de texto de google/translategemma-12b-it, el modelo de traducción especializado de Google derivado de la familia Gemma 3. La publica Menterium (Menterium IT Solutions GmbH) para ejecutar traducción completamente offline con llama.cpp y clientes compatibles. El repositorio contiene un único fichero Q4_K_M de 7,30 GB pensado para GPUs con 10 GB de VRAM o más.

El modelo conserva los 11.766.034.176 parámetros del decodificador de texto original, pero descarta la torre de visión del checkpoint multimodal, de modo que solo procesa texto. Frente a servir el modelo en bf16 o convertir a ONNX int4, esta build reduce el peso a algo menos de la mitad y, según el autor, se queda en 81,5 chrF respecto a la referencia ONNX int4 en un test interno de 74 frases.

Su interés práctico es directo: permite traducción local en 55 idiomas (la metadata del repo declara ocho) sin enviar texto a la nube, con latencias de unos 0,2 s por frase corta en una RTX 5070 Ti y un consumo de unos 8,7 GB de VRAM. La licencia es la Gemma Terms of Use, con las restricciones de la Gemma Prohibited Use Policy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), denso |
| Parametros totales | 11.766.034.176 (11,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; ventana deslizante de 1024 tokens tomada de `config.json` sin modificar |
| Tipos de cuantizacion | Q4_K_M (unico fichero del repo); existen builds de terceros en Q5_K_S y otras cuantizaciones |
| Idiomas soportados | 55 idiomas en el modelo base; la metadata de este repo declara de, en, es, fr, it, pt, nl, pl |
| Licencia | Gemma Terms of Use + Gemma Prohibited Use Policy |
| Formato de pesos | GGUF (llama.cpp), tensores de salida y embedding tambien cuantizados |
| Modelo base | google/translategemma-12b-it |
| Tamano del fichero | 7,30 GB (`translategemma-12b-it-Q4_K_M.gguf`) |
| SHA-256 | `a855e476cec53780a861c34a870b59abf0b8656133448eec868d78ffdc11d7c2` |
| Version de llama.cpp usada | b10221 (commit `815a2a5`, 2026-08-01), `convert_hf_to_gguf.py` sobre el checkpoint multimodal (commit `d1b225e`) |
| Pipeline | translation (conversational, endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo subyacente es un Transformer decoder-only de la familia Gemma 3, en variante densa de 12B, especializado en traducción. La conversión a GGUF se hizo con `convert_hf_to_gguf.py` sobre el checkpoint multimodal completo, pero el script escribe únicamente el decodificador de texto: la torre de visión no se incluye en el fichero. La salida intermedia fue bf16 y después se aplicó `llama-quantize` con ajustes por defecto, cuantizando también los tensores de salida y de embedding.

Se preservan sin cambios desde `config.json` la ventana deslizante de 1024 tokens y los dos embeddings rotatorios; llama.cpp aplica la ventana por sí mismo, de modo que textos largos pueden traducirse en una sola pasada. Los pesos no se modificaron más allá del recorte de la torre visual, la conversión de formato y la cuantización. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF/DPO del modelo original de Google.

## Capacidades

- Traducción de texto entre 55 idiomas según el modelo base; la metadata del repo declara alemán, inglés, español, francés, italiano, portugués, neerlandés y polaco.
- Seguimiento de instrucciones de traducción con formato de prompt Gemma (`<start_of_turn>user` / `<start_of_turn>model`), incluyendo instrucciones del tipo «responde solo con la traducción».
- Traducción de textos largos en una sola pasada gracias a la ventana deslizante de 1024 tokens aplicada por llama.cpp.
- Ejecución completamente offline en local, sin llamadas a API externas.
- Naturaleza conversacional multi-turno heredada del checkpoint `-it`, aunque el caso de uso previsto es la traducción puntual.
- No incluye visión: la torre multimodal fue descartada en la conversión.
- No hay soporte documentado de tool calling, function calling, agentes ni modo de razonamiento explícito.
- No hay soporte de audio documentado.

## Casos de uso

- Traducción offline de escritorio: es el escenario para el que se construyó la build, dentro de la aplicación Celerando; al caber en unos 8,7 GB de VRAM permite traducir documentos localmente sin conexión.
- Localización de documentación técnica en CI/CD: el GGUF puede invocarse desde llama.cpp en un job que traduzca ficheros Markdown o recursos i18n antes de publicar, con la ventaja de que el texto no sale de la infraestructura.
- Atención al cliente multilingüe on-premise: para organizaciones que no pueden enviar conversaciones a la nube, el modelo traduce mensajes entrantes y respuestas en ocho idiomas declarados con latencias de décimas de segundo por frase.
- Traducción por lotes de corpus para investigación: al no depender de API, se pueden procesar miles de frases sin coste por token ni límites de cuota, controlando la reproducibilidad con decodificación greedy y `repetition penalty` fija.
- Integración en editores y CLI: clientes basados en llama.cpp (Ollama, LM Studio, koboldcpp) permiten exponer el modelo como servicio local para plugins de editor, hooks de `pre-commit` o scripts de traducción de mensajes de commit.
- Sectores regulados (sanidad, legal, administración pública): la combinación de licencia Gemma, ejecución local y ausencia de telemetría propia encaja con requisitos de residencia de datos, siempre que se respete la Prohibited Use Policy.
- Traducción de subtítulos y transcripciones: el modelo trabaja solo con texto, pero puede encadenarse tras un ASR para traducir transcripciones sin salir del entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WMT) en la información disponible. El autor solo reporta métricas internas de traducción:

| Metrica | Resultado | Contexto |
|---|---|---|
| chrF frente a la build ONNX int4 del mismo modelo | 81,5 | 74 frases de test, decodificación greedy, repetition penalty 1.1 |
| Traducciones idénticas a la build ONNX int4 | 34 de 74 | mismo test |
| chrF de TranslateGemma 4B Q8_0 en el mismo test | 73,2 | referencia comparativa del autor |
| Latencia por frase corta | ~0,2 s | RTX 5070 Ti, backend Vulkan |
| VRAM ocupada | ~8,7 GB | RTX 5070 Ti, backend Vulkan |

## Requisitos de hardware

- VRAM estimada: unos 8,7 GB en la RTX 5070 Ti medida por el autor; el fichero en disco pesa 7,30 GB.
- GPU recomendadas por el autor: tarjetas con 10 GB de VRAM o más para Q4_K_M.
- Cabe en GPU de consumo: RTX 3080 10 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090 y RTX 5070 Ti. En tarjetas de 8 GB no entra con holgura y requeriría offload parcial a CPU.
- Despliegue: llama.cpp versión b10221 o superior y cualquier cliente construido sobre llama.cpp (Ollama, LM Studio, koboldcpp). No hay soporte verificado de vLLM ni TGI para este GGUF concreto en la información disponible.
- Latencia: aproximadamente 0,2 s por frase corta en RTX 5070 Ti con Vulkan. Throughput agregado (tokens/s) no disponible.
- Ejecución solo en CPU: posible con llama.cpp, sin datos publicados de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Menterium/translategemma-12b-it-GGUF (este) | 11,77 B | no disponible (ventana deslizante 1024) | GGUF Q4_K_M, 7,30 GB | Gemma | ~8,7 GB VRAM; chrF 81,5 frente a ONNX int4 |
| google/translategemma-12b-it | 11,77 B | no disponible | safetensors bf16, multimodal | Gemma | Modelo original de Google; incluye torre de visión; mayor peso y VRAM |
| mradermacher/translategemma-12b-it-GGUF | 11,77 B | no disponible | GGUF, varias cuantizaciones | Gemma | 33,5k descargas y 21 likes según la búsqueda; alternativas de cuantización |
| NikolayKozloff/translategemma-12b-it-Q5_K_S-GGUF | 11,77 B | no disponible | GGUF Q5_K_S | Gemma | 54 descargas; mayor precisión teórica a costa de más VRAM |
| TranslateGemma 4B Q8_0 | ~4 B | no disponible | GGUF Q8_0 | Gemma | chrF 73,2 en el mismo test interno; menor huella, peor calidad |

## Limitaciones y advertencias

- Solo texto: la torre de visión del checkpoint original se ha eliminado, así que no puede procesar imágenes pese a que el modelo base sea multimodal.
- La cuantización Q4_K_M introduce pérdida de calidad: en el test del autor se desvía de la build ONNX int4 en 40 de 74 frases y obtiene 81,5 chrF frente a ella.
- El test de calidad son 74 frases internas, sin publicación de metodología completa ni evaluación en WMT; la evidencia de calidad es limitada.
- No se documentan sesgos lingüísticos, de género ni culturales del modelo base ni de esta cuantización.
- Riesgo de alucinación y de respuestas conversacionales no deseadas; el prompt recomendado incluye «Reply with ONLY the translation» para mitigarlo.
- La longitud de contexto no está documentada; la ventana deslizante de 1024 tokens condiciona el comportamiento en textos muy largos.
- La metadata declara ocho idiomas, aunque el modelo base anuncia 55: la cobertura real por idioma no está verificada en esta build.
- Licencia Gemma Terms of Use con Gemma Prohibited Use Policy, que se aplica a cada usuario posterior y a cualquier redistribución; los derechos del modelo subyacente siguen siendo de Google.
- El repositorio no incluye evaluaciones de seguridad, red teaming ni pruebas de robustez por parte del autor de la cuantización.
- Al ser un modelo especializado en traducción, no es adecuado como modelo de propósito general para código, matemáticas o razonamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Menterium/translategemma-12b-it-GGUF
- Modelo base: https://huggingface.co/google/translategemma-12b-it
- Otras cuantizaciones del modelo base: https://huggingface.co/models?other=base_model%3Aquantized%3Agoogle%2Ftranslategemma-12b-it
- Build de mradermacher: https://huggingface.co/mradermacher/translategemma-12b-it-GGUF
- Build Q5_K_S de NikolayKozloff: https://huggingface.co/NikolayKozloff/translategemma-12b-it-Q5_K_S-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Celerando (Menterium): https://celerando.menterium.com

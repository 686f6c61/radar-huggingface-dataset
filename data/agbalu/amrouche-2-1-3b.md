# agbalu/Amrouche-2-1.3B

## Resumen

Amrouche-2-1.3B es un modelo de traducción automática bidireccional especializado en cabilio (taqbaylit, `kab_Latn`), inglés, francés y árabe estándar moderno, desarrollado por el usuario agbalu. Se trata de un ajuste fino de `facebook/nllb-200-distilled-1.3B` sobre 544.965 pares de frases paralelas verificadas del corpus AƔBALU, con un total de 1.370.638.336 parámetros. El modelo resuelve el problema de la baja calidad de traducción hacia y desde una lengua de bajos recursos como el cabilio, mejorando a su modelo base en las seis direcciones evaluadas.

La relevancia actual del modelo radica en que conserva la tabla de embeddings completa de 256.206 tokens del vocabulario SentencePiece original, a diferencia de su predecesor Amrouche-1.3B, que la recortó a 52.209 tokens. Esta decisión elimina las sustituciones `<unk>` en entidades nombradas y préstamos léxicos no vistos, y mantiene la compatibilidad directa con `M2M100ForConditionalGeneration`, CTranslate2 y ONNX.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y un tamaño de repositorio de 2,8 GB. Está pensado para entornos de investigación y producción que necesiten traducción de calidad entre cabilio y las tres lenguas puente indicadas, con especial énfasis en la generación hacia cabilio, donde se concentran las mayores ganancias respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M100 / NLLB-200 distilled) |
| Parametros totales | 1.370.638.336 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (via CTranslate2); BF16 en el modelo base de referencia |
| Idiomas soportados | kab (cabilio), en (ingles), fr (frances), ar (arabe estandar moderno) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); CTranslate2 int8 disponible en release aparte |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura M2M100 de tipo transformer encoder-decoder, heredada de `facebook/nllb-200-distilled-1.3B`. Se trata de un modelo denso de 1.370.638.336 parámetros con vocabulario SentencePiece completo de 256.206 tokens, lo que permite mantener la compatibilidad con las clases `M2M100ForConditionalGeneration` de la librería transformers y con los runtimes CTranslate2 y ONNX.

El ajuste fino se realizó sobre 544.965 pares de frases paralelas verificadas del corpus AƔBALU, que constituye el material que NLLB no había minado por sí mismo. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni sobre si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la retención del vocabulario completo, que evita las sustituciones `<unk>` y reduce la brecha ortográfica: el modelo alcanza una brecha ortográfica de 0,00 chrF++ en `eng → kab` y `fra → kab`, frente a los +0,17 y +0,19 del modelo base respectivamente.

## Capacidades

- Traducción automática bidireccional entre cabilio y inglés, francés y árabe estándar moderno (seis direcciones evaluadas).
- Generación de texto hacia cabilio con corrección de errores morfológicos y de concordancia respecto al modelo base.
- Manejo de entidades nombradas y préstamos léxicos sin sustituciones `<unk>` gracias al vocabulario completo de 256.206 tokens.
- Compatibilidad con `M2M100ForConditionalGeneration`, CTranslate2 y ONNX.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada a los cuatro idiomas indicados (kab, en, fr, ar).

## Casos de uso

- Traducción de documentación administrativa y legal al cabilio: el modelo genera cabilio con mayor corrección morfológica que el modelo base (+3,73 chrF++ en `eng → kab`), adecuado para digitalizar materiales públicos en taqbaylit.
- Localización de interfaces y contenidos web: la dirección `fra → kab` mejora +3,32 chrF++ respecto a NLLB-1.3B, lo que lo hace útil para traducir menús, avisos y textos de producto al cabilio.
- Subtitulado y transcripción bilingüe: la dirección `kab → eng` alcanza 47,78 chrF++ y 25,81 BLEU, suficiente para generar subtítulos en inglés a partir de audio transcrito en cabilio.
- Atención al ciudadano en árabe y cabilio: la incorporación del árabe estándar moderno en ambas direcciones (+3,44 chrF++ en `arb → kab`) permite atender consultas en contextos bilingües Argelia-Marruecos.
- Investigación lingüística sobre lenguas bereberes: el corpus AƔBALU y las métricas publicadas permiten reproducir experimentos y comparar variantes ortográficas con el normalizador versionado `1.3.0+rules1.0.0`.
- Despliegue en CPU de alto rendimiento: la release `Amrouche-2-1.3B-CT2-int8` ofrece 205,6 ms de latencia por frase en CPU con una pérdida de solo -0,14 chrF++, apta para servicios de traducción por lotes sin GPU.
- Traducción de contenidos editoriales y literarios del francés al cabilio: la retención del vocabulario completo reduce los fallos en nombres propios y términos culturales, un problema frecuente en textos literarios.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre FLORES+ `devtest` (1.012 frases por dirección), con `sacrebleu` (chrF++ con orden de palabra 2 y BLEU con tokenización `13a`) frente a la referencia `kab_Latn` corregida ortográficamente. Los valores no están verificados de forma independiente (`verified: false`).

| Direccion | chrF++ (Base → Amrouche-2-1.3B) | BLEU (Base → Amrouche-2-1.3B) | Ganancia relativa BLEU |
|---|---|---|---|
| kab → eng | 44,60 → **47,78** (+3,18) | 23,06 → **25,81** | +11,9% |
| kab → fra | 42,00 → **44,64** (+2,64) | 19,46 → **21,68** | +11,4% |
| eng → kab | 31,53 → **35,26** (+3,73) | 7,74 → **9,90** | +27,9% |
| kab → arb | 33,78 → **34,98** (+1,20) | 9,64 → **10,19** | +5,7% |
| fra → kab | 30,21 → **33,53** (+3,32) | 6,33 → **7,65** | +20,9% |
| arb → kab | 29,69 → **33,13** (+3,44) | 6,24 → **7,54** | +20,8% |
| Macro 6 direcciones | 35,30 → **38,22** (+2,92) | 12,08 → **13,80** | +14,2% |

En el split de test gold reservado (868 pares de frases), el modelo alcanza 52,31 chrF++ macro y 31,99 BLEU macro. La brecha ortográfica (`eng → kab` y `fra → kab`) se reduce a 0,00 chrF++ frente a +0,17 y +0,19 del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,8 GB solo para pesos, más memoria para activaciones y caché; en la práctica, entre 4 y 6 GB según longitud de secuencia y batch.
- VRAM estimada en int8 (CTranslate2): alrededor de 1,38 GB para pesos, desplegable en GPUs de gama baja.
- GPU recomendadas: A100, H100 o L4 para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4070 para inferencia en BF16.
- Cabe en GPUs de consumo: sí, en cualquier GPU con 6 GB o más de VRAM en BF16; en int8 puede ejecutarse en iGPU y CPU.
- Opciones de despliegue: transformers (`M2M100ForConditionalGeneration`), CTranslate2 (releases int8 oficiales), ONNX Runtime; no se ha documentado soporte nativo en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 205,6 ms por frase en CPU con la release int8 (7,1× de aceleración sobre PyTorch) y 155,0 ms para la variante de 600M; no se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | chrF++ macro (FLORES+ devtest) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Amrouche-2-1.3B | 1.370.638.336 | No disponible | kab, en, fr, ar | 38,22 | Apache 2.0 | Hugging Face (safetensors, CT2 int8) |
| NLLB-200-distilled-1.3B (base) | ~1,3B | No disponible | 200 idiomas | 35,30 (en las 6 direcciones evaluadas) | CC-BY-NC 4.0 | Hugging Face |
| Amrouche-1.3B | ~1,3B (vocabulario recortado a 52.209) | No disponible | kab, en, fr | 46,25 en `kab → eng`; sin macro publicado | Apache 2.0 | Hugging Face |
| Amrouche-2-600M | 615M | No disponible | kab, en, fr, ar | No disponible | Apache 2.0 | Hugging Face (safetensors, CT2 int8) |

## Limitaciones y advertencias

- Los benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no se han validado de forma independiente.
- El modelo solo cubre cuatro idiomas (kab, en, fr, ar); no es un traductor multilingüe general y no debe usarse fuera de ese par de lenguas.
- No se ha documentado la longitud de contexto soportada; las frases largas o documentos completos pueden degradar la calidad.
- Riesgo de alucinación y de traducciones literales en dominios especializados (técnico, legal, médico) no representados en el corpus AƔBALU.
- La calidad hacia cabilio depende de la ortografía de entrada; el autor reporta un 16,2% de corrupción por homóglifos en el split FLORES+ `kab_Latn` original, por lo que se recomienda aplicar el normalizador `1.3.0+rules1.0.0` antes de evaluar o desplegar.
- No se dispone de información sobre sesgos demográficos o culturales del corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base NLLB-200-distilled-1.3B está bajo CC-BY-NC 4.0; conviene revisar la compatibilidad de licencias antes de un despliegue comercial.
- El modelo no soporta tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado como backend de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Amrouche-2-1.3B
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Predecesor: https://huggingface.co/agbalu/Amrouche-1.3B
- Variante ligera: https://huggingface.co/agbalu/Amrouche-2-600M
- Release int8 1.3B: https://huggingface.co/agbalu/Amrouche-2-1.3B-CT2-int8
- Release int8 600M: https://huggingface.co/agbalu/Amrouche-2-600M-CT2-int8
- Repositorio GitHub del proyecto AƔBALU: https://github.com/abderahmane-ai/agbalu/tree/main

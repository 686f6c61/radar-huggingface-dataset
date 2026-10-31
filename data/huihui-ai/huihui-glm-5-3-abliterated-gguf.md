# huihui-ai/Huihui-GLM-5.3-abliterated-GGUF

## Resumen

Huihui-GLM-5.3-abliterated-GGUF es una versión "abliterada" (sin filtros de seguridad) del modelo GLM-5.3 de zai-org, publicada por huihui-ai en formato GGUF. La abliteración es una técnica que elimina las direcciones de rechazo en el espacio de activaciones del modelo, permitiendo que genere contenido que el modelo original se negaría a producir, sin necesidad de reentrenamiento. En este caso, la ablación se ha realizado directamente sobre pesos GGUF usando la herramienta cvector-generator de llama.cpp, sin depender de Transformers.

El modelo base, GLM-5.3, cuenta con aproximadamente 9.135 millones de parámetros según los metadatos de safetensors del repositorio, y todo apunta a una arquitectura de tipo mixture-of-experts (MoE), dado que los parches de ablación distinguen entre pesos de expertos compartidos (ffn_down_shexp) y expertos individuales (ffn_down_exps). El modelo soporta inglés y chino.

Su relevancia radica en el enfoque de distribución: en lugar de publicar los pesos cuantizados completos, huihui-ai ofrece parches Q2 que se aplican sobre las cuantizaciones Unsloth Dynamic del modelo base (UD-IQ1_M, UD-IQ1_S, UD-IQ2_M y UD-Q2_K_XL), lo que ahorra espacio de almacenamiento y permite al usuario controlar qué capas y qué expertos se ablatin mediante los parámetros --start-layer, --end-layer y --ablate-experts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (aparentemente MoE, por la presencia de pesos ffn_down_shexp y ffn_down_exps) |
| Parametros totales | 9.135.194.112 (~9,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Parches Q2 compatibles con UD-IQ1_M, UD-IQ1_S, UD-IQ2_M y UD-Q2_K_XL (cuantizaciones Unsloth Dynamic del modelo base) |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (parches de ablación sobre cuantizaciones GGUF de unsloth/GLM-5.3-GGUF) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 de zai-org es un transformer del que no se han detallado en la información disponible la longitud de contexto, el número de tokens de entrenamiento ni la composición del dataset. Sin embargo, la estructura de los parches de ablación revela detalles arquitectónicos relevantes: la existencia de tensores ffn_down_shexp (experto compartido) y ffn_down_exps (expertos individuales) indica una arquitectura mixture-of-experts, donde cada capa posee un FFN compartido además de múltiples expertos. Esto explica también el tamaño del parche completo con ablación de expertos (102,23 GB), considerablemente mayor que el repositorio base de 6,5 GB.

Sobre el entrenamiento del modelo original no hay datos publicados en la información proporcionada (tokens, RLHF/DPO, etc.). Lo distintivo de esta ficha es el proceso de abliteración: se ha realizado íntegramente sobre pesos GGUF mediante la herramienta cvector-generator de llama.cpp, que calcula vectores de dirección de rechazo y los resta de las activaciones en las capas seleccionadas. El usuario puede aplicar el parche de forma selectiva: elegir el rango de capas a ablatar (--start-layer, --end-layer) y decidir si se ablatin también los expertos (--ablate-experts con valores 0, 1 o 2, que corresponden a mayor cobertura y menor número de advertencias de rechazo residual).

## Capacidades

- Generacion de texto en inglés y chino, heredada del modelo base GLM-5.3.
- Respuesta sin filtros de seguridad: el modelo no emite rechazos habituales, lo que permite explorar contenidos que el modelo original bloquearía (uso recomendado solo en entornos controlados).
- Ablación configurable: el usuario puede graduar la intensidad de la ablación por capas y por expertos, ajustando el equilibrio entre ausencia de rechazos y degradación de calidad.
- Compatibilidad con el ecosistema llama.cpp al tratarse de pesos GGUF parcheados sobre cuantizaciones Unsloth Dynamic.
- No hay información disponible sobre tool calling, capacidades de visión, audio ni modo de razonamiento explícito para esta variante.

## Casos de uso

- Investigacion en alineacion y seguridad: estudiar cómo la abliteración afecta al comportamiento del modelo, comparando tasas de rechazo entre el original y la versión ablatada en distintos rangos de capas.
- Red teaming de LLMs: probar jailbreaks y ataques adversariales contra un modelo sin filtros para entender superficies de ataque, útil para equipos de seguridad que evalúan robustez de sistemas en producción.
- Analisis de mecanica interpretability: los vectores de dirección de rechazo generados por cvector-generator permiten investigar cómo se codifican los rechazos en las activaciones de un modelo MoE.
- Generacion de contenido creativo sin restricciones: escritura de ficción con temáticas maduras o conflictivas donde los filtros estándar interrumpen la generación, en entornos privados y controlados.
- Pruebas de degradacion por cuantizacion extrema: evaluar cómo interactúan cuantizaciones muy agresivas (IQ1/IQ2) con la abliteración, dado que los parches se aplican sobre cuantizaciones Unsloth de 1-2 bits.
- Comparacion de estrategias de ablacion en MoE: el parámetro --ablate-experts permite experimentar si ablatar solo la atención y el experto compartido basta, o si es necesario ablatar los expertos individuales, un dato valioso para la comunidad de abliteration.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ten en cuenta, además, que la abliteración y las cuantizaciones extremas (1-2 bits) pueden degradar el rendimiento respecto al modelo base GLM-5.3.

## Requisitos de hardware

- El parche Huihui-GLM-5.3-abliterated-GGUF-patch-Q2-1 ocupa 6,45 GB y se aplica sobre cuantizaciones UD-IQ1_M, UD-IQ1_S, UD-IQ2_M o UD-Q2_K_XL; el parche patch-Q2-2 ocupa 102,23 GB y añade ablación de expertos individuales.
- Con cuantizaciones de 1-2 bits sobre un modelo de ~9,14 B de parámetros totales, es plausible que el modelo final quepa en GPUs de consumo (por ejemplo, una RTX 3060 de 12 GB o una RTX 4090 de 24 GB) o incluso en CPU con RAM suficiente, aunque el tamaño exacto del modelo resultante depende de la cuantización Unsloth elegida (no disponible).
- Despliegue recomendado: llama.cpp, que es la herramienta con la que se generaron y deben aplicarse los parches. Ollama (basado en llama.cpp) debería funcionar con el GGUF resultante; no hay información sobre compatibilidad con vLLM o TGI para GGUF parcheado.
- No hay datos publicados de latencia ni throughput para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Particularidad |
|---|---|---|---|---|
| huihui-ai/Huihui-GLM-5.3-abliterated-GGUF | ~9,14 B (totales) | Parches Q2 sobre UD-IQ1/UD-Q2_K_XL | MIT | Ablación configurable por capas y expertos, distribuida como parche |
| zai-org/GLM-5.3 (modelo base) | ~9,14 B (totales) | no disponible | no disponible | Modelo original con filtros de seguridad intactos |
| unsloth/GLM-5.3-GGUF | ~9,14 B (totales) | UD-IQ1_M a UD-Q2_K_XL | no disponible | Cuantizaciones Unsloth Dynamic sin abliterar, base sobre la que se aplican los parches |

Otras variantes abliteradas de huihui-ai siguen el mismo patrón (abliteración sobre GGUF con cvector-generator), pero no hay datos suficientes en la información proporcionada para una comparativa más amplia.

## Limitaciones y advertencias

- Riesgo de contenidos sensibles: los filtros de seguridad están significativamente reducidos, por lo que el modelo puede generar contenido ofensivo, controvertido o inapropiado. Revisa siempre las salidas.
- No apto para todos los publicos: no recomendado para entornos públicos, menores de edad ni aplicaciones que exijan alta seguridad.
- Responsabilidad legal y etica: el usuario es el único responsable de que el uso cumpla la legislación local y las normas éticas; huihui.ai declina cualquier responsabilidad por las consecuencias.
- Uso experimental: se recomienda restringirlo a investigación, pruebas o entornos controlados; no es adecuado para producción ni para aplicaciones comerciales de cara al público.
- Degradacion de calidad: la abliteración puede introducir rechazos residuales (según el valor de --ablate-experts) o, en el extremo opuesto, degradar la coherencia del modelo; combinarla con cuantizaciones de 1-2 bits añade además la pérdida de precisión típica de cuantizaciones extremas.
- Proceso de instalacion no trivial: los pesos abliterados no se distribuyen directamente; hay que descargar la cuantización Unsloth correspondiente y aplicar el parche manualmente siguiendo el README del directorio patch-unsloth-Q2.
- Sin garantias de seguridad por defecto: a diferencia del modelo base, esta variante no ha pasado por optimización de seguridad.
- Idiomas limitados a inglés y chino; el rendimiento en otros idiomas no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huihui-ai/Huihui-GLM-5.3-abliterated-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantizaciones Unsloth base: https://huggingface.co/unsloth/GLM-5.3-GGUF
- Metodo de ablacion (cvector-generator en llama.cpp): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Instrucciones del parche Unsloth: https://huggingface.co/huihui-ai/Huihui-GLM-5.3-abliterated-GGUF/tree/main/patch-unsloth-Q2
- Soporte al autor (Ko-fi): https://ko-fi.com/huihuiai

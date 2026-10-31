# mradermacher/Wicked-Stuff-12B-i1-GGUF

## Resumen

Wicked-Stuff-12B-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo ReadyArt/Wicked-Stuff-12B, publicada por el cuantizador mradermacher, un colaborador muy activo en Hugging Face conocido por generar cuants de alta calidad de modelos de la comunidad. El modelo base es un LLM de instrucciones de unos 12 mil millones de parámetros (11.907.350.576 exactos según los safetensors), orientado a roleplay sin restricciones, contenido adulto explícito, terror y violencia ficticia, es decir, un modelo "unaligned" destinado a casos de uso de ficción madura.

La relevancia de esta ficha no está tanto en el modelo base como en el trabajo de cuantización: mradermacher ofrece más de 20 variantes que van desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB), lo que permite ejecutar el modelo en hardware muy modesto con una degradación de calidad controlada. Las cuantizaciones imatrix (i1) suelen superar en calidad a las cuants estáticas equivalentes en tamaño, especialmente en los rangos bajos (2-3 bits).

Es importante señalar que el modelo está etiquetado explícitamente como contenido para adultos y no apto para todos los públicos: genera material NSFW, erótico, violento y de terror sin filtros. Su licencia es Apache 2.0 y el idioma principal es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder; arquitectura exacta del modelo base no publicada en la ficha) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuants imatrix); también disponible versión de cuants estáticos |

## Arquitectura y entrenamiento

La ficha de cuantización no detalla la arquitectura del modelo base ReadyArt/Wicked-Stuff-12B. Por el tamaño de parámetros (11,9B) corresponde a la clase de modelos densos de 12B populares en la comunidad de roleplay. El README del cuantizador menciona que se trata de un modelo de visión ("This is a vision model"), indicando que los archivos mmproj, si existen, se publican en el repositorio de cuants estáticos, aunque no se incluyen en este repositorio i1.

Respecto al entrenamiento del modelo base, no hay datos publicados en la información disponible: se desconocen el número de tokens, la composición del dataset y los métodos de alineación (RLHF, DPO). Las etiquetas del modelo ("unaligned", "nsfw", "explicit") sugieren un fine-tune sobre un modelo base orientado a eliminar restricciones de contenido para ficción madura.

El aporte técnico de este repositorio es la cuantización con imatrix (matriz de importancia calculada sobre un corpus de calibración), técnica de Ikawrakow que asigna mayor precisión a los tensores más sensibles, mejorando la calidad percplexidad de los cuants bajos frente a las cuants estáticas del mismo tamaño.

## Capacidades

- Generación de texto conversacional e instruct, optimizada para roleplay de larga duración.
- Contenido adulto explícito (ERP/erótico), horror y violencia ficticia sin filtros de alineación.
- Etiquetado como modelo de visión en el README del cuantizador (los archivos mmproj se gestionan en el repositorio de cuants estáticos).
- Soporte de tool calling: no disponible.
- Capacidades de agentes o razonamiento multi-paso: no disponible.
- Idioma principal: inglés; soporte multilingüe no documentado.

## Casos de uso

- Roleplay interactivo de ficción madura: el modelo está específicamente afinado para conversaciones de rol con contenido adulto, terror o violencia ficticia, útil en frontales como SillyTavern o KoboldCpp.
- Escritura creativa de novela negra o terror: puede generar prosa con temáticas violentas u oscuras que los modelos alineados comerciales rechazan, siempre en contexto de ficción.
- Prototipado de chatbots de ficción en local: con la variante IQ2_XXS (3,7 GB) cabe en portátiles sin GPU dedicada para pruebas rápidas de personajes.
- Ejecución en hardware de consumo: la variante Q4_K_M (7,5 GB) entra cómodamente en una RTX 3060 de 12 GB o en 8 GB de VRAM, permitiendo inferencia local y privada sin enviar datos a servicios externos.
- Investigación sobre cuantización: el archivo imatrix de 0,1 GB permite a terceros generar sus propias cuants personalizadas del modelo.
- Pruebas comparativas de calidad de cuants: al ofrecer todo el rango IQ1 a Q6_K, es un buen banco de pruebas para evaluar degradación de calidad en rangos bajos de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un fine-tune de comunidad orientado a roleplay, el modelo base tampoco incluye evaluaciones estándar (MMLU, HumanEval, GSM8K) en la ficha consultada.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin contexto):
  - IQ1_S/IQ1_M: 3,1-3,3 GB, viable incluso en 4 GB de VRAM o CPU.
  - IQ2_XXS a IQ3_M: 3,7-5,8 GB, viable en GPUs de 6 GB (RTX 3060 Ti, RTX 4060).
  - Q4_K_S/Q4_K_M: 7,1-7,5 GB, óptimo en GPUs de 8-12 GB (RTX 4060 Ti, RTX 3060 12 GB, RTX 4070).
  - Q5_K_M/Q6_K: 8,6-9,9 GB, recomendado en GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080).
- Con GPU: RTX 3060 12 GB o superior cubre la mayoría de cuants; no se requieren A100 ni H100 para este tamaño.
- En CPU: todas las variantes son ejecutables con llama.cpp; los tamaños hasta Q4_K_M son razonables en equipos con 16 GB de RAM.
- Despliegue: llama.cpp, KoboldCpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía habitual para GGUF.
- Latencia y throughput: no disponibles; en GPUs de consumo de gama media, un modelo denso de 12B en Q4 típicamente supera los 30 tokens/s, aunque esta cifra no está publicada en la ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Wicked-Stuff-12B-i1-GGUF (esta ficha) | 11,9B | GGUF imatrix | Apache 2.0 | Roleplay NSFW unaligned |
| Mistral Nemo Instruct 12B (cuants GGUF de mradermacher) | 12,2B | GGUF | Apache 2.0 | Modelo generalista alineado, base habitual de fine-tunes de roleplay |
| Cydonia 12B / fine-tunes de roleplay de TheDrummer | 12B | GGUF | Apache 2.0 | Roleplay creativo con menos restricciones |

Nota: la comparación con Mistral Nemo es plausible por clase de tamaño y licencia, pero el modelo base real de Wicked-Stuff-12B no está confirmado en la información disponible.

## Limitaciones y advertencias

- Contenido explícito: el modelo genera material sexual, violento y de terror sin filtros. Está etiquetado "not-for-all-audiences" y no debe exponerse a usuarios menores de edad ni desplegarse en entornos sin control de acceso.
- Riesgo de alucinación: elevado y no cuantificado; al ser un modelo unaligned orientado a ficción, no es fiable para tareas factuales, código o razonamiento.
- Sesgos: no documentados; los fine-tunes de roleplay de comunidad suelen heredar y amplificar los sesgos del modelo base y de los datasets de rol.
- Idioma: documentado solo para inglés; el rendimiento en castellano no está verificado.
- Contexto: longitud de ventana no publicada en la ficha; verificarla en el modelo base antes de planificar conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado (especialmente material adulto) recae en el desplegador; revisar la legislación aplicable.
- Calidad en cuants extremas: las variantes IQ1_S/IQ1_M (3,1-3,3 GB) sufren degradación severa, como reconoce el propio autor ("for the desperate").
- El repositorio i1 no incluye archivos mmproj; las capacidades de visión, si se necesitan, requieren el repositorio de cuants estáticos.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/Wicked-Stuff-12B-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-12B
- Cuants estáticas del mismo modelo: https://huggingface.co/mradermacher/Wicked-Stuff-12B-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Wicked-Stuff-12B-i1-GGUF
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/

# mradermacher/translategemma-12b-it-subtitles-GGUF

## Resumen

TranslateGemma 12B it subtitles (GGUF) es una versión cuantizada en formato GGUF del modelo Chinasky71/translategemma-12b-it-subtitles, un modelo de traducción especializado en subtítulos basado en la arquitectura Gemma 3. La cuantización ha sido realizada por mradermacher, un colaborador conocido en la comunidad de Hugging Face por generar versiones estáticas de modelos populares en múltiples niveles de compresión, desde Q2_K hasta Q8_0.

El modelo original resuelve un problema concreto y frecuente en la localización de contenido audiovisual: la traducción de subtítulos entre inglés e italiano. A diferencia de los modelos de traducción generalistas, este modelo ha sido afinado sobre Gemma 3 12B para manejar las particularidades de los subtítulos: brevedad de las líneas, sincronización con el habla, registro coloquial y limitaciones de espacio en pantalla.

La publicación en formato GGUF es relevante porque permite ejecutar el modelo localmente en hardware de consumo mediante llama.cpp, Ollama o LM Studio, sin depender de servicios en la nube. Con aproximadamente 11.766 millones de parámetros y cuantizaciones desde 4,9 GB (Q2_K) hasta 12,6 GB (Q8_0), es accesible para GPUs con 8-16 GB de VRAM e incluso para ejecución parcial en CPU. El repositorio incluye además archivos mmproj (suplemento multimodal), lo que indica que el modelo base conserva capacidades de visión de Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer denso, multimodal) |
| Parametros totales | 11.766.034.176 (~11,77 B) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (Gemma 3 12B base soporta 128K, pero no consta en la ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | ingles (en), italiano (it) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizado a partir de safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, Chinasky71/translategemma-12b-it-subtitles, es un ajuste fino (fine-tuning) de Gemma 3 12B instruct, un transformer denso multimodal de Google. La variante "-it" indica que parte de la versión instruction-tuned del modelo. El afinado se ha orientado a la tarea de traduccion de subtítulos entre ingles e italiano, presumiblemente con pares de subtítulos alineados temporalmente como datos de entrenamiento, aunque el repositorio no detalla el dataset, el numero de tokens ni el metodo de entrenamiento (SFT, DPO, etc.).

La version publicada por mradermacher no altera la arquitectura: consiste en cuantizaciones estáticas al formato GGUF mediante llama.cpp, con niveles de compresión k-quant (Q2 a Q6) e IQ4_XS. El repo incluye archivos mmproj (multimodal projector) en f16 y Q8_0, herencia del soporte de visión de Gemma 3, aunque la utilidad de la vision para la tarea de traduccion de subtítulos depende de como se haya afinado el modelo base. No se han publicado imatrix quants (cuantizaciones con matriz de importancia) en el momento de la ficha.

## Capacidades

- Traduccion de subtítulos de ingles a italiano y de italiano a ingles, con afinado especifico en el estilo y las restricciones del formato de subtítulos (lineas cortas, registro conversacional).
- Generacion de texto general en ingles e italiano, heredada del modelo base Gemma 3 12B instruct, aunque con posible degradacion en tareas ajenas a la traduccion por efecto del afinado.
- Capacidades multimodales potenciales (comprension de imagenes), dado que el repo distribuye archivos mmproj; no consta si el afinado ha preservado o degradado esta funcion.
- Conversacion multi-turno (tag "conversational" en el repositorio).
- No consta soporte documentado de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Traduccion masiva de bibliotecas de subtítulos: pipelines por lotes con llama.cpp pueden procesar archivos SRT completos de ingles a italiano en local, sin coste por token ni envio de contenido con derechos de autor a servicios externos.
- Localizacion de contenido audiovisual independiente: productoras o creadores con presupuesto limitado pueden traducir sus subtítulos a italiano usando cuantizaciones Q4_K_M (7,4 GB) en una GPU de consumo.
- Prototipado de flujos de localizacion: al ejecutarse en Ollama o LM Studio, es util para probar calidad de traduccion y ajustes de prompt antes de integrar el modelo en produccion.
- Integracion en editores de subtítulos: puede conectarse a herramientas como Subtitle Edit o scripts propios mediante el servidor de llama.cpp para traducir linea a linea con contexto.
- Traduccion inversa para control de calidad: traducir de vuelta al idioma original (back-translation) para detectar errores de localizacion en subtítulos ya traducidos.
- Ejecucion en portatiles sin GPU dedicada: las cuantizaciones Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten inferencia parcialmente en CPU o en GPUs integradas con memoria compartida, a costa de calidad.
- Asistente de comprension de contenido italiano/ingles: traduccion rapida de dialogos para usuarios que consumen cine o series en el otro idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el modelo base ni la version cuantizada incluyen metricas de BLEU, COMET, chrF ni comparaciones con otros sistemas de traduccion de subtítulos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto ni mmproj):
  - Q2_K: ~4,9 GB
  - Q3_K_M: ~6,1 GB
  - IQ4_XS: ~6,7 GB
  - Q4_K_M: ~7,4 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4090 (24 GB) para Q8_0 con contexto amplio; A100/H100 solo justificables en servicion por lotes de alto volumen.
- Consumer GPUs: cabe comodamente en GPUs de 8 GB con Q3_K_S/Q4_K_S; en GPUs de 12 GB (RTX 3060, 4070) funcionan Q4_K_M y Q5_K_M con margen para contexto.
- CPU: viable con llama.cpp en modo offload parcial; el rendimiento sera bajo (varios tokens/segundo) pero suficiente para traduccion por lotes no interactiva.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. No es desplegable directamente con vLLM ni TGI en este formato (requeriria los pesos safetensors del modelo base).
- Latencia y throughput: no disponibles; en GPUs de gama media con Q4_K_M cabe esperar velocidades de decodificacion tipicas de un modelo denso de 12B (decenas de tokens por segundo).
- Los archivos mmproj anaden 0,7-1,0 GB si se desea usar la parte multimodal.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| translategemma-12b-it-subtitles (este) | ~11,77 B | GGUF (Q2_K a Q8_0) | Traduccion de subtítulos en/it | Gemma |
| Gemma 3 12B it (Google) | ~12 B | safetensors, GGUF comunitario | Generalista multimodal, traduccion general | Gemma |
| NLLB-200 / MADLAD-400 (Google) | 1,3B-54B (segun variante) | safetensors | Traduccion automatica multilingue | Apache 2.0 / CC-BY |

Frente a Gemma 3 12B original, este modelo ofrece mejor calidad esperable en el nicho concreto de subtítulos en/it, a costa de una versatilidad general menor. Frente a modelos de traduccion dedicados como NLLB o MADLAD, aporta mejor manejo del lenguaje coloquial y del contexto conversacional gracias a su base LLM, aunque con soporte de idiomas mucho mas limitado (solo dos) y una licencia Gemma mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Cobertura bilingue estricta: solo ingles e italiano. No sirve para otros pares de idiomas ni como sistema multilingue.
- Riesgo de alucinacion: al ser un LLM afinado y no un sistema de traduccion clasico, puede omitir, resumir o inventar contenido en lineas de subtítulos ambiguas; se recomienda revision humana, especialmente en dialogos con argot o juegos de palabras.
- La calidad de las cuantizaciones bajas (Q2_K, Q3_K_S/M) puede degradar notablemente la traduccion; para produccion se recomiendan Q4_K_M o superiores.
- Licencia Gemma: el uso esta sujeto a los Gemma Terms of Use de Google, que incluyen restricciones y prohibiciones de uso; no es una licencia permisiva tipo Apache o MIT. Conviene revisar las condiciones antes de uso comercial.
- No hay benchmarks publicados que permitan verificar objetivamente la calidad de traduccion frente a alternativas.
- No consta soporte de tool calling ni de agentes; no es adecuado para casos de uso que requieran function calling.
- La conservacion de las capacidades multimodales tras el afinado no esta documentada; los archivos mmproj se incluyen pero su utilidad no esta verificada.
- Cuantizaciones imatrix no disponibles en el momento de la ficha; las estaticas pueden quedar por detras en calidad a peso igual.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/translategemma-12b-it-subtitles-GGUF
- Modelo base: https://huggingface.co/Chinasky71/translategemma-12b-it-subtitles
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#translategemma-12b-it-subtitles-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper o demo del modelo base: no disponibles

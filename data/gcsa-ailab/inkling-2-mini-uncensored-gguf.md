# GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una derivacion comunitaria del modelo multimodal Inkling 2 Mini, desarrollado originalmente por Thinking Machines. Esta version, publicada por GCSA-AiLab, redistribuye el modelo en formato GGUF para su uso con llama.cpp y aplica una modificacion de tipo "abliterix" (eliminacion de direcciones de rechazo) que da lugar a la variante "uncensored". El modelo acepta entradas de texto e imagen y genera texto, con una arquitectura de tipo mixture-of-experts (MoE) segun las etiquetas del repositorio.

El modelo cuenta con 26.070.385.152 parametros totales (segun los safetensors del modelo base) y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 69,4 GB e incluye tres niveles de cuantizacion GGUF; la entrada de imagen requiere un proyector visual BF16 separado. La relevancia actual radica en que permite ejecutar un modelo multimodal MoE de gran tamano en infraestructura local mediante llama.cpp, aunque con las advertencias propias de una derivacion no oficial.

Cabe senalar que no se dispone de informacion detallada sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks en la informacion proporcionada. Los datos tecnicos disponibles provienen del repositorio de Hugging Face y de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal (texto e imagen), segun etiquetas del repositorio |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en tres niveles (los niveles concretos no se detallan en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual BF16 separado para entrada de imagen |

## Arquitectura y entrenamiento

Segun las etiquetas del repositorio, el modelo base Inkling 2 Mini emplea una arquitectura de mezcla de expertos (MoE) con capacidad multimodal de entrada imagen-texto y salida de texto. El modelo derivado conserva la arquitectura del original y aplica una modificacion de tipo "abliterix", una tecnica de edicion de pesos orientada a suprimir las direcciones de rechazo del modelo, lo que da lugar a la variante "uncensored". No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La distribucion se realiza en formato GGUF para llama.cpp, con tres niveles de cuantizacion. Para el procesamiento de imagenes se requiere un proyector visual BF16 independiente, lo que implica que la inferencia multimodal necesita cargar tanto el modelo cuantizado como dicho proyector. No se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Procesamiento multimodal: acepta imagenes junto con texto y genera respuestas textuales.
- Conversacion multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Ejecucion local mediante llama.cpp en formato GGUF.
- Variante "uncensored": el ajuste abliterix reduce los rechazos del modelo ante determinadas solicitudes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Procesamiento local de documentos con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas junto con instrucciones textuales y generar descripciones o extracciones, ejecutandose en llama.cpp sin dependencia de servicios en la nube.
- Asistentes conversacionales autoalojados: al ser un modelo conversacional en formato GGUF, puede desplegarse como backend de un chatbot local con llama.cpp, manteniendo los datos en infraestructura propia.
- Analisis de imagenes en entornos con requisitos de privacidad: la inferencia local con el proyector visual BF16 permite procesar imagenes sensibles sin enviarlas a terceros.
- Prototipado e investigacion sobre alineacion: la variante abliterix permite estudiar el comportamiento del modelo con las direcciones de rechazo suprimidas, util para investigacion sobre seguridad y alineacion.
- Generacion de descripciones de contenido visual: el modelo puede emplearse para etiquetar o describir imagenes en pipelines de datos, siempre que se valide la calidad de las salidas.
- Experimentacion con modelos MoE multimodales en hardware de gama alta: la cuantizacion GGUF facilita probar un MoE de 26 mil millones de parametros en configuraciones locales con suficiente memoria.
- Integracion en herramientas de linea de comandos basadas en llama.cpp: al ser compatible con llama.cpp, puede incorporarse en scripts y utilidades de escritorio para tareas de texto e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 26,07 mil millones de parametros en cuantizaciones GGUF de 4 a 8 bits requiere aproximadamente entre 14 y 28 GB solo para los pesos, a lo que se suma el proyector visual BF16; estas cifras son estimaciones y no datos publicados.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; dependeria del nivel de cuantizacion y de la VRAM disponible.
- Opciones de despliegue: llama.cpp (libreria declarada); otras opciones como vLLM, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-GGUF | 26,07 mil millones | no disponible | imagen-texto | Apache-2.0 | GGUF |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 mil millones | no disponible | imagen-texto | no disponible en la informacion | no disponible en la informacion |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con modelos alternativos concretos de la misma categoria.

## Limitaciones y advertencias

- Derivacion no oficial: se trata de una modificacion comunitaria del modelo base, sin validacion por parte del desarrollador original.
- Ajuste "uncensored": la tecnica abliterix suprime los rechazos del modelo, lo que puede producir salidas inapropiadas, daninas o no alineadas con politicas de uso; requiere filtros y supervision adicionales en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad en la informacion disponible.
- Idiomas soportados no documentados: no es posible garantizar un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada: limita la planificacion de casos de uso con contextos largos.
- Dependencia del proyector visual BF16: la inferencia multimodal requiere cargar un archivo adicional, lo que incrementa los requisitos de memoria.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base remite a una politica de uso aceptable de Thinking Machines que conviene revisar.
- Sin descargas ni likes en el momento de la consulta: la adopcion y validacion por la comunidad son practicamente nulas, lo que aumenta el riesgo de problemas no detectados.
- Benchmarks no disponibles: no hay evidencia publicada sobre la calidad del modelo tras la modificacion abliterix.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- README en ingles: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF/blob/main/README.en.md
- README en chino simplificado: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF/blob/main/README.zh-CN.md
- README en chino tradicional: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF/blob/main/README.zh-Hant.md
- README en japones: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF/blob/main/docs/ja.md
- README en coreano: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF/blob/main/docs/ko.md
- README en frances: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF/blob/main/docs/fr.md
- README en portugues: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF/blob/main/docs/pt.md
- Archivos del repositorio: https://huggingface.co/GCSA-AiLab/Inkling-2-Mini-Uncensored-GGUF/tree/main
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Politica de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/

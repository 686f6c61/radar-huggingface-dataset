# Jabs2/Hy-MT2-1.8B-Manga-v3-GGUF

## Resumen

Hy-MT2-1.8B-Manga-v3-GGUF es un espejo en formato GGUF cuantizado (Q4_K_M) de un ajuste fino especializado en traducción de manga y anime, derivado del modelo de traducción multilingüe tencent/Hy-MT2-1.8B de Tencent Hunyuan. El ajuste fino original lo publica el usuario fumetodev (Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual-GGUF) y este repositorio, publicado por Jabs2, se limita a redistribuir el archivo cuantizado sin modificaciones. El modelo tiene 1.791.080.448 parámetros (aproximadamente 1,8B) y el repositorio ocupa 1,1 GB.

El problema que resuelve es concreto y está documentado por el propio autor: el modelo base Hy-MT2-1.8B, cuando se usa en cuantizaciones agresivas (por ejemplo IQ3_M) y sin la plantilla de chat correcta, degrada de forma notable en la tarea de traducir diálogo japonés de anime. En una medición sobre 158 líneas del episodio 3 de *Haibane Renmei* (transcripción obtenida con anime-whisper), el base en IQ3_M con prompt crudo devolvía japonés en el 64% de los casos, mientras que este ajuste v3 en Q4_K_M y con plantilla devolvía japonés en el 0% y copiaba la entrada en el 0%.

Es relevante ahora porque cubre un nicho muy específico —subtitulado y traducción JA→PT/EN de contenido japonés— con un coste de despliegue muy bajo (1,13 GB), lo que permite ejecutarlo en CPU o en GPUs de gama baja dentro de aplicaciones de consumo. La licencia declarada es Apache-2.0, heredada del modelo base, aunque el propio autor advierte de que los términos del repositorio upstream deben verificarse antes de redistribuir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción de Tencent Hunyuan; no se detalla en la información proporcionada) |
| Parametros totales | 1.791.080.448 (aproximadamente 1,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se confirma Q4_K_M en este repositorio (1.133 MB). El modelo base dispone de al menos IQ3_M (859 MB) |
| Idiomas soportados | ja, pt, en (según la model card). La familia base Hy-MT2 declara soporte de 33 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (librería llama-cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Hy-MT2-1.8B más allá de que pertenece a la familia Hy-MT2 de Tencent Hunyuan, descrita como una familia de modelos de traducción multilingüe de "pensamiento rápido" orientados a escenarios reales complejos. La familia incluye tres tamaños: 1.8B, 7B y 30B-A3B (MoE), y todos ellos soportan traducción entre 33 idiomas siguiendo instrucciones de traducción en varios idiomas. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Sobre el ajuste fino concreto, la model card indica que fue entrenado por fumetodev para corregir dos fallos del base en cuantización baja: el code-switching (mezcla de idiomas en la salida) y el truncado del japonés. El autor documenta el uso de un template de chat obligatorio con los tokens `<｜hy_User｜>` y `<｜hy_Assistant｜>`, y recomienda unos parámetros de muestreo concretos: temperature 0.15, top_k 20, top_p 0.6, repeat_penalty 1.05, min_p 0 y max_tokens 200. No se aportan datos sobre la composición del corpus de ajuste ni sobre el proceso de destilación, aunque se menciona que este modelo actúa como "profesor" en la destilación de una variante más pequeña (Qwen3-0.6B-JA-PT-Anime).

## Capacidades

- Traducción de texto japonés a portugués e inglés, y presumiblemente en las combinaciones cubiertas por los tres idiomas declarados (ja, pt, en).
- Traducción de diálogo de anime y manga, con manejo de registro coloquial y terminología otaku.
- Respeto de glosarios de terminología inyectados en el prompt: la model card confirma que `先輩` se traduce como "senpai" y `先生` como "professor", y que el modelo atiende a un bloque de terminología proporcionado por el usuario.
- Generación de salida limpia sin code-switching cuando se usa el template correcto, incluso en cuantización Q4_K_M.
- Capacidad de completar fragmentos de entrada parciales (procedentes de ASR), aunque con riesgo de inventar el final.
- No es un modelo de chat: sin los tokens `<｜hy_User｜>` y `<｜hy_Assistant｜>` la calidad de salida se degrada de forma medible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto (la entrada de audio se resuelve con un sistema ASR externo como anime-whisper).

## Casos de uso

- Subtitulado automático de anime en japonés a portugués: el flujo documentado por el autor combina anime-whisper para la transcripción y este modelo para la traducción, con descarte previo de cues que solo contienen puntuación. El tamaño de 1,13 GB permite ejecutar todo el pipeline en el mismo equipo sin GPU dedicada.
- Traducción de manga y scanlation: el modelo respeta glosarios de terminología (senpai, professor, etc.), lo que permite fijar la traducción de términos recurrentes a lo largo de una obra inyectando un bloque de terminología en el prompt.
- Localización de catálogos VOD en dispositivos de bajos recursos: con 1.133 MB en Q4_K_M, el modelo cabe en televisiones, sticks HDMI o mini-PC con poca memoria, lo que habilita subtitulado en tiempo casi real sin depender de APIs en la nube.
- Traducción JA→PT offline en aplicaciones móviles o edge: al ser GGUF y funcionar con llama.cpp, puede integrarse en aplicaciones que no disponen de conectividad o que necesitan evitar enviar contenido a servidores externos.
- Generación de datos sintéticos para destilar modelos más pequeños: la model card documenta el uso de este ajuste como "profesor" para destilar una variante de 0,6B (Qwen3-0.6B-JA-PT-Anime-GGUF, 397 MB). Es decir, sirve para etiquetar corpus JA→PT que después entrenan modelos aún más ligeros.
- Asistencia a traductores humanos en localización de contenido japonés: dado que el modelo completa fragmentos y respeta glosarios, puede usarse como borrador inicial que un traductor revisa, especialmente en series largas donde la consistencia terminológica es crítica.
- Traducción de conversaciones y documentación JA→EN/PT en flujos internos: cualquier equipo que reciba material en japonés y necesite un primer volcado rápido en portugués o inglés puede desplegarlo localmente con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET, etc.) en la información disponible. El autor sí publica una evaluación propia sobre 158 líneas del episodio 3 de *Haibane Renmei*, con transcripción JA procedente de anime-whisper:

| Modelo | Cuantizacion | Prompt | Devuelve japones | Copia la entrada |
|---|---|---:|---:|---:|
| Hy-MT2 1.8B base | IQ3_M | crudo | 64% | 1% |
| Hy-MT2 1.8B base | IQ3_M | con template | 22% | 18% |
| Este modelo (v3) | Q4_K_M | con template | 0% | 0% |

Adicionalmente, el autor reporta una métrica "cjk" (recuento de caracteres CJK en la salida; la definición exacta no se detalla) medida sobre el modelo base en IQ3_M: 35 con template frente a 101 con prompt crudo, lo que indica que el uso del template reduce de forma sustancial la presencia de caracteres japoneses en la traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M incluyendo caché KV y overhead para contextos cortos (el archivo de pesos pesa 1.133 MB). Cifra estimada, no medida por el autor.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También es viable en CPU sin GPU.
- GPU de gama alta (A100, H100) no son necesarias; el modelo es de 1,8B y quedaría enormemente infrautilizado.
- Almacenamiento: 1,1 GB para el repositorio completo.
- Opciones de despliegue: llama.cpp (llama-cpp-python), Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio está etiquetado como `llama-cpp` y `endpoints_compatible`. vLLM y TGI tienen soporte parcial de GGUF, pero no es su formato nativo.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo en la información proporcionada.
- Restricción de memoria adicional: el modelo exige el template de chat con los tokens `<｜hy_User｜>` / `<｜hy_Assistant｜>`; los runtimes deben configurarse para no aplicar un template de chat genérico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / tamano | Notas |
|---|---|---|---|---|---|---|
| Jabs2/Hy-MT2-1.8B-Manga-v3-GGUF (este) | 1,79B | no disponible | ja, pt, en | Apache-2.0 | GGUF Q4_K_M, 1.133 MB | Ajuste fino para manga/anime; 0% de salida en japonés en la prueba del autor |
| tencent/Hy-MT2-1.8B (base) | 1,8B | no disponible | 33 idiomas (familia) | Apache-2.0 | safetensors, GGUF (incluye IQ3_M, 859 MB) | Base genérica de traducción; degrada sin template y en cuantizaciones agresivas |
| tencent/Hy-MT2-7B | 7B | no disponible | 33 idiomas (familia) | no disponible | no disponible | Alternativa mayor de la misma familia, sin datos de rendimiento en la información disponible |
| tencent/Hy-MT2-30B-A3B (MoE) | 30B totales / 3B activos | no disponible | 33 idiomas (familia) | no disponible | no disponible | Modelo MoE de la familia; requiere hardware muy superior |
| Jabs2/Qwen3-0.6B-JA-PT-Anime-GGUF | 0,6B | no disponible | ja, pt | no disponible | GGUF, 397 MB | Alternativa ligera destilada de este modelo; el autor reporta 68,7% de PT limpio frente al 11,7% de LMT-60 Q6 |

## Limitaciones y advertencias

- No es un modelo de chat: sin los tokens `<｜hy_User｜>` y `<｜hy_Assistant｜>` la calidad cae de forma medible (el autor reporta cjk=35 con template frente a cjk=101 con prompt crudo en el base). Usar un template genérico de conversación degrada la salida.
- Riesgo de invención en entradas truncadas: el modelo completa fragmentos de ASR con confianza y a veces inventa el final de la frase. La mitigación documentada es descartar antes de traducir los cues que solo contienen puntuación.
- Las líneas de pausa (un `…` aislado) se copian literalmente en lugar de traducirse, por lo que también deben filtrarse antes de enviarlas al modelo.
- Riesgo de alucinación en terminología o nombres propios no cubiertos por el glosario; no hay evaluación publicada al respecto.
- Idiomas limitados en este ajuste fino a ja, pt y en; no hereda necesariamente el soporte de 33 idiomas del base.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgos.
- Licencia Apache-2.0 declarada, pero el propio repositorio avisa de que es un espejo y que deben verificarse los términos del repositorio upstream (fumetodev) antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día: se trata de una publicación reciente sin validación comunitaria.
- No se han publicado benchmarks estándar (BLEU, COMET, MMLU) ni mediciones de latencia o throughput; la única evidencia de rendimiento es la prueba interna del autor sobre 158 líneas de un único episodio.
- El rendimiento medido corresponde a un único par de idiomas (ja→pt) y a un único dominio (diálogo de anime); extrapolar a otros dominios o pares de idiomas no está respaldado por datos.
- Al ser una cuantización Q4_K_M, existe pérdida de precisión respecto a los pesos originales en safetensors, aunque el autor mide mejor comportamiento que el base en IQ3_M.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jabs2/Hy-MT2-1.8B-Manga-v3-GGUF
- Repositorio upstream (ajuste fino original): https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual-GGUF
- Árbol de archivos del upstream: https://huggingface.co/fumetodev/Hy-MT2-1.8B-JP-Manga-Finetune-v3-multilingual-GGUF/tree/main
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Repositorio GitHub de la familia Hy-MT2 (Tencent Hunyuan): https://github.com/Tencent-Hunyuan/Hy-MT2
- Espejo de la familia en Secret AI: https://secretai.io/models/tencent/Hy-MT2-1.8B-GGUF
- Repositorio GitHub espejo de la familia: https://github.com/kinhteso/hy-mt2
- Alternativa ligera destilada: https://huggingface.co/Jabs2/Qwen3-0.6B-JA-PT-Anime-GGUF

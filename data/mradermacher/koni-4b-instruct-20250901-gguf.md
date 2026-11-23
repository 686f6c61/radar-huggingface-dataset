# mradermacher/KONI-4B-instruct-20250901-GGUF

## Resumen

KONI-4B-instruct-20250901-GGUF es la distribucion en formato GGUF del modelo KONI-4B-instruct-20250901, desarrollado originalmente por KISTI-KONI y cuantizado por mradermacher. Se trata de un modelo de lenguaje causal de aproximadamente 3.880 millones de parametros, construido sobre la arquitectura Gemma 3 (tag `gemma3`), afinado para instrucciones y orientado a generacion de texto conversacional. Su publicacion en GGUF facilita su ejecucion en hardware de consumo mediante llama.cpp, Ollama y herramientas compatibles.

El modelo cubre los idiomas coreano (ko) e ingles (en), lo que lo posiciona como una opcion especifica para aplicaciones bilingues coreano-ingles, un nicho menos cubierto por los modelos generalistas. Con cerca de 4.000 millones de parametros, se situa en la gama de modelos pequenos que pueden desplegarse en GPU de consumo con cuantizaciones de 4 a 8 bits, manteniendo un equilibrio entre calidad y requisitos de memoria.

La relevancia de esta ficha radica en que el repositorio GGUF es la via practica de uso del modelo: el autor original publica los pesos en transformers, mientras que mradermacher ofrece 11 variantes de cuantizacion estatica (desde Q2_K hasta f16) con tamanos que van de 1,8 GB a 7,9 GB. La licencia es Gemma, lo que impone las condiciones de uso de Google para modelos derivados de esa familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Gemma 3, tag `gemma3`) |
| Parametros totales | 3.880.263.168 (aprox. 3,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | gemma |
| Formato de pesos | GGUF (repo cuantizado); modelo base en transformers/pytorch |

## Arquitectura y entrenamiento

El modelo base es KISTI-KONI/KONI-4B-instruct-20250901, un modelo causal de la familia Gemma 3 segun los tags del repositorio (`gemma3`, `causal-lm`, `4b`). El repositorio aqui descrito es una cuantizacion estatica en GGUF generada por mradermacher, no un modelo entrenado de nuevo: no se aportan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento en la informacion disponible.

La innovacion tecnica de este repositorio es la propia cuantizacion: se ofrecen 11 variantes estaticas (sin imatrix ni quants ponderados, segun indica el autor), con tamanos desde 1,8 GB (Q2_K) hasta 7,9 GB (f16). El autor recomienda Q4_K_S y Q4_K_M como opciones rapidas, Q6_K por calidad muy buena y Q8_0 como la mejor calidad manteniendo velocidad. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia en el material proporcionado.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, con formato de instrucciones (instruct).
- Razonamiento basico y respuesta a preguntas en los dos idiomas soportados.
- Generacion de codigo y matematicas: capacidad esperable en un modelo instruct de esta familia, aunque no se documentan resultados especificos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a coreano e ingles; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente bilingue coreano-ingles: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, aprovechando su ajuste instruct y su ventana de contexto (no documentada) para mantener el hilo de la conversacion.
- Asistentes locales en dispositivos de consumo: con cuantizaciones Q4 de 2,5-2,6 GB, puede ejecutarse en portatiles y equipos con GPU modesta mediante llama.cpp u Ollama, sin depender de la nube.
- Traduccion y adaptacion de contenido entre coreano e ingles: util para equipos que trabajan con documentacion o comunicaciones en ambos mercados.
- Prototipado rapido de aplicaciones de chat: al ser un modelo de ~4 B en GGUF, permite iterar en local con baja latencia antes de escalar a modelos mayores.
- Generacion de respuestas en entornos con restricciones de privacidad: el despliegue on-premise evita enviar datos a APIs externas, adecuado para sectores regulados.
- Educacion y tutoria en coreano: respuestas conversacionales en un modelo ligero que puede integrarse en plataformas de aprendizaje sin infraestructura de GPU dedicada.
- Filtrado y clasificacion de texto en pipelines ligeros: su tamano permite procesar lotes en CPU o GPU de gama media con cuantizaciones Q4/Q5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,8 GB; Q3_K_S ~2,0 GB; Q3_K_M ~2,2 GB; Q3_K_L ~2,3 GB; IQ4_XS ~2,4 GB; Q4_K_S ~2,5 GB; Q4_K_M ~2,6 GB; Q5_K_S/Q5_K_M ~2,9 GB; Q6_K ~3,3 GB; Q8_0 ~4,2 GB; f16 ~7,9 GB (tamanos de fichero del repo; la VRAM real anade overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de 6 GB o mas con cuantizaciones Q4/Q5; las variantes Q2/Q3 caben incluso en equipos con 4 GB.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers (tags `transformers`, `pytorch`, `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KONI-4B-instruct-20250901 (este) | ~3,88 B | no disponible | ko, en | gemma | GGUF, transformers |
| Gemma 3 4B (referencia de familia) | ~4 B | no disponible | multilingue | gemma | safetensors, GGUF |
| Modelos instruct de ~4 B (p. ej. Qwen2.5-3B/7B, Llama 3.2 3B) | 3-7 B | no disponible | multilingue | variable | safetensors, GGUF |

La comparativa se limita a la categoria por tamano y familia; no se dispone de datos de rendimiento del modelo en la informacion proporcionada para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como modelo entrenado en coreano e ingles, puede reflejar sesgos de esos corpus.
- Riesgo de alucinacion: inherente a los modelos de ~4 B; la calidad factografica sera inferior a la de modelos mayores, especialmente en dominios especializados.
- Limitaciones de contexto o idioma: solo se declaran coreano e ingles; el rendimiento en castellano no esta garantizado. La longitud de contexto no esta documentada.
- Restricciones de licencia: licencia Gemma, sujeta a los terminos de uso de Google para modelos de esa familia; revisar las condiciones antes de uso comercial.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K_M se marcan como de menor calidad; para produccion se recomienda Q4_K_M o superior. El autor indica que no hay quants ponderados/imatrix disponibles en el momento de la publicacion.
- El repositorio es una cuantizacion de terceros (mradermacher), no el modelo oficial; para trazabilidad conviene consultar el repositorio original de KISTI-KONI.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KONI-4B-instruct-20250901-GGUF
- Modelo base: https://huggingface.co/KISTI-KONI/KONI-4B-instruct-20250901
- Pagina de descargas del autor: https://hf.tst.eu/model#KONI-4B-instruct-20250901-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

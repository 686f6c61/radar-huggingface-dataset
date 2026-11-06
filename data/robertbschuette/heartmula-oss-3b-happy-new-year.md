# robertbschuette/HeartMuLa-oss-3B-happy-new-year

## Resumen

HeartMuLa-oss-3B-happy-new-year es un modelo de generación musical a partir de texto desarrollado por el equipo HeartMuLa, presentado como parte de la familia de modelos fundacionales de música HeartMuLa. El modelo resuelve el problema de convertir descripciones textuales y letras en audio musical, con un enfasis declarado por parte del autor en la controlabilidad de las letras y la calidad musical. Es relevante porque se distribuye como codigo abierto bajo licencia Apache 2.0, algo poco habitual en el espacio de generacion musical de alta calidad, y porque forma parte de un ecosistema completo que incluye un codec de audio (HeartCodec) y un transcriptor (HeartTranscriptor).

El modelo cuenta con aproximadamente 3.938 millones de parametros (3,9B) almacenados en formato safetensors, con un repositorio de 15,8 GB. La model card lo identifica como la version recomendada de la familia HeartMuLa-oss-3B, junto con HeartCodec-oss-20260123 como codec recomendado. Soporta cinco idiomas declarados: chino, ingles, japones, coreano y espanol.

La ficha se basa en la informacion disponible en Hugging Face y en los resultados de busqueda web. Dado que la model card es escueta y no detalla arquitectura interna, datos de entrenamiento ni resultados de benchmarks, varios apartados tecnicos se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generacion text-to-audio; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 3.938.113.536 (aproximadamente 3,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | zh, en, ja, ko, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo (tipo de transformer, mecanismo de atencion, componentes de difusion o autoregresivos, etc.). Se trata de un modelo de la pipeline text-to-audio orientado a musica, con un tamano de 3,9B parametros y pesos en safetensors. La model card lo enmarca dentro de una familia de modelos fundacionales de musica (HeartMuLa) que incluye un codec de audio dedicado (HeartCodec-oss) y un transcriptor (HeartTranscriptor-oss), lo que sugiere una arquitectura en dos etapas: generacion de representaciones acusticas y decodificacion a audio mediante el codec.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). El paper asociado (arXiv:2601.10547, "HeartMuLa: A Family of Open Sourced Music Foundation Models") es la referencia para obtener estos detalles, pero su contenido no esta recogido en la informacion proporcionada.

## Capacidades

- Generacion de musica a partir de texto: pipeline text-to-audio con etiquetas music y art.
- Control de letras: el autor declara explicitamente que es el mejor modelo abierto en terminos de controlabilidad de letras y calidad musical.
- Generacion condicionada por descripcion textual y letras en cinco idiomas (zh, en, ja, ko, es).
- Integracion con codec de audio propio (HeartCodec-oss-20260123) para la sintesis final del audio.
- Integracion con transcriptor propio (HeartTranscriptor-oss) dentro del ecosistema HeartMuLa.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a generacion de audio, no a tareas de agente.
- Capacidades especiales (vision, audio de entrada, thinking mode): no disponible; la informacion solo documenta salida de audio a partir de texto.

## Casos de uso

- Generacion de canciones con letra controlada: el modelo recibe una descripcion textual y una letra y produce audio musical; su enfasis declarado en controlabilidad de letras lo hace adecuado para produccion musical asistida donde la letra es un requisito estricto.
- Prototipado rapido de bandas sonoras: compositores y productores pueden generar borradores de pistas a partir de prompts descriptivos antes de invertir tiempo en produccion real.
- Localizacion musical multilingue: al soportar zh, en, ja, ko y es, permite generar canciones en distintos idiomas manteniendo el control sobre la letra en cada uno.
- Contenido para creadores: youtubers, podcasters y creadores de contenido pueden generar musica libre de restricciones de licencia (Apache 2.0) adaptada a la tematica de sus videos.
- Investigacion en generacion musical: al ser codigo abierto con pesos safetensors y paper asociado, sirve como base para experimentos academicos en modelado de musica y control de letras.
- Integracion en pipelines de produccion de audio: mediante el repositorio heartlib y el codec HeartCodec, puede desplegarse localmente para automatizar la generacion de jingles, cortinillas o variaciones musicales en lote.
- Educacion y demos interactivas: el demo publico en heartmula.github.io permite explorar el modelo sin infraestructura propia, util para talleres y presentaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Para un modelo de 3,9B parametros en safetensors (16 bits), el peso ronda los 7,9 GB, por lo que se necesitarian al menos unos 10-12 GB de VRAM para inferencia sin cuantizar, estimacion orientativa no confirmada por el autor.
- El repositorio ocupa 15,8 GB, lo que sugiere pesos posiblemente en mayor precision o componentes adicionales (codec, transcriptor) empaquetados.
- GPU recomendadas: no disponible en la informacion; por tamano, una RTX 4090 (24 GB) o A100/H100 serian candidatas razonables, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: probable en GPUs con 12-16 GB o mas segun la estimacion anterior, aunque no esta confirmado.
- Opciones de despliegue: el autor remite al repositorio GitHub heartlib para quickstart y despliegue local; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no necesariamente aplicables a este modelo de audio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HeartMuLa-oss-3B-happy-new-year | 3,9B | no disponible | Apache 2.0 | Hugging Face, GitHub, demo | Version recomendada de la familia; enfasis en control de letras |
| HeartMuLa-oss-3B | no disponible | no disponible | Apache 2.0 | Hugging Face | Version base de la misma familia, segun la model card |
| Alternativas de generacion musical open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de otras familias (por ejemplo, modelos de generacion musical de otros autores), por lo que la comparativa se limita a las variantes de la propia familia HeartMuLa citadas en la model card.

## Limitaciones y advertencias

- La model card es muy escueta: no documenta arquitectura, datos de entrenamiento, sesgos ni evaluaciones, lo que dificulta una evaluacion tecnica rigurosa antes de usarlo en produccion.
- Riesgo de alucinacion y fidelidad de letras: aunque el autor declara alta controlabilidad de letras, no se aportan metricas objetivas que lo respalden en la informacion disponible.
- Cobertura idiomatica limitada a cinco idiomas (zh, en, ja, ko, es); el rendimiento en cada uno no esta cuantificado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del ecosistema completo (codec, transcriptor y dependencias de heartlib) antes de desplegar.
- El ID de Hugging Face consultado (robertbschuette/HeartMuLa-oss-3B-happy-new-year) registra 0 descargas y 0 likes, mientras que la model card remite a la organizacion oficial HeartMuLa; conviene verificar que se descarga la version oficial y no una copia de terceros.
- No se documentan limitaciones de contexto, latencia ni requisitos de hardware, lo que impide planificar capacidad de produccion con datos fiables.
- Posibles sesgos musicales o culturales derivados del dataset de entrenamiento: no documentados en la informacion disponible.

## Enlaces

- Hugging Face (ID consultado): https://huggingface.co/robertbschuette/HeartMuLa-oss-3B-happy-new-year
- Hugging Face (version oficial recomendada): https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Hugging Face (version base): https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Codec recomendado: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Codec base: https://huggingface.co/HeartMuLa/HeartCodec-oss
- Transcriptor: https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- Repositorio GitHub: https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- Estadisticas de modelo: https://openmodelstats.com/models/heartmula/heartmula-oss-3b-happy-new-year
- Contacto: heartmula.ai@gmail.com

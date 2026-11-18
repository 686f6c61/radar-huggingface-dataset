# MiniMaxAI/MiniMax-Music3

## Resumen

MiniMax Music 3 es un modelo de generacion de musica texto-a-audio desarrollado por MiniMaxAI, disenado para crear canciones completas de hasta cinco minutos de duracion a partir de una letra y una descripcion musical detallada. Combina una arquitectura hibrida de dos LLM (uno global de 8B inicializado desde Qwen3-8B y uno local de 0,6B) con un sistema de sintesis continua basado en Flow Matching y Flow-VAE, produciendo audio estereo a 32 kHz y 16 bits en formato WAV.

El modelo resuelve el problema de la coherencia musical a largo plazo: mantiene temas, ritmo, identidad vocal y progresion del arreglo a lo largo de secuencias extensas, permitiendo estructuras completas de cancion (intro, verso, estribillo, puente, solo instrumental, outro). Frente a generadores de fragmentos cortos, Music 3 apunta a produccion musical asistida donde la estructura global importa tanto como el detalle acustico.

Con 2.431.905.920 parametros totales en pesos safetensors y un repositorio de 67,2 GB, el modelo se distribuye bajo la libreria diffusers con pipeline `text-to-audio`. Su publicacion en Hugging Face (agosto de 2026, actualizado en octubre de 2026) acumula mas de 5.200 descargas y 1.500 likes, lo que indica interes activo de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Global LLM (8B, inicializado desde Qwen3-8B) + Local LLM (0,6B) + Flow Matching (2,4B) + Flow-VAE Decoder (123M) |
| Parametros totales | 2.431.905.920 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (existe archivo LICENSE en el repo, contenido no especificado) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 32 kHz, 16 bits, estereo (WAV) |
| Duracion maxima de generacion | hasta 5 minutos |
| Tokenizer musical | RVQ de 8 capas: 1 codebook semantico (16.384 entradas) + 7 codebooks acusticos (1.024 entradas cada uno) |
| Libreria | diffusers |
| Pipeline | text-to-audio |

## Arquitectura y entrenamiento

MiniMax Music 3 emplea una arquitectura autorregresiva jerarquica que separa el modelado musical global del acustico local. El Global LLM (8B) predice el primer codebook RVQ fotograma a fotograma y modela la progresion semantica y estructural de la cancion a largo plazo; el Local LLM (0,6B) predice los siete codebooks acusticos restantes dentro de cada fotograma y restaura el detalle fino. El Global LLM se inicializa desde Qwen3-8B: durante el entrenamiento se adaptan primero sus capas de embedding y salida a tokens musicales semanticos, y despues ambos LLM se entrenan conjuntamente para modelar todos los codebooks RVQ.

La sintesis no decodifica unicamente desde tokens RVQ discretos: fusiona los estados ocultos finales de ambos LLM y los pasa por un modulo de Flow Matching (2,4B) que genera el latente de un Flow-VAE, cuyo decoder (123M) produce audio estereo a 32 kHz. Esta representacion continua preserva informacion acustica mas rica para articulacion vocal, textura instrumental y continuidad temporal. La arquitectura Flow-VAE se adapta de MiniMax Speech y se reentrena para el rango dinamico y las caracteristicas espectrales de la musica. El tokenizer de entrenamiento usa ocho capas de Residual Vector Quantization: primero se optimiza el codebook semantico y despues se entrenan conjuntamente los ocho codebooks. En inferencia, la sintesis de onda usa los estados ocultos fusionados y no requiere el decoder discreto del tokenizer. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de musica completa texto-a-audio: canciones de hasta cinco minutos con estructura coherente (intro, verso, pre-estribillo, estribillo, post-estribillo, puente, instrumental, solo, outro).
- Control fino mediante letra con etiquetas de seccion explicitas (`[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Post-Chorus]`, `[Bridge]`, `[Instrumental]`, `[Solo]`, `[Outro]`).
- Control mediante descripcion musical: estilo, progresion emocional, interpretacion vocal, instrumentacion, arreglo y perfil de produccion.
- Soporte de caption estructurado en tres secciones: metadatos globales (genero, subgenero, BPM, tonalidad, escala, progresion emocional, escenario de escucha, perfil de produccion), detalles vocales (genero vocal, timbre, estilo interpretativo, armonias, coros, efectos vocales) y arreglo (instrumentos principales y secundarios, evolucion por seccion, groove, bajo, percusion, texturas, efectos espaciales).
- Coherencia a largo plazo de tema, ritmo, identidad vocal y progresion del arreglo.
- Voces expresivas con articulacion vocal preservada gracias a la sintesis por estados ocultos continuos.
- Generacion de audio estereo de calidad de produccion a 32 kHz y 16 bits.
- No disponible: soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada o modo thinking. Es un modelo especializado exclusivamente en generacion musical.

## Casos de uso

- Produccion de maquetas completas: un compositor introduce la letra con etiquetas de seccion y un caption estructurado con BPM, tonalidad y estilo; el modelo genera una maqueta de hasta cinco minutos con estructura completa para evaluar arreglo y progresion antes de la grabacion real.
- Generacion de musica de fondo para video y podcast: la descripcion musical permite fijar genero, ambiente y perfil de produccion, y la duracion de hasta cinco minutos cubre piezas de acompanamiento sin necesidad de concatenar fragmentos.
- Creacion de jingles y musica publicitaria: el control por secciones permite definir un estribillo corto y reconocible con letra especifica, y el caption vocal ajusta timbre y estilo interpretativo al tono de marca.
- Prototipado rapido de ideas musicales: iterar sobre variaciones de un mismo tema cambiando solo el caption (instrumentacion, groove, progresion emocional) manteniendo la letra, lo que acelera la exploracion creativa.
- Localizacion y adaptacion de canciones: al separar letra y descripcion musical, se puede mantener el arreglo y variar la letra para distintas versiones o idiomas, siempre que el modelo soporte el idioma de la letra (no confirmado en la informacion disponible).
- Educacion musical y analisis de estructura: generar ejemplos con secciones etiquetadas explicitamente para ilustrar formas musicales (verso-estribillo, forma AABA) en contextos docentes.
- Contenido para plataformas y demos tecnicas: el pipeline `text-to-audio` de diffusers permite integrar la generacion en flujos automatizados de creacion de contenido, con audio estereo listo para publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 67,2 GB en safetensors y los pesos declarados suman 2.431.905.920 parametros; la discrepancia entre ambos datos sugiere componentes adicionales (VAE, tokenizer, posibles pesos en precision alta) cuyo desglose no se detalla.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repositorio (67,2 GB) excede la VRAM de la mayoria de GPU consumer, por lo que previsiblemente requiere GPU de datacenter o cuantizacion (no documentada).
- Opciones de despliegue: libreria diffusers (pipeline `text-to-audio`); el tag `sglang-omni` sugiere soporte de SGLang para el componente LLM. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax Music 3 | 2.431.905.920 (global 8B + local 0,6B + Flow Matching 2,4B + VAE 123M) | Canciones de hasta 5 min; contexto no disponible | no disponible | safetensors (diffusers) | Hugging Face, API MiniMax |
| Alternativas de generacion musical texto-a-audio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre modelos comparables de la misma categoria (generacion musical texto-a-audio de formato largo) para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no disponible en la informacion proporcionada: existe un archivo LICENSE en el repositorio, pero su contenido no se especifica. Antes de cualquier uso comercial es imprescindible revisar dicho archivo directamente.
- Idiomas soportados no documentados: no se confirma que idiomas acepta la letra ni la descripcion musical; el rendimiento fuera del ingles o chino (idiomas habituales del ecosistema MiniMax/Qwen) es incierto.
- Riesgo de alucinacion musical: como modelo generativo, puede producir letras mal articuladas, secciones que no respetan las etiquetas o arreglos incoherentes con el caption, especialmente en descripciones ambiguas.
- Longitud de contexto no publicada: aunque se afirma coherencia en canciones de hasta cinco minutos, no se detalla la ventana de contexto del Global LLM ni como escala con la duracion.
- Requisitos de hardware elevados: el repositorio de 67,2 GB y la ausencia de cuantizaciones documentadas limitan el despliegue en entornos con GPU de consumo.
- Dependencia de la calidad del caption: el control fino depende de un caption estructurado bien redactado; descripciones pobres producen resultados genericos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta la evaluacion objetiva previa a adopcion.
- Posibles sesgos estilisticos y vocales derivados del dataset de entrenamiento, cuya composicion no se detalla.
- No apto para tareas fuera de generacion musical: carece de tool calling, agentes, vision o razonamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia (archivo en el repo): https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Demo de ejemplos: https://minimax-ai.github.io/music3-demo/
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-Music3
- Organizacion en Hugging Face: https://huggingface.co/MiniMaxAI
- Documentacion de API: https://platform.minimax.io/docs/guides/text-generation
- Web oficial de MiniMax: https://www.minimax.io
- MiniMax Code: https://agent.minimax.io/
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/DPC4AHFCBw
- Contacto (FAQ): https://platform.minimaxi.com/docs/faq/contact-us

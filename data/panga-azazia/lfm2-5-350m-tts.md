# Panga-Azazia/LFM2.5-350M-TTS

## Resumen

LFM2.5-350M-TTS es un ajuste fino (fine-tuning) del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario Panga-Azazia, orientado a la sintesis de voz (text-to-speech) en bambara (`bm`), una lengua mande hablada principalmente en Mali. El repositorio declara la pipeline `text-to-speech` en HuggingFace, pero conserva etiquetas propias de modelos de lenguaje (`text-generation`, `lfm2`), lo que sugiere un enfoque de TTS construido sobre un decoder transformer de tipo LLM en lugar de sobre una arquitectura acustica dedicada (Tacotron, VITS, etc.).

El modelo cuenta con 382.682.880 parametros reales segun los tensores en safetensors, lo que lo situa en la gama ultra-ligera y lo hace candidato a inferencia en CPU o en GPUs de consumo. Se ha entrenado con SFT mediante las librerias Unsloth y TRL (`generated_from_trainer`) sobre tres conjuntos de datos de RobotsMali: `afvoices`, `kunkado` y `jeli-asr`, todos ellos vinculados a voces y corpus de Africa Occidental.

Su relevancia es fundamentalmente de nicho: el bambara es una lengua con muy poca cobertura en sistemas TTS comerciales, y un modelo abierto de menos de 400 M de parametros especializado en ella puede habilitar aplicaciones de accesibilidad, educacion y servicios publicos en Mali. Ahora bien, el acceso esta restringido (gated), la licencia no esta declarada y no se han publicado benchmarks, por lo que su evaluacion en produccion exige una validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (familia LFM2 de Liquid AI, segun tag y modelo base); detalles internos no disponibles |
| Parametros totales | 382.682.880 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo distribuido en safetensors sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | Bambara (`bm`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline declarada | text-to-speech |
| Modelo base | LiquidAI/LFM2.5-350M |
| Metodo de ajuste | SFT con Unsloth + TRL (`generated_from_trainer`) |
| Datasets de entrenamiento | RobotsMali/afvoices, RobotsMali/kunkado, RobotsMali/jeli-asr |
| Tamano del repositorio | 559,7 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 32 / 0 |
| Fecha de creacion / actualizacion | 2026-07-03 / 2026-10-25 |

## Arquitectura y entrenamiento

El repositorio hereda la arquitectura `lfm2` del modelo base LiquidAI/LFM2.5-350M, un transformer decoder de 382,7 M de parametros. No se documenta en la informacion disponible la composicion exacta de capas, el tipo de atencion ni si se emplean componentes convolucionales o de estado recurrente propios de la familia LFM2. Tampoco se especifica la longitud de contexto efectiva ni la tokenizacion empleada para la parte textual.

El entrenamiento se realizo mediante supervised fine-tuning con Unsloth y TRL, partiendo del modelo base y utilizando tres corpus de RobotsMali: `afvoices` (voces africanas), `kunkado` y `jeli-asr` (material ASR). No se indica el numero de tokens, la duracion total de audio, la estrategia de alineacion texto-audio, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla como se representa la salida acustica: al mantener la pipeline `text-to-speech` sobre un LLM y no declararse un vocoder o codec neural explicito, la sintesis podria apoyarse en tokens discretos de audio, pero este extremo no esta confirmado en la informacion proporcionada.

## Capacidades

- Sintesis de voz en bambara (`bm`), segun la pipeline declarada y el idioma etiquetado.
- Generacion de texto: el repositorio conserva la etiqueta `text-generation` y la cabeza del modelo base, aunque no se documenta su calidad tras el ajuste.
- Ajuste supervisado sobre corpus de voz y ASR de Africa Occidental, lo que sugiere capacidad de modelar fonetica y prosodia del bambara.
- Compatibilidad con `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al bambara segun la metadata; no se declaran otros idiomas.
- Vision, audio de entrada o modo "thinking": no disponibles.

## Casos de uso

- Accesibilidad para personas con discapacidad visual en Mali: lectura en voz alta de textos en bambara con un modelo de menos de 400 M de parametros, desplegable en servidor modesto o incluso en dispositivo.
- Servicios publicos e informacion sanitaria: locucion automatica de avisos y campanas en bambara, un idioma practicamente ausente en los TTS comerciales, lo que reduce la dependencia de traductores humanos para contenidos repetitivos.
- Educacion primaria y alfabetizacion: generacion de material audio de apoyo para escuelas con conectividad limitada, aprovechando el reducido coste computacional del modelo.
- Contenido radiofonico y podcasts: produccion de voces de locucion para boletines y resumenes de noticias en bambara, con revision humana posterior.
- Preservacion linguistica: creacion de corpus audio sintetico y herramientas de documentacion del bambara, combinables con los propios datasets de RobotsMali.
- Integracion en asistentes conversacionales de voz: al derivar de un LLM, puede encadenarse en un pipeline ASR (por ejemplo, `jeli-asr`) + LLM + TTS para interfaces habladas de bajo coste.
- Prototipado de investigacion en TTS de bajos recursos: punto de partida para experimentos de adaptacion a otras lenguas mande con presupuesto de computo minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MOS (Mean Opinion Score), WER/CER de intelligibilidad, ni comparaciones objetivas con otros sistemas TTS para bambara. Los unicos indicadores de adopcion disponibles son 32 descargas y 0 likes desde su creacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en fp16 para los 382,7 M de parametros, mas el overhead del runtime y, en su caso, del decodificador acustico; un presupuesto realista de 2 a 4 GB cubre la mayoria de configuraciones.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso iGPUs con suficiente memoria compartida.
- Viabilidad en CPU: alta por el reducido numero de parametros, aunque la latencia dependera del vocoder o esquema de decodificacion de audio no documentado.
- GPU de datacenter (A100, H100): innecesarias para inferencia individual; solo tendrian sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: `transformers` es la via documentada por la libreria del repositorio. vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta pipeline de TTS.
- Advertencia de descarga: el repositorio ocupa 559,7 GB, muy por encima de lo esperable para 382,7 M de parametros (unos 1,5 GB en fp32), lo que apunta a artefactos adicionales o checkpoints intermedios; conviene inspeccionar la lista de ficheros antes de descargar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Panga-Azazia/LFM2.5-350M-TTS | 382,7 M | No disponible | TTS | Bambara | No disponible | Gated en HuggingFace |
| LiquidAI/LFM2.5-350M (base) | ~350 M (nominal) | No disponible | Generacion de texto | No disponible | No disponible | Publico en HuggingFace |
| Alternativas TTS para bambara | No disponible | No disponible | TTS | No disponible | No disponible | No identificadas en la busqueda realizada |

No se han identificado en la informacion proporcionada otros modelos abiertos de TTS especificos para bambara con los que establecer una comparacion cuantitativa. La busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos trataban sobre el pez panga y no guardan relacion).

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial; es imprescindible contactar con el autor o consultar los terminos del acceso restringido antes de cualquier despliegue productivo.
- Acceso gated: la descarga y el uso requieren aceptar condiciones en HuggingFace, lo que anade friccion a la reproducibilidad y a la integracion en CI/CD.
- Ausencia total de benchmarks: no hay evidencia publica de intelligibilidad, naturalidad (MOS) ni robustez; cualquier evaluacion debe realizarse de forma interna.
- Riesgo de alucinacion y artefactos acusticos: al derivar de un modelo de lenguaje, existe riesgo de prosodia incorrecta, omisiones o invencion de contenido en entradas fuera de dominio, especialmente con numeros, nombres propios y prestamos del frances.
- Cobertura linguistica muy limitada: solo bambara; no se declaran capacidades multilingues ni cambios de codigo (code-switching) con frances, frecuentes en el contexto maliense.
- Sesgos de dominio: el modelo se entrena con corpus de voz concretos (`afvoices`, `kunkado`, `jeli-asr`); puede reproducir sesgos de genero, edad, dialecto o registro de los hablantes presentes en esos datos.
- Longitud de contexto y manejo de entradas largas: no documentados, lo que impide garantizar la sintesis fiable de parrafos extensos.
- Repositorio de 559,7 GB: coste de almacenamiento y descarga desproporcionado respecto al tamano del modelo, con riesgo de incluir estados de optimizador u otros artefactos no necesarios para inferencia.
- Madurez: 32 descargas y 0 likes indican una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- Falta de documentacion de la cadena acustica: no se especifica vocoder, codec ni formato de salida de audio, lo que complica la integracion y la estimacion real de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Panga-Azazia/LFM2.5-350M-TTS
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Dataset RobotsMali/afvoices: https://huggingface.co/datasets/RobotsMali/afvoices
- Dataset RobotsMali/kunkado: https://huggingface.co/datasets/RobotsMali/kunkado
- Dataset RobotsMali/jeli-asr: https://huggingface.co/datasets/RobotsMali/jeli-asr
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada (la busqueda web no devolvio resultados relacionados con el modelo).

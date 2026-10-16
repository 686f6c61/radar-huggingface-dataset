# maya-research/maya1

## Resumen

Maya-1 es un modelo de texto a voz (TTS) de pesos abiertos desarrollado por Maya Research. Su rasgo distintivo es que permite definir la voz mediante descripciones en lenguaje natural (edad, timbre, acento, ritmo, tono, intensidad) e introducir controles expresivos en linea dentro del propio texto a sintetizar, en lugar de limitarse a elegir entre un menu fijo de hablantes predefinidos. El modelo genera la locucion como tokens de audio discretos que despues se decodifican a una onda de 24 kHz mono.

Tecnicamente es un transformer decoder-only basado en la implementacion `LlamaForCausalLM`, con aproximadamente 3,30 mil millones de parametros (3.300.928.512 segun los metadatos de tensores del Hub). La representacion de audio usa codigos discretos SNAC y el decodificador de referencia es `hubertsiuzdak/snac_24khz`. Los pesos se distribuyen en BF16 y la libreria principal es `transformers`.

Es relevante ahora porque combina en un unico modelo abierto de 3B dos lineas que hasta hace poco estaban separadas: la clonacion/diseno de voz por descripcion textual y el control expresivo local. Frente a alternativas cerradas, publica checkpoint, tokenizador y codigo de inferencia de referencia bajo licencia Apache 2.0, lo que facilita su integracion en pipelines propios de sintesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`) |
| Parametros totales | 3.300.928.512 (aprox. 3,30 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en BF16) |
| Idiomas soportados | No disponible (los ejemplos de la model card estan en ingles) |
| Licencia | Apache 2.0 (segun metadatos del repositorio) |
| Formato de pesos | Safetensors (BF16) |
| Tarea | Text-to-speech con diseno de voz por descripcion y control expresivo |
| Representacion de audio | Codigos discretos SNAC |
| Decoder de referencia | `hubertsiuzdak/snac_24khz` |
| Salida nativa | Audio mono a 24 kHz |
| Tamano del repositorio | 99,1 GB |
| Descargas | 7089 |
| Likes | 913 |
| Fecha de creacion | 2025-10-18 |
| Ultima actualizacion | 2026-10-13 |

## Arquitectura y entrenamiento

Maya-1 usa una arquitectura transformer decoder-only estilo Llama, reutilizando el bloque `LlamaForCausalLM` para modelar secuencias de tokens de audio. El texto de entrada se acompania de una descripcion de voz en lenguaje natural y, opcionalmente, de marcadores expresivos en linea; todo ello condiciona la secuencia de codigos acusticos que el modelo genera. Esos codigos se decodifican a audio con el decodificador SNAC `hubertsiuzdak/snac_24khz`, que produce onda mono a 24 kHz. El modelo se distribuye en precisión BF16.

El diseno separa el "que se dice" del "como suena": una parte del prompt aporta las palabras, otra guia la voz global (edad, timbre, acento, ritmo, tono e intensidad) y los marcadores en linea solicitan expresiones locales concretas, como `<laugh_harder>`, `<snort>` o `<cry>`. La model card indica que el modelo cubre mas de 20 emociones y estilos vocales. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de voz a partir de texto con descripcion de voz en lenguaje natural (edad, genero, acento, timbre, ritmo, intensidad).
- Control expresivo local mediante marcadores en linea dentro del texto (risa, resoplidos, llanto, entre otros).
- Cobertura declarada de mas de 20 emociones y estilos vocales.
- Diseno de voces de personaje: acentos (por ejemplo, americano, britanico, de Oriente Medio en los ejemplos), tonos (neutro, calido, oscuro, gritado) y registros (narrador, presentador, villano, deidad).
- Salida de audio mono a 24 kHz.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, ya que se trata de un modelo TTS.
- No se documenta soporte multilingue explicito; los ejemplos publicados estan en ingles.

## Casos de uso

- Doblaje y localizacion de contenido audiovisual: el modelo permite fijar una voz coherente mediante una descripcion textual reutilizable y anadir expresiones locales por linea, lo que simplifica mantener una misma "voz" a lo largo de escenas.
- Narracion de audiolibros: con control de ritmo, tono e intensidad se pueden generar lecturas expresivas donde los cambios emocionales se marcan en el propio texto sin reentrenar voces.
- Voces dinamicas para videojuegos: los NPC pueden recibir una descripcion de voz distinta por personaje y disparar expresiones en tiempo real segun el guion, reduciendo la dependencia de un elenco grabado.
- Prototipado de personajes para animacion: util para generar pistas de voz temporales (previz) con acentos y timbres concretos antes de contratar actores de doblaje.
- Asistentes de voz y sistemas IVR: la salida a 24 kHz mono es adecuada para telefonia y aplicaciones de respuesta de voz interactiva, con control del tono para ajustar la percepcion del asistente.
- Accesibilidad: lectura en voz alta de documentos con voz configurable, util para herramientas de sintesis para personas con discapacidad visual o dislexia.
- Produccion de podcasts y publicidad: combinacion de descripciones de voz con marcadores de risa, suspiros o enfasis para generar promos y cortinillas sin estudio.
- Agentes conversacionales con voz: integracion en pipelines donde un LLM genera texto y Maya-1 lo convierte en audio expresivo, aunque el modelo en si no gestiona el dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 6,6 GB para los 3,30 mil millones de parametros, mas el decodificador SNAC (un modelo adicional pequeno) y las activaciones y cache de decodificacion.
- Cabe en GPU de consumo: por ejemplo, una RTX 3060 de 12 GB o superior puede alojar los pesos en BF16 con margen; una RTX 4090 de 24 GB ofrece margen amplio.
- Cuantizacion aproximada (estimaciones a partir del numero de parametros): 8 bits en torno a 3,3 GB y 4 bits en torno a 1,7 GB, si se generan variantes cuantizadas, aunque la informacion disponible no confirma cuantizaciones publicadas.
- Atencion: el repositorio ocupa 99,1 GB, por lo que conviene reservar espacio en disco muy superior al tamano de los pesos de inferencia (probablemente por multiples ficheros de checkpoints).
- GPU profesionales (A100, H100) permiten mayor paralelismo y lotes mas grandes, utiles para servir muchas peticiones concurrentes.
- Opciones de despliegue: inferencia de referencia con `transformers`; la etiqueta `text-generation-inference` sugiere compatibilidad con TGI, y `endpoints_compatible` con los Endpoints de Hugging Face. La salida son tokens de audio que requieren el decodificador SNAC, por lo que un despliegue estandar de `llama.cpp` no bastaria sin anadir ese paso de decodificacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La siguiente comparativa se limita a caracteristicas estructurales ampliamente documentadas; los datos de calidad de sintesis no estan disponibles en la informacion proporcionada y no se comparan.

| Modelo | Parametros | Arquitectura | Representacion de audio | Licencia | Control expresivo | Disponibilidad |
|---|---|---|---|---|---|---|
| Maya-1 | 3,30B | Transformer decoder-only (Llama) | SNAC | Apache 2.0 | Descripcion de voz + marcadores en linea | Pesos abiertos en Hugging Face |
| Orpheus TTS | ~3B | Llama-3.2-3B | SNAC | Apache 2.0 con condiciones de Llama | Etiquetas emotivas en linea | Pesos abiertos |
| Sesame CSM-1B | ~1B | Llama | Mimi | Apache 2.0 | Limitado | Pesos abiertos |
| Coqui XTTS-v2 | ~0,47B | Transformer + clonacion | Tokens acusticos | Licencia CPML (restricciones comerciales) | Limitado | Pesos abiertos |

Datos de rendimiento comparado (similitud de voz, naturalidad, MOS): no disponibles.

## Limitaciones y advertencias

- No se documentan en la informacion disponible los sesgos del modelo; al tratarse de un modelo de sintesis de voz, existe riesgo de reproducir sesgos de acento, genero o etnia presentes en los datos de entrenamiento.
- Riesgo de alucinacion acustica: la generacion de audio autoregresiva puede producir artefactos, prosodia erronea o pronunciacion defectuosa en textos fuera de dominio o poco frecuentes.
- Cobertura de idiomas no confirmada; los ejemplos publicados estan en ingles y el modelo podria no generalizar bien a otras lenguas.
- Longitud de contexto no disponible: no se puede garantizar la coherencia de voz en textos largos sin fragmentacion.
- Licencia: el modelo declara Apache 2.0, pero la model card menciona notas de licencia de componentes; el decodificador SNAC (`hubertsiuzdak/snac_24khz`) es un componente separado con su propia licencia que conviene revisar antes de un uso comercial. Verificar tambien la licencia de cualquier dataset o modelo base implicado.
- Uso responsable: un modelo capaz de disenar voces por descripcion y de imitar acentos puede emplearse para suplantacion o desinformacion; se recomienda aplicar controles de consentimiento y marcado de audio sintetico.
- Requisitos de disco elevados (repositorio de 99,1 GB) para descarga y despliegue.
- No hay datos publicados de benchmarks, por lo que la comparacion de calidad con alternativas debe hacerse por evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maya-research/maya1
- Decodificador SNAC de referencia: https://huggingface.co/hubertsiuzdak/snac_24khz
- Ejemplos de audio de la model card:
  - https://cdn-uploads.huggingface.co/production/uploads/642a7d4e556ab448a0701ca1/4zDlBLeFk0Y2rOrQhMW9r.wav
  - https://cdn-uploads.huggingface.co/production/uploads/642a7d4e556ab448a0701ca1/mT6FnTrA3KYQnwfJms92X.wav
  - https://cdn-uploads.huggingface.co/production/uploads/642a7d4e556ab448a0701ca1/oxdns7uACCmLyC-P4H30G.wav
  - https://cdn-uploads.huggingface.co/production/uploads/642a7d4e556ab448a0701ca1/ggzAhM-rEUyv_mPLSALQG.wav
- Paper, repositorio de codigo o demo oficial: no disponibles en la informacion proporcionada.

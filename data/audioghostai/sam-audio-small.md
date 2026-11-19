# audioghostai/sam-audio-small

## Resumen

SAM-Audio Small (copia de AudioGhost) es un modelo de separación de fuentes de audio guiado por texto, publicado por el usuario `audioghostai` como reempaquetado no oficial de los pesos de Meta `facebook/sam-audio-small`. El objetivo es permitir que los usuarios de la herramienta AudioGhost descarguen los pesos sin necesidad de una cuenta de Hugging Face. No está hecho, respaldado ni soportado por Meta.

El modelo se centra exclusivamente en la separación de audio mediante indicaciones textuales (por ejemplo, aislar una voz concreta o un instrumento descrito en lenguaje natural). Para ello utiliza un transformer de difusión junto con capas auxiliares (embedding de ancla, proyecciones y alineamiento de vídeo), y emplea el codificador de texto público `t5-base`. Se ha omitido el codificador visual, que en el checkpoint original solo se usa para el prompting visual, y el códec de audio necesario reside en el repositorio separado `audioghostai/sam-audio-shared`.

La relevancia de esta ficha radica en que documenta una copia comunitaria de un modelo de Meta con licencia SAM, en formato safetensors (fp32 y fp16), lo que facilita su integración en pipelines de audio-to-audio sin depender de checkpoints pickled. Al no haber datos publicados de benchmarks ni de idiomas soportados, la evaluación debe basarse en las especificaciones técnicas y en las pruebas que haga el propio usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para separacion de audio guiada por texto, con capas auxiliares (anchor embedding, proyecciones, alineamiento de video) |
| Parametros totales | no disponible (pesos fp32 de 1,85 GB; el numero exacto de parametros no se indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 y fp16 (safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el codificador de texto es `t5-base`, multilingue en origen, pero no se declaran idiomas para la tarea) |
| Licencia | SAM License (license_name: sam-license) |
| Formato de pesos | safetensors (`model.fp32.safetensors`, `model.fp16.safetensors`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura se basa en un transformer de difusión que opera sobre representaciones de audio y recibe condicionamiento textual a través de `t5-base`. Alrededor del transformer principal se incluyen un embedding de ancla, proyecciones y capas de alineamiento de vídeo, que en el checkpoint original permiten también el prompting visual. Esta copia elimina el codificador visual y delega el códec de audio al repositorio compartido `audioghostai/sam-audio-shared`, de modo que solo se conservan las partes necesarias para la separación guiada por texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El checkpoint se ofrece en fp32 (valores originales de Meta, sin cambios) y en fp16 (los mismos tensores convertidos a media precisión, que es el valor por defecto de AudioGhost). El `config.json` es idéntico al de Meta.

## Capacidades

- Separación de fuentes de audio guiada por texto: permite aislar o extraer componentes descritos en lenguaje natural (por ejemplo, una voz o un instrumento concreto).
- Procesamiento audio-to-audio: la pipeline declarada es `audio-to-audio`, orientada a transformar una mezcla de entrada en una o varias pistas separadas.
- Condicionamiento mediante `t5-base`: el texto de la indicación se codifica con el codificador público de T5, lo que permite describir la fuente objetivo con lenguaje natural.
- Alineamiento de vídeo: se conservan las capas de alineamiento de vídeo del checkpoint original, aunque el codificador visual no está incluido en esta copia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades multilingües específicas para la tarea de separación.

## Casos de uso

- Producción musical y postproducción: separar una mezcla en pistas de voz, batería o instrumentos descritos por texto para su posterior edición o remezcla; el condicionamiento con `t5-base` permite indicar la fuente objetivo sin etiquetas predefinidas.
- Limpieza de grabaciones de voz: aislar la voz principal de una grabación con ruido de fondo o música, usando una indicación textual como "voz hablada", lo que resulta útil en podcasting y transcripción.
- Doblaje y localización: extraer la pista de voz de un vídeo para sustituirla o procesarla por separado, aprovechando las capas de alineamiento de vídeo conservadas en el checkpoint.
- Creación de datasets de audio: generar pistas separadas a partir de mezclas para entrenar o evaluar otros modelos de reconocimiento de audio o de habla.
- Restauración de archivos históricos: separar componentes musicales o vocales de grabaciones antiguas para su conservación o remasterización.
- Investigación en separación de fuentes: servir como punto de partida para experimentos con prompting textual, dado que se incluye el checkpoint fp32 para fine-tuning y el fp16 para inferencia rápida.
- Integración en herramientas de escritorio: al estar empaquetado para AudioGhost y en safetensors, puede cargarse en flujos locales sin depender de checkpoints pickled.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos en fp16 (946,5 MB) y cerca de 2 GB para fp32 (1,85 GB), sin contar el códec de audio del repositorio compartido ni las activaciones.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder cargar los pesos, aunque el rendimiento real depende del códec y del pipeline de AudioGhost.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamaño reducido de los pesos en fp16.
- Opciones de despliegue: la model card menciona AudioGhost como herramienta de referencia; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un modelo de audio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audioghostai/sam-audio-small | no disponible (1,85 GB fp32) | no disponible | Separacion de audio por texto | SAM License | Hugging Face (copia comunitaria) |
| facebook/sam-audio-small | no disponible | no disponible | Separacion de audio por texto | SAM License | Hugging Face (original de Meta) |
| Otras alternativas de separacion de fuentes | no disponible | no disponible | Separacion de audio | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta copia y el checkpoint original de Meta, ni con otros modelos de separación de fuentes.

## Limitaciones y advertencias

- Copia no oficial: no está hecha, respaldada ni soportada por Meta; los usuarios deben asumir que cualquier problema de integridad o comportamiento debe verificarse contra el checkpoint original.
- Licencia SAM: el uso, redistribución y trabajos derivados están sujetos a la SAM License, incluida la sección de Trade Controls; es obligatorio incluir una copia de la licencia al redistribuir.
- Falta el codificador visual: esta copia no admite prompting visual, solo separación guiada por texto.
- Dependencia externa: el códec de audio necesario está en `audioghostai/sam-audio-shared`, por lo que la inferencia requiere descargar también ese repositorio.
- Sin datos de benchmarks ni de idiomas: no se puede garantizar el rendimiento en dominios concretos ni en idiomas distintos del inglés sin evaluación propia.
- Riesgo de alucinación y artefactos: al ser un modelo generativo de difusión, puede producir separaciones imperfectas o artefactos en mezclas complejas; no se documentan sesgos conocidos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación.
- Formatos limitados: solo se ofrecen fp32 y fp16 en safetensors; no hay versiones cuantizadas a 8 bits o 4 bits documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/audioghostai/sam-audio-small
- Modelo base: https://huggingface.co/facebook/sam-audio-small
- Repositorio del códec compartido: https://huggingface.co/audioghostai/sam-audio-shared
- Herramienta AudioGhost: https://github.com/0x0funky/audioghost-ai
- Licencia SAM: incluida como `LICENSE` en el repositorio del modelo

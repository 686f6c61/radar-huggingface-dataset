# Sony/OmniUE-3B

## Resumen

OmniUE-3B es un embedder universal condicionado por instrucciones desarrollado por Sony que proyecta texto, imagen, vídeo y audio en un único espacio de embeddings de 2.048 dimensiones. El modelo resuelve el problema de la recuperación multimodal (retrieval) heterogénea: en lugar de mantener codificadores separados por modalidad, permite consultas cruzadas como texto-a-vídeo, texto-a-audio o imagen-a-texto con una sola arquitectura y una instrucción en lenguaje natural que define el objetivo de la representación.

Técnicamente es un adaptador LoRA sobre Qwen2.5-Omni-3B (un modelo any-to-any de 3.000 millones de parámetros), complementado con un módulo de interacción basado en SAM-Audio y SAM3. Este módulo permite condicionar el embedding a regiones visuales (cajas delimitadoras o puntos) y a intervalos temporales de audio, lo que habilita recuperación a nivel de objeto o de evento sonoro en lugar de solo a nivel de documento completo. Las salidas de capa se combinan mediante pesos conjuntos de capa y token.

El modelo es relevante porque unifica tareas que hasta ahora requerían pipelines especializados (CLAP para audio, CLIP/SigLIP para imagen, modelos de vídeo dedicados) y porque introduce interacción explícita en el propio espacio de embeddings. Su licencia CC BY-NC 4.0 restringe el uso comercial, por lo que su ámbito natural es la investigación en recuperación multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-Omni-3B (transformer multimodal any-to-any) + módulo de interacción SAM-Audio + SAM3 |
| Parametros totales | 3.000 millones (modelo base); el adaptador LoRA y el módulo de interacción se suman sobre esta base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | mixta: pesos OmniUE y wrapper bajo CC BY-NC 4.0; SAM-Audio y SAM3 bajo Meta SAM License; componentes Qwen bajo sus licencias upstream |
| Formato de pesos | safetensors (repositorio de 11,4 GB con adaptador, SAM-Audio y SAM3 incluidos) |

## Arquitectura y entrenamiento

OmniUE-3B parte de Qwen2.5-Omni-3B, un transformer multimodal que procesa texto, imagen, vídeo y audio. Sobre él se entrena un adaptador LoRA y se añade un módulo de interacción que integra SAM-Audio (segmentación de audio) y SAM3 (segmentación visual). La representación final se obtiene mezclando las salidas de varias capas del transformer con pesos conjuntos de capa y token ("joint layer-token weights"), una técnica que combina información de distintos niveles de abstracción en un único vector de 2.048 dimensiones, L2-normalizado y en float32.

El entrenamiento está orientado a tareas de recuperación condicionada por instrucción: el mismo par (entrada, instrucción) produce embeddings comparables entre modalidades. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La innovación principal es la interacción multimodal en el espacio de embeddings: cajas delimitadoras y puntos para imagen, e intervalos temporales (spans) para audio, que permiten representar un objeto o un evento concreto dentro de una entrada más amplia.

## Capacidades

- Generación de embeddings multimodales unificados en un espacio compartido de 2.048 dimensiones para texto, imagen, vídeo y audio.
- Recuperación any-to-any: texto-a-imagen, texto-a-vídeo, texto-a-audio, imagen-a-texto, vídeo-a-texto, audio-a-texto y combinaciones cruzadas.
- Condicionamiento por instrucción: la cadena de instrucción modifica la representación resultante, permitiendo adaptar el embedding a la tarea de recuperación.
- Interacción visual: embeddings de objetos seleccionados mediante cajas delimitadoras normalizadas `[x1, y1, x2, y2]` o puntos con etiquetas de primer plano/fondo.
- Interacción de audio: embeddings de segmentos temporales concretos mediante spans `(inicio, fin)` en segundos.
- Procesamiento de vídeo con decodificación de audio asociada (requiere `ffmpeg` en el PATH).
- API programática con métodos `encode_text`, `encode_image`, `encode_video` y `encode_audio`, más utilidad `cosine_topk` para búsqueda por similitud.
- Capacidad multilingüe: limitada a inglés según la model card.

## Casos de uso

- Búsqueda semántica de vídeo en archivos audiovisuales: indexar un catálogo de vídeos con `encode_video` y recuperar clips mediante consultas de texto, útil en productoras, televisiones y plataformas de contenido que necesitan localizar escenas sin metadatos manuales.
- Recuperación de eventos sonoros concretos: usar spans temporales para aislar un sonido dentro de una grabación larga (por ejemplo, una sirena en un registro de tráfico) y recuperarlo después por descripción textual.
- Búsqueda de objetos en imágenes a nivel de región: con cajas delimitadoras o puntos, generar embeddings de productos o elementos específicos dentro de una fotografía y construir motores de búsqueda visual para catálogos de comercio electrónico.
- Moderación y análisis de contenido multimodal: comparar descripciones textuales con fragmentos de vídeo o audio para detectar contenido que coincida con políticas definidas, aprovechando la capacidad de condicionar la consulta por instrucción.
- Sistemas de recomendación cross-modal: representar ítems de distinta naturaleza (pódcast, vídeo, imagen, texto) en el mismo espacio y calcular similitudes directamente, simplificando la infraestructura frente a pipelines con codificadores separados.
- Investigación en recuperación multimodal: evaluar y comparar técnicas de embedding interactivo sobre los benchmarks MMEB-v2-video, MAEB, SCaR y OmniCHOIR, para los que el modelo publica resultados.
- Anotación asistida de datasets: dado un vídeo o audio y una descripción, recuperar automáticamente los segmentos correspondientes para preetiquetar datos de entrenamiento.

## Benchmarks y rendimiento

Los resultados publicados en la model card se presentan como gráficas; solo se dispone de los valores agregados citados en el texto.

| Benchmark | Tarea | Resultado OmniUE-3B | Resultado OmniUE-7B | Referencia |
|---|---|---|---|---|
| MMEB-v2-video | Vídeo interactivo por texto | +5,1 sobre el mejor baseline del mismo tamaño | overall 51,8; +4,3 sobre el mejor baseline del mismo tamaño | Mejor baseline de tamaño comparable |
| MAEB | Audio interactivo por texto | no disponible | overall 53,4 (mejor global; lidera 7 de 8 metatareas frente a LCO-Emb-7B) | LCO-Emb-7B, Qwen2-Audio, CLAP |
| SCaR | Recuperación región-caption imagen+texto+caja | +20,7 puntos sobre el mejor baseline de 2B | overall 55,2; +27,4 puntos sobre el mejor baseline de 7B | Mejores baselines de 2B y 7B |
| OmniCHOIR | Recuperación de audio omni-interactiva | no disponible | 28,4 Recall@1 con las tres indicaciones | Baselines sin soporte de span |

En MAEB, el modelo cede frente a Qwen2-Audio y los modelos CLAP en clustering, y frente a LCO-Emb en recuperación cross-modal, según reconoce la propia model card.

## Requisitos de hardware

- El repositorio ocupa 11,4 GB e incluye el adaptador OmniUE, el checkpoint de SAM-Audio y el checkpoint de SAM3; además, en el primer uso se descargan Qwen2.5-Omni-3B y las dependencias de T5.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo base de 3.000 millones de parámetros en float16 requiere del orden de 6-7 GB solo para los pesos, a los que se suman los módulos de segmentación y las activaciones; se recomienda una GPU con al menos 16-24 GB para trabajar con comodidad en las cuatro modalidades.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 son opciones razonables; en GPUs consumer de 8-12 GB el margen será ajustado y requerirá cuantización, para la que no se documentan formatos.
- Despliegue: la librería es un paquete Python propio (`omniue`) instalable con `pip install -e .`, basado en `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo que es esperable al tratarse de un modelo de embeddings y no de generación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidades | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniUE-3B | 3B (base) + LoRA | Texto, imagen, vídeo, audio; interacción por caja/punto/span | no disponible | CC BY-NC 4.0 (pesos propios) + licencias de terceros | HuggingFace (Sony/OmniUE-3B) |
| OmniUE-7B | 7B (base) | Texto, imagen, vídeo, audio; interacción | no disponible | no disponible en la información proporcionada | Referenciado en la model card como variante mayor |
| LCO-Emb-7B | 7B | Audio y texto (recuperación cross-modal) | no disponible | no disponible | Baseline en MAEB y OmniCHOIR |
| Qwen2-Audio | no disponible | Audio y texto | no disponible | no disponible | Baseline en MAEB |
| CLAP (familia) | no disponible | Audio y texto | no disponible | no disponible | Baseline en MAEB |

Frente a LCO-Emb-7B, OmniUE-7B lidera 7 de 8 metatareas de MAEB, aunque LCO-Emb mantiene ventaja en recuperación cross-modal. Frente a Qwen2-Audio y CLAP, OmniUE pierde en tareas de clustering. La ventaja diferencial de OmniUE es la cobertura de cuatro modalidades en un solo espacio con interacción explícita.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0 para los pesos propios: el uso comercial está prohibido sin acuerdo adicional con Sony.
- Componentes de terceros con licencias distintas: SAM-Audio y SAM3 bajo la Meta SAM License, y Qwen2.5-Omni bajo su licencia upstream; es responsabilidad del usuario verificar el cumplimiento de cada una.
- Modelo orientado a investigación: no ha sido evaluado para decisiones de alto riesgo ni para entornos de seguridad crítica, según la propia model card.
- Soporte de idiomas limitado al inglés, lo que restringe su uso en castellano u otras lenguas sin evaluación adicional.
- El rendimiento varía según dominio, calidad de la modalidad de entrada, idioma y formulación de la instrucción; la sensibilidad al prompt es un factor de riesgo en producción.
- Riesgo de sesgos heredados del modelo base Qwen2.5-Omni y de los datasets de entrenamiento no documentados.
- No se documentan el volumen ni la composición de los datos de entrenamiento, lo que dificulta auditar sesgos y alucinaciones en la representación.
- Requiere `ffmpeg` en el PATH para decodificar audio de vídeos; sin él, la ruta de vídeo con audio falla.
- No se documentan formatos de cuantización ni soporte para servidores de inferencia estándar, lo que complica el despliegue a escala.
- Las coordenadas de cajas y puntos deben normalizarse a `[0, 1]`; un uso incorrecto produce embeddings degenerados sin aviso explícito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sony/OmniUE-3B
- Modelo base Qwen2.5-Omni-3B: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Paper (arXiv:2608.27044): https://arxiv.org/abs/2608.27044
- Página del proyecto: https://wywywang.github.io/omniue-demo/
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/

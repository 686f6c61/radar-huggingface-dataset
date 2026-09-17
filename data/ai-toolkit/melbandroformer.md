# ai-toolkit/melbandroformer

## Resumen

Mel-Band RoFormer (vocals) para ai-toolkit es un repack en formato safetensors del modelo de separacion de voces Mel-Band RoFormer publicado originalmente por Kimberley Jensen. El modelo realiza separacion de fuentes musicales (music source separation) con una unica tarea: dividir una cancion en dos pistas, una de voz y otra instrumental, donde la instrumental se obtiene por resta (`instrumental = mix - vocals`). El repositorio lo mantiene el proyecto ai-toolkit, que lo descarga automaticamente para sus flujos de trabajo de audio.

No se trata de un modelo de lenguaje ni de un modelo generativo de audio: es una red de separacion que opera sobre la forma de onda o el espectrograma y devuelve dos senales. La arquitectura es Mel-Band RoFormer, una evolucion del Band-Split RoFormer que combina un band-split basado en bandas mel con un transformer que emplea rotary positional embeddings (RoPE). El paper de referencia es Wang et al., 2023 (arXiv:2310.01809).

Su relevancia practica esta en que empaqueta en un unico fichero safetensors los pesos originales en fp32 junto con los hiperparametros de inferencia (`chunk_size`, `num_overlap`) en los metadatos, eliminando la necesidad de un fichero de configuracion aparte. Esto simplifica la integracion en pipelines de produccion que ya usan ai-toolkit para generacion de audio, entrenamiento de LoRAs o preparacion de datasets.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (band-split con bandas mel + transformer con rotary positional embeddings) |
| Parametros totales | No disponible (el autor no declara el recuento; el unico fichero fp32 pesa ~0,9 GB, lo que situa el orden de magnitud en torno a 200-230 M de parametros) |
| Longitud de contexto | No aplica: modelo de audio. Procesa segmentos definidos por `chunk_size` y `num_overlap`, almacenados en los metadatos del safetensors |
| Tipos de cuantizacion | Solo fp32 en safetensors. No se publican versiones cuantizadas (fp16, bf16, int8 ni GGUF) |
| Idiomas soportados | No disponible (la tarea es independiente del idioma; opera sobre audio musical) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, tensores identicos byte a byte al `.ckpt` original) |
| Tarea / pipeline | audio-to-audio (separacion de fuentes musicales, fuente unica: voz) |
| Frecuencia de muestreo | Entrada mono o estereo a cualquier tasa (remuestreo interno a 44,1 kHz); salida a la tasa de entrada |
| Salidas | Dos pistas: `vocals` e `instrumental` |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura Mel-Band RoFormer parte del esquema band-split: la entrada se proyecta en un banco de bandas de frecuencia y cada banda se procesa como una secuencia independiente antes de aplicar atencion. La variante mel-band sustituye la division de bandas original por bandas alineadas con la escala mel, y el bloque transformer incorpora rotary positional embeddings (RoPE) para modelar la estructura temporal. Este diseno reduce el coste computacional frente a una atencion densa sobre el espectrograma completo y mejora la separacion en bandas donde la voz y los instrumentos se solapan.

El entrenamiento del checkpoint concreto que se redistribuye aqui se realizo con el framework Music-Source-Separation-Training de Roman Solovyev (ZFTurbo), usando la configuracion `config_vocals_mel_band_roformer_kj.yaml` especifica para voz. La implementacion de referencia de la arquitectura es la de Phil Wang (lucidrains/BS-RoFormer). La informacion proporcionada no detalla el volumen de datos de entrenamiento, la composicion del dataset ni la funcion de perdida empleada, por lo que no se pueden confirmar esos extremos. Al no ser un modelo generativo de texto, no hay fases de RLHF, DPO ni ajuste por preferencias.

La aportacion tecnica del repack es de empaquetado, no de modelado: un script de conversion transcribe los pesos del `.ckpt` original a safetensors y traslada los kwargs del modelo y los valores por defecto de inferencia a los metadatos del fichero, de modo que la carga no requiere configuracion externa.

## Capacidades

- Separacion de voz e instrumental en pistas musicales completas, con salida de dos ficheros independientes.
- Acepta entrada mono o estereo, a cualquier frecuencia de muestreo, y devuelve la salida a la tasa original de entrada.
- Procesamiento por segmentos con solapamiento configurable (`num_overlap`) para pistas de duracion arbitraria, superando la limitacion del `chunk_size` interno.
- Inferencia con `torch.compile` activable desde la API de carga (`compile=True`).
- Integracion directa con ai-toolkit: descarga automatica del fichero y uso mediante CLI (`python -m toolkit.audio.melbandroformer song.flac`) o API de Python (`load_melbandroformer`, `separate`).
- No soporta tool calling, function calling ni uso como agente.
- No soporta generacion de texto, codigo, matematicas, vision ni audio generativo.
- No es multilingue en el sentido textual; el rendimiento depende del contenido acustico, no del idioma cantado.
- No existe modo de razonamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Generacion de pistas de karaoke: el modelo extrae la instrumental eliminando la voz principal, lo que permite publicar versiones sin voz de un catalogo musical con un unico paso de inferencia.
- Remezclas y produccion musical: obtener la acapella para reutilizarla en nuevas mezclas, mashups o ediciones, manteniendo el resto de la instrumentacion intacta por resta.
- Preparacion de datasets para entrenamiento de modelos de audio: generar pares voz/instrumental alineados a partir de musica comercial para entrenar modelos de sintesis de voz cantada, conversores de voz o modelos generativos condicionados.
- Preprocesado para reconocimiento automatico de voz (ASR) sobre musica: separar la voz mejora la precision de sistemas de transcripcion de letras y de alineacion forzada (forced alignment) para subtitulado.
- Analisis musicologico y transcripcion: aislar la linea vocal facilita la transcripcion melodica, el analisis de vibrato, tesitura o tecnica vocal, y la extraccion de caracteristicas para sistemas de recomendacion musical.
- Herramientas para DJ y actuaciones en directo: separacion de stems al vuelo para permitir transiciones, loops de acapella o efectos en tiempo real sobre la pista instrumental.
- Remasterizacion y rebalanceo de mezclas: ajustar el nivel relativo de voz e instrumental en grabaciones donde la mezcla original no permite editar las pistas por separado.
- Limpieza de archivos de audio para publicacion: generar versiones instrumentales para uso en locales, streaming o entornos donde la licencia de la letra impide su difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repack no incluye metricas SDR, SIR ni SAR, ni comparaciones con otros sistemas. El paper de referencia (arXiv:2310.01809) reporta resultados de la arquitectura Mel-Band RoFormer, pero no se dispone en la informacion proporcionada de las cifras concretas de este checkpoint de voz ni de su evaluacion sobre MUSDB18-HQ u otros conjuntos.

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB solo para los pesos en fp32 (fichero de 0,9 GB). Con activaciones y el procesamiento por segmentos, una estimacion prudente es de 2 a 4 GB de VRAM; no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. El modelo cabe sin problema en tarjetas de consumo como GTX 1650 4 GB, RTX 3060, RTX 4060, RTX 4090 o superiores. En el extremo profesional, A100 o H100 aportarian mas velocidad pero no son necesarias.
- CPU: es tecnicamente posible ejecutarlo en CPU con PyTorch, pero no hay datos de rendimiento publicados; se espera un factor de tiempo real muy por encima de 1.
- Despliegue: no hay soporte en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La via oficial es ai-toolkit (PyTorch) o el framework Music-Source-Separation-Training de ZFTurbo. No se documentan exportaciones a ONNX, TensorRT ni CoreML.
- Latencia y throughput: no disponible. El uso de `num_overlap` implica procesar cada fragmento mas de una vez y promediar, lo que incrementa linealmente el coste respecto al numero de solapamientos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mel-Band RoFormer (este repack) | Band-split + transformer con RoPE, especializado en voz | No disponible (~200-230 M estimados por tamano de fichero) | MIT | HuggingFace (ai-toolkit/melbandroformer) | Salida de 2 pistas por resta; metadatos de inferencia incluidos |
| Mel-Band RoFormer original (KimberleyJSN) | Misma arquitectura | No disponible | MIT | HuggingFace (KimberleyJSN/melbandroformer, `.ckpt`) | Pesos de origen de este repack; requiere config externa |
| Band-Split RoFormer (BS-RoFormer) | Band-split + transformer con RoPE, predecesor | No disponible | No disponible (depende del checkpoint) | Repositorio lucidrains/BS-RoFormer | Referencia arquitectonica; el paper de Mel-Band reporta mejoras sobre esta base |
| Demucs v4 (htdemucs) | Hibrido tiempo-frecuencia | No disponible | MIT | Repositorio y pesos publicos de Meta AI | Separa 4 stems (bateria, bajo, otros, voz); tarea mas amplia, mas coste |

Las cifras de rendimiento comparado (SDR) no estan disponibles en la informacion proporcionada, por lo que no se puede establecer una jerarquia cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Los pesos no son originales del publicador: ai-toolkit redistribuye el checkpoint de Kimberley Jensen. Cualquier cita o atribucion debe dirigirse a los autores originales (Kimberley Jensen, Roman Solovyev por el framework y la configuracion, Phil Wang por la implementacion y Wang et al. por el paper).
- El modelo solo distingue dos clases: voz e instrumental. No separa bateria, bajo ni otros stems; para eso hacen falta modelos multistem como Demucs.
- La pista instrumental se calcula por resta (`mix - vocals`), lo que puede introducir artefactos de cancelacion en pasajes con contenido espectral solapado entre voz e instrumentos.
- Riesgo de degradacion en voces corales, voces muy procesadas (autotune, reverberacion intensa), duetos o fragmentos hablados dentro de la musica.
- No hay resultados de benchmarks publicados en la ficha, por lo que no se puede validar la calidad frente a alternativas sin una evaluacion propia.
- No existen cuantizaciones oficiales; el reparto en fp32 ocupa mas memoria y ancho de banda que una version en fp16 o bf16, que habria que generar por cuenta propia.
- Si se convierte el fichero a otros formatos, se pueden perder los metadatos con `chunk_size` y `num_overlap`, lo que obliga a reconstruir la configuracion de inferencia.
- La licencia MIT permite uso comercial del modelo, pero no otorga ningun derecho sobre las obras musicales procesadas; la responsabilidad sobre los derechos de las grabaciones es del usuario.
- No hay garantia de mantenimiento: el repositorio registra 0 descargas y 0 likes, y la fecha de creacion es posterior a la de la mayoria de los modelos de referencia del ecosistema.
- El rendimiento depende de la frecuencia de muestreo final: la entrada se remuestrea internamente a 44,1 kHz, lo que puede alterar el resultado en material grabado a otras tasas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai-toolkit/melbandroformer
- Pesos originales de Kimberley Jensen: https://huggingface.co/KimberleyJSN/melbandroformer
- Repositorio ai-toolkit: https://github.com/ostris/ai-toolkit
- Script de conversion: https://github.com/ostris/ai-toolkit/blob/main/scripts/convert_melbandroformer.py
- Framework de entrenamiento Music-Source-Separation-Training: https://github.com/ZFTurbo/Music-Source-Separation-Training
- Configuracion de entrenamiento para voz: https://github.com/ZFTurbo/Music-Source-Separation-Training/blob/main/configs/KimberleyJensen/config_vocals_mel_band_roformer_kj.yaml
- Implementacion de la arquitectura BS-RoFormer: https://github.com/lucidrains/BS-RoFormer
- Paper Mel-Band RoFormer for Music Source Separation: https://arxiv.org/abs/2310.01809

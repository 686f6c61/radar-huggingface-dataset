# JuwanH/Ornith-1.5-35B-A3B-abliterated-MTP-Vision-GGUF

## Resumen

Ornith-1.5-35B-A3B-abliterated-MTP-Vision-GGUF es una distribución GGUF del modelo Ornith-1.5-35B-A3B, un transformer de mezcla de expertos (MoE) publicado por ornith-ai. Esta variante concreta, mantenida por el usuario JuwanH, combina tres piezas en un único paquete: los pesos abliterated (sin el condicionamiento de rechazo del modelo original) procedentes de NjProVk, una cabeza MTP (multi-token prediction) extraída del GGUF oficial de Ornith y un proyector de visión Q8_0 tomado de Qwen3.6-35B-A3B. El resultado es un modelo multimodal de imagen-texto a texto, sin censura y con decodificación especulativa integrada, empaquetado para llama.cpp.

El interés técnico de esta ficha no está en el modelo base, sino en el trabajo de injerto y en las mediciones que el autor aporta sobre una Jetson Orin. El modelo declara 35B de parámetros totales con 3B activos por token, pero la model card muestra un dato de safetensors de 446.571.248 parámetros que resulta incoherente con esa cifra y que conviene tratar con cautela. El repositorio pesa 0,6 GB, aunque el archivo principal Q4_K_M declarado ocupa 21,7 GB, lo que sugiere que la subida está incompleta o que el tamaño reportado por Hugging Face no refleja el contenido real.

La relevancia actual es doble: por un lado, demuestra que se puede añadir una cabeza MTP a un GGUF ajeno a nivel de contenedor y obtener una aceleración medible (62,1 tok/s frente a 52,2 tok/s sin cabeza, con una aceptación del 65 %); por otro, documenta el coste real de habilitar visión con `--image-min-tokens 1024` en hardware de borde. Es un artefacto de investigación reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con cabeza MTP de 1 capa adicional |
| Parametros totales | 35B declarados (3B activos); el dato de safetensors del repo indica 446.571.248, incoherente con la cifra declarada |
| Parametros activos | 3B (según nomenclatura A3B) |
| Longitud de contexto | 49.152 tokens en la configuración de referencia (`-c 49152`) |
| Tipos de cuantizacion | Q4_K_M para el modelo; Q8_0 para el proyector de visión; caché KV en q8_0 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (cabeza MTP con licencia MIT según la tabla de linaje) |
| Formato de pesos | GGUF (llama.cpp), más un `mmproj` GGUF separado para visión |

## Arquitectura y entrenamiento

El modelo base es un MoE con 40 bloques transformer y atención con normalización QK (`attn_q_norm`, `attn_k_norm`), más expertos compartidos y enrutados (`ffn_*_exps`, `ffn_*_shexp`, `ffn_gate_inp`, `ffn_gate_inp_shexp`). La cabeza MTP ocupa el bloque 40 y añade 20 tensores: proyecciones de atención, FFN de expertos, `nextn.eh_proj`, `nextn.enorm`, `nextn.hnorm` y `nextn.shared_head_norm`. El injerto se realizó a nivel GGUF con el script `graft_mtp.py`, incrementando `qwen35moe.block_count` de 40 a 41 y añadiendo `qwen35moe.nextn_predict_layers = 1`. La cabeza extraída pesa 546.703.360 bytes.

El proyector de visión funciona porque la dimensión oculta del modelo de lenguaje y la salida del tower de visión coinciden en 2048; ambos towers comparten profundidad 27, hidden 1152 y salida 2048. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO), ni el proceso de abliteration aplicado por NjProVk. La innovación destacable es la decodificación especulativa mediante MTP en llama.cpp (`--spec-type draft-mtp --spec-draft-n-max 2`), que el autor mide con aceptación del 65 % en prompts de código y del 46 % en narrativa.

## Capacidades

- Generación de texto en inglés con razonamiento y código; el autor reporta entre 63 y 70 tok/s en prompts de código y estructurados.
- Entrada multimodal de imagen y texto (`image-text-to-text`) mediante el proyector `mmproj`, con lectura de texto en imágenes cuando se usa `--image-min-tokens 1024`.
- Decodificación especulativa con cabeza MTP integrada, activable por flag en llama.cpp.
- Modo sin censura (abliterated): los pesos han sido modificados para eliminar el condicionamiento de rechazo del modelo original.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Lectura de documentos en imágenes en dispositivos de borde: con `--image-min-tokens 1024` el modelo resuelve texto de una sola línea sobre fondo plano o invertido en aproximadamente 1,9 s por imagen en Jetson Orin, lo que lo hace viable para digitalización de formularios o tickets en campo.
- Aceleración de inferencia local con MTP: en un servidor llama.cpp sobre Jetson Orin, activar la cabeza MTP sube el throughput de 52,2 a 62,1 tok/s con aceptación del 65 %, útil para asistentes interactivos con latencia ajustada.
- Investigación sobre abliteration y alineación: permite comparar el comportamiento del modelo con y sin condicionamiento de rechazo en tareas de generación libre, con la salvedad de que el proceso de abliteration no está documentado.
- Prototipado de pipelines multimodales en llama.cpp: sirve para validar integraciones de `mmproj` y flags de visión antes de pasar a modelos con soporte oficial.
- Evaluación de decodificación especulativa: el repositorio incluye el script de injerto y las mediciones de aceptación por tipo de prompt (código frente a narrativa), lo que facilita reproducir el experimento con otras cabezas MTP.
- Experimentación con cuantización Q4_K_M y caché KV q8_0 en memoria unificada: el autor documenta el consumo de RAM con `--cache-ram 0` (unos 2 GB libres estables frente a 0,89 GB con caché activa), relevante para dimensionar despliegues en placas embebidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí aporta mediciones propias de velocidad y de calidad en código:

| Configuración | tok/s | Aceptación MTP |
|---|---:|---:|
| q4mma on + cabeza MTP | 62,1 | 65 % |
| q4mma on, sin cabeza | 52,2 | no aplica |
| q4mma off + cabeza MTP | 57,0 | no disponible |
| q4mma off, sin cabeza | 45,5 | no aplica |

| Semillas | Ejecuciones | q4mma on (aprobados) | q4mma off (aprobados) |
|---|---:|---:|---:|
| 1 a 26 | 54 | 33 | 48 |
| 31 a 60 | 90 | 65 | 66 |
| 61 a 90 | 90 | 66 | 57 |
| Total | 234 | 164 (70 %) | 171 (73 %) |

Las pruebas de código usan tres prompts difíciles (min_window, regex, decode_string) con temperatura 0,6 y la cabeza MTP activa. En narrativa el rendimiento baja a unos 52,6 tok/s con aceptación del 46 %.

## Requisitos de hardware

- El archivo Q4_K_M declarado ocupa 21,7 GB, por lo que la inferencia completa requiere al menos esa cantidad de memoria más la caché KV y el proyector (614 MB en Q8_0).
- Hardware de referencia: NVIDIA Jetson Orin (sm_87, memoria unificada, unos 29 GB de RAM, 10 hilos de CPU), con `-ngl 99`, `-fa on`, `-c 49152`, caché KV q8_0 y `--cache-ram 0`.
- No cabe en GPUs de consumo con 8-16 GB de VRAM en Q4_K_M; sería necesario recurrir a cuantizaciones menores no incluidas en este repositorio.
- Despliegue mediante `llama-server` de llama.cpp; el autor mantiene un parche con kernels q4mma/q6mma para sm_87 en https://github.com/Juwan-Hwang/llama.cpp-orin-sm87, aunque la configuración de ejecución funciona también en una build oficial.
- Throughput medido: 62,1 tok/s con MTP y kernels q4mma en Jetson Orin; latencia de visión de aproximadamente 1,9 s por imagen con `--image-min-tokens 1024` y de unos 0,6 s sin ese flag.
- Con `--cache-ram 0`, un prompt de 11.609 tokens que reaparece tras otras peticiones se reprocesa en 9,9 s en lugar de 0,1 s; las repeticiones consecutivas siguen tardando 0,1 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-abliterated-MTP-Vision (este) | 35B totales / 3B activos | 49.152 | Apache-2.0 | GGUF + mmproj | Añade MTP y visión por injerto; solo inglés |
| NjProVk/Ornith-1.5-35B-A3B-abliterated-GGUF | 35B totales / 3B activos | no disponible | Apache-2.0 | GGUF | Pesos abliterated sin cabeza MTP ni visión |
| ornith-ai/Ornith-1.5-35B-A3B-GGUF | 35B totales / 3B activos | no disponible | MIT (según linaje) | GGUF | Versión oficial con cabeza MTP, sin abliteration |
| Qwen/Qwen3.6-35B-A3B | 35B totales / 3B activos | no disponible | Apache-2.0 | safetensors, GGUF | Origen del proyector de visión; modelo multimodal oficial |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El dato de parámetros de safetensors (446.571.248) contradice los 35B declarados; verificar los pesos antes de cualquier uso en producción.
- El tamaño del repositorio (0,6 GB) no concuerda con el archivo Q4_K_M declarado (21,7 GB); es posible que la subida esté incompleta.
- El proceso de abliteration no está documentado: se desconoce qué comportamientos se han eliminado y con qué método, lo que dificulta evaluar sesgos y riesgos.
- Riesgo elevado de alucinación y de contenido inapropiado al tratarse de un modelo sin censura; no apto para aplicaciones orientadas al usuario final sin filtros adicionales.
- Soporte exclusivo de inglés según la model card; no se garantiza calidad en castellano.
- La visión depende de un proyector de otro modelo (Qwen3.6-35B-A3B) acoplado por coincidencia de dimensiones (salida 2048), no por entrenamiento conjunto; la fiabilidad fuera de los casos probados por el autor es desconocida.
- La lectura de texto en imágenes exige `--image-min-tokens 1024`, que triplica la latencia por imagen (1,9 s frente a 0,6 s).
- `--cache-ram 0` evita fugas de memoria en peticiones repetidas de imagen, pero penaliza la reprocesión de prompts largos (9,9 s frente a 0,1 s).
- Los kernels q4mma/q6mma son parches no oficiales sobre el commit `e412c6f468b7` de llama.cpp; su disponibilidad futura no está garantizada.
- Aunque la licencia declarada es Apache-2.0, la cabeza MTP figura como MIT en la tabla de linaje; conviene revisar la compatibilidad en uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JuwanH/Ornith-1.5-35B-A3B-abliterated-MTP-Vision-GGUF
- Pesos abliterated de origen: https://huggingface.co/NjProVk/Ornith-1.5-35B-A3B-abliterated-GGUF
- Modelo base oficial: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF oficial con cabeza MTP: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Proyector de visión de origen: https://huggingface.co/eaddario/Qwen3.6-35B-A3B-GGUF
- Modelo Qwen de origen del proyector: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Parches llama.cpp para Jetson Orin sm_87: https://github.com/Juwan-Hwang/llama.cpp-orin-sm87

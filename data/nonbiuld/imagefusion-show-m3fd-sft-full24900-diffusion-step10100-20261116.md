# Nonbiuld/ImageFusion-Show-M3FD-SFT-full24900-diffusion-step10100-20261116

## Resumen

ImageFusion-Show M3FD es un checkpoint de entrenamiento (no un modelo final publicado) derivado de `showlab/show-o2-1.5B-HQ`, un modelo multimodal de 1.500 millones de parámetros. El autor, bajo el identificador Nonbiuld, lo entrena para una tarea muy específica: fusión de imágenes infrarrojas y visibles (image fusion) sobre el conjunto de datos M3FD. El objetivo es generar una única imagen fusionada que combine información térmica del infrarrojo con el detalle espacial del visible, un problema clásico en visión por computador aplicado a vigilancia, conducción nocturna y teledetección.

El checkpoint corresponde al paso 10.100 de optimizador dentro de una fase de ajuste fino solo de difusión, aproximadamente 11,77 de 30 épocas. Se inicializa desde un checkpoint previo de paso 24.900 con todos los parámetros entrenables. No es un modelo exportable vía `transformers.from_pretrained`: es un estado PyTorch del proyecto ImageFusion-Show y requiere su código de carga e inferencia.

La relevancia es acotada y experimental: se trata de un snapshot intermedio de un entrenamiento en curso, con evaluación limitada a una sola escena y sin resultados agregados sobre conjuntos de validación. Resulta útil para reproducibilidad y para quienes siguen el proyecto, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabezal de difusión por flow-matching (base Show-o2 1.5B); módulos AR y compartidos congelados, solo `diff_proj`, `diffusion_head_a` y `diffusion_head_b` entrenables |
| Parametros totales | 1.500 millones (modelo base); checkpoint de 18,33 GB incluye estados de optimizador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original, sin conversión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`), no safetensors ni GGUF; no compatible con `from_pretrained` |
| Tamano del checkpoint | 18.330.596.908 bytes (18,33 GB) |
| SHA256 | `0deac359da0a6de0003389b2c6aece4537118612a7b149ba495f22a41deca5e3` |
| Modelo base | `showlab/show-o2-1.5B-HQ` (revision fijada `45a5a2de01d1ebd10cd5864d29310a76476cdf23`) |
| VAE / tokenizer | Wan2.1 VAE y tokenizer cargados por separado por el proyecto |
| Tarea | Fusión de imágenes IR + VIS (dataset M3FD) |
| Fase de entrenamiento | 10.100 pasos de optimizador, ~11,77 / 30 épocas de difusión |

## Arquitectura y entrenamiento

El modelo parte de Show-o2 1.5B, una arquitectura multimodal que combina un transformer autorregresivo con un cabezal de difusión. En esta fase de ajuste fino solo se entrenan tres módulos: `diff_proj`, `diffusion_head_a` y `diffusion_head_b`; el resto de parámetros (incluidos los autorregresivos y compartidos) permanece congelado. La pérdida es exclusivamente de flow-matching, con pesos 1:1:1 sobre las modalidades IR, VIS y fusión. El VAE y el tokenizer de Wan2.1 se cargan aparte y no forman parte del checkpoint.

El entrenamiento se ejecutó en siete GPUs con batch size 1 por GPU, acumulación de gradientes 1 y batch global de 7, usando atención SDPA original e imágenes rectangulares nativas. El checkpoint contiene los 910 tensores de estado del modelo, el estado del optimizador para los 139 tensores de difusión entrenables, el estado del scheduler, el estado RNG de los siete rangos y metadatos de entrenamiento. La supervisión de fusión emplea pseudo-referencias generadas con LRRNet. El snapshot se tomó con el entrenamiento aún en curso y no corresponde al modelo final de 30 épocas.

## Capacidades

- Fusión de imágenes infrarrojas y visibles en una única salida, orientada al dataset M3FD.
- Generación condicionada mediante flow-matching sobre el espacio latente del VAE de Wan2.1.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo en la información disponible; el ajuste se limita a la tarea de fusión.
- No se documenta soporte de visión general más allá de la entrada IR/VIS del pipeline de fusión.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en fusión de imágenes: servir como punto de partida reproducible para experimentos con M3FD, cargando el checkpoint con el código del proyecto ImageFusion-Show y comparando contra el paso 24.900 previo.
- Reproducción de entrenamientos: el estado completo de optimizador, scheduler y RNG de siete rangos permite reanudar la fase de difusión exactamente donde se tomó el snapshot.
- Vigilancia nocturna: la fusión IR/VIS es adecuada para generar imágenes que preserven firmas térmicas y detalle visible, útiles en sistemas de monitorización con poca luz; requiere validación adicional antes de uso real.
- Conducción asistida en condiciones adversas: la combinación de información térmica y visible es relevante para detección de peatones y obstáculos de noche o con niebla, aunque este checkpoint no ha sido evaluado en esos escenarios.
- Teledetección y análisis de escenas: la fusión de bandas IR y VIS puede alimentar pipelines de inspección, siempre que se valide sobre datos no vistos.
- Estudio de métodos de supervisión débil: el uso de pseudo-referencias LRRNet como supervisión es un caso de interés para quienes investigan entrenamiento sin ground truth real.
- Base para ablaciones de flow-matching: al estar congelados los módulos AR, el checkpoint aísla el efecto del cabezal de difusión, útil para comparar estrategias de pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que este snapshot exacto (paso 10.100) no ha sido evaluado por separado. La evaluación del paso 8.600 se limitó a la escena 00000, ya vista en entrenamiento, con estas observaciones cualitativas: la restauración C09 mejoró, la entrada IR original presentó un desplazamiento vertical y la fusión con entrada original retrocedió respecto a full24500. Son observaciones de una sola escena, no rendimiento agregado sobre datos reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint pesa 18,33 GB e incluye estados de optimizador. Para inferencia solo del modelo (1,5B parámetros más cabezales de difusión y VAE Wan2.1) se requiere cargar pesos y VAE por separado; el consumo exacto no está documentado.
- GPU recomendadas: no disponible en la información. El entrenamiento se realizó en siete GPUs, lo que sugiere requisitos multi-GPU para el pipeline completo.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del checkpoint y la necesidad del VAE de Wan2.1 hacen probable que no quepa en GPUs de gama consumer sin cuantización, pero no hay datos que lo verifiquen.
- Opciones de despliegue: solo mediante el código del proyecto ImageFusion-Show (https://github.com/Reborn986/ImageFusion-Show). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un export de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ImageFusion-Show M3FD (este) | 1,5B (base) | no disponible | Fusión IR/VIS | no disponible | `.pt` PyTorch | Checkpoint intermedio, repo de 18,3 GB |
| Show-o2 1.5B HQ (base) | 1,5B | no disponible | Multimodal general | no disponible | safetensors / Transformers | Modelo base publicado por showlab |
| Checkpoint full step24900 | 1,5B (base) | no disponible | Fusión IR/VIS | no disponible | `.pt` PyTorch | Checkpoint previo del mismo autor |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas de fusión de imágenes; la comparación se limita a procedencia, formato y fase de entrenamiento.

## Limitaciones y advertencias

- No es un modelo final: el entrenamiento seguía en curso al tomar el snapshot (~11,77 de 30 épocas de difusión).
- Sin evaluación agregada: no hay resultados sobre conjuntos de validación reservados; la única observación es de una escena vista en entrenamiento.
- Regresión observada: en el paso 8.600, la fusión con entrada original empeoró respecto a full24500 y la entrada IR mostró desplazamiento vertical.
- Supervisión con pseudo-referencias LRRNet, no con ground truth real, lo que introduce sesgos del generador de referencias.
- Licencia no declarada: no se puede confirmar el uso comercial; además, el modelo base Show-o2 y el VAE Wan2.1 tienen sus propias condiciones que deben verificarse.
- Formato no estándar: requiere el código del proyecto; no funciona con `from_pretrained` ni con herramientas de inferencia convencionales.
- Idiomas y sesgos: no documentados; al ser un modelo de imagen, el riesgo principal es de sesgo visual en los datos M3FD (escenas de vigilancia y tráfico).
- Riesgo de alucinación visual: como modelo generativo con difusión, puede producir detalles inexistentes en la escena fusionada.
- No apto para producción sin validación previa y sin confirmación de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/Nonbiuld/ImageFusion-Show-M3FD-SFT-full24900-diffusion-step10100-20261116
- Checkpoint previo (full step24900): https://huggingface.co/Nonbiuld/ImageFusion-Show-M3FD-SFT-full-step24900-20261115
- Repositorio del proyecto: https://github.com/Reborn986/ImageFusion-Show
- Modelo base: https://huggingface.co/showlab/show-o2-1.5B-HQ

# abccbd/TACTUS-TactusNet

## Resumen

TACTUS (Tool, Action, Contact and Trajectory Understanding in Surgery) es un conjunto de checkpoints de PyTorch para el analisis de video quirurgico. El repositorio, publicado por el usuario abccbd, contiene los pesos de referencia de la red TactusNet, los cabezales de esta red reentrenados sobre otros codificadores congelados y las lineas base del benchmark asociado. No se trata de un modelo de lenguaje generativo, sino de un conjunto de modelos especializados en comprension de video quirurgico con tareas de clasificacion de herramienta y accion, localizacion temporal de la ventana de interaccion y deteccion de puntos clave espaciales (instrumentos y region de contacto).

La arquitectura combina un codificador de video congelado, V-JEPA 2.1 ViT-L en la configuracion de referencia (16 fotogramas a 384 x 384), con una serie de cabezales entrenados especificamente para cada tarea: semantico, temporal, espacial en dos etapas, decodificador de contacto y refinador a resolucion nativa. El repositorio incluye tambien variantes con codificadores alternativos (V-JEPA 2 ViT-L a 256, VideoMAE ViT-L y Endo-FM ViT-B) y checkpoints de lineas base publicadas (TSN, TSM, VideoMAE, X-CLIP, Endo-FM, ActionFormer, TriDet, QD-DETR, MS-TCN, HRNet-W32, ViTPose-B, DSTA y SegFormer-B2) entrenadas sobre el split Gold.

Su relevancia es acotada pero clara para el ambito de investigacion en cirugia asistida por ordenador: proporciona pesos reproducibles para un benchmark multimodal de video quirurgico, con recetas de entrenamiento publicadas en el repositorio de codigo y checksums SHA256 para verificar la integridad de los ficheros. El repositorio ocupa 15,9 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de video congelado (V-JEPA 2.1 ViT-L) con cabezales especificos por tarea (semantico, temporal, espacial, contacto, refinador) |
| Parametros totales | No disponible (depende del checkpoint; los ficheros espaciales rondan 1,3 GB cada uno por incluir estado de entrenamiento) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; entrada de 16 fotogramas a 384 x 384 (referencia) o 16 x 256² / 16 x 224² en variantes |
| Tipos de cuantizacion | No disponible (checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Mixta: cabezales TactusNet y `backbones/` bajo MIT; lineas base heredan licencias de pesos de terceros (algunas sin uso comercial) |
| Formato de pesos | Checkpoints PyTorch (`.pt`) cargables con `torch.load`; checksums en `SHA256SUMS` |

## Arquitectura y entrenamiento

El diseno sigue un esquema de codificador congelado mas cabezales entrenados. El codificador de referencia es V-JEPA 2.1 ViT-L, que procesa 16 fotogramas a 384 x 384 y no se distribuye en el repositorio: debe descargarse por separado desde la release oficial de V-JEPA 2 (`vjepa2_1_vitl_dist_vitG_384.pt`). Sobre sus tokens se entrenan cinco componentes: un cabezal semantico que predice el par valido herramienta-accion entre seis posibles, un cabezal temporal que localiza la ventana de interaccion dentro de la ventana de accion, un cabezal espacial en dos etapas (deteccion de tres puntos clave del instrumento en el fotograma completo y en el recorte ampliado), un decodificador de contacto que estima las cuatro esquinas de la region de contacto a partir de objetivos derivados de las puntas (hindsight) y un refinador de pixeles que ajusta los puntos clave a resolucion nativa.

Se ofrecen dos variantes de entrenamiento: `tactusnet_gold/`, entrenada solo con el split Gold y reportada como TactusNet, y `tactusnet_gold_silver/`, que anade el split Silver. Las recetas de entrenamiento estan publicadas en el repositorio de codigo (`training/repro/classification/train_stage2.sh`, `training/repro/action_range/train_best.sh`, `training/unitap/experiments/runs/E007k/run.sh`, `E009/run.sh`, `C006/run.sh` y `training/unitap/tools/pixel_refiner.py`). Los datos de entrenamiento proceden de videos de Cholec80, HeiChole, CRCD, SurgVU y una coleccion de YouTube. No se especifica en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo de vision de este tipo).

## Capacidades

- Clasificacion semantica de herramienta y accion quirurgica como par valido entre seis combinaciones.
- Localizacion temporal de la ventana de interaccion dentro de la ventana de accion.
- Deteccion de tres puntos clave del instrumento en el fotograma completo (etapa 1) y en recorte ampliado (etapa 2).
- Estimacion de la region de contacto mediante cuatro esquinas, con objetivos derivados de las puntas de instrumento.
- Refinamiento de puntos clave a resolucion nativa de pixel.
- Extraccion de caracteristicas de video quirurgico mediante codificadores alternativos (V-JEPA 2 ViT-L a 256, VideoMAE ViT-L, Endo-FM ViT-B).
- Evaluacion comparativa frente a lineas base de clasificacion, localizacion temporal, puntos clave y segmentacion de contacto.
- No dispone de generacion de texto, tool calling, capacidades de agente ni soporte multilingue; es un modelo puramente visual.

## Casos de uso

- Analisis retrospectivo de videos quirurgicos: el cabezal semantico permite etiquetar cada segmento con el par herramienta-accion, util para auditar procedimientos y construir registros estructurados a partir de grabaciones de quirófano.
- Segmentacion temporal de fases de interaccion: el cabezal temporal localiza la ventana exacta en la que el instrumento interactua con el tejido, lo que facilita la sincronizacion con otras senales (por ejemplo, datos de sensores o anotaciones externas).
- Seguimiento de instrumentos: los cabezales espaciales en dos etapas y el refinador permiten obtener puntos clave precisos de las puntas de los instrumentos, base para sistemas de asistencia o analisis de destreza.
- Deteccion de region de contacto: el decodificador de contacto estima donde el instrumento toca el tejido, relevante para estudiar patrones de manipulacion y evaluar tecnicas quirurgicas.
- Benchmark de investigacion: los checkpoints de lineas base (TSN, TSM, VideoMAE, X-CLIP, Endo-FM, ActionFormer, TriDet, QD-DETR, MS-TCN, HRNet-W32, ViTPose-B, DSTA, SegFormer-B2) permiten reproducir comparativas sobre el split Gold con configuraciones oficiales.
- Estudio de transferencia entre codificadores: las variantes en `backbones/` permiten medir como afecta el codificador congelado (V-JEPA 2, VideoMAE, Endo-FM) al rendimiento de los mismos cabezales, util para seleccionar representaciones en nuevos proyectos.
- Formacion y evaluacion de residentes: la deteccion de puntos clave y regiones de contacto puede integrarse en herramientas de analisis de destreza quirurgica, siempre en contexto de investigacion y no como dispositivo medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, los checkpoints espaciales ocupan unos 1,3 GB cada uno por incluir estado de entrenamiento, y el codificador V-JEPA 2.1 ViT-L debe cargarse aparte, lo que incrementa notablemente el consumo de memoria.
- GPU recomendadas: no disponible. El procesamiento de 16 fotogramas a 384 x 384 con un ViT-L sugiere GPUs con al menos 16-24 GB de VRAM para inferencia comoda, aunque no se confirma en la informacion.
- GPU de consumo: no confirmado; un ViT-L a 384 x 384 con 16 fotogramas probablemente requiera GPUs de gama alta (RTX 4090 o superior), pero no hay datos oficiales.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(path, map_location="cpu", weights_only=False)`) y ejecucion mediante el pipeline del repositorio de codigo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Codificador | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TactusNet (este repo) | Cabezales sobre codificador congelado | V-JEPA 2.1 ViT-L (384) | Clasificacion, temporal, puntos clave, contacto | MIT (cabezales) | Pesos publicados, codificador aparte |
| Lineas base incluidas (TSN, TSM, VideoMAE, X-CLIP, Endo-FM, ActionFormer, TriDet, QD-DETR, MS-TCN, HRNet-W32, ViTPose-B, DSTA, SegFormer-B2) | Metodos publicados reentrenados | Variables | Clasificacion, temporal, puntos clave, segmentacion | Heredada de pesos de terceros | Incluidas en el repo |
| Variantes `backbones/` | Mismos cabezales sobre otros codificadores | V-JEPA 2 ViT-L (256), VideoMAE ViT-L, Endo-FM ViT-B | Clasificacion, temporal, espacial etapa 1 | MIT | Incluidas en el repo |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no es un dispositivo medico y no debe usarse con fines clinicos.
- Entrenado exclusivamente con videos de Cholec80, HeiChole, CRCD, SurgVU y una coleccion de YouTube; la generalizacion a otros entornos quirurgicos, instituciones o tipos de intervencion no esta validada.
- El codificador V-JEPA 2.1 ViT-L no se incluye y debe descargarse por separado, lo que anade una dependencia externa y posibles variaciones de version.
- Licencia mixta: los cabezales TactusNet son MIT, pero las lineas base heredan licencias de pesos de terceros, algunas sin permiso de uso comercial. Es imprescindible revisar `THIRD_PARTY.md` en cada directorio de linea base antes de cualquier uso mas alla de la investigacion.
- Los checkpoints espaciales incluyen estado de entrenamiento (unos 1,3 GB por fichero), lo que complica su despliegue ligero y requiere cargar con `weights_only=False`.
- Sin informacion sobre sesgos, tasas de alucinacion o robustez ante condiciones de imagen adversas (iluminacion, oclusion, sangre, humo quirurgico).
- Ausencia de soporte linguistico, de generacion de texto y de integracion con agentes; no es adecuado para tareas de NLP.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible verificar el rendimiento reportado frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abccbd/TACTUS-TactusNet
- Codigo: https://github.com/Ruifreddie/TACTUS
- Dataset: https://huggingface.co/datasets/hding2455/surgical-action-affordance
- Release oficial de V-JEPA 2 (codificador): https://github.com/facebookresearch/vjepa2

# FractalSurfer/BS-RoFormer-SW-6stem

## Resumen

BS-RoFormer SW (6-stem) es un modelo de separación de fuentes musicales (*music source separation*) que descompone una mezcla estéreo a 44,1 kHz en seis pistas independientes: bajo, batería, otros, voces, guitarra y piano. No es un modelo de lenguaje ni un modelo generativo de texto: es un modelo audio-a-audio basado en la arquitectura BS-RoFormer (transformer con *band-split* espectral y *rotary position embeddings*) que devuelve seis formas de onda alineadas con la mezcla de entrada.

El repositorio es un espejo sin modificaciones del checkpoint `enerjazzer/BS-ROFO-SW-Fixed`, publicado por el usuario FractalSurfer para que el proyecto Trainspotting Suite pueda fijar una copia estable después de que la cuenta de HuggingFace del autor original (`jarredou`) fuese eliminada. Contiene el checkpoint original en PyTorch (`.ckpt` acompañado de su `.yaml`) y una conversión a GGUF q8_0 de unos 179 MiB que puede ejecutarse sin pila de Python.

El modelo tiene 174.660.405 parámetros (~175 M), por lo que es muy compacto: los pesos en q8_0 ocupan menos de 200 MB y caben en cualquier GPU de consumo, en GPU integrada o incluso en CPU. Su relevancia actual reside en dos factores: ofrece separación en seis stems (frente a los cuatro habituales de Demucs o Open-Unmix) y una ruta de despliegue ligera mediante BSRoformer.cpp con backends CPU, CUDA, Vulkan y Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (Band-Split RoFormer): transformer con descomposicion en bandas del espectrograma y embeddings posicionales rotatorios |
| Parametros totales | 174.660.405 (~175 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de separacion de audio, no procesa secuencias de texto); la longitud de fragmento de audio no esta documentada |
| Tipos de cuantizacion | GGUF q8_0 con cuantizacion mixta (normas, sesgos y proyecciones `band_split` conservadas en F32 por no estar alineadas a bloques q8_0); checkpoint original `.ckpt` (tamano consistente con fp32) |
| Idiomas soportados | no disponible (el modelo no procesa texto; el idioma no es una variable de entrada) |
| Licencia | unknown (el upstream no declara licencia; este espejo no concede derechos adicionales) |
| Formato de pesos | PyTorch `.ckpt` + `.yaml` de configuracion; GGUF (`gguf/BS-RoFormer-SW-6stem-q8_0.gguf`) |
| Frecuencia de muestreo | 44,1 kHz, estereo |
| Numero de stems | 6, en el orden `bass, drums, other, vocals, guitar, piano` |
| Tamano de artefactos | `.ckpt`: 699.412.152 B (~667 MiB); `.yaml`: 4.613 B; GGUF q8_0: 188.130.912 B (~179 MiB) |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | audio-to-audio |
| Tags | gguf, music-source-separation, stem-separation, bs-roformer, 6-stem, audio-to-audio |
| Fecha de creacion en HuggingFace | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura es BS-RoFormer, un transformer que en lugar de operar sobre el espectrograma completo divide la señal en bandas de frecuencia y proyecta cada banda a un espacio de embedding comun antes de aplicar autoatencion con codificacion posicional rotatoria (RoPE). El modelo trabaja en dominio tiempo-frecuencia sobre audio estereo a 44,1 kHz y genera seis salidas simultaneas correspondientes a los stems. El GGUF conserva en F32 las normas, los sesgos y las proyecciones `band_split` porque sus anchos no estan alineados a los bloques de cuantizacion q8_0; el resto de los pesos se almacena en q8_0.

No se dispone de informacion sobre el procedimiento de entrenamiento en el material proporcionado: no se documentan el numero de horas o fragmentos de audio usados, la composicion del dataset (por ejemplo, si se utilizo MUSDB18 u otros corpus), el esquema de aumento de datos, ni si hubo etapas de ajuste fino especificas. Tampoco se documentan tecnicas de RLHF o DPO, que no aplican a un modelo de separacion de audio. Los archivos originales (`BS-Rofo-SW-Fixed.ckpt` y `BS-Rofo-SW-Fixed.yaml`) se describen como copias byte a byte del checkpoint del autor original, con hash SHA-256 publicado para los tres artefactos; esa es la unica garantia de integridad disponible.

## Capacidades

- Separacion de mezclas musicales estereo en seis stems independientes: `bass`, `drums`, `other`, `vocals`, `guitar`, `piano`, a 44,1 kHz.
- Reconstruccion coherente con la mezcla original: el autor del espejo reporta que la suma de los seis stems correlaciona a 0,9997 con la mezcla, con un residual de -38,9 dB.
- Inferencia audio-a-audio pura: no genera texto, no razona, no produce codigo ni resuelve problemas matematicos.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a este tipo de modelo).
- Sin capacidades multilingues (no hay entrada ni salida de texto).
- Capacidad especial: aislamiento de guitarra y piano como stems dedicados, algo poco comun en modelos de separacion de cuatro pistas.
- Ejecucion sin dependencias de Python: el GGUF se carga con BSRoformer.cpp en CPU, CUDA, Vulkan o Metal.
- Salida nombrada de forma posicional: el GGUF transporta `num_stems = 6` pero no los nombres de los stems, por lo que el consumidor debe aplicar el orden documentado.

## Casos de uso

- **Remezcla y remasterizacion musical**: produccion y postproduccion pueden extraer las seis pistas y reequilibrar niveles, aplicar procesado por stem o recomponer la mezcla con un balance distinto sin volver a grabar.
- **Generacion de versiones karaoke e instrumentales**: eliminar o atenuar el stem `vocals` y sumar el resto; el hecho de disponer de stems separados de guitarra y piano permite ademas construir versiones "solo voz" para practica.
- **Transcripcion musical asistida**: aislar `bass`, `guitar` o `piano` antes de un transcriptor automatico reduce el ruido cruzado entre instrumentos y mejora la precision de la transcripcion, especialmente en mezclas densas.
- **Produccion de sample packs**: extraer `drums` de un catalogo de grabaciones para construir librerias de loops de bateria, conservando la correlacion de fase con la mezcla original para que los samples encajen en el mismo tempo.
- **Herramientas para DJ y directo**: separar stems en tiempo real o casi real; con el rendering verificado de 12 s de audio en 2,75 s sobre Metal, el modelo opera aproximadamente 4,4 veces mas rapido que el tiempo real en ese hardware, lo que habilita mashups y transiciones por stems.
- **Doblaje, localizacion y limpieza de dialogo**: aislar `vocals` para tratarla por separado (reduccion de ruido, ecualizacion, sustitucion de idioma) y reintegrarla despues sobre el lecho instrumental.
- **Restauracion y archivado de grabaciones**: separar fuentes para reparar una pista danada (por ejemplo, sustituir una guitarra con ruido) sin perder el resto de la mezcla.
- **Generacion de datos para MIR**: producir datasets etiquetados por stem a partir de catalogos sin multitrack disponible, utiles para entrenar otros modelos de separacion, transcripcion o etiquetado automatico.
- **Despliegue embebido o de escritorio**: gracias a los ~179 MiB de pesos en q8_0 y a BSRoformer.cpp, puede integrarse en aplicaciones de escritorio o moviles sin dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de SDR, SIR o SAR, ni comparaciones contra MUSDB18 u otros conjuntos de evaluacion en el material proporcionado.

Unicamente se dispone de una verificacion de runtime realizada por el autor del espejo, que no constituye un benchmark de calidad de separacion:

| Verificacion reportada | Valor |
|---|---|
| Hardware | Apple Silicon mediante backend Metal |
| Entrada | Extracto estereo de 12 s |
| Tiempo de separacion | 2,75 s (RTF aproximado de 0,23; ~4,4x mas rapido que tiempo real) |
| Stems devueltos | 6 de 6 |
| Correlacion suma de stems vs. mezcla | 0,9997 |
| Residual | -38,9 dB |

## Requisitos de hardware

- VRAM para pesos: aproximadamente 180 MB en GGUF q8_0 y alrededor de 700 MB en el checkpoint PyTorch fp32. Hay que anadir el coste de activaciones y buffers de audio, que no esta documentado.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Vulkan sirve; el modelo entra con holgura en RTX 3060, RTX 4090, A100 o H100, donde el limite practico sera el ancho de banda de memoria y no la VRAM.
- Cabe en GPU de consumo de gama baja, en GPU integradas y en CPU. Tambien se ha verificado en Apple Silicon mediante Metal.
- No requiere tensor paralelismo ni cuantizaciones agresivas: el cuello de botella tipico sera el chunking del audio y el coste de la FFT/ISTFT, no la memoria.
- Opciones de despliegue: BSRoformer.cpp con backends CPU, CUDA, Vulkan y Metal; el GGUF se genero con su script `scripts/convert_to_gguf.py --arch bs --dtype q8_0`. El `.ckpt` y el `.yaml` estan pensados para el proyecto Trainspotting Suite, que fija esta copia. El soporte de vLLM, llama.cpp, Ollama o TGI no aplica, ya que son runtimes de modelos de lenguaje.
- Latencia y throughput: el unico dato disponible es el de Apple Silicon Metal (12 s de audio en 2,75 s, RTF ~0,23). No hay cifras publicadas de throughput en CUDA, Vulkan o CPU, ni datos sobre tamano de lote o de fragmento.

## Comparativa con modelos similares

| Modelo | Stems | Formato de pesos | Licencia | Notas |
|---|---|---|---|---|
| BS-RoFormer SW 6-stem (este modelo) | 6: bass, drums, other, vocals, guitar, piano | `.ckpt` + `.yaml`, GGUF q8_0 | unknown | 174.660.405 parametros; separa guitarra y piano de forma explicita; espejo de un checkpoint cuyo autor original ya no esta en HuggingFace |
| Demucs v4 (htdemucs) | 4: drums, bass, other, vocals | PyTorch | MIT, segun el repositorio publico de Meta | Referencia muy extendida; no separa guitarra ni piano como pistas propias |
| Spleeter | 2, 4 o 5 segun el modelo | Checkpoint de TensorFlow | MIT, segun el repositorio publico de Deezer | Modelo mas antiguo y ligero; sin stem de guitarra ni de piano en la configuracion de 5 pistas |
| Open-Unmix (UMX) | 4: vocals, drums, bass, other | PyTorch | MIT, segun el repositorio publico del proyecto | Arquitectura mas simple basada en redes recurrentes; sin soporte GGUF nativo |

No se dispone de datos de parametros ni de resultados de calidad (SDR) para los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a cobertura de stems, formato de pesos y licencia.

## Limitaciones y advertencias

- **Licencia desconocida**: el upstream declara `license: unknown` y este espejo no concede derechos adicionales. Cualquier uso comercial debe tratarse como no autorizado hasta contactar con el autor original; es el riesgo mas serio para produccion.
- **Cadena de custodia incompleta**: el checkpoint original pertenecia a una cuenta de HuggingFace eliminada. Aunque se publican hashes SHA-256, no hay garantia contractual sobre el origen, los derechos o la procedencia de los datos de entrenamiento.
- **Sin documentacion de entrenamiento**: no se especifican dataset, horas de audio, criterio de particion train/validacion ni proceso de ajuste. Es imposible evaluar riesgo de sobreajuste al material de evaluacion o posibles sesgos de genero musical.
- **Sin benchmarks independientes**: no hay cifras de SDR/SIR/SAR publicadas ni evaluacion por terceros; la unica verificacion disponible es de runtime y la realizo el propio autor del espejo.
- **Orden de stems critico**: el GGUF no almacena los nombres de los stems. Si el consumidor no respeta el orden `bass, drums, other, vocals, guitar, piano`, obtendra archivos mal etiquetados sin ningun aviso de error.
- **Formato de entrada rigido**: 44,1 kHz estereo. Otras frecuencias de muestreo o audio mono requieren remuestreo o conversion previa, que no se documenta.
- **Posibles artefactos de separacion**: al no existir evaluacion publica, no se puede acotar el *bleeding* entre stems, la perdida de transitorios ni el comportamiento en mezclas muy densas o con instrumentos poco representados. Hay que validar con material propio antes de produccion.
- **Sin capacidades de texto**: no soporta tool calling, agentes, contexto conversacional ni multilingue; no debe seleccionarse para tareas de lenguaje.
- **Latencia no caracterizada fuera de Apple Silicon**: el unico dato de rendimiento es un extracto de 12 s en Metal. El comportamiento en CPU, Vulkan o CUDA es desconocido.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/FractalSurfer/BS-RoFormer-SW-6stem
- Checkpoint de origen espejado: https://huggingface.co/enerjazzer/BS-ROFO-SW-Fixed
- Runtime de inferencia BSRoformer.cpp: https://github.com/chenmozhijin/BSRoformer.cpp
- Proyecto consumidor que fija esta copia (Trainspotting Suite): https://github.com/remy-st/trainspotting-suite
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo: se corresponden con foros y paginas sin relacion con separacion de fuentes musicales.

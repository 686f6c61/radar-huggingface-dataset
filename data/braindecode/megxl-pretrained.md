# braindecode/megxl-pretrained

## Resumen

MEG-XL es un modelo fundacional para decodificación de magnetoencefalografía (MEG) orientado a la tarea de brain-to-text, es decir, la conversión de señales cerebrales en texto. Lo desarrollan Dulhan Jayalath y Oiwi Parker Jones, y se presentó en ICML 2026 con el artículo *MEG-XL: Data-Efficient Brain-to-Text via Long-Context Pre-Training*. El repositorio `braindecode/megxl-pretrained` no es la publicación original del modelo, sino una conversión de los pesos oficiales (`meg-xl-med-v2.ckpt`, paso 113000) a los nombres de parámetros de la clase `braindecode.models.MEGXL`, añadida en braindecode 2.1 (PR #1554).

El modelo trabaja exclusivamente con MEG, no con EEG ni con otras modalidades fisiológicas. La entrada esperada son ventanas de 150 s a 50 Hz (7500 muestras temporales), preprocesadas con filtro paso banda de 0,1-40 Hz, corrección de línea base y escalado robusto por fragmentos de 3 s recortados a `[-5, 5]`. Incorpora un tokenizador congelado, BioCodec, que discretiza la señal en códigos discretos sobre los que opera el transformer.

El interés de esta ficha radica en que es una conversión verificada numéricamente contra el código de los autores (diferencias máximas de 0.0 en códigos, features y gradientes) y en que elimina la cabeza de clasificación, por lo que requiere fine-tuning o linear probing antes de cualquier uso. Con 24,2 millones de parámetros es un modelo pequeño y ligero, pensado para investigación en neurociencia computacional más que para despliegue de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador BioCodec congelado y RoPE (tabla de 625 posiciones) |
| Parametros totales | 24.245.876 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 150 s de MEG a 50 Hz (7500 muestras, 625 posiciones de token); ventanas mayores reconstruyen la tabla RoPE |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la salida es texto vía BioCodec, el model card no detalla idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors y pytorch_model.bin (además de config.json y convert.py) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con atención y codificación posicional rotatoria (RoPE). La señal MEG se procesa primero con el tokenizador BioCodec, que produce códigos discretos; el transformer opera sobre esos códigos y dispone de embeddings de tipo para magnetómetros y gradiómetros (planares o axiales). El modelo se preentrenó sobre ventanas largas de 150 s (7500 muestras temporales, 625 posiciones de token), lo que constituye la innovación central del trabajo: el preentrenamiento de contexto largo para mejorar la eficiencia de datos en brain-to-text.

Los pesos publicados corresponden al checkpoint `meg-xl-med-v2` en el paso 113000. La conversión reescribe las claves al esquema de braindecode y guarda la tabla RoPE como pares `(cos, sin)` recalculados desde `freqs`. Se descartan el decodificador de BioCodec, los codebooks duplicados `biocodec_embedding_*`, el `mask_token`, la cabeza de predicción de códigos (`output_head`), la caché RoPE compleja y el estado de Lightning/optimizador. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Extracción de representaciones latentes a partir de MEG crudo, con embeddings específicos por tipo de sensor (magnetómetro, gradiómetro planar, gradiómetro axial).
- Tokenización de señal mediante BioCodec congelado, que discretiza la MEG en códigos.
- Decodificación brain-to-text mediante fine-tuning o linear probing sobre las features del modelo (la cabeza de clasificación no está incluida en los pesos).
- Procesamiento de ventanas largas de hasta 150 s de señal continua, con soporte para ventanas mayores mediante reconstrucción de la tabla RoPE.
- Compatibilidad con configuraciones de 306 canales Neuromag (MNE `test_raw.fif`) y 157 gradiómetros axiales KIT, según la verificación del autor de la conversión.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo thinking: es un modelo de representación de señales cerebrales, no un LLM de propósito general.

## Casos de uso

- Investigación en decodificación de lenguaje desde MEG: el modelo sirve como extractor de features para experimentos de brain-to-text, aprovechando su preentrenamiento en contexto largo para reducir la cantidad de datos etiquetados necesarios.
- Linear probing sobre representaciones congeladas: al no incluir cabeza de clasificación, un investigador puede entrenar una capa lineal sobre las features del modelo para tareas de clasificación de estímulos o condiciones experimentales con pocos datos.
- Fine-tuning para sujetos concretos: sus 24,2 M de parámetros permiten ajustar el modelo completo en un único GPU de gama media para adaptarlo a un participante o paradigma específico.
- Análisis de dinámica cerebral en ventanas largas: la ventana de 150 s permite estudiar estados cognitivos sostenidos que modelos con contextos cortos no capturan.
- Reproducibilidad y validación de pipelines: la conversión incluye hashes sha256 de todos los ficheros y verificación numérica contra el código original, útil para replicar resultados del artículo de ICML 2026.
- Prototipado en braindecode: al integrarse como `braindecode.models.MEGXL`, encaja en pipelines existentes de la librería para preprocesado, entrenamiento y evaluación de señales electrofisiológicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card de la conversión solo documenta la verificación de equivalencia numérica con el código de los autores (códigos idénticos, features y gradientes de los 119 parámetros de un backward con diferencia máxima absoluta de 0.0, en CPU float32 y modo eval), no métricas de tarea como WER de brain-to-text.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (24,2 M de parámetros, ~97 MB en float32 y ~48 MB en float16), aunque el consumo real depende de la longitud de la ventana de entrada y del batch.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el model card no especifica requisitos oficiales.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 o superior), dado el reducido número de parámetros.
- Opciones de despliegue: la librería braindecode (con `MEGXL.from_pretrained`), PyTorch nativo y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MEG-XL (este) | 24,2 M | 150 s de MEG (625 tokens) | MEG | MIT | Hugging Face (`braindecode/megxl-pretrained`, `pnpl/MEG-XL`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre otros modelos fundacionales de MEG comparables (por ejemplo, variantes de EEG/MEG foundation models) con los que establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo acepta MEG: no procesa EEG, fMRI ni otras modalidades; el `chs_info` debe incluir posiciones de sensores y orientaciones de bobina (`loc`).
- Los pesos no incluyen cabeza de clasificación; es imprescindible hacer fine-tuning o linear probing antes de cualquier uso predictivo.
- El preprocesado es obligatorio y muy específico: 50 Hz, filtro 0,1-40 Hz, corrección de línea base y escalado robusto por fragmentos de 3 s recortados a `[-5, 5]`. Omitirlo invalida las representaciones.
- La tabla RoPE almacenada cubre 625 posiciones (ventana de 150 s); ventanas más largas requieren reconstruirla, lo que puede introducir diferencias respecto al comportamiento original.
- La verificación numérica se hizo con dropout de atención a 0 en el modelo original (que lo mantiene activo en eval); braindecode lo desactiva, por lo que los resultados pueden diferir ligeramente si se compara con el código original sin ese ajuste.
- Riesgo de alucinación y sesgos: no aplica en el sentido de un LLM, pero la decodificación brain-to-text puede producir texto incorrecto o sesgado según los datos de entrenamiento, no documentados en la información disponible.
- Licencia MIT, que permite uso comercial, pero el modelo es de investigación en neurociencia; no hay evidencia publicada de robustez en producción ni de generalización entre sujetos, equipos o protocolos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el model card no documenta idiomas soportados ni cuantizaciones.

## Enlaces

- Hugging Face (conversión braindecode): https://huggingface.co/braindecode/megxl-pretrained
- Pesos originales: https://huggingface.co/pnpl/MEG-XL
- Paper: https://arxiv.org/abs/2602.02494
- Código original: https://github.com/neural-processing-lab/MEG-XL/tree/97da04171d22e8fe4822cfeb3047a57ecf86b318
- Licencia MEG-XL: https://github.com/neural-processing-lab/MEG-XL/blob/main/LICENSE
- BioCodec (tokenizador): https://github.com/klean2050/BioCodec-release/tree/575bf6ea7ae14a34754b217d9b940597a16951bd
- Licencia BioCodec: https://github.com/klean2050/BioCodec-release/blob/main/LICENSE
- Documentación de la clase en braindecode: https://braindecode.org/stable/generated/braindecode.models.MEGXL.html
- PR de braindecode: https://github.com/braindecode/braindecode/pull/1554
- Incidencias y correcciones: https://github.com/braindecode/braindecode/issues

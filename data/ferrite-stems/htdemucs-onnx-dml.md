# ferrite-stems/htdemucs-onnx-dml

## Resumen

HTDemucs (ONNX, compact graph for DirectML) es una exportación a ONNX del modelo preentrenado `htdemucs` de Meta AI Research (proyecto Demucs), publicada por el usuario ferrite-stems para separar las cuatro pistas (batería, bajo, otros y voz) de una mezcla musical estéreo. El objetivo declarado es integrar la eliminación de voz en un reproductor de karaoke, de modo que el modelo se ejecuta en un grafo ONNX con el backend DirectML sobre GPU.

La aportación principal no es el modelo, sino el grafo: las exportaciones ONNX habituales de HTDemucs expanden la STFT inversa en cadenas de operaciones `ScatterND` (unas 24.700 operaciones en total), lo que en DirectML mantiene vivos todos los búferes intermedios y agota la memoria de una RTX 3060 de 12 GB. Esta exportación sustituye la STFT por una convolución contra la base DFT enventanada y la inversa por una multiplicación de matrices más cuatro sumas desplazadas, reduciendo el grafo a 4.631 operaciones sin ningún `ScatterND`.

El resultado es un fichero ONNX de unos 0,4 GB que procesa una canción de 3:40 en aproximadamente 12 s sobre DirectML con unos 2 GB de memoria de vídeo, y en torno a 2 minutos en CPU. La fidelidad respecto al modelo PyTorch original se sitúa entre −110 y −125 dB de error RMS sobre música real. La licencia es MIT, heredada de Demucs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (hybrid transformer Demucs: U-Net con rama temporal y rama espectral con transformer), exportado a grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de 343.980 muestras (7,8 s a 44,1 kHz, estéreo) |
| Tipos de cuantizacion | no disponible; el grafo publicado es float32 |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`htdemucs-dml.onnx`, SHA256 `9e06fef2b23e0f772c6a0cedc4da3aeacb066fa2fa7b6bf70ba08bb1db6220ab`) |

Otros datos: el repositorio ocupa 0,4 GB, la librería declarada es `onnx`, el modelo base es `facebook/demucs`, la entrada se llama `mix` con forma `[1, 2, 343980]` en float32 y la salida se llama `stems` con forma `[1, 4, 2, 343980]` en el orden batería, bajo, otros, voz.

## Arquitectura y entrenamiento

El modelo subyacente es HTDemucs, descrito en el artículo *Hybrid Transformers for Music Source Separation* de Défossez et al. (Meta AI Research). Se trata de una arquitectura híbrida que combina una U-Net que opera sobre la forma de onda con un transformer que opera sobre la representación tiempo-frecuencia: la rama espectral aporta contexto global sobre la mezcla y la rama temporal conserva la resolución fina necesaria para reconstruir cada fuente. La red estima cuatro stems sobre una ventana de 7,8 s a 44,1 kHz en estéreo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron etapas de RLHF o DPO (no son habituales en separación de fuentes). Tampoco se documentan en la información proporcionada los detalles del proceso de entrenamiento original.

La innovación técnica de esta ficha es la reescritura del grafo de inferencia: la STFT se implementa como una única convolución contra la base DFT enventanada y la STFT inversa como una multiplicación de matrices más cuatro sumas desplazadas. Esto elimina los `ScatterND` (unas 24.700 operaciones en las exportaciones convencionales) y deja el grafo en 4.631 operaciones, lo que evita que DirectML retenga búferes intermedios y provoque errores de memoria seguidos de cuelgue de GPU. El script de exportación citado es `scripts/export_htdemucs_onnx_dml.py` del proyecto Ferrite/Karaoke.

## Capacidades

- Separación de fuentes musicales en cuatro stems: batería, bajo, otros y voz, a partir de una mezcla estéreo.
- Extracción de la pista vocal para eliminación de voz en karaoke o para obtener instrumentales.
- Extracción de la instrumental (suma de batería, bajo y otros) para bases de práctica o remezclas.
- Procesamiento de audio a 44,1 kHz en estéreo, conservando la imagen estéreo original.
- Inferencia en lotes de una sola ventana de 7,8 s por llamada; el troceado de canciones largas debe gestionarlo la aplicación.
- Ejecución en ONNX Runtime con backend DirectML (GPU) o CPU, sin dependencia de PyTorch en producción.
- Reproducibilidad verificable mediante el SHA256 publicado del fichero ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de separación de audio.

## Casos de uso

- Reproductores de karaoke: el caso de uso declarado por el autor. La aplicación envía ventanas de 7,8 s de la canción al grafo ONNX, silencia o atenúa el stem de voz y reproduce la mezcla restante, con una latencia de proceso de unos 12 s por canción de 3:40 en una RTX 3060.
- Herramientas de escritorio en Windows con aceleración por GPU: al usar DirectML, el modelo funciona sobre cualquier GPU compatible con DirectX 12 sin necesidad de CUDA, lo que simplifica la distribución en equipos de consumo.
- Producción de remixes y edits: obtener los stems de batería, bajo y voz por separado permite reutilizar elementos de una mezcla con licencia adecuada en nuevas producciones.
- Preparación de material para DJs: generar versiones instrumentales y a capela de un catálogo propio de forma automatizada, a razón de unas 5 canciones por minuto en la GPU del equipo de prueba.
- Preprocesado para reconocimiento automático de voz: aislar la pista vocal antes de pasar un ASR, reduciendo la interferencia de la música en grabaciones musicales o entrevistas con fondo musical.
- Limpieza de muestras para sample packs: extraer un break de batería o una línea de bajo concreta de una grabación para reutilizarla en una biblioteca de samples.
- Archivado y restauración de material antiguo: separar voz y acompañamiento en grabaciones monofónicas o estéreo para tareas de remasterización o de reducción de ruido selectiva.
- Integración en pipelines por lotes en servidor sin GPU: la ejecución en CPU, con unos 2 minutos por canción de 3:40, es viable para procesos nocturnos o de baja prioridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay valores de SDR, SIR ni SAR sobre MUSDB18 u otros conjuntos). Los únicos datos medidos que aporta el autor son de fidelidad frente al modelo original y de tiempo de ejecución:

| Metrica | Valor | Contexto |
|---|---|---|
| Error RMS frente a PyTorch | −110 a −125 dB | Sobre música real |
| Operaciones del grafo ONNX | 4.631 | Frente a ~24.700 en exportaciones con `ScatterND` |
| Operaciones `ScatterND` | 0 | Frente a ~24.700 en exportaciones convencionales |
| Tiempo por canción de 3:40 en GPU | ~12 s | DirectML, equipo de prueba con RTX 3060 |
| Tiempo por canción de 3:40 en CPU | ~2 min | Mismo equipo de prueba |
| Memoria de vídeo en inferencia | ~2 GB | DirectML, RTX 3060 de 12 GB |

No se han publicado cifras de throughput en ventanas por segundo, latencia por ventana ni comparaciones de calidad (SDR) con otros separadores.

## Requisitos de hardware

- VRAM estimada: unos 2 GB de memoria de vídeo en el caso medido por el autor (DirectML, RTX 3060 de 12 GB). No se documentan cifras para otras configuraciones.
- GPU recomendadas: el autor valida RTX 3060 de 12 GB con DirectML. Cualquier GPU con soporte DirectX 12 y suficientes recursos debería poder ejecutar el grafo, pero no se aportan pruebas de otras tarjetas. No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, al menos en RTX 3060 de 12 GB con un consumo de unos 2 GB de VRAM. Con la exportación ONNX convencional (sin esta optimización) la misma tarjeta agotaba la memoria y provocaba un cuelgue de GPU.
- CPU: ejecución viable sin GPU, con un tiempo aproximado de 2 minutos por canción de 3:40 en el equipo de prueba.
- Opciones de despliegue: ONNX Runtime con execution provider DirectML (caso validado) u ONNX Runtime en CPU. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. Tampoco se documentan los execution providers de CUDA o TensorRT.
- Latencia y throughput: ~12 s por canción de 3:40 en GPU y ~2 min en CPU; no se publican cifras por ventana individual ni en otros equipos.
- El troceado y solapamiento de canciones largas corre a cargo de la aplicación: el grafo acepta exactamente 343.980 muestras por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ferrite-stems/htdemucs-onnx-dml | no disponible | 343.980 muestras (7,8 s, 44,1 kHz, estéreo) | ~12 s por canción de 3:40 en DirectML; −110 a −125 dB RMS frente a PyTorch | MIT | ONNX en HuggingFace |
| HTDemucs original (facebook/demucs, PyTorch) | no disponible | Ventana configurable en el pipeline de Demucs | Referencia de calidad; requiere PyTorch y no está optimizado para DirectML | MIT | Pesos y código en el repositorio Demucs |
| Exportaciones ONNX convencionales de HTDemucs | no disponible | Igual que el modelo base | ~24.700 operaciones; fallo de memoria y cuelgue de GPU en RTX 3060 de 12 GB con DirectML | MIT (heredada) | Repositorios de terceros, no detallados |

No se dispone de datos para comparar con otros separadores de la misma categoría (por ejemplo, variantes de 6 stems o modelos especializados en voz) porque la información proporcionada no incluye benchmarks ni alternativas evaluadas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en audio: no genera texto, no soporta tool calling ni razonamiento, y no debe evaluarse con benchmarks de LLM.
- Solo separa cuatro stems. No ofrece separación de piano, guitarra o percusión adicional, habitual en variantes de 6 stems.
- Entrada de tamaño fijo: 343.980 muestras (7,8 s). Canciones completas requieren troceado y reensamblado por parte de la aplicación, con el riesgo de discontinuidades en las fronteras si no se aplica solapamiento y crossfade. El autor no documenta la estrategia de solapamiento.
- No se documentan sesgos del modelo. Al derivar de Demucs, su comportamiento en géneros, idiomas o instrumentaciones poco representados en los datos de entrenamiento originales no está caracterizado en la información disponible.
- Riesgo de artefactos y sangrado entre stems en pasajes densos o con instrumentación solapada; no se publican métricas de SDR, SIR ni SAR que permitan cuantificarlo.
- El error RMS de −110 a −125 dB mide la fidelidad respecto a la implementación PyTorch, no la calidad de la separación respecto a la fuente real.
- No hay cuantizaciones publicadas (int8, fp16): el despliegue en FP16 o INT8 requeriría una reexportación y validación propias.
- Licencia MIT: permite uso comercial y modificación, pero los pesos derivan de Demucs (MIT) y se debe mantener el crédito a Défossez et al. y a Meta AI Research. Conviene verificar las condiciones de los datos de entrenamiento originales si el uso es comercial a gran escala.
- Fichero de 0,4 GB: conviene verificar el SHA256 publicado antes de desplegarlo en producción.
- El autor no documenta pruebas con otras GPU, versiones de ONNX Runtime ni controladores DirectML; la estabilidad en configuraciones distintas de la reportada no está garantizada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad ni issues públicos conocidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ferrite-stems/htdemucs-onnx-dml
- Repositorio de Demucs (Meta AI Research, modelo base y pesos): https://github.com/facebookresearch/demucs
- Artículo de referencia: Défossez et al., *Hybrid Transformers for Music Source Separation*, Meta AI Research (citado en la model card; no se proporciona URL en la información disponible).
- Script de exportación: `scripts/export_htdemucs_onnx_dml.py` del proyecto Ferrite/Karaoke (citado en la model card; no se proporciona URL en la información disponible).
- Las búsquedas web realizadas no devolvieron enlaces relevantes sobre el modelo: los resultados corresponden a la ferrita como material metalúrgico y cerámico, sin relación con este repositorio.

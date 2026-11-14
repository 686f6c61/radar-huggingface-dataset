# gridshiftstudio/bs-roformer-sw-coreml

## Resumen

BS-RoFormer SW (6 stems) Core ML es una conversión a Core ML del checkpoint BS-RoFormer SW de seis pistas (bajo, batería, otros, voz, guitarra y piano), un modelo de separación de fuentes musicales basado en la arquitectura Band-Split RoFormer (BS-RoFormer). Lo publica el usuario gridshiftstudio como parte de la herramienta de separación de pistas de Gridshift. No es un modelo de lenguaje: es un modelo de procesamiento de audio que estima máscaras complejas sobre el espectrograma de una mezcla estéreo para aislar cada instrumento.

La conversión incluye únicamente la red de máscaras, en precisión fp16 y con requisitos de macOS 15 o superior. La entrada es un STFT estéreo de forma `[1, 2050, 1151, 2]` correspondiente a una ventana de 588 800 muestras a 44,1 kHz (n_fft 2048, hop 512, ventana Hann periódica, padding reflect, 1025 bins con canales intercalados por bin y parte real/imaginaria al final). La salida es una máscara compleja por pista con la misma disposición, que se multiplica por el espectro y se transforma inversamente para obtener los stems.

Su relevancia es práctica: permite ejecutar separación de seis pistas en el ecosistema Apple (Core ML) sin depender de PyTorch en tiempo de inferencia. El error de máscara declarado frente al checkpoint original en PyTorch es de -66 dB, lo que indica una conversión numéricamente fiel. La licencia de los pesos originales es desconocida, lo que limita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Band-Split RoFormer (BS-RoFormer), red de máscaras para separación de fuentes |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 588 800 muestras (13,35 s a 44,1 kHz) |
| Tipos de cuantización | fp16 (Core ML) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | other / unknown (licencia de los pesos originales desconocida; código de arquitectura MIT) |
| Formato de pesos | Core ML (.mlpackage/.mlmodel), fp16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BS-RoFormer (Band-Split RoFormer), un transformer con atención rotatoria aplicado a la separación de fuentes musicales. La red divide el espectro en bandas de frecuencia, proyecta cada banda a un espacio de embeddings y procesa la secuencia resultante con capas de atención tipo RoFormer, que codifican información posicional relativa mediante rotaciones. La salida es una máscara compleja por pista que se aplica al espectrograma de entrada.

Esta publicación no contiene el modelo completo: solo se ha convertido la red de máscaras, omitiendo el front-end STFT y el back-end de reconstrucción, que deben implementarse externamente (STFT con n_fft 2048, hop 512, ventana Hann periódica, padding reflect, 1025 bins, canales intercalados por bin, real/imaginaria al final). La conversión es a fp16 para Core ML y requiere macOS 15 o superior. No se dispone de información sobre el dataset de entrenamiento, el número de tokens de audio, ni si se aplicaron técnicas de refinamiento posteriores.

## Capacidades

- Separación de fuentes musicales en seis pistas: bajo, batería, otros, voz, guitarra y piano.
- Procesamiento de audio estéreo a 44,1 kHz mediante STFT con ventana de 588 800 muestras (aproximadamente 13,35 segundos).
- Estimación de máscaras complejas por pista, aplicables al espectrograma para reconstruir cada stem mediante STFT inversa.
- Ejecución nativa en el ecosistema Apple a través de Core ML, con precisión fp16.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.
- No incluye modo thinking, visión, audio de entrada en lenguaje natural ni generación de texto.

## Casos de uso

- Separación de pistas para producción musical: el modelo permite aislar voz, batería, bajo, guitarra, piano y "otros" de una mezcla estéreo para remezclar, samplear o crear versiones instrumentales y a cappella.
- Aplicaciones de karaoke y práctica instrumental: al obtener el stem de voz y el resto por separado, se puede generar una pista sin voz o silenciar un instrumento concreto para estudiar o ensayar.
- Herramientas de edición de audio en macOS: al estar en Core ML, se puede integrar en apps nativas de Apple sin dependencias de PyTorch, aprovechando la aceleración por GPU o Neural Engine.
- Limpieza y restauración de grabaciones: separar instrumentos permite atenuar o eliminar una fuente no deseada (por ejemplo, reducir la guitarra en una mezcla) y reconstruir la mezcla con el resto de stems.
- Creación de datasets musicales etiquetados: la separación automática en seis pistas facilita generar corpus de audio por instrumento para entrenamiento o evaluación de otros modelos.
- Postproducción y doblaje: aislar la voz permite sustituirla o procesarla por separado, mientras se conserva el acompañamiento instrumental intacto.
- Investigación en separación de fuentes: sirve como referencia de conversión fiel a Core ML (error de máscara de -66 dB) para comparar implementaciones o medir el impacto de fp16 en la calidad de separación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado es el error de máscara frente al checkpoint de PyTorch: -66 dB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está convertido a Core ML fp16 y el tamaño del repositorio es de 0,3 GB, lo que da una idea del orden de magnitud de los pesos.
- GPU recomendadas: no disponible; al ser Core ML, se ejecuta en hardware Apple (GPU integrada o Neural Engine de chips Apple Silicon).
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual (NVIDIA/AMD); requiere macOS 15 o superior y hardware Apple compatible con Core ML.
- Opciones de despliegue: Core ML (Core ML Tools, APIs nativas de macOS/iOS); no se distribuye en formatos GGUF, safetensors ni para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pistas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BS-RoFormer SW (este, Core ML) | BS-RoFormer, solo red de máscaras | 6 | Core ML fp16 | other / unknown | Hugging Face (gridshiftstudio) |
| BS-ROFO-SW-Fixed (original, PyTorch) | BS-RoFormer | 6 | PyTorch | unknown | Publicado originalmente por jarredou; cuenta eliminada, espejos con licencia desconocida |
| Demucs (htdemucs) | Híbrido transformer/CNN | 4 (voz, batería, bajo, otros) | PyTorch | MIT (código y pesos publicados por Meta) | Repositorio oficial de Meta |
| MDX-Net / UVR (modelos varios) | CNN (U-Net) | 2-4 según variante | ONNX/PyTorch | Variable según modelo | Ecosistema Ultimate Vocal Remover |

La comparación con Demucs y MDX-Net es orientativa: este modelo se distingue por ofrecer seis pistas y un formato Core ML listo para Apple, mientras que Demucs ofrece cuatro pistas con licencia MIT y mayor ecosistema de herramientas.

## Limitaciones y advertencias

- Licencia de los pesos originales desconocida: no se conceden derechos más allá de los del original, lo que impide asumir uso comercial seguro.
- Solo se ha convertido la red de máscaras: es necesario implementar el STFT de entrada y la reconstrucción de salida con los parámetros exactos (n_fft 2048, hop 512, Hann periódica, reflect padding, 1025 bins, intercalado por bin) para obtener resultados correctos.
- Requiere macOS 15 o superior y hardware Apple; no es portable a otros entornos sin reconversión.
- La ventana de procesamiento es de 588 800 muestras (unos 13,35 segundos a 44,1 kHz); audios más largos requieren segmentación y ensamblaje, con posible artefacto en las uniones.
- Precisión fp16: aunque el error de máscara es de -66 dB, puede haber diferencias numéricas frente al checkpoint original en casos límite.
- Riesgo de artefactos en mezclas densas o instrumentos poco representados en el entrenamiento; no se dispone de información sobre el dataset para evaluar sesgos.
- No hay información sobre rendimiento subjetivo (SDR, SI-SDR) ni sobre calidad perceptual de los stems.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/gridshiftstudio/bs-roformer-sw-coreml
- Checkpoint original citado: BS-ROFO-SW-Fixed, publicado por jarredou en Hugging Face (cuenta eliminada; espejos con licencia desconocida)
- Arquitectura BS-RoFormer: código de referencia con licencia MIT (no cubre los pesos)

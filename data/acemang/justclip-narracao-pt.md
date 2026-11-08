# Acemang/justclip-narracao-pt

## Resumen

JustClip narracao pt es un paquete de recursos de síntesis de voz (text-to-speech) para portugués europeo, publicado por el usuario Acemang bajo licencia Apache-2.0. No se trata de un modelo entrenado desde cero, sino de una exportación a ONNX del modelo Kokoro-82M afinado para pt-PT por logus2k (`logus2k/kokoro_tts_eu_pt`), acompañada de los artefactos auxiliares que la aplicación de escritorio JustClip descarga para leer narraciones en voz alta en el procesador local del usuario.

El repositorio contiene cuatro piezas: el grafo ONNX `kokoro-pt-pt.onnx` (opset 17, salida de waveform a 24 kHz), un voicepack binario con 510 vectores de estilo de 256 dimensiones en coma flotante de 32 bits, una tabla de fonemas a tokens en JSON y un ejecutable de Windows x64 que realiza la conversión grafema-fonema mediante TugaPhone 1.4.16a1 (lecto de Lisboa). El tamaño total del repositorio es de 0,4 GB y el modelo no registra descargas ni valoraciones en el momento de la consulta.

Su relevancia es acotada pero concreta: ofrece una vía de inferencia TTS en portugués europeo completamente offline y sobre CPU, sin dependencia de servicios en la nube, lo que resulta útil para aplicaciones de escritorio con requisitos de privacidad o de funcionamiento sin conectividad. Al derivar de Kokoro-82M, hereda la arquitectura ligera de ese modelo y su licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (exportada a ONNX mediante `KModelForONNX`, opset 17) |
| Parametros totales | 82M (heredados del modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX sin especificar cuantizacion) |
| Idiomas soportados | Portugues europeo (pt-PT) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`kokoro-pt-pt.onnx`), voicepack binario `f32` y tabla de fonemas JSON |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, un modelo TTS de 82 millones de parámetros afinado para portugués europeo por logus2k. La exportación incluida en este repositorio se ha realizado con la herramienta propia de Kokoro `KModelForONNX` sobre opset 17, con tres entradas: `input_ids` (int64 de forma `[1, n]`, con 0 en ambos extremos), `style` (un vector de 256 dimensiones que actúa como embedding de voz) y `speed` (escalar de control de velocidad). La salida es `waveform` muestreada a 24 kHz.

El pipeline de inferencia se completa con dos componentes externos al grafo: un voicepack de 510 filas de 256 valores `f32` en little-endian, indexado por `fonemas − 1`, y un conversor grafema-fonema empaquetado con PyInstaller que ejecuta el `g2p.py` de tts_eu_pt sobre TugaPhone 1.4.16a1 con el lecto de Lisboa y únicamente los datos de portugués. El programa lee una frase por línea de stdin y emite sus fonemas por stdout seguidos de una línea vacía. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni la aplicación de RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz a partir de texto en portugués europeo, con salida de audio a 24 kHz.
- Conversión grafema-fonema específica para pt-PT mediante TugaPhone con lecto de Lisboa.
- Control de velocidad de habla mediante la entrada `speed` del grafo ONNX.
- Selección de voz mediante el voicepack de 510 embeddings de estilo.
- Inferencia en CPU, sin requisito de GPU ni de conexión a red.
- Ejecución por frases: el conversor G2P procesa una línea de texto por invocación y devuelve los fonemas correspondientes.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.

## Casos de uso

- Lectura de narraciones en aplicaciones de escritorio: la app JustClip descarga estos archivos para leer en voz alta textos escritos en portugués europeo sobre el procesador del usuario, sin enviar el contenido a servidores externos.
- Herramientas de accesibilidad offline: integración en lectores de pantalla o asistentes de lectura para usuarios lusófonos que necesitan funcionar sin conectividad, aprovechando la inferencia en CPU.
- Generación de locuciones para vídeo y pódcast: producción de pistas de voz en pt-PT a partir de guiones, con ajuste de velocidad mediante la entrada `speed` y elección de timbre mediante el voicepack.
- Preprocesado de texto para TTS en pipelines propios: reutilización del ejecutable TugaPhone y de la tabla `vocab-pt-pt.json` para obtener fonemas y tokens antes de alimentar el grafo ONNX.
- Prototipado de asistentes de voz embebidos: el tamaño reducido del grafo y la ausencia de dependencia de GPU permiten desplegarlo en equipos de sobremesa o portátiles convencionales.
- Evaluación de TTS para portugués europeo: el paquete sirve como referencia reproducible para comparar la calidad de Kokoro afinado frente a otras alternativas en pt-PT, al estar todo el pipeline empaquetado y versionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario previsto; el modelo está pensado para ejecutarse en CPU. Para una ejecución en GPU sería necesario convertir o servir el grafo ONNX con un runtime compatible, y no se proporcionan cifras de memoria.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: el modelo base tiene 82M de parámetros, por lo que el grafo es ligero, pero no se documentan requisitos ni pruebas en GPU concretas.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio), con el conversor G2P empaquetado para Windows x64. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| JustClip narracao pt (este) | 82M (Kokoro-82M) | no disponible | pt-PT | Apache-2.0 | ONNX |
| logus2k/kokoro_tts_eu_pt | 82M (Kokoro-82M) | no disponible | pt-PT | no disponible en la informacion proporcionada | no disponible |
| Kokoro-82M (original) | 82M | no disponible | multilingue (segun version) | Apache-2.0 | safetensors y otros |

La comparación con alternativas de otros linajes (por ejemplo, modelos TTS de mayor tamaño o servicios comerciales en la nube) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El alcance lingüístico se limita al portugués europeo; no se documenta soporte para portugués de Brasil ni para otros idiomas.
- El conversor G2P está empaquetado únicamente para Windows x64, lo que restringe el despliegue en Linux o macOS sin trabajo adicional.
- El repositorio no incluye información sobre sesgos, tasas de alucinación o errores de pronunciación en dominios específicos (nombres propios, siglas, tecnicismos).
- No se especifican los tipos de cuantización ni el rendimiento medido, por lo que no es posible estimar latencias de producción a partir de la documentación.
- El modelo registra cero descargas y cero valoraciones, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni de validación por terceros.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias y avisos de los componentes empaquetados (tts_eu_pt, TugaPhone y Kokoro-82M), que el autor declara compatibles en los archivos `LICENSE` y `NOTICE`.
- El contenido del README enlaza a un dominio de aplicación de escritorio; debe tratarse como material del autor y no como instrucciones de despliegue verificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Acemang/justclip-narracao-pt
- Modelo base: https://huggingface.co/logus2k/kokoro_tts_eu_pt
- Repositorio tts_eu_pt: https://github.com/logus2k/tts_eu_pt
- TugaPhone: https://github.com/TigreGotico/tugaphone
- Aplicación JustClip: https://video.wellnesscorporateplan.pt
- Sitio de JustClip (resultado de búsqueda, posiblemente no relacionado): https://justclip.ai/

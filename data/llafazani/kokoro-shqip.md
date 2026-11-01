# llafazani/kokoro-shqip

## Resumen

Kokoro-shqip es un ajuste fino (fine-tune) del modelo de síntesis de voz Kokoro-82M de hexgrad, adaptado al albanés (shqip) por el desarrollador llafazani. El modelo mantiene la arquitectura y el tamaño del original (82 millones de parámetros) y añade dos voces sintéticas masculinas, Agon y Dardan, creadas específicamente para el producto Llafazani (aplicación de escritorio para Windows, versión web y extensión de navegador). Es, por tanto, el mismo modelo que alimenta esos productos en producción.

La relevancia de este modelo radica en dos factores: por un lado, el albanés es un idioma con muy poca cobertura en el ecosistema TTS open source, por lo que un checkpoint funcional y con licencia permisiva cubre un hueco real; por otro, al derivar de Kokoro-82M conserva su principal ventaja competitiva, que es un coste computacional muy bajo (82 M de parámetros, inferencia en CPU viable) sin renunciar a una calidad de voz razonable.

El modelo no procesa texto directamente: requiere un paso previo de normalización textual y conversión grafema-fonema específico del albanés (`albanian_text.py`, `albanian_g2p.py`), que expande números, fechas, abreviaturas y acrónimos antes de mapear a fonemas. El repositorio incluye además los pesos en formato PyTorch y ONNX, los dos estilos de voz y un script (`lexo.py`) que reproduce el pipeline exacto de las aplicaciones Llafazani.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS neuronal basado en StyleTTS2/ISTFTNet, según el modelo base) |
| Parámetros totales | 82 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la model card indica procesar una frase cada vez, hasta ~480 fonemas |
| Tipos de cuantización | no disponible (se distribuyen pesos PyTorch `.pth` y grafos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | albanés (sq) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX (`onnx/`, con grafos de texto y decodificador), voces en `.pt` y `.npy` |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint hexgrad/Kokoro-82M, un TTS de 82 M de parámetros que genera audio mono a 24 kHz. La model card no detalla la arquitectura interna más allá de la herencia del modelo base, ni especifica el volumen de datos de entrenamiento, la composición del corpus albanés utilizado, ni si se aplicaron técnicas de alineamiento o ajuste perceptual adicionales. Tampoco se documenta si hubo etapas de RLHF/DPO (poco habituales en TTS) ni el número de pasos de entrenamiento.

La innovación técnica destacable no está en la arquitectura sino en el pipeline lingüístico que acompaña al modelo: `albanian_text.py` normaliza el texto (números, fechas, abreviaturas y acrónimos se escriben con palabras) y `albanian_g2p.py` convierte ese texto a fonemas en el conjunto de símbolos del modelo. El modelo lee fonemas, no letras, por lo que omitir este paso degrada la salida. El script `lexo.py` replica el comportamiento de las aplicaciones Llafazani: antepone una "palabra fantasma" que luego se recorta para evitar titubeos al inicio, aplica un único estilo de voz para todo el texto, genera pausas en `;` y `:` mediante el propio modelo y ecualiza los niveles entre frases.

## Capacidades

- Síntesis de voz (text-to-speech) en albanés a partir de texto normalizado y convertido a fonemas.
- Dos voces masculinas sintéticas: Agon (por defecto) y Dardan.
- Control de velocidad de habla (en `lexo.py`, valores como 0.8 para más lento y 1.3 para más rápido; en términos de Kokoro, 0.90 para Agon y 0.91 para Dardan equivalen al ritmo natural de Llafazani, ~170 palabras por minuto).
- Normalización textual en albanés: expansión de números, fechas, abreviaturas y acrónimos a palabras antes de la fonemización.
- Generación de pausas prosódicas a partir de puntuación (`;`, `:`).
- Salida de audio mono a 24 kHz en formato WAV.
- Exportación a ONNX para despliegue en aplicaciones (grafos separados de texto y decodificador, voces como `.npy`).
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de textos largos en albanés: dividiendo el texto en frases de hasta ~480 fonemas y pasándolas por `lexo.py`, se obtiene un WAV continuo con pausas naturales; adecuado para audiolibros, artículos o documentación.
- Integración en aplicaciones de escritorio: el repositorio incluye los grafos ONNX que usan las apps de Llafazani, de modo que un desarrollador puede replicar el mismo pipeline de inferencia en Windows sin depender de PyTorch.
- Extensiones de navegador y accesibilidad web: el tamaño de 82 M permite ejecutar la inferencia en el cliente o en servidores modestos, lo que facilita la lectura en voz alta de contenido web para usuarios albanohablantes.
- Generación de avisos y locuciones automatizadas: con control de velocidad y pausas por puntuación, el modelo sirve para producir mensajes de voz en sistemas de megafonía, IVR o notificaciones.
- Doblaje y preproducción de contenidos: las dos voces permiten generar borradores de narración o diálogos para vídeo y pódcast antes de recurrir a grabación humana.
- Investigación en TTS de bajos recursos: al ser un fine-tune documentado de Kokoro-82M con scripts de normalización y G2P incluidos, sirve como base reproducible para experimentos con otras lenguas de cobertura escasa.
- Prototipado de asistentes conversacionales en albanés: combinado con un LLM y un ASR, el modelo cubre la pata de síntesis de un pipeline de voz completo sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada. Con 82 M de parámetros, los pesos en FP32 ocupan aproximadamente 0,33 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más; en CPU es viable gracias al reducido tamaño.
- GPU recomendadas: no se especifican en la model card. Por tamaño, cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; también A100/H100 para despliegues por lotes a gran escala.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: PyTorch con el paquete `kokoro` y `soundfile` (flujo documentado), o runtime ONNX mediante los grafos incluidos en `onnx/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles. La model card solo indica el ritmo de habla resultante (~170 palabras por minuto a velocidad 1.0), no métricas de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kokoro-shqip (este) | 82 M | Albanés | Frases de hasta ~480 fonemas | Apache 2.0 | HuggingFace, pesos PyTorch y ONNX |
| hexgrad/Kokoro-82M (base) | 82 M | Varios (no albanés) | Frases cortas | Apache 2.0 | HuggingFace |
| Alternativas TTS multilingües open source (p. ej. Coqui XTTS, Piper) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros sistemas TTS en la información proporcionada; la comparación con el modelo base se limita a la relación de fine-tune declarada por el autor.

## Limitaciones y advertencias

- El modelo lee fonemas, no letras: es obligatorio pasar el texto por `albanian_text`/`albanian_g2p` antes de la inferencia; de lo contrario la pronunciación será incorrecta.
- Procesa una frase cada vez, con un límite de aproximadamente 480 fonemas por segmento; los textos largos deben dividirse.
- Solo soporta albanés (sq); no es multilingüe.
- Las voces Agon y Dardan son sintéticas y creadas para Llafazani; el autor pide explícitamente no presentarlas como la voz de una persona real. Esto implica un riesgo de suplantación si se usan sin transparencia.
- No se documentan sesgos acústicos ni de pronunciación por dialecto o registro; la cobertura del albanés estándar frente a variedades regionales no está descrita.
- Riesgo de alucinación acústica: como todo TTS neuronal, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del vocabulario o en nombres propios no cubiertos por la normalización.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no concede garantías; conviene revisar también las condiciones del modelo base Kokoro-82M.
- El repositorio tiene un tamaño de 0,7 GB y muy poca tracción (21 descargas, 0 likes en el momento de la consulta), por lo que no hay validación comunitaria extensa ni informes independientes de calidad.
- No se documentan métricas objetivas (MOS, WER de fonemas, latencia) que permitan evaluar la calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llafazani/kokoro-shqip
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Sitio del producto: https://llafazani.com
- Contacto del autor: kontakt@llafazani.com

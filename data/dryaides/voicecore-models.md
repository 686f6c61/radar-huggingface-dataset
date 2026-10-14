# Dryaides/voicecore-models

## Resumen

voicecore-models es un repositorio de pesos en formato ONNX publicado por el usuario Dryaides para alimentar voicecore, la libreria de voz del mod de Minecraft Voice Potions. No es un modelo de lenguaje: es un pipeline de conversion de voz (voice conversion) que transforma la voz del jugador en una voz de aldeano (villager) del juego. El repositorio empaqueta tres ficheros que el mod descarga en el primer uso y verifica mediante SHA-256 antes de cargarlos.

El pipeline combina un extractor de caracteristicas de habla ContentVec (salida de la capa 12 del checkpoint legacy 500) exportado a ONNX con opset 17, un generador RVC v2 a 40 kHz entrenado por kullbunta para producir la voz de aldeano, y el indice de caracteristicas FAISS que acompanaba a ese modelo. No se trata de pesos nuevos: el autor ha convertido a ONNX modelos preexistentes bajo licencia MIT sin modificar los pesos.

Su relevancia es acotada y practica: ofrece una integracion lista para usar de RVC en un contexto de videojuego mediante ONNX Runtime, evitando dependencias de frameworks de entrenamiento. El repositorio no registra descargas ni interacciones y no incluye model card mas alla de la tabla de ficheros, sus fuentes y las licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de conversion de voz: extractor ContentVec (HuBERT, salida de capa 12, legacy 500) + generador RVC v2 a 40 kHz + indice FAISS |
| Parametros totales | no disponible (el fichero del generador ocupa 110 461 354 bytes; el extractor, 377 688 760 bytes) |
| Longitud de contexto | no aplica (modelo de conversion de voz, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los ficheros ONNX se distribuyen sin esquema de cuantizacion declarado) |
| Idiomas soportados | no disponible (la conversion opera sobre caracteristicas acusticas, no sobre texto) |
| Licencia | CC BY 4.0 para las conversiones ONNX de Dryaides; MIT para los pesos originales de ContentVec y kullbunta |
| Formato de pesos | ONNX (opset 17) e indice FAISS (IVF81, Flat, nprobe 1) |

## Arquitectura y entrenamiento

El sistema sigue la arquitectura tipica de RVC (Retrieval-based Voice Conversion). En primer lugar, un encoder de representaciones de habla autorreducido extrae caracteristicas del audio de entrada; en este caso se usa ContentVec, una variante de HuBERT, concretamente la salida de la capa 12 del checkpoint legacy 500, exportada a ONNX con opset 17. Sobre esas caracteristicas actua el generador RVC v2 a 40 kHz, que sintetiza la voz objetivo de aldeano. El indice FAISS (added_IVF81_Flat_nprobe_1_v2.index) se emplea para la recuperacion de caracteristicas en la fase de conversion, segun el enfoque retrieval-based que da nombre a RVC.

No hay informacion en la documentacion proporcionada sobre el numero de tokens de audio, la composicion del dataset de entrenamiento original, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables en este dominio). El autor indica explicitamente que los pesos no se han modificado, solo convertido a ONNX, y que no se uso ningun fichero ONNX preexportado bajo GPL. Los pesos originales proceden de lengyue233/content-vec-best (ContentVec) y de kullbunta/villager (modelo RVC v2 de aldeano), ambos bajo licencia MIT.

## Capacidades

- Conversion de voz en tiempo real orientada a transformar la voz del jugador en una voz de aldeano de Minecraft.
- Extraccion de caracteristicas acusticas de habla mediante ContentVec, independiente del contenido linguistico.
- Recuperacion de caracteristicas mediante indice FAISS (IVF81, Flat, nprobe 1) para la fase de conversion.
- Inferencia portable mediante ONNX Runtime, sin necesidad de las dependencias de entrenamiento de RVC.
- Verificacion de integridad de los ficheros mediante SHA-256 antes de cargarlos.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de tool calling, function calling ni capacidades de agente.
- No hay soporte multilingue en el sentido de un modelo de lenguaje: la conversion depende de caracteristicas acusticas, no de idioma declarado.

## Casos de uso

- Mod de Minecraft Voice Potions: el mod descarga estos ficheros en el primer uso y convierte la voz del jugador en voz de aldeano durante la partida. Es el caso de uso para el que se publico el repositorio.
- Efectos de voz para gaming en tiempo real: integracion de la conversion mediante ONNX Runtime en motores de juego o aplicaciones de escritorio que necesiten un cambio de timbre concreto.
- Investigacion y prototipado de RVC: servir como referencia de una exportacion funcional a ONNX (opset 17) de un pipeline ContentVec + RVC v2, util para estudiar el proceso de conversion de pesos sin reentrenar.
- Pruebas de pipelines de audio ligeros: dado el tamano contenido del conjunto (~475 MB de ONNX + ~9,5 MB de indice), permite evaluar la inferencia de conversion de voz en hardware modesto.
- Contenido creativo con voz de aldeano: generacion de audio tematico o parodias con la voz objetivo del modelo entrenado por kullbunta.
- Demostraciones de verificacion de integridad de artefactos: el uso del SHA-256 por fichero ilustra una practica de seguridad reutilizable en la distribucion de modelos descargados en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (por ejemplo, MOS de calidad de voz, similitud de hablante u otras) ni comparaciones cuantitativas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. A partir del tamano de los ficheros (generador de ~105 MB y extractor de ~360 MB), el conjunto puede ejecutarse con muy poca memoria, previsiblemente por debajo de 2 GB, aunque esta cifra es una estimacion derivada del tamano y no un dato publicado.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte de ONNX Runtime (CUDA o similar) es candidata; no se detallan modelos concretos.
- Ejecucion en GPU de consumo: muy probable, dado el reducido tamano de los ficheros; cabe incluso la ejecucion en CPU mediante ONNX Runtime, aunque no se han publicado mediciones.
- Opciones de despliegue: ONNX Runtime (el formato de distribucion es ONNX con opset 17). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de conversion de voz.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de otros modelos de conversion de voz ni metricas comparativas, y no es posible establecer comparaciones cuantitativas con alternativas (como otras implementaciones RVC, so-vits-svc u otros pipelines de conversion de voz) sin inventar cifras.

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo de lenguaje; muchas categorias habituales de una ficha (contexto, benchmarks, tool calling) no aplican o no estan documentadas.
- Alcance de la voz: el modelo produce una unica voz objetivo (la de aldeano) definida por kullbunta; no permite elegir voces arbitrarias.
- Datos incompletos: no se documentan parametros, cuantizacion, idiomas, latencia ni calidad de conversion.
- Repositorio sin traccion: cero descargas y cero interacciones en el momento de la consulta, sin garantia de mantenimiento.
- Riesgo de uso indebido: la conversion de voz puede emplearse para suplantacion o deepfakes; debe aplicarse solo a voces con consentimiento y en contextos legitimos.
- Restricciones de licencia: las conversiones ONNX estan bajo CC BY 4.0, que exige atribuir a "Dryaides" en caso de reutilizacion; los pesos originales son MIT y sus avisos se conservan en NOTICE.md.
- Dependencia de terceros: el funcionamiento depende de los modelos de lengyue233/content-vec-best y kullbunta/villager, cuyos cambios o retirada afectarian al pipeline.
- Riesgo de fallo de carga: el mod verifica el SHA-256 de cada fichero antes de cargarlo; cualquier modificacion o descarga corrupta impide su uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dryaides/voicecore-models
- ContentVec de origen: https://huggingface.co/lengyue233/content-vec-best
- Modelo RVC v2 de aldeano de origen: https://huggingface.co/kullbunta/villager
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/

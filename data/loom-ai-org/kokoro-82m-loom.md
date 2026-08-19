# loom-ai-org/kokoro-82m-loom

## Resumen

Kokoro-82M-loom es una exportación del modelo de síntesis de voz (text-to-speech) Kokoro-82M, desarrollado originalmente por hexgrad, adaptado al formato GGUF de loom.cpp por loom-ai-org. El modelo toma identificadores de fonemas como entrada, no texto directamente, y genera audio a 24 kHz. Se distribuye como un único archivo GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador (si existe) y el script de control, lo que facilita su ejecución con la librería loom-py.

Con 81,27 millones de parámetros, es un modelo ligero diseñado para funcionar en entornos con recursos limitados. La exportación no modifica los pesos originales; simplemente los empaqueta en el formato de loom.cpp. Incluye una voz por defecto (af_heart) y 54 paquetes de voz adicionales que se pueden descargar por separado, lo que permite seleccionar entre diferentes timbres y acentos. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de este modelo radica en su eficiencia y en la integración con el ecosistema loom.cpp, que ofrece una alternativa ligera a otros motores TTS para aplicaciones de servidor, edge computing o dispositivos con poca memoria. Al estar basado en fonemas, requiere un paso de conversión grafema-a-fonema (G2P) externo, que se puede instalar como dependencia opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS basado en fonemas, exportado de hexgrad/Kokoro-82M) |
| Parametros totales | 81.276.642 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (TTS) |
| Tipos de cuantizacion | No especificado (formato GGUF de loom.cpp) |
| Idiomas soportados | Ingles (etiqueta oficial); la documentacion de voces menciona 8 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (loom.cpp) |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos sobre la arquitectura interna del modelo original en la informacion proporcionada. Se sabe que Kokoro-82M es un modelo de sintesis de voz que opera sobre secuencias de fonemas, con un mecanismo de estilos de voz (voice packs) que condicionan la duracion y el timbre. La exportacion a loom.cpp no altera los pesos; simplemente reorganiza el checkpoint en un formato autodescriptivo que incluye el grafo de computo y el driver necesario para la inferencia.

En cuanto al entrenamiento, no se han publicado datos sobre el corpus utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La informacion disponible se limita a indicar que los pesos son identicos a los del modelo base hexgrad/Kokoro-82M, y que la unica diferencia es el empaquetado.

## Capacidades

- Sintesis de voz a partir de secuencias de fonemas (no acepta texto plano directamente).
- Generacion de audio en formato WAV a 24 kHz de frecuencia de muestreo.
- Seleccion de voz entre 54 voces diferentes, cada una con caracteristicas de timbre y duracion propias.
- Soporte multilingue condicionado a la voz elegida: aunque la etiqueta oficial es "en", la tabla de voces documenta 8 idiomas (segun la documentacion de VOICES.md).
- Integracion con el ecosistema loom.cpp: el GGUF incluye el driver y las topologias, permitiendo inferencia sin dependencias externas adicionales (excepto el G2P).
- Inferencia sin GPU: al ser un modelo de solo 82M parametros, puede ejecutarse en CPU con baja latencia.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el modelo cabe en sistemas con poca RAM y puede generar respuestas de voz en tiempo real, por ejemplo en altavoces inteligentes o kioscos interactivos.
- Generacion de audiolibros: dado su soporte de multiples voces, se puede utilizar para convertir libros electronicos en audio con diferentes narradores, manteniendo un tamano de modelo reducido.
- Lectura de noticias o articulos en aplicaciones moviles: integrado via loom-py, permite sintetizar texto en audio sin depender de servicios en la nube.
- Pruebas de accesibilidad: desarrollo de herramientas de lectura de pantalla para personas con discapacidad visual, con la ventaja de poder ejecutarse localmente.
- Sistemas de respuesta de voz interactiva (IVR) en centralitas: el modelo puede generar prompts de voz personalizados en funcion de la entrada del usuario, con baja latencia.
- Creacion de contenido para videojuegos o animaciones: los 54 paquetes de voz permiten dar vida a personajes sin necesidad de grabar lineas manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de comparativas cuantitativas con otros modelos TTS en terminos de calidad de audio, MOS (Mean Opinion Score) o latencia.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 82M parametros, la inferencia puede realizarse en CPU con menos de 1 GB de RAM. En GPU, cabe en cualquier tarjeta con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior).
- GPU recomendadas: no se especifican requisitos minimos; el modelo puede ejecutarse en CPUs modernas sin aceleracion grafica.
- Compatibilidad con GPU de consumo: si, cualquier GPU con soporte CUDA o incluso sin el, ya que loom.cpp puede usar CPU.
- Opciones de despliegue: se puede ejecutar con loom-py (Python) o directamente con loom.cpp (C++). No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos numericos, pero al ser un modelo pequeno se espera una generacion de audio casi en tiempo real en CPU moderna.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos TTS como Piper, Coqui TTS o Edge TTS, ya que no se han publicado benchmarks ni especificaciones comparables en la documentacion proporcionada. La unica referencia es el modelo base hexgrad/Kokoro-82M, del cual esta exportacion es una variante de formato.

## Limitaciones y advertencias

- Requiere un paso de conversion grafema-a-fonema (G2P) externo; el modelo no acepta texto directamente. Si no se instala la dependencia "phonemes", el usuario debe proporcionar los fonemas manualmente.
- La frecuencia de muestreo no esta embebida en el GGUF; debe pasarse como argumento (24000 Hz) o el audio se reproducira a una velocidad incorrecta.
- La etiqueta oficial de idioma es "en", aunque la documentacion de voces menciona 8 idiomas. No se garantiza la calidad para todos ellos.
- Las voces adicionales se distribuyen en formato PyTorch (.pt) y requieren torch para cargarlas, aunque loom-py en si no tiene dependencias de torch.
- El modelo no incluye un tokenizador de texto; la tabla de simbolos de fonemas esta en el GGUF, pero la conversion G2P es responsabilidad del usuario.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un TTS, el riesgo de contenido inapropiado depende del texto de entrada y de las voces utilizadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/loom-ai-org/kokoro-82m-loom
- Modelo original: https://huggingface.co/hexgrad/Kokoro-82M
- loom.cpp (motor): https://github.com/loom-ai-org/loom.cpp
- loom-py (libreria Python): https://github.com/loom-ai-org/loom-py
- loom-exporter (exportador): https://github.com/loom-ai-org/loom-exporter

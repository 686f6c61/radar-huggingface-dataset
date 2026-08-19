# loom-ai-org/supertonic-2-loom

## Resumen

Supertonic 2 Loom es una exportación del modelo de síntesis de voz (text-to-speech) de Supertone, empaquetado en formato GGUF para el motor de inferencia loom.cpp. Desarrollado por loom-ai-org, este modelo está diseñado para ejecutarse en dispositivos locales (on-device) sin necesidad de conexión a internet ni de servicios externos de fonetización, ya que el propio modelo codifica el texto de entrada. Con 66,6 millones de parámetros, es un modelo compacto que admite cinco idiomas (inglés, coreano, español, portugués y francés) e incluye diez voces predefinidas (F1-F5 y M1-M5), aunque solo una de ellas (F1) está integrada por defecto en el archivo GGUF.

La relevancia de este modelo radica en su formato de distribución: un único archivo GGUF autodescriptivo que contiene el grafo de computación, el tokenizador y el script de control, lo que facilita su despliegue en entornos con recursos limitados, como aplicaciones móviles, dispositivos embebidos o servidores sin GPU. Al estar basado en el modelo original Supertone/supertonic-2, hereda su licencia OpenRAIL-M, que permite uso comercial con restricciones. Es una opción práctica para desarrolladores que necesitan síntesis de voz multilingüe de alta calidad con latencia baja y control total sobre el proceso de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Supertone, no se especifica la topologia interna) |
| Parametros totales | 66.626.307 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de texto por llamada (maximo, aproximadamente 490 caracteres) |
| Tipos de cuantizacion | GGUF (sin cuantizacion adicional documentada) |
| Idiomas soportados | en, ko, es, pt, fr |
| Licencia | OpenRAIL-M |
| Formato de pesos | GGUF (safetensors en el repo base, pero esta exportacion usa GGUF) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original Supertone/supertonic-2. Se sabe que es un modelo de sintesis de voz que codifica el texto directamente, sin depender de un fonetizador externo, y que genera audio a una frecuencia de muestreo de 44100 Hz (valor que debe pasarse explicitamente en la llamada, ya que el checkpoint no lo declara). La exportacion a loom.cpp encapsula el grafo de computacion, el tokenizador y un script de control en un unico archivo GGUF, lo que permite ejecutar el modelo con la libreria loom-py sin dependencias adicionales.

En cuanto al entrenamiento, no se han publicado datos sobre el dataset utilizado, el numero de tokens de entrenamiento ni el proceso de alineamiento (RLHF, DPO, etc.). El modelo base es Supertone/supertonic-2, cuyos pesos se mantienen sin modificar en esta exportacion. La unica innovacion tecnica destacable es el propio formato de empaquetado de loom.cpp, que permite ejecutar el modelo en entornos sin GPU y con una integracion sencilla en aplicaciones Python.

## Capacidades

- Sintesis de voz (text-to-speech) en cinco idiomas: ingles, coreano, espanol, portugues y frances.
- Codificacion de texto integrada: no requiere fonetizador externo ni preprocesamiento linguistico adicional.
- Seleccion de voz mediante estilos: incluye diez voces predefinidas (F1-F5, M1-M5), aunque solo F1 esta embebida en el archivo GGUF por defecto. Las demas se cargan desde archivos JSON externos.
- Generacion de audio a 44100 Hz, con control sobre la duracion y el timbre de la voz segun el estilo elegido.
- Inferencia on-device: apto para ejecucion en CPU y dispositivos con recursos limitados gracias a su tamano reducido (66M parametros).
- API sencilla: la libreria loom-py ofrece un metodo de alto nivel (`text2speech.infer`) que gestiona el ventaneo, muestreo y ensamblaje del audio automaticamente.

## Casos de uso

- Asistentes de voz en aplicaciones moviles: el modelo puede generar respuestas habladas en tiempo real sin conexion, lo que reduce la latencia y preserva la privacidad del usuario al no enviar texto a servidores externos. Su tamano compacto permite integrarlo en apps Android o iOS.
- Audiolibros y narracion de contenido: con soporte para cinco idiomas y diez voces, es adecuado para convertir articulos, libros o noticias en audio, seleccionando la voz mas apropiada para cada segmento. La limitacion de 512 tokens por llamada obliga a dividir textos largos, pero el modelo maneja correctamente fragmentos mas cortos.
- Doblaje y produccion multimedia: los estudios pueden usar las voces predefinidas para generar locuciones preliminares o prototipos de doblaje, ajustando el estilo (tono, timbre) mediante los embeddings de estilo disponibles en los archivos JSON.
- Accesibilidad: personas con discapacidad visual o dificultades de lectura pueden beneficiarse de una solucion TTS local que funcione sin internet, ideal para dispositivos de asistencia o lectores de pantalla.
- Prototipado rapido de productos: los desarrolladores pueden integrar el modelo en pipelines de CI/CD para generar muestras de voz automaticamente durante el desarrollo de aplicaciones, sin depender de servicios cloud de pago.
- Educacion y aprendizaje de idiomas: al soportar espanol, portugues, frances, ingles y coreano, el modelo puede utilizarse en aplicaciones de pronunciacion o practica de conversacion, generando ejemplos de audio en el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre calidad de voz (MOS), velocidad de inferencia o comparaciones con otros modelos TTS en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo de 66M parametros, es probable que quepa en GPUs con poca memoria, pero no se especifican cifras concretas.
- GPU recomendadas: no disponible. Dado su tamano, podria ejecutarse en CPU sin problemas, aunque no hay datos oficiales de rendimiento.
- Compatibilidad con consumer GPU: no confirmado, pero por el numero de parametros es plausible que funcione en GPUs de gama media (ej. RTX 3060) o incluso en CPU.
- Opciones de despliegue: la libreria loom-py (via pip) permite ejecutar el modelo en Python. Tambien se menciona loom.cpp como motor subyacente, por lo que podria integrarse en aplicaciones C++ o via bindings.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos TTS comparables en la documentacion proporcionada. No se pueden establecer comparaciones objetivas sin datos adicionales.

## Limitaciones y advertencias

- Longitud maxima de texto: cada llamada de sintesis admite como maximo 512 tokens (aproximadamente 490 caracteres, contando el envoltorio `<lang>...</lang>` y el punto final insertado). Textos mas largos deben dividirse manualmente, y el modelo no realiza esa division automaticamente.
- Una sola voz integrada: el archivo GGUF solo contiene la voz F1. Para usar las otras nueve voces, es necesario descargar los archivos JSON de estilos y pasarlos explicitamente a la funcion de inferencia.
- Sin clonacion de voz: el modelo no incluye los encoders de estilo necesarios para derivar una nueva voz a partir de audio de referencia. La clonacion requiere el checkpoint original de Supertone.
- Frecuencia de muestreo no autodeclarada: el checkpoint no indica la tasa de muestreo, por lo que debe pasarse manualmente (44100 Hz). Un valor incorrecto no genera un error, pero reproduce el audio a una velocidad equivocada.
- Licencia OpenRAIL-M: permite uso comercial, pero impone restricciones de uso (por ejemplo, no generar contenido ilegal o fraudulento). Es recomendable revisar el texto completo de la licencia antes de desplegar el modelo en produccion.
- Riesgo de sesgos y alucinaciones: al ser un modelo TTS, no genera contenido factual, pero puede producir pronunciaciones incorrectas en nombres propios o palabras poco comunes. No se han documentado sesgos especificos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/supertonic-2-loom
- Modelo base: https://huggingface.co/Supertone/supertonic-2
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Licencia OpenRAIL-M: https://huggingface.co/Supertone/supertonic-2/blob/main/LICENSE

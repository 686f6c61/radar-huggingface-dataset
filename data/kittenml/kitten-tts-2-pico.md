# KittenML/kitten-tts-2-pico

## Resumen

Kitten TTS 2 Pico es un modelo de sintesis de voz (text-to-speech) desarrollado por KittenML, disenado para inferencia en CPU con un consumo de recursos minimo. Cada modelo de lenguaje por idioma tiene 7,2 millones de parametros y genera audio a 24 kHz. El modelo cubre 8 idiomas (ingles, aleman, espanol, italiano, portugues de Brasil, ruso, hindi y frances) y ofrece 30 voces predefinidas en total.

La relevancia de este modelo radica en su extremadamente reducido tamano: los pesos ONNX cuantizados ocupan 8,0 MB por idioma en int8 y 4,0 MB por idioma en int4, lo que permite ejecutarlo en CPU sin necesidad de PyTorch ni de GPU. Esto lo hace adecuado para entornos con recursos limitados, dispositivos embebidos, aplicaciones de escritorio o pipelines donde el coste computacional y la latencia de arranque son criticos.

El modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integracion en productos derivados. La libreria `kittenml` abstrae la carga del modelo y la seleccion de backend (ONNX Runtime por defecto, PyTorch opcional), gestionando la descarga unicamente de los ficheros necesarios para el backend y formato de pesos seleccionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; se distribuye como grafo ONNX y pesos PyTorch) |
| Parametros totales | 7,2 millones por modelo de lenguaje (por idioma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX, 8,0 MB por idioma), int4 (ONNX, 4,0 MB por idioma), float32 (PyTorch) |
| Idiomas soportados | en, de, es, it, pt (Brasil), ru, hi, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8, int4), safetensors / PyTorch (float32) |
| Frecuencia de muestreo | 24 kHz |
| Voces disponibles | 30 en total (4 en en, de, es, it, pt, ru y fr; 2 en hi) |
| Tamano del repositorio | 0,3 GB |
| Backends de inferencia | ONNX Runtime (por defecto), PyTorch (CPU o CUDA) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de red, capas, mecanismo de atencion ni diseno del decodificador de audio). Se trata de un modelo TTS neuronal con 7,2 millones de parametros por idioma, lo que sugiere un diseno compacto orientado a eficiencia mas que a maxima calidad expresiva. El modelo se distribuye como grafo ONNX para inferencia con ONNX Runtime y como pesos float32 en PyTorch.

No se han publicado en la informacion disponible datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card menciona que los ficheros G2P (grapheme-to-phoneme) incluidos tambien estan bajo Apache-2.0, lo que indica que el pipeline incluye conversion de texto a fonemas antes de la sintesis.

## Capacidades

- Sintesis de voz a partir de texto en 8 idiomas: ingles, aleman, espanol, italiano, portugues de Brasil, ruso, hindi y frances.
- 30 voces predefinidas con nombres y descripciones (por ejemplo, "Eleanor: historiadora sombria" en ingles, "Sofia: femenina 1" en espanol).
- Seleccion de voz por nombre (insensible a mayusculas) o por descripcion; la voz determina el idioma.
- Control de velocidad de habla mediante el parametro `speed` (por ejemplo, `speed=1.1`).
- Generacion de audio a 24 kHz, compatible con `soundfile` para escritura en WAV.
- Inferencia en CPU sin necesidad de PyTorch usando ONNX Runtime (int8 por defecto, int4 opcional con `onnxruntime>=1.20`).
- Backend PyTorch opcional con soporte de GPU CUDA.
- Descarga selectiva de ficheros segun backend y formato de pesos.
- No se documentan capacidades de clonacion de voz, control emocional, tool calling ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- **Lectura de textos en aplicaciones de escritorio o moviles sin GPU**: el modelo int8 de 8,0 MB por idioma se ejecuta en CPU con ONNX Runtime, lo que permite integrar sintesis de voz en aplicaciones ligeras sin dependencias pesadas de PyTorch.
- **Asistentes de voz embebidos en dispositivos con recursos limitados**: con 4,0 MB por idioma en int4, el modelo cabe en dispositivos con memoria restringida (Raspberry Pi, sistemas empotrados) y puede generar respuestas habladas en tiempo de ejecucion.
- **Accesibilidad y lectura de pantalla**: conversion de texto a voz para personas con discapacidad visual o dificultades de lectura, con soporte de multiples idiomas y voces masculinas y femeninas.
- **Generacion de audiolibros o contenido narrado por lotes**: el bajo coste por inferencia y la posibilidad de ejecutar en CPU permiten procesar grandes volumenes de texto sin depender de GPU, seleccionando voz e idioma por fichero.
- **Localizacion de contenido multimedia**: un mismo pipeline puede generar narraciones en espanol, frances, aleman, italiano, portugues, ruso, hindi e ingles usando las voces correspondientes, util para doblaje o versiones multilingues de videos y tutoriales.
- **Prototipado rapido de interfaces conversacionales**: la API de `kittenml` permite generar audio con una sola llamada (`m.generate(...)`) y escribir WAV con `soundfile`, lo que acelera la validacion de ideas en entornos de desarrollo sin infraestructura de GPU.
- **Sistemas de anuncios o notificaciones por voz**: generacion de mensajes hablados dinamicos en aplicaciones de transporte, comercio o industria, donde la latencia de arranque y el consumo de memoria son criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no aplica en modo CPU (ONNX Runtime). En backend PyTorch con `device="cuda"` no se especifica VRAM; dado el tamano de 7,2 M de parametros por idioma, el uso de memoria es muy reducido (del orden de decenas de MB en float32).
- **GPU recomendadas**: no se especifican; el modelo esta disenado para CPU. Cualquier GPU compatible con CUDA y PyTorch puede usarse con `backend="torch"`, pero no es el modo previsto.
- **Compatibilidad con GPU de consumo**: si, mediante el backend PyTorch; el modo principal (ONNX en CPU) no requiere GPU.
- **Opciones de despliegue**: ONNX Runtime (por defecto, int8 o int4 con `onnxruntime>=1.20`), PyTorch (CPU o CUDA). La libreria `kittenml` gestiona la carga y descarga de pesos.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni especificaciones de modelos comparables (Piper, Coqui TTS, Kokoro, etc.) que permitan una comparacion rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo ni de las voces; al ser un modelo TTS, los sesgos se manifestarian en la calidad y naturalidad percibida de las voces segun idioma y genero.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o en textos con abreviaturas, siglas o nombres propios, especialmente en idiomas con G2P complejo (hindi, ruso).
- No se especifica la longitud maxima de texto por llamada ni el contexto soportado; textos muy largos podrian requerir fragmentacion manual.
- La calidad de sintesis de un modelo de 7,2 M de parametros por idioma es previsiblemente inferior a la de modelos TTS de mayor tamano; no se han publicado metricas objetivas (MOS, WER) en la informacion disponible.
- El soporte de hindi es limitado a 2 voces, frente a 4 en el resto de idiomas.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso de licencia.
- El backend int4 requiere `onnxruntime>=1.20`; versiones anteriores no son compatibles.
- No se documentan mecanismos de clonacion de voz ni control de emociones, lo que limita casos de uso que requieran voces personalizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KittenML/kitten-tts-2-pico
- Repositorio de la libreria: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

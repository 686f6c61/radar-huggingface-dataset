# KittenML/kitten-tts-2-nano

## Resumen

Kitten TTS 2 Nano es un modelo de síntesis de voz (text-to-speech) desarrollado por KittenML, diseñado para inferencia en CPU con un tamaño extremadamente reducido. Cada modelo de idioma cuenta con 17 millones de parámetros y el conjunto cubre 8 idiomas (inglés, alemán, español, italiano, portugués de Brasil, ruso, hindi y francés) con un total de 37 voces predefinidas, generando audio a 24 kHz.

La propuesta diferencial es el despliegue ligero: los pesos ONNX en int8 ocupan 17,4 MB por idioma y los int4 apenas 8,8 MB, lo que permite ejecutar el modelo sin PyTorch ni GPU, únicamente con ONNX Runtime. Esto lo hace relevante para entornos con recursos muy limitados: dispositivos embebidos, navegadores, aplicaciones de escritorio o servicios con requisitos estrictos de latencia y memoria.

El modelo se distribuye bajo licencia Apache-2.0, incluyendo los pesos, los paquetes de voces y los ficheros G2P (grafema a fonema) incluidos. La integración se realiza mediante el paquete `kittenml`, que gestiona la descarga selectiva de los ficheros necesarios según el backend y el formato de pesos elegidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos en ONNX y PyTorch) |
| Parametros totales | 17 M por modelo de idioma |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (17,4 MB por idioma), int4 (8,8 MB por idioma), float32 (PyTorch) |
| Idiomas soportados | en, de, es, it, pt (Brasil), ru, hi, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8 e int4), safetensors/PyTorch (float32) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de red, mecanismo de atención, componentes de prosodia o duración). Lo que sí se especifica es que cada idioma dispone de su propio modelo de 17 millones de parámetros y que la inferencia se ejecuta como un grafo ONNX mediante ONNX Runtime, con variantes cuantizadas en int8 e int4, además de los pesos originales en float32 para PyTorch.

El modelo incorpora ficheros G2P empaquetados para la conversión de texto a fonemas, y las voces se almacenan como paquetes separados por idioma en ficheros `voices_<lang>.npz`. No se han publicado datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino preferencial.

## Capacidades

- Síntesis de voz a partir de texto en 8 idiomas: inglés, alemán, español, italiano, portugués de Brasil, ruso, hindi y francés.
- 37 voces predefinidas con descripciones de estilo (por ejemplo, "historiador sombrío" o "locutor deportivo enérgico" en inglés; voces femeninas y masculinas numeradas en el resto de idiomas).
- Selección de voz por nombre (insensible a mayúsculas) o por descripción; si no se especifica voz, se usa la primera del idioma.
- Control de velocidad mediante el parámetro `speed` (por ejemplo, `speed=1.1`).
- Generación de audio a 24 kHz.
- Ejecución en CPU sin necesidad de PyTorch mediante ONNX Runtime (backend por defecto), o en GPU con el backend PyTorch (`device="cuda"`).
- Descarga selectiva de ficheros según backend y formato de pesos.
- No se documentan capacidades de clonación de voz, emoción controlable, tool calling ni razonamiento multi-paso.

## Casos de uso

- Lectura por voz en aplicaciones de accesibilidad: el modelo puede convertir texto en audio en tiempo real en el propio dispositivo del usuario gracias a sus 17,4 MB en int8, sin depender de servicios en la nube.
- Asistentes de voz embebidos: con 8,8 MB en int4 y ejecución en CPU, es viable integrarlo en dispositivos con memoria limitada (Raspberry Pi, routers, electrodomésticos) para respuestas habladas en varios idiomas.
- Audiolibros y contenido largo por lotes: la generación a 24 kHz con control de velocidad permite producir narraciones en inglés, alemán, español, italiano, portugués, ruso, hindi y francés desde un mismo pipeline.
- Localización de productos: un mismo flujo de texto puede sintetizarse en cualquiera de los 8 idiomas soportados, reutilizando las voces nativas de cada uno para doblaje o avisos multilingües.
- Sistemas de megafonía y avisos automatizados: la baja latencia esperada al ejecutar en CPU y el tamaño reducido permiten desplegar anuncios dinámicos en estaciones, aeropuertos o comercios sin infraestructura GPU.
- Prototipado e investigación en TTS: al ser Apache-2.0 y ofrecer pesos en float32 para PyTorch, sirve como base para experimentación, ajuste fino o comparación de técnicas de cuantización.
- Aplicaciones web del lado del cliente: los pesos ONNX pueden servirse junto a la aplicación y ejecutarse con ONNX Runtime Web, evitando costes de servidor de síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el backend ONNX por defecto (ejecución en CPU); con el backend PyTorch en GPU, los pesos float32 de 17 M de parámetros ocupan del orden de decenas de MB, aunque no se especifica la VRAM total necesaria.
- GPU recomendadas: no se documentan requisitos concretos; el backend PyTorch admite `device="cuda"` en cualquier GPU compatible con CUDA.
- Cabe en GPU de consumo: sí, por el tamaño reducido de los pesos (17 M de parámetros), aunque no se detallan modelos concretos.
- Cabe en CPU: sí, es el modo de ejecución principal; int8 requiere 17,4 MB por idioma e int4 8,8 MB por idioma.
- Opciones de despliegue: ONNX Runtime (backend por defecto, con `onnxruntime>=1.20` para int4) y PyTorch (backend alternativo). El paquete `kittenml` gestiona la carga y la descarga selectiva.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kitten TTS 2 Nano | 17 M por idioma | no disponible | 8 | Apache-2.0 | ONNX int8/int4, PyTorch float32 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un sistema TTS entrenado con datos no especificados, pueden aparecer sesgos de pronunciación, prosodia o estilo asociados a las voces y los idiomas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas, entonación artificial o errores en palabras poco frecuentes, siglas y nombres propios.
- Limitaciones de contexto o idioma: la información no especifica la longitud máxima de texto de entrada; el modelo cubre 8 idiomas y no se documentan otros.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, incluyendo pesos, voces y ficheros G2P, con las obligaciones habituales de atribución y aviso de licencia.
- Caveats para producción: el formato int4 requiere `onnxruntime>=1.20`; el rendimiento y la calidad pueden variar entre cuantizaciones (int8, int4 y float32); no se han publicado métricas objetivas de calidad (MOS, WER) ni de latencia.
- El repositorio tiene un tamaño de 0,8 GB, aunque la descarga selectiva reduce el espacio necesario según el backend y el formato elegidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KittenML/kitten-tts-2-nano
- Paquete de Python: `pip install kittenml` (no se proporciona URL adicional en la información disponible)

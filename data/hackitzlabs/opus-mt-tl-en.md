# HackitzLabs/opus-mt-tl-en

## Resumen

opus-mt-tl-en es una conversión a ONNX del modelo de traducción automática neuronal Helsinki-NLP/opus-mt-tl-en, publicada por HackitzLabs para su uso en dispositivos locales mediante transformers.js. El modelo original forma parte de la familia OPUS-MT desarrollada por el Grupo de Investigación en Tecnología del Lenguaje de la Universidad de Helsinki (Jörg Tiedemann et al.), entrenada sobre datos del corpus OPUS. La conversión no introduce fine-tuning: los pesos se mantienen inalterados y solo se transforman a formato ONNX con cuantización int8 para reducir el tamaño y permitir inferencia en el navegador o en aplicaciones de escritorio.

El modelo resuelve la traducción directa de tagalo/filipino (tl) a inglés (en) en un único sentido, con una arquitectura Marian de tipo encoder-decoder y un tamaño de repositorio de 0,1 GB. Su relevancia práctica radica en que permite traducción on-device sin dependencia de servicios en la nube, integrándose en aplicaciones como JustMail for Windows. El autor advierte que la salida tiende a un inglés formal y de libro de texto, por lo que debe tratarse como un primer borrador.

La licencia Apache 2.0 del modelo original se mantiene en esta conversión, lo que facilita su uso comercial y su redistribución. No se dispone de información sobre parámetros totales, longitud de contexto ni composición exacta del dataset en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX cuantizado) |
| Idiomas soportados | tagalo/filipino (tl) → inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (cuantizado int8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal y empleado de forma extensiva en la familia OPUS-MT. La conversión publicada por HackitzLabs se generó con los scripts de transformers.js v2.17.2, aplicando conversión a ONNX y cuantización int8; los pesos no se han modificado ni se ha realizado fine-tuning adicional.

El entrenamiento original corresponde a Helsinki-NLP sobre datos del corpus OPUS, una colección de corpus paralelos multilingües. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica de esta publicación concreta es la optimización para inferencia on-device en transformers.js, no cambios arquitectónicos.

## Capacidades

- Traducción de texto de tagalo/filipino a inglés en un único sentido.
- Generación de texto traducido con registro formal y estilo de libro de texto.
- Ejecución on-device mediante transformers.js, sin necesidad de servidor.
- Inferencia en navegador o en aplicaciones de escritorio empaquetadas (por ejemplo, JustMail for Windows).
- Modelo compacto (repositorio de 0,1 GB) apto para entornos con recursos limitados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al par tl→en; no cubre otros idiomas.

## Casos de uso

- Traducción de correos electrónicos en aplicaciones de escritorio: integrado en JustMail for Windows, el modelo traduce mensajes de tagalo a inglés localmente, sin enviar contenido a servidores externos y preservando la privacidad del usuario.
- Traducción en el navegador para formularios y contenido web: al ejecutarse con transformers.js, puede traducir texto introducido por el usuario en una página web sin backend, usando la cuantización int8 para mantener el tamaño reducido.
- Preprocesamiento de datos para pipelines de NLP: traducción por lotes de corpus en tagalo a inglés antes de tareas posteriores como análisis de sentimiento o extracción de entidades, aprovechando que el modelo es ligero y desplegable en CPU.
- Atención al cliente en mercados filipinos: traducción de consultas de usuarios en tagalo a inglés para que agentes o sistemas downstream las procesen, con la advertencia de que la salida requiere revisión por su registro formal.
- Herramientas de accesibilidad y lectura: traducción de documentos o mensajes cortos en tagalo a inglés en dispositivos de gama baja, gracias al tamaño compacto del modelo ONNX cuantizado.
- Prototipado rápido de sistemas de traducción: al estar disponible en formato ONNX y con licencia Apache 2.0, sirve como base para experimentar con traducción tl→en en entornos de investigación sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio ocupa 0,1 GB y la cuantización int8 reduce considerablemente los requisitos, por lo que es apto para ejecución en CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia on-device, no para despliegue en GPU de datacenter.
- Compatibilidad con GPU consumer: probable en cualquier GPU consumer moderna e incluso en CPU, dado el tamaño del repositorio y la cuantización int8; no se confirman cifras concretas.
- Opciones de despliegue: transformers.js (principal, con soporte ONNX); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| HackitzLabs/opus-mt-tl-en (este) | no disponible | no disponible | tl → en | Apache 2.0 | ONNX int8 | Hugging Face, transformers.js |
| Helsinki-NLP/opus-mt-tl-en | no disponible | no disponible | tl → en | Apache 2.0 | safetensors/PyTorch | Hugging Face, transformers |
| Otros modelos OPUS-MT (familia) | variable por par | no disponible | multiples pares | Apache 2.0 | safetensors/PyTorch | Hugging Face, GitHub Helsinki-NLP/Opus-MT |

La diferencia principal frente al modelo original de Helsinki-NLP es el formato: esta versión está cuantizada a int8 y optimizada para transformers.js, mientras que el original se distribuye para PyTorch/transformers. No se dispone de datos de rendimiento comparativo entre ambas versiones.

## Limitaciones y advertencias

- Traducción unidireccional: solo cubre tl→en; no traduce de inglés a tagalo ni otros pares.
- Registro formal: la salida es inglés formal y de libro de texto, según advierte el autor; puede no reflejar el tono natural o coloquial del texto original.
- Calidad de borrador: el autor indica explícitamente que debe tratarse como un primer borrador, no como traducción final.
- Sin fine-tuning: los pesos son idénticos al modelo original; no se han corregido sesgos ni errores del modelo base.
- Riesgo de alucinación y errores de traducción inherentes a los modelos Marian, especialmente en textos largos o dominios especializados; no se documentan evaluaciones al respecto.
- Limitaciones de contexto no documentadas: se desconoce la longitud máxima de entrada.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse sobre corpus OPUS puede heredar sesgos de dominio y de género presentes en esos datos.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero exige mantener el aviso de licencia y la atribución correspondiente.
- Soporte limitado de ecosistema: al estar orientado a transformers.js, no se garantiza compatibilidad con frameworks de serving de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HackitzLabs/opus-mt-tl-en
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-tl-en
- Repositorio OPUS-MT en GitHub: https://github.com/Helsinki-NLP/Opus-MT
- transformers.js: https://github.com/huggingface/transformers.js
- Corpus OPUS: https://opus.nlpl.eu/
- Tutorial de uso de OPUS-MT: https://aiindigo.com/tutorials/getting-started-with-opus-mt-multilingual-to-english-instant-global-translation
- Referencia: Tiedemann, J. & Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.

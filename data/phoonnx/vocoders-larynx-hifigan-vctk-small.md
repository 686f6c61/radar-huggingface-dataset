# Phoonnx/vocoders-larynx-hifigan-vctk-small

## Resumen

`vocoders-larynx-hifigan-vctk-small` es un vocoder neuronal de tipo HiFi-GAN extraido del repositorio [rhasspy/larynx](https://github.com/rhasspy/larynx) y redistribuido por Phoonnx como un subconjunto del paquete [Phoonnx/phoonnx-vocoders](https://huggingface.co/Phoonnx/phoonnx-vocoders). Su funcion no es generar habla desde texto directamente, sino convertir espectrogramas mel (la salida de un modelo acustico TTS) en forma de onda de audio, es decir, es la etapa final de un pipeline de sintesis de voz. El sufijo `vctk-small` indica que fue entrenado sobre el corpus VCTK en su variante reducida de datos.

El modelo se distribuye en formato ONNX y esta pensado para ejecutarse dentro del ecosistema [phoonnx](https://github.com/TigreGotico/phoonnx), un motor de sintesis de voz orientado a inferencia ligera. No contiene identificadores de voz propios: segun la propia model card, los archivos se usan desde otras voces del repositorio. Esto lo convierte en una pieza de infraestructura reutilizable mas que en un modelo autonomo de TTS.

Su relevancia es acotada pero practica: permite reconstruir un pipeline TTS completo en entornos con recursos limitados, ya que un vocoder HiFi-GAN "small" reduce el coste computacional frente a variantes de mayor capacidad. Al estar bajo licencia MIT, su integracion en productos comerciales no presenta friccion legal, siempre que se respete la atribucion correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HiFi-GAN (vocoder neuronal generativo adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; cuantizacion no documentada) |
| Idiomas soportados | no disponible (el vocoder es independiente del idioma; depende del modelo acustico que lo alimente) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

HiFi-GAN es una arquitectura de vocoder basada en un generador convolucional que transforma espectrogramas mel en audio a una frecuencia de muestreo determinada, entrenado de forma adversarial contra discriminadores de periodo y de escala. La variante "small" reduce el numero de canales y bloques respecto a las versiones de mayor capacidad, lo que disminuye el coste de inferencia a cambio de una ligera perdida de fidelidad en la reconstruccion de la forma de onda.

El entrenamiento se realizo sobre el corpus VCTK, un conjunto de habla en ingles con multiples hablantes y acentos, en su version reducida. La model card no aporta el numero de horas, la tasa de muestreo exacta ni los detalles del regimen de entrenamiento; estos datos deben consultarse en el repositorio original de rhasspy/larynx. No se documenta ningun proceso de RLHF ni de ajuste por preferencias, algo esperable en un vocoder.

## Capacidades

- Conversion de espectrogramas mel a forma de onda de audio (sintesis de voz).
- Integracion como etapa final de pipelines TTS que empleen modelos acusticos compatibles con la configuracion mel de Larynx.
- Ejecucion en formato ONNX, lo que permite desplegarlo con ONNX Runtime en CPU y GPU.
- Reutilizable por multiples voces del ecosistema phoonnx, segun indica la propia model card.
- No incluye identificadores de voz propios ni capacidad de generar habla a partir de texto de forma autonoma.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un componente de audio, no un modelo de lenguaje.
- No se documentan capacidades multilingues especificas; el idioma dependera del modelo acustico que genere los espectrogramas.

## Casos de uso

- Sintesis de voz embebida en dispositivos de baja potencia: al ser una variante "small" en ONNX, puede ejecutarse en Raspberry Pi o moviles con ONNX Runtime, sirviendo como etapa de audio en asistentes locales.
- Pipeline TTS completo con Larynx: se combina con un modelo acustico de Larynx para producir habla en ingles con voces del repositorio original, manteniendo la compatibilidad de configuracion mel.
- Lectura por voz de contenido en aplicaciones de accesibilidad: el vocoder reconstruye el audio a partir de la salida del modelo acustico, permitiendo integrar narracion en lectores de pantalla o herramientas similares.
- Generacion de audiolibros o podcasts automatizados: dentro de un pipeline por lotes, el vocoder convierte grandes volumenes de texto sintetizado en audio sin requerir GPU de gama alta.
- Sistemas de respuesta por voz en telefonia o IVR: la baja latencia de un HiFi-GAN small encaja en flujos conversacionales donde el tiempo de respuesta es critico.
- Investigacion y experimentacion en TTS: sirve como vocoder de referencia para comparar calidad y velocidad frente a variantes de mayor capacidad o a vocoders basados en difusion.
- Prototipado de asistentes conversacionales locales: al no depender de servicios en la nube, facilita despliegues con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo "small" en ONNX, es previsible que quede por debajo de 1 GB, pero no hay cifra oficial.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 o superiores); no se documentan requisitos minimos.
- Compatibilidad con GPU de consumo: probable en la mayoria de tarjetas actuales e incluso en CPU, aunque no se confirma en la model card.
- Opciones de despliegue: ONNX Runtime es la via natural; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vocoders-larynx-hifigan-vctk-small | HiFi-GAN small | no disponible | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| HiFi-GAN V1 (original) | HiFi-GAN | ~13,9 M (generador) | no aplica | MIT | PyTorch | GitHub oficial |
| Parallel WaveGAN | Conv. no autoregresiva | ~1,4 M | no aplica | MIT | PyTorch | GitHub oficial |
| MelGAN | Conv. no autoregresiva | ~4,3 M | no aplica | MIT | PyTorch | GitHub oficial |

Las cifras de parametros de los modelos comparables corresponden a sus implementaciones de referencia publicadas; no se dispone de datos de rendimiento comparativo especificos para esta variante concreta.

## Limitaciones y advertencias

- No es un modelo TTS autonomo: requiere un modelo acustico que genere espectrogramas mel compatibles con su configuracion.
- La model card no especifica la tasa de muestreo ni la configuracion mel exacta, lo que puede dificultar la integracion con modelos acusticos ajenos a Larynx.
- Al entrenarse sobre VCTK, el habla resultante estara condicionada por las caracteristicas de ese corpus (ingles, acentos britanicos diversos); no se garantiza calidad en otros idiomas.
- Riesgo de artefactos y perdida de fidelidad por la variante "small" frente a vocoders de mayor capacidad.
- No se documentan sesgos especificos, pero al derivar de un corpus de habla concreto puede heredar sesgos de representacion de hablantes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene verificar la licencia del repositorio fuente rhasspy/larynx para cumplir con los terminos de redistribucion.
- El tamano del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no estan efectivamente alojados o que la medicion no esta disponible.

## Enlaces

- [Hugging Face: Phoonnx/vocoders-larynx-hifigan-vctk-small](https://huggingface.co/Phoonnx/vocoders-larynx-hifigan-vctk-small)
- [Repositorio agregado: Phoonnx/phoonnx-vocoders](https://huggingface.co/Phoonnx/phoonnx-vocoders)
- [Repositorio phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
- [Repositorio fuente rhasspy/larynx](https://github.com/rhasspy/larynx)

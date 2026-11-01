# jmoraleses/folio-melo-ja-onnx

## Resumen

Folio Melo (ja, ONNX) es una exportación a formato ONNX del modelo MeloTTS de MyShell.ai, concretamente la variante de japonés (ja) utilizada como hablante base de OpenVoice. Lo publica el usuario jmoraleses como parte del proyecto Folio-iOS, con el objetivo de permitir inferencia en dispositivo (on-device) mediante ONNX Runtime. El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo licencia MIT.

El modelo resuelve el problema de la síntesis de voz (text-to-speech) ligera y ejecutable localmente en entornos donde no se dispone de GPU o no se desea enviar texto a un servicio en la nube. Al estar exportado a ONNX, puede integrarse en aplicaciones iOS, Android o de escritorio a través de ONNX Runtime, sin depender del stack original de PyTorch.

La relevancia actual radica en la creciente demanda de TTS privado y de baja latencia en aplicaciones móviles. MeloTTS es conocido por su calidad razonable con un coste computacional bajo, y esta exportación concreta añade metadatos específicos (`config.json` con símbolos fonéticos, desplazamiento de tono e ID de idioma) que facilitan la integración en pipelines propios. No obstante, la información pública disponible sobre esta exportación concreta es muy limitada: no se detallan métricas de calidad, ni el proceso de exportación, ni los parámetros exactos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MeloTTS (no se detalla la arquitectura interna en la informacion disponible; se sabe que es un modelo TTS de MyShell.ai) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo en el sentido habitual) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX; no se especifican variantes cuantizadas) |
| Idiomas soportados | japones (ja), segun el nombre del repositorio y la model card |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Frecuencia de muestreo de salida | 44,1 kHz (segun la model card) |
| Entradas del modelo | `x`, `x_lengths`, `tones`, `lang`, `sid`, `noise_scale`, `length_scale` |
| Salidas del modelo | `y` (audio a 44,1 kHz), `w_ceil` (frames por simbolo) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de esta exportacion. Se sabe que deriva de MeloTTS, un sistema de sintesis de voz de MyShell.ai publicado bajo licencia MIT, y que esta variante concreta corresponde al hablante base de OpenVoice para japones. El modelo se ha exportado a ONNX para su uso con ONNX Runtime, y el repositorio incluye un `config.json` que lista los simbolos foneticos, el desplazamiento de tono (tone offset) y el ID de idioma, lo que sugiere que el modelo opera a nivel de fonemas con control de tono.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas de esta exportacion mas alla del propio formato ONNX. La fuente indicada es el commit `90d5f2a` del repositorio jmoraleses/Folio-iOS, lo que indica que la exportacion se genero en el contexto de ese proyecto.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en japones.
- Control de prosodia basico mediante los parametros `noise_scale` (variabilidad) y `length_scale` (velocidad de habla).
- Control de tono a traves de la entrada `tones` y del desplazamiento de tono definido en `config.json`.
- Seleccion de hablante mediante la entrada `sid` (speaker ID), aunque no se detalla cuantos hablantes incluye esta exportacion.
- Inferencia en dispositivo mediante ONNX Runtime, sin necesidad de PyTorch en tiempo de ejecucion.
- Salida de audio a 44,1 kHz.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.

## Casos de uso

- Sintesis de voz en aplicaciones iOS: al estar exportado a ONNX y vinculado al proyecto Folio-iOS, el modelo puede integrarse en una app nativa para leer texto en japones sin conexion a internet, usando ONNX Runtime para iOS.
- Lectura de articulos y notificaciones: el modelo puede convertir texto de la interfaz o de contenidos en audio japones, con control de velocidad mediante `length_scale` para adaptarse a preferencias de accesibilidad.
- Asistentes de voz offline: al no requerir servicios en la nube, es adecuado para asistentes que deban funcionar en entornos con conectividad limitada o con requisitos de privacidad estrictos.
- Prototipado rapido de TTS en japones: al ser un repositorio pequeno (0,1 GB) y con licencia MIT, sirve para experimentar con sintesis de voz en pipelines de investigacion o demos sin depender de APIs comerciales.
- Generacion de audio para contenido educativo: lectura de material didactico en japones con control de prosodia para mejorar la comprension.
- Integracion en aplicaciones de escritorio multiplataforma: ONNX Runtime esta disponible en Windows, macOS y Linux, lo que permite reutilizar el mismo modelo en distintas plataformas.
- Base para fine-tuning o adaptacion: al derivar de MeloTTS y OpenVoice, puede servir como punto de partida para experimentos de clonacion de voz o adaptacion a otros dominios, aunque esta exportacion concreta no documenta ese flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo TTS de tamano reducido (repositorio de 0,1 GB), es probable que quepa en GPU consumer, pero no se confirman cifras.
- GPU recomendadas: no disponible. No se especifican requisitos minimos ni recomendados.
- Compatibilidad con GPU consumer: no confirmada, aunque el enfoque ONNX y el tamano del repositorio sugieren que podria ejecutarse en hardware modesto.
- Opciones de despliegue: ONNX Runtime (principal, segun la model card); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que ademas no aplican directamente a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Folio Melo (ja, ONNX) | no disponible | no aplica | japones | MIT | ONNX | Exportacion de MeloTTS para inferencia on-device |
| MeloTTS (original) | no disponible | no aplica | varios (en, es, fr, zh, ja, ko) | MIT | PyTorch | Modelo base de MyShell.ai; requiere PyTorch |
| OpenVoice | no disponible | no aplica | varios | MIT | PyTorch | Sistema de clonacion de voz de MyShell.ai; usa MeloTTS como hablante base |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion publica sobre esta exportacion concreta es muy escasa: no se documentan parametros, dataset de entrenamiento ni metricas de calidad.
- Solo se declara soporte para japones; no se confirma el comportamiento en otros idiomas.
- Al ser un modelo TTS, puede presentar artefactos de pronunciacion, entonacion o prosodia en textos complejos, nombres propios o terminos tecnicos.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado con datos no especificados, puede heredar sesgos de pronunciacion o de representacion de voces.
- Riesgo de alucinacion en el sentido de generar audio incorrecto o ininteligible para entradas fuera de distribucion; no se han publicado evaluaciones al respecto.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones de MeloTTS y OpenVoice originales, tambien MIT, y de cualquier dato de entrenamiento subyacente.
- El repositorio tiene muy pocas descargas (28) y ningun like, lo que sugiere poca validacion por parte de la comunidad.
- No se documentan garantias de mantenimiento ni actualizaciones; la ultima actualizacion es del 26 de octubre de 2026.
- Para produccion, conviene validar la calidad de sintesis en el dominio concreto de uso y considerar alternativas con documentacion mas completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jmoraleses/folio-melo-ja-onnx
- MeloTTS (MyShell.ai): https://github.com/myshell-ai/MeloTTS
- OpenVoice (MyShell.ai): no se proporciona enlace directo en la informacion disponible, pero se menciona como sistema del que deriva el hablante base.
- Proyecto Folio-iOS: no se proporciona enlace directo; se referencia el commit `90d5f2a` de jmoraleses/Folio-iOS.

# Phoonnx/rapido-pt_br-edwixx-graphemes

## Resumen

`rapido-pt_br-edwixx-graphemes` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado por Phoonnx para su librería de TTS basada en ONNX. El modelo original procede de `edwixx/rapido-tts`, desarrollado por el autor edwixx, y emplea la arquitectura Rapido. Está especializado en portugués de Brasil (`pt-BR`) y trabaja a nivel de grafemas, es decir, convierte directamente secuencias de caracteres en audio sin un paso intermedio de fonemización explícita.

El modelo resuelve la necesidad de disponer de una voz TTS ligera y ejecutable en local mediante ONNX Runtime, lo que facilita su integración en aplicaciones Python y en el ecosistema OVOS (Open Voice OS). Su tamaño de repositorio es de 0,3 GB y los pesos se distribuyen en formato fp32 según la nota de licencia de la model card.

Es relevante para proyectos que requieren una voz en portugués brasileño con licencia permisiva Apache 2.0 y sin dependencia de servicios en la nube. No obstante, el índice de voces de phoonnx no lista una voz asociada a este modelo, lo que limita su uso directo a través de la interfaz de voces de la librería. El número de descargas (23) y de likes (0) indica una adopción muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rapido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (único indicado en la model card) |
| Idiomas soportados | portugués de Brasil (`pt-BR`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura es Rapido, un modelo TTS empaquetado para su ejecución con la librería phoonnx sobre ONNX Runtime. La model card no proporciona detalles sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o muestras de audio utilizadas, ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del enfoque a nivel de grafemas.

El modo de operación por grafemas implica que el modelo recibe texto en caracteres y genera directamente la representación acústica, sin requerir un fonemizador externo. La model card menciona `scriptconv` como proyecto complementario para normalización de texto, conversión de script y fonemizadores, aunque no aclara si este modelo concreto depende de él en la práctica. Los pesos se distribuyen en precisión fp32.

## Capacidades

- Síntesis de voz a partir de texto en portugués de Brasil (`pt-BR`).
- Conversión directa de grafemas a audio, sin paso explícito de fonemización.
- Ejecución local mediante ONNX Runtime a través de la librería phoonnx.
- Integración en aplicaciones Python y en el ecosistema OVOS.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al portugués de Brasil según la configuración del modelo.
- No se documenta un modo de razonamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Lectura de contenido en portugués brasileño: el modelo convierte artículos, noticias o documentación en audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando su funcionamiento local sin coste por petición.
- Asistentes de voz en OVOS: al estar empaquetado para phoonnx y el ecosistema OVOS, puede integrarse como motor de voz en asistentes domésticos de código abierto que operen en portugués de Brasil.
- Generación de avisos y notificaciones habladas: útil en sistemas de megafonía, domótica o aplicaciones móviles que necesiten locuciones dinámicas en `pt-BR` sin depender de APIs externas.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en portugués durante el desarrollo con un modelo ligero (0,3 GB) y licencia Apache 2.0.
- Audiolibros y podcasts automatizados: puede emplearse para narrar texto largo en portugués brasileño en pipelines por lotes, siempre que se valide la calidad de la prosodia.
- Pruebas de integración en pipelines de TTS: sirve como componente de referencia para evaluar la librería phoonnx y comparar con otras voces Rapido del mismo catálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB en fp32, por lo que el modelo es de tamaño reducido, pero no se detalla el consumo exacto en memoria.
- GPU recomendadas: no disponible. Al ejecutarse sobre ONNX Runtime, puede funcionar en CPU y en GPU compatibles con ONNX Runtime, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del repositorio, aunque no se confirma qué tarjetas concretas son compatibles.
- Opciones de despliegue: librería phoonnx (Python y OVOS) sobre ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/rapido-pt_br-edwixx-graphemes` | Rapido | `pt-BR` | ONNX | Apache 2.0 | Hugging Face, vía phoonnx |
| `edwixx/rapido-tts` (upstream) | Rapido | `pt-BR` | no disponible | Apache 2.0 | Hugging Face |
| Otras voces de la colección Rapido de Phoonnx | Rapido | variable | ONNX | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El índice de voces de phoonnx no lista una voz para este modelo, lo que puede dificultar su uso directo a través de la interfaz de voces de la librería.
- Solo soporta portugués de Brasil (`pt-BR`); no se ha validado su comportamiento en otras variantes del portugués.
- No se documentan sesgos conocidos, pero al ser un modelo TTS entrenado con datos no especificados, puede reproducir sesgos prosódicos o de pronunciación presentes en el corpus original.
- Riesgo de errores de pronunciación en palabras ambiguas, siglas, números o nombres propios, especialmente al operar a nivel de grafemas sin fonemización explícita.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `edwixx/rapido-tts` y de los datos de entrenamiento originales.
- No se documentan límites de longitud de texto de entrada ni comportamiento con textos muy largos.
- La adopción es muy baja (23 descargas, 0 likes), por lo que no hay evidencia comunitaria sobre su robustez en producción.
- No hay información sobre latencia, calidad de audio (muestreo, bitrate) ni métricas subjetivas (MOS).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/rapido-pt_br-edwixx-graphemes)
- [Modelo upstream edwixx/rapido-tts](https://huggingface.co/edwixx/rapido-tts)
- [Librería phoonnx](https://github.com/TigreGotico/phoonnx)
- [scriptconv](https://github.com/TigreGotico/scriptconv)
- [Colección Rapido de Phoonnx](https://huggingface.co/collections/Phoonnx/rapido-6af8ecbfc1860f5bc2c6c670)

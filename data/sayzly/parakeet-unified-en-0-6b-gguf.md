# sayzly/parakeet-unified-en-0.6b-gguf

## Resumen

`sayzly/parakeet-unified-en-0.6b-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-unified-en-0.6b`, publicada por el usuario `sayzly` como artefacto de distribución para su aplicación. No se trata de un modelo nuevo ni de un ajuste fino: es una cuantización del modelo original de NVIDIA, empaquetada en un único fichero `parakeet-unified-en-0.6b-Q8_0.gguf` que el cliente Sayzly descarga en tiempo de ejecución.

El modelo subyacente es un sistema speech-to-text en inglés de aproximadamente 618 millones de parámetros (618.309.121 según los pesos en safetensors del repositorio base), pensado para transcripción de audio a texto con una relación calidad/tamaño adecuada para despliegue en local o en el borde. La relevancia de esta ficha reside en que ofrece una vía de ejecución en formato GGUF, lo que facilita su integración en herramientas compatibles con dicho contenedor sin depender de los pesos originales de NVIDIA.

La información publicada por el autor es mínima: la model card se limita a indicar el origen del modelo, la licencia heredada (`nvidia-open-model-license`) y el nombre del fichero cuantizado. No se documentan detalles de arquitectura, datos de entrenamiento, idiomas ni benchmarks en esta conversión, por lo que muchos campos de esta ficha se marcan como no disponibles y deben consultarse en el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NVIDIA Parakeet Unified, ASR) |
| Parametros totales | 618.309.121 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (fichero `parakeet-unified-en-0.6b-Q8_0.gguf`) |
| Idiomas soportados | no disponible (el nombre del modelo indica ingles: `-en-`) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (repo de 0,7 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO u otras) en la documentación proporcionada. El modelo base pertenece a la familia Parakeet de NVIDIA, orientada a reconocimiento automático del habla, y el identificador `unified-en` sugiere una variante unificada para inglés, pero este extremo no se detalla en la model card de la conversión.

La contribución de este repositorio es exclusivamente de empaquetado: se ofrece una cuantización Q8_0 en GGUF del modelo original. No se documentan innovaciones técnicas propias, cambios en el grafo de inferencia ni optimizaciones específicas más allá de la cuantización a 8 bits.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) en inglés, según el pipeline declarado `automatic-speech-recognition` y el sufijo `-en-` del identificador.
- Transcripción de audio a texto mediante un fichero GGUF cuantizado en Q8_0.
- Integración en la aplicación Sayzly como artefacto descargable en tiempo de ejecución.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.
- Capacidades multilingües: no disponibles; el identificador apunta a inglés únicamente.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte audio en inglés a texto con un tamaño de 0,6B parámetros, adecuado para ejecución en local sin depender de servicios en la nube.
- Subtitulado de vídeo y podcasts en inglés: al ser un modelo ASR compacto, puede procesar lotes de audio en pipelines de postproducción con requisitos de memoria moderados.
- Dictado por voz en aplicaciones de escritorio: la cuantización Q8_0 y el formato GGUF permiten embeberlo en clientes nativos que ya soportan este contenedor.
- Preprocesado de datos para entrenamiento de LLM: transcripción masiva de corpus de audio en inglés para generar pares audio-texto.
- Asistentes de accesibilidad: conversión de voz a texto en tiempo real para personas con dificultades auditivas, siempre que la latencia del runtime GGUF sea aceptable.
- Distribución dentro de la app Sayzly: descarga del fichero GGUF como recurso de transcripción del cliente, con la ventaja de un único artefacto de 0,7 GB.
- Investigación en ASR ligero: punto de partida para comparar cuantizaciones Q8_0 frente a los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 618 millones de parámetros en Q8_0, el fichero pesa aproximadamente 0,7 GB, por lo que la huella de pesos ronda esa cifra más el overhead del runtime.
- GPU recomendadas: no disponibles; por tamaño, el modelo es apto para GPUs de consumo, pero no se documenta compatibilidad concreta con A100, H100, RTX 4090 u otras.
- GPU de consumo: previsiblemente cabe en tarjetas con 4 GB o más de VRAM, aunque este dato no está confirmado en la documentación.
- Opciones de despliegue: el formato GGUF sugiere runtimes compatibles con dicho contenedor (por ejemplo, llama.cpp u Ollama), si bien no se especifica en la model card qué runtime exacto utiliza Sayzly ni si la arquitectura ASR está soportada por las herramientas habituales de LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/parakeet-unified-en-0.6b-gguf | 618.309.121 | no disponible | GGUF (Q8_0) | nvidia-open-model-license | Hugging Face |
| nvidia/parakeet-unified-en-0.6b | 618.309.121 | no disponible | safetensors | nvidia-open-model-license | Hugging Face |
| Otras variantes Parakeet de NVIDIA | no disponible | no disponible | no disponible | nvidia-open-model-license | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas; el identificador sugiere uso exclusivo en inglés.
- Al ser una conversión no oficial del modelo base, no hay garantía de paridad numérica con los pesos originales en safetensors.
- La licencia `nvidia-open-model-license` impone condiciones específicas para uso comercial; es necesario revisar el texto completo y el fichero NOTICE antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la calidad de la cuantización.
- No se especifica qué runtime GGUF consume el fichero; la compatibilidad con herramientas estándar de LLM no está confirmada para una arquitectura ASR.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta planificar el despliegue.
- La fecha de creación del repositorio (2026-11-19) es posterior a la fecha habitual de consulta; conviene verificar su vigencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/parakeet-unified-en-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/

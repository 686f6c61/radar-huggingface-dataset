# sarath-om/sarath_om-1.5

## Resumen

Sarath OM 1.5 es un modelo publicado en Hugging Face bajo el identificador `sarath-om/sarath_om-1.5` y distribuido principalmente a través del runtime Ollama. Según los metadatos del repositorio, se trata de un modelo multimodal (texto e imagen) con soporte declarado de tool calling y modo de razonamiento ("thinking"), construido sobre una arquitectura de la familia Qwen2 según la etiqueta `qwen2` del repositorio. El recuento real de parámetros a partir de los pesos en safetensors es de 1.543.714.304 (aproximadamente 1,54 mil millones), lo que lo sitúa en la categoría de modelos pequeños.

La relevancia de este modelo es limitada desde el punto de vista técnico: la propia model card aclara explícitamente que el proyecto Sarath OM es una plataforma de integración de software y no un proyecto de desarrollo o entrenamiento de modelos fundacionales. El autor indica que la arquitectura, el origen de los pesos y la procedencia del entrenamiento deben establecerse a partir de la configuración publicada y de la documentación upstream, y no se aportan datos verificados sobre el modelo base, el dataset de entrenamiento ni evaluaciones.

Por tanto, esta ficha debe leerse con cautela: los datos disponibles son los del repositorio (tamaño de pesos, número de parámetros, tags) y las capacidades declaradas en el listado de Ollama (visión, herramientas, thinking, ventana de 256K), sin que exista documentación técnica independiente que las respalde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (tag del repositorio: `qwen2`; la model card indica "not independently documented here") |
| Parámetros totales | 1.543.714.304 (según safetensors) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (declarado en el listado de Ollama; no verificado en la configuración publicada) |
| Tipos de cuantización | No disponible (la model card remite a la configuración publicada; el listado de Ollama muestra un tamaño de modelo de ~3,3 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "verify model and upstream distribution terms") |
| Formato de pesos | safetensors (tag del repositorio); distribución adicional vía Ollama |
| Tamaño del repositorio | 3,1 GB |
| Modalidades de entrada | Texto e imagen |
| Variantes | `latest` (local) y `cloud` (Ollama Cloud) |

## Arquitectura y entrenamiento

No se dispone de información verificada sobre la arquitectura interna. El repositorio incluye la etiqueta `qwen2`, lo que sugiere que los pesos derivan de la familia Qwen2 de Alibaba, pero la model card no confirma el modelo base ni el proceso de adaptación. El recuento de parámetros (≈1,54 B) es coherente con un transformer denso de tamaño pequeño, aunque no se documenta si se trata de un modelo denso o de una variante con atención lineal u otras modificaciones.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni la existencia de fases de alineación como RLHF o DPO. La model card afirma explícitamente que el proyecto no entrena ni ajusta modelos fundacionales propios, sino que integra modelos externos en flujos de aplicación, por lo que la procedencia de los pesos y del entrenamiento queda sin aclarar en la documentación publicada.

## Capacidades

- Generación de texto: capacidad básica declarada por el listado de Ollama, sin detalles sobre calidad o dominio.
- Entrada de imágenes y visión: el listado de Ollama marca "Image input" y "Vision" como capacidades publicadas.
- Tool calling: soporte declarado de llamadas a herramientas, aunque sin documentación sobre el formato exacto (JSON schema, funciones nativas, etc.).
- Modo thinking: capacidad de razonamiento explícito declarada en el listado, sin detalles sobre cómo se activa o si es un modo separado.
- Contexto largo: ventana de 256K tokens mostrada en el listado, no verificada en la configuración del modelo.
- Multilingüismo: no disponible; no se especifican idiomas soportados.
- Capacidades de agente multi-paso: no documentadas explícitamente, aunque el soporte de tool calling y thinking podría habilitarlas.

## Casos de uso

- Asistentes locales en entornos con recursos limitados: con ~1,54 B de parámetros y un tamaño de pesos de ~3,1 GB en safetensors, el modelo puede ejecutarse en equipos de consumo mediante Ollama, lo que lo hace adecuado para prototipos de asistente conversacional en local.
- Procesamiento de documentos con imágenes: la entrada multimodal permitiría extraer información de capturas, formularios o diagramas simples, siempre que la capacidad de visión se confirme en la práctica.
- Integración en aplicaciones vía API HTTP de Ollama: el endpoint `/api/chat` permite incorporar el modelo en servicios backend con Python, JavaScript o cURL, útil para demos y herramientas internas.
- Automatización con herramientas: el soporte declarado de tool calling permitiría conectar el modelo a funciones externas (consultas a bases de datos, APIs) en flujos de agente simples, aunque sin garantías documentadas de robustez.
- Razonamiento con contexto largo en local: si la ventana de 256K se confirma, podría emplearse para resumir o consultar documentos extensos, aunque el coste de memoria en un modelo de 1,5 B con contexto largo sería considerable.
- Despliegue en la nube de Ollama: la variante `cloud` permite probar el modelo sin hardware local, útil para evaluación rápida o para integraciones donde la latencia de red sea aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación verificados ("No verified results published in this card").

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~1,54 B en precisión FP16 ocuparía aproximadamente 3,1 GB solo en pesos; en cuantizaciones de 4 bits podría reducirse a ~1 GB, pero no se confirma qué cuantización distribuye Ollama.
- GPU recomendadas: no documentadas. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon con memoria unificada suficiente.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de pesos (~3,1 GB), aunque la ventana de 256K incrementaría notablemente el uso de memoria KV cache.
- Opciones de despliegue: Ollama (local y cloud) es el método documentado. No se mencionan vLLM, llama.cpp, TGI ni otros runtimes, aunque al estar basado en safetensors y con tag `qwen2` podría ser compatible con llama.cpp si se generan los GGUF correspondientes (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones confirmadas (licencia, idiomas, arquitectura exacta) que permitan una comparación rigurosa con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sarath OM 1.5 | ~1,54 B | 256K (declarado) | No disponible | Hugging Face + Ollama |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Procedencia no verificada: la model card no confirma el modelo base ni el proceso de entrenamiento; el tag `qwen2` sugiere un origen en la familia Qwen2, pero no está documentado oficialmente.
- Licencia indefinida: no se especifica licencia en el repositorio, lo que impide evaluar el uso comercial. La model card remite a verificar los términos del modelo y de la distribución upstream.
- Capacidades declaradas sin verificación: visión, tool calling, thinking y contexto de 256K aparecen en el listado de Ollama, pero no hay documentación técnica ni benchmarks que las respalden.
- Riesgo de alucinación: no cuantificado; al ser un modelo pequeño y sin evaluación publicada, el riesgo en tareas de razonamiento complejo o factualidad es alto.
- Idiomas no especificados: no se documenta el soporte multilingüe, por lo que el rendimiento en castellano es incierto.
- Contexto largo no confirmado: la ventana de 256K podría no estar operativa en todas las variantes o configuraciones; además, el coste de memoria en contexto largo sería significativo para un modelo de este tamaño.
- Uso en producción desaconsejado sin evaluación previa: la ausencia de benchmarks, licencia clara y documentación de arquitectura hace necesario validar el modelo en el caso de uso concreto antes de desplegarlo.
- Variante cloud: el procesamiento en la nube implica enviar datos a un servicio externo; revisar los términos de privacidad de Ollama Cloud antes de usar información sensible.

## Enlaces

- Hugging Face: https://huggingface.co/sarath-om/sarath_om-1.5
- Ollama: https://ollama.com/sarath-om/sarath_om-1.5
- Sitio web oficial: https://sarath.openflip.in/
- GitHub: https://github.com/Sarath-Om
- Descarga de Ollama: https://ollama.com/download

# ggml-org/gpt-oss-120b-GGUF

## Resumen

gpt-oss-120b-GGUF es la conversión a formato GGUF del modelo gpt-oss-120b de OpenAI, publicada por el colectivo ggml-org (responsable del ecosistema llama.cpp). Se trata de una versión cuantizada y empaquetada para inferencia local eficiente, pensada para su uso con llama.cpp, Ollama y herramientas compatibles, no de un modelo entrenado de cero por ggml-org. El modelo base gpt-oss-120b es un transformer de tipo Mixture-of-Experts (MoE) con 116.829.156.672 parámetros totales, liberado por OpenAI bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que permite ejecutar en hardware propio un modelo de escala ~120B con pesos abiertos y licencia permisiva, algo poco habitual en modelos de este tamaño. La conversión GGUF facilita el despliegue en GPU de consumo mediante cuantizaciones agresivas, a costa de cierta pérdida de precisión respecto a los pesos originales en safetensors.

No se dispone de información detallada en la model card sobre composición del dataset de entrenamiento, número de tokens, idiomas soportados ni resultados de benchmarks; esos datos deben consultarse en la ficha del modelo base de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) según modelo base; detalles finos no disponibles en la información proporcionada |
| Parametros totales | 116.829.156.672 (~116,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (variantes concretas no detalladas en la información proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 192,6 GB); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base gpt-oss-120b es un transformer con arquitectura Mixture-of-Experts, según se desprende de su denominación y tamaño (116,8 B parámetros totales). La conversión a GGUF realizada por ggml-org no modifica la arquitectura ni reentrena el modelo: únicamente transforma los pesos a un formato de serialización optimizado para llama.cpp, aplicando cuantización para reducir el tamaño y el coste de memoria.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card de la conversión remite a los modelos fuente: openai/gpt-oss-120b y nvidia/gpt-oss-120b-Eagle3-v3, este último presumiblemente relacionado con decodificación especulativa tipo Eagle3, aunque su rol exacto no se detalla.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation; tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integración con APIs compatibles con OpenAI.
- Ejecución local mediante llama.cpp, la app Llama o el comando `llama serve -hf ggml-org/gpt-oss-120b-GGUF`.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponibles en la información proporcionada (deben verificarse en la ficha del modelo base openai/gpt-oss-120b).
- Soporte multilingüe: no disponible.

## Casos de uso

- Despliegue local de un modelo de ~120B en infraestructura propia: gracias a la cuantización GGUF, es posible ejecutar el modelo en servidores con varias GPU o en estaciones de trabajo de gama alta, evitando depender de APIs externas y manteniendo los datos en local.
- Prototipado e investigación con licencia permisiva: la licencia Apache 2.0 permite usar, modificar y redistribuir el modelo en entornos académicos y comerciales sin las restricciones de otras licencias de pesos abiertos.
- Integración en pipelines con llama.cpp: el formato GGUF y el comando `llama serve` facilitan montar un servidor de inferencia compatible con endpoints para pruebas de integración y desarrollo de aplicaciones.
- Evaluación comparativa de cuantizaciones: al existir múltiples variantes GGUF, el repo sirve para medir el impacto de la cuantización en calidad y latencia antes de fijar una configuración de producción.
- Generación de texto conversacional en entornos con requisitos de soberanía de datos: sectores como sanidad, legal o administración pública pueden desplegar el modelo on-premise sin enviar información sensible a terceros.
- Base para experimentos de decodificación especulativa: la referencia al modelo nvidia/gpt-oss-120b-Eagle3-v3 sugiere que el ecosistema permite combinar esta conversión con cabezas de draft para acelerar la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión GGUF no incluye métricas de calidad, latencia ni throughput, y los datos del modelo base deben consultarse en openai/gpt-oss-120b.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el repo completo ocupa 192,6 GB, por lo que las variantes de mayor calidad requieren múltiples GPU o memoria unificada; las cuantizaciones más agresivas reducen sustancialmente este requisito, pero no se detallan cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo, se intuye la necesidad de configuraciones multi-GPU (por ejemplo, A100/H100) o estaciones con gran cantidad de VRAM.
- ¿Cabe en GPU de consumo? No disponible con certeza; dependerá de la cuantización elegida y del uso de offloading a RAM/CPU.
- Opciones de despliegue: llama.cpp, la app Llama (`https://llama.app`), el comando `llama serve -hf ggml-org/gpt-oss-120b-GGUF` y, previsiblemente, Ollama y otros frontends basados en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ggml-org/gpt-oss-120b-GGUF | ~116,8 B (MoE) | no disponible | Apache 2.0 | GGUF | Conversión cuantizada para llama.cpp |
| openai/gpt-oss-120b | ~116,8 B (MoE) | no disponible | Apache 2.0 | safetensors | Modelo base original de OpenAI |
| nvidia/gpt-oss-120b-Eagle3-v3 | no disponible | no disponible | no disponible | no disponible | Modelo relacionado citado como fuente, presumiblemente para decodificación especulativa |

No se dispone de información suficiente para comparar con alternativas de otros autores (por ejemplo, otros modelos MoE de escala similar); dato no disponible.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión respecto a los pesos originales en safetensors; la magnitud de la degradación no está documentada en la información proporcionada.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas en la model card de la conversión; deben consultarse en la ficha del modelo base.
- El contexto máximo soportado no está indicado, lo que impide planificar casos de uso con ventanas largas sin verificar antes en el modelo base.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene revisar las condiciones del modelo base openai/gpt-oss-120b por si hubiera cláusulas adicionales de uso aceptable.
- El tamaño del repo (192,6 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- La conversión es automática (mediante ggml-org/convert); no hay garantía explícita de validación exhaustiva de cada variante cuantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/gpt-oss-120b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Modelo relacionado (Eagle3): https://huggingface.co/nvidia/gpt-oss-120b-Eagle3-v3
- Herramienta de conversión: https://github.com/ggml-org/convert
- App Llama: https://llama.app

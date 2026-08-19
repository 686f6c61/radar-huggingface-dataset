# gnani/gnani-evon-v3.3-30B-A3B

## Resumen

gnani-evon-v3.3-30B-A3B es un modelo de lenguaje de gran tamaño desarrollado por la organización gnani, diseñado específicamente para ofrecer capacidades de razonamiento, tool calling y conversación en inglés y un amplio conjunto de idiomas índicos (hindi, bengalí, telugu, tamil, maratí, guyaratí, canarés, malayalam, punyabí y oriya). Se trata de un modelo de arquitectura MoE (mezcla de expertos) con aproximadamente 31,75 mil millones de parámetros totales y unos 3 mil millones de parámetros activos por token, lo que lo sitúa en una categoría eficiente para su tamaño.

El modelo incorpora etiquetas que sugieren una arquitectura híbrida basada en Nemotron-H y capas Mamba, junto con soporte para contextos largos y generación de texto. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque el acceso al repositorio está restringido y requiere aceptar condiciones previas en HuggingFace. Es relevante ahora porque cubre una necesidad creciente de modelos multilingües de alta calidad para el subcontinente indio, una región con demanda de asistentes conversacionales y herramientas de automatización en lenguas locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida Nemotron-H + Mamba (según etiquetas) |
| Parametros totales | 31.749.972.288 (~31,75 B) |
| Parametros activos | ~3 B (inferido del nombre A3B, no confirmado oficialmente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, bn, te, ta, mr, gu, kn, ml, pa, or |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina componentes de la familia Nemotron-H con capas Mamba, lo que sugiere un diseño híbrido que mezcla atención tradicional con mecanismos de espacio de estado para mejorar la eficiencia en contextos largos. La configuración MoE activa aproximadamente 3 B de los 31,75 B parámetros por token, reduciendo el coste computacional en inferencia. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. Las etiquetas indican soporte para razonamiento, tool calling y conversación, pero los detalles específicos del proceso de entrenamiento no han sido publicados.

## Capacidades

- Generación de texto en inglés y diez idiomas índicos principales.
- Razonamiento multi-step y capacidad de encadenamiento lógico.
- Tool calling / function calling para integración con APIs y agentes.
- Soporte para agentes y flujos de trabajo autónomos.
- Conversación multi-turno con memoria de contexto (gracias a la arquitectura Mamba, se espera buen manejo de secuencias largas, aunque no se ha confirmado la longitud exacta).
- Multilingüismo orientado a la India: hindi, bengalí, telugu, tamil, maratí, guyaratí, canarés, malayalam, punyabí y oriya.
- Compatible con el ecosistema Transformers y endpoints estándar.

## Casos de uso

- Atención al cliente automatizada en idiomas índicos: el modelo puede gestionar conversaciones multi-turno en hindi, telugu o tamil, reduciendo la necesidad de agentes humanos en sectores como banca, telecomunicaciones o comercio electrónico en la India.
- Asistentes virtuales para administración pública: dado su soporte multilingüe, puede desplegarse en portales gubernamentales para responder consultas en lenguas regionales, mejorando la accesibilidad.
- Generación de contenido localizado: creación de artículos, resúmenes o descripciones de productos en varios idiomas índicos a partir de un prompt en inglés, útil para editoriales y plataformas de ecommerce.
- Automatización de tickets y clasificación de solicitudes: con tool calling, puede integrarse en sistemas de ticketing para categorizar peticiones, extraer datos y escalar casos complejos a humanos.
- Desarrollo de agentes de razonamiento para análisis de documentos: su capacidad de razonamiento multi-step permite procesar informes largos y extraer conclusiones en contextos empresariales o legales.
- Traducción y transliteración asistida: aunque no es un modelo de traducción puro, puede ayudar a generar versiones en diferentes idiomas índicos a partir de texto en inglés o hindi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: con 31,75 B parámetros en FP16, se necesitan aproximadamente 63,5 GB de memoria (coincide con el tamaño del repositorio). Con cuantización a 8 bits (~31,75 GB) o 4 bits (~16 GB) podría ejecutarse en GPUs de consumo, pero no se han publicado archivos cuantizados oficiales.
- GPU recomendadas: para FP16, una NVIDIA A100 80 GB o H100 80 GB; para cuantización 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) sería suficiente.
- Opciones de despliegue: compatible con Transformers, por lo que puede servirse con vLLM, TGI o llama.cpp si se convierten los pesos a GGUF. No se han publicado versiones GGUF ni Ollama.
- Latencia y throughput: no disponibles; al ser MoE con solo 3 B activos, se espera una latencia menor que un modelo denso de 30 B, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría (MoE de ~30 B con enfoque multilingüe índico). Alternativas como Qwen2.5-32B o Mixtral 8x7B tienen características diferentes (idiomas, licencias y arquitectura) y no se han encontrado datos de rendimiento de gnani-evon para contrastar. Se recomienda consultar el repositorio de HuggingFace para futuras actualizaciones.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones en HuggingFace antes de su descarga, lo que puede limitar su adopción en entornos automatizados.
- Sin información sobre sesgos: no se han publicado evaluaciones de sesgos de género, raza o religión, un aspecto crítico para un modelo orientado a la India con gran diversidad cultural.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Idiomas limitados: aunque cubre diez idiomas índicos, no incluye otros como el asamés o el sindhi, ni lenguas del sur de Asia fuera de la India.
- Falta de documentación técnica: no se han publicado detalles sobre el dataset de entrenamiento, el proceso de alineación ni la longitud exacta de contexto, lo que dificulta evaluar su idoneidad para producción.
- Sin benchmarks publicados: no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gnani/gnani-evon-v3.3-30B-A3B

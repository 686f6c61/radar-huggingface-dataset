# skim19/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

El modelo `skim19/kanana-1.5-8b-instruct-2505-Safe-DPO` es un ajuste fino (fine-tune) del modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado originalmente por Kakao Corp. La variante de `skim19` incorpora un entrenamiento adicional mediante DPO (Direct Preference Optimization) orientado a la seguridad y la alineación de respuestas, como sugiere el sufijo "Safe-DPO". El modelo base pertenece a la familia Kanana 1.5, que destaca por mejoras sustanciales en codificación, matemáticas y llamada a funciones respecto a la versión anterior.

Con aproximadamente 8.030 millones de parámetros, se trata de un modelo denso de tamaño medio, basado en una arquitectura transformer estándar compatible con la librería `transformers` de Hugging Face. El modelo base soporta una ventana de contexto nativa de 32.768 tokens, extensible hasta 128.000 tokens. La información pública sobre el fine-tune de `skim19` es muy limitada: la model card es una plantilla automática sin datos específicos, y no se han publicado detalles sobre el dataset de entrenamiento, los hiperparámetros ni los resultados de evaluación de esta variante concreta.

La relevancia de este modelo radica en que combina las capacidades mejoradas de Kanana 1.5 (especialmente en tareas de programación y razonamiento matemático) con un proceso de alineación adicional para reducir respuestas dañinas o inseguras. Sin embargo, la falta de documentación y de benchmarks publicados para esta variante limita su evaluación objetiva y su adopción en entornos de producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (estilo Llama, segun el tag "llama") |
| Parametros totales | 8.030.285.824 (aproximadamente 8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativo, extensible a 128.000 (dato del modelo base; no se confirma para el fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base es bilingue coreano-ingles, pero no se confirma para esta variante) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base `kanana-1.5-8b-instruct-2505` de Kakao Corp. emplea una arquitectura transformer densa, con una configuración similar a la familia Llama (atención por ventanas deslizantes, normalización RMSNorm, etc.), aunque los detalles exactos de la configuración (número de capas, cabezas de atención, dimensiones ocultas) no se han publicado en la información disponible. El modelo fue entrenado con un enfoque bilingüe (coreano e inglés) y posteriormente ajustado con instrucciones para mejorar el rendimiento en codificación, matemáticas y llamada a funciones.

La variante `Safe-DPO` de `skim19` añade una etapa de alineación mediante DPO, una técnica que optimiza directamente las preferencias humanas comparando pares de respuestas (preferida vs. no preferida) para reducir comportamientos inseguros o no deseados. No se dispone de información sobre el dataset utilizado para este DPO, el número de pasos de entrenamiento, ni los hiperparámetros empleados. Tampoco se especifica si se realizó algún ajuste adicional de la arquitectura o del tokenizador respecto al modelo base.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para tareas de instrucción y diálogo, con soporte para conversaciones multi-turno.
- Codificación: el modelo base presenta mejoras significativas en generación y comprensión de código, según la documentación de Kakao.
- Razonamiento matemático: capacidades reforzadas en problemas aritméticos y lógicos, también heredadas del modelo base.
- Llamada a funciones (function calling): soporte para invocar herramientas externas de forma estructurada, útil en agentes y pipelines automatizados.
- Capacidades multilingües: el modelo base es bilingüe (coreano e inglés), aunque no se confirma si el fine-tune mantiene ambas lenguas.
- Alineación de seguridad: el proceso DPO busca reducir respuestas dañinas, sesgadas o inapropiadas, aunque no se han publicado métricas que lo verifiquen.

## Casos de uso

- Asistentes de soporte técnico en coreano e inglés: el modelo puede gestionar consultas multi-turno con contexto largo gracias a su ventana de 32K tokens, respondiendo de forma segura y alineada gracias al DPO.
- Generación de código en entornos de desarrollo: su capacidad de function calling permite integrarlo en IDEs o pipelines de CI/CD para autocompletar, revisar o documentar código.
- Tutoría de matemáticas y ciencias: puede explicar problemas paso a paso, aprovechando su entrenamiento en razonamiento matemático.
- Automatización de tareas empresariales: mediante tool calling, puede interactuar con APIs, bases de datos o sistemas de gestión para ejecutar tareas como consultas, resúmenes o generación de informes.
- Moderación de contenido: su entrenamiento de seguridad podría ser útil para filtrar o reformular contenido potencialmente dañino en plataformas de comunicación.
- Prototipado rápido de chatbots: al ser compatible con `transformers` y `text-generation-inference`, se puede desplegar en entornos de desarrollo para validar flujos conversacionales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la variante `skim19/kanana-1.5-8b-instruct-2505-Safe-DPO`. El modelo base de Kakao ha sido evaluado en tareas de codificación, matemáticas y function calling, pero los números concretos no están disponibles en la información recopilada. Se recomienda consultar la documentación oficial de Kanana 1.5 para obtener datos comparativos del modelo original y, en cualquier caso, realizar una evaluación propia antes de usar esta variante en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parámetros en fp16, el modelo requiere aproximadamente 16 GB de VRAM solo para los pesos. Con cuantización de 8 bits, se reduce a unos 8 GB; con 4 bits, a unos 4-5 GB.
- GPU recomendadas: para fp16, una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10, A100 40GB). Para cuantización 4-bit, una RTX 3060 12GB o superior podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización (GGUF o bitsandbytes). En fp16, requiere tarjetas de gama alta.
- Opciones de despliegue: compatible con `transformers`, `vLLM`, `TGI` (text-generation-inference), `llama.cpp` (si se convierten los pesos a GGUF) y `Ollama`.
- Latencia y throughput: no se han publicado datos específicos para esta variante. Como referencia, un modelo de 8B en una RTX 4090 con cuantización 4-bit puede generar entre 20 y 40 tokens por segundo, pero depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| skim19/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03B | 32K (ext. 128K) | no disponible | no disponible | Fine-tune con DPO de seguridad |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8,03B | 32K (ext. 128K) | coreano, ingles | no disponible | Modelo base de Kakao |
| Llama 3.1 8B Instruct | 8,03B | 128K | multilingue | Llama 3.1 (uso comercial permitido) | Referencia comun en la categoria |
| Qwen 2.5 7B Instruct | 7,6B | 32K (ext. 128K) | multilingue | Apache 2.0 | Alternativa con licencia permisiva |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos para la variante de `skim19`. La principal diferencia frente a alternativas como Llama 3.1 o Qwen 2.5 es la naturaleza bilingüe (coreano-inglés) del modelo base de Kakao y el ajuste de seguridad adicional, aunque la falta de licencia clara y de documentación son desventajas importantes para uso comercial.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos ni de fiabilidad factual para esta variante. Como todo modelo de lenguaje, puede generar información incorrecta o inventada.
- Limitaciones de contexto: aunque el modelo base soporta 32K tokens, no se confirma que el fine-tune mantenga esta capacidad. Es posible que el DPO reduzca la longitud efectiva de contexto.
- Idiomas: no se especifica si el fine-tune conserva el bilingüismo coreano-inglés del modelo base. En caso de duda, se recomienda probar con textos en ambos idiomas.
- Licencia: la licencia no está disponible en la página de Hugging Face, lo que impide determinar si es apto para uso comercial o si tiene restricciones. Esto es un riesgo legal significativo para cualquier despliegue en producción.
- Documentación insuficiente: la model card es una plantilla automática sin información sobre el proceso de entrenamiento, los datos utilizados ni los criterios de evaluación. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo de sobreajuste a la seguridad: el DPO puede haber reducido la utilidad general del modelo en tareas creativas o de código si el dataset de preferencias estaba sesgado hacia respuestas conservadoras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skim19/kanana-1.5-8b-instruct-2505-Safe-DPO
- Modelo base de Kakao: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio GitHub de Kanana: https://github.com/kakao/kanana
- Ficha del modelo en AIBase: https://model.aibase.com/models/details/1927649989316841472
- Ficha del modelo en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/kanana-1.5-8b-instruct-2505-kakaocorp

# mistralai/Mistral-Large-Instruct-2411

## Resumen

Mistral-Large-Instruct-2411 es un modelo de lenguaje de gran escala desarrollado por Mistral AI, publicado en noviembre de 2024 como actualización de su familia Large. Con 122.610.069.504 parámetros totales (aproximadamente 123B), se posiciona en la gama alta de los modelos abiertos de pesos abiertos de la compañía francesa, por encima de las variantes Small y Medium y por debajo de los modelos frontier propietarios. Está diseñado para tareas de razonamiento complejo, generación de código, matemáticas y conversación multilingüe.

El modelo se distribuye bajo la Mistral AI Research License (MRL-0.1), una licencia que restringe el uso a fines de investigación y requiere solicitar una licencia comercial a Mistral AI para cualquier uso productivo. Esta restricción es determinante para evaluar su adopción en entornos empresariales. Los pesos están en formato safetensors y la librería recomendada es vLLM, lo que facilita el despliegue en infraestructura de inferencia de alto rendimiento.

Su relevancia actual radica en ser una de las pocas opciones de ~123B parámetros con soporte multilingüe amplio (diez idiomas declarados) y pesos abiertos, aunque la licencia de investigación limita seriamente su uso comercial sin acuerdo previo. La ficha que sigue recoge únicamente los datos disponibles en la información proporcionada; cualquier parámetro no confirmado se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, según la familia Mistral; no confirmado en la información) |
| Parámetros totales | 122.610.069.504 (~123B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | Mistral AI Research License (MRL-0.1), uso solo para investigación |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna (tipo de transformer, número de capas, dimensiones ocultas, mecanismo de atención, uso de MoE o de atención lineal). El dato objetivo disponible es el recuento total de parámetros a partir de los tensores safetensors: 122.610.069.504 parámetros, lo que sitúa al modelo en la categoría de ~123B densos (o, al menos, sin indicación de parámetros activos reducidos). La librería declarada es vLLM, lo que sugiere compatibilidad con motores de inferencia optimizados para transformers de gran tamaño.

Tampoco se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. La model card únicamente aporta el texto de la licencia y los metadatos de idioma; no incluye sección técnica de entrenamiento. Cualquier afirmación sobre innovaciones como decodificación especulativa, atención lineal o mezcla de expertos sería especulativa y no se recoge aquí.

## Capacidades

- Generación de texto y conversación multi-turno en diez idiomas: inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano.
- Razonamiento y resolución de problemas, orientado por el sufijo "Instruct" de la nomenclatura, que indica ajuste para seguir instrucciones.
- Generación de código y tareas de programación (capacidad esperable en la familia Large de Mistral, aunque no se detalla en la información disponible).
- Razonamiento matemático (no se aportan benchmarks que lo cuantifiquen en la información disponible).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el modelo se distribuye solo con pesos de lenguaje.
- Modo "thinking" o razonamiento extendido: no disponible en la información.

## Casos de uso

- Investigación académica en procesamiento del lenguaje natural: el modelo puede emplearse como base para experimentos de evaluación, análisis de sesgos o estudios de alineación, ya que la licencia MRL permite explícitamente el uso para fines de investigación.
- Generación y revisión de código en entornos de I+D: con ~123B parámetros y ajuste instructivo, es adecuado para tareas de completado, refactorización y explicación de código dentro de proyectos de investigación, siempre que no se despliegue en producción comercial sin licencia adicional.
- Traducción y procesamiento multilingüe: al cubrir diez idiomas, puede usarse para traducción, resumen y análisis de documentos en entornos de investigación comparada entre lenguas europeas y asiáticas.
- Asistencia conversacional para prototipos internos: su naturaleza instructiva permite construir demos de chatbots multi-turno para validar hipótesis de producto antes de migrar a un modelo con licencia comercial.
- Análisis de documentos largos: aunque la longitud de contexto no está confirmada, un modelo de esta escala suele emplearse para resumen y extracción de información en corpus extensos; conviene verificar la ventana real antes de diseñar el pipeline.
- Evaluación comparativa de modelos abiertos: sirve como referencia de la gama ~123B en estudios de benchmarking frente a otros modelos de pesos abiertos, gracias a la disponibilidad de safetensors y compatibilidad con vLLM.
- Fine-tuning para investigación: la licencia permite crear derivados para investigación, por lo que puede ajustarse con datasets específicos de dominio y publicar los resultados bajo las condiciones de la MRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 245 GB solo para pesos (2 bytes por parámetro × 122,6B), más overhead de activaciones y caché KV.
- Cuantización a 8 bits: en torno a 123 GB de pesos, lo que requiere múltiples GPU de 80 GB (por ejemplo, 2× A100/H100 80GB) o una H200 de 141 GB.
- Cuantización a 4 bits: aproximadamente 61 GB de pesos, viable en una sola GPU de 80 GB (A100, H100) o en configuraciones consumer de gama alta con suficiente VRAM agregada.
- GPU recomendadas: A100 80GB, H100 80GB, H200 141GB en configuraciones multi-GPU para precisión completa; RTX 4090 (24 GB) solo es viable con cuantizaciones agresivas y offloading, con latencia elevada.
- Despliegue: vLLM es la librería declarada por el autor; también cabría esperar soporte en TGI y llama.cpp/GGUF si la comunidad publica conversiones, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral-Large-Instruct-2411 | ~123B | no disponible | MRL (solo investigación) | Pesos abiertos en HF |
| Mistral Medium (referencia de familia) | no disponible | no disponible | no disponible | API / no confirmado |
| Modelos ~120-130B de pesos abiertos de otros proveedores | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables, por lo que la comparativa cuantitativa no está disponible. La comparación más directa sería con las otras variantes de la familia Mistral Large, pero sus parámetros y contexto no se detallan en la información recibida.

## Limitaciones y advertencias

- Licencia restrictiva: la Mistral AI Research License limita el uso a fines de investigación; cualquier uso comercial, productivo o de distribución como servicio requiere solicitar una licencia a Mistral AI, que puede concederla o denegarla a su discreción.
- Obligación de atribución: al distribuir copias o derivados debe incluirse el aviso "Licensed by Mistral AI under the Mistral AI Research License" y entregar una copia del acuerdo a los receptores.
- Prohibición de misrepresentación: no se puede afirmar que los derivados son productos oficiales de Mistral AI ni que están avalados por la compañía.
- Riesgo de alucinación: no se han publicado en la información disponible métricas de fiabilidad ni evaluaciones de tasa de alucinación; como todo LLM de esta escala, debe validarse en dominios críticos.
- Sesgos: no se documentan en la model card análisis de sesgos; se desconoce la composición del dataset de entrenamiento.
- Cobertura idiomática: aunque se declaran diez idiomas, no se especifica el nivel de competencia por idioma ni si el ajuste instructivo se distribuyó de forma equilibrada entre ellos.
- Longitud de contexto desconocida: al no confirmarse la ventana de contexto, no deben asumirse capacidades de contexto largo sin verificación empírica.
- Sin datos de benchmarks: la ausencia de resultados publicados en la información disponible impide validar afirmaciones de rendimiento frente a competidores.
- Tamaño de despliegue elevado: ~245 GB en BF16 exige infraestructura multi-GPU, lo que limita su uso a entornos con recursos considerables.

## Enlaces

- Hugging Face: https://huggingface.co/mistralai/Mistral-Large-Instruct-2411
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
- Formulario de contacto para licencias comerciales: https://mistral.ai/contact/
- Sitio oficial de Mistral AI: https://mistral.ai/
- Consola de Mistral AI: https://console.mistral.ai/home
- Chat de Mistral AI: https://chat.mistral.ai/login
- SDK de Python en PyPI: https://pypi.org/project/mistralai/

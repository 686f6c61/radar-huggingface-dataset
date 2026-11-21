# audnai/penclaw-Kimi-K3-pro-unrestricted

## Resumen

penclaw-Kimi-K3-pro-unrestricted es un fine-tune del modelo Kimi-K3.1-Pro de Moonshot AI, publicado por el usuario audnai en Hugging Face. Se presenta como una variante "abliterated" y "uncensored", es decir, con las capas de rechazo y alineación de seguridad previsiblemente atenuadas o eliminadas mediante técnicas de abliteración sobre los pesos del modelo base. El modelo conserva la arquitectura Mixture of Experts (MoE) del original, con un total de 2,78 billones de parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de modelos frontera de escala masiva.

El modelo base, Kimi-K3.1-Pro, es un desarrollo de Moonshot AI orientado a generación de texto, razonamiento y tareas de agente. La ficha de Hugging Face no documenta detalles sobre la composición del dataset de entrenamiento, el proceso de alineación ni las capacidades exactas del modelo original, por lo que buena parte de las especificaciones técnicas deben tratarse como no disponibles.

La relevancia de esta publicación es doble: por un lado, ofrece acceso a una variante sin restricciones de un modelo de escala frontera, algo poco habitual dado el coste computacional de manipular pesos de este tamaño; por otro, el repositorio está sometido a acceso restringido (gated) y su licencia es "other" bajo el identificador kimi-k3.1-pro, lo que condiciona fuertemente su uso comercial. El tamaño del repositorio, 1.561,4 GB, refleja pesos en 8 bits y hace inviable su despliegue fuera de infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; etiqueta kimi_k31 con custom_code |
| Parametros totales | 2.780.110.363.392 (2,78 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en 8 bits (tag 8-bit); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license:other); acceso restringido (gated) |
| Formato de pesos | safetensors con custom_code |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts, heredada de Kimi-K3.1-Pro. El tag `kimi_k31` y la presencia de `custom_code` indican que la implementación requiere código personalizado para cargar y ejecutar el modelo, probablemente definiendo el enrutador de expertos y las capas específicas del modelo base. Con 2,78 billones de parámetros totales, se trata de un MoE de escala frontera; el número de parámetros activos por token no está documentado en la información disponible.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Respecto al fine-tune, la etiqueta "abliterated" sugiere una intervención sobre los pesos para suprimir direcciones de activación asociadas a rechazos de seguridad, pero el autor no publica la metodología, el dataset ni los hiperparámetros empleados. Tampoco hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto a gran escala, heredada del modelo base Kimi-K3.1-Pro.
- Razonamiento y tareas de agente propias del modelo original, aunque no documentadas explícitamente en esta ficha.
- Funcionamiento sin capas de rechazo aparentes ("uncensored"), lo que amplía el rango de respuestas generadas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un MoE de escala frontera tras eliminar sus capas de rechazo, comparando respuestas con el modelo base para analizar qué direcciones de activación codifican la negativa a responder.
- Evaluación de robustez de filtros: sirve como generador adversario para probar clasificadores de contenido y sistemas de moderación en pipelines de producción, al producir respuestas que un modelo alineado rechazaría.
- Generación de texto creativo sin restricciones temáticas: útil en entornos controlados de escritura de ficción que abordan temas sensibles y donde el modelo base impondría negativas.
- Red teaming de aplicaciones LLM: permite simular ataques de prompt injection y jailbreak contra sistemas desplegados, midiendo la eficacia de las defensas.
- Estudio de eficiencia de MoE a gran escala: con 2,78 billones de parámetros, es un banco de pruebas para técnicas de serving distribuido, particionado de expertos y cuantización en 8 bits.
- Fine-tuning posterior sobre dominios específicos: al estar ya desalineado, puede servir de base para ajustes que requieran un comportamiento sin sesgo de rechazo, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en 8 bits y 2,78 billones de parámetros, el peso del modelo ronda 1,5 TB; se requiere un clúster multi-GPU con al menos 1,6 TB de memoria agregada solo para cargar los pesos, más espacio para caché KV.
- GPU recomendadas: nodos con múltiples H100 (80 GB) o H200; un solo nodo de 8×H100 no es suficiente para los pesos completos en 8 bits, por lo que se necesitan varios nodos o particionado de expertos entre ellos.
- Consumer GPU: no es viable en ninguna GPU de consumo (RTX 4090, 3090, etc.) ni siquiera con cuantización agresiva, dado el tamaño del repositorio.
- Opciones de despliegue: vLLM y TGI con soporte de MoE distribuido; llama.cpp y Ollama no son viables a esta escala. El tag `custom_code` obliga a usar la implementación específica del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| penclaw-Kimi-K3-pro-unrestricted | 2,78 B (billones) | no disponible | kimi-k3.1-pro (other) | Restringido (gated) |
| moonshotai/Kimi-K3.1-Pro (base) | no disponible en esta ficha | no disponible | kimi-k3.1-pro | no disponible |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables de la misma categoría para establecer una comparativa rigurosa de rendimiento y contexto.

## Limitaciones y advertencias

- Al ser un modelo "abliterated" y "uncensored", no incorpora las salvaguardas del modelo base; puede generar contenido dañino, ilegal o sesgado sin filtro.
- Riesgo elevado de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar su fiabilidad factual.
- La licencia "other" bajo el identificador kimi-k3.1-pro impone condiciones que no se detallan en la ficha; es imprescindible revisar los términos de Moonshot AI antes de cualquier uso comercial, y el acceso gated exige aceptar condiciones adicionales en Hugging Face.
- El autor del fine-tune no documenta la metodología de abliteración, el dataset ni los hiperparámetros, lo que impide auditar qué se ha modificado respecto al modelo base.
- El tamaño de 1,5 TB en 8 bits y la necesidad de `custom_code` complican el despliegue, la reproducibilidad y la portabilidad entre frameworks.
- No hay información sobre idiomas soportados ni sobre el comportamiento en lenguas distintas del inglés; el rendimiento en castellano es desconocido.
- No se documenta la longitud de contexto, por lo que no puede garantizarse el manejo de conversaciones o documentos largos.
- El modelo base es de octubre de 2026 y el fine-tune de noviembre de 2026; no hay historial de mantenimiento ni actualizaciones publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/audnai/penclaw-Kimi-K3-pro-unrestricted
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.

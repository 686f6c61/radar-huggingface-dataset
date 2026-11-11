# Shadow-lancer/splainer-draw-9b-GGUF

## Resumen

Splainer Draw 9B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por Shadow-lancer, orientado a la generación de instrucciones compactas de dibujo para Splainer, una aplicación de pizarra blanca, dibujo y modelado 3D que se ejecuta localmente en el ordenador del usuario. El modelo resuelve el problema de traducir peticiones en lenguaje natural a las instrucciones estructuradas que Splainer necesita para construir diagramas, ilustraciones y geometría 3D, manteniendo toda la inferencia en local.

Se distribuye exclusivamente en formato GGUF cuantizado, con el objetivo declarado de ejecutarse íntegramente en un PC de consumo. El repositorio ocupa 6,7 GB e incluye dos cuantizaciones: Q4_K_M (5,8 GB, 7 GB de VRAM sugeridos) y Q8_0 (9,8 GB, 11 GB sugeridos). El autor recomienda una tarjeta gráfica de 12 GB o más para la variante Q4_K_M.

El modelo tiene 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) y conserva la modalidad image-text-to-text del modelo base, según la etiqueta de pipeline. El "thinking" está desactivado por defecto para favorecer respuestas rápidas, y el modelo espera las instrucciones de dibujo compactas propias de Splainer; con otros prompts se comporta como su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B; detalles especificos no disponibles) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia del recuento de parametros del modelo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-9B, por lo que hereda la arquitectura transformer del modelo base. La información proporcionada no detalla la composición del dataset de ajuste fino, el número de tokens empleados ni si se aplicaron técnicas de RLHF o DPO; únicamente se indica que el modelo ha sido especializado para escribir las pizarras, dibujos y modelos 3D de Splainer.

La innovación principal es la especialización en el formato de instrucciones compactas de dibujo de Splainer, lo que permite que la aplicación genere contenido visual y geométrico a partir de lenguaje natural. El "thinking" está desactivado por defecto para priorizar la latencia baja, un detalle relevante para una herramienta interactiva de escritorio. No se dispone de información sobre técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de instrucciones de dibujo compactas para la pizarra blanca de Splainer.
- Generación de dibujos e ilustraciones a partir de lenguaje natural.
- Generación de modelos 3D dentro del ecosistema Splainer.
- Modalidad image-text-to-text, según la etiqueta de pipeline del repositorio.
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Modo "thinking" disponible pero desactivado por defecto para respuestas rápidas.
- Con prompts ajenos al formato de Splainer, se comporta como el modelo base Qwen/Qwen3.5-9B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Pizarra blanca asistida en Splainer: el modelo recibe una petición en lenguaje natural y devuelve las instrucciones compactas que Splainer interpreta para dibujar diagramas y esquemas sobre el lienzo, aprovechando su especialización en ese formato concreto.
- Creación de diagramas técnicos en local: un desarrollador puede describir la arquitectura de un sistema y obtener el dibujo correspondiente sin enviar datos a la nube, ya que el modelo corre íntegramente en el PC.
- Modelado 3D rápido: el modelo genera las instrucciones para construir modelos 3D sencillos dentro de Splainer, útil para prototipado visual inmediato.
- Integración vía LM Studio u Ollama: al estar disponible en GGUF, puede desplegarse con `lms get` o `ollama run` para experimentar con la generación de dibujos desde scripts o interfaces propias.
- Descarga automática desde la aplicación: el flujo "Get Splainer's own drawing model" selecciona la cuantización según la VRAM de la tarjeta gráfica del usuario y la descarga mediante LM Studio u Ollama, lo que simplifica el despliegue en equipos de usuario final.
- Asistencia educativa y explicaciones visuales: un docente puede pedir explicaciones gráficas paso a paso que Splainer renderiza como dibujos, con la ventaja de que el "thinking" desactivado mantiene la respuesta ágil en una sesión interactiva.
- Base para fine-tunes adicionales: dado que es Apache 2.0 y parte de Qwen3.5-9B, puede servir como punto de partida para especializar otros formatos de dibujo o de representación visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 7 GB para `splainer-draw-9b-Q4_K_M.gguf` (5,8 GB en disco) y 11 GB para `splainer-draw-9b-Q8_0.gguf` (9,8 GB en disco), según la model card.
- Tarjeta recomendada por el autor: 12 GB o más para la cuantización Q4_K_M.
- Cabe en GPU de consumo: sí, con Q4_K_M en tarjetas de 8-12 GB (por ejemplo, gama RTX 3060/4060 Ti de 12 GB o superiores); Q8_0 requiere alrededor de 11-12 GB.
- GPU profesionales: no se especifican modelos concretos (A100, H100, etc.) en la información disponible.
- Opciones de despliegue: LM Studio (búsqueda en Discover o `lms get`), Ollama (`ollama run hf.co/Shadow-lancer/splainer-draw-9b-GGUF:Q4_K_M`) y la propia aplicación Splainer mediante su asistente de configuración.
- Latencia y throughput: no disponibles; el autor solo indica que el "thinking" está desactivado por defecto para respuestas rápidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Splainer Draw 9B | ~9,2 B | no disponible | GGUF (Q4_K_M, Q8_0) | Apache 2.0 | Dibujo/pizarra/3D para Splainer |
| Qwen/Qwen3.5-9B (base) | ~9,2 B | no disponible | safetensors (y derivados) | no disponible en la informacion | Modelo general multimodal image-text-to-text |
| Alternativas especializadas en dibujo/3D | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con su modelo base Qwen/Qwen3.5-9B: comparten tamaño (~9,2 B) y modalidad image-text-to-text, pero Splainer Draw 9B está especializado en el formato de instrucciones de Splainer y se distribuye únicamente en GGUF cuantizado para ejecución local. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo espera las instrucciones de dibujo compactas de Splainer; con otros prompts se comporta como el modelo base, por lo que su especialización no se aprovecha fuera de ese ecosistema.
- No hay información publicada sobre sesgos, tasas de alucinación ni evaluación de calidad de los dibujos generados.
- No se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas.
- No se dispone de la longitud de contexto, un dato crítico para planificar conversaciones largas o dibujos complejos.
- El repositorio no registra descargas ni likes en el momento de la consulta, y el modelo es muy reciente (creado en noviembre de 2026), por lo que carece de validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-9B debe verificarse por separado para confirmar que sus términos son compatibles.
- El "thinking" desactivado por defecto puede reducir la calidad en tareas de razonamiento complejo si no se activa manualmente.
- Solo se ofrecen dos cuantizaciones GGUF; no hay pesos safetensors del fine-tune para entrenamiento o ajuste posterior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shadow-lancer/splainer-draw-9b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio de Splainer: https://splainer.shadow-lancer.com

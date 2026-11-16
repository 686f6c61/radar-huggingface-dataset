# NuevaTechLLC/gemma-3-4b-it-abliterated-v2-GGUF

## Resumen
El modelo `NuevaTechLLC/gemma-3-4b-it-abliterated-v2-GGUF` es una versión "abliterada" (con la dirección de rechazo eliminada del espacio de pesos) del modelo Gemma 3 4B instruct de Google, publicada por Nueva Tech LLC. Se distribuye exclusivamente en formato GGUF, cuantizado para su uso con llama.cpp, Ollama y LM Studio. Cuenta con 3.880.263.168 parámetros totales y un repositorio de 6,6 GB que incluye dos archivos: Q4_K_M (2,5 GB) y Q8_0 (4,1 GB).

El problema que aborda es la eliminación de los mecanismos de rechazo del modelo base mediante una técnica de abliteración de bajo daño, que busca reducir la tasa de negativas sin degradar las capacidades generales ni los comportamientos calibrados de declinación justificada. La model card describe un pipeline propio de Nueva Tech que trata la eliminación del rechazo como un problema de optimización restringida, con búsqueda de hiperparámetros vía Optuna y protección explícita de cuatro comportamientos calibrados.

Es relevante ahora porque la abliteración se ha popularizado como técnica para investigar los mecanismos internos de seguridad de los LLM, y este modelo aporta una propuesta metodológica más elaborada que el receta estándar de diferencia de medias. La model card incluye artefactos de trazabilidad (`extract.json`, `search.json`, `ablation_card.json`) que documentan el proceso, aunque los datos de la card están truncados y no se han publicado resultados completos de benchmarks para este modelo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, no se detalla variante específica en la información disponible) |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 |
| Idiomas soportados | en |
| Licencia | gemma |
| Formato de pesos | GGUF (también se menciona un checkpoint bf16 del que se cuantizaron los GGUF, no incluido en el repo) |

## Arquitectura y entrenamiento
El modelo base es `unsloth/gemma-3-4b-it`, un transformer de la familia Gemma 3 de Google con 3,88 mil millones de parámetros. Sobre él se aplica el pipeline de abliteración de bajo daño de Nueva Tech LLC, que localiza la dirección de rechazo mediante contraste masivo entre pares de prompts dañinos y benignos, y la elimina con una edición de pesos acotada por KL. La card menciona que existe una variante con pares emparejados ("matched") y otra con corpus benigno completo ("bulk"); los archivos publicados usan la extracción "bulk".

El pipeline incluye varias innovaciones técnicas respecto a la receta estándar: eliminación de la media benigna de la dirección antes de la proyección, búsqueda de la capa donde el rechazo se separa mejor con un kernel de anchura y fuerza buscadas, descomposición SVD para obtener un subespacio de rango k en lugar de una única dirección, y protección de cuatro comportamientos calibrados (rechazo de premisas falsas, admisión de ignorancia, rechazo de sinsentidos, respeto de restricciones negativas) mediante 96 pares de sondeo y control. La búsqueda de hiperparámetros se realiza con Optuna sobre una función objetivo que combina rechazo, KL, caída de calibración y sobre-rechazo. Opcionalmente se aplica una pasada de autodestilación contra logits cacheados del modelo intacto.

## Capacidades
- Generación de texto conversacional en inglés, heredada del modelo base Gemma 3 4B instruct.
- Reducción de la tasa de rechazo: según la metodología descrita, el modelo declina menos que el base en prompts dañinos, manteniendo parte del comportamiento calibrado.
- Admisión de ignorancia y rechazo de premisas falsas: la card indica que estos comportamientos se protegen explícitamente durante la edición.
- Ejecución local en CPU/GPU de gama baja gracias a las cuantizaciones Q4_K_M (2,5 GB) y Q8_0 (4,1 GB).
- Compatibilidad con llama.cpp, Ollama y LM Studio, incluyendo un Modelfile en el repositorio.
- Soporte de modo conversacional (`-cnv` en llama.cpp).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso
- Investigación de mecanismos de seguridad: el modelo sirve como caso de estudio para analizar cómo se distribuye la dirección de rechazo en el espacio de pesos y qué efectos colaterales tiene su eliminación, gracias a los artefactos de trazabilidad incluidos.
- Evaluación comparativa de técnicas de abliteración: permite reproducir el pipeline de Nueva Tech y compararlo con Heretic u OBLITERATUS sobre el mismo modelo base, usando los GGUF como punto de partida.
- Despliegue local en hardware modesto: con Q4_K_M (2,5 GB) cabe en GPUs de consumo con 4 GB de VRAM o en CPU con RAM suficiente, útil para pruebas de inferencia sin infraestructura dedicada.
- Prototipado de asistentes conversacionales sin restricciones de rechazo: para entornos controlados donde se necesita que el modelo responda a prompts que el base declinaría, con la advertencia de los riesgos asociados.
- Docencia y divulgación sobre alineación: el contraste entre el modelo base y la versión abliterada ilustra de forma práctica qué es la dirección de rechazo y cómo se manipula.
- Integración en pipelines de llama.cpp/Ollama: el Modelfile y los comandos documentados permiten incorporar el modelo a flujos de generación de texto locales con `llama-cli` o `ollama run`.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks para este modelo concreto en la información disponible. La model card incluye una tabla comparativa de daño entre métodos de abliteración (Heretic 1.4.0, OBLITERATUS y el pipeline propio) sobre Qwen3-8B, pero los datos están truncados y no corresponden a este modelo. La card indica que "this model's own damage numbers are in the results table further down", pero esa tabla no está incluida en el extracto disponible.

## Requisitos de hardware
- VRAM/RAM estimada: aproximadamente 4 GB para el archivo Q4_K_M (2,5 GB); el Q8_0 (4,1 GB) requiere algo más, en torno a 5-6 GB según el contexto.
- GPU recomendadas: no se especifican en la card. Por tamaño, cabe en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 y GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4-6 GB de VRAM para Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 8192 -cnv`), Ollama (con el Modelfile del repo), LM Studio (`lms import <file>`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-3-4b-it-abliterated-v2 (este) | 3,88 B | no disponible | gemma | GGUF | Abliteración de bajo daño, solo inglés |
| unsloth/gemma-3-4b-it (base) | 3,88 B | no disponible | gemma | safetensors y GGUF | Modelo instruct original, con rechazos intactos |
| Heretic 1.4.0 (herramienta) | aplicable a varios | no disponible | según base | según base | Herramienta de abliteración automática con Optuna; no es un modelo |
| OBLITERATUS (herramienta) | aplicable a varios | no disponible | según base | según base | Herramienta de abliteración con presets advanced y optimized; no es un modelo |

No se dispone de datos de rendimiento comparativo específicos para este modelo en la información proporcionada.

## Limitaciones y advertencias
- La abliteración elimina mecanismos de rechazo: el modelo puede generar contenido dañino, inseguro o ilegal que el base declinaría. No debe desplegarse en producción orientada al público sin salvaguardas externas.
- La card reconoce que la eliminación del rechazo afecta también a comportamientos calibrados (rechazo de premisas falsas, admisión de ignorancia, rechazo de sinsentidos, restricciones negativas), aunque el pipeline intenta protegerlos. El grado de preservación no se cuantifica en el extracto disponible.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo base Gemma 3 4B ya presenta limitaciones propias de su tamaño.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Licencia `gemma`: sujeta a los términos de uso de Gemma de Google, que incluyen restricciones de uso comercial y políticas de uso aceptable. Verificar compatibilidad antes de cualquier despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La model card está truncada en la información proporcionada; los resultados de daño del propio modelo no están disponibles en el extracto.
- No se documentan capacidades de tool calling, agentes ni multimodalidad, por lo que no debe asumirse su disponibilidad.

## Enlaces
- Hugging Face: https://huggingface.co/NuevaTechLLC/gemma-3-4b-it-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Repositorio de Gemma 3 (Google): no disponible en la información proporcionada
- Paper o blog del pipeline de abliteración de Nueva Tech LLC: no disponible en la información proporcionada
- Heretic: no disponible en la información proporcionada
- OBLITERATUS: no disponible en la información proporcionada

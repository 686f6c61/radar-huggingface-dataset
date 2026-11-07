# archaeus06/Qwen3.5-0.8B-Q8_0-GGUF

## Resumen

Qwen3.5-0.8B-Q8_0-GGUF es una conversión a formato GGUF del modelo Qwen3.5-0.8B, desarrollado originalmente por Alibaba Cloud (Qwen) y cuantizado a 8 bits por el usuario archaeus06 mediante el espacio GGUF-my-repo de ggml.ai. Se trata de un modelo ultraligero de 772.845.888 parámetros (aproximadamente 0,8 mil millones), orientado a despliegue en el borde (edge) y en hardware de consumo, que forma parte de la serie Qwen3.5, la cual según Qualcomm AI Hub mejora las capacidades de razonamiento y seguimiento de instrucciones respecto a Qwen3. La arquitectura concreta no se detalla en la información disponible, aunque el pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales de entrada.

La relevancia de esta ficha radica en que ofrece un punto de entrada práctico para ejecutar un modelo de la familia Qwen3.5 en local mediante llama.cpp, con un tamaño de repositorio de solo 0,8 GB y licencia Apache 2.0, lo que facilita su integración en prototipos, aplicaciones embebidas y flujos de trabajo con recursos limitados. No obstante, la información publicada por el autor de la cuantización es mínima y remite a la model card original para detalles técnicos.

Es importante señalar que esta entrada corresponde a un artefacto de cuantización, no al modelo original: el autor no aporta datos propios sobre entrenamiento, benchmarks ni idiomas, por lo que buena parte de las especificaciones quedan marcadas como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-0.8B; pipeline declarado image-text-to-text) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo del autor usa `-c 2048`, pero no confirma el máximo) |
| Tipos de cuantizacion | Q8_0 (GGUF de 8 bits) |
| Idiomas soportados | no disponible (la serie Qwen3.5 se describe como multilingüe, sin listado concreto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3.5-0.8b-q8_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.5-0.8B en los datos proporcionados: no se especifica si emplea un transformer denso, una variante MoE, SSM o un esquema híbrido, ni se detallan innovaciones como atención lineal o decodificación especulativa. El pipeline declarado en Hugging Face es image-text-to-text, lo que apunta a que el modelo acepta entrada de imagen y texto, pero no se confirma el mecanismo de fusión multimodal ni el codificador visual empleado.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card de esta cuantización es un documento generado automáticamente por GGUF-my-repo que se limita a describir el proceso de conversión con llama.cpp y a remitir a la model card original de Qwen/Qwen3.5-0.8B para cualquier detalle adicional. Qualcomm AI Hub menciona mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3, pero sin cifras ni metodología.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline declarado indican uso en diálogo multi-turno.
- Entrada multimodal imagen-texto: el pipeline `image-text-to-text` sugiere capacidad de procesar imágenes junto con texto, aunque no se detalla su alcance.
- Razonamiento y seguimiento de instrucciones: Qualcomm AI Hub describe mejoras en estas áreas respecto a la generación anterior Qwen3, sin datos cuantitativos.
- Multilingüismo: la serie Qwen3.5 se presenta como multilingüe, pero no se enumeran los idiomas concretos soportados por esta variante.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Prototipado local en portátil: al ocupar 0,8 GB en Q8_0, el modelo puede ejecutarse con llama.cpp en un portátil convencional sin GPU dedicada, lo que permite validar ideas de producto conversacional antes de escalar a modelos mayores.
- Asistente embebido en aplicaciones de escritorio: mediante `llama-server` se puede exponer una API compatible con endpoints y consumirla desde una aplicación nativa, aprovechando el formato GGUF y la licencia Apache 2.0 para distribución.
- Procesamiento en el borde (edge): Qualcomm AI Hub posiciona el modelo base para despliegue en dispositivos de borde, por lo que esta cuantización sirve como referencia para evaluar calidad frente a tamaño en entornos con memoria restringida.
- Clasificación y extracción de información en documentos con imagen: el pipeline image-text-to-text permitiría experimentar con tareas de descripción o extracción sobre capturas e imágenes, siempre que se valide la calidad real del modelo base.
- Generación de texto asistida en herramientas de línea de comandos: el binario `llama-cli` permite integrar el modelo en scripts de shell para tareas de resumen o redacción rápida sin dependencias de red.
- Base para experimentos de cuantización: al ser un artefacto Q8_0 generado con GGUF-my-repo, resulta útil como referencia para comparar perplejidad y latencia frente a otras cuantizaciones (Q4_K_M, Q5_K_M) del mismo modelo base.
- Filtrado y preprocesado en pipelines de datos: un modelo de 0,8 B puede emplearse para tareas auxiliares de etiquetado o normalización de texto donde no se requiere máxima calidad pero sí bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa aproximadamente 0,8 GB; con overhead de contexto y buffers de llama.cpp, se puede estimar un consumo en torno a 1-1,5 GB de memoria, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre debería poder alojar el modelo en Q8_0; no se dispone de recomendaciones oficiales del autor.
- GPU de consumo: cabe holgadamente en tarjetas de gama de entrada y media (por ejemplo, GTX 1650, RTX 3060, RTX 4060) e incluso en iGPU con memoria unificada suficiente.
- CPU: al ser un modelo de menos de mil millones de parámetros, es viable la inferencia en CPU; el autor no publica cifras de latencia.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), según las instrucciones del autor; también es compatible con el ecosistema GGUF en general (Ollama, LM Studio, etc.), aunque no se confirma explícitamente en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| archaeus06/Qwen3.5-0.8B-Q8_0-GGUF | 772.845.888 | no disponible | Apache 2.0 | GGUF Q8_0 | Cuantización comunitaria del base Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | 772.845.888 (según dato del repo derivado) | no disponible | Apache 2.0 | safetensors (presumible) | Modelo original de Alibaba Cloud |
| ggml-org/Qwen3.5-0.8B-GGUF | no disponible | no disponible | Apache 2.0 (heredada) | GGUF | Cuantizaciones oficiales del equipo ggml-org |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información técnica mínima: la model card del autor es autogenerada y no aporta detalles sobre arquitectura, entrenamiento ni evaluación; cualquier decisión de producción debe basarse en la model card original de Qwen/Qwen3.5-0.8B.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; con 0,8 B de parámetros, la tasa de errores factuales y de coherencia en tareas complejas es previsiblemente alta, aunque no se aportan mediciones.
- Capacidad limitada por tamaño: no debe esperarse un rendimiento comparable a modelos de 7 B o superiores en razonamiento matemático, código o instrucciones multi-paso.
- Contexto: el ejemplo del autor usa `-c 2048`, pero no se confirma la ventana máxima real del modelo base; configurar contextos mayores sin verificar puede degradar la calidad.
- Idiomas: aunque la serie se describe como multilingüe, no hay listado oficial de idiomas para esta variante; el rendimiento en castellano no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base original enlazada por el autor para confirmar condiciones.
- Cuantización Q8_0: introduce una pérdida de precisión respecto a los pesos originales en safetensors; para aplicaciones sensibles a la exactitud puede ser preferible el modelo base.
- Multimodalidad no verificada: el pipeline image-text-to-text se declara en los metadatos, pero no se documenta el soporte real de imágenes en esta cuantización GGUF ni su compatibilidad con llama.cpp para entrada visual.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/archaeus06/Qwen3.5-0.8B-Q8_0-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Cuantizaciones de ggml-org: https://huggingface.co/ggml-org/Qwen3.5-0.8B-GGUF
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b

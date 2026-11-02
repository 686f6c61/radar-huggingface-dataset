# Anouuuuuu/EasyExplain-Gemma-4-E2B-it-GGUF

## Resumen

EasyExplain-Gemma-4-E2B-it-GGUF es una distribución del modelo Gemma 4 E2B instruction-tuned de Google DeepMind, convertido a formato GGUF y cuantizado en Q4_K_M con llama.cpp. No se trata de un modelo entrenado desde cero ni de un fine-tune: el autor (Anouuuuuu) publica el artefacto exacto que consume la aplicación Android EasyExplain como motor de simplificación de texto offline. El repositorio existe, por tanto, como dependencia de distribución reproducible de una aplicación concreta, no como un modelo de propósito general.

El modelo base pertenece a la familia Gemma 4 de Google, en su variante E2B (etiqueta de eficiencia dentro de la familia) e instruction-tuned. La model card no detalla arquitectura, número de parámetros ni longitud de contexto del modelo original; esos datos deben consultarse en la ficha upstream de `google/gemma-4-E2B-it`. Lo que sí se documenta con precisión es el proceso de conversión: revisión concreta del modelo fuente, commit de llama.cpp utilizado, tamaño exacto del fichero y hash SHA-256 para verificación de integridad.

Su relevancia es acotada pero clara: demuestra un patrón de despliegue de IA generativa en dispositivo (on-device) para una tarea de accesibilidad cognitiva, con verificación criptográfica del artefacto y ejecución local sin conexión. Para desarrolladores que evalúan simplificación de texto en Android con modelos de ~3,4 GB, es una referencia práctica de empaquetado y cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de google/gemma-4-E2B-it) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (único fichero publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`simplifier.gguf`) |
| Tamaño del fichero | 3.427.879.936 bytes (~3,43 GB) |
| SHA-256 | `9ccd82e4504daba59cdb1d517d28af3d37b71fd33eefac4b4e4eac9a3aa25973` |
| Revisión del modelo base | `3e22461f65e89153144f8adb70e3b8c2cc9845a7` |
| Commit de llama.cpp | `987498f4592a76897863cf53711dce38380c082b` |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Este repositorio no incluye entrenamiento ni ajuste alguno: es una conversión de formato y una cuantización. El modelo subyacente es `google/gemma-4-E2B-it`, instruction-tuned por Google DeepMind; la model card de este derivado no describe la arquitectura interna (transformer denso, MoE, híbrido), el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Toda esa información queda delegada explícitamente a la ficha upstream.

La única innovación técnica documentada en este repositorio es el pipeline de conversión: GGUF generado con un commit específico de llama.cpp y cuantización Q4_K_M, que reduce el peso a ~3,43 GB manteniendo bloques de cuantización mixta (atención y capas densas con distinta precisión). El autor publica el hash SHA-256 para que la aplicación verifique la integridad del fichero tras la descarga, un detalle relevante para distribución de artefactos en móvil.

## Capacidades

- Generación de texto en inglés, orientada por el modelo base a instrucciones (variante `-it`).
- Simplificación de texto: es el uso previsto por la aplicación EasyExplain, que aplica además vectores de direccionamiento (steering vectors) y listas de palabras propias de la app.
- Ejecución local offline mediante llama.cpp en formato GGUF.
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no documentadas en la información disponible para este derivado; deben verificarse en la ficha del modelo base.
- Multilingüismo: la model card declara únicamente inglés (`language: en`).

## Casos de uso

- Simplificación de texto en dispositivos Android sin conexión: la app descarga el GGUF una vez, verifica el SHA-256 y ejecuta la inferencia localmente; adecuado para entornos con conectividad intermitente o requisitos de privacidad.
- Accesibilidad cognitiva: apoyo a la lectura de documentos para usuarios con dificultades de comprensión, siempre con revisión humana de las salidas por riesgo de omisión o cambio de significado.
- Distribución reproducible de artefactos de IA: el repositorio sirve como referencia de empaquetado (revisión fijada del modelo base, commit de llama.cpp, checksum) para equipos que publican modelos cuantizados como dependencia de una aplicación.
- Prototipado de pipelines de simplificación en local: integrable con llama.cpp u otros runners compatibles GGUF para experimentar con prompts de reescritura en inglés antes de portar la lógica a móvil.
- Evaluación de cuantización Q4_K_M en hardware limitado: útil para medir el equilibrio calidad/tamaño de un modelo de ~3,4 GB en GPUs de consumo o CPUs modernas.
- Base para experimentos de direccionamiento (steering): la app usa vectores de direccionamiento propios; este artefacto permite reproducir el punto de partida del motor sin los componentes adicionales de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad, latencia ni puntuaciones de legibilidad, y advierte explícitamente de que el repositorio no establece eficacia clínica ni garantiza un nivel de legibilidad concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa ~3,43 GB; se necesita al menos esa cantidad de memoria más overhead de contexto (aproximadamente 4-5 GB en total con ventanas moderadas, estimación orientativa, no publicada por el autor).
- GPU recomendadas: no especificadas. Por tamaño, cabe en GPUs de consumo con 6-8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema, aunque estas últimas están sobredimensionadas para este artefacto.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM; también es viable en CPU, dado el uso previsto en Android.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y otros runners compatibles con GGUF. vLLM y TGI no se citan en la información disponible para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EasyExplain-Gemma-4-E2B-it-GGUF | no disponible | no disponible | GGUF Q4_K_M | Apache 2.0 | Derivado cuantizado de Gemma 4 E2B-it; solo inglés; orientado a simplificación offline |
| google/gemma-4-E2B-it (upstream) | no disponible | no disponible | safetensors (presumible) | según ficha upstream | Modelo original de Google DeepMind; sin cuantizar |
| Otras cuantizaciones GGUF de Gemma 4 E2B-it | no disponible | no disponible | GGUF | según autor | No identificadas en la información disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor advierte de que las simplificaciones generadas pueden omitir información, alterar el significado o contener errores; es obligatoria la revisión de salidas importantes contra el texto original.
- No se establece eficacia clínica ni se garantiza una puntuación de legibilidad específica.
- El repositorio contiene solo el modelo: los vectores de direccionamiento, la lista de palabras y los componentes de voz de EasyExplain se distribuyen por separado y no están incluidos.
- Idioma limitado a inglés según la model card; no apto para simplificación en castellano sin evaluación adicional.
- Sesgos del modelo base no documentados en este derivado; deben consultarse en la ficha upstream.
- Licencia Apache 2.0 declarada para este artefacto; conviene verificar las condiciones del modelo base de Google antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni evidencia de uso en producción fuera de la aplicación del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Anouuuuuu/EasyExplain-Gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- llama.cpp (commit usado en la conversión): `987498f4592a76897863cf53711dce38380c082b`
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.

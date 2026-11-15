# geladons/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B en formato LiteRT-LM es una conversión del modelo base Qwen/Qwen3.5-0.8B publicada por el usuario geladons, empaquetada como archivo `.litertlm` (int8) para inferencia totalmente local en dispositivos Android. El modelo resuelve el problema de desplegar un LLM de 0,8 mil millones de parámetros en un teléfono sin conexión a la nube, sin cuenta de usuario y sin dependencia de servidores externos, utilizando el runtime LiteRT-LM de Google AI Edge.

El repositorio no es un modelo nuevo ni un fine-tuning sobre el base: es un artefacto de distribución (bundle) del modelo Qwen3.5-0.8B convertido a un formato de ejecución on-device. El archivo ocupa 0,96 GB, es de solo texto (text → text) y conserva la licencia Apache 2.0 del modelo original. La relevancia actual reside en la tendencia hacia la IA en el borde (edge AI): modelos pequeños cuantizados que caben en memoria de móvil y se ejecutan con latencia aceptable sin infraestructura.

La información disponible sobre arquitectura interna, contexto, datos de entrenamiento y benchmarks del modelo base no está incluida en la model card de este repositorio; esta ficha documenta lo que el bundle declara y marca explícitamente como no disponible todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B; la model card del bundle no detalla la arquitectura) |
| Parametros totales | 0,8 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantización del bundle `.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM runtime); tamaño de archivo 0,96 GB |

## Arquitectura y entrenamiento

El bundle no documenta la arquitectura del modelo base Qwen3.5-0.8B (tipo de transformer, atención, capas, etc.), ni los datos de entrenamiento, número de tokens, composición del dataset o si hubo RLHF/DPO. Lo único verificable en esta ficha es el proceso de conversión: el modelo original se transforma al formato `.litertlm` mediante las recetas del proyecto `hf-to-litertlm` y se cuantiza a int8, dando como resultado un archivo de 0,96 GB ejecutable con el SDK `com.google.ai.edge.litertlm`.

La innovación destacable no está en el entrenamiento sino en el empaquetado: LiteRT-LM es un runtime de Google AI Edge orientado a inferencia on-device, y este bundle permite cargar el modelo directamente mediante las abstracciones `Engine`/`Conversation` del SDK, sin servidores ni cuentas. El archivo es byte-idéntico al publicado en `geladons/local-ai-models`, que se mantiene por compatibilidad hacia atrás.

## Capacidades

- Generación de texto (modalidad declarada: text → text).
- Inferencia totalmente offline en dispositivo: no requiere nube ni cuenta.
- Integración en aplicaciones Android mediante el SDK `com.google.ai.edge.litertlm`.
- Disponible en el catálogo integrado de la app Local AI para uso sin código.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están listados).
- Capacidades especiales (thinking mode, visión, audio): no disponible; la modalidad declarada es solo texto.

## Casos de uso

- Chat offline en móvil sin código: instalar la app Local AI desde Google Play, descargar el bundle desde su catálogo integrado y conversar con el modelo sin conexión, apropiado para usuarios que priorizan privacidad y cero dependencia de servidores.
- Asistentes embebidos en apps Android: integrar el SDK `com.google.ai.edge.litertlm` y apuntar `Engine`/`Conversation` al archivo `.litertlm` para ofrecer generación de texto dentro de la propia aplicación, sin backend ni coste de API.
- Procesamiento de texto sensible en local: al ejecutarse íntegramente en el dispositivo, los datos no salen del teléfono, lo que encaja en escenarios con requisitos de privacidad (notas personales, borradores de documentos).
- Prototipado rápido de features de IA en Android: usar el bundle para validar UX de generación de texto antes de decidir si se necesita un modelo mayor o infraestructura cloud.
- Aplicaciones de campo sin conectividad: entornos con red intermitente o inexistente (obra, campo, viajes) donde un modelo de 0,8B int8 de 0,96 GB cabe en almacenamiento de móvil y funciona sin red.
- Distribución de demos y pruebas de concepto: el formato `.litertlm` y la disponibilidad en catálogo permiten compartir una demo funcional de LLM on-device con un solo archivo, sin montar servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo pesa 0,96 GB en formato int8; se requiere al menos ese espacio de almacenamiento y memoria suficiente para cargar el bundle en el runtime (el requisito exacto de RAM en ejecución no está documentado).
- GPU recomendadas: no aplicable en el sentido de GPU de servidor; el destino declarado es Android on-device (aceleración por hardware del dispositivo no detallada).
- ¿Cabe en GPU consumer? No hay datos al respecto en la información proporcionada; el bundle está pensado para móvil, no para GPUs de escritorio.
- Opciones de despliegue: runtime LiteRT-LM (`com.google.ai.edge.litertlm` SDK), app Local AI (Google Play) para uso sin código. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| geladons/Qwen3.5-0.8B (este bundle) | 0,8B | no disponible | `.litertlm` int8 (0,96 GB) | apache-2.0 | On-device Android, runtime LiteRT-LM |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | safetensors (presumible, no confirmado) | apache-2.0 (según el bundle) | Modelo original sin conversión; specs internas no disponibles en esta ficha |
| geladons/local-ai-models | no disponible | no disponible | `.litertlm` (mismo archivo) | apache-2.0 | Repositorio agregador; el archivo es byte-idéntico a este bundle |

No se dispone de datos de benchmarks ni de otros bundles comparables en la información proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: inherente a los LLM; no se aportan evaluaciones específicas del modelo base ni del bundle.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están declarados, lo que impide garantizar comportamiento en conversaciones largas o en castellano.
- Licencia: Apache 2.0, igual que el modelo base; permite uso comercial, pero conviene verificar las condiciones del modelo original Qwen/Qwen3.5-0.8B por si añade términos adicionales.
- Producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y es un artefacto de conversión de un tercero, no una publicación oficial de Qwen; para producción conviene validar la fidelidad del bundle frente al modelo base.
- Formato cerrado al runtime: `.litertlm` solo se ejecuta con LiteRT-LM; no es directamente compatible con vLLM, llama.cpp u Ollama.
- Requisitos reales de memoria en dispositivo no documentados; el tamaño de archivo (0,96 GB) es un límite inferior, no el consumo total en ejecución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/geladons/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio agregador (copia byte-idéntica): https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- App Local AI (Google Play): https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia Apache 2.0: https://spdx.org/licenses/apache-2.0.html

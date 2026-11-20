# Caldalis/MiniTranslator-2B-GGUF

## Resumen

MiniTranslator-2B-GGUF es la versión cuantizada en formato GGUF de MiniTranslator-2B, un modelo especializado en traducción desarrollado por Caldalis y construido sobre la arquitectura MiniCPM (etiquetado en la model card como MiniCPM5). Con 2.516.756.480 parámetros totales (aproximadamente 2,5 mil millones), está diseñado para ejecutarse en dispositivo (on-device) y ofrece soporte para 22 idiomas, incluyendo chino, inglés, japonés, coreano, árabe, alemán, francés, español, ruso, bengalí, checo, estonio, persa, hebreo, indonesio, kannada, rumano, tamil, telugu, tagalo, turco y ucraniano.

El modelo resuelve el problema de la traducción automática multilingüe en entornos con recursos limitados, ya que su tamaño compacto y sus cuantizaciones (desde F16 hasta Q4_K_M) permiten desplegarlo en hardware de consumo. La versión GGUF facilita la integración con llama.cpp, llama-server y llama-cli, lo que simplifica su uso en aplicaciones locales y pipelines sin depender de infraestructura en la nube.

Es relevante ahora porque combina un tamaño reducido con una cobertura lingüística amplia y una licencia permisiva (Apache 2.0), lo que lo hace atractivo para desarrolladores que necesitan traducción local, privada y de baja latencia. Además, incluye un modo de razonamiento (thinking) que puede desactivarse para tareas de traducción directa, optimizando el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en MiniCPM (MiniCPM5) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ejemplo de uso con `-c 4096`) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | zh, en, ja, ko, ar, de, fr, es, ru, bn, cs, et, fa, he, id, kn, ro, ta, te, tl, tr, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible indica que MiniTranslator-2B se basa en la arquitectura MiniCPM (referida como MiniCPM5 en las etiquetas), un transformer de aproximadamente 2,5 mil millones de parámetros. El modelo base se distribuye en safetensors (BF16) y esta versión GGUF se ha convertido con `convert_hf_to_gguf.py` de llama.cpp usando `--outtype f16`, generando un archivo F16 que sirve como madre para las cuantizaciones Q8_0, Q6_K y Q4_K_M mediante `llama-quantize`.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona un modo de razonamiento (thinking) que puede desactivarse con `--reasoning off` o mediante `chat_template_kwargs: {"enable_thinking": false}`, lo que sugiere que el modelo fue entrenado con capacidad de generar cadenas de pensamiento antes de la traducción. No se han documentado innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción multilingüe entre 22 idiomas, incluyendo pares con alfabetos no latinos (chino, japonés, coreano, árabe, hebreo, bengalí, tamil, telugu, kannada).
- Generación de texto conversacional, según la etiqueta `conversational`.
- Modo de razonamiento (thinking) activable o desactivable; para traducción se recomienda desactivarlo para evitar bloques `<think>` en la salida.
- Compatibilidad con endpoints estilo OpenAI (`/v1/chat/completions`) a través de llama-server.
- Ejecución on-device gracias a las cuantizaciones GGUF.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Traducción local en aplicaciones de escritorio: el modelo puede integrarse en herramientas de traducción offline usando llama.cpp con la cuantización Q4_K_M (1,56 GB), adecuada para portátiles sin GPU dedicada.
- Traducción de documentación técnica en pipelines de CI/CD: al exponer una API compatible con OpenAI mediante llama-server, se puede invocar desde scripts para traducir README, comentarios o mensajes de commit entre los 22 idiomas soportados.
- Atención al cliente multilingüe en entornos con requisitos de privacidad: al ejecutarse on-device, los textos de los usuarios no salen del sistema, lo que permite traducir conversaciones en tiempo real sin enviar datos a servicios externos.
- Traducción de contenido para comunidades internacionales: foros, chats o wikis pueden traducir mensajes entre idiomas como español, alemán, francés, ruso o árabe usando la API local con `temperature: 0` para mayor determinismo.
- Subtitulado y localización de vídeos: el modelo puede traducir transcripciones o subtítulos en lotes, aprovechando su contexto de 4096 tokens (configurado en el ejemplo) para procesar segmentos completos.
- Investigación en traducción automática de bajo recurso: al cubrir idiomas como estonio, kannada, tamil, telugu o tagalo, sirve como base para experimentos de fine-tuning o evaluación en pares lingüísticos menos representados.
- Prototipado rápido de servicios de traducción: con llama-server y el archivo Q8_0 (2,68 GB) se puede levantar un endpoint local en minutos para validar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 requiere aproximadamente 5,04 GB; Q8_0 unos 2,68 GB; Q6_K unos 2,07 GB; Q4_K_M unos 1,56 GB (tamaños de archivo, la VRAM real puede ser algo superior por el contexto y overhead).
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer con al menos 4-6 GB de VRAM para cuantizaciones bajas.
- Cabe en GPU consumer: sí, especialmente con Q4_K_M o Q6_K en tarjetas con 4 GB o más; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), y por extensión herramientas compatibles con GGUF como Ollama o LM Studio (no confirmado en la model card).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparativas con otros modelos de traducción.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones inexactas o inventar contenido, especialmente en idiomas de bajo recurso.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos derivados de los datos de entrenamiento del modelo base.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; el ejemplo usa 4096 tokens. La cobertura de 22 idiomas no garantiza calidad uniforme en todos los pares.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución.
- Caveat para producción: es imprescindible desactivar el modo thinking (`--reasoning off` o `enable_thinking: false`) para evitar que el modelo emita bloques `<think>` antes de la traducción; usar `temperature: 0` para salidas deterministas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Caldalis/MiniTranslator-2B-GGUF
- Modelo base: https://huggingface.co/Caldalis/MiniTranslator-2B
- llama.cpp (herramienta de conversión y cuantización): https://github.com/ggerganov/llama.cpp

# sorika-labs/swen1-samvaad-GGUF

## Resumen

Swen1-Samvaad es un modelo de lenguaje con visión (vision-language) publicado por Sorika Labs en formato GGUF y orientado a conversación multilingüe en hindi, hinglish e inglés. Se distribuye como un par de ficheros: un modelo de lenguaje cuantizado en Q5_K_M de aproximadamente 804 MB y un proyector de visión (mmproj) en F16 de aproximadamente 814 MB, con un total de 1.170.340.608 parámetros (~1,17B) según los pesos originales en safetensors. El repositorio completo ocupa 1,7 GB.

El modelo forma parte de la familia Swen de Sorika Labs, una línea de modelos compactos de razonamiento para edge. En el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 "likes", y fue creado el 23 de septiembre de 2026, por lo que se trata de una publicación muy reciente y sin validación comunitaria. La etiqueta `endpoints_compatible` indica que puede desplegarse mediante los endpoints compatibles de Hugging Face, y la librería declarada es llama.cpp.

Su relevancia práctica está en el nicho: modelos multimodales de ~1B parámetros que quepan en CPU o en GPU de gama de entrada y que cubran hindi y hinglish de forma nativa, algo poco frecuente en el ecosistema de modelos pequeños, mayoritariamente centrado en inglés y chino. La licencia declarada es `lfm1.0` (identificador `other`), un dato crítico para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la serie Swen 1.1 de Sorika Labs se describe como transformer híbrido con convoluciones causales doblemente gateadas, pero no se confirma que Swen1-Samvaad use esa misma arquitectura |
| Parametros totales | 1.170.340.608 (~1,17B), dato de los pesos safetensors originales |
| Longitud de contexto | no disponible de forma explícita; el ejemplo oficial de llama.cpp usa `-c 4096`. La serie Swen 1.1 anuncia 128k de contexto, dato no confirmado para esta variante |
| Tipos de cuantizacion | Q5_K_M para el modelo de lenguaje y F16 para el proyector de visión (mmproj) |
| Idiomas soportados | hindi, hinglish e inglés (según la identidad declarada en la model card) |
| Licencia | lfm1.0 (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (llama.cpp); el modelo de lenguaje y el proyector de visión se distribuyen como ficheros GGUF separados |
| Tamano de los ficheros | ~804 MB (LLM Q5_K_M) + ~814 MB (mmproj F16); repositorio de 1,7 GB |
| Libreria | llama.cpp |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna ni el proceso de entrenamiento de Swen1-Samvaad: no se indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste por instrucciones, RLHF o DPO. Tampoco se detalla el codificador visual empleado ni cómo se conecta con el modelo de lenguaje, más allá de que existe un proyector multimodal separado (`mmproj`) en precisión F16.

El único contexto técnico disponible procede de la documentación pública de la serie Swen 1.1 de Sorika Labs, que describe un enfoque de "convoluciones causales híbridas doblemente gateadas" con razonamiento metacognitivo en tiempo de test y una reducción declarada de 10,6x en el consumo de memoria de caché, con 128k de contexto. Es plausible que Swen1-Samvaad herede parte de ese diseño —de hecho, la licencia `lfm1.0` coincide con la LFM Open License de Liquid AI, y las convoluciones doblemente gateadas son características de la familia LFM2—, pero la model card de este repositorio no lo confirma, por lo que cualquier afirmación al respecto debe tratarse como no verificada.

Lo que sí está confirmado es que el modelo espera un prompt de identidad concreto y que funciona con streaming de tokens por defecto en llama.cpp, con soporte de entrada de imagen mediante `--mmproj` y `--image`.

## Capacidades

- Generación de texto conversacional multi-turno en hindi, hinglish e inglés.
- Comprensión de imágenes: puede recibir una fotografía y responder preguntas sobre su contenido (por ejemplo, "¿qué hay en la foto?").
- Respuesta en hinglish, con mezcla de hindi y transliteración latina, un registro poco cubierto por modelos occidentales.
- Streaming de tokens en tiempo real por defecto en llama.cpp.
- Empaquetado multimodal en dos ficheros GGUF independientes, lo que permite sustituir o reentrenar el proyector de visión sin tocar el modelo de lenguaje.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre capacidades de agente, razonamiento multi-paso explícito ni modo "thinking".
- No hay información sobre otras modalidades (audio, vídeo) ni sobre entrenamiento específico para código o matemáticas.

## Casos de uso

- Atención al cliente en hindi y hinglish: el modelo puede gestionar conversaciones multi-turno con un prompt de sistema que fije su identidad y responder en el registro lingüístico del usuario. Adecuado para comercio electrónico o servicios financieros dirigidos al mercado indio, donde los chatbots en inglés generan fricción.
- Descripción automática de imágenes para accesibilidad: dado que acepta una imagen y genera texto, puede producir textos alternativos y descripciones para lectores de pantalla, con la ventaja de hacerlo en hindi e hinglish para usuarios que no leen inglés.
- Asistente embebido en dispositivos edge: con ~1,6 GB de pesos totales, el modelo puede ejecutarse de forma local en mini-PC, Raspberry Pi con suficiente RAM o portátiles modestos, sin conexión a internet y sin enviar imágenes del usuario a un servidor externo.
- Etiquetado semiautomático de catálogos de producto: subir fotografías de artículos y obtener una descripción textual y una categoría preliminar, útil como paso previo a la revisión humana en flujos de inventario.
- Soporte a la digitalización de documentos simples: el pipeline permite enviar una foto de un documento y pedir un resumen conversacional de su contenido. No es una herramienta de OCR estructurado y requiere validación humana, pero sirve para preprocesado en contextos con recursos limitados.
- Prototipado y evaluación de pipelines multimodales: su tamaño reducido y su formato GGUF lo hacen útil para validar arquitecturas de dos ficheros (LLM + mmproj) en llama.cpp antes de escalar a modelos mayores, así como para estudiar técnicas de cuantización agresiva en modelos con visión.
- Educación y asistencia en zonas con conectividad limitada: al poder ejecutarse offline en hardware barato y responder en hindi, encaja en programas de tutoría o consulta que no pueden depender de API en la nube.
- Generación de datos sintéticos multilingües a pequeña escala: puede utilizarse para producir pares imagen-descripción en hindi o hinglish destinados a aumentar datasets de entrenamiento, siempre que se revise la calidad de la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, y el repositorio no enlaza a un informe técnico específico de la variante Samvaad. La documentación de Sorika Labs sobre la serie Swen 1.1 menciona objetivos de eficiencia (contexto de 128k y 10,6x menos memoria de caché), pero no cifras de exactitud, y no es posible atribuir esos datos a esta variante concreta.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 1,7-2,5 GB considerando los pesos Q5_K_M (~0,8 GB), el proyector de visión F16 (~0,8 GB), la caché KV para 4096 tokens y las activaciones del codificador visual. Con contextos mayores, la caché KV crece de forma proporcional.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050/3060, RTX 4060, e incluso iGPU con memoria unificada suficiente).
- Inferencia en CPU: viable y probablemente el escenario principal; funciona con llama.cpp en x86 y ARM, incluidos mini-PC y placas tipo Raspberry Pi con 8 GB de RAM.
- GPU de datacenter: no es necesaria. A100, H100 o L40S solo tendrían sentido para servir muchas réplicas concurrentes del modelo, no por requisitos de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con soporte de `--mmproj`), entornos compatibles con GGUF como Ollama o LM Studio mediante importación, y `llama-cpp-python` para integración en aplicaciones. El soporte de vLLM no está documentado para GGUF con proyector multimodal y requeriría pesos en safetensors.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia de primera token, ni en CPU ni en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Vision | Idiomas destacados | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Swen1-Samvaad (Sorika Labs) | ~1,17B | Sí (mmproj F16) | hindi, hinglish, inglés | lfm1.0 (other) | Sí, Q5_K_M |
| SmolVLM2-2.2B (Hugging Face) | ~2,2B | Sí | principalmente inglés | Apache-2.0 | Sí |
| moondream2 (Moondream) | ~1,9B | Sí | principalmente inglés | Apache-2.0 | Sí |
| Qwen2-VL-2B-Instruct (Alibaba) | ~2,2B | Sí | multilingüe amplio, con cobertura limitada de hindi | Apache-2.0 | Sí, mediante conversión |

La comparación relevante no está en calidad —no hay benchmarks publicados de Swen1-Samvaad que permitan situarlo— sino en el eje lingüístico y de licencia: es el único de la tabla con foco explícito en hindi e hinglish, y el único con licencia `lfm1.0` en lugar de Apache-2.0. Los datos de los modelos comparativos proceden de su documentación pública y pueden variar según la versión o el checkpoint concreto; conviene verificarlos antes de tomar decisiones.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada: ni benchmarks, ni comparativas, ni pruebas de robustez. Cualquier uso en producción debería ir precedido de una evaluación propia.
- Riesgo de alucinación elevado y no medido: con ~1,17B parámetros, la capacidad de razonamiento y de retención de hechos es limitada por diseño.
- Contexto no documentado: el ejemplo oficial usa 4096 tokens, mientras que la serie Swen 1.1 anuncia 128k. No se debe asumir el contexto largo sin verificarlo experimentalmente, ya que un modelo pequeño rara vez mantiene coherencia en ventanas muy extensas.
- Cobertura idiomática limitada: solo se declaran hindi, hinglish e inglés. No hay información sobre castellano ni sobre otras lenguas.
- Licencia `lfm1.0` (campo `other`): no es una licencia OSI estándar, lo que obliga a revisar los términos exactos antes de cualquier uso comercial. Es un riesgo relevante porque la licencia podría imponer condiciones de atribución, límites de facturación o restricciones de redistribución.
- Sesgos: no se documenta ningún análisis de sesgo, ni demográfico, ni cultural, ni lingüístico. Un modelo entrenado con foco en hindi puede presentar un sesgo de representación hacia determinadas variedades del idioma y hacia el registro hinglish de las zonas más representedas en los datos.
- Proyecto sin tracción: 0 descargas, 0 "likes" y sin model card técnica detallada. No hay garantía de mantenimiento, versionado ni soporte por parte del autor.
- La identidad del modelo depende de un prompt de sistema concreto ("You are Swen Samvaad, a helpful AI assistant built by Sorika Labs…"); omitirlo puede degradar la calidad de las respuestas y alterar su comportamiento.
- Separación de ficheros: es necesario cargar el `mmproj` para obtener visión; usar solo el GGUF del modelo de lenguaje desactiva la capacidad multimodal sin aviso explícito.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sorika-labs/swen1-samvaad-GGUF
- Repositorio relacionado de la misma familia: https://huggingface.co/sorika-labs/swen1-edge-1B-GGUF
- Página de modelos de Sorika AI Labs: https://sorikalabs.com/models
- Informe técnico de Swen 1.1 (convoluciones híbridas y razonamiento metacognitivo): https://sorika.vercel.app/research/swen
- Página de la serie Swen 1.1: https://sorika.vercel.app/models/swen

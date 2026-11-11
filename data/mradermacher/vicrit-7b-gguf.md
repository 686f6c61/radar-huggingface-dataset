# mradermacher/ViCrit-7B-GGUF

## Resumen

ViCrit-7B-GGUF es la versión cuantizada en formato GGUF del modelo zyang39/ViCrit-7B, publicada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. Se trata de un modelo multimodal (los ficheros mmproj incluidos evidencian soporte de visión) de aproximadamente 7.600 millones de parámetros, derivado del modelo base ViCrit-7B. La cuantización permite ejecutar el modelo en hardware de consumo mediante herramientas como llama.cpp, Ollama o LM Studio, algo imposible con los pesos originales en precisión completa.

El modelo original ViCrit-7B está orientado a tareas de crítica visual y conversación multimodal, según se deduce de su nombre y del fichero mmproj (multi-modal projection) incluido en el repositorio. La información disponible sobre el modelo base es limitada: no se han publicado en la información proporcionada detalles sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia. El repositorio acumula 238 descargas y fue creado en junio de 2025.

La relevancia de esta ficha radica en que ViCrit-7B-GGUF ofrece un abanico amplio de cuantizaciones (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB), lo que permite desplegar un modelo multimodal de 7B en GPUs de consumo con VRAM modesta. Es una opción práctica para desarrolladores que necesitan evaluar capacidades de crítica visual sin infraestructura de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector visual; transformer presumiblemente) |
| Parámetros totales | 7.615.616.512 (7,6B) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el proyector multimodal |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base zyang39/ViCrit-7B en la documentación proporcionada. Los ficheros mmproj (multi-modal projection) incluidos en el repositorio confirman que se trata de un modelo multimodal con capacidad de procesar imágenes, típicamente mediante un proyector que alinea representaciones visuales con el espacio de embeddings del modelo de lenguaje. El tamaño de 7,6B parámetros es coherente con una arquitectura transformer de escala 7B con un codificador visual adicional.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco hay información sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El nombre "ViCrit" sugiere un entrenamiento orientado a tareas de crítica visual, pero esto no está confirmado en la documentación.

## Capacidades

- Generación de texto conversacional en inglés (etiqueta "conversational" y pipeline de chat).
- Procesamiento multimodal de imágenes mediante el proyector mmproj incluido (visión).
- Crítica visual: por el nombre del modelo, se presume capacidad de evaluar y criticar imágenes, aunque no está documentado explícitamente.
- Conversación multi-turno (formato chat).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Evaluación de calidad de imágenes generadas: el modelo puede recibir una imagen y emitir una crítica textual sobre ella, útil en pipelines de generación de imágenes para filtrar o puntuar resultados automáticamente.
- Asistencia en anotación de datasets visuales: con la cuantización Q4_K_M (4,8 GB) se puede desplegar en una RTX 3060 de 12 GB para preetiquetar imágenes con descripciones o críticas que luego revisa un humano.
- Prototipado de aplicaciones de visión-lenguaje en local: gracias a los ficheros mmproj y a llama.cpp, un desarrollador puede montar un prototipo de chatbot que "vea" imágenes sin depender de APIs en la nube.
- Análisis de capturas de pantalla en herramientas de soporte: el modelo puede describir y criticar el contenido de una captura enviada por un usuario, integrado en un flujo de atención al cliente.
- Investigación en crítica visual automatizada: al ser una cuantización de un modelo específicamente orientado a crítica visual, sirve como base para experimentos académicos con recursos limitados de GPU.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp u Ollama (cuantización Q4_K_S de 4,6 GB), los datos visuales no salen del dispositivo, adecuado para sectores regulados.
- Educación y demostraciones: la cuantización Q2_K (3,1 GB) permite ejecutar el modelo en portátiles con GPU de 4-6 GB para demostraciones de IA multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3,1 GB de pesos, ~4-5 GB de VRAM total con contexto moderado.
  - Q3_K_M: ~3,9 GB de pesos, ~5-6 GB de VRAM.
  - Q4_K_M: ~4,8 GB de pesos, ~6-7 GB de VRAM (recomendada por el autor como "fast, recommended").
  - Q5_K_M: ~5,5 GB de pesos, ~7-8 GB de VRAM.
  - Q6_K: ~6,4 GB de pesos, ~8-9 GB de VRAM.
  - Q8_0: ~8,2 GB de pesos, ~10-11 GB de VRAM.
  - f16: ~15,3 GB de pesos, ~17-18 GB de VRAM (calificada por el autor como "overkill").
  - Añadir ~1,0-1,5 GB adicionales para el fichero mmproj si se usa la modalidad visual.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8.
  - Portátiles: RTX 3050/4050 con 6-8 GB para Q3-Q4.
  - Datacenter: A100, H100 solo necesarias para f16 o despliegues de alto throughput.
- ¿Cabe en consumer GPU? Sí, en la mayoría de GPUs modernas con 6 GB o más usando Q4_K_M o inferiores. Las cuantizaciones Q2-Q3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa generalizada para multimodal.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| ViCrit-7B-GGUF | 7,6B | no disponible | Sí (mmproj) | no disponible | Sí |
| LLaVA-1.5-7B | 7B | 4K (típico) | Sí | Llama 2 (uso comercial restringido) | Sí (TheBloke y otros) |
| Qwen2-VL-7B | 7B | 32K+ | Sí | Apache 2.0 (variantes) | Sí |
| InternVL2-8B | 8B | 8K+ | Sí | MIT (variantes) | Parcial |

La comparativa se ofrece a título orientativo: no se dispone de datos de rendimiento de ViCrit-7B para comparar numéricamente con estas alternativas. La principal ventaja de ViCrit-7B-GGUF es la disponibilidad de cuantizaciones estáticas completas (Q2 a f16) con proyector multimodal incluido; su desventaja es la falta de documentación pública sobre licencia, contexto y benchmarks, que sí está disponible en LLaVA, Qwen2-VL o InternVL2.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Verificar la licencia del modelo base zyang39/ViCrit-7B antes de cualquier despliegue en producción.
- Solo inglés: la etiqueta de idioma indica únicamente inglés; el rendimiento en castellano u otros idiomas es incierto.
- Documentación muy escasa: no hay información pública sobre contexto máximo, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación: como todo modelo generativo de 7B, puede producir descripciones o críticas visuales inexactas; no apto para decisiones críticas sin supervisión humana.
- Sesgos: no documentados, pero heredados previsiblemente de los datos de entrenamiento del modelo base.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar notablemente la calidad, especialmente en tareas visuales; el autor recomienda Q4_K_M o superiores.
- Sin cuantizaciones imatrix/weighted: el autor indica que no están disponibles, por lo que no se beneficia de la mejora de calidad típica de las cuantizaciones IQ ponderadas.
- Soporte multimodal limitado a llama.cpp: otros runtimes (vLLM, TGI) pueden no soportar el par GGUF + mmproj de este modelo.
- Fecha de actualización futura (2026-11-11): el repositorio muestra una fecha de actualización posterior a la actual; conviene verificar si los ficheros han cambiado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/ViCrit-7B-GGUF
- Modelo base: https://huggingface.co/zyang39/ViCrit-7B
- Página de descargas del autor: https://hf.tst.eu/model#ViCrit-7B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Web del autor (nethype GmbH): https://www.nethype.de/

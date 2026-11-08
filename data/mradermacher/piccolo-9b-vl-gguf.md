# mradermacher/Piccolo-9B-VL-GGUF

## Resumen

Piccolo-9B-VL-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Piccolo-9B-VL, desarrollado originalmente por AgentScope (agentscope-ai). Se trata de un modelo de lenguaje y visión de aproximadamente 9.197 millones de parámetros (9,2 B) que combina un transformer de lenguaje con un codificador visual, empaquetado por mradermacher para su uso con llama.cpp y herramientas compatibles con GGUF.

El modelo base resuelve tareas de comprensión de imagen y texto, generación conversacional y razonamiento multimodal. Su relevancia radica en que ofrece capacidades visión-lenguaje en un tamaño contenido (9 B) bajo licencia Apache 2.0, lo que permite desplegarlo en hardware de consumo mediante cuantizaciones de 4 a 8 bits. La versión GGUF incluye el proyector multimodal (mmproj) necesario para procesar imágenes.

Esta ficha describe la variante GGUF publicada por mradermacher, que no aporta pesos nuevos sino conversiones del modelo original. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, por lo que varios apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + codificador visual); detalles internos no disponibles |
| Parámetros totales | 9.197.093.888 (9,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un modelo multimodal de 9,2 B de parámetros que combina un backbone de lenguaje con un proyector visual (mmproj) para procesar imágenes junto a texto. La información proporcionada no detalla el tipo exacto de transformer, el número de capas, la dimensión oculta ni la arquitectura del codificador visual.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa u otras). La versión aquí descrita es una conversión estática a GGUF realizada por mradermacher; el autor indica que no ha generado cuantizaciones ponderadas con imatrix para este modelo.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y razonamiento visión-lenguaje mediante el proyector multimodal incluido (mmproj).
- Procesamiento de entradas multimodales imagen + texto en un único flujo conversacional.
- Despliegue local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, entre otros).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Descripción y etiquetado de imágenes en local: el modelo puede recibir una imagen junto a una instrucción de texto y generar descripciones, útil para catalogar bibliotecas de imágenes sin enviar datos a la nube.
- Asistencia en accesibilidad: generación de descripciones textuales de imágenes para lectores de pantalla, ejecutable en hardware de consumo con cuantización Q4_K_M.
- Extracción de información de documentos escaneados: combinación de OCR previo con razonamiento visual para responder preguntas sobre capturas, facturas o formularios.
- Moderación de contenido visual asistida: clasificación y descripción de imágenes para revisión humana en pipelines internos, aprovechando la licencia Apache 2.0.
- Prototipado de asistentes multimodales: integración en aplicaciones de escritorio o demos con llama.cpp y el mmproj incluido, sin necesidad de GPUs de datacenter.
- Análisis de capturas de pantalla en herramientas de soporte: el modelo puede interpretar la imagen de una interfaz y responder preguntas del usuario sobre ella en inglés.
- Investigación en visión-lenguaje a pequeña escala: modelo de 9 B cuantizable para experimentos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar caché KV ni el mmproj):
  - Q2_K: ~4,0 GB.
  - Q4_K_M: ~5,9 GB.
  - Q5_K_M: ~6,7 GB.
  - Q8_0: ~9,9 GB.
  - f16: ~18,5 GB.
  - Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) para el procesamiento de imágenes.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100/H100 no necesarias para este tamaño.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de 8 GB o más; Q8_0 requiere ~12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros frontends compatibles con GGUF; el uso con transformers requiere el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Piccolo-9B-VL-GGUF | 9,2 B | no disponible | Apache 2.0 | GGUF | Multimodal, solo inglés |
| Piccolo-27B-VL-GGUF | 27 B (según nombre) | no disponible | no disponible | GGUF | Variante mayor de la misma familia, cuantizada por mradermacher |
| Alternativas de 7-9 B visión-lenguaje | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- Idioma: la model card solo declara inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones de fidelidad.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Longitud de contexto: no especificada, lo que dificulta planificar cargas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad, especialmente en tareas visuales.
- El autor no ha publicado cuantizaciones ponderadas con imatrix; la calidad de las cuantizaciones estáticas puede ser inferior a la de variantes con imatrix.
- El repositorio es una conversión de terceros; para producción conviene validar contra el modelo base oficial.
- El procesamiento de imágenes requiere cargar el mmproj por separado, lo que añade complejidad de despliegue.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Piccolo-9B-VL-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-9B-VL
- Página de descargas del autor: https://hf.tst.eu/model#Piccolo-9B-VL-GGUF
- Variante mayor de la familia: https://huggingface.co/mradermacher/Piccolo-27B-VL-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

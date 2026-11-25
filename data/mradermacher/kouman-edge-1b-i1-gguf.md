# mradermacher/kouman-edge-1b-i1-GGUF

## Resumen

kouman-edge-1b-i1-GGUF es la versión cuantizada en formato GGUF del modelo kouman-edge-1b, desarrollado originalmente por Tree-AI-lab y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 1.235 millones de parámetros (1,2 B) diseñado específicamente para despliegue en el borde (edge computing) y dispositivos móviles, con soporte para cuatro idiomas: baoulé (bci), dioula (dyu), francés (fr) e inglés (en). Su enfoque en lenguas de Costa de Marfil lo convierte en una propuesta poco habitual dentro del ecosistema de modelos abiertos.

El modelo base emplea una arquitectura transformer de tipo decoder-only, presumiblemente derivada de la familia Llama 3.2 dada la licencia declarada (llama3.2). Con 1,2 B de parámetros, está pensado para ejecutarse en hardware modesto: teléfonos, Raspberry Pi, portátiles sin GPU dedicada o entornos con memoria muy limitada. La cuantización con imatrix (i1) de mradermacher permite reducir el peso del modelo hasta 0,5 GB en configuraciones agresivas, manteniendo una calidad aceptable para tareas conversacionales.

La relevancia de esta ficha radica en dos factores: por un lado, ofrece una vía práctica para desplegar un modelo multilingüe africano en dispositivos sin conectividad o con ancho de banda reducido; por otro, la licencia llama3.2 impone restricciones que conviene conocer antes de integrarlo en productos comerciales. El repositorio tiene 16 GB de tamaño total (sumando todas las variantes de cuantización) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (presumiblemente basada en Llama 3.2; no confirmado en la información disponible) |
| Parámetros totales | 1.235.814.432 (1,2 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (cuantización con imatrix) |
| Idiomas soportados | baoulé (bci), dioula (dyu), francés (fr), inglés (en) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer y su tamaño de 1,2 B de parámetros. La licencia llama3.2 y la nomenclatura sugieren una adaptación o fine-tuning sobre la familia Llama 3.2 de Meta, aunque no se confirma en la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada.

La innovación técnica destacable de esta ficha no está en el modelo base sino en el proceso de cuantización: mradermacher emplea cuantización con imatrix (importance matrix) de tipo i1, que calcula una matriz de importancia a partir de datos de calibración para preservar mejor los pesos relevantes durante la compresión. Esto permite generar variantes desde IQ1_S (0,5 GB) hasta Q6_K (1,1 GB), ofreciendo un abanico amplio de compromisos entre tamaño, velocidad y calidad. El repositorio incluye además el fichero imatrix (0,1 GB) para que otros puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en baoulé, dioula, francés e inglés.
- Razonamiento básico y respuesta a instrucciones, limitado por su tamaño de 1,2 B.
- Capacidad multilingüe centrada en lenguas de Costa de Marfil, un nicho poco cubierto por modelos mainstream.
- Ejecución en dispositivos de borde: móviles, SBC (Raspberry Pi, etc.) y portátiles sin GPU.
- Compatible con llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; improbable en un modelo de este tamaño.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistencia conversacional offline en zonas rurales de Costa de Marfil: el modelo puede desplegarse en un teléfono Android de gama media con una cuantización IQ4_XS (0,8 GB) para responder consultas en baoulé o dioula sin conexión a internet, algo crítico en regiones con cobertura limitada.
- Traducción asistida francés-baoulé/dioula: dado su soporte nativo de los cuatro idiomas, puede emplearse como borrador de traducción en aplicaciones de mensajería o atención al ciudadano, siempre con revisión humana por las limitaciones de un modelo de 1,2 B.
- Chatbot de atención al cliente para pymes locales: integrado vía llama.cpp en un servidor modesto o incluso en un portátil, permite gestionar consultas frecuentes en francés e inglés con latencia baja y sin costes de API.
- Prototipado rápido de aplicaciones de IA en el borde: gracias a su tamaño reducido y a la variedad de cuantizaciones, es útil para validar pipelines de inferencia en dispositivos antes de escalar a modelos mayores.
- Educación y alfabetización digital: puede servir como tutor conversacional básico en escuelas con hardware limitado, respondiendo preguntas en francés o en lenguas locales.
- Investigación lingüística computacional: útil para estudiar el comportamiento de modelos pequeños en lenguas de bajos recursos y comparar la calidad de distintas cuantizaciones sobre un mismo modelo base.
- Filtrado y clasificación de texto ligero: con un contexto presumiblemente corto, puede emplearse para tareas de etiquetado simple o resumen breve en entornos con recursos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (IQ1_S) y 1,1 GB (Q6_K) para los pesos; añadir entre 0,2 y 0,5 GB adicionales para el contexto y el estado de inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, etc.). También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU (Intel Iris Xe, Apple Silicon, Adreno).
- Cabe en dispositivos móviles: sí, con cuantizaciones IQ3 o IQ4 (0,7-0,9 GB) en teléfonos con 4 GB de RAM o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en un modelo de 1,2 B con cuantización Q4 en CPU moderna se espera un throughput del orden de decenas de tokens por segundo, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kouman-edge-1b-i1-GGUF | 1,2 B | no disponible | bci, dyu, fr, en | llama3.2 | GGUF |
| Llama 3.2 1B (Meta) | 1,2 B | 128 K | multilingüe (8 idiomas oficiales) | llama3.2 | safetensors, GGUF |
| Qwen2.5 1.5B | 1,5 B | 32 K | multilingüe (29 idiomas) | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B | 2,6 B | 8 K | multilingüe | Gemma Terms | safetensors, GGUF |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo kouman-edge-1b para contrastar con estas alternativas. Su principal diferenciador es el soporte nativo de baoulé y dioula, ausente en los modelos mainstream, a costa de una licencia más restrictiva que Qwen2.5 y un contexto presumiblemente menor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; un modelo entrenado con datos de Costa de Marfil y Francia puede presentar sesgos regionales y culturales no evaluados.
- Riesgo de alucinación: alto, como en cualquier modelo de 1,2 B; no debe usarse como fuente de verdad sin verificación.
- Limitaciones de contexto: no se especifica la longitud de contexto; en modelos de este tamaño suele ser corta (2 K-8 K tokens), lo que restringe conversaciones largas y documentos extensos.
- Limitaciones de idioma: aunque declara soporte de baoulé y dioula, la calidad real en estas lenguas de bajos recursos no está evaluada con benchmarks públicos.
- Restricciones de licencia: la licencia llama3.2 impone condiciones de uso (incluida la política de uso aceptable de Meta) y puede requerir atribución; conviene revisar los términos antes de uso comercial.
- Caveat para producción: el repositorio no registra descargas ni validación comunitaria; la calidad de las cuantizaciones i1 no ha sido auditada de forma independiente en este modelo concreto.
- El modelo base no incluye información sobre datos de entrenamiento, lo que dificulta evaluar riesgos de contaminación o sesgo.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/kouman-edge-1b-i1-GGUF
- Modelo base: https://huggingface.co/Tree-AI-lab/kouman-edge-1b
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/kouman-edge-1b-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#kouman-edge-1b-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/

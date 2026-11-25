# openamer-max/openamer-max-phone

## Resumen

OpenAmer-Phone es un modelo de lenguaje de 3.085.938.688 parámetros (aproximadamente 3,09B) desarrollado por openamer-max, un proyecto individual que construye una familia de asistentes denominada OpenAmer, organizada por destino de hardware (Watch, Phone, Tab, Desktop, Pro, Ultra). Este modelo concreto es el segundo escalón de la familia y está pensado para ejecutarse en teléfonos inteligentes y portátiles de forma totalmente offline. Se trata de un ajuste fino mediante QLoRA sobre Qwen/Qwen2.5-3B-Instruct, distribuido en formato GGUF cuantizado Q6_K con un tamaño de repositorio de 2,5 GB.

El modelo resuelve un problema muy acotado: actuar como asistente de producto que responde con hechos verificables sobre OpenAmer a partir de contexto suministrado (RAG), se niega honestamente cuando no sabe algo y delimita sus propias capacidades (sin generación de música, vídeo, telefonía ni soporte iOS). Está entrenado principalmente en alemán, con soporte de bosnio, croata, serbio e inglés, y prioriza la latencia (0,08-0,5 s, unos 110 tok/s en CPU) sobre la amplitud de conocimiento general.

Su relevancia radica en la combinación de licencia Apache-2.0, despliegue trivial vía Ollama o llama.cpp y un enfoque explícito en la honestidad y el reconocimiento de límites, medido con un conjunto congelado de 45 casos. No obstante, es un modelo de nicho: su conocimiento general es deliberadamente limitado y su utilidad fuera del dominio del producto es reducida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B-Instruct), ajuste fino QLoRA |
| Parámetros totales | 3.085.938.688 (~3,09B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q6_K (forma distribuida); otras cuantizaciones no disponibles |
| Idiomas soportados | de, bs, hr, sr, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors para el recuento de parámetros |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer decoder-only de 3,09B parámetros, y se ajusta mediante QLoRA en 4 bits con LoRA de rango r=32 y α=64 aplicado a las siete proyecciones, lo que resulta en 59,87 millones de parámetros entrenables (3,4 % del total). El conjunto de datos de entrenamiento consta de 2.890 ejemplos distribuidos en 11 categorías, que incluyen las categorías del modelo Watch, texto largo, plataforma y otras. No se especifica el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

La innovación destacable no es arquitectónica sino metodológica: el autor documenta un proceso de corrección por etapas dirigidas en lugar de ampliar datos. Concretamente, en la etapa 2 el modelo superaba 23/23 en el benchmark mientras afirmaba falsamente que "OpenAmer kann Musik generieren" e invertía la polaridad en una pregunta sobre Android/iOS; ambos fallos se corrigieron con etapas específicas. El modelo se distribuye como GGUF Q6_K listo para Ollama, con un Modelfile incluido en la release.

## Capacidades

- Generación de texto conversacional en alemán en respuestas de dos o tres frases.
- Respuesta a preguntas de producto a partir de contexto suministrado (RAG), identificándose correctamente.
- Negativa honesta ante preguntas desconocidas ("Das weiss ich nicht"), verificada en el conjunto de evaluación.
- Delimitación explícita de sus propios límites: sin generación de música, sin vídeo, sin telefonía, sin soporte iOS.
- Polaridad correcta en preguntas con negación (por ejemplo, aclarar que iOS no está soportado y Android sí).
- Aritmética de tres dígitos con respuesta inmediata.
- Respuestas en bosnio para formulaciones directas entrenadas.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio según la información disponible.

## Casos de uso

- Asistente de producto embebido en la app OpenAmer: el modelo responde preguntas frecuentes sobre el producto usando contexto recuperado por RAG, con latencia de 0,08-0,5 s que permite respuestas percibidas como instantáneas en un smartphone.
- Atención al cliente offline en dispositivos sin conectividad: al ejecutarse en CPU con ~110 tok/s y requerir unos 3,5 GB de RAM, puede desplegarse en teléfonos de gama media para resolver dudas de producto sin enviar datos a la nube.
- Filtro de honestidad y derivación a humano: el modelo se niega a inventar cuando no sabe, lo que lo hace adecuado como primera línea de triaje que escala a un agente humano en lugar de alucinar respuestas.
- Soporte multilingüe en los Balcanes: para usuarios de bosnio, croata y serbio con formulaciones cubiertas por el entrenamiento, puede responder consultas directas en su idioma junto a la interfaz en alemán.
- Cálculos rápidos de tres dígitos en flujos de atención: operaciones aritméticas simples resueltas al instante sin llamada a herramientas externas.
- Prototipado y evaluación de asistentes on-device: sirve como banco de pruebas para pipelines de RAG y para medir latencia y huella de memoria en hardware móvil antes de escalar a modelos mayores de la familia.
- Demostración educativa de ajuste fino QLoRA: el repositorio documenta el proceso, los conjuntos de evaluación congelados y los registros de prueba, útil para quienes estudian metodologías de evaluación anti-contaminación.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Conjunto congelado de 45 casos (producto) | 43/45 (95,6 %) |
| Conjunto congelado de 23 casos no vistos (sin contaminación) | 23/23 (100 %) |
| Precisión de tokens de respuesta (split held-out) | 98,76 % |
| Prueba fresca de 12 preguntas nunca vistas en entrenamiento | 12/12 (100 %) |
| Sonda en forma distribuida vía Ollama | 7/7 |
| Modelo base sin ajuste fino, mismo benchmark | 18/23 (+5 casos por entrenamiento) |
| Latencia | 0,08-0,5 s; ~110 tok/s en CPU |

Desglose por categorías del conjunto de 23 casos: hechos 7/7, paráfrasis 3/3, negativas 5/5, bosnio 3/3, negativas en bosnio 1/1, largo 1/1, corto 1/1, casos límite 2/2. Todas las mediciones se realizaron sobre la build publicada en una RTX 5060 Laptop (8 GB), con registros crudos incluidos en la release (`proof-*.json`). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- RAM estimada: ~3,5 GB para la cuantización Q6_K distribuida (2,5 GB de archivo).
- VRAM: no se especifica un requisito de VRAM para esta variante; el modelo está optimizado para CPU.
- GPU recomendadas: no disponible; las mediciones se hicieron en una RTX 5060 Laptop de 8 GB, pero el modelo está pensado para ejecución en CPU.
- Cabe en GPU de consumo: sí, por tamaño (2,5 GB de pesos), aunque no se documentan requisitos de VRAM específicos.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-phone`), llama.cpp (GGUF directo con Modelfile incluido), API compatible con endpoints.
- Throughput y latencia: ~110 tok/s en CPU y latencia de 0,08-0,5 s según la prueba documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| OpenAmer-Phone | 3,09B | no disponible | Apache-2.0 | Asistente de producto on-device, alemán/balcánico | GGUF, Ollama, HF |
| Qwen2.5-3B-Instruct (base) | 3,09B | no disponible | Apache-2.0 | Asistente general multilingüe | safetensors, GGUF, múltiples runtimes |
| OpenAmer-Watch | ~0,6B | no disponible | Apache-2.0 (según familia) | Asistente para smartwatch | GGUF, HF |
| OpenAmer-Tab | ~7,6B | no disponible | Apache-2.0 (según familia) | Asistente para tablet | GGUF, HF |

La comparación directa con el modelo base es la más informativa: OpenAmer-Phone mejora en 5 casos (18/23 a 23/23) el benchmark específico de producto, a costa de conocimiento general (el propio autor documenta fallos como responder "Génova" a la capital de Italia). Frente a los otros escalones de la familia, ofrece un equilibrio entre huella (2,5 GB) y precisión en el dominio (43/45), mientras que Watch ocupa menos memoria pero rinde 45/45 en el conjunto de 45 casos y Tab rinde 42/45 con 4,4 GB.

## Limitaciones y advertencias

- Conocimiento general poco fiable: el autor documenta que puede responder "Génova" a la capital de Italia.
- Sin multiplicación de cuatro dígitos fiable: 86 × 83 devuelve 7118 en lugar de 7138.
- Bosnio limitado a formulaciones entrenadas; las variantes no vistas degradan.
- El texto libre es correcto en contenido pero no siempre en estilo.
- No es adecuado como chatbot para ensayos o texto largo; el presupuesto de 3B implica compensaciones entre habilidades.
- Riesgo de alucinación mitigado pero no eliminado: el propio autor documenta que en una etapa intermedia el modelo inventó una capacidad de generación de música pese a superar el benchmark.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct también es Apache-2.0, sin restricciones adicionales conocidas.
- Proyecto individual con 858 descargas y 1 like en el momento de la consulta; madurez y soporte comunitario limitados.
- Longitud de contexto no documentada, lo que dificulta planificar cargas RAG con documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-phone
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo Watch: https://huggingface.co/openamer-max/openamer-max-watch
- Página del proyecto: https://openamer-max.github.io
- Pasaporte de dispositivos (requisitos por modelo): https://openamer-max.github.io/geraetepass/
- Código fuente: https://github.com/openamer-max/openamer
- Demo en el navegador: https://openamer-max-openamer-max-demo.hf.space
- API de traducción (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Conjunto de benchmark de 45 casos: https://huggingface.co/datasets/openamer-max/openamer-max-benchmark
- Registro en Ollama: https://ollama.com/amersacirovic/openamer-max-phone

# mradermacher/Smaug-Audio-Decisions-0.7B-GGUF

## Resumen

Smaug-Audio-Decisions-0.7B-GGUF es una colección de cuantizaciones en formato GGUF del modelo abacusai/Smaug-Audio-Decisions-0.7B, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos para inferencia local. El modelo base es un modelo multimodal de audio desarrollado por Abacus.AI, orientado a la toma de decisiones tipadas (typed-decisions) a partir de entradas de audio, con etiquetas que apuntan a calibración y despliegue on-device (CoreML). Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El interés de esta ficha reside en que se trata de un modelo pequeño y especializado: el repositorio de safetensors declara 271.002.648 parámetros reales, aunque el nombre comercial lo etiqueta como "0.7B". El paquete incluye tanto los pesos cuantizados del modelo principal como un proyector multimodal (mmproj) que gestiona la entrada de audio. Su licencia Apache 2.0 y su tamaño reducido lo convierten en un candidato para integración en aplicaciones locales de clasificación y decisión basada en audio.

La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card del repositorio GGUF es la plantilla estándar de mradermacher y no incluye detalles técnicos del modelo original. Todo lo que se detalla a continuación se limita a lo verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de audio con proyector mmproj) |
| Parametros totales | 271.002.648 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Las etiquetas del repositorio indican que se trata de un modelo multimodal con capacidad de procesar audio (tag `audio`), con un proyector multimodal separado (`mmproj`) que en llama.cpp suele corresponder a un adaptador que conecta el codificador de audio con el modelo de lenguaje. El nombre "Decisions" y las etiquetas `typed-decisions` y `calibration` sugieren que el modelo está especializado en producir decisiones estructuradas o clasificaciones tipadas a partir de audio, más que en generación libre de texto.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La mención a `coreml` y `on-device` en las etiquetas apunta a un diseño pensado para inferencia local eficiente, pero no se detalla cómo se consigue.

## Capacidades

- Procesamiento de entrada de audio mediante el proyector multimodal incluido en el repositorio (mmproj-Q8_0 o mmproj-f16).
- Toma de decisiones tipadas (typed-decisions): generación de salidas estructuradas o clasificaciones a partir de audio, según las etiquetas del modelo.
- Calibración: la etiqueta `calibration` sugiere que el modelo está ajustado para producir puntuaciones de confianza o decisiones calibradas, aunque no se documenta el método.
- Conversación: la etiqueta `conversational` indica soporte de interacción conversacional, presumiblemente en inglés.
- Despliegue on-device: orientado a ejecución local, con soporte declarado para CoreML en el ecosistema del modelo base.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Clasificación de audio en local: el modelo puede recibir una entrada de audio y emitir una decisión tipada (por ejemplo, una categoría o etiqueta) sin necesidad de enviar datos a la nube, gracias a su tamaño reducido y a los cuantizados de 0,2 a 0,4 GB.
- Moderación de contenido en dispositivos: integrado en aplicaciones móviles o de escritorio, puede analizar fragmentos de audio y producir decisiones estructuradas para filtrar o marcar contenido, aprovechando la orientación on-device y CoreML.
- Automatización de atención al cliente por voz: en un pipeline con un ASR previo o directamente sobre audio, el modelo puede clasificar la intención del cliente y generar una decisión tipada que active un flujo de soporte, siempre que el contexto requerido encaje en su ventana (no documentada).
- Asistentes de voz embebidos: en dispositivos con recursos limitados, el cuantizado Q4_K_M (0,3 GB) permite ejecutar el modelo junto a otras tareas, tomando decisiones de enrutamiento o activación a partir de comandos de voz.
- Análisis de llamadas y reuniones: procesamiento por lotes de grabaciones para extraer decisiones o etiquetas estructuradas (por ejemplo, resultado de una llamada), usando llama.cpp en servidores con CPU o GPU modestas.
- Prototipado de investigación en audio y decisiones: al ser Apache 2.0 y de pequeño tamaño, sirve como base para experimentos de calibración y evaluación de modelos de decisión multimodal sin grandes presupuestos de cómputo.
- Integración en pipelines de CI/CD para pruebas de audio: verificar que un cambio en un sistema de voz no altera las decisiones del modelo, ejecutando el cuantizado Q8_0 en runners estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,2 GB (Q2_K) y 0,4 GB (Q8_0) para los pesos del modelo; el proyector multimodal añade 0,7 GB (mmproj-Q8_0) o 1,1 GB (mmproj-f16). En total, menos de 2 GB en el peor caso con f16.
- GPU recomendadas: cualquier GPU consumer con al menos 2-3 GB de VRAM libre; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 o incluso en GPUs integradas con memoria unificada.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna e incluso en CPU, dado el tamaño reducido.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se importa el GGUF), servidores compatibles con GGUF; el modelo base usa transformers. No se documenta soporte de vLLM o TGI para esta variante.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Smaug-Audio-Decisions-0.7B (este) | 271 M (reales) | no disponible | Apache 2.0 | GGUF / safetensors | Multimodal de audio, decisiones tipadas |
| Alternativas de audio de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |
| Alternativas de decisión tipada | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

No se dispone de datos objetivos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto, lo que impide garantizar el manejo de audios largos o conversaciones multi-turno extensas.
- Alucinación: al ser un modelo de decisión y no de generación libre, el riesgo se traslada a decisiones incorrectas o mal calibradas; no hay datos de calibración publicados que lo cuantifiquen.
- Sesgos: no se documentan sesgos conocidos ni la composición del dataset de entrenamiento, por lo que no es posible evaluar su comportamiento en dominios sensibles.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base (abacusai/Smaug-Audio-Decisions-0.7B) y de los componentes multimodales.
- Producción: la ausencia de benchmarks, de documentación de arquitectura y de garantías de calibración hace desaconsejable su uso en producción sin una evaluación propia exhaustiva sobre el dominio objetivo.
- Repositorio: 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente y sin validación comunitaria.
- Cuantizados: los cuantizados de menor precisión (Q2_K, Q3_K) pueden degradar la calidad de las decisiones; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Smaug-Audio-Decisions-0.7B-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Audio-Decisions-0.7B
- Página de descargas del autor: https://hf.tst.eu/model#Smaug-Audio-Decisions-0.7B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Graph de calidad de cuantizados (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizados (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

# mradermacher/BharatGPT-3B-Indic-GGUF

## Resumen

BharatGPT-3B-Indic-GGUF es la versión cuantizada en formato GGUF del modelo CoRover/BharatGPT-3B-Indic, un modelo conversacional de aproximadamente 3.212 millones de parámetros (3,2 B) desarrollado originalmente por CoRover y distribuido en formato compatible con llama.cpp por el usuario mradermacher. El modelo está orientado a conversación multilingüe en lenguas índicas: hindi, panyabí, guyaratí, canarés, maratí, telugu, malabar, oriya, tamil, urdu, bengalí e inglés.

La relevancia de esta ficha radica en que ofrece una vía práctica de despliegue local de un modelo conversacional índico de tamano medio: las cuantizaciones GGUF permiten ejecutarlo en hardware de consumo y en entornos sin GPU dedicada, algo que el modelo original en transformers no facilita con la misma sencillez. El repositorio incluye 13 cuantizaciones estáticas (desde Q2_K de 1,5 GB hasta f16 de 6,5 GB), lo que cubre desde escenarios de bajos recursos hasta despliegues de mayor fidelidad numérica.

No se dispone de información publicada sobre la arquitectura interna, el contexto máximo ni el proceso de entrenamiento en la documentación proporcionada; esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base CoRover/BharatGPT-3B-Indic; transformer presumible, no confirmado) |
| Parametros totales | 3.212.749.888 (~3,2 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); existen cuantizaciones imatrix/weighted en el repo i1 |
| Idiomas soportados | hi, pa, gu, kn, mr, te, ml, or, ta, ur, bn, en |
| Licencia | other (ver limitaciones) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible la arquitectura interna del modelo base CoRover/BharatGPT-3B-Indic: no consta si es un transformer decoder-only denso, ni el número de capas, dimensiones ocultas o cabezas de atención. El recuento de parámetros (3.212.749.888) procede de los pesos en safetensors del modelo base y es consistente con un modelo denso de ~3,2 B. Tampoco se dispone de datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF, DPO o instrucción supervisada.

Lo que sí documenta el repositorio es el proceso de cuantización: se trata de cuantizaciones estáticas generadas con llama.cpp (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin pesos imatrix en este repo; el autor remite a mradermacher/BharatGPT-3B-Indic-i1-GGUF para las variantes weighted/imatrix, que suelen ofrecer mejor calidad por bit en tamanos bajos. No hay innovaciones técnicas destacables documentadas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Cobertura multilingüe en 12 idiomas: hindi, panyabí, guyaratí, canarés, maratí, telugu, malabar, oriya, tamil, urdu, bengalí e inglés.
- Respuesta en lenguas índicas con alfabetos propios (devanagari, gurmuji, guyaratí, canarés, télugu, malabar, oriya, tamil, urdu, bengalí), lo que lo hace útil para usuarios que no operan en inglés.
- No consta soporte de tool calling ni function calling en la información disponible.
- No consta soporte explícito de agentes o razonamiento multi-paso.
- No consta modo thinking, visión ni audio.
- Capacidades de código y matemáticas: no documentadas específicamente; no deben asumirse.

## Casos de uso

- Atención al cliente en lenguas índicas: el modelo puede gestionar conversaciones multi-turno en hindi, tamil, bengalí o urdu, lo que permite desplegar un asistente que responda en el idioma del usuario sin pasar por traducción intermedia. Adecuado por su cobertura de 12 idiomas y su tamano contenido para inferencia local.
- Despliegue en hardware de consumo o sin GPU: con cuantizaciones Q4_K_M (2,1 GB) o Q5_K_M (2,4 GB) puede ejecutarse en portátiles con 8-16 GB de RAM vía llama.cpp u Ollama, habilitando prototipos conversacionales índicos sin infraestructura cloud.
- Asistente educativo multilingüe: para tutoría o resolución de dudas en escuelas que operan en varios idiomas regionales de la India, donde un modelo de 3 B cuantizado a Q4 cabe en equipos modestos y responde en la lengua del estudiante.
- Chatbot de soporte en kioscos o entornos con conectividad limitada: al ser un GGUF ejecutable offline, puede integrarse en dispositivos edge para atención en idiomas regionales sin depender de APIs externas.
- Investigación en NLP índico: como punto de partida para evaluar calidad conversacional en lenguas de bajos recursos, comparando cuantizaciones (Q4 vs Q8 vs f16) y midiendo degradación por cuantización en cada idioma.
- Traducción asistida y reformulación entre inglés y lenguas índicas: aunque no es un modelo de traducción dedicado, su entrenamiento multilingüe permite tareas de paráfrasis y adaptación de registro entre inglés e idiomas índicos en flujos conversacionales.
- Generación de contenido localizado: redacción de respuestas, resúmenes o mensajes en lenguas regionales para aplicaciones de mensajería o portales gubernamentales que requieren cobertura lingüística amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~1,5 GB; Q3_K_M ~1,8 GB; IQ4_XS ~1,9 GB; Q4_K_M ~2,1 GB; Q5_K_M ~2,4 GB; Q6_K ~2,7 GB; Q8_0 ~3,5 GB; f16 ~6,5 GB. Añadir overhead de contexto y del runtime (típicamente 1-2 GB adicionales según longitud de contexto).
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060); ≥6 GB para Q8_0; ≥8 GB para f16. En GPUs de datacenter (A100, H100) el modelo es sobredimensionado para su tamano y no aprovecha su capacidad; su uso típico es consumer o edge.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4-8 GB de VRAM para cuantizaciones Q4-Q8; también en CPU con 8 GB de RAM para Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (p. ej. llama-cpp-python, text-generation-webui). El repositorio incluye la etiqueta `endpoints_compatible`. Para el modelo base en transformers se requiere el stack de Hugging Face.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización. Como referencia cualitativa, el autor marca Q4_K_S/Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", pero no se publican cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas índicos | Licencia | Formato |
|---|---|---|---|---|---|
| BharatGPT-3B-Indic (esta ficha, GGUF) | ~3,2 B | no disponible | 11 índicos + inglés | other | GGUF |
| CoRover/BharatGPT-3B-Indic (base) | ~3,2 B | no disponible | 11 índicos + inglés | other | safetensors |
| Alternativas comparables de tamano similar | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables verificables en la información proporcionada; no se incluyen cifras de rendimiento para evitar invenciones.

## Limitaciones y advertencias

- Licencia "other": no es una licencia estándar (Apache, MIT, etc.); es imprescindible revisar los términos del modelo base CoRover/BharatGPT-3B-Indic antes de cualquier uso comercial, ya que pueden existir restricciones adicionales no reflejadas en la etiqueta.
- Riesgo de alucinación: como todo modelo generativo de 3 B, puede producir información factual incorrecta con alta confianza; no debe usarse como fuente de verdad sin verificación.
- Contexto máximo desconocido: al no documentarse la longitud de contexto, no se debe asumir una ventana larga; conviene validar empíricamente el comportamiento en conversaciones multi-turno extensas.
- Cobertura idiomática desigual: aunque se listan 12 idiomas, no hay datos públicos sobre calidad por idioma; es probable que hindi e inglés estén mejor representados que lenguas con menos recursos (oriya, malabar).
- Degradación por cuantización: las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso práctico, y Q6_K/Q8_0 cuando la fidelidad sea crítica.
- Sin datos de entrenamiento ni de sesgos publicados: no es posible evaluar sesgos de género, casta, religión o geopolíticos específicos del corpus índico; se recomienda auditoría previa en producción.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse para pipelines que requieran function calling.
- Modelo de nicho con pocas descargas (501) y likes (4): menor validación comunitaria que modelos mainstream; conviene probar exhaustivamente antes de adopción en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BharatGPT-3B-Indic-GGUF
- Modelo base: https://huggingface.co/CoRover/BharatGPT-3B-Indic
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/BharatGPT-3B-Indic-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#BharatGPT-3B-Indic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

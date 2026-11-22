# Bonenk/indic-translate-GGUF

## Resumen

Indic-translate-GGUF es la versión cuantizada para llama.cpp del modelo bodhan-ai/indic-translate, desarrollado por Bodhan AI (IITM Bodhan-AI Foundation, Centro de Excelencia para IA en Educación del Ministerio de Educación del Gobierno de India). El modelo resuelve un problema concreto: la traducción de alta calidad entre el inglés y 15 lenguas índicas (hindi, bengalí, tamil, telugu, kannada, malabar, maratí, guyaratí, panyabí, oriya, asamés, urdu, nepalí, cingalés y sánscrito), una cobertura lingüística que los modelos multilingües generalistas suelen tratar de forma superficial.

El modelo original emplea la arquitectura Gemma4ForConditionalGeneration, que incluye torres de visión y audio; sin embargo, esta conversión GGUF conserva únicamente el decodificador de texto (arquitectura `gemma4`, 684 tensores), ya que las torres multimodales no aportan valor a una carga de trabajo de traducción. Cuenta con 7.463.019.050 parámetros totales y el modelo original anuncia soporte de hasta 32.000 tokens de entrada, lo que permite traducir documentos completos en una sola petición.

La relevancia de esta ficha radica en que ofrece un pipeline de traducción especializado, ejecutable en hardware de consumo mediante cuantización Q4_K_M (5,30 GB), con una licencia que permite uso comercial pero restringe el hosting de terceros. Es una opción práctica para equipos que necesitan traducción inglés-índico sin depender de APIs propietarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma4 (decodificador de texto; el modelo original es Gemma4ForConditionalGeneration con torres de visión y audio, descartadas en esta conversión) |
| Parámetros totales | 7.463.019.050 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.000 tokens de entrada según el modelo original |
| Tipos de cuantización | Q4_K_M (5,30 GB), Q6_K (6,17 GB), Q8_0 (7,97 GB), F16 (14,93 GB) |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or, as, ur, ne, si, sa |
| Licencia | Indic Open Model License v1.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La conversión se basa en los pesos del modelo bodhan-ai/indic-translate en la revisión `3c5c3b4e2747b0fca133accf077132326c88b267`. El modelo original es un transformer de tipo Gemma4 con torres multimodales (visión y audio); el GGUF resultante contiene solo el decodificador de texto, con arquitectura declarada `gemma4` y 684 tensores. Se trata, por tanto, de un modelo denso de aproximadamente 7.460 millones de parámetros, sin mezcla de expertos.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado específico para traducción. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Los cuatro ficheros GGUF fueron validados por el cuantizador con `llama-cli` build b11798-9febe63d5, lo que confirma su correcta carga y generación.

## Capacidades

- Traducción de texto entre inglés y 15 lenguas índicas, con instrucción explícita del idioma destino en el prompt.
- Procesamiento de documentos completos en una sola petición, gracias al contexto de hasta 32.000 tokens del modelo original.
- Generación de texto conversacional en formato chat (etiqueta `conversational`), compatible con plantillas Jinja mediante `--jinja`.
- Soporte de servidor compatible con la API de OpenAI a través de `llama-server` (endpoint `/v1/chat/completions`).
- Ejecución determinista con `temperature 0`, adecuada para tareas de traducción donde se busca consistencia.
- Capacidades multimodales (visión y audio) no disponibles en esta conversión: solo texto.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Traducción de documentación técnica al hindi: el modelo acepta instrucciones del tipo "Translate the following text into Hindi: ..." y puede procesar secciones extensas en una sola petición gracias al contexto de 32.000 tokens, lo que evita fragmentar manuales y perder coherencia terminológica.
- Localización de interfaces y contenidos para mercados índicos: con 15 idiomas de destino (bengalí, tamil, telugu, etc.) y cuantización Q4_K_M de 5,30 GB, se puede desplegar en un servidor modesto para traducir cadenas de producto de forma por lotes.
- Atención al cliente multilingüe en India: integrado en `llama-server` con la API compatible de OpenAI, el modelo puede traducir consultas de usuarios en lenguas índicas al inglés para su procesamiento posterior, y traducir las respuestas de vuelta al idioma del cliente.
- Traducción de literatura y contenido editorial: la cuantización Q8_0 (7,97 GB) o F16 (14,93 GB) ofrece calidad prácticamente sin pérdida para textos donde la fidelidad estilística es crítica, como sánscrito o nepalí.
- Investigación lingüística y creación de corpus paralelos: el modelo permite generar traducciones de referencia entre inglés y lenguas de bajos recursos como oriya, asamés o cingalés, facilitando la construcción de datasets alineados.
- Procesamiento de documentos legales o administrativos: la ventana de 32.000 tokens permite traducir contratos o expedientes completos sin truncamientos, con la ventaja de que la inferencia local mantiene los datos sensibles fuera de servicios de terceros.
- Despliegue en hardware de consumo para prototipado: con Q4_K_M en una GPU de consumo se puede validar un pipeline de traducción antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GB con Q4_K_M, 6,5-7 GB con Q6_K, 8,5-9 GB con Q8_0 y 15-16 GB con F16 (incluyendo overhead de contexto y caché KV).
- GPU recomendadas: NVIDIA RTX 4090, A100 o H100 para máximo throughput; RTX 3060 de 12 GB o RTX 4070 para Q4_K_M y Q6_K.
- Cabe en GPU de consumo: sí, Q4_K_M y Q6_K en tarjetas de 8-12 GB; Q8_0 requiere 12 GB o más; F16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), con soporte de `--ngl 99` para descargar todas las capas en GPU y `--jinja` para plantillas de chat. Compatible con endpoints de la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas índicos | Licencia | Formato |
|---|---|---|---|---|---|
| Bonenk/indic-translate-GGUF | 7,46 B | hasta 32k (según modelo original) | 15 lenguas índicas + inglés | Indic Open Model License v1.0 (restringe hosting de terceros) | GGUF |
| bodhan-ai/indic-translate (original) | 7,46 B | hasta 32k | 15 lenguas índicas + inglés | Indic Open Model License v1.0 | safetensors (pesos originales) |
| Alternativas de traducción multilingüe generalistas | no disponible | no disponible | cobertura parcial | variable | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: las capacidades de visión y audio del modelo original no están presentes en esta conversión GGUF.
- Riesgo de alucinación inherente a los modelos generativos; en traducción puede manifestarse como adiciones, omisiones o cambios de sentido, especialmente en lenguas de bajos recursos como oriya, asamés o sánscrito.
- Sesgos potenciales no documentados en la información disponible; al estar entrenado con datos mayoritariamente en inglés e índico, puede reflejar sesgos culturales o lingüísticos de esas fuentes.
- La licencia Indic Open Model License v1.0 permite uso y redistribución, incluido el comercial, pero restringe el hosting de terceros (API o inferencia alojada) sin aprobación previa por escrito del licenciante, y condiciona el uso a muy gran escala en productos.
- Este repositorio es únicamente una descarga de pesos: no se habilita ningún endpoint de inferencia.
- El prompt debe nombrar explícitamente el idioma destino; no se documenta detección automática del idioma de destino.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bonenk/indic-translate-GGUF
- Modelo base: https://huggingface.co/bodhan-ai/indic-translate
- Licencia Indic Open Model License v1.0: https://github.com/Bodhan-AI/bodhan-model-info/blob/main/licenses/indic-open-model-license/v1/Indic_Open_Model_License.md
- Bodhan AI: https://bodhan.ai
- Perfil del cuantizador: https://huggingface.co/Bonenk

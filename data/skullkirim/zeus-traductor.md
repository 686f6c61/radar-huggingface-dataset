# skullkirim/zeus-traductor

## Resumen

Zeus Traductor (v8) es un modelo de traducción automática neuronal desarrollado por skullkirim para el proyecto Traductor Zeus de PanLabStudios, una aplicación orientada a viajeros que traduce voz y texto sin conexión a internet en 36 idiomas. Se trata de un ajuste fino mediante LoRA del modelo base tencent/Hy-MT2-1.8B (Apache 2.0), posteriormente cuantizado a GGUF en dos variantes (Q4_K_M y Q8_0) para su ejecución con llama.cpp en dispositivos de consumo, incluidos teléfonos móviles.

El modelo resuelve un problema concreto: la traducción multilingüe offline de baja latencia en hardware modesto. Con 1.791.080.448 parámetros totales (aproximadamente 1,8 mil millones), se posiciona en la gama de modelos pequeños optimizados para traducción, lo que permite desplegarlo en entornos sin conectividad o con requisitos estrictos de privacidad. La versión v8 incorpora además aprendizaje por destilación desde tencent/Hy-MT2-7B, con traducciones filtradas mediante la métrica COMET.

Su relevancia actual radica en la combinación de licencia permisiva (Apache 2.0), soporte para 36 idiomas (incluidos cantonés, tibetano y uigur) y formatos GGUF listos para producción en llama.cpp, lo que lo hace adecuado tanto para aplicaciones móviles como para servicios de traducción autoalojados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de tencent/Hy-MT2-1.8B; detalles específicos de la arquitectura del modelo base no disponibles en la información proporcionada) |
| Parámetros totales | 1.791.080.448 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M y Q8_0 (GGUF) |
| Idiomas soportados | 36: es, en, zh, ja, ko, vi, th, id, ms, tl, hi, pt, fr, de, it, ru, tr, ar, nl, pl, yue, uk, cs, he, fa, ur, bn, mr, ta, te, gu, km, my, bo, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de tencent/Hy-MT2-1.8B, un transformer de aproximadamente 1,8 mil millones de parámetros especializado en traducción automática. Sobre esta base se aplicó un ajuste fino con LoRA, cuyo resultado se cuantizó a GGUF en dos variantes: Q4_K_M, orientada a velocidad y compatibilidad con cualquier dispositivo móvil, y Q8_0, orientada a precisión en equipos con 8 GB de RAM o más. La información disponible no detalla la composición exacta del dataset de ajuste, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La versión v8 incorpora además aprendizaje a partir de tencent/Hy-MT2-7B, el modelo hermano de mayor tamaño, mediante traducciones generadas por este y filtradas con la métrica COMET, lo que constituye una forma de destilación de conocimiento. Los datos de entrenamiento declarados provienen de Tatoeba (CC BY 2.0 FR). El modelo utiliza la misma plantilla de prompt que Hy-MT: `Translate the following segment into <Language>, without additional explanation.\n\n<texto>`, con variante en chino para chino, cantonés, tibetano y uigur.

## Capacidades

- Traducción automática de texto entre 36 idiomas, incluidos pares con lenguas de bajos recursos como cantonés (yue), tibetano (bo) y uigur (ug).
- Traducción offline sin conexión a internet, gracias a su formato GGUF y su tamaño reducido.
- Ejecución en llama.cpp, con compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de conversación (tag `conversational`), lo que permite su uso en interfaces de chat o asistentes de viaje.
- Integración en aplicaciones móviles mediante las cuantizaciones Q4_K_M y Q8_0.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio o modo de razonamiento explícito.

## Casos de uso

- Aplicación de viaje offline: integración en la app Traductor Zeus para traducir voz y texto sin conectividad, usando la variante Q4_K_M en teléfonos de gama media y Q8_0 en dispositivos con 8 GB de RAM o más.
- Traducción de señalética y menús en viajes: el modelo puede procesar fragmentos cortos de texto en 36 idiomas, incluidos destinos con lenguas poco cubiertas por otros traductores (cantonés, tibetano, uigur).
- Asistencia conversacional en tiempo real: gracias al tag `conversational`, puede gestionar intercambios multi-turno en una app de asistencia al viajero, traduciendo intervenciones sucesivas entre el usuario y su interlocutor local.
- Servicio de traducción autoalojado: despliegue con llama.cpp en servidores modestos para ofrecer una API de traducción interna con licencia Apache 2.0, sin dependencia de proveedores externos.
- Traducción de documentación y contenido multilingüe: uso en pipelines de localización para volcar textos entre los 36 idiomas soportados, con la ventaja de la licencia permisiva para uso comercial.
- Privacidad y cumplimiento normativo: al ejecutarse en local, permite traducir contenido sensible (médico, legal, comunicaciones personales) sin enviar datos a servicios en la nube.
- Prototipado e investigación en traducción de bajos recursos: útil para experimentar con pares lingüísticos poco representados en modelos comerciales, partiendo de una base abierta y cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la variante Q4_K_M ocupa aproximadamente 1,1-1,2 GB en disco y requiere un margen similar de memoria en ejecución; la variante Q8_0 ronda los 2 GB y el autor recomienda al menos 8 GB de RAM en el dispositivo.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon y GPUs integradas con suficiente memoria compartida.
- Compatibilidad con GPU de consumo: sí, con cualquier GPU con al menos 2-3 GB de VRAM libre para Q8_0; Q4_K_M puede ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), con compatibilidad declarada con endpoints; no se mencionan integraciones específicas con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|---|
| Zeus Traductor v8 | 1,79 B | No disponible | 36 | Apache 2.0 | GGUF (Q4_K_M, Q8_0) | Ajuste LoRA de Hy-MT2-1.8B, orientado a offline |
| tencent/Hy-MT2-1.8B | ~1,8 B | No disponible | No disponible | Apache 2.0 | Safetensors (base) | Modelo base sin ajuste; no optimizado para GGUF móvil |
| tencent/Hy-MT2-7B | ~7 B | No disponible | No disponible | Apache 2.0 | Safetensors (base) | Mayor tamaño y presumiblemente mayor calidad; requiere más recursos y no está cuantizado para móvil |

## Limitaciones y advertencias

- El modelo es un ajuste fino de un modelo base pequeño (1,8 B), por lo que su calidad en pares lingüísticos complejos o textos largos puede ser inferior a la de modelos de mayor tamaño.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita la planificación de casos de uso con documentos extensos.
- Riesgo de alucinación y de traducciones incorrectas en idiomas de bajos recursos (tibetano, uigur, cantonés) o en dominios especializados, dado el origen de los datos (Tatoeba) y la falta de benchmarks publicados.
- Los datos de entrenamiento provienen de Tatoeba, un corpus colaborativo, lo que puede introducir sesgos y errores de calidad en determinados pares de idiomas.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantías ni documentación sobre el proceso de filtrado de datos más allá de la mención a COMET.
- El modelo está diseñado específicamente para traducción; no debe emplearse como modelo generalista de razonamiento o generación creativa.
- Solo se distribuyen pesos GGUF; no se ofrecen safetensors del ajuste fino, lo que dificulta la reproducción o el reentrenamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skullkirim/zeus-traductor
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Modelo de destilación: https://huggingface.co/tencent/Hy-MT2-7B
- Corpus Tatoeba: https://tatoeba.org
- llama.cpp: https://github.com/ggml-org/llama.cpp

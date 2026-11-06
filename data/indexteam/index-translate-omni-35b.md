# IndexTeam/Index-Translate-omni-35B

## Resumen

Index-Translate-Omni 35BA3B es un modelo multimodal de traducción desarrollado por IndexTeam, publicado en Hugging Face bajo el identificador `IndexTeam/Index-Translate-omni-35B`. Su propósito es unificar en un único modelo la traducción de texto, la traducción de imágenes, el reconocimiento automático de voz (ASR) y la traducción bidireccional chino-inglés por voz. Se presenta como la variante de mayor tamaño de la familia Index-Translate-Omni, junto a versiones de 2B y 9B parámetros.

La nomenclatura "35BA3B" indica una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, lo que sitúa el coste de inferencia cerca de un modelo denso de 3B. La model card menciona que el modelo parte de Qwen3.5 como base (las comparativas de imagen usan Qwen3.5-2B, Qwen3.5-9B y Qwen3.5-35B-A3B como referencia), lo que sugiere una arquitectura transformer con atención estándar y un decodificador multimodal.

El modelo es relevante porque aborda la traducción multimodal (texto, imagen y voz) con restricciones de terminología, formato y estilo, y porque su variante MoE reduce el coste de despliegue frente a un denso de 35B. No obstante, en el momento de redactar esta ficha el repositorio está en proceso de subida de pesos (6.8 GB en el repo, aviso explícito de "upload in progress"), por lo que la disponibilidad efectiva de pesos completos no está confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); base derivada de Qwen3.5-35B-A3B |
| Parametros totales | 35B (según nomenclatura 35BA3B) |
| Parametros activos | ~3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo PyTorch, 6.8 GB, pesos en proceso de subida) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es de tipo MoE con 35B parámetros totales y ~3B activos, y que reutiliza la base Qwen3.5-35B-A3B (las tablas de imagen comparan explícitamente contra Qwen3.5-35B-A3B). La model card menciona que las tareas de voz "comparten un tronco de texto congelado" (共享冻结文本主干), lo que implica que el modelo congela el backbone textual y añade cabezales o adaptadores específicos para ASR y traducción de voz. También se menciona una "configuración de frontend independiente" para el ASR en chino en la variante 35BA3B, distinta de la configuración "native" usada en el resto de tareas de voz.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La model card remite a un documento `NATIVE_INFERENCE.md` para instrucciones de inferencia, pero su contenido no está incluido en la información disponible.

## Capacidades

- Traducción de texto multilingüe con soporte de restricciones de terminología, formato y estilo (según la model card, "术语、格式和风格约束").
- Traducción de imágenes (image-to-text): extracción y traducción del texto contenido en imágenes.
- Reconocimiento automático de voz (ASR) en chino e inglés.
- Traducción bidireccional de voz chino-inglés (speech-to-speech translation).
- Capacidades multimodales combinadas: imagen y audio como entradas, texto como salida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Traducción de documentación técnica con glosario: el modelo acepta restricciones de terminología y formato, por lo que puede usarse para traducir manuales o documentación de producto manteniendo términos técnicos consistentes entre zh y en.
- Localización de interfaces y contenido web: la capacidad de traducción de imágenes permite traducir capturas de pantalla, infografías o material promocional renderizado, útil en flujos de localización que incluyen assets gráficos.
- Subtitulado y transcripción bilingüe: el ASR en chino e inglés junto con la traducción de voz permite generar subtítulos y transcripciones traducidas en reuniones o grabaciones.
- Atención al cliente en centros de contacto bilingües: la traducción de voz zh↔en puede integrarse en un pipeline de telefonía para asistir a agentes o generar respuestas en el idioma del cliente.
- Traducción de contenido generado por usuarios en redes sociales: la evaluación MEME (0.7405 en 35BA3B) sugiere capacidad para manejar texto coloquial y expresiones culturales, útil para moderación y traducción de comentarios.
- Investigación en traducción automática multimodal: el modelo sirve como referencia para estudiar la integración de ASR, traducción de imagen y traducción de texto en un único modelo MoE con backbone congelado.
- Procesamiento de archivos multimedia en pipelines de datos: combinación de ASR y traducción de imagen para extraer y traducir información de vídeos, presentaciones o documentos escaneados.

## Benchmarks y rendimiento

Resultados de traducción de texto (COMET22 y métricas propias; mayor es mejor):

| Modelo | FLORES COMET22 | WMT24++ COMET22 | WMT26 Judge | MEME |
|---|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 0.8655 | 0.8489 | 60.26 | 0.6443 |
| Index-Translate-Omni 9B | 0.8789 | 0.8601 | 75.35 | 0.7387 |
| Index-Translate-Omni 35BA3B | 0.8795 | 0.8593 | 78.01 | 0.7405 |

Resultados de voz (CER en %, menor es mejor; BLEU / chrF2 / CER objetivo, mayor es mejor en BLEU y chrF2):

| Modelo | N | ASR zh CER↓ | ASR en CER↓ | en→zh (BLEU/chrF2/CER) | zh→en (BLEU/chrF2/CER) |
|---|---:|---:|---:|---:|---:|
| Index-Translate-Omni 2B | 30 | 13.8113 | 34.2560 | 36.982 / 30.357 / 43.3452 | 30.747 / 51.152 / 48.0670 |
| Index-Translate-Omni 9B | 30 | 17.8917 | 14.4097 | 43.507 / 36.312 / 41.3767 | 34.656 / 55.376 / 46.3720 |
| Index-Translate-Omni 35BA3B | 300 | 18.6803 | 15.0850 | 42.081 / 35.836 / 49.2490 | 36.404 / 57.323 / 45.1546 |

Resultados de traducción de imagen (COMET22×100, mayor es mejor; entre paréntesis, número de muestras):

| Modelo | MMTIT | FLORES-rendered | Vistra |
|---|---:|---:|---:|
| Qwen3.5-2B | 52.164 (249) | 50.187 (120) | 55.326 (305) |
| Index-Translate-Omni 2B | 65.809 (249) | 53.612 (120) | 65.596 (305) |
| Qwen3.5-9B | 73.814 (248) | 67.804 (119) | 68.963 (305) |
| Index-Translate-Omni 9B | 77.604 (248) | 68.438 (119) | 71.815 (305) |
| Qwen3.5-35B-A3B | 75.602 (191) | 70.005 (118) | 71.067 (292) |
| Index-Translate-Omni 35BA3B | 77.011 (191) | 69.891 (118) | 71.482 (292) |

Advertencias del autor: las métricas de imagen de 35BA3B reutilizan resultados ya medidos sobre los mismos pesos (601/674 muestras, 73 UNKNOWN); no representan una evaluación completa. Los tamaños de muestra difieren entre variantes (N=30 frente a N=300 en voz), por lo que el autor indica que no deben usarse para ranking entre tamaños. El ASR en chino de 35BA3B usa una configuración de frontend independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un MoE de 35B con ~3B activos en precisión BF16 requiere almacenar los 35B de pesos (~70 GB), aunque el cómputo por token sea el de un 3B.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; los pesos completos en BF16 no caben en una GPU de consumo de 24 GB sin cuantización.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; la model card remite a `NATIVE_INFERENCE.md`, cuyo contenido no está incluido en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-Omni 35BA3B | 35B | ~3B | no disponible | no disponible | pesos en proceso de subida |
| Index-Translate-Omni 9B | 9B | denso (presumible) | no disponible | no disponible | familia publicada |
| Index-Translate-Omni 2B | 2B | denso (presumible) | no disponible | no disponible | familia publicada |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | no disponible | base de referencia citada |

En las tablas de la model card, el 35BA3B supera al 9B en FLORES (0.8795 frente a 0.8789), WMT26 Judge (78.01 frente a 75.35) y MEME (0.7405 frente a 0.7387), pero queda ligeramente por debajo en WMT24++ (0.8593 frente a 0.8601). En imagen, supera a Qwen3.5-35B-A3B en MMTIT (77.011 frente a 75.602) y Vistra (71.482 frente a 71.067), y queda por debajo en FLORES-rendered (69.891 frente a 70.005). No se dispone de comparación con otros modelos de traducción multimodal de la competencia en la información proporcionada.

## Limitaciones y advertencias

- Pesos incompletos: la model card incluye un aviso de que la subida de pesos, archivos de carga y manifiesto final sigue en curso; no debe usarse hasta que se retire el aviso.
- Licencia no especificada: no se indica licencia, por lo que no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas limitados: solo se declaran chino e inglés; el resto de idiomas no está soportado según la información disponible.
- Evaluación parcial: los resultados de imagen de 35BA3B reutilizan mediciones previas con 73 muestras UNKNOWN y no cubren el conjunto completo.
- Muestras no comparables: los tamaños de muestra difieren entre variantes (N=30 frente a N=300 en voz), lo que impide rankings directos entre tamaños.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo de traducción, es susceptible de inventar contenido en textos ambiguos o de baja calidad.
- Sesgos: no documentados en la información disponible.
- Contexto: la longitud de contexto no está especificada, lo que impide evaluar su idoneidad para documentos largos.
- Dependencia de la base Qwen3.5: las capacidades y limitaciones heredadas del backbone no se detallan en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/IndexTeam/Index-Translate-omni-35B
- Colección Index-Translate: https://huggingface.co/collections/IndexTeam/index-translate
- Documento de inferencia nativa (referenciado, no incluido): NATIVE_INFERENCE.md en el repositorio del modelo

# Phoonnx/outetts-0.6B

## Resumen

outetts-0.6B es una conversión al formato ONNX del modelo OuteTTS-1.0-0.6B de OuteAI, publicada por el usuario Phoonnx como parte del repositorio `Phoonnx/phoonnx-outetts`. Se trata de un modelo de síntesis de voz (text-to-speech) de aproximadamente 0,6 mil millones de parámetros, diseñado para generar audio a partir de texto en catorce idiomas. Esta ficha se centra en la variante de 0,6B, que la model card original identifica explícitamente como la de licencia Apache-2.0.

El modelo está empaquetado para la librería `phoonnx`, un motor de inferencia de TigreGotico, y se distribuye con los pesos en formato ONNX (`model.onnx` más `model.onnx_data`) junto con el tokenizador. El repositorio ocupa 2,6 GB. Al estar en ONNX, está pensado para despliegue en entornos sin dependencia de PyTorch, lo que facilita su integración en aplicaciones de producción ligeras.

La relevancia de esta publicación radica en su licencia permisiva (Apache-2.0), que permite uso comercial sin restricciones adicionales, y en su cobertura multilingüe de catorce idiomas, incluyendo español, inglés, francés, alemán (implícito en la lista de voces) y varios idiomas asiáticos y europeos. No obstante, la información pública disponible es muy limitada: no se documentan benchmarks, arquitectura detallada ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; pesos en ONNX) |
| Parametros totales | 0,6B (según el nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | 14 idiomas: en, zh, nl, fr, de (implícito), es, hu, it, ja, ka, ko, lv, pl, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data`), tokenizer.json |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo de text-to-speech de 0,6 mil millones de parámetros, derivado de OuteTTS-1.0-0.6B de OuteAI. La model card de esta conversión no describe la arquitectura (transformer, difusión, codec de audio, etc.), ni los datos de entrenamiento (número de tokens, composición del dataset, horas de audio), ni si se emplearon técnicas de RLHF o DPO.

La única información técnica relevante es el formato de distribución: los pesos se han convertido a ONNX para su uso con la librería `phoonnx`, lo que implica una optimización orientada a inferencia en producción sin dependencia del ecosistema PyTorch. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en catorce idiomas.
- Generación de audio con identidades de voz predefinidas por idioma (voice ids `outetts/0.6B/<código>`).
- Soporte multilingüe: en, zh, nl, fr, es, hu, it, ja, ka, ko, lv, pl, ru (y de, según la lista de voces).
- Ejecución mediante la librería `phoonnx` sobre pesos ONNX.
- No se documentan capacidades de clonación de voz, control de prosodia, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- **Locución automatizada para audiolibros**: el modelo puede generar narración en varios idiomas a partir de texto plano, usando la voz predefinida del idioma correspondiente; su tamaño de 0,6B permite procesar grandes volúmenes de texto en servidores modestos.
- **Asistentes de voz en aplicaciones móviles o embebidas**: al distribuirse en ONNX, puede integrarse en runtimes ligeros sin PyTorch, reduciendo el peso del despliegue en dispositivos con recursos limitados.
- **Generación de avisos y mensajes de voz en sistemas IVR**: permite sintetizar mensajes dinámicos en catorce idiomas para centralitas telefónicas, con licencia Apache-2.0 que facilita el uso comercial.
- **Accesibilidad web**: conversión de contenido textual a audio para lectores de pantalla o interfaces de accesibilidad, con soporte para usuarios de distintos idiomas.
- **Doblaje y localización de contenido**: generación de pistas de voz en varios idiomas para vídeos corporativos o material formativo, usando las voces por idioma incluidas.
- **Prototipado rápido de interfaces conversacionales**: al estar empaquetado para `phoonnx`, permite montar un servicio TTS de prueba con pocos pasos y sin dependencias pesadas.
- **Sistemas de notificaciones por voz**: integración en pipelines de alertas que requieran convertir texto a audio en tiempo casi real en múltiples idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Para un modelo de 0,6B parámetros, una estimación orientativa en FP16 sería de aproximadamente 1,2-1,5 GB de memoria para los pesos, más el overhead del runtime ONNX y del procesamiento de audio; en cuantización INT8 podría reducirse a menos de 1 GB.
- **GPU recomendadas**: no se especifican. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores; también podría ejecutarse en CPU, dado el formato ONNX.
- **¿Cabe en GPU de consumo?**: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, aunque no hay confirmación oficial.
- **Opciones de despliegue**: librería `phoonnx` (TigreGotico); al ser ONNX, es compatible con ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| outetts-0.6B (esta ficha) | 0,6B | no disponible | 14 | Apache-2.0 | ONNX |
| OuteTTS-1.0-0.6B (original) | 0,6B | no disponible | 14 | Apache-2.0 | safetensors/PyTorch |
| OuteTTS-1.0-1B | 1B | no disponible | no disponible | distinta (según model card) | safetensors/PyTorch |

La comparativa se limita a la familia OuteTTS porque no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Información muy escasa**: no se documentan arquitectura, datos de entrenamiento, benchmarks ni latencias; evaluar su calidad en producción requiere pruebas propias.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede generar pronunciaciones incorrectas, artefactos o prosodia antinatural en textos fuera de dominio.
- **Sesgos**: no se documentan sesgos conocidos, pero al ser un modelo entrenado con datos no especificados, puede reflejar sesgos de acento, género o registro presentes en el corpus original.
- **Cobertura de idiomas**: aunque se listan catorce idiomas, no se especifica el nivel de calidad por idioma; el español y otros idiomas pueden tener un rendimiento inferior al inglés.
- **Licencia**: Apache-2.0 permite uso comercial, pero la model card advierte que las dos variantes de tamaño de OuteTTS tienen licencias distintas; esta ficha cubre solo la 0,6B.
- **Formato ONNX**: la conversión puede introducir diferencias de comportamiento respecto al modelo original en PyTorch; no se documenta una validación de equivalencia.
- **Repositorio con 0 descargas y 0 likes**: no hay evidencia de uso comunitario ni de mantenimiento continuo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/outetts-0.6B
- Repositorio fuente de la conversión: https://huggingface.co/Phoonnx/phoonnx-outetts
- Modelo original: https://huggingface.co/OuteAI/OuteTTS-1.0-0.6B-ONNX
- Librería phoonnx: https://github.com/TigreGotico/phoonnx

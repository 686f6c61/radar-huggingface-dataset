# Meliro-app/meliro-ia

## Resumen

Meliro IA es una redistribución del modelo Gemma 4 26B-A4B (instruct) de Google, empaquetada por el desarrollador Meliro-app para su uso dentro de la aplicación Mac gratuita Meliro (antes Merge), orientada al estudio y repaso a partir de material propio del usuario (fichas, tarjetas, cuestionarios). El modelo no ha sido reentrenado: los pesos originales se han reorganizado únicamente al formato del motor turbo-fieldfare para que quepan y funcionen en un Mac con 8 GB de memoria, manteniendo la inferencia completamente local sin envío de datos a Internet.

La relevancia de esta ficha es doble. Por un lado, ilustra un patrón creciente de distribución de modelos open source como componentes internos de aplicaciones de escritorio (on-device), con verificación por hash y actualizaciones gestionadas por la propia app. Por otro, muestra el uso de la versión 4 bits del modelo base (mlx-community/gemma-4-26b-a4b-it-4bit) como punto de partida, lo que condiciona fuertemente las capacidades efectivas y los requisitos de hardware.

Se trata de un modelo de arquitectura tipo Mezcla de Expertos (MoE) con 26B parámetros totales y 4B activos, según la nomenclatura del modelo base, orientado a instrucciones y con soporte declarado únicamente para francés en esta ficha. La licencia Apache 2.0 facilita su integración comercial, aunque los detalles técnicos de contexto, entrenamiento y benchmarks no están documentados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el modelo base Gemma 4 26B-A4B |
| Parámetros totales | 26B (según nomenclatura del modelo base) |
| Parámetros activos | 4B (según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (parte de mlx-community/gemma-4-26b-a4b-it-4bit); pesos redistribuidos en formato turbo-fieldfare |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | turbo-fieldfare (`.gturbo`), empaquetado en `gemma4.gturbo/` y `Merge - IA.gturbo.zip`, con manifiesto `manifeste-ia.json` y hashes SHA-256 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Gemma 4 26B-A4B-it de Google, un transformer con mezcla de expertos en el que solo una fracción de los parámetros (4B) se activa por token, lo que reduce el coste computacional frente a un modelo denso de 26B. Esta ficha no aporta detalles adicionales sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card del modelo base, no incluida aquí.

La intervención de Meliro-app se limita a la redistribución de pesos: se parte de la versión 4 bits del modelo base y se reorganizan los pesos al formato del motor turbo-fieldfare, sin reentrenamiento. El objetivo declarado es que el modelo quepa y funcione en un Mac con 8 GB de memoria. El repositorio incluye los pesos en archivos separados para actualizaciones incrementales, una versión empaquetada en un único archivo para la primera instalación y un manifiesto JSON con tamaños y huellas SHA-256 que la aplicación verifica.

## Capacidades

- Generación de texto y respuestas a instrucciones, heredadas del modelo base Gemma 4 26B-A4B-it.
- Asistencia al estudio: generación de fichas, tarjetas de repaso y preguntas tipo test a partir de material del usuario, según el propósito declarado de la app Meliro.
- Ejecución completamente local (on-device) en Mac, sin envío de contenido a Internet.
- Idiomas: francés declarado; no se documentan otras lenguas en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Repaso académico asistido: la app genera fichas y tarjetas a partir de apuntes del usuario, usando el modelo para sintetizar y reformular contenido; encaja porque toda la inferencia ocurre en local y el material sensible no sale del equipo.
- Generación de cuestionarios tipo test: el modelo redacta preguntas y opciones a partir de un temario, aprovechando su naturaleza instruct y su ejecución en el propio Mac.
- Estudio sin conexión: al ejecutarse on-device, resulta adecuado para entornos con conectividad limitada o políticas de privacidad estrictas, como aulas o bibliotecas.
- Aplicación de escritorio con distribución gestionada: sirve como ejemplo de integración de un modelo empaquetado con manifiesto y hashes SHA-256, útil para desarrolladores que quieran distribuir modelos con actualizaciones verificables dentro de una app.
- Uso educativo en francés: adecuado para estudiantes francófonos que necesiten asistencia de estudio en su idioma, dado que la ficha declara soporte para fr.
- Prototipado de asistentes educativos locales: desarrolladores pueden estudiar el formato turbo-fieldfare y el esquema de empaquetado para construir sus propias apps de estudio con modelos MoE cuantizados a 4 bits.
- Despliegue en hardware modesto: al estar adaptado para Macs de 8 GB, puede emplearse en equipos de gama baja donde modelos de mayor tamaño no cabrían.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el modelo está empaquetado para funcionar en un Mac con 8 GB de memoria, según la model card; no se detallan cifras exactas de consumo.
- GPU recomendadas: no disponible; el destino declarado son equipos Mac (memoria unificada), no se especifican modelos de GPU dedicada.
- Cabe en GPU de consumo: no disponible; el requisito documentado es un Mac de 8 GB, no una GPU concreta.
- Opciones de despliegue: motor turbo-fieldfare integrado en la app Meliro; vLLM, llama.cpp, Ollama o TGI no están documentados para este formato `.gturbo`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meliro IA (esta ficha) | 26B | 4B | no disponible | Apache 2.0 | Hugging Face, formato turbo-fieldfare |
| google/gemma-4-26B-A4B-it | 26B | 4B | no disponible | no disponible en esta ficha | Hugging Face |
| mlx-community/gemma-4-26b-a4b-it-4bit | 26B | 4B | no disponible | no disponible en esta ficha | Hugging Face, formato MLX 4 bits |

La comparativa se limita a las variantes del mismo modelo base citadas en la información disponible; no se han identificado alternativas de otros desarrolladores con datos verificables en esta ficha.

## Limitaciones y advertencias

- No ha sido reentrenado: las capacidades y sesgos son los del modelo base Gemma 4 26B-A4B-it, con posibles sesgos heredados no documentados aquí.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en esta ficha.
- Contexto e idioma: la longitud de contexto no está disponible y el único idioma declarado es el francés, lo que limita su uso en castellano u otras lenguas.
- Cuantización a 4 bits: la pérdida de precisión respecto al modelo original puede afectar tareas sensibles; no se documentan evaluaciones comparativas.
- Formato propietario: los pesos en turbo-fieldfare (`.gturbo`) están ligados al motor de la app Meliro, lo que dificulta su uso con herramientas estándar de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4, que pueden incluir términos adicionales de Google.
- Distribución dependiente de la app: la model card indica que la app instala y actualiza el modelo por sí sola; el repositorio no está pensado para descarga manual.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Meliro-app/meliro-ia
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Versión 4 bits de referencia: https://huggingface.co/mlx-community/gemma-4-26b-a4b-it-4bit
- Repositorio de la aplicación: https://github.com/Merge-ai-demo/merge

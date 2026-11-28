# dollarland/dolyzer-gemma-models

## Resumen

Dolyzer Gemma Models es un repositorio de redistribucion mantenido por dollarland (proyecto Dolyzer) que aloja variantes de la familia Gemma de Google, convertidas y cuantizadas para inferencia local en dispositivos moviles dentro de la aplicacion Dolyzer. No se trata de un modelo entrenado desde cero, sino de un espejo de pesos de terceros con conversiones a formatos GGUF y MediaPipe/LiteRT `.task`, orientado a un flujo de IA offline tras la descarga inicial.

El repositorio declara como modelo principal Gemma 2 2B Instruct en cuantizacion Q4_K_M (GGUF), aunque la tabla de modelos de la model card figura como pendiente de subida y verificacion. El recuento real de parametros en safetensors es de 2.614.341.888, coherente con la familia de 2B parametros de Gemma 2. El tamano del repositorio es de 18,8 GB, lo que sugiere la presencia de multiples variantes y formatos.

Su relevancia es practica: ofrece puntos de descarga estables para desarrolladores que integran Gemma en aplicaciones moviles con motores de inferencia locales (MediaPipe/LiteRT, llama.cpp y derivados). La licencia aplicable es la de Google Gemma Terms of Use, no Apache 2.0, y el autor declara explicitamente no ser afiliado a Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma de Google; variante concreta no detallada) |
| Parametros totales | 2.614.341.888 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (GGUF) para Gemma 2 2B Instruct; otras variantes no detalladas |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Gemma Terms of Use (Google), no Apache 2.0 |
| Formato de pesos | GGUF y MediaPipe/LiteRT `.task`; safetensors presentes en el repo |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: redistribuye pesos de la familia Gemma desarrollada por Google. La arquitectura subyacente es un transformer decoder-only con atencion por rotacion posicional y las innovaciones propias de cada generacion de Gemma (en Gemma 2, atencion alterna local/global e interleaving de MLP y atencion). El autor no documenta detalles de entrenamiento (numero de tokens, composicion del dataset, fases de RLHF/DPO) porque no es el desarrollador original.

La aportacion tecnica del repositorio es la conversion y cuantizacion para despliegue en dispositivo: pesos en GGUF para motores compatibles (llama.cpp y derivados) y pesos en formato `.task` para el runtime MediaPipe/LiteRT. La model card advierte que ambos formatos no son intercambiables y que la cuantizacion puede degradar calidad, rendimiento y compatibilidad. No se documentan metodos de decodificacion especulativa ni optimizaciones de atencion adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 2 2B Instruct.
- Instrucciones y respuesta a prompts en formato chat (el repositorio se etiqueta como conversacional).
- Inferencia completamente offline tras la descarga del modelo.
- Ejecucion en dispositivo movil mediante runtimes MediaPipe/LiteRT o motores GGUF.
- Descarga y gestion de modelos controlada por el usuario dentro de la app Dolyzer.
- Soporte de multiples variantes de Gemma (tamanos y cuantizaciones) a medida que se anadan.
- Tool calling, agentes, vision, audio, thinking mode y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales offline en movil: la app descarga un GGUF Q4_K_M de Gemma 2 2B Instruct y ejecuta inferencia local sin conexion, util en entornos con conectividad intermitente o requisitos de privacidad.
- Prototipado de integraciones MediaPipe: el formato `.task` permite probar Gemma dentro del ecosistema LiteRT en Android e iOS sin convertir pesos manualmente.
- Aplicaciones de privacidad estricta: al no enviar prompts a servidores, el modelo sirve para resumir notas o redactar texto sobre datos sensibles que no deben salir del dispositivo.
- Educacion y demos de IA en dispositivo: punto de descarga fiable para talleres y pruebas de concepto sobre inferencia local en telefonos de gama media.
- Generacion de texto auxiliar en apps de productividad: autocompletado, reescritura breve y respuestas sugeridas con latencia aceptable en hardware movil moderno.
- Evaluacion comparativa de cuantizaciones: el repositorio permite descargar distintas variantes y medir el impacto de Q4_K_M frente a otros formatos en el mismo dispositivo.
- Distribucion conforme a licencia: equipos que necesitan redistribuir Gemma con avisos y atribucion correctos pueden reutilizar la estructura de NOTICE y LICENSE del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: un modelo de 2,6B parametros en Q4_K_M ocupa aproximadamente 1,5-2 GB en disco; el consumo en ejecucion puede superar el tamano del archivo, como advierte la model card.
- GPU de escritorio: no se documentan requisitos; para pruebas en servidor serian adecuadas A100, H100 o RTX 4090, pero no hay datos oficiales del autor.
- GPU consumer: cabe en GPUs con 4-8 GB de VRAM en cuantizacion Q4, aunque no se especifican modelos probados.
- Movil: el objetivo declarado es inferencia en dispositivo; la compatibilidad depende de memoria disponible, procesador y longitud de contexto.
- Despliegue: motores GGUF compatibles (llama.cpp y derivados, potencialmente Ollama) para archivos GGUF; runtime MediaPipe/LiteRT para archivos `.task`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dolyzer Gemma Models (este repo) | 2,61B (Gemma 2 2B) | no disponible | Gemma Terms of Use | Hugging Face, GGUF y `.task` |
| Gemma 2 2B Instruct (Google) | 2B | no disponible en esta ficha | Gemma Terms of Use | Hugging Face oficial, Kaggle |
| Qwen2.5 1.5B Instruct | 1,5B | no disponible en esta ficha | Apache 2.0 | Hugging Face, GGUF ampliamente disponible |
| Llama 3.2 1B Instruct | 1B | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face, GGUF ampliamente disponible |

La comparativa se limita a datos de catalogo; no hay benchmarks publicados por el autor que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- El repositorio no es un modelo original: redistribuye pesos de Google y depende de la licencia Gemma Terms of Use, con requisitos de aviso, atribucion y restricciones de uso prohibido.
- La model card indica que el modelo principal figura como "pendiente de subida y verificacion"; la disponibilidad real de cada variante debe comprobarse en el repo.
- Solo se declara soporte de ingles (`en`); el rendimiento en castellano no esta garantizado.
- Riesgo de respuestas inexactas, incompletas o inapropiadas, reconocido por el propio autor.
- La cuantizacion Q4_K_M puede degradar la calidad respecto a los pesos originales de Google.
- El consumo de memoria en ejecucion puede exceder el tamano del archivo; no todos los telefonos son compatibles.
- No hay datos de benchmarks, contexto maximo ni hardware probado, lo que dificulta planificar produccion.
- El autor declara no estar afiliado a Google; para uso comercial deben revisarse los terminos oficiales y la politica de uso prohibido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dollarland/dolyzer-gemma-models
- Google Gemma: https://ai.google.dev/gemma
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Google en Hugging Face: https://huggingface.co/google
- Google Gemma en Kaggle: https://www.kaggle.com/models/google/gemma

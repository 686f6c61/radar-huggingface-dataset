# HomeLabPro/Qwen-4B-GGUF

## Resumen

HomeLabPro/Qwen-4B-GGUF es una distribucion cuantizada en formato GGUF del modelo Qwen3-4B, desarrollado originalmente por Alibaba Qwen. El repositorio lo mantiene el usuario HomeLabPro y su unico proposito es ofrecer los pesos del modelo base convertidos y optimizados para inferencia local en CPU y GPU mediante llama.cpp y Ollama. No se trata de un fine-tuning ni de un modelo nuevo: es una conversion directa de los pesos originales de Qwen/Qwen3-4B.

El modelo base Qwen3-4B es un transformer denso de aproximadamente 4.000 millones de parametros, con licencia Apache 2.0 y capacidades multilingues. Esta distribucion incluye unicamente una cuantizacion Q4_K_M de aproximadamente 2,5 GB, pensada para entornos con recursos limitados (homelab, estaciones de trabajo sin GPU dedicada de gran capacidad).

Su relevancia es practica: permite ejecutar un modelo de 4B en hardware de consumo con un consumo de memoria de entre 3,5 y 4 GB, lo que lo hace util para prototipado rapido, despliegues en el borde y pruebas locales sin depender de infraestructura en la nube. El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que debe considerarse una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) |
| Parametros totales | ~4.000 millones (4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3-4B-Q4_K_M.gguf`, ~2,5 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3-4B de Alibaba Qwen, un transformer denso de aproximadamente 4.000 millones de parametros. Esta distribucion no aporta informacion adicional sobre la arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion, etc.) mas alla de la identificacion del modelo base. Tampoco se detalla en la model card el proceso de entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF o DPO), por lo que esos datos deben consultarse en la documentacion oficial de Qwen3-4B.

La unica innovacion tecnica documentada en este repositorio es el proceso de conversion y cuantizacion: se parte de los pesos originales en formato Hugging Face, se convierten a F16 con `convert_hf_to_gguf.py` y posteriormente se cuantizan a Q4_K_M con `llama-quantize`. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni modificaciones arquitectonicas.

## Capacidades

- Generacion de texto en ingles y otros idiomas (etiqueta multilingual en los metadatos).
- Inferencia local en CPU y GPU mediante llama.cpp y Ollama.
- Ejecucion en entornos con memoria limitada gracias a la cuantizacion Q4_K_M (~2,5 GB de pesos).
- Capacidades del modelo base Qwen3-4B (razonamiento, codigo, matematicas, tool calling) presumiblemente heredadas, aunque no se documentan explicitamente en esta model card.
- No se documenta soporte explicito de vision, audio ni modo thinking en esta distribucion.

## Casos de uso

- Prototipado local en estaciones de trabajo sin GPU dedicada: la cuantizacion Q4_K_M permite cargar el modelo en ~3,5-4 GB de RAM y ejecutarlo con llama.cpp en CPU, lo que facilita pruebas de prompts y flujos conversacionales sin coste de API.
- Despliegue en homelab con Ollama: el archivo GGUF se puede importar directamente en Ollama para servir un endpoint local de generacion de texto, util para asistentes personales o automatizaciones domesticas.
- Generacion de texto en el borde (edge computing): con 2,5 GB de pesos, el modelo cabe en dispositivos con 8 GB de RAM, lo que permite tareas de resumen, clasificacion o redaccion en entornos sin conectividad.
- Educacion e investigacion: sirve como banco de pruebas para estudiar el impacto de la cuantizacion Q4_K_M en la calidad de salida frente a los pesos F16 originales.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: al ser un modelo pequeno y rapido de cargar, se puede usar en tests automatizados que validen respuestas del modelo base.
- Base para fine-tuning ligero o experimentacion: al estar bajo Apache 2.0, se puede usar como punto de partida para adaptaciones locales, aunque esta distribucion concreta no incluye herramientas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~3,5-4 GB para la cuantizacion Q4_K_M (segun la model card).
- Tamano de los pesos: ~2,5 GB en disco.
- GPU recomendadas: no se especifican en la model card; por tamano, cabe en GPUs de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) y en GPUs profesionales (A100, H100) sin problema, aunque estas ultimas estarian sobredimensionadas.
- Cabe en GPU de consumo: si, en tarjetas con al menos 4 GB de VRAM dedicada; tambien funciona en CPU pura con 4 GB de RAM libre.
- Opciones de despliegue: llama.cpp y Ollama (mencionados explicitamente); otros runners compatibles con GGUF (llama-cpp-python, LM Studio, koboldcpp) serian tecnicamente viables pero no se documentan.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| HomeLabPro/Qwen-4B-GGUF | ~4B | no disponible | Apache 2.0 | GGUF (Q4_K_M) | Hugging Face |
| Qwen/Qwen3-4B (original) | ~4B | no disponible | Apache 2.0 | safetensors | Hugging Face |
| Otras distribuciones GGUF de Qwen3-4B | ~4B | no disponible | Apache 2.0 | GGUF (multiples cuantizaciones) | Hugging Face |

La comparativa se limita al modelo base y a otras conversiones GGUF del mismo modelo, ya que no se dispone de datos de rendimiento ni de contexto para contrastar con alternativas de otros fabricantes. La diferencia principal frente al original es el formato (GGUF frente a safetensors) y la cuantizacion (Q4_K_M), que reduce el tamano a costa de una posible perdida de calidad no cuantificada en esta ficha.

## Limitaciones y advertencias

- Repositorio sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, lo que impide verificar la calidad de la conversion.
- Una sola cuantizacion disponible (Q4_K_M): no hay opciones Q5, Q8 ni F16 en este repositorio, lo que limita el ajuste fino entre calidad y memoria.
- Perdida de calidad por cuantizacion: no se documenta ninguna evaluacion del impacto de Q4_K_M frente a los pesos originales.
- Falta de datos tecnicos: no se especifican longitud de contexto, composicion del entrenamiento ni benchmarks, por lo que las capacidades reales deben inferirse del modelo base Qwen3-4B.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se documentan mitigaciones especificas.
- Idiomas: la etiqueta multilingual no detalla que idiomas concretos estan soportados; el castellano no aparece listado explicitamente.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base Qwen3-4B por si hubiera condiciones adicionales no reflejadas en esta model card.
- Sin garantias de mantenimiento: al ser una publicacion de un usuario individual (HomeLabPro), no hay compromiso de actualizaciones ni soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HomeLabPro/Qwen-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Herramienta de conversion y cuantizacion: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com

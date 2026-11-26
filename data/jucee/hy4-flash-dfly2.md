# jucee/Hy4-flash-DFly2

## Resumen

Hy4-flash-DFly2 es un espejo (mirror) del *drafter* de decodificación especulativa DFly2 y del `config.json` del modelo base `tencent/Hy4-flash` de Tencent, publicado por el usuario `jucee` para garantizar descargas fiables dentro de la herramienta Jucee (de Bitnaut, LLC). No se trata de un modelo independiente, sino de un subconjunto de artefactos del modelo original: el repositorio pesa 1,7 GB y contiene únicamente el shard `model-00148-of-00148.safetensors` junto con la configuración.

El propósito del repositorio es servir de origen de descarga para el flujo de conversión local de Jucee en macOS con Apple Silicon: la herramienta descarga estos ficheros y los convierte en `Hy4-flash-DFly2-Q8_0.gguf` mediante el script `recipes/hy4-dfly2/hy4-dfly2.sh`. El resultado es un drafter en formato GGUF cuantizado a Q8_0 pensado para acelerar la inferencia del modelo base mediante decodificación especulativa sobre Metal.

La relevancia es, por tanto, operativa y de nicho: no aporta pesos nuevos ni mejoras de entrenamiento, sino que empaqueta los artefactos necesarios para aplicar decodificación especulativa a Hy4-flash en hardware Apple. La información pública disponible sobre arquitectura, contexto o datos de entrenamiento del modelo base no se incluye en este repositorio, por lo que muchos parámetros quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter de decodificacion especulativa DFly2 sobre el modelo base tencent/Hy4-flash) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF generado localmente por Jucee); el repositorio contiene pesos en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (etiquetada como `license: other`, `license_name: tencent-hy-license`) |
| Formato de pesos | safetensors (shard `model-00148-of-00148.safetensors`) y `config.json`; conversion posterior a GGUF Q8_0 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base ni del drafter. Por los tags y la model card se deduce que DFly2 es un mecanismo de decodificación especulativa: un modelo auxiliar (drafter) que propone tokens que el modelo base verifica en paralelo, reduciendo el número de pasos de decodificación autorregresiva. El repositorio contiene solo el shard final del drafter y el `config.json`, no los pesos completos del modelo base, que deben obtenerse de `tencent/Hy4-flash`.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni sobre innovaciones técnicas del modelo base más allá del propio esquema de decodificación especulativa. La model card tampoco detalla el proceso de destilación o entrenamiento del drafter.

## Capacidades

- Decodificación especulativa: actúa como drafter para acelerar la generación del modelo base Hy4-flash.
- Conversión a GGUF Q8_0 mediante el recetario de Jucee para su uso en macOS con Apple Silicon y Metal.
- Generación de texto, razonamiento, código y otras capacidades heredadas del modelo base: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Aceleración de inferencia local en Mac: el drafter se convierte a `Hy4-flash-DFly2-Q8_0.gguf` y se usa junto al modelo base para reducir la latencia de decodificación en equipos Apple Silicon con Metal.
- Despliegue de asistentes conversacionales en local: al disminuir el coste por token generado, permite mantener conversaciones multi-turno en hardware de sobremesa sin GPU dedicada.
- Prototipado de pipelines de generación de código en estación de trabajo: la decodificación especulativa acelera la generación de fragmentos de código en entornos de desarrollo sobre macOS.
- Evaluación de técnicas de decodificación especulativa: sirve como artefacto de referencia para comparar el rendimiento de DFly2 frente a decodificación estándar en el mismo modelo base.
- Integración en la cadena de herramientas Jucee: el repositorio alimenta el flujo automatizado de descarga y conversión de la herramienta, útil para equipos que replican el entorno en varias máquinas.
- Distribución fiable de artefactos: al actuar como espejo, mitiga fallos de descarga del repositorio original en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory: el repositorio ocupa 1,7 GB; el drafter cuantizado a Q8_0 requiere una fracción de esa cifra, pero el consumo total depende del modelo base Hy4-flash, cuyo tamaño no está disponible.
- GPU recomendadas: el flujo está diseñado para Apple Silicon con Metal; no se documentan requisitos para GPU NVIDIA o AMD.
- GPU de consumo: el caso de uso declarado es macOS con Apple Silicon; no hay datos sobre compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: conversión y ejecución mediante Jucee y llama.cpp (formato GGUF); no se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jucee/Hy4-flash-DFly2 | no disponible | no disponible | no disponible (drafter de decodificacion especulativa) | Tencent Hy License 1.0 | Hugging Face (mirror) |
| tencent/Hy4-flash | no disponible | no disponible | no disponible | Tencent Hy License 1.0 | Hugging Face (original) |
| Otros drafters de decodificacion especulativa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: contiene solo el drafter y el `config.json`; requiere los pesos del modelo base `tencent/Hy4-flash` para funcionar.
- Sesgos conocidos: no disponibles; al heredar el comportamiento del modelo base, sus sesgos serán los de este.
- Riesgo de alucinación: no documentado; aplicable el del modelo base.
- Limitaciones de contexto o idioma: no disponibles.
- Licencia: Tencent Hy License, Version 1.0, etiquetada como `other`; es necesario revisar `LICENSE` antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Fechas de creación y actualización (2026-11-25) posteriores a la fecha actual de referencia habitual: conviene verificar la integridad y procedencia de los artefactos.
- El flujo de conversión está acoplado a Jucee y a macOS/Apple Silicon; no se garantiza portabilidad a otras plataformas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jucee/Hy4-flash-DFly2
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Herramienta Jucee: https://github.com/bitnautlabs/jucee
- Script de conversión: https://github.com/bitnautlabs/jucee/blob/main/recipes/hy4-dfly2/hy4-dfly2.sh

# aday777/tiny-llama-fixture

## Resumen

`tiny-llama-fixture` es un checkpoint de prueba (test fixture) publicado por el usuario `aday777` en Hugging Face. No se trata de un modelo de lenguaje funcional, sino de un archivo de pesos generado aleatoriamente con una arquitectura Llama en miniatura, diseñado específicamente para verificar cargadores de safetensors, realizar pruebas de integración continua (CI) y servir como golden file para comparaciones byte a byte. El repositorio contiene un único archivo `model.safetensors` de aproximadamente 91 KB con 20 tensores en float32, junto con un `config.json`, un tokenizador WordLevel mínimo y un archivo de sumas de verificación SHA256 por tensor.

El proyecto surge de la necesidad de disponer de un checkpoint reproducible y sin dependencias de entrenamiento, GPU o librerías pesadas como torch o numpy, para que los tests puedan ejecutarse en cualquier entorno sin red. Los pesos se generan desde cero mediante un PRNG SplitMix64 con semilla fija, lo que garantiza que el archivo sea byte-reproducible. Aunque su nombre evoca al modelo TinyLlama de 1.1B parámetros, este fixture no tiene relación con aquel proyecto y no debe confundirse con un modelo de lenguaje utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (configuracion tiny) |
| Parametros totales | 22.688 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 256 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (solo float32) |
| Idiomas soportados | no disponible (tokenizer placeholder WordLevel con 128 tokens) |
| Licencia | CC0-1.0 (dominio publico, segun model card) |
| Formato de pesos | safetensors (un unico archivo, float32) |

## Arquitectura y entrenamiento

La arquitectura es una instancia mínima de LlamaForCausalLM con las siguientes dimensiones: `vocab_size` de 128, `hidden_size` de 32, 2 capas ocultas, 4 cabezas de atención, 2 cabezas clave/valor (con `head_dim` de 8), `intermediate_size` de 64, `max_position_embeddings` de 256, `tie_word_embeddings` activado, `rms_norm_eps` de 1e-5, `rope_theta` de 10000.0 y activación SiLU. Todos los tensores son float32 y se almacenan en orden de nombre ascendente.

El modelo no ha sido entrenado en absoluto. Los pesos se generan mediante un PRNG SplitMix64 con semilla 20260901, aplicando una transformación Box-Muller para obtener valores normales escalados por 0.02. Los vectores de normalización RMSNorm se inicializan a unos. El tokenizador es un WordLevel mínimo con tokens especiales bos/eos/unk/pad, sin vocabulario subword real. El archivo safetensors sigue la especificación estándar con cabecera JSON alineada a 8 bytes.

## Capacidades

- No genera texto coherente: los pesos son aleatorios y el modelo nunca ha sido entrenado, por lo que cualquier salida será basura.
- Verificación de carga de safetensors: permite comprobar que un cargador lee correctamente los tensores, sus formas, tipos y bytes exactos.
- Golden file testing: los checksums SHA256 por tensor permiten comparar los bytes cargados con los esperados.
- Smoke tests: proporciona un par config/tokenizer con un checkpoint real para probar pipelines de inferencia sin necesidad de un modelo grande.
- Reproducibilidad: el proceso de generación de pesos está documentado y es determinista, lo que permite regenerar el archivo exacto.
- Sin dependencias: no requiere GPU, torch, numpy ni acceso a red para su uso en tests.

## Casos de uso

- Pruebas de integración en librerías de carga de modelos: al integrar un nuevo formato de pesos o un cargador safetensors, este fixture permite validar que los tensores se leen con las dimensiones y tipos correctos sin descargar un modelo de cientos de megabytes.
- Golden file tests en repositorios de código: se puede comparar el hash SHA256 de cada tensor cargado contra `checksums.txt` para detectar cambios no deseados en el código de carga.
- Smoke tests en pipelines de CI: al ser un archivo de 91 KB, se puede incluir en el repositorio y ejecutar una inferencia mínima (aunque sin sentido) para verificar que el pipeline completo (tokenización, forward, generación) no falla.
- Verificación de compatibilidad entre versiones de librerías: al actualizar transformers, safetensors u otras dependencias, este fixture permite comprobar que no se rompe la carga de pesos.
- Desarrollo de herramientas de conversión de formatos: si se está implementando un conversor de safetensors a GGUF u otro formato, este checkpoint sirve como entrada de prueba con un tamaño manejable.
- Documentación de formatos: el archivo `checksums.txt` y la receta de generación documentan la estructura exacta de un safetensors, útil para quienes implementan su propio lector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un fixture de prueba sin entrenamiento, no tiene sentido evaluar su rendimiento en tareas de lenguaje.

## Requisitos de hardware

- No requiere GPU: el archivo pesa 91 KB y puede cargarse en cualquier CPU, incluso en entornos de integración continua sin aceleración.
- Memoria RAM: menos de 1 MB para el modelo completo.
- GPU recomendadas: ninguna.
- Opciones de despliegue: no aplicable como modelo de inferencia; se usa como archivo de prueba en entornos de desarrollo.
- Latencia y throughput: no relevantes; la carga es instantánea.

## Comparativa con modelos similares

No disponible. Este es un fixture de prueba único, no un modelo de lenguaje comparable con alternativas como TinyLlama (1.1B) u otros modelos pequeños. Su propósito es exclusivamente técnico y no compite en tareas de NLP.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: los pesos son aleatorios y no ha sido entrenado, por lo que no produce texto coherente.
- El tokenizador es un placeholder WordLevel con solo 128 tokens, no un vocabulario subword real; no es adecuado para procesar lenguaje natural.
- Las dimensiones son mínimas (hidden_size 32, 2 capas) y no representan una arquitectura realista para modelado del lenguaje.
- No se debe utilizar en producción ni en aplicaciones que requieran generación de texto.
- La licencia CC0-1.0 permite uso libre, pero no hay garantías de funcionamiento.
- No se han publicado resultados de benchmarks ni evaluaciones de calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aday777/tiny-llama-fixture
- Proyecto TinyLlama (referencia, no relacionado con este fixture): https://github.com/jzhang38/TinyLlama

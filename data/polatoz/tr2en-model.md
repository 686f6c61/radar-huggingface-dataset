# PolatOz/tr2en-model

## Resumen

`PolatOz/tr2en-model` es una conversión a CTranslate2 con cuantización int8 del modelo de traducción `Helsinki-NLP/opus-mt-tc-big-tr-en`, desarrollado por el grupo Language Technology Research de la Universidad de Helsinki. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son los originales de OPUS-MT, únicamente convertidos y cuantizados para ejecutarse en CPU sin dependencia de PyTorch. El resultado ocupa aproximadamente 230 MB en disco y está pensado para traducción turco → inglés completamente offline.

El modelo resuelve un problema muy concreto: disponer de un traductor local, sin conexión a internet y con requisitos de hardware mínimos, para integrarlo en aplicaciones de escritorio. En este caso, es el traductor de respaldo de la aplicación Windows `tr2en`, que permite seleccionar texto, pulsar un atajo de teclado y sustituir la selección por su traducción al inglés. La aplicación descarga estos ficheros en el primer arranque y los verifica mediante SHA256.

La relevancia es por tanto de nicho y práctica: no compite en calidad con traductores neuronales de gran escala, pero ofrece una alternativa determinista, verificable y de huella reducida para entornos sin red o con restricciones de privacidad. La arquitectura subyacente es la del modelo OPUS-MT original (transformer encoder-decoder con tokenización SentencePiece), empaquetada en formato CTranslate2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (OPUS-MT, modelo base `Helsinki-NLP/opus-mt-tc-big-tr-en`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso fija `max_decoding_length=256`) |
| Tipos de cuantización | int8 (CTranslate2) |
| Idiomas soportados | turco (tr) → inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CTranslate2 (`model.bin`), vocabulario compartido en JSON y tokenizadores SentencePiece (`source.spm`, `target.spm`) |

## Arquitectura y entrenamiento

El modelo subyacente es `Helsinki-NLP/opus-mt-tc-big-tr-en`, un sistema de traducción neuronal de la familia OPUS-MT basado en una arquitectura transformer encoder-decoder con tokenización SentencePiece. Fue entrenado por Helsinki-NLP sobre datos paralelos del corpus OPUS, según la referencia Tiedemann & Thottingal (2020), *OPUS-MT — Building open translation services for the World*. No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución del repositorio `PolatOz/tr2en-model` no es arquitectónica sino de empaquetado: se aplica `ct2-transformers-converter --model Helsinki-NLP/opus-mt-tc-big-tr-en --quantization int8` para producir un artefacto ejecutable en CPU con CTranslate2, sin PyTorch en tiempo de inferencia. El repositorio publica los hashes SHA256 de los cinco ficheros (`config.json`, `model.bin`, `shared_vocabulary.json`, `source.spm`, `target.spm`), lo que permite verificar la integridad de la descarga. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de texto turco → inglés, en una única dirección.
- Ejecución en CPU con cuantización int8 y sin dependencia de PyTorch.
- Funcionamiento completamente offline, sin llamadas a servicios externos.
- Integración mediante la API de CTranslate2 (`Translator.translate_batch`) con tokenizadores SentencePiece.
- Verificación de integridad de los ficheros mediante SHA256 publicado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Sin capacidades multilingües más allá del par turco-inglés.

## Casos de uso

- Traducción de selección de texto en aplicaciones de escritorio: el caso de uso original de la app `tr2en`, donde el usuario selecciona texto turco, pulsa un atajo y la selección se reemplaza por su traducción al inglés, sin conexión y con latencia baja en CPU.
- Procesamiento por lotes de documentación interna en turco: al ejecutarse en CPU y ocupar ~230 MB, puede desplegarse en servidores sin GPU para traducir ficheros de texto o mensajes de commit en pipelines internos.
- Preprocesado de datos para pipelines de NLP: traducción de corpus turcos a inglés antes de alimentar modelos de análisis, clasificación o indexación que solo operan en inglés.
- Traducción en entornos air-gapped: organizaciones con requisitos de privacidad o sin acceso a internet pueden usar el modelo localmente sin enviar texto a terceros.
- Prototipado rápido de funcionalidades de traducción: la API de CTranslate2 y el tamaño reducido permiten integrar el modelo en scripts Python en minutos, sin infraestructura de GPU.
- Traducción de mensajes cortos en herramientas de desarrollo: por ejemplo, comentarios de código o mensajes de error en turco, aprovechando el buen rendimiento declarado en frases cortas y bien formadas.
- Respaldo offline en aplicaciones con traductor principal en la nube: como en `tr2en`, donde Gemini actúa como traductor principal (con clave de API del usuario) y este modelo se usa como fallback cuando no hay red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU.
- Espacio en disco: aproximadamente 230 MB (tamaño del repo: 0.2 GB).
- GPU: no necesaria. No se documentan requisitos de GPU; puede ejecutarse en cualquier CPU moderna.
- GPU de consumo: irrelevante para el caso de uso previsto; el modelo no requiere aceleración gráfica.
- Despliegue: CTranslate2 (`ctranslate2.Translator` con `device="cpu"`, `compute_type="int8"`), junto con SentencePiece para la tokenización. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Dirección | Formato | Cuantización | Tamaño en disco | Licencia | Ejecución |
|---|---|---|---|---|---|---|
| `PolatOz/tr2en-model` | tr → en | CTranslate2 | int8 | ~230 MB | CC-BY-4.0 | CPU, offline |
| `Helsinki-NLP/opus-mt-tc-big-tr-en` | tr → en | PyTorch/safetensors (transformers) | no cuantizado | no disponible | CC-BY-4.0 | CPU/GPU, requiere PyTorch |
| `Helsinki-NLP/opus-mt-tc-big-en-tr` | en → tr | PyTorch/safetensors (transformers) | no cuantizado | no disponible | CC-BY-4.0 | CPU/GPU, requiere PyTorch |

La comparación más directa es con el modelo original de Helsinki-NLP, del que este repositorio es una conversión: mismos pesos, menor huella y ejecución sin PyTorch, a costa de fijar el formato CTranslate2. La variante inversa `opus-mt-tc-big-en-tr` cubre la dirección contraria y sería necesaria para un flujo bidireccional. No se dispone de datos de benchmarks para comparar calidad entre alternativas.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tuning: cualquier limitación del modelo original `Helsinki-NLP/opus-mt-tc-big-tr-en` se hereda íntegramente.
- Rendimiento declarado bueno en frases cortas y bien formadas; más débil en texto largo e informal.
- Problemas documentados con jerga técnica: por ejemplo, "tablo" puede traducirse como "painting" en lugar de "table".
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (software, legal, médico).
- Solo cubre turco → inglés; no traduce en la dirección inversa ni otros idiomas.
- Longitud de contexto no documentada; el ejemplo de uso limita la decodificación a 256 tokens.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a Helsinki-NLP y al corpus OPUS, así como mención de la licencia.
- En la aplicación `tr2en` se usa solo como respaldo offline; el traductor principal es Gemini con clave de API del usuario, lo que sugiere que la calidad del modelo local es inferior para uso general.
- No se documentan sesgos específicos más allá de los inherentes a los datos OPUS.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PolatOz/tr2en-model
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-tr-en
- Aplicación tr2en: https://github.com/PolatOzaslan21/tr2en
- Referencia: Tiedemann & Thottingal (2020), *OPUS-MT — Building open translation services for the World*

# megathumbs/bergamot-de-en

## Resumen

Bergamot-de-en es un paquete de modelos de traducción automática neuronal para el par de idiomas alemán-inglés e inglés-alemán, publicado por el usuario megathumbs en Hugging Face. No se trata de un modelo entrenado por este autor, sino de una copia sin modificaciones de los modelos que Mozilla emplea en Firefox Translations, extraídos de la colección `translations-models`. El objetivo declarado es servir los ficheros desde una dirección fija para que los programas de Epic Art and Sound puedan cargarlos de forma reproducible, verificando cada archivo mediante su suma SHA-256.

Técnicamente, el repositorio contiene los artefactos propios del motor Bergamot (el runtime de traducción en el navegador de Mozilla): pesos en formato binario `intgemm` con escalado alfa, modelos léxicos de cortes de subpalabras y vocabularios en formato SentencePiece. No es un modelo generativo de propósito general ni un transformer decoder tipo LLM, sino un sistema de traducción seq2seq optimizado para inferencia en CPU y en el navegador.

Su relevancia es acotada pero clara: ofrece una copia estable y verificable de un motor de traducción ligero, con licencia MPL-2.0, útil para integrar traducción de alemán a inglés (y viceversa) en aplicaciones de escritorio o web sin depender de servicios en la nube. El tamaño del repositorio es de aproximadamente 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq optimizado para el motor Bergamot (runtime de Firefox Translations); pesos en formato intgemm con escalado alfa |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de traducción por segmento, no conversacional) |
| Tipos de cuantización | Pesos `intgemm` con escalado alfa (cuantización entera de 8 bits con corrección de canal) |
| Idiomas soportados | alemán (de) e inglés (en), en ambas direcciones |
| Licencia | MPL-2.0 (Mozilla Public License 2.0) |
| Formato de pesos | `.bin` (intgemm), `.s2t.bin` (modelo léxico), `.spm` (vocabulario SentencePiece) |

## Arquitectura y entrenamiento

El paquete contiene dos modelos independientes, uno para cada dirección de traducción. Cada uno se compone de tres ficheros: el modelo principal en formato `intgemm.alphas.bin` (pesos cuantizados a enteros de 8 bits con escalado alfa), un modelo léxico `lex.50.50.*.s2t.bin` que gestiona la segmentación de subpalabras a tokens y un vocabulario compartido en formato SentencePiece (`vocab.*.spm`, con el mismo hash en ambas direcciones).

La arquitectura subyacente corresponde al motor Bergamot de Mozilla, un transformer seq2seq de tamaño reducido diseñado para ejecutarse en el navegador con latencia baja y sin GPU. La cuantización `intgemm` con alfas es una técnica de cuantización entera con corrección por canal que permite multiplicaciones matriciales rápidas en CPU manteniendo una calidad de traducción aceptable.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste fino, RLHF o DPO. El autor indica explícitamente que se trata de una copia sin modificaciones de los modelos originales de Mozilla; los detalles de entrenamiento deben consultarse en la documentación del proyecto Firefox Translations.

## Capacidades

- Traducción automática de texto entre alemán e inglés en ambas direcciones.
- Segmentación de subpalabras mediante SentencePiece y modelo léxico propio del motor Bergamot.
- Ejecución en CPU y en el navegador, sin requisitos de GPU.
- Verificación de integridad de los ficheros mediante sumas SHA-256 publicadas en la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo conversacional: no mantiene contexto multi-turno ni ventana de contexto extensa.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada estrictamente al par de-en.

## Casos de uso

- Traducción integrada en aplicaciones de escritorio: los programas de Epic Art and Sound pueden cargar los ficheros desde una URL fija y verificar su SHA-256 antes de usarlos, garantizando que no se ha alterado el binario.
- Traducción en el navegador: al estar basada en el motor Bergamot, la pareja de modelos puede ejecutarse del lado del cliente sin enviar texto a un servidor, útil para privacidad en contenidos de-de/en.
- Traducción de documentación técnica: para convertir manuales o notas de producto del alemán al inglés con un modelo ligero que corre en CPU.
- Preprocesado de corpus: uso como primer paso de traducción en pipelines de datos multilingües donde se prioriza el coste computacional bajo frente a la calidad máxima.
- Aplicaciones offline o con conectividad limitada: el tamaño reducido del paquete (0,1 GB) permite distribuirlo junto con la aplicación y traducir sin conexión.
- Prototipado de sistemas de traducción locales: sirve como referencia reproducible para comparar el rendimiento del motor Bergamot frente a otros enfoques en tareas de-de/en.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el motor Bergamot está diseñado para ejecutarse en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- ¿Cabe en GPU de consumo? No aplica, pero el paquete completo ocupa aproximadamente 0,1 GB en disco, por lo que cabe en cualquier dispositivo.
- Opciones de despliegue: motor Bergamot (runtime de Firefox Translations); los ficheros `.bin`, `.s2t.bin` y `.spm` no son compatibles directamente con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Bergamot-de-en (este) | de, en | Transformer seq2seq intgemm (Bergamot) | no disponible | MPL-2.0 | `.bin`, `.s2t.bin`, `.spm` |
| Helsinki-NLP/opus-mt-de-en | de, en | Transformer seq2seq (Marian) | no disponible | CC-BY-4.0 | safetensors, PyTorch |
| Facebook NLLB-200 (distilled) | 200 idiomas | Transformer encoder-decoder | 512 tokens | CC-BY-NC-4.0 | safetensors, PyTorch |
| Mozilla Firefox Translations (original) | múltiples pares | Transformer seq2seq intgemm | no disponible | MPL-2.0 | `.bin`, `.s2t.bin`, `.spm` |

La comparación con NLLB-200 es solo orientativa: NLLB cubre muchos más idiomas pero su licencia CC-BY-NC-4.0 restringe el uso comercial, mientras que Bergamot usa MPL-2.0. No se dispone de datos de calidad de traducción comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es una copia sin modificaciones de los modelos de Mozilla; el autor no ofrece soporte ni mantenimiento propios.
- No se han publicado métricas de calidad (BLEU, COMET u otras) en la información disponible.
- El par de idiomas está limitado a alemán e inglés; no traduce otros idiomas.
- No es un modelo conversacional ni mantiene contexto entre segmentos.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (términos técnicos, jurídicos o médicos) no cubiertos por el corpus original.
- La licencia MPL-2.0 permite uso comercial, pero obliga a publicar las modificaciones de los ficheros cubiertos si se redistribuyen; conviene revisar los términos antes de integrarlo en productos propietarios.
- Los ficheros no son compatibles con los runtimes de inferencia habituales para LLM (vLLM, llama.cpp, Ollama, TGI); requieren el motor Bergamot o un runtime compatible con intgemm.
- La verificación por SHA-256 es responsabilidad del integrador; la model card publica los hashes, pero no hay un mecanismo automático de validación incluido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/megathumbs/bergamot-de-en
- Proyecto Firefox Translations de Mozilla: https://github.com/mozilla/firefox-translations
- Motor Bergamot: https://browser.mt/
- Colección original `translations-models` (referenciada en la model card): no disponible como enlace directo en la información proporcionada.

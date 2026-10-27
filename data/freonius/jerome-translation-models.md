# Freonius/jerome-translation-models

## Resumen

`Freonius/jerome-translation-models` no es un modelo entrenado por su autor, sino un repositorio espejo (mirror) pensado para alojar copias sin modificar de algunos de los modelos de traducción de [Firefox Translations](https://github.com/mozilla/translations) de Mozilla. El destino es la aplicación de escritura Jerome, que los ejecuta en local mediante el crate `fxtranslate`, un runtime Rust para traducción offline. La arquitectura de los modelos originales es Marian, según los tags del repositorio, y se distribuyen en formato int8 para inferencia en CPU con intgemm.

En el momento de redactar esta ficha el repositorio está vacío: solo contiene la model card. El propio autor indica que «las direcciones a espejar todavía no se han elegido», de modo que no hay pesos, vocabularios ni listas léxicas descargables. Por tanto, no es posible evaluar el modelo en sí, sino únicamente el propósito del repositorio y las características conocidas del linaje Mozilla/Firefox Translations.

Su relevancia es indirecta pero concreta: documenta un patrón de distribución para aplicaciones que embeben traducción neuronal offline y necesitan fijar los artefactos por commit, tamaño y SHA-256 en lugar de depender de los servidores de Mozilla, dimensionados para el tráfico de Firefox. Cualquier evaluación de calidad, cobertura lingüística o rendimiento debe hacerse sobre los modelos originales de Mozilla, no sobre este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción neuronal, según los tags del repositorio) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8, en el formato intgemm de Mozilla (ficheros `*.intgemm.alphas.bin`) |
| Idiomas soportados | no disponible (la model card no declara un conjunto cerrado de direcciones; cita `en-it` como ejemplo y menciona vocabularios SentencePiece específicos para chino y japonés) |
| Licencia | MPL-2.0 |
| Formato de pesos | `*.intgemm.alphas.bin` comprimido con zstd, acompañado de vocabulario SentencePiece (dos ficheros para chino y japonés) y lexical shortlist, también comprimidos con zstd |

## Arquitectura y entrenamiento

Los modelos espejados son los de Firefox Translations, construidos sobre Marian, un framework de traducción neuronal basado en transformer encoder-decoder con atención. Mozilla entrena estos modelos por dirección lingüística (por ejemplo `en-it`), no como un modelo multilingüe único, y los publica cuantizados a int8 para ejecución en CPU mediante intgemm; ese es el motivo de que el artefacto principal sea un `.intgemm.alphas.bin` en lugar de pesos en punto flotante. Junto al modelo se distribuyen el vocabulario SentencePiece y una lexical shortlist, un mecanismo de restricción del léxico de salida típico de la pila Marian/Bergamot que reduce latencia y mejora la fluidez en traducción automática.

El entrenamiento, la composición del corpus y el pipeline completo son responsabilidad de Mozilla y se documentan en su repositorio público. Este repositorio no aporta información sobre número de tokens, composición del dataset ni fases de ajuste (RLHF/DPO); en traducción supervisada por dirección esos detalles dependen del pipeline de Mozilla y no están reflejados en la model card. La innovación técnica relevante aquí no es de modelado, sino de empaquetado y verificación: los ficheros se redistribuyen byte a byte tal como Firefox los descarga de Remote Settings (colección `translations-models-v2`), conservando los SHA-256 que registra Mozilla, y Jerome fija cada fichero por commit del repositorio, tamaño y hash.

## Capacidades

- Traducción automática neuronal por dirección lingüística, ejecutada en local sin conexión a red.
- Inferencia en CPU gracias a la cuantización int8 en formato intgemm, orientada a dispositivos de usuario final.
- Tokenización mediante SentencePiece, con vocabularios específicos para lenguas sin separación por espacios (chino, japonés).
- Uso de lexical shortlist para restringir el léxico de salida durante la decodificación.
- Distribución reproducible: artefactos comprimidos con zstd y verificables por SHA-256.
- Integración como biblioteca embebida a través del crate Rust `fxtranslate`.
- Generación de texto libre, razonamiento, código, matemáticas, visión, tool calling o modo «thinking»: no disponibles; no son capacidades de un modelo de traducción de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplica.

## Casos de uso

- Traducción integrada en un editor de textos: Jerome puede traducir párrafos o documentos completos dentro de la propia aplicación, sin enviar el texto a un servicio externo, usando los ficheros int8 servidos por este espejo.
- Escritura y corrección en una segunda lengua: el traductor funciona como apoyo para contrastar una frase propia con su versión en el idioma destino, con la ventaja de que el contenido no sale del equipo.
- Despliegue en entornos sin conectividad o con red restringida: al ejecutarse offline con `fxtranslate`, es adecuado para portátiles en campo, aulas, entornos sanitarios o redes air-gapped donde no se permite llamar a una API.
- Aplicaciones de escritorio con requisitos de privacidad: el texto del usuario no abandona la máquina, lo que simplifica el cumplimiento de RGPD al no existir cesión a terceros.
- Distribución reproducible en pipelines de build: el pinning por commit, tamaño y SHA-256 permite que un instalador verifique la integridad de los artefactos antes de empaquetarlos, evitando dependencias silenciosas de servidores de terceros.
- Traducción por lotes de documentación o corpus pequeños en local: automatizable desde Rust sin coste por token ni límites de cuota, siempre que las direcciones elegidas estén entre las espejadas.
- Base para experimentación en traducción de bajo recurso: al ser modelos por dirección y ligeros, sirven para comparar salidas con otros sistemas (OPUS-MT, NLLB) en un mismo conjunto de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (BLEU, chrF, COMET), latencia ni throughput, y el repositorio no contiene todavía pesos que pudieran evaluarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El formato intgemm está diseñado para ejecución en CPU, por lo que en el escenario previsto no se requiere GPU.
- GPU recomendadas: no aplica para el runtime `fxtranslate`; el artefacto distribuido es int8 para CPU. No hay datos sobre backend GPU.
- ¿Cabe en GPU de consumo? No disponible; la pregunta relevante es si cabe en CPU de consumo, y el tamaño concreto de cada modelo por dirección no está declarado en la información disponible.
- CPU: el formato intgemm de Mozilla aprovecha extensiones SIMD (AVX2/AVX-512 en x86, NEON en ARM); no se especifican requisitos mínimos en la model card.
- Opciones de despliegue: `fxtranslate` (crate Rust) es el runtime previsto. vLLM, TGI, llama.cpp u Ollama no son aplicables a este formato sin conversión previa, y no se documenta ninguna.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Freonius/jerome-translation-models (espejo Firefox Translations) | Marian, int8 intgemm | no disponible | no disponible | MPL-2.0 | intgemm + SentencePiece + lexical shortlist, vía `fxtranslate` |
| Mozilla Firefox Translations (origen) | Marian, int8 intgemm | no disponible en la información proporcionada | no disponible | MPL-2.0 | Mismos artefactos, servidos desde Remote Settings |
| OPUS-MT (Helsinki-NLP) | Marian | no disponible en la información proporcionada | no disponible | Mayoritariamente CC-BY-4.0 (varía por dirección) | safetensors/PyTorch, convertible a CTranslate2 |
| NLLB-200 (Meta) | Transformer denso y MoE | no disponible en la información proporcionada | no disponible | CC-BY-NC-4.0 | safetensors, requiere GPU para los tamaños grandes |

No se dispone de datos de rendimiento comparado para el modelo de este repositorio. La comparación relevante es de naturaleza operativa: frente a OPUS-MT y NLLB, la pila de Firefox Translations prioriza ejecución en CPU del usuario final y tamaño reducido por dirección, a costa de cubrir un conjunto limitado de pares de lenguas y de no ofrecer un modelo multilingüe único.

## Limitaciones y advertencias

- El repositorio está vacío: solo contiene la model card; no hay pesos, vocabularios ni shortlists descargables, y las direcciones a espejar no se han decidido.
- No se declara la lista de idiomas soportados, por lo que no puede verificarse la cobertura real de pares lingüísticos.
- Ausencia total de métricas de calidad publicadas en la información disponible; no debe asumirse un nivel de traducción concreto sin evaluar los modelos originales de Mozilla.
- La licencia MPL-2.0 permite uso comercial, pero impone obligaciones de copyleft a nivel de fichero sobre las modificaciones de los ficheros cubiertos; la redistribución debe conservar la licencia y el aviso de titularidad de Mozilla.
- Los modelos son obra de Mozilla y se redistribuyen sin cambios; cualquier incidencia de calidad debe reportarse contra el proyecto `mozilla/translations`, no contra este espejo.
- La ejecución depende de las extensiones SIMD soportadas por la CPU del usuario; en hardware antiguo el rendimiento puede degradarse de forma significativa (sin cifras disponibles).
- Riesgo de alucinación y de errores de traducción inherente a los sistemas neuronales, especialmente en frases largas, terminología especializada y lenguaje coloquial; no se documentan mecanismos de detección.
- No hay información sobre sesgos demográficos o de género gramatical en las direcciones que se espejarán.
- El pinning por commit, tamaño y SHA-256 exige que la aplicación gestione actualizaciones de forma explícita: un espejo desactualizado puede servir modelos obsoletos respecto a los de Mozilla.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Freonius/jerome-translation-models
- Proyecto Firefox Translations de Mozilla: https://github.com/mozilla/translations
- Texto de la licencia MPL-2.0: https://www.mozilla.org/en-US/MPL/2.0/
- Crate `fxtranslate` en crates.io: https://crates.io/crates/fxtranslate

# serzhserg98/marian-mt-int8

## Resumen

`serzhserg98/marian-mt-int8` es un repositorio de distribución que empaqueta, en un único artefacto de 2,6 GB, copias byte a byte de los modelos de traducción automática de Mozilla Firefox Translations (proyecto `mozilla/translations`), organizadas en una carpeta por par de idiomas y comprimidas con gzip. El autor, serzhserg98, no modifica los pesos: según la model card, «no changes besides compression». Incluye un `index.json` con el tamaño y el SHA-256 de cada fichero antes y después de la descompresión, lo que facilita la verificación de integridad.

El interés del repositorio es práctico más que científico: reunir en un solo punto de descarga los modelos Marian/Bergamot cuantizados a int8 que Firefox usa para traducir en local, de modo que puedan integrarse en aplicaciones de escritorio, extensiones o servicios sin depender de las descargas individuales del proyecto original. Se trata de modelos de traducción neuronal frase a frase, no de modelos generativos conversacionales: no hay chat, ni tool calling, ni razonamiento multi-paso.

La relevancia actual viene de la traducción en dispositivo (on-device): inferencia en CPU con pesos int8 y un footprint reducido, sin enviar texto a servidores externos. Ahora bien, la información publicada es muy escasa: no se detallan los pares de idiomas incluidos, ni el número de parámetros, ni resultados de calidad. La licencia es MPL 2.0, heredada de los modelos originales de Mozilla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian NMT (encoder-decoder transformer) según el stack de Firefox Translations / Bergamot; detalles de capas y dimensiones no disponibles |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; son modelos de traducción frase a frase, sin ventana de contexto conversacional |
| Tipos de cuantización | Int8 (los pesos originales de Firefox Translations ya se distribuyen cuantizados a int8; el repositorio solo añade compresión gzip) |
| Idiomas soportados | No disponible; el repositorio organiza los modelos por par de idiomas en carpetas independientes, pero el autor no enumera los pares |
| Licencia | MPL 2.0 |
| Formato de pesos | Artefactos binarios del runtime Bergamot/Marian comprimidos con gzip (no se distribuyen safetensors ni GGUF); metadatos de integridad en `index.json` |

## Arquitectura y entrenamiento

Los pesos proceden íntegramente de los modelos de Mozilla Firefox Translations, construidos sobre Marian NMT: una arquitectura encoder-decoder de tipo transformer con atención, entrenada para traducción automática neuronal supervisada por pares de idiomas. El proyecto de Mozilla añade el runtime Bergamot, derivado de Marian, orientado a inferencia eficiente en CPU y en WebAssembly dentro del navegador, con pesos cuantizados a int8 y uso intensivo de instrucciones SIMD. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de ajuste fino con RLHF o DPO; en traducción automática supervisada lo habitual es entrenamiento sobre corpus paralelos, pero el autor no aporta esta información.

La única intervención del autor del repositorio es el empaquetado: copia byte a byte de los ficheros originales, compresión gzip y generación de un índice con tamaños y hashes SHA-256 previos y posteriores a la descompresión. No hay reentrenamiento, destilación, poda ni recuantización documentada, lo que implica que las capacidades y limitaciones son exactamente las de los modelos de Mozilla en su versión int8. El valor técnico está en la trazabilidad (verificación por hash) y en la agregación de múltiples pares de idiomas en una sola descarga.

## Capacidades

- Traducción automática neuronal entre pares de idiomas concretos, en ambos sentidos según el modelo incluido en cada carpeta.
- Inferencia en CPU: los pesos int8 están pensados para ejecutarse sin GPU, con soporte de SIMD (AVX2, AVX-512, NEON según plataforma).
- Ejecución en navegador mediante WebAssembly a través del runtime Bergamot, lo que permite traducción completamente local en el cliente.
- Ejecución en servidor mediante bergamot-translator o el binario de Marian, sin dependencias de servicios en la nube.
- Verificación de integridad criptográfica de cada artefacto mediante SHA-256 en `index.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación libre de texto, visión ni audio.
- Capacidad multilingüe limitada a los pares de idiomas efectivamente incluidos en el repositorio; al no estar enumerados, debe comprobarse carpeta por carpeta tras la descarga.

## Casos de uso

- Traducción local en extensiones de navegador: los modelos int8 y el runtime Bergamot permiten traducir páginas web en WebAssembly sin enviar el contenido a un servidor, lo que encaja en escenarios de privacidad estricta.
- Aplicaciones de escritorio con traducción offline: integrar el binario de Marian o bergamot-translator para traducir documentos o interfaces sin conexión, útil en entornos air-gapped.
- Cumplimiento del RGPD en tratamiento de textos: al ejecutarse en infraestructura propia y sin llamadas a API externas, se evita la transferencia de datos personales a terceros.
- Pretraducción por lotes en pipelines de localización: traducir cadenas de recursos o documentación antes de la revisión humana, con coste marginal por token prácticamente nulo.
- Subtitulado y transcripción multilingüe: traducción de segmentos cortos con baja latencia en CPU, adecuada para flujos donde cada unidad es una frase.
- Servicios de traducción de alto volumen con requisitos de coste: al no requerir GPU, el coste por palabra depende solo de CPU y memoria, lo que permite escalar horizontalmente en instancias baratas.
- Distribución reproducible de modelos: el `index.json` con hashes permite a un equipo de plataforma verificar artefactos en CI antes de desplegarlos, actuando como espejo controlado de los modelos de Mozilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (BLEU, COMET, chrF), latencia ni throughput, y el autor no referencia evaluaciones propias. Cualquier cifra de calidad debe obtenerse de la documentación del proyecto `mozilla/translations` para la versión concreta del par de idiomas, no de este repositorio.

## Requisitos de hardware

- VRAM: no aplica; los modelos int8 de Bergamot están diseñados para inferencia en CPU. No se dispone de cifras de memoria residente por par de idiomas.
- GPU: no necesaria. No hay soporte documentado de despliegue en GPU para estos artefactos en la información proporcionada.
- CPU: se requiere soporte de SIMD para un rendimiento razonable (AVX2 o superior en x86-64, NEON en ARM). Sin cifras de latencia publicadas.
- Cabe en hardware de consumo: sí, es el objetivo de diseño del stack de Firefox Translations; el repositorio completo ocupa 2,6 GB comprimido, pero el espacio en disco tras descomprimir todos los pares es mayor y no está cuantificado.
- Opciones de despliegue: bergamot-translator (C++/WASM), el runtime de Firefox Translations, el binario `marian-decoder` de Marian NMT y bibliotecas de enlace para WASM en navegador. No hay soporte de vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de la familia transformer generativa con esos formatos.
- Latencia y throughput: no disponibles. Cualitativamente, el diseño int8 con SIMD busca latencias de decenas de milisegundos por frase en CPU de escritorio, pero esta cifra no está confirmada por el autor y debe medirse en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `serzhserg98/marian-mt-int8` | No disponible | Frase a frase | Binario Bergamot/Marian int8, gzip | MPL 2.0 | HuggingFace, 0 descargas, 0 likes |
| `mozilla/translations` (original) | No disponible por par | Frase a frase | Binario Bergamot int8 + código de entrenamiento | MPL 2.0 | GitHub de Mozilla, mantenido |
| OPUS-MT (Helsinki-NLP) | ~70-300 M por par (orientativo, no confirmado aquí) | Frase a frase | PyTorch/safetensors, fp32/fp16 | Mayoritariamente CC-BY 4.0 | HuggingFace, amplia adopción |
| NLLB-200 (Meta) | Hasta 54 000 M (variante densa de 54B); 600 M en la variante distilled | ~512 tokens | safetensors, fp16/int8 | CC-BY-NC 4.0 (no comercial) | HuggingFace |

La comparación relevante es con el repositorio original de Mozilla: este paquete no aporta mejoras de calidad, solo agregación y compresión. Frente a OPUS-MT, la diferencia práctica es el runtime (CPU/WASM frente a PyTorch) y la licencia (MPL 2.0 frente a CC-BY). Frente a NLLB-200, la diferencia es el tamaño y el régimen de licencia: NLLB cubre 200 idiomas pero su licencia restringe el uso comercial.

## Limitaciones y advertencias

- Solo traducción: no es un modelo de instrucciones; no admite chat, tool calling, agentes ni generación libre. Usarlo fuera de la traducción producirá resultados sin sentido.
- Idiomas no documentados: la model card no enumera los pares incluidos. Es imprescindible inspeccionar las carpetas tras la descarga antes de asumir cobertura para un idioma concreto.
- Sin métricas de calidad: no hay BLEU, COMET ni evaluaciones humanas publicadas en este repositorio; la calidad debe heredarse del proyecto de Mozilla para la versión exacta del modelo.
- Riesgo de mistraducción: en textos con ambigüedad, jerga, nombres propios o dominios especializados (legal, médico, técnico) los modelos NMT de este tamaño producen errores que requieren revisión humana.
- Sin contexto largo: al operar frase a frase, la coherencia terminológica y de estilo a lo largo de un documento se degrada; para documentos largos conviene glosario y postedición.
- Licencia MPL 2.0: es copyleft a nivel de fichero. Se puede usar en productos comerciales y combinarla con código propietario, pero las modificaciones de los ficheros cubiertos deben publicarse bajo MPL 2.0 y hay que conservar los avisos de licencia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin verificación por parte de terceros. La integridad solo puede comprobarse con los hashes del propio `index.json`, que no están firmados.
- Fechas anómalas: los metadatos indican creación y actualización el 2026-10-26, lo que conviene contrastar antes de citar el repositorio.
- Compresión gzip: añade un paso de descompresión y espacio en disco temporal; no es un formato cargable directamente por frameworks estándar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/serzhserg98/marian-mt-int8
- Proyecto original de Mozilla: https://github.com/mozilla/translations
- Runtime Bergamot: https://github.com/browsermt/bergamot-translator
- Marian NMT: https://github.com/marian-nmt/marian
- Página de Firefox Translations: https://www.mozilla.org/firefox/features/translate/
- OPUS-MT (alternativa comparable): https://huggingface.co/Helsinki-NLP
- NLLB-200 (alternativa comparable): https://huggingface.co/facebook/nllb-200-distilled-600M

# desert-ant-labs/ear

## Resumen

Ear es un modelo de identificación de idioma hablado (_spoken language identification_) desarrollado por Desert Ant Labs, un laboratorio europeo especializado en modelos de IA que se ejecutan íntegramente en el dispositivo. El modelo clasifica segmentos de audio de aproximadamente treinta segundos y es capaz de reconocer 99 idiomas distintos, desde lenguas mayoritarias como inglés, español o mandarín hasta otras menos comunes como hawaiano, yoruba o pastún.

Su relevancia radica en que está diseñado para funcionar sin conexión, con un peso total del repositorio de 0,1 GB, y se distribuye a través de SDKs nativos para iOS, macOS, Android y web. Esto permite integrar detección de idioma en aplicaciones móviles y de escritorio sin depender de servicios en la nube, lo que reduce latencia, costes y problemas de privacidad. No se han publicado detalles sobre la arquitectura interna ni el número de parámetros, pero su tamaño reducido y su orientación a dispositivos de bajo consumo sugieren un modelo compacto optimizado para inferencia en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 99 (af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, cs, cy, da, de, el, en, es, et, eu, fa, fi, fo, fr, gl, gu, ha, haw, he, hi, hr, ht, hu, hy, id, is, it, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, yi, yo, zh) |
| Licencia | Desert Ant Labs Source-Available License 1.0 (uso comercial gratuito hasta cierto umbral, licencia comercial a escala) |
| Formato de pesos | no disponible (se distribuye a traves de LiteRT, Core ML y WebAssembly) |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura del modelo, el conjunto de datos de entrenamiento ni el proceso de optimizacion. La model card indica unicamente que se trata de un clasificador de audio para identificacion de idioma hablado, sin especificar si emplea una red neuronal convolucional, un transformer de audio o una arquitectura hibrida. Tampoco se detalla el numero de horas de audio utilizadas, el balance de idiomas en el dataset ni si se aplicaron tecnicas de aumento de datos o aprendizaje por transferencia.

Dado que el modelo se distribuye en formatos compatibles con LiteRT (TensorFlow Lite), Core ML y WebAssembly, es probable que haya sido convertido a estas representaciones a partir de un framework de entrenamiento como PyTorch o TensorFlow, pero esta afirmacion es especulativa y no se encuentra respaldada por los datos disponibles.

## Capacidades

- Identificacion de idioma hablado en segmentos de audio de aproximadamente 30 segundos.
- Soporte para 99 idiomas, incluyendo lenguas con pocos recursos como hawaiano, pastún o yoruba.
- Ejecucion completamente offline, sin necesidad de conexion a internet.
- Compatibilidad multiplataforma: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.js.
- Integracion mediante SDKs nativos en Swift (paquete SPM), Kotlin (dependencia Gradle) y JavaScript/TypeScript (npm).
- Optimizado para dispositivos de bajo consumo, con un tamano de repositorio de 0,1 GB.
- No incluye capacidades de generacion de texto, tool calling, agentes ni procesamiento de vision; se limita exclusivamente a la clasificacion de audio.

## Casos de uso

- Enrutamiento de llamadas en centros de atencion al cliente: el modelo puede analizar los primeros segundos de una llamada entrante y derivarla al agente que habla el idioma correspondiente, reduciendo el tiempo de espera y mejorando la experiencia del usuario.
- Subtitulado automatico en tiempo real: en aplicaciones de transcripcion, Ear puede pre-detectar el idioma de un audio para seleccionar el modelo de reconocimiento de voz adecuado, evitando errores por confusión entre lenguas similares.
- Organizacion de archivos multimedia: los gestores de bibliotecas de audio o video pueden etiquetar automaticamente el idioma de cada grabacion, facilitando la busqueda y el filtrado por criterio lingüistico.
- Asistentes de voz en dispositivos moviles: Ear permite que un asistente active el modelo de comprension del lenguaje correcto segun el idioma detectado en la entrada de voz, sin necesidad de que el usuario seleccione manualmente su idioma.
- Analisis de contenido en redes sociales: plataformas que moderan audio o video generado por usuarios pueden clasificar el idioma de cada clip para aplicar politicas especificas por region o para dirigir el contenido a revisores con el perfil lingüistico adecuado.
- Aplicaciones educativas de idiomas: una app de aprendizaje puede detectar el idioma que el usuario esta practicando a partir de grabaciones de voz y ofrecer retroalimentacion o ejercicios adaptados al nivel y a la lengua objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos publicos sobre precision por idioma, comparacion con otros sistemas de identificacion de idioma ni metricas de latencia en diferentes dispositivos.

## Requisitos de hardware

- Al ser un modelo on-device, esta disenado para ejecutarse en CPU y GPU de dispositivos moviles y de escritorio sin necesidad de aceleradores dedicados.
- El tamano del repositorio (0,1 GB) sugiere que el modelo cabe en la memoria de cualquier smartphone moderno, aunque no se especifica el consumo de VRAM exacto.
- Plataformas soportadas: iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador (WebAssembly) y Node.js.
- Opciones de despliegue: SDKs oficiales de Desert Ant Labs (Swift, Kotlin, JavaScript) que integran el modelo con Core ML, LiteRT y WebAssembly.
- No se proporcionan datos de latencia ni throughput para diferentes dispositivos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de identificacion de idioma hablado. Existen alternativas academicas como VoxLingua107 o modelos basados en ECAPA-TDNN, pero no se conocen datos publicos que permitan contrastar rendimiento, tamano o licencia con Ear. Se recomienda consultar la documentacion oficial del modelo para futuras actualizaciones.

## Limitaciones y advertencias

- La licencia Desert Ant Labs Source-Available 1.0 permite uso gratuito para la mayoria de aplicaciones, pero exige una licencia comercial cuando el uso alcanza cierto volumen o escala. Es necesario revisar los terminos completos en https://license.desertant.com/1.0 antes de su integracion en productos comerciales.
- No se ha publicado informacion sobre sesgos en el entrenamiento. Es probable que el rendimiento varie entre idiomas, especialmente en aquellos con menos representacion en el dataset, aunque no hay datos que lo confirmen.
- El modelo esta pensado para audio de aproximadamente 30 segundos; segmentos mas cortos o con mucho ruido de fondo pueden degradar la precision.
- No se proporcionan garantias de precision ni certificaciones de calidad para entornos criticos.
- Al ser un modelo de clasificacion, puede confundir idiomas con similitud fonetica (por ejemplo, espanol y portugues, o sueco y noruego), especialmente en habla no nativa o con acentos marcados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/ear
- Repositorio de SDKs y documentacion: https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentacion especifica del modelo: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/ear.md
- Sitio web de Desert Ant Labs: https://desertant.com/
- Organizacion en Hugging Face: https://huggingface.co/desert-ant-labs
- Licencia: https://license.desertant.com/1.0

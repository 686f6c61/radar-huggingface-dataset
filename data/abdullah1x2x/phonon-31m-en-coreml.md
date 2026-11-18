# abdullah1x2x/phonon-31m-en-coreml

## Resumen

Phonon 31m English es un modelo de síntesis de voz (text-to-speech) de 31 millones de parámetros desarrollado por Gradium, distribuido bajo licencia Apache 2.0. Este repositorio concreto (`abdullah1x2x/phonon-31m-en-coreml`) no es el modelo original, sino un espejo del bundle Core ML de Gradium en el que todos los paquetes `.mlpackage` han sido precompilados a `.mlmodelc`. El objetivo es que las aplicaciones iOS puedan descargar el modelo fichero a fichero y cargarlo sin necesidad de compilarlo en el dispositivo, lo que reduce el tiempo de arranque y el consumo de recursos en el primer uso.

El modelo se apoya en la arquitectura de Pocket TTS de Kyutai y en el códec Mimi, e incluye 38 voces en inglés. Está pensado para inferencia totalmente local en iOS 18 o superior, aprovechando la Apple Neural Engine a través del runtime Core ML. El bundle lo consume el paquete `@pocketpalai/react-native-speech-phonon` de React Native.

Su relevancia actual radica en la combinación de tres factores: un tamaño muy reducido (31M de parámetros, repo de 0,1 GB), licencia permisiva para uso comercial y un formato de despliegue ya optimizado para el ecosistema Apple. Esto lo sitúa como una opción práctica para TTS on-device en aplicaciones móviles, sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai) con codec Mimi; empaquetado en Core ML |
| Parametros totales | 31 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (bundle Core ML precompilado; pesos sin modificar) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc` precompilado, derivado de `.mlpackage`), `host.safetensors`, `tokenizer.json`, `bundle.json` |

## Arquitectura y entrenamiento

El modelo original Phonon 31m de Gradium se construye sobre Pocket TTS de Kyutai, un sistema de síntesis de voz que emplea el códec neuronal Mimi para la representación y generación de audio. El bundle Core ML contiene un modelo de flujo ("flow") y el modelo Mimi, junto con un fichero `host.safetensors` que aloja los pesos del host, un `tokenizer.json` y un directorio `voices/` con 38 voces en inglés.

Este repositorio no aporta información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificación o atención. La única modificación respecto al original es la compilación con `xcrun coremlcompiler` mediante el flujo de trabajo `Phonon binaries`; los pesos no se han alterado. El bundle procede del asset `phonon-31m-en-coreml.zip` de la release `gradium-ai/xn-ptts v0.4.0`, verificado por sha256 contra el pin de `phonon.lock.json`, y el modelo fuente es `hf://gradium/phonon-31m-en@8acf8881a96315724c72ed3aad2a0900d1b230ba`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- 38 voces en inglés incluidas en el bundle (`voices/`).
- Inferencia totalmente on-device en iOS 18 o superior, con uso de la Apple Neural Engine.
- Carga sin compilación en el dispositivo gracias a los `.mlmodelc` precompilados.
- Descarga fichero a fichero con verificación de integridad mediante el manifiesto `phonon-31m-en-coreml.manifest.tsv` (path, tamaño y sha256).
- Integración con React Native a través de `@pocketpalai/react-native-speech-phonon`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones iOS: el bundle se descarga y se carga directamente en el dispositivo, de modo que la app puede narrar texto sin llamadas a servidores y sin coste por petición.
- Asistentes de accesibilidad: conversión de texto a voz local para usuarios con discapacidad visual, con 38 voces seleccionables y funcionamiento sin conexión.
- Aplicaciones de React Native: integración mediante `@pocketpalai/react-native-speech-phonon` para añadir TTS a una app multiplataforma con backend nativo en la Apple Neural Engine.
- Aprendizaje de idiomas: reproducción de frases en inglés con distintas voces para practicar pronunciación, aprovechando la inferencia local y la ausencia de latencia de red.
- Contenido educativo o de lectura: narración de artículos, libros o materiales formativos en apps iOS con requisitos de privacidad, ya que el texto no sale del dispositivo.
- Distribución de modelos en producción móvil: el manifiesto TSV con sha256 por fichero permite implementar descargas reanudables y verificación de integridad en el pipeline de despliegue de la app.
- Sistemas de navegación o avisos por voz: anuncios hablados generados localmente en apps de mapas o conducción, donde la latencia y la disponibilidad sin red son críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ejecutarse en Core ML sobre Apple Neural Engine, el consumo relevante es memoria unificada del dispositivo, no VRAM dedicada.
- GPU recomendadas: no aplica en el sentido tradicional; el destino es la Apple Neural Engine en dispositivos iOS 18 o superior.
- Compatibilidad con GPU de consumo: el bundle está orientado a hardware Apple (iPhone/iPad con Neural Engine), no a GPU NVIDIA o AMD de escritorio.
- Opciones de despliegue: runtime Core ML en iOS; paquete `@pocketpalai/react-native-speech-phonon`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 0,1 GB, lo que facilita la descarga en redes móviles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Phonon 31m English (este repo) | 31M | no disponible | en | Apache 2.0 | Core ML precompilado, iOS on-device |
| Phonon 40m (Gradium) | 40M | no disponible | no disponible | CC BY-NC 4.0 | no incluido en este repo; no comercial |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada. La comparación más directa es con los modelos Phonon 40m de Gradium, que quedan fuera de este repositorio y cuya licencia CC BY-NC 4.0 restringe el uso comercial.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe documentado.
- El modelo está diseñado exclusivamente para Core ML e iOS 18 o superior; no es portable a otros runtimes sin conversión adicional.
- No se han publicado datos de sesgos, tasas de alucinación ni evaluación de calidad de síntesis en la información disponible.
- El bundle es un espejo no oficial: la autoría y el mantenimiento corresponden a Gradium para el modelo y a `abdullah1x2x` para esta redistribución precompilada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia y las condiciones de las voces (`gradium/phonon-voices`) en el contexto de la aplicación final.
- Los modelos Phonon 40m de Gradium son CC BY-NC 4.0 y no están incluidos; no deben confundirse con este bundle de 31M.
- Al tratarse de un repositorio con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia comunitaria de uso en producción.
- La integridad de la descarga depende del manifiesto TSV con sha256; si la app no lo verifica, un fichero corrupto o manipulado podría cargarse sin detección.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abdullah1x2x/phonon-31m-en-coreml
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Voces: https://huggingface.co/gradium/phonon-voices
- Página del producto Phonon (Gradium): https://gradium.ai/phonon
- Release upstream `gradium-ai/xn-ptts v0.4.0`: https://github.com/gradium-ai/xn-ptts/releases/tag/v0.4.0
- Paquete React Native: https://github.com/a-ghorbani/react-native-speech/tree/main/packages/react-native-speech-phonon
- Workflow de precompilación `Phonon binaries`: https://github.com/a-ghorbani/react-native-speech/actions/runs/39689601871

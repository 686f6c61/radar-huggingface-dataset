# dynafire/kokoro-evovoice-voices

## Resumen

`kokoro-evovoice-voices` es una colección de voicepacks (perfiles de voz) para el motor de síntesis de voz Kokoro-82M, desarrollado originalmente por Hexgrad. El repositorio, publicado por el usuario dynafire, no contiene un modelo de lenguaje ni un motor TTS propio, sino tensores de voz preentrenados en formato `.pt` con dimensiones `[510,1,256]`, listos para cargarse directamente en la librería oficial `kokoro`. Su función es sustituir o mejorar las voces de fábrica del motor sin necesidad de reentrenar el modelo base.

Esta primera entrega incluye dos remasterizaciones de la voz estándar `af_nicole` (inglés americano femenino): una versión de alta calidad (`af_nicole_rmhq`) orientada a mejorar la proyección vocal y eliminar el carácter susurrado, con una puntuación UTMOS estimada superior a 4,4, y una versión de fidelidad (`af_nicole_rmfi`) que conserva el timbre suave e íntimo original con una escucha más fluida. Ambas se distribuyen como archivos independientes que se pueden combinar con cualquier instalación existente de Kokoro.

La relevancia del proyecto es acotada pero práctica: demuestra un flujo de trabajo de remasterización de voces sobre un motor TTS ligero (82M parámetros) y de código abierto, lo que permite a desarrolladores ajustar el timbre y la calidad percibida sin tocar los pesos del modelo base. El repositorio está en una fase inicial (0 descargas, 0 likes en el momento de la consulta) y el autor anuncia más voces y remasterizaciones futuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Voicepacks (tensores de voz) para el motor TTS Kokoro-82M; no es un modelo generativo independiente |
| Parametros totales | No disponible para los voicepacks; el motor base Kokoro-82M tiene 82M parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del motor Kokoro; los voicepacks son tensores de `[510,1,256]`) |
| Tipos de cuantizacion | No disponible (los voicepacks se distribuyen como `.pt` en precisión nativa) |
| Idiomas soportados | Inglés (`en`), concretamente inglés americano (`af_`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch), tensores de voz de forma `[510,1,256]` |

## Arquitectura y entrenamiento

Los archivos distribuidos no son un modelo transformer ni un sistema TTS completo, sino voicepacks: tensores de embedding de voz de forma `[510,1,256]` que el motor Kokoro-82M consume para condicionar la generación de audio. El motor subyacente, Kokoro-82M de Hexgrad, es un modelo TTS ligero de 82M parámetros que, según fuentes externas, alcanza velocidades cercanas a 100 veces el tiempo real. Los voicepacks se cargan con `torch.load(..., weights_only=True)` y se pasan como argumento `voice` a `KPipeline`.

No se especifica en la información disponible el proceso exacto de remasterización empleado por el autor (datos de entrenamiento, número de pasos, función de pérdida o si hubo fine-tuning del decoder). La model card únicamente indica que se trata de "remasterizaciones" de la voz de fábrica `af_nicole`, con dos objetivos distintos: mejora de calidad y proyección vocal (UTMOS ~4,4+) en `af_nicole_rmhq`, y preservación del timbre susurrado original en `af_nicole_rmfi`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés americano mediante el motor Kokoro-82M.
- Dos perfiles de voz femeninos: `af_nicole_rmhq` (mayor proyección y calidad percibida) y `af_nicole_rmfi` (timbre suave y susurrado preservado).
- Compatibilidad directa con la librería oficial `kokoro` (`KPipeline`) y con cualquier instalación existente del motor.
- Salida de audio a 24 kHz (según el ejemplo de la model card con `sf.write(..., 24000)`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un componente de voz para TTS.
- Capacidad multilingüe limitada al inglés en esta entrega (el ecosistema Kokoro dispone de más voces e idiomas, pero no forman parte de este repositorio).

## Casos de uso

- Síntesis de voz para asistentes y aplicaciones de lectura: cargar `af_nicole_rmhq.pt` en `KPipeline(lang_code='a')` para generar narraciones con mayor proyección y claridad que la voz de fábrica, adecuada para audiolibros o lectores de pantalla.
- Prototipado rápido de interfaces de voz: al ser un archivo `.pt` que se carga con `torch.load`, se puede integrar en un script de Python en minutos para validar un producto de voz antes de invertir en un modelo TTS mayor.
- Contenido de audio para vídeo y pódcast: la variante `af_nicole_rmfi` conserva el timbre íntimo y susurrado, útil para contenido ASMR, meditación o narración de tono cercano.
- Comparación A/B de calidad de voz: el repositorio incluye muestras de referencia (`samples/remasters/` y `samples/baseline/`) que permiten evaluar la mejora frente a la voz original antes de adoptarla.
- Pruebas de regresión en pipelines TTS: al ser voicepacks deterministas y ligeros, sirven para validar que una instalación de Kokoro funciona correctamente y que el audio generado cumple los umbrales de calidad (UTMOS) esperados.
- Investigación sobre remasterización de voces: el par de variantes (calidad frente a fidelidad) ofrece un caso de estudio para analizar cómo se modifica la percepción de una voz sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona únicamente una estimación subjetiva de UTMOS ~4,4+ para `af_nicole_rmhq`, sin tabla comparativa ni metodología detallada.

## Requisitos de hardware

- Los voicepacks son tensores de `[510,1,256]`, por lo que su huella en memoria es mínima (del orden de kilobytes a pocos megabytes); el requisito real lo impone el motor Kokoro-82M.
- VRAM estimada para el motor base: no disponible en la información proporcionada; con 82M parámetros, el modelo es apto para GPU de consumo, aunque no se especifican cifras exactas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del motor base (82M parámetros), pero sin datos oficiales en esta ficha.
- Opciones de despliegue: librería oficial `kokoro` (ejemplo de la model card con `KPipeline`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a este componente).
- Latencia y throughput: no disponibles para estos voicepacks; fuentes externas atribuyen al motor Kokoro-82M velocidades cercanas a 100x tiempo real, sin que esta cifra esté verificada en la documentación del repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dynafire/kokoro-evovoice-voices` | Voicepacks para Kokoro-82M | No aplica (tensores `[510,1,256]`) | Inglés (americano) | Apache-2.0 | Hugging Face, repo de 0,0 GB |
| Kokoro-82M (hexgrad) | Motor TTS completo | 82M | 8 idiomas, 54 voces según kokoroweb.app | No disponible en la información | Hugging Face |
| Voces de fábrica de Kokoro (p. ej. `af_nicole` original) | Voicepacks estándar | No aplica | Inglés (americano) | No disponible en la información | Incluidas en el motor |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autónomo: sin el motor Kokoro-82M instalado, los archivos `.pt` no generan audio por sí solos.
- Solo cubre inglés americano; no hay soporte multilingüe en esta entrega.
- Solo incluye dos variantes de una única voz (`af_nicole`); el autor anuncia más voces, pero no están disponibles.
- No se documenta el proceso de remasterización ni los datos empleados, lo que dificulta evaluar la reproducibilidad y la posible introducción de artefactos.
- La estimación UTMOS ~4,4+ es una métrica automática y subjetiva; no sustituye una evaluación perceptual humana.
- Repositorio en fase inicial (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en producción ni comunidad de validación.
- Licencia Apache-2.0, permisiva para uso comercial, pero conviene verificar la licencia del motor Kokoro-82M subyacente antes de desplegar en producción.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí pueden aparecer errores de pronunciación o prosodia propios del motor TTS.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dynafire/kokoro-evovoice-voices
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Kokoro TTS en TTS.ai: https://tts.ai/voices/kokoro/
- Lista de voces Kokoro en kokoroweb.app: https://kokoroweb.app/voices
